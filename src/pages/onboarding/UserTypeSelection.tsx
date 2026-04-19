import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, School, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";

const userTypes = [
  { value: "school", icon: School, title: "Student (School)", description: "Exploring interests, building early skills, and finding your spark.", color: "border-blue/30", selectedColor: "border-blue bg-blue/5", iconBg: "bg-blue/10", iconSelectedBg: "bg-blue", iconColor: "text-blue" },
  { value: "college", icon: GraduationCap, title: "Student (College / Postgrad)", description: "Building expertise, creating projects, and preparing for your career or venture.", color: "border-indigo/30", selectedColor: "border-indigo bg-indigo/5", iconBg: "bg-indigo/10", iconSelectedBg: "bg-indigo", iconColor: "text-indigo" },
  { value: "working_professional", icon: Briefcase, title: "Working Professional", description: "Upskilling, exploring lateral moves, or planning your next big career step.", color: "border-primary/30", selectedColor: "border-primary bg-primary/5", iconBg: "bg-primary/10", iconSelectedBg: "bg-[hsl(270 96% 48%)]", iconColor: "text-primary" },
];

const UserTypeSelection = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) return;
    await updateProfile({ user_type: selected as any, onboarding_status: "journey_discovery" as any });
    navigate("/onboarding/journey");
  };

  return (
    <div className="min-h-screen bg-[hsl(0 0% 100%)] flex flex-col">
      <OnboardingProgressBar progress={20} />
      <OnboardingRewardBanner currentProgress={20} />

      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full space-y-8"
        >
          <div className="text-center space-y-2">
            <p className="font-body text-sm text-blue font-semibold uppercase tracking-wider">Step 1 of 4</p>
            <h1 className="font-display text-4xl text-[hsl(270 96% 30%)]">Where are you in your journey?</h1>
            <p className="font-body text-muted-foreground">This helps us calibrate your experience.</p>
          </div>

          <div className="grid gap-3">
            {userTypes.map((type, i) => {
              const isSelected = selected === type.value;
              return (
                <motion.button
                  key={type.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelected(type.value)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-start gap-4 ${
                    isSelected ? `${type.selectedColor} shadow-accent` : `${type.color} bg-card hover:border-primary/30`
                  }`}
                >
                  <div className={`p-2.5 rounded-lg ${isSelected ? type.iconSelectedBg : type.iconBg}`}>
                    <type.icon size={20} className={isSelected ? "text-primary-foreground" : type.iconColor} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">{type.title}</h3>
                    <p className="font-body text-sm text-muted-foreground mt-0.5">{type.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => navigate("/onboarding")} className="font-body">
              <ArrowLeft size={18} /> Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selected}
              className="bg-[hsl(270 96% 30%)] text-[hsl(48 92% 72%)] rounded-full px-8 font-body font-semibold hover:bg-[hsl(270 96% 18%)] disabled:opacity-50"
            >
              Continue <ArrowRight size={18} />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
