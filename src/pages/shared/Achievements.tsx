import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Sparkles, Award } from "lucide-react";

const BADGE_ICONS: Record<string, string> = {
  first_interest: "🧭", ten_interests: "🌟", first_observation: "🔍", first_idea_card: "💡",
  first_startup_idea: "🎯", first_journal: "📝", five_journals: "📓", first_learning_track: "📚",
  first_capsule: "🎓", first_project: "🚀", first_lab_plan: "🧪", first_experiment: "⚗️",
  first_milestone: "🏁", first_validation: "✅", first_connection: "🤝", five_connections: "🌐",
  first_community_join: "👥", first_post: "📢", five_posts: "🎤", first_checkin: "🧘",
  five_checkins: "💪", first_habit: "🌱", first_challenge: "⚔️", first_roadmap: "🗺️",
  founder_profile: "👤", first_path: "🧭", first_moodboard: "🎨", five_skills: "🎯",
  ten_skills: "🏅", streak_3: "🔥", streak_7: "⚡", hundred_points: "💯", five_hundred_points: "👑",
};

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

  const totalPoints = useMemo(() => achievements.reduce((sum, a) => sum + (a.points || 0), 0), [achievements]);

  return (
    <div className="space-y-6">
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
        <Card className="p-5 text-center">
          <p className="font-display text-3xl text-accent">{achievements.length}</p>
          <p className="font-body text-xs text-muted-foreground">Badges Earned</p>
        </Card>
        <Card className="p-5 text-center">
          <p className="font-display text-3xl text-foreground">{totalPoints}</p>
          <p className="font-body text-xs text-muted-foreground">Total Points</p>
        </Card>
      </div>

      {achievements.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
          <h3 className="font-display text-xl text-foreground mb-2">No achievements yet</h3>
          <p className="font-body text-muted-foreground">Complete activities to earn badges and points!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-5 border-amber-500/20 bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{BADGE_ICONS[a.achievement_type] || "🏆"}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg text-foreground">{a.title}</h3>
                      <Award size={14} className="text-amber-500" />
                    </div>
                    {a.description && <p className="font-body text-xs text-muted-foreground mt-1">{a.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">+{a.points} pts</Badge>
                      <span className="font-body text-[10px] text-muted-foreground">{new Date(a.earned_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements;
