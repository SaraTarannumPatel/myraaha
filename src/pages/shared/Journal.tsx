import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  BookOpen, Plus, Sparkles, TrendingUp, Brain, Heart, Shield,
  Smile, Frown, Zap, Coffee, Sun, Moon, CloudRain, Flame,
  Eye, EyeOff, Share2, ChevronRight, BarChart3, MessageCircle,
  Target, Lightbulb, RefreshCw
} from "lucide-react";

const moods = [
  { emoji: "😊", label: "Great", color: "bg-green-500/20 text-green-400" },
  { emoji: "😌", label: "Calm", color: "bg-blue-500/20 text-blue-400" },
  { emoji: "🔥", label: "Motivated", color: "bg-orange-500/20 text-orange-400" },
  { emoji: "😐", label: "Okay", color: "bg-muted text-muted-foreground" },
  { emoji: "😔", label: "Struggling", color: "bg-purple-500/20 text-purple-400" },
  { emoji: "😰", label: "Anxious", color: "bg-red-500/20 text-red-400" },
  { emoji: "😴", label: "Tired", color: "bg-indigo-500/20 text-indigo-400" },
  { emoji: "🤔", label: "Reflective", color: "bg-amber-500/20 text-amber-400" },
];

const TABS = ["Journal", "Check-in", "Insights", "Templates"] as const;
type Tab = (typeof TABS)[number];

