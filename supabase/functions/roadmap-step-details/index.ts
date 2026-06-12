import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAuthUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ─── Auth check FIRST (before any DB/AI work) ───────────────────────────
    const authedUser = await getAuthUser(req);
    if (!authedUser) return unauthorized();

    const { stepId, stepTitle, stepDescription, stepPhase, stepCategory, roadmapTitle, userGoals, forceRefresh } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // ─── Check cache first (scoped to this user) ────────────────────────────
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("roadmap_step_details")
        .select("*")
        .eq("step_id", stepId)
        .eq("user_id", authedUser.id)
        .maybeSingle();

      if (cached) {
        const age = Date.now() - new Date(cached.generated_at).getTime();
        if (age < 7 * 24 * 60 * 60 * 1000) {
          return new Response(JSON.stringify({ ...cached, cached: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // ─── Cross-reference backend directories ────────────────────────────────
    // Extract domain keywords from step for directory matching
    const domainKeywords = extractKeywords(stepTitle + " " + (stepDescription || "") + " " + (roadmapTitle || ""));

    const [careerPathsRes, jobRolesRes, domainRes] = await Promise.all([
      supabase.from("career_paths").select("title, domain, description, related_skills, salary_range, demand_level, growth_trajectory, day_to_day, tools_certifications")
        .or(domainKeywords.map(k => `title.ilike.%${k}%`).join(","))
        .limit(5),
      supabase.from("job_roles_directory").select("title, domain, description, skills_required, avg_salary_usd, demand_level, experience_level, work_environment")
        .or(domainKeywords.map(k => `title.ilike.%${k}%`).join(","))
        .limit(5),
      supabase.from("domain_directory").select("name, category, description, keywords")
        .or(domainKeywords.map(k => `name.ilike.%${k}%`).join(","))
        .limit(3),
    ]);

    const careerPaths = careerPathsRes.data || [];
    const jobRoles = jobRolesRes.data || [];
    const domains = domainRes.data || [];

    // ─── Build deep analysis prompt ──────────────────────────────────────────
    const systemPrompt = `You are a world-class career architect and learning strategist with encyclopedic knowledge of every industry, career domain, job role, skill, and learning resource available globally. You have access to data from ESCO occupational taxonomy, O*NET, LinkedIn Learning, Coursera, edX, freeCodeCamp, MIT OpenCourseWare, and hundreds of top learning platforms.

Your task is to generate an EXHAUSTIVELY DETAILED breakdown of a single roadmap step — including granular sub-steps with precise time estimates, and a comprehensive directory of real external learning resources categorized by type.

ALGORITHM:
1. Analyze the step in context of the career domain, user goals, and phase
2. Cross-reference with real industry standards (what employers actually expect)
3. Break down into atomic, actionable sub-steps (3-8 sub-steps)
4. For each resource, provide REAL, VERIFIABLE URLs to actual internet resources
5. Prioritize free resources first, paid second
6. Cover every learning modality: video, course, article, book, tool, community, podcast

RESOURCE URL RULES:
- YouTube: use real channel/playlist URLs like https://youtube.com/@channelname or https://youtube.com/playlist?list=...
- Coursera: https://coursera.org/learn/course-name
- edX: https://edx.org/learn/topic/course-name  
- freeCodeCamp: https://freecodecamp.org/news/topic or https://freecodecamp.org/learn
- MDN: https://developer.mozilla.org/en-US/docs/topic
- Official docs: use actual documentation URLs
- GitHub: https://github.com/org/repo
- Books: use Google Books or Amazon links
- Podcasts: use Spotify or podcast website URLs
- Research papers: use arxiv.org or Google Scholar links
- Communities: Reddit, Discord, Slack workspace URLs
- Practice platforms: LeetCode, HackerRank, Kaggle, etc.

CRITICALLY IMPORTANT: Generate real, working URLs. Do NOT make up fake URLs. Prefer well-known, stable platforms.

Return JSON with this exact structure:
{
  "overview": "Comprehensive paragraph explaining what this step involves, why it matters for this career stage, and what success looks like",
  "total_time_estimate": "e.g. 3-4 weeks (8-10 hrs/week)",
  "difficulty_level": "Beginner | Intermediate | Advanced | Expert",
  "sub_steps": [
    {
      "order": 1,
      "title": "string",
      "description": "Detailed explanation of what to do and why",
      "time_estimate": "e.g. 3-5 hours",
      "type": "learn | practice | build | research | network | reflect",
      "deliverable": "What you produce/achieve at the end of this sub-step",
      "tips": ["tip 1", "tip 2"],
      "skill_tags": ["tag1", "tag2"]
    }
  ],
  "time_breakdown": {
    "total": "string",
    "weekly_commitment": "string",
    "by_activity": {
      "learning": "e.g. 40% (3-4 hrs/week)",
      "practice": "e.g. 30% (2-3 hrs/week)",
      "building": "e.g. 20% (1-2 hrs/week)",
      "reviewing": "e.g. 10% (1 hr/week)"
    },
    "milestones": [
      { "week": 1, "goal": "string" },
      { "week": 2, "goal": "string" }
    ]
  },
  "learning_resources": {
    "free_courses": [
      { "title": "string", "platform": "string", "url": "string", "duration": "string", "level": "string", "why": "why this is recommended" }
    ],
    "paid_courses": [
      { "title": "string", "platform": "string", "url": "string", "duration": "string", "level": "string", "price_range": "string", "why": "string" }
    ],
    "youtube": [
      { "title": "string", "channel": "string", "url": "string", "why": "string" }
    ],
    "books": [
      { "title": "string", "author": "string", "url": "string", "type": "free | paid", "why": "string" }
    ],
    "articles_blogs": [
      { "title": "string", "source": "string", "url": "string", "why": "string" }
    ],
    "documentation_official": [
      { "title": "string", "organization": "string", "url": "string", "why": "string" }
    ],
    "practice_platforms": [
      { "title": "string", "url": "string", "type": "coding | design | data | general | language", "why": "string" }
    ],
    "tools_apps": [
      { "title": "string", "url": "string", "free_tier": true, "why": "string" }
    ],
    "communities": [
      { "title": "string", "platform": "Reddit | Discord | Slack | LinkedIn | GitHub", "url": "string", "why": "string" }
    ],
    "podcasts": [
      { "title": "string", "url": "string", "why": "string" }
    ],
    "research_papers": [
      { "title": "string", "authors": "string", "url": "string", "why": "string" }
    ],
    "github_repos": [
      { "title": "string", "url": "string", "stars_approx": "string", "why": "string" }
    ]
  },
  "career_context": {
    "why_this_matters": "string — direct connection to career outcome",
    "industry_demand": "string — market data on how valued this skill/knowledge is",
    "salary_impact": "string — how mastering this affects earning potential",
    "job_roles_that_need_this": ["role 1", "role 2"],
    "prerequisite_knowledge": ["thing 1", "thing 2"],
    "what_comes_next": "string — what step builds on this"
  },
  "guidance": {
    "best_practices": ["practice 1", "practice 2"],
    "common_mistakes": ["mistake 1", "mistake 2"],
    "success_indicators": ["how you know you've mastered this"],
    "mentor_advice": "string — advice from an expert in this domain",
    "portfolio_ideas": ["project idea 1", "project idea 2"]
  }
}`;

    const userPrompt = `Generate EXHAUSTIVELY DETAILED step breakdown for:

ROADMAP STEP:
Title: "${stepTitle}"
Description: "${stepDescription || "No additional description"}"
Phase: ${stepPhase} (in the 5-phase career journey: Exploration → Learning → Practice → Connection → Opportunity)
Category: ${stepCategory}
Roadmap Goal: "${roadmapTitle}"
User Goals: "${userGoals || "General career development"}"

MATCHING DATA FROM OUR CAREER DIRECTORY:
Relevant Career Paths: ${JSON.stringify(careerPaths.map(c => ({ title: c.title, domain: c.domain, skills: c.related_skills, salary: c.salary_range, demand: c.demand_level })))}
Relevant Job Roles: ${JSON.stringify(jobRoles.map(j => ({ title: j.title, domain: j.domain, skills: j.skills_required, salary: j.avg_salary_usd, demand: j.demand_level })))}
Relevant Domains: ${JSON.stringify(domains.map(d => ({ name: d.name, category: d.category, keywords: d.keywords })))}

Using ALL the above context, generate a deeply specific, actionable, and resource-rich breakdown. Make sub-steps concrete enough that someone could start them TODAY. Make every learning resource a real link to a real platform. Tailor everything to "${stepTitle}" specifically — do not be generic.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error: " + response.status);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let parsed: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      console.error("Failed to parse AI response:", content.slice(0, 500));
      throw new Error("Failed to parse AI response");
    }

    // ─── Upsert into cache table (scoped to authenticated user) ────────────
    await supabase.from("roadmap_step_details").upsert({
      step_id: stepId,
      user_id: authedUser.id,
      overview: parsed.overview || "",
      total_time_estimate: parsed.total_time_estimate || "",
      difficulty_level: parsed.difficulty_level || "",
      sub_steps: parsed.sub_steps || [],
      time_breakdown: parsed.time_breakdown || {},
      learning_resources: parsed.learning_resources || {},
      career_context: parsed.career_context || {},
      guidance: parsed.guidance || {},
      generated_at: new Date().toISOString(),
    }, { onConflict: "step_id" });

    return new Response(JSON.stringify({ ...parsed, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("roadmap-step-details error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function extractKeywords(text: string): string[] {
  const stopWords = new Set(["the", "a", "an", "in", "on", "at", "to", "for", "of", "and", "or", "is", "it", "this", "that", "with", "by", "from", "as", "be", "are", "was", "were"]);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));
  return [...new Set(words)].slice(0, 8);
}
