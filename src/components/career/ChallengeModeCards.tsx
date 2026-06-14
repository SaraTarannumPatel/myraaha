import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import MultiSelect from "@/components/ui/multi-select";
import BlueprintCard, { type Blueprint } from "@/components/career/BlueprintCard";
import { buildBlueprintFromInteractions } from "@/lib/buildBlueprint";
import { generateBlueprintRoadmap } from "@/lib/blueprintRoadmap";
import { toast } from "sonner";
import {
  Heart, ThumbsUp, Bookmark, XCircle, ChevronLeft, ChevronRight,
  Clock, Sparkles, Brain, Wrench, Zap, DollarSign, Target,
  Loader2, RefreshCw, ArrowRight, BarChart3, Shield, Star,
  TrendingUp
} from "lucide-react";
import { useCuratedCompassFilter } from "@/hooks/useCuratedCompassFilter";

type InteractionType = "like" | "love" | "bookmark" | "not_for_me";

interface ChallengeCard {
  id: string;
  career_path_id: string | null;
  challenge_name: string;
  task_description: string;
  difficulty_level: string;
  estimated_time: string;
  tools_used: string[];
  skills_needed: string[];
  compensation: string | null;
  domain: string;
  tags: string[];
}

interface ChallengeAnalysis {
  work_style_profile: {
    preferred_complexity: string;
    preferred_duration: string;
    tool_affinity: string[];
    skill_patterns: string[];
    avoidance_patterns: string[];
  };
  domain_fit: { domain: string; fit_score: number; reason: string }[];
  career_task_profile: string;
  suggested_next_challenges: string[];
  roadmap_signals: {
    ready_for: string[];
    needs_exploration: string[];
    strength_areas: string[];
  };
}

const difficultyConfig: Record<string, { color: string; icon: typeof Shield; bg: string }> = {
  beginner: { color: "text-success", icon: Shield, bg: "bg-success/10 border-success/20" },
  intermediate: { color: "text-accent-foreground", icon: Zap, bg: "bg-accent/10 border-accent/20" },
  advanced: { color: "text-terracotta", icon: Star, bg: "bg-terracotta/10 border-terracotta/20" },
};

