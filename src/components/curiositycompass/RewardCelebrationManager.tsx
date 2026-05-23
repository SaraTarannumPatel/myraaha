import OnboardingRewardCelebration from "@/components/onboarding/OnboardingRewardCelebration";
import { useAssessmentRewards } from "@/hooks/useAssessmentRewards";

/**
 * Globally listens for newly unlocked rewards and pops the celebration card
 * one-by-one until all pending unlocks are acknowledged.
 */
const RewardCelebrationManager = () => {
  const { pendingUnlocks, acknowledgeUnlock } = useAssessmentRewards();

  // Keep showing the oldest unacknowledged reward until the user taps Continue.
  const next = [...pendingUnlocks].sort(
    (a, b) => new Date(a.unlocked_at).getTime() - new Date(b.unlocked_at).getTime()
  )[0];

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
