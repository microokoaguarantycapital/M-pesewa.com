const CACHE_NAME = 'm-pesewa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/css/main.css',
  '/assets/css/components.css',
  '/assets/css/animations.css',
  '/assets/js/app.js',
  '/assets/js/auth.js',
  '/assets/js/pwa.js',
  '/pages/countries/index.html',
  '/pages/groups.html',
  '/pages/lending.html',
  '/pages/borrowing.html',
  '/pages/about.html',
  '/pages/contact.html',
  '/pages/qa.html',
  '/pages/blacklist.html',
  '/pages/debt-collectors.html',
  '/pages/ledger.html',
  '/pages/subscriptions.html',
  '/pages/dashboard/borrower-dashboard.html',
  '/pages/dashboard/lender-dashboard.html',
  '/pages/dashboard/admin-dashboard.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            return caches.match('/offline.html');
          });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});