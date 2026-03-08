import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Globe, Users, MessageCircle, UserPlus, Heart, Search, Plus, Send,
  ThumbsUp, MessageSquare, Sparkles, Loader2, ArrowLeft, TrendingUp,
  Filter, Star, Trash2, Activity, Lightbulb, RefreshCw
} from "lucide-react";

const postTypes = [
  { value: "discussion", label: "💬 Discussion" },
  { value: "question", label: "❓ Question" },
  { value: "resource", label: "📎 Resource" },
  { value: "celebration", label: "🎉 Celebration" },
  { value: "feedback", label: "🔍 Feedback Request" },
];

const StartupCommunities = () => {
  const { user, profile } = useAuth();
  const [communities, setCommunities] = useState<any[]>([]);
  const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  // Community detail view
  const [selectedCommunity, setSelectedCommunity] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  // New post
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState("discussion");
  const [postingLoading, setPostingLoading] = useState(false);

  // Comments
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState(false);

  // AI
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [icebreakers, setIcebreakers] = useState<any>(null);

  // Create community
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createTopic, setCreateTopic] = useState("general");
  const [createEmoji, setCreateEmoji] = useState("🚀");

  const loadCommunities = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("communities").select("*").order("is_featured", { ascending: false }).order("member_count", { ascending: false });
    setCommunities(data || []);

    if (user) {
      const { data: memberships } = await supabase.from("community_members").select("community_id").eq("user_id", user.id);
      setMyMemberships(new Set((memberships || []).map((m: any) => m.community_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadCommunities(); }, [loadCommunities]);

  const joinCommunity = async (communityId: string) => {
    if (!user) return;
    const { error } = await supabase.from("community_members").insert({ community_id: communityId, user_id: user.id });
    if (error) { toast.error("Failed to join"); return; }
    setMyMemberships(prev => new Set(prev).add(communityId));
    toast.success("Welcome to the community! 🎉");
    loadCommunities();
  };

  const leaveCommunity = async (communityId: string) => {
    if (!user) return;
    await supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", user.id);
    setMyMemberships(prev => { const n = new Set(prev); n.delete(communityId); return n; });
    toast.success("Left community");
    loadCommunities();
  };

  const openCommunity = async (community: any) => {
    setSelectedCommunity(community);
    setPostsLoading(true);
    const [postsRes, membersRes] = await Promise.all([
      supabase.from("community_posts").select("*").eq("community_id", community.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("community_members").select("*").eq("community_id", community.id).limit(100),
    ]);
    setPosts(postsRes.data || []);
    setMembers(membersRes.data || []);
    setPostsLoading(false);
  };

  const createPost = async () => {
    if (!user || !selectedCommunity || !newPostContent.trim()) return;
    setPostingLoading(true);
    const { error } = await supabase.from("community_posts").insert({
      community_id: selectedCommunity.id, user_id: user.id,
      title: newPostTitle || null, content: newPostContent, post_type: newPostType,
    });
    if (error) { toast.error("Failed to post"); setPostingLoading(false); return; }
    toast.success("Post shared! 🎉");
    setNewPostTitle(""); setNewPostContent(""); setShowNewPost(false);
    openCommunity(selectedCommunity);
    setPostingLoading(false);
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const { data: existing } = await supabase.from("community_post_likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
    if (existing) {
      await supabase.from("community_post_likes").delete().eq("id", existing.id);
    } else {
      await supabase.from("community_post_likes").insert({ post_id: postId, user_id: user.id });
    }
    if (selectedCommunity) openCommunity(selectedCommunity);
  };

  const loadComments = async (postId: string) => {
    if (expandedPost === postId) { setExpandedPost(null); return; }
    setExpandedPost(postId);
    const { data } = await supabase.from("community_post_comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
    setComments(prev => ({ ...prev, [postId]: data || [] }));
  };

  const addComment = async (postId: string) => {
    if (!user || !commentInput[postId]?.trim()) return;
    setCommentLoading(true);
    await supabase.from("community_post_comments").insert({ post_id: postId, user_id: user.id, content: commentInput[postId] });
    setCommentInput(prev => ({ ...prev, [postId]: "" }));
    loadComments(postId); // refresh
    if (selectedCommunity) openCommunity(selectedCommunity);
    setCommentLoading(false);
  };

  const createCommunity = async () => {
    if (!user || !createName.trim()) return;
    const { data, error } = await supabase.from("communities").insert({
      name: createName, description: createDesc, topic: createTopic,
      icon_emoji: createEmoji, created_by: user.id,
    }).select().single();
    if (error) { toast.error("Failed to create"); return; }
    // Auto-join as admin
    await supabase.from("community_members").insert({ community_id: data.id, user_id: user.id, role: "admin" });
    toast.success("Community created! 🚀");
    setShowCreate(false); setCreateName(""); setCreateDesc("");
    loadCommunities();
  };

  const callAI = async (type: string, setter: (d: any) => void) => {
    setAiLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("community-ai", {
        body: { type, context: { name: profile?.full_name, intent: profile?.active_intent, industry: profile?.industry, areasOfFocus: profile?.areas_of_focus, joinedCommunities: communities.filter(c => myMemberships.has(c.id)).map(c => c.name), communityName: selectedCommunity?.name, topic: selectedCommunity?.topic } },
      });
      if (error) throw error;
      setter(data);
    } catch (e: any) { toast.error(e.message || "AI error"); }
    setAiLoading(null);
  };

  const filtered = communities.filter(c => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterType && c.community_type !== filterType) return false;
    return true;
  });

  const myCommunities = communities.filter(c => myMemberships.has(c.id));

  // Community detail view
  if (selectedCommunity) {
    const isMember = myMemberships.has(selectedCommunity.id);
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={() => { setSelectedCommunity(null); setPosts([]); }} className="mb-2">
            <ArrowLeft size={16} className="mr-1" />Back to Communities
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedCommunity.icon_emoji}</span>
              <div>
                <h1 className="font-display text-2xl text-foreground">{selectedCommunity.name}</h1>
                <p className="font-body text-sm text-muted-foreground">{selectedCommunity.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Users size={12} />{selectedCommunity.member_count} members</span>
                  <Badge variant="outline" className="text-[10px]">{selectedCommunity.topic}</Badge>
                  <Badge variant="outline" className="text-[10px]">{selectedCommunity.community_type}</Badge>
                </div>
              </div>
            </div>
            {isMember ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => leaveCommunity(selectedCommunity.id)}>Leave</Button>
                <Button size="sm" onClick={() => setShowNewPost(true)}><Plus size={14} className="mr-1" />Post</Button>
              </div>
            ) : (
              <Button onClick={() => joinCommunity(selectedCommunity.id)} size="sm"><UserPlus size={14} className="mr-1" />Join</Button>
            )}
          </div>
        </motion.div>

        {/* AI Tools */}
        {isMember && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => callAI("icebreaker", setIcebreakers)} disabled={aiLoading === "icebreaker"}>
              {aiLoading === "icebreaker" ? <Loader2 size={14} className="animate-spin mr-1" /> : <Lightbulb size={14} className="mr-1" />}Icebreakers
            </Button>
            <Button variant="outline" size="sm" onClick={() => callAI("suggest_post", (d) => { setNewPostTitle(d.suggested_title || ""); setNewPostContent(d.suggested_content || ""); setShowNewPost(true); })} disabled={aiLoading === "suggest_post"}>
              {aiLoading === "suggest_post" ? <Loader2 size={14} className="animate-spin mr-1" /> : <Sparkles size={14} className="mr-1" />}AI Post Helper
            </Button>
          </div>
        )}

        {/* Icebreakers */}
        {icebreakers && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm text-foreground flex items-center gap-1"><Lightbulb size={14} className="text-yellow-500" />Discussion Starters</h3>
              <Button variant="ghost" size="sm" onClick={() => setIcebreakers(null)}>×</Button>
            </div>
            <p className="text-xs text-accent font-body">Theme: {icebreakers.weekly_theme}</p>
            <div className="grid gap-2">
              {icebreakers.icebreakers?.slice(0, 4).map((ib: any, i: number) => (
                <button key={i} onClick={() => { setNewPostContent(ib.prompt); setShowNewPost(true); }}
                  className="text-left bg-muted rounded-lg p-3 hover:bg-accent/10 transition-all">
                  <p className="text-sm font-body text-foreground">{ib.prompt}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{ib.category}</Badge>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* New Post Form */}
        <AnimatePresence>
          {showNewPost && isMember && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h3 className="font-display text-lg text-foreground">Share with the Community</h3>
              <div className="flex gap-2 flex-wrap">
                {postTypes.map(pt => (
                  <button key={pt.value} onClick={() => setNewPostType(pt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-body transition-all ${newPostType === pt.value ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>
                    {pt.label}
                  </button>
                ))}
              </div>
              <Input placeholder="Title (optional)" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} />
              <Textarea placeholder="Share your thoughts, questions, or learnings..." value={newPostContent} onChange={e => setNewPostContent(e.target.value)} rows={4} />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
                <Button onClick={createPost} disabled={!newPostContent.trim() || postingLoading}>
                  {postingLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : <Send size={14} className="mr-1" />}Post
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts Feed */}
        {postsLoading ? (
          <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <MessageCircle size={40} className="mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-body">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl border border-border p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    {post.title && <h4 className="font-display text-foreground">{post.title}</h4>}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{postTypes.find(p => p.value === post.post_type)?.label || post.post_type}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {post.user_id === user?.id && (
                    <Button variant="ghost" size="icon" onClick={async () => {
                      await supabase.from("community_posts").delete().eq("id", post.id);
                      openCommunity(selectedCommunity);
                    }}><Trash2 size={14} className="text-destructive" /></Button>
                  )}
                </div>
                <p className="text-sm font-body text-foreground whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-all">
                    <ThumbsUp size={14} />{post.likes_count || 0}
                  </button>
                  <button onClick={() => loadComments(post.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-all">
                    <MessageSquare size={14} />{post.comments_count || 0}
                  </button>
                </div>

                {/* Comments section */}
                <AnimatePresence>
                  {expandedPost === post.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className="border-t border-border pt-3 space-y-3">
                      {(comments[post.id] || []).map((c: any) => (
                        <div key={c.id} className="bg-muted rounded-lg p-3">
                          <p className="text-sm font-body text-foreground">{c.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input placeholder="Add a comment..." value={commentInput[post.id] || ""} onChange={e => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") addComment(post.id); }} />
                        <Button size="icon" onClick={() => addComment(post.id)} disabled={commentLoading}><Send size={14} /></Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Main communities list view
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <Globe size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Startup Communities</h1>
            <p className="font-body text-sm text-muted-foreground">Connect, share, and grow with founders who understand the journey.</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="explore" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="explore"><Search size={14} className="mr-1" />Explore</TabsTrigger>
          <TabsTrigger value="my"><Users size={14} className="mr-1" />My Groups</TabsTrigger>
          <TabsTrigger value="ai"><Sparkles size={14} className="mr-1" />For You</TabsTrigger>
          <TabsTrigger value="create"><Plus size={14} className="mr-1" />Create</TabsTrigger>
        </TabsList>

        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search communities..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[null, "interest", "support", "emotional_support", "networking", "collaboration", "accountability"].map(t => (
              <button key={t || "all"} onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-full text-xs font-body transition-all ${filterType === t ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>
                {t ? t.replace("_", " ") : "All"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-all cursor-pointer" onClick={() => openCommunity(c)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{c.icon_emoji}</span>
                      <div>
                        <h3 className="font-display text-foreground flex items-center gap-1">
                          {c.name}
                          {c.is_featured && <Star size={12} className="text-yellow-500" />}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-body">{c.community_type}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{c.topic}</Badge>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-3 line-clamp-2">{c.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Users size={12} />{c.member_count} members</span>
                    {myMemberships.has(c.id) ? (
                      <Badge className="text-[10px] bg-accent/10 text-accent">Joined</Badge>
                    ) : (
                      <Button onClick={e => { e.stopPropagation(); joinCommunity(c.id); }} size="sm" variant="outline" className="text-xs">
                        <UserPlus size={12} className="mr-1" />Join
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Groups Tab */}
        <TabsContent value="my" className="space-y-4">
          {myCommunities.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Users size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-body">You haven't joined any communities yet.</p>
              <p className="text-xs text-muted-foreground font-body mt-1">Explore and join groups that match your interests!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myCommunities.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-all cursor-pointer" onClick={() => openCommunity(c)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{c.icon_emoji}</span>
                    <h3 className="font-display text-foreground">{c.name}</h3>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-2 line-clamp-1">{c.description}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-body"><Users size={12} className="inline mr-1" />{c.member_count}</span>
                    <Badge variant="outline" className="text-[10px]">{c.topic}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="ai" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Sparkles size={20} className="text-accent" /><h3 className="font-display text-lg text-foreground">AI-Recommended Communities</h3></div>
              <Button onClick={() => callAI("recommend_communities", setAiRecommendations)} disabled={aiLoading === "recommend_communities"} variant="outline" size="sm">
                {aiLoading === "recommend_communities" ? <Loader2 size={14} className="animate-spin mr-1" /> : <RefreshCw size={14} className="mr-1" />}Get Recommendations
              </Button>
            </div>
            {!aiRecommendations ? (
              <p className="text-sm text-muted-foreground font-body">Click "Get Recommendations" to receive AI-powered community suggestions based on your profile.</p>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid gap-3">
                  {aiRecommendations.recommendations?.map((r: any, i: number) => (
                    <div key={i} className="bg-muted rounded-xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-display text-foreground">{r.community_name}</h4>
                        <Badge className="text-[10px] bg-accent/10 text-accent">{r.match_score}% match</Badge>
                      </div>
                      <p className="text-sm font-body text-muted-foreground">{r.reason}</p>
                      <p className="text-xs font-body text-accent mt-1">✨ {r.expected_benefit}</p>
                    </div>
                  ))}
                </div>
                {aiRecommendations.networking_tips && (
                  <div>
                    <p className="text-xs font-display text-muted-foreground mb-2">Networking Tips</p>
                    {aiRecommendations.networking_tips.map((tip: string, i: number) => (
                      <p key={i} className="text-sm font-body text-foreground">💡 {tip}</p>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Engagement Insights */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-3">
            <div className="flex items-center gap-2"><Activity size={20} className="text-green-500" /><h3 className="font-display text-lg text-foreground">Engagement Insights</h3></div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-muted rounded-xl p-4">
                <p className="font-display text-2xl text-foreground">{myCommunities.length}</p>
                <p className="text-xs text-muted-foreground font-body">Communities</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="font-display text-2xl text-foreground">{communities.reduce((sum, c) => sum + (myMemberships.has(c.id) ? c.member_count : 0), 0)}</p>
                <p className="text-xs text-muted-foreground font-body">Network Size</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <p className="font-display text-2xl text-accent">{communities.filter(c => c.is_featured && myMemberships.has(c.id)).length}</p>
                <p className="text-xs text-muted-foreground font-body">Featured Groups</p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Create Tab */}
        <TabsContent value="create" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-display text-lg text-foreground">Create a New Community</h3>
            <p className="text-sm text-muted-foreground font-body">Start a community around a shared interest, challenge, or goal.</p>
            <div className="flex gap-3 items-end">
              <div className="w-16">
                <label className="text-xs font-display text-muted-foreground">Emoji</label>
                <Input value={createEmoji} onChange={e => setCreateEmoji(e.target.value)} className="text-center text-xl" maxLength={2} />
              </div>
              <div className="flex-1">
                <label className="text-xs font-display text-muted-foreground">Community Name</label>
                <Input placeholder="e.g. HealthTech Founders" value={createName} onChange={e => setCreateName(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs font-display text-muted-foreground">Topic</label>
              <Input placeholder="e.g. healthtech, AI, social impact" value={createTopic} onChange={e => setCreateTopic(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-display text-muted-foreground">Description</label>
              <Textarea placeholder="What is this community about?" value={createDesc} onChange={e => setCreateDesc(e.target.value)} rows={3} />
            </div>
            <Button onClick={createCommunity} disabled={!createName.trim()} className="w-full">
              <Plus size={14} className="mr-1" />Create Community
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartupCommunities;
