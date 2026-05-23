import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Building2, Save, Target, Users, TrendingUp, Sparkles, Loader2,
  ArrowRight, Lightbulb, Zap, BookOpen, MessageSquare, DollarSign,
  ChevronRight, AlertTriangle, Star, Shield, Clock, Route, Award
} from "lucide-react";

const StartupProfiling = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("snapshot");
  const [loading, setLoading] = useState(true);

  // Core data
  const [ideas, setIdeas] = useState<any[]>([]);
  const [activeIdea, setActiveIdea] = useState<any>(null);
  const [founderProfile, setFounderProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [labPlans, setLabPlans] = useState<any[]>([]);
  const [labMilestones, setLabMilestones] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [mvpMilestones, setMvpMilestones] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Editable profile fields
  const [form, setForm] = useState({
    mission: "", vision: "", customer_segment: "", team_notes: "", funding_stage: "",
  });

  // AI insights
  const [snapshot, setSnapshot] = useState<any>(null);
  const [customerInsights, setCustomerInsights] = useState<any>(null);
  const [teamMapping, setTeamMapping] = useState<any>(null);
  const [growthPlan, setGrowthPlan] = useState<any>(null);
  const [challengesLearning, setChallengesLearning] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    if (!user) return;
    const uid = user.id;
    const [idRes, fpRes, skRes, lpRes, lmRes, exRes, mmRes, spRes, obRes, prRes, ulRes, acRes] = await Promise.all([
      supabase.from("startup_ideas").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("founder_profiles").select("*").eq("user_id", uid).single(),
      supabase.from("skills").select("*").eq("user_id", uid),
      supabase.from("lab_plans").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("lab_milestones").select("*").eq("user_id", uid),
      supabase.from("mvp_experiments").select("*").eq("user_id", uid),
      supabase.from("mvp_milestones").select("*").eq("user_id", uid),
      supabase.from("validation_sprints").select("*").eq("user_id", uid),
      supabase.from("problem_observations").select("*").eq("user_id", uid),
      supabase.from("projects").select("*").eq("user_id", uid),
      supabase.from("user_learning_progress").select("*").eq("user_id", uid),
      supabase.from("achievements").select("*").eq("user_id", uid),
    ]);

    const ideasData = idRes.data || [];
    setIdeas(ideasData);
    const active = ideasData.find((i: any) => i.is_active) || ideasData[0] || null;
    setActiveIdea(active);
    setFounderProfile(fpRes.data || null);
    setSkills(skRes.data || []);
    setLabPlans(lpRes.data || []);
    setLabMilestones(lmRes.data || []);
    setExperiments(exRes.data || []);
    setMvpMilestones(mmRes.data || []);
    setSprints(spRes.data || []);
    setObservations(obRes.data || []);
    setProjects(prRes.data || []);
    setLearningProgress(ulRes.data || []);
    setAchievements(acRes.data || []);
    setLoading(false);
  };

  const saveProfile = () => {
    toast.success("Startup profile updated!");
  };

  const callAI = async (type: string, setter: (d: any) => void) => {
    setAiLoading(type);
    try {
      const context = {
        idea: activeIdea, founderProfile, skills, labPlans, milestones: [...labMilestones, ...mvpMilestones],
        experiments, sprints, observations, learning: learningProgress,
      };
      const { data, error } = await supabase.functions.invoke("startup-profiling-ai", { body: { type, context } });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setter(data);
    } catch (e: any) {
      toast.error(e.message || "AI analysis failed");
    } finally {
      setAiLoading(null);
    }
  };

  const allMilestones = [...labMilestones, ...mvpMilestones];
  const completedMilestones = allMilestones.filter(m => m.status === "completed").length;
  const completedExperiments = experiments.filter(e => e.status === "completed").length;
  const validatedSprints = sprints.filter(s => s.validated).length;

  if (loading) return <div className="text-center py-12"><div className="animate-pulse font-body text-muted-foreground">Loading startup profile...</div></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Building2 size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Startup Profiling</h1>
            <p className="font-body text-sm text-muted-foreground">Here's your startup — track its mission, challenges, milestones, and growth in one place.</p>
          </div>
        </div>
      </motion.div>

      {/* Idea Selector */}
      {ideas.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {ideas.map((idea: any) => (
            <button key={idea.id} onClick={() => setActiveIdea(idea)}
              className={`px-3 py-1.5 rounded-lg font-body text-sm border transition-colors ${activeIdea?.id === idea.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}>
              {idea.title}
            </button>
          ))}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-1">
          <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
        </TabsList>

        {/* SNAPSHOT TAB */}
        <TabsContent value="snapshot" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Active Ideas", value: ideas.filter(i => i.is_active).length, icon: Lightbulb, color: "text-accent" },
              { label: "Experiments", value: experiments.length, icon: Zap, color: "text-primary" },
              { label: "Milestones Done", value: completedMilestones, icon: Target, color: "text-accent" },
              { label: "Validations", value: validatedSprints, icon: Shield, color: "text-primary" },
              { label: "Lab Plans", value: labPlans.length, icon: Route, color: "text-accent" },
              { label: "Projects", value: projects.length, icon: Building2, color: "text-primary" },
              { label: "Observations", value: observations.length, icon: MessageSquare, color: "text-accent" },
              { label: "Achievements", value: achievements.length, icon: Award, color: "text-primary" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-4 text-center">
                <s.icon size={18} className={`mx-auto mb-1 ${s.color}`} />
                <p className="font-display text-2xl text-foreground">{s.value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* AI Snapshot */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Sparkles size={18} className="text-accent" /> AI Startup Analysis</h2>
              <Button size="sm" onClick={() => callAI("startup_snapshot", setSnapshot)} disabled={aiLoading === "startup_snapshot"} className="gradient-warm text-secondary-foreground">
                {aiLoading === "startup_snapshot" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Analyze
              </Button>
            </div>
            {snapshot ? (
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="font-body text-sm text-foreground">{snapshot.summary}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-display text-3xl text-foreground">{snapshot.health_score}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Health Score</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-muted/30 rounded-full h-3">
                      <div className="h-3 rounded-full gradient-warm" style={{ width: `${snapshot.health_score}%` }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-sm text-foreground">{snapshot.stage}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Stage</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Strengths</h3>
                    <div className="flex flex-wrap gap-2">
                      {(snapshot.strengths || []).map((s: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Weaknesses</h3>
                    <div className="flex flex-wrap gap-2">
                      {(snapshot.weaknesses || []).map((s: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-body">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {snapshot.competitive_advantages?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Competitive Advantages</h3>
                    <ul className="space-y-1">
                      {snapshot.competitive_advantages.map((a: string, i: number) => (
                        <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                          <Star size={14} className="text-primary mt-0.5 shrink-0" />{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {snapshot.risk_factors?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Risk Factors</h3>
                    <ul className="space-y-1">
                      {snapshot.risk_factors.map((r: string, i: number) => (
                        <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                          <AlertTriangle size={14} className="text-accent mt-0.5 shrink-0" />{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Click Analyze for an AI-powered startup health assessment.</p>
            )}
          </div>

          {/* Mission & Vision Editor */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-display text-xl text-foreground">
              {activeIdea ? `Profile: ${activeIdea.title}` : "Mission & Vision"}
            </h2>
            <div className="space-y-2">
              <label className="font-body text-sm font-medium text-foreground">Mission Statement</label>
              <Textarea placeholder="What is your startup's mission?" value={form.mission} onChange={e => setForm({ ...form, mission: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <label className="font-body text-sm font-medium text-foreground">Vision</label>
              <Textarea placeholder="Where do you see this in 5 years?" value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} rows={2} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-foreground">Customer Segments</label>
                <Input placeholder="Who are your target customers?" value={form.customer_segment} onChange={e => setForm({ ...form, customer_segment: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-foreground">Funding Stage</label>
                <select value={form.funding_stage} onChange={e => setForm({ ...form, funding_stage: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
                  <option value="">Select...</option>
                  <option value="bootstrapping">Bootstrapping</option>
                  <option value="pre-seed">Pre-Seed</option>
                  <option value="seed">Seed</option>
                  <option value="series-a">Series A</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-body text-sm font-medium text-foreground">Team Notes</label>
              <Textarea placeholder="Team structure, roles, skill gaps..." value={form.team_notes} onChange={e => setForm({ ...form, team_notes: e.target.value })} rows={2} />
            </div>
            <Button onClick={saveProfile} className="gradient-warm text-secondary-foreground"><Save size={18} /> Save Profile</Button>
          </div>
        </TabsContent>

        {/* CUSTOMERS TAB */}
        <TabsContent value="customers" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Users size={18} className="text-primary" /> Customer Insights</h2>
              <Button size="sm" onClick={() => callAI("customer_insights", setCustomerInsights)} disabled={aiLoading === "customer_insights"} className="gradient-warm text-secondary-foreground">
                {aiLoading === "customer_insights" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate Insights
              </Button>
            </div>

            {/* Problem Observations */}
            {observations.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display text-sm text-foreground mb-2">Problem Observations ({observations.length})</h3>
                <div className="space-y-2">
                  {observations.slice(0, 5).map((ob: any) => (
                    <div key={ob.id} className="bg-muted/20 rounded-lg p-3">
                      <p className="font-body text-sm text-foreground">{ob.observation}</p>
                      <div className="flex gap-3 mt-1">
                        {ob.category && <span className="font-body text-[10px] text-primary">{ob.category}</span>}
                        {ob.scale && <span className="font-body text-[10px] text-muted-foreground">Scale: {ob.scale}</span>}
                        {ob.feasibility && <span className="font-body text-[10px] text-muted-foreground">Feasibility: {ob.feasibility}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {customerInsights ? (
              <div className="space-y-4 border-t border-border pt-4">
                {customerInsights.primary_segments?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-3">Customer Segments</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {customerInsights.primary_segments.map((seg: any, i: number) => (
                        <div key={i} className="bg-muted/20 rounded-lg p-4">
                          <p className="font-display text-sm text-foreground mb-1">{seg.name}</p>
                          <p className="font-body text-[10px] text-muted-foreground mb-2">Est. size: {seg.size_estimate}</p>
                          <div className="space-y-1">
                            <p className="font-body text-[10px] text-primary">Pain Points:</p>
                            {seg.pain_points?.map((p: string, j: number) => (
                              <p key={j} className="font-body text-xs text-muted-foreground pl-2">• {p}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {customerInsights.customer_personas?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-3">Customer Personas</h3>
                    <div className="space-y-2">
                      {customerInsights.customer_personas.map((p: any, i: number) => (
                        <div key={i} className="bg-muted/20 rounded-lg p-3">
                          <p className="font-body text-sm font-medium text-foreground">{p.name}</p>
                          <p className="font-body text-xs text-muted-foreground">{p.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.behaviors?.map((b: string, j: number) => (
                              <span key={j} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-body">{b}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {customerInsights.value_propositions?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Value Propositions</h3>
                    <ul className="space-y-1">
                      {customerInsights.value_propositions.map((v: string, i: number) => (
                        <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                          <Star size={14} className="text-primary mt-0.5 shrink-0" />{v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {customerInsights.acquisition_channels?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Acquisition Channels</h3>
                    <div className="flex flex-wrap gap-2">
                      {customerInsights.acquisition_channels.map((c: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-body">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Click Generate Insights for AI-powered customer analysis based on your observations and experiments.</p>
            )}
          </div>
        </TabsContent>

        {/* TEAM TAB */}
        <TabsContent value="team" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Users size={18} className="text-accent" /> Team Mapping</h2>
              <Button size="sm" onClick={() => callAI("team_mapping", setTeamMapping)} disabled={aiLoading === "team_mapping"} className="gradient-warm text-secondary-foreground">
                {aiLoading === "team_mapping" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Map Team
              </Button>
            </div>

            {/* Current Skills */}
            {skills.length > 0 && (
              <div className="mb-6">
                <h3 className="font-display text-sm text-foreground mb-2">Your Skills ({skills.length})</h3>
                <div className="grid md:grid-cols-3 gap-2">
                  {skills.map((skill: any) => (
                    <div key={skill.id} className="flex items-center gap-2 bg-muted/20 rounded-lg p-2">
                      <div className="flex-1">
                        <p className="font-body text-xs text-foreground">{skill.name}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{skill.category || "General"}</p>
                      </div>
                      <div className="w-12">
                        <div className="w-full bg-muted/30 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full gradient-warm" style={{ width: `${(skill.proficiency || 0) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {teamMapping ? (
              <div className="space-y-4 border-t border-border pt-4">
                {teamMapping.current_coverage?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Current Coverage</h3>
                    <div className="space-y-2">
                      {teamMapping.current_coverage.map((c: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-muted/20 rounded-lg p-3">
                          <p className="font-body text-sm text-foreground">{c.area}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-body text-xs text-primary">{c.strength}</span>
                            <span className="font-body text-[10px] text-muted-foreground">{c.owner}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {teamMapping.gaps?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Team Gaps</h3>
                    <div className="space-y-2">
                      {teamMapping.gaps.map((g: any, i: number) => (
                        <div key={i} className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-body text-sm font-medium text-foreground">{g.role}</p>
                            <span className={`font-body text-[10px] px-2 py-0.5 rounded-full ${g.priority === "high" ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"}`}>{g.priority}</span>
                          </div>
                          <p className="font-body text-xs text-muted-foreground mt-1">{g.reason}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {g.skills_needed?.map((s: string, j: number) => (
                              <span key={j} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-body">{s}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {teamMapping.recommended_hires?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Recommended Hires</h3>
                    <div className="space-y-2">
                      {teamMapping.recommended_hires.map((h: any, i: number) => (
                        <div key={i} className="bg-muted/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-body text-sm font-medium text-foreground">{h.title}</p>
                            <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1"><Clock size={10} />{h.when}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {h.key_skills?.map((s: string, j: number) => (
                              <span key={j} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-body">{s}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {teamMapping.task_alignment?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Task Alignment</h3>
                    <div className="space-y-1">
                      {teamMapping.task_alignment.map((t: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <p className="font-body text-sm text-foreground">{t.task}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-body text-xs text-primary">{t.best_fit_skill}</span>
                            <span className="font-body text-[10px] text-muted-foreground">{t.confidence}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Click Map Team for AI-powered team analysis and role recommendations.</p>
            )}
          </div>
        </TabsContent>

        {/* MILESTONES TAB */}
        <TabsContent value="milestones" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2"><Target size={18} className="text-primary" /> Milestone & Experiment Tracker</h2>

            {/* Progress Summary */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/20 rounded-lg p-4 text-center">
                <p className="font-display text-2xl text-foreground">{completedMilestones}<span className="text-sm text-muted-foreground">/{allMilestones.length}</span></p>
                <p className="font-body text-[10px] text-muted-foreground">Milestones</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-4 text-center">
                <p className="font-display text-2xl text-foreground">{completedExperiments}<span className="text-sm text-muted-foreground">/{experiments.length}</span></p>
                <p className="font-body text-[10px] text-muted-foreground">Experiments</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-4 text-center">
                <p className="font-display text-2xl text-foreground">{validatedSprints}<span className="text-sm text-muted-foreground">/{sprints.length}</span></p>
                <p className="font-body text-[10px] text-muted-foreground">Validated Sprints</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              {[
                ...allMilestones.map(m => ({ title: m.title, type: "Milestone", date: m.created_at, status: m.status, category: m.category })),
                ...experiments.map(e => ({ title: e.title, type: "Experiment", date: e.created_at, status: e.status, category: e.method })),
                ...sprints.map(s => ({ title: s.title, type: "Sprint", date: s.created_at, status: s.status, category: s.method })),
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 15)
                .map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${item.status === "completed" ? "bg-primary" : item.status === "in_progress" ? "bg-accent" : "bg-muted-foreground"}`} />
                      {i < 14 && <div className="w-0.5 flex-1 bg-border" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <p className="font-body text-sm text-foreground font-medium">{item.title}</p>
                      <p className="font-body text-[10px] text-muted-foreground">
                        {item.type} · {item.status} {item.category ? `· ${item.category}` : ""} · {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              {allMilestones.length === 0 && experiments.length === 0 && sprints.length === 0 && (
                <p className="font-body text-sm text-muted-foreground text-center py-6">Create milestones in MVP Builder or Startup Lab to track your progress here.</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* CHALLENGES TAB */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2"><AlertTriangle size={18} className="text-accent" /> Challenges & Learning</h2>
              <Button size="sm" onClick={() => callAI("challenges_learning", setChallengesLearning)} disabled={aiLoading === "challenges_learning"} className="gradient-warm text-secondary-foreground">
                {aiLoading === "challenges_learning" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Identify Gaps
              </Button>
            </div>

            {/* Learning Progress Summary */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2"><BookOpen size={14} /> Learning Progress</h3>
                <p className="font-display text-2xl text-foreground">{learningProgress.filter(l => l.status === "completed").length}<span className="text-sm text-muted-foreground">/{learningProgress.length}</span></p>
                <p className="font-body text-[10px] text-muted-foreground">modules completed</p>
              </div>
              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2"><Zap size={14} /> Skills</h3>
                <p className="font-display text-2xl text-foreground">{skills.length}</p>
                <p className="font-body text-[10px] text-muted-foreground">skills tracked</p>
              </div>
            </div>

            {challengesLearning ? (
              <div className="space-y-4 border-t border-border pt-4">
                {challengesLearning.active_challenges?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Active Challenges</h3>
                    <div className="space-y-2">
                      {challengesLearning.active_challenges.map((c: any, i: number) => (
                        <div key={i} className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-body text-sm font-medium text-foreground">{c.challenge}</p>
                            <span className={`font-body text-[10px] px-2 py-0.5 rounded-full ${c.severity === "high" ? "bg-destructive/10 text-destructive" : c.severity === "medium" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                              {c.severity}
                            </span>
                          </div>
                          <p className="font-body text-[10px] text-muted-foreground mt-1">{c.category}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {challengesLearning.knowledge_gaps?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Knowledge Gaps</h3>
                    <div className="space-y-2">
                      {challengesLearning.knowledge_gaps.map((g: any, i: number) => (
                        <div key={i} className="bg-muted/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-body text-sm font-medium text-foreground">{g.topic}</p>
                            <span className="font-body text-[10px] text-primary">{g.relevance}</span>
                          </div>
                          {g.suggested_resources?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {g.suggested_resources.map((r: string, j: number) => (
                                <p key={j} className="font-body text-xs text-muted-foreground flex items-start gap-1">
                                  <BookOpen size={10} className="mt-0.5 shrink-0" />{r}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {challengesLearning.mentor_topics?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Mentor Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {challengesLearning.mentor_topics.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {challengesLearning.immediate_learning?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Start Learning Now</h3>
                    <ul className="space-y-1">
                      {challengesLearning.immediate_learning.map((l: string, i: number) => (
                        <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                          <ArrowRight size={14} className="text-primary mt-0.5 shrink-0" />{l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Click Identify Gaps for AI-powered challenge analysis and learning recommendations.</p>
            )}
          </div>
        </TabsContent>

        {/* GROWTH TAB */}
        <TabsContent value="growth" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Growth Plan & Funding</h2>
              <Button size="sm" onClick={() => callAI("growth_plan", setGrowthPlan)} disabled={aiLoading === "growth_plan"} className="gradient-warm text-secondary-foreground">
                {aiLoading === "growth_plan" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate Plan
              </Button>
            </div>

            {growthPlan ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-muted/20 rounded-lg p-4">
                  <div className="text-center">
                    <p className="font-display text-sm text-foreground">{growthPlan.current_stage}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Current</p>
                  </div>
                  <ArrowRight size={20} className="text-primary" />
                  <div className="text-center">
                    <p className="font-display text-sm text-foreground">{growthPlan.next_stage}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Next</p>
                  </div>
                  <div className="flex-1" />
                  <div className="text-center">
                    <p className="font-display text-2xl text-foreground">{growthPlan.funding_readiness}%</p>
                    <p className="font-body text-[10px] text-muted-foreground">Funding Ready</p>
                  </div>
                </div>

                {growthPlan.growth_actions?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-3">Growth Actions</h3>
                    <div className="space-y-2">
                      {growthPlan.growth_actions.map((a: any, i: number) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          className="bg-muted/20 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-body text-sm font-medium text-foreground">{a.action}</p>
                              <p className="font-body text-xs text-muted-foreground">{a.impact}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-body text-[10px] text-primary flex items-center gap-1"><Clock size={10} />{a.timeline}</span>
                              <span className="font-body text-[10px] text-muted-foreground">{a.category}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {growthPlan.funding_strategy && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2"><DollarSign size={14} /> Funding Strategy</h3>
                    <p className="font-body text-sm text-muted-foreground">{growthPlan.funding_strategy}</p>
                  </div>
                )}

                {growthPlan.pitch_points?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Pitch Points</h3>
                    <ul className="space-y-1">
                      {growthPlan.pitch_points.map((p: string, i: number) => (
                        <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight size={14} className="text-primary mt-0.5 shrink-0" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {growthPlan.key_metrics_to_track?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Key Metrics to Track</h3>
                    <div className="flex flex-wrap gap-2">
                      {growthPlan.key_metrics_to_track.map((m: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">{m}</span>
                      ))}
                    </div>
                  </div>
                )}

                {growthPlan.scaling_risks?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Scaling Risks</h3>
                    <ul className="space-y-1">
                      {growthPlan.scaling_risks.map((r: string, i: number) => (
                        <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                          <AlertTriangle size={14} className="text-accent mt-0.5 shrink-0" />{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="mx-auto text-muted-foreground mb-3" size={40} />
                <h3 className="font-display text-lg text-foreground mb-2">Ready to plan your growth?</h3>
                <p className="font-body text-sm text-muted-foreground">Click Generate Plan for AI-powered growth strategy, funding readiness, and actionable next steps.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartupProfiling;
