import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen, Plus, Sparkles } from "lucide-react";

const moods = ["😊 Great", "😐 Okay", "😔 Struggling", "🔥 Motivated", "🤔 Reflective"];

const Journal = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", mood: "", tags: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  const addEntry = async () => {
    if (!form.content.trim()) { toast.error("Write something first"); return; }
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user!.id,
      title: form.title || null,
      content: form.content,
      mood: form.mood || null,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
    });
    if (error) { toast.error("Failed to save"); return; }
    setForm({ title: "", content: "", mood: "", tags: "" });
    setShowForm(false);
    fetchEntries();
    toast.success("Entry saved!");
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <BookOpen size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Journal</h1>
              <p className="font-body text-sm text-muted-foreground">Reflect on your journey</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gradient-warm text-secondary-foreground">
            <Plus size={18} /> New Entry
          </Button>
        </div>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <Input placeholder="Title (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="flex gap-2 flex-wrap">
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setForm({ ...form, mood: m })}
                className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${
                  form.mood === m ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <Textarea placeholder="What's on your mind?" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} />
          <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={addEntry} className="gradient-warm text-secondary-foreground">Save</Button>
            <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="animate-pulse font-body text-muted-foreground text-center py-12">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No entries yet</h3>
          <p className="font-body text-muted-foreground">Start journaling to track your growth!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {entry.mood && <span className="text-sm">{entry.mood.split(" ")[0]}</span>}
                  {entry.title && <h3 className="font-display text-lg text-foreground">{entry.title}</h3>}
                </div>
                <span className="font-body text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="font-body text-sm text-foreground whitespace-pre-wrap">{entry.content}</p>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex gap-1 mt-3">
                  {entry.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{tag}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Journal;
