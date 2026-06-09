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

// ─── 5-stage roadmap builder ───────────────────────────────────────────────
export function buildRoadmapForEntity(entity: Entity): RoadmapStep[] {
  const baseKw = [entity.label, entity.kind, "career roadmap", "how to become"];
  const k = (...extra: string[]) => [...baseKw, ...extra];

  return [
    {
      id: "step1",
      title: "Foundation",
      description: "Build the fundamental concepts, math/logic prerequisites, and set up your tools.",
      keywords: k("foundations", "beginner", "introduction"),
      subSteps: [
        { id: "step1-sub1", title: "Basics & Concepts", description: "Understand the core ideas and vocabulary.", keywords: k("basics", "concepts", "intro") },
        { id: "step1-sub2", title: "Math/Logic & Prereqs", description: "Cover the prerequisite math, logic, or domain knowledge.", keywords: k("math", "prerequisites", "logic") },
        { id: "step1-sub3", title: "Tools Setup", description: "Install and configure the tools you'll use.", keywords: k("setup", "tools", "install") },
      ],
    },
    {
      id: "step2",
      title: "Core Skills",
      description: "Master the core technical and workflow skills used day-to-day.",
      keywords: k("core skills", "fundamentals"),
      subSteps: [
        { id: "step2-sub1", title: "Core Skill A", description: "The first essential skill in this path.", keywords: k("core skill", "essential") },
        { id: "step2-sub2", title: "Core Skill B", description: "The second essential skill in this path.", keywords: k("core skill", "advanced beginner") },
        { id: "step2-sub3", title: "Tooling & Workflow", description: "Adopt the standard tools and workflow.", keywords: k("workflow", "best practices", "tooling") },
      ],
    },
    {
      id: "step3",
      title: "Projects & Portfolio",
      description: "Apply skills to real projects and build a portfolio.",
      keywords: k("projects", "portfolio"),
      subSteps: [
        { id: "step3-sub1", title: "Guided Project", description: "Follow a tutorial-style project end-to-end.", keywords: k("guided project", "tutorial") },
        { id: "step3-sub2", title: "Capstone Project", description: "Design and ship an original project.", keywords: k("capstone project", "original") },
        { id: "step3-sub3", title: "Portfolio Polish", description: "Document and present your work.", keywords: k("portfolio", "case study") },
      ],
    },
    {
      id: "step4",
      title: "Advanced & Specialization",
      description: "Go deep on one or two advanced topics.",
      keywords: k("advanced", "specialization"),
      subSteps: [
        { id: "step4-sub1", title: "Advanced Topic 1", description: "Pick a deep specialization.", keywords: k("advanced", "deep dive") },
        { id: "step4-sub2", title: "Advanced Topic 2", description: "Pick a complementary specialization.", keywords: k("advanced", "expert") },
      ],
    },
    {
      id: "step5",
      title: "Interviews & Jobs",
      description: "Prepare for interviews and run a focused job search.",
      keywords: k("interview", "job search"),
      subSteps: [
        { id: "step5-sub1", title: "Interview Prep", description: "Practice the interview formats common in this path.", keywords: k("interview questions", "practice") },
        { id: "step5-sub2", title: "Resume & Profile", description: "Write a strong resume and online profile.", keywords: k("resume", "linkedin profile") },
        { id: "step5-sub3", title: "Job Search Strategy", description: "Plan outreach, applications, and networking.", keywords: k("job search", "networking", "applications") },
      ],
    },
  ];
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
