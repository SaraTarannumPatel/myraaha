// Generates a personalised one-page Career Blueprint from user_signals using
// Gemini 2.5 Pro + optional Firecrawl search for live India-localised resources.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Signal {
  signal_type?: string;
  signal_value?: string;
  strength?: number;
  signal_context?: any;
}

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firecrawl";

async function firecrawlSearch(query: string, limit = 5): Promise<{ title: string; url: string }[]> {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const fcKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!lovableKey || !fcKey) return [];
  try {
    const res = await fetch(`${GATEWAY_URL}/v2/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": fcKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, limit, country: "in", lang: "en" }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items: any[] = json?.data?.web || json?.data || json?.web || [];
    return items
      .map((it: any) => ({ title: it.title || it.url, url: it.url }))
      .filter((x) => !!x.url)
      .slice(0, limit);
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { getAuthUser, unauthorized } = await import("../_shared/auth.ts");
    const user = await getAuthUser(req);
    if (!user) return unauthorized();

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const { signals = [] } = (await req.json().catch(() => ({}))) as { signals?: Signal[] };

    // Compress signals for the prompt
    const compact = signals.slice(0, 80).map((s) => ({
      t: s.signal_type,
      v: s.signal_value,
      s: typeof s.strength === "number" ? Number(s.strength.toFixed(2)) : undefined,
    }));

    const topInterests = Array.from(
      new Set(
        signals
          .filter((s) => (s.strength ?? 0) > 0.4)
          .map((s) => String(s.signal_value || ""))
          .filter(Boolean),
      ),
    ).slice(0, 6);

    // Live resources for the top interest words
    const resourceQuery = topInterests.length
      ? `Best free online courses and learning paths in India for ${topInterests.slice(0, 3).join(", ")}`
      : "Best free Indian career learning resources for students";
    const liveResources = await firecrawlSearch(resourceQuery, 6);

    const system = `You are MyRaaha's Career Blueprint architect. Build a single-page, action-led blueprint for an Indian learner aged 13+.
Tone: warm, Gen Z, jargon-free. Currency in INR. Keep each milestone concrete.
Return STRICT JSON only — no prose, no markdown fences.`;

    const user = `User signals (compact): ${JSON.stringify(compact)}
Top recurring interests: ${JSON.stringify(topInterests)}

Return JSON with shape:
{
  "headline": "string (≤80 chars, punchy)",
  "narrative": "string (2-3 sentences, addresses 'you')",
  "north_star": "string (1 sentence vision)",
  "domains": ["3-6 domain tags"],
  "skills": ["4-8 skill tags"],
  "milestones": [
    { "title": "string", "timeframe": "e.g. 'Next 2 weeks'", "why": "string", "next_actions": ["3-4 concrete steps"] }
  ] (4 to 6 milestones, ordered),
  "immediate_next_step": "single sentence — what to do today",
  "resources": [{ "title": "string", "url": "string" }] (use the urls below if relevant)
}

Live resource candidates (pick the best 4-6, you may keep their URL):
${JSON.stringify(liveResources)}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: `AI error: ${err}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content || "{}";
    let blueprint: any = {};
    try {
      blueprint = JSON.parse(content);
    } catch {
      blueprint = { headline: "Your Blueprint", narrative: content, milestones: [] };
    }

    // Make sure resources exist even if model dropped them
    if ((!blueprint.resources || !blueprint.resources.length) && liveResources.length) {
      blueprint.resources = liveResources.slice(0, 5);
    }

    return new Response(JSON.stringify({ blueprint }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
