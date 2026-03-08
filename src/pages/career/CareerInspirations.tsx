import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import {
  Heart, Bookmark, MessageCircle, Search, Sparkles, Send, Plus,
  BookOpen, TrendingUp, Lightbulb, Users, Star, ArrowRight, RefreshCw,
  Flame, Shield, Rocket, PenLine, X, Globe, MapPin, Building2, Palette,
  Brain, Compass, Map, FileText, FolderKanban, UserCheck, Bot, BarChart3,
  Award, Zap, Target
} from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All Stories", icon: BookOpen },
  { value: "career-shift", label: "Career Shifts", icon: RefreshCw },
  { value: "overcoming-fear", label: "Overcoming Fear", icon: Shield },
  { value: "self-discovery", label: "Self-Discovery", icon: Brain },
  { value: "learning-failure", label: "Learning from Failure", icon: Flame },
  { value: "starting-small", label: "Starting Small", icon: Rocket },
  { value: "growth", label: "Growth & Promotion", icon: TrendingUp },
  { value: "mentorship", label: "Mentorship Stories", icon: Users },
  { value: "skill-building", label: "Skill Building", icon: Star },
];

const SCOPES = [
  { value: "all", label: "All Regions", icon: Globe },
  { value: "local", label: "Local Success", icon: MapPin },
  { value: "national", label: "National Role Models", icon: Building2 },
  { value: "global", label: "Global Innovators", icon: Globe },
];

const EMOTIONS = [
  { value: "all", label: "Any Feeling" },
  { value: "perseverance", label: "💪 Perseverance" },
  { value: "courage", label: "🦁 Courage" },
  { value: "curiosity", label: "🔍 Curiosity" },
  { value: "hope", label: "🌱 Hope" },
  { value: "resilience", label: "🛡️ Resilience" },
  { value: "gratitude", label: "🙏 Gratitude" },
  { value: "excitement", label: "⚡ Excitement" },
  { value: "determination", label: "🎯 Determination" },
];

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(210,60%,55%)", "hsl(150,50%,50%)", "hsl(30,70%,55%)", "hsl(340,60%,55%)", "hsl(270,50%,55%)"];

type Story = {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  category: string;
  tags: string[];
  domain: string | null;
  stage: string | null;
  story_type: string;
  author_name: string | null;
  author_role: string | null;
  is_featured: boolean | null;
  likes_count: number | null;
  comments_count: number | null;
  bookmarks_count: number | null;
  created_at: string;
  user_id: string | null;
  scope?: string | null;
  emotion_theme?: string | null;
  intent?: string | null;
};

const CONNECT_LINKS = [
  { label: "Curiosity Compass", desc: "Explore domains from stories that inspire you", icon: Compass, path: "/career/curiosity-compass" },
  { label: "Career Moodboard", desc: "Pin inspiring stories to your vision board", icon: Palette, path: "/career/career-moodboard" },
  { label: "Project Playground", desc: "Start projects inspired by real success stories", icon: FolderKanban, path: "/career/project-playground" },
  { label: "Content Library", desc: "Learn skills featured in inspirational journeys", icon: BookOpen, path: "/career/content-library" },
  { label: "Roadmaps", desc: "Translate inspiration into structured career plans", icon: Map, path: "/career/roadmaps" },
  { label: "Mentor Matchmaking", desc: "Find mentors from similar backgrounds as story authors", icon: UserCheck, path: "/career/mentor-matchmaking" },
  { label: "Peer Circles", desc: "Discuss stories with peers for shared learning", icon: Users, path: "/career/peer-circles" },
  { label: "Career Coach", desc: "Process inspiration into actionable motivation", icon: Bot, path: "/career/career-coach" },
  { label: "SelfGraph", desc: "See how stories boost your motivation patterns", icon: Brain, path: "/career/self-graph" },
  { label: "Job Matching", desc: "Find opportunities aligned with stories that resonate", icon: Target, path: "/career/job-matching" },
];

