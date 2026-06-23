// Edge-function-side scrubbing logger. Mirrors src/lib/security/logger.ts.
const PATTERNS: Array<[RegExp, string]> = [
  [/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[jwt]"],
  [/sk-[A-Za-z0-9]{20,}/g, "[secret]"],
  [/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer [redacted]"],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]"],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "[uuid]"],
];

function scrub(v: unknown, depth = 0): unknown {
  if (depth > 4) return "[depth]";
  if (v == null) return v;
  if (typeof v === "string") {
    let out = v;
    for (const [re, r] of PATTERNS) out = out.replace(re, r);
    return out;
  }
  if (typeof v === "object") {
    if (Array.isArray(v)) return v.map((x) => scrub(x, depth + 1));
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      out[k] = /(password|token|secret|api[_-]?key|authorization)/i.test(k)
        ? "[redacted]"
        : scrub(val, depth + 1);
    }
    return out;
  }
  return v;
}

export const log = {
  info: (...a: unknown[]) => console.log(...a.map((x) => scrub(x))),
  warn: (...a: unknown[]) => console.warn(...a.map((x) => scrub(x))),
  error: (...a: unknown[]) => console.error(...a.map((x) => scrub(x))),
};
