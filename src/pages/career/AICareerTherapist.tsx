import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Send, Wind, BookHeart, Sparkles } from "lucide-react";

const emotions = ["😰 Anxious", "😞 Lost", "😵 Overwhelmed", "😴 Unmotivated", "🤷 Doubtful", "🔥 Burnt out", "💪 Help me feel better"];

const therapistResponses: Record<string, string> = {
  "😰 Anxious": "I hear you. Anxiety about your career is completely normal. Let's try a quick grounding exercise: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Then, let's talk about what's making you anxious.",
  "😞 Lost": "Feeling lost is actually the beginning of finding your way. You've been exploring some interesting domains in Curiosity Compass. Sometimes we need to sit with uncertainty before clarity arrives. What was the last thing that made you feel excited about your future?",
  "😵 Overwhelmed": "Let's simplify things. You don't need to figure it all out today. What if we focused on just one small task? Pick the easiest thing on your to-do list and start there. Small wins build momentum.",
  "😴 Unmotivated": "That's okay — motivation comes and goes. Instead of waiting for it, let's create a tiny habit. What's one 5-minute task you could do right now? Sometimes action creates motivation, not the other way around.",
  default: "You're not alone. Whatever you're feeling right now is valid. Let's work through this together — one step, one thought, one action at a time. What's on your mind?"
};

const AICareerTherapist = () => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<{ role: "user" | "therapist"; content: string }[]>([
    { role: "therapist", content: `You're not alone, ${profile?.full_name || "friend"}. Let's work through this together — one step, one thought, one action at a time. How are you feeling today?` }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setInput("");
    setTimeout(() => {
      const response = therapistResponses[msg] || therapistResponses.default;
      setMessages(prev => [...prev, { role: "therapist", content: response }]);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Heart size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">AI Career Therapist</h1>
            <p className="font-body text-sm text-muted-foreground">Emotional support for your career journey</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Tools */}
      <div className="grid grid-cols-3 gap-3">
        <button className="bg-card rounded-xl border border-border p-4 text-center hover:border-accent/30 transition-all">
          <Wind size={20} className="mx-auto text-accent mb-1" />
          <p className="font-body text-xs text-foreground">Breathing Exercise</p>
        </button>
        <button className="bg-card rounded-xl border border-border p-4 text-center hover:border-accent/30 transition-all">
          <BookHeart size={20} className="mx-auto text-accent mb-1" />
          <p className="font-body text-xs text-foreground">Guided Journal</p>
        </button>
        <button className="bg-card rounded-xl border border-border p-4 text-center hover:border-accent/30 transition-all">
          <Sparkles size={20} className="mx-auto text-accent mb-1" />
          <p className="font-body text-xs text-foreground">Affirmations</p>
        </button>
      </div>

      {/* Emotion Selector */}
      <div className="flex flex-wrap gap-2">
        {emotions.map(e => (
          <button key={e} onClick={() => sendMessage(e)} className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-body text-xs hover:bg-accent/10 hover:text-accent transition-all">{e}</button>
        ))}
      </div>

      {/* Chat */}
      <div className="bg-card rounded-xl border border-border">
        <div className="h-80 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-4 rounded-xl font-body text-sm whitespace-pre-wrap ${msg.role === "user" ? "gradient-warm text-secondary-foreground" : "bg-muted text-foreground"}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="border-t border-border p-4 flex gap-2">
          <Textarea placeholder="Share what's on your mind..." value={input} onChange={e => setInput(e.target.value)} rows={1} className="resize-none" onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <Button onClick={() => sendMessage()} className="gradient-warm text-secondary-foreground"><Send size={18} /></Button>
        </div>
      </div>
    </div>
  );
};

export default AICareerTherapist;
