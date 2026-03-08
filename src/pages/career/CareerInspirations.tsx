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
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, Bookmark, MessageCircle, Search, Sparkles, Filter, Send, Plus,
  BookOpen, TrendingUp, Lightbulb, Users, Star, ArrowRight, RefreshCw,
  Flame, Shield, Rocket, PenLine, X, Globe, MapPin, Building2, Palette,
  Brain, Compass, Map, FileText, FolderKanban, UserCheck, Bot
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

const ACTION_SUGGESTIONS = [
  { label: "Explore similar domains", icon: Compass, path: "/dashboard/curiosity-compass", color: "text-blue-500" },
  { label: "Add to Moodboard", icon: Palette, path: "/dashboard/career-moodboard", color: "text-purple-500" },
  { label: "Find a mentor", icon: UserCheck, path: "/dashboard/mentor-matchmaking", color: "text-green-500" },
  { label: "Update your roadmap", icon: Map, path: "/dashboard/roadmap", color: "text-orange-500" },
  { label: "Start a project", icon: FolderKanban, path: "/dashboard/project-playground", color: "text-cyan-500" },
  { label: "Browse learning", icon: BookOpen, path: "/dashboard/content-library", color: "text-rose-500" },
  { label: "Talk to Career Coach", icon: Bot, path: "/dashboard/career-coach", color: "text-amber-500" },
  { label: "Update Living Resume", icon: FileText, path: "/dashboard/living-resume", color: "text-indigo-500" },
];

