import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Lightbulb, Wrench, Zap, Rocket, Bot, Globe, Users, ArrowRight, TrendingUp,
  Target, Clock, BookOpen, Trophy, Bell, Brain, Heart, Sparkles, LifeBuoy,
  Presentation, Building2, Navigation, PenLine, Smile, Frown, Meh, Star,
  CheckCircle2, DollarSign, GraduationCap, MessageCircle, Loader2, Plus,
  Compass, BarChart3, Coins, Eye
} from "lucide-react";

interface DashboardStats {
  ideasCount: number;
  activeIdeas: number;
  validatedIdeas: number;
  projectsCount: number;
  challengesCompleted: number;
  activeChallenges: number;
  skillsCount: number;
  achievementsCount: number;
  journalCount: number;
  streak: number;
  connectionsCount: number;
}

interface StartupIdea {
  id: string;
  title: string;
  category: string | null;
  validation_score: number | null;
  is_active: boolean;
  created_at: string;
}

interface MindsetChallenge {
  id: string;
  title: string;
  challenge_type: string;
  status: string;
  started_at: string;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  icon: string;
}

interface AIRecommendation {
  title: string;
  description: string;
  module: string;
  icon_hint: string;
}

interface AIGoalSuggestion {
  title: string;
  description: string;
  category: string;
}

interface AIInsights {
  greeting_nudge: string;
  recommendations: AIRecommendation[];
  goal_suggestions: AIGoalSuggestion[];
  funding_tip: string;
  emotional_check: string;
}

const moodOptions = [
  { emoji: "😊", label: "Energized", value: "energized", icon: Smile },
  { emoji: "😐", label: "Neutral", value: "neutral", icon: Meh },
  { emoji: "😰", label: "Stressed", value: "stressed", icon: Frown },
  { emoji: "🔥", label: "Motivated", value: "motivated", icon: Star },
  { emoji: "💭", label: "Reflective", value: "reflective", icon: Brain },
];

const entrepreneurModules = [
  { label: "Startup Sparks", icon: Lightbulb, path: "/dashboard/startup-sparks", desc: "Capture & validate ideas", color: "bg-accent/20 text-accent-foreground" },
  { label: "Mindset Builder", icon: Zap, path: "/dashboard/mindset-builder", desc: "Build resilience", color: "bg-terracotta/10 text-terracotta" },
  { label: "MVP Builder", icon: Wrench, path: "/dashboard/mvp-builder", desc: "Build prototypes", color: "bg-maroon/10 text-maroon" },
  { label: "Path Selector", icon: Navigation, path: "/dashboard/path-selector", desc: "Choose your direction", color: "bg-blue/10 text-blue" },
  { label: "Startup Lab", icon: Rocket, path: "/dashboard/startup-lab", desc: "Structured learning", color: "bg-terracotta/10 text-terracotta" },
  { label: "AI Coach", icon: Bot, path: "/dashboard/ai-coach", desc: "Get personalized guidance", color: "bg-indigo/10 text-indigo" },
  { label: "Showcase", icon: Presentation, path: "/dashboard/startup-showcase", desc: "Share your work", color: "bg-indigo/10 text-indigo" },
  { label: "Founder Profile", icon: Building2, path: "/dashboard/founder-profile", desc: "Build your identity", color: "bg-primary/10 text-primary" },
  { label: "Startup Profiling", icon: BarChart3, path: "/dashboard/startup-profiling", desc: "Track startup metrics", color: "bg-blue/10 text-blue" },
  { label: "Communities", icon: Globe, path: "/dashboard/startup-communities", desc: "Connect with peers", color: "bg-primary/10 text-primary" },
  { label: "Learning Library", icon: GraduationCap, path: "/dashboard/founders-learning-library", desc: "Curated resources", color: "bg-accent/20 text-accent-foreground" },
  { label: "Support", icon: LifeBuoy, path: "/dashboard/startup-support", desc: "Get help anytime", color: "bg-maroon/10 text-maroon" },
];

