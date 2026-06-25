import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Sparkles, RefreshCw, Compass, Target, AlertTriangle, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface FitRow {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  bucket: "best" | "force" | "no";
  score: number;
  reasons: any;
  meta: any;
}

interface CombinedConclusion {
  identity_summary?: string | null;
  dominant_archetype?: string | null;
  cognitive_signature?: string | null;
  risk_profile?: string | null;
  growth_orientation?: string | null;
  top_motivations?: any;
  domain_affinities?: any;
  values_anchors?: any;
  hard_constraints?: any;
  red_flag_traits?: any;
  narrative_long?: string | null;
  generated_at?: string;
}

const ENTITY_LABEL: Record<string, string> = {
  role: "Roles",
  industry: "Industries",
  sector: "Sectors",
  domain: "Domains",
  skill: "Skills",
  subject: "Subjects",
};

const BUCKET_CFG = {
  best: { label: "Best Fit", icon: Target, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  force: { label: "Force Fit", icon: Compass, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  no: { label: "No Fit", icon: AlertTriangle, color: "text-rose-700", bg: "bg-rose-50 border-rose-200" },
} as const;

export default function CombinedPathMap() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [conclusion, setConclusion] = useState<CombinedConclusion | null>(null);
  const [fits, setFits] = useState<FitRow[]>([]);
  const [bucket, setBucket] = useState<"best" | "force" | "no">("best");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [recomputing, setRecomputing] = useState(false);

  const allDone =
    !!profile?.journey_responses?.assessment_completed &&
    !!profile?.journey_responses?.psychometric_completed &&
    !!profile?.journey_responses?.interests_completed;

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    const [cc, fr] = await Promise.all([
      supabase.from("combined_conclusions" as any).select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("compass_fit_results" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("score", { ascending: false })
        .limit(2000),
    ]);
    setConclusion((cc.data as any) || null);
    setFits(((fr.data as any) || []) as FitRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      await supabase.functions.invoke("combined-conclusion-synthesizer", { body: {} });
      toast.success("Path Map refreshed");
      await load();
    } catch (e: any) {
      toast.error("Could not refresh — try again");
    } finally {
      setRecomputing(false);
    }
  };

  const filtered = useMemo(() => {
    return fits
      .filter((f) => f.bucket === bucket)
      .filter((f) => entityFilter === "all" || f.entity_type === entityFilter)
      .filter((f) => !query || f.entity_name?.toLowerCase().includes(query.toLowerCase()));
  }, [fits, bucket, entityFilter, query]);

  if (!allDone) {
    return (
      <Card className="rounded-3xl border-dashed border-2 border-primary/30 bg-primary/[0.02]">
        <CardContent className="p-8 text-center space-y-3">
          <Compass className="mx-auto text-primary" size={32} />
          <h3 className="font-display text-lg font-bold">Finish all three assessments first</h3>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
            Your Combined Path Map unlocks once Discovery, Psychometric and Interests are all submitted.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="animate-spin" size={18} /> Loading your Path Map…
      </div>
    );
  }

  const buckets = (["best", "force", "no"] as const).map((b) => ({
    b,
    count: fits.filter((f) => f.bucket === b).length,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Combined Conclusion */}
      <Card className="rounded-3xl border-primary/20 bg-gradient-to-br from-primary/[0.04] to-accent/[0.04] shadow-xl overflow-hidden">
        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                <Sparkles className="text-primary" size={22} />
              </div>
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Your Combined Conclusion</h2>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  Onboarding + Discovery + Psychometric + Interests, all in one identity signal.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleRecompute} disabled={recomputing} className="rounded-full">
              {recomputing ? <Loader2 className="animate-spin mr-2" size={14} /> : <RefreshCw size={14} className="mr-2" />}
              Recompute
            </Button>
          </div>

          {!conclusion ? (
            <p className="font-body text-sm text-muted-foreground italic">
              Synthesis pending — hit Recompute to generate.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label="Dominant Archetype" value={conclusion.dominant_archetype} />
              <Field label="Cognitive Signature" value={conclusion.cognitive_signature} />
              <Field label="Risk Profile" value={conclusion.risk_profile} />
              <Field label="Growth Orientation" value={conclusion.growth_orientation} />
              <Field label="Top Motivations" value={Array.isArray(conclusion.top_motivations) ? conclusion.top_motivations.join(" · ") : null} />
              <Field label="Values Anchors" value={Array.isArray(conclusion.values_anchors) ? conclusion.values_anchors.join(" · ") : null} />
            </div>
          )}

          {conclusion?.identity_summary && (
            <div className="bg-white/70 rounded-2xl border border-border/60 p-4">
              <p className="font-body text-sm sm:text-[15px] text-foreground/90 leading-relaxed">{conclusion.identity_summary}</p>
            </div>
          )}

          {conclusion?.narrative_long && (
            <details className="bg-white/40 rounded-2xl border border-border/60 p-4">
              <summary className="font-display text-xs font-bold cursor-pointer text-primary">Read the full identity narrative</summary>
              <p className="font-body text-sm text-foreground/85 leading-relaxed mt-3 whitespace-pre-line">{conclusion.narrative_long}</p>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Fit buckets */}
      <Card className="rounded-3xl shadow-xl border-border">
        <CardContent className="p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Your Path Map</h2>
            <p className="font-body text-xs text-muted-foreground mt-0.5">
              Cross-matched against 18,000+ roles, every industry, sector, domain, skill and subject in our universe.
            </p>
          </div>

          <Tabs value={bucket} onValueChange={(v) => setBucket(v as any)}>
            <TabsList className="grid grid-cols-3 rounded-2xl bg-muted/40 p-1 h-auto">
              {buckets.map(({ b, count }) => {
                const cfg = BUCKET_CFG[b];
                const Icon = cfg.icon;
                return (
                  <TabsTrigger key={b} value={b} className="rounded-xl flex flex-col items-center gap-1 py-3 data-[state=active]:bg-white data-[state=active]:shadow">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={cfg.color} />
                      <span className="font-display font-bold text-sm">{cfg.label}</span>
                    </div>
                    <span className="font-body text-[11px] text-muted-foreground">{count} matches</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={bucket} className="mt-5 space-y-4">
              <p className="font-body text-xs text-foreground/80 bg-muted/30 rounded-xl px-3 py-2">
                {bucket === "best" && "These align naturally with who you are. Lean in here first."}
                {bucket === "force" && "Stretch options — possible with deliberate effort. Compelled, not natural."}
                {bucket === "no" && "Low alignment. Skip these to save time and energy unless something major changes."}
              </p>

              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search inside this bucket…"
                    className="pl-9 rounded-full"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {["all", ...Object.keys(ENTITY_LABEL)].map((t) => (
                    <Button
                      key={t}
                      size="sm"
                      variant={entityFilter === t ? "default" : "outline"}
                      onClick={() => setEntityFilter(t)}
                      className="rounded-full h-8 text-[11px] px-3"
                    >
                      {t === "all" ? "All" : ENTITY_LABEL[t]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {filtered.length === 0 && (
                  <p className="col-span-full text-center text-sm text-muted-foreground italic py-8">
                    Nothing in this bucket yet.
                  </p>
                )}
                {filtered.slice(0, 300).map((f) => {
                  const cfg = BUCKET_CFG[f.bucket];
                  const reasons: string[] = Array.isArray(f.reasons) ? f.reasons.slice(0, 4) : [];
                  return (
                    <div key={f.id} className={`rounded-2xl border p-4 ${cfg.bg}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-display text-sm font-bold text-foreground leading-tight">{f.entity_name}</p>
                          <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                            {ENTITY_LABEL[f.entity_type] || f.entity_type}
                          </p>
                        </div>
                        <Badge variant="outline" className="rounded-full bg-white text-[10px]">{Math.round(f.score)}</Badge>
                      </div>
                      {reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {reasons.map((r, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] bg-white/70 font-normal">{r}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {filtered.length > 300 && (
                  <p className="col-span-full text-center text-[11px] text-muted-foreground italic">
                    Showing top 300 of {filtered.length}. Refine with search or entity filter.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="bg-white/70 rounded-2xl border border-border/60 p-3">
      <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className="font-display text-sm font-bold text-foreground mt-1 leading-snug">{value || "—"}</p>
    </div>
  );
}
