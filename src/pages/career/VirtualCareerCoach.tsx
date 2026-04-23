import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { streamChat } from "@/lib/streamChat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Bot, Send, Sparkles, Target, TrendingUp, RefreshCw, Brain,
  Heart, BookOpen, Users, Briefcase, Compass, Map, FileText,
  Zap, MessageSquare, Award, ArrowRight, RotateCcw, ChevronRight,
  Lightbulb, CheckCircle, AlertTriangle, Shield, PenLine, GraduationCap,
  Scale, Activity, Flame, Clock, Save, Star, UserPlus
} from "lucide-react";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";
import EntitlementBanner from "@/components/curiositycompass/EntitlementBanner";
import { useEntitlement } from "@/hooks/useAssessmentRewards";

type ChatMsg = { role: "user" | "assistant"; content: string };

const QUICK_TOPICS = [
  { label: "Choosing a career path", icon: Compass },
  { label: "Deciding between options", icon: Target },
  { label: "Understanding my skill gaps", icon: Zap },
  { label: "Staying motivated", icon: Heart },
  { label: "Preparing for applications", icon: Briefcase },
  { label: "Managing a career transition", icon: RotateCcw },
  { label: "I'm stuck and need help", icon: AlertTriangle },
];

const VirtualCareerCoach = () => {
  const { user, profile } = useAuth();
  const { active: coachUnlimited } = useEntitlement("ai_coach_unlimited_24h");
  const [activeTab, setActiveTab] = useState("coach");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [alignmentData, setAlignmentData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [rerouteData, setRerouteData] = useState<any>(null);
  const [backtrackData, setBacktrackData] = useState<any>(null);
  const [moodEnergyData, setMoodEnergyData] = useState<any>(null);
  const [learningSuggestions, setLearningSuggestions] = useState<any>(null);
  const [decisionData, setDecisionData] = useState<any>(null);
  const [reflectionAnalysis, setReflectionAnalysis] = useState<any>(null);
  const [loadingInsight, setLoadingInsight] = useState("");
  const [userContext, setUserContext] = useState<any>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionSaved, setSessionSaved] = useState(false);
  // Reflection form
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionExcitement, setReflectionExcitement] = useState("");
  const [reflectionAction, setReflectionAction] = useState("");
  const [reflectionHelped, setReflectionHelped] = useState("");
  // Decision dialogue form
  const [decisionQuestion, setDecisionQuestion] = useState("");
  const [decisionOptions, setDecisionOptions] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) fetchUserContext(); }, [user]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchUserContext = async () => {
    try {
      const [interestsRes, skillsRes, achievementsRes, checkinsRes, journalRes, energyRes] = await Promise.all([
        supabase.from("interests").select("name, category, strength").eq("user_id", user!.id).limit(20),
        supabase.from("skill_items").select("skill_name, status, confidence_score, category").eq("user_id", user!.id).limit(30),
        supabase.from("achievements").select("title, achievement_type, earned_at").eq("user_id", user!.id).order("earned_at", { ascending: false }).limit(10),
        supabase.from("coaching_checkins").select("mood, energy, confidence, created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("journal_entries").select("id, mood, tags, created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("energy_zones").select("domain, energy_level, engagement_score, mood_before, mood_after").eq("user_id", user!.id).order("recorded_at", { ascending: false }).limit(10),
      ]);

      const checkins = checkinsRes.data || [];
      const latestCheckin = checkins[0];
      const skills = skillsRes.data || [];
      const energyZones = energyRes.data || [];
      const journalEntries = journalRes.data || [];

      const ctx = {
        name: profile?.full_name || "Explorer",
        intent: profile?.active_intent || "career",
        userType: profile?.user_type || "student",
        industry: profile?.industry || "exploring",
        careerStage: profile?.career_stage || profile?.user_type || "early",
        skills: skills.map((s: any) => s.skill_name),
        skillsInProgress: skills.filter((s: any) => s.status === "in_progress").map((s: any) => s.skill_name),
        completedSkills: skills.filter((s: any) => s.status === "completed").length,
        interests: (interestsRes.data || []).map((i: any) => i.name),
        mood: latestCheckin?.mood || "neutral",
        energy: latestCheckin?.energy || "moderate",
        shortTermGoals: profile?.short_term_goals || "",
        longTermGoals: profile?.long_term_goals || "",
        completedProjects: 0,
        recentAchievements: (achievementsRes.data || []).map((a: any) => a.title),
        roadmapPhase: "exploration",
        journalEntries: journalEntries.length,
        energyZones: energyZones.map((e: any) => ({ domain: e.domain, energy: e.energy_level, engagement: e.engagement_score })),
        moodData: checkins.map((c: any) => ({ mood: c.mood, energy: c.energy, confidence: c.confidence, date: c.created_at })),
        roadmapMilestonesCompleted: 0,
        totalRoadmapMilestones: 0,
        roadmapProgress: 0,
        skillsCount: skills.length,
        checkins,
      };
      setUserContext(ctx);

      setMessages([{
        role: "assistant",
        content: `Welcome back, **${ctx.name}**! 🌟\n\nNeed help? Let's figure this out together. Your career journey is unique — and I'm here to guide you every step of the way.\n\nWhat would you like to work on today? You can pick a topic below or just tell me what's on your mind.`
      }]);
    } catch (e) { console.error(e); }
  };

  const saveSession = useCallback(async () => {
    if (!user || messages.length < 3 || sessionSaved) return;
    try {
      const title = messages.find(m => m.role === "user")?.content?.slice(0, 60) || "Coaching Session";
      if (sessionId) {
        await supabase.from("coaching_sessions").update({ messages: messages as any, updated_at: new Date().toISOString() }).eq("id", sessionId);
      } else {
        const { data } = await supabase.from("coaching_sessions").insert({
          user_id: user.id,
          title,
          messages: messages as any,
          mood: userContext.mood,
          topic: messages.find(m => m.role === "user")?.content?.slice(0, 100),
        }).select("id").single();
        if (data) setSessionId(data.id);
      }
      setSessionSaved(true);
      toast.success("Session saved!");
    } catch { toast.error("Failed to save session"); }
  }, [user, messages, sessionId, sessionSaved, userContext.mood]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isStreaming) return;
    if (!coachUnlimited) {
      const userMsgCount = messages.filter((m) => m.role === "user").length;
      if (userMsgCount >= 6) {
        toast.info("You've hit the free limit. Unlock unlimited coach chats from Curiosity Compass rewards.");
        return;
      }
    }
    setInput("");
    setSessionSaved(false);

    const userMsg: ChatMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg].map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    try {
      await streamChat({
        messages: allMessages,
        context: userContext,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
            }
            return [...prev, { role: "assistant", content: assistantSoFar }];
          });
        },
        onDone: () => setIsStreaming(false),
        onError: (err) => { toast.error(err); setIsStreaming(false); },
      });
    } catch { toast.error("Failed to connect to coach"); setIsStreaming(false); }
  };

  const fetchInsight = async (type: string, extraContext?: any) => {
    setLoadingInsight(type);
    try {
      const { data, error } = await supabase.functions.invoke("career-coach-insights", {
        body: {
          type,
          context: {
            ...userContext,
            goals: userContext.shortTermGoals,
            completedTasks: 0,
            activeProjects: userContext.completedProjects,
            learningStreak: 0,
            alignmentScore: alignmentData?.overall_score || 50,
            weakAreas: alignmentData?.factors?.filter((f: any) => f.status === "red").map((f: any) => f.name) || [],
            recentActivity: "moderate",
            feeling: "uncertain",
            pastAchievements: userContext.recentAchievements || [],
            achievements: userContext.recentAchievements?.length || 0,
            daysActive: 7,
            projectsDone: userContext.completedProjects,
            recentInterests: userContext.interests?.slice(0, 5) || [],
            recentLearning: userContext.skillsInProgress || [],
            ...extraContext,
          },
        },
      });
      if (error) throw error;
      if (type === "alignment_score") setAlignmentData(data);
      if (type === "progress_snapshot") setProgressData(data);
      if (type === "reroute") setRerouteData(data);
      if (type === "backtrack_paths") setBacktrackData(data);
      if (type === "mood_energy_insights") setMoodEnergyData(data);
      if (type === "learning_suggestions") setLearningSuggestions(data);
      if (type === "decision_dialogue") setDecisionData(data);
      if (type === "reflection_analysis") setReflectionAnalysis(data);
    } catch (e: any) { toast.error(e.message || "Failed to get insights"); }
    setLoadingInsight("");
  };

  const submitReflection = async () => {
    if (!reflectionText.trim()) return;
    await fetchInsight("reflection_analysis", {
      reflection: reflectionText,
      excitement: reflectionExcitement,
      todayAction: reflectionAction,
      whatHelped: reflectionHelped,
    });
    // Save to journal
    if (user) {
      await supabase.from("journal_entries").insert({
        user_id: user.id,
        content: `**Coaching Reflection**\n\n${reflectionText}\n\n**What excites me:** ${reflectionExcitement}\n**Action for today:** ${reflectionAction}\n**What helped:** ${reflectionHelped}`,
        title: "Career Coach Reflection",
        mood: userContext.mood,
        tags: ["coaching", "reflection"],
        intent: "career" as any,
      });
    }
  };

  const submitDecision = () => {
    if (!decisionQuestion.trim()) return;
    const opts = decisionOptions.split(",").map(o => o.trim()).filter(Boolean);
    fetchInsight("decision_dialogue", { decision: decisionQuestion, options: opts });
  };

  const statusColor = (s: string) => s === "green" || s === "on_track" ? "text-emerald-600" : s === "yellow" || s === "some_gaps" ? "text-amber-500" : "text-destructive";
  const statusBg = (s: string) => s === "green" || s === "on_track" ? "bg-emerald-500" : s === "yellow" || s === "some_gaps" ? "bg-amber-500" : "bg-destructive";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10"><Bot className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-display text-foreground">Virtual Career Coach</h1>
            <p className="text-sm text-muted-foreground font-body">AI-powered guidance for your unique career journey</p>
          </div>
        </div>
        <ModuleSearchBar
          placeholder="Search career topics, domains, roles..."
          sources={["careers", "domains", "jobs"]}
          compact
          showAiBadge
          onSelect={(item) => {
            sendMessage(`Tell me about ${item.title} as a career path`);
          }}
        />
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex overflow-x-auto w-full gap-1">
          <TabsTrigger value="coach" className="text-xs">💬 Coach</TabsTrigger>
          <TabsTrigger value="alignment" className="text-xs">🎯 Alignment</TabsTrigger>
          <TabsTrigger value="progress" className="text-xs">📊 Progress</TabsTrigger>
          <TabsTrigger value="reroute" className="text-xs">🔄 Re-route</TabsTrigger>
          <TabsTrigger value="reflect" className="text-xs">🪞 Reflect</TabsTrigger>
          <TabsTrigger value="learn" className="text-xs">📚 Learn</TabsTrigger>
          <TabsTrigger value="decide" className="text-xs">⚖️ Decide</TabsTrigger>
        </TabsList>

        {/* === COACH CHAT TAB === */}
        <TabsContent value="coach" className="space-y-4">
          <EntitlementBanner entitlementKey="ai_coach_unlimited_24h" rewardLabel="Unlimited AI Career Coach (24h)" unlockedMessage="Unlimited AI Career Coach is active." />
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map(topic => (
              <button key={topic.label} onClick={() => sendMessage(topic.label)} disabled={isStreaming}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-body text-xs hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50">
                <topic.icon className="h-3 w-3" />{topic.label}
              </button>
            ))}
          </div>

          <Card className="border-border/50">
            <div ref={chatContainerRef} className="h-[300px] sm:h-[450px] overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className="max-w-[85%]">
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">Career Coach</span>
                        </div>
                      )}
                      <div className={`p-3 rounded-xl text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                        ) : msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-border p-3 flex gap-2">
              <Textarea placeholder="Ask anything about your career journey..." value={input} onChange={e => setInput(e.target.value)} rows={1} className="resize-none min-h-[40px]"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} disabled={isStreaming} />
              <Button onClick={() => sendMessage()} disabled={isStreaming || !input.trim()} size="icon" className="shrink-0"><Send className="h-4 w-4" /></Button>
            </div>
          </Card>

          {/* Save & Connected Features */}
          <div className="flex items-center gap-2 flex-wrap">
            {messages.length > 2 && (
              <Button variant="outline" size="sm" onClick={saveSession} disabled={sessionSaved} className="gap-1.5">
                <Save className="h-3.5 w-3.5" />{sessionSaved ? "Saved ✓" : "Save Session"}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { label: "SkillStacker", icon: Zap, path: "/dashboard/skill-stacker" },
              { label: "Roadmap", icon: Map, path: "/dashboard/roadmap" },
              { label: "SelfGraph", icon: Brain, path: "/dashboard/selfgraph" },
              { label: "Job Matching", icon: Briefcase, path: "/dashboard/job-matching" },
              { label: "Mentors", icon: UserPlus, path: "/dashboard/mentor-matchmaking" },
            ].map(link => (
              <a key={link.label} href={link.path} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground">
                <link.icon className="h-4 w-4 text-primary" />{link.label}<ChevronRight className="h-3 w-3 ml-auto" />
              </a>
            ))}
          </div>
        </TabsContent>

        {/* === ALIGNMENT TAB === */}
        <TabsContent value="alignment" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Decision Alignment Score</CardTitle>
              <CardDescription>See how aligned your current choices are with your goals, skills, and emotional state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => fetchInsight("alignment_score")} disabled={!!loadingInsight} className="gap-2">
                {loadingInsight === "alignment_score" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loadingInsight === "alignment_score" ? "Calculating..." : "Calculate My Score"}
              </Button>
              {alignmentData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="text-center p-6 rounded-xl bg-secondary/50 border border-border/50">
                    <div className={`text-5xl font-display font-bold ${statusColor(alignmentData.status)}`}>{alignmentData.overall_score}%</div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className={`w-3 h-3 rounded-full ${statusBg(alignmentData.status)}`} />
                      <span className="text-sm font-medium text-foreground capitalize">{alignmentData.status?.replace("_", " ")}</span>
                    </div>
                  </div>
                  {alignmentData.factors?.map((factor: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">{factor.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${statusColor(factor.status)}`}>{factor.score}%</span>
                          <div className={`w-2.5 h-2.5 rounded-full ${statusBg(factor.status)}`} />
                        </div>
                      </div>
                      <Progress value={factor.score} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">{factor.detail}</p>
                    </div>
                  ))}
                  {alignmentData.top_strength && <div className="p-3 rounded-lg bg-primary/5 border border-primary/20"><p className="text-sm"><strong>💪 Strength:</strong> {alignmentData.top_strength}</p></div>}
                  {alignmentData.biggest_gap && <div className="p-3 rounded-lg bg-accent/10 border border-accent/30"><p className="text-sm"><strong>🔍 Focus Area:</strong> {alignmentData.biggest_gap}</p></div>}
                  {alignmentData.recommendation && <div className="p-3 rounded-lg bg-secondary/50"><p className="text-sm text-foreground">{alignmentData.recommendation}</p></div>}
                  {alignmentData.encouragement && <p className="text-sm italic text-muted-foreground">✨ {alignmentData.encouragement}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === PROGRESS TAB (with Mood & Energy Insights) === */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Progress Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => fetchInsight("progress_snapshot")} disabled={!!loadingInsight} className="gap-2">
                {loadingInsight === "progress_snapshot" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                {loadingInsight === "progress_snapshot" ? "Analyzing..." : "Get Progress Snapshot"}
              </Button>
              {progressData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20"><p className="text-sm text-foreground">{progressData.growth_summary}</p></div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: progressData.skills_developed || 0, label: "Skills Built" },
                      { val: progressData.tasks_completed || 0, label: "Tasks Done" },
                      { val: progressData.mood_trend === "improving" ? "↑" : progressData.mood_trend === "declining" ? "↓" : "→", label: "Mood Trend", color: progressData.mood_trend === "improving" ? "text-emerald-600" : progressData.mood_trend === "declining" ? "text-destructive" : "text-foreground" },
                    ].map((s, i) => (
                      <div key={i} className="text-center p-3 rounded-lg bg-secondary/50">
                        <p className={`text-2xl font-display font-bold ${s.color || "text-foreground"}`}>{s.val}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {progressData.highlights?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">🏆 Highlights</h4>
                      {progressData.highlights.map((h: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> {h}</div>
                      ))}
                    </div>
                  )}
                  {progressData.next_milestones?.map((m: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm"><span className="text-foreground">{m.title}</span><span className="text-primary font-medium">{m.progress}%</span></div>
                      <Progress value={m.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">{m.steps_remaining}</p>
                    </div>
                  ))}
                  {progressData.motivation_message && <div className="p-3 rounded-lg bg-accent/10 border border-accent/30"><p className="text-sm italic text-foreground">✨ {progressData.motivation_message}</p></div>}
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Mood & Energy Insights */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Mood & Energy Insights</CardTitle>
              <CardDescription>Understand your emotional patterns and energy levels to optimize your career growth.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => fetchInsight("mood_energy_insights")} disabled={!!loadingInsight} variant="outline" className="gap-2">
                {loadingInsight === "mood_energy_insights" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                Analyze My Patterns
              </Button>
              {moodEnergyData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20"><p className="text-sm text-foreground">{moodEnergyData.mood_summary}</p></div>
                  {moodEnergyData.energy_patterns?.map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                      <div className="shrink-0">
                        <Flame className={`h-5 w-5 ${p.trend === "rising" ? "text-emerald-500" : p.trend === "declining" ? "text-destructive" : "text-amber-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between"><span className="text-sm font-medium text-foreground">{p.domain}</span><Badge variant="outline" className="text-xs capitalize">{p.trend}</Badge></div>
                        <Progress value={p.avg_energy * 10} className="h-1.5 mt-1" />
                        <p className="text-xs text-muted-foreground mt-1">{p.insight}</p>
                      </div>
                    </div>
                  ))}
                  {moodEnergyData.peak_performance && <div className="p-3 rounded-lg bg-primary/5 border border-primary/20"><p className="text-sm"><strong>🔥 Peak Performance:</strong> {moodEnergyData.peak_performance}</p></div>}
                  {moodEnergyData.low_energy_advice && <div className="p-3 rounded-lg bg-accent/10 border border-accent/30"><p className="text-sm"><strong>🔋 Low Energy Tip:</strong> {moodEnergyData.low_energy_advice}</p></div>}
                  {moodEnergyData.wellbeing_tips?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">💚 Wellbeing Tips</h4>
                      {moodEnergyData.wellbeing_tips.map((t: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1"><Heart className="h-3.5 w-3.5 text-primary shrink-0" /> {t}</div>
                      ))}
                    </div>
                  )}
                  {moodEnergyData.encouragement && <p className="text-sm italic text-muted-foreground">✨ {moodEnergyData.encouragement}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === RE-ROUTE TAB === */}
        <TabsContent value="reroute" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><RotateCcw className="h-5 w-5 text-primary" /> Career Re-routing & Backtrack Paths</CardTitle>
              <CardDescription>Feeling misaligned or stuck? Get alternate paths and safe backtrack options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => fetchInsight("reroute")} disabled={!!loadingInsight} className="gap-2">
                  {loadingInsight === "reroute" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}Get Alternate Paths
                </Button>
                <Button onClick={() => fetchInsight("backtrack_paths")} disabled={!!loadingInsight} variant="outline" className="gap-2">
                  {loadingInsight === "backtrack_paths" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}Safe Backtrack Options
                </Button>
              </div>
              {rerouteData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20"><p className="text-sm text-foreground">{rerouteData.reroute_summary}</p></div>
                  {rerouteData.quick_wins?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">⚡ Quick Wins (Do Today)</h4>
                      {rerouteData.quick_wins.map((w: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1.5"><ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" /> {w}</div>
                      ))}
                    </div>
                  )}
                  {rerouteData.alternate_paths?.map((path: any, i: number) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-foreground">{path.title}</h4>
                          <Badge variant="outline" className="text-xs capitalize">{path.type}</Badge>
                          <Badge variant="secondary" className="text-xs">{path.effort}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{path.description}</p>
                        <p className="text-xs text-primary">Impact: {path.expected_impact}</p>
                      </CardContent>
                    </Card>
                  ))}
                  {rerouteData.adjusted_milestones?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">📌 Adjusted Milestones</h4>
                      {rerouteData.adjusted_milestones.map((m: any, i: number) => (
                        <div key={i} className="p-2 rounded-lg bg-secondary/50 mb-2">
                          <p className="text-sm font-medium text-foreground">{m.milestone}</p>
                          <p className="text-xs text-muted-foreground">Timeline: {m.adjusted_timeline} — {m.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {rerouteData.encouragement && <p className="text-sm italic text-muted-foreground">✨ {rerouteData.encouragement}</p>}
                </motion.div>
              )}
              {backtrackData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-4">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/30"><p className="text-sm text-foreground">{backtrackData.empathy_message}</p></div>
                  {backtrackData.step_back_tasks?.map((task: any, i: number) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-3 space-y-1">
                        <h4 className="text-sm font-medium text-foreground">{task.title}</h4>
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                        <p className="text-xs text-primary">💡 {task.why_it_helps}</p>
                        <Badge variant="secondary" className="text-xs">{task.duration}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                  {backtrackData.re_engagement_ideas?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">🔄 Re-engagement Ideas</h4>
                      {backtrackData.re_engagement_ideas.map((idea: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1"><Lightbulb className="h-3.5 w-3.5 text-accent shrink-0" /> {idea}</div>
                      ))}
                    </div>
                  )}
                  {backtrackData.past_wins_to_revisit?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">🏆 Past Wins to Revisit</h4>
                      {backtrackData.past_wins_to_revisit.map((w: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1"><Star className="h-3.5 w-3.5 text-amber-500 shrink-0" /> {w}</div>
                      ))}
                    </div>
                  )}
                  {backtrackData.gentle_next_step && <div className="p-3 rounded-lg bg-primary/5 border border-primary/20"><p className="text-sm text-foreground"><strong>Next step:</strong> {backtrackData.gentle_next_step}</p></div>}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === REFLECTION TAB === */}
        <TabsContent value="reflect" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><PenLine className="h-5 w-5 text-primary" /> Guided Reflection</CardTitle>
              <CardDescription>Reflect on your coaching session and set intentions for growth.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">What's on your mind? What did you learn?</label>
                  <Textarea value={reflectionText} onChange={e => setReflectionText(e.target.value)} placeholder="Share your thoughts..." rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">✨ What excites you most right now?</label>
                  <Textarea value={reflectionExcitement} onChange={e => setReflectionExcitement(e.target.value)} placeholder="What energizes you?" rows={2} className="min-h-[60px]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">🎯 What's one action you can take today?</label>
                  <Textarea value={reflectionAction} onChange={e => setReflectionAction(e.target.value)} placeholder="One small step..." rows={1} className="min-h-[40px]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">💪 What helped you move forward?</label>
                  <Textarea value={reflectionHelped} onChange={e => setReflectionHelped(e.target.value)} placeholder="A conversation, a resource, an insight..." rows={1} className="min-h-[40px]" />
                </div>
                <Button onClick={submitReflection} disabled={!reflectionText.trim() || !!loadingInsight} className="gap-2">
                  {loadingInsight === "reflection_analysis" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {loadingInsight === "reflection_analysis" ? "Analyzing..." : "Get AI Feedback"}
                </Button>
              </div>

              {reflectionAnalysis && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-2">
                  {reflectionAnalysis.growth_note && <div className="p-4 rounded-xl bg-primary/5 border border-primary/20"><p className="text-sm text-foreground">{reflectionAnalysis.growth_note}</p></div>}
                  {reflectionAnalysis.strengths_identified?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">💪 Strengths Identified</h4>
                      <div className="flex flex-wrap gap-2">{reflectionAnalysis.strengths_identified.map((s: string, i: number) => <Badge key={i} variant="secondary">{s}</Badge>)}</div>
                    </div>
                  )}
                  {reflectionAnalysis.skills_to_build?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">📈 Skills to Build</h4>
                      <div className="flex flex-wrap gap-2">{reflectionAnalysis.skills_to_build.map((s: string, i: number) => <Badge key={i} variant="outline">{s}</Badge>)}</div>
                    </div>
                  )}
                  {reflectionAnalysis.next_actions?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">🚀 Recommended Actions</h4>
                      {reflectionAnalysis.next_actions.map((a: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 mb-2">
                          <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{a.action}</p>
                            <div className="flex gap-1.5 mt-1">
                              <Badge variant="outline" className="text-xs capitalize">{a.category}</Badge>
                              <Badge variant={a.priority === "high" ? "destructive" : "secondary"} className="text-xs">{a.priority}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {reflectionAnalysis.encouragement && <p className="text-sm italic text-muted-foreground">✨ {reflectionAnalysis.encouragement}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === LEARN TAB (Learning & Mentor Suggestions) === */}
        <TabsContent value="learn" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Learning & Connection Suggestions</CardTitle>
              <CardDescription>Personalized courses, projects, mentor topics, and peer activities based on your journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => fetchInsight("learning_suggestions")} disabled={!!loadingInsight} className="gap-2">
                {loadingInsight === "learning_suggestions" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                {loadingInsight === "learning_suggestions" ? "Generating..." : "Get Suggestions"}
              </Button>
              {learningSuggestions && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {learningSuggestions.learning_paths?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">📚 Learning Paths</h4>
                      {learningSuggestions.learning_paths.map((lp: any, i: number) => (
                        <Card key={i} className="border-border/50 mb-2">
                          <CardContent className="p-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-foreground">{lp.title}</h4>
                              <Badge variant="outline" className="text-xs capitalize">{lp.type}</Badge>
                              <Badge variant="secondary" className="text-xs">{lp.effort}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{lp.description}</p>
                            <p className="text-xs text-primary">Why: {lp.relevance}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {learningSuggestions.skill_gaps_to_address?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">🔧 Skill Gaps to Address</h4>
                      {learningSuggestions.skill_gaps_to_address.map((sg: any, i: number) => (
                        <div key={i} className="p-2 rounded-lg bg-secondary/50 mb-2">
                          <div className="flex items-center gap-2"><span className="text-sm font-medium text-foreground">{sg.skill}</span><Badge variant="outline" className="text-xs capitalize">{sg.current_level}</Badge></div>
                          <p className="text-xs text-muted-foreground mt-1">{sg.recommended_action}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {learningSuggestions.mentor_topics?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">🧑‍🏫 Discuss with a Mentor</h4>
                      {learningSuggestions.mentor_topics.map((t: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1"><UserPlus className="h-3.5 w-3.5 text-primary shrink-0" /> {t}</div>
                      ))}
                      <a href="/dashboard/mentor-matchmaking" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"><Users className="h-3 w-3" /> Find a Mentor <ChevronRight className="h-3 w-3" /></a>
                    </div>
                  )}
                  {learningSuggestions.peer_activities?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">👥 Peer Activities</h4>
                      {learningSuggestions.peer_activities.map((a: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1"><Users className="h-3.5 w-3.5 text-accent shrink-0" /> {a}</div>
                      ))}
                      <a href="/dashboard/peer-circles" className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"><MessageSquare className="h-3 w-3" /> Join a Peer Circle <ChevronRight className="h-3 w-3" /></a>
                    </div>
                  )}
                  {learningSuggestions.encouragement && <p className="text-sm italic text-muted-foreground">✨ {learningSuggestions.encouragement}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === DECISION DIALOGUE TAB === */}
        <TabsContent value="decide" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2"><Scale className="h-5 w-5 text-primary" /> Decision Dialogue</CardTitle>
              <CardDescription>Weigh your options with a data-informed pros/cons analysis based on your skills and goals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">What decision are you trying to make?</label>
                  <Textarea value={decisionQuestion} onChange={e => setDecisionQuestion(e.target.value)} placeholder="e.g., Should I switch to data science or continue with web dev?" rows={2} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Options (comma-separated)</label>
                  <Textarea value={decisionOptions} onChange={e => setDecisionOptions(e.target.value)} placeholder="e.g., Data Science, Web Development, UX Design" rows={1} className="min-h-[40px]" />
                </div>
                <Button onClick={submitDecision} disabled={!decisionQuestion.trim() || !!loadingInsight} className="gap-2">
                  {loadingInsight === "decision_dialogue" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
                  {loadingInsight === "decision_dialogue" ? "Analyzing..." : "Analyze Options"}
                </Button>
              </div>
              {decisionData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-2">
                  {decisionData.decision_summary && <div className="p-4 rounded-xl bg-primary/5 border border-primary/20"><p className="text-sm text-foreground">{decisionData.decision_summary}</p></div>}
                  {decisionData.options_analysis?.map((opt: any, i: number) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-foreground">{opt.option}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-display font-bold ${opt.fit_score >= 70 ? "text-emerald-600" : opt.fit_score >= 40 ? "text-amber-500" : "text-destructive"}`}>{opt.fit_score}%</span>
                            <span className="text-xs text-muted-foreground">fit</span>
                          </div>
                        </div>
                        <Progress value={opt.fit_score} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">{opt.fit_reason}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-medium text-emerald-600 mb-1">✅ Pros</p>
                            {opt.pros?.map((p: string, j: number) => <p key={j} className="text-xs text-foreground mb-0.5">• {p}</p>)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-destructive mb-1">⚠️ Cons</p>
                            {opt.cons?.map((c: string, j: number) => <p key={j} className="text-xs text-foreground mb-0.5">• {c}</p>)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {decisionData.recommendation && <div className="p-3 rounded-lg bg-secondary/50"><p className="text-sm text-foreground"><strong>💡 Recommendation:</strong> {decisionData.recommendation}</p></div>}
                  {decisionData.key_questions?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">🤔 Questions to Consider</h4>
                      {decisionData.key_questions.map((q: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1.5"><Lightbulb className="h-3.5 w-3.5 text-accent shrink-0" /> {q}</div>
                      ))}
                    </div>
                  )}
                  {decisionData.encouragement && <p className="text-sm italic text-muted-foreground">✨ {decisionData.encouragement}</p>}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VirtualCareerCoach;
