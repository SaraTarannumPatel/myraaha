import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, Lightbulb, Rocket, Zap, Brain, Users,
  Wrench, Sparkles, CheckCircle2, Globe, Building2
} from "lucide-react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";
import { useModuleProgress } from "@/hooks/useModuleProgress";

const entrepreneurSteps = [
  {
    id: "ideas",
    title: "What kind of ideas excite you?",
    subtitle: "Pick sectors you'd love to build in — this shapes your Startup Sparks feed.",
    type: "multi-select",
    options: [
      "SaaS & Software", "E-commerce & D2C", "EdTech & Learning",
      "HealthTech & Wellness", "FinTech & Payments", "Social Impact",
      "AI & Machine Learning", "Climate & Sustainability", "Media & Content",
      "Food & Agriculture", "Logistics & Supply Chain", "Gaming & Entertainment",
      "Real Estate & PropTech", "HR & Workforce", "Creator Economy",
    ],
  },
  {
    id: "stage",
    title: "Where are you in your startup journey?",
    subtitle: "We'll calibrate your tools, challenges, and community to your current stage.",
    type: "single-select",
    options: [
      "Just dreaming — haven't started yet",
      "Have an idea but haven't validated it",
      "Actively validating a concept",
      "Building an MVP or prototype",
      "Launched and looking for early users",
      "Scaling and looking for funding",
    ],
  },
  {
    id: "challenges",
    title: "What's your biggest challenge right now?",
    subtitle: "This helps your AI Coach and Mindset Builder focus on what matters most.",
    type: "multi-select",
    options: [
      "Finding the right idea", "Validating market demand", "Building a team",
      "Technical skills gap", "Fear of failure", "Time management",
      "Funding & resources", "Marketing & growth", "Staying motivated",
      "Balancing job + startup", "Legal & compliance", "Finding mentors",
    ],
  },
  {
    id: "preview",
    title: "Your venture-building toolkit is ready",
    subtitle: "Based on your profile, here's what we've prepared.",
    type: "preview",
    tools: [
      { icon: Lightbulb, name: "Startup Sparks", desc: "AI-generated idea cards matched to your sectors and interests", color: "bg-accent/20 text-accent-foreground" },
      { icon: Zap, name: "Mindset Builder", desc: "Daily challenges targeting your specific growth areas", color: "bg-terracotta/10 text-terracotta" },
      { icon: Wrench, name: "MVP Builder", desc: "Experiment templates to rapidly prototype and test your ideas", color: "bg-maroon/10 text-maroon" },
      { icon: Rocket, name: "Startup Lab", desc: "Structured validation sprints with AI-guided planning", color: "bg-blue/10 text-blue" },
      { icon: Building2, name: "Founder Profile", desc: "Your evolving identity as a founder — strengths, projects, growth", color: "bg-primary/10 text-primary" },
      { icon: Globe, name: "Startup Communities", desc: "Peer groups and expert networks aligned to your sector", color: "bg-indigo/10 text-indigo" },
    ],
  },
];

const EntrepreneurshipOnboarding = () => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({
    ideas: [],
    stage: [],
    challenges: [],
  });
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const current = entrepreneurSteps[step];

  const toggleOption = (option: string) => {
    const key = current.id;
    if (current.type === "single-select") {
      setSelections({ ...selections, [key]: [option] });
    } else {
      const arr = selections[key] || [];
      setSelections({
        ...selections,
        [key]: arr.includes(option) ? arr.filter(o => o !== option) : [...arr, option],
      });
    }
  };

  const handleNext = async () => {
    if (step < entrepreneurSteps.length - 1) {
      setStep(step + 1);
    } else {
      await updateProfile({
        areas_of_focus: [...(selections.ideas || []), ...(selections.challenges || [])],
        onboarding_status: "consent" as any,
      } as any);
      navigate("/onboarding/consent");
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate("/onboarding/intent");
  };

  const canProceed = current.type === "preview" || (selections[current.id]?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingProgressBar progress={50} />
      <OnboardingRewardBanner currentProgress={50} />
      <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="flex items-center gap-2">
          {entrepreneurSteps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-body text-xs font-semibold">
            <Rocket size={12} /> Entrepreneurship Setup
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground">{current.title}</h1>
          <p className="font-body text-muted-foreground">{current.subtitle}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {current.type !== "preview" ? (
              <div className="flex flex-wrap gap-3 justify-center">
                {current.options.map((option) => {
                  const selected = selections[current.id]?.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleOption(option)}
                      className={`px-4 py-2.5 rounded-xl font-body text-sm transition-all border-2 ${
                        selected
                          ? "border-primary bg-primary/10 text-primary font-semibold shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {selected && <CheckCircle2 size={14} className="inline mr-1.5" />}
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {current.tools!.map((tool, i) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-card rounded-xl border border-border p-4 flex items-start gap-3"
                  >
                    <div className={`p-2 rounded-lg ${tool.color}`}>
                      <tool.icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-sm text-foreground">{tool.name}</h3>
                      <p className="font-body text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {current.type !== "preview" && (
          <p className="text-center font-body text-xs text-muted-foreground">
            {current.type === "multi-select"
              ? `${selections[current.id]?.length || 0} selected — pick as many as you like`
              : selections[current.id]?.length ? "Great choice!" : "Select one to continue"}
          </p>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleBack} className="font-body">
            <ArrowLeft size={18} /> Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="gradient-warm text-primary-foreground rounded-full px-8 font-body font-semibold shadow-accent disabled:opacity-50"
          >
            {step === entrepreneurSteps.length - 1 ? "Continue Setup" : "Next"} <ArrowRight size={18} />
          </Button>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default EntrepreneurshipOnboarding;
