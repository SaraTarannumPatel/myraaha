import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Presentation, Plus, Heart, MessageCircle, Eye, Sparkles } from "lucide-react";

const StartupShowcase = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tags: "" });
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from("projects").select("*").eq("intent", "entrepreneurship").order("created_at", { ascending: false }).limit(20);
      setProjects(data || []);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const shareProject = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from("projects").insert({
      user_id: user!.id, title: form.title.trim(), description: form.description, project_type: "showcase", intent: "entrepreneurship" as const, status: "launched" as const,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    if (error) { toast.error("Failed to share"); return; }
    setForm({ title: "", description: "", tags: "" });
    setShowForm(false);
    toast.success("Project shared to Showcase! 🎉");
  };

  const likeProject = (id: string) => {
    setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <Presentation size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Startup Showcase</h1>
              <p className="font-body text-sm text-muted-foreground">Share your story — get feedback, find collaborators, and inspire others.</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gradient-warm text-secondary-foreground"><Plus size={18} /> Share Project</Button>
        </div>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl text-foreground">Share Your Project</h2>
          <Input placeholder="Project name" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Describe your project, progress, and what feedback you're looking for..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} />
          <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={shareProject} className="gradient-warm text-secondary-foreground">Share</Button>
            <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="text-center py-12"><div className="animate-pulse font-body text-muted-foreground">Loading showcase...</div></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">Showcase is empty</h3>
          <p className="font-body text-muted-foreground">Be the first to share your startup journey!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-display text-lg text-foreground mb-1">{p.title}</h3>
              {p.description && <p className="font-body text-sm text-muted-foreground mb-3 line-clamp-3">{p.description}</p>}
              {p.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">{p.tags.map((t: string) => <span key={t} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{t}</span>)}</div>
              )}
              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <button onClick={() => likeProject(p.id)} className="flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-accent transition-colors">
                  <Heart size={14} className={likes[p.id] ? "text-accent fill-accent" : ""} /> {likes[p.id] || 0}
                </button>
                <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><MessageCircle size={14} /> 0</span>
                <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Eye size={14} /> {Math.floor(Math.random() * 50) + 5}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StartupShowcase;
