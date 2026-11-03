/* LifeMOD — service worker: funcionamiento sin conexión y recordatorios */
const VERSION = 'lifemod-v1.1.0';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'css/styles.css',
  'js/data.js', 'js/engine.js', 'js/art.js', 'js/audio.js', 'js/fx.js', 'js/app.js', 'js/ui.js',
  'fonts/dela-gothic-one.woff2', 'fonts/mplus-rounded-500.woff2', 'fonts/mplus-rounded-800.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.svg', 'icons/favicon-32.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'lifemod-cfg').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return res; }).catch(() => caches.match('index.html', { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});

/* Recordatorio periódico (Chrome Android con la app instalada) */
async function remind() {
  let cfg = null;
  try { const c = await caches.open('lifemod-cfg'); const r = await c.match('cfg.json'); if (r) cfg = await r.json(); } catch (err) { cfg = null; }
  if (!cfg || !cfg.on) return;
  const hour = new Date().getHours();
  if (hour < 8 || hour > 22) return;
  await self.registration.showNotification('LifeMOD' + (cfg.name ? ' · ' + cfg.name : ''), {
    body: '¿Ya cumpliste tus hábitos de hoy? Tu héroe te espera.',
    icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'lifemod-recordatorio'
  });
}
self.addEventListener('periodicsync', e => { if (e.tag === 'lifemod-recordatorio') e.waitUntil(remind()); });

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});
