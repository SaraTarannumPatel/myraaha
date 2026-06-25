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
  { value: "working_professional", icon: Briefcase, title: "Working Professional", description: "Upskilling, exploring lateral moves, or planning your next big career step.", color: "border-primary/30", selectedColor: "border-primary bg-primary/5", iconBg: "bg-primary/10", iconSelectedBg: "bg-primary", iconColor: "text-primary" },
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
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingProgressBar progress={20} />
      <OnboardingRewardBanner currentProgress={20} />

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 py-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-5"
        >
          <div className="text-center space-y-2">
            <p className="progress-step-label text-[#5500cb] tracking-wider uppercase text-xs font-semibold">Step 1 of 4</p>
            <h1 className="onboarding-step-heading text-primary font-bold text-2xl">Where are you in your journey?</h1>
            <p className="onboarding-step-desc text-muted-foreground mt-1 text-sm">This helps us calibrate your experience.</p>
          </div>

          <div className="grid gap-3.5">
            {userTypes.map((type, i) => {
              const isSelected = selected === type.value;
              return (
                <motion.button
                  key={type.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelected(type.value)}
                  className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                    isSelected 
                      ? "border-[#5500cb] bg-primary/5 shadow-sm" 
                      : "border-gray-200 bg-white hover:border-[#5500cb]/30 hover:bg-gray-50"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl transition-colors ${
                    isSelected ? "bg-[#5500cb] text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    <type.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="choice-card-title text-foreground font-semibold text-base">{type.title}</h3>
                    <p className="choice-card-desc text-muted-foreground mt-1 text-sm leading-relaxed">{type.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" onClick={() => navigate("/onboarding")} className="font-body h-[48px] min-h-[48px] px-4 rounded-full">
              <ArrowLeft size={18} className="mr-1.5" /> Back
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!selected}
              className="bg-[#5500cb] text-white rounded-full h-[52px] min-h-[52px] px-8 font-body font-semibold hover:bg-[#5500cb]/90 disabled:opacity-50"
            >
              Continue <ArrowRight size={18} className="ml-1.5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
