/* LifeMOD — interfaz: pantallas, hojas y cinemáticas */
(function (G) {
  'use strict';
  const D = G.LMD, E = G.LME, A = G.LMA, FX = G.LMFX;
  const App = G.LM, UI = App.UI = {};
  const esc = s => App.esc(s), fmt = n => App.fmt(n);
  const CH = { good: '#3a8bf0', bad: '#f03e62', now: '#c08400', past: '#8576cc' }; // paleta validada para gráficas

  /* ---------- piezas comunes ---------- */
  const gem = (attr, ic) => `<div class="hgem" style="--ac:${D.ATTRS[attr].c}">${A.icon(ic || D.ATTRS[attr].ic)}</div>`;
  const stars = r => `<span class="stars">${'★'.repeat(D.RARITY[r].star)}</span>`;
  const lock = (lvl, what) => `<div class="panel"><div class="tag-lock">${A.icon('lock')}<span>${what} se desbloquea en el <b>nivel ${lvl}</b>. ¡Sigue cumpliendo hábitos!</span></div></div>`;
  const timer = (until, label) => `<span class="timer">${A.icon('clock')}${label ? label + ' ' : ''}<span data-until="${until}">${App.left(until - App.now())}</span></span>`;
  const bar = (cls, v, max, label, attrs) => `<div class="bar ${cls}" ${attrs || ''}><i style="width:${Math.max(0, Math.min(100, v / max * 100)).toFixed(1)}%"></i><span class="bar-t">${label}</span></div>`;
  const icoMap = { xp: 'xp', gold: 'gold', gems: 'gems', dust: 'dust', std: 'std', pet: 'pet', gold_t: 'gold_t', chest: 'chest', hp: 'hp' };
  UI.rwChips = (rw, o) => {
    if (!rw) return '';
    const out = [];
    ['xp', 'gold', 'gems', 'dust', 'std', 'pet', 'gold_t'].forEach(k => { if (rw[k]) out.push(`<span class="rw">${A.cur(icoMap[k], 18)}${k === 'xp' ? '+' + fmt(rw[k]) + ' XP' : k === 'std' ? rw[k] + ' ticket' + (rw[k] > 1 ? 's' : '') : k === 'pet' ? rw[k] + ' ticket mascota' : k === 'gold_t' ? 'Ticket Dorado' : '+' + fmt(rw[k])}</span>`); });
    if (rw.chest) out.push(`<span class="rw special">${A.cur('chest', 18)}Cofre Épico</span>`);
    if (rw.attrXp && rw.attr) out.push(`<span class="rw" style="border-color:${D.ATTRS[rw.attr].c}">${A.cur('xp', 18)}+${rw.attrXp} ${D.ATTRS[rw.attr].short}</span>`);
    if (rw.item) { const d = E.itemDef(App.S, rw.item); if (d) out.push(`<span class="rw special">${A.icon('star')}${esc(d.n)}</span>`); }
    if (rw.title) out.push(`<span class="rw special">${A.icon('crown')}Título: ${esc(D.TITLES[rw.title])}</span>`);
    if (rw.skin) out.push(`<span class="rw special">${A.icon('skin')}${esc(D.SKINS[rw.skin].n)}</span>`);
    return `<div class="rw-list" ${o && o.center ? 'style="justify-content:center"' : ''}>${out.join('')}</div>`;
  };
  UI.gotToRw = got => { const rw = {}; (got || []).forEach(g => { if (['item', 'title', 'skin'].indexOf(g.k) >= 0) rw[g.k] = g.v; else if (g.k === 'attrXp') { rw.attrXp = g.v; rw.attr = g.attr; } else if (g.k === 'chest') rw.chest = 1; else if (icoMap[g.k]) rw[g.k] = (rw[g.k] || 0) + g.v; }); return rw; };
  const lvlBadge = (lvl, small) => `<div class="lvl-badge"><svg viewBox="0 0 46 46" aria-hidden="true"><defs><linearGradient id="lbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#ff8f1f"/></linearGradient></defs><path d="M23 2l18 10v22L23 44 5 34V12z" fill="url(#lbg)" stroke="#1d1430" stroke-width="3" stroke-linejoin="round"/><path d="M23 8l12 7v16l-12 7-12-7V15z" fill="none" stroke="#fff6c2" stroke-width="1.5" opacity=".7"/></svg><b class="num">${lvl}</b>${small ? '' : '<small>NV</small>'}</div>`;

  /* ---------- render principal ---------- */
  App.render = () => {
    const S = App.S; if (!S) return;
    const hud = document.getElementById('hud'), nav = document.getElementById('nav'), main = document.getElementById('main');
    const y = window.scrollY, sameView = App.lastView === App.view && !!S.hero === App.lastHero;
    document.body.classList.toggle('fallen-mode', !!(S.hero && S.hero.status === 'fallen'));
    if (!S.hero) {
      hud.hidden = true; nav.hidden = true;
      if (!App.ui.create) App.ui.create = App.newCreate();
      main.innerHTML = UI.create();
    } else {
      hud.hidden = false; nav.hidden = false;
      hud.innerHTML = UI.hud();
      nav.innerHTML = UI.nav();
      const fn = UI.screens[App.view] || UI.screens.home;
      main.innerHTML = fn();
    }
    if (sameView) window.scrollTo(0, y);
    else { const sc = main.querySelector('.screen'); if (sc) sc.classList.add('enter'); }
    App.lastView = App.view; App.lastHero = !!S.hero;
  };

  UI.hud = () => {
    const S = App.S, h = S.hero;
    return `${lvlBadge(h.level)}<div class="hud-name"><b>${esc(h.name)}</b><span>${esc(D.TITLES[h.title] || '')}${h.status === 'fallen' ? ' · Caído' : ''}</span></div>
      <button class="pill" data-act="nav" data-v="shop" aria-label="Oro: ${h.gold}">${A.cur('gold', 20)}<span class="num">${App.fmtS(h.gold)}</span></button>
      <button class="pill" data-act="nav" data-v="gacha" aria-label="Gemas: ${h.gems}">${A.cur('gems', 20)}<span class="num">${App.fmtS(h.gems)}</span></button>
      <button class="icon-btn" data-act="sound" aria-label="${S.settings.sound ? 'Silenciar' : 'Activar sonido'}">${A.icon(S.settings.sound ? 'sound' : 'mute')}</button>`;
  };
  UI.badges = () => {
    const S = App.S, h = S.hero, b = {};
    b.missions = E.allMissions(S).some(m => m.done && !m.cl) || E.chestReady(S, 'daily') || E.chestReady(S, 'weekly') || (E.storyState(S).ready && h.status === 'alive');
    b.gacha = h.status === 'alive' && (h.tickets.std > 0 || h.gems >= D.GACHA.cost1 || h.tickets.gold > 0 || h.chests > 0 || (h.tickets.pet > 0 && h.level >= 5));
    b.home = E.loginReady(S) && h.status === 'alive';
    return b;
  };
  UI.nav = () => {
    const v = App.view, b = UI.badges();
    const it = (id, ic, label, cls) => `<button class="${v === id ? 'on' : ''} ${cls || ''}" data-act="nav" data-v="${id}" aria-label="${label}" ${v === id ? 'aria-current="page"' : ''}>${A.icon(ic)}<span>${label}</span>${b[id] ? '<i class="dot"></i>' : ''}</button>`;
    const moreOn = ['habits', 'shop', 'stats', 'ach', 'settings'].indexOf(v) >= 0;
    return it('home', 'home', 'Inicio') + it('missions', 'scroll', 'Misiones') + it('gacha', 'gem', 'Gacha') + it('inv', 'bag', 'Héroe')
      + `<button class="${moreOn ? 'on' : ''} mob-only" data-act="more" aria-label="Más">${A.icon('grid')}<span>Más</span></button>`
      + it('habits', 'list', 'Hábitos', 'desk-only') + it('shop', 'shop', 'Tienda', 'desk-only') + it('stats', 'chart', 'Estadísticas', 'desk-only') + it('ach', 'trophy', 'Logros', 'desk-only') + it('settings', 'gear', 'Ajustes', 'desk-only');
  };

  /* ---------- escena del héroe ---------- */
  UI.scene = fallen => fallen
    ? `<svg class="scene" viewBox="0 0 400 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><circle cx="330" cy="60" r="28" fill="#c9c9d6" opacity=".35"/><path d="M0 250 Q100 210 200 240 T400 230 V320 H0Z" fill="#24242e"/><path d="M0 280 Q120 250 230 275 T400 270 V320 H0Z" fill="#1a1a22"/><path d="M40 274 l6-26 6 26 M330 268 l5-20 5 20" stroke="#3a3a46" stroke-width="4" fill="none"/></svg>`
    : `<svg class="scene" viewBox="0 0 400 320" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><circle cx="320" cy="70" r="34" fill="#fff6c2" opacity=".9"/><circle cx="320" cy="70" r="50" fill="#fff6c2" opacity=".18"/><g fill="#ffffff" opacity=".55"><ellipse cx="80" cy="70" rx="44" ry="12"/><ellipse cx="110" cy="62" rx="28" ry="12"/><ellipse cx="250" cy="120" rx="36" ry="9"/></g><path d="M0 230 Q90 180 190 215 T400 200 V320 H0Z" fill="#7b4fd0"/><path d="M0 262 Q120 225 220 252 T400 245 V320 H0Z" fill="#5a3aa8"/><path d="M0 290 Q140 270 260 285 T400 282 V320 H0Z" fill="#3d2780"/><g transform="translate(200 296)"><ellipse rx="110" ry="18" fill="none" stroke="#fff6c2" stroke-width="2.5" stroke-dasharray="8 6" opacity=".7"><animate attributeName="stroke-dashoffset" from="0" to="-56" dur="3s" repeatCount="indefinite"/></ellipse><ellipse rx="86" ry="13" fill="none" stroke="#ffd1f2" stroke-width="1.5" opacity=".6"/></g><g fill="#fff"><circle cx="40" cy="140" r="2"><animate attributeName="opacity" values="1;.2;1" dur="2s" repeatCount="indefinite"/></circle><circle cx="360" cy="160" r="2.5"><animate attributeName="opacity" values=".2;1;.2" dur="2.6s" repeatCount="indefinite"/></circle><circle cx="150" cy="40" r="1.8"><animate attributeName="opacity" values="1;.3;1" dur="3s" repeatCount="indefinite"/></circle></g></svg>`;
  const tombSvg = name => `<svg class="tomb" viewBox="0 0 100 120" aria-hidden="true"><path d="M14 116 V46 a36 36 0 0 1 72 0 V116 Z" fill="#8d8da0" stroke="#1d1430" stroke-width="4"/><path d="M60 14 a36 36 0 0 1 26 32 V116 H70 V46 C70 32 66 22 60 14Z" fill="#6e6e82"/><path d="M50 30 l5 13 13 5 -13 5 -5 13 -5 -13 -13 -5 13 -5z" fill="#c9c9d6" stroke="#1d1430" stroke-width="3" stroke-linejoin="round"/><text x="50" y="96" text-anchor="middle" font-size="11" font-weight="800" fill="#1d1430" font-family="sans-serif">${esc((name || '').slice(0, 10))}</text><path d="M4 116 H96" stroke="#1d1430" stroke-width="4"/></svg>`;
  UI.heroArt = (h, o) => A.hero(App.S, { look: h.look, eq: h.eq, skin: h.skin, aura: h.aura, fallen: h.status === 'fallen', expr: o && o.expr });
  UI.stage = (o) => {
    const S = App.S, h = S.hero, fallen = h.status === 'fallen', cls = D.CLASSES[h.classId];
    const pet = h.eq.pet && S.inv[h.eq.pet] ? A.pet(E.itemDef(S, h.eq.pet).look) : '';
    return `<div class="stage ${fallen ? 'fallen' : ''}">${UI.scene(fallen)}
      <div class="stage-info"><span class="cls-chip" style="color:${cls.c}">${A.icon(cls.ic)}<span style="color:var(--ink)">${cls.n}</span></span>${h.shield ? `<span class="cls-chip">${A.icon('shieldstreak')}<span>×${h.shield}</span></span>` : ''}</div>
      <div class="hero-wrap" ${o && o.noTap ? '' : 'data-act="heroTap" role="button" aria-label="Ver equipo del héroe"'}>${UI.heroArt(h)}${pet && !fallen ? `<div class="pet-wrap">${pet}</div>` : ''}${fallen ? tombSvg(h.name) : ''}</div></div>`;
  };
  UI.bars = () => {
    const S = App.S, h = S.hero, mx = E.maxHp(S), need = E.xpToNext(h.level), low = h.hp <= mx * 0.25 && h.status === 'alive';
    return `<div class="col" style="gap:8px">
      <div><div class="bar-label"><span class="row" style="gap:4px">${A.cur('hp', 16)} Vida</span><span class="num">${h.hp} / ${mx}</span></div>${bar('hp ' + (low ? 'low' : ''), h.hp, mx, '', 'data-hpbar')}</div>
      <div><div class="bar-label"><span class="row" style="gap:4px">${A.cur('xp', 16)} Experiencia</span><span class="num">${fmt(h.xp)} / ${fmt(need)}</span></div>${bar('xp', h.xp, need, '', 'data-xpbar')}</div></div>`;
  };
  UI.attrs = () => {
    const h = App.S.hero;
    return `<div class="attr-row">${D.ATTR_KEYS.map(k => { const a = h.attrs[k], at = D.ATTRS[k]; return `<div class="attr" title="${at.n}: ${at.d}"><div class="gemi" style="background:${at.c}">${A.icon(at.ic)}</div><b class="num">${a.lvl}</b><span>${at.short}</span><div class="mini"><i style="width:${(a.xp / E.attrXpToNext(a.lvl) * 100).toFixed(0)}%;background:${at.c}"></i></div></div>`; }).join('')}</div>`;
  };

  /* ---------- INICIO ---------- */
  UI.screens = {};
  UI.screens.home = () => {
    const S = App.S, h = S.hero, dk = E.dayKey(App.now()), day = S.days[dk] || { g: 0, b: 0, done: {}, bad: {} };
    const fallen = h.status === 'fallen';
    const list = E.todayHabits(S).sort((a, b) => (E.doneToday(S, a, dk) ? 1 : 0) - (E.doneToday(S, b, dk) ? 1 : 0));
    const dl = E.dailies(S), doneD = dl.filter(x => day.done[x.id]).length;
    const ringTotal = Math.max(dl.length, 3), ringDone = Math.min(ringTotal, Math.max(doneD, Math.min(3, day.g)));
    const pct = day.perf ? 1 : (dl.length ? doneD / dl.length : Math.min(1, day.g / 3));
    const C = 2 * Math.PI * 24;
    const left = [];
    left.push(UI.stage());
    left.push(`<div class="panel tight">${UI.bars()}</div>`);
    left.push(UI.attrs());
    const right = [];
    if (fallen) right.push(UI.ritual());
    else if (h.hp <= E.maxHp(S) * 0.25) right.push(`<div class="low-hp-warn">${A.cur('hp', 26)}<span>¡Tu HP está muy bajo! Si llega a 0, tu héroe caerá. Cumple hábitos de Vitalidad${E.unlocked(S, 'shop') ? ' o compra una poción' : ''}.</span>${E.unlocked(S, 'shop') ? `<button class="btn sm red" data-act="nav" data-v="shop">Tienda</button>` : ''}</div>`);
    if (E.loginReady(S) && !fallen) { const i = E.loginNext(S); right.push(`<div class="chest-card ready">${A.cur('chest', 34)}<div class="grow"><b>Bono diario · Día ${i + 1} de 7</b>${UI.rwChips(D.LOGIN[i])}</div><button class="btn gold sm" data-act="login">Reclamar</button></div>`); }
    if (S.ms.event && S.ms.event.until > App.now()) right.push(UI.eventBanner());
    if (S.ms.boss.cur) right.push(UI.bossMini());
    if (App.deferredPrompt && !App.isStandalone() && !App.ui.hideInstall) right.push(`<div class="chest-card">${A.icon('install')}<div class="grow small"><b>Instala LifeMOD</b><br><span class="muted">Ábrela como app y úsala sin conexión.</span></div><button class="btn sm gold" data-act="install">Instalar</button><button class="icon-btn" data-act="dismissInstall" aria-label="Ocultar">${A.icon('x')}</button></div>`);
    right.push(`<div class="panel tight"><div class="day-ring"><svg class="ring" viewBox="0 0 58 58" aria-hidden="true"><circle class="bg" cx="29" cy="29" r="24"/><circle class="fg" cx="29" cy="29" r="24" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - pct)).toFixed(1)}"/><text x="29" y="34" text-anchor="middle">${day.perf ? '★' : Math.round(pct * 100) + '%'}</text></svg>
      <div class="grow"><b>${day.perf ? '¡Día Perfecto conseguido!' : 'Camino al Día Perfecto'}</b><div class="small muted">${dl.length ? `Diarios cumplidos: ${doneD}/${dl.length}` : 'Sin hábitos diarios'} · Total hoy: ${day.g} (mín. 3)${day.b ? ` · <span style="color:#ff7a9a">${day.b} mal${day.b > 1 ? 'es' : ''}</span>` : ''}</div><div class="tiny dim">Recompensa: +15 gemas y +15% HP</div></div></div></div>`);
    right.push(`<div class="sec-title"><h2>Hábitos de hoy</h2><button class="btn ghost sm" data-act="nav" data-v="habits">${A.icon('edit')}Gestionar</button></div>`);
    if (!list.length) right.push(`<div class="panel"><p class="muted" style="margin:0 0 10px">No tienes hábitos activos para hoy.</p><button class="btn gold" data-act="nav" data-v="habits">${A.icon('plus')}Activar hábitos</button></div>`);
    right.push(`<div class="hab-list">${list.map(x => UI.habRow(x, dk)).join('')}</div>`);
    const bads = E.activeBad(S);
    right.push(`<div class="sec-title"><h2>Malos hábitos</h2><span class="tiny dim">Tócalo si caíste</span></div>`);
    if (bads.length) {
      const mods = E.mods(S);
      right.push(`<div class="bad-grid">${bads.map(b => `<button class="bad" data-act="bad" data-id="${b.id}" aria-label="Registrar ${esc(b.n)}"><span class="bico">${A.icon(b.ic)}</span><span class="grow"><b>${esc(b.n)}</b><small>${fallen ? 'Rompe el ritual' : '−' + Math.max(1, Math.round(D.DIFF[b.d].dmg * (1 - mods.def))) + ' HP'}</small></span>${day.bad[b.id] ? `<span class="cnt">×${day.bad[b.id]}</span>` : ''}</button>`).join('')}</div>`);
    } else right.push(`<p class="small muted" style="margin:0">No tienes malos hábitos activos. Puedes activarlos en Hábitos.</p>`);
    return `<div class="screen home-grid"><div class="col">${left.join('')}</div><div class="col">${right.join('')}</div></div>`;
  };
  UI.habRow = (x, dk) => {
    const S = App.S, done = E.doneToday(S, x, dk), at = D.ATTRS[x.a], df = D.DIFF[x.d];
    const mult = E.streakMult(x.st), nt = E.nextStreakTier(x.st);
    const streak = x.f !== 'once' && x.st > 0 ? `<span class="streak ${x.st >= 7 ? 'hot' : ''}" title="Racha">${A.icon('flame')}${x.st} ${x.f === 'weekly' ? 'veces' : 'días'}${mult > 1 ? ' · x' + mult : ''}</span>` : (x.f !== 'once' && nt ? `<span class="tiny dim">x${nt[1]} a los ${nt[0]}</span>` : '');
    const wk = x.f === 'weekly' ? `<span class="chip">${E.weekCount(x, dk)}/${x.x} sem.</span>` : x.f === 'once' ? '<span class="chip">Única</span>' : '';
    return `<div class="hab ${done ? 'done' : ''}" data-hid="${x.id}" style="--ac:${at.c}">${gem(x.a, x.ic)}<div class="grow"><div class="hname">${esc(x.n)}</div><div class="hmeta"><span class="chip" style="background:${df.c};color:#1d1430">${df.n}</span><span class="chip" style="color:${at.c}">${at.short}</span>${wk}${streak}</div></div>
      ${done ? `<span class="check-btn" aria-label="Cumplido">${A.icon('check')}</span>` : `<button class="check-btn" data-act="complete" data-id="${x.id}" aria-label="Cumplir ${esc(x.n)}">${A.icon('check')}</button>`}</div>`;
  };
  UI.ritual = () => {
    const S = App.S, r = E.ritualToday(S), h = S.hero;
    const candle = lit => `<svg viewBox="0 0 30 56" aria-hidden="true">${lit ? '<path class="flame" d="M15 2 C20 10 22 14 15 22 C8 14 10 10 15 2Z" fill="#ffc12e" stroke="#1d1430" stroke-width="2"/><circle cx="15" cy="16" r="9" fill="#ffc12e" opacity=".25"/>' : '<path d="M15 16 v6" stroke="#5a5a6e" stroke-width="2"/>'}<rect x="8" y="22" width="14" height="32" rx="3" fill="${lit ? '#fff3d6' : '#6e6e82'}" stroke="#1d1430" stroke-width="2.5"/></svg>`;
    let c = ''; for (let i = 0; i < r.need; i++) c += `<div class="candle ${i < r.progress ? 'lit' : ''}">${candle(i < r.progress)}<span>Día ${i + 1}</span></div>`;
    const ck = (ok, t) => `<div class="ritual-check"><span class="${ok ? 'ok' : 'no'}">${A.icon(ok ? 'check' : 'x')}</span><span>${t}</span></div>`;
    return `<div class="ritual"><div class="row sp-between wrap"><h2>Ritual de Resurrección</h2><span class="timer" style="background:#5c0a2e">${A.icon('skull')}Quedan ${r.daysLeft} día${r.daysLeft === 1 ? '' : 's'}</span></div>
      <p class="small" style="margin:0;color:#c9c9d6">Cumple <b>todos</b> tus hábitos diarios (y al menos 3 hábitos) <b>sin registrar malos hábitos</b> durante ${r.need} días seguidos. Si pasan 14 días sin completarlo, ${esc(h.name)} morirá para siempre.</p>
      <div class="candles">${c}</div>
      <div class="col" style="gap:4px"><b class="small">Hoy</b>${ck(r.total === 0 || r.done >= r.total, `Hábitos diarios: ${r.done}/${r.total}`)}${ck(r.g >= 3, `Hábitos cumplidos: ${r.g} (mínimo 3)`)}${ck(r.clean, r.clean ? 'Sin malos hábitos hoy' : 'Registraste un mal hábito hoy')}</div>
      <p class="tiny dim" style="margin:0">El día cuenta para el ritual cuando termina. Mientras estés Caído no ganas XP, oro ni tiradas.</p></div>`;
  };
  UI.eventBanner = () => {
    const ev = App.S.ms.event, def = D.EVENTS.find(e => e.id === ev.id) || {};
    const m = ev.m;
    return `<div class="event-banner" style="--ec:${def.c || '#ff5ad1'}"><div class="eico">${A.icon(def.ic || 'sparkle')}</div><div class="grow"><b>${esc(ev.n)}</b><div class="small">${esc(ev.d)}</div>${m ? `<div class="prog"><i style="width:${(m.p / m.n * 100).toFixed(0)}%"></i></div><div class="tiny">${m.p}/${m.n}</div>` : ''}</div><div class="col" style="align-items:flex-end;gap:6px">${timer(ev.until)}${m && m.done && !m.cl ? `<button class="btn gold sm" data-act="claim" data-id="${m.id}">Reclamar</button>` : ''}</div></div>`;
  };
  UI.bossMini = () => {
    const b = App.S.ms.boss.cur, info = E.bossInfo(App.S);
    return `<button class="panel tight row" data-act="nav" data-v="missions" data-k="missions" data-t="boss" style="text-align:left;width:100%"><div style="width:58px;flex:none">${A.boss(info.def.look)}</div><div class="grow"><div class="row sp-between"><b class="small">${esc(info.name)}</b>${timer(b.until)}</div>${bar('boss', b.hp, b.max, b.hp + ' / ' + b.max)}</div></button>`;
  };

  /* ---------- HÁBITOS ---------- */
  UI.screens.habits = () => {
    const S = App.S, t = App.tab.habits;
    const list = S.habits.filter(h => h.type === (t === 'bad' ? 'bad' : 'good')).sort((a, b) => (b.on - a.on));
    const freq = h => h.type === 'bad' ? '' : h.f === 'weekly' ? h.x + '×/semana' : h.f === 'once' ? (h.done ? 'Única · completada' : 'Única') : 'Diaria';
    const rows = list.map(h => { const df = D.DIFF[h.d]; return `<div class="list-row">${gem(h.a, h.ic).replace('hgem', 'hgem" style="width:38px;height:38px;border-radius:12px;--ac:' + D.ATTRS[h.a].c)}<div class="grow"><b>${esc(h.n)}</b><div class="tiny muted">${D.ATTRS[h.a].n} · ${df.n}${h.type === 'bad' ? ' · −' + df.dmg + ' HP' : ' · +' + df.xp + ' XP · ' + freq(h)}${h.cu ? ' · Propio' : ''}</div></div><button class="icon-btn" data-act="habitForm" data-id="${h.id}" aria-label="Editar ${esc(h.n)}">${A.icon('edit')}</button><button class="switch ${h.on ? 'on' : ''}" data-act="habitToggle" data-id="${h.id}" role="switch" aria-checked="${h.on}" aria-label="${h.on ? 'Desactivar' : 'Activar'} ${esc(h.n)}"></button></div>`; }).join('');
    return `<div class="screen"><div class="sec-title"><h2>Mis hábitos</h2><button class="btn gold sm" data-act="habitForm" data-type="${t === 'bad' ? 'bad' : 'good'}">${A.icon('plus')}Nuevo</button></div>
      <div class="tabs" role="tablist"><button class="${t !== 'bad' ? 'on' : ''}" data-act="tab" data-k="habits" data-t="good">Positivos (${S.habits.filter(h => h.type === 'good' && h.on).length})</button><button class="${t === 'bad' ? 'on' : ''}" data-act="tab" data-k="habits" data-t="bad">Malos (${S.habits.filter(h => h.type === 'bad' && h.on).length})</button></div>
      <p class="small muted" style="margin:0">${t === 'bad' ? 'Registrar un mal hábito te quita HP según su dificultad y cura al jefe activo.' : 'Activa los hábitos que quieres seguir. La dificultad escala la XP, el oro y la racha multiplica tus recompensas.'}</p>
      <div class="panel" style="padding-block:4px">${rows}</div></div>`;
  };
  UI.habitSheet = (id, type) => {
    const S = App.S, h = id ? E.habit(S, id) : null;
    const f = h ? { id: h.id, n: h.n, type: h.type, a: h.a, d: h.d, f: h.f, x: h.x, ic: h.ic } : { n: '', type: type || 'good', a: 'fue', d: 'normal', f: 'daily', x: 3, ic: type === 'bad' ? 'skull' : 'star' };
    const body = () => {
      const df = D.DIFF[f.d];
      return `<div class="field"><label for="h-name">Nombre</label><input id="h-name" class="input" maxlength="40" value="${esc(f.n)}" placeholder="${f.type === 'bad' ? 'Ej.: Morderme las uñas' : 'Ej.: Practicar guitarra'}"></div>
      ${h ? '' : `<div class="field"><span class="lbl">Tipo</span><div class="opts"><button class="opt ${f.type === 'good' ? 'on' : ''}" data-h="type" data-v="good" style="--oc:#3ddc84">${A.icon('check')}Positivo</button><button class="opt ${f.type === 'bad' ? 'on' : ''}" data-h="type" data-v="bad" style="--oc:#ff4d6d">${A.icon('skull')}Malo</button></div></div>`}
      <div class="field"><span class="lbl">Atributo</span><div class="opts">${D.ATTR_KEYS.map(k => `<button class="opt ${f.a === k ? 'on' : ''}" data-h="a" data-v="${k}" style="--oc:${D.ATTRS[k].c}">${A.icon(D.ATTRS[k].ic)}${D.ATTRS[k].n}</button>`).join('')}</div></div>
      <div class="field"><span class="lbl">Dificultad</span><div class="opts">${D.DIFF_KEYS.map(k => `<button class="opt ${f.d === k ? 'on' : ''}" data-h="d" data-v="${k}" style="--oc:${D.DIFF[k].c}">${D.DIFF[k].n}</button>`).join('')}</div>
        <div class="tiny muted">${f.type === 'bad' ? `Daño al registrarlo: −${df.dmg} HP (antes de defensa)` : `Recompensa base: +${df.xp} XP · +${df.gold} oro${f.a === 'vit' ? ' · +' + df.heal + ' HP' : ''}`}</div></div>
      ${f.type === 'good' ? `<div class="field"><span class="lbl">Frecuencia</span><div class="opts"><button class="opt ${f.f === 'daily' ? 'on' : ''}" data-h="f" data-v="daily">Diaria</button><button class="opt ${f.f === 'weekly' ? 'on' : ''}" data-h="f" data-v="weekly">Veces por semana</button><button class="opt ${f.f === 'once' ? 'on' : ''}" data-h="f" data-v="once">Única</button></div>
        ${f.f === 'weekly' ? `<div class="stepper"><button class="icon-btn" data-h="x" data-v="-1" aria-label="Menos">${A.icon('minus')}</button><b class="num">${f.x}</b><button class="icon-btn" data-h="x" data-v="1" aria-label="Más">${A.icon('plus')}</button><span class="small muted">veces por semana</span></div>` : ''}</div>` : ''}
      <div class="field"><span class="lbl">Ícono</span><div class="icon-grid">${D.ICON_CHOICES.map(ic => `<button class="${f.ic === ic ? 'on' : ''}" data-h="ic" data-v="${ic}" aria-label="${ic}">${A.icon(ic)}</button>`).join('')}</div></div>
      <div class="row" style="justify-content:space-between">${h ? `<button class="btn red sm" data-act="habitDel" data-id="${h.id}">${A.icon('trash')}Borrar</button>` : '<span></span>'}<button class="btn gold" data-hsave>${A.icon('check')}Guardar</button></div>`;
    };
    App.sheet(h ? 'Editar hábito' : 'Nuevo hábito', `<div class="col" data-hform>${body()}</div>`, {
      onShow: (el, close) => {
        const box = el.querySelector('[data-hform]');
        box.addEventListener('input', e => { if (e.target.id === 'h-name') f.n = e.target.value; });
        box.addEventListener('click', e => {
          const b = e.target.closest('[data-h]');
          if (b) { const k = b.dataset.h; if (k === 'x') f.x = Math.max(1, Math.min(6, f.x + +b.dataset.v)); else f[k] = b.dataset.v; if (k === 'type' && f.type === 'bad' && f.ic === 'star') f.ic = 'skull'; box.innerHTML = body(); App.snd('tap'); return; }
          if (e.target.closest('[data-hsave]')) {
            const r = E.saveHabit(App.S, f);
            if (!r.ok) return App.err(r.err);
            App.save(); close(); App.toast(A.icon('check') + '<span>Hábito guardado</span>');
          }
        });
      }
    });
  };

  /* ---------- MISIONES ---------- */
  const mIcon = { daily: ['sun', '#ff8f1f'], weekly: ['calendar', '#4da3ff'], explore: ['compass', '#1fa59a'], balance: ['lotus', '#b45cff'], event: ['bolt', '#ff5ad1'] };
  UI.mission = (m, o) => {
    const [ic, col] = mIcon[m.k] || ['scroll', '#888'], pct = Math.min(100, m.p / m.n * 100);
    let btn;
    if (m.cl) btn = `<span class="chip" style="background:var(--green);color:#1d1430">${A.icon('check')}Hecho</span>`;
    else if (m.done) btn = `<button class="btn gold sm" data-act="claim" data-id="${m.id}">Reclamar</button>`;
    else if (m.m === 'manual') btn = `<button class="btn green sm" data-act="manual" data-id="${m.id}">¡Lo hice!</button>`;
    else if (o && o.reroll) btn = `<button class="icon-btn" data-act="reroll" data-id="${m.id}" aria-label="Cambiar misión (1 vez al día)" title="Cambiar misión (1 vez al día)">${A.icon('dice')}</button>`;
    else btn = '';
    const attr = m.f && m.f.attr ? `<span class="chip" style="color:${D.ATTRS[m.f.attr].c}">${D.ATTRS[m.f.attr].n}</span>` : '';
    return `<div class="mission ${m.done ? 'done' : ''} ${m.cl ? 'claimed' : ''}"><div class="mico" style="background:${col}">${A.icon(ic)}</div><div class="grow"><div class="mt">${esc(m.t)}</div>${m.m === 'manual' ? '' : `<div class="prog"><i style="width:${pct.toFixed(0)}%"></i></div><div class="tiny muted num">${fmt(m.p)} / ${fmt(m.n)}</div>`}<div class="row wrap" style="gap:4px;margin-top:4px">${attr}</div>${UI.rwChips(m.rw)}</div><div>${btn}</div></div>`;
  };
  UI.screens.missions = () => {
    const S = App.S, t = App.tab.missions, h = S.hero, ms = S.ms;
    const claimable = arr => arr.some(m => m.done && !m.cl);
    const tabs = [['daily', 'Diarias', claimable(ms.daily.list) || E.chestReady(S, 'daily')], ['weekly', 'Semanales', claimable(ms.weekly.list) || E.chestReady(S, 'weekly')], ['adv', 'Aventura', claimable(ms.explore.list.concat(ms.balance.m ? [ms.balance.m] : [], ms.event && ms.event.m ? [ms.event.m] : []))], ['story', 'Historia', E.storyState(S).ready], ['boss', 'Jefes', false]];
    let body = '';
    const fallenNote = h.status === 'fallen' ? `<div class="low-hp-warn">${A.icon('skull')}<span>Estás Caído: las misiones no avanzan ni se pueden reclamar hasta que revivas.</span></div>` : '';
    const tomorrow = E.endOfDay(App.now());
    if (t === 'daily') {
      const d = ms.daily;
      body = `<div class="row sp-between"><p class="small muted" style="margin:0">3 misiones nuevas cada día. Puedes cambiar una al día con ${A.icon('dice')}.</p>${timer(tomorrow, 'Nuevas en')}</div>
        <div class="col">${d.list.map(m => UI.mission(m, { reroll: !d.reroll })).join('')}</div>
        <div class="chest-card ${E.chestReady(S, 'daily') ? 'ready' : ''}">${A.cur('chest', 34)}<div class="grow"><b>Cofre diario</b><div class="tiny muted">Reclama las 3 misiones para abrirlo: 30 gemas + objeto o polvo.</div></div>${d.chest ? '<span class="chip">Abierto</span>' : `<button class="btn gold sm" data-act="chest" data-k="daily" ${E.chestReady(S, 'daily') ? '' : 'disabled'}>Abrir</button>`}</div>`;
    } else if (t === 'weekly') {
      if (!E.unlocked(S, 'weekly')) body = lock(E.unlockLevel('weekly'), 'Las misiones semanales');
      else {
        const w = ms.weekly, mon = E.dayDate(E.addDays(w.wk, 7)); mon.setHours(0, 0, 0, 0);
        body = `<div class="row sp-between"><p class="small muted" style="margin:0">Más difíciles, mejores premios. Se renuevan cada lunes.</p>${timer(mon.getTime(), 'Renueva en')}</div>
          <div class="col">${w.list.map(m => UI.mission(m)).join('')}</div>
          <div class="chest-card ${E.chestReady(S, 'weekly') ? 'ready' : ''}">${A.cur('chest', 34)}<div class="grow"><b>Cofre semanal</b><div class="tiny muted">3 tickets + 100 gemas + 50 polvo.</div></div>${w.chest ? '<span class="chip">Abierto</span>' : `<button class="btn gold sm" data-act="chest" data-k="weekly" ${E.chestReady(S, 'weekly') ? '' : 'disabled'}>Abrir</button>`}</div>`;
      }
    } else if (t === 'adv') {
      const parts = [];
      if (ms.event && ms.event.until > App.now()) parts.push(`<div class="sec-title"><h2>Evento sorpresa</h2></div>${UI.eventBanner()}`);
      parts.push(`<div class="sec-title"><h2>Exploración</h2>${ms.explore.until && E.unlocked(S, 'explore') ? `<span class="tiny dim">Cambian cada 3 días</span>` : ''}</div>`);
      if (!E.unlocked(S, 'explore')) parts.push(lock(E.unlockLevel('explore'), 'La Exploración'));
      else parts.push(`<p class="small muted" style="margin:0">Prueba cosas nuevas en tus atributos más descuidados. Recompensa: XP extra para ese atributo, gemas y polvo. A las 5 completadas ganas la <b>Capa del Explorador</b> (exclusiva).</p><div class="col">${ms.explore.list.map(m => UI.mission(m)).join('')}</div>`);
      parts.push(`<div class="sec-title"><h2>Equilibrio</h2></div>`);
      if (!E.unlocked(S, 'balance')) parts.push(lock(E.unlockLevel('balance'), 'El Equilibrio'));
      else parts.push(`<p class="small muted" style="margin:0">Sube tu atributo más bajo. A las 3 completadas ganas la <b>Medalla del Equilibrio</b> (exclusiva).</p>${ms.balance.m ? UI.mission(ms.balance.m) : ''}`);
      if (!E.unlocked(S, 'events')) parts.push(`<p class="tiny dim">${A.icon('lock')} Los eventos sorpresa aparecen desde el nivel ${E.unlockLevel('events')}.</p>`);
      body = parts.join('');
    } else if (t === 'story') {
      const st = E.storyState(S);
      if (st.done) body = `<div class="panel story">${A.lumi()}<div class="speech">¡Salvaste Hábitia! La campaña terminó, pero tu leyenda continúa cada día. Sigue derrotando jefes y completando misiones.</div></div>`;
      else body = `<div class="panel col"><div class="row sp-between"><span class="chip" style="background:var(--gold);color:#1d1430">Capítulo ${st.ch + 1} de ${D.CHAPTERS.length}</span></div><h2>${esc(st.c.n)}</h2><div class="story">${A.lumi()}<div class="speech">${esc(st.c.intro)}</div></div>
        <div class="col" style="gap:8px">${st.obj.map(o => `<div><div class="row sp-between small"><b>${o.ok ? '✔ ' : ''}${esc(o.t)}</b><span class="num muted">${o.cur}/${o.v}</span></div><div class="prog"><i style="width:${(o.cur / o.v * 100).toFixed(0)}%"></i></div></div>`).join('')}</div>
        <div><b class="small">Recompensa</b>${UI.rwChips(st.c.rw)}</div><button class="btn gold block" data-act="chapter" ${st.ready ? '' : 'disabled'}>${st.ready ? 'Completar capítulo' : 'Cumple los objetivos para continuar'}</button></div>
        ${st.ch > 0 ? `<div class="panel tight"><b class="small">Capítulos completados</b><div class="col" style="gap:2px;margin-top:6px">${D.CHAPTERS.slice(0, st.ch).map((c, i) => `<div class="small muted">✔ ${i + 1}. ${esc(c.n)}</div>`).join('')}</div></div>` : ''}`;
    } else if (t === 'boss') {
      if (!E.unlocked(S, 'bosses')) body = lock(E.unlockLevel('bosses'), 'Los jefes');
      else {
        const b = ms.boss, info = E.bossInfo(S), cur = b.cur;
        body = `<div class="panel boss-card col" style="align-items:center">${A.boss(info.def.look)}<h2>${esc(info.name)}</h2><p class="small muted" style="margin:0;max-width:44ch">${esc(info.def.d)}</p>
          ${cur ? `<div style="width:100%">${bar('boss', cur.hp, cur.max, cur.hp + ' / ' + cur.max + ' HP')}</div><div class="row wrap" style="justify-content:center">${timer(cur.until, 'Escapa en')}<span class="chip">Daño hecho: ${fmt(cur.dealt || 0)}</span></div>
            <p class="tiny muted" style="margin:0">Cada hábito cumplido le hace daño igual a tu XP × (1 + bonus de jefe ${Math.round(E.mods(S).boss * 100)}%). Cada mal hábito lo cura.</p>`
            : `<div class="row wrap" style="justify-content:center"><span class="chip">${A.icon('heart')}${fmt(info.max)} HP</span><span class="chip">${A.icon('clock')}${info.def.days} días</span></div>
            ${b.next > App.now() ? `<p class="small muted" style="margin:0">El próximo jefe aparece en ${timer(b.next)}</p>` : `<button class="btn red block" data-act="bossStart">${A.icon('swords')}¡Desafiar!</button>`}`}
          <div class="tiny dim">Jefes derrotados: ${b.won}</div></div>`;
      }
    }
    return `<div class="screen"><div class="sec-title"><h2>Misiones</h2></div><div class="tabs" role="tablist">${tabs.map(([k, n, dot]) => `<button class="${t === k ? 'on' : ''}" data-act="tab" data-k="missions" data-t="${k}" role="tab" aria-selected="${t === k}">${n}${dot ? '<i class="dot"></i>' : ''}</button>`).join('')}</div>${fallenNote}${body}</div>`;
  };

  /* ---------- GACHA ---------- */
  UI.screens.gacha = () => {
    const S = App.S, h = S.hero, t = App.tab.gacha, B = D.BANNERS[t];
    const tabs = Object.keys(D.BANNERS).map(k => `<button class="${t === k ? 'on' : ''}" data-act="tab" data-k="gacha" data-t="${k}">${D.BANNERS[k].n}${h.level < D.BANNERS[k].unlock ? ' ' + A.icon('lock') : ''}</button>`).join('');
    let ban;
    if (h.level < B.unlock) ban = lock(B.unlock, 'El ' + B.n);
    else {
      const pi = E.pityInfo(S, t), F = E.featured(S);
      const art = t === 'feat' ? A.item(S, F.leg) : t === 'pet' ? A.pet(D.ITEM.p_fenix.look) : A.item(S, 'w_genesis');
      const c1 = E.pullCost(S, t, 1), c10 = E.pullCost(S, t, 10);
      const costHtml = c => c.tickets && !c.gems ? `<span class="cost">${A.cur(B.ticket === 'pet' ? 'pet' : 'std', 16)}×${c.tickets}</span>` : `<span class="cost">${c.tickets ? A.cur(B.ticket === 'pet' ? 'pet' : 'std', 16) + '×' + c.tickets + ' + ' : ''}${A.cur('gems', 16)}${c.gems}</span>`;
      ban = `<div class="banner ${t}"><div class="rays"></div><div class="feat-art">${art}</div><div style="position:relative;max-width:62%"><h2>${B.n}</h2><p class="small" style="margin:4px 0 0">${esc(B.d)}</p>
        ${t === 'feat' ? `<p class="small" style="margin:6px 0 0"><b>Destacado:</b> ${esc(D.ITEM[F.leg].n)}<br><span class="tiny">Épicos con más probabilidad: ${F.ep.map(id => esc(D.ITEM[id].n)).join(', ')}</span></p>` : ''}</div>
        <div class="pity" style="margin-top:auto"><span class="chip">Épico+ garantizado en ${pi.epicIn}</span><span class="chip">Legendario+ garantizado en ${pi.legIn}</span>${pi.guar ? '<span class="chip">Próximo legendario: destacado</span>' : ''}</div></div>
        <div class="pull-btns"><button class="btn" data-act="pull" data-b="${t}" data-n="1" ${c1.ok && h.status === 'alive' ? '' : 'disabled'}><b>Tirar ×1</b>${costHtml(c1)}</button><button class="btn pink" data-act="pull" data-b="${t}" data-n="10" ${c10.ok && h.status === 'alive' ? '' : 'disabled'}><b>Tirar ×10</b>${costHtml(c10)}</button></div>
        <div class="row sp-between wrap"><span class="small muted row">${A.cur('std', 18)} ${h.tickets.std} · ${A.cur('pet', 18)} ${h.tickets.pet} · ${A.cur('gems', 18)} ${fmt(h.gems)}</span><button class="btn ghost sm" data-act="rates">${A.icon('info')}Probabilidades</button></div>
        ${h.status === 'fallen' ? `<div class="low-hp-warn">${A.icon('skull')}<span>Los caídos no pueden invocar. Completa el Ritual de Resurrección.</span></div>` : ''}`;
    }
    const specials = (h.tickets.gold || h.chests) ? `<div class="panel row wrap">${h.tickets.gold ? `<button class="btn gold" data-act="special" data-k="gold_t">${A.cur('gold_t', 22)}Usar Ticket Dorado (${h.tickets.gold})</button>` : ''}${h.chests ? `<button class="btn" data-act="special" data-k="chest">${A.cur('chest', 22)}Abrir Cofre Épico (${h.chests})</button>` : ''}</div>` : '';
    const dust = `<div class="sec-title"><h2>Canje de polvo</h2><span class="pill">${A.cur('dust', 18)}<span class="num">${fmt(h.dust)}</span></span></div>
      <p class="small muted" style="margin:0">Los duplicados se convierten en polvo estelar. Úsalo aquí o en la Forja para mejorar objetos.</p>
      <div class="col">${D.DUST_SHOP.map(it => { const owned = (it.skin && S.owned.skins.indexOf(it.skin) >= 0) || (it.title && S.owned.titles.indexOf(it.title) >= 0); return `<div class="mission"><div class="mico" style="background:#5a2bd6">${A.icon(it.ic)}</div><div class="grow"><b class="small">${esc(it.n)}</b><div class="tiny muted">${esc(it.d)}</div></div><button class="btn sm" data-act="dust" data-id="${it.id}" ${owned || h.dust < it.price ? 'disabled' : ''}>${owned ? 'Obtenido' : `${A.cur('dust', 16)}${it.price}`}</button></div>`; }).join('')}</div>`;
    const hist = S.gacha.hist.slice(0, 12);
    const histHtml = hist.length ? `<div class="panel tight"><b class="small">Últimas tiradas</b><div class="row wrap" style="margin-top:6px;gap:4px">${hist.map(x => `<span class="chip rar-${x.r}" style="border-color:var(--rc);color:var(--rc)">${esc(D.ITEM[x.id] ? D.ITEM[x.id].n : x.id)}</span>`).join('')}</div></div>` : '';
    return `<div class="screen"><div class="sec-title"><h2>Gacha</h2></div><div class="tabs">${tabs}</div>${ban}${specials}${dust}${histHtml}</div>`;
  };
  UI.ratesSheet = () => {
    const cons = [56.81, 26.49, 12.43, 3.85, 0.42];
    App.sheet('Probabilidades', `<table class="rates"><thead><tr><th>Rareza</th><th>Base</th><th>Con pity*</th></tr></thead><tbody>${D.RARITY.map((r, i) => `<tr class="rar-${i}"><td><span class="rtxt">${r.n}</span> ${stars(i)}</td><td>${r.w}%</td><td>${cons[i]}%</td></tr>`).join('')}</tbody></table>
      <div class="col small"><p style="margin:0"><b>Sistema pity:</b> si haces 9 tiradas seguidas sin Épico o superior, la 10.ª es Épico o superior garantizado. Si haces 79 tiradas sin Legendario o superior, la 80.ª lo garantiza. Cada banner tiene su propio contador.</p>
      <p style="margin:0"><b>Banner Destacado:</b> cada Legendario tiene 50% de ser el destacado. Si no lo es, el siguiente Legendario será el destacado (garantizado).</p>
      <p style="margin:0"><b>Duplicados → polvo estelar:</b> ${D.RARITY.map(r => r.n + ' ' + r.dust).join(' · ')}.</p>
      <p style="margin:0"><b>Costo:</b> ${D.GACHA.cost1} gemas por tirada, ${D.GACHA.cost10} por ×10 (10% de descuento). Los tickets se usan primero. Las gemas solo se ganan jugando.</p>
      <p class="tiny muted" style="margin:0">* Tasa real medida con una simulación de 2.000.000 tiradas incluyendo el pity.</p></div>`);
  };
  /* Cinemática de invocación */
  UI.gacha = (res, after) => {
    const S = App.S, maxR = Math.max(...res.map(r => r.r)), one = res.length === 1;
    const oc = ['#7df9ff', '#3fa0ff', '#b45cff', '#ffc12e', '#ff5ad1'];
    const cards = res.map((r, i) => { const d = E.itemDef(S, r.id); return `<div class="gcard rar-${r.r}" data-i="${i}"><div class="inner"><div class="face back"></div><div class="face front">${!r.dup ? '<span class="new">NUEVO</span>' : ''}${A.item(S, r.id)}<b>${esc(d.n)}</b>${stars(r.r)}${r.dup ? `<span class="dupe">+${r.dust} polvo</span>` : ''}</div></div></div>`; }).join('');
    const dust = res.reduce((a, r) => a + (r.dust || 0), 0);
    App.overlay({ now: true, cls: 'gacha-ov', noFocus: true,
      html: `<div class="ov-card" style="max-width:600px"><div data-ph1 class="col" style="align-items:center;gap:22px;min-height:50vh;justify-content:center"><div class="orb" data-orb></div><div class="big-title" style="font-size:24px;-webkit-text-stroke:4px var(--ol)">Invocando…</div></div>
        <div data-ph2 hidden class="col" style="align-items:center;width:100%"><div class="gacha-grid ${one ? 'one' : ''}">${cards}</div><div class="small muted" data-sum hidden>${dust ? `Duplicados convertidos: +${dust} polvo estelar` : '¡Todo nuevo!'}</div>
        <div class="row" data-end hidden><button class="btn gold" data-close>Continuar</button></div></div>
        <button class="btn ghost sm" data-skip style="position:fixed;top:calc(env(safe-area-inset-top,0px) + 14px);right:max(14px,env(safe-area-inset-right,0px))">Saltar</button></div>`,
      onShow: (el) => {
        const orb = el.querySelector('[data-orb]'), timers = [];
        const T = (fn, ms) => timers.push(setTimeout(fn, ms));
        let revealed = false;
        App.snd('charge');
        orb.style.setProperty('--oc', oc[Math.min(1, maxR)]);
        if (maxR >= 2) T(() => orb.style.setProperty('--oc', oc[2]), 480);
        if (maxR >= 3) T(() => orb.style.setProperty('--oc', oc[3]), 860);
        if (maxR >= 4) T(() => orb.classList.add('r4'), 1040);
        const reveal = (fast) => {
          if (revealed) return; revealed = true;
          timers.forEach(clearTimeout);
          el.querySelector('[data-ph1]').hidden = true; el.querySelector('[data-ph2]').hidden = false;
          FX.flash(maxR >= 3 ? 'gold' : 'white');
          FX.burst(innerWidth / 2, innerHeight / 2, [oc[maxR], '#fff', '#ffe066'], maxR >= 3 ? 70 : 36, { speed: 9 });
          App.snd('gacha', maxR); if (maxR >= 3) { FX.shake('shake-big'); App.vib([40, 30, 120]); }
          const cs = Array.from(el.querySelectorAll('.gcard'));
          let t = fast ? 0 : 250;
          cs.forEach((c, i) => {
            const r = res[i].r;
            if (!fast && r >= 3) t += 380;
            setTimeout(() => {
              c.classList.add('flip');
              if (!fast) { App.snd(r >= 2 ? 'claim' : 'flip'); if (r >= 2) { const p = FX.rectOf(c); FX.burst(p.x, p.y, [oc[r], '#fff'], r >= 3 ? 30 : 12, { speed: 5 }); } }
            }, t);
            t += fast ? 0 : 160;
          });
          setTimeout(() => { el.querySelector('[data-sum]').hidden = false; el.querySelector('[data-end]').hidden = false; const sk = el.querySelector('[data-skip]'); if (sk) sk.remove(); if (maxR >= 3) FX.confetti(); const b = el.querySelector('[data-close]'); if (b) b.focus({ preventScroll: true }); }, t + 300);
        };
        T(() => reveal(false), maxR >= 3 ? 1450 : 1150);
        el.querySelector('[data-skip]').addEventListener('click', () => {
          if (!revealed) reveal(true);
          else el.querySelectorAll('.gcard').forEach(c => c.classList.add('flip'));
        });
      },
      onClose: after
    });
  };

  /* ---------- INVENTARIO ---------- */
  UI.screens.inv = () => {
    const S = App.S, h = S.hero, t = App.tab.inv, rar = App.tab.rar;
    const slot = s => { const id = h.eq[s]; const d = id && S.inv[id] ? E.itemDef(S, id) : null; return d ? `<button class="slot filled rar-${d.r}" data-act="item" data-id="${id}" aria-label="${D.SLOTS[s]}: ${esc(d.n)}">${A.item(S, id)}<span>${D.SLOTS[s]}</span></button>` : `<button class="slot" data-act="tab" data-k="inv" data-t="${s}">${A.icon('plus')}<span>${D.SLOTS[s]}</span></button>`; };
    const m = E.mods(S), pc = v => '+' + Math.round(v * 100) + '%';
    const bon = [];
    D.ATTR_KEYS.forEach(k => { const v = m.xp[k] + m.all; if (v > 0.001) bon.push([`XP de ${D.ATTRS[k].n}`, pc(v)]); });
    if (m.gold) bon.push(['Oro', pc(m.gold)]); if (m.def) bon.push(['Defensa', pc(m.def).replace('+', '−').replace('%', '% daño')]);
    bon.push(['Crítico', Math.round(m.crit * 100) + '%']); if (m.regen) bon.push(['Regeneración', '+' + m.regen + ' HP/hábito']); if (m.boss) bon.push(['Daño a jefes', pc(m.boss)]); if (m.mission) bon.push(['XP de misiones', pc(m.mission)]); if (m.heal) bon.push(['Curación Vitalidad', pc(m.heal)]); if (m.ritual) bon.push(['Ritual', '−' + m.ritual + ' días']);
    const types = [['all', 'Todo'], ['weapon', 'Armas'], ['armor', 'Armaduras'], ['accessory', 'Accesorios'], ['pet', 'Mascotas'], ['cosm', 'Skins y títulos']];
    let grid = '';
    if (t === 'cosm') {
      const outfits = Object.keys(D.SKINS).filter(k => D.SKINS[k].k === 'outfit'), auras = Object.keys(D.SKINS).filter(k => D.SKINS[k].k === 'aura');
      const sk = (id, cur) => { const s = D.SKINS[id], own = S.owned.skins.indexOf(id) >= 0; return `<button class="icard rar-3 ${own ? '' : 'locked'}" ${own ? `data-act="${cur === id ? 'clearSkin' : 'skin'}" data-id="${id}" data-k="${s.k}"` : 'disabled'} title="${esc(s.src)}">${cur === id ? '<span class="eqd">EN USO</span>' : ''}${A.skinThumb(id)}<span class="iname">${esc(s.n)}</span><span class="tiny dim">${own ? (cur === id ? 'Tocar para quitar' : 'Tocar para usar') : esc(s.src)}</span></button>`; };
      grid = `<h3>Skins de atuendo</h3><div class="inv-grid">${outfits.map(id => sk(id, h.skin)).join('')}</div><h3>Auras</h3><div class="inv-grid">${auras.map(id => sk(id, h.aura)).join('')}</div>
        <h3>Títulos</h3><div class="opts">${Object.keys(D.TITLES).map(k => { const own = S.owned.titles.indexOf(k) >= 0; return `<button class="opt ${h.title === k ? 'on' : ''}" ${own ? `data-act="title" data-t="${k}"` : 'disabled style="opacity:.4"'}>${own ? '' : A.icon('lock')}${esc(D.TITLES[k])}</button>`; }).join('')}</div>`;
    } else {
      const ids = Object.keys(S.inv).filter(id => { const d = E.itemDef(S, id); return d && (t === 'all' || d.slot === t) && (rar < 0 || d.r === rar); })
        .sort((a, b) => E.itemDef(S, b).r - E.itemDef(S, a).r || E.itemDef(S, a).n.localeCompare(E.itemDef(S, b).n));
      const eqd = Object.values(h.eq);
      grid = ids.length ? `<div class="inv-grid">${ids.map(id => { const d = E.itemDef(S, id), lv = S.inv[id].lvl; return `<button class="icard rar-${d.r}" data-act="item" data-id="${id}">${eqd.indexOf(id) >= 0 ? '<span class="eqd">EQUIPADO</span>' : ''}${lv ? `<span class="lv">+${lv}</span>` : ''}${A.item(S, id)}<span class="iname">${esc(d.n)}</span>${stars(d.r)}</button>`; }).join('')}</div>`
        : `<div class="panel"><p class="muted" style="margin:0 0 10px">Aún no tienes objetos de este tipo.</p><button class="btn gold" data-act="nav" data-v="gacha">${A.icon('gem')}Ir al Gacha</button></div>`;
    }
    const total = D.ITEMS.filter(i => i.src !== 'memorial').length, own = Object.keys(S.inv).filter(id => id.indexOf('x_memorial') !== 0).length;
    return `<div class="screen home-grid"><div class="col">${UI.stage({ noTap: true })}<div class="slots">${['weapon', 'armor', 'accessory', 'pet'].map(slot).join('')}</div>
      <div class="panel tight"><b class="small">Bonificaciones activas</b><div class="bonus-list" style="margin-top:8px">${bon.map(([k, v]) => `<div class="bonus"><span>${k}</span><b>${v}</b></div>`).join('')}</div>${S.legacy.xpBonus ? `<div class="tiny muted" style="margin-top:6px">Incluye +${Math.round(S.legacy.xpBonus * 100)}% de XP del Legado.</div>` : ''}</div></div>
      <div class="col"><div class="sec-title"><h2>Inventario</h2><span class="chip">Colección ${own}/${total}</span></div>
      <div class="tabs">${types.map(([k, n]) => `<button class="${t === k ? 'on' : ''}" data-act="tab" data-k="inv" data-t="${k}">${n}</button>`).join('')}</div>
      ${t === 'cosm' ? '' : `<div class="opts"><button class="opt ${rar < 0 ? 'on' : ''}" data-act="tab" data-k="rar" data-t="-1">Todas</button>${D.RARITY.map((r, i) => `<button class="opt ${rar === i ? 'on' : ''}" data-act="tab" data-k="rar" data-t="${i}" style="--oc:${r.c}">${r.n}</button>`).join('')}</div>`}
      ${grid}</div></div>`;
  };
  UI.itemSheet = id => {
    const S = App.S, h = S.hero, d = E.itemDef(S, id); if (!d) return;
    const lv = S.inv[id].lvl || 0, k = d.b.ritual ? 1 : 1 + 0.2 * lv, pc = v => '+' + Math.round(v * k * 100) + '%';
    const lines = [];
    if (d.b.xp) Object.keys(d.b.xp).forEach(a => lines.push(`XP de ${D.ATTRS[a].n} ${pc(d.b.xp[a])}`));
    if (d.b.all) lines.push(`XP de todo ${pc(d.b.all)}`); if (d.b.gold) lines.push(`Oro ${pc(d.b.gold)}`); if (d.b.def) lines.push(`Defensa: −${Math.round(d.b.def * k * 100)}% de daño`);
    if (d.b.crit) lines.push(`Probabilidad de crítico ${pc(d.b.crit)}`); if (d.b.regen) lines.push(`Regenera ${Math.round(d.b.regen * k)} HP por hábito`); if (d.b.boss) lines.push(`Daño a jefes ${pc(d.b.boss)}`); if (d.b.ritual) lines.push(`Ritual de Resurrección ${d.b.ritual} días más corto`);
    const equipped = h.eq[d.slot] === id, cost = E.upgradeCost(S, id), forge = E.unlocked(S, 'forge');
    App.sheet(esc(d.n), `<div class="icard rar-${d.r}" style="max-width:200px;margin:0 auto;width:100%">${lv ? `<span class="lv">+${lv}</span>` : ''}${A.item(S, id)}</div>
      <div class="row wrap" style="justify-content:center"><span class="chip rar-${d.r}" style="color:var(--rc)">${D.RARITY[d.r].n} ${stars(d.r)}</span><span class="chip">${D.SLOTS[d.slot]}</span>${d.src !== 'gacha' ? '<span class="chip" style="background:#5a2bd6">Exclusivo</span>' : ''}</div>
      ${d.d ? `<p class="small muted" style="margin:0;text-align:center">${esc(d.d)}</p>` : ''}
      <div class="col" style="gap:4px">${lines.map(l => `<div class="bonus"><span>${l}</span></div>`).join('')}</div>
      <div class="row wrap" style="justify-content:center">${equipped ? `<button class="btn ghost" data-act="unequip" data-slot="${d.slot}">Quitar</button>` : `<button class="btn gold" data-act="equip" data-id="${id}">${A.icon('check')}Equipar</button>`}
      ${d.b.ritual ? '' : forge ? (cost === null ? '<span class="chip">Nivel máximo +5</span>' : `<button class="btn" data-act="upgrade" data-id="${id}" ${h.dust < cost ? 'disabled' : ''}>${A.icon('hammer')}Mejorar a +${lv + 1}<span class="cost">${A.cur('dust', 16)}${cost}</span></button>`) : `<span class="tag-lock">${A.icon('lock')}Forja en nivel ${E.unlockLevel('forge')}</span>`}</div>
      ${forge && !d.b.ritual ? `<p class="tiny dim" style="margin:0;text-align:center">Cada mejora suma +20% a todos sus bonus. Tienes ${fmt(h.dust)} de polvo.</p>` : ''}`);
  };

  /* ---------- TIENDA ---------- */
  UI.screens.shop = () => {
    const S = App.S, h = S.hero, t = App.tab.shop;
    const tabs = `<div class="tabs"><button class="${t === 'items' ? 'on' : ''}" data-act="tab" data-k="shop" data-t="items">Objetos</button><button class="${t === 'real' ? 'on' : ''}" data-act="tab" data-k="shop" data-t="real">Recompensas reales</button><button class="${t === 'hist' ? 'on' : ''}" data-act="tab" data-k="shop" data-t="hist">Canjeadas</button></div>`;
    let body = '';
    if (t === 'items') {
      if (!E.unlocked(S, 'shop')) body = lock(E.unlockLevel('shop'), 'La tienda de objetos');
      else {
        const disc = E.mods(S).shop;
        body = `<div class="row sp-between"><p class="small muted" style="margin:0">Nuevos artículos cada día.${disc ? ` <b style="color:var(--gold)">Mercader Errante: −${Math.round(disc * 100)}%</b>` : ''}</p>${timer(E.endOfDay(App.now()), 'Rota en')}</div>
          <div class="col">${S.shop.slots.map((s, i) => {
            const isItem = s.k === 'item', d = isItem ? D.ITEM[s.id] : D.SHOP_ITEMS[s.k], price = E.shopPrice(S, s), max = E.shopMax(s), left = max - s.sold;
            const owned = isItem && S.inv[s.id];
            const art = isItem ? `<div style="width:56px;flex:none" class="rar-${d.r}">${A.item(S, s.id)}</div>` : `<div class="mico" style="background:#5a2bd6">${A.icon(d.ic)}</div>`;
            return `<div class="mission">${art}<div class="grow"><b class="small ${isItem ? 'rar-' + d.r + ' rtxt' : ''}">${esc(d.n)}</b><div class="tiny muted">${isItem ? D.RARITY[d.r].n + ' · ' + D.SLOTS[d.slot] : esc(d.d)}${max > 1 ? ` · Quedan ${left}` : ''}</div></div><button class="btn sm ${left > 0 && !owned ? 'gold' : ''}" data-act="buy" data-i="${i}" ${left <= 0 || owned || h.gold < price || h.status !== 'alive' ? 'disabled' : ''}>${owned ? 'Ya lo tienes' : left <= 0 ? 'Agotado' : `${A.cur('gold', 16)}${fmt(price)}`}</button></div>`;
          }).join('')}</div>`;
      }
    } else if (t === 'real') {
      body = `<p class="small muted" style="margin:0">Define premios de la vida real y su precio en oro. Cuando los canjees, ¡date ese gusto sin culpa!</p>
        <div class="col">${S.real.map(r => `<div class="mission"><div class="mico" style="background:#ff8f1f">${A.icon(r.ic)}</div><div class="grow"><b class="small">${esc(r.n)}</b><div class="tiny muted row">${A.cur('gold', 14)}${fmt(r.price)} oro</div></div><button class="icon-btn" data-act="realForm" data-id="${r.id}" aria-label="Editar ${esc(r.n)}">${A.icon('edit')}</button><button class="btn sm gold" data-act="real" data-id="${r.id}" ${h.gold < r.price || h.status !== 'alive' ? 'disabled' : ''}>Canjear</button></div>`).join('')}</div>
        <button class="btn block" data-act="realForm">${A.icon('plus')}Nueva recompensa</button>`;
    } else {
      body = S.realHist.length ? `<div class="panel" style="padding-block:4px">${S.realHist.slice(0, 60).map(r => `<div class="list-row">${A.icon(r.ic)}<div class="grow"><b class="small">${esc(r.n)}</b><div class="tiny muted">${new Date(r.t).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</div></div><span class="pill">${A.cur('gold', 16)}${fmt(r.price)}</span></div>`).join('')}</div>` : `<div class="panel muted">Todavía no has canjeado recompensas reales.</div>`;
    }
    return `<div class="screen"><div class="sec-title"><h2>Tienda</h2><span class="pill">${A.cur('gold', 18)}<span class="num">${fmt(h.gold)}</span></span></div>${tabs}${body}</div>`;
  };
  UI.realSheet = id => {
    const S = App.S, r = id ? S.real.find(x => x.id === id) : null;
    const f = r ? { id: r.id, n: r.n, price: r.price, ic: r.ic } : { n: '', price: 300, ic: 'gift' };
    const icons = ['gift', 'film', 'cake', 'gamepad', 'tea', 'burger', 'ticket', 'crown', 'music', 'shoe', 'book', 'moon', 'heart', 'star', 'coin', 'paint'];
    const body = () => `<div class="field"><label for="r-name">Recompensa</label><input id="r-name" class="input" maxlength="40" value="${esc(f.n)}" placeholder="Ej.: Ver una película"></div>
      <div class="field"><label for="r-price">Precio en oro</label><input id="r-price" class="input" type="number" inputmode="numeric" min="1" max="999999" value="${f.price}"></div>
      <div class="field"><span class="lbl">Ícono</span><div class="icon-grid">${icons.map(ic => `<button class="${f.ic === ic ? 'on' : ''}" data-ric="${ic}" aria-label="${ic}">${A.icon(ic)}</button>`).join('')}</div></div>
      <div class="row" style="justify-content:space-between">${r ? `<button class="btn red sm" data-act="realDel" data-id="${r.id}">${A.icon('trash')}Borrar</button>` : '<span></span>'}<button class="btn gold" data-rsave>${A.icon('check')}Guardar</button></div>`;
    App.sheet(r ? 'Editar recompensa' : 'Nueva recompensa', `<div class="col" data-rform>${body()}</div>`, {
      onShow: (el, close) => {
        const box = el.querySelector('[data-rform]');
        box.addEventListener('input', e => { if (e.target.id === 'r-name') f.n = e.target.value; if (e.target.id === 'r-price') f.price = e.target.value; });
        box.addEventListener('click', e => {
          const b = e.target.closest('[data-ric]'); if (b) { f.ic = b.dataset.ric; box.innerHTML = body(); return; }
          if (e.target.closest('[data-rsave]')) { const res = E.saveReal(App.S, f); if (!res.ok) return App.err(res.err); App.save(); close(); App.toast(A.icon('check') + '<span>Recompensa guardada</span>'); }
        });
      }
    });
  };

  /* ---------- ESTADÍSTICAS ---------- */
  const roundTop = (x, y, w, h, r) => { r = Math.min(r, w / 2, h); return h <= 0 ? '' : `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`; };
  const nice = v => { if (v <= 5) return 5; const p = Math.pow(10, Math.floor(Math.log10(v))), n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; };
  UI.barChart = (rows, series, o) => {
    const W = 380, H = 190, L = 34, R = 6, T = 12, B = 24, iw = W - L - R, ih = H - T - B;
    const max = nice(Math.max(1, ...rows.map(r => Math.max(...series.map(s => r[s.k] || 0)))));
    const n = rows.length, slot = iw / n, gap = 2, bw = Math.max(3, Math.min(22, (slot - 6) / series.length - gap));
    const grid = [0, 0.5, 1].map(f => { const y = T + ih - f * ih; return `<line x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text x="${L - 6}" y="${y + 3.5}" text-anchor="end">${fmt(max * f)}</text>`; }).join('');
    const bars = rows.map((r, i) => {
      const cx = L + slot * i + slot / 2, tw = series.length * bw + (series.length - 1) * gap;
      return series.map((s, j) => { const v = r[s.k] || 0, hh = v / max * ih, x = cx - tw / 2 + j * (bw + gap); return `<path d="${roundTop(x, T + ih - hh, bw, hh, 4)}" fill="${s.c}"/><rect x="${cx - slot / 2}" y="${T}" width="${slot}" height="${ih}" fill="transparent" data-tip="${esc(r.tip || r.l)}"/>`; }).join('')
        + ((n <= 10 || i % 2 === (n - 1) % 2) ? `<text x="${cx}" y="${H - 8}" text-anchor="middle">${esc(r.l)}</text>` : '');
    }).join('');
    const legend = series.length > 1 ? `<div class="legend">${series.map(s => `<span><i style="background:${s.c}"></i>${s.n}</span>`).join('')}</div>` : '';
    return `${legend}<div class="chart-wrap"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label)}"><g class="grid">${grid}</g><line x1="${L}" x2="${W - R}" y1="${T + ih}" y2="${T + ih}" stroke="rgba(185,176,228,.4)"/>${bars}</svg></div>`;
  };
  UI.radar = (cur, past) => {
    const W = 300, H = 270, cx = 150, cy = 140, R = 95, keys = D.ATTR_KEYS;
    const max = Math.max(5, ...keys.map(k => Math.max(cur[k], past ? past[k] : 0)));
    const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; return [cx + Math.cos(a) * R * v / max, cy + Math.sin(a) * R * v / max]; };
    const ring = f => keys.map((k, i) => pt(i, max * f).join(',')).join(' ');
    const poly = (vals, col, dash) => `<polygon points="${keys.map((k, i) => pt(i, vals[k]).join(',')).join(' ')}" fill="${col}" fill-opacity="${dash ? 0 : 0.28}" stroke="${col}" stroke-width="2" ${dash ? 'stroke-dasharray="5 4"' : ''}/>`;
    const labels = keys.map((k, i) => { const [x, y] = pt(i, max * 1.2); return `<text x="${x}" y="${y + 4}" text-anchor="middle" style="font-size:12px;fill:var(--ink)">${D.ATTRS[k].short} ${cur[k]}</text>`; }).join('');
    const dots = keys.map((k, i) => { const [x, y] = pt(i, cur[k]); return `<circle cx="${x}" cy="${y}" r="4" fill="${CH.now}" stroke="#1d1430" stroke-width="2"><title>${D.ATTRS[k].n}: nivel ${cur[k]}${past ? ' (hace 30 días: ' + past[k] + ')' : ''}</title></circle>`; }).join('');
    return `<div class="legend"><span><i style="background:${CH.now}"></i>Hoy</span>${past ? `<span><i style="background:${CH.past}"></i>Hace 30 días</span>` : ''}</div><svg class="chart" viewBox="0 0 ${W} ${H}" style="max-width:360px;margin:0 auto" role="img" aria-label="Gráfico radar de atributos"><g class="grid">${[0.33, 0.66, 1].map(f => `<polygon points="${ring(f)}" fill="none" stroke="rgba(185,176,228,.18)"/>`).join('')}${keys.map((k, i) => { const [x, y] = pt(i, max); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`; }).join('')}</g>${past ? poly(past, CH.past, true) : ''}${poly(cur, CH.now)}${dots}${labels}</svg>`;
  };
  UI.screens.stats = () => {
    const S = App.S, h = S.hero, st = S.stats, today = E.dayKey(App.now());
    const wd = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
    const days14 = []; for (let i = 13; i >= 0; i--) { const k = E.addDays(today, -i), d = S.days[k] || {}, dt = E.dayDate(k); days14.push({ k, l: i === 0 ? 'hoy' : String(dt.getDate()), xp: d.xp || 0, g: d.g || 0, b: d.b || 0, tip: `${wd[E.weekday(k)]} ${dt.getDate()}: ${d.xp || 0} XP · ${d.g || 0} cumplidos · ${d.b || 0} malos` }); }
    const weeks = []; const wk0 = E.weekKey(today);
    for (let i = 7; i >= 0; i--) { const wk = E.addDays(wk0, -7 * i); let xp = 0, g = 0; for (let j = 0; j < 7; j++) { const d = S.days[E.addDays(wk, j)]; if (d) { xp += d.xp || 0; g += d.g || 0; } } const dt = E.dayDate(wk); weeks.push({ l: dt.getDate() + '/' + (dt.getMonth() + 1), xp, tip: `Semana del ${dt.getDate()}/${dt.getMonth() + 1}: ${fmt(xp)} XP · ${g} hábitos` }); }
    const cur = {}; D.ATTR_KEYS.forEach(k => { cur[k] = h.attrs[k].lvl; });
    let past = null; for (let i = 30; i >= 25 && !past; i--) { const d = S.days[E.addDays(today, -i)]; if (d && d.at) past = d.at; }
    // mapa de calor: 18 semanas
    const start = E.addDays(E.weekKey(today), -7 * 17); let heat = '';
    for (let i = 0; i < 18 * 7; i++) {
      const k = E.addDays(start, i), d = S.days[k], dt = E.dayDate(k);
      if (k > today) { heat += '<i style="visibility:hidden"></i>'; continue; }
      const g = d ? d.g : 0, lv = g === 0 ? 0 : g <= 2 ? 1 : g <= 4 ? 2 : g <= 6 ? 3 : 4;
      heat += `<i class="l${lv} ${d && d.perf ? 'perf' : ''} ${d && d.b ? 'badday' : ''}" data-tip="${wd[E.weekday(k)]} ${dt.getDate()}/${dt.getMonth() + 1}: ${g} cumplidos${d && d.b ? ', ' + d.b + ' malos' : ''}${d && d.perf ? ' · Día Perfecto' : ''}"></i>`;
    }
    const streaks = S.habits.filter(x => x.type === 'good' && (x.st || x.bs)).sort((a, b) => b.st - a.st || b.bs - a.bs).slice(0, 6);
    const badAgg = {}; for (let i = 0; i < 30; i++) { const d = S.days[E.addDays(today, -i)]; if (d && d.bad) Object.keys(d.bad).forEach(id => { badAgg[id] = (badAgg[id] || 0) + d.bad[id]; }); }
    const badRows = Object.keys(badAgg).map(id => ({ id, n: badAgg[id], h: E.habit(S, id) })).filter(x => x.h).sort((a, b) => b.n - a.n).slice(0, 6);
    const badMax = Math.max(1, ...badRows.map(x => x.n));
    const kpi = (v, l) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`;
    const empty = !Object.keys(S.days).length;
    return `<div class="screen"><div class="sec-title"><h2>Estadísticas</h2></div>
      <div class="kpis">${kpi(fmt(st.habits), 'Hábitos cumplidos')}${kpi(st.maxStreak, 'Racha más larga')}${kpi(st.perfectDays, 'Días perfectos')}${kpi(st.bad, 'Malos hábitos')}${kpi(fmt(st.xp), 'XP total')}${kpi(fmt(st.goldEarned), 'Oro ganado')}${kpi(st.pulls, 'Tiradas de gacha')}${kpi(st.realRewards, 'Recompensas reales')}</div>
      ${empty ? '<div class="panel muted">Cumple tu primer hábito para ver tus gráficas.</div>' : ''}
      <div class="panel col"><h3>XP por día · últimos 14 días</h3>${UI.barChart(days14, [{ k: 'xp', c: CH.good, n: 'XP' }], { label: 'XP por día' })}</div>
      <div class="panel col"><h3>XP por semana · últimas 8 semanas</h3>${UI.barChart(weeks, [{ k: 'xp', c: CH.good, n: 'XP' }], { label: 'XP por semana' })}</div>
      <div class="panel col"><h3>Hábitos cumplidos y malos hábitos</h3>${UI.barChart(days14, [{ k: 'g', c: CH.good, n: 'Cumplidos' }, { k: 'b', c: CH.bad, n: 'Malos hábitos' }], { label: 'Hábitos cumplidos y malos hábitos por día' })}</div>
      <div class="panel col"><h3>Atributos</h3>${UI.radar(cur, past)}${past ? '' : '<p class="tiny dim" style="margin:0;text-align:center">La comparación con hace 30 días aparecerá cuando tengas un mes de historial.</p>'}</div>
      <div class="panel col"><h3>Calendario de actividad</h3><div class="heat" role="img" aria-label="Mapa de calor de las últimas 18 semanas">${heat}</div><div class="legend"><span>Menos</span><span><i style="background:#0d0920"></i><i style="background:#2c2366"></i><i style="background:#4a3aa8"></i><i style="background:#7a63e0"></i><i style="background:#b9a6ff"></i></span><span>Más</span><span><i style="box-shadow:0 0 0 1.5px #ffe066 inset;background:#4a3aa8"></i>Día perfecto</span><span><i style="outline:2px solid #ff4d6d;outline-offset:-2px;background:#0d0920"></i>Con malos hábitos</span></div></div>
      <div class="panel col"><h3>Rachas</h3>${streaks.length ? streaks.map(x => `<div class="list-row"><span class="streak ${x.st >= 7 ? 'hot' : ''}">${A.icon('flame')}</span><div class="grow"><b class="small">${esc(x.n)}</b><div class="tiny muted">Actual ${x.st} · Mejor ${x.bs}</div></div><span class="chip">x${E.streakMult(x.st)}</span></div>`).join('') : '<p class="small muted" style="margin:0">Aún no tienes rachas. Cumple el mismo hábito varios días seguidos.</p>'}
        <p class="tiny dim" style="margin:0">Multiplicadores: x1.1 a los 3 días · x1.25 a los 7 · x1.35 a los 14 · x1.5 a los 30 · x1.65 a los 60 · x1.8 a los 100.</p></div>
      <div class="panel col"><h3>Malos hábitos más registrados · 30 días</h3>${badRows.length ? badRows.map(x => `<div><div class="row sp-between small"><span>${esc(x.h.n)}</span><b class="num">${x.n}</b></div><div class="prog" style="border-color:transparent"><i style="width:${(x.n / badMax * 100).toFixed(0)}%;background:${CH.bad}"></i></div></div>`).join('') : '<p class="small muted" style="margin:0">¡Ningún mal hábito en los últimos 30 días!</p>'}</div></div>`;
  };

  /* ---------- LOGROS ---------- */
  UI.screens.ach = () => {
    const S = App.S, got = Object.keys(S.ach).length;
    const items = D.ACHIEVEMENTS.map(a => {
      const on = !!S.ach[a.id], hide = a.sec && !on;
      const prog = !on && !a.sec ? Math.min(a.v, E.metric(S, a.m)) : null;
      return `<div class="ach ${on ? 'on' : ''}" title="${hide ? 'Logro secreto' : esc(a.d)}"><div class="badge">${A.icon(hide ? 'lock' : a.ic)}</div><b>${hide ? '???' : esc(a.n)}</b><small>${hide ? 'Logro secreto' : esc(a.d)}</small>${on ? `<small style="color:var(--gold)">${new Date(S.ach[a.id]).toLocaleDateString('es-CO')}</small>` : prog !== null && a.v > 1 ? `<small class="num">${fmt(prog)}/${fmt(a.v)}</small>` : ''}${!hide ? UI.rwChips(a.rw, { center: 1 }).replace('rw-list', 'rw-list tiny') : ''}</div>`;
    }).join('');
    return `<div class="screen"><div class="sec-title"><h2>Logros</h2><span class="chip">${got}/${D.ACHIEVEMENTS.length}</span></div><div class="prog" style="height:12px"><i style="width:${(got / D.ACHIEVEMENTS.length * 100).toFixed(1)}%"></i></div><p class="small muted" style="margin:0">Algunos logros son secretos. Los logros se conservan aunque tu héroe muera para siempre.</p><div class="ach-grid">${items}</div></div>`;
  };

  /* ---------- AJUSTES ---------- */
  UI.screens.settings = () => {
    const S = App.S, st = S.settings, r = st.reminders, perm = App.notifSupport() ? Notification.permission : 'no';
    const sw = (on, act, label) => `<button class="switch ${on ? 'on' : ''}" data-act="${act}" role="switch" aria-checked="${on}" aria-label="${label}"></button>`;
    const canShare = !!(navigator.canShare && G.File);
    return `<div class="screen"><div class="sec-title"><h2>Ajustes</h2></div>
      ${App.storageOk === false ? `<div class="low-hp-warn">${A.icon('info')}<span>Este navegador no permite guardar datos aquí. Tu progreso se perderá al cerrar. Exporta un respaldo con frecuencia.</span></div>` : ''}
      <div class="panel col"><h3>Sonido y vibración</h3>
        <div class="list-row"><div class="grow"><b>Efectos de sonido</b><div class="tiny muted">Generados en vivo, sin archivos.</div></div>${sw(st.sound, 'sound', 'Sonido')}</div>
        <div class="list-row"><label for="set-vol" class="grow"><b>Volumen</b></label><input id="set-vol" type="range" min="0" max="1" step="0.05" value="${st.volume}" style="max-width:180px"></div>
        <div class="list-row"><div class="grow"><b>Vibración</b><div class="tiny muted">Solo en teléfonos compatibles.</div></div>${sw(st.haptics, 'haptics', 'Vibración')}</div></div>
      <div class="panel col"><h3>Recordatorios</h3>
        <div class="list-row"><div class="grow"><b>Notificaciones de hábitos</b><div class="tiny muted">${perm === 'granted' ? 'Permiso concedido' : perm === 'denied' ? 'Permiso bloqueado en el navegador' : perm === 'no' ? 'No disponible en este navegador' : 'Se pedirá permiso al activarlas'}</div></div>${sw(r.on, 'notif', 'Recordatorios')}</div>
        ${r.times.map((t, i) => `<div class="list-row"><label class="grow" for="rt-${i}">Recordatorio ${i + 1}</label><input id="rt-${i}" class="input" type="time" value="${t}" data-rtime="${i}" style="max-width:140px"><button class="icon-btn" data-act="notifDel" data-i="${i}" aria-label="Quitar recordatorio">${A.icon('trash')}</button></div>`).join('')}
        <div class="row wrap"><button class="btn sm ghost" data-act="notifAdd" ${r.times.length >= 6 ? 'disabled' : ''}>${A.icon('plus')}Añadir hora</button><button class="btn sm" data-act="notifTest">${A.icon('bell')}Probar</button></div>
        <details><summary class="small" style="cursor:pointer;font-weight:800">Cómo funcionan y sus límites</summary><div class="small muted col" style="gap:6px;margin-top:8px">
          <p style="margin:0">LifeMOD no usa servidores, así que los recordatorios son <b>locales</b>: la app te avisa a la hora elegida si tienes hábitos pendientes.</p>
          <p style="margin:0"><b>Android y PC (Chrome/Edge):</b> funcionan mientras la app esté abierta o en segundo plano. Si la instalas, Chrome puede además enviarte un aviso periódico aunque esté cerrada (lo decide el sistema según tu uso; no es a una hora exacta).</p>
          <p style="margin:0"><b>iPhone/iPad:</b> requiere iOS 16.4 o superior y tener la app <b>instalada en la pantalla de inicio</b> (desde Safari: Compartir → «Agregar a inicio»). Abre la app instalada y activa aquí los recordatorios. iOS solo entrega notificaciones mientras la app está abierta o suspendida recientemente; con la app cerrada por completo no hay avisos locales programados.</p>
          <p style="margin:0">Si un recordatorio no llega, al abrir la app verás tus hábitos pendientes igualmente.</p></div></details></div>
      <div class="panel col"><h3>Instalar la app</h3>
        ${App.inArtifact ? `<p class="small muted" style="margin:0">Esta es la versión de prueba incrustada. Para instalarla en tu celular y usarla sin conexión, publica el paquete .zip en un hosting gratuito (GitHub Pages o Netlify) y ábrela desde allí.</p><button class="btn ghost sm" data-act="install">${A.icon('info')}Cómo instalar</button>` : App.isStandalone() ? `<p class="small" style="margin:0;color:var(--green)">${A.icon('check')} LifeMOD está instalada y funciona sin conexión.</p>` : `<p class="small muted" style="margin:0">Instálala para abrirla como una app desde tu pantalla de inicio y usarla sin internet.</p><button class="btn gold" data-act="install">${A.icon('install')}${App.deferredPrompt ? 'Instalar ahora' : 'Cómo instalar'}</button>`}</div>
      <div class="panel col"><h3>Respaldo</h3><p class="small muted" style="margin:0">Tus datos solo existen en este dispositivo. Guarda un respaldo de vez en cuando para no perder tu progreso.</p>
        <div class="row wrap">${App.inArtifact ? '' : `<button class="btn sm" data-act="exportFile">${A.icon('download')}Descargar archivo</button>`}${canShare && !App.inArtifact ? `<button class="btn sm" data-act="exportShare">${A.icon('share')}Compartir</button>` : ''}<button class="btn sm ghost" data-act="exportCopy">${A.icon('copy')}Copiar respaldo</button></div>
        <div class="row wrap"><label class="btn sm ghost" for="import-file" style="cursor:pointer">${A.icon('upload')}Importar archivo</label><input id="import-file" type="file" accept="application/json,.json" hidden><button class="btn sm ghost" data-act="importText">${A.icon('edit')}Pegar respaldo</button></div></div>
      <div class="panel col"><h3>Legado</h3><p class="small muted" style="margin:0">${S.legacy.heroes.length ? `Héroes caídos: ${S.legacy.heroes.length} · Bonus de XP permanente: +${Math.round(S.legacy.xpBonus * 100)}%` : 'Ningún héroe ha muerto para siempre. Que siga así.'}</p>${S.legacy.heroes.length ? `<button class="btn sm ghost" data-act="legacy">${A.icon('tomb')}Ver Salón del Legado</button>` : ''}</div>
      <div class="panel col"><h3>Zona peligrosa</h3><button class="btn red" data-act="reset">${A.icon('trash')}Reiniciar todo</button></div>
      ${st.dev ? `<div class="panel col"><h3>Herramientas de prueba</h3><p class="tiny muted" style="margin:0">Para probar el juego: alteran el progreso.</p><div class="row wrap"><button class="btn sm" data-act="dev" data-k="day">Avanzar 1 día</button><button class="btn sm" data-act="dev" data-k="xp">Subir 1 nivel</button><button class="btn sm" data-act="dev" data-k="gems">+1000 gemas</button><button class="btn sm" data-act="dev" data-k="gold">+2000 oro</button><button class="btn sm" data-act="dev" data-k="event">Forzar evento</button><button class="btn sm red" data-act="dev" data-k="hurt">Recibir daño</button><button class="btn sm ghost" data-act="dev" data-k="off">Ocultar</button></div></div>` : ''}
      <p class="tiny dim" style="text-align:center;margin:0" data-act="devTap">LifeMOD v1.1 · Datos guardados solo en tu dispositivo</p></div>`;
  };
  UI.moreSheet = () => {
    const it = (v, ic, n) => `<button data-act="nav" data-v="${v}">${A.icon(ic)}<span>${n}</span></button>`;
    App.sheet('Más', `<div class="more-grid">${it('habits', 'list', 'Hábitos')}${it('shop', 'shop', 'Tienda')}${it('stats', 'chart', 'Estadísticas')}${it('ach', 'trophy', 'Logros')}${it('settings', 'gear', 'Ajustes')}<button data-act="legacy">${A.icon('tomb')}<span>Legado</span></button></div>`);
  };
  UI.resetSheet = () => {
    App.sheet('Reiniciar todo', `<p class="small muted" style="margin:0">Se borrarán tu personaje, objetos, hábitos, estadísticas, logros y Legado. Esta acción no se puede deshacer. Escribe <b>BORRAR</b> para confirmar.</p><input id="reset-c" class="input" autocomplete="off" placeholder="BORRAR"><button class="btn red" data-reset-ok disabled>Borrar todos mis datos</button>`, {
      onShow: (el, close) => {
        const i = el.querySelector('#reset-c'), b = el.querySelector('[data-reset-ok]');
        i.addEventListener('input', () => { b.disabled = i.value.trim().toUpperCase() !== 'BORRAR'; });
        b.addEventListener('click', () => { App.S = E.newState(); App.ui.create = App.newCreate(); App.view = 'home'; App.save(); close(); App.toast(A.icon('check') + '<span>Datos borrados. ¡Nuevo comienzo!</span>'); });
      }
    });
  };
  UI.importSheet = () => {
    App.sheet('Pegar respaldo', `<p class="small muted" style="margin:0">Pega aquí el texto de un respaldo de LifeMOD (empieza con <code>{"app":"lifemod"</code>).</p><textarea id="imp-t" class="input" placeholder='{"app":"lifemod", ...}'></textarea><button class="btn gold" data-imp-ok>${A.icon('upload')}Importar</button>`, {
      onShow: (el) => el.querySelector('[data-imp-ok]').addEventListener('click', () => { const v = el.querySelector('#imp-t').value.trim(); if (!v) return App.err('Pega el texto del respaldo.'); App.importRaw(v); })
    });
  };
  UI.copySheet = json => {
    App.sheet('Copiar respaldo', `<p class="small muted" style="margin:0">Tu navegador no permitió copiar automáticamente. Selecciona todo el texto y cópialo en una nota o correo.</p><textarea id="cp-t" class="input" readonly>${esc(json)}</textarea>`, {
      onShow: (el) => { const t = el.querySelector('#cp-t'); setTimeout(() => { t.focus(); t.select(); }, 80); }, noFocus: true
    });
  };
  UI.installSheet = () => {
    App.sheet('Instalar LifeMOD', `<div class="col small">
      <div><b>iPhone / iPad (Safari)</b><ol style="margin:4px 0 0;padding-left:20px"><li>Abre la página de LifeMOD en Safari.</li><li>Toca el botón Compartir (cuadro con flecha).</li><li>Elige «Agregar a inicio» y confirma.</li></ol></div>
      <div><b>Android (Chrome)</b><ol style="margin:4px 0 0;padding-left:20px"><li>Abre la página en Chrome.</li><li>Toca el menú ⋮ → «Instalar aplicación» o «Agregar a la pantalla principal».</li></ol></div>
      <div><b>PC (Chrome / Edge)</b><ol style="margin:4px 0 0;padding-left:20px"><li>Haz clic en el ícono de instalar en la barra de direcciones.</li></ol></div>
      <p class="muted" style="margin:0">La instalación necesita que LifeMOD esté publicada en un sitio web (por ejemplo GitHub Pages o Netlify). Desde una vista previa incrustada el navegador no ofrece instalarla.</p></div>`);
  };
  UI.legacySheet = () => {
    const S = App.S, L = S.legacy;
    App.sheet('Salón del Legado', L.heroes.length ? `<p class="small muted" style="margin:0">Bonus de XP permanente: <b>+${Math.round(L.xpBonus * 100)}%</b> (5% por héroe caído, máximo 15%).</p><div class="col">${L.heroes.map(x => `<div class="mission"><div style="width:64px;flex:none">${A.hero(S, { look: x.look, eq: {}, fallen: true })}</div><div class="grow"><b>${esc(x.name)}</b><div class="tiny muted">${D.CLASSES[x.classId].n} · Nivel ${x.level}</div><div class="tiny dim">${new Date(x.born).toLocaleDateString('es-CO')} — ${new Date(x.died).toLocaleDateString('es-CO')}</div></div></div>`).join('')}</div>`
      : '<p class="muted" style="margin:0">Ningún héroe ha muerto para siempre todavía.</p>');
  };

  /* ---------- CREACIÓN DE PERSONAJE ---------- */
  UI.create = () => {
    const S = App.S, c = App.ui.create;
    const steps = `<div class="steps" aria-hidden="true">${[1, 2, 3].map(i => `<i class="${c.step >= i ? 'on' : ''}"></i>`).join('')}</div>`;
    const prev = A.hero(S, { look: c.look, eq: { weapon: { sword: 'w_madera', staff: 'w_aprendiz', lute: 'w_laud', hammer: 'w_martillo', dagger: 'w_daga' }[D.CLASSES[c.classId].weapon] }, expr: c.step === 3 ? 'joy' : null });
    if (c.step === 0) {
      const L = S.legacy;
      return `<div class="screen welcome"><div class="lumi" style="width:110px;height:110px">${A.lumi().replace('class="lumi"', 'style="width:100%;height:100%"')}</div><h1 class="logo-big">Life<span>MOD</span></h1>
        <p class="tagline">Tu vida es el juego. Cumple hábitos reales para subir de nivel, invocar equipo legendario y derrotar jefes. Si caes en malos hábitos… tu héroe sufre.</p>
        ${L.heroes.length ? `<div class="panel small" style="max-width:420px">${A.icon('tomb')} <b>Tu legado continúa.</b> ${esc(L.heroes[L.heroes.length - 1].name)} cayó para siempre, pero tu próximo héroe empieza con +${Math.round(L.xpBonus * 100)}% de XP y su Lápida conmemorativa.</div>` : ''}
        <button class="btn gold" style="min-width:240px;min-height:56px;font-size:18px" data-act="cStep" data-s="1">Crear mi héroe</button>
        <label class="small muted" for="import-file" style="cursor:pointer;text-decoration:underline">¿Tienes un respaldo? Impórtalo aquí</label><input id="import-file" type="file" accept="application/json,.json" hidden></div>`;
    }
    if (c.step === 1) {
      const cl = D.CLASSES[c.classId], sc = D.CLASS_SHOWCASE[c.classId];
      const gear = ['weapon', 'armor', 'accessory', 'pet'].map(k => D.ITEM[sc.eq[k]]);
      const hero = A.hero(S, { look: sc.look, eq: sc.eq, aura: sc.aura, expr: null });
      return `<div class="screen create">${steps}<h2>¿Quién eres, héroe?</h2>
        <div class="field"><label for="c-name">Nombre</label><input id="c-name" class="input" maxlength="18" value="${esc(c.name)}" placeholder="Escribe tu nombre" autocomplete="off"></div>
        <div class="field"><span class="lbl">Clase</span><div class="class-tabs" role="radiogroup" aria-label="Clase">${D.CLASS_KEYS.map(k => { const x = D.CLASSES[k]; return `<button class="${c.classId === k ? 'on' : ''}" style="--cc:${x.c}" data-act="cClass" data-id="${k}" role="radio" aria-checked="${c.classId === k}"><span class="cico">${A.icon(x.ic)}</span>${x.n}</button>`; }).join('')}</div></div>
        <div class="showcase" style="--cc:${cl.c}">
          <div class="stage">${UI.scene(false)}<div class="hero-wrap">${hero}<div class="pet-wrap">${A.pet(D.ITEM[sc.eq.pet].look)}</div></div>
            <div class="sc-top">${lvlBadge(99)}<div><b>${esc(sc.title)}</b><span>${cl.n} · Nivel 99</span></div></div>
            <div class="sc-tag">${A.icon('crown')}Equipo legendario de clase</div></div>
          <div class="sc-gear">${gear.map(g => `<span class="chip rar-${g.r}" title="${esc(g.d)}">${stars(g.r)} ${esc(g.n)}</span>`).join('')}</div>
        </div>
        <div class="panel class-info" style="--cc:${cl.c}"><div class="row"><span class="cico">${A.icon(cl.ic)}</span><div class="grow"><h3>${cl.n}</h3><div class="small muted">${esc(cl.d)}</div></div></div>
          <div class="bonus"><span>Bonus de XP</span><b>${cl.bon}</b></div><div class="bonus"><span>Habilidad pasiva</span><b>${cl.pas}</b></div>
          <p class="tiny dim" style="margin:0">Así luce un ${cl.n.toLowerCase()} en la cima de su leyenda. Empezarás desde el nivel 1, pero todo este equipo existe en el Gacha. En el siguiente paso personalizas a tu héroe.</p></div>
        <div class="row" style="justify-content:flex-end"><button class="btn gold" data-act="cStep" data-s="2">Personalizar${A.icon('next')}</button></div></div>`;
    }
    if (c.step === 2) {
      const L = D.LOOK, lk = c.look;
      const label = { face: 'Forma de cara', eyes: 'Ojos', hair: 'Peinado', outfit: 'Atuendo base' };
      const opt = (k, names) => `<div class="field"><span class="lbl">${label[k]} <span class="dim">· ${names[lk[k]]}</span></span><div class="opts">${names.map((n, i) => `<button class="opt ${lk[k] === i ? 'on' : ''}" data-act="cLook" data-k="${k}" data-v="${i}" aria-pressed="${lk[k] === i}">${n}</button>`).join('')}</div></div>`;
      const sw = (k, lab, cols, names, order) => `<div class="field"><span class="lbl">${lab} <span class="dim">· ${names[lk[k]]}</span></span><div class="opts">${(order || cols.map((x, i) => i)).map(i => `<button class="swatch ${lk[k] === i ? 'on' : ''}" style="background:${cols[i]}" data-act="cLook" data-k="${k}" data-v="${i}" aria-label="${names[i]}" title="${names[i]}" aria-pressed="${lk[k] === i}"></button>`).join('')}</div></div>`;
      return `<div class="screen create">${steps}<div class="row sp-between"><h2>Apariencia</h2><button class="btn ghost sm" data-act="cRandom">${A.icon('dice')}Aleatorio</button></div>
        <div class="preview">${prev}</div>
        ${sw('skin', 'Tono de piel', L.skin, L.skinNames, L.skinOrder)}${opt('face', L.faceNames)}${opt('eyes', L.eyesNames)}${sw('eyeColor', 'Color de ojos', L.eyeColor, L.eyeColorNames, L.eyeColorOrder)}${opt('hair', L.hairNames)}${sw('hairColor', 'Color de pelo', L.hairColor, L.hairColorNames, L.hairColorOrder)}${opt('outfit', L.outfitNames)}
        <div class="row sp-between"><button class="btn ghost" data-act="cStep" data-s="1">${A.icon('back')}Atrás</button><button class="btn gold" data-act="cStep" data-s="3">Siguiente${A.icon('next')}</button></div></div>`;
    }
    const good = D.HABITS.filter(h => h.type === 'good'), bad = D.HABITS.filter(h => h.type === 'bad');
    const row = h => { const on = c.habits.indexOf(h.id) >= 0; return `<button class="list-row" style="width:100%;text-align:left" data-act="cHabit" data-id="${h.id}" aria-pressed="${on}">${gem(h.a, h.ic).replace('hgem', 'hgem" style="width:36px;height:36px;border-radius:11px;--ac:' + (h.type === 'bad' ? '#8a1a3e' : D.ATTRS[h.a].c))}<span class="grow"><b class="small">${esc(h.n)}</b><span class="tiny muted" style="display:block">${D.ATTRS[h.a].n} · ${D.DIFF[h.d].n}</span></span><span class="switch ${on ? 'on' : ''}" aria-hidden="true"></span></button>`; };
    return `<div class="screen create">${steps}<h2>Tus hábitos iniciales</h2><p class="small muted" style="margin:0">Te sugerimos algunos según tu clase. Podrás crear los tuyos, editarlos o cambiarlos en cualquier momento.</p>
      <div class="panel" style="padding-block:4px"><h3 style="margin-top:8px">Hábitos positivos</h3>${good.map(row).join('')}</div>
      <div class="panel" style="padding-block:4px"><h3 style="margin-top:8px">Malos hábitos a vigilar</h3>${bad.map(row).join('')}</div>
      <div class="row sp-between" style="position:sticky;bottom:calc(env(safe-area-inset-bottom,0px) + 10px)"><button class="btn ghost" data-act="cStep" data-s="2">${A.icon('back')}Atrás</button><button class="btn gold" data-act="cStart">¡Comenzar aventura!</button></div></div>`;
  };

  /* ---------- SUPERPOSICIONES ---------- */
  UI.ovLevel = e => ({
    cls: '', html: `<div class="rays-bg"></div><div class="ov-card"><div class="big-title gold-txt">¡SUBISTE DE NIVEL!</div><div class="lvl-num">${e.level}</div>
      ${UI.rwChips(e.rw, { center: 1 })}${e.milestone ? `<div class="unlock-box">${A.icon('gift')}¡Recompensa especial de nivel ${e.level}!</div>` : ''}
      ${e.unlocks.map(u => `<div class="unlock-box">${A.icon('sparkle')}Nuevo desbloqueo: ${esc(u)}</div>`).join('')}<button class="btn gold" data-close data-autofocus style="min-width:200px">Continuar</button></div>`,
    onShow: () => { App.snd('levelup'); FX.flash('gold'); FX.burst(innerWidth / 2, innerHeight * 0.4, ['#ffe066', '#ffffff', '#ff8f1f', '#7df9ff'], 80, { speed: 10, life: 70 }); if (e.milestone) FX.confetti(); App.vib([30, 40, 30, 40, 120]); }
  });
  UI.ovRewards = (title, got, text) => ({
    html: `<div class="ov-card"><div style="width:90px">${A.cur('chest', 90)}</div><div class="big-title gold-txt" style="font-size:clamp(28px,8vw,40px)">${esc(title)}</div>${text ? `<p class="muted" style="margin:0">${esc(text)}</p>` : ''}${UI.rwChips(UI.gotToRw(got), { center: 1 })}<button class="btn gold" data-close data-autofocus style="min-width:200px">¡Genial!</button></div>`,
    onShow: () => { FX.burst(innerWidth / 2, innerHeight * 0.35, ['#ffe066', '#ff5ad1', '#7df9ff'], 50, { speed: 8 }); }
  });
  UI.ovChapter = e => ({
    html: `<div class="ov-card"><span class="chip" style="background:var(--gold);color:#1d1430">Capítulo ${e.ch + 1} completado</span><div class="big-title gold-txt" style="font-size:clamp(28px,8vw,40px)">${esc(e.n)}</div><div class="story" style="text-align:left">${A.lumi()}<div class="speech">${esc(e.outro)}</div></div>${UI.rwChips(UI.gotToRw(e.got), { center: 1 })}<button class="btn gold" data-close data-autofocus>Continuar la historia</button></div>`,
    onShow: () => { App.snd('revive'); FX.confetti(); }
  });
  UI.ovBoss = e => {
    const def = D.BOSSES.find(b => e.n.indexOf(b.n) === 0) || D.BOSSES[0];
    return { html: `<div class="rays-bg"></div><div class="ov-card"><div class="big-title gold-txt">¡JEFE DERROTADO!</div><div style="width:180px;filter:grayscale(.6) brightness(.8);transform:rotate(-8deg)">${A.boss(def.look)}</div><b>${esc(e.n)}</b>${UI.rwChips(UI.gotToRw(e.got), { center: 1 })}<button class="btn gold" data-close data-autofocus>¡Victoria!</button></div>`,
      onShow: () => { App.snd('gacha', 3); FX.flash('gold'); FX.shake('shake-big'); FX.confetti(); } };
  };
  UI.ovDeath = e => ({
    cls: 'death', html: `<div class="ov-card"><div style="width:120px">${tombSvg(App.S.hero ? App.S.hero.name : '')}</div><div class="big-title red-txt">HAS CAÍDO</div>
      <p style="margin:0">Tu HP llegó a 0. Perdiste un nivel (ahora eres nivel ${e.level}) y estás en estado <b>Caído</b>: no ganas XP, oro ni tiradas.</p>
      <div class="panel small" style="text-align:left"><b>Ritual de Resurrección</b><br>Cumple todos tus hábitos diarios (y al menos 3 hábitos) sin registrar malos hábitos durante <b>${E.ritualNeed(App.S)} días seguidos</b>. Tienes <b>14 días</b>. Si no lo logras, tu héroe morirá para siempre.</div>
      <button class="btn red" data-close data-autofocus>Acepto el desafío</button></div>`,
    onShow: () => { App.snd('death'); FX.shake('shake-big'); App.vib([200, 100, 400]); setTimeout(() => FX.rise('#8d8da0'), 300); }
  });
  UI.ovRevive = () => ({
    cls: 'revive', html: `<div class="rays-bg"></div><div class="ov-card"><div style="width:170px">${App.S.hero ? UI.heroArt(App.S.hero, { expr: 'joy' }) : ''}</div><div class="big-title gold-txt">¡HAS RESUCITADO!</div><p style="margin:0">Completaste el Ritual de Resurrección. Vuelves con 50% de HP y el título <b>Renacido</b>.</p><button class="btn gold" data-close data-autofocus>¡De vuelta a la aventura!</button></div>`,
    onShow: () => { App.snd('revive'); FX.flash('gold'); FX.confetti(); FX.rise('#ffe066'); }
  });
  UI.ovPerma = e => ({
    cls: 'death', html: `<div class="ov-card"><div style="width:120px">${tombSvg(e.name)}</div><div class="big-title red-txt" style="font-size:clamp(28px,8vw,42px)">MUERTE PERMANENTE</div>
      <p style="margin:0">${esc(e.name)} no completó el Ritual a tiempo y ha caído para siempre.</p>
      <div class="panel small" style="text-align:left"><b>Tu Legado</b><ul style="margin:6px 0 0;padding-left:18px"><li>Conservas todos tus logros.</li><li>Bonus de XP permanente: +${Math.round(App.S.legacy.xpBonus * 100)}%.</li><li>Objeto conmemorativo: <b>Lápida de ${esc(e.name)}</b>.</li></ul></div>
      <button class="btn gold" data-close data-autofocus>Forjar un nuevo héroe</button></div>`,
    onShow: () => { App.snd('death'); App.ui.create = App.newCreate(); },
    onClose: () => { App.view = 'home'; }
  });
  UI.ovEvent = e => {
    const def = D.EVENTS.find(x => x.id === e.id) || {}, ev = App.S.ms.event;
    return { html: `<div class="rays-bg" style="background:repeating-conic-gradient(rgba(255,90,209,.14) 0 8deg,transparent 8deg 16deg)"></div><div class="ov-card"><span class="chip" style="background:var(--pink);color:#1d1430">¡EVENTO SORPRESA!</span><div class="eico" style="width:90px;height:90px;border-radius:50%;background:${def.c || '#ff5ad1'};display:grid;place-items:center;border:4px solid var(--ol)">${A.icon(def.ic || 'sparkle').replace('class="ic', 'style="width:50px;height:50px;color:#1d1430" class="ic')}</div><div class="big-title gold-txt" style="font-size:clamp(28px,8vw,40px)">${esc(e.n)}</div><p style="margin:0">${esc(e.d)}</p>${ev ? timer(ev.until, 'Termina en') : ''}${ev && ev.m ? UI.rwChips(ev.m.rw, { center: 1 }) : ''}<button class="btn gold" data-close data-autofocus>¡Vamos!</button></div>`,
      onShow: () => { App.snd('achievement'); FX.burst(innerWidth / 2, innerHeight * 0.4, [def.c || '#ff5ad1', '#fff'], 40); } };
  };

  /* ---------- tooltips de gráficas ---------- */
  let tip;
  const showTip = (el, x, y) => {
    if (!tip) { tip = document.createElement('div'); tip.className = 'toast'; tip.style.cssText = 'position:fixed;z-index:99;pointer-events:none;padding:6px 10px;font-size:12.5px;max-width:240px'; document.body.appendChild(tip); }
    tip.textContent = el.dataset.tip; tip.hidden = false;
    const w = tip.offsetWidth; tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, x - w / 2)) + 'px'; tip.style.top = Math.max(8, y - 48) + 'px';
  };
  document.addEventListener('pointerover', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) showTip(el, e.clientX, e.clientY); else if (tip) tip.hidden = true; });
  document.addEventListener('pointerdown', e => { const el = e.target.closest && e.target.closest('[data-tip]'); if (el) showTip(el, e.clientX, e.clientY); else if (tip) tip.hidden = true; });
  document.addEventListener('scroll', () => { if (tip) tip.hidden = true; }, { passive: true });
})(typeof window !== 'undefined' ? window : globalThis);
