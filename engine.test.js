/* Pruebas del motor de LifeMOD — ejecutar con: node tests/engine.test.js */
'use strict';
require('../js/data.js');
require('../js/engine.js');
const D = globalThis.LMD, E = globalThis.LME;

let pass = 0, fail = 0; const failures = [];
const ok = (cond, msg) => { if (cond) pass++; else { fail++; failures.push(msg); console.log('  ✗ ' + msg); } };
const eq = (a, b, msg) => ok(a === b, msg + ' (esperado ' + JSON.stringify(b) + ', obtenido ' + JSON.stringify(a) + ')');
const section = n => console.log('\n▶ ' + n);

let T = new Date(2026, 10, 2, 12, 0, 0).getTime();
E.clock = () => T;
const nextDay = (n = 1) => { T += n * 86400000; };
E.rng = E.seeded(42);

const mk = (cls = 'guerrero', habits) => {
  const S = E.newState();
  E.createHero(S, { name: 'Akira', classId: cls, habits: habits || ['ejercicio', 'leer', 'agua', 'dormir', 'redes', 'chatarra'] });
  return S;
};
const doAll = S => { E.dailies(S).forEach(h => { const dk = E.dayKey(E.now(S)); if (E.canComplete(S, h, dk)) E.complete(S, h.id); }); };

section('Fórmulas');
eq(E.xpToNext(1), 100, 'XP nivel 1→2');
eq(E.xpToNext(2), 282, 'XP nivel 2→3');
eq(E.xpToNext(10), 3162, 'XP nivel 10→11');
eq(E.streakMult(2), 1, 'racha 2 = x1');
eq(E.streakMult(3), 1.1, 'racha 3 = x1.1');
eq(E.streakMult(7), 1.25, 'racha 7 = x1.25');
eq(E.streakMult(30), 1.5, 'racha 30 = x1.5');
eq(E.addDays('2026-12-31', 1), '2027-01-01', 'cambio de año');
eq(E.weekKey('2026-11-08'), '2026-11-02', 'semana empieza lunes');

section('Creación de personaje');
{
  const S = mk();
  eq(S.hero.level, 1, 'nivel 1');
  eq(S.hero.hp, E.maxHp(S), 'HP lleno');
  eq(S.hero.tickets.std, 10, '10 tickets de bienvenida');
  eq(S.hero.eq.weapon, 'w_madera', 'arma inicial del guerrero');
  eq(E.activeGood(S).length, 4, '4 hábitos positivos activos');
  eq(E.activeBad(S).length, 2, '2 malos hábitos activos');
  eq(S.ms.daily.list.length, 3, '3 misiones diarias');
  ok(S.shop.slots.length >= 5, 'tienda generada');
}

section('Completar hábitos, XP, oro, nivel');
{
  const S = mk();
  E.rng = () => 0.99; // sin críticos
  const r = E.complete(S, 'ejercicio');
  ok(r.ok, 'completa hábito');
  const c = r.ev.find(e => e.type === 'complete');
  eq(c.xp, 31, 'XP = 25 base × (1 + 0.20 guerrero + 0.04 espada de madera)');
  eq(c.gold, 10, 'oro = 10');
  eq(S.hero.attrs.fue.xp, 31, 'XP al atributo Fuerza');
  ok(!E.complete(S, 'ejercicio').ok, 'no se puede completar dos veces el mismo día');
  E.complete(S, 'leer'); E.complete(S, 'agua');
  const r4 = E.complete(S, 'dormir');
  ok(S.days[E.dayKey(T)].perf, 'día perfecto detectado');
  ok(r4.ev.some(e => e.type === 'perfect'), 'evento de día perfecto');
  ok(S.ach.h1 && S.ach.pd1, 'logros Primer Paso y Día Perfecto');
  // subir de nivel
  const before = S.hero.tickets.std;
  const ev = []; E.addXp(S, 20000, 'fue', ev);
  ok(S.hero.level >= 5, 'sube varios niveles (' + S.hero.level + ')');
  ok(ev.some(e => e.type === 'levelup' && e.level === 5 && e.milestone), 'recompensa especial nivel 5');
  ok(S.hero.tickets.std >= before + 10 && S.hero.tickets.pet >= 3, 'tickets del hito de nivel 5');
  ok(S.owned.titles.indexOf('aventurero') >= 0, 'título Aventurero');
  ok(ev.some(e => e.type === 'levelup' && e.unlocks.length), 'desbloqueos anunciados');
  E.rng = E.seeded(7);
}

