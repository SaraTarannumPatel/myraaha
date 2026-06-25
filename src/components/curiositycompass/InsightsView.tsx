import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Map, 
  Zap, 
  ArrowRight, 
  RefreshCw, 
  Sparkles, 
  Compass, 
  Trophy, 
  Target, 
  Lock, 
  CheckCircle2, 
  ChevronRight, 
  BookOpen, 
  Sliders, 
  UserCheck 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Conclusion {
  id?: string;
  test_type: "discovery" | "psychometric" | "combined";
  archetype: string | null;
  archetype_description: string | null;
  top_domains: string[];
  top_skills: string[];
  work_style: string | null;
  motivation_type: string | null;
  cognitive_style: string | null;
  ideal_environment: string | null;
  strengths: string[];
  growth_areas: string[];
  recommended_modules: { module_key: string; reason: string }[];
  recommended_career_paths: string[];
  confidence_score: number;
  generated_at: string;
}

const MODULE_ROUTES: Record<string, { path: string; label: string; icon: any; color: string }> = {
  roadmap: { path: "/dashboard/roadmap", label: "AI Roadmap", icon: Map, color: "from-[#5500cb] to-[#7c3aed]" },
  skill_stacker: { path: "/dashboard/skill-stacker", label: "SkillStacker", icon: Zap, color: "from-amber-500 to-orange-600" },
  job_matching: { path: "/dashboard/job-matching", label: "Job Matching", icon: UserCheck, color: "from-emerald-500 to-teal-600" },
  mentor_matchmaking: { path: "/dashboard/mentor-matchmaking", label: "Mentor Match", icon: Compass, color: "from-sky-500 to-blue-600" },
  project_playground: { path: "/dashboard/project-playground", label: "Project Playground", icon: Sliders, color: "from-pink-500 to-rose-600" },
  career_therapist: { path: "/dashboard/career-therapist", label: "Career Therapist", icon: Brain, color: "from-purple-500 to-indigo-600" },
  career_coach: { path: "/dashboard/career-coach", label: "Career Coach", icon: Sparkles, color: "from-violet-500 to-fuchsia-600" },
  content_library: { path: "/dashboard/content-library", label: "Content Library", icon: BookOpen, color: "from-blue-500 to-indigo-600" },
  peer_circles: { path: "/dashboard/peer-circles", label: "Peer Circles", icon: Trophy, color: "from-teal-500 to-cyan-600" },
  mvp_builder: { path: "/dashboard/mvp-builder", label: "MVP Builder", icon: Target, color: "from-red-500 to-orange-600" },
  moodboard: { path: "/dashboard/career-moodboard", label: "Career Moodboard", icon: Map, color: "from-fuchsia-500 to-pink-600" },
  transition_planner: { path: "/dashboard/transition-planner", label: "Transition Planner", icon: Sliders, color: "from-indigo-500 to-blue-600" },
  selfgraph: { path: "/dashboard/selfgraph", label: "SelfGraph™", icon: Brain, color: "from-[#5500cb] to-indigo-600" },
};

