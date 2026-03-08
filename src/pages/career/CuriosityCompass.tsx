import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Compass, Plus, X, Sparkles, TrendingUp } from "lucide-react";

const categories = [
  "Technology", "Arts & Design", "Science", "Business", "Health", "Education",
  "Sports", "Music", "Writing", "Engineering", "Social Impact", "Finance"
];

const CuriosityCompass = () => {
  const { user } = useAuth();
  const [interests, setInterests] = useState<any[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    const { data } = await supabase
      .from("interests")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setInterests(data || []);
    setLoading(false);
  };

  const addInterest = async () => {
    if (!newInterest.trim()) return;
    const { error } = await supabase.from("interests").insert({
      user_id: user!.id,
      name: newInterest.trim(),
      category: selectedCategory,
      strength: 0.5,
      source: "manual",
    });
    if (error) {
      toast.error("Failed to add interest");
    } else {
      setNewInterest("");
      fetchInterests();
      toast.success("Interest added!");
    }
  };

  const removeInterest = async (id: string) => {
    await supabase.from("interests").delete().eq("id", id);
    fetchInterests();
  };

  const updateStrength = async (id: string, strength: number) => {
    await supabase.from("interests").update({ strength }).eq("id", id);
    fetchInterests();
  };

  const groupedInterests = interests.reduce((acc: Record<string, any[]>, int) => {
    const cat = int.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(int);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Compass size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Curiosity Compass</h1>
            <p className="font-body text-sm text-muted-foreground">Map your interests and discover your passions</p>
          </div>
        </div>
      </motion.div>

      {/* Add Interest */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6"
      >
        <h2 className="font-display text-xl text-foreground mb-4">Add an Interest</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-body text-xs transition-all ${
                selectedCategory === cat
                  ? "gradient-warm text-secondary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Machine Learning, Graphic Design..."
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addInterest()}
          />
          <Button onClick={addInterest} className="gradient-warm text-secondary-foreground">
            <Plus size={18} /> Add
          </Button>
        </div>
      </motion.div>

      {/* Interest Map */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse font-body text-muted-foreground">Loading your interests...</div>
        </div>
      ) : Object.keys(groupedInterests).length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">Your compass is empty</h3>
          <p className="font-body text-muted-foreground">Start adding interests to discover patterns in your curiosity!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(groupedInterests).map(([category, items], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-display text-lg text-foreground mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                {category}
                <span className="font-body text-xs text-muted-foreground">({items.length})</span>
              </h3>
              <div className="space-y-2">
                {items.map((interest: any) => (
                  <div key={interest.id} className="flex items-center gap-3 group">
                    <div className="flex-1">
                      <p className="font-body text-sm text-foreground">{interest.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-warm rounded-full transition-all"
                            style={{ width: `${(interest.strength || 0.5) * 100}%` }}
                          />
                        </div>
                        <div className="flex gap-1">
                          {[0.25, 0.5, 0.75, 1].map((s) => (
                            <button
                              key={s}
                              onClick={() => updateStrength(interest.id, s)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                interest.strength >= s ? "bg-accent" : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeInterest(interest.id)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <X size={14} />
                    </button>
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

export default CuriosityCompass;
