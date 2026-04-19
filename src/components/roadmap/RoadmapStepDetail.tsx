import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Clock, BookOpen, Youtube, FileText, Globe, Users, Mic,
  Code, Wrench, FlaskConical, Lightbulb, AlertTriangle,
  CheckCircle, TrendingUp, DollarSign, RefreshCw, ExternalLink,
  Sparkles, Star, Target, BookMarked, GraduationCap, Brain,
  ChevronDown, ChevronUp, Play, Zap
} from "lucide-react";

interface RoadmapStepDetailProps {
  open: boolean;
  onClose: () => void;
  step: {
    id: string;
    title: string;
    description?: string;
    phase: string;
    category: string;
    priority?: string;
    skill_tags?: string[];
  };
  roadmapTitle?: string;
  userGoals?: string;
}

const RESOURCE_SECTIONS = [
  { key: "free_courses", label: "Free Courses", icon: GraduationCap, color: "text-primary" },
  { key: "youtube", label: "YouTube", icon: Youtube, color: "text-primary" },
  { key: "paid_courses", label: "Paid Courses", icon: Star, color: "text-primary" },
  { key: "books", label: "Books", icon: BookOpen, color: "text-primary" },
  { key: "articles_blogs", label: "Articles & Blogs", icon: FileText, color: "text-primary" },
  { key: "documentation_official", label: "Official Docs", icon: Globe, color: "text-primary" },
  { key: "practice_platforms", label: "Practice Platforms", icon: FlaskConical, color: "text-primary" },
  { key: "tools_apps", label: "Tools & Apps", icon: Wrench, color: "text-primary" },
  { key: "communities", label: "Communities", icon: Users, color: "text-primary" },
  { key: "podcasts", label: "Podcasts", icon: Mic, color: "text-primary" },
  { key: "github_repos", label: "GitHub Repos", icon: Code, color: "text-primary" },
  { key: "research_papers", label: "Research Papers", icon: Brain, color: "text-primary" },
];

const STEP_TYPE_META: Record<string, { color: string; label: string }> = {
  learn: { color: "bg-primary/10 text-primary border-primary/20", label: "Learn" },
  practice: { color: "bg-accent text-primary border-accent", label: "Practice" },
  build: { color: "bg-primary/15 text-primary border-primary/30", label: "Build" },
  research: { color: "bg-accent/60 text-primary border-accent", label: "Research" },
  network: { color: "bg-primary/10 text-primary border-primary/20", label: "Network" },
  reflect: { color: "bg-accent/40 text-primary border-accent/60", label: "Reflect" },
};

