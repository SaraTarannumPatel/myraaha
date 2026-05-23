import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Zap, Check, Sparkles, RefreshCw, BookOpen, Brain, Target,
  Heart, Trophy, ChevronRight, Plus, Flame, Calendar, ArrowRight,
  MessageSquare, Star, TrendingUp, Users, Compass, Rocket, Send,
  Lightbulb, Shield, HandHeart
} from "lucide-react";

const challengeTemplates = [
  { type: "fear", title: "Face a Fear", description: "Identify one entrepreneurial fear and take one small step toward it today.", category: "resilience" },
  { type: "pitch", title: "60-Second Pitch", description: "Practice pitching your idea to someone in under 60 seconds.", category: "confidence" },
  { type: "failure", title: "Embrace Failure", description: "Write about a past failure and identify 3 lessons it taught you.", category: "resilience" },
  { type: "networking", title: "Cold Outreach", description: "Reach out to someone you admire. Ask them one question.", category: "growth_mindset" },
  { type: "gratitude", title: "Founder Gratitude", description: "Write 3 things about your entrepreneurial journey you're grateful for.", category: "mindfulness" },
  { type: "creativity", title: "Idea Sprint", description: "Set a timer for 10 minutes and generate 20 startup ideas. Don't filter.", category: "creativity" },
  { type: "resilience", title: "Resilience Journal", description: "Describe a challenging moment this week and how you overcame it.", category: "resilience" },
  { type: "growth", title: "Skill Stretch", description: "Learn something new today that's outside your comfort zone.", category: "growth_mindset" },
];

const mindsetPrinciples = [
  { icon: Brain, title: "Growth Mindset", description: "Believe abilities can be developed through dedication and hard work.", color: "text-blue-500" },
  { icon: Zap, title: "Experimentation Without Fear", description: "Treat every attempt as a learning experiment, not a pass/fail test.", color: "text-amber-500" },
  { icon: Target, title: "Problem-Solving Focus", description: "Train yourself to see problems as opportunities waiting to be solved.", color: "text-green-500" },
  { icon: Heart, title: "Emotional Resilience", description: "Build the capacity to bounce back from setbacks with clarity.", color: "text-rose-500" },
  { icon: Calendar, title: "Self-Discipline", description: "Create systems and routines that make consistent action effortless.", color: "text-purple-500" },
  { icon: Star, title: "Opportunity Recognition", description: "Develop the instinct to spot opportunities others overlook.", color: "text-cyan-500" },
];

