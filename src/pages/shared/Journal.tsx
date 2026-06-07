import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import {
  BookOpen, Plus, Sparkles, TrendingUp, Brain, Heart, Shield,
  Smile, Frown, Zap, Eye, EyeOff, Share2, ChevronRight, BarChart3,
  Target, Lightbulb, RefreshCw, Award, Compass, BookHeart, Users,
  Map, Loader2, Calendar
} from "lucide-react";

const moods = [
  { emoji: "😊", label: "Great", color: "bg-green-500/20 text-green-400", value: 5 },
  { emoji: "😌", label: "Calm", color: "bg-blue-500/20 text-blue-400", value: 4.5 },
  { emoji: "🔥", label: "Motivated", color: "bg-orange-500/20 text-orange-400", value: 5 },
  { emoji: "😐", label: "Okay", color: "bg-muted text-muted-foreground", value: 3 },
  { emoji: "😔", label: "Struggling", color: "bg-purple-500/20 text-purple-400", value: 2 },
  { emoji: "😰", label: "Anxious", color: "bg-red-500/20 text-red-400", value: 1.5 },
  { emoji: "😴", label: "Tired", color: "bg-indigo-500/20 text-indigo-400", value: 2 },
  { emoji: "🤔", label: "Reflective", color: "bg-amber-500/20 text-amber-400", value: 3.5 },
];

const moodValueMap: Record<string, number> = {};
moods.forEach(m => { moodValueMap[`${m.emoji} ${m.label}`] = m.value; });

const TABS = ["Journal", "Check-in", "Insights", "Templates", "Connect"] as const;
type Tab = (typeof TABS)[number];

