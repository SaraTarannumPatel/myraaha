import { useState, useEffect, useRef, useCallback } from "react";
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
  Play, Check, Lightbulb, Brain, Meh, HelpCircle, Bot,
  PenLine, BookOpen, Users, Goal, TrendingUp, Activity, Eye, Layers,
  Map, Route, CheckCircle2, ClipboardCheck, Lock, RefreshCw
} from "lucide-react";
// Career Cards, Story Mode, Challenge Mode and Visual Mode now live in
// the dedicated Career Navigator module (/dashboard/career-navigator).
// BlueprintCard is referenced inline by type below; no top-level import needed.
import { buildBlueprintFromInteractions } from "@/lib/buildBlueprint";
import { generateBlueprintRoadmap } from "@/lib/blueprintRoadmap";
import { useUserSignals } from "@/hooks/useUserSignals";
import { useNavigate } from "react-router-dom";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";
import PsychometricTest from "@/components/curiositycompass/PsychometricTest";
import InterestsAssessment from "@/components/curiositycompass/InterestsAssessment";
import AssessmentGate from "@/components/curiositycompass/AssessmentGate";
import OnboardingCelebration from "@/components/curiositycompass/OnboardingCelebration";
import InsightsView from "@/components/curiositycompass/InsightsView";
import { useAssessmentRewards } from "@/hooks/useAssessmentRewards";
import { buildDiscoverySignal } from "@/lib/assessmentSignalMap";
import { calibrateArchetype } from "@/lib/archetypeCalibration";
import {
  getVariantQuestions,
  detectVariant,
  getJourneyId,
  getJourneyQuestions,
  journeyMetas,
  type VariantQuestion,
  type JourneyQuestion,
} from "@/pages/onboarding/journeys/journeyData";

const MOODS = [
  { id: "excited", label: "Excited", icon: Zap, color: "text-accent" },
  { id: "curious", label: "Curious", icon: Lightbulb, color: "text-primary" },
  { id: "unsure", label: "Unsure", icon: HelpCircle, color: "text-muted-foreground" },
  { id: "bored", label: "Bored", icon: Meh, color: "text-warmth" },
];

// The four exploration modes (Story / Challenge / Visual / Career Cards)
// have moved to the Career Navigator module. The Explore Interests tab now
// links there instead of hosting the modes inline.

const STORY_PROMPTS = [
  { question: "Imagine you have a free day with zero obligations. What's the first thing you do?", type: "open" as const },
  { question: "You're at a bookstore. Which section do you head to first?", type: "choice" as const, options: ["Science & Tech", "Art & Design", "Business & Finance", "Self-Help & Psychology", "Biographies", "Fiction & Stories"] },
  { question: "A friend asks for help. Which request excites you most?", type: "choice" as const, options: ["Help design their website", "Organize their project plan", "Brainstorm startup ideas", "Write compelling content", "Analyze their data", "Coach them through a decision"] },
  { question: "What do you enjoy doing when no one asks?", type: "open" as const },
  { question: "Would you rather…", type: "choice" as const, options: ["Design something beautiful", "Organize a group of people", "Solve a complex puzzle", "Tell a compelling story"] },
];

const CHALLENGE_PROMPTS = [
  { question: "Describe a hobby that makes you lose track of time.", type: "open" as const },
  { question: "Choose the activities you feel most drawn to:", type: "multi" as const, options: ["Building things", "Teaching others", "Writing or creating", "Analyzing patterns", "Leading teams", "Exploring new ideas", "Helping people", "Solving problems"] },
  { question: "Rate how energized these make you feel (pick your top 3):", type: "multi" as const, options: ["Presenting to a group", "Working with data", "Creative brainstorming", "Coding or building", "Mentoring someone", "Research & learning", "Community organizing", "Strategic planning"] },
  { question: "If you could master one skill overnight, what would it be?", type: "open" as const },
];

const VISUAL_ICONS = [
  { id: "code", emoji: "💻", label: "Technology" },
  { id: "art", emoji: "🎨", label: "Art & Design" },
  { id: "science", emoji: "🔬", label: "Science" },
  { id: "business", emoji: "📊", label: "Business" },
  { id: "people", emoji: "🤝", label: "People & Community" },
  { id: "writing", emoji: "✍️", label: "Writing" },
  { id: "health", emoji: "🏥", label: "Healthcare" },
  { id: "nature", emoji: "🌱", label: "Environment" },
  { id: "music", emoji: "🎵", label: "Music & Media" },
  { id: "education", emoji: "📚", label: "Education" },
  { id: "law", emoji: "⚖️", label: "Law & Policy" },
  { id: "sports", emoji: "⚽", label: "Sports & Fitness" },
  { id: "finance", emoji: "💰", label: "Finance" },
  { id: "travel", emoji: "✈️", label: "Travel & Culture" },
  { id: "food", emoji: "🍳", label: "Food & Hospitality" },
  { id: "engineering", emoji: "⚙️", label: "Engineering" },
];