const Journal = () => {
  const { user } = useAuth();
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

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [entriesRes, checkinsRes, insightsRes] = await Promise.all([
      supabase.from("journal_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("mood_checkins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("journal_insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
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
    setCheckinForm({ mood: "", energy: 5, confidence: 5, triggers: "", wins: "", challenges: "" });
    fetchAll();
    toast.success("Check-in saved! 🎯");
  };

  const callJournalAI = async (action: string, extra?: any) => {
    setAiLoading(true);
    try {
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/journal-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action, user_id: user!.id, data: extra }),
      });
      const data = await resp.json();
      return data;
    } catch {
      toast.error("AI request failed");
      return null;
    } finally {
      setAiLoading(false);
    }
  };

  const loadReflectionPrompts = async () => {
    const data = await callJournalAI("reflection_prompts");
    if (Array.isArray(data)) setReflectionPrompts(data);
    else if (data?.prompts) setReflectionPrompts(data.prompts);
  };

  const loadWeeklyInsights = async () => {
    const data = await callJournalAI("weekly_insights");
    if (data?.ai_narrative) {
      toast.success("Weekly insights generated!");
      fetchAll();
    }
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

  // Mood frequency for mini chart
  const moodFrequency = checkins.reduce((acc: Record<string, number>, c: any) => {
    acc[c.mood] = (acc[c.mood] || 0) + 1;
    return acc;
  }, {});

  const topMoods = Object.entries(moodFrequency).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <BookOpen size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Mood & Reflection Journal</h1>
              <p className="font-body text-sm text-muted-foreground">
                Take a moment to check in with yourself. Your journey is not just about milestones — it's about how you feel as you grow.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg font-body text-sm transition-all ${
              activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse font-body text-muted-foreground text-center py-12">Loading...</div>
      ) : (
        <>
          {/* ===== JOURNAL TAB ===== */}
          {activeTab === "Journal" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowForm(!showForm)} className="gradient-warm text-secondary-foreground">
                  <Plus size={18} /> New Entry
                </Button>
              </div>

              {showForm && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <Input placeholder="Title (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <div className="flex gap-2 flex-wrap">
                    {moods.map((m) => (
                      <button
                        key={m.label}
                        onClick={() => setForm({ ...form, mood: `${m.emoji} ${m.label}` })}
                        className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${
                          form.mood === `${m.emoji} ${m.label}` ? m.color + " ring-1 ring-current" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.emoji} {m.label}
                      </button>
                    ))}
                  </div>
                  <Textarea placeholder="What's on your mind? Reflect on your wins, challenges, or just how you're feeling..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} />
                  <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setForm({ ...form, is_private: !form.is_private })}
                      className="flex items-center gap-2 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {form.is_private ? <EyeOff size={14} /> : <Eye size={14} />}
                      {form.is_private ? "Private" : "Shareable"}
                    </button>
                    <div className="flex gap-2">
                      <Button onClick={addEntry} className="gradient-warm text-secondary-foreground">Save</Button>
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
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-card rounded-xl border border-border p-5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {entry.mood && <span className="text-sm">{entry.mood.split(" ")[0]}</span>}
                          {entry.title && <h3 className="font-display text-lg text-foreground">{entry.title}</h3>}
                        </div>
                        <div className="flex items-center gap-2">
                          {entry.is_private ? <EyeOff size={12} className="text-muted-foreground" /> : <Eye size={12} className="text-muted-foreground" />}
                          <span className="font-body text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="font-body text-sm text-foreground whitespace-pre-wrap">{entry.content}</p>
                      {entry.tags && entry.tags.length > 0 && (
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
          )}

          {/* ===== CHECK-IN TAB ===== */}
          {activeTab === "Check-in" && (
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                <h2 className="font-display text-xl text-foreground">How are you feeling?</h2>
                <div className="grid grid-cols-4 gap-2">
                  {moods.map((m) => (
                    <button
                      key={m.label}
                      onClick={() => setCheckinForm({ ...checkinForm, mood: `${m.emoji} ${m.label}` })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl font-body text-xs transition-all ${
                        checkinForm.mood === `${m.emoji} ${m.label}` ? m.color + " ring-2 ring-current scale-105" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">Energy Level: {checkinForm.energy}/10</label>
                    <input type="range" min={1} max={10} value={checkinForm.energy} onChange={(e) => setCheckinForm({ ...checkinForm, energy: +e.target.value })} className="w-full accent-primary" />
                  </div>
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">Confidence Level: {checkinForm.confidence}/10</label>
                    <input type="range" min={1} max={10} value={checkinForm.confidence} onChange={(e) => setCheckinForm({ ...checkinForm, confidence: +e.target.value })} className="w-full accent-primary" />
                  </div>
                </div>

                <Input placeholder="What made you feel this way? (triggers)" value={checkinForm.triggers} onChange={(e) => setCheckinForm({ ...checkinForm, triggers: e.target.value })} />
                <Input placeholder="Any wins today?" value={checkinForm.wins} onChange={(e) => setCheckinForm({ ...checkinForm, wins: e.target.value })} />
                <Input placeholder="Any challenges?" value={checkinForm.challenges} onChange={(e) => setCheckinForm({ ...checkinForm, challenges: e.target.value })} />

                <Button onClick={addCheckin} className="w-full gradient-warm text-secondary-foreground">
                  Save Check-in
                </Button>
              </div>

              {/* Recent check-ins */}
              {checkins.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display text-lg text-foreground">Recent Check-ins</h3>
                  {checkins.slice(0, 7).map((c, i) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-card rounded-lg border border-border p-4 flex items-center gap-4"
                    >
                      <span className="text-2xl">{c.mood?.split(" ")[0]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-body text-sm text-foreground">{c.mood?.split(" ").slice(1).join(" ")}</span>
                          <span className="font-body text-[10px] text-muted-foreground">⚡{c.energy_level} 💪{c.confidence_level}</span>
                        </div>
                        {c.wins && <p className="font-body text-xs text-green-400 truncate">✨ {c.wins}</p>}
                        {c.challenges && <p className="font-body text-xs text-red-400 truncate">⚠ {c.challenges}</p>}
                      </div>
                      <span className="font-body text-[10px] text-muted-foreground shrink-0">
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Mood frequency */}
              {topMoods.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display text-lg text-foreground mb-3">Mood Frequency</h3>
                  <div className="space-y-2">
                    {topMoods.map(([mood, count]) => (
                      <div key={mood} className="flex items-center gap-3">
                        <span className="text-lg w-8">{mood.split(" ")[0]}</span>
                        <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full gradient-warm rounded-full transition-all"
                            style={{ width: `${((count as number) / checkins.length) * 100}%` }}
                          />
                        </div>
                        <span className="font-body text-xs text-muted-foreground w-8 text-right">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action suggestions after check-in */}
              {checkinForm.mood === "" && checkins.length > 0 && (
                <Button variant="outline" onClick={() => loadActionSuggestions(checkins[0]?.mood || "neutral")} disabled={aiLoading} className="w-full">
                  <Lightbulb size={16} /> {aiLoading ? "Generating..." : "Get Action Suggestions Based on Your Mood"}
                </Button>
              )}

              {actionSuggestions.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-display text-lg text-foreground">Suggested Actions</h3>
                  {actionSuggestions.map((s, i) => (
                    <div key={i} className="bg-card rounded-lg border border-border p-4 flex items-start gap-3">
                      <span className="text-xl">{s.icon_emoji || "💡"}</span>
                      <div>
                        <p className="font-body text-sm text-foreground font-medium">{s.action}</p>
                        <p className="font-body text-xs text-muted-foreground">{s.description}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/10 text-primary font-body text-[10px]">{s.feature}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== INSIGHTS TAB ===== */}
          {activeTab === "Insights" && (
            <div className="space-y-6">
              <div className="flex gap-2">
                <Button onClick={loadWeeklyInsights} disabled={aiLoading} variant="outline" className="flex-1">
                  <BarChart3 size={16} /> {aiLoading ? "Analyzing..." : "Generate Weekly Insights"}
                </Button>
                <Button onClick={loadMoodAnalysis} disabled={aiLoading} variant="outline" className="flex-1">
                  <TrendingUp size={16} /> {aiLoading ? "Analyzing..." : "Mood Trend Analysis"}
                </Button>
              </div>

              {/* Mood analysis */}
              {moodAnalysis && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6 space-y-3">
                  <h3 className="font-display text-lg text-foreground flex items-center gap-2">
                    <Brain size={18} className="text-primary" /> Mood Analysis
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-body text-[10px] text-muted-foreground uppercase">Trend</p>
                      <p className="font-body text-sm text-foreground capitalize">{moodAnalysis.trend_direction || "Stable"}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-body text-[10px] text-muted-foreground uppercase">Dominant Emotion</p>
                      <p className="font-body text-sm text-foreground">{moodAnalysis.dominant_emotion || "—"}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-body text-[10px] text-muted-foreground uppercase">Energy Trend</p>
                      <p className="font-body text-sm text-foreground capitalize">{moodAnalysis.energy_trend || "—"}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-body text-[10px] text-muted-foreground uppercase">Confidence Trend</p>
                      <p className="font-body text-sm text-foreground capitalize">{moodAnalysis.confidence_trend || "—"}</p>
                    </div>
                  </div>
                  {moodAnalysis.key_insight && (
                    <p className="font-body text-sm text-foreground bg-primary/5 rounded-lg p-3">💡 {moodAnalysis.key_insight}</p>
                  )}
                  {moodAnalysis.encouragement && (
                    <p className="font-body text-sm text-muted-foreground italic">❤️ {moodAnalysis.encouragement}</p>
                  )}
                </motion.div>
              )}

              {/* Stored insights */}
              {insights.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-display text-lg text-foreground">Past Insights</h3>
                  {insights.map((insight) => (
                    <div key={insight.id} className="bg-card rounded-xl border border-border p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-xs text-primary uppercase">{insight.insight_type} Summary</span>
                        <span className="font-body text-xs text-muted-foreground">{new Date(insight.created_at).toLocaleDateString()}</span>
                      </div>
                      {insight.ai_narrative && (
                        <p className="font-body text-sm text-foreground">{insight.ai_narrative}</p>
                      )}
                      {insight.suggestions && insight.suggestions.length > 0 && (
                        <div className="space-y-1">
                          <p className="font-body text-xs text-muted-foreground font-medium">Suggestions:</p>
                          {insight.suggestions.map((s: string, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                              <ChevronRight size={12} className="text-primary mt-0.5 shrink-0" />
                              <span className="font-body text-xs text-foreground">{s}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-card rounded-xl border border-border">
                  <BarChart3 className="mx-auto text-muted-foreground mb-2" size={32} />
                  <p className="font-body text-sm text-muted-foreground">No insights yet. Generate your first weekly summary!</p>
                </div>
              )}
            </div>
          )}

          {/* ===== TEMPLATES TAB ===== */}
          {activeTab === "Templates" && (
            <div className="space-y-6">
              <Button onClick={loadReflectionPrompts} disabled={aiLoading} className="w-full gradient-warm text-secondary-foreground">
                <RefreshCw size={16} className={aiLoading ? "animate-spin" : ""} />
                {aiLoading ? "Generating prompts..." : "Generate Personalized Reflection Prompts"}
              </Button>

              {reflectionPrompts.length > 0 ? (
                <div className="space-y-3">
                  {reflectionPrompts.map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => {
                        setForm({ ...form, content: p.prompt || p.question || "", title: p.title || "" });
                        setShowForm(true);
                        setActiveTab("Journal");
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-display text-sm text-foreground">{p.title}</h3>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-body text-[10px] capitalize">{p.category}</span>
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
                    <div
                      key={i}
                      className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => {
                        setForm({ ...form, content: t.prompt, title: t.title });
                        setShowForm(true);
                        setActiveTab("Journal");
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>{t.emoji}</span>
                        <h3 className="font-display text-sm text-foreground">{t.title}</h3>
                        <span className="ml-auto px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px] capitalize">{t.category}</span>
                      </div>
                      <p className="font-body text-sm text-muted-foreground">{t.prompt}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Journal;
