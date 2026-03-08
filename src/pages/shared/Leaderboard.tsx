import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  Trophy, Medal, Star, Sparkles, Award, TrendingUp, Target, Flame,
  BookOpen, Rocket, Users, Brain, Lightbulb, Shield, Heart, Zap,
  Crown, Gift, ArrowRight, ChevronRight, X
} from "lucide-react";

// ── Badge definitions ──────────────────────────────────────────────

type BadgeCategory = "exploration" | "learning" | "building" | "collaboration" | "resilience" | "funding" | "community" | "leadership";

interface BadgeTemplate {
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: BadgeCategory;
}

const BADGE_TEMPLATES: BadgeTemplate[] = [
  // Exploration
  { type: "first_interest", title: "Curiosity Spark", description: "Added your first interest", icon: "🧭", points: 10, category: "exploration" },
  { type: "ten_interests", title: "Explorer", description: "Mapped 10+ interests", icon: "🌟", points: 25, category: "exploration" },
  { type: "first_observation", title: "Problem Spotter", description: "Logged your first problem observation", icon: "🔍", points: 15, category: "exploration" },
  { type: "first_idea_card", title: "Idea Collector", description: "Interacted with your first idea card", icon: "💡", points: 10, category: "exploration" },
  { type: "first_startup_idea", title: "Visionary", description: "Created your first startup idea", icon: "🎯", points: 20, category: "exploration" },

  // Learning
  { type: "first_journal", title: "Reflector", description: "Wrote your first journal entry", icon: "📝", points: 10, category: "learning" },
  { type: "five_journals", title: "Deep Thinker", description: "Wrote 5 journal entries", icon: "📓", points: 30, category: "learning" },
  { type: "first_learning_track", title: "Student", description: "Started a learning track", icon: "📚", points: 15, category: "learning" },
  { type: "first_capsule", title: "Knowledge Seeker", description: "Completed a learning capsule", icon: "🎓", points: 15, category: "learning" },

  // Building
  { type: "first_project", title: "Creator", description: "Started your first project", icon: "🚀", points: 20, category: "building" },
  { type: "first_lab_plan", title: "Lab Scientist", description: "Created your first lab plan", icon: "🧪", points: 20, category: "building" },
  { type: "first_experiment", title: "Experimenter", description: "Ran your first MVP experiment", icon: "⚗️", points: 25, category: "building" },
  { type: "first_milestone", title: "Milestone Maker", description: "Completed your first milestone", icon: "🏁", points: 20, category: "building" },
  { type: "first_validation", title: "Validator", description: "Completed a validation sprint", icon: "✅", points: 30, category: "building" },

  // Collaboration
  { type: "first_connection", title: "Networker", description: "Made your first connection", icon: "🤝", points: 15, category: "collaboration" },
  { type: "five_connections", title: "Connector", description: "Made 5 connections", icon: "🌐", points: 35, category: "collaboration" },
  { type: "first_community_join", title: "Community Member", description: "Joined your first community", icon: "👥", points: 10, category: "community" },
  { type: "first_post", title: "Voice Found", description: "Published your first community post", icon: "📢", points: 15, category: "community" },
  { type: "five_posts", title: "Thought Leader", description: "Published 5 community posts", icon: "🎤", points: 35, category: "community" },

  // Resilience
  { type: "first_checkin", title: "Self-Aware", description: "Completed your first mood check-in", icon: "🧘", points: 10, category: "resilience" },
  { type: "five_checkins", title: "Emotionally Intelligent", description: "Completed 5 mood check-ins", icon: "💪", points: 30, category: "resilience" },
  { type: "first_habit", title: "Habit Former", description: "Created your first mindset habit", icon: "🌱", points: 15, category: "resilience" },
  { type: "first_challenge", title: "Challenge Accepted", description: "Started a mindset challenge", icon: "⚔️", points: 20, category: "resilience" },

  // Leadership & Profiles
  { type: "first_roadmap", title: "Pathfinder", description: "Created your first roadmap", icon: "🗺️", points: 15, category: "leadership" },
  { type: "founder_profile", title: "Founder Identity", description: "Completed your founder profile", icon: "👤", points: 20, category: "leadership" },
  { type: "first_path", title: "Direction Set", description: "Selected your first entrepreneurial path", icon: "🧭", points: 20, category: "leadership" },
  { type: "first_moodboard", title: "Vision Architect", description: "Created your first moodboard", icon: "🎨", points: 15, category: "leadership" },

  // Skills
  { type: "five_skills", title: "Skill Builder", description: "Added 5 skills", icon: "🎯", points: 25, category: "learning" },
  { type: "ten_skills", title: "Skill Master", description: "Added 10 skills", icon: "🏅", points: 50, category: "learning" },

  // Streaks
  { type: "streak_3", title: "Consistent", description: "3-day activity streak", icon: "🔥", points: 30, category: "resilience" },
  { type: "streak_7", title: "Dedicated", description: "7-day activity streak", icon: "⚡", points: 50, category: "resilience" },

  // Milestones
  { type: "hundred_points", title: "Centurion", description: "Earned 100 total points", icon: "💯", points: 25, category: "leadership" },
  { type: "five_hundred_points", title: "Legend", description: "Earned 500 total points", icon: "👑", points: 50, category: "leadership" },
];

