// Pass 1: Loose-match crosslinker — rescues "orphan" rows whose names didn't
// token-overlap with anything in the original explore-crosslink pass.
// Strategy: normalize names (lowercase, strip punctuation, expand synonyms,
// drop stopwords) + score candidates via token-Jaccard ∪ trigram-Jaccard.
// Match against name + description + keywords of every sibling row.
// Non-destructive: appends to existing related_* / top_* arrays only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TABLES = [
  "career_paths","job_roles_directory","industry_directory","sector_directory",
  "domain_directory","skills_directory","subjects_directory",
  "online_courses_directory","universities_directory","countries_directory",
] as const;
type T = typeof TABLES[number];

const NAME: Record<T, "name"|"title"> = {
  career_paths: "title", job_roles_directory: "title",
  industry_directory: "name", sector_directory: "name", domain_directory: "name",
  skills_directory: "name", subjects_directory: "name",
  online_courses_directory: "name", universities_directory: "name",
  countries_directory: "name",
};

const TOP_K: Record<T, number> = {
  career_paths: 10, job_roles_directory: 10, industry_directory: 6,
  sector_directory: 6, domain_directory: 8, skills_directory: 12,
  subjects_directory: 8, online_courses_directory: 8,
  universities_directory: 6, countries_directory: 6,
};

function colFor(self: T, otherKind: T): string {
  if (self === "countries_directory") {
    const m: Record<T,string> = {
      career_paths:"top_careers", job_roles_directory:"top_job_roles",
      industry_directory:"top_industries", sector_directory:"top_sectors",
      domain_directory:"top_domains", skills_directory:"top_skills",
      subjects_directory:"top_subjects", online_courses_directory:"top_courses",
      universities_directory:"top_universities", countries_directory:"",
    };
    return m[otherKind];
  }
  const m: Record<T,string> = {
    career_paths:"related_careers", job_roles_directory:"related_job_roles",
    industry_directory:"related_industries", sector_directory:"related_sectors",
    domain_directory:"related_domains", skills_directory:"related_skills",
    subjects_directory:"related_subjects", online_courses_directory:"related_courses",
    universities_directory:"related_universities", countries_directory:"related_countries",
  };
  return m[otherKind];
}

const STOP = new Set(("a an the of and or in on at to for with by from as is are be this that " +
  "other their our we you it amp services service industry sector domain career job role " +
  "skill subject course country university tech management general professional studies " +
  "system systems dept department govt government ltd inc llc co corp pvt private public " +
  "national international institute college school university academy program programme " +
  "studies hons honours bachelor master degree level junior senior lead principal staff " +
  "associate assistant").split(/\s+/));

const SYN: Record<string,string[]> = {
  ai: ["artificial","intelligence","ml","machine","learning","gen","generative"],
  ml: ["ai","machine","learning"],
  cs: ["computer","science","computing","cse","it"],
  it: ["information","technology","cs","computer"],
  ds: ["data","science","analytics"],
  hr: ["human","resources","people"],
  ux: ["user","experience","design","ui"],
  ui: ["ux","user","interface","design"],
  qa: ["quality","testing","assurance"],
  iot: ["internet","things","embedded"],
  ar: ["augmented","reality","xr"],
  vr: ["virtual","reality","xr"],
  fintech: ["finance","financial","banking","payments"],
  edtech: ["education","learning","schools"],
  agritech: ["agriculture","farming","agri","agribusiness"],
  agribusiness: ["agriculture","agri","farming","agritech"],
  biotech: ["biology","biotechnology","life","sciences","pharma"],
  pharma: ["pharmaceutical","medicine","drugs","biotech","healthcare"],
  healthcare: ["medical","medicine","health","hospital","clinical","pharma"],
  cybersec: ["cyber","security","infosec","cybersecurity"],
  cybersecurity: ["cyber","security","infosec"],
  devops: ["operations","cloud","infrastructure","sre","platform"],
  cloud: ["aws","azure","gcp","devops","infrastructure"],
  blockchain: ["crypto","web3","defi","ledger"],
  ecommerce: ["e","commerce","retail","online","shopping","d2c"],
  saas: ["software","cloud","subscription","b2b"],
  mgmt: ["management"],
  ops: ["operations"],
  eng: ["engineer","engineering"],
  dev: ["developer","development"],
  sci: ["science","scientist"],
  econ: ["economics","economy","economist"],
  med: ["medical","medicine","health"],
  bio: ["biology","biological","life"],
  chem: ["chemistry","chemical"],
  phy: ["physics","physical"],
  math: ["mathematics","maths"],
  legal: ["law","legal","attorney","lawyer"],
  marcomm: ["marketing","communications","comms"],
  digital: ["online","internet","web"],
  diagnostic: ["diagnostics","testing","medical","pathology","lab"],
  cement: ["concrete","construction","building","infrastructure","materials"],
  concrete: ["cement","construction","building"],
  cosmetics: ["beauty","personal","care","fmcg","skincare"],
  dairy: ["milk","food","fmcg","agribusiness"],
  broadcasting: ["media","tv","radio","entertainment","journalism"],
  asset: ["finance","investment","wealth","funds"],
};

function expandSynonyms(toks: Set<string>): Set<string> {
  const out = new Set(toks);
  for (const t of toks) {
    const s = SYN[t]; if (s) for (const x of s) out.add(x);
  }
  return out;
}

