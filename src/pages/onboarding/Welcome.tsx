import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Compass, Rocket, Sparkles } from "lucide-react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";

const Welcome = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();

  const handleContinue = async () => {
    const savedPath = localStorage.getItem("myraaha_initial_path");
    if (savedPath && (savedPath === "career" || savedPath === "entrepreneurship" || savedPath === "both")) {
      await updateProfile({ active_intent: savedPath as any, onboarding_status: "user_type" as any });
    } else {
      await updateProfile({ onboarding_status: "user_type" as any });
    }
    navigate("/onboarding/user-type");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingProgressBar progress={10} />
      <OnboardingRewardBanner currentProgress={10} />

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 py-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-lg w-full text-center space-y-3 sm:space-y-4"
        >
          <div className="space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto flex items-center justify-center shadow-accent bg-primary"
            >
              <Sparkles className="text-accent" size={32} />
            </motion.div>
            <h1 className="onboarding-welcome-headline text-primary mt-5 sm:mt-6">
              Welcome to <em className="highlight-mark">MyRaaha</em>
            </h1>
            <p className="onboarding-welcome-desc text-foreground/70 mt-3 sm:mt-4">
              Hey{profile?.full_name ? `, ${profile.full_name}` : ""}! Let's set up your personalized journey in just a few steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: Compass, title: "Clarity", desc: "Understand your strengths & direction", color: "text-blue", bg: "bg-blue/10", borderColor: "border-blue/20" },
              { icon: Rocket, title: "Action", desc: "Build skills & validate paths", color: "text-terracotta", bg: "bg-terracotta/10", borderColor: "border-terracotta/20" },
              { icon: Sparkles, title: "Outcome", desc: "Real results through AI guidance", color: "text-indigo", bg: "bg-indigo/10", borderColor: "border-indigo/20" },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className={`bg-card rounded-xl p-4 shadow-soft border ${item.borderColor}`}
              >
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <h3 className="choice-card-title text-foreground">{item.title}</h3>
                <p className="choice-card-desc text-muted-foreground mt-0.5">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            className="bg-primary text-accent rounded-full h-12 px-8 font-body font-semibold text-base hover:bg-primary"
          >
            Let's Go <ArrowRight size={18} />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
