import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Trophy, Medal, Star, Sparkles, TrendingUp, Target, Flame,
  Users, Brain, Crown, Gift, ChevronUp, ChevronDown, Minus, X
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  total_points: number;
  badge_count: number;
  streak_days: number;
  projects_completed: number;
  rank_position: number;
  scope: string;
  scope_id: string;
}

const SCOPES = [
  { value: "global", label: "Global" },
  { value: "domain", label: "By Domain" },
];

const Leaderboard = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("rankings");
  const [scope, setScope] = useState("global");
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    const query = supabase
      .from("leaderboard_entries")
      .select("*")
      .order("total_points", { ascending: false })
      .limit(50);

    if (scope !== "global") {
      query.eq("scope", scope);
    }

    const { data } = await query;
    const entriesData = (data || []) as LeaderboardEntry[];
    setEntries(entriesData);

    // Fetch profiles for all users
    const userIds = [...new Set(entriesData.map(e => e.user_id))];
    if (userIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);
      const profileMap: Record<string, any> = {};
      (profilesData || []).forEach(p => { profileMap[p.user_id] = p; });
      setProfiles(profileMap);
    }
    setLoading(false);
  }, [scope]);

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel("leaderboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard_entries" }, () => fetchLeaderboard())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchLeaderboard]);

  const myEntry = useMemo(() => entries.find(e => e.user_id === user?.id), [entries, user]);
  const myRank = useMemo(() => {
    const idx = entries.findIndex(e => e.user_id === user?.id);
    return idx >= 0 ? idx + 1 : null;
  }, [entries, user]);

  const tier = useMemo(() => {
    const pts = myEntry?.total_points || 0;
    if (pts >= 500) return { name: "Legend", icon: "👑" };
    if (pts >= 300) return { name: "Innovator", icon: "💡" };
    if (pts >= 150) return { name: "Builder", icon: "🔨" };
    if (pts >= 50) return { name: "Explorer", icon: "🧭" };
    return { name: "Newcomer", icon: "🌱" };
  }, [myEntry]);

  const getAiInsights = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("achievements-ai", {
        body: {
          type: "leaderboard_insights",
          context: {
            myRank,
            totalParticipants: entries.length,
            myPoints: myEntry?.total_points || 0,
            myBadges: myEntry?.badge_count || 0,
            topPoints: entries[0]?.total_points || 0,
            level: tier.name,
          },
        },
      });
      if (error) throw error;
      setAiInsights(data);
    } catch { toast.error("Failed to get insights"); }
    setAiLoading(false);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 border border-primary/20 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-sm font-medium text-primary">Leaderboard</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">See how you compare.</h1>
          <p className="text-muted-foreground max-w-2xl">Track your ranking, compete with peers, and climb the leaderboard through learning, building, and collaborating.</p>
        </div>
      </motion.div>

      {/* My Rank Card */}
      {myEntry && (
        <Card className="p-5 border-primary/30 bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-2xl">
              {tier.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">Your Ranking: #{myRank}</h3>
                <Badge>{tier.name}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{myEntry.total_points} points • {myEntry.badge_count} badges</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">of {entries.length} participants</p>
              {myRank && myRank <= 3 && <Badge className="bg-amber-500/20 text-amber-600 mt-1">Top 3!</Badge>}
            </div>
          </div>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto gap-1">
          <TabsTrigger value="rankings" className="gap-1"><Trophy className="h-4 w-4" /> Rankings</TabsTrigger>
          <TabsTrigger value="tiers" className="gap-1"><Crown className="h-4 w-4" /> Level Tiers</TabsTrigger>
          <TabsTrigger value="challenges" className="gap-1"><Gift className="h-4 w-4" /> Challenges</TabsTrigger>
          <TabsTrigger value="insights" className="gap-1"><Sparkles className="h-4 w-4" /> AI Insights</TabsTrigger>
        </TabsList>

        {/* Rankings */}
        <TabsContent value="rankings" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SCOPES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{entries.length} participants</p>
          </div>

          {/* Top 3 podium */}
          {entries.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {[entries[1], entries[0], entries[2]].map((entry, i) => {
                const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
                const profile = profiles[entry.user_id];
                const isMe = entry.user_id === user?.id;
                const heights = ["h-28", "h-36", "h-24"];
                return (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className={`text-center p-4 ${isMe ? "border-primary/30 bg-primary/5" : ""}`}>
                      <div className={`flex flex-col items-center justify-end ${heights[i]}`}>
                        {getRankIcon(rank)}
                        <div className="mt-2 w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                          {profile?.full_name?.charAt(0) || "?"}
                        </div>
                        <p className="text-xs font-medium text-foreground mt-1 truncate max-w-full">
                          {isMe ? "You" : profile?.full_name || "User"}
                        </p>
                        <p className="text-[10px] text-primary font-bold">{entry.total_points} pts</p>
                        <p className="text-[10px] text-muted-foreground">{entry.badge_count} badges</p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const rank = i + 1;
              const profile = profiles[entry.user_id];
              const isMe = entry.user_id === user?.id;
              return (
                <motion.div key={entry.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                  <Card className={`p-3 flex items-center gap-3 ${isMe ? "border-primary/30 bg-primary/5" : ""}`}>
                    <div className="w-8 text-center">{getRankIcon(rank)}</div>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                      {profile?.full_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {isMe ? "You" : profile?.full_name || "User"} {isMe && <Badge className="text-[10px] ml-1">You</Badge>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{entry.badge_count} badges • {entry.streak_days || 0}🔥</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{entry.total_points}</p>
                      <p className="text-[10px] text-muted-foreground">points</p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {entries.length === 0 && !loading && (
              <Card className="p-12 text-center">
                <Trophy className="mx-auto text-muted-foreground/40 mb-3" size={40} />
                <h3 className="text-xl font-bold text-foreground mb-2">No rankings yet</h3>
                <p className="text-muted-foreground">Start earning badges to appear on the leaderboard!</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Level Tiers */}
        <TabsContent value="tiers" className="space-y-4 mt-4">
          <div className="space-y-2">
            {[
              { name: "Newcomer", icon: "🌱", min: 0, max: 49, desc: "Just getting started. Every step counts!" },
              { name: "Explorer", icon: "🧭", min: 50, max: 149, desc: "Curious and engaged. Building momentum." },
              { name: "Builder", icon: "🔨", min: 150, max: 299, desc: "Creating, learning, and shipping consistently." },
              { name: "Innovator", icon: "💡", min: 300, max: 499, desc: "Leading by example. Making real impact." },
              { name: "Legend", icon: "👑", min: 500, max: Infinity, desc: "The pinnacle. Inspiring the entire community." },
            ].map(t => {
              const isCurrent = tier.name === t.name;
              const pct = myEntry ? Math.min(((myEntry.total_points - t.min) / (Math.min(t.max, 500) - t.min)) * 100, 100) : 0;
              return (
                <Card key={t.name} className={`p-4 ${isCurrent ? "border-primary/30 bg-primary/5" : ""}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{t.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{t.name}</span>
                        {isCurrent && <Badge>Current</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                      <span className="text-[10px] text-muted-foreground">{t.max === Infinity ? `${t.min}+ pts` : `${t.min}–${t.max} pts`}</span>
                    </div>
                  </div>
                  {isCurrent && <Progress value={Math.max(pct, 5)} className="h-2 mt-2" />}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Community Challenges */}
        <TabsContent value="challenges" className="space-y-4 mt-4">
          <Card className="p-6 text-center">
            <Gift className="mx-auto text-muted-foreground mb-3" size={48} />
            <h2 className="text-xl font-bold text-foreground mb-2">Community Challenges</h2>
            <p className="text-muted-foreground mb-4">Weekly and monthly challenges where you compete with peers, earn bonus points, and unlock special badges.</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              {[
                { title: "7-Day Learning Sprint", desc: "Complete a learning track in 7 days", reward: "50 bonus pts + 🏃 badge", status: "active" },
                { title: "Build-a-thon", desc: "Ship a project in 48 hours", reward: "100 bonus pts + ⚡ badge", status: "upcoming" },
                { title: "Connection Week", desc: "Make 5 new connections this week", reward: "30 bonus pts", status: "active" },
                { title: "Reflection Marathon", desc: "Write 7 journal entries in 7 days", reward: "40 bonus pts + 📝 badge", status: "upcoming" },
              ].map((ch, i) => (
                <Card key={i} className="p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground">{ch.title}</h3>
                    <Badge variant={ch.status === "active" ? "default" : "secondary"} className="text-[10px]">
                      {ch.status === "active" ? "Active" : "Coming Soon"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{ch.desc}</p>
                  <p className="text-xs text-primary font-medium">🎁 {ch.reward}</p>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-4 mt-4">
          <Card className="p-6 text-center">
            <Brain className="mx-auto text-primary mb-3" size={40} />
            <h2 className="text-xl font-bold text-foreground mb-2">Leaderboard Insights</h2>
            <p className="text-sm text-muted-foreground mb-4">Get AI-powered analysis of your ranking and personalized tips to climb higher.</p>
            <Button onClick={getAiInsights} disabled={aiLoading}>
              <Sparkles className="h-4 w-4" /> {aiLoading ? "Analyzing..." : "Get Insights"}
            </Button>
          </Card>

          {aiInsights && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/30">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Your Insights</CardTitle>
                  <Button size="icon" variant="ghost" onClick={() => setAiInsights(null)}><X className="h-4 w-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiInsights.position_insight && (
                    <p className="text-sm text-foreground">{aiInsights.position_insight}</p>
                  )}
                  {aiInsights.improvement_tips?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">📈 Improvement Tips</h4>
                      <ul className="space-y-1">
                        {aiInsights.improvement_tips.map((tip: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <ChevronUp className="h-3 w-3 text-primary shrink-0 mt-0.5" /> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights.next_rank_strategy && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <h4 className="text-sm font-medium mb-1">🎯 Strategy to Rank Up</h4>
                      <p className="text-xs text-muted-foreground">{aiInsights.next_rank_strategy}</p>
                    </div>
                  )}
                  {aiInsights.motivational_quote && (
                    <p className="text-xs text-muted-foreground italic border-t pt-2">"{aiInsights.motivational_quote}"</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
