import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw, Brain, FileText, Zap, GitBranch, BarChart3, Shield, Map,
  Users, Heart, ArrowRight, Loader2, ChevronRight, AlertTriangle,
  CheckCircle2, Clock, DollarSign, Sparkles, Target, Lightbulb, Pause,
  Compass, BookOpen, MessageCircle, Award, TrendingUp, Link2
} from "lucide-react";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";

type Plan = {
  id: string;
  status: string;
  reality_mapping: any;
  readiness_assessment: any;
  readiness_level: string | null;
  timeline_insights: any;
  transferable_skills: any;
  current_pain_points: string[];
  created_at: string;
};

type ParallelPath = {
  id: string;
  plan_id: string;
  path_type: string;
  title: string;
  description: string | null;
  time_required: string | null;
  skills_needed: string[];
  bridge_skills: string[];
  income_risk: string | null;
  lifestyle_impact: string | null;
  demand_data: any;
  roadmap_steps: any;
  is_selected: boolean;
};

const PAIN_PROMPTS = [
  "What feels off right now?",
  "Which parts of your current role drain you?",
  "What do you not want to repeat in your next phase?",
  "What would an ideal workday look like?",
  "When did you last feel truly engaged at work?",
];

const STEPS = [
  { key: "reality", label: "Reality Map", icon: Brain },
  { key: "timeline", label: "Timeline", icon: FileText },
  { key: "readiness", label: "Readiness", icon: Target },
  { key: "paths", label: "Paths", icon: GitBranch },
  { key: "skills", label: "Skill Bridge", icon: Zap },
  { key: "demand", label: "Demand", icon: BarChart3 },
  { key: "roadmap", label: "Roadmap", icon: Map },
  { key: "support", label: "Support", icon: Heart },
  { key: "connect", label: "Connect", icon: Link2 },
];

