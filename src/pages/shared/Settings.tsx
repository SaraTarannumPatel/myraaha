import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save, User } from "lucide-react";

const Settings = () => {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    age: profile?.age?.toString() || "",
  });

  const save = async () => {
    await updateProfile({
      full_name: form.full_name,
      bio: form.bio,
      age: form.age ? parseInt(form.age) : null,
    } as any);
    toast.success("Settings saved!");
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <SettingsIcon size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Settings</h1>
            <p className="font-body text-sm text-muted-foreground">Manage your account</p>
          </div>
        </div>
      </motion.div>

      <div className="bg-card rounded-xl border border-border p-6 space-y-5">
        <h2 className="font-display text-xl text-foreground">Profile</h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full gradient-warm flex items-center justify-center text-secondary-foreground font-display text-2xl">
            {form.full_name?.charAt(0) || <User size={24} />}
          </div>
          <div>
            <p className="font-body text-sm text-foreground font-medium">{form.full_name || "Your Name"}</p>
            <p className="font-body text-xs text-muted-foreground capitalize">{profile?.user_type || "User"} · {profile?.active_intent || "Career"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-foreground">Full Name</label>
          <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-foreground">Age</label>
          <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="font-body text-sm font-medium text-foreground">Bio</label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Tell us about yourself..." />
        </div>
        <Button onClick={save} className="gradient-warm text-secondary-foreground">
          <Save size={18} /> Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
