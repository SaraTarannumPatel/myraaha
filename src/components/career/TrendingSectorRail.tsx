import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Flame } from "lucide-react";

type Row = { sector: string; role_name: string; sub_sector: string; mentions: number };

const SECTOR_EMOJI: Record<string, string> = {
  "Technology & IT": "💻",
  "Healthcare & Life Sciences": "🏥",
  "Financial Services": "💰",
  "Education": "📚",
  "Energy & Utilities": "⚡",
  "Government & Public Sector": "🏛️",
  "Manufacturing & Engineering": "⚙️",
  "Media, Entertainment & Creative": "🎬",
  "Retail & Consumer Goods": "🛍️",
  "Transport & Logistics": "🚚",
  "Hospitality, Tourism & Travel": "✈️",
  "Telecommunications": "📡",
  "Legal & Professional Services": "⚖️",
  "Real Estate & Construction": "🏗️",
  "NGO & Development": "🤝",
  "Sports": "⚽",
  "Agriculture, Environment & Natural Resources": "🌾",
};

/**
 * Renders 4-5 trending well-known roles from each of the 17 sector intel
 * tables stored in the backend. Pulled via the `get_sector_trending` RPC.
 */
const TrendingSectorRail = ({ perSector = 5 }: { perSector?: number }) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("get_sector_trending" as any, {
        _per_sector: perSector,
      });
      if (cancelled) return;
      if (error) console.error("trending error", error);
      setRows((data as Row[]) || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [perSector]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  if (!rows.length) return null;

  // Group by sector preserving original RPC order
  const grouped: { sector: string; items: Row[] }[] = [];
  const seen = new Map<string, Row[]>();
  rows.forEach((r) => {
    if (!seen.has(r.sector)) {
      const bucket: Row[] = [];
      seen.set(r.sector, bucket);
      grouped.push({ sector: r.sector, items: bucket });
    }
    seen.get(r.sector)!.push(r);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
          <Flame className="text-accent-foreground" size={20} />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-foreground">
            Trending across India · all 17 sectors
          </h3>
          <p className="font-body text-xs text-muted-foreground">
            The most-known roles people are pursuing right now.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grouped.map(({ sector, items }) => (
          <Card key={sector} className="rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{SECTOR_EMOJI[sector] || "🌐"}</span>
                <h4 className="font-display text-sm font-bold text-foreground leading-tight flex-1 min-w-0 truncate">
                  {sector}
                </h4>
              </div>
              <ul className="space-y-1.5">
                {items.map((row, i) => (
                  <li
                    key={`${row.sector}-${row.role_name}-${i}`}
                    className="flex items-start gap-2 group"
                  >
                    <Badge
                      variant="secondary"
                      className="shrink-0 w-5 h-5 p-0 flex items-center justify-center text-[10px] font-bold rounded-md bg-primary/10 text-primary"
                    >
                      {i + 1}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="font-body text-xs text-foreground leading-tight truncate">
                        {row.role_name}
                      </p>
                      {row.sub_sector && (
                        <p className="font-body text-[10px] text-muted-foreground truncate">
                          {row.sub_sector}
                        </p>
                      )}
                    </div>
                    <TrendingUp size={11} className="text-success/60 mt-0.5 shrink-0" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TrendingSectorRail;
