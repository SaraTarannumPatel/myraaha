import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { GraduationCap, School, Briefcase, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const userTypes = [
  {
    value: "school" as const,
    icon: School,
    title: "School Student",
    age: "Ages 13–17",
    description: "Exploring interests, building early skills, and finding your spark.",
  },
  {
    value: "college" as const,
    icon: GraduationCap,
    title: "College Student",
    age: "Ages 18–24",
    description: "Building expertise, creating projects, and preparing for your career.",
  },
  {
    value: "transitioner" as const,
    icon: Briefcase,
    title: "Career Transitioner",
    age: "Age 25+",
    description: "Pivoting careers, upskilling, or launching your own venture.",
  },
];

const UserTypeSelection = () => {
  const [selected, setSelected] = useState<"school" | "college" | "transitioner" | null>(null);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selected) return;
    await updateProfile({ user_type: selected, onboarding_status: "intent" });
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
          <p className="font-body text-sm text-accent font-semibold uppercase tracking-wider">Step 1 of 2</p>
          <h1 className="font-display text-4xl text-foreground">Where are you in your journey?</h1>
          <p className="font-body text-muted-foreground">This helps us calibrate your experience.</p>
        </div>

        <div className="grid gap-4">
          {userTypes.map((type, i) => (
            <motion.button
              key={type.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(type.value)}
              className={`w-full text-left p-6 rounded-xl border-2 transition-all flex items-start gap-4 ${
                selected === type.value
                  ? "border-accent bg-accent/5 shadow-accent"
                  : "border-border bg-card hover:border-accent/30"
              }`}
            >
              <div className={`p-3 rounded-lg ${selected === type.value ? "gradient-warm" : "bg-muted"}`}>
                <type.icon size={24} className={selected === type.value ? "text-secondary-foreground" : "text-muted-foreground"} />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">{type.title}</h3>
                <p className="font-body text-sm text-accent font-medium">{type.age}</p>
                <p className="font-body text-sm text-muted-foreground mt-1">{type.description}</p>
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
            className="gradient-warm text-secondary-foreground rounded-full px-8 font-body font-semibold shadow-accent disabled:opacity-50"
          >
            Continue <ArrowRight size={18} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default UserTypeSelection;
