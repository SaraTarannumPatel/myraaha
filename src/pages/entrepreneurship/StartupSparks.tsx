import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Lightbulb, Plus, Sparkles, Target, Users, Tag, Star, Loader2, Brain,
  CheckCircle2, ArrowRight, Eye, Heart, X,
  Bookmark, ThumbsDown, PenLine, Trophy, Zap, Globe, GraduationCap,
  Compass, Filter, Rocket, MessageCircle, BookOpen, LifeBuoy, Wrench, Clock
} from "lucide-react";

type Tab = "discover" | "ideas" | "my-ideas" | "problem-spotting" | "quests";

const sectors = [
  { value: "all", label: "All Sectors", icon: Globe },
  { value: "social_impact", label: "Social Impact", icon: Heart },
  { value: "tech_innovation", label: "Tech Innovation", icon: Zap },
  { value: "creative_industries", label: "Creative", icon: Sparkles },
  { value: "local_needs", label: "Local Needs", icon: Compass },
  { value: "emerging_trends", label: "Emerging Trends", icon: Target },
];

const explorationQuestions = [
  { id: "problemTypes", question: "What kind of problems do you want to solve?", placeholder: "e.g., education access, local transportation, mental health..." },
  { id: "skillsInterests", question: "What skills or interests do you want to explore?", placeholder: "e.g., coding, design, storytelling, community building..." },
  { id: "startupType", question: "What kind of startup excites you?", placeholder: "e.g., social enterprise, tech startup, creative agency, freelancing..." },
];

const modulePathMap: Record<string, string> = {
  "mvp-builder": "/dashboard/mvp-builder",
  "startup-lab": "/dashboard/startup-lab",
  "mindset-builder": "/dashboard/mindset-builder",
  "startup-communities": "/dashboard/startup-communities",
};