section('Rachas y multiplicadores');
{
  const S = mk('mago', ['leer', 'agua', 'dormir']);
  E.rng = () => 0.99;
  for (let i = 0; i < 30; i++) { doAll(S); nextDay(); }
  E.refresh(S);
  eq(E.habit(S, 'leer').st, 30, 'racha de 30 días');
  const r = E.complete(S, 'leer');
  eq(r.ev[0].mult, 1.5, 'multiplicador x1.5 a los 31 días');
  E.complete(S, 'agua'); E.complete(S, 'dormir');
  nextDay(2); E.refresh(S); // falla un día
  eq(E.habit(S, 'leer').st, 0, 'romper racha la reinicia');
  ok(S.hero.hp > 0, 'romper racha no causa daño');
  S.hero.shield = 1;
  doAll(S); nextDay(); doAll(S); nextDay(2); E.refresh(S);
  eq(E.habit(S, 'leer').st, 2, 'Amuleto de Racha protege la racha');
  eq(S.hero.shield, 0, 'amuleto consumido');
  E.rng = E.seeded(9);
}

section('Daño, defensa, advertencias');
{
  const S = mk('guerrero');
  const hp0 = S.hero.hp;
  const r = E.logBad(S, 'redes');
  eq(hp0 - S.hero.hp, 12, 'mal hábito Normal quita 12 HP');
  const P = mk('paladin');
  const hp1 = P.hero.hp; E.logBad(P, 'redes');
  eq(hp1 - P.hero.hp, 10, 'Paladín recibe 20% menos (12→10, con Disciplina 1)');
  S.hero.hp = 20;
  const r2 = E.logBad(S, 'redes');
  ok(r2.ev.some(e => e.type === 'lowhp'), 'advertencia de HP bajo');
}

section('Muerte, estado Caído y Ritual de Resurrección');
{
  const S = mk('guerrero', ['ejercicio', 'leer', 'agua', 'redes']);
  E.addXp(S, 300, 'fue', []);
  const lvl = S.hero.level;
  S.hero.hp = 5;
  const r = E.logBad(S, 'redes');
  ok(r.ev.some(e => e.type === 'death'), 'muere al llegar a 0 HP');
  eq(S.hero.status, 'fallen', 'estado Caído');
  eq(S.hero.level, lvl - 1, 'pierde un nivel');
  const g0 = S.hero.gold, x0 = S.hero.xp;
  E.complete(S, 'ejercicio');
  eq(S.hero.gold, g0, 'Caído no gana oro');
  eq(S.hero.xp, x0, 'Caído no gana XP');
  ok(!E.pull(S, 'std', 1).ok, 'Caído no puede invocar');
  ok(!E.claimLogin(S).ok, 'Caído no recibe bono diario');
  nextDay(); E.refresh(S);
  // 3 días buenos y uno roto
  for (let i = 0; i < 3; i++) { doAll(S); nextDay(); E.refresh(S); }
  eq(S.hero.fallen.progress, 3, 'ritual avanza 3/7');
  doAll(S); E.logBad(S, 'redes');
  eq(S.hero.fallen.progress, 0, 'un mal hábito reinicia el ritual');
  nextDay(); E.refresh(S);
  for (let i = 0; i < 7; i++) { doAll(S); nextDay(); E.refresh(S); }
  eq(S.hero.status, 'alive', 'revive tras 7 días perfectos y limpios');
  eq(S.hero.hp, Math.round(E.maxHp(S) * 0.5), 'revive con 50% de HP');
  ok(S.owned.titles.indexOf('renacido') >= 0 && S.ach.revive, 'título Renacido y logro El Regreso');
}

section('Fénix acorta el ritual');
{
  const S = mk('guerrero', ['ejercicio', 'leer', 'agua', 'redes']);
  S.inv.p_fenix = { lvl: 0, t: T }; E.equip(S, 'p_fenix');
  S.hero.hp = 1; E.logBad(S, 'redes');
  eq(E.ritualNeed(S), 5, 'ritual de 5 días con Fénix');
  nextDay(); E.refresh(S);
  for (let i = 0; i < 5; i++) { doAll(S); nextDay(); E.refresh(S); }
  eq(S.hero.status, 'alive', 'revive en 5 días con Fénix');
}