export default function CareerInspirations() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [scope, setScope] = useState("all");
  const [emotion, setEmotion] = useState("all");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [reflectionPrompts, setReflectionPrompts] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: "", content: "", category: "career-shift", tags: "", scope: "local", emotion_theme: "perseverance" });
  const [tab, setTab] = useState("explore");
  const [showActions, setShowActions] = useState(false);
  const [storyActions, setStoryActions] = useState<any>(null);

  // Insights state
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null);
  const [moodRecs, setMoodRecs] = useState<any>(null);
  const [milestoneReminder, setMilestoneReminder] = useState<any>(null);

  // User context
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [userEnergyZones, setUserEnergyZones] = useState<any[]>([]);

  useEffect(() => {
    fetchStories();
    if (user) { fetchBookmarks(); fetchLikes(); fetchUserContext(); }
  }, [user]);

  const fetchUserContext = async () => {
    if (!user) return;
    const [intRes, skillRes, ezRes] = await Promise.all([
      supabase.from("interests").select("name, category, strength").eq("user_id", user.id).limit(15),
      supabase.from("skill_items" as any).select("*").eq("user_id", user.id).limit(15),
      supabase.from("energy_zones").select("domain, energy_level, mood_after").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(10),
    ]);
    setUserInterests((intRes.data as any[]) || []);
    setUserSkills((skillRes.data as any[]) || []);
    setUserEnergyZones((ezRes.data as any[]) || []);
  };

  const fetchStories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inspiration_stories")
      .select("*")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
    setStories((data as Story[]) || []);
    setLoading(false);
  };

  const fetchBookmarks = async () => {
    const { data } = await supabase.from("inspiration_bookmarks").select("story_id").eq("user_id", user!.id);
    setBookmarkedIds(new Set((data || []).map((b: any) => b.story_id)));
  };

  const fetchLikes = async () => {
    const { data } = await supabase.from("inspiration_reactions").select("story_id").eq("user_id", user!.id);
    setLikedIds(new Set((data || []).map((r: any) => r.story_id)));
  };

  const toggleLike = async (storyId: string) => {
    if (!user) return toast({ title: "Please sign in", variant: "destructive" });
    if (likedIds.has(storyId)) {
      await supabase.from("inspiration_reactions").delete().eq("user_id", user.id).eq("story_id", storyId);
      setLikedIds(prev => { const n = new Set(prev); n.delete(storyId); return n; });
      setStories(s => s.map(st => st.id === storyId ? { ...st, likes_count: (st.likes_count || 1) - 1 } : st));
    } else {
      await supabase.from("inspiration_reactions").insert({ user_id: user.id, story_id: storyId, reaction_type: "like" });
      setLikedIds(prev => new Set(prev).add(storyId));
      setStories(s => s.map(st => st.id === storyId ? { ...st, likes_count: (st.likes_count || 0) + 1 } : st));
      checkEngagementMilestones();
    }
  };

  const toggleBookmark = async (storyId: string) => {
    if (!user) return toast({ title: "Please sign in", variant: "destructive" });
    if (bookmarkedIds.has(storyId)) {
      await supabase.from("inspiration_bookmarks").delete().eq("user_id", user.id).eq("story_id", storyId);
      setBookmarkedIds(prev => { const n = new Set(prev); n.delete(storyId); return n; });
      setStories(s => s.map(st => st.id === storyId ? { ...st, bookmarks_count: (st.bookmarks_count || 1) - 1 } : st));
    } else {
      await supabase.from("inspiration_bookmarks").insert({ user_id: user.id, story_id: storyId });
      setBookmarkedIds(prev => new Set(prev).add(storyId));
      setStories(s => s.map(st => st.id === storyId ? { ...st, bookmarks_count: (st.bookmarks_count || 0) + 1 } : st));
      checkEngagementMilestones();
    }
  };

  const checkEngagementMilestones = async () => {
    if (!user) return;
    const totalEngagements = likedIds.size + bookmarkedIds.size + 1;
    const milestones: Record<number, string> = { 5: "Inspiration Seeker", 15: "Story Collector", 30: "Motivation Maven", 50: "Inspiration Champion" };
    const badge = milestones[totalEngagements];
    if (badge) {
      await supabase.from("achievements").insert({
        user_id: user.id, title: badge, achievement_type: "inspiration",
        description: `Engaged with ${totalEngagements} inspirational stories`, points: totalEngagements * 2,
      } as any);
      toast({ title: `🏆 Badge earned: ${badge}!` });
    }
  };

  const saveToMoodboard = async (story: Story) => {
    if (!user) return;
    try {
      const { data: boards } = await (supabase.from("moodboards" as any).select("id").eq("user_id", user.id).limit(1) as any);
      let boardId: string;
      if (boards && boards.length > 0) {
        boardId = boards[0].id;
      } else {
        const { data: newBoard } = await (supabase.from("moodboards" as any).insert({ user_id: user.id, title: "Career Inspirations", theme: "inspirations" } as any).select("id").single() as any);
        boardId = newBoard!.id;
      }
      await (supabase.from("moodboard_items" as any) as any).insert({
        moodboard_id: boardId, user_id: user.id, content_type: "quote",
        title: story.title, content: story.summary || story.content.slice(0, 200),
        tags: story.tags || [], mood_feeling: (story as any).emotion_theme || "inspired",
      });
      toast({ title: "Saved to Career Moodboard! 🎨" });
    } catch {
      toast({ title: "Could not save to moodboard", variant: "destructive" });
    }
  };

  const openStory = async (story: Story) => {
    setSelectedStory(story);
    setReflectionPrompts(null);
    setShowActions(false);
    setStoryActions(null);
    const { data } = await supabase.from("inspiration_comments").select("*").eq("story_id", story.id).order("created_at", { ascending: true });
    setComments(data || []);
  };

  const addComment = async () => {
    if (!user || !newComment.trim() || !selectedStory) return;
    const { error } = await supabase.from("inspiration_comments").insert({
      user_id: user.id, story_id: selectedStory.id, content: newComment.trim(),
    });
    if (!error) {
      setNewComment("");
      const { data } = await supabase.from("inspiration_comments").select("*").eq("story_id", selectedStory.id).order("created_at", { ascending: true });
      setComments(data || []);
      setStories(s => s.map(st => st.id === selectedStory.id ? { ...st, comments_count: (st.comments_count || 0) + 1 } : st));
      checkEngagementMilestones();
    }
  };

  const buildContext = (extra?: any) => ({
    skills: userSkills.map((s: any) => ({ name: s.skill_name || s.name, level: s.current_level })),
    interests: userInterests.map(i => ({ name: i.name, category: i.category, strength: i.strength })),
    energyZones: userEnergyZones,
    profile: { name: profile?.full_name, industry: profile?.industry, stage: profile?.career_stage, goals: profile?.short_term_goals },
    domain: "career",
    liked_categories: [...new Set(stories.filter(s => likedIds.has(s.id)).map(s => s.category))],
    bookmarked_themes: [...new Set(stories.filter(s => bookmarkedIds.has(s.id)).flatMap(s => s.tags || []))],
    ...extra,
  });

  const getReflection = async (story: Story) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("inspirations-ai", {
        body: { type: "reflection_prompt", context: { title: story.title, content: story.content, category: story.category, domain: "career" } },
      });
      if (error) throw error;
      setReflectionPrompts(data);
      setShowActions(true);
      // Auto-log to journal
      if (user && data?.key_takeaway) {
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          content: `**Inspiration Reflection: ${story.title}**\n\nKey Takeaway: ${data.key_takeaway}\nAction Step: ${data.action_step || ""}`,
          tags: ["inspiration", "reflection", story.category],
          mood: "inspired",
        } as any);
      }
    } catch {
      toast({ title: "Could not generate reflection", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const getStoryActions = async (story: Story) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("inspirations-ai", {
        body: { type: "story_to_action", context: { ...buildContext(), story: { title: story.title, content: story.content, category: story.category, tags: story.tags } } },
      });
      if (error) throw error;
      setStoryActions(data);
    } catch {
      toast({ title: "Could not generate actions", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const getAiSuggestions = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("inspirations-ai", {
        body: { type: "career_suggest", context: buildContext({ currentMood: "curious" }) },
      });
      if (error) throw error;
      setAiSuggestions(data);
    } catch {
      toast({ title: "Could not get suggestions", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const getMoodRecs = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("inspirations-ai", {
        body: { type: "mood_recommendations", context: buildContext() },
      });
      if (error) throw error;
      setMoodRecs(data);
    } catch {
      toast({ title: "Could not get mood recommendations", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const getImpactAnalysis = async () => {
    setAiLoading(true);
    try {
      const likedStories = stories.filter(s => likedIds.has(s.id));
      const bookmarkedStories = stories.filter(s => bookmarkedIds.has(s.id));
      const { data, error } = await supabase.functions.invoke("inspirations-ai", {
        body: {
          type: "impact_analysis",
          context: {
            ...buildContext(),
            liked_stories: likedStories.map(s => ({ title: s.title, category: s.category, emotion: (s as any).emotion_theme, tags: s.tags })),
            bookmarked_stories: bookmarkedStories.map(s => ({ title: s.title, category: s.category, emotion: (s as any).emotion_theme })),
            total_likes: likedIds.size,
            total_bookmarks: bookmarkedIds.size,
            total_comments: comments.length,
          },
        },
      });
      if (error) throw error;
      setImpactAnalysis(data);
    } catch {
      toast({ title: "Could not analyze impact", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const getMilestoneReminder = async () => {
    setAiLoading(true);
    try {
      const { data: achievements } = await supabase.from("achievements").select("title, achievement_type").eq("user_id", user!.id).limit(10);
      const bookmarkedStories = stories.filter(s => bookmarkedIds.has(s.id));
      const { data, error } = await supabase.functions.invoke("inspirations-ai", {
        body: {
          type: "milestone_reminder",
          context: {
            ...buildContext(),
            saved_stories: bookmarkedStories.map(s => ({ title: s.title, category: s.category, emotion: (s as any).emotion_theme })),
            achievements: achievements || [],
          },
        },
      });
      if (error) throw error;
      setMilestoneReminder(data);
    } catch {
      toast({ title: "Could not generate reminder", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const submitStory = async () => {
    if (!user || !submitForm.title.trim() || !submitForm.content.trim()) return;
    const { error } = await supabase.from("inspiration_stories").insert({
      user_id: user.id, title: submitForm.title.trim(), content: submitForm.content.trim(),
      category: submitForm.category, tags: submitForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      story_type: "user_submitted", author_name: profile?.full_name || "Community Member",
      is_approved: true, scope: submitForm.scope, emotion_theme: submitForm.emotion_theme, intent: "career",
    } as any);
    if (error) {
      toast({ title: "Failed to submit", variant: "destructive" });
    } else {
      toast({ title: "Story shared! 🎉" });
      setShowSubmit(false);
      setSubmitForm({ title: "", content: "", category: "career-shift", tags: "", scope: "local", emotion_theme: "perseverance" });
      fetchStories();
    }
  };

  const filtered = stories.filter(s => {
    const matchCat = category === "all" || s.category === category;
    const matchScope = scope === "all" || (s as any).scope === scope;
    const matchEmotion = emotion === "all" || (s as any).emotion_theme === emotion;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.tags || []).some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch && matchScope && matchEmotion;
  });

  const bookmarked = stories.filter(s => bookmarkedIds.has(s.id));
  const featured = stories.filter(s => s.is_featured);

  // Local analytics
  const categoryStats = (() => {
    const counts: Record<string, number> = {};
    stories.filter(s => likedIds.has(s.id) || bookmarkedIds.has(s.id)).forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/-/g, " "), value })).sort((a, b) => b.value - a.value);
  })();

  const emotionStats = (() => {
    const counts: Record<string, number> = {};
    stories.filter(s => likedIds.has(s.id) || bookmarkedIds.has(s.id)).forEach(s => {
      const e = (s as any).emotion_theme;
      if (e) counts[e] = (counts[e] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  })();

  const catIcon = (cat: string) => CATEGORIES.find(c => c.value === cat)?.icon || BookOpen;

  const ACTION_TYPE_MAP: Record<string, { icon: any; path: string }> = {
    learning: { icon: BookOpen, path: "/career/content-library" },
    project: { icon: FolderKanban, path: "/career/project-playground" },
    explore: { icon: Compass, path: "/career/curiosity-compass" },
    connect: { icon: Users, path: "/career/peer-circles" },
    reflect: { icon: Lightbulb, path: "/career/career-coach" },
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-primary/5 border border-primary/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Career Inspirations</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Real stories. Real people. Real journeys that show what's possible.</h1>
          <p className="text-muted-foreground max-w-2xl">Explore how others navigated career shifts, overcame fear, and found their path — to fuel yours.</p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Button onClick={() => setShowSubmit(true)} variant="outline" className="gap-2"><PenLine className="h-4 w-4" /> Share Your Story</Button>
            {user && <Button onClick={getAiSuggestions} disabled={aiLoading} className="gap-2 bg-primary text-primary-foreground"><Sparkles className="h-4 w-4" /> Personalized Picks</Button>}
            {user && <Button onClick={getMoodRecs} disabled={aiLoading} variant="outline" className="gap-2"><Heart className="h-4 w-4" /> Mood-Based</Button>}
          </div>
        </div>
      </motion.div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {aiSuggestions && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div><CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Personalized For You</CardTitle>
                  <CardDescription>{aiSuggestions.motivational_message}</CardDescription></div>
                <Button size="icon" variant="ghost" onClick={() => setAiSuggestions(null)}><X className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {(aiSuggestions.suggestions || []).map((s: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-background border">
                      <p className="font-medium text-sm">{s.title}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{s.category}</Badge>
                      {s.emotion_theme && <Badge variant="outline" className="ml-1 text-xs">{s.emotion_theme}</Badge>}
                      <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Recommendations */}
      <AnimatePresence>
        {moodRecs && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div><CardTitle className="text-lg flex items-center gap-2"><Heart className="h-5 w-5 text-accent-foreground" /> Based on Your Mood</CardTitle>
                  <CardDescription>{moodRecs.encouraging_message}</CardDescription></div>
                <Button size="icon" variant="ghost" onClick={() => setMoodRecs(null)}><X className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(moodRecs.recommended_categories || []).map((r: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-background border">
                      <p className="font-medium text-sm">{r.category}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.reason}</p>
                      <p className="text-xs text-primary mt-1">✨ {r.emotional_benefit}</p>
                    </div>
                  ))}
                </div>
                {moodRecs.self_care_tip && <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">💡 Self-care tip: {moodRecs.self_care_tip}</p>}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="explore" className="gap-1"><BookOpen className="h-4 w-4" /> Explore</TabsTrigger>
          <TabsTrigger value="featured" className="gap-1"><Star className="h-4 w-4" /> Featured</TabsTrigger>
          <TabsTrigger value="saved" className="gap-1"><Bookmark className="h-4 w-4" /> Saved</TabsTrigger>
          <TabsTrigger value="insights" className="gap-1"><BarChart3 className="h-4 w-4" /> Insights</TabsTrigger>
          <TabsTrigger value="connect" className="gap-1"><Zap className="h-4 w-4" /> Connect</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-4 mt-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search stories, tags..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="w-full sm:w-44"><Globe className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>{SCOPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={emotion} onValueChange={setEmotion}>
              <SelectTrigger className="w-full sm:w-44"><Heart className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>{EMOTIONS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => {
              const Icon = c.icon;
              return (
                <Button key={c.value} variant={category === c.value ? "default" : "outline"} size="sm" onClick={() => setCategory(c.value)} className="gap-1">
                  <Icon className="h-3 w-3" /> {c.label}
                </Button>
              );
            })}
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map(i => <div key={i} className="h-60 rounded-xl bg-muted animate-pulse" />)}</div>
          ) : (
            <StoryGrid stories={filtered} onOpen={openStory} onLike={toggleLike} onBookmark={toggleBookmark} likedIds={likedIds} bookmarkedIds={bookmarkedIds} catIcon={catIcon} />
          )}
        </TabsContent>

        <TabsContent value="featured" className="mt-4">
          <StoryGrid stories={featured} onOpen={openStory} onLike={toggleLike} onBookmark={toggleBookmark} likedIds={likedIds} bookmarkedIds={bookmarkedIds} catIcon={catIcon} />
        </TabsContent>

        <TabsContent value="saved" className="mt-4">
          {bookmarked.length === 0 ? (
            <Card className="p-8 text-center"><Bookmark className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">No saved stories yet. Bookmark stories that inspire you!</p></Card>
          ) : (
            <StoryGrid stories={bookmarked} onOpen={openStory} onLike={toggleLike} onBookmark={toggleBookmark} likedIds={likedIds} bookmarkedIds={bookmarkedIds} catIcon={catIcon} />
          )}
        </TabsContent>

        {/* ====== INSIGHTS TAB ====== */}
        <TabsContent value="insights" className="mt-4 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="font-display text-2xl text-foreground">{likedIds.size}</p>
              <p className="text-xs text-muted-foreground">Stories Liked</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="font-display text-2xl text-foreground">{bookmarkedIds.size}</p>
              <p className="text-xs text-muted-foreground">Stories Saved</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="font-display text-2xl text-foreground">{stories.filter(s => s.user_id === user?.id).length}</p>
              <p className="text-xs text-muted-foreground">Stories Shared</p>
            </Card>
          </div>

          {categoryStats.length > 0 && (
            <Card className="p-5 space-y-3">
              <h3 className="font-display text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Engagement by Category</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {emotionStats.length > 0 && (
            <Card className="p-5 space-y-3">
              <h3 className="font-display text-base flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Emotion Themes</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={emotionStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {emotionStats.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={getImpactAnalysis} disabled={aiLoading}><Brain className="h-4 w-4 mr-1" /> AI Impact Analysis</Button>
            <Button variant="outline" size="sm" onClick={getMilestoneReminder} disabled={aiLoading}><Award className="h-4 w-4 mr-1" /> Milestone Reminder</Button>
          </div>

          {impactAnalysis && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base">🧠 Impact Analysis</h3>
                  <Button variant="ghost" size="sm" onClick={() => setImpactAnalysis(null)}>✕</Button>
                </div>
                {impactAnalysis.engagement_summary && <p className="text-sm text-muted-foreground">{impactAnalysis.engagement_summary}</p>}
                {impactAnalysis.motivation_type && <p className="text-sm"><strong>Motivation Type:</strong> {impactAnalysis.motivation_type}</p>}
                {impactAnalysis.dominant_themes?.map((t: any, i: number) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-3">
                    <p className="font-display text-sm">{t.theme} <Badge variant="secondary" className="text-[10px] ml-1">×{t.count}</Badge></p>
                    <p className="text-xs text-muted-foreground">{t.impact}</p>
                  </div>
                ))}
                {impactAnalysis.growth_indicators?.length > 0 && (
                  <div><p className="text-xs font-semibold text-muted-foreground mb-1">Growth Indicators</p>
                    <div className="flex gap-1 flex-wrap">{impactAnalysis.growth_indicators.map((g: string, i: number) => <Badge key={i} variant="default" className="text-[10px]">{g}</Badge>)}</div>
                  </div>
                )}
                {impactAnalysis.blind_spots?.length > 0 && (
                  <div><p className="text-xs font-semibold text-muted-foreground mb-1">Areas to Explore</p>
                    <div className="flex gap-1 flex-wrap">{impactAnalysis.blind_spots.map((b: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{b}</Badge>)}</div>
                  </div>
                )}
                {impactAnalysis.next_exploration && <p className="text-sm text-primary">Next: {impactAnalysis.next_exploration}</p>}
              </Card>
            </motion.div>
          )}

          {milestoneReminder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="p-5 space-y-3 border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base">🎯 Milestone Reminder</h3>
                  <Button variant="ghost" size="sm" onClick={() => setMilestoneReminder(null)}>✕</Button>
                </div>
                {milestoneReminder.reminder_message && <p className="text-sm">{milestoneReminder.reminder_message}</p>}
                {milestoneReminder.story_connections?.map((sc: any, i: number) => (
                  <div key={i} className="bg-background rounded-lg p-3">
                    <p className="font-display text-sm">{sc.theme}</p>
                    <p className="text-xs text-muted-foreground">{sc.connection_to_progress}</p>
                  </div>
                ))}
                {milestoneReminder.next_action && <p className="text-sm"><strong>Next Action:</strong> {milestoneReminder.next_action}</p>}
                {milestoneReminder.celebration && <p className="text-sm text-primary font-semibold">🎉 {milestoneReminder.celebration}</p>}
                {milestoneReminder.encouragement && <p className="text-sm italic text-muted-foreground">{milestoneReminder.encouragement}</p>}
              </Card>
            </motion.div>
          )}

          {categoryStats.length === 0 && !impactAnalysis && !milestoneReminder && (
            <Card className="p-8 text-center"><BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" /><p className="text-muted-foreground">Engage with stories to see your inspiration insights!</p></Card>
          )}
        </TabsContent>

        {/* ====== CONNECT TAB ====== */}
        <TabsContent value="connect" className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">Turn inspiration into action by connecting with tools across your career journey:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {CONNECT_LINKS.map((link, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/30 transition-all group"
                onClick={() => navigate(link.path)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <link.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm text-foreground group-hover:text-primary transition-colors">{link.label}</h4>
                    <p className="text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>

          <Card className="p-5 space-y-3">
            <h3 className="font-display text-base flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Inspiration Summary</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div><p className="font-display text-xl text-foreground">{stories.length}</p><p className="text-[10px] text-muted-foreground">Total Stories</p></div>
              <div><p className="font-display text-xl text-foreground">{likedIds.size}</p><p className="text-[10px] text-muted-foreground">Liked</p></div>
              <div><p className="font-display text-xl text-foreground">{bookmarkedIds.size}</p><p className="text-[10px] text-muted-foreground">Saved</p></div>
              <div><p className="font-display text-xl text-foreground">{featured.length}</p><p className="text-[10px] text-muted-foreground">Featured</p></div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Story Detail Dialog */}
      <Dialog open={!!selectedStory} onOpenChange={open => !open && setSelectedStory(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedStory && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="secondary">{selectedStory.category}</Badge>
                  {(selectedStory as any).scope && <Badge variant="outline" className="gap-1"><Globe className="h-3 w-3" /> {(selectedStory as any).scope}</Badge>}
                  {(selectedStory as any).emotion_theme && <Badge className="bg-primary/10 text-primary">{(selectedStory as any).emotion_theme}</Badge>}
                  {selectedStory.is_featured && <Badge className="bg-amber-500/20 text-amber-700">⭐ Featured</Badge>}
                </div>
                <DialogTitle className="text-xl">{selectedStory.title}</DialogTitle>
                {selectedStory.author_name && (
                  <p className="text-sm text-muted-foreground">By {selectedStory.author_name}{selectedStory.author_role ? ` — ${selectedStory.author_role}` : ""}</p>
                )}
              </DialogHeader>
              <div className="prose prose-sm dark:prose-invert max-w-none mt-2">
                {selectedStory.content.split("\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(selectedStory.tags || []).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 border-t pt-4 flex-wrap">
                <Button size="sm" variant={likedIds.has(selectedStory.id) ? "default" : "outline"} onClick={() => toggleLike(selectedStory.id)} className="gap-1">
                  <Heart className={`h-4 w-4 ${likedIds.has(selectedStory.id) ? "fill-current" : ""}`} /> {selectedStory.likes_count || 0}
                </Button>
                <Button size="sm" variant={bookmarkedIds.has(selectedStory.id) ? "default" : "outline"} onClick={() => toggleBookmark(selectedStory.id)} className="gap-1">
                  <Bookmark className={`h-4 w-4 ${bookmarkedIds.has(selectedStory.id) ? "fill-current" : ""}`} /> Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => saveToMoodboard(selectedStory)} className="gap-1">
                  <Palette className="h-4 w-4" /> Moodboard
                </Button>
                <Button size="sm" variant="outline" onClick={() => getReflection(selectedStory)} disabled={aiLoading} className="gap-1">
                  <Sparkles className="h-4 w-4" /> Reflect
                </Button>
                <Button size="sm" variant="outline" onClick={() => getStoryActions(selectedStory)} disabled={aiLoading} className="gap-1 ml-auto">
                  <Target className="h-4 w-4" /> Action Plan
                </Button>
              </div>

              {/* Reflection Prompts */}
              <AnimatePresence>
                {reflectionPrompts && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-3 space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><Lightbulb className="h-4 w-4 text-primary" /> Reflection Prompts</h4>
                    {reflectionPrompts.prompts?.map((p: any, i: number) => (
                      <div key={i} className="text-sm">
                        <p className="font-medium">{p.question}</p>
                        <p className="text-xs text-muted-foreground">{p.focus_area}</p>
                      </div>
                    ))}
                    {reflectionPrompts.key_takeaway && <p className="text-sm border-t pt-2"><strong>Key Takeaway:</strong> {reflectionPrompts.key_takeaway}</p>}
                    {reflectionPrompts.action_step && <p className="text-sm"><strong>Next Step:</strong> {reflectionPrompts.action_step}</p>}
                    <p className="text-xs text-muted-foreground italic">📓 Auto-saved to your journal</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Story-to-Action Plan */}
              <AnimatePresence>
                {storyActions && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Action Plan from This Story</h4>
                    <div className="space-y-2">
                      {storyActions.actions?.map((a: any, i: number) => {
                        const mapped = ACTION_TYPE_MAP[a.type] || { icon: ArrowRight, path: "#" };
                        const Icon = mapped.icon;
                        return (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(mapped.path)}>
                            <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">{a.action}</p>
                              <div className="flex gap-1 mt-0.5">
                                <Badge variant="secondary" className="text-[10px] capitalize">{a.type}</Badge>
                                <Badge variant="outline" className="text-[10px] capitalize">{a.urgency}</Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {storyActions.skill_gaps?.length > 0 && (
                      <div><p className="text-xs font-semibold text-muted-foreground mb-1">Skills to Build</p>
                        <div className="flex gap-1 flex-wrap">{storyActions.skill_gaps.map((s: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
                      </div>
                    )}
                    {storyActions.roadmap_suggestion && <p className="text-xs text-primary">🗺️ {storyActions.roadmap_suggestion}</p>}
                    {storyActions.mentor_match_criteria && <p className="text-xs text-muted-foreground">🤝 Mentor match: {storyActions.mentor_match_criteria}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Comments */}
              <div className="mt-4 border-t pt-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-1"><MessageCircle className="h-4 w-4" /> Discussion ({comments.length})</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {comments.map(c => (
                    <div key={c.id} className="text-sm p-2 bg-muted rounded-lg">
                      <p>{c.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
                {user && (
                  <div className="flex gap-2 mt-3">
                    <Input placeholder="Share your thoughts..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()} />
                    <Button size="icon" onClick={addComment}><Send className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Submit Story Dialog */}
      <Dialog open={showSubmit} onOpenChange={setShowSubmit}>
        <DialogContent>
          <DialogHeader><DialogTitle>Share Your Career Story</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Story title" value={submitForm.title} onChange={e => setSubmitForm(p => ({ ...p, title: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={submitForm.category} onValueChange={v => setSubmitForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>{CATEGORIES.filter(c => c.value !== "all").map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={submitForm.scope} onValueChange={v => setSubmitForm(p => ({ ...p, scope: v }))}>
                <SelectTrigger><SelectValue placeholder="Scope" /></SelectTrigger>
                <SelectContent>{SCOPES.filter(s => s.value !== "all").map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Select value={submitForm.emotion_theme} onValueChange={v => setSubmitForm(p => ({ ...p, emotion_theme: v }))}>
              <SelectTrigger><SelectValue placeholder="Emotion Theme" /></SelectTrigger>
              <SelectContent>{EMOTIONS.filter(e => e.value !== "all").map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea placeholder="Tell your story... What happened? What did you learn? What advice would you give?" value={submitForm.content} onChange={e => setSubmitForm(p => ({ ...p, content: e.target.value }))} rows={8} />
            <Input placeholder="Tags (comma-separated)" value={submitForm.tags} onChange={e => setSubmitForm(p => ({ ...p, tags: e.target.value }))} />
            <Button onClick={submitStory} className="w-full gap-2" disabled={!submitForm.title || !submitForm.content}>
              <Send className="h-4 w-4" /> Share Story
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StoryGrid({ stories, onOpen, onLike, onBookmark, likedIds, bookmarkedIds, catIcon }: {
  stories: Story[];
  onOpen: (s: Story) => void;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  likedIds: Set<string>;
  bookmarkedIds: Set<string>;
  catIcon: (cat: string) => any;
}) {
  if (stories.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-muted-foreground">No stories found. Try adjusting your filters or share your own!</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story, i) => {
        const Icon = catIcon(story.category);
        return (
          <motion.div key={story.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onOpen(story)}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{story.category}</Badge>
                    {(story as any).scope && (story as any).scope !== "global" && (
                      <Badge variant="outline" className="text-xs gap-0.5"><MapPin className="h-2.5 w-2.5" /> {(story as any).scope}</Badge>
                    )}
                  </div>
                  {story.is_featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                </div>
                <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">{story.title}</CardTitle>
                {story.author_name && <p className="text-xs text-muted-foreground">{story.author_name}</p>}
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <p className="text-sm text-muted-foreground line-clamp-3">{story.summary || story.content.slice(0, 150) + "..."}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(story as any).emotion_theme && <Badge className="text-xs bg-primary/10 text-primary border-0">{(story as any).emotion_theme}</Badge>}
                  {(story.tags || []).slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <div className="flex items-center gap-3 w-full" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onLike(story.id)} className={`flex items-center gap-1 text-xs transition-colors ${likedIds.has(story.id) ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}>
                    <Heart className={`h-3.5 w-3.5 ${likedIds.has(story.id) ? "fill-current" : ""}`} /> {story.likes_count || 0}
                  </button>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" /> {story.comments_count || 0}
                  </span>
                  <button onClick={() => onBookmark(story.id)} className={`flex items-center gap-1 text-xs ml-auto transition-colors ${bookmarkedIds.has(story.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                    <Bookmark className={`h-3.5 w-3.5 ${bookmarkedIds.has(story.id) ? "fill-current" : ""}`} />
                  </button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