const StartupSparks = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [sectorFilter, setSectorFilter] = useState("all");

  // Idea Cards state
  const [ideaCards, setIdeaCards] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<Record<string, string>>({});
  const [ideaNotes, setIdeaNotes] = useState<Record<string, string>>({});
  const [showNotesFor, setShowNotesFor] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [generatingCards, setGeneratingCards] = useState(false);

  // My Ideas state
  const [myIdeas, setMyIdeas] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", problem_statement: "", solution: "", target_audience: "", category: "" });
  const [validating, setValidating] = useState<string | null>(null);
  const [validation, setValidation] = useState<Record<string, any>>({});

  // Problem Spotting state
  const [observations, setObservations] = useState<any[]>([]);
  const [newObservation, setNewObservation] = useState("");
  const [analyzingObs, setAnalyzingObs] = useState(false);

  // Quests state
  const [quests, setQuests] = useState<any[]>([]);
  const [questProgress, setQuestProgress] = useState<Record<string, any>>({});
  const [activeQuest, setActiveQuest] = useState<string | null>(null);
  const [questResponse, setQuestResponse] = useState("");
  const [submittingQuest, setSubmittingQuest] = useState(false);
  const [questFeedback, setQuestFeedback] = useState<Record<string, any>>({});

  // Discover tab state
  const [explorationAnswers, setExplorationAnswers] = useState<Record<string, string>>({});
  const [explorationInsights, setExplorationInsights] = useState<any>(null);
  const [loadingExploration, setLoadingExploration] = useState(false);
  const [resourceSuggestions, setResourceSuggestions] = useState<any>(null);
  const [loadingResources, setLoadingResources] = useState(false);
  const [actionPrompts, setActionPrompts] = useState<any>(null);
  const [loadingActions, setLoadingActions] = useState(false);

  useEffect(() => {
    fetchIdeaCards();
    fetchMyIdeas();
    fetchObservations();
    fetchQuests();
    fetchInteractions();
  }, []);

  // ========== IDEA CARDS ==========
  const fetchIdeaCards = async () => {
    const { data } = await supabase.from("idea_cards").select("*").order("created_at", { ascending: false });
    setIdeaCards(data || []);
    setLoadingCards(false);
  };

  const fetchInteractions = async () => {
    if (!user) return;
    const { data } = await supabase.from("idea_card_interactions").select("*").eq("user_id", user.id);
    const map: Record<string, string> = {};
    const notesMap: Record<string, string> = {};
    (data || []).forEach(i => {
      if (i.idea_card_id) {
        map[i.idea_card_id] = i.interaction_type;
        if (i.notes) notesMap[i.idea_card_id] = i.notes;
      }
    });
    setInteractions(map);
    setIdeaNotes(notesMap);
  };

  const interactWithCard = async (cardId: string, type: string) => {
    if (!user) return;
    await supabase.from("idea_card_interactions").delete().eq("user_id", user.id).eq("idea_card_id", cardId);
    if (interactions[cardId] === type) {
      setInteractions(prev => { const n = { ...prev }; delete n[cardId]; return n; });
      return;
    }
    await supabase.from("idea_card_interactions").insert({ user_id: user.id, idea_card_id: cardId, interaction_type: type });
    setInteractions(prev => ({ ...prev, [cardId]: type }));
    if (type === "save") toast.success("Idea saved!");

    // Profile sync: track sector affinity
    const card = ideaCards.find(c => c.id === cardId);
    if (card?.sector && type === "like") {
      syncToFounderProfile(card.sector);
    }
  };

  const syncToFounderProfile = async (sector: string) => {
    if (!user) return;
    // Log interest pattern to journal for founder profiling
    await supabase.from("journal_entries").insert({
      user_id: user.id,
      title: `Startup Spark: Explored ${sector.replace("_", " ")}`,
      content: `Showed interest in ${sector.replace("_", " ")} sector through Startup Sparks idea exploration.`,
      tags: ["startup-sparks", "exploration", sector],
      intent: "entrepreneurship" as any,
    });
  };

  const saveIdeaNote = async (cardId: string) => {
    if (!user || !ideaNotes[cardId]?.trim()) return;
    await supabase.from("idea_card_interactions").delete().eq("user_id", user.id).eq("idea_card_id", cardId).eq("interaction_type", "note");
    await supabase.from("idea_card_interactions").insert({ user_id: user.id, idea_card_id: cardId, interaction_type: "note", notes: ideaNotes[cardId] });
    toast.success("Note saved!");
    setShowNotesFor(null);
  };

  const generateAICards = async () => {
    setGeneratingCards(true);
    try {
      const { data, error } = await supabase.functions.invoke("startup-sparks-ai", {
        body: { type: "generate_ideas", data: { interests: profile?.areas_of_focus?.join(", ") || profile?.industry, sector: sectorFilter !== "all" ? sectorFilter : undefined, userType: profile?.user_type } },
      });
      if (error) throw error;
      if (data?.ideas) {
        for (const idea of data.ideas) {
          await supabase.from("idea_cards").insert({ ...idea, source: "ai_generated" });
        }
        fetchIdeaCards();
        toast.success(`${data.ideas.length} new idea cards generated!`);
      }
    } catch { toast.error("Failed to generate ideas"); }
    setGeneratingCards(false);
  };

  const filteredCards = sectorFilter === "all" ? ideaCards : ideaCards.filter(c => c.sector === sectorFilter);

  // ========== MY IDEAS ==========
  const fetchMyIdeas = async () => {
    if (!user) return;
    const { data } = await supabase.from("startup_ideas").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setMyIdeas(data || []);
  };

  const addIdea = async () => {
    if (!form.title.trim()) { toast.error("Give your idea a name"); return; }
    await supabase.from("startup_ideas").insert({ user_id: user!.id, ...form });
    setForm({ title: "", problem_statement: "", solution: "", target_audience: "", category: "" });
    setShowForm(false);
    fetchMyIdeas();
    toast.success("Idea sparked! 🚀");
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from("startup_ideas").update({ is_active: !isActive }).eq("id", id);
    fetchMyIdeas();
  };

  const validateIdea = async (idea: any) => {
    setValidating(idea.id);
    try {
      const { data, error } = await supabase.functions.invoke("ai-validate-idea", { body: { idea } });
      if (error) throw error;
      setValidation(prev => ({ ...prev, [idea.id]: data }));
      if (data?.score !== undefined) {
        await supabase.from("startup_ideas").update({ validation_score: data.score }).eq("id", idea.id);
        fetchMyIdeas();
      }
      toast.success("Idea validated!");
    } catch { toast.error("Validation failed"); }
    setValidating(null);
  };

  // ========== PROBLEM SPOTTING ==========
  const fetchObservations = async () => {
    if (!user) return;
    const { data } = await supabase.from("problem_observations").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setObservations(data || []);
  };

  const submitObservation = async () => {
    if (!user || !newObservation.trim()) { toast.error("Describe a problem you've noticed"); return; }
    setAnalyzingObs(true);
    try {
      const { data: obs, error } = await supabase.from("problem_observations").insert({ user_id: user.id, observation: newObservation }).select().single();
      if (error) throw error;

      const { data: analysis } = await supabase.functions.invoke("startup-sparks-ai", {
        body: { type: "analyze_problem", data: { observation: newObservation } },
      });

      if (analysis) {
        await supabase.from("problem_observations").update({
          category: analysis.category,
          scale: analysis.scale,
          feasibility: analysis.feasibility,
          relevance_score: analysis.relevance_score,
          ai_analysis: analysis,
        }).eq("id", obs.id);
        toast.success(analysis.encouragement || "Problem analyzed! 🔍");
      }

      setNewObservation("");
      fetchObservations();
    } catch { toast.error("Failed to save observation"); }
    setAnalyzingObs(false);
  };

  // ========== QUESTS ==========
  const fetchQuests = async () => {
    if (!user) return;
    const [questsRes, progressRes] = await Promise.all([
      supabase.from("exploration_quests").select("*").order("difficulty"),
      supabase.from("quest_progress").select("*").eq("user_id", user.id),
    ]);
    setQuests(questsRes.data || []);
    const pMap: Record<string, any> = {};
    (progressRes.data || []).forEach(p => { pMap[p.quest_id] = p; });
    setQuestProgress(pMap);
  };

  const startQuest = async (questId: string) => {
    if (!user) return;
    await supabase.from("quest_progress").insert({ user_id: user.id, quest_id: questId, status: "started" });
    setActiveQuest(questId);
    fetchQuests();
  };

  const submitQuestResponse = async (quest: any) => {
    if (!user || !questResponse.trim()) { toast.error("Write your response first"); return; }
    setSubmittingQuest(true);
    try {
      const { data: feedback } = await supabase.functions.invoke("startup-sparks-ai", {
        body: { type: "quest_feedback", data: { questTitle: quest.title, questDescription: quest.description, response: questResponse } },
      });

      if (feedback) setQuestFeedback(prev => ({ ...prev, [quest.id]: feedback }));

      const pointsEarned = feedback?.score ? Math.round(quest.points * (feedback.score / 100)) : quest.points;
      await supabase.from("quest_progress").update({
        status: "completed", response: questResponse, completed_at: new Date().toISOString(), points_earned: pointsEarned,
      }).eq("user_id", user.id).eq("quest_id", quest.id);

      await supabase.from("achievements").insert({
        user_id: user.id, title: `Quest Complete: ${quest.title}`,
        description: `Earned ${pointsEarned} points`, achievement_type: "quest", points: pointsEarned,
      });

      toast.success(`Quest completed! +${pointsEarned} points 🏆`);
      setQuestResponse("");
      setActiveQuest(null);
      fetchQuests();
    } catch { toast.error("Failed to submit"); }
    setSubmittingQuest(false);
  };

  // ========== DISCOVER TAB ==========
  const submitExploration = async () => {
    if (!user) return;
    const answered = Object.values(explorationAnswers).filter(v => v.trim()).length;
    if (answered < 2) { toast.error("Answer at least 2 questions"); return; }
    setLoadingExploration(true);

    // Gather liked sectors from interactions
    const likedSectors = ideaCards
      .filter(c => interactions[c.id] === "like" || interactions[c.id] === "save")
      .map(c => c.sector)
      .filter(Boolean);

    try {
      const { data, error } = await supabase.functions.invoke("startup-sparks-ai", {
        body: {
          type: "guided_exploration",
          data: {
            name: profile?.full_name || "Explorer",
            ...explorationAnswers,
            likedSectors: [...new Set(likedSectors)],
          },
        },
      });
      if (error) throw error;
      setExplorationInsights(data);

      // Sync exploration to journal for founder profiling
      await supabase.from("journal_entries").insert({
        user_id: user.id,
        title: "Startup Sparks: Guided Exploration Complete",
        content: `**Exploration answers:**\n${Object.entries(explorationAnswers).map(([k, v]) => `- ${k}: ${v}`).join("\n")}\n\n**AI Insights:**\n- Traits: ${data?.founder_traits?.join(", ")}\n- Sectors: ${data?.suggested_sectors?.join(", ")}`,
        tags: ["startup-sparks", "guided-exploration", "founder-profiling"],
        intent: "entrepreneurship" as any,
      });
    } catch { toast.error("Failed to get insights"); }
    setLoadingExploration(false);
  };

  const fetchResourceSuggestions = async () => {
    if (!user) return;
    setLoadingResources(true);
    const likedIdeas = ideaCards.filter(c => interactions[c.id] === "like" || interactions[c.id] === "save").map(c => c.title);
    const problems = observations.map(o => o.observation?.slice(0, 50));
    const sectorSet = [...new Set(ideaCards.filter(c => interactions[c.id] === "like").map(c => c.sector).filter(Boolean))];

    try {
      const { data, error } = await supabase.functions.invoke("startup-sparks-ai", {
        body: { type: "resource_suggestions", data: { sectors: sectorSet, likedIdeas, problems } },
      });
      if (error) throw error;
      setResourceSuggestions(data);
    } catch { toast.error("Failed to get suggestions"); }
    setLoadingResources(false);
  };

  const fetchActionPrompts = async () => {
    if (!user) return;
    setLoadingActions(true);
    const topSectors = [...new Set(ideaCards.filter(c => interactions[c.id] === "like").map(c => c.sector).filter(Boolean))];
    try {
      const { data, error } = await supabase.functions.invoke("startup-sparks-ai", {
        body: {
          type: "action_prompts",
          data: {
            ideasCount: myIdeas.length,
            likedCount: Object.values(interactions).filter(v => v === "like").length,
            problemsCount: observations.length,
            questsCount: Object.values(questProgress).filter((p: any) => p.status === "completed").length,
            topSectors,
          },
        },
      });
      if (error) throw error;
      setActionPrompts(data);
    } catch { toast.error("Failed to get action prompts"); }
    setLoadingActions(false);
  };

  const totalQuestPoints = Object.values(questProgress).reduce((sum: number, p: any) => sum + (p.points_earned || 0), 0);
  const completedQuests = Object.values(questProgress).filter((p: any) => p.status === "completed").length;

  const tabs = [
    { id: "discover" as Tab, label: "Discover", icon: Compass, count: "" },
    { id: "ideas" as Tab, label: "Idea Cards", icon: Lightbulb, count: filteredCards.length },
    { id: "my-ideas" as Tab, label: "My Ideas", icon: Star, count: myIdeas.length },
    { id: "problem-spotting" as Tab, label: "Problems", icon: Eye, count: observations.length },
    { id: "quests" as Tab, label: "Quests", icon: Trophy, count: `${completedQuests}/${quests.length}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Lightbulb size={20} className="text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Startup Sparks</h1>
            <p className="font-body text-sm text-muted-foreground">
              Where ideas meet inspiration — explore, spot problems, and start building
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-4 gap-3">
        {[
          { label: "Ideas Saved", value: Object.values(interactions).filter(v => v === "save").length, icon: Bookmark },
          { label: "My Ideas", value: myIdeas.length, icon: Lightbulb },
          { label: "Problems Spotted", value: observations.length, icon: Eye },
          { label: "Quest Points", value: totalQuestPoints, icon: Trophy },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-lg border border-border p-3 text-center">
            <s.icon size={14} className="mx-auto text-primary mb-1" />
            <p className="font-display text-lg text-foreground">{s.value}</p>
            <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/30 rounded-lg p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-body text-xs transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            }`}>
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count && <span className="text-[10px] bg-muted rounded-full px-1.5">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* ===== DISCOVER TAB ===== */}
      {activeTab === "discover" && (
        <div className="space-y-6">
          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 text-center">
            <Sparkles size={28} className="mx-auto text-primary mb-3" />
            <h2 className="font-display text-2xl text-foreground mb-2">Welcome to Startup Sparks</h2>
            <p className="font-body text-sm text-muted-foreground max-w-lg mx-auto">
              Where ideas meet inspiration and you can start exploring how you can make an impact. Let's understand what excites you.
            </p>
          </motion.div>

          {/* Guided Questionnaire */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Compass size={18} className="text-primary" />
              <h3 className="font-display text-lg text-foreground">Guided Exploration</h3>
            </div>
            <div className="space-y-4">
              {explorationQuestions.map(q => (
                <div key={q.id}>
                  <p className="font-body text-sm text-foreground mb-1.5">{q.question}</p>
                  <Textarea
                    placeholder={q.placeholder}
                    value={explorationAnswers[q.id] || ""}
                    onChange={e => setExplorationAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    rows={2} className="text-sm"
                  />
                </div>
              ))}
              <Button onClick={submitExploration} disabled={loadingExploration} className="bg-primary text-primary-foreground font-body text-sm">
                {loadingExploration ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><Brain size={14} /> Get My Insights</>}
              </Button>
            </div>

            {/* Exploration Insights */}
            {explorationInsights && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-4">
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <p className="font-body text-sm text-foreground italic mb-3">{explorationInsights.encouragement}</p>

                  {explorationInsights.founder_traits?.length > 0 && (
                    <div className="mb-3">
                      <p className="font-body text-xs font-semibold text-primary mb-1">Your Emerging Founder Traits</p>
                      <div className="flex flex-wrap gap-1.5">
                        {explorationInsights.founder_traits.map((t: string) => (
                          <span key={t} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-body text-[11px]">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {explorationInsights.suggested_sectors?.length > 0 && (
                    <div className="mb-3">
                      <p className="font-body text-xs font-semibold text-foreground mb-1">Suggested Sectors for You</p>
                      <div className="flex flex-wrap gap-1.5">
                        {explorationInsights.suggested_sectors.map((s: string) => (
                          <span key={s} className="px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground font-body text-[11px]">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {explorationInsights.next_steps?.length > 0 && (
                    <div className="mb-3">
                      <p className="font-body text-xs font-semibold text-foreground mb-1">Your Next Steps</p>
                      {explorationInsights.next_steps.map((s: string, i: number) => (
                        <p key={i} className="font-body text-xs text-muted-foreground">→ {s}</p>
                      ))}
                    </div>
                  )}

                  {explorationInsights.mindset_tip && (
                    <div className="bg-accent/10 rounded-lg p-3 mt-2">
                      <p className="font-body text-xs text-accent-foreground"><strong>Mindset Tip:</strong> {explorationInsights.mindset_tip}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Resource Suggestions */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-primary" />
                <h3 className="font-display text-lg text-foreground">Learning Suggestions</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchResourceSuggestions} disabled={loadingResources} className="font-body text-xs">
                {loadingResources ? <Loader2 size={14} className="animate-spin" /> : "Get Suggestions"}
              </Button>
            </div>
            {resourceSuggestions?.topics ? (
              <div className="space-y-2">
                {resourceSuggestions.topics.map((t: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <BookOpen size={14} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-body text-sm text-foreground font-medium">{t.title}</p>
                      <p className="font-body text-[10px] text-muted-foreground mt-0.5">{t.why_it_matters}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="font-body text-[10px] text-primary">{t.category}</span>
                        <span className="font-body text-[10px] text-muted-foreground">{t.difficulty}</span>
                      </div>
                    </div>
                    <Link to="/dashboard/founders-learning-library" className="shrink-0 ml-auto">
                      <ArrowRight size={12} className="text-muted-foreground" />
                    </Link>
                  </div>
                ))}
                {resourceSuggestions.encouragement && (
                  <p className="font-body text-xs text-primary italic mt-2">{resourceSuggestions.encouragement}</p>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground text-center py-4">
                Click "Get Suggestions" to receive personalized learning recommendations based on your explorations.
              </p>
            )}
          </motion.div>

          {/* Action Prompts */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Rocket size={18} className="text-primary" />
                <h3 className="font-display text-lg text-foreground">Start Small Experiments</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchActionPrompts} disabled={loadingActions} className="font-body text-xs">
                {loadingActions ? <Loader2 size={14} className="animate-spin" /> : "Get Actions"}
              </Button>
            </div>
            {actionPrompts?.experiments ? (
              <div className="space-y-3">
                {actionPrompts.experiments.map((exp: any, i: number) => (
                  <Link key={i} to={modulePathMap[exp.module_link] || "/dashboard/mvp-builder"}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap size={14} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-body text-sm text-foreground font-medium">{exp.title}</h4>
                      <p className="font-body text-[10px] text-muted-foreground mt-0.5">{exp.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={10} className="text-muted-foreground" />
                        <span className="font-body text-[10px] text-muted-foreground">{exp.time_needed}</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                  </Link>
                ))}
                {actionPrompts.encouragement && (
                  <p className="font-body text-xs text-primary italic">{actionPrompts.encouragement}</p>
                )}
              </div>
            ) : (
              <p className="font-body text-sm text-muted-foreground text-center py-4">
                Click "Get Actions" to receive small experiments you can start this week.
              </p>
            )}
          </motion.div>

          {/* Early Connections Panel */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-primary" />
              <h3 className="font-display text-lg text-foreground">Connect & Collaborate</h3>
            </div>
            <p className="font-body text-xs text-muted-foreground mb-4">
              Join others exploring similar paths. Founders grow faster together.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { label: "Startup Communities", path: "/dashboard/startup-communities", icon: Globe, desc: "Join peer groups" },
                { label: "Startup Showcase", path: "/dashboard/startup-showcase", icon: Eye, desc: "Share your ideas" },
                { label: "Founder Profile", path: "/dashboard/founder-profile", icon: Users, desc: "Track your growth" },
                { label: "Mindset Builder", path: "/dashboard/mindset-builder", icon: Brain, desc: "Build founder habits" },
                { label: "Learning Library", path: "/dashboard/founders-learning-library", icon: GraduationCap, desc: "Deepen knowledge" },
                { label: "Startup Support", path: "/dashboard/startup-support", icon: LifeBuoy, desc: "Get mentorship" },
              ].map(link => (
                <Link key={link.path} to={link.path}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border">
                  <link.icon size={14} className="text-primary shrink-0" />
                  <div>
                    <span className="font-body text-xs text-foreground font-medium block">{link.label}</span>
                    <span className="font-body text-[10px] text-muted-foreground">{link.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ===== IDEA CARDS TAB ===== */}
      {activeTab === "ideas" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {sectors.map(s => (
              <button key={s.value} onClick={() => setSectorFilter(s.value)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-body text-xs transition-all ${
                  sectorFilter === s.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}>
                <s.icon size={12} /> {s.label}
              </button>
            ))}
            <Button size="sm" variant="outline" onClick={generateAICards} disabled={generatingCards} className="ml-auto font-body text-xs">
              {generatingCards ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generatingCards ? "Generating..." : "AI Generate"}
            </Button>
          </div>

          {loadingCards ? (
            <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-muted-foreground" /></div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
              <p className="font-body text-muted-foreground">No idea cards in this sector yet. Try generating some!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCards.map((card, i) => (
                <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-xl border border-border p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body text-[10px]">
                      {card.sector?.replace("_", " ")}
                    </span>
                    <span className="font-body text-[10px] text-muted-foreground">{card.difficulty}</span>
                  </div>
                  <h3 className="font-display text-base text-foreground mb-2">{card.title}</h3>
                  <p className="font-body text-sm text-muted-foreground flex-1">{card.description}</p>
                  {card.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {card.tags.map((t: string) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                    <button onClick={() => interactWithCard(card.id, "like")}
                      className={`p-1.5 rounded-md transition-all ${interactions[card.id] === "like" ? "bg-accent/10 text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                      <Heart size={14} className={interactions[card.id] === "like" ? "fill-current" : ""} />
                    </button>
                    <button onClick={() => interactWithCard(card.id, "save")}
                      className={`p-1.5 rounded-md transition-all ${interactions[card.id] === "save" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      <Bookmark size={14} className={interactions[card.id] === "save" ? "fill-current" : ""} />
                    </button>
                    <button onClick={() => interactWithCard(card.id, "reject")}
                      className={`p-1.5 rounded-md transition-all ${interactions[card.id] === "reject" ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:text-foreground"}`}>
                      <ThumbsDown size={14} />
                    </button>
                    <button onClick={() => setShowNotesFor(showNotesFor === card.id ? null : card.id)}
                      className={`p-1.5 rounded-md transition-all ${ideaNotes[card.id] ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      <PenLine size={14} />
                    </button>
                  </div>
                  <AnimatePresence>
                    {showNotesFor === card.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-2 space-y-2">
                          <Textarea placeholder="Why does this idea excite or challenge you?" value={ideaNotes[card.id] || ""} onChange={e => setIdeaNotes(prev => ({ ...prev, [card.id]: e.target.value }))} rows={2} className="text-xs" />
                          <Button size="sm" onClick={() => saveIdeaNote(card.id)} className="bg-primary text-primary-foreground font-body text-xs">Save Note</Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== MY IDEAS TAB ===== */}
      {activeTab === "my-ideas" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground font-body text-sm">
              <Plus size={16} /> New Idea
            </Button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h2 className="font-display text-lg text-foreground">Spark a New Idea</h2>
              <Input placeholder="Idea Name" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="What problem does it solve?" value={form.problem_statement} onChange={e => setForm({ ...form, problem_statement: e.target.value })} rows={2} />
              <Textarea placeholder="Your proposed solution" value={form.solution} onChange={e => setForm({ ...form, solution: e.target.value })} rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Target audience" value={form.target_audience} onChange={e => setForm({ ...form, target_audience: e.target.value })} />
                <Input placeholder="Category (e.g., EdTech)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={addIdea} className="bg-primary text-primary-foreground">Save Idea</Button>
                <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
              </div>
            </motion.div>
          )}

          {myIdeas.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No ideas yet</h3>
              <p className="font-body text-muted-foreground">Browse Idea Cards for inspiration, or create your own!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myIdeas.map((idea, i) => (
                <motion.div key={idea.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className={`bg-card rounded-xl border p-5 ${idea.is_active ? "border-primary/30" : "border-border opacity-60"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-base text-foreground">{idea.title}</h3>
                    <button onClick={() => toggleActive(idea.id, idea.is_active)}>
                      <Star size={16} className={idea.is_active ? "text-accent fill-current" : "text-muted-foreground"} />
                    </button>
                  </div>
                  {idea.category && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-body text-[10px] mb-2"><Tag size={10} /> {idea.category}</span>}
                  {idea.problem_statement && <p className="font-body text-xs text-muted-foreground mb-1"><strong>Problem:</strong> {idea.problem_statement}</p>}
                  {idea.solution && <p className="font-body text-xs text-muted-foreground mb-1"><strong>Solution:</strong> {idea.solution}</p>}
                  {idea.target_audience && <p className="font-body text-xs text-muted-foreground flex items-center gap-1"><Users size={10} /> {idea.target_audience}</p>}
                  {idea.validation_score > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-[10px] text-muted-foreground">Validation</span>
                        <span className="font-body text-xs text-primary font-semibold">{Math.round(idea.validation_score * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${idea.validation_score * 100}%` }} />
                      </div>
                    </div>
                  )}
                  {validation[idea.id] && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-1">
                      <p className="font-body text-[10px] font-semibold text-foreground flex items-center gap-1"><Brain size={10} /> AI Validation</p>
                      <p className="font-body text-[10px] text-muted-foreground">{validation[idea.id].market_fit}</p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <p className="font-body text-[10px] text-primary font-semibold">Strengths</p>
                          {validation[idea.id].strengths?.map((s: string, j: number) => <p key={j} className="font-body text-[10px] text-muted-foreground">• {s}</p>)}
                        </div>
                        <div>
                          <p className="font-body text-[10px] text-destructive font-semibold">Improve</p>
                          {validation[idea.id].weaknesses?.map((w: string, j: number) => <p key={j} className="font-body text-[10px] text-muted-foreground">• {w}</p>)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1 font-body text-xs" onClick={() => validateIdea(idea)} disabled={validating === idea.id}>
                      {validating === idea.id ? <><Loader2 size={12} className="animate-spin" /> Validating...</> : <><Brain size={12} /> AI Validate</>}
                    </Button>
                    <Link to="/dashboard/mvp-builder">
                      <Button size="sm" variant="ghost" className="font-body text-xs"><Wrench size={12} /> Build MVP</Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== PROBLEM SPOTTING TAB ===== */}
      {activeTab === "problem-spotting" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={16} className="text-primary" />
              <h2 className="font-display text-lg text-foreground">Problem Spotting Lens</h2>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Observe your surroundings and document problems you notice. Our AI will help categorize and analyze each observation.
            </p>
            <div className="space-y-3">
              <div className="grid gap-2">
                {[
                  "What issues do people face around you daily?",
                  "Where do you feel improvements are needed in your community?",
                  "Which challenges frustrate or excite you?",
                ].map(prompt => (
                  <p key={prompt} className="font-body text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 italic">💭 {prompt}</p>
                ))}
              </div>
              <Textarea placeholder="Describe a problem you've observed..." value={newObservation} onChange={e => setNewObservation(e.target.value)} rows={3} />
              <Button onClick={submitObservation} disabled={analyzingObs || !newObservation.trim()} className="bg-primary text-primary-foreground font-body text-sm">
                {analyzingObs ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><Eye size={14} /> Submit & Analyze</>}
              </Button>
            </div>
          </div>

          {observations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-lg text-foreground">Your Observations</h3>
              {observations.map((obs, i) => (
                <motion.div key={obs.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-xl border border-border p-5">
                  <p className="font-body text-sm text-foreground mb-3">{obs.observation}</p>
                  {obs.ai_analysis && Object.keys(obs.ai_analysis).length > 0 && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {obs.category && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body text-[10px]">{obs.category.replace("_", " ")}</span>}
                        {obs.scale && <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent-foreground font-body text-[10px]">Scale: {obs.scale}</span>}
                        {obs.feasibility && <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-body text-[10px]">Feasibility: {obs.feasibility}</span>}
                        {obs.relevance_score > 0 && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body text-[10px]">Relevance: {Math.round(obs.relevance_score * 100)}%</span>}
                      </div>
                      {obs.ai_analysis.affected_groups && (
                        <div>
                          <p className="font-body text-[10px] text-muted-foreground font-semibold">Affected:</p>
                          <p className="font-body text-xs text-foreground">{obs.ai_analysis.affected_groups.join(", ")}</p>
                        </div>
                      )}
                      {obs.ai_analysis.potential_approaches && (
                        <div>
                          <p className="font-body text-[10px] text-muted-foreground font-semibold">Potential Approaches:</p>
                          {obs.ai_analysis.potential_approaches.map((a: string, j: number) => (
                            <p key={j} className="font-body text-xs text-foreground">• {a}</p>
                          ))}
                        </div>
                      )}
                      {obs.ai_analysis.encouragement && (
                        <p className="font-body text-xs text-primary italic mt-1">{obs.ai_analysis.encouragement}</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== QUESTS TAB ===== */}
      {activeTab === "quests" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy size={20} className="text-accent-foreground" />
              <div>
                <p className="font-display text-lg text-foreground">{totalQuestPoints} Points</p>
                <p className="font-body text-xs text-muted-foreground">{completedQuests} of {quests.length} quests completed</p>
              </div>
            </div>
            <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${quests.length ? (completedQuests / quests.length) * 100 : 0}%` }} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {quests.map((quest, i) => {
              const progress = questProgress[quest.id];
              const isCompleted = progress?.status === "completed";
              const isActive = activeQuest === quest.id || progress?.status === "started";
              const feedback = questFeedback[quest.id];

              return (
                <motion.div key={quest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className={`bg-card rounded-xl border p-5 ${isCompleted ? "border-primary/20 bg-primary/5" : "border-border"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isCompleted ? <CheckCircle2 size={16} className="text-primary" /> : <Trophy size={16} className="text-accent-foreground" />}
                      <span className="font-body text-[10px] text-muted-foreground uppercase">{quest.quest_type} • {quest.difficulty}</span>
                    </div>
                    <span className="font-body text-xs text-primary font-semibold">{quest.points} pts</span>
                  </div>
                  <h3 className="font-display text-base text-foreground mb-1">{quest.title}</h3>
                  <p className="font-body text-xs text-muted-foreground mb-3">{quest.description}</p>

                  {isCompleted && progress?.response && (
                    <div className="bg-muted/30 rounded-lg p-3 mb-3">
                      <p className="font-body text-[10px] text-muted-foreground font-semibold mb-1">Your response:</p>
                      <p className="font-body text-xs text-foreground">{progress.response}</p>
                      {progress.points_earned > 0 && (
                        <p className="font-body text-xs text-primary mt-1 font-semibold">Earned: {progress.points_earned} pts</p>
                      )}
                    </div>
                  )}

                  {feedback && (
                    <div className="bg-accent/5 rounded-lg p-3 mb-3 space-y-1">
                      <p className="font-body text-[10px] font-semibold text-accent-foreground">AI Feedback</p>
                      <p className="font-body text-xs text-foreground italic">{feedback.encouragement}</p>
                      {feedback.strengths?.length > 0 && (
                        <div>
                          <p className="font-body text-[10px] text-primary font-semibold">Strengths:</p>
                          {feedback.strengths.map((s: string, j: number) => <p key={j} className="font-body text-[10px] text-muted-foreground">• {s}</p>)}
                        </div>
                      )}
                      {feedback.suggestions?.length > 0 && (
                        <div>
                          <p className="font-body text-[10px] text-muted-foreground font-semibold">To explore:</p>
                          {feedback.suggestions.map((s: string, j: number) => <p key={j} className="font-body text-[10px] text-muted-foreground">• {s}</p>)}
                        </div>
                      )}
                    </div>
                  )}

                  {isActive && !isCompleted && (
                    <div className="space-y-2 mt-2">
                      <Textarea placeholder="Write your response..." value={activeQuest === quest.id ? questResponse : ""} onChange={e => { setActiveQuest(quest.id); setQuestResponse(e.target.value); }} rows={3} className="text-xs" />
                      <Button size="sm" onClick={() => submitQuestResponse(quest)} disabled={submittingQuest} className="bg-primary text-primary-foreground font-body text-xs w-full">
                        {submittingQuest ? <><Loader2 size={12} className="animate-spin" /> Submitting...</> : "Submit Response"}
                      </Button>
                    </div>
                  )}

                  {!isActive && !isCompleted && (
                    <Button size="sm" variant="outline" onClick={() => startQuest(quest.id)} className="w-full font-body text-xs">
                      <Zap size={12} /> Start Quest
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connected Features */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display text-lg text-foreground mb-3">Continue Your Journey</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Mindset Builder", path: "/dashboard/mindset-builder", icon: Zap, desc: "Build entrepreneurial habits" },
            { label: "MVP Builder", path: "/dashboard/mvp-builder", icon: Target, desc: "Start building prototypes" },
            { label: "AI Coach", path: "/dashboard/ai-coach", icon: Brain, desc: "Get personalized guidance" },
            { label: "Communities", path: "/dashboard/startup-communities", icon: Globe, desc: "Connect with peers" },
          ].map(link => (
            <Link key={link.path} to={link.path}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/30 transition-colors text-center">
              <link.icon size={16} className="text-primary mb-1" />
              <span className="font-body text-xs text-foreground font-medium">{link.label}</span>
              <span className="font-body text-[10px] text-muted-foreground">{link.desc}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default StartupSparks;
