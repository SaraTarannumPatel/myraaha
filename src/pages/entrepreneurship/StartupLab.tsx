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
  Rocket, Plus, Sparkles, Target, FlaskConical, BarChart3,
  CheckCircle2, Clock, Lightbulb, FileText, Presentation,
  TrendingUp, Users, BookOpen, Milestone, RefreshCw
} from "lucide-react";

type Tab = "workspace" | "validation" | "planning" | "milestones" | "funding" | "progress";

const StartupLab = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("workspace");
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Forms
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planForm, setPlanForm] = useState({ title: "", vision: "", mission: "", problem_statement: "" });
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [sprintForm, setSprintForm] = useState({ title: "", hypothesis: "", method: "" });
  const [showMsForm, setShowMsForm] = useState(false);
  const [msForm, setMsForm] = useState({ title: "", description: "", due_date: "", category: "general" });

  // AI results
  const [validationFramework, setValidationFramework] = useState<any>(null);
  const [planningFramework, setPlanningFramework] = useState<any>(null);
  const [pitchPrep, setPitchPrep] = useState<any>(null);
  const [sprintFeedback, setSprintFeedback] = useState<any>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const { data: p } = await supabase.from("lab_plans").select("*")
      .eq("user_id", user!.id).order("created_at", { ascending: false });
    setPlans(p || []);
    if (p && p.length > 0) {
      const plan = selectedPlan || p[0];
      if (!selectedPlan) setSelectedPlan(p[0]);
      await fetchPlanData(plan.id);
    }
    setLoading(false);
  };

  const fetchPlanData = async (planId: string) => {
    const [{ data: sp }, { data: ms }] = await Promise.all([
      supabase.from("validation_sprints").select("*").eq("plan_id", planId).order("created_at"),
      supabase.from("lab_milestones").select("*").eq("plan_id", planId).order("order_index"),
    ]);
    setSprints(sp || []);
    setMilestones(ms || []);
  };

  const selectPlan = async (plan: any) => {
    setSelectedPlan(plan);
    await fetchPlanData(plan.id);
    setValidationFramework(null);
    setPlanningFramework(null);
    setPitchPrep(null);
  };

  // CRUD: Plans
  const createPlan = async () => {
    if (!planForm.title.trim()) return;
    const { error } = await supabase.from("lab_plans").insert({
      user_id: user!.id, ...planForm,
    });
    if (error) { toast.error("Failed to create plan"); return; }
    setPlanForm({ title: "", vision: "", mission: "", problem_statement: "" });
    setShowPlanForm(false);
    fetchAll();
    toast.success("Startup plan created! 🚀");
  };

  const updatePlan = async (updates: any) => {
    if (!selectedPlan) return;
    await supabase.from("lab_plans").update(updates).eq("id", selectedPlan.id);
    setSelectedPlan({ ...selectedPlan, ...updates });
    toast.success("Plan updated");
  };

  // CRUD: Sprints
  const createSprint = async () => {
    if (!sprintForm.title.trim() || !selectedPlan) return;
    await supabase.from("validation_sprints").insert({
      plan_id: selectedPlan.id, user_id: user!.id,
      title: sprintForm.title, hypothesis: sprintForm.hypothesis, method: sprintForm.method,
    });
    setSprintForm({ title: "", hypothesis: "", method: "" });
    setShowSprintForm(false);
    fetchPlanData(selectedPlan.id);
    toast.success("Sprint created!");
  };

  const updateSprint = async (id: string, updates: any) => {
    await supabase.from("validation_sprints").update(updates).eq("id", id);
    fetchPlanData(selectedPlan.id);
  };

  // CRUD: Milestones
  const createMilestone = async () => {
    if (!msForm.title.trim() || !selectedPlan) return;
    await supabase.from("lab_milestones").insert({
      plan_id: selectedPlan.id, user_id: user!.id,
      title: msForm.title, description: msForm.description, category: msForm.category,
      order_index: milestones.length, due_date: msForm.due_date || null,
    });
    setMsForm({ title: "", description: "", due_date: "", category: "general" });
    setShowMsForm(false);
    fetchPlanData(selectedPlan.id);
    toast.success("Milestone added!");
  };

  const toggleMilestone = async (ms: any) => {
    const newStatus = ms.status === "completed" ? "pending" : "completed";
    await supabase.from("lab_milestones").update({
      status: newStatus, completed_at: newStatus === "completed" ? new Date().toISOString() : null,
    }).eq("id", ms.id);
    fetchPlanData(selectedPlan.id);
  };

  // AI: Consolidate idea
  const aiConsolidate = async () => {
    setAiLoading(true);
    try {
      const [{ data: ideas }, { data: problems }, { data: experiments }, { data: skills }] = await Promise.all([
        supabase.from("startup_ideas").select("*").eq("user_id", user!.id).limit(10),
        supabase.from("problem_observations").select("*").eq("user_id", user!.id).limit(10),
        supabase.from("mvp_experiments").select("*").eq("user_id", user!.id).limit(10),
        supabase.from("skills").select("*").eq("user_id", user!.id),
      ]);
      const { data, error } = await supabase.functions.invoke("startup-lab-ai", {
        body: { type: "consolidate_idea", context: { ideas, problems, experiments, skills } },
      });
      if (error) throw error;
      if (data?.title) {
        setPlanForm({
          title: data.title, vision: data.vision || "", mission: data.mission || "",
          problem_statement: data.problem_statement || "",
        });
        setShowPlanForm(true);
        toast.success("AI consolidated your insights!");
      }
    } catch { toast.error("Failed to consolidate"); }
    setAiLoading(false);
  };

  // AI: Validation framework
  const aiValidation = async () => {
    if (!selectedPlan) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("startup-lab-ai", {
        body: { type: "validation_framework", context: { plan: selectedPlan, existing_sprints: sprints } },
      });
      if (error) throw error;
      setValidationFramework(data);
      // Auto-create sprints
      if (data?.sprints) {
        for (const s of data.sprints) {
          await supabase.from("validation_sprints").insert({
            plan_id: selectedPlan.id, user_id: user!.id,
            title: s.title, hypothesis: s.hypothesis, method: s.method,
            target_responses: s.target_responses || 5,
            sprint_duration_days: s.duration_days || 7,
          });
        }
        await fetchPlanData(selectedPlan.id);
      }
      toast.success("Validation framework generated!");
    } catch { toast.error("Failed to generate framework"); }
    setAiLoading(false);
  };

  // AI: Planning framework
  const aiPlanning = async () => {
    if (!selectedPlan) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("startup-lab-ai", {
        body: { type: "planning_framework", context: { plan: selectedPlan, sprints, milestones } },
      });
      if (error) throw error;
      setPlanningFramework(data);
      // Save key fields to plan
      if (data) {
        const updates: any = {};
        if (data.revenue_model) updates.revenue_model = `${data.revenue_model.type}: ${data.revenue_model.pricing_strategy}`;
        if (data.go_to_market) updates.go_to_market = data.go_to_market.launch_strategy;
        if (data.financial_plan) updates.financial_plan = data.financial_plan;
        await supabase.from("lab_plans").update(updates).eq("id", selectedPlan.id);
        // Auto-create milestones
        if (data.milestones) {
          for (let i = 0; i < data.milestones.length; i++) {
            const m = data.milestones[i];
            await supabase.from("lab_milestones").insert({
              plan_id: selectedPlan.id, user_id: user!.id,
              title: m.title, description: m.description, category: m.category || "general",
              order_index: milestones.length + i,
            });
          }
          await fetchPlanData(selectedPlan.id);
        }
      }
      toast.success("Planning framework generated!");
    } catch { toast.error("Failed to generate plan"); }
    setAiLoading(false);
  };

  // AI: Pitch prep
  const aiPitch = async () => {
    if (!selectedPlan) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("startup-lab-ai", {
        body: { type: "pitch_prep", context: { plan: selectedPlan, milestones, sprints } },
      });
      if (error) throw error;
      setPitchPrep(data);
      if (data?.elevator_pitch) {
        await supabase.from("lab_plans").update({ pitch_notes: data.elevator_pitch }).eq("id", selectedPlan.id);
      }
      toast.success("Pitch preparation ready!");
    } catch { toast.error("Failed to prepare pitch"); }
    setAiLoading(false);
  };

  // AI: Sprint feedback
  const aiSprintFeedback = async (sprint: any) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("startup-lab-ai", {
        body: { type: "sprint_feedback", context: { sprint, plan: selectedPlan } },
      });
      if (error) throw error;
      setSprintFeedback({ ...data, sprintId: sprint.id });
      toast.success("Sprint feedback received!");
    } catch { toast.error("Failed to get feedback"); }
    setAiLoading(false);
  };

  const completedMs = milestones.filter(m => m.status === "completed").length;
  const msProgress = milestones.length > 0 ? (completedMs / milestones.length) * 100 : 0;
  const completedSprints = sprints.filter(s => s.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <Rocket size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Startup Creation Lab</h1>
              <p className="font-body text-sm text-muted-foreground">Plan, validate, and prepare for the real world</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={aiConsolidate} disabled={aiLoading} variant="outline">
              <Sparkles size={14} /> AI Consolidate
            </Button>
            <Button onClick={() => setShowPlanForm(!showPlanForm)} className="gradient-warm text-secondary-foreground">
              <Plus size={18} /> New Plan
            </Button>
          </div>
        </div>
      </motion.div>

      {/* New plan form */}
      {showPlanForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl text-foreground">Create Startup Plan</h2>
          <Input placeholder="Startup name / title" value={planForm.title} onChange={e => setPlanForm({ ...planForm, title: e.target.value })} />
          <Textarea placeholder="Vision — what future are you creating?" value={planForm.vision} onChange={e => setPlanForm({ ...planForm, vision: e.target.value })} rows={2} />
          <Textarea placeholder="Mission — how will you get there?" value={planForm.mission} onChange={e => setPlanForm({ ...planForm, mission: e.target.value })} rows={2} />
          <Textarea placeholder="Problem statement — what pain are you solving?" value={planForm.problem_statement} onChange={e => setPlanForm({ ...planForm, problem_statement: e.target.value })} rows={2} />
          <div className="flex gap-2">
            <Button onClick={createPlan} className="gradient-warm text-secondary-foreground">Create Plan</Button>
            <Button onClick={() => setShowPlanForm(false)} variant="ghost">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      {!loading && plans.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Plans", value: plans.length, icon: FileText },
            { label: "Sprints", value: `${completedSprints}/${sprints.length}`, icon: FlaskConical },
            { label: "Milestones", value: `${completedMs}/${milestones.length}`, icon: Milestone },
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
      ) : plans.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Rocket className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No startup plans yet</h3>
          <p className="font-body text-muted-foreground mb-4">Consolidate your ideas into a structured venture plan.</p>
          <Button onClick={aiConsolidate} disabled={aiLoading} variant="outline">
            <Sparkles size={14} /> Let AI consolidate your ideas
          </Button>
        </div>
      ) : (
        <>
          {/* Plan selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {plans.map(p => (
              <button key={p.id} onClick={() => selectPlan(p)}
                className={`px-4 py-2 rounded-lg font-body text-sm whitespace-nowrap transition-all ${
                  selectedPlan?.id === p.id ? "gradient-warm text-secondary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}>{p.title}</button>
            ))}
          </div>

          {selectedPlan && (
            <Tabs value={tab} onValueChange={v => setTab(v as Tab)}>
              <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
                <TabsTrigger value="workspace"><Lightbulb size={14} className="mr-1" />Workspace</TabsTrigger>
                <TabsTrigger value="validation"><FlaskConical size={14} className="mr-1" />Validation</TabsTrigger>
                <TabsTrigger value="planning"><Target size={14} className="mr-1" />Planning</TabsTrigger>
                <TabsTrigger value="milestones"><Milestone size={14} className="mr-1" />Milestones</TabsTrigger>
                <TabsTrigger value="funding"><Presentation size={14} className="mr-1" />Funding</TabsTrigger>
                <TabsTrigger value="progress"><BarChart3 size={14} className="mr-1" />Progress</TabsTrigger>
              </TabsList>

              {/* Workspace */}
              <TabsContent value="workspace" className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <h3 className="font-display text-lg text-foreground">Idea Consolidation Workspace</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="font-body text-xs text-muted-foreground">Vision</label>
                        <Textarea value={selectedPlan.vision || ""} rows={2}
                          onChange={e => { setSelectedPlan({ ...selectedPlan, vision: e.target.value }); }}
                          onBlur={() => updatePlan({ vision: selectedPlan.vision })}
                          placeholder="What future are you creating?" />
                      </div>
                      <div>
                        <label className="font-body text-xs text-muted-foreground">Mission</label>
                        <Textarea value={selectedPlan.mission || ""} rows={2}
                          onChange={e => setSelectedPlan({ ...selectedPlan, mission: e.target.value })}
                          onBlur={() => updatePlan({ mission: selectedPlan.mission })}
                          placeholder="How will you get there?" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="font-body text-xs text-muted-foreground">Problem Statement</label>
                        <Textarea value={selectedPlan.problem_statement || ""} rows={2}
                          onChange={e => setSelectedPlan({ ...selectedPlan, problem_statement: e.target.value })}
                          onBlur={() => updatePlan({ problem_statement: selectedPlan.problem_statement })}
                          placeholder="What pain are you solving?" />
                      </div>
                      <div>
                        <label className="font-body text-xs text-muted-foreground">Value Proposition</label>
                        <Textarea value={selectedPlan.value_proposition || ""} rows={2}
                          onChange={e => setSelectedPlan({ ...selectedPlan, value_proposition: e.target.value })}
                          onBlur={() => updatePlan({ value_proposition: selectedPlan.value_proposition })}
                          placeholder="Why should customers choose you?" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <span className={`px-3 py-1 rounded-full font-body text-xs capitalize ${
                      selectedPlan.status === "active" ? "bg-accent/20 text-accent" :
                      selectedPlan.status === "validated" ? "gradient-warm text-secondary-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>{selectedPlan.status}</span>
                    {selectedPlan.status === "draft" && (
                      <Button size="sm" variant="outline" onClick={() => updatePlan({ status: "active" })}>
                        Activate Plan
                      </Button>
                    )}
                  </div>
                </div>

                {/* Customer Segments */}
                {selectedPlan.customer_segments && Array.isArray(selectedPlan.customer_segments) && selectedPlan.customer_segments.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-5">
                    <h4 className="font-display text-base text-foreground mb-3">Customer Segments</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {selectedPlan.customer_segments.map((seg: any, i: number) => (
                        <div key={i} className="bg-muted/50 rounded-lg p-3">
                          <p className="font-display text-sm text-foreground">{seg.name}</p>
                          {seg.size_estimate && <p className="font-body text-xs text-muted-foreground">Size: {seg.size_estimate}</p>}
                          {seg.pain_points && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {seg.pain_points.map((p: string, j: number) => (
                                <span key={j} className="px-2 py-0.5 rounded bg-destructive/10 text-destructive font-body text-[10px]">{p}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Validation */}
              <TabsContent value="validation" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg text-foreground">Validation Sprints</h3>
                    <p className="font-body text-sm text-muted-foreground">Test assumptions quickly with structured sprints.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={aiValidation} disabled={aiLoading} variant="outline">
                      <Sparkles size={14} /> AI Framework
                    </Button>
                    <Button size="sm" onClick={() => setShowSprintForm(!showSprintForm)} className="gradient-warm text-secondary-foreground">
                      <Plus size={14} /> New Sprint
                    </Button>
                  </div>
                </div>

                {showSprintForm && (
                  <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                    <Input placeholder="Sprint title" value={sprintForm.title} onChange={e => setSprintForm({ ...sprintForm, title: e.target.value })} />
                    <Textarea placeholder="Hypothesis to test" value={sprintForm.hypothesis} onChange={e => setSprintForm({ ...sprintForm, hypothesis: e.target.value })} rows={2} />
                    <Textarea placeholder="Method" value={sprintForm.method} onChange={e => setSprintForm({ ...sprintForm, method: e.target.value })} rows={2} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={createSprint}>Create</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowSprintForm(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {/* Key assumptions from AI */}
                {validationFramework?.key_assumptions && (
                  <div className="bg-accent/5 rounded-xl border border-accent/20 p-5 space-y-3">
                    <h4 className="font-display text-base text-foreground flex items-center gap-2">
                      <Sparkles size={16} className="text-accent" /> Key Assumptions to Test
                    </h4>
                    <div className="space-y-2">
                      {validationFramework.key_assumptions.map((a: any, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className={`px-2 py-0.5 rounded font-body text-[10px] ${
                            a.risk_level === "high" ? "bg-destructive/10 text-destructive" :
                            a.risk_level === "medium" ? "bg-accent/10 text-accent" :
                            "bg-muted text-muted-foreground"
                          }`}>{a.risk_level}</span>
                          <div>
                            <p className="font-body text-sm text-foreground">{a.assumption}</p>
                            <p className="font-body text-xs text-muted-foreground">Test: {a.test_method}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {validationFramework.interview_questions && (
                      <div className="border-t border-border pt-3">
                        <h5 className="font-body text-xs text-muted-foreground font-medium mb-1">Interview Questions</h5>
                        <ul className="space-y-0.5">
                          {validationFramework.interview_questions.map((q: string, i: number) => (
                            <li key={i} className="font-body text-xs text-foreground">• {q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {sprints.length === 0 ? (
                  <div className="text-center py-8 bg-card rounded-xl border border-border">
                    <FlaskConical className="mx-auto text-muted-foreground mb-2" size={32} />
                    <p className="font-body text-sm text-muted-foreground">No sprints yet. Create one or let AI generate a framework.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sprints.map((sprint, i) => (
                      <motion.div key={sprint.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-card rounded-xl border border-border p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-display text-sm text-foreground">{sprint.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full font-body text-[10px] capitalize ${
                            sprint.status === "completed" ? "bg-accent/20 text-accent" :
                            sprint.status === "running" ? "bg-primary/20 text-primary" :
                            "bg-muted text-muted-foreground"
                          }`}>{sprint.status}</span>
                        </div>
                        {sprint.hypothesis && <p className="font-body text-xs text-muted-foreground"><strong>Hypothesis:</strong> {sprint.hypothesis}</p>}
                        {sprint.method && <p className="font-body text-xs text-muted-foreground"><strong>Method:</strong> {sprint.method}</p>}
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="font-body text-[10px] flex items-center gap-1"><Users size={10} /> {sprint.actual_responses}/{sprint.target_responses} responses</span>
                          <span className="font-body text-[10px] flex items-center gap-1"><Clock size={10} /> {sprint.sprint_duration_days}d sprint</span>
                        </div>

                        {sprint.status === "planned" && (
                          <Button size="sm" variant="outline" onClick={() => updateSprint(sprint.id, { status: "running" })}>
                            <RefreshCw size={12} /> Start Sprint
                          </Button>
                        )}
                        {sprint.status === "running" && (
                          <div className="space-y-2 border-t border-border pt-3">
                            <div className="flex gap-2">
                              <Input type="number" placeholder="Responses collected" className="w-32"
                                onChange={e => updateSprint(sprint.id, { actual_responses: parseInt(e.target.value) || 0 })} />
                              <Button size="sm" variant="outline" onClick={() => updateSprint(sprint.id, { status: "completed", completed_at: new Date().toISOString() })}>
                                Complete Sprint
                              </Button>
                            </div>
                            <Textarea placeholder="Findings..."
                              onBlur={e => updateSprint(sprint.id, { findings: e.target.value })} rows={2} />
                          </div>
                        )}
                        {sprint.status === "completed" && (
                          <div className="space-y-2">
                            {sprint.findings && <p className="font-body text-xs text-foreground"><strong>Findings:</strong> {sprint.findings}</p>}
                            <Button size="sm" variant="outline" disabled={aiLoading} onClick={() => aiSprintFeedback(sprint)}>
                              <Sparkles size={12} /> AI Feedback
                            </Button>
                            {sprintFeedback?.sprintId === sprint.id && (
                              <div className="bg-accent/5 rounded-lg p-3 space-y-2">
                                <p className="font-body text-sm text-foreground">{sprintFeedback.analysis}</p>
                                <div className="flex items-center gap-2">
                                  <span className="font-body text-xs text-muted-foreground">Validated:</span>
                                  <span className={`font-body text-xs font-medium ${sprintFeedback.validated ? "text-accent" : "text-destructive"}`}>
                                    {sprintFeedback.validated ? "Yes ✓" : "Not yet"}
                                  </span>
                                </div>
                                {sprintFeedback.next_steps?.length > 0 && (
                                  <ul className="space-y-0.5">
                                    {sprintFeedback.next_steps.map((s: string, i: number) => (
                                      <li key={i} className="font-body text-xs text-muted-foreground">{i + 1}. {s}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Planning */}
              <TabsContent value="planning" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg text-foreground">Structured Planning</h3>
                    <p className="font-body text-sm text-muted-foreground">Product-market fit, revenue, go-to-market, and financials.</p>
                  </div>
                  <Button onClick={aiPlanning} disabled={aiLoading} className="gradient-warm text-secondary-foreground">
                    <Sparkles size={14} /> {aiLoading ? "Generating..." : "AI Generate Plan"}
                  </Button>
                </div>

                {planningFramework ? (
                  <div className="space-y-4">
                    {planningFramework.product_market_fit && (
                      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                        <h4 className="font-display text-base text-foreground flex items-center gap-2"><Target size={16} className="text-accent" /> Product-Market Fit</h4>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Target Market</p>
                            <p className="font-body text-sm text-foreground">{planningFramework.product_market_fit.target_market}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Market Size</p>
                            <p className="font-body text-sm text-foreground">{planningFramework.product_market_fit.market_size}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Differentiation</p>
                            <p className="font-body text-sm text-foreground">{planningFramework.product_market_fit.differentiation}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Competition</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {planningFramework.product_market_fit.competition?.map((c: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-destructive/10 text-destructive font-body text-[10px]">{c}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {planningFramework.revenue_model && (
                      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                        <h4 className="font-display text-base text-foreground flex items-center gap-2"><TrendingUp size={16} className="text-accent" /> Revenue Model</h4>
                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Type</p>
                            <p className="font-body text-sm text-foreground">{planningFramework.revenue_model.type}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Pricing</p>
                            <p className="font-body text-sm text-foreground">{planningFramework.revenue_model.pricing_strategy}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Streams</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {planningFramework.revenue_model.revenue_streams?.map((s: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-[10px]">{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {planningFramework.go_to_market && (
                      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                        <h4 className="font-display text-base text-foreground flex items-center gap-2"><Rocket size={16} className="text-accent" /> Go-to-Market</h4>
                        <p className="font-body text-sm text-foreground">{planningFramework.go_to_market.launch_strategy}</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Channels</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {planningFramework.go_to_market.channels?.map((c: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-[10px]">{c}</span>
                              ))}
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Growth Tactics</p>
                            <ul className="space-y-0.5 mt-1">
                              {planningFramework.go_to_market.growth_tactics?.map((t: string, i: number) => (
                                <li key={i} className="font-body text-xs text-foreground">• {t}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {planningFramework.financial_plan && (
                      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                        <h4 className="font-display text-base text-foreground flex items-center gap-2"><BarChart3 size={16} className="text-accent" /> Financial Plan</h4>
                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Runway</p>
                            <p className="font-body text-sm text-foreground">{planningFramework.financial_plan.runway_months} months</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Break-even</p>
                            <p className="font-body text-sm text-foreground">{planningFramework.financial_plan.break_even_estimate}</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="font-body text-xs text-muted-foreground">Initial Costs</p>
                            <ul className="space-y-0.5 mt-1">
                              {planningFramework.financial_plan.initial_costs?.map((c: string, i: number) => (
                                <li key={i} className="font-body text-xs text-foreground">• {c}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-card rounded-xl border border-border">
                    <Target className="mx-auto text-muted-foreground mb-2" size={32} />
                    <p className="font-body text-sm text-muted-foreground">Click "AI Generate Plan" to build your comprehensive planning framework.</p>
                  </div>
                )}
              </TabsContent>

              {/* Milestones */}
              <TabsContent value="milestones" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-foreground">Goals & Milestones</h3>
                  <Button size="sm" onClick={() => setShowMsForm(!showMsForm)} className="gradient-warm text-secondary-foreground">
                    <Plus size={14} /> Add
                  </Button>
                </div>

                {showMsForm && (
                  <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                    <Input placeholder="Milestone title" value={msForm.title} onChange={e => setMsForm({ ...msForm, title: e.target.value })} />
                    <Textarea placeholder="Description" value={msForm.description} onChange={e => setMsForm({ ...msForm, description: e.target.value })} rows={2} />
                    <div className="flex gap-2">
                      <Input type="date" value={msForm.due_date} onChange={e => setMsForm({ ...msForm, due_date: e.target.value })} />
                      <select className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={msForm.category} onChange={e => setMsForm({ ...msForm, category: e.target.value })}>
                        <option value="general">General</option>
                        <option value="product">Product</option>
                        <option value="marketing">Marketing</option>
                        <option value="finance">Finance</option>
                        <option value="team">Team</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={createMilestone}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowMsForm(false)}>Cancel</Button>
                    </div>
                  </div>
                )}

                {milestones.length > 0 && (
                  <div className="mb-2">
                    <Progress value={msProgress} className="h-2" />
                    <p className="font-body text-xs text-muted-foreground mt-1">{completedMs} of {milestones.length} completed</p>
                  </div>
                )}

                {milestones.length === 0 ? (
                  <div className="text-center py-8 bg-card rounded-xl border border-border">
                    <Milestone className="mx-auto text-muted-foreground mb-2" size={32} />
                    <p className="font-body text-sm text-muted-foreground">No milestones yet. Add manually or generate via Planning tab.</p>
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
                          <div className="flex items-center gap-2">
                            <h4 className={`font-display text-sm ${ms.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{ms.title}</h4>
                            <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px] capitalize">{ms.category}</span>
                          </div>
                          {ms.description && <p className="font-body text-xs text-muted-foreground mt-0.5">{ms.description}</p>}
                          {ms.due_date && (
                            <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock size={10} /> {ms.due_date}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Funding */}
              <TabsContent value="funding" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg text-foreground">Funding & Pitch Preparation</h3>
                    <p className="font-body text-sm text-muted-foreground">Prepare pitch decks, funding strategies, and investor materials.</p>
                  </div>
                  <Button onClick={aiPitch} disabled={aiLoading} className="gradient-warm text-secondary-foreground">
                    <Presentation size={14} /> {aiLoading ? "Preparing..." : "AI Pitch Prep"}
                  </Button>
                </div>

                {pitchPrep ? (
                  <div className="space-y-4">
                    {pitchPrep.elevator_pitch && (
                      <div className="bg-accent/5 rounded-xl border border-accent/20 p-5">
                        <h4 className="font-display text-base text-foreground mb-2">Elevator Pitch</h4>
                        <p className="font-body text-sm text-foreground italic">"{pitchPrep.elevator_pitch}"</p>
                      </div>
                    )}

                    {pitchPrep.deck_outline && (
                      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                        <h4 className="font-display text-base text-foreground">Deck Outline</h4>
                        <div className="space-y-2">
                          {pitchPrep.deck_outline.map((slide: any, i: number) => (
                            <div key={i} className="bg-muted/50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="w-6 h-6 rounded-full gradient-warm flex items-center justify-center font-body text-[10px] text-secondary-foreground">{i + 1}</span>
                                <p className="font-display text-sm text-foreground">{slide.slide}</p>
                              </div>
                              <p className="font-body text-xs text-muted-foreground">{slide.content}</p>
                              {slide.tips && <p className="font-body text-[10px] text-accent mt-1">💡 {slide.tips}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pitchPrep.common_questions && (
                      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                        <h4 className="font-display text-base text-foreground">Common Investor Questions</h4>
                        <div className="space-y-2">
                          {pitchPrep.common_questions.map((qa: any, i: number) => (
                            <div key={i} className="bg-muted/50 rounded-lg p-3">
                              <p className="font-body text-sm text-foreground font-medium">Q: {qa.question}</p>
                              <p className="font-body text-xs text-muted-foreground mt-1">A: {qa.suggested_answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pitchPrep.storytelling_tips && (
                      <div className="bg-card rounded-xl border border-border p-5">
                        <h4 className="font-display text-base text-foreground mb-2">Storytelling Tips</h4>
                        <ul className="space-y-1">
                          {pitchPrep.storytelling_tips.map((tip: string, i: number) => (
                            <li key={i} className="font-body text-xs text-muted-foreground flex items-start gap-2">
                              <BookOpen size={12} className="text-accent mt-0.5 shrink-0" /> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-card rounded-xl border border-border">
                    <Presentation className="mx-auto text-muted-foreground mb-2" size={32} />
                    <p className="font-body text-sm text-muted-foreground">Click "AI Pitch Prep" to generate your pitch materials.</p>
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
                    <p className="font-body text-xs text-muted-foreground">{completedMs}/{milestones.length} completed</p>
                    {milestones.slice(0, 5).map(ms => (
                      <div key={ms.id} className="flex items-center gap-2">
                        <CheckCircle2 size={12} className={ms.status === "completed" ? "text-accent" : "text-muted-foreground"} />
                        <span className="font-body text-xs text-foreground truncate">{ms.title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                    <h4 className="font-display text-sm text-foreground">Validation Summary</h4>
                    {[
                      { label: "Planned", count: sprints.filter(s => s.status === "planned").length },
                      { label: "Running", count: sprints.filter(s => s.status === "running").length },
                      { label: "Completed", count: completedSprints },
                    ].map(s => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="font-body text-xs text-muted-foreground">{s.label}</span>
                        <span className="font-display text-sm text-foreground">{s.count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-card rounded-xl border border-border p-5 space-y-3 md:col-span-2">
                    <h4 className="font-display text-sm text-foreground">Plan Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: "Vision", done: !!selectedPlan.vision },
                        { label: "Problem", done: !!selectedPlan.problem_statement },
                        { label: "Value Prop", done: !!selectedPlan.value_proposition },
                        { label: "Revenue", done: !!selectedPlan.revenue_model },
                        { label: "Go-to-Market", done: !!selectedPlan.go_to_market },
                        { label: "Financial Plan", done: selectedPlan.financial_plan && Object.keys(selectedPlan.financial_plan).length > 0 },
                        { label: "Pitch Notes", done: !!selectedPlan.pitch_notes },
                        { label: "Milestones", done: milestones.length > 0 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 size={14} className={item.done ? "text-accent" : "text-muted-foreground"} />
                          <span className="font-body text-xs text-foreground">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
};

export default StartupLab;