function tokenize(s: string): Set<string> {
  if (!s) return new Set();
  const out = new Set<string>();
  // split camel/Pascal too
  const norm = s.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
  for (const t of norm.split(/\s+/)) {
    if (!t || t.length < 3) continue;
    if (STOP.has(t)) continue;
    if (/^\d+$/.test(t)) continue;
    out.add(t);
  }
  return out;
}

function trigrams(s: string): Set<string> {
  const out = new Set<string>();
  const n = ` ${s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()} `;
  for (let i = 0; i + 3 <= n.length; i++) out.add(n.slice(i, i+3));
  return out;
}

function jaccard<T2>(a: Set<T2>, b: Set<T2>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

type Meta = {
  id: string; name: string;
  toks: Set<string>; tris: Set<string>;
  textToks: Set<string>; // expanded with description+keywords+synonyms
};

function buildMeta(rows: any[], nameField: string): Meta[] {
  return rows.map((r) => {
    const name = String(r[nameField] ?? "").trim();
    if (!name) return null;
    const nameToks = expandSynonyms(tokenize(name));
    const text = [
      name, r.description || "", r.summary || "",
      ...(Array.isArray(r.keywords) ? r.keywords : []),
      r.domain || "", r.industry || "", r.sector || "",
      r.category || "", r.industry_name || "",
    ].join(" | ");
    const textToks = expandSynonyms(tokenize(text));
    return {
      id: r.id, name,
      toks: nameToks,
      tris: trigrams(name),
      textToks,
    };
  }).filter(Boolean) as Meta[];
}

const SCORE_MIN = 0.18; // keep loose to rescue orphans
const NAME_TRI_MIN = 0.35; // strong name fuzzy match

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  try {
    const { isAdminRequest, forbidden } = await import("../_shared/auth.ts");
    if (!(await isAdminRequest(req))) return forbidden("Admin only");
    const url = new URL(req.url);
    const onlyOrphans = url.searchParams.get("all") !== "1";

    const data: Record<T, any[]> = {} as any;
    const meta: Record<T, Meta[]> = {} as any;
    for (const t of TABLES) {
      const { data: rows, error } = await supabase.from(t).select("*").limit(5000);
      if (error) throw new Error(`${t}: ${error.message}`);
      data[t] = rows || [];
      meta[t] = buildMeta(rows || [], NAME[t]);
    }

    const summary: Record<string, { processed: number; updated: number; cells: number }> = {};

    for (const t of TABLES) {
      let processed = 0, updated = 0, cells = 0;

      // Identify orphan rows in this table
      const rows = data[t];
      const orphanIds = new Set<string>();
      for (const r of rows) {
        const arrCols = ["related_skills","related_careers","related_job_roles",
          "related_industries","related_sectors","related_domains",
          "related_subjects","related_courses","related_universities",
          "related_countries","top_careers","top_job_roles","top_industries",
          "top_sectors","top_domains","top_skills","top_subjects",
          "top_courses","top_universities","popular_courses"];
        let total = 0;
        for (const c of arrCols) if (Array.isArray(r[c])) total += r[c].length;
        if (total === 0) orphanIds.add(r.id);
      }
      const targetIds = onlyOrphans ? orphanIds : new Set(rows.map((r) => r.id));

      const metaById = new Map<string, Meta>(meta[t].map((m) => [m.id, m]));

      for (const rid of targetIds) {
        const m = metaById.get(rid);
        if (!m) continue;
        processed++;
        const row = rows.find((r) => r.id === rid)!;
        const patch: Record<string,string[]> = {};

        for (const otherT of TABLES) {
          if (otherT === t) continue;
          const col = colFor(t, otherT);
          if (!col) continue;
          // score candidates
          const scored: { name: string; score: number }[] = [];
          for (const om of meta[otherT]) {
            const nameTri = jaccard(m.tris, om.tris);
            const textTok = jaccard(m.textToks, om.textToks);
            const nameTok = jaccard(m.toks, om.toks);
            const score = Math.max(nameTri, nameTok) * 0.6 + textTok * 0.4;
            // Also accept strong name fuzzy alone
            if (score >= SCORE_MIN || nameTri >= NAME_TRI_MIN) {
              scored.push({ name: om.name, score });
            }
          }
          scored.sort((a,b) => b.score - a.score);
          const picks = scored.slice(0, TOP_K[otherT]).map((x) => x.name);
          if (!picks.length) continue;
          const cur: string[] = Array.isArray(row[col]) ? row[col] : [];
          const seen = new Set(cur.map((x) => String(x).toLowerCase()));
          const merged = [...cur];
          for (const p of picks) {
            if (!seen.has(p.toLowerCase())) { merged.push(p); seen.add(p.toLowerCase()); cells++; }
          }
          if (merged.length !== cur.length) patch[col] = merged.slice(0, 30);
        }

        if (Object.keys(patch).length) {
          const { error } = await supabase.from(t).update(patch).eq("id", rid);
          if (!error) { updated++; Object.assign(row, patch); }
        }
      }
      summary[t] = { processed, updated, cells };
    }

    return new Response(JSON.stringify({ ok: true, summary }), {
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { ...cors, "content-type": "application/json" },
    });
  }
});
