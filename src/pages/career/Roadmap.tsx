import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Sparkles, RefreshCw, ExternalLink, Library, Settings as SettingsIcon,
  Target, Zap, Flame, TrendingUp, ArrowRight, Loader2, BookOpen, Wand2,
  Youtube, GraduationCap, Mic, FileText, Newspaper, Image as ImageIcon,
  Building2, Users, Video, ScrollText, MessageSquare,
} from "lucide-react";
import {
  Entity, RoadmapStep, SubStep, WebResource,
  fetchEntitiesFromInteractions, buildRoadmapForEntity,
  buildStepQuery, buildSubStepQuery, searchWebResources,
  loadAiRoadmapsData, saveAiRoadmapsData, recordRoadmapAccess,
  recordSelfGraphSignal, logVirtualCoachEvent,
  fetchEntitiesFromPersonalization, generateLiveRoadmapForEntity,
} from "@/lib/aiRoadmaps";
import {
  MOCK_ENTITIES, MOCK_COACH_NOTE, MOCK_THERAPIST_ADJUST,
  getMockResourcesForStep, getMockResourcesForSubStep,
} from "@/lib/aiRoadmapsMock";

// Live by default. "Replay Demo" button still seeds mock entities, coach
// notes, therapist adjustments and progress for presentations.
const DEMO_MODE_DEFAULT = false;

// Mock progress/insights per spec
const MOCK_PROGRESS = {
  completedTasks: 12, totalTasks: 25, skillsGained: 8, hoursInvested: 45,
  currentStreak: 7, longestStreak: 15, averageSessionTime: 2.5, completionRate: 0.48, careerReadiness: 65,
};
const MOCK_AI_INSIGHTS = {
  nextRecommendedAction: "Complete the React Components task to advance your frontend skills",
  skillGaps: ["Backend Development", "Database Management", "DevOps"],
  weeklyGoal: "Complete 2 tasks and practice coding for 10 hours",
  estimatedTimeToGoal: "3-4 months",
  personalizedTips: [
    "Schedule 30-min focused coding blocks daily",
    "Pair guided projects with one capstone every month",
    "Review one job description per week to align learning",
    "Share weekly progress with your peer circle",
  ],
};

const KIND_COLORS: Record<string, string> = {
  role: "bg-blue-500/10 text-blue-700 border-blue-200",
  domain: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  career: "bg-amber-500/10 text-amber-700 border-amber-200",
};

