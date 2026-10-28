/* axcStudios — Service Worker
   Da soporte PWA (instalación como app real) a las 3 apps del repo:
   index.html (sitio), store.html (tienda) y axcos.html (sistema operativo). */
const CACHE = 'axcstudios-v4';
const CORE = [
  './',
  './index.html',
  './store.html',
  './axcos.html',
  './player.html',
  './cuenta-demo.html',
  './manifest.webmanifest',
  './manifest-store.webmanifest',
  './manifest-axcos.webmanifest',
  './axc-auth.js',
  './axc-ui.js',
  './axc-bg.js',
  './games-data.js',
  './images/logo.png',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/icon-maskable-512.png',
  './images/store-icon-192.png',
  './images/store-icon-512.png',
  './images/store-icon-maskable-512.png',
  './images/axcos-icon-192.png',
  './images/axcos-icon-512.png',
  './images/axcos-icon-maskable-512.png',
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

/* Fetch: red-primero para código (HTML/JS/manifests → las actualizaciones llegan al instante),
   caché-primero para imágenes (portadas grandes). Fallback offline al caché. */
const RE_NET_FIRST = /\.(?:html|js|webmanifest|css)$/i;
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; /* los juegos externos e iframes no se cachean */
  e.respondWith((async () => {
    const cached = await caches.match(e.request);
    const useNetFirst = RE_NET_FIRST.test(url.pathname) || url.pathname.endsWith('/') || url.pathname.endsWith('axcStudios/');
    if (!useNetFirst && cached) return cached;
    try {
      const res = await fetch(e.request);
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    } catch (err) {
      if (cached) return cached;
      throw err;
    }
  })());
});
