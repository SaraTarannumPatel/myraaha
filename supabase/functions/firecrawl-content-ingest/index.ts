// Firecrawl-powered learning resources ingestion. Searches India-relevant free
// courses, micro-tutorials, and explainers and persists them into
// public.content_library_items for the Content Library module. Additive — does
// not modify existing learning_tracks/learning_capsules.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

const DEFAULT_QUERIES: Array<{ q: string; topic: string; type: string }> = [
  { q: "free python course beginner India site:coursera.org OR site:nptel.ac.in OR site:freecodecamp.org", topic: "Python", type: "course" },
  { q: "free SQL tutorial beginner India 2026 site:youtube.com OR site:freecodecamp.org", topic: "SQL", type: "tutorial" },
  { q: "free UX design fundamentals course India site:coursera.org OR site:figma.com", topic: "UX Design", type: "course" },
  { q: "free digital marketing course India 2026 site:google.com OR site:hubspot.com", topic: "Digital Marketing", type: "course" },
  { q: "free communication skills course for students India 2026", topic: "Communication", type: "course" },
  { q: "career guidance for students India 2026 explainer article", topic: "Career", type: "article" },
  { q: "entrepreneurship basics for beginners India 2026 free course", topic: "Entrepreneurship", type: "course" },
  { q: "AI tools for productivity beginner tutorial India 2026", topic: "AI Tools", type: "tutorial" },
];

function inferProvider(url: string): string {
  if (!url) return "Web";
  if (url.includes("coursera")) return "Coursera";
  if (url.includes("nptel")) return "NPTEL";
  if (url.includes("freecodecamp")) return "freeCodeCamp";
  if (url.includes("youtube")) return "YouTube";
  if (url.includes("udemy")) return "Udemy";
  if (url.includes("hubspot")) return "HubSpot Academy";
  if (url.includes("google")) return "Google";
  if (url.includes("figma")) return "Figma";
  return new URL(url).hostname.replace("www.", "");
}

function extractTags(text: string): string[] {
  const tokens = (text || "").toLowerCase().match(/[a-z][a-z+.#-]{2,}/g) || [];
  const stop = new Set(["the","and","for","with","you","our","are","this","that","from","will","have","your","any","new","free","course","tutorial","beginner","online","best","top"]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tokens) {
    if (stop.has(t) || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= 10) break;
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { isAdminRequest, forbidden } = await import("../_shared/auth.ts");
    if (!(await isAdminRequest(req))) return forbidden("Admin only");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const body = await req.json().catch(() => ({}));
    const queries = (Array.isArray(body.queries) && body.queries.length > 0) ? body.queries : DEFAULT_QUERIES;
    const limit = Math.max(1, Math.min(10, body.limit ?? 5));

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    let totalInserted = 0;
    const summaries: any[] = [];

    for (const q of queries) {
      const res = await fetch(`${FIRECRAWL_V2}/search`, {
        method: "POST",
        headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.q, limit, country: "in", lang: "en" }),
      });
      if (!res.ok) {
        summaries.push({ query: q.q, error: res.status });
        continue;
      }
      const json = await res.json();
      const dataNode = json?.data ?? json;
      const arr: any[] = Array.isArray(dataNode) ? dataNode
        : (Array.isArray(dataNode?.web) ? dataNode.web
          : (Array.isArray(dataNode?.web?.results) ? dataNode.web.results : []));

      let inserted = 0;
      for (const r of arr) {
        const url: string = r.url || r.link || "";
        const title: string = (r.title || r.name || "").trim().slice(0, 240);
        const description: string = (r.description || r.snippet || r.summary || "").trim().slice(0, 1500);
        if (!url || !title) continue;

        const row = {
          title,
          description,
          content_type: q.type,
          source_url: url,
          source_name: inferProvider(url),
          difficulty: "beginner",
          tags: extractTags(`${title} ${description}`),
          topics: [q.topic],
          is_free: true,
          language: "en",
          metadata: { search_query: q.q },
        };
        const { error } = await supabase
          .from("content_library_items")
          .upsert(row as any, { onConflict: "source_url" });
        if (!error) inserted++;
      }

      totalInserted += inserted;
      summaries.push({ query: q.q, fetched: arr.length, inserted });
    }

    await supabase.from("content_library_ingest_runs").insert({
      run_type: "firecrawl",
      items_inserted: totalInserted,
      status: "success",
      notes: JSON.stringify(summaries).slice(0, 4000),
    });

    return new Response(JSON.stringify({
      success: true,
      total_inserted: totalInserted,
      summaries,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("firecrawl-content-ingest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
