import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle2, Sparkles } from "lucide-react";
import { useAssessmentRewards, type TestType } from "@/hooks/useAssessmentRewards";

interface Props {
  testType: TestType;
  title: string;
  subtitle?: string;
}

const RewardProgressTracker = ({ testType, title, subtitle }: Props) => {
  const { progress, milestonesForTest, loading } = useAssessmentRewards();
  const p = progress[testType];
  const ms = milestonesForTest(testType);
  const pct = p?.progress_percentage ?? 0;
  const reached = p?.highest_milestone_reached ?? 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <CardTitle className="font-display text-base flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          {title}
        </CardTitle>
        {subtitle && <p className="font-body text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-body">
            <span className="text-muted-foreground">Your progress</span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {ms.map((m) => {
            const unlocked = reached >= m.milestone_percent;
            return (
              <motion.div
                key={m.milestone_key}
                initial={false}
                animate={{ scale: unlocked ? 1 : 0.97, opacity: loading ? 0.5 : 1 }}
                className={`relative rounded-xl border p-2.5 sm:p-3 transition-all ${
                  unlocked
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant={unlocked ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                    {m.milestone_percent}%
                  </Badge>
                  {unlocked ? (
                    <CheckCircle2 size={14} className="text-primary" />
                  ) : (
                    <Lock size={12} className="text-muted-foreground" />
                  )}
                </div>
                <div className="text-lg sm:text-xl">{m.reward_emoji}</div>
                <p className="font-body text-[10px] sm:text-[11px] font-medium leading-tight mt-1 line-clamp-2">
                  {m.title}
                </p>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardProgressTracker;
