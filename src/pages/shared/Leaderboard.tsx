import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Star, Sparkles, Award, TrendingUp } from "lucide-react";

const badgeTemplates = [
  { type: "first_interest", title: "Curiosity Spark", description: "Added your first interest", icon: "🧭", points: 10 },
  { type: "five_skills", title: "Skill Builder", description: "Added 5 skills", icon: "🎯", points: 25 },
  { type: "first_journal", title: "Reflector", description: "Wrote your first journal entry", icon: "📝", points: 10 },
  { type: "first_project", title: "Creator", description: "Started your first project", icon: "🚀", points: 20 },
  { type: "first_roadmap", title: "Pathfinder", description: "Created your first roadmap", icon: "🗺️", points: 15 },
  { type: "streak_3", title: "Consistent", description: "3-day activity streak", icon: "🔥", points: 30 },
  { type: "streak_7", title: "Dedicated", description: "7-day activity streak", icon: "⚡", points: 50 },
  { type: "ten_interests", title: "Explorer", description: "Mapped 10+ interests", icon: "🌟", points: 25 },
  { type: "complete_roadmap", title: "Achiever", description: "Completed a roadmap", icon: "🏆", points: 100 },
  { type: "first_connection", title: "Networker", description: "Made your first connection", icon: "🤝", points: 15 },
];

const Leaderboard = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
    checkAndAwardBadges();

    const channel = supabase
      .channel('achievements-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements', filter: `user_id=eq.${user!.id}` }, () => fetchAchievements())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAchievements = async () => {
    const { data } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user!.id)
      .order("earned_at", { ascending: false });
    setAchievements(data || []);
    setTotalPoints((data || []).reduce((sum, a) => sum + (a.points || 0), 0));
    setLoading(false);
  };

  const checkAndAwardBadges = async () => {
    if (!user) return;

    const [interestsRes, skillsRes, journalRes, projectsRes, roadmapsRes, connectionsRes] = await Promise.all([
      supabase.from("interests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("skills").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("roadmaps").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("connections").select("id", { count: "exact", head: true }).or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`),
    ]);

    const { data: existing } = await supabase.from("achievements").select("achievement_type").eq("user_id", user.id);
    const earned = new Set((existing || []).map(a => a.achievement_type));

    const toAward: typeof badgeTemplates = [];
    if ((interestsRes.count || 0) >= 1 && !earned.has("first_interest")) toAward.push(badgeTemplates.find(b => b.type === "first_interest")!);
    if ((skillsRes.count || 0) >= 5 && !earned.has("five_skills")) toAward.push(badgeTemplates.find(b => b.type === "five_skills")!);
    if ((journalRes.count || 0) >= 1 && !earned.has("first_journal")) toAward.push(badgeTemplates.find(b => b.type === "first_journal")!);
    if ((projectsRes.count || 0) >= 1 && !earned.has("first_project")) toAward.push(badgeTemplates.find(b => b.type === "first_project")!);
    if ((roadmapsRes.count || 0) >= 1 && !earned.has("first_roadmap")) toAward.push(badgeTemplates.find(b => b.type === "first_roadmap")!);
    if ((interestsRes.count || 0) >= 10 && !earned.has("ten_interests")) toAward.push(badgeTemplates.find(b => b.type === "ten_interests")!);
    if ((connectionsRes.count || 0) >= 1 && !earned.has("first_connection")) toAward.push(badgeTemplates.find(b => b.type === "first_connection")!);

    if (toAward.length > 0) {
      await supabase.from("achievements").insert(
        toAward.filter(Boolean).map(b => ({
          user_id: user.id,
          achievement_type: b.type,
          title: b.title,
          description: b.description,
          points: b.points,
        }))
      );
      fetchAchievements();
    }
  };

  const earnedTypes = new Set(achievements.map(a => a.achievement_type));

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Trophy size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Achievements & Leaderboard</h1>
            <p className="font-body text-sm text-muted-foreground">Track your progress and earn badges</p>
          </div>
        </div>
      </motion.div>

      {/* Points Summary */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl border border-border p-5 text-center">
          <Medal className="mx-auto text-accent mb-2" size={28} />
          <p className="font-display text-3xl text-foreground">{totalPoints}</p>
          <p className="font-body text-xs text-muted-foreground">Total Points</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border border-border p-5 text-center">
          <Star className="mx-auto text-accent mb-2" size={28} />
          <p className="font-display text-3xl text-foreground">{achievements.length}</p>
          <p className="font-body text-xs text-muted-foreground">Badges Earned</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-5 text-center">
          <TrendingUp className="mx-auto text-accent mb-2" size={28} />
          <p className="font-display text-3xl text-foreground">{badgeTemplates.length - achievements.length}</p>
          <p className="font-body text-xs text-muted-foreground">To Unlock</p>
        </motion.div>
      </div>

      {/* All Badges */}
      <div>
        <h2 className="font-display text-xl text-foreground mb-4">All Badges</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badgeTemplates.map((badge, i) => {
            const earned = earnedTypes.has(badge.type);
            const earnedData = achievements.find(a => a.achievement_type === badge.type);
            return (
              <motion.div
                key={badge.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`p-5 rounded-xl border transition-all ${
                  earned ? "bg-accent/5 border-accent/20 shadow-soft" : "bg-card border-border opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{badge.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg text-foreground">{badge.title}</h3>
                      {earned && <Award size={14} className="text-accent" />}
                    </div>
                    <p className="font-body text-xs text-muted-foreground">{badge.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-body text-xs text-accent font-semibold">+{badge.points} pts</span>
                      {earned && earnedData && (
                        <span className="font-body text-[10px] text-muted-foreground">
                          {new Date(earnedData.earned_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
