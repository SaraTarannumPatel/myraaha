import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Compass, Sparkles, Target, TrendingUp, ArrowRight, Check, Brain,
  Map, Users, BookOpen, Lightbulb, ChevronRight, Zap,
  Shield, BarChart3, Rocket, Briefcase, Heart, Globe,
  RefreshCw, MessageSquare, Send, UserCheck, GitCompare,
  PenTool, Clock, ArrowUpRight, ArrowDownRight, Minus,
  Share2, ThumbsUp, Eye
} from "lucide-react";

const pathTemplates = [
  { type: "product_startup", title: "Product Startup", description: "Build a scalable product that solves a significant problem.", icon: Rocket, skills: ["Product thinking", "Technical skills", "Marketing"], risk: "High", opportunity: "High scalability & impact", actions: ["Validate a problem with 10 users", "Build a landing page", "Create an MVP prototype"] },
  { type: "freelancing", title: "Freelancing & Consulting", description: "Leverage your expertise to serve clients independently.", icon: Briefcase, skills: ["Domain expertise", "Communication", "Self-management"], risk: "Low-Medium", opportunity: "Flexible income & lifestyle", actions: ["Define your niche service", "Create a portfolio", "Land your first client"] },
  { type: "social_impact", title: "Social Impact Venture", description: "Create a venture that tackles social or environmental challenges.", icon: Heart, skills: ["Empathy", "Community building", "Grant writing"], risk: "Medium", opportunity: "Meaningful change & purpose", actions: ["Identify a community need", "Map stakeholders", "Design a pilot program"] },
  { type: "service_business", title: "Service-Based Business", description: "Offer specialized services with potential to scale through a team.", icon: Users, skills: ["Client management", "Operations", "Leadership"], risk: "Low-Medium", opportunity: "Steady revenue & growth", actions: ["Package your service offering", "Set pricing", "Build a client pipeline"] },
  { type: "creative_venture", title: "Creative Venture", description: "Turn creative skills into a sustainable business.", icon: Lightbulb, skills: ["Creativity", "Branding", "Audience building"], risk: "Medium", opportunity: "Personal fulfillment & brand", actions: ["Build your creative portfolio", "Start sharing publicly", "Monetize your first piece"] },
  { type: "tech_innovation", title: "Tech Innovation", description: "Push boundaries with cutting-edge technology solutions.", icon: Globe, skills: ["Technical depth", "Research", "Problem-solving"], risk: "High", opportunity: "Disruptive potential", actions: ["Research emerging tech", "Build a proof of concept", "Find early adopters"] },
];

const alignmentQuestions = [
  { q: "How comfortable are you with financial uncertainty?", options: ["Very comfortable", "Somewhat", "Prefer stability"], key: "risk" },
  { q: "Do you prefer working alone or with a team?", options: ["Solo", "Small team", "Large team"], key: "team" },
  { q: "What matters more to you?", options: ["Income potential", "Personal fulfillment", "Social impact"], key: "values" },
  { q: "How much time can you dedicate?", options: ["Full-time", "Part-time", "Evenings & weekends"], key: "time" },
  { q: "What's your risk appetite?", options: ["High risk, high reward", "Balanced", "Low risk, steady growth"], key: "appetite" },
];

