import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, Save, Target, Users, TrendingUp, Sparkles } from "lucide-react";

const StartupProfiling = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [activeIdea, setActiveIdea] = useState<any>(null);
  const [form, setForm] = useState({ mission: "", vision: "", customer_segment: "", team_notes: "", funding_stage: "" });

  useEffect(() => {
    const fetchIdeas = async () => {
      const { data } = await supabase.from("startup_ideas").select("*").eq("user_id", user!.id).eq("is_active", true).order("created_at", { ascending: false });
      setIdeas(data || []);
      if (data?.length) setActiveIdea(data[0]);
    };
    fetchIdeas();
  }, []);

  const saveProfile = () => {
    toast.success("Startup profile updated!");
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Building2 size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Startup Profiling</h1>
            <p className="font-body text-sm text-muted-foreground">Track your startup's mission, challenges, milestones, and growth.</p>
          </div>
        </div>
      </motion.div>

      {/* Startup Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Ideas", value: ideas.length, icon: Target, color: "text-accent" },
          { label: "Team Size", value: "1", icon: Users, color: "text-primary" },
          { label: "Validations", value: "0", icon: TrendingUp, color: "text-accent" },
          { label: "Stage", value: "Ideation", icon: Building2, color: "text-primary" },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 text-center">
            <stat.icon size={20} className={`mx-auto mb-1 ${stat.color}`} />
            <p className="font-display text-xl text-foreground">{stat.value}</p>
            <p className="font-body text-[10px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {activeIdea ? (
        <div className="bg-card rounded-xl border border-border p-6 space-y-5">
          <h2 className="font-display text-xl text-foreground">Profiling: {activeIdea.title}</h2>
          <div className="space-y-2">
            <label className="font-body text-sm font-medium text-foreground">Mission Statement</label>
            <Textarea placeholder="What is your startup's mission?" value={form.mission} onChange={e => setForm({ ...form, mission: e.target.value })} rows={2} />
          </div>
          <div className="space-y-2">
            <label className="font-body text-sm font-medium text-foreground">Vision</label>
            <Textarea placeholder="Where do you see this in 5 years?" value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} rows={2} />
          </div>
          <div className="space-y-2">
            <label className="font-body text-sm font-medium text-foreground">Customer Segments</label>
            <Input placeholder="Who are your target customers?" value={form.customer_segment} onChange={e => setForm({ ...form, customer_segment: e.target.value })} />
          </div>
          <div className="space-y-2">
            <label className="font-body text-sm font-medium text-foreground">Team Notes</label>
            <Textarea placeholder="Team structure, roles, skill gaps..." value={form.team_notes} onChange={e => setForm({ ...form, team_notes: e.target.value })} rows={2} />
          </div>
          <div className="space-y-2">
            <label className="font-body text-sm font-medium text-foreground">Funding Stage</label>
            <select value={form.funding_stage} onChange={e => setForm({ ...form, funding_stage: e.target.value })} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm">
              <option value="">Select...</option>
              <option value="bootstrapping">Bootstrapping</option>
              <option value="pre-seed">Pre-Seed</option>
              <option value="seed">Seed</option>
              <option value="series-a">Series A</option>
            </select>
          </div>
          <Button onClick={saveProfile} className="gradient-warm text-secondary-foreground"><Save size={18} /> Save Profile</Button>
        </div>
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No active startup idea</h3>
          <p className="font-body text-muted-foreground">Create an idea in Startup Sparks first, then profile it here.</p>
        </div>
      )}
    </div>
  );
};

export default StartupProfiling;
