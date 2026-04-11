import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  Heart, Send, Wind, BookHeart, Sparkles, Loader2,
  Brain, Smile, Meh, Frown, Activity, Shield, Sun,
  CloudRain, Flame, Plus, Trash2, Eye, Target, Users, Map,
  ChevronRight, Compass, Zap, BookOpen, Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";

type Msg = { role: "user" | "assistant"; content: string };

const THERAPIST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-therapist`;

const emotionStarters = [
  { label: "😰 I'm feeling anxious about my career", emoji: "😰" },
  { label: "😞 I feel lost and don't know what to do", emoji: "😞" },
  { label: "😵 Everything feels overwhelming right now", emoji: "😵" },
  { label: "😴 I've lost all motivation", emoji: "😴" },
  { label: "🤷 I'm doubting myself and my abilities", emoji: "🤷" },
  { label: "🔥 I think I'm burning out", emoji: "🔥" },
  { label: "💔 Help me feel better", emoji: "💔" },
  { label: "😢 I'm struggling with failure", emoji: "😢" },
];

const moodOptions = [
  { value: "peaceful", icon: Sun, label: "Peaceful", color: "text-emerald-500" },
  { value: "okay", icon: Smile, label: "Okay", color: "text-blue-500" },
  { value: "anxious", icon: CloudRain, label: "Anxious", color: "text-amber-500" },
  { value: "stressed", icon: Flame, label: "Stressed", color: "text-orange-500" },
  { value: "overwhelmed", icon: Frown, label: "Overwhelmed", color: "text-destructive" },
];

const moodToValue: Record<string, number> = { peaceful: 5, okay: 4, anxious: 3, stressed: 2, overwhelmed: 1 };

async function streamTherapist({ messages, context, onDelta, onDone, onError }: {
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
    onError?.(err.error || `Error ${resp.status}`); onDone(); return;
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
      try { const c = JSON.parse(json).choices?.[0]?.delta?.content; if (c) onDelta(c); }
      catch { buf = line + "\n" + buf; break; }
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Real user data for context
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [energyZones, setEnergyZones] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);

  // Tool states
  const [breathingExercise, setBreathingExercise] = useState<any>(null);
  const [journalPrompts, setJournalPrompts] = useState<any>(null);
  const [copingPlan, setCopingPlan] = useState<any>(null);
  const [moodAnalysis, setMoodAnalysis] = useState<any>(null);
  const [affirmations, setAffirmations] = useState<any>(null);
  const [behavioralNudges, setBehavioralNudges] = useState<any>(null);
  const [taskSuggestions, setTaskSuggestions] = useState<any>(null);
  const [roadmapAdjust, setRoadmapAdjust] = useState<any>(null);
  const [escalationCheck, setEscalationCheck] = useState<any>(null);
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
    const [sessRes, checkinRes, skillsRes, achieveRes, energyRes, journalRes] = await Promise.all([
      supabase.from("coaching_sessions").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(20),
      supabase.from("coaching_checkins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("skill_items").select("name, category, proficiency_level").eq("user_id", user.id).limit(50),
      supabase.from("achievements").select("title, achievement_type, earned_at").eq("user_id", user.id).order("earned_at", { ascending: false }).limit(20),
      supabase.from("energy_zones").select("domain, energy_level, mood_before, mood_after, recorded_at").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(20),
      supabase.from("journal_entries").select("title, mood, tags, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    setSessions(sessRes.data || []);
    setCheckins(checkinRes.data || []);
    setUserSkills(skillsRes.data || []);
    setUserAchievements(achieveRes.data || []);
    setEnergyZones(energyRes.data || []);
    setJournalEntries(journalRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const getContext = useCallback(() => ({
    name: profile?.full_name || "friend",
    intent: profile?.active_intent || "career",
    userType: profile?.user_type || "student",
    recentMoods: checkins.slice(0, 5).map((c: any) => c.mood),
    challenges: profile?.areas_of_focus?.join(", ") || "not specified",
    stressLevel: checkins[0]?.energy ? (checkins[0].energy < 4 ? "high" : checkins[0].energy < 7 ? "moderate" : "low") : "unknown",
    skills: userSkills.map(s => ({ name: s.name, category: s.category, level: s.proficiency_level })),
    recentAchievements: userAchievements.slice(0, 5).map(a => ({ title: a.title, type: a.achievement_type })),
    energyLevel: checkins[0]?.energy || "unknown",
    energyPatterns: energyZones.slice(0, 5).map(e => ({ domain: e.domain, energy: e.energy_level, moodBefore: e.mood_before, moodAfter: e.mood_after })),
    recentJournals: journalEntries.slice(0, 3).map(j => ({ title: j.title, mood: j.mood, tags: j.tags })),
    checkins: checkins.slice(0, 10).map((c: any) => ({ mood: c.mood, energy: c.energy, confidence: c.confidence, reflection: c.reflection, date: c.created_at })),
    daysSinceActive: checkins.length > 0 ? Math.floor((Date.now() - new Date(checkins[0].created_at).getTime()) / 86400000) : "unknown",
  }), [profile, checkins, userSkills, userAchievements, energyZones, journalEntries]);

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
  const loadSession = (s: any) => { setMessages(s.messages || []); setCurrentSessionId(s.id); setActiveTab("chat"); };
  const deleteSession = async (id: string) => {
    await supabase.from("coaching_sessions").delete().eq("id", id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) newSession();
  };

  const callTool = async (type: string, setter: (d: any) => void) => {
    setToolLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("ai-therapist", {
        body: { type, context: getContext() },
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
      const ctx = { currentMood: checkinMood, energy: checkinEnergy, confidence: checkinConfidence, reflection: checkinReflection, history: checkins.slice(0, 10).map((c: any) => ({ mood: c.mood, energy: c.energy, date: c.created_at })) };
      const { data } = await supabase.functions.invoke("ai-therapist", { body: { type: "mood_analysis", context: ctx } });

      await supabase.from("coaching_checkins").insert({ user_id: user.id, mood: checkinMood, energy: checkinEnergy, confidence: checkinConfidence, reflection: checkinReflection, ai_response: data || {} });

      // Sync reflection to journal
      if (checkinReflection.trim()) {
        await supabase.from("journal_entries").insert({
          user_id: user.id,
          title: `Emotional Check-in: ${checkinMood}`,
          content: `**Mood:** ${checkinMood} | **Energy:** ${checkinEnergy}/10 | **Confidence:** ${checkinConfidence}/10\n\n${checkinReflection}${data?.affirmation ? `\n\n---\n💙 *AI Insight:* ${data.affirmation}` : ""}`,
          mood: checkinMood,
          tags: ["therapist", "check-in", "emotional-health"],
        });
      }

      // Award resilience badge after 5 check-ins
      const totalCheckins = checkins.length + 1;
      if (totalCheckins === 5 || totalCheckins === 15 || totalCheckins === 30) {
        const badgeTitle = totalCheckins === 5 ? "Emotional Explorer" : totalCheckins === 15 ? "Resilience Builder" : "Wellness Champion";
        const existing = await supabase.from("achievements").select("id").eq("user_id", user.id).eq("title", badgeTitle).maybeSingle();
        if (!existing.data) {
          await supabase.from("achievements").insert({
            user_id: user.id, title: badgeTitle, achievement_type: "resilience",
            description: `Completed ${totalCheckins} emotional check-ins`, points: totalCheckins * 5,
          });
          toast.success(`🏅 Badge unlocked: ${badgeTitle}!`);
        }
      }

      toast.success("Check-in saved 💙");
      setCheckinMood(""); setCheckinReflection(""); setCheckinEnergy(5); setCheckinConfidence(5);
      loadData();
    } catch { toast.error("Failed to save"); }
    setSavingCheckin(false);
  };

  // Mood chart data
  const moodChartData = checkins.slice(0, 15).reverse().map((c: any) => ({
    date: new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    mood: moodToValue[c.mood] || 3,
    energy: c.energy,
    confidence: c.confidence,
  }));

  const featureLinks = [
    { icon: Compass, label: "Curiosity Compass", desc: "Re-explore interests when stuck", path: "/dashboard/curiosity-compass", color: "text-blue-500" },
    { icon: Target, label: "Project Playground", desc: "Build momentum with small tasks", path: "/dashboard/project-playground", color: "text-emerald-500" },
    { icon: BookOpen, label: "Content Library", desc: "Calming & focus content", path: "/dashboard/content-library", color: "text-purple-500" },
    { icon: Users, label: "Peer Circles", desc: "Safe peer support spaces", path: "/dashboard/peer-circles", color: "text-orange-500" },
    { icon: Zap, label: "SkillStacker", desc: "Rebuild confidence via skills", path: "/dashboard/skill-stacker", color: "text-amber-500" },
    { icon: Map, label: "Roadmap", desc: "Adjust goals & milestones", path: "/dashboard/roadmap", color: "text-primary" },
  ];

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-500/10"><Heart className="h-6 w-6 text-pink-500" /></div>
          <div>
            <h1 className="text-2xl font-display text-foreground">AI Career Therapist</h1>
            <p className="text-sm text-muted-foreground font-body">A safe space for your emotional journey — always here, never judging</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground/80 italic font-body">
          "You're not alone. Let's work through this together — one step, one thought, one action at a time."
        </p>
        <ModuleSearchBar
          placeholder="Search for support topics, career concerns..."
          sources={["careers", "domains"]}
          compact
          showAiBadge
          onSelect={(item) => {
            toast.info(`Let's explore your feelings about "${item.title}"`);
          }}
        />
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex overflow-x-auto w-full gap-1">
          <TabsTrigger value="chat" className="text-xs">💬 Talk</TabsTrigger>
          <TabsTrigger value="tools" className="text-xs">🧘 Tools</TabsTrigger>
          <TabsTrigger value="checkin" className="text-xs">💓 Check-in</TabsTrigger>
          <TabsTrigger value="nudges" className="text-xs">👁 Nudges</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs">🧠 Insights</TabsTrigger>
          <TabsTrigger value="connect" className="text-xs">🔗 Connect</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">📖 History</TabsTrigger>
        </TabsList>

        {/* CHAT TAB */}
        <TabsContent value="chat" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {emotionStarters.map(e => (
              <button key={e.label} onClick={() => sendMessage(e.label)} disabled={isLoading}
                className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-body text-xs hover:bg-pink-500/10 hover:text-pink-600 transition-all disabled:opacity-50">
                {e.label}
              </button>
            ))}
          </div>

          <Card className="border-border/50">
            <div className="h-[300px] sm:h-[420px] overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <Heart className="h-10 w-10 mx-auto text-pink-500/50" />
                  <p className="text-muted-foreground font-body text-sm max-w-sm mx-auto">You're not alone. Share what's on your mind — I'm here to listen, support, and guide you through the challenges of your career journey.</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[85%]">
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Heart className="h-3.5 w-3.5 text-pink-500" />
                          <span className="text-xs font-medium text-pink-500">Career Therapist</span>
                        </div>
                      )}
                      <div className={`p-3 rounded-xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                        ) : msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-border p-3 flex gap-2">
              <Textarea placeholder="Share what's on your mind..." value={input} onChange={e => setInput(e.target.value)}
                rows={1} className="resize-none min-h-[40px]" disabled={isLoading}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
              <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* TOOLS TAB */}
        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2"><Wind className="h-5 w-5 text-blue-500" /><h3 className="font-display text-base text-foreground">Breathing Exercise</h3></div>
                <p className="text-xs text-muted-foreground">Guided breathing to calm anxiety and regain focus.</p>
                <Button onClick={() => callTool("breathing_exercise", setBreathingExercise)} disabled={toolLoading === "breathing_exercise"} variant="outline" size="sm" className="w-full gap-1">
                  {toolLoading === "breathing_exercise" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wind className="h-3 w-3" />} Generate
                </Button>
                {breathingExercise && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <p className="font-medium text-sm text-foreground">{breathingExercise.title}</p>
                    <p className="text-xs text-muted-foreground">{breathingExercise.duration_minutes} min</p>
                    {breathingExercise.steps?.map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-[10px]">{s.type}</Badge>
                        <span className="text-foreground">{s.instruction}</span>
                        <span className="text-muted-foreground ml-auto">{s.duration_seconds}s</span>
                      </div>
                    ))}
                    <p className="text-xs text-pink-500 italic">💙 {breathingExercise.closing_message}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2"><BookHeart className="h-5 w-5 text-purple-500" /><h3 className="font-display text-base text-foreground">Journal Prompts</h3></div>
                <p className="text-xs text-muted-foreground">Reflective prompts to process emotions and build awareness.</p>
                <Button onClick={() => callTool("journaling_prompt", setJournalPrompts)} disabled={toolLoading === "journaling_prompt"} variant="outline" size="sm" className="w-full gap-1">
                  {toolLoading === "journaling_prompt" ? <Loader2 className="h-3 w-3 animate-spin" /> : <BookHeart className="h-3 w-3" />} Generate
                </Button>
                {journalPrompts && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <p className="font-medium text-sm text-foreground">{journalPrompts.theme}</p>
                    {journalPrompts.prompts?.map((p: any, i: number) => (
                      <div key={i} className="bg-secondary/50 rounded-lg p-2">
                        <p className="text-sm text-foreground">{p.question}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.purpose}</p>
                      </div>
                    ))}
                    <p className="text-xs text-pink-500 italic">💙 {journalPrompts.affirmation}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500" /><h3 className="font-display text-base text-foreground">Affirmations</h3></div>
                <p className="text-xs text-muted-foreground">Personalized affirmations to build confidence and resilience.</p>
                <Button onClick={() => callTool("affirmations", setAffirmations)} disabled={toolLoading === "affirmations"} variant="outline" size="sm" className="w-full gap-1">
                  {toolLoading === "affirmations" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />} Generate
                </Button>
                {affirmations && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">🌅 Morning</p>
                      {affirmations.morning_affirmations?.map((a: string, i: number) => <p key={i} className="text-sm text-foreground">✨ {a}</p>)}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">💪 When Challenged</p>
                      {affirmations.challenge_affirmations?.map((a: string, i: number) => <p key={i} className="text-sm text-foreground">🛡 {a}</p>)}
                    </div>
                    {affirmations.mantra && (
                      <div className="bg-accent/10 rounded-lg p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Your Mantra</p>
                        <p className="font-display text-sm text-accent">{affirmations.mantra}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-500" /><h3 className="font-display text-base text-foreground">Coping Plan</h3></div>
                <p className="text-xs text-muted-foreground">Personalized strategies for managing career-related stress.</p>
                <Button onClick={() => callTool("coping_plan", setCopingPlan)} disabled={toolLoading === "coping_plan"} variant="outline" size="sm" className="w-full gap-1">
                  {toolLoading === "coping_plan" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />} Generate
                </Button>
                {copingPlan && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <p className="text-sm text-foreground">{copingPlan.current_assessment}</p>
                    {copingPlan.coping_strategies?.map((s: any, i: number) => (
                      <div key={i} className="bg-secondary/50 rounded-lg p-2">
                        <p className="text-sm font-medium text-foreground">{s.strategy}</p>
                        <p className="text-xs text-muted-foreground">When: {s.when_to_use}</p>
                      </div>
                    ))}
                    {copingPlan.emergency_steps?.length > 0 && (
                      <div className="bg-destructive/10 rounded-lg p-3">
                        <p className="text-xs font-medium text-destructive mb-1">🆘 Emergency Steps</p>
                        {copingPlan.emergency_steps.map((s: string, i: number) => <p key={i} className="text-xs text-foreground">{i + 1}. {s}</p>)}
                      </div>
                    )}
                    <p className="text-xs text-pink-500 italic">💙 {copingPlan.encouragement}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CHECK-IN TAB */}
        <TabsContent value="checkin" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display">How are you feeling right now?</CardTitle>
              <CardDescription>No judgment. Just honesty with yourself.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {moodOptions.map(m => (
                  <button key={m.value} onClick={() => setCheckinMood(m.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm ${checkinMood === m.value ? "border-pink-500 bg-pink-500/10 text-pink-600" : "border-border text-muted-foreground hover:border-pink-500/30"}`}>
                    <m.icon className={`h-4 w-4 ${checkinMood === m.value ? "text-pink-500" : m.color}`} />{m.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Energy Level: {checkinEnergy}/10</label>
                  <input type="range" min={1} max={10} value={checkinEnergy} onChange={e => setCheckinEnergy(+e.target.value)} className="w-full mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Confidence: {checkinConfidence}/10</label>
                  <input type="range" min={1} max={10} value={checkinConfidence} onChange={e => setCheckinConfidence(+e.target.value)} className="w-full mt-1" />
                </div>
              </div>
              <Textarea placeholder="What's on your heart today? (optional)" value={checkinReflection} onChange={e => setCheckinReflection(e.target.value)} rows={3} />
              <p className="text-xs text-muted-foreground">💡 Reflections are automatically saved to your journal for long-term tracking.</p>
              <Button onClick={saveCheckin} disabled={!checkinMood || savingCheckin} className="w-full gap-1">
                {savingCheckin ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />} Save Check-in
              </Button>
            </CardContent>
          </Card>

          {checkins.length > 0 && (
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg font-display">Recent Check-ins</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {checkins.slice(0, 8).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                    <Badge variant="outline" className="text-xs capitalize">{c.mood}</Badge>
                    <span className="text-xs text-muted-foreground">⚡{c.energy}/10 💪{c.confidence}/10</span>
                    {c.reflection && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{c.reflection}</span>}
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* NUDGES TAB */}
        <TabsContent value="nudges" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> Behavioral Observations</CardTitle>
              <CardDescription>Gentle insights based on your engagement patterns — never surveillance, always care.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => callTool("behavioral_observation", setBehavioralNudges)} disabled={!!toolLoading} variant="outline" className="gap-2">
                {toolLoading === "behavioral_observation" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />} Check My Patterns
              </Button>
              {behavioralNudges && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/20">
                    <p className="text-sm text-foreground">{behavioralNudges.observation_summary}</p>
                  </div>
                  {behavioralNudges.nudges?.map((n: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-border/50 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">{n.type}</Badge>
                        <Badge variant={n.urgency === "important" ? "default" : "secondary"} className="text-xs">{n.urgency}</Badge>
                      </div>
                      <p className="text-sm text-foreground">{n.message}</p>
                      <p className="text-xs text-primary">→ {n.suggested_action}</p>
                      <p className="text-xs text-muted-foreground">Via: {n.linked_feature}</p>
                    </div>
                  ))}
                  {behavioralNudges.celebration && (
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                      <p className="text-sm text-foreground">🎉 {behavioralNudges.celebration}</p>
                    </div>
                  )}
                  {behavioralNudges.energy_insight && <p className="text-xs text-muted-foreground">⚡ {behavioralNudges.energy_insight}</p>}
                  {behavioralNudges.resilience_note && <p className="text-xs text-pink-500 italic">💪 {behavioralNudges.resilience_note}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Therapeutic Task Suggestions</CardTitle>
              <CardDescription>Small, safe tasks to rebuild momentum without pressure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => callTool("task_suggestions", setTaskSuggestions)} disabled={!!toolLoading} variant="outline" className="gap-2">
                {toolLoading === "task_suggestions" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />} Get Task Ideas
              </Button>
              {taskSuggestions && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <p className="text-sm text-muted-foreground italic">{taskSuggestions.emotional_context}</p>
                  {taskSuggestions.tasks?.map((t: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-border/50 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-foreground">{t.title}</h4>
                        <Badge variant="secondary" className="text-xs capitalize">{t.type}</Badge>
                        <Badge variant="outline" className="text-xs">{t.effort}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                      <p className="text-xs text-pink-500">💡 {t.why_it_helps}</p>
                      <p className="text-xs text-muted-foreground">Via: {t.linked_feature}</p>
                    </div>
                  ))}
                  {taskSuggestions.pacing_advice && <p className="text-xs text-muted-foreground">🐢 {taskSuggestions.pacing_advice}</p>}
                  {taskSuggestions.encouragement && <p className="text-sm italic text-pink-500">✨ {taskSuggestions.encouragement}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><Map className="h-5 w-5 text-primary" /> Roadmap Adjustments</CardTitle>
              <CardDescription>Gentle goal modifications when things feel overwhelming.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => callTool("roadmap_adjustment", setRoadmapAdjust)} disabled={!!toolLoading} variant="outline" className="gap-2">
                {toolLoading === "roadmap_adjustment" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />} Suggest Adjustments
              </Button>
              {roadmapAdjust && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <p className="text-sm text-foreground">{roadmapAdjust.assessment}</p>
                  {roadmapAdjust.adjustments?.map((a: any, i: number) => (
                    <div key={i} className="p-3 rounded-lg bg-secondary/50 space-y-1">
                      <p className="text-xs text-muted-foreground line-through">{a.original_goal}</p>
                      <p className="text-sm font-medium text-foreground">→ {a.adjusted_goal}</p>
                      <p className="text-xs text-muted-foreground">{a.reason} · {a.timeline_change}</p>
                    </div>
                  ))}
                  {roadmapAdjust.breaks_suggested?.map((b: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">{b.duration}</Badge>
                      <span className="text-foreground">{b.activity}</span>
                    </div>
                  ))}
                  {roadmapAdjust.reframe_message && <p className="text-sm italic text-pink-500">✨ {roadmapAdjust.reframe_message}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Need Deeper Support?</CardTitle>
              <CardDescription>Check if connecting with a mentor or peer group might help.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => callTool("escalation_check", setEscalationCheck)} disabled={!!toolLoading} variant="outline" className="gap-2">
                {toolLoading === "escalation_check" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />} Check Support Options
              </Button>
              {escalationCheck && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/20">
                    <p className="text-sm text-foreground">{escalationCheck.immediate_support}</p>
                  </div>
                  {escalationCheck.recommendations?.map((r: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">{r.type}</Badge>
                          <Badge variant={r.urgency === "priority" ? "default" : "secondary"} className="text-xs">{r.urgency}</Badge>
                        </div>
                        <p className="text-sm text-foreground mt-1">{r.description}</p>
                      </div>
                      {(r.type === "mentor" || r.type === "peer_circle") && (
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => navigate(r.type === "mentor" ? "/dashboard/mentor-matchmaking" : "/dashboard/peer-circles")}>
                          <ChevronRight className="h-3 w-3" /> Go
                        </Button>
                      )}
                    </div>
                  ))}
                  {escalationCheck.self_care_reminder && <p className="text-xs text-muted-foreground italic">🌸 {escalationCheck.self_care_reminder}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INSIGHTS TAB */}
        <TabsContent value="insights" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><Brain className="h-5 w-5 text-purple-500" /> Emotional Pattern Analysis</CardTitle>
              <CardDescription>Track your mood trends and discover resilience indicators.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => callTool("mood_analysis", setMoodAnalysis)} disabled={toolLoading === "mood_analysis" || checkins.length === 0} variant="outline" className="gap-2">
                {toolLoading === "mood_analysis" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />} Analyze Patterns
              </Button>
              {checkins.length === 0 && <p className="text-sm text-muted-foreground">Complete a few check-ins first to unlock emotional insights.</p>}
              {moodAnalysis && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <Badge className={moodAnalysis.overall_trend === "improving" ? "bg-emerald-500/10 text-emerald-600" : moodAnalysis.overall_trend === "declining" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"}>
                    Trend: {moodAnalysis.overall_trend}
                  </Badge>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Dominant Emotions</p>
                      <div className="flex gap-1 flex-wrap">{moodAnalysis.dominant_emotions?.map((e: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{e}</Badge>)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Resilience Indicators</p>
                      {moodAnalysis.resilience_indicators?.map((r: string, i: number) => <p key={i} className="text-xs text-foreground">✅ {r}</p>)}
                    </div>
                  </div>
                  {moodAnalysis.stress_triggers?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Stress Triggers</p>
                      <div className="flex gap-1 flex-wrap">{moodAnalysis.stress_triggers.map((t: string, i: number) => <Badge key={i} variant="destructive" className="text-xs">{t}</Badge>)}</div>
                    </div>
                  )}
                  {moodAnalysis.therapeutic_suggestions?.map((s: any, i: number) => (
                    <div key={i} className="p-2 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2"><span className="text-sm font-medium text-foreground">{s.area}</span><Badge variant="outline" className="text-[10px]">{s.priority}</Badge></div>
                      <p className="text-xs text-muted-foreground">{s.suggestion}</p>
                    </div>
                  ))}
                  <p className="text-sm text-pink-500 italic">💙 {moodAnalysis.affirmation}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Mood Chart */}
          {moodChartData.length >= 3 && (
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg font-display">Mood, Energy & Confidence Trends</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={moodChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} name="Mood (1-5)" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confidence" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Resilience Badges */}
          {userAchievements.filter(a => a.achievement_type === "resilience").length > 0 && (
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-lg font-display flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" /> Resilience Badges</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {userAchievements.filter(a => a.achievement_type === "resilience").map((a: any) => (
                    <div key={a.earned_at} className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <Award className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{new Date(a.earned_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* CONNECT TAB - Feature Links & Recommendations */}
        <TabsContent value="connect" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display">Connected Support Features</CardTitle>
              <CardDescription>Your emotional wellness is connected to every part of your journey. Explore these when you're ready.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featureLinks.map(f => (
                  <button key={f.path} onClick={() => navigate(f.path)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left">
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Human Connection</CardTitle>
              <CardDescription>Sometimes you need a real person. That's okay — it's a strength.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button onClick={() => navigate("/dashboard/mentor-matchmaking")}
                className="w-full flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left">
                <div className="p-2 rounded-lg bg-blue-500/10"><Users className="h-5 w-5 text-blue-500" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Find a Mentor</p>
                  <p className="text-xs text-muted-foreground">Connect with experienced guides for deeper career conversations</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              <button onClick={() => navigate("/dashboard/peer-circles")}
                className="w-full flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left">
                <div className="p-2 rounded-lg bg-orange-500/10"><Heart className="h-5 w-5 text-orange-500" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Join a Peer Circle</p>
                  <p className="text-xs text-muted-foreground">Safe spaces to share experiences and learn from others like you</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </CardContent>
          </Card>

          {/* Recent journal entries from therapist */}
          {journalEntries.filter(j => j.tags?.includes("therapist")).length > 0 && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-display">Reflection Journal Sync</CardTitle>
                <CardDescription>Your emotional check-ins are logged here for long-term tracking.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {journalEntries.filter(j => j.tags?.includes("therapist")).slice(0, 5).map((j: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                    <Badge variant="outline" className="text-xs capitalize">{j.mood || "—"}</Badge>
                    <span className="text-sm text-foreground truncate">{j.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{new Date(j.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
                <Button variant="link" size="sm" className="text-xs p-0" onClick={() => navigate("/dashboard/journal")}>
                  View all journal entries →
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg text-foreground">Conversation History</h3>
            <Button onClick={newSession} variant="outline" size="sm" className="gap-1"><Plus className="h-3 w-3" /> New Session</Button>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : sessions.filter(s => s.topic === "therapy").length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No therapy sessions yet. Start a conversation in the Talk tab.</p>
          ) : (
            <div className="space-y-3">
              {sessions.filter(s => s.topic === "therapy").map((s: any) => (
                <Card key={s.id} className="border-border/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="cursor-pointer flex-1" onClick={() => loadSession(s)}>
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleDateString()} · {(s.messages as any[])?.length || 0} messages</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => loadSession(s)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteSession(s.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AICareerTherapist;
