import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import Logo from "@/components/Logo";

interface OnboardingProgressBarProps {
  progress: number; // 0-100
  showRewardHint?: boolean;
  nextRewardAt?: number; // e.g. 30, 50, 70, 90
}

const MILESTONES = [30, 60, 90];

const OnboardingProgressBar = ({ progress, showRewardHint = true, nextRewardAt }: OnboardingProgressBarProps) => {
  const nextMilestone = nextRewardAt || MILESTONES.find((m) => m > progress) || 100;

  return (
    <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-2">
      <div className="flex items-center gap-2 sm:gap-3">
        <Logo to="/" size="xs" showWordmark={false} className="shrink-0" />
        <span className="text-xs text-muted-foreground font-body font-medium">{progress}%</span>
        <div className="flex-1 relative">
          <div className="h-2 rounded-full bg-[hsl(0,0%,88%)]">
            <motion.div
              className="h-full rounded-full bg-primary"
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
                  ? "bg-primary border-primary"
                  : "bg-background border-border"
              }`}
              style={{ left: `${m}%`, transform: "translate(-50%, -50%)" }}
            />
          ))}
        </div>
        {showRewardHint && progress < 90 && (
          <div className="flex items-center gap-1 text-xs text-accent font-body font-medium">
            <Gift size={14} />
            <span>{nextMilestone}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingProgressBar;
