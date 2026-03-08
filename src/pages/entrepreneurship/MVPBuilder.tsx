import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Wrench, Plus, Sparkles, ArrowRight } from "lucide-react";

const statusColors: Record<string, string> = {
  idea: "bg-muted text-muted-foreground",
  planning: "bg-accent/10 text-accent",
  building: "bg-accent/20 text-accent",
  launched: "bg-accent text-secondary-foreground",
  archived: "bg-muted text-muted-foreground",
};

const MVPBuilder = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tags: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user!.id)
      .eq("intent", "entrepreneurship")
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const createProject = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from("projects").insert({
      user_id: user!.id,
      title: form.title.trim(),
      description: form.description,
      project_type: "mvp",
      intent: "entrepreneurship" as const,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    if (error) { toast.error("Failed to create project"); return; }
    setForm({ title: "", description: "", tags: "" });
    setShowForm(false);
    fetchProjects();
    toast.success("MVP project created! 🔨");
  };

  const updateStatus = async (id: string, status: "idea" | "planning" | "building" | "launched" | "archived") => {
    await supabase.from("projects").update({ status }).eq("id", id);
    fetchProjects();
    toast.success(`Status updated to ${status}`);
  };

  const statuses = ["idea", "planning", "building", "launched", "archived"];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <Wrench size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">MVP Builder</h1>
              <p className="font-body text-sm text-muted-foreground">Plan, build, and launch your minimum viable products</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gradient-warm text-secondary-foreground">
            <Plus size={18} /> New MVP
          </Button>
        </div>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl text-foreground">Start a New MVP</h2>
          <Input placeholder="Project name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="What are you building? What problem does it solve?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <Input placeholder="Tags (comma-separated, e.g., AI, SaaS, Mobile)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={createProject} className="gradient-warm text-secondary-foreground">Create Project</Button>
            <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="animate-pulse font-body text-muted-foreground">Loading...</div></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No MVPs yet</h3>
          <p className="font-body text-muted-foreground">Turn your startup ideas into tangible products!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-xl text-foreground">{project.title}</h3>
                  {project.description && <p className="font-body text-sm text-muted-foreground mt-1">{project.description}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full font-body text-xs font-medium capitalize ${statusColors[project.status] || ""}`}>
                  {project.status}
                </span>
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {project.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{tag}</span>
                  ))}
                </div>
              )}

              {/* Status Pipeline */}
              <div className="flex items-center gap-1">
                {statuses.map((s, si) => (
                  <div key={s} className="flex items-center">
                    <button
                      onClick={() => updateStatus(project.id, s as "idea" | "planning" | "building" | "launched" | "archived")}
                      className={`px-3 py-1 rounded-full font-body text-[10px] capitalize transition-all ${
                        project.status === s ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"
                      }`}
                    >
                      {s}
                    </button>
                    {si < statuses.length - 1 && <ArrowRight size={10} className="text-muted-foreground mx-0.5" />}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MVPBuilder;
