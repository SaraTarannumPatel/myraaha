import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Save, Sparkles } from "lucide-react";

const FounderProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    founder_type: "",
    strengths: "",
    weaknesses: "",
    experience_level: "beginner",
    industries: "",
    looking_for: "",
    pitch: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("founder_profiles")
      .select("*")
      .eq("user_id", user!.id)
      .single();
    if (data) {
      setProfile(data);
      setForm({
        founder_type: data.founder_type || "",
        strengths: (data.strengths || []).join(", "),
        weaknesses: (data.weaknesses || []).join(", "),
        experience_level: data.experience_level || "beginner",
        industries: (data.industries || []).join(", "),
        looking_for: (data.looking_for || []).join(", "),
        pitch: data.pitch || "",
      });
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    const payload = {
      user_id: user!.id,
      founder_type: form.founder_type,
      strengths: form.strengths.split(",").map(s => s.trim()).filter(Boolean),
      weaknesses: form.weaknesses.split(",").map(s => s.trim()).filter(Boolean),
      experience_level: form.experience_level,
      industries: form.industries.split(",").map(s => s.trim()).filter(Boolean),
      looking_for: form.looking_for.split(",").map(s => s.trim()).filter(Boolean),
      pitch: form.pitch,
    };

    if (profile) {
      const { error } = await supabase.from("founder_profiles").update(payload).eq("id", profile.id);
      if (error) { toast.error("Failed to update"); return; }
    } else {
      const { error } = await supabase.from("founder_profiles").insert(payload);
      if (error) { toast.error("Failed to create profile"); return; }
    }
    fetchProfile();
    toast.success("Founder profile saved!");
  };

  if (loading) return <div className="text-center py-12"><div className="animate-pulse font-body text-muted-foreground">Loading...</div></div>;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <User size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Founder Profile</h1>
            <p className="font-body text-sm text-muted-foreground">Define your founder identity and what you bring to the table</p>
          </div>
        </div>
      </motion.div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="font-body text-sm font-medium text-foreground">Founder Type</label>
            <select
              value={form.founder_type}
              onChange={(e) => setForm({ ...form, founder_type: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
            >
              <option value="">Select...</option>
              <option value="technical">Technical Founder</option>
              <option value="business">Business Founder</option>
              <option value="creative">Creative Founder</option>
              <option value="hybrid">Hybrid Founder</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-body text-sm font-medium text-foreground">Experience Level</label>
            <select
              value={form.experience_level}
              onChange={(e) => setForm({ ...form, experience_level: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
            >
              <option value="beginner">First-time Founder</option>
              <option value="intermediate">Some Experience</option>
              <option value="experienced">Serial Entrepreneur</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-foreground">Strengths (comma-separated)</label>
          <Input placeholder="e.g., Product Design, Fundraising, Engineering" value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-foreground">Areas to Improve (comma-separated)</label>
          <Input placeholder="e.g., Marketing, Sales, Finance" value={form.weaknesses} onChange={(e) => setForm({ ...form, weaknesses: e.target.value })} />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-foreground">Industries of Interest (comma-separated)</label>
          <Input placeholder="e.g., EdTech, HealthTech, FinTech" value={form.industries} onChange={(e) => setForm({ ...form, industries: e.target.value })} />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-foreground">Looking For (comma-separated)</label>
          <Input placeholder="e.g., Co-founder, Mentor, Investor, Feedback" value={form.looking_for} onChange={(e) => setForm({ ...form, looking_for: e.target.value })} />
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-foreground">Your Elevator Pitch</label>
          <Textarea placeholder="Describe yourself as a founder in 2-3 sentences..." value={form.pitch} onChange={(e) => setForm({ ...form, pitch: e.target.value })} rows={3} />
        </div>

        <Button onClick={saveProfile} className="gradient-warm text-secondary-foreground">
          <Save size={18} /> Save Profile
        </Button>
      </div>
    </div>
  );
};

export default FounderProfile;
