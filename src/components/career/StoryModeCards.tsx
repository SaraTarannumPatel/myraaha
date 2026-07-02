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
import { useCuratedCompassFilter } from "@/hooks/useCuratedCompassFilter";

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
    if (filterDomains.length > 0) query = query.in("domain", filterDomains);
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
  }, [loadingMore, hasMore, page, filterDomains]);

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
      if (filterDomains.length > 0) query = query.in("domain", filterDomains);
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
  }, [filterDomains]);

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

  const generatePersonalizedRoadmap = async () => {
    if (!user || !analysis) return;
    setGeneratingRoadmap(true);
    try {
      const topPaths = analysis.career_inclinations?.top_3_paths || [];
      const emerging = analysis.career_inclinations?.emerging_interests || [];
      const blindSpots = analysis.career_inclinations?.blind_spots || [];
      const ctx = {
        shortTermGoals: topPaths[0] || analysis.domains_attracted?.[0] || "Explore my strongest career inclinations",
        longTermGoals: analysis.ai_summary || `Build a career around ${topPaths.slice(0, 2).join(" & ") || "my top interests"}`,
        interests: [...(analysis.domains_attracted || []), ...emerging].filter(Boolean).slice(0, 12),
        skills: analysis.skills_resonated || [],
        industry: topPaths[0] || analysis.domains_attracted?.[0] || "",
        careerStage: "exploring",
        areasOfFocus: [...topPaths, ...blindSpots].filter(Boolean).slice(0, 8),
        sourceContext: "story_mode_blueprint",
      };
      const { generateBlueprintRoadmap } = await import("@/lib/blueprintRoadmap");
      await generateBlueprintRoadmap(
        user.id,
        ctx,
        `Personalized Roadmap — ${topPaths[0] || "Your Path"}`,
        navigate,
      );
    } catch (e: any) {
      console.error(e);
      toast.error("Could not generate roadmap. Please try again.");
    } finally {
      setGeneratingRoadmap(false);
    }
  };


  const { scoreEntity, hasPersonalization } = useCuratedCompassFilter();
  const domains = allDomains;
  const baseList = stories; // server already filtered when filterDomains set
  const filtered = hasPersonalization
    ? [...baseList].sort((a, b) => scoreEntity(b as any) - scoreEntity(a as any))
    : baseList;
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
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart size={14} className="text-terracotta fill-terracotta" />
            <span className="font-body font-semibold text-foreground">{stats.loved}</span> loved
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ThumbsUp size={14} className="text-primary fill-primary/10" />
            <span className="font-body font-semibold text-foreground">{stats.liked}</span> liked
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Bookmark size={14} className="text-blue-500 fill-blue-500/10" />
            <span className="font-body font-semibold text-foreground">{stats.bookmarked}</span> saved
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <XCircle size={14} className="text-muted-foreground" />
            <span className="font-body font-semibold text-foreground">{stats.skipped}</span> skipped
          </span>
        </div>
        {interactionCount >= 3 && !showAnalysis && (
          <Button size="sm" variant="outline" onClick={runAnalysis} disabled={analyzing} className="h-8 text-xs rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary">
            {analyzing ? <><Loader2 size={12} className="mr-1.5 animate-spin" /> Analyzing...</> : <><Brain size={12} className="mr-1.5" /> Analyze Vibes</>}
          </Button>
        )}
      </div>

      {/* Domain Filter & Progress Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-card/60 border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-muted-foreground shrink-0">Filter by domain:</span>
          <MultiSelect
            options={domains}
            selected={filterDomains}
            onChange={(next) => { setFilterDomains(next); setCurrentIndex(0); }}
            label="domains"
            placeholder="All domains"
            totalCount={domains.length}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-body text-muted-foreground">
            <span>Story {currentIndex + 1}{hasMore ? "+" : ` of ${filtered.length}`}</span>
            <span>{interactionCount} explored</span>
          </div>
          <Progress value={hasMore ? Math.min(95, ((currentIndex + 1) / Math.max(filtered.length, 1)) * 100) : ((currentIndex + 1) / Math.max(filtered.length, 1)) * 100} className="h-1" />
        </div>
      </div>

      {/* Story Card */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div key={current.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
            <Card className={`overflow-hidden transition-all duration-300 rounded-2xl border shadow-md hover:shadow-lg ${
              interactions[current.id] === "love" ? "border-terracotta/40 ring-1 ring-terracotta/10" :
              interactions[current.id] === "like" ? "border-primary/40 ring-1 ring-primary/10" :
              interactions[current.id] === "bookmark" ? "border-blue-500/40 ring-1 ring-blue-500/10" :
              interactions[current.id] === "not_for_me" ? "opacity-75" : ""
            }`}>
              
              {/* Story Header */}
              <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-transparent px-6 py-5 border-b border-border/40">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0 border border-primary/10">
                    <span className="font-display font-bold text-sm text-primary">
                      {current.narrator_name?.charAt(0) || "P"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h2 className="font-display text-base font-bold text-foreground leading-snug">{current.title}</h2>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap font-body">
                      <span>{current.narrator_name}</span>
                      <span>•</span>
                      <span>{current.narrator_role}</span>
                      {current.narrator_experience_years && (
                        <>
                          <span>•</span>
                          <span>{current.narrator_experience_years}y exp</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">{current.domain}</Badge>
                      {current.difficulty_level && <Badge variant="outline" className="px-2 py-0.5 text-[10px]">{current.difficulty_level}</Badge>}
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-3.5 sm:p-6 flex flex-col min-h-0">
                <div className="career-navigator-card-body space-y-4 sm:space-y-5 pr-1 pb-2">
                  {/* Main Story */}
                  <div className="relative">
                    <Quote size={20} className="absolute -top-1 -left-1 text-primary/10" />
                    <p className="font-body text-sm text-foreground leading-relaxed pl-7 whitespace-pre-line">
                      {current.story_content}
                    </p>
                  </div>

                  {/* Day in Life */}
                  {current.day_in_life && (
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Clock size={14} className="text-primary" />
                        <span className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">A day in my life</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed">{current.day_in_life}</p>
                    </div>
                  )}

                  {/* Expandable Details CTA */}
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full text-center font-body text-xs text-primary font-medium hover:underline py-1.5 border-t border-border/20"
                  >
                    {expanded ? "Collapse detailed overview ↑" : "Reveal real career stats (pros, cons, skills) ↓"}
                  </button>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden pt-2">
                        {/* Pros & Cons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-xl bg-success/5 border border-success/15">
                            <h4 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5 text-success">
                              <CheckCircle2 size={13} className="text-success" /> The Good Stuff
                            </h4>
                            <ul className="space-y-1">
                              {current.pros.map((p, i) => (
                                <li key={i} className="font-body text-[11px] text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                                  <span className="text-success font-bold mt-0.5">•</span> {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3.5 rounded-xl bg-warmth/5 border border-warmth/15">
                            <h4 className="font-display text-xs font-semibold mb-2 flex items-center gap-1.5 text-warmth">
                              <AlertTriangle size={13} className="text-warmth" /> Challenges
                            </h4>
                            <ul className="space-y-1">
                              {current.cons.map((c, i) => (
                                <li key={i} className="font-body text-[11px] text-muted-foreground flex items-start gap-1.5 leading-relaxed">
                                  <span className="text-warmth font-bold mt-0.5">•</span> {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Skills */}
                        {current.skills_highlighted.length > 0 && (
                          <div className="space-y-1.5">
                            <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground">
                              <Zap size={13} className="text-primary" /> Key Skills Needed
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {current.skills_highlighted.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                            </div>
                          </div>
                        )}

                        {/* Advice */}
                        {current.advice && (
                          <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/15">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Lightbulb size={14} className="text-accent-foreground" />
                              <span className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">Professional Advice</span>
                            </div>
                            <p className="font-body text-xs text-muted-foreground italic leading-relaxed">"{current.advice}"</p>
                          </div>
                        )}

                        {/* Tags */}
                        {current.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {current.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>)}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-4 border-t border-border/50 space-y-4">
                  {/* Interaction Buttons */}
                  <div className="grid grid-cols-4 gap-1 sm:gap-2 font-body">
                    {([
                      { type: "like" as InteractionType, icon: ThumbsUp, label: "Like", activeClass: "bg-primary hover:bg-primary/90 border-primary text-primary-foreground font-semibold" },
                      { type: "love" as InteractionType, icon: Heart, label: "Love", activeClass: "bg-terracotta hover:bg-terracotta/90 border-terracotta text-primary-foreground font-semibold" },
                      { type: "bookmark" as InteractionType, icon: Bookmark, label: "Save", activeClass: "bg-blue-500 hover:bg-blue-600 border-blue-500 text-white font-semibold" },
                      { type: "not_for_me" as InteractionType, icon: XCircle, label: "Not Me", activeClass: "bg-muted-foreground hover:bg-muted-foreground/90 text-primary-foreground font-semibold" },
                    ]).map(btn => {
                      const active = interactions[current.id] === btn.type;
                      return (
                        <Button
                          key={btn.type}
                          variant={active ? "default" : "outline"}
                          className={`flex flex-col items-center gap-1.5 h-auto py-2 sm:py-2.5 px-0.5 sm:px-2 rounded-xl transition-all ${active ? btn.activeClass : "border-border/80 hover:bg-muted/40 hover:border-primary/30"}`}
                          onClick={() => handleInteraction(current.id, btn.type)}
                        >
                          <btn.icon size={16} className={active ? "fill-current" : ""} />
                          <span className="text-[10px] font-body uppercase tracking-wider">{btn.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex justify-between pt-1 border-t border-border/10">
                    <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setExpanded(false); startTimeRef.current = Date.now(); }} disabled={currentIndex === 0} className="text-xs rounded-full h-[36px] px-4">
                      <ChevronLeft size={14} className="mr-1.5" /> Previous
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.min(filtered.length - 1, currentIndex + 1)); setExpanded(false); startTimeRef.current = Date.now(); }} disabled={currentIndex >= filtered.length - 1} className="text-xs rounded-full h-[36px] px-4">
                      Next <ChevronRight size={14} className="ml-1.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Trigger Card */}
      {interactionCount >= 3 && !showAnalysis && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-2xl shadow-sm overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
              <Sparkles className="text-primary" size={22} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-base text-foreground">See your behavioral analysis</h3>
              <p className="font-body text-xs text-muted-foreground max-w-md mx-auto">You've explored {interactionCount} stories. Our AI can now extract patterns and calibrate your career archetype.</p>
            </div>
            <Button onClick={runAnalysis} disabled={analyzing} className="text-xs rounded-full px-6 h-[40px] font-semibold">
              {analyzing ? <><Loader2 size={12} className="mr-1.5 animate-spin" /> Analyzing vibes...</> : <><Brain size={12} className="mr-1.5" /> Analyze My Vibe</>}
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Behavioral Analysis Results */}
      <AnimatePresence>
        {showAnalysis && analysis && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="border-primary/30 bg-card rounded-2xl shadow-md overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Brain className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">Your Behavioral Blueprint 🧬</h3>
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">confidence: {Math.round(analysis.confidence_score * 100)}%</p>
                  </div>
                </div>

                {analysis.ai_summary && (
                  <p className="font-body text-xs text-muted-foreground leading-relaxed bg-muted/40 p-4 rounded-xl border border-border/50">{analysis.ai_summary}</p>
                )}

                {/* Domains attracted / rejected */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-success/5 border border-success/15 space-y-2">
                    <h4 className="font-display text-xs font-bold text-success uppercase tracking-wider">Domains Attracted</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.domains_attracted.map(d => <Badge key={d} className="bg-success/10 text-success border-success/30 hover:bg-success/20 text-xs">{d}</Badge>)}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-warmth/5 border border-warmth/15 space-y-2">
                    <h4 className="font-display text-xs font-bold text-warmth uppercase tracking-wider">Domains Rejected</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.domains_rejected.map(d => <Badge key={d} className="bg-warmth/10 text-warmth border-warmth/30 hover:bg-warmth/20 text-xs">{d}</Badge>)}
                    </div>
                  </div>
                </div>

                {/* Skills resonated */}
                {analysis.skills_resonated.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-display text-xs font-bold text-foreground uppercase tracking-wider">Skills Resonated</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skills_resonated.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Personality Signals */}
                {Object.keys(analysis.personality_signals).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-display text-xs font-bold text-foreground uppercase tracking-wider">Personality & Mindset Signals</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                      {Object.entries(analysis.personality_signals).map(([key, val]) => (
                        <div key={key} className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-0.5">
                          <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">{key.replace(/_/g, " ")}</p>
                          <p className="font-display text-xs font-bold text-foreground capitalize">{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career Inclinations */}
                {analysis.career_inclinations?.top_3_paths?.length > 0 && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-3">
                    <h4 className="font-display text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Star size={12} className="text-primary" /> Top Career Paths For You
                    </h4>
                    <div className="space-y-2">
                      {analysis.career_inclinations.top_3_paths.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center font-display text-xs font-bold text-primary shrink-0">{i + 1}</span>
                          <span className="font-body text-xs text-foreground font-semibold">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blind Spots */}
                {analysis.career_inclinations?.blind_spots?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/15 space-y-2">
                    <h4 className="font-display text-xs font-bold text-accent-foreground flex items-center gap-1.5">
                      💡 Suggested Exploration Paths (Unseen Blind Spots)
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.career_inclinations.blind_spots.map(b => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/40">
                  <Button
                    className="flex-1 text-xs rounded-full h-[40px] font-semibold"
                    onClick={generatePersonalizedRoadmap}
                    disabled={generatingRoadmap}
                  >
                    {generatingRoadmap ? (
                      <><Loader2 size={12} className="mr-1.5 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles size={12} className="mr-1.5" /> Generate Personalized AI Roadmap</>
                    )}
                  </Button>
                  <Button variant="outline" className="text-xs rounded-full h-[40px] font-semibold" onClick={() => setShowAnalysis(false)}>
                    Keep Exploring
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate More indicator */}
      {generating && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/40 border border-border text-xs text-muted-foreground">
            <Loader2 size={12} className="animate-spin text-primary" /> Generating more stories in background...
          </div>
        </div>
      )}

      {!generating && stories.length > 0 && (
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm" onClick={generateStories} className="text-xs rounded-full h-[36px] text-muted-foreground hover:text-foreground">
            <RefreshCw size={12} className="mr-1.5" /> Load new career stories
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoryModeCards;
