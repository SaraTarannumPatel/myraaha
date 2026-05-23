import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { streamChat } from "@/lib/streamChat";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Bot, Send, Target, TrendingUp, Sparkles, Loader2, MessageCircle,
  Brain, Heart, Smile, Meh, Frown, Activity, CheckCircle2, Clock,
  Lightbulb, RefreshCw, ArrowRight, BarChart3, Scale, Plus, Trash2
} from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const quickTopics = [
  "How do I validate my startup idea?",
  "Help me build a pitch",
  "Team building strategies",
  "Funding options for beginners",
  "Managing founder stress",
  "Finding product-market fit",
  "I need direction",
  "How to overcome self-doubt",
];

const moodEmojis: Record<string, { icon: typeof Smile; label: string; color: string }> = {
  great: { icon: Smile, label: "Great", color: "text-success" },
  okay: { icon: Meh, label: "Okay", color: "text-accent" },
  struggling: { icon: Frown, label: "Struggling", color: "text-destructive" },
};

const AIEntrepreneurshipCoach = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Data
  const [stats, setStats] = useState({ ideas: 0, challenges: 0, projects: 0, sessions: 0, checkins: 0 });
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Check-in form
  const [checkinMood, setCheckinMood] = useState("okay");
  const [checkinConfidence, setCheckinConfidence] = useState(5);
  const [checkinEnergy, setCheckinEnergy] = useState(5);
  const [checkinReflection, setCheckinReflection] = useState("");

  // AI results
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [dashboardInsights, setDashboardInsights] = useState<any>(null);
  const [checkinAnalysis, setCheckinAnalysis] = useState<any>(null);
  const [decisionResult, setDecisionResult] = useState<any>(null);
  const [coachingSummary, setCoachingSummary] = useState<any>(null);
  const [decisionInput, setDecisionInput] = useState("");

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [ideasRes, challengesRes, projectsRes, sessionsRes, checkinsRes] = await Promise.all([
      supabase.from("startup_ideas").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mindset_challenges").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "completed"),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("intent", "entrepreneurship"),
      supabase.from("coaching_sessions").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(10),
      supabase.from("coaching_checkins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setStats({
      ideas: ideasRes.count || 0,
      challenges: challengesRes.count || 0,
      projects: projectsRes.count || 0,
      sessions: sessionsRes.data?.length || 0,
      checkins: checkinsRes.data?.length || 0,
    });
    setSessions(sessionsRes.data || []);
    setCheckins(checkinsRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const invokeInsights = async (type: string, context: any, setter: (d: any) => void) => {
    setAiLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("coaching-insights", { body: { type, context } });
      if (error) throw error;
      setter(data);
    } catch { toast.error("AI analysis failed"); }
    setAiLoading(null);
  };

  // Session management
  const startNewSession = async () => {
    const { data, error } = await supabase.from("coaching_sessions").insert({
      user_id: user!.id,
      title: "New Coaching Session",
      messages: [],
    }).select().single();
    if (!error && data) {
      setCurrentSessionId(data.id);
      setMessages([]);
      fetchData();
    }
  };

  const loadSession = (session: any) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
  };

  const saveSession = async (msgs: Msg[]) => {
    if (!currentSessionId) return;
    const title = msgs.find((m) => m.role === "user")?.content.slice(0, 50) || "Coaching Session";
    await supabase.from("coaching_sessions").update({
      messages: msgs as any,
      title,
      updated_at: new Date().toISOString(),
    }).eq("id", currentSessionId);
  };

  const deleteSession = async (id: string) => {
    await supabase.from("coaching_sessions").delete().eq("id", id);
    if (currentSessionId === id) { setCurrentSessionId(null); setMessages([]); }
    fetchData();
  };

  // Streaming chat
  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    if (!currentSessionId) {
      const { data } = await supabase.from("coaching_sessions").insert({
        user_id: user!.id,
        title: msg.slice(0, 50),
        messages: [],
      }).select().single();
      if (data) setCurrentSessionId(data.id);
    }

    const userMsg: Msg = { role: "user", content: msg };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: newMsgs,
        context: {
          name: profile?.full_name,
          intent: profile?.active_intent,
          userType: profile?.user_type,
          industry: profile?.industry,
          careerStage: profile?.career_stage,
          areasOfFocus: profile?.areas_of_focus,
          goals: profile?.short_term_goals,
        },
        onDelta: upsertAssistant,
        onDone: () => {
          setIsLoading(false);
          // Save after done
          setMessages((finalMsgs) => {
            saveSession(finalMsgs);
            return finalMsgs;
          });
        },
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error("Failed to connect to AI coach");
      setIsLoading(false);
    }
  };

  // Check-in
  const submitCheckin = async () => {
    const { data, error } = await supabase.from("coaching_checkins").insert({
      user_id: user!.id,
      mood: checkinMood,
      confidence: checkinConfidence,
      energy: checkinEnergy,
      reflection: checkinReflection,
    }).select().single();

    if (error) { toast.error("Failed to save check-in"); return; }

    // Get AI analysis
    await invokeInsights("checkin_analysis", {
      mood: checkinMood,
      confidence: checkinConfidence,
      energy: checkinEnergy,
      reflection: checkinReflection,
      history: checkins.slice(0, 5).map((c: any) => ({ mood: c.mood, confidence: c.confidence, energy: c.energy })),
    }, async (analysis) => {
      setCheckinAnalysis(analysis);
      if (data) {
        await supabase.from("coaching_checkins").update({ ai_response: analysis }).eq("id", data.id);
      }
    });

    setCheckinReflection("");
    toast.success("Check-in saved!");
    fetchData();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <Bot size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">AI Entrepreneurship Coach</h1>
            <p className="font-body text-sm text-muted-foreground">Let's figure this out together — I'm here to guide you through every twist and turn.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: "Ideas", value: stats.ideas, icon: Lightbulb },
          { label: "Projects", value: stats.projects, icon: Target },
          { label: "Challenges", value: stats.challenges, icon: TrendingUp },
          { label: "Sessions", value: stats.sessions, icon: MessageCircle },
          { label: "Check-ins", value: stats.checkins, icon: Activity },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-3 text-center">
            <s.icon size={16} className="mx-auto text-muted-foreground mb-1" />
            <div className="font-display text-lg text-foreground">{s.value}</div>
            <div className="font-body text-[10px] text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="coach" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="coach">Coach Chat</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="checkin">Check-in</TabsTrigger>
          <TabsTrigger value="decisions">Decisions</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* COACH CHAT TAB */}
        <TabsContent value="coach" className="space-y-4 mt-4">
          {/* Quick topics */}
          <div className="flex flex-wrap gap-2">
            {quickTopics.map((t) => (
              <button key={t} onClick={() => sendMessage(t)} disabled={isLoading}
                className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-body text-xs hover:bg-accent/10 hover:text-accent transition-all disabled:opacity-50">
                {t}
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div className="bg-card rounded-xl border border-border">
            <div className="h-[28rem] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="mx-auto text-muted-foreground mb-3" size={40} />
                  <h3 className="font-display text-xl text-foreground mb-2">
                    Hey {profile?.full_name || "Founder"}! 👋
                  </h3>
                  <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
                    I'm your AI coach. Ask me about startup ideas, mindset, team building, funding, or anything on your entrepreneurial journey.
                  </p>
                  <Button onClick={startNewSession} variant="outline" className="mt-4"><Plus size={14} className="mr-1" /> Start New Session</Button>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-4 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground font-body"
                      : "bg-muted text-foreground"
                  }`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-xl p-4"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-border p-4 flex gap-2">
              <Textarea
                placeholder="Ask your coach anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                className="resize-none"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />
              <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} className="bg-primary text-primary-foreground">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* DASHBOARD TAB */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground flex items-center gap-2"><BarChart3 size={20} /> Coaching Dashboard</h2>
            <Button variant="outline" disabled={aiLoading === "dashboard_insights"} onClick={() => invokeInsights("dashboard_insights", {
              stats, recentCheckins: checkins.slice(0, 5), profile: { name: profile?.full_name, industry: profile?.industry, goals: profile?.short_term_goals },
            }, setDashboardInsights)}>
              {aiLoading === "dashboard_insights" ? <Loader2 className="animate-spin mr-2" size={16} /> : <Sparkles size={16} className="mr-2" />}
              Get Insights
            </Button>
          </div>

          {!dashboardInsights ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Brain className="mx-auto text-muted-foreground mb-3" size={36} />
              <p className="font-body text-muted-foreground">Generate personalized coaching insights based on your journey data.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-accent/10 rounded-xl border border-accent/30 p-5">
                <h3 className="font-display text-lg text-foreground mb-1">{dashboardInsights.headline}</h3>
                <p className="font-body text-sm text-muted-foreground italic mt-2">"{dashboardInsights.motivational_quote}"</p>
              </div>

              {dashboardInsights.coaching_prompts?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h4 className="font-display text-sm text-foreground mb-3">Coaching Prompts for You</h4>
                  <div className="space-y-2">
                    {dashboardInsights.coaching_prompts.map((p: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-accent/10 transition-colors" onClick={() => sendMessage(p.question)}>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                        </div>
                        <p className="font-body text-sm text-foreground">{p.question}</p>
                        <p className="font-body text-[10px] text-muted-foreground mt-1">{p.why}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2 text-green-600">Strengths Observed</h4>
                  <ul className="space-y-1">{dashboardInsights.strengths_observed?.map((s: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground">✓ {s}</li>)}</ul>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2 text-accent">Growth Areas</h4>
                  <ul className="space-y-1">{dashboardInsights.growth_areas?.map((g: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground">→ {g}</li>)}</ul>
                </div>
              </div>
            </div>
          )}

          {/* Coaching summary */}
          {sessions.length > 0 && (
            <>
              <Button variant="outline" disabled={aiLoading === "coaching_summary"} onClick={() => invokeInsights("coaching_summary", {
                sessions: sessions.slice(0, 5).map((s: any) => ({ title: s.title, topic: s.topic, date: s.created_at, messageCount: (s.messages as any[])?.length || 0 })),
                checkins: checkins.slice(0, 10),
              }, setCoachingSummary)}>
                {aiLoading === "coaching_summary" ? <Loader2 className="animate-spin mr-2" size={16} /> : <RefreshCw size={16} className="mr-2" />}
                Summarize Coaching Journey
              </Button>
              {coachingSummary && (
                <div className="bg-card rounded-xl border border-border p-5 space-y-3">
                  <p className="font-body text-sm text-foreground">{coachingSummary.sessions_summary}</p>
                  <p className="font-body text-sm text-muted-foreground italic">{coachingSummary.growth_trajectory}</p>
                  {coachingSummary.patterns?.length > 0 && (
                    <div className="space-y-1">
                      <h5 className="font-display text-xs text-foreground">Patterns</h5>
                      {coachingSummary.patterns.map((p: any, i: number) => (
                        <div key={i} className="p-2 rounded-lg bg-muted/30">
                          <span className="font-body text-xs text-accent">{p.pattern}</span>
                          <p className="font-body text-[10px] text-muted-foreground">{p.insight}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {coachingSummary.next_coaching_prompt && (
                    <div className="bg-accent/10 rounded-lg p-3 cursor-pointer hover:bg-accent/20 transition-colors" onClick={() => sendMessage(coachingSummary.next_coaching_prompt)}>
                      <span className="font-body text-xs text-accent">Next prompt:</span>
                      <p className="font-body text-sm text-foreground">{coachingSummary.next_coaching_prompt}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* CHECK-IN TAB */}
        <TabsContent value="checkin" className="space-y-4 mt-4">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Heart size={20} /> Coaching Check-in</h2>

          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div>
              <h3 className="font-display text-sm text-foreground mb-3">How are you feeling?</h3>
              <div className="flex gap-3">
                {Object.entries(moodEmojis).map(([value, { icon: Icon, label, color }]) => (
                  <button key={value} onClick={() => setCheckinMood(value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${checkinMood === value ? "border-accent bg-accent/10" : "border-border hover:border-accent/30"}`}>
                    <Icon size={18} className={checkinMood === value ? color : "text-muted-foreground"} />
                    <span className="font-body text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-display text-sm text-foreground">Confidence: {checkinConfidence}/10</label>
              <input type="range" min="1" max="10" value={checkinConfidence} onChange={(e) => setCheckinConfidence(Number(e.target.value))} className="w-full mt-1" />
            </div>

            <div>
              <label className="font-display text-sm text-foreground">Energy: {checkinEnergy}/10</label>
              <input type="range" min="1" max="10" value={checkinEnergy} onChange={(e) => setCheckinEnergy(Number(e.target.value))} className="w-full mt-1" />
            </div>

            <Textarea placeholder="What's on your mind? Any wins, struggles, or reflections..." value={checkinReflection} onChange={(e) => setCheckinReflection(e.target.value)} rows={3} />

            <Button onClick={submitCheckin} disabled={aiLoading === "checkin_analysis"} className="bg-primary text-primary-foreground">
              {aiLoading === "checkin_analysis" ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 size={16} className="mr-2" />}
              Submit Check-in
            </Button>
          </div>

          {/* Check-in AI response */}
          {checkinAnalysis && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="bg-accent/10 rounded-xl border border-accent/30 p-4">
                <p className="font-body text-sm text-foreground">{checkinAnalysis.acknowledgment}</p>
              </div>
              {checkinAnalysis.suggestions?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2">Suggested Actions</h4>
                  <div className="space-y-1">
                    {checkinAnalysis.suggestions.map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <ArrowRight size={12} className="text-accent shrink-0" />
                        <span className="font-body text-xs text-foreground flex-1">{s.action}</span>
                        <Badge variant="outline" className="text-[10px]">{s.timeframe}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                <p className="font-body text-sm text-accent">💛 {checkinAnalysis.affirmation}</p>
              </div>
              {checkinAnalysis.coaching_question && (
                <div className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => sendMessage(checkinAnalysis.coaching_question)}>
                  <span className="font-body text-[10px] text-muted-foreground">Coaching prompt:</span>
                  <p className="font-body text-sm text-foreground">{checkinAnalysis.coaching_question}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Check-in history */}
          {checkins.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="font-display text-sm text-foreground mb-3">Recent Check-ins</h4>
              <div className="space-y-2">
                {checkins.slice(0, 5).map((c: any) => {
                  const MoodIcon = moodEmojis[c.mood]?.icon || Meh;
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <MoodIcon size={16} className={moodEmojis[c.mood]?.color || "text-muted-foreground"} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-body text-xs text-foreground capitalize">{c.mood}</span>
                          <span className="font-body text-[10px] text-muted-foreground">C:{c.confidence}/10 E:{c.energy}/10</span>
                        </div>
                        {c.reflection && <p className="font-body text-[10px] text-muted-foreground line-clamp-1">{c.reflection}</p>}
                      </div>
                      <span className="font-body text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* DECISIONS TAB */}
        <TabsContent value="decisions" className="space-y-4 mt-4">
          <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Scale size={20} /> Decision Support</h2>

          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <p className="font-body text-sm text-muted-foreground">Describe a decision you're facing — I'll help you think it through.</p>
            <Textarea placeholder="e.g., Should I pivot my product to a different market segment?" value={decisionInput} onChange={(e) => setDecisionInput(e.target.value)} rows={3} />
            <Button onClick={() => invokeInsights("decision_support", {
              decision: decisionInput,
              profile: { industry: profile?.industry, stage: profile?.career_stage, goals: profile?.short_term_goals },
            }, setDecisionResult)} disabled={aiLoading === "decision_support" || !decisionInput.trim()} className="bg-primary text-primary-foreground">
              {aiLoading === "decision_support" ? <Loader2 className="animate-spin mr-2" size={16} /> : <Brain size={16} className="mr-2" />}
              Analyze Decision
            </Button>
          </div>

          {decisionResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <div className="bg-accent/10 rounded-xl p-4 border border-accent/30">
                <span className="font-body text-[10px] text-accent">Reframed question:</span>
                <p className="font-body text-sm text-foreground">{decisionResult.reframed_question}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2 text-green-600">Pros</h4>
                  <ul className="space-y-1">{decisionResult.pros?.map((p: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground">✓ {p}</li>)}</ul>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2 text-destructive">Cons</h4>
                  <ul className="space-y-1">{decisionResult.cons?.map((c: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground">✗ {c}</li>)}</ul>
                </div>
              </div>

              {decisionResult.frameworks?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2">Frameworks to Apply</h4>
                  <div className="space-y-2">
                    {decisionResult.frameworks.map((f: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-muted/30">
                        <span className="font-display text-xs text-accent">{f.name}</span>
                        <p className="font-body text-xs text-muted-foreground">{f.how_to_apply}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {decisionResult.questions_to_consider?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2">Questions to Consider</h4>
                  <ul className="space-y-1">{decisionResult.questions_to_consider.map((q: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground">• {q}</li>)}</ul>
                </div>
              )}

              <div className="bg-accent/5 rounded-xl p-4 border border-accent/20">
                <p className="font-body text-sm text-foreground">{decisionResult.recommendation}</p>
                <p className="font-body text-xs text-muted-foreground mt-2 italic">{decisionResult.reminder}</p>
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* SESSIONS TAB */}
        <TabsContent value="sessions" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Clock size={20} /> Session History</h2>
            <Button onClick={startNewSession} variant="outline"><Plus size={14} className="mr-1" /> New Session</Button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <MessageCircle className="mx-auto text-muted-foreground mb-3" size={36} />
              <p className="font-body text-muted-foreground">No coaching sessions yet. Start your first one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s: any) => (
                <div key={s.id} className={`bg-card rounded-xl border p-4 cursor-pointer transition-all ${currentSessionId === s.id ? "border-accent" : "border-border hover:border-accent/30"}`}>
                  <div className="flex items-center justify-between">
                    <div onClick={() => loadSession(s)} className="flex-1">
                      <h4 className="font-display text-sm text-foreground">{s.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-body text-[10px] text-muted-foreground">{(s.messages as any[])?.length || 0} messages</span>
                        <span className="font-body text-[10px] text-muted-foreground">{new Date(s.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }} className="h-7 px-2">
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIEntrepreneurshipCoach;
