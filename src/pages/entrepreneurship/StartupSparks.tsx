import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Lightbulb, Plus, Sparkles, Target, Users, Tag, Star } from "lucide-react";

const StartupSparks = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", problem_statement: "", solution: "", target_audience: "", category: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchIdeas(); }, []);

  const fetchIdeas = async () => {
    const { data } = await supabase
      .from("startup_ideas")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setIdeas(data || []);
    setLoading(false);
  };

  const addIdea = async () => {
    if (!form.title.trim()) { toast.error("Give your idea a name"); return; }
    const { error } = await supabase.from("startup_ideas").insert({
      user_id: user!.id,
      ...form,
    });
    if (error) { toast.error("Failed to save idea"); return; }
    setForm({ title: "", problem_statement: "", solution: "", target_audience: "", category: "" });
    setShowForm(false);
    fetchIdeas();
    toast.success("Idea sparked! 🚀");
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from("startup_ideas").update({ is_active: !isActive }).eq("id", id);
    fetchIdeas();
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <Lightbulb size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Startup Sparks</h1>
              <p className="font-body text-sm text-muted-foreground">Capture, develop, and validate your startup ideas</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gradient-warm text-secondary-foreground">
            <Plus size={18} /> New Idea
          </Button>
        </div>
      </motion.div>

      {/* Add Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl text-foreground">Spark a New Idea</h2>
          <Input placeholder="Idea Name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="What problem does it solve?" value={form.problem_statement} onChange={(e) => setForm({ ...form, problem_statement: e.target.value })} rows={2} />
          <Textarea placeholder="Your proposed solution" value={form.solution} onChange={(e) => setForm({ ...form, solution: e.target.value })} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Target audience" value={form.target_audience} onChange={(e) => setForm({ ...form, target_audience: e.target.value })} />
            <Input placeholder="Category (e.g., EdTech, FinTech)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button onClick={addIdea} className="gradient-warm text-secondary-foreground">Save Idea</Button>
            <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Ideas Grid */}
      {loading ? (
        <div className="text-center py-12"><div className="animate-pulse font-body text-muted-foreground">Loading...</div></div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No sparks yet</h3>
          <p className="font-body text-muted-foreground">Every great startup begins with an idea. Capture yours!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {ideas.map((idea, i) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-xl border p-5 transition-all ${idea.is_active ? "border-accent/30 shadow-soft" : "border-border opacity-60"}`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-display text-lg text-foreground">{idea.title}</h3>
                <button onClick={() => toggleActive(idea.id, idea.is_active)}>
                  <Star size={18} className={idea.is_active ? "text-accent fill-accent" : "text-muted-foreground"} />
                </button>
              </div>
              {idea.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px] mb-3">
                  <Tag size={10} /> {idea.category}
                </span>
              )}
              {idea.problem_statement && (
                <div className="mb-2">
                  <p className="font-body text-[10px] uppercase text-muted-foreground font-semibold">Problem</p>
                  <p className="font-body text-sm text-foreground">{idea.problem_statement}</p>
                </div>
              )}
              {idea.solution && (
                <div className="mb-2">
                  <p className="font-body text-[10px] uppercase text-muted-foreground font-semibold">Solution</p>
                  <p className="font-body text-sm text-foreground">{idea.solution}</p>
                </div>
              )}
              {idea.target_audience && (
                <div className="flex items-center gap-1 mt-2">
                  <Users size={12} className="text-muted-foreground" />
                  <span className="font-body text-xs text-muted-foreground">{idea.target_audience}</span>
                </div>
              )}
              {idea.validation_score > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[10px] text-muted-foreground">Validation</span>
                    <span className="font-body text-xs text-accent font-semibold">{Math.round(idea.validation_score * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <div className="h-full gradient-warm rounded-full" style={{ width: `${idea.validation_score * 100}%` }} />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StartupSparks;
