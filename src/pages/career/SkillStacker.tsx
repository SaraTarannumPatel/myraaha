import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Layers, Sparkles, Target, BookOpen, Briefcase, Zap, TrendingUp,
  Check, Clock, Pause, Play, ChevronRight, Brain, RefreshCw,
  ArrowRight, CheckCircle, Circle, BarChart3, Lightbulb, Rocket,
  Shield, Eye, Award, Heart, Link2, FileText, Users, Map, MessageCircle, Compass
} from "lucide-react";
import DirectorySearchDrawer from "@/components/directory/DirectorySearchDrawer";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";
import { useModuleProgress } from "@/hooks/useModuleProgress";

const CATEGORY_META: Record<string, { label: string; color: string; icon: any }> = {
  core: { label: "Core", color: "bg-primary text-primary-foreground", icon: Shield },
  supporting: { label: "Supporting", color: "bg-accent text-accent-foreground", icon: Layers },
  exploration: { label: "Exploration", color: "bg-secondary text-secondary-foreground", icon: Eye },
};

const STATUS_META: Record<string, { label: string; icon: any; color: string }> = {
  recommended: { label: "Recommended", icon: Sparkles, color: "text-muted-foreground" },
  accepted: { label: "Accepted", icon: Check, color: "text-primary" },
  in_progress: { label: "In Progress", icon: Play, color: "text-amber-600" },
  applied: { label: "Applied", icon: Target, color: "text-blue-600" },
  validated: { label: "Validated", icon: Award, color: "text-emerald-600" },
  postponed: { label: "Postponed", icon: Pause, color: "text-muted-foreground" },
};

const EFFORT_META: Record<string, { label: string; dots: number }> = {
  light: { label: "Light", dots: 1 },
  medium: { label: "Medium", dots: 2 },
  deep: { label: "Deep", dots: 3 },
};

const SkillStacker = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stack");
  const [stacks, setStacks] = useState<any[]>([]);
  const [activeStack, setActiveStack] = useState<any>(null);
  const [skillItems, setSkillItems] = useState<any[]>([]);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [appTasks, setAppTasks] = useState<any[]>([]);
  const [opportunityMap, setOpportunityMap] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [fitAnalysis, setFitAnalysis] = useState<any>(null);
  const [readinessData, setReadinessData] = useState<any>(null);
  const [resumeSyncData, setResumeSyncData] = useState<any>(null);
  const [checkpointSkill, setCheckpointSkill] = useState<any>(null);
  const [checkpointData, setCheckpointData] = useState({ confidence: 5, energy: "neutral" as string, reflection: "", goDeeper: false });
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [stacksRes, interestsRes] = await Promise.all([
        supabase.from("skill_stacks").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("interests").select("*").eq("user_id", user!.id),
      ]);
      setStacks(stacksRes.data || []);
      setInterests(interestsRes.data || []);
      const active = (stacksRes.data || []).find((s: any) => s.status === "active");
      if (active) {
        setActiveStack(active);
        await fetchStackDetails(active.id);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchStackDetails = async (stackId: string) => {
    const [itemsRes, checkRes, tasksRes, mapRes] = await Promise.all([
      supabase.from("skill_items").select("*").eq("stack_id", stackId).order("order_index"),
      supabase.from("skill_checkpoints").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("skill_application_tasks").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("skill_opportunity_map").select("*").eq("user_id", user!.id),
    ]);
    setSkillItems(itemsRes.data || []);
    setCheckpoints(checkRes.data || []);
    setAppTasks(tasksRes.data || []);
    setOpportunityMap(mapRes.data || []);
  };

  const callAI = async (type: string, context: any) => {
    const { data, error } = await supabase.functions.invoke("skillstacker-ai", { body: { type, context } });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  // Computed
  const filteredSkills = filterCategory === "all" ? skillItems : skillItems.filter(s => s.category === filterCategory);
  const coreCount = skillItems.filter(s => s.category === "core").length;
  const supportCount = skillItems.filter(s => s.category === "supporting").length;
  const exploreCount = skillItems.filter(s => s.category === "exploration").length;
  const completedCount = skillItems.filter(s => s.status === "validated").length;
  const inProgressCount = skillItems.filter(s => ["accepted", "in_progress", "applied"].includes(s.status)).length;
  const overallProgress = skillItems.length > 0 ? Math.round((completedCount / skillItems.length) * 100) : 0;

  // Badge milestones
  useEffect(() => {
    if (!user || completedCount === 0) return;
    const milestones: Record<number, string> = { 3: "Skill Builder", 5: "Capability Architect", 10: "Skill Master" };
    const badge = milestones[completedCount];
    if (badge) {
      supabase.from("achievements").insert({
        user_id: user.id, title: badge, achievement_type: "skillstacker",
        description: `Validated ${completedCount} skills in SkillStacker`, points: completedCount * 10,
      }).then(() => toast.success(`🏆 Badge unlocked: ${badge}!`));
    }
  }, [completedCount]);

  const generateStack = async () => {
    setGenerating(true);
    try {
      const data = await callAI("generate_stack", {
        interests: interests.map(i => i.name),
        currentSkills: skillItems.filter(s => s.status !== "postponed").map(s => s.skill_name),
        careerStage: profile?.user_type || "student",
        domains: interests.filter(i => i.category === "domain").map(i => i.name),
        goals: profile?.short_term_goals || "build capability",
        intent: profile?.active_intent || "career",
      });

      const { data: stack, error: stackErr } = await supabase.from("skill_stacks").insert({
        user_id: user!.id, title: data.stack_title || "My Skill Stack",
        domain: data.domain || "general", total_skills: (data.skills || []).length,
      }).select().single();
      if (stackErr) throw stackErr;

      const items = (data.skills || []).map((s: any, i: number) => ({
        stack_id: stack.id, user_id: user!.id, skill_name: s.skill_name,
        category: s.category || "core", why_it_matters: s.why_it_matters,
        where_it_applies: s.where_it_applies || [], effort_level: s.effort_level || "medium",
        order_index: i, learning_suggestions: s.learning_suggestions || [],
      }));
      if (items.length > 0) {
        const { data: insertedItems } = await supabase.from("skill_items").insert(items).select();
        const allTasks: any[] = [];
        (data.skills || []).forEach((s: any, idx: number) => {
          const itemId = insertedItems?.[idx]?.id;
          if (itemId && s.application_tasks) {
            s.application_tasks.forEach((t: any) => {
              allTasks.push({ skill_item_id: itemId, user_id: user!.id, title: t.title, description: t.description, task_type: t.task_type || "practice" });
            });
          }
        });
        if (allTasks.length > 0) await supabase.from("skill_application_tasks").insert(allTasks);
      }

      if (activeStack) await supabase.from("skill_stacks").update({ status: "archived" }).eq("id", activeStack.id);
      setActiveStack(stack);
      await fetchStackDetails(stack.id);
      await fetchAll();

      // Journal sync
      await supabase.from("journal_entries").insert({
        user_id: user!.id, title: `SkillStack Generated: ${data.stack_title}`,
        content: `Generated a new skill stack with ${(data.skills || []).length} skills.\n\nDomain: ${data.domain}\n${data.readiness_insights || ""}`,
        tags: ["skillstacker", "stack-generated"], mood: "motivated",
      });

      toast.success("Your personalized skill stack is ready!");
    } catch (e: any) { toast.error(e.message || "Failed to generate stack"); }
    setGenerating(false);
  };

  const restackSkills = async () => {
    setGenerating(true);
    try {
      const data = await callAI("restack", {
        currentSkills: skillItems.map(s => ({ name: s.skill_name, category: s.category, status: s.status, confidence: s.confidence_score })),
        newInterests: interests.map(i => i.name),
        newDirection: profile?.active_intent || "exploring",
        previousDomain: activeStack?.domain || "general",
        skillStatuses: skillItems.map(s => ({ name: s.skill_name, status: s.status })),
      });

      // Update existing skills
      if (data.updated_skills) {
        for (const upd of data.updated_skills) {
          const existing = skillItems.find(s => s.skill_name === upd.skill_name);
          if (existing) {
            const updates: any = { category: upd.new_category, effort_level: upd.new_effort_level };
            if (upd.action === "archive") updates.status = "postponed";
            await supabase.from("skill_items").update(updates).eq("id", existing.id);
          }
        }
      }

      // Add new skills
      if (data.new_skills?.length > 0 && activeStack) {
        const maxIdx = Math.max(0, ...skillItems.map(s => s.order_index || 0));
        const newItems = data.new_skills.map((s: any, i: number) => ({
          stack_id: activeStack.id, user_id: user!.id, skill_name: s.skill_name,
          category: s.category || "core", why_it_matters: s.why_it_matters,
          where_it_applies: s.where_it_applies || [], effort_level: s.effort_level || "medium",
          order_index: maxIdx + i + 1, learning_suggestions: s.learning_suggestions || [],
        }));
        const { data: inserted } = await supabase.from("skill_items").insert(newItems).select();
        // Add tasks for new skills
        const newTasks: any[] = [];
        data.new_skills.forEach((s: any, idx: number) => {
          const itemId = inserted?.[idx]?.id;
          if (itemId && s.application_tasks) {
            s.application_tasks.forEach((t: any) => {
              newTasks.push({ skill_item_id: itemId, user_id: user!.id, title: t.title, description: t.description, task_type: t.task_type || "practice" });
            });
          }
        });
        if (newTasks.length > 0) await supabase.from("skill_application_tasks").insert(newTasks);
      }

      await fetchStackDetails(activeStack!.id);
      toast.success(data.encouragement || "Skills re-stacked! ♻️");
    } catch (e: any) { toast.error(e.message || "Failed to re-stack"); }
    setGenerating(false);
  };

  const updateSkillStatus = async (skillId: string, status: string) => {
    const updates: any = { status };
    if (status === "accepted") updates.accepted_at = new Date().toISOString();
    if (status === "in_progress") updates.started_at = new Date().toISOString();
    if (status === "validated") updates.completed_at = new Date().toISOString();
    await supabase.from("skill_items").update(updates).eq("id", skillId);
    setSkillItems(prev => prev.map(s => s.id === skillId ? { ...s, ...updates } : s));

    const completed = skillItems.filter(s => s.id === skillId ? status === "validated" : s.status === "validated").length;
    if (activeStack) await supabase.from("skill_stacks").update({ completed_skills: completed }).eq("id", activeStack.id);

    // On validation, sync to journal + living resume
    if (status === "validated") {
      const skill = skillItems.find(s => s.id === skillId);
      if (skill) {
        await supabase.from("journal_entries").insert({
          user_id: user!.id, title: `Skill Validated: ${skill.skill_name}`,
          content: `Validated the skill "${skill.skill_name}" in SkillStacker.\n\nWhy it matters: ${skill.why_it_matters || ""}`,
          tags: ["skillstacker", "skill-validated", skill.category], mood: "accomplished",
        });
      }
    }

    toast.success(`Skill ${status === "postponed" ? "postponed" : "updated"}!`);
  };

  const submitCheckpoint = async () => {
    if (!checkpointSkill) return;
    await supabase.from("skill_checkpoints").insert({
      user_id: user!.id, skill_item_id: checkpointSkill.id,
      confidence_before: checkpointSkill.confidence_score || 5,
      confidence_after: checkpointData.confidence, energy_level: checkpointData.energy,
      went_deeper: checkpointData.goDeeper, reflection: checkpointData.reflection,
    });
    await supabase.from("skill_items").update({
      confidence_score: checkpointData.confidence, energy_feedback: checkpointData.energy,
    }).eq("id", checkpointSkill.id);
    setSkillItems(prev => prev.map(s => s.id === checkpointSkill.id ? { ...s, confidence_score: checkpointData.confidence, energy_feedback: checkpointData.energy } : s));

    // Sync reflection to journal if provided
    if (checkpointData.reflection.trim()) {
      await supabase.from("journal_entries").insert({
        user_id: user!.id, title: `Skill Checkpoint: ${checkpointSkill.skill_name}`,
        content: `Confidence: ${checkpointData.confidence}/10 · Energy: ${checkpointData.energy}\n\n${checkpointData.reflection}`,
        tags: ["skillstacker", "checkpoint"], mood: checkpointData.energy === "energizing" ? "motivated" : checkpointData.energy === "draining" ? "tired" : "reflective",
      });
    }

    setCheckpointSkill(null);
    setCheckpointData({ confidence: 5, energy: "neutral", reflection: "", goDeeper: false });
    toast.success("Checkpoint saved!");
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const updates: any = { status };
    if (status === "completed") updates.completed_at = new Date().toISOString();
    await supabase.from("skill_application_tasks").update(updates).eq("id", taskId);
    setAppTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    toast.success("Task updated!");
  };

  const getConfidenceInsights = async () => {
    setGenerating(true);
    try {
      const data = await callAI("confidence_analysis", {
        checkpoints: checkpoints.slice(0, 20),
        skillsInProgress: skillItems.filter(s => ["accepted", "in_progress", "applied"].includes(s.status)),
        energyPatterns: checkpoints.map(c => ({ skill: c.skill_item_id, energy: c.energy_level, confidence: c.confidence_after })),
        daysActive: stacks.length > 0 ? Math.ceil((Date.now() - new Date(stacks[stacks.length - 1].created_at).getTime()) / 86400000) : 0,
      });
      setAiInsights(data);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setGenerating(false);
  };

  const getFitAnalysis = async () => {
    setGenerating(true);
    try {
      const data = await callAI("skill_fit_analysis", {
        skills: skillItems.map(s => s.skill_name),
        skillLevels: skillItems.map(s => ({ name: s.skill_name, status: s.status, confidence: s.confidence_score })),
        domain: activeStack?.domain || "general",
        careerStage: profile?.user_type || "student",
        intent: profile?.active_intent || "career",
      });
      setFitAnalysis(data);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setGenerating(false);
  };

  const getOpportunityReadiness = async () => {
    setGenerating(true);
    try {
      const data = await callAI("opportunity_readiness", {
        validatedSkills: skillItems.filter(s => s.status === "validated").map(s => s.skill_name),
        inProgressSkills: skillItems.filter(s => ["in_progress", "applied"].includes(s.status)).map(s => s.skill_name),
        domain: activeStack?.domain || "general",
        careerStage: profile?.user_type || "student",
        intent: profile?.active_intent || "career",
        totalSkills: skillItems.length,
      });
      setReadinessData(data);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setGenerating(false);
  };

  const getResumeSyncInsights = async () => {
    setGenerating(true);
    try {
      const data = await callAI("resume_sync", {
        validatedSkills: skillItems.filter(s => s.status === "validated").map(s => s.skill_name),
        appliedSkills: skillItems.filter(s => s.status === "applied").map(s => s.skill_name),
        domain: activeStack?.domain || "general",
        checkpointsCount: checkpoints.length,
        tasksCompleted: appTasks.filter(t => t.status === "completed").length,
      });
      setResumeSyncData(data);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setGenerating(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Layers className="h-10 w-10 text-primary mx-auto animate-pulse" />
        <p className="text-muted-foreground font-body">Loading SkillStacker...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10"><Layers className="h-6 w-6 text-primary" /></div>
          <div className="flex-1">
            <h1 className="text-2xl font-display text-foreground">SkillStacker</h1>
            <p className="text-sm text-muted-foreground font-body">Build capability with clarity, confidence, and context.</p>
          </div>
          <DirectorySearchDrawer mode="skills" triggerLabel="Browse Skills" />
        </div>
        <ModuleSearchBar
          placeholder="Search skills, domains, career paths..."
          sources={["skills", "careers", "domains"]}
          showAiBadge
          compact
          onSearch={(q) => {
            if (q.length > 2) {
              const lower = q.toLowerCase();
              const filtered = skillItems.filter(s =>
                s.skill_name?.toLowerCase().includes(lower) ||
                s.category?.toLowerCase().includes(lower)
              );
              if (filtered.length > 0) setFilterCategory("all");
            }
          }}
          onSelect={(item) => {
            toast.info(`Selected: ${item.title} — use this to add skills to your stack`);
          }}
        />
        <p className="text-sm text-muted-foreground/80 italic font-body">
          "Here's what you need to build — based on who you are, what you like, and where you want to go."
        </p>
      </motion.div>

      {/* Quick Stats */}
      {activeStack && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: "Total Skills", value: skillItems.length, icon: Layers },
            { label: "Core", value: coreCount, icon: Shield },
            { label: "In Progress", value: inProgressCount, icon: Play },
            { label: "Validated", value: completedCount, icon: CheckCircle },
            { label: "Progress", value: `${overallProgress}%`, icon: TrendingUp },
          ].map((stat, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-3 flex items-center gap-2">
                <stat.icon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Progress Bar */}
      {activeStack && (
        <Card className="border-border/50">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-body">Stack: {activeStack.title}</span>
              <span className="text-primary font-semibold">{overallProgress}% complete</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">No one is expected to know everything. You'll build this step by step.</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="stack" className="gap-1 text-xs"><Layers className="h-3.5 w-3.5" /> Skill Stack</TabsTrigger>
          <TabsTrigger value="progress" className="gap-1 text-xs"><TrendingUp className="h-3.5 w-3.5" /> Progress</TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1 text-xs"><Target className="h-3.5 w-3.5" /> Apply</TabsTrigger>
          <TabsTrigger value="fit" className="gap-1 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Fit & Ready</TabsTrigger>
          <TabsTrigger value="insights" className="gap-1 text-xs"><Brain className="h-3.5 w-3.5" /> AI Insights</TabsTrigger>
          <TabsTrigger value="connect" className="gap-1 text-xs"><Link2 className="h-3.5 w-3.5" /> Connect</TabsTrigger>
        </TabsList>

        {/* SKILL STACK TAB */}
        <TabsContent value="stack" className="space-y-4">
          {!activeStack ? (
            <Card className="border-dashed border-2 border-primary/30">
              <CardContent className="p-8 text-center space-y-4">
                <Layers className="h-12 w-12 text-primary/50 mx-auto" />
                <h3 className="text-lg font-display text-foreground">Generate Your Skill Stack</h3>
                <p className="text-muted-foreground font-body text-sm max-w-md mx-auto">
                  Based on your interests, goals, and exploration patterns, we'll create a personalized skill roadmap — grouping skills into what's essential, helpful, and worth exploring.
                </p>
                <Button onClick={generateStack} disabled={generating} className="gap-2">
                  {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Generating..." : "Generate My Stack"}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant={filterCategory === "all" ? "default" : "outline"} size="sm" onClick={() => setFilterCategory("all")}>All ({skillItems.length})</Button>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <Button key={key} variant={filterCategory === key ? "default" : "outline"} size="sm" onClick={() => setFilterCategory(key)} className="gap-1">
                    <meta.icon className="h-3 w-3" /> {meta.label} ({skillItems.filter(s => s.category === key).length})
                  </Button>
                ))}
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={restackSkills} disabled={generating} className="gap-1">
                  <RefreshCw className={`h-3 w-3 ${generating ? "animate-spin" : ""}`} /> Re-Stack
                </Button>
              </div>

              <AnimatePresence mode="popLayout">
                {filteredSkills.map((skill, i) => {
                  const catMeta = CATEGORY_META[skill.category] || CATEGORY_META.core;
                  const stMeta = STATUS_META[skill.status] || STATUS_META.recommended;
                  const effortMeta = EFFORT_META[skill.effort_level] || EFFORT_META.medium;
                  const skillTasks = appTasks.filter(t => t.skill_item_id === skill.id);
                  return (
                    <motion.div key={skill.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }}>
                      <Card className="border-border/50 hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-foreground">{skill.skill_name}</h4>
                                <Badge className={catMeta.color + " text-xs"}>{catMeta.label}</Badge>
                                <Badge variant="outline" className="text-xs gap-1">
                                  <stMeta.icon className={`h-3 w-3 ${stMeta.color}`} /> {stMeta.label}
                                </Badge>
                              </div>
                              {skill.why_it_matters && <p className="text-sm text-muted-foreground">{skill.why_it_matters}</p>}
                            </div>
                            <div className="flex items-center gap-0.5" title={`Effort: ${effortMeta.label}`}>
                              {Array.from({ length: 3 }).map((_, d) => (
                                <div key={d} className={`w-2 h-2 rounded-full ${d < effortMeta.dots ? "bg-primary" : "bg-muted"}`} />
                              ))}
                            </div>
                          </div>

                          {skill.where_it_applies?.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {skill.where_it_applies.map((w: string, j: number) => (
                                <Badge key={j} variant="secondary" className="text-xs">{w}</Badge>
                              ))}
                            </div>
                          )}

                          {/* Learning suggestions */}
                          {skill.learning_suggestions?.length > 0 && (
                            <div className="border-t border-border/50 pt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><BookOpen className="h-3 w-3" /> Learning Path:</p>
                              <div className="flex flex-wrap gap-1">
                                {skill.learning_suggestions.map((l: string, j: number) => (
                                  <Badge key={j} variant="outline" className="text-xs">{l}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {skill.confidence_score && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Confidence:</span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 10 }).map((_, d) => (
                                  <div key={d} className={`w-2.5 h-1.5 rounded-sm ${d < skill.confidence_score ? "bg-primary" : "bg-muted"}`} />
                                ))}
                              </div>
                              <span className="text-xs font-medium text-foreground">{skill.confidence_score}/10</span>
                              {skill.energy_feedback && <Badge variant="outline" className="text-xs ml-1">{skill.energy_feedback}</Badge>}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 flex-wrap">
                            {skill.status === "recommended" && (
                              <>
                                <Button size="sm" onClick={() => updateSkillStatus(skill.id, "accepted")} className="gap-1"><Check className="h-3 w-3" /> Accept</Button>
                                <Button size="sm" variant="outline" onClick={() => updateSkillStatus(skill.id, "postponed")} className="gap-1"><Pause className="h-3 w-3" /> Postpone</Button>
                              </>
                            )}
                            {skill.status === "accepted" && (
                              <Button size="sm" onClick={() => updateSkillStatus(skill.id, "in_progress")} className="gap-1"><Play className="h-3 w-3" /> Start Learning</Button>
                            )}
                            {skill.status === "in_progress" && (
                              <>
                                <Button size="sm" onClick={() => updateSkillStatus(skill.id, "applied")} className="gap-1"><Target className="h-3 w-3" /> Mark Applied</Button>
                                <Button size="sm" variant="outline" onClick={() => { setCheckpointSkill(skill); setCheckpointData({ confidence: skill.confidence_score || 5, energy: "neutral", reflection: "", goDeeper: false }); }} className="gap-1"><Heart className="h-3 w-3" /> Checkpoint</Button>
                              </>
                            )}
                            {skill.status === "applied" && (
                              <Button size="sm" onClick={() => updateSkillStatus(skill.id, "validated")} className="gap-1"><Award className="h-3 w-3" /> Validate</Button>
                            )}
                            {skill.status === "postponed" && (
                              <Button size="sm" variant="outline" onClick={() => updateSkillStatus(skill.id, "accepted")} className="gap-1"><Play className="h-3 w-3" /> Resume</Button>
                            )}
                          </div>

                          {skillTasks.length > 0 && (
                            <div className="border-t border-border/50 pt-2 mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Application Tasks:</p>
                              <div className="space-y-1">
                                {skillTasks.slice(0, 2).map(t => (
                                  <div key={t.id} className="flex items-center justify-between text-xs">
                                    <span className={t.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}>{t.title}</span>
                                    {t.status !== "completed" && (
                                      <Button variant="ghost" size="sm" className="h-5 text-xs" onClick={() => updateTaskStatus(t.id, "completed")}>
                                        <CheckCircle className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </>
          )}
        </TabsContent>

        {/* PROGRESS TAB */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-lg font-display">Skill Progress Visualization</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {["recommended", "accepted", "in_progress", "applied", "validated"].map(status => {
                const items = skillItems.filter(s => s.status === status);
                const meta = STATUS_META[status];
                return (
                  <div key={status}>
                    <div className="flex items-center gap-2 mb-2">
                      <meta.icon className={`h-4 w-4 ${meta.color}`} />
                      <span className="text-sm font-medium text-foreground">{meta.label}</span>
                      <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                    </div>
                    {items.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {items.map(s => (
                          <Badge key={s.id} variant="outline" className="text-xs">{s.skill_name}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No skills in this stage yet</p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Resume Sync */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><FileText className="h-5 w-5" /> Resume Sync</CardTitle>
              <CardDescription>See how your skills translate to your Living Resume narrative.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={getResumeSyncInsights} disabled={generating || completedCount === 0} size="sm" className="gap-2">
                {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Resume Insights
              </Button>
              {resumeSyncData && (
                <div className="space-y-3">
                  {resumeSyncData.skill_narrative && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm">{resumeSyncData.skill_narrative}</p>
                    </div>
                  )}
                  {resumeSyncData.suggested_headline_update && (
                    <p className="text-xs text-muted-foreground">Suggested headline: <strong className="text-foreground">{resumeSyncData.suggested_headline_update}</strong></p>
                  )}
                  {resumeSyncData.highlights?.map((h: any, i: number) => (
                    <div key={i} className="p-2 rounded bg-muted text-xs">
                      <p className="font-medium">{h.skill}</p>
                      <p className="text-muted-foreground">{h.achievement} — {h.impact}</p>
                    </div>
                  ))}
                  {resumeSyncData.growth_story && <p className="text-sm italic text-muted-foreground">{resumeSyncData.growth_story}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checkpoint History */}
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-lg font-display">Recent Checkpoints</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {checkpoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">Complete checkpoints on in-progress skills to track confidence & energy.</p>
              ) : checkpoints.slice(0, 8).map(cp => {
                const skill = skillItems.find(s => s.id === cp.skill_item_id);
                return (
                  <div key={cp.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                    <Heart className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{skill?.skill_name || "Skill"}</p>
                      <p className="text-xs text-muted-foreground">Confidence: {cp.confidence_before}→{cp.confidence_after} · Energy: {cp.energy_level}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(cp.created_at).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* APPLICATION TASKS TAB */}
        <TabsContent value="tasks" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display">Skill Application Tasks</CardTitle>
              <CardDescription>Small, real-world tasks to practice and apply your skills without pressure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {appTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Generate a skill stack to get application tasks.</p>
              ) : (
                ["pending", "in_progress", "completed"].map(status => {
                  const tasks = appTasks.filter(t => t.status === status);
                  if (tasks.length === 0) return null;
                  return (
                    <div key={status}>
                      <h4 className="text-sm font-medium text-foreground capitalize mb-2">{status.replace("_", " ")} ({tasks.length})</h4>
                      {tasks.map(t => {
                        const skill = skillItems.find(s => s.id === t.skill_item_id);
                        return (
                          <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{t.title}</p>
                              {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
                              <div className="flex gap-1 mt-1">
                                {skill && <Badge variant="secondary" className="text-xs">{skill.skill_name}</Badge>}
                                <Badge variant="outline" className="text-xs capitalize">{t.task_type}</Badge>
                              </div>
                            </div>
                            {status === "pending" && (
                              <Button size="sm" variant="outline" onClick={() => updateTaskStatus(t.id, "in_progress")} className="gap-1"><Play className="h-3 w-3" /> Start</Button>
                            )}
                            {status === "in_progress" && (
                              <Button size="sm" onClick={() => updateTaskStatus(t.id, "completed")} className="gap-1"><Check className="h-3 w-3" /> Done</Button>
                            )}
                            {status === "completed" && <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />}
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FIT & READINESS TAB */}
        <TabsContent value="fit" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display">Skill vs Fit Analyzer</CardTitle>
              <CardDescription>See how your skills align with real-world opportunities.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={getFitAnalysis} disabled={generating || skillItems.length === 0} className="gap-2">
                {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                {generating ? "Analyzing..." : "Run Fit Analysis"}
              </Button>

              {fitAnalysis?.fit_scores?.map((fit: any, i: number) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-foreground">{fit.role_or_opportunity}</h4>
                      <Badge className={fit.fit_percentage >= 70 ? "bg-primary text-primary-foreground" : fit.fit_percentage >= 40 ? "bg-accent text-accent-foreground" : "bg-destructive text-destructive-foreground"}>
                        {fit.fit_percentage}% fit
                      </Badge>
                    </div>
                    <Progress value={fit.fit_percentage} className="h-2" />
                    {fit.matching_skills?.length > 0 && (
                      <div><span className="text-xs text-muted-foreground">Matching: </span>{fit.matching_skills.map((s: string, j: number) => <Badge key={j} variant="secondary" className="text-xs mr-1">{s}</Badge>)}</div>
                    )}
                    {fit.missing_skills?.length > 0 && (
                      <div><span className="text-xs text-muted-foreground">Gaps: </span>{fit.missing_skills.map((s: string, j: number) => <Badge key={j} variant="outline" className="text-xs mr-1 text-destructive">{s}</Badge>)}</div>
                    )}
                    {fit.estimated_time_to_ready && <p className="text-xs text-muted-foreground">⏱ {fit.estimated_time_to_ready}</p>}
                  </CardContent>
                </Card>
              ))}

              {fitAnalysis?.market_insight && (
                <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <p className="text-sm text-foreground"><Lightbulb className="h-4 w-4 inline text-accent mr-1" />{fitAnalysis.market_insight}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opportunity Readiness */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><Rocket className="h-5 w-5" /> Opportunity Readiness</CardTitle>
              <CardDescription>Which opportunities become viable as your skills progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={getOpportunityReadiness} disabled={generating || skillItems.length === 0} size="sm" className="gap-2">
                {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Check Readiness
              </Button>

              {readinessData && (
                <div className="space-y-4">
                  {readinessData.readiness_score !== undefined && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">Readiness Score:</span>
                      <Badge className="bg-primary text-primary-foreground text-sm px-3">{readinessData.readiness_score}%</Badge>
                    </div>
                  )}

                  {readinessData.ready_now?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1"><CheckCircle className="h-4 w-4 text-emerald-500" /> Ready Now</h4>
                      {readinessData.ready_now.map((r: any, i: number) => (
                        <div key={i} className="p-2 rounded bg-muted text-xs mb-1">
                          <span className="font-medium">{r.opportunity}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{r.type}</Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {readinessData.almost_ready?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1"><Clock className="h-4 w-4 text-amber-500" /> Almost Ready</h4>
                      {readinessData.almost_ready.map((r: any, i: number) => (
                        <div key={i} className="p-2 rounded bg-muted text-xs mb-1">
                          <span className="font-medium">{r.opportunity}</span>
                          <span className="text-muted-foreground ml-2">Missing: {r.missing?.join(", ")}</span>
                          <span className="ml-2">⏱ {r.time_to_ready}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {readinessData.next_unlock && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm"><ArrowRight className="h-4 w-4 inline mr-1 text-primary" /> <strong>Next unlock:</strong> {readinessData.next_unlock}</p>
                    </div>
                  )}

                  {readinessData.message && <p className="text-sm italic text-muted-foreground">{readinessData.message}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI INSIGHTS TAB */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display">AI Confidence & Energy Insights</CardTitle>
              <CardDescription>Understand your learning patterns and get personalized guidance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={getConfidenceInsights} disabled={generating} className="gap-2">
                {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                {generating ? "Analyzing..." : "Get AI Insights"}
              </Button>

              {aiInsights && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-foreground">
                      Confidence Trend: <span className="capitalize">{aiInsights.overall_confidence_trend}</span>
                    </p>
                    {aiInsights.energy_summary && <p className="text-sm text-muted-foreground mt-1">{aiInsights.energy_summary}</p>}
                  </div>

                  {aiInsights.strengths?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">💪 Strengths</h4>
                      <div className="flex gap-1 flex-wrap">{aiInsights.strengths.map((s: string, i: number) => <Badge key={i} className="bg-primary text-primary-foreground text-xs">{s}</Badge>)}</div>
                    </div>
                  )}

                  {aiInsights.growth_areas?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">🌱 Growth Areas</h4>
                      <div className="flex gap-1 flex-wrap">{aiInsights.growth_areas.map((s: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}</div>
                    </div>
                  )}

                  {aiInsights.recommendations?.map((rec: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-secondary/50 text-sm">
                      <span className="font-medium text-foreground">{rec.skill}:</span> <span className="text-muted-foreground">{rec.suggestion}</span>
                    </div>
                  ))}

                  {aiInsights.encouragement && (
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                      <p className="text-sm text-foreground italic">✨ {aiInsights.encouragement}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONNECT TAB */}
        <TabsContent value="connect" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">Connected Features</CardTitle>
              <CardDescription>SkillStacker is where clarity becomes capability — and it connects deeply with your entire journey.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Curiosity Compass", desc: "Interest signals fuel your skill suggestions", icon: Compass, path: "/dashboard/curiosity-compass" },
                  { label: "AI Roadmaps", desc: "Skills sequence into your roadmap goals", icon: Map, path: "/dashboard/roadmap" },
                  { label: "SelfGraph", desc: "Capability & energy patterns refine your stack", icon: Brain, path: "/dashboard/selfgraph" },
                  { label: "Content Library", desc: "Learning capsules mapped to each skill", icon: BookOpen, path: "/dashboard/content-library" },
                  { label: "Project Playground", desc: "Apply skills through real projects", icon: Rocket, path: "/dashboard/project-playground" },
                  { label: "Living Resume", desc: "Skills auto-sync to your career narrative", icon: FileText, path: "/dashboard/living-resume" },
                  { label: "Job Matching", desc: "Skill progress unlocks opportunities", icon: Briefcase, path: "/dashboard/job-matching" },
                  { label: "Mentor Matchmaking", desc: "Mentors guide based on your skill gaps", icon: Users, path: "/dashboard/mentor-matchmaking" },
                  { label: "Virtual Coach", desc: "AI uses skill gaps to suggest next actions", icon: MessageCircle, path: "/dashboard/career-coach" },
                  { label: "Journal", desc: "Reflect on your learning journey", icon: Heart, path: "/dashboard/journal" },
                ].map((f, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(f.path)}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/80 text-left transition-colors"
                  >
                    <f.icon className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
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

      {/* Checkpoint Modal */}
      <AnimatePresence>
        {checkpointSkill && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setCheckpointSkill(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="bg-card rounded-xl border border-border p-6 max-w-md w-full space-y-4 shadow-lg">
              <h3 className="font-display text-lg text-foreground">Checkpoint: {checkpointSkill.skill_name}</h3>
              <div>
                <label className="text-sm text-muted-foreground">How confident do you feel? ({checkpointData.confidence}/10)</label>
                <input type="range" min={1} max={10} value={checkpointData.confidence} onChange={e => setCheckpointData(prev => ({ ...prev, confidence: parseInt(e.target.value) }))} className="w-full mt-1" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Did this feel...</label>
                <div className="flex gap-2 mt-1">
                  {["energizing", "neutral", "draining"].map(e => (
                    <Button key={e} size="sm" variant={checkpointData.energy === e ? "default" : "outline"} onClick={() => setCheckpointData(prev => ({ ...prev, energy: e }))} className="capitalize">{e}</Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Any reflections?</label>
                <Textarea value={checkpointData.reflection} onChange={e => setCheckpointData(prev => ({ ...prev, reflection: e.target.value }))} placeholder="Optional..." className="mt-1" rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={checkpointData.goDeeper} onChange={e => setCheckpointData(prev => ({ ...prev, goDeeper: e.target.checked }))} id="deeper" />
                <label htmlFor="deeper" className="text-sm text-foreground">I'd like to go deeper on this skill</label>
              </div>
              <div className="flex gap-2">
                <Button onClick={submitCheckpoint} className="flex-1 gap-1"><Check className="h-4 w-4" /> Save Checkpoint</Button>
                <Button variant="outline" onClick={() => setCheckpointSkill(null)}>Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SkillStacker;
