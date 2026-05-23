import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Wrench, Plus, Sparkles, ArrowRight, Target, FlaskConical,
  BarChart3, Users, BookOpen, CheckCircle2, Clock, Lightbulb,
  RefreshCw, Milestone, Brain, Layers
} from "lucide-react";

type Tab = "workbench" | "templates" | "skill-map" | "milestones" | "experiments" | "progress";

const statusColors: Record<string, string> = {
  idea: "bg-muted text-muted-foreground",
  planning: "bg-accent/10 text-accent",
  building: "bg-accent/20 text-accent",
  launched: "bg-accent text-secondary-foreground",
  archived: "bg-muted text-muted-foreground",
};

const experimentTemplates = [
  { title: "Customer Interview", icon: Users, description: "Validate problem-solution fit through structured conversations with potential users.", fields: ["target_audience", "key_questions", "success_criteria"] },
  { title: "Landing Page Test", icon: Layers, description: "Create a simple page to gauge interest and collect sign-ups before building.", fields: ["value_proposition", "call_to_action", "metrics"] },
  { title: "Prototype Walkthrough", icon: FlaskConical, description: "Build a basic prototype and observe how users interact with it.", fields: ["core_feature", "user_tasks", "feedback_method"] },
  { title: "Service Blueprint", icon: BookOpen, description: "Map out your service delivery process end-to-end before scaling.", fields: ["touchpoints", "backend_processes", "pain_points"] },
];

