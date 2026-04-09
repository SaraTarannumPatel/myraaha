import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Rocket, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";

const intents = [
  {
    value: "career", icon: Briefcase, title: "Jobs & Career",
    description: "Discover your ideal career path, build skills, create a Living Resume, and connect with opportunities.",
    features: ["Curiosity Compass", "AI Roadmaps", "SelfGraph™", "Living Resume", "Job Matching"],
    color: "border-blue", bgColor: "bg-blue/5", iconBg: "bg-blue", featureColor: "text-blue",
  },
  {
    value: "entrepreneurship", icon: Rocket, title: "Entrepreneurship & Freelancing",
    description: "Spark startup ideas, validate them, build MVPs, and grow your founder identity.",
    features: ["Startup Sparks", "MVP Builder", "Founder Profiling", "Mindset Builder", "Startup Lab"],
    color: "border-terracotta", bgColor: "bg-terracotta/5", iconBg: "bg-terracotta", featureColor: "text-terracotta",
  },
  {
    value: "both", icon: Sparkles, title: "Both",
    description: "Explore how your career skills can support a venture, and how entrepreneurial thinking can accelerate your career.",
    features: ["Career + Startup tools", "Cross-path insights", "Unified dashboard", "Combined action plans", "Dual communities"],
    color: "border-indigo", bgColor: "bg-indigo/5", iconBg: "bg-indigo", featureColor: "text-indigo",
  },
];

const IntentSelection = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) return;
    await updateProfile({ active_intent: selected as any, onboarding_status: "guided" as any });
    navigate("/onboarding/guided");
  };

  return (
    <div className="min-h-screen bg-[hsl(60,14%,98%)] flex flex-col">
      <OnboardingProgressBar progress={35} />
      <OnboardingRewardBanner currentProgress={35} />

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full space-y-8"
        >
          <div className="text-center space-y-2">
            <p className="font-body text-sm text-terracotta font-semibold uppercase tracking-wider">Step 2 of 4</p>
            <h1 className="font-display text-4xl text-[hsl(230,40%,25%)]">What's your focus?</h1>
            <p className="font-body text-muted-foreground">You can switch between paths anytime without losing progress.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {intents.map((intent, i) => {
              const isSelected = selected === intent.value;
              return (
                <motion.button
                  key={intent.value}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  onClick={() => setSelected(intent.value)}
                  className={`text-left p-6 rounded-xl border-2 transition-all ${
                    isSelected ? `${intent.color} ${intent.bgColor} shadow-accent` : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${isSelected ? intent.iconBg : "bg-muted"}`}>
                    <intent.icon size={28} className={isSelected ? "text-primary-foreground" : "text-muted-foreground"} />
                  </div>
                  <h3 className="font-display text-xl text-foreground">{intent.title}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-2">{intent.description}</p>
                  <ul className="mt-4 space-y-1">
                    {intent.features.map((f) => (
                      <li key={f} className={`font-body text-xs font-medium ${isSelected ? intent.featureColor : "text-primary"}`}>• {f}</li>
                    ))}
                  </ul>
                </motion.button>
              );
            })}
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => navigate("/onboarding/user-type")} className="font-body">
              <ArrowLeft size={18} /> Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selected}
              className="bg-[hsl(230,40%,25%)] text-[hsl(45,80%,65%)] rounded-full px-8 font-body font-semibold hover:bg-[hsl(230,40%,20%)] disabled:opacity-50"
            >
              Continue <ArrowRight size={18} />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IntentSelection;
