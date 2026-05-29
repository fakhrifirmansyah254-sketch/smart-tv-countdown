const CACHE_NAME = 'tv-countdown-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/src/components/BackgroundLayer.tsx',
  '/src/components/HeaderTitle.tsx',
  '/src/components/TimeUnit.tsx',
  '/src/components/CountdownCard.tsx',
  '/src/components/SettingsModal.tsx',
  '/src/hooks/useCountdown.ts',
  '/src/hooks/useTvNavigation.ts',
  '/src/utils/helpers.ts'
];

// Install Event - Pre-cache essential files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn("Offline assets caching warning (some might only exist after build):", err);
      });
    }).then(() => (self as any).skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Serve from Cache, Fallback to Network (Offline First)
self.addEventListener('fetch', (e: any) => {
  // Skip API requests to the Node.js backend
  if (e.request.url.includes('/api/')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch new version in background to update cache (stale-while-revalidate)
        fetch(e.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, networkResponse);
            });
          }
        }).catch(() => {/* Ignore network errors offline */});
        
        return cachedResponse;
      }

      return fetch(e.request).then((networkResponse) => {
        // Cache newly fetched assets dynamically
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseCopy);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for document requests when offline
        if (e.request.mode === 'navigate') {
          return caches.match('/');
        }
      }) as any;
    })
  );
});