const MVPBuilder = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("workbench");
  const [projects, setProjects] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tags: "" });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [skillMap, setSkillMap] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Experiment form
  const [expForm, setExpForm] = useState({ title: "", hypothesis: "", method: "" });
  const [showExpForm, setShowExpForm] = useState(false);
  const [iterationForm, setIterationForm] = useState({ results: "", learnings: "" });
  const [iterationFeedback, setIterationFeedback] = useState<any>(null);

  // Milestone form
  const [msForm, setMsForm] = useState({ title: "", description: "", due_date: "" });
  const [showMsForm, setShowMsForm] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data: proj } = await supabase.from("projects").select("*")
      .eq("user_id", user!.id).eq("intent", "entrepreneurship").order("created_at", { ascending: false });
    setProjects(proj || []);

    if (proj && proj.length > 0) {
      const projId = selectedProject?.id || proj[0].id;
      if (!selectedProject) setSelectedProject(proj[0]);
      await fetchProjectData(projId);
    }
    setLoading(false);
  };

  const fetchProjectData = async (projectId: string) => {
    const [{ data: ms }, { data: exp }] = await Promise.all([
      supabase.from("mvp_milestones").select("*").eq("project_id", projectId).order("order_index"),
      supabase.from("mvp_experiments").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    ]);
    setMilestones(ms || []);
    setExperiments(exp || []);
  };

  const createProject = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from("projects").insert({
      user_id: user!.id, title: form.title.trim(), description: form.description,
      project_type: "mvp", intent: "entrepreneurship" as const,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    if (error) { toast.error("Failed to create project"); return; }
    setForm({ title: "", description: "", tags: "" });
    setShowForm(false);
    fetchAll();
    toast.success("MVP project created! 🔨");
  };

  const updateStatus = async (id: string, status: "idea" | "planning" | "building" | "launched" | "archived") => {
    await supabase.from("projects").update({ status }).eq("id", id);
    fetchAll();
    toast.success(`Status → ${status}`);
  };

  const selectProject = async (project: any) => {
    setSelectedProject(project);
    await fetchProjectData(project.id);
  };

  // AI: Skill Mapping
  const runSkillMapping = async () => {
    setAiLoading(true);
    try {
      const [{ data: skills }, { data: interests }, { data: paths }] = await Promise.all([
        supabase.from("skills").select("*").eq("user_id", user!.id),
        supabase.from("interests").select("*").eq("user_id", user!.id),
        supabase.from("path_selections").select("*").eq("user_id", user!.id).limit(5),
      ]);
      const { data, error } = await supabase.functions.invoke("mvp-builder-ai", {
        body: { type: "skill_mapping", context: { skills, interests, paths, project: selectedProject } },
      });
      if (error) throw error;
      setSkillMap(data);
      toast.success("Skill mapping complete!");
    } catch { toast.error("Failed to generate skill mapping"); }
    setAiLoading(false);
  };

  // AI: Generate milestones
  const generateMilestones = async () => {
    if (!selectedProject) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mvp-builder-ai", {
        body: { type: "milestone_plan", context: { project: selectedProject, existing_milestones: milestones } },
      });
      if (error) throw error;
      if (data?.milestones) {
        for (let i = 0; i < data.milestones.length; i++) {
          const m = data.milestones[i];
          await supabase.from("mvp_milestones").insert({
            project_id: selectedProject.id, user_id: user!.id,
            title: m.title, description: m.description,
            order_index: milestones.length + i,
            learning_objectives: m.learning_objectives || [],
            metrics: m.metrics || {},
          });
        }
        await fetchProjectData(selectedProject.id);
        toast.success("AI milestones generated!");
      }
    } catch { toast.error("Failed to generate milestones"); }
    setAiLoading(false);
  };

  // AI: Suggest experiments
  const suggestExperiments = async () => {
    if (!selectedProject) return;
    setAiLoading(true);
    try {
      const [{ data: skills }, { data: paths }] = await Promise.all([
        supabase.from("skills").select("*").eq("user_id", user!.id),
        supabase.from("path_selections").select("*").eq("user_id", user!.id).limit(3),
      ]);
      const { data, error } = await supabase.functions.invoke("mvp-builder-ai", {
        body: { type: "experiment_suggestion", context: { project: selectedProject, skills, paths, existing_experiments: experiments } },
      });
      if (error) throw error;
      if (data?.experiments) {
        for (const exp of data.experiments) {
          await supabase.from("mvp_experiments").insert({
            project_id: selectedProject.id, user_id: user!.id,
            title: exp.title, hypothesis: exp.hypothesis, method: exp.method,
            metrics: { suggested_metrics: exp.metrics || [] },
          });
        }
        await fetchProjectData(selectedProject.id);
        toast.success("AI experiments suggested!");
      }
    } catch { toast.error("Failed to suggest experiments"); }
    setAiLoading(false);
  };

  // AI: Iteration feedback
  const getIterationFeedback = async (experiment: any) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mvp-builder-ai", {
        body: { type: "iteration_feedback", context: { experiment, project: selectedProject } },
      });
      if (error) throw error;
      setIterationFeedback(data);
      toast.success("Feedback received!");
    } catch { toast.error("Failed to get feedback"); }
    setAiLoading(false);
  };

  // CRUD: Milestones
  const addMilestone = async () => {
    if (!msForm.title.trim() || !selectedProject) return;
    await supabase.from("mvp_milestones").insert({
      project_id: selectedProject.id, user_id: user!.id,
      title: msForm.title, description: msForm.description,
      order_index: milestones.length,
      due_date: msForm.due_date || null,
    });
    setMsForm({ title: "", description: "", due_date: "" });
    setShowMsForm(false);
    fetchProjectData(selectedProject.id);
    toast.success("Milestone added!");
  };

  const toggleMilestone = async (ms: any) => {
    const newStatus = ms.status === "completed" ? "pending" : "completed";
    await supabase.from("mvp_milestones").update({
      status: newStatus, completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    }).eq("id", ms.id);
    fetchProjectData(selectedProject.id);
  };

  // CRUD: Experiments
  const addExperiment = async () => {
    if (!expForm.title.trim() || !selectedProject) return;
    const maxIter = experiments.length > 0 ? Math.max(...experiments.map(e => e.iteration_number)) : 0;
    await supabase.from("mvp_experiments").insert({
      project_id: selectedProject.id, user_id: user!.id,
      title: expForm.title, hypothesis: expForm.hypothesis, method: expForm.method,
      iteration_number: maxIter + 1,
    });
    setExpForm({ title: "", hypothesis: "", method: "" });
    setShowExpForm(false);
    fetchProjectData(selectedProject.id);
    toast.success("Experiment created!");
  };

  const updateExperiment = async (id: string, updates: any) => {
    await supabase.from("mvp_experiments").update(updates).eq("id", id);
    fetchProjectData(selectedProject.id);
  };

  const applyTemplate = (template: typeof experimentTemplates[0]) => {
    setExpForm({ title: template.title, hypothesis: "", method: template.description });
    setShowExpForm(true);
    setTab("experiments");
  };

  const statuses = ["idea", "planning", "building", "launched", "archived"];
  const completedMs = milestones.filter(m => m.status === "completed").length;
  const msProgress = milestones.length > 0 ? (completedMs / milestones.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <Wrench size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">MVP Builder</h1>
              <p className="font-body text-sm text-muted-foreground">Build, test, and learn through structured experiments</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gradient-warm text-secondary-foreground">
            <Plus size={18} /> New MVP
          </Button>
        </div>
      </motion.div>

      {/* New project form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl text-foreground">Start a New MVP</h2>
          <Input placeholder="Project name" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="What problem does it solve? Who is it for?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={createProject} className="gradient-warm text-secondary-foreground">Create Project</Button>
            <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Stats bar */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Projects", value: projects.length, icon: Target },
            { label: "Milestones Done", value: `${completedMs}/${milestones.length}`, icon: Milestone },
            { label: "Experiments", value: experiments.length, icon: FlaskConical },
            { label: "Progress", value: `${Math.round(msProgress)}%`, icon: BarChart3 },
          ].map((s, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <s.icon size={18} className="text-accent" />
              <div>
                <p className="font-display text-lg text-foreground">{s.value}</p>
                <p className="font-body text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="animate-pulse font-body text-muted-foreground">Loading...</div></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No MVPs yet</h3>
          <p className="font-body text-muted-foreground">Turn your startup ideas into tangible products!</p>
        </div>
      ) : (
        <>
          {/* Project selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {projects.map(p => (
              <button key={p.id} onClick={() => selectProject(p)}
                className={`px-4 py-2 rounded-lg font-body text-sm whitespace-nowrap transition-all ${
                  selectedProject?.id === p.id ? "gradient-warm text-secondary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}>
                {p.title}
              </button>
            ))}
          </div>

          {selectedProject && (
            <>
              {/* Status pipeline */}
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-display text-lg text-foreground">{selectedProject.title}</h3>
                    {selectedProject.description && <p className="font-body text-sm text-muted-foreground">{selectedProject.description}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full font-body text-xs font-medium capitalize ${statusColors[selectedProject.status] || ""}`}>
                    {selectedProject.status}
                  </span>
                </div>
                {selectedProject.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {selectedProject.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {statuses.map((s, si) => (
                    <div key={s} className="flex items-center">
                      <button onClick={() => updateStatus(selectedProject.id, s as any)}
                        className={`px-3 py-1 rounded-full font-body text-[10px] capitalize transition-all ${
                          selectedProject.status === s ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"
                        }`}>{s}</button>
                      {si < statuses.length - 1 && <ArrowRight size={10} className="text-muted-foreground mx-0.5" />}
                    </div>
                  ))}
                </div>
                {milestones.length > 0 && (
                  <div className="mt-3">
                    <Progress value={msProgress} className="h-2" />
                    <p className="font-body text-xs text-muted-foreground mt-1">{completedMs} of {milestones.length} milestones completed</p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <Tabs value={tab} onValueChange={v => setTab(v as Tab)}>
                <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
                  <TabsTrigger value="workbench"><Lightbulb size={14} className="mr-1" />Workbench</TabsTrigger>
                  <TabsTrigger value="templates"><Layers size={14} className="mr-1" />Templates</TabsTrigger>
                  <TabsTrigger value="skill-map"><Brain size={14} className="mr-1" />Skills</TabsTrigger>
                  <TabsTrigger value="milestones"><Milestone size={14} className="mr-1" />Milestones</TabsTrigger>
                  <TabsTrigger value="experiments"><FlaskConical size={14} className="mr-1" />Experiments</TabsTrigger>
                  <TabsTrigger value="progress"><BarChart3 size={14} className="mr-1" />Progress</TabsTrigger>
                </TabsList>

                {/* Workbench */}
                <TabsContent value="workbench" className="space-y-4">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-display text-lg text-foreground mb-2">Idea-to-Prototype Workbench</h3>
                    <p className="font-body text-sm text-muted-foreground mb-4">Define your problem, set goals, and start building.</p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <Target size={20} className="text-accent" />
                        <h4 className="font-display text-sm text-foreground">Problem Definition</h4>
                        <p className="font-body text-xs text-muted-foreground">{selectedProject.description || "Add a problem description to your project."}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <Milestone size={20} className="text-accent" />
                        <h4 className="font-display text-sm text-foreground">Milestones</h4>
                        <p className="font-body text-xs text-muted-foreground">{milestones.length} milestones · {completedMs} completed</p>
                        <Button size="sm" variant="outline" onClick={() => setTab("milestones")}>Manage</Button>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <FlaskConical size={20} className="text-accent" />
                        <h4 className="font-display text-sm text-foreground">Experiments</h4>
                        <p className="font-body text-xs text-muted-foreground">{experiments.length} experiments running</p>
                        <Button size="sm" variant="outline" onClick={() => setTab("experiments")}>View</Button>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <Button size="sm" onClick={generateMilestones} disabled={aiLoading} className="gradient-warm text-secondary-foreground">
                        <Sparkles size={14} /> AI: Plan Milestones
                      </Button>
                      <Button size="sm" onClick={suggestExperiments} disabled={aiLoading} variant="outline">
                        <Sparkles size={14} /> AI: Suggest Experiments
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Templates */}
                <TabsContent value="templates" className="space-y-4">
                  <h3 className="font-display text-lg text-foreground">Experiment Templates & Tools</h3>
                  <p className="font-body text-sm text-muted-foreground">Pick a template to jumpstart your experiment.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {experimentTemplates.map((tmpl, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-card rounded-xl border border-border p-5 space-y-3">
                        <div className="flex items-center gap-2">
                          <tmpl.icon size={20} className="text-accent" />
                          <h4 className="font-display text-base text-foreground">{tmpl.title}</h4>
                        </div>
                        <p className="font-body text-sm text-muted-foreground">{tmpl.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {tmpl.fields.map(f => (
                            <span key={f} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{f.replace(/_/g, " ")}</span>
                          ))}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => applyTemplate(tmpl)}>
                          Use Template
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* Skill Mapping */}
                <TabsContent value="skill-map" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-lg text-foreground">Skill-for-Startup Mapping</h3>
                      <p className="font-body text-sm text-muted-foreground">See how your skills align with startup roles and tasks.</p>
                    </div>
                    <Button onClick={runSkillMapping} disabled={aiLoading} className="gradient-warm text-secondary-foreground">
                      <Brain size={14} /> {aiLoading ? "Analyzing..." : "Map My Skills"}
                    </Button>
                  </div>
                  {skillMap ? (
                    <div className="space-y-4">
                      {skillMap.role_matches && (
                        <div className="space-y-3">
                          <h4 className="font-display text-base text-foreground">Role Matches</h4>
                          {skillMap.role_matches.map((rm: any, i: number) => (
                            <div key={i} className="bg-card rounded-xl border border-border p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-display text-sm text-foreground">{rm.role}</h5>
                                <span className="font-body text-xs text-accent font-medium">{rm.match_score}% match</span>
                              </div>
                              <Progress value={rm.match_score} className="h-2 mb-2" />
                              <div className="flex flex-wrap gap-1 mb-1">
                                {rm.matching_skills?.map((s: string) => (
                                  <span key={s} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-[10px]">{s}</span>
                                ))}
                              </div>
                              {rm.gaps?.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {rm.gaps.map((g: string) => (
                                    <span key={g} className="px-2 py-0.5 rounded bg-destructive/10 text-destructive font-body text-[10px]">Gap: {g}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {skillMap.recommended_tasks && (
                        <div>
                          <h4 className="font-display text-base text-foreground mb-2">Recommended Tasks</h4>
                          <div className="grid md:grid-cols-2 gap-2">
                            {skillMap.recommended_tasks.map((t: any, i: number) => (
                              <div key={i} className="bg-muted/50 rounded-lg p-3">
                                <p className="font-body text-sm text-foreground">{t.task}</p>
                                <p className="font-body text-xs text-muted-foreground">Skill: {t.skill_applied} · {t.difficulty}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {skillMap.learning_suggestions && (
                        <div>
                          <h4 className="font-display text-base text-foreground mb-2">Learning Suggestions</h4>
                          <ul className="space-y-1">
                            {skillMap.learning_suggestions.map((s: string, i: number) => (
                              <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                                <BookOpen size={14} className="text-accent mt-0.5 shrink-0" /> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-card rounded-xl border border-border">
                      <Brain className="mx-auto text-muted-foreground mb-2" size={32} />
                      <p className="font-body text-sm text-muted-foreground">Click "Map My Skills" to see how your abilities align with startup roles.</p>
                    </div>
                  )}
                </TabsContent>

                {/* Milestones */}
                <TabsContent value="milestones" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-foreground">Milestones</h3>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={generateMilestones} disabled={aiLoading} variant="outline">
                        <Sparkles size={14} /> AI Generate
                      </Button>
                      <Button size="sm" onClick={() => setShowMsForm(!showMsForm)} className="gradient-warm text-secondary-foreground">
                        <Plus size={14} /> Add
                      </Button>
                    </div>
                  </div>
                  {showMsForm && (
                    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                      <Input placeholder="Milestone title" value={msForm.title} onChange={e => setMsForm({ ...msForm, title: e.target.value })} />
                      <Textarea placeholder="Description" value={msForm.description} onChange={e => setMsForm({ ...msForm, description: e.target.value })} rows={2} />
                      <Input type="date" value={msForm.due_date} onChange={e => setMsForm({ ...msForm, due_date: e.target.value })} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addMilestone}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowMsForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                  {milestones.length === 0 ? (
                    <div className="text-center py-8 bg-card rounded-xl border border-border">
                      <Milestone className="mx-auto text-muted-foreground mb-2" size={32} />
                      <p className="font-body text-sm text-muted-foreground">No milestones yet. Add manually or let AI plan them.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {milestones.map((ms, i) => (
                        <motion.div key={ms.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                          className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                          <button onClick={() => toggleMilestone(ms)} className="mt-1 shrink-0">
                            <CheckCircle2 size={20} className={ms.status === "completed" ? "text-accent" : "text-muted-foreground"} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-display text-sm ${ms.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{ms.title}</h4>
                            {ms.description && <p className="font-body text-xs text-muted-foreground mt-0.5">{ms.description}</p>}
                            <div className="flex items-center gap-3 mt-1">
                              {ms.due_date && (
                                <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Clock size={10} /> {ms.due_date}
                                </span>
                              )}
                              {ms.learning_objectives?.length > 0 && (
                                <span className="font-body text-[10px] text-accent">{ms.learning_objectives.length} objectives</span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Experiments */}
                <TabsContent value="experiments" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-foreground">Experiments & Iterations</h3>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={suggestExperiments} disabled={aiLoading} variant="outline">
                        <Sparkles size={14} /> AI Suggest
                      </Button>
                      <Button size="sm" onClick={() => setShowExpForm(!showExpForm)} className="gradient-warm text-secondary-foreground">
                        <Plus size={14} /> New
                      </Button>
                    </div>
                  </div>
                  {showExpForm && (
                    <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                      <Input placeholder="Experiment title" value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })} />
                      <Textarea placeholder="Hypothesis — what do you expect to learn?" value={expForm.hypothesis} onChange={e => setExpForm({ ...expForm, hypothesis: e.target.value })} rows={2} />
                      <Textarea placeholder="Method — how will you test this?" value={expForm.method} onChange={e => setExpForm({ ...expForm, method: e.target.value })} rows={2} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addExperiment}>Create</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowExpForm(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                  {experiments.length === 0 ? (
                    <div className="text-center py-8 bg-card rounded-xl border border-border">
                      <FlaskConical className="mx-auto text-muted-foreground mb-2" size={32} />
                      <p className="font-body text-sm text-muted-foreground">No experiments yet. Start one or let AI suggest some.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {experiments.map((exp, i) => (
                        <motion.div key={exp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          className="bg-card rounded-xl border border-border p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-body text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded">Iteration #{exp.iteration_number}</span>
                              <h4 className="font-display text-sm text-foreground">{exp.title}</h4>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full font-body text-[10px] capitalize ${
                              exp.status === "completed" ? "bg-accent/20 text-accent" :
                              exp.status === "running" ? "bg-primary/20 text-primary" :
                              "bg-muted text-muted-foreground"
                            }`}>{exp.status}</span>
                          </div>
                          {exp.hypothesis && <p className="font-body text-xs text-muted-foreground"><strong>Hypothesis:</strong> {exp.hypothesis}</p>}
                          {exp.method && <p className="font-body text-xs text-muted-foreground"><strong>Method:</strong> {exp.method}</p>}
                          {exp.results && <p className="font-body text-xs text-foreground"><strong>Results:</strong> {exp.results}</p>}
                          {exp.learnings && <p className="font-body text-xs text-foreground"><strong>Learnings:</strong> {exp.learnings}</p>}

                          {exp.status === "planned" && (
                            <Button size="sm" variant="outline" onClick={() => updateExperiment(exp.id, { status: "running" })}>
                              <RefreshCw size={12} /> Start Running
                            </Button>
                          )}
                          {exp.status === "running" && (
                            <div className="space-y-2 border-t border-border pt-3">
                              <Textarea placeholder="What were the results?" value={iterationForm.results}
                                onChange={e => setIterationForm({ ...iterationForm, results: e.target.value })} rows={2} />
                              <Textarea placeholder="What did you learn?" value={iterationForm.learnings}
                                onChange={e => setIterationForm({ ...iterationForm, learnings: e.target.value })} rows={2} />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => {
                                  updateExperiment(exp.id, { status: "completed", results: iterationForm.results, learnings: iterationForm.learnings });
                                  setIterationForm({ results: "", learnings: "" });
                                }}>Complete</Button>
                                <Button size="sm" variant="outline" disabled={aiLoading} onClick={() => getIterationFeedback({
                                  ...exp, results: iterationForm.results, learnings: iterationForm.learnings,
                                })}>
                                  <Sparkles size={12} /> AI Feedback
                                </Button>
                              </div>
                            </div>
                          )}
                          {exp.status === "completed" && (
                            <Button size="sm" variant="outline" disabled={aiLoading} onClick={() => getIterationFeedback(exp)}>
                              <Sparkles size={12} /> Get AI Feedback
                            </Button>
                          )}
                        </motion.div>
                      ))}

                      {/* Iteration feedback */}
                      {iterationFeedback && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/20 p-5 space-y-3">
                          <h4 className="font-display text-base text-foreground flex items-center gap-2">
                            <Sparkles size={16} className="text-accent" /> AI Iteration Feedback
                          </h4>
                          {iterationFeedback.analysis && <p className="font-body text-sm text-foreground">{iterationFeedback.analysis}</p>}
                          <div className="grid md:grid-cols-2 gap-3">
                            {iterationFeedback.strengths?.length > 0 && (
                              <div><h5 className="font-body text-xs text-accent font-medium mb-1">Strengths</h5>
                                <ul className="space-y-0.5">{iterationFeedback.strengths.map((s: string, i: number) => (
                                  <li key={i} className="font-body text-xs text-muted-foreground">✓ {s}</li>
                                ))}</ul></div>
                            )}
                            {iterationFeedback.improvements?.length > 0 && (
                              <div><h5 className="font-body text-xs text-destructive font-medium mb-1">Improvements</h5>
                                <ul className="space-y-0.5">{iterationFeedback.improvements.map((s: string, i: number) => (
                                  <li key={i} className="font-body text-xs text-muted-foreground">→ {s}</li>
                                ))}</ul></div>
                            )}
                          </div>
                          {iterationFeedback.next_steps?.length > 0 && (
                            <div><h5 className="font-body text-xs font-medium text-foreground mb-1">Next Steps</h5>
                              <ul className="space-y-0.5">{iterationFeedback.next_steps.map((s: string, i: number) => (
                                <li key={i} className="font-body text-xs text-muted-foreground">{i + 1}. {s}</li>
                              ))}</ul></div>
                          )}
                          {iterationFeedback.confidence_score != null && (
                            <div className="flex items-center gap-2">
                              <span className="font-body text-xs text-muted-foreground">Confidence:</span>
                              <Progress value={iterationFeedback.confidence_score} className="h-2 flex-1" />
                              <span className="font-body text-xs text-accent">{iterationFeedback.confidence_score}%</span>
                            </div>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setIterationFeedback(null)}>Dismiss</Button>
                        </motion.div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Progress */}
                <TabsContent value="progress" className="space-y-4">
                  <h3 className="font-display text-lg text-foreground">Progress Overview</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                      <h4 className="font-display text-sm text-foreground">Milestone Progress</h4>
                      <Progress value={msProgress} className="h-3" />
                      <p className="font-body text-xs text-muted-foreground">{completedMs} of {milestones.length} completed</p>
                      <div className="space-y-1">
                        {milestones.slice(0, 5).map(ms => (
                          <div key={ms.id} className="flex items-center gap-2">
                            <CheckCircle2 size={12} className={ms.status === "completed" ? "text-accent" : "text-muted-foreground"} />
                            <span className="font-body text-xs text-foreground truncate">{ms.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                      <h4 className="font-display text-sm text-foreground">Experiment Summary</h4>
                      <div className="space-y-2">
                        {[
                          { label: "Planned", count: experiments.filter(e => e.status === "planned").length },
                          { label: "Running", count: experiments.filter(e => e.status === "running").length },
                          { label: "Completed", count: experiments.filter(e => e.status === "completed").length },
                        ].map(s => (
                          <div key={s.label} className="flex items-center justify-between">
                            <span className="font-body text-xs text-muted-foreground">{s.label}</span>
                            <span className="font-display text-sm text-foreground">{s.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-5 space-y-3 md:col-span-2">
                      <h4 className="font-display text-sm text-foreground">Recent Activity</h4>
                      {experiments.length === 0 && milestones.length === 0 ? (
                        <p className="font-body text-xs text-muted-foreground">No activity yet. Start by adding milestones or experiments.</p>
                      ) : (
                        <div className="space-y-2">
                          {[...experiments.slice(0, 3).map(e => ({ type: "experiment", title: e.title, status: e.status, date: e.created_at })),
                            ...milestones.filter(m => m.completed_at).slice(0, 3).map(m => ({ type: "milestone", title: m.title, status: "completed", date: m.completed_at })),
                          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              {item.type === "experiment" ? <FlaskConical size={12} className="text-accent" /> : <CheckCircle2 size={12} className="text-accent" />}
                              <span className="font-body text-xs text-foreground">{item.title}</span>
                              <span className="font-body text-[10px] text-muted-foreground capitalize">{item.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default MVPBuilder;
