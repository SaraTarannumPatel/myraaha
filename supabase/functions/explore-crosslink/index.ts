// One-shot admin job: cross-link Explore directory tables.
// Computes related_* / top_* arrays from name+description+keyword overlap and merges
// the results into each row WITHOUT overwriting existing values.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TABLES: Record<string, { name: string; kind: string }> = {
  career_paths: { name: "title", kind: "careers" },
  job_roles_directory: { name: "title", kind: "job_roles" },
  domain_directory: { name: "name", kind: "domains" },
  industry_directory: { name: "name", kind: "industries" },
  sector_directory: { name: "name", kind: "sectors" },
  skills_directory: { name: "name", kind: "skills" },
  subjects_directory: { name: "name", kind: "subjects" },
  online_courses_directory: { name: "name", kind: "courses" },
  countries_directory: { name: "name", kind: "countries" },
  universities_directory: { name: "name", kind: "universities" },
};
const KIND_TO_TABLE: Record<string, string> = Object.fromEntries(
  Object.entries(TABLES).map(([t, v]) => [v.kind, t])
);
const TOP_K: Record<string, number> = {
  careers: 12, job_roles: 12, domains: 8, industries: 6, sectors: 6,
  skills: 12, subjects: 8, courses: 10, countries: 8, universities: 8,
};
const STOP = new Set("a an the of and or in on at to for with by from as is are be this that other their our we you it & / - + services service industry sector domain career job role skill subject course country university tech management general professional studies system systems".split(" "));

function tokenize(s: string): Set<string> {
  if (!s) return new Set();
  const out = new Set<string>();
  for (const m of s.toLowerCase().matchAll(/[a-z][a-z0-9\-]{2,}/g)) {
    const t = m[0];
    if (!STOP.has(t) && t.length > 2) out.add(t);
  }
  return out;
}
function relCol(kind: string, table: string) {
  return table === "countries_directory" ? `top_${kind}` : `related_${kind}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  try {
    const { isAdminRequest, forbidden } = await import("../_shared/auth.ts");
    if (!(await isAdminRequest(req))) return forbidden("Admin only");
    // Load all rows
    const data: Record<string, any[]> = {};
    for (const t of Object.keys(TABLES)) {
      const { data: rows, error } = await supabase.from(t).select("*").limit(2000);
      if (error) throw error;
      data[t] = rows || [];
    }
    // Build meta
    const meta: Record<string, any[]> = {};
    for (const [t, cfg] of Object.entries(TABLES)) {
      meta[t] = data[t].map((r) => {
        const name = String(r[cfg.name] || "").trim();
        if (!name) return null;
        const parts: string[] = [name, r.description||"", r.domain||"", r.industry||"",
          r.sector||"", r.category||"", r.industry_name||"", r.country||"", r.continent||"", r.platform||""];
        for (const k of ["keywords","related_skills","skills_required","related_domains","related_careers","related_job_roles","related_subjects","related_universities","related_industries","related_sectors","related_courses","related_countries","tools_certifications","soft_skills","interests","countries_in_demand","top_industries","top_sectors","top_domains","top_careers","top_job_roles","top_skills","top_subjects","top_universities","top_courses","popular_courses","official_languages"]) {
          const v = r[k]; if (Array.isArray(v)) parts.push(...v.filter(Boolean).map(String));
        }
        return { id: r.id, name, name_lower: name.toLowerCase(),
          tokens: tokenize(parts.join(" | ")), name_tokens: tokenize(name), row: r };
      });
    }
    // token -> idx index per table
    const tokIdx: Record<string, Map<string, Set<number>>> = {};
    for (const [t, arr] of Object.entries(meta)) {
      const m = new Map<string, Set<number>>();
      arr.forEach((x, i) => { if (!x) return; for (const w of x.name_tokens) {
        if (!m.has(w)) m.set(w, new Set()); m.get(w)!.add(i);
      }});
      tokIdx[t] = m;
    }
    function score(a: any, b: any): number {
      let s = 0;
      const desc = String(a.row.description || "").toLowerCase();
      if (b.name_lower && desc.includes(b.name_lower)) s += 4;
      let nover = 0; for (const w of a.name_tokens) if (b.name_tokens.has(w)) nover++;
      s += nover * 3;
      let over = 0; for (const w of a.tokens) if (b.tokens.has(w)) over++;
      s += over;
      return s;
    }

    const summary: Record<string, number> = {};
    for (const [tSrc, srcRows] of Object.entries(meta)) {
      const updates: Record<string, Record<string, string[]>> = {}; // id -> {col: names}
      for (const m_src of srcRows) {
        if (!m_src) continue;
        for (const [kind, tTgt] of Object.entries(KIND_TO_TABLE)) {
          const same = tTgt === tSrc;
          if (same && tSrc === "countries_directory") continue;
          const cand = new Set<number>();
          for (const w of m_src.name_tokens) {
            const s = tokIdx[tTgt].get(w); if (s) for (const i of s) cand.add(i);
          }
          const scored: [number, string][] = [];
          for (const ci of cand) {
            const m_tgt = meta[tTgt][ci]; if (!m_tgt) continue;
            if (same && m_tgt.id === m_src.id) continue;
            const sc = score(m_src, m_tgt);
            if (sc >= (same ? 4 : 3)) scored.push([sc, m_tgt.name]);
          }
          scored.sort((a, b) => b[0] - a[0]);
          const top = scored.slice(0, TOP_K[kind]).map(([, n]) => n);
          if (top.length) {
            const col = relCol(kind, tSrc);
            (updates[m_src.id] ||= {})[col] = top;
          }
        }
      }
      // popular_courses for unis
      if (tSrc === "universities_directory") {
        for (const id of Object.keys(updates)) {
          if (updates[id].related_courses) updates[id].popular_courses = updates[id].related_courses.slice(0, 8);
        }
      }
      // Apply: for each row, merge with existing arrays then update
      let count = 0;
      const ids = Object.keys(updates);
      for (let i = 0; i < ids.length; i += 50) {
        const batch = ids.slice(i, i + 50);
        await Promise.all(batch.map(async (id) => {
          const existing = data[tSrc].find((r) => r.id === id) || {};
          const patch: Record<string, string[]> = {};
          for (const [col, vals] of Object.entries(updates[id])) {
            const cur = Array.isArray(existing[col]) ? existing[col] : [];
            const merged = Array.from(new Set([...cur, ...vals].filter((x) => x && String(x).trim().length)));
            patch[col] = merged;
          }
          const { error } = await supabase.from(tSrc).update(patch).eq("id", id);
          if (!error) count++;
        }));
      }
      summary[tSrc] = count;
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
