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
  User, Save, Sparkles, Brain, Target, TrendingUp, Award, BookOpen,
  MessageSquare, ArrowRight, Loader2, ChevronRight, Clock, Lightbulb,
  Zap, Shield, Heart, Star, Route, Users
} from "lucide-react";

const FounderProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Profile form
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    founder_type: "", strengths: "", weaknesses: "", experience_level: "beginner",
    industries: "", looking_for: "", pitch: "",
  });

  // Aggregated data
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [paths, setPaths] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);
  const [ideas, setIdeas] = useState<any[]>([]);

  // AI insights
  const [profileInsights, setProfileInsights] = useState<any>(null);
  const [skillEvolution, setSkillEvolution] = useState<any>(null);
  const [mindsetAnalysis, setMindsetAnalysis] = useState<any>(null);
  const [nextSteps, setNextSteps] = useState<any>(null);
  const [journeyNarrative, setJourneyNarrative] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    if (!user) return;
    const uid = user.id;
    const [
      fpRes, skRes, prRes, achRes, habRes, chRes, pathRes, expRes, msRes, lpRes, idRes
    ] = await Promise.all([
      supabase.from("founder_profiles").select("*").eq("user_id", uid).single(),
      supabase.from("skills").select("*").eq("user_id", uid),
      supabase.from("projects").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("achievements").select("*").eq("user_id", uid).order("earned_at", { ascending: false }),
      supabase.from("mindset_habits").select("*").eq("user_id", uid),
      supabase.from("mindset_challenges").select("*").eq("user_id", uid),
      supabase.from("path_selections").select("*").eq("user_id", uid),
      supabase.from("mvp_experiments").select("*").eq("user_id", uid),
      supabase.from("mvp_milestones").select("*").eq("user_id", uid),
      supabase.from("user_learning_progress").select("*").eq("user_id", uid),
      supabase.from("startup_ideas").select("*").eq("user_id", uid),
    ]);

    if (fpRes.data) {
      setProfile(fpRes.data);
      setForm({
        founder_type: fpRes.data.founder_type || "",
        strengths: (fpRes.data.strengths || []).join(", "),
        weaknesses: (fpRes.data.weaknesses || []).join(", "),
        experience_level: fpRes.data.experience_level || "beginner",
        industries: (fpRes.data.industries || []).join(", "),
        looking_for: (fpRes.data.looking_for || []).join(", "),
        pitch: fpRes.data.pitch || "",
      });
    }
    setSkills(skRes.data || []);
    setProjects(prRes.data || []);
    setAchievements(achRes.data || []);
    setHabits(habRes.data || []);
    setChallenges(chRes.data || []);
    setPaths(pathRes.data || []);
    setExperiments(expRes.data || []);
    setMilestones(msRes.data || []);
    setLearningProgress(lpRes.data || []);
    setIdeas(idRes.data || []);
    setLoading(false);
  };

  const saveProfile = async () => {
    const payload = {
      user_id: user!.id,
      founder_type: form.founder_type,
      strengths: form.strengths.split(",").map(s => s.trim()).filter(Boolean),
      weaknesses: form.weaknesses.split(",").map(s => s.trim()).filter(Boolean),
      experience_level: form.experience_level,
      industries: form.industries.split(",").map(s => s.trim()).filter(Boolean),
      looking_for: form.looking_for.split(",").map(s => s.trim()).filter(Boolean),
      pitch: form.pitch,
    };
    if (profile) {
      const { error } = await supabase.from("founder_profiles").update(payload).eq("id", profile.id);
      if (error) { toast.error("Failed to update"); return; }
    } else {
      const { error } = await supabase.from("founder_profiles").insert(payload);
      if (error) { toast.error("Failed to create profile"); return; }
    }
    toast.success("Founder profile saved!");
    fetchAllData();
  };

  const callAI = async (type: string, setter: (d: any) => void) => {
    setAiLoading(type);
    try {
      const context: any = { profile, skills, projects, habits, challenges, paths, experiments, milestones, learning: learningProgress, achievements };
      const { data, error } = await supabase.functions.invoke("founder-profiling-ai", { body: { type, context } });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      setter(data);
    } catch (e: any) {
      toast.error(e.message || "AI analysis failed");
    } finally {
      setAiLoading(null);
    }
  };

  const completedChallenges = challenges.filter(c => c.status === "completed").length;
  const completedMilestones = milestones.filter(m => m.status === "completed").length;
  const completedLearning = learningProgress.filter(l => l.status === "completed").length;
  const totalPoints = achievements.reduce((s, a) => s + (a.points || 0), 0);

  if (loading) return <div className="text-center py-12"><div className="animate-pulse font-body text-muted-foreground">Loading your founder profile...</div></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <User size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Founder Profiling</h1>
            <p className="font-body text-sm text-muted-foreground">Here's your founder story — track how you've grown, where your strengths lie, and where you're headed next.</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 gap-1">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="mindset">Mindset</TabsTrigger>
          <TabsTrigger value="journey">Journey</TabsTrigger>
          <TabsTrigger value="next">Next Steps</TabsTrigger>
        </TabsList>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Skills", value: skills.length, icon: Zap, color: "text-accent" },
              { label: "Projects", value: projects.length, icon: Target, color: "text-primary" },
              { label: "Achievements", value: achievements.length, icon: Award, color: "text-accent" },
              { label: "Points", value: totalPoints, icon: Star, color: "text-primary" },
              { label: "Ideas", value: ideas.length, icon: Lightbulb, color: "text-accent" },
              { label: "Experiments", value: experiments.length, icon: TrendingUp, color: "text-primary" },
              { label: "Milestones Done", value: completedMilestones, icon: ChevronRight, color: "text-accent" },
              { label: "Courses Done", value: completedLearning, icon: BookOpen, color: "text-primary" },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-4 text-center">
                <s.icon size={18} className={`mx-auto mb-1 ${s.color}`} />
                <p className="font-display text-2xl text-foreground">{s.value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* AI Profile Insights */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Sparkles size={18} className="text-accent" /> AI Profile Insights</h2>
              <Button size="sm" onClick={() => callAI("profile_insights", setProfileInsights)} disabled={aiLoading === "profile_insights"} className="gradient-warm text-secondary-foreground">
                {aiLoading === "profile_insights" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Analyze
              </Button>
            </div>
            {profileInsights ? (
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="font-body text-sm text-foreground">{profileInsights.identity_summary}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Top Strengths</h3>
                    <div className="flex flex-wrap gap-2">
                      {(profileInsights.top_strengths || []).map((s: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Growth Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {(profileInsights.growth_areas || []).map((s: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-body">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { label: "Archetype", value: profileInsights.entrepreneurial_archetype },
                    { label: "Leadership", value: profileInsights.leadership_style },
                    { label: "Decision Pattern", value: profileInsights.decision_pattern },
                  ].map((item, i) => (
                    <div key={i} className="bg-muted/20 rounded-lg p-3">
                      <p className="font-body text-[10px] text-muted-foreground">{item.label}</p>
                      <p className="font-display text-sm text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                {profileInsights.confidence_level != null && (
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-1">Confidence Level</p>
                    <div className="w-full bg-muted/30 rounded-full h-3">
                      <div className="h-3 rounded-full gradient-warm" style={{ width: `${profileInsights.confidence_level}%` }} />
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-1 text-right">{profileInsights.confidence_level}%</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Click Analyze to get AI-powered insights about your founder identity.</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {[
                ...projects.slice(0, 3).map(p => ({ type: "Project", title: p.title, date: p.created_at, icon: Target })),
                ...achievements.slice(0, 3).map(a => ({ type: "Achievement", title: a.title, date: a.earned_at, icon: Award })),
                ...ideas.slice(0, 3).map(i => ({ type: "Idea", title: i.title, date: i.created_at, icon: Lightbulb })),
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 6)
                .map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <item.icon size={16} className="text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-body text-sm text-foreground">{item.title}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{item.type} · {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              {projects.length === 0 && achievements.length === 0 && ideas.length === 0 && (
                <p className="font-body text-sm text-muted-foreground text-center py-4">Start exploring to build your activity history!</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* IDENTITY TAB */}
        <TabsContent value="identity" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h2 className="font-display text-xl text-foreground">Your Founder Identity</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-foreground">Founder Type</label>
                <select value={form.founder_type} onChange={e => setForm({ ...form, founder_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
                  <option value="">Select...</option>
                  <option value="technical">Technical Founder</option>
                  <option value="business">Business Founder</option>
                  <option value="creative">Creative Founder</option>
                  <option value="hybrid">Hybrid Founder</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-body text-sm font-medium text-foreground">Experience Level</label>
                <select value={form.experience_level} onChange={e => setForm({ ...form, experience_level: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
                  <option value="beginner">First-time Founder</option>
                  <option value="intermediate">Some Experience</option>
                  <option value="experienced">Serial Entrepreneur</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-body text-sm font-medium text-foreground">Strengths (comma-separated)</label>
              <Input placeholder="e.g., Product Design, Fundraising" value={form.strengths} onChange={e => setForm({ ...form, strengths: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="font-body text-sm font-medium text-foreground">Areas to Improve (comma-separated)</label>
              <Input placeholder="e.g., Marketing, Sales" value={form.weaknesses} onChange={e => setForm({ ...form, weaknesses: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="font-body text-sm font-medium text-foreground">Industries of Interest (comma-separated)</label>
              <Input placeholder="e.g., EdTech, HealthTech" value={form.industries} onChange={e => setForm({ ...form, industries: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="font-body text-sm font-medium text-foreground">Looking For (comma-separated)</label>
              <Input placeholder="e.g., Co-founder, Mentor, Investor" value={form.looking_for} onChange={e => setForm({ ...form, looking_for: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="font-body text-sm font-medium text-foreground">Your Elevator Pitch</label>
              <Textarea placeholder="Describe yourself as a founder..." value={form.pitch} onChange={e => setForm({ ...form, pitch: e.target.value })} rows={3} />
            </div>
            <Button onClick={saveProfile} className="gradient-warm text-secondary-foreground"><Save size={18} /> Save Profile</Button>
          </div>
        </TabsContent>

        {/* SKILLS TAB */}
        <TabsContent value="skills" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2"><TrendingUp size={18} className="text-accent" /> Skill Evolution</h2>
              <Button size="sm" onClick={() => callAI("skill_evolution", setSkillEvolution)} disabled={aiLoading === "skill_evolution"} className="gradient-warm text-secondary-foreground">
                {aiLoading === "skill_evolution" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Analyze Growth
              </Button>
            </div>

            {/* Current Skills */}
            {skills.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3 mb-6">
                {skills.map((skill: any, i: number) => (
                  <motion.div key={skill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 bg-muted/20 rounded-lg p-3">
                    <div className="flex-1">
                      <p className="font-body text-sm text-foreground font-medium">{skill.name}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{skill.category || "General"}</p>
                    </div>
                    <div className="w-20">
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div className="h-2 rounded-full gradient-warm" style={{ width: `${(skill.proficiency || 0) * 100}%` }} />
                      </div>
                    </div>
                    {skill.verified && <span className="text-[10px] text-primary font-body">✓</span>}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground mb-6">Add skills in SelfGraph™ to see them here.</p>
            )}

            {/* AI Skill Evolution */}
            {skillEvolution && (
              <div className="space-y-4 border-t border-border pt-4">
                {skillEvolution.skill_trajectory?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Skill Trajectory</h3>
                    <div className="space-y-2">
                      {skillEvolution.skill_trajectory.map((s: any, i: number) => (
                        <div key={i} className="bg-muted/20 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-body text-sm font-medium text-foreground">{s.skill}</p>
                            <span className="text-[10px] font-body text-primary">{s.current_level} · {s.growth_rate}</span>
                          </div>
                          {s.applied_in?.length > 0 && (
                            <p className="font-body text-[10px] text-muted-foreground mt-1">Applied in: {s.applied_in.join(", ")}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  {skillEvolution.emerging_strengths?.length > 0 && (
                    <div>
                      <h3 className="font-display text-sm text-foreground mb-2">Emerging Strengths</h3>
                      <div className="flex flex-wrap gap-2">
                        {skillEvolution.emerging_strengths.map((s: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {skillEvolution.skill_gaps?.length > 0 && (
                    <div>
                      <h3 className="font-display text-sm text-foreground mb-2">Skill Gaps</h3>
                      <div className="flex flex-wrap gap-2">
                        {skillEvolution.skill_gaps.map((s: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-body">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {skillEvolution.recommended_focus?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Recommended Focus</h3>
                    <ul className="space-y-1">
                      {skillEvolution.recommended_focus.map((s: string, i: number) => (
                        <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                          <ArrowRight size={14} className="text-primary mt-0.5 shrink-0" />{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Learning & Application History */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2"><BookOpen size={18} className="text-primary" /> Learning & Application History</h2>
            {learningProgress.length > 0 ? (
              <div className="space-y-2">
                {learningProgress.slice(0, 10).map((lp: any, i: number) => (
                  <div key={lp.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <div className={`w-2 h-2 rounded-full ${lp.status === "completed" ? "bg-primary" : "bg-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className="font-body text-sm text-foreground">{lp.content_type}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{lp.status} {lp.score ? `· Score: ${lp.score}` : ""}</p>
                    </div>
                    {lp.completed_at && <span className="font-body text-[10px] text-muted-foreground">{new Date(lp.completed_at).toLocaleDateString()}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Complete courses in the Learning Library to build your history.</p>
            )}
          </div>
        </TabsContent>

        {/* MINDSET TAB */}
        <TabsContent value="mindset" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Brain size={18} className="text-accent" /> Mindset & Behavior Insights</h2>
              <Button size="sm" onClick={() => callAI("mindset_analysis", setMindsetAnalysis)} disabled={aiLoading === "mindset_analysis"} className="gradient-warm text-secondary-foreground">
                {aiLoading === "mindset_analysis" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Analyze Mindset
              </Button>
            </div>

            {/* Habits & Challenges Summary */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2"><Heart size={14} /> Active Habits</h3>
                {habits.filter(h => h.is_active).length > 0 ? (
                  <div className="space-y-2">
                    {habits.filter(h => h.is_active).slice(0, 5).map((h: any) => (
                      <div key={h.id} className="flex items-center justify-between">
                        <p className="font-body text-sm text-foreground">{h.title}</p>
                        <span className="font-body text-[10px] text-primary">{h.streak || 0} day streak</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-xs text-muted-foreground">Build habits in Mindset Builder</p>
                )}
              </div>
              <div className="bg-muted/20 rounded-lg p-4">
                <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2"><Shield size={14} /> Challenges</h3>
                <p className="font-display text-2xl text-foreground">{completedChallenges}<span className="text-sm text-muted-foreground">/{challenges.length}</span></p>
                <p className="font-body text-[10px] text-muted-foreground">completed</p>
              </div>
            </div>

            {/* AI Mindset Analysis */}
            {mindsetAnalysis ? (
              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-display text-3xl text-foreground">{mindsetAnalysis.resilience_score}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Resilience Score</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm text-foreground mb-1"><strong>Decision Style:</strong> {mindsetAnalysis.decision_style}</p>
                    <p className="font-body text-sm text-foreground"><strong>Risk Tolerance:</strong> {mindsetAnalysis.risk_tolerance}</p>
                  </div>
                </div>
                {mindsetAnalysis.leadership_traits?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Leadership Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {mindsetAnalysis.leadership_traits.map((t: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
                {mindsetAnalysis.behavioral_patterns?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Behavioral Patterns</h3>
                    <div className="space-y-2">
                      {mindsetAnalysis.behavioral_patterns.map((bp: any, i: number) => (
                        <div key={i} className="bg-muted/20 rounded-lg p-3">
                          <p className="font-body text-sm font-medium text-foreground">{bp.pattern}</p>
                          <p className="font-body text-xs text-muted-foreground">{bp.evidence}</p>
                          <p className="font-body text-xs text-primary mt-1">Impact: {bp.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {mindsetAnalysis.areas_for_reflection?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Reflection Prompts</h3>
                    <ul className="space-y-1">
                      {mindsetAnalysis.areas_for_reflection.map((r: string, i: number) => (
                        <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                          <MessageSquare size={14} className="text-accent mt-0.5 shrink-0" />{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Click Analyze Mindset for AI-powered behavioral insights.</p>
            )}
          </div>
        </TabsContent>

        {/* JOURNEY TAB */}
        <TabsContent value="journey" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Route size={18} className="text-primary" /> Your Startup Journey</h2>
              <Button size="sm" onClick={() => callAI("journey_narrative", setJourneyNarrative)} disabled={aiLoading === "journey_narrative"} className="gradient-warm text-secondary-foreground">
                {aiLoading === "journey_narrative" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate Narrative
              </Button>
            </div>

            {/* Timeline */}
            <div className="space-y-4 mb-6">
              {[
                ...projects.map(p => ({ title: p.title, type: "Project", date: p.created_at, status: p.status })),
                ...achievements.map(a => ({ title: a.title, type: "Achievement", date: a.earned_at, status: "earned" })),
                ...ideas.map(i => ({ title: i.title, type: "Idea", date: i.created_at, status: i.is_active ? "active" : "archived" })),
                ...experiments.map(e => ({ title: e.title, type: "Experiment", date: e.created_at, status: e.status })),
                ...paths.map(p => ({ title: p.title, type: "Path", date: p.created_at, status: p.status })),
              ]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 12)
                .map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      {i < 11 && <div className="w-0.5 flex-1 bg-border" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-body text-sm text-foreground font-medium">{item.title}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{item.type} · {item.status} · {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              {projects.length === 0 && ideas.length === 0 && (
                <p className="font-body text-sm text-muted-foreground text-center py-4">Your journey timeline will appear as you explore, build, and learn.</p>
              )}
            </div>

            {/* AI Journey Narrative */}
            {journeyNarrative && (
              <div className="space-y-4 border-t border-border pt-4">
                <div className="bg-muted/20 rounded-lg p-4">
                  <h3 className="font-display text-sm text-foreground mb-2">Your Story</h3>
                  <p className="font-body text-sm text-foreground leading-relaxed">{journeyNarrative.narrative}</p>
                </div>
                {journeyNarrative.key_moments?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2">Key Moments</h3>
                    <div className="space-y-2">
                      {journeyNarrative.key_moments.map((m: any, i: number) => (
                        <div key={i} className="bg-muted/20 rounded-lg p-3">
                          <p className="font-body text-sm font-medium text-foreground">{m.title}</p>
                          <p className="font-body text-xs text-muted-foreground">{m.description}</p>
                          <p className="font-body text-xs text-primary mt-1">{m.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {journeyNarrative.themes?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {journeyNarrative.themes.map((t: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">{t}</span>
                    ))}
                  </div>
                )}
                {journeyNarrative.growth_story && (
                  <div className="bg-muted/20 rounded-lg p-4">
                    <h3 className="font-display text-sm text-foreground mb-2">Growth Story</h3>
                    <p className="font-body text-sm text-muted-foreground">{journeyNarrative.growth_story}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Milestone & Achievement Tracker */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2"><Award size={18} className="text-accent" /> Milestones & Achievements</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-display text-sm text-foreground mb-2">Achievements ({achievements.length})</h3>
                {achievements.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
                    <Star size={14} className="text-accent" />
                    <div className="flex-1">
                      <p className="font-body text-sm text-foreground">{a.title}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{a.points} pts · {new Date(a.earned_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {achievements.length === 0 && <p className="font-body text-xs text-muted-foreground">Earn achievements by completing tasks across the platform.</p>}
              </div>
              <div>
                <h3 className="font-display text-sm text-foreground mb-2">MVP Milestones ({completedMilestones}/{milestones.length})</h3>
                {milestones.slice(0, 5).map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
                    <div className={`w-2 h-2 rounded-full ${m.status === "completed" ? "bg-primary" : "bg-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className="font-body text-sm text-foreground">{m.title}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{m.status}</p>
                    </div>
                  </div>
                ))}
                {milestones.length === 0 && <p className="font-body text-xs text-muted-foreground">Create milestones in MVP Builder.</p>}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* NEXT STEPS TAB */}
        <TabsContent value="next" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground flex items-center gap-2"><ArrowRight size={18} className="text-primary" /> Personalized Next Steps</h2>
              <Button size="sm" onClick={() => callAI("next_steps", setNextSteps)} disabled={aiLoading === "next_steps"} className="gradient-warm text-secondary-foreground">
                {aiLoading === "next_steps" ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Get Recommendations
              </Button>
            </div>

            {nextSteps ? (
              <div className="space-y-6">
                {nextSteps.immediate_actions?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-3">Immediate Actions</h3>
                    <div className="space-y-2">
                      {nextSteps.immediate_actions.map((a: any, i: number) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          className="bg-muted/20 rounded-lg p-4 flex items-start gap-3">
                          <Zap size={16} className="text-accent mt-0.5 shrink-0" />
                          <div>
                            <p className="font-body text-sm font-medium text-foreground">{a.action}</p>
                            <p className="font-body text-xs text-muted-foreground">{a.reason}</p>
                            {a.feature && <span className="font-body text-[10px] text-primary">{a.feature}</span>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  {nextSteps.weekly_goals?.length > 0 && (
                    <div>
                      <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2"><Clock size={14} /> Weekly Goals</h3>
                      <ul className="space-y-1">
                        {nextSteps.weekly_goals.map((g: string, i: number) => (
                          <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                            <ChevronRight size={14} className="text-primary mt-0.5 shrink-0" />{g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {nextSteps.monthly_objectives?.length > 0 && (
                    <div>
                      <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2"><Target size={14} /> Monthly Objectives</h3>
                      <ul className="space-y-1">
                        {nextSteps.monthly_objectives.map((o: string, i: number) => (
                          <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                            <ChevronRight size={14} className="text-primary mt-0.5 shrink-0" />{o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {nextSteps.recommended_learning?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2"><BookOpen size={14} /> Recommended Learning</h3>
                    <div className="flex flex-wrap gap-2">
                      {nextSteps.recommended_learning.map((l: string, i: number) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
                {nextSteps.collaboration_suggestions?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2"><Users size={14} /> Collaboration Suggestions</h3>
                    <ul className="space-y-1">
                      {nextSteps.collaboration_suggestions.map((c: string, i: number) => (
                        <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                          <ArrowRight size={14} className="text-accent mt-0.5 shrink-0" />{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
                <h3 className="font-display text-lg text-foreground mb-2">Ready for your next move?</h3>
                <p className="font-body text-sm text-muted-foreground">Click Get Recommendations to receive personalized next steps based on your entire founder journey.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FounderProfile;
