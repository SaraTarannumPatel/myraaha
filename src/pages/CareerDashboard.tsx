import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useCareerInsights } from "@/hooks/useCareerInsights";
import {
  Compass, Map, Brain, FileText, Sparkles, ArrowRight, TrendingUp,
  Target, Clock, BookOpen, Trophy, Bell, Users, Briefcase, Heart,
  Lightbulb, CheckCircle2, Play, Zap, Star, MessageSquare, Bot,
  GraduationCap, Flame, Calendar, ChevronRight, UserPlus, Building2,
  AlertCircle, Shield, RefreshCw
} from "lucide-react";
import SelfInsightsPanel from "@/components/dashboard/SelfInsightsPanel";
import CommunityFeedPreview from "@/components/dashboard/CommunityFeedPreview";
import JobMatchPreview from "@/components/dashboard/JobMatchPreview";
import MoodCheckIn from "@/components/dashboard/MoodCheckIn";
import DomainAffinityWidget from "@/components/dashboard/DomainAffinityWidget";

const JOURNEY_PHASES = [
  { id: "discovery", label: "Discovery", icon: Compass, description: "Exploring interests" },
  { id: "learning", label: "Learning", icon: BookOpen, description: "Building knowledge" },
  { id: "development", label: "Development", icon: TrendingUp, description: "Growing skills" },
  { id: "preparation", label: "Prep", icon: Target, description: "Getting ready" },
  { id: "opportunities", label: "Opportunities", icon: Briefcase, description: "Finding matches" },
];

const careerQuickActions = [
  { label: "Curiosity Compass", icon: Compass, path: "/dashboard/curiosity-compass", color: "bg-blue/10 text-blue", desc: "Explore interests" },
  { label: "AI Roadmap", icon: Map, path: "/dashboard/roadmap", color: "bg-indigo/10 text-indigo", desc: "Plan your path" },
  { label: "SelfGraph™", icon: Brain, path: "/dashboard/selfgraph", color: "bg-terracotta/10 text-terracotta", desc: "Know yourself" },
  { label: "Living Resume", icon: FileText, path: "/dashboard/living-resume", color: "bg-primary/10 text-primary", desc: "Track growth" },
  { label: "Career Coach", icon: Bot, path: "/dashboard/career-coach", color: "bg-maroon/10 text-maroon", desc: "Get guidance" },
];

