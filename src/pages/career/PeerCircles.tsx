import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users, MessageCircle, Trophy, Flame, UserPlus, Search, Filter,
  Sparkles, BookOpen, Target, Heart, Star, ArrowRight, Loader2,
  Globe, Lightbulb, Zap, Award, Send, Plus, ChevronRight, Clock
} from "lucide-react";

const PeerCircles = () => {
  const { user } = useAuth();
  const [circles, setCircles] = useState<any[]>([]);
  const [myCircles, setMyCircles] = useState<Set<string>>(new Set());
  const [inspireWall, setInspireWall] = useState<any[]>([]);
  const [domainClubs, setDomainClubs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState("all");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [newInspirePost, setNewInspirePost] = useState("");
  const [engagementNudge, setEngagementNudge] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [circlesRes, clubsRes, inspireRes, projectsRes] = await Promise.all([
        supabase.from("peer_circles").select("*").eq("is_active", true).order("is_featured", { ascending: false }),
        supabase.from("domain_clubs").select("*").eq("is_active", true),
        supabase.from("inspire_wall_posts").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("peer_circle_projects").select("*, peer_circles(name)").eq("status", "open").limit(10),
      ]);

      if (circlesRes.data) setCircles(circlesRes.data);
      if (clubsRes.data) setDomainClubs(clubsRes.data);
      if (inspireRes.data) setInspireWall(inspireRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);

      if (user) {
        const { data: memberships } = await supabase
          .from("peer_circle_members")
          .select("circle_id")
          .eq("user_id", user.id);
        if (memberships) setMyCircles(new Set(memberships.map((m: any) => m.circle_id)));
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
  };

  const leaveCircle = async (circleId: string) => {
    if (!user) return;
    await supabase.from("peer_circle_members").delete().eq("circle_id", circleId).eq("user_id", user.id);
    setMyCircles(prev => { const s = new Set(prev); s.delete(circleId); return s; });
    toast.info("You've left the circle.");
  };

  const getSmartRecommendations = async () => {
    if (!user) return;
    setAiLoading(true);
    try {
      const [{ data: interests }, { data: energy }, { data: affinity }] = await Promise.all([
        supabase.from("interests").select("*").eq("user_id", user.id).limit(10),
        supabase.from("energy_zones").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(5),
        supabase.from("domain_affinity").select("*").eq("user_id", user.id).limit(5),
      ]);

      const { data, error } = await supabase.functions.invoke("peer-circles-ai", {
        body: {
          type: "recommend_circles",
          context: {
            interests: interests || [],
            energy_zones: energy || [],
            domain_affinity: affinity || [],
            available_circles: circles.map(c => ({ name: c.name, domain: c.domain, focus: c.learning_focus, activity: c.activity_type })),
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
      const { data, error } = await supabase.functions.invoke("peer-circles-ai", {
        body: {
          type: "engagement_nudge",
          context: {
            joined_circles: Array.from(myCircles),
            user_interests: [],
            mood: "neutral",
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

  const postToInspireWall = async () => {
    if (!user || !newInspirePost.trim()) return;
    const { error } = await supabase.from("inspire_wall_posts").insert({
      user_id: user.id,
      content: newInspirePost.trim(),
      post_type: "story",
    });
    if (error) { toast.error("Failed to post."); return; }
    setNewInspirePost("");
    toast.success("Posted to Inspire Wall! ✨");
    loadData();
  };

  const filteredCircles = circles.filter(c => {
    const matchesSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = domainFilter === "all" || c.domain === domainFilter;
    const matchesActivity = activityFilter === "all" || c.activity_type === activityFilter;
    return matchesSearch && matchesDomain && matchesActivity;
  });

  const joinedCircles = circles.filter(c => myCircles.has(c.id));
  const domains = [...new Set(circles.map(c => c.domain))];
  const activityTypes = [...new Set(circles.map(c => c.activity_type))];

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
          <Sparkles size={20} className="text-accent mt-0.5" />
          <div>
            <p className="font-body text-sm text-foreground">{engagementNudge.nudge_message}</p>
            {engagementNudge.suggested_action && (
              <p className="font-body text-xs text-muted-foreground mt-1">{engagementNudge.suggested_action}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEngagementNudge(null)} className="ml-auto text-xs">Dismiss</Button>
        </motion.div>
      )}

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="discover" className="font-body text-xs"><Search size={14} className="mr-1" />Discover</TabsTrigger>
          <TabsTrigger value="inspire" className="font-body text-xs"><Flame size={14} className="mr-1" />Inspire Wall</TabsTrigger>
          <TabsTrigger value="clubs" className="font-body text-xs"><Globe size={14} className="mr-1" />Domain Clubs</TabsTrigger>
          <TabsTrigger value="my-circles" className="font-body text-xs"><Heart size={14} className="mr-1" />My Circles</TabsTrigger>
          <TabsTrigger value="projects" className="font-body text-xs"><Target size={14} className="mr-1" />Projects</TabsTrigger>
          <TabsTrigger value="ai-insights" className="font-body text-xs"><Sparkles size={14} className="mr-1" />AI Insights</TabsTrigger>
        </TabsList>

        {/* DISCOVER TAB */}
        <TabsContent value="discover" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search circles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 font-body text-sm" />
            </div>
            <select value={domainFilter} onChange={e => setDomainFilter(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
              <option value="all">All Domains</option>
              {domains.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
            <select value={activityFilter} onChange={e => setActivityFilter(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
              <option value="all">All Activities</option>
              {activityTypes.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
            </select>
          </div>

          {/* Featured Circles */}
          {filteredCircles.some(c => c.is_featured) && (
            <div>
              <h2 className="font-display text-lg text-foreground mb-3 flex items-center gap-2"><Star size={16} className="text-accent" /> Featured Circles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCircles.filter(c => c.is_featured).map((circle, i) => (
                  <CircleCard key={circle.id} circle={circle} index={i} joined={myCircles.has(circle.id)} onJoin={joinCircle} onLeave={leaveCircle} />
                ))}
              </div>
            </div>
          )}

          {/* All Circles */}
          <div>
            <h2 className="font-display text-lg text-foreground mb-3">All Circles ({filteredCircles.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCircles.map((circle, i) => (
                <CircleCard key={circle.id} circle={circle} index={i} joined={myCircles.has(circle.id)} onJoin={joinCircle} onLeave={leaveCircle} />
              ))}
            </div>
            {filteredCircles.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-body">No circles match your filters.</div>
            )}
          </div>
        </TabsContent>

        {/* INSPIRE WALL TAB */}
        <TabsContent value="inspire" className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={20} className="text-accent" />
            <h2 className="font-display text-xl text-foreground">Inspire Wall</h2>
          </div>
          <p className="font-body text-sm text-muted-foreground">A community space where peers share achievements, tips, and learning reflections.</p>

          {/* Post composer */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Share something inspiring with your peers..."
                  value={newInspirePost}
                  onChange={e => setNewInspirePost(e.target.value)}
                  className="font-body text-sm"
                  onKeyDown={e => e.key === "Enter" && postToInspireWall()}
                />
                <Button onClick={postToInspireWall} size="sm" disabled={!newInspirePost.trim()}>
                  <Send size={14} /> Post
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Posts */}
          <div className="space-y-3">
            {inspireWall.map((post, i) => (
              <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-body text-sm text-foreground">{post.content}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="secondary" className="text-[10px]">{post.post_type}</Badge>
                      {post.tags?.map((tag: string) => (
                        <span key={tag} className="text-[10px] text-muted-foreground">#{tag}</span>
                      ))}
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Heart size={10} /> {post.likes_count || 0}
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Users size={12} /> {club.member_count} members</span>
                        <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><BookOpen size={12} /> {club.workshops_count} workshops</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {club.tags?.map((tag: string) => <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* MY CIRCLES TAB */}
        <TabsContent value="my-circles" className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={20} className="text-primary" />
            <h2 className="font-display text-xl text-foreground">My Circles</h2>
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
              {joinedCircles.map((circle, i) => (
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
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Users size={12} /> {circle.member_count} members</span>
                        <Badge variant="outline" className="text-[10px]">{circle.activity_type}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs flex-1">
                          <MessageCircle size={12} /> Discussions
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => leaveCircle(circle.id)}>
                          Leave
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* PROJECTS TAB */}
        <TabsContent value="projects" className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Target size={20} className="text-primary" />
            <h2 className="font-display text-xl text-foreground">Collaborative Projects</h2>
          </div>
          <p className="font-body text-sm text-muted-foreground">Join group challenges, hackathons, and peer-driven tasks.</p>

          {projects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="font-body text-sm text-muted-foreground">No open projects right now. Check back soon!</p>
              </CardContent>
            </Card>
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
                      {project.peer_circles?.name && (
                        <CardDescription className="text-xs">From: {project.peer_circles.name}</CardDescription>
                      )}
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
                      <Button size="sm" className="w-full text-xs"><UserPlus size={12} /> Join Project</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* AI INSIGHTS TAB */}
        <TabsContent value="ai-insights" className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-primary" />
            <h2 className="font-display text-xl text-foreground">AI-Powered Insights</h2>
          </div>
          <p className="font-body text-sm text-muted-foreground">Get personalized circle recommendations based on your interests, skills, and mood patterns.</p>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display flex items-center gap-2"><Zap size={16} className="text-accent" /> Smart Match</CardTitle>
                <CardDescription className="text-xs">AI recommends circles based on your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={getSmartRecommendations} disabled={aiLoading} className="w-full text-xs">
                  {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><Sparkles size={14} /> Get Recommendations</>}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-display flex items-center gap-2"><Lightbulb size={16} className="text-accent" /> Engagement Nudge</CardTitle>
                <CardDescription className="text-xs">Get a motivational nudge to re-engage</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={getEngagementNudge} disabled={aiLoading} variant="outline" className="w-full text-xs">
                  {aiLoading ? <><Loader2 size={14} className="animate-spin" /> Thinking...</> : <><Heart size={14} /> Get Nudge</>}
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
                      <p className="font-body text-xs text-muted-foreground mb-2">{rec.reason}</p>
                      <p className="font-body text-xs text-accent">{rec.expected_benefit}</p>
                      {rec.activity_suggestion && (
                        <p className="font-body text-xs text-muted-foreground mt-1 italic">💡 {rec.activity_suggestion}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {aiRecommendations.engagement_tips?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-display">Engagement Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1">
                        {aiRecommendations.engagement_tips.map((tip: string, i: number) => (
                          <li key={i} className="font-body text-xs text-muted-foreground flex items-start gap-2">
                            <ChevronRight size={12} className="text-accent mt-0.5 shrink-0" /> {tip}
                          </li>
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
    </div>
  );
};

/* Circle Card Component */
const CircleCard = ({ circle, index, joined, onJoin, onLeave }: { circle: any; index: number; joined: boolean; onJoin: (id: string) => void; onLeave: (id: string) => void }) => (
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
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Users size={12} /> {circle.member_count} members</span>
          <Badge variant="outline" className="text-[10px]">{circle.activity_type}</Badge>
          <Badge variant="outline" className="text-[10px]">{circle.experience_level}</Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {circle.tags?.slice(0, 4).map((tag: string) => (
            <span key={tag} className="px-1.5 py-0.5 rounded bg-muted font-body text-[10px] text-muted-foreground">#{tag}</span>
          ))}
        </div>
        <div className="pt-1">
          {joined ? (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 text-xs"><MessageCircle size={12} /> Open</Button>
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
