// One-shot admin job: fill NULL scalar columns and empty array columns across the
// 10 Explore directory tables by inheriting values from already-populated RELATED
// rows (using the related_* / top_* arrays we previously cross-linked).
//
// Non-destructive: only writes when the target column is NULL or an empty array.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Row = Record<string, any>;

const TABLES = [
  "career_paths",
  "job_roles_directory",
  "industry_directory",
  "sector_directory",
  "domain_directory",
  "skills_directory",
  "subjects_directory",
  "online_courses_directory",
  "universities_directory",
  "countries_directory",
] as const;
type T = typeof TABLES[number];

const NAME_FIELD: Record<T, "name" | "title"> = {
  career_paths: "title",
  job_roles_directory: "title",
  industry_directory: "name",
  sector_directory: "name",
  domain_directory: "name",
  skills_directory: "name",
  subjects_directory: "name",
  online_courses_directory: "name",
  universities_directory: "name",
  countries_directory: "name",
};

// Each table -> which related-table column points to which other table.
// Used to walk relationships when inheriting values.
const REL_MAP: Record<T, Partial<Record<T, string[]>>> = {
  career_paths: {
    job_roles_directory: ["related_job_roles"],
    industry_directory: ["related_industries"],
    sector_directory: ["related_sectors"],
    domain_directory: ["related_domains"],
    skills_directory: ["related_skills"],
    subjects_directory: ["related_subjects"],
    online_courses_directory: ["related_courses"],
    universities_directory: ["related_universities"],
    countries_directory: ["related_countries", "countries_in_demand"],
    career_paths: ["related_careers"],
  },
  job_roles_directory: {
    career_paths: ["related_careers"],
    industry_directory: ["related_industries"],
    sector_directory: ["related_sectors"],
    domain_directory: ["related_domains"],
    skills_directory: ["related_skills", "skills_required"],
    subjects_directory: ["related_subjects"],
    online_courses_directory: ["related_courses"],
    universities_directory: ["related_universities"],
    countries_directory: ["related_countries", "countries_in_demand"],
  },
  industry_directory: {
    career_paths: ["related_careers"],
    job_roles_directory: ["related_job_roles"],
    sector_directory: ["related_sectors"],
    domain_directory: ["related_domains"],
    skills_directory: ["related_skills"],
    subjects_directory: ["related_subjects"],
    online_courses_directory: ["related_courses"],
    universities_directory: ["related_universities"],
    countries_directory: ["related_countries", "countries_in_demand"],
  },
  sector_directory: {
    career_paths: ["related_careers"],
    job_roles_directory: ["related_job_roles"],
    industry_directory: ["related_industries"],
    domain_directory: ["related_domains"],
    skills_directory: ["related_skills"],
    subjects_directory: ["related_subjects"],
    online_courses_directory: ["related_courses"],
    universities_directory: ["related_universities"],
    countries_directory: ["related_countries", "countries_in_demand"],
  },
  domain_directory: {
    career_paths: ["related_careers"],
    job_roles_directory: ["related_job_roles"],
    industry_directory: ["related_industries"],
    sector_directory: ["related_sectors"],
    skills_directory: ["related_skills"],
    subjects_directory: ["related_subjects"],
    online_courses_directory: ["related_courses"],
    universities_directory: ["related_universities"],
    countries_directory: ["related_countries", "countries_in_demand"],
  },
  skills_directory: {
    career_paths: ["related_careers"],
    job_roles_directory: ["related_job_roles"],
    industry_directory: ["related_industries"],
    sector_directory: ["related_sectors"],
    domain_directory: ["related_domains"],
    subjects_directory: ["related_subjects"],
    online_courses_directory: ["related_courses"],
    universities_directory: ["related_universities"],
    countries_directory: ["related_countries", "countries_in_demand"],
  },
  subjects_directory: {
    career_paths: ["related_careers"],
    job_roles_directory: ["related_job_roles"],
    industry_directory: ["related_industries"],
    sector_directory: ["related_sectors"],
    domain_directory: ["related_domains"],
    skills_directory: ["related_skills"],
    online_courses_directory: ["related_courses"],
    universities_directory: ["related_universities"],
    countries_directory: ["related_countries", "countries_in_demand"],
  },
  online_courses_directory: {
    career_paths: ["related_careers"],
    job_roles_directory: ["related_job_roles"],
    industry_directory: ["related_industries"],
    sector_directory: ["related_sectors"],
    domain_directory: ["related_domains"],
    skills_directory: ["related_skills"],
    subjects_directory: ["related_subjects"],
    universities_directory: ["related_universities"],
    countries_directory: ["related_countries", "countries_in_demand"],
  },
  universities_directory: {
    career_paths: ["related_careers"],
    job_roles_directory: ["related_job_roles"],
    industry_directory: ["related_industries"],
    sector_directory: ["related_sectors"],
    domain_directory: ["related_domains"],
    skills_directory: ["related_skills"],
    subjects_directory: ["related_subjects"],
    online_courses_directory: ["related_courses", "popular_courses"],
    countries_directory: ["related_countries"],
  },
  countries_directory: {
    career_paths: ["top_careers"],
    job_roles_directory: ["top_job_roles"],
    industry_directory: ["top_industries"],
    sector_directory: ["top_sectors"],
    domain_directory: ["top_domains"],
    skills_directory: ["top_skills"],
    subjects_directory: ["top_subjects"],
    online_courses_directory: ["top_courses"],
    universities_directory: ["top_universities"],
  },
};