section('Muerte permanente y Legado');
{
  const S = mk('bardo', ['llamar', 'agua', 'leer', 'redes']);
  E.complete(S, 'llamar');
  S.inv.w_katana = { lvl: 2, t: T };
  const achBefore = Object.keys(S.ach).length;
  S.hero.hp = 1; E.logBad(S, 'redes');
  nextDay(15); const ev = E.refresh(S);
  ok(ev.some(e => e.type === 'permadeath'), 'muerte permanente a los 14 días');
  eq(S.hero, null, 'personaje perdido');
  eq(S.legacy.heroes.length, 1, 'héroe registrado en el Legado');
  eq(S.legacy.xpBonus, 0.05, 'bonus de XP del Legado +5%');
  ok(!S.inv.w_katana, 'objetos perdidos');
  ok(S.inv.x_memorial_1 && S.inv.x_memorial_1.name === 'Lápida de Akira', 'objeto conmemorativo con nombre');
  ok(Object.keys(S.ach).length >= achBefore && S.ach.perma, 'logros conservados + logro de muerte permanente');
  ok(S.pending && S.pending.length, 'recompensa del logro queda pendiente para el próximo héroe');
  E.createHero(S, { name: 'Rin', classId: 'guerrero', habits: ['ejercicio', 'agua', 'leer'] });
  eq(S.hero.eq.accessory, 'x_memorial_1', 'lápida equipada en el nuevo héroe');
  E.rng = () => 0.99;
  const r = E.complete(S, 'ejercicio');
  // 25 × (1 + 0.2 guerrero + 0.04 espada + 0.05 legado + 0.03 lápida) = 33
  eq(r.ev[0].xp, 33, 'bonus de Legado y lápida aplicados a la XP');
  E.rng = E.seeded(11);
}

section('Gacha: probabilidades base (1.000.000 tiradas sin pity)');
{
  const rng = E.seeded(2026), N = 1000000, cnt = [0, 0, 0, 0, 0];
  for (let i = 0; i < N; i++) cnt[E.rollRarity(rng, 0)]++;
  const exp = [60, 28, 9, 2.7, 0.3];
  cnt.forEach((c, i) => {
    const pct = c / N * 100;
    console.log('    ' + D.RARITY[i].n.padEnd(11) + pct.toFixed(3) + '% (esperado ' + exp[i] + '%)');
    ok(Math.abs(pct - exp[i]) < Math.max(0.05, exp[i] * 0.02), 'probabilidad ' + D.RARITY[i].n);
  });
}

section('Gacha: pity con 2.000.000 tiradas reales');
{
  const S = mk();
  S.hero.gems = 1e12;
  const rng = E.seeded(777), N = 2000000, cnt = [0, 0, 0, 0, 0];
  let sinceE = 0, sinceL = 0, maxE = 0, maxL = 0, featLeg = 0, offLeg = 0, lostThenWon = true, lastLost = false;
  ['std', 'feat'].forEach(b => {
    S.gacha.pity[b] = { e: 0, l: 0, g: false };
    sinceE = sinceL = 0;
    const F = E.featured(S);
    for (let i = 0; i < N / 2; i++) {
      const r = E.pullOne(S, b, rng);
      cnt[r.r]++;
      sinceE++; sinceL++;
      if (r.r >= 2) { maxE = Math.max(maxE, sinceE); sinceE = 0; }
      if (r.r >= 3) { maxL = Math.max(maxL, sinceL); sinceL = 0; }
      if (b === 'feat' && r.r === 3) {
        const isF = r.id === F.leg;
        if (isF) featLeg++; else offLeg++;
        if (lastLost && !isF) lostThenWon = false;
        lastLost = !isF;
      }
    }
  });
  ok(maxE <= 10, 'nunca más de 10 tiradas sin Épico+ (máx. ' + maxE + ')');
  ok(maxL <= 80, 'nunca más de 80 tiradas sin Legendario+ (máx. ' + maxL + ')');
  ok(lostThenWon, 'tras perder el 50/50, el siguiente Legendario es el destacado');
  const pf = featLeg / (featLeg + offLeg);
  ok(pf > 0.6 && pf < 0.72, 'proporción destacada ≈ 66% con garantía (' + (pf * 100).toFixed(1) + '%)');
  console.log('    Tasas consolidadas con pity:');
  cnt.forEach((c, i) => console.log('    ' + D.RARITY[i].n.padEnd(11) + (c / N * 100).toFixed(3) + '%'));
  globalThis.__consolidated = cnt.map(c => c / N * 100);
}