// ===== Assessment Test Section (moved from onboarding journey) =====
const AssessmentTestSection = ({ user, recordSignal, recordMultipleSignals, onAdvance }: { user: any; recordSignal: any; recordMultipleSignals: any; onAdvance?: (tab: string) => void }) => {
  const { profile, updateProfile } = useAuth();
  const { updateProgress } = useAssessmentRewards();
  const userType = profile?.user_type || "school";
  const variantQs = getVariantQuestions(userType);
  const [variantAnswers, setVariantAnswers] = useState<Record<string, string>>({});
  const [variantStep, setVariantStep] = useState(0);
  const [phase, setPhase] = useState<"variant" | "journey" | "result">("variant");
  const [variant, setVariant] = useState<"U" | "R">("U");
  const [journeyId, setJourneyId] = useState("J1");
  const [journeyStep, setJourneyStep] = useState(0);
  const [journeyAnswers, setJourneyAnswers] = useState<Record<string, string | string[]>>({});
  const [completed, setCompleted] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const journeyQs = getJourneyQuestions(journeyId);
  const meta = journeyMetas[journeyId];

  // Total discovery questions and progress write helper
  const totalDiscoveryQs = variantQs.length + journeyQs.length;
  const writeDiscoverySignal = async (qId: string, qText: string, answer: string | string[]) => {
    if (!user?.id) return;
    const sig = buildDiscoverySignal(qId, answer);
    await supabase.from("assessment_question_signals" as any).insert({
      user_id: user.id,
      test_type: "discovery",
      question_id: qId,
      question_text: qText,
      answer_value: Array.isArray(answer) ? answer.join(",") : answer,
      answer_label: Array.isArray(answer) ? answer.join(", ") : answer,
      target_modules: sig.target_modules,
      signal_tags: sig.signal_tags,
      weight: 0.7,
    });
  };
  const pushDiscoveryProgress = async (completedCount: number) => {
    await updateProgress("discovery", Math.min(completedCount, totalDiscoveryQs), totalDiscoveryQs);
  };

  // Discovery conclusion (real archetype synthesized from answers)
  const [discoveryConclusion, setDiscoveryConclusion] = useState<{ archetype: string; archetype_description?: string } | null>(null);

  // Check if already completed
  useEffect(() => {
    if (profile?.journey_responses?.assessment_completed) {
      setCompleted(true);
    }
  }, [profile]);

  // Load (and refresh) the synthesized discovery conclusion to show the real archetype
  useEffect(() => {
    if (!completed || !user?.id) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("assessment_conclusions" as any)
        .select("archetype, archetype_description")
        .eq("user_id", user.id)
        .eq("test_type", "discovery")
        .maybeSingle();
      if (!cancelled && data) setDiscoveryConclusion(data as any);
    };
    load();
    // Poll briefly in case the synthesizer is still running
    const t1 = setTimeout(load, 2500);
    const t2 = setTimeout(load, 6000);
    return () => { cancelled = true; clearTimeout(t1); clearTimeout(t2); };
  }, [completed, user?.id]);

  const currentVariantQ = variantQs[variantStep];
  const currentJourneyQ = journeyQs[journeyStep];

  const handleVariantNext = () => {
    // Persist signal for current variant question before moving on
    const cur = variantQs[variantStep];
    const ans = variantAnswers[cur?.id];
    if (cur && ans) {
      writeDiscoverySignal(cur.id, cur.question, ans);
      pushDiscoveryProgress(Object.keys(variantAnswers).length + Object.keys(journeyAnswers).length);
    }
    if (variantStep < variantQs.length - 1) {
      setVariantStep(variantStep + 1);
    } else {
      const v = detectVariant(userType, variantAnswers);
      const jId = getJourneyId(userType, v);
      setVariant(v);
      setJourneyId(jId);
      setPhase("journey");
    }
  };

  const handleJourneySelect = (qId: string, value: string, type: "single" | "multi", maxSelect?: number) => {
    if (type === "single") {
      setJourneyAnswers({ ...journeyAnswers, [qId]: value });
    } else {
      const current = (journeyAnswers[qId] as string[]) || [];
      let updated: string[];
      if (current.includes(value)) {
        updated = current.filter(v => v !== value);
      } else {
        updated = maxSelect && current.length >= maxSelect ? [...current.slice(1), value] : [...current, value];
      }
      setJourneyAnswers({ ...journeyAnswers, [qId]: updated });
    }
  };

  const handleJourneyNext = () => {
    // Persist signal for current journey question before moving on
    const cur = journeyQs[journeyStep];
    const ans = journeyAnswers[cur?.id];
    if (cur && ans && (typeof ans === "string" || (Array.isArray(ans) && ans.length))) {
      writeDiscoverySignal(cur.id, cur.question, ans);
      pushDiscoveryProgress(Object.keys(variantAnswers).length + Object.keys(journeyAnswers).length);
    }
    if (journeyStep < journeyQs.length - 1) {
      setJourneyStep(journeyStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // Save assessment results
    await updateProfile({
      journey_variant: `${journeyId}_${variant}`,
      journey_responses: {
        ...profile?.journey_responses,
        assessment_completed: true,
        variant_answers: variantAnswers,
        journey_answers: journeyAnswers,
        journey_id: journeyId,
        variant,
      },
    } as any);

    // Record signals for cross-module use
    for (const [, value] of Object.entries(journeyAnswers)) {
      if (typeof value === "string") {
        await recordSignal("assessment", value, "preference", 0.7);
      } else if (Array.isArray(value)) {
        await recordMultipleSignals("assessment", value, "preference", 0.6);
      }
    }

    // Mark discovery test as 100% complete and trigger reward unlocks + synthesizer
    await pushDiscoveryProgress(totalDiscoveryQs);

    // Instant client-side archetype calibration — guarantees a real archetype
    // is shown even if the edge synthesizer is slow or fails.
    try {
      const labels: string[] = [];
      variantQs.forEach((vq) => {
        const v = variantAnswers[vq.id];
        if (v) labels.push(vq.options.find((o: any) => o.value === v)?.label || String(v));
      });
      journeyQs.forEach((jq) => {
        const v = journeyAnswers[jq.id];
        if (!v) return;
        if (Array.isArray(v)) {
          v.forEach((x) => labels.push(jq.options.find((o: any) => o.value === x)?.label || x));
        } else {
          labels.push(jq.options.find((o: any) => o.value === v)?.label || String(v));
        }
      });
      const calibrated = calibrateArchetype(labels);
      setDiscoveryConclusion({
        archetype: calibrated.title,
        archetype_description: calibrated.description,
      });
      if (user?.id) {
        await supabase.from("assessment_conclusions" as any).upsert({
          user_id: user.id,
          test_type: "discovery",
          archetype: calibrated.title,
          archetype_description: calibrated.description,
          raw_signals: { calibrated_client: true, scores: calibrated.scores, rationale: calibrated.rationale },
        }, { onConflict: "user_id,test_type" });
      }
    } catch (e) {
      console.warn("Client archetype calibration failed", e);
    }

    try {
      await supabase.functions.invoke("assessment-synthesizer", { body: { test_type: "discovery" } });
      await supabase.functions.invoke("assessment-synthesizer", { body: { test_type: "combined" } });
    } catch (e) {
      console.warn("Discovery synthesis failed", e);
    }

    setCompleted(true);
    toast.success("Assessment complete! Your archetype is calibrated 🧭");
  };

  const totalSteps = variantQs.length + journeyQs.length;
  const currentTotal = phase === "variant" ? variantStep : variantQs.length + journeyStep;

  if (completed) {
    // Preview saved answers (read-only). "Retake Assessment" intentionally removed —
    // discovery results are one-time-per-user; users can review but not reset.
    const allAnswers: Array<{ q: string; a: string }> = [];
    variantQs.forEach((vq) => {
      const v = variantAnswers[vq.id] ?? profile?.journey_responses?.variant_answers?.[vq.id];
      if (v) {
        const lbl = vq.options.find((o: any) => o.value === v)?.label || String(v);
        allAnswers.push({ q: vq.question, a: lbl });
      }
    });
    journeyQs.forEach((jq) => {
      const v = journeyAnswers[jq.id] ?? profile?.journey_responses?.journey_answers?.[jq.id];
      if (v) {
        const lbl = Array.isArray(v)
          ? v.map((x) => jq.options.find((o: any) => o.value === x)?.label || x).join(", ")
          : (jq.options.find((o: any) => o.value === v)?.label || String(v));
        allAnswers.push({ q: jq.question, a: lbl });
      }
    });

    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02] shadow-xl rounded-3xl overflow-hidden p-6 sm:p-8">
        <CardContent className="pt-4 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold text-foreground">Assessment Complete ✨</h3>
            <p className="font-body text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your Curiosity Compass has been successfully calibrated! All career paths and exploration modules are now tuned to your profile.
            </p>
          </div>
          <div className="inline-flex flex-col items-center gap-2 px-5 py-3 rounded-2xl border border-border bg-white shadow-sm max-w-lg mx-auto">
            <span className="font-body text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Your Career Archetype</span>
            <Badge variant="secondary" className="font-display text-sm px-3 py-1 text-primary bg-primary/10">
              {discoveryConclusion?.archetype || "Calibrating your archetype…"}
            </Badge>
            {discoveryConclusion?.archetype_description && (
              <p className="font-body text-xs text-muted-foreground leading-relaxed mt-1 text-center">
                {discoveryConclusion.archetype_description}
              </p>
            )}
          </div>
          {allAnswers.length > 0 && (
            <div className="mt-6 border-t border-border/60 pt-6 space-y-4 max-h-[30vh] overflow-y-auto pr-2">
              <h4 className="font-display text-sm font-bold text-primary text-left">Your Profile Answers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allAnswers.map((item, i) => (
                  <div key={i} className="text-left bg-white p-3.5 rounded-2xl border border-border/80 shadow-sm">
                    <p className="font-body text-[10px] text-muted-foreground leading-normal">{item.q}</p>
                    <p className="font-body text-xs font-bold text-foreground mt-1 leading-normal">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {onAdvance && (
            <div className="pt-4">
              <Button
                size="lg"
                onClick={() => onAdvance("psychometric")}
                className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-body font-semibold"
              >
                Continue to Psychometric Test <ArrowRight size={16} className="ml-1" />
              </Button>
              <p className="font-body text-[11px] text-muted-foreground mt-2">
                Next up: a 22-question deep-dive on how you think and work.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const handleSkipVariant = () => {
    if (variantStep < variantQs.length - 1) setVariantStep(variantStep + 1);
    else {
      const v = detectVariant(userType, variantAnswers);
      const jId = getJourneyId(userType, v);
      setVariant(v);
      setJourneyId(jId);
      setPhase("journey");
    }
  };

  const handleSkipJourney = () => {
    if (journeyStep < journeyQs.length - 1) setJourneyStep(journeyStep + 1);
    else handleComplete();
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-3xl border border-border shadow-xl overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-accent/[0.01] pointer-events-none" />
        
        {/* Progress Bar along the top edge */}
        <div className="w-full h-1 bg-muted/60 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${((currentTotal + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Section Header */}
        <div className="p-6 border-b border-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/10 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={20} className="text-[#5500cb]" />
              <span className="font-display font-bold text-base text-foreground">Discovery Assessment</span>
            </div>
            <p className="font-body text-xs text-muted-foreground">
              {phase === "variant" ? "Vibe Check — quick calibration" : "Tell us how you think, learn, and move"}
            </p>
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1 font-mono rounded-full bg-background border-border/80 text-[#5500cb]">
            Question {currentTotal + 1} of {totalSteps}
          </Badge>
        </div>

        {/* Question Body */}
        <div className="p-6 sm:p-8 space-y-6 relative z-10">
          <AnimatePresence mode="wait">
            {phase === "variant" && currentVariantQ && (
              <motion.div 
                key={`v-${variantStep}`} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="space-y-6"
              >
                <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground tracking-tight leading-snug">
                  {currentVariantQ.question}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentVariantQ.options.map((opt) => {
                    const isSelected = variantAnswers[currentVariantQ.id] === opt.value;
                    return (
                      <button 
                        key={opt.value} 
                        onClick={() => setVariantAnswers({ ...variantAnswers, [currentVariantQ.id]: opt.value })}
                        className={`group flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all duration-300 font-body text-sm relative overflow-hidden ${
                          isSelected 
                            ? "border-primary bg-primary/[0.03] shadow-md font-semibold text-primary" 
                            : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/10 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/30 group-hover:border-primary/50"
                          }`}>
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                          <span className="font-medium">{opt.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {phase === "journey" && currentJourneyQ && (
              <motion.div 
                key={`j-${journeyStep}`} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground tracking-tight leading-snug">
                    {currentJourneyQ.question}
                  </h3>
                  {currentJourneyQ.type === "multi" && (
                    <p className="font-body text-xs text-muted-foreground">
                      Pick {currentJourneyQ.maxSelect ? `up to ${currentJourneyQ.maxSelect}` : "as many as you want"}
                    </p>
                  )}
                </div>
                
                <div className={currentJourneyQ.options.length > 5 ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                  {currentJourneyQ.options.map((opt) => {
                    const isMulti = currentJourneyQ.type === "multi";
                    const isSelected = isMulti
                      ? ((journeyAnswers[currentJourneyQ.id] as string[]) || []).includes(opt.value)
                      : journeyAnswers[currentJourneyQ.id] === opt.value;
                    return (
                      <button 
                        key={opt.value}
                        onClick={() => handleJourneySelect(currentJourneyQ.id, opt.value, currentJourneyQ.type, currentJourneyQ.maxSelect)}
                        className={`group flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-300 font-body text-xs sm:text-sm relative overflow-hidden ${
                          isSelected 
                            ? "border-primary bg-primary/[0.03] shadow-md font-semibold text-primary" 
                            : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/10 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                            isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/30 group-hover:border-primary/50"
                          }`}>
                            {isSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                          <span className="font-medium leading-snug">{opt.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer / Controls */}
        <div className="p-6 border-t border-border/40 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              if (phase === "variant") { if (variantStep > 0) setVariantStep(variantStep - 1); }
              else { if (journeyStep > 0) setJourneyStep(journeyStep - 1); else setPhase("variant"); }
            }} 
            disabled={phase === "variant" && variantStep === 0} 
            className="font-body h-11 px-6 rounded-full border border-border/50 hover:bg-background/80"
          >
            <ArrowLeft size={16} className="mr-2" /> Previous
          </Button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={phase === "variant" ? handleSkipVariant : handleSkipJourney} 
              className="font-body text-muted-foreground hover:text-foreground text-xs h-11 px-5 rounded-full"
            >
              Skip
            </Button>
            
            {phase === "variant" ? (
              <Button 
                onClick={handleVariantNext} 
                disabled={!variantAnswers[currentVariantQ?.id]} 
                size="sm" 
                className="bg-primary text-white hover:bg-primary/95 rounded-full h-11 px-8 font-body font-semibold shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next Question <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleJourneyNext}
                disabled={currentJourneyQ?.type === "single" ? !journeyAnswers[currentJourneyQ.id] : !((journeyAnswers[currentJourneyQ?.id] as string[])?.length > 0)}
                size="sm" 
                className="bg-primary text-white hover:bg-primary/95 rounded-full h-11 px-8 font-body font-semibold shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {journeyStep === journeyQs.length - 1 ? "Complete Assessment" : "Next Question"} <ArrowRight size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ===== Intro Pages Component =====
const CompassIntro = ({ onComplete }: { onComplete: () => void }) => {
  const [introStep, setIntroStep] = useState(0);

  const introPages = [
    {
      icon: Compass,
      title: "Welcome to Curiosity Compass 🧭",
      description: "This is your personal exploration hub. Here, you'll discover what truly excites you — through assessments, career stories, challenges, and interactive cards.",
      features: [
        "Discover your interests through guided assessments",
        "Explore career paths through story-based narratives",
        "Get AI-powered recommendations based on your signals",
        "Build your unique Work DNA profile over time",
      ],
    },
    {
      icon: ClipboardCheck,
      title: "Three Assessments Await You ✨",
      description: "To calibrate your compass, we'll guide you through three different assessments. Each one helps us understand you better.",
      tests: [
        { name: "Discovery Assessment", desc: "Understand your mindset, confidence, and career readiness through a series of guided questions.", icon: Brain, color: "text-blue" },
        { name: "Psychometric Assessment", desc: "A 22-question deep dive into your cognitive patterns, behavioral tendencies, and emotional intelligence.", icon: ClipboardCheck, color: "text-indigo" },
        { name: "Interests Assessment", desc: "Explore career cards, stories, challenges, and visual icons to discover what resonates with you.", icon: Heart, color: "text-terracotta" },
      ],
    },
  ];

  const page = introPages[introStep];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={introStep}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div className="max-w-lg w-full bg-card rounded-2xl border border-border shadow-2xl p-5 sm:p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
              <page.icon size={28} className="text-primary-foreground sm:hidden" />
              <page.icon size={36} className="text-primary-foreground hidden sm:block" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl text-foreground">{page.title}</h2>
            <p className="font-body text-sm text-muted-foreground">{page.description}</p>
          </div>

          {page.features && (
            <div className="space-y-2">
              {page.features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span className="font-body text-sm">{f}</span>
                </motion.div>
              ))}
            </div>
          )}

          {page.tests && (
            <div className="space-y-3">
              {page.tests.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <t.icon size={20} className={t.color} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm text-foreground">{t.name}</h4>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-1.5">
              {introPages.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === introStep ? "bg-primary w-6" : "bg-muted"}`} />
              ))}
            </div>
            <Button
              onClick={() => {
                if (introStep < introPages.length - 1) setIntroStep(introStep + 1);
                else onComplete();
              }}
              className="bg-primary text-accent rounded-full px-8 font-body font-semibold"
            >
              {introStep < introPages.length - 1 ? "Next" : "Let's Begin"} <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// ===== Popup Card Assessment Wrapper =====
const PopupAssessmentCard = ({ children, title, subtitle, progress, total, onSkip }: {
  children: React.ReactNode; title: string; subtitle?: string; progress: number; total: number; onSkip?: () => void;
}) => (
  <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm overflow-y-auto">
    <div className="flex min-h-full items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-4"
      >
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs">{title}</Badge>
            <span className="font-body text-xs text-muted-foreground">{progress} / {total}</span>
          </div>
          <Progress value={(progress / total) * 100} className="h-1.5" />
          {subtitle && <p className="font-body text-xs text-muted-foreground mt-2">{subtitle}</p>}
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">{children}</div>
        {onSkip && (
          <div className="p-4 border-t border-border flex justify-end">
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground text-xs">
              Skip this question
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  </div>
);

const CuriosityCompass = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { recordSignal, recordMultipleSignals, recordTextSignals, getAggregatedSignals } = useUserSignals();
  const [tab, setTab] = useState("assessment");
  const [showCelebration, setShowCelebration] = useState(true);
  const [showIntro, setShowIntro] = useState(() => {
    // Show intro only if user hasn't seen it
    return !localStorage.getItem("myraaha_compass_intro_seen");
  });

  // Check if both assessments are completed
  const discoveryDone = !!profile?.journey_responses?.assessment_completed;
  const psychometricDone = !!profile?.journey_responses?.psychometric_completed;
  const interestsDone = !!profile?.journey_responses?.interests_completed;
  const bothAssessmentsDone = discoveryDone && psychometricDone && interestsDone;
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

  // New state for missing features
  const [modePromptIndex, setModePromptIndex] = useState(0);
  const [modeResponses, setModeResponses] = useState<Record<number, any>>({});
  const [visualSelections, setVisualSelections] = useState<string[]>([]);
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [moodCheckpoint, setMoodCheckpoint] = useState<string | null>(null);
  const [behaviorInsights, setBehaviorInsights] = useState<any>(null);
  const [sessionSummary, setSessionSummary] = useState<any>(null);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [learningCapsules, setLearningCapsules] = useState<any[]>([]);
  const [peerCircles, setPeerCircles] = useState<any[]>([]);
  const [adaptivePrompts, setAdaptivePrompts] = useState<any>(null);

  // Visual-mode blueprint + roadmap
  const [visualBlueprint, setVisualBlueprint] = useState<import("@/components/career/BlueprintCard").Blueprint | null>(null);
  const [showVisualBlueprint, setShowVisualBlueprint] = useState(false);
  const [generatingVisualRoadmap, setGeneratingVisualRoadmap] = useState(false);

  const [conclusion, setConclusion] = useState<any>(null);
  const [conclusionLoading, setConclusionLoading] = useState(true);
  const [regeneratingConclusion, setRegeneratingConclusion] = useState(false);

  const fetchConclusion = async () => {
    if (!user) return;
    setConclusionLoading(true);
    const { data } = await supabase
      .from("assessment_conclusions" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setConclusion(data || null);
    setConclusionLoading(false);
  };

  const regenerateConclusion = async () => {
    if (!user) return;
    setRegeneratingConclusion(true);
    try {
      const { data, error } = await supabase.functions.invoke("assessment-synthesizer", {
        body: { test_type: "combined" },
      });
      if (error) throw error;
      setConclusion(data);
      toast.success("Insights regenerated from your latest signals.");
    } catch (e: any) {
      toast.error(e?.message || "Could not regenerate insights.");
    } finally {
      setRegeneratingConclusion(false);
    }
  };

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    await Promise.all([
      fetchCareerCards(),
      fetchQuests(),
      fetchDomains(),
      fetchInterests(),
      fetchNextStepData(),
      fetchConclusion(),
    ]);
    setLoading(false);
  };

  const fetchCareerCards = async () => {
    const [cardsRes, interactionsRes] = await Promise.all([
      supabase.from("career_cards").select("*").order("category"),
      supabase.from("career_card_interactions").select("*").eq("user_id", user!.id),
    ]);
    setCareerCards(cardsRes.data || []);
    const intMap: Record<string, string> = {};
    (interactionsRes.data || []).forEach((i: any) => { intMap[i.card_id] = i.interaction_type; });
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

  const fetchNextStepData = async () => {
    const [capsulesRes, circlesRes] = await Promise.all([
      supabase.from("learning_capsules").select("*").limit(6),
      supabase.from("peer_circles" as any).select("*").limit(4),
    ]);
    setLearningCapsules(capsulesRes.data || []);
    setPeerCircles((circlesRes.data as any[]) || []);
  };

  const startSession = async (selectedMode: string) => {
    setMode(selectedMode);
    setModePromptIndex(0);
    setModeResponses({});
    setVisualSelections([]);
    const { data } = await supabase.from("exploration_sessions").insert({
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
        // Record signals for cross-module recommendations
        await recordSignal("career_cards", card.title, "domain_interest", type === "save" ? 0.8 : 0.6, { category: card.category });
        if (card.category) await recordSignal("career_cards", card.category, "domain_interest", 0.5);
        const tags = card.tags || [];
        if (tags.length) await recordMultipleSignals("career_cards", tags, "keyword", 0.4);
      }
    }
    toast.success(type === "like" ? "Added to interests!" : type === "save" ? "Saved for later!" : "Noted!");
  };

  const handleCardView = (cardId: string) => {
    startTimeRef.current[cardId] = Date.now();
  };

  // --- Mode-based prompts flow ---
  const currentModePrompts = mode === "story" ? STORY_PROMPTS : mode === "challenge" ? CHALLENGE_PROMPTS : [];

  const handleModeResponse = (idx: number, value: any) => {
    setModeResponses(prev => ({ ...prev, [idx]: value }));
  };

  const finishModePrompts = async () => {
    // Save responses as decision actions for SelfGraph
    await supabase.from("decision_actions").insert({
      user_id: user!.id,
      action_type: "exploration_response",
      action_title: `${mode} mode exploration`,
      action_description: JSON.stringify(modeResponses),
      mood_at_action: moodCheckpoint || mood,
    });

    // Record signals from mode responses
    for (const [, value] of Object.entries(modeResponses)) {
      if (typeof value === "string") {
        await recordTextSignals(mode === "story" ? "story_mode" : "challenge_mode", value);
      } else if (Array.isArray(value)) {
        await recordMultipleSignals(mode === "story" ? "story_mode" : "challenge_mode", value, "selection", 0.6);
      }
    }

    // Trigger reflection
    setShowReflection(true);
  };

  const handleVisualToggle = (id: string) => {
    setVisualSelections(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const finishVisualMode = async () => {
    const selectedLabels = VISUAL_ICONS.filter(v => visualSelections.includes(v.id)).map(v => v.label);
    for (const label of selectedLabels) {
      await supabase.from("interests").upsert({
        user_id: user!.id,
        name: label,
        category: "visual_exploration",
        source: "curiosity_compass_visual",
        strength: 0.7,
      }, { onConflict: "user_id,name,category" });
    }
    // Record visual mode signals
    await recordMultipleSignals("visual_mode", selectedLabels, "domain_interest", 0.7);

    // Build a behavioural blueprint from the visual selections
    const synthCards = VISUAL_ICONS.map(v => ({
      id: v.id,
      domain: v.label,
      title: v.label,
    }));
    const synthInteractions: Record<string, "love"> = {};
    for (const id of visualSelections) synthInteractions[id] = "love";
    const bp = buildBlueprintFromInteractions(synthCards, synthInteractions, "visual");
    setVisualBlueprint(bp);
    setShowVisualBlueprint(true);
    toast.success("Visual blueprint ready! 🎨");
  };

  const generateVisualRoadmap = async () => {
    if (!user || !visualBlueprint) return;
    setGeneratingVisualRoadmap(true);
    try {
      await generateBlueprintRoadmap(
        user.id,
        {
          shortTermGoals: visualBlueprint.top_paths[0] || visualBlueprint.domains_attracted[0] || "Explore visual interests",
          longTermGoals: visualBlueprint.ai_summary,
          interests: [...visualBlueprint.domains_attracted, ...visualBlueprint.blind_spots].slice(0, 12),
          skills: visualBlueprint.skills_resonated,
          industry: visualBlueprint.domains_attracted[0] || "",
          careerStage: "exploring",
          areasOfFocus: visualBlueprint.top_paths.slice(0, 8),
          sourceContext: "visual_mode_blueprint",
        },
        `Personalized Roadmap — ${visualBlueprint.top_paths[0] || "Your Visual Path"}`,
        navigate,
      );
    } catch (e) {
      console.error(e);
      toast.error("Could not generate roadmap.");
    } finally { setGeneratingVisualRoadmap(false); }
  };

  // --- Reflection / Journal ---
  const saveReflection = async () => {
    if (!reflectionText.trim()) return;
    await supabase.from("journal_entries").insert({
      user_id: user!.id,
      content: reflectionText,
      title: `Curiosity Compass — ${mode} exploration`,
      mood: moodCheckpoint || mood,
      tags: ["curiosity-compass", mode || "exploration"],
    });
    // Record reflection text as signals
    await recordTextSignals("curiosity_compass", reflectionText);
    toast.success("Reflection saved to your journal! 📝");
    setShowReflection(false);
    setReflectionText("");
    // Trigger session summary
    getSessionSummary();
  };

  // --- AI Calls ---
  const getAIRecommendations = async () => {
    setAiLoading(true);
    try {
      const likedCards = careerCards.filter(c => interactions[c.id] === "like" || interactions[c.id] === "save");
      const { data, error } = await supabase.functions.invoke("curiosity-compass-ai", {
        body: {
          type: "domain_recommendations",
          context: { likedCards, interests, questResponses: questProgress.map(p => p.responses), mood, modeResponses, visualSelections: VISUAL_ICONS.filter(v => visualSelections.includes(v.id)).map(v => v.label) }
        }
      });
      if (error) throw error;
      setAiInsights(data);
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
        toast.error("AI service temporarily unavailable. Try again shortly.");
      }
    } finally { setAiLoading(false); }
  };

  const getAIFeedback = async () => {
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("curiosity-compass-ai", {
        body: { type: "quest_feedback", context: { questResponses, questTitle: activeQuest?.title, interests, mood } }
      });
      if (data) setAiInsights(data);
    } catch { } finally { setAiLoading(false); }
  };

  const getBehaviorInsights = async () => {
    setAiLoading(true);
    try {
      const { data } = await supabase.functions.invoke("curiosity-compass-ai", {
        body: {
          type: "behavior_insights",
          context: {
            interactions,
            careerCards: careerCards.slice(0, 15),
            interests,
            questProgress,
            modeResponses,
            visualSelections: VISUAL_ICONS.filter(v => visualSelections.includes(v.id)).map(v => v.label),
            mood,
          }
        }
      });
      if (data) setBehaviorInsights(data);
    } catch { } finally { setAiLoading(false); }
  };

  const getAdaptivePrompts = async () => {
    try {
      const { data } = await supabase.functions.invoke("curiosity-compass-ai", {
        body: {
          type: "adaptive_prompts",
          context: { interactions, modeResponses, mood, interests, completedQuests: questProgress.filter(p => p.status === "completed").length }
        }
      });
      if (data) setAdaptivePrompts(data);
    } catch { }
  };

  const getSessionSummary = async () => {
    setAiLoading(true);
    try {
      const likedCards = careerCards.filter(c => interactions[c.id] === "like" || interactions[c.id] === "save");
      const { data } = await supabase.functions.invoke("curiosity-compass-ai", {
        body: {
          type: "exploration_summary",
          context: { mode, likedCards, modeResponses, mood, moodCheckpoint, interests, visualSelections: VISUAL_ICONS.filter(v => visualSelections.includes(v.id)).map(v => v.label) }
        }
      });
      if (data) {
        setSessionSummary(data);
        setShowNextSteps(true);
        // End session
        if (sessionId) {
          await supabase.from("exploration_sessions").update({ ended_at: new Date().toISOString(), mood_end: moodCheckpoint || mood, ai_insights: data }).eq("id", sessionId);
        }
      }
    } catch { } finally { setAiLoading(false); }
  };

  const startQuest = async (quest: any) => {
    setActiveQuest(quest);
    setCurrentPromptIndex(0);
    setQuestResponses({});
    const existing = questProgress.find(p => p.quest_id === quest.id);
    if (!existing) {
      await supabase.from("curiosity_quest_progress").insert({ user_id: user!.id, quest_id: quest.id, status: "in_progress" });
    }
  };

  const handleQuestResponse = (promptIndex: number, value: any) => {
    setQuestResponses(prev => ({ ...prev, [promptIndex]: value }));
  };

  const completeQuest = async () => {
    if (!activeQuest) return;

    // Record quest response signals
    for (const [, value] of Object.entries(questResponses)) {
      if (typeof value === "string") {
        await recordTextSignals("quests", value, { quest: activeQuest.title });
      } else if (Array.isArray(value)) {
        await recordMultipleSignals("quests", value, "selection", 0.7, { quest: activeQuest.title });
      }
    }

    // Get AI analysis of quest responses
    let analysisResults = null;
    try {
      const { data } = await supabase.functions.invoke("curiosity-compass-ai", {
        body: { type: "quest_feedback", context: { questResponses, questTitle: activeQuest.title, interests, mood } }
      });
      if (data) {
        analysisResults = data;
        setAiInsights(data);
        // Record detected strengths and domains as signals
        if (data.strengths_detected) {
          await recordMultipleSignals("quests", data.strengths_detected, "skill_interest", 0.7);
        }
        if (data.suggested_domains) {
          await recordMultipleSignals("quests", data.suggested_domains, "domain_interest", 0.6);
        }
      }
    } catch (e) { console.error("Quest analysis error:", e); }

    await supabase.from("curiosity_quest_progress").upsert({
      user_id: user!.id,
      quest_id: activeQuest.id,
      status: "completed",
      responses: questResponses,
      points_earned: activeQuest.points || 10,
      mood_checkpoint: mood,
      completed_at: new Date().toISOString(),
      analysis_results: analysisResults,
    }, { onConflict: "user_id,quest_id" });
    // Quest completion badge is awarded server-side by the Achievements scanner.

    toast.success(`Quest completed! +${activeQuest.points || 10} points 🎉`);
    setActiveQuest(null);
    setShowReflection(true);
    fetchQuests();
  };

  const saveDomain = async (domainId: string) => {
    await supabase.from("domain_recommendations").update({ status: "saved" }).eq("id", domainId);
    toast.success("Domain saved for exploration!");
    fetchDomains();
  };

  const getQuestStatus = (questId: string) => {
    return questProgress.find(p => p.quest_id === questId)?.status || "not_started";
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
    <div className="w-full max-w-none mx-auto py-6 curiosity-compass-container px-4 sm:px-6 lg:px-8">
      {/* Intro pages for first-time visitors */}
      {showIntro && (
        <CompassIntro onComplete={() => {
          setShowIntro(false);
          localStorage.setItem("myraaha_compass_intro_seen", "true");
        }} />
      )}

      {/* Onboarding celebration for fully completed users */}
      <OnboardingCelebration onDismiss={() => { setShowCelebration(false); setTab("assessment"); }} />

      <Tabs value={tab} onValueChange={(v) => {
        // Block locked tabs
        if (!bothAssessmentsDone && !["assessment", "psychometric", "interests"].includes(v)) {
          toast.info("Complete both assessments first to unlock this section.");
          return;
        }
        setTab(v);
      }} className="w-full">
      {/* Top Header Bar with Horizontal Nav & Profile Card */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-6 pb-6 mb-6 border-b border-border/50 w-full">
        
        {/* Left Side: Horizontal Profile Card (with increased height) */}
        <div className="bg-white rounded-3xl border border-border shadow-xl p-5 md:py-6 md:px-7 relative overflow-hidden flex flex-col sm:flex-row items-center gap-5 sm:gap-7 shrink-0 w-full sm:w-auto min-h-[110px]">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5500cb] to-accent flex items-center justify-center text-primary-foreground font-semibold shrink-0">
              <Compass size={24} className="text-white" />
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-5 text-center border-t sm:border-t-0 sm:border-l border-border/50 pt-3 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start sm:pl-7">
            <div className="px-1.5 sm:px-2">
              <p className="font-display text-base text-[#5500cb] font-bold">{likedCount}</p>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Liked</p>
            </div>
            <div className="px-1.5 sm:px-2">
              <p className="font-display text-base text-[#5500cb] font-bold">{completedQuests}</p>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Quests</p>
            </div>
            <div className="px-1.5 sm:px-2">
              <p className="font-display text-base text-[#5500cb] font-bold">{domains.length}</p>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Matched</p>
            </div>
            <div className="px-1.5 sm:px-2">
              <p className="font-display text-base text-[#5500cb] font-bold">{interests.length}</p>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Interests</p>
            </div>
          </div>
        </div>

        {/* Right Side: Special Horizontal Tab Navbar */}
        <div className="flex flex-col items-stretch lg:items-end gap-3 min-w-0">
          <div className="flex items-center gap-3 lg:justify-end">
            <h1 className="font-display text-2xl font-bold text-[#5500cb] tracking-tight">Curiosity Compass</h1>
          </div>
          
          {/* Special Horizontal Tabs List */}
          <div className="bg-white rounded-full border border-border shadow-md p-1.5 inline-flex items-center gap-1 max-w-full overflow-x-auto scrollbar-none">
            <TabsList className="flex bg-transparent p-0 gap-1 border-none h-auto w-max">
              {[
                { value: "assessment", label: "Discover Yourself", icon: ClipboardCheck },
                { value: "psychometric", label: "Psychometric", icon: Brain },
                { value: "interests", label: "Interests Test", icon: Heart },
                { value: "explore", label: "Explore Interests", icon: Heart, locked: !bothAssessmentsDone },
                { value: "quests", label: "Quests", icon: Trophy, locked: !bothAssessmentsDone },
                { value: "domains", label: "Domains", icon: Target, locked: !bothAssessmentsDone },
                { value: "insights", label: "Insights & Behavior", icon: Sparkles, locked: !bothAssessmentsDone },
              ].map((t) => {
                const isActive = tab === t.value;
                const IconComponent = t.icon;
                return (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    disabled={t.locked}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 font-body text-xs font-bold shadow-none border-none
                      ${isActive 
                        ? "bg-[#5500cb] text-white scale-100" 
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }
                      disabled:opacity-40 disabled:cursor-not-allowed`}
                    title={t.label}
                  >
                    <IconComponent size={16} className="shrink-0" />
                    {isActive && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }} 
                        animate={{ opacity: 1, width: "auto" }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {t.label}
                      </motion.span>
                    )}
                    {t.locked && !isActive && <Lock size={10} className="text-muted-foreground/40" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

      </div>

      <div className="w-full space-y-6">
        {/* Main Column: Search & Main Interactive Feed */}
        <main className="w-full space-y-6">
          
          {/* Sticky Search Bar (Matches Social Feed Style) */}
          <div className="bg-background/95 backdrop-blur-sm sticky top-0 lg:top-0 z-10 py-2 border-b border-border/20">
            <ModuleSearchBar
              placeholder="Search career domains, job roles, paths..."
              sources={["careers", "domains", "jobs"]}
              onSelect={(item) => {
                recordSignal("curiosity_compass", item.title, "domain_interest", 0.8, { source: "search" });
                toast.success(`"${item.title}" added to your exploration signals!`);
              }}
            />
          </div>

            {/* Assessment Gate - shown on locked tabs */}
            {!bothAssessmentsDone && !["assessment", "psychometric", "interests"].includes(tab) && (
              <div className="mt-2">
                <AssessmentGate onGoToAssessment={(t) => setTab(t === "discovery" ? "assessment" : t)} />
              </div>
            )}

            {/* Reflection Modal (inline journal card) */}
            <AnimatePresence>
              {showReflection && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                  <Card className="border-accent/30 bg-accent/5 overflow-hidden rounded-2xl">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base font-display">
                        <PenLine className="text-accent-foreground" size={18} />
                        Capture Your Reflection
                      </CardTitle>
                      <CardDescription className="text-xs">What stood out to you? This saves to your personal journal.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Emotion checkpoint */}
                      <div>
                        <p className="font-body text-xs text-muted-foreground mb-2">How do you feel after this exploration?</p>
                        <div className="flex gap-2 flex-wrap">
                          {MOODS.map(m => (
                            <button
                              key={m.id}
                              onClick={() => setMoodCheckpoint(m.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs ${moodCheckpoint === m.id ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/50 text-muted-foreground"}`}
                            >
                              <m.icon className={m.color} size={14} />
                              <span>{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <Textarea
                        placeholder="This feels exciting because… / I realized that… / I want to explore more about…"
                        value={reflectionText}
                        onChange={e => setReflectionText(e.target.value)}
                        rows={3}
                        className="text-sm rounded-xl"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => { setShowReflection(false); getSessionSummary(); }} className="text-xs">
                          Skip for now
                        </Button>
                        <Button onClick={saveReflection} disabled={!reflectionText.trim()} size="sm" className="text-xs rounded-xl">
                          <PenLine size={12} className="mr-1.5" /> Save to Journal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Session Summary & Next Steps Panel */}
            <AnimatePresence>
              {showNextSteps && sessionSummary && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl overflow-hidden shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base font-display">
                        <Sparkles className="text-primary" size={18} />
                        Exploration Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {sessionSummary.session_summary && (
                        <p className="font-body text-sm leading-relaxed text-foreground">{sessionSummary.session_summary}</p>
                      )}
                      {sessionSummary.key_discoveries?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-display text-xs font-semibold text-foreground">Key Discoveries</h4>
                          <div className="space-y-1.5">
                            {sessionSummary.key_discoveries.map((d: string, i: number) => (
                              <div key={i} className="flex items-start gap-2">
                                <Lightbulb size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                                <p className="font-body text-xs text-muted-foreground leading-relaxed">{d}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {sessionSummary.patterns?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-display text-xs font-semibold text-foreground">Patterns Observed</h4>
                          <div className="grid gap-2">
                            {sessionSummary.patterns.map((p: any, i: number) => (
                              <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/50">
                                <p className="font-body text-xs font-semibold text-foreground">{p.pattern}</p>
                                <p className="font-body text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{p.meaning}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {sessionSummary.motivational_note && (
                        <div className="p-3 rounded-xl bg-success/5 border border-success/20">
                          <p className="font-body text-xs text-success leading-relaxed">{sessionSummary.motivational_note}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Next Steps Recommendations */}
                  <Card className="rounded-2xl shadow-sm overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base font-display">
                        <ArrowRight className="text-primary" size={18} />
                        Your Next Steps
                      </CardTitle>
                      <CardDescription className="text-xs">Based on your recent exploration, here is what you can check out</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Domain Suggestions */}
                      {sessionSummary.domains_to_pursue?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground"><Target size={12} className="text-primary" /> Domains to Explore</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {sessionSummary.domains_to_pursue.map((d: string, i: number) => (
                              <Badge key={i} variant="secondary" className="px-2.5 py-1 text-xs">{d}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Learning Capsules */}
                      {learningCapsules.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground"><BookOpen size={12} className="text-primary" /> Suggested Learning</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {learningCapsules.slice(0, 3).map((capsule: any) => (
                              <div key={capsule.id} className="p-3 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer bg-card">
                                <p className="font-body text-xs font-semibold text-foreground line-clamp-1">{capsule.title}</p>
                                <p className="font-body text-[10px] text-muted-foreground mt-0.5">{capsule.duration_minutes || 5} min read</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Peer Circles */}
                      {peerCircles.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground"><Users size={12} className="text-primary" /> Join a Community</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {peerCircles.slice(0, 2).map((circle: any) => (
                              <div key={circle.id} className="p-3 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer bg-card">
                                <p className="font-body text-xs font-semibold text-foreground line-clamp-1">{circle.name}</p>
                                <p className="font-body text-[10px] text-muted-foreground mt-0.5">{circle.member_count || 0} members</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Goal Setting CTA */}
                      <div className="p-3 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <Goal className="text-primary" size={16} />
                          <div>
                            <p className="font-body text-xs font-semibold">Set an exploration goal</p>
                            <p className="font-body text-[10px] text-muted-foreground">E.g., "Explore 2 domains this week"</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-3 rounded-lg">Set Goal</Button>
                      </div>

                      <Button className="w-full text-xs" size="sm" onClick={() => { setShowNextSteps(false); setTab("domains"); }}>
                        View All Recommendations <ArrowRight size={12} className="ml-1.5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Tabs Content Feed */}
            {!showNextSteps && (
              <div className="space-y-6">
                
                {/* Discover Yourself Assessment */}
                <TabsContent value="assessment" className="outline-none mt-0">
                  <div className="bg-white rounded-3xl border border-border shadow-xl p-6 relative overflow-hidden space-y-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <ClipboardCheck className="text-primary" size={20} />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-lg text-foreground">Discovery Mindset Assessment</h2>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">
                            Calibrate your profile and discover your archetype by telling us about your study patterns.
                          </p>
                        </div>
                      </div>
                      <AssessmentTestSection user={user} recordSignal={recordSignal} recordMultipleSignals={recordMultipleSignals} onAdvance={(t) => { setTab(t); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
                    </div>
                  </div>
                </TabsContent>

                {/* Psychometric Assessment Test */}
                <TabsContent value="psychometric" className="outline-none mt-0">
                  <div className="bg-white rounded-3xl border border-border shadow-xl p-6 relative overflow-hidden space-y-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#5500cb]/[0.03] to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Brain className="text-[#5500cb]" size={20} />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-lg text-foreground">Psychometric Career Calibration</h2>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">
                            A deep-dive, 22-question cognitive and behavioral assessment designed to map your core traits.
                          </p>
                        </div>
                      </div>
                      <PsychometricTest
                        userId={user!.id}
                        onComplete={() => {
                          if (discoveryDone) {
                            toast.success("Psychometric complete! One last assessment to go ✨");
                          }
                          setTab("interests");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        recordSignal={recordSignal}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Holistic Interests Assessment (12 Qs) */}
                <TabsContent value="interests" className="outline-none mt-0">
                  <div className="bg-white rounded-3xl border border-border shadow-xl p-6 relative overflow-hidden space-y-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#5500cb]/[0.03] to-transparent pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Heart className="text-[#5500cb]" size={20} />
                        </div>
                        <div>
                          <h2 className="font-display font-bold text-lg text-foreground">Holistic Interests Assessment</h2>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">
                            A 12-question deep-map of what you're curious about — feeds the Career Navigator module.
                          </p>
                        </div>
                      </div>
                      <InterestsAssessment
                        userId={user!.id}
                        onComplete={() => {
                          if (discoveryDone && psychometricDone) {
                            toast.success("All three assessments complete! Every section unlocked 🎉");
                          }
                          setTab("insights");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        recordSignal={recordSignal}
                      />
                    </div>
                  </div>
                </TabsContent>


                {/* Explore Interests — moved into Career Navigator module */}
                <TabsContent value="explore" className="outline-none mt-0 space-y-6">
                  <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-accent/[0.03] pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
                        <Sparkles className="text-white" size={26} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h2 className="font-display font-bold text-xl text-foreground">
                          Explore in the Career Navigator
                        </h2>
                        <p className="font-body text-sm text-muted-foreground leading-relaxed">
                          Career Cards, Story Mode, Challenge Mode and Visual Mode now live in their own home — the <strong>Career Navigator</strong>. Every card is personalized from your onboarding answers and Compass results, and we end with 4–5 trending picks from each of the 17 sectors in our backend.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Badge variant="secondary" className="text-[10px]"><Layers size={10} className="mr-1" /> Career Cards</Badge>
                          <Badge variant="secondary" className="text-[10px]"><MessageSquare size={10} className="mr-1" /> Story Mode</Badge>
                          <Badge variant="secondary" className="text-[10px]"><Target size={10} className="mr-1" /> Challenge Mode</Badge>
                          <Badge variant="secondary" className="text-[10px]"><Palette size={10} className="mr-1" /> Visual Mode</Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => navigate("/dashboard/career-navigator")}
                        size="sm"
                        className="rounded-full px-6 h-10 text-xs font-semibold shrink-0"
                      >
                        Open Career Navigator <ArrowRight size={14} className="ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Quests Tab */}
                <TabsContent value="quests" className="outline-none mt-0 space-y-6">
                  <AnimatePresence mode="wait">
                    {activeQuest ? (
                      <motion.div key="active-quest" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                        <Card className="rounded-3xl border-border shadow-xl overflow-hidden bg-white">
                          <CardHeader className="p-6 pb-4 border-b border-border/40 bg-muted/10">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <CardTitle className="text-lg font-display font-bold text-foreground">{activeQuest.title}</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">{activeQuest.description}</CardDescription>
                              </div>
                              <Badge variant="secondary" className="text-xs shrink-0 px-3 py-1 font-semibold text-primary bg-primary/10 border-none rounded-full">{activeQuest.points} pts</Badge>
                            </div>
                            <Progress value={(currentPromptIndex / (activeQuest.prompts?.length || 1)) * 100} className="mt-4 h-1.5" />
                          </CardHeader>
                          <CardContent className="p-6 space-y-6">
                            {activeQuest.prompts && currentPromptIndex < activeQuest.prompts.length ? (
                              <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 space-y-4">
                                  <p className="font-display text-sm sm:text-base font-semibold text-foreground leading-snug">
                                    {activeQuest.prompts[currentPromptIndex].question}
                                  </p>
                                  
                                  {activeQuest.prompts[currentPromptIndex].type === "open" && (
                                    <Textarea
                                      placeholder="Share your thoughts..."
                                      value={questResponses[currentPromptIndex] || ""}
                                      onChange={e => handleQuestResponse(currentPromptIndex, e.target.value)}
                                      rows={4}
                                      className="text-sm rounded-xl bg-white border border-border focus:border-primary focus:ring-1 focus:ring-primary/20"
                                    />
                                  )}
                                  
                                  {activeQuest.prompts[currentPromptIndex].type === "choice" && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {activeQuest.prompts[currentPromptIndex].options?.map((opt: string) => {
                                        const isSelected = questResponses[currentPromptIndex] === opt;
                                        return (
                                          <button
                                            key={opt}
                                            onClick={() => handleQuestResponse(currentPromptIndex, opt)}
                                            className={`group flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-300 font-body text-xs sm:text-sm ${
                                              isSelected 
                                                ? "border-primary bg-primary/[0.03] shadow-md font-semibold text-primary" 
                                                : "border-border bg-white hover:border-primary/40 hover:bg-muted/10 text-foreground"
                                            }`}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/30 group-hover:border-primary/50"
                                              }`}>
                                                {isSelected && <Check size={8} strokeWidth={3} />}
                                              </div>
                                              <span className="font-medium">{opt}</span>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                  
                                  {activeQuest.prompts[currentPromptIndex].type === "multi" && (
                                    <div className="flex flex-wrap gap-2.5">
                                      {activeQuest.prompts[currentPromptIndex].options?.map((opt: string) => {
                                        const selected = (questResponses[currentPromptIndex] || []).includes(opt);
                                        return (
                                          <button
                                            key={opt}
                                            onClick={() => {
                                              const current = questResponses[currentPromptIndex] || [];
                                              handleQuestResponse(currentPromptIndex, selected ? current.filter((o: string) => o !== opt) : [...current, opt]);
                                            }}
                                            className={`px-4 py-2 rounded-full border-2 transition-all duration-300 text-xs font-body font-medium flex items-center gap-1.5 ${
                                              selected 
                                                ? "border-primary bg-primary text-white font-semibold" 
                                                : "border-border bg-white hover:border-primary/40 text-muted-foreground"
                                            }`}
                                          >
                                            {selected && <Check size={10} strokeWidth={3} />}
                                            {opt}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex justify-between items-center pt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setCurrentPromptIndex(Math.max(0, currentPromptIndex - 1))} 
                                    disabled={currentPromptIndex === 0} 
                                    className="text-xs rounded-full px-5 h-9"
                                  >
                                    <ArrowLeft size={14} className="mr-1.5" /> Back
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      if (currentPromptIndex < activeQuest.prompts.length - 1) { setCurrentPromptIndex(currentPromptIndex + 1); }
                                      else { completeQuest(); }
                                    }} 
                                    disabled={!questResponses[currentPromptIndex]} 
                                    size="sm" 
                                    className="text-xs rounded-full px-6 h-9 bg-primary text-white hover:bg-primary/95 font-semibold"
                                  >
                                    {currentPromptIndex < activeQuest.prompts.length - 1 ? "Next Question" : "Complete Quest"} <ArrowRight size={14} className="ml-1.5" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 space-y-4">
                                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                                  <Check className="text-success w-8 h-8" />
                                </div>
                                <div className="space-y-1">
                                  <h3 className="font-display text-lg font-bold">Quest Complete!</h3>
                                  <p className="font-body text-xs text-muted-foreground">You earned {activeQuest.points} points</p>
                                </div>
                                <Button size="sm" onClick={() => setActiveQuest(null)} className="rounded-full px-6 text-xs font-semibold">
                                  Back to Quests
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ) : (
                      <motion.div key="quest-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quests.length === 0 ? (
                          <Card className="rounded-3xl border-border bg-white shadow-xl col-span-full">
                            <CardContent className="pt-8 text-center py-12 space-y-4">
                              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto opacity-60">
                                <Trophy className="text-muted-foreground w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="font-display text-base font-bold text-foreground">No Quests Available Yet</h3>
                                <p className="font-body text-xs text-muted-foreground max-w-sm mx-auto">Quests will unlock dynamically as you share signals in other sections.</p>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          quests.map((quest, i) => {
                            const status = getQuestStatus(quest.id);
                            const isCompleted = status === "completed";
                            return (
                              <motion.div key={quest.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                <div className={`bg-white rounded-3xl border-2 shadow-md p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] flex flex-col justify-between h-full ${
                                  isCompleted ? "border-success/20 bg-success/[0.01]" : "border-border/80 hover:border-primary/40"
                                }`}>
                                  <div className={`absolute inset-0 bg-gradient-to-b ${isCompleted ? "from-success/[0.02]" : "from-primary/[0.02]"} to-transparent pointer-events-none`} />
                                  <div className="relative z-10 space-y-4 flex-1 flex flex-col justify-between">
                                    <div className="flex items-start gap-4">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                        quest.quest_type === "story" ? "bg-blue/10" : quest.quest_type === "challenge" ? "bg-warmth/10" : "bg-indigo/10"
                                      }`}>
                                        {quest.quest_type === "story" ? <MessageSquare className="text-blue" size={22} /> : quest.quest_type === "challenge" ? <Target className="text-warmth" size={22} /> : <Palette className="text-indigo" size={22} />}
                                      </div>
                                      <div className="space-y-1 flex-1 min-w-0">
                                        <h3 className="font-display font-bold text-sm sm:text-base text-foreground truncate">{quest.title}</h3>
                                        <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-2">{quest.description}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-border/40 gap-4 mt-auto">
                                      <Badge variant={isCompleted ? "default" : "secondary"} className={`text-[10px] uppercase font-bold rounded-full px-2.5 py-0.5 ${
                                        isCompleted ? "bg-success text-white hover:bg-success" : "text-primary bg-primary/10"
                                      }`}>{isCompleted ? "Completed" : `+${quest.points} pts`}</Badge>
                                      {!isCompleted && (
                                        <Button onClick={() => startQuest(quest)} size="sm" className="text-xs h-8 px-4 rounded-full bg-primary text-white font-body font-semibold">
                                          <Play size={10} className="mr-1" /> {status === "in_progress" ? "Resume" : "Start"}
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                {/* Domains Recommendations Tab */}
                <TabsContent value="domains" className="outline-none mt-0 space-y-6">
                  {domains.length === 0 ? (
                    <Card className="rounded-3xl border-border bg-white shadow-xl">
                      <CardContent className="pt-8 text-center py-12 space-y-4">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto opacity-60">
                          <Brain className="text-muted-foreground w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-display text-base font-bold text-foreground">No Recommendations Yet</h3>
                          <p className="font-body text-xs text-muted-foreground max-w-sm mx-auto">Like at least 3 career cards or complete assessments to trigger recommendation mapping.</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setTab("explore")} className="text-xs rounded-full px-6 h-9">
                          Start Exploring <ArrowRight size={12} className="ml-1.5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {domains.map((domain, i) => (
                        <motion.div key={domain.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                          <div className="bg-white rounded-3xl border-2 border-border/80 shadow-md p-6 relative overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full space-y-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />
                            <div className="relative z-10 flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 text-white text-lg shadow-sm">
                                🎯
                              </div>
                              <div className="flex-1 min-w-0 space-y-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-display font-bold text-base text-foreground leading-tight">{domain.domain_name}</h3>
                                    <Badge className="text-[10px] rounded-full px-2.5 py-0.5 bg-primary/10 text-primary border-none shadow-none font-bold">
                                      {Math.round(domain.match_score * 100)}% Match
                                    </Badge>
                                  </div>
                                  <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-3">{domain.description}</p>
                                </div>
                                
                                {domain.reasons?.length > 0 && (
                                  <div className="space-y-2 bg-muted/40 p-4 rounded-2xl border border-border/40">
                                    <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Why it matches you:</p>
                                    <div className="space-y-1.5">
                                      {domain.reasons.slice(0, 3).map((reason: string, j: number) => (
                                        <p key={j} className="font-body text-[11px] text-muted-foreground flex items-start gap-2 leading-relaxed">
                                          <Check size={12} className="text-success shrink-0 mt-0.5" />
                                          <span className="line-clamp-2">{reason}</span>
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex gap-2 justify-end pt-4 border-t border-border/40 mt-auto">
                              {domain.status !== "saved" && (
                                <Button variant="outline" size="sm" onClick={() => saveDomain(domain.id)} className="h-9 text-xs rounded-full font-body font-semibold px-4 border-border/60 hover:bg-muted/10">
                                  <BookmarkPlus size={14} className="mr-1.5 text-primary" /> Save Domain
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-9 text-xs rounded-full font-body font-semibold px-4 text-primary hover:text-primary hover:bg-primary/5 bg-primary/5">
                                Explore Paths <ChevronRight size={14} className="ml-0.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Insights & Behavior (merged) */}
                <TabsContent value="insights" className="outline-none mt-0 space-y-8">
                  <InsightsView
                    conclusion={conclusion}
                    loading={conclusionLoading}
                    regenerate={regenerateConclusion}
                    regenerating={regeneratingConclusion}
                  />

                  {/* Archetype Hero Card (moved from former Behavior tab) */}
                  {conclusion && (
                    <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8 relative overflow-hidden space-y-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-accent/[0.02] pointer-events-none" />
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg text-white">
                            <Sparkles size={26} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground font-extrabold">Your Calibration Archetype</p>
                            <h2 className="font-display text-2xl text-foreground font-extrabold leading-tight tracking-tight">
                              {conclusion.archetype || "The Explorer"}
                            </h2>
                          </div>
                        </div>
                        {conclusion.archetype_description && (
                          <p className="font-body text-xs sm:text-sm text-foreground/85 leading-relaxed max-w-4xl bg-muted/10 p-4 rounded-2xl border border-border/50">{conclusion.archetype_description}</p>
                        )}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                          <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                              <Brain size={14} className="text-primary" />
                              <span className="font-body text-[10px] uppercase tracking-wide font-extrabold">Cognitive Style</span>
                            </div>
                            <p className="font-display text-xs sm:text-sm text-foreground font-bold leading-tight">{conclusion.cognitive_style || "—"}</p>
                          </div>
                          <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                              <Heart size={14} className="text-rose-500" />
                              <span className="font-body text-[10px] uppercase tracking-wide font-extrabold">Motivation</span>
                            </div>
                            <p className="font-display text-xs sm:text-sm text-foreground font-bold leading-tight">{conclusion.motivation_type || "—"}</p>
                          </div>
                          <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                              <Target size={14} className="text-sky-500" />
                              <span className="font-body text-[10px] uppercase tracking-wide font-extrabold">Work Style</span>
                            </div>
                            <p className="font-display text-xs sm:text-sm text-foreground font-bold leading-tight">{conclusion.work_style || "—"}</p>
                          </div>
                          <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                              <Compass size={14} className="text-amber-500" />
                              <span className="font-body text-[10px] uppercase tracking-wide font-extrabold">Match Confidence</span>
                            </div>
                            <p className="font-display text-xs sm:text-sm text-foreground font-bold leading-tight">{`${Math.round((conclusion.confidence_score || 0.7) * 100)}%`}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Strengths & Growth Areas (moved from former Behavior tab) */}
                  {conclusion && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                      <div className="bg-white rounded-3xl border border-border shadow-xl p-6">
                        <div className="space-y-4">
                          <h3 className="font-display text-base font-bold text-emerald-600 flex items-center gap-2">
                            <Trophy size={18} /> Core Strengths
                          </h3>
                          <div className="space-y-2 pt-1">
                            {(conclusion.strengths || []).map((s: string, i: number) => (
                              <div key={i} className="flex items-start gap-2.5 p-2 bg-emerald-500/[0.03] rounded-xl border border-emerald-500/10 text-foreground font-body text-xs leading-relaxed">
                                <span className="text-emerald-500 mt-0.5 font-bold">✓</span>
                                <span>{s}</span>
                              </div>
                            ))}
                            {!(conclusion.strengths?.length) && (
                              <p className="font-body text-xs text-muted-foreground">Complete assessments to unlock strength mapping.</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-3xl border border-border shadow-xl p-6">
                        <div className="space-y-4">
                          <h3 className="font-display text-base font-bold text-amber-600 flex items-center gap-2">
                            <Lightbulb size={18} /> Development Edges
                          </h3>
                          <div className="space-y-2 pt-1">
                            {(conclusion.growth_areas || []).map((s: string, i: number) => (
                              <div key={i} className="flex items-start gap-2.5 p-2 bg-amber-500/[0.03] rounded-xl border border-amber-500/10 text-foreground font-body text-xs leading-relaxed">
                                <span className="text-amber-500 mt-0.5 font-bold">✦</span>
                                <span>{s}</span>
                              </div>
                            ))}
                            {!(conclusion.growth_areas?.length) && (
                              <p className="font-body text-xs text-muted-foreground">Complete assessments to unlock expansion areas.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interest Blueprint */}
                  <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8 space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="text-primary w-5 h-5" />
                        <span className="font-body text-[10px] text-primary uppercase tracking-wider font-extrabold">Active Vectors</span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground">Your Interest Blueprint</h3>
                      <p className="font-body text-xs text-muted-foreground">Live maps synthesized from assessments, article engagement, and curiosity choices.</p>
                    </div>
                    <div className="min-h-[180px]">
                      {interests.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-border/80 rounded-2xl">
                          <p className="text-xs text-muted-foreground font-body leading-relaxed">
                            Explore more topics or finish assessment questions to begin building your interest cloud.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {Object.entries(
                            interests.reduce<Record<string, any[]>>((acc, it) => {
                              const key = it.category || it.source || "general";
                              (acc[key] ||= []).push(it);
                              return acc;
                            }, {})
                          ).map(([cat, items]) => (
                            <div key={cat} className="space-y-2">
                              <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{cat}</p>
                              <div className="flex flex-wrap gap-2">
                                {items.map((it: any) => {
                                  const strength = Math.round((it.strength || 0.5) * 100);
                                  return (
                                    <motion.div
                                      key={it.id}
                                      whileHover={{ y: -2 }}
                                      className="px-3.5 py-2 rounded-2xl bg-white border border-border/80 shadow-sm flex items-center gap-2 text-xs font-body font-semibold text-foreground"
                                    >
                                      <span className={`w-1.5 h-1.5 rounded-full ${strength >= 80 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : strength >= 50 ? "bg-primary" : "bg-muted-foreground"}`} />
                                      <span>{it.name}</span>
                                      <span className="opacity-60 text-[10px] font-bold text-primary">{strength}%</span>
                                    </motion.div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Behavioral Patterns (signals detected) */}
                  <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8 space-y-6">
                    <div className="space-y-1">
                      <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                        <Activity className="text-primary" size={18} />
                        Behavioral Signals Detected
                      </h3>
                      <p className="font-body text-xs text-muted-foreground">Mindset calibration mapping response speed, skipping patterns, and active choices.</p>
                    </div>

                    {behaviorInsights ? (
                      <div className="space-y-6 pt-1">
                        {behaviorInsights.ideal_work_environment && (
                          <div className="p-4 rounded-2xl border border-border bg-muted/10 space-y-1.5">
                            <p className="font-body text-[10px] text-muted-foreground font-extrabold uppercase tracking-wide">Optimized Work Environment</p>
                            <p className="font-body text-xs sm:text-sm text-foreground leading-relaxed">{behaviorInsights.ideal_work_environment}</p>
                          </div>
                        )}

                        {behaviorInsights.behavioral_patterns?.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {behaviorInsights.behavioral_patterns.map((bp: any, i: number) => {
                              const isStrong = bp.strength === "strong";
                              const isModerate = bp.strength === "moderate";
                              return (
                                <div key={i} className={`flex items-start gap-3.5 p-4 rounded-2xl bg-white border shadow-sm
                                  ${isStrong ? "border-emerald-500/20" : isModerate ? "border-primary/20" : "border-border/80"}`}
                                >
                                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0
                                    ${isStrong ? "bg-emerald-500" : isModerate ? "bg-primary" : "bg-muted-foreground"}`}
                                  />
                                  <div className="min-w-0 space-y-1">
                                    <p className="font-body text-xs sm:text-sm font-bold text-foreground">{bp.pattern}</p>
                                    <p className="font-body text-[11px] text-muted-foreground leading-relaxed">{bp.interpretation}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="pt-2 border-t border-border/40">
                          <Button
                            onClick={async () => {
                              if (behaviorInsights.areas_of_resonance) {
                                await recordMultipleSignals("curiosity_compass", behaviorInsights.areas_of_resonance, "domain_interest", 0.8);
                              }
                              if (behaviorInsights.career_archetype) {
                                await recordSignal("curiosity_compass", behaviorInsights.career_archetype, "preference", 0.9);
                              }
                              toast.success("Transferring insights to AI Roadmaps...");
                              navigate("/dashboard/roadmap?source=behavior_analysis");
                            }}
                            size="sm"
                            className="w-full text-xs h-11 rounded-full font-body font-bold bg-primary text-white hover:bg-[#4300a3]"
                          >
                            <Route size={14} className="mr-1.5" /> Construct AI Career Roadmap
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                          <Activity className="text-primary w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-display text-sm font-bold text-foreground">Telemetry Analysis Available</h4>
                          <p className="font-body text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                            Obtain detailed behavioral profiling by analyzing decision speed, choice depth, and active interests.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={getBehaviorInsights}
                          disabled={aiLoading}
                          className="text-xs rounded-full px-6 h-10 bg-primary text-white font-body font-bold shadow-md transition-all hover:bg-[#4300a3]"
                        >
                          {aiLoading ? "Analyzing Telemetry..." : "Analyze My Behavior"}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Adaptive Prompts */}
                  {adaptivePrompts && (
                    <Card className="rounded-3xl border-border bg-white shadow-xl overflow-hidden w-full">
                      <CardHeader className="pb-4 border-b border-border/40 bg-muted/10">
                        <CardTitle className="font-display text-base font-bold flex items-center gap-2">
                          <Zap className="text-accent w-4 h-4" /> Recommended Reflections
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground mt-0.5">Targeted writing prompts based on curiosity triggers</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {adaptivePrompts.prompts?.map((p: any, i: number) => (
                            <motion.div
                              key={i}
                              whileHover={{ y: -2 }}
                              className="p-5 rounded-2xl border border-border hover:border-primary/30 bg-card hover:shadow-md transition-all cursor-pointer space-y-2 flex flex-col justify-between"
                            >
                              <p className="font-body text-xs font-bold text-foreground leading-relaxed">{p.question}</p>
                              <p className="font-body text-[10px] text-muted-foreground leading-relaxed bg-muted/20 p-2 rounded-xl border border-border/40">{p.why}</p>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

              </div>
            )}
          </main>



        </div>
      </Tabs>
    </div>
  );
};

export default CuriosityCompass;
