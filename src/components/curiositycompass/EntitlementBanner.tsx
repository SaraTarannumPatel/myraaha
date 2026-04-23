import { motion } from "framer-motion";
import { Sparkles, Lock, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useEntitlement } from "@/hooks/useAssessmentRewards";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  entitlementKey: string;
  rewardLabel: string;
  unlockedMessage?: string;
  /** Path users can go to to unlock — defaults to Curiosity Compass */
  unlockHref?: string;
  /** When true, renders a compact pill instead of a full banner */
  compact?: boolean;
}

/**
 * Visual indicator showing whether the active entitlement (e.g. "ai_therapist_unlimited_24h")
 * is currently active for the user, with the time remaining if applicable.
 * Does NOT block usage — that gating is handled by `useEntitlement().active` in the parent.
 */
const EntitlementBanner = ({
  entitlementKey,
  rewardLabel,
  unlockedMessage,
  unlockHref = "/dashboard/curiosity-compass",
  compact,
}: Props) => {
  const { user } = useAuth();
  const { active, loading } = useEntitlement(entitlementKey);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !active) return;
    supabase
      .from("user_entitlements" as any)
      .select("expires_at")
      .eq("user_id", user.id)
      .eq("entitlement_key", entitlementKey)
      .maybeSingle()
      .then(({ data }) => setExpiresAt((data as any)?.expires_at || null));
  }, [user, entitlementKey, active]);

  if (loading) return null;

  if (compact) {
    return (
      <Badge variant={active ? "default" : "outline"} className="text-[10px] gap-1">
        {active ? <Sparkles size={10} /> : <Lock size={10} />}
        {active ? "Reward active" : "Locked"}
      </Badge>
    );
  }

  if (active) {
    const remaining = expiresAt ? Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 3600000)) : null;
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 px-3 py-2 flex items-center gap-2"
      >
        <Sparkles size={14} className="text-primary shrink-0" />
        <p className="font-body text-xs text-foreground flex-1 min-w-0">
          {unlockedMessage || `${rewardLabel} is active.`}
          {remaining !== null && (
            <span className="ml-1 text-muted-foreground inline-flex items-center gap-1">
              <Clock size={10} /> {remaining}h left
            </span>
          )}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-muted/40 px-3 py-2 flex items-center gap-2"
    >
      <Lock size={14} className="text-muted-foreground shrink-0" />
      <p className="font-body text-xs text-muted-foreground flex-1 min-w-0">
        Unlock <span className="font-medium text-foreground">{rewardLabel}</span> by completing more of your Curiosity Compass assessments.
      </p>
      <Button asChild size="sm" variant="outline" className="h-7 text-[11px] shrink-0">
        <Link to={unlockHref}>Unlock <ArrowRight size={11} className="ml-1" /></Link>
      </Button>
    </motion.div>
  );
};

export default EntitlementBanner;
