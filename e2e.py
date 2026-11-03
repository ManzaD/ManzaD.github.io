"""Prueba de extremo a extremo de LifeMOD en un navegador real (Playwright + Chrome).
Uso: servir la carpeta en http://127.0.0.1:8765 y ejecutar  python3 tests/e2e.py [carpeta_capturas]"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright

URL = 'http://127.0.0.1:8765/'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/lifemod-e2e/'
os.makedirs(OUT, exist_ok=True)
results = []; errors = []

def check(cond, msg):
    results.append((bool(cond), msg)); print(('  ✓ ' if cond else '  ✗ ') + msg)

async def S(pg, expr):
    return await pg.evaluate('() => { const S = LM.S, E = LME, D = LMD; return (' + expr + '); }')

async def close_overlays(pg, n=8):
    for _ in range(n):
        btn = await pg.query_selector('#overlay-root .ov [data-close], #overlay-root .ov [data-skip]')
        if not btn: break
        try: await btn.click(timeout=2000)
        except Exception: pass
        await pg.wait_for_timeout(350)

async def shot(pg, name, full=False):
    await pg.screenshot(path=OUT + name + '.png', full_page=full)

async def nav(pg, view):
    if await pg.is_visible(f'#nav [data-v={view}]'):
        await pg.click(f'#nav [data-v={view}]')
    else:
        await pg.click('#nav [data-act=more]'); await pg.wait_for_timeout(300)
        await pg.click(f'#overlay-root [data-v={view}]')
    await pg.wait_for_timeout(350)

async def complete_all_dailies(pg):
    while True:
        btn = await pg.query_selector('.hab:not(.done) [data-act=complete]')
        if not btn: break
        await btn.click(); await pg.wait_for_timeout(120)
        await close_overlays(pg)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True, locale='es-CO')
        await ctx.grant_permissions(['clipboard-read', 'clipboard-write'], origin=URL.rstrip('/'))
        pg = await ctx.new_page()
        pg.on('console', lambda m: errors.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
        pg.on('pageerror', lambda e: errors.append('PAGEERROR: ' + str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(800)

        print('\n▶ 1. Creación de personaje')
        await pg.click('[data-act=cStep][data-s="1"]')
        await pg.fill('#c-name', 'Sakura')
        await pg.click('[data-act=cClass][data-id=paladin]')
        await pg.click('[data-act=cStep][data-s="2"]')
        await pg.click('[data-act=cLook][data-k=hair][data-v="3"]'); await pg.click('[data-act=cLook][data-k=hairColor][data-v="5"]'); await pg.click('[data-act=cLook][data-k=eyes][data-v="4"]')
        await pg.click('[data-act=cStep][data-s="3"]'); await pg.wait_for_timeout(200)
        await pg.click('[data-act=cStart]'); await pg.wait_for_timeout(900)
        await shot(pg, '01-bienvenida')
        await close_overlays(pg)
        check(await S(pg, 'S.hero && S.hero.name === "Sakura" && S.hero.classId === "paladin"'), 'personaje creado con nombre y clase')
        check(await S(pg, 'S.hero.look.hair === 3 && S.hero.look.eyes === 4'), 'apariencia guardada')
        check(await S(pg, 'E.activeBad(S).length === 3'), 'malos hábitos iniciales activos')
        await shot(pg, '02-inicio')

        print('\n▶ 2. Hábitos, XP, oro, gemas, nivel')
        xp0, gold0 = await S(pg, '[S.stats.xp, S.hero.gold]')
        await pg.click('[data-act=login]'); await pg.wait_for_timeout(500); await close_overlays(pg)
        await complete_all_dailies(pg)
        await pg.wait_for_timeout(300)
        xp1, gold1, gems1, lvl1 = await S(pg, '[S.stats.xp, S.hero.gold, S.hero.gems, S.hero.level]')
        check(xp1 > xp0, f'XP ganada ({xp0}→{xp1})')
        check(gold1 > gold0, f'oro ganado ({gold0}→{gold1})')
        check(await S(pg, 'S.days[E.dayKey(E.now(S))].perf'), 'día perfecto conseguido desde la UI')
        check(lvl1 >= 2, f'subió de nivel jugando (nivel {lvl1})')
        check(await S(pg, 'Object.keys(S.ach).length >= 2'), 'logros desbloqueados')
        await shot(pg, '03-habitos-cumplidos', True)
        # deshacer
        await pg.evaluate("() => { const h = LM.S.habits.find(x => x.id === 'leer'); h.on = true; LM.save(); LM.render(); }")
        await pg.wait_for_timeout(200)
        n0 = await S(pg, 'S.stats.habits')
        await pg.click('.hab[data-hid=leer] [data-act=complete]'); await pg.wait_for_timeout(300); await close_overlays(pg)
        await pg.click('.toast [data-act=undo]'); await pg.wait_for_timeout(300)
        check(await S(pg, f'S.stats.habits === {n0}'), 'deshacer revierte el último hábito')

        print('\n▶ 3. Modo desarrollador y subida de nivel con animación')
        await nav(pg, 'settings')
        for _ in range(7): await pg.click('[data-act=devTap]')
        await pg.wait_for_timeout(200)
        check(await pg.is_visible('[data-act=dev][data-k=day]'), 'herramientas de prueba visibles')
        await pg.click('[data-act=dev][data-k=xp]'); await pg.wait_for_timeout(700)
        check(await pg.is_visible('.lvl-num'), 'animación de subida de nivel')
        await shot(pg, '04-nivel')
        await close_overlays(pg)
        for _ in range(5):
            await pg.click('[data-act=dev][data-k=xp]'); await pg.wait_for_timeout(250); await close_overlays(pg)
        lvl = await S(pg, 'S.hero.level')
        check(lvl >= 7, f'nivel {lvl}: desbloqueos alcanzados')
        check(await S(pg, 'S.hero.tickets.pet >= 3 && S.owned.titles.indexOf("aventurero") >= 0'), 'recompensa especial del nivel 5 entregada')

        print('\n▶ 4. Gacha con probabilidades y pity')
        await nav(pg, 'gacha')
        await shot(pg, '05-gacha')
        inv0 = await S(pg, 'Object.keys(S.inv).length')
        await pg.click('[data-act=pull][data-n="10"]'); await pg.wait_for_timeout(600)
        await shot(pg, '06-gacha-orbe')
        await pg.wait_for_timeout(1400)
        await pg.click('#overlay-root [data-skip]'); await pg.wait_for_timeout(1500)
        await shot(pg, '07-gacha-cartas')
        await close_overlays(pg)
        check(await S(pg, f'Object.keys(S.inv).length > {inv0}'), 'la tirada x10 añadió objetos al inventario')
        check(await S(pg, 'S.stats.pulls >= 10'), 'tiradas registradas')
        txt = await pg.inner_text('.pity')
        check('garantizado en' in txt, 'contador de pity visible: ' + txt.replace('\n', ' | '))
        await pg.click('[data-act=rates]'); await pg.wait_for_timeout(300)
        rates = await pg.inner_text('.rates')
        check('60%' in rates and '0.3%' in rates and '2.7%' in rates, 'probabilidades visibles en la app')
        await shot(pg, '08-probabilidades')
        await close_overlays(pg)
        await pg.click('[data-act=tab][data-t=pet]'); await pg.wait_for_timeout(300)
        await pg.click('[data-act=pull][data-n="1"]'); await pg.wait_for_timeout(2200); await close_overlays(pg)
        check(await S(pg, 'Object.keys(S.inv).some(id => D.ITEM[id] && D.ITEM[id].slot === "pet")'), 'banner de mascotas entrega una mascota')
        # pity forzado: 9 tiradas sin épico → la 10.ª debe ser épico+
        pity = await pg.evaluate("""() => { const S = LM.S; S.hero.gems = 99999; S.gacha.pity.std.e = 9; const r = LME.pull(S, 'std', 1, () => 0.01); LM.save(); return r.res[0].r; }""")
        check(pity >= 2, f'pity de 10 garantiza Épico+ (rareza {pity})')
        pity2 = await pg.evaluate("""() => { const S = LM.S; S.gacha.pity.std.l = 79; const r = LME.pull(S, 'std', 1, () => 0.01); LM.save(); return r.res[0].r; }""")
        check(pity2 >= 3, f'pity de 80 garantiza Legendario+ (rareza {pity2})')

        print('\n▶ 5. Equipo y mascotas')
        await nav(pg, 'inv')
        best = await pg.evaluate("""() => { const S = LM.S; const ids = Object.keys(S.inv).filter(id => LMD.ITEM[id] && LMD.ITEM[id].slot === 'weapon' && id !== S.hero.eq.weapon); return ids.sort((a,b) => LMD.ITEM[b].r - LMD.ITEM[a].r)[0] || null; }""")
        if not best:
            await pg.evaluate("() => { LM.S.inv.w_excalibur = {lvl:0,t:Date.now()}; LM.save(); LM.render(); }"); best = 'w_excalibur'
        mods0 = await S(pg, 'JSON.stringify(E.mods(S))')
        hero0 = await pg.inner_html('.stage .hero-wrap')
        await pg.click(f'.icard[data-id={best}]'); await pg.wait_for_timeout(300)
        await shot(pg, '09-objeto')
        await pg.click('#overlay-root [data-act=equip]'); await pg.wait_for_timeout(400)
        check(await S(pg, f'S.hero.eq.weapon === "{best}"'), f'arma equipada ({best})')
        check(await S(pg, 'JSON.stringify(E.mods(S))') != mods0, 'el arma cambia los modificadores de cálculo')
        check(await pg.inner_html('.stage .hero-wrap') != hero0, 'el arma se ve en el personaje')
        pet = await S(pg, 'Object.keys(S.inv).find(id => D.ITEM[id] && D.ITEM[id].slot === "pet")')
        await pg.click(f'.icard[data-id={pet}]'); await pg.wait_for_timeout(300)
        await pg.click('#overlay-root [data-act=equip]'); await pg.wait_for_timeout(400)
        check(await S(pg, f'S.hero.eq.pet === "{pet}"'), 'mascota equipada')
        check(await pg.is_visible('.stage .pet-wrap .pet-svg'), 'la mascota aparece junto al héroe')
        await shot(pg, '10-heroe', True)
        await nav(pg, 'home')
        check(await pg.is_visible('.stage .pet-wrap'), 'mascota visible en Inicio')

        print('\n▶ 6. Misiones de todos los tipos')
        await nav(pg, 'missions')
        claim = await pg.query_selector('[data-act=claim]')
        if claim:
            g0 = await S(pg, 'S.hero.gems + S.hero.dust + S.hero.tickets.std'); await claim.click(); await pg.wait_for_timeout(400); await close_overlays(pg)
            check(await S(pg, 'S.stats.dailyClaimed >= 1'), 'misión diaria reclamada')
        else:
            check(await S(pg, 'S.ms.daily.list.length === 3'), '3 misiones diarias generadas')
        await shot(pg, '11-misiones-diarias')
        await pg.click('[data-act=tab][data-t=weekly]'); await pg.wait_for_timeout(250)
        check(await S(pg, 'S.ms.weekly.list.length === 3'), 'misiones semanales generadas')
        await pg.click('[data-act=tab][data-t=adv]'); await pg.wait_for_timeout(250)
        check(await S(pg, 'S.ms.explore.list.length === 2 && !!S.ms.balance.m'), 'misiones de Exploración y Equilibrio generadas')
        await shot(pg, '12-aventura', True)
        man = await pg.query_selector('[data-act=manual]')
        if man:
            await man.click(); await pg.wait_for_timeout(300); await pg.click('[data-confirm-ok]'); await pg.wait_for_timeout(300)
            c = await pg.query_selector('.mission.done [data-act=claim]')
            if c: await c.click(); await pg.wait_for_timeout(400); await close_overlays(pg)
            check(await S(pg, 'S.stats.explore >= 1'), 'misión de Exploración completada y reclamada')
        await pg.click('[data-act=dev][data-k=event]') if await pg.query_selector('[data-act=dev][data-k=event]') else None
        await pg.evaluate("() => { LM.S.ms.event = null; LME.spawnEvent(LM.S, 'relampago', []); LM.save(); LM.render(); }")
        await nav(pg, 'missions'); await pg.click('[data-act=tab][data-t=adv]'); await pg.wait_for_timeout(250)
        check(await pg.is_visible('.event-banner'), 'evento sorpresa visible con temporizador')
        await pg.click('[data-act=tab][data-t=story]'); await pg.wait_for_timeout(250)
        await shot(pg, '13-historia')
        if await pg.is_enabled('[data-act=chapter]'):
            await pg.click('[data-act=chapter]'); await pg.wait_for_timeout(500)
            await shot(pg, '14-capitulo'); await close_overlays(pg)
        check(await S(pg, 'S.ms.story.ch >= 1 && !!S.inv.x_primerpaso'), 'capítulo 1 de la campaña completado (objeto exclusivo)')
        await pg.click('[data-act=tab][data-t=boss]'); await pg.wait_for_timeout(250)
        await pg.click('[data-act=bossStart]'); await pg.wait_for_timeout(300)
        check(await S(pg, '!!S.ms.boss.cur'), 'jefe iniciado')
        await shot(pg, '15-jefe')
        await pg.evaluate("() => { const S = LM.S; S.habits.forEach(h => { if (h.id === 'caminar') h.on = true; }); S.ms.boss.cur.hp = 10; LM.save(); LM.render(); }")
        await nav(pg, 'home')
        await pg.click('.hab[data-hid=caminar] [data-act=complete]'); await pg.wait_for_timeout(700)
        check(await pg.is_visible('text=¡JEFE DERROTADO!'), 'jefe derrotado con un hábito')
        await shot(pg, '16-jefe-derrotado'); await close_overlays(pg)
        check(await S(pg, 'S.ms.boss.won === 1'), 'contador de jefes')

        print('\n▶ 7. Tiendas')
        await nav(pg, 'shop')
        await pg.evaluate("() => { LM.S.hero.gold += 3000; LM.S.hero.hp = 40; LM.save(); LM.render(); }")
        i = await S(pg, 'S.shop.slots.findIndex(s => s.k === "pocion")')
        await pg.click(f'[data-act=buy][data-i="{i}"]'); await pg.wait_for_timeout(400)
        check(await S(pg, 'S.hero.hp >= 70'), 'poción comprada y usada')
        await shot(pg, '17-tienda')
        await pg.click('[data-act=tab][data-t=real]'); await pg.wait_for_timeout(250)
        await pg.click('[data-act=realForm]:not([data-id])'); await pg.wait_for_timeout(300)
        await pg.fill('#r-name', 'Pizza con amigos'); await pg.fill('#r-price', '700')
        await pg.click('[data-rsave]'); await pg.wait_for_timeout(300)
        check(await S(pg, 'S.real.some(r => r.n === "Pizza con amigos" && r.price === 700)'), 'recompensa real creada desde la UI')
        g = await S(pg, 'S.hero.gold')
        rid = await S(pg, 'S.real.find(r => r.n === "Pizza con amigos").id')
        await pg.click(f'[data-act=real][data-id={rid}]'); await pg.wait_for_timeout(300); await pg.click('[data-confirm-ok]'); await pg.wait_for_timeout(400)
        check(await S(pg, f'S.hero.gold === {g} - 700 && S.realHist.length === 1'), 'recompensa real canjeada (oro descontado, historial)')
        await shot(pg, '18-recompensas-reales')

        print('\n▶ 8. Gestión de hábitos')
        await nav(pg, 'habits')
        await pg.click('[data-act=habitForm][data-type=good]'); await pg.wait_for_timeout(300)
        await pg.fill('#h-name', 'Tocar guitarra')
        await pg.click('[data-h=a][data-v=car]'); await pg.click('[data-h=d][data-v=dificil]'); await pg.click('[data-h=f][data-v=weekly]'); await pg.click('[data-h=ic][data-v=music]')
        await shot(pg, '19-nuevo-habito')
        await pg.click('[data-hsave]'); await pg.wait_for_timeout(300)
        check(await S(pg, 'S.habits.some(h => h.n === "Tocar guitarra" && h.f === "weekly" && h.a === "car" && h.d === "dificil")'), 'hábito personalizado creado')
        hid = await S(pg, 'S.habits.find(h => h.n === "Tocar guitarra").id')
        await pg.click(f'[data-act=habitForm][data-id={hid}]'); await pg.wait_for_timeout(300)
        await pg.fill('#h-name', 'Tocar guitarra 20 min'); await pg.click('[data-hsave]'); await pg.wait_for_timeout(300)
        check(await S(pg, f'E.habit(S, "{hid}").n === "Tocar guitarra 20 min"'), 'hábito editado')
        await pg.click(f'[data-act=habitForm][data-id={hid}]'); await pg.wait_for_timeout(300)
        await pg.click('#overlay-root [data-act=habitDel]'); await pg.wait_for_timeout(300); await pg.click('[data-confirm-ok]'); await pg.wait_for_timeout(300)
        check(await S(pg, f'!E.habit(S, "{hid}")'), 'hábito borrado')

        print('\n▶ 9. Estadísticas y logros con datos reales')
        await nav(pg, 'stats'); await pg.wait_for_timeout(300)
        nbars = await pg.evaluate("() => document.querySelectorAll('.chart path[fill]').length")
        check(nbars > 0, f'gráficas de barras con datos ({nbars} barras)')
        check(await pg.is_visible('svg[aria-label="Gráfico radar de atributos"]'), 'gráfico radar de atributos')
        check(await pg.evaluate("() => document.querySelectorAll('.heat i.l1, .heat i.l2, .heat i.l3, .heat i.l4').length") > 0, 'mapa de calor con actividad')
        await shot(pg, '20-estadisticas', True)
        await nav(pg, 'ach'); await pg.wait_for_timeout(300)
        nach = await pg.evaluate("() => document.querySelectorAll('.ach.on').length")
        check(nach >= 3, f'logros desbloqueados visibles ({nach})')
        check(await pg.evaluate("() => document.querySelectorAll('.ach').length") >= 40, 'al menos 40 logros listados')
        await shot(pg, '21-logros', True)

        print('\n▶ 10. Persistencia y respaldo')
        snap = await S(pg, 'JSON.stringify({n: S.hero.name, l: S.hero.level, x: S.stats.xp, inv: Object.keys(S.inv).length})')
        await pg.reload(); await pg.wait_for_timeout(1000); await close_overlays(pg)
        check(await S(pg, 'JSON.stringify({n: S.hero.name, l: S.hero.level, x: S.stats.xp, inv: Object.keys(S.inv).length})') == snap, 'los datos persisten al cerrar y reabrir')
        await nav(pg, 'settings')
        await pg.click('[data-act=exportCopy]'); await pg.wait_for_timeout(400)
        clip = await pg.evaluate('navigator.clipboard.readText()')
        check(clip.startswith('{"app":"lifemod"') and len(clip) > 1000, f'respaldo exportado ({len(clip)} caracteres)')
        async with pg.expect_download() as dl:
            await pg.click('[data-act=exportFile]')
        d = await dl.value
        path = OUT + 'respaldo.json'; await d.save_as(path)
        data = json.load(open(path))
        check(data['app'] == 'lifemod' and data['hero']['name'] == 'Sakura', 'archivo de respaldo descargado y válido')
        data['hero']['name'] = 'Importada'; data['hero']['gold'] = 4242
        await pg.click('[data-act=importText]'); await pg.wait_for_timeout(300)
        await pg.fill('#imp-t', json.dumps(data)); await pg.click('[data-imp-ok]'); await pg.wait_for_timeout(300)
        await pg.click('[data-confirm-ok]'); await pg.wait_for_timeout(500)
        check(await S(pg, 'S.hero.name === "Importada" && S.hero.gold === 4242'), 'importar respaldo reemplaza los datos')
        await nav(pg, 'settings')
        await pg.set_input_files('#import-file', path); await pg.wait_for_timeout(400)
        await pg.click('[data-confirm-ok]'); await pg.wait_for_timeout(500)
        check(await S(pg, 'S.hero.name === "Sakura"'), 'importar desde archivo funciona')

        print('\n▶ 11. Daño, muerte, Caído, Ritual y resurrección')
        await nav(pg, 'home')
        hp0 = await S(pg, 'S.hero.hp')
        await pg.click('.bad >> nth=0'); await pg.wait_for_timeout(500)
        check(await S(pg, f'S.hero.hp < {hp0}'), 'mal hábito quita HP')
        await shot(pg, '22-dano')
        await pg.evaluate("() => { LM.S.hero.hp = 12; LM.save(); LM.render(); }")
        await pg.wait_for_timeout(200)
        check(await pg.is_visible('.low-hp-warn'), 'advertencia de HP bajo visible')
        await shot(pg, '23-hp-bajo')
        lvl_before = await S(pg, 'S.hero.level')
        for _ in range(4):
            if await S(pg, 'S.hero.status === "fallen"'): break
            await pg.click('.bad >> nth=0'); await pg.wait_for_timeout(500)
        check(await pg.is_visible('text=HAS CAÍDO'), 'pantalla de muerte')
        await shot(pg, '24-muerte')
        await close_overlays(pg)
        check(await S(pg, f'S.hero.status === "fallen" && S.hero.level === {lvl_before} - 1'), 'estado Caído y pierde 1 nivel')
        check(await pg.is_visible('.stage.fallen .tomb') and await pg.is_visible('.ritual'), 'Inicio cambia: tumba, ambiente oscuro y ritual visible')
        await shot(pg, '25-caido', True)
        await nav(pg, 'gacha')
        check(await pg.is_disabled('[data-act=pull][data-n="1"]'), 'Caído no puede invocar')
        await nav(pg, 'settings'); await pg.click('[data-act=dev][data-k=day]'); await pg.wait_for_timeout(400); await close_overlays(pg)
        for day in range(7):
            await nav(pg, 'home'); await complete_all_dailies(pg)
            if day == 2: await shot(pg, '26-ritual-progreso')
            await nav(pg, 'settings'); await pg.click('[data-act=dev][data-k=day]'); await pg.wait_for_timeout(500)
            if await pg.is_visible('text=¡HAS RESUCITADO!'): break
            await close_overlays(pg)
        check(await pg.is_visible('text=¡HAS RESUCITADO!'), 'Ritual de Resurrección completado')
        await shot(pg, '27-resurreccion'); await close_overlays(pg)
        check(await S(pg, 'S.hero.status === "alive" && S.owned.titles.indexOf("renacido") >= 0'), 'revive con título Renacido')

        print('\n▶ 12. Muerte permanente y Legado')
        await nav(pg, 'home')
        await pg.evaluate("() => { LM.S.hero.hp = 1; LM.save(); LM.render(); }")
        await pg.click('.bad >> nth=0'); await pg.wait_for_timeout(500); await close_overlays(pg)
        for _ in range(15):
            await nav(pg, 'settings') if await pg.is_visible('#nav') else None
            if not await pg.query_selector('[data-act=dev][data-k=day]'): break
            await pg.click('[data-act=dev][data-k=day]'); await pg.wait_for_timeout(300)
            if await pg.is_visible('text=MUERTE PERMANENTE'): break
            await close_overlays(pg)
        check(await pg.is_visible('text=MUERTE PERMANENTE'), 'muerte permanente a los 14 días')
        await shot(pg, '28-muerte-permanente')
        await close_overlays(pg)
        check(await S(pg, 'S.hero === null && S.legacy.heroes.length === 1 && S.legacy.xpBonus === 0.05'), 'se pierde el personaje y queda el Legado (+5% XP)')
        check(await S(pg, '!!S.inv.x_memorial_1 && Object.keys(S.ach).length > 5'), 'objeto conmemorativo y logros conservados')
        check(await pg.is_visible('text=Tu legado continúa'), 'la bienvenida muestra el Legado')
        await shot(pg, '29-legado')
        await pg.click('[data-act=cStep][data-s="1"]'); await pg.fill('#c-name', 'Rin'); await pg.click('[data-act=cStep][data-s="2"]'); await pg.click('[data-act=cStep][data-s="3"]'); await pg.click('[data-act=cStart]'); await pg.wait_for_timeout(700); await close_overlays(pg)
        check(await S(pg, 'S.hero.name === "Rin" && S.hero.eq.accessory === "x_memorial_1"'), 'nuevo héroe con la Lápida equipada')

        print('\n▶ 13. Español y escritorio')
        bad_words = ['Loading', 'Settings', 'Submit', 'Cancel', 'Level up', 'Inventory', 'Missions', 'undefined', 'NaN', '[object']
        texts = ''
        for v in ['home', 'missions', 'gacha', 'inv', 'habits', 'shop', 'stats', 'ach', 'settings']:
            await nav(pg, v); texts += await pg.inner_text('body')
        found = [w for w in bad_words if w in texts]
        check(not found, 'sin textos en inglés ni valores rotos ' + (str(found) if found else ''))
        await pg.set_viewport_size({'width': 1366, 'height': 860}); await nav(pg, 'home'); await pg.wait_for_timeout(400)
        await shot(pg, '30-escritorio')
        overflow = await pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1')
        await pg.set_viewport_size({'width': 360, 'height': 740})
        ov2 = []
        for v in ['home', 'missions', 'gacha', 'inv', 'habits', 'shop', 'stats', 'ach', 'settings']:
            await nav(pg, v)
            if await pg.evaluate('document.documentElement.scrollWidth > window.innerWidth + 1'): ov2.append(v)
        check(not overflow and not ov2, 'sin desbordamiento horizontal (360 px y escritorio) ' + str(ov2))

        print('\n▶ 14. PWA: service worker, instalación y modo sin conexión')
        await pg.set_viewport_size({'width': 390, 'height': 844})
        await pg.reload(); await pg.wait_for_timeout(1500)
        ctrl = await pg.evaluate('navigator.serviceWorker.ready.then(r => !!r.active)')
        check(ctrl, 'service worker activo')
        cdp = await ctx.new_cdp_session(pg)
        man = await cdp.send('Page.getAppManifest')
        check(not man.get('errors'), 'manifest sin errores')
        await pg.reload(); await pg.wait_for_timeout(1200)
        check(await pg.evaluate('!!navigator.serviceWorker.controller'), 'la página está controlada por el service worker')
        await ctx.set_offline(True)
        await pg.reload(); await pg.wait_for_timeout(1500)
        ok_off = await pg.evaluate('!!(window.LM && LM.S && LM.S.hero && LM.S.hero.name === "Rin")')
        check(ok_off, 'funciona sin conexión tras la primera carga (datos incluidos)')
        fonts = await pg.evaluate("document.fonts.check('16px \"Dela Gothic One\"')")
        check(fonts, 'fuentes disponibles sin conexión')
        await shot(pg, '31-offline')
        await ctx.set_offline(False)

        # instalabilidad: Chrome no la evalúa en contextos incógnito, se usa un perfil persistente
        import tempfile
        pctx = await p.chromium.launch_persistent_context(tempfile.mkdtemp(), executable_path='/usr/bin/google-chrome', viewport={'width': 390, 'height': 844})
        pp = pctx.pages[0] if pctx.pages else await pctx.new_page()
        await pp.goto(URL); await pp.wait_for_timeout(2500)
        await pp.evaluate('navigator.serviceWorker.ready')
        pc = await pctx.new_cdp_session(pp)
        inst = await pc.send('Page.getInstallabilityErrors')
        check(not inst.get('installabilityErrors'), 'instalable como PWA (sin errores de instalabilidad) ' + json.dumps(inst.get('installabilityErrors')))
        await pctx.close()

        real_errors = [e for e in errors if 'net::ERR_INTERNET_DISCONNECTED' not in e]
        check(not real_errors, 'sin errores en consola' + ('' if not real_errors else ': ' + ' || '.join(real_errors[:8])))
        await b.close()

    ok = sum(1 for r in results if r[0]); bad = [r[1] for r in results if not r[0]]
    print(f'\n{"✅" if not bad else "❌"} {ok}/{len(results)} comprobaciones correctas')
    for m in bad: print('   FALLÓ:', m)
    sys.exit(1 if bad else 0)

asyncio.run(main())
