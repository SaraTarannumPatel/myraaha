import { motion } from "framer-motion";
import { Map, Sparkles, Compass, Target, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * CareerMap — replaces the legacy Roadmap module.
 * Vertical-slice scaffold for the CareerMap-CareerScape engine:
 *   • 11-level taxonomy (sector → role)
 *   • 288-dim KSAO matching
 *   • PathFinder routes (Fastest / Safest / No-cost)
 *   • Dream Board, Live Hiring Pulse, Pioneer Points
 *
 * Phase 0 schema is live. This page surfaces taxonomy seeding state
 * and will be replaced by the full MapCanvas + RoleSheet in Phase 9.
 */
export default function CareerMap() {
  const [sectorCount, setSectorCount] = useState<number | null>(null);
  const [roleCount, setRoleCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [{ count: secs }, { count: roles }] = await Promise.all([
        supabase.from("taxonomy_nodes").select("*", { count: "exact", head: true }).eq("level", "sector"),
        supabase.from("taxonomy_nodes").select("*", { count: "exact", head: true }).eq("level", "role"),
      ]);
      setSectorCount(secs ?? 0);
      setRoleCount(roles ?? 0);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 max-w-4xl"
      >
        <Badge variant="outline" className="mb-3 border-primary/40 text-primary">
          <Sparkles className="mr-1 h-3 w-3" /> CareerMap · Phase 0 active
        </Badge>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Your career, mapped.
        </h1>
        <p className="mt-3 max-w-2xl text-base italic text-muted-foreground md:text-lg">
          17 sectors. 17,000+ roles. One living graph that learns who you are
          and shows you exactly how to get there — fastest, safest, or cheapest.
        </p>
      </motion.header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Layers className="h-5 w-5" />}
          label="Sectors loaded"
          value={sectorCount === null ? "…" : `${sectorCount}/17`}
        />
        <StatCard
          icon={<Map className="h-5 w-5" />}
          label="Roles in graph"
          value={roleCount === null ? "…" : roleCount.toLocaleString("en-IN")}
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Your KSAO vector"
          value="Building…"
        />
      </section>

      <Card className="mt-8 border-dashed bg-muted/30 p-6">
        <div className="flex items-start gap-3">
          <Compass className="mt-1 h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-foreground">Vertical slice in progress</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              We're seeding the Healthcare & Life Sciences sector first
              (1,200+ roles) so you can feel the full Discover → PathFinder →
              Dream Board loop end-to-end. The remaining 16 sectors will roll
              in next.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-2 font-serif text-3xl font-semibold text-foreground">{value}</div>
    </Card>
  );
}
