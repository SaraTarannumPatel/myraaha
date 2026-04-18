import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, ArrowLeft, User, Users,
  Calendar, GraduationCap, BookOpen, Monitor, Zap,
  Bot, Clock, Timer, MapPin, Languages, CheckCircle2
} from "lucide-react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";

interface DemographicQuestion {
  id: string;
  section: string;
  question: string;
  icon: any;
  iconColor: string;
  type: "text" | "single" | "multi";
  placeholder?: string;
  options?: { label: string; value: string }[];
  maxSelect?: number;
  required: boolean;
  inputType?: string;
}

const demographicQuestions: DemographicQuestion[] = [
  {
    id: "full_name",
    section: "Basic Identification",
    question: "What should we call you? 👋",
    icon: User,
    iconColor: "text-blue",
    type: "text",
    placeholder: "Your full name",
    required: true,
  },
  {
    id: "gender_identity",
    section: "Basic Identification",
    question: "How do you identify? 🌈",
    icon: Users,
    iconColor: "text-accent-foreground",
    type: "single",
    options: [
      { label: "Female", value: "female" },
      { label: "Male", value: "male" },
      { label: "Non-binary", value: "non_binary" },
      { label: "Prefer not to say", value: "prefer_not_to_say" },
    ],
    required: true,
  },
  {
    id: "age_group",
    section: "Age & Life Stage",
    question: "Which age group do you fall into? 🎂",
    icon: Calendar,
    iconColor: "text-blue",
    type: "single",
    options: [
      { label: "15–16", value: "15-16" },
      { label: "17–18", value: "17-18" },
      { label: "19–23", value: "19-23" },
    ],
    required: true,
  },
  {
    id: "life_stage",
    section: "Age & Life Stage",
    question: "Which best describes your current stage? 🎯",
    icon: GraduationCap,
    iconColor: "text-indigo",
    type: "single",
    options: [
      { label: "School (8–9)", value: "school_8_9" },
      { label: "School (10–12)", value: "school_10_12" },
      { label: "Undergraduate", value: "undergraduate" },
      { label: "Exploring without formal education", value: "exploring" },
    ],
    required: true,
  },
  {
    id: "academic_stream",
    section: "Educational Path",
    question: "What stream or field are/were you primarily studying? 📚",
    icon: BookOpen,
    iconColor: "text-primary",
    type: "single",
    options: [
      { label: "Science", value: "science" },
      { label: "Commerce", value: "commerce" },
      { label: "Arts / Humanities", value: "arts_humanities" },
      { label: "Vocational / Skill-based", value: "vocational" },
      { label: "Multidisciplinary", value: "multidisciplinary" },
      { label: "Not applicable / unsure", value: "not_applicable" },
    ],
    required: true,
  },
  {
    id: "highest_education",
    section: "Educational Path",
    question: "Highest level of education completed? 🎓",
    icon: GraduationCap,
    iconColor: "text-blue",
    type: "single",
    options: [
      { label: "Up to Class 8", value: "class_8" },
      { label: "Class 9–10", value: "class_9_10" },
      { label: "Class 11–12", value: "class_11_12" },
      { label: "Diploma", value: "diploma" },
      { label: "Undergraduate", value: "undergraduate" },
    ],
    required: true,
  },
  {
    id: "primary_device",
    section: "Access & Digital Comfort",
    question: "What's your primary device for learning? 💻",
    icon: Monitor,
    iconColor: "text-indigo",
    type: "single",
    options: [
      { label: "Smartphone (personal)", value: "smartphone_personal" },
      { label: "Smartphone (shared)", value: "smartphone_shared" },
      { label: "Laptop / Desktop", value: "laptop" },
      { label: "Public computer", value: "public_computer" },
      { label: "Limited access", value: "limited_access" },
    ],
    required: true,
  },
  {
    id: "digital_comfort",
    section: "Access & Digital Comfort",
    question: "How comfortable are you using digital tools for learning? 🖥️",
    icon: Zap,
    iconColor: "text-primary",
    type: "single",
    options: [
      { label: "Very comfortable", value: "very_comfortable" },
      { label: "Comfortable", value: "comfortable" },
      { label: "Somewhat unsure", value: "somewhat_unsure" },
      { label: "Not very comfortable", value: "not_comfortable" },
    ],
    required: true,
  },
  {
    id: "ai_comfort",
    section: "Access & Digital Comfort",
    question: "How comfortable are you using AI-based tools for learning or guidance? 🤖",
    icon: Bot,
    iconColor: "text-accent-foreground",
    type: "single",
    options: [
      { label: "Very comfortable", value: "very_comfortable" },
      { label: "Somewhat comfortable", value: "somewhat_comfortable" },
      { label: "Curious but unsure", value: "curious_unsure" },
      { label: "Uncomfortable", value: "uncomfortable" },
    ],
    required: true,
  },
  {
    id: "time_commitment",
    section: "Time & Responsibility",
    question: "Which best describes your current weekly schedule? ⏰",
    icon: Clock,
    iconColor: "text-blue",
    type: "single",
    options: [
      { label: "Mostly free / flexible", value: "flexible" },
      { label: "Regular classes", value: "regular_classes" },
      { label: "Classes + part-time work", value: "classes_parttime" },
      { label: "Full-time work", value: "fulltime_work" },
      { label: "Irregular / unpredictable", value: "irregular" },
    ],
    required: true,
  },
  {
    id: "weekly_hours",
    section: "Time & Responsibility",
    question: "How much time can you realistically dedicate per week right now? ⏱️",
    icon: Timer,
    iconColor: "text-indigo",
    type: "single",
    options: [
      { label: "Less than 3 hrs", value: "less_3" },
      { label: "3–6 hrs", value: "3_6" },
      { label: "6–10 hrs", value: "6_10" },
      { label: "10+ hrs", value: "10_plus" },
    ],
    required: true,
  },
  {
    id: "date_of_birth",
    section: "Geography & Language",
    question: "When were you born? 🎂",
    icon: Calendar,
    iconColor: "text-blue",
    type: "text",
    placeholder: "YYYY-MM-DD",
    inputType: "date",
    required: true,
  },
  {
    id: "location",
    section: "Geography & Language",
    question: "Where are you located? 📍",
    icon: MapPin,
    iconColor: "text-primary",
    type: "text",
    placeholder: "City, State",
    required: true,
  },
  {
    id: "location_type",
    section: "Geography & Language",
    question: "What type of area do you currently live in? 📍",
    icon: MapPin,
    iconColor: "text-primary",
    type: "single",
    options: [
      { label: "Metro city", value: "metro" },
      { label: "Tier 1 city", value: "tier_1" },
      { label: "Tier 2 city", value: "tier_2" },
      { label: "Tier 3 city", value: "tier_3" },
      { label: "Rural area", value: "rural" },
    ],
    required: true,
  },
  {
    id: "preferred_language",
    section: "Geography & Language",
    question: "What's your preferred learning language? 🗣️",
    icon: Languages,
    iconColor: "text-accent-foreground",
    type: "single",
    options: [
      { label: "English", value: "english" },
      { label: "Hindi", value: "hindi" },
      { label: "Hinglish", value: "hinglish" },
      { label: "Regional language", value: "regional" },
    ],
    required: true,
  },
];