const RoadmapStepDetail = ({ open, onClose, step, roadmapTitle, userGoals }: RoadmapStepDetailProps) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSubStep, setExpandedSubStep] = useState<number | null>(0);
  const [expandedSection, setExpandedSection] = useState<string | null>("free_courses");

  useEffect(() => {
    if (open && step?.id) {
      setDetails(null);
      setActiveTab("overview");
      setExpandedSubStep(0);
      fetchDetails();
    }
  }, [open, step?.id]);

  const fetchDetails = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("roadmap-step-details", {
        body: {
          stepId: step.id,
          stepTitle: step.title,
          stepDescription: step.description || "",
          stepPhase: step.phase,
          stepCategory: step.category,
          roadmapTitle: roadmapTitle || "",
          userGoals: userGoals || "",
          forceRefresh,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setDetails(data);
    } catch (err: any) {
      console.error("Step detail error:", err);
      toast.error("Failed to load step details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resourceCount = details
    ? Object.values(details.learning_resources || {}).reduce((acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0), 0)
    : 0;

  const subStepProgress = details?.sub_steps?.length
    ? Math.round(((expandedSubStep ?? -1) + 1) / details.sub_steps.length * 100)
    : 0;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl xl:max-w-3xl overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <SheetHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] capitalize">{step.phase}</Badge>
                  <Badge variant="secondary" className="text-[10px] capitalize">{step.category}</Badge>
                  {details?.cached && <Badge variant="outline" className="text-[10px] text-muted-foreground">Cached</Badge>}
                </div>
                <SheetTitle className="font-display text-lg text-foreground leading-tight">{step.title}</SheetTitle>
                {details?.total_time_estimate && (
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                      <Clock size={12} /> {details.total_time_estimate}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                      <Target size={12} /> {String(details.difficulty_level)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                      <BookMarked size={12} /> {String(resourceCount)} resources
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1"
                disabled={loading}
                onClick={() => fetchDetails(true)}
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
          </SheetHeader>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 px-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles size={32} className="text-primary animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-display text-foreground text-base">Analyzing your roadmap step...</p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Cross-referencing career directories, job roles, and global learning resources
              </p>
            </div>
            <div className="w-48">
              <Progress value={undefined} className="h-1 animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground font-body">
              <span>📚 Scanning learning platforms...</span>
              <span>🎯 Matching career directory data...</span>
              <span>⏱️ Estimating time requirements...</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && details && (
          <div className="px-6 py-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-4 mb-4">
                <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                <TabsTrigger value="steps" className="text-xs">
                  Steps ({String(details.sub_steps?.length || 0)})
                </TabsTrigger>
                <TabsTrigger value="resources" className="text-xs">
                  Resources ({String(resourceCount)})
                </TabsTrigger>
                <TabsTrigger value="guidance" className="text-xs">Guidance</TabsTrigger>
              </TabsList>

              {/* ── Overview Tab ────────────────────────────────────────── */}
              <TabsContent value="overview" className="space-y-4">
                {/* Overview paragraph */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="font-body text-sm text-foreground leading-relaxed">{details.overview}</p>
                </div>

                {/* Time breakdown */}
                {details.time_breakdown && (
                  <div className="space-y-3">
                    <h3 className="font-display text-sm text-foreground flex items-center gap-2">
                      <Clock size={16} className="text-primary" /> Time Breakdown
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-card border border-border text-center">
                        <p className="font-display text-lg text-foreground">{details.time_breakdown.total || details.total_time_estimate}</p>
                        <p className="font-body text-xs text-muted-foreground">Total estimate</p>
                      </div>
                      <div className="p-3 rounded-lg bg-card border border-border text-center">
                        <p className="font-display text-lg text-foreground">{details.time_breakdown.weekly_commitment || "—"}</p>
                        <p className="font-body text-xs text-muted-foreground">Weekly commitment</p>
                      </div>
                    </div>
                    {details.time_breakdown.by_activity && (
                      <div className="space-y-2">
                        {Object.entries(details.time_breakdown.by_activity).map(([k, v]: [string, any]) => (
                          <div key={k} className="flex items-center justify-between text-xs font-body">
                            <span className="text-muted-foreground capitalize">{k}</span>
                            <span className="text-foreground">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {details.time_breakdown.milestones?.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-display text-xs text-muted-foreground uppercase tracking-wide">Weekly Goals</p>
                        {details.time_breakdown.milestones.map((m: any, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">W{m.week}</span>
                            <p className="font-body text-xs text-muted-foreground pt-1">{m.goal}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Career Context */}
                {details.career_context && (
                  <div className="space-y-3">
                    <h3 className="font-display text-sm text-foreground flex items-center gap-2">
                      <TrendingUp size={16} className="text-accent" /> Career Context
                    </h3>
                    {details.career_context.why_this_matters && (
                      <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                        <p className="font-body text-xs text-muted-foreground mb-0.5">Why this matters</p>
                        <p className="font-body text-sm text-foreground">{details.career_context.why_this_matters}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-2">
                      {details.career_context.industry_demand && (
                        <InfoRow icon={<TrendingUp size={13} />} label="Industry Demand" value={details.career_context.industry_demand} />
                      )}
                      {details.career_context.salary_impact && (
                        <InfoRow icon={<DollarSign size={13} />} label="Salary Impact" value={details.career_context.salary_impact} />
                      )}
                    </div>
                    {details.career_context.job_roles_that_need_this?.length > 0 && (
                      <div>
                        <p className="font-body text-xs text-muted-foreground mb-1.5">Job roles that need this</p>
                        <div className="flex flex-wrap gap-1.5">
                          {details.career_context.job_roles_that_need_this.map((r: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{r}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.career_context.prerequisite_knowledge?.length > 0 && (
                      <div>
                        <p className="font-body text-xs text-muted-foreground mb-1.5">Prerequisites</p>
                        <div className="flex flex-wrap gap-1.5">
                          {details.career_context.prerequisite_knowledge.map((p: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {details.career_context.what_comes_next && (
                      <div className="p-3 rounded-lg bg-muted/40 border border-border">
                        <p className="font-body text-xs text-muted-foreground">What comes next</p>
                        <p className="font-body text-sm text-foreground mt-0.5">{details.career_context.what_comes_next}</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* ── Sub-Steps Tab ────────────────────────────────────────── */}
              <TabsContent value="steps" className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-body text-sm text-muted-foreground">{details.sub_steps?.length || 0} granular steps</p>
                  <span className="font-body text-xs text-muted-foreground">{details.total_time_estimate}</span>
                </div>

                {details.sub_steps?.map((subStep: any, i: number) => {
                  const typeStyle = STEP_TYPE_META[subStep.type] || STEP_TYPE_META.learn;
                  const isExpanded = expandedSubStep === i;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div
                        className={`rounded-xl border overflow-hidden transition-all ${isExpanded ? "border-primary/30 shadow-sm" : "border-border"}`}
                      >
                        {/* Step Header */}
                        <button
                          className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                          onClick={() => setExpandedSubStep(isExpanded ? null : i)}
                        >
                          <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-display text-sm text-foreground">{subStep.title}</p>
                              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${typeStyle.color}`}>
                                {typeStyle.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-body text-xs text-muted-foreground flex items-center gap-0.5">
                                <Clock size={10} /> {subStep.time_estimate}
                              </span>
                            </div>
                          </div>
                          {isExpanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0 mt-1" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0 mt-1" />}
                        </button>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border bg-muted/10">
                                <p className="font-body text-sm text-muted-foreground pt-3">{subStep.description}</p>

                                {subStep.deliverable && (
                                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-accent/5 border border-accent/20">
                                    <CheckCircle size={14} className="text-accent shrink-0 mt-0.5" />
                                    <div>
                                      <p className="font-body text-[10px] text-muted-foreground">Deliverable</p>
                                      <p className="font-body text-xs text-foreground">{subStep.deliverable}</p>
                                    </div>
                                  </div>
                                )}

                                {subStep.tips?.length > 0 && (
                                  <div>
                                    <p className="font-body text-[10px] text-muted-foreground mb-1">Tips</p>
                                    <ul className="space-y-1">
                                      {subStep.tips.map((t: string, ti: number) => (
                                        <li key={ti} className="flex items-start gap-1.5 font-body text-xs text-muted-foreground">
                                          <Lightbulb size={11} className="text-amber-500 shrink-0 mt-0.5" />
                                          {t}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {subStep.skill_tags?.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {subStep.skill_tags.map((tag: string, ti: number) => (
                                      <Badge key={ti} variant="secondary" className="text-[10px]">{tag}</Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </TabsContent>

              {/* ── Resources Tab ────────────────────────────────────────── */}
              <TabsContent value="resources" className="space-y-3">
                <p className="font-body text-sm text-muted-foreground">{String(resourceCount)} curated external resources for this step</p>

                {RESOURCE_SECTIONS.map((section) => {
                  const items: any[] = details.learning_resources?.[section.key] || [];
                  if (!items.length) return null;
                  const isOpen = expandedSection === section.key;
                  const SectionIcon = section.icon;

                  return (
                    <div key={section.key} className="rounded-xl border border-border overflow-hidden">
                      <button
                        className="w-full flex items-center gap-3 p-3 bg-card hover:bg-muted/30 transition-colors text-left"
                        onClick={() => setExpandedSection(isOpen ? null : section.key)}
                      >
                        <SectionIcon size={16} className={section.color} />
                        <span className="font-display text-sm text-foreground flex-1">{section.label}</span>
                        <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
                        {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="divide-y divide-border">
                              {items.map((item: any, i: number) => (
                                <ResourceCard key={i} item={item} sectionKey={section.key} />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </TabsContent>

              {/* ── Guidance Tab ─────────────────────────────────────────── */}
              <TabsContent value="guidance" className="space-y-4">
                {details.guidance?.mentor_advice && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain size={16} className="text-primary" />
                      <p className="font-display text-sm text-foreground">Expert Advice</p>
                    </div>
                    <p className="font-body text-sm text-muted-foreground italic">"{details.guidance.mentor_advice}"</p>
                  </div>
                )}

                {details.guidance?.best_practices?.length > 0 && (
                  <GuidanceSection
                    title="Best Practices"
                    icon={<CheckCircle size={16} className="text-emerald-500" />}
                    items={details.guidance.best_practices}
                    itemColor="text-emerald-600"
                    itemIcon={<CheckCircle size={12} />}
                  />
                )}

                {details.guidance?.common_mistakes?.length > 0 && (
                  <GuidanceSection
                    title="Common Mistakes to Avoid"
                    icon={<AlertTriangle size={16} className="text-amber-500" />}
                    items={details.guidance.common_mistakes}
                    itemColor="text-amber-600"
                    itemIcon={<AlertTriangle size={12} />}
                  />
                )}

                {details.guidance?.success_indicators?.length > 0 && (
                  <GuidanceSection
                    title="Success Indicators"
                    icon={<Target size={16} className="text-blue-500" />}
                    items={details.guidance.success_indicators}
                    itemColor="text-blue-600"
                    itemIcon={<Zap size={12} />}
                  />
                )}

                {details.guidance?.portfolio_ideas?.length > 0 && (
                  <div>
                    <h3 className="font-display text-sm text-foreground flex items-center gap-2 mb-2">
                      <Star size={16} className="text-amber-500" /> Portfolio Ideas
                    </h3>
                    <div className="space-y-2">
                      {details.guidance.portfolio_ideas.map((idea: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-[10px] font-bold text-amber-600">{i + 1}</span>
                          <p className="font-body text-xs text-foreground">{idea}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty state (before any generation) */}
        {!loading && !details && (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <Sparkles size={40} className="text-primary mb-4" />
            <h3 className="font-display text-foreground text-base">No details yet</h3>
            <p className="font-body text-sm text-muted-foreground mt-1 mb-4">Click refresh to generate a deep analysis</p>
            <Button onClick={() => fetchDetails(true)} className="gap-2">
              <RefreshCw size={14} /> Generate Details
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

/* ─── Resource Card ─────────────────────────────────────────────────── */
const ResourceCard = ({ item, sectionKey }: { item: any; sectionKey: string }) => {
  const title = item.title || item.channel || "";
  const subtitle = item.platform || item.source || item.organization || item.authors || item.stars_approx || "";
  const why = item.why || "";
  const url = item.url || "";
  const extra = item.duration || item.price_range || item.level || item.type || (item.free_tier ? "Free tier" : "") || "";

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/20 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-body text-sm text-foreground truncate">{title}</p>
            {subtitle && <p className="font-body text-[10px] text-muted-foreground">{subtitle}</p>}
            {extra && <span className="inline-block px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground mt-0.5">{extra}</span>}
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
        {why && <p className="font-body text-[10px] text-muted-foreground mt-1 italic">"{why}"</p>}
      </div>
    </div>
  );
};

/* ─── Guidance Section ──────────────────────────────────────────────── */
const GuidanceSection = ({
  title, icon, items, itemColor, itemIcon,
}: {
  title: string; icon: React.ReactNode; items: string[]; itemColor: string; itemIcon: React.ReactNode;
}) => (
  <div>
    <h3 className="font-display text-sm text-foreground flex items-center gap-2 mb-2">
      {icon} {title}
    </h3>
    <ul className="space-y-1.5">
      {items.map((item: string, i: number) => (
        <li key={i} className={`flex items-start gap-2 font-body text-xs ${itemColor}`}>
          <span className="shrink-0 mt-0.5">{itemIcon}</span>
          <span className="text-foreground">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

/* ─── Info Row ──────────────────────────────────────────────────────── */
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30 border border-border">
    <span className="text-muted-foreground shrink-0 mt-0.5">{icon}</span>
    <div>
      <p className="font-body text-[10px] text-muted-foreground">{label}</p>
      <p className="font-body text-xs text-foreground">{value}</p>
    </div>
  </div>
);

export default RoadmapStepDetail;
