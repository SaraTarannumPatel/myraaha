import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await userClient.auth.getClaims(token);
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub;

    const body = await req.json().catch(() => ({}));
    const requestedTypes: string[] = Array.isArray(body?.types) ? body.types.filter((t: unknown) => typeof t === "string").slice(0, 50) : [];
    if (requestedTypes.length === 0) {
      return new Response(JSON.stringify({ awarded: [], total_points: 0, badge_count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve templates server-side — caller cannot supply title/points
    const { data: templates, error: tplErr } = await admin
      .from("badge_templates")
      .select("type,title,description,points,icon")
      .in("type", requestedTypes);
    if (tplErr) throw tplErr;
    if (!templates || templates.length === 0) {
      return new Response(JSON.stringify({ awarded: [], total_points: 0, badge_count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exclude already-earned types
    const { data: earnedRows, error: earnedErr } = await admin
      .from("achievements")
      .select("achievement_type")
      .eq("user_id", userId)
      .in("achievement_type", templates.map((t: any) => t.type));
    if (earnedErr) throw earnedErr;
    const earnedSet = new Set((earnedRows || []).map((r: any) => r.achievement_type));
    const toAward = templates.filter((t: any) => !earnedSet.has(t.type));

    if (toAward.length > 0) {
      await admin.from("achievements").insert(
        toAward.map((b: any) => ({
          user_id: userId,
          achievement_type: b.type,
          title: b.title,
          description: b.description,
          points: b.points,
        }))
      );
      await admin.from("milestone_celebrations").insert(
        toAward.map((b: any) => ({
          user_id: userId,
          milestone_type: "badge_earned",
          title: `🎉 ${b.title} Unlocked!`,
          description: b.description,
          celebration_data: { badge_type: b.type, icon: b.icon, points: b.points },
        }))
      );
    }

    // Recompute authoritative totals
    const { data: allEarned } = await admin
      .from("achievements")
      .select("points")
      .eq("user_id", userId);
    const totalPoints = (allEarned || []).reduce((s: number, a: any) => s + (a.points || 0), 0);
    const badgeCount = (allEarned || []).length;

    await admin.from("leaderboard_entries").upsert({
      user_id: userId,
      scope: "global",
      scope_id: "career",
      total_points: totalPoints,
      badge_count: badgeCount,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,scope,scope_id" });

    return new Response(
      JSON.stringify({ awarded: toAward, total_points: totalPoints, badge_count: badgeCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("award-achievements error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
