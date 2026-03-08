import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Brain, Plus, X, Sparkles } from "lucide-react";

const dimensions = [
  "Analytical Thinking", "Creativity", "Leadership", "Communication",
  "Technical Skills", "Problem Solving", "Teamwork", "Adaptability",
  "Emotional Intelligence", "Strategic Thinking"
];

const SelfGraph = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newCategory, setNewCategory] = useState("Technical");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [skillsRes, graphRes] = await Promise.all([
      supabase.from("skills").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("selfgraph_data").select("*").eq("user_id", user!.id).order("recorded_at", { ascending: false }),
    ]);
    setSkills(skillsRes.data || []);
    setGraphData(graphRes.data || []);
    setLoading(false);
  };

  const addSkill = async () => {
    if (!newSkill.trim()) return;
    const { error } = await supabase.from("skills").insert({
      user_id: user!.id,
      name: newSkill.trim(),
      category: newCategory,
      proficiency: 0.3,
    });
    if (error) { toast.error("Failed to add skill"); return; }
    setNewSkill("");
    fetchData();
    toast.success("Skill added!");
  };

  const updateProficiency = async (id: string, proficiency: number) => {
    await supabase.from("skills").update({ proficiency }).eq("id", id);
    fetchData();
  };

  const recordDimension = async (dimension: string, value: number) => {
    await supabase.from("selfgraph_data").insert({
      user_id: user!.id,
      dimension,
      value,
    });
    fetchData();
    toast.success(`${dimension} updated!`);
  };

  const latestDimensions = dimensions.map((dim) => {
    const latest = graphData.find((d) => d.dimension === dim);
    return { dimension: dim, value: latest?.value || 0 };
  });

  const maxValue = Math.max(...latestDimensions.map(d => d.value), 1);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Brain size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">SelfGraph™</h1>
            <p className="font-body text-sm text-muted-foreground">Your real-time identity mirror — behavioral mapping, not tests</p>
          </div>
        </div>
      </motion.div>

      {/* Identity Radar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h2 className="font-display text-xl text-foreground mb-6">Identity Dimensions</h2>
        <div className="space-y-3">
          {latestDimensions.map((dim, i) => (
            <div key={dim.dimension} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-foreground">{dim.dimension}</span>
                <span className="font-body text-xs text-muted-foreground">{Math.round(dim.value * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${dim.value * 100}%` }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                    className="h-full gradient-warm rounded-full"
                  />
                </div>
                <div className="flex gap-1">
                  {[0.2, 0.4, 0.6, 0.8, 1].map((v) => (
                    <button
                      key={v}
                      onClick={() => recordDimension(dim.dimension, v)}
                      className={`w-3 h-3 rounded-full border transition-colors ${
                        dim.value >= v ? "bg-accent border-accent" : "bg-muted border-border hover:border-accent/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skills */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4">Skills Inventory</h2>
        <div className="flex gap-2 mb-4">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
          >
            {["Technical", "Creative", "Leadership", "Analytical", "Communication"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Input
            placeholder="e.g., Python, Public Speaking..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
          />
          <Button onClick={addSkill} className="gradient-warm text-secondary-foreground">
            <Plus size={18} />
          </Button>
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="mx-auto text-muted-foreground mb-2" size={32} />
            <p className="font-body text-muted-foreground text-sm">Add skills to build your SelfGraph</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {skills.map((skill) => (
              <div key={skill.id} className="flex items-center gap-3 p-3 rounded-lg border border-border group">
                <div className="flex-1">
                  <p className="font-body text-sm text-foreground font-medium">{skill.name}</p>
                  <p className="font-body text-xs text-muted-foreground">{skill.category}</p>
                  <div className="flex gap-1 mt-1">
                    {[0.2, 0.4, 0.6, 0.8, 1].map((v) => (
                      <button
                        key={v}
                        onClick={() => updateProficiency(skill.id, v)}
                        className={`w-6 h-1.5 rounded-full transition-colors ${
                          skill.proficiency >= v ? "bg-accent" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {skill.verified && (
                  <span className="font-body text-[10px] text-accent bg-accent/10 px-2 py-0.5 rounded-full">Verified</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfGraph;
