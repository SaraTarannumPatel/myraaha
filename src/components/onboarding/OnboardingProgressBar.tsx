import { motion } from "framer-motion";
import { Gift } from "lucide-react";

interface OnboardingProgressBarProps {
  progress: number; // 0-100
  showRewardHint?: boolean;
  nextRewardAt?: number; // e.g. 30, 50, 70, 90
}

const MILESTONES = [30, 60, 90];

const OnboardingProgressBar = ({ progress, showRewardHint = true, nextRewardAt }: OnboardingProgressBarProps) => {
  const nextMilestone = nextRewardAt || MILESTONES.find((m) => m > progress) || 100;

  return (
    <div className="px-6 pt-5 pb-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center">
          <span className="font-display text-xl font-bold text-[hsl(270 96% 30%)]">M</span>
        </div>
        <span className="text-xs text-muted-foreground font-body font-medium">{progress}%</span>
        <div className="flex-1 relative">
          <div className="h-2 rounded-full bg-[hsl(0,0%,88%)]">
            <motion.div
              className="h-full rounded-full bg-[hsl(270 96% 48%)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          {/* Milestone dots */}
          {MILESTONES.map((m) => (
            <div
              key={m}
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-colors ${
                progress >= m
                  ? "bg-[hsl(270 96% 48%)] border-[hsl(270 96% 48%)]"
                  : "bg-[hsl(0 0% 100%)] border-[hsl(0,0%,78%)]"
              }`}
              style={{ left: `${m}%`, transform: "translate(-50%, -50%)" }}
            />
          ))}
        </div>
        {showRewardHint && progress < 90 && (
          <div className="flex items-center gap-1 text-xs text-[hsl(48 80% 45%)] font-body font-medium">
            <Gift size={14} />
            <span>{nextMilestone}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingProgressBar;