export default function TransitionPlanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("reality");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [paths, setPaths] = useState<ParallelPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const [painAnswers, setPainAnswers] = useState<string[]>(PAIN_PROMPTS.map(() => ""));
  const [realityResult, setRealityResult] = useState<any>(null);
  const [readinessInputs, setReadinessInputs] = useState({ time: 50, financial: 50, emotional: 50, learning: 50 });
  const [readinessResult, setReadinessResult] = useState<any>(null);
  const [timelineResult, setTimelineResult] = useState<any>(null);
  const [pathsResult, setPathsResult] = useState<any>(null);
  const [selectedPathIdx, setSelectedPathIdx] = useState(0);
  const [skillBridgeResult, setSkillBridgeResult] = useState<any>(null);
  const [demandResult, setDemandResult] = useState<any>(null);
  const [roadmapResult, setRoadmapResult] = useState<any>(null);
  const [emotionalResult, setEmotionalResult] = useState<any>(null);
  const [emotionalInput, setEmotionalInput] = useState("");
  const [communityResult, setCommunityResult] = useState<any>(null);
  const [progressResult, setProgressResult] = useState<any>(null);

  const completedSteps = useMemo(() => {
    const done: string[] = [];
    if (realityResult) done.push("reality");
    if (timelineResult) done.push("timeline");
    if (readinessResult) done.push("readiness");
    if (pathsResult?.paths?.length) done.push("paths");
    if (skillBridgeResult) done.push("skills");
    if (demandResult) done.push("demand");
    if (roadmapResult) done.push("roadmap");
    if (emotionalResult) done.push("support");
    return done;
  }, [realityResult, timelineResult, readinessResult, pathsResult, skillBridgeResult, demandResult, roadmapResult, emotionalResult]);

  const progressPct = Math.round((completedSteps.length / 8) * 100);

  useEffect(() => {
    if (user) loadPlan();
  }, [user]);

  // Award badges at milestones
  useEffect(() => {
    if (!user || completedSteps.length === 0) return;
    const milestones: Record<number, string> = {
      3: "Transition Explorer",
      5: "Path Navigator",
      8: "Transition Master",
    };
    const badge = milestones[completedSteps.length];
    if (badge) {
      supabase.from("achievements").insert({
        user_id: user.id,
        title: badge,
        achievement_type: "transition",
        description: `Completed ${completedSteps.length} transition planning steps`,
        points: completedSteps.length * 15,
      }).then(() => {
        toast({ title: `🏆 Badge unlocked: ${badge}!` });
      });
    }
  }, [completedSteps.length]);

  const loadPlan = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("transition_plans")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (data && data.length > 0) {
      const p = data[0] as any as Plan;
      setPlan(p);
      if (p.reality_mapping && Object.keys(p.reality_mapping).length > 0) setRealityResult(p.reality_mapping);
      if (p.readiness_assessment && Object.keys(p.readiness_assessment).length > 0) setReadinessResult(p.readiness_assessment);
      if (p.timeline_insights && Object.keys(p.timeline_insights).length > 0) setTimelineResult(p.timeline_insights);
      const { data: pathData } = await supabase.from("transition_paths").select("*").eq("plan_id", p.id);
      if (pathData) setPaths(pathData as any as ParallelPath[]);
    }
    setLoading(false);
  };

  const createOrGetPlan = async (): Promise<string> => {
    if (plan) return plan.id;
    const { data, error } = await supabase
      .from("transition_plans")
      .insert({ user_id: user!.id, status: "active" })
      .select()
      .single();
    if (error) throw error;
    const newPlan = data as any as Plan;
    setPlan(newPlan);
    return newPlan.id;
  };

  const callAI = async (type: string, context: any) => {
    const { data, error } = await supabase.functions.invoke("transition-planner-ai", {
      body: { type, context },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const syncToJournal = async (title: string, content: string, tags: string[]) => {
    if (!user) return;
    await supabase.from("journal_entries").insert({
      user_id: user.id,
      title,
      content,
      tags: ["transition", ...tags],
      mood: "reflective",
    });
  };

  // Step 1: Reality Mapping
  const submitRealityMapping = async () => {
    if (painAnswers.every(a => !a.trim())) return toast({ title: "Please answer at least one question", variant: "destructive" });
    setAiLoading(true);
    try {
      const context = {
        responses: PAIN_PROMPTS.map((q, i) => ({ question: q, answer: painAnswers[i] })).filter(r => r.answer.trim()),
      };
      const result = await callAI("reality_mapping", context);
      setRealityResult(result);
      const planId = await createOrGetPlan();
      await supabase.from("transition_plans").update({
        reality_mapping: result,
        current_pain_points: painAnswers.filter(a => a.trim()),
      } as any).eq("id", planId);
      await syncToJournal("Transition: Reality Mapping", `Patterns: ${result.patterns?.map((p: any) => p.observation).join("; ")}`, ["reality-mapping"]);
      toast({ title: "Reality map created ✨" });
    } catch (e: any) {
      toast({ title: e.message || "Failed to analyze", variant: "destructive" });
    }
    setAiLoading(false);
  };

  // Step 2: Career Timeline
  const analyzeTimeline = async () => {
    setAiLoading(true);
    try {
      const { data: experiences } = await supabase.from("experiences").select("*").eq("user_id", user!.id);
      const { data: skills } = await supabase.from("skills" as any).select("*").eq("user_id", user!.id);
      const context = { experiences: experiences || [], skills: skills || [], pain_points: plan?.current_pain_points || [] };
      const result = await callAI("career_timeline", context);
      setTimelineResult(result);
      if (plan) {
        await supabase.from("transition_plans").update({
          timeline_insights: result,
          transferable_skills: result.transferable_strengths || [],
        } as any).eq("id", plan.id);
      }
      toast({ title: "Timeline analyzed 📊" });
    } catch (e: any) {
      toast({ title: e.message || "Failed to analyze timeline", variant: "destructive" });
    }
    setAiLoading(false);
  };

  // Step 3: Readiness Check
  const checkReadiness = async () => {
    setAiLoading(true);
    try {
      const context = {
        time_availability: readinessInputs.time,
        financial_tolerance: readinessInputs.financial,
        emotional_bandwidth: readinessInputs.emotional,
        learning_stamina: readinessInputs.learning,
        pain_points: plan?.current_pain_points || [],
      };
      const result = await callAI("readiness_check", context);
      setReadinessResult(result);
      if (plan) {
        await supabase.from("transition_plans").update({
          readiness_assessment: result,
          readiness_level: result.readiness_level,
        } as any).eq("id", plan.id);
      }
      toast({ title: "Readiness assessed 🎯" });
    } catch (e: any) {
      toast({ title: e.message || "Failed to check readiness", variant: "destructive" });
    }
    setAiLoading(false);
  };

  // Step 4: Parallel Paths
  const generatePaths = async () => {
    setAiLoading(true);
    try {
      const { data: skills } = await supabase.from("skills" as any).select("*").eq("user_id", user!.id);
      const { data: interests } = await supabase.from("interests").select("*").eq("user_id", user!.id);
      const context = {
        skills: skills || [],
        interests: interests || [],
        readiness_level: readinessResult?.readiness_level || plan?.readiness_level || "medium-risk",
        transferable_strengths: timelineResult?.transferable_strengths || plan?.transferable_skills || [],
        pain_points: plan?.current_pain_points || [],
      };
      const result = await callAI("parallel_paths", context);
      setPathsResult(result);
      if (plan && result.paths) {
        for (const p of result.paths) {
          await supabase.from("transition_paths").insert({
            plan_id: plan.id,
            user_id: user!.id,
            path_type: p.type || "pivot",
            title: p.title,
            description: p.description,
            time_required: p.time_required,
            skills_needed: p.skills_needed || [],
            bridge_skills: p.bridge_skills || [],
            income_risk: p.income_risk,
            lifestyle_impact: p.lifestyle_impact,
          } as any);
        }
        const { data: pathData } = await supabase.from("transition_paths").select("*").eq("plan_id", plan.id);
        if (pathData) setPaths(pathData as any as ParallelPath[]);
      }
      toast({ title: "Parallel paths generated 🔀" });
    } catch (e: any) {
      toast({ title: e.message || "Failed to generate paths", variant: "destructive" });
    }
    setAiLoading(false);
  };

  // Step 5: Skill Bridge
  const analyzeSkillBridge = async () => {
    const targetPath = pathsResult?.paths?.[selectedPathIdx];
    if (!targetPath) return toast({ title: "Select a path first", variant: "destructive" });
    setAiLoading(true);
    try {
      const { data: skills } = await supabase.from("skills" as any).select("*").eq("user_id", user!.id);
      const context = { current_skills: skills || [], target_path: targetPath, transferable: timelineResult?.transferable_strengths || [] };
      const result = await callAI("skill_bridge", context);
      setSkillBridgeResult(result);
      toast({ title: "Skill bridge mapped 🌉" });
    } catch (e: any) {
      toast({ title: e.message || "Failed to map skills", variant: "destructive" });
    }
    setAiLoading(false);
  };

  // Step 6: Demand Check
  const checkDemand = async () => {
    const targetPath = pathsResult?.paths?.[selectedPathIdx];
    if (!targetPath) return toast({ title: "Select a path first", variant: "destructive" });
    setAiLoading(true);
    try {
      const context = { target_path: targetPath, readiness: readinessResult?.readiness_level };
      const result = await callAI("demand_check", context);
      setDemandResult(result);
      toast({ title: "Market reality checked 📈" });
    } catch (e: any) {
      toast({ title: e.message || "Failed to check demand", variant: "destructive" });
    }
    setAiLoading(false);
  };

  // Step 7: Roadmap
  const generateRoadmap = async () => {
    const targetPath = pathsResult?.paths?.[selectedPathIdx];
    if (!targetPath) return toast({ title: "Select a path first", variant: "destructive" });
    setAiLoading(true);
    try {
      const context = {
        target_path: targetPath,
        readiness: readinessResult,
        skill_bridge: skillBridgeResult,
        demand: demandResult,
      };
      const result = await callAI("transition_roadmap", context);
      setRoadmapResult(result);
      await syncToJournal("Transition Roadmap Created", `Path: ${targetPath.title}\nTimeline: ${result.total_timeline}\nStages: ${result.stages?.length}`, ["roadmap"]);
      toast({ title: "Transition roadmap created 🗺️" });
    } catch (e: any) {
      toast({ title: e.message || "Failed to create roadmap", variant: "destructive" });
    }
    setAiLoading(false);
  };

  // Emotional Support
  const getEmotionalSupport = async () => {
    if (!emotionalInput.trim()) return;
    setAiLoading(true);
    try {
      const context = { feeling: emotionalInput, readiness: readinessResult?.readiness_level, stage: tab };
      const result = await callAI("emotional_support", context);
      setEmotionalResult(result);
      if (plan) {
        await supabase.from("transition_reflections").insert({
          user_id: user!.id,
          plan_id: plan.id,
          reflection_type: "emotional",
          content: emotionalInput,
          ai_response: result,
          mood: "processing",
        });
      }
      await syncToJournal("Transition: Emotional Reflection", `Feeling: ${emotionalInput}\n\nValidation: ${result.validation}\nReframe: ${result.reframe}`, ["emotional", "support"]);
    } catch (e: any) {
      toast({ title: e.message || "Failed to get support", variant: "destructive" });
    }
    setAiLoading(false);
  };

  // Community Anchoring
  const getCommunityAnchoring = async () => {
    setAiLoading(true);
    try {
      const context = {
        pain_points: plan?.current_pain_points || [],
        target_paths: pathsResult?.paths?.map((p: any) => p.title) || [],
        transferable_skills: timelineResult?.transferable_strengths?.map((s: any) => s.skill) || [],
        readiness_level: readinessResult?.readiness_level,
      };
      const result = await callAI("community_anchoring", context);
      setCommunityResult(result);
    } catch (e: any) {
      toast({ title: e.message || "Failed to load community suggestions", variant: "destructive" });
    }
    setAiLoading(false);
  };

  // Progress Summary
  const getProgressSummary = async () => {
    setAiLoading(true);
    try {
      const context = {
        completed_steps: completedSteps,
        reality_mapping: realityResult,
        readiness: readinessResult,
        paths: pathsResult?.paths,
        skill_bridge: skillBridgeResult,
        demand: demandResult,
        roadmap: roadmapResult,
      };
      const result = await callAI("progress_summary", context);
      setProgressResult(result);
    } catch (e: any) {
      toast({ title: e.message || "Failed to get summary", variant: "destructive" });
    }
    setAiLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const riskColor = (risk: string) => {
    if (risk === "low" || risk === "low-risk" || risk === "safe" || risk === "minimal") return "text-emerald-600 bg-emerald-500/10";
    if (risk === "medium" || risk === "medium-risk" || risk === "moderate") return "text-amber-600 bg-amber-500/10";
    return "text-rose-600 bg-rose-500/10";
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/15 via-cyan-500/10 to-blue-500/15 border border-teal-500/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="h-6 w-6 text-teal-500" />
            <span className="text-sm font-medium text-teal-600">Transition Planner</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            You don't have to burn your past to build your future.
          </h1>
          <p className="text-muted-foreground max-w-2xl mb-4">
            Let's redesign your path carefully — without destroying your stability, identity, or confidence.
          </p>

          {/* Progress bar */}
          <div className="max-w-md">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Journey Progress</span>
              <span>{completedSteps.length}/8 steps · {progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2" />
            <div className="flex gap-1 mt-2">
              {STEPS.slice(0, 8).map(s => (
                <div key={s.key} className={`h-1.5 flex-1 rounded-full ${completedSteps.includes(s.key) ? "bg-teal-500" : "bg-muted"}`} />
              ))}
            </div>
          </div>
        </div>
        <ModuleSearchBar
          placeholder="Search career paths, domains to transition into..."
          sources={["careers", "domains", "jobs"]}
          showAiBadge
          onSelect={(item) => {
            toast.info(`Explore transitioning into "${item.title}"`);
          }}
        />
      </motion.div>

      {/* Progress Summary Card */}
      {completedSteps.length >= 3 && (
        <Card className="border-teal-500/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-teal-500" />
                <div>
                  <p className="text-sm font-medium">You've completed {completedSteps.length} steps — great progress!</p>
                  {progressResult?.current_focus && <p className="text-xs text-muted-foreground">{progressResult.current_focus}</p>}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={getProgressSummary} disabled={aiLoading} className="gap-1">
                {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                AI Summary
              </Button>
            </div>
            <AnimatePresence>
              {progressResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3">
                  {progressResult.wins?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {progressResult.wins.map((w: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{w}</Badge>)}
                    </div>
                  )}
                  {progressResult.next_priorities?.length > 0 && (
                    <div className="space-y-1">
                      {progressResult.next_priorities.slice(0, 3).map((p: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <Badge className={p.urgency === "now" ? "bg-teal-500/10 text-teal-700" : "bg-muted text-muted-foreground"}>{p.urgency}</Badge>
                          <span>{p.action}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {progressResult.encouragement && <p className="text-sm italic text-muted-foreground">{progressResult.encouragement}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          {STEPS.map(s => (
            <TabsTrigger key={s.key} value={s.key} className="gap-1 text-xs relative">
              <s.icon className="h-3.5 w-3.5" /> {s.label}
              {completedSteps.includes(s.key) && <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-teal-500" />}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ===== REALITY MAPPING ===== */}
        <TabsContent value="reality" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-teal-500" /> Current Reality Mapping</CardTitle>
              <CardDescription>No tests. No scores. Just honest, grounded reflection. Answer what feels right.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {PAIN_PROMPTS.map((q, i) => (
                <div key={i}>
                  <label className="text-sm font-medium text-foreground">{q}</label>
                  <Textarea
                    value={painAnswers[i]}
                    onChange={e => { const n = [...painAnswers]; n[i] = e.target.value; setPainAnswers(n); }}
                    placeholder="Take your time..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
              ))}
              <Button onClick={submitRealityMapping} disabled={aiLoading} className="gap-2">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Map My Reality
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {realityResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-teal-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Your Reality Map</CardTitle>
                    <CardDescription>{realityResult.affirming_message}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {realityResult.patterns?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Patterns Observed</h4>
                        <div className="space-y-2">
                          {realityResult.patterns.map((p: any, i: number) => (
                            <div key={i} className="p-3 rounded-lg bg-muted">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{p.area}</span>
                                <Badge variant="outline" className="text-xs">{p.emotion}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{p.observation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {realityResult.drift_signals?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Drift Signals</h4>
                        <div className="flex flex-wrap gap-2">
                          {realityResult.drift_signals.map((d: any, i: number) => (
                            <Badge key={i} className={riskColor(d.severity)}>{d.signal}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {realityResult.underlying_needs?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">What You Really Need</h4>
                        <div className="flex flex-wrap gap-2">
                          {realityResult.underlying_needs.map((n: string, i: number) => (
                            <Badge key={i} variant="secondary">{n}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {realityResult.suggested_next && (
                      <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/20">
                        <p className="text-sm flex items-center gap-2"><ArrowRight className="h-4 w-4 text-teal-500" /> <strong>Next:</strong> {realityResult.suggested_next}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ===== TIMELINE ===== */}
        <TabsContent value="timeline" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-teal-500" /> Career Timeline Analysis</CardTitle>
              <CardDescription>We'll scan your experience to find transferable strengths and hidden potential.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={analyzeTimeline} disabled={aiLoading} className="gap-2">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze My Timeline
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {timelineResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {timelineResult.narrative && (
                  <Card className="border-teal-500/20">
                    <CardContent className="pt-6">
                      <p className="text-sm italic text-muted-foreground">{timelineResult.narrative}</p>
                    </CardContent>
                  </Card>
                )}

                {timelineResult.timeline_phases?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Your Career Timeline</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {timelineResult.timeline_phases.map((phase: any, i: number) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                phase.energy_level === "high" ? "bg-emerald-500/20 text-emerald-700" :
                                phase.energy_level === "medium" ? "bg-amber-500/20 text-amber-700" :
                                "bg-rose-500/20 text-rose-700"
                              }`}>{i + 1}</div>
                              {i < timelineResult.timeline_phases.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                            </div>
                            <div className="flex-1 pb-4">
                              <p className="font-medium text-sm">{phase.role}</p>
                              <p className="text-xs text-muted-foreground">{phase.period}</p>
                              <p className="text-sm mt-1">{phase.pattern}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {phase.key_skills?.map((s: string, j: number) => <Badge key={j} variant="outline" className="text-xs">{s}</Badge>)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                  {timelineResult.transferable_strengths?.length > 0 && (
                    <Card className="border-emerald-500/20">
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Transferable</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {timelineResult.transferable_strengths.map((s: any, i: number) => (
                          <div key={i} className="text-xs">
                            <p className="font-medium">{s.skill}</p>
                            <p className="text-muted-foreground">{s.evidence}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {timelineResult.overused_skills?.length > 0 && (
                    <Card className="border-amber-500/20">
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Overused</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {timelineResult.overused_skills.map((s: any, i: number) => (
                          <div key={i} className="text-xs">
                            <p className="font-medium">{s.skill}</p>
                            <p className="text-muted-foreground">{s.risk}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {timelineResult.hidden_potential?.length > 0 && (
                    <Card className="border-purple-500/20">
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lightbulb className="h-4 w-4 text-purple-500" /> Hidden Potential</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {timelineResult.hidden_potential.map((s: any, i: number) => (
                          <div key={i} className="text-xs">
                            <p className="font-medium">{s.skill}</p>
                            <p className="text-muted-foreground">{s.opportunity}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ===== READINESS ===== */}
        <TabsContent value="readiness" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-teal-500" /> Transition Readiness</CardTitle>
              <CardDescription>This isn't about ambition — it's about finding the right pace for you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: "time", label: "Time Availability", icon: Clock, desc: "How much time can you dedicate weekly?" },
                { key: "financial", label: "Financial Comfort", icon: DollarSign, desc: "How comfortable is your financial runway?" },
                { key: "emotional", label: "Emotional Bandwidth", icon: Heart, desc: "How emotionally ready do you feel?" },
                { key: "learning", label: "Learning Stamina", icon: Zap, desc: "How much new learning can you absorb?" },
              ].map(item => (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-muted-foreground" /> {item.label}
                    </label>
                    <span className="text-xs text-muted-foreground">{(readinessInputs as any)[item.key]}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{item.desc}</p>
                  <Slider
                    value={[(readinessInputs as any)[item.key]]}
                    onValueChange={([v]) => setReadinessInputs(p => ({ ...p, [item.key]: v }))}
                    max={100}
                    step={5}
                  />
                </div>
              ))}
              <Button onClick={checkReadiness} disabled={aiLoading} className="gap-2">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Assess My Readiness
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {readinessResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-teal-500/20">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Badge className={`text-sm px-3 py-1 ${riskColor(readinessResult.readiness_level || "medium-risk")}`}>
                        {readinessResult.readiness_level?.replace("-", " ") || "Medium Risk"} transition
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">{readinessResult.message}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {readinessResult.factors && (
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(readinessResult.factors).map(([key, val]: [string, any]) => (
                          <div key={key} className="p-3 rounded-lg bg-muted">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium capitalize">{key}</span>
                              <span className="text-xs text-muted-foreground">{val.score}/100</span>
                            </div>
                            <Progress value={val.score} className="h-1.5 mb-1" />
                            <p className="text-xs text-muted-foreground">{val.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/20">
                      <p className="text-sm"><strong>Recommended pace:</strong> {readinessResult.recommended_pace}</p>
                    </div>
                    {readinessResult.safeguards?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><Shield className="h-4 w-4" /> Safeguards</h4>
                        <ul className="space-y-1">
                          {readinessResult.safeguards.map((s: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-emerald-500 shrink-0" /> {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ===== PARALLEL PATHS ===== */}
        <TabsContent value="paths" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-teal-500" /> Parallel Path Simulator</CardTitle>
              <CardDescription>Explore 2–3 possible futures. No "best path" — just options you can compare safely.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={generatePaths} disabled={aiLoading} className="gap-2">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate My Paths
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {pathsResult?.paths && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {pathsResult.encouragement && (
                  <p className="text-sm text-muted-foreground italic">{pathsResult.encouragement}</p>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pathsResult.paths.map((p: any, i: number) => (
                    <Card key={i} className={`cursor-pointer transition-all ${selectedPathIdx === i ? "border-teal-500 ring-1 ring-teal-500/30" : "hover:border-teal-500/40"}`}
                      onClick={() => setSelectedPathIdx(i)}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">{p.type}</Badge>
                          <Badge className={riskColor(p.income_risk || "medium")}>{p.income_risk} risk</Badge>
                        </div>
                        <CardTitle className="text-base mt-2">{p.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <p className="text-muted-foreground">{p.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded bg-muted"><Clock className="h-3 w-3 mb-1 text-muted-foreground" /><br />{p.time_required}</div>
                          <div className="p-2 rounded bg-muted"><RefreshCw className="h-3 w-3 mb-1 text-muted-foreground" /><br />{p.reversibility || "Reversible"}</div>
                        </div>
                        {p.first_steps?.length > 0 && (
                          <div>
                            <p className="font-medium text-xs mb-1">First steps:</p>
                            <ul className="space-y-1">
                              {p.first_steps.slice(0, 3).map((s: string, j: number) => (
                                <li key={j} className="text-xs flex items-start gap-1"><ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-teal-500" /> {s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {p.bridge_skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {p.bridge_skills.map((s: string, j: number) => <Badge key={j} variant="secondary" className="text-xs">{s}</Badge>)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {pathsResult.comparison_note && (
                  <p className="text-sm text-muted-foreground">{pathsResult.comparison_note}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ===== SKILL BRIDGE ===== */}
        <TabsContent value="skills" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-teal-500" /> Skill Bridge Builder</CardTitle>
              <CardDescription>You don't need to start from zero. Let's find the bridges between where you are and where you want to go.</CardDescription>
            </CardHeader>
            <CardContent>
              {pathsResult?.paths?.[selectedPathIdx] && (
                <p className="text-sm mb-3">Analyzing for: <strong>{pathsResult.paths[selectedPathIdx].title}</strong></p>
              )}
              <Button onClick={analyzeSkillBridge} disabled={aiLoading || !pathsResult?.paths?.length} className="gap-2">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Map Skill Bridges
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {skillBridgeResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {skillBridgeResult.message && <p className="text-sm italic text-muted-foreground">{skillBridgeResult.message}</p>}

                {skillBridgeResult.bridge_skills?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Bridge Skills</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {skillBridgeResult.bridge_skills.map((s: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-muted">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{s.skill}</span>
                            <span className="text-xs text-muted-foreground">{s.time_estimate}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Current: {s.current_level} → Gap: {s.gap}</p>
                          <p className="text-xs mt-1">{s.learning_path}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {skillBridgeResult.micro_projects?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Micro Projects</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {skillBridgeResult.micro_projects.map((p: any, i: number) => (
                          <div key={i} className="p-2 rounded bg-muted text-xs">
                            <p className="font-medium">{p.title}</p>
                            <p className="text-muted-foreground">{p.description}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{p.skill_target}</Badge>
                              <Badge variant="outline" className="text-xs">{p.effort}</Badge>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                  {skillBridgeResult.safe_experiments?.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Safe Experiments</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        {skillBridgeResult.safe_experiments.map((e: any, i: number) => (
                          <div key={i} className="p-2 rounded bg-muted text-xs">
                            <p className="font-medium">{e.experiment}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge className={riskColor(e.risk_level)}>{e.risk_level} risk</Badge>
                            </div>
                            <p className="text-muted-foreground mt-1">{e.outcome}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ===== DEMAND CHECK ===== */}
        <TabsContent value="demand" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-teal-500" /> Demand Reality Check</CardTitle>
              <CardDescription>No motivational lies. No YouTube-guru optimism. Just honest market data.</CardDescription>
            </CardHeader>
            <CardContent>
              {pathsResult?.paths?.[selectedPathIdx] && (
                <p className="text-sm mb-3">Checking demand for: <strong>{pathsResult.paths[selectedPathIdx].title}</strong></p>
              )}
              <Button onClick={checkDemand} disabled={aiLoading || !pathsResult?.paths?.length} className="gap-2">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Check Market Reality
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {demandResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card className="border-teal-500/20">
                  <CardContent className="pt-6 space-y-4">
                    {demandResult.demand_overview && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge className={`text-sm px-3 py-1 ${
                          demandResult.demand_overview.level === "high" ? "bg-emerald-500/10 text-emerald-700" :
                          demandResult.demand_overview.level === "moderate" ? "bg-amber-500/10 text-amber-700" :
                          "bg-blue-500/10 text-blue-700"
                        }`}>{demandResult.demand_overview.level} demand</Badge>
                        <Badge variant="outline">{demandResult.demand_overview.trend}</Badge>
                      </div>
                    )}
                    {demandResult.demand_overview?.note && <p className="text-sm">{demandResult.demand_overview.note}</p>}

                    {demandResult.entry_feasibility && (
                      <div className="grid grid-cols-3 gap-3">
                        {["entry_level", "mid_level", "senior_level"].map(level => (
                          <div key={level} className="p-3 rounded-lg bg-muted text-center">
                            <p className="text-xs font-medium capitalize mb-1">{level.replace("_", " ")}</p>
                            <p className="text-xs text-muted-foreground">{(demandResult.entry_feasibility as any)[level]}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {demandResult.realistic_timeline && (
                      <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/20">
                        <p className="text-sm"><Clock className="h-4 w-4 inline mr-1" /> <strong>Realistic timeline:</strong> {demandResult.realistic_timeline}</p>
                      </div>
                    )}

                    {demandResult.opportunities?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Opportunities</h4>
                        <div className="space-y-2">
                          {demandResult.opportunities.map((o: any, i: number) => (
                            <div key={i} className="p-2 rounded bg-muted text-xs">
                              <span className="font-medium">{o.type}:</span> {o.description}
                              <Badge variant="outline" className="ml-2 text-xs">{o.accessibility}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {demandResult.honest_note && (
                      <p className="text-sm text-muted-foreground italic border-t pt-3">{demandResult.honest_note}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ===== ROADMAP ===== */}
        <TabsContent value="roadmap" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Map className="h-5 w-5 text-teal-500" /> Transition Roadmap</CardTitle>
              <CardDescription>A staged, reversible plan with backtrack options at every step.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={generateRoadmap} disabled={aiLoading || !pathsResult?.paths?.length} className="gap-2">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Create My Roadmap
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {roadmapResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {roadmapResult.message && <p className="text-sm italic text-muted-foreground">{roadmapResult.message}</p>}
                {roadmapResult.total_timeline && <Badge variant="outline" className="text-sm">{roadmapResult.total_timeline}</Badge>}

                {roadmapResult.stages?.map((stage: any, i: number) => (
                  <Card key={i} className="relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          stage.risk_level === "safe" ? "bg-emerald-500/20 text-emerald-700" :
                          stage.risk_level === "low" ? "bg-blue-500/20 text-blue-700" :
                          "bg-amber-500/20 text-amber-700"
                        }`}>{stage.phase}</div>
                        <div>
                          <CardTitle className="text-base">{stage.title}</CardTitle>
                          <CardDescription>{stage.duration}</CardDescription>
                        </div>
                        <Badge className={`ml-auto ${riskColor(stage.risk_level || "low")}`}>{stage.risk_level}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {stage.activities?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Activities</p>
                          <ul className="space-y-1">
                            {stage.activities.map((a: string, j: number) => (
                              <li key={j} className="text-xs flex items-start gap-1"><ChevronRight className="h-3 w-3 mt-0.5 shrink-0 text-teal-500" /> {a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {stage.milestones?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium mb-1">Milestones</p>
                          <div className="flex flex-wrap gap-1">
                            {stage.milestones.map((m: string, j: number) => <Badge key={j} variant="secondary" className="text-xs">{m}</Badge>)}
                          </div>
                        </div>
                      )}
                      {stage.backtrack_option && (
                        <div className="p-2 rounded bg-muted text-xs flex items-start gap-2">
                          <Pause className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" />
                          <span><strong>Backtrack:</strong> {stage.backtrack_option}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {roadmapResult.pause_points?.length > 0 && (
                  <Card className="border-amber-500/20">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Pause className="h-4 w-4 text-amber-500" /> Safe Pause Points</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {roadmapResult.pause_points.map((p: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-amber-500 shrink-0" /> {p}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {roadmapResult.success_indicators?.length > 0 && (
                  <Card className="border-emerald-500/20">
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-emerald-500" /> Success Indicators</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {roadmapResult.success_indicators.map((s: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ===== EMOTIONAL SUPPORT ===== */}
        <TabsContent value="support" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-rose-400" /> Emotional Safety Layer</CardTitle>
              <CardDescription>If anything feels risky, overwhelming, or scary — that's valid. Let's talk through it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={emotionalInput}
                onChange={e => setEmotionalInput(e.target.value)}
                placeholder="What part of this transition feels hard? What would make it feel safer?"
                rows={4}
              />
              <Button onClick={getEmotionalSupport} disabled={aiLoading || !emotionalInput.trim()} className="gap-2">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                Get Support
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {emotionalResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-rose-400/20">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-sm">{emotionalResult.validation}</p>
                    {emotionalResult.reframe && (
                      <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-400/20">
                        <p className="text-sm"><strong>Reframe:</strong> {emotionalResult.reframe}</p>
                      </div>
                    )}
                    {emotionalResult.safety_suggestions?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Ways to Feel Safer</h4>
                        <ul className="space-y-1">
                          {emotionalResult.safety_suggestions.map((s: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2"><Shield className="h-3.5 w-3.5 mt-0.5 text-teal-500 shrink-0" /> {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {emotionalResult.community_prompt && (
                        <div className="p-3 rounded-lg bg-muted text-sm">
                          <Users className="h-4 w-4 mb-1 text-muted-foreground" />
                          <p>{emotionalResult.community_prompt}</p>
                        </div>
                      )}
                      {emotionalResult.mentor_suggestion && (
                        <div className="p-3 rounded-lg bg-muted text-sm">
                          <MessageCircle className="h-4 w-4 mb-1 text-muted-foreground" />
                          <p>{emotionalResult.mentor_suggestion}</p>
                        </div>
                      )}
                    </div>
                    {emotionalResult.gentle_next_step && (
                      <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/20">
                        <p className="text-sm flex items-center gap-2"><ArrowRight className="h-4 w-4 text-teal-500" /> {emotionalResult.gentle_next_step}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ===== CONNECT ===== */}
        <TabsContent value="connect" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-teal-500" /> Community & Mentor Anchoring</CardTitle>
              <CardDescription>Isolation is the biggest transition killer. Let's connect you with people who get it.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={getCommunityAnchoring} disabled={aiLoading} className="gap-2">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Find My Community
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {communityResult && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {communityResult.isolation_breaker && (
                  <p className="text-sm italic text-muted-foreground">{communityResult.isolation_breaker}</p>
                )}

                {communityResult.suggested_circles?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" /> Suggested Peer Circles</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {communityResult.suggested_circles.map((c: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-muted">
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{c.why}</p>
                          <Badge variant="outline" className="text-xs mt-1">{c.activity}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {communityResult.mentor_profiles?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Mentor Types for You</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {communityResult.mentor_profiles.map((m: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-muted">
                          <p className="font-medium text-sm">{m.type}</p>
                          <p className="text-xs text-muted-foreground">{m.background}</p>
                          <p className="text-xs mt-1">{m.how_they_help}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {communityResult.case_studies?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BookOpen className="h-5 w-5" /> Similar Transition Stories</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {communityResult.case_studies.map((c: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-muted">
                          <p className="font-medium text-sm">{c.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{c.summary}</p>
                          <Badge variant="secondary" className="text-xs mt-1">{c.similarity}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {communityResult.community_actions?.length > 0 && (
                  <Card className="border-teal-500/20">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Next Community Actions</CardTitle></CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {communityResult.community_actions.map((a: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2"><ChevronRight className="h-3.5 w-3.5 mt-0.5 text-teal-500 shrink-0" /> {a}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cross-feature navigation */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Connected Features</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "SelfGraph", desc: "Detect misalignment & identity drift", icon: Brain, path: "/career/selfgraph" },
                  { label: "SkillStacker", desc: "Design bridge-skill learning paths", icon: Zap, path: "/career/skillstacker" },
                  { label: "Mentor Matchmaking", desc: "Find transition-ready mentors", icon: Users, path: "/career/mentors" },
                  { label: "Peer Circles", desc: "Join career switcher communities", icon: MessageCircle, path: "/career/peers" },
                  { label: "AI Career Therapist", desc: "Emotional support during uncertainty", icon: Heart, path: "/career/therapist" },
                  { label: "AI Roadmaps", desc: "Convert insights into phased plans", icon: Map, path: "/career/roadmap" },
                  { label: "Living Resume", desc: "Track transferable skills & growth", icon: FileText, path: "/career/resume" },
                  { label: "Journal", desc: "Reflect on your transition journey", icon: BookOpen, path: "/journal" },
                ].map((f, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(f.path)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 text-left transition-colors"
                  >
                    <f.icon className="h-5 w-5 text-teal-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
