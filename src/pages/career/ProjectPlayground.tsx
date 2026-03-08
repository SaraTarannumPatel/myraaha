import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FolderKanban, Plus, Sparkles, Clock, Tag, ArrowRight } from "lucide-react";

const ProjectPlayground = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tags: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("*").eq("user_id", user!.id).eq("intent", "career").order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const createProject = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from("projects").insert({
      user_id: user!.id, title: form.title.trim(), description: form.description, project_type: "challenge", intent: "career" as const,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    if (error) { toast.error("Failed to create"); return; }
    setForm({ title: "", description: "", tags: "" });
    setShowForm(false);
    fetchProjects();
    toast.success("Project created!");
  };

  const updateStatus = async (id: string, status: "idea" | "planning" | "building" | "launched" | "archived") => {
    await supabase.from("projects").update({ status }).eq("id", id);
    fetchProjects();
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <FolderKanban size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Project Playground</h1>
              <p className="font-body text-sm text-muted-foreground">Apply what you've learned with hands-on projects.</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gradient-warm text-secondary-foreground"><Plus size={18} /> New Project</Button>
        </div>
      </motion.div>

      {/* Challenge Vault */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4">🏆 Challenge Vault</h2>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { title: "Build a Portfolio Website", level: "Beginner", duration: "1 week" },
            { title: "Data Analysis Dashboard", level: "Intermediate", duration: "2 weeks" },
            { title: "Mobile App Prototype", level: "Advanced", duration: "3 weeks" },
          ].map((challenge, i) => (
            <div key={i} className="p-4 rounded-lg border border-border hover:border-accent/30 transition-all cursor-pointer">
              <h4 className="font-display text-sm text-foreground">{challenge.title}</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-[10px]">{challenge.level}</span>
                <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><Clock size={10} /> {challenge.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl text-foreground">New Project</h2>
          <Input placeholder="Project name" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="What will you build?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
          <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={createProject} className="gradient-warm text-secondary-foreground">Create</Button>
            <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Your Projects */}
      {projects.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-foreground mb-4">Your Projects</h2>
          <div className="grid gap-4">
            {projects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display text-lg text-foreground">{p.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px] capitalize">{p.status}</span>
                </div>
                {p.description && <p className="font-body text-sm text-muted-foreground mb-3">{p.description}</p>}
                <div className="flex items-center gap-1">
                  {["idea", "planning", "building", "launched"].map((s, si) => (
                    <div key={s} className="flex items-center">
                      <button onClick={() => updateStatus(p.id, s as any)} className={`px-2 py-0.5 rounded-full font-body text-[10px] capitalize transition-all ${p.status === s ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>{s}</button>
                      {si < 3 && <ArrowRight size={8} className="text-muted-foreground mx-0.5" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loading && projects.length === 0 && !showForm && (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No projects yet</h3>
          <p className="font-body text-muted-foreground">Start a project or take a challenge to build real-world skills!</p>
        </div>
      )}
    </div>
  );
};

export default ProjectPlayground;