section('Gacha: costo, tickets, duplicados');
{
  const S = mk();
  D.ACHIEVEMENTS.forEach(a => { S.ach[a.id] = 1; });
  S.hero.gems = 500; S.hero.tickets.std = 3;
  const c = E.pullCost(S, 'std', 10);
  eq(c.tickets, 3, 'usa primero los tickets');
  eq(c.gems, 350, 'el resto cuesta 50 gemas c/u');
  const r = E.pull(S, 'std', 10);
  ok(r.ok && r.res.length === 10, 'tirada x10');
  eq(S.hero.gems, 150, 'gemas descontadas');
  ok(r.res.some(x => x.r >= 2), 'x10 incluye al menos un Épico+');
  ok(!E.pull(S, 'std', 10).ok, 'error con gemas insuficientes');
  S.hero.gems = 1e6;
  const d0 = S.hero.dust;
  E.pull(S, 'std', 10); E.pull(S, 'std', 10); E.pull(S, 'std', 10); E.pull(S, 'std', 10);
  ok(S.hero.dust > d0, 'duplicados se convierten en polvo (' + (S.hero.dust - d0) + ')');
  ok(!E.pull(S, 'pet', 1).ok, 'banner de mascotas bloqueado antes del nivel 5');
  E.addXp(S, 2000, null, []);
  const rp = E.pull(S, 'pet', 1);
  ok(rp.ok && D.ITEM[rp.res[0].id].slot === 'pet', 'banner de mascotas da mascotas');
  S.hero.tickets.gold = 1;
  const g = E.openSpecial(S, 'gold_t');
  eq(g.res[0].r, 3, 'Ticket Dorado da un Legendario');
}

