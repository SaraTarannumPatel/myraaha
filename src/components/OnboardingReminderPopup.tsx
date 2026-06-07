import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, User, Compass, FileText, Shield, Sparkles, Zap } from "lucide-react";

interface SkippedStep {
  key: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  route: string;
  checkFn: (profile: any) => boolean;
}

const onboardingSteps: SkippedStep[] = [
  {
    key: "user_type",
    title: "Tell us about yourself",
    description: "Knowing your background helps us personalize your experience — student, professional, or entrepreneur?",
    icon: User,
    color: "text-blue",
    bgColor: "bg-blue/10",
    route: "/onboarding/user-type",
    checkFn: (p) => !p.user_type,
  },
  {
    key: "journey_discovery",
    title: "Take the vibe check ⚡",
    description: "A quick journey to understand your curiosity, energy, and style — so we can personalize everything for you.",
    icon: Zap,
    color: "text-terracotta",
    bgColor: "bg-terracotta/10",
    route: "/onboarding/journey",
    checkFn: (p) => !p.journey_variant && !!p.user_type,
  },
  {
    key: "intent",
    title: "What's your focus?",
    description: "Career growth, entrepreneurship, or both? This shapes your entire dashboard experience.",
    icon: Compass,
    color: "text-terracotta",
    bgColor: "bg-terracotta/10",
    route: "/onboarding/intent",
    checkFn: (p) => !p.active_intent,
  },
  {
    key: "consent",
    title: "Privacy preferences",
    description: "Control how MyRaaha uses your data for personalization and mentor matching.",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
    route: "/onboarding/consent",
    // Only flag consent if the user has NEVER touched the consent step.
    // consent fields default to false; treat null/undefined as "not seen".
    checkFn: (p) =>
      p.consent_data_usage == null &&
      p.consent_mentor_sharing == null &&
      p.consent_community_visibility == null,
  },
];

// Storage key to track dismissed popups and cooldowns
const DISMISSED_KEY = "myraaha_onboarding_dismissed";
const LAST_SHOWN_KEY = "myraaha_onboarding_last_shown";
const COOLDOWN_MS = 1000 * 60 * 60; // 1 hour between popups

const OnboardingReminderPopup = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SkippedStep | null>(null);
  const [visible, setVisible] = useState(false);

  const getSkippedSteps = useCallback(() => {
    if (!profile || profile.onboarding_status !== "complete") return [];

    // Truly complete = has all primary onboarding fields. If yes, never show popup.
    const hasUserType = !!profile.user_type;
    const hasJourney = !!profile.journey_variant;
    const hasIntent = !!profile.active_intent;
    const hasTouchedConsent =
      profile.consent_data_usage != null ||
      profile.consent_mentor_sharing != null ||
      profile.consent_community_visibility != null;
    if (hasUserType && hasJourney && hasIntent && hasTouchedConsent) return [];

    const dismissed: string[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
    return onboardingSteps.filter(
      (step) => step.checkFn(profile) && !dismissed.includes(step.key)
    );
  }, [profile]);

  useEffect(() => {
    if (!profile || profile.onboarding_status !== "complete") return;

    // Check cooldown
    const lastShown = localStorage.getItem(LAST_SHOWN_KEY);
    if (lastShown && Date.now() - parseInt(lastShown) < COOLDOWN_MS) return;

    const skipped = getSkippedSteps();
    if (skipped.length === 0) return;

    // Show the first skipped step after a delay
    const timer = setTimeout(() => {
      setCurrentStep(skipped[0]);
      setVisible(true);
      localStorage.setItem(LAST_SHOWN_KEY, Date.now().toString());
    }, 3000);

    return () => clearTimeout(timer);
  }, [profile, getSkippedSteps]);

  const handleDismiss = () => {
    if (currentStep) {
      const dismissed: string[] = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
      dismissed.push(currentStep.key);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
    }
    setVisible(false);
    setCurrentStep(null);
  };

  const handleLater = () => {
    setVisible(false);
    setCurrentStep(null);
  };

  const handleAction = () => {
    if (currentStep) {
      navigate(currentStep.route, { state: { fromReminder: true } });
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && currentStep && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={handleLater}
          />
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-[400px] z-50"
          >
            <div className="bg-card rounded-2xl border border-border shadow-lg p-6 relative">
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Dismiss permanently"
              >
                <X size={16} />
              </button>

              {/* Icon + badge */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${currentStep.bgColor} flex items-center justify-center`}>
                  <currentStep.icon size={20} className={currentStep.color} />
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-accent" />
                  <span className="font-body text-[10px] uppercase tracking-wider text-accent font-semibold">Complete your setup</span>
                </div>
              </div>

              <h3 className="font-display text-xl text-foreground mb-2">{currentStep.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-5">
                {currentStep.description}
              </p>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAction}
                  size="sm"
                  className="gradient-warm text-primary-foreground rounded-full px-5 font-body font-semibold"
                >
                  Complete Now <ArrowRight size={14} />
                </Button>
                <Button
                  onClick={handleLater}
                  variant="ghost"
                  size="sm"
                  className="font-body text-muted-foreground"
                >
                  Later
                </Button>
              </div>

              {/* Progress indicator */}
              <div className="flex gap-1.5 mt-4">
                {onboardingSteps.map((step) => {
                  const isSkipped = profile ? step.checkFn(profile) : false;
                  const isCurrent = step.key === currentStep.key;
                  return (
                    <div
                      key={step.key}
                      className={`h-1 flex-1 rounded-full ${
                        !isSkipped ? "bg-accent" : isCurrent ? "bg-terracotta" : "bg-border"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingReminderPopup;
