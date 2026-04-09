import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Zap, Compass
} from "lucide-react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";
import {
  getVariantQuestions,
  detectVariant,
  getJourneyId,
  getJourneyQuestions,
  journeyMetas,
  type VariantQuestion,
  type JourneyQuestion,
} from "./journeys/journeyData";

type Phase = "variant" | "journey" | "result";

const JourneyDiscovery = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const userType = profile?.user_type || "school";

  // Variant detection state
  const variantQs = useMemo(() => getVariantQuestions(userType), [userType]);
  const [variantAnswers, setVariantAnswers] = useState<Record<string, string>>({});
  const [variantStep, setVariantStep] = useState(0);

  // Journey state
  const [phase, setPhase] = useState<Phase>("variant");
  const [variant, setVariant] = useState<"U" | "R">("U");
  const [journeyId, setJourneyId] = useState("J1");
  const [journeyStep, setJourneyStep] = useState(0);
  const [journeyAnswers, setJourneyAnswers] = useState<Record<string, string | string[]>>({});

  const journeyQs = useMemo(() => getJourneyQuestions(journeyId), [journeyId]);
  const meta = journeyMetas[journeyId];

  // ===== VARIANT PHASE =====
  const currentVariantQ = variantQs[variantStep];
  const variantCanNext = currentVariantQ ? !!variantAnswers[currentVariantQ.id] : false;

  const handleVariantSelect = (qId: string, value: string) => {
    setVariantAnswers({ ...variantAnswers, [qId]: value });
  };

  const handleVariantNext = () => {
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

  const handleVariantBack = () => {
    if (variantStep > 0) setVariantStep(variantStep - 1);
    else navigate("/onboarding/user-type");
  };

  // ===== JOURNEY PHASE =====
  const currentJourneyQ = journeyQs[journeyStep];
  const journeyCanNext = currentJourneyQ
    ? currentJourneyQ.type === "single"
      ? !!journeyAnswers[currentJourneyQ.id]
      : Array.isArray(journeyAnswers[currentJourneyQ.id]) && (journeyAnswers[currentJourneyQ.id] as string[]).length > 0
    : false;

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
    if (journeyStep < journeyQs.length - 1) {
      setJourneyStep(journeyStep + 1);
    } else {
      setPhase("result");
    }
  };

  const handleJourneyBack = () => {
    if (journeyStep > 0) setJourneyStep(journeyStep - 1);
    else setPhase("variant");
  };

  // ===== RESULT / CONTINUE =====
  const handleContinue = async () => {
    await updateProfile({
      journey_variant: `${journeyId}_${variant}`,
      journey_responses: {
        variant_answers: variantAnswers,
        journey_answers: journeyAnswers,
        journey_id: journeyId,
        variant,
        user_type: userType,
      },
      onboarding_status: "intent" as any,
    } as any);
    navigate("/onboarding/intent");
  };

  // ===== PROGRESS =====
  const totalSteps = variantQs.length + journeyQs.length;
  const currentTotal =
    phase === "variant" ? variantStep :
    phase === "journey" ? variantQs.length + journeyStep :
    totalSteps;

  return (
    <div className="min-h-screen bg-[hsl(60,14%,98%)] flex flex-col">
      <OnboardingProgressBar progress={30} />
      <OnboardingRewardBanner currentProgress={30} />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-6"
      >
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-body text-xs text-muted-foreground">
              {phase === "variant" ? "getting to know you" : phase === "journey" ? meta?.title : "all done!"}
            </span>
            <span className="font-body text-xs text-muted-foreground">
              {Math.round((currentTotal / totalSteps) * 100)}%
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= currentTotal ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ===== VARIANT DETECTION ===== */}
          {phase === "variant" && currentVariantQ && (
            <motion.div
              key={`variant-${variantStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-body text-xs font-semibold">
                  <Zap size={12} /> vibe check
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-foreground">
                  {currentVariantQ.question}
                </h1>
              </div>

              <div className="grid gap-3">
                {currentVariantQ.options.map((opt, i) => {
                  const isSelected = variantAnswers[currentVariantQ.id] === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleVariantSelect(currentVariantQ.id, opt.value)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all font-body text-sm ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground font-semibold shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} className="inline mr-2 text-primary" />}
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={handleVariantBack} className="font-body">
                  <ArrowLeft size={18} /> back
                </Button>
                <Button
                  onClick={handleVariantNext}
                  disabled={!variantCanNext}
                  className="gradient-warm text-primary-foreground rounded-full px-8 font-body font-semibold shadow-accent disabled:opacity-50"
                >
                  next <ArrowRight size={18} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ===== JOURNEY QUESTIONS ===== */}
          {phase === "journey" && currentJourneyQ && (
            <motion.div
              key={`journey-${journeyStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-foreground font-body text-xs font-semibold">
                  <Compass size={12} /> {meta?.title}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-foreground">
                  {currentJourneyQ.question}
                </h1>
                {currentJourneyQ.type === "multi" && (
                  <p className="font-body text-xs text-muted-foreground">
                    pick {currentJourneyQ.maxSelect ? `up to ${currentJourneyQ.maxSelect}` : "as many as you want"} ✨
                  </p>
                )}
              </div>

              <div className={`${
                currentJourneyQ.options.length > 4
                  ? "flex flex-wrap gap-2.5 justify-center"
                  : "grid gap-3"
              }`}>
                {currentJourneyQ.options.map((opt, i) => {
                  const isMulti = currentJourneyQ.type === "multi";
                  const isSelected = isMulti
                    ? ((journeyAnswers[currentJourneyQ.id] as string[]) || []).includes(opt.value)
                    : journeyAnswers[currentJourneyQ.id] === opt.value;

                  return (
                    <motion.button
                      key={opt.value}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleJourneySelect(currentJourneyQ.id, opt.value, currentJourneyQ.type, currentJourneyQ.maxSelect)}
                      className={`${
                        currentJourneyQ.options.length > 4
                          ? "px-4 py-2.5 rounded-xl"
                          : "w-full text-left p-4 rounded-xl"
                      } border-2 transition-all font-body text-sm ${
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground font-semibold shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} className="inline mr-1.5 text-primary" />}
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>

              {currentJourneyQ.type === "multi" && (
                <p className="text-center font-body text-xs text-muted-foreground">
                  {((journeyAnswers[currentJourneyQ.id] as string[]) || []).length} selected
                </p>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={handleJourneyBack} className="font-body">
                  <ArrowLeft size={18} /> back
                </Button>
                <Button
                  onClick={handleJourneyNext}
                  disabled={!journeyCanNext}
                  className="gradient-warm text-primary-foreground rounded-full px-8 font-body font-semibold shadow-accent disabled:opacity-50"
                >
                  {journeyStep === journeyQs.length - 1 ? "see results" : "next"} <ArrowRight size={18} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ===== RESULT SCREEN ===== */}
          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 text-center"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, delay: 0.2 }}
                  className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-4xl"
                >
                  {meta?.emoji}
                </motion.div>
                <h1 className="font-display text-3xl sm:text-4xl text-foreground">
                  {meta?.outputMessage}
                </h1>
                <p className="font-body text-muted-foreground max-w-md mx-auto">
                  we've mapped your curiosity signals and behavioral patterns. your MyRaaha experience is now being personalized just for you.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                {[
                  { label: "signals mapped", value: Object.keys(journeyAnswers).length, icon: "🧭" },
                  { label: "your journey", value: journeyId, icon: meta?.emoji || "✨" },
                  { label: "curiosity score", value: "high", icon: "🔥" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="bg-card border border-border rounded-xl p-3 space-y-1"
                  >
                    <span className="text-xl">{stat.icon}</span>
                    <p className="font-display text-lg text-foreground">{stat.value}</p>
                    <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <Button
                  onClick={handleContinue}
                  className="gradient-warm text-primary-foreground rounded-full px-10 font-body font-semibold shadow-accent text-base"
                >
                  <Sparkles size={18} /> let's go <ArrowRight size={18} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </div>
    </div>
  );
};

export default JourneyDiscovery;
