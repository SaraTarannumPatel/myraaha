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
  Map, Route, CheckCircle2, ClipboardCheck, Lock
} from "lucide-react";
import CareerCardDeck from "@/components/career/CareerCardDeck";
import StoryModeCards from "@/components/career/StoryModeCards";
import ChallengeModeCards from "@/components/career/ChallengeModeCards";
import { useUserSignals } from "@/hooks/useUserSignals";
import { useNavigate } from "react-router-dom";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";
import PsychometricTest from "@/components/curiositycompass/PsychometricTest";
import AssessmentGate from "@/components/curiositycompass/AssessmentGate";
import OnboardingCelebration from "@/components/curiositycompass/OnboardingCelebration";
import InsightsView from "@/components/curiositycompass/InsightsView";
import { useAssessmentRewards } from "@/hooks/useAssessmentRewards";
import { buildDiscoverySignal } from "@/lib/assessmentSignalMap";
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

const MODES = [
  { id: "story", label: "Story Mode", icon: MessageSquare, desc: "Real career stories told by professionals" },
  { id: "challenge", label: "Challenge Mode", icon: Target, desc: "Real-world tasks from different careers" },
  { id: "visual", label: "Visual Mode", icon: Palette, desc: "Pick images and icons that resonate" },
  { id: "career-cards", label: "Career Cards", icon: Layers, desc: "Browse detailed career path cards" },
];

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
const AssessmentTestSection = ({ user, recordSignal, recordMultipleSignals }: { user: any; recordSignal: any; recordMultipleSignals: any }) => {
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

  // Check if already completed
  useEffect(() => {
    if (profile?.journey_responses?.assessment_completed) {
      setCompleted(true);
    }
  }, [profile]);

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
    try {
      await supabase.functions.invoke("assessment-synthesizer", { body: { test_type: "discovery" } });
      await supabase.functions.invoke("assessment-synthesizer", { body: { test_type: "combined" } });
    } catch (e) {
      console.warn("Discovery synthesis failed", e);
    }

    setCompleted(true);
    toast.success("Assessment complete! Your compass is now calibrated 🧭");
  };

  const totalSteps = variantQs.length + journeyQs.length;
  const currentTotal = phase === "variant" ? variantStep : variantQs.length + journeyStep;

  if (completed) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <h3 className="font-display text-xl">Assessment Complete ✨</h3>
          <p className="font-body text-sm text-muted-foreground">
            Your Curiosity Compass has been calibrated based on your psychometric signals.
            Your journey: <Badge variant="secondary">{meta?.title || journeyId}</Badge>
          </p>
          <Button variant="outline" onClick={() => { setCompleted(false); setPhase("variant"); setVariantStep(0); setVariantAnswers({}); setJourneyStep(0); setJourneyAnswers({}); }}>
            Retake Assessment
          </Button>
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
    <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-xl w-full bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-4"
      >
        {/* Popup Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={18} className="text-primary" />
              <span className="font-display text-sm sm:text-base">Discovery Assessment</span>
            </div>
            <span className="font-body text-xs text-muted-foreground">{currentTotal + 1} / {totalSteps}</span>
          </div>
          <Progress value={((currentTotal + 1) / totalSteps) * 100} className="h-1.5" />
          <p className="font-body text-xs text-muted-foreground mt-2">
            {phase === "variant" ? "Vibe Check — quick calibration" : meta?.title}
          </p>
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-6 max-h-[55vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {phase === "variant" && currentVariantQ && (
              <motion.div key={`v-${variantStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="font-display text-base sm:text-lg text-foreground">{currentVariantQ.question}</h3>
                <div className="space-y-2">
                  {currentVariantQ.options.map((opt) => {
                    const isSelected = variantAnswers[currentVariantQ.id] === opt.value;
                    return (
                      <button key={opt.value} onClick={() => setVariantAnswers({ ...variantAnswers, [currentVariantQ.id]: opt.value })}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all font-body text-sm ${isSelected ? "border-primary bg-primary/10 font-semibold" : "border-border hover:border-primary/30"}`}>
                        {isSelected && <CheckCircle2 size={14} className="inline mr-2 text-primary" />}{opt.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {phase === "journey" && currentJourneyQ && (
              <motion.div key={`j-${journeyStep}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="font-display text-base sm:text-lg text-foreground">{currentJourneyQ.question}</h3>
                {currentJourneyQ.type === "multi" && (
                  <p className="font-body text-xs text-muted-foreground">Pick {currentJourneyQ.maxSelect ? `up to ${currentJourneyQ.maxSelect}` : "as many as you want"}</p>
                )}
                <div className={currentJourneyQ.options.length > 5 ? "flex flex-wrap gap-2" : "space-y-2"}>
                  {currentJourneyQ.options.map((opt) => {
                    const isMulti = currentJourneyQ.type === "multi";
                    const isSelected = isMulti
                      ? ((journeyAnswers[currentJourneyQ.id] as string[]) || []).includes(opt.value)
                      : journeyAnswers[currentJourneyQ.id] === opt.value;
                    return (
                      <button key={opt.value}
                        onClick={() => handleJourneySelect(currentJourneyQ.id, opt.value, currentJourneyQ.type, currentJourneyQ.maxSelect)}
                        className={`${currentJourneyQ.options.length > 5 ? "px-3 py-2 rounded-xl" : "w-full text-left p-3 rounded-xl"} border-2 transition-all font-body text-sm ${isSelected ? "border-primary bg-primary/10 font-semibold" : "border-border hover:border-primary/30"}`}>
                        {isSelected && <CheckCircle2 size={14} className="inline mr-1.5 text-primary" />}{opt.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            if (phase === "variant") { if (variantStep > 0) setVariantStep(variantStep - 1); }
            else { if (journeyStep > 0) setJourneyStep(journeyStep - 1); else setPhase("variant"); }
          }} disabled={phase === "variant" && variantStep === 0}>
            <ArrowLeft size={14} className="mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={phase === "variant" ? handleSkipVariant : handleSkipJourney} className="text-muted-foreground text-xs">
              Skip
            </Button>
            {phase === "variant" ? (
              <Button onClick={handleVariantNext} disabled={!variantAnswers[currentVariantQ?.id]} size="sm" className="bg-primary text-accent rounded-full px-5">
                Next <ArrowRight size={14} className="ml-1" />
              </Button>
            ) : (
              <Button onClick={handleJourneyNext}
                disabled={currentJourneyQ?.type === "single" ? !journeyAnswers[currentJourneyQ.id] : !((journeyAnswers[currentJourneyQ?.id] as string[])?.length > 0)}
                size="sm" className="bg-primary text-accent rounded-full px-5">
                {journeyStep === journeyQs.length - 1 ? "Finish" : "Next"} <ArrowRight size={14} className="ml-1" />
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
        <div className="max-w-lg w-full bg-card rounded-2xl border border-border shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
              <page.icon size={36} className="text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl text-foreground">{page.title}</h2>
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
  <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl w-full bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
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
  const bothAssessmentsDone = discoveryDone && psychometricDone;
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

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    await Promise.all([fetchCareerCards(), fetchQuests(), fetchDomains(), fetchInterests(), fetchNextStepData()]);
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
    setShowReflection(true);
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
    await supabase.from("achievements").insert({
      user_id: user!.id,
      achievement_type: "quest_completed",
      title: `Completed: ${activeQuest.title}`,
      description: `Finished the "${activeQuest.title}" quest`,
      points: activeQuest.points || 10,
    });
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
    <div className="space-y-8">
      {/* Intro pages for first-time visitors */}
      {showIntro && (
        <CompassIntro onComplete={() => {
          setShowIntro(false);
          localStorage.setItem("myraaha_compass_intro_seen", "true");
        }} />
      )}

      {/* Onboarding celebration for fully completed users */}
      <OnboardingCelebration onDismiss={() => { setShowCelebration(false); setTab("assessment"); }} />
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

      {/* Search Bar */}
      <ModuleSearchBar
        placeholder="Search career domains, job roles, paths..."
        sources={["careers", "domains", "jobs"]}
        showAiBadge
        onSelect={(item) => {
          recordSignal("curiosity_compass", item.title, "domain_interest", 0.8, { source: "search" });
          toast.success(`"${item.title}" added to your exploration signals!`);
        }}
      />

      {/* Progress Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-2">
                  <Heart className="text-terracotta" size={18} />
                </div>
                <p className="font-display text-2xl text-foreground">{likedCount}</p>
                <p className="font-body text-xs text-muted-foreground">Domains Liked</p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <Trophy className="text-accent" size={18} />
                </div>
                <p className="font-display text-2xl text-foreground">{completedQuests}</p>
                <p className="font-body text-xs text-muted-foreground">Quests Done</p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                  <Star className="text-success" size={18} />
                </div>
                <p className="font-display text-2xl text-foreground">{domains.length}</p>
                <p className="font-body text-xs text-muted-foreground">Recommendations</p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-indigo/10 flex items-center justify-center mx-auto mb-2">
                  <PenLine className="text-indigo" size={18} />
                </div>
                <p className="font-display text-2xl text-foreground">{interests.length}</p>
                <p className="font-body text-xs text-muted-foreground">Interests Found</p>
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
                  <Button key={m.id} variant="outline" className="flex flex-col gap-2 h-auto py-4 px-6" onClick={() => setMood(m.id)}>
                    <m.icon className={m.color} size={24} />
                    <span className="text-xs">{m.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Reflection Modal (inline) */}
      <AnimatePresence>
        {showReflection && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="border-accent/40 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <PenLine className="text-accent-foreground" size={20} />
                  Capture Your Reflection
                </CardTitle>
                <CardDescription>What stood out to you? This saves to your personal journal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Emotion checkpoint */}
                <div>
                  <p className="font-body text-sm text-muted-foreground mb-2">How do you feel after this exploration?</p>
                  <div className="flex gap-2">
                    {MOODS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setMoodCheckpoint(m.id)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${moodCheckpoint === m.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                      >
                        <m.icon className={m.color} size={18} />
                        <span className="text-xs">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="This feels exciting because… / I realized that… / I want to explore more about…"
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={saveReflection} disabled={!reflectionText.trim()}>
                    <PenLine size={14} className="mr-2" /> Save to Journal
                  </Button>
                  <Button variant="ghost" onClick={() => { setShowReflection(false); getSessionSummary(); }}>
                    Skip for now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Summary & Next Steps */}
      <AnimatePresence>
        {showNextSteps && sessionSummary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary" size={20} />
                  Exploration Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionSummary.session_summary && (
                  <p className="font-body text-sm">{sessionSummary.session_summary}</p>
                )}
                {sessionSummary.key_discoveries?.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-2">Key Discoveries</h4>
                    {sessionSummary.key_discoveries.map((d: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 mb-1">
                        <Lightbulb size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                        <p className="font-body text-sm text-muted-foreground">{d}</p>
                      </div>
                    ))}
                  </div>
                )}
                {sessionSummary.patterns?.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-2">Patterns Observed</h4>
                    {sessionSummary.patterns.map((p: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-muted/30 mb-2">
                        <p className="font-body text-sm font-medium">{p.pattern}</p>
                        <p className="font-body text-xs text-muted-foreground">{p.meaning}</p>
                      </div>
                    ))}
                  </div>
                )}
                {sessionSummary.motivational_note && (
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <p className="font-body text-sm text-success">{sessionSummary.motivational_note}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="text-primary" size={20} />
                  Your Next Steps
                </CardTitle>
                <CardDescription>Based on your exploration, here's what you can do next</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Domain suggestions from summary */}
                {sessionSummary.domains_to_pursue?.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-3 flex items-center gap-2"><Target size={14} className="text-primary" /> Domains to Explore</h4>
                    <div className="flex flex-wrap gap-2">
                      {sessionSummary.domains_to_pursue.map((d: string, i: number) => (
                        <Badge key={i} variant="secondary" className="px-3 py-1.5">{d}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Capsules */}
                {learningCapsules.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-3 flex items-center gap-2"><BookOpen size={14} className="text-primary" /> Suggested Learning</h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      {learningCapsules.slice(0, 3).map((capsule: any) => (
                        <div key={capsule.id} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                          <p className="font-body text-sm font-medium text-foreground">{capsule.title}</p>
                          <p className="font-body text-xs text-muted-foreground mt-1">{capsule.duration_minutes || 5} min</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Peer Circles */}
                {peerCircles.length > 0 && (
                  <div>
                    <h4 className="font-display text-sm mb-3 flex items-center gap-2"><Users size={14} className="text-primary" /> Join a Community</h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {peerCircles.slice(0, 2).map((circle: any) => (
                        <div key={circle.id} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                          <p className="font-body text-sm font-medium text-foreground">{circle.name}</p>
                          <p className="font-body text-xs text-muted-foreground mt-1">{circle.member_count || 0} members</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Goal Setting CTA */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Goal className="text-primary" size={20} />
                    <div>
                      <p className="font-body text-sm font-medium">Set an exploration goal</p>
                      <p className="font-body text-xs text-muted-foreground">"Let's explore 2 domains this week"</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Set Goal</Button>
                </div>

                <Button className="w-full" onClick={() => { setShowNextSteps(false); setTab("domains"); }}>
                  View All Recommendations <ArrowRight size={14} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tabs */}
      {!showNextSteps && (
        <Tabs value={tab} onValueChange={(v) => {
          // Block locked tabs
          if (!bothAssessmentsDone && !["assessment", "psychometric"].includes(v)) {
            toast.info("Complete both assessments first to unlock this section.");
            return;
          }
          setTab(v);
        }}>
          <TabsList className="flex overflow-x-auto w-full max-w-3xl gap-1">
            <TabsTrigger value="assessment">Discover Yourself</TabsTrigger>
            <TabsTrigger value="psychometric">Psychometric</TabsTrigger>
            <TabsTrigger value="explore" disabled={!bothAssessmentsDone} className={!bothAssessmentsDone ? "opacity-50" : ""}>
              {!bothAssessmentsDone && <Lock size={12} className="mr-1" />}Interests
            </TabsTrigger>
            <TabsTrigger value="quests" disabled={!bothAssessmentsDone} className={!bothAssessmentsDone ? "opacity-50" : ""}>
              {!bothAssessmentsDone && <Lock size={12} className="mr-1" />}Quests
            </TabsTrigger>
            <TabsTrigger value="domains" disabled={!bothAssessmentsDone} className={!bothAssessmentsDone ? "opacity-50" : ""}>
              {!bothAssessmentsDone && <Lock size={12} className="mr-1" />}Domains
            </TabsTrigger>
            <TabsTrigger value="insights" disabled={!bothAssessmentsDone} className={!bothAssessmentsDone ? "opacity-50" : ""}>
              {!bothAssessmentsDone && <Lock size={12} className="mr-1" />}Insights & Profile
            </TabsTrigger>
            <TabsTrigger value="behavior" disabled={!bothAssessmentsDone} className={!bothAssessmentsDone ? "opacity-50" : ""}>
              {!bothAssessmentsDone && <Lock size={12} className="mr-1" />}Behavior
            </TabsTrigger>
          </TabsList>

          {/* Assessment Gate - shown on locked tabs */}
          {!bothAssessmentsDone && !["assessment", "psychometric"].includes(tab) && (
            <div className="mt-6">
              <AssessmentGate onGoToAssessment={(t) => setTab(t === "discovery" ? "assessment" : "psychometric")} />
            </div>
          )}

          {/* ===== Discovery Assessment Tab (renamed from Psychometric Assessment Test) ===== */}
          <TabsContent value="assessment">
            <AssessmentTestSection user={user} recordSignal={recordSignal} recordMultipleSignals={recordMultipleSignals} />
          </TabsContent>

          {/* ===== Psychometric Test Tab (new 22-question test) ===== */}
          <TabsContent value="psychometric">
            <PsychometricTest
              userId={user!.id}
              onComplete={() => {
                if (discoveryDone) {
                  toast.success("Both assessments complete! All sections unlocked 🎉");
                }
              }}
              recordSignal={recordSignal}
            />
          </TabsContent>

          {/* ===== Interests Assessment Tab (4 modes: Career Cards, Story, Challenge, Visual) ===== */}
          <TabsContent value="explore" className="space-y-6">
            {!mode ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Heart size={20} className="text-terracotta" /> Interests Assessment</CardTitle>
                  <CardDescription>Pick any mode to explore your interests at your own comfort. You can switch modes anytime.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {MODES.map(m => (
                      <button key={m.id} onClick={() => startSession(m.id)} className="p-6 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group">
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
            ) : mode === "visual" ? (
              /* Visual Mode */
              <>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
                    <ArrowLeft size={14} className="mr-2" /> Change Mode
                  </Button>
                  <Badge variant="secondary">Visual Mode</Badge>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Pick the icons that resonate with you</CardTitle>
                    <CardDescription>Select as many as you like — trust your instincts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                      {VISUAL_ICONS.map(icon => {
                        const selected = visualSelections.includes(icon.id);
                        return (
                          <button
                            key={icon.id}
                            onClick={() => handleVisualToggle(icon.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${selected ? "border-primary bg-primary/10 scale-105 shadow-md" : "border-border hover:border-primary/50"}`}
                          >
                            <span className="text-3xl">{icon.emoji}</span>
                            <span className="font-body text-xs text-center">{icon.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    {visualSelections.length >= 3 && (
                      <div className="mt-6 text-center">
                        <Button onClick={finishVisualMode}>
                          Continue with {visualSelections.length} selections <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : mode === "story" ? (
              /* Story Mode — career story cards (95% of this section) */
              <>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
                    <ArrowLeft size={14} className="mr-2" /> Change Mode
                  </Button>
                  <Badge variant="secondary">Story Mode</Badge>
                </div>
                <StoryModeCards />
              </>
            ) : mode === "challenge" ? (
              /* Challenge Mode — real-world task cards */
              <>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
                    <ArrowLeft size={14} className="mr-2" /> Change Mode
                  </Button>
                  <Badge variant="secondary">Challenge Mode</Badge>
                </div>
                <ChallengeModeCards />
              </>
            ) : mode === "career-cards" ? (
              /* Career Cards Mode */
              <>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setMode(null)}>
                    <ArrowLeft size={14} className="mr-2" /> Change Mode
                  </Button>
                  <Badge variant="secondary">Career Cards</Badge>
                </div>
                <CareerCardDeck />
              </>
            ) : null}
          </TabsContent>



          {/* ===== Quests Tab ===== */}
          <TabsContent value="quests" className="space-y-6">
            <AnimatePresence mode="wait">
              {activeQuest ? (
                <motion.div key="active-quest" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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
                            <p className="font-display text-lg text-foreground mb-4">{activeQuest.prompts[currentPromptIndex].question}</p>
                            {activeQuest.prompts[currentPromptIndex].type === "open" && (
                              <Textarea placeholder="Share your thoughts..." value={questResponses[currentPromptIndex] || ""} onChange={e => handleQuestResponse(currentPromptIndex, e.target.value)} rows={4} />
                            )}
                            {activeQuest.prompts[currentPromptIndex].type === "choice" && (
                              <div className="space-y-2">
                                {activeQuest.prompts[currentPromptIndex].options?.map((opt: string) => (
                                  <button key={opt} onClick={() => handleQuestResponse(currentPromptIndex, opt)} className={`w-full p-3 rounded-lg border text-left transition-all ${questResponses[currentPromptIndex] === opt ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
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
                                    <button key={opt} onClick={() => {
                                      const current = questResponses[currentPromptIndex] || [];
                                      handleQuestResponse(currentPromptIndex, selected ? current.filter((o: string) => o !== opt) : [...current, opt]);
                                    }} className={`px-4 py-2 rounded-full border transition-all ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"}`}>
                                      <span className="font-body text-sm">{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setCurrentPromptIndex(Math.max(0, currentPromptIndex - 1))} disabled={currentPromptIndex === 0}>
                              <ArrowLeft size={14} className="mr-2" /> Back
                            </Button>
                            <Button onClick={() => {
                              if (currentPromptIndex < activeQuest.prompts.length - 1) { setCurrentPromptIndex(currentPromptIndex + 1); }
                              else { completeQuest(); }
                            }} disabled={!questResponses[currentPromptIndex]}>
                              {currentPromptIndex < activeQuest.prompts.length - 1 ? "Next" : "Complete"} <ArrowRight size={14} className="ml-2" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Check className="mx-auto text-success mb-3" size={48} />
                          <h3 className="font-display text-xl mb-2">Quest Complete!</h3>
                          <p className="font-body text-muted-foreground">You earned {activeQuest.points} points</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div key="quest-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-4">
                  {quests.length === 0 ? (
                    <Card className="col-span-2">
                      <CardContent className="pt-6 text-center py-12">
                        <Trophy className="mx-auto text-muted-foreground mb-4" size={48} />
                        <h3 className="font-display text-xl mb-2">No Quests Available Yet</h3>
                        <p className="font-body text-muted-foreground">Quests will appear as you progress through exploration.</p>
                      </CardContent>
                    </Card>
                  ) : quests.map((quest, i) => {
                    const status = getQuestStatus(quest.id);
                    const isCompleted = status === "completed";
                    return (
                      <motion.div key={quest.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className={isCompleted ? "border-success/30 bg-success/5" : ""}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3 mb-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${quest.quest_type === "story" ? "bg-info/10" : quest.quest_type === "challenge" ? "bg-warmth/10" : "bg-indigo/10"}`}>
                                {quest.quest_type === "story" ? <MessageSquare className="text-info" size={18} /> : quest.quest_type === "challenge" ? <Target className="text-warmth" size={18} /> : <Palette className="text-indigo" size={18} />}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-display text-lg text-foreground">{quest.title}</h3>
                                <p className="font-body text-sm text-muted-foreground">{quest.description}</p>
                              </div>
                              <Badge variant={isCompleted ? "default" : "secondary"}>{isCompleted ? "Done" : `${quest.points} pts`}</Badge>
                            </div>
                            {!isCompleted && (
                              <Button onClick={() => startQuest(quest)} className="w-full">
                                <Play size={14} className="mr-2" /> {status === "in_progress" ? "Continue" : "Start Quest"}
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

          {/* ===== Domains Tab ===== */}
          <TabsContent value="domains" className="space-y-6">
            {domains.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <Brain className="mx-auto text-muted-foreground mb-4" size={48} />
                  <h3 className="font-display text-xl mb-2">No Recommendations Yet</h3>
                  <p className="font-body text-muted-foreground mb-4">Like at least 3 career cards to get AI-powered domain recommendations</p>
                  <Button variant="outline" onClick={() => setTab("explore")}>Start Exploring <ArrowRight size={14} className="ml-2" /></Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {domains.map((domain, i) => (
                  <motion.div key={domain.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
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
                                  <p key={j} className="font-body text-xs text-muted-foreground flex items-center gap-2"><Check size={12} className="text-success" /> {reason}</p>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              {domain.status !== "saved" && (
                                <Button variant="outline" size="sm" onClick={() => saveDomain(domain.id)}><BookmarkPlus size={14} className="mr-2" /> Save</Button>
                              )}
                              <Button variant="ghost" size="sm">Explore More <ChevronRight size={14} className="ml-1" /></Button>
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

          {/* ===== Insights Tab ===== */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="text-primary" size={20} /> AI Insights</CardTitle>
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
                      <div key={i} className="flex items-start gap-3"><Lightbulb className="text-yellow-500 mt-0.5" size={16} /><p className="font-body text-sm">{insight}</p></div>
                    ))}
                    {aiInsights.strengths_detected && (
                      <div>
                        <h4 className="font-display text-sm mb-2">Strengths Detected</h4>
                        <div className="flex flex-wrap gap-2">{aiInsights.strengths_detected.map((s: string, i: number) => <Badge key={i} variant="secondary">{s}</Badge>)}</div>
                      </div>
                    )}
                    {aiInsights.encouragement && (
                      <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20"><p className="font-body text-sm text-green-700 dark:text-green-300">{aiInsights.encouragement}</p></div>
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
                    <p className="font-body text-muted-foreground mb-4">Complete explorations to unlock AI insights</p>
                    <Button variant="outline" onClick={getAIRecommendations} disabled={aiLoading || likedCount < 3}>{aiLoading ? "Analyzing..." : "Generate Insights"}</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interest Map */}
            <Card>
              <CardHeader><CardTitle>Your Interest Map</CardTitle></CardHeader>
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

            {/* Adaptive Prompts */}
            {adaptivePrompts && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Zap className="text-yellow-500" size={18} /> Suggested Prompts</CardTitle>
                  <CardDescription>AI-generated prompts based on your engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {adaptivePrompts.prompts?.map((p: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer">
                        <p className="font-body text-sm font-medium">{p.question}</p>
                        <p className="font-body text-xs text-muted-foreground mt-1">{p.why}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ===== Your Profile Tab — synthesized insights + reward trackers ===== */}
          <TabsContent value="profile" className="space-y-6">
            <InsightsView />
          </TabsContent>

          {/* ===== Behavior Tab ===== */}
          <TabsContent value="behavior" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="text-primary" size={20} /> Behavioral Insights</CardTitle>
                <CardDescription>Deeper self-awareness from your exploration patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {behaviorInsights ? (
                  <div className="space-y-6">
                    {/* Career Archetype */}
                    {behaviorInsights.career_archetype && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-center">
                        <p className="font-body text-xs text-muted-foreground mb-1">Your Career Archetype</p>
                        <p className="font-display text-2xl text-foreground">{behaviorInsights.career_archetype}</p>
                      </div>
                    )}

                    {/* Cognitive Style & Motivation */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {behaviorInsights.cognitive_style && (
                        <div className="p-4 rounded-lg border border-border">
                          <p className="font-body text-xs text-muted-foreground mb-1">Cognitive Style</p>
                          <p className="font-body text-sm font-medium">{behaviorInsights.cognitive_style}</p>
                        </div>
                      )}
                      {behaviorInsights.motivation_type && (
                        <div className="p-4 rounded-lg border border-border">
                          <p className="font-body text-xs text-muted-foreground mb-1">Motivation Type</p>
                          <p className="font-body text-sm font-medium">{behaviorInsights.motivation_type}</p>
                        </div>
                      )}
                    </div>

                    {/* Ideal Work Environment */}
                    {behaviorInsights.ideal_work_environment && (
                      <div className="p-4 rounded-lg border border-border">
                        <p className="font-body text-xs text-muted-foreground mb-1">Ideal Work Environment</p>
                        <p className="font-body text-sm">{behaviorInsights.ideal_work_environment}</p>
                      </div>
                    )}

                    {/* Behavioral Patterns */}
                    {behaviorInsights.behavioral_patterns?.length > 0 && (
                      <div>
                        <h4 className="font-display text-sm mb-3">Patterns Detected</h4>
                        <div className="space-y-3">
                          {behaviorInsights.behavioral_patterns.map((bp: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${bp.strength === "strong" ? "bg-success" : bp.strength === "moderate" ? "bg-accent" : "bg-primary"}`} />
                              <div>
                                <p className="font-body text-sm font-medium">{bp.pattern}</p>
                                <p className="font-body text-xs text-muted-foreground">{bp.interpretation}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Areas of Resonance & Blind Spots */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {behaviorInsights.areas_of_resonance?.length > 0 && (
                        <div>
                          <h4 className="font-display text-sm mb-2 flex items-center gap-2"><TrendingUp size={14} className="text-success" /> Areas of Resonance</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {behaviorInsights.areas_of_resonance.map((a: string, i: number) => <Badge key={i} variant="secondary">{a}</Badge>)}
                          </div>
                        </div>
                      )}
                      {behaviorInsights.blind_spots?.length > 0 && (
                        <div>
                          <h4 className="font-display text-sm mb-2 flex items-center gap-2"><Eye size={14} className="text-warmth" /> Blind Spots</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {behaviorInsights.blind_spots.map((b: string, i: number) => <Badge key={i} variant="outline">{b}</Badge>)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACTION BUTTONS: Generate Insights & Create AI Roadmaps */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                      <Button
                        onClick={() => { setTab("insights"); getAIRecommendations(); }}
                        variant="outline"
                        className="flex-1 gap-2"
                      >
                        <Sparkles size={16} /> Generate Insights
                      </Button>
                      <Button
                        onClick={async () => {
                          // Record behavior signals, then navigate to roadmap
                          if (behaviorInsights.areas_of_resonance) {
                            await recordMultipleSignals("curiosity_compass", behaviorInsights.areas_of_resonance, "domain_interest", 0.8);
                          }
                          if (behaviorInsights.career_archetype) {
                            await recordSignal("curiosity_compass", behaviorInsights.career_archetype, "preference", 0.9);
                          }
                          toast.success("Transferring insights to AI Roadmaps...");
                          navigate("/dashboard/roadmap?source=behavior_analysis");
                        }}
                        className="flex-1 gap-2"
                      >
                        <Route size={16} /> Create AI Roadmaps
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="mx-auto text-muted-foreground mb-3" size={40} />
                    <p className="font-body text-muted-foreground mb-4">Get a deep behavioral analysis based on your exploration patterns</p>
                    <Button onClick={getBehaviorInsights} disabled={aiLoading}>
                      {aiLoading ? "Analyzing..." : "Analyze My Behavior"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Persistent Action Buttons — always visible */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="text-primary" size={20} />
            <div>
              <h3 className="font-display text-base text-foreground">Ready to take action?</h3>
              <p className="font-body text-xs text-muted-foreground">Generate insights or create roadmaps from your exploration data at any time</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => { setTab("insights"); getAIRecommendations(); }}
              variant="outline"
              className="flex-1 gap-2"
              disabled={aiLoading}
            >
              <Sparkles size={16} /> {aiLoading ? "Analyzing..." : "Generate Insights"}
            </Button>
            <Button
              onClick={async () => {
                const signals = await getAggregatedSignals();
                if (signals.all && signals.all.length > 0) {
                  toast.success("Transferring all exploration data to AI Roadmaps...");
                } else {
                  toast.info("Starting roadmap creation...");
                }
                navigate("/dashboard/roadmap?source=curiosity_compass");
              }}
              className="flex-1 gap-2"
            >
              <Route size={16} /> Create AI Roadmaps
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CuriosityCompass;
