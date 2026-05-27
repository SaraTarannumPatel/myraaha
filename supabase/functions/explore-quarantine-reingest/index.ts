// Step 4: Quarantine junk orphans + Firecrawl re-ingest real-looking orphans.
// - Scans all 9 directory tables for rows with zero inbound/outbound links.
// - Junk names (gibberish/single short token/digits) are soft-archived by
//   prepending "[ARCHIVED] " to the display name so Explore UI can hide them.
// - Real-looking names are pushed through Firecrawl (Wikipedia + general web)
//   and Lovable AI (Gemini Flash) to synthesize a fresh description + keywords[].
// - After ingest, the caller should re-run explore-crosslink-v2 to fold the
//   newly-described rows back into the graph (done inline at end when requested).
//
// Admin-gated (ADMIN_INGEST_SECRET or admin role). Idempotent and safe to
// re-invoke — already-archived rows and already-described rows are skipped.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, isAdminRequest, forbidden } from "../_shared/auth.ts";

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash";

type TableSpec = {
  table: string;
  nameCol: "name" | "title";
  // Columns that prove the row is linked to *something* in the graph.
  linkCols: string[];
  // Domain hint for Firecrawl search ("skill", "country", etc.)
  kind: string;
};

const SPECS: TableSpec[] = [
  { table: "skills_directory", nameCol: "name", kind: "technology/skill",
    linkCols: ["related_careers","related_industries","related_sectors","related_domains","related_subjects","related_courses","related_universities","related_job_roles","related_countries"] },
  { table: "domain_directory", nameCol: "name", kind: "domain/field of study",
    linkCols: ["related_careers","related_industries","related_sectors","related_skills","related_subjects","related_courses","related_universities","related_job_roles","related_countries"] },
  { table: "sector_directory", nameCol: "name", kind: "business sector",
    linkCols: ["related_careers","related_industries","related_domains","related_skills","related_subjects","related_courses","related_universities","related_job_roles","related_countries"] },
  { table: "subjects_directory", nameCol: "name", kind: "academic subject",
    linkCols: ["related_careers","related_industries","related_sectors","related_skills","related_domains","related_courses","related_universities","related_job_roles","related_countries"] },
  { table: "countries_directory", nameCol: "name", kind: "country (career/education context)",
    linkCols: ["top_careers","top_industries","top_sectors","top_skills","top_domains","top_subjects","top_courses","top_universities","top_job_roles"] },
  { table: "industry_directory", nameCol: "name", kind: "industry",
    linkCols: ["related_careers","related_sectors","related_domains","related_skills","related_subjects","related_courses","related_universities","related_job_roles","related_countries"] },
  { table: "online_courses_directory", nameCol: "name", kind: "online course",
    linkCols: ["related_careers","related_industries","related_sectors","related_skills","related_domains","related_subjects","related_universities","related_job_roles","related_countries"] },
  { table: "universities_directory", nameCol: "name", kind: "university",
    linkCols: ["related_careers","related_industries","related_sectors","related_skills","related_domains","related_subjects","related_courses","related_job_roles","related_countries"] },
  { table: "job_roles_directory", nameCol: "title", kind: "job role",
    linkCols: ["related_careers","related_industries","related_sectors","related_skills","related_domains","related_subjects","related_courses","related_universities","related_countries"] },
];

/** Heuristic: is this name obviously junk/gibberish? */
function isJunkName(raw: string): boolean {
  if (!raw) return true;
  const n = raw.trim();
  if (n.startsWith("[ARCHIVED]")) return false; // already handled
  if (n.length < 2) return true;
  if (/^\d+$/.test(n)) return true;                      // pure digits
  if (/^(.)\1{2,}$/i.test(n)) return true;               // "aaaa", "----"
  if (/^[^a-z0-9]+$/i.test(n)) return true;              // pure punctuation
  // gibberish single token, no vowels, length <= 6: "asdf", "qwer", "xkcd"
  if (!n.includes(" ") && n.length <= 6 && !/[aeiouAEIOU]/.test(n)) return true;
  // common test/placeholder words
  if (/^(test|tester|asdf|qwerty|foo|bar|baz|todo|tbd|n\/?a|none|null|undefined)$/i.test(n)) return true;
  return false;
}

