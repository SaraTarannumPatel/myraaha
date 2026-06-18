import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";
import { useEffect, useState } from "react";
import OnboardingRewardCelebration from "./OnboardingRewardCelebration";
import { useAuth } from "@/contexts/AuthContext";

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

// Per-user storage key. Prevents cross-account bleed which was the root cause
// of "sometimes the reward fires, sometimes it doesn't".
const shownKey = (uid: string | undefined) =>
  `myraaha_shown_reward_celebrations__${uid || "guest"}`;

const getShown = (uid: string | undefined): string[] => {
  try {
    return JSON.parse(localStorage.getItem(shownKey(uid)) || "[]");
  } catch {
    return [];
  }
};

const markShown = (uid: string | undefined, rewardKey: string) => {
  const current = getShown(uid);
  if (!current.includes(rewardKey)) {
    localStorage.setItem(shownKey(uid), JSON.stringify([...current, rewardKey]));
  }
};

interface OnboardingRewardBannerProps {
  currentProgress: number;
  unlockedRewards?: string[];
  showCelebration?: boolean;
}

const OnboardingRewardBanner = ({
  currentProgress,
  unlockedRewards = [],
  showCelebration = true,
}: OnboardingRewardBannerProps) => {
  const { user } = useAuth();
  const uid = user?.id;
  const [dismissed, setDismissed] = useState(false);
  const [celebrationReward, setCelebrationReward] = useState<RewardMilestone | null>(null);

  // Deterministic trigger: every time progress crosses a milestone we pop the
  // celebration card unless this exact reward was already celebrated for this
  // user. The check is sync + idempotent so it never silently skips.
  useEffect(() => {
    if (!showCelebration) return;
    const shown = getShown(uid);
    const next = ONBOARDING_REWARDS.find(
      (r) => r.percent <= currentProgress && !shown.includes(r.rewardKey)
    );
    if (next) {
      // Mark synchronously to guarantee single-fire even with strict-mode double effects
      markShown(uid, next.rewardKey);
      const t = setTimeout(() => setCelebrationReward(next), 350);
      return () => clearTimeout(t);
    }
  }, [currentProgress, showCelebration, uid]);

  const handleCelebrationContinue = () => setCelebrationReward(null);

  const nextReward = ONBOARDING_REWARDS.find(
    (r) => r.percent > currentProgress && !unlockedRewards.includes(r.rewardKey)
  );
  const justUnlocked = ONBOARDING_REWARDS.find(
    (r) => r.percent <= currentProgress && !unlockedRewards.includes(r.rewardKey)
  );

  if (dismissed || !(justUnlocked || nextReward)) {
    return celebrationReward ? (
      <OnboardingRewardCelebration
        emoji={celebrationReward.emoji}
        title={celebrationReward.title}
        description={celebrationReward.description}
        onContinue={handleCelebrationContinue}
      />
    ) : null;
  }

  const displayReward = justUnlocked || nextReward;
  const isUnlocked = !!justUnlocked;

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

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mx-4 sm:mx-6 mt-3 p-3.5 rounded-xl border border-gray-200 bg-[#f9fafb] shadow-sm flex items-start gap-3"
        >
          <div className="text-xl shrink-0 mt-0.5">{displayReward!.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Gift size={14} className="text-primary shrink-0" />
              <span className="font-display text-xs font-bold text-primary uppercase tracking-wider">
                {isUnlocked ? "Reward Unlocked!" : `Unlock at ${displayReward!.percent}%`}
              </span>
            </div>
            <p className="font-display text-sm font-semibold text-foreground mt-1">
              {displayReward!.title}
            </p>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              {displayReward!.description}
            </p>
          </div>
          <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground shrink-0 ml-1" aria-label="Dismiss">
            <X size={16} />
          </button>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default OnboardingRewardBanner;

