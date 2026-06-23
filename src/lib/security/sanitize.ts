/**
 * Lightweight HTML sanitizer. Strips <script>, <style>, event handlers,
 * and javascript: URLs. Use ONLY if you must dangerouslySetInnerHTML.
 *
 * For complex HTML, swap in DOMPurify. We keep this dep-free fallback so
 * the security layer adds no required runtime dependency.
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== "string") return "";
  if (typeof window === "undefined") {
    // Server fallback: brutal strip.
    return html.replace(/<[^>]*>/g, "");
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,iframe,object,embed,link,meta").forEach((n) => n.remove());
  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((a) => {
      const name = a.name.toLowerCase();
      const value = a.value.trim().toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(a.name);
      if ((name === "href" || name === "src") && /^(javascript|data|vbscript):/i.test(value)) {
        el.removeAttribute(a.name);
      }
    });
  });
  return doc.body.innerHTML;
}

/** Plain-text escape for rendering user input inside attributes / templates. */
export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
