import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  BookOpen, Sparkles, Search, Check, ChevronRight, Play, FileText,
  Trophy, Brain, Target, Lightbulb, ArrowRight, RefreshCw, Star,
  Clock, BarChart3, Zap, GraduationCap, Map
} from "lucide-react";

const FoundersLearningLibrary = () => {
  const { user, profile } = useAuth();
  const [capsules, setCapsules] = useState<any[]>([]);
  const [playbooks, setPlaybooks] = useState<any[]>([]);
  const [simulations, setSimulations] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [skillMap, setSkillMap] = useState<any>(null);
  const [activeCapsule, setActiveCapsule] = useState<any>(null);
  const [activePlaybook, setActivePlaybook] = useState<any>(null);
  const [activeSimulation, setActiveSimulation] = useState<any>(null);
  const [simChoice, setSimChoice] = useState<number | null>(null);
  const [simResult, setSimResult] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [quiz, setQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [capRes, pbRes, simRes, resRes, progRes] = await Promise.all([
      supabase.from("learning_capsules").select("*").order("order_index"),
      supabase.from("startup_playbooks").select("*").order("created_at"),
      supabase.from("simulation_challenges").select("*").order("created_at"),
      supabase.from("resources").select("*").eq("intent", "entrepreneurship").order("created_at", { ascending: false }).limit(20),
      supabase.from("user_learning_progress").select("*").eq("user_id", user!.id),
    ]);
    setCapsules(capRes.data || []);
    setPlaybooks(pbRes.data || []);
    setSimulations(simRes.data || []);
    setResources(resRes.data || []);
    setProgress(progRes.data || []);
    setLoading(false);
  };

  const getProgress = (type: string, id: string) => progress.find((p: any) => p.content_type === type && p.content_id === id);

  const markComplete = async (type: string, id: string, score = 0) => {
    const existing = getProgress(type, id);
    if (existing) {
      await supabase.from("user_learning_progress").update({ status: "completed", score, completed_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("user_learning_progress").insert({ user_id: user!.id, content_type: type, content_id: id, status: "completed", score, completed_at: new Date().toISOString() });
    }
    fetchAll();
    toast.success("Marked as complete! 🎉");
  };

  const getRecommendations = async () => {
    setAiLoading(true);
    try {
      const [skillsRes, interestsRes, pathsRes] = await Promise.all([
        supabase.from("skills").select("name, category").eq("user_id", user!.id),
        supabase.from("interests").select("name, category").eq("user_id", user!.id),
        supabase.from("path_selections").select("title, path_type").eq("user_id", user!.id).eq("status", "committed").limit(1),
      ]);
      const { data } = await supabase.functions.invoke("learning-library-ai", {
        body: {
          type: "recommend_learning",
          context: {
            industry: profile?.industry, skills: skillsRes.data, interests: interestsRes.data,
            selectedPath: pathsRes.data?.[0]?.title, goals: profile?.short_term_goals,
            capsulesCompleted: progress.filter((p: any) => p.content_type === "capsule" && p.status === "completed").length,
            simulationsDone: progress.filter((p: any) => p.content_type === "simulation" && p.status === "completed").length,
          },
        },
      });
      if (data && !data.error) setRecommendations(data);
    } catch { toast.error("Failed to get recommendations"); }
    setAiLoading(false);
  };

  const getSkillMapping = async () => {
    setAiLoading(true);
    try {
      const { data: skillsData } = await supabase.from("skills").select("name, category, proficiency").eq("user_id", user!.id);
      const { data: pathsData } = await supabase.from("path_selections").select("title, path_type").eq("user_id", user!.id).eq("status", "committed").limit(1);
      const { data } = await supabase.functions.invoke("learning-library-ai", {
        body: { type: "skill_mapping", context: { skills: skillsData, industry: profile?.industry, selectedPath: pathsData?.[0]?.title } },
      });
      if (data && !data.error) setSkillMap(data);
    } catch { toast.error("Failed to map skills"); }
    setAiLoading(false);
  };

  const startQuiz = async (topic: string, difficulty: string) => {
    setAiLoading(true);
    setQuiz(null); setQuizAnswers({}); setQuizSubmitted(false);
    try {
      const { data } = await supabase.functions.invoke("learning-library-ai", {
        body: { type: "quiz", context: { topic, difficulty } },
      });
      if (data?.questions) setQuiz(data);
    } catch { toast.error("Failed to generate quiz"); }
    setAiLoading(false);
  };

  const submitQuiz = () => {
    if (!quiz) return;
    setQuizSubmitted(true);
    const correct = quiz.questions.filter((q: any, i: number) => quizAnswers[i] === q.correct_index).length;
    toast.success(`Score: ${correct}/${quiz.questions.length}`);
  };

  const submitSimulation = (sim: any) => {
    if (simChoice === null) return;
    const option = sim.options[simChoice];
    setSimResult(option);
    markComplete("simulation", sim.id, option.score);
  };

  const completedCapsules = progress.filter((p: any) => p.content_type === "capsule" && p.status === "completed").length;
  const completedPlaybooks = progress.filter((p: any) => p.content_type === "playbook" && p.status === "completed").length;
  const completedSims = progress.filter((p: any) => p.content_type === "simulation" && p.status === "completed").length;
  const totalPoints = progress.reduce((sum: number, p: any) => sum + (p.score || 0), 0);

  if (loading) return <div className="animate-pulse font-body text-muted-foreground text-center py-12">Loading...</div>;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <GraduationCap size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Founder's Learning Library</h1>
            <p className="font-body text-sm text-muted-foreground">Explore, learn, and build the skills that will fuel your venture.</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Capsules Done", value: `${completedCapsules}/${capsules.length}`, icon: FileText },
          { label: "Playbooks Done", value: `${completedPlaybooks}/${playbooks.length}`, icon: Map },
          { label: "Simulations", value: `${completedSims}/${simulations.length}`, icon: Brain },
          { label: "Total Points", value: totalPoints, icon: Trophy },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon size={18} className="mx-auto text-muted-foreground mb-1" />
            <p className="font-display text-2xl text-foreground">{s.value}</p>
            <p className="font-body text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="dashboard" className="font-body text-xs">Dashboard</TabsTrigger>
          <TabsTrigger value="capsules" className="font-body text-xs">Capsules</TabsTrigger>
          <TabsTrigger value="playbooks" className="font-body text-xs">Playbooks</TabsTrigger>
          <TabsTrigger value="simulations" className="font-body text-xs">Simulations</TabsTrigger>
          <TabsTrigger value="resources" className="font-body text-xs">Content Explorer</TabsTrigger>
          <TabsTrigger value="skills" className="font-body text-xs">Skill Mapping</TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Personalized Learning</h2>
            <Button onClick={getRecommendations} variant="outline" size="sm" disabled={aiLoading}>
              <Sparkles size={14} className={aiLoading ? "animate-spin" : ""} /> {recommendations ? "Refresh" : "Get Recommendations"}
            </Button>
          </div>

          {recommendations ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-accent/5 rounded-xl border border-accent/30 p-5">
                <h3 className="font-display text-lg text-foreground mb-1">Focus: {recommendations.learning_focus}</h3>
                <p className="font-body text-sm text-muted-foreground">{recommendations.advice}</p>
              </div>
              {recommendations.recommendations?.map((rec: any, i: number) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display text-base text-foreground">{rec.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{rec.type}</span>
                      <span className={`px-2 py-0.5 rounded-full font-body text-[10px] ${rec.priority === "high" ? "bg-destructive/10 text-destructive" : rec.priority === "medium" ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"}`}>{rec.priority}</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">{rec.reason}</p>
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground" />
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">Get AI-powered learning suggestions</h3>
              <p className="font-body text-muted-foreground mb-3">Based on your profile, skills, and chosen path.</p>
              <Button onClick={getRecommendations} disabled={aiLoading}><Sparkles size={14} /> Generate Recommendations</Button>
            </div>
          )}

          {/* Progress overview */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-display text-lg text-foreground mb-3">Your Learning Progress</h3>
            <div className="space-y-3">
              {[
                { label: "Startup Capsules", done: completedCapsules, total: capsules.length },
                { label: "Playbooks", done: completedPlaybooks, total: playbooks.length },
                { label: "Simulations", done: completedSims, total: simulations.length },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1">
                    <span className="font-body text-sm text-foreground">{item.label}</span>
                    <span className="font-body text-xs text-muted-foreground">{item.done}/{item.total}</span>
                  </div>
                  <Progress value={item.total > 0 ? (item.done / item.total) * 100 : 0} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* CAPSULES */}
        <TabsContent value="capsules" className="space-y-4">
          {activeCapsule ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Button onClick={() => setActiveCapsule(null)} variant="ghost" size="sm">← Back to capsules</Button>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-display text-xl text-foreground">{activeCapsule.title}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{activeCapsule.difficulty}</span>
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px] flex items-center gap-1"><Clock size={10} /> {activeCapsule.duration_minutes}min</span>
                </div>
                <p className="font-body text-sm text-foreground whitespace-pre-wrap leading-relaxed mt-4">{activeCapsule.content}</p>
                <div className="flex gap-2 mt-6">
                  {!getProgress("capsule", activeCapsule.id) && (
                    <Button onClick={() => markComplete("capsule", activeCapsule.id, 10)} className="gradient-warm text-secondary-foreground">
                      <Check size={14} /> Mark Complete
                    </Button>
                  )}
                  <Button onClick={() => startQuiz(activeCapsule.title, activeCapsule.difficulty)} variant="outline" disabled={aiLoading}>
                    <Brain size={14} /> Take Quiz
                  </Button>
                </div>
              </div>

              {quiz && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <h3 className="font-display text-lg text-foreground">Knowledge Check</h3>
                  {quiz.questions?.map((q: any, qi: number) => (
                    <div key={qi} className="space-y-2">
                      <p className="font-body text-sm text-foreground font-medium">{qi + 1}. {q.question}</p>
                      <div className="space-y-1">
                        {q.options?.map((opt: string, oi: number) => (
                          <button key={oi} onClick={() => !quizSubmitted && setQuizAnswers({ ...quizAnswers, [qi]: oi })}
                            className={`w-full text-left px-3 py-2 rounded-lg font-body text-sm transition-all ${
                              quizSubmitted
                                ? oi === q.correct_index ? "bg-accent/10 text-accent border border-accent/30" : quizAnswers[qi] === oi ? "bg-destructive/10 text-destructive border border-destructive/30" : "bg-muted text-muted-foreground"
                                : quizAnswers[qi] === oi ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}>
                            {opt}
                          </button>
                        ))}
                      </div>
                      {quizSubmitted && q.explanation && <p className="font-body text-xs text-muted-foreground italic">{q.explanation}</p>}
                    </div>
                  ))}
                  {!quizSubmitted && (
                    <Button onClick={submitQuiz} className="gradient-warm text-secondary-foreground">Submit Quiz</Button>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <>
              <h2 className="font-display text-xl text-foreground">Startup Literacy Capsules</h2>
              <p className="font-body text-sm text-muted-foreground">Bite-sized learning units covering essential startup concepts.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {capsules.map((cap, i) => {
                  const done = !!getProgress("capsule", cap.id);
                  return (
                    <motion.div key={cap.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`bg-card rounded-xl border p-5 cursor-pointer hover:border-accent/40 transition-all ${done ? "border-accent/30 bg-accent/5" : "border-border"}`}
                      onClick={() => setActiveCapsule(cap)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {done && <Check size={16} className="text-accent" />}
                          <h3 className="font-display text-base text-foreground">{cap.title}</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px] flex items-center gap-1"><Clock size={10} /> {cap.duration_minutes}m</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground">{cap.description}</p>
                      <div className="flex gap-1 mt-2">
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{cap.category}</span>
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{cap.difficulty}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* PLAYBOOKS */}
        <TabsContent value="playbooks" className="space-y-4">
          {activePlaybook ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Button onClick={() => setActivePlaybook(null)} variant="ghost" size="sm">← Back to playbooks</Button>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-display text-xl text-foreground">{activePlaybook.title}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px]">{activePlaybook.phase}</span>
                </div>
                <p className="font-body text-sm text-muted-foreground mb-4">{activePlaybook.description}</p>

                {/* Steps */}
                <h3 className="font-display text-lg text-foreground mb-3">Steps</h3>
                {activePlaybook.steps?.map((step: any, i: number) => (
                  <div key={i} className="flex gap-4 mb-4">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center font-display text-xs text-accent">{i + 1}</div>
                      {i < activePlaybook.steps.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <h4 className="font-display text-base text-foreground mb-1">{step.title}</h4>
                      <p className="font-body text-sm text-muted-foreground">{step.content}</p>
                    </div>
                  </div>
                ))}

                {/* Checklist */}
                <h3 className="font-display text-lg text-foreground mb-3 mt-6">Checklist</h3>
                <div className="space-y-2">
                  {activePlaybook.checklist?.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded border border-border" />
                      <span className="font-body text-sm text-foreground">{item.item}</span>
                    </div>
                  ))}
                </div>

                {/* Case Study */}
                {activePlaybook.case_study && (
                  <div className="bg-muted/50 rounded-lg p-4 mt-6 border border-border">
                    <h4 className="font-display text-base text-foreground mb-2 flex items-center gap-2"><Star size={14} className="text-accent" /> Case Study</h4>
                    <p className="font-body text-sm text-foreground">{activePlaybook.case_study}</p>
                  </div>
                )}

                {!getProgress("playbook", activePlaybook.id) && (
                  <Button onClick={() => markComplete("playbook", activePlaybook.id, 25)} className="gradient-warm text-secondary-foreground mt-4">
                    <Check size={14} /> Mark Playbook Complete
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <>
              <h2 className="font-display text-xl text-foreground">Startup Playbook Library</h2>
              <p className="font-body text-sm text-muted-foreground">Actionable guides covering different startup phases.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {playbooks.map((pb, i) => {
                  const done = !!getProgress("playbook", pb.id);
                  return (
                    <motion.div key={pb.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`bg-card rounded-xl border p-5 cursor-pointer hover:border-accent/40 transition-all ${done ? "border-accent/30 bg-accent/5" : "border-border"}`}
                      onClick={() => setActivePlaybook(pb)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {done && <Check size={16} className="text-accent" />}
                          <h3 className="font-display text-base text-foreground">{pb.title}</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px]">{pb.phase}</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground mb-2">{pb.description}</p>
                      <div className="flex gap-1">
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{pb.steps?.length || 0} steps</span>
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{pb.difficulty}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* SIMULATIONS */}
        <TabsContent value="simulations" className="space-y-4">
          {activeSimulation ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Button onClick={() => { setActiveSimulation(null); setSimChoice(null); setSimResult(null); }} variant="ghost" size="sm">← Back</Button>
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="font-display text-xl text-foreground">{activeSimulation.title}</h2>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{activeSimulation.difficulty}</span>
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px]">{activeSimulation.points} pts</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 border border-border mb-4">
                  <p className="font-body text-sm text-foreground">{activeSimulation.scenario}</p>
                </div>

                <h3 className="font-display text-lg text-foreground mb-3">What do you do?</h3>
                <div className="space-y-2">
                  {activeSimulation.options?.map((opt: any, i: number) => (
                    <button key={i} onClick={() => !simResult && setSimChoice(i)}
                      className={`w-full text-left px-4 py-3 rounded-lg font-body text-sm transition-all border ${
                        simResult
                          ? simChoice === i ? "border-accent bg-accent/5" : "border-border opacity-50"
                          : simChoice === i ? "gradient-warm text-secondary-foreground border-transparent" : "border-border bg-card hover:border-accent/30"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {!simResult && simChoice !== null && (
                  <Button onClick={() => submitSimulation(activeSimulation)} className="gradient-warm text-secondary-foreground mt-4">
                    <ArrowRight size={14} /> Submit Decision
                  </Button>
                )}

                {simResult && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-3">
                    <div className="bg-accent/5 rounded-lg p-4 border border-accent/30">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-display text-base text-foreground">Result</h4>
                        <span className="font-display text-lg text-accent">{simResult.score}/100</span>
                      </div>
                      <p className="font-body text-sm text-foreground">{simResult.outcome}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <h4 className="font-display text-base text-foreground mb-1 flex items-center gap-2"><Lightbulb size={14} className="text-accent" /> Key Learning</h4>
                      <p className="font-body text-sm text-muted-foreground">{activeSimulation.learning_outcome}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <>
              <h2 className="font-display text-xl text-foreground">Founder Simulation Challenges</h2>
              <p className="font-body text-sm text-muted-foreground">Practice decision-making in realistic startup scenarios.</p>
              <div className="grid md:grid-cols-2 gap-4">
                {simulations.map((sim, i) => {
                  const done = !!getProgress("simulation", sim.id);
                  const prog = getProgress("simulation", sim.id);
                  return (
                    <motion.div key={sim.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className={`bg-card rounded-xl border p-5 cursor-pointer hover:border-accent/40 transition-all ${done ? "border-accent/30 bg-accent/5" : "border-border"}`}
                      onClick={() => { setActiveSimulation(sim); setSimChoice(null); setSimResult(null); }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {done && <Check size={16} className="text-accent" />}
                          <h3 className="font-display text-base text-foreground">{sim.title}</h3>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px]">{sim.points} pts</span>
                      </div>
                      <p className="font-body text-xs text-muted-foreground line-clamp-2">{sim.scenario}</p>
                      <div className="flex gap-1 mt-2">
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{sim.category}</span>
                        <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{sim.difficulty}</span>
                        {prog && <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-[10px]">Score: {prog.score}</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        {/* CONTENT EXPLORER */}
        <TabsContent value="resources" className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl text-foreground">Content Explorer</h2>
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search resources..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 font-body text-sm" />
            </div>
          </div>
          {resources.filter(r => !search || r.title?.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <BookOpen className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No resources yet</h3>
              <p className="font-body text-muted-foreground">Resources for entrepreneurship will appear here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {resources.filter(r => !search || r.title?.toLowerCase().includes(search.toLowerCase())).map((res, i) => (
                <motion.div key={res.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-base text-foreground">{res.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{res.resource_type}</span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground line-clamp-2">{res.description}</p>
                  {res.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">{res.tags.map((t: string) => (<span key={t} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{t}</span>))}</div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* SKILL MAPPING */}
        <TabsContent value="skills" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Where Do Your Skills Apply?</h2>
            <Button onClick={getSkillMapping} variant="outline" size="sm" disabled={aiLoading}>
              <BarChart3 size={14} className={aiLoading ? "animate-spin" : ""} /> {skillMap ? "Refresh" : "Map My Skills"}
            </Button>
          </div>

          {skillMap ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {skillMap.mappings?.map((m: any, i: number) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-base text-foreground">{m.skill}</h3>
                    <span className={`px-2 py-0.5 rounded-full font-body text-[10px] ${m.growth_potential === "high" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{m.growth_potential} growth</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {m.applicable_roles?.map((r: string) => (<span key={r} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-[10px]">{r}</span>))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.startup_domains?.map((d: string) => (<span key={d} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{d}</span>))}
                  </div>
                </div>
              ))}
              {skillMap.gaps?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display text-lg text-foreground mb-2">Skill Gaps</h3>
                  {skillMap.gaps.map((g: string, i: number) => (<p key={i} className="font-body text-sm text-muted-foreground">→ {g}</p>))}
                </div>
              )}
              {skillMap.recommended_learning?.length > 0 && (
                <div className="bg-accent/5 rounded-xl border border-accent/30 p-5">
                  <h3 className="font-display text-lg text-foreground mb-2">Recommended Learning</h3>
                  {skillMap.recommended_learning.map((r: string, i: number) => (<p key={i} className="font-body text-sm text-foreground">📚 {r}</p>))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Target className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">Map your skills to startup roles</h3>
              <p className="font-body text-muted-foreground mb-3">Discover where your skills have the most impact.</p>
              <Button onClick={getSkillMapping} disabled={aiLoading}><BarChart3 size={14} /> Analyze My Skills</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoundersLearningLibrary;
