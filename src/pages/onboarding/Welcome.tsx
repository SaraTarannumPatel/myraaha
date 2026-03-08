import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Compass, Rocket, Sparkles } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();

  const handleContinue = async () => {
    // Apply the pre-auth path selection if available
    const savedPath = localStorage.getItem("shuttlex_initial_path");
    if (savedPath && (savedPath === "career" || savedPath === "entrepreneurship" || savedPath === "both")) {
      await updateProfile({ active_intent: savedPath as any, onboarding_status: "user_type" as any });
    } else {
      await updateProfile({ onboarding_status: "user_type" as any });
    }
    navigate("/onboarding/user-type");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-lg w-full text-center space-y-8"
      >
        <div className="space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 gradient-warm rounded-2xl mx-auto flex items-center justify-center shadow-accent"
          >
            <Sparkles className="text-primary-foreground" size={36} />
          </motion.div>
          <h1 className="font-display text-5xl text-foreground mt-6">
            Welcome to <em className="text-gradient-warm">ShuttlEx</em>
          </h1>
          <p className="font-body text-muted-foreground text-lg mt-4">
            Hey{profile?.full_name ? `, ${profile.full_name}` : ""}! Let's set up your personalized journey in just a few steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { icon: Compass, title: "Discover", desc: "Find your passions & strengths" },
            { icon: Rocket, title: "Build", desc: "Create real projects & skills" },
            { icon: Sparkles, title: "Evolve", desc: "Grow through AI-powered guidance" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="bg-card rounded-xl p-4 shadow-soft border border-border"
            >
              <item.icon size={24} className="text-primary mb-2" />
              <h3 className="font-display text-lg text-foreground">{item.title}</h3>
              <p className="font-body text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          className="gradient-warm text-primary-foreground rounded-full h-12 px-8 font-body font-semibold text-base shadow-accent"
        >
          Let's Go <ArrowRight size={18} />
        </Button>
      </motion.div>
    </div>
  );
};

export default Welcome;
