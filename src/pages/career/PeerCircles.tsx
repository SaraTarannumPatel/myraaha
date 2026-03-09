import { useState, useEffect, useCallback } from "react";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, MessageCircle, Trophy, Flame, UserPlus, Search,
  Sparkles, BookOpen, Target, Heart, Star, ArrowRight, Loader2,
  Globe, Lightbulb, Zap, Award, Send, ChevronRight, Clock,
  ThumbsUp, MessageSquare, PenLine, BarChart3, Milestone,
  RefreshCw, X, CheckCircle2, AlertCircle
} from "lucide-react";

const PeerCircles = () => {
  const { user, profile } = useAuth();
  const [circles, setCircles] = useState<any[]>([]);
  const [myCircles, setMyCircles] = useState<Set<string>>(new Set());
  const [inspireWall, setInspireWall] = useState<any[]>([]);
  const [domainClubs, setDomainClubs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [myProjects, setMyProjects] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [expFilter, setExpFilter] = useState("all");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [newInspirePost, setNewInspirePost] = useState("");
  const [inspirePostType, setInspirePostType] = useState("story");
  const [engagementNudge, setEngagementNudge] = useState<any>(null);
  const [selectedCircle, setSelectedCircle] = useState<any>(null);
  const [circlePosts, setCirclePosts] = useState<any[]>([]);
  const [circleMilestones, setCircleMilestones] = useState<any[]>([]);
  const [circleMembers, setCircleMembers] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostType, setNewPostType] = useState("discussion");
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [reflectionPrompts, setReflectionPrompts] = useState<any>(null);
  const [aiDiscussionTopics, setAiDiscussionTopics] = useState<any>(null);
  const [aiProjectSuggestions, setAiProjectSuggestions] = useState<any>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likedInspire, setLikedInspire] = useState<Set<string>>(new Set());

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [circlesRes, clubsRes, inspireRes, projectsRes] = await Promise.all([
        supabase.from("peer_circles").select("*").eq("is_active", true).order("is_featured", { ascending: false }),
        supabase.from("domain_clubs").select("*").eq("is_active", true),
        supabase.from("inspire_wall_posts").select("*").order("created_at", { ascending: false }).limit(30),
        supabase.from("peer_circle_projects").select("*, peer_circles(name)").eq("status", "open").limit(20),
      ]);

      if (circlesRes.data) setCircles(circlesRes.data);
      if (clubsRes.data) setDomainClubs(clubsRes.data);
      if (inspireRes.data) setInspireWall(inspireRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);

      if (user) {
        const [memberships, projectParts, engRes] = await Promise.all([
          supabase.from("peer_circle_members").select("circle_id").eq("user_id", user.id),
          supabase.from("peer_project_participants").select("project_id").eq("user_id", user.id),
          supabase.from("peer_circle_engagement").select("*").eq("user_id", user.id),
        ]);
        if (memberships.data) setMyCircles(new Set(memberships.data.map((m: any) => m.circle_id)));
        if (projectParts.data) setMyProjects(new Set(projectParts.data.map((p: any) => p.project_id)));
        if (engRes.data) setEngagementData(engRes.data);
      }
    } catch (err) {
      console.error("Failed to load peer circles data:", err);
    } finally {
      setLoading(false);
    }
  };

  const joinCircle = async (circleId: string) => {
    if (!user) { toast.error("Please sign in to join circles."); return; }
    const { error } = await supabase.from("peer_circle_members").insert({ circle_id: circleId, user_id: user.id });
    if (error) { toast.error("Failed to join circle."); return; }
    setMyCircles(prev => new Set(prev).add(circleId));
    toast.success("Welcome to the circle! 🎉");
    // Upsert engagement
    await supabase.from("peer_circle_engagement").upsert({
      circle_id: circleId, user_id: user.id, engagement_level: "new",
    }, { onConflict: "circle_id,user_id" } as any);
  };

  const leaveCircle = async (circleId: string) => {
    if (!user) return;
    await supabase.from("peer_circle_members").delete().eq("circle_id", circleId).eq("user_id", user.id);
    setMyCircles(prev => { const s = new Set(prev); s.delete(circleId); return s; });
    toast.info("You've left the circle.");
  };

  const joinProject = async (projectId: string) => {
    if (!user) { toast.error("Please sign in first."); return; }
    const { error } = await supabase.from("peer_project_participants").insert({ project_id: projectId, user_id: user.id });
    if (error) {
      if (error.code === "23505") toast.info("You're already in this project.");
      else toast.error("Failed to join project.");
      return;
    }
    setMyProjects(prev => new Set(prev).add(projectId));
    toast.success("Joined the project! 🚀");
  };

  const openCircleDetail = async (circle: any) => {
    setSelectedCircle(circle);
    if (!user) return;
    const [postsRes, milestonesRes, membersRes] = await Promise.all([
      supabase.from("peer_circle_posts").select("*").eq("circle_id", circle.id).order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(30),
      supabase.from("peer_circle_milestones").select("*").eq("circle_id", circle.id).order("achieved_at", { ascending: false }).limit(10),
      supabase.from("peer_circle_members").select("*").eq("circle_id", circle.id).limit(50),
    ]);
    if (postsRes.data) setCirclePosts(postsRes.data);
    if (milestonesRes.data) setCircleMilestones(milestonesRes.data);
    if (membersRes.data) setCircleMembers(membersRes.data);
    // Update last active
    await supabase.from("peer_circle_members").update({ last_active_at: new Date().toISOString() }).eq("circle_id", circle.id).eq("user_id", user.id);
  };

  const createCirclePost = async () => {
    if (!user || !selectedCircle || !newPostContent.trim()) return;
    const { error } = await supabase.from("peer_circle_posts").insert({
      circle_id: selectedCircle.id, user_id: user.id, content: newPostContent.trim(),
      title: newPostTitle.trim() || null, post_type: newPostType,
    });
    if (error) { toast.error("Failed to post."); return; }
    setNewPostContent(""); setNewPostTitle("");
    toast.success("Posted! 💬");
    // Refresh
    const { data } = await supabase.from("peer_circle_posts").select("*").eq("circle_id", selectedCircle.id).order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(30);
    if (data) setCirclePosts(data);
    // Update engagement
    await supabase.from("peer_circle_engagement").upsert({
      circle_id: selectedCircle.id, user_id: user.id, posts_count: (engagementData.find(e => e.circle_id === selectedCircle.id)?.posts_count || 0) + 1,
    }, { onConflict: "circle_id,user_id" } as any);
  };

  const loadComments = async (postId: string) => {
    const { data } = await supabase.from("peer_circle_comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
    if (data) setPostComments(prev => ({ ...prev, [postId]: data }));
  };

  const addComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;
    const { error } = await supabase.from("peer_circle_comments").insert({ post_id: postId, user_id: user.id, content: newComment[postId].trim() });
    if (error) { toast.error("Failed to comment."); return; }
    setNewComment(prev => ({ ...prev, [postId]: "" }));
    loadComments(postId);
  };

  const likeInspirePost = async (postId: string) => {
    if (!user) return;
    if (likedInspire.has(postId)) return;
    setLikedInspire(prev => new Set(prev).add(postId));
    await supabase.from("inspire_wall_posts").update({ likes_count: (inspireWall.find(p => p.id === postId)?.likes_count || 0) + 1 }).eq("id", postId);
    setInspireWall(prev => prev.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
  };

  const postToInspireWall = async () => {
    if (!user || !newInspirePost.trim()) return;
    const { error } = await supabase.from("inspire_wall_posts").insert({
      user_id: user.id, content: newInspirePost.trim(), post_type: inspirePostType,
    });
    if (error) { toast.error("Failed to post."); return; }
    setNewInspirePost("");
    toast.success("Posted to Inspire Wall! ✨");
    loadData();
  };

  const getSmartRecommendations = async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const [{ data: interests }, { data: energy }, { data: affinity }, { data: skills }] = await Promise.all([
        supabase.from("interests").select("*").eq("user_id", user.id).limit(10),
        supabase.from("energy_zones").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(5),
        supabase.from("domain_affinity").select("*").eq("user_id", user.id).limit(5),
        supabase.from("skills").select("*").eq("user_id", user.id).limit(10),
      ]);
      const { data, error } = await supabase.functions.invoke("peer-circles-ai", {
        body: {
          type: "recommend_circles",
          context: {
            interests: interests || [], energy_zones: energy || [], domain_affinity: affinity || [], skills: skills || [],
            available_circles: circles.map(c => ({ name: c.name, domain: c.domain, focus: c.learning_focus, activity: c.activity_type, experience_level: c.experience_level })),
            user_profile: { career_stage: profile?.career_stage, areas_of_focus: profile?.areas_of_focus },
          },
        },
      });
      if (error) throw error;
      setAiRecommendations(data);
      toast.success("AI recommendations ready!");
    } catch {
      toast.error("Failed to get recommendations.");
    } finally {
      setAiLoading(false);
    }
  };

  const getEngagementNudge = async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const { data: recentMoods } = await supabase.from("mood_checkins").select("mood, energy_level").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3);
      const { data, error } = await supabase.functions.invoke("peer-circles-ai", {
        body: {
          type: "engagement_nudge",
          context: {
            joined_circles: Array.from(myCircles),
            circle_names: circles.filter(c => myCircles.has(c.id)).map(c => c.name),
            recent_moods: recentMoods || [],
            engagement_data: engagementData,
          },
        },
      });
      if (error) throw error;
      setEngagementNudge(data);
    } catch {
      toast.error("Failed to get nudge.");
    } finally {
      setAiLoading(false);
    }
  };

  const getDiscussionTopics = async () => {
    if (!user || !selectedCircle) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("peer-circles-ai", {
        body: {
          type: "generate_discussion",
          context: { circle_name: selectedCircle.name, domain: selectedCircle.domain, learning_focus: selectedCircle.learning_focus },
        },
      });
      if (error) throw error;
      setAiDiscussionTopics(data);
    } catch {
      toast.error("Failed to generate topics.");
    } finally {
      setAiLoading(false);
    }
  };

  const getProjectSuggestions = async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const joinedNames = circles.filter(c => myCircles.has(c.id)).map(c => ({ name: c.name, domain: c.domain }));
      const { data, error } = await supabase.functions.invoke("peer-circles-ai", {
        body: {
          type: "collaborative_project",
          context: { circles: joinedNames, user_skills: profile?.areas_of_focus || [] },
        },
      });
      if (error) throw error;
      setAiProjectSuggestions(data);
    } catch {
      toast.error("Failed to get project suggestions.");
    } finally {
      setAiLoading(false);
    }
  };

  const getReflectionPrompts = async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("peer-circles-ai", {
        body: {
          type: "reflection_prompt",
          context: {
            recent_activities: engagementData.slice(0, 3),
            circles: circles.filter(c => myCircles.has(c.id)).map(c => c.name),
          },
        },
      });
      if (error) throw error;
      setReflectionPrompts(data);
      setShowReflection(true);
    } catch {
      toast.error("Failed to get reflection prompts.");
    } finally {
      setAiLoading(false);
    }
  };

  const saveReflection = async () => {
    if (!user || !reflectionText.trim()) return;
    await supabase.from("journal_entries").insert({
      user_id: user.id, content: reflectionText.trim(), title: "Peer Circle Reflection",
      tags: ["peer-circles", "reflection"], mood: "reflective",
    });
    toast.success("Reflection saved to journal! 📝");
    setShowReflection(false);
    setReflectionText("");
  };

  const filteredCircles = circles.filter(c => {
    const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = domainFilter === "all" || c.domain === domainFilter;
    const matchesActivity = activityFilter === "all" || c.activity_type === activityFilter;
    const matchesExp = expFilter === "all" || c.experience_level === expFilter;
    return matchesSearch && matchesDomain && matchesActivity && matchesExp;
  });

  const joinedCircles = circles.filter(c => myCircles.has(c.id));
  const domains = [...new Set(circles.map(c => c.domain).filter(Boolean))];
  const activityTypes = [...new Set(circles.map(c => c.activity_type).filter(Boolean))];
  const expLevels = [...new Set(circles.map(c => c.experience_level).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Peer Circles</h1>
            <p className="font-body text-sm text-muted-foreground">Join learning circles where peers like you grow together — explore, discuss, and achieve more.</p>
          </div>
        </div>
      </motion.div>

      {/* AI Nudge Banner */}
      {engagementNudge && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
          <Sparkles size={20} className="text-accent mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-body text-sm text-foreground">{engagementNudge.nudge_message}</p>
            {engagementNudge.suggested_action && <p className="font-body text-xs text-muted-foreground mt-1">💡 {engagementNudge.suggested_action}</p>}
            {engagementNudge.mood_based_suggestion && <p className="font-body text-xs text-accent mt-1">{engagementNudge.mood_based_suggestion}</p>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEngagementNudge(null)}><X size={14} /></Button>
        </motion.div>
      )}

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="discover" className="font-body text-xs"><Search size={14} className="mr-1" />Discover</TabsTrigger>
          <TabsTrigger value="my-circles" className="font-body text-xs"><Heart size={14} className="mr-1" />My Circles ({joinedCircles.length})</TabsTrigger>
          <TabsTrigger value="inspire" className="font-body text-xs"><Flame size={14} className="mr-1" />Inspire Wall</TabsTrigger>
          <TabsTrigger value="clubs" className="font-body text-xs"><Globe size={14} className="mr-1" />Domain Clubs</TabsTrigger>
          <TabsTrigger value="projects" className="font-body text-xs"><Target size={14} className="mr-1" />Projects</TabsTrigger>
          <TabsTrigger value="engagement" className="font-body text-xs"><BarChart3 size={14} className="mr-1" />Engagement</TabsTrigger>
          <TabsTrigger value="ai-insights" className="font-body text-xs"><Sparkles size={14} className="mr-1" />AI Insights</TabsTrigger>
        </TabsList>

        {/* DISCOVER TAB */}
        <TabsContent value="discover" className="space-y-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search circles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 font-body text-sm" />
            </div>
            <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
              <option value="all">All Domains</option>
              {domains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={activityFilter} onChange={e => setActivityFilter(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
              <option value="all">All Activities</option>
              {activityTypes.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={expFilter} onChange={e => setExpFilter(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
              <option value="all">All Levels</option>
              {expLevels.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {filteredCircles.some(c => c.is_featured) && (
            <div>
              <h2 className="font-display text-lg text-foreground mb-3 flex items-center gap-2"><Star size={16} className="text-accent" /> Featured Circles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCircles.filter(c => c.is_featured).map((circle, i) => (
                  <CircleCard key={circle.id} circle={circle} index={i} joined={myCircles.has(circle.id)} onJoin={joinCircle} onLeave={leaveCircle} onOpen={openCircleDetail} />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-display text-lg text-foreground mb-3">All Circles ({filteredCircles.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCircles.map((circle, i) => (
                <CircleCard key={circle.id} circle={circle} index={i} joined={myCircles.has(circle.id)} onJoin={joinCircle} onLeave={leaveCircle} onOpen={openCircleDetail} />
              ))}
            </div>
            {filteredCircles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-body">No circles match your filters.</div>
            )}
          </div>
        </TabsContent>

        {/* MY CIRCLES TAB */}
        <TabsContent value="my-circles" className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-primary" />
              <h2 className="font-display text-xl text-foreground">My Circles</h2>
            </div>
            <Button size="sm" variant="outline" onClick={getReflectionPrompts} disabled={aiLoading}>
              <PenLine size={14} /> Reflect
            </Button>
          </div>

          {joinedCircles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="font-body text-sm text-muted-foreground mb-3">You haven't joined any circles yet.</p>
                <Button variant="outline" size="sm" onClick={() => document.querySelector<HTMLButtonElement>('[value="discover"]')?.click()}>
                  <Search size={14} /> Discover Circles
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {joinedCircles.map((circle, i) => {
                const eng = engagementData.find(e => e.circle_id === circle.id);
                return (
                  <motion.div key={circle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{circle.icon_emoji}</span>
                            <div>
                              <CardTitle className="text-base font-display">{circle.name}</CardTitle>
                              <CardDescription className="text-xs">{circle.learning_focus}</CardDescription>
                            </div>
                          </div>
                          <Badge className="text-[10px]">Joined</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        <p className="font-body text-sm text-muted-foreground">{circle.description}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Users size={12} /> {circle.member_count}</span>
                          <Badge variant="outline" className="text-[10px]">{circle.activity_type}</Badge>
                          {eng && <Badge variant="secondary" className="text-[10px]">{eng.engagement_level || "active"}</Badge>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => openCircleDetail(circle)}>
                            <MessageCircle size={12} /> Open Circle
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => leaveCircle(circle.id)}>Leave</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* INSPIRE WALL TAB */}
        <TabsContent value="inspire" className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={20} className="text-accent" />
            <h2 className="font-display text-xl text-foreground">Inspire Wall</h2>
          </div>
          <p className="font-body text-sm text-muted-foreground">Share achievements, tips, stories, milestones, or questions with your peers.</p>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-3 items-center">
                <Select value={inspirePostType} onValueChange={setInspirePostType}>
                  <SelectTrigger className="w-[140px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="achievement">🏆 Achievement</SelectItem>
                    <SelectItem value="tip">💡 Tip</SelectItem>
                    <SelectItem value="story">📖 Story</SelectItem>
                    <SelectItem value="milestone">🎯 Milestone</SelectItem>
                    <SelectItem value="question">❓ Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Input placeholder="Share something inspiring..." value={newInspirePost} onChange={e => setNewInspirePost(e.target.value)} className="font-body text-sm" onKeyDown={e => e.key === "Enter" && postToInspireWall()} />
                <Button onClick={postToInspireWall} size="sm" disabled={!newInspirePost.trim()}><Send size={14} /> Post</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {inspireWall.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-body text-sm text-foreground">{post.content}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {post.post_type === "achievement" ? "🏆" : post.post_type === "tip" ? "💡" : post.post_type === "milestone" ? "🎯" : post.post_type === "question" ? "❓" : "📖"} {post.post_type}
                      </Badge>
                      {post.tags?.map((tag: string) => <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>)}
                      <button onClick={() => likeInspirePost(post.id)} className={`ml-auto flex items-center gap-1 text-[10px] transition-colors ${likedInspire.has(post.id) ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
                        <Heart size={12} fill={likedInspire.has(post.id) ? "currentColor" : "none"} /> {post.likes_count || 0}
                      </button>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MessageSquare size={12} /> {post.comments_count || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {inspireWall.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-body">Be the first to share something inspiring!</div>
            )}
          </div>
        </TabsContent>

        {/* DOMAIN CLUBS TAB */}
        <TabsContent value="clubs" className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={20} className="text-primary" />
            <h2 className="font-display text-xl text-foreground">Domain Clubs</h2>
          </div>
          <p className="font-body text-sm text-muted-foreground">Curated communities organized by domain with workshops, events, and discussions.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domainClubs.map((club, i) => (
              <motion.div key={club.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{club.icon_emoji}</span>
                      <div>
                        <CardTitle className="text-base font-display">{club.name}</CardTitle>
                        <CardDescription className="text-xs">{club.domain}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="font-body text-sm text-muted-foreground">{club.description}</p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Users size={12} /> {club.member_count} members</span>
                      <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><BookOpen size={12} /> {club.workshops_count} workshops</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {club.tags?.map((tag: string) => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {domainClubs.length === 0 && <div className="text-center py-12 text-muted-foreground font-body col-span-full">No domain clubs available yet.</div>}
          </div>
        </TabsContent>

        {/* PROJECTS TAB */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-primary" />
              <h2 className="font-display text-xl text-foreground">Collaborative Projects</h2>
            </div>
            <Button size="sm" variant="outline" onClick={getProjectSuggestions} disabled={aiLoading}>
              <Sparkles size={14} /> AI Suggest
            </Button>
          </div>
          <p className="font-body text-sm text-muted-foreground">Join group challenges, hackathons, and peer-driven tasks.</p>

          {aiProjectSuggestions && (
            <Card className="border-accent/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><Sparkles size={14} className="text-accent" /> AI Project Ideas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiProjectSuggestions.projects?.map((p: any, i: number) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-display text-sm">{p.title}</h4>
                      <Badge variant="outline" className="text-[10px]">{p.project_type}</Badge>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">{p.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.skills_targeted?.map((s: string) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                      <span>{p.difficulty}</span>
                      <span>{p.estimated_duration}</span>
                      <span>Max {p.max_participants} people</span>
                    </div>
                  </div>
                ))}
                {aiProjectSuggestions.team_formation_tips?.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="font-body text-xs font-medium text-foreground mb-1">Team Formation Tips:</p>
                    {aiProjectSuggestions.team_formation_tips.map((t: string, i: number) => (
                      <p key={i} className="font-body text-xs text-muted-foreground flex items-start gap-1"><ChevronRight size={10} className="mt-0.5 shrink-0 text-accent" />{t}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {projects.length === 0 ? (
            <Card><CardContent className="p-8 text-center">
              <Target size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="font-body text-sm text-muted-foreground">No open projects right now. Check back soon!</p>
            </CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((project, i) => (
                <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base font-display">{project.title}</CardTitle>
                        <Badge variant="secondary" className="text-[10px]">{project.project_type}</Badge>
                      </div>
                      {project.peer_circles?.name && <CardDescription className="text-xs">From: {project.peer_circles.name}</CardDescription>}
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <p className="font-body text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Users size={12} /> {project.participant_count}/{project.max_participants}</span>
                        <Badge variant="outline" className="text-[10px]">{project.difficulty}</Badge>
                        {project.deadline && <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Clock size={12} /> {new Date(project.deadline).toLocaleDateString()}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.skills_targeted?.map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                      </div>
                      {myProjects.has(project.id) ? (
                        <Button size="sm" variant="secondary" className="w-full text-xs" disabled><CheckCircle2 size={12} /> Joined</Button>
                      ) : (
                        <Button size="sm" className="w-full text-xs" onClick={() => joinProject(project.id)}><UserPlus size={12} /> Join Project</Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ENGAGEMENT TAB */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={20} className="text-primary" />
            <h2 className="font-display text-xl text-foreground">Engagement Tracker</h2>
          </div>
          <p className="font-body text-sm text-muted-foreground">Track your involvement and energy across peer circles.</p>

          {engagementData.length === 0 ? (
            <Card><CardContent className="p-8 text-center">
              <BarChart3 size={40} className="mx-auto text-muted-foreground mb-3" />
              <p className="font-body text-sm text-muted-foreground">Join circles and start engaging to see your data here.</p>
            </CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {engagementData.map((eng, i) => {
                const circle = circles.find(c => c.id === eng.circle_id);
                return (
                  <Card key={eng.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-display flex items-center gap-2">
                        <span>{circle?.icon_emoji || "🔵"}</span> {circle?.name || "Circle"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded bg-muted/30">
                          <p className="font-display text-lg text-foreground">{eng.posts_count || 0}</p>
                          <p className="font-body text-[10px] text-muted-foreground">Posts</p>
                        </div>
                        <div className="p-2 rounded bg-muted/30">
                          <p className="font-display text-lg text-foreground">{eng.comments_count || 0}</p>
                          <p className="font-body text-[10px] text-muted-foreground">Comments</p>
                        </div>
                        <div className="p-2 rounded bg-muted/30">
                          <p className="font-display text-lg text-foreground">{eng.projects_joined || 0}</p>
                          <p className="font-body text-[10px] text-muted-foreground">Projects</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant={eng.engagement_level === "high" ? "default" : eng.engagement_level === "medium" ? "secondary" : "outline"} className="text-[10px]">
                          {eng.engagement_level || "new"}
                        </Badge>
                        {eng.mood_trend && <span className="font-body text-muted-foreground">Mood: {eng.mood_trend}</span>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <Button variant="outline" onClick={getEngagementNudge} disabled={aiLoading} className="w-full">
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Get Engagement Nudge
          </Button>
        </TabsContent>

        {/* AI INSIGHTS TAB */}
        <TabsContent value="ai-insights" className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-primary" />
            <h2 className="font-display text-xl text-foreground">AI-Powered Insights</h2>
          </div>
          <p className="font-body text-sm text-muted-foreground">Get personalized circle recommendations, project ideas, and reflection prompts.</p>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><Zap size={14} className="text-accent" /> Smart Match</CardTitle>
                <CardDescription className="text-xs">AI recommends circles for you</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={getSmartRecommendations} disabled={aiLoading} className="w-full text-xs">
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Get Recommendations
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><Target size={14} className="text-accent" /> Project Ideas</CardTitle>
                <CardDescription className="text-xs">AI suggests collaborative projects</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={getProjectSuggestions} disabled={aiLoading} variant="outline" className="w-full text-xs">
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Lightbulb size={14} />} Get Ideas
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2"><PenLine size={14} className="text-accent" /> Reflection</CardTitle>
                <CardDescription className="text-xs">Reflect on your peer experiences</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={getReflectionPrompts} disabled={aiLoading} variant="outline" className="w-full text-xs">
                  {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <PenLine size={14} />} Reflect Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations Results */}
          <AnimatePresence>
            {aiRecommendations && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <h3 className="font-display text-lg text-foreground flex items-center gap-2"><Award size={16} /> Recommended for You</h3>
                {aiRecommendations.recommendations?.map((rec: any, i: number) => (
                  <Card key={i} className="border-accent/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-display text-sm text-foreground">{rec.circle_name}</h4>
                        <Badge className="text-[10px]">{rec.match_score}% match</Badge>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mb-1">{rec.reason}</p>
                      <p className="font-body text-xs text-accent">{rec.expected_benefit}</p>
                      {rec.activity_suggestion && <p className="font-body text-xs text-muted-foreground mt-1 italic">💡 {rec.activity_suggestion}</p>}
                    </CardContent>
                  </Card>
                ))}
                {aiRecommendations.engagement_tips?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-display">Engagement Tips</CardTitle></CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1">
                        {aiRecommendations.engagement_tips.map((tip: string, i: number) => (
                          <li key={i} className="font-body text-xs text-muted-foreground flex items-start gap-2"><ChevronRight size={12} className="text-accent mt-0.5 shrink-0" /> {tip}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                {aiRecommendations.motivation_message && (
                  <div className="bg-primary/5 rounded-lg p-4">
                    <p className="font-body text-sm text-foreground italic">{aiRecommendations.motivation_message}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* CIRCLE DETAIL DIALOG */}
      <Dialog open={!!selectedCircle} onOpenChange={open => { if (!open) { setSelectedCircle(null); setAiDiscussionTopics(null); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedCircle && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl flex items-center gap-2">
                  <span className="text-2xl">{selectedCircle.icon_emoji}</span> {selectedCircle.name}
                </DialogTitle>
                <DialogDescription>{selectedCircle.description}</DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge variant="outline" className="text-xs">{selectedCircle.domain}</Badge>
                <Badge variant="outline" className="text-xs">{selectedCircle.activity_type}</Badge>
                <Badge variant="secondary" className="text-xs"><Users size={10} className="mr-1" /> {selectedCircle.member_count} members</Badge>
              </div>

              {/* Milestones */}
              {circleMilestones.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-display text-sm mb-2 flex items-center gap-1"><Trophy size={14} className="text-accent" /> Milestones</h4>
                  <div className="flex flex-wrap gap-2">
                    {circleMilestones.map(m => (
                      <Badge key={m.id} variant="secondary" className="text-[10px]">🎯 {m.title}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Discussion Topics */}
              <div className="mb-4">
                <Button size="sm" variant="outline" onClick={getDiscussionTopics} disabled={aiLoading} className="text-xs mb-2">
                  {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate Discussion Topics
                </Button>
                {aiDiscussionTopics && (
                  <div className="space-y-2">
                    {aiDiscussionTopics.icebreaker && (
                      <div className="p-2 rounded bg-accent/10 text-xs font-body">
                        <span className="font-medium text-accent">Icebreaker:</span> {aiDiscussionTopics.icebreaker}
                      </div>
                    )}
                    {aiDiscussionTopics.discussion_topics?.map((t: any, i: number) => (
                      <div key={i} className="p-2 rounded bg-muted/30 cursor-pointer hover:bg-muted/50" onClick={() => { setNewPostTitle(t.title); setNewPostContent(t.description); setNewPostType("discussion"); }}>
                        <p className="font-display text-xs">{t.title}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{t.description}</p>
                        <Badge variant="outline" className="text-[8px] mt-1">{t.category}</Badge>
                      </div>
                    ))}
                    {aiDiscussionTopics.weekly_challenge && (
                      <div className="p-2 rounded bg-primary/5 border border-primary/10">
                        <p className="font-display text-xs flex items-center gap-1"><Zap size={10} className="text-primary" /> Weekly Challenge</p>
                        <p className="font-body text-[10px] text-foreground">{aiDiscussionTopics.weekly_challenge.title}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{aiDiscussionTopics.weekly_challenge.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* New Post Composer */}
              <div className="border border-border rounded-lg p-3 space-y-2 mb-4">
                <h4 className="font-display text-sm">New Post</h4>
                <div className="flex gap-2">
                  <Input placeholder="Title (optional)" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} className="font-body text-xs" />
                  <Select value={newPostType} onValueChange={setNewPostType}>
                    <SelectTrigger className="w-[130px] text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discussion">Discussion</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="reflection">Reflection</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea placeholder="What's on your mind?" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} className="font-body text-sm min-h-[60px]" />
                <Button size="sm" onClick={createCirclePost} disabled={!newPostContent.trim()}><Send size={12} /> Post</Button>
              </div>

              {/* Discussion Threads */}
              <div className="space-y-3">
                <h4 className="font-display text-sm">Discussions ({circlePosts.length})</h4>
                {circlePosts.length === 0 ? (
                  <p className="font-body text-xs text-muted-foreground text-center py-4">No posts yet. Start the conversation!</p>
                ) : (
                  circlePosts.map(post => (
                    <Card key={post.id} className={post.is_pinned ? "border-accent/30" : ""}>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            {post.title && <p className="font-display text-sm text-foreground">{post.title}</p>}
                            {post.is_pinned && <Badge variant="secondary" className="text-[8px]">📌 Pinned</Badge>}
                          </div>
                          <Badge variant="outline" className="text-[10px]">{post.post_type}</Badge>
                        </div>
                        <p className="font-body text-xs text-foreground">{post.content}</p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Heart size={10} /> {post.likes_count || 0}</span>
                          <button onClick={() => loadComments(post.id)} className="flex items-center gap-1 hover:text-primary transition-colors">
                            <MessageSquare size={10} /> {post.comments_count || 0} comments
                          </button>
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>

                        {/* Comments */}
                        {postComments[post.id] && (
                          <div className="pl-3 border-l-2 border-border space-y-2 mt-2">
                            {postComments[post.id].map((c: any) => (
                              <div key={c.id} className="p-2 rounded bg-muted/20">
                                <p className="font-body text-xs text-foreground">{c.content}</p>
                                <p className="font-body text-[10px] text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <Input placeholder="Add a comment..." value={newComment[post.id] || ""} onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))} className="text-xs" onKeyDown={e => e.key === "Enter" && addComment(post.id)} />
                              <Button size="sm" variant="ghost" onClick={() => addComment(post.id)} disabled={!newComment[post.id]?.trim()}><Send size={10} /></Button>
                            </div>
                          </div>
                        )}
                        {!postComments[post.id] && (post.comments_count || 0) > 0 && (
                          <button onClick={() => loadComments(post.id)} className="font-body text-[10px] text-primary hover:underline">Load comments...</button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* REFLECTION DIALOG */}
      <Dialog open={showReflection} onOpenChange={setShowReflection}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2"><PenLine size={18} /> Peer Circle Reflection</DialogTitle>
            <DialogDescription>Take a moment to reflect on your peer learning experiences.</DialogDescription>
          </DialogHeader>
          {reflectionPrompts && (
            <div className="space-y-3">
              {reflectionPrompts.prompts?.map((p: any, i: number) => (
                <div key={i} className="p-2 rounded bg-muted/30 cursor-pointer hover:bg-muted/50" onClick={() => setReflectionText(prev => prev ? prev + "\n\n" + p.question : p.question)}>
                  <p className="font-body text-xs text-foreground">{p.question}</p>
                  <Badge variant="outline" className="text-[8px] mt-1">{p.category}</Badge>
                </div>
              ))}
              {reflectionPrompts.journal_suggestion && (
                <p className="font-body text-xs text-accent italic">{reflectionPrompts.journal_suggestion}</p>
              )}
            </div>
          )}
          <Textarea placeholder="Write your reflection..." value={reflectionText} onChange={e => setReflectionText(e.target.value)} className="min-h-[100px] font-body text-sm" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowReflection(false)}>Cancel</Button>
            <Button size="sm" onClick={saveReflection} disabled={!reflectionText.trim()}><CheckCircle2 size={14} /> Save to Journal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* Circle Card Component */
const CircleCard = ({ circle, index, joined, onJoin, onLeave, onOpen }: { circle: any; index: number; joined: boolean; onJoin: (id: string) => void; onLeave: (id: string) => void; onOpen: (c: any) => void }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
    <Card className={`hover:shadow-md transition-shadow ${joined ? "border-primary/30" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{circle.icon_emoji}</span>
            <div>
              <CardTitle className="text-base font-display">{circle.name}</CardTitle>
              <CardDescription className="text-xs">{circle.learning_focus || circle.domain}</CardDescription>
            </div>
          </div>
          {circle.is_featured && <Badge variant="secondary" className="text-[10px]">⭐ Featured</Badge>}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="font-body text-sm text-muted-foreground line-clamp-2">{circle.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Users size={12} /> {circle.member_count}</span>
          <Badge variant="outline" className="text-[10px]">{circle.activity_type}</Badge>
          {circle.experience_level && <Badge variant="outline" className="text-[10px]">{circle.experience_level}</Badge>}
        </div>
        <div className="flex flex-wrap gap-1">
          {circle.tags?.slice(0, 4).map((tag: string) => (
            <span key={tag} className="px-1.5 py-0.5 rounded bg-muted font-body text-[10px] text-muted-foreground">#{tag}</span>
          ))}
        </div>
        <div className="pt-1">
          {joined ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => onOpen(circle)}><MessageCircle size={12} /> Open</Button>
              <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => onLeave(circle.id)}>Leave</Button>
            </div>
          ) : (
            <Button onClick={() => onJoin(circle.id)} size="sm" className="w-full text-xs"><UserPlus size={12} /> Join Circle</Button>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default PeerCircles;
