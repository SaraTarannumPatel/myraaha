import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Map, Plus, Check, Circle, Clock, SkipForward, Sparkles, Target,
  BookOpen, Users, Briefcase, Compass, ChevronRight, Brain, Zap,
  TrendingUp, MessageSquare, Award, RefreshCw, ArrowRight, Lightbulb
} from "lucide-react";

const PHASES = [
  { id: "exploration", label: "Exploration", icon: Compass, color: "bg-blue-500" },
  { id: "learning", label: "Learning", icon: BookOpen, color: "bg-emerald-500" },
  { id: "practice", label: "Practice", icon: Target, color: "bg-amber-500" },
  { id: "connection", label: "Connection", icon: Users, color: "bg-purple-500" },
  { id: "opportunity", label: "Opportunity", icon: Briefcase, color: "bg-rose-500" },
];

const CATEGORIES = {
  discovery: { icon: Compass, label: "Discovery", color: "text-blue-500" },
  learning: { icon: BookOpen, label: "Learning", color: "text-emerald-500" },
  project: { icon: Target, label: "Project", color: "text-amber-500" },
  networking: { icon: Users, label: "Networking", color: "text-purple-500" },
  application: { icon: Briefcase, label: "Application", color: "text-rose-500" },
  reflection: { icon: MessageSquare, label: "Reflection", color: "text-cyan-500" },
};

