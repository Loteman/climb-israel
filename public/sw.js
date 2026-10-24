// Bump this on every deploy that changes cached static assets or this
// file's caching rules, so old caches get cleared out in `activate` below.
const CACHE_NAME = "tipus-israel-v4";
// Cloudflare Pages serves offline.html at /offline (the .html URL is a 308
// redirect), so cache it under the URL that answers directly.
const OFFLINE_URL = "/offline";
const APP_SHELL = ["/", OFFLINE_URL, "/manifest.webmanifest"];

// Only complete, successful, same-origin responses are worth keeping. A
// 404/500 page cached under a real URL would be served offline as if it
// were the page, and a 206 (a ranged PDF request) can't be stored at all -
// cache.put() rejects it.
function isCacheable(response) {
  return response && response.status === 200 && response.type === "basic";
}

// Browsers refuse a redirected response as the answer to a page
// navigation, so a cached copy that came through a redirect (e.g.
// /offline.html -> /offline, or a page URL without its trailing slash) is
// re-wrapped as a plain response before it is served.
async function withoutRedirect(response) {
  if (!response || !response.redirected) return response;
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

function putInCache(request, response) {
  if (!isCacheable(response)) return;
  const clone = response.clone();
  caches
    .open(CACHE_NAME)
    .then((cache) => cache.put(request, clone))
    .catch(() => {
      /* quota exceeded etc. - caching is best-effort */
    });
}

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
  // Partial-content requests (PDF viewers fetch in ranges) go straight to
  // the network - the cache can't answer or store them correctly.
  if (request.headers.has("range")) return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML pages: try the network first so climbers always see fresh gym
  // hours/info when online, fall back to a cached copy or the offline
  // page when there's no signal (the whole point of caching this site).
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(async () =>
          // ignoreSearch: a filtered directory link (?kind=crag) still
          // finds the cached directory page instead of the offline page.
          withoutRedirect(
            (await caches.match(request, { ignoreSearch: true })) ??
              (await caches.match(OFFLINE_URL)),
          ),
        ),
    );
    return;
  }

  // Static assets (JS/CSS/fonts/images, and guidebook PDFs once opened):
  // cache-first, refreshed in the background so a stale asset doesn't
  // block a fast repeat visit - and an opened guidebook stays available
  // at the crag with no reception.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() => cached ?? Response.error());
      return cached ?? network;
    }),
  );
});