section('Misiones de todos los tipos');
{
  const S = mk('guerrero', ['ejercicio', 'caminar', 'leer', 'estudiar', 'agua', 'dormir', 'llamar', 'temprano', 'redes']);
  E.rng = E.seeded(5);
  // diarias
  const d = S.ms.daily.list;
  ['ejercicio', 'caminar', 'leer', 'estudiar', 'agua', 'dormir', 'llamar', 'temprano'].forEach(id => E.complete(S, id));
  if (d.some(m => m.m === 'pull')) E.pull(S, 'std', 1);
  d.forEach(m => { if (!m.done && m.m === 'gold') { S.hero.gold += 0; } });
  const doneD = d.filter(m => m.done);
  ok(doneD.length >= 2, 'misiones diarias avanzan y se completan (' + doneD.length + '/3: ' + d.map(m => m.t + ' ' + m.p + '/' + m.n).join(' | ') + ')');
  const gems0 = S.hero.gems;
  doneD.forEach(m => E.claimMission(S, m.id));
  ok(S.hero.gems >= gems0 || S.hero.dust > 0 || S.hero.tickets.std > 0, 'reclamar entrega recompensas');
  // forzar resto y cofre
  d.forEach(m => { if (!m.done) { m.p = m.n; m.done = true; E.claimMission(S, m.id); } });
  ok(E.chestReady(S, 'daily'), 'cofre diario disponible');
  ok(E.claimChest(S, 'daily').ok, 'cofre diario reclamado');
  // subir a nivel 7 para desbloquear todo
  E.addXp(S, 6000, 'fue', []);
  nextDay(); E.refresh(S);
  ok(S.hero.level >= 7, 'nivel ' + S.hero.level);
  eq(S.ms.weekly.list.length, 3, 'misiones semanales generadas');
  eq(S.ms.explore.list.length, 2, '2 misiones de Exploración');
  ok(S.ms.balance.m && S.ms.balance.m.f.attr === E.attrRank(S)[0], 'misión de Equilibrio apunta al atributo más bajo');
  ok(S.ms.firstEvent, 'evento sorpresa generado al desbloquearse');
  // exploración manual
  const ex = S.ms.explore.list.find(m => m.m === 'manual') || S.ms.explore.list[0];
  if (ex.m === 'manual') { ok(E.manualMission(S, ex.id).ok, 'exploración marcada como hecha'); }
  else {
    const r = E.saveHabit(S, { n: 'Nuevo hábito', a: ex.f.attr, d: 'facil', f: 'daily' });
    T += 1000; E.complete(S, r.id); nextDay(); E.refresh(S); E.complete(S, r.id);
    ok(ex.done, 'exploración: crear y cumplir un hábito nuevo');
  }
  const attrXp0 = S.hero.attrs[ex.f.attr].xp + S.hero.attrs[ex.f.attr].lvl * 1e6;
  ok(E.claimMission(S, ex.id).ok, 'exploración reclamada');
  ok(S.hero.attrs[ex.f.attr].xp + S.hero.attrs[ex.f.attr].lvl * 1e6 > attrXp0, 'exploración da XP al atributo descuidado');
  // equilibrio
  const bm = S.ms.balance.m, attr = bm.f.attr;
  const hb = E.saveHabit(S, { n: 'Equilibrar', a: attr, d: 'epico', f: 'daily' });
  for (let i = 0; i < 10 && !bm.done; i++) { if (E.canComplete(S, E.habit(S, hb.id), E.dayKey(E.now(S)))) E.complete(S, hb.id); nextDay(); E.refresh(S); }
  ok(bm.done && E.claimMission(S, bm.id).ok, 'misión de Equilibrio completada y reclamada');
  // semanal
  const w = S.ms.weekly.list[0]; w.p = w.n - 1;
  if (w.m === 'good' || w.m === 'xp' || w.m === 'gold' || w.m === 'boss_dmg') { E.complete(S, 'ejercicio'); }
  w.p = w.n; w.done = true;
  ok(E.claimMission(S, w.id).ok, 'misión semanal reclamada');
  // evento
  S.ms.event = null; E.spawnEvent(S, 'relampago', []);
  const em = S.ms.event.m;
  ['ejercicio', 'caminar', 'leer', 'estudiar'].forEach(id => E.complete(S, id));
  ok(em.done, 'desafío de evento completado con hábitos');
  const t0 = S.hero.tickets.std; E.claimMission(S, em.id);
  eq(S.hero.tickets.std, t0 + 1, 'evento entrega ticket');
  S.ms.event = null; E.spawnEvent(S, 'luna', []);
  E.rng = () => 0.99;
  nextDay(); E.refresh(S); E.spawnEvent(S, 'luna', []);
  const base = E.complete(S, 'caminar').ev[0].xp;
  ok(base > 15 * 1.2 * 1.4, 'buff de evento aumenta la XP de Fuerza (' + base + ')');
  E.rng = E.seeded(3);
  // historia
  S.ms.story = { ch: 0, base: { habits: 0, dailyClaimed: 0, perfectDays: 0, cleanDays: 0, balance: 0, explore: 0 } };
  const st = E.storyState(S);
  ok(st.ready, 'capítulo 1 listo');
  const rc = E.claimChapter(S);
  ok(rc.ok && S.inv.x_primerpaso, 'capítulo 1 entrega objeto exclusivo de misión');
  eq(S.ms.story.ch, 1, 'avanza al capítulo 2');
  ok(!D.ITEMS.filter(i => i.src === 'gacha').some(i => i.id === 'x_primerpaso'), 'objeto exclusivo no está en el gacha');
}

section('Jefes');
{
  const S = mk('guerrero', ['ejercicio', 'caminar', 'leer', 'agua', 'redes']);
  ok(!E.startBoss(S).ok, 'jefes bloqueados antes del nivel 6');
  E.addXp(S, 3000, 'fue', []);
  ok(S.hero.level >= 6, 'nivel 6');
  const r = E.startBoss(S);
  ok(r.ok && S.ms.boss.cur, 'jefe iniciado');
  const b = S.ms.boss.cur, hp0 = b.hp;
  E.complete(S, 'ejercicio');
  ok(b.hp < hp0, 'hábitos dañan al jefe');
  const hp1 = b.hp; E.logBad(S, 'redes');
  ok(b.hp > hp1, 'malos hábitos curan al jefe');
  b.hp = 5; E.complete(S, 'caminar');
  eq(S.ms.boss.won, 1, 'jefe derrotado');
  ok(S.ach.b1, 'logro Primer Guardián');
  ok(!E.startBoss(S).ok, 'siguiente jefe aparece mañana');
  nextDay(); E.refresh(S);
  ok(E.startBoss(S).ok, 'segundo jefe disponible al día siguiente');
  nextDay(6); const ev = E.refresh(S);
  ok(ev.some(e => e.type === 'bossescape'), 'el jefe escapa si se acaba el tiempo');
  eq(S.ms.boss.idx, 1, 'se puede reintentar el mismo jefe');
}

