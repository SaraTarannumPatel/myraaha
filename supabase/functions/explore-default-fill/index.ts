// Step 3: Table-wide defaulting.
// For configured scalar text fields, compute the mode (most frequent value)
// of the table and fill rows where the field is NULL or empty string.
// Non-destructive: never overwrites existing values.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SCALAR_FIELDS: Record<string, string[]> = {
  career_paths: ["demand_level","growth_trajectory","difficulty","salary_range","avg_salary_usd","icon_emoji"],
  job_roles_directory: ["demand_level","growth_trajectory","avg_salary_usd"],
  industry_directory: ["demand_level","growth_trajectory","avg_salary_usd","icon_emoji"],
  sector_directory: ["demand_level","growth_trajectory","avg_salary_usd","icon_emoji"],
  domain_directory: ["icon_emoji"],
  skills_directory: ["demand_level","growth_trajectory","avg_salary_usd","difficulty"],
  subjects_directory: ["demand_level"],
  online_courses_directory: ["demand_level","icon_emoji"],
  universities_directory: [],
  countries_directory: ["demand_level","growth_trajectory","avg_salary_usd","icon_emoji"],
};

// Default emoji per table when no mode exists
const FALLBACK_EMOJI: Record<string,string> = {
  career_paths:"💼", job_roles_directory:"👔", industry_directory:"🏭", sector_directory:"🏢",
  domain_directory:"🧭", skills_directory:"🛠️", subjects_directory:"📚",
  online_courses_directory:"🎓", universities_directory:"🏫", countries_directory:"🌍",
};

function mode(values: string[]): string | null {
  const counts = new Map<string, number>();
  for (const v of values) {
    const k = String(v).trim();
    if (!k) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  let best: string | null = null; let bn = 0;
  for (const [k,n] of counts) if (n > bn) { bn = n; best = k; }
  return best;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try {
    const summary: Record<string, Record<string, { default: string|null; filled: number }>> = {};
    for (const [table, fields] of Object.entries(SCALAR_FIELDS)) {
      summary[table] = {};
      const { data: rows, error } = await supabase.from(table).select("id," + fields.join(",")).limit(5000);
      if (error) { summary[table]["__error"] = { default: error.message, filled: 0 } as any; continue; }
      const all = rows || [];
      for (const f of fields) {
        const present = all.map((r:any)=>r[f]).filter((v:any)=> typeof v==="string" && v.trim().length);
        let def = mode(present);
        if (!def && f === "icon_emoji") def = FALLBACK_EMOJI[table] || "✨";
        if (!def) { summary[table][f] = { default: null, filled: 0 }; continue; }
        const targets = all.filter((r:any)=> !r[f] || (typeof r[f]==="string" && !r[f].trim()));
        let filled = 0;
        for (let i = 0; i < targets.length; i += 50) {
          const batch = targets.slice(i, i+50);
          await Promise.all(batch.map(async (r:any) => {
            const { error: e } = await supabase.from(table).update({ [f]: def }).eq("id", r.id);
            if (!e) filled++;
          }));
        }
        summary[table][f] = { default: def, filled };
      }
    }
    return new Response(JSON.stringify({ ok:true, summary }), {
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error:String(e) }), {
      status:500, headers:{...cors, "content-type":"application/json"} });
  }
});
