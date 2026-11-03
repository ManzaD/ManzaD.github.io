/* LifeMOD — motor del juego (lógica pura, sin DOM) */
(function (G) {
  'use strict';
  const D = G.LMD;
  const E = {};
  const DAY = 86400000;
  const pad = n => (n < 10 ? '0' : '') + n;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const R = Math.round;

  /* ---------- reloj y aleatoriedad (sustituibles en pruebas) ---------- */
  E.clock = () => Date.now();
  E.rng = Math.random;
  E.now = S => E.clock() + ((S && S.debugOffset) || 0);
  E.pick = (arr, rng) => arr[Math.floor((rng || E.rng)() * arr.length)];
  E.shuffle = (arr, rng) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor((rng || E.rng)() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  E.seeded = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  /* ---------- fechas (días locales YYYY-MM-DD) ---------- */
  E.dayKey = ts => { const d = new Date(ts); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  E.dayDate = k => { const p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2], 12); };
  E.addDays = (k, n) => { const d = E.dayDate(k); d.setDate(d.getDate() + n); return E.dayKey(d.getTime()); };
  E.dayDiff = (a, b) => R((E.dayDate(b) - E.dayDate(a)) / DAY);
  E.weekday = k => (E.dayDate(k).getDay() + 6) % 7; // 0 = lunes
  E.weekKey = k => E.addDays(k, -E.weekday(k));
  E.endOfDay = ts => { const d = new Date(ts); d.setHours(24, 0, 0, 0); return d.getTime(); };

  /* ---------- fórmulas ---------- */
  E.xpToNext = lvl => Math.floor(100 * Math.pow(lvl, 1.5));
  E.attrXpToNext = lvl => Math.floor(60 * Math.pow(lvl, 1.35));
  E.streakMult = s => { for (const [t, m] of D.STREAK_TIERS) if (s >= t) return m; return 1; };
  E.nextStreakTier = s => { for (let i = D.STREAK_TIERS.length - 1; i >= 0; i--) if (s < D.STREAK_TIERS[i][0]) return D.STREAK_TIERS[i]; return null; };
  E.maxHp = S => { const h = S.hero; return 100 + 5 * (h.level - 1) + 3 * (h.attrs.vit.lvl - 1); };
  E.unlocked = (S, k) => { const u = D.UNLOCKS.find(x => x.k === k); return !u || (S.hero && S.hero.level >= u.lvl); };
  E.unlockLevel = k => { const u = D.UNLOCKS.find(x => x.k === k); return u ? u.lvl : 1; };

  /* ---------- estado ---------- */
  E.newState = () => ({
    app: 'lifemod', v: D.VERSION, created: E.clock(), debugOffset: 0,
    settings: { sound: true, volume: 0.7, haptics: true, reminders: { on: false, times: ['09:00', '21:00'] }, dev: false },
    hero: null,
    inv: {}, owned: { skins: [], titles: ['novato'] },
    habits: D.HABITS.map(h => E.mkHabit(Object.assign({}, h, { on: false, cu: false }))),
    days: {}, log: [], lastDay: null,
    ms: E.emptyMissions(),
    gacha: { pity: { std: { e: 0, l: 0 }, feat: { e: 0, l: 0, g: false }, pet: { e: 0, l: 0 } }, hist: [] },
    shop: { day: null, slots: [] },
    real: D.REAL_DEFAULTS.map((r, i) => ({ id: 'r' + i, n: r.n, price: r.price, ic: r.ic })),
    realHist: [],
    ach: {},
    stats: { habits: 0, bad: 0, xp: 0, goldEarned: 0, goldSpent: 0, pulls: 0, gotR2: 0, gotR3: 0, gotR4: 0, perfectDays: 0, cleanDays: 0, cleanStreak: 0,
      maxStreak: 0, deaths: 0, revives: 0, permadeaths: 0, realRewards: 0, upgrades: 0, crits: 0, undos: 0, dailyClaimed: 0, explore: 0, balance: 0, events: 0, bossesTotal: 0 },
    flags: {},
    legacy: { heroes: [], xpBonus: 0 },
    login: { day: null, n: 0 }
  });
  E.emptyMissions = () => ({
    daily: { day: null, list: [], reroll: false, chest: false },
    weekly: { wk: null, list: [], chest: false },
    explore: { list: [], until: null },
    balance: { m: null, day: null },
    story: { ch: 0, base: {} },
    event: null, eventRollDay: null, firstEvent: false,
    boss: { cur: null, idx: 0, next: 0, won: 0 },
    counts: { daily: 0, weekly: 0, explore: 0, balance: 0, event: 0 },
    seq: 1
  });
  E.mkHabit = o => ({
    id: o.id, n: o.n, type: o.type || 'good', a: o.a || 'dis', d: o.d || 'normal', f: o.f || 'daily', x: o.x || 3, ic: o.ic || 'star',
    on: o.on !== false, cu: !!o.cu, c: o.c || E.clock(), st: 0, bs: 0, wk: null, wc: 0, done: false
  });

  E.createHero = (S, o) => {
    const now = E.now(S);
    const attrs = {}; D.ATTR_KEYS.forEach(k => { attrs[k] = { lvl: 1, xp: 0 }; });
    S.hero = {
      name: (o.name || 'Héroe').trim().slice(0, 18) || 'Héroe', classId: D.CLASSES[o.classId] ? o.classId : 'guerrero',
      look: Object.assign({ skin: 1, face: 0, eyes: 0, eyeColor: 0, hair: 0, hairColor: 0, outfit: 0 }, o.look || {}),
      level: 1, xp: 0, hp: 100, gold: 200, gems: 300, dust: 0, tickets: { std: 10, pet: 0, gold: 0 }, chests: 0,
      attrs, status: 'alive', fallen: null, eq: { weapon: null, armor: null, accessory: null, pet: null },
      skin: null, aura: null, title: 'novato', born: now, buffs: [], shield: 0
    };
    // equipo inicial según clase
    const starter = { sword: 'w_madera', staff: 'w_aprendiz', lute: 'w_laud', hammer: 'w_martillo', dagger: 'w_daga' }[D.CLASSES[S.hero.classId].weapon];
    S.inv[starter] = S.inv[starter] || { lvl: 0, t: now };
    S.hero.eq.weapon = starter;
    // memoriales del legado
    Object.keys(S.inv).forEach(id => { if (id.indexOf('x_memorial') === 0 && !S.hero.eq.accessory) S.hero.eq.accessory = id; });
    if (o.habits) {
      S.habits.forEach(h => { if (!h.cu) h.on = o.habits.indexOf(h.id) >= 0; });
    }
    S.hero.hp = E.maxHp(S);
    if (S.pending && S.pending.length) { S.pending.forEach(rw => E.grant(S, rw, [], true)); S.pending = []; }
    S.ms = E.emptyMissions();
    S.ms.story = { ch: 0, base: E.storyBase(S) };
    S.lastDay = E.dayKey(now);
    E.refresh(S, []);
    return S.hero;
  };

  /* ---------- objetos y modificadores ---------- */
  E.itemDef = (S, id) => {
    const base = D.ITEM[id] || (id.indexOf('x_memorial') === 0 ? D.ITEM.x_memorial : null);
    if (!base) return null;
    const inv = S.inv[id];
    return inv && inv.name ? Object.assign({}, base, { id, n: inv.name }) : (base.id === id ? base : Object.assign({}, base, { id }));
  };
  const addB = (m, b, k) => {
    if (!b) return;
    if (b.xp) for (const a in b.xp) m.xp[a] += b.xp[a] * k;
    ['all', 'gold', 'def', 'crit', 'regen', 'boss', 'heal', 'mission', 'ritual', 'gemrain', 'shop'].forEach(x => { if (b[x]) m[x] += b[x] * k; });
  };
  E.mods = S => {
    const h = S.hero, now = E.now(S);
    const m = { xp: { fue: 0, int: 0, vit: 0, dis: 0, car: 0 }, all: 0, gold: 0, def: 0, crit: 0, regen: 0, boss: 0, heal: 0, mission: 0, ritual: 0, gemrain: 0, shop: 0 };
    if (!h) return m;
    addB(m, D.CLASSES[h.classId].b, 1);
    ['weapon', 'armor', 'accessory', 'pet'].forEach(s => {
      const id = h.eq[s]; if (!id || !S.inv[id]) return;
      const def = E.itemDef(S, id); if (!def) return;
      const k = def.b.ritual ? 1 : 1 + 0.2 * (S.inv[id].lvl || 0);
      addB(m, def.b, k);
      if (def.b.ritual) m.ritual = def.b.ritual;
    });
    m.all += S.legacy.xpBonus || 0;
    m.gold += 0.01 * (h.attrs.car.lvl - 1);
    m.def += 0.005 * (h.attrs.dis.lvl - 1);
    m.boss += 0.01 * (h.attrs.fue.lvl - 1);
    m.mission += 0.01 * (h.attrs.int.lvl - 1);
    h.buffs.forEach(b => { if (b.until > now) addB(m, b.b, 1); });
    m.def = Math.min(0.6, m.def);
    m.crit = Math.min(0.5, 0.08 + m.crit);
    m.regen = R(m.regen);
    m.shop = Math.min(0.6, m.shop);
    return m;
  };

  /* ---------- días ---------- */
  E.day = (S, k) => (S.days[k] = S.days[k] || { xp: 0, gold: 0, g: 0, b: 0, done: {}, bad: {}, ax: {}, perf: false, dmg: 0 });
  E.habit = (S, id) => S.habits.find(h => h.id === id);
  E.activeGood = S => S.habits.filter(h => h.on && h.type === 'good' && !(h.f === 'once' && h.done));
  E.activeBad = S => S.habits.filter(h => h.on && h.type === 'bad');
  E.dailies = S => S.habits.filter(h => h.on && h.type === 'good' && h.f === 'daily');
  E.weekCount = (h, dk) => (h.wk === E.weekKey(dk) ? h.wc : 0);
  E.doneToday = (S, h, dk) => !!(S.days[dk] && S.days[dk].done[h.id]);
  E.canComplete = (S, h, dk) => {
    if (!h || !h.on || h.type !== 'good') return false;
    if (E.doneToday(S, h, dk)) return false;
    if (h.f === 'once' && h.done) return false;
    if (h.f === 'weekly' && E.weekCount(h, dk) >= h.x) return false;
    return true;
  };
  E.isPerfect = (S, dk) => {
    const day = S.days[dk]; if (!day) return false;
    const dl = E.dailies(S);
    return day.g >= 3 && dl.every(h => day.done[h.id]);
  };
  E.todayHabits = S => {
    const dk = E.dayKey(E.now(S));
    return E.activeGood(S).filter(h => h.f !== 'weekly' || E.weekCount(h, dk) < h.x || E.doneToday(S, h, dk));
  };

  /* ---------- recompensas ---------- */
  E.heal = (S, n) => { const h = S.hero; if (!h || h.status !== 'alive' || n <= 0) return 0; const mx = E.maxHp(S); const before = h.hp; h.hp = Math.min(mx, h.hp + n); return h.hp - before; };
  E.addXp = (S, amt, attr, ev) => {
    const h = S.hero; if (!h || h.status !== 'alive' || amt <= 0) return;
    h.xp += amt; S.stats.xp += amt;
    while (h.xp >= E.xpToNext(h.level)) { h.xp -= E.xpToNext(h.level); h.level++; E.onLevelUp(S, ev); }
    if (attr) {
      const a = h.attrs[attr]; a.xp += amt;
      while (a.xp >= E.attrXpToNext(a.lvl)) { a.xp -= E.attrXpToNext(a.lvl); a.lvl++; ev.push({ type: 'attrup', attr, lvl: a.lvl }); }
    }
  };
  E.onLevelUp = (S, ev) => {
    const h = S.hero, L = h.level;
    const rw = { gems: 20 + 2 * L, gold: 25 * L };
    const ms = D.MILESTONES[L] || (L % 5 === 0 ? { std: 10, gems: 100 + 10 * L, gold_t: L % 10 === 0 ? 1 : 0 } : null);
    if (ms) Object.keys(ms).forEach(k => { rw[k] = (rw[k] && typeof ms[k] === 'number') ? rw[k] + ms[k] : ms[k]; });
    E.grant(S, rw, ev, true);
    E.heal(S, R(E.maxHp(S) * 0.25));
    const unlocks = D.UNLOCKS.filter(u => u.lvl === L).map(u => u.n);
    ev.push({ type: 'levelup', level: L, rw, milestone: !!ms, unlocks });
    if (unlocks.length) E.refresh(S, ev);
  };
  /* Entrega un paquete de recompensas. quiet = no emitir evento 'reward' */
  E.grant = (S, rw, ev, quiet) => {
    const h = S.hero; if (!h || !rw) return [];
    const got = [];
    if (rw.xp) { E.addXp(S, rw.xp, rw.attr || null, ev); got.push({ k: 'xp', v: rw.xp }); }
    if (rw.attrXp && rw.attr) { const a = h.attrs[rw.attr]; a.xp += rw.attrXp; while (a.xp >= E.attrXpToNext(a.lvl)) { a.xp -= E.attrXpToNext(a.lvl); a.lvl++; ev.push({ type: 'attrup', attr: rw.attr, lvl: a.lvl }); } got.push({ k: 'attrXp', v: rw.attrXp, attr: rw.attr }); }
    if (rw.gold) { h.gold += rw.gold; S.stats.goldEarned += rw.gold; got.push({ k: 'gold', v: rw.gold }); }
    if (rw.gems) { h.gems += rw.gems; got.push({ k: 'gems', v: rw.gems }); }
    if (rw.dust) { h.dust += rw.dust; got.push({ k: 'dust', v: rw.dust }); }
    if (rw.std) { h.tickets.std += rw.std; got.push({ k: 'std', v: rw.std }); }
    if (rw.pet) { h.tickets.pet += rw.pet; got.push({ k: 'pet', v: rw.pet }); }
    if (rw.gold_t) { h.tickets.gold += rw.gold_t; got.push({ k: 'gold_t', v: rw.gold_t }); }
    if (rw.chest) { h.chests += 1; got.push({ k: 'chest', v: 1 }); }
    if (rw.item) { const r = E.addItem(S, rw.item); got.push({ k: 'item', v: rw.item, dup: r.dup, dust: r.dust }); }
    if (rw.title && S.owned.titles.indexOf(rw.title) < 0) { S.owned.titles.push(rw.title); got.push({ k: 'title', v: rw.title }); }
    if (rw.skin && S.owned.skins.indexOf(rw.skin) < 0) { S.owned.skins.push(rw.skin); got.push({ k: 'skin', v: rw.skin }); }
    if (!quiet && got.length) ev.push({ type: 'reward', got });
    return got;
  };
  E.addItem = (S, id, name) => {
    const def = D.ITEM[id] || (id.indexOf('x_memorial') === 0 ? D.ITEM.x_memorial : null);
    if (!def) return { dup: false, dust: 0 };
    if (S.inv[id]) { const dust = D.RARITY[def.r].dust; if (S.hero) S.hero.dust += dust; return { dup: true, dust }; }
    S.inv[id] = { lvl: 0, t: E.now(S) }; if (name) S.inv[id].name = name;
    return { dup: false, dust: 0 };
  };

  /* ---------- acciones: hábitos ---------- */
  E.complete = (S, id) => {
    const ev = []; E.refresh(S, ev);
    const h = E.habit(S, id), now = E.now(S), dk = E.dayKey(now), hero = S.hero;
    if (!hero) return { ok: false, err: 'Crea un personaje primero.' };
    if (!E.canComplete(S, h, dk)) return { ok: false, err: 'Este hábito ya está cumplido.' };
    const day = E.day(S, dk), alive = hero.status === 'alive';
    // racha
    if (h.f === 'weekly') { if (h.wk !== E.weekKey(dk)) { h.wk = E.weekKey(dk); h.wc = 0; } h.wc++; }
    if (h.f !== 'once') { h.st++; h.bs = Math.max(h.bs, h.st); S.stats.maxStreak = Math.max(S.stats.maxStreak, h.st); } else { h.done = true; }
    const mult = h.f === 'once' ? 1 : E.streakMult(h.st);
    const mods = E.mods(S), df = D.DIFF[h.d];
    const crit = alive && E.rng() < mods.crit;
    let xp = 0, gold = 0, heal = 0, dmg = 0, gems = 0;
    if (alive) {
      xp = R(df.xp * mult * (1 + mods.xp[h.a] + mods.all) * (crit ? 2 : 1));
      gold = R(df.gold * mult * (1 + mods.gold) * (crit ? 1.5 : 1));
      gems = mods.gemrain || 0;
      heal = (h.a === 'vit' ? R(df.heal * (1 + mods.heal)) : 0) + mods.regen;
    }
    day.done[h.id] = 1; day.g++; S.stats.habits++;
    if (crit) S.stats.crits++;
    if (alive) {
      E.addXp(S, xp, h.a, ev);
      hero.gold += gold; S.stats.goldEarned += gold; hero.gems += gems;
      heal = E.heal(S, heal);
      day.xp += xp; day.gold += gold; day.ax[h.a] = (day.ax[h.a] || 0) + xp;
      if (D.STREAK_GEMS[h.st] && h.f !== 'once') { E.grant(S, { gems: D.STREAK_GEMS[h.st] }, ev, true); ev.push({ type: 'streak', habit: h.n, st: h.st, gems: D.STREAK_GEMS[h.st] }); }
      // jefe
      const b = S.ms.boss.cur;
      if (b && b.until > now) { dmg = R(xp * (1 + mods.boss)); b.hp = Math.max(0, b.hp - dmg); b.dealt = (b.dealt || 0) + dmg; if (b.hp <= 0) E.defeatBoss(S, ev); }
    }
    ev.unshift({ type: 'complete', habit: h.id, xp, gold, gems, crit, heal, dmg, mult, st: h.st });
    E.track(S, { type: 'good', habit: h, xp, gold, dmg }, ev);
    if (!day.perf && E.isPerfect(S, dk)) {
      day.perf = true; S.stats.perfectDays++;
      if (alive) { const hh = E.heal(S, R(E.maxHp(S) * 0.15)); E.grant(S, { gems: 15 }, ev, true); ev.push({ type: 'perfect', heal: hh, gems: 15 }); }
      else ev.push({ type: 'perfect', heal: 0, gems: 0 });
      E.track(S, { type: 'perfect' }, ev);
    }
    const hr = new Date(now).getHours();
    if (hr < 4) S.flags.nightowl = 1; else if (hr < 6) S.flags.earlybird = 1;
    E.pushLog(S, { t: now, k: 'g', h: h.id, xp, gold, crit: crit ? 1 : 0 });
    E.checkAch(S, ev);
    return { ok: true, ev };
  };

  E.logBad = (S, id) => {
    const ev = []; E.refresh(S, ev);
    const h = E.habit(S, id), now = E.now(S), dk = E.dayKey(now), hero = S.hero;
    if (!hero) return { ok: false, err: 'Crea un personaje primero.' };
    if (!h || h.type !== 'bad' || !h.on) return { ok: false, err: 'Hábito no válido.' };
    const day = E.day(S, dk), df = D.DIFF[h.d];
    day.b++; day.bad[h.id] = (day.bad[h.id] || 0) + 1; S.stats.bad++;
    let dmg = 0;
    if (hero.status === 'alive') {
      const mods = E.mods(S);
      dmg = Math.max(1, R(df.dmg * (1 - mods.def)));
      hero.hp = Math.max(0, hero.hp - dmg); day.dmg += dmg;
    }
    const b = S.ms.boss.cur; let bossHeal = 0;
    if (b && b.until > now) { bossHeal = Math.min(b.max - b.hp, df.xp * 2); b.hp += bossHeal; }
    ev.push({ type: 'damage', habit: h.id, dmg, bossHeal, hp: hero.hp });
    if (day.b >= 5) S.flags.darkday = 1;
    if (hero.status === 'fallen' && hero.fallen.progress > 0) { hero.fallen.progress = 0; ev.push({ type: 'ritualbroken' }); }
    if (hero.status === 'alive') {
      if (hero.hp <= 0) E.die(S, ev);
      else {
        if (hero.hp <= 5) S.flags.edge = 1;
        if (hero.hp <= E.maxHp(S) * 0.25) ev.push({ type: 'lowhp', hp: hero.hp });
      }
    }
    E.track(S, { type: 'bad', habit: h }, ev);
    E.pushLog(S, { t: now, k: 'b', h: h.id, dmg });
    E.checkAch(S, ev);
    return { ok: true, ev };
  };
  E.pushLog = (S, e) => { S.log.push(e); if (S.log.length > 400) S.log.splice(0, S.log.length - 400); };

  /* ---------- muerte, ritual, legado ---------- */
  E.ritualNeed = S => Math.max(3, 7 - (E.mods(S).ritual || 0));
  E.die = (S, ev) => {
    const h = S.hero, dk = E.dayKey(E.now(S));
    h.status = 'fallen'; h.hp = 0; h.level = Math.max(1, h.level - 1); h.xp = 0;
    h.fallen = { at: E.now(S), day: dk, progress: 0, deadline: E.addDays(dk, 14), need: E.ritualNeed(S) };
    h.buffs = [];
    S.stats.deaths++;
    ev.push({ type: 'death', level: h.level });
  };
  E.ritualToday = S => {
    const h = S.hero, dk = E.dayKey(E.now(S)), day = S.days[dk] || { g: 0, b: 0, done: {} };
    const dl = E.dailies(S);
    return { done: dl.filter(x => day.done[x.id]).length, total: dl.length, g: day.g, clean: day.b === 0, ok: E.isPerfect(S, dk) && day.b === 0,
      progress: h.fallen ? h.fallen.progress : 0, need: h.fallen ? E.ritualNeed(S) : 7, daysLeft: h.fallen ? E.dayDiff(dk, h.fallen.deadline) : 0 };
  };
  E.revive = (S, ev) => {
    const h = S.hero; h.status = 'alive'; h.fallen = null; h.hp = R(E.maxHp(S) * 0.5);
    S.stats.revives++;
    E.grant(S, { title: 'renacido' }, ev, true);
    ev.push({ type: 'revive' });
  };
  E.permadeath = (S, ev) => {
    const h = S.hero;
    S.legacy.heroes.push({ name: h.name, classId: h.classId, level: h.level, born: h.born, died: E.now(S), look: h.look });
    S.legacy.xpBonus = Math.min(0.15, R(((S.legacy.xpBonus || 0) + 0.05) * 100) / 100);
    const keep = {};
    Object.keys(S.inv).forEach(id => { if (id.indexOf('x_memorial') === 0) keep[id] = S.inv[id]; });
    const mid = 'x_memorial_' + S.legacy.heroes.length;
    keep[mid] = { lvl: 0, t: E.now(S), name: 'Lápida de ' + h.name };
    S.inv = keep;
    S.owned = { skins: [], titles: ['novato'] };
    S.habits.forEach(x => { x.st = 0; x.bs = 0; x.wc = 0; x.wk = null; });
    S.gacha.pity = { std: { e: 0, l: 0 }, feat: { e: 0, l: 0, g: false }, pet: { e: 0, l: 0 } };
    S.ms = E.emptyMissions();
    S.shop = { day: null, slots: [] };
    S.stats.permadeaths++;
    S.hero = null;
    ev.push({ type: 'permadeath', name: h.name, memorial: mid });
    E.checkAch(S, ev);
  };

  /* ---------- paso del tiempo ---------- */
  E.refresh = (S, ev) => {
    ev = ev || [];
    if (!S.hero) return ev;
    const now = E.now(S), today = E.dayKey(now);
    if (!S.lastDay) S.lastDay = today;
    let guard = 0;
    while (S.lastDay < today && guard++ < 1200) {
      E.finalizeDay(S, S.lastDay, ev);
      if (!S.hero) { S.lastDay = today; return ev; }
      S.lastDay = E.addDays(S.lastDay, 1);
    }
    const h = S.hero;
    h.buffs = h.buffs.filter(b => b.until > now);
    if (S.ms.event && S.ms.event.until <= now) {
      if (!S.ms.event.cl) ev.push({ type: 'eventend', n: S.ms.event.n });
      S.ms.event = null;
    }
    const b = S.ms.boss.cur;
    if (b && b.until <= now) { ev.push({ type: 'bossescape', n: D.BOSSES[b.i % D.BOSSES.length].n }); S.ms.boss.cur = null; S.ms.boss.next = E.endOfDay(now); }
    E.ensureMissions(S, today, ev);
    E.ensureShop(S, today);
    return ev;
  };
  E.finalizeDay = (S, d, ev) => {
    const h = S.hero, day = E.day(S, d), alive = h.status === 'alive';
    const clean = day.b === 0;
    if (clean) { S.stats.cleanDays++; S.stats.cleanStreak++; if (alive) E.track(S, { type: 'clean' }, ev); }
    else S.stats.cleanStreak = 0;
    // rachas diarias
    const missed = E.dailies(S).filter(x => !day.done[x.id] && x.st > 0 && x.c <= E.dayDate(d).getTime() + DAY);
    if (missed.length) {
      if (h.shield > 0) { h.shield--; ev.push({ type: 'shieldused', n: missed.length }); }
      else { missed.forEach(x => { x.st = 0; }); ev.push({ type: 'streaklost', n: missed.length, names: missed.map(x => x.n) }); }
    }
    if (E.weekday(d) === 6) {
      S.habits.filter(x => x.on && x.type === 'good' && x.f === 'weekly').forEach(x => { if (E.weekCount(x, d) < x.x) x.st = 0; });
    }
    if (alive) E.heal(S, R(E.maxHp(S) * 0.05));
    day.lv = h.level; day.at = {}; D.ATTR_KEYS.forEach(k => { day.at[k] = h.attrs[k].lvl; });
    // ritual
    if (h.status === 'fallen' && d > h.fallen.day) {
      const ok = E.isPerfect(S, d) && clean;
      h.fallen.need = E.ritualNeed(S);
      h.fallen.progress = ok ? h.fallen.progress + 1 : 0;
      ev.push({ type: 'ritualday', ok, progress: h.fallen.progress, need: h.fallen.need });
      if (h.fallen.progress >= h.fallen.need) E.revive(S, ev);
      else if (d >= h.fallen.deadline) E.permadeath(S, ev);
    }
    if (S.hero) E.checkAch(S, ev);
  };

  /* ---------- misiones ---------- */
  const mid = S => 'm' + (S.ms.seq++);
  const scaleN = (S, kind) => {
    const L = S.hero.level;
    if (kind === 'xp') return Math.min(400, 60 + 15 * L) - (Math.min(400, 60 + 15 * L) % 10);
    if (kind === 'gold') return Math.min(160, 25 + 5 * L) - (Math.min(160, 25 + 5 * L) % 5);
    if (kind === 'wxp') return Math.min(2500, 500 + 90 * L) - (Math.min(2500, 500 + 90 * L) % 50);
    return 1;
  };
  E.ensureMissions = (S, today, ev) => {
    const ms = S.ms, wk = E.weekKey(today);
    if (ms.daily.day !== today) E.genDaily(S, today);
    if (E.unlocked(S, 'weekly') && ms.weekly.wk !== wk) E.genWeekly(S, wk);
    if (E.unlocked(S, 'explore')) {
      if (!ms.explore.until || ms.explore.until <= today) { ms.explore.list = []; ms.explore.until = E.addDays(today, 3); }
      ms.explore.list = ms.explore.list.filter(m => !m.cl || m.day === today);
      while (ms.explore.list.length < 2) ms.explore.list.push(E.genExplore(S, today, ms.explore.list));
    }
    if (E.unlocked(S, 'balance')) {
      const bm = ms.balance.m;
      if (!bm || (bm.cl && ms.balance.day !== today) || (bm.wk && bm.wk !== wk)) { ms.balance.m = E.genBalance(S, wk); ms.balance.day = today; }
    }
    if (E.unlocked(S, 'events') && ms.eventRollDay !== today) {
      ms.eventRollDay = today;
      if (!ms.event && S.hero.status === 'alive' && (!ms.firstEvent || E.rng() < 0.35)) { ms.firstEvent = true; E.spawnEvent(S, null, ev); }
    }
  };
  const goodAttrs = S => Array.from(new Set(E.activeGood(S).map(h => h.a)));
  const mkReward = (S, kind) => {
    const L = S.hero.level, r = E.rng();
    if (kind === 'daily') {
      const rw = { xp: 30 + 5 * L, gold: 30 + 5 * L };
      if (r < 0.15) rw.std = 1; else if (r < 0.4) rw.dust = 25; else rw.gems = 10 + Math.floor(E.rng() * 3) * 5;
      return rw;
    }
    if (kind === 'weekly') {
      const rw = { xp: 150 + 20 * L, gold: 150 + 20 * L, gems: 60 + Math.floor(E.rng() * 3) * 20 };
      if (r < 0.5) rw.std = 2; else rw.dust = 80;
      return rw;
    }
    return { xp: 20 };
  };
  E.genDaily = (S, today) => {
    const ms = S.ms, nGood = E.activeGood(S).length, attrs = goodAttrs(S);
    const elig = D.DAILY_TPL.filter(t => {
      if (t.need === 'hard') return E.activeGood(S).some(h => h.d === 'dificil' || h.d === 'epico');
      if (t.need === 'streak') return E.activeGood(S).some(h => h.st > 0);
      if (t.need === 'daily') return E.dailies(S).length > 0 && E.dailies(S).length <= 8;
      if (t.m === 'good_attr') return attrs.length > 0;
      if (t.m === 'attr_variety') return attrs.length >= 2;
      return true;
    });
    const chosen = E.shuffle(elig).slice(0, 3);
    ms.daily = { day: today, list: chosen.map(t => E.mkMission(S, t, 'daily', { nGood, attrs })), reroll: ms.daily.day === today ? ms.daily.reroll : false, chest: false };
  };
  E.mkMission = (S, t, kind, ctx) => {
    let n = t.scale ? scaleN(S, t.scale) : E.pick(t.ns);
    const f = {};
    if (t.m === 'good' && kind === 'daily') n = clamp(n, 1, Math.max(1, ctx.nGood));
    if (t.m === 'good_attr') { f.attr = E.pick(ctx.attrs); n = clamp(n, 1, E.activeGood(S).filter(h => h.a === f.attr).length || 1); }
    if (t.m === 'attr_variety') n = clamp(n, 2, Math.max(2, kind === 'weekly' ? 5 : ctx.attrs.length));
    if (t.m === 'good_streak') n = clamp(n, 1, E.activeGood(S).filter(h => h.st > 0).length || 1);
    const title = t.t.replace('{n}', n).replace('{attr}', f.attr ? D.ATTRS[f.attr].n : '');
    return { id: mid(S), k: kind, tpl: t.id, t: title, m: t.m, n, p: 0, f, s: [], rw: mkReward(S, kind), done: false, cl: false };
  };
  E.genWeekly = (S, wk) => {
    const attrs = goodAttrs(S), nGood = E.activeGood(S).length;
    const elig = D.WEEKLY_TPL.filter(t => (t.need !== 'bosses' || E.unlocked(S, 'bosses')) && (t.m !== 'attr_variety' || attrs.length >= 5));
    const chosen = E.shuffle(elig).slice(0, 3);
    S.ms.weekly = { wk, list: chosen.map(t => { const m = E.mkMission(S, t, 'weekly', { nGood, attrs }); if (t.m === 'good') m.n = clamp(m.n, 7, Math.max(7, nGood * 5)), m.t = t.t.replace('{n}', m.n); return m; }), chest: false };
  };
  E.attrRank = S => D.ATTR_KEYS.slice().sort((a, b) => {
    const A = S.hero.attrs[a], B = S.hero.attrs[b];
    return (A.lvl * 1e6 + A.xp) - (B.lvl * 1e6 + B.xp);
  });
  E.genExplore = (S, today, existing) => {
    const rank = E.attrRank(S);
    const usedAttrs = existing.map(m => m.f.attr);
    const attr = rank.find(a => usedAttrs.indexOf(a) < 0) || rank[0];
    const L = S.hero.level;
    const rw = { xp: 60 + 5 * L, attrXp: 40, attr, gems: 20, dust: 20 };
    const hasCustom = S.habits.some(h => h.cu && h.on && h.a === attr && h.type === 'good');
    if (!hasCustom && E.rng() < 0.4) {
      return { id: mid(S), k: 'explore', tpl: 'e_new', t: 'Crea un hábito nuevo de ' + D.ATTRS[attr].n + ' y cúmplelo 2 veces', m: 'new_habit', n: 2, p: 0, f: { attr, after: E.now(S) }, s: [], rw, done: false, cl: false, day: null };
    }
    const prev = S.ms.lastExplore || [];
    const opts = D.EXPLORE_TPL[attr].filter(t => prev.indexOf(t) < 0);
    const t = E.pick(opts.length ? opts : D.EXPLORE_TPL[attr]);
    S.ms.lastExplore = prev.concat([t]).slice(-8);
    return { id: mid(S), k: 'explore', tpl: 'e_manual', t, m: 'manual', n: 1, p: 0, f: { attr }, s: [], rw, done: false, cl: false, day: null };
  };
  E.genBalance = (S, wk) => {
    const attr = E.attrRank(S)[0], L = S.hero.level;
    const n = 80 + 15 * L - ((80 + 15 * L) % 5);
    return { id: mid(S), k: 'balance', tpl: 'b_xp', t: 'Equilibrio: gana ' + n + ' XP de ' + D.ATTRS[attr].n + ' (tu atributo más bajo)', m: 'xp_attr', n, p: 0, f: { attr }, s: [],
      rw: { xp: 50 + 6 * L, gems: 30, gold: 60 + 10 * L, dust: 30 }, done: false, cl: false, wk };
  };
  E.spawnEvent = (S, id, ev) => {
    const def = id ? D.EVENTS.find(e => e.id === id) : E.pick(D.EVENTS);
    const now = E.now(S), until = now + def.h * 3600000;
    const e = { id: def.id, n: def.n, d: def.d, until, start: now, cl: false, m: null };
    if (def.buff) S.hero.buffs.push({ id: 'ev_' + def.id, n: def.n, until, b: def.buff });
    if (def.mission) {
      let rw = Object.assign({}, def.mission.rw);
      if (rw.item && S.inv[rw.item]) { delete rw.item; rw.gems = (rw.gems || 0) + 100; }
      if (rw.skin && S.owned.skins.indexOf(rw.skin) >= 0) { delete rw.skin; rw.gems = (rw.gems || 0) + 60; }
      e.m = { id: mid(S), k: 'event', tpl: 'ev_' + def.id, t: def.d, m: def.mission.m, n: def.mission.n, p: 0, f: {}, s: [], rw, done: false, cl: false };
    } else e.cl = true;
    S.ms.event = e;
    ev.push({ type: 'event', id: def.id, n: def.n, d: def.d });
    return e;
  };
  E.allMissions = S => {
    const ms = S.ms, out = [];
    ms.daily.list.forEach(m => out.push(m));
    ms.weekly.list.forEach(m => out.push(m));
    ms.explore.list.forEach(m => out.push(m));
    if (ms.balance.m) out.push(ms.balance.m);
    if (ms.event && ms.event.m) out.push(ms.event.m);
    return out;
  };
  E.track = (S, e, ev) => {
    if (!S.hero || S.hero.status !== 'alive') return;
    E.allMissions(S).forEach(m => {
      if (m.done) return;
      const h = e.habit; let inc = 0;
      switch (m.m) {
        case 'good': if (e.type === 'good') inc = 1; break;
        case 'good_attr': if (e.type === 'good' && h.a === m.f.attr) inc = 1; break;
        case 'good_hard': if (e.type === 'good' && (h.d === 'dificil' || h.d === 'epico')) inc = 1; break;
        case 'good_streak': if (e.type === 'good' && h.st >= 2) inc = 1; break;
        case 'xp': if (e.type === 'good') inc = e.xp; break;
        case 'gold': if (e.type === 'good') inc = e.gold; break;
        case 'xp_attr': if (e.type === 'good' && h.a === m.f.attr) inc = e.xp; break;
        case 'boss_dmg': if (e.type === 'good') inc = e.dmg; break;
        case 'pull': if (e.type === 'pull') inc = e.n; break;
        case 'perfect': if (e.type === 'perfect') inc = 1; break;
        case 'clean': if (e.type === 'clean') inc = 1; break;
        case 'claim_daily': if (e.type === 'claim' && e.k === 'daily') inc = 1; break;
        case 'new_habit': if (e.type === 'good' && h.cu && h.a === m.f.attr && h.c >= m.f.after) inc = 1; break;
        case 'attr_variety': if (e.type === 'good' && m.s.indexOf(h.a) < 0) { m.s.push(h.a); m.p = m.s.length; if (m.p >= m.n) { m.done = true; ev.push({ type: 'missiondone', id: m.id, t: m.t, k: m.k }); } } return;
        default: break;
      }
      if (inc > 0) { m.p = Math.min(m.n, m.p + inc); if (m.p >= m.n) { m.done = true; ev.push({ type: 'missiondone', id: m.id, t: m.t, k: m.k }); } }
    });
  };
  E.findMission = (S, id) => E.allMissions(S).find(m => m.id === id);
  E.manualMission = (S, id) => {
    const m = E.findMission(S, id); const ev = [];
    if (!m || m.m !== 'manual' || m.done) return { ok: false, err: 'Misión no disponible.' };
    if (S.hero.status !== 'alive') return { ok: false, err: 'Los caídos no pueden avanzar misiones.' };
    m.p = 1; m.done = true; ev.push({ type: 'missiondone', id: m.id, t: m.t, k: m.k });
    return { ok: true, ev };
  };
  E.claimMission = (S, id) => {
    const ev = []; E.refresh(S, ev);
    const m = E.findMission(S, id);
    if (!m || !m.done || m.cl) return { ok: false, err: 'Aún no puedes reclamarla.' };
    if (S.hero.status !== 'alive') return { ok: false, err: 'Revive para reclamar recompensas.' };
    m.cl = true;
    const rw = Object.assign({}, m.rw);
    if (rw.xp) rw.xp = R(rw.xp * (1 + E.mods(S).mission));
    if (m.k === 'explore' || m.k === 'balance') rw.attr = m.f.attr;
    if (m.k === 'explore') m.day = E.dayKey(E.now(S));
    S.ms.counts[m.k] = (S.ms.counts[m.k] || 0) + 1;
    if (m.k === 'daily') S.stats.dailyClaimed++;
    if (m.k === 'explore') { S.stats.explore++; if (S.ms.counts.explore === 5 && !S.inv.x_explorador) rw.item = 'x_explorador'; }
    if (m.k === 'balance') { S.stats.balance++; if (S.ms.counts.balance === 3 && !S.inv.x_medalla) rw.item = 'x_medalla'; }
    if (m.k === 'event') { S.stats.events++; if (S.ms.event) S.ms.event.cl = true; }
    const got = E.grant(S, rw, ev, true);
    ev.unshift({ type: 'claim', t: m.t, got, k: m.k });
    E.track(S, { type: 'claim', k: m.k }, ev);
    E.checkAch(S, ev);
    return { ok: true, ev };
  };
  E.chestReady = (S, k) => { const g = S.ms[k]; return g && g.list.length > 0 && !g.chest && g.list.every(m => m.cl); };
  E.claimChest = (S, k) => {
    const ev = [];
    if (!E.chestReady(S, k)) return { ok: false, err: 'Completa todas las misiones primero.' };
    if (S.hero.status !== 'alive') return { ok: false, err: 'Revive para reclamar recompensas.' };
    S.ms[k].chest = true;
    let rw;
    if (k === 'daily') {
      rw = { gems: 30 };
      const pool = D.ITEMS.filter(i => i.src === 'gacha' && i.slot !== 'pet' && i.r <= 1);
      if (E.rng() < 0.5) rw.item = E.pick(pool).id; else rw.dust = 40;
    } else rw = { std: 3, gems: 100, dust: 50 };
    const got = E.grant(S, rw, ev, true);
    ev.unshift({ type: 'claim', t: k === 'daily' ? 'Cofre diario' : 'Cofre semanal', got, k: 'chest' });
    E.checkAch(S, ev);
    return { ok: true, ev };
  };
  E.rerollDaily = (S, id) => {
    const d = S.ms.daily;
    if (d.reroll) return { ok: false, err: 'Ya cambiaste una misión hoy.' };
    const i = d.list.findIndex(m => m.id === id);
    if (i < 0 || d.list[i].done) return { ok: false, err: 'No se puede cambiar esta misión.' };
    const used = d.list.map(m => m.tpl);
    const nGood = E.activeGood(S).length, attrs = goodAttrs(S);
    const elig = D.DAILY_TPL.filter(t => used.indexOf(t.id) < 0 && t.need !== 'hard' && t.need !== 'streak' && (t.m !== 'attr_variety' || attrs.length >= 2) && (t.m !== 'good_attr' || attrs.length));
    if (!elig.length) return { ok: false, err: 'No hay otras misiones disponibles.' };
    d.list[i] = E.mkMission(S, E.pick(elig), 'daily', { nGood, attrs });
    d.reroll = true;
    return { ok: true, ev: [] };
  };

  /* ---------- campaña ---------- */
  E.metric = (S, m) => {
    const h = S.hero, st = S.stats;
    if (m.indexOf('flag_') === 0) return S.flags[m.slice(5)] ? 1 : 0;
    if (m.indexOf('attr_') === 0) return h ? h.attrs[m.slice(5)].lvl : 0;
    switch (m) {
      case 'habits': return st.habits;
      case 'level': return h ? h.level : 0;
      case 'maxStreak': return st.maxStreak;
      case 'streakCur': return Math.max(0, ...S.habits.map(x => x.bs));
      case 'dailyClaimed': return st.dailyClaimed;
      case 'attrsAt3': return h ? D.ATTR_KEYS.filter(k => h.attrs[k].lvl >= 3).length : 0;
      case 'attrMin': return h ? Math.min(...D.ATTR_KEYS.map(k => h.attrs[k].lvl)) : 0;
      case 'perfectDays': return st.perfectDays;
      case 'cleanDays': return st.cleanDays;
      case 'cleanStreak': return st.cleanStreak;
      case 'bosses': return S.ms.boss.won;
      case 'balance': return st.balance;
      case 'explore': return st.explore;
      case 'events': return st.events;
      case 'pulls': return st.pulls;
      case 'gotR2': return st.gotR2; case 'gotR3': return st.gotR3; case 'gotR4': return st.gotR4;
      case 'items': return Object.keys(S.inv).filter(id => { const d = E.itemDef(S, id); return d && d.slot !== 'pet'; }).length;
      case 'pets': return Object.keys(S.inv).filter(id => { const d = E.itemDef(S, id); return d && d.slot === 'pet'; }).length;
      case 'chapter': return S.ms.story.ch;
      case 'goldEarned': return st.goldEarned;
      case 'realRewards': return st.realRewards;
      case 'upgrades': return st.upgrades;
      case 'maxUpgrade': return Math.max(0, ...Object.values(S.inv).map(x => x.lvl || 0));
      case 'deaths': return st.deaths; case 'revives': return st.revives; case 'permadeaths': return st.permadeaths;
      case 'undos': return st.undos; case 'crits': return st.crits;
      default: return 0;
    }
  };
  E.storyBase = S => { const b = {}; ['habits', 'dailyClaimed', 'perfectDays', 'cleanDays', 'balance', 'explore'].forEach(k => { b[k] = E.metric(S, k); }); return b; };
  E.storyState = S => {
    const st = S.ms.story; if (st.ch >= D.CHAPTERS.length) return { done: true };
    const c = D.CHAPTERS[st.ch];
    const obj = c.obj.map(o => { const cur = E.metric(S, o.m) - (o.rel ? (st.base[o.m] || 0) : 0); return { t: o.t, cur: Math.max(0, Math.min(o.v, cur)), v: o.v, ok: cur >= o.v }; });
    return { ch: st.ch, c, obj, ready: obj.every(o => o.ok) };
  };
  E.claimChapter = S => {
    const ev = [], s = E.storyState(S);
    if (s.done || !s.ready) return { ok: false, err: 'Completa los objetivos del capítulo.' };
    if (S.hero.status !== 'alive') return { ok: false, err: 'Revive para continuar la historia.' };
    const got = E.grant(S, s.c.rw, ev, true);
    S.ms.story.ch++;
    S.ms.story.base = E.storyBase(S);
    ev.unshift({ type: 'chapter', ch: s.ch, n: s.c.n, outro: s.c.outro, got });
    E.checkAch(S, ev);
    return { ok: true, ev };
  };

  /* ---------- jefes ---------- */
  E.bossInfo = S => {
    const b = S.ms.boss, i = b.cur ? b.cur.i : b.idx, def = D.BOSSES[i % D.BOSSES.length], tier = Math.floor(i / D.BOSSES.length);
    const L = S.hero ? S.hero.level : 1;
    const max = R(def.hp * (1 + 0.05 * Math.max(0, L - 6)) * (1 + 0.5 * tier));
    return { def, tier, max, name: def.n + (tier ? ' ' + 'I'.repeat(Math.min(3, tier + 1)) : '') };
  };
  E.startBoss = S => {
    const ev = []; E.refresh(S, ev);
    const b = S.ms.boss, now = E.now(S);
    if (!E.unlocked(S, 'bosses')) return { ok: false, err: 'Los jefes se desbloquean en el nivel ' + E.unlockLevel('bosses') + '.' };
    if (S.hero.status !== 'alive') return { ok: false, err: 'Los caídos no pueden desafiar jefes.' };
    if (b.cur) return { ok: false, err: 'Ya estás luchando contra un jefe.' };
    if (b.next > now) return { ok: false, err: 'El próximo jefe aparece mañana.' };
    const info = E.bossInfo(S);
    b.cur = { i: b.idx, hp: info.max, max: info.max, until: now + info.def.days * DAY, start: now, dealt: 0 };
    ev.push({ type: 'bossstart', n: info.name });
    return { ok: true, ev };
  };
  E.defeatBoss = (S, ev) => {
    const b = S.ms.boss, cur = b.cur, info = E.bossInfo(S), i = cur.i;
    const rw = Object.assign({ gems: 80 + 20 * (i % 8), gold: 300 + 100 * (i % 8), std: 1 }, info.tier ? { gems: 150 + 30 * (i % 8), std: 2 } : info.def.rw || {});
    if (info.def.rw && !info.tier) { Object.keys(info.def.rw).forEach(k => { rw[k] = info.def.rw[k]; }); if (info.def.rw.gems) rw.gems = info.def.rw.gems; }
    b.cur = null; b.idx++; b.won++; b.next = E.endOfDay(E.now(S));
    S.stats.bossesTotal++;
    const got = E.grant(S, rw, ev, true);
    ev.push({ type: 'bossdefeat', n: info.name, got });
  };

  /* ---------- gacha ---------- */
  E.rollRarity = (rng, min) => {
    let tot = 0; for (let i = min; i < 5; i++) tot += D.RARITY[i].w;
    let r = rng() * tot;
    for (let i = min; i < 5; i++) { r -= D.RARITY[i].w; if (r < 0) return i; }
    return 4;
  };
  E.featured = S => { const wk = E.weekKey(E.dayKey(E.now(S))); const n = Math.floor(E.dayDate(wk).getTime() / (7 * DAY)); return D.FEATURED_ROTATION[((n % D.FEATURED_ROTATION.length) + D.FEATURED_ROTATION.length) % D.FEATURED_ROTATION.length]; };
  E.pool = (S, banner, r) => D.ITEMS.filter(i => i.src === 'gacha' && i.r === r && (D.BANNERS[banner].pool === 'pet' ? i.slot === 'pet' : i.slot !== 'pet'));
  /* Una tirada. Devuelve {id, r, dup, dust, pity:'epic'|'leg'|null, feat} — no cobra */
  E.pullOne = (S, banner, rng) => {
    rng = rng || E.rng;
    const p = S.gacha.pity[banner];
    p.e++; p.l++;
    let min = 0, forced = null;
    if (p.l >= D.GACHA.legPity) { min = 3; forced = 'leg'; } else if (p.e >= D.GACHA.epicPity) { min = 2; forced = 'epic'; }
    const r = E.rollRarity(rng, min);
    if (r >= 2) p.e = 0;
    if (r >= 3) p.l = 0;
    let id, feat = false;
    if (banner === 'feat') {
      const F = E.featured(S);
      if (r === 3) { if (p.g || rng() < 0.5) { id = F.leg; feat = true; p.g = false; } else { p.g = true; const pl = E.pool(S, banner, 3).filter(i => i.id !== F.leg); id = pl[Math.floor(rng() * pl.length)].id; } }
      else if (r === 2 && rng() < 0.5) { id = F.ep[Math.floor(rng() * F.ep.length)]; feat = true; }
    }
    if (!id) { const pl = E.pool(S, banner, r); id = pl[Math.floor(rng() * pl.length)].id; }
    const res = E.addItem(S, id);
    S.stats.pulls++;
    if (r >= 2) S.stats['gotR' + r] = (S.stats['gotR' + r] || 0) + 1;
    S.gacha.hist.unshift({ t: E.now(S), id, r, b: banner });
    if (S.gacha.hist.length > 60) S.gacha.hist.length = 60;
    return { id, r, dup: res.dup, dust: res.dust, pity: forced && r >= min ? forced : null, feat };
  };
  E.pullCost = (S, banner, n) => {
    const h = S.hero, tk = D.BANNERS[banner].ticket, have = h.tickets[tk] || 0;
    const useT = Math.min(have, n), rest = n - useT;
    const gems = rest === 10 ? D.GACHA.cost10 : rest * D.GACHA.cost1;
    return { tickets: useT, gems, ok: h.gems >= gems, tk };
  };
  E.pull = (S, banner, n, rng) => {
    const ev = []; E.refresh(S, ev);
    const h = S.hero, B = D.BANNERS[banner];
    if (!B) return { ok: false, err: 'Banner no válido.' };
    if (h.level < B.unlock) return { ok: false, err: 'Se desbloquea en el nivel ' + B.unlock + '.' };
    if (h.status !== 'alive') return { ok: false, err: 'Los caídos no pueden invocar. Completa el Ritual de Resurrección.' };
    const c = E.pullCost(S, banner, n);
    if (!c.ok) return { ok: false, err: 'Gemas insuficientes. Te faltan ' + (c.gems - h.gems) + '.' };
    h.tickets[c.tk] -= c.tickets; h.gems -= c.gems;
    const res = [];
    for (let i = 0; i < n; i++) res.push(E.pullOne(S, banner, rng));
    E.track(S, { type: 'pull', n }, ev);
    E.checkAch(S, ev);
    return { ok: true, res, ev };
  };
  E.openSpecial = (S, kind) => {
    const ev = [], h = S.hero;
    if (h.status !== 'alive') return { ok: false, err: 'Los caídos no pueden abrir cofres.' };
    let r, pool;
    if (kind === 'gold_t') { if (h.tickets.gold < 1) return { ok: false, err: 'No tienes Tickets Dorados.' }; h.tickets.gold--; r = 3; }
    else if (kind === 'chest') { if (h.chests < 1) return { ok: false, err: 'No tienes cofres.' }; h.chests--; r = E.rollRarity(E.rng, 2); }
    else return { ok: false, err: '?' };
    pool = E.pool(S, 'std', r);
    const id = E.pick(pool).id, res = E.addItem(S, id);
    if (r >= 2) S.stats['gotR' + r]++;
    E.checkAch(S, ev);
    return { ok: true, res: [{ id, r, dup: res.dup, dust: res.dust }], ev };
  };
  /* Probabilidad de la siguiente tirada (informativa) */
  E.pityInfo = (S, banner) => { const p = S.gacha.pity[banner]; return { epicIn: D.GACHA.epicPity - p.e, legIn: D.GACHA.legPity - p.l, guar: !!p.g }; };

  /* ---------- inventario ---------- */
  E.equip = (S, id) => {
    const def = E.itemDef(S, id); if (!def || !S.inv[id]) return { ok: false, err: 'No tienes ese objeto.' };
    S.hero.eq[def.slot] = id; return { ok: true, ev: [] };
  };
  E.unequip = (S, slot) => { S.hero.eq[slot] = null; return { ok: true, ev: [] }; };
  E.upgradeCost = (S, id) => { const def = E.itemDef(S, id), lvl = S.inv[id].lvl || 0; return lvl >= 5 ? null : D.RARITY[def.r].upg * (lvl + 1); };
  E.upgrade = (S, id) => {
    if (!E.unlocked(S, 'forge')) return { ok: false, err: 'La Forja se desbloquea en el nivel ' + E.unlockLevel('forge') + '.' };
    if (!S.inv[id]) return { ok: false, err: 'No tienes ese objeto.' };
    const def = E.itemDef(S, id);
    if (def.b.ritual) return { ok: false, err: 'Este objeto no se puede mejorar.' };
    const cost = E.upgradeCost(S, id);
    if (cost === null) return { ok: false, err: 'Ya está al máximo (+5).' };
    if (S.hero.dust < cost) return { ok: false, err: 'Polvo estelar insuficiente.' };
    S.hero.dust -= cost; S.inv[id].lvl++; S.stats.upgrades++;
    const ev = [{ type: 'upgrade', id, lvl: S.inv[id].lvl }]; E.checkAch(S, ev);
    return { ok: true, ev };
  };
  E.setTitle = (S, t) => { if (S.owned.titles.indexOf(t) < 0) return { ok: false, err: 'Título bloqueado.' }; S.hero.title = t; return { ok: true, ev: [] }; };
  E.setSkin = (S, id) => {
    if (id && S.owned.skins.indexOf(id) < 0) return { ok: false, err: 'Skin bloqueada.' };
    const k = id ? D.SKINS[id].k : null;
    if (k === 'aura') S.hero.aura = id; else S.hero.skin = id;
    return { ok: true, ev: [] };
  };
  E.clearSkin = (S, k) => { if (k === 'aura') S.hero.aura = null; else S.hero.skin = null; return { ok: true, ev: [] }; };

  /* ---------- tiendas ---------- */
  E.ensureShop = (S, today) => {
    if (S.shop.day === today) return;
    const rng = E.seeded(hashStr(today + (S.hero ? S.hero.name : '')));
    const keys = ['granpocion', 'amuleto', 'elixir', 'ticket', 'gemas'];
    const slots = [{ k: 'pocion', sold: 0 }];
    E.shuffle(keys, rng).slice(0, 3).forEach(k => slots.push({ k, sold: 0 }));
    const eq = D.ITEMS.filter(i => i.src === 'gacha' && i.slot !== 'pet' && i.r <= 2);
    const picks = E.shuffle(eq, rng);
    let added = 0;
    for (const it of picks) { if (added >= 2) break; if (it.r === 2 && rng() < 0.6) continue; slots.push({ k: 'item', id: it.id, sold: 0 }); added++; }
    if (S.owned.skins.indexOf('sk_hoodie') < 0 && rng() < 0.25) slots.push({ k: 'hoodie', sold: 0 });
    S.shop = { day: today, slots };
  };
  E.shopPrice = (S, slot) => {
    const base = slot.k === 'item' ? D.SHOP_ITEM_PRICE[D.ITEM[slot.id].r] : D.SHOP_ITEMS[slot.k].price;
    return R(base * (1 - E.mods(S).shop));
  };
  E.shopMax = slot => (slot.k === 'item' ? 1 : D.SHOP_ITEMS[slot.k].max);
  E.buyShop = (S, i) => {
    const ev = []; E.refresh(S, ev);
    const h = S.hero, slot = S.shop.slots[i];
    if (!E.unlocked(S, 'shop')) return { ok: false, err: 'La tienda se desbloquea en el nivel ' + E.unlockLevel('shop') + '.' };
    if (h.status !== 'alive') return { ok: false, err: 'Los caídos no pueden comprar.' };
    if (!slot || slot.sold >= E.shopMax(slot)) return { ok: false, err: 'Agotado. Vuelve mañana.' };
    if (slot.k === 'item' && S.inv[slot.id]) return { ok: false, err: 'Ya tienes este objeto.' };
    if (slot.k === 'amuleto' && h.shield >= 3) return { ok: false, err: 'Ya tienes 3 amuletos.' };
    const price = E.shopPrice(S, slot);
    if (h.gold < price) return { ok: false, err: 'Oro insuficiente.' };
    h.gold -= price; slot.sold++; S.stats.goldSpent += price;
    const now = E.now(S);
    let got = [];
    switch (slot.k) {
      case 'pocion': got = [{ k: 'hp', v: E.heal(S, 30) }]; break;
      case 'granpocion': got = [{ k: 'hp', v: E.heal(S, 80) }]; break;
      case 'amuleto': h.shield++; got = [{ k: 'shield', v: 1 }]; break;
      case 'elixir': h.buffs.push({ id: 'elixir', n: 'Elixir de Sabiduría', until: now + DAY, b: { all: 0.25 } }); got = [{ k: 'buff', v: 'Elixir de Sabiduría' }]; break;
      case 'ticket': got = E.grant(S, { std: 1 }, ev, true); break;
      case 'gemas': got = E.grant(S, { gems: 60 }, ev, true); break;
      case 'item': got = E.grant(S, { item: slot.id }, ev, true); break;
      default: if (D.SHOP_ITEMS[slot.k].skin) got = E.grant(S, { skin: D.SHOP_ITEMS[slot.k].skin }, ev, true);
    }
    ev.push({ type: 'buy', price, got });
    E.checkAch(S, ev);
    return { ok: true, ev };
  };
  E.buyDust = (S, id) => {
    const ev = [], h = S.hero, it = D.DUST_SHOP.find(x => x.id === id);
    if (!it) return { ok: false, err: '?' };
    if (h.status !== 'alive') return { ok: false, err: 'Los caídos no pueden canjear.' };
    if (it.skin && S.owned.skins.indexOf(it.skin) >= 0) return { ok: false, err: 'Ya la tienes.' };
    if (it.title && S.owned.titles.indexOf(it.title) >= 0) return { ok: false, err: 'Ya lo tienes.' };
    if (h.dust < it.price) return { ok: false, err: 'Polvo estelar insuficiente.' };
    h.dust -= it.price;
    let got;
    if (id === 'd_ticket') got = E.grant(S, { std: 1 }, ev, true);
    else if (id === 'd_petticket') got = E.grant(S, { pet: 1 }, ev, true);
    else if (id === 'd_cofre') { const p = E.pool(S, 'std', 3); const pick = E.pick(p).id; got = E.grant(S, { item: pick }, ev, true); S.stats.gotR3++; }
    else got = E.grant(S, { skin: it.skin, title: it.title }, ev, true);
    ev.push({ type: 'buy', price: it.price, got, dust: true });
    E.checkAch(S, ev);
    return { ok: true, ev };
  };
  E.buyReal = (S, rid) => {
    const ev = [], h = S.hero, r = S.real.find(x => x.id === rid);
    if (!r) return { ok: false, err: 'Recompensa no encontrada.' };
    if (h.status !== 'alive') return { ok: false, err: 'Los caídos no reclaman tesoros. Revive primero.' };
    if (h.gold < r.price) return { ok: false, err: 'Te faltan ' + (r.price - h.gold) + ' de oro.' };
    h.gold -= r.price; S.stats.goldSpent += r.price; S.stats.realRewards++;
    S.realHist.unshift({ t: E.now(S), n: r.n, price: r.price, ic: r.ic });
    if (S.realHist.length > 200) S.realHist.length = 200;
    ev.push({ type: 'buy', price: r.price, real: r.n });
    E.checkAch(S, ev);
    return { ok: true, ev };
  };
  E.saveReal = (S, o) => {
    const n = String(o.n || '').trim().slice(0, 40), price = Math.max(1, Math.min(999999, Math.floor(Number(o.price) || 0)));
    if (!n) return { ok: false, err: 'Escribe un nombre.' };
    if (o.id) { const r = S.real.find(x => x.id === o.id); if (!r) return { ok: false, err: '?' }; r.n = n; r.price = price; r.ic = o.ic || r.ic; }
    else S.real.push({ id: 'r' + Date.now().toString(36) + Math.floor(Math.random() * 1000), n, price, ic: o.ic || 'gift' });
    return { ok: true, ev: [] };
  };
  E.delReal = (S, id) => { S.real = S.real.filter(x => x.id !== id); return { ok: true, ev: [] }; };

  /* ---------- gestión de hábitos ---------- */
  E.saveHabit = (S, o) => {
    const n = String(o.n || '').trim().slice(0, 40);
    if (!n) return { ok: false, err: 'Escribe un nombre para el hábito.' };
    if (!D.ATTRS[o.a] || !D.DIFF[o.d]) return { ok: false, err: 'Datos inválidos.' };
    const f = ['daily', 'weekly', 'once'].indexOf(o.f) >= 0 ? o.f : 'daily';
    const x = clamp(Math.floor(Number(o.x) || 3), 1, 6);
    if (o.id) {
      const h = E.habit(S, o.id); if (!h) return { ok: false, err: '?' };
      Object.assign(h, { n, a: o.a, d: o.d, ic: o.ic || h.ic });
      if (h.type === 'good') { if (h.f !== f) { h.st = 0; } h.f = f; h.x = x; }
      return { ok: true, ev: [], id: h.id };
    }
    const id = 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
    const type = o.type === 'bad' ? 'bad' : 'good';
    S.habits.push(E.mkHabit({ id, n, type, a: o.a, d: o.d, f: type === 'bad' ? 'daily' : f, x, ic: o.ic || 'star', on: true, cu: true, c: E.now(S) }));
    return { ok: true, ev: [], id };
  };
  E.toggleHabit = (S, id, on) => { const h = E.habit(S, id); if (!h) return { ok: false, err: '?' }; h.on = on; if (h.f === 'once' && on) h.done = false; return { ok: true, ev: [] }; };
  E.delHabit = (S, id) => { S.habits = S.habits.filter(h => h.id !== id); return { ok: true, ev: [] }; };

  /* ---------- bono diario ---------- */
  E.loginReady = S => S.hero && S.login.day !== E.dayKey(E.now(S));
  E.loginNext = S => { const today = E.dayKey(E.now(S)); const cont = S.login.day === E.addDays(today, -1); return cont ? S.login.n % 7 : 0; };
  E.claimLogin = S => {
    const ev = [];
    if (!E.loginReady(S)) return { ok: false, err: 'Ya reclamaste el bono de hoy.' };
    if (S.hero.status !== 'alive') return { ok: false, err: 'Los caídos no reciben bonos.' };
    const idx = E.loginNext(S), today = E.dayKey(E.now(S));
    S.login = { day: today, n: idx + 1 };
    const got = E.grant(S, D.LOGIN[idx], ev, true);
    ev.unshift({ type: 'claim', t: 'Bono diario · Día ' + (idx + 1), got, k: 'login' });
    return { ok: true, ev };
  };

  /* ---------- logros ---------- */
  E.checkAch = (S, ev) => {
    D.ACHIEVEMENTS.forEach(a => {
      if (S.ach[a.id]) return;
      if (E.metric(S, a.m) >= a.v) {
        S.ach[a.id] = E.now(S);
        let got = [];
        if (S.hero) got = E.grant(S, a.rw, ev, true);
        else (S.pending = S.pending || []).push(a.rw);
        ev.push({ type: 'achievement', id: a.id, n: a.n, got });
      }
    });
  };

  /* ---------- respaldo ---------- */
  E.serialize = S => JSON.stringify(S);
  E.migrate = raw => {
    let o = raw;
    if (typeof raw === 'string') { try { o = JSON.parse(raw); } catch (e) { throw new Error('El archivo no es un JSON válido.'); } }
    if (!o || o.app !== 'lifemod') throw new Error('Este archivo no es un respaldo de LifeMOD.');
    if (o.v > D.VERSION) throw new Error('El respaldo es de una versión más nueva de LifeMOD.');
    const base = E.newState();
    const deep = (b, x) => {
      if (x === undefined) return b;
      if (b && typeof b === 'object' && !Array.isArray(b) && x && typeof x === 'object' && !Array.isArray(x)) {
        const out = Object.assign({}, b);
        Object.keys(x).forEach(k => { out[k] = deep(b[k], x[k]); });
        return out;
      }
      return x;
    };
    const S = deep(base, o);
    S.habits = (o.habits || base.habits).map(h => Object.assign(E.mkHabit(h), h));
    // asegura hábitos predefinidos nuevos
    D.HABITS.forEach(d => { if (!S.habits.find(h => h.id === d.id)) S.habits.push(E.mkHabit(Object.assign({}, d, { on: false }))); });
    if (S.hero) {
      S.hero = deep({ tickets: { std: 0, pet: 0, gold: 0 }, buffs: [], shield: 0, chests: 0, eq: { weapon: null, armor: null, accessory: null, pet: null } }, S.hero);
    }
    S.v = D.VERSION;
    return S;
  };

  /* ---------- herramientas de desarrollo ---------- */
  E.devAdvance = (S, days) => { S.debugOffset = (S.debugOffset || 0) + days * DAY; return E.refresh(S, []); };

  G.LME = E;
})(typeof window !== 'undefined' ? window : globalThis);
