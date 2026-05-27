// Shared auth helpers for edge functions.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-admin-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export function unauthorized(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function forbidden(message = "Forbidden") {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/**
 * Verifies the request's Authorization Bearer JWT and returns the user id.
 * Returns null when there is no valid user (caller should return unauthorized()).
 */
export async function getAuthUser(req: Request): Promise<{ id: string; email?: string } | null> {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
  );
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return { id: data.user.id, email: data.user.email ?? undefined };
  } catch {
    return null;
  }
}

/**
 * Admin-only check for cron/ingest endpoints. Accepts either a valid
 * X-Admin-Secret header matching ADMIN_INGEST_SECRET, or a user JWT whose
 * user has the `admin` role in user_roles.
 */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const secret = Deno.env.get("ADMIN_INGEST_SECRET");
  const provided = req.headers.get("x-admin-secret") || req.headers.get("X-Admin-Secret");
  if (secret && provided && provided === secret) return true;

  const user = await getAuthUser(req);
  if (!user) return false;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}
