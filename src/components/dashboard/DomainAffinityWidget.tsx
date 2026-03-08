import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Compass, TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";

interface DomainAffinity {
  domain_name: string;
  affinity_score: number;
  trend: string | null;
  tasks_completed: number | null;
  time_invested_minutes: number | null;
}

const DomainAffinityWidget = () => {
  const { user } = useAuth();
  const [domains, setDomains] = useState<DomainAffinity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("domain_affinity")
      .select("domain_name, affinity_score, trend, tasks_completed, time_invested_minutes")
      .eq("user_id", user.id)
      .order("affinity_score", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setDomains((data || []) as DomainAffinity[]);
        setLoading(false);
      });
  }, [user]);

  if (loading || domains.length === 0) return null;

  const TrendIcon = ({ trend }: { trend: string | null }) => {
    if (trend === "rising") return <TrendingUp size={10} className="text-green-500" />;
    if (trend === "declining") return <TrendingDown size={10} className="text-destructive" />;
    return <Minus size={10} className="text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Compass className="h-5 w-5 text-primary" />
            Domain Affinity
          </CardTitle>
          <Link to="/dashboard/curiosity-compass" className="text-xs text-primary hover:underline flex items-center gap-1">
            Explore <ChevronRight size={12} />
          </Link>
        </div>
        <CardDescription>Areas you're most drawn to based on activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {domains.map(d => (
            <div key={d.domain_name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm text-foreground">{d.domain_name}</span>
                  <TrendIcon trend={d.trend} />
                </div>
                <span className="font-body text-xs text-muted-foreground">{d.affinity_score}%</span>
              </div>
              <Progress value={d.affinity_score} className="h-1.5" />
              <div className="flex gap-2">
                {d.tasks_completed != null && d.tasks_completed > 0 && (
                  <span className="font-body text-[10px] text-muted-foreground">{d.tasks_completed} tasks</span>
                )}
                {d.time_invested_minutes != null && d.time_invested_minutes > 0 && (
                  <span className="font-body text-[10px] text-muted-foreground">{Math.round(d.time_invested_minutes / 60)}h invested</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainAffinityWidget;
