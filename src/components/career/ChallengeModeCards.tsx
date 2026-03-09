import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Heart, ThumbsUp, Bookmark, XCircle, ChevronLeft, ChevronRight,
  Clock, Sparkles, Brain, Wrench, Zap, DollarSign, Target,
  Loader2, RefreshCw, ArrowRight, BarChart3, Shield, Star,
  TrendingUp
} from "lucide-react";

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
  const [challenges, setChallenges] = useState<ChallengeCard[]>([]);
  const [interactions, setInteractions] = useState<Record<string, InteractionType>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ChallengeAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [filterDomain, setFilterDomain] = useState<string | null>(null);
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
      const { data, error } = await supabase.functions.invoke("challenge-cards-ai", {
        body: { type: "analyze_challenge_behavior", context: { user_id: user!.id } },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.message || data.error); return; }
      setAnalysis(data);
      setShowAnalysis(true);
      toast.success("Challenge analysis complete! 🎯");
    } catch { toast.error("Keep exploring more challenges first!"); }
    finally { setAnalyzing(false); }
  };

  const domains = [...new Set(challenges.map(c => c.domain))].sort();
  const filtered = filterDomain ? challenges.filter(c => c.domain === filterDomain) : challenges;
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
      {/* Stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-sm"><Heart size={14} className="text-terracotta" /> <span className="font-body text-muted-foreground">{stats.loved}</span></span>
          <span className="flex items-center gap-1.5 text-sm"><ThumbsUp size={14} className="text-primary" /> <span className="font-body text-muted-foreground">{stats.liked}</span></span>
          <span className="flex items-center gap-1.5 text-sm"><Bookmark size={14} className="text-blue-primary" /> <span className="font-body text-muted-foreground">{stats.bookmarked}</span></span>
          <span className="flex items-center gap-1.5 text-sm"><XCircle size={14} className="text-grey-meta" /> <span className="font-body text-muted-foreground">{stats.skipped}</span></span>
        </div>
        {interactionCount >= 3 && (
          <Button size="sm" variant="outline" onClick={runAnalysis} disabled={analyzing}>
            {analyzing ? <><Loader2 size={14} className="mr-2 animate-spin" /> Analyzing...</> : <><BarChart3 size={14} className="mr-2" /> Analyze My Preferences</>}
          </Button>
        )}
      </div>

      {/* Domain Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filterDomain === null ? "default" : "outline"} size="sm" onClick={() => { setFilterDomain(null); setCurrentIndex(0); }}>All ({challenges.length})</Button>
        {domains.map(d => (
          <Button key={d} variant={filterDomain === d ? "default" : "outline"} size="sm" onClick={() => { setFilterDomain(d); setCurrentIndex(0); }}>{d}</Button>
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-body text-muted-foreground">
          <span>Challenge {currentIndex + 1} of {filtered.length}</span>
          <span>{interactionCount} challenges rated</span>
        </div>
        <Progress value={((currentIndex + 1) / filtered.length) * 100} className="h-1.5" />
      </div>

      {/* Challenge Card */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div key={current.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.3 }}>
            <Card className={`overflow-hidden transition-all ${
              interactions[current.id] === "love" ? "border-terracotta/50 ring-2 ring-terracotta/20" :
              interactions[current.id] === "like" ? "border-primary/50 ring-2 ring-primary/20" :
              interactions[current.id] === "bookmark" ? "border-blue-primary/50 ring-2 ring-blue-primary/20" :
              interactions[current.id] === "not_for_me" ? "opacity-70" : ""
            }`}>
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent px-6 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl text-foreground leading-snug">{current.challenge_name}</h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary">{current.domain}</Badge>
                      {(() => {
                        const cfg = difficultyConfig[current.difficulty_level] || difficultyConfig.beginner;
                        return (
                          <Badge variant="outline" className={`${cfg.color}`}>
                            <cfg.icon size={12} className="mr-1" /> {current.difficulty_level}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={14} />
                      <span className="font-body text-sm">{current.estimated_time}</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="pt-5 space-y-5">
                {/* Task Description */}
                <div className="p-4 rounded-xl bg-secondary border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={15} className="text-primary" />
                    <span className="font-display text-sm text-foreground">the actual task</span>
                  </div>
                  <p className="font-body text-sm text-foreground leading-relaxed">{current.task_description}</p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Tools */}
                  {current.tools_used.length > 0 && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench size={14} className="text-primary" />
                        <span className="font-body text-xs text-muted-foreground">Tools You'll Use</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {current.tools_used.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {current.skills_needed.length > 0 && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={14} className="text-accent-foreground" />
                        <span className="font-body text-xs text-muted-foreground">Skills Needed</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {current.skills_needed.map(s => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Compensation */}
                {current.compensation && (
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 flex items-center gap-3">
                    <DollarSign size={18} className="text-accent-foreground shrink-0" />
                    <div>
                      <span className="font-body text-xs text-muted-foreground">what you'd earn</span>
                      <p className="font-display text-sm text-foreground">{current.compensation}</p>
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
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border">
                  {([
                    { type: "like" as InteractionType, icon: ThumbsUp, label: "Like", activeClass: "bg-primary hover:bg-primary/90 border-primary text-primary-foreground" },
                    { type: "love" as InteractionType, icon: Heart, label: "Love", activeClass: "bg-terracotta hover:bg-terracotta/90 border-terracotta text-primary-foreground" },
                    { type: "bookmark" as InteractionType, icon: Bookmark, label: "Save", activeClass: "bg-[hsl(var(--blue-primary))] hover:bg-[hsl(var(--blue-primary))]/90 border-[hsl(var(--blue-primary))] text-primary-foreground" },
                    { type: "not_for_me" as InteractionType, icon: XCircle, label: "Not me", activeClass: "bg-muted-foreground hover:bg-muted-foreground/90 text-primary-foreground" },
                  ]).map(btn => {
                    const active = interactions[current.id] === btn.type;
                    return (
                      <Button key={btn.type} variant={active ? "default" : "outline"}
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
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); startTimeRef.current = Date.now(); }} disabled={currentIndex === 0}>
                    <ChevronLeft size={16} className="mr-1" /> Previous
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.min(filtered.length - 1, currentIndex + 1)); startTimeRef.current = Date.now(); }} disabled={currentIndex >= filtered.length - 1}>
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
              <h3 className="font-display text-lg mb-2">ready to see what kind of work you actually enjoy?</h3>
              <p className="font-body text-sm text-muted-foreground mb-4">{interactionCount} challenges rated — AI can now spot your work style patterns</p>
              <Button onClick={runAnalysis} disabled={analyzing}>
                {analyzing ? <><Loader2 size={14} className="mr-2 animate-spin" /> analyzing...</> : <><BarChart3 size={14} className="mr-2" /> Show My Work Profile</>}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Analysis Results */}
      <AnimatePresence>
        {showAnalysis && analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">your work DNA 🧬</h3>
                    <p className="font-body text-xs text-muted-foreground">based on {interactionCount} challenge reactions</p>
                  </div>
                </div>

                {analysis.career_task_profile && (
                  <p className="font-body text-sm text-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">{analysis.career_task_profile}</p>
                )}

                {/* Work Style */}
                {analysis.work_style_profile && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">complexity</p>
                      <p className="font-display text-sm text-foreground capitalize">{analysis.work_style_profile.preferred_complexity}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">duration</p>
                      <p className="font-display text-sm text-foreground capitalize">{analysis.work_style_profile.preferred_duration}</p>
                    </div>
                  </div>
                )}

                {/* Domain Fit */}
                {analysis.domain_fit?.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-3">domain fit scores</h4>
                    <div className="space-y-2">
                      {analysis.domain_fit.sort((a, b) => b.fit_score - a.fit_score).slice(0, 5).map(d => (
                        <div key={d.domain} className="flex items-center gap-3">
                          <span className="font-body text-sm text-foreground w-24 shrink-0">{d.domain}</span>
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${d.fit_score}%` }} />
                          </div>
                          <span className="font-display text-xs text-muted-foreground w-8">{d.fit_score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills & Tools */}
                {analysis.work_style_profile?.skill_patterns?.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-2">skills you vibe with</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.work_style_profile.skill_patterns.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                    </div>
                  </div>
                )}

                {analysis.work_style_profile?.tool_affinity?.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-2">tools you gravitate toward</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.work_style_profile.tool_affinity.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Roadmap Signals */}
                {analysis.roadmap_signals?.ready_for?.length > 0 && (
                  <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                    <h4 className="font-display text-sm mb-2 flex items-center gap-2"><TrendingUp size={14} className="text-success" /> you're ready for</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.roadmap_signals.ready_for.map(r => <Badge key={r} className="bg-success/10 text-success border-success/30 text-xs">{r}</Badge>)}
                    </div>
                  </div>
                )}

                {analysis.suggested_next_challenges?.length > 0 && (
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <h4 className="font-display text-xs mb-1.5 text-accent-foreground">💡 try these challenge types next</h4>
                    <ul className="space-y-1">
                      {analysis.suggested_next_challenges.map((c, i) => (
                        <li key={i} className="font-body text-xs text-muted-foreground">→ {c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="w-full" onClick={() => setShowAnalysis(false)}>
                  Keep Exploring Challenges <ArrowRight size={14} className="ml-2" />
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
            <Loader2 size={14} className="animate-spin" /> generating more challenges...
          </div>
        </div>
      )}
      {!generating && challenges.length > 0 && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={generateChallenges}>
            <RefreshCw size={14} className="mr-2" /> Generate More Challenges
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChallengeModeCards;
