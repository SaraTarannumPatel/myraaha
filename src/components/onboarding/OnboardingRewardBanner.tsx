import { motion, AnimatePresence } from "framer-motion";
import { Gift, Star, X } from "lucide-react";
import { useState } from "react";

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

interface OnboardingRewardBannerProps {
  currentProgress: number;
  unlockedRewards?: string[];
}

const OnboardingRewardBanner = ({ currentProgress, unlockedRewards = [] }: OnboardingRewardBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  const nextReward = ONBOARDING_REWARDS.find(
    (r) => r.percent > currentProgress && !unlockedRewards.includes(r.rewardKey)
  );

  const justUnlocked = ONBOARDING_REWARDS.find(
    (r) => r.percent <= currentProgress && !unlockedRewards.includes(r.rewardKey)
  );

  if (dismissed || (!nextReward && !justUnlocked)) return null;

  if (justUnlocked) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="mx-6 mt-2 p-4 rounded-xl bg-gradient-to-r from-[hsl(45,80%,75%)] to-[hsl(45,90%,85%)] border border-[hsl(45,70%,65%)]"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">{justUnlocked.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Star size={14} className="text-[hsl(45,80%,40%)]" />
                <span className="font-display text-sm font-bold text-[hsl(230,40%,25%)]">
                  Reward Unlocked!
                </span>
              </div>
              <p className="font-display text-base font-bold text-[hsl(230,40%,25%)] mt-1">
                {justUnlocked.title}
              </p>
              <p className="font-body text-xs text-[hsl(230,30%,35%)] mt-0.5">
                {justUnlocked.description}
              </p>
            </div>
            <button onClick={() => setDismissed(true)} className="text-[hsl(230,30%,45%)]">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Show upcoming reward hint
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-6 mt-2 p-3 rounded-xl bg-[hsl(45,80%,92%)] border border-[hsl(45,60%,82%)]"
    >
      <div className="flex items-center gap-3">
        <Gift size={16} className="text-[hsl(45,70%,45%)] shrink-0" />
        <p className="font-body text-xs text-[hsl(230,30%,35%)]">
          <span className="font-semibold">Complete {nextReward!.percent}%</span> to unlock:{" "}
          <span className="font-medium">{nextReward!.emoji} {nextReward!.title}</span>
        </p>
      </div>
    </motion.div>
  );
};

export default OnboardingRewardBanner;
