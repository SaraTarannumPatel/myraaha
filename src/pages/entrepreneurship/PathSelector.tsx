import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Compass, ArrowRight, Sparkles, CheckCircle, BarChart3 } from "lucide-react";

const paths = [
  { id: "freelance", title: "Freelancing", description: "Offer your skills as a service. Low risk, flexible schedule.", skills: ["Communication", "Time Management", "Niche Expertise"], risk: "Low", reward: "Medium" },
  { id: "product", title: "Product Startup", description: "Build a product that solves a real problem at scale.", skills: ["Product Design", "Engineering", "Marketing"], risk: "High", reward: "High" },
  { id: "social", title: "Social Impact Venture", description: "Create change by solving social or community problems.", skills: ["Empathy", "Community Building", "Grant Writing"], risk: "Medium", reward: "High (Impact)" },
  { id: "consulting", title: "Consulting / Agency", description: "Leverage expertise to advise businesses and organizations.", skills: ["Domain Expertise", "Networking", "Presentation"], risk: "Low", reward: "Medium-High" },
];

const PathSelector = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [committed, setCommitted] = useState(false);

  const commitToPath = () => {
    if (!selected) { toast.error("Choose a path first"); return; }
    setCommitted(true);
    toast.success("Path selected! Your roadmap is being generated.");
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Compass size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Path Selector</h1>
            <p className="font-body text-sm text-muted-foreground">Let's help you choose the right path — one that aligns with your strengths and passions.</p>
          </div>
        </div>
      </motion.div>

      {/* Signal Detection */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-accent" /> Your Early Signals
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Tech Innovation", "Creative Problem Solving", "Community Impact", "Business Strategy"].map((signal, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50 text-center">
              <p className="font-body text-xs text-muted-foreground">Interest Signal</p>
              <p className="font-display text-sm text-foreground mt-1">{signal}</p>
              <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                <div className="h-full gradient-warm rounded-full" style={{ width: `${60 + Math.random() * 35}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Path Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {paths.map((path, i) => (
          <motion.div key={path.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <button
              onClick={() => !committed && setSelected(path.id)}
              className={`w-full text-left bg-card rounded-xl border p-6 transition-all ${selected === path.id ? "border-accent shadow-accent/10 shadow-lg" : "border-border hover:border-accent/30"} ${committed && selected !== path.id ? "opacity-40" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-xl text-foreground">{path.title}</h3>
                {selected === path.id && <CheckCircle size={20} className="text-accent" />}
              </div>
              <p className="font-body text-sm text-muted-foreground mb-3">{path.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {path.skills.map(s => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px]">{s}</span>
                ))}
              </div>
              <div className="flex gap-4">
                <span className="font-body text-xs text-muted-foreground">Risk: <strong className="text-foreground">{path.risk}</strong></span>
                <span className="font-body text-xs text-muted-foreground">Reward: <strong className="text-foreground">{path.reward}</strong></span>
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {!committed && (
        <div className="text-center">
          <Button onClick={commitToPath} disabled={!selected} className="gradient-warm text-secondary-foreground px-8">
            <ArrowRight size={18} /> Commit to This Path
          </Button>
        </div>
      )}

      {committed && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-accent/5 rounded-xl border border-accent/30 p-6 text-center">
          <Sparkles className="mx-auto text-accent mb-3" size={32} />
          <h3 className="font-display text-xl text-foreground">Path Selected!</h3>
          <p className="font-body text-sm text-muted-foreground mt-2">Your personalized roadmap is being generated based on your chosen path and signals. Check your Startup Lab for next steps.</p>
        </motion.div>
      )}
    </div>
  );
};

export default PathSelector;