section('Tiendas');
{
  const S = mk();
  E.addXp(S, 400, null, []);
  S.hero.gold = 5000; S.hero.hp = 40;
  const i = S.shop.slots.findIndex(s => s.k === 'pocion');
  const r = E.buyShop(S, i);
  ok(r.ok && S.hero.hp === 70, 'poción cura 30 HP');
  eq(S.hero.gold, 5000 - 120, 'oro descontado');
  E.buyShop(S, i); E.buyShop(S, i);
  ok(!E.buyShop(S, i).ok, 'límite diario de pociones');
  const it = S.shop.slots.findIndex(s => s.k === 'item');
  if (it >= 0) { const id = S.shop.slots[it].id; delete S.inv[id]; ok(E.buyShop(S, it).ok && S.inv[id], 'compra de equipo en la tienda'); }
  nextDay(); E.refresh(S);
  eq(S.shop.slots[0].sold, 0, 'rotación diaria de la tienda');
  // recompensas reales
  const g = S.hero.gold;
  ok(E.buyReal(S, 'r1').ok, 'canjear recompensa real');
  eq(S.hero.gold, g - 300, 'postre cuesta 300 de oro');
  eq(S.realHist.length, 1, 'historial de canjes');
  E.saveReal(S, { n: 'Masaje', price: 3000, ic: 'gift' });
  ok(S.real.some(x => x.n === 'Masaje'), 'crear recompensa real');
  E.saveReal(S, { id: 'r0', n: '2 episodios', price: 380 });
  eq(S.real.find(x => x.id === 'r0').price, 380, 'editar recompensa real');
  E.delReal(S, 'r0'); ok(!S.real.find(x => x.id === 'r0'), 'borrar recompensa real');
  S.hero.gold = 10; ok(!E.buyReal(S, 'r1').ok, 'oro insuficiente');
  // polvo
  S.hero.dust = 200; ok(E.buyDust(S, 'd_ticket').ok, 'canje de polvo por ticket');
}

section('Equipo y mascotas modifican cálculos');
{
  const S = mk('guerrero');
  E.rng = () => 0.99;
  S.inv.w_excalibur = { lvl: 0, t: T }; E.equip(S, 'w_excalibur');
  const xp = E.complete(S, 'ejercicio').ev[0].xp;
  eq(xp, Math.round(25 * (1 + 0.2 + 0.15 + 0.05)), 'Excalibur +15% Fuerza +5% todo');
  S.inv.w_excalibur.lvl = 5;
  const m = E.mods(S);
  ok(Math.abs(m.xp.fue - (0.2 + 0.15 * 2)) < 1e-9, 'mejora +5 duplica los bonus');
  S.inv.r_egida = { lvl: 0, t: T }; E.equip(S, 'r_egida');
  const hp = S.hero.hp; E.logBad(S, 'redes');
  eq(hp - S.hero.hp, Math.round(12 * 0.75), 'Égida −25% de daño');
  S.inv.p_ajolote = { lvl: 0, t: T }; E.equip(S, 'p_ajolote');
  S.hero.hp = 50; E.complete(S, 'leer');
  ok(S.hero.hp > 50, 'mascota regenera HP al completar hábitos');
  E.upgrade(S, 'w_madera'); // nivel insuficiente para forja
  E.rng = E.seeded(1);
}

