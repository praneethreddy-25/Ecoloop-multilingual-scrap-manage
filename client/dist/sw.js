const CACHE_NAME = 'ecoloop-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).catch(() => {
          // Serve offline fallback if needed
        });
      })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-collections') {
    event.waitUntil(syncOfflineCollections());
  }
});

async function syncOfflineCollections() {
  // Logic to read from IndexedDB and send to server
  console.log('Background sync triggered for offline collections');
}
