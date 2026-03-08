import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bot, Send, Sparkles, Target, TrendingUp, RefreshCw } from "lucide-react";

const quickTopics = [
  "Choosing a career path", "Deciding between options", "Understanding learning gaps",
  "Staying motivated", "Preparing for applications", "Managing career transitions", "I'm stuck"
];

const coachResponses: Record<string, string> = {
  "Choosing a career path": "Let's explore this together! Based on your Curiosity Compass data, you've shown interest in creative and analytical fields. Consider exploring roles that combine both — like UX Research or Product Management. Would you like me to suggest a learning path?",
  "Deciding between options": "Great that you have options! Let's weigh them using your SelfGraph insights. What are the two options you're considering? I'll help you think through the pros and cons based on your strengths and energy patterns.",
  "I'm stuck": "That's completely normal and okay. Let's take it one step at a time. What was the last thing you were working on? Sometimes going back to what excited you can reignite momentum.",
  default: "I'm here to help you navigate your journey. Based on your profile and activity, here are some personalized suggestions:\n\n1. Complete your Curiosity Compass to discover new domains\n2. Set a short-term goal in your Roadmap\n3. Try a challenge in Project Playground\n\nWhat resonates with you most?"
};

const VirtualCareerCoach = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<{ role: "user" | "coach"; content: string }[]>([
    { role: "coach", content: `Welcome back, ${profile?.full_name || "Explorer"}! Need help? Let's figure this out together. Your career journey is unique — and I'm here to guide you every step of the way. What would you like to work on today?` }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setTimeout(() => {
      const response = coachResponses[msg] || coachResponses.default;
      setMessages(prev => [...prev, { role: "coach", content: response }]);
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
            <h1 className="font-display text-3xl text-foreground">Virtual Career Coach</h1>
            <p className="font-body text-sm text-muted-foreground">AI-powered guidance for your career journey</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Decision Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-1">
            <Target size={16} className="text-green-600" />
          </div>
          <p className="font-body text-[10px] text-muted-foreground">Alignment Score</p>
          <p className="font-display text-lg text-green-600">78%</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-1">
            <TrendingUp size={16} className="text-accent" />
          </div>
          <p className="font-body text-[10px] text-muted-foreground">Growth This Month</p>
          <p className="font-display text-lg text-accent">+12%</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
            <Sparkles size={16} className="text-primary" />
          </div>
          <p className="font-body text-[10px] text-muted-foreground">Next Milestone</p>
          <p className="font-display text-lg text-foreground">3 steps</p>
        </div>
      </div>

      {/* Quick Topics */}
      <div className="flex flex-wrap gap-2">
        {quickTopics.map(topic => (
          <button key={topic} onClick={() => sendMessage(topic)} className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-body text-xs hover:bg-accent/10 hover:text-accent transition-all">{topic}</button>
        ))}
      </div>

      {/* Chat */}
      <div className="bg-card rounded-xl border border-border">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-4 rounded-xl font-body text-sm whitespace-pre-wrap ${msg.role === "user" ? "gradient-warm text-secondary-foreground" : "bg-muted text-foreground"}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="border-t border-border p-4 flex gap-2">
          <Textarea placeholder="Ask anything about your career..." value={input} onChange={e => setInput(e.target.value)} rows={1} className="resize-none" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <Button onClick={() => sendMessage()} className="gradient-warm text-secondary-foreground"><Send size={18} /></Button>
        </div>
      </div>
    </div>
  );
};

export default VirtualCareerCoach;
