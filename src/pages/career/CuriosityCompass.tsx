import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Compass, Sparkles, Heart, BookmarkPlus, X, ArrowRight, ArrowLeft,
  Trophy, Zap, MessageSquare, Palette, Target, Star, ChevronRight,
  Play, Check, Lightbulb, Brain, Smile, Meh, Frown, HelpCircle, Bot
} from "lucide-react";

const MOODS = [
  { id: "excited", label: "Excited", icon: Zap, color: "text-yellow-500" },
  { id: "curious", label: "Curious", icon: Lightbulb, color: "text-primary" },
  { id: "unsure", label: "Unsure", icon: HelpCircle, color: "text-muted-foreground" },
  { id: "bored", label: "Bored", icon: Meh, color: "text-orange-500" },
];

const MODES = [
  { id: "story", label: "Story Mode", icon: MessageSquare, desc: "Guided scenarios and reflections" },
  { id: "challenge", label: "Challenge Mode", icon: Target, desc: "Quick tasks and prompts" },
  { id: "visual", label: "Visual Mode", icon: Palette, desc: "Pick images and icons that resonate" },
];

const CuriosityCompass = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("explore");
  const [mode, setMode] = useState<string | null>(null);
  const [careerCards, setCareerCards] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<Record<string, string>>({});
  const [quests, setQuests] = useState<any[]>([]);
  const [questProgress, setQuestProgress] = useState<any[]>([]);
  const [activeQuest, setActiveQuest] = useState<any | null>(null);
  const [questResponses, setQuestResponses] = useState<Record<string, any>>({});
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [domains, setDomains] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [mood, setMood] = useState<string | null>(null);
  const startTimeRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    await Promise.all([fetchCareerCards(), fetchQuests(), fetchDomains(), fetchInterests()]);
    setLoading(false);
  };

  const fetchCareerCards = async () => {
    const [cardsRes, interactionsRes] = await Promise.all([
      supabase.from("career_cards").select("*").order("category"),
      supabase.from("career_card_interactions").select("*").eq("user_id", user!.id),
    ]);
    setCareerCards(cardsRes.data || []);
    const intMap: Record<string, string> = {};
    (interactionsRes.data || []).forEach((i: any) => {
      intMap[i.card_id] = i.interaction_type;
    });
    setInteractions(intMap);
  };

  const fetchQuests = async () => {
    const [questsRes, progressRes] = await Promise.all([
      supabase.from("curiosity_quests").select("*"),
      supabase.from("curiosity_quest_progress").select("*").eq("user_id", user!.id),
    ]);
    setQuests(questsRes.data || []);
    setQuestProgress(progressRes.data || []);
  };

  const fetchDomains = async () => {
    const { data } = await supabase.from("domain_recommendations").select("*").eq("user_id", user!.id).order("match_score", { ascending: false });
    setDomains(data || []);
  };

  const fetchInterests = async () => {
    const { data } = await supabase.from("interests").select("*").eq("user_id", user!.id);
    setInterests(data || []);
  };

  const startSession = async (selectedMode: string) => {
    setMode(selectedMode);
    const { data, error } = await supabase.from("exploration_sessions").insert({
      user_id: user!.id,
      session_type: "curiosity_compass",
      mode: selectedMode,
      mood_start: mood,
    }).select().single();
    if (data) setSessionId(data.id);
  };

  const handleCardInteraction = async (cardId: string, type: "like" | "save" | "skip") => {
    const startTime = startTimeRef.current[cardId] || Date.now();
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    await supabase.from("career_card_interactions").upsert({
      user_id: user!.id,
      card_id: cardId,
      interaction_type: type,
      time_spent_seconds: timeSpent,
    }, { onConflict: "user_id,card_id,interaction_type" });

    setInteractions(prev => ({ ...prev, [cardId]: type }));

    if (type === "like" || type === "save") {
      const card = careerCards.find(c => c.id === cardId);
      if (card) {
        await supabase.from("interests").upsert({
          user_id: user!.id,
          name: card.title,
          category: card.category,
          source: "curiosity_compass",
          strength: type === "save" ? 0.8 : 0.6,
        }, { onConflict: "user_id,name,category" });
      }
    }

    toast.success(type === "like" ? "Added to interests!" : type === "save" ? "Saved for later!" : "Noted!");
  };

  const handleCardView = (cardId: string) => {
    startTimeRef.current[cardId] = Date.now();
  };

  const startQuest = async (quest: any) => {
    setActiveQuest(quest);
    setCurrentPromptIndex(0);
    setQuestResponses({});

    const existing = questProgress.find(p => p.quest_id === quest.id);
    if (!existing) {
      await supabase.from("curiosity_quest_progress").insert({
        user_id: user!.id,
        quest_id: quest.id,
        status: "in_progress",
      });
    }
  };

  const handleQuestResponse = (promptIndex: number, value: any) => {
    setQuestResponses(prev => ({ ...prev, [promptIndex]: value }));
  };

  const completeQuest = async () => {
    if (!activeQuest) return;

    await supabase.from("curiosity_quest_progress").upsert({
      user_id: user!.id,
      quest_id: activeQuest.id,
      status: "completed",
      responses: questResponses,
      points_earned: activeQuest.points || 10,
      mood_checkpoint: mood,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,quest_id" });

    // Award achievement
    await supabase.from("achievements").insert({
      user_id: user!.id,
      achievement_type: "quest_completed",
      title: `Completed: ${activeQuest.title}`,
      description: `Finished the "${activeQuest.title}" quest`,
      points: activeQuest.points || 10,
    });

    toast.success(`Quest completed! +${activeQuest.points || 10} points 🎉`);
    setActiveQuest(null);
    fetchQuests();
    getAIFeedback();
  };

  const getAIRecommendations = async () => {
    setAiLoading(true);
    try {
      const likedCards = careerCards.filter(c => interactions[c.id] === "like" || interactions[c.id] === "save");
      const { data, error } = await supabase.functions.invoke("curiosity-compass-ai", {
        body: {
          type: "domain_recommendations",
          context: {
            likedCards,
            interests,
            questResponses: questProgress.map(p => p.responses),
            mood,
          }
        }
      });

      if (error) throw error;
      setAiInsights(data);

      // Save recommendations
      if (data?.recommendations) {
        for (const rec of data.recommendations) {
          await supabase.from("domain_recommendations").upsert({
            user_id: user!.id,
            domain_name: rec.domain_name,
            description: rec.description,
            match_score: rec.match_score / 100,
            reasons: rec.reasons,
          }, { onConflict: "user_id,domain_name" });
        }
        fetchDomains();
      }
    } catch (error: any) {
      if (error?.message?.includes("429") || error?.message?.includes("402")) {
        toast.error("AI service temporarily unavailable");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const getAIFeedback = async () => {
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("curiosity-compass-ai", {
        body: {
          type: "quest_feedback",
          context: {
            questResponses,
            questTitle: activeQuest?.title,
            interests,
            mood,
          }
        }
      });
      if (data) setAiInsights(data);
    } catch (error) {
      console.error("AI feedback error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const saveDomain = async (domainId: string) => {
    await supabase.from("domain_recommendations").update({ status: "saved" }).eq("id", domainId);
    toast.success("Domain saved for exploration!");
    fetchDomains();
  };

  const getQuestStatus = (questId: string) => {
    const progress = questProgress.find(p => p.quest_id === questId);
    return progress?.status || "not_started";
  };

  const likedCount = Object.values(interactions).filter(t => t === "like" || t === "save").length;
  const completedQuests = questProgress.filter(p => p.status === "completed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading your compass...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Compass size={24} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Curiosity Compass</h1>
            <p className="font-body text-muted-foreground">Let's explore what excites you. No right or wrong answers.</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-2">
                  <Heart className="text-pink-500" size={18} />
                </div>
                <p className="font-display text-2xl text-foreground">{likedCount}</p>
                <p className="font-body text-xs text-muted-foreground">Domains Liked</p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="text-yellow-500" size={18} />
                </div>
                <p className="font-display text-2xl text-foreground">{completedQuests}</p>
                <p className="font-body text-xs text-muted-foreground">Quests Done</p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2">
                  <Star className="text-green-500" size={18} />
                </div>
                <p className="font-display text-2xl text-foreground">{domains.length}</p>
                <p className="font-body text-xs text-muted-foreground">Recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mood Check */}
      {!mood && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">How are you feeling right now?</CardTitle>
              <CardDescription>This helps us personalize your exploration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 justify-center">
                {MOODS.map(m => (
                  <Button
                    key={m.id}
                    variant="outline"
                    className="flex flex-col gap-2 h-auto py-4 px-6"
                    onClick={() => setMood(m.id)}
                  >
                    <m.icon className={m.color} size={24} />
                    <span className="text-xs">{m.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Explore Tab - Career Cards */}
        <TabsContent value="explore" className="space-y-6">
          {!mode ? (
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Exploration Mode</CardTitle>
                <CardDescription>Pick a style that feels comfortable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {MODES.map(m => (
                    <button
                      key={m.id}
                      onClick={() => startSession(m.id)}
                      className="p-6 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <m.icon className="text-primary" size={24} />
                      </div>
                      <h3 className="font-display text-lg text-foreground mb-1">{m.label}</h3>
                      <p className="font-body text-sm text-muted-foreground">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
                  <ArrowLeft size={14} className="mr-2" /> Change Mode
                </Button>
                <Badge variant="secondary">{mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {careerCards.map((card, i) => {
                  const interaction = interactions[card.id];
                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onViewportEnter={() => handleCardView(card.id)}
                    >
                      <Card className={`h-full transition-all hover:shadow-lg ${
                        interaction === "like" ? "border-pink-500/50 bg-pink-500/5" :
                        interaction === "save" ? "border-primary/50 bg-primary/5" :
                        interaction === "skip" ? "opacity-50" : ""
                      }`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3 mb-4">
                            <span className="text-3xl">{card.icon_emoji}</span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-lg text-foreground">{card.title}</h3>
                              <Badge variant="outline" className="text-xs mt-1">{card.category}</Badge>
                            </div>
                          </div>
                          <p className="font-body text-sm text-muted-foreground mb-4">{card.description}</p>
                          <div className="flex flex-wrap gap-1 mb-4">
                            {card.tags?.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant={interaction === "like" ? "default" : "outline"}
                              size="sm"
                              className="flex-1"
                              onClick={() => handleCardInteraction(card.id, "like")}
                            >
                              <Heart size={14} className={interaction === "like" ? "fill-current" : ""} />
                            </Button>
                            <Button
                              variant={interaction === "save" ? "default" : "outline"}
                              size="sm"
                              className="flex-1"
                              onClick={() => handleCardInteraction(card.id, "save")}
                            >
                              <BookmarkPlus size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCardInteraction(card.id, "skip")}
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {likedCount >= 3 && (
                <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardContent className="pt-6 text-center">
                    <Sparkles className="mx-auto text-primary mb-3" size={32} />
                    <h3 className="font-display text-lg mb-2">Ready for AI Recommendations!</h3>
                    <p className="font-body text-sm text-muted-foreground mb-4">
                      Based on your selections, let's discover career domains that match your interests.
                    </p>
                    <Button onClick={getAIRecommendations} disabled={aiLoading}>
                      {aiLoading ? "Analyzing..." : "Get Recommendations"}
                      <ArrowRight size={14} className="ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Quests Tab */}
        <TabsContent value="quests" className="space-y-6">
          <AnimatePresence mode="wait">
            {activeQuest ? (
              <motion.div
                key="active-quest"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{activeQuest.title}</CardTitle>
                        <CardDescription>{activeQuest.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{activeQuest.points} pts</Badge>
                    </div>
                    <Progress value={(currentPromptIndex / (activeQuest.prompts?.length || 1)) * 100} className="mt-4" />
                  </CardHeader>
                  <CardContent>
                    {activeQuest.prompts && currentPromptIndex < activeQuest.prompts.length ? (
                      <div className="space-y-6">
                        <div className="p-6 rounded-xl bg-muted/30">
                          <p className="font-display text-lg text-foreground mb-4">
                            {activeQuest.prompts[currentPromptIndex].question}
                          </p>
                          {activeQuest.prompts[currentPromptIndex].type === "open" && (
                            <Textarea
                              placeholder="Share your thoughts..."
                              value={questResponses[currentPromptIndex] || ""}
                              onChange={(e) => handleQuestResponse(currentPromptIndex, e.target.value)}
                              rows={4}
                            />
                          )}
                          {activeQuest.prompts[currentPromptIndex].type === "choice" && (
                            <div className="space-y-2">
                              {activeQuest.prompts[currentPromptIndex].options?.map((opt: string) => (
                                <button
                                  key={opt}
                                  onClick={() => handleQuestResponse(currentPromptIndex, opt)}
                                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                                    questResponses[currentPromptIndex] === opt
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  <span className="font-body text-sm">{opt}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {activeQuest.prompts[currentPromptIndex].type === "multi" && (
                            <div className="flex flex-wrap gap-2">
                              {activeQuest.prompts[currentPromptIndex].options?.map((opt: string) => {
                                const selected = (questResponses[currentPromptIndex] || []).includes(opt);
                                return (
                                  <button
                                    key={opt}
                                    onClick={() => {
                                      const current = questResponses[currentPromptIndex] || [];
                                      handleQuestResponse(
                                        currentPromptIndex,
                                        selected ? current.filter((o: string) => o !== opt) : [...current, opt]
                                      );
                                    }}
                                    className={`px-4 py-2 rounded-full border transition-all ${
                                      selected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                                    }`}
                                  >
                                    <span className="font-body text-sm">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPromptIndex(Math.max(0, currentPromptIndex - 1))}
                            disabled={currentPromptIndex === 0}
                          >
                            <ArrowLeft size={14} className="mr-2" /> Back
                          </Button>
                          <Button
                            onClick={() => {
                              if (currentPromptIndex < activeQuest.prompts.length - 1) {
                                setCurrentPromptIndex(currentPromptIndex + 1);
                              } else {
                                completeQuest();
                              }
                            }}
                            disabled={!questResponses[currentPromptIndex]}
                          >
                            {currentPromptIndex < activeQuest.prompts.length - 1 ? "Next" : "Complete"}
                            <ArrowRight size={14} className="ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Check className="mx-auto text-green-500 mb-3" size={48} />
                        <h3 className="font-display text-xl mb-2">Quest Complete!</h3>
                        <p className="font-body text-muted-foreground">You earned {activeQuest.points} points</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="quest-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {quests.map((quest, i) => {
                  const status = getQuestStatus(quest.id);
                  const isCompleted = status === "completed";
                  return (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className={isCompleted ? "border-green-500/30 bg-green-500/5" : ""}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              quest.quest_type === "story" ? "bg-blue-500/10" :
                              quest.quest_type === "challenge" ? "bg-orange-500/10" :
                              "bg-purple-500/10"
                            }`}>
                              {quest.quest_type === "story" ? <MessageSquare className="text-blue-500" size={18} /> :
                               quest.quest_type === "challenge" ? <Target className="text-orange-500" size={18} /> :
                               <Palette className="text-purple-500" size={18} />}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-display text-lg text-foreground">{quest.title}</h3>
                              <p className="font-body text-sm text-muted-foreground">{quest.description}</p>
                            </div>
                            <Badge variant={isCompleted ? "default" : "secondary"}>
                              {isCompleted ? "Done" : `${quest.points} pts`}
                            </Badge>
                          </div>
                          {!isCompleted && (
                            <Button onClick={() => startQuest(quest)} className="w-full">
                              <Play size={14} className="mr-2" />
                              {status === "in_progress" ? "Continue" : "Start Quest"}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Domains Tab */}
        <TabsContent value="domains" className="space-y-6">
          {domains.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Brain className="mx-auto text-muted-foreground mb-4" size={48} />
                <h3 className="font-display text-xl mb-2">No Recommendations Yet</h3>
                <p className="font-body text-muted-foreground mb-4">
                  Like at least 3 career cards to get AI-powered domain recommendations
                </p>
                <Button variant="outline" onClick={() => setTab("explore")}>
                  Start Exploring <ArrowRight size={14} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {domains.map((domain, i) => (
                <motion.div
                  key={domain.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-2xl">🎯</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display text-lg text-foreground">{domain.domain_name}</h3>
                            <Badge variant="secondary">{Math.round(domain.match_score * 100)}% match</Badge>
                          </div>
                          <p className="font-body text-sm text-muted-foreground mb-3">{domain.description}</p>
                          {domain.reasons?.length > 0 && (
                            <div className="space-y-1 mb-3">
                              {domain.reasons.slice(0, 3).map((reason: string, j: number) => (
                                <p key={j} className="font-body text-xs text-muted-foreground flex items-center gap-2">
                                  <Check size={12} className="text-green-500" /> {reason}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            {domain.status !== "saved" && (
                              <Button variant="outline" size="sm" onClick={() => saveDomain(domain.id)}>
                                <BookmarkPlus size={14} className="mr-2" /> Save
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              Explore More <ChevronRight size={14} className="ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="text-primary" size={20} />
                AI Insights
              </CardTitle>
              <CardDescription>Personalized analysis based on your exploration</CardDescription>
            </CardHeader>
            <CardContent>
              {aiInsights ? (
                <div className="space-y-6">
                  {aiInsights.acknowledgment && (
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="font-body text-sm">{aiInsights.acknowledgment}</p>
                    </div>
                  )}

                  {aiInsights.insights?.map((insight: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <Lightbulb className="text-yellow-500 mt-0.5" size={16} />
                      <p className="font-body text-sm">{insight}</p>
                    </div>
                  ))}

                  {aiInsights.strengths_detected && (
                    <div>
                      <h4 className="font-display text-sm mb-2">Strengths Detected</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiInsights.strengths_detected.map((s: string, i: number) => (
                          <Badge key={i} variant="secondary">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiInsights.encouragement && (
                    <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                      <p className="font-body text-sm text-green-700 dark:text-green-300">{aiInsights.encouragement}</p>
                    </div>
                  )}

                  {aiInsights.reflection_prompt && (
                    <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                      <p className="font-body text-sm font-medium mb-2">Reflection Prompt:</p>
                      <p className="font-body text-sm text-muted-foreground">{aiInsights.reflection_prompt}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
                  <p className="font-body text-muted-foreground mb-4">
                    Complete some explorations to unlock AI insights
                  </p>
                  <Button variant="outline" onClick={getAIRecommendations} disabled={aiLoading || likedCount < 3}>
                    {aiLoading ? "Analyzing..." : "Generate Insights"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interest Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Your Interest Map</CardTitle>
            </CardHeader>
            <CardContent>
              {interests.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Start exploring to build your interest map</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <Badge key={interest.id} variant="outline" className="px-3 py-1">
                      {interest.name}
                      <span className="ml-1 opacity-50">({Math.round((interest.strength || 0.5) * 100)}%)</span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CuriosityCompass;