const MindsetBuilder = () => {
  const { user, profile } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [reflection, setReflection] = useState("");
  const [habits, setHabits] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [trackProgress, setTrackProgress] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [newHabit, setNewHabit] = useState({ title: "", description: "", frequency: "daily", category: "discipline" });
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [activeTrack, setActiveTrack] = useState<any>(null);
  const [reflectionFeedback, setReflectionFeedback] = useState<any>(null);
  const [inlineReflection, setInlineReflection] = useState("");
  const [inlineMood, setInlineMood] = useState("");
  const [savingReflection, setSavingReflection] = useState(false);
  const [aiPaths, setAiPaths] = useState<any>(null);
  const [aiIntegrations, setAiIntegrations] = useState<any>(null);
  const [aiMentors, setAiMentors] = useState<any>(null);
  const [founderProfile, setFounderProfile] = useState<any>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [challengeRes, habitRes, trackRes, progressRes, completionRes, founderRes] = await Promise.all([
      supabase.from("mindset_challenges").select("*").eq("user_id", user!.id).order("started_at", { ascending: false }),
      supabase.from("mindset_habits").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("mindset_learning_tracks").select("*").order("created_at", { ascending: true }),
      supabase.from("learning_track_progress").select("*").eq("user_id", user!.id),
      supabase.from("habit_completions").select("*").eq("user_id", user!.id).order("completed_at", { ascending: false }).limit(50),
      supabase.from("founder_profiles").select("*").eq("user_id", user!.id).single(),
    ]);
    setChallenges(challengeRes.data || []);
    setActiveChallenge((challengeRes.data || []).find((c: any) => c.status === "active") || null);
    setHabits(habitRes.data || []);
    setTracks(trackRes.data || []);
    setTrackProgress(progressRes.data || []);
    setCompletions(completionRes.data || []);
    if (founderRes.data) setFounderProfile(founderRes.data);
    setLoading(false);
  };

  const startChallenge = async (template: typeof challengeTemplates[0]) => {
    const { data, error } = await supabase.from("mindset_challenges").insert({
      user_id: user!.id, challenge_type: template.type, title: template.title, description: template.description,
    }).select().single();
    if (error) { toast.error("Failed to start challenge"); return; }
    setActiveChallenge(data);
    fetchAll();
    toast.success("Challenge started! 💪");
  };

  const completeChallenge = async () => {
    if (!activeChallenge || !reflection.trim()) { toast.error("Add a reflection first"); return; }
    await supabase.from("mindset_challenges").update({
      status: "completed", reflection, completed_at: new Date().toISOString(),
    }).eq("id", activeChallenge.id);

    // Sync to journal
    await supabase.from("journal_entries").insert({
      user_id: user!.id,
      title: `Mindset Challenge: ${activeChallenge.title}`,
      content: reflection,
      tags: ["mindset-builder", "challenge", activeChallenge.challenge_type],
      intent: "entrepreneurship" as any,
    });

    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("mindset-coach", {
        body: { type: "reflection_feedback", context: { reflection, mood: "", challenge_type: activeChallenge.challenge_type } },
      });
      if (data && !data.error) setReflectionFeedback(data);
    } catch { /* silent */ }
    setAiLoading(false);

    setActiveChallenge(null);
    setReflection("");
    fetchAll();
    toast.success("Challenge completed! 🎉");
  };

  const addHabit = async () => {
    if (!newHabit.title.trim()) { toast.error("Enter a habit title"); return; }
    await supabase.from("mindset_habits").insert({ user_id: user!.id, ...newHabit });
    setNewHabit({ title: "", description: "", frequency: "daily", category: "discipline" });
    setShowHabitForm(false);
    fetchAll();
    toast.success("Habit added!");
  };

  const completeHabit = async (habit: any) => {
    const today = new Date().toDateString();
    const lastCompleted = habit.last_completed_at ? new Date(habit.last_completed_at).toDateString() : null;
    if (lastCompleted === today) { toast.info("Already completed today!"); return; }

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newStreak = lastCompleted === yesterday ? habit.streak + 1 : 1;

    await Promise.all([
      supabase.from("habit_completions").insert({ user_id: user!.id, habit_id: habit.id }),
      supabase.from("mindset_habits").update({
        streak: newStreak,
        best_streak: Math.max(newStreak, habit.best_streak || 0),
        last_completed_at: new Date().toISOString(),
      }).eq("id", habit.id),
    ]);
    fetchAll();
    toast.success(`${habit.title} completed! 🔥 Streak: ${newStreak}`);
  };

  const deleteHabit = async (id: string) => {
    await supabase.from("mindset_habits").delete().eq("id", id);
    fetchAll();
    toast.success("Habit removed");
  };

  const getAiSuggestions = async () => {
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("mindset-coach", {
        body: {
          type: "habit_suggestions",
          context: { industry: profile?.industry, goals: profile?.short_term_goals, areas: profile?.areas_of_focus },
        },
      });
      if (data?.habits) {
        for (const h of data.habits) {
          await supabase.from("mindset_habits").insert({ user_id: user!.id, ...h });
        }
        fetchAll();
        toast.success("AI habits added!");
      }
    } catch { toast.error("Failed to get suggestions"); }
    setAiLoading(false);
  };

  const getDailyPrompt = async () => {
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("mindset-coach", {
        body: {
          type: "daily_prompt",
          context: { name: profile?.full_name, industry: profile?.industry, challenges: challenges.slice(0, 3).map((c: any) => c.title) },
        },
      });
      if (data && !data.error) setAiPrompt(data);
    } catch { toast.error("Failed to get prompt"); }
    setAiLoading(false);
  };

  const startTrack = async (track: any) => {
    const existing = trackProgress.find((p: any) => p.track_id === track.id);
    if (existing) { setActiveTrack({ ...track, progress: existing }); return; }
    const { data } = await supabase.from("learning_track_progress").insert({
      user_id: user!.id, track_id: track.id, status: "in_progress",
    }).select().single();
    if (data) {
      setActiveTrack({ ...track, progress: data });
      fetchAll();
      toast.success("Learning track started!");
    }
  };

  const advanceModule = async () => {
    if (!activeTrack?.progress) return;
    const modules = activeTrack.modules || [];
    const next = (activeTrack.progress.current_module || 0) + 1;
    const isComplete = next >= modules.length;

    await supabase.from("learning_track_progress").update({
      current_module: next,
      status: isComplete ? "completed" : "in_progress",
      completed_at: isComplete ? new Date().toISOString() : null,
    }).eq("id", activeTrack.progress.id);

    if (isComplete) {
      toast.success("Track completed! 🎓");
      setActiveTrack(null);
    } else {
      setActiveTrack({ ...activeTrack, progress: { ...activeTrack.progress, current_module: next } });
      toast.success("Module completed!");
    }
    fetchAll();
  };

  const saveInlineReflection = async () => {
    if (!inlineReflection.trim()) { toast.error("Write something first"); return; }
    setSavingReflection(true);
    await supabase.from("journal_entries").insert({
      user_id: user!.id,
      title: `Mindset Reflection${inlineMood ? ` — Feeling ${inlineMood}` : ""}`,
      content: inlineReflection,
      mood: inlineMood || null,
      tags: ["mindset-builder", "reflection"],
      intent: "entrepreneurship" as any,
    });
    setInlineReflection("");
    setInlineMood("");
    setSavingReflection(false);
    toast.success("Reflection saved to your journal! 🌱");
  };

  const getAiLearningPaths = async () => {
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("mindset-coach", {
        body: {
          type: "learning_path_recommendations",
          context: {
            challengesCompleted: challenges.filter((c: any) => c.status === "completed").length,
            activeHabits: habits.filter((h: any) => h.is_active).length,
            habitCategories: [...new Set(habits.map((h: any) => h.category))],
            industry: profile?.industry,
            goals: profile?.short_term_goals,
            areasOfFocus: profile?.areas_of_focus,
            strengths: founderProfile?.strengths || [],
            weaknesses: founderProfile?.weaknesses || [],
          },
        },
      });
      if (data && !data.error) setAiPaths(data);
    } catch { toast.error("Failed to get recommendations"); }
    setAiLoading(false);
  };

  const getAiIntegrationSuggestions = async () => {
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("mindset-coach", {
        body: {
          type: "integration_suggestions",
          context: {
            challengesCompleted: challenges.filter((c: any) => c.status === "completed").length,
            habitsActive: habits.filter((h: any) => h.is_active).length,
            tracksCompleted: trackProgress.filter((p: any) => p.status === "completed").length,
            industry: profile?.industry,
            goals: profile?.short_term_goals,
          },
        },
      });
      if (data && !data.error) setAiIntegrations(data);
    } catch { toast.error("Failed to get suggestions"); }
    setAiLoading(false);
  };

  const getAiMentorSuggestions = async () => {
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("mindset-coach", {
        body: {
          type: "mentor_matching",
          context: {
            industry: profile?.industry,
            goals: profile?.short_term_goals,
            challenges: challenges.filter((c: any) => c.status === "completed").slice(0, 3).map((c: any) => c.title),
            strengths: founderProfile?.strengths || [],
            weaknesses: founderProfile?.weaknesses || [],
          },
        },
      });
      if (data && !data.error) setAiMentors(data);
    } catch { toast.error("Failed to get mentor suggestions"); }
    setAiLoading(false);
  };

  const completedCount = challenges.filter((c: any) => c.status === "completed").length;
  const totalHabitCompletions = completions.length;
  const activeHabitsCount = habits.filter((h: any) => h.is_active).length;
  const tracksCompleted = trackProgress.filter((p: any) => p.status === "completed").length;

  if (loading) return <div className="animate-pulse font-body text-muted-foreground text-center py-12">Loading...</div>;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Brain size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Mindset Builder</h1>
            <p className="font-body text-sm text-muted-foreground">Your ideas are ready — let's build the mindset to turn them into action.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Challenges Done", value: completedCount, icon: Trophy },
          { label: "Active Habits", value: activeHabitsCount, icon: Flame },
          { label: "Habit Check-ins", value: totalHabitCompletions, icon: Check },
          { label: "Tracks Completed", value: tracksCompleted, icon: BookOpen },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon size={18} className="mx-auto text-muted-foreground mb-1" />
            <p className="font-display text-2xl text-foreground">{s.value}</p>
            <p className="font-body text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Daily Prompt */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/30 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-foreground flex items-center gap-2"><Sparkles size={18} className="text-accent" /> Daily Mindset Prompt</h2>
          <Button onClick={getDailyPrompt} variant="outline" size="sm" disabled={aiLoading}>
            <RefreshCw size={14} className={aiLoading ? "animate-spin" : ""} /> {aiPrompt ? "Refresh" : "Get Prompt"}
          </Button>
        </div>
        {aiPrompt ? (
          <div className="space-y-3">
            <p className="font-body text-sm text-foreground">{aiPrompt.prompt}</p>
            {aiPrompt.exercise && (
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-body text-xs text-muted-foreground mb-1">Today's Exercise</p>
                <p className="font-body text-sm text-foreground">{aiPrompt.exercise}</p>
              </div>
            )}
            {aiPrompt.affirmation && (
              <p className="font-body text-sm italic text-accent">"{aiPrompt.affirmation}"</p>
            )}
          </div>
        ) : (
          <p className="font-body text-sm text-muted-foreground">Click "Get Prompt" to receive your personalized daily mindset exercise.</p>
        )}
      </motion.div>

      <Tabs defaultValue="principles" className="space-y-6">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="principles" className="font-body text-xs">Principles</TabsTrigger>
          <TabsTrigger value="habits" className="font-body text-xs">Habits</TabsTrigger>
          <TabsTrigger value="challenges" className="font-body text-xs">Challenges</TabsTrigger>
          <TabsTrigger value="tracks" className="font-body text-xs">Learning Tracks</TabsTrigger>
          <TabsTrigger value="reflections" className="font-body text-xs">Reflections</TabsTrigger>
          <TabsTrigger value="connect" className="font-body text-xs">Connect & Act</TabsTrigger>
          <TabsTrigger value="progress" className="font-body text-xs">Progress</TabsTrigger>
        </TabsList>

        {/* PRINCIPLES */}
        <TabsContent value="principles" className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Entrepreneurial Mindset Principles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mindsetPrinciples.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-3 mb-2">
                  <p.icon size={22} className={p.color} />
                  <h3 className="font-display text-lg text-foreground">{p.title}</h3>
                </div>
                <p className="font-body text-sm text-muted-foreground">{p.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-muted/50 rounded-xl p-5 border border-border">
            <h3 className="font-display text-lg text-foreground mb-2">Ready to practice?</h3>
            <p className="font-body text-sm text-muted-foreground mb-3">Start with a daily challenge or begin a structured learning track to deepen your mindset.</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => document.querySelector<HTMLButtonElement>('[data-value="challenges"]')?.click()}>
                <Zap size={14} /> Try a Challenge
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.querySelector<HTMLButtonElement>('[data-value="tracks"]')?.click()}>
                <BookOpen size={14} /> Start a Track
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* HABITS */}
        <TabsContent value="habits" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Daily & Weekly Habits</h2>
            <div className="flex gap-2">
              <Button onClick={getAiSuggestions} variant="outline" size="sm" disabled={aiLoading}>
                <Sparkles size={14} /> AI Suggest
              </Button>
              <Button onClick={() => setShowHabitForm(!showHabitForm)} size="sm" className="gradient-warm text-secondary-foreground">
                <Plus size={14} /> Add
              </Button>
            </div>
          </div>

          {showHabitForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5 space-y-3">
              <Input placeholder="Habit title" value={newHabit.title} onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })} />
              <Input placeholder="Description (optional)" value={newHabit.description} onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })} />
              <div className="flex gap-2">
                <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body" value={newHabit.frequency} onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-body" value={newHabit.category} onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}>
                  <option value="discipline">Discipline</option>
                  <option value="mindfulness">Mindfulness</option>
                  <option value="growth_mindset">Growth</option>
                  <option value="resilience">Resilience</option>
                  <option value="creativity">Creativity</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={addHabit} className="gradient-warm text-secondary-foreground">Save</Button>
                <Button onClick={() => setShowHabitForm(false)} variant="ghost">Cancel</Button>
              </div>
            </motion.div>
          )}

          {habits.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Flame className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No habits yet</h3>
              <p className="font-body text-muted-foreground mb-3">Build consistent routines to strengthen your mindset.</p>
              <Button onClick={getAiSuggestions} variant="outline" disabled={aiLoading}>
                <Sparkles size={14} /> Get AI-Suggested Habits
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((habit: any, i: number) => {
                const todayDone = habit.last_completed_at && new Date(habit.last_completed_at).toDateString() === new Date().toDateString();
                return (
                  <motion.div key={habit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className={`bg-card rounded-xl border p-4 flex items-center justify-between ${todayDone ? "border-accent/40 bg-accent/5" : "border-border"}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-base text-foreground">{habit.title}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{habit.frequency}</span>
                        {habit.streak > 0 && <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px]">🔥 {habit.streak}</span>}
                      </div>
                      {habit.description && <p className="font-body text-xs text-muted-foreground">{habit.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => completeHabit(habit)} variant={todayDone ? "ghost" : "outline"} size="sm" disabled={todayDone}>
                        <Check size={14} /> {todayDone ? "Done" : "Complete"}
                      </Button>
                      <Button onClick={() => deleteHabit(habit.id)} variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">×</Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* CHALLENGES */}
        <TabsContent value="challenges" className="space-y-4">
          {activeChallenge && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/30 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl text-foreground">Current Challenge</h2>
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-xs">Active</span>
              </div>
              <h3 className="font-display text-lg text-foreground">{activeChallenge.title}</h3>
              <p className="font-body text-sm text-muted-foreground">{activeChallenge.description}</p>
              <Textarea placeholder="Reflect on this challenge... What did you learn? How did it push you?" value={reflection} onChange={(e) => setReflection(e.target.value)} rows={4} />
              <Button onClick={completeChallenge} className="gradient-warm text-secondary-foreground" disabled={aiLoading}>
                <Check size={18} /> Complete Challenge
              </Button>
            </motion.div>
          )}

          {reflectionFeedback && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h3 className="font-display text-lg text-foreground flex items-center gap-2"><MessageSquare size={16} className="text-accent" /> AI Feedback</h3>
              {reflectionFeedback.encouragement && <p className="font-body text-sm text-foreground italic">"{reflectionFeedback.encouragement}"</p>}
              {reflectionFeedback.strengths_shown?.length > 0 && (
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-1">Strengths Shown</p>
                  <div className="flex flex-wrap gap-1">{reflectionFeedback.strengths_shown.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-xs">{s}</span>
                  ))}</div>
                </div>
              )}
              {reflectionFeedback.growth_areas?.length > 0 && (
                <div>
                  <p className="font-body text-xs text-muted-foreground mb-1">Growth Areas</p>
                  <div className="flex flex-wrap gap-1">{reflectionFeedback.growth_areas.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-xs">{s}</span>
                  ))}</div>
                </div>
              )}
              <Button onClick={() => setReflectionFeedback(null)} variant="ghost" size="sm">Dismiss</Button>
            </motion.div>
          )}

          <h2 className="font-display text-xl text-foreground">Resilience Challenges</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {challengeTemplates.map((template, i) => (
              <motion.div key={template.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display text-lg text-foreground">{template.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{template.category}</span>
                </div>
                <p className="font-body text-sm text-muted-foreground mb-3">{template.description}</p>
                <Button onClick={() => startChallenge(template)} disabled={!!activeChallenge} variant="outline" size="sm">
                  <Zap size={14} /> Start
                </Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* LEARNING TRACKS */}
        <TabsContent value="tracks" className="space-y-4">
          {/* AI-recommended paths */}
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Learning Tracks</h2>
            <Button onClick={getAiLearningPaths} variant="outline" size="sm" disabled={aiLoading}>
              <Sparkles size={14} /> AI-Recommended Paths
            </Button>
          </div>

          {aiPaths?.paths && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <h3 className="font-display text-base text-foreground flex items-center gap-2"><Lightbulb size={16} className="text-accent" /> Personalized for You</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {aiPaths.paths.map((path: any, i: number) => (
                  <div key={i} className="bg-accent/5 rounded-xl border border-accent/20 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display text-base text-foreground">{path.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{path.difficulty}</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mb-2">{path.description}</p>
                    <p className="font-body text-xs text-accent mb-2">Why: {path.why}</p>
                    {path.modules?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {path.modules.map((m: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{m}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTrack ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Button onClick={() => setActiveTrack(null)} variant="ghost" size="sm">← Back to tracks</Button>
              <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl text-foreground mb-1">{activeTrack.title}</h2>
                <p className="font-body text-sm text-muted-foreground mb-4">{activeTrack.description}</p>
                <Progress value={((activeTrack.progress?.current_module || 0) / (activeTrack.modules?.length || 1)) * 100} className="h-2 mb-4" />
                <p className="font-body text-xs text-muted-foreground mb-4">Module {(activeTrack.progress?.current_module || 0) + 1} of {activeTrack.modules?.length || 0}</p>

                {activeTrack.modules?.map((mod: any, i: number) => {
                  const current = activeTrack.progress?.current_module || 0;
                  const isActive = i === current;
                  const isDone = i < current;
                  return (
                    <div key={i} className={`p-4 rounded-lg mb-3 border ${isActive ? "border-accent bg-accent/5" : isDone ? "border-border bg-muted/30" : "border-border opacity-50"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {isDone ? <Check size={16} className="text-accent" /> : <ChevronRight size={16} className="text-muted-foreground" />}
                        <h4 className="font-display text-base text-foreground">{mod.title}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{mod.type}</span>
                      </div>
                      {isActive && <p className="font-body text-sm text-foreground mt-2">{mod.content}</p>}
                    </div>
                  );
                })}

                {(activeTrack.progress?.current_module || 0) < (activeTrack.modules?.length || 0) && (
                  <Button onClick={advanceModule} className="gradient-warm text-secondary-foreground mt-2">
                    <ArrowRight size={14} /> Complete Module
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <>
              <h3 className="font-display text-lg text-foreground">Structured Tracks</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {tracks.map((track: any, i: number) => {
                  const progress = trackProgress.find((p: any) => p.track_id === track.id);
                  const pct = progress ? ((progress.current_module || 0) / (track.modules?.length || 1)) * 100 : 0;
                  return (
                    <motion.div key={track.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-xl border border-border p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-base text-foreground">{track.title}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{track.difficulty}</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mb-3">{track.description}</p>
                      {progress && (
                        <div className="mb-3">
                          <Progress value={pct} className="h-1.5 mb-1" />
                          <p className="font-body text-[10px] text-muted-foreground">{progress.status === "completed" ? "✅ Completed" : `${Math.round(pct)}% done`}</p>
                        </div>
                      )}
                      <Button onClick={() => startTrack(track)} variant="outline" size="sm">
                        {progress?.status === "completed" ? <><Check size={14} /> Review</> : progress ? <><ArrowRight size={14} /> Continue</> : <><BookOpen size={14} /> Start</>}
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
              {tracks.length === 0 && (
                <div className="text-center py-8 bg-card rounded-xl border border-border">
                  <BookOpen className="mx-auto text-muted-foreground mb-3" size={40} />
                  <p className="font-body text-muted-foreground">No tracks available yet. Use AI-Recommended Paths above for personalized suggestions.</p>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* REFLECTIONS */}
        <TabsContent value="reflections" className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Motivation & Reflection</h2>

          {/* Inline journal */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-display text-base text-foreground flex items-center gap-2"><Send size={16} className="text-accent" /> Quick Reflection</h3>
            <div className="flex gap-2 flex-wrap">
              {["energized", "reflective", "stressed", "motivated", "uncertain"].map(m => (
                <button key={m} onClick={() => setInlineMood(m)}
                  className={`px-3 py-1 rounded-full font-body text-xs transition-all ${inlineMood === m ? "bg-primary/10 border border-primary/30 text-primary" : "bg-muted/30 hover:bg-muted/50 text-muted-foreground"}`}>
                  {m}
                </button>
              ))}
            </div>
            <Textarea placeholder="What's on your mind? How are you feeling about your growth today?" value={inlineReflection} onChange={(e) => setInlineReflection(e.target.value)} rows={3} />
            <Button onClick={saveInlineReflection} size="sm" disabled={savingReflection}>
              <Send size={14} /> {savingReflection ? "Saving..." : "Save to Journal"}
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              "What did you learn from your last failure?",
              "How did you push through self-doubt this week?",
              "What strengths did you use today to overcome a challenge?",
              "What is one risk you took recently and what happened?",
              "Who inspired you this week and why?",
              "What would you tell your future self about today?",
            ].map((prompt, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-4">
                <p className="font-body text-sm text-foreground mb-3">"{prompt}"</p>
                <Button variant="outline" size="sm" onClick={() => {
                  setInlineReflection(prev => prev ? prev + "\n\n" + prompt : prompt);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}>
                  <BookOpen size={14} /> Use This Prompt
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Past challenge reflections */}
          <h3 className="font-display text-lg text-foreground mt-6">Your Challenge Reflections</h3>
          {challenges.filter((c: any) => c.status === "completed" && c.reflection).length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">Complete challenges with reflections to see them here.</p>
          ) : (
            <div className="space-y-3">
              {challenges.filter((c: any) => c.status === "completed" && c.reflection).slice(0, 5).map((c: any) => (
                <div key={c.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-display text-base text-foreground">{c.title}</h4>
                    <span className="font-body text-xs text-muted-foreground">{new Date(c.completed_at).toLocaleDateString()}</span>
                  </div>
                  <p className="font-body text-sm text-foreground whitespace-pre-wrap">{c.reflection}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* CONNECT & ACT */}
        <TabsContent value="connect" className="space-y-6">
          <h2 className="font-display text-xl text-foreground">Connect & Take Action</h2>

          {/* Cross-module integration suggestions */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-foreground flex items-center gap-2"><Rocket size={18} className="text-accent" /> Apply Your Mindset</h3>
              <Button onClick={getAiIntegrationSuggestions} variant="outline" size="sm" disabled={aiLoading}>
                <Sparkles size={14} /> Get Suggestions
              </Button>
            </div>
            {aiIntegrations?.suggestions ? (
              <div className="space-y-3">
                {aiIntegrations.suggestions.map((s: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                    <div className={`px-2 py-0.5 rounded-full font-body text-[10px] ${s.priority === "high" ? "bg-destructive/10 text-destructive" : s.priority === "medium" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                      {s.priority}
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-sm text-foreground">{s.module}</p>
                      <p className="font-body text-xs text-muted-foreground">{s.action}</p>
                      <p className="font-body text-xs text-accent mt-1">{s.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Get AI-powered suggestions on how to apply your mindset learnings across the platform.</p>
            )}
          </div>

          {/* Quick navigation to connected modules */}
          <div className="grid md:grid-cols-3 gap-3">
            {[
              { label: "MVP Builders", desc: "Apply mindset to prototyping", icon: Rocket, to: "/dashboard/mvp-builder" },
              { label: "Startup Creation Lab", desc: "Turn mindset into action plans", icon: Target, to: "/dashboard/startup-lab" },
              { label: "Startup Showcase", desc: "Share your growth journey", icon: Star, to: "/dashboard/startup-showcase" },
              { label: "Startup Communities", desc: "Find peer accountability", icon: Users, to: "/dashboard/startup-communities" },
              { label: "Startup Support", desc: "Get mentorship & guidance", icon: HandHeart, to: "/dashboard/startup-support" },
              { label: "Founder Profiling", desc: "Track your mindset evolution", icon: Compass, to: "/dashboard/founder-profile" },
            ].map((link, i) => (
              <Link key={link.to} to={link.to}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-4 hover:border-accent/30 transition-colors cursor-pointer">
                  <link.icon size={18} className="text-accent mb-2" />
                  <h4 className="font-display text-sm text-foreground">{link.label}</h4>
                  <p className="font-body text-xs text-muted-foreground">{link.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Mentor suggestions */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-foreground flex items-center gap-2"><Shield size={18} className="text-accent" /> Mentor Guidance</h3>
              <Button onClick={getAiMentorSuggestions} variant="outline" size="sm" disabled={aiLoading}>
                <Sparkles size={14} /> Find Mentors
              </Button>
            </div>
            {aiMentors?.mentor_suggestions ? (
              <div className="space-y-3">
                {aiMentors.mentor_suggestions.map((m: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-lg bg-muted/30 border border-border">
                    <h4 className="font-display text-base text-foreground mb-1">{m.mentor_type}</h4>
                    <p className="font-body text-xs text-muted-foreground mb-2">{m.why_needed}</p>
                    {m.what_to_ask?.length > 0 && (
                      <div className="mb-2">
                        <p className="font-body text-xs text-accent mb-1">Questions to ask:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {m.what_to_ask.map((q: string, j: number) => (
                            <li key={j} className="font-body text-xs text-foreground">{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <p className="font-body text-[10px] text-muted-foreground">Where: {m.where_to_find}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground">Get personalized mentor recommendations based on your mindset challenges and growth areas.</p>
            )}
          </div>

          {/* Community sharing prompt */}
          <div className="bg-accent/5 rounded-xl border border-accent/20 p-5">
            <h3 className="font-display text-lg text-foreground mb-2 flex items-center gap-2"><Users size={18} /> Share with Your Community</h3>
            <p className="font-body text-sm text-muted-foreground mb-3">
              Share your mindset wins and struggles with peers. Building in public creates accountability and inspires others.
            </p>
            <div className="flex gap-2">
              <Link to="/dashboard/startup-communities">
                <Button variant="outline" size="sm"><Users size={14} /> Join a Community</Button>
              </Link>
              <Link to="/dashboard/journal">
                <Button variant="outline" size="sm"><BookOpen size={14} /> Open Journal</Button>
              </Link>
            </div>
          </div>
        </TabsContent>

        {/* PROGRESS */}
        <TabsContent value="progress" className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Your Mindset Evolution</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2"><TrendingUp size={18} /> Challenges</h3>
              <div className="space-y-2">
                <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Total Completed</span><span className="text-foreground">{completedCount}</span></div>
                <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Active</span><span className="text-foreground">{challenges.filter((c: any) => c.status === "active").length}</span></div>
                <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">With Reflections</span><span className="text-foreground">{challenges.filter((c: any) => c.reflection).length}</span></div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2"><Flame size={18} /> Habits</h3>
              <div className="space-y-2">
                <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Active Habits</span><span className="text-foreground">{activeHabitsCount}</span></div>
                <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Total Check-ins</span><span className="text-foreground">{totalHabitCompletions}</span></div>
                <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Best Streak</span><span className="text-foreground">{Math.max(0, ...habits.map((h: any) => h.best_streak || 0))}</span></div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2"><BookOpen size={18} /> Learning Tracks</h3>
              <div className="space-y-2">
                <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Tracks Started</span><span className="text-foreground">{trackProgress.length}</span></div>
                <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Tracks Completed</span><span className="text-foreground">{tracksCompleted}</span></div>
                <div className="flex justify-between font-body text-sm"><span className="text-muted-foreground">Available</span><span className="text-foreground">{tracks.length}</span></div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2"><ArrowRight size={18} /> Next Steps</h3>
              <div className="space-y-2">
                {completedCount === 0 && <p className="font-body text-sm text-muted-foreground">→ Complete your first challenge</p>}
                {activeHabitsCount === 0 && <p className="font-body text-sm text-muted-foreground">→ Add your first daily habit</p>}
                {tracksCompleted === 0 && <p className="font-body text-sm text-muted-foreground">→ Start a learning track</p>}
                {completedCount > 2 && <p className="font-body text-sm text-muted-foreground">→ Share your wins in Communities</p>}
                {activeHabitsCount > 0 && totalHabitCompletions < 7 && <p className="font-body text-sm text-muted-foreground">→ Build a 7-day habit streak</p>}
                {completedCount > 0 && activeHabitsCount > 0 && tracksCompleted > 0 && (
                  <p className="font-body text-sm text-accent">🎉 Great progress! Apply your mindset in MVP Builders next.</p>
                )}
              </div>
            </div>
          </div>

          {/* Founder profiling link */}
          <div className="bg-muted/50 rounded-xl p-5 border border-border">
            <h3 className="font-display text-lg text-foreground mb-2">Your Founder Profile</h3>
            <p className="font-body text-sm text-muted-foreground mb-3">
              Your challenges, habits, and reflections feed into your evolving Founder Profile — tracking resilience, confidence, and growth patterns.
            </p>
            <Link to="/dashboard/founder-profile">
              <Button variant="outline" size="sm"><Compass size={14} /> View Founder Profile</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MindsetBuilder;
