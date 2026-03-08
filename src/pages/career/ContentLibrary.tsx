import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookOpen, Search, ExternalLink, Bookmark, Star, Filter } from "lucide-react";

const categories = ["All", "Tech", "Healthcare", "Finance", "Design", "Marketing", "Leadership", "Entrepreneurship"];
const formats = ["all", "article", "video", "course", "podcast", "tool"];
const levels = ["all", "beginner", "intermediate", "advanced"];

const ContentLibrary = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [format, setFormat] = useState("all");
  const [level, setLevel] = useState("all");
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    const { data } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
    setResources(data || []);
    setLoading(false);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    toast.success("Bookmark updated");
  };

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || r.category === category;
    const matchFormat = format === "all" || r.resource_type === format;
    const matchLevel = level === "all" || r.difficulty_level === level;
    return matchSearch && matchCategory && matchFormat && matchLevel;
  });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <BookOpen size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Content Library</h1>
            <p className="font-body text-sm text-muted-foreground">Here's everything you need to learn — at your pace, based on what excites you.</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search courses, articles, tools..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${category === c ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <Filter size={14} className="text-muted-foreground mt-1" />
            {formats.map(f => (
              <button key={f} onClick={() => setFormat(f)} className={`px-2 py-1 rounded font-body text-[10px] uppercase transition-all ${format === f ? "bg-accent text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>{f}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {levels.map(l => (
              <button key={l} onClick={() => setLevel(l)} className={`px-2 py-1 rounded font-body text-[10px] uppercase transition-all ${level === l ? "bg-accent text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12"><div className="animate-pulse font-body text-muted-foreground">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <BookOpen className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">{resources.length === 0 ? "Content coming soon" : "No matching content"}</h3>
          <p className="font-body text-muted-foreground">Curated learning resources will appear here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-card rounded-xl border border-border p-5 hover:shadow-soft transition-all group">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px] uppercase font-semibold">{r.resource_type}</span>
                <div className="flex gap-2">
                  {r.difficulty_level && <span className="font-body text-[10px] text-muted-foreground capitalize">{r.difficulty_level}</span>}
                  <button onClick={() => toggleBookmark(r.id)}>
                    <Bookmark size={14} className={bookmarks.has(r.id) ? "text-accent fill-accent" : "text-muted-foreground"} />
                  </button>
                </div>
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">{r.title}</h3>
              {r.description && <p className="font-body text-sm text-muted-foreground mb-3 line-clamp-2">{r.description}</p>}
              {r.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {r.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{tag}</span>
                  ))}
                </div>
              )}
              {r.url && (
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-body text-xs text-accent font-medium hover:underline">
                  Start Learning <ExternalLink size={12} />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentLibrary;
