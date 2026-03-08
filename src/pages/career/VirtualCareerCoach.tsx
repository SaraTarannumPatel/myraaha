import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { streamChat } from "@/lib/streamChat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Bot, Send, Sparkles, Target, TrendingUp, RefreshCw, Brain,
  Heart, BookOpen, Users, Briefcase, Compass, Map, FileText,
  Zap, MessageSquare, Award, ArrowRight, RotateCcw, ChevronRight,
  Lightbulb, CheckCircle, AlertTriangle, Shield
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState("coach");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [alignmentData, setAlignmentData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [rerouteData, setRerouteData] = useState<any>(null);
  const [backtrackData, setBacktrackData] = useState<any>(null);
  const [loadingInsight, setLoadingInsight] = useState("");
  const [userContext, setUserContext] = useState<any>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) fetchUserContext(); }, [user]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchUserContext = async () => {
    try {
      const [interestsRes, skillsRes, achievementsRes, checkinsRes] = await Promise.all([
        supabase.from("interests").select("name, category").eq("user_id", user!.id).limit(20),
        supabase.from("skill_items").select("skill_name, status, confidence_score").eq("user_id", user!.id).limit(30),
        supabase.from("achievements").select("title").eq("user_id", user!.id).order("earned_at", { ascending: false }).limit(5),
        supabase.from("coaching_checkins").select("mood, energy, confidence").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1),
      ]);

      const latestCheckin = (checkinsRes.data || [])[0];
      const ctx = {
        name: profile?.full_name || "Explorer",
        intent: profile?.active_intent || "career",
        userType: profile?.user_type || "student",
        industry: profile?.industry_interest || "exploring",
        careerStage: profile?.user_type || "early",
        skills: (skillsRes.data || []).map((s: any) => s.skill_name),
        skillsInProgress: (skillsRes.data || []).filter((s: any) => s.status === "in_progress").map((s: any) => s.skill_name),
        interests: (interestsRes.data || []).map((i: any) => i.name),
        mood: latestCheckin?.mood || "neutral",
        energy: latestCheckin?.energy || "moderate",
        shortTermGoals: profile?.short_term_goals || "",
        longTermGoals: profile?.long_term_goals || "",
        completedProjects: 0,
        recentAchievements: (achievementsRes.data || []).map((a: any) => a.title),
        roadmapPhase: "exploration",
      };
      setUserContext(ctx);

      // Set welcome message
      setMessages([{
        role: "assistant",
        content: `Welcome back, **${ctx.name}**! 🌟\n\nNeed help? Let's figure this out together. Your career journey is unique — and I'm here to guide you every step of the way.\n\nWhat would you like to work on today? You can pick a topic below or just tell me what's on your mind.`
      }]);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isStreaming) return;
    setInput("");

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
        onError: (err) => {
          toast.error(err);
          setIsStreaming(false);
        },
      });
    } catch (e) {
      toast.error("Failed to connect to coach");
      setIsStreaming(false);
    }
  };

  const fetchInsight = async (type: string) => {
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
            roadmapProgress: 0,
            skillsCount: userContext.skills?.length || 0,
            completedSkills: 0,
            projectsDone: userContext.completedProjects,
            journalEntries: 0,
            achievements: userContext.recentAchievements?.length || 0,
            daysActive: 7,
            alignmentScore: alignmentData?.overall_score || 50,
            weakAreas: alignmentData?.factors?.filter((f: any) => f.status === "red").map((f: any) => f.name) || [],
            recentActivity: "moderate",
            feeling: "uncertain",
            pastAchievements: userContext.recentAchievements || [],
          },
        },
      });
      if (error) throw error;
      if (type === "alignment_score") setAlignmentData(data);
      if (type === "progress_snapshot") setProgressData(data);
      if (type === "reroute") setRerouteData(data);
      if (type === "backtrack_paths") setBacktrackData(data);
    } catch (e: any) { toast.error(e.message || "Failed to get insights"); }
    setLoadingInsight("");
  };

  const statusColor = (status: string) => {
    if (status === "green" || status === "on_track") return "text-emerald-600";
    if (status === "yellow" || status === "some_gaps") return "text-amber-500";
    return "text-destructive";
  };

  const statusBg = (status: string) => {
    if (status === "green" || status === "on_track") return "bg-emerald-500";
    if (status === "yellow" || status === "some_gaps") return "bg-amber-500";
    return "bg-destructive";
  };

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
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="coach">💬 Coach</TabsTrigger>
          <TabsTrigger value="alignment">🎯 Alignment</TabsTrigger>
          <TabsTrigger value="progress">📊 Progress</TabsTrigger>
          <TabsTrigger value="reroute">🔄 Re-route</TabsTrigger>
        </TabsList>

        {/* COACH CHAT TAB */}
        <TabsContent value="coach" className="space-y-4">
          {/* Quick Topics */}
          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map(topic => (
              <button
                key={topic.label}
                onClick={() => sendMessage(topic.label)}
                disabled={isStreaming}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-body text-xs hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-50"
              >
                <topic.icon className="h-3 w-3" />
                {topic.label}
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <Card className="border-border/50">
            <div ref={chatContainerRef} className="h-[450px] overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : "order-1"}`}>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-1.5 mb-1">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-medium text-primary">Career Coach</span>
                        </div>
                      )}
                      <div className={`p-3 rounded-xl text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
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
              <Textarea
                placeholder="Ask anything about your career journey..."
                value={input}
                onChange={e => setInput(e.target.value)}
                rows={1}
                className="resize-none min-h-[40px]"
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                disabled={isStreaming}
              />
              <Button onClick={() => sendMessage()} disabled={isStreaming || !input.trim()} size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Connected Features Quick Access */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: "SkillStacker", icon: Zap, path: "/dashboard/skill-stacker" },
              { label: "Roadmap", icon: Map, path: "/dashboard/roadmap" },
              { label: "SelfGraph", icon: Brain, path: "/dashboard/selfgraph" },
              { label: "Job Matching", icon: Briefcase, path: "/dashboard/job-matching" },
            ].map(link => (
              <a key={link.label} href={link.path} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm text-muted-foreground hover:text-foreground">
                <link.icon className="h-4 w-4 text-primary" />
                {link.label}
                <ChevronRight className="h-3 w-3 ml-auto" />
              </a>
            ))}
          </div>
        </TabsContent>

        {/* ALIGNMENT TAB */}
        <TabsContent value="alignment" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Decision Alignment Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">See how aligned your current choices are with your goals, skills, and emotional state.</p>
              <Button onClick={() => fetchInsight("alignment_score")} disabled={!!loadingInsight} className="gap-2">
                {loadingInsight === "alignment_score" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {loadingInsight === "alignment_score" ? "Calculating..." : "Calculate My Score"}
              </Button>

              {alignmentData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Overall Score */}
                  <div className="text-center p-6 rounded-xl bg-secondary/50 border border-border/50">
                    <div className={`text-5xl font-display font-bold ${statusColor(alignmentData.status)}`}>
                      {alignmentData.overall_score}%
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className={`w-3 h-3 rounded-full ${statusBg(alignmentData.status)}`} />
                      <span className="text-sm font-medium text-foreground capitalize">{alignmentData.status?.replace("_", " ")}</span>
                    </div>
                  </div>

                  {/* Factor Breakdown */}
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

                  {alignmentData.top_strength && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm"><strong>💪 Strength:</strong> {alignmentData.top_strength}</p>
                    </div>
                  )}
                  {alignmentData.biggest_gap && (
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                      <p className="text-sm"><strong>🔍 Focus Area:</strong> {alignmentData.biggest_gap}</p>
                    </div>
                  )}
                  {alignmentData.recommendation && (
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm text-foreground">{alignmentData.recommendation}</p>
                    </div>
                  )}
                  {alignmentData.encouragement && (
                    <p className="text-sm italic text-muted-foreground">✨ {alignmentData.encouragement}</p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROGRESS TAB */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Progress Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => fetchInsight("progress_snapshot")} disabled={!!loadingInsight} className="gap-2">
                {loadingInsight === "progress_snapshot" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                {loadingInsight === "progress_snapshot" ? "Analyzing..." : "Get Progress Snapshot"}
              </Button>

              {progressData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground">{progressData.growth_summary}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-2xl font-display font-bold text-foreground">{progressData.skills_developed || 0}</p>
                      <p className="text-xs text-muted-foreground">Skills Built</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className="text-2xl font-display font-bold text-foreground">{progressData.tasks_completed || 0}</p>
                      <p className="text-xs text-muted-foreground">Tasks Done</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-secondary/50">
                      <p className={`text-2xl font-display font-bold ${progressData.mood_trend === "improving" ? "text-emerald-600" : progressData.mood_trend === "declining" ? "text-destructive" : "text-foreground"}`}>
                        {progressData.mood_trend === "improving" ? "↑" : progressData.mood_trend === "declining" ? "↓" : "→"}
                      </p>
                      <p className="text-xs text-muted-foreground">Mood Trend</p>
                    </div>
                  </div>

                  {progressData.highlights?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">🏆 Highlights</h4>
                      {progressData.highlights.map((h: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1">
                          <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" /> {h}
                        </div>
                      ))}
                    </div>
                  )}

                  {progressData.next_milestones?.map((m: any, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{m.title}</span>
                        <span className="text-primary font-medium">{m.progress}%</span>
                      </div>
                      <Progress value={m.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">{m.steps_remaining}</p>
                    </div>
                  ))}

                  {progressData.motivation_message && (
                    <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                      <p className="text-sm italic text-foreground">✨ {progressData.motivation_message}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* RE-ROUTE TAB */}
        <TabsContent value="reroute" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-primary" /> Career Re-routing & Backtrack Paths
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Feeling misaligned or stuck? Get alternate paths and safe backtrack options.</p>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => fetchInsight("reroute")} disabled={!!loadingInsight} variant="default" className="gap-2">
                  {loadingInsight === "reroute" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Map className="h-4 w-4" />}
                  Get Alternate Paths
                </Button>
                <Button onClick={() => fetchInsight("backtrack_paths")} disabled={!!loadingInsight} variant="outline" className="gap-2">
                  {loadingInsight === "backtrack_paths" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Safe Backtrack Options
                </Button>
              </div>

              {rerouteData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground">{rerouteData.reroute_summary}</p>
                  </div>

                  {rerouteData.quick_wins?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">⚡ Quick Wins (Do Today)</h4>
                      {rerouteData.quick_wins.map((w: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1.5">
                          <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" /> {w}
                        </div>
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

                  {rerouteData.encouragement && (
                    <p className="text-sm italic text-muted-foreground">✨ {rerouteData.encouragement}</p>
                  )}
                </motion.div>
              )}

              {backtrackData && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-4">
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                    <p className="text-sm text-foreground">{backtrackData.empathy_message}</p>
                  </div>

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
                        <div key={i} className="flex items-center gap-2 text-sm text-foreground mb-1">
                          <Lightbulb className="h-3.5 w-3.5 text-accent shrink-0" /> {idea}
                        </div>
                      ))}
                    </div>
                  )}

                  {backtrackData.gentle_next_step && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-foreground"><strong>Next step:</strong> {backtrackData.gentle_next_step}</p>
                    </div>
                  )}
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
