import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, Compass, Map, Brain, FileText, Users,
  BookOpen, Sparkles, CheckCircle2, ChevronRight
} from "lucide-react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";

const careerSteps = [
  {
    id: "interests",
    title: "What excites you?",
    subtitle: "Select areas that spark your curiosity — we'll use these to personalize your Curiosity Compass.",
    type: "multi-select",
    options: [
      "Technology & Software", "Design & Creative Arts", "Business & Strategy",
      "Science & Research", "Healthcare & Medicine", "Education & Teaching",
      "Media & Communication", "Finance & Economics", "Engineering",
      "Social Impact & NGOs", "Law & Policy", "Marketing & Sales",
      "Data & Analytics", "Environment & Sustainability", "Sports & Fitness",
    ],
  },
  {
    id: "learning",
    title: "How do you learn best?",
    subtitle: "This helps us recommend the right content and learning paths for you.",
    type: "single-select",
    options: [
      "Watching videos & tutorials",
      "Reading articles & books",
      "Hands-on projects & building",
      "Discussions & group learning",
      "Mentorship & 1-on-1 guidance",
      "Self-paced exploration",
    ],
  },
  {
    id: "strengths",
    title: "What are you naturally good at?",
    subtitle: "Pick your top strengths — we'll map these in your SelfGraph™ identity profile.",
    type: "multi-select",
    options: [
      "Problem Solving", "Communication", "Leadership", "Creativity",
      "Analytical Thinking", "Teamwork", "Adaptability", "Empathy",
      "Technical Skills", "Organization", "Public Speaking", "Writing",
    ],
  },
  {
    id: "preview",
    title: "Your personalized toolkit is ready",
    subtitle: "Based on what you shared, here's what we've prepared for you.",
    type: "preview",
    tools: [
      { icon: Compass, name: "Curiosity Compass", desc: "Explore interests through story-based quests tailored to your curiosity areas", color: "bg-blue/10 text-blue" },
      { icon: Map, name: "AI Roadmaps", desc: "Step-by-step career roadmaps generated from your strengths and goals", color: "bg-indigo/10 text-indigo" },
      { icon: Brain, name: "SelfGraph™", desc: "Your identity mirror mapping skills, strengths, and growth patterns", color: "bg-terracotta/10 text-terracotta" },
      { icon: BookOpen, name: "Content Library", desc: "Micro-learning capsules matched to your learning style", color: "bg-primary/10 text-primary" },
      { icon: FileText, name: "Living Resume", desc: "An evolving profile that grows with every skill and project you complete", color: "bg-maroon/10 text-maroon" },
      { icon: Users, name: "Peer Circles", desc: "Community groups aligned with your interests and career stage", color: "bg-accent/20 text-accent-foreground" },
    ],
  },
];

const CareerOnboarding = () => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string[]>>({
    interests: [],
    learning: [],
    strengths: [],
  });
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const current = careerSteps[step];

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
    if (step < careerSteps.length - 1) {
      setStep(step + 1);
    } else {
      await updateProfile({
        areas_of_focus: selections.interests,
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
    <div className="min-h-screen bg-[hsl(60,14%,98%)] flex flex-col">
      <OnboardingProgressBar progress={50} />
      <OnboardingRewardBanner currentProgress={50} />
      <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        {/* Progress */}
        <div className="flex items-center gap-2">
          {careerSteps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-body text-xs font-semibold">
            <Sparkles size={12} /> Career Path Setup
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
            {step === careerSteps.length - 1 ? "Continue Setup" : "Next"} <ArrowRight size={18} />
          </Button>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default CareerOnboarding;
