import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  FileText, Plus, Briefcase, GraduationCap, Award, X, Sparkles,
  Download, Share2, Target, TrendingUp, Brain, Users, BookOpen,
  CheckCircle2, Clock, Star, Lightbulb, ArrowRight, Eye, RefreshCw,
  MessageSquare, Heart, Shield, Copy, ExternalLink
} from "lucide-react";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";

const LivingResume = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Data
  const [experiences, setExperiences] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [decisionActions, setDecisionActions] = useState<any[]>([]);
  const [domainAffinity, setDomainAffinity] = useState<any[]>([]);
  const [identityEvals, setIdentityEvals] = useState<any[]>([]);
  const [clarityScores, setClarityScores] = useState<any[]>([]);
  const [challengeEnrollments, setChallengeEnrollments] = useState<any[]>([]);

  // AI
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [eligibleOpportunities, setEligibleOpportunities] = useState<any[]>([]);
  const [decisionMirror, setDecisionMirror] = useState<any>(null);
  const [skillFitResults, setSkillFitResults] = useState<any>(null);

  // Forms
  const [showAddExp, setShowAddExp] = useState(false);
  const [expForm, setExpForm] = useState({ title: "", organization: "", experience_type: "work", description: "", is_current: false });
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSettings, setShareSettings] = useState({ skills: true, experiences: true, achievements: true, reflections: false, mood: false });
  const [contextualNote, setContextualNote] = useState("");
  const [noteTarget, setNoteTarget] = useState<{ type: string; id: string } | null>(null);

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [expRes, achRes, journalRes, progressRes, interestRes, connRes, decisionRes, domainRes, evalRes, clarityRes, challengeRes] = await Promise.all([
        supabase.from("experiences").select("*").eq("user_id", user!.id).order("start_date", { ascending: false }),
        supabase.from("achievements").select("*").eq("user_id", user!.id).order("earned_at", { ascending: false }),
        supabase.from("journal_entries").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("learning_track_progress").select("*, mindset_learning_tracks:track_id(title, category)").eq("user_id", user!.id),
        supabase.from("interests").select("*").eq("user_id", user!.id),
        supabase.from("connections").select("*").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq("status", "accepted"),
        supabase.from("decision_actions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("domain_affinity").select("*").eq("user_id", user!.id).order("affinity_score", { ascending: false }),
        supabase.from("identity_evaluations").select("*").eq("user_id", user!.id).order("evaluated_at", { ascending: false }).limit(5),
        supabase.from("clarity_scores").select("*").eq("user_id", user!.id).order("recorded_at", { ascending: false }).limit(5),
        supabase.from("challenge_enrollments").select("*, project_challenges(title, description)").eq("user_id", user!.id),
      ]);

      setExperiences(expRes.data || []);
      setAchievements(achRes.data || []);
      setJournalEntries(journalRes.data || []);
      setLearningProgress(progressRes.data || []);
      setInterests(interestRes.data || []);
      setConnections(connRes.data || []);
      setDecisionActions(decisionRes.data || []);
      setDomainAffinity(domainRes.data || []);
      setIdentityEvals(evalRes.data || []);
      setClarityScores(clarityRes.data || []);
      setChallengeEnrollments(challengeRes.data || []);
    } catch (error) {
      console.error("Error fetching resume data:", error);
    }
    setLoading(false);
  };

  const invokeAI = async (type: string, data: any) => {
    const { data: result, error } = await supabase.functions.invoke("living-resume-ai", { body: { type, data } });
    if (error) throw error;
    return result?.data || result;
  };

  const generateAIInsights = async () => {
    setAiLoading("insights");
    try {
      const data = await invokeAI("generate_insights", {
        profile, skills: interests.map(i => ({ name: i.name, category: i.category, strength: i.strength })),
        experiences, achievements, learningProgress,
        journalEntries: journalEntries.slice(0, 5),
      });
      setAiInsights(data);
      toast.success("AI insights generated!");
    } catch { toast.error("Failed to generate insights"); }
    setAiLoading(null);
  };

  const generateSkillFit = async () => {
    setAiLoading("fit");
    try {
      const data = await invokeAI("skill_fit_analysis", {
        skills: interests.map(i => ({ name: i.name, category: i.category })),
        experiences, interests,
        goals: profile?.short_term_goals,
      });
      setSkillFitResults(data);
      toast.success("Skill fit analysis complete!");
    } catch { toast.error("Failed to analyze skill fit"); }
    setAiLoading(null);
  };

  const generateDecisionMirror = async () => {
    setAiLoading("mirror");
    try {
      const data = await invokeAI("decision_mirror", {
        actions: decisionActions, experiences,
        skills: interests.map(i => i.name),
        moodPatterns: journalEntries.map(j => ({ mood: j.mood, date: j.created_at })),
      });
      setDecisionMirror(data);
      toast.success("Decision mirror generated!");
    } catch { toast.error("Failed to generate decision mirror"); }
    setAiLoading(null);
  };

  const findOpportunities = async () => {
    setAiLoading("opps");
    try {
      const data = await invokeAI("eligible_opportunities", {
        skills: interests.map(i => ({ name: i.name, category: i.category })),
        interests, domains: domainAffinity.map(d => d.domain_name),
      });
      setEligibleOpportunities(data?.opportunities || []);
      toast.success("Found eligible opportunities!");
    } catch { toast.error("Failed to find opportunities"); }
    setAiLoading(null);
  };

  const addExperience = async () => {
    if (!expForm.title.trim()) return;
    const { error } = await supabase.from("experiences").insert({ user_id: user!.id, ...expForm });
    if (error) { toast.error("Failed to add experience"); return; }
    setExpForm({ title: "", organization: "", experience_type: "work", description: "", is_current: false });
    setShowAddExp(false);
    fetchAll();
    toast.success("Experience added!");
  };

  const saveContextualNote = async () => {
    if (!user || !contextualNote.trim()) return;
    await supabase.from("journal_entries").insert({
      user_id: user.id,
      content: contextualNote,
      title: `Note: ${noteTarget?.type || "Resume"}`,
      tags: ["resume-note", noteTarget?.type || "general"],
    });
    toast.success("Note saved to journal");
    setContextualNote("");
    setNoteTarget(null);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "work": return <Briefcase size={16} className="text-primary" />;
      case "education": return <GraduationCap size={16} className="text-primary" />;
      default: return <Award size={16} className="text-primary" />;
    }
  };

  const completionScore = (() => {
    let s = 0;
    if (profile?.full_name) s += 10;
    if (profile?.bio) s += 10;
    if (experiences.length > 0) s += 20;
    if (interests.length > 0) s += 20;
    if (achievements.length > 0) s += 10;
    if (learningProgress.length > 0) s += 15;
    if (challengeEnrollments.length > 0) s += 15;
    return Math.min(100, s);
  })();

  // Build activity timeline
  const activityTimeline = [
    ...experiences.map(e => ({ ...e, _type: "experience", _date: e.created_at })),
    ...achievements.map(a => ({ ...a, _type: "achievement", _date: a.earned_at })),
    ...decisionActions.slice(0, 5).map(d => ({ ...d, _type: "decision", _date: d.created_at })),
    ...challengeEnrollments.filter(c => c.completed_at).map(c => ({ ...c, _type: "challenge", _date: c.completed_at })),
  ].sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime()).slice(0, 10);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Living Resume</h1>
              <p className="font-body text-sm text-muted-foreground">Your evolving story — built from everything you've explored, learned, and accomplished</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { toast.info("PDF export coming soon!"); }}>
              <Download size={16} className="mr-1" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)}>
              <Share2 size={16} className="mr-1" /> Share
            </Button>
          </div>
        </div>
        <ModuleSearchBar
          placeholder="Search experiences, skills, achievements..."
          sources={["skills", "careers", "domains"]}
          compact
          showAiBadge
          onSelect={(item) => {
            toast.info(`"${item.title}" — Add this to your resume`);
          }}
        />
      </motion.div>

      {/* Profile Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display text-3xl">
              {profile?.full_name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="font-display text-2xl text-foreground">{profile?.full_name || "Your Name"}</h2>
              <p className="font-body text-muted-foreground mt-1">{profile?.bio || "Add a bio to tell your story"}</p>
              <div className="flex flex-wrap gap-4 mt-4 font-body text-sm">
                {[
                  { icon: Briefcase, label: `${experiences.length} experiences` },
                  { icon: Target, label: `${interests.length} interests` },
                  { icon: Award, label: `${achievements.length} achievements` },
                  { icon: BookOpen, label: `${learningProgress.length} tracks` },
                  { icon: Users, label: `${connections.length} connections` },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <s.icon size={14} /><span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl text-primary">{completionScore}%</div>
              <p className="font-body text-xs text-muted-foreground">Profile Complete</p>
              <Progress value={completionScore} className="w-32 mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
          <TabsTrigger value="overview" className="font-body text-sm">Overview</TabsTrigger>
          <TabsTrigger value="experience" className="font-body text-sm">Experience</TabsTrigger>
          <TabsTrigger value="learning" className="font-body text-sm">Learning</TabsTrigger>
          <TabsTrigger value="reflections" className="font-body text-sm">Reflections</TabsTrigger>
          <TabsTrigger value="eligible" className="font-body text-sm">Eligible For</TabsTrigger>
          <TabsTrigger value="mirror" className="font-body text-sm">Decision Mirror</TabsTrigger>
          <TabsTrigger value="insights" className="font-body text-sm">AI Insights</TabsTrigger>
        </TabsList>

        {/* ===== OVERVIEW ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Career Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-display text-primary">{aiInsights?.career_readiness_score || completionScore}%</div>
                <p className="font-body text-sm text-muted-foreground mt-1">Based on skills, experiences, and learning</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg flex items-center gap-2"><Star size={18} className="text-primary" /> Top Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(aiInsights?.key_strengths || interests.slice(0, 3).map(i => i.name)).map((s: string, i: number) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-primary/10 text-primary font-body text-xs">{s}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg flex items-center gap-2"><Lightbulb size={18} className="text-primary" /> Growth Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(aiInsights?.growth_areas || ["Leadership", "Communication"]).map((a: string, i: number) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-muted text-muted-foreground font-body text-xs">{a}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Domain Affinity */}
          {domainAffinity.length > 0 && (
            <Card className="border-border">
              <CardHeader><CardTitle className="font-display text-lg">Domain Strengths</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {domainAffinity.slice(0, 5).map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="font-body text-sm text-foreground w-32 truncate">{d.domain_name}</span>
                      <Progress value={d.affinity_score} className="flex-1 h-2" />
                      <span className="font-body text-xs text-muted-foreground w-10 text-right">{d.affinity_score}%</span>
                      {d.trend === "rising" && <TrendingUp size={14} className="text-green-500" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card className="border-border">
            <CardHeader><CardTitle className="font-display text-lg">Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              {activityTimeline.length > 0 ? (
                <div className="space-y-3">
                  {activityTimeline.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {item._type === "experience" ? typeIcon(item.experience_type) :
                         item._type === "achievement" ? <Award size={14} className="text-primary" /> :
                         item._type === "challenge" ? <Target size={14} className="text-primary" /> :
                         <ArrowRight size={14} className="text-primary" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-body text-sm text-foreground">{item.title || item.action_title}</p>
                        <p className="font-body text-xs text-muted-foreground">{item.organization || item.achievement_type || item.action_type || ""}</p>
                      </div>
                      <span className="font-body text-xs text-muted-foreground">{new Date(item._date).toLocaleDateString()}</span>
                      <button onClick={() => setNoteTarget({ type: item._type, id: item.id })} className="text-muted-foreground hover:text-foreground">
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-muted-foreground text-center py-6">Start exploring to build your timeline</p>
              )}
            </CardContent>
          </Card>

          {/* Contextual Note */}
          <AnimatePresence>
            {noteTarget && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                <Card className="border-primary/30">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm text-foreground">Add a note to this {noteTarget.type}</p>
                      <button onClick={() => setNoteTarget(null)}><X size={16} className="text-muted-foreground" /></button>
                    </div>
                    <Textarea placeholder="What did you learn? How did this shape your journey?" value={contextualNote} onChange={e => setContextualNote(e.target.value)} rows={3} />
                    <Button onClick={saveContextualNote} size="sm" disabled={!contextualNote.trim()}>Save Note</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ===== EXPERIENCE ===== */}
        <TabsContent value="experience" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl text-foreground">Experience & Projects</h3>
            <Button onClick={() => setShowAddExp(!showAddExp)} variant="outline" size="sm"><Plus size={16} className="mr-1" /> Add</Button>
          </div>

          {showAddExp && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-muted/50 rounded-lg space-y-3">
              <select value={expForm.experience_type} onChange={e => setExpForm({ ...expForm, experience_type: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
                <option value="work">Work</option>
                <option value="education">Education</option>
                <option value="volunteer">Volunteer</option>
                <option value="project">Project</option>
              </select>
              <Input placeholder="Title / Role" value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })} />
              <Input placeholder="Organization" value={expForm.organization} onChange={e => setExpForm({ ...expForm, organization: e.target.value })} />
              <Textarea placeholder="Description" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} rows={3} />
              <div className="flex gap-2">
                <Button onClick={addExperience} size="sm">Save</Button>
                <Button onClick={() => setShowAddExp(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </motion.div>
          )}

          {experiences.length > 0 && (
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">{typeIcon(exp.experience_type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-body font-medium text-foreground">{exp.title}</h4>
                      {exp.is_current && <Badge variant="secondary" className="text-[10px]">Current</Badge>}
                    </div>
                    <p className="font-body text-sm text-muted-foreground">{exp.organization}</p>
                    {exp.description && <p className="font-body text-sm text-muted-foreground mt-2">{exp.description}</p>}
                    {exp.skills_used?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {exp.skills_used.map((s: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Challenges */}
          {challengeEnrollments.length > 0 && (
            <div>
              <h3 className="font-display text-lg text-foreground mt-6 mb-3">Challenges & Projects</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {challengeEnrollments.map(c => (
                  <div key={c.id} className="p-4 rounded-lg bg-card border border-border">
                    <h4 className="font-body font-medium text-foreground">{c.project_challenges?.title || "Challenge"}</h4>
                    <p className="font-body text-xs text-muted-foreground mt-1">{c.project_challenges?.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant={c.status === "completed" ? "default" : "secondary"} className="text-[10px]">{c.status}</Badge>
                      {c.points_earned && <span className="font-body text-xs text-primary">{c.points_earned} pts</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {experiences.length === 0 && challengeEnrollments.length === 0 && (
            <div className="text-center py-12"><Briefcase size={48} className="mx-auto text-muted-foreground mb-4" /><p className="font-body text-muted-foreground">No experiences yet</p></div>
          )}
        </TabsContent>

        {/* ===== LEARNING ===== */}
        <TabsContent value="learning" className="space-y-4">
          <h3 className="font-display text-xl text-foreground">Learning Progress</h3>
          {learningProgress.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learningProgress.map(p => (
                <Card key={p.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-body font-medium text-foreground">{p.mindset_learning_tracks?.title || "Track"}</h4>
                        <p className="font-body text-xs text-muted-foreground">{p.mindset_learning_tracks?.category}</p>
                      </div>
                      {p.status === "completed" ? <CheckCircle2 size={20} className="text-green-500" /> : <Clock size={20} className="text-primary" />}
                    </div>
                    <Progress value={(p.current_module || 0) * 20} className="mt-3 h-2" />
                    <p className="font-body text-xs text-muted-foreground mt-2">Module {p.current_module || 0}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12"><BookOpen size={48} className="mx-auto text-muted-foreground mb-4" /><p className="font-body text-muted-foreground">No learning progress yet</p></div>
          )}

          {achievements.length > 0 && (
            <div>
              <h3 className="font-display text-lg text-foreground mt-6 mb-3">Achievements & Badges</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map(a => (
                  <div key={a.id} className="text-center p-4 rounded-lg bg-card border border-border">
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center"><Award size={24} className="text-primary" /></div>
                    <h4 className="font-body font-medium text-foreground mt-2 text-sm">{a.title}</h4>
                    <p className="font-body text-xs text-muted-foreground">{a.points} pts</p>
                    <p className="font-body text-[10px] text-muted-foreground">{new Date(a.earned_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ===== REFLECTIONS ===== */}
        <TabsContent value="reflections" className="space-y-4">
          <h3 className="font-display text-xl text-foreground">Mood & Reflection Snapshots</h3>

          {/* Clarity Score Trend */}
          {clarityScores.length > 0 && (
            <Card className="border-border">
              <CardHeader><CardTitle className="font-display text-lg">Clarity Score Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-24">
                  {clarityScores.slice().reverse().map((c, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-primary/20 rounded-t" style={{ height: `${c.overall_clarity}%` }}>
                        <div className="w-full bg-primary rounded-t h-full" />
                      </div>
                      <span className="font-body text-[10px] text-muted-foreground">{c.overall_clarity}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Identity Evaluations */}
          {identityEvals.length > 0 && (
            <Card className="border-border">
              <CardHeader><CardTitle className="font-display text-lg">Identity Insights</CardTitle></CardHeader>
              <CardContent>
                {identityEvals.slice(0, 1).map(ev => (
                  <div key={ev.id} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Creativity", val: ev.creativity_score },
                      { label: "Leadership", val: ev.leadership_score },
                      { label: "Resilience", val: ev.resilience_score },
                      { label: "Adaptability", val: ev.adaptability_score },
                      { label: "Problem Solving", val: ev.problem_solving_score },
                      { label: "Collaboration", val: ev.collaboration_score },
                      { label: "Confidence", val: ev.confidence_score },
                      { label: "Emotional IQ", val: ev.emotional_intelligence_score },
                    ].filter(x => x.val != null).map((x, i) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30 text-center">
                        <p className="font-body text-xs text-muted-foreground">{x.label}</p>
                        <p className="font-display text-xl text-foreground">{x.val}</p>
                        <Progress value={x.val || 0} className="h-1 mt-1" />
                      </div>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Journal Highlights */}
          <Card className="border-border">
            <CardHeader><CardTitle className="font-display text-lg">Journal Highlights</CardTitle></CardHeader>
            <CardContent>
              {journalEntries.length > 0 ? (
                <div className="space-y-3">
                  {journalEntries.slice(0, 8).map(j => (
                    <div key={j.id} className="p-3 rounded-lg bg-muted/30 flex items-start gap-3">
                      {j.mood && <span className="text-lg">{j.mood === "happy" ? "😊" : j.mood === "excited" ? "🤩" : j.mood === "calm" ? "😌" : j.mood === "anxious" ? "😰" : j.mood === "sad" ? "😔" : "💭"}</span>}
                      <div className="flex-1">
                        {j.title && <p className="font-body text-sm font-medium text-foreground">{j.title}</p>}
                        <p className="font-body text-xs text-muted-foreground line-clamp-2">{j.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-body text-[10px] text-muted-foreground">{new Date(j.created_at).toLocaleDateString()}</span>
                          {j.tags?.map((t: string, i: number) => <Badge key={i} variant="outline" className="text-[8px]">{t}</Badge>)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-muted-foreground text-center py-6">No journal entries yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== ELIGIBLE FOR ===== */}
        <TabsContent value="eligible" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-foreground">Currently Eligible For</h3>
              <p className="font-body text-sm text-muted-foreground">Roles and opportunities matching your profile</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={findOpportunities} disabled={aiLoading === "opps"} variant="outline" size="sm">
                {aiLoading === "opps" ? <RefreshCw size={16} className="animate-spin mr-1" /> : <Sparkles size={16} className="mr-1" />} Find Opportunities
              </Button>
              <Button onClick={generateSkillFit} disabled={aiLoading === "fit"} variant="outline" size="sm">
                {aiLoading === "fit" ? <RefreshCw size={16} className="animate-spin mr-1" /> : <Target size={16} className="mr-1" />} Analyze Fit
              </Button>
            </div>
          </div>

          {eligibleOpportunities.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {eligibleOpportunities.map((opp, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="secondary" className="text-[10px] capitalize mb-2">{opp.type}</Badge>
                        <h4 className="font-body font-medium text-foreground">{opp.title}</h4>
                        <p className="font-body text-sm text-muted-foreground mt-1">{opp.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl text-primary">{opp.match_percentage}%</div>
                        <p className="font-body text-xs text-muted-foreground">match</p>
                      </div>
                    </div>
                    {opp.user_has_skills?.length > 0 && (
                      <div className="mt-3">
                        <p className="font-body text-xs text-muted-foreground">Skills you have:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {opp.user_has_skills.map((s: string, j: number) => <Badge key={j} variant="outline" className="text-[10px] border-green-500/30 text-green-600">{s}</Badge>)}
                        </div>
                      </div>
                    )}
                    {opp.next_steps?.length > 0 && (
                      <div className="mt-2">
                        <p className="font-body text-xs text-muted-foreground">Next steps:</p>
                        {opp.next_steps.slice(0, 2).map((s: string, j: number) => (
                          <p key={j} className="font-body text-xs text-foreground">→ {s}</p>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Skill Fit */}
          {skillFitResults?.analyses?.length > 0 && (
            <Card className="border-border">
              <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Target size={18} className="text-primary" /> Skill vs Fit Analyzer</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillFitResults.analyses.slice(0, 6).map((a: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-body text-sm text-foreground">{a.role_name}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">{a.role_type}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-body text-sm text-primary">{a.match_score}%</span>
                          {a.is_eligible && <CheckCircle2 size={16} className="text-green-500" />}
                        </div>
                      </div>
                      <Progress value={a.match_score} className="h-2" />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {a.skills_matched?.map((s: string, j: number) => <Badge key={j} variant="outline" className="text-[8px] border-green-500/30">{s}</Badge>)}
                        {a.skills_missing?.map((s: string, j: number) => <Badge key={j} variant="outline" className="text-[8px] border-red-500/30 text-red-500">{s}</Badge>)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {eligibleOpportunities.length === 0 && !skillFitResults && (
            <div className="text-center py-12"><Target size={48} className="mx-auto text-muted-foreground mb-4" /><p className="font-body text-muted-foreground">Click above to discover opportunities</p></div>
          )}
        </TabsContent>

        {/* ===== DECISION MIRROR ===== */}
        <TabsContent value="mirror" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-foreground">Decision Mirror</h3>
              <p className="font-body text-sm text-muted-foreground">See how past decisions shaped your journey</p>
            </div>
            <Button onClick={generateDecisionMirror} disabled={aiLoading === "mirror"} variant="outline" size="sm">
              {aiLoading === "mirror" ? <RefreshCw size={16} className="animate-spin mr-1" /> : <Eye size={16} className="mr-1" />} Generate Mirror
            </Button>
          </div>

          {decisionMirror ? (
            <div className="space-y-4">
              <Card className="border-border"><CardContent className="p-6">
                <h4 className="font-display text-lg text-foreground mb-2">Your Journey Narrative</h4>
                <p className="font-body text-muted-foreground whitespace-pre-wrap">{decisionMirror.journey_narrative}</p>
                {decisionMirror.confidence_score && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="font-body text-sm text-muted-foreground">Direction Confidence:</span>
                    <Progress value={decisionMirror.confidence_score} className="flex-1 h-2" />
                    <span className="font-body text-sm text-primary">{decisionMirror.confidence_score}%</span>
                  </div>
                )}
              </CardContent></Card>

              {decisionMirror.pivotal_moments?.length > 0 && (
                <Card className="border-border"><CardHeader><CardTitle className="font-display text-lg">Pivotal Moments</CardTitle></CardHeader>
                  <CardContent><div className="space-y-3">
                    {decisionMirror.pivotal_moments.map((m: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"><Star size={14} className="text-primary" /></div>
                        <div><p className="font-body text-sm text-foreground">{m.action}</p><p className="font-body text-xs text-muted-foreground mt-1">{m.impact}</p></div>
                      </div>
                    ))}
                  </div></CardContent>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-border"><CardHeader><CardTitle className="font-display text-lg">Patterns</CardTitle></CardHeader>
                  <CardContent><div className="space-y-2">
                    {decisionMirror.patterns_identified?.map((p: string, i: number) => (
                      <div key={i} className="flex items-center gap-2"><Brain size={14} className="text-primary" /><span className="font-body text-sm text-muted-foreground">{p}</span></div>
                    ))}
                  </div></CardContent>
                </Card>
                <Card className="border-border"><CardHeader><CardTitle className="font-display text-lg">Suggested Adjustments</CardTitle></CardHeader>
                  <CardContent><div className="space-y-2">
                    {decisionMirror.suggested_adjustments?.map((a: string, i: number) => (
                      <div key={i} className="flex items-center gap-2"><Lightbulb size={14} className="text-primary" /><span className="font-body text-sm text-muted-foreground">{a}</span></div>
                    ))}
                  </div></CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12"><Eye size={48} className="mx-auto text-muted-foreground mb-4" /><p className="font-body text-muted-foreground">Click above to generate your decision mirror</p></div>
          )}
        </TabsContent>

        {/* ===== AI INSIGHTS ===== */}
        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-foreground">AI Insights Panel</h3>
              <p className="font-body text-sm text-muted-foreground">Personalized suggestions based on your profile</p>
            </div>
            <Button onClick={generateAIInsights} disabled={aiLoading === "insights"} variant="outline" size="sm">
              {aiLoading === "insights" ? <RefreshCw size={16} className="animate-spin mr-1" /> : <Sparkles size={16} className="mr-1" />} Generate Insights
            </Button>
          </div>

          {aiInsights ? (
            <div className="space-y-4">
              <Card className="border-border bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="p-6">
                  <h4 className="font-display text-lg text-foreground mb-2">Profile Summary</h4>
                  <p className="font-body text-muted-foreground">{aiInsights.profile_summary}</p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-border"><CardHeader><CardTitle className="font-display text-lg text-green-600">Key Strengths</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">
                    {aiInsights.key_strengths?.map((s: string, i: number) => <span key={i} className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 font-body text-sm">{s}</span>)}
                  </div></CardContent>
                </Card>
                <Card className="border-border"><CardHeader><CardTitle className="font-display text-lg text-orange-600">Skill Gaps</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">
                    {aiInsights.skill_gaps?.map((g: string, i: number) => <span key={i} className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 font-body text-sm">{g}</span>)}
                  </div></CardContent>
                </Card>
              </div>

              <Card className="border-border"><CardHeader><CardTitle className="font-display text-lg">Recommended Next Steps</CardTitle></CardHeader>
                <CardContent><div className="space-y-3">
                  {aiInsights.recommended_next_steps?.map((step: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <Badge variant={step.priority === "high" ? "destructive" : step.priority === "medium" ? "default" : "secondary"} className="text-[10px]">{step.priority}</Badge>
                      <div className="flex-1">
                        <p className="font-body text-sm text-foreground">{step.action}</p>
                        <p className="font-body text-xs text-muted-foreground mt-1">{step.impact}</p>
                      </div>
                    </div>
                  ))}
                </div></CardContent>
              </Card>

              {aiInsights.personalized_nudges?.length > 0 && (
                <Card className="border-border"><CardHeader><CardTitle className="font-display text-lg">Personalized Nudges</CardTitle></CardHeader>
                  <CardContent><div className="space-y-2">
                    {aiInsights.personalized_nudges.map((n: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <Lightbulb size={16} className="text-primary mt-0.5 flex-shrink-0" />
                        <p className="font-body text-sm text-foreground">{n}</p>
                      </div>
                    ))}
                  </div></CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12"><Sparkles size={48} className="mx-auto text-muted-foreground mb-4" /><p className="font-body text-muted-foreground">Click above to generate AI insights</p></div>
          )}
        </TabsContent>
      </Tabs>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Shield size={20} className="text-primary" /> Sharing Controls</h2>
                <button onClick={() => setShowShareModal(false)}><X size={20} className="text-muted-foreground" /></button>
              </div>
              <p className="font-body text-sm text-muted-foreground mb-4">Choose what to share with mentors or recruiters. Your data stays private by default.</p>
              <div className="space-y-4">
                {[
                  { key: "skills", label: "Interests & Skills", desc: "Your explored domains and strengths" },
                  { key: "experiences", label: "Experiences & Projects", desc: "Work history and challenge completions" },
                  { key: "achievements", label: "Achievements & Badges", desc: "Milestones and certifications" },
                  { key: "reflections", label: "Reflections & Journal", desc: "Your written reflections and notes" },
                  { key: "mood", label: "Mood & Energy Data", desc: "Emotional patterns and clarity scores" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-body text-sm text-foreground">{item.label}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch checked={(shareSettings as any)[item.key]} onCheckedChange={v => setShareSettings({ ...shareSettings, [item.key]: v })} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-6">
                <Button className="flex-1 gap-2" onClick={() => { toast.success("Share link copied!"); setShowShareModal(false); }}>
                  <Copy size={14} /> Copy Share Link
                </Button>
                <Button variant="outline" onClick={() => setShowShareModal(false)}>Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LivingResume;
