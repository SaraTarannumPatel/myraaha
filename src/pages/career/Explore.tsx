import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, ExternalLink, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const Explore = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchResources(); }, []);

  const fetchResources = async () => {
    const { data } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });
    setResources(data || []);
    setLoading(false);
  };

  const filtered = resources.filter((r) => {
    const matchesSearch = !search || r.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.resource_type === filter;
    return matchesSearch && matchesFilter;
  });

  const types = ["all", "article", "video", "course", "tool", "podcast"];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Sparkles size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Explore</h1>
            <p className="font-body text-sm text-muted-foreground">Discover curated resources, stories, and inspiration</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full font-body text-xs capitalize transition-all ${
                filter === t ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="text-center py-12"><div className="animate-pulse font-body text-muted-foreground">Loading...</div></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">
            {resources.length === 0 ? "No resources yet" : "No matching resources"}
          </h3>
          <p className="font-body text-muted-foreground">
            {resources.length === 0 ? "Curated content will appear here as it's added." : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((resource, i) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-soft transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px] uppercase font-semibold">
                  {resource.resource_type}
                </span>
                {resource.difficulty_level && (
                  <span className="font-body text-[10px] text-muted-foreground capitalize">{resource.difficulty_level}</span>
                )}
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">{resource.title}</h3>
              {resource.description && (
                <p className="font-body text-sm text-muted-foreground mb-3 line-clamp-2">{resource.description}</p>
              )}
              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {resource.tags.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-[10px]">{tag}</span>
                  ))}
                </div>
              )}
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-body text-xs text-accent font-medium hover:underline"
                >
                  View <ExternalLink size={12} />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
