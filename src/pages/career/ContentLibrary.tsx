import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  BookOpen, Search, ExternalLink, Bookmark, Star, Filter, 
  Sparkles, Clock, Play, ChevronRight, Lightbulb, Target,
  GraduationCap, Rocket, TrendingUp, Users, BookMarked,
  Zap, CheckCircle, ArrowRight, Brain, Compass
} from "lucide-react";

const DOMAINS = ["All", "Tech", "Design", "Leadership", "Marketing", "Finance", "Healthcare", "Entrepreneurship"];
const DIFFICULTY_LEVELS = ["all", "beginner", "intermediate", "advanced"];
const CONTENT_FORMATS = ["all", "video", "text", "interactive", "mixed"];

const ContentLibrary = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [difficulty, setDifficulty] = useState("all");
  const [format, setFormat] = useState("all");
  
  // Data states
  const [learningTracks, setLearningTracks] = useState<any[]>([]);
  const [learningCapsules, setLearningCapsules] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [skillApplications, setSkillApplications] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  
  // AI states
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [skillMappings, setSkillMappings] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [tracksRes, capsulesRes, resourcesRes, skillsRes] = await Promise.all([
        supabase.from("learning_tracks").select("*").order("order_index"),
        supabase.from("learning_capsules").select("*").order("order_index"),
        supabase.from("resources").select("*").order("created_at", { ascending: false }),
        supabase.from("skill_applications").select("*"),
      ]);

      setLearningTracks(tracksRes.data || []);
      setLearningCapsules(capsulesRes.data || []);
      setResources(resourcesRes.data || []);
      setSkillApplications(skillsRes.data || []);

      if (user) {
        const [progressRes, bookmarksRes, profileRes, interestsRes, skillsUserRes] = await Promise.all([
          supabase.from("user_learning_progress").select("*").eq("user_id", user.id),
          supabase.from("content_bookmarks").select("*").eq("user_id", user.id),
          supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
          supabase.from("interests").select("*").eq("user_id", user.id),
          supabase.from("skills").select("*").eq("user_id", user.id),
        ]);

        setUserProgress(progressRes.data || []);
        setBookmarks(bookmarksRes.data || []);
        setProfile({
          ...profileRes.data,
          interests: interestsRes.data || [],
          skills: skillsUserRes.data || [],
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  const fetchAIRecommendations = async () => {
    if (!user) {
      toast.error("Please sign in to get personalized recommendations");
      return;
    }
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("learning-library-ai", {
        body: {
          type: "recommend_learning",
          context: {
            industry: profile?.industry,
            skills: profile?.skills?.map((s: any) => s.name) || [],
            interests: profile?.interests?.map((i: any) => i.name) || [],
            careerStage: profile?.career_stage,
            shortTermGoals: profile?.short_term_goals,
            longTermGoals: profile?.long_term_goals,
            tracksCompleted: userProgress.filter(p => p.content_type === 'track' && p.status === 'completed').length,
            capsulesCompleted: userProgress.filter(p => p.content_type === 'capsule' && p.status === 'completed').length,
          },
        },
      });
      if (error) throw error;
      setAiRecommendations(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to get recommendations");
    }
    setLoadingAI(false);
  };

  const fetchSkillMappings = async () => {
    if (!user) return;
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("learning-library-ai", {
        body: {
          type: "skill_mapping",
          context: {
            skills: profile?.skills?.map((s: any) => s.name) || [],
            industry: profile?.industry,
            interests: profile?.interests?.map((i: any) => i.name) || [],
            experienceLevel: profile?.career_stage || "beginner",
          },
        },
      });
      if (error) throw error;
      setSkillMappings(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to map skills");
    }
    setLoadingAI(false);
  };

  const toggleBookmark = async (contentType: string, contentId: string) => {
    if (!user) {
      toast.error("Please sign in to save content");
      return;
    }
    const existing = bookmarks.find(b => b.content_type === contentType && b.content_id === contentId);
    if (existing) {
      await supabase.from("content_bookmarks").delete().eq("id", existing.id);
      setBookmarks(bookmarks.filter(b => b.id !== existing.id));
      toast.success("Removed from saved");
    } else {
      const { data } = await supabase.from("content_bookmarks").insert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
      }).select().single();
      if (data) setBookmarks([...bookmarks, data]);
      toast.success("Saved for later");
    }
  };

  const startLearning = async (contentType: string, contentId: string) => {
    if (!user) {
      toast.error("Please sign in to track progress");
      return;
    }
    const existing = userProgress.find(p => p.content_type === contentType && p.content_id === contentId);
    if (!existing) {
      const { data } = await supabase.from("user_learning_progress").insert({
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        status: "in_progress",
        progress_percent: 0,
      }).select().single();
      if (data) setUserProgress([...userProgress, data]);
    }
    toast.success("Started learning! Good luck 🚀");
  };

  const isBookmarked = (contentType: string, contentId: string) => 
    bookmarks.some(b => b.content_type === contentType && b.content_id === contentId);

  const getProgress = (contentType: string, contentId: string) => 
    userProgress.find(p => p.content_type === contentType && p.content_id === contentId);

  // Filtering
  const filteredTracks = learningTracks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchDomain = domain === "All" || t.domain === domain;
    const matchDifficulty = difficulty === "all" || t.difficulty === difficulty;
    const matchFormat = format === "all" || t.format === format;
    return matchSearch && matchDomain && matchDifficulty && matchFormat;
  });

  const filteredCapsules = learningCapsules.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "all" || c.difficulty === difficulty;
    return matchSearch && matchDifficulty;
  });

  const filteredResources = resources.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "all" || r.difficulty_level === difficulty;
    return matchSearch && matchDifficulty;
  });

  const starterPacks = learningTracks.filter(t => t.is_starter_pack);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center">
            <BookOpen size={24} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Content Library</h1>
            <p className="font-body text-sm text-muted-foreground">
              Here's everything you need to learn — at your pace, based on what excites you.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      {user && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Tracks Started", value: userProgress.filter(p => p.content_type === 'track').length, icon: GraduationCap, color: "text-primary" },
            { label: "Capsules Done", value: userProgress.filter(p => p.content_type === 'capsule' && p.status === 'completed').length, icon: Zap, color: "text-accent" },
            { label: "Saved Items", value: bookmarks.length, icon: Bookmark, color: "text-secondary" },
            { label: "Skills Gained", value: profile?.skills?.length || 0, icon: TrendingUp, color: "text-primary" },
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon size={16} className={stat.color} />
                <span className="font-body text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="font-display text-2xl text-foreground">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="discover" className="gap-1">
            <Compass size={14} /> Discover
          </TabsTrigger>
          <TabsTrigger value="tracks" className="gap-1">
            <GraduationCap size={14} /> Tracks
          </TabsTrigger>
          <TabsTrigger value="capsules" className="gap-1">
            <Zap size={14} /> Capsules
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-1">
            <Brain size={14} /> Skills
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-1">
            <Bookmark size={14} /> Saved
          </TabsTrigger>
        </TabsList>

        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search courses, skills, topics..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9" 
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map(d => (
              <button 
                key={d} 
                onClick={() => setDomain(d)} 
                className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${domain === d ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted-foreground" />
              <span className="font-body text-xs text-muted-foreground">Level:</span>
              {DIFFICULTY_LEVELS.map(l => (
                <button 
                  key={l} 
                  onClick={() => setDifficulty(l)} 
                  className={`px-2 py-1 rounded font-body text-[10px] uppercase transition-all ${difficulty === l ? "bg-accent text-secondary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-8">
          {/* AI Recommendations */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                <h2 className="font-display text-xl text-foreground">AI Recommendations</h2>
              </div>
              <Button 
                onClick={fetchAIRecommendations} 
                disabled={loadingAI}
                size="sm"
                className="gap-2"
              >
                {loadingAI ? "Analyzing..." : "Get Personalized Picks"}
                <Sparkles size={14} />
              </Button>
            </div>
            
            {aiRecommendations ? (
              <div className="space-y-4">
                {aiRecommendations.learning_focus && (
                  <p className="font-body text-sm text-muted-foreground">
                    <strong className="text-foreground">Your Focus:</strong> {aiRecommendations.learning_focus}
                  </p>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {aiRecommendations.recommendations?.slice(0, 5).map((rec: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-card rounded-lg border border-border p-4 hover:shadow-soft transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={rec.priority === 'high' ? 'default' : 'secondary'} className="text-[10px]">
                          {rec.priority} priority
                        </Badge>
                        <span className="font-body text-[10px] text-muted-foreground">{rec.type}</span>
                      </div>
                      <h3 className="font-display text-sm text-foreground mb-1">{rec.title}</h3>
                      <p className="font-body text-xs text-muted-foreground mb-2">{rec.reason}</p>
                      {rec.estimated_time && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock size={10} />
                          <span className="font-body text-[10px]">{rec.estimated_time}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                {aiRecommendations.advice && (
                  <p className="font-body text-sm text-primary italic mt-4">💡 {aiRecommendations.advice}</p>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">
                Click above to get AI-powered learning suggestions based on your profile and goals.
              </p>
            )}
          </div>

          {/* Starter Packs */}
          {starterPacks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Rocket size={18} className="text-accent" />
                <h2 className="font-display text-xl text-foreground">Starter Packs</h2>
                <Badge variant="secondary" className="text-[10px]">Beginner Friendly</Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {starterPacks.slice(0, 6).map((track, i) => (
                  <TrackCard 
                    key={track.id}
                    track={track}
                    index={i}
                    progress={getProgress('track', track.id)}
                    isBookmarked={isBookmarked('track', track.id)}
                    onBookmark={() => toggleBookmark('track', track.id)}
                    onStart={() => startLearning('track', track.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Recent Capsules */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-primary" />
              <h2 className="font-display text-xl text-foreground">Quick Capsules</h2>
              <span className="font-body text-xs text-muted-foreground">5-15 min each</span>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {learningCapsules.slice(0, 8).map((capsule, i) => (
                <CapsuleCard
                  key={capsule.id}
                  capsule={capsule}
                  index={i}
                  progress={getProgress('capsule', capsule.id)}
                  isBookmarked={isBookmarked('capsule', capsule.id)}
                  onBookmark={() => toggleBookmark('capsule', capsule.id)}
                  onStart={() => startLearning('capsule', capsule.id)}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tracks Tab */}
        <TabsContent value="tracks" className="space-y-6">
          {loading ? (
            <LoadingState />
          ) : filteredTracks.length === 0 ? (
            <EmptyState message="No learning tracks found" />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTracks.map((track, i) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  index={i}
                  progress={getProgress('track', track.id)}
                  isBookmarked={isBookmarked('track', track.id)}
                  onBookmark={() => toggleBookmark('track', track.id)}
                  onStart={() => startLearning('track', track.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Capsules Tab */}
        <TabsContent value="capsules" className="space-y-6">
          {loading ? (
            <LoadingState />
          ) : filteredCapsules.length === 0 ? (
            <EmptyState message="No learning capsules found" />
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredCapsules.map((capsule, i) => (
                <CapsuleCard
                  key={capsule.id}
                  capsule={capsule}
                  index={i}
                  progress={getProgress('capsule', capsule.id)}
                  isBookmarked={isBookmarked('capsule', capsule.id)}
                  onBookmark={() => toggleBookmark('capsule', capsule.id)}
                  onStart={() => startLearning('capsule', capsule.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={20} className="text-primary" />
                <h2 className="font-display text-xl text-foreground">Where Do Your Skills Apply?</h2>
              </div>
              <Button onClick={fetchSkillMappings} disabled={loadingAI} size="sm" className="gap-2">
                {loadingAI ? "Mapping..." : "Map My Skills"}
                <Brain size={14} />
              </Button>
            </div>

            {skillMappings ? (
              <div className="space-y-4">
                {skillMappings.strongest_combination && (
                  <p className="font-body text-sm text-foreground">
                    <strong>Your Unique Blend:</strong> {skillMappings.strongest_combination}
                  </p>
                )}
                <div className="grid md:grid-cols-2 gap-4">
                  {skillMappings.mappings?.map((mapping: any, i: number) => (
                    <div key={i} className="bg-card rounded-lg border border-border p-4">
                      <h3 className="font-display text-base text-foreground mb-2">{mapping.skill}</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="font-body text-xs text-muted-foreground">Roles:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mapping.applicable_roles?.slice(0, 3).map((role: string) => (
                              <Badge key={role} variant="outline" className="text-[10px]">{role}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-body text-xs text-muted-foreground">Project Ideas:</span>
                          <ul className="mt-1 space-y-0.5">
                            {mapping.project_ideas?.slice(0, 2).map((idea: string) => (
                              <li key={idea} className="font-body text-xs text-foreground flex items-center gap-1">
                                <Lightbulb size={10} className="text-accent" /> {idea}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {skillMappings.skill_gaps?.length > 0 && (
                  <div className="mt-4 p-4 bg-accent/5 rounded-lg">
                    <h4 className="font-display text-sm text-foreground mb-2">Skills to Develop</h4>
                    <div className="flex flex-wrap gap-2">
                      {skillMappings.skill_gaps.map((gap: string) => (
                        <Badge key={gap} variant="secondary">{gap}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-body text-sm text-muted-foreground">
                  Discover which roles, projects, and startup opportunities match your skill set.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {skillApplications.slice(0, 8).map((skill, i) => (
                    <div key={skill.id} className="bg-card rounded-lg border border-border p-4">
                      <h3 className="font-display text-sm text-foreground mb-2">{skill.skill_name}</h3>
                      <div className="flex flex-wrap gap-1">
                        {skill.applicable_roles?.slice(0, 2).map((role: string) => (
                          <Badge key={role} variant="outline" className="text-[10px]">{role}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp size={10} className={skill.growth_potential === 'high' || skill.growth_potential === 'very_high' ? 'text-primary' : 'text-muted-foreground'} />
                        <span className="font-body text-[10px] text-muted-foreground capitalize">{skill.growth_potential} growth</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Saved Tab */}
        <TabsContent value="saved" className="space-y-6">
          {bookmarks.length === 0 ? (
            <EmptyState message="No saved content yet. Bookmark items to find them here." icon={BookMarked} />
          ) : (
            <div className="space-y-6">
              {/* Saved Tracks */}
              {bookmarks.filter(b => b.content_type === 'track').length > 0 && (
                <div>
                  <h3 className="font-display text-lg text-foreground mb-3">Saved Tracks</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookmarks
                      .filter(b => b.content_type === 'track')
                      .map((bookmark, i) => {
                        const track = learningTracks.find(t => t.id === bookmark.content_id);
                        if (!track) return null;
                        return (
                          <TrackCard
                            key={bookmark.id}
                            track={track}
                            index={i}
                            progress={getProgress('track', track.id)}
                            isBookmarked={true}
                            onBookmark={() => toggleBookmark('track', track.id)}
                            onStart={() => startLearning('track', track.id)}
                          />
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Saved Capsules */}
              {bookmarks.filter(b => b.content_type === 'capsule').length > 0 && (
                <div>
                  <h3 className="font-display text-lg text-foreground mb-3">Saved Capsules</h3>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {bookmarks
                      .filter(b => b.content_type === 'capsule')
                      .map((bookmark, i) => {
                        const capsule = learningCapsules.find(c => c.id === bookmark.content_id);
                        if (!capsule) return null;
                        return (
                          <CapsuleCard
                            key={bookmark.id}
                            capsule={capsule}
                            index={i}
                            progress={getProgress('capsule', capsule.id)}
                            isBookmarked={true}
                            onBookmark={() => toggleBookmark('capsule', capsule.id)}
                            onStart={() => startLearning('capsule', capsule.id)}
                          />
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Sub-components
const TrackCard = ({ track, index, progress, isBookmarked, onBookmark, onStart }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03 }}
    className="bg-card rounded-xl border border-border p-5 hover:shadow-soft transition-all group"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{track.icon_emoji || '📚'}</span>
        <Badge variant="secondary" className="text-[10px] capitalize">{track.difficulty}</Badge>
      </div>
      <button onClick={onBookmark} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Bookmark size={16} className={isBookmarked ? "text-accent fill-accent" : "text-muted-foreground"} />
      </button>
    </div>
    <h3 className="font-display text-lg text-foreground mb-2">{track.title}</h3>
    {track.description && (
      <p className="font-body text-sm text-muted-foreground mb-3 line-clamp-2">{track.description}</p>
    )}
    <div className="flex items-center gap-3 text-muted-foreground mb-3">
      <div className="flex items-center gap-1">
        <Clock size={12} />
        <span className="font-body text-xs">{track.estimated_hours}h</span>
      </div>
      <div className="flex items-center gap-1">
        <Target size={12} />
        <span className="font-body text-xs">{track.skills_gained?.length || 0} skills</span>
      </div>
    </div>
    {progress ? (
      <div className="space-y-2">
        <Progress value={progress.progress_percent} className="h-1.5" />
        <span className="font-body text-[10px] text-muted-foreground">{progress.progress_percent}% complete</span>
      </div>
    ) : (
      <Button onClick={onStart} size="sm" className="w-full gap-2">
        <Play size={12} /> Start Learning
      </Button>
    )}
  </motion.div>
);

const CapsuleCard = ({ capsule, index, progress, isBookmarked, onBookmark, onStart }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.02 }}
    className="bg-card rounded-lg border border-border p-4 hover:shadow-soft transition-all group"
  >
    <div className="flex items-start justify-between mb-2">
      <Badge variant="outline" className="text-[10px] capitalize">{capsule.category}</Badge>
      <button onClick={onBookmark} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Bookmark size={14} className={isBookmarked ? "text-accent fill-accent" : "text-muted-foreground"} />
      </button>
    </div>
    <h4 className="font-display text-sm text-foreground mb-1 line-clamp-2">{capsule.title}</h4>
    <div className="flex items-center gap-2 text-muted-foreground mb-2">
      <Clock size={10} />
      <span className="font-body text-[10px]">{capsule.duration_minutes} min</span>
      {capsule.difficulty && (
        <Badge variant="secondary" className="text-[8px] capitalize">{capsule.difficulty}</Badge>
      )}
    </div>
    {progress?.status === 'completed' ? (
      <div className="flex items-center gap-1 text-primary">
        <CheckCircle size={12} />
        <span className="font-body text-[10px]">Completed</span>
      </div>
    ) : (
      <button 
        onClick={onStart}
        className="flex items-center gap-1 font-body text-xs text-accent font-medium hover:underline"
      >
        {progress ? 'Continue' : 'Start'} <ArrowRight size={10} />
      </button>
    )}
  </motion.div>
);

const LoadingState = () => (
  <div className="text-center py-12">
    <div className="animate-pulse font-body text-muted-foreground">Loading content...</div>
  </div>
);

const EmptyState = ({ message, icon: Icon = BookOpen }: { message: string; icon?: any }) => (
  <div className="text-center py-12 bg-card rounded-xl border border-border">
    <Icon className="mx-auto text-muted-foreground mb-3" size={40} />
    <h3 className="font-display text-xl text-foreground mb-2">Nothing here yet</h3>
    <p className="font-body text-muted-foreground">{message}</p>
  </div>
);

export default ContentLibrary;
