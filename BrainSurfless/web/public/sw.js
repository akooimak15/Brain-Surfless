// Service Worker for Brain Surfless PWA
// Caching strategy:
// - Static files (JS, CSS, fonts, images): Cache First
// - API calls: Network First with offline fallback
// - HTML: Network First

const CACHE_NAME = 'brain-surfless-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Assets that should be cached on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

self.addEventListener('install', event => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Precaching assets');
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('[SW] Precache failed (some assets may not exist yet)', err);
      });
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API calls: Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful responses
          if (response && response.status === 200) {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Return cached version if offline
          return caches.match(request).then(response => {
            if (response) {
              return response;
            }
            // Return offline stub for APIs
            return new Response(
              JSON.stringify({ offline: true, message: 'Offline - using cached data' }),
              { headers: { 'Content-Type': 'application/json' } },
            );
          });
        }),
    );
    return;
  }

  // HTML: Network First
  if (request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).catch(() => {
            return caches.match('/index.html');
          });
        }),
    );
    return;
  }

  // Static assets: Cache First
  if (
    request.method === 'GET' &&
    (url.pathname.match(/\.(js|css|woff2?|png|jpg|svg|webp)$/i) ||
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font')
  ) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response;
        }
        return fetch(request)
          .then(response => {
            if (response && response.status === 200) {
              const cache = caches.open(CACHE_NAME);
              cache.then(c => c.put(request, response.clone()));
            }
            return response;
          })
          .catch(() => {
            // Return a generic offline response for failed static assets
            console.warn('[SW] Failed to fetch:', request.url);
            return new Response('Offline', { status: 503 });
          });
      }),
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      }),
  );
});
