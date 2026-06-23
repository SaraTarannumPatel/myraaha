/**
 * safeStorage — opt-in wrapper around browser storage that:
 *  - Prefers sessionStorage for short-lived values.
 *  - Refuses to store anything that looks like a token/secret/JWT.
 *  - Provides a single purge() called on logout.
 *
 * Additive: existing direct localStorage callers continue to work.
 */

const SENSITIVE_RE = /(eyJ[A-Za-z0-9_-]{10,}\.|sk-[A-Za-z0-9]{20,}|password|secret)/i;

function guard(value: string) {
  if (SENSITIVE_RE.test(value)) {
    throw new Error("safeStorage: refusing to store sensitive-looking value");
  }
}

export const safeSession = {
  get(key: string): string | null {
    try { return sessionStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    guard(value);
    try { sessionStorage.setItem(key, value); } catch { /* quota / disabled */ }
  },
  remove(key: string) {
    try { sessionStorage.removeItem(key); } catch { /* noop */ }
  },
};

export const safeLocal = {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    guard(value);
    try { localStorage.setItem(key, value); } catch { /* noop */ }
  },
  remove(key: string) {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
};

/** Wipe every MyRaaha-owned key + tell the SW to clear its caches. */
export function purgeOnLogout(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("myraaha_") || (k.startsWith("sb-") && k.endsWith("-auth-token")))
      .forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch { /* noop */ }
  try {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "LOGOUT_PURGE" });
    }
  } catch { /* noop */ }
}
