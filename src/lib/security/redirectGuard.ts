/**
 * Open-redirect guard. Accepts only same-origin paths beginning with "/".
 * Returns the safe fallback if the input is anything else.
 */
export function safeRedirect(target: string | null | undefined, fallback = "/dashboard"): string {
  if (!target || typeof target !== "string") return fallback;
  // Reject protocol-relative and absolute URLs.
  if (/^(\/\/|https?:|javascript:|data:|vbscript:)/i.test(target.trim())) return fallback;
  if (!target.startsWith("/")) return fallback;
  // Strip CR/LF — header injection defense.
  return target.replace(/[\r\n]/g, "");
}
