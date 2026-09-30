// Bump this on every deploy that changes cached static assets, so old
// caches get cleared out in the `activate` handler below.
const CACHE_NAME = "tipus-israel-v1";
const OFFLINE_URL = "/offline.html";
const APP_SHELL = ["/", OFFLINE_URL, "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML pages: try the network first so climbers always see fresh gym
  // hours/info when online, fall back to a cached copy or the offline
  // page when there's no signal (the whole point of caching this site).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ??
            (await caches.match(OFFLINE_URL)),
        ),
    );
    return;
  }

  // Static assets (JS/CSS/fonts/images): cache-first, refresh in the
  // background so a stale asset doesn't block a fast repeat visit.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => cached);
      return cached ?? network;
    }),
  );
});
