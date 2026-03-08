import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Building2, DollarSign, Lightbulb, MessageSquare, Plus, Rocket,
  Bell, BellOff, GraduationCap, UserCheck, Calendar, BarChart3,
  Heart, RefreshCw, X, ChevronDown, ChevronUp
} from "lucide-react";
import { Link } from "react-router-dom";

const DOMAINS = ["all", "tech", "data", "design", "marketing", "business"];
const ROLE_TYPES = ["all", "internship", "full-time", "part-time", "fellowship", "freelance"];
const WORK_MODES = ["all", "remote", "hybrid", "onsite"];
const EXP_LEVELS = ["all", "entry", "mid", "senior"];

interface UserContext {
  skills: string[];
  interests: string[];
  mood: string;
  energyPatterns: string;
  experienceLevel: string;
  completedProjects: number;
  learningHistory: string[];
  growingSkills: string[];
}

const JobMatching = () => {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [careerPaths, setCareerPaths] = useState<any[]>([]);
  const [companyChallenges, setCompanyChallenges] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [savedOpps, setSavedOpps] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [expFilter, setExpFilter] = useState("all");

  // AI state
  const [aiMatches, setAiMatches] = useState<any[]>([]);
  const [aiNudge, setAiNudge] = useState<any>(null);
  const [careerInsights, setCareerInsights] = useState<any>(null);
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [problemMatches, setProblemMatches] = useState<any[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [appPrep, setAppPrep] = useState<any>(null);
  const [coverNote, setCoverNote] = useState("");
  const [reflectionPrompts, setReflectionPrompts] = useState<any>(null);
  const [reflectionContent, setReflectionContent] = useState("");
  const [reflectionMood, setReflectionMood] = useState("");
  const [reflectionSkills, setReflectionSkills] = useState("");
  const [reflectionNextSteps, setReflectionNextSteps] = useState("");
  const [activeReflectionAppId, setActiveReflectionAppId] = useState<string | null>(null);

  // User context for AI
  const [userContext, setUserContext] = useState<UserContext>({
    skills: [], interests: [], mood: "neutral", energyPatterns: "balanced",
    experienceLevel: "entry", completedProjects: 0, learningHistory: [], growingSkills: [],
  });

  // Related data for opportunity details
  const [relatedLearning, setRelatedLearning] = useState<any[]>([]);
  const [relatedMentors, setRelatedMentors] = useState<any[]>([]);

  useEffect(() => { if (user) { fetchAll(); fetchUserContext(); } }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    const [oRes, cpRes, ccRes, aRes, sRes, rRes, refRes] = await Promise.all([
      supabase.from("job_opportunities").select("*").eq("is_active", true).order("is_featured", { ascending: false }).order("posted_at", { ascending: false }),
      supabase.from("career_paths").select("*").order("demand_level"),
      supabase.from("company_challenges").select("*").eq("status", "open").order("deadline"),
      supabase.from("job_applications").select("*").eq("user_id", user.id).order("applied_at", { ascending: false }),
      supabase.from("saved_opportunities").select("*").eq("user_id", user.id),
      supabase.from("opportunity_reminders" as any).select("*").eq("user_id", user.id).eq("is_dismissed", false).order("reminder_date"),
      supabase.from("opportunity_reflections").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setOpportunities(oRes.data || []);
    setCareerPaths(cpRes.data || []);
    setCompanyChallenges(ccRes.data || []);
    setApplications(aRes.data || []);
    setSavedOpps(sRes.data || []);
    setReminders((rRes.data || []) as any[]);
    setReflections(refRes.data || []);
    setLoading(false);
  };

  const fetchUserContext = async () => {
    if (!user) return;
    const [skillsRes, interestsRes, moodRes, energyRes, projectsRes, learningRes] = await Promise.all([
      supabase.from("skills" as any).select("name, proficiency_level").eq("user_id", user.id),
      supabase.from("interests").select("name, category").eq("user_id", user.id),
      supabase.from("coaching_checkins").select("mood, energy, confidence").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
      supabase.from("energy_zones").select("domain, energy_level").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(5),
      supabase.from("challenge_enrollments").select("id").eq("user_id", user.id).eq("status", "completed"),
      supabase.from("learning_track_progress" as any).select("track_id, status").eq("user_id", user.id),
    ]);

    const skills = ((skillsRes.data || []) as any[]).map((s: any) => s.name);
    const interests = ((interestsRes.data || []) as any[]).map((i: any) => i.name);
    const latestMood = (moodRes.data as any[])?.[0];
    const energyData = (energyRes.data || []) as any[];
    const avgEnergy = energyData.length > 0 ? energyData.reduce((a: number, e: any) => a + e.energy_level, 0) / energyData.length : 5;

    setUserContext({
      skills: skills.length > 0 ? skills : profile?.areas_of_focus || [],
      interests: interests.length > 0 ? interests : [],
      mood: latestMood?.mood || "neutral",
      energyPatterns: avgEnergy > 7 ? "high-energy" : avgEnergy > 4 ? "balanced" : "low-energy",
      experienceLevel: profile?.career_stage || "entry",
      completedProjects: (projectsRes.data || []).length,
      learningHistory: ((learningRes.data || []) as any[]).filter((l: any) => l.status === "completed").map((l: any) => l.track_id),
      growingSkills: skills.slice(0, 5),
    });
  };

  // Filters
  const filteredOpps = opportunities.filter(o => {
    if (domainFilter !== "all" && o.domain !== domainFilter) return false;
    if (typeFilter !== "all" && o.role_type !== typeFilter) return false;
    if (modeFilter !== "all" && o.work_mode !== modeFilter) return false;
    if (expFilter !== "all" && o.experience_level !== expFilter) return false;
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.company_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const isSaved = (oppId: string) => savedOpps.some(s => s.opportunity_id === oppId);
  const isApplied = (oppId: string) => applications.some(a => a.opportunity_id === oppId);
  const isChallengeApplied = (cId: string) => applications.some(a => a.company_challenge_id === cId);
  const hasReminder = (oppId: string) => reminders.some((r: any) => r.opportunity_id === oppId);

  const toggleSave = async (oppId: string) => {
    const existing = savedOpps.find(s => s.opportunity_id === oppId);
    if (existing) {
      await supabase.from("saved_opportunities").delete().eq("id", existing.id);
    } else {
      await supabase.from("saved_opportunities").insert({ user_id: user!.id, opportunity_id: oppId });
    }
    fetchAll();
  };

  const setReminder = async (opp: any) => {
    if (hasReminder(opp.id)) {
      const existing = reminders.find((r: any) => r.opportunity_id === opp.id);
      if (existing) {
        await supabase.from("opportunity_reminders" as any).update({ is_dismissed: true } as any).eq("id", existing.id);
      }
      toast.success("Reminder removed");
    } else {
      const reminderDate = opp.application_deadline
        ? new Date(new Date(opp.application_deadline).getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from("opportunity_reminders" as any).insert({
        user_id: user!.id, opportunity_id: opp.id,
        reminder_type: "deadline", reminder_date: reminderDate,
        message: `Reminder: ${opp.title} at ${opp.company_name} deadline approaching!`,
      } as any);
      toast.success("Reminder set!");
    }
    fetchAll();
  };

  const applyToJob = async (opp: any) => {
    if (isApplied(opp.id)) { toast.info("Already applied"); return; }
    const matchData = aiMatches.find(m => m.opportunity_title === opp.title);
    const { error } = await supabase.from("job_applications").insert({
      user_id: user!.id, opportunity_id: opp.id, application_type: "job",
      cover_note: coverNote || null,
      fit_score: matchData?.fit_score || null,
      fit_breakdown: matchData?.fit_breakdown || null,
    });
    if (error) { toast.error("Application failed"); return; }
    setCoverNote("");
    fetchAll();
    toast.success("Application submitted!");
    // Trigger reflection prompts
    getReflectionPrompts(opp);
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

  // --- AI Functions using real user data ---
  const getSmartMatch = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("job-matching-ai", {
        body: {
          type: "smart_match",
          userData: {
            skills: userContext.skills,
            interests: userContext.interests,
            experienceLevel: userContext.experienceLevel,
            energyPatterns: userContext.energyPatterns,
            mood: userContext.mood,
            completedProjects: userContext.completedProjects,
            learningHistory: userContext.learningHistory,
            opportunities: opportunities.slice(0, 10).map(o => ({
              title: o.title, company: o.company_name, skills: o.required_skills,
              domain: o.domain, type: o.role_type, experience: o.experience_level,
            })),
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
          userData: {
            careerTitle: career.title, domain: career.domain,
            currentSkills: userContext.skills, interests: userContext.interests,
          },
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
            skills: userContext.skills,
            interests: userContext.interests,
            projects: userContext.learningHistory,
            challenges: companyChallenges.map(c => ({
              title: c.title, company: c.company_name,
              skills: c.required_skills, domain: c.domain,
            })),
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
    fetchRelatedData(opp);
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("job-matching-ai", {
        body: {
          type: "application_prep",
          userData: {
            opportunityTitle: opp.title,
            requiredSkills: opp.required_skills || [],
            userSkills: userContext.skills,
            experience: userContext.experienceLevel,
          },
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
          userData: {
            activeApplications: applications.filter(a => a.status === "applied").length,
            lastActivity: applications[0]?.applied_at || "none",
            mood: userContext.mood,
            growingSkills: userContext.growingSkills,
            isStagnant: applications.length === 0,
          },
        },
      });
      if (error) throw error;
      setAiNudge(data);
    } catch { toast.error("Failed"); }
    setAiLoading(false);
  };

  const getReflectionPrompts = async (opp: any) => {
    try {
      const { data, error } = await supabase.functions.invoke("job-matching-ai", {
        body: {
          type: "reflection_after_apply",
          userData: {
            opportunityTitle: opp.title,
            roleType: opp.role_type,
            fitScore: aiMatches.find(m => m.opportunity_title === opp.title)?.fit_score || "unknown",
            skills: userContext.skills,
          },
        },
      });
      if (error) throw error;
      setReflectionPrompts(data);
    } catch { /* silent fail for prompts */ }
  };

  const saveReflection = async (appId: string) => {
    if (!reflectionContent.trim()) return;
    const skillsArray = reflectionSkills.split(",").map(s => s.trim()).filter(Boolean);
    await supabase.from("opportunity_reflections").insert({
      user_id: user!.id,
      application_id: appId,
      content: reflectionContent,
      mood: reflectionMood || null,
      skills_to_build: skillsArray.length > 0 ? skillsArray : null,
      next_steps: reflectionNextSteps || null,
    });
    setReflectionContent("");
    setReflectionMood("");
    setReflectionSkills("");
    setReflectionNextSteps("");
    setActiveReflectionAppId(null);
    setReflectionPrompts(null);
    fetchAll();
    toast.success("Reflection saved!");
  };

  const updateAppStatus = async (appId: string, status: string) => {
    await supabase.from("job_applications").update({ status, updated_at: new Date().toISOString() }).eq("id", appId);
    fetchAll();
  };

  // Fetch related learning tracks & mentors for opportunity details
  const fetchRelatedData = async (opp: any) => {
    const skills = opp.required_skills || [];
    const domain = opp.domain || "";

    const [ltRes, mentorRes] = await Promise.all([
      supabase.from("learning_tracks").select("*").or(
        skills.length > 0
          ? skills.map((s: string) => `skills_gained.cs.{${s}}`).join(",")
          : `domain.eq.${domain}`
      ).limit(4),
      supabase.from("mentors").select("*").eq("is_active", true).or(
        skills.length > 0
          ? skills.map((s: string) => `expertise_areas.cs.{${s}}`).join(",")
          : `industries.cs.{${domain}}`
      ).limit(3),
    ]);
    setRelatedLearning(ltRes.data || []);
    setRelatedMentors(mentorRes.data || []);
  };

  const fitColor = (score: number) =>
    score >= 80 ? "text-primary bg-primary/10 border-primary/20" :
    score >= 60 ? "text-accent bg-accent/10 border-accent/20" :
    "text-destructive bg-destructive/10 border-destructive/20";

  // Upcoming reminders banner
  const upcomingReminders = reminders.filter((r: any) => {
    const d = new Date(r.reminder_date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
  });

  // === DETAIL VIEW: OPPORTUNITY ===
  if (selectedOpp) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setSelectedOpp(null); setAppPrep(null); setRelatedLearning([]); setRelatedMentors([]); }}>← Back</Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="font-display text-2xl text-foreground">{selectedOpp.title}</h1>
                <p className="font-body text-sm text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                  <Building2 size={14} /> {selectedOpp.company_name}
                  {selectedOpp.location && <><MapPin size={14} /> {selectedOpp.location}</>}
                  <Badge variant="outline" className="text-[10px] capitalize">{selectedOpp.role_type}</Badge>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setReminder(selectedOpp)} title="Set reminder">
                  {hasReminder(selectedOpp.id) ? <Bell size={18} className="text-primary" /> : <BellOff size={18} className="text-muted-foreground" />}
                </button>
                <button onClick={() => toggleSave(selectedOpp.id)}>
                  {isSaved(selectedOpp.id) ? <BookmarkCheck size={20} className="text-accent" /> : <Bookmark size={20} className="text-muted-foreground" />}
                </button>
              </div>
            </div>
            <p className="font-body text-sm text-foreground mb-4">{selectedOpp.description}</p>

            {/* Key details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {selectedOpp.salary_range && (
                <div className="bg-muted rounded-lg p-3 text-center">
                  <DollarSign size={14} className="mx-auto text-muted-foreground mb-1" />
                  <p className="font-body text-xs text-muted-foreground">Salary</p>
                  <p className="font-display text-sm text-foreground">{selectedOpp.salary_range}</p>
                </div>
              )}
              {selectedOpp.duration && (
                <div className="bg-muted rounded-lg p-3 text-center">
                  <Clock size={14} className="mx-auto text-muted-foreground mb-1" />
                  <p className="font-body text-xs text-muted-foreground">Duration</p>
                  <p className="font-display text-sm text-foreground">{selectedOpp.duration}</p>
                </div>
              )}
              <div className="bg-muted rounded-lg p-3 text-center">
                <Briefcase size={14} className="mx-auto text-muted-foreground mb-1" />
                <p className="font-body text-xs text-muted-foreground">Work Mode</p>
                <p className="font-display text-sm text-foreground capitalize">{selectedOpp.work_mode}</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <BarChart3 size={14} className="mx-auto text-muted-foreground mb-1" />
                <p className="font-body text-xs text-muted-foreground">Level</p>
                <p className="font-display text-sm text-foreground capitalize">{selectedOpp.experience_level}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {(selectedOpp.required_skills as string[])?.map((s: string) => {
                    const hasSkill = userContext.skills.some(us => us.toLowerCase() === s.toLowerCase());
                    return (
                      <Badge key={s} className={`text-[10px] ${hasSkill ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                        {hasSkill ? "✓" : "✗"} {s}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Nice to Have</h4>
                <div className="flex flex-wrap gap-1">
                  {(selectedOpp.preferred_skills as string[])?.map((s: string) => (
                    <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            {(selectedOpp.responsibilities as string[])?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-display text-sm text-foreground mb-2">Responsibilities</h4>
                <ul className="space-y-1">
                  {(selectedOpp.responsibilities as string[]).map((r: string, i: number) => (
                    <li key={i} className="font-body text-xs text-muted-foreground flex items-start gap-2">
                      <ChevronRight size={12} className="mt-0.5 shrink-0 text-primary" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deadline */}
            {selectedOpp.application_deadline && (
              <div className="flex items-center gap-2 text-xs font-body text-muted-foreground mb-4 bg-accent/5 rounded-lg p-3 border border-accent/10">
                <Calendar size={14} className="text-accent" />
                <span>Application deadline: <strong className="text-foreground">{new Date(selectedOpp.application_deadline).toLocaleDateString()}</strong></span>
                {!hasReminder(selectedOpp.id) && (
                  <Button size="sm" variant="ghost" onClick={() => setReminder(selectedOpp)} className="text-[10px] ml-auto">
                    <Bell size={10} /> Set Reminder
                  </Button>
                )}
              </div>
            )}

            {/* Apply section */}
            {!isApplied(selectedOpp.id) ? (
              <div className="space-y-3 border-t border-border pt-4">
                <Textarea placeholder="Add a cover note (optional)..." value={coverNote} onChange={e => setCoverNote(e.target.value)} rows={3} />
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => applyToJob(selectedOpp)} className="gradient-warm text-secondary-foreground"><Rocket size={14} /> Apply Now</Button>
                  <Button variant="outline" onClick={() => getAppPrep(selectedOpp)} disabled={aiLoading}><Brain size={14} /> AI Prep Guide</Button>
                  {selectedOpp.application_url && (
                    <a href={selectedOpp.application_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline"><ExternalLink size={14} /> External Apply</Button>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <Badge className="bg-primary/10 text-primary">✓ Applied</Badge>
            )}
          </div>
        </motion.div>

        {/* AI Application Prep */}
        {aiLoading && (
          <div className="text-center py-8">
            <Sparkles className="animate-spin mx-auto text-accent" size={24} />
            <p className="font-body text-sm text-muted-foreground mt-2">Loading AI insights...</p>
          </div>
        )}

        {appPrep && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/20 p-6 space-y-4">
            <h3 className="font-display text-lg text-accent flex items-center gap-2"><Sparkles size={18} /> AI Application Prep Guide</h3>
            {appPrep.checklist && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Application Checklist</h4>
                {appPrep.checklist.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
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
                <div className="flex flex-wrap gap-1">{appPrep.skills_to_highlight.map((s: string) => <Badge key={s} className="bg-primary/10 text-primary text-[10px]">{s}</Badge>)}</div>
              </div>
            )}
            {appPrep.interview_topics && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Potential Interview Topics</h4>
                {appPrep.interview_topics.map((t: string, i: number) => <p key={i} className="font-body text-xs text-foreground">• {t}</p>)}
              </div>
            )}
            {appPrep.improvement_areas && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Areas to Improve</h4>
                {appPrep.improvement_areas.map((a: string, i: number) => <p key={i} className="font-body text-xs text-muted-foreground">⚡ {a}</p>)}
              </div>
            )}
            {appPrep.cover_note_suggestions && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Cover Note Ideas</h4>
                {appPrep.cover_note_suggestions.map((s: string, i: number) => <p key={i} className="font-body text-xs text-foreground italic">"{s}"</p>)}
              </div>
            )}
          </motion.div>
        )}

        {/* Learning Links */}
        {relatedLearning.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display text-base text-foreground mb-3 flex items-center gap-2"><GraduationCap size={16} className="text-primary" /> Related Learning Paths</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedLearning.map((lt: any) => (
                <Link key={lt.id} to="/dashboard/content-library" className="block bg-muted rounded-lg p-4 hover:bg-muted/80 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{lt.icon_emoji || "📚"}</span>
                    <h4 className="font-display text-sm text-foreground">{lt.title}</h4>
                  </div>
                  <p className="font-body text-xs text-muted-foreground line-clamp-2">{lt.description}</p>
                  <div className="flex gap-1 mt-2">
                    <Badge variant="outline" className="text-[10px] capitalize">{lt.difficulty}</Badge>
                    {lt.estimated_hours && <Badge variant="secondary" className="text-[10px]">{lt.estimated_hours}h</Badge>}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mentor Suggestions */}
        {relatedMentors.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-display text-base text-foreground mb-3 flex items-center gap-2"><UserCheck size={16} className="text-accent" /> Recommended Mentors</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {relatedMentors.map((m: any) => (
                <Link key={m.id} to="/dashboard/mentor-matchmaking" className="block bg-muted rounded-lg p-4 hover:bg-muted/80 transition-colors text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/10 mx-auto mb-2 flex items-center justify-center">
                    <Users size={20} className="text-accent" />
                  </div>
                  <h4 className="font-display text-sm text-foreground">{m.name}</h4>
                  <p className="font-body text-[10px] text-muted-foreground mt-1 line-clamp-1">{m.bio}</p>
                  {m.rating && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star size={10} className="text-accent fill-accent" />
                      <span className="font-body text-[10px] text-muted-foreground">{m.rating}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Reflection prompts after applying */}
        {reflectionPrompts && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 rounded-xl border border-primary/20 p-6 space-y-4">
            <h3 className="font-display text-base text-primary flex items-center gap-2"><Heart size={16} /> Reflection After Applying</h3>
            {reflectionPrompts.encouragement && (
              <p className="font-body text-sm text-foreground italic">"{reflectionPrompts.encouragement}"</p>
            )}
            {reflectionPrompts.prompts && (
              <div className="space-y-2">
                {reflectionPrompts.prompts.map((p: any, i: number) => (
                  <div key={i} className="bg-background rounded-lg p-3">
                    <p className="font-body text-sm text-foreground">{p.question}</p>
                    <Badge variant="outline" className="text-[10px] mt-1 capitalize">{p.category}</Badge>
                  </div>
                ))}
              </div>
            )}
            {reflectionPrompts.next_steps && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Suggested Next Steps</h4>
                {reflectionPrompts.next_steps.map((s: string, i: number) => (
                  <p key={i} className="font-body text-xs text-foreground">→ {s}</p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // === DETAIL VIEW: CAREER PATH ===
  if (selectedCareer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => { setSelectedCareer(null); setCareerInsights(null); }}>← Back</Button>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card rounded-xl border border-border p-6">
            <span className="text-3xl mb-2 block">{selectedCareer.icon_emoji}</span>
            <h1 className="font-display text-2xl text-foreground mb-1">{selectedCareer.title}</h1>
            <p className="font-body text-sm text-muted-foreground mb-4">{selectedCareer.description}</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="font-body text-xs text-muted-foreground">Salary</p>
                <p className="font-display text-sm text-foreground">{selectedCareer.salary_range}</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="font-body text-xs text-muted-foreground">Demand</p>
                <p className="font-display text-sm text-foreground capitalize">{selectedCareer.demand_level}</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <p className="font-body text-xs text-muted-foreground">Difficulty</p>
                <p className="font-display text-sm text-foreground capitalize">{selectedCareer.difficulty}</p>
              </div>
            </div>
            {selectedCareer.day_to_day && (
              <div className="mb-4">
                <h4 className="font-display text-sm text-foreground mb-2">Day to Day</h4>
                <p className="font-body text-sm text-muted-foreground">{selectedCareer.day_to_day}</p>
              </div>
            )}
            {selectedCareer.growth_trajectory && (
              <div className="mb-4">
                <h4 className="font-display text-sm text-foreground mb-2">Growth Trajectory</h4>
                <p className="font-body text-sm text-foreground">{selectedCareer.growth_trajectory}</p>
              </div>
            )}
            {selectedCareer.industry_trends && (
              <div className="mb-4">
                <h4 className="font-display text-sm text-foreground mb-2">Industry Trends</h4>
                <p className="font-body text-sm text-muted-foreground">{selectedCareer.industry_trends}</p>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {(selectedCareer.tools_certifications as string[])?.length > 0 && (
                <div>
                  <h4 className="font-display text-sm text-foreground mb-2">Tools & Certifications</h4>
                  <div className="flex flex-wrap gap-1">{(selectedCareer.tools_certifications as string[]).map((t: string) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
                </div>
              )}
              {(selectedCareer.related_skills as string[])?.length > 0 && (
                <div>
                  <h4 className="font-display text-sm text-foreground mb-2">Related Skills</h4>
                  <div className="flex flex-wrap gap-1">{(selectedCareer.related_skills as string[]).map((s: string) => <Badge key={s} className="bg-primary/10 text-primary text-[10px]">{s}</Badge>)}</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {aiLoading && <div className="text-center py-8"><Sparkles className="animate-spin mx-auto text-accent" size={24} /><p className="font-body text-sm text-muted-foreground mt-2">Loading AI insights...</p></div>}

        {careerInsights && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/20 p-6 space-y-4">
            <h3 className="font-display text-lg text-accent flex items-center gap-2"><Sparkles size={18} /> AI Career Insights</h3>
            {careerInsights.overview && <p className="font-body text-sm text-foreground">{careerInsights.overview}</p>}
            {careerInsights.day_in_life && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-1">A Day in the Life</h4>
                <p className="font-body text-xs text-muted-foreground">{careerInsights.day_in_life}</p>
              </div>
            )}
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
            {careerInsights.salary_progression && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-1">Salary Progression</h4>
                <p className="font-body text-xs text-foreground">{careerInsights.salary_progression}</p>
              </div>
            )}
            {careerInsights.industry_outlook && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-1">Industry Outlook</h4>
                <p className="font-body text-xs text-muted-foreground">{careerInsights.industry_outlook}</p>
              </div>
            )}
            {careerInsights.tips && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Pro Tips</h4>
                {careerInsights.tips.map((t: string, i: number) => <p key={i} className="font-body text-xs text-foreground">💡 {t}</p>)}
              </div>
            )}
            {careerInsights.related_paths && (
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Related Career Paths</h4>
                <div className="flex flex-wrap gap-1">{careerInsights.related_paths.map((p: string) => <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>)}</div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // === MAIN VIEW ===
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Briefcase size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl text-foreground">Job Matching & Career Explorer</h1>
            <p className="font-body text-sm text-muted-foreground">Find the right opportunities — tailored to your journey, skills, and aspirations.</p>
          </div>
        </div>
      </motion.div>

      {/* AI Nudge */}
      <AnimatePresence>
        {aiNudge && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-accent/5 rounded-xl border border-accent/20 p-4 flex items-start gap-3">
            <Sparkles className="text-accent shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="font-body text-sm text-foreground">{aiNudge.nudge_message}</p>
              <p className="font-body text-xs text-accent mt-1">→ {aiNudge.action}</p>
            </div>
            <button onClick={() => setAiNudge(null)}><X size={14} className="text-muted-foreground" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2">
          <h4 className="font-display text-sm text-primary flex items-center gap-2"><Bell size={14} /> Upcoming Reminders</h4>
          {upcomingReminders.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between bg-background rounded-lg p-3">
              <div>
                <p className="font-body text-xs text-foreground">{r.message}</p>
                <p className="font-body text-[10px] text-muted-foreground">{new Date(r.reminder_date).toLocaleDateString()}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={async () => {
                await supabase.from("opportunity_reminders" as any).update({ is_dismissed: true } as any).eq("id", r.id);
                fetchAll();
              }}><X size={12} /></Button>
            </div>
          ))}
        </div>
      )}

      {/* User Context Summary */}
      {userContext.skills.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-body text-xs text-muted-foreground">Your skills:</span>
          {userContext.skills.slice(0, 6).map(s => (
            <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
          ))}
          {userContext.skills.length > 6 && <span className="font-body text-[10px] text-muted-foreground">+{userContext.skills.length - 6} more</span>}
          <span className="font-body text-[10px] text-muted-foreground ml-2">Mood: {userContext.mood} • Energy: {userContext.energyPatterns}</span>
        </div>
      )}

      <Tabs defaultValue="opportunities">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
          <TabsTrigger value="opportunities"><Briefcase size={14} className="mr-1" /> Opportunities</TabsTrigger>
          <TabsTrigger value="careers"><TrendingUp size={14} className="mr-1" /> Career Explorer</TabsTrigger>
          <TabsTrigger value="challenges"><Zap size={14} className="mr-1" /> Challenges</TabsTrigger>
          <TabsTrigger value="applications"><Target size={14} className="mr-1" /> Applications</TabsTrigger>
          <TabsTrigger value="saved"><Bookmark size={14} className="mr-1" /> Saved</TabsTrigger>
          <TabsTrigger value="ai"><Brain size={14} className="mr-1" /> AI Match</TabsTrigger>
        </TabsList>

        {/* ===== OPPORTUNITIES TAB ===== */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search roles, companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <div className="flex gap-1 flex-wrap">
              <span className="font-body text-xs text-muted-foreground mr-1 self-center">Domain:</span>
              {DOMAINS.map(d => <button key={d} onClick={() => setDomainFilter(d)} className={`px-3 py-1 rounded-full font-body text-xs capitalize transition-all ${domainFilter === d ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>{d}</button>)}
            </div>
            <div className="flex gap-1 flex-wrap">
              <span className="font-body text-xs text-muted-foreground mr-1 self-center">Type:</span>
              {ROLE_TYPES.map(t => <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1 rounded-full font-body text-xs capitalize transition-all ${typeFilter === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>{t}</button>)}
            </div>
            <div className="flex gap-1 flex-wrap">
              <span className="font-body text-xs text-muted-foreground mr-1 self-center">Mode:</span>
              {WORK_MODES.map(m => <button key={m} onClick={() => setModeFilter(m)} className={`px-3 py-1 rounded-full font-body text-xs capitalize transition-all ${modeFilter === m ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary/10"}`}>{m}</button>)}
            </div>
            <div className="flex gap-1 flex-wrap">
              <span className="font-body text-xs text-muted-foreground mr-1 self-center">Level:</span>
              {EXP_LEVELS.map(e => <button key={e} onClick={() => setExpFilter(e)} className={`px-3 py-1 rounded-full font-body text-xs capitalize transition-all ${expFilter === e ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>{e}</button>)}
            </div>
          </div>

          <p className="font-body text-xs text-muted-foreground">{filteredOpps.length} opportunities found</p>

          <div className="grid gap-4">
            {filteredOpps.map((opp, i) => (
              <motion.div key={opp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-display text-base text-foreground">{opp.title}</h3>
                      {opp.is_featured && <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">Featured</Badge>}
                    </div>
                    <p className="font-body text-sm text-muted-foreground flex items-center gap-2">
                      <Building2 size={12} /> {opp.company_name}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {opp.location && <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><MapPin size={10} /> {opp.location}</span>}
                      <Badge variant="outline" className="text-[10px] capitalize">{opp.role_type}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{opp.work_mode}</Badge>
                      {opp.experience_level && <Badge variant="secondary" className="text-[10px] capitalize">{opp.experience_level}</Badge>}
                      {opp.salary_range && <span className="font-body text-xs text-muted-foreground"><DollarSign size={10} className="inline" /> {opp.salary_range}</span>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(opp.required_skills as string[])?.slice(0, 5).map((s: string) => (
                        <Badge key={s} className={`text-[10px] ${userContext.skills.some(us => us.toLowerCase() === s.toLowerCase()) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 ml-2">
                    <button onClick={() => toggleSave(opp.id)}>
                      {isSaved(opp.id) ? <BookmarkCheck size={16} className="text-accent" /> : <Bookmark size={16} className="text-muted-foreground" />}
                    </button>
                    <button onClick={() => setReminder(opp)}>
                      {hasReminder(opp.id) ? <Bell size={14} className="text-primary" /> : <BellOff size={14} className="text-muted-foreground" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <Button size="sm" onClick={() => { setSelectedOpp(opp); fetchRelatedData(opp); }} className="gradient-warm text-secondary-foreground text-xs">View & Apply</Button>
                  <Button size="sm" variant="outline" onClick={() => getAppPrep(opp)} disabled={aiLoading} className="text-xs"><Brain size={12} /> AI Prep</Button>
                  {isApplied(opp.id) && <Badge className="bg-primary/10 text-primary text-[10px]">✓ Applied</Badge>}
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

        {/* ===== CAREER EXPLORER TAB ===== */}
        <TabsContent value="careers" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-2">🧭 Career Explorer</h2>
            <p className="font-body text-sm text-muted-foreground">Deep-dive into career paths with real-world examples, growth trajectories, and AI-powered insights personalized to your profile.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerPaths.map((cp, i) => (
              <motion.div key={cp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => exploreCareer(cp)}>
                <span className="text-2xl mb-2 block">{cp.icon_emoji}</span>
                <h3 className="font-display text-base text-foreground mb-1">{cp.title}</h3>
                <p className="font-body text-xs text-muted-foreground mb-3 line-clamp-2">{cp.description}</p>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] capitalize">{cp.domain}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{cp.difficulty}</Badge>
                  <Badge className={`text-[10px] capitalize ${cp.demand_level === "very-high" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>{cp.demand_level} demand</Badge>
                </div>
                <p className="font-body text-xs text-muted-foreground">{cp.salary_range}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(cp.related_skills as string[])?.slice(0, 4).map((s: string) => <Badge key={s} className="bg-primary/10 text-primary text-[10px]">{s}</Badge>)}
                </div>
              </motion.div>
            ))}
            {careerPaths.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border">
                <TrendingUp className="mx-auto text-muted-foreground mb-3" size={32} />
                <p className="font-body text-muted-foreground">Career paths will appear as they're added.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ===== COMPANY CHALLENGES TAB ===== */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-2">💼 Company-Driven Paid Challenges</h2>
            <p className="font-body text-sm text-muted-foreground mb-4">Apply your skills to real problems posted by companies, with structured compensation.</p>
            <Button onClick={getProblemMatches} disabled={aiLoading} variant="outline"><Sparkles size={14} /> Problem-Solution Matchmaker</Button>
          </div>

          {problemMatches.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/20 p-5">
              <h3 className="font-display text-sm text-accent mb-3 flex items-center gap-2"><Sparkles size={14} /> AI-Matched Challenges</h3>
              {problemMatches.map((m: any, i: number) => (
                <div key={i} className="bg-background rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm text-foreground">{m.challenge_title}</span>
                    <Badge className={`text-[10px] ${fitColor(m.match_score)}`}>{m.match_score}% match</Badge>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mt-1">{m.why_good_fit}</p>
                  {m.skills_applied && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {m.skills_applied.map((s: string) => <Badge key={s} className="bg-primary/10 text-primary text-[10px]">{s}</Badge>)}
                    </div>
                  )}
                  {m.learning_needed && m.learning_needed.length > 0 && (
                    <p className="font-body text-[10px] text-muted-foreground mt-1">Learn: {m.learning_needed.join(", ")}</p>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {companyChallenges.map((ch, i) => (
              <motion.div key={ch.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px]"><Building2 size={10} className="mr-0.5" /> {ch.company_name}</Badge>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">{ch.compensation}</Badge>
                </div>
                <h3 className="font-display text-base text-foreground mb-1">{ch.title}</h3>
                <p className="font-body text-xs text-muted-foreground mb-2 line-clamp-2">{ch.description}</p>
                {ch.problem_statement && (
                  <div className="bg-muted rounded-lg p-3 mb-3">
                    <p className="font-body text-xs text-foreground"><strong>Problem:</strong> {ch.problem_statement}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(ch.required_skills as string[])?.map((s: string) => <Badge key={s} className="bg-accent/10 text-accent text-[10px]">{s}</Badge>)}
                </div>
                <div className="flex items-center gap-3 text-xs font-body text-muted-foreground mb-3 flex-wrap">
                  {ch.duration && <span><Clock size={10} className="inline" /> {ch.duration}</span>}
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
                  <Badge className="bg-primary/10 text-primary">✓ Applied</Badge>
                ) : (
                  <Button size="sm" onClick={() => applyToChallenge(ch)} className="gradient-warm text-secondary-foreground w-full"><Rocket size={14} /> Apply</Button>
                )}
              </motion.div>
            ))}
            {companyChallenges.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border">
                <Zap className="mx-auto text-muted-foreground mb-3" size={32} />
                <p className="font-body text-muted-foreground">No challenges available yet.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ===== APPLICATIONS TAB ===== */}
        <TabsContent value="applications" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-2">📋 Application Tracker</h2>
            <p className="font-body text-sm text-muted-foreground">Manage your applications, track status, and reflect on your journey.</p>
            <div className="flex gap-3 mt-3 flex-wrap">
              {["applied", "reviewing", "interview", "offer"].map(status => {
                const count = applications.filter(a => a.status === status).length;
                return (
                  <div key={status} className="bg-muted rounded-lg px-3 py-2 text-center">
                    <p className="font-display text-lg text-foreground">{count}</p>
                    <p className="font-body text-[10px] text-muted-foreground capitalize">{status}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {applications.length > 0 ? (
            <div className="grid gap-4">
              {applications.map((app, i) => {
                const opp = opportunities.find(o => o.id === app.opportunity_id);
                const ch = companyChallenges.find(c => c.id === app.company_challenge_id);
                const title = opp?.title || ch?.title || "Unknown";
                const company = opp?.company_name || ch?.company_name || "";
                const appReflection = reflections.find(r => r.application_id === app.id);
                return (
                  <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-xl border border-border p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display text-base text-foreground">{title}</h3>
                        <p className="font-body text-xs text-muted-foreground">{company} • {app.application_type}</p>
                      </div>
                      {app.fit_score && <Badge className={`text-[10px] ${fitColor(app.fit_score)}`}>{Math.round(app.fit_score)}% Fit</Badge>}
                    </div>

                    {/* Fit breakdown */}
                    {app.fit_breakdown && typeof app.fit_breakdown === "object" && (
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {Object.entries(app.fit_breakdown as Record<string, number>).map(([key, val]) => (
                          <div key={key} className="text-center">
                            <Progress value={val} className="h-1 mb-0.5" />
                            <p className="font-body text-[9px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status pipeline */}
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      {["applied", "reviewing", "interview", "offer", "rejected"].map((s, si) => (
                        <div key={s} className="flex items-center">
                          <button onClick={() => updateAppStatus(app.id, s)}
                            className={`px-2 py-0.5 rounded-full font-body text-[10px] capitalize transition-all ${app.status === s ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>{s}</button>
                          {si < 4 && <ArrowRight size={8} className="text-muted-foreground mx-0.5" />}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-body text-muted-foreground flex-wrap">
                      <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                      {app.cover_note && <span>📝 Cover note</span>}
                      {app.reminder_date && <span><Bell size={10} className="inline" /> Reminder set</span>}
                    </div>

                    {/* Existing reflection */}
                    {appReflection && (
                      <div className="bg-primary/5 rounded-lg p-3 mt-3 border border-primary/10">
                        <p className="font-body text-xs text-foreground">{appReflection.content}</p>
                        {appReflection.skills_to_build && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(appReflection.skills_to_build as string[]).map((s: string) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reflection form */}
                    <div className="flex gap-2 mt-3">
                      {!appReflection && (
                        <Button size="sm" variant="outline" onClick={() => {
                          setActiveReflectionAppId(activeReflectionAppId === app.id ? null : app.id);
                          if (opp) getReflectionPrompts(opp);
                        }} className="text-xs">
                          <MessageSquare size={12} /> {activeReflectionAppId === app.id ? "Cancel" : "Reflect"}
                        </Button>
                      )}
                    </div>

                    <AnimatePresence>
                      {activeReflectionAppId === app.id && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 space-y-3 overflow-hidden">
                          {reflectionPrompts?.prompts && (
                            <div className="bg-accent/5 rounded-lg p-3 space-y-1">
                              <p className="font-body text-[10px] text-accent font-semibold">Reflection prompts:</p>
                              {reflectionPrompts.prompts.slice(0, 3).map((p: any, idx: number) => (
                                <p key={idx} className="font-body text-xs text-foreground">• {p.question}</p>
                              ))}
                            </div>
                          )}
                          <Textarea placeholder="Your reflection..." value={reflectionContent} onChange={e => setReflectionContent(e.target.value)} rows={3} />
                          <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="Mood (e.g. hopeful)" value={reflectionMood} onChange={e => setReflectionMood(e.target.value)} className="text-xs" />
                            <Input placeholder="Skills to build (comma sep)" value={reflectionSkills} onChange={e => setReflectionSkills(e.target.value)} className="text-xs" />
                            <Input placeholder="Next steps" value={reflectionNextSteps} onChange={e => setReflectionNextSteps(e.target.value)} className="text-xs" />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveReflection(app.id)}>Save Reflection</Button>
                            <Button size="sm" variant="ghost" onClick={() => setActiveReflectionAppId(null)}>Cancel</Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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

        {/* ===== SAVED TAB ===== */}
        <TabsContent value="saved" className="space-y-6">
          {savedOpps.length > 0 ? (
            <div className="grid gap-4">
              {savedOpps.map((s, i) => {
                const opp = opportunities.find(o => o.id === s.opportunity_id);
                if (!opp) return null;
                return (
                  <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="bg-card rounded-xl border border-border p-5 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-base text-foreground truncate">{opp.title}</h3>
                      <p className="font-body text-xs text-muted-foreground">{opp.company_name} • {opp.location}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">{(opp.required_skills as string[])?.slice(0, 3).map((sk: string) => <Badge key={sk} variant="outline" className="text-[10px]">{sk}</Badge>)}</div>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <Button size="sm" onClick={() => { setSelectedOpp(opp); fetchRelatedData(opp); }} variant="outline" className="text-xs">View</Button>
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

        {/* ===== AI MATCH TAB ===== */}
        <TabsContent value="ai" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <Brain className="mx-auto text-accent mb-3" size={40} />
            <h2 className="font-display text-xl text-foreground mb-2">AI Smart Match</h2>
            <p className="font-body text-sm text-muted-foreground mb-2">Get AI-powered fit scores based on your actual skills, interests, energy patterns, and roadmap alignment.</p>
            {userContext.skills.length > 0 && (
              <p className="font-body text-xs text-muted-foreground mb-4">Using {userContext.skills.length} skills, {userContext.mood} mood, {userContext.energyPatterns} energy</p>
            )}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={getSmartMatch} disabled={aiLoading} className="gradient-warm text-secondary-foreground">
                <Sparkles size={16} /> {aiLoading ? "Matching..." : "Run Smart Match"}
              </Button>
              <Button onClick={getNudge} disabled={aiLoading} variant="outline"><Lightbulb size={16} /> Get Nudge</Button>
              <Button onClick={fetchUserContext} variant="ghost" className="text-xs"><RefreshCw size={14} /> Refresh Profile</Button>
            </div>
          </div>

          {aiMatches.length > 0 && (
            <div>
              <h3 className="font-display text-lg text-foreground mb-3">Your AI Matches</h3>
              <div className="grid gap-4">
                {aiMatches.map((m: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-xl border border-accent/20 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-display text-base text-foreground">{m.opportunity_title}</h4>
                      <Badge className={`text-sm font-bold ${fitColor(m.fit_score)}`}>{m.fit_score}%</Badge>
                    </div>
                    {m.fit_breakdown && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        {Object.entries(m.fit_breakdown).map(([key, val]) => (
                          <div key={key} className="text-center">
                            <Progress value={val as number} className="h-1.5 mb-1" />
                            <p className="font-body text-[10px] text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-3 mb-2">
                      {m.strengths && (
                        <div>
                          <p className="font-body text-xs text-primary mb-1">✅ Strengths</p>
                          {m.strengths.map((s: string) => <p key={s} className="font-body text-xs text-foreground">• {s}</p>)}
                        </div>
                      )}
                      {m.gaps && (
                        <div>
                          <p className="font-body text-xs text-accent mb-1">⚡ Gaps to Close</p>
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
