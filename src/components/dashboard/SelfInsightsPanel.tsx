import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Brain, Zap, TrendingUp, ChevronRight } from "lucide-react";

interface IdentityEval {
  creativity_score: number | null;
  problem_solving_score: number | null;
  leadership_score: number | null;
  resilience_score: number | null;
  collaboration_score: number | null;
  adaptability_score: number | null;
  confidence_score: number | null;
  overall_growth: number | null;
}

interface BehaviorPattern {
  pattern_type: string;
  pattern_description: string;
  is_positive: boolean | null;
  strength: number | null;
}

interface EnergyZone {
  domain: string;
  energy_level: number;
  engagement_score: number | null;
}

const SelfInsightsPanel = () => {
  const { user } = useAuth();
  const [evaluation, setEvaluation] = useState<IdentityEval | null>(null);
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [energyZones, setEnergyZones] = useState<EnergyZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("identity_evaluations").select("*").eq("user_id", user.id).order("evaluated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("behavior_patterns").select("pattern_type, pattern_description, is_positive, strength").eq("user_id", user.id).order("strength", { ascending: false }).limit(4),
      supabase.from("energy_zones").select("domain, energy_level, engagement_score").eq("user_id", user.id).order("energy_level", { ascending: false }).limit(5),
    ]).then(([evalRes, patternsRes, energyRes]) => {
      setEvaluation(evalRes.data as IdentityEval | null);
      setPatterns((patternsRes.data || []) as BehaviorPattern[]);
      setEnergyZones((energyRes.data || []) as EnergyZone[]);
      setLoading(false);
    });
  }, [user]);

  const hasData = evaluation || patterns.length > 0 || energyZones.length > 0;

  if (loading || !hasData) return null;

  const traits = evaluation ? [
    { label: "Creativity", value: evaluation.creativity_score },
    { label: "Problem Solving", value: evaluation.problem_solving_score },
    { label: "Leadership", value: evaluation.leadership_score },
    { label: "Resilience", value: evaluation.resilience_score },
    { label: "Collaboration", value: evaluation.collaboration_score },
    { label: "Adaptability", value: evaluation.adaptability_score },
  ].filter(t => t.value != null) : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Self Insights
          </CardTitle>
          <Link to="/dashboard/selfgraph" className="text-xs text-primary hover:underline flex items-center gap-1">
            Full SelfGraph <ChevronRight size={12} />
          </Link>
        </div>
        <CardDescription>Key identity insights from your SelfGraph</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trait Scores */}
        {traits.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {traits.slice(0, 6).map(t => (
              <div key={t.label} className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" className="stroke-primary" strokeWidth="3"
                      strokeDasharray={`${(t.value! / 100) * 94.2} 94.2`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-body text-[10px] font-semibold text-foreground">
                    {t.value}
                  </span>
                </div>
                <p className="font-body text-[10px] text-muted-foreground">{t.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Energy Zones */}
        {energyZones.length > 0 && (
          <div>
            <h4 className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <Zap size={12} /> Energy Zones
            </h4>
            <div className="space-y-2">
              {energyZones.map(zone => (
                <div key={zone.domain} className="flex items-center gap-3">
                  <span className="font-body text-xs text-foreground w-24 truncate">{zone.domain}</span>
                  <Progress value={zone.energy_level * 10} className="h-1.5 flex-1" />
                  <span className="font-body text-[10px] text-muted-foreground w-6 text-right">{zone.energy_level}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Behavior Patterns */}
        {patterns.length > 0 && (
          <div>
            <h4 className="font-body text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
              <TrendingUp size={12} /> Behavior Patterns
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {patterns.map((p, i) => (
                <Badge key={i} variant={p.is_positive ? "default" : "outline"} className="text-[10px]">
                  {p.pattern_description.length > 40 ? p.pattern_description.slice(0, 40) + "…" : p.pattern_description}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SelfInsightsPanel;
