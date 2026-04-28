import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, RefreshCw, ArrowRight, Target, CheckCircle2, Calendar, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAICache } from "@/hooks/useAICache";

interface Milestone {
  title: string;
  timeframe: string;
  why: string;
  next_actions: string[];
}
interface Blueprint {
  headline: string;
  narrative: string;
  north_star: string;
  domains: string[];
  skills: string[];
  milestones: Milestone[];
  immediate_next_step: string;
  resources?: { title: string; url: string }[];
}

const CareerBlueprint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: cached, save } = useAICache<Blueprint>("blueprint:onepager", "blueprint");
  const [blueprint, setBlueprint] = useState<Blueprint | null>(cached);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (cached) setBlueprint(cached);
  }, [cached]);

  const generate = async () => {
    if (!user) {
      toast.error("Sign in to generate your blueprint");
      return;
    }
    setGenerating(true);
    try {
      // Pull live signals
      const { data: signals } = await supabase
        .from("user_signals")
        .select("signal_type,signal_value,strength,signal_context")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      const { data, error } = await supabase.functions.invoke("blueprint-generate", {
        body: { signals: signals || [] },
      });
      if (error) throw error;
      const bp = (data?.blueprint || data) as Blueprint;
      setBlueprint(bp);
      await save(bp);
      toast.success("Your Career Blueprint is ready ✨");
    } catch (e: any) {
      toast.error(e?.message || "Couldn't generate blueprint right now.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl sm:text-4xl text-foreground">Career Blueprint</h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          One click. Your interests → a step-by-step plan with milestones &amp; next actions.
        </p>
      </motion.div>

      {!blueprint && !generating && (
        <Card className="mt-6 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="text-primary" />
            </div>
            <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
              We'll analyze every signal you've shared across Compass, Skill Stacker, projects and saved cards — and turn
              it into a personal plan.
            </p>
            <Button onClick={generate} size="lg" className="w-full sm:w-auto">
              <Sparkles size={16} className="mr-2" /> Generate my Blueprint
            </Button>
          </CardContent>
        </Card>
      )}

      {generating && (
        <Card className="mt-6">
          <CardContent className="pt-6 text-center space-y-3">
            <Loader2 className="mx-auto animate-spin text-primary" size={32} />
            <p className="font-body text-sm text-muted-foreground">
              Reading your signals, talking to Gemini, searching live resources…
            </p>
          </CardContent>
        </Card>
      )}

      {blueprint && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-4">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6 space-y-3">
              <h2 className="font-display text-xl sm:text-2xl text-foreground">{blueprint.headline}</h2>
              <p className="font-body text-sm text-foreground leading-relaxed">{blueprint.narrative}</p>
              {blueprint.north_star && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="font-body text-xs uppercase tracking-wide text-muted-foreground">North Star</p>
                  <p className="font-display text-base text-foreground">{blueprint.north_star}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {(blueprint.domains || []).map((d) => (
                  <Badge key={d} className="bg-success/10 text-success border-success/30">{d}</Badge>
                ))}
                {(blueprint.skills || []).map((s) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {blueprint.immediate_next_step && (
            <Card className="border-warmth/40">
              <CardContent className="pt-5 flex items-start gap-3">
                <Target className="text-warmth mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="font-display text-sm">Your immediate next step</p>
                  <p className="font-body text-sm text-muted-foreground mt-1">{blueprint.immediate_next_step}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {(blueprint.milestones || []).map((m, i) => (
              <Card key={i}>
                <CardContent className="pt-5 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display text-sm shrink-0">{i + 1}</span>
                    <h3 className="font-display text-base text-foreground flex-1 min-w-0">{m.title}</h3>
                    <Badge variant="secondary" className="text-xs"><Calendar size={10} className="mr-1" />{m.timeframe}</Badge>
                  </div>
                  {m.why && <p className="font-body text-xs text-muted-foreground">{m.why}</p>}
                  <ul className="space-y-1.5 mt-2">
                    {(m.next_actions || []).map((a, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-success mt-0.5 shrink-0" />
                        <span className="font-body text-sm text-foreground">{a}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {blueprint.resources && blueprint.resources.length > 0 && (
            <Card>
              <CardContent className="pt-5">
                <h3 className="font-display text-sm mb-3">Curated resources</h3>
                <div className="space-y-2">
                  {blueprint.resources.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition"
                    >
                      <ExternalLink size={14} className="text-primary shrink-0" />
                      <span className="font-body text-sm text-foreground flex-1 min-w-0 truncate">{r.title}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={generate} variant="outline" className="flex-1">
              <RefreshCw size={14} className="mr-2" /> Refresh blueprint
            </Button>
            <Button onClick={() => navigate("/dashboard/roadmap")} className="flex-1">
              Open Roadmap <ArrowRight size={14} className="ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CareerBlueprint;
