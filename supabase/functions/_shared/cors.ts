// Shared CORS allow-list for MyRaaha edge functions.
// Additive: existing functions can opt in by importing buildCorsHeaders(req)
// instead of declaring a wildcard corsHeaders block.

const ALLOWED_ORIGINS = new Set<string>([
  "https://myraaha.lovable.app",
  "https://id-preview--061f4912-8d48-43d2-9a12-2ad4deaa1943.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
]);

// Allow any *.lovable.app / *.lovableproject.com preview subdomain.
const ALLOWED_SUFFIXES = [".lovable.app", ".lovableproject.com", ".lovable.dev"];

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    return ALLOWED_SUFFIXES.some((s) => host.endsWith(s));
  } catch {
    return false;
  }
}

export function buildCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin");
  const allow = isAllowedOrigin(origin) ? origin! : "https://myraaha.lovable.app";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-connection-api-key",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}
