import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
} from "@/lib/aiRoadmaps";
import {
  MOCK_ENTITIES, MOCK_COACH_NOTE, MOCK_THERAPIST_ADJUST,
  getMockResourcesForStep, getMockResourcesForSubStep,
} from "@/lib/aiRoadmapsMock";

// Demo mode: when ON, mock entities, resources, coach + therapist banners
// are seeded so the entire AI Roadmaps experience works end-to-end for
// presentations even without real backend signals. Toggle via UI button.
const DEMO_MODE_DEFAULT = true;

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

  // ─── Load entities ────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setLoadingEntities(true);
      try {
        let ents: Entity[] = [];
        if (user) {
          try { ents = await fetchEntitiesFromInteractions(user.id); } catch {}
        }
        if (demoMode && ents.length === 0) {
          ents = MOCK_ENTITIES;
          // Seed demo coach + therapist banners so the full UI is visible
          setCoachNote(MOCK_COACH_NOTE);
          setTherapistAdjust(MOCK_THERAPIST_ADJUST);
          setSmartNavApplied(true);
        }
        setEntities(ents);
        const built: Record<string, RoadmapStep[]> = {};
        ents.forEach((e) => { built[e.id] = buildRoadmapForEntity(e); });
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{activeEntity.label}</h2>
                <p className="text-xs text-muted-foreground">5-stage adaptive roadmap</p>
              </div>
              <button onClick={goToContentLibrary} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                Go to Learning Library <ArrowRight size={12} />
              </button>
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
                      </div>
                    </div>
                    <Button size="sm" variant="outline" disabled={isLoading} onClick={() => fetchStepResources(step)}>
                      {isLoading ? <Loader2 size={12} className="animate-spin mr-1" /> : <RefreshCw size={12} className="mr-1" />}
                      {step.resources ? "Refresh Resources" : "Get Resources"}
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
                            {subLoading ? <Loader2 size={12} className="animate-spin mr-1" /> : <BookOpen size={12} className="mr-1" />}
                            {sub.resources ? "Refresh" : "Get Resources"}
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

function ResourceList({ resources }: { resources: WebResource[] }) {
  if (!resources.length) return <p className="text-xs text-muted-foreground mt-2">No results.</p>;
  return (
    <ul className="space-y-2 mt-2">
      {resources.map((r, i) => (
        <li key={i} className="text-xs">
          <a href={r.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1">
            {r.title} <ExternalLink size={10} />
          </a>
          {r.displayLink && <span className="text-muted-foreground"> · {r.displayLink}</span>}
          {r.snippet && <p className="text-muted-foreground mt-0.5 leading-snug">{r.snippet}</p>}
        </li>
      ))}
    </ul>
  );
}
