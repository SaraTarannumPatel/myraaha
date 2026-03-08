import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Compass, Sparkles, Target, TrendingUp, ArrowRight, Check, Brain,
  Map, Users, BookOpen, Lightbulb, ChevronRight, Zap,
  Shield, BarChart3, Rocket, Briefcase, Heart, Globe
} from "lucide-react";

const pathTemplates = [
  { type: "product_startup", title: "Product Startup", description: "Build a scalable product that solves a significant problem.", icon: Rocket, skills: ["Product thinking", "Technical skills", "Marketing"], risk: "High", opportunity: "High scalability & impact" },
  { type: "freelancing", title: "Freelancing & Consulting", description: "Leverage your expertise to serve clients independently.", icon: Briefcase, skills: ["Domain expertise", "Communication", "Self-management"], risk: "Low-Medium", opportunity: "Flexible income & lifestyle" },
  { type: "social_impact", title: "Social Impact Venture", description: "Create a venture that tackles social or environmental challenges.", icon: Heart, skills: ["Empathy", "Community building", "Grant writing"], risk: "Medium", opportunity: "Meaningful change & purpose" },
  { type: "service_business", title: "Service-Based Business", description: "Offer specialized services with potential to scale through a team.", icon: Users, skills: ["Client management", "Operations", "Leadership"], risk: "Low-Medium", opportunity: "Steady revenue & growth" },
  { type: "creative_venture", title: "Creative Venture", description: "Turn creative skills into a sustainable business.", icon: Lightbulb, skills: ["Creativity", "Branding", "Audience building"], risk: "Medium", opportunity: "Personal fulfillment & brand" },
  { type: "tech_innovation", title: "Tech Innovation", description: "Push boundaries with cutting-edge technology solutions.", icon: Globe, skills: ["Technical depth", "Research", "Problem-solving"], risk: "High", opportunity: "Disruptive potential" },
];

const alignmentQuestions = [
  { q: "How comfortable are you with financial uncertainty?", options: ["Very comfortable", "Somewhat", "Prefer stability"] },
  { q: "Do you prefer working alone or with a team?", options: ["Solo", "Small team", "Large team"] },
  { q: "What matters more to you?", options: ["Income potential", "Personal fulfillment", "Social impact"] },
  { q: "How much time can you dedicate?", options: ["Full-time", "Part-time", "Evenings & weekends"] },
  { q: "What's your risk appetite?", options: ["High risk, high reward", "Balanced", "Low risk, steady growth"] },
];

