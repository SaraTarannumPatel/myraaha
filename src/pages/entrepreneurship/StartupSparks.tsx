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
  CheckCircle2, AlertTriangle, ArrowRight, Eye, Search, Heart, X,
  Bookmark, ThumbsDown, MessageCircle, Trophy, Zap, Globe, GraduationCap,
  Compass, PenLine, Filter
} from "lucide-react";

type Tab = "ideas" | "my-ideas" | "problem-spotting" | "quests";

const sectors = [
  { value: "all", label: "All Sectors", icon: Globe },
  { value: "social_impact", label: "Social Impact", icon: Heart },
  { value: "tech_innovation", label: "Tech Innovation", icon: Zap },
  { value: "creative_industries", label: "Creative", icon: Sparkles },
  { value: "local_needs", label: "Local Needs", icon: Compass },
  { value: "emerging_trends", label: "Emerging Trends", icon: Target },
];

const StartupSparks = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("ideas");
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
    // Remove existing interaction first
    await supabase.from("idea_card_interactions").delete().eq("user_id", user.id).eq("idea_card_id", cardId);
    if (interactions[cardId] === type) {
      // Toggle off
      setInteractions(prev => { const n = { ...prev }; delete n[cardId]; return n; });
      return;
    }
    await supabase.from("idea_card_interactions").insert({ user_id: user.id, idea_card_id: cardId, interaction_type: type });
    setInteractions(prev => ({ ...prev, [cardId]: type }));
    if (type === "save") toast.success("Idea saved!");
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
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/startup-sparks-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: "generate_ideas", data: { interests: profile?.areas_of_focus?.join(", ") || profile?.industry, sector: sectorFilter !== "all" ? sectorFilter : undefined, userType: profile?.user_type } }),
      });
      if (!resp.ok) { const err = await resp.json().catch(() => ({})); toast.error(err.error || "Failed to generate"); setGeneratingCards(false); return; }
      const result = await resp.json();
      if (result.ideas) {
        for (const idea of result.ideas) {
          await supabase.from("idea_cards").insert({ ...idea, source: "ai_generated" });
        }
        fetchIdeaCards();
        toast.success(`${result.ideas.length} new idea cards generated!`);
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
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-validate-idea`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ idea }),
      });
      if (!resp.ok) { toast.error("Validation failed"); setValidating(null); return; }
      const result = await resp.json();
      setValidation(prev => ({ ...prev, [idea.id]: result }));
      if (result.score !== undefined) {
        await supabase.from("startup_ideas").update({ validation_score: result.score }).eq("id", idea.id);
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
      // Save observation first
      const { data: obs, error } = await supabase.from("problem_observations").insert({ user_id: user.id, observation: newObservation }).select().single();
      if (error) throw error;

      // Analyze with AI
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/startup-sparks-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: "analyze_problem", data: { observation: newObservation } }),
      });

      if (resp.ok) {
        const analysis = await resp.json();
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
      // Get AI feedback
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/startup-sparks-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ type: "quest_feedback", data: { questTitle: quest.title, questDescription: quest.description, response: questResponse } }),
      });

      let feedback: any = null;
      if (resp.ok) {
        feedback = await resp.json();
        setQuestFeedback(prev => ({ ...prev, [quest.id]: feedback }));
      }

      const pointsEarned = feedback?.score ? Math.round(quest.points * (feedback.score / 100)) : quest.points;
      await supabase.from("quest_progress").update({
        status: "completed", response: questResponse, completed_at: new Date().toISOString(), points_earned: pointsEarned,
      }).eq("user_id", user.id).eq("quest_id", quest.id);

      // Award achievement
      await supabase.from("achievements").insert({
        user_id: user.id,
        title: `Quest Complete: ${quest.title}`,
        description: `Earned ${pointsEarned} points`,
        achievement_type: "quest",
        points: pointsEarned,
      });

      toast.success(`Quest completed! +${pointsEarned} points 🏆`);
      setQuestResponse("");
      setActiveQuest(null);
      fetchQuests();
    } catch { toast.error("Failed to submit"); }
    setSubmittingQuest(false);
  };

  const totalQuestPoints = Object.values(questProgress).reduce((sum: number, p: any) => sum + (p.points_earned || 0), 0);
  const completedQuests = Object.values(questProgress).filter((p: any) => p.status === "completed").length;

  const tabs = [
    { id: "ideas" as Tab, label: "Idea Cards", icon: Lightbulb, count: filteredCards.length },
    { id: "my-ideas" as Tab, label: "My Ideas", icon: Star, count: myIdeas.length },
    { id: "problem-spotting" as Tab, label: "Problem Spotting", icon: Eye, count: observations.length },
    { id: "quests" as Tab, label: "Quests", icon: Trophy, count: `${completedQuests}/${quests.length}` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Lightbulb size={20} className="text-accent" />
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
      <div className="flex gap-1 bg-muted/30 rounded-lg p-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-body text-xs transition-all ${
              activeTab === tab.id ? "bg-card text-foreground shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
            }`}>
            <tab.icon size={14} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="text-[10px] bg-muted rounded-full px-1.5">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ===== IDEA CARDS TAB ===== */}
      {activeTab === "ideas" && (
        <div className="space-y-4">
          {/* Sector Filter + Generate */}
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

          {/* Cards Grid */}
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
                  {/* Interaction buttons */}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
                    <button onClick={() => interactWithCard(card.id, "like")}
                      className={`p-1.5 rounded-md transition-all ${interactions[card.id] === "like" ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"}`}>
                      <Heart size={14} className={interactions[card.id] === "like" ? "fill-accent" : ""} />
                    </button>
                    <button onClick={() => interactWithCard(card.id, "save")}
                      className={`p-1.5 rounded-md transition-all ${interactions[card.id] === "save" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                      <Bookmark size={14} className={interactions[card.id] === "save" ? "fill-primary" : ""} />
                    </button>
                    <button onClick={() => interactWithCard(card.id, "reject")}
                      className={`p-1.5 rounded-md transition-all ${interactions[card.id] === "reject" ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:text-foreground"}`}>
                      <ThumbsDown size={14} />
                    </button>
                    <button onClick={() => setShowNotesFor(showNotesFor === card.id ? null : card.id)}
                      className={`p-1.5 rounded-md transition-all ${ideaNotes[card.id] ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}>
                      <PenLine size={14} />
                    </button>
                  </div>
                  {/* Notes input */}
                  <AnimatePresence>
                    {showNotesFor === card.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="mt-2 space-y-2">
                          <Textarea placeholder="Why does this idea excite or challenge you?"
                            value={ideaNotes[card.id] || ""} onChange={e => setIdeaNotes(prev => ({ ...prev, [card.id]: e.target.value }))}
                            rows={2} className="text-xs" />
                          <Button size="sm" onClick={() => saveIdeaNote(card.id)} className="bg-primary text-primary-foreground font-body text-xs">
                            Save Note
                          </Button>
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
                  className={`bg-card rounded-xl border p-5 ${idea.is_active ? "border-accent/30" : "border-border opacity-60"}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-base text-foreground">{idea.title}</h3>
                    <button onClick={() => toggleActive(idea.id, idea.is_active)}>
                      <Star size={16} className={idea.is_active ? "text-accent fill-accent" : "text-muted-foreground"} />
                    </button>
                  </div>
                  {idea.category && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px] mb-2"><Tag size={10} /> {idea.category}</span>}
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
                  <Button size="sm" variant="outline" className="mt-3 w-full font-body text-xs" onClick={() => validateIdea(idea)} disabled={validating === idea.id}>
                    {validating === idea.id ? <><Loader2 size={12} className="animate-spin" /> Validating...</> : <><Brain size={12} /> AI Validate</>}
                  </Button>
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
                        {obs.scale && <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px]">Scale: {obs.scale}</span>}
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
              <Trophy size={20} className="text-accent" />
              <div>
                <p className="font-display text-lg text-foreground">{totalQuestPoints} Points</p>
                <p className="font-body text-xs text-muted-foreground">{completedQuests} of {quests.length} quests completed</p>
              </div>
            </div>
            <div className="h-2 w-32 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${quests.length ? (completedQuests / quests.length) * 100 : 0}%` }} />
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
                      {isCompleted ? <CheckCircle2 size={16} className="text-primary" /> : <Trophy size={16} className="text-accent" />}
                      <span className="font-body text-[10px] text-muted-foreground uppercase">{quest.quest_type} • {quest.difficulty}</span>
                    </div>
                    <span className="font-body text-xs text-accent font-semibold">{quest.points} pts</span>
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
                      <p className="font-body text-[10px] font-semibold text-accent">AI Feedback</p>
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
