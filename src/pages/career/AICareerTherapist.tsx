import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Heart, Send, Wind, BookHeart, Sparkles, Loader2, MessageCircle,
  Brain, Smile, Meh, Frown, Activity, RefreshCw, Shield, Sun, Moon,
  CloudRain, Flame, Plus, Trash2, Eye
} from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const THERAPIST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-therapist`;

const emotionStarters = [
  "😰 I'm feeling anxious about my startup",
  "😞 I feel lost and don't know what to do",
  "😵 Everything feels overwhelming right now",
  "😴 I've lost all motivation",
  "🤷 I'm doubting myself and my abilities",
  "🔥 I think I'm burning out",
  "😢 I'm struggling with failure",
  "💔 I'm dealing with team conflicts",
];

const moodOptions = [
  { value: "peaceful", icon: Sun, label: "Peaceful", color: "text-green-500" },
  { value: "okay", icon: Smile, label: "Okay", color: "text-blue-500" },
  { value: "anxious", icon: CloudRain, label: "Anxious", color: "text-yellow-500" },
  { value: "stressed", icon: Flame, label: "Stressed", color: "text-orange-500" },
  { value: "overwhelmed", icon: Frown, label: "Overwhelmed", color: "text-destructive" },
];

async function streamTherapist({
  messages, context, onDelta, onDone, onError,
}: {
  messages: Msg[]; context?: Record<string, any>;
  onDelta: (t: string) => void; onDone: () => void; onError?: (e: string) => void;
}) {
  const resp = await fetch(THERAPIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
    body: JSON.stringify({ messages, context }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Network error" }));
    onError?.(err.error || `Error ${resp.status}`);
    onDone(); return;
  }
  if (!resp.body) { onDone(); return; }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = ""; let done = false;
  while (!done) {
    const { done: d, value } = await reader.read();
    if (d) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx); buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || !line.trim() || !line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const c = JSON.parse(json).choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch { buf = line + "\n" + buf; break; }
    }
  }
  if (buf.trim()) {
    for (let raw of buf.split("\n")) {
      if (!raw || !raw.startsWith("data: ")) continue;
      const json = raw.slice(6).trim();
      if (json === "[DONE]") continue;
      try { const c = JSON.parse(json).choices?.[0]?.delta?.content; if (c) onDelta(c); } catch {}
    }
  }
  onDone();
}

const AICareerTherapist = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Tool states
  const [breathingExercise, setBreathingExercise] = useState<any>(null);
  const [journalPrompts, setJournalPrompts] = useState<any>(null);
  const [copingPlan, setCopingPlan] = useState<any>(null);
  const [moodAnalysis, setMoodAnalysis] = useState<any>(null);
  const [affirmations, setAffirmations] = useState<any>(null);
  const [toolLoading, setToolLoading] = useState<string | null>(null);

  // Check-in
  const [checkinMood, setCheckinMood] = useState("");
  const [checkinEnergy, setCheckinEnergy] = useState(5);
  const [checkinConfidence, setCheckinConfidence] = useState(5);
  const [checkinReflection, setCheckinReflection] = useState("");
  const [savingCheckin, setSavingCheckin] = useState(false);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [sessRes, checkinRes] = await Promise.all([
      supabase.from("coaching_sessions").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(20),
      supabase.from("coaching_checkins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
    ]);
    setSessions(sessRes.data || []);
    setCheckins(checkinRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const getContext = () => ({
    name: profile?.full_name || "friend",
    intent: profile?.active_intent || "entrepreneurship",
    userType: profile?.user_type || "unknown",
    recentMoods: checkins.slice(0, 5).map((c: any) => c.mood),
    challenges: profile?.areas_of_focus?.join(", ") || "not specified",
    stressLevel: checkins[0]?.energy ? (checkins[0].energy < 4 ? "high" : checkins[0].energy < 7 ? "moderate" : "low") : "unknown",
  });

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    const userMsg: Msg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamTherapist({
        messages: [...messages, userMsg],
        context: getContext(),
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (e) => { toast.error(e); setIsLoading(false); },
      });
      // Save session
      const allMsgs = [...messages, userMsg, { role: "assistant" as const, content: assistantSoFar }];
      if (currentSessionId) {
        await supabase.from("coaching_sessions").update({ messages: allMsgs as any, updated_at: new Date().toISOString() }).eq("id", currentSessionId);
      } else if (user) {
        const { data } = await supabase.from("coaching_sessions").insert({ user_id: user.id, messages: allMsgs as any, title: msg.slice(0, 60), topic: "therapy" }).select().single();
        if (data) setCurrentSessionId(data.id);
      }
    } catch { toast.error("Connection error"); setIsLoading(false); }
  };

  const newSession = () => { setMessages([]); setCurrentSessionId(null); };
  const loadSession = (s: any) => { setMessages(s.messages || []); setCurrentSessionId(s.id); };
  const deleteSession = async (id: string) => {
    await supabase.from("coaching_sessions").delete().eq("id", id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) newSession();
  };

  const callTool = async (type: string, setter: (d: any) => void) => {
    setToolLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("ai-therapist", {
        body: { type, context: { ...getContext(), checkins: checkins.slice(0, 10).map((c: any) => ({ mood: c.mood, energy: c.energy, confidence: c.confidence, reflection: c.reflection, date: c.created_at })) } },
      });
      if (error) throw error;
      setter(data);
    } catch (e: any) { toast.error(e.message || "Failed to generate"); }
    setToolLoading(null);
  };

  const saveCheckin = async () => {
    if (!user || !checkinMood) return;
    setSavingCheckin(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-therapist", {
        body: { type: "mood_analysis", context: { currentMood: checkinMood, energy: checkinEnergy, confidence: checkinConfidence, reflection: checkinReflection, history: checkins.slice(0, 10).map((c: any) => ({ mood: c.mood, energy: c.energy, date: c.created_at })) } },
      });
      await supabase.from("coaching_checkins").insert({ user_id: user.id, mood: checkinMood, energy: checkinEnergy, confidence: checkinConfidence, reflection: checkinReflection, ai_response: data || {} });
      toast.success("Check-in saved 💙");
      setCheckinMood(""); setCheckinReflection(""); setCheckinEnergy(5); setCheckinConfidence(5);
      loadData();
    } catch { toast.error("Failed to save"); }
    setSavingCheckin(false);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <Heart size={20} className="text-pink-500" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">AI Entrepreneurship Therapist</h1>
            <p className="font-body text-sm text-muted-foreground">A safe space for your emotional journey — always here, never judging</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="chat"><MessageCircle size={14} className="mr-1" />Talk</TabsTrigger>
          <TabsTrigger value="tools"><Wind size={14} className="mr-1" />Tools</TabsTrigger>
          <TabsTrigger value="checkin"><Activity size={14} className="mr-1" />Check-in</TabsTrigger>
          <TabsTrigger value="insights"><Brain size={14} className="mr-1" />Insights</TabsTrigger>
          <TabsTrigger value="sessions"><BookHeart size={14} className="mr-1" />History</TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          {/* Emotion Starters */}
          <div className="flex flex-wrap gap-2">
            {emotionStarters.map(e => (
              <button key={e} onClick={() => sendMessage(e)} disabled={isLoading}
                className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-body text-xs hover:bg-accent/10 hover:text-accent transition-all disabled:opacity-50">
                {e}
              </button>
            ))}
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="h-[400px] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <Heart size={40} className="mx-auto text-pink-500/50" />
                  <p className="text-muted-foreground font-body">You're not alone. Share what's on your mind — I'm here to listen, support, and guide you through the challenges of building something meaningful.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-4 rounded-xl font-body text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                    ) : msg.content}
                  </div>
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start"><div className="bg-muted rounded-xl p-4"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div></div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-border p-4 flex gap-2">
              <Textarea placeholder="Share what's on your mind..." value={input} onChange={e => setInput(e.target.value)}
                rows={1} className="resize-none" disabled={isLoading}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
              <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Breathing */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-3">
              <div className="flex items-center gap-2"><Wind size={20} className="text-blue-500" /><h3 className="font-display text-lg text-foreground">Breathing Exercise</h3></div>
              <p className="text-sm text-muted-foreground font-body">Guided breathing to calm anxiety and regain focus.</p>
              <Button onClick={() => callTool("breathing_exercise", setBreathingExercise)} disabled={toolLoading === "breathing_exercise"} variant="outline" size="sm" className="w-full">
                {toolLoading === "breathing_exercise" ? <Loader2 size={14} className="animate-spin mr-1" /> : <Wind size={14} className="mr-1" />}Generate
              </Button>
              {breathingExercise && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
                  <p className="font-display text-sm text-foreground">{breathingExercise.title}</p>
                  <p className="text-xs text-muted-foreground">{breathingExercise.duration_minutes} min</p>
                  {breathingExercise.steps?.map((s: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-body">
                      <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                      <span className="text-foreground">{s.instruction}</span>
                      <span className="text-muted-foreground ml-auto">{s.duration_seconds}s</span>
                    </div>
                  ))}
                  <p className="text-xs text-accent italic font-body mt-2">{breathingExercise.closing_message}</p>
                </motion.div>
              )}
            </div>

            {/* Journal Prompts */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-3">
              <div className="flex items-center gap-2"><BookHeart size={20} className="text-purple-500" /><h3 className="font-display text-lg text-foreground">Journal Prompts</h3></div>
              <p className="text-sm text-muted-foreground font-body">Reflective prompts to process emotions and build awareness.</p>
              <Button onClick={() => callTool("journaling_prompt", setJournalPrompts)} disabled={toolLoading === "journaling_prompt"} variant="outline" size="sm" className="w-full">
                {toolLoading === "journaling_prompt" ? <Loader2 size={14} className="animate-spin mr-1" /> : <BookHeart size={14} className="mr-1" />}Generate
              </Button>
              {journalPrompts && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
                  <p className="font-display text-sm text-foreground">{journalPrompts.theme}</p>
                  {journalPrompts.prompts?.map((p: any, i: number) => (
                    <div key={i} className="bg-muted rounded-lg p-3">
                      <p className="text-sm font-body text-foreground">{p.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">{p.purpose}</p>
                    </div>
                  ))}
                  <p className="text-xs text-accent italic font-body">💙 {journalPrompts.affirmation}</p>
                </motion.div>
              )}
            </div>

            {/* Affirmations */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-3">
              <div className="flex items-center gap-2"><Sparkles size={20} className="text-yellow-500" /><h3 className="font-display text-lg text-foreground">Affirmations</h3></div>
              <p className="text-sm text-muted-foreground font-body">Personalized affirmations to build confidence and resilience.</p>
              <Button onClick={() => callTool("affirmations", setAffirmations)} disabled={toolLoading === "affirmations"} variant="outline" size="sm" className="w-full">
                {toolLoading === "affirmations" ? <Loader2 size={14} className="animate-spin mr-1" /> : <Sparkles size={14} className="mr-1" />}Generate
              </Button>
              {affirmations && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs font-display text-muted-foreground mb-1 flex items-center gap-1"><Sun size={12} />Morning</p>
                    {affirmations.morning_affirmations?.map((a: string, i: number) => (
                      <p key={i} className="text-sm font-body text-foreground">✨ {a}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-display text-muted-foreground mb-1 flex items-center gap-1"><Shield size={12} />When Challenged</p>
                    {affirmations.challenge_affirmations?.map((a: string, i: number) => (
                      <p key={i} className="text-sm font-body text-foreground">💪 {a}</p>
                    ))}
                  </div>
                  <div className="bg-accent/10 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Your Mantra</p>
                    <p className="font-display text-sm text-accent">{affirmations.mantra}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Coping Plan */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Shield size={20} className="text-green-500" /><h3 className="font-display text-lg text-foreground">Personalized Coping Plan</h3></div>
              <Button onClick={() => callTool("coping_plan", setCopingPlan)} disabled={toolLoading === "coping_plan"} variant="outline" size="sm">
                {toolLoading === "coping_plan" ? <Loader2 size={14} className="animate-spin mr-1" /> : <RefreshCw size={14} className="mr-1" />}Generate Plan
              </Button>
            </div>
            {copingPlan && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <p className="text-sm font-body text-foreground">{copingPlan.current_assessment}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-display text-muted-foreground mb-2">Triggers Identified</p>
                    {copingPlan.triggers_identified?.map((t: string, i: number) => (
                      <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">{t}</Badge>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-display text-muted-foreground mb-2">Daily Practices</p>
                    {copingPlan.daily_practices?.map((p: string, i: number) => (
                      <p key={i} className="text-sm font-body text-foreground">🌱 {p}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-display text-muted-foreground mb-2">Coping Strategies</p>
                  <div className="space-y-2">
                    {copingPlan.coping_strategies?.map((s: any, i: number) => (
                      <div key={i} className="bg-muted rounded-lg p-3">
                        <p className="text-sm font-display text-foreground">{s.strategy}</p>
                        <p className="text-xs text-muted-foreground mt-1">When: {s.when_to_use}</p>
                        <p className="text-xs text-muted-foreground">How: {s.how}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {copingPlan.emergency_steps?.length > 0 && (
                  <div className="bg-destructive/10 rounded-lg p-4">
                    <p className="text-xs font-display text-destructive mb-2">🆘 Emergency Steps</p>
                    {copingPlan.emergency_steps.map((s: string, i: number) => (
                      <p key={i} className="text-sm font-body text-foreground">{i + 1}. {s}</p>
                    ))}
                  </div>
                )}
                <p className="text-sm text-accent italic font-body">💙 {copingPlan.encouragement}</p>
              </motion.div>
            )}
          </div>
        </TabsContent>

        {/* Check-in Tab */}
        <TabsContent value="checkin" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-5">
            <h3 className="font-display text-lg text-foreground">How are you feeling right now?</h3>
            <div className="flex flex-wrap gap-3">
              {moodOptions.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.value} onClick={() => setCheckinMood(m.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-body text-sm ${checkinMood === m.value ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/30"}`}>
                    <Icon size={18} className={checkinMood === m.value ? "text-accent" : m.color} />{m.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-display text-muted-foreground">Energy Level: {checkinEnergy}/10</label>
                <input type="range" min={1} max={10} value={checkinEnergy} onChange={e => setCheckinEnergy(+e.target.value)} className="w-full mt-1" />
              </div>
              <div>
                <label className="text-xs font-display text-muted-foreground">Confidence: {checkinConfidence}/10</label>
                <input type="range" min={1} max={10} value={checkinConfidence} onChange={e => setCheckinConfidence(+e.target.value)} className="w-full mt-1" />
              </div>
            </div>
            <Textarea placeholder="What's on your heart today? (optional)" value={checkinReflection} onChange={e => setCheckinReflection(e.target.value)} rows={3} />
            <Button onClick={saveCheckin} disabled={!checkinMood || savingCheckin} className="w-full">
              {savingCheckin ? <Loader2 size={14} className="animate-spin mr-1" /> : <Heart size={14} className="mr-1" />}Save Check-in
            </Button>
          </div>

          {/* Recent Check-ins */}
          {checkins.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-lg text-foreground">Recent Check-ins</h3>
              <div className="grid gap-3">
                {checkins.slice(0, 8).map((c: any) => (
                  <div key={c.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{c.mood}</Badge>
                        <span className="text-xs text-muted-foreground">⚡{c.energy}/10 💪{c.confidence}/10</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    {c.reflection && <p className="text-sm font-body text-foreground mt-2">{c.reflection}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Brain size={20} className="text-purple-500" /><h3 className="font-display text-lg text-foreground">Emotional Pattern Analysis</h3></div>
              <Button onClick={() => callTool("mood_analysis", setMoodAnalysis)} disabled={toolLoading === "mood_analysis" || checkins.length === 0} variant="outline" size="sm">
                {toolLoading === "mood_analysis" ? <Loader2 size={14} className="animate-spin mr-1" /> : <Activity size={14} className="mr-1" />}Analyze
              </Button>
            </div>
            {checkins.length === 0 && <p className="text-sm text-muted-foreground font-body">Complete a few check-ins first to unlock emotional insights.</p>}
            {moodAnalysis && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge className={moodAnalysis.overall_trend === "improving" ? "bg-green-500/10 text-green-600" : moodAnalysis.overall_trend === "declining" ? "bg-destructive/10 text-destructive" : "bg-yellow-500/10 text-yellow-600"}>
                    {moodAnalysis.overall_trend}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-display text-muted-foreground mb-2">Dominant Emotions</p>
                    {moodAnalysis.dominant_emotions?.map((e: string, i: number) => <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">{e}</Badge>)}
                  </div>
                  <div>
                    <p className="text-xs font-display text-muted-foreground mb-2">Resilience Indicators</p>
                    {moodAnalysis.resilience_indicators?.map((r: string, i: number) => <p key={i} className="text-sm font-body text-foreground">✅ {r}</p>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-display text-muted-foreground mb-2">Stress Triggers</p>
                  {moodAnalysis.stress_triggers?.map((t: string, i: number) => <Badge key={i} variant="destructive" className="mr-1 mb-1 text-xs">{t}</Badge>)}
                </div>
                <div>
                  <p className="text-xs font-display text-muted-foreground mb-2">Suggestions</p>
                  {moodAnalysis.therapeutic_suggestions?.map((s: any, i: number) => (
                    <div key={i} className="bg-muted rounded-lg p-3 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-display text-foreground">{s.area}</p>
                        <Badge variant="outline" className="text-[10px]">{s.priority}</Badge>
                      </div>
                      <p className="text-xs font-body text-muted-foreground">{s.suggestion}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-accent italic font-body">💙 {moodAnalysis.affirmation}</p>
              </motion.div>
            )}
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-foreground">Conversation History</h3>
            <Button onClick={newSession} variant="outline" size="sm"><Plus size={14} className="mr-1" />New Session</Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
          ) : sessions.filter(s => s.topic === "therapy").length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-8">No therapy sessions yet. Start a conversation in the Talk tab.</p>
          ) : (
            <div className="grid gap-3">
              {sessions.filter(s => s.topic === "therapy").map((s: any) => (
                <div key={s.id} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                  <div className="cursor-pointer flex-1" onClick={() => loadSession(s)}>
                    <p className="font-display text-sm text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleDateString()} · {(s.messages as any[])?.length || 0} messages</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => loadSession(s)}><Eye size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteSession(s.id)} className="text-destructive"><Trash2 size={14} /></Button>
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

export default AICareerTherapist;
