// One-shot admin job: make all cross-table relationships SYMMETRIC.
// For every edge A.related_B contains "b_name", append A.name to B.related_A.
// Non-destructive merge into existing arrays. Country tables use top_* on the
// country side and related_countries on the other side.
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

// For source table T, list [(otherTable, columnOnT, inverseColumnOnOther)]
// columnOnT/inverseColumnOnOther = the array column that stores other-side names.
function relCol(self: T, other: T): string {
  if (self === "countries_directory") {
    // country uses top_*
    const map: Record<T, string> = {
      career_paths: "top_careers",
      job_roles_directory: "top_job_roles",
      industry_directory: "top_industries",
      sector_directory: "top_sectors",
      domain_directory: "top_domains",
      skills_directory: "top_skills",
      subjects_directory: "top_subjects",
      online_courses_directory: "top_courses",
      universities_directory: "top_universities",
      countries_directory: "",
    };
    return map[other];
  }
  const map: Record<T, string> = {
    career_paths: "related_careers",
    job_roles_directory: "related_job_roles",
    industry_directory: "related_industries",
    sector_directory: "related_sectors",
    domain_directory: "related_domains",
    skills_directory: "related_skills",
    subjects_directory: "related_subjects",
    online_courses_directory: "related_courses",
    universities_directory: "related_universities",
    countries_directory: "related_countries",
  };
  return map[other];
}

const MAX_ARR = 30;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  try {
    // Load all rows
    const data: Record<T, Row[]> = {} as any;
    for (const t of TABLES) {
      const { data: rows, error } = await supabase.from(t).select("*").limit(5000);
      if (error) throw new Error(`${t}: ${error.message}`);
      data[t] = rows || [];
    }
    // name(lower) -> row index per table
    const idx: Record<T, Map<string, Row>> = {} as any;
    for (const t of TABLES) {
      const m = new Map<string, Row>();
      for (const r of data[t]) {
        const n = String(r[NAME_FIELD[t]] || "").trim().toLowerCase();
        if (n) m.set(n, r);
      }
      idx[t] = m;
    }

    // pendingAdds[table][rowId][column] = Set<string> of names to add
    const pending: Record<T, Map<string, Map<string, Set<string>>>> = {} as any;
    for (const t of TABLES) pending[t] = new Map();

    function queueAdd(t: T, row: Row, col: string, val: string) {
      if (!col || !val) return;
      const cur = Array.isArray(row[col]) ? row[col].map((x: any) => String(x).toLowerCase()) : [];
      if (cur.includes(val.toLowerCase())) return;
      let r = pending[t].get(row.id);
      if (!r) { r = new Map(); pending[t].set(row.id, r); }
      let s = r.get(col);
      if (!s) { s = new Set(); r.set(col, s); }
      s.add(val);
    }

    // Walk every edge in both directions
    for (const tA of TABLES) {
      for (const tB of TABLES) {
        if (tA === tB) continue;
        const colAtoB = relCol(tA, tB);
        const colBtoA = relCol(tB, tA);
        if (!colAtoB || !colBtoA) continue;
        for (const a of data[tA]) {
          const aName = String(a[NAME_FIELD[tA]] || "").trim();
          if (!aName) continue;
          const arr = a[colAtoB];
          if (!Array.isArray(arr)) continue;
          for (const bName of arr) {
            const key = String(bName || "").trim().toLowerCase();
            if (!key) continue;
            const b = idx[tB].get(key);
            if (!b) continue;
            // Forward: a already has b (existing). Inverse: b should have a.
            queueAdd(tB, b, colBtoA, aName);
          }
        }
      }
    }

    // Apply patches
    const summary: Record<string, { rows_updated: number; cells_added: number }> = {};
    for (const t of TABLES) {
      let rowsUpdated = 0;
      let cellsAdded = 0;
      const ids = [...pending[t].keys()];
      for (let i = 0; i < ids.length; i += 30) {
        const batch = ids.slice(i, i + 30);
        await Promise.all(batch.map(async (id) => {
          const row = data[t].find((r) => r.id === id);
          if (!row) return;
          const cols = pending[t].get(id)!;
          const patch: Record<string, string[]> = {};
          for (const [col, set] of cols) {
            const cur: string[] = Array.isArray(row[col]) ? row[col] : [];
            const seenLower = new Set(cur.map((x) => String(x).toLowerCase()));
            const merged = [...cur];
            for (const v of set) {
              if (!seenLower.has(v.toLowerCase())) {
                merged.push(v);
                seenLower.add(v.toLowerCase());
                cellsAdded++;
              }
            }
            if (merged.length !== cur.length) patch[col] = merged.slice(0, MAX_ARR);
          }
          if (!Object.keys(patch).length) return;
          const { error } = await supabase.from(t).update(patch).eq("id", id);
          if (!error) {
            rowsUpdated++;
            Object.assign(row, patch);
          }
        }));
      }
      summary[t] = { rows_updated: rowsUpdated, cells_added: cellsAdded };
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
