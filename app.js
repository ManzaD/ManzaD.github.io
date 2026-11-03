/* LifeMOD — núcleo de la app: estado, guardado, acciones, eventos, PWA */
(function (G) {
  'use strict';
  const D = G.LMD, E = G.LME, A = G.LMA, AU = G.LMAU, FX = G.LMFX;
  const App = G.LM = G.LM || {};
  const KEY = 'lifemod-save-v1';
  App.view = 'home';
  App.tab = { missions: 'daily', gacha: 'std', inv: 'all', rar: -1, shop: 'items', habits: 'good' };
  App.ui = {};
  let memStore = null, snap = null, toastSeq = 0;

  /* ---------- guardado ---------- */
  App.load = () => {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = memStore; }
    if (raw) { try { return E.migrate(raw); } catch (e) { App.loadError = e.message; } }
    return E.newState();
  };
  let saveT = 0;
  App.save = () => {
    const json = E.serialize(App.S);
    try { localStorage.setItem(KEY, json); App.storageOk = true; } catch (e) { memStore = json; App.storageOk = false; }
    clearTimeout(saveT); saveT = setTimeout(App.syncReminderCfg, 800);
  };

  /* ---------- utilidades ---------- */
  App.esc = s => String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  App.fmt = n => Math.round(n).toLocaleString('es-CO');
  App.fmtS = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' M' : n >= 1e5 ? Math.floor(n / 1e3) + ' k' : n >= 1e4 ? (n / 1e3).toFixed(1).replace('.', ',') + ' k' : App.fmt(n);
  App.inArtifact = !!G.LM_ARTIFACT;
  App.left = ms => {
    if (ms <= 0) return '0 min';
    const m = Math.floor(ms / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
    if (d >= 1) return d + ' d ' + (h % 24) + ' h';
    if (h >= 1) return h + ' h ' + (m % 60) + ' min';
    return Math.max(1, m) + ' min';
  };
  App.now = () => E.now(App.S);
  App.vib = p => { if (App.S.settings.haptics) FX.vibrate(p); };
  App.snd = (n, a) => { AU.on = App.S.settings.sound; AU.setVolume(App.S.settings.volume); AU.play(n, a); };

  /* ---------- toasts ---------- */
  App.toast = (html, o) => {
    o = o || {};
    const box = document.getElementById('toasts'); if (!box) return;
    const id = 't' + (++toastSeq);
    const el = document.createElement('div');
    el.className = 'toast ' + (o.cls || '') + (o.undo ? ' undo' : ''); el.id = id; el.setAttribute('role', 'status');
    el.innerHTML = html + (o.btn ? `<button class="tbtn" data-act="${o.btnAct}">${o.btn}</button>` : '');
    box.appendChild(el);
    if (o.undo) box.querySelectorAll('.toast.undo').forEach(x => { if (x !== el) x.remove(); });
    while (box.children.length > 3) { const victim = Array.from(box.children).find(x => !x.classList.contains('undo') && x !== el) || box.firstChild; victim.remove(); }
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 320); }, o.ms || 2800);
    return el;
  };
  App.err = msg => { App.snd('error'); App.toast(A.icon('info') + '<span>' + App.esc(msg) + '</span>', { cls: 'err' }); };

  /* ---------- superposiciones (cola) ---------- */
  const queue = []; let showing = false;
  App.overlay = (o) => { if (o.now) return mount(o, false); queue.push(o); if (!showing) next(); };
  function next() {
    const o = queue.shift();
    if (!o) { showing = false; return; }
    showing = true; mount(o, true);
  }
  function mount(o, queued) {
    const root = document.getElementById('overlay-root');
    const el = document.createElement('div');
    el.className = 'ov ' + (o.cls || '');
    el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.innerHTML = o.html;
    root.appendChild(el);
    const close = () => { if (el._closed) return; el._closed = true; el.remove(); if (o.onClose) o.onClose(); App.render(); if (queued) setTimeout(next, 60); };
    el._close = close;
    el.addEventListener('click', ev => {
      const b = ev.target.closest('[data-close]');
      if (b || (o.tapClose && ev.target === el)) { ev.preventDefault(); ev.stopPropagation(); close(); }
    });
    if (o.onShow) o.onShow(el, close);
    const f = el.querySelector('[data-autofocus]') || el.querySelector('button, input');
    if (f && !o.noFocus) setTimeout(() => { try { f.focus({ preventScroll: true }); } catch (e) { /* */ } }, 50);
  }
  App.closeTop = () => { const els = document.querySelectorAll('#overlay-root .ov'); const el = els[els.length - 1]; if (el && el._close) el._close(); };
  App.sheet = (title, body, o) => {
    o = o || {};
    App.overlay({ now: true, cls: 'as-sheet', tapClose: true, html: `<div class="sheet ${o.cls || ''}"><div class="sheet-h"><h2>${title}</h2><button class="icon-btn" data-close aria-label="Cerrar">${A.icon('x')}</button></div>${body}</div>`, onShow: o.onShow, onClose: o.onClose, noFocus: o.noFocus });
  };
  App.confirm = (title, text, okLabel, onOk, danger) => {
    App.sheet(title, `<p class="muted" style="margin:0">${text}</p><div class="row" style="justify-content:flex-end"><button class="btn ghost" data-close>Cancelar</button><button class="btn ${danger ? 'red' : 'gold'}" data-confirm-ok>${okLabel}</button></div>`, {
      onShow: (el, close) => el.querySelector('[data-confirm-ok]').addEventListener('click', () => { close(); onOk(); })
    });
  };

  /* ---------- ejecución de acciones del motor ---------- */
  App.run = (res, origin, o) => {
    o = o || {};
    if (!res) return res;
    if (!res.ok) { App.err(res.err); return res; }
    App.save();
    if (o.renderFirst !== false) App.render();
    if (res.ev && res.ev.length) App.handle(res.ev, origin);
    return res;
  };

  App.handle = (ev, origin) => {
    const S = App.S;
    const o = origin ? FX.rectOf(origin) : { x: innerWidth / 2, y: innerHeight / 2 };
    let delay = 0;
    ev.forEach(e => {
      switch (e.type) {
        case 'complete': {
          const h = E.habit(S, e.habit), col = h ? D.ATTRS[h.a].c : '#ffc12e';
          if (S.hero && S.hero.status === 'fallen') { FX.float(o.x - 40, o.y - 10, 'Caído: sin XP', 'boss'); App.snd('tap'); break; }
          if (e.crit) { FX.float(o.x, o.y - 40, '¡CRÍTICO!', 'crit'); App.snd('crit'); FX.burst(o.x, o.y, ['#fff', '#ff5ad1', '#ffe066'], 28, { speed: 7 }); }
          else App.snd('complete');
          FX.float(o.x - 30, o.y - 10, '+' + e.xp + ' XP', 'xp');
          FX.float(o.x + 34, o.y + 6, '+' + e.gold + ' oro', 'gold', 120);
          if (e.gems) FX.float(o.x, o.y + 22, '+' + e.gems + ' gemas', 'gem', 240);
          if (e.heal) FX.float(o.x, o.y - 60, '+' + e.heal + ' HP', 'heal', 200);
          if (e.dmg) FX.float(o.x, o.y + 40, '−' + e.dmg + ' al jefe', 'boss', 300);
          FX.burst(o.x, o.y, [col, '#ffe066', '#ffffff'], 18);
          FX.fly(o, document.querySelector('[data-xpbar]'), '#7df9ff', 10);
          App.vib(18);
          break;
        }
        case 'damage': {
          App.snd('damage'); FX.flash('red'); FX.shake(e.dmg >= 20 ? 'shake-big' : 'shake'); App.vib([70, 40, 90]);
          const hb = document.querySelector('[data-hpbar]'); const p = hb ? FX.rectOf(hb) : o;
          if (e.dmg) FX.float(p.x, p.y - 10, '−' + e.dmg + ' HP', 'dmg'); else FX.float(o.x, o.y, 'Registrado', 'boss');
          FX.burst(o.x, o.y, ['#ff4d6d', '#5c0a1e', '#ff9a6b'], 14, { g: 0.25 });
          if (e.bossHeal) App.toast(A.icon('skull') + `<span>El jefe se cura ${e.bossHeal} HP</span>`, { cls: 'err' });
          break;
        }
        case 'lowhp': App.toast(A.cur('hp', 22) + `<span>¡HP crítico! Te quedan ${e.hp} HP. Cumple hábitos de Vitalidad o compra una poción.</span>`, { cls: 'err', ms: 4500 }); break;
        case 'levelup': App.overlay(App.UI.ovLevel(e)); break;
        case 'attrup': App.toast(`<span class="chip" style="background:${D.ATTRS[e.attr].c};color:#1d1430">${D.ATTRS[e.attr].short}</span><span>${D.ATTRS[e.attr].n} sube a nivel ${e.lvl}</span>`); break;
        case 'perfect': setTimeout(() => { FX.confetti(); App.snd('claim'); }, 250); App.toast(A.cur('xp', 22) + `<span>¡Día Perfecto!${e.gems ? ' +' + e.gems + ' gemas y +' + e.heal + ' HP' : ''}</span>`, { cls: 'ach', ms: 3500 }); break;
        case 'streak': App.toast(A.icon('flame') + `<span>¡Racha de ${e.st} días en «${App.esc(e.habit)}»! +${e.gems} gemas</span>`, { cls: 'ach', ms: 3500 }); break;
        case 'achievement': delay += 400; setTimeout(() => { App.snd('achievement'); App.toast(`${A.icon('trophy')}<span>Logro: <b>${App.esc(e.n)}</b>${App.rwText(e.got)}</span>`, { cls: 'ach', ms: 4000 }); }, delay); break;
        case 'missiondone': App.toast(A.icon('scroll') + `<span>Misión lista para reclamar: ${App.esc(e.t)}</span>`); break;
        case 'claim':
          App.snd('claim'); FX.burst(o.x, o.y, ['#ffe066', '#ff5ad1', '#7df9ff'], 24, { speed: 6 });
          if (e.k === 'chest' || e.k === 'login') App.overlay(App.UI.ovRewards(e.t, e.got));
          else App.toast(A.icon('gift') + `<span>Recompensa: ${App.rwText(e.got, true)}</span>`, { ms: 3200 });
          break;
        case 'reward': App.toast(A.icon('gift') + `<span>${App.rwText(e.got, true)}</span>`); break;
        case 'chapter': App.overlay(App.UI.ovChapter(e)); break;
        case 'bossstart': App.snd('bosshit'); App.toast(A.icon('swords') + `<span>¡${App.esc(e.n)} aparece! Cumple hábitos para dañarlo.</span>`, { ms: 3500 }); break;
        case 'bossdefeat': App.overlay(App.UI.ovBoss(e)); break;
        case 'bossescape': App.toast(A.icon('skull') + `<span>${App.esc(e.n)} escapó. Podrás reintentarlo mañana.</span>`, { cls: 'err', ms: 4000 }); break;
        case 'death': App.overlay(App.UI.ovDeath(e)); break;
        case 'revive': App.overlay(App.UI.ovRevive(e)); break;
        case 'permadeath': App.overlay(App.UI.ovPerma(e)); break;
        case 'ritualday': App.toast(A.icon('flame') + `<span>${e.ok ? 'Ritual de Resurrección: día ' + e.progress + '/' + e.need + ' cumplido' : 'El ritual no se cumplió ayer. Progreso: 0/' + e.need}</span>`, { cls: e.ok ? 'ach' : 'err', ms: 4500 }); break;
        case 'ritualbroken': App.toast(A.icon('skull') + '<span>Un mal hábito rompió el ritual. Progreso reiniciado a 0.</span>', { cls: 'err', ms: 4500 }); break;
        case 'event': App.overlay(App.UI.ovEvent(e)); break;
        case 'eventend': App.toast(A.icon('clock') + `<span>Terminó el evento «${App.esc(e.n)}»</span>`); break;
        case 'streaklost': App.toast(A.icon('flame') + `<span>Se reinició la racha de ${e.n} hábito(s). No recibes daño, solo pierdes el multiplicador.</span>`, { ms: 4500 }); break;
        case 'shieldused': App.toast(A.icon('shieldstreak') + '<span>Tu Amuleto de Racha protegió tus rachas.</span>', { cls: 'ach', ms: 4000 }); break;
        case 'buy': App.snd('buy'); FX.burst(o.x, o.y, ['#ffd25e', '#fff'], 16); App.toast(A.cur(e.dust ? 'dust' : 'gold', 22) + `<span>${e.real ? '¡Disfruta tu recompensa: ' + App.esc(e.real) + '!' : 'Compra realizada' + App.rwText(e.got)}</span>`); if (e.real) FX.confetti(); break;
        case 'upgrade': App.snd('levelup'); FX.burst(o.x, o.y, ['#7df9ff', '#ffe066', '#fff'], 30, { speed: 7 }); App.toast(A.icon('hammer') + `<span>¡Objeto mejorado a +${e.lvl}!</span>`); break;
        default: break;
      }
    });
  };
  App.rwText = (got, plain) => {
    if (!got || !got.length) return '';
    const names = { xp: 'XP', gold: 'oro', gems: 'gemas', dust: 'polvo', std: 'ticket(s)', pet: 'ticket(s) de mascota', gold_t: 'Ticket Dorado', chest: 'Cofre Épico', hp: 'HP', shield: 'Amuleto' };
    const parts = got.map(g => {
      if (g.k === 'item') { const d = E.itemDef(App.S, g.v); return d ? (g.dup ? d.n + ' (duplicado → +' + g.dust + ' polvo)' : d.n) : ''; }
      if (g.k === 'title') return 'título «' + D.TITLES[g.v] + '»';
      if (g.k === 'skin') return 'skin «' + D.SKINS[g.v].n + '»';
      if (g.k === 'attrXp') return '+' + g.v + ' XP de ' + D.ATTRS[g.attr].n;
      if (g.k === 'buff') return g.v;
      return '+' + App.fmt(g.v) + ' ' + names[g.k];
    }).filter(Boolean);
    return (plain ? '' : ' · ') + App.esc(parts.join(', '));
  };

  /* ---------- deshacer ---------- */
  App.snapshot = () => { snap = E.serialize(App.S); };
  App.offerUndo = label => App.toast(`<span>${label}</span>`, { btn: 'Deshacer', btnAct: 'undo', ms: 6000, undo: true });

  /* ---------- acciones ---------- */
  const acts = {};
  App.acts = acts;
  acts.nav = el => { App.view = el.dataset.v; if (el.dataset.t) App.tab[el.dataset.k] = el.dataset.t; App.closeTop && document.querySelectorAll('#overlay-root .ov.as-sheet').forEach(x => x._close && x._close()); App.render(); window.scrollTo(0, 0); };
  acts.tab = el => { App.tab[el.dataset.k] = el.dataset.t === undefined ? el.dataset.v : (isNaN(+el.dataset.t) ? el.dataset.t : +el.dataset.t); App.render(); };
  acts.complete = el => {
    App.snapshot();
    const res = E.complete(App.S, el.dataset.id);
    if (!res.ok) return App.err(res.err);
    const r = FX.rectOf(el);
    App.save(); App.render();
    const fresh = document.querySelector(`.hab[data-hid="${el.dataset.id}"]`); if (fresh) fresh.classList.add('pop');
    App.handle(res.ev, { getBoundingClientRect: () => ({ left: r.x, top: r.y, width: 0, height: 0 }) });
    const h = E.habit(App.S, el.dataset.id);
    App.offerUndo('«' + App.esc(h.n) + '» cumplido');
  };
  acts.bad = el => {
    App.snapshot();
    const res = E.logBad(App.S, el.dataset.id);
    if (!res.ok) return App.err(res.err);
    App.save(); App.render(); App.handle(res.ev, el);
    if (!res.ev.some(e => e.type === 'death')) App.offerUndo('Mal hábito registrado');
  };
  acts.undo = () => {
    if (!snap) return;
    App.S = E.migrate(snap); snap = null;
    App.S.stats.undos++;
    const ev = []; E.checkAch(App.S, ev);
    App.save(); App.render(); App.handle(ev);
    App.toast(A.icon('refresh') + '<span>Acción deshecha</span>');
  };
  acts.claim = el => App.run(E.claimMission(App.S, el.dataset.id), el);
  acts.manual = el => {
    const m = E.findMission(App.S, el.dataset.id); if (!m) return;
    App.confirm('¿Lo cumpliste de verdad?', '«' + App.esc(m.t) + '». El honor de tu héroe está en juego: marca solo lo que hiciste en la vida real.', '¡Lo hice!', () => App.run(E.manualMission(App.S, m.id), el));
  };
  acts.chest = el => App.run(E.claimChest(App.S, el.dataset.k), el);
  acts.reroll = el => { const r = E.rerollDaily(App.S, el.dataset.id); if (r.ok) { App.snd('tap'); App.toast(A.icon('dice') + '<span>Misión cambiada</span>'); } App.run(r, el); };
  acts.chapter = el => App.run(E.claimChapter(App.S), el);
  acts.bossStart = el => App.run(E.startBoss(App.S), el);
  acts.login = el => App.run(E.claimLogin(App.S), el);
  acts.pull = el => {
    const res = E.pull(App.S, el.dataset.b, +el.dataset.n);
    if (!res.ok) return App.err(res.err);
    App.save();
    App.UI.gacha(res.res, () => { App.handle(res.ev); });
  };
  acts.special = el => {
    const res = E.openSpecial(App.S, el.dataset.k);
    if (!res.ok) return App.err(res.err);
    App.save(); App.UI.gacha(res.res, () => App.handle(res.ev));
  };
  acts.dust = el => App.run(E.buyDust(App.S, el.dataset.id), el);
  acts.rates = () => App.UI.ratesSheet();
  acts.item = el => App.UI.itemSheet(el.dataset.id);
  acts.equip = el => { const r = App.run(E.equip(App.S, el.dataset.id), el); if (r.ok) { App.snd('claim'); App.closeTop(); App.toast(A.icon('check') + '<span>Equipado</span>'); } };
  acts.unequip = el => { App.run(E.unequip(App.S, el.dataset.slot), el); App.closeTop(); };
  acts.upgrade = el => { const r = App.run(E.upgrade(App.S, el.dataset.id), el); if (r.ok) { App.closeTop(); App.UI.itemSheet(el.dataset.id); } };
  acts.title = el => { App.run(E.setTitle(App.S, el.dataset.t), el); App.snd('tap'); };
  acts.skin = el => { App.run(E.setSkin(App.S, el.dataset.id), el); App.snd('tap'); };
  acts.clearSkin = el => { App.run(E.clearSkin(App.S, el.dataset.k), el); };
  acts.buy = el => App.run(E.buyShop(App.S, +el.dataset.i), el);
  acts.real = el => {
    const r = App.S.real.find(x => x.id === el.dataset.id); if (!r) return;
    App.confirm('Canjear recompensa', `¿Canjear «${App.esc(r.n)}» por ${App.fmt(r.price)} de oro? Después, ¡disfrútala en la vida real!`, 'Canjear', () => App.run(E.buyReal(App.S, r.id), el));
  };
  acts.realForm = el => App.UI.realSheet(el.dataset.id);
  acts.realDel = el => { const r = App.S.real.find(x => x.id === el.dataset.id); App.confirm('Borrar recompensa', '¿Borrar «' + App.esc(r.n) + '»?', 'Borrar', () => { App.run(E.delReal(App.S, r.id)); App.closeTop(); }, true); };
  acts.habitForm = el => App.UI.habitSheet(el.dataset.id, el.dataset.type);
  acts.habitToggle = el => { const h = E.habit(App.S, el.dataset.id); App.run(E.toggleHabit(App.S, h.id, !h.on)); App.snd('tap'); };
  acts.habitDel = el => { const h = E.habit(App.S, el.dataset.id); App.confirm('Borrar hábito', '¿Borrar «' + App.esc(h.n) + '»? Tu historial se conserva en las estadísticas.', 'Borrar', () => { App.run(E.delHabit(App.S, h.id)); App.closeTop(); }, true); };
  acts.more = () => App.UI.moreSheet();
  acts.sound = () => { App.S.settings.sound = !App.S.settings.sound; AU.on = App.S.settings.sound; App.save(); App.render(); if (App.S.settings.sound) App.snd('claim'); };
  acts.haptics = () => { App.S.settings.haptics = !App.S.settings.haptics; App.save(); App.render(); App.vib(30); };
  acts.heroTap = el => { App.snd('tap'); App.view = 'inv'; App.render(); window.scrollTo(0, 0); };
  acts.devTap = () => {
    App.ui.devTaps = (App.ui.devTaps || 0) + 1;
    if (App.ui.devTaps >= 7 && !App.S.settings.dev) { App.S.settings.dev = true; App.save(); App.render(); App.toast(A.icon('code') + '<span>Herramientas de prueba activadas</span>'); }
  };
  acts.dev = el => {
    const S = App.S, k = el.dataset.k, ev = [];
    if (k === 'day') { App.handle(E.devAdvance(S, 1)); }
    if (k === 'gems') S.hero.gems += 1000;
    if (k === 'gold') S.hero.gold += 2000;
    if (k === 'xp') E.addXp(S, E.xpToNext(S.hero.level), null, ev);
    if (k === 'event') { S.ms.event = null; E.spawnEvent(S, null, ev); }
    if (k === 'hurt') { const h = S.habits.find(x => x.type === 'bad' && x.on) || S.habits.find(x => x.type === 'bad'); h.on = true; App.save(); return acts.bad({ dataset: { id: h.id }, getBoundingClientRect: () => ({ left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 }) }); }
    if (k === 'off') S.settings.dev = false;
    E.checkAch(S, ev); App.save(); App.render(); App.handle(ev);
  };
  acts.reset = () => App.UI.resetSheet();
  acts.exportFile = () => App.exportFile();
  acts.exportCopy = el => App.exportCopy(el);
  acts.exportShare = () => App.exportShare();
  acts.importText = () => App.UI.importSheet();
  acts.notif = () => App.toggleNotif();
  acts.notifTest = () => App.notify('LifeMOD', '¡Así se verán tus recordatorios! Tu héroe te espera.', true);
  acts.notifAdd = () => { const t = App.S.settings.reminders.times; if (t.length >= 6) return; t.push('13:00'); App.save(); App.render(); };
  acts.notifDel = el => { App.S.settings.reminders.times.splice(+el.dataset.i, 1); App.save(); App.render(); };
  acts.install = () => App.install();
  acts.legacy = () => App.UI.legacySheet();
  acts.dismissInstall = () => { App.ui.hideInstall = true; App.render(); };

  /* ---------- creación de personaje ---------- */
  acts.cStep = el => {
    const c = App.ui.create, s = +el.dataset.s;
    if (s >= 2 && !String(c.name || '').trim()) { App.err('Escribe un nombre para tu héroe.'); return; }
    c.step = s; App.render(); window.scrollTo(0, 0);
  };
  acts.cClass = el => { const c = App.ui.create; c.classId = el.dataset.id; const bad = c.habits.filter(id => (D.HABITS.find(h => h.id === id) || {}).type === 'bad'); c.habits = D.CLASS_STARTERS[c.classId].slice().concat(bad); App.snd('tap'); App.render(); };
  acts.cLook = el => { App.ui.create.look[el.dataset.k] = +el.dataset.v; App.snd('tap'); App.render(); };
  acts.cRandom = () => { const lk = App.ui.create.look; ['skin', 'face', 'eyes', 'eyeColor', 'hair', 'hairColor', 'outfit'].forEach(k => { lk[k] = Math.floor(Math.random() * D.LOOK[k].length); }); App.snd('tap'); App.render(); };
  acts.cHabit = el => { const c = App.ui.create, id = el.dataset.id, i = c.habits.indexOf(id); if (i >= 0) c.habits.splice(i, 1); else c.habits.push(id); App.render(); };
  acts.cStart = () => {
    const c = App.ui.create;
    if (!c.habits.some(id => (D.HABITS.find(h => h.id === id) || {}).type === 'good') && !App.S.habits.some(h => h.cu && h.on && h.type === 'good')) { App.err('Elige al menos un hábito positivo.'); return; }
    E.createHero(App.S, { name: c.name, classId: c.classId, look: c.look, habits: c.habits });
    App.ui.create = null; App.view = 'home';
    const ev = []; E.checkAch(App.S, ev);
    App.save(); App.render(); window.scrollTo(0, 0);
    App.snd('levelup'); FX.confetti();
    App.overlay(App.UI.ovRewards('¡Bienvenido a Hábitia!', [{ k: 'std', v: 10 }, { k: 'gems', v: 300 }, { k: 'gold', v: 200 }], 'Lumi te deja un regalo para empezar. Usa los tickets en el Gacha para conseguir tu primer equipo.'));
    App.handle(ev);
  };
  App.newCreate = () => ({ step: 0, name: '', classId: 'guerrero', look: { skin: 1, face: 0, eyes: 0, eyeColor: 0, hair: 0, hairColor: 0, outfit: 0 }, habits: D.CLASS_STARTERS.guerrero.slice().concat(D.BAD_STARTERS) });

  /* ---------- respaldo ---------- */
  App.backupName = () => 'lifemod-respaldo-' + E.dayKey(Date.now()) + '.json';
  App.exportFile = () => {
    try {
      const blob = new Blob([E.serialize(App.S)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = App.backupName();
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      App.toast(A.icon('download') + '<span>Respaldo descargado. Si no ves el archivo, usa «Copiar respaldo».</span>', { ms: 4500 });
    } catch (e) { App.err('No se pudo descargar. Usa «Copiar respaldo».'); }
  };
  App.exportCopy = () => {
    const json = E.serialize(App.S);
    const done = () => App.toast(A.icon('copy') + '<span>Respaldo copiado. Pégalo en una nota o correo para guardarlo.</span>', { ms: 4500 });
    const fallback = () => App.UI.copySheet(json);
    try { navigator.clipboard.writeText(json).then(done, fallback); } catch (e) { fallback(); }
  };
  App.exportShare = async () => {
    try {
      const f = new File([E.serialize(App.S)], App.backupName(), { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'Respaldo de LifeMOD' }); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    App.exportFile();
  };
  App.importRaw = raw => {
    let S2;
    try { S2 = E.migrate(raw); } catch (e) { App.err(e.message); return; }
    const who = S2.hero ? S2.hero.name + ' (nivel ' + S2.hero.level + ')' : 'sin personaje activo';
    App.confirm('Importar respaldo', 'Se reemplazarán todos tus datos actuales por el respaldo: ' + App.esc(who) + '. ¿Continuar?', 'Importar', () => {
      App.S = S2; App.save(); App.ui.create = null; App.view = 'home';
      App.render(); App.toast(A.icon('check') + '<span>Respaldo importado correctamente</span>', { cls: 'ach' });
      document.querySelectorAll('#overlay-root .ov').forEach(x => x._close && x._close());
    }, true);
  };

  /* ---------- notificaciones ---------- */
  App.notifSupport = () => 'Notification' in G;
  App.toggleNotif = async () => {
    const r = App.S.settings.reminders;
    if (r.on) { r.on = false; App.save(); App.render(); return; }
    if (!App.notifSupport()) { App.err('Este navegador no permite notificaciones. En iPhone, primero instala la app en tu pantalla de inicio.'); return; }
    let perm = Notification.permission;
    try { if (perm === 'default') perm = await Notification.requestPermission(); } catch (e) { perm = 'denied'; }
    if (perm !== 'granted') { App.err('Permiso de notificaciones denegado. Actívalo en los ajustes del navegador.'); return; }
    r.on = true; App.save(); App.render();
    App.registerPeriodic();
    App.toast(A.icon('bell') + '<span>Recordatorios activados</span>', { cls: 'ach' });
  };
  App.notify = async (title, body, test) => {
    if (!App.notifSupport() || Notification.permission !== 'granted') { if (test) App.err('Primero activa los recordatorios y concede el permiso.'); return; }
    const opts = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'lifemod-recordatorio', renotify: true };
    try {
      const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
      if (reg) { await reg.showNotification(title, opts); return; }
    } catch (e) { /* sigue */ }
    try { new Notification(title, opts); } catch (e) { if (test) App.err('Tu navegador no pudo mostrar la notificación.'); }
  };
  App.pendingCount = () => { const S = App.S; if (!S.hero) return 0; const dk = E.dayKey(App.now()); return E.todayHabits(S).filter(h => !E.doneToday(S, h, dk)).length; };
  App.checkReminders = () => {
    const S = App.S, r = S.settings.reminders; if (!r.on || !S.hero) return;
    const d = new Date(App.now()), hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'), dk = E.dayKey(App.now());
    r.fired = r.fired || {};
    r.times.forEach(t => {
      if (t <= hm && r.fired[t] !== dk) {
        r.fired[t] = dk; App.save();
        const n = App.pendingCount();
        if (n > 0 && (hm.slice(0, 2) === t.slice(0, 2))) App.notify('LifeMOD · ' + S.hero.name, 'Tienes ' + n + ' hábito(s) pendientes hoy. ¡Tu héroe te espera!');
      }
    });
  };
  App.syncReminderCfg = async () => {
    try {
      if (!('caches' in G) || !App.S) return;
      const c = await caches.open('lifemod-cfg');
      await c.put('cfg.json', new Response(JSON.stringify({ on: App.S.settings.reminders.on, times: App.S.settings.reminders.times, name: App.S.hero ? App.S.hero.name : '', pending: App.pendingCount(), day: E.dayKey(App.now()) }), { headers: { 'Content-Type': 'application/json' } }));
    } catch (e) { /* sin caché disponible */ }
  };
  App.registerPeriodic = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg.periodicSync) {
        const st = await navigator.permissions.query({ name: 'periodic-background-sync' });
        if (st.state === 'granted') await reg.periodicSync.register('lifemod-recordatorio', { minInterval: 6 * 3600 * 1000 });
      }
    } catch (e) { /* no disponible */ }
  };

  /* ---------- instalación PWA ---------- */
  App.isStandalone = () => (G.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  App.isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  G.addEventListener('beforeinstallprompt', e => { e.preventDefault(); App.deferredPrompt = e; if (App.S) App.render(); });
  G.addEventListener('appinstalled', () => { App.deferredPrompt = null; App.toast(A.icon('check') + '<span>¡LifeMOD instalada!</span>', { cls: 'ach' }); });
  App.install = async () => {
    if (App.deferredPrompt) { App.deferredPrompt.prompt(); try { await App.deferredPrompt.userChoice; } catch (e) { /* */ } App.deferredPrompt = null; App.render(); return; }
    App.UI.installSheet();
  };

  /* ---------- tiempo ---------- */
  App.tick = () => {
    const S = App.S; if (!S || !S.hero) return;
    if (E.dayKey(App.now()) !== S.lastDay || (S.ms.event && S.ms.event.until <= App.now()) || (S.ms.boss.cur && S.ms.boss.cur.until <= App.now())) {
      const ev = E.refresh(S); App.save(); App.render(); App.handle(ev);
    }
    document.querySelectorAll('[data-until]').forEach(el => { el.textContent = App.left(+el.dataset.until - App.now()); });
    App.checkReminders();
  };

  /* ---------- arranque ---------- */
  App.start = () => {
    App.S = App.load();
    AU.on = App.S.settings.sound;
    FX.init();
    document.addEventListener('click', ev => {
      const el = ev.target.closest('[data-act]');
      if (!el || el.disabled) return;
      AU.init();
      const fn = acts[el.dataset.act];
      if (fn) { ev.preventDefault(); fn(el, ev); }
    });
    document.addEventListener('input', ev => {
      const el = ev.target;
      if (el.id === 'c-name' && App.ui.create) { App.ui.create.name = el.value; }
      if (el.id === 'set-vol') { App.S.settings.volume = +el.value; AU.setVolume(+el.value); App.save(); }
    });
    document.addEventListener('change', ev => {
      const el = ev.target;
      if (el.id === 'set-vol') App.snd('claim');
      if (el.dataset && el.dataset.rtime !== undefined) { App.S.settings.reminders.times[+el.dataset.rtime] = el.value; App.S.settings.reminders.times.sort(); App.save(); App.render(); }
      if (el.id === 'import-file' && el.files && el.files[0]) {
        const fr = new FileReader(); fr.onload = () => App.importRaw(fr.result); fr.onerror = () => App.err('No se pudo leer el archivo.'); fr.readAsText(el.files[0]); el.value = '';
      }
    });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') App.closeTop(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) App.tick(); });
    let ev0 = [];
    if (App.S.hero) { ev0 = E.refresh(App.S); App.save(); }
    else App.ui.create = App.newCreate();
    App.render();
    if (App.loadError) App.err('No se pudieron leer los datos guardados: ' + App.loadError);
    if (ev0.length) setTimeout(() => App.handle(ev0), 400);
    setInterval(App.tick, 1000);
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* */ }
    try {
      if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !App.inArtifact) {
        navigator.serviceWorker.register('sw.js').then(() => { if (App.S.settings.reminders.on) App.registerPeriodic(); }).catch(() => {});
      }
    } catch (e) { /* sin service worker */ }
    if (G.claude && G.claude.hot && G.claude.hot.snapshot) { try { G.claude.hot.snapshot(() => ({ save: E.serialize(App.S) })); } catch (e) { /* */ } }
  };
})(typeof window !== 'undefined' ? window : globalThis);
