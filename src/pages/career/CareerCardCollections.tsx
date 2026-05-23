import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Heart, ThumbsUp, Bookmark, XCircle, Trash2, ArrowRight,
  TrendingUp, DollarSign, Brain, Zap, FolderHeart
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type InteractionType = "like" | "love" | "bookmark" | "not_for_me";

interface CollectionItem {
  id: string;
  career_path_id: string;
  interaction_type: InteractionType;
  created_at: string;
  career_paths: {
    id: string;
    title: string;
    description: string | null;
    domain: string;
    salary_range: string | null;
    demand_level: string | null;
    difficulty: string | null;
    related_skills: string[] | null;
    icon_emoji: string | null;
    growth_trajectory: string | null;
  };
}

const TAB_CONFIG: { key: InteractionType; label: string; icon: typeof Heart; color: string; emptyMsg: string }[] = [
  { key: "love", label: "Loved", icon: Heart, color: "text-terracotta", emptyMsg: "Paths you absolutely vibe with show up here ❤️" },
  { key: "like", label: "Liked", icon: ThumbsUp, color: "text-primary", emptyMsg: "Paths that caught your eye land here 👍" },
  { key: "bookmark", label: "Bookmarked", icon: Bookmark, color: "text-blue-primary", emptyMsg: "Saved paths for later exploration 🔖" },
  { key: "not_for_me", label: "Not For Me", icon: XCircle, color: "text-grey-meta", emptyMsg: "Paths you've ruled out (for now) 🤷" },
];

const CareerCardCollections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InteractionType>("love");

  useEffect(() => {
    if (user) fetchCollections();
  }, [user]);

  const fetchCollections = async () => {
    const { data } = await supabase
      .from("career_path_interactions")
      .select("*, career_paths(*)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setItems((data as unknown as CollectionItem[]) || []);
    setLoading(false);
  };

  const removeInteraction = async (id: string) => {
    await supabase.from("career_path_interactions").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Removed from collection");
  };

  const changeInteraction = async (id: string, pathId: string, newType: InteractionType) => {
    await supabase.from("career_path_interactions").update({ interaction_type: newType }).eq("id", id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, interaction_type: newType } : i));
    const labels: Record<InteractionType, string> = { like: "Moved to Liked", love: "Moved to Loved", bookmark: "Bookmarked!", not_for_me: "Moved to Not For Me" };
    toast.success(labels[newType]);
  };

  const filtered = (type: InteractionType) => items.filter(i => i.interaction_type === type);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-pulse text-muted-foreground">Loading collections...</div></div>;
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta to-accent flex items-center justify-center">
            <FolderHeart size={24} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">My Career Collections</h1>
            <p className="font-body text-muted-foreground">all the career paths you've reacted to, sorted by vibe ✨</p>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {TAB_CONFIG.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`p-3 rounded-xl border text-center transition-all ${activeTab === t.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
            <t.icon size={18} className={`mx-auto mb-1 ${t.color}`} />
            <p className="font-display text-lg text-foreground">{filtered(t.key).length}</p>
            <p className="font-body text-xs text-muted-foreground">{t.label}</p>
          </button>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={v => setActiveTab(v as InteractionType)}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-lg">
          {TAB_CONFIG.map(t => (
            <TabsTrigger key={t.key} value={t.key} className="flex items-center gap-1.5">
              <t.icon size={14} /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_CONFIG.map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="space-y-4">
            {filtered(tab.key).length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <tab.icon className={`mx-auto mb-4 ${tab.color}`} size={48} />
                  <h3 className="font-display text-xl mb-2">Nothing here yet</h3>
                  <p className="font-body text-muted-foreground mb-4">{tab.emptyMsg}</p>
                  <Button variant="outline" onClick={() => navigate("/dashboard/curiosity-compass")}>
                    Explore Career Cards <ArrowRight size={14} className="ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filtered(tab.key).map((item, i) => {
                  const path = item.career_paths;
                  if (!path) return null;
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardContent className="pt-5">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-3xl">{path.icon_emoji || "💼"}</span>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-lg text-foreground">{path.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">{path.domain}</Badge>
                                {path.difficulty && <Badge variant="outline" className="text-xs">{path.difficulty}</Badge>}
                              </div>
                            </div>
                          </div>

                          {path.description && (
                            <p className="font-body text-sm text-muted-foreground mb-3 line-clamp-2">{path.description}</p>
                          )}

                          <div className="flex items-center gap-3 mb-3 text-xs">
                            {path.salary_range && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <DollarSign size={12} /> {path.salary_range}
                              </span>
                            )}
                            {path.demand_level && (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <TrendingUp size={12} /> {path.demand_level}
                              </span>
                            )}
                          </div>

                          {path.related_skills && path.related_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {path.related_skills.slice(0, 4).map(s => (
                                <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                              ))}
                              {path.related_skills.length > 4 && (
                                <Badge variant="outline" className="text-[10px]">+{path.related_skills.length - 4}</Badge>
                              )}
                            </div>
                          )}

                          {/* Move / Remove Actions */}
                          <div className="flex items-center gap-1.5 pt-2 border-t border-border">
                            {TAB_CONFIG.filter(t => t.key !== tab.key).map(t => (
                              <Button key={t.key} variant="ghost" size="sm" className="text-xs h-8 px-2" onClick={() => changeInteraction(item.id, path.id, t.key)}>
                                <t.icon size={12} className={`mr-1 ${t.color}`} /> {t.label}
                              </Button>
                            ))}
                            <Button variant="ghost" size="sm" className="text-xs h-8 px-2 ml-auto text-destructive hover:text-destructive" onClick={() => removeInteraction(item.id)}>
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CareerCardCollections;
