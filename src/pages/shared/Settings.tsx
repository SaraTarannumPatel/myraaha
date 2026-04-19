import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Settings as SettingsIcon, User, Shield, ArrowLeftRight, Copy,
  Check, IdCard, Lock, Sparkles
} from "lucide-react";

const Settings = () => {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    short_term_goals: (profile as any)?.short_term_goals || "",
    long_term_goals: (profile as any)?.long_term_goals || "",
  });
  const [consentData, setConsentData] = useState((profile as any)?.consent_data_usage || false);
  const [consentMentor, setConsentMentor] = useState((profile as any)?.consent_mentor_sharing || false);
  const [copied, setCopied] = useState(false);

  const uid = profile?.public_uid || "MR-XXXXXX";
  const initials = (profile?.full_name || "U")
    .split(" ")
    .map(s => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const save = async () => {
    await updateProfile({
      full_name: form.full_name,
      bio: form.bio,
      ...({
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

  const copyUID = async () => {
    await navigator.clipboard.writeText(uid);
    setCopied(true);
    toast.success("UID copied!");
    setTimeout(() => setCopied(false), 2000);
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
            <p className="font-body text-sm text-muted-foreground">Your identity, privacy and preferences</p>
          </div>
        </div>
      </motion.div>

      {/* Identity Card — UID + Name */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden border border-border shadow-sm"
      >
        <div className="bg-gradient-to-br from-[hsl(270 96% 30%)] to-[hsl(270 96% 18%)] p-6 relative">
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20">
            <Sparkles size={10} className="text-accent" />
            <span className="font-body text-[10px] uppercase tracking-wider font-bold text-accent">
              MyRaaha ID
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center text-primary font-display text-3xl font-bold border-4 border-white/20">
              {initials}
            </div>
            <div className="flex-1">
              <p className="font-display text-2xl text-white">{profile?.full_name || "Your Name"}</p>
              <button
                onClick={copyUID}
                className="mt-1.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <code className="font-mono text-sm font-bold text-accent tracking-wider">{uid}</code>
                {copied ? (
                  <Check size={14} className="text-accent" />
                ) : (
                  <Copy size={14} className="text-white/70" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card p-4 border-t border-border">
          <p className="font-body text-xs text-muted-foreground flex items-start gap-2">
            <Lock size={12} className="mt-0.5 shrink-0 text-primary" />
            Inside the app, only your <strong className="text-foreground mx-1">name</strong> and
            <strong className="text-foreground mx-1">UID</strong> are visible. Your email, phone, date of
            birth, location and password are stored privately in our backend.
          </p>
        </div>
      </motion.div>

      {/* Public Profile (editable display info) */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-primary" />
          <h2 className="font-display text-xl text-foreground">Public Profile</h2>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-4">
          The only fields visible to other users in the app.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body">Display Name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-body">Bio (optional)</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={2}
              placeholder="A short line about your journey"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body">Short-term Goals</Label>
              <Textarea
                value={form.short_term_goals}
                onChange={(e) => setForm({ ...form, short_term_goals: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body">Long-term Vision</Label>
              <Textarea
                value={form.long_term_goals}
                onChange={(e) => setForm({ ...form, long_term_goals: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Private Info Notice */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <IdCard size={18} className="text-primary" />
          <h2 className="font-display text-xl text-foreground">Private Information</h2>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-4">
          These details were collected during onboarding and are encrypted in the backend. They are never
          displayed inside the app and never shared with other users.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Email", value: "•••••••@•••••" },
            { label: "Phone", value: "+91 ••••• •••••" },
            { label: "Date of Birth", value: "••••-••-••" },
            { label: "Location", value: "•••••••••" },
            { label: "Password", value: "••••••••" },
            { label: "Gender Identity", value: "Hidden" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <span className="font-body text-xs text-muted-foreground">{item.label}</span>
              <span className="font-mono text-xs text-foreground font-semibold">{item.value}</span>
            </div>
          ))}
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
            <button
              key={opt.value}
              onClick={() => switchIntent(opt.value)}
              className={`px-4 py-2 rounded-full font-body text-sm transition-all ${
                profile?.active_intent === opt.value
                  ? "gradient-warm text-primary-foreground shadow-accent"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
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
            <button
              onClick={() => setConsentData(!consentData)}
              className={`w-12 h-6 rounded-full transition-colors ${consentData ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${consentData ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-sm font-medium text-foreground">Mentor & Community Sharing</p>
              <p className="font-body text-xs text-muted-foreground">Share profile with mentors and groups</p>
            </div>
            <button
              onClick={() => setConsentMentor(!consentMentor)}
              className={`w-12 h-6 rounded-full transition-colors ${consentMentor ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-card shadow-sm transition-transform ${consentMentor ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      <Button
        onClick={save}
        className="gradient-warm text-primary-foreground rounded-full px-8 font-body font-semibold shadow-accent"
      >
        Save Settings
      </Button>
    </div>
  );
};

export default Settings;