const ChallengeModeCards = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<ChallengeCard[]>([]);
  const [interactions, setInteractions] = useState<Record<string, InteractionType>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ChallengeAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [filterDomains, setFilterDomains] = useState<string[]>([]);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [challengesRes, intRes] = await Promise.all([
      supabase.from("domain_challenge_cards").select("*").eq("is_active", true).order("created_at"),
      supabase.from("challenge_card_interactions").select("*").eq("user_id", user!.id),
    ]);
    const fetched = (challengesRes.data as unknown as ChallengeCard[]) || [];
    setChallenges(fetched);
    const map: Record<string, InteractionType> = {};
    (intRes.data || []).forEach((i: any) => { map[i.challenge_id] = i.interaction_type; });
    setInteractions(map);
    if (fetched.length === 0) generateChallenges();
    setLoading(false);
  };

  const generateChallenges = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("challenge-cards-ai", {
        body: { type: "generate_challenges", context: {} },
      });
      if (error) throw error;
      if (data?.generated?.length > 0) {
        toast.success(`Generated challenges for ${data.generated.length} paths!`);
        await fetchData();
      }
      if (data?.remaining > 0) setTimeout(() => generateChallenges(), 2500);
    } catch (e: any) {
      if (e?.message?.includes("429")) toast.error("AI is busy, challenges will generate shortly");
      else console.error("Challenge generation error:", e);
    } finally { setGenerating(false); }
  };

  const handleInteraction = async (challengeId: string, type: InteractionType) => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const existing = interactions[challengeId];
    if (existing === type) {
      await supabase.from("challenge_card_interactions").delete().eq("user_id", user!.id).eq("challenge_id", challengeId);
      setInteractions(prev => { const n = { ...prev }; delete n[challengeId]; return n; });
      toast.success("Removed");
      return;
    }
    await supabase.from("challenge_card_interactions").upsert({
      user_id: user!.id,
      challenge_id: challengeId,
      interaction_type: type,
      time_spent_seconds: timeSpent,
    }, { onConflict: "user_id,challenge_id" });
    setInteractions(prev => ({ ...prev, [challengeId]: type }));
    const labels: Record<InteractionType, string> = {
      like: "Interesting challenge! 👍", love: "You'd love this work! ❤️", bookmark: "Saved for later! 🔖", not_for_me: "Not your vibe ✓"
    };
    toast.success(labels[type]);
    setTimeout(() => {
      if (currentIndex < filtered.length - 1) {
        setCurrentIndex(prev => prev + 1);
        startTimeRef.current = Date.now();
      }
    }, 600);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      // Always compute a client-side blueprint so the user sees output immediately
      const bp = buildBlueprintFromInteractions(
        challenges.map((c) => ({
          id: c.id,
          domain: c.domain,
          skills_needed: c.skills_needed,
          tools_used: c.tools_used,
          difficulty_level: c.difficulty_level,
          challenge_name: c.challenge_name,
        })),
        interactions,
        "challenge",
      );
      setBlueprint(bp);
      setShowBlueprint(true);

      // Best-effort: enrich with AI analysis (non-blocking)
      try {
        const { data, error } = await supabase.functions.invoke("challenge-cards-ai", {
          body: { type: "analyze_challenge_behavior", context: { user_id: user!.id } },
        });
        if (!error && data && !data.error) {
          setAnalysis(data);
          setShowAnalysis(true);
        }
      } catch { /* AI optional */ }

      toast.success("Challenge analysis complete! 🎯");
    } finally { setAnalyzing(false); }
  };

  const onGenerateRoadmap = async () => {
    if (!user || !blueprint) return;
    setGeneratingRoadmap(true);
    try {
      await generateBlueprintRoadmap(
        user.id,
        {
          shortTermGoals: blueprint.top_paths[0] || blueprint.domains_attracted[0] || "Build the kind of work I'd actually enjoy",
          longTermGoals: blueprint.ai_summary,
          interests: [...blueprint.domains_attracted, ...blueprint.blind_spots].slice(0, 12),
          skills: blueprint.skills_resonated,
          industry: blueprint.domains_attracted[0] || "",
          careerStage: "exploring",
          areasOfFocus: blueprint.top_paths.slice(0, 8),
          sourceContext: "challenge_mode_blueprint",
        },
        `Personalized Roadmap — ${blueprint.top_paths[0] || "Your Work Style"}`,
        navigate,
      );
    } catch (e) {
      console.error(e);
      toast.error("Could not generate roadmap.");
    } finally { setGeneratingRoadmap(false); }
  };

  const { scoreEntity, hasPersonalization } = useCuratedCompassFilter();
  const domains = [...new Set(challenges.map(c => c.domain))].sort();
  const baseList = filterDomains.length > 0 ? challenges.filter(c => filterDomains.includes(c.domain)) : challenges;
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

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  if (challenges.length === 0 && generating) {
    return (
      <Card><CardContent className="pt-6 text-center py-16">
        <Loader2 className="mx-auto animate-spin text-primary mb-4" size={48} />
        <h3 className="font-display text-xl mb-2">Cooking Up Real-World Challenges...</h3>
        <p className="font-body text-muted-foreground">AI is generating actual tasks from different career paths. you'll see what work really looks like ⚡</p>
      </CardContent></Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card><CardContent className="pt-6 text-center py-12">
        <Target className="mx-auto text-muted-foreground mb-4" size={48} />
        <h3 className="font-display text-xl mb-2">No Challenges Yet</h3>
        <p className="font-body text-muted-foreground mb-4">Challenges will be generated from available career paths.</p>
        <Button onClick={generateChallenges} disabled={generating}>
          {generating ? <><Loader2 size={14} className="mr-2 animate-spin" /> Generating...</> : "Generate Challenges"}
        </Button>
      </CardContent></Card>
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
        {interactionCount >= 3 && !showBlueprint && (
          <Button size="sm" variant="outline" onClick={runAnalysis} disabled={analyzing} className="h-8 text-xs rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary">
            {analyzing ? <><Loader2 size={12} className="mr-1.5 animate-spin" /> Analyzing...</> : <><BarChart3 size={12} className="mr-1.5" /> Analyze Vibes</>}
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
            totalCount={challenges.length}
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-body text-muted-foreground">
            <span>Challenge {currentIndex + 1} of {filtered.length}</span>
            <span>{interactionCount} rated</span>
          </div>
          <Progress value={((currentIndex + 1) / filtered.length) * 100} className="h-1" />
        </div>
      </div>

      {/* Challenge Card */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div key={current.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }}>
            <Card className={`overflow-hidden transition-all duration-300 rounded-2xl border shadow-md hover:shadow-lg ${
              interactions[current.id] === "love" ? "border-terracotta/40 ring-1 ring-terracotta/10" :
              interactions[current.id] === "like" ? "border-primary/40 ring-1 ring-primary/10" :
              interactions[current.id] === "bookmark" ? "border-blue-500/40 ring-1 ring-blue-500/10" :
              interactions[current.id] === "not_for_me" ? "opacity-75" : ""
            }`}>
              
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-transparent px-6 py-5 border-b border-border/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="font-display text-base font-bold text-foreground leading-snug">{current.challenge_name}</h2>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">{current.domain}</Badge>
                      {(() => {
                        const cfg = difficultyConfig[current.difficulty_level] || difficultyConfig.beginner;
                        return (
                          <Badge variant="outline" className={`px-2 py-0.5 text-[10px] ${cfg.color} ${cfg.bg}`}>
                            <cfg.icon size={10} className="mr-1" /> {current.difficulty_level}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 border border-border/40 text-muted-foreground">
                      <Clock size={12} />
                      <span className="font-body text-xs font-semibold">{current.estimated_time}</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-3.5 sm:p-6 space-y-4 sm:space-y-5">
                {/* Task Description */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={14} className="text-primary" />
                    <span className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">The Actual Task</span>
                  </div>
                  <p className="font-body text-sm text-foreground leading-relaxed">{current.task_description}</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tools */}
                  {current.tools_used.length > 0 && (
                    <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Wrench size={13} className="text-primary" />
                        <span className="font-body text-xs font-semibold text-muted-foreground">Tools You'll Use</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {current.tools_used.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {current.skills_needed.length > 0 && (
                    <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Zap size={13} className="text-accent-foreground" />
                        <span className="font-body text-xs font-semibold text-muted-foreground">Skills Gained</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {current.skills_needed.map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Compensation */}
                {current.compensation && (
                  <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/15 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20">
                      <DollarSign size={16} className="text-accent-foreground shrink-0" />
                    </div>
                    <div>
                      <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Compensation Range</span>
                      <p className="font-display text-xs font-bold text-foreground">{current.compensation}</p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {current.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {current.tags.map(t => <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>)}
                  </div>
                )}

                {/* Interaction Buttons */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 pt-4 border-t border-border/50">
                  {([
                    { type: "like" as InteractionType, icon: ThumbsUp, label: "Like", activeClass: "bg-primary hover:bg-primary/90 border-primary text-primary-foreground font-semibold" },
                    { type: "love" as InteractionType, icon: Heart, label: "Love", activeClass: "bg-terracotta hover:bg-terracotta/90 border-terracotta text-primary-foreground font-semibold" },
                    { type: "bookmark" as InteractionType, icon: Bookmark, label: "Save", activeClass: "bg-blue-500 hover:bg-blue-600 border-blue-500 text-white font-semibold" },
                    { type: "not_for_me" as InteractionType, icon: XCircle, label: "Not Me", activeClass: "bg-muted-foreground hover:bg-muted-foreground/90 text-primary-foreground font-semibold" },
                  ]).map(btn => {
                    const active = interactions[current.id] === btn.type;
                    return (
                      <Button key={btn.type} variant={active ? "default" : "outline"}
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
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); startTimeRef.current = Date.now(); }} disabled={currentIndex === 0} className="text-xs rounded-full h-[36px] px-4">
                    <ChevronLeft size={14} className="mr-1.5" /> Previous
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.min(filtered.length - 1, currentIndex + 1)); startTimeRef.current = Date.now(); }} disabled={currentIndex >= filtered.length - 1} className="text-xs rounded-full h-[36px] px-4">
                    Next <ChevronRight size={14} className="ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Trigger Card */}
      {interactionCount >= 3 && !showBlueprint && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent rounded-2xl shadow-sm overflow-hidden p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
              <Sparkles className="text-primary" size={22} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-base text-foreground">See your career task profile</h3>
              <p className="font-body text-xs text-muted-foreground max-w-md mx-auto">You've rated {interactionCount} tasks. Let's synthesize your work preferences and tools affinity blueprint.</p>
            </div>
            <Button onClick={runAnalysis} disabled={analyzing} className="text-xs rounded-full px-6 h-[40px] font-semibold">
              {analyzing ? <><Loader2 size={12} className="mr-1.5 animate-spin" /> Analyzing...</> : <><BarChart3 size={12} className="mr-1.5" /> Show My Work Profile</>}
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Analysis Results */}
      <AnimatePresence>
        {showAnalysis && analysis && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="border-primary/30 bg-card rounded-2xl shadow-md overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <BarChart3 className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">Your Work DNA 🧬</h3>
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">based on {interactionCount} challenge reactions</p>
                  </div>
                </div>

                {analysis.career_task_profile && (
                  <p className="font-body text-xs text-muted-foreground leading-relaxed bg-muted/40 p-4 rounded-xl border border-border/50">{analysis.career_task_profile}</p>
                )}

                {/* Work Style Complexity & Duration */}
                {analysis.work_style_profile && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-0.5">
                      <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Complexity</p>
                      <p className="font-display text-xs font-bold text-foreground capitalize">{analysis.work_style_profile.preferred_complexity}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-0.5">
                      <p className="font-body text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">Duration</p>
                      <p className="font-display text-xs font-bold text-foreground capitalize">{analysis.work_style_profile.preferred_duration}</p>
                    </div>
                  </div>
                )}

                {/* Domain Fit Progress Bars */}
                {analysis.domain_fit?.length > 0 && (
                  <div className="space-y-3.5">
                    <h4 className="font-display text-xs font-bold text-foreground uppercase tracking-wider">Domain Fit Scores</h4>
                    <div className="space-y-2.5 bg-muted/20 p-4 rounded-xl border border-border/40">
                      {analysis.domain_fit.sort((a, b) => b.fit_score - a.fit_score).slice(0, 5).map(d => (
                        <div key={d.domain} className="flex items-center gap-3">
                          <span className="font-body text-xs text-foreground font-semibold w-24 shrink-0 truncate">{d.domain}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${d.fit_score}%` }} />
                          </div>
                          <span className="font-display text-xs font-bold text-muted-foreground w-8 text-right">{d.fit_score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills & Tools */}
                {analysis.work_style_profile?.skill_patterns?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-display text-xs font-bold text-foreground uppercase tracking-wider">Skills You Vibe With</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.work_style_profile.skill_patterns.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                )}

                {analysis.work_style_profile?.tool_affinity?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-display text-xs font-bold text-foreground uppercase tracking-wider">Tools You Gravitate Toward</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.work_style_profile.tool_affinity.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Roadmap Signals */}
                {analysis.roadmap_signals?.ready_for?.length > 0 && (
                  <div className="p-4 rounded-xl bg-success/5 border border-success/15 space-y-2">
                    <h4 className="font-display text-xs font-bold text-success uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-success" /> You're Ready For
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.roadmap_signals.ready_for.map(r => <Badge key={r} className="bg-success/10 text-success border-success/30 hover:bg-success/20 text-xs">{r}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {analysis.suggested_next_challenges?.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/15 space-y-1.5">
                    <h4 className="font-display text-xs font-bold text-accent-foreground">💡 Try These Challenge Types Next</h4>
                    <ul className="space-y-1 font-body text-xs text-muted-foreground">
                      {analysis.suggested_next_challenges.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span>•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button variant="outline" className="w-full text-xs rounded-full h-[40px] font-semibold" onClick={() => setShowAnalysis(false)}>
                  Keep Exploring Challenges
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Behavioral Blueprint */}
      {showBlueprint && blueprint && (
        <BlueprintCard
          blueprint={blueprint}
          variant="challenge"
          onGenerateRoadmap={onGenerateRoadmap}
          generatingRoadmap={generatingRoadmap}
          onClose={() => setShowBlueprint(false)}
        />
      )}

      {/* Generate More indicator */}
      {generating && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/40 border border-border text-xs text-muted-foreground">
            <Loader2 size={12} className="animate-spin text-primary" /> Cooking up new challenges...
          </div>
        </div>
      )}
      {!generating && challenges.length > 0 && (
        <div className="text-center pt-2">
          <Button variant="ghost" size="sm" onClick={generateChallenges} className="text-xs rounded-xl text-muted-foreground hover:text-foreground">
            <RefreshCw size={12} className="mr-1.5" /> Load new career challenges
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChallengeModeCards;