const Journal = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Journal");
  const [entries, setEntries] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", mood: "", tags: "", is_private: true });
  const [checkinForm, setCheckinForm] = useState({ mood: "", energy: 5, confidence: 5, triggers: "", wins: "", challenges: "" });
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [reflectionPrompts, setReflectionPrompts] = useState<any[]>([]);
  const [actionSuggestions, setActionSuggestions] = useState<any[]>([]);
  const [moodAnalysis, setMoodAnalysis] = useState<any>(null);
  const [correlationInsights, setCorrelationInsights] = useState<any>(null);
  const [quickMood, setQuickMood] = useState<string | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);


  const handleQuickMood = async (moodLabel: string) => {
    setQuickMood(moodLabel);
    const selectedMood = moods.find(m => m.label === moodLabel) || moods[0];
    const { error } = await supabase.from("mood_checkins").insert({
      user_id: user!.id,
      mood: `${selectedMood.emoji} ${selectedMood.label}`,
      energy_level: Math.round(selectedMood.value * 2), // Map to 1-10 range
      confidence_level: Math.round(selectedMood.value * 2), // Map to 1-10 range
    });
    if (error) {
      toast.error("Failed to save mood");
      return;
    }
    toast.success("Vibe checked! 🎯");
    fetchAll();
  };

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [entriesRes, checkinsRes, insightsRes] = await Promise.all([
      supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("mood_checkins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("journal_insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    setEntries(entriesRes.data || []);
    setCheckins(checkinsRes.data || []);
    setInsights(insightsRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addEntry = async () => {
    if (!form.content.trim()) { toast.error("Write something first"); return; }
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user!.id,
      title: form.title || null,
      content: form.content,
      mood: form.mood || null,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      is_private: form.is_private,
    });
    if (error) { toast.error("Failed to save"); return; }

    // Check journal streak for badges
    const totalEntries = entries.length + 1;
    if (totalEntries === 5 || totalEntries === 20 || totalEntries === 50) {
      const badgeTitle = totalEntries === 5 ? "Reflective Starter" : totalEntries === 20 ? "Journaling Habit" : "Master Reflector";
      const existing = await supabase.from("achievements").select("id").eq("user_id", user!.id).eq("title", badgeTitle).maybeSingle();
      if (!existing.data) {
        await supabase.from("achievements").insert({
          user_id: user!.id, title: badgeTitle, achievement_type: "journaling",
          description: `Wrote ${totalEntries} journal entries`, points: totalEntries * 3,
        });
        toast.success(`🏅 Badge unlocked: ${badgeTitle}!`);
      }
    }

    setForm({ title: "", content: "", mood: "", tags: "", is_private: true });
    setShowForm(false);
    fetchAll();
    toast.success("Entry saved!");
  };

  const addCheckin = async () => {
    if (!checkinForm.mood) { toast.error("Select a mood"); return; }
    const { error } = await supabase.from("mood_checkins").insert({
      user_id: user!.id,
      mood: checkinForm.mood,
      energy_level: checkinForm.energy,
      confidence_level: checkinForm.confidence,
      triggers: checkinForm.triggers || null,
      wins: checkinForm.wins || null,
      challenges: checkinForm.challenges || null,
    });
    if (error) { toast.error("Failed to save check-in"); return; }

    // Sync to journal for Living Resume
    if (checkinForm.wins || checkinForm.challenges || checkinForm.triggers) {
      const parts = [];
      if (checkinForm.wins) parts.push(`**Wins:** ${checkinForm.wins}`);
      if (checkinForm.challenges) parts.push(`**Challenges:** ${checkinForm.challenges}`);
      if (checkinForm.triggers) parts.push(`**Triggers:** ${checkinForm.triggers}`);
      await supabase.from("journal_entries").insert({
        user_id: user!.id,
        title: `Mood Check-in: ${checkinForm.mood.split(" ").slice(1).join(" ")}`,
        content: `**Mood:** ${checkinForm.mood} | **Energy:** ${checkinForm.energy}/10 | **Confidence:** ${checkinForm.confidence}/10\n\n${parts.join("\n")}`,
        mood: checkinForm.mood,
        tags: ["mood-checkin", "auto-logged"],
        is_private: true,
      });
    }

    // Check-in streak badges
    const totalCheckins = checkins.length + 1;
    if (totalCheckins === 7 || totalCheckins === 30) {
      const badgeTitle = totalCheckins === 7 ? "Week of Awareness" : "Month of Mindfulness";
      const existing = await supabase.from("achievements").select("id").eq("user_id", user!.id).eq("title", badgeTitle).maybeSingle();
      if (!existing.data) {
        await supabase.from("achievements").insert({
          user_id: user!.id, title: badgeTitle, achievement_type: "consistency",
          description: `Completed ${totalCheckins} mood check-ins`, points: totalCheckins * 5,
        });
        toast.success(`🏅 Badge unlocked: ${badgeTitle}!`);
      }
    }

    setCheckinForm({ mood: "", energy: 5, confidence: 5, triggers: "", wins: "", challenges: "" });
    fetchAll();
    toast.success("Check-in saved! 🎯");
  };

  const togglePrivacy = async (entryId: string, currentPrivate: boolean) => {
    await supabase.from("journal_entries").update({ is_private: !currentPrivate }).eq("id", entryId);
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, is_private: !currentPrivate } : e));
    toast.success(!currentPrivate ? "Entry set to private" : "Entry now shareable with mentors/peers");
  };

  const callJournalAI = async (action: string, extra?: any) => {
    setAiLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/journal-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ action, user_id: user!.id, data: extra }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        toast.error(err.error || `Error ${resp.status}`);
        return null;
      }
      return await resp.json();
    } catch {
      toast.error("AI request failed");
      return null;
    } finally { setAiLoading(false); }
  };

  const loadReflectionPrompts = async () => {
    const data = await callJournalAI("reflection_prompts");
    if (Array.isArray(data)) setReflectionPrompts(data);
    else if (data?.prompts) setReflectionPrompts(data.prompts);
  };

  const loadWeeklyInsights = async () => {
    const data = await callJournalAI("weekly_insights");
    if (data?.ai_narrative) { toast.success("Weekly insights generated!"); fetchAll(); }
  };

  const loadActionSuggestions = async (mood: string) => {
    const data = await callJournalAI("action_suggestions", { mood });
    if (Array.isArray(data)) setActionSuggestions(data);
    else if (data?.actions) setActionSuggestions(data.actions);
  };

  const loadMoodAnalysis = async () => {
    const data = await callJournalAI("mood_analysis");
    if (data) setMoodAnalysis(data);
  };

  const loadCorrelations = async () => {
    const data = await callJournalAI("correlation_insights");
    if (data) setCorrelationInsights(data);
  };

  const loadMonthlySummary = async () => {
    const data = await callJournalAI("monthly_summary");
    if (data) { setMonthlySummary(data); fetchAll(); }
  };

  // Chart data
  const moodChartData = checkins.slice(0, 20).reverse().map((c: any) => ({
    date: new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    mood: moodValueMap[c.mood] || 3,
    energy: c.energy_level,
    confidence: c.confidence_level,
  }));

  const moodFrequency = checkins.reduce((acc: Record<string, number>, c: any) => {
    const label = c.mood?.split(" ").slice(1).join(" ") || "Unknown";
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const moodBarData = Object.entries(moodFrequency).map(([name, count]) => ({ name, count })).sort((a, b) => (b.count as number) - (a.count as number)).slice(0, 6);

  // Streak calculation
  const getJournalStreak = () => {
    if (entries.length === 0) return 0;
    let streak = 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 0; i < entries.length; i++) {
      const d = new Date(entries[i].created_at); d.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
      if (diff === streak) streak++;
      else if (diff > streak) break;
    }
    return streak;
  };
  const streak = getJournalStreak();

  const featureLinks = [
    { icon: Brain, label: "AI Career Therapist", desc: "Emotional support & coping", path: "/dashboard/ai-career-therapist", color: "text-pink-500" },
    { icon: Compass, label: "Curiosity Compass", desc: "Re-explore when uncertain", path: "/dashboard/curiosity-compass", color: "text-blue-500" },
    { icon: Target, label: "Project Playground", desc: "Build momentum with tasks", path: "/dashboard/project-playground", color: "text-emerald-500" },
    { icon: BookHeart, label: "Content Library", desc: "Calming & focus content", path: "/dashboard/content-library", color: "text-purple-500" },
    { icon: Users, label: "Peer Circles", desc: "Share with peers safely", path: "/dashboard/peer-circles", color: "text-orange-500" },
    { icon: Map, label: "Roadmap", desc: "Adjust goals & milestones", path: "/dashboard/roadmap", color: "text-primary" },
  ];

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-foreground">Mood & Reflection Journal</h1>
              <p className="font-body text-sm text-muted-foreground">
                Take a moment to check in with yourself. Your journey is about how you feel as you grow.
              </p>
            </div>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-600">{streak} day streak</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg font-body text-xs sm:text-sm transition-all whitespace-nowrap ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* JOURNAL TAB */}
          {activeTab === "Journal" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setShowForm(!showForm)} className="gap-1">
                    <Plus size={16} /> New Entry
                  </Button>
                </div>

                {showForm && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
                    <Input placeholder="Title (optional)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                    <div className="flex gap-2 flex-wrap">
                      {moods.map(m => (
                        <button key={m.label} onClick={() => setForm({ ...form, mood: `${m.emoji} ${m.label}` })}
                          className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${form.mood === `${m.emoji} ${m.label}` ? m.color + " ring-1 ring-current" : "bg-muted text-muted-foreground"}`}>
                          {m.emoji} {m.label}
                        </button>
                      ))}
                    </div>
                    <Textarea placeholder="What's on your mind? Reflect on your wins, challenges, or just how you're feeling..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} />
                    <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
                    <div className="flex items-center justify-between">
                      <button onClick={() => setForm({ ...form, is_private: !form.is_private })}
                        className="flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground transition-colors">
                        {form.is_private ? <EyeOff size={14} /> : <Eye size={14} />}
                        {form.is_private ? "Private" : "Shareable with mentors/peers"}
                      </button>
                      <div className="flex gap-2">
                        <Button onClick={addEntry}>Save</Button>
                        <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {entries.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
                    <h3 className="font-display text-xl text-foreground mb-2">No entries yet</h3>
                    <p className="font-body text-muted-foreground">Start journaling to track your growth!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {entries.map((entry, i) => (
                      <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-card rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {entry.mood && <span className="text-sm">{entry.mood.split(" ")[0]}</span>}
                            {entry.title && <h3 className="font-display text-base text-foreground">{entry.title}</h3>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => togglePrivacy(entry.id, entry.is_private)} className="text-muted-foreground hover:text-foreground transition-colors" title={entry.is_private ? "Make shareable" : "Make private"}>
                              {entry.is_private ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <span className="font-body text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <p className="font-body text-sm text-foreground whitespace-pre-wrap">{entry.content}</p>
                        {entry.tags?.length > 0 && (
                          <div className="flex gap-1 mt-3 flex-wrap">
                            {entry.tags.map((tag: string) => (
                              <span key={tag} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{tag}</span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Vibe Check Widget */}
              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 self-start w-full">
                <Card className="rounded-2xl overflow-hidden border border-border shadow-sm">
                  <CardHeader className="pb-3 bg-muted/10">
                    <CardTitle className="text-xs font-display flex items-center gap-1.5 text-foreground">
                      <TrendingUp size={14} className="text-primary" />
                      {quickMood ? "Your Vibe Today" : "How's your vibe today?"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    {quickMood ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const m = moods.find(x => x.label.toLowerCase() === quickMood.toLowerCase()) || moods[0];
                            return (
                              <>
                                <span className="text-2xl">{m.emoji}</span>
                                <span className="font-body text-xs font-medium text-foreground">{m.label}</span>
                              </>
                            );
                          })()}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setQuickMood(null)} className="h-6 text-[10px] text-muted-foreground">
                          Reset
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {moods.slice(0, 6).map(m => (
                          <Button
                            key={m.label}
                            variant="outline"
                            onClick={() => handleQuickMood(m.label)}
                            className="flex items-center gap-1.5 justify-start h-8 px-2.5 text-xs hover:border-primary/40 hover:bg-primary/5 rounded-xl"
                          >
                            <span>{m.emoji}</span>
                            <span>{m.label}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* CHECK-IN TAB */}
          {activeTab === "Check-in" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-display">How are you feeling?</CardTitle>
                  <CardDescription>No judgment. Just honesty with yourself.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {moods.map(m => (
                      <button key={m.label} onClick={() => setCheckinForm({ ...checkinForm, mood: `${m.emoji} ${m.label}` })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl font-body text-xs transition-all ${checkinForm.mood === `${m.emoji} ${m.label}` ? m.color + " ring-2 ring-current scale-105" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                        <span className="text-2xl">{m.emoji}</span>{m.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-body text-xs text-muted-foreground mb-1 block">Energy: {checkinForm.energy}/10</label>
                      <input type="range" min={1} max={10} value={checkinForm.energy} onChange={e => setCheckinForm({ ...checkinForm, energy: +e.target.value })} className="w-full" />
                    </div>
                    <div>
                      <label className="font-body text-xs text-muted-foreground mb-1 block">Confidence: {checkinForm.confidence}/10</label>
                      <input type="range" min={1} max={10} value={checkinForm.confidence} onChange={e => setCheckinForm({ ...checkinForm, confidence: +e.target.value })} className="w-full" />
                    </div>
                  </div>
                  <Input placeholder="What made you feel this way? (triggers)" value={checkinForm.triggers} onChange={e => setCheckinForm({ ...checkinForm, triggers: e.target.value })} />
                  <Input placeholder="Any wins today?" value={checkinForm.wins} onChange={e => setCheckinForm({ ...checkinForm, wins: e.target.value })} />
                  <Input placeholder="Any challenges?" value={checkinForm.challenges} onChange={e => setCheckinForm({ ...checkinForm, challenges: e.target.value })} />
                  <p className="text-xs text-muted-foreground">💡 Detailed check-ins are auto-synced to your journal for Living Resume tracking.</p>
                  <Button onClick={addCheckin} className="w-full">Save Check-in</Button>
                </CardContent>
              </Card>

              {checkins.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-lg font-display">Recent Check-ins</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {checkins.slice(0, 7).map((c: any, i: number) => (
                      <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="bg-secondary/50 rounded-lg p-3 flex items-center gap-4">
                        <span className="text-2xl">{c.mood?.split(" ")[0]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-body text-sm text-foreground">{c.mood?.split(" ").slice(1).join(" ")}</span>
                            <span className="font-body text-[10px] text-muted-foreground">⚡{c.energy_level} 💪{c.confidence_level}</span>
                          </div>
                          {c.wins && <p className="font-body text-xs text-primary truncate">✨ {c.wins}</p>}
                          {c.challenges && <p className="font-body text-xs text-destructive truncate">⚠ {c.challenges}</p>}
                        </div>
                        <span className="font-body text-[10px] text-muted-foreground shrink-0">{new Date(c.created_at).toLocaleDateString()}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Action suggestions */}
              {checkins.length > 0 && (
                <Button variant="outline" onClick={() => loadActionSuggestions(checkins[0]?.mood || "neutral")} disabled={aiLoading} className="w-full gap-2">
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lightbulb size={16} />}
                  Get Action Suggestions Based on Your Mood
                </Button>
              )}
              {actionSuggestions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-display text-lg text-foreground">Suggested Actions</h3>
                  {actionSuggestions.map((s: any, i: number) => (
                    <div key={i} onClick={() => s.path && navigate(s.path)}
                      className="bg-card rounded-lg border border-border p-4 flex items-start gap-3 cursor-pointer hover:border-primary/30 transition-colors">
                      <span className="text-xl">{s.icon_emoji || "💡"}</span>
                      <div className="flex-1">
                        <p className="font-body text-sm text-foreground font-medium">{s.action}</p>
                        <p className="font-body text-xs text-muted-foreground">{s.description}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-body text-[10px]">{s.feature}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INSIGHTS TAB */}
          {activeTab === "Insights" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button onClick={loadMoodAnalysis} disabled={aiLoading} variant="outline" size="sm" className="gap-1 text-xs">
                  <TrendingUp size={14} /> Mood Trends
                </Button>
                <Button onClick={loadCorrelations} disabled={aiLoading} variant="outline" size="sm" className="gap-1 text-xs">
                  <Brain size={14} /> Correlations
                </Button>
                <Button onClick={loadWeeklyInsights} disabled={aiLoading} variant="outline" size="sm" className="gap-1 text-xs">
                  <BarChart3 size={14} /> Weekly
                </Button>
                <Button onClick={loadMonthlySummary} disabled={aiLoading} variant="outline" size="sm" className="gap-1 text-xs">
                  <Calendar size={14} /> Monthly
                </Button>
              </div>

              {/* Mood Timeline Chart */}
              {moodChartData.length >= 3 && (
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base font-display">Mood, Energy & Confidence Over Time</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={moodChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} name="Mood" dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} name="Energy" dot={{ r: 2 }} />
                        <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} name="Confidence" dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Mood Frequency */}
              {moodBarData.length > 0 && (
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base font-display">Mood Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={moodBarData}>
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Mood Analysis */}
              {moodAnalysis && (
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base font-display flex items-center gap-2"><Brain size={18} className="text-primary" /> Mood Analysis</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Trend", value: moodAnalysis.trend_direction },
                        { label: "Dominant Emotion", value: moodAnalysis.dominant_emotion },
                        { label: "Energy Trend", value: moodAnalysis.energy_trend },
                        { label: "Resilience Score", value: moodAnalysis.resilience_score ? `${moodAnalysis.resilience_score}/100` : "—" },
                      ].map(item => (
                        <div key={item.label} className="bg-secondary/50 rounded-lg p-3">
                          <p className="font-body text-[10px] text-muted-foreground uppercase">{item.label}</p>
                          <p className="font-body text-sm text-foreground capitalize">{item.value || "—"}</p>
                        </div>
                      ))}
                    </div>
                    {moodAnalysis.key_insight && <p className="font-body text-sm text-foreground bg-primary/5 rounded-lg p-3">💡 {moodAnalysis.key_insight}</p>}
                    {moodAnalysis.recommended_feature && (
                      <button onClick={() => navigate(moodAnalysis.recommended_feature.path)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-left">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{moodAnalysis.recommended_feature.name}</p>
                          <p className="text-xs text-muted-foreground">{moodAnalysis.recommended_feature.reason}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    {moodAnalysis.encouragement && <p className="font-body text-sm text-muted-foreground italic">❤️ {moodAnalysis.encouragement}</p>}
                  </CardContent>
                </Card>
              )}

              {/* Correlation Insights */}
              {correlationInsights && (
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base font-display">Pattern Correlations</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {correlationInsights.correlations?.map((c: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-secondary/50 space-y-1">
                        <p className="text-sm font-medium text-foreground">{c.pattern}</p>
                        <p className="text-xs text-muted-foreground">{c.evidence}</p>
                        <p className="text-xs text-primary">💡 {c.actionable_tip}</p>
                      </div>
                    ))}
                    {correlationInsights.positive_triggers?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">✅ Positive Triggers</p>
                        <div className="flex gap-1 flex-wrap">{correlationInsights.positive_triggers.map((t: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}</div>
                      </div>
                    )}
                    {correlationInsights.warning_signs?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">⚠️ Warning Signs</p>
                        <div className="flex gap-1 flex-wrap">{correlationInsights.warning_signs.map((t: string, i: number) => <Badge key={i} variant="destructive" className="text-xs">{t}</Badge>)}</div>
                      </div>
                    )}
                    {correlationInsights.growth_narrative && <p className="text-sm italic text-pink-500">🌱 {correlationInsights.growth_narrative}</p>}
                  </CardContent>
                </Card>
              )}

              {/* Monthly Summary */}
              {monthlySummary && (
                <Card className="border-border/50">
                  <CardHeader><CardTitle className="text-base font-display">{monthlySummary.summary_title || "Monthly Summary"}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{monthlySummary.emotional_journey}</p>
                    {monthlySummary.resilience_moments?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">💪 Resilience Moments</p>
                        {monthlySummary.resilience_moments.map((r: string, i: number) => <p key={i} className="text-xs text-foreground">• {r}</p>)}
                      </div>
                    )}
                    {monthlySummary.next_month_focus?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">🎯 Next Month Focus</p>
                        {monthlySummary.next_month_focus.map((f: string, i: number) => <p key={i} className="text-xs text-foreground">→ {f}</p>)}
                      </div>
                    )}
                    {monthlySummary.affirmation && <p className="text-sm italic text-pink-500">💙 {monthlySummary.affirmation}</p>}
                  </CardContent>
                </Card>
              )}

              {/* Past Insights */}
              {insights.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display text-lg text-foreground">Past Insights</h3>
                  {insights.map((insight: any) => (
                    <Card key={insight.id} className="border-border/50">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs capitalize">{insight.insight_type}</Badge>
                          <span className="font-body text-xs text-muted-foreground">{new Date(insight.created_at).toLocaleDateString()}</span>
                        </div>
                        {insight.ai_narrative && <p className="font-body text-sm text-foreground">{insight.ai_narrative}</p>}
                        {insight.suggestions?.length > 0 && (
                          <div className="space-y-1">
                            {insight.suggestions.map((s: string, i: number) => (
                              <div key={i} className="flex items-start gap-2">
                                <ChevronRight size={12} className="text-primary mt-0.5 shrink-0" />
                                <span className="font-body text-xs text-foreground">{s}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {checkins.length === 0 && entries.length === 0 && (
                <div className="text-center py-8 bg-card rounded-xl border border-border">
                  <BarChart3 className="mx-auto text-muted-foreground mb-2" size={32} />
                  <p className="font-body text-sm text-muted-foreground">Complete some check-ins and write journal entries to unlock insights!</p>
                </div>
              )}
            </div>
          )}

          {/* TEMPLATES TAB */}
          {activeTab === "Templates" && (
            <div className="space-y-6">
              <Button onClick={loadReflectionPrompts} disabled={aiLoading} className="w-full gap-2">
                <RefreshCw size={16} className={aiLoading ? "animate-spin" : ""} />
                {aiLoading ? "Generating..." : "Generate Personalized Reflection Prompts"}
              </Button>

              {reflectionPrompts.length > 0 ? (
                <div className="space-y-3">
                  {reflectionPrompts.map((p: any, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => { setForm({ ...form, content: p.prompt || p.question || "", title: p.title || "" }); setShowForm(true); setActiveTab("Journal"); }}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display text-sm text-foreground">{p.title}</h3>
                        <Badge variant="outline" className="text-[10px] capitalize">{p.category}</Badge>
                      </div>
                      <p className="font-body text-sm text-muted-foreground">{p.prompt || p.question}</p>
                      <p className="font-body text-[10px] text-primary mt-2">Click to start writing →</p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-display text-lg text-foreground">Quick Templates</h3>
                  {[
                    { title: "Daily Wins", prompt: "Describe one thing you felt proud of today.", category: "wins", emoji: "🏆" },
                    { title: "Challenge Reflection", prompt: "What's one challenge you faced this week and how did you respond?", category: "challenges", emoji: "💪" },
                    { title: "Gratitude", prompt: "What are three things you're grateful for in your journey right now?", category: "gratitude", emoji: "🙏" },
                    { title: "Stuck Points", prompt: "Where do you feel stuck, and what support would help?", category: "feelings", emoji: "🤔" },
                    { title: "Growth Check", prompt: "What new skill or insight have you gained recently?", category: "growth", emoji: "🌱" },
                  ].map((t, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => { setForm({ ...form, content: t.prompt, title: t.title }); setShowForm(true); setActiveTab("Journal"); }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{t.emoji}</span>
                        <h3 className="font-display text-sm text-foreground">{t.title}</h3>
                        <Badge variant="outline" className="ml-auto text-[10px] capitalize">{t.category}</Badge>
                      </div>
                      <p className="font-body text-sm text-muted-foreground">{t.prompt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONNECT TAB */}
          {activeTab === "Connect" && (
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-display">Connected Features</CardTitle>
                  <CardDescription>Your reflections power personalized support across the platform. Explore when you're ready.</CardDescription>
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
                  <CardTitle className="text-lg font-display flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-500" /> Privacy Controls</CardTitle>
                  <CardDescription>You decide what's shared. Toggle visibility on individual entries in the Journal tab.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-display text-foreground">{entries.filter(e => e.is_private).length}</p>
                      <p className="text-xs text-muted-foreground">Private entries</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-display text-foreground">{entries.filter(e => !e.is_private).length}</p>
                      <p className="text-xs text-muted-foreground">Shareable entries</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shareable entries can be viewed by mentors you connect with and peer circles you join. Private entries are never shared.
                  </p>
                </CardContent>
              </Card>

              {/* Milestone badges */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-display flex items-center gap-2"><Award className="h-5 w-5 text-amber-500" /> Journaling Milestones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: "Reflective Starter", target: 5, current: entries.length, type: "entries" },
                    { title: "Journaling Habit", target: 20, current: entries.length, type: "entries" },
                    { title: "Master Reflector", target: 50, current: entries.length, type: "entries" },
                    { title: "Week of Awareness", target: 7, current: checkins.length, type: "check-ins" },
                    { title: "Month of Mindfulness", target: 30, current: checkins.length, type: "check-ins" },
                  ].map((m, i) => {
                    const progress = Math.min((m.current / m.target) * 100, 100);
                    const earned = m.current >= m.target;
                    return (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${earned ? "bg-amber-500/10 border border-amber-500/20" : "bg-secondary/50"}`}>
                        <Award className={`h-5 w-5 ${earned ? "text-amber-500" : "text-muted-foreground"}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${earned ? "text-foreground" : "text-muted-foreground"}`}>{m.title}</p>
                            <span className="text-xs text-muted-foreground">{m.current}/{m.target} {m.type}</span>
                          </div>
                          <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${earned ? "bg-amber-500" : "bg-primary/50"}`} style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Journal;
