/* LifeMOD — efectos visuales: partículas, números flotantes, temblor, cinemáticas */
(function (G) {
  'use strict';
  const FX = {};
  let cv, cx, parts = [], raf = 0, dpr = 1, layer;
  const reduced = () => G.matchMedia && G.matchMedia('(prefers-reduced-motion: reduce)').matches;

  FX.init = () => {
    layer = document.getElementById('fx-layer');
    cv = document.getElementById('fx-canvas');
    cx = cv.getContext('2d');
    const rs = () => { dpr = Math.min(2, G.devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px'; };
    rs(); G.addEventListener('resize', rs);
  };
  function loop() {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(p => p.life < p.max);
    parts.forEach(p => {
      p.life++; p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      const k = Math.max(0, 1 - p.life / p.max), a = Math.min(1, k * 1.6);
      cx.save(); cx.globalAlpha = a; cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillStyle = p.c;
      const s = p.s * (p.shrink ? k : 1);
      if (p.shape === 'star') { cx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? s * 0.38 : s; const an = i * Math.PI / 4; cx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } cx.closePath(); cx.fill(); }
      else if (p.shape === 'rect') cx.fillRect(-s / 2, -s / 4, s, s / 2);
      else { cx.beginPath(); cx.arc(0, 0, s / 2, 0, Math.PI * 2); cx.fill(); }
      cx.restore();
    });
    if (parts.length) raf = requestAnimationFrame(loop); else { raf = 0; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  FX.burst = (x, y, colors, n, o) => {
    if (!cx) return;
    o = o || {}; n = reduced() ? Math.min(6, n) : n;
    for (let i = 0; i < n; i++) {
      const an = Math.random() * Math.PI * 2, sp = (o.speed || 5) * (0.4 + Math.random());
      parts.push({ x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - (o.up || 1.5), g: o.g === undefined ? 0.12 : o.g, drag: o.drag || 0.97,
        life: 0, max: (o.life || 50) * (0.6 + Math.random() * 0.6), s: (o.size || 9) * (0.5 + Math.random()), c: colors[i % colors.length],
        shape: o.shape || (Math.random() < 0.5 ? 'star' : 'circle'), rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, shrink: true });
    }
    kick();
  };
  FX.confetti = () => {
    if (!cx || reduced()) return;
    const cols = ['#ffc12e', '#ff5ad1', '#7df9ff', '#3ddc84', '#ffffff', '#b45cff'];
    for (let i = 0; i < 120; i++) parts.push({ x: Math.random() * innerWidth, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, g: 0.03, drag: 0.995,
      life: 0, max: 200 + Math.random() * 80, s: 8 + Math.random() * 6, c: cols[i % cols.length], shape: 'rect', rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, shrink: false });
    kick();
  };
  FX.rise = (color) => { // cenizas o luces ascendentes
    if (!cx || reduced()) return;
    for (let i = 0; i < 40; i++) parts.push({ x: Math.random() * innerWidth, y: innerHeight + Math.random() * 60, vx: (Math.random() - 0.5) * 0.6, vy: -1 - Math.random() * 2, g: 0, drag: 1,
      life: 0, max: 160 + Math.random() * 100, s: 4 + Math.random() * 6, c: color, shape: 'circle', rot: 0, vr: 0, shrink: true });
    kick();
  };
  FX.float = (x, y, text, cls, delay) => {
    if (!layer) return;
    const el = document.createElement('div');
    el.className = 'float-txt ' + (cls || '');
    el.textContent = text;
    el.style.left = x + 'px'; el.style.top = y + 'px';
    if (delay) el.style.animationDelay = delay + 'ms';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1600 + (delay || 0));
  };
  FX.shake = (cls) => {
    const app = document.getElementById('app'); if (!app || reduced()) return;
    app.classList.remove('shake', 'shake-big'); void app.offsetWidth; app.classList.add(cls || 'shake');
    setTimeout(() => app.classList.remove('shake', 'shake-big'), 600);
  };
  FX.flash = (kind) => {
    const el = document.getElementById('flash'); if (!el) return;
    el.className = ''; void el.offsetWidth; el.className = 'on ' + (kind || 'red');
  };
  FX.vibrate = p => { try { if (G.navigator && navigator.vibrate) navigator.vibrate(p); } catch (e) { /* no disponible */ } };
  FX.rectOf = el => { if (!el) return { x: innerWidth / 2, y: innerHeight / 2 }; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  FX.fly = (from, toEl, color, n) => { // partículas que viajan a la barra de XP
    if (!cx || !toEl || reduced()) return;
    const to = FX.rectOf(toEl);
    for (let i = 0; i < (n || 10); i++) {
      const t = 38 + Math.random() * 14;
      parts.push({ x: from.x + (Math.random() - 0.5) * 30, y: from.y + (Math.random() - 0.5) * 30, vx: (to.x - from.x) / t, vy: (to.y - from.y) / t, g: 0, drag: 1,
        life: 0, max: t, s: 7, c: color, shape: 'star', rot: 0, vr: 0.2, shrink: false });
    }
    kick();
  };
  G.LMFX = FX;
})(typeof window !== 'undefined' ? window : globalThis);
