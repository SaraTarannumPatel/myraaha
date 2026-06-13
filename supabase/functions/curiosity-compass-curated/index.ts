// Curiosity Compass — Curated Orchestrator
// ---------------------------------------------------------------------------
// Returns a personalized bundle for the 4 Compass modes (story / challenge /
// career_deck / audio_visual). Uses the user's cached personalization (built
// by src/lib/personalizationPipeline) — sectors + assessment keyword bag —
// to filter the global Explore taxonomy down to a curated subset, then
// (optionally) AI-summarizes each item via Lovable AI Gateway.
//
// POST body: { mode: "story" | "challenge" | "career_deck" | "audio_visual",
//              limit?: number, summarize?: boolean }
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const MODE_ENTITY_TYPES: Record<string, string[]> = {
  story: ["role", "path", "industry"],
  challenge: ["skill", "role", "domain"],
  career_deck: ["role", "sector", "domain"],
  audio_visual: ["sector", "industry", "domain"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userClient = createClient(SUPABASE_URL, SERVICE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const mode = String(body.mode || "career_deck");
    const limit = Math.min(Math.max(Number(body.limit) || 12, 1), 30);
    const summarize = body.summarize !== false;

    const entityTypes = MODE_ENTITY_TYPES[mode] || MODE_ENTITY_TYPES.career_deck;

    // Pull cached personalization
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: cache } = await admin
      .from("ai_cache")
      .select("payload")
      .eq("user_id", user.id)
      .eq("cache_key", "user_personalization_v1")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const personalization = (cache?.payload as any) || { sectors: [], keywords: [], ranked: {} };

    // Rank each entity type via the RPC (uses auth context)
    const buckets: Record<string, any[]> = {};
    for (const etype of entityTypes) {
      const cached = personalization.ranked?.[etype];
      if (Array.isArray(cached) && cached.length) {
        buckets[etype] = cached.slice(0, limit);
        continue;
      }
      const { data } = await userClient.rpc("match_explore_entities_for_user", {
        _entity_type: etype,
        _limit: limit,
      });
      buckets[etype] = (data || []) as any[];
    }

    let aiSummary: string | null = null;
    if (summarize && LOVABLE_API_KEY) {
      const top = entityTypes
        .flatMap((t) => (buckets[t] || []).slice(0, 3).map((e) => `${t}: ${e.entity_name}`))
        .join(", ");
      const sectors = (personalization.sectors || []).slice(0, 5).join(", ");
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are MyRaaha's Gen-Z career guide. Write ONE short, warm, jargon-free sentence (max 25 words) explaining why these picks fit the user. No emojis except one at the end.",
              },
              {
                role: "user",
                content: `Sectors: ${sectors || "none"}. Mode: ${mode}. Top picks: ${top}.`,
              },
            ],
          }),
        });
        const j = await resp.json();
        aiSummary = j?.choices?.[0]?.message?.content?.trim() || null;
      } catch (_) {
        aiSummary = null;
      }
    }

    return json({
      mode,
      sectors: personalization.sectors || [],
      buckets,
      summary: aiSummary,
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("curiosity-compass-curated:", e);
    return json({ error: "Internal server error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
