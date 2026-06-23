// Shared JWT verification helper for MyRaaha edge functions.
// Use:
//   import { requireUser } from "../_shared/requireUser.ts";
//   const { user, error } = await requireUser(req);
//   if (error) return error;  // 401 response already built
//
// Additive: any function that opts in gains in-code JWT validation even when
// supabase.toml has verify_jwt = false (the Lovable Cloud default).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildCorsHeaders } from "./cors.ts";

export async function requireUser(req: Request) {
  const cors = buildCorsHeaders(req);
  const auth = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return {
      user: null,
      error: new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      }),
    };
  }
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const client = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) {
    return {
      user: null,
      error: new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      }),
    };
  }
  return { user: data.user, error: null as Response | null };
}
