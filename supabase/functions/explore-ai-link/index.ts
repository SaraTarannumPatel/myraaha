// Pass 2: AI-assisted orphan linker.
// For each row that still has empty cross-link arrays, ask Gemini Flash to
// pick the most semantically relevant entries from each sibling directory.
// Pre-filters candidates by trigram overlap to keep prompts small.
// Non-destructive: appends to related_*/top_* arrays only. JSON-only output.
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

const NAME: Record<T,"name"|"title"> = {
  career_paths:"title", job_roles_directory:"title", industry_directory:"name",
  sector_directory:"name", domain_directory:"name", skills_directory:"name",
  subjects_directory:"name", online_courses_directory:"name",
  universities_directory:"name", countries_directory:"name",
};

function colFor(self: T, otherKind: T): string {
  if (self === "countries_directory") {
    const m: Record<T,string> = { career_paths:"top_careers", job_roles_directory:"top_job_roles",
      industry_directory:"top_industries", sector_directory:"top_sectors",
      domain_directory:"top_domains", skills_directory:"top_skills",
      subjects_directory:"top_subjects", online_courses_directory:"top_courses",
      universities_directory:"top_universities", countries_directory:"" };
    return m[otherKind];
  }
  const m: Record<T,string> = { career_paths:"related_careers", job_roles_directory:"related_job_roles",
    industry_directory:"related_industries", sector_directory:"related_sectors",
    domain_directory:"related_domains", skills_directory:"related_skills",
    subjects_directory:"related_subjects", online_courses_directory:"related_courses",
    universities_directory:"related_universities", countries_directory:"related_countries" };
  return m[otherKind];
}

const TOP_K: Record<T, number> = {
  career_paths: 8, job_roles_directory: 8, industry_directory: 5, sector_directory: 5,
  domain_directory: 6, skills_directory: 10, subjects_directory: 6,
  online_courses_directory: 6, universities_directory: 5, countries_directory: 5,
};

const ORPHAN_COLS: Record<T, string[]> = {
  career_paths: ["related_skills","related_industries","related_job_roles"],
  job_roles_directory: ["related_skills","related_industries","related_careers"],
  industry_directory: ["related_skills","related_careers","related_job_roles"],
  sector_directory: ["related_industries","related_careers"],
  domain_directory: ["related_skills","related_careers"],
  skills_directory: ["related_careers","related_industries","related_job_roles"],
  subjects_directory: ["related_careers","related_skills"],
  online_courses_directory: ["related_careers","related_skills"],
  universities_directory: ["related_careers","popular_courses"],
  countries_directory: ["top_careers","top_industries"],
};

function tris(s: string): Set<string> {
  const out = new Set<string>();
  const n = ` ${s.toLowerCase().replace(/[^a-z0-9]+/g," ").trim()} `;
  for (let i = 0; i + 3 <= n.length; i++) out.add(n.slice(i, i+3));
  return out;
}
function jacc<X>(a:Set<X>,b:Set<X>):number{ if(!a.size||!b.size)return 0; let i=0; for(const x of a) if(b.has(x)) i++; return i/(a.size+b.size-i); }

