/* axcStudios — Service Worker
   Requerido para que el navegador ofrezca "Instalar página como aplicación" (PWA real). */
const CACHE = 'axcstudios-v3';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './images/logo.png',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/icon-maskable-512.png',
  './images/games/geometry-dash.png',
  './images/games/rocket-league.png',
  './images/games/angry-birds-epic.png',
  './images/games/street-fighter.png',
  './images/games/fnaf-1.png',
  './images/games/fnaf-2.png',
  './images/games/fnaf-3.png',
  './images/games/fnaf-4.png',
  './images/games/fnaf-sl.png',
  './images/games/fnaf-ucn.png',
  './images/games/fnaf-ps.png',
  './images/games/fnaf-nw.png',
  './images/games/fnaf-mp.png',
  './images/games/kingdom-forgotten-seas.png',
  './images/games/f1-the-game.png',
  './images/games/emergency-strike.png',
  './images/games/apex-kart.png',
  './images/games/zona-cero.png',
  './images/games/minecraft.png',
  './images/games/grand-theft-voxel.png',
  './images/games/axcos.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map(u => cache.add(u).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* Cache-first con actualización en segundo plano */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    const fetchAndCache = fetch(e.request).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => cached);
    return cached || fetchAndCache;
  })());
});
