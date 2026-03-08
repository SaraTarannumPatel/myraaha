import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, Target, TrendingUp, Sparkles } from "lucide-react";

const quickTopics = ["Funding options", "Team building", "Problem-solving", "Managing stress", "Product strategy", "Pitch practice", "I need direction"];

const AIEntrepreneurshipCoach = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<{ role: "user" | "coach"; content: string }[]>([
    { role: "coach", content: `Let's figure this out together, ${profile?.full_name || "Founder"}! I'm here to guide you through every twist and turn in your startup journey. What's on your mind?` }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "coach", content: `Great question about "${msg}". Based on your journey so far, here's what I'd suggest:\n\n1. Start by reflecting on what's working well\n2. Identify the one biggest blocker right now\n3. Break it into 3 small, actionable steps\n\nWould you like me to dive deeper into any of these?` }]);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Bot size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">AI Entrepreneurship Coach</h1>
            <p className="font-body text-sm text-muted-foreground">24/7 coaching for your startup journey</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Target size={18} className="mx-auto text-accent mb-1" />
          <p className="font-body text-[10px] text-muted-foreground">Focus Score</p>
          <p className="font-display text-lg text-accent">82%</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <TrendingUp size={18} className="mx-auto text-primary mb-1" />
          <p className="font-body text-[10px] text-muted-foreground">Progress</p>
          <p className="font-display text-lg text-foreground">Week 3</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Sparkles size={18} className="mx-auto text-accent mb-1" />
          <p className="font-body text-[10px] text-muted-foreground">Challenges Done</p>
          <p className="font-display text-lg text-foreground">5</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickTopics.map(t => (
          <button key={t} onClick={() => sendMessage(t)} className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-body text-xs hover:bg-accent/10 hover:text-accent transition-all">{t}</button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="h-80 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-4 rounded-xl font-body text-sm whitespace-pre-wrap ${msg.role === "user" ? "gradient-warm text-secondary-foreground" : "bg-muted text-foreground"}`}>{msg.content}</div>
            </motion.div>
          ))}
        </div>
        <div className="border-t border-border p-4 flex gap-2">
          <Textarea placeholder="Ask your coach anything..." value={input} onChange={e => setInput(e.target.value)} rows={1} className="resize-none" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <Button onClick={() => sendMessage()} className="gradient-warm text-secondary-foreground"><Send size={18} /></Button>
        </div>
      </div>
    </div>
  );
};

export default AIEntrepreneurshipCoach;