const modulePathMap: Record<string, string> = {
  "startup-sparks": "/dashboard/startup-sparks",
  "mindset-builder": "/dashboard/mindset-builder",
  "mvp-builder": "/dashboard/mvp-builder",
  "path-selector": "/dashboard/path-selector",
  "startup-lab": "/dashboard/startup-lab",
  "ai-coach": "/dashboard/ai-coach",
  "startup-showcase": "/dashboard/startup-showcase",
  "founder-profile": "/dashboard/founder-profile",
  "startup-communities": "/dashboard/startup-communities",
  "startup-support": "/dashboard/startup-support",
  "content-library": "/dashboard/founders-learning-library",
  "journal": "/dashboard/journal",
  "startup-profiling": "/dashboard/startup-profiling",
  "inspirations": "/dashboard/inspirations",
  "moodboard": "/dashboard/moodboard",
  "funding-path": "/dashboard/startup-support",
};

const goalCategoryIcons: Record<string, any> = {
  ideation: Lightbulb,
  validation: CheckCircle2,
  building: Wrench,
  mindset: Brain,
  community: Users,
  funding: Coins,
};

const EntrepreneurshipDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    ideasCount: 0, activeIdeas: 0, validatedIdeas: 0, projectsCount: 0,
    challengesCompleted: 0, activeChallenges: 0, skillsCount: 0,
    achievementsCount: 0, journalCount: 0, streak: 0, connectionsCount: 0,
  });
  const [recentIdeas, setRecentIdeas] = useState<StartupIdea[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<MindsetChallenge | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moodNote, setMoodNote] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [savingMood, setSavingMood] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [savedGoals, setSavedGoals] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    fetchAll();

    const channel = supabase
      .channel('entre-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'startup_ideas', filter: `user_id=eq.${user.id}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mindset_challenges', filter: `user_id=eq.${user.id}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetchNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entries', filter: `user_id=eq.${user.id}` }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects', filter: `user_id=eq.${user.id}` }, () => fetchAll())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchAll = () => {
    fetchStats();
    fetchRecentIdeas();
    fetchActiveChallenge();
    fetchActivity();
    fetchNotifications();
    fetchResources();
  };

  const fetchStats = async () => {
    if (!user) return;
    const [ideas, activeIdeasRes, validatedRes, projects, challengesDone, activeChallengesRes, skills, achievements, journal, connections] = await Promise.all([
      supabase.from("startup_ideas").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("startup_ideas").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_active", true),
      supabase.from("startup_ideas").select("id", { count: "exact", head: true }).eq("user_id", user.id).gt("validation_score", 0),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mindset_challenges").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
      supabase.from("mindset_challenges").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active"),
      supabase.from("skills").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("achievements").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("journal_entries").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`).eq("status", "accepted"),
    ]);

    let streak = 0;
    if (journal.data && journal.data.length > 0) {
      const dates = [...new Set(journal.data.map(e => new Date(e.created_at).toDateString()))];
      const today = new Date();
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        if (dates[i] === expected.toDateString()) streak++;
        else break;
      }
    }

    setStats({
      ideasCount: ideas.count || 0,
      activeIdeas: activeIdeasRes.count || 0,
      validatedIdeas: validatedRes.count || 0,
      projectsCount: projects.count || 0,
      challengesCompleted: challengesDone.count || 0,
      activeChallenges: activeChallengesRes.count || 0,
      skillsCount: skills.count || 0,
      achievementsCount: achievements.count || 0,
      journalCount: journal.data?.length || 0,
      streak,
      connectionsCount: connections.count || 0,
    });
    setLoading(false);
  };

  const fetchRecentIdeas = async () => {
    if (!user) return;
    const { data } = await supabase.from("startup_ideas").select("id, title, category, validation_score, is_active, created_at")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(3);
    setRecentIdeas(data || []);
  };

  const fetchActiveChallenge = async () => {
    if (!user) return;
    const { data } = await supabase.from("mindset_challenges").select("*")
      .eq("user_id", user.id).eq("status", "active").order("started_at", { ascending: false }).limit(1).single();
    setActiveChallenge(data as MindsetChallenge | null);
  };

  const fetchActivity = async () => {
    if (!user) return;
    const [journalRes, projectsRes, ideasRes, challengesRes] = await Promise.all([
      supabase.from("journal_entries").select("id, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("projects").select("id, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("startup_ideas").select("id, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("mindset_challenges").select("id, title, completed_at").eq("user_id", user.id).eq("status", "completed").order("completed_at", { ascending: false }).limit(3),
    ]);

    const items: ActivityItem[] = [
      ...(journalRes.data || []).map(e => ({ id: e.id, type: "journal", title: e.title || "Journal reflection", timestamp: e.created_at, icon: "📝" })),
      ...(projectsRes.data || []).map(e => ({ id: e.id, type: "project", title: `MVP: ${e.title}`, timestamp: e.created_at, icon: "🚀" })),
      ...(ideasRes.data || []).map(e => ({ id: e.id, type: "idea", title: `Idea: ${e.title}`, timestamp: e.created_at, icon: "💡" })),
      ...(challengesRes.data || []).map(e => ({ id: e.id, type: "challenge", title: `Completed: ${e.title}`, timestamp: e.completed_at || "", icon: "⚡" })),
    ].filter(i => i.timestamp).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);

    setActivity(items);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).eq("is_read", false).order("created_at", { ascending: false }).limit(5);
    setNotifications(data || []);
  };

  const fetchResources = async () => {
    const { data } = await supabase.from("resources").select("*")
      .or("intent.eq.entrepreneurship,intent.is.null").limit(4).order("created_at", { ascending: false });
    setResources(data || []);
  };

  const fetchAIInsights = async () => {
    if (!user || aiLoading) return;
    setAiLoading(true);
    try {
      const recentMoodEntry = await supabase.from("journal_entries")
        .select("mood").eq("user_id", user.id).not("mood", "is", null)
        .order("created_at", { ascending: false }).limit(1).single();

      const { data, error } = await supabase.functions.invoke("entrepreneur-dashboard-ai", {
        body: {
          context: {
            name: profile?.full_name || "Founder",
            stage: getStageLabel(),
            ideasCount: stats.ideasCount,
            activeIdeas: stats.activeIdeas,
            validatedIdeas: stats.validatedIdeas,
            projectsCount: stats.projectsCount,
            challengesCompleted: stats.challengesCompleted,
            skillsCount: stats.skillsCount,
            achievementsCount: stats.achievementsCount,
            streak: stats.streak,
            connectionsCount: stats.connectionsCount,
            recentMood: recentMoodEntry.data?.mood || "unknown",
            recentIdeas: recentIdeas.map(i => ({ title: i.title, category: i.category })),
          },
        },
      });
      if (error) throw error;
      setAiInsights(data);
    } catch (e) {
      console.error("AI insights error:", e);
      toast.error("Couldn't load AI recommendations right now");
    }
    setAiLoading(false);
  };

  useEffect(() => {
    if (!loading && user && stats) {
      fetchAIInsights();
    }
  }, [loading]);

  const saveReflection = async () => {
    if (!user || !selectedMood) { toast.error("Select a mood first"); return; }
    setSavingMood(true);
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      title: `Mood check: ${selectedMood}`,
      content: moodNote || `Feeling ${selectedMood} today.`,
      mood: selectedMood,
      intent: "entrepreneurship" as any,
      tags: ["mood-check", "dashboard-reflection"],
    });
    if (error) { toast.error("Failed to save reflection"); }
    else {
      toast.success("Reflection saved! 🌱");
      setSelectedMood(null);
      setMoodNote("");
    }
    setSavingMood(false);
  };

  const saveGoalToJournal = async (goal: AIGoalSuggestion) => {
    if (!user) return;
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      title: `Goal: ${goal.title}`,
      content: `**New Goal Set:** ${goal.title}\n\n${goal.description}\n\nCategory: ${goal.category}`,
      tags: ["goal", goal.category, "ai-suggested"],
      intent: "entrepreneurship" as any,
    });
    if (error) { toast.error("Failed to save goal"); }
    else {
      toast.success("Goal saved to your journal! 🎯");
      setSavedGoals(prev => new Set(prev).add(goal.title));
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

  const getStageLabel = () => {
    if (stats.projectsCount > 0) return "Building & Iterating";
    if (stats.validatedIdeas > 0) return "Validating Ideas";
    if (stats.ideasCount > 0) return "Ideation Phase";
    return "Getting Started";
  };

  const getNextSteps = () => {
    const steps: { label: string; path: string; icon: any; done: boolean }[] = [];
    steps.push({ label: "Spark your first idea", path: "/dashboard/startup-sparks", icon: Lightbulb, done: stats.ideasCount > 0 });
    steps.push({ label: "Complete a mindset challenge", path: "/dashboard/mindset-builder", icon: Zap, done: stats.challengesCompleted > 0 });
    steps.push({ label: "Validate an idea with AI", path: "/dashboard/startup-sparks", icon: Brain, done: stats.validatedIdeas > 0 });
    steps.push({ label: "Build your first MVP", path: "/dashboard/mvp-builder", icon: Wrench, done: stats.projectsCount > 0 });
    steps.push({ label: "Join a community", path: "/dashboard/startup-communities", icon: Globe, done: stats.connectionsCount > 0 });
    steps.push({ label: "Create your founder profile", path: "/dashboard/founder-profile", icon: Building2, done: false });
    return steps;
  };

  return (
    <div className="space-y-6">
      {/* Hero Greeting + AI Nudge */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <h1 className="font-display text-3xl md:text-4xl text-foreground">
          {greeting()}, <em className="text-primary">{profile?.full_name || "Founder"}</em>
        </h1>
        <p className="font-body text-muted-foreground">
          Here's where your startup journey takes shape. Let's see where you're headed and what's next.
        </p>
        {aiInsights?.greeting_nudge && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-start gap-2 bg-accent/10 border border-accent/20 rounded-lg px-4 py-3 mt-2">
            <Sparkles size={16} className="text-accent shrink-0 mt-0.5" />
            <p className="font-body text-sm text-foreground">{aiInsights.greeting_nudge}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-accent" />
              <span className="font-body text-sm font-semibold text-accent-foreground">{notifications.length} new</span>
            </div>
            <Link to="/dashboard/notifications" className="font-body text-xs text-accent-foreground hover:underline">View all</Link>
          </div>
          <div className="space-y-1">
            {notifications.slice(0, 3).map(n => (
              <p key={n.id} className="font-body text-xs text-foreground">{n.title}: {n.message}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Personalized Snapshot */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-5 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-body text-xs text-muted-foreground uppercase tracking-wider">Current Stage</p>
                <h2 className="font-display text-xl text-foreground">{getStageLabel()}</h2>
              </div>
              <div className="px-3 py-1 rounded-full bg-terracotta/10 font-body text-xs text-terracotta font-semibold">
                {profile?.completion_percentage || 0}% complete
              </div>
            </div>
            <Progress value={profile?.completion_percentage || 0} className="h-2 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Ideas", value: stats.ideasCount, icon: Lightbulb, sub: `${stats.activeIdeas} active`, color: "text-accent-foreground" },
                { label: "MVPs", value: stats.projectsCount, icon: Rocket, sub: "in progress", color: "text-terracotta" },
                { label: "Challenges", value: stats.challengesCompleted, icon: Zap, sub: `${stats.activeChallenges} active`, color: "text-maroon" },
                { label: "Skills", value: stats.skillsCount, icon: TrendingUp, sub: "mapped", color: "text-blue" },
              ].map(s => (
                <div key={s.label} className="bg-muted/30 rounded-lg p-3 text-center">
                  <s.icon size={16} className={`mx-auto mb-1 ${(s as any).color}`} />
                  <p className="font-display text-lg text-foreground">{loading ? "–" : s.value}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <h3 className="font-display text-sm text-foreground">At a Glance</h3>
            {[
              { label: "Journal Streak", value: `${stats.streak}d`, icon: Clock, color: "text-terracotta" },
              { label: "Achievements", value: stats.achievementsCount, icon: Trophy, color: "text-accent-foreground" },
              { label: "Connections", value: stats.connectionsCount, icon: Users, color: "text-blue" },
              { label: "Reflections", value: stats.journalCount, icon: BookOpen, color: "text-indigo" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <s.icon size={14} className={s.color} />
                  <span className="font-body text-xs text-muted-foreground">{s.label}</span>
                </div>
                <span className="font-display text-sm text-foreground">{loading ? "–" : s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Recommendations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-indigo" />
            <h2 className="font-display text-lg text-foreground">Personalized Recommendations</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchAIInsights} disabled={aiLoading} className="font-body text-xs">
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : "Refresh"}
          </Button>
        </div>
        {aiLoading && !aiInsights ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader2 size={18} className="animate-spin text-primary" />
            <span className="font-body text-sm text-muted-foreground">Analyzing your journey...</span>
          </div>
        ) : aiInsights?.recommendations && aiInsights.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiInsights.recommendations.slice(0, 3).map((rec, i) => (
              <Link key={i} to={modulePathMap[rec.module] || "/dashboard"}
                className="group p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <Compass size={14} className="text-primary" />
                  <h4 className="font-display text-sm text-foreground">{rec.title}</h4>
                </div>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                <span className="inline-flex items-center gap-1 mt-2 font-body text-[10px] text-primary group-hover:underline">
                  Go to {rec.module.replace(/-/g, " ")} <ArrowRight size={10} />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="font-body text-sm text-muted-foreground text-center py-4">AI recommendations will appear as you explore more.</p>
        )}

        {/* Emotional check */}
        {aiInsights?.emotional_check && (
          <div className="mt-4 flex items-start gap-2 bg-muted/30 rounded-lg px-4 py-3">
            <Heart size={14} className="text-primary shrink-0 mt-0.5" />
            <p className="font-body text-xs text-muted-foreground italic">{aiInsights.emotional_check}</p>
          </div>
        )}
      </motion.div>

      {/* Goal Mapping + Funding Tip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goal Suggestions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-maroon" />
            <h3 className="font-display text-lg text-foreground">Suggested Goals</h3>
          </div>
          {aiInsights?.goal_suggestions && aiInsights.goal_suggestions.length > 0 ? (
            <div className="space-y-3">
              {aiInsights.goal_suggestions.map((goal, i) => {
                const Icon = goalCategoryIcons[goal.category] || Target;
                const isSaved = savedGoals.has(goal.title);
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={14} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body text-sm text-foreground font-medium">{goal.title}</h4>
                      <p className="font-body text-[10px] text-muted-foreground mt-0.5">{goal.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" disabled={isSaved}
                      onClick={() => saveGoalToJournal(goal)}
                      className="shrink-0 h-8 w-8 p-0">
                      {isSaved ? <CheckCircle2 size={14} className="text-primary" /> : <Plus size={14} />}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-body text-sm text-muted-foreground text-center py-4">Goal suggestions will appear once AI analyzes your journey.</p>
          )}
        </motion.div>

        {/* Funding Path Preview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-accent-foreground" />
            <h3 className="font-display text-lg text-foreground">Funding & Validation</h3>
          </div>
          {/* Funding tip from AI */}
          {aiInsights?.funding_tip && (
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Coins size={14} className="text-accent-foreground" />
                <span className="font-body text-xs font-semibold text-accent-foreground">AI Funding Tip</span>
              </div>
              <p className="font-body text-xs text-foreground">{aiInsights.funding_tip}</p>
            </div>
          )}
          {/* Stage-aware funding steps */}
          <div className="space-y-2">
            {[
              { label: "Validate your idea first", done: stats.validatedIdeas > 0, path: "/dashboard/startup-sparks", icon: CheckCircle2 },
              { label: "Build a working MVP", done: stats.projectsCount > 0, path: "/dashboard/mvp-builder", icon: Wrench },
              { label: "Showcase your startup", done: false, path: "/dashboard/startup-showcase", icon: Eye },
              { label: "Explore funding paths", done: false, path: "/dashboard/startup-support", icon: Coins },
            ].map((step, i) => (
              <Link key={i} to={step.path}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${step.done ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30 border border-transparent"}`}>
                <step.icon size={14} className={step.done ? "text-primary" : "text-muted-foreground"} />
                <span className={`font-body text-xs ${step.done ? "text-primary line-through" : "text-foreground"}`}>{step.label}</span>
                {!step.done && <ArrowRight size={10} className="text-muted-foreground ml-auto" />}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Milestone Next Steps */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-foreground">Your Startup Milestones</h2>
          <span className="font-body text-xs text-muted-foreground">
            {getNextSteps().filter(s => s.done).length}/{getNextSteps().length} done
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {getNextSteps().map((step, i) => (
            <Link key={i} to={step.path}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                step.done
                  ? "border-primary/20 bg-primary/5"
                  : "border-border hover:border-accent/30 hover:bg-muted/30"
              }`}>
              {step.done ? (
                <CheckCircle2 size={16} className="text-primary shrink-0" />
              ) : (
                <step.icon size={16} className="text-muted-foreground shrink-0" />
              )}
              <span className={`font-body text-xs ${step.done ? "text-primary line-through" : "text-foreground"}`}>
                {step.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Two-column: Ideas + Active Challenge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-foreground">Recent Ideas</h3>
            <Link to="/dashboard/startup-sparks" className="font-body text-xs text-primary hover:underline flex items-center gap-1">
              All ideas <ArrowRight size={10} />
            </Link>
          </div>
          {recentIdeas.length === 0 ? (
            <div className="text-center py-6">
              <Lightbulb size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="font-body text-sm text-muted-foreground">No ideas yet</p>
              <Link to="/dashboard/startup-sparks" className="inline-flex items-center gap-1 mt-2 font-body text-xs text-primary hover:underline">
                Spark your first idea <ArrowRight size={10} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentIdeas.map(idea => (
                <Link key={idea.id} to="/dashboard/startup-sparks"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${idea.is_active ? "bg-accent/10" : "bg-muted"}`}>
                    <Lightbulb size={14} className={idea.is_active ? "text-accent-foreground" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-foreground truncate">{idea.title}</p>
                    {idea.category && <p className="font-body text-[10px] text-muted-foreground">{idea.category}</p>}
                  </div>
                  {idea.validation_score !== null && idea.validation_score > 0 && (
                    <span className="font-body text-xs text-primary font-semibold">{Math.round(idea.validation_score * 100)}%</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-foreground">Mindset & Challenges</h3>
            <Link to="/dashboard/mindset-builder" className="font-body text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight size={10} />
            </Link>
          </div>
          {activeChallenge ? (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-primary" />
                <span className="font-body text-xs text-primary font-semibold uppercase">Active Challenge</span>
              </div>
              <h4 className="font-display text-base text-foreground">{activeChallenge.title}</h4>
              <p className="font-body text-xs text-muted-foreground mt-1">Type: {activeChallenge.challenge_type}</p>
              <Link to="/dashboard/mindset-builder" className="inline-flex items-center gap-1 mt-3 font-body text-xs text-primary hover:underline">
                Continue challenge <ArrowRight size={10} />
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <Zap size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="font-body text-sm text-muted-foreground">No active challenge</p>
              <Link to="/dashboard/mindset-builder" className="inline-flex items-center gap-1 mt-2 font-body text-xs text-primary hover:underline">
                Start a challenge <ArrowRight size={10} />
              </Link>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="font-display text-lg text-foreground">{stats.challengesCompleted}</p>
              <p className="font-body text-[10px] text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg text-foreground">{stats.activeChallenges}</p>
              <p className="font-body text-[10px] text-muted-foreground">In Progress</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Reflection & Mood */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-3">
          <PenLine size={16} className="text-terracotta" />
          <h3 className="font-display text-lg text-foreground">Quick Reflection</h3>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-3">How are you feeling about your startup journey right now?</p>
        <div className="flex gap-2 mb-3">
          {moodOptions.map(m => (
            <button key={m.value} onClick={() => setSelectedMood(m.value)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                selectedMood === m.value ? "bg-primary/10 border border-primary/30" : "bg-muted/30 hover:bg-muted/50"
              }`}>
              <span className="text-lg">{m.emoji}</span>
              <span className="font-body text-[10px] text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>
        {selectedMood && (
          <div className="space-y-2">
            <Textarea placeholder="Add a quick note about what's on your mind..." value={moodNote} onChange={e => setMoodNote(e.target.value)} rows={2} className="text-sm" />
            <Button size="sm" onClick={saveReflection} disabled={savingMood} className="bg-primary text-primary-foreground font-body text-xs">
              {savingMood ? "Saving..." : "Save Reflection"}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Module Navigation Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 className="font-display text-xl text-foreground mb-4">Startup Toolkit</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {entrepreneurModules.map((mod) => (
            <Link key={mod.path} to={mod.path}
              className="group flex flex-col items-center p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-soft transition-all text-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${mod.color}`}>
                <mod.icon size={18} />
              </div>
              <span className="font-body text-xs text-foreground font-medium">{mod.label}</span>
              <span className="font-body text-[10px] text-muted-foreground mt-0.5">{mod.desc}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Two-column: Activity + Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display text-lg text-foreground mb-3">Recent Activity</h3>
          {activity.length === 0 ? (
            <div className="text-center py-6">
              <Sparkles size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="font-body text-sm text-muted-foreground">Start exploring to see your activity here!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activity.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="text-base">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs text-foreground truncate">{item.title}</p>
                  </div>
                  <span className="font-body text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(item.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display text-lg text-foreground mb-3">Support & Coaching</h3>
          <p className="font-body text-xs text-muted-foreground mb-4">Feeling stuck or overwhelmed? We're here to help.</p>
          <div className="space-y-2">
            <Link to="/dashboard/ai-coach" className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-all">
              <Bot size={18} className="text-primary" />
              <div>
                <p className="font-body text-sm text-foreground font-medium">AI Coach</p>
                <p className="font-body text-[10px] text-muted-foreground">Get personalized guidance</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground ml-auto" />
            </Link>
            <Link to="/dashboard/startup-support" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-all">
              <LifeBuoy size={18} className="text-primary" />
              <div>
                <p className="font-body text-sm text-foreground font-medium">Startup Support</p>
                <p className="font-body text-[10px] text-muted-foreground">Troubleshooting & expert help</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground ml-auto" />
            </Link>
            <Link to="/dashboard/startup-communities" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-all">
              <MessageCircle size={18} className="text-primary" />
              <div>
                <p className="font-body text-sm text-foreground font-medium">Community Help</p>
                <p className="font-body text-[10px] text-muted-foreground">Connect with fellow founders</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground ml-auto" />
            </Link>
            <Link to="/dashboard/journal" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-all">
              <Heart size={18} className="text-primary" />
              <div>
                <p className="font-body text-sm text-foreground font-medium">Journal & Reflect</p>
                <p className="font-body text-[10px] text-muted-foreground">Process your thoughts</p>
              </div>
              <ArrowRight size={14} className="text-muted-foreground ml-auto" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Resource Feed */}
      {resources.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-foreground">Recommended Resources</h3>
            <Link to="/dashboard/founders-learning-library" className="font-body text-xs text-primary hover:underline flex items-center gap-1">
              Browse library <ArrowRight size={10} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resources.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <GraduationCap size={16} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-body text-sm text-foreground">{r.title}</p>
                  {r.description && <p className="font-body text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{r.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {r.difficulty_level && <span className="font-body text-[10px] text-primary">{r.difficulty_level}</span>}
                    {r.resource_type && <span className="font-body text-[10px] text-muted-foreground">{r.resource_type}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EntrepreneurshipDashboard;
