import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import MultiSelect from "@/components/ui/multi-select";
import { toast } from "sonner";
import {
  Heart, ThumbsUp, Bookmark, XCircle, ChevronLeft, ChevronRight,
  Clock, Sparkles, Brain, Star, TrendingUp, Lightbulb, Quote,
  CheckCircle2, AlertTriangle, User, Briefcase, Loader2, RefreshCw,
  ArrowRight, Zap
} from "lucide-react";

type InteractionType = "like" | "love" | "bookmark" | "not_for_me";

interface CareerStory {
  id: string;
  career_path_id: string | null;
  title: string;
  narrator_name: string;
  narrator_role: string;
  narrator_experience_years: number | null;
  story_content: string;
  day_in_life: string | null;
  skills_highlighted: string[];
  pros: string[];
  cons: string[];
  advice: string | null;
  domain: string;
  tags: string[];
  difficulty_level: string | null;
}

interface BehaviorAnalysis {
  domains_attracted: string[];
  domains_rejected: string[];
  skills_resonated: string[];
  personality_signals: Record<string, string>;
  career_inclinations: {
    top_3_paths: string[];
    emerging_interests: string[];
    blind_spots: string[];
  };
  ai_summary: string;
  confidence_score: number;
  roadmap_seeds: { domain: string; reason: string; entry_point: string }[];
}

const PAGE_SIZE = 20;
const PREFETCH_THRESHOLD = 5; // when N cards left, fetch next batch

const StoryModeCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stories, setStories] = useState<CareerStory[]>([]);
  const [interactions, setInteractions] = useState<Record<string, InteractionType>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BehaviorAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [filterDomains, setFilterDomains] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allDomains, setAllDomains] = useState<string[]>([]);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (user) fetchInitial();
  }, [user]);

  const fetchInitial = async () => {
    setLoading(true);
    // Parallel: first page of stories + interactions + analysis + domain list
    const [storiesRes, intRes, analysisRes, domainsRes] = await Promise.all([
      supabase
        .from("career_stories")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1),
      supabase.from("career_story_interactions").select("*").eq("user_id", user!.id),
      supabase.from("story_behavior_analysis").select("*").eq("user_id", user!.id).eq("analysis_type", "story_preferences").maybeSingle(),
      supabase.from("career_stories").select("domain").eq("is_active", true),
    ]);
    const fetchedStories = (storiesRes.data as unknown as CareerStory[]) || [];
    setStories(fetchedStories);
    setHasMore(fetchedStories.length === PAGE_SIZE);
    setPage(1);

    const map: Record<string, InteractionType> = {};
    (intRes.data || []).forEach((i: any) => { map[i.story_id] = i.interaction_type; });
    setInteractions(map);

    if (analysisRes.data) {
      setAnalysis({
        domains_attracted: (analysisRes.data as any).domains_attracted || [],
        domains_rejected: (analysisRes.data as any).domains_rejected || [],
        skills_resonated: (analysisRes.data as any).skills_resonated || [],
        personality_signals: (analysisRes.data as any).personality_signals || {},
        career_inclinations: (analysisRes.data as any).career_inclinations || {},
        ai_summary: (analysisRes.data as any).ai_summary || "",
        confidence_score: (analysisRes.data as any).confidence_score || 0,
        roadmap_seeds: [],
      });
    }

    // Build the full domain list from a lightweight query (no story_content)
    const uniqueDomains = [...new Set(((domainsRes.data as any[]) || []).map((r) => r.domain).filter(Boolean))].sort() as string[];
    setAllDomains(uniqueDomains);

    // Auto-generate stories only if completely empty
    if (fetchedStories.length === 0) {
      generateStories();
    }

    setLoading(false);
  };

  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from("career_stories")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (filterDomain) query = query.eq("domain", filterDomain);
    const { data } = await query;
    const next = (data as unknown as CareerStory[]) || [];
    setStories((prev) => {
      // Dedupe by id
      const seen = new Set(prev.map((s) => s.id));
      return [...prev, ...next.filter((s) => !seen.has(s.id))];
    });
    setHasMore(next.length === PAGE_SIZE);
    setPage((p) => p + 1);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page, filterDomain]);

  // Prefetch next page when user nears the end of loaded cards
  useEffect(() => {
    if (!loading && hasMore && stories.length - currentIndex <= PREFETCH_THRESHOLD) {
      fetchMore();
    }
  }, [currentIndex, stories.length, hasMore, loading, fetchMore]);

  // When user changes domain filter, refetch from page 0 in that domain
  useEffect(() => {
    if (loading) return;
    const refetchForFilter = async () => {
      setLoadingMore(true);
      let query = supabase
        .from("career_stories")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1);
      if (filterDomain) query = query.eq("domain", filterDomain);
      const { data } = await query;
      const next = (data as unknown as CareerStory[]) || [];
      setStories(next);
      setHasMore(next.length === PAGE_SIZE);
      setPage(1);
      setCurrentIndex(0);
      setLoadingMore(false);
    };
    refetchForFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDomain]);

  const generateStories = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-stories-ai", {
        body: { type: "generate_stories", context: {} },
      });
      if (error) throw error;
      if (data?.generated?.length > 0) {
        toast.success(`Generated ${data.generated.length} new career stories!`);
        await fetchInitial();
      }
      if (data?.remaining > 0) {
        // Generate more in background
        setTimeout(() => generateStories(), 2000);
      }
    } catch (e: any) {
      if (e?.message?.includes("429")) toast.error("AI is busy, stories will generate shortly");
      else console.error("Story generation error:", e);
    } finally {
      setGenerating(false);
    }
  };

  const handleInteraction = async (storyId: string, type: InteractionType) => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const existing = interactions[storyId];

    if (existing === type) {
      await supabase.from("career_story_interactions").delete().eq("user_id", user!.id).eq("story_id", storyId);
      setInteractions(prev => { const n = { ...prev }; delete n[storyId]; return n; });
      toast.success("Removed");
      return;
    }

    await supabase.from("career_story_interactions").upsert({
      user_id: user!.id,
      story_id: storyId,
      interaction_type: type,
      time_spent_seconds: timeSpent,
    }, { onConflict: "user_id,story_id" });
    setInteractions(prev => ({ ...prev, [storyId]: type }));

    const labels: Record<InteractionType, string> = {
      like: "Liked! 👍", love: "Loved this story! ❤️", bookmark: "Saved for later! 🔖", not_for_me: "Got it — not your vibe ✓"
    };
    toast.success(labels[type]);

    // Auto-advance after reaction
    setTimeout(() => {
      if (currentIndex < filtered.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setExpanded(false);
        startTimeRef.current = Date.now();
      }
    }, 600);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("career-stories-ai", {
        body: { type: "analyze_behavior", context: { user_id: user!.id } },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setAnalysis(data);
      setShowAnalysis(true);
      toast.success("Behavioral analysis complete! 🧠");
    } catch (e: any) {
      toast.error("Could not analyze yet — keep exploring more stories!");
    } finally {
      setAnalyzing(false);
    }
  };

  const domains = allDomains;
  const filtered = stories; // server already filtered when filterDomain set
  const current = filtered[currentIndex];

  const interactionCount = Object.keys(interactions).length;
  const stats = {
    loved: Object.values(interactions).filter(t => t === "love").length,
    liked: Object.values(interactions).filter(t => t === "like").length,
    bookmarked: Object.values(interactions).filter(t => t === "bookmark").length,
    skipped: Object.values(interactions).filter(t => t === "not_for_me").length,
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  }

  if (stories.length === 0 && generating) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-16">
          <Loader2 className="mx-auto animate-spin text-primary mb-4" size={48} />
          <h3 className="font-display text-xl mb-2">Generating Career Stories...</h3>
          <p className="font-body text-muted-foreground">our AI is crafting real-feel stories from professionals across different paths. hang tight ✨</p>
        </CardContent>
      </Card>
    );
  }

  if (stories.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Quote className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="font-display text-xl mb-2">No Stories Yet</h3>
          <p className="font-body text-muted-foreground mb-4">Career stories will be generated from available career paths.</p>
          <Button onClick={generateStories} disabled={generating}>
            {generating ? <><Loader2 size={14} className="mr-2 animate-spin" /> Generating...</> : "Generate Stories"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm"><Heart size={14} className="text-terracotta" /> <span className="font-body text-muted-foreground">{stats.loved}</span></span>
          <span className="flex items-center gap-1.5 text-sm"><ThumbsUp size={14} className="text-primary" /> <span className="font-body text-muted-foreground">{stats.liked}</span></span>
          <span className="flex items-center gap-1.5 text-sm"><Bookmark size={14} className="text-blue-primary" /> <span className="font-body text-muted-foreground">{stats.bookmarked}</span></span>
          <span className="flex items-center gap-1.5 text-sm"><XCircle size={14} className="text-grey-meta" /> <span className="font-body text-muted-foreground">{stats.skipped}</span></span>
        </div>
        {interactionCount >= 3 && (
          <Button size="sm" variant="outline" onClick={runAnalysis} disabled={analyzing}>
            {analyzing ? <><Loader2 size={14} className="mr-2 animate-spin" /> Analyzing...</> : <><Brain size={14} className="mr-2" /> Analyze My Choices</>}
          </Button>
        )}
      </div>

      {/* Domain Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filterDomain === null ? "default" : "outline"} size="sm" onClick={() => { setFilterDomain(null); setCurrentIndex(0); }}>
          All
        </Button>
        {domains.map(d => (
          <Button key={d} variant={filterDomain === d ? "default" : "outline"} size="sm" onClick={() => { setFilterDomain(d); setCurrentIndex(0); }}>
            {d}
          </Button>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-body text-muted-foreground">
          <span>Story {currentIndex + 1}{hasMore ? "+" : ` of ${filtered.length}`}</span>
          <span>{interactionCount} stories explored</span>
        </div>
        <Progress value={hasMore ? Math.min(95, ((currentIndex + 1) / Math.max(filtered.length, 1)) * 100) : ((currentIndex + 1) / Math.max(filtered.length, 1)) * 100} className="h-1.5" />
      </div>

      {/* Story Card */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div key={current.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.3 }}>
            <Card className={`overflow-hidden transition-all ${
              interactions[current.id] === "love" ? "border-terracotta/50 ring-2 ring-terracotta/20" :
              interactions[current.id] === "like" ? "border-primary/50 ring-2 ring-primary/20" :
              interactions[current.id] === "bookmark" ? "border-blue-primary/50 ring-2 ring-blue-primary/20" :
              interactions[current.id] === "not_for_me" ? "opacity-70" : ""
            }`}>
              {/* Story Header */}
              <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    <User size={24} className="text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-xl text-foreground leading-snug">{current.title}</h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="font-body text-sm text-muted-foreground">{current.narrator_name}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-body text-sm text-muted-foreground">{current.narrator_role}</span>
                      {current.narrator_experience_years && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <span className="font-body text-sm text-muted-foreground">{current.narrator_experience_years}y exp</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{current.domain}</Badge>
                      {current.difficulty_level && <Badge variant="outline">{current.difficulty_level}</Badge>}
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="pt-5 space-y-5">
                {/* Main Story */}
                <div className="relative">
                  <Quote size={20} className="absolute -top-1 -left-1 text-primary/20" />
                  <p className="font-body text-sm text-foreground leading-relaxed pl-6 whitespace-pre-line">
                    {current.story_content}
                  </p>
                </div>

                {/* Day in Life */}
                {current.day_in_life && (
                  <div className="p-4 rounded-xl bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={15} className="text-primary" />
                      <span className="font-display text-sm text-foreground">a day in my life</span>
                    </div>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{current.day_in_life}</p>
                  </div>
                )}

                {/* Expandable Details */}
                <button onClick={() => setExpanded(!expanded)} className="w-full text-center font-body text-sm text-primary hover:underline py-1">
                  {expanded ? "show less ↑" : "the real tea — pros, cons, skills & more ↓"}
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                      {/* Pros & Cons */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                          <h4 className="font-display text-sm mb-2 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-success" /> the good stuff</h4>
                          <ul className="space-y-1">
                            {current.pros.map((p, i) => (
                              <li key={i} className="font-body text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-success mt-0.5">+</span> {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-3 rounded-lg bg-warmth/5 border border-warmth/20">
                          <h4 className="font-display text-sm mb-2 flex items-center gap-1.5"><AlertTriangle size={14} className="text-warmth" /> keep in mind</h4>
                          <ul className="space-y-1">
                            {current.cons.map((c, i) => (
                              <li key={i} className="font-body text-xs text-muted-foreground flex items-start gap-1.5">
                                <span className="text-warmth mt-0.5">–</span> {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Skills */}
                      {current.skills_highlighted.length > 0 && (
                        <div>
                          <h4 className="font-display text-sm mb-2 flex items-center gap-2"><Zap size={14} className="text-primary" /> skills that matter here</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.skills_highlighted.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Advice */}
                      {current.advice && (
                        <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb size={15} className="text-accent-foreground" />
                            <span className="font-display text-sm text-foreground">their advice to you</span>
                          </div>
                          <p className="font-body text-sm text-muted-foreground italic">"{current.advice}"</p>
                        </div>
                      )}

                      {/* Tags */}
                      {current.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {current.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>)}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Interaction Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
                  {([
                    { type: "like" as InteractionType, icon: ThumbsUp, label: "Like", activeClass: "bg-primary hover:bg-primary/90 border-primary text-primary-foreground" },
                    { type: "love" as InteractionType, icon: Heart, label: "Love", activeClass: "bg-terracotta hover:bg-terracotta/90 border-terracotta text-primary-foreground" },
                    { type: "bookmark" as InteractionType, icon: Bookmark, label: "Save", activeClass: "bg-[hsl(var(--blue-primary))] hover:bg-[hsl(var(--blue-primary))]/90 border-[hsl(var(--blue-primary))] text-primary-foreground" },
                    { type: "not_for_me" as InteractionType, icon: XCircle, label: "Not me", activeClass: "bg-muted-foreground hover:bg-muted-foreground/90 text-primary-foreground" },
                  ]).map(btn => {
                    const active = interactions[current.id] === btn.type;
                    return (
                      <Button
                        key={btn.type}
                        variant={active ? "default" : "outline"}
                        className={`flex flex-col items-center gap-1 h-auto py-3 transition-all ${active ? btn.activeClass : ""}`}
                        onClick={() => handleInteraction(current.id, btn.type)}
                      >
                        <btn.icon size={18} className={active ? "fill-current" : ""} />
                        <span className="text-xs">{btn.label}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-1">
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setExpanded(false); startTimeRef.current = Date.now(); }} disabled={currentIndex === 0}>
                    <ChevronLeft size={16} className="mr-1" /> Previous
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.min(filtered.length - 1, currentIndex + 1)); setExpanded(false); startTimeRef.current = Date.now(); }} disabled={currentIndex >= filtered.length - 1}>
                    Next <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Trigger */}
      {interactionCount >= 3 && !showAnalysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="pt-6 text-center">
              <Sparkles className="mx-auto text-primary mb-3" size={32} />
              <h3 className="font-display text-lg mb-2">ready to see what your choices say about you?</h3>
              <p className="font-body text-sm text-muted-foreground mb-4">you've explored {interactionCount} stories — enough for our AI to spot patterns in what excites you</p>
              <Button onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? <><Loader2 size={14} className="mr-2 animate-spin" /> analyzing your vibes...</> : <><Brain size={14} className="mr-2" /> Show Me My Analysis</>}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Behavioral Analysis Results */}
      <AnimatePresence>
        {showAnalysis && analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Brain className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">your behavioral blueprint 🧬</h3>
                    <p className="font-body text-xs text-muted-foreground">confidence: {Math.round(analysis.confidence_score * 100)}%</p>
                  </div>
                </div>

                {analysis.ai_summary && (
                  <p className="font-body text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{analysis.ai_summary}</p>
                )}

                {/* Domains */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-display text-sm mb-2 text-success">you're drawn to</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.domains_attracted.map(d => <Badge key={d} className="bg-success/10 text-success border-success/30 text-xs">{d}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-display text-sm mb-2 text-warmth">not your thing</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.domains_rejected.map(d => <Badge key={d} className="bg-warmth/10 text-warmth border-warmth/30 text-xs">{d}</Badge>)}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {analysis.skills_resonated.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-2">skills you vibe with</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skills_resonated.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Personality Signals */}
                {Object.keys(analysis.personality_signals).length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-2">personality signals</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(analysis.personality_signals).map(([key, val]) => (
                        <div key={key} className="p-2.5 rounded-lg bg-muted/30 border border-border">
                          <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{key.replace(/_/g, " ")}</p>
                          <p className="font-display text-sm text-foreground capitalize">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career Inclinations */}
                {analysis.career_inclinations?.top_3_paths?.length > 0 && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h4 className="font-display text-sm mb-3 flex items-center gap-2"><Star size={14} className="text-primary" /> top career paths for you</h4>
                    {analysis.career_inclinations.top_3_paths.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1.5">
                        <span className="font-display text-sm text-primary">{i + 1}.</span>
                        <span className="font-body text-sm text-foreground">{p}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Blind Spots */}
                {analysis.career_inclinations?.blind_spots?.length > 0 && (
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <h4 className="font-display text-xs mb-1.5 text-accent-foreground">💡 you might also enjoy (but haven't explored yet)</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.career_inclinations.blind_spots.map(b => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}
                    </div>
                  </div>
                )}

                <Button className="w-full" onClick={() => setShowAnalysis(false)}>
                  Keep Exploring Stories <ArrowRight size={14} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate More */}
      {generating && (
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" /> generating more stories in the background...
          </div>
        </div>
      )}

      {!generating && stories.length > 0 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={generateStories}>
            <RefreshCw size={14} className="mr-2" /> Generate More Stories
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryModeCards;
