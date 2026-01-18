/* VendTracker service worker: cache core app shell for offline use */
const CACHE_NAME = "vendtracker-pwa-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./app.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((resp) => {
      try {
        const url = new URL(req.url);
        if (req.method === "GET" && url.origin === self.location.origin) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
      } catch {}
      return resp;
    }).catch(() => caches.match("./index.html")))
  );
});
