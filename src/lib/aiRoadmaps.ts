// AI Roadmaps — data layer, types, and helpers per spec.
import { supabase } from "@/integrations/supabase/client";

export type EntityKind = "role" | "domain" | "career";
export type EntitySource = "career_cards" | "story_mode" | "challenge_mode" | "other";

export interface Entity {
  id: string; // "kind:label"
  label: string;
  kind: EntityKind;
  source: EntitySource;
  skills?: string[];
}

export type ResourceFormat =
  | "youtube" | "video" | "course" | "book" | "article" | "blog"
  | "podcast" | "research_paper" | "interview" | "image" | "community" | "company";

export interface WebResource {
  title: string;
  link: string;
  snippet: string;
  displayLink?: string;
  format?: ResourceFormat;
  platform?: string;
  thumbnail?: string;
  author?: string;
  duration?: string;
  badge?: string;
}

export interface SubStep {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  resources?: WebResource[];
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  resources?: WebResource[];
  subSteps?: SubStep[];
  // Cross-module linkage — every roadmap step ties back to a real module
  // in the app so the user can act on it immediately.
  linkedModule?: string;          // human label, e.g. "Curiosity Compass"
  linkedRoute?: string;           // in-app path, e.g. "/dashboard/curiosity-compass"
  formula?: string;               // short explanation of the signal/logic
}

export interface VirtualCoachRoadmapEvent {
  id: string;
  at: string;
  source: "ai_roadmaps";
  type: "roadmap_adjusted";
  summary: string;
  topGaps?: string[];
  alignmentBand?: string;
}

export interface UserDataAiRoadmaps {
  entities?: Entity[];
  milestones?: { id: string; title: string; createdAt: string; source?: string }[];
  accessLog?: { entityId: string; stepId?: string; at: string }[];
  stuckSignals?: {
    status?: "ok" | "stuck" | "looping";
    reason?: string;
    coachNote?: {
      reason: string;
      topGaps: string[];
      alignment: { band: string; score: number };
      plan: { summary: string };
      at?: string;
    };
    therapistPacing?: { note: string; at: string };
    updatedAt?: string;
  };
  lastUpdated?: string;
}

const LS_KEY = "userData.aiRoadmaps.v1";
const EVENTS_KEY = "shuttlex.virtualCoach.events.v1";

