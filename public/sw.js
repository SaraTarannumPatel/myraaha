// MyRaaha service worker — kept lean to avoid serving stale app shells across
// preview ⇄ published domains. Bumping VERSION on every deploy invalidates
// old caches; navigations are strictly network-first and the HTML response is
// NEVER cached so the user always gets the latest bundle the moment the
// network is reachable.
const VERSION = "myraaha-v5-2026-06-26";
const DATA_CACHE = "myraaha-data-v2";
const CORE = ["/manifest.webmanifest", "/myraaha-logo.png", "/favicon.png"];
const HOSTNAME = self.location.hostname;
const DISABLE_APP_SW =
  HOSTNAME.startsWith("id-preview--") ||
  HOSTNAME.startsWith("preview--") ||
  HOSTNAME === "lovableproject.com" ||
  HOSTNAME.endsWith(".lovableproject.com") ||
  HOSTNAME === "lovableproject-dev.com" ||
  HOSTNAME.endsWith(".lovableproject-dev.com") ||
  HOSTNAME === "beta.lovable.dev" ||
  HOSTNAME.endsWith(".beta.lovable.dev");

self.addEventListener("install", (e) => {
  if (DISABLE_APP_SW) {
    self.skipWaiting();
    return;
  }
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      if (DISABLE_APP_SW) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.filter((k) => k.startsWith("myraaha-")).map((k) => caches.delete(k)));
          await self.clients.claim();
          const clients = await self.clients.matchAll({ type: "window" });
          clients.forEach((client) => client.navigate(client.url).catch(() => {}));
        } finally {
          await self.registration.unregister();
        }
        return;
      }
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== VERSION && k !== DATA_CACHE).map((k) => caches.delete(k))
      );
      await self.clients.claim();
      // Tell every open tab the new SW is live so it can soft-reload.
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((c) => c.postMessage({ type: "SW_UPDATED", version: VERSION }));
    })()
  );
});

self.addEventListener("message", (event) => {
  if (!event.data) return;
  if (event.data.type === "SKIP_WAITING") self.skipWaiting();
  // Security: on logout, wipe every cache this SW controls so no private
  // response can be re-served to the next user of the same device.
  if (event.data.type === "LOGOUT_PURGE") {
    event.waitUntil(
      (async () => {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch {}
      })()
    );
  }
});

self.addEventListener("fetch", (event) => {
  if (DISABLE_APP_SW) return;
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // SECURITY: never let the SW touch auth-bearing requests. If an Authorization
  // header is present, bypass entirely so private responses can never be cached.
  if (req.headers && req.headers.get && req.headers.get("authorization")) return;

  // Supabase REST GETs: network-first, fall back to last-known-good for offline reads.
  if (url.hostname.includes("supabase")) {
    if (
      url.pathname.startsWith("/rest/v1/") &&
      !url.pathname.includes("/auth/") &&
      !url.pathname.includes("/realtime/") &&
      !url.pathname.includes("/storage/") &&
      !url.pathname.includes("/functions/")
    ) {
      event.respondWith(
        fetch(req)
          .then((res) => {
            // Only cache responses that are explicitly public (no Vary on auth,
            // no Set-Cookie, status 200). This is defense-in-depth on top of
            // the Authorization-header bypass above.
            const setCookie = res.headers.get("set-cookie");
            if (res && res.status === 200 && !setCookie) {
              const copy = res.clone();
              caches.open(DATA_CACHE).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() =>
            caches
              .match(req)
              .then((r) => r || new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } }))
          )
      );
      return;
    }
    // auth / realtime / storage / functions — bypass SW entirely.
    return;
  }
  if (url.pathname.startsWith("/api/")) return;

  // NAVIGATIONS: always go to network, never serve cached HTML — this prevents
  // the "old design after clicking email confirm link" bug where a stale tab
  // kept rendering an old index.html from cache. We only fall back to the
  // tiny offline shell when the network is completely unreachable.
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req, { cache: "no-store" });
        } catch {
          return new Response(
            "<!doctype html><meta charset=utf-8><title>Offline</title><p>You appear to be offline.</p>",
            { headers: { "Content-Type": "text/html" } }
          );
        }
      })()
    );
    return;
  }

  // Same-origin hashed assets: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        const fetched = fetch(req)
          .then((res) => {
            try {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(req, copy)).catch(() => {});
            } catch {}
            return res;
          })
          .catch(() => null);
        if (cached) return cached;
        const res = await fetched;
        if (res) return res;
        return new Response("", { status: 504, statusText: "Offline" });
      })()
    );
  }
});