// Scalar columns to fill (when NULL) on each table — taken as MODE of related rows.
const SCALAR_COLS: Record<T, string[]> = {
  career_paths: ["demand_level", "avg_salary_usd", "growth_trajectory", "industry", "sector"],
  job_roles_directory: ["demand_level", "avg_salary_usd", "growth_trajectory", "industry", "sector"],
  industry_directory: ["demand_level", "avg_salary_usd", "growth_trajectory"],
  sector_directory: ["demand_level", "avg_salary_usd", "growth_trajectory", "industry_name"],
  domain_directory: ["demand_level", "avg_salary_usd", "growth_trajectory", "industry", "sector"],
  skills_directory: ["demand_level", "avg_salary_usd", "growth_trajectory", "domain", "category"],
  subjects_directory: ["demand_level", "avg_salary_usd", "growth_trajectory", "domain"],
  online_courses_directory: ["demand_level", "avg_salary_usd", "growth_trajectory", "domain"],
  universities_directory: ["demand_level", "avg_salary_usd", "growth_trajectory"],
  countries_directory: ["demand_level", "avg_salary_usd", "growth_trajectory"],
};

// Array columns to fill (when empty) by union of related rows' same-named array.
const ARRAY_COLS: Record<T, string[]> = {
  career_paths: ["soft_skills", "interests", "countries_in_demand"],
  job_roles_directory: ["soft_skills", "interests", "countries_in_demand"],
  industry_directory: ["soft_skills", "interests", "countries_in_demand"],
  sector_directory: ["soft_skills", "interests", "countries_in_demand"],
  domain_directory: ["soft_skills", "interests", "countries_in_demand"],
  skills_directory: ["soft_skills", "interests", "countries_in_demand"],
  subjects_directory: ["soft_skills", "interests", "countries_in_demand"],
  online_courses_directory: ["soft_skills", "interests", "countries_in_demand"],
  universities_directory: ["soft_skills", "interests"],
  countries_directory: ["soft_skills_in_demand", "interests"],
};

// When inheriting the "soft_skills" array on country, the source rows hold "soft_skills".
const SRC_ARRAY_FOR_TARGET = (tgtTable: T, targetCol: string): string => {
  if (tgtTable === "countries_directory" && targetCol === "soft_skills_in_demand") return "soft_skills";
  return targetCol;
};