const InsightsView = ({
  conclusion = null,
  loading = false,
  regenerate,
  regenerating = false,
}: {
  conclusion?: Conclusion | null;
  loading?: boolean;
  regenerate?: () => Promise<void>;
  regenerating?: boolean;
} = {}) => {

  const { profile } = useAuth();
  const navigate = useNavigate();

  const discoveryDone = !!profile?.journey_responses?.assessment_completed;
  const psychometricDone = !!profile?.journey_responses?.psychometric_completed;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl border border-border shadow-xl p-8 space-y-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-accent/10 border-b-accent animate-spin" style={{ animationDirection: "reverse" }} />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Sparkles className="text-primary w-6 h-6 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="font-display text-base font-bold text-foreground">Synthesizing AI Insights...</h3>
          <p className="font-body text-xs text-muted-foreground max-w-xs leading-relaxed">
            Consolidating your choices, learning speeds, and cognitive signals into a personalized map.
          </p>
        </div>
      </div>
    );
  }

  if (!discoveryDone && !psychometricDone) {
    return (
      <div className="bg-white rounded-3xl border border-border shadow-xl p-8 text-center relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-6 max-w-md mx-auto py-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#5500cb] to-accent flex items-center justify-center text-white shadow-lg">
            <Lock size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-foreground">Insights Lockbox</h3>
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Complete either the Discovery or Psychometric assessments to generate your personal intelligence profile and match recommendations.
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard/curiosity-compass")} className="bg-primary hover:bg-[#4300a3] text-white rounded-full px-8 h-11 font-body text-xs font-bold transition-all shadow-md">
            Go to Assessments <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </div>
      </div>
    );
  }

  // Calculate percentage matching confidence
  const confidencePercent = conclusion?.confidence_score 
    ? Math.round(conclusion.confidence_score * 100) 
    : 75;

  return (
    <div className="space-y-8 w-full">
      {/* Premium Dashboard Header Card */}
      <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-accent/[0.02] pointer-events-none" />
        <div className="relative z-10 space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary w-5 h-5" />
            <span className="font-body text-[10px] text-primary uppercase tracking-wider font-extrabold">Profile Intelligence Synthesis</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold text-foreground tracking-tight">
            Your Curiosity Synthesis
          </h2>
          <p className="font-body text-xs text-muted-foreground max-w-xl leading-relaxed">
            This dashboard integrates all active exploration vectors, behavioral traits, and testing signals to construct your optimized progression pathway.
          </p>
        </div>

        {/* Confidence Gauge & Action */}
        <div className="relative z-10 flex items-center gap-4 sm:gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-border/40 pt-4 md:pt-0">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center bg-primary/5 rounded-full border border-primary/20">
              <span className="font-display text-xs font-extrabold text-primary">{confidencePercent}%</span>
            </div>
            <div>
              <p className="font-body text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Match Confidence</p>
              <p className="font-body text-xs text-foreground font-semibold">Highly Calibrated</p>
            </div>
          </div>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={regenerate} 
            disabled={regenerating} 
            className="rounded-full h-10 px-5 text-xs font-bold border-border/80 hover:bg-muted/10 bg-white shadow-sm shrink-0 flex items-center gap-2"
          >
            <RefreshCw size={13} className={`${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "Synthesizing…" : "Refresh Profiling"}
          </Button>
        </div>
      </div>

      {/* Top domains + skills in responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Top Domains for You */}
        <div className="bg-white rounded-3xl border border-border shadow-xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Map size={18} className="text-primary" /> Top Alignment Domains
                </h3>
                <p className="font-body text-xs text-muted-foreground">Areas showcasing your strongest curiosity responses</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(conclusion?.top_domains || []).map((d) => (
                <motion.div
                  key={d}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/dashboard/explore?q=${encodeURIComponent(d)}`)}
                  className="px-4 py-2 bg-gradient-to-r from-primary/5 to-accent/5 hover:from-[#5500cb] hover:to-accent text-foreground hover:text-white rounded-2xl cursor-pointer transition-all duration-300 font-body text-xs font-semibold border border-border/80 flex items-center gap-1.5 shadow-sm"
                >
                  <span>{d}</span>
                  <ChevronRight size={12} className="opacity-60" />
                </motion.div>
              ))}
              {!(conclusion?.top_domains?.length) && (
                <div className="py-4 text-center w-full">
                  <p className="font-body text-xs text-muted-foreground">No domains calculated. Complete further career card exploration.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills to Sharpen */}
        <div className="bg-white rounded-3xl border border-border shadow-xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[200px]">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Zap size={18} className="text-primary" /> Recommended Skills to Build
              </h3>
              <p className="font-body text-xs text-muted-foreground">Competency vectors mapped directly into your SkillStacker dashboard</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(conclusion?.top_skills || []).map((s) => (
                <Badge 
                  key={s} 
                  variant="outline" 
                  className="px-3.5 py-2 text-xs rounded-2xl font-body font-semibold border-border/85 bg-muted/20 hover:bg-primary/5 transition-all text-foreground"
                >
                  ⚡ {s}
                </Badge>
              ))}
              {!(conclusion?.top_skills?.length) && (
                <div className="py-4 text-center w-full">
                  <p className="font-body text-xs text-muted-foreground">No recommended skills yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended modules */}
      <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8 relative overflow-hidden space-y-6 w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-1">
          <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
            <ArrowRight size={18} className="text-primary" /> Your Actionable Roadmap Next Steps
          </h3>
          <p className="font-body text-xs text-muted-foreground">Optimized platform routes ranked dynamically by your behavioral inputs</p>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {(conclusion?.recommended_modules || []).map((m) => {
            const route = MODULE_ROUTES[m.module_key] || {
              path: `/dashboard/${m.module_key.replace("_", "-")}`,
              label: m.module_key.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
              icon: Sparkles,
              color: "from-primary to-accent"
            };

            const IconComp = route.icon;

            return (
              <motion.button
                key={m.module_key}
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => navigate(route.path)}
                className="text-left p-5 rounded-3xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-white flex items-start gap-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.01] to-transparent pointer-events-none" />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${route.color} flex items-center justify-center shrink-0 text-white shadow-md group-hover:scale-105 transition-transform`}>
                  <IconComp size={22} />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">{route.label}</span>
                    <ArrowRight size={14} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-2">{m.reason}</p>
                </div>
              </motion.button>
            );
          })}
          {!(conclusion?.recommended_modules?.length) && (
            <div className="col-span-2 py-8 text-center border border-dashed border-border/80 rounded-2xl">
              <p className="font-body text-xs text-muted-foreground">Unlock recommended modules by answering more assessment queries.</p>
            </div>
          )}
        </div>
      </div>

      {/* Career paths */}
      {conclusion?.recommended_career_paths?.length ? (
        <div className="bg-white rounded-3xl border border-border shadow-xl p-6 sm:p-8 relative overflow-hidden space-y-6 w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-foreground">Matched Career Directions</h3>
              <p className="font-body text-xs text-muted-foreground">High-growth paths aligning with your behavioral blueprint</p>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {conclusion.recommended_career_paths.map((p) => (
                <motion.div
                  key={p}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/dashboard/explore?q=${encodeURIComponent(p)}`)}
                  className="px-4 py-2.5 rounded-2xl bg-muted/30 border border-border/80 hover:border-primary/30 font-body text-xs font-semibold text-foreground hover:text-primary cursor-pointer transition-all duration-300 shadow-sm hover:shadow flex items-center gap-1.5"
                >
                  <Target size={13} className="text-primary opacity-80" />
                  <span>{p}</span>
                  <ChevronRight size={12} className="text-muted-foreground/60 ml-0.5" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default InsightsView;
