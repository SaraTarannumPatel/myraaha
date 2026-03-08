import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, School, Briefcase, Rocket, Laptop, HelpCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const userTypes = [
  {
    value: "school",
    icon: School,
    title: "Student (School)",
    description: "Exploring interests, building early skills, and finding your spark.",
  },
  {
    value: "college",
    icon: GraduationCap,
    title: "Student (College / Postgrad)",
    description: "Building expertise, creating projects, and preparing for your career or venture.",
  },
  {
    value: "working_professional",
    icon: Briefcase,
    title: "Working Professional",
    description: "Upskilling, exploring lateral moves, or planning your next big career step.",
  },
  {
    value: "transitioner",
    icon: Briefcase,
    title: "Career Transitioner",
    description: "Pivoting careers, reskilling, or exploring entirely new directions.",
  },
  {
    value: "aspiring_entrepreneur",
    icon: Rocket,
    title: "Aspiring Entrepreneur",
    description: "Turning ideas into startups, validating concepts, and building from scratch.",
  },
  {
    value: "freelancer",
    icon: Laptop,
    title: "Freelancer / Consultant",
    description: "Building a personal brand, finding clients, and growing your independent practice.",
  },
  {
    value: "other",
    icon: HelpCircle,
    title: "Other",
    description: "Your path is unique — ShuttlEx adapts to however you want to grow.",
  },
];

const UserTypeSelection = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) return;
    await updateProfile({ user_type: selected as any, onboarding_status: "intent" as any });
    navigate("/onboarding/intent");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <p className="font-body text-sm text-primary font-semibold uppercase tracking-wider">Step 1 of 4</p>
          <h1 className="font-display text-4xl text-foreground">Where are you in your journey?</h1>
          <p className="font-body text-muted-foreground">This helps us calibrate your experience.</p>
        </div>

        <div className="grid gap-3">
          {userTypes.map((type, i) => (
            <motion.button
              key={type.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setSelected(type.value)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-start gap-4 ${
                selected === type.value
                  ? "border-primary bg-primary/5 shadow-accent"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className={`p-2.5 rounded-lg ${selected === type.value ? "gradient-warm" : "bg-muted"}`}>
                <type.icon size={20} className={selected === type.value ? "text-primary-foreground" : "text-muted-foreground"} />
              </div>
              <div>
                <h3 className="font-display text-lg text-foreground">{type.title}</h3>
                <p className="font-body text-sm text-muted-foreground mt-0.5">{type.description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => navigate("/onboarding")} className="font-body">
            <ArrowLeft size={18} /> Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selected}
            className="gradient-warm text-primary-foreground rounded-full px-8 font-body font-semibold shadow-accent disabled:opacity-50"
          >
            Continue <ArrowRight size={18} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserTypeSelection;
