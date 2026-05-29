import { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useModuleProgress } from "@/hooks/useModuleProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Map, Check, Circle, Clock, SkipForward, Sparkles, Target,
  BookOpen, Users, Briefcase, Compass, Brain, Zap,
  TrendingUp, MessageSquare, Award, RefreshCw, ArrowRight, Lightbulb,
  PenLine, Meh, HelpCircle, Heart, Link, ExternalLink
} from "lucide-react";
import RoadmapStepDetail from "../components/roadmap/RoadmapStepDetail";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";
import EntitlementBanner from "@/components/curiositycompass/EntitlementBanner";
import { useEntitlement } from "@/hooks/useAssessmentRewards";

const PHASES = [
  { id: "exploration", label: "Exploration", icon: Compass, color: "bg-blue-500" },
  { id: "learning", label: "Learning", icon: BookOpen, color: "bg-emerald-500" },
  { id: "practice", label: "Practice", icon: Target, color: "bg-amber-500" },
  { id: "connection", label: "Connection", icon: Users, color: "bg-purple-500" },
  { id: "opportunity", label: "Opportunity", icon: Briefcase, color: "bg-rose-500" },
];

const CATEGORIES: Record<string, { icon: any; label: string; color: string }> = {
  discovery: { icon: Compass, label: "Discovery", color: "text-blue-500" },
  learning: { icon: BookOpen, label: "Learning", color: "text-emerald-500" },
  project: { icon: Target, label: "Project", color: "text-amber-500" },
  networking: { icon: Users, label: "Networking", color: "text-purple-500" },
  application: { icon: Briefcase, label: "Application", color: "text-rose-500" },
  reflection: { icon: MessageSquare, label: "Reflection", color: "text-cyan-500" },
};

const MOODS = [
  { id: "confident", label: "Confident", icon: Heart, color: "text-success" },
  { id: "motivated", label: "Motivated", icon: Zap, color: "text-accent" },
  { id: "uncertain", label: "Uncertain", icon: HelpCircle, color: "text-muted-foreground" },
  { id: "overwhelmed", label: "Overwhelmed", icon: Meh, color: "text-warmth" },
];