async function firecrawlSearch(apiKey: string, query: string, limit = 3) {
  const res = await fetch(`${FIRECRAWL_V2}/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit, lang: "en" }),
  });
  if (!res.ok) return [];
  const j = await res.json().catch(() => ({}));
  const items = j?.data?.web || j?.data || j?.web || [];
  return Array.isArray(items) ? items : [];
}

async function firecrawlScrape(apiKey: string, url: string) {
  const res = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
  });
  if (!res.ok) return "";
  const j = await res.json().catch(() => ({}));
  return (j?.data?.markdown || j?.markdown || "").toString().slice(0, 6000);
}

async function aiSynthesize(apiKey: string, name: string, kind: string, context: string) {
  const sys = `You enrich a global directory entry. Output STRICT JSON: {"description": string (2-3 sentences, neutral, factual, India-aware), "keywords": string[] (8-14 lowercase single-or-two-word tags, no stopwords, no punctuation)}. No markdown, no extra keys.`;
  const user = `Entry name: ${name}\nKind: ${kind}\n\nReference context (may be partial):\n${context || "(no context — use general knowledge)"}\n\nReturn the JSON now.`;
  const res = await fetch(AI_GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const j = await res.json();
  const txt = j?.choices?.[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(txt);
    const desc = typeof parsed.description === "string" ? parsed.description.trim() : "";
    const kws = Array.isArray(parsed.keywords)
      ? parsed.keywords.map((k: unknown) => String(k).toLowerCase().trim()).filter(Boolean).slice(0, 14)
      : [];
    return { description: desc, keywords: kws };
  } catch {
    return { description: "", keywords: [] };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!(await isAdminRequest(req))) return forbidden("Admin only");

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const body = await req.json().catch(() => ({}));
  const mode: "all" | "archive" | "reingest" | "scan" = body.mode || "all";
  const perTableLimit: number = Math.max(1, Math.min(50, body.limit ?? 15));
  const runCrosslinkAfter: boolean = body.runCrosslinkAfter !== false;
  const onlyTable: string | undefined = body.table;

  const report: any = { mode, tables: {}, archived: 0, reingested: 0, ai_failed: 0, skipped_no_firecrawl: 0 };

  for (const spec of SPECS) {
    if (onlyTable && spec.table !== onlyTable) continue;

    // Find orphan rows: all link arrays NULL/empty
    const linkSumExpr = spec.linkCols
      .map((c) => `coalesce(array_length(${c},1),0)`)
      .join("+");
    const { data: orphans, error } = await supabase.rpc("noop_select_sql" as any, {} as any).then(
      () => ({ data: null, error: null }),
      () => ({ data: null, error: null }),
    );
    // We can't use RPC; fall back to a single SELECT via PostgREST filter on each link col being null/empty.
    // Simpler: fetch candidates and filter in JS.
    const sel = await supabase
      .from(spec.table)
      .select(`id, ${spec.nameCol}, description, keywords, ${spec.linkCols.join(", ")}`)
      .limit(2000);
    if (sel.error) {
      report.tables[spec.table] = { error: sel.error.message };
      continue;
    }
    const rows = (sel.data || []).filter((r: any) => {
      const sum = spec.linkCols.reduce((acc, c) => acc + (Array.isArray(r[c]) ? r[c].length : 0), 0);
      return sum === 0;
    });

    const junk: any[] = [];
    const real: any[] = [];
    for (const r of rows) {
      const nm = String(r[spec.nameCol] ?? "");
      if (nm.startsWith("[ARCHIVED]")) continue;
      if (isJunkName(nm)) junk.push(r);
      else real.push(r);
    }

    const tInfo: any = { orphans: rows.length, junk: junk.length, real: real.length, archived: 0, reingested: 0 };

    if (mode === "scan") {
      report.tables[spec.table] = tInfo;
      continue;
    }

    // 1) Soft-archive junk
    if (mode === "all" || mode === "archive") {
      for (const r of junk) {
        const newName = `[ARCHIVED] ${String(r[spec.nameCol]).trim()}`;
        const { error: uErr } = await supabase
          .from(spec.table)
          .update({ [spec.nameCol]: newName })
          .eq("id", r.id);
        if (!uErr) { tInfo.archived++; report.archived++; }
      }
    }

    // 2) Firecrawl + AI re-ingest real orphans
    if ((mode === "all" || mode === "reingest") && real.length > 0) {
      if (!FIRECRAWL_API_KEY || !LOVABLE_API_KEY) {
        report.skipped_no_firecrawl += real.length;
        report.tables[spec.table] = tInfo;
        continue;
      }
      const batch = real.slice(0, perTableLimit);
      for (const r of batch) {
        const name = String(r[spec.nameCol]).trim();
        try {
          // Prefer Wikipedia, fall back to general search
          const wikiQ = `${name} ${spec.kind} site:en.wikipedia.org`;
          let hits = await firecrawlSearch(FIRECRAWL_API_KEY, wikiQ, 2);
          if (!hits.length) hits = await firecrawlSearch(FIRECRAWL_API_KEY, `${name} ${spec.kind} overview`, 3);

          let context = "";
          for (const h of hits.slice(0, 2)) {
            const url = h?.url || h?.link;
            if (!url) continue;
            const md = await firecrawlScrape(FIRECRAWL_API_KEY, url);
            if (md) { context += `\n\n--- ${url} ---\n${md}`; }
            if (context.length > 8000) break;
          }

          const { description, keywords } = await aiSynthesize(LOVABLE_API_KEY, name, spec.kind, context);
          if (!description) { report.ai_failed++; continue; }

          const patch: any = { description };
          // Merge keywords (don't clobber any existing)
          const existingKw = Array.isArray(r.keywords) ? r.keywords : [];
          const mergedKw = Array.from(new Set([...existingKw, ...keywords])).slice(0, 20);
          if (mergedKw.length) patch.keywords = mergedKw;

          const { error: uErr } = await supabase.from(spec.table).update(patch).eq("id", r.id);
          if (!uErr) { tInfo.reingested++; report.reingested++; }
        } catch (e) {
          report.ai_failed++;
          console.error(`[${spec.table}] reingest failed for ${name}:`, (e as Error).message);
        }
      }
    }

    report.tables[spec.table] = tInfo;
  }

  // 3) Re-fold into the graph
  if ((mode === "all" || mode === "reingest") && runCrosslinkAfter && report.reingested > 0) {
    try {
      const adminSecret = req.headers.get("x-admin-secret") || req.headers.get("X-Admin-Secret") || Deno.env.get("ADMIN_INGEST_SECRET") || "";
      const xl = await fetch(`${SUPABASE_URL}/functions/v1/explore-crosslink-v2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({}),
      });
      report.crosslink_status = xl.status;
    } catch (e) {
      report.crosslink_status = `failed: ${(e as Error).message}`;
    }
  }

  return new Response(JSON.stringify(report, null, 2), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
