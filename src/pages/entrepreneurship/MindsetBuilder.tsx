import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Zap, Check, Sparkles, RefreshCw } from "lucide-react";

const challengeTemplates = [
  { type: "fear", title: "Face a Fear", description: "Identify one entrepreneurial fear and take one small step toward it today." },
  { type: "pitch", title: "60-Second Pitch", description: "Practice pitching your idea to a friend or family member in under 60 seconds." },
  { type: "failure", title: "Embrace Failure", description: "Write about a past failure and identify 3 lessons it taught you." },
  { type: "networking", title: "Cold Outreach", description: "Reach out to someone you admire in your industry. Ask them one question." },
  { type: "gratitude", title: "Founder Gratitude", description: "Write 3 things about your entrepreneurial journey you're grateful for." },
  { type: "creativity", title: "Idea Sprint", description: "Set a timer for 10 minutes and generate 20 startup ideas. Don't filter." },
  { type: "resilience", title: "Resilience Journal", description: "Describe a challenging moment this week and how you overcame it." },
  { type: "growth", title: "Skill Stretch", description: "Learn something new today that's outside your comfort zone." },
];

const MindsetBuilder = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchChallenges(); }, []);

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from("mindset_challenges")
      .select("*")
      .eq("user_id", user!.id)
      .order("started_at", { ascending: false });
    setChallenges(data || []);
    setLoading(false);
  };

  const startChallenge = async (template: typeof challengeTemplates[0]) => {
    const { data, error } = await supabase.from("mindset_challenges").insert({
      user_id: user!.id,
      challenge_type: template.type,
      title: template.title,
      description: template.description,
    }).select().single();
    if (error) { toast.error("Failed to start challenge"); return; }
    setActiveChallenge(data);
    fetchChallenges();
    toast.success("Challenge started! 💪");
  };

  const completeChallenge = async () => {
    if (!activeChallenge) return;
    await supabase.from("mindset_challenges").update({
      status: "completed",
      reflection,
      completed_at: new Date().toISOString(),
    }).eq("id", activeChallenge.id);
    setActiveChallenge(null);
    setReflection("");
    fetchChallenges();
    toast.success("Challenge completed! 🎉");
  };

  const completedCount = challenges.filter(c => c.status === "completed").length;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Zap size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Mindset Builder</h1>
            <p className="font-body text-sm text-muted-foreground">Build the entrepreneurial mindset through daily challenges</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-2xl text-foreground">{completedCount}</p>
          <p className="font-body text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-2xl text-foreground">{challenges.filter(c => c.status === "active").length}</p>
          <p className="font-body text-xs text-muted-foreground">Active</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <p className="font-display text-2xl text-accent">{Math.min(completedCount, 7)}/7</p>
          <p className="font-body text-xs text-muted-foreground">Week Streak</p>
        </div>
      </div>

      {/* Active Challenge */}
      {activeChallenge && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/30 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground">Current Challenge</h2>
            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-xs">Active</span>
          </div>
          <h3 className="font-display text-lg text-foreground">{activeChallenge.title}</h3>
          <p className="font-body text-sm text-muted-foreground">{activeChallenge.description}</p>
          <Textarea placeholder="Reflect on this challenge..." value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} />
          <Button onClick={completeChallenge} className="gradient-warm text-secondary-foreground">
            <Check size={18} /> Complete Challenge
          </Button>
        </motion.div>
      )}

      {/* Challenge Templates */}
      <div>
        <h2 className="font-display text-xl text-foreground mb-4">Daily Challenges</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {challengeTemplates.map((template, i) => (
            <motion.div
              key={template.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5"
            >
              <h3 className="font-display text-lg text-foreground mb-1">{template.title}</h3>
              <p className="font-body text-sm text-muted-foreground mb-3">{template.description}</p>
              <Button
                onClick={() => startChallenge(template)}
                disabled={!!activeChallenge}
                variant="outline"
                size="sm"
                className="font-body"
              >
                <Zap size={14} /> Start
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MindsetBuilder;
