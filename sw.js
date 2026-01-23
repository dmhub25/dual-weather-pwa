const CACHE_VERSION = "v2";
const CACHE_NAME = `weather-pwa-${CACHE_VERSION}`;
const ASSETS_TO_CACHE = [
  "/dual-weather-pwa/", // root folder for GitHub Pages project site
  "/dual-weather-pwa/index.html",
  "/dual-weather-pwa/manifest.json",
  "/dual-weather-pwa/icon-192.png",
  "/dual-weather-pwa/icon-512.png",
  "/dual-weather-pwa/sw.js",
];

// Install event: cache app shell
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate event: delete old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

// Fetch event: respond with cached or fetch from network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === "GET" && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});
