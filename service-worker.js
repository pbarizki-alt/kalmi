const CACHE_NAME = 'remi-score-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

// Menginstall Service Worker dan menyimpan file ke Cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Mengambil file dari Cache saat offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, gunakan itu. Jika tidak, ambil dari internet.
        return response || fetch(event.request);
      })
  );
});