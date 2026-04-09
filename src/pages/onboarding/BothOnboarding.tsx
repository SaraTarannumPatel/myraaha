import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Briefcase, Rocket,
  Compass, Map, Brain, Lightbulb, Zap, Wrench, Globe, FileText
} from "lucide-react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";

const bothSteps = [
  {
    id: "career_interests",
    title: "Career side: What areas interest you?",
    subtitle: "These fuel your Curiosity Compass, Roadmaps, and career matching.",
    type: "multi-select",
    options: [
      "Technology & Software", "Design & Creative Arts", "Business & Strategy",
      "Science & Research", "Healthcare & Medicine", "Education & Teaching",
      "Finance & Economics", "Engineering", "Marketing & Sales",
      "Data & Analytics", "Social Impact", "Media & Communication",
    ],
  },
  {
    id: "startup_sectors",
    title: "Startup side: Where would you build?",
    subtitle: "These shape your Startup Sparks and venture-building tools.",
    type: "multi-select",
    options: [
      "SaaS & Software", "E-commerce & D2C", "EdTech & Learning",
      "HealthTech & Wellness", "FinTech & Payments", "Social Impact",
      "AI & Machine Learning", "Climate & Sustainability", "Creator Economy",
      "Food & Agriculture", "Gaming & Entertainment", "HR & Workforce",
    ],
  },
  {
    id: "overlap",
    title: "Where do your paths intersect?",
    subtitle: "Our AI will use these to find synergies between your career skills and startup ideas.",
    type: "multi-select",
    options: [
      "My job skills could power a side venture",
      "I want to freelance using my career expertise",
      "I'm exploring entrepreneurship as a career pivot",
      "I want to build products in my career domain",
      "I'd love to consult while growing a startup",
      "I want to understand both worlds before choosing",
    ],
  },
  {
    id: "preview",
    title: "Your hybrid toolkit is ready",
    subtitle: "We've combined career and entrepreneurship tools based on your interests — showing where they overlap.",
    type: "preview",
    tools: [
      { icon: Compass, name: "Curiosity Compass", desc: "Explore interests that fuel both career paths and startup ideas", color: "bg-accent/10 text-accent", tag: "Career" },
      { icon: Lightbulb, name: "Startup Sparks", desc: "AI idea cards matched to your career expertise and startup sectors", color: "bg-primary/10 text-primary", tag: "Startup" },
      { icon: Brain, name: "SelfGraph™", desc: "Unified identity map showing skills, strengths, and cross-path insights", color: "bg-accent/10 text-accent", tag: "Both" },
      { icon: Zap, name: "Mindset Builder", desc: "Challenges that build resilience for career growth and ventures", color: "bg-primary/10 text-primary", tag: "Startup" },
      { icon: Map, name: "AI Roadmaps", desc: "Dual roadmaps blending career milestones with startup objectives", color: "bg-accent/10 text-accent", tag: "Both" },
      { icon: Globe, name: "Communities", desc: "Career circles + startup peer groups in one unified network", color: "bg-primary/10 text-primary", tag: "Both" },
    ],
  },
];

const BothOnboarding = () => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({
    career_interests: [],
    startup_sectors: [],
    overlap: [],
  });
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const current = bothSteps[step];

  const toggleOption = (option: string) => {
    const key = current.id;
    const arr = selections[key] || [];
    setSelections({
      ...selections,
      [key]: arr.includes(option) ? arr.filter(o => o !== option) : [...arr, option],
    });
  };

  const handleNext = async () => {
    if (step < bothSteps.length - 1) {
      setStep(step + 1);
    } else {
      await updateProfile({
        areas_of_focus: [
          ...(selections.career_interests || []),
          ...(selections.startup_sectors || []),
        ],
        onboarding_status: "personal_info" as any,
      } as any);
      navigate("/onboarding/personal-info");
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate("/onboarding/intent");
  };

  const canProceed = current.type === "preview" || (selections[current.id]?.length || 0) > 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="flex items-center gap-2">
          {bothSteps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-body text-xs font-semibold">
            <Sparkles size={12} /> Hybrid Path Setup
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
                    className="bg-card rounded-xl border border-border p-4 flex items-start gap-3 relative"
                  >
                    <div className={`p-2 rounded-lg ${tool.color}`}>
                      <tool.icon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-sm text-foreground">{tool.name}</h3>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-body font-semibold ${
                          tool.tag === "Both" ? "bg-primary/10 text-primary" :
                          tool.tag === "Career" ? "bg-accent/10 text-accent" :
                          "bg-muted text-muted-foreground"
                        }`}>{tool.tag}</span>
                      </div>
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
            {selections[current.id]?.length || 0} selected — pick as many as you like
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
            {step === bothSteps.length - 1 ? "Continue Setup" : "Next"} <ArrowRight size={18} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default BothOnboarding;
