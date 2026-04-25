import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/ui/multi-select";
import { toast } from "sonner";
import {
  Heart, Sparkles, Bookmark, XCircle, ChevronLeft, ChevronRight,
  TrendingUp, Clock, DollarSign, Users, Zap, Brain, Star,
  ThumbsUp, ThumbsDown, Eye, Filter
} from "lucide-react";

interface CareerPath {
  id: string;
  title: string;
  description: string | null;
  domain: string;
  industry: string | null;
  sector: string | null;
  day_to_day: string | null;
  salary_range: string | null;
  avg_salary_usd: string | null;
  demand_level: string | null;
  difficulty: string | null;
  growth_trajectory: string | null;
  growth_trajectory_detail: string | null;
  related_skills: string[] | null;
  soft_skills: string[] | null;
  tools_certifications: string[] | null;
  industry_trends: string | null;
  icon_emoji: string | null;
  interests: string[] | null;
  countries_in_demand: string[] | null;
  related_industries: string[] | null;
  related_sectors: string[] | null;
  related_domains: string[] | null;
  related_job_roles: string[] | null;
  related_subjects: string[] | null;
  related_universities: string[] | null;
  related_courses: string[] | null;
  related_countries: string[] | null;
  keywords: string[] | null;
}

type InteractionType = "like" | "love" | "bookmark" | "not_for_me";

