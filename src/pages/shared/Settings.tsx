import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings as SettingsIcon, User, Shield, ArrowLeftRight } from "lucide-react";

const educationLevels = ["High School", "Undergraduate", "Postgraduate", "Doctorate", "Self-taught", "Other"];
const industries = [
  "Technology", "Healthcare", "Finance", "Education", "Arts & Design",
  "Marketing", "Engineering", "Science", "Social Impact", "Media",
  "Consulting", "Retail", "Manufacturing", "Other"
];

const Settings = () => {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    age: profile?.age?.toString() || "",
    location: (profile as any)?.location || "",
    education_level: (profile as any)?.education_level || "",
    industry: (profile as any)?.industry || "",
    short_term_goals: (profile as any)?.short_term_goals || "",
    long_term_goals: (profile as any)?.long_term_goals || "",
  });
  const [consentData, setConsentData] = useState((profile as any)?.consent_data_usage || false);
  const [consentMentor, setConsentMentor] = useState((profile as any)?.consent_mentor_sharing || false);

  const save = async () => {
    await updateProfile({
      full_name: form.full_name,
      bio: form.bio,
      age: form.age ? parseInt(form.age) : null,
      ...({
        location: form.location || null,
        education_level: form.education_level || null,
        industry: form.industry || null,
        short_term_goals: form.short_term_goals || null,
        long_term_goals: form.long_term_goals || null,
        consent_data_usage: consentData,
        consent_mentor_sharing: consentMentor,
      } as any),
    });
    toast.success("Settings saved!");
  };

  const switchIntent = async (intent: string) => {
    await updateProfile({ active_intent: intent } as any);
    toast.success(`Switched to ${intent === "both" ? "Both" : intent === "career" ? "Career" : "Entrepreneurship"}`);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <SettingsIcon size={20} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Settings</h1>
            <p className="font-body text-sm text-muted-foreground">Manage your profile and preferences</p>
          </div>
        </div>
      </motion.div>

      {/* Profile */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full gradient-warm flex items-center justify-center text-primary-foreground font-display text-2xl">
            {profile?.full_name?.charAt(0) || <User size={24} />}
          </div>
          <div>
            <p className="font-display text-xl text-foreground">{profile?.full_name || "Your Name"}</p>
            <p className="font-body text-xs text-muted-foreground capitalize">
              {profile?.user_type?.replace("_", " ")} • {profile?.active_intent === "both" ? "Career & Entrepreneurship" : profile?.active_intent}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body">Full Name</Label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Age</Label>
              <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body">Location</Label>
              <Input placeholder="City, State" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Education</Label>
              <div className="flex flex-wrap gap-1.5">
                {educationLevels.map((level) => (
                  <button key={level} onClick={() => setForm({ ...form, education_level: level })}
                    className={`px-2.5 py-1 rounded-full font-body text-[11px] transition-all ${form.education_level === level ? "gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-body">Industry</Label>
            <div className="flex flex-wrap gap-1.5">
              {industries.map((ind) => (
                <button key={ind} onClick={() => setForm({ ...form, industry: ind })}
                  className={`px-2.5 py-1 rounded-full font-body text-[11px] transition-all ${form.industry === ind ? "gradient-warm text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {ind}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-body">Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body">Short-term Goals</Label>
              <Textarea value={form.short_term_goals} onChange={(e) => setForm({ ...form, short_term_goals: e.target.value })} rows={2} />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Long-term Vision</Label>
              <Textarea value={form.long_term_goals} onChange={(e) => setForm({ ...form, long_term_goals: e.target.value })} rows={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Path Selection */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
          <ArrowLeftRight size={18} className="text-primary" /> Active Path
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { value: "career", label: "Career & Jobs" },
            { value: "entrepreneurship", label: "Entrepreneurship" },
            { value: "both", label: "Both" },
          ].map((opt) => (
            <button key={opt.value} onClick={() => switchIntent(opt.value)}
              className={`px-4 py-2 rounded-full font-body text-sm transition-all ${profile?.active_intent === opt.value ? "gradient-warm text-primary-foreground shadow-accent" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
          <Shield size={18} className="text-primary" /> Privacy & Data
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-foreground">Personalized Recommendations</p>
              <p className="font-body text-xs text-muted-foreground">Use your data for AI insights</p>
            </div>
            <button onClick={() => setConsentData(!consentData)}
              className={`w-12 h-6 rounded-full transition-colors ${consentData ? "bg-primary" : "bg-muted"}`}>
              <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${consentData ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-foreground">Mentor & Community Sharing</p>
              <p className="font-body text-xs text-muted-foreground">Share profile with mentors and groups</p>
            </div>
            <button onClick={() => setConsentMentor(!consentMentor)}
              className={`w-12 h-6 rounded-full transition-colors ${consentMentor ? "bg-primary" : "bg-muted"}`}>
              <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${consentMentor ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      <Button onClick={save} className="gradient-warm text-primary-foreground rounded-full px-8 font-body font-semibold shadow-accent">
        Save Settings
      </Button>
    </div>
  );
};

export default Settings;
