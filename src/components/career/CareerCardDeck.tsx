import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MultiSelect from "@/components/ui/multi-select";
import BlueprintCard, { type Blueprint } from "@/components/career/BlueprintCard";
import { buildBlueprintFromInteractions } from "@/lib/buildBlueprint";
import { generateBlueprintRoadmap } from "@/lib/blueprintRoadmap";
import { useCuratedCompassFilter } from "@/hooks/useCuratedCompassFilter";
import { toast } from "sonner";
import {
  Heart, Sparkles, Bookmark, XCircle, ChevronLeft, ChevronRight,
  TrendingUp, Clock, DollarSign, Users, Zap, Brain, Star,
  ThumbsUp, ThumbsDown, Eye, Filter, Loader2, ArrowRight
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
  const navigate = useNavigate();
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [interactions, setInteractions] = useState<Record<string, InteractionType>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterDomains, setFilterDomains] = useState<string[]>([]);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  const interactionCount = Object.keys(interactions).length;

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const bp = buildBlueprintFromInteractions(
        paths.map((p) => ({
          id: p.id, domain: p.domain, related_skills: p.related_skills,
          soft_skills: p.soft_skills, difficulty: p.difficulty, title: p.title,
        })),
        interactions,
        "career-cards",
      );
      setBlueprint(bp);
      setShowBlueprint(true);
      toast.success("Career blueprint ready! 🧬");
    } finally { setAnalyzing(false); }
  };

  const onGenerateRoadmap = async () => {
    if (!user || !blueprint) return;
    setGeneratingRoadmap(true);
    try {
      await generateBlueprintRoadmap(
        user.id,
        {
          shortTermGoals: blueprint.top_paths[0] || blueprint.domains_attracted[0] || "Explore my career inclinations",
          longTermGoals: blueprint.ai_summary,
          interests: [...blueprint.domains_attracted, ...blueprint.blind_spots].slice(0, 12),
          skills: blueprint.skills_resonated,
          industry: blueprint.domains_attracted[0] || "",
          careerStage: "exploring",
          areasOfFocus: blueprint.top_paths.slice(0, 8),
          sourceContext: "career_cards_blueprint",
        },
        `Personalized Roadmap — ${blueprint.top_paths[0] || "Your Path"}`,
        navigate,
      );
    } catch (e) {
      console.error(e);
      toast.error("Could not generate roadmap.");
    } finally { setGeneratingRoadmap(false); }
  };

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

  const { scoreEntity, hasPersonalization } = useCuratedCompassFilter();
  const domains = [...new Set(paths.map(p => p.domain))].sort();
  const base = filterDomains.length > 0 ? paths.filter(p => filterDomains.includes(p.domain)) : paths;
  const filtered = hasPersonalization
    ? [...base].sort((a, b) => scoreEntity(b as any) - scoreEntity(a as any))
    : base;
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
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Heart size={14} className="text-terracotta fill-terracotta" />
            <span className="font-body font-semibold text-foreground">{stats.loved}</span> loved
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ThumbsUp size={14} className="text-primary fill-primary/10" />
            <span className="font-body font-semibold text-foreground">{stats.liked}</span> liked
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Bookmark size={14} className="text-blue-500 fill-blue-500/10" />
            <span className="font-body font-semibold text-foreground">{stats.bookmarked}</span> saved
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <XCircle size={14} className="text-muted-foreground" />
            <span className="font-body font-semibold text-foreground">{stats.skipped}</span> skipped
          </span>
        </div>
        {interactionCount >= 3 && !showBlueprint && (
          <Button size="sm" variant="outline" onClick={runAnalysis} disabled={analyzing} className="h-8 text-xs rounded-full px-4 border-primary/20 hover:bg-primary/5 hover:text-primary">
            {analyzing ? <><Loader2 size={12} className="mr-1.5 animate-spin" /> Analyzing...</> : <><Brain size={12} className="mr-1.5" /> Analyze Vibes</>}
          </Button>
        )}
      </div>

      {/* Domain Filter & Progress Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-card/60 border border-border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-body text-xs text-muted-foreground shrink-0">Filter by domain:</span>
          <MultiSelect
            options={domains}
            selected={filterDomains}
            onChange={(next) => { setFilterDomains(next); setCurrentIndex(0); }}
            label="domains"
            placeholder="All domains"
            totalCount={paths.length}
          />
        </div>
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <span className="font-body text-xs text-muted-foreground">Card {currentIndex + 1} of {filtered.length}</span>
          <div className="flex gap-1 shrink-0">
            {filtered.slice(Math.max(0, currentIndex - 3), currentIndex + 4).map((_, i) => {
              const idx = Math.max(0, currentIndex - 3) + i;
              return <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-primary w-3" : interactions[filtered[idx]?.id] ? "bg-primary/45" : "bg-muted"}`} />;
            })}
          </div>
        </div>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div key={current.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25 }}>
            <Card className={`overflow-hidden transition-all duration-300 rounded-2xl border shadow-md hover:shadow-lg ${
              interactions[current.id] === "love" ? "border-terracotta/40 ring-1 ring-terracotta/10" :
              interactions[current.id] === "like" ? "border-primary/40 ring-1 ring-primary/10" :
              interactions[current.id] === "bookmark" ? "border-blue-500/40 ring-1 ring-blue-500/10" :
              interactions[current.id] === "not_for_me" ? "opacity-75" : ""
            }`}>
              
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-transparent p-6 border-b border-border/40">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-3xl shadow-sm shrink-0">
                    {current.icon_emoji || "💼"}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h2 className="font-display text-lg font-bold text-foreground leading-snug">{current.title}</h2>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">🌐 {current.domain}</Badge>
                      {current.industry && <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">🏭 {current.industry}</Badge>}
                      {current.sector && <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">📊 {current.sector}</Badge>}
                      {current.difficulty && <Badge variant="outline" className="px-2 py-0.5 text-[10px]">{current.difficulty}</Badge>}
                      {current.demand_level && <Badge variant="outline" className="px-2 py-0.5 text-[10px]">📈 {current.demand_level}</Badge>}
                      {current.avg_salary_usd && <Badge variant="outline" className="px-2 py-0.5 text-[10px]">💰 {current.avg_salary_usd}</Badge>}
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-3.5 sm:p-6 space-y-4 sm:space-y-5">
                {/* Description */}
                {current.description && (
                  <p className="font-body text-sm text-foreground leading-relaxed whitespace-pre-line">{current.description}</p>
                )}

                {/* Key Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {current.salary_range && (
                    <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-0.5 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={13} className="text-accent-foreground" />
                        <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Salary Range</span>
                      </div>
                      <p className="font-display text-xs font-bold text-foreground">{current.salary_range}</p>
                    </div>
                  )}
                  {current.demand_level && (
                    <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-0.5 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={13} className={demandColor(current.demand_level)} />
                        <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Market Demand</span>
                      </div>
                      <p className={`font-display text-xs font-bold ${demandColor(current.demand_level)}`}>{current.demand_level}</p>
                    </div>
                  )}
                  {current.growth_trajectory && (
                    <div className="p-3.5 rounded-xl bg-card border border-border/60 space-y-0.5 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <Zap size={13} className="text-primary" />
                        <span className="font-body text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Growth Potential</span>
                      </div>
                      <p className="font-display text-xs font-bold text-foreground">{current.growth_trajectory}</p>
                    </div>
                  )}
                </div>

                {/* Day in the life */}
                {current.day_to_day && (
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Clock size={14} className="text-primary" />
                      <span className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">A Typical Day</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{current.day_to_day}</p>
                  </div>
                )}

                {/* Expandable CTA */}
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-full text-center font-body text-xs text-primary font-medium hover:underline py-1.5 border-t border-border/20"
                >
                  {expanded ? "Collapse detailed breakdown ↑" : "Reveal detailed requirements (skills, trends, courses) ↓"}
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden pt-2">
                      {/* Skills */}
                      {current.related_skills && current.related_skills.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground"><Brain size={13} className="text-primary" /> Skills Required</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.related_skills.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Tools */}
                      {current.tools_certifications && current.tools_certifications.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground"><Star size={13} className="text-accent-foreground" /> Tools & Certifications</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.tools_certifications.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Industry Trends */}
                      {current.industry_trends && (
                        <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/15 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={13} className="text-accent-foreground" />
                            <span className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">Industry Trends</span>
                          </div>
                          <p className="font-body text-xs text-muted-foreground leading-relaxed">{current.industry_trends}</p>
                        </div>
                      )}

                      {/* Soft Skills */}
                      {current.soft_skills && current.soft_skills.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground">💬 Soft Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.soft_skills.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Interests */}
                      {current.interests && current.interests.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground">✨ Fit indicators</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.interests.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Countries in demand */}
                      {current.countries_in_demand && current.countries_in_demand.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground">🌍 Global Demand Locations</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.countries_in_demand.map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Related job roles */}
                      {current.related_job_roles && current.related_job_roles.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground">👔 Related Job Titles</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.related_job_roles.map(r => <Badge key={r} variant="outline" className="text-xs">{r}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Related subjects */}
                      {current.related_subjects && current.related_subjects.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground">📚 Related Academic Subjects</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.related_subjects.map(s => <Badge key={s} variant="outline" className="text-xs">{s}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Related universities */}
                      {current.related_universities && current.related_universities.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground">🎓 Key Target Universities</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.related_universities.slice(0, 12).map(u => <Badge key={u} variant="outline" className="text-xs">{u}</Badge>)}
                          </div>
                        </div>
                      )}

                      {/* Related courses */}
                      {current.related_courses && current.related_courses.length > 0 && (
                        <div className="space-y-1.5">
                          <h4 className="font-display text-xs font-semibold flex items-center gap-1.5 text-foreground">💻 Suggested Learning Courses</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {current.related_courses.slice(0, 12).map(c => <Badge key={c} variant="outline" className="text-xs">{c}</Badge>)}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Interaction Buttons */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 pt-4 border-t border-border/50 font-body">
                  {([
                    { type: "like" as InteractionType, icon: ThumbsUp, label: "Like", activeClass: "bg-primary hover:bg-primary/90 border-primary text-primary-foreground font-semibold" },
                    { type: "love" as InteractionType, icon: Heart, label: "Love", activeClass: "bg-terracotta hover:bg-terracotta/90 border-terracotta text-primary-foreground font-semibold" },
                    { type: "bookmark" as InteractionType, icon: Bookmark, label: "Save", activeClass: "bg-blue-500 hover:bg-blue-600 border-blue-500 text-white font-semibold" },
                    { type: "not_for_me" as InteractionType, icon: XCircle, label: "Not Me", activeClass: "bg-muted-foreground hover:bg-muted-foreground/90 text-primary-foreground font-semibold" },
                  ]).map(btn => {
                    const active = interactions[current.id] === btn.type;
                    return (
                      <Button
                        key={btn.type}
                        variant={active ? "default" : "outline"}
                        className={`flex flex-col items-center gap-1.5 h-auto py-2 sm:py-2.5 px-0.5 sm:px-2 rounded-xl transition-all ${active ? btn.activeClass : "border-border/80 hover:bg-muted/40 hover:border-primary/30"}`}
                        onClick={() => handleInteraction(current.id, btn.type)}
                      >
                        <btn.icon size={16} className={active ? "fill-current" : ""} />
                        <span className="text-[10px] uppercase tracking-wider">{btn.label}</span>
                      </Button>
                    );
                  })}
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-between pt-1 border-t border-border/10">
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setExpanded(false); }} disabled={currentIndex === 0} className="text-xs rounded-full h-[36px] px-4">
                    <ChevronLeft size={14} className="mr-1.5" /> Previous
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setCurrentIndex(Math.min(filtered.length - 1, currentIndex + 1)); setExpanded(false); }} disabled={currentIndex >= filtered.length - 1} className="text-xs rounded-full h-[36px] px-4">
                    Next <ChevronRight size={14} className="ml-1.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Behavioral Blueprint */}
      {showBlueprint && blueprint && (
        <BlueprintCard
          blueprint={blueprint}
          variant="career-cards"
          onGenerateRoadmap={onGenerateRoadmap}
          generatingRoadmap={generatingRoadmap}
          onClose={() => setShowBlueprint(false)}
        />
      )}
    </div>
  );
};

export default CareerCardDeck;
