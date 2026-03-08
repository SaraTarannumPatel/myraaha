import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Trophy, Medal, Star, Sparkles, Award, TrendingUp, Target, Flame,
  BookOpen, Rocket, Users, Brain, Lightbulb, Shield, Heart, Zap,
  Crown, Gift, ArrowRight, ChevronRight, X, Calendar, BarChart3,
  Share2, MessageSquare, Send, Copy, CheckCircle2, GraduationCap,
  Briefcase, UserCheck
} from "lucide-react";

// ── Badge system ──────────────────────────────────────────
type BadgeCategory = "exploration" | "learning" | "building" | "collaboration" | "resilience" | "funding" | "community" | "leadership";

interface BadgeTemplate {
  type: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  category: BadgeCategory;
  linkedFeature?: string;
  linkedRoute?: string;
}

const BADGE_TEMPLATES: BadgeTemplate[] = [
  // Exploration
  { type: "first_interest", title: "Curiosity Spark", description: "Added your first interest", icon: "🧭", points: 10, category: "exploration", linkedFeature: "Curiosity Compass", linkedRoute: "/dashboard/curiosity-compass" },
  { type: "ten_interests", title: "Explorer", description: "Mapped 10+ interests", icon: "🌟", points: 25, category: "exploration", linkedFeature: "Curiosity Compass", linkedRoute: "/dashboard/curiosity-compass" },
  { type: "first_observation", title: "Problem Spotter", description: "Logged your first problem observation", icon: "🔍", points: 15, category: "exploration" },
  { type: "first_idea_card", title: "Idea Collector", description: "Interacted with your first idea card", icon: "💡", points: 10, category: "exploration" },
  { type: "first_startup_idea", title: "Visionary", description: "Created your first startup idea", icon: "🎯", points: 20, category: "exploration" },
  { type: "first_application", title: "Go-Getter", description: "Submitted your first job application", icon: "📮", points: 15, category: "exploration", linkedFeature: "Job Matching", linkedRoute: "/dashboard/job-matching" },
  // Learning
  { type: "first_journal", title: "Reflector", description: "Wrote your first journal entry", icon: "📝", points: 10, category: "learning", linkedFeature: "Journal", linkedRoute: "/dashboard/journal" },
  { type: "five_journals", title: "Deep Thinker", description: "Wrote 5 journal entries", icon: "📓", points: 30, category: "learning", linkedFeature: "Journal", linkedRoute: "/dashboard/journal" },
  { type: "first_learning_track", title: "Student", description: "Started a learning track", icon: "📚", points: 15, category: "learning", linkedFeature: "Content Library", linkedRoute: "/dashboard/content-library" },
  { type: "first_capsule", title: "Knowledge Seeker", description: "Completed a learning capsule", icon: "🎓", points: 15, category: "learning", linkedFeature: "Content Library", linkedRoute: "/dashboard/content-library" },
  { type: "five_skills", title: "Skill Builder", description: "Added 5 skills", icon: "🎯", points: 25, category: "learning", linkedFeature: "SkillStacker", linkedRoute: "/dashboard/skill-stacker" },
  { type: "ten_skills", title: "Skill Master", description: "Added 10 skills", icon: "🏅", points: 50, category: "learning", linkedFeature: "SkillStacker", linkedRoute: "/dashboard/skill-stacker" },
  { type: "first_reflection", title: "Thoughtful", description: "Wrote your first project reflection", icon: "💭", points: 10, category: "learning" },
  // Building
  { type: "first_project", title: "Creator", description: "Started your first project", icon: "🚀", points: 20, category: "building", linkedFeature: "Project Playground", linkedRoute: "/dashboard/project-playground" },
  { type: "first_lab_plan", title: "Lab Scientist", description: "Created your first lab plan", icon: "🧪", points: 20, category: "building" },
  { type: "first_experiment", title: "Experimenter", description: "Ran your first MVP experiment", icon: "⚗️", points: 25, category: "building" },
  { type: "first_milestone", title: "Milestone Maker", description: "Completed your first milestone", icon: "🏁", points: 20, category: "building" },
  { type: "first_validation", title: "Validator", description: "Completed a validation sprint", icon: "✅", points: 30, category: "building" },
  { type: "first_challenge_complete", title: "Challenge Champion", description: "Completed a project challenge", icon: "🏅", points: 30, category: "building", linkedFeature: "Project Playground", linkedRoute: "/dashboard/project-playground" },
  // Collaboration
  { type: "first_connection", title: "Networker", description: "Made your first connection", icon: "🤝", points: 15, category: "collaboration", linkedFeature: "Connections", linkedRoute: "/dashboard/connections" },
  { type: "five_connections", title: "Connector", description: "Made 5 connections", icon: "🌐", points: 35, category: "collaboration" },
  { type: "first_mentor_session", title: "Guided", description: "Completed your first mentor session", icon: "🎓", points: 20, category: "collaboration", linkedFeature: "Mentor Matchmaking", linkedRoute: "/dashboard/mentor-matchmaking" },
  // Community
  { type: "first_community_join", title: "Community Member", description: "Joined your first community", icon: "👥", points: 10, category: "community" },
  { type: "first_post", title: "Voice Found", description: "Published your first community post", icon: "📢", points: 15, category: "community" },
  { type: "five_posts", title: "Thought Leader", description: "Published 5 community posts", icon: "🎤", points: 35, category: "community" },
  { type: "first_peer_circle", title: "Circle Joiner", description: "Joined your first peer circle", icon: "⭕", points: 15, category: "community" },
  // Resilience
  { type: "first_checkin", title: "Self-Aware", description: "Completed your first mood check-in", icon: "🧘", points: 10, category: "resilience" },
  { type: "five_checkins", title: "Emotionally Intelligent", description: "Completed 5 mood check-ins", icon: "💪", points: 30, category: "resilience" },
  { type: "first_habit", title: "Habit Former", description: "Created your first mindset habit", icon: "🌱", points: 15, category: "resilience" },
  { type: "first_challenge", title: "Challenge Accepted", description: "Started a mindset challenge", icon: "⚔️", points: 20, category: "resilience" },
  { type: "streak_3", title: "Consistent", description: "3-day activity streak", icon: "🔥", points: 30, category: "resilience" },
  { type: "streak_7", title: "Dedicated", description: "7-day activity streak", icon: "⚡", points: 50, category: "resilience" },
  { type: "streak_14", title: "Unstoppable", description: "14-day activity streak", icon: "💎", points: 75, category: "resilience" },
  { type: "streak_30", title: "Iron Will", description: "30-day activity streak", icon: "🏆", points: 100, category: "resilience" },
  // Leadership
  { type: "first_roadmap", title: "Pathfinder", description: "Created your first roadmap", icon: "🗺️", points: 15, category: "leadership", linkedFeature: "Roadmap", linkedRoute: "/dashboard/roadmap" },
  { type: "founder_profile", title: "Founder Identity", description: "Completed your founder profile", icon: "👤", points: 20, category: "leadership" },
  { type: "first_path", title: "Direction Set", description: "Selected your first entrepreneurial path", icon: "🧭", points: 20, category: "leadership" },
  { type: "first_moodboard", title: "Vision Architect", description: "Created your first moodboard", icon: "🎨", points: 15, category: "leadership" },
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

const LEVEL_TIERS = [
  { name: "Newcomer", icon: "🌱", min: 0, max: 49 },
  { name: "Explorer", icon: "🧭", min: 50, max: 149 },
  { name: "Builder", icon: "🔨", min: 150, max: 299 },
  { name: "Innovator", icon: "💡", min: 300, max: 499 },
  { name: "Legend", icon: "👑", min: 500, max: Infinity },
];

const getLevel = (pts: number) => LEVEL_TIERS.find(t => pts >= t.min && pts <= t.max) || LEVEL_TIERS[0];

const Achievements = () => {
  const { user, profile } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any[]>([]);
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [endorserProfiles, setEndorserProfiles] = useState<Record<string, any>>({});
  const [celebrations, setCelebrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("wall");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiResultType, setAiResultType] = useState<string>("");
  const [showCelebration, setShowCelebration] = useState<any>(null);

  // Endorsement sending
  const [endorseTarget, setEndorseTarget] = useState<string | null>(null);
  const [endorseMessage, setEndorseMessage] = useState("");
  const [endorseAchievementId, setEndorseAchievementId] = useState<string | null>(null);

  // Share state
  const [shareAchievement, setShareAchievement] = useState<any>(null);

  // Activity counts for progress estimation
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [aRes, sRes, eRes, cRes] = await Promise.all([
      supabase.from("achievements").select("*").eq("user_id", user.id).order("earned_at", { ascending: false }),
      supabase.from("user_streaks").select("*").eq("user_id", user.id),
      supabase.from("peer_endorsements").select("*").eq("endorsed_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("milestone_celebrations").select("*").eq("user_id", user.id).eq("is_seen", false).order("created_at", { ascending: false }),
    ]);
    setAchievements(aRes.data || []);
    setStreaks(sRes.data || []);
    setEndorsements(eRes.data || []);
    setCelebrations(cRes.data || []);
    if ((cRes.data || []).length > 0) setShowCelebration(cRes.data![0]);

    // Fetch endorser profiles
    const endorserIds = [...new Set((eRes.data || []).map((e: any) => e.endorser_id))];
    if (endorserIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", endorserIds);
      const map: Record<string, any> = {};
      (profiles || []).forEach(p => { map[p.user_id] = p; });
      setEndorserProfiles(map);
    }

    setLoading(false);
  }, [user]);

  const fetchActivityCounts = useCallback(async () => {
    if (!user) return;
    const [iRes, sRes, jRes, pRes, cRes, checkinRes] = await Promise.all([
      supabase.from("interests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("skills" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
      supabase.from("coaching_checkins").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setActivityCounts({
      interests: (iRes as any).count || 0,
      skills: (sRes as any).count || 0,
      journals: (jRes as any).count || 0,
      posts: (pRes as any).count || 0,
      connections: (cRes as any).count || 0,
      checkins: (checkinRes as any).count || 0,
    });
  }, [user]);

  const checkAndAwardBadges = useCallback(async () => {
    if (!user) return;

    const queries1: any[] = await Promise.all([
      supabase.from("interests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("skills" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("projects" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("roadmaps" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
      supabase.from("problem_observations" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("startup_ideas" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("idea_card_interactions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("lab_plans").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    const queries2: any[] = await Promise.all([
      supabase.from("mvp_experiments" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("validation_sprints").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("coaching_checkins").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mindset_habits").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mindset_challenges").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("community_members").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("path_selections").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("moodboards" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("learning_track_progress" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    const queries3: any[] = await Promise.all([
      supabase.from("job_applications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("project_reflections" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("peer_circle_members" as any).select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    const mentorSessionsRes: any = await (supabase.from("mentorship_sessions") as any).select("id", { count: "exact", head: true }).eq("mentee_id", user.id);
    const challengeCompletesRes: any = await (supabase.from("challenge_enrollments") as any).select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed");
    const milestoneRes: any = await (supabase.from("lab_milestones") as any).select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed");
    const capsuleRes: any = await (supabase.from("capsule_progress" as any) as any).select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed");

    const [interestsRes, skillsRes, journalRes, projectsRes, roadmapsRes, connectionsRes, observationsRes, ideasRes, ideaCardsRes, labPlansRes] = queries1;
    const [experimentsRes, validationsRes, checkinsRes, habitsRes, challengesRes, communitiesRes, postsRes, pathsRes, moodboardsRes, learningRes] = queries2;
    const [applicationsRes, reflectionsRes, circlesRes] = queries3;

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
      ["first_application", c(applicationsRes) >= 1],
      ["first_reflection", c(reflectionsRes) >= 1],
      ["first_peer_circle", c(circlesRes) >= 1],
      ["first_mentor_session", c(mentorSessionsRes) >= 1],
      ["first_challenge_complete", c(challengeCompletesRes) >= 1],
      ["first_milestone", c(milestoneRes) >= 1],
      ["first_capsule", c(capsuleRes) >= 1],
    ];

    const { data: fp } = await supabase.from("founder_profiles").select("id").eq("user_id", user.id).maybeSingle();
    if (fp) checks.push(["founder_profile", true]);

    const { data: streakData } = await supabase.from("user_streaks").select("*").eq("user_id", user.id).eq("streak_type", "daily_activity").maybeSingle();
    if (streakData) {
      if (streakData.current_streak >= 3) checks.push(["streak_3", true]);
      if (streakData.current_streak >= 7) checks.push(["streak_7", true]);
      if (streakData.current_streak >= 14) checks.push(["streak_14", true]);
      if (streakData.current_streak >= 30) checks.push(["streak_30", true]);
    }

    const toAward = checks
      .filter(([type, met]) => met && !earned.has(type))
      .map(([type]) => BADGE_TEMPLATES.find(b => b.type === type))
      .filter(Boolean) as BadgeTemplate[];

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
        toAward.map(b => ({ user_id: user.id, achievement_type: b.type, title: b.title, description: b.description, points: b.points }))
      );
      for (const b of toAward) {
        await supabase.from("milestone_celebrations").insert({
          user_id: user.id, milestone_type: "badge_earned", title: `🎉 ${b.title} Unlocked!`, description: b.description,
          celebration_data: { badge_type: b.type, icon: b.icon, points: b.points },
        });
      }
      const newTotal = currentPts + toAward.reduce((s, b) => s + b.points, 0);
      const newCount = (existing?.length || 0) + toAward.length;
      await supabase.from("leaderboard_entries").upsert({
        user_id: user.id, scope: "global", scope_id: "career",
        total_points: newTotal, badge_count: newCount, updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,scope,scope_id" } as any);
      fetchAll();
      toAward.forEach(b => toast.success(`🎉 Badge Earned: ${b.title}!`));
    }

    // Update daily streak
    const today = new Date().toISOString().split("T")[0];
    if (streakData) {
      if (streakData.last_activity_date !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        const newStreak = streakData.last_activity_date === yesterday ? (streakData.current_streak || 0) + 1 : 1;
        await supabase.from("user_streaks").update({
          current_streak: newStreak, longest_streak: Math.max(newStreak, streakData.longest_streak || 0),
          last_activity_date: today, updated_at: new Date().toISOString(),
        }).eq("id", streakData.id);
      }
    } else {
      await supabase.from("user_streaks").insert({
        user_id: user.id, streak_type: "daily_activity", current_streak: 1, longest_streak: 1, last_activity_date: today,
      });
    }
  }, [user, fetchAll]);

  useEffect(() => {
    fetchAll();
    fetchActivityCounts();
    checkAndAwardBadges();
    const channel = supabase
      .channel("achievements-watch")
      .on("postgres_changes", { event: "*", schema: "public", table: "achievements", filter: `user_id=eq.${user!.id}` }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const dismissCelebration = async (id: string) => {
    await supabase.from("milestone_celebrations").update({ is_seen: true }).eq("id", id);
    setShowCelebration(null);
    const next = celebrations.find(c => c.id !== id && !c.is_seen);
    if (next) setShowCelebration(next);
  };

  // Endorsement sending
  const sendEndorsement = async () => {
    if (!endorseTarget || !user) return;
    const { error } = await supabase.from("peer_endorsements").insert({
      endorser_id: user.id,
      endorsed_id: endorseTarget,
      achievement_id: endorseAchievementId || null,
      message: endorseMessage || "Great work! Keep it up! 🎉",
      endorsement_type: "shout_out",
    });
    if (error) { toast.error("Failed to send endorsement"); return; }
    setEndorseTarget(null);
    setEndorseMessage("");
    setEndorseAchievementId(null);
    toast.success("Endorsement sent! 🎉");
  };

  // Share badge
  const shareBadge = (badge: any) => {
    const text = `🏆 I just earned the "${badge.title}" badge on MyRaaha! ${badge.description} (+${badge.points} pts)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Badge info copied to clipboard!");
    } else {
      toast.info(text);
    }
  };

  // Progress estimation for unearned badges
  const getBadgeProgress = (badge: BadgeTemplate): number => {
    if (earnedTypes.has(badge.type)) return 100;
    const ac = activityCounts;
    switch (badge.type) {
      case "first_interest": return ac.interests >= 1 ? 100 : 0;
      case "ten_interests": return Math.min((ac.interests / 10) * 100, 99);
      case "five_skills": return Math.min((ac.skills / 5) * 100, 99);
      case "ten_skills": return Math.min((ac.skills / 10) * 100, 99);
      case "first_journal": return ac.journals >= 1 ? 100 : 0;
      case "five_journals": return Math.min((ac.journals / 5) * 100, 99);
      case "first_post": return ac.posts >= 1 ? 100 : 0;
      case "five_posts": return Math.min((ac.posts / 5) * 100, 99);
      case "first_connection": return ac.connections >= 1 ? 100 : 0;
      case "five_connections": return Math.min((ac.connections / 5) * 100, 99);
      case "first_checkin": return ac.checkins >= 1 ? 100 : 0;
      case "five_checkins": return Math.min((ac.checkins / 5) * 100, 99);
      case "streak_3": return Math.min((currentStreak / 3) * 100, 99);
      case "streak_7": return Math.min((currentStreak / 7) * 100, 99);
      case "streak_14": return Math.min((currentStreak / 14) * 100, 99);
      case "streak_30": return Math.min((currentStreak / 30) * 100, 99);
      case "hundred_points": return Math.min((totalPoints / 100) * 100, 99);
      case "five_hundred_points": return Math.min((totalPoints / 500) * 100, 99);
      default: return 0;
    }
  };

  const totalPoints = useMemo(() => achievements.reduce((s, a) => s + (a.points || 0), 0), [achievements]);
  const earnedTypes = useMemo(() => new Set(achievements.map(a => a.achievement_type)), [achievements]);
  const currentStreak = streaks.find(s => s.streak_type === "daily_activity")?.current_streak || 0;
  const longestStreak = streaks.find(s => s.streak_type === "daily_activity")?.longest_streak || 0;
  const tier = getLevel(totalPoints);

  const filteredBadges = useMemo(() => {
    if (categoryFilter === "all") return BADGE_TEMPLATES;
    return BADGE_TEMPLATES.filter(b => b.category === categoryFilter);
  }, [categoryFilter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, { earned: number; total: number }> = {};
    for (const cat of Object.keys(CATEGORY_META)) {
      counts[cat] = {
        total: BADGE_TEMPLATES.filter(b => b.category === cat).length,
        earned: BADGE_TEMPLATES.filter(b => b.category === cat && earnedTypes.has(b.type)).length,
      };
    }
    return counts;
  }, [earnedTypes]);

  const nextToUnlock = useMemo(() =>
    BADGE_TEMPLATES
      .filter(b => !earnedTypes.has(b.type))
      .map(b => ({ ...b, progress: getBadgeProgress(b) }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 6),
    [earnedTypes, activityCounts, currentStreak, totalPoints]
  );

  const callAI = async (type: string, context: any) => {
    setAiLoading(true);
    setAiResultType(type);
    try {
      const { data, error } = await supabase.functions.invoke("achievements-ai", { body: { type, context } });
      if (error) throw error;
      setAiResult(data);
    } catch { toast.error("AI request failed"); }
    setAiLoading(false);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-card rounded-2xl border border-primary/30 p-8 max-w-md w-full text-center shadow-xl">
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: 3, duration: 0.5 }} className="text-6xl block mb-4">
                {(showCelebration.celebration_data as any)?.icon || "🎉"}
              </motion.span>
              <h2 className="text-2xl font-bold text-foreground mb-2">{showCelebration.title}</h2>
              <p className="text-sm text-muted-foreground mb-4">{showCelebration.description}</p>
              {(showCelebration.celebration_data as any)?.points && (
                <Badge className="bg-primary/10 text-primary mb-4">+{(showCelebration.celebration_data as any).points} points</Badge>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={() => dismissCelebration(showCelebration.id)}>Awesome! 🎉</Button>
                <Button variant="outline" onClick={() => {
                  const text = `🎉 I just earned "${showCelebration.title}" on MyRaaha! ${showCelebration.description}`;
                  navigator.clipboard?.writeText(text);
                  toast.success("Copied to share!");
                }}><Share2 size={14} /> Share</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 border border-primary/20 p-6 sm:p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Badges & Achievements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Celebrate your journey.</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">Track your progress, unlock badges, and see how you compare with peers.</p>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: Medal, label: "Points", value: totalPoints, accent: true },
          { icon: Award, label: "Badges", value: `${achievements.length}/${BADGE_TEMPLATES.length}` },
          { icon: Zap, label: "Level", value: `${tier.icon} ${tier.name}` },
          { icon: Flame, label: "Streak", value: `${currentStreak}🔥` },
          { icon: Target, label: "Best", value: `${longestStreak}d` },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
            <Card className="text-center p-3">
              <stat.icon className={`mx-auto mb-1 h-5 w-5 ${stat.accent ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Overall Progress */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-xs text-muted-foreground">{achievements.length} / {BADGE_TEMPLATES.length} badges</span>
        </div>
        <Progress value={(achievements.length / BADGE_TEMPLATES.length) * 100} className="h-3" />
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="wall" className="gap-1"><Award className="h-4 w-4" /> Badge Wall</TabsTrigger>
          <TabsTrigger value="gallery" className="gap-1"><Trophy className="h-4 w-4" /> Gallery</TabsTrigger>
          <TabsTrigger value="streaks" className="gap-1"><Flame className="h-4 w-4" /> Streaks</TabsTrigger>
          <TabsTrigger value="progress" className="gap-1"><BarChart3 className="h-4 w-4" /> Progress</TabsTrigger>
          <TabsTrigger value="recognition" className="gap-1"><Heart className="h-4 w-4" /> Recognition</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1"><Sparkles className="h-4 w-4" /> AI Coach</TabsTrigger>
        </TabsList>

        {/* Badge Wall */}
        <TabsContent value="wall" className="space-y-4 mt-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>{meta.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {filteredBadges.filter(b => earnedTypes.has(b.type)).length}/{filteredBadges.length} earned
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge, i) => {
              const isEarned = earnedTypes.has(badge.type);
              const earnedData = achievements.find(a => a.achievement_type === badge.type);
              const catMeta = CATEGORY_META[badge.category];
              const CatIcon = catMeta.icon;
              const progress = getBadgeProgress(badge);
              return (
                <motion.div key={badge.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                  <Card className={`p-5 transition-all ${isEarned ? "border-primary/30 bg-primary/5 shadow-sm" : "opacity-60 hover:opacity-90"}`}>
                    <div className="flex items-start gap-3">
                      <span className={`text-3xl ${!isEarned ? "grayscale" : ""}`}>{badge.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-foreground">{badge.title}</h3>
                          {isEarned && <Award className="h-4 w-4 text-primary" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] gap-1"><CatIcon className={`h-3 w-3 ${catMeta.color}`} />{catMeta.label}</Badge>
                          <span className="text-xs text-primary font-semibold">+{badge.points} pts</span>
                        </div>
                        {isEarned && earnedData && (
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-[10px] text-muted-foreground">Earned {new Date(earnedData.earned_at).toLocaleDateString()}</p>
                            <button onClick={() => shareBadge(badge)} className="text-muted-foreground hover:text-primary transition-colors">
                              <Share2 size={12} />
                            </button>
                          </div>
                        )}
                        {/* Progress bar for unearned badges */}
                        {!isEarned && progress > 0 && (
                          <div className="mt-2">
                            <Progress value={progress} className="h-1.5" />
                            <p className="text-[10px] text-muted-foreground mt-0.5">{Math.round(progress)}% complete</p>
                          </div>
                        )}
                        {/* Linked feature */}
                        {badge.linkedFeature && badge.linkedRoute && !isEarned && (
                          <Link to={badge.linkedRoute} className="text-[10px] text-primary hover:underline mt-1 inline-flex items-center gap-1">
                            Go to {badge.linkedFeature} <ArrowRight size={8} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Achievement Gallery */}
        <TabsContent value="gallery" className="space-y-4 mt-4">
          <h2 className="text-lg font-semibold text-foreground">🏆 Achievement Gallery</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const ct = categoryCounts[key] || { earned: 0, total: 0 };
              const pct = ct.total > 0 ? Math.round((ct.earned / ct.total) * 100) : 0;
              return (
                <Card key={key} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setCategoryFilter(key); setTab("wall"); }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${meta.color}`} />
                    <span className="text-sm font-medium">{meta.label}</span>
                  </div>
                  <Progress value={pct} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">{ct.earned}/{ct.total} badges • {pct}%</p>
                </Card>
              );
            })}
          </div>

          {achievements.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3">Recently Earned</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.slice(0, 6).map((a, i) => {
                  const tmpl = BADGE_TEMPLATES.find(b => b.type === a.achievement_type);
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Card className="p-4 border-primary/20 bg-primary/5">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{tmpl?.icon || "🏆"}</span>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-foreground">{a.title}</h3>
                            <p className="text-xs text-muted-foreground">{a.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px]">+{a.points} pts</Badge>
                              <span className="text-[10px] text-muted-foreground">{new Date(a.earned_at).toLocaleDateString()}</span>
                              <button onClick={() => shareBadge(tmpl || a)} className="text-muted-foreground hover:text-primary ml-auto"><Share2 size={12} /></button>
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

          {/* Next to Unlock with progress */}
          {nextToUnlock.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2"><Target className="h-5 w-5" /> Next to Unlock</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {nextToUnlock.map(badge => {
                  const catMeta = CATEGORY_META[badge.category];
                  return (
                    <Card key={badge.type} className="p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl grayscale">{badge.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-medium text-foreground">{badge.title}</h3>
                            <Badge variant="outline" className="text-[10px]">{catMeta.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-primary font-semibold">+{badge.points} pts</span>
                            {badge.linkedRoute && (
                              <Link to={badge.linkedRoute} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                                {badge.linkedFeature} <ArrowRight size={8} />
                              </Link>
                            )}
                          </div>
                          {(badge as any).progress > 0 && (
                            <div className="mt-2">
                              <Progress value={(badge as any).progress} className="h-1.5" />
                              <p className="text-[10px] text-muted-foreground mt-0.5">{Math.round((badge as any).progress)}% there</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {achievements.length === 0 && (
            <Card className="p-12 text-center">
              <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="text-xl font-bold text-foreground mb-2">No achievements yet</h3>
              <p className="text-muted-foreground">Complete activities to earn badges and points!</p>
            </Card>
          )}
        </TabsContent>

        {/* Streaks */}
        <TabsContent value="streaks" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Flame className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{currentStreak} Day Streak</h2>
                <p className="text-sm text-muted-foreground">Best: {longestStreak} days</p>
              </div>
            </div>
            <Progress value={Math.min((currentStreak / 30) * 100, 100)} className="h-3 mb-2" />
            <p className="text-xs text-muted-foreground">
              {currentStreak < 3 ? `${3 - currentStreak} more days for 🔥 Consistent badge` :
               currentStreak < 7 ? `${7 - currentStreak} more days for ⚡ Dedicated badge` :
               currentStreak < 14 ? `${14 - currentStreak} more days for 💎 Unstoppable badge` :
               currentStreak < 30 ? `${30 - currentStreak} more days for 🏆 Iron Will badge` :
               "You're unstoppable! 🏆"}
            </p>
          </Card>

          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { days: 3, icon: "🔥", title: "Consistent", type: "streak_3" },
              { days: 7, icon: "⚡", title: "Dedicated", type: "streak_7" },
              { days: 14, icon: "💎", title: "Unstoppable", type: "streak_14" },
              { days: 30, icon: "🏆", title: "Iron Will", type: "streak_30" },
            ].map(s => {
              const isEarned = earnedTypes.has(s.type);
              const progress = Math.min((currentStreak / s.days) * 100, 100);
              return (
                <Card key={s.type} className={`p-4 ${isEarned ? "border-primary/30 bg-primary/5" : ""}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-2xl ${!isEarned ? "grayscale" : ""}`}>{s.icon}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{s.title}</h4>
                      <p className="text-xs text-muted-foreground">{s.days}-day streak</p>
                    </div>
                    {isEarned && <Award className="h-4 w-4 text-primary ml-auto" />}
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">{Math.min(currentStreak, s.days)}/{s.days} days</p>
                </Card>
              );
            })}
          </div>

          <Card className="p-5 border-dashed">
            <div className="flex items-start gap-3">
              <Calendar className="h-6 w-6 text-muted-foreground shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Streak Tips</h3>
                <p className="text-xs text-muted-foreground mt-1">• Log a journal entry, complete a task, or explore a new interest daily.</p>
                <p className="text-xs text-muted-foreground">• Even small actions count — the key is consistency!</p>
                <p className="text-xs text-muted-foreground">• Your streak feeds into your Living Resume visibility.</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Progress Tracker */}
        <TabsContent value="progress" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-2xl">{tier.icon}</div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Level: {tier.name}</h3>
                <p className="text-sm text-muted-foreground">{totalPoints} points • {achievements.length} badges</p>
              </div>
            </div>
            <Progress value={(achievements.length / BADGE_TEMPLATES.length) * 100} className="h-3 mb-2" />
            {/* Next level info */}
            {tier.max !== Infinity && (
              <p className="text-xs text-muted-foreground">
                {tier.max - totalPoints + 1} more points to reach {LEVEL_TIERS[LEVEL_TIERS.indexOf(tier) + 1]?.name || "next level"}
              </p>
            )}
          </Card>

          {/* Level tiers */}
          <div>
            <h2 className="text-base font-semibold text-foreground mb-3">Level Tiers</h2>
            <div className="space-y-2">
              {LEVEL_TIERS.map(t => {
                const isCurrent = tier.name === t.name;
                return (
                  <Card key={t.name} className={`p-3 flex items-center gap-3 ${isCurrent ? "border-primary/30 bg-primary/5" : ""}`}>
                    <span className="text-2xl">{t.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t.name}</span>
                        {isCurrent && <Badge className="text-[10px]">Current</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{t.max === Infinity ? `${t.min}+ pts` : `${t.min}–${t.max} pts`}</span>
                    </div>
                    {isCurrent && <ChevronRight className="h-4 w-4 text-primary" />}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Achievement timeline */}
          {achievements.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-foreground mb-3">Achievement Timeline</h2>
              <div className="relative border-l-2 border-primary/20 ml-4 space-y-4">
                {achievements.slice(0, 15).map((a, i) => {
                  const tmpl = BADGE_TEMPLATES.find(b => b.type === a.achievement_type);
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{tmpl?.icon || "🏆"}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{a.title}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(a.earned_at).toLocaleDateString()} • +{a.points} pts</p>
                        </div>
                        <button onClick={() => shareBadge(tmpl || a)} className="text-muted-foreground hover:text-primary ml-auto"><Share2 size={12} /></button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Profile integration note */}
          <Card className="p-5 border-dashed border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <UserCheck className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Living Resume Integration</h3>
                <p className="text-xs text-muted-foreground mt-1">Your badges and achievements are automatically synced to your Living Resume. Recruiters and mentors can see your verified accomplishments.</p>
                <Link to="/dashboard/living-resume" className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1">
                  View Living Resume <ArrowRight size={10} />
                </Link>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Recognition */}
        <TabsContent value="recognition" className="space-y-4 mt-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-pink-500" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Peer & Mentor Recognition</h3>
                <p className="text-sm text-muted-foreground">Endorsements and shout-outs from your network</p>
              </div>
            </div>

            {endorsements.length > 0 ? (
              <div className="space-y-3">
                {endorsements.map(e => {
                  const endorser = endorserProfiles[e.endorser_id];
                  return (
                    <Card key={e.id} className="p-4 bg-muted/30">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold shrink-0">
                          {endorser?.full_name?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{endorser?.full_name || "A peer"}</p>
                          <p className="text-sm text-muted-foreground">{e.message || "Great work! Keep it up!"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {e.endorsement_type && <Badge variant="outline" className="text-[10px] capitalize">{e.endorsement_type.replace("_", " ")}</Badge>}
                            <span className="text-[10px] text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto text-muted-foreground/40 mb-3" size={40} />
                <p className="text-muted-foreground text-sm">No endorsements yet. As you earn badges, mentors and peers can recognize your achievements.</p>
              </div>
            )}
          </Card>

          {/* Send Endorsement */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Send size={14} /> Send an Endorsement</h3>
            <p className="text-xs text-muted-foreground mb-3">Recognize a peer's achievement or give them a shout-out.</p>
            <div className="space-y-2">
              <Input placeholder="Peer's user ID (from Connections)" value={endorseTarget || ""} onChange={e => setEndorseTarget(e.target.value)} className="text-sm" />
              <Textarea placeholder="Your message (e.g., 'Amazing progress on SkillStacker!')" value={endorseMessage} onChange={e => setEndorseMessage(e.target.value)} rows={2} />
              <Button size="sm" onClick={sendEndorsement} disabled={!endorseTarget}>
                <Send size={12} /> Send Endorsement
              </Button>
            </div>
          </Card>

          {/* Share info */}
          <Card className="p-5 border-dashed">
            <div className="flex items-start gap-3">
              <Share2 className="h-6 w-6 text-muted-foreground shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Share & Celebrate</h3>
                <p className="text-xs text-muted-foreground mt-1">Your badges are visible on your Living Resume, helping recruiters and mentors see your verified accomplishments. Click the share icon on any badge to copy it.</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* AI Coach */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card className="p-6 text-center">
            <Brain className="mx-auto text-primary mb-3" size={40} />
            <h2 className="text-xl font-bold text-foreground mb-2">AI Achievement Coach</h2>
            <p className="text-sm text-muted-foreground mb-4">Get personalized suggestions, motivation, and progress analysis.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => callAI("motivation_nudge", { totalPoints, currentStreak, badgeCount: achievements.length, level: tier.name, mood: "neutral" })} disabled={aiLoading}>
                <Sparkles className="h-4 w-4" /> Motivation Nudge
              </Button>
              <Button onClick={() => callAI("next_steps", { earned: achievements.map(a => a.achievement_type), totalPoints, badgeCount: achievements.length, totalBadges: BADGE_TEMPLATES.length, streak: currentStreak })} disabled={aiLoading} variant="outline">
                <Target className="h-4 w-4" /> Next Steps
              </Button>
              <Button onClick={() => callAI("progress_analysis", { earned: achievements.map(a => ({ type: a.achievement_type, date: a.earned_at })), totalPoints, categories: categoryCounts, streak: currentStreak, level: tier.name })} disabled={aiLoading} variant="outline">
                <Brain className="h-4 w-4" /> Analyze Progress
              </Button>
            </div>
          </Card>

          <AnimatePresence>
            {aiResult && aiResultType === "motivation_nudge" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/30 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h3 className="font-semibold">Motivation Nudge</h3></div>
                    <Button size="icon" variant="ghost" onClick={() => setAiResult(null)}><X className="h-4 w-4" /></Button>
                  </div>
                  <p className="text-sm text-foreground mb-2">{aiResult.nudge_message}</p>
                  {aiResult.suggested_activity && <p className="text-xs text-primary">→ {aiResult.suggested_activity}</p>}
                  {aiResult.streak_advice && <p className="text-xs text-muted-foreground mt-2">💡 {aiResult.streak_advice}</p>}
                  {aiResult.energy_boost && <p className="text-xs text-muted-foreground mt-1">⚡ {aiResult.energy_boost}</p>}
                </Card>
              </motion.div>
            )}

            {aiResult && aiResultType === "next_steps" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/30">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Suggested Next Steps</CardTitle>
                      {aiResult.encouragement && <CardDescription>{aiResult.encouragement}</CardDescription>}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setAiResult(null)}><X className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {aiResult.suggestions?.map((s: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{s.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.action}</p>
                        {s.estimated_effort && <Badge variant="secondary" className="text-[10px] mt-1">{s.estimated_effort}</Badge>}
                      </div>
                    ))}
                    {aiResult.streak_tip && <p className="text-xs text-muted-foreground border-t pt-2">💡 {aiResult.streak_tip}</p>}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {aiResult && aiResultType === "progress_analysis" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-primary/30">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> Progress Analysis</CardTitle>
                      {aiResult.celebration_message && <CardDescription>{aiResult.celebration_message}</CardDescription>}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setAiResult(null)}><X className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiResult.strength_areas?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">💪 Strengths</h4>
                        <div className="flex flex-wrap gap-1">{aiResult.strength_areas.map((s: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>)}</div>
                      </div>
                    )}
                    {aiResult.growth_areas?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">🌱 Growth Areas</h4>
                        <div className="flex flex-wrap gap-1">{aiResult.growth_areas.map((s: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{s}</Badge>)}</div>
                      </div>
                    )}
                    {aiResult.achievement_pace && (
                      <p className="text-xs text-muted-foreground">📊 Pace: {aiResult.achievement_pace}</p>
                    )}
                    {aiResult.personalized_challenge && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <h4 className="text-sm font-medium mb-1">🎯 Personal Challenge</h4>
                        <p className="text-sm text-muted-foreground">{aiResult.personalized_challenge}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!aiResult && (
            <Card className="p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">Click a button above to get AI-powered insights.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Achievements;
