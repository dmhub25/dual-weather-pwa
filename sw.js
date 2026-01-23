const CACHE_NAME = "weather-pwa-v1";
const ASSETS_TO_CACHE = [
  "/",                // index.html
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/sw.js",
  "/style.css",       // if you have CSS
  "/script.js"        // if your JS is external
];

// Install event - caching essential files
self.addEventListener("install", event => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("[Service Worker] Caching app shell");
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting(); // Activate SW immediately
});

// Activate event - clean up old caches
self.addEventListener("activate", event => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // Take control immediately
});

// Fetch event - serve from cache first, then network
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResp => {
        if (cachedResp) return cachedResp;
        return fetch(event.request)
          .then(networkResp => {
            return caches.open(CACHE_NAME).then(cache => {
              // Cache a copy of the fetched file
              if (event.request.method === "GET" && networkResp.status === 200) {
                cache.put(event.request, networkResp.clone());
              }
              return networkResp;
            });
          })
          .catch(() => {
            // Optional: fallback if offline
            if (event.request.destination === "document") {
              return caches.match("/index.html");
            }
          });
      })
  );
});

// Optional: push notifications or messaging can go here
// For now, we skip message handling to avoid the "message port closed" errors
