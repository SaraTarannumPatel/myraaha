import { motion, AnimatePresence } from "framer-motion";
import { Gift, Star, X } from "lucide-react";
import { useState, useEffect } from "react";
import OnboardingRewardCelebration from "./OnboardingRewardCelebration";

export interface RewardMilestone {
  percent: number;
  rewardKey: string;
  title: string;
  description: string;
  emoji: string;
}

export const ONBOARDING_REWARDS: RewardMilestone[] = [
  {
    percent: 30,
    rewardKey: "free_discovery_test",
    title: "Free Discovery Test",
    emoji: "🔍",
    description: "Unlock the full Discovery Test (worth ₹2,999) for free!",
  },
  {
    percent: 60,
    rewardKey: "free_psychometric_test",
    title: "Free Psychometric Test",
    emoji: "🧭",
    description: "Unlock the full Psychometric Assessment (worth ₹2,999) for free!",
  },
  {
    percent: 90,
    rewardKey: "free_interests_assessment",
    title: "Free Interests Assessment",
    emoji: "🎯",
    description: "Unlock the full Interests Assessment Test (worth ₹2,999) for free!",
  },
];

const SHOWN_KEY = "myraaha_shown_reward_celebrations";

const getShown = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SHOWN_KEY) || "[]");
  } catch {
    return [];
  }
};

const markShown = (rewardKey: string) => {
  const current = getShown();
  if (!current.includes(rewardKey)) {
    localStorage.setItem(SHOWN_KEY, JSON.stringify([...current, rewardKey]));
  }
};

interface OnboardingRewardBannerProps {
  currentProgress: number;
  unlockedRewards?: string[];
  /** When false, suppresses the auto-celebration popup (e.g., on the final consent step which manages its own popup). */
  showCelebration?: boolean;
}

const OnboardingRewardBanner = ({
  currentProgress,
  unlockedRewards = [],
  showCelebration = true,
}: OnboardingRewardBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const [celebrationReward, setCelebrationReward] = useState<RewardMilestone | null>(null);

  // Auto-trigger celebration popup ONCE per reward across the entire onboarding journey
  useEffect(() => {
    if (!showCelebration) return;
    const shown = getShown();
    const newlyUnlocked = ONBOARDING_REWARDS.find(
      (r) => r.percent <= currentProgress && !shown.includes(r.rewardKey)
    );
    if (newlyUnlocked) {
      // Small delay so the page can settle first
      const timer = setTimeout(() => setCelebrationReward(newlyUnlocked), 400);
      return () => clearTimeout(timer);
    }
  }, [currentProgress, showCelebration]);

  const handleCelebrationContinue = () => {
    if (celebrationReward) markShown(celebrationReward.rewardKey);
    setCelebrationReward(null);
  };

  const nextReward = ONBOARDING_REWARDS.find(
    (r) => r.percent > currentProgress && !unlockedRewards.includes(r.rewardKey)
  );

  const justUnlocked = ONBOARDING_REWARDS.find(
    (r) => r.percent <= currentProgress && !unlockedRewards.includes(r.rewardKey)
  );

  return (
    <>
      {celebrationReward && (
        <OnboardingRewardCelebration
          emoji={celebrationReward.emoji}
          title={celebrationReward.title}
          description={celebrationReward.description}
          onContinue={handleCelebrationContinue}
        />
      )}

      {!dismissed && (justUnlocked || nextReward) && (
        justUnlocked ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-4 sm:mx-6 mt-2 p-4 rounded-xl bg-gradient-to-r from-[hsl(48_92%_88%)] to-[hsl(48_92%_88%)] border border-[hsl(48_92%_82%)]"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{justUnlocked.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-accent" />
                    <span className="font-display text-sm font-bold text-primary">Reward Unlocked!</span>
                  </div>
                  <p className="font-display text-base font-bold text-primary mt-1">{justUnlocked.title}</p>
                  <p className="font-body text-xs text-primary/80 mt-0.5">{justUnlocked.description}</p>
                </div>
                <button onClick={() => setDismissed(true)} className="text-primary/70" aria-label="Dismiss">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-4 sm:mx-6 mt-2 p-3 rounded-xl bg-accent/40 border border-[hsl(48_92%_90%)]"
          >
            <div className="flex items-center gap-3">
              <Gift size={16} className="text-accent shrink-0" />
              <p className="font-body text-xs text-primary/80">
                <span className="font-semibold">Complete {nextReward!.percent}%</span> to unlock:{" "}
                <span className="font-medium">{nextReward!.emoji} {nextReward!.title}</span>
              </p>
            </div>
          </motion.div>
        )
      )}
    </>
  );
};

export default OnboardingRewardBanner;