export default function CareerInspirations() {
  const { user } = useAuth();
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

  useEffect(() => {
    fetchStories();
    if (user) { fetchBookmarks(); fetchLikes(); }
  }, [user]);

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
    }
  };

  const saveToMoodboard = async (story: Story) => {
    if (!user) return;
    try {
      const { data: boards } = await (supabase
        .from("moodboards" as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("board_type", "inspiration")
        .limit(1) as any) as { data: any[] | null };

      let boardId: string;
      if (boards && boards.length > 0) {
        boardId = boards[0].id;
      } else {
        const { data: newBoard } = await (supabase
          .from("moodboards" as any)
          .insert({ user_id: user.id, title: "Career Inspirations", board_type: "inspiration", intent: "career" } as any)
          .select("id")
          .single() as any) as { data: any };
        boardId = newBoard!.id;
      }

      await (supabase.from("moodboard_items" as any) as any).insert({
        moodboard_id: boardId,
        user_id: user.id,
        item_type: "quote",
        content: story.title,
        notes: story.summary || story.content.slice(0, 200),
        tags: story.tags || [],
        emotion_tag: (story as any).emotion_theme || "inspired",
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
    const { data } = await supabase
      .from("inspiration_comments").select("*").eq("story_id", story.id).order("created_at", { ascending: true });
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
    }
  };

  const getReflection = async (story: Story) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("inspirations-ai", {
        body: { type: "reflection_prompt", context: { title: story.title, content: story.content, category: story.category, domain: "career" } },
      });
      if (error) throw error;
      setReflectionPrompts(data);
      setShowActions(true);
    } catch {
      toast({ title: "Could not generate reflection", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const getAiSuggestions = async () => {
    setAiLoading(true);
    try {
      const { data: skills } = await supabase.from("skills").select("skill_name, proficiency_level").eq("user_id", user!.id).limit(10);
      const { data: interests } = await supabase.from("interests").select("name, category").eq("user_id", user!.id).limit(10);
      const { data, error } = await supabase.functions.invoke("inspirations-ai", {
        body: { type: "career_suggest", context: { skills, interests, domain: "career", currentMood: "curious" } },
      });
      if (error) throw error;
      setAiSuggestions(data);
    } catch {
      toast({ title: "Could not get suggestions", variant: "destructive" });
    }
    setAiLoading(false);
  };

  const submitStory = async () => {
    if (!user || !submitForm.title.trim() || !submitForm.content.trim()) return;
    const { error } = await supabase.from("inspiration_stories").insert({
      user_id: user.id,
      title: submitForm.title.trim(),
      content: submitForm.content.trim(),
      category: submitForm.category,
      tags: submitForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      story_type: "user_submitted",
      author_name: "Community Member",
      is_approved: true,
      scope: submitForm.scope,
      emotion_theme: submitForm.emotion_theme,
      intent: "career",
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

  const catIcon = (cat: string) => CATEGORIES.find(c => c.value === cat)?.icon || BookOpen;

  return (
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-purple-500/20 border border-blue-500/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-6 w-6 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">Career Inspirations</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Real stories. Real people. Real journeys that show what's possible.</h1>
          <p className="text-muted-foreground max-w-2xl">Explore how others navigated career shifts, overcame fear, and found their path — to fuel yours.</p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Button onClick={() => setShowSubmit(true)} variant="outline" className="gap-2"><PenLine className="h-4 w-4" /> Share Your Story</Button>
            {user && <Button onClick={getAiSuggestions} disabled={aiLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"><Sparkles className="h-4 w-4" /> Get Personalized Picks</Button>}
          </div>
        </div>
      </motion.div>

      {/* AI Suggestions */}
      <AnimatePresence>
        {aiSuggestions && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-500" /> Personalized For You</CardTitle>
                  <CardDescription>{aiSuggestions.motivational_message}</CardDescription>
                </div>
                <Button size="icon" variant="ghost" onClick={() => setAiSuggestions(null)}><X className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {(aiSuggestions.suggestions || []).map((s: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-background border">
                      <p className="font-medium text-sm">{s.title}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">{s.category}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="explore" className="gap-1"><BookOpen className="h-4 w-4" /> Explore</TabsTrigger>
          <TabsTrigger value="featured" className="gap-1"><Star className="h-4 w-4" /> Featured</TabsTrigger>
          <TabsTrigger value="saved" className="gap-1"><Bookmark className="h-4 w-4" /> Saved</TabsTrigger>
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

          {/* Category pills */}
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <div key={i} className="h-60 rounded-xl bg-muted animate-pulse" />)}
            </div>
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
                  {(selectedStory as any).emotion_theme && <Badge className="bg-blue-500/10 text-blue-700">{(selectedStory as any).emotion_theme}</Badge>}
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
                <Button size="sm" variant="outline" onClick={() => getReflection(selectedStory)} disabled={aiLoading} className="gap-1 ml-auto">
                  <Sparkles className="h-4 w-4" /> Reflect
                </Button>
              </div>

              {/* Reflection Prompts */}
              <AnimatePresence>
                {reflectionPrompts && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 mt-3 space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><Lightbulb className="h-4 w-4 text-blue-500" /> Reflection Prompts</h4>
                    {reflectionPrompts.prompts?.map((p: any, i: number) => (
                      <div key={i} className="text-sm">
                        <p className="font-medium">{p.question}</p>
                        <p className="text-xs text-muted-foreground">{p.focus_area}</p>
                      </div>
                    ))}
                    {reflectionPrompts.key_takeaway && <p className="text-sm border-t pt-2"><strong>Key Takeaway:</strong> {reflectionPrompts.key_takeaway}</p>}
                    {reflectionPrompts.action_step && <p className="text-sm"><strong>Next Step:</strong> {reflectionPrompts.action_step}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Suggestions */}
              <AnimatePresence>
                {showActions && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Turn Inspiration Into Action</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ACTION_SUGGESTIONS.map((a, i) => (
                        <a key={i} href={a.path} className="flex flex-col items-center gap-1.5 p-3 rounded-lg border hover:bg-muted transition-colors text-center">
                          <a.icon className={`h-5 w-5 ${a.color}`} />
                          <span className="text-xs font-medium">{a.label}</span>
                        </a>
                      ))}
                    </div>
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
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{story.category}</Badge>
                    {(story as any).scope && (story as any).scope !== "global" && (
                      <Badge variant="outline" className="text-xs gap-0.5"><MapPin className="h-2.5 w-2.5" /> {(story as any).scope}</Badge>
                    )}
                  </div>
                  {story.is_featured && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                </div>
                <CardTitle className="text-base leading-tight group-hover:text-blue-600 transition-colors">{story.title}</CardTitle>
                {story.author_name && <p className="text-xs text-muted-foreground">{story.author_name}</p>}
              </CardHeader>
              <CardContent className="flex-1 pb-2">
                <p className="text-sm text-muted-foreground line-clamp-3">{story.summary || story.content.slice(0, 150) + "..."}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(story as any).emotion_theme && <Badge className="text-xs bg-blue-500/10 text-blue-700 border-0">{(story as any).emotion_theme}</Badge>}
                  {(story.tags || []).slice(0, 2).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <div className="flex items-center gap-3 w-full" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onLike(story.id)} className={`flex items-center gap-1 text-xs transition-colors ${likedIds.has(story.id) ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"}`}>
                    <Heart className={`h-3.5 w-3.5 ${likedIds.has(story.id) ? "fill-current" : ""}`} /> {story.likes_count || 0}
                  </button>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" /> {story.comments_count || 0}
                  </span>
                  <button onClick={() => onBookmark(story.id)} className={`flex items-center gap-1 text-xs ml-auto transition-colors ${bookmarkedIds.has(story.id) ? "text-blue-500" : "text-muted-foreground hover:text-blue-500"}`}>
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