function pickMode(values: string[]): string | null {
  const m = new Map<string, number>();
  for (const v of values) {
    if (v == null) continue;
    const t = String(v).trim();
    if (!t) continue;
    m.set(t, (m.get(t) || 0) + 1);
  }
  if (!m.size) return null;
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function isEmpty(v: any): boolean {
  if (v == null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "string") return v.trim().length === 0;
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // 1) Load all rows for all tables
    const data: Record<T, Row[]> = {} as any;
    for (const t of TABLES) {
      const { data: rows, error } = await supabase.from(t).select("*").limit(5000);
      if (error) throw new Error(`${t}: ${error.message}`);
      data[t] = rows || [];
    }

    // Build name -> row index for each table (lowercased)
    const idx: Record<T, Map<string, Row>> = {} as any;
    for (const t of TABLES) {
      const m = new Map<string, Row>();
      for (const r of data[t]) {
        const n = String(r[NAME_FIELD[t]] || "").trim().toLowerCase();
        if (n) m.set(n, r);
      }
      idx[t] = m;
    }

    const summary: Record<string, { rows_updated: number; fields_filled: number }> = {};

    for (const t of TABLES) {
      let rowsUpdated = 0;
      let fieldsFilled = 0;
      const rels = REL_MAP[t];

      // Process in batches to limit concurrency
      for (let i = 0; i < data[t].length; i += 25) {
        const batch = data[t].slice(i, i + 25);
        await Promise.all(batch.map(async (row) => {
          // Collect related rows from each related table
          const relatedByTable: Record<string, Row[]> = {};
          for (const [otherT, cols] of Object.entries(rels)) {
            const collected: Row[] = [];
            for (const col of cols!) {
              const arr = row[col];
              if (!Array.isArray(arr)) continue;
              for (const nm of arr) {
                const key = String(nm || "").trim().toLowerCase();
                if (!key) continue;
                const found = idx[otherT as T].get(key);
                if (found) collected.push(found);
              }
            }
            if (collected.length) relatedByTable[otherT] = collected;
          }
          const allRelated = Object.values(relatedByTable).flat();
          if (!allRelated.length) return;

          const patch: Record<string, any> = {};

          // Fill scalar columns
          for (const col of SCALAR_COLS[t]) {
            if (!isEmpty(row[col])) continue;
            const vals: string[] = [];
            for (const r of allRelated) {
              const v = r[col];
              if (v != null && String(v).trim()) vals.push(String(v));
            }
            // For 'industry' on roles/careers/etc, sometimes related rows are themselves
            // industry rows — pull their NAME.
            if (!vals.length && (col === "industry" || col === "industry_name")) {
              for (const r of relatedByTable["industry_directory"] || []) {
                if (r.name) vals.push(String(r.name));
              }
            }
            if (!vals.length && col === "sector") {
              for (const r of relatedByTable["sector_directory"] || []) {
                if (r.name) vals.push(String(r.name));
              }
            }
            if (!vals.length && col === "domain") {
              for (const r of relatedByTable["domain_directory"] || []) {
                if (r.name) vals.push(String(r.name));
              }
            }
            const mode = pickMode(vals);
            if (mode) {
              patch[col] = mode;
              fieldsFilled++;
            }
          }

          // Fill array columns by union
          for (const col of ARRAY_COLS[t]) {
            const cur = row[col];
            if (Array.isArray(cur) && cur.length > 0) continue;
            const srcCol = SRC_ARRAY_FOR_TARGET(t, col);
            const set = new Set<string>();
            for (const r of allRelated) {
              const v = r[srcCol];
              if (Array.isArray(v)) for (const x of v) {
                const s = String(x || "").trim();
                if (s) set.add(s);
              }
            }
            // For countries_in_demand, also harvest country names from related country rows
            if (col === "countries_in_demand") {
              for (const cr of relatedByTable["countries_directory"] || []) {
                if (cr.name) set.add(String(cr.name));
              }
            }
            if (set.size) {
              patch[col] = [...set].slice(0, 24);
              fieldsFilled++;
            }
          }

          if (Object.keys(patch).length === 0) return;
          const { error } = await supabase.from(t).update(patch).eq("id", row.id);
          if (!error) {
            rowsUpdated++;
            // Update local cache so later tables can inherit from these new values
            Object.assign(row, patch);
          }
        }));
      }
      summary[t] = { rows_updated: rowsUpdated, fields_filled: fieldsFilled };
    }

    return new Response(JSON.stringify({ ok: true, summary }), {
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...cors, "content-type": "application/json" },
    });
  }
});
