const CACHE_NAME = 'quem-falta-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/bundle.css',
  '/styles/main.css',
  '/styles/components.css',
  '/styles/animations.css',
  '/js/app.js',
  '/js/state.js',
  '/js/storage.js',
  '/js/camera.js',
  '/js/tribunal.js',
  '/js/pot-finance.js',
  '/js/gamification.js',
  '/js/audio.js',
  '/js/mock-data.js',
  '/assets/icon.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Cache addAll non-critical error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