const CATEGORY_META: Record<BadgeCategory, { label: string; icon: React.ElementType; color: string }> = {
  exploration: { label: "Exploration", icon: Lightbulb, color: "text-amber-500" },
  learning: { label: "Learning", icon: BookOpen, color: "text-blue-500" },
  building: { label: "Building", icon: Rocket, color: "text-emerald-500" },
  collaboration: { label: "Collaboration", icon: Users, color: "text-violet-500" },
  resilience: { label: "Resilience", icon: Shield, color: "text-rose-500" },
  funding: { label: "Funding", icon: Star, color: "text-yellow-500" },
  community: { label: "Community", icon: Heart, color: "text-pink-500" },
  leadership: { label: "Leadership", icon: Crown, color: "text-orange-500" },
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [progressAnalysis, setProgressAnalysis] = useState<any>(null);

  useEffect(() => {
    fetchAchievements();
    checkAndAwardBadges();

    const channel = supabase
      .channel("achievements-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "achievements", filter: `user_id=eq.${user!.id}` }, () => fetchAchievements())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAchievements = async () => {
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user!.id)
      .order("earned_at", { ascending: false });
    setAchievements(data || []);
    setTotalPoints((data || []).reduce((sum: number, a: any) => sum + (a.points || 0), 0));
    setLoading(false);
  };

  const checkAndAwardBadges = async () => {
    if (!user) return;

    const [
      interestsRes, skillsRes, journalRes, projectsRes, roadmapsRes, connectionsRes,
      observationsRes, ideasRes, ideaCardsRes, labPlansRes, experimentsRes, validationsRes,
      checkinsRes, habitsRes, challengesRes, communitiesRes, postsRes, pathsRes, moodboardsRes,
      learningRes,
    ] = await Promise.all([
      supabase.from("interests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("skills").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("roadmaps").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
      supabase.from("problem_observations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("startup_ideas").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("idea_card_interactions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("lab_plans").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mvp_experiments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("validation_sprints").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("coaching_checkins").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mindset_habits").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mindset_challenges").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("community_members").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("path_selections").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("moodboards").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("learning_track_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);

    const { data: existing } = await supabase.from("achievements").select("achievement_type").eq("user_id", user.id);
    const earned = new Set((existing || []).map((a: any) => a.achievement_type));

    const c = (r: any) => r.count || 0;

    const checks: [string, boolean][] = [
      ["first_interest", c(interestsRes) >= 1],
      ["ten_interests", c(interestsRes) >= 10],
      ["five_skills", c(skillsRes) >= 5],
      ["ten_skills", c(skillsRes) >= 10],
      ["first_journal", c(journalRes) >= 1],
      ["five_journals", c(journalRes) >= 5],
      ["first_project", c(projectsRes) >= 1],
      ["first_roadmap", c(roadmapsRes) >= 1],
      ["first_connection", c(connectionsRes) >= 1],
      ["five_connections", c(connectionsRes) >= 5],
      ["first_observation", c(observationsRes) >= 1],
      ["first_startup_idea", c(ideasRes) >= 1],
      ["first_idea_card", c(ideaCardsRes) >= 1],
      ["first_lab_plan", c(labPlansRes) >= 1],
      ["first_experiment", c(experimentsRes) >= 1],
      ["first_validation", c(validationsRes) >= 1],
      ["first_checkin", c(checkinsRes) >= 1],
      ["five_checkins", c(checkinsRes) >= 5],
      ["first_habit", c(habitsRes) >= 1],
      ["first_challenge", c(challengesRes) >= 1],
      ["first_community_join", c(communitiesRes) >= 1],
      ["first_post", c(postsRes) >= 1],
      ["five_posts", c(postsRes) >= 5],
      ["first_path", c(pathsRes) >= 1],
      ["first_moodboard", c(moodboardsRes) >= 1],
      ["first_learning_track", c(learningRes) >= 1],
    ];

    // Check founder profile
    const { data: fp } = await supabase.from("founder_profiles").select("id").eq("user_id", user.id).maybeSingle();
    if (fp) checks.push(["founder_profile", true]);

    const toAward = checks
      .filter(([type, met]) => met && !earned.has(type))
      .map(([type]) => BADGE_TEMPLATES.find(b => b.type === type))
      .filter(Boolean) as BadgeTemplate[];

    // Points milestones
    const currentPts = (existing || []).reduce((s: number, a: any) => {
      const tmpl = BADGE_TEMPLATES.find(b => b.type === a.achievement_type);
      return s + (tmpl?.points || 0);
    }, 0);
    if (currentPts >= 100 && !earned.has("hundred_points")) {
      const b = BADGE_TEMPLATES.find(t => t.type === "hundred_points");
      if (b) toAward.push(b);
    }
    if (currentPts >= 500 && !earned.has("five_hundred_points")) {
      const b = BADGE_TEMPLATES.find(t => t.type === "five_hundred_points");
      if (b) toAward.push(b);
    }

    if (toAward.length > 0) {
      await supabase.from("achievements").insert(
        toAward.map(b => ({
          user_id: user.id,
          achievement_type: b.type,
          title: b.title,
          description: b.description,
          points: b.points,
        }))
      );
      fetchAchievements();
      if (toAward.length <= 3) {
        toAward.forEach(b => toast({ title: `🎉 Badge Earned: ${b.title}!`, description: b.description }));
      } else {
        toast({ title: `🎉 ${toAward.length} new badges earned!` });
      }
    }
  };

  const earnedTypes = useMemo(() => new Set(achievements.map((a: any) => a.achievement_type)), [achievements]);

  const filteredBadges = useMemo(() => {
    if (categoryFilter === "all") return BADGE_TEMPLATES;
    return BADGE_TEMPLATES.filter(b => b.category === categoryFilter);
  }, [categoryFilter]);

  const earnedCount = filteredBadges.filter(b => earnedTypes.has(b.type)).length;
  const progressPercent = filteredBadges.length > 0 ? Math.round((earnedCount / filteredBadges.length) * 100) : 0;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, { earned: number; total: number }> = {};
    for (const cat of Object.keys(CATEGORY_META)) {
      const total = BADGE_TEMPLATES.filter(b => b.category === cat).length;
      const earnedCat = BADGE_TEMPLATES.filter(b => b.category === cat && earnedTypes.has(b.type)).length;
      counts[cat] = { earned: earnedCat, total };
    }
    return counts;
  }, [earnedTypes]);

  const nextToUnlock = useMemo(() => {
    return BADGE_TEMPLATES.filter(b => !earnedTypes.has(b.type)).slice(0, 4);
  }, [earnedTypes]);

  const recentAchievements = achievements.slice(0, 5);

  const getAiSuggestions = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("achievements-ai", {
        body: {
          type: "next_steps",
          context: {
            earned: achievements.map((a: any) => a.achievement_type),
            totalPoints,
            badgeCount: achievements.length,
            totalBadges: BADGE_TEMPLATES.length,
          },
        },
      });
      if (error) throw error;
      setAiSuggestions(data);
    } catch {
      toast({ title: "Could not get suggestions", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const getProgressAnalysis = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("achievements-ai", {
        body: {
          type: "progress_analysis",
          context: {
            earned: achievements.map((a: any) => ({ type: a.achievement_type, date: a.earned_at })),
            totalPoints,
            categories: categoryCounts,
          },
        },
      });
      if (error) throw error;
      setProgressAnalysis(data);
    } catch {
      toast({ title: "Could not analyze progress", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const level = totalPoints < 50 ? "Newcomer" : totalPoints < 150 ? "Explorer" : totalPoints < 300 ? "Builder" : totalPoints < 500 ? "Innovator" : "Legend";
  const levelIcon = totalPoints < 50 ? "🌱" : totalPoints < 150 ? "🧭" : totalPoints < 300 ? "🔨" : totalPoints < 500 ? "💡" : "👑";

  return (
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-rose-500/20 border border-amber-500/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <span className="text-sm font-medium text-amber-600">Achievements & Leaderboard</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Every step counts.</h1>
          <p className="text-muted-foreground max-w-2xl">See how far you've come, celebrate progress, and join others on the journey to build something extraordinary.</p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Medal, label: "Total Points", value: totalPoints, accent: true },
          { icon: Star, label: "Badges Earned", value: `${achievements.length}/${BADGE_TEMPLATES.length}` },
          { icon: Zap, label: "Level", value: `${levelIcon} ${level}` },
          { icon: Target, label: "Progress", value: `${Math.round((achievements.length / BADGE_TEMPLATES.length) * 100)}%` },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
            <Card className="text-center p-4">
              <stat.icon className={`mx-auto mb-2 h-6 w-6 ${stat.accent ? "text-amber-500" : "text-muted-foreground"}`} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Overall progress bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">{achievements.length} / {BADGE_TEMPLATES.length} badges</span>
        </div>
        <Progress value={(achievements.length / BADGE_TEMPLATES.length) * 100} className="h-3" />
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview" className="gap-1"><Trophy className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="badges" className="gap-1"><Award className="h-4 w-4" /> All Badges</TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1"><TrendingUp className="h-4 w-4" /> Leaderboard</TabsTrigger>
          <TabsTrigger value="insights" className="gap-1"><Sparkles className="h-4 w-4" /> AI Insights</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* Category breakdown */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Progress by Category</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(CATEGORY_META).map(([key, meta]) => {
                const Icon = meta.icon;
                const ct = categoryCounts[key] || { earned: 0, total: 0 };
                const pct = ct.total > 0 ? Math.round((ct.earned / ct.total) * 100) : 0;
                return (
                  <Card key={key} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setCategoryFilter(key); setTab("badges"); }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${meta.color}`} />
                      <span className="font-medium text-sm">{meta.label}</span>
                    </div>
                    <Progress value={pct} className="h-2 mb-1" />
                    <p className="text-xs text-muted-foreground">{ct.earned}/{ct.total} badges • {pct}%</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent achievements */}
          {recentAchievements.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Recently Earned</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {recentAchievements.map((a: any, i: number) => {
                  const tmpl = BADGE_TEMPLATES.find(b => b.type === a.achievement_type);
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="p-4 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{tmpl?.icon || "🏆"}</span>
                          <div>
                            <h3 className="font-semibold text-foreground">{a.title}</h3>
                            <p className="text-xs text-muted-foreground">{a.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">+{a.points} pts</Badge>
                              <span className="text-[10px] text-muted-foreground">{new Date(a.earned_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Next to unlock */}
          {nextToUnlock.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Target className="h-5 w-5" /> Next to Unlock</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {nextToUnlock.map((badge, i) => {
                  const catMeta = CATEGORY_META[badge.category];
                  return (
                    <Card key={badge.type} className="p-4 opacity-75 hover:opacity-100 transition-opacity">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl grayscale">{badge.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">{badge.title}</h3>
                            <Badge variant="outline" className="text-[10px]">{catMeta.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                          <span className="text-xs text-amber-600 font-semibold">+{badge.points} pts</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── All Badges ── */}
        <TabsContent value="badges" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{earnedCount}/{filteredBadges.length} earned • {progressPercent}%</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge, i) => {
              const isEarned = earnedTypes.has(badge.type);
              const earnedData = achievements.find((a: any) => a.achievement_type === badge.type);
              const catMeta = CATEGORY_META[badge.category];
              const CatIcon = catMeta.icon;

              return (
                <motion.div key={badge.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className={`p-5 transition-all ${isEarned ? "border-amber-500/30 bg-amber-500/5 shadow-sm" : "opacity-50 hover:opacity-75"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`text-3xl ${!isEarned ? "grayscale" : ""}`}>{badge.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{badge.title}</h3>
                          {isEarned && <Award className="h-4 w-4 text-amber-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-[10px] gap-1"><CatIcon className={`h-3 w-3 ${catMeta.color}`} />{catMeta.label}</Badge>
                          <span className="text-xs text-amber-600 font-semibold">+{badge.points} pts</span>
                        </div>
                        {isEarned && earnedData && (
                          <p className="text-[10px] text-muted-foreground mt-1">Earned {new Date(earnedData.earned_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Leaderboard ── */}
        <TabsContent value="leaderboard" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl">
                {levelIcon}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Your Ranking</h3>
                <p className="text-sm text-muted-foreground">Level: {level} • {totalPoints} points • {achievements.length} badges</p>
              </div>
            </div>
            <Progress value={(achievements.length / BADGE_TEMPLATES.length) * 100} className="h-3 mb-2" />
            <p className="text-xs text-muted-foreground">
              {achievements.length < BADGE_TEMPLATES.length
                ? `${BADGE_TEMPLATES.length - achievements.length} more badges to complete your collection!`
                : "🎉 You've collected all badges! You're a true legend!"}
            </p>
          </Card>

          {/* Level tiers */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Level Tiers</h2>
            <div className="space-y-2">
              {[
                { name: "Newcomer", icon: "🌱", min: 0, max: 49 },
                { name: "Explorer", icon: "🧭", min: 50, max: 149 },
                { name: "Builder", icon: "🔨", min: 150, max: 299 },
                { name: "Innovator", icon: "💡", min: 300, max: 499 },
                { name: "Legend", icon: "👑", min: 500, max: Infinity },
              ].map(tier => {
                const isCurrent = level === tier.name;
                return (
                  <Card key={tier.name} className={`p-3 flex items-center gap-3 ${isCurrent ? "border-amber-500/30 bg-amber-500/5" : ""}`}>
                    <span className="text-2xl">{tier.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tier.name}</span>
                        {isCurrent && <Badge className="text-[10px]">Current</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{tier.max === Infinity ? `${tier.min}+ pts` : `${tier.min}–${tier.max} pts`}</span>
                    </div>
                    {isCurrent && <ChevronRight className="h-4 w-4 text-amber-500" />}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Community challenge */}
          <Card className="p-5 border-dashed">
            <div className="flex items-start gap-3">
              <Gift className="h-8 w-8 text-muted-foreground" />
              <div>
                <h3 className="font-semibold text-foreground">Community Challenges</h3>
                <p className="text-sm text-muted-foreground">Weekly challenges and peer competitions coming soon! Earn bonus points and special badges by participating in community-wide events.</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── AI Insights ── */}
        <TabsContent value="insights" className="space-y-4 mt-4">
          <div className="flex gap-3">
            <Button onClick={getAiSuggestions} disabled={aiLoading} className="gap-2">
              <Sparkles className="h-4 w-4" /> Get Next Steps
            </Button>
            <Button onClick={getProgressAnalysis} disabled={aiLoading} variant="outline" className="gap-2">
              <Brain className="h-4 w-4" /> Analyze Progress
            </Button>
          </div>

          <AnimatePresence>
            {aiSuggestions && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-amber-500/30">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-amber-500" /> Suggested Next Steps</CardTitle>
                      {aiSuggestions.encouragement && <CardDescription>{aiSuggestions.encouragement}</CardDescription>}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setAiSuggestions(null)}><X className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiSuggestions.suggestions?.map((s: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowRight className="h-4 w-4 text-amber-500" />
                          <span className="font-medium text-sm">{s.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px]">{s.estimated_effort}</Badge>
                        </div>
                      </div>
                    ))}
                    {aiSuggestions.streak_tip && <p className="text-xs text-muted-foreground border-t pt-2">💡 {aiSuggestions.streak_tip}</p>}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {progressAnalysis && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-blue-500/30">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2"><Brain className="h-5 w-5 text-blue-500" /> Progress Analysis</CardTitle>
                      {progressAnalysis.celebration_message && <CardDescription>{progressAnalysis.celebration_message}</CardDescription>}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setProgressAnalysis(null)}><X className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {progressAnalysis.strength_areas?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">💪 Strengths</h4>
                        <div className="flex flex-wrap gap-1">
                          {progressAnalysis.strength_areas.map((s: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}
                        </div>
                      </div>
                    )}
                    {progressAnalysis.growth_areas?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">🌱 Growth Areas</h4>
                        <div className="flex flex-wrap gap-1">
                          {progressAnalysis.growth_areas.map((s: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}
                        </div>
                      </div>
                    )}
                    {progressAnalysis.personalized_challenge && (
                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                        <h4 className="text-sm font-medium mb-1">🎯 Personal Challenge</h4>
                        <p className="text-sm text-muted-foreground">{progressAnalysis.personalized_challenge}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!aiSuggestions && !progressAnalysis && (
            <Card className="p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Click a button above to get AI-powered insights about your achievement journey.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
