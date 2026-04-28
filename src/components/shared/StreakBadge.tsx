import { useEffect } from "react";
import { Flame } from "lucide-react";
import { useStreak } from "@/hooks/useStreak";

interface Props {
  /** When true, automatically pings the streak on mount. */
  autoPing?: boolean;
  className?: string;
}

const StreakBadge = ({ autoPing = true, className = "" }: Props) => {
  const { streak, ping } = useStreak("daily_login");

  useEffect(() => {
    if (autoPing) ping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPing]);

  const days = streak.current_streak || 0;
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-warmth/10 border border-warmth/30 ${className}`}
      title={`Longest streak: ${streak.longest_streak} days`}
      aria-label={`Current streak ${days} days`}
    >
      <Flame size={14} className="text-warmth" />
      <span className="font-display text-xs text-foreground">
        {days} {days === 1 ? "day" : "days"}
      </span>
    </div>
  );
};

export default StreakBadge;
