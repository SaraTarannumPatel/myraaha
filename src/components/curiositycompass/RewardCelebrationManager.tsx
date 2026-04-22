import { useEffect, useState } from "react";
import OnboardingRewardCelebration from "@/components/onboarding/OnboardingRewardCelebration";
import { useAssessmentRewards } from "@/hooks/useAssessmentRewards";

/**
 * Globally listens for newly unlocked rewards and pops the celebration card
 * one-by-one until all pending unlocks are acknowledged.
 */
const RewardCelebrationManager = () => {
  const { pendingUnlocks, acknowledgeUnlock } = useAssessmentRewards();
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());

  // Show the latest unacknowledged unlock that we haven't already shown locally
  const next = pendingUnlocks.find((u) => !shownIds.has(u.id));

  useEffect(() => {
    if (next) setShownIds((s) => new Set(s).add(next.id));
  }, [next]);

  if (!next) return null;

  return (
    <OnboardingRewardCelebration
      emoji={next.reward_emoji || "🎁"}
      title={next.title}
      description={next.description || "A new reward is now active in your account."}
      onContinue={() => acknowledgeUnlock(next.id)}
    />
  );
};

export default RewardCelebrationManager;
