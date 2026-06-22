import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, CheckCircle2, ClipboardCheck, Brain, Check } from "lucide-react";
import { toast } from "sonner";
import { useAssessmentRewards } from "@/hooks/useAssessmentRewards";
import { buildPsychometricSignal, PSYCHOMETRIC_SIGNAL_MAP } from "@/lib/assessmentSignalMap";
import AssessmentAnswerReview from "@/components/curiositycompass/AssessmentAnswerReview";

interface PsychometricQuestion {
  id: string;
  section: string;
  sectionLabel: string;
  question: string;
  options: string[];
  usedFor: string[];
}

const PSYCHOMETRIC_QUESTIONS: PsychometricQuestion[] = [
  { id: "cognitive_problem", section: "A", sectionLabel: "Cognitive Style", question: "When faced with a complex problem, you naturally prefer to:", options: ["Break it into logical steps","Look at the big picture first","Try things out and learn by doing","Discuss it with others"], usedFor: ["AI Roadmap","SkillStacker","Career Coach"] },
  { id: "cognitive_decision", section: "A", sectionLabel: "Cognitive Style", question: "When making decisions with limited information, you:", options: ["Decide and adjust later","Seek more data before acting","Wait for clarity","Avoid deciding"], usedFor: ["SelfGraph","Transition Planner"] },
  { id: "adaptability_change", section: "B", sectionLabel: "Adaptability & Change", question: "When plans suddenly change, you usually:", options: ["Adjust quickly and move on","Take time to recalibrate","Feel uncomfortable but adapt","Feel stressed and resistant"], usedFor: ["Transition Planner","Project Playground"] },
  { id: "agency_outcomes", section: "C", sectionLabel: "Agency & Control", question: "When outcomes don't go as expected, you're more likely to think:", options: ["I can change my approach","I need better support or tools","External factors played a big role","I'm not sure why it happened"], usedFor: ["Mentor Match","MVP Builder","SelfGraph"] },
  { id: "agency_initiative", section: "C", sectionLabel: "Agency & Control", question: "When you see a problem or opportunity, you usually…", options: ["Take initiative on your own","Act if someone supports me","Wait for direction","Observe but don't act"], usedFor: ["MVP Builder","Startup Sparks","SelfGraph"] },
  { id: "ambiguity_preference", section: "D", sectionLabel: "Ambiguity Tolerance", question: "You prefer situations where:", options: ["Outcomes are predictable","Some uncertainty exists","Things evolve as you go"], usedFor: ["AI Roadmap","MVP Builder","Transition Planner"] },
  { id: "emotion_pressure", section: "F", sectionLabel: "Emotional Regulation", question: "Under pressure, you tend to:", options: ["Stay calm and focused","Feel tense but functional","Feel overwhelmed","Shut down temporarily"], usedFor: ["Career Therapist","Mindset Builder"] },
  { id: "emotion_setback", section: "F", sectionLabel: "Emotional Regulation", question: "When things go wrong, you usually:", options: ["Reflect and reset","Seek reassurance","Avoid thinking about it","Feel stuck"], usedFor: ["Career Therapist","Mindset Builder"] },
  { id: "growth_skill", section: "G", sectionLabel: "Growth Orientation", question: "When you're not good at something yet, you:", options: ["Feel motivated to improve","Feel neutral","Feel discouraged"], usedFor: ["SkillStacker","Project Playground"] },
  { id: "values_priority", section: "H", sectionLabel: "Values Anchoring", question: "When choosing between options, you prioritize:", options: ["What aligns with my values","What helps me grow","What is practical","What gives recognition"], usedFor: ["Job Matching","Mentor Match"] },
  { id: "persistence_slow", section: "I", sectionLabel: "Persistence", question: "When progress is slow but meaningful, you usually:", options: ["Stay patient and consistent","Push harder to speed things up","Feel demotivated","Question whether it's worth continuing"], usedFor: ["AI Roadmap","MVP Builder"] },
  { id: "persistence_motivation", section: "I", sectionLabel: "Persistence", question: "You're more motivated by:", options: ["Long-term outcomes","Medium-term milestones","Immediate feedback"], usedFor: ["SkillStacker","AI Roadmap"] },
  { id: "feedback_critical", section: "L", sectionLabel: "Feedback Receptivity", question: "When receiving critical feedback, you usually:", options: ["Reflect and apply it","Feel defensive initially but adapt","Feel discouraged","Prefer minimal feedback"], usedFor: ["Career Coach","Mentor Match"] },
  { id: "feedback_style", section: "L", sectionLabel: "Feedback Receptivity", question: "Feedback helps you most when it is:", options: ["Direct and honest","Gentle and supportive","Structured and specific"], usedFor: ["Career Coach","Career Therapist"] },
  { id: "role_initiative", section: "M", sectionLabel: "Role Orientation", question: "In a new initiative, you naturally:", options: ["Start things from scratch","Improve existing systems","Explore ideas and possibilities","Support execution"], usedFor: ["Project Playground","Job Matching","MVP Builder","Career Cards"] },
  { id: "moral_risk", section: "N", sectionLabel: "Moral Courage", question: "If doing the right thing risks personal loss, you're likely to:", options: ["Still do it","Try to find a compromise","Avoid the situation","Not sure"], usedFor: ["Job Matching","SelfGraph"] },
  { id: "moral_authority", section: "N", sectionLabel: "Moral Courage", question: "When authority conflicts with your principles, you:", options: ["Speak up","Express concerns cautiously","Stay silent","Feel conflicted"], usedFor: ["Mentor Match","SelfGraph"] },
  { id: "learning_apply", section: "P", sectionLabel: "Learning Transfer", question: "After learning something new, you usually:", options: ["Apply it quickly","Apply it when needed","Remember it but don't apply much","Forget unless prompted"], usedFor: ["Content Library","Project Playground"] },
  { id: "learning_best", section: "P", sectionLabel: "Learning Transfer", question: "You learn best when:", options: ["Applying concepts in real projects","Discussing ideas","Studying theory","Observing others"], usedFor: ["Content Library","SkillStacker"] },
  { id: "calibration_style", section: "Q", sectionLabel: "Response Calibration", question: "While answering these questions, you mostly:", options: ["Answered instinctively","Thought carefully before each answer","Changed answers often","Felt unsure about many answers"], usedFor: [] },
  { id: "calibration_confidence", section: "Q", sectionLabel: "Response Calibration", question: "How confident do you feel that your answers reflect you right now?", options: ["Very confident","Mostly confident","Not very confident"], usedFor: [] },
  // ── Extended battery (30 more) ──────────────────────────────────────────
  { id: "risk_appetite", section: "R", sectionLabel: "Risk Appetite", question: "When considering a high-reward but uncertain opportunity, you tend to:", options: ["Go for it boldly","Test it in small steps","Wait for proof from others","Avoid it"], usedFor: ["MVP Builder","Startup Sparks","Transition Planner"] },
  { id: "risk_failure", section: "R", sectionLabel: "Risk Appetite", question: "Failure in a project mostly feels like:", options: ["A learning step","A signal to pivot","A personal setback","Something to avoid"], usedFor: ["MVP Builder","Career Therapist","Mindset Builder"] },
  { id: "autonomy_pref", section: "S", sectionLabel: "Autonomy vs Collaboration", question: "You do your best work when:", options: ["Working independently","Pairing with one person","In a small team","In a structured group"], usedFor: ["Job Matching","Peer Circles","Project Playground"] },
  { id: "collab_style", section: "S", sectionLabel: "Autonomy vs Collaboration", question: "In a group project, you usually take the role of:", options: ["Leader","Builder","Connector","Specialist"], usedFor: ["Peer Circles","Mentor Match","Job Matching"] },
  { id: "identity_clarity", section: "T", sectionLabel: "Identity Clarity", question: "How clearly do you know what kind of work suits you?", options: ["Very clearly","Somewhat clearly","Still figuring it out","Not at all"], usedFor: ["SelfGraph","Career Coach","AI Roadmap"] },
  { id: "future_orientation", section: "U", sectionLabel: "Future Orientation", question: "When thinking about your future, you mostly:", options: ["Plan years ahead","Plan a few months ahead","Take it week by week","Live in the moment"], usedFor: ["AI Roadmap","Transition Planner","SelfGraph","SkillStacker"] },
  { id: "energy_recovery", section: "V", sectionLabel: "Energy & Recovery", question: "After intense effort, you recharge best by:", options: ["Alone time","Time with close friends","Active hobbies","Doing nothing"], usedFor: ["Career Therapist","Mindset Builder","Moodboard"] },
  { id: "stress_signal", section: "V", sectionLabel: "Energy & Recovery", question: "Your earliest sign of burnout is usually:", options: ["Low motivation","Irritability","Trouble sleeping","Avoiding people"], usedFor: ["Career Therapist","Mindset Builder"] },
  { id: "conflict_style", section: "W", sectionLabel: "Conflict Resolution", question: "In a disagreement, you usually:", options: ["Address it directly","Try to find common ground","Step back to cool off","Avoid it"], usedFor: ["Peer Circles","Mentor Match","Career Coach"] },
  { id: "self_awareness", section: "X", sectionLabel: "Self-Awareness", question: "How often do you reflect on why you reacted a certain way?", options: ["Daily","Weekly","Occasionally","Rarely"], usedFor: ["SelfGraph","Career Therapist","Journal"] },
  { id: "curiosity_style", section: "Y", sectionLabel: "Curiosity Style", question: "Your curiosity usually pulls you toward:", options: ["Going deep into one topic","Sampling many topics","Connecting ideas across fields","Practical how-to knowledge"], usedFor: ["Content Library","Career Cards","Project Playground"] },
  { id: "focus_style", section: "Z", sectionLabel: "Focus Style", question: "You concentrate best when:", options: ["Working in long deep blocks","Switching between short bursts","With music/background noise","In quiet structured slots"], usedFor: ["SkillStacker","Project Playground"] },
  { id: "multitask_pref", section: "Z", sectionLabel: "Focus Style", question: "Juggling several projects at once feels:", options: ["Energizing","Manageable","Stressful","Overwhelming"], usedFor: ["Project Playground","Job Matching"] },
  { id: "achievement_drive", section: "AA", sectionLabel: "Achievement Drive", question: "Which kind of progress feels most rewarding?", options: ["Mastering a hard skill","Shipping something visible","Helping someone succeed","Earning recognition"], usedFor: ["SkillStacker","MVP Builder","Mentor Match"] },
  { id: "recognition_pref", section: "AA", sectionLabel: "Achievement Drive", question: "Recognition matters to you when it comes from:", options: ["Experts in the field","Close peers","A wide audience","Doesn't really matter"], usedFor: ["Mentor Match","Peer Circles","SelfGraph"] },
  { id: "social_comfort", section: "AB", sectionLabel: "Social Comfort", question: "In a new group, you usually:", options: ["Talk to everyone","Find one or two people","Listen and observe","Keep to yourself"], usedFor: ["Peer Circles","Mentor Match","Job Matching"] },
  { id: "leadership_style", section: "AC", sectionLabel: "Leadership Style", question: "When leading others, you most naturally:", options: ["Set vision","Coach individually","Coordinate execution","Lead by example"], usedFor: ["Mentor Match","Job Matching","MVP Builder"] },
  { id: "planning_style", section: "AD", sectionLabel: "Planning Style", question: "Your default approach to a new goal is:", options: ["Detailed plan first","Rough plan + iterate","Start and figure it out","Wait until clear"], usedFor: ["AI Roadmap","Transition Planner","SkillStacker"] },
  { id: "structure_pref", section: "AE", sectionLabel: "Structure Preference", question: "You thrive when your day is:", options: ["Tightly structured","Loosely scheduled","Flexible and reactive","Completely free"], usedFor: ["Job Matching","Project Playground"] },
  { id: "deep_vs_broad", section: "AF", sectionLabel: "Skill Breadth", question: "Your ideal expertise looks like:", options: ["Deep specialist","T-shaped (deep + broad)","Generalist","Renaissance polymath"], usedFor: ["SkillStacker","Career Cards"] },
  { id: "learning_pace", section: "AG", sectionLabel: "Learning Pace", question: "You learn best at a pace that is:", options: ["Fast and intensive","Steady and consistent","Slow and reflective","Self-driven on demand"], usedFor: ["Content Library","SkillStacker"] },
  { id: "async_pref", section: "AH", sectionLabel: "Work Mode", question: "You prefer communication that is:", options: ["Mostly async (text)","Live calls","Mix of both","Face-to-face"], usedFor: ["Job Matching","Peer Circles"] },
  { id: "impact_pref", section: "AI", sectionLabel: "Impact Preference", question: "The kind of impact you most want is:", options: ["Help individuals deeply","Change systems at scale","Create art/ideas","Build products that ship"], usedFor: ["Career Cards","SelfGraph","Mentor Match"] },
  { id: "optimism", section: "AJ", sectionLabel: "Outlook", question: "When facing the unknown, your default mindset is:", options: ["Optimistic","Realistic","Cautious","Skeptical"], usedFor: ["Mindset Builder","Career Therapist","SelfGraph"] },
  { id: "communication_style", section: "AK", sectionLabel: "Communication Style", question: "When sharing ideas, you tend to be:", options: ["Direct and concise","Story-driven","Data-driven","Visual and creative"], usedFor: ["Job Matching","Peer Circles","Career Coach"] },
  { id: "mentorship_pref", section: "AL", sectionLabel: "Mentorship Preference", question: "You'd benefit most from a mentor who is:", options: ["A few steps ahead","An industry veteran","A peer accountability buddy","A coach who asks questions"], usedFor: ["Mentor Match","Career Coach"] },
  { id: "ownership_pref", section: "AM", sectionLabel: "Ownership", question: "You feel most engaged when you:", options: ["Own a project end-to-end","Co-own with a partner","Contribute to a team","Execute clear tasks"], usedFor: ["MVP Builder","Project Playground","Job Matching"] },
  { id: "exploration_breadth", section: "AN", sectionLabel: "Exploration Breadth", question: "Right now, you feel you should be:", options: ["Exploring widely","Narrowing down","Committing deeply","Pausing to reflect"], usedFor: ["AI Roadmap","Career Cards","SelfGraph"] },
];

