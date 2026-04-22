import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Compass, Target, Zap, Trophy, RefreshCw, ArrowRight, Lightbulb, Heart, Map } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import RewardProgressTracker from "@/components/curiositycompass/RewardProgressTracker";
import { useAssessmentRewards } from "@/hooks/useAssessmentRewards";

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

const MODULE_ROUTES: Record<string, { path: string; label: string }> = {
  roadmap: { path: "/dashboard/roadmap", label: "AI Roadmap" },
  skill_stacker: { path: "/dashboard/skill-stacker", label: "SkillStacker" },
  job_matching: { path: "/dashboard/job-matching", label: "Job Matching" },
  mentor_matchmaking: { path: "/dashboard/mentor-matchmaking", label: "Mentor Match" },
  project_playground: { path: "/dashboard/project-playground", label: "Project Playground" },
  career_therapist: { path: "/dashboard/career-therapist", label: "Career Therapist" },
  career_coach: { path: "/dashboard/career-coach", label: "Career Coach" },
  content_library: { path: "/dashboard/content-library", label: "Content Library" },
  peer_circles: { path: "/dashboard/peer-circles", label: "Peer Circles" },
  mvp_builder: { path: "/dashboard/mvp-builder", label: "MVP Builder" },
  moodboard: { path: "/dashboard/career-moodboard", label: "Career Moodboard" },
  transition_planner: { path: "/dashboard/transition-planner", label: "Transition Planner" },
  selfgraph: { path: "/dashboard/selfgraph", label: "SelfGraph™" },
};

const InsightsView = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [conclusion, setConclusion] = useState<Conclusion | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const { progress } = useAssessmentRewards();

  const discoveryDone = !!profile?.journey_responses?.assessment_completed;
  const psychometricDone = !!profile?.journey_responses?.psychometric_completed;

  const fetchConclusion = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("assessment_conclusions" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setConclusion((data as any) || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchConclusion();
  }, [user]);

  const regenerate = async () => {
    if (!user) return;
    setRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("assessment-synthesizer", {
        body: { test_type: "combined" },
      });
      if (error) throw error;
      setConclusion(data);
      toast.success("Insights regenerated from your latest signals.");
    } catch (e: any) {
      toast.error(e?.message || "Could not regenerate insights.");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading your insights…</div>
      </div>
    );
  }

  if (!discoveryDone && !psychometricDone) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-center space-y-3">
          <Brain className="mx-auto text-primary" size={36} />
          <h3 className="font-display text-xl">Insights unlock after your assessments</h3>
          <p className="font-body text-sm text-muted-foreground">
            Complete the Discovery and Psychometric assessments to generate your personal insights report.
          </p>
          <Button onClick={() => navigate("/dashboard/curiosity-compass")}>
            Go to Curiosity Compass <ArrowRight size={14} className="ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Hero */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-accent/5">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles size={22} className="text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-body text-[11px] sm:text-xs uppercase tracking-wider text-muted-foreground">Your Archetype</p>
                <h2 className="font-display text-xl sm:text-2xl text-foreground">
                  {conclusion?.archetype || "The Explorer"}
                </h2>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={regenerate} disabled={regenerating}>
              <RefreshCw size={14} className={`mr-1.5 ${regenerating ? "animate-spin" : ""}`} />
              {regenerating ? "Synthesizing…" : "Regenerate"}
            </Button>
          </div>
          {conclusion?.archetype_description && (
            <p className="font-body text-sm text-foreground leading-relaxed">{conclusion.archetype_description}</p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Stat icon={Brain} label="Cognitive" value={conclusion?.cognitive_style || "—"} />
            <Stat icon={Heart} label="Motivation" value={conclusion?.motivation_type || "—"} />
            <Stat icon={Target} label="Work style" value={conclusion?.work_style || "—"} />
            <Stat icon={Compass} label="Confidence" value={`${Math.round((conclusion?.confidence_score || 0.7) * 100)}%`} />
          </div>
        </CardContent>
      </Card>

      {/* Reward trackers */}
      <div className="grid sm:grid-cols-2 gap-4">
        <RewardProgressTracker
          testType="discovery"
          title="Discovery Test rewards"
          subtitle="Unlock at 25, 50, 75 and 100%"
        />
        <RewardProgressTracker
          testType="psychometric"
          title="Psychometric Test rewards"
          subtitle="Unlock at 25, 50, 75 and 100%"
        />
      </div>

      {/* Top domains + skills */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Map size={16} className="text-primary" /> Top domains for you
            </CardTitle>
            <CardDescription>Where your signals point most strongly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(conclusion?.top_domains || []).map((d) => (
                <Badge key={d} variant="secondary" className="px-3 py-1.5 text-xs cursor-pointer" onClick={() => navigate(`/dashboard/explore?q=${encodeURIComponent(d)}`)}>
                  {d}
                </Badge>
              ))}
              {!(conclusion?.top_domains?.length) && (
                <p className="font-body text-xs text-muted-foreground">No domains yet. Complete more of the assessments.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Zap size={16} className="text-primary" /> Skills to sharpen
            </CardTitle>
            <CardDescription>Pulled into SkillStacker automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(conclusion?.top_skills || []).map((s) => (
                <Badge key={s} variant="outline" className="px-3 py-1.5 text-xs">{s}</Badge>
              ))}
              {!(conclusion?.top_skills?.length) && (
                <p className="font-body text-xs text-muted-foreground">No skill suggestions yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strengths + growth */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2 text-success">
              <Trophy size={16} /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(conclusion?.strengths || []).map((s, i) => (
              <p key={i} className="font-body text-sm flex items-start gap-2">
                <span className="text-success mt-0.5">●</span> {s}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card className="border-warmth/30 bg-warmth/5">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <Lightbulb size={16} className="text-warmth" /> Growth edges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(conclusion?.growth_areas || []).map((s, i) => (
              <p key={i} className="font-body text-sm flex items-start gap-2">
                <span className="text-warmth mt-0.5">●</span> {s}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommended modules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <ArrowRight size={16} className="text-primary" /> Where to go next
          </CardTitle>
          <CardDescription>Modules ranked for your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {(conclusion?.recommended_modules || []).map((m, i) => {
              const route = MODULE_ROUTES[m.module_key];
              if (!route) return null;
              return (
                <motion.button
                  key={m.module_key}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(route.path)}
                  className="text-left p-3 rounded-xl border border-border hover:border-primary/40 transition-all bg-card"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-sm">{route.label}</span>
                    <ArrowRight size={14} className="text-primary" />
                  </div>
                  <p className="font-body text-xs text-muted-foreground line-clamp-2">{m.reason}</p>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Career paths */}
      {conclusion?.recommended_career_paths?.length ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base">Career paths worth exploring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {conclusion.recommended_career_paths.map((p) => (
                <Badge key={p} variant="secondary" className="px-3 py-1.5 text-xs cursor-pointer" onClick={() => navigate(`/dashboard/explore?q=${encodeURIComponent(p)}`)}>
                  {p}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-card p-2.5 sm:p-3">
    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
      <Icon size={12} />
      <span className="font-body text-[10px] sm:text-[11px] uppercase tracking-wide">{label}</span>
    </div>
    <p className="font-display text-xs sm:text-sm text-foreground line-clamp-2">{value}</p>
  </div>
);

export default InsightsView;