async function aiPick(target: { table: T; name: string; description?: string },
                      candidates: { table: T; names: string[] }[]): Promise<Record<string,string[]>> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const sys = `You map a directory entry to its most semantically related entries from sibling directories. Reply ONLY with JSON of shape {"<table>":["name1","name2",...]}. Use names EXACTLY as given. Skip a table if nothing fits. Be strict on relevance.`;

  const candList = candidates.map((c) =>
    `${c.table} (pick up to ${TOP_K[c.table]}):\n${c.names.map((n)=>`- ${n}`).join("\n")}`
  ).join("\n\n");

  const user = `Target ${target.table}: "${target.name}"${target.description?`\nDescription: ${target.description.slice(0,300)}`:""}\n\nCandidates:\n${candList}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: sys }, { role: "user", content: user }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    if (res.status === 429 || res.status === 402) throw new Error(`AI ${res.status}`);
    return {};
  }
  const j = await res.json();
  try {
    const txt = j.choices?.[0]?.message?.content || "{}";
    return JSON.parse(txt);
  } catch { return {}; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  try {
    const url = new URL(req.url);
    const onlyTable = url.searchParams.get("table") as T | null;
    const limit = Number(url.searchParams.get("limit") || "60");
    const candPerTable = Number(url.searchParams.get("cand") || "40");

    const data: Record<T, any[]> = {} as any;
    const tris_: Record<T, { id:string; name:string; t:Set<string> }[]> = {} as any;
    for (const t of TABLES) {
      const { data: rows, error } = await supabase.from(t).select("*").limit(5000);
      if (error) throw new Error(`${t}: ${error.message}`);
      data[t] = rows || [];
      tris_[t] = (rows||[]).map((r:any)=>({ id:r.id, name:String(r[NAME[t]]||""), t: tris(String(r[NAME[t]]||"")) })).filter((x)=>x.name);
    }

    const summary: Record<string, { processed:number; updated:number; cells:number; ai_calls:number }> = {};
    for (const t of TABLES) summary[t] = { processed:0, updated:0, cells:0, ai_calls:0 };

    const tablesToRun = onlyTable ? [onlyTable] : [...TABLES];

    for (const t of tablesToRun) {
      // Find rows still orphaned on key cols
      const cols = ORPHAN_COLS[t];
      const orphans = data[t].filter((r:any) =>
        cols.every((c) => !Array.isArray(r[c]) || r[c].length === 0)
      ).slice(0, limit);

      for (const row of orphans) {
        summary[t].processed++;
        const tName = String(row[NAME[t]]||""); if (!tName) continue;
        const tT = tris(tName);

        // Build candidate lists per sibling table via trigram pre-filter
        const candidates: { table: T; names: string[] }[] = [];
        for (const ot of TABLES) {
          if (ot === t) continue;
          if (!colFor(t, ot)) continue;
          const scored = tris_[ot].map((x)=>({ name:x.name, s: jacc(tT, x.t) }))
            .filter((x)=>x.s > 0)
            .sort((a,b)=>b.s-a.s)
            .slice(0, candPerTable)
            .map((x)=>x.name);
          // Always include some seed coverage even if no trigram overlap
          if (scored.length < 12) {
            const extra = tris_[ot].slice(0, 24).map((x)=>x.name);
            for (const n of extra) if (!scored.includes(n) && scored.length < 24) scored.push(n);
          }
          if (scored.length) candidates.push({ table: ot, names: scored });
        }
        if (!candidates.length) continue;

        let picks: Record<string,string[]> = {};
        try {
          picks = await aiPick({ table: t, name: tName, description: row.description }, candidates);
          summary[t].ai_calls++;
        } catch (e) {
          console.error("AI fail", t, tName, String(e));
          break; // back off
        }

        // Build patch
        const patch: Record<string,string[]> = {};
        for (const ot of TABLES) {
          if (ot === t) continue;
          const col = colFor(t, ot); if (!col) continue;
          const chosen = picks[ot] || picks[String(ot)] || [];
          if (!Array.isArray(chosen) || !chosen.length) continue;
          // Validate names exist in candidates
          const validSet = new Set((candidates.find((c)=>c.table===ot)?.names||[]).map((x)=>x.toLowerCase()));
          const valid = chosen.filter((n)=> typeof n==="string" && validSet.has(n.toLowerCase())).slice(0, TOP_K[ot]);
          if (!valid.length) continue;
          const cur:string[] = Array.isArray(row[col]) ? row[col] : [];
          const seen = new Set(cur.map((x:string)=>x.toLowerCase()));
          const merged = [...cur];
          for (const v of valid) if (!seen.has(v.toLowerCase())) { merged.push(v); seen.add(v.toLowerCase()); summary[t].cells++; }
          if (merged.length !== cur.length) patch[col] = merged.slice(0, 30);
        }

        if (Object.keys(patch).length) {
          const { error } = await supabase.from(t).update(patch).eq("id", row.id);
          if (!error) { summary[t].updated++; Object.assign(row, patch); }
        }
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
