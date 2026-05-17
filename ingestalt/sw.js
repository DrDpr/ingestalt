const CACHE_NAME = 'ingestalt-pwa-cache-v2';
const ASSETS = [
  '/ingestalt/Logo.png',
  '/ingestalt/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
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
});

self.addEventListener('fetch', (event) => {
  // Only intercept HTTP/HTTPS requests (avoid chrome-extension:// etc.)
  if (!event.request.url.startsWith('http')) return;

  // Skip caching for Next.js chunks, dynamic pages, and internal scripts
  const url = new URL(event.request.url);
  if (
    url.pathname.includes('/_next/') || 
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.css') ||
    url.pathname.includes('/canvas') ||
    url.pathname.includes('/wiki')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        // Cache new static assets dynamically
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });
    })
  );
});
