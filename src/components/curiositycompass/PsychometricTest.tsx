import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle2, ClipboardCheck, Brain } from "lucide-react";
import { toast } from "sonner";

interface PsychometricQuestion {
  id: string;
  section: string;
  sectionLabel: string;
  question: string;
  options: string[];
  usedFor: string[];
}

const PSYCHOMETRIC_QUESTIONS: PsychometricQuestion[] = [
  // SECTION A — COGNITIVE STYLE
  {
    id: "cognitive_problem", section: "A", sectionLabel: "Cognitive Style",
    question: "When faced with a complex problem, you naturally prefer to:",
    options: ["Break it into logical steps", "Look at the big picture first", "Try things out and learn by doing", "Discuss it with others"],
    usedFor: ["Learning pathway structure", "Project type assignment", "AI Coach explanation depth"],
  },
  {
    id: "cognitive_decision", section: "A", sectionLabel: "Cognitive Style",
    question: "When making decisions with limited information, you:",
    options: ["Decide and adjust later", "Seek more data before acting", "Wait for clarity", "Avoid deciding"],
    usedFor: ["Identity Evolution Tracker", "Transition Readiness Signals"],
  },
  // SECTION B — ADAPTABILITY
  {
    id: "adaptability_change", section: "B", sectionLabel: "Adaptability & Change",
    question: "When plans suddenly change, you usually:",
    options: ["Adjust quickly and move on", "Take time to recalibrate", "Feel uncomfortable but adapt", "Feel stressed and resistant"],
    usedFor: ["Transition Planner pacing", "Challenge difficulty calibration"],
  },
  // SECTION C — AGENCY & CONTROL
  {
    id: "agency_outcomes", section: "C", sectionLabel: "Agency & Control",
    question: "When outcomes don't go as expected, you're more likely to think:",
    options: ["I can change my approach", "I need better support or tools", "External factors played a big role", "I'm not sure why it happened"],
    usedFor: ["Autonomy ramp-up", "Founder vs contributor exposure", "Mentorship intensity"],
  },
  {
    id: "agency_initiative", section: "C", sectionLabel: "Agency & Control",
    question: "When you see a problem or opportunity, you usually…",
    options: ["Take initiative on your own", "Act if someone supports me", "Wait for direction", "Observe but don't act"],
    usedFor: ["Autonomy ramp-up", "Founder vs contributor exposure", "Mentorship intensity"],
  },
  // SECTION D — AMBIGUITY TOLERANCE
  {
    id: "ambiguity_preference", section: "D", sectionLabel: "Ambiguity Tolerance",
    question: "You prefer situations where:",
    options: ["Outcomes are predictable", "Some uncertainty exists", "Things evolve as you go"],
    usedFor: ["Entrepreneurship readiness modeling", "Exploration density", "Roadmap clarity level"],
  },
  // SECTION F — EMOTIONAL REGULATION
  {
    id: "emotion_pressure", section: "F", sectionLabel: "Emotional Regulation",
    question: "Under pressure, you tend to:",
    options: ["Stay calm and focused", "Feel tense but functional", "Feel overwhelmed", "Shut down temporarily"],
    usedFor: ["AI Career Therapist sensitivity", "Feedback timing", "Stress-aware nudges"],
  },
  {
    id: "emotion_setback", section: "F", sectionLabel: "Emotional Regulation",
    question: "When things go wrong, you usually:",
    options: ["Reflect and reset", "Seek reassurance", "Avoid thinking about it", "Feel stuck"],
    usedFor: ["AI Career Therapist sensitivity", "Feedback timing", "Stress-aware nudges"],
  },
  // SECTION G — GROWTH ORIENTATION
  {
    id: "growth_skill", section: "G", sectionLabel: "Growth Orientation",
    question: "When you're not good at something yet, you:",
    options: ["Feel motivated to improve", "Feel neutral", "Feel discouraged"],
    usedFor: ["SkillStacker pacing", "Challenge difficulty", "Encouragement framing"],
  },
  // SECTION H — VALUES
  {
    id: "values_priority", section: "H", sectionLabel: "Values Anchoring",
    question: "When choosing between options, you prioritize:",
    options: ["What aligns with my values", "What helps me grow", "What is practical", "What gives recognition"],
    usedFor: ["Career path filtering", "Mentor matching values"],
  },
  // SECTION I — PERSISTENCE
  {
    id: "persistence_slow", section: "I", sectionLabel: "Persistence",
    question: "When progress is slow but meaningful, you usually:",
    options: ["Stay patient and consistent", "Push harder to speed things up", "Feel demotivated", "Question whether it's worth continuing"],
    usedFor: ["Startup vs job-track weighting", "Long-horizon roadmap activation"],
  },
  {
    id: "persistence_motivation", section: "I", sectionLabel: "Persistence",
    question: "You're more motivated by:",
    options: ["Long-term outcomes", "Medium-term milestones", "Immediate feedback"],
    usedFor: ["Skill compounding models", "Reward pacing"],
  },
  // SECTION L — FEEDBACK RECEPTIVITY
  {
    id: "feedback_critical", section: "L", sectionLabel: "Feedback Receptivity",
    question: "When receiving critical feedback, you usually:",
    options: ["Reflect and apply it", "Feel defensive initially but adapt", "Feel discouraged", "Prefer minimal feedback"],
    usedFor: ["Feedback tone selection", "Coaching vs suggestion framing", "Mentor matching"],
  },
  {
    id: "feedback_style", section: "L", sectionLabel: "Feedback Receptivity",
    question: "Feedback helps you most when it is:",
    options: ["Direct and honest", "Gentle and supportive", "Structured and specific"],
    usedFor: ["Feedback tone selection", "Coaching vs suggestion framing", "Mentor matching"],
  },
  // SECTION M — ROLE ORIENTATION
  {
    id: "role_initiative", section: "M", sectionLabel: "Role Orientation",
    question: "In a new initiative, you naturally:",
    options: ["Start things from scratch", "Improve existing systems", "Explore ideas and possibilities", "Support execution"],
    usedFor: ["Founder vs early-employee modeling", "Team role recommendations", "Project Playground matching"],
  },
  {
    id: "role_energy", section: "M", sectionLabel: "Role Orientation",
    question: "You feel most energized when:",
    options: ["Creating something new", "Solving efficiency problems", "Learning and experimenting", "Helping others succeed"],
    usedFor: ["Founder vs early-employee modeling", "Team role recommendations", "Project Playground matching"],
  },
  // SECTION N — MORAL COURAGE
  {
    id: "moral_risk", section: "N", sectionLabel: "Moral Courage",
    question: "If doing the right thing risks personal loss, you're likely to:",
    options: ["Still do it", "Try to find a compromise", "Avoid the situation", "Not sure"],
    usedFor: ["Ethical leadership signals", "Long-term trust modeling", "Organization matching"],
  },
  {
    id: "moral_authority", section: "N", sectionLabel: "Moral Courage",
    question: "When authority conflicts with your principles, you:",
    options: ["Speak up", "Express concerns cautiously", "Stay silent", "Feel conflicted"],
    usedFor: ["Ethical leadership signals", "Long-term trust modeling", "Organization matching"],
  },
  // SECTION P — LEARNING TRANSFER
  {
    id: "learning_apply", section: "P", sectionLabel: "Learning Transfer",
    question: "After learning something new, you usually:",
    options: ["Apply it quickly", "Apply it when needed", "Remember it but don't apply much", "Forget unless prompted"],
    usedFor: ["Project-first vs content-first pathways", "Experiential learning triggers"],
  },
  {
    id: "learning_best", section: "P", sectionLabel: "Learning Transfer",
    question: "You learn best when:",
    options: ["Applying concepts in real projects", "Discussing ideas", "Studying theory", "Observing others"],
    usedFor: ["Project-first vs content-first pathways", "NEP-aligned curriculum logic"],
  },
  // SECTION Q — RESPONSE CALIBRATION (not scored as traits)
  {
    id: "calibration_style", section: "Q", sectionLabel: "Response Calibration",
    question: "While answering these questions, you mostly:",
    options: ["Answered instinctively", "Thought carefully before each answer", "Changed answers often", "Felt unsure about many answers"],
    usedFor: [],
  },
  {
    id: "calibration_confidence", section: "Q", sectionLabel: "Response Calibration",
    question: "How confident do you feel that your answers reflect you right now?",
    options: ["Very confident", "Mostly confident", "Not very confident"],
    usedFor: [],
  },
];

