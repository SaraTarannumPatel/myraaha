import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, PartyPopper, Gift, Star } from "lucide-react";

const CELEBRATION_KEY = "myraaha_cc_celebration_shown";

interface OnboardingCelebrationProps {
  onDismiss: () => void;
}

const OnboardingCelebration = ({ onDismiss }: OnboardingCelebrationProps) => {
  const { profile } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const alreadyShown = localStorage.getItem(CELEBRATION_KEY);
    if (alreadyShown) return;

    // Check if fully completed onboarding (no skipped steps)
    const fullyCompleted =
      profile.onboarding_status === "complete" &&
      !!profile.user_type &&
      !!profile.journey_variant &&
      !!profile.active_intent &&
      (profile.consent_data_usage || profile.consent_mentor_sharing);

    if (fullyCompleted) {
      setShow(true);
      localStorage.setItem(CELEBRATION_KEY, "true");
    }
  }, [profile]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="bg-card rounded-3xl border border-border shadow-2xl p-8 max-w-md mx-6 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(48 92% 88%)] to-transparent opacity-60 pointer-events-none" />
          <div className="relative z-10 space-y-5">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl"
            >
              🎉
            </motion.div>
            <div className="flex items-center justify-center gap-2 text-[hsl(48 80% 45%)]">
              <PartyPopper size={16} />
              <span className="font-body text-xs uppercase tracking-wider font-bold">Congratulations!</span>
              <PartyPopper size={16} />
            </div>
            <h2 className="font-display text-2xl text-foreground">Onboarding Complete!</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              You've unlocked <strong>both assessments for free</strong> — worth ₹5,000–10,000 combined! These will deeply calibrate your entire MyRaaha experience.
            </p>
            <div className="flex items-center justify-center gap-6 py-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Star size={24} className="text-primary" />
                </div>
                <span className="font-body text-xs text-muted-foreground">Discovery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Gift size={24} className="text-accent-foreground" />
                </div>
                <span className="font-body text-xs text-muted-foreground">Psychometric</span>
              </div>
            </div>
            <Button
              onClick={() => { setShow(false); onDismiss(); }}
              className="bg-[hsl(270 96% 30%)] text-[hsl(48 92% 72%)] rounded-full px-8 font-body font-semibold"
            >
              Start Assessments <ArrowRight size={16} />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingCelebration;
