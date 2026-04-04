import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  BookOpen, Search, Bookmark, Filter, 
  Sparkles, Clock, Play, ChevronRight, Lightbulb, Target,
  GraduationCap, Rocket, TrendingUp, Brain, Compass,
  Zap, CheckCircle, ArrowRight, BookMarked, X,
  Map, Trophy, Users, MessageSquare, Calendar
} from "lucide-react";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";
import DirectorySearchDrawer from "@/components/directory/DirectorySearchDrawer";

const DOMAINS = ["All", "Tech", "Design", "Leadership", "Marketing", "Finance", "Healthcare", "Entrepreneurship"];
const DIFFICULTY_LEVELS = ["all", "beginner", "intermediate", "advanced"];

const ContentLibrary = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [difficulty, setDifficulty] = useState("all");

  // Data
  const [learningTracks, setLearningTracks] = useState<any[]>([]);
  const [learningCapsules, setLearningCapsules] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);

  // AI states
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [skillMappings, setSkillMappings] = useState<any>(null);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [quizData, setQuizData] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [challengeData, setChallengeData] = useState<any>(null);
  const [reflectionData, setReflectionData] = useState<any>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [loadingAI, setLoadingAI] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<any>(null);

  useEffect(() => { fetchAllData(); }, [user]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [tracksRes, capsulesRes] = await Promise.all([
        supabase.from("learning_tracks").select("*").order("order_index"),
        supabase.from("learning_capsules").select("*").order("order_index"),
      ]);
      setLearningTracks(tracksRes.data || []);
      setLearningCapsules(capsulesRes.data || []);

      if (user) {
        const [progressRes, bookmarksRes, interestsRes] = await Promise.all([
          supabase.from("learning_track_progress").select("*").eq("user_id", user.id),
          supabase.from("content_bookmarks").select("*").eq("user_id", user.id),
          supabase.from("interests").select("*").eq("user_id", user.id),
        ]);
        setUserProgress(progressRes.data || []);
        setBookmarks(bookmarksRes.data || []);
        setInterests(interestsRes.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
    setLoading(false);
  };

  const invokeAI = async (type: string, context: any) => {
    const { data, error } = await supabase.functions.invoke("learning-library-ai", {
      body: { type, context },
    });
    if (error) throw error;
    return data;
  };

  const fetchAIRecommendations = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    setLoadingAI("recommend");
    try {
      // First get cross-module signals for better recommendations
      const { data: signals } = await supabase
        .from("user_signals")
        .select("signal_value, signal_type, signal_source, strength")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);

      const signalKeywords = (signals || []).map((s: any) => s.signal_value);
      const signalSources = [...new Set((signals || []).map((s: any) => s.signal_source))];

      const data = await invokeAI("recommend_learning", {
        skills: interests.map(i => i.name),
        interests: interests.map(i => i.name),
        tracksCompleted: userProgress.filter(p => p.status === "completed").length,
        capsulesCompleted: 0,
        recentDomains: interests.map(i => i.category).filter((v, i, a) => a.indexOf(v) === i),
        crossModuleSignals: signalKeywords.slice(0, 30),
        signalSources,
      });
      setAiRecommendations(data);
    } catch (err: any) { toast.error(err.message || "Failed to get recommendations"); }
    setLoadingAI(null);
  };

  const fetchSkillMappings = async () => {
    if (!user) return;
    setLoadingAI("skills");
    try {
      const data = await invokeAI("skill_mapping", {
        skills: interests.map(i => i.name),
        interests: interests.map(i => i.name),
        experienceLevel: "beginner",
      });
      setSkillMappings(data);
    } catch (err: any) { toast.error(err.message || "Failed to map skills"); }
    setLoadingAI(null);
  };

  const generateLearningPath = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    setLoadingAI("path");
    try {
      const data = await invokeAI("learning_path_suggestion", {
        skills: interests.map(i => i.name),
        domain: domain !== "All" ? domain : interests[0]?.category || "general",
        hoursPerWeek: 5,
        learningStyle: "mixed",
      });
      setLearningPath(data);
    } catch (err: any) { toast.error(err.message || "Failed to generate path"); }
    setLoadingAI(null);
  };

  const generateQuiz = async (topic: string) => {
    setLoadingAI("quiz");
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const data = await invokeAI("generate_quiz", { topic, difficulty: "beginner" });
      setQuizData(data);
      setActiveModal("quiz");
    } catch (err: any) { toast.error(err.message || "Failed to generate quiz"); }
    setLoadingAI(null);
  };

  const generateChallenge = async () => {
    if (!user) return;
    setLoadingAI("challenge");
    try {
      const data = await invokeAI("challenge_suggestion", {
        skills: interests.map(i => i.name),
        domain: domain !== "All" ? domain : "general",
        level: "beginner",
        availableTime: "2-3 hours",
      });
      setChallengeData(data);
      setActiveModal("challenge");
    } catch (err: any) { toast.error(err.message || "Failed to generate challenge"); }
    setLoadingAI(null);
  };

  const generateReflection = async (contentTitle: string) => {
    setLoadingAI("reflection");
    try {
      const data = await invokeAI("content_reflection", {
        contentTitle,
        contentType: "track",
        skills: interests.map(i => i.name),
      });
      setReflectionData(data);
      setActiveModal("reflection");
    } catch (err: any) { toast.error(err.message || "Failed to generate reflection"); }
    setLoadingAI(null);
  };

  const saveReflection = async () => {
    if (!user || !reflectionText.trim()) return;
    await supabase.from("journal_entries").insert({
      user_id: user.id,
      content: reflectionText,
      title: `Reflection: ${reflectionData?.key_takeaways?.[0] || "Learning"}`,
      tags: ["learning", "reflection"],
    });
    toast.success("Reflection saved to your journal ✨");
    setReflectionText("");
    setActiveModal(null);
  };

  const toggleBookmark = async (contentType: string, contentId: string) => {
    if (!user) { toast.error("Please sign in to save content"); return; }
    const existing = bookmarks.find(b => b.content_type === contentType && b.content_id === contentId);
    if (existing) {
      await supabase.from("content_bookmarks").delete().eq("id", existing.id);
      setBookmarks(bookmarks.filter(b => b.id !== existing.id));
      toast.success("Removed from saved");
    } else {
      const { data } = await supabase.from("content_bookmarks").insert({
        user_id: user.id, content_type: contentType, content_id: contentId,
      }).select().single();
      if (data) setBookmarks([...bookmarks, data]);
      toast.success("Saved for later");
    }
  };

  const startTrack = async (trackId: string) => {
    if (!user) { toast.error("Please sign in to track progress"); return; }
    const existing = userProgress.find(p => p.track_id === trackId);
    if (!existing) {
      const { data } = await supabase.from("learning_track_progress").insert({
        user_id: user.id, track_id: trackId, status: "in_progress", current_module: 0,
      }).select().single();
      if (data) setUserProgress([...userProgress, data]);
    }
    toast.success("Started learning! Good luck 🚀");
  };

  const isBookmarked = (type: string, id: string) => bookmarks.some(b => b.content_type === type && b.content_id === id);
  const getTrackProgress = (trackId: string) => userProgress.find(p => p.track_id === trackId);

  // Filtering
  const filteredTracks = learningTracks.filter(t => {
    const matchSearch = !search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    const matchDomain = domain === "All" || t.domain === domain || t.category === domain;
    const matchDifficulty = difficulty === "all" || t.difficulty === difficulty;
    return matchSearch && matchDomain && matchDifficulty;
  });

  const filteredCapsules = learningCapsules.filter(c => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficulty === "all" || c.difficulty === difficulty;
    return matchSearch && matchDifficulty;
  });

  const starterPacks = learningTracks.filter(t => t.is_starter_pack);
  const certTracks = learningTracks.filter(t => t.is_certification);
  const inProgressTracks = userProgress.filter(p => p.status === "in_progress");
  const completedCount = userProgress.filter(p => p.status === "completed").length;

  const quizScore = quizSubmitted && quizData?.questions
    ? quizData.questions.reduce((acc: number, q: any, i: number) => acc + (quizAnswers[i] === q.correct_index ? 1 : 0), 0)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Content Library</h1>
            <p className="font-body text-sm text-muted-foreground">
              Here's everything you need to learn — at your pace, based on what excites you.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {user && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Tracks Started", value: inProgressTracks.length, icon: GraduationCap, color: "text-primary" },
            { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-accent" },
            { label: "Saved Items", value: bookmarks.length, icon: Bookmark, color: "text-secondary" },
            { label: "Interests", value: interests.length, icon: TrendingUp, color: "text-primary" },
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
        <TabsList className="grid grid-cols-6 w-full max-w-3xl">
          <TabsTrigger value="discover" className="gap-1 text-xs"><Compass size={14} /> Discover</TabsTrigger>
          <TabsTrigger value="tracks" className="gap-1 text-xs"><GraduationCap size={14} /> Tracks</TabsTrigger>
          <TabsTrigger value="capsules" className="gap-1 text-xs"><Zap size={14} /> Capsules</TabsTrigger>
          <TabsTrigger value="path" className="gap-1 text-xs"><Map size={14} /> My Path</TabsTrigger>
          <TabsTrigger value="skills" className="gap-1 text-xs"><Brain size={14} /> Skills</TabsTrigger>
          <TabsTrigger value="saved" className="gap-1 text-xs"><Bookmark size={14} /> Saved</TabsTrigger>
        </TabsList>

        {/* Search & Filters */}
        <div className="space-y-4">
          <ModuleSearchBar
              placeholder="Search courses, skills, topics..."
              sources={["domains", "skills"]}
              onSearch={(q) => setSearch(q)}
              onSelect={(item) => setSearch(item.title)}
              showAiBadge
              filterOptions={[
                { key: "domain", label: "Domain", options: DOMAINS.map(d => ({ value: d, label: d })) },
                { key: "difficulty", label: "Difficulty", options: DIFFICULTY_LEVELS.map(d => ({ value: d, label: d.charAt(0).toUpperCase() + d.slice(1) })) },
              ]}
              activeFilters={{ domain, difficulty }}
              onFilterChange={(key, val) => {
                if (key === "domain") setDomain(val);
                else if (key === "difficulty") setDifficulty(val);
              }}
            />
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map(d => (
              <button key={d} onClick={() => setDomain(d)} className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${domain === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {d}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <span className="font-body text-xs text-muted-foreground">Level:</span>
            {DIFFICULTY_LEVELS.map(l => (
              <button key={l} onClick={() => setDifficulty(l)} className={`px-2 py-1 rounded font-body text-[10px] uppercase transition-all ${difficulty === l ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ===== DISCOVER TAB ===== */}
        <TabsContent value="discover" className="space-y-8">
          {/* AI Recommendations */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                <h2 className="font-display text-xl text-foreground">AI Recommendations</h2>
              </div>
              <Button onClick={fetchAIRecommendations} disabled={loadingAI === "recommend"} size="sm" className="gap-2">
                {loadingAI === "recommend" ? "Analyzing..." : "Get Personalized Picks"} <Sparkles size={14} />
              </Button>
            </div>
            {aiRecommendations ? (
              <div className="space-y-4">
                {aiRecommendations.learning_focus && (
                  <p className="font-body text-sm text-muted-foreground"><strong className="text-foreground">Your Focus:</strong> {aiRecommendations.learning_focus}</p>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {aiRecommendations.recommendations?.slice(0, 6).map((rec: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant={rec.priority === 'high' ? 'default' : 'secondary'} className="text-[10px]">{rec.priority} priority</Badge>
                        <span className="font-body text-[10px] text-muted-foreground">{rec.type}</span>
                      </div>
                      <h3 className="font-display text-sm text-foreground mb-1">{rec.title}</h3>
                      <p className="font-body text-xs text-muted-foreground mb-2">{rec.reason}</p>
                      {rec.estimated_time && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock size={10} /><span className="font-body text-[10px]">{rec.estimated_time}</span>
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
              <p className="font-body text-sm text-muted-foreground">Click above to get AI-powered learning suggestions based on your profile and goals.</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <button onClick={generateChallenge} disabled={loadingAI === "challenge"} className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-sm transition-all group">
              <Trophy size={24} className="text-accent mb-3" />
              <h3 className="font-display text-base text-foreground mb-1">Get a Challenge</h3>
              <p className="font-body text-xs text-muted-foreground">AI-generated real-world task to apply your learning</p>
            </button>
            <button onClick={() => generateQuiz(interests[0]?.name || "career development")} disabled={loadingAI === "quiz"} className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-sm transition-all group">
              <Lightbulb size={24} className="text-primary mb-3" />
              <h3 className="font-display text-base text-foreground mb-1">Take a Quiz</h3>
              <p className="font-body text-xs text-muted-foreground">Test your knowledge with AI-generated questions</p>
            </button>
            <button onClick={() => { setActiveTab("path"); generateLearningPath(); }} disabled={loadingAI === "path"} className="bg-card rounded-xl border border-border p-5 text-left hover:shadow-sm transition-all group">
              <Map size={24} className="text-secondary mb-3" />
              <h3 className="font-display text-base text-foreground mb-1">Build My Path</h3>
              <p className="font-body text-xs text-muted-foreground">Generate a personalized 4-week learning plan</p>
            </button>
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
                  <TrackCard key={track.id} track={track} index={i} progress={getTrackProgress(track.id)} isBookmarked={isBookmarked('track', track.id)} onBookmark={() => toggleBookmark('track', track.id)} onStart={() => startTrack(track.id)} onReflect={() => generateReflection(track.title)} />
                ))}
              </div>
            </div>
          )}

          {/* Capsules Preview */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-primary" />
              <h2 className="font-display text-xl text-foreground">Quick Capsules</h2>
              <span className="font-body text-xs text-muted-foreground">5-15 min each</span>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {learningCapsules.slice(0, 8).map((capsule, i) => (
                <CapsuleCard key={capsule.id} capsule={capsule} index={i} isBookmarked={isBookmarked('capsule', capsule.id)} onBookmark={() => toggleBookmark('capsule', capsule.id)} onQuiz={() => generateQuiz(capsule.title)} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ===== TRACKS TAB ===== */}
        <TabsContent value="tracks" className="space-y-6">
          {/* Certification Tracks */}
          {certTracks.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap size={18} className="text-primary" />
                <h2 className="font-display text-lg text-foreground">Certification Tracks</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certTracks.map((track, i) => (
                  <TrackCard key={track.id} track={track} index={i} progress={getTrackProgress(track.id)} isBookmarked={isBookmarked('track', track.id)} onBookmark={() => toggleBookmark('track', track.id)} onStart={() => startTrack(track.id)} onReflect={() => generateReflection(track.title)} isCert />
                ))}
              </div>
            </div>
          )}

          {loading ? <LoadingState /> : filteredTracks.length === 0 ? <EmptyState message="No learning tracks found" /> : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTracks.map((track, i) => (
                <TrackCard key={track.id} track={track} index={i} progress={getTrackProgress(track.id)} isBookmarked={isBookmarked('track', track.id)} onBookmark={() => toggleBookmark('track', track.id)} onStart={() => startTrack(track.id)} onReflect={() => generateReflection(track.title)} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== CAPSULES TAB ===== */}
        <TabsContent value="capsules" className="space-y-6">
          {loading ? <LoadingState /> : filteredCapsules.length === 0 ? <EmptyState message="No learning capsules found" /> : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredCapsules.map((capsule, i) => (
                <CapsuleCard key={capsule.id} capsule={capsule} index={i} isBookmarked={isBookmarked('capsule', capsule.id)} onBookmark={() => toggleBookmark('capsule', capsule.id)} onQuiz={() => generateQuiz(capsule.title)} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== MY PATH TAB ===== */}
        <TabsContent value="path" className="space-y-6">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Map size={20} className="text-primary" />
                <h2 className="font-display text-xl text-foreground">My Learning Path</h2>
              </div>
              <Button onClick={generateLearningPath} disabled={loadingAI === "path"} size="sm" className="gap-2">
                {loadingAI === "path" ? "Generating..." : learningPath ? "Regenerate" : "Generate Path"} <Sparkles size={14} />
              </Button>
            </div>

            {learningPath ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display text-lg text-foreground">{learningPath.path_title}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">{learningPath.path_description}</p>
                </div>

                {/* Weekly Plan */}
                <div className="space-y-4">
                  {learningPath.weeks?.map((week: any) => (
                    <motion.div key={week.week_number} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: week.week_number * 0.1 }} className="bg-card rounded-xl border border-border p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-display text-sm text-primary">{week.week_number}</span>
                        </div>
                        <div>
                          <h4 className="font-display text-base text-foreground">{week.theme}</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {week.goals?.map((g: string, gi: number) => (
                              <Badge key={gi} variant="outline" className="text-[10px]">{g}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 ml-11">
                        {week.activities?.map((act: any, ai: number) => (
                          <div key={ai} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="mt-0.5">
                              {act.type === "track" && <GraduationCap size={14} className="text-primary" />}
                              {act.type === "capsule" && <Zap size={14} className="text-accent" />}
                              {act.type === "project" && <Rocket size={14} className="text-secondary" />}
                              {act.type === "reflection" && <MessageSquare size={14} className="text-muted-foreground" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-body text-sm text-foreground">{act.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-body text-[10px] text-muted-foreground">{act.duration}</span>
                                <span className="font-body text-[10px] text-muted-foreground">• {act.outcome}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Expected Outcomes */}
                {learningPath.expected_outcomes && (
                  <div className="p-4 bg-accent/5 rounded-lg">
                    <h4 className="font-display text-sm text-foreground mb-2">Expected Outcomes</h4>
                    <div className="flex flex-wrap gap-2">
                      {learningPath.expected_outcomes.map((o: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{o}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="font-body text-sm text-muted-foreground">Generate a personalized 4-week learning plan based on your interests and goals.</p>
              </div>
            )}
          </div>

          {/* In-Progress Tracks */}
          {inProgressTracks.length > 0 && (
            <div>
              <h3 className="font-display text-lg text-foreground mb-3">Continue Learning</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {inProgressTracks.map((prog, i) => {
                  const track = learningTracks.find(t => t.id === prog.track_id);
                  if (!track) return null;
                  return (
                    <div key={prog.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                      <span className="text-2xl">{track.icon_emoji || '📚'}</span>
                      <div className="flex-1">
                        <h4 className="font-display text-sm text-foreground">{track.title}</h4>
                        <Progress value={(prog.current_module || 0) * 20} className="h-1.5 mt-2" />
                      </div>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => generateReflection(track.title)}>
                        <Play size={12} /> Continue
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ===== SKILLS TAB ===== */}
        <TabsContent value="skills" className="space-y-6">
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target size={20} className="text-primary" />
                <h2 className="font-display text-xl text-foreground">Where Do Your Skills Apply?</h2>
              </div>
              <Button onClick={fetchSkillMappings} disabled={loadingAI === "skills"} size="sm" className="gap-2">
                {loadingAI === "skills" ? "Mapping..." : "Map My Skills"} <Brain size={14} />
              </Button>
            </div>
            {skillMappings ? (
              <div className="space-y-4">
                {skillMappings.strongest_combination && (
                  <p className="font-body text-sm text-foreground"><strong>Your Unique Blend:</strong> {skillMappings.strongest_combination}</p>
                )}
                {skillMappings.recommended_path && (
                  <p className="font-body text-sm text-primary italic">🧭 {skillMappings.recommended_path}</p>
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
                            {mapping.project_ideas?.slice(0, 2).map((idea: string, idx: number) => (
                              <li key={idx} className="font-body text-xs text-foreground flex items-center gap-1">
                                <Lightbulb size={10} className="text-accent" /> {idea}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {mapping.startup_applications && (
                          <div>
                            <span className="font-body text-xs text-muted-foreground">Startup Use:</span>
                            <ul className="mt-1 space-y-0.5">
                              {mapping.startup_applications?.slice(0, 2).map((app: string, idx: number) => (
                                <li key={idx} className="font-body text-xs text-foreground flex items-center gap-1">
                                  <Rocket size={10} className="text-primary" /> {app}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {skillMappings.skill_gaps?.length > 0 && (
                  <div className="p-4 bg-accent/5 rounded-lg">
                    <h4 className="font-display text-sm text-foreground mb-2">Skills to Develop</h4>
                    <div className="flex flex-wrap gap-2">
                      {skillMappings.skill_gaps.map((gap: string, i: number) => (
                        <Badge key={i} variant="secondary">{gap}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Discover which roles, projects, and opportunities match your skill set.</p>
            )}
          </div>
        </TabsContent>

        {/* ===== SAVED TAB ===== */}
        <TabsContent value="saved" className="space-y-6">
          {bookmarks.length === 0 ? (
            <EmptyState message="No saved content yet. Bookmark items to find them here." icon={BookMarked} />
          ) : (
            <div className="space-y-6">
              {bookmarks.filter(b => b.content_type === 'track').length > 0 && (
                <div>
                  <h3 className="font-display text-lg text-foreground mb-3">Saved Tracks</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookmarks.filter(b => b.content_type === 'track').map((bm, i) => {
                      const track = learningTracks.find(t => t.id === bm.content_id);
                      if (!track) return null;
                      return <TrackCard key={bm.id} track={track} index={i} progress={getTrackProgress(track.id)} isBookmarked onBookmark={() => toggleBookmark('track', track.id)} onStart={() => startTrack(track.id)} onReflect={() => generateReflection(track.title)} />;
                    })}
                  </div>
                </div>
              )}
              {bookmarks.filter(b => b.content_type === 'capsule').length > 0 && (
                <div>
                  <h3 className="font-display text-lg text-foreground mb-3">Saved Capsules</h3>
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {bookmarks.filter(b => b.content_type === 'capsule').map((bm, i) => {
                      const capsule = learningCapsules.find(c => c.id === bm.content_id);
                      if (!capsule) return null;
                      return <CapsuleCard key={bm.id} capsule={capsule} index={i} isBookmarked onBookmark={() => toggleBookmark('capsule', capsule.id)} onQuiz={() => generateQuiz(capsule.title)} />;
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== MODALS ===== */}
      <AnimatePresence>
        {/* Quiz Modal */}
        {activeModal === "quiz" && quizData && (
          <ModalOverlay onClose={() => setActiveModal(null)}>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-foreground">{quizData.quiz_title || "Knowledge Check"}</h2>
                <button onClick={() => setActiveModal(null)}><X size={20} className="text-muted-foreground" /></button>
              </div>
              {quizData.questions?.map((q: any, qi: number) => (
                <div key={qi} className="bg-muted/30 rounded-lg p-4">
                  <p className="font-body text-sm text-foreground font-medium mb-3">{qi + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options?.map((opt: string, oi: number) => {
                      const isSelected = quizAnswers[qi] === oi;
                      const isCorrect = quizSubmitted && oi === q.correct_index;
                      const isWrong = quizSubmitted && isSelected && oi !== q.correct_index;
                      return (
                        <button key={oi} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                          className={`w-full text-left px-3 py-2 rounded-lg font-body text-sm border transition-all ${
                            isCorrect ? "border-green-500 bg-green-500/10 text-foreground" :
                            isWrong ? "border-red-500 bg-red-500/10 text-foreground" :
                            isSelected ? "border-primary bg-primary/10 text-foreground" :
                            "border-border hover:border-muted-foreground text-muted-foreground"
                          }`}>
                          {opt}
                        </button>
                      );
                    })}
                    {quizSubmitted && quizAnswers[qi] !== q.correct_index && (
                      <p className="font-body text-xs text-muted-foreground mt-1">💡 {q.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
              {!quizSubmitted ? (
                <Button onClick={() => setQuizSubmitted(true)} disabled={Object.keys(quizAnswers).length < (quizData.questions?.length || 0)} className="w-full">
                  Submit Answers
                </Button>
              ) : (
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="font-display text-lg text-foreground">Score: {quizScore}/{quizData.questions?.length}</p>
                  <p className="font-body text-sm text-muted-foreground mt-1">{quizData.completion_message}</p>
                </div>
              )}
            </div>
          </ModalOverlay>
        )}

        {/* Challenge Modal */}
        {activeModal === "challenge" && challengeData && (
          <ModalOverlay onClose={() => setActiveModal(null)}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-foreground">{challengeData.challenge_title}</h2>
                <button onClick={() => setActiveModal(null)}><X size={20} className="text-muted-foreground" /></button>
              </div>
              <p className="font-body text-sm text-muted-foreground">{challengeData.challenge_description}</p>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{challengeData.difficulty}</Badge>
                <span className="font-body text-xs text-muted-foreground flex items-center gap-1"><Clock size={12} />{challengeData.estimated_time}</span>
              </div>
              <div>
                <h4 className="font-display text-sm text-foreground mb-2">Steps</h4>
                <ol className="space-y-2">
                  {challengeData.steps?.map((step: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="font-body text-[10px] text-primary">{i + 1}</span></span>
                      <span className="font-body text-sm text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              {challengeData.deliverables && (
                <div>
                  <h4 className="font-display text-sm text-foreground mb-2">Deliverables</h4>
                  <div className="flex flex-wrap gap-2">
                    {challengeData.deliverables.map((d: string, i: number) => <Badge key={i} variant="outline">{d}</Badge>)}
                  </div>
                </div>
              )}
              {challengeData.bonus_stretch && (
                <p className="font-body text-sm text-accent italic">⭐ Bonus: {challengeData.bonus_stretch}</p>
              )}
            </div>
          </ModalOverlay>
        )}

        {/* Reflection Modal */}
        {activeModal === "reflection" && reflectionData && (
          <ModalOverlay onClose={() => setActiveModal(null)}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-foreground">Reflect on Your Learning</h2>
                <button onClick={() => setActiveModal(null)}><X size={20} className="text-muted-foreground" /></button>
              </div>
              {reflectionData.encouragement && (
                <p className="font-body text-sm text-primary">{reflectionData.encouragement}</p>
              )}
              {reflectionData.key_takeaways && (
                <div>
                  <h4 className="font-display text-sm text-foreground mb-2">Key Takeaways</h4>
                  <ul className="space-y-1">
                    {reflectionData.key_takeaways.map((t: string, i: number) => (
                      <li key={i} className="font-body text-sm text-foreground flex items-start gap-2"><CheckCircle size={14} className="text-primary mt-0.5 flex-shrink-0" />{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {reflectionData.reflection_prompts && (
                <div>
                  <h4 className="font-display text-sm text-foreground mb-2">Reflection Prompts</h4>
                  <ul className="space-y-1">
                    {reflectionData.reflection_prompts.map((p: string, i: number) => (
                      <li key={i} className="font-body text-sm text-muted-foreground">💭 {p}</li>
                    ))}
                  </ul>
                </div>
              )}
              <Textarea placeholder="Write your thoughts here..." value={reflectionText} onChange={e => setReflectionText(e.target.value)} className="min-h-[80px]" />
              <div className="flex gap-2">
                <Button onClick={saveReflection} disabled={!reflectionText.trim()} className="flex-1 gap-2">
                  <BookOpen size={14} /> Save to Journal
                </Button>
                <Button variant="outline" onClick={() => setActiveModal(null)}>Skip</Button>
              </div>
              {reflectionData.application_ideas && (
                <div className="p-3 bg-accent/5 rounded-lg">
                  <h4 className="font-display text-xs text-foreground mb-1">Apply What You Learned</h4>
                  {reflectionData.application_ideas.map((a: string, i: number) => (
                    <p key={i} className="font-body text-xs text-muted-foreground">→ {a}</p>
                  ))}
                </div>
              )}
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===== Sub-components =====

const ModalOverlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card rounded-2xl border border-border p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-lg" onClick={e => e.stopPropagation()}>
      {children}
    </motion.div>
  </motion.div>
);

const TrackCard = ({ track, index, progress, isBookmarked, onBookmark, onStart, onReflect, isCert }: any) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="bg-card rounded-xl border border-border p-5 hover:shadow-sm transition-all group">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{track.icon_emoji || '📚'}</span>
        <Badge variant="secondary" className="text-[10px] capitalize">{track.difficulty || "beginner"}</Badge>
        {isCert && <Badge className="text-[10px]">Cert</Badge>}
      </div>
      <button onClick={onBookmark} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Bookmark size={16} className={isBookmarked ? "text-accent fill-accent" : "text-muted-foreground"} />
      </button>
    </div>
    <h3 className="font-display text-lg text-foreground mb-2">{track.title}</h3>
    {track.description && <p className="font-body text-sm text-muted-foreground mb-3 line-clamp-2">{track.description}</p>}
    <div className="flex items-center gap-3 text-muted-foreground mb-3">
      {track.estimated_hours && <div className="flex items-center gap-1"><Clock size={12} /><span className="font-body text-xs">{track.estimated_hours}h</span></div>}
      <div className="flex items-center gap-1"><Target size={12} /><span className="font-body text-xs">{track.skills_gained?.length || 0} skills</span></div>
    </div>
    {progress ? (
      <div className="space-y-2">
        <Progress value={(progress.current_module || 0) * 20} className="h-1.5" />
        <div className="flex items-center justify-between">
          <span className="font-body text-[10px] text-muted-foreground">Module {progress.current_module || 0}</span>
          <button onClick={onReflect} className="font-body text-[10px] text-primary hover:underline">Reflect</button>
        </div>
      </div>
    ) : (
      <Button onClick={onStart} size="sm" className="w-full gap-2"><Play size={12} /> Start Learning</Button>
    )}
  </motion.div>
);

const CapsuleCard = ({ capsule, index, isBookmarked, onBookmark, onQuiz }: any) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className="bg-card rounded-lg border border-border p-4 hover:shadow-sm transition-all group">
    <div className="flex items-start justify-between mb-2">
      <Badge variant="outline" className="text-[10px] capitalize">{capsule.category}</Badge>
      <button onClick={onBookmark} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Bookmark size={14} className={isBookmarked ? "text-accent fill-accent" : "text-muted-foreground"} />
      </button>
    </div>
    <h4 className="font-display text-sm text-foreground mb-1 line-clamp-2">{capsule.title}</h4>
    <div className="flex items-center gap-2 text-muted-foreground mb-2">
      <Clock size={10} /><span className="font-body text-[10px]">{capsule.duration_minutes} min</span>
      {capsule.difficulty && <Badge variant="secondary" className="text-[8px] capitalize">{capsule.difficulty}</Badge>}
    </div>
    <div className="flex items-center gap-2">
      <button onClick={onQuiz} className="font-body text-xs text-primary hover:underline flex items-center gap-1">
        <Lightbulb size={10} /> Quiz
      </button>
    </div>
  </motion.div>
);

const LoadingState = () => (
  <div className="text-center py-12"><div className="animate-pulse font-body text-muted-foreground">Loading content...</div></div>
);

const EmptyState = ({ message, icon: Icon = BookOpen }: { message: string; icon?: any }) => (
  <div className="text-center py-12 bg-card rounded-xl border border-border">
    <Icon className="mx-auto text-muted-foreground mb-3" size={40} />
    <h3 className="font-display text-xl text-foreground mb-2">Nothing here yet</h3>
    <p className="font-body text-muted-foreground">{message}</p>
  </div>
);

export default ContentLibrary;
