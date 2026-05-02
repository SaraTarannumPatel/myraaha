// Firecrawl-powered jobs ingestion. Searches the live web for India entry/mid-level
// roles and persists them into public.job_listings. Designed to be called by
// pg_cron daily and by an admin-triggered manual refresh. Additive — it does not
// touch the legacy job_opportunities table consumed by the existing UI.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

const DEFAULT_QUERIES = [
  "entry level software engineer jobs India 2026 site:linkedin.com/jobs OR site:naukri.com OR site:instahyre.com",
  "data analyst jobs India fresher remote 2026",
  "UI UX designer jobs Bangalore Mumbai Delhi 2026",
  "marketing internship India 2026 remote stipend",
  "product manager associate jobs India 2026",
  "customer success jobs India remote 2026",
];

function inferDomain(text: string): string {
  const t = text.toLowerCase();
  if (/(software|developer|engineer|backend|frontend|devops)/.test(t)) return "Technology";
  if (/(data|analytics|ml|ai|scientist)/.test(t)) return "Data Science";
  if (/(design|ui|ux|graphic)/.test(t)) return "Design";
  if (/(marketing|growth|seo|content)/.test(t)) return "Marketing";
  if (/(product manager|pm associate)/.test(t)) return "Product";
  if (/(customer|support|success)/.test(t)) return "Customer Success";
  return "General";
}

function inferSeniority(text: string): string {
  const t = text.toLowerCase();
  if (/(intern|trainee|fresher|entry)/.test(t)) return "Entry";
  if (/(senior|lead|principal|staff)/.test(t)) return "Senior";
  if (/(manager|director|head|vp|chief)/.test(t)) return "Leadership";
  return "Mid";
}

function extractKeywords(text: string): string[] {
  const tokens = (text || "").toLowerCase().match(/[a-z][a-z+.#-]{2,}/g) || [];
  const stop = new Set(["the","and","for","with","you","our","are","this","that","from","will","have","your","any","new","job","jobs","role","apply","work"]);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tokens) {
    if (stop.has(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
    if (out.length >= 12) break;
  }
  return out;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const body = await req.json().catch(() => ({}));
    const queries: string[] = (body.queries && Array.isArray(body.queries) && body.queries.length > 0)
      ? body.queries
      : DEFAULT_QUERIES;
    const limit: number = Math.max(1, Math.min(15, body.limit ?? 8));

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    let totalInserted = 0;
    const summaries: any[] = [];

    for (const query of queries) {
      const res = await fetch(`${FIRECRAWL_V2}/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, limit, country: "in", lang: "en" }),
      });

      if (!res.ok) {
        summaries.push({ query, error: res.status });
        continue;
      }
      const json = await res.json();
      const dataNode = json?.data ?? json;
      const arr: any[] = Array.isArray(dataNode)
        ? dataNode
        : (Array.isArray(dataNode?.web) ? dataNode.web
          : (Array.isArray(dataNode?.web?.results) ? dataNode.web.results
            : (Array.isArray(json?.results) ? json.results : [])));

      let inserted = 0;
      for (const r of arr) {
        const url: string = r.url || r.link || "";
        const title: string = (r.title || r.name || "").trim().slice(0, 200);
        const description: string = (r.description || r.snippet || r.summary || "").trim().slice(0, 1200);
        if (!url || !title) continue;

        const text = `${title} ${description}`;
        const row = {
          source: "firecrawl",
          source_url: url,
          title,
          description,
          industry: inferDomain(text),
          experience_level: inferSeniority(text),
          skills: extractKeywords(text),
          location: "India",
          remote_type: /remote/i.test(text) ? "remote" : (/hybrid/i.test(text) ? "hybrid" : "onsite"),
          employment_type: /intern/i.test(text) ? "internship" : (/contract/i.test(text) ? "contract" : "full_time"),
          scraped_at: new Date().toISOString(),
          is_active: true,
          metadata: { search_query: query },
        };

        const { error } = await supabase
          .from("job_listings")
          .upsert(row as any, { onConflict: "source_url" });
        if (!error) inserted++;
      }

      totalInserted += inserted;
      summaries.push({ query, fetched: arr.length, inserted });
    }

    return new Response(JSON.stringify({
      success: true,
      total_inserted: totalInserted,
      summaries,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("firecrawl-jobs-ingest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
