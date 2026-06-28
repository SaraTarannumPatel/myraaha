// Server-side rate-limit endpoint. Wraps the `record_rate_limit_hit` RPC so
// auth-adjacent flows can check & enforce hits without exposing the service
// role to the client. Returns { allowed, count, limit, retry_after }.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  endpoint: string;
  identity?: string;
  window_seconds?: number;
  limit?: number;
}

function hash(input: string): string {
  // FNV-1a 32-bit — good enough to anonymise an identifier in the log
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Require either a valid JWT or the admin ingest secret. This prevents
  // anonymous callers from pre-filling rate-limit buckets for other identities
  // or probing hit counts.
  const adminSecret = Deno.env.get("ADMIN_INGEST_SECRET");
  const providedAdmin = req.headers.get("x-admin-secret") || req.headers.get("X-Admin-Secret");
  const isAdmin = !!(adminSecret && providedAdmin && providedAdmin === adminSecret);
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!isAdmin) {
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const verifier = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.slice(7).trim();
    const { data: claims, error: claimsErr } = await verifier.auth.getClaims(token);
    if (claimsErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const endpoint = String(body.endpoint || "").slice(0, 100);
  if (!endpoint) {
    return new Response(JSON.stringify({ error: "endpoint_required" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const windowSeconds = Math.min(Math.max(Number(body.window_seconds) || 60, 10), 3600);
  const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 1000);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";
  const ident = hash(String(body.identity || ip));

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase.rpc("record_rate_limit_hit", {
    _identity: ident,
    _endpoint: endpoint,
    _window_seconds: windowSeconds,
  });

  if (error) {
    console.error("auth-rate-limit rpc error", error.message);
    return new Response(JSON.stringify({ error: "rpc_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const count = Number(data) || 0;
  const allowed = count <= limit;

  return new Response(
    JSON.stringify({
      allowed,
      count,
      limit,
      window_seconds: windowSeconds,
      retry_after: allowed ? 0 : windowSeconds,
    }),
    {
      status: allowed ? 200 : 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        ...(allowed ? {} : { "Retry-After": String(windowSeconds) }),
      },
    },
  );
});