const Roadmap = () => {
  const { user } = useAuth();
  const { active: bonusRoadmaps, consume: consumeRoadmap } = useEntitlement("roadmap_generations_5");
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [interests, setInterests] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [progressAnalysis, setProgressAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("timeline");
  const [goals, setGoals] = useState({ shortTerm: "", longTerm: "" });

  // New state
  const [adaptiveFeedback, setAdaptiveFeedback] = useState<any>(null);
  const [milestoneReflection, setMilestoneReflection] = useState<any>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestonePhase, setMilestonePhase] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [milestoneMood, setMilestoneMood] = useState<string | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [learningTracks, setLearningTracks] = useState<any[]>([]);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [detailStep, setDetailStep] = useState<any>(null);

  // Suggested roadmaps state
  const [suggestedRoadmaps, setSuggestedRoadmaps] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState<string>("");
  const [strongestSignals, setStrongestSignals] = useState<string[]>([]);

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const exploreContext = (location.state as any)?.exploreContext;
  const storyContext = (location.state as any)?.context; // legacy from story mode
  const autoGenTriggered = useRef(false);

  useEffect(() => { if (user) { fetchAll(); fetchSuggestedRoadmaps(); } }, [user]);

  // Switch to suggested tab when navigated with ?tab=suggested
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "suggested") setActiveTab("suggested");
  }, [searchParams]);

  // Auto-generate a focused roadmap when arriving from an Explore card
  useEffect(() => {
    if (!user || !exploreContext || autoGenTriggered.current) return;
    autoGenTriggered.current = true;
    setActiveTab("suggested");
    (async () => {
      setGenerating(true);
      try {
        const item = exploreContext.item || {};
        const focusTitle = exploreContext.context || item.title;
        toast.info(`Generating personalized roadmap for "${focusTitle}"…`);
        const { data, error } = await supabase.functions.invoke("roadmap-ai", {
          body: {
            type: "generate_roadmap",
            context: {
              shortTermGoals: `Explore and build skills for ${focusTitle}`,
              longTermGoals: `Grow into a thriving path connected to ${focusTitle}`,
              interests: [...(item.interests || []), focusTitle].filter(Boolean).slice(0, 12),
              skills: [...(item.related_skills || []), ...(item.soft_skills || [])].filter(Boolean).slice(0, 20),
              industry: item.industry || item.sector || focusTitle,
              careerStage: "exploring",
              areasOfFocus: [...(item.related_careers || []), ...(item.related_job_roles || [])].filter(Boolean).slice(0, 10),
              sourceContext: `explore_${exploreContext.type || "card"}`,
            },
          },
        });
        if (error) throw error;
        const { data: newRoadmap, error: rmErr } = await supabase.from("roadmaps").insert({
          user_id: user.id,
          title: data.title || `Roadmap: ${focusTitle}`,
          description: data.description || `Personalized path inspired by ${focusTitle}`,
          intent: "career",
          skill_gaps: data.skill_gaps || [],
          ai_suggestions: data,
          is_active: true,
        }).select().single();
        if (rmErr) throw rmErr;
        await supabase.from("roadmaps").update({ is_active: false }).eq("user_id", user.id).neq("id", newRoadmap.id);

        const allSteps: any[] = [];
        let orderIndex = 0;
        for (const phase of data.phases || []) {
          for (const step of phase.steps || []) {
            allSteps.push({
              roadmap_id: newRoadmap.id, user_id: user.id, title: step.title, description: step.description,
              phase: phase.name, category: step.category, skill_tags: step.skill_tags || [],
              priority: step.priority || "medium", ai_generated: true, order_index: orderIndex++,
            });
          }
        }
        if (allSteps.length > 0) await supabase.from("roadmap_steps").insert(allSteps);
        setActiveRoadmap(newRoadmap);
        fetchSteps(newRoadmap.id);
        fetchAll();
        setActiveTab("timeline");
        toast.success(`Roadmap for "${focusTitle}" created! 🎉`);
      } catch (e) {
        console.error("Auto-roadmap error:", e);
        toast.error("Couldn't auto-generate roadmap. Try again from the For You tab.");
      } finally {
        setGenerating(false);
      }
    })();
  }, [user, exploreContext]);

  const fetchAll = async () => {
    setLoading(true);
    const [roadmapsRes, profileRes, interestsRes, skillsRes, oppsRes, mentorsRes, tracksRes] = await Promise.all([
      supabase.from("roadmaps").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      supabase.from("interests").select("*").eq("user_id", user!.id),
      supabase.from("experiences").select("skills_used").eq("user_id", user!.id),
      supabase.from("job_opportunities").select("*").eq("is_active", true).limit(5),
      supabase.from("mentors").select("*").eq("is_active", true).limit(5),
      supabase.from("learning_tracks").select("*").limit(6),
    ]);

    setRoadmaps(roadmapsRes.data || []);
    setProfile(profileRes.data);
    setInterests(interestsRes.data || []);
    setOpportunities(oppsRes.data || []);
    setMentors(mentorsRes.data || []);
    setLearningTracks(tracksRes.data || []);

    const allSkills = skillsRes.data?.flatMap(e => e.skills_used || []) || [];
    setSkills([...new Set(allSkills)]);

    if (roadmapsRes.data && roadmapsRes.data.length > 0) {
      const active = roadmapsRes.data.find((r: any) => r.is_active) || roadmapsRes.data[0];
      setActiveRoadmap(active);
      fetchSteps(active.id);
      const activeAny = active as any;
      if (activeAny.short_term_goals || activeAny.long_term_goals) {
        setGoals({ shortTerm: activeAny.short_term_goals || "", longTerm: activeAny.long_term_goals || "" });
      }
    }
    setLoading(false);
  };

  const fetchSuggestedRoadmaps = async () => {
    // Load cached suggestions from DB
    const { data } = await supabase
      .from("suggested_roadmaps")
      .select("*")
      .eq("user_id", user!.id)
      .order("match_score", { ascending: false });
    if (data && data.length > 0) setSuggestedRoadmaps(data);
  };

  const generateSuggestedRoadmaps = async () => {
    if (!user) return;
    setSuggestionsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("roadmap-suggestions", {});
      if (error) throw error;
      if (data?.suggestions) {
        setAnalysisSummary(data.analysis_summary || "");
        setStrongestSignals(data.strongest_signals || []);
        // Refresh from DB
        await fetchSuggestedRoadmaps();
      }
      toast.success("AI analyzed your patterns and generated roadmap suggestions!");
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate suggestions");
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const acceptSuggestedRoadmap = async (suggestion: any) => {
    if (!user) return;
    setGenerating(true);
    try {
      // Generate full roadmap from suggestion
      const { data, error } = await supabase.functions.invoke("roadmap-ai", {
        body: {
          type: "generate_roadmap",
          context: {
            shortTermGoals: suggestion.roadmap_data?.phases?.[0] || suggestion.title,
            longTermGoals: suggestion.description,
            interests: suggestion.roadmap_data?.key_skills || [],
            skills: suggestion.roadmap_data?.key_skills || [],
            industry: suggestion.roadmap_data?.target_roles?.[0] || "",
            careerStage: profile?.career_stage || "exploring",
            areasOfFocus: suggestion.roadmap_data?.target_roles || [],
          },
        },
      });
      if (error) throw error;

      const { data: newRoadmap, error: rmErr } = await supabase.from("roadmaps").insert({
        user_id: user.id,
        title: suggestion.title || data.title,
        description: suggestion.description || data.description,
        intent: "career",
        skill_gaps: data.skill_gaps || [],
        ai_suggestions: data,
        is_active: true,
      }).select().single();
      if (rmErr) throw rmErr;

      await supabase.from("roadmaps").update({ is_active: false }).eq("user_id", user.id).neq("id", newRoadmap.id);

      // Insert steps
      const allSteps: any[] = [];
      let orderIndex = 0;
      for (const phase of data.phases || []) {
        for (const step of phase.steps || []) {
          allSteps.push({
            roadmap_id: newRoadmap.id, user_id: user.id, title: step.title, description: step.description,
            phase: phase.name, category: step.category, skill_tags: step.skill_tags || [],
            priority: step.priority || "medium", ai_generated: true, order_index: orderIndex++,
          });
        }
      }
      if (allSteps.length > 0) await supabase.from("roadmap_steps").insert(allSteps);

      // Mark suggestion as accepted
      await supabase.from("suggested_roadmaps").update({ status: "accepted" }).eq("id", suggestion.id);

      setActiveRoadmap(newRoadmap);
      fetchSteps(newRoadmap.id);
      fetchAll();
      setActiveTab("timeline");
      toast.success(`Roadmap "${suggestion.title}" created! 🎉`);
    } catch (error) {
      console.error("Error accepting suggestion:", error);
      toast.error("Failed to create roadmap from suggestion");
    } finally {
      setGenerating(false);
    }
  };

  const dismissSuggestion = async (id: string) => {
    await supabase.from("suggested_roadmaps").update({ status: "dismissed" }).eq("id", id);
    setSuggestedRoadmaps(prev => prev.filter(s => s.id !== id));
    toast.success("Suggestion dismissed");
  };

  const fetchSteps = async (roadmapId: string) => {
    const { data } = await supabase.from("roadmap_steps").select("*").eq("roadmap_id", roadmapId).order("order_index", { ascending: true });
    setSteps(data || []);
  };

  const generateAIRoadmap = async () => {
    if (!user) return;
    // If user has bonus roadmap credits unlocked, consume one per generation
    if (bonusRoadmaps) {
      await consumeRoadmap();
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("roadmap-ai", {
        body: { type: "generate_roadmap", context: { shortTermGoals: goals.shortTerm || profile?.short_term_goals, longTermGoals: goals.longTerm || profile?.long_term_goals, interests: interests.map(i => i.name), skills, industry: profile?.industry, careerStage: profile?.career_stage, areasOfFocus: profile?.areas_of_focus } },
      });
      if (error) throw error;

      const { data: newRoadmap, error: rmErr } = await supabase.from("roadmaps").insert({
        user_id: user.id, title: data.title || "My Career Roadmap", description: data.description, intent: "career",
        short_term_goals: goals.shortTerm, long_term_goals: goals.longTerm, skill_gaps: data.skill_gaps || [], ai_suggestions: data, is_active: true,
      }).select().single();
      if (rmErr) throw rmErr;

      await supabase.from("roadmaps").update({ is_active: false }).eq("user_id", user.id).neq("id", newRoadmap.id);

      const allSteps: any[] = [];
      let orderIndex = 0;
      for (const phase of data.phases || []) {
        for (const step of phase.steps || []) {
          allSteps.push({
            roadmap_id: newRoadmap.id, user_id: user.id, title: step.title, description: step.description,
            phase: phase.name, category: step.category, skill_tags: step.skill_tags || [],
            priority: step.priority || "medium", ai_generated: true, order_index: orderIndex++,
          });
        }
      }
      if (allSteps.length > 0) await supabase.from("roadmap_steps").insert(allSteps);

      setActiveRoadmap(newRoadmap);
      fetchSteps(newRoadmap.id);
      fetchAll();
      toast.success("AI Roadmap generated!");
    } catch (error) {
      console.error("Error generating roadmap:", error);
      toast.error("Failed to generate roadmap");
    } finally { setGenerating(false); }
  };

  const getNextStepSuggestions = async () => {
    if (!activeRoadmap) return;
    try {
      const completed = steps.filter(s => s.status === "completed");
      const inProgress = steps.filter(s => s.status === "in_progress");
      const skipped = steps.filter(s => s.status === "skipped");
      const { data, error } = await supabase.functions.invoke("roadmap-ai", {
        body: { type: "suggest_next_steps", context: { completedSteps: completed.map(s => s.title), inProgressSteps: inProgress.map(s => s.title), skippedSteps: skipped.map(s => s.title), currentPhase: activeRoadmap.current_phase, goals: `${activeRoadmap.short_term_goals} | ${activeRoadmap.long_term_goals}` } },
      });
      if (error) throw error;
      setAiSuggestions(data);
    } catch (error) { toast.error("Failed to get AI suggestions"); }
  };

  const analyzeProgress = async () => {
    if (!activeRoadmap) return;
    try {
      const completed = steps.filter(s => s.status === "completed");
      const { data, error } = await supabase.functions.invoke("roadmap-ai", {
        body: { type: "analyze_progress", context: { totalSteps: steps.length, completedCount: completed.length, currentPhase: activeRoadmap.current_phase, shortTermGoals: activeRoadmap.short_term_goals, longTermGoals: activeRoadmap.long_term_goals, daysActive: Math.floor((Date.now() - new Date(activeRoadmap.created_at).getTime()) / (1000 * 60 * 60 * 24)), recentActivity: completed.slice(-5).map(s => s.title) } },
      });
      if (error) throw error;
      setProgressAnalysis(data);
    } catch { }
  };

  const getAdaptiveFeedback = async () => {
    if (!activeRoadmap) return;
    try {
      const completedCats = steps.filter(s => s.status === "completed").map(s => s.category);
      const skippedCats = steps.filter(s => s.status === "skipped").map(s => s.category);
      const preferred = [...new Set(completedCats)];
      const avoided = [...new Set(skippedCats)];
      const { data } = await supabase.functions.invoke("roadmap-ai", {
        body: { type: "adaptive_feedback", context: { preferredCategories: preferred, avoidedCategories: avoided, engagementLevel: completedCats.length > 5 ? "high" : completedCats.length > 2 ? "moderate" : "low", recentSkips: steps.filter(s => s.status === "skipped").slice(-3).map(s => s.title), roadmapFocus: activeRoadmap.title } },
      });
      if (data) setAdaptiveFeedback(data);
    } catch { }
  };

  const getMilestoneReflection = async (phase: string) => {
    setMilestonePhase(phase);
    setShowMilestoneModal(true);
    try {
      const phaseSteps = steps.filter(s => s.phase === phase);
      const { data } = await supabase.functions.invoke("roadmap-ai", {
        body: { type: "milestone_reflection", context: { milestoneName: `${phase} phase completion`, phaseCompleted: phase, stepsCompleted: phaseSteps.filter(s => s.status === "completed").length, goals: `${goals.shortTerm} | ${goals.longTerm}`, timeTaken: `${Math.floor((Date.now() - new Date(activeRoadmap.created_at).getTime()) / (1000 * 60 * 60 * 24))} days` } },
      });
      if (data) setMilestoneReflection(data);
    } catch { }
  };

  const saveMilestoneReflection = async () => {
    if (!user) return;
    await supabase.from("journal_entries").insert({
      user_id: user.id,
      content: reflectionText || milestoneReflection?.reflection_prompts?.[0] || "",
      title: `Roadmap Milestone — ${milestonePhase}`,
      mood: milestoneMood,
      tags: ["roadmap", "milestone", milestonePhase || ""],
    });
    // Track mood in coaching checkins
    if (milestoneMood) {
      await supabase.from("coaching_checkins").insert({
        user_id: user.id, mood: milestoneMood, reflection: reflectionText,
      });
    }
    toast.success("Milestone reflection saved! 🎉");
    setShowMilestoneModal(false);
    setReflectionText("");
    setMilestoneMood(null);
    setMilestoneReflection(null);
  };

  const updateStepStatus = async (stepId: string, status: "not_started" | "in_progress" | "completed" | "skipped") => {
    await supabase.from("roadmap_steps").update({ status, completed_at: status === "completed" ? new Date().toISOString() : null }).eq("id", stepId);
    fetchSteps(activeRoadmap.id);

    const newCompleted = steps.filter(s => s.status === "completed" || (s.id === stepId && status === "completed")).length;
    const progressVal = Math.round((newCompleted / steps.length) * 100);
    await supabase.from("roadmaps").update({ description: `Progress: ${progressVal}%` } as any).eq("id", activeRoadmap.id);

    if (status === "completed") {
      toast.success("Step completed! 🎉");
      // Check if phase is complete
      const step = steps.find(s => s.id === stepId);
      if (step) {
        const phaseSteps = steps.filter(s => s.phase === step.phase);
        const phaseCompleted = phaseSteps.filter(s => s.status === "completed" || s.id === stepId).length;
        if (phaseCompleted === phaseSteps.length) {
          getMilestoneReflection(step.phase);
        }
      }
      // Award achievement
      await supabase.from("achievements").insert({
        user_id: user!.id, achievement_type: "roadmap_step", title: `Completed roadmap step`,
        description: steps.find(s => s.id === stepId)?.title || "", points: 5,
      });
    }
  };

  const saveGoals = async () => {
    if (!activeRoadmap) return;
    await supabase.from("roadmaps").update({ description: `Goals: ${goals.shortTerm} | ${goals.longTerm}` } as any).eq("id", activeRoadmap.id);
    toast.success("Goals saved!");
  };

  const completedCount = steps.filter(s => s.status === "completed").length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;
  const stepsByPhase = PHASES.reduce((acc, phase) => { acc[phase.id] = steps.filter(s => s.phase === phase.id); return acc; }, {} as Record<string, any[]>);
  const currentPhaseIndex = PHASES.findIndex(p => p.id === activeRoadmap?.current_phase) || 0;

  // Report Roadmap milestone progress (25/50/75/100%) — additive, picked up by
  // the global RewardCelebrationManager via realtime.
  const { report: reportRoadmapProgress } = useModuleProgress();
  useEffect(() => {
    if (!user || steps.length === 0) return;
    void reportRoadmapProgress("roadmap", completedCount, steps.length);
  }, [user, completedCount, steps.length, reportRoadmapProgress]);

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check size={16} className="text-accent" />;
      case "in_progress": return <Clock size={16} className="text-amber-500" />;
      case "skipped": return <SkipForward size={16} className="text-muted-foreground" />;
      default: return <Circle size={16} className="text-muted-foreground" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-pulse text-muted-foreground">Loading your roadmap...</div></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Map size={24} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">AI Powered Roadmaps</h1>
              <p className="font-body text-sm text-muted-foreground">Here's your journey — built around your strengths, interests, and goals.</p>
            </div>
          </div>
          {activeRoadmap && (
            <div className="flex gap-2">
              <Button onClick={getAdaptiveFeedback} variant="outline" size="sm" className="gap-1">
                <RefreshCw size={14} /> Adapt
              </Button>
              <Button onClick={getNextStepSuggestions} variant="outline" size="sm" className="gap-1">
                <Brain size={14} /> Suggest
              </Button>
            </div>
          )}
        </div>
        <ModuleSearchBar
          placeholder="Search career paths, domains, job roles..."
          sources={["careers", "domains", "jobs"]}
          showAiBadge
          onSearch={(q) => {
            if (q.length > 2 && roadmaps.length > 0) {
              const lower = q.toLowerCase();
              const match = roadmaps.find(r => r.title?.toLowerCase().includes(lower) || r.domain?.toLowerCase().includes(lower));
              if (match) setActiveRoadmap(match);
            }
          }}
          onSelect={(item) => {
            toast.info(`"${item.title}" — Generate an AI Roadmap for this path!`);
          }}
        />
        <div className="mt-3">
          <EntitlementBanner
            entitlementKey="roadmap_generations_5"
            rewardLabel="5 Bonus AI Roadmaps"
            unlockedMessage="You have bonus AI Roadmap generations available — they'll be consumed automatically when you generate."
          />
        </div>
      </motion.div>

      {/* Milestone Reflection Modal */}
      <AnimatePresence>
        {showMilestoneModal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="border-accent/40 bg-gradient-to-br from-accent/5 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Award className="text-accent" size={20} /> Milestone Reached!</CardTitle>
                <CardDescription>You completed the {milestonePhase} phase — take a moment to reflect.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {milestoneReflection ? (
                  <>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="font-body text-sm">{milestoneReflection.celebration}</p>
                    </div>
                    {milestoneReflection.achievement_summary && (
                      <p className="font-body text-sm text-muted-foreground">{milestoneReflection.achievement_summary}</p>
                    )}
                    {milestoneReflection.reflection_prompts?.length > 0 && (
                      <div>
                        <p className="font-body text-xs text-muted-foreground mb-2">Reflect on:</p>
                        {milestoneReflection.reflection_prompts.map((p: string, i: number) => (
                          <p key={i} className="font-body text-sm mb-1 flex items-start gap-2">
                            <Lightbulb size={14} className="text-yellow-500 mt-0.5 shrink-0" /> {p}
                          </p>
                        ))}
                      </div>
                    )}
                    {milestoneReflection.next_milestone_preview && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border">
                        <p className="font-body text-xs text-muted-foreground">Next milestone:</p>
                        <p className="font-body text-sm">{milestoneReflection.next_milestone_preview}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-muted-foreground animate-pulse">Generating reflection...</div>
                )}

                {/* Mood checkpoint */}
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-2">How do you feel about your progress?</p>
                  <div className="flex gap-2">
                    {MOODS.map(m => (
                      <button key={m.id} onClick={() => setMilestoneMood(m.id)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${milestoneMood === m.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
                        <m.icon className={m.color} size={18} />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea placeholder="Share your thoughts on this milestone..." value={reflectionText} onChange={e => setReflectionText(e.target.value)} rows={3} />
                <div className="flex gap-2">
                  <Button onClick={saveMilestoneReflection}><PenLine size={14} className="mr-2" /> Save Reflection</Button>
                  <Button variant="ghost" onClick={() => setShowMilestoneModal(false)}>Skip</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adaptive Feedback Banner */}
      <AnimatePresence>
        {adaptiveFeedback && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Brain className="text-primary mt-0.5 shrink-0" size={20} />
                  <div>
                    <p className="font-body text-sm">{adaptiveFeedback.observation}</p>
                    {adaptiveFeedback.encouragement && (
                      <p className="font-body text-sm text-primary mt-2 italic">"{adaptiveFeedback.encouragement}"</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setAdaptiveFeedback(null)} className="shrink-0 ml-auto">✕</Button>
                </div>
                {adaptiveFeedback.suggested_adjustments?.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-body text-xs text-muted-foreground">Suggested Adjustments:</p>
                    {adaptiveFeedback.suggested_adjustments.map((adj: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                        <Badge variant="outline" className="text-[10px] shrink-0">{adj.type}</Badge>
                        <p className="font-body text-xs">{adj.details}</p>
                      </div>
                    ))}
                  </div>
                )}
                {adaptiveFeedback.alternative_paths?.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-body text-xs text-muted-foreground">Alternative Paths:</p>
                    <div className="flex gap-2 flex-wrap">
                      {adaptiveFeedback.alternative_paths.map((path: any, i: number) => (
                        <div key={i} className="px-3 py-2 rounded-lg border border-border bg-background/50">
                          <p className="font-body text-xs font-medium">{path.name}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{path.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      {activeRoadmap && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center"><TrendingUp className="text-accent" size={20} /></div><div><p className="text-2xl font-display text-foreground">{Math.round(progress)}%</p><p className="text-xs text-muted-foreground">Progress</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center"><Check className="text-emerald-500" size={20} /></div><div><p className="text-2xl font-display text-foreground">{completedCount}</p><p className="text-xs text-muted-foreground">Completed</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center"><Clock className="text-amber-500" size={20} /></div><div><p className="text-2xl font-display text-foreground">{steps.filter(s => s.status === "in_progress").length}</p><p className="text-xs text-muted-foreground">In Progress</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Target className="text-blue-500" size={20} /></div><div><p className="text-2xl font-display text-foreground">{steps.length - completedCount}</p><p className="text-xs text-muted-foreground">Remaining</p></div></CardContent></Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex overflow-x-auto w-full gap-1">
          <TabsTrigger value="suggested" className="gap-1"><Sparkles size={14} /> For You</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="connect">Connect</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Suggested Roadmaps Tab */}
        <TabsContent value="suggested" className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Sparkles className="text-primary" size={20} />
                    AI-Suggested Roadmaps
                  </CardTitle>
                  <CardDescription>
                    Personalized roadmaps generated from your activity across all modules — skills, interests, explorations, and goals.
                  </CardDescription>
                </div>
                <Button onClick={generateSuggestedRoadmaps} disabled={suggestionsLoading} className="gap-2">
                  {suggestionsLoading ? <RefreshCw className="animate-spin" size={16} /> : <Brain size={16} />}
                  {suggestionsLoading ? "Analyzing..." : "Analyze & Suggest"}
                </Button>
              </div>
            </CardHeader>
            {analysisSummary && (
              <CardContent className="pt-0 space-y-3">
                <div className="p-3 rounded-lg bg-background/50 border border-border">
                  <p className="font-body text-sm text-foreground">{analysisSummary}</p>
                </div>
                {strongestSignals.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">Key signals:</span>
                    {strongestSignals.map((signal, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">{signal}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {suggestedRoadmaps.length > 0 ? (
            <div className="grid gap-4">
              {suggestedRoadmaps.filter(s => s.status === "suggested").map((suggestion, i) => (
                <motion.div key={suggestion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="hover:border-primary/30 transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                          <span className="text-lg font-bold text-primary">{suggestion.match_score || 0}%</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg text-foreground">{suggestion.title}</h3>
                          <p className="font-body text-sm text-muted-foreground mt-1">{suggestion.description}</p>

                          {suggestion.reasoning?.length > 0 && (
                            <div className="mt-3 space-y-1">
                              {suggestion.reasoning.map((reason: string, j: number) => (
                                <p key={j} className="font-body text-xs text-muted-foreground flex items-start gap-2">
                                  <Lightbulb size={12} className="text-accent mt-0.5 shrink-0" />
                                  {reason}
                                </p>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3">
                            {suggestion.roadmap_data?.key_skills?.slice(0, 5).map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-[10px]">{skill}</Badge>
                            ))}
                            {suggestion.roadmap_data?.estimated_timeline && (
                              <Badge variant="secondary" className="text-[10px]">
                                <Clock size={10} className="mr-1" />
                                {suggestion.roadmap_data.estimated_timeline}
                              </Badge>
                            )}
                          </div>

                          {suggestion.roadmap_data?.target_roles?.length > 0 && (
                            <p className="font-body text-xs text-muted-foreground mt-2">
                              Target roles: {suggestion.roadmap_data.target_roles.join(", ")}
                            </p>
                          )}

                          {suggestion.roadmap_data?.phases?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {suggestion.roadmap_data.phases.map((phase: string, k: number) => (
                                <span key={k} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                  {phase}
                                </span>
                              ))}
                            </div>
                          )}

                          {suggestion.roadmap_data?.live_resources?.length > 0 && (
                            <div className="mt-3 space-y-1 border-l-2 border-primary/30 pl-2">
                              <p className="text-[10px] uppercase tracking-wide text-primary font-semibold">Live resources</p>
                              {suggestion.roadmap_data.live_resources.slice(0, 3).map((r: any, k: number) => (
                                <a
                                  key={k}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-start gap-1 break-words"
                                >
                                  <ExternalLink size={10} className="mt-0.5 shrink-0" />
                                  <span className="min-w-0 break-words">{r.title}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button size="sm" onClick={() => acceptSuggestedRoadmap(suggestion)} disabled={generating} className="gap-1">
                            {generating ? <RefreshCw className="animate-spin" size={14} /> : <ArrowRight size={14} />}
                            Accept
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => dismissSuggestion(suggestion.id)} className="text-xs">
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Brain className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="font-display text-lg text-foreground mb-2">No Suggestions Yet</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Click "Analyze & Suggest" to let AI examine your activity across all modules and suggest personalized career roadmaps.
                </p>
                <Button onClick={generateSuggestedRoadmaps} disabled={suggestionsLoading} className="gap-2">
                  {suggestionsLoading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  {suggestionsLoading ? "Analyzing your patterns..." : "Generate Suggestions"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          {activeRoadmap ? (
            <>
              {/* Phase Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Your Journey Phases</CardTitle>
                  <CardDescription>Track progress and reflect at each milestone</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    {PHASES.map((phase, i) => {
                      const PhaseIcon = phase.icon;
                      const phaseSteps = stepsByPhase[phase.id] || [];
                      const phaseCompleted = phaseSteps.filter(s => s.status === "completed").length;
                      const isActive = activeRoadmap.current_phase === phase.id;
                      const isPast = i < currentPhaseIndex;
                      const isPhaseComplete = phaseSteps.length > 0 && phaseCompleted === phaseSteps.length;

                      return (
                        <div key={phase.id} className="flex flex-col items-center gap-2 flex-1">
                          <button
                            onClick={() => isPhaseComplete ? getMilestoneReflection(phase.id) : null}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPast || isPhaseComplete ? phase.color : isActive ? `${phase.color} ring-4 ring-offset-2 ring-accent/30` : "bg-muted"} ${isPhaseComplete ? "cursor-pointer hover:scale-110" : ""}`}
                          >
                            {isPhaseComplete ? <Award size={20} className="text-white" /> : <PhaseIcon size={20} className={isPast || isActive ? "text-white" : "text-muted-foreground"} />}
                          </button>
                          <span className={`text-xs font-body ${isActive ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{phase.label}</span>
                          <span className="text-[10px] text-muted-foreground">{phaseCompleted}/{phaseSteps.length}</span>
                        </div>
                      );
                    })}
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground mt-2">{Math.round(progress)}% complete • {completedCount} of {steps.length} steps</p>
                </CardContent>
              </Card>

              {/* Steps by Phase — with cross-module links */}
              <div className="space-y-4">
                {PHASES.map(phase => {
                  const phaseSteps = stepsByPhase[phase.id] || [];
                  if (phaseSteps.length === 0) return null;
                  const PhaseIcon = phase.icon;

                  return (
                    <Card key={phase.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${phase.color} flex items-center justify-center`}><PhaseIcon size={16} className="text-white" /></div>
                          <CardTitle className="font-display text-lg">{phase.label}</CardTitle>
                          <Badge variant="secondary" className="ml-auto">{phaseSteps.filter(s => s.status === "completed").length}/{phaseSteps.length}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {phaseSteps.map((step: any, i: number) => {
                          const CategoryData = CATEGORIES[step.category as string] || CATEGORIES.learning;
                          const CategoryIcon = CategoryData.icon;
                          const isExpanded = expandedStep === step.id;

                          return (
                            <div key={step.id}>
                              <motion.div
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50 cursor-pointer ${step.status === "completed" ? "bg-accent/5 border-accent/20" : "border-border"}`}
                                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                                onDoubleClick={() => setDetailStep(step)}
                              >
                                <button onClick={(e) => { e.stopPropagation(); updateStepStatus(step.id, step.status === "completed" ? "not_started" : "completed"); }} className="shrink-0">
                                  {statusIcon(step.status)}
                                </button>
                                <CategoryIcon size={16} className={CategoryData.color} />
                                <div className="flex-1 min-w-0">
                                  <p className={`font-body text-sm ${step.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{step.title}</p>
                                  {step.description && <p className="text-xs text-muted-foreground truncate">{step.description}</p>}
                                </div>
                                {step.skill_tags?.length > 0 && (
                                  <div className="hidden md:flex gap-1">{step.skill_tags.slice(0, 2).map((tag: string) => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}</div>
                                )}
                                <Badge variant={step.priority === "high" ? "destructive" : step.priority === "medium" ? "default" : "secondary"} className="text-[10px]">{step.priority}</Badge>
                              </motion.div>

                              {/* Expanded cross-module navigation */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="ml-10 mt-2 mb-3 p-3 rounded-lg bg-muted/30 border border-border space-y-3">
                                      <div className="flex flex-wrap gap-2">
                                        {(["not_started", "in_progress", "completed", "skipped"] as const).map(s => (
                                          <button key={s} onClick={() => updateStepStatus(step.id, s)} className={`px-2.5 py-1 rounded-md text-xs font-body transition-all ${step.status === s ? "bg-primary text-primary-foreground" : "bg-background border border-border hover:bg-muted"}`}>
                                            {s.replace("_", " ")}
                                          </button>
                                        ))}
                                      </div>
                                      {/* Cross-module links */}
                                      <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={(e) => { e.stopPropagation(); setDetailStep(step); }}>
                                          <Sparkles size={12} /> View Details
                                        </Button>
                                        {step.category === "learning" && (
                                          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={(e) => { e.stopPropagation(); window.location.href = "/career/content-library"; }}>
                                            <BookOpen size={12} /> Learning Content
                                          </Button>
                                        )}
                                        {step.category === "project" && (
                                          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={(e) => { e.stopPropagation(); window.location.href = "/career/project-playground"; }}>
                                            <Target size={12} /> Project Lab
                                          </Button>
                                        )}
                                        {step.category === "networking" && (
                                          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={(e) => { e.stopPropagation(); window.location.href = "/career/mentor-matchmaking"; }}>
                                            <Users size={12} /> Find Mentors
                                          </Button>
                                        )}
                                        {step.category === "application" && (
                                          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={(e) => { e.stopPropagation(); window.location.href = "/career/job-matching"; }}>
                                            <Briefcase size={12} /> Job Matching
                                          </Button>
                                        )}
                                        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={(e) => { e.stopPropagation(); window.location.href = "/career/skill-stacker"; }}>
                                          <Zap size={12} /> SkillStacker
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={(e) => { e.stopPropagation(); window.location.href = "/shared/journal"; }}>
                                          <PenLine size={12} /> Journal
                                        </Button>
                                      </div>
                                      {step.skill_tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {step.skill_tags.map((tag: string) => <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>)}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Sparkles className="mx-auto text-accent mb-4" size={48} />
                <h3 className="font-display text-xl text-foreground mb-2">Create Your AI Roadmap</h3>
                <p className="font-body text-muted-foreground mb-6 max-w-md mx-auto">Let AI analyze your interests, skills, and goals to create a personalized career roadmap.</p>
                <div className="space-y-4 max-w-md mx-auto">
                  <Input placeholder="Short-term goal (e.g., Get an internship in 3 months)" value={goals.shortTerm} onChange={(e) => setGoals(g => ({ ...g, shortTerm: e.target.value }))} />
                  <Input placeholder="Long-term goal (e.g., Become a senior developer)" value={goals.longTerm} onChange={(e) => setGoals(g => ({ ...g, longTerm: e.target.value }))} />
                  <Button onClick={generateAIRoadmap} disabled={generating} className="w-full gap-2">
                    {generating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {generating ? "Generating..." : "Generate AI Roadmap"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2"><Zap className="text-amber-500" size={20} /> Next Steps</CardTitle>
              <CardDescription>Your most impactful actions right now</CardDescription>
            </CardHeader>
            <CardContent>
              {steps.filter(s => s.status !== "completed").slice(0, 5).map((step, i) => (
                <div key={step.id} className="flex items-center gap-3 p-3 border-b border-border last:border-0">
                  <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent-foreground">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-body text-sm text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.phase} • {step.category}</p>
                    {step.description && <p className="text-xs text-muted-foreground mt-1 italic">"{step.description}"</p>}
                  </div>
                  <Button size="sm" onClick={() => updateStepStatus(step.id, "in_progress")}>Start <ArrowRight size={14} className="ml-1" /></Button>
                </div>
              ))}
              {steps.filter(s => s.status !== "completed").length === 0 && <p className="text-center text-muted-foreground py-8">All steps completed! 🎉</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-display flex items-center gap-2"><Clock className="text-amber-500" size={20} /> In Progress</CardTitle></CardHeader>
            <CardContent>
              {steps.filter(s => s.status === "in_progress").map(step => (
                <div key={step.id} className="flex items-center gap-3 p-3 border-b border-border last:border-0">
                  <Clock className="text-amber-500" size={16} />
                  <div className="flex-1"><p className="font-body text-sm text-foreground">{step.title}</p></div>
                  <Button size="sm" variant="outline" onClick={() => updateStepStatus(step.id, "completed")}><Check size={14} className="mr-1" /> Complete</Button>
                </div>
              ))}
              {steps.filter(s => s.status === "in_progress").length === 0 && <p className="text-center text-muted-foreground py-4">No tasks in progress</p>}
            </CardContent>
          </Card>

          {/* AI Suggestions inline */}
          {Array.isArray(aiSuggestions?.suggestions) && aiSuggestions.suggestions.length > 0 && (
            <Card className="border-primary/20">
              <CardHeader><CardTitle className="font-display text-base flex items-center gap-2"><Sparkles className="text-primary" size={18} /> AI Suggested Steps</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {aiSuggestions.suggestions.map((s: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <p className="font-body text-sm font-medium">{s.title}</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">{s.description}</p>
                    <p className="text-xs text-primary mt-1">💡 {s.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {aiSuggestions ? (
            <>
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="pt-6">
                  <p className="font-body text-foreground italic">"{aiSuggestions.encouragement}"</p>
                  {aiSuggestions.pattern_insight && <p className="text-sm text-muted-foreground mt-2"><Lightbulb className="inline mr-1" size={14} /> {aiSuggestions.pattern_insight}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="font-display">AI Recommended Next Steps</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {(Array.isArray(aiSuggestions.suggestions) ? aiSuggestions.suggestions : []).map((suggestion: any, i: number) => (
                    <div key={i} className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">{i + 1}</div>
                        <div className="flex-1">
                          <h4 className="font-display text-foreground">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{suggestion.category}</Badge>
                            <Badge variant={suggestion.priority === "high" ? "destructive" : "secondary"}>{suggestion.priority}</Badge>
                            <span className="text-xs text-muted-foreground">{suggestion.estimated_time}</span>
                          </div>
                          <p className="text-xs text-primary mt-2">💡 {suggestion.reason}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Brain className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="font-display text-lg text-foreground mb-2">Get AI-Powered Insights</h3>
                <p className="text-muted-foreground mb-4">Let AI analyze your progress and suggest optimal next steps</p>
                <Button onClick={getNextStepSuggestions} className="gap-2"><Sparkles size={16} /> Generate Insights</Button>
              </CardContent>
            </Card>
          )}

          <Button onClick={analyzeProgress} variant="outline" className="w-full gap-2"><TrendingUp size={16} /> Analyze My Progress</Button>

          {progressAnalysis && (
            <Card>
              <CardHeader><CardTitle className="font-display flex items-center gap-2"><Award className="text-accent" size={20} /> Progress Analysis</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="font-body text-foreground">{progressAnalysis.progress_summary}</p>
                {progressAnalysis.strengths_observed?.length > 0 && (
                  <div><h4 className="font-display text-sm text-foreground mb-2">Strengths Observed</h4><div className="flex flex-wrap gap-2">{progressAnalysis.strengths_observed.map((s: string, i: number) => <Badge key={i} variant="secondary">{s}</Badge>)}</div></div>
                )}
                {progressAnalysis.phase_readiness && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm"><strong>Phase:</strong> {progressAnalysis.phase_readiness.current_phase} ({progressAnalysis.phase_readiness.completion_percentage}% complete)</p>
                    {progressAnalysis.phase_readiness.ready_for_next && <p className="text-sm text-primary mt-1">✨ Ready for {progressAnalysis.phase_readiness.next_phase}!</p>}
                  </div>
                )}
                {progressAnalysis.recommended_adjustments?.length > 0 && (
                  <div><h4 className="font-display text-sm mb-2">Recommended Adjustments</h4>{progressAnalysis.recommended_adjustments.map((a: string, i: number) => <p key={i} className="font-body text-xs text-muted-foreground mb-1 flex items-start gap-2"><ArrowRight size={12} className="text-primary mt-0.5 shrink-0" /> {a}</p>)}</div>
                )}
                <p className="text-sm italic text-primary">"{progressAnalysis.motivational_message}"</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Connect Tab — Cross-module navigation */}
        <TabsContent value="connect" className="space-y-6">
          {/* Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2"><Briefcase className="text-rose-500" size={20} /> Opportunities Aligned to Your Roadmap</CardTitle>
              <CardDescription>Jobs and internships that match your progress</CardDescription>
            </CardHeader>
            <CardContent>
              {opportunities.length > 0 ? (
                <div className="space-y-3">
                  {opportunities.map((opp: any) => (
                    <div key={opp.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center"><Briefcase className="text-rose-500" size={18} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-foreground">{opp.title}</p>
                        <p className="font-body text-xs text-muted-foreground">{opp.company_name} • {opp.location || "Remote"}</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => window.location.href = "/career/job-matching"}>
                        <ExternalLink size={12} /> View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Opportunities will appear as you build your roadmap.</p>
              )}
            </CardContent>
          </Card>

          {/* Mentors */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2"><Users className="text-purple-500" size={20} /> Suggested Mentors</CardTitle>
              <CardDescription>Experts who can help at your current stage</CardDescription>
            </CardHeader>
            <CardContent>
              {mentors.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {mentors.slice(0, 4).map((mentor: any) => (
                    <div key={mentor.id} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = "/career/mentor-matchmaking"}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center"><Users className="text-purple-500" size={18} /></div>
                        <div>
                          <p className="font-body text-sm font-medium text-foreground">{mentor.name}</p>
                          <p className="font-body text-xs text-muted-foreground">{mentor.expertise_areas?.slice(0, 2).join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Complete more roadmap steps to get mentor suggestions.</p>
              )}
            </CardContent>
          </Card>

          {/* Learning Tracks */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2"><BookOpen className="text-emerald-500" size={20} /> Recommended Learning</CardTitle>
              <CardDescription>Courses and tracks aligned with your roadmap</CardDescription>
            </CardHeader>
            <CardContent>
              {learningTracks.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-3">
                  {learningTracks.slice(0, 6).map((track: any) => (
                    <div key={track.id} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer" onClick={() => window.location.href = "/career/content-library"}>
                      <p className="font-body text-sm font-medium text-foreground">{track.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px]">{track.difficulty || "Beginner"}</Badge>
                        {track.estimated_hours && <span className="text-[10px] text-muted-foreground">{track.estimated_hours}h</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Learning tracks will be suggested based on your roadmap.</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader><CardTitle className="font-display text-base">Quick Navigation</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "SkillStacker", icon: Zap, href: "/career/skill-stacker" },
                  { label: "Project Lab", icon: Target, href: "/career/project-playground" },
                  { label: "Peer Circles", icon: Users, href: "/career/peer-circles" },
                  { label: "Journal", icon: PenLine, href: "/shared/journal" },
                ].map(link => (
                  <button key={link.label} onClick={() => window.location.href = link.href} className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-2">
                    <link.icon className="text-primary" size={20} />
                    <span className="font-body text-xs">{link.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2"><Target className="text-accent" size={20} /> Your Career Goals</CardTitle>
              <CardDescription>Define what success looks like for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-body text-foreground mb-2 block">Short-term Goal (3-6 months)</label>
                <Textarea placeholder="e.g., Get my first internship, complete 3 projects, learn Python..." value={goals.shortTerm} onChange={(e) => setGoals(g => ({ ...g, shortTerm: e.target.value }))} rows={3} />
              </div>
              <div>
                <label className="text-sm font-body text-foreground mb-2 block">Long-term Goal (1-3 years)</label>
                <Textarea placeholder="e.g., Become a full-stack developer, start my own company, lead a team..." value={goals.longTerm} onChange={(e) => setGoals(g => ({ ...g, longTerm: e.target.value }))} rows={3} />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveGoals} className="flex-1">Save Goals</Button>
                {activeRoadmap && (
                  <Button onClick={generateAIRoadmap} variant="outline" disabled={generating} className="gap-2">
                    <RefreshCw className={generating ? "animate-spin" : ""} size={16} /> Regenerate
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skill Gaps */}
          {activeRoadmap?.skill_gaps?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="font-display">Skill Gaps to Address</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {activeRoadmap.skill_gaps.map((gap: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-body text-sm text-foreground">{gap.skill}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={(gap.current_level / gap.target_level) * 100} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">{gap.current_level}/{gap.target_level}</span>
                      </div>
                    </div>
                    <Badge variant="outline">{gap.importance}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Phase Summary Cards */}
          <Card>
            <CardHeader><CardTitle className="font-display">Phase Summaries</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {PHASES.map(phase => {
                const phaseSteps = stepsByPhase[phase.id] || [];
                const completed = phaseSteps.filter(s => s.status === "completed").length;
                const PhaseIcon = phase.icon;
                return (
                  <div key={phase.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className={`w-8 h-8 rounded-lg ${phase.color} flex items-center justify-center shrink-0`}><PhaseIcon size={14} className="text-white" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-body text-sm font-medium text-foreground">{phase.label}</p>
                        <span className="text-xs text-muted-foreground">{completed}/{phaseSteps.length}</span>
                      </div>
                      <Progress value={phaseSteps.length > 0 ? (completed / phaseSteps.length) * 100 : 0} className="h-1" />
                    </div>
                    {phaseSteps.length > 0 && completed === phaseSteps.length && (
                      <Badge variant="default" className="text-[10px]">Complete</Badge>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Roadmap Selector */}
      {roadmaps.length > 1 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Your Roadmaps</p>
            <div className="flex gap-2 flex-wrap">
              {roadmaps.map(rm => (
                <button key={rm.id} onClick={() => { setActiveRoadmap(rm); fetchSteps(rm.id); }} className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${activeRoadmap?.id === rm.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {rm.title}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Step Sheet */}
      <RoadmapStepDetail
        open={!!detailStep}
        onClose={() => setDetailStep(null)}
        step={detailStep || {}}
        roadmapTitle={activeRoadmap?.title}
        userGoals={`${activeRoadmap?.short_term_goals || ""} | ${activeRoadmap?.long_term_goals || ""}`}
      />
    </div>
  );
};

export default Roadmap;
