// AI Roadmaps — on-demand web resource search.
// Tries SerpAPI → SearchAPI.io → Google CSE based on configured secrets.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type WebResource = { title: string; link: string; snippet: string; displayLink?: string };

async function trySerpApi(q: string, num: number): Promise<WebResource[] | null> {
  const key = Deno.env.get("SERPAPI_KEY");
  if (!key) return null;
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&num=${num}&api_key=${key}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  const items = j.organic_results || [];
  return items.slice(0, num).map((x: any) => ({
    title: x.title || "",
    link: x.link || "",
    snippet: x.snippet || "",
    displayLink: x.displayed_link || x.source || (x.link ? new URL(x.link).hostname : ""),
  }));
}

async function trySearchApi(q: string, num: number): Promise<WebResource[] | null> {
  const key = Deno.env.get("SEARCHAPI_IO_KEY");
  if (!key) return null;
  const url = `https://www.searchapi.io/api/v1/search?engine=google&q=${encodeURIComponent(q)}&num=${num}&api_key=${key}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  const items = j.organic_results || [];
  return items.slice(0, num).map((x: any) => ({
    title: x.title || "",
    link: x.link || "",
    snippet: x.snippet || "",
    displayLink: x.displayed_link || (x.link ? new URL(x.link).hostname : ""),
  }));
}

async function tryGoogleCse(q: string, num: number): Promise<WebResource[] | null> {
  const key = Deno.env.get("GOOGLE_CSE_KEY");
  const cx = Deno.env.get("GOOGLE_CSE_ID");
  if (!key || !cx) return null;
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(q)}&num=${Math.min(num, 10)}&key=${key}&cx=${cx}`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const j = await r.json();
  return (j.items || []).slice(0, num).map((x: any) => ({
    title: x.title || "",
    link: x.link || "",
    snippet: x.snippet || "",
    displayLink: x.displayLink || "",
  }));
}

// Lovable AI fallback: generate suggested resources (real URLs) when no search key.
async function tryAiFallback(q: string, num: number): Promise<WebResource[] | null> {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) return null;
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Return a JSON array of real, verifiable learning resources. Prefer well-known platforms (YouTube, Coursera, edX, freeCodeCamp, MDN, official docs, GitHub, Reddit, arXiv). Use real URLs only." },
          { role: "user", content: `Return ${num} resources for: "${q}". JSON array only, each {"title","link","snippet","displayLink"}.` },
        ],
        temperature: 0.4,
      }),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const content = j.choices?.[0]?.message?.content || "";
    const m = content.match(/\[[\s\S]*\]/);
    if (!m) return null;
    const arr = JSON.parse(m[0]);
    return arr.slice(0, num).map((x: any) => ({
      title: String(x.title || ""),
      link: String(x.link || ""),
      snippet: String(x.snippet || ""),
      displayLink: String(x.displayLink || (x.link ? new URL(x.link).hostname : "")),
    })).filter((x: WebResource) => x.link);
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { query, num = 8, provider = "auto" } = await req.json();
    if (!query) return new Response(JSON.stringify({ error: "query required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const order = provider === "auto"
      ? [trySerpApi, trySearchApi, tryGoogleCse, tryAiFallback]
      : provider === "serpapi" ? [trySerpApi]
      : provider === "searchapi" ? [trySearchApi]
      : provider === "google" ? [tryGoogleCse]
      : [trySerpApi, trySearchApi, tryGoogleCse, tryAiFallback];

    let results: WebResource[] | null = null;
    let used = "none";
    for (const fn of order) {
      const r = await fn(query, num);
      if (r && r.length > 0) { results = r; used = fn.name; break; }
    }
    return new Response(JSON.stringify({ results: results || [], provider: used }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
