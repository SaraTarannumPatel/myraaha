import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, ArrowRight, Loader2, Star } from "lucide-react";

export type Blueprint = {
  /** Headline narrative — what the user's behaviour says */
  ai_summary: string;
  /** Domains/categories the user is drawn toward */
  domains_attracted: string[];
  /** Domains/categories the user has rejected */
  domains_rejected: string[];
  /** Skills the user has resonated with */
  skills_resonated: string[];
  /** Personality / work-style signals as label/value pairs */
  personality_signals: Record<string, string>;
  /** Top 3 career paths inferred from the signals */
  top_paths: string[];
  /** Adjacent areas the user might enjoy but hasn't explored */
  blind_spots: string[];
  /** 0-1 confidence */
  confidence_score: number;
};

interface Props {
  blueprint: Blueprint;
  /** Triggered when user clicks "Generate your personalized AI Roadmap" */
  onGenerateRoadmap: () => void;
  generatingRoadmap?: boolean;
  onClose?: () => void;
  variant?: "story" | "challenge" | "visual" | "career-cards";
}

const titleByVariant: Record<NonNullable<Props["variant"]>, string> = {
  story: "your behavioral blueprint 🧬",
  challenge: "your work blueprint 🧬",
  visual: "your visual blueprint 🧬",
  "career-cards": "your career blueprint 🧬",
};

const BlueprintCard = ({ blueprint, onGenerateRoadmap, generatingRoadmap, onClose, variant = "story" }: Props) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <Card className="border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="pt-5 sm:pt-6 space-y-4 sm:space-y-5 flex flex-col min-h-0">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Brain className="text-primary" size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base sm:text-lg text-foreground leading-tight">
                {titleByVariant[variant]}
              </h3>
              <p className="font-body text-xs text-muted-foreground">
                confidence: {Math.round((blueprint.confidence_score || 0) * 100)}%
              </p>
            </div>
          </div>

          <div className="career-navigator-card-body space-y-4 sm:space-y-5 pr-1 pb-2">
            {blueprint.ai_summary && (
              <p className="font-body text-sm text-foreground leading-relaxed bg-muted/30 p-3 sm:p-4 rounded-lg">
                {blueprint.ai_summary}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <h4 className="font-display text-sm mb-2 text-success">you're drawn to</h4>
                <div className="flex flex-wrap gap-1.5">
                  {blueprint.domains_attracted.length === 0 ? (
                    <p className="font-body text-xs text-muted-foreground">No strong signals yet.</p>
                  ) : (
                    blueprint.domains_attracted.map((d) => (
                      <Badge key={d} className="bg-success/10 text-success border-success/30 text-xs">{d}</Badge>
                    ))
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-display text-sm mb-2 text-warmth">not your thing</h4>
                <div className="flex flex-wrap gap-1.5">
                  {blueprint.domains_rejected.length === 0 ? (
                    <p className="font-body text-xs text-muted-foreground">Nothing rejected yet.</p>
                  ) : (
                    blueprint.domains_rejected.map((d) => (
                      <Badge key={d} className="bg-warmth/10 text-warmth border-warmth/30 text-xs">{d}</Badge>
                    ))
                  )}
                </div>
              </div>
            </div>

            {blueprint.skills_resonated.length > 0 && (
              <div>
                <h4 className="font-display text-sm mb-2">skills you vibe with</h4>
                <div className="flex flex-wrap gap-1.5">
                  {blueprint.skills_resonated.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(blueprint.personality_signals).length > 0 && (
              <div>
                <h4 className="font-display text-sm mb-2">personality signals</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(blueprint.personality_signals).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-muted/30 border border-border min-w-0">
                      <p className="font-body text-[10px] text-muted-foreground uppercase tracking-wider truncate">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="font-display text-sm text-foreground capitalize truncate">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {blueprint.top_paths.length > 0 && (
              <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-display text-sm mb-2 sm:mb-3 flex items-center gap-2">
                  <Star size={14} className="text-primary" /> top paths for you
                </h4>
                {blueprint.top_paths.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1.5">
                    <span className="font-display text-sm text-primary shrink-0">{i + 1}.</span>
                    <span className="font-body text-sm text-foreground">{p}</span>
                  </div>
                ))}
              </div>
            )}

            {blueprint.blind_spots.length > 0 && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <h4 className="font-display text-xs mb-1.5 text-accent-foreground">
                  💡 you might also enjoy (but haven't explored yet)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {blueprint.blind_spots.map((b) => (
                    <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border/50 space-y-2 shrink-0">
            <Button
              className="w-full"
              onClick={onGenerateRoadmap}
              disabled={generatingRoadmap}
            >
              {generatingRoadmap ? (
                <><Loader2 size={14} className="mr-2 animate-spin" /> Generating your roadmap...</>
              ) : (
                <>
                  <Sparkles size={14} className="mr-2" />
                  <span className="truncate">Generate Your Personalized AI Roadmap</span>
                  <ArrowRight size={14} className="ml-2 shrink-0" />
                </>
              )}
            </Button>
            {onClose && (
              <Button variant="ghost" className="w-full" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BlueprintCard;