section('Persistencia y respaldo');
{
  const S = mk();
  E.complete(S, 'leer'); E.pull(S, 'std', 10);
  const json = E.serialize(S);
  const S2 = E.migrate(json);
  const canon = o => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v)) ? Object.keys(v).sort().reduce((a, x) => { a[x] = v[x]; return a; }, {}) : v);
  ok(canon(S2) === canon(JSON.parse(json)), 'exportar → importar conserva todo');
  let threw = false; try { E.migrate('{"app":"otra"}'); } catch (e) { threw = true; }
  ok(threw, 'rechaza archivos que no son de LifeMOD');
  threw = false; try { E.migrate('no es json'); } catch (e) { threw = true; }
  ok(threw, 'rechaza JSON inválido');
  const partial = JSON.parse(json); delete partial.stats.crits; delete partial.hero.shield;
  const S3 = E.migrate(partial);
  ok(S3.stats.crits === 0 && S3.hero.shield === 0, 'completa campos faltantes al importar');
}

section('Paso largo del tiempo');
{
  const S = mk();
  E.complete(S, 'leer');
  nextDay(45);
  const ev = E.refresh(S);
  ok(S.hero && S.lastDay === E.dayKey(T), 'procesa 45 días sin errores');
  eq(E.habit(S, 'leer').st, 0, 'racha reiniciada tras ausencia');
  ok(Object.keys(S.days).length >= 45, 'historial diario registrado');
}

section('Hábitos personalizados');
{
  const S = mk();
  const r = E.saveHabit(S, { n: 'Yoga', a: 'vit', d: 'dificil', f: 'weekly', x: 2, ic: 'lotus' });
  ok(r.ok, 'crear hábito semanal');
  const h = E.habit(S, r.id);
  E.complete(S, r.id); nextDay(); E.refresh(S); E.complete(S, r.id); nextDay(); E.refresh(S);
  ok(!E.canComplete(S, h, E.dayKey(T)), 'hábito 2 veces/semana se oculta al cumplir la meta');
  const o = E.saveHabit(S, { n: 'Trámite', a: 'dis', d: 'normal', f: 'once' });
  E.complete(S, o.id);
  ok(E.habit(S, o.id).done && !E.activeGood(S).some(x => x.id === o.id), 'hábito único se archiva al cumplirlo');
  E.saveHabit(S, { id: r.id, n: 'Yoga suave', a: 'vit', d: 'facil', f: 'weekly', x: 3 });
  eq(E.habit(S, r.id).n, 'Yoga suave', 'editar hábito');
  E.delHabit(S, r.id); ok(!E.habit(S, r.id), 'borrar hábito');
  const b = E.saveHabit(S, { n: 'Morderme las uñas', type: 'bad', a: 'dis', d: 'facil' });
  ok(E.logBad(S, b.id).ok, 'mal hábito personalizado registra daño');
}

section('Contenido mínimo');
{
  ok(D.CLASS_KEYS.length >= 5, 'al menos 5 clases');
  ok(D.ACHIEVEMENTS.length >= 40, 'al menos 40 logros (' + D.ACHIEVEMENTS.length + ')');
  ok(D.ACHIEVEMENTS.filter(a => a.sec).length >= 5, 'logros secretos (' + D.ACHIEVEMENTS.filter(a => a.sec).length + ')');
  ok(D.HABITS.filter(h => h.type === 'good').length === 17, '17 hábitos positivos predefinidos');
  ok(D.HABITS.filter(h => h.type === 'bad').length === 12, '12 malos hábitos predefinidos');
  [0, 1, 2, 3, 4].forEach(r => ok(E.pool(null, 'std', r).length > 0 && E.pool(null, 'pet', r).length > 0, 'pool de rareza ' + D.RARITY[r].n));
  const ids = new Set(); D.ACHIEVEMENTS.forEach(a => ids.add(a.id)); eq(ids.size, D.ACHIEVEMENTS.length, 'IDs de logros únicos');
  D.ACHIEVEMENTS.forEach(a => { if (a.rw.title) ok(D.TITLES[a.rw.title], 'título de logro existe: ' + a.rw.title); if (a.rw.skin) ok(D.SKINS[a.rw.skin], 'skin existe: ' + a.rw.skin); });
  D.CHAPTERS.forEach((c, i) => { if (c.rw.item) ok(D.ITEM[c.rw.item], 'objeto de capítulo ' + (i + 1)); });
}

console.log('\n' + (fail ? '❌' : '✅') + ' ' + pass + ' pruebas correctas, ' + fail + ' fallidas');
if (globalThis.__consolidated) require('fs').writeFileSync(__dirname + '/gacha-sim.json', JSON.stringify(globalThis.__consolidated));
process.exit(fail ? 1 : 0);
