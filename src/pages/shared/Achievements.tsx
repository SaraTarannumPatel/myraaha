import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Sparkles } from "lucide-react";

const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user!.id)
        .order("earned_at", { ascending: false });
      setAchievements(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Trophy size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Achievements</h1>
            <p className="font-body text-sm text-muted-foreground">Your badges and milestones</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="font-display text-3xl text-accent">{achievements.length}</p>
          <p className="font-body text-xs text-muted-foreground">Badges Earned</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 text-center">
          <p className="font-display text-3xl text-foreground">{totalPoints}</p>
          <p className="font-body text-xs text-muted-foreground">Total Points</p>
        </div>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No achievements yet</h3>
          <p className="font-body text-muted-foreground">Complete activities to earn badges and points!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 text-center"
            >
              <div className="w-14 h-14 rounded-full gradient-warm flex items-center justify-center mx-auto mb-3">
                <Trophy size={24} className="text-secondary-foreground" />
              </div>
              <h3 className="font-display text-lg text-foreground">{a.title}</h3>
              {a.description && <p className="font-body text-xs text-muted-foreground mt-1">{a.description}</p>}
              <p className="font-body text-xs text-accent font-semibold mt-2">+{a.points} pts</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements;