interface PsychometricTestProps {
  userId: string;
  onComplete: () => void;
  recordSignal: (source: string, value: string, type: string, strength: number, meta?: any) => Promise<void>;
}

const PsychometricTest = ({ userId, onComplete, recordSignal }: PsychometricTestProps) => {
  const { profile, updateProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (profile?.journey_responses?.psychometric_completed) {
      setCompleted(true);
    }
  }, [profile]);

  const current = PSYCHOMETRIC_QUESTIONS[step];
  const progress = ((step + 1) / PSYCHOMETRIC_QUESTIONS.length) * 100;

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [current.id]: option });
  };

  const handleNext = () => {
    if (step < PSYCHOMETRIC_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    if (step < PSYCHOMETRIC_QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    // Save to profile
    await updateProfile({
      journey_responses: {
        ...profile?.journey_responses,
        psychometric_completed: true,
        psychometric_answers: answers,
        psychometric_completed_at: new Date().toISOString(),
      },
    } as any);

    // Record signals for each answer that has usedFor modules
    for (const q of PSYCHOMETRIC_QUESTIONS) {
      if (answers[q.id] && q.usedFor.length > 0) {
        await recordSignal("psychometric_test", answers[q.id], "psychometric_trait", 0.8, {
          question_id: q.id,
          section: q.section,
          used_for: q.usedFor,
        });
      }
    }

    setCompleted(true);
    toast.success("Psychometric assessment complete! Your profile has been enriched 🧬");
    onComplete();
  };

  if (completed) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <h3 className="font-display text-xl">Assessment Complete ✨</h3>
          <p className="font-body text-sm text-muted-foreground">
            Your psychometric profile is now active. AI modules are calibrated to your cognitive style, emotional patterns, and learning preferences.
          </p>
          <Button variant="outline" onClick={() => { setCompleted(false); setStep(0); setAnswers({}); }}>
            Retake Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-xl w-full bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-4"
      >
        {/* Popup Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-primary" />
              <span className="font-display text-sm sm:text-base">Psychometric Assessment</span>
            </div>
            <span className="font-body text-xs text-muted-foreground">{step + 1} / {PSYCHOMETRIC_QUESTIONS.length}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div className="flex items-center justify-between mt-2">
            <Badge variant="outline" className="text-[10px]">Section {current.section} — {current.sectionLabel}</Badge>
          </div>
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-6 max-h-[55vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h3 className="font-display text-base sm:text-lg text-foreground">{current.question}</h3>
              {current.usedFor.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {current.usedFor.slice(0, 3).map((u) => (
                    <Badge key={u} variant="secondary" className="text-[10px]">{u}</Badge>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                {current.options.map((opt) => {
                  const isSelected = answers[current.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all font-body text-sm ${
                        isSelected ? "border-primary bg-primary/10 font-semibold" : "border-border hover:border-primary/30"
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} className="inline mr-2 text-primary" />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" disabled={step === 0} onClick={() => setStep(step - 1)}>
            <ArrowLeft size={14} className="mr-1" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground text-xs">
              Skip
            </Button>
            <Button
              onClick={handleNext}
              disabled={!answers[current.id]}
              size="sm"
              className="bg-primary text-accent rounded-full px-5"
            >
              {step === PSYCHOMETRIC_QUESTIONS.length - 1 ? "Finish" : "Next"} <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PsychometricTest;