interface Props {
  userId: string;
  onComplete: () => void;
  recordSignal: (source: string, value: string, type: string, strength: number, meta?: any) => Promise<void>;
}

const PsychometricTest = ({ userId, onComplete, recordSignal }: Props) => {
  const { profile, updateProfile } = useAuth();
  const { updateProgress } = useAssessmentRewards();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (profile?.journey_responses?.psychometric_completed) setCompleted(true);
  }, [profile]);

  const current = PSYCHOMETRIC_QUESTIONS[step];
  const total = PSYCHOMETRIC_QUESTIONS.length;
  const completedCount = Object.keys(answers).length;
  const progress = (completedCount / total) * 100;

  const persistQuestionSignal = async (q: PsychometricQuestion, answer: string) => {
    const sig = buildPsychometricSignal(q.id, answer);
    await supabase.from("assessment_question_signals" as any).insert({
      user_id: userId,
      test_type: "psychometric",
      question_id: q.id,
      question_text: q.question,
      answer_value: answer,
      answer_label: answer,
      target_modules: sig.target_modules,
      signal_tags: sig.signal_tags,
      weight: 0.8,
    });
    if (q.usedFor.length > 0) {
      await recordSignal("psychometric_test", answer, "psychometric_trait", 0.8, {
        question_id: q.id,
        section: q.section,
        target_modules: sig.target_modules,
      });
    }
  };

  const handleSelect = async (option: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [current.id]: option };
      persistQuestionSignal(current, option);
      const completedNow = Object.keys(next).length;
      updateProgress("psychometric", completedNow, total);
      return next;
    });
  };

  const handleNext = () => {
    if (step < total - 1) setStep(step + 1);
    else setShowReview(true);
  };

  const handleSkip = () => {
    if (step < total - 1) setStep(step + 1);
    else setShowReview(true);
  };

  const handleComplete = async () => {
    setSynthesizing(true);
    await updateProfile({
      journey_responses: {
        ...profile?.journey_responses,
        psychometric_completed: true,
        psychometric_answers: answers,
        psychometric_completed_at: new Date().toISOString(),
      },
    } as any);

    await updateProgress("psychometric", total, total);

    try {
      await supabase.functions.invoke("assessment-synthesizer", { body: { test_type: "psychometric" } });
      await supabase.functions.invoke("assessment-synthesizer", { body: { test_type: "combined" } });
      const { runUserPersonalization } = await import("@/lib/personalizationPipeline");
      runUserPersonalization(userId, { force: true }).catch(() => {});
    } catch (e) {
      console.warn("Synthesis failed", e);
    }

    setCompleted(true);
    setSynthesizing(false);
    toast.success("Psychometric assessment complete! Your profile has been enriched 🧬");
    onComplete();
  };

  if (completed) {
    // Preview saved answers (read-only). "Retake Assessment" intentionally removed —
    // psychometric results are one-time-per-user; users can review but not reset.
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.02] to-accent/[0.02] shadow-xl rounded-3xl overflow-hidden p-6 sm:p-8">
        <CardContent className="pt-4 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold text-foreground">Assessment Complete ✨</h3>
            <p className="font-body text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your psychometric profile is now active! All AI tools, mentoring matches, and career planning modules are calibrated to your personal style.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="outline" className="rounded-full px-6 font-body text-xs font-semibold" onClick={() => { setCompleted(false); setStep(0); setAnswers({}); }}>
              Retake Assessment
            </Button>
          </div>
          {Object.keys(answers).length > 0 && (
            <div className="mt-6 border-t border-border/60 pt-6 space-y-4 max-h-[30vh] overflow-y-auto pr-2">
              <h4 className="font-display text-sm font-bold text-primary text-left">Your Answers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PSYCHOMETRIC_QUESTIONS.filter((q) => answers[q.id]).map((q) => (
                  <div key={q.id} className="text-left bg-white p-3.5 rounded-2xl border border-border/80 shadow-sm">
                    <p className="font-body text-[10px] text-muted-foreground leading-normal">{q.question}</p>
                    <p className="font-body text-xs font-bold text-foreground mt-1 leading-normal">{answers[q.id]}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (showReview && !completed) {
    const items = PSYCHOMETRIC_QUESTIONS.map((q) => ({
      id: q.id,
      section: q.sectionLabel,
      question: q.question,
      answer: answers[q.id] || "",
    }));
    return (
      <AssessmentAnswerReview
        title="your psychometric answers"
        items={items}
        submitting={synthesizing}
        onEdit={(qid) => {
          const idx = PSYCHOMETRIC_QUESTIONS.findIndex((q) => q.id === qid);
          if (idx >= 0) { setStep(idx); setShowReview(false); }
        }}
        onBack={() => { setShowReview(false); setStep(total - 1); }}
        onSubmit={handleComplete}
      />
    );
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-3xl border border-border shadow-xl overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-accent/[0.01] pointer-events-none" />
        
        {/* Progress Bar along the top edge */}
        <div className="w-full h-1 bg-muted/60 relative overflow-hidden">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Section Header */}
        <div className="p-6 border-b border-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/10 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain size={20} className="text-[#5500cb] shrink-0" />
              <span className="font-display font-bold text-base text-foreground">Psychometric Career Calibration</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] rounded-full bg-background">Sec {current.section} — {current.sectionLabel}</Badge>
              <span className="text-[10px] text-muted-foreground font-body">{completedCount} of {total} answered</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs px-3 py-1 font-mono rounded-full bg-background border-border/80 text-[#5500cb]">
            Question {step + 1} of {total}
          </Badge>
        </div>

        {/* Question Body */}
        <div className="p-6 sm:p-8 space-y-6 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div 
              key={step} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="space-y-5"
            >
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground tracking-tight leading-snug">
                {current.question}
              </h3>
              
              {current.usedFor.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] font-body text-muted-foreground mr-1.5">Feeds →</span>
                  {current.usedFor.map((u) => (
                    <Badge key={u} variant="secondary" className="text-[10px] bg-muted text-muted-foreground hover:bg-muted font-normal">{u}</Badge>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {current.options.map((opt) => {
                  const isSelected = answers[current.id] === opt;
                  return (
                    <button 
                      key={opt} 
                      onClick={() => handleSelect(opt)}
                      className={`group flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all duration-300 font-body text-sm relative overflow-hidden ${
                        isSelected 
                          ? "border-primary bg-primary/[0.03] shadow-md font-semibold text-primary" 
                          : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/10 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/30 group-hover:border-primary/50"
                        }`}>
                          {isSelected && <Check size={10} strokeWidth={3} />}
                        </div>
                        <span className="font-medium">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer / Controls */}
        <div className="p-6 border-t border-border/40 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={step === 0} 
            onClick={() => setStep(step - 1)} 
            className="font-body h-11 px-6 rounded-full border border-border/50 hover:bg-background/80"
          >
            <ArrowLeft size={16} className="mr-2" /> Previous
          </Button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip} 
              className="font-body text-muted-foreground hover:text-foreground text-xs h-11 px-5 rounded-full"
            >
              Skip
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={!answers[current.id] || synthesizing} 
              size="sm" 
              className="bg-primary text-white hover:bg-primary/95 rounded-full h-11 px-8 font-body font-semibold shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === total - 1 ? (synthesizing ? "Saving…" : "Finish Assessment") : "Next Question"} <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PsychometricTest;