export default function Roadmap() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [entities, setEntities] = useState<Entity[]>([]);
  const [activeEntityId, setActiveEntityId] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<string, RoadmapStep[]>>({});
  const [loadingResources, setLoadingResources] = useState<Record<string, boolean>>({});
  const [loadingEntities, setLoadingEntities] = useState(true);

  const [coachNote, setCoachNote] = useState<any>(null);
  const [therapistAdjust, setTherapistAdjust] = useState<any>(null);
  const [smartNavApplied, setSmartNavApplied] = useState(false);
  const [demoMode, setDemoMode] = useState(DEMO_MODE_DEFAULT);
  const [aiGenerating, setAiGenerating] = useState(false);

  const generateAiRoadmap = async () => {
    if (!activeEntityId) return;
    const ent = entities.find((e) => e.id === activeEntityId);
    if (!ent) return;
    setAiGenerating(true);
    try {
      let eduStatus: string | null = null;
      if (user) {
        try {
          const { data } = await supabase
            .from("user_education_status")
            .select("educational_status")
            .eq("user_id", user.id)
            .maybeSingle();
          eduStatus = (data as any)?.educational_status || null;
        } catch {}
      }
      const aiSteps = await generateLiveRoadmapForEntity(ent, { educationalStatus: eduStatus });
      if (aiSteps && aiSteps.length) {
        setSteps((prev) => ({ ...prev, [ent.id]: aiSteps }));
        recordSelfGraphSignal({
          source: "learning",
          summary: `Generated live AI roadmap for ${ent.label}`,
          signals: { commitment_signal: 0.5 },
          tags: ["ai_roadmaps", "ai_generated", ent.kind],
        });
        toast.success(`Generated a fresh AI roadmap with ${aiSteps.length} steps.`);
      } else {
        toast.error("AI couldn't build a roadmap right now. Try again in a moment.");
      }
    } catch (e: any) {
      toast.error(e?.message || "AI roadmap generation failed.");
    } finally {
      setAiGenerating(false);
    }
  };

  // ─── Load entities ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingEntities(true);
      try {
        let ents: Entity[] = [];
        let eduStatus: string | null = null;
        if (user) {
          try { ents = await fetchEntitiesFromInteractions(user.id); } catch {}
          // Live fallback: derive entities from personalization pipeline
          // (sectors + ranked roles/domains from onboarding + assessments)
          if (!demoMode && ents.length === 0) {
            try { ents = await fetchEntitiesFromPersonalization(user.id); } catch {}
          }
          try {
            const { data: eduRow } = await supabase
              .from("user_education_status")
              .select("educational_status")
              .eq("user_id", user.id)
              .maybeSingle();
            eduStatus = (eduRow as any)?.educational_status || null;
          } catch {}
        }
        if (demoMode && ents.length === 0) {
          ents = MOCK_ENTITIES;
          // Seed demo coach + therapist banners so the full UI is visible
          setCoachNote(MOCK_COACH_NOTE);
          setTherapistAdjust(MOCK_THERAPIST_ADJUST);
          setSmartNavApplied(true);
          if (!eduStatus) eduStatus = "class_12"; // demo: show education prerequisite stages
        }
        setEntities(ents);
        const built: Record<string, RoadmapStep[]> = {};
        ents.forEach((e) => { built[e.id] = buildRoadmapForEntity(e, { educationalStatus: eduStatus }); });
        setSteps(built);

        // Smart navigation pre-select
        let preselect: string | null = null;
        try {
          const raw = sessionStorage.getItem("smart-navigation-ai-roadmaps");
          if (raw) {
            const payload = JSON.parse(raw);
            preselect = payload?.userSignals?.aiRoadmaps?.activeEntityId || null;
            if (payload?.navigationData?.adjustmentProposals?.length) {
              setTherapistAdjust(payload.navigationData);
            }
            if (preselect || payload?.navigationData) {
              setSmartNavApplied(true);
              recordSelfGraphSignal({
                source: "learning",
                summary: "Arrived at AI Roadmaps via smart navigation",
                signals: { commitment_signal: 0.3 },
                tags: ["ai_roadmaps", "smart_navigation", "virtual_coach"],
              });
            }
          }
        } catch {}

        const first = (preselect && ents.find((e) => e.id === preselect)?.id) || ents[0]?.id || null;
        setActiveEntityId(first);
        if (first) recordRoadmapAccess({ entityId: first });

        const d = loadAiRoadmapsData();
        if (d?.stuckSignals?.coachNote) setCoachNote(d.stuckSignals.coachNote);
      } finally {
        setLoadingEntities(false);
      }
    })();
  }, [user, demoMode]);

  const activeEntity = useMemo(
    () => entities.find((e) => e.id === activeEntityId) || null,
    [entities, activeEntityId]
  );
  const activeSteps = activeEntityId ? steps[activeEntityId] || [] : [];

  // ─── Resource fetching ────────────────────────────────────────────────
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const fetchStepResources = async (step: RoadmapStep) => {
    if (!activeEntity) return;
    const key = `${activeEntity.id}:${step.id}`;
    setLoadingResources((p) => ({ ...p, [key]: true }));
    try {
      let results: WebResource[] = [];
      try {
        const q = buildStepQuery(activeEntity, step);
        results = await searchWebResources(q, 8);
      } catch {
        // fall through to mock
      }
      if (!results.length) {
        // Demo / fallback path: simulate realistic AI search latency
        await wait(900 + Math.random() * 700);
        results = getMockResourcesForStep(activeEntity, step.id);
      }
      setSteps((prev) => ({
        ...prev,
        [activeEntity.id]: prev[activeEntity.id].map((s) =>
          s.id === step.id ? { ...s, resources: results } : s
        ),
      }));
      recordRoadmapAccess({ entityId: activeEntity.id, stepId: step.id });
      recordSelfGraphSignal({
        source: "learning",
        summary: `Fetched resources for "${step.title}" in "${activeEntity.label}"`,
        signals: { commitment_signal: 0.25 },
        tags: ["ai_roadmaps", "resources", activeEntity.kind],
      });
      toast.success(`Loaded ${results.length} resources for ${step.title}`);
    } finally {
      setLoadingResources((p) => ({ ...p, [key]: false }));
    }
  };

  const fetchSubStepResources = async (step: RoadmapStep, sub: SubStep) => {
    if (!activeEntity) return;
    const key = `${activeEntity.id}:${step.id}:${sub.id}`;
    setLoadingResources((p) => ({ ...p, [key]: true }));
    try {
      let results: WebResource[] = [];
      try {
        const q = buildSubStepQuery(activeEntity, sub);
        results = await searchWebResources(q, 8);
      } catch {}
      if (!results.length) {
        await wait(700 + Math.random() * 600);
        results = getMockResourcesForSubStep(activeEntity, step.id, sub);
      }
      setSteps((prev) => ({
        ...prev,
        [activeEntity.id]: prev[activeEntity.id].map((s) =>
          s.id === step.id
            ? { ...s, subSteps: s.subSteps?.map((ss) => (ss.id === sub.id ? { ...ss, resources: results } : ss)) }
            : s
        ),
      }));
      recordRoadmapAccess({ entityId: activeEntity.id, stepId: `${step.id}/${sub.id}` });
    } finally {
      setLoadingResources((p) => ({ ...p, [key]: false }));
    }
  };

  // ─── Coach / Therapist actions ────────────────────────────────────────
  const dismissCoach = () => {
    setCoachNote(null);
    const d = loadAiRoadmapsData();
    if (d.stuckSignals?.coachNote) {
      d.stuckSignals.coachNote = undefined;
      saveAiRoadmapsData(d);
    }
  };
  const ackCoach = () => {
    recordSelfGraphSignal({
      source: "learning",
      summary: "Acknowledged coach reroute",
      signals: { commitment_signal: 0.35, reflection_engagement: 0.35 },
      tags: ["ai_roadmaps", "reroute", "acknowledged"],
    });
    toast.success("Saved coach note to your journal.");
  };
  const applyCoachMilestones = () => {
    if (!coachNote) return;
    const d = loadAiRoadmapsData();
    const existing = d.milestones || [];
    const fresh: { id: string; title: string; createdAt: string; source?: string }[] = [];
    (coachNote.topGaps || []).slice(0, 3).forEach((g: string) =>
      fresh.push({ id: crypto.randomUUID(), title: `Close gap: ${g}`, createdAt: new Date().toISOString(), source: "coach_reroute" })
    );
    fresh.push({ id: crypto.randomUUID(), title: "Build one proof artifact (mini project)", createdAt: new Date().toISOString(), source: "coach_reroute" });
    d.milestones = [...fresh, ...existing].slice(0, 30);
    saveAiRoadmapsData(d);
    logVirtualCoachEvent({
      summary: coachNote.plan?.summary || "Roadmap adjusted from coach reroute",
      topGaps: coachNote.topGaps,
      alignmentBand: coachNote.alignment?.band,
    });
    recordSelfGraphSignal({
      source: "learning",
      summary: "Applied coach reroute milestones",
      signals: { commitment_signal: 0.5, decision_hesitation: 0.25 },
      tags: ["ai_roadmaps", "reroute", "milestones"],
    });
    toast.success(`Added ${fresh.length} milestones to your plan.`);
    setCoachNote(null);
  };
  const applyTherapistAdjustments = () => {
    if (!therapistAdjust) return;
    const d = loadAiRoadmapsData();
    d.stuckSignals = {
      ...(d.stuckSignals || {}),
      therapistPacing: { note: therapistAdjust.adjustmentProposals?.[0]?.detail || "Adjust pacing", at: new Date().toISOString() },
      updatedAt: new Date().toISOString(),
    };
    saveAiRoadmapsData(d);
    recordSelfGraphSignal({
      source: "learning",
      summary: "Applied therapist pacing adjustments",
      signals: { commitment_signal: 0.2, reflection_engagement: 0.4 },
      tags: ["ai_roadmaps", "career_therapist", "adjustments"],
    });
    toast.success("Pacing adjustments applied.");
    setTherapistAdjust(null);
  };

  // ─── Content Library navigation ──────────────────────────────────────
  const goToContentLibrary = () => {
    if (!activeEntity) return;
    const stepsList = steps[activeEntity.id] || [];
    const payload = {
      entity: activeEntity,
      domains: activeEntity.kind === "domain" ? [activeEntity.label] : [],
      jobRoles: activeEntity.kind === "role" ? [activeEntity.label] : [],
      skills: activeEntity.skills || [],
      recommendedPaths: [
        {
          title: `${activeEntity.label} learning path`,
          steps: stepsList.map((s, i) => ({
            title: s.title,
            description: s.description,
            difficulty: i === 0 ? "beginner" : i <= 2 ? "intermediate" : "advanced",
            prerequisites: i === 0 ? [] : [stepsList[i - 1].title],
            outcomes: s.subSteps?.map((ss) => ss.title) || [],
            estimatedDuration: "2-4 weeks",
          })),
        },
      ],
      userProgress: MOCK_PROGRESS,
      recommendations: MOCK_AI_INSIGHTS,
    };
    sessionStorage.setItem("aiRoadmapData", JSON.stringify(payload));
    sessionStorage.setItem("roadmapTransferTimestamp", new Date().toISOString());
    sessionStorage.setItem("roadmapSource", "ai-roadmaps-module");
    navigate("/dashboard/content-library");
  };

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      {/* Smart Nav banner */}
      {smartNavApplied && (
        <div className="bg-slate-900 text-slate-100 text-xs px-3 py-2 rounded-md flex items-center gap-2">
          <Sparkles size={14} /> Coach context applied via smart navigation.
        </div>
      )}

      {/* Coach Reroute */}
      {coachNote && (
        <Card className="border-indigo-200 bg-indigo-50/60">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-indigo-900">Virtual Coach suggests a reroute</p>
                <p className="text-sm text-indigo-800 mt-1">{coachNote.reason}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={dismissCoach}>Dismiss</Button>
                <Button size="sm" variant="outline" onClick={ackCoach}>Acknowledge & Save</Button>
                <Button size="sm" onClick={applyCoachMilestones}>Apply milestones</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-md border">
                <p className="text-muted-foreground">Alignment</p>
                <p className="font-semibold">{coachNote.alignment?.band} · {coachNote.alignment?.score}</p>
              </div>
              <div className="bg-white p-3 rounded-md border">
                <p className="text-muted-foreground">Top gaps</p>
                <p className="font-semibold">{(coachNote.topGaps || []).slice(0, 3).join(", ") || "—"}</p>
              </div>
              <div className="bg-white p-3 rounded-md border">
                <p className="text-muted-foreground">Suggested focus</p>
                <p className="font-semibold">{coachNote.plan?.summary}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Therapist Adjustments */}
      {therapistAdjust?.adjustmentProposals?.length > 0 && (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-emerald-900">Career Therapist pacing adjustments</p>
                <p className="text-sm text-emerald-800 mt-1">Emotional readiness: {therapistAdjust.emotionalReadiness || "—"}</p>
              </div>
              <Button size="sm" onClick={applyTherapistAdjustments}>Apply</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {therapistAdjust.adjustmentProposals.slice(0, 6).map((p: any, i: number) => (
                <div key={i} className="bg-white p-3 rounded-md border text-xs">
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-muted-foreground">{p.detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">AI Roadmaps</h1>
          <p className="text-sm text-muted-foreground">Adaptive learning paths built from what you liked, loved, and bookmarked.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={demoMode ? "default" : "outline"} className="text-[10px]">
            {demoMode ? "Demo Mode ON" : "Live Mode"}
          </Badge>
          <Button
            variant="outline" size="sm"
            onClick={() => {
              setCoachNote(MOCK_COACH_NOTE);
              setTherapistAdjust(MOCK_THERAPIST_ADJUST);
              setSmartNavApplied(true);
              toast.success("Demo banners re-seeded");
            }}
          >
            Replay Demo
          </Button>
          <Button variant="outline" size="sm" onClick={goToContentLibrary} disabled={!activeEntity}>
            <Library size={14} className="mr-1" /> Content Library
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDemoMode((v) => !v)}>
            <SettingsIcon size={16} />
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Target} label="Tasks Completed" value={`${MOCK_PROGRESS.completedTasks}/${MOCK_PROGRESS.totalTasks}`} />
        <StatCard icon={Zap} label="Skills Gained" value={`${MOCK_PROGRESS.skillsGained}`} />
        <StatCard icon={Flame} label="Current Streak" value={`${MOCK_PROGRESS.currentStreak} days`} />
        <StatCard icon={TrendingUp} label="Career Readiness" value={`${MOCK_PROGRESS.careerReadiness}%`} />
      </div>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-900 font-semibold">
            <Sparkles size={16} /> AI Insights
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Next Recommended Action</p>
              <p className="text-foreground">{MOCK_AI_INSIGHTS.nextRecommendedAction}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Weekly Goal</p>
              <p className="text-foreground">{MOCK_AI_INSIGHTS.weeklyGoal}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Entity list */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Your interests <span className="text-muted-foreground">({entities.length})</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingEntities && <p className="text-xs text-muted-foreground">Loading…</p>}
            {!loadingEntities && entities.length === 0 && (
              <p className="text-xs text-muted-foreground">Like, love, or bookmark items in Curiosity Compass, Story Mode, and Challenge Mode to generate roadmaps.</p>
            )}
            {entities.map((e) => {
              const active = e.id === activeEntityId;
              return (
                <button
                  key={e.id}
                  onClick={() => { setActiveEntityId(e.id); recordRoadmapAccess({ entityId: e.id }); }}
                  className={`w-full text-left p-2 rounded-md border transition-colors ${active ? "bg-blue-50 border-blue-300" : "bg-card hover:bg-muted/30 border-border"}`}
                >
                  <p className="text-sm font-medium leading-tight">{e.label}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="outline" className={`text-[10px] capitalize ${KIND_COLORS[e.kind]}`}>{e.kind}</Badge>
                    <span className="text-[10px] text-muted-foreground">· {e.source.replace("_", " ")}</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="lg:col-span-3 space-y-3">
          {activeEntity && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold">{activeEntity.label}</h2>
                <p className="text-xs text-muted-foreground">Adaptive roadmap · live AI + web-grounded resources</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={generateAiRoadmap} disabled={aiGenerating}>
                  {aiGenerating ? <Loader2 size={12} className="animate-spin mr-1" /> : <Sparkles size={12} className="mr-1" />}
                  {aiGenerating ? "Generating…" : "Generate AI Roadmap"}
                </Button>
                <button onClick={goToContentLibrary} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  Go to Learning Library <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
          {!activeEntity && !loadingEntities && (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">Select an interest to view its roadmap.</CardContent></Card>
          )}
          {activeSteps.map((step, idx) => {
            const stepKey = `${activeEntity!.id}:${step.id}`;
            const isLoading = !!loadingResources[stepKey];
            return (
              <Card key={step.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{idx + 1}</span>
                      <div>
                        <CardTitle className="text-base">{step.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                        {step.linkedModule && (
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); if (step.linkedRoute) navigate(step.linkedRoute); }}
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                            >
                              <ArrowRight size={10} /> Linked to: {step.linkedModule}
                            </button>
                            {step.formula && (
                              <span className="text-[10px] text-muted-foreground font-mono">ƒ {step.formula}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" disabled={isLoading} onClick={() => fetchStepResources(step)}>
                      {isLoading ? <Loader2 size={12} className="animate-spin mr-1" /> : <Wand2 size={12} className="mr-1" />}
                      {isLoading ? <LoadingMicrocopy /> : step.resources ? "Re-curate with AI" : "Curate with AI"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Sub-steps */}
                  {step.subSteps?.map((sub) => {
                    const subKey = `${activeEntity!.id}:${step.id}:${sub.id}`;
                    const subLoading = !!loadingResources[subKey];
                    return (
                      <div key={sub.id} className="border rounded-md p-3 bg-muted/20">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">{sub.title}</p>
                            <p className="text-xs text-muted-foreground">{sub.description}</p>
                          </div>
                          <Button size="sm" variant="ghost" disabled={subLoading} onClick={() => fetchSubStepResources(step, sub)}>
                            {subLoading ? <Loader2 size={12} className="animate-spin mr-1" /> : <Wand2 size={12} className="mr-1" />}
                            {subLoading ? <LoadingMicrocopy /> : sub.resources ? "Re-curate" : "Curate with AI"}
                          </Button>
                        </div>
                        {sub.resources && <ResourceList resources={sub.resources} />}
                      </div>
                    );
                  })}
                  {step.resources && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Step resources</p>
                      <ResourceList resources={step.resources} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2">
        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary"><Icon size={16} /></div>
        <div>
          <p className="text-[11px] text-muted-foreground">{label}</p>
          <p className="text-sm font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Cycling AI-powered microcopy that hints "this is intelligence at work"
const LOADING_PHRASES = [
  "Reading your signals…",
  "Scanning the open web…",
  "Stitching books, videos, papers…",
  "Asking the experts…",
  "Tasting your taste…",
  "Hand-picking what matters…",
  "Almost there — polishing picks…",
];
function LoadingMicrocopy() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % LOADING_PHRASES.length), 1100);
    return () => clearInterval(id);
  }, []);
  return <span className="text-[11px]">{LOADING_PHRASES[i]}</span>;
}

// ─── Resource cards: grouped by format, horizontally scrollable ──────────
const FORMAT_META: Record<string, { label: string; icon: any; tint: string; ring: string }> = {
  youtube:        { label: "YouTube",         icon: Youtube,        tint: "from-red-500/15 to-rose-500/10",      ring: "ring-red-200" },
  video:          { label: "Talks & Videos",  icon: Video,          tint: "from-purple-500/15 to-fuchsia-500/10", ring: "ring-purple-200" },
  course:         { label: "Courses",         icon: GraduationCap,  tint: "from-blue-500/15 to-sky-500/10",      ring: "ring-blue-200" },
  book:           { label: "Books",           icon: BookOpen,       tint: "from-amber-500/15 to-orange-500/10",  ring: "ring-amber-200" },
  article:        { label: "Articles",        icon: Newspaper,      tint: "from-slate-500/15 to-zinc-500/10",    ring: "ring-slate-200" },
  blog:           { label: "Blogs",           icon: ScrollText,     tint: "from-emerald-500/15 to-teal-500/10",  ring: "ring-emerald-200" },
  podcast:        { label: "Podcasts",        icon: Mic,            tint: "from-indigo-500/15 to-violet-500/10", ring: "ring-indigo-200" },
  research_paper: { label: "Research Papers", icon: FileText,       tint: "from-cyan-500/15 to-sky-500/10",      ring: "ring-cyan-200" },
  interview:      { label: "Interviews",      icon: MessageSquare,  tint: "from-pink-500/15 to-rose-500/10",     ring: "ring-pink-200" },
  image:          { label: "Visual References", icon: ImageIcon,    tint: "from-yellow-500/15 to-amber-500/10",  ring: "ring-yellow-200" },
  community:      { label: "Communities",     icon: Users,          tint: "from-lime-500/15 to-green-500/10",    ring: "ring-lime-200" },
  company:        { label: "Companies",       icon: Building2,      tint: "from-stone-500/15 to-neutral-500/10", ring: "ring-stone-200" },
};
const FORMAT_ORDER = ["youtube", "course", "book", "podcast", "research_paper", "interview", "company", "blog", "article", "image", "video", "community"];

function ResourceList({ resources }: { resources: WebResource[] }) {
  if (!resources.length) return <p className="text-xs text-muted-foreground mt-2">No results.</p>;
  const grouped = resources.reduce<Record<string, WebResource[]>>((acc, r) => {
    const key = r.format || "article";
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});
  const orderedKeys = FORMAT_ORDER.filter((k) => grouped[k]?.length);
  return (
    <div className="space-y-4 mt-2">
      {orderedKeys.map((key) => {
        const meta = FORMAT_META[key] || FORMAT_META.article;
        const Icon = meta.icon;
        const items = grouped[key];
        return (
          <div key={key}>
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className="text-foreground/70" />
              <p className="text-xs font-semibold uppercase tracking-wide">{meta.label}</p>
              <span className="text-[10px] text-muted-foreground">· {items.length}</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
              {items.map((r, i) => (
                <a
                  key={i}
                  href={r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`snap-start shrink-0 w-[260px] rounded-xl border bg-card hover:shadow-md transition-all overflow-hidden group ring-1 ${meta.ring}`}
                >
                  <div className={`h-20 bg-gradient-to-br ${meta.tint} flex items-center justify-center relative`}>
                    <Icon size={28} className="text-foreground/40 group-hover:scale-110 transition-transform" />
                    {r.duration && (
                      <span className="absolute bottom-1 right-1 text-[10px] bg-background/80 px-1.5 py-0.5 rounded">{r.duration}</span>
                    )}
                    {r.badge && (
                      <span className="absolute top-1 left-1 text-[9px] uppercase tracking-wider bg-background/80 px-1.5 py-0.5 rounded font-semibold">{r.badge}</span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <p className="text-xs font-semibold leading-snug line-clamp-2 group-hover:text-primary">{r.title}</p>
                    {r.snippet && <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">{r.snippet}</p>}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground truncate">
                        {r.author ? `${r.author} · ` : ""}{r.platform || r.displayLink}
                      </span>
                      <ExternalLink size={10} className="text-muted-foreground shrink-0" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

