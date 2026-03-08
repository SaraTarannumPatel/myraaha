import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Rocket, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const intents = [
  {
    value: "career" as const,
    icon: Briefcase,
    title: "Career & Jobs",
    description: "Discover your ideal career path, build skills, create a Living Resume, and connect with opportunities.",
    features: ["Curiosity Compass", "AI Roadmaps", "SelfGraph™", "Living Resume", "Inspiration Layer"],
  },
  {
    value: "entrepreneurship" as const,
    icon: Rocket,
    title: "Entrepreneurship",
    description: "Spark startup ideas, validate them, build MVPs, and grow your founder identity.",
    features: ["Startup Sparks", "MVP Builder", "Founder Profiling", "Mindset Builder", "Startup Creation Lab"],
  },
];

const IntentSelection = () => {
  const [selected, setSelected] = useState<"career" | "entrepreneurship" | null>(null);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) return;
    await updateProfile({ active_intent: selected, onboarding_status: "complete" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <p className="font-body text-sm text-accent font-semibold uppercase tracking-wider">Step 2 of 2</p>
          <h1 className="font-display text-4xl text-foreground">What's your focus?</h1>
          <p className="font-body text-muted-foreground">You can switch between tracks anytime.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {intents.map((intent, i) => (
            <motion.button
              key={intent.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              onClick={() => setSelected(intent.value)}
              className={`text-left p-6 rounded-xl border-2 transition-all ${
                selected === intent.value
                  ? "border-accent bg-accent/5 shadow-accent"
                  : "border-border bg-card hover:border-accent/30"
              }`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${selected === intent.value ? "gradient-warm" : "bg-muted"}`}>
                <intent.icon size={28} className={selected === intent.value ? "text-secondary-foreground" : "text-muted-foreground"} />
              </div>
              <h3 className="font-display text-2xl text-foreground">{intent.title}</h3>
              <p className="font-body text-sm text-muted-foreground mt-2">{intent.description}</p>
              <ul className="mt-4 space-y-1">
                {intent.features.map((f) => (
                  <li key={f} className="font-body text-xs text-accent font-medium">• {f}</li>
                ))}
              </ul>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => navigate("/onboarding/user-type")} className="font-body">
            <ArrowLeft size={18} /> Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selected}
            className="gradient-warm text-secondary-foreground rounded-full px-8 font-body font-semibold shadow-accent disabled:opacity-50"
          >
            Enter Dashboard <ArrowRight size={18} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default IntentSelection;
