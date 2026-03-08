import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LifeBuoy, Send, BookOpen, Users, Heart, Zap, Loader2, Sparkles,
  Target, Brain, Shield, TrendingUp, CheckCircle2, Clock, AlertTriangle,
  Smile, Frown, Meh, Activity, MessageCircle, ArrowRight, RefreshCw
} from "lucide-react";

const supportCategories = [
  { icon: Zap, label: "Product & Validation", key: "product", description: "Help with MVP, testing assumptions, finding PMF" },
  { icon: Users, label: "Team & Co-founders", key: "team", description: "Building teams, resolving conflicts, finding partners" },
  { icon: BookOpen, label: "Learning & Skills", key: "learning", description: "What to learn next, filling knowledge gaps" },
  { icon: Heart, label: "Emotional Support", key: "emotional", description: "Dealing with stress, burnout, or self-doubt" },
  { icon: Target, label: "Strategy & Direction", key: "strategy", description: "Pivoting, market focus, growth decisions" },
  { icon: Shield, label: "Funding & Finance", key: "funding", description: "Raising capital, managing runway, pricing" },
];

const moodOptions = [
  { value: "great", icon: Smile, label: "Great", color: "text-green-500" },
  { value: "okay", icon: Meh, label: "Okay", color: "text-yellow-500" },
  { value: "struggling", icon: Frown, label: "Struggling", color: "text-destructive" },
];

