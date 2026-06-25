/**
 * safeFetch — opt-in fetch wrapper that blocks SSRF-style outbound calls.
 * Existing fetch() calls are untouched; import this only where you forward
 * user-supplied URLs.
 */

const DEFAULT_ALLOW: ReadonlyArray<string | RegExp> = [
  /\.supabase\.co$/i,
  /^ai\.gateway\.lovable\.dev$/i,
  /^connector-gateway\.lovable\.dev$/i,
  /^api\.firecrawl\.dev$/i,
];

const BLOCK_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254", // cloud metadata
  "metadata.google.internal",
]);

function hostAllowed(host: string, allow: ReadonlyArray<string | RegExp>): boolean {
  const h = host.toLowerCase();
  if (BLOCK_HOSTS.has(h)) return false;
  // Block private IPv4 ranges by simple regex
  if (/^10\./.test(h) || /^192\.168\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
  return allow.some((rule) => (typeof rule === "string" ? h === rule.toLowerCase() : rule.test(h)));
}

export interface SafeFetchOptions extends RequestInit {
  allow?: ReadonlyArray<string | RegExp>;
  timeoutMs?: number;
}

export async function safeFetch(input: string, init: SafeFetchOptions = {}): Promise<Response> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("safeFetch: invalid URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "wss:") {
    throw new Error("safeFetch: only https/wss allowed");
  }
  const allow = init.allow ?? DEFAULT_ALLOW;
  if (!hostAllowed(url.hostname, allow)) {
    throw new Error(`safeFetch: host not allow-listed (${url.hostname})`);
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), init.timeoutMs ?? 15_000);
  try {
    const { allow: _a, timeoutMs: _t, signal: _s, ...rest } = init;
    return await fetch(url.toString(), { ...rest, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}
