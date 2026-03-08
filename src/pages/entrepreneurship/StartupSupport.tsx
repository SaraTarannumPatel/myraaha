import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LifeBuoy, Send, BookOpen, Users, Heart, Zap } from "lucide-react";

const supportCategories = [
  { icon: Zap, label: "Product & Validation", description: "Help with MVP, testing assumptions, finding PMF" },
  { icon: Users, label: "Team & Co-founders", description: "Building teams, resolving conflicts, finding partners" },
  { icon: BookOpen, label: "Learning & Skills", description: "What to learn next, filling knowledge gaps" },
  { icon: Heart, label: "Emotional Support", description: "Dealing with stress, burnout, or self-doubt" },
];

const StartupSupport = () => {
  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitQuestion = () => {
    if (!question.trim()) { toast.error("Please describe your challenge"); return; }
    setSubmitted(true);
    toast.success("Your question has been submitted! We'll match you with the right support.");
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <LifeBuoy size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Startup Support</h1>
            <p className="font-body text-sm text-muted-foreground">You're not alone — get expert advice, tools, and encouragement.</p>
          </div>
        </div>
      </motion.div>

      {/* Support Categories */}
      <div className="grid md:grid-cols-2 gap-4">
        {supportCategories.map((cat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <button
              onClick={() => setSelectedCategory(cat.label)}
              className={`w-full text-left bg-card rounded-xl border p-5 transition-all ${selectedCategory === cat.label ? "border-accent shadow-soft" : "border-border hover:border-accent/30"}`}
            >
              <cat.icon size={24} className="text-accent mb-2" />
              <h3 className="font-display text-lg text-foreground">{cat.label}</h3>
              <p className="font-body text-sm text-muted-foreground">{cat.description}</p>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Ask for Help */}
      {selectedCategory && !submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl text-foreground">Describe your challenge</h2>
          <p className="font-body text-sm text-muted-foreground">Category: <strong className="text-accent">{selectedCategory}</strong></p>
          <Textarea placeholder="What are you struggling with? Be as specific as you can..." value={question} onChange={e => setQuestion(e.target.value)} rows={4} />
          <Button onClick={submitQuestion} className="gradient-warm text-secondary-foreground"><Send size={18} /> Get Help</Button>
        </motion.div>
      )}

      {submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/30 p-6 text-center">
          <LifeBuoy className="mx-auto text-accent mb-3" size={32} />
          <h3 className="font-display text-xl text-foreground">Help is on the way!</h3>
          <p className="font-body text-sm text-muted-foreground mt-2">We're matching you with mentors and resources for "{selectedCategory}". Check your notifications for updates.</p>
          <Button onClick={() => { setSubmitted(false); setSelectedCategory(null); setQuestion(""); }} variant="outline" className="mt-4">Ask Another Question</Button>
        </motion.div>
      )}

      {/* Quick Resources */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4">Quick Resources</h2>
        <div className="space-y-3">
          {["How to validate your startup idea in 7 days", "Building resilience as a first-time founder", "Finding your first 10 customers", "Managing founder burnout"].map((resource, i) => (
            <div key={i} className="p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <p className="font-body text-sm text-foreground">{resource}</p>
              <p className="font-body text-[10px] text-accent mt-0.5">Read more →</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartupSupport;
