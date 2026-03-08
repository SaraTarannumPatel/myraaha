import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Briefcase, Search, MapPin, Clock, Star, Bookmark, BookmarkCheck,
  Sparkles, Brain, Target, Users, Zap, TrendingUp, ChevronRight,
  ExternalLink, Filter, ArrowRight, CheckCircle2, AlertCircle,
  Building2, DollarSign, Lightbulb, MessageSquare, Plus, Rocket
} from "lucide-react";

const DOMAINS = ["all", "tech", "data", "design", "marketing", "business"];
const ROLE_TYPES = ["all", "internship", "full-time", "part-time", "fellowship", "freelance"];
const WORK_MODES = ["all", "remote", "hybrid", "onsite"];

const JobMatching = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [companyChallenges, setCompanyChallenges] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [savedOpps, setSavedOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [aiNudge, setAiNudge] = useState<any>(null);
  const [careerInsights, setCareerInsights] = useState<any>(null);
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [problemMatches, setProblemMatches] = useState<any[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [appPrep, setAppPrep] = useState<any>(null);
  const [coverNote, setCoverNote] = useState("");
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionContent, setReflectionContent] = useState("");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    if (!user) return;
    const [oRes, cpRes, ccRes, aRes, sRes] = await Promise.all([
      supabase.from("job_opportunities").select("*").order("is_featured", { ascending: false }).order("posted_at", { ascending: false }),
      supabase.from("career_paths").select("*").order("demand_level"),
      supabase.from("company_challenges").select("*").order("deadline"),
      supabase.from("job_applications").select("*").eq("user_id", user.id).order("applied_at", { ascending: false }),
      supabase.from("saved_opportunities").select("*").eq("user_id", user.id),
    ]);
    setOpportunities(oRes.data || []);
    setCareerPaths(cpRes.data || []);
    setCompanyChallenges(ccRes.data || []);
    setApplications(aRes.data || []);
    setSavedOpps(sRes.data || []);
    setLoading(false);
  };

  const filteredOpps = opportunities.filter(o => {
    if (domainFilter !== "all" && o.domain !== domainFilter) return false;
    if (typeFilter !== "all" && o.role_type !== typeFilter) return false;
    if (modeFilter !== "all" && o.work_mode !== modeFilter) return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.company_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const isSaved = (oppId: string) => savedOpps.some(s => s.opportunity_id === oppId);
  const isApplied = (oppId: string) => applications.some(a => a.opportunity_id === oppId);
  const isChallengeApplied = (cId: string) => applications.some(a => a.company_challenge_id === cId);

  const toggleSave = async (oppId: string) => {
    const existing = savedOpps.find(s => s.opportunity_id === oppId);
    if (existing) {
      await supabase.from("saved_opportunities").delete().eq("id", existing.id);
    } else {
      await supabase.from("saved_opportunities").insert({ user_id: user!.id, opportunity_id: oppId });
    }
    fetchAll();
  };

  const applyToJob = async (opp: any) => {
    if (isApplied(opp.id)) { toast.info("Already applied"); return; }
    const { error } = await supabase.from("job_applications").insert({
      user_id: user!.id, opportunity_id: opp.id, application_type: "job",
      cover_note: coverNote || null, fit_score: aiMatches.find(m => m.opportunity_title === opp.title)?.fit_score || null,
    });
    if (error) { toast.error("Application failed"); return; }
    setCoverNote("");
    fetchAll();
    toast.success("Application submitted!");
  };

  const applyToChallenge = async (challenge: any) => {
    if (isChallengeApplied(challenge.id)) { toast.info("Already applied"); return; }
    const { error } = await supabase.from("job_applications").insert({
      user_id: user!.id, company_challenge_id: challenge.id, application_type: "challenge",
      cover_note: coverNote || null,
    });
    if (error) { toast.error("Application failed"); return; }
    setCoverNote("");
    fetchAll();
    toast.success("Applied to challenge!");
  };

  const getSmartMatch = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("job-matching-ai", {
        body: {
          type: "smart_match",
          userData: {
            skills: ["React", "TypeScript", "Python"],
            interests: ["tech", "data"],
            opportunities: opportunities.slice(0, 8).map(o => ({ title: o.title, company: o.company_name, skills: o.required_skills, domain: o.domain, type: o.role_type })),
          },
        },
      });
      if (error) throw error;
      setAiMatches(data.matches || []);
      toast.success("AI matching complete!");
    } catch { toast.error("Matching failed"); }
    setAiLoading(false);
  };

  const exploreCareer = async (career: any) => {
    setSelectedCareer(career);
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("job-matching-ai", {
        body: {
          type: "career_exploration",
          userData: { careerTitle: career.title, domain: career.domain, currentSkills: [], interests: [] },
        },
      });
      if (error) throw error;
      setCareerInsights(data.insights || data);
    } catch { toast.error("Failed to load insights"); }
    setAiLoading(false);
  };

  const getProblemMatches = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("job-matching-ai", {
        body: {
          type: "problem_solution_match",
          userData: {
            skills: ["React", "Design", "Analytics"],
            interests: ["tech", "design"],
            challenges: companyChallenges.map(c => ({ title: c.title, company: c.company_name, skills: c.required_skills, domain: c.domain })),
          },
        },
      });
      if (error) throw error;
      setProblemMatches(data.matches || []);
    } catch { toast.error("Matching failed"); }
    setAiLoading(false);
  };

  const getAppPrep = async (opp: any) => {
    setSelectedOpp(opp);
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("job-matching-ai", {
        body: {
          type: "application_prep",
          userData: { opportunityTitle: opp.title, requiredSkills: opp.required_skills || opp.required_skills, userSkills: ["React", "TypeScript"] },
        },
      });
      if (error) throw error;
      setAppPrep(data);
    } catch { toast.error("Prep failed"); }
    setAiLoading(false);
  };

  const getNudge = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("job-matching-ai", {
        body: {
          type: "opportunity_nudge",
          userData: { activeApplications: applications.filter(a => a.status === "applied").length, isStagnant: applications.length === 0 },
        },
      });
      if (error) throw error;
      setAiNudge(data);
    } catch { toast.error("Failed"); }
    setAiLoading(false);
  };

  const saveReflection = async (appId: string) => {
    if (!reflectionContent.trim()) return;
    await supabase.from("opportunity_reflections").insert({
      user_id: user!.id, application_id: appId, content: reflectionContent,
    });
    setReflectionContent("");
    setShowReflection(false);
    toast.success("Reflection saved!");
  };

  const updateAppStatus = async (appId: string, status: string) => {
    await supabase.from("job_applications").update({ status, updated_at: new Date().toISOString() }).eq("id", appId);
    fetchAll();
  };

  const fitColor = (score: number) => score >= 80 ? "text-green-600 bg-green-50 border-green-200" : score >= 60 ? "text-yellow-600 bg-yellow-50 border-yellow-200" : "text-red-600 bg-red-50 border-red-200";

  // Detail view for opportunity
  if (selectedOpp) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setSelectedOpp(null); setAppPrep(null); }}>← Back</Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-display text-2xl text-foreground">{selectedOpp.title}</h1>
                <p className="font-body text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Building2 size={14} /> {selectedOpp.company_name}
                  <MapPin size={14} /> {selectedOpp.location}
                  <Badge variant="outline" className="text-[10px] capitalize">{selectedOpp.role_type}</Badge>
                </p>
              </div>
              <button onClick={() => toggleSave(selectedOpp.id)}>
                {isSaved(selectedOpp.id) ? <BookmarkCheck size={20} className="text-accent" /> : <Bookmark size={20} className="text-muted-foreground" />}
              </button>
            </div>
            <p className="font-body text-sm text-foreground mb-4">{selectedOpp.description}</p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1">{(selectedOpp.required_skills as string[])?.map((s: string) => <Badge key={s} className="bg-accent/10 text-accent border-accent/20 text-[10px]">{s}</Badge>)}</div>
              </div>
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Nice to Have</h4>
                <div className="flex flex-wrap gap-1">{(selectedOpp.preferred_skills as string[])?.map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-body text-muted-foreground mb-4">
              {selectedOpp.salary_range && <span><DollarSign size={12} className="inline" /> {selectedOpp.salary_range}</span>}
              {selectedOpp.duration && <span><Clock size={12} className="inline" /> {selectedOpp.duration}</span>}
              <span className="capitalize">{selectedOpp.work_mode}</span>
              <span className="capitalize">{selectedOpp.experience_level} level</span>
            </div>

            {/* Apply section */}
            {!isApplied(selectedOpp.id) ? (
              <div className="space-y-3 border-t border-border pt-4">
                <Textarea placeholder="Add a cover note (optional)" value={coverNote} onChange={e => setCoverNote(e.target.value)} rows={3} />
                <div className="flex gap-2">
                  <Button onClick={() => applyToJob(selectedOpp)} className="gradient-warm text-secondary-foreground"><Rocket size={14} /> Apply Now</Button>
                  <Button variant="outline" onClick={() => getAppPrep(selectedOpp)} disabled={aiLoading}><Brain size={14} /> AI Prep Guide</Button>
                </div>
              </div>
            ) : (
              <Badge className="bg-accent/10 text-accent">✓ Applied</Badge>
            )}
          </div>
        </motion.div>

        {/* AI Application Prep */}
        {appPrep && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/20 p-6 space-y-4">
            <h3 className="font-display text-lg text-accent">✨ AI Application Prep Guide</h3>
            {appPrep.checklist && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Application Checklist</h4>
                {appPrep.checklist.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 mb-1">
                    <CheckCircle2 size={14} className="text-accent mt-0.5" />
                    <div>
                      <p className="font-body text-sm text-foreground">{item.item}</p>
                      <p className="font-body text-xs text-muted-foreground">{item.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {appPrep.skills_to_highlight && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Skills to Highlight</h4>
                <div className="flex flex-wrap gap-1">{appPrep.skills_to_highlight.map((s: string) => <Badge key={s} className="bg-accent/10 text-accent text-[10px]">{s}</Badge>)}</div>
              </div>
            )}
            {appPrep.interview_topics && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Potential Interview Topics</h4>
                {appPrep.interview_topics.map((t: string, i: number) => <p key={i} className="font-body text-xs text-foreground">• {t}</p>)}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // Career detail view
  if (selectedCareer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setSelectedCareer(null); setCareerInsights(null); }}>← Back</Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card rounded-xl border border-border p-6">
            <span className="text-3xl mb-2 block">{selectedCareer.icon_emoji}</span>
            <h1 className="font-display text-2xl text-foreground mb-1">{selectedCareer.title}</h1>
            <p className="font-body text-sm text-muted-foreground mb-4">{selectedCareer.description}</p>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-background rounded-lg border border-border p-3">
                <p className="font-body text-xs text-muted-foreground">Salary Range</p>
                <p className="font-display text-sm text-foreground">{selectedCareer.salary_range}</p>
              </div>
              <div className="bg-background rounded-lg border border-border p-3">
                <p className="font-body text-xs text-muted-foreground">Demand</p>
                <p className="font-display text-sm text-foreground capitalize">{selectedCareer.demand_level}</p>
              </div>
              <div className="bg-background rounded-lg border border-border p-3">
                <p className="font-body text-xs text-muted-foreground">Difficulty</p>
                <p className="font-display text-sm text-foreground capitalize">{selectedCareer.difficulty}</p>
              </div>
            </div>
            <div className="mb-4">
              <h4 className="font-display text-sm text-foreground mb-2">Day to Day</h4>
              <p className="font-body text-sm text-muted-foreground">{selectedCareer.day_to_day}</p>
            </div>
            <div className="mb-4">
              <h4 className="font-display text-sm text-foreground mb-2">Growth Trajectory</h4>
              <p className="font-body text-sm text-foreground">{selectedCareer.growth_trajectory}</p>
            </div>
            <div className="mb-4">
              <h4 className="font-display text-sm text-foreground mb-2">Industry Trends</h4>
              <p className="font-body text-sm text-muted-foreground">{selectedCareer.industry_trends}</p>
            </div>
            <div className="mb-4">
              <h4 className="font-display text-sm text-foreground mb-2">Tools & Certifications</h4>
              <div className="flex flex-wrap gap-1">{(selectedCareer.tools_certifications as string[])?.map((t: string) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
            </div>
            <div>
              <h4 className="font-display text-sm text-foreground mb-2">Related Skills</h4>
              <div className="flex flex-wrap gap-1">{(selectedCareer.related_skills as string[])?.map((s: string) => <Badge key={s} className="bg-accent/10 text-accent text-[10px]">{s}</Badge>)}</div>
            </div>
          </div>
        </motion.div>

        {aiLoading && <div className="text-center py-8"><Sparkles className="animate-spin mx-auto text-accent" size={24} /><p className="font-body text-sm text-muted-foreground mt-2">Loading AI insights...</p></div>}

        {careerInsights && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/20 p-6 space-y-4">
            <h3 className="font-display text-lg text-accent">✨ AI Career Insights</h3>
            {careerInsights.overview && <p className="font-body text-sm text-foreground">{careerInsights.overview}</p>}
            {careerInsights.skills_roadmap && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Skills Roadmap</h4>
                {careerInsights.skills_roadmap.map((s: any, i: number) => (
                  <div key={i} className="mb-2 bg-background rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm text-foreground">{s.skill}</span>
                      <Badge variant="outline" className="text-[10px]">{s.importance}</Badge>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-1">{s.how_to_learn}</p>
                  </div>
                ))}
              </div>
            )}
            {careerInsights.tips && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Pro Tips</h4>
                {careerInsights.tips.map((t: string, i: number) => <p key={i} className="font-body text-xs text-foreground">💡 {t}</p>)}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Briefcase size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Job Matching & Career Explorer</h1>
            <p className="font-body text-sm text-muted-foreground">Find the right opportunities — tailored to your journey, skills, and aspirations.</p>
          </div>
        </div>
      </motion.div>

      {/* AI Nudge */}
      {aiNudge && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/5 rounded-xl border border-accent/20 p-4 flex items-center gap-3">
          <Sparkles className="text-accent shrink-0" size={20} />
          <div className="flex-1">
            <p className="font-body text-sm text-foreground">{aiNudge.nudge_message}</p>
            <p className="font-body text-xs text-accent mt-1">→ {aiNudge.action}</p>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="opportunities">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="opportunities"><Briefcase size={14} className="mr-1" /> Opportunities</TabsTrigger>
          <TabsTrigger value="careers"><TrendingUp size={14} className="mr-1" /> Career Explorer</TabsTrigger>
          <TabsTrigger value="challenges"><Zap size={14} className="mr-1" /> Company Challenges</TabsTrigger>
          <TabsTrigger value="applications"><Target size={14} className="mr-1" /> My Applications</TabsTrigger>
          <TabsTrigger value="saved"><Bookmark size={14} className="mr-1" /> Saved</TabsTrigger>
          <TabsTrigger value="ai"><Brain size={14} className="mr-1" /> AI Match</TabsTrigger>
        </TabsList>

        {/* Opportunities */}
        <TabsContent value="opportunities" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search roles, companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {DOMAINS.map(d => <button key={d} onClick={() => setDomainFilter(d)} className={`px-3 py-1 rounded-full font-body text-xs capitalize ${domainFilter === d ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>{d}</button>)}
          </div>
          <div className="flex gap-1 flex-wrap">
            {ROLE_TYPES.map(t => <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-full font-body text-xs capitalize ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>{t}</button>)}
          </div>
          <div className="flex gap-1 flex-wrap">
            {WORK_MODES.map(m => <button key={m} onClick={() => setModeFilter(m)} className={`px-3 py-1 rounded-full font-body text-xs capitalize ${modeFilter === m ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary/10"}`}>{m}</button>)}
          </div>

          <div className="grid gap-4">
            {filteredOpps.map((opp, i) => (
              <motion.div key={opp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl border border-border p-6 hover:border-accent/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display text-lg text-foreground">{opp.title}</h3>
                      {opp.is_featured && <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">Featured</Badge>}
                    </div>
                    <p className="font-body text-sm text-muted-foreground flex items-center gap-2">
                      <Building2 size={12} /> {opp.company_name}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><MapPin size={12} /> {opp.location}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{opp.role_type}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{opp.work_mode}</Badge>
                      {opp.salary_range && <span className="font-body text-xs text-muted-foreground"><DollarSign size={10} className="inline" /> {opp.salary_range}</span>}
                      {opp.duration && <span className="font-body text-xs text-muted-foreground"><Clock size={12} /> {opp.duration}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(opp.required_skills as string[])?.map((s: string) => <Badge key={s} className="bg-accent/10 text-accent border-accent/20 text-[10px]">{s}</Badge>)}
                    </div>
                  </div>
                  <button onClick={() => toggleSave(opp.id)}>
                    {isSaved(opp.id) ? <BookmarkCheck size={18} className="text-accent" /> : <Bookmark size={18} className="text-muted-foreground" />}
                  </button>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => setSelectedOpp(opp)} className="gradient-warm text-secondary-foreground text-xs">View & Apply</Button>
                  <Button size="sm" variant="outline" onClick={() => getAppPrep(opp)} disabled={aiLoading} className="text-xs"><Brain size={12} /> AI Prep</Button>
                </div>
              </motion.div>
            ))}
            {filteredOpps.length === 0 && !loading && (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Search className="mx-auto text-muted-foreground mb-3" size={32} />
                <p className="font-body text-muted-foreground">No opportunities match your filters.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Career Explorer */}
        <TabsContent value="careers" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-2">🧭 Career Explorer</h2>
            <p className="font-body text-sm text-muted-foreground">Deep-dive into career paths with real-world examples, growth trajectories, and AI-powered insights.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerPaths.map((cp, i) => (
              <motion.div key={cp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-accent/30 transition-all"
                onClick={() => exploreCareer(cp)}>
                <span className="text-2xl mb-2 block">{cp.icon_emoji}</span>
                <h3 className="font-display text-base text-foreground mb-1">{cp.title}</h3>
                <p className="font-body text-xs text-muted-foreground mb-3 line-clamp-2">{cp.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] capitalize">{cp.domain}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{cp.difficulty}</Badge>
                  <Badge className={`text-[10px] capitalize ${cp.demand_level === "very-high" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>{cp.demand_level} demand</Badge>
                </div>
                <p className="font-body text-xs text-muted-foreground">{cp.salary_range}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(cp.related_skills as string[])?.slice(0, 4).map((s: string) => <Badge key={s} className="bg-accent/10 text-accent text-[10px]">{s}</Badge>)}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Company Challenges */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-2">💼 Company-Driven Paid Challenges</h2>
            <p className="font-body text-sm text-muted-foreground mb-4">Apply your skills to real problems posted by companies, with structured compensation.</p>
            <Button onClick={getProblemMatches} disabled={aiLoading} variant="outline"><Sparkles size={14} /> Problem-Solution Matchmaker</Button>
          </div>

          {problemMatches.length > 0 && (
            <div className="bg-accent/5 rounded-xl border border-accent/20 p-5">
              <h3 className="font-display text-sm text-accent mb-3">✨ AI-Matched Challenges</h3>
              {problemMatches.map((m: any, i: number) => (
                <div key={i} className="bg-background rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm text-foreground">{m.challenge_title}</span>
                    <Badge className={`text-[10px] ${fitColor(m.match_score)}`}>{m.match_score}% match</Badge>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-1">{m.why_good_fit}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {companyChallenges.map((ch, i) => (
              <motion.div key={ch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-[10px]"><Building2 size={10} className="mr-0.5" /> {ch.company_name}</Badge>
                  <Badge className="bg-green-50 text-green-600 border-green-200 text-[10px]">{ch.compensation}</Badge>
                </div>
                <h3 className="font-display text-base text-foreground mb-1">{ch.title}</h3>
                <p className="font-body text-xs text-muted-foreground mb-2">{ch.description}</p>
                {ch.problem_statement && (
                  <div className="bg-background rounded-lg p-3 mb-3">
                    <p className="font-body text-xs text-foreground"><strong>Problem:</strong> {ch.problem_statement}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(ch.required_skills as string[])?.map((s: string) => <Badge key={s} className="bg-accent/10 text-accent text-[10px]">{s}</Badge>)}
                </div>
                <div className="flex items-center gap-3 text-xs font-body text-muted-foreground mb-3">
                  <span><Clock size={10} className="inline" /> {ch.duration}</span>
                  <span>{ch.current_applicants}/{ch.max_applicants} applied</span>
                  {ch.deadline && <span>Due: {new Date(ch.deadline).toLocaleDateString()}</span>}
                </div>
                {(ch.deliverables as string[])?.length > 0 && (
                  <div className="mb-3">
                    <p className="font-body text-xs text-muted-foreground mb-1">Deliverables:</p>
                    {(ch.deliverables as string[]).map((d: string) => <p key={d} className="font-body text-xs text-foreground">• {d}</p>)}
                  </div>
                )}
                {isChallengeApplied(ch.id) ? (
                  <Badge className="bg-accent/10 text-accent">✓ Applied</Badge>
                ) : (
                  <Button size="sm" onClick={() => applyToChallenge(ch)} className="gradient-warm text-secondary-foreground w-full"><Rocket size={14} /> Apply</Button>
                )}
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Applications */}
        <TabsContent value="applications" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-2">📋 Application Tracker</h2>
            <p className="font-body text-sm text-muted-foreground">Manage your applications, track status, and reflect on your journey.</p>
          </div>
          {applications.length > 0 ? (
            <div className="grid gap-4">
              {applications.map((app, i) => {
                const opp = opportunities.find(o => o.id === app.opportunity_id);
                const ch = companyChallenges.find(c => c.id === app.company_challenge_id);
                const title = opp?.title || ch?.title || "Unknown";
                const company = opp?.company_name || ch?.company_name || "";
                return (
                  <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display text-base text-foreground">{title}</h3>
                        <p className="font-body text-xs text-muted-foreground">{company} • {app.application_type}</p>
                      </div>
                      {app.fit_score && <Badge className={`text-[10px] ${fitColor(app.fit_score)}`}>{app.fit_score}% Fit</Badge>}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      {["applied", "reviewing", "interview", "offer", "rejected"].map((s, si) => (
                        <div key={s} className="flex items-center">
                          <button onClick={() => updateAppStatus(app.id, s)}
                            className={`px-2 py-0.5 rounded-full font-body text-[10px] capitalize transition-all ${app.status === s ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>{s}</button>
                          {si < 4 && <ArrowRight size={8} className="text-muted-foreground mx-0.5" />}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-body text-muted-foreground">
                      <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                      {app.cover_note && <span>📝 Cover note attached</span>}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => { setShowReflection(true); }} className="text-xs"><MessageSquare size={12} /> Reflect</Button>
                    </div>
                    {showReflection && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
                        <Textarea placeholder="Reflect on this application..." value={reflectionContent} onChange={e => setReflectionContent(e.target.value)} rows={2} />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveReflection(app.id)}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowReflection(false)}>Cancel</Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Target className="mx-auto text-muted-foreground mb-3" size={32} />
              <p className="font-body text-muted-foreground">No applications yet. Start exploring opportunities!</p>
            </div>
          )}
        </TabsContent>

        {/* Saved */}
        <TabsContent value="saved" className="space-y-6">
          {savedOpps.length > 0 ? (
            <div className="grid gap-4">
              {savedOpps.map((s, i) => {
                const opp = opportunities.find(o => o.id === s.opportunity_id);
                if (!opp) return null;
                return (
                  <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base text-foreground">{opp.title}</h3>
                      <p className="font-body text-xs text-muted-foreground">{opp.company_name} • {opp.location}</p>
                      <div className="flex gap-1 mt-1">{(opp.required_skills as string[])?.slice(0, 3).map((sk: string) => <Badge key={sk} variant="outline" className="text-[10px]">{sk}</Badge>)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setSelectedOpp(opp)} variant="outline" className="text-xs">View</Button>
                      <button onClick={() => toggleSave(opp.id)}><BookmarkCheck size={16} className="text-accent" /></button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Bookmark className="mx-auto text-muted-foreground mb-3" size={32} />
              <p className="font-body text-muted-foreground">No saved opportunities yet.</p>
            </div>
          )}
        </TabsContent>

        {/* AI Match */}
        <TabsContent value="ai" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <Brain className="mx-auto text-accent mb-3" size={40} />
            <h2 className="font-display text-xl text-foreground mb-2">AI Smart Match</h2>
            <p className="font-body text-sm text-muted-foreground mb-4">Get AI-powered fit scores based on your skills, interests, energy patterns, and roadmap alignment.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={getSmartMatch} disabled={aiLoading} className="gradient-warm text-secondary-foreground">
                <Sparkles size={16} /> {aiLoading ? "Matching..." : "Run Smart Match"}
              </Button>
              <Button onClick={getNudge} disabled={aiLoading} variant="outline"><Lightbulb size={16} /> Get Nudge</Button>
            </div>
          </div>

          {aiMatches.length > 0 && (
            <div>
              <h3 className="font-display text-lg text-foreground mb-3">Your AI Matches</h3>
              <div className="grid gap-4">
                {aiMatches.map((m: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-xl border border-accent/20 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-display text-base text-foreground">{m.opportunity_title}</h4>
                      <Badge className={`text-sm font-bold ${fitColor(m.fit_score)}`}>{m.fit_score}%</Badge>
                    </div>
                    {m.fit_breakdown && (
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {Object.entries(m.fit_breakdown).map(([key, val]) => (
                          <div key={key} className="text-center">
                            <Progress value={val as number} className="h-1.5 mb-1" />
                            <p className="font-body text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-2 mb-2">
                      {m.strengths && (
                        <div>
                          <p className="font-body text-xs text-green-600 mb-1">✅ Strengths</p>
                          {m.strengths.map((s: string) => <p key={s} className="font-body text-xs text-foreground">• {s}</p>)}
                        </div>
                      )}
                      {m.gaps && (
                        <div>
                          <p className="font-body text-xs text-yellow-600 mb-1">⚡ Gaps</p>
                          {m.gaps.map((g: string) => <p key={g} className="font-body text-xs text-foreground">• {g}</p>)}
                        </div>
                      )}
                    </div>
                    {m.recommendation && <p className="font-body text-xs text-accent mt-2">💡 {m.recommendation}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default JobMatching;