const JourneyDiscovery = () => {
  const { profile, updateProfile, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (profile?.full_name) initial.full_name = profile.full_name;
    return initial;
  });

  const currentQ = demographicQuestions[step];
  const totalSteps = demographicQuestions.length;
  const progressPercent = 25 + Math.round((step / totalSteps) * 40);

  const canNext = !!answers[currentQ.id]?.trim();

  const handleTextChange = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  };

  const handleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
  };

  const handleNext = () => {
    if (!canNext) return;
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
    else navigate("/onboarding/user-type");
  };

  const handleFinish = async () => {
    const dob = answers.date_of_birth || null;
    let computedAge: number | null = null;
    if (dob) {
      const d = new Date(dob);
      if (!isNaN(d.getTime())) {
        const diff = Date.now() - d.getTime();
        computedAge = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
      }
    }
    await updateProfile({
      full_name: answers.full_name || profile?.full_name || null,
      age: computedAge,
      ...({ date_of_birth: dob } as any),
      gender_identity: answers.gender_identity || null,
      age_group: answers.age_group || null,
      life_stage: answers.life_stage || null,
      academic_stream: answers.academic_stream || null,
      highest_education: answers.highest_education || null,
      primary_device: answers.primary_device || null,
      digital_comfort: answers.digital_comfort || null,
      ai_comfort: answers.ai_comfort || null,
      time_commitment: answers.time_commitment || null,
      weekly_hours: answers.weekly_hours || null,
      location_type: answers.location_type || null,
      preferred_language: answers.preferred_language || null,
      location: answers.location || null,
      journey_responses: {
        demographic_answers: answers,
        user_type: profile?.user_type,
      },
      onboarding_status: "consent" as any,
    } as any);
    navigate("/onboarding/consent");
  };

  const sectionLabel = currentQ.section;

  return (
    <div className="min-h-screen bg-[hsl(60,14%,98%)] flex flex-col">
      <OnboardingProgressBar progress={progressPercent} />
      <OnboardingRewardBanner currentProgress={progressPercent} />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full space-y-6"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                {sectionLabel}
              </span>
              <span className="font-body text-xs text-muted-foreground">
                {step + 1} / {totalSteps}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`q-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                  <currentQ.icon size={22} className={currentQ.iconColor} />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-[hsl(230,40%,25%)]">
                  {currentQ.question}
                </h1>
              </div>

              {currentQ.type === "text" && (
                <div className="max-w-md mx-auto">
                  <Input
                    type={currentQ.inputType || "text"}
                    placeholder={currentQ.placeholder}
                    value={answers[currentQ.id] || ""}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="h-14 rounded-2xl bg-[hsl(0,0%,85%,0.3)] px-5 font-body text-base border-none focus-visible:ring-2 focus-visible:ring-primary"
                    onKeyDown={(e) => e.key === "Enter" && canNext && handleNext()}
                  />
                </div>
              )}

              {currentQ.type === "single" && currentQ.options && (
                <div className={`${
                  currentQ.options.length > 5
                    ? "flex flex-wrap gap-2.5 justify-center"
                    : "grid gap-3 max-w-md mx-auto"
                }`}>
                  {currentQ.options.map((opt, i) => {
                    const isSelected = answers[currentQ.id] === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleSelect(opt.value)}
                        className={`${
                          currentQ.options!.length > 5
                            ? "px-4 py-2.5 rounded-xl"
                            : "w-full text-left p-4 rounded-xl"
                        } border-2 transition-all font-body text-sm ${
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground font-semibold shadow-sm"
                            : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={14} className="inline mr-1.5 text-primary" />}
                        {opt.label}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={handleBack} className="font-body">
              <ArrowLeft size={18} /> Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canNext}
              className="bg-[hsl(230,40%,25%)] text-[hsl(45,80%,65%)] rounded-full px-8 font-body font-semibold hover:bg-[hsl(230,40%,20%)] disabled:opacity-50"
            >
              {step === totalSteps - 1 ? "Finish" : "Next"} <ArrowRight size={18} />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JourneyDiscovery;
