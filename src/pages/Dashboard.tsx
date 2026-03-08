import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import {
  Compass, Map, Brain, FileText, Sparkles, Lightbulb, Wrench, User, Zap, Rocket,
  ArrowRight, TrendingUp, Target, Clock, BookOpen, Trophy, Bell
} from "lucide-react";

const careerQuickActions = [
  { label: "Curiosity Compass", icon: Compass, path: "/dashboard/curiosity-compass", color: "bg-accent/10 text-accent" },
  { label: "AI Roadmap", icon: Map, path: "/dashboard/roadmap", color: "bg-primary/10 text-primary" },
  { label: "SelfGraph™", icon: Brain, path: "/dashboard/selfgraph", color: "bg-accent/10 text-accent" },
  { label: "Living Resume", icon: FileText, path: "/dashboard/living-resume", color: "bg-primary/10 text-primary" },
  { label: "Explore", icon: Sparkles, path: "/dashboard/explore", color: "bg-accent/10 text-accent" },
];

const entrepreneurshipQuickActions = [
  { label: "Startup Sparks", icon: Lightbulb, path: "/dashboard/startup-sparks", color: "bg-accent/10 text-accent" },
  { label: "MVP Builder", icon: Wrench, path: "/dashboard/mvp-builder", color: "bg-primary/10 text-primary" },
  { label: "Founder Profile", icon: User, path: "/dashboard/founder-profile", color: "bg-accent/10 text-accent" },
  { label: "Mindset Builder", icon: Zap, path: "/dashboard/mindset-builder", color: "bg-primary/10 text-primary" },
  { label: "Startup Lab", icon: Rocket, path: "/dashboard/startup-lab", color: "bg-accent/10 text-accent" },
];

interface Stats {
  skillsCount: number;
  goalsCount: number;
  streak: number;
  achievementsCount: number;
  interestsCount: number;
  journalCount: number;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  icon: string;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const isCareer = profile?.active_intent === "career";
  const quickActions = isCareer ? careerQuickActions : entrepreneurshipQuickActions;
  const [stats, setStats] = useState<Stats>({ skillsCount: 0, goalsCount: 0, streak: 0, achievementsCount: 0, interestsCount: 0, journalCount: 0 });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchStats();
    fetchActivity();
    fetchNotifications();

    // Realtime subscriptions
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skills', filter: `user_id=eq.${user.id}` }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'interests', filter: `user_id=eq.${user.id}` }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements', filter: `user_id=eq.${user.id}` }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'journal_entries', filter: `user_id=eq.${user.id}` }, () => { fetchStats(); fetchActivity(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetchNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    const [skillsRes, goalsRes, achievementsRes, interestsRes, journalRes] = await Promise.all([
      supabase.from("skills").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("roadmap_steps").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
      supabase.from("achievements").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("interests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("journal_entries").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
    ]);

    // Calculate streak from journal entries
    let streak = 0;
    if (journalRes.data && journalRes.data.length > 0) {
      const dates = [...new Set(journalRes.data.map(e => new Date(e.created_at).toDateString()))];
      const today = new Date();
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date(today);
        expected.setDate(expected.getDate() - i);
        if (dates[i] === expected.toDateString()) {
          streak++;
        } else break;
      }
    }

    setStats({
      skillsCount: skillsRes.count || 0,
      goalsCount: goalsRes.count || 0,
      streak,
      achievementsCount: achievementsRes.count || 0,
      interestsCount: interestsRes.count || 0,
      journalCount: journalRes.data?.length || 0,
    });
    setLoading(false);
  };

  const fetchActivity = async () => {
    if (!user) return;
    const [journalRes, skillsRes, interestsRes, projectsRes] = await Promise.all([
      supabase.from("journal_entries").select("id, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("skills").select("id, name, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("interests").select("id, name, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      supabase.from("projects").select("id, title, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
    ]);

    const items: ActivityItem[] = [
      ...(journalRes.data || []).map(e => ({ id: e.id, type: "journal", title: e.title || "Journal entry", timestamp: e.created_at, icon: "📝" })),
      ...(skillsRes.data || []).map(e => ({ id: e.id, type: "skill", title: `Added skill: ${e.name}`, timestamp: e.created_at, icon: "🎯" })),
      ...(interestsRes.data || []).map(e => ({ id: e.id, type: "interest", title: `New interest: ${e.name}`, timestamp: e.created_at, icon: "🧭" })),
      ...(projectsRes.data || []).map(e => ({ id: e.id, type: "project", title: `Project: ${e.title}`, timestamp: e.created_at, icon: "🚀" })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

    setActivity(items);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(5);
    setNotifications(data || []);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="font-display text-3xl md:text-4xl text-foreground">
          {greeting()}, <em className="text-gradient-warm">{profile?.full_name || "Explorer"}</em>
        </h1>
        <p className="font-body text-muted-foreground">
          {isCareer ? "Your career journey awaits." : "Your startup journey awaits."}
        </p>
      </motion.div>

      {/* Notifications Banner */}
      {notifications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/10 border border-accent/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={16} className="text-accent" />
            <span className="font-body text-sm font-semibold text-accent">{notifications.length} new notification{notifications.length > 1 ? "s" : ""}</span>
          </div>
          <div className="space-y-1">
            {notifications.slice(0, 3).map(n => (
              <p key={n.id} className="font-body text-xs text-foreground">{n.title}: {n.message}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress + Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Your Progress</h2>
          <span className="font-body text-sm text-accent font-semibold">{profile?.completion_percentage || 0}%</span>
        </div>
        <Progress value={profile?.completion_percentage || 0} className="h-2" />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-6">
          {[
            { label: "Goals Done", value: stats.goalsCount, icon: Target, color: "bg-accent/10 text-accent" },
            { label: "Skills", value: stats.skillsCount, icon: TrendingUp, color: "bg-primary/10 text-primary" },
            { label: "Streak", value: `${stats.streak}d`, icon: Clock, color: "bg-accent/10 text-accent" },
            { label: "Interests", value: stats.interestsCount, icon: Compass, color: "bg-primary/10 text-primary" },
            { label: "Badges", value: stats.achievementsCount, icon: Trophy, color: "bg-accent/10 text-accent" },
            { label: "Journals", value: stats.journalCount, icon: BookOpen, color: "bg-primary/10 text-primary" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mx-auto mb-1`}>
                <s.icon size={18} />
              </div>
              <p className="font-body text-xs text-muted-foreground">{s.label}</p>
              <p className="font-display text-lg text-foreground">{loading ? "–" : s.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-xl text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action, i) => (
            <motion.div key={action.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Link to={action.path} className="group flex flex-col items-center p-5 bg-card rounded-xl border border-border hover:border-accent/30 hover:shadow-soft transition-all text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${action.color}`}>
                  <action.icon size={22} />
                </div>
                <span className="font-body text-sm text-foreground font-medium">{action.label}</span>
                <ArrowRight size={14} className="text-muted-foreground mt-2 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4">Recent Activity</h2>
        {activity.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="mx-auto text-muted-foreground mb-3" size={32} />
            <p className="font-body text-muted-foreground">Start exploring to see your activity here!</p>
            <Link to={isCareer ? "/dashboard/curiosity-compass" : "/dashboard/startup-sparks"} className="inline-flex items-center gap-2 mt-4 font-body text-sm text-accent font-semibold hover:underline">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.map((item) => (
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
      </div>
    </div>
  );
};

export default Dashboard;
