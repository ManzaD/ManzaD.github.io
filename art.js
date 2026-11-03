/* LifeMOD — arte generado con SVG (estilo anime cel-shading) */
(function (G) {
  'use strict';
  const D = G.LMD;
  const A = {};
  const OL = '#1d1430';
  let uidN = 0;
  const uid = p => (p || 'u') + (++uidN).toString(36);

  /* ---------- color ---------- */
  const hex2 = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
  const rgb2 = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  A.shade = (h, amt) => { const c = hex2(h); return rgb2(c.map(v => amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)); };
  A.mix = (a, b, t) => { const x = hex2(a), y = hex2(b); return rgb2(x.map((v, i) => v + (y[i] - v) * t)); };
  const sh = (c, a) => A.shade(c, a === undefined ? -0.28 : a);
  const P = (d, fill, extra) => `<path d="${d}" fill="${fill}" stroke="${OL}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" ${extra || ''}/>`;
  const Pn = (d, fill, extra) => `<path d="${d}" fill="${fill}" ${extra || ''}/>`;
  const L = (d, w, col) => `<path d="${d}" fill="none" stroke="${col || OL}" stroke-width="${w || 3}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const C = (x, y, r, fill, stroke) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${stroke === false ? '' : `stroke="${OL}" stroke-width="3"`}/>`;
  const El = (x, y, rx, ry, fill, stroke, extra) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${stroke === false ? '' : `stroke="${OL}" stroke-width="3"`} ${extra || ''}/>`;

  /* ---------- íconos de interfaz (24×24, línea) ---------- */
  const c = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  const I = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    list: '<path d="M10 6h10M10 12h10M10 18h10M3.5 6l1.5 1.5L8 4.5M3.5 12l1.5 1.5L8 10.5M3.5 18l1.5 1.5L8 16.5"/>',
    scroll: '<path d="M8 3h10a2 2 0 0 1 2 2v12M8 3a2 2 0 0 0-2 2v12a2 2 0 0 1-2 2h12a2 2 0 0 0 2-2M10 8h6M10 12h6"/>',
    gem: '<path d="M6 3h12l4 6-10 12L2 9zM2 9h20M12 21L8 9l2-6M12 21l4-12-2-6"/>',
    bag: '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    shop: '<path d="M3 9l2-5h14l2 5M3 9h18v1.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zM5 13v7h14v-7M10 20v-4h4v4"/>',
    chart: '<path d="M5 20V11M11 20V5M17 20v-6M3 20h18"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
    gear: c(12, 12, 3) + '<path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>' + c(12, 12, 7),
    grid: '<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    sound: '<path d="M4 9h4l5-4v14l-5-4H4zM16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>',
    mute: '<path d="M4 9h4l5-4v14l-5-4H4zM17 9.5l5 5M22 9.5l-5 5"/>',
    heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-4.5 2-7 2 1 3 3 3 5 1-2 1.5-5 1-9z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    sword: '<path d="M14.5 3.5H20.5V9.5L9 21l-3-3zM5 13l6 6M3 21l3-3"/>',
    staff: '<path d="M6 21L17 8"/>' + c(18.5, 6, 3) + '<path d="M18.5 1.5v1M23 6h-1M15 2.5l.8.8"/>',
    dagger: '<path d="M16 3l5 0 0 5-9 9-5-5zM8 14l2 2M4 20l3-3"/>',
    lotus: '<path d="M12 20c-4 0-8-2-9-6 3 0 6 1 9 4 3-3 6-4 9-4-1 4-5 6-9 6zM12 18c-2.5-3-2.5-8 0-12 2.5 4 2.5 9 0 12z"/>',
    music: '<path d="M9 18V5l12-2v13"/>' + c(6, 18, 3) + c(18, 16, 3),
    skull: '<path d="M12 3a8 8 0 0 0-8 8c0 3 2 4 2 6v3h12v-3c0-2 2-3 2-6a8 8 0 0 0-8-8zM10 20v-2M14 20v-2"/>' + c(9, 12, 1.6) + c(15, 12, 1.6),
    ticket: '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM14 7v10" stroke-dasharray="0"/>',
    chest: '<path d="M3 10a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v9H3zM3 12h18M10.5 11h3v3.5h-3z"/>',
    potion: '<path d="M9 3h6M10 3v5L5 17a3 3 0 0 0 3 4h8a3 3 0 0 0 3-4l-5-9V3M7 14h10"/>',
    compass: c(12, 12, 9) + '<path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    hammer: '<path d="M11 5l6 6 3-3-6-6zM13 9l-9 9a2 2 0 0 0 3 3l9-9"/>',
    paw: '<ellipse cx="12" cy="16" rx="4.5" ry="4"/>' + c(6, 11, 2) + c(18, 11, 2) + c(9, 6, 2) + c(15, 6, 2),
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>', upload: '<path d="M12 16V4M7 9l5-5 5 5M4 21h16"/>',
    copy: '<path d="M9 9h11v11H9zM5 15H4V4h11v1"/>',
    info: c(12, 12, 9) + '<path d="M12 11v6M12 7.5v.5"/>',
    clock: c(12, 12, 9) + '<path d="M12 7v5l3 2"/>',
    lock: '<path d="M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4"/>',
    back: '<path d="M15 5l-7 7 7 7"/>', next: '<path d="M9 5l7 7-7 7"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>',
    calendar: '<path d="M3 5h18v16H3zM3 10h18M8 3v4M16 3v4"/>',
    sparkle: '<path d="M12 3l2 7 7 2-7 2-2 7-2-7-7-2 7-2z"/>',
    tomb: '<path d="M6 21V10a6 6 0 0 1 12 0v11zM4 21h16M12 8.5v6M9.5 11h5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>' + c(12, 12, 3),
    dumbbell: '<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>',
    shoe: '<path d="M3 15c0-4 2-7 4-8l3 3c2 0 4 2 9 3 2 .5 2 3 2 3H3zM3 18h18"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2zM4 20V5M19 18v3H6"/>',
    grad: '<path d="M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5M22 9v6"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    drop: '<path d="M12 3c3 5 6 8 6 12a6 6 0 0 1-12 0c0-4 3-7 6-12z"/>',
    apple: '<path d="M12 7.5c-3-2-8-1-8 4.5 0 5 3 9 5 9 1 0 2-.8 3-.8s2 .8 3 .8c2 0 5-4 5-9 0-5.5-5-6.5-8-4.5zM12 7.5c0-2 1-4 3-4.5"/>',
    sun: c(12, 12, 4) + '<path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    bed: '<path d="M3 19V7M3 14h18v5M21 14v-2a3 3 0 0 0-3-3h-7v5"/>' + c(7, 11, 1.8),
    broom: '<path d="M15 3l-4 9M7 12h8l2 9H5zM9 16v5M13 16v5"/>',
    rocket: '<path d="M12 15l-3-3c1-4 4-8 10-9-1 6-5 9-7 12zM9 12l-4 1 2-4 4-1M12 15l-1 4 4-2 1-4M6.5 17.5l-2.5 2.5"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c1 1 1 2 1 3h6c0-1 0-2 1-3A6 6 0 0 0 12 3z"/>',
    phone: '<path d="M5 3.5h4l2 5-2.5 1.5a11 11 0 0 0 5.5 5.5L15.5 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
    people: c(9, 8, 3.2) + '<path d="M3 20a6 6 0 0 1 12 0M16 14.2a5 5 0 0 1 5 5.8"/>' + c(17, 9, 2.6),
    pen: '<path d="M4 20l1-5L16 4l4 4L9 19zM13.5 6.5l4 4"/>',
    social: '<path d="M7 2.5h10v19H7zM11 18.5h2"/><path d="M12 13.5s-3-1.8-3-4a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2.2-3 4-3 4z"/>',
    cig: '<path d="M2 14h14v4H2zM16 14h2.5v4H16M21 14v4M17.5 11c0-2 2-2 2-4M20.5 11c0-2 2-3 1-5"/>',
    glass: '<path d="M7 3h10l-1 8a4 4 0 0 1-8 0zM12 15v5M8 21h8M7.5 7h9"/>',
    burger: '<path d="M4 11a8 6 0 0 1 16 0zM3 14h18M4 17h16a2 2 0 0 1-2 3H6a2 2 0 0 1-2-3z"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 6 10 6 10 9s-10 3-10 9M17 3c0 6-10 6-10 9s10 3 10 9"/>',
    owl: '<path d="M5 9c0-3.5 2.5-6 7-6s7 2.5 7 6v5a7 7 0 0 1-14 0zM11 15.5l1 1 1-1M5.5 4.5L7.5 7.5M18.5 4.5l-2 3"/>' + c(9.2, 11, 2) + c(14.8, 11, 2),
    gamepad: '<path d="M7 8h10a4 4 0 0 1 4 4v1.5a3 3 0 0 1-5.2 2L14 14h-4l-1.8 1.5A3 3 0 0 1 3 13.5V12a4 4 0 0 1 4-4zM8 10v4M6 12h4"/>' + c(15.5, 11, 0.6) + c(17.5, 13, 0.6),
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h12v4M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14.5h2"/>',
    plate: c(12, 12, 8) + c(12, 12, 4),
    couch: '<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 12a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2zM5 17v2M19 17v2"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    phonewake: '<path d="M8 4h8v17H8zM11 18h2M3 6l2 1.5M21 6l-2 1.5M4 12h1.5M20 12h-1.5"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    paint: '<path d="M12 3a9 9 0 0 0 0 18c1.2 0 2-.8 2-2 0-1-1-1.2-1-2.2 0-1 1-1.8 2-1.8h2a4 4 0 0 0 4-4C21 6.5 17 3 12 3z"/>' + c(8, 10, 1) + c(12, 7, 1) + c(16, 10, 1),
    leaf: '<path d="M5 19c0-9 6-15 15-15 0 9-6 15-15 15zM5 19l8-8"/>',
    coin: c(12, 12, 8.5) + '<path d="M12 7v10M14.5 9.2c-.6-.8-1.5-1.2-2.5-1.2-1.4 0-2.5.8-2.5 2s1 1.6 2.5 2 2.5.8 2.5 2-1.1 2-2.5 2c-1 0-2-.4-2.6-1.3"/>',
    gift: '<path d="M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9c-2-4.5-6.5-4.5-6.5-1.5S12 9 12 9zM12 9c2-4.5 6.5-4.5 6.5-1.5S12 9 12 9z"/>',
    film: '<path d="M3 5h18v14H3zM7 5v14M17 5v14M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4"/>',
    cake: '<path d="M4 21h16M5 21v-7h14v7M5 16.5c2 1 3 1 4.7 0s3-1 4.6 0 3 1 4.7 0M12 14v-3M12 8a1 1 0 0 0 1.2-1.6C13 5.5 12 4 12 4s-1 1.5-1.2 2.4A1 1 0 0 0 12 8z"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5zM5 21h14"/>',
    tea: '<path d="M4 9h12v5a5 5 0 0 1-10 0zM16 10h2a2 2 0 0 1 0 4h-2M7.5 3c0 2 2 2 2 4M11.5 3c0 2 2 2 2 4M4 21h14"/>',
    flower: c(12, 12, 2.5) + '<path d="M12 9.5C10 5 14 5 12 9.5M14.4 11.2c4-2.5 5 1.4.4 1.8M13.5 14.2c2.3 4.2-1.6 5-1.5.3M10.5 14.2c-2.3 4.2 1.6 5 1.5.3M9.6 11.2c-4-2.5-5 1.4-.4 1.8"/>',
    slime: '<path d="M4 18c0-6 4-11 8-11s8 5 8 11zM3 18h18"/>' + c(9.5, 13, 1) + c(14.5, 13, 1),
    hp: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
    bigpotion: '<path d="M9 3h6M10 3v4L4 16a4 4 0 0 0 3.5 5h9a4 4 0 0 0 3.5-5l-6-9V3M6 13h12"/>',
    elixir: '<path d="M10 3h4M10.5 3v5L7 13v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6l-3.5-5V3M7 15h10"/><path d="M12 11.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z"/>',
    shieldstreak: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 8c.6 2 3 3 3 5.5a3 3 0 0 1-6 0c0-1.3 1-2 1-3.2 1 .4 1.5 1.4 1.5 2.4.5-1 .8-2.5.5-4.7z"/>',
    petticket: '<path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z"/>' + c(12, 13, 2) + c(9.5, 10, 1) + c(14.5, 10, 1),
    skin: '<path d="M12 6a2 2 0 1 1 2-2M12 6v1.5L3 15v2h18v-2l-9-7.5"/>',
    target: c(12, 12, 9) + c(12, 12, 5) + c(12, 12, 1),
    install: '<path d="M8 2h8v20H8zM11 19h2M12 6v8M9.5 11.5L12 14l2.5-2.5"/>',
    share: '<path d="M12 3v12M7 8l5-5 5 5M5 12v8h14v-8"/>',
    dice: '<path d="M4 4h16v16H4z"/>' + c(8.5, 8.5, 1) + c(15.5, 15.5, 1) + c(12, 12, 1) + c(15.5, 8.5, 1) + c(8.5, 15.5, 1),
    swords: '<path d="M4 4l10 10M4 4h4M4 4v4M20 4L10 14M20 4h-4M20 4v4M13 17l4 4M11 17l-4 4M15 15l3 3M9 15l-3 3"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>'
  };
  A.icon = (name, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${I[name] || I.star}</svg>`;
  A.iconNames = Object.keys(I);

  /* ---------- íconos de moneda (rellenos, a color) ---------- */
  A.cur = (k, size) => {
    const s = size || 20, id = uid('g');
    switch (k) {
      case 'gold': return `<svg class="cur" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="#ffcc33" stroke="#7a4a06" stroke-width="2"/><circle cx="12" cy="12" r="6.2" fill="#ffdd66" stroke="#c98a12" stroke-width="1.6"/><path d="M12 8.5v7M10 10.5h4" stroke="#b07208" stroke-width="1.8" stroke-linecap="round"/><path d="M6.5 8.5a6.5 6.5 0 0 1 4-3.6" stroke="#fff7d1" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;
      case 'gems': return `<svg class="cur" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7df9ff"/><stop offset=".55" stop-color="#5a8bff"/><stop offset="1" stop-color="#ff5ad1"/></linearGradient></defs><path d="M6 3.5h12l4 5.5L12 21.5 2 9z" fill="url(#${id})" stroke="#24104a" stroke-width="1.8" stroke-linejoin="round"/><path d="M2 9h20M8.5 3.5L12 9l3.5-5.5M12 9v12.5" stroke="#24104a" stroke-width="1.2" fill="none" opacity=".55"/><path d="M6.5 5l-2 3.4" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>`;
      case 'dust': return `<svg class="cur" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" fill="#c9a0ff" stroke="#3b1a6e" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 6.5l1 4.5 4.5 1-4.5 1-1 4.5-1-4.5-4.5-1 4.5-1z" fill="#f4e9ff"/><circle cx="19" cy="5" r="1.6" fill="#f4e9ff"/></svg>`;
      case 'std': case 'pet': case 'gold_t': {
        const col = k === 'std' ? ['#ff8fc8', '#a5176a'] : k === 'pet' ? ['#7be08a', '#1d6b34'] : ['#ffd25e', '#8a5a00'];
        return `<svg class="cur" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 6.5h19v3.2a2.3 2.3 0 0 0 0 4.6v3.2h-19v-3.2a2.3 2.3 0 0 0 0-4.6z" fill="${col[0]}" stroke="${col[1]}" stroke-width="1.8" stroke-linejoin="round"/><path d="M15.5 7v10" stroke="${col[1]}" stroke-width="1.4" stroke-dasharray="1.6 1.6"/><path d="M9 9.2l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" fill="#fff"/></svg>`;
      }
      case 'hp': return `<svg class="cur" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-9-5.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-9 12-9 12z" fill="#ff4d6d" stroke="#5c0a1e" stroke-width="1.8"/><path d="M7 7.5a2.5 2.5 0 0 1 2.5-1.5" stroke="#ffd1da" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>`;
      case 'xp': return `<svg class="cur" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.8 6 6.5.8-4.8 4.5 1.3 6.5L12 17l-5.8 3.3 1.3-6.5-4.8-4.5 6.5-.8z" fill="#7dd3ff" stroke="#123a6b" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 9.5l1.5-.3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>`;
      case 'chest': return `<svg class="cur" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10H3z" fill="#b45cff" stroke="#2b0b52" stroke-width="1.8"/><path d="M3 12h18" stroke="#ffd25e" stroke-width="2"/><rect x="10" y="10.5" width="4" height="4" fill="#ffd25e" stroke="#2b0b52" stroke-width="1.2"/></svg>`;
      default: return '';
    }
  };

  /* ---------- PERSONAJE ---------- */
  const FACE = {
    ovalada: 'M66 96 C66 54 174 54 174 96 C174 134 148 160 120 162 C92 160 66 134 66 96 Z',
    redonda: 'M63 98 C63 52 177 52 177 98 C177 140 152 160 120 161 C88 160 63 140 63 98 Z',
    afilada: 'M67 94 C67 54 173 54 173 94 C173 124 142 158 120 166 C98 158 67 124 67 94 Z',
    ancha: 'M61 97 C61 54 179 54 179 97 C179 140 160 158 120 159 C80 158 61 140 61 97 Z',
    corazon: 'M60 92 C60 50 180 50 180 92 C180 118 152 150 120 164 C88 150 60 118 60 92 Z',
    cuadrada: 'M63 94 C63 52 177 52 177 94 L175 132 Q172 154 146 160 L94 160 Q68 154 65 132 Z'
  };

  function drawEyes(style, col, expr) {
    const out = [];
    const xs = [96, 144];
    if (expr === 'ko') {
      xs.forEach(x => out.push(L(`M${x - 9} ${108} L${x + 9} ${122} M${x + 9} ${108} L${x - 9} ${122}`, 3.5)));
      return out.join('');
    }
    if (style === 'alegres' || expr === 'joy') {
      xs.forEach(x => out.push(L(`M${x - 13} ${118} Q${x} ${100} ${x + 13} ${118}`, 4.5)));
      return out.join('');
    }
    const dark = sh(col, -0.45), light = A.shade(col, 0.35);
    xs.forEach((x, i) => {
      const side = i === 0 ? -1 : 1; // -1 izquierda
      const id = uid('e');
      let eye, lid;
      if (style === 'afilados') {
        eye = `M${x - 13} ${110 + (side < 0 ? 4 : -2)} Q${x} ${104} ${x + 13} ${110 + (side < 0 ? -2 : 4)} Q${x + 12} ${126} ${x} ${127} Q${x - 12} ${126} ${x - 13} ${110 + (side < 0 ? 4 : -2)} Z`;
        lid = `M${x - 15} ${112 + (side < 0 ? 5 : -3)} Q${x} ${101} ${x + 15} ${112 + (side < 0 ? -3 : 5)}`;
      } else if (style === 'almendrados') {
        const xi = x - side * 14, xo = x + side * 14;
        eye = `M${xi} 118 Q${x} 105 ${xo} 112 Q${x} 127 ${xi} 118 Z`;
        lid = `M${xi} 118 Q${x} 103 ${xo + side * 3} 110`;
      } else if (style === 'redondos') {
        eye = `M${x - 14} 115 A14 16 0 1 1 ${x + 14} 115 A14 16 0 1 1 ${x - 14} 115 Z`;
        lid = `M${x - 16} 109 Q${x} 92 ${x + 16} 109`;
      } else if (style === 'serenos') {
        eye = `M${x - 13} ${114} L${x + 13} ${114} Q${x + 12} ${128} ${x} ${129} Q${x - 12} ${128} ${x - 13} ${114} Z`;
        lid = `M${x - 15} ${114} Q${x} ${110} ${x + 15} ${114}`;
      } else {
        eye = `M${x - 13} ${113} Q${x - 12} ${98} ${x} ${98} Q${x + 12} ${98} ${x + 13} ${113} Q${x + 12} ${129} ${x} ${130} Q${x - 12} ${129} ${x - 13} ${113} Z`;
        lid = `M${x - 15} ${106} Q${x - 6} ${95} ${x + 4} ${97} Q${x + 12} ${98} ${x + 16} ${105 + side * 0}`;
      }
      out.push(`<clipPath id="${id}"><path d="${eye}"/></clipPath>`);
      out.push(Pn(eye, '#ffffff'));
      out.push(`<g clip-path="url(#${id})">`);
      out.push(El(x + side * 1, 117, 10.5, 14.5, col, false));
      out.push(style === 'almendrados' ? Pn(`M${x - 15} 100 H${x + 15} V110 Q${x} 106 ${x - 15} 110 Z`, dark) : Pn(`M${x - 14} ${100} H${x + 14} V${113} Q${x} ${108} ${x - 14} ${113} Z`, dark));
      out.push(El(x + side * 1, 125, 7, 5, light, false, 'opacity=".9"'));
      if (style === 'felinos') out.push(El(x + side * 1, 117, 2.3, 9, '#120a1f', false));
      else out.push(El(x + side * 1, 117, 4.6, 6.2, '#120a1f', false));
      out.push(style === 'almendrados' ? C(x - 3, 113, 3, '#ffffff', false) : C(x - 4, 109, 4.2, '#ffffff', false));
      out.push(C(x + 4.5, 122, 2, '#ffffff', false));
      out.push('</g>');
      out.push(`<path d="${eye}" fill="none" stroke="${OL}" stroke-width="2"/>`);
      out.push(L(lid, 4.8));
      if (style === 'brillantes' || style === 'felinos') out.push(L(`M${x + side * 13} ${103} l${side * 5} ${-4}`, 3.2));
      if (style === 'redondos') { out.push(L(`M${x - 13} 124 Q${x - 15} 128 ${x - 17} 129`, 2.4)); out.push(C(x + 5, 108, 2.2, '#ffffff', false)); }
    });
    return out.join('');
  }

  function hairParts(style, hc, faceKey) {
    const d = sh(hc, -0.3), hl = A.shade(hc, 0.45);
    const back = [], front = [];
    const cap = 'M54 106 C46 52 86 28 120 28 C154 28 194 52 186 106 L178 100 C176 84 170 76 162 72 Q160 88 150 96 Q148 80 140 74 Q132 90 120 96 Q110 84 104 74 Q96 88 86 94 Q84 82 76 76 Q68 84 62 102 Z';
    const capBlunt = 'M54 106 C46 52 86 28 120 28 C154 28 194 52 186 106 L180 104 C178 92 174 86 170 84 L70 84 C66 86 62 92 60 104 Z';
    const lockL = 'M62 92 C54 118 56 140 66 158 C70 140 70 120 74 100 Z';
    const lockR = 'M178 92 C186 118 184 140 174 158 C170 140 170 120 166 100 Z';
    const lockLongL = 'M60 90 C50 130 52 170 64 196 C70 168 70 130 76 100 Z';
    const lockLongR = 'M180 90 C190 130 188 170 176 196 C170 168 170 130 164 100 Z';
    const shine = `<path d="M84 52 Q96 42 112 40 Q100 48 94 58 Z M128 40 Q146 40 158 50 Q146 48 136 52 Z" fill="${hl}" opacity=".85"/>`;
    const capShade = `<path d="M150 34 C178 46 192 70 186 106 L178 100 C176 84 170 76 162 72 C168 60 162 44 150 34 Z" fill="${d}"/>`;
    switch (style) {
      case 'puntiagudo':
        back.push(P('M58 110 L28 84 L56 78 L34 44 L74 52 L70 14 L104 38 L122 4 L138 36 L168 10 L168 50 L208 40 L186 74 L214 88 L182 110 Z', hc));
        back.push(Pn('M168 50 L208 40 L186 74 L214 88 L182 110 L178 70 Z', d));
        front.push(P('M56 106 C48 56 86 30 120 30 C154 30 192 56 184 106 L174 96 L168 72 L156 98 L148 70 L136 96 L124 66 L112 96 L102 68 L90 98 L80 70 L70 96 Z', hc));
        front.push(Pn('M150 36 C178 50 190 74 184 106 L174 96 L168 72 L160 90 C164 66 160 48 150 36 Z', d));
        front.push(shine);
        break;
      case 'largo':
        back.push(P('M56 92 C46 160 48 210 62 240 L178 240 C192 210 194 160 184 92 Z', hc));
        back.push(Pn('M150 100 C170 140 176 200 172 238 L178 240 C192 210 194 160 184 92 Z', d));
        front.push(P(cap, hc), capShade, P(lockLongL, hc), P(lockLongR, hc), Pn('M178 92 C186 130 186 168 176 196 C178 160 176 130 172 100 Z', d), shine);
        break;
      case 'coleta':
        back.push(El(120, 92, 66, 62, hc));
        back.push(P('M162 60 C214 54 228 120 206 196 C200 214 188 222 180 226 C190 196 194 160 184 128 C178 108 170 92 160 86 Z', hc));
        back.push(Pn('M196 92 C214 130 210 180 192 218 C198 180 198 140 186 112 Z', d));
        back.push(El(170, 70, 9, 12, '#ff5a8a', true, 'transform="rotate(-30 170 70)"'));
        front.push(P(cap, hc), capShade, P(lockL, hc), P(lockR, hc), shine);
        break;
      case 'bob':
        back.push(P('M52 100 C44 154 62 172 88 170 L152 170 C178 172 196 154 188 100 C188 60 160 36 120 36 C80 36 52 60 52 100 Z', hc));
        back.push(Pn('M160 50 C186 70 196 120 184 160 C178 168 168 170 160 170 C174 140 178 90 160 50 Z', d));
        front.push(P(capBlunt, hc), Pn('M150 34 C178 46 192 70 186 106 L180 104 C178 92 174 86 170 84 L160 84 C168 66 164 46 150 34 Z', d));
        front.push(P('M62 90 C54 120 58 150 72 166 C74 140 74 116 78 96 Z', hc), P('M178 90 C186 120 182 150 168 166 C166 140 166 116 162 96 Z', hc), shine);
        break;
      case 'dosColetas':
        back.push(El(120, 92, 66, 62, hc));
        back.push(P('M64 70 C20 80 14 150 30 214 C34 226 44 232 52 234 C42 200 40 160 52 128 C58 112 64 100 70 92 Z', hc));
        back.push(P('M176 70 C220 80 226 150 210 214 C206 226 196 232 188 234 C198 200 200 160 188 128 C182 112 176 100 170 92 Z', hc));
        back.push(Pn('M200 100 C218 140 214 190 200 224 C206 186 204 146 192 118 Z', d), Pn('M40 100 C26 140 28 190 40 224 C34 186 36 146 48 118 Z', d));
        back.push(C(64, 72, 9, '#ff5a8a'), C(176, 72, 9, '#ff5a8a'));
        front.push(P(cap, hc), capShade, P(lockL, hc), P(lockR, hc), shine);
        break;
      case 'mono':
        back.push(El(120, 92, 66, 62, hc));
        back.push(C(120, 24, 24, hc), Pn('M132 4 C150 14 148 40 128 46 C142 34 142 16 132 4 Z', d));
        back.push(`<path d="M100 40 Q120 50 140 40" fill="none" stroke="#ff5a8a" stroke-width="7" stroke-linecap="round"/>`);
        front.push(P(cap, hc), capShade, P(lockL, hc), P(lockR, hc), shine);
        break;
      case 'rizado': {
        const pts = []; for (let a = 0; a < 360; a += 30) pts.push([120 + 74 * Math.cos(a * Math.PI / 180), 84 + 64 * Math.sin(a * Math.PI / 180)]);
        back.push(pts.map(([x, y]) => C(x.toFixed(1), y.toFixed(1), 28, hc)).join(''));
        back.push(El(120, 86, 80, 70, hc, false));
        back.push(pts.map(([x, y]) => C(x.toFixed(1), y.toFixed(1), 26.4, hc, false)).join(''));
        back.push(pts.filter(([x]) => x > 140).map(([x, y]) => C((x + 6).toFixed(1), (y + 4).toFixed(1), 12, d, false)).join(''));
        front.push(P('M56 104 C48 50 88 24 120 24 C152 24 192 50 184 104 Q180 90 170 96 Q168 80 155 88 Q148 72 135 84 Q124 68 112 84 Q100 70 90 86 Q80 76 73 94 Q62 88 56 104 Z', hc));
        front.push(Pn('M150 32 C178 46 190 72 184 104 Q180 90 170 96 Q168 80 155 88 C164 66 162 46 150 32 Z', d));
        front.push(`<g fill="none" stroke="${d}" stroke-width="2.4" stroke-linecap="round"><path d="M86 48 q6 -6 12 0 M110 38 q6 -6 12 0 M136 44 q6 -6 12 0 M72 66 q6 -6 12 0 M98 60 q6 -6 12 0 M124 58 q6 -6 12 0 M150 66 q6 -6 12 0"/></g>`);
        front.push(`<circle cx="96" cy="44" r="4" fill="${hl}" opacity=".8"/><circle cx="116" cy="36" r="3" fill="${hl}" opacity=".8"/>`);
        break;
      }
      case 'rapado':
        front.push(`<path d="M64 100 C58 56 90 38 120 38 C150 38 182 56 176 100 C172 86 164 74 150 69 Q136 63 120 66 Q104 63 90 69 C76 74 68 86 64 100 Z" fill="${hc}" stroke="${OL}" stroke-width="2" stroke-linejoin="round"/>`);
        front.push(Pn('M150 42 C170 52 180 74 176 100 C172 86 164 74 150 69 C158 60 158 50 150 42 Z', d, 'opacity=".75"'));
        front.push(`<g fill="${d}" opacity=".7">${[[86, 54], [100, 46], [116, 42], [132, 44], [146, 50], [94, 62], [110, 56], [126, 56], [140, 60], [80, 66], [158, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('')}</g>`);
        front.push(`<path d="M96 46 Q110 40 124 40" fill="none" stroke="${hl}" stroke-width="3" stroke-linecap="round" opacity=".6"/>`);
        break;
      default: // corto
        back.push(El(120, 92, 68, 64, hc));
        front.push(P(cap, hc), capShade, P('M62 92 C56 112 58 128 66 140 C68 124 70 112 74 100 Z', hc), P('M178 92 C184 112 182 128 174 140 C172 124 170 112 166 100 Z', hc), shine);
    }
    return { back: back.join(''), front: front.join('') };
  }

  function torso(look, skin) {
    const c1 = look.c1, c2 = look.c2, tr = look.tr || '#ffd25e';
    const d1 = sh(c1), d2 = sh(c2);
    const o = [];
    const skinD = sh(skin, -0.18);
    const armL = (fill) => P('M88 176 C76 184 70 204 70 226 L84 228 C84 210 88 196 96 188 Z', fill);
    const armR = (fill) => P('M152 176 C164 184 172 200 174 222 L160 226 C158 210 152 196 144 188 Z', fill);
    const hands = C(77, 230, 9, skin) + C(167, 226, 9, skin);
    const legs = (pc, bc) => P('M96 236 L94 272 L114 272 L116 236 Z', pc) + P('M124 236 L126 272 L146 272 L144 236 Z', pc)
      + P('M88 268 Q88 286 104 288 L118 288 L116 268 Z', bc) + P('M122 268 L124 288 L138 288 Q152 286 152 268 Z', bc)
      + Pn('M134 237 L144 237 L146 270 L136 270 Z', sh(pc, -0.22));
    switch (look.st) {
      case 'plate':
        o.push(legs(d2, c1));
        o.push(armL(c2), armR(c2));
        o.push(P('M86 172 Q120 158 154 172 L160 242 Q120 252 80 242 Z', c1));
        o.push(Pn('M124 166 Q144 164 154 172 L160 242 Q140 248 124 250 Z', d1));
        o.push(P('M98 184 Q120 176 142 184 L138 214 Q120 224 102 214 Z', A.shade(c1, 0.25)));
        o.push(L('M120 180 L120 220', 2.5, tr));
        o.push(P('M82 230 L158 230 L160 242 Q120 252 80 242 Z', tr));
        o.push(El(86, 178, 15, 11, c2, true), El(154, 178, 15, 11, c2, true));
        o.push(Pn('M150 170 a15 11 0 0 1 18 9 L158 184 Z', d2));
        break;
      case 'robe':
        o.push(legs(d2, sh(c1, -0.4)));
        o.push(P('M86 170 Q120 158 154 170 L176 282 Q120 292 64 282 Z', c1));
        o.push(Pn('M124 164 Q144 162 154 170 L176 282 Q150 288 128 290 Z', d1));
        o.push(P('M108 168 L120 210 L132 168 Q120 162 108 168 Z', c2));
        o.push(L('M78 236 Q120 248 162 236', 7, tr));
        o.push(P('M88 176 C70 186 62 206 60 232 L88 236 C88 214 90 198 98 188 Z', c1), P('M152 176 C170 186 178 206 180 228 L154 232 C152 214 150 198 142 188 Z', c1));
        o.push(L('M62 228 L88 232', 4, tr), L('M178 224 L154 228', 4, tr));
        break;
      case 'kimono':
        o.push(P('M92 236 L88 276 L118 276 L118 236 Z', d1), P('M122 236 L122 276 L152 276 L148 236 Z', d1));
        o.push(P('M88 270 Q86 288 104 288 L118 288 L118 270 Z', '#2b2238'), P('M122 270 L122 288 L136 288 Q154 288 152 270 Z', '#2b2238'));
        o.push(P('M86 172 Q120 158 154 172 L158 240 Q120 250 82 240 Z', c1));
        o.push(Pn('M124 164 Q144 162 154 172 L158 240 Q140 246 124 248 Z', d1));
        o.push(P('M100 168 L120 214 L140 168 Q120 162 100 168 Z', c2));
        o.push(L('M100 168 L120 214 L140 168', 4, tr));
        o.push(P('M84 212 L156 212 L157 232 L83 232 Z', c2), L('M84 222 L156 222', 3, tr));
        o.push(P('M88 176 C68 184 60 206 58 230 L90 234 C90 214 92 198 98 188 Z', c1), P('M152 176 C172 184 180 204 182 226 L152 230 C150 214 150 198 142 188 Z', c1));
        o.push(Pn('M152 176 C172 184 180 204 182 226 L168 228 C168 206 162 190 152 182 Z', d1));
        break;
      case 'coat':
        o.push(legs(sh(c1, -0.2), '#2b2238'));
        o.push(armL(c1), armR(c1));
        o.push(P('M86 172 Q120 158 154 172 L160 246 Q120 254 80 246 Z', c1));
        o.push(Pn('M124 164 Q144 162 154 172 L160 246 Q140 252 124 252 Z', d1));
        o.push(P('M106 168 L120 168 L134 168 L132 250 L108 250 Z', c2));
        o.push(P('M104 166 L120 196 L96 182 Z', A.shade(c1, 0.15)), P('M136 166 L120 196 L144 182 Z', A.shade(c1, 0.15)));
        o.push(P('M114 172 L126 172 L124 186 L120 192 L116 186 Z', tr));
        o.push(C(120, 208, 2.6, tr), C(120, 222, 2.6, tr), C(120, 236, 2.6, tr));
        break;
      default: // tunic
        o.push(legs(c2, sh(c2, -0.35)));
        o.push(armL(c1), armR(c1));
        o.push(P('M86 172 Q120 158 154 172 L160 244 Q120 254 80 244 Z', c1));
        o.push(Pn('M124 164 Q144 162 154 172 L160 244 Q140 250 124 252 Z', d1));
        o.push(P('M106 168 L120 190 L134 168 Q120 162 106 168 Z', skin));
        o.push(L('M106 168 L120 190 L134 168', 3.5, tr));
        o.push(P('M82 222 L158 222 L159 232 L81 232 Z', c2), `<rect x="113" y="220" width="14" height="14" rx="2" fill="${tr}" stroke="${OL}" stroke-width="2.5"/>`);
    }
    if (look.pat === 'stars') {
      [[98, 196], [142, 204], [112, 250], [150, 258], [88, 266], [130, 228]].forEach(([x, y]) => o.push(`<path d="M${x} ${y - 5} L${x + 1.6} ${y - 1.6} L${x + 5} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 5} L${x - 1.6} ${y + 1.6} L${x - 5} ${y} L${x - 1.6} ${y - 1.6} Z" fill="${tr}"/>`));
    }
    if (look.pat === 'sakura') {
      [[100, 200], [140, 196], [110, 238], [146, 236], [92, 222]].forEach(([x, y]) => o.push(`<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-3.5" rx="2.4" ry="3.6" fill="#ff7eb3" transform="rotate(${a})"/>`).join('')}<circle r="1.6" fill="#ffe066"/></g>`));
    }
    o.push(hands);
    o.push(Pn('M106 158 L134 158 L132 170 Q120 176 108 170 Z', skinD));
    return o.join('');
  }

  /* Armas: coordenadas locales con la empuñadura en (0,0) */
  A.weaponShape = look => {
    const c1 = look.c1, c2 = look.c2, d1 = sh(c1), o = [];
    switch (look.t) {
      case 'sword':
        o.push(P('M-6 -12 L-6 -92 L0 -106 L6 -92 L6 -12 Z', c1), Pn('M0 -104 L6 -92 L6 -12 L0 -12 Z', d1), L('M-2 -20 L-2 -86', 2, A.shade(c1, 0.6)));
        o.push(P('M-18 -14 L18 -14 L16 -6 L-16 -6 Z', c2), P('M-4 -6 L4 -6 L4 16 L-4 16 Z', '#6b3e26'), C(0, 20, 5, c2));
        break;
      case 'katana':
        o.push(P('M-3 -10 C-4 -50 2 -92 12 -114 C6 -92 4 -50 4 -10 Z', c1), L('M0 -16 C0 -54 4 -88 10 -108', 1.6, '#ffffff'));
        o.push(El(0, -9, 12, 4, c2, true), P('M-4 -6 L4 -6 L4 22 L-4 22 Z', '#2b2238'), L('M-4 0 L4 4 M-4 8 L4 12 M-4 16 L4 20', 1.6, c2));
        break;
      case 'dagger':
        o.push(P('M-5 -8 L-5 -50 L0 -60 L5 -50 L5 -8 Z', c1), Pn('M0 -58 L5 -50 L5 -8 L0 -8 Z', d1), P('M-12 -10 L12 -10 L10 -4 L-10 -4 Z', c2), P('M-3 -4 L3 -4 L3 14 L-3 14 Z', '#4b3020'));
        break;
      case 'staff': case 'scepter': {
        const top = look.t === 'staff' ? -112 : -84;
        o.push(P(`M-4 30 L-4 ${top + 8} L4 ${top + 8} L4 30 Z`, look.t === 'staff' ? '#8a5a33' : c1));
        o.push(P(`M-10 ${top + 14} Q-16 ${top - 4} -6 ${top - 14} M10 ${top + 14} Q16 ${top - 4} 6 ${top - 14}`, 'none'));
        o.push(C(0, top, 12, c2), C(-4, top - 4, 3.5, '#ffffff', false));
        if (look.t === 'scepter') o.push(P(`M0 ${top - 30} l5 10 11 2 -8 8 2 11 -10 -5 -10 5 2 -11 -8 -8 11 -2 z`, '#ffffff'));
        break;
      }
      case 'lute':
        o.push(P('M-3 -4 L-3 -70 L3 -70 L3 -4 Z', c2), P('M-8 -84 L8 -84 L6 -66 L-6 -66 Z', c2));
        o.push(P('M0 -8 C-26 -8 -30 30 -14 40 C-6 46 6 46 14 40 C30 30 26 -8 0 -8 Z', c1), C(0, 16, 6, OL, false), L('M-1 -70 L-1 34 M1 -70 L1 34', 1, '#fff'));
        break;
      case 'hammer':
        o.push(P('M-4 30 L-4 -64 L4 -64 L4 30 Z', '#7a4a2a'), P('M-26 -92 L26 -92 L26 -62 L-26 -62 Z', c1), Pn('M4 -92 L26 -92 L26 -62 L4 -62 Z', d1), L('M-18 -82 L-6 -72 M6 -82 L18 -72', 2.5, A.shade(c1, 0.5)));
        break;
      case 'bow':
        o.push(P('M2 -76 C40 -50 40 50 2 76 L-4 72 C30 46 30 -46 -4 -72 Z', c1), L('M-1 -74 L-1 74', 1.6, c2), C(14, 0, 4, c2));
        break;
      case 'spear':
        o.push(P('M-3 34 L-3 -96 L3 -96 L3 34 Z', '#8a5a33'), P('M0 -130 L10 -100 L0 -92 L-10 -100 Z', c1), P('M-12 -96 L12 -96 L8 -90 L-8 -90 Z', c2));
        break;
      case 'tome':
        o.push(P('M-22 -30 L22 -30 L22 6 L-22 6 Z', c1), P('M-18 -26 L18 -26 L18 2 L-18 2 Z', 'none'), C(0, -12, 7, c2), L('M22 -30 L26 -26 L26 10 L-18 10 L-22 6', 2.5));
        break;
      case 'flute':
        o.push(P('M-3 20 L-3 -86 L3 -86 L3 20 Z', c1), C(0, -60, 1.8, OL, false), C(0, -44, 1.8, OL, false), C(0, -28, 1.8, OL, false), P('M-5 -90 L5 -90 L5 -84 L-5 -84 Z', c2));
        break;
      case 'harp':
        o.push(P('M-4 30 C-10 -10 -20 -60 0 -96 C20 -60 34 -40 28 -8 C24 10 12 22 -4 30 Z', 'none'), L('M-4 30 C-10 -10 -20 -60 0 -96 C20 -60 34 -40 28 -8 C24 10 12 22 -4 30', 7, c1), L('M-4 -60 L10 18 M2 -76 L20 6 M-6 -36 L4 24', 1.4, c2));
        break;
      case 'scythe':
        o.push(P('M-3 40 L-3 -100 L3 -100 L3 40 Z', '#4b3020'), P('M0 -100 C-40 -116 -76 -96 -88 -68 C-64 -88 -36 -92 2 -84 Z', c1), Pn('M-20 -98 C-50 -98 -74 -84 -88 -68 C-60 -86 -40 -90 -14 -88 Z', A.shade(c1, 0.5)));
        break;
      default: break;
    }
    return o.join('');
  };
  A.armorShape = look => {
    const c1 = look.c1, c2 = look.c2, tr = look.tr || '#ffd25e', d1 = sh(c1);
    if (look.st === 'plate') return P('M20 30 Q50 18 80 30 L84 86 Q50 96 16 86 Z', c1) + Pn('M54 22 Q70 22 80 30 L84 86 Q68 92 54 93 Z', d1) + El(20, 34, 13, 10, c2, true) + El(80, 34, 13, 10, c2, true) + P('M32 42 Q50 34 68 42 L64 66 Q50 74 36 66 Z', A.shade(c1, 0.25)) + P('M16 76 L84 76 L84 86 Q50 96 16 86 Z', tr);
    if (look.st === 'robe') return P('M24 22 Q50 12 76 22 L92 92 Q50 100 8 92 Z', c1) + Pn('M54 16 Q68 16 76 22 L92 92 Q72 97 56 98 Z', d1) + P('M40 20 L50 48 L60 20 Q50 16 40 20 Z', c2) + L('M14 70 Q50 80 86 70', 6, tr);
    if (look.st === 'kimono') return P('M18 24 Q50 12 82 24 L86 88 Q50 98 14 88 Z', c1) + Pn('M54 16 Q72 16 82 24 L86 88 Q70 94 54 95 Z', d1) + P('M34 20 L50 56 L66 20 Q50 14 34 20 Z', c2) + P('M16 58 L84 58 L84 74 L16 74 Z', c2) + L('M16 66 L84 66', 3, tr);
    if (look.st === 'coat') return P('M18 24 Q50 12 82 24 L86 92 Q50 100 14 92 Z', c1) + Pn('M54 16 Q72 16 82 24 L86 92 Q70 98 54 98 Z', d1) + P('M40 20 L60 20 L58 96 L42 96 Z', c2) + P('M44 24 L56 24 L54 38 L50 42 L46 38 Z', tr) + C(50, 56, 2.6, tr) + C(50, 70, 2.6, tr);
    return P('M18 24 Q50 12 82 24 L86 90 Q50 100 14 90 Z', c1) + Pn('M54 16 Q72 16 82 24 L86 90 Q70 96 54 97 Z', d1) + P('M38 20 L50 44 L62 20 Q50 14 38 20 Z', '#ffe0c8') + P('M14 66 L86 66 L86 76 L14 76 Z', c2) + `<rect x="43" y="64" width="14" height="14" rx="2" fill="${tr}" stroke="${OL}" stroke-width="2.5"/>`;
  };
  /* Accesorios sobre el personaje: devuelven {back, front} */
  function accessory(look) {
    const c1 = look.c1, c2 = look.c2 || A.shade(c1, 0.4), d1 = sh(c1);
    const b = [], f = [];
    switch (look.t) {
      case 'scarf': f.push(P('M92 160 Q120 176 148 160 L150 172 Q120 188 90 172 Z', c1), P('M132 172 L144 206 L130 206 L124 178 Z', c1), Pn('M136 172 L144 206 L138 206 Z', d1)); break;
      case 'amulet': f.push(L('M102 162 Q120 196 138 162', 2.5, '#d9b44a'), P('M120 186 L130 196 L120 210 L110 196 Z', c1), Pn('M120 186 L130 196 L120 210 Z', c2)); break;
      case 'memorial': f.push(L('M102 162 Q120 196 138 162', 2.5, '#9aa6bd'), P('M111 210 L111 196 Q111 186 120 186 Q129 186 129 196 L129 210 Z', '#c9d1e6'), P('M120 190 l2.2 5 5 2.2 -5 2.2 -2.2 5 -2.2 -5 -5 -2.2 5 -2.2z', '#ffe066')); break;
      case 'glasses': f.push(`<g fill="rgba(200,230,255,.25)" stroke="${c1}" stroke-width="3"><circle cx="96" cy="116" r="15"/><circle cx="144" cy="116" r="15"/><path d="M111 114 Q120 108 129 114" fill="none"/></g>`); break;
      case 'circlet': f.push(L('M66 80 Q120 60 174 80', 5, c1), P('M120 62 L127 72 L120 82 L113 72 Z', '#7df9ff')); break;
      case 'earrings': f.push(L('M64 122 L64 132 M176 122 L176 132', 2, '#d9b44a'), C(64, 138, 5, c1), C(176, 138, 5, c1)); break;
      case 'cape': b.push(P('M86 168 Q120 160 154 168 Q186 230 196 290 Q120 304 44 290 Q54 230 86 168 Z', c1), Pn('M140 166 Q176 230 196 290 Q172 296 150 298 Q158 230 140 166 Z', d1)); break;
      case 'horns': f.push(P('M82 56 Q70 30 78 14 Q88 34 96 48 Z', c1), P('M158 56 Q170 30 162 14 Q152 34 144 48 Z', c1), Pn('M78 14 Q88 34 96 48 L90 52 Q84 34 78 14 Z', d1)); break;
      case 'laurel': for (let i = 0; i < 6; i++) { const a = -160 + i * 14; const x = 120 + 66 * Math.cos(a * Math.PI / 180), y = 96 + 60 * Math.sin(a * Math.PI / 180); f.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4.5" fill="${c1}" stroke="${OL}" stroke-width="2" transform="rotate(${a + 60} ${x.toFixed(1)} ${y.toFixed(1)})"/>`); const x2 = 240 - x; f.push(`<ellipse cx="${x2.toFixed(1)}" cy="${y.toFixed(1)}" rx="9" ry="4.5" fill="${c1}" stroke="${OL}" stroke-width="2" transform="rotate(${-(a + 60)} ${x2.toFixed(1)} ${y.toFixed(1)})"/>`); } break;
      case 'wings': b.push(P('M100 186 C60 140 20 150 10 190 C30 186 40 196 30 214 C52 206 66 214 62 232 C80 216 94 204 100 196 Z', c1), P('M140 186 C180 140 220 150 230 190 C210 186 200 196 210 214 C188 206 174 214 178 232 C160 216 146 204 140 196 Z', c1), Pn('M100 190 C70 160 40 162 24 186 C46 172 72 178 100 196 Z', c2), Pn('M140 190 C170 160 200 162 216 186 C194 172 168 178 140 196 Z', c2)); break;
      case 'halo': b.push(`<ellipse cx="120" cy="18" rx="40" ry="10" fill="none" stroke="${OL}" stroke-width="9"/><ellipse cx="120" cy="18" rx="40" ry="10" fill="none" stroke="${c1}" stroke-width="5" class="glow-y"/>`); break;
      case 'crown': f.push(P('M84 50 L92 22 L106 40 L120 14 L134 40 L148 22 L156 50 Z', c1), Pn('M120 14 L134 40 L148 22 L156 50 L120 50 Z', sh(c1, -0.2)), C(120, 36, 4.5, c2), C(98, 42, 3, c2), C(142, 42, 3, c2)); break;
      default: break;
    }
    return { back: b.join(''), front: f.join('') };
  }
  function aura(kind) {
    if (kind === 'rainbow') return `<g class="aura-spin" style="transform-origin:120px 170px"><circle cx="120" cy="170" r="112" fill="none" stroke="url(#aurag)" stroke-width="8" opacity=".75" stroke-dasharray="30 14"/></g><defs><linearGradient id="aurag"><stop offset="0" stop-color="#ff5a5f"/><stop offset=".25" stop-color="#ffc12e"/><stop offset=".5" stop-color="#3ddc84"/><stop offset=".75" stop-color="#4da3ff"/><stop offset="1" stop-color="#b45cff"/></linearGradient></defs>`;
    if (kind === 'flames') return `<g class="aura-flicker">${[40, 70, 100, 140, 170, 200].map((x, i) => `<path d="M${x} 290 C${x - 18} 250 ${x - 4} 230 ${x + 6} ${200 - (i % 2) * 30} C${x + 10} 236 ${x + 26} 250 ${x + 14} 290 Z" fill="#ffc12e" opacity=".55"/>`).join('')}</g>`;
    if (kind === 'stars') return `<g class="aura-twinkle">${[[30, 80], [210, 60], [200, 200], [36, 220], [120, 10], [220, 130], [20, 150]].map(([x, y]) => `<path d="M${x} ${y - 8} L${x + 2.5} ${y - 2.5} L${x + 8} ${y} L${x + 2.5} ${y + 2.5} L${x} ${y + 8} L${x - 2.5} ${y + 2.5} L${x - 8} ${y} L${x - 2.5} ${y - 2.5} Z" fill="#fff6c2"/>`).join('')}</g>`;
    return '';
  }

  /* Dibuja al personaje. opts: {look, eq:{weapon,armor,accessory}, skin, aura, expr, fallen, classId} */
  A.hero = (S, o) => {
    const lk = o.look, skin = D.LOOK.skin[lk.skin] || D.LOOK.skin[1];
    const hc = D.LOOK.hairColor[lk.hairColor] || D.LOOK.hairColor[0];
    const ec = D.LOOK.eyeColor[lk.eyeColor] || D.LOOK.eyeColor[0];
    const faceKey = D.LOOK.face[lk.face] || 'ovalada';
    const hairKey = D.LOOK.hair[lk.hair] || 'corto';
    const eyeKey = D.LOOK.eyes[lk.eyes] || 'brillantes';
    const wDef = o.eq && o.eq.weapon ? A.def(S, o.eq.weapon) : null;
    const aDef = o.eq && o.eq.armor ? A.def(S, o.eq.armor) : null;
    const xDef = o.eq && o.eq.accessory ? A.def(S, o.eq.accessory) : null;
    let outfit = D.OUTFIT_LOOK[D.LOOK.outfit[lk.outfit]] || D.OUTFIT_LOOK.aventurero;
    if (aDef) outfit = aDef.look;
    if (o.skin && D.SKINS[o.skin]) outfit = D.SKINS[o.skin].look;
    const acc = xDef ? accessory(xDef.look) : { back: '', front: '' };
    const hair = hairParts(hairKey, hc, faceKey);
    const fid = uid('f');
    const skinD = sh(skin, -0.16);
    const elf = lk.skin === 7;
    const parts = [];
    parts.push(`<svg class="hero-svg ${o.fallen ? 'is-fallen' : ''}" viewBox="0 0 240 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Personaje">`);
    if (o.aura && D.SKINS[o.aura]) parts.push(aura(D.SKINS[o.aura].look.a));
    parts.push(`<ellipse cx="120" cy="290" rx="62" ry="9" fill="rgba(0,0,0,.28)"/>`);
    parts.push(acc.back);
    parts.push(hair.back);
    parts.push(torso(outfit, skin));
    // arma
    if (wDef) parts.push(`<g transform="translate(167 226) rotate(14)" class="${wDef.look.glow ? 'glow-' + (wDef.look.glow === 2 ? 'm' : 'y') : ''}">${A.weaponShape(wDef.look)}</g>${C(167, 226, 9, skin)}`);
    // orejas
    if (elf) parts.push(P('M70 104 L40 84 L66 124 Z', skin), P('M170 104 L200 84 L174 124 Z', skin));
    else parts.push(El(66, 112, 9, 13, skin), El(174, 112, 9, 13, skin));
    // cara
    parts.push(`<clipPath id="${fid}"><path d="${FACE[faceKey]}"/></clipPath>`);
    parts.push(P(FACE[faceKey], skin));
    parts.push(`<g clip-path="url(#${fid})"><path d="M150 50 C176 80 178 130 150 166 L190 166 L190 50 Z" fill="${skinD}"/><path d="M50 72 Q120 104 190 72 L190 100 Q120 122 50 100 Z" fill="${skinD}" opacity=".9"/></g>`);
    parts.push(drawEyes(eyeKey, ec, o.fallen ? 'ko' : o.expr));
    const bc = sh(hc, -0.35);
    if (!o.fallen) parts.push(L('M84 94 Q96 89 106 93', 3, bc), L('M134 93 Q144 89 156 94', 3, bc));
    parts.push(El(86, 134, 9, 5, '#ff7a9a', false, 'opacity=".45"'), El(154, 134, 9, 5, '#ff7a9a', false, 'opacity=".45"'));
    if (o.fallen) parts.push(L('M112 146 Q120 140 128 146', 3));
    else if (o.expr === 'joy') parts.push(P('M108 140 Q120 160 132 140 Z', '#c2304f'), Pn('M113 147 Q120 154 127 147 Q120 150 113 147 Z', '#ff8fa3'));
    else parts.push(L('M112 142 Q120 149 128 142', 3));
    parts.push(hair.front);
    parts.push(acc.front);
    parts.push('</svg>');
    return parts.join('');
  };
  A.def = (S, id) => (G.LME ? G.LME.itemDef(S, id) : D.ITEM[id]);

  /* ---------- MASCOTAS ---------- */
  A.pet = (look, cls) => {
    const c1 = look.c1, c2 = look.c2, d1 = sh(c1), sp = look.sp, o = [];
    const eyes = (y, gap, r) => {
      const g = gap || 14, rr = r || 6;
      return [60 - g, 60 + g].map(x => El(x, y, rr * 0.82, rr, '#1d1430', false) + C(x - 2, y - 2.6, rr * 0.38, '#fff', false) + C(x + 1.8, y + 2, rr * 0.18, '#fff', false)).join('');
    };
    const blush = y => El(38, y, 6, 3.5, '#ff7a9a', false, 'opacity=".55"') + El(82, y, 6, 3.5, '#ff7a9a', false, 'opacity=".55"');
    const mouth = y => L(`M55 ${y} Q57.5 ${y + 4} 60 ${y} Q62.5 ${y + 4} 65 ${y}`, 2.4);
    const body = (rx, ry, y) => El(60, y || 74, rx || 36, ry || 32, c1) + `<path d="M${60 + (rx || 36) * 0.35} ${(y || 74) - (ry || 32) * 0.92} A${rx || 36} ${ry || 32} 0 0 1 ${60 + (rx || 36) * 0.35} ${(y || 74) + (ry || 32) * 0.92} Q${60 + (rx || 36) * 0.9} ${y || 74} ${60 + (rx || 36) * 0.35} ${(y || 74) - (ry || 32) * 0.92} Z" fill="${d1}"/>` + El(60, y || 74, rx || 36, ry || 32, 'none');
    const ears = {
      cat: P('M30 54 L28 22 L54 44 Z', c1) + P('M90 54 L92 22 L66 44 Z', c1) + Pn('M33 46 L32 30 L46 42 Z', c2) + Pn('M87 46 L88 30 L74 42 Z', c2),
      fox: P('M28 56 L22 16 L56 44 Z', c1) + P('M92 56 L98 16 L64 44 Z', c1) + Pn('M30 48 L27 26 L46 42 Z', c2) + Pn('M90 48 L93 26 L74 42 Z', c2),
      bunny: P('M42 46 C30 10 40 -4 50 6 C56 14 54 30 54 44 Z', c1) + P('M78 46 C90 10 80 -4 70 6 C64 14 66 30 66 44 Z', c1) + Pn('M45 38 C38 16 42 8 48 12 C51 18 50 28 50 38 Z', c2) + Pn('M75 38 C82 16 78 8 72 12 C69 18 70 28 70 38 Z', c2),
      round: C(30, 46, 14, c1) + C(90, 46, 14, c1) + C(30, 46, 7, c2, false) + C(90, 46, 7, c2, false),
      floppy: P('M30 50 C14 52 12 80 22 90 C30 80 34 66 40 56 Z', c2) + P('M90 50 C106 52 108 80 98 90 C90 80 86 66 80 56 Z', c2),
      tufts: P('M34 50 L26 26 L50 42 Z', c1) + P('M86 50 L94 26 L70 42 Z', c1)
    };
    const wing = (col) => P('M22 76 C6 64 4 44 14 36 C18 52 26 60 34 66 Z', col) + P('M98 76 C114 64 116 44 106 36 C102 52 94 60 86 66 Z', col);
    switch (sp) {
      case 'slime':
        o.push(P('M18 98 C14 60 36 34 60 34 C84 34 106 60 102 98 Q60 108 18 98 Z', c1), Pn('M74 38 C96 50 106 74 102 98 Q90 101 80 102 C90 80 88 56 74 38 Z', d1), Pn('M34 54 Q40 44 50 42 Q42 50 40 60 Z', '#ffffff', 'opacity=".7"'));
        o.push(eyes(72, 14, 6), blush(82), mouth(84));
        break;
      case 'chick':
        o.push(body(34, 32, 72), P('M54 82 L66 82 L60 92 Z', '#ff9f1c'), wing(c2), P('M56 40 Q60 28 66 36 Q62 32 60 42 Z', c1), eyes(68, 13, 5.5), blush(80));
        break;
      case 'mouse':
        o.push(L('M92 92 C112 92 112 72 100 70', 3.5, c2), ears.round, body(32, 30, 74), eyes(70, 12, 5.5), C(60, 82, 3.5, c2, false), blush(84));
        break;
      case 'turtle':
        o.push(El(60, 96, 40, 12, sh(c1, -0.1)), P('M22 92 C22 56 98 56 98 92 Z', c2), Pn('M66 58 C88 62 98 76 98 92 L76 92 C78 76 74 64 66 58 Z', sh(c2)), L('M44 66 L52 80 L68 80 L76 66 M52 80 L48 92 M68 80 L72 92', 2.5, sh(c2, -0.5)));
        o.push(C(100, 82, 13, c1), C(104, 78, 2.5, OL, false), C(103, 77, 1, '#fff', false));
        break;
      case 'cat': case 'tanuki':
        o.push(L('M90 96 C114 96 114 66 102 60', 6, sp === 'tanuki' ? c2 : c1), ears.cat, body(36, 32, 72));
        if (sp === 'tanuki') { o.push(P('M30 66 Q44 56 54 70 Q44 78 30 66 Z', c2), P('M90 66 Q76 56 66 70 Q76 78 90 66 Z', c2), P('M50 30 Q60 14 72 26 Q62 26 60 36 Z', '#5fbf4a')); }
        else o.push(P('M52 44 L60 36 L68 44 L60 50 Z', c2));
        o.push(eyes(70, 14, 6), P('M57 79 L63 79 L60 82 Z', '#ff7a9a'), L('M30 78 L16 74 M30 82 L16 84 M90 78 L104 74 M90 82 L104 84', 1.8), blush(84));
        break;
      case 'owl':
        o.push(ears.tufts, El(60, 74, 34, 36, c1), Pn('M74 42 C92 54 96 80 88 100 Q80 106 72 108 C86 84 84 60 74 42 Z', d1), El(60, 86, 20, 20, c2, false));
        o.push(C(46, 66, 11, '#fff'), C(74, 66, 11, '#fff'), eyes(66, 14, 6), P('M56 76 L64 76 L60 84 Z', '#ffb020'), wing(d1));
        break;
      case 'dog': case 'wolf':
        o.push(L('M90 92 C108 92 112 70 104 62', 7, c1));
        if (sp === 'wolf') o.push(ears.fox); else o.push(ears.floppy);
        o.push(body(36, 32, 72), El(60, 84, 16, 11, c2, false), C(60, 79, 4.5, OL, false), eyes(68, 15, 6), L('M56 88 Q60 92 64 88', 2.2), blush(82));
        break;
      case 'bunny':
        o.push(ears.bunny, body(34, 32, 76), eyes(72, 13, 5.5), P('M57 81 L63 81 L60 85 Z', '#ff7a9a'), blush(86), C(90, 98, 7, '#fff'));
        break;
      case 'fox':
        o.push(P('M88 96 C120 100 124 60 104 48 C108 70 100 82 86 84 Z', c1), Pn('M104 48 C112 58 112 70 108 76 C106 66 106 56 104 48 Z', c2), ears.fox, body(36, 32, 72));
        o.push(P('M36 80 Q60 104 84 80 Q72 74 60 80 Q48 74 36 80 Z', c2), eyes(70, 15, 6), C(60, 82, 3.5, OL, false), blush(80));
        break;
      case 'fairy':
        o.push(`<g opacity=".85">${P('M58 70 C30 30 6 40 14 66 C20 80 40 80 58 74 Z', c2)}${P('M62 70 C90 30 114 40 106 66 C100 80 80 80 62 74 Z', c2)}</g>`);
        o.push(El(60, 98, 14, 16, c1), C(60, 66, 22, '#ffe3cf'), P('M38 64 C36 38 84 38 82 64 Q72 52 60 56 Q48 52 38 64 Z', c1), eyes(68, 9, 4.5), blush(76), C(60, 30, 4, '#fff6c2', false));
        break;
      case 'axolotl':
        [-1, 1].forEach(s => { [0, 1, 2].forEach(i => o.push(P(`M${60 + s * 32} ${60 + i * 10} q${s * 18} ${-10 + i * 6} ${s * 22} ${-2 + i * 6} q${-s * 8} ${6} ${-s * 20} ${6} Z`, c2))); });
        o.push(body(36, 30, 74), eyes(70, 16, 5), L('M44 84 Q60 94 76 84', 2.6), blush(80));
        break;
      case 'dragon': case 'kirin': case 'griffin': case 'phoenix': {
        if (sp === 'phoenix' || sp === 'griffin') o.push(wing(sp === 'phoenix' ? c2 : '#ffffff'));
        if (sp === 'dragon') o.push(P('M24 70 C8 56 6 36 16 30 C20 46 28 54 36 60 Z', c2) + P('M96 70 C112 56 114 36 104 30 C100 46 92 54 84 60 Z', c2));
        if (sp === 'phoenix') o.push(P('M60 40 C52 20 58 6 68 4 C64 16 70 24 66 40 Z', c2), P('M50 42 C40 28 42 16 50 12 C50 24 56 30 56 42 Z', '#ff9f1c'));
        if (sp === 'dragon') o.push(P('M40 48 L34 24 L50 42 Z', c2), P('M80 48 L86 24 L70 42 Z', c2));
        if (sp === 'kirin') o.push(P('M56 44 L60 10 L64 44 Z', c2), P('M76 40 C96 40 100 60 92 76 C88 62 82 52 72 50 Z', c2));
        if (sp === 'griffin') o.push(P('M32 52 L28 30 L48 44 Z', '#f2c14e'), P('M88 52 L92 30 L72 44 Z', '#f2c14e'));
        o.push(body(36, 32, 74));
        if (sp === 'griffin' || sp === 'phoenix') o.push(P('M52 82 L68 82 L60 96 Z', '#ffb020'));
        else o.push(El(60, 86, 15, 9, A.shade(c1, 0.3), false), C(55, 84, 1.6, OL, false), C(65, 84, 1.6, OL, false));
        o.push(eyes(70, 15, 6), blush(80));
        break;
      }
      case 'leviathan':
        o.push(P('M10 96 C10 70 40 70 46 88 C52 104 80 104 86 86 C92 66 116 70 112 92 C106 116 70 118 60 110 C46 120 12 118 10 96 Z', c1));
        o.push(P('M30 60 C30 34 90 34 90 60 C90 82 30 82 30 60 Z', c1), P('M40 40 L36 22 L52 36 Z', c2), P('M80 40 L84 22 L68 36 Z', c2), eyes(58, 13, 5.5), L('M50 70 Q60 76 70 70', 2.4));
        o.push(C(26, 100, 2, '#fff', false), C(98, 92, 2, '#fff', false), C(64, 104, 1.6, '#fff', false));
        break;
      default:
        o.push(body(36, 32, 74), eyes(70, 14, 6));
    }
    return `<svg class="pet-svg ${cls || ''}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${o.join('')}</svg>`;
  };

  /* ---------- JEFES ---------- */
  A.boss = (look, cls) => {
    const c1 = look.c1, c2 = look.c2, d1 = sh(c1), o = [];
    const angryEyes = (y, gap, col) => [100 - gap, 100 + gap].map((x, i) => P(`M${x - 14} ${y - 6 + (i ? 6 : 0)} L${x + 14} ${y - 6 + (i ? 0 : 6)} L${x + 10} ${y + 8} L${x - 10} ${y + 8} Z`, col || '#ffe066') + C(x + (i ? -2 : 2), y + 2, 4, OL, false)).join('');
    switch (look.t) {
      case 'slime':
        o.push(P('M20 182 C10 110 54 56 100 56 C146 56 190 110 180 182 Q100 196 20 182 Z', c1), Pn('M130 62 C172 84 190 130 180 182 Q160 188 140 190 C158 140 156 96 130 62 Z', d1));
        o.push(P('M62 60 L70 26 L86 46 L100 18 L114 46 L130 26 L138 60 Z', '#ffc12e'), C(100, 42, 6, c2), angryEyes(118, 30), P('M70 150 Q100 170 130 150 Q100 160 70 150 Z', OL));
        o.push(Pn('M46 92 Q56 74 72 70 Q60 84 58 100 Z', '#ffffff', 'opacity=".6"'), P('M40 176 Q44 192 52 192 Q56 186 54 176 Z', c1));
        break;
      case 'golem':
        o.push(P('M30 120 L18 186 L56 190 L60 130 Z', c1), P('M170 120 L182 186 L144 190 L140 130 Z', c1));
        o.push(P('M50 70 Q100 50 150 70 L160 170 Q100 186 40 170 Z', c1), Pn('M110 58 Q140 60 150 70 L160 170 Q136 178 114 180 Z', d1));
        o.push(P('M70 30 L130 30 L136 74 L64 74 Z', A.shade(c1, 0.1)), angryEyes(52, 18, c2), L('M70 110 Q100 100 130 110 M80 130 L120 140 M60 150 L90 158', 4, d1));
        break;
      case 'hydra':
        o.push(P('M40 190 C30 140 60 120 100 120 C140 120 170 140 160 190 Z', c1));
        [[40, 40, -12], [100, 20, 0], [160, 40, 12]].forEach(([x, y, r]) => {
          o.push(P(`M${100 + (x - 100) * 0.4 - 12} 130 C${x - 14} 100 ${x - 14} 80 ${x - 12} ${y + 24} L${x + 12} ${y + 24} C${x + 14} 80 ${x + 14} 100 ${100 + (x - 100) * 0.4 + 12} 130 Z`, c1));
          o.push(`<g transform="rotate(${r} ${x} ${y + 10})">${P(`M${x - 24} ${y + 16} C${x - 24} ${y - 14} ${x + 24} ${y - 14} ${x + 24} ${y + 16} L${x + 30} ${y + 28} L${x - 30} ${y + 28} Z`, c1)}${P(`M${x - 8} ${y - 6} L${x - 14} ${y - 22} L${x} ${y - 10} Z M${x + 8} ${y - 6} L${x + 14} ${y - 22} L${x} ${y - 10} Z`, c2)}${C(x - 10, y + 8, 4.5, '#ffe066')}${C(x + 10, y + 8, 4.5, '#ffe066')}${L(`M${x - 16} ${y + 24} L${x + 16} ${y + 24}`, 3)}</g>`);
        });
        o.push(C(90, 160, 7, c2), C(118, 168, 5, c2));
        break;
      case 'lich':
        o.push(P('M100 24 C60 24 40 70 42 110 L30 196 L170 196 L158 110 C160 70 140 24 100 24 Z', c1), Pn('M124 30 C150 50 160 80 158 110 L170 196 L140 196 C150 140 146 70 124 30 Z', d1));
        o.push(P('M100 56 C74 56 66 80 68 100 C70 118 84 126 100 126 C116 126 130 118 132 100 C134 80 126 56 100 56 Z', '#e8e2d0'), C(84, 94, 9, '#1d1430'), C(116, 94, 9, '#1d1430'), C(84, 94, 4, c2, false), C(116, 94, 4, c2, false), L('M86 116 L114 116 M92 112 L92 120 M100 112 L100 120 M108 112 L108 120', 2.4));
        o.push(L('M170 40 L160 196', 6, '#6b4b34'), C(172, 34, 12, c2), C(168, 30, 3, '#fff', false));
        break;
      case 'dragon':
        o.push(P('M100 120 C40 70 10 90 6 140 C30 126 40 140 30 160 C60 150 70 160 70 180 Z', sh(c1, -0.2)), P('M100 120 C160 70 190 90 194 140 C170 126 160 140 170 160 C140 150 130 160 130 180 Z', sh(c1, -0.2)));
        o.push(P('M50 100 C50 40 150 40 150 100 L160 150 C130 190 70 190 40 150 Z', c1), Pn('M120 50 C146 66 150 90 150 100 L160 150 C150 164 138 172 126 178 C146 140 144 90 120 50 Z', d1));
        o.push(P('M62 62 L44 20 L80 52 Z', c2), P('M138 62 L156 20 L120 52 Z', c2), angryEyes(96, 26));
        o.push(P('M64 140 Q100 170 136 140 Q100 150 64 140 Z', '#5c0a1e'), P('M74 142 L80 152 L86 145 M114 145 L120 152 L126 142', 'none'));
        o.push(C(86, 122, 3, OL, false), C(114, 122, 3, OL, false));
        break;
      case 'kraken':
        for (let i = 0; i < 6; i++) { const x = 30 + i * 28; o.push(P(`M${x} 120 C${x - 10} 150 ${x + (i % 2 ? 20 : -20)} 170 ${x + (i % 2 ? 4 : -4)} 194 L${x + 14} 194 C${x + (i % 2 ? 30 : 0)} 170 ${x + 18} 150 ${x + 18} 120 Z`, c1)); o.push(C(x + 8, 166, 3, c2, false), C(x + 10, 180, 2.4, c2, false)); }
        o.push(P('M40 120 C30 40 170 40 160 120 Q100 136 40 120 Z', c1), Pn('M126 48 C156 66 166 96 160 120 Q146 124 132 126 C146 96 144 70 126 48 Z', d1), angryEyes(96, 28), C(66, 70, 6, A.shade(c1, 0.4), false), C(80, 58, 4, A.shade(c1, 0.4), false));
        break;
      case 'shadow':
        o.push(P('M100 16 C40 16 30 90 36 140 C40 170 30 186 20 196 L50 186 L66 198 L82 184 L100 198 L118 184 L134 198 L150 186 L180 196 C170 186 160 170 164 140 C170 90 160 16 100 16 Z', c1));
        o.push(Pn('M100 16 C140 16 162 50 164 100 C150 60 130 30 100 16 Z', A.shade(c1, 0.15)));
        [[78, 78, 9], [122, 78, 9], [100, 52, 6], [64, 112, 5], [136, 112, 5], [100, 104, 7]].forEach(([x, y, r]) => o.push(El(x, y, r * 1.4, r, c2, false, 'class="glow-m"'), C(x, y, r * 0.45, '#fff', false)));
        o.push(P('M76 140 Q100 158 124 140 Q100 150 76 140 Z', '#000'));
        break;
      case 'emperor':
        o.push(P('M100 60 L30 196 L170 196 Z', '#5c0a1e'), Pn('M100 60 L170 196 L140 196 Z', '#3a0612'));
        o.push(P('M60 110 Q100 90 140 110 L150 196 L50 196 Z', c1), P('M50 110 C40 104 34 120 40 130 L60 128 Z', c2), P('M150 110 C160 104 166 120 160 130 L140 128 Z', c2));
        o.push(P('M70 50 C70 20 130 20 130 50 L132 90 Q100 106 68 90 Z', c1), P('M76 62 L124 62 L120 80 L80 80 Z', '#000'), C(90, 70, 4, '#ff3b3b', false), C(110, 70, 4, '#ff3b3b', false));
        o.push(P('M66 30 L74 4 L86 22 L100 0 L114 22 L126 4 L134 30 Z', c2), C(100, 18, 4, '#ff3b3b'), P('M100 128 L112 144 L100 162 L88 144 Z', '#ff3b3b'), Pn('M100 128 L112 144 L100 162 Z', '#b3202f'));
        break;
      default: o.push(C(100, 100, 60, c1));
    }
    return `<svg class="boss-svg ${cls || ''}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${o.join('')}</svg>`;
  };

  /* ---------- Lumi (guía de la campaña) ---------- */
  A.lumi = () => `<svg class="lumi" viewBox="0 0 80 80" aria-hidden="true"><g class="lumi-wings">${P('M38 40 C20 14 2 22 8 40 C12 50 26 48 38 44 Z', '#bff4ff')}${P('M42 40 C60 14 78 22 72 40 C68 50 54 48 42 44 Z', '#bff4ff')}</g>${C(40, 44, 16, '#fff6c2')}${C(34, 44, 3, OL, false)}${C(46, 44, 3, OL, false)}${C(33, 43, 1, '#fff', false)}${C(45, 43, 1, '#fff', false)}${L('M36 51 Q40 54 44 51', 2)}${El(30, 50, 3, 2, '#ff9fb8', false)}${El(50, 50, 3, 2, '#ff9fb8', false)}<path d="M40 18 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#ffe066"/></svg>`;

  /* ---------- Ícono de objeto (tarjeta) ---------- */
  A.item = (S, id, cls) => {
    const def = A.def(S, id); if (!def) return '';
    const lk = def.look;
    if (def.slot === 'pet') return A.pet(lk, cls);
    if (def.slot === 'weapon') return `<svg class="item-svg ${cls || ''}" viewBox="${({ dagger: '-38 -72 76 96', tome: '-34 -44 68 62', flute: '-48 -104 96 132', lute: '-52 -100 104 136', hammer: '-50 -104 100 136' })[lk.t] || '-60 -125 120 160'}" aria-hidden="true"><g transform="rotate(30 0 -45)">${A.weaponShape(lk)}</g></svg>`;
    if (def.slot === 'armor') return `<svg class="item-svg ${cls || ''}" viewBox="0 0 100 106" aria-hidden="true">${A.armorShape(lk)}</svg>`;
    // accesorio: dibuja sobre una cabeza fantasma
    const acc = accessory(lk);
    return `<svg class="item-svg ${cls || ''}" viewBox="${lk.t === 'wings' || lk.t === 'cape' ? '0 120 240 180' : lk.t === 'scarf' || lk.t === 'amulet' || lk.t === 'memorial' ? '70 140 100 80' : '50 0 140 150'}" aria-hidden="true">${(lk.t === 'wings' || lk.t === 'cape') ? acc.back + P('M86 172 Q120 160 154 172 L158 240 Q120 250 82 240 Z', '#3a3456') : ''}${lk.t === 'halo' ? acc.back : ''}${['scarf', 'amulet', 'memorial'].indexOf(lk.t) >= 0 ? P('M86 172 Q120 158 154 172 L158 240 Q120 250 82 240 Z', '#3a3456') : ''}${['glasses', 'circlet', 'earrings', 'crown', 'horns', 'laurel', 'halo'].indexOf(lk.t) >= 0 ? `<path d="${FACE.ovalada}" fill="#4a4268" stroke="${OL}" stroke-width="3"/>` : ''}${acc.front}</svg>`;
  };
  A.skinThumb = id => {
    const s = D.SKINS[id]; if (!s) return '';
    if (s.k === 'aura') return `<svg class="item-svg" viewBox="0 0 240 300" aria-hidden="true">${aura(s.look.a)}<circle cx="120" cy="160" r="50" fill="#3a3456" stroke="${OL}" stroke-width="3"/></svg>`;
    return `<svg class="item-svg" viewBox="0 0 100 106" aria-hidden="true">${A.armorShape(s.look)}</svg>`;
  };

  /* ---------- Logo ---------- */
  A.logo = (size) => `<svg width="${size || 64}" height="${size || 64}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="lgL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#ff5ad1"/></linearGradient></defs><path d="M32 3l8 13 15 2-11 11 3 16-15-8-15 8 3-16L9 18l15-2z" fill="url(#lgL)" stroke="${OL}" stroke-width="3" stroke-linejoin="round"/><path d="M26 27l6 7 10-12" fill="none" stroke="${OL}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  G.LMA = A;
})(typeof window !== 'undefined' ? window : globalThis);
