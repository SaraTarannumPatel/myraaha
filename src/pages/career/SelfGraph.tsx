import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Brain, Plus, Sparkles, Target, TrendingUp, Zap, Eye,
  Calendar, RefreshCw, Shield, Users, Lightbulb, Heart,
  Activity, BarChart3, Compass, Clock, CheckCircle2,
  Download, GitBranch, ArrowRight
} from "lucide-react";

const TRAIT_CATEGORIES = {
  cognitive: { label: "Cognitive", color: "bg-blue" },
  emotional: { label: "Emotional", color: "bg-terracotta" },
  social: { label: "Social", color: "bg-green" },
  professional: { label: "Professional", color: "bg-indigo" },
};


const DOMAINS = ["Technology", "Design", "Business", "Healthcare", "Education", "Finance", "Science", "Arts"];

const SelfGraph = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("identity");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  // Data states
  const [traits, setTraits] = useState<any[]>([]);
  const [energyZones, setEnergyZones] = useState<any[]>([]);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [domainAffinity, setDomainAffinity] = useState<any[]>([]);
  const [clarityScores, setClarityScores] = useState<any[]>([]);
  const [weeklyDigests, setWeeklyDigests] = useState<any[]>([]);
  const [mentorShares, setMentorShares] = useState<any[]>([]);
  const [reflectionPrompts, setReflectionPrompts] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [decisionActions, setDecisionActions] = useState<any[]>([]);

  // AI-generated insights
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [currentReflection, setCurrentReflection] = useState<any>(null);

  // Form states
  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState("technical");
  const [reflectionResponse, setReflectionResponse] = useState("");
  const [energyDomain, setEnergyDomain] = useState("Technology");
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [energyMood, setEnergyMood] = useState("neutral");

  // Privacy toggle state
  const [privacySettings, setPrivacySettings] = useState({
    share_traits: false,
    share_energy: false,
    share_patterns: false,
    share_evaluations: false,
    share_clarity: false,
  });

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [
        traitsRes, energyRes, patternsRes, evalRes, affinityRes,
        clarityRes, digestsRes, sharesRes, promptsRes, skillsRes,
        interestsRes, actionsRes
      ] = await Promise.all([
        supabase.from("selfgraph_traits").select("*").eq("user_id", user!.id).order("score", { ascending: false }),
        supabase.from("energy_zones").select("*").eq("user_id", user!.id).order("recorded_at", { ascending: false }).limit(50),
        supabase.from("behavior_patterns").select("*").eq("user_id", user!.id).order("last_observed", { ascending: false }),
        supabase.from("identity_evaluations").select("*").eq("user_id", user!.id).order("evaluated_at", { ascending: false }),
        supabase.from("domain_affinity").select("*").eq("user_id", user!.id).order("affinity_score", { ascending: false }),
        supabase.from("clarity_scores").select("*").eq("user_id", user!.id).order("recorded_at", { ascending: false }),
        supabase.from("weekly_digests").select("*").eq("user_id", user!.id).order("week_start", { ascending: false }).limit(4),
        supabase.from("mentor_shares").select("*").eq("user_id", user!.id),
        supabase.from("reflection_prompts").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("skills").select("*").eq("user_id", user!.id).order("proficiency", { ascending: false }),
        supabase.from("interests").select("*").eq("user_id", user!.id),
        supabase.from("decision_actions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(30),
      ]);

      setTraits(traitsRes.data || []);
      setEnergyZones(energyRes.data || []);
      setPatterns(patternsRes.data || []);
      setEvaluations(evalRes.data || []);
      setDomainAffinity(affinityRes.data || []);
      setClarityScores(clarityRes.data || []);
      setWeeklyDigests(digestsRes.data || []);
      setMentorShares(sharesRes.data || []);
      setReflectionPrompts(promptsRes.data || []);
      setSkills(skillsRes.data || []);
      setInterests(interestsRes.data || []);
      setDecisionActions(actionsRes.data || []);

      // Load privacy settings from mentor_shares
      if (sharesRes.data && sharesRes.data.length > 0) {
        const s = sharesRes.data[0];
        setPrivacySettings({
          share_traits: s.share_traits || false,
          share_energy: s.share_energy || false,
          share_patterns: s.share_patterns || false,
          share_evaluations: s.share_evaluations || false,
          share_clarity: s.share_clarity || false,
        });
      }
    } catch (error) {
      console.error("Error fetching SelfGraph data:", error);
      toast.error("Failed to load SelfGraph data");
    }
    setLoading(false);
  };

  const analyzeTraits = async () => {
    setAiLoading(true);
    try {
      const [expRes, projRes, journalRes, cardRes, progressRes] = await Promise.all([
        supabase.from("experiences").select("*").eq("user_id", user!.id),
        supabase.from("projects").select("*").eq("user_id", user!.id),
        supabase.from("journal_entries").select("*").eq("user_id", user!.id).limit(20),
        supabase.from("career_card_interactions").select("*").eq("user_id", user!.id),
        supabase.from("user_learning_progress").select("*").eq("user_id", user!.id),
      ]);

      const { data, error } = await supabase.functions.invoke("selfgraph-ai", {
        body: {
          type: "analyze_traits",
          data: {
            experiences: expRes.data || [],
            projects: projRes.data || [],
            skills,
            interests,
            journalEntries: journalRes.data || [],
            cardInteractions: cardRes.data || [],
            learningProgress: progressRes.data || [],
          },
        },
      });

      if (error) throw error;

      if (data.data?.traits) {
        for (const trait of data.data.traits) {
          await supabase.from("selfgraph_traits").upsert({
            user_id: user!.id,
            trait_name: trait.trait_name,
            trait_category: trait.trait_category,
            score: trait.score,
            confidence: trait.confidence,
            evidence: trait.evidence,
            source: "ai",
          }, { onConflict: "user_id,trait_name" });
        }
      }

      fetchAll();
      toast.success("Traits analyzed successfully!");
    } catch (error) {
      console.error("Error analyzing traits:", error);
      toast.error("Failed to analyze traits");
    }
    setAiLoading(false);
  };

  const analyzePatterns = async () => {
    setAiLoading(true);
    try {
      const [actionsRes, journalRes] = await Promise.all([
        supabase.from("decision_actions").select("*").eq("user_id", user!.id),
        supabase.from("journal_entries").select("mood, created_at").eq("user_id", user!.id),
      ]);

      const { data, error } = await supabase.functions.invoke("selfgraph-ai", {
        body: {
          type: "analyze_patterns",
          data: {
            actions: actionsRes.data || [],
            energyZones,
            tasks: skills,
            moods: journalRes.data || [],
            timeByDomain: domainAffinity,
          },
        },
      });

      if (error) throw error;

      if (data.data?.patterns) {
        for (const pattern of data.data.patterns) {
          await supabase.from("behavior_patterns").insert({
            user_id: user!.id,
            pattern_type: pattern.pattern_type,
            pattern_description: pattern.pattern_description,
            frequency: pattern.frequency,
            strength: pattern.strength,
            domains_affected: pattern.domains_affected,
            is_positive: pattern.is_positive,
            ai_generated: true,
          });
        }
      }

      fetchAll();
      toast.success("Patterns identified!");
    } catch (error) {
      console.error("Error analyzing patterns:", error);
      toast.error("Failed to analyze patterns");
    }
    setAiLoading(false);
  };

  const calculateClarity = async () => {
    setAiLoading(true);
    try {
      const [journalRes, activityRes] = await Promise.all([
        supabase.from("journal_entries").select("mood, created_at").eq("user_id", user!.id).limit(20),
        supabase.from("decision_actions").select("*").eq("user_id", user!.id).limit(20),
      ]);

      const { data, error } = await supabase.functions.invoke("selfgraph-ai", {
        body: {
          type: "calculate_clarity",
          data: {
            goals: { short: (profile as any)?.short_term_goals, long: (profile as any)?.long_term_goals },
            activities: activityRes.data || [],
            interests,
            moods: journalRes.data || [],
            domainAffinity,
            taskCompletion: { completed: skills.length, abandoned: 0 },
          },
        },
      });

      if (error) throw error;

      if (data.data) {
        await supabase.from("clarity_scores").insert({
          user_id: user!.id,
          overall_clarity: data.data.overall_clarity,
          goal_alignment: data.data.goal_alignment,
          interest_alignment: data.data.interest_alignment,
          activity_alignment: data.data.activity_alignment,
          direction_confidence: data.data.direction_confidence,
          reflection_prompt: data.data.reflection_prompt,
          factors: data.data.factors,
        });
      }

      fetchAll();
      toast.success("Clarity calculated!");
    } catch (error) {
      console.error("Error calculating clarity:", error);
      toast.error("Failed to calculate clarity");
    }
    setAiLoading(false);
  };

  const runIdentityEvaluation = async () => {
    setAiLoading(true);
    try {
      const [actionsRes, journalRes, reflectionsRes] = await Promise.all([
        supabase.from("decision_actions").select("*").eq("user_id", user!.id).limit(20),
        supabase.from("journal_entries").select("*").eq("user_id", user!.id).limit(10),
        supabase.from("reflection_prompts").select("*").eq("user_id", user!.id).not("user_response", "is", null),
      ]);

      const { data, error } = await supabase.functions.invoke("selfgraph-ai", {
        body: {
          type: "identity_evaluation",
          data: {
            previousEvaluation: evaluations[0] || {},
            recentActions: actionsRes.data || [],
            challenges: [],
            feedback: [],
            reflections: reflectionsRes.data || [],
            moodTrends: journalRes.data?.map((j: any) => ({ mood: j.mood, date: j.created_at })),
          },
        },
      });

      if (error) throw error;

      if (data.data) {
        await supabase.from("identity_evaluations").insert({
          user_id: user!.id,
          evaluation_type: "periodic",
          confidence_score: data.data.confidence_score,
          resilience_score: data.data.resilience_score,
          adaptability_score: data.data.adaptability_score,
          creativity_score: data.data.creativity_score,
          leadership_score: data.data.leadership_score,
          collaboration_score: data.data.collaboration_score,
          problem_solving_score: data.data.problem_solving_score,
          emotional_intelligence_score: data.data.emotional_intelligence_score,
          overall_growth: data.data.overall_growth,
          ai_feedback: data.data.ai_feedback,
        });
      }

      fetchAll();
      toast.success("Identity evaluation complete!");
    } catch (error) {
      console.error("Error running evaluation:", error);
      toast.error("Failed to run evaluation");
    }
    setAiLoading(false);
  };

  const generateInsights = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("selfgraph-ai", {
        body: {
          type: "generate_insights",
          data: {
            traits,
            patterns,
            energyZones,
            clarityScore: clarityScores[0]?.overall_clarity || 0.5,
            goals: { short: (profile as any)?.short_term_goals, long: (profile as any)?.long_term_goals },
            recentProgress: evaluations.slice(0, 3),
          },
        },
      });

      if (error) throw error;
      setAiInsights(data.data);
      toast.success("Insights generated!");
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate insights");
    }
    setAiLoading(false);
  };

  const generateWeeklyDigest = async () => {
    setAiLoading(true);
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 7);

      const [journalRes, achRes] = await Promise.all([
        supabase.from("journal_entries").select("mood, created_at").eq("user_id", user!.id).gte("created_at", weekStart.toISOString()),
        supabase.from("achievements").select("*").eq("user_id", user!.id).gte("earned_at", weekStart.toISOString()),
      ]);

      const { data, error } = await supabase.functions.invoke("selfgraph-ai", {
        body: {
          type: "generate_weekly_digest",
          data: {
            weekStart: weekStart.toISOString().split("T")[0],
            weekEnd: now.toISOString().split("T")[0],
            activities: decisionActions.filter(a => new Date(a.created_at) >= weekStart),
            skills,
            moods: journalRes.data || [],
            energyLogs: energyZones.filter(e => new Date(e.recorded_at) >= weekStart),
            achievements: achRes.data || [],
            challenges: [],
            timeByDomain: domainAffinity,
          },
        },
      });

      if (error) throw error;

      if (data.data) {
        await supabase.from("weekly_digests").insert({
          user_id: user!.id,
          week_start: weekStart.toISOString().split("T")[0],
          week_end: now.toISOString().split("T")[0],
          ai_summary: data.data.ai_summary,
          skills_progress: data.data.skills_progress,
          mood_summary: data.data.mood_summary,
          energy_patterns: data.data.energy_patterns,
          domain_shifts: data.data.domain_shifts,
          key_achievements: data.data.key_achievements || [],
          challenges_faced: data.data.challenges_faced || [],
          recommendations: data.data.recommendations,
        });
      }

      fetchAll();
      toast.success("Weekly digest generated!");
    } catch (error) {
      console.error("Error generating digest:", error);
      toast.error("Failed to generate weekly digest");
    }
    setAiLoading(false);
  };

  const generateReflectionPrompt = async (activity?: string) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("selfgraph-ai", {
        body: {
          type: "reflection_prompt",
          data: {
            activity: activity || "general exploration",
            activityType: "task",
            mood: "neutral",
            domain: domainAffinity[0]?.domain_name || "general",
          },
        },
      });

      if (error) throw error;

      const { data: promptData } = await supabase.from("reflection_prompts").insert({
        user_id: user!.id,
        prompt_text: data.data.prompt_text,
        context: data.data.context,
        trigger_type: "manual",
      }).select().single();

      setCurrentReflection(promptData);
      toast.success("Reflection prompt ready!");
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error("Failed to generate prompt");
    }
    setAiLoading(false);
  };

  const submitReflection = async () => {
    if (!currentReflection || !reflectionResponse.trim()) return;

    await supabase.from("reflection_prompts").update({
      user_response: reflectionResponse,
      responded_at: new Date().toISOString(),
    }).eq("id", currentReflection.id);

    setCurrentReflection(null);
    setReflectionResponse("");
    fetchAll();
    toast.success("Reflection saved!");
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    const { error } = await supabase.from("skills").insert({
      user_id: user!.id,
      name: newSkill.trim(),
      category: newCategory,
      proficiency: 1,
    });
    if (error) {
      toast.error("Failed to add skill");
      return;
    }
    setNewSkill("");
    fetchAll();
    toast.success("Skill added!");
  };

  const recordEnergy = async () => {
    if (!energyLevel) return;
    await supabase.from("energy_zones").insert({
      user_id: user!.id,
      domain: energyDomain,
      energy_level: energyLevel,
      mood_after: energyMood,
    });
    setEnergyLevel(null);
    fetchAll();
    toast.success("Energy recorded!");
  };

  const updateDomainAffinity = async (domain: string, delta: number) => {
    const existing = domainAffinity.find(d => d.domain_name === domain);
    if (existing) {
      const newScore = Math.max(0, Math.min(1, existing.affinity_score + delta));
      await supabase.from("domain_affinity").update({
        affinity_score: newScore,
        last_interaction: new Date().toISOString(),
      }).eq("id", existing.id);
    } else {
      await supabase.from("domain_affinity").insert({
        user_id: user!.id,
        domain_name: domain,
        affinity_score: 0.5 + delta,
      });
    }
    fetchAll();
  };

  const togglePrivacy = async (key: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
    const existing = mentorShares[0];
    if (existing) {
      await supabase.from("mentor_shares").update({ [key]: value }).eq("id", existing.id);
    } else {
      await supabase.from("mentor_shares").insert({
        user_id: user!.id,
        mentor_id: user!.id, // self-reference placeholder
        [key]: value,
      });
      fetchAll();
    }
  };

  const exportData = () => {
    const exportPayload = {
      exported_at: new Date().toISOString(),
      traits,
      skills,
      interests,
      energy_zones: energyZones,
      behavior_patterns: patterns,
      evaluations,
      domain_affinity: domainAffinity,
      clarity_scores: clarityScores,
      weekly_digests: weeklyDigests,
      reflection_prompts: reflectionPrompts,
      decision_actions: decisionActions,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `selfgraph-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  };

  const getLatestClarity = () => clarityScores[0] || { overall_clarity: 0, goal_alignment: 0, interest_alignment: 0, activity_alignment: 0, direction_confidence: 0 };
  const getLatestEvaluation = () => evaluations[0] || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center">
              <Brain size={24} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">SelfGraph™</h1>
              <p className="font-body text-sm text-muted-foreground">
                Here's what you're becoming — insights from everything you've done, learned, and felt
              </p>
            </div>
          </div>
          <Button onClick={generateInsights} disabled={aiLoading} variant="outline" size="sm">
            {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate Insights
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Clarity Score", value: `${Math.round(getLatestClarity().overall_clarity * 100)}%` },
          { label: "Traits Mapped", value: traits.length },
          { label: "Patterns Found", value: patterns.length },
          { label: "Evaluations", value: evaluations.length },
          { label: "Decisions Tracked", value: decisionActions.length },
        ].map(({ label, value }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-4 text-center">
              <div className="font-display text-3xl text-accent">{value}</div>
              <p className="font-body text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
          <TabsTrigger value="identity" className="font-body text-sm">Identity Web</TabsTrigger>
          <TabsTrigger value="energy" className="font-body text-sm">Energy Zones</TabsTrigger>
          <TabsTrigger value="patterns" className="font-body text-sm">Patterns</TabsTrigger>
          <TabsTrigger value="evaluation" className="font-body text-sm">Evaluation</TabsTrigger>
          <TabsTrigger value="domains" className="font-body text-sm">Domain Affinity</TabsTrigger>
          <TabsTrigger value="clarity" className="font-body text-sm">Clarity Meter</TabsTrigger>
          <TabsTrigger value="decisions" className="font-body text-sm">Decision Mirror</TabsTrigger>
          <TabsTrigger value="digest" className="font-body text-sm">Weekly Digest</TabsTrigger>
          <TabsTrigger value="insights" className="font-body text-sm">AI Insights</TabsTrigger>
          <TabsTrigger value="privacy" className="font-body text-sm">Privacy</TabsTrigger>
        </TabsList>

        {/* ===== Identity Web Tab ===== */}
        <TabsContent value="identity" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl text-foreground">Identity Web</h3>
            <Button onClick={analyzeTraits} disabled={aiLoading} variant="outline" size="sm">
              {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Brain size={16} />}
              Analyze Traits
            </Button>
          </div>

          {traits.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Radar visualization as bars */}
              <Card className="border-border">
                <CardHeader><CardTitle className="font-display text-lg">Trait Strengths</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {traits.slice(0, 12).map((trait, i) => (
                      <div key={trait.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-body text-sm text-foreground capitalize">{trait.trait_name.replace(/_/g, " ")}</span>
                          <span className="font-body text-xs text-muted-foreground">{Math.round(trait.score * 100)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${trait.score * 100}%` }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                            className={`h-full rounded-full ${TRAIT_CATEGORIES[trait.trait_category as keyof typeof TRAIT_CATEGORIES]?.color || "bg-accent"}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader><CardTitle className="font-display text-lg">Trait Categories</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(TRAIT_CATEGORIES).map(([key, { label, color }]) => {
                      const categoryTraits = traits.filter(t => t.trait_category === key);
                      const avgScore = categoryTraits.length > 0
                        ? categoryTraits.reduce((sum, t) => sum + t.score, 0) / categoryTraits.length
                        : 0;
                      return (
                        <div key={key} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-body text-sm font-medium text-foreground">{label}</span>
                            <span className="font-body text-xs text-muted-foreground">
                              {categoryTraits.length} traits • {Math.round(avgScore * 100)}% avg
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {categoryTraits.slice(0, 4).map(t => (
                              <span key={t.id} className={`px-2 py-0.5 rounded text-xs text-white ${color}`}>
                                {t.trait_name.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No traits analyzed yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Click "Analyze Traits" to map your identity based on your activities</p>
            </div>
          )}

          {/* Skills section */}
          <Card className="border-border">
            <CardHeader><CardTitle className="font-display text-lg">Skills Inventory</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
                  <option value="technical">Technical</option>
                  <option value="creative">Creative</option>
                  <option value="leadership">Leadership</option>
                  <option value="analytical">Analytical</option>
                  <option value="communication">Communication</option>
                </select>
                <Input placeholder="Add a skill..." value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} />
                <Button onClick={addSkill} className="gradient-warm text-secondary-foreground"><Plus size={18} /></Button>
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span key={skill.id} className="px-3 py-1.5 rounded-full bg-accent/10 text-accent font-body text-sm">
                      {skill.name}
                      <span className="ml-1 text-xs opacity-60">{"●".repeat(skill.proficiency || 1)}</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-muted-foreground text-center py-4">Add skills to enhance your identity profile</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Energy Zones Tab ===== */}
        <TabsContent value="energy" className="space-y-4">
          <h3 className="font-display text-xl text-foreground">Energy Zones Dashboard</h3>
          <p className="font-body text-sm text-muted-foreground">Track where you feel energized or drained across different activities</p>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2"><Zap size={18} className="text-accent" />Energy by Domain</CardTitle>
              </CardHeader>
              <CardContent>
                {domainAffinity.length > 0 ? (
                  <div className="space-y-3">
                    {domainAffinity.map(domain => {
                      const domainEnergy = energyZones.filter(e => e.domain === domain.domain_name);
                      const avgEnergy = domainEnergy.length > 0 ? domainEnergy.reduce((sum, e) => sum + e.energy_level, 0) / domainEnergy.length : 5;
                      return (
                        <div key={domain.id} className="flex items-center gap-3">
                          <span className="font-body text-sm text-foreground w-24 truncate">{domain.domain_name}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${avgEnergy >= 7 ? "bg-green-500" : avgEnergy >= 4 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${avgEnergy * 10}%` }} />
                          </div>
                          <span className="font-body text-xs text-muted-foreground w-8">{avgEnergy.toFixed(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-body text-sm text-muted-foreground text-center py-4">Start tracking energy in different domains</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader><CardTitle className="font-display text-lg">Log Energy Now</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-2 block">Domain</label>
                    <select value={energyDomain} onChange={(e) => setEnergyDomain(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
                      {DOMAINS.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-2 block">Energy Level (1-10)</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                        <button
                          key={level}
                          onClick={() => setEnergyLevel(level)}
                          className={`w-8 h-8 rounded border text-sm font-body transition-colors ${
                            energyLevel === level ? "bg-accent text-accent-foreground border-accent" :
                            level <= 3 ? "border-red-300 hover:bg-red-100" :
                            level <= 6 ? "border-yellow-300 hover:bg-yellow-100" :
                            "border-green-300 hover:bg-green-100"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-body text-sm text-muted-foreground mb-2 block">Mood</label>
                    <div className="flex gap-2">
                      {["😊 Happy", "😐 Neutral", "😩 Drained", "🔥 Energized", "😰 Anxious"].map(m => {
                        const val = m.split(" ")[1].toLowerCase();
                        return (
                          <button key={val} onClick={() => setEnergyMood(val)} className={`px-3 py-1.5 rounded-full text-xs font-body border transition-colors ${energyMood === val ? "bg-accent text-accent-foreground border-accent" : "border-input hover:bg-muted"}`}>
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <Button onClick={recordEnergy} disabled={!energyLevel} className="w-full gradient-warm text-secondary-foreground">
                    <Zap size={16} /> Record Energy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {energyZones.length > 0 && (
            <Card className="border-border">
              <CardHeader><CardTitle className="font-display text-lg">Recent Energy Logs</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {energyZones.slice(0, 10).map(zone => (
                    <div key={zone.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${zone.energy_level >= 7 ? "bg-green-500" : zone.energy_level >= 4 ? "bg-yellow-500" : "bg-red-500"}`} />
                        <span className="font-body text-sm text-foreground">{zone.domain}</span>
                        {zone.mood_after && <span className="font-body text-xs text-muted-foreground">({zone.mood_after})</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-body text-sm text-muted-foreground">Energy: {zone.energy_level}/10</span>
                        <span className="font-body text-xs text-muted-foreground">{new Date(zone.recorded_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== Patterns Tab ===== */}
        <TabsContent value="patterns" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-foreground">Pattern Tracker Timeline</h3>
              <p className="font-body text-sm text-muted-foreground">Recurring behaviors and tendencies identified from your activities</p>
            </div>
            <Button onClick={analyzePatterns} disabled={aiLoading} variant="outline" size="sm">
              {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Activity size={16} />}
              Analyze Patterns
            </Button>
          </div>

          {patterns.length > 0 ? (
            <div className="space-y-4">
              {patterns.map(pattern => (
                <Card key={pattern.id} className={`border-l-4 ${pattern.is_positive ? "border-l-green-500" : "border-l-orange-500"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-body ${
                            pattern.pattern_type === "habit" ? "bg-blue-500/10 text-blue-600" :
                            pattern.pattern_type === "preference" ? "bg-purple-500/10 text-purple-600" :
                            pattern.pattern_type === "tendency" ? "bg-green-500/10 text-green-600" :
                            "bg-orange-500/10 text-orange-600"
                          }`}>{pattern.pattern_type}</span>
                          <span className="font-body text-xs text-muted-foreground">{pattern.frequency} • {pattern.occurrences} occurrences</span>
                        </div>
                        <p className="font-body text-foreground">{pattern.pattern_description}</p>
                        {pattern.domains_affected?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {pattern.domains_affected.map((domain: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-xs">{domain}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-display text-xl text-accent">{Math.round(pattern.strength * 100)}%</div>
                        <p className="font-body text-xs text-muted-foreground">strength</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No patterns identified yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Click "Analyze Patterns" to discover your behavioral tendencies</p>
            </div>
          )}
        </TabsContent>

        {/* ===== Evaluation Tab ===== */}
        <TabsContent value="evaluation" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-foreground">Identity Evaluation Tracker</h3>
              <p className="font-body text-sm text-muted-foreground">Periodic assessments of your confidence, resilience, and adaptability</p>
            </div>
            <Button onClick={runIdentityEvaluation} disabled={aiLoading} variant="outline" size="sm">
              {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Target size={16} />}
              Run Evaluation
            </Button>
          </div>

          {evaluations.length > 0 ? (
            <div className="space-y-4">
              <Card className="border-border bg-gradient-to-br from-accent/5 to-accent/10">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Latest Evaluation</CardTitle>
                  <CardDescription className="font-body">{new Date(getLatestEvaluation().evaluated_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Confidence", value: getLatestEvaluation().confidence_score, icon: Heart },
                      { label: "Resilience", value: getLatestEvaluation().resilience_score, icon: Shield },
                      { label: "Adaptability", value: getLatestEvaluation().adaptability_score, icon: RefreshCw },
                      { label: "Creativity", value: getLatestEvaluation().creativity_score, icon: Lightbulb },
                      { label: "Leadership", value: getLatestEvaluation().leadership_score, icon: Users },
                      { label: "Collaboration", value: getLatestEvaluation().collaboration_score, icon: Users },
                      { label: "Problem Solving", value: getLatestEvaluation().problem_solving_score, icon: Brain },
                      { label: "EQ", value: getLatestEvaluation().emotional_intelligence_score, icon: Heart },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="text-center p-3 rounded-lg bg-background">
                        <Icon size={20} className="mx-auto text-accent mb-2" />
                        <div className="font-display text-2xl text-foreground">{Math.round((value || 0) * 100)}%</div>
                        <p className="font-body text-xs text-muted-foreground">{label}</p>
                      </div>
                    ))}
                  </div>
                  {getLatestEvaluation().ai_feedback && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/50">
                      <h4 className="font-body font-medium text-foreground mb-2">AI Feedback</h4>
                      <p className="font-body text-sm text-muted-foreground">{getLatestEvaluation().ai_feedback?.growth_since_last || "Keep up the great work!"}</p>
                      {getLatestEvaluation().ai_feedback?.strengths_shown?.length > 0 && (
                        <div className="mt-2">
                          <span className="font-body text-xs text-muted-foreground">Strengths: </span>
                          {getLatestEvaluation().ai_feedback.strengths_shown.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 font-body text-xs mr-1">{s}</span>
                          ))}
                        </div>
                      )}
                      {getLatestEvaluation().ai_feedback?.areas_for_growth?.length > 0 && (
                        <div className="mt-2">
                          <span className="font-body text-xs text-muted-foreground">Growth areas: </span>
                          {getLatestEvaluation().ai_feedback.areas_for_growth.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 font-body text-xs mr-1">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {evaluations.length > 1 && (
                <Card className="border-border">
                  <CardHeader><CardTitle className="font-display text-lg">Evaluation History</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {evaluations.slice(1, 5).map(evaluation => (
                        <div key={evaluation.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="font-body text-sm text-foreground">{new Date(evaluation.evaluated_at).toLocaleDateString()}</span>
                          <span className={`font-body text-sm ${(evaluation.overall_growth || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {(evaluation.overall_growth || 0) >= 0 ? "+" : ""}{Math.round((evaluation.overall_growth || 0) * 100)}% growth
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No evaluations yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Click "Run Evaluation" to assess your identity development</p>
            </div>
          )}
        </TabsContent>

        {/* ===== Domain Affinity Tab ===== */}
        <TabsContent value="domains" className="space-y-4">
          <h3 className="font-display text-xl text-foreground">Domain Affinity Tracker</h3>
          <p className="font-body text-sm text-muted-foreground">Your evolving interest levels across different career domains</p>

          <div className="grid md:grid-cols-2 gap-4">
            {domainAffinity.length > 0 ? (
              domainAffinity.map(domain => (
                <Card key={domain.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-body font-medium text-foreground">{domain.domain_name}</h4>
                        <p className="font-body text-xs text-muted-foreground">
                          {domain.tasks_completed || 0} tasks • {domain.time_invested_minutes || 0} mins invested
                        </p>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-xs font-body ${
                        domain.trend === "growing" ? "bg-green-500/10 text-green-600" :
                        domain.trend === "declining" ? "bg-red-500/10 text-red-600" :
                        "bg-muted text-muted-foreground"
                      }`}>{domain.trend || "stable"}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-body text-sm text-muted-foreground">Affinity</span>
                        <span className="font-body text-sm text-accent">{Math.round(domain.affinity_score * 100)}%</span>
                      </div>
                      <Progress value={domain.affinity_score * 100} className="h-2" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => updateDomainAffinity(domain.domain_name, 0.1)}>
                        <TrendingUp size={14} /> Increase
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => updateDomainAffinity(domain.domain_name, -0.1)}>Decrease</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <Compass size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="font-body text-muted-foreground">No domain affinities tracked yet</p>
                <p className="font-body text-sm text-muted-foreground mt-1">Explore content and complete tasks to build your affinity map</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ===== Clarity Meter Tab ===== */}
        <TabsContent value="clarity" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-foreground">Clarity Meter</h3>
              <p className="font-body text-sm text-muted-foreground">How aligned you feel with your goals, interests, and activities</p>
            </div>
            <Button onClick={calculateClarity} disabled={aiLoading} variant="outline" size="sm">
              {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <BarChart3 size={16} />}
              Calculate Clarity
            </Button>
          </div>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                    <circle cx="64" cy="64" r="56" fill="none" strokeWidth="8" className="text-accent" strokeDasharray={`${getLatestClarity().overall_clarity * 352} 352`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-3xl text-foreground">{Math.round(getLatestClarity().overall_clarity * 100)}%</span>
                  </div>
                </div>
                <p className="font-body text-muted-foreground">Overall Clarity</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Goal Alignment", value: getLatestClarity().goal_alignment },
                  { label: "Interest Alignment", value: getLatestClarity().interest_alignment },
                  { label: "Activity Alignment", value: getLatestClarity().activity_alignment },
                  { label: "Direction Confidence", value: getLatestClarity().direction_confidence },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="font-display text-xl text-foreground">{Math.round((value || 0) * 100)}%</div>
                    <p className="font-body text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              {clarityScores[0]?.reflection_prompt && (
                <div className="mt-6 p-4 rounded-lg bg-accent/5 border border-accent/10">
                  <h4 className="font-body font-medium text-foreground mb-2 flex items-center gap-2">
                    <Lightbulb size={16} className="text-accent" />Reflection Prompt
                  </h4>
                  <p className="font-body text-muted-foreground">{clarityScores[0].reflection_prompt}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clarity history */}
          {clarityScores.length > 1 && (
            <Card className="border-border">
              <CardHeader><CardTitle className="font-display text-lg">Clarity History</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {clarityScores.slice(0, 8).map((cs, i) => (
                    <div key={cs.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="font-body text-sm text-foreground">{new Date(cs.recorded_at).toLocaleDateString()}</span>
                      <div className="flex items-center gap-3">
                        <Progress value={cs.overall_clarity * 100} className="h-2 w-24" />
                        <span className="font-body text-sm text-accent w-12 text-right">{Math.round(cs.overall_clarity * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reflection */}
          <Card className="border-border">
            <CardHeader><CardTitle className="font-display text-lg">Reflection Prompts</CardTitle></CardHeader>
            <CardContent>
              {currentReflection ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-accent/5">
                    <p className="font-body text-foreground mb-2">{currentReflection.prompt_text}</p>
                    <p className="font-body text-xs text-muted-foreground">{currentReflection.context}</p>
                  </div>
                  <Textarea placeholder="Write your reflection..." value={reflectionResponse} onChange={(e) => setReflectionResponse(e.target.value)} rows={4} />
                  <Button onClick={submitReflection} className="gradient-warm text-secondary-foreground"><CheckCircle2 size={16} /> Save Reflection</Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Button onClick={() => generateReflectionPrompt()} disabled={aiLoading} variant="outline">
                    {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Lightbulb size={16} />}
                    Generate Reflection Prompt
                  </Button>
                </div>
              )}

              {/* Past reflections */}
              {reflectionPrompts.filter(r => r.user_response).length > 0 && (
                <div className="mt-4 space-y-3">
                  <h4 className="font-body text-sm font-medium text-muted-foreground">Past Reflections</h4>
                  {reflectionPrompts.filter(r => r.user_response).slice(0, 5).map(r => (
                    <div key={r.id} className="p-3 rounded-lg bg-muted/30">
                      <p className="font-body text-xs text-muted-foreground mb-1">{r.prompt_text}</p>
                      <p className="font-body text-sm text-foreground">{r.user_response}</p>
                      <p className="font-body text-xs text-muted-foreground mt-1">{new Date(r.responded_at || r.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Decision Mirror Tab ===== */}
        <TabsContent value="decisions" className="space-y-4">
          <h3 className="font-display text-xl text-foreground flex items-center gap-2">
            <GitBranch size={20} className="text-accent" />Decision Mirror
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            See how past decisions shaped your current journey and readiness
          </p>

          {decisionActions.length > 0 ? (
            <div className="space-y-4">
              {/* Decision impact summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <div className="font-display text-3xl text-accent">
                      {decisionActions.filter(d => (d.impact_score || 0) >= 7).length}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">High-Impact Decisions</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <div className="font-display text-3xl text-accent">
                      {[...new Set(decisionActions.flatMap(d => d.domains_explored || []))].length}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">Domains Explored</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-4 text-center">
                    <div className="font-display text-3xl text-accent">
                      {[...new Set(decisionActions.flatMap(d => d.skills_gained || []))].length}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">Skills Gained</p>
                  </CardContent>
                </Card>
              </div>

              {/* Decision timeline */}
              <Card className="border-border">
                <CardHeader><CardTitle className="font-display text-lg">Decision Timeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-6">
                      {decisionActions.slice(0, 15).map((action, i) => (
                        <div key={action.id} className="relative pl-10">
                          <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-background ${
                            (action.impact_score || 0) >= 7 ? "bg-green-500" :
                            (action.impact_score || 0) >= 4 ? "bg-yellow-500" : "bg-muted-foreground"
                          }`} />
                          <div className="p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-body text-sm font-medium text-foreground">{action.action_title}</span>
                              <span className="font-body text-xs text-muted-foreground">{new Date(action.created_at).toLocaleDateString()}</span>
                            </div>
                            {action.action_description && (
                              <p className="font-body text-xs text-muted-foreground mb-2">{action.action_description}</p>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {action.skills_gained?.map((s: string, j: number) => (
                                <span key={j} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-xs">{s}</span>
                              ))}
                              {action.domains_explored?.map((d: string, j: number) => (
                                <span key={j} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-xs">{d}</span>
                              ))}
                            </div>
                            {action.reflection && (
                              <p className="font-body text-xs text-muted-foreground mt-2 italic">"{action.reflection}"</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <GitBranch size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No decisions tracked yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Complete tasks, projects, and challenges to see how your decisions shape your journey</p>
            </div>
          )}
        </TabsContent>

        {/* ===== Weekly Digest Tab ===== */}
        <TabsContent value="digest" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-foreground">Weekly Evolution Digest</h3>
              <p className="font-body text-sm text-muted-foreground">
                Summaries of your weekly progress in skills, mood, energy, and decisions
              </p>
            </div>
            <Button onClick={generateWeeklyDigest} disabled={aiLoading} variant="outline" size="sm">
              {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Calendar size={16} />}
              Generate This Week's Digest
            </Button>
          </div>

          {weeklyDigests.length > 0 ? (
            <div className="space-y-6">
              {weeklyDigests.map(digest => (
                <Card key={digest.id} className="border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">
                      Week of {new Date(digest.week_start).toLocaleDateString()} — {new Date(digest.week_end).toLocaleDateString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {digest.ai_summary && (
                      <div className="p-4 rounded-lg bg-accent/5">
                        <p className="font-body text-sm text-foreground whitespace-pre-line">{digest.ai_summary}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Skills progress */}
                      {digest.skills_progress && (
                        <div className="p-3 rounded-lg bg-muted/30">
                          <h4 className="font-body text-sm font-medium text-foreground mb-2">Skills Progress</h4>
                          {(digest.skills_progress as any)?.improved?.length > 0 && (
                            <div className="mb-1">
                              <span className="font-body text-xs text-green-600">Improved: </span>
                              {(digest.skills_progress as any).improved.map((s: string, i: number) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 font-body text-xs mr-1">{s}</span>
                              ))}
                            </div>
                          )}
                          {(digest.skills_progress as any)?.suggested_focus?.length > 0 && (
                            <div>
                              <span className="font-body text-xs text-orange-600">Focus next: </span>
                              {(digest.skills_progress as any).suggested_focus.map((s: string, i: number) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 font-body text-xs mr-1">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mood summary */}
                      {digest.mood_summary && (
                        <div className="p-3 rounded-lg bg-muted/30">
                          <h4 className="font-body text-sm font-medium text-foreground mb-2">Mood Summary</h4>
                          <p className="font-body text-xs text-muted-foreground">
                            Dominant: <span className="text-foreground">{(digest.mood_summary as any)?.dominant_mood || "—"}</span>
                          </p>
                          <p className="font-body text-xs text-muted-foreground">
                            Energy trend: <span className="text-foreground">{(digest.mood_summary as any)?.energy_trend || "—"}</span>
                          </p>
                        </div>
                      )}

                      {/* Domain shifts */}
                      {digest.domain_shifts && (
                        <div className="p-3 rounded-lg bg-muted/30">
                          <h4 className="font-body text-sm font-medium text-foreground mb-2">Domain Shifts</h4>
                          {(digest.domain_shifts as any)?.growing_interest?.length > 0 && (
                            <p className="font-body text-xs text-muted-foreground">
                              Growing: {(digest.domain_shifts as any).growing_interest.map((d: string, i: number) => (
                                <span key={i} className="text-green-600 mr-1">{d}</span>
                              ))}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Key achievements */}
                      {digest.key_achievements?.length > 0 && (
                        <div className="p-3 rounded-lg bg-muted/30">
                          <h4 className="font-body text-sm font-medium text-foreground mb-2">Key Achievements</h4>
                          {digest.key_achievements.map((a: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 mb-1">
                              <CheckCircle2 size={12} className="text-green-500" />
                              <span className="font-body text-xs text-foreground">{a}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recommendations */}
                    {digest.recommendations && Array.isArray(digest.recommendations) && digest.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-body text-sm font-medium text-foreground">Recommendations</h4>
                        {(digest.recommendations as any[]).map((rec: any, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-accent/5">
                            <ArrowRight size={14} className="text-accent mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-body text-sm text-foreground">{rec.action || rec}</p>
                              {rec.reason && <p className="font-body text-xs text-muted-foreground">{rec.reason}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No weekly digests yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Click "Generate This Week's Digest" to get your first evolution summary</p>
            </div>
          )}
        </TabsContent>

        {/* ===== AI Insights Tab ===== */}
        <TabsContent value="insights" className="space-y-4">
          <h3 className="font-display text-xl text-foreground">AI Insights & Suggestions</h3>

          {aiInsights ? (
            <div className="space-y-4">
              {aiInsights.insights?.length > 0 && (
                <Card className="border-border">
                  <CardHeader><CardTitle className="font-display text-lg">Personalized Insights</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiInsights.insights.map((insight: any, i: number) => (
                        <div key={i} className={`p-3 rounded-lg border-l-4 ${
                          insight.type === "strength" ? "border-l-green-500 bg-green-500/5" :
                          insight.type === "opportunity" ? "border-l-blue-500 bg-blue-500/5" :
                          insight.type === "warning" ? "border-l-orange-500 bg-orange-500/5" :
                          "border-l-purple-500 bg-purple-500/5"
                        }`}>
                          <p className="font-body text-foreground">{insight.message}</p>
                          {insight.action_suggested && (
                            <p className="font-body text-sm text-muted-foreground mt-1">→ {insight.action_suggested}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {aiInsights.skill_fit_analysis?.length > 0 && (
                <Card className="border-border">
                  <CardHeader><CardTitle className="font-display text-lg">Skill vs Fit Analyzer</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aiInsights.skill_fit_analysis.map((fit: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-body ${
                                fit.opportunity_type === "job" ? "bg-blue-500/10 text-blue-600" :
                                fit.opportunity_type === "internship" ? "bg-purple-500/10 text-purple-600" :
                                "bg-green-500/10 text-green-600"
                              }`}>{fit.opportunity_type}</span>
                              <span className="font-body text-foreground">{fit.title}</span>
                            </div>
                            <div className="font-display text-xl text-accent">{fit.match_percentage}%</div>
                          </div>
                          {fit.matching_traits?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {fit.matching_traits.map((t: string, j: number) => (
                                <span key={j} className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 font-body text-xs">{t}</span>
                              ))}
                            </div>
                          )}
                          {fit.gaps_to_fill?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {fit.gaps_to_fill.map((g: string, j: number) => (
                                <span key={j} className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 font-body text-xs">Gap: {g}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {aiInsights.personalized_nudges?.length > 0 && (
                <Card className="border-border">
                  <CardHeader><CardTitle className="font-display text-lg">Personalized Nudges</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {aiInsights.personalized_nudges.map((nudge: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                          <Lightbulb size={16} className="text-accent mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-body text-sm text-foreground">{nudge.nudge}</p>
                            <span className={`font-body text-xs ${nudge.priority === "high" ? "text-red-600" : nudge.priority === "medium" ? "text-yellow-600" : "text-green-600"}`}>
                              {nudge.priority} priority • {nudge.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No AI insights generated yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">Click "Generate Insights" in the header to get personalized recommendations</p>
            </div>
          )}
        </TabsContent>

        {/* ===== Privacy & Sharing Tab ===== */}
        <TabsContent value="privacy" className="space-y-4">
          <h3 className="font-display text-xl text-foreground">Privacy & Sharing Controls</h3>
          <p className="font-body text-sm text-muted-foreground">Control what parts of your SelfGraph data are shared with mentors or peers</p>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg flex items-center gap-2"><Shield size={18} className="text-accent" />Mentor Insight Sync</CardTitle>
              <CardDescription className="font-body">Allow mentors to view selected parts of your identity data for personalized guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: "share_traits", label: "Share Traits & Strengths", desc: "Your personality traits and cognitive strengths" },
                  { key: "share_energy", label: "Share Energy Zones", desc: "Where you feel energized or drained" },
                  { key: "share_patterns", label: "Share Behavior Patterns", desc: "Your recurring habits and tendencies" },
                  { key: "share_evaluations", label: "Share Evaluations", desc: "Your identity assessment scores" },
                  { key: "share_clarity", label: "Share Clarity Scores", desc: "Your goal and interest alignment" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{label}</p>
                      <p className="font-body text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={privacySettings[key as keyof typeof privacySettings]}
                      onCheckedChange={(val) => togglePrivacy(key, val)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader><CardTitle className="font-display text-lg">Data Export</CardTitle></CardHeader>
            <CardContent>
              <p className="font-body text-sm text-muted-foreground mb-4">Download a complete copy of your SelfGraph data as JSON</p>
              <Button variant="outline" onClick={exportData}><Download size={16} /> Export My Data</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SelfGraph;
