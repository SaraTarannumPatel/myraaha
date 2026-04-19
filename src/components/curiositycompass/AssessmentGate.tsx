import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle2, Brain, Compass, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AssessmentGateProps {
  onGoToAssessment: (tab: string) => void;
}

const AssessmentGate = ({ onGoToAssessment }: AssessmentGateProps) => {
  const { profile } = useAuth();
  const discoveryDone = !!profile?.journey_responses?.assessment_completed;
  const psychometricDone = !!profile?.journey_responses?.psychometric_completed;

  if (discoveryDone && psychometricDone) return null;

  return (
    <Card className="border-[hsl(48 92% 82%)]/40 bg-gradient-to-br from-[hsl(48 92% 88%)] to-[hsl(48 92% 90%)]">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-3">
          <Lock size={20} className="text-primary" />
          <h3 className="font-display text-lg text-foreground">Complete Both Assessments to Unlock</h3>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          Explore, Quests, Domains, Insights, and Behavior tabs are locked until you complete both assessments. These assessments calibrate your entire experience.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
            {discoveryDone ? (
              <CheckCircle2 size={20} className="text-primary shrink-0" />
            ) : (
              <Compass size={20} className="text-muted-foreground shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-body text-sm font-medium">Discover Yourself Deeply</p>
              <p className="font-body text-xs text-muted-foreground">Interest discovery assessment</p>
            </div>
            {discoveryDone ? (
              <Badge variant="secondary">Done</Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onGoToAssessment("discovery")}>
                Start <ArrowRight size={14} />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
            {psychometricDone ? (
              <CheckCircle2 size={20} className="text-primary shrink-0" />
            ) : (
              <Brain size={20} className="text-muted-foreground shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-body text-sm font-medium">Find Out How You Function</p>
              <p className="font-body text-xs text-muted-foreground">Psychometric assessment</p>
            </div>
            {psychometricDone ? (
              <Badge variant="secondary">Done</Badge>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onGoToAssessment("psychometric")}>
                Start <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentGate;