export function loadAiRoadmapsData(): UserDataAiRoadmaps {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAiRoadmapsData(d: UserDataAiRoadmaps) {
  localStorage.setItem(LS_KEY, JSON.stringify({ ...d, lastUpdated: new Date().toISOString() }));
}

export function recordRoadmapAccess(entry: { entityId: string; stepId?: string }) {
  const d = loadAiRoadmapsData();
  const log = d.accessLog || [];
  log.push({ ...entry, at: new Date().toISOString() });
  // Keep last 200
  d.accessLog = log.slice(-200);

  // Stuck detection: same entityId+stepId 3+ times in last 5 entries
  const recent = d.accessLog.slice(-5);
  const key = `${entry.entityId}|${entry.stepId || ""}`;
  const repeats = recent.filter((e) => `${e.entityId}|${e.stepId || ""}` === key).length;
  if (repeats >= 3) {
    d.stuckSignals = { ...(d.stuckSignals || {}), status: "looping", reason: `Repeated access to ${key}`, updatedAt: new Date().toISOString() };
  }
  saveAiRoadmapsData(d);
}

export function recordSelfGraphSignal(payload: {
  source: "learning";
  summary: string;
  signals: Record<string, number>;
  tags: string[];
  proposeInsight?: { title: string; body: string };
}) {
  try {
    const key = "selfGraph.signals.v1";
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({ ...payload, at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(arr.slice(-500)));
  } catch {}
}

export function logVirtualCoachEvent(ev: Omit<VirtualCoachRoadmapEvent, "id" | "at" | "source" | "type"> & Partial<Pick<VirtualCoachRoadmapEvent, "type">>) {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    arr.push({
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
      source: "ai_roadmaps",
      type: ev.type || "roadmap_adjusted",
      summary: ev.summary,
      topGaps: ev.topGaps,
      alignmentBand: ev.alignmentBand,
    });
    localStorage.setItem(EVENTS_KEY, JSON.stringify(arr.slice(-200)));
  } catch {}
}

// ─── Entity extraction from user's interactions ────────────────────────────
export async function fetchEntitiesFromInteractions(userId: string): Promise<Entity[]> {
  const positive = ["like", "love", "bookmark"];
  const [cardsR, pathsR, challR, storiesR] = await Promise.all([
    supabase
      .from("career_card_interactions")
      .select("interaction_type, career_cards(id,title,category,skills_related,tags)")
      .eq("user_id", userId)
      .in("interaction_type", positive),
    supabase
      .from("career_path_interactions")
      .select("interaction_type, career_paths(id,title,domain,related_skills,soft_skills)")
      .eq("user_id", userId)
      .in("interaction_type", positive),
    supabase
      .from("challenge_card_interactions")
      .select("interaction_type, domain_challenge_cards(id,challenge_name,domain,skills_needed)")
      .eq("user_id", userId)
      .in("interaction_type", positive),
    supabase
      .from("career_story_interactions")
      .select("interaction_type, career_stories(id,title,domain,narrator_role,skills_highlighted)")
      .eq("user_id", userId)
      .in("interaction_type", positive),
  ]);

  const out: Entity[] = [];
  const push = (e: Entity) => {
    if (!e.label) return;
    if (out.find((x) => x.id === e.id)) return;
    out.push(e);
  };

  (cardsR.data || []).forEach((row: any) => {
    const c = row.career_cards;
    if (!c) return;
    push({
      id: `career:${c.title}`,
      label: c.title,
      kind: "career",
      source: "career_cards",
      skills: c.skills_related || [],
    });
  });
  (pathsR.data || []).forEach((row: any) => {
    const p = row.career_paths;
    if (!p) return;
    push({
      id: `role:${p.title}`,
      label: p.title,
      kind: "role",
      source: "other",
      skills: [...(p.related_skills || []), ...(p.soft_skills || [])],
    });
    if (p.domain) {
      push({ id: `domain:${p.domain}`, label: p.domain, kind: "domain", source: "other" });
    }
  });
  (challR.data || []).forEach((row: any) => {
    const c = row.domain_challenge_cards;
    if (!c) return;
    push({
      id: `role:${c.challenge_name}`,
      label: c.challenge_name,
      kind: "role",
      source: "challenge_mode",
      skills: c.skills_needed || [],
    });
    if (c.domain) push({ id: `domain:${c.domain}`, label: c.domain, kind: "domain", source: "challenge_mode" });
  });
  (storiesR.data || []).forEach((row: any) => {
    const s = row.career_stories;
    if (!s) return;
    push({
      id: `role:${s.narrator_role || s.title}`,
      label: s.narrator_role || s.title,
      kind: "role",
      source: "story_mode",
      skills: s.skills_highlighted || [],
    });
    if (s.domain) push({ id: `domain:${s.domain}`, label: s.domain, kind: "domain", source: "story_mode" });
  });

  return out;
}

// ─── Full-journey roadmap builder ─────────────────────────────────────────
// Each main step is cross-linked to an existing module of the app so the user
// can act on it immediately. Order follows the Discover → Build → Connect →
// Evolve loop. Formulas describe the signal logic that ties each step back
// into the live SelfGraph / useUserSignals engine.
export interface RoadmapBuildContext {
  educationalStatus?: string | null; // e.g. "school_1_10", "class_11", "class_12", "diploma", "undergraduate", "completed_ug"
  highestEducation?: string | null;  // mirror from profile
}

export function buildRoadmapForEntity(entity: Entity, ctx: RoadmapBuildContext = {}): RoadmapStep[] {
  const baseKw = [entity.label, entity.kind, "career roadmap", "how to become"];
  const k = (...extra: string[]) => [...baseKw, ...extra];

  const status = (ctx.educationalStatus || ctx.highestEducation || "").toLowerCase();
  const isSchool = ["school_1_10", "class_9_10", "class_11", "class_12", "class_11_12"].some(s => status.includes(s.replace("_", "")) || status === s);
  const isUGOrLater = ["undergraduate", "completed_ug", "graduate", "diploma"].some(s => status === s);
  const hasGraduated = ["completed_ug", "graduate"].some(s => status === s);

  // ─── Education-prerequisite stages (only for those who still need them)
  const eduStages: RoadmapStep[] = [];
  if (isSchool) {
    eduStages.push(
      {
        id: "stepEdu1",
        title: "Stream & Subject Choice",
        description: `Pick the right Class 11/12 stream and subjects that keep ${entity.label} achievable.`,
        keywords: k("stream selection", "subject choice", "class 11 12", "career stream"),
        linkedModule: "Curiosity Compass + Explore",
        linkedRoute: "/dashboard/explore",
        formula: "stream_fit = subject_alignment × career_pathway_overlap",
        subSteps: [
          { id: "stepEdu1-sub1", title: "Map subjects to your target", description: `Which subjects unlock ${entity.label}?`, keywords: k("subject mapping") },
          { id: "stepEdu1-sub2", title: "Compare 2 stream options", description: "Pros, cons, and exit paths of each stream.", keywords: k("stream compare") },
          { id: "stepEdu1-sub3", title: "Talk to 1 senior who took it", description: "Real perspective beats hypothetical advice.", keywords: k("senior talk", "mentor") },
        ],
      },
      {
        id: "stepEdu2",
        title: "Entrance Exam Plan",
        description: `Identify the entrance exams (JEE, NEET, CUET, CLAT, etc.) that lead to ${entity.label}.`,
        keywords: k("entrance exam", "JEE NEET CUET CLAT", "exam prep"),
        linkedModule: "Content Library + AI Coach",
        linkedRoute: "/dashboard/content-library",
        formula: "exam_readiness = syllabus_coverage × mock_test_avg",
        subSteps: [
          { id: "stepEdu2-sub1", title: "Shortlist 2–3 exams", description: "Match exams to the courses that lead to your goal.", keywords: k("entrance exam shortlist") },
          { id: "stepEdu2-sub2", title: "Build a study calendar", description: "Weekly study + revision plan tailored to your hours.", keywords: k("study plan") },
          { id: "stepEdu2-sub3", title: "Take 1 baseline mock", description: "Know where you stand before you sprint.", keywords: k("mock test", "baseline") },
        ],
      },
      {
        id: "stepEdu3",
        title: "College & Course Shortlist",
        description: `Shortlist Indian + global colleges and degree programs that lead into ${entity.label}.`,
        keywords: k("college shortlist", "degree course", "university selection"),
        linkedModule: "Explore (Universities + Courses)",
        linkedRoute: "/dashboard/explore",
        formula: "shortlist_score = course_fit × admission_realism × affordability",
        subSteps: [
          { id: "stepEdu3-sub1", title: "Pick 8–10 colleges", description: "Mix of reach / fit / safety options.", keywords: k("college list") },
          { id: "stepEdu3-sub2", title: "Map cut-offs & fees in INR", description: "Know the bar and the budget upfront.", keywords: k("cutoffs", "fees INR") },
          { id: "stepEdu3-sub3", title: "Save 3 alumni stories", description: "Read what graduates of those colleges actually do.", keywords: k("alumni stories") },
        ],
      },
    );
  } else if (isUGOrLater && !hasGraduated) {
    eduStages.push({
      id: "stepEdu4",
      title: "Specialization & Higher Studies",
      description: `Pick electives, minors, or PG paths (MS / MBA / MA / PG diploma) that bend your degree toward ${entity.label}.`,
      keywords: k("specialization", "electives", "higher studies", "PG"),
      linkedModule: "Content Library + Explore",
      linkedRoute: "/dashboard/explore",
      formula: "edu_alignment = elective_overlap + pg_path_signal",
      subSteps: [
        { id: "stepEdu4-sub1", title: "Pick 2 electives that matter", description: `Electives that build ${entity.label} skills.`, keywords: k("electives") },
        { id: "stepEdu4-sub2", title: "Decide PG vs work-first", description: "Compare ROI of higher studies vs jumping into work.", keywords: k("PG vs work") },
        { id: "stepEdu4-sub3", title: "Shortlist 5 PG programs", description: "Even if you don't apply now, know the options.", keywords: k("PG programs") },
      ],
    });
  }

  const baseStages: RoadmapStep[] = [
    {
      id: "step2",
      title: "Foundation",
      description: "Build the fundamental concepts, prerequisites, and set up your tools.",
      keywords: k("foundations", "beginner", "introduction"),
      linkedModule: "Content Library",
      linkedRoute: "/dashboard/content-library",
      formula: "foundation_ready = prereq_coverage ≥ 0.7",
      subSteps: [
        { id: "step2-sub1", title: "Basics & vocabulary", description: "Lock in the core ideas and terminology.", keywords: k("basics", "concepts", "intro") },
        { id: "step2-sub2", title: "Prerequisite math/logic", description: "Cover the prerequisite math, logic, or domain knowledge.", keywords: k("math", "prerequisites", "logic") },
        { id: "step2-sub3", title: "Tools & environment", description: "Install and configure the tools you'll use day-to-day.", keywords: k("setup", "tools", "install") },
      ],
    },
    {
      id: "step3",
      title: "Skill Stack",
      description: `Plan the Core / Supporting / Exploration skills for ${entity.label} via SkillStacker.`,
      keywords: k("skill stack", "skill planning", "skillstacker"),
      linkedModule: "SkillStacker",
      linkedRoute: "/dashboard/skill-stacker",
      formula: "stack = top3_core + top3_supporting + 2_exploration (ranked by energy × confidence × demand)",
      subSteps: [
        { id: "step3-sub1", title: "Pick 3 core skills", description: "The non-negotiable skills for this path.", keywords: k("core skills", "must have") },
        { id: "step3-sub2", title: "Pick 3 supporting skills", description: "Skills that amplify the core stack.", keywords: k("supporting skills", "complementary") },
        { id: "step3-sub3", title: "Pick 2 exploration skills", description: "Stretch skills to keep you curious.", keywords: k("exploration", "stretch skills") },
      ],
    },
    {
      id: "step4",
      title: "Core Skills Practice",
      description: "Build daily fluency in the core technical and workflow skills.",
      keywords: k("core skills", "fundamentals", "practice"),
      linkedModule: "Content Library + Learning Capsules",
      linkedRoute: "/dashboard/content-library",
      formula: "fluency = (sessions/week × focus_minutes) / target_load",
      subSteps: [
        { id: "step4-sub1", title: "Daily practice ritual", description: "30–60 min focused blocks, 5 days a week.", keywords: k("daily practice", "consistency") },
        { id: "step4-sub2", title: "Spaced repetition reviews", description: "Revisit concepts weekly to lock them in.", keywords: k("spaced repetition", "review") },
        { id: "step4-sub3", title: "Workflow & tooling", description: "Adopt the standard tools and best practices.", keywords: k("workflow", "tooling") },
      ],
    },
    {
      id: "step5",
      title: "Industry Immersion",
      description: `Use Explore to study the 10-tier directory around ${entity.label} — sectors, companies, geographies.`,
      keywords: k("industry research", "market landscape", "explore"),
      linkedModule: "Explore (10-tier directory)",
      linkedRoute: "/dashboard/explore",
      formula: "exposure_index = unique(sectors ∪ companies ∪ roles) viewed in 30d",
      subSteps: [
        { id: "step5-sub1", title: "Map the sector landscape", description: "Identify the 5–7 sectors where this role thrives.", keywords: k("sectors", "industries") },
        { id: "step5-sub2", title: "Shortlist 10 companies", description: "Bookmark companies actively hiring/innovating here.", keywords: k("companies", "shortlist") },
        { id: "step5-sub3", title: "Read 3 industry reports", description: "Get the macro picture — trends, demand, salaries.", keywords: k("industry report", "trends") },
      ],
    },
    {
      id: "step6",
      title: "Projects & Portfolio",
      description: "Apply your skills to real projects in the Project Playground.",
      keywords: k("projects", "portfolio", "project playground"),
      linkedModule: "Project Playground",
      linkedRoute: "/dashboard/project-playground",
      formula: "portfolio_score = 0.5·shipped_projects + 0.3·feedback_quality + 0.2·originality",
      subSteps: [
        { id: "step6-sub1", title: "Guided project", description: "Follow a tutorial-style project end-to-end.", keywords: k("guided project", "tutorial") },
        { id: "step6-sub2", title: "Capstone project", description: "Design and ship one original project.", keywords: k("capstone", "original project") },
        { id: "step6-sub3", title: "Portfolio polish", description: "Document each project as a case study.", keywords: k("portfolio", "case study") },
      ],
    },
    {
      id: "step7",
      title: "Peer Circles & Community",
      description: `Join a circle of people learning ${entity.label} so you don't grow in isolation.`,
      keywords: k("peer circles", "community", "study group"),
      linkedModule: "Peer Circles",
      linkedRoute: "/dashboard/peer-circles",
      formula: "support_index = active_circle_members × weekly_interactions",
      subSteps: [
        { id: "step7-sub1", title: "Join 1 relevant circle", description: "Pick one circle aligned to this path.", keywords: k("join circle", "community") },
        { id: "step7-sub2", title: "Ship a weekly update", description: "Post 1 update per week — accountability is the lever.", keywords: k("weekly update", "accountability") },
        { id: "step7-sub3", title: "Give 2 pieces of feedback", description: "Reviewing others sharpens your own taste.", keywords: k("feedback", "peer review") },
      ],
    },
    {
      id: "step8",
      title: "Mentorship & Coaching",
      description: "Pair with a mentor and check in with the Virtual Career Coach.",
      keywords: k("mentorship", "coaching", "guidance"),
      linkedModule: "Mentor Matchmaking + Virtual Coach",
      linkedRoute: "/dashboard/mentor-matchmaking",
      formula: "mentor_match = cosine(user_KSAO, mentor_KSAO) × availability_overlap",
      subSteps: [
        { id: "step8-sub1", title: "Shortlist 3 mentors", description: "Filter by domain, language, and stage of career.", keywords: k("mentor shortlist", "matchmaking") },
        { id: "step8-sub2", title: "Book a first conversation", description: "A 20-min intro call beats 20 articles.", keywords: k("intro call", "mentorship session") },
        { id: "step8-sub3", title: "Run a Virtual Coach check-in", description: "Let the coach align your weekly plan.", keywords: k("virtual coach", "weekly checkin") },
      ],
    },
    {
      id: "step9",
      title: "Advanced & Specialization",
      description: `Go deep on one or two advanced topics inside ${entity.label}.`,
      keywords: k("advanced", "specialization", "deep dive"),
      linkedModule: "Content Library (Advanced)",
      linkedRoute: "/dashboard/content-library",
      formula: "specialization_depth = hours_on_topic / 100 (capped at 1.0)",
      subSteps: [
        { id: "step9-sub1", title: "Pick a specialization", description: "Choose one deep area you'll be known for.", keywords: k("specialization", "niche") },
        { id: "step9-sub2", title: "Complete an advanced course", description: "One serious course to anchor your depth.", keywords: k("advanced course", "expert") },
        { id: "step9-sub3", title: "Write a deep-dive note", description: "Teach the topic publicly — it forces understanding.", keywords: k("deep dive", "write up") },
      ],
    },
    {
      id: "step10",
      title: "Wellbeing & Pace",
      description: "Tune your pace with the AI Therapist + Moodboard so you don't burn out.",
      keywords: k("wellbeing", "pace", "burnout prevention"),
      linkedModule: "AI Career Therapist + Moodboard",
      linkedRoute: "/dashboard/career-therapist",
      formula: "pace_factor = clamp(1 − fatigue_signal, 0.5, 1.0); weekly_load ×= pace_factor",
      subSteps: [
        { id: "step10-sub1", title: "Weekly mood check-in", description: "Log how the journey is feeling — not just doing.", keywords: k("mood checkin", "moodboard") },
        { id: "step10-sub2", title: "Adjust pacing if needed", description: "Let the therapist suggest a load adjustment.", keywords: k("pacing", "load adjustment") },
        { id: "step10-sub3", title: "Build a confidence anchor", description: "List 3 things you already know well, weekly.", keywords: k("confidence anchor", "self compassion") },
      ],
    },
    {
      id: "step11",
      title: "Inspiration & Story Bank",
      description: `Stock your Career Inspirations + Moodboard with proof that ${entity.label} is possible for someone like you.`,
      keywords: k("inspiration", "role models", "stories"),
      linkedModule: "Career Inspirations + Inspire Wall",
      linkedRoute: "/dashboard/career-inspirations",
      formula: "motivation_index = saved_stories × identity_overlap_with_storyteller",
      subSteps: [
        { id: "step11-sub1", title: "Save 5 role-model stories", description: "Real journeys that mirror your context.", keywords: k("role models", "stories") },
        { id: "step11-sub2", title: "Build a mood board", description: "Visual + emotional anchor for the path.", keywords: k("moodboard", "vision board") },
        { id: "step11-sub3", title: "Post 1 inspire-wall update", description: "Share your own progress — pay it forward.", keywords: k("inspire wall", "share progress") },
      ],
    },
    {
      id: "step12",
      title: "Living Resume & Showcase",
      description: "Continuously update your Living Resume — every project, skill, badge flows in automatically.",
      keywords: k("resume", "portfolio site", "showcase"),
      linkedModule: "Living Resume",
      linkedRoute: "/dashboard/living-resume",
      formula: "readiness = sections_filled / total_sections; share_score = views + endorsements",
      subSteps: [
        { id: "step12-sub1", title: "Auto-import from app", description: "Pull skills, projects, badges into your resume.", keywords: k("living resume", "auto import") },
        { id: "step12-sub2", title: "Write a sharp summary", description: "3 lines on who you are and what you're shipping.", keywords: k("summary", "positioning") },
        { id: "step12-sub3", title: "Get 2 peer endorsements", description: "Ask circle members to endorse 1 skill each.", keywords: k("endorsements", "peer validation") },
      ],
    },
    {
      id: "step13",
      title: "Interviews & Jobs",
      description: `Run a focused job search for ${entity.label} via Job Matching.`,
      keywords: k("interview", "job search", "job matching"),
      linkedModule: "Job Matching",
      linkedRoute: "/dashboard/job-matching",
      formula: "match_score = 0.5·skill_overlap + 0.3·domain_match + 0.2·location_pref",
      subSteps: [
        { id: "step13-sub1", title: "Interview prep set", description: "Practise the formats common in this path.", keywords: k("interview questions", "mock interview") },
        { id: "step13-sub2", title: "Apply to 5 matched roles", description: "Quality over quantity — pick top matches weekly.", keywords: k("job applications", "apply") },
        { id: "step13-sub3", title: "Outreach + referrals", description: "DM 3 people per week for warm intros.", keywords: k("outreach", "referrals", "networking") },
      ],
    },
    {
      id: "step14",
      title: "Transition & Pivot Planning",
      description: "Use Transition Planner to simulate the switch — time, income, lifestyle.",
      keywords: k("transition", "pivot", "switch career"),
      linkedModule: "Transition Planner",
      linkedRoute: "/dashboard/transition-planner",
      formula: "transition_risk = months_runway⁻¹ × (income_drop% + skill_gap%)",
      subSteps: [
        { id: "step14-sub1", title: "Simulate 2 parallel paths", description: "Compare staying vs switching, side-by-side.", keywords: k("simulation", "parallel paths") },
        { id: "step14-sub2", title: "Plan a phased pivot", description: "3-phase plan with fail-safe backtracks.", keywords: k("phased pivot", "backtrack") },
        { id: "step14-sub3", title: "Set a financial runway", description: "Know your floor before you leap.", keywords: k("financial runway", "savings") },
      ],
    },
    {
      id: "step15",
      title: "Achievements & Milestones",
      description: "Celebrate milestones, climb the leaderboard, lock in identity-level wins.",
      keywords: k("achievements", "milestones", "badges", "leaderboard"),
      linkedModule: "Achievements + Leaderboard",
      linkedRoute: "/dashboard/achievements",
      formula: "level_up_score = badges × 0.4 + streak_days × 0.3 + circle_contributions × 0.3",
      subSteps: [
        { id: "step15-sub1", title: "Unlock first 3 badges", description: "Quick wins that anchor identity.", keywords: k("badges", "first wins") },
        { id: "step15-sub2", title: "Maintain a 14-day streak", description: "Streaks build the 'I do this' identity.", keywords: k("streak", "consistency") },
        { id: "step15-sub3", title: "Hit a leaderboard rank", description: "Show up where your peers can see you.", keywords: k("leaderboard", "rank") },
      ],
    },
  ];

  // Gate "Advanced & Specialization" — only meaningful once formal foundation exists.
  const allowAdvanced = isUGOrLater || hasGraduated;
  const filteredBase = allowAdvanced ? baseStages : baseStages.filter(s => s.id !== "step9");

  return [...eduStages, ...filteredBase];
}

export function buildStepQuery(entity: Entity, step: RoadmapStep): string {
  return `${entity.label} ${step.keywords.join(" ")}`;
}

export function buildSubStepQuery(entity: Entity, sub: SubStep): string {
  return `${entity.label} ${sub.keywords.join(" ")} video OR site:youtube.com podcast OR audio course OR syllabus book OR pdf blog OR article research paper OR arxiv`;
}

export async function searchWebResources(query: string, num = 8): Promise<WebResource[]> {
  const { data, error } = await supabase.functions.invoke("roadmap-web-search", {
    body: { query, num, provider: (import.meta as any).env?.VITE_SEARCH_PROVIDER || "auto" },
  });
  if (error) throw error;
  return (data?.results || []) as WebResource[];
}

// ─── Personalization-driven entity fallback ────────────────────────────────
// When a user has no card/path/challenge/story interactions yet, derive
// entities from the cached personalization pipeline (sectors + ranked roles
// + ranked domains) so Roadmaps is useful right after onboarding + assessments.
export async function fetchEntitiesFromPersonalization(userId: string): Promise<Entity[]> {
  try {
    const { getCachedPersonalization, runUserPersonalization } = await import("./personalizationPipeline");
    let cached = await getCachedPersonalization(userId);
    if (!cached) cached = await runUserPersonalization(userId);
    if (!cached) return [];
    const out: Entity[] = [];
    const seen = new Set<string>();
    const push = (label: string, kind: EntityKind) => {
      if (!label) return;
      const id = `${kind}:${label}`;
      if (seen.has(id)) return;
      seen.add(id);
      out.push({ id, label, kind, source: "other" });
    };
    (cached.ranked?.role || []).slice(0, 5).forEach((r: any) => push(r.entity_name, "role"));
    (cached.ranked?.domain || []).slice(0, 4).forEach((r: any) => push(r.entity_name, "domain"));
    (cached.ranked?.sector || []).slice(0, 3).forEach((r: any) => push(r.entity_name, "domain"));
    return out;
  } catch (e) {
    console.warn("[aiRoadmaps] personalization fallback failed:", e);
    return [];
  }
}

// ─── Live AI roadmap generation (replaces template for a single entity) ────
// Calls the `roadmap-ai` edge function with `generate_roadmap`. It enriches
// with profile, signals, interests, skills + Firecrawl grounding and returns
// phased steps. We map them into our RoadmapStep shape so the existing UI
// renders them with the same cards & resource layout.
export async function generateLiveRoadmapForEntity(
  entity: Entity,
  extra: { educationalStatus?: string | null } = {}
): Promise<RoadmapStep[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke("roadmap-ai", {
      body: {
        type: "generate_roadmap",
        context: {
          areasOfFocus: [entity.label],
          interests: [entity.label, entity.kind],
          skills: entity.skills || [],
          careerStage: extra.educationalStatus || "exploring",
        },
      },
    });
    if (error) throw error;
    const phases = (data?.phases || []) as any[];
    if (!phases.length) return null;
    const steps: RoadmapStep[] = [];
    phases.forEach((phase: any, pi: number) => {
      (phase.steps || []).forEach((s: any, si: number) => {
        const resources: WebResource[] = s.resource_url
          ? [{
              title: s.resource_title || s.resource_url,
              link: s.resource_url,
              snippet: (s.description || "").slice(0, 160),
              displayLink: (() => { try { return new URL(s.resource_url).hostname; } catch { return ""; } })(),
              format: "course",
            }]
          : [];
        steps.push({
          id: `ai-${pi}-${si}`,
          title: s.title || `Step ${steps.length + 1}`,
          description: [
            s.description || "",
            s.estimated_duration ? `\nDuration: ${s.estimated_duration}` : "",
            s.skill_tags?.length ? `\nSkills: ${s.skill_tags.join(", ")}` : "",
          ].join(""),
          keywords: [entity.label, ...(s.skill_tags || []), phase.name].filter(Boolean),
          resources,
          linkedModule: `Phase: ${phase.name}`,
          formula: `priority=${s.priority || "medium"} · ${s.action_type || s.category || ""}`,
        });
      });
    });
    return steps;
  } catch (e) {
    console.warn("[aiRoadmaps] generateLiveRoadmapForEntity failed:", e);
    return null;
  }
}
