const CACHE = 'musicplayer-v2';
const FILES = ['/', '/index.html', '/manifest.json', '/sw.js'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.startsWith('blob:')) return;

  // Navigatie-verzoeken (openen van app) altijd vanuit cache serveren
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match('/index.html').then(r => r || fetch(e.request))
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    })).catch(() => caches.match('/index.html'))
  );
});
