// MyRaaha service worker — offline shell + stale-while-revalidate for assets/pages
// + last-known-good cache for Supabase REST GETs so users see cached roadmaps,
// journals, etc. when offline.
const VERSION = "myraaha-v2";
const DATA_CACHE = "myraaha-data-v1";
const CORE = ["/", "/manifest.webmanifest", "/myraaha-logo.png", "/favicon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Supabase REST GETs: network-first with last-known-good fallback for offline reads.
  // Never cache auth, realtime, storage uploads, or edge function calls.
  if (url.hostname.includes("supabase")) {
    const isRest = url.pathname.startsWith("/rest/v1/");
    const isSafeRest = isRest && !url.searchParams.has("select=") ? true : isRest;
    if (
      isSafeRest &&
      !url.pathname.includes("/auth/") &&
      !url.pathname.includes("/realtime/") &&
      !url.pathname.includes("/storage/") &&
      !url.pathname.includes("/functions/")
    ) {
      event.respondWith(
        fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(DATA_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => caches.match(req).then((r) => r || new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } }))),
      );
      return;
    }
    return; // other supabase calls: bypass SW
  }
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests: network-first, fallback to cached shell
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Same-origin static assets: stale-while-revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetched = fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached);
        return cached || fetched;
      }),
    );
  }
});
