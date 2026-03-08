import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { streamChat } from "@/lib/streamChat";
import { toast } from "sonner";
import { Bot, Send, Target, TrendingUp, Sparkles, Loader2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const quickTopics = [
  "How do I validate my startup idea?",
  "Help me build a pitch",
  "Team building strategies",
  "Funding options for beginners",
  "Managing founder stress",
  "Finding product-market fit",
  "I need direction",
];

const AIEntrepreneurshipCoach = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ ideas: 0, challenges: 0, projects: 0 });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchStats = async () => {
    if (!profile) return;
    const [ideasRes, challengesRes, projectsRes] = await Promise.all([
      supabase.from("startup_ideas").select("id", { count: "exact", head: true }).eq("user_id", profile.user_id),
      supabase.from("mindset_challenges").select("id", { count: "exact", head: true }).eq("user_id", profile.user_id).eq("status", "completed"),
      supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", profile.user_id).eq("intent", "entrepreneurship"),
    ]);
    setStats({
      ideas: ideasRes.count || 0,
      challenges: challengesRes.count || 0,
      projects: projectsRes.count || 0,
    });
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg: Msg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        context: {
          name: profile?.full_name,
          intent: profile?.active_intent,
          userType: profile?.user_type,
          industry: profile?.industry,
          careerStage: profile?.career_stage,
          areasOfFocus: profile?.areas_of_focus,
          goals: profile?.short_term_goals,
        },
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (err) => {
          toast.error(err);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error("Failed to connect to AI coach");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">AI Entrepreneurship Coach</h1>
            <p className="font-body text-sm text-muted-foreground">Personalized coaching powered by AI — always here for you</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Target size={18} className="mx-auto text-accent mb-1" />
          <p className="font-body text-[10px] text-muted-foreground">Ideas Sparked</p>
          <p className="font-display text-lg text-foreground">{stats.ideas}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <TrendingUp size={18} className="mx-auto text-primary mb-1" />
          <p className="font-body text-[10px] text-muted-foreground">MVPs Built</p>
          <p className="font-display text-lg text-foreground">{stats.projects}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Sparkles size={18} className="mx-auto text-accent mb-1" />
          <p className="font-body text-[10px] text-muted-foreground">Challenges Done</p>
          <p className="font-display text-lg text-foreground">{stats.challenges}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickTopics.map(t => (
          <button key={t} onClick={() => sendMessage(t)} disabled={isLoading}
            className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-body text-xs hover:bg-accent/10 hover:text-accent transition-all disabled:opacity-50">
            {t}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Bot className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">
                Hey {profile?.full_name || "Founder"}! 👋
              </h3>
              <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
                I'm your AI coach. Ask me about startup ideas, mindset, team building, funding, or anything on your entrepreneurial journey.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-4 rounded-xl font-body text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl p-4">
                <Loader2 size={16} className="animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="border-t border-border p-4 flex gap-2">
          <Textarea
            placeholder="Ask your coach anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={1}
            className="resize-none"
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <Button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
            className="bg-primary text-primary-foreground">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIEntrepreneurshipCoach;
