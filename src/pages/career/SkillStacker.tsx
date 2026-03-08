import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  Shield, Eye, Award, Heart
} from "lucide-react";

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

  const generateStack = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("skillstacker-ai", {
        body: {
          type: "generate_stack",
          context: {
            interests: interests.map(i => i.name),
            currentSkills: skillItems.filter(s => s.status !== "postponed").map(s => s.skill_name),
            careerStage: profile?.user_type || "student",
            domains: interests.filter(i => i.category === "domain").map(i => i.name),
            goals: profile?.short_term_goals || "build capability",
            intent: profile?.active_intent || "career",
          },
        },
      });
      if (error) throw error;

      // Create stack
      const { data: stack, error: stackErr } = await supabase.from("skill_stacks").insert({
        user_id: user!.id,
        title: data.stack_title || "My Skill Stack",
        domain: data.domain || "general",
        total_skills: (data.skills || []).length,
      }).select().single();
      if (stackErr) throw stackErr;

      // Insert skill items
      const items = (data.skills || []).map((s: any, i: number) => ({
        stack_id: stack.id,
        user_id: user!.id,
        skill_name: s.skill_name,
        category: s.category || "core",
        why_it_matters: s.why_it_matters,
        where_it_applies: s.where_it_applies || [],
        effort_level: s.effort_level || "medium",
        order_index: i,
      }));
      if (items.length > 0) {
        const { data: insertedItems } = await supabase.from("skill_items").insert(items).select();
        // Insert application tasks for each skill
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

      // Archive old active stacks
      if (activeStack) await supabase.from("skill_stacks").update({ status: "archived" }).eq("id", activeStack.id);

      setActiveStack(stack);
      await fetchStackDetails(stack.id);
      await fetchAll();
      toast.success("Your personalized skill stack is ready!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate stack");
    }
    setGenerating(false);
  };

  const updateSkillStatus = async (skillId: string, status: string) => {
    const updates: any = { status };
    if (status === "accepted") updates.accepted_at = new Date().toISOString();
    if (status === "in_progress") updates.started_at = new Date().toISOString();
    if (status === "validated") updates.completed_at = new Date().toISOString();
    await supabase.from("skill_items").update(updates).eq("id", skillId);
    setSkillItems(prev => prev.map(s => s.id === skillId ? { ...s, ...updates } : s));

    // Update stack completion count
    const completed = skillItems.filter(s => s.id === skillId ? status === "validated" : s.status === "validated").length;
    if (activeStack) await supabase.from("skill_stacks").update({ completed_skills: completed }).eq("id", activeStack.id);
    toast.success(`Skill ${status === "postponed" ? "postponed" : "updated"}!`);
  };

  const submitCheckpoint = async () => {
    if (!checkpointSkill) return;
    await supabase.from("skill_checkpoints").insert({
      user_id: user!.id,
      skill_item_id: checkpointSkill.id,
      confidence_before: checkpointSkill.confidence_score || 5,
      confidence_after: checkpointData.confidence,
      energy_level: checkpointData.energy,
      went_deeper: checkpointData.goDeeper,
      reflection: checkpointData.reflection,
    });
    await supabase.from("skill_items").update({
      confidence_score: checkpointData.confidence,
      energy_feedback: checkpointData.energy,
    }).eq("id", checkpointSkill.id);
    setSkillItems(prev => prev.map(s => s.id === checkpointSkill.id ? { ...s, confidence_score: checkpointData.confidence, energy_feedback: checkpointData.energy } : s));
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
      const { data, error } = await supabase.functions.invoke("skillstacker-ai", {
        body: {
          type: "confidence_analysis",
          context: {
            checkpoints: checkpoints.slice(0, 20),
            skillsInProgress: skillItems.filter(s => ["accepted", "in_progress", "applied"].includes(s.status)),
            energyPatterns: checkpoints.map(c => ({ skill: c.skill_item_id, energy: c.energy_level, confidence: c.confidence_after })),
            daysActive: stacks.length > 0 ? Math.ceil((Date.now() - new Date(stacks[stacks.length - 1].created_at).getTime()) / 86400000) : 0,
          },
        },
      });
      if (error) throw error;
      setAiInsights(data);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setGenerating(false);
  };

  const getFitAnalysis = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("skillstacker-ai", {
        body: {
          type: "skill_fit_analysis",
          context: {
            skills: skillItems.map(s => s.skill_name),
            skillLevels: skillItems.map(s => ({ name: s.skill_name, status: s.status, confidence: s.confidence_score })),
            domain: activeStack?.domain || "general",
            careerStage: profile?.user_type || "student",
            intent: profile?.active_intent || "career",
          },
        },
      });
      if (error) throw error;
      setFitAnalysis(data);
    } catch (e: any) { toast.error(e.message || "Failed"); }
    setGenerating(false);
  };

  const filteredSkills = filterCategory === "all" ? skillItems : skillItems.filter(s => s.category === filterCategory);
  const coreCount = skillItems.filter(s => s.category === "core").length;
  const supportCount = skillItems.filter(s => s.category === "supporting").length;
  const exploreCount = skillItems.filter(s => s.category === "exploration").length;
  const completedCount = skillItems.filter(s => s.status === "validated").length;
  const inProgressCount = skillItems.filter(s => ["accepted", "in_progress", "applied"].includes(s.status)).length;
  const overallProgress = skillItems.length > 0 ? Math.round((completedCount / skillItems.length) * 100) : 0;

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
          <div>
            <h1 className="text-2xl font-display text-foreground">SkillStacker</h1>
            <p className="text-sm text-muted-foreground font-body">Build capability with clarity, confidence, and context.</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground/80 italic font-body">
          "Here's what you need to build — based on who you are, what you like, and where you want to go."
        </p>
      </motion.div>

      {/* Quick Stats */}
      {activeStack && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="stack">Skill Stack</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="tasks">Apply</TabsTrigger>
          <TabsTrigger value="fit">Fit & Ready</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
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
                <Button variant="outline" size="sm" onClick={generateStack} disabled={generating} className="gap-1">
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

                          {/* Linked tasks preview */}
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
