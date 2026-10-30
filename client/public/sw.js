// ==============================================================================
// HOTELIER PWA SERVICE WORKER
// Network-First for Navigation, Stale-While-Revalidate for Static Assets
// ==============================================================================

const CACHE_NAME = 'hotelier-shell-v1';

// Core navigation shell (must succeed for offline app shell)
const CORE_SHELL_ASSETS = [
  '/',
  '/index.html'
];

// Optional static assets (cached best-effort so missing icons never break install)
const OPTIONAL_ASSETS = [
  '/site.webmanifest',
  '/favicon.ico',
  '/assets/favicon-32x32.png',
  '/assets/apple-touch-icon.png'
];

// 1. Install Event: Pre-cache core application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_SHELL_ASSETS);
      await Promise.allSettled(
        OPTIONAL_ASSETS.map((url) => cache.add(url))
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up stale caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Same-Origin Only — Network-First for HTML, Stale-While-Revalidate for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Security & Cache Hygiene: Only intercept same-origin GET requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Never cache API requests or the Service Worker script itself
  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') {
    return;
  }

  // Navigation requests: Network-First with Cache fallback (guarantees fresh HTML releases)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        return (await caches.match('/index.html')) || (await caches.match('/'));
      })
    );
    return;
  }

  // Same-origin Static Assets, Images & Scripts: Stale-While-Revalidate strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