const Roadmap = () => {
  const { user } = useAuth();
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
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goals, setGoals] = useState({ shortTerm: "", longTerm: "" });

  useEffect(() => {
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);

    const [roadmapsRes, profileRes, interestsRes, skillsRes] = await Promise.all([
      supabase.from("roadmaps").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("interests").select("*").eq("user_id", user.id),
      supabase.from("experiences").select("skills_used").eq("user_id", user.id),
    ]);

    setRoadmaps(roadmapsRes.data || []);
    setProfile(profileRes.data);
    setInterests(interestsRes.data || []);
    
    const allSkills = skillsRes.data?.flatMap(e => e.skills_used || []) || [];
    setSkills([...new Set(allSkills)]);

    if (roadmapsRes.data && roadmapsRes.data.length > 0) {
      const active = roadmapsRes.data.find(r => r.is_active) || roadmapsRes.data[0];
      setActiveRoadmap(active);
      fetchSteps(active.id);
      // Use any cast for new columns not yet in generated types
      const activeAny = active as any;
      if (activeAny.short_term_goals || activeAny.long_term_goals) {
        setGoals({ shortTerm: activeAny.short_term_goals || "", longTerm: activeAny.long_term_goals || "" });
      }
    }
    setLoading(false);
  };

  const fetchSteps = async (roadmapId: string) => {
    const { data } = await supabase
      .from("roadmap_steps")
      .select("*")
      .eq("roadmap_id", roadmapId)
      .order("order_index", { ascending: true });
    setSteps(data || []);
  };

  const generateAIRoadmap = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("roadmap-ai", {
        body: {
          type: "generate_roadmap",
          context: {
            shortTermGoals: goals.shortTerm || profile?.short_term_goals,
            longTermGoals: goals.longTerm || profile?.long_term_goals,
            interests: interests.map(i => i.name),
            skills,
            industry: profile?.industry,
            careerStage: profile?.career_stage,
            areasOfFocus: profile?.areas_of_focus,
          },
        },
      });

      if (error) throw error;

      // Create roadmap
      const { data: newRoadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .insert({
          user_id: user.id,
          title: data.title || "My Career Roadmap",
          description: data.description,
          intent: "career",
          short_term_goals: goals.shortTerm,
          long_term_goals: goals.longTerm,
          skill_gaps: data.skill_gaps || [],
          ai_suggestions: data,
          is_active: true,
        })
        .select()
        .single();

      if (roadmapError) throw roadmapError;

      // Deactivate other roadmaps
      await supabase
        .from("roadmaps")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .neq("id", newRoadmap.id);

      // Create steps from AI response
      const allSteps: any[] = [];
      let orderIndex = 0;

      for (const phase of data.phases || []) {
        for (const step of phase.steps || []) {
          allSteps.push({
            roadmap_id: newRoadmap.id,
            user_id: user.id,
            title: step.title,
            description: step.description,
            phase: phase.name,
            category: step.category,
            skill_tags: step.skill_tags || [],
            priority: step.priority || "medium",
            ai_generated: true,
            order_index: orderIndex++,
          });
        }
      }

      if (allSteps.length > 0) {
        await supabase.from("roadmap_steps").insert(allSteps);
      }

      setActiveRoadmap(newRoadmap);
      fetchSteps(newRoadmap.id);
      fetchAll();
      toast.success("AI Roadmap generated successfully!");
    } catch (error) {
      console.error("Error generating roadmap:", error);
      toast.error("Failed to generate roadmap");
    } finally {
      setGenerating(false);
    }
  };

  const getNextStepSuggestions = async () => {
    if (!activeRoadmap) return;

    try {
      const completed = steps.filter(s => s.status === "completed");
      const inProgress = steps.filter(s => s.status === "in_progress");
      const skipped = steps.filter(s => s.status === "skipped");

      const { data, error } = await supabase.functions.invoke("roadmap-ai", {
        body: {
          type: "suggest_next_steps",
          context: {
            completedSteps: completed.map(s => s.title),
            inProgressSteps: inProgress.map(s => s.title),
            skippedSteps: skipped.map(s => s.title),
            currentPhase: activeRoadmap.current_phase,
            goals: `${activeRoadmap.short_term_goals} | ${activeRoadmap.long_term_goals}`,
          },
        },
      });

      if (error) throw error;
      setAiSuggestions(data);
      toast.success("AI suggestions loaded!");
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast.error("Failed to get AI suggestions");
    }
  };

  const analyzeProgress = async () => {
    if (!activeRoadmap) return;

    try {
      const completed = steps.filter(s => s.status === "completed");
      const { data, error } = await supabase.functions.invoke("roadmap-ai", {
        body: {
          type: "analyze_progress",
          context: {
            totalSteps: steps.length,
            completedCount: completed.length,
            currentPhase: activeRoadmap.current_phase,
            shortTermGoals: activeRoadmap.short_term_goals,
            longTermGoals: activeRoadmap.long_term_goals,
            daysActive: Math.floor((Date.now() - new Date(activeRoadmap.created_at).getTime()) / (1000 * 60 * 60 * 24)),
            recentActivity: completed.slice(-5).map(s => s.title),
          },
        },
      });

      if (error) throw error;
      setProgressAnalysis(data);
    } catch (error) {
      console.error("Error analyzing progress:", error);
    }
  };

  const updateStepStatus = async (stepId: string, status: "not_started" | "in_progress" | "completed" | "skipped") => {
    await supabase.from("roadmap_steps").update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    }).eq("id", stepId);

    fetchSteps(activeRoadmap.id);
    
    // Update roadmap progress (use raw query since progress_percentage is new column)
    const completed = steps.filter(s => s.status === "completed" || (s.id === stepId && status === "completed")).length;
    const progressVal = Math.round((completed / steps.length) * 100);
    await supabase.from("roadmaps").update({ description: `Progress: ${progressVal}%` } as any).eq("id", activeRoadmap.id);
    
    if (status === "completed") {
      toast.success("Step completed! 🎉");
    }
  };

  const saveGoals = async () => {
    if (!activeRoadmap) return;
    // Cast as any for new columns not yet in generated types
    await supabase.from("roadmaps").update({
      description: `Goals: ${goals.shortTerm} | ${goals.longTerm}`,
    } as any).eq("id", activeRoadmap.id);
    setShowGoalForm(false);
    toast.success("Goals saved!");
  };

  const completedCount = steps.filter(s => s.status === "completed").length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  const stepsByPhase = PHASES.reduce((acc, phase) => {
    acc[phase.id] = steps.filter(s => s.phase === phase.id);
    return acc;
  }, {} as Record<string, any[]>);

  const currentPhaseIndex = PHASES.findIndex(p => p.id === activeRoadmap?.current_phase) || 0;

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check size={16} className="text-accent" />;
      case "in_progress": return <Clock size={16} className="text-amber-500" />;
      case "skipped": return <SkipForward size={16} className="text-muted-foreground" />;
      default: return <Circle size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center">
              <Map size={24} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">AI Powered Roadmaps</h1>
              <p className="font-body text-sm text-muted-foreground">Your personalized journey to career success</p>
            </div>
          </div>
          <Button onClick={getNextStepSuggestions} variant="outline" className="gap-2">
            <Brain size={18} /> AI Suggestions
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      {activeRoadmap && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <TrendingUp className="text-accent" size={20} />
              </div>
              <div>
                <p className="text-2xl font-display text-foreground">{Math.round(progress)}%</p>
                <p className="text-xs text-muted-foreground">Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Check className="text-emerald-500" size={20} />
              </div>
              <div>
                <p className="text-2xl font-display text-foreground">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Clock className="text-amber-500" size={20} />
              </div>
              <div>
                <p className="text-2xl font-display text-foreground">{steps.filter(s => s.status === "in_progress").length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Target className="text-blue-500" size={20} />
              </div>
              <div>
                <p className="text-2xl font-display text-foreground">{steps.length - completedCount}</p>
                <p className="text-xs text-muted-foreground">Remaining</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          {activeRoadmap ? (
            <>
              {/* Phase Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Your Journey Phases</CardTitle>
                  <CardDescription>Track your progress through each phase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    {PHASES.map((phase, i) => {
                      const PhaseIcon = phase.icon;
                      const phaseSteps = stepsByPhase[phase.id] || [];
                      const phaseCompleted = phaseSteps.filter(s => s.status === "completed").length;
                      const phaseProgress = phaseSteps.length > 0 ? (phaseCompleted / phaseSteps.length) * 100 : 0;
                      const isActive = activeRoadmap.current_phase === phase.id;
                      const isPast = i < currentPhaseIndex;

                      return (
                        <div key={phase.id} className="flex flex-col items-center gap-2 flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isPast ? phase.color : isActive ? `${phase.color} ring-4 ring-offset-2 ring-accent/30` : "bg-muted"
                          }`}>
                            <PhaseIcon size={20} className={isPast || isActive ? "text-white" : "text-muted-foreground"} />
                          </div>
                          <span className={`text-xs font-body ${isActive ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                            {phase.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {phaseCompleted}/{phaseSteps.length}
                          </span>
                          {i < PHASES.length - 1 && (
                            <div className={`absolute w-full h-0.5 ${isPast ? "bg-accent" : "bg-muted"}`} style={{ left: "50%", top: "24px" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    {Math.round(progress)}% complete • {completedCount} of {steps.length} steps done
                  </p>
                </CardContent>
              </Card>

              {/* Steps by Phase */}
              <div className="space-y-4">
                {PHASES.map(phase => {
                  const phaseSteps = stepsByPhase[phase.id] || [];
                  if (phaseSteps.length === 0) return null;
                  const PhaseIcon = phase.icon;

                  return (
                    <Card key={phase.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg ${phase.color} flex items-center justify-center`}>
                            <PhaseIcon size={16} className="text-white" />
                          </div>
                          <CardTitle className="font-display text-lg">{phase.label}</CardTitle>
                          <Badge variant="secondary" className="ml-auto">
                            {phaseSteps.filter(s => s.status === "completed").length}/{phaseSteps.length}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {phaseSteps.map((step, i) => {
                          const CategoryData = CATEGORIES[step.category as keyof typeof CATEGORIES] || CATEGORIES.learning;
                          const CategoryIcon = CategoryData.icon;

                          return (
                            <motion.div
                              key={step.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50 ${
                                step.status === "completed" ? "bg-accent/5 border-accent/20" : "border-border"
                              }`}
                            >
                              <button
                                onClick={() => updateStepStatus(step.id, step.status === "completed" ? "not_started" : "completed")}
                                className="flex-shrink-0"
                              >
                                {statusIcon(step.status)}
                              </button>
                              <CategoryIcon size={16} className={CategoryData.color} />
                              <div className="flex-1 min-w-0">
                                <p className={`font-body text-sm ${step.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {step.title}
                                </p>
                                {step.description && (
                                  <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                                )}
                              </div>
                              {step.skill_tags?.length > 0 && (
                                <div className="hidden md:flex gap-1">
                                  {step.skill_tags.slice(0, 2).map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                                  ))}
                                </div>
                              )}
                              <Badge variant={step.priority === "high" ? "destructive" : step.priority === "medium" ? "default" : "secondary"} className="text-[10px]">
                                {step.priority}
                              </Badge>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                {["not_started", "in_progress", "completed", "skipped"].map(s => (
                                  <button
                                    key={s}
                                    onClick={() => updateStepStatus(step.id, s)}
                                    className={`px-2 py-0.5 rounded text-[9px] font-body ${
                                      step.status === s ? "bg-accent text-accent-foreground" : "bg-muted hover:bg-muted/80"
                                    }`}
                                  >
                                    {s.replace("_", " ")}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
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
                <p className="font-body text-muted-foreground mb-6 max-w-md mx-auto">
                  Let AI analyze your interests, skills, and goals to create a personalized career roadmap just for you.
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <Input
                    placeholder="Short-term goal (e.g., Get an internship in 3 months)"
                    value={goals.shortTerm}
                    onChange={(e) => setGoals(g => ({ ...g, shortTerm: e.target.value }))}
                  />
                  <Input
                    placeholder="Long-term goal (e.g., Become a senior developer)"
                    value={goals.longTerm}
                    onChange={(e) => setGoals(g => ({ ...g, longTerm: e.target.value }))}
                  />
                  <Button onClick={generateAIRoadmap} disabled={generating} className="w-full gradient-warm text-secondary-foreground gap-2">
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
              <CardTitle className="font-display flex items-center gap-2">
                <Zap className="text-amber-500" size={20} />
                Next Steps
              </CardTitle>
              <CardDescription>Your most impactful actions right now</CardDescription>
            </CardHeader>
            <CardContent>
              {steps.filter(s => s.status !== "completed").slice(0, 5).map((step, i) => (
                <div key={step.id} className="flex items-center gap-3 p-3 border-b last:border-0">
                  <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-body text-sm text-foreground">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.phase} • {step.category}</p>
                  </div>
                  <Button size="sm" onClick={() => updateStepStatus(step.id, "in_progress")}>
                    Start <ArrowRight size={14} className="ml-1" />
                  </Button>
                </div>
              ))}
              {steps.filter(s => s.status !== "completed").length === 0 && (
                <p className="text-center text-muted-foreground py-8">All steps completed! 🎉</p>
              )}
            </CardContent>
          </Card>

          {/* In Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Clock className="text-amber-500" size={20} />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {steps.filter(s => s.status === "in_progress").map(step => (
                <div key={step.id} className="flex items-center gap-3 p-3 border-b last:border-0">
                  <Clock className="text-amber-500" size={16} />
                  <div className="flex-1">
                    <p className="font-body text-sm text-foreground">{step.title}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => updateStepStatus(step.id, "completed")}>
                    <Check size={14} className="mr-1" /> Complete
                  </Button>
                </div>
              ))}
              {steps.filter(s => s.status === "in_progress").length === 0 && (
                <p className="text-center text-muted-foreground py-4">No tasks in progress</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {aiSuggestions ? (
            <>
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="pt-6">
                  <p className="font-body text-foreground italic">"{aiSuggestions.encouragement}"</p>
                  {aiSuggestions.pattern_insight && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <Lightbulb className="inline mr-1" size={14} /> {aiSuggestions.pattern_insight}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display">AI Recommended Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiSuggestions.suggestions?.map((suggestion: any, i: number) => (
                    <div key={i} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full gradient-warm flex items-center justify-center text-sm font-bold text-secondary-foreground">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display text-foreground">{suggestion.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{suggestion.category}</Badge>
                            <Badge variant={suggestion.priority === "high" ? "destructive" : "secondary"}>{suggestion.priority}</Badge>
                            <span className="text-xs text-muted-foreground">{suggestion.estimated_time}</span>
                          </div>
                          <p className="text-xs text-accent mt-2">💡 {suggestion.reason}</p>
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
                <Button onClick={getNextStepSuggestions} className="gap-2">
                  <Sparkles size={16} /> Generate Insights
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Progress Analysis */}
          <Button onClick={analyzeProgress} variant="outline" className="w-full gap-2">
            <TrendingUp size={16} /> Analyze My Progress
          </Button>

          {progressAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Award className="text-accent" size={20} />
                  Progress Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-body text-foreground">{progressAnalysis.progress_summary}</p>
                
                {progressAnalysis.strengths_observed?.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm text-foreground mb-2">Strengths Observed</h4>
                    <div className="flex flex-wrap gap-2">
                      {progressAnalysis.strengths_observed.map((s: string, i: number) => (
                        <Badge key={i} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {progressAnalysis.phase_readiness && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm">
                      <strong>Phase:</strong> {progressAnalysis.phase_readiness.current_phase} ({progressAnalysis.phase_readiness.completion_percentage}% complete)
                    </p>
                    {progressAnalysis.phase_readiness.ready_for_next && (
                      <p className="text-sm text-accent mt-1">✨ Ready for {progressAnalysis.phase_readiness.next_phase}!</p>
                    )}
                  </div>
                )}

                <p className="text-sm italic text-accent">"{progressAnalysis.motivational_message}"</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Target className="text-accent" size={20} />
                Your Career Goals
              </CardTitle>
              <CardDescription>Define what success looks like for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-body text-foreground mb-2 block">Short-term Goal (3-6 months)</label>
                <Textarea
                  placeholder="e.g., Get my first internship, complete 3 projects, learn Python..."
                  value={goals.shortTerm}
                  onChange={(e) => setGoals(g => ({ ...g, shortTerm: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-body text-foreground mb-2 block">Long-term Goal (1-3 years)</label>
                <Textarea
                  placeholder="e.g., Become a full-stack developer, start my own company, lead a team..."
                  value={goals.longTerm}
                  onChange={(e) => setGoals(g => ({ ...g, longTerm: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveGoals} className="flex-1 gradient-warm text-secondary-foreground">
                  Save Goals
                </Button>
                {activeRoadmap && (
                  <Button onClick={generateAIRoadmap} variant="outline" disabled={generating} className="gap-2">
                    <RefreshCw className={generating ? "animate-spin" : ""} size={16} />
                    Regenerate Roadmap
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skill Gaps */}
          {activeRoadmap?.skill_gaps?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Skill Gaps to Address</CardTitle>
              </CardHeader>
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
        </TabsContent>
      </Tabs>

      {/* Roadmap Selector */}
      {roadmaps.length > 1 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Your Roadmaps</p>
            <div className="flex gap-2 flex-wrap">
              {roadmaps.map(rm => (
                <button
                  key={rm.id}
                  onClick={() => { setActiveRoadmap(rm); fetchSteps(rm.id); }}
                  className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${
                    activeRoadmap?.id === rm.id ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {rm.title}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Roadmap;
