// Registers the PWA service worker in production only.
// On update we auto-reload the page once so users on a stale tab (e.g. the
// tab opened by clicking "confirm email" in their inbox) immediately get the
// new bundle instead of the previously-cached design.
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const hostname = window.location.hostname;
  const isBlockedRuntime =
    import.meta.env.DEV ||
    window.self !== window.top ||
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev") ||
    new URLSearchParams(window.location.search).get("sw") === "off";

  const unregisterAppWorker = () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations
          .filter((registration) => registration.active?.scriptURL.endsWith("/sw.js") || registration.installing?.scriptURL.endsWith("/sw.js") || registration.waiting?.scriptURL.endsWith("/sw.js"))
          .forEach((registration) => registration.unregister().catch(() => {}));
      })
      .catch(() => {});
  };

  if (isBlockedRuntime) {
    unregisterAppWorker();
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      // When a new worker takes control, reload once.
      let reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      });
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) {
            sw.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
    }).catch(() => {});

    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data?.type === "SW_UPDATED") {
        // No-op: controllerchange handler above will reload.
      }
    });
  });
}