const CareerCardDeck = () => {
  const { user } = useAuth();
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [interactions, setInteractions] = useState<Record<string, InteractionType>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterDomains, setFilterDomains] = useState<string[]>([]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [pathsRes, intRes] = await Promise.all([
      supabase.from("career_paths").select("*").order("title"),
      supabase.from("career_path_interactions").select("*").eq("user_id", user!.id),
    ]);
    setPaths((pathsRes.data as CareerPath[]) || []);
    const map: Record<string, InteractionType> = {};
    (intRes.data || []).forEach((i: any) => { map[i.career_path_id] = i.interaction_type; });
    setInteractions(map);
    setLoading(false);
  };

  const handleInteraction = async (pathId: string, type: InteractionType) => {
    const existing = interactions[pathId];
    if (existing === type) {
      // Remove interaction
      await supabase.from("career_path_interactions").delete().eq("user_id", user!.id).eq("career_path_id", pathId);
      setInteractions(prev => { const n = { ...prev }; delete n[pathId]; return n; });
      toast.success("Removed from collection");
    } else {
      await supabase.from("career_path_interactions").upsert({
        user_id: user!.id,
        career_path_id: pathId,
        interaction_type: type,
      }, { onConflict: "user_id,career_path_id" });
      setInteractions(prev => ({ ...prev, [pathId]: type }));
      const labels: Record<InteractionType, string> = {
        like: "Liked! 👍", love: "Loved! ❤️", bookmark: "Bookmarked! 🔖", not_for_me: "Noted — not for you ✓"
      };
      toast.success(labels[type]);
    }
  };

  const domains = [...new Set(paths.map(p => p.domain))].sort();
  const filtered = filterDomain ? paths.filter(p => p.domain === filterDomain) : paths;
  const current = filtered[currentIndex];

  const stats = {
    liked: Object.values(interactions).filter(t => t === "like").length,
    loved: Object.values(interactions).filter(t => t === "love").length,
    bookmarked: Object.values(interactions).filter(t => t === "bookmark").length,
    skipped: Object.values(interactions).filter(t => t === "not_for_me").length,
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-pulse text-muted-foreground">Loading career cards...</div></div>;
  }

  if (filtered.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Brain className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="font-display text-xl mb-2">No Career Paths Yet</h3>
          <p className="font-body text-muted-foreground">Career cards will populate as more paths are added to the system.</p>
        </CardContent>
      </Card>
    );
  }

  const demandColor = (level: string | null) => {
    if (!level) return "text-muted-foreground";
    const l = level.toLowerCase();
    if (l.includes("high") || l.includes("strong")) return "text-success";
    if (l.includes("medium") || l.includes("moderate")) return "text-accent-foreground";
    return "text-warmth";
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm">
          <ThumbsUp size={14} className="text-primary" /> <span className="font-body text-muted-foreground">{stats.liked} Liked</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Heart size={14} className="text-terracotta" /> <span className="font-body text-muted-foreground">{stats.loved} Loved</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <Bookmark size={14} className="text-blue-primary" /> <span className="font-body text-muted-foreground">{stats.bookmarked} Saved</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <XCircle size={14} className="text-grey-meta" /> <span className="font-body text-muted-foreground">{stats.skipped} Skipped</span>
        </div>
      </div>

      {/* Domain Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filterDomain === null ? "default" : "outline"} size="sm" onClick={() => { setFilterDomain(null); setCurrentIndex(0); }}>
          All ({paths.length})
        </Button>
        {domains.map(d => (
          <Button key={d} variant={filterDomain === d ? "default" : "outline"} size="sm" onClick={() => { setFilterDomain(d); setCurrentIndex(0); }}>
            {d}
          </Button>
        ))}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="font-body text-sm text-muted-foreground">Card {currentIndex + 1} of {filtered.length}</span>
        <div className="flex gap-1">
          {filtered.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((_, i) => {
            const idx = Math.max(0, currentIndex - 3) + i;
            return <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? "bg-primary" : interactions[filtered[idx]?.id] ? "bg-accent" : "bg-muted"}`} />;
          })}
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div key={current.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
            <Card className={`overflow-hidden transition-all ${
              interactions[current.id] === "love" ? "border-terracotta/50 ring-1 ring-terracotta/20" :
              interactions[current.id] === "like" ? "border-primary/50 ring-1 ring-primary/20" :
              interactions[current.id] === "bookmark" ? "border-blue-primary/50 ring-1 ring-blue-primary/20" :
              interactions[current.id] === "not_for_me" ? "opacity-60" : ""
            }`}>
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-6">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{current.icon_emoji || "💼"}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-2xl text-foreground">{current.title}</h2>
                    <Badge variant="secondary" className="mt-1">{current.domain}</Badge>
                    {current.difficulty && <Badge variant="outline" className="ml-2 mt-1">{current.difficulty}</Badge>}
                  </div>
                </div>
              </div>

              <CardContent className="pt-4 space-y-5">
                {/* Description */}
                {current.description && (
                  <p className="font-body text-sm text-foreground leading-relaxed">{current.description}</p>
                )}

                {/* Key Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {current.salary_range && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign size={14} className="text-accent-foreground" />
                        <span className="font-body text-xs text-muted-foreground">Salary</span>
                      </div>
                      <p className="font-display text-sm text-foreground">{current.salary_range}</p>
                    </div>
                  )}
                  {current.demand_level && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={14} className={demandColor(current.demand_level)} />
                        <span className="font-body text-xs text-muted-foreground">Demand</span>
                      </div>
                      <p className={`font-display text-sm ${demandColor(current.demand_level)}`}>{current.demand_level}</p>
                    </div>
                  )}
                  {current.growth_trajectory && (
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap size={14} className="text-primary" />
                        <span className="font-body text-xs text-muted-foreground">Growth</span>
                      </div>
                      <p className="font-display text-sm text-foreground">{current.growth_trajectory}</p>
                    </div>
                  )}
                </div>

                {/* Day in the life */}
                {current.day_to_day && (
                  <div className="p-4 rounded-lg bg-secondary border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={14} className="text-primary" />
                      <span className="font-display text-sm text-foreground">A Typical Day</span>
                    </div>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed">{current.day_to_day}</p>
                  </div>
                )}

                {/* Expandable sections */}
                <button onClick={() => setExpanded(!expanded)} className="w-full text-center font-body text-sm text-primary hover:underline py-1">
                  {expanded ? "Show less ↑" : "Show more details ↓"}
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
                      {/* Skills */}
                      {current.related_skills && current.related_skills.length > 0 && (
                        <div>
                          <h4 className="font-display text-sm mb-2 flex items-center gap-2"><Brain size={14} className="text-primary" /> Skills Required</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.related_skills.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Tools */}
                      {current.tools_certifications && current.tools_certifications.length > 0 && (
                        <div>
                          <h4 className="font-display text-sm mb-2 flex items-center gap-2"><Star size={14} className="text-accent-foreground" /> Tools & Certifications</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.tools_certifications.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Industry Trends */}
                      {current.industry_trends && (
                        <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className="text-accent-foreground" />
                            <span className="font-display text-sm text-foreground">Industry Trends</span>
                          </div>
                          <p className="font-body text-sm text-muted-foreground">{current.industry_trends}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <Button
                    variant={interactions[current.id] === "like" ? "default" : "outline"}
                    className="flex flex-col items-center gap-1 h-auto py-3"
                    onClick={() => handleInteraction(current.id, "like")}
                  >
                    <ThumbsUp size={18} className={interactions[current.id] === "like" ? "fill-current" : ""} />
                    <span className="text-xs">Like</span>
                  </Button>
                  <Button
                    variant={interactions[current.id] === "love" ? "default" : "outline"}
                    className={`flex flex-col items-center gap-1 h-auto py-3 ${interactions[current.id] === "love" ? "bg-terracotta hover:bg-terracotta/90 border-terracotta" : ""}`}
                    onClick={() => handleInteraction(current.id, "love")}
                  >
                    <Heart size={18} className={interactions[current.id] === "love" ? "fill-current" : ""} />
                    <span className="text-xs">Love</span>
                  </Button>
                  <Button
                    variant={interactions[current.id] === "bookmark" ? "default" : "outline"}
                    className={`flex flex-col items-center gap-1 h-auto py-3 ${interactions[current.id] === "bookmark" ? "bg-[hsl(var(--blue-primary))] hover:bg-[hsl(var(--blue-primary))]/90 border-[hsl(var(--blue-primary))]" : ""}`}
                    onClick={() => handleInteraction(current.id, "bookmark")}
                  >
                    <Bookmark size={18} className={interactions[current.id] === "bookmark" ? "fill-current" : ""} />
                    <span className="text-xs">Save</span>
                  </Button>
                  <Button
                    variant={interactions[current.id] === "not_for_me" ? "default" : "outline"}
                    className={`flex flex-col items-center gap-1 h-auto py-3 ${interactions[current.id] === "not_for_me" ? "bg-muted-foreground hover:bg-muted-foreground/90" : ""}`}
                    onClick={() => handleInteraction(current.id, "not_for_me")}
                  >
                    <XCircle size={18} />
                    <span className="text-xs">Not me</span>
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setExpanded(false); }} disabled={currentIndex === 0}>
                    <ChevronLeft size={16} className="mr-1" /> Previous
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.min(filtered.length - 1, currentIndex + 1)); setExpanded(false); }} disabled={currentIndex >= filtered.length - 1}>
                    Next <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareerCardDeck;
