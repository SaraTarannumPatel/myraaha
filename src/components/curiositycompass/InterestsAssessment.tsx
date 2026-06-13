import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, CheckCircle2, Heart, Check } from "lucide-react";
import { toast } from "sonner";
import { useAssessmentRewards } from "@/hooks/useAssessmentRewards";
import { buildInterestsSignal, INTERESTS_QUESTIONS, type InterestsQuestion } from "@/lib/assessmentSignalMap";

interface Props {
  userId: string;
  onComplete: () => void;
  recordSignal: (source: string, value: string, type: string, strength: number, meta?: any) => Promise<void>;
}

const InterestsAssessment = ({ userId, onComplete, recordSignal }: Props) => {
  const { profile, updateProfile } = useAuth();
  const { updateProgress } = useAssessmentRewards();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; label: string }>>({});
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.journey_responses?.interests_completed) setCompleted(true);
  }, [profile]);

  const current = INTERESTS_QUESTIONS[step];
  const total = INTERESTS_QUESTIONS.length;
  const completedCount = Object.keys(answers).length;
  const progress = (completedCount / total) * 100;

  const persistQuestionSignal = async (q: InterestsQuestion, value: string, label: string) => {
    const sig = buildInterestsSignal(q.id, label);
    await Promise.all([
      supabase.from("interests_assessment_responses" as any).insert({
        user_id: userId,
        question_id: q.id,
        question_text: q.question,
        answer_value: value,
        answer_label: label,
        construct: q.construct,
      }),
      supabase.from("assessment_question_signals" as any).insert({
        user_id: userId,
        test_type: "interests",
        question_id: q.id,
        question_text: q.question,
        answer_value: value,
        answer_label: label,
        target_modules: sig.target_modules,
        signal_tags: sig.signal_tags,
        weight: 0.85,
      }),
      recordSignal("interests_assessment", label, "interest_trait", 0.85, {
        question_id: q.id,
        construct: q.construct,
        target_modules: sig.target_modules,
      }),
    ]);
  };

  const handleSelect = async (opt: { value: string; label: string }) => {
    setAnswers((prev) => {
      const next = { ...prev, [current.id]: opt };
      persistQuestionSignal(current, opt.value, opt.label);
      updateProgress("interests", Object.keys(next).length, total);
      return next;
    });
  };

  const handleNext = () => {
    if (step < total - 1) setStep(step + 1);
    else handleComplete();
  };

  const handleComplete = async () => {
    setSaving(true);
    await updateProfile({
      journey_responses: {
        ...profile?.journey_responses,
        interests_completed: true,
        interests_answers: answers,
        interests_completed_at: new Date().toISOString(),
      },
    } as any);
    await updateProgress("interests", total, total);
    try {
      await supabase.functions.invoke("assessment-synthesizer", { body: { test_type: "interests" } });
      await supabase.functions.invoke("assessment-synthesizer", { body: { test_type: "combined" } });
      const { runUserPersonalization } = await import("@/lib/personalizationPipeline");
      runUserPersonalization(userId, { force: true }).catch(() => {});
    } catch (e) {
      console.warn("Synthesis failed", e);
    }
    setCompleted(true);
    setSaving(false);
    toast.success("Holistic interests mapped! Your profile is now fully calibrated 🌟");
    onComplete();
  };

  if (completed) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02] shadow-xl rounded-3xl overflow-hidden p-6 sm:p-8">
        <CardContent className="pt-4 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold text-foreground">Interests Mapped ✨</h3>
            <p className="font-body text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your interest profile feeds every Career Card, Story, Challenge, and Audio/Visual experience in Curiosity Compass.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white rounded-3xl border border-border shadow-xl overflow-hidden relative">
        <div className="w-full h-1 bg-muted/60 relative overflow-hidden">
          <motion.div className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>

        <div className="p-6 border-b border-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-[#5500cb] shrink-0" />
              <span className="font-display font-bold text-base text-foreground">Holistic Interests Assessment</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] rounded-full bg-background">{current.sectionLabel}</Badge>
              <span className="text-[10px] text-muted-foreground font-body">{completedCount} of {total} answered</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1 font-mono rounded-full bg-background border-border/80 text-[#5500cb]">
            Question {step + 1} of {total}
          </Badge>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground tracking-tight leading-snug">
                {current.question}
              </h3>
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-[10px] font-body text-muted-foreground mr-1.5">Feeds →</span>
                {current.usedFor.map((u) => (
                  <Badge key={u} variant="secondary" className="text-[10px] bg-muted text-muted-foreground hover:bg-muted font-normal">{u}</Badge>
                ))}
              </div>
              <div className={`grid grid-cols-1 ${current.options.length > 3 ? "sm:grid-cols-2" : ""} gap-3`}>
                {current.options.map((opt) => {
                  const isSelected = answers[current.id]?.value === opt.value;
                  return (
                    <button key={opt.value} onClick={() => handleSelect(opt)}
                      className={`group flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all duration-300 font-body text-sm ${
                        isSelected ? "border-primary bg-primary/[0.03] shadow-md font-semibold text-primary" : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/10 text-foreground"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/30 group-hover:border-primary/50"
                        }`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                        <span className="font-medium">{opt.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-border/40 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}
            className="font-body h-11 px-6 rounded-full border border-border/50 hover:bg-background/80">
            <ArrowLeft size={16} className="mr-2" /> Previous
          </Button>
          <Button onClick={handleNext} disabled={!answers[current.id] || saving} size="sm"
            className="bg-primary text-white hover:bg-primary/95 rounded-full h-11 px-8 font-body font-semibold shadow-md disabled:opacity-40">
            {step === total - 1 ? (saving ? "Saving…" : "Finish Assessment") : "Next Question"} <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default InterestsAssessment;
