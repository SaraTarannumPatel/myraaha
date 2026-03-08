import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft, MapPin, GraduationCap, Briefcase, Target } from "lucide-react";

const educationLevels = ["High School", "Undergraduate", "Postgraduate", "Doctorate", "Self-taught", "Other"];
const industries = [
  "Technology", "Healthcare", "Finance", "Education", "Arts & Design",
  "Marketing", "Engineering", "Science", "Social Impact", "Media",
  "Consulting", "Retail", "Manufacturing", "Other"
];

const PersonalInfo = () => {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    age: profile?.age?.toString() || "",
    location: (profile as any)?.location || "",
    education_level: (profile as any)?.education_level || "",
    industry: (profile as any)?.industry || "",
    career_stage: (profile as any)?.career_stage || "",
    short_term_goals: (profile as any)?.short_term_goals || "",
    long_term_goals: (profile as any)?.long_term_goals || "",
  });

  const handleContinue = async () => {
    await updateProfile({
      age: form.age ? parseInt(form.age) : null,
      ...({
        location: form.location || null,
        education_level: form.education_level || null,
        industry: form.industry || null,
        career_stage: form.career_stage || null,
        short_term_goals: form.short_term_goals || null,
        long_term_goals: form.long_term_goals || null,
        onboarding_status: "consent",
      } as any),
    });
    navigate("/onboarding/consent");
  };

  const handleSkip = async () => {
    await updateProfile({ onboarding_status: "consent" } as any);
    navigate("/onboarding/consent");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <p className="font-body text-sm text-indigo font-semibold uppercase tracking-wider">Step 3 of 4</p>
          <h1 className="font-display text-4xl text-foreground">Tell us about yourself</h1>
          <p className="font-body text-muted-foreground">This helps personalize your experience. You can skip and fill this in later.</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body flex items-center gap-2">
                <MapPin size={14} className="text-blue" /> Age
              </Label>
              <Input
                type="number"
                placeholder="Your age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                min={13}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body flex items-center gap-2">
                <MapPin size={14} className="text-blue" /> Location
              </Label>
              <Input
                placeholder="City, State"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body flex items-center gap-2">
              <GraduationCap size={14} className="text-indigo" /> Education Level
            </Label>
            <div className="flex flex-wrap gap-2">
              {educationLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setForm({ ...form, education_level: level })}
                  className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${
                    form.education_level === level
                      ? "bg-indigo text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body flex items-center gap-2">
              <Briefcase size={14} className="text-terracotta" /> Industry / Domain of Interest
            </Label>
            <div className="flex flex-wrap gap-2">
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setForm({ ...form, industry: ind })}
                  className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${
                    form.industry === ind
                      ? "bg-terracotta text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body flex items-center gap-2">
              <Target size={14} className="text-maroon" /> Short-term Goals
            </Label>
            <Textarea
              placeholder="What do you want to achieve in the next 3–6 months?"
              value={form.short_term_goals}
              onChange={(e) => setForm({ ...form, short_term_goals: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body flex items-center gap-2">
              <Target size={14} className="text-primary" /> Long-term Vision
            </Label>
            <Textarea
              placeholder="Where do you see yourself in 2–5 years?"
              value={form.long_term_goals}
              onChange={(e) => setForm({ ...form, long_term_goals: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => navigate("/onboarding/guided")} className="font-body">
            <ArrowLeft size={18} /> Back
          </Button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleSkip} className="font-body text-muted-foreground">
              Skip for now
            </Button>
            <Button
              onClick={handleContinue}
              className="gradient-warm text-primary-foreground rounded-full px-8 font-body font-semibold shadow-accent"
            >
              Continue <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalInfo;
