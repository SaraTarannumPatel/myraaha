import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Map, Plus, Check, Circle, Clock, SkipForward, Sparkles } from "lucide-react";

const Roadmap = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newStepTitle, setNewStepTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchRoadmaps(); }, []);

  const fetchRoadmaps = async () => {
    const { data } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setRoadmaps(data || []);
    if (data && data.length > 0) {
      setActiveRoadmap(data[0]);
      fetchSteps(data[0].id);
    }
    setLoading(false);
  };

  const fetchSteps = async (roadmapId: string) => {
    const { data } = await supabase
      .from("roadmap_steps")
      .select("*")
      .eq("roadmap_id", roadmapId)
      .order("order_index", { ascending: true });
    setSteps(data || []);
  };

  const createRoadmap = async () => {
    if (!newTitle.trim()) return;
    const { data, error } = await supabase.from("roadmaps").insert({
      user_id: user!.id,
      title: newTitle.trim(),
      intent: "career",
    }).select().single();
    if (error) { toast.error("Failed to create roadmap"); return; }
    setNewTitle("");
    setActiveRoadmap(data);
    setSteps([]);
    fetchRoadmaps();
    toast.success("Roadmap created!");
  };

  const addStep = async () => {
    if (!newStepTitle.trim() || !activeRoadmap) return;
    const { error } = await supabase.from("roadmap_steps").insert({
      roadmap_id: activeRoadmap.id,
      user_id: user!.id,
      title: newStepTitle.trim(),
      order_index: steps.length,
    });
    if (error) { toast.error("Failed to add step"); return; }
    setNewStepTitle("");
    fetchSteps(activeRoadmap.id);
  };

  const updateStepStatus = async (stepId: string, status: "not_started" | "in_progress" | "completed" | "skipped") => {
    await supabase.from("roadmap_steps").update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    }).eq("id", stepId);
    fetchSteps(activeRoadmap.id);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check size={16} className="text-accent" />;
      case "in_progress": return <Clock size={16} className="text-accent" />;
      case "skipped": return <SkipForward size={16} className="text-muted-foreground" />;
      default: return <Circle size={16} className="text-muted-foreground" />;
    }
  };

  const completedCount = steps.filter(s => s.status === "completed").length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Map size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">AI Roadmap</h1>
            <p className="font-body text-sm text-muted-foreground">Plan and track your career milestones</p>
          </div>
        </div>
      </motion.div>

      {/* Create Roadmap */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4">Create a Roadmap</h2>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Become a Full-Stack Developer"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createRoadmap()}
          />
          <Button onClick={createRoadmap} className="gradient-warm text-secondary-foreground">
            <Plus size={18} /> Create
          </Button>
        </div>

        {roadmaps.length > 1 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {roadmaps.map((rm) => (
              <button
                key={rm.id}
                onClick={() => { setActiveRoadmap(rm); fetchSteps(rm.id); }}
                className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${
                  activeRoadmap?.id === rm.id ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {rm.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Roadmap */}
      {activeRoadmap && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-foreground">{activeRoadmap.title}</h2>
              <span className="font-body text-sm text-accent font-semibold">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
              <div className="h-full gradient-warm rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-xs text-muted-foreground w-6">{i + 1}</span>
                    {statusIcon(step.status)}
                  </div>
                  <span className={`font-body text-sm flex-1 ${step.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {step.title}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    {["not_started", "in_progress", "completed", "skipped"].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStepStatus(step.id, s as "not_started" | "in_progress" | "completed" | "skipped")}
                        className={`px-2 py-0.5 rounded text-[10px] font-body transition-colors ${
                          step.status === s ? "bg-accent text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent/20"
                        }`}
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Step */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Input
                placeholder="Add a new step..."
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addStep()}
              />
              <Button onClick={addStep} variant="outline" size="sm">
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {!loading && roadmaps.length === 0 && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No roadmaps yet</h3>
          <p className="font-body text-muted-foreground">Create your first roadmap to plan your career path!</p>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
