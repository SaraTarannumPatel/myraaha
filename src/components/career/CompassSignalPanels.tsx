import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Brain, Sparkles, Trophy, Target, Play, Check, ArrowRight, ArrowLeft,
  MessageSquare, Palette, BookmarkPlus, ChevronRight, Activity, Route,
  Lightbulb, Heart, Compass, AlertTriangle, RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import InsightsView from "@/components/curiositycompass/InsightsView";
import { useUserSignals } from "@/hooks/useUserSignals";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------------- Shared loading + error primitives ---------------- */
const PanelSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy="true" aria-live="polite">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-white rounded-3xl border border-border/60 shadow-sm p-6 space-y-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
    ))}
  </div>
);

const PanelError = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <Card className="rounded-3xl border-destructive/30 bg-destructive/5 shadow-sm">
    <CardContent className="pt-6 pb-6 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
        <AlertTriangle className="text-destructive w-6 h-6" />
      </div>
      <p className="font-body text-xs text-foreground max-w-sm mx-auto">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="rounded-full h-9 text-xs">
          <RefreshCw size={12} className="mr-1.5" /> Try again
        </Button>
      )}
    </CardContent>
  </Card>
);

/* ---------------- Insights & Behavior ---------------- */
export const CompassInsightsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { recordSignal, recordMultipleSignals } = useUserSignals();
  const [conclusion, setConclusion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [interests, setInterests] = useState<any[]>([]);
  const [behaviorInsights, setBehaviorInsights] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchConclusion = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase
        .from("assessment_conclusions" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("test_type", "combined")
        .order("generated_at", { ascending: false })
        .maybeSingle();
      if (qErr) throw qErr;
      setConclusion(data);
    } catch (e: any) {
      setError(e?.message || "Could not load your insights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchConclusion();
    supabase
      .from("interests")
      .select("*")
      .eq("user_id", user.id)
      .then(({ data }) => setInterests(data || []));
  }, [user?.id]);

  const regenerateConclusion = async () => {
    if (!user) return;
    setRegenerating(true);
    try {
      await supabase.functions.invoke("combined-conclusion-synthesizer", { body: { user_id: user.id } });
      await fetchConclusion();
      toast.success("Insights refreshed");
    } catch {
      toast.error("Could not refresh insights");
    } finally {
      setRegenerating(false);
    }
  };

  const getBehaviorInsights = async () => {
    if (!user) return;
    // Enforce ≥10 signals gate
    const { count } = await supabase
      .from("user_signals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("signal_source", "curiosity_compass");
    if ((count || 0) < 10) {
      toast.error(`Need at least 10 Compass interactions (you have ${count || 0}). Return to Curiosity Compass and complete more.`);
      return;
    }
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("curiosity-compass-ai", {
        body: { type: "behavior_analysis", context: { interests } },
      });
      setBehaviorInsights(data);
    } catch {
      toast.error("Analysis failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <InsightsView
        conclusion={conclusion}
        loading={loading}
        regenerate={regenerateConclusion}
        regenerating={regenerating}
      />

      {/* Interest Blueprint */}
      <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary w-5 h-5" />
            <span className="font-body text-[10px] text-primary uppercase tracking-wider font-extrabold">Active Vectors</span>
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">Your Interest Blueprint</h3>
          <p className="font-body text-xs text-muted-foreground">Live maps synthesized from assessments and curiosity choices.</p>
        </div>
        {interests.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border/80 rounded-2xl">
            <p className="text-xs text-muted-foreground font-body">Complete assessments to begin building your interest cloud.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(
              interests.reduce<Record<string, any[]>>((acc, it) => {
                const key = it.category || it.source || "general";
                (acc[key] ||= []).push(it);
                return acc;
              }, {})
            ).map(([cat, items]) => (
              <div key={cat} className="space-y-2">
                <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((it: any) => {
                    const strength = Math.round((it.strength || 0.5) * 100);
                    return (
                      <div key={it.id} className="px-3.5 py-2 rounded-2xl bg-white border border-border/80 shadow-sm flex items-center gap-2 text-xs font-body font-semibold">
                        <span className={`w-1.5 h-1.5 rounded-full ${strength >= 80 ? "bg-emerald-500" : strength >= 50 ? "bg-primary" : "bg-muted-foreground"}`} />
                        <span>{it.name}</span>
                        <span className="opacity-60 text-[10px] font-bold text-primary">{strength}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Behavioral Signals */}
      <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h3 className="font-display text-base font-bold flex items-center gap-2">
            <Activity className="text-primary" size={18} /> Behavioral Signals Detected
          </h3>
          <p className="font-body text-xs text-muted-foreground">Mindset calibration mapping response speed, skipping patterns, and active choices.</p>
        </div>
        {behaviorInsights ? (
          <div className="space-y-6 pt-1">
            {behaviorInsights.ideal_work_environment && (
              <div className="p-4 rounded-2xl border border-border bg-muted/10 space-y-1.5">
                <p className="font-body text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Optimized Work Environment</p>
                <p className="font-body text-xs sm:text-sm leading-relaxed">{behaviorInsights.ideal_work_environment}</p>
              </div>
            )}
            {behaviorInsights.behavioral_patterns?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {behaviorInsights.behavioral_patterns.map((bp: any, i: number) => (
                  <div key={i} className="flex items-start gap-3.5 p-4 rounded-2xl bg-white border border-border/80 shadow-sm">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-primary" />
                    <div className="space-y-1">
                      <p className="font-body text-xs sm:text-sm font-bold">{bp.pattern}</p>
                      <p className="font-body text-[11px] text-muted-foreground leading-relaxed">{bp.interpretation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={async () => {
                if (behaviorInsights.areas_of_resonance) {
                  await recordMultipleSignals("curiosity_compass", behaviorInsights.areas_of_resonance, "domain_interest", 0.8);
                }
                if (behaviorInsights.career_archetype) {
                  await recordSignal("curiosity_compass", behaviorInsights.career_archetype, "preference", 0.9);
                }
                toast.success("Transferring insights to AI Roadmaps...");
                navigate("/dashboard/roadmap?source=behavior_analysis");
              }}
              size="sm"
              className="w-full text-xs h-11 rounded-full font-body font-bold bg-primary text-white hover:bg-[#4300a3]"
            >
              <Route size={14} className="mr-1.5" /> Construct AI Career Roadmap
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Activity className="text-primary w-6 h-6" />
            </div>
            <p className="font-body text-xs text-muted-foreground max-w-xs mx-auto">
              Requires ≥10 Compass interactions. Analyze decision speed, choice depth, and active interests.
            </p>
            <Button
              size="sm"
              onClick={getBehaviorInsights}
              disabled={aiLoading}
              className="text-xs rounded-full px-6 h-10 bg-primary text-white hover:bg-[#4300a3]"
            >
              {aiLoading ? "Analyzing..." : "Analyze My Behavior"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- Domains ---------------- */
export const CompassDomainsPanel = () => {
  const { user } = useAuth();
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("domain_recommendations")
      .select("*")
      .eq("user_id", user.id)
      .order("match_score", { ascending: false })
      .then(({ data }) => {
        setDomains(data || []);
        setLoading(false);
      });
  }, [user?.id]);

  const saveDomain = async (id: string) => {
    await supabase.from("domain_recommendations").update({ status: "saved" }).eq("id", id);
    setDomains((d) => d.map((x) => (x.id === id ? { ...x, status: "saved" } : x)));
    toast.success("Domain saved");
  };

  if (loading) return <p className="text-xs text-muted-foreground text-center py-8">Loading domains…</p>;

  if (domains.length === 0) {
    return (
      <Card className="rounded-3xl border-border bg-white shadow-xl">
        <CardContent className="pt-8 text-center py-12 space-y-4">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto opacity-60">
            <Brain className="text-muted-foreground w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-base font-bold">No Recommendations Yet</h3>
            <p className="font-body text-xs text-muted-foreground max-w-sm mx-auto">
              Complete Curiosity Compass assessments and interact with career cards to trigger domain mapping.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {domains.map((domain, i) => (
        <motion.div key={domain.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <div className="bg-white rounded-3xl border-2 border-border/80 shadow-md p-6 hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 text-white text-lg shadow-sm">🎯</div>
              <div className="flex-1 min-w-0 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-base leading-tight">{domain.domain_name}</h3>
                    <Badge className="text-[10px] rounded-full px-2.5 py-0.5 bg-primary/10 text-primary border-none font-bold">
                      {Math.round(domain.match_score * 100)}% Match
                    </Badge>
                  </div>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-3">{domain.description}</p>
                </div>
                {domain.reasons?.length > 0 && (
                  <div className="space-y-2 bg-muted/40 p-4 rounded-2xl border border-border/40">
                    <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Why it matches you:</p>
                    <div className="space-y-1.5">
                      {domain.reasons.slice(0, 3).map((reason: string, j: number) => (
                        <p key={j} className="font-body text-[11px] text-muted-foreground flex items-start gap-2 leading-relaxed">
                          <Check size={12} className="text-success shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{reason}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4 border-t border-border/40 mt-auto">
              {domain.status !== "saved" && (
                <Button variant="outline" size="sm" onClick={() => saveDomain(domain.id)} className="h-9 text-xs rounded-full px-4">
                  <BookmarkPlus size={14} className="mr-1.5 text-primary" /> Save Domain
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-9 text-xs rounded-full px-4 text-primary hover:bg-primary/5 bg-primary/5">
                Explore Paths <ChevronRight size={14} className="ml-0.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/* ---------------- Quests ---------------- */
export const CompassQuestsPanel = () => {
  const { user } = useAuth();
  const { recordMultipleSignals } = useUserSignals();
  const [quests, setQuests] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [activeQuest, setActiveQuest] = useState<any | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("curiosity_quests").select("*"),
      supabase.from("curiosity_quest_progress").select("*").eq("user_id", user.id),
    ]).then(([q, p]) => {
      setQuests(q.data || []);
      setProgress(p.data || []);
    });
  }, [user?.id]);

  const getStatus = (id: string) => progress.find((p) => p.quest_id === id)?.status || "not_started";

  const startQuest = (q: any) => {
    setActiveQuest(q);
    setPromptIndex(0);
    setResponses({});
  };

  const completeQuest = async () => {
    if (!activeQuest || !user) return;
    for (const [, val] of Object.entries(responses)) {
      if (typeof val === "string") continue;
      if (Array.isArray(val)) await recordMultipleSignals("quests", val, "selection", 0.7, { quest: activeQuest.title });
    }
    await supabase.from("curiosity_quest_progress").upsert({
      user_id: user.id,
      quest_id: activeQuest.id,
      status: "completed",
      responses,
      points_earned: activeQuest.points || 10,
    }, { onConflict: "user_id,quest_id" });
    toast.success(`Quest completed! +${activeQuest.points || 10} pts 🎉`);
    setActiveQuest(null);
    const { data } = await supabase.from("curiosity_quest_progress").select("*").eq("user_id", user.id);
    setProgress(data || []);
  };

  return (
    <AnimatePresence mode="wait">
      {activeQuest ? (
        <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Card className="rounded-3xl border-border shadow-xl bg-white">
            <CardHeader className="p-6 border-b border-border/40 bg-muted/10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-display font-bold">{activeQuest.title}</CardTitle>
                  <CardDescription className="text-xs">{activeQuest.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="text-xs px-3 py-1 font-semibold text-primary bg-primary/10 rounded-full">{activeQuest.points} pts</Badge>
              </div>
              <Progress value={(promptIndex / (activeQuest.prompts?.length || 1)) * 100} className="mt-4 h-1.5" />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {activeQuest.prompts && promptIndex < activeQuest.prompts.length ? (
                <>
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
                    <p className="font-display text-sm sm:text-base font-semibold leading-snug">
                      {activeQuest.prompts[promptIndex].question}
                    </p>
                    {activeQuest.prompts[promptIndex].type === "open" && (
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={responses[promptIndex] || ""}
                        onChange={(e) => setResponses({ ...responses, [promptIndex]: e.target.value })}
                        rows={4}
                        className="text-sm rounded-xl bg-white"
                      />
                    )}
                    {activeQuest.prompts[promptIndex].type === "choice" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeQuest.prompts[promptIndex].options?.map((opt: string) => {
                          const selected = responses[promptIndex] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => setResponses({ ...responses, [promptIndex]: opt })}
                              className={`p-4 rounded-xl border-2 text-left text-xs sm:text-sm transition-all ${
                                selected ? "border-primary bg-primary/[0.03] font-semibold text-primary" : "border-border bg-white hover:border-primary/40"
                              }`}
                            >
                              {selected && <Check size={12} className="inline mr-1.5" />} {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {activeQuest.prompts[promptIndex].type === "multi" && (
                      <div className="flex flex-wrap gap-2.5">
                        {activeQuest.prompts[promptIndex].options?.map((opt: string) => {
                          const current = responses[promptIndex] || [];
                          const selected = current.includes(opt);
                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                setResponses({
                                  ...responses,
                                  [promptIndex]: selected ? current.filter((o: string) => o !== opt) : [...current, opt],
                                });
                              }}
                              className={`px-4 py-2 rounded-full border-2 text-xs font-medium transition-all ${
                                selected ? "border-primary bg-primary text-white font-semibold" : "border-border bg-white hover:border-primary/40"
                              }`}
                            >
                              {selected && <Check size={10} className="inline mr-1" />} {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Button variant="outline" size="sm" onClick={() => setPromptIndex(Math.max(0, promptIndex - 1))} disabled={promptIndex === 0} className="text-xs rounded-full px-5 h-9">
                      <ArrowLeft size={14} className="mr-1.5" /> Back
                    </Button>
                    <Button
                      onClick={() => {
                        if (promptIndex < activeQuest.prompts.length - 1) setPromptIndex(promptIndex + 1);
                        else completeQuest();
                      }}
                      disabled={!responses[promptIndex]}
                      size="sm"
                      className="text-xs rounded-full px-6 h-9 bg-primary text-white font-semibold"
                    >
                      {promptIndex < activeQuest.prompts.length - 1 ? "Next" : "Complete Quest"} <ArrowRight size={14} className="ml-1.5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                    <Check className="text-success w-8 h-8" />
                  </div>
                  <h3 className="font-display text-lg font-bold">Quest Complete!</h3>
                  <Button size="sm" onClick={() => setActiveQuest(null)} className="rounded-full px-6 text-xs font-semibold">
                    Back to Quests
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quests.length === 0 ? (
            <Card className="rounded-3xl border-border bg-white shadow-xl col-span-full">
              <CardContent className="pt-8 text-center py-12 space-y-2">
                <Trophy className="text-muted-foreground w-6 h-6 mx-auto opacity-60" />
                <h3 className="font-display text-base font-bold">No Quests Available Yet</h3>
                <p className="font-body text-xs text-muted-foreground max-w-sm mx-auto">Quests unlock as you share signals across the app.</p>
              </CardContent>
            </Card>
          ) : (
            quests.map((quest, i) => {
              const status = getStatus(quest.id);
              const isCompleted = status === "completed";
              return (
                <motion.div key={quest.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <div className={`bg-white rounded-3xl border-2 shadow-md p-6 hover:shadow-xl transition-all h-full flex flex-col justify-between ${
                    isCompleted ? "border-success/20" : "border-border/80 hover:border-primary/40"
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        quest.quest_type === "story" ? "bg-blue/10" : quest.quest_type === "challenge" ? "bg-warmth/10" : "bg-indigo/10"
                      }`}>
                        {quest.quest_type === "story" ? <MessageSquare className="text-blue" size={22} /> : quest.quest_type === "challenge" ? <Target className="text-warmth" size={22} /> : <Palette className="text-indigo" size={22} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-sm sm:text-base truncate">{quest.title}</h3>
                        <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-2">{quest.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-4">
                      <Badge variant={isCompleted ? "default" : "secondary"} className={`text-[10px] uppercase font-bold rounded-full px-2.5 py-0.5 ${
                        isCompleted ? "bg-success text-white" : "text-primary bg-primary/10"
                      }`}>
                        {isCompleted ? "Completed" : `+${quest.points} pts`}
                      </Badge>
                      {!isCompleted && (
                        <Button onClick={() => startQuest(quest)} size="sm" className="text-xs h-8 px-4 rounded-full bg-primary text-white font-semibold">
                          <Play size={10} className="mr-1" /> {status === "in_progress" ? "Resume" : "Start"}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