const StartupSupport = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("ask");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [challenge, setChallenge] = useState("");
  const [mood, setMood] = useState("okay");
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Data
  const [requests, setRequests] = useState<any[]>([]);
  const [nudges, setNudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI results
  const [guidance, setGuidance] = useState<any>(null);
  const [actionPlan, setActionPlan] = useState<any>(null);
  const [crisisResult, setCrisisResult] = useState<any>(null);
  const [expertMatch, setExpertMatch] = useState<any>(null);
  const [wellnessCheck, setWellnessCheck] = useState<any>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [reqRes, nudgeRes] = await Promise.all([
      supabase.from("support_requests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("support_nudges").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    setRequests(reqRes.data || []);
    setNudges(nudgeRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime nudges
  useEffect(() => {
    const channel = supabase
      .channel("support-nudges-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_nudges" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const invokeAI = async (type: string, context: any, setter: (d: any) => void) => {
    setAiLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("startup-support-ai", { body: { type, context } });
      if (error) throw error;
      setter(data);
    } catch {
      toast.error("AI analysis failed. Please try again.");
    }
    setAiLoading(null);
  };

  const submitChallenge = async () => {
    if (!challenge.trim() || !selectedCategory) {
      toast.error("Please select a category and describe your challenge");
      return;
    }

    // Save to DB
    const { data: reqData, error } = await supabase.from("support_requests").insert({
      user_id: user!.id,
      category: selectedCategory,
      challenge: challenge.trim(),
      mood,
    }).select().single();

    if (error) { toast.error("Failed to submit"); return; }

    // Get AI guidance
    await invokeAI("guidance", {
      category: selectedCategory,
      challenge: challenge.trim(),
      mood,
      history: requests.slice(0, 5).map((r: any) => ({ category: r.category, challenge: r.challenge })),
    }, async (data) => {
      setGuidance(data);
      // Save guidance back to request
      if (reqData) {
        await supabase.from("support_requests").update({ ai_guidance: data }).eq("id", reqData.id);
      }
    });

    toast.success("Support request submitted!");
    fetchData();
  };

  const getActionPlan = async () => {
    const openRequests = requests.filter((r: any) => r.status === "open");
    await invokeAI("action_plan", {
      challenges: openRequests.map((r: any) => ({ category: r.category, challenge: r.challenge })),
      mood_pattern: requests.slice(0, 10).map((r: any) => r.mood),
    }, setActionPlan);
  };

  const getCrisisSupport = async () => {
    await invokeAI("crisis_support", {
      current_mood: mood,
      recent_challenges: requests.slice(0, 3).map((r: any) => r.challenge),
    }, setCrisisResult);
  };

  const getExpertMatch = async () => {
    await invokeAI("expert_match", {
      challenges: requests.filter((r: any) => r.status === "open").map((r: any) => ({ category: r.category, challenge: r.challenge })),
    }, setExpertMatch);
  };

  const getWellnessCheck = async () => {
    await invokeAI("wellness_check", {
      mood_history: requests.map((r: any) => ({ mood: r.mood, date: r.created_at, category: r.category })),
      total_requests: requests.length,
      open_requests: requests.filter((r: any) => r.status === "open").length,
    }, setWellnessCheck);
  };

  const generateNudges = async () => {
    await invokeAI("encouragement", {
      recent_activity: requests.slice(0, 5),
      mood,
    }, async (data) => {
      if (data?.nudges) {
        for (const nudge of data.nudges.slice(0, 3)) {
          await supabase.from("support_nudges").insert({
            user_id: user!.id,
            nudge_type: nudge.type,
            message: `${nudge.emoji} ${nudge.message}`,
          });
        }
        fetchData();
        toast.success("New encouragement nudges generated!");
      }
    });
  };

  const resolveRequest = async (id: string) => {
    await supabase.from("support_requests").update({ status: "resolved", resolved_at: new Date().toISOString() }).eq("id", id);
    fetchData();
    toast.success("Marked as resolved ✓");
  };

  const markNudgeRead = async (id: string) => {
    await supabase.from("support_nudges").update({ is_read: true }).eq("id", id);
    fetchData();
  };

  const openRequests = requests.filter((r: any) => r.status === "open");
  const resolvedRequests = requests.filter((r: any) => r.status === "resolved");

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <LifeBuoy size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Startup Support</h1>
            <p className="font-body text-sm text-muted-foreground">You're not alone — get expert advice, tools, and encouragement to navigate every challenge.</p>
          </div>
        </div>
      </motion.div>

      {/* Nudges banner */}
      {nudges.filter((n: any) => !n.is_read).length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/10 rounded-xl border border-accent/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-accent" />
            <span className="font-display text-sm text-foreground">Encouragement for You</span>
          </div>
          <div className="space-y-2">
            {nudges.filter((n: any) => !n.is_read).slice(0, 3).map((n: any) => (
              <div key={n.id} className="flex items-center justify-between">
                <p className="font-body text-sm text-muted-foreground">{n.message}</p>
                <Button size="sm" variant="ghost" onClick={() => markNudgeRead(n.id)} className="text-xs h-6 px-2">Dismiss</Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Open Challenges", value: openRequests.length, icon: AlertTriangle, accent: openRequests.length > 3 },
          { label: "Resolved", value: resolvedRequests.length, icon: CheckCircle2 },
          { label: "Nudges", value: nudges.length, icon: Sparkles },
          { label: "Current Mood", value: mood, icon: moodOptions.find((m) => m.value === mood)?.icon || Meh },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon className={`mx-auto mb-1 ${s.accent ? "text-destructive" : "text-muted-foreground"}`} size={20} />
            <div className="font-display text-xl text-foreground capitalize">{s.value}</div>
            <div className="font-body text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="ask">Ask for Help</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="action-plan">Action Plan</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="experts">Expert Match</TabsTrigger>
          <TabsTrigger value="crisis">Crisis Support</TabsTrigger>
        </TabsList>

        {/* ASK FOR HELP TAB */}
        <TabsContent value="ask" className="space-y-4 mt-4">
          {/* Mood check */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-display text-sm text-foreground mb-3">How are you feeling right now?</h3>
            <div className="flex gap-3">
              {moodOptions.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${mood === m.value ? "border-accent bg-accent/10" : "border-border hover:border-accent/30"}`}
                >
                  <m.icon size={18} className={mood === m.value ? m.color : "text-muted-foreground"} />
                  <span className="font-body text-sm">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category selection */}
          <div className="grid md:grid-cols-3 gap-3">
            {supportCategories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`text-left bg-card rounded-xl border p-4 transition-all ${selectedCategory === cat.key ? "border-accent bg-accent/5" : "border-border hover:border-accent/30"}`}
              >
                <cat.icon size={20} className={selectedCategory === cat.key ? "text-accent" : "text-muted-foreground"} />
                <h3 className="font-display text-sm text-foreground mt-2">{cat.label}</h3>
                <p className="font-body text-[11px] text-muted-foreground">{cat.description}</p>
              </button>
            ))}
          </div>

          {/* Challenge input */}
          {selectedCategory && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h2 className="font-display text-lg text-foreground">Describe your challenge</h2>
              <Textarea
                placeholder="What are you struggling with? Be as specific as you can..."
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                rows={4}
              />
              <Button onClick={submitChallenge} disabled={aiLoading === "guidance"} className="bg-primary text-primary-foreground">
                {aiLoading === "guidance" ? <Loader2 className="animate-spin mr-2" size={16} /> : <Send size={16} className="mr-2" />}
                Get Help
              </Button>
            </motion.div>
          )}

          {/* AI Guidance result */}
          {guidance && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-accent/10 rounded-xl border border-accent/30 p-5">
                <p className="font-body text-sm text-foreground italic">{guidance.acknowledgment}</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2"><Target size={18} /> Action Steps</h3>
                <div className="space-y-2">
                  {guidance.action_steps?.map((step: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle2 size={16} className="text-accent mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm text-foreground">{step.title}</span>
                          <Badge variant={step.priority === "immediate" ? "destructive" : "secondary"} className="text-[10px]">{step.priority}</Badge>
                        </div>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {guidance.frameworks?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display text-sm text-foreground mb-2 flex items-center gap-2"><Brain size={16} /> Frameworks</h3>
                  <div className="space-y-2">
                    {guidance.frameworks.map((f: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-muted/30">
                        <span className="font-display text-xs text-accent">{f.name}</span>
                        <p className="font-body text-xs text-muted-foreground">{f.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                <Sparkles size={16} className="text-accent mb-1" />
                <p className="font-body text-sm text-foreground">{guidance.encouragement}</p>
              </div>

              <Button variant="outline" onClick={() => { setGuidance(null); setSelectedCategory(null); setChallenge(""); }}>
                Ask Another Question
              </Button>
            </motion.div>
          )}
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <h2 className="font-display text-xl text-foreground">Support History</h2>
          {requests.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Clock className="mx-auto text-muted-foreground mb-3" size={36} />
              <p className="font-body text-muted-foreground">No support requests yet. Ask for help when you need it!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((r: any) => (
                <div key={r.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={r.status === "open" ? "destructive" : "secondary"}>{r.status}</Badge>
                      <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                      <span className="font-body text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.status === "open" && (
                      <Button size="sm" variant="ghost" onClick={() => resolveRequest(r.id)} className="text-xs h-7">
                        <CheckCircle2 size={14} className="mr-1" /> Resolve
                      </Button>
                    )}
                  </div>
                  <p className="font-body text-sm text-foreground">{r.challenge}</p>
                  {r.ai_guidance?.encouragement && (
                    <p className="font-body text-xs text-accent mt-2 italic">"{r.ai_guidance.encouragement}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ACTION PLAN TAB */}
        <TabsContent value="action-plan" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Target size={20} /> Guided Action Plan</h2>
            <Button variant="outline" disabled={aiLoading === "action_plan" || openRequests.length === 0} onClick={getActionPlan}>
              {aiLoading === "action_plan" ? <Loader2 className="animate-spin mr-2" size={16} /> : <RefreshCw size={16} className="mr-2" />}
              Generate Plan
            </Button>
          </div>

          {!actionPlan ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Target className="mx-auto text-muted-foreground mb-3" size={36} />
              <p className="font-body text-muted-foreground">Generate a personalized action plan based on your open challenges.</p>
              {openRequests.length === 0 && <p className="font-body text-xs text-muted-foreground mt-1">Submit a challenge first to get started.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-display text-lg text-foreground">{actionPlan.plan_title}</h3>
                <p className="font-body text-xs text-muted-foreground">Timeframe: {actionPlan.timeframe}</p>
              </div>

              {actionPlan.phases?.map((phase: any, pi: number) => (
                <div key={pi} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-display text-sm text-foreground">{phase.name}</h4>
                    <Badge variant="outline" className="text-[10px]">{phase.duration}</Badge>
                  </div>
                  <div className="space-y-2">
                    {phase.tasks?.map((t: any, ti: number) => (
                      <div key={ti} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                        <ArrowRight size={14} className="text-accent mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <span className="font-body text-sm text-foreground">{t.task}</span>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                            <Badge variant={t.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">{t.priority}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {actionPlan.success_metrics?.length > 0 && (
                <div className="bg-accent/10 rounded-xl p-4">
                  <h4 className="font-display text-sm text-foreground mb-2">Success Metrics</h4>
                  <ul className="space-y-1">{actionPlan.success_metrics.map((m: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground flex gap-2"><TrendingUp size={12} className="shrink-0 mt-0.5" />{m}</li>)}</ul>
                </div>
              )}

              {actionPlan.potential_blockers?.length > 0 && (
                <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
                  <h4 className="font-display text-sm text-foreground mb-2">Potential Blockers</h4>
                  <ul className="space-y-1">{actionPlan.potential_blockers.map((b: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground flex gap-2"><AlertTriangle size={12} className="shrink-0 mt-0.5" />{b}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* WELLNESS TAB */}
        <TabsContent value="wellness" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Activity size={20} /> Wellness Check</h2>
            <div className="flex gap-2">
              <Button variant="outline" disabled={aiLoading === "wellness_check"} onClick={getWellnessCheck}>
                {aiLoading === "wellness_check" ? <Loader2 className="animate-spin mr-2" size={16} /> : <Activity size={16} className="mr-2" />}
                Analyze Wellness
              </Button>
              <Button variant="outline" disabled={aiLoading === "encouragement"} onClick={generateNudges}>
                {aiLoading === "encouragement" ? <Loader2 className="animate-spin mr-2" size={16} /> : <Sparkles size={16} className="mr-2" />}
                Generate Nudges
              </Button>
            </div>
          </div>

          {!wellnessCheck ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Activity className="mx-auto text-muted-foreground mb-3" size={36} />
              <p className="font-body text-muted-foreground">Run a wellness check to understand your founder health.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <div className="font-display text-4xl text-foreground mb-1">{wellnessCheck.wellness_score}/100</div>
                <div className="font-body text-sm text-muted-foreground">Wellness Score</div>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div className={`rounded-full h-2 transition-all ${wellnessCheck.wellness_score > 70 ? "bg-green-500" : wellnessCheck.wellness_score > 40 ? "bg-yellow-500" : "bg-destructive"}`} style={{ width: `${wellnessCheck.wellness_score}%` }} />
                </div>
                <Badge variant="outline" className="mt-2 capitalize">{wellnessCheck.mood_trend} trend</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2 text-green-600">Strengths</h4>
                  <ul className="space-y-1">{wellnessCheck.strengths?.map((s: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground">✓ {s}</li>)}</ul>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2 text-destructive">Risk Areas</h4>
                  <ul className="space-y-1">{wellnessCheck.risk_areas?.map((r: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground">⚠ {r}</li>)}</ul>
                </div>
              </div>

              {wellnessCheck.recommendations?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2">Recommendations</h4>
                  <div className="space-y-2">
                    {wellnessCheck.recommendations.map((r: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-muted/30">
                        <span className="font-body text-xs text-accent">{r.area}</span>
                        <p className="font-body text-xs text-muted-foreground">{r.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wellnessCheck.daily_practice && (
                <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                  <h4 className="font-display text-sm text-foreground mb-1">Daily Practice</h4>
                  <p className="font-body text-sm text-muted-foreground">{wellnessCheck.daily_practice}</p>
                </div>
              )}
            </div>
          )}

          {/* Nudge history */}
          {nudges.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="font-display text-sm text-foreground mb-3">Recent Nudges</h4>
              <div className="space-y-2">
                {nudges.slice(0, 5).map((n: any) => (
                  <div key={n.id} className={`p-2 rounded-lg ${n.is_read ? "bg-muted/20" : "bg-accent/10"}`}>
                    <p className="font-body text-xs text-muted-foreground">{n.message}</p>
                    <span className="font-body text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* EXPERT MATCH TAB */}
        <TabsContent value="experts" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Users size={20} /> Expert & Peer Matching</h2>
            <Button variant="outline" disabled={aiLoading === "expert_match" || openRequests.length === 0} onClick={getExpertMatch}>
              {aiLoading === "expert_match" ? <Loader2 className="animate-spin mr-2" size={16} /> : <Users size={16} className="mr-2" />}
              Find Experts
            </Button>
          </div>

          {!expertMatch ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Users className="mx-auto text-muted-foreground mb-3" size={36} />
              <p className="font-body text-muted-foreground">Get matched with mentors and peer groups based on your challenges.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expertMatch.mentor_types?.map((m: any, i: number) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-display text-sm text-foreground mb-1">{m.expertise}</h3>
                  <p className="font-body text-xs text-muted-foreground mb-2">{m.why_helpful}</p>
                  <div className="bg-muted/30 rounded-lg p-2">
                    <span className="font-body text-[10px] text-accent">Questions to ask:</span>
                    <ul className="mt-1 space-y-0.5">
                      {m.what_to_ask?.map((q: string, qi: number) => (
                        <li key={qi} className="font-body text-[11px] text-muted-foreground flex gap-1"><MessageCircle size={10} className="shrink-0 mt-0.5" /> {q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {expertMatch.community_suggestions?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2">Recommended Communities</h4>
                  <div className="space-y-2">
                    {expertMatch.community_suggestions.map((c: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-muted/30 flex items-center gap-2">
                        <Users size={14} className="text-accent shrink-0" />
                        <div>
                          <span className="font-body text-xs text-foreground">{c.type}</span>
                          <p className="font-body text-[10px] text-muted-foreground">{c.focus}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* CRISIS SUPPORT TAB */}
        <TabsContent value="crisis" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Shield size={20} /> Crisis Support</h2>
            <Button variant="outline" disabled={aiLoading === "crisis_support"} onClick={getCrisisSupport}>
              {aiLoading === "crisis_support" ? <Loader2 className="animate-spin mr-2" size={16} /> : <Shield size={16} className="mr-2" />}
              Get Support Now
            </Button>
          </div>

          {!crisisResult ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Shield className="mx-auto text-muted-foreground mb-3" size={36} />
              <h3 className="font-display text-lg text-foreground mb-2">It's okay to need help</h3>
              <p className="font-body text-sm text-muted-foreground">If you're feeling overwhelmed, burned out, or stuck, get gentle support and practical tools to reset.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-accent/10 rounded-xl border border-accent/30 p-5">
                <Heart className="text-accent mb-2" size={20} />
                <p className="font-body text-sm text-foreground">{crisisResult.validation}</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="font-display text-sm text-foreground mb-2">Breathing Exercise</h3>
                <p className="font-body text-sm text-muted-foreground">{crisisResult.breathing_exercise}</p>
              </div>

              {crisisResult.reframe_prompts?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display text-sm text-foreground mb-2">Reframe Your Thinking</h3>
                  <div className="space-y-2">
                    {crisisResult.reframe_prompts.map((p: string, i: number) => (
                      <p key={i} className="font-body text-sm text-muted-foreground italic p-2 rounded-lg bg-muted/30">"{p}"</p>
                    ))}
                  </div>
                </div>
              )}

              {crisisResult.immediate_actions?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display text-sm text-foreground mb-2">Do This Now</h3>
                  <div className="space-y-2">
                    {crisisResult.immediate_actions.map((a: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-muted/30">
                        <span className="font-body text-sm text-foreground">{a.action}</span>
                        <p className="font-body text-[11px] text-muted-foreground">{a.why}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {crisisResult.affirmations?.length > 0 && (
                <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                  <h4 className="font-display text-sm text-foreground mb-2">Affirmations</h4>
                  <div className="space-y-1">
                    {crisisResult.affirmations.map((a: string, i: number) => (
                      <p key={i} className="font-body text-sm text-accent">💛 {a}</p>
                    ))}
                  </div>
                </div>
              )}

              {crisisResult.when_to_seek_help && (
                <div className="bg-muted/30 rounded-xl p-4">
                  <h4 className="font-display text-sm text-foreground mb-1">When to Seek Professional Help</h4>
                  <p className="font-body text-xs text-muted-foreground">{crisisResult.when_to_seek_help}</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StartupSupport;