const PathSelector = () => {
  const { user, profile } = useAuth();
  const [signals, setSignals] = useState<any>(null);
  const [paths, setPaths] = useState<any[]>([]);
  const [activePath, setActivePath] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [roadmap, setRoadmap] = useState<any>(null);
  const [alignmentResult, setAlignmentResult] = useState<any>(null);
  const [explorationData, setExplorationData] = useState<any>({});

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [pathRes, ideasRes, problemsRes, skillsRes, interestsRes, challengesRes] = await Promise.all([
      supabase.from("path_selections").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("startup_ideas").select("title, category, validation_score").eq("user_id", user!.id).limit(20),
      supabase.from("problem_observations").select("observation, category, scale, relevance_score").eq("user_id", user!.id).limit(20),
      supabase.from("skills").select("name, category, proficiency").eq("user_id", user!.id),
      supabase.from("interests").select("name, category, strength").eq("user_id", user!.id),
      supabase.from("mindset_challenges").select("id").eq("user_id", user!.id).eq("status", "completed"),
    ]);
    setPaths(pathRes.data || []);
    setExplorationData({
      ideas: ideasRes.data || [],
      problems: problemsRes.data || [],
      skills: skillsRes.data || [],
      interests: interestsRes.data || [],
      challengesCompleted: (challengesRes.data || []).length,
    });
    setLoading(false);
  };

  const detectSignals = async () => {
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "detect_signals",
          context: { ...explorationData, industry: profile?.industry, goals: profile?.short_term_goals },
        },
      });
      if (data && !data.error) setSignals(data);
      else toast.error(data?.error || "Failed to detect signals");
    } catch { toast.error("Failed to analyze signals"); }
    setAiLoading(false);
  };

  const selectPath = async (template: typeof pathTemplates[0]) => {
    const userSkills = explorationData.skills?.map((s: any) => s.name) || [];
    const matched = template.skills.filter(s => userSkills.some((us: string) => us.toLowerCase().includes(s.toLowerCase())));
    const { data, error } = await supabase.from("path_selections").insert({
      user_id: user!.id, path_type: template.type, title: template.title, description: template.description,
      skills_required: template.skills, skills_matched: matched, status: "exploring",
    }).select().single();
    if (error) { toast.error("Failed to select path"); return; }
    setActivePath(data);
    fetchAll();
    toast.success(`Path selected: ${template.title}! 🎯`);
  };

  const generateRoadmap = async () => {
    if (!activePath) return;
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "generate_roadmap",
          context: { pathType: activePath.path_type, pathTitle: activePath.title, skills: explorationData.skills, industry: profile?.industry, experienceLevel: profile?.career_stage || "beginner" },
        },
      });
      if (data && !data.error) {
        setRoadmap(data);
        await supabase.from("path_selections").update({ roadmap: data.steps || [], status: "committed" }).eq("id", activePath.id);
        toast.success("Roadmap generated! 🗺️");
      }
    } catch { toast.error("Failed to generate roadmap"); }
    setAiLoading(false);
  };

  const evaluateAlignment = async () => {
    if (!activePath) return;
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("path-selector-ai", {
        body: {
          type: "evaluate_alignment",
          context: { pathType: activePath.path_type, pathTitle: activePath.title, skills: explorationData.skills, interests: explorationData.interests, industry: profile?.industry, experienceLevel: profile?.career_stage || "beginner", goals: profile?.short_term_goals },
        },
      });
      if (data && !data.error) {
        setAlignmentResult(data);
        await supabase.from("path_selections").update({ confidence_score: (data.alignment_score || 0) / 100, ai_analysis: data }).eq("id", activePath.id);
      }
    } catch { toast.error("Failed to evaluate"); }
    setAiLoading(false);
  };

  const commitToPath = async () => {
    if (!activePath) return;
    await supabase.from("path_selections").update({ status: "committed" }).eq("id", activePath.id);
    const { data: roadmapData } = await supabase.from("roadmaps").insert({
      user_id: user!.id, title: `${activePath.title} Roadmap`, description: `Auto-generated roadmap for your ${activePath.title} path`, intent: "entrepreneurship",
    }).select().single();
    if (roadmapData && roadmap?.steps) {
      const steps = roadmap.steps.map((s: any, i: number) => ({
        user_id: user!.id, roadmap_id: roadmapData.id, title: s.title, description: s.description, order_index: i, status: "not_started" as const,
      }));
      await supabase.from("roadmap_steps").insert(steps);
    }
    fetchAll();
    toast.success("Path committed! Your roadmap is ready in the Roadmap section. 🚀");
  };

  const totalSignals = (explorationData.ideas?.length || 0) + (explorationData.problems?.length || 0) + (explorationData.interests?.length || 0);
  const committedPaths = paths.filter((p: any) => p.status === "committed").length;

  if (loading) return <div className="animate-pulse font-body text-muted-foreground text-center py-12">Loading...</div>;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Compass size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Path Selector</h1>
            <p className="font-body text-sm text-muted-foreground">Let's help you choose the right path — one that aligns with your strengths, passions, and signals.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Exploration Signals", value: totalSignals, icon: TrendingUp },
          { label: "Skills Tracked", value: explorationData.skills?.length || 0, icon: Zap },
          { label: "Paths Explored", value: paths.length, icon: Map },
          { label: "Paths Committed", value: committedPaths, icon: Target },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 text-center">
            <s.icon size={18} className="mx-auto text-muted-foreground mb-1" />
            <p className="font-display text-2xl text-foreground">{s.value}</p>
            <p className="font-body text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="signals" className="space-y-6">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="signals" className="font-body text-xs">Signal Detection</TabsTrigger>
          <TabsTrigger value="paths" className="font-body text-xs">Explore Paths</TabsTrigger>
          <TabsTrigger value="decide" className="font-body text-xs">Decision Tools</TabsTrigger>
          <TabsTrigger value="roadmap" className="font-body text-xs">Roadmap</TabsTrigger>
          <TabsTrigger value="history" className="font-body text-xs">My Paths</TabsTrigger>
        </TabsList>

        <TabsContent value="signals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Early Idea Signal Detection</h2>
            <Button onClick={detectSignals} variant="outline" size="sm" disabled={aiLoading}>
              <Sparkles size={14} className={aiLoading ? "animate-spin" : ""} /> {signals ? "Refresh" : "Detect Signals"}
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display text-base text-foreground mb-2 flex items-center gap-2"><Lightbulb size={16} /> Ideas Explored</h3>
              {explorationData.ideas?.length > 0 ? (
                <div className="space-y-1">
                  {explorationData.ideas.slice(0, 5).map((idea: any, i: number) => (
                    <p key={i} className="font-body text-xs text-muted-foreground">• {idea.title} {idea.category && <span className="text-accent">({idea.category})</span>}</p>
                  ))}
                  {explorationData.ideas.length > 5 && <p className="font-body text-xs text-muted-foreground">+{explorationData.ideas.length - 5} more</p>}
                </div>
              ) : <p className="font-body text-xs text-muted-foreground">No ideas yet. Visit Startup Sparks to explore.</p>}
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display text-base text-foreground mb-2 flex items-center gap-2"><Target size={16} /> Problems Spotted</h3>
              {explorationData.problems?.length > 0 ? (
                <div className="space-y-1">
                  {explorationData.problems.slice(0, 5).map((p: any, i: number) => (
                    <p key={i} className="font-body text-xs text-muted-foreground">• {p.observation?.substring(0, 60)}...</p>
                  ))}
                </div>
              ) : <p className="font-body text-xs text-muted-foreground">No observations yet. Use Problem Spotting Lens.</p>}
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display text-base text-foreground mb-2 flex items-center gap-2"><Brain size={16} /> Skills & Interests</h3>
              <div className="flex flex-wrap gap-1">
                {explorationData.skills?.slice(0, 6).map((s: any) => (
                  <span key={s.name} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-[10px]">{s.name}</span>
                ))}
                {explorationData.interests?.slice(0, 4).map((interest: any) => (
                  <span key={interest.name} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{interest.name}</span>
                ))}
                {(explorationData.skills?.length === 0 && explorationData.interests?.length === 0) && (
                  <p className="font-body text-xs text-muted-foreground">Add skills in SelfGraph to improve detection.</p>
                )}
              </div>
            </div>
          </div>
          {signals && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-accent/5 rounded-xl border border-accent/30 p-5">
                <h3 className="font-display text-lg text-foreground mb-2">AI Recommendation</h3>
                <p className="font-body text-sm text-foreground mb-2">{signals.top_recommendation}</p>
                <p className="font-body text-xs text-muted-foreground">{signals.reasoning}</p>
              </div>
              {signals.signals?.map((s: any, i: number) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-display text-base text-foreground">{s.area}</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={s.strength * 100} className="w-20 h-1.5" />
                      <span className="font-body text-xs text-muted-foreground">{Math.round(s.strength * 100)}%</span>
                    </div>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mb-1">{s.evidence}</p>
                  <p className="font-body text-xs text-accent">Suggested: {s.suggested_path}</p>
                </div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="paths" className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Choose Your Entrepreneurial Path</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pathTemplates.map((template, i) => {
              const existing = paths.find((p: any) => p.path_type === template.type);
              return (
                <motion.div key={template.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className={`bg-card rounded-xl border p-5 ${existing ? "border-accent/40" : "border-border"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <template.icon size={20} className="text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg text-foreground">{template.title}</h3>
                      {existing && <span className="font-body text-[10px] text-accent">{existing.status}</span>}
                    </div>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-3">{template.description}</p>
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center gap-2"><span className="font-body text-xs text-muted-foreground">Risk:</span><span className={`font-body text-xs ${template.risk === "High" ? "text-destructive" : "text-accent"}`}>{template.risk}</span></div>
                    <div className="flex items-center gap-2"><span className="font-body text-xs text-muted-foreground">Opportunity:</span><span className="font-body text-xs text-foreground">{template.opportunity}</span></div>
                    <div className="flex flex-wrap gap-1 mt-1">{template.skills.map(s => (<span key={s} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{s}</span>))}</div>
                  </div>
                  <Button onClick={() => selectPath(template)} variant={existing ? "ghost" : "outline"} size="sm" disabled={!!existing}>
                    {existing ? <><Check size={14} /> Selected</> : <><ArrowRight size={14} /> Select Path</>}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="decide" className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Decision & Alignment Tools</h2>
          {!activePath ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Compass className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">Select a path first</h3>
              <p className="font-body text-muted-foreground">Go to "Explore Paths" to choose a direction, then return here.</p>
            </div>
          ) : (
            <>
              <div className="bg-accent/5 rounded-xl border border-accent/30 p-5">
                <h3 className="font-display text-lg text-foreground mb-1">Evaluating: {activePath.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{activePath.description}</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 space-y-4">
                <h3 className="font-display text-lg text-foreground">Self-Assessment</h3>
                {alignmentQuestions.map((aq, qi) => (
                  <div key={qi}>
                    <p className="font-body text-sm text-foreground mb-2">{aq.q}</p>
                    <div className="flex flex-wrap gap-2">
                      {aq.options.map(opt => (
                        <button key={opt} onClick={() => setAnswers({ ...answers, [qi]: opt })}
                          className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${answers[qi] === opt ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={evaluateAlignment} className="gradient-warm text-secondary-foreground" disabled={aiLoading}>
                <BarChart3 size={14} className={aiLoading ? "animate-spin" : ""} /> Evaluate Alignment with AI
              </Button>
              {alignmentResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-foreground">Alignment Analysis</h3>
                    <div className="text-center">
                      <p className="font-display text-2xl text-accent">{alignmentResult.alignment_score}%</p>
                      <p className="font-body text-[10px] text-muted-foreground">Match</p>
                    </div>
                  </div>
                  <Progress value={alignmentResult.alignment_score} className="h-2" />
                  <div className="flex items-center gap-2">
                    <Shield size={14} className={alignmentResult.risk_level === "low" ? "text-accent" : alignmentResult.risk_level === "high" ? "text-destructive" : "text-amber-500"} />
                    <span className="font-body text-sm text-foreground">Risk Level: {alignmentResult.risk_level}</span>
                  </div>
                  <p className="font-body text-sm text-foreground">{alignmentResult.advice}</p>
                  {alignmentResult.strengths_match?.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-1">Strengths Match</p>
                      <div className="flex flex-wrap gap-1">{alignmentResult.strengths_match.map((s: string) => (<span key={s} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-xs">{s}</span>))}</div>
                    </div>
                  )}
                  {alignmentResult.gaps?.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-1">Gaps to Address</p>
                      <div className="flex flex-wrap gap-1">{alignmentResult.gaps.map((s: string) => (<span key={s} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-xs">{s}</span>))}</div>
                    </div>
                  )}
                  {alignmentResult.next_actions?.length > 0 && (
                    <div>
                      <p className="font-body text-xs text-muted-foreground mb-1">Recommended Next Actions</p>
                      {alignmentResult.next_actions.map((a: string, i: number) => (<p key={i} className="font-body text-sm text-foreground">→ {a}</p>))}
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Actionable Roadmap</h2>
            {activePath && !roadmap && (
              <Button onClick={generateRoadmap} variant="outline" size="sm" disabled={aiLoading}>
                <Map size={14} className={aiLoading ? "animate-spin" : ""} /> Generate Roadmap
              </Button>
            )}
          </div>
          {!activePath ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Map className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No path selected</h3>
              <p className="font-body text-muted-foreground">Select a path first to generate your personalized roadmap.</p>
            </div>
          ) : roadmap ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {roadmap.estimated_timeline && (
                <div className="bg-accent/5 rounded-xl border border-accent/30 p-4">
                  <p className="font-body text-sm text-foreground">Estimated Timeline: <span className="font-display text-accent">{roadmap.estimated_timeline}</span></p>
                </div>
              )}
              {roadmap.steps?.map((step: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-xl border border-border p-5 flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center font-display text-sm text-accent">{i + 1}</div>
                    {i < (roadmap.steps?.length || 0) - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display text-base text-foreground">{step.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">{step.category}</span>
                      {step.duration && <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px]">{step.duration}</span>}
                    </div>
                    <p className="font-body text-sm text-muted-foreground">{step.description}</p>
                    {step.resources?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">{step.resources.map((r: string, ri: number) => (<span key={ri} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{r}</span>))}</div>
                    )}
                  </div>
                </motion.div>
              ))}
              {roadmap.key_milestones?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-display text-lg text-foreground mb-3">Key Milestones</h3>
                  {roadmap.key_milestones.map((m: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 mb-2"><Check size={14} className="text-accent" /><p className="font-body text-sm text-foreground">{m}</p></div>
                  ))}
                </div>
              )}
              <Button onClick={commitToPath} className="gradient-warm text-secondary-foreground w-full">
                <Rocket size={16} /> Commit to This Path & Create Roadmap
              </Button>
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">Ready to map your journey?</h3>
              <p className="font-body text-muted-foreground mb-3">Generate an AI-powered roadmap for your {activePath.title} path.</p>
              <Button onClick={generateRoadmap} disabled={aiLoading}><Map size={14} /> Generate Roadmap</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <h2 className="font-display text-xl text-foreground">Your Path Journey</h2>
          {paths.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Compass className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No paths explored yet</h3>
              <p className="font-body text-muted-foreground">Start by detecting your signals and exploring path options.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paths.map((path: any, i: number) => (
                <motion.div key={path.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-lg text-foreground">{path.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full font-body text-xs ${path.status === "committed" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{path.status}</span>
                  </div>
                  <p className="font-body text-sm text-muted-foreground mb-2">{path.description}</p>
                  {path.confidence_score > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-body text-xs text-muted-foreground">Alignment:</span>
                      <Progress value={path.confidence_score * 100} className="w-24 h-1.5" />
                      <span className="font-body text-xs text-accent">{Math.round(path.confidence_score * 100)}%</span>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={() => { setActivePath(path); setRoadmap(path.roadmap?.length ? { steps: path.roadmap } : null); }}>
                    <ChevronRight size={14} /> View Details
                  </Button>
                  <p className="font-body text-xs text-muted-foreground mt-2">{new Date(path.created_at).toLocaleDateString()}</p>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PathSelector;