const PathSelector = () => {
  const { user, profile } = useAuth();
  const [signals, setSignals] = useState<any>(null);
  const [paths, setPaths] = useState<any[]>([]);
  const [activePath, setActivePath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [roadmap, setRoadmap] = useState<any>(null);
  const [alignmentResult, setAlignmentResult] = useState<any>(null);
  const [explorationData, setExplorationData] = useState<any>({});
  // New state for missing features
  const [signalSnapshots, setSignalSnapshots] = useState<any[]>([]);
  const [refinedSignals, setRefinedSignals] = useState<any>(null);
  const [reflections, setReflections] = useState<any[]>([]);
  const [reflectionPrompts, setReflectionPrompts] = useState<any[]>([]);
  const [reflectionInput, setReflectionInput] = useState("");
  const [activeReflectionPrompt, setActiveReflectionPrompt] = useState<any>(null);
  const [mentorMatch, setMentorMatch] = useState<any>(null);
  const [communityShares, setCommunityShares] = useState<any[]>([]);
  const [shareFeedback, setShareFeedback] = useState<any[]>([]);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    const [pathRes, ideasRes, problemsRes, skillsRes, interestsRes, challengesRes, snapshotRes, reflRes, sharesRes] = await Promise.all([
      supabase.from("path_selections").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("startup_ideas").select("title, category, validation_score").eq("user_id", user.id).limit(20),
      supabase.from("problem_observations").select("observation, category, scale, relevance_score").eq("user_id", user.id).limit(20),
      supabase.from("skills").select("name, category, proficiency").eq("user_id", user.id),
      supabase.from("interests").select("name, category, strength").eq("user_id", user.id),
      supabase.from("mindset_challenges").select("id").eq("user_id", user.id).eq("status", "completed"),
      supabase.from("path_signal_snapshots" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("path_reflections" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("path_community_shares" as any).select("*").order("created_at", { ascending: false }).limit(20),
    ]);
    setPaths(pathRes.data || []);
    setExplorationData({
      ideas: ideasRes.data || [],
      problems: problemsRes.data || [],
      skills: skillsRes.data || [],
      interests: interestsRes.data || [],
      challengesCompleted: (challengesRes.data || []).length,
    });
    setSignalSnapshots((snapshotRes.data as any[]) || []);
    setReflections((reflRes.data as any[]) || []);
    setCommunityShares((sharesRes.data as any[]) || []);
    setLoading(false);
  };

  const detectSignals = async () => {
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "detect_signals",
          context: { ...explorationData, industry: profile?.industry, goals: profile?.short_term_goals },
        },
      });
      if (data && !data.error) {
        setSignals(data);
        // Save snapshot
        await supabase.from("path_signal_snapshots" as any).insert({
          user_id: user!.id,
          signals_data: data,
          top_areas: data.signals?.map((s: any) => s.area) || [],
          snapshot_type: "detection",
        } as any);
      } else toast.error(data?.error || "Failed to detect signals");
    } catch { toast.error("Failed to analyze signals"); }
    setAiLoading(false);
  };

  const refineSignals = async () => {
    setAiLoading(true);
    try {
      const previousSignals = signalSnapshots.length > 0 ? signalSnapshots[0]?.signals_data : signals;
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "refine_signals",
          context: {
            previousSignals,
            ideas: explorationData.ideas,
            problems: explorationData.problems,
            skills: explorationData.skills,
            interests: explorationData.interests,
            reflections: reflections.slice(0, 5),
            pathHistory: paths.slice(0, 5),
          },
        },
      });
      if (data && !data.error) {
        setRefinedSignals(data);
        await supabase.from("path_signal_snapshots" as any).insert({
          user_id: user!.id,
          signals_data: data,
          top_areas: data.evolved_signals?.map((s: any) => s.area) || [],
          confidence_delta: data.confidence_trend === "increasing" ? 1 : data.confidence_trend === "decreasing" ? -1 : 0,
          snapshot_type: "refinement",
        } as any);
        toast.success("Signals refined! 🔄");
      } else toast.error(data?.error || "Failed to refine");
    } catch { toast.error("Failed to refine signals"); }
    setAiLoading(false);
  };

  const selectPath = async (template: typeof pathTemplates[0]) => {
    const userSkills = explorationData.skills?.map((s: any) => s.name) || [];
    const matched = template.skills.filter(s => userSkills.some((us: string) => us.toLowerCase().includes(s.toLowerCase())));
    const { data, error } = await supabase.from("path_selections").insert({
      user_id: user!.id, path_type: template.type, title: template.title, description: template.description,
      skills_required: template.skills, skills_matched: matched, status: "exploring",
    }).select().single();
    if (error) { toast.error("Failed to select path"); return; }
    setActivePath(data);
    // Sync to founder profile
    await syncToFounderProfile(template);
    fetchAll();
    toast.success(`Path selected: ${template.title}! 🎯`);
  };

  const syncToFounderProfile = async (template: typeof pathTemplates[0]) => {
    if (!user) return;
    const { data: existing } = await supabase.from("founder_profiles").select("id, industries").eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("founder_profiles").update({
        founder_type: template.type,
        looking_for: template.skills,
      }).eq("id", existing.id);
    }
    // Log as decision action
    await supabase.from("decision_actions").insert({
      user_id: user.id,
      action_title: `Selected path: ${template.title}`,
      action_type: "path_selection",
      action_description: template.description,
      skills_gained: template.skills,
    });
  };

  const generateRoadmap = async () => {
    if (!activePath) return;
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "generate_roadmap",
          context: { pathType: activePath.path_type, pathTitle: activePath.title, skills: explorationData.skills, industry: profile?.industry, experienceLevel: profile?.career_stage || "beginner" },
        },
      });
      if (data && !data.error) {
        setRoadmap(data);
        await supabase.from("path_selections").update({ roadmap: data.steps || [], status: "committed" }).eq("id", activePath.id);
        toast.success("Roadmap generated! 🗺️");
      }
    } catch { toast.error("Failed to generate roadmap"); }
    setAiLoading(false);
  };

  const evaluateAlignment = async () => {
    if (!activePath) return;
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "evaluate_alignment",
          context: { pathType: activePath.path_type, pathTitle: activePath.title, skills: explorationData.skills, interests: explorationData.interests, industry: profile?.industry, experienceLevel: profile?.career_stage || "beginner", goals: profile?.short_term_goals },
        },
      });
      if (data && !data.error) {
        setAlignmentResult(data);
        await supabase.from("path_selections").update({ confidence_score: (data.alignment_score || 0) / 100, ai_analysis: data }).eq("id", activePath.id);
      }
    } catch { toast.error("Failed to evaluate"); }
    setAiLoading(false);
  };

  const generateReflectionPrompts = async () => {
    if (!activePath) return;
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "reflection_prompts",
          context: {
            pathType: activePath.path_type, pathTitle: activePath.title,
            stage: activePath.status, skills: explorationData.skills,
            recentReflections: reflections.slice(0, 3).map((r: any) => r.response),
            alignmentScore: alignmentResult?.alignment_score || 0,
          },
        },
      });
      if (data?.prompts) {
        setReflectionPrompts(data.prompts);
        toast.success("Reflection prompts ready! 🪞");
      }
    } catch { toast.error("Failed to generate prompts"); }
    setAiLoading(false);
  };

  const submitReflection = async () => {
    if (!activeReflectionPrompt || !reflectionInput.trim() || !activePath) return;
    const { error } = await supabase.from("path_reflections" as any).insert({
      user_id: user!.id,
      path_selection_id: activePath.id,
      prompt: activeReflectionPrompt.prompt,
      response: reflectionInput,
      reflection_type: activeReflectionPrompt.category,
    } as any);
    if (!error) {
      toast.success("Reflection saved! ✨");
      setReflectionInput("");
      setActiveReflectionPrompt(null);
      fetchAll();
    }
  };

  const getMentorRecommendations = async () => {
    if (!activePath) return;
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "mentor_match",
          context: {
            pathType: activePath.path_type, pathTitle: activePath.title,
            skills: explorationData.skills,
            gaps: alignmentResult?.gaps || [],
            industry: profile?.industry,
            experienceLevel: profile?.career_stage || "beginner",
          },
        },
      });
      if (data && !data.error) {
        setMentorMatch(data);
        toast.success("Mentor profile generated! 🤝");
      }
    } catch { toast.error("Failed to match mentors"); }
    setAiLoading(false);
  };

  const sharePathToComm = async () => {
    if (!activePath) return;
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "community_summary",
          context: {
            pathType: activePath.path_type, pathTitle: activePath.title,
            signals: signals?.signals || [],
            alignmentScore: alignmentResult?.alignment_score || 0,
            roadmapProgress: roadmap?.steps?.length || 0,
            reflections: reflections.slice(0, 3).map((r: any) => r.response),
            skills: explorationData.skills,
          },
        },
      });
      if (data?.summary) {
        await supabase.from("path_community_shares" as any).insert({
          user_id: user!.id,
          path_selection_id: activePath.id,
          share_summary: data.summary,
          share_type: "journey_update",
        } as any);
        fetchAll();
        toast.success("Shared with community! 🌟");
      }
    } catch { toast.error("Failed to share"); }
    setAiLoading(false);
  };

  const submitFeedback = async (shareId: string) => {
    if (!feedbackInput.trim()) return;
    await supabase.from("path_share_feedback" as any).insert({
      share_id: shareId,
      user_id: user!.id,
      content: feedbackInput,
      feedback_type: "comment",
    } as any);
    setFeedbackInput("");
    toast.success("Feedback sent! 💬");
    // Increment feedback count
    const share = communityShares.find((s: any) => s.id === shareId);
    if (share) {
      await supabase.from("path_community_shares" as any).update({ feedback_count: (share.feedback_count || 0) + 1 } as any).eq("id", shareId);
    }
    fetchAll();
  };

  const comparePaths = async () => {
    if (selectedForCompare.length < 2) { toast.error("Select at least 2 paths"); return; }
    setAiLoading(true);
    try {
      const pathsToCompare = selectedForCompare.map(t => pathTemplates.find(p => p.type === t)!).filter(Boolean);
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "compare_paths",
          context: {
            paths: pathsToCompare.map(p => ({ type: p.type, title: p.title, skills: p.skills, risk: p.risk })),
            skills: explorationData.skills,
            interests: explorationData.interests,
            industry: profile?.industry,
            riskAppetite: answers[4] || "Balanced",
            timeCommitment: answers[3] || "Part-time",
          },
        },
      });
      if (data && !data.error) {
        setComparisonResult(data);
        toast.success("Comparison ready! 📊");
      }
    } catch { toast.error("Failed to compare"); }
    setAiLoading(false);
  };

  const commitToPath = async () => {
    if (!activePath) return;
    await supabase.from("path_selections").update({ status: "committed" }).eq("id", activePath.id);
    const { data: roadmapData } = await supabase.from("roadmaps").insert({
      user_id: user!.id, title: `${activePath.title} Roadmap`, description: `Auto-generated roadmap for your ${activePath.title} path`, intent: "entrepreneurship",
    }).select().single();
    if (roadmapData && roadmap?.steps) {
      const steps = roadmap.steps.map((s: any, i: number) => ({
        user_id: user!.id, roadmap_id: roadmapData.id, title: s.title, description: s.description, order_index: i, status: "not_started" as const,
      }));
      await supabase.from("roadmap_steps").insert(steps);
    }
    // Sync to startup profiling
    await supabase.from("decision_actions").insert({
      user_id: user!.id,
      action_title: `Committed to: ${activePath.title}`,
      action_type: "path_commitment",
      action_description: `Committed to ${activePath.title} path with alignment score ${alignmentResult?.alignment_score || 'N/A'}%`,
      skills_gained: activePath.skills_matched || [],
    });
    fetchAll();
    toast.success("Path committed! Your roadmap is ready in the Roadmap section. 🚀");
  };

  const totalSignals = (explorationData.ideas?.length || 0) + (explorationData.problems?.length || 0) + (explorationData.interests?.length || 0);
  const committedPaths = paths.filter((p: any) => p.status === "committed").length;

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "rising") return <ArrowUpRight size={12} className="text-accent" />;
    if (trend === "declining") return <ArrowDownRight size={12} className="text-destructive" />;
    return <Minus size={12} className="text-muted-foreground" />;
  };

  if (loading) return <div className="animate-pulse font-body text-muted-foreground text-center py-12">Loading...</div>;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-terracotta/20 flex items-center justify-center">
            <Compass size={20} className="text-terracotta" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Path Selector</h1>
            <p className="font-body text-sm text-muted-foreground">Let's help you choose the right path — one that aligns with your strengths, passions, and signals.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Exploration Signals", value: totalSignals, icon: TrendingUp, color: "text-terracotta" },
          { label: "Skills Tracked", value: explorationData.skills?.length || 0, icon: Zap, color: "text-blue" },
          { label: "Paths Explored", value: paths.length, icon: Map, color: "text-indigo" },
          { label: "Paths Committed", value: committedPaths, icon: Target, color: "text-accent" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon size={18} className={`mx-auto mb-1 ${s.color}`} />
            <p className="font-display text-2xl text-foreground">{s.value}</p>
            <p className="font-body text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="signals" className="space-y-6">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="signals" className="font-body text-xs"><Sparkles size={12} className="mr-1" />Signals</TabsTrigger>
          <TabsTrigger value="paths" className="font-body text-xs"><Map size={12} className="mr-1" />Explore</TabsTrigger>
          <TabsTrigger value="compare" className="font-body text-xs"><GitCompare size={12} className="mr-1" />Compare</TabsTrigger>
          <TabsTrigger value="decide" className="font-body text-xs"><BarChart3 size={12} className="mr-1" />Decide</TabsTrigger>
          <TabsTrigger value="reflect" className="font-body text-xs"><PenTool size={12} className="mr-1" />Reflect</TabsTrigger>
          <TabsTrigger value="roadmap" className="font-body text-xs"><Rocket size={12} className="mr-1" />Roadmap</TabsTrigger>
          <TabsTrigger value="refine" className="font-body text-xs"><RefreshCw size={12} className="mr-1" />Refine</TabsTrigger>
          <TabsTrigger value="mentor" className="font-body text-xs"><UserCheck size={12} className="mr-1" />Mentors</TabsTrigger>
          <TabsTrigger value="community" className="font-body text-xs"><Users size={12} className="mr-1" />Community</TabsTrigger>
          <TabsTrigger value="history" className="font-body text-xs"><Clock size={12} className="mr-1" />Journey</TabsTrigger>
        </TabsList>

        {/* ========== SIGNAL DETECTION ========== */}
        <TabsContent value="signals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Early Idea Signal Detection</h2>
            <Button onClick={detectSignals} variant="outline" size="sm" disabled={aiLoading}>
              <Sparkles size={14} className={aiLoading ? "animate-spin" : ""} /> {signals ? "Refresh" : "Detect Signals"}
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display text-base text-foreground mb-2 flex items-center gap-2"><Lightbulb size={16} className="text-terracotta" /> Ideas Explored</h3>
              {explorationData.ideas?.length > 0 ? (
                <div className="space-y-1">
                  {explorationData.ideas.slice(0, 5).map((idea: any, i: number) => (
                    <p key={i} className="font-body text-xs text-muted-foreground">• {idea.title} {idea.category && <span className="text-terracotta">({idea.category})</span>}</p>
                  ))}
                  {explorationData.ideas.length > 5 && <p className="font-body text-xs text-muted-foreground">+{explorationData.ideas.length - 5} more</p>}
                </div>
              ) : <p className="font-body text-xs text-muted-foreground">No ideas yet. Visit Startup Sparks to explore.</p>}
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display text-base text-foreground mb-2 flex items-center gap-2"><Target size={16} className="text-blue" /> Problems Spotted</h3>
              {explorationData.problems?.length > 0 ? (
                <div className="space-y-1">
                  {explorationData.problems.slice(0, 5).map((p: any, i: number) => (
                    <p key={i} className="font-body text-xs text-muted-foreground">• {p.observation?.substring(0, 60)}...</p>
                  ))}
                </div>
              ) : <p className="font-body text-xs text-muted-foreground">No observations yet. Use Problem Spotting Lens.</p>}
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display text-base text-foreground mb-2 flex items-center gap-2"><Brain size={16} className="text-indigo" /> Skills & Interests</h3>
              <div className="flex flex-wrap gap-1">
                {explorationData.skills?.slice(0, 6).map((s: any) => (
                  <span key={s.name} className="px-2 py-0.5 rounded bg-indigo/10 text-indigo font-body text-[10px]">{s.name}</span>
                ))}
                {explorationData.interests?.slice(0, 4).map((interest: any) => (
                  <span key={interest.name} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{interest.name}</span>
                ))}
                {(explorationData.skills?.length === 0 && explorationData.interests?.length === 0) && (
                  <p className="font-body text-xs text-muted-foreground">Add skills in SelfGraph to improve detection.</p>
                )}
              </div>
            </div>
          </div>
          {signals && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-terracotta/5 rounded-xl border border-terracotta/30 p-5">
                <h3 className="font-display text-lg text-foreground mb-2">🎯 AI Recommendation</h3>
                <p className="font-body text-sm text-foreground mb-2">{signals.top_recommendation}</p>
                <p className="font-body text-xs text-muted-foreground">{signals.reasoning}</p>
              </div>
              {signals.signals?.map((s: any, i: number) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-display text-base text-foreground">{s.area}</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={s.strength * 100} className="w-20 h-1.5" />
                      <span className="font-body text-xs text-muted-foreground">{Math.round(s.strength * 100)}%</span>
                    </div>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mb-1">{s.evidence}</p>
                  <p className="font-body text-xs text-terracotta">Suggested: {s.suggested_path}</p>
                </div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* ========== EXPLORE PATHS ========== */}
        <TabsContent value="paths" className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Choose Your Entrepreneurial Path</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pathTemplates.map((template, i) => {
              const existing = paths.find((p: any) => p.path_type === template.type);
              return (
                <motion.div key={template.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-card rounded-xl border p-5 ${existing ? "border-terracotta/40" : "border-border"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center">
                      <template.icon size={20} className="text-terracotta" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-foreground">{template.title}</h3>
                      {existing && <span className="font-body text-[10px] text-terracotta">{existing.status}</span>}
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center gap-2"><span className="font-body text-xs text-muted-foreground">Risk:</span><span className={`font-body text-xs ${template.risk === "High" ? "text-destructive" : "text-accent"}`}>{template.risk}</span></div>
                    <div className="flex items-center gap-2"><span className="font-body text-xs text-muted-foreground">Opportunity:</span><span className="font-body text-xs text-foreground">{template.opportunity}</span></div>
                    <div className="flex flex-wrap gap-1 mt-1">{template.skills.map(s => (<span key={s} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{s}</span>))}</div>
                  </div>
                  <div className="mb-3">
                    <p className="font-body text-xs text-muted-foreground mb-1">Initial Actions:</p>
                    {template.actions.map((a, ai) => (
                      <p key={ai} className="font-body text-xs text-foreground">→ {a}</p>
                    ))}
                  </div>
                  <Button onClick={() => selectPath(template)} variant={existing ? "ghost" : "outline"} size="sm" disabled={!!existing}>
                    {existing ? <><Check size={14} /> Selected</> : <><ArrowRight size={14} /> Select Path</>}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ========== COMPARE PATHS ========== */}
        <TabsContent value="compare" className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Compare Paths Side-by-Side</h2>
          <p className="font-body text-sm text-muted-foreground">Select 2-4 paths to compare using AI analysis.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {pathTemplates.map(t => (
              <button key={t.type} onClick={() => {
                setSelectedForCompare(prev => prev.includes(t.type) ? prev.filter(p => p !== t.type) : prev.length < 4 ? [...prev, t.type] : prev);
              }}
                className={`p-3 rounded-xl border text-left transition-all ${selectedForCompare.includes(t.type) ? "border-terracotta bg-terracotta/5" : "border-border bg-card"}`}>
                <t.icon size={18} className={selectedForCompare.includes(t.type) ? "text-terracotta" : "text-muted-foreground"} />
                <p className="font-display text-sm text-foreground mt-1">{t.title}</p>
                <p className="font-body text-[10px] text-muted-foreground">Risk: {t.risk}</p>
              </button>
            ))}
          </div>
          <Button onClick={comparePaths} disabled={aiLoading || selectedForCompare.length < 2} className="bg-terracotta text-white hover:bg-terracotta/90">
            <GitCompare size={14} className={aiLoading ? "animate-spin" : ""} /> Compare {selectedForCompare.length} Paths
          </Button>
          {comparisonResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-terracotta/5 rounded-xl border border-terracotta/30 p-5">
                <h3 className="font-display text-lg text-foreground mb-2">AI Recommendation</h3>
                <p className="font-body text-sm text-foreground">{comparisonResult.recommendation}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{comparisonResult.reasoning}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {comparisonResult.comparison?.map((c: any, i: number) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-display text-base text-foreground">{c.path}</h4>
                      <div className="text-center">
                        <p className="font-display text-xl text-terracotta">{c.fit_score}%</p>
                        <p className="font-body text-[10px] text-muted-foreground">Fit</p>
                      </div>
                    </div>
                    <Progress value={c.fit_score} className="h-2 mb-3" />
                    <div className="space-y-2">
                      <div>
                        <p className="font-body text-xs text-accent mb-1">✓ Pros</p>
                        {c.pros?.map((p: string, pi: number) => <p key={pi} className="font-body text-xs text-foreground">• {p}</p>)}
                      </div>
                      <div>
                        <p className="font-body text-xs text-destructive mb-1">✗ Cons</p>
                        {c.cons?.map((p: string, pi: number) => <p key={pi} className="font-body text-xs text-foreground">• {p}</p>)}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-body text-muted-foreground">Time to revenue: {c.time_to_first_revenue}</span>
                        <span className="font-body text-muted-foreground">Skill gaps: {c.skill_gap_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* ========== DECISION TOOLS ========== */}
        <TabsContent value="decide" className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Decision & Alignment Tools</h2>
          {!activePath ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Compass className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">Select a path first</h3>
              <p className="font-body text-muted-foreground">Go to "Explore" to choose a direction, then return here.</p>
            </div>
          ) : (
            <>
              <div className="bg-terracotta/5 rounded-xl border border-terracotta/30 p-5">
                <h3 className="font-display text-lg text-foreground mb-1">Evaluating: {activePath.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{activePath.description}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3 className="font-display text-lg text-foreground">Self-Assessment Questionnaire</h3>
                {alignmentQuestions.map((aq, qi) => (
                  <div key={qi}>
                    <p className="font-body text-sm text-foreground mb-2">{aq.q}</p>
                    <div className="flex flex-wrap gap-2">
                      {aq.options.map(opt => (
                        <button key={opt} onClick={() => setAnswers({ ...answers, [qi]: opt })}
                          className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${answers[qi] === opt ? "bg-terracotta text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={evaluateAlignment} className="bg-terracotta text-white hover:bg-terracotta/90" disabled={aiLoading}>
                <BarChart3 size={14} className={aiLoading ? "animate-spin" : ""} /> Evaluate Alignment with AI
              </Button>
              {alignmentResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-foreground">Alignment Analysis</h3>
                    <div className="text-center">
                      <p className="font-display text-2xl text-terracotta">{alignmentResult.alignment_score}%</p>
                      <p className="font-body text-[10px] text-muted-foreground">Match</p>
                    </div>
                  </div>
                  <Progress value={alignmentResult.alignment_score} className="h-2" />
                  <div className="flex items-center gap-2">
                    <Shield size={14} className={alignmentResult.risk_level === "low" ? "text-accent" : alignmentResult.risk_level === "high" ? "text-destructive" : "text-amber-500"} />
                    <span className="font-body text-sm text-foreground">Risk Level: {alignmentResult.risk_level}</span>
                  </div>
                  <p className="font-body text-sm text-foreground">{alignmentResult.advice}</p>
                  {alignmentResult.strengths_match?.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-1">Strengths Match</p>
                      <div className="flex flex-wrap gap-1">{alignmentResult.strengths_match.map((s: string) => (<span key={s} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-xs">{s}</span>))}</div>
                    </div>
                  )}
                  {alignmentResult.gaps?.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-1">Gaps to Address</p>
                      <div className="flex flex-wrap gap-1">{alignmentResult.gaps.map((s: string) => (<span key={s} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-xs">{s}</span>))}</div>
                    </div>
                  )}
                  {alignmentResult.next_actions?.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-1">Recommended Next Actions</p>
                      {alignmentResult.next_actions.map((a: string, i: number) => (<p key={i} className="font-body text-sm text-foreground">→ {a}</p>))}
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </TabsContent>

        {/* ========== REFLECTION PROMPTS ========== */}
        <TabsContent value="reflect" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Guided Reflections</h2>
            <Button onClick={generateReflectionPrompts} variant="outline" size="sm" disabled={aiLoading || !activePath}>
              <PenTool size={14} className={aiLoading ? "animate-spin" : ""} /> Generate Prompts
            </Button>
          </div>
          {!activePath ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <PenTool className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">Select a path to begin reflecting</h3>
            </div>
          ) : (
            <>
              {reflectionPrompts.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {reflectionPrompts.map((rp: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`bg-card rounded-xl border p-4 cursor-pointer transition-all ${activeReflectionPrompt === rp ? "border-indigo" : "border-border hover:border-indigo/40"}`}
                      onClick={() => setActiveReflectionPrompt(rp)}>
                      <span className={`inline-block px-2 py-0.5 rounded-full font-body text-[10px] mb-2 ${
                        rp.category === "readiness" ? "bg-blue/10 text-blue" :
                        rp.category === "passion" ? "bg-terracotta/10 text-terracotta" :
                        rp.category === "risk" ? "bg-maroon/10 text-maroon" :
                        "bg-indigo/10 text-indigo"
                      }`}>{rp.category}</span>
                      <p className="font-body text-sm text-foreground mb-1">{rp.prompt}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{rp.why_this_matters}</p>
                    </motion.div>
                  ))}
                </div>
              )}
              {activeReflectionPrompt && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-indigo/30 p-5 space-y-3">
                  <p className="font-body text-sm text-foreground font-medium">{activeReflectionPrompt.prompt}</p>
                  <Textarea value={reflectionInput} onChange={e => setReflectionInput(e.target.value)}
                    placeholder="Write your reflection..." className="min-h-[100px] font-body text-sm" />
                  <Button onClick={submitReflection} disabled={!reflectionInput.trim()} size="sm" className="bg-indigo text-white hover:bg-indigo/90">
                    <Send size={14} /> Save Reflection
                  </Button>
                </motion.div>
              )}
              {reflections.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display text-lg text-foreground">Past Reflections</h3>
                  {reflections.slice(0, 5).map((r: any, i: number) => (
                    <div key={r.id || i} className="bg-card rounded-xl border border-border p-4">
                      <p className="font-body text-xs text-muted-foreground mb-1">{r.prompt}</p>
                      <p className="font-body text-sm text-foreground">{r.response}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{r.reflection_type}</span>
                        <span className="font-body text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ========== ROADMAP ========== */}
        <TabsContent value="roadmap" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Actionable Roadmap</h2>
            {activePath && !roadmap && (
              <Button onClick={generateRoadmap} variant="outline" size="sm" disabled={aiLoading}>
                <Map size={14} className={aiLoading ? "animate-spin" : ""} /> Generate Roadmap
              </Button>
            )}
          </div>
          {!activePath ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Map className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No path selected</h3>
              <p className="font-body text-muted-foreground">Select a path first to generate your personalized roadmap.</p>
            </div>
          ) : roadmap ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {roadmap.estimated_timeline && (
                <div className="bg-terracotta/5 rounded-xl border border-terracotta/30 p-4">
                  <p className="font-body text-sm text-foreground">Estimated Timeline: <span className="font-display text-terracotta">{roadmap.estimated_timeline}</span></p>
                </div>
              )}
              {roadmap.steps?.map((step: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-xl border border-border p-5 flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-sm text-white ${
                      step.category === "learning" ? "bg-blue" : step.category === "building" ? "bg-terracotta" :
                      step.category === "networking" ? "bg-indigo" : "bg-accent"
                    }`}>{i + 1}</div>
                    {i < (roadmap.steps?.length || 0) - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display text-base text-foreground">{step.title}</h4>
                      <span className={`px-2 py-0.5 rounded-full font-body text-[10px] ${
                        step.category === "learning" ? "bg-blue/10 text-blue" : step.category === "building" ? "bg-terracotta/10 text-terracotta" :
                        step.category === "networking" ? "bg-indigo/10 text-indigo" : "bg-accent/10 text-accent"
                      }`}>{step.category}</span>
                      {step.duration && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{step.duration}</span>}
                    </div>
                    <p className="font-body text-sm text-muted-foreground">{step.description}</p>
                    {step.resources?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">{step.resources.map((r: string, ri: number) => (<span key={ri} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{r}</span>))}</div>
                    )}
                  </div>
                </motion.div>
              ))}
              {roadmap.key_milestones?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display text-lg text-foreground mb-3">Key Milestones</h3>
                  {roadmap.key_milestones.map((m: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 mb-2"><Check size={14} className="text-accent" /><p className="font-body text-sm text-foreground">{m}</p></div>
                  ))}
                </div>
              )}
              <Button onClick={commitToPath} className="bg-terracotta text-white hover:bg-terracotta/90 w-full">
                <Rocket size={16} /> Commit to This Path & Create Roadmap
              </Button>
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">Ready to map your journey?</h3>
              <p className="font-body text-muted-foreground mb-3">Generate an AI-powered roadmap for your {activePath.title} path.</p>
              <Button onClick={generateRoadmap} disabled={aiLoading} className="bg-terracotta text-white hover:bg-terracotta/90"><Map size={14} /> Generate Roadmap</Button>
            </div>
          )}
        </TabsContent>

        {/* ========== SIGNAL REFINEMENT ========== */}
        <TabsContent value="refine" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Signal Refinement Tracker</h2>
            <Button onClick={refineSignals} variant="outline" size="sm" disabled={aiLoading}>
              <RefreshCw size={14} className={aiLoading ? "animate-spin" : ""} /> Refine Signals
            </Button>
          </div>
          <p className="font-body text-sm text-muted-foreground">Track how your interests, skills, and confidence evolve over time. Re-run signal detection to see trends.</p>

          {/* Signal Evolution Timeline */}
          {signalSnapshots.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h3 className="font-display text-base text-foreground">Signal History ({signalSnapshots.length} snapshots)</h3>
              {signalSnapshots.slice(0, 5).map((snap: any, i: number) => (
                <div key={snap.id || i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className={`w-2 h-2 rounded-full ${snap.snapshot_type === "refinement" ? "bg-indigo" : "bg-terracotta"}`} />
                  <div className="flex-1">
                    <p className="font-body text-xs text-foreground">{snap.snapshot_type === "refinement" ? "Refinement" : "Detection"}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {snap.top_areas?.slice(0, 3).map((a: string, ai: number) => (
                        <span key={ai} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{a}</span>
                      ))}
                    </div>
                  </div>
                  <span className="font-body text-[10px] text-muted-foreground">{new Date(snap.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}

          {refinedSignals && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-indigo/5 rounded-xl border border-indigo/30 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display text-lg text-foreground">Confidence Trend</h3>
                  <span className={`px-2 py-0.5 rounded-full font-body text-xs ${
                    refinedSignals.confidence_trend === "increasing" ? "bg-accent/10 text-accent" :
                    refinedSignals.confidence_trend === "decreasing" ? "bg-destructive/10 text-destructive" :
                    "bg-muted text-muted-foreground"
                  }`}>{refinedSignals.confidence_trend}</span>
                </div>
                <p className="font-body text-sm text-foreground">{refinedSignals.narrative}</p>
              </div>

              {refinedSignals.evolved_signals?.map((es: any, i: number) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-base text-foreground">{es.area}</h4>
                      <TrendIcon trend={es.trend} />
                      <span className={`font-body text-xs ${es.trend === "rising" ? "text-accent" : es.trend === "declining" ? "text-destructive" : "text-muted-foreground"}`}>{es.trend}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-body text-[10px] text-muted-foreground">{Math.round((es.previous_strength || 0) * 100)}%</span>
                      <ArrowRight size={10} className="text-muted-foreground" />
                      <span className="font-body text-xs text-foreground">{Math.round((es.current_strength || 0) * 100)}%</span>
                    </div>
                  </div>
                  <Progress value={(es.current_strength || 0) * 100} className="h-1.5 mb-2" />
                  <p className="font-body text-xs text-muted-foreground">{es.insight}</p>
                </div>
              ))}

              {refinedSignals.new_discoveries?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-base text-foreground mb-2">🆕 New Discoveries</h4>
                  {refinedSignals.new_discoveries.map((d: string, i: number) => (
                    <p key={i} className="font-body text-sm text-foreground">• {d}</p>
                  ))}
                </div>
              )}

              {refinedSignals.recommended_pivots?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-base text-foreground mb-2">🔄 Consider Pivoting</h4>
                  {refinedSignals.recommended_pivots.map((p: string, i: number) => (
                    <p key={i} className="font-body text-sm text-foreground">→ {p}</p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </TabsContent>

        {/* ========== MENTOR MATCHING ========== */}
        <TabsContent value="mentor" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Mentor Matching</h2>
            <Button onClick={getMentorRecommendations} variant="outline" size="sm" disabled={aiLoading || !activePath}>
              <UserCheck size={14} className={aiLoading ? "animate-spin" : ""} /> Find Mentors
            </Button>
          </div>
          {!activePath ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <UserCheck className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">Select a path first</h3>
              <p className="font-body text-muted-foreground">We'll match you with ideal mentors for your journey.</p>
            </div>
          ) : mentorMatch ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-blue/5 rounded-xl border border-blue/30 p-5">
                <h3 className="font-display text-lg text-foreground mb-3">Ideal Mentor Profile</h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-1">Expertise Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {mentorMatch.ideal_mentor_profile?.expertise_areas?.map((e: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-blue/10 text-blue font-body text-xs">{e}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-1">Experience Level</p>
                    <p className="font-body text-sm text-foreground">{mentorMatch.ideal_mentor_profile?.experience_level}</p>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-1">Personality Traits</p>
                    <div className="flex flex-wrap gap-1">
                      {mentorMatch.ideal_mentor_profile?.personality_traits?.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-base text-foreground mb-2">🎯 What to Look For</h4>
                  {mentorMatch.what_to_look_for?.map((w: string, i: number) => (
                    <p key={i} className="font-body text-sm text-foreground mb-1">• {w}</p>
                  ))}
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-base text-foreground mb-2">📧 Outreach Tips</h4>
                  {mentorMatch.outreach_tips?.map((t: string, i: number) => (
                    <p key={i} className="font-body text-sm text-foreground mb-1">→ {t}</p>
                  ))}
                </div>
              </div>

              {mentorMatch.conversation_starters?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-base text-foreground mb-2">💬 Conversation Starters</h4>
                  {mentorMatch.conversation_starters.map((c: string, i: number) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3 mb-2">
                      <p className="font-body text-sm text-foreground italic">"{c}"</p>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" onClick={() => window.location.href = "/dashboard/startup-support"} className="w-full">
                <Users size={14} /> Browse Available Mentors in Startup Support
              </Button>
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <UserCheck className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">Ready to find your guide?</h3>
              <p className="font-body text-muted-foreground">Click "Find Mentors" to get AI-powered mentor recommendations.</p>
            </div>
          )}
        </TabsContent>

        {/* ========== COMMUNITY SHARING ========== */}
        <TabsContent value="community" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Community Sharing & Feedback</h2>
            {activePath && (
              <Button onClick={sharePathToComm} variant="outline" size="sm" disabled={aiLoading}>
                <Share2 size={14} className={aiLoading ? "animate-spin" : ""} /> Share My Path
              </Button>
            )}
          </div>
          <p className="font-body text-sm text-muted-foreground">Share your path journey and get feedback from peers.</p>

          {communityShares.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <MessageSquare className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No shares yet</h3>
              <p className="font-body text-muted-foreground">Be the first to share your entrepreneurial path journey!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {communityShares.map((share: any, i: number) => (
                <motion.div key={share.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center">
                        <Compass size={14} className="text-terracotta" />
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{share.share_type}</span>
                    </div>
                    <span className="font-body text-[10px] text-muted-foreground">{new Date(share.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="font-body text-sm text-foreground mb-3">{share.share_summary}</p>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1 font-body text-xs"><ThumbsUp size={12} /> {share.likes_count || 0}</span>
                    <span className="flex items-center gap-1 font-body text-xs"><MessageSquare size={12} /> {share.feedback_count || 0}</span>
                  </div>
                  {/* Feedback input */}
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={feedbackInput}
                      onChange={e => setFeedbackInput(e.target.value)}
                      placeholder="Share your feedback..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background font-body text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={() => submitFeedback(share.id)}>
                      <Send size={12} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ========== MY PATH JOURNEY ========== */}
        <TabsContent value="history" className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Your Path Journey</h2>
          {paths.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Compass className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No paths explored yet</h3>
              <p className="font-body text-muted-foreground">Start by detecting your signals and exploring path options.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paths.map((path: any, i: number) => (
                <motion.div key={path.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-lg text-foreground">{path.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full font-body text-xs ${path.status === "committed" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{path.status}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-2">{path.description}</p>
                  {path.confidence_score > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-body text-xs text-muted-foreground">Alignment:</span>
                      <Progress value={path.confidence_score * 100} className="w-24 h-1.5" />
                      <span className="font-body text-xs text-terracotta">{Math.round(path.confidence_score * 100)}%</span>
                    </div>
                  )}
                  {path.skills_matched?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {path.skills_matched.map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-[10px]">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setActivePath(path); setRoadmap(path.roadmap?.length ? { steps: path.roadmap } : null); }}>
                      <Eye size={14} /> View Details
                    </Button>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-2">{new Date(path.created_at).toLocaleDateString()}</p>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PathSelector;
