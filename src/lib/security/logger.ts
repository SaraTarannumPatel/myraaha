/**
 * Scrubbing logger — strips emails, JWTs, UUIDs, phone numbers, and
 * common secret-shaped strings before anything is written to the console.
 *
 * Purely additive: existing `console.*` calls continue to work; we wrap
 * them in production so the same call site never leaks PII.
 */

const PATTERNS: Array<[RegExp, string]> = [
  [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[jwt]"],
  [/sk-[A-Za-z0-9]{20,}/g, "[secret]"],
  [/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]"],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]"],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[uuid]"],
  [/(\+?\d[\d\s().-]{7,}\d)/g, "[phone]"],
];

function scrubString(s: string): string {
  let out = s;
  for (const [re, replacement] of PATTERNS) out = out.replace(re, replacement);
  return out;
}

function scrub(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[depth]";
  if (value == null) return value;
  if (typeof value === "string") return scrubString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Error) {
    return { name: value.name, message: scrubString(value.message) };
  }
  if (Array.isArray(value)) return value.map((v) => scrub(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (/(password|token|secret|api[_-]?key|authorization|cookie|session)/i.test(k)) {
        out[k] = "[redacted]";
      } else {
        out[k] = scrub(v, depth + 1);
      }
    }
    return out;
  }
  return value;
}

let installed = false;

/** Install the scrubber on console.log/info/warn/error in production. */
export function installSecureLogger(): void {
  if (installed) return;
  installed = true;
  if (typeof window === "undefined") return;
  // Only override in production builds; keep dev devex untouched.
  if (!import.meta.env.PROD) return;

  const orig = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
  const wrap = (fn: (...a: unknown[]) => void) =>
    (...args: unknown[]) => fn(...args.map((a) => scrub(a)));

  console.log = wrap(orig.log);
  console.info = wrap(orig.info);
  console.warn = wrap(orig.warn);
  console.error = wrap(orig.error);
}

export const secureLog = {
  info: (...args: unknown[]) => console.info(...args.map((a) => scrub(a))),
  warn: (...args: unknown[]) => console.warn(...args.map((a) => scrub(a))),
  error: (...args: unknown[]) => console.error(...args.map((a) => scrub(a))),
};