const CareerDashboard = () => {
  const { user, profile } = useAuth();
  const { readiness, nudges, recommendations, autoResume, loading: insightsLoading, refresh: refreshInsights } = useCareerInsights();
  const [stats, setStats] = useState({
    skillsCount: 0, goalsCount: 0, streak: 0, achievementsCount: 0,
    interestsCount: 0, journalCount: 0, connectionsCount: 0, projectsCount: 0
  });
  const [activity, setActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [roadmapSteps, setRoadmapSteps] = useState<any[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchAll();
    const channel = supabase.channel('career-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills', filter: `user_id=eq.${user.id}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interests', filter: `user_id=eq.${user.id}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements', filter: `user_id=eq.${user.id}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetchNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchAll = async () => {
    await Promise.all([fetchStats(), fetchActivity(), fetchNotifications(), fetchSkills(), fetchMentors(), fetchResources(), fetchRoadmapSteps()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    if (!user) return;
    const [skillsRes, goalsRes, achievementsRes, interestsRes, journalRes, connectionsRes, projectsRes] = await Promise.all([
      supabase.from("skills").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("roadmap_steps").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
      supabase.from("achievements").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("interests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("journal_entries").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`).eq("status", "accepted"),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    let streak = 0;
    if (journalRes.data && journalRes.data.length > 0) {
      const dates = [...new Set(journalRes.data.map(e => new Date(e.created_at).toDateString()))];
      const today = new Date();
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        if (dates[i] === expected.toDateString()) streak++;
        else break;
      }
    }
    setStats({
      skillsCount: skillsRes.count || 0,
      goalsCount: goalsRes.count || 0,
      streak,
      achievementsCount: achievementsRes.count || 0,
      interestsCount: interestsRes.count || 0,
      journalCount: journalRes.data?.length || 0,
      connectionsCount: connectionsRes.count || 0,
      projectsCount: projectsRes.count || 0,
    });
  };

  const fetchActivity = async () => {
    if (!user) return;
    const [journalRes, skillsRes, interestsRes, projectsRes, achievementsRes] = await Promise.all([
      supabase.from("journal_entries").select("id, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("skills").select("id, name, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("interests").select("id, name, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("projects").select("id, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("achievements").select("id, title, earned_at").eq("user_id", user.id).order("earned_at", { ascending: false }).limit(3),
    ]);
    const items = [
      ...(journalRes.data || []).map(e => ({ id: e.id, type: "journal", title: e.title || "Journal entry", timestamp: e.created_at, icon: "📝" })),
      ...(skillsRes.data || []).map(e => ({ id: e.id, type: "skill", title: `Added skill: ${e.name}`, timestamp: e.created_at, icon: "🎯" })),
      ...(interestsRes.data || []).map(e => ({ id: e.id, type: "interest", title: `New interest: ${e.name}`, timestamp: e.created_at, icon: "🧭" })),
      ...(projectsRes.data || []).map(e => ({ id: e.id, type: "project", title: `Project: ${e.title}`, timestamp: e.created_at, icon: "🚀" })),
      ...(achievementsRes.data || []).map(e => ({ id: e.id, type: "achievement", title: `🏆 ${e.title}`, timestamp: e.earned_at, icon: "🏆" })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);
    setActivity(items);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).eq("is_read", false).order("created_at", { ascending: false }).limit(5);
    setNotifications(data || []);
  };

  const fetchSkills = async () => {
    if (!user) return;
    const { data } = await supabase.from("skills").select("*").eq("user_id", user.id).order("proficiency", { ascending: false }).limit(6);
    setSkills(data || []);
  };

  const fetchMentors = async () => {
    if (!user) return;
    // Get potential mentors from profiles (users with mentor experience)
    const { data } = await supabase.from("profiles").select("id, full_name, avatar_url, industry, career_stage").neq("user_id", user.id).limit(4);
    setMentors(data || []);
  };

  const fetchResources = async () => {
    const { data } = await supabase.from("resources").select("*").eq("intent", "career").limit(4);
    setResources(data || []);
  };

  const fetchRoadmapSteps = async () => {
    if (!user) return;
    const { data } = await supabase.from("roadmap_steps").select("*, roadmaps(title)").eq("user_id", user.id).in("status", ["not_started", "in_progress"]).order("order_index").limit(5);
    setRoadmapSteps(data || []);
  };

  const fetchAISuggestions = async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("coaching-insights", {
        body: {
          type: "dashboard_suggestions",
          context: { profile, stats, skillsCount: stats.skillsCount, interestsCount: stats.interestsCount }
        }
      });
      if (error) throw error;
      setAiSuggestions(data?.suggestions || []);
    } catch (error: any) {
      if (error?.message?.includes("402") || error?.message?.includes("429")) {
        toast.error("AI service temporarily unavailable. Try again later.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const determinePhase = () => {
    const completion = profile?.completion_percentage || 0;
    if (completion < 20) return 0;
    if (completion < 40) return 1;
    if (completion < 60) return 2;
    if (completion < 80) return 3;
    return 4;
  };

  const currentPhase = determinePhase();

  const displayStats = [
    { label: "Goals Done", value: stats.goalsCount, icon: Target, color: "bg-maroon/10 text-maroon" },
    { label: "Skills", value: stats.skillsCount, icon: TrendingUp, color: "bg-blue/10 text-blue" },
    { label: "Streak", value: `${stats.streak}d`, icon: Flame, color: "bg-terracotta/10 text-terracotta" },
    { label: "Interests", value: stats.interestsCount, icon: Compass, color: "bg-primary/10 text-primary" },
    { label: "Badges", value: stats.achievementsCount, icon: Trophy, color: "bg-accent/20 text-accent-foreground" },
    { label: "Connections", value: stats.connectionsCount, icon: Users, color: "bg-indigo/10 text-indigo" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="font-display text-3xl md:text-4xl text-foreground">
          {greeting()}, <em className="text-primary">{profile?.full_name || "Explorer"}</em>
        </h1>
        <p className="font-body text-muted-foreground">
          Welcome back! Here's where you're at — let's keep building.
        </p>
      </motion.div>

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-accent" />
              <span className="font-body text-sm font-semibold text-accent">{notifications.length} new notifications</span>
            </div>
            <Link to="/dashboard/notifications" className="font-body text-xs text-accent hover:underline">View all</Link>
          </div>
          <div className="space-y-1">
            {notifications.slice(0, 2).map(n => (
              <p key={n.id} className="font-body text-xs text-foreground">{n.title}: {n.message}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Nudges / Re-engagement */}
      {nudges.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="space-y-2">
          {nudges.filter(n => n.priority !== "low").slice(0, 3).map((nudge, i) => (
            <Link key={i} to={nudge.action_url} className="block">
              <div className={`rounded-xl border p-4 flex items-start gap-3 transition-all hover:shadow-soft ${
                nudge.priority === "high" ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border"
              }`}>
                <div className={`p-1.5 rounded-lg ${nudge.priority === "high" ? "bg-primary/10" : "bg-muted"}`}>
                  {nudge.type === "celebration" ? <Trophy size={16} className="text-primary" /> :
                   nudge.type === "re_engagement" ? <Bell size={16} className="text-primary" /> :
                   nudge.type === "contextual" ? <Lightbulb size={16} className="text-primary" /> :
                   <Target size={16} className="text-primary" />}
                </div>
                <div className="flex-1">
                  <p className="font-body text-sm font-medium text-foreground">{nudge.title}</p>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">{nudge.message}</p>
                </div>
                <ArrowRight size={14} className="text-muted-foreground mt-1" />
              </div>
            </Link>
          ))}
        </motion.div>
      )}

      {/* Career Readiness Score */}
      {readiness && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue" />
                  Career Readiness
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-3">{readiness.score}%</Badge>
                  <Button variant="ghost" size="sm" onClick={refreshInsights} disabled={insightsLoading}>
                    <RefreshCw size={14} className={insightsLoading ? "animate-spin" : ""} />
                  </Button>
                </div>
              </div>
              <CardDescription>{readiness.level}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={readiness.score} className="h-3 mb-4" />
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {Object.entries(readiness.breakdown).map(([key, value]) => {
                  const iconMap: Record<string, { icon: any; color: string; bg: string }> = {
                    skills: { icon: TrendingUp, color: "text-blue", bg: "bg-blue/10" },
                    interests: { icon: Compass, color: "text-primary", bg: "bg-primary/10" },
                    resume: { icon: FileText, color: "text-terracotta", bg: "bg-terracotta/10" },
                    activity: { icon: Flame, color: "text-maroon", bg: "bg-maroon/10" },
                    goals: { icon: Target, color: "text-indigo", bg: "bg-indigo/10" },
                    roadmap: { icon: Map, color: "text-accent-foreground", bg: "bg-accent/20" },
                  };
                  const cfg = iconMap[key] || { icon: Map, color: "text-primary", bg: "bg-primary/10" };
                  const Icon = cfg.icon;
                  return (
                    <div key={key} className="text-center">
                      <div className={`w-10 h-10 rounded-lg ${cfg.bg} flex items-center justify-center mx-auto mb-1`}>
                        <Icon size={16} className={cfg.color} />
                      </div>
                      <p className="font-body text-[10px] text-muted-foreground capitalize">{key}</p>
                      <p className="font-display text-sm text-foreground">{value}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Recommendations */}
      {recommendations && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.045 }}>
          <Card className="border-primary/10 bg-gradient-to-br from-primary/[0.02] to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo" />
                AI Career Insights
              </CardTitle>
              {recommendations.encouragement && (
                <CardDescription className="text-primary/80">{recommendations.encouragement}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.career_insight && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="font-body text-sm text-foreground">{recommendations.career_insight}</p>
                </div>
              )}

              {recommendations.next_steps?.length > 0 && (
                <div>
                  <h4 className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-2">Recommended Next Steps</h4>
                  <div className="space-y-2">
                    {recommendations.next_steps.map((step, i) => (
                      <Link key={i} to={step.action_url || "/dashboard"} className="block">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/20 transition-all">
                          <div className={`p-1 rounded ${
                            step.priority === "high" ? "bg-primary/10" : "bg-muted"
                          }`}>
                            {step.category === "learning" ? <BookOpen size={14} className="text-primary" /> :
                             step.category === "networking" ? <Users size={14} className="text-primary" /> :
                             step.category === "skills" ? <TrendingUp size={14} className="text-primary" /> :
                             step.category === "experience" ? <Briefcase size={14} className="text-primary" /> :
                             <Heart size={14} className="text-primary" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-body text-sm font-medium text-foreground">{step.title}</p>
                            <p className="font-body text-xs text-muted-foreground mt-0.5">{step.description}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] capitalize">{step.priority}</Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                {recommendations.skill_gaps?.length > 0 && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <h4 className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-2">Skill Gaps to Address</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendations.skill_gaps.map((gap, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{gap}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {recommendations.resume_tips?.length > 0 && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <h4 className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-2">Resume Tips</h4>
                    <ul className="space-y-1">
                      {recommendations.resume_tips.map((tip, i) => (
                        <li key={i} className="font-body text-xs text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 size={10} className="text-primary mt-0.5 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Auto-Resume Summary */}
      {autoResume && (autoResume.skills_summary.length > 0 || autoResume.achievements_summary.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.048 }}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Living Resume Snapshot
                </CardTitle>
                <Link to="/dashboard/living-resume" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Full Resume <ChevronRight size={12} />
                </Link>
              </div>
              <CardDescription>Auto-updated from your activity and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {autoResume.skills_summary.length > 0 && (
                  <div>
                    <h4 className="font-body text-xs text-muted-foreground uppercase mb-2">Top Skills</h4>
                    <div className="space-y-1.5">
                      {autoResume.skills_summary.slice(0, 5).map((skill, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="font-body text-xs text-foreground">{skill.name}</span>
                          <div className="w-16">
                            <Progress value={skill.level || 0} className="h-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {autoResume.interests_summary.length > 0 && (
                  <div>
                    <h4 className="font-body text-xs text-muted-foreground uppercase mb-2">Interest Areas</h4>
                    <div className="flex flex-wrap gap-1">
                      {autoResume.interests_summary.slice(0, 6).map((interest, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px]">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {autoResume.achievements_summary.length > 0 && (
                  <div>
                    <h4 className="font-body text-xs text-muted-foreground uppercase mb-2">Recent Achievements</h4>
                    <div className="space-y-1">
                      {autoResume.achievements_summary.map((ach, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Trophy size={10} className="text-primary" />
                          <span className="font-body text-xs text-foreground">{ach}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {autoResume.totalSteps > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="font-body text-xs text-muted-foreground">
                    Roadmap Progress: {autoResume.completedSteps}/{autoResume.totalSteps} steps
                  </span>
                  <Progress value={(autoResume.completedSteps / autoResume.totalSteps) * 100} className="h-1.5 w-24" />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Map className="h-5 w-5 text-blue" />
              My Journey Snapshot
            </CardTitle>
            <CardDescription>Your current phase in the career development journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {JOURNEY_PHASES.map((phase, i) => {
                const isActive = i === currentPhase;
                const isCompleted = i < currentPhase;
                return (
                  <div key={phase.id} className="flex flex-col items-center min-w-[80px]">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                      isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                      isCompleted ? "bg-green-500/20 text-green-500" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? <CheckCircle2 size={20} /> : <phase.icon size={20} />}
                    </div>
                    <span className={`font-body text-xs text-center ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      {phase.label}
                    </span>
                    {i < JOURNEY_PHASES.length - 1 && (
                      <div className={`absolute h-0.5 w-8 top-6 left-full ${isCompleted ? "bg-green-500" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="font-body text-sm text-muted-foreground mt-4 text-center">
              You're in the <strong className="text-primary">{JOURNEY_PHASES[currentPhase].label}</strong> phase: {JOURNEY_PHASES[currentPhase].description}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-terracotta" />
                My Progress
              </CardTitle>
              <Badge variant="secondary" className="text-lg px-3">{profile?.completion_percentage || 0}%</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={profile?.completion_percentage || 0} className="h-3 mb-6" />
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {displayStats.map(s => (
                <div key={s.label} className="text-center">
                  <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-1`}>
                    <s.icon size={18} />
                  </div>
                  <p className="font-body text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-display text-lg text-foreground">{loading ? "–" : s.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="connections">Network</TabsTrigger>
          <TabsTrigger value="opportunities">Jobs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="font-display text-xl text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {careerQuickActions.map((action, i) => (
                <motion.div key={action.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                  <Link to={action.path} className="group flex flex-col items-center p-5 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-soft transition-all text-center h-full">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${action.color}`}>
                      <action.icon size={22} />
                    </div>
                    <span className="font-body text-sm text-foreground font-medium">{action.label}</span>
                    <span className="font-body text-xs text-muted-foreground mt-1">{action.desc}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SelfGraph Insights + Domain Affinity */}
          <div className="grid md:grid-cols-2 gap-6">
            <SelfInsightsPanel />
            <DomainAffinityWidget />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tasks & Roadmap Steps */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-maroon" />
                  Tasks & Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roadmapSteps.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="mx-auto text-muted-foreground mb-3" size={32} />
                    <p className="font-body text-sm text-muted-foreground">No active tasks</p>
                    <Link to="/dashboard/roadmap" className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline">
                      Create a roadmap <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {roadmapSteps.map(step => (
                      <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className={`w-2 h-2 rounded-full ${step.status === "in_progress" ? "bg-primary" : "bg-muted-foreground"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-foreground truncate">{step.title}</p>
                          <p className="font-body text-xs text-muted-foreground">{step.roadmaps?.title}</p>
                        </div>
                        {step.due_date && (
                          <span className="font-body text-xs text-muted-foreground">
                            {new Date(step.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    AI Recommendations
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={fetchAISuggestions} disabled={aiLoading}>
                    <Sparkles size={14} className={aiLoading ? "animate-spin" : ""} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {aiSuggestions.length === 0 ? (
                  <div className="text-center py-6">
                    <Bot className="mx-auto text-muted-foreground mb-3" size={32} />
                    <p className="font-body text-sm text-muted-foreground">Click the sparkle to get AI suggestions</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">Based on your activity and goals</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                        <Zap className="text-yellow-500 mt-0.5" size={16} />
                        <div>
                          <p className="font-body text-sm text-foreground">{suggestion.title || suggestion}</p>
                          {suggestion.action && (
                            <p className="font-body text-xs text-muted-foreground mt-1">{suggestion.action}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Skills Progress */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Skill Tracker
                </CardTitle>
                <Link to="/dashboard/living-resume" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ChevronRight size={14} />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <div className="text-center py-6">
                  <GraduationCap className="mx-auto text-muted-foreground mb-3" size={32} />
                  <p className="font-body text-sm text-muted-foreground">Add skills to track your growth</p>
                  <Link to="/dashboard/living-resume" className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline">
                    Add skills <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {skills.map(skill => (
                    <div key={skill.id} className="p-3 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body text-sm font-medium truncate">{skill.name}</span>
                        <Badge variant="secondary" className="text-xs">{skill.proficiency || 0}%</Badge>
                      </div>
                      <Progress value={skill.proficiency || 0} className="h-1.5" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="mx-auto text-muted-foreground mb-3" size={32} />
                  <p className="font-body text-muted-foreground">Start exploring to see your activity here!</p>
                  <Link to="/dashboard/curiosity-compass" className="inline-flex items-center gap-2 mt-4 font-body text-sm text-primary font-semibold hover:underline">
                    Get Started <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {activity.map(item => (
                    <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                      <span className="text-lg">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-foreground truncate">{item.title}</p>
                      </div>
                      <span className="font-body text-xs text-muted-foreground whitespace-nowrap">{timeAgo(item.timestamp)}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Tab */}
        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Learning Hub
              </CardTitle>
              <CardDescription>Curated courses and content matched to your interests</CardDescription>
            </CardHeader>
            <CardContent>
              {resources.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto text-muted-foreground mb-3" size={40} />
                  <p className="font-body text-muted-foreground">No resources available yet</p>
                  <Link to="/dashboard/content-library" className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline">
                    Browse Content Library <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {resources.map(resource => (
                    <div key={resource.id} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {resource.resource_type === "video" ? <Play size={18} className="text-primary" /> : <BookOpen size={18} className="text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-body text-sm font-medium truncate">{resource.title}</h4>
                          <p className="font-body text-xs text-muted-foreground line-clamp-2 mt-1">{resource.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{resource.category || "General"}</Badge>
                            <Badge variant="secondary" className="text-xs">{resource.difficulty_level}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Goal Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-sm font-medium">Short-term Goals</span>
                      <Link to="/dashboard/settings" className="text-xs text-primary hover:underline">Edit</Link>
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      {profile?.short_term_goals || "Set your short-term career goals in settings"}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-sm font-medium">Long-term Vision</span>
                      <Link to="/dashboard/settings" className="text-xs text-primary hover:underline">Edit</Link>
                    </div>
                    <p className="font-body text-sm text-muted-foreground">
                      {profile?.long_term_goals || "Define your long-term career vision"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <MoodCheckIn intent="career" />
          </div>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="connections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Mentor Suggestions
              </CardTitle>
              <CardDescription>Connect with mentors aligned to your career goals</CardDescription>
            </CardHeader>
            <CardContent>
              {mentors.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="mx-auto text-muted-foreground mb-3" size={40} />
                  <p className="font-body text-muted-foreground">Mentor matching coming soon</p>
                  <Link to="/dashboard/mentor-matchmaking" className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline">
                    Explore Mentors <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {mentors.map(mentor => (
                    <div key={mentor.id} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {mentor.avatar_url ? (
                          <img src={mentor.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-lg">{mentor.full_name?.[0] || "?"}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body text-sm font-medium truncate">{mentor.full_name || "Anonymous"}</h4>
                        <p className="font-body text-xs text-muted-foreground">{mentor.industry || "Various industries"}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <UserPlus size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Peer Circles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-sm text-muted-foreground mb-4">Join peer groups for collaboration and support</p>
                <Link to="/dashboard/peer-circles">
                  <Button variant="outline" className="w-full">
                    <Users size={14} className="mr-2" />
                    Browse Peer Circles
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <CommunityFeedPreview />
          </div>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          <JobMatchPreview />

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Internship Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-sm">Profile Completion</span>
                    <span className="font-body text-sm font-medium">{profile?.completion_percentage || 0}%</span>
                  </div>
                  <Progress value={profile?.completion_percentage || 0} className="h-2" />
                  <p className="font-body text-xs text-muted-foreground">
                    {(profile?.completion_percentage || 0) >= 70
                      ? "You're ready to apply for internships!"
                      : "Complete your profile to unlock more opportunities"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Resume Builder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Your Living Resume tracks accomplishments automatically
                </p>
                <Link to="/dashboard/living-resume">
                  <Button variant="outline" className="w-full">
                    <FileText size={14} className="mr-2" />
                    View Living Resume
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareerDashboard;
