import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Lightbulb, Brain, Rocket, Wrench, Compass, User, Bot, Presentation,
  Heart, Target, Zap, Users, Star, Check, ChevronRight, Send,
  Sparkles, TrendingUp, BarChart3, Shield, BookOpen, Eye,
  ThumbsUp, MessageCircle, Filter, Clock, Award, Globe,
  Briefcase, Layers, FlaskConical, Play, ArrowRight,
} from "lucide-react";

/* ─── Browser Frame ─── */
const BrowserFrame = ({ children, url, isActive }: {
  children: React.ReactNode;
  url: string;
  isActive: boolean;
}) => (
  <motion.div
    layout
    className={`flex flex-col transition-all duration-500 ${isActive ? "scale-100 opacity-100" : "scale-95 opacity-60"}`}
  >
    <div className="relative w-[520px] max-w-full rounded-xl border border-border bg-card shadow-xl overflow-hidden">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
        </div>
        <div className="flex-1 mx-3">
          <div className="bg-background rounded-md px-3 py-1 text-[10px] font-body text-muted-foreground truncate border border-border/50">
            myraaha.app/{url}
          </div>
        </div>
      </div>
      {/* Content area */}
      <div className="h-[340px] overflow-hidden bg-background">
        {children}
      </div>
    </div>
  </motion.div>
);

/* ─── 1. Startup Sparks ─── */
const StartupSparksMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 4), 2000); return () => clearInterval(t); }, []);

  const cards = [
    { title: "Local Food Waste App", sector: "Social Impact", difficulty: "Beginner", tags: ["sustainability", "mobile"] },
    { title: "AI Study Group Matcher", sector: "EdTech", difficulty: "Intermediate", tags: ["AI", "community"] },
    { title: "Freelancer Finance Tool", sector: "FinTech", difficulty: "Advanced", tags: ["SaaS", "automation"] },
  ];

  return (
    <div className="p-4 space-y-3">
      {/* Top nav */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex gap-1">
          {["Idea Cards", "My Ideas", "Problem Spotting", "Quests"].map((tab, i) => (
            <div key={tab} className={`px-2.5 py-1 rounded-md text-[9px] font-body transition-all ${i === 0 ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"}`}>
              {tab}
            </div>
          ))}
        </div>
      </div>
      {/* Sector filter */}
      <div className="flex gap-1.5 overflow-hidden">
        {[{ icon: Globe, label: "All" }, { icon: Heart, label: "Social" }, { icon: Zap, label: "Tech" }, { icon: Sparkles, label: "Creative" }].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: step >= 1 ? 1 : 0.3, y: step >= 1 ? 0 : 8 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-body border ${i === 0 ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}
          >
            <s.icon size={8} />
            {s.label}
          </motion.div>
        ))}
      </div>
      {/* Idea cards */}
      <div className="space-y-2">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: step >= 2 ? 1 : 0.2, x: step >= 2 ? 0 : 30 }}
            transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
            className="p-3 rounded-lg border border-border bg-card hover:border-primary/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xs text-foreground">{card.title}</p>
                <div className="flex gap-1 mt-1">
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-body">{card.sector}</span>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body">{card.difficulty}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <motion.div animate={{ scale: step >= 3 && i === 0 ? [1, 1.3, 1] : 1 }} className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart size={8} className={step >= 3 && i === 0 ? "text-primary fill-primary" : "text-muted-foreground"} />
                </motion.div>
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  <BookOpen size={8} className="text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="flex gap-1 mt-1.5">
              {card.tags.map(t => (
                <span key={t} className="text-[7px] text-muted-foreground font-body">#{t}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ─── 2. Mindset Builder ─── */
const MindsetBuilderMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 5), 1800); return () => clearInterval(t); }, []);

  const challenges = [
    { type: "fear", title: "Face a Fear", desc: "Take one small step toward an entrepreneurial fear.", status: "active" },
    { type: "pitch", title: "60-Second Pitch", desc: "Pitch your idea to someone in under 60 seconds.", status: "completed" },
    { type: "failure", title: "Embrace Failure", desc: "Write about a failure and 3 lessons it taught you.", status: "locked" },
  ];

  const habits = [
    { title: "Morning Journaling", streak: 7, category: "discipline" },
    { title: "Idea Generation", streak: 3, category: "creativity" },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="font-display text-sm text-foreground">Mindset Builder</p>
        <div className="flex gap-1">
          {["Challenges", "Habits", "Tracks"].map((tab, i) => (
            <div key={tab} className={`px-2 py-0.5 rounded text-[8px] font-body ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>{tab}</div>
          ))}
        </div>
      </div>
      {/* Active challenge card */}
      <motion.div
        animate={{ borderColor: step >= 1 ? "hsl(var(--primary) / 0.3)" : "hsl(var(--border))" }}
        className="p-3 rounded-lg border bg-card relative overflow-hidden"
      >
        <motion.div className="absolute top-0 left-0 h-full bg-primary/5" animate={{ width: step >= 2 ? "100%" : "0%" }} transition={{ duration: 1.5 }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
              <Shield size={10} className="text-accent" />
            </div>
            <div>
              <p className="font-display text-xs text-foreground">Face a Fear</p>
              <p className="text-[8px] font-body text-muted-foreground">Active Challenge</p>
            </div>
            <motion.div animate={{ scale: step >= 3 ? [1, 1.2, 1] : 1 }} className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-[8px] text-primary font-body">
              {step >= 3 ? "✓ Done" : "In Progress"}
            </motion.div>
          </div>
          <p className="text-[9px] font-body text-muted-foreground">Take one small step toward an entrepreneurial fear today.</p>
        </div>
      </motion.div>
      {/* Habit tracker */}
      <div className="space-y-1.5">
        <p className="text-[9px] font-body text-muted-foreground uppercase tracking-wider">Daily Habits</p>
        {habits.map((h, i) => (
          <motion.div
            key={h.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 2 ? 1 : 0.3 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
          >
            <motion.div
              animate={{ backgroundColor: step >= 4 && i === 0 ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
              className="w-4 h-4 rounded border border-border flex items-center justify-center"
            >
              {step >= 4 && i === 0 && <Check size={8} className="text-primary-foreground" />}
            </motion.div>
            <span className="text-[9px] font-body text-foreground flex-1">{h.title}</span>
            <span className="text-[8px] font-body text-primary">🔥 {h.streak}d</span>
          </motion.div>
        ))}
      </div>
      {/* Principles grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { icon: Brain, label: "Growth" },
          { icon: Zap, label: "Experiment" },
          { icon: Target, label: "Problem-Solve" },
        ].map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: step >= 1 ? 1 : 0.8, opacity: step >= 1 ? 1 : 0.3 }}
            transition={{ delay: i * 0.1 }}
            className="p-2 rounded-md bg-muted/20 border border-border text-center"
          >
            <p.icon size={12} className="mx-auto text-primary mb-0.5" />
            <p className="text-[7px] font-body text-muted-foreground">{p.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ─── 3. Startup Lab ─── */
const StartupLabMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 5), 2200); return () => clearInterval(t); }, []);

  const tabs = ["Workspace", "Validation", "Planning", "Milestones"];
  const milestones = [
    { title: "Problem Validated", status: "done" },
    { title: "Customer Interviews", status: "active" },
    { title: "MVP Prototype", status: "upcoming" },
    { title: "Launch Sprint", status: "upcoming" },
  ];

  return (
    <div className="p-4 space-y-3">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border pb-2">
        {tabs.map((tab, i) => (
          <div key={tab} className={`px-2.5 py-1 text-[9px] font-body rounded-t ${i === 0 ? "border-b-2 border-primary text-primary font-semibold" : "text-muted-foreground"}`}>{tab}</div>
        ))}
      </div>
      {/* Plan card */}
      <motion.div
        animate={{ y: step >= 1 ? 0 : 10, opacity: step >= 1 ? 1 : 0 }}
        className="p-3 rounded-lg border border-border bg-card"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Rocket size={12} className="text-primary" />
          </div>
          <div>
            <p className="font-display text-xs text-foreground">EcoTrack — Sustainability App</p>
            <p className="text-[8px] font-body text-muted-foreground">Vision: Make carbon tracking effortless</p>
          </div>
        </div>
        <div className="flex gap-2 text-[8px] font-body">
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">In Progress</span>
          <span className="text-muted-foreground">3 sprints · 8 milestones</span>
        </div>
      </motion.div>
      {/* Validation sprint */}
      <motion.div animate={{ opacity: step >= 2 ? 1 : 0.2 }} className="p-3 rounded-lg border border-border bg-muted/20">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical size={10} className="text-accent" />
          <p className="text-[9px] font-display text-foreground">Validation Sprint #2</p>
        </div>
        <p className="text-[8px] font-body text-muted-foreground mb-2">Hypothesis: Users will pay for automated carbon tracking</p>
        <div className="w-full bg-muted rounded-full h-1.5">
          <motion.div className="bg-primary rounded-full h-1.5" animate={{ width: step >= 3 ? "72%" : "0%" }} transition={{ duration: 1.2 }} />
        </div>
        <p className="text-[7px] font-body text-muted-foreground mt-1">72% validated</p>
      </motion.div>
      {/* Milestones */}
      <div className="space-y-1.5">
        {milestones.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: step >= 2 ? 1 : 0.2, x: step >= 2 ? 0 : -10 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2"
          >
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
              m.status === "done" ? "bg-primary text-primary-foreground" :
              m.status === "active" ? "border-2 border-primary bg-transparent" :
              "border border-border bg-muted"
            }`}>
              {m.status === "done" && <Check size={8} />}
            </div>
            <span className={`text-[9px] font-body ${m.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>{m.title}</span>
            {m.status === "active" && <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[7px] text-primary font-body">Current</motion.span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ─── 4. MVP Builder ─── */
const MVPBuilderMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 5), 2000); return () => clearInterval(t); }, []);

  const experiments = [
    { title: "Customer Interview", icon: Users, status: "completed", result: "8/10 validated" },
    { title: "Landing Page Test", icon: Layers, status: "running", result: "127 signups" },
    { title: "Prototype Walkthrough", icon: FlaskConical, status: "planned", result: "—" },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm text-foreground">MVP Builder</p>
        <div className="px-2 py-0.5 rounded bg-accent/10 text-accent text-[8px] font-body">Building Phase</div>
      </div>
      {/* Project header */}
      <motion.div animate={{ opacity: step >= 1 ? 1 : 0.3 }} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
        <p className="font-display text-xs text-foreground">EcoTrack MVP</p>
        <div className="flex gap-3 mt-1.5">
          <div className="text-center">
            <p className="text-sm font-display text-primary">3</p>
            <p className="text-[7px] font-body text-muted-foreground">Experiments</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-display text-accent">5</p>
            <p className="text-[7px] font-body text-muted-foreground">Milestones</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-display text-foreground">72%</p>
            <p className="text-[7px] font-body text-muted-foreground">Progress</p>
          </div>
        </div>
      </motion.div>
      {/* Experiment cards */}
      <div className="space-y-1.5">
        <p className="text-[9px] font-body text-muted-foreground uppercase tracking-wider">Experiments</p>
        {experiments.map((e, i) => (
          <motion.div
            key={e.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: step >= 2 ? 1 : 0.2, y: step >= 2 ? 0 : 8 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 p-2 rounded-md border border-border bg-card"
          >
            <div className={`w-6 h-6 rounded flex items-center justify-center ${
              e.status === "completed" ? "bg-primary/10" : e.status === "running" ? "bg-accent/10" : "bg-muted"
            }`}>
              <e.icon size={10} className={e.status === "completed" ? "text-primary" : e.status === "running" ? "text-accent" : "text-muted-foreground"} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-body text-foreground">{e.title}</p>
              <p className="text-[7px] font-body text-muted-foreground">{e.result}</p>
            </div>
            <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-body ${
              e.status === "completed" ? "bg-primary/10 text-primary" : e.status === "running" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
            }`}>{e.status}</span>
          </motion.div>
        ))}
      </div>
      {/* Skill mapping hint */}
      <motion.div
        animate={{ opacity: step >= 4 ? 1 : 0 }}
        className="p-2 rounded-md bg-muted/30 border border-border flex items-center gap-2"
      >
        <Brain size={10} className="text-primary shrink-0" />
        <p className="text-[8px] font-body text-muted-foreground">AI Skill Map: You need <span className="text-primary">UX Design</span> and <span className="text-primary">Data Analytics</span> for next phase</p>
      </motion.div>
    </div>
  );
};

/* ─── 5. Path Selector ─── */
const PathSelectorMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 5), 2000); return () => clearInterval(t); }, []);

  const paths = [
    { icon: Rocket, title: "Product Startup", risk: "High", opp: "High scalability", match: 87 },
    { icon: Heart, title: "Social Impact", risk: "Medium", opp: "Meaningful change", match: 72 },
    { icon: Briefcase, title: "Freelancing", risk: "Low", opp: "Flexible lifestyle", match: 65 },
  ];

  return (
    <div className="p-4 space-y-3">
      <p className="font-display text-sm text-foreground mb-1">Path Selector</p>
      {/* Alignment quiz */}
      <motion.div animate={{ opacity: step >= 1 ? 1 : 0.3 }} className="p-3 rounded-lg bg-muted/30 border border-border">
        <p className="text-[9px] font-body text-foreground mb-2">How comfortable are you with financial uncertainty?</p>
        <div className="flex gap-1.5">
          {["Very comfortable", "Somewhat", "Prefer stability"].map((opt, i) => (
            <motion.div
              key={opt}
              animate={{ borderColor: step >= 2 && i === 0 ? "hsl(var(--primary))" : "hsl(var(--border))", backgroundColor: step >= 2 && i === 0 ? "hsl(var(--primary) / 0.05)" : "transparent" }}
              className="px-2 py-1 rounded border text-[8px] font-body cursor-pointer"
            >
              {opt}
            </motion.div>
          ))}
        </div>
      </motion.div>
      {/* Path cards */}
      <div className="space-y-1.5">
        {paths.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: step >= 3 ? 1 : 0.2, x: step >= 3 ? 0 : 20 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <p.icon size={14} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-display text-foreground">{p.title}</p>
              <p className="text-[7px] font-body text-muted-foreground">Risk: {p.risk} · {p.opp}</p>
            </div>
            <motion.div
              animate={{ scale: step >= 4 && i === 0 ? [1, 1.15, 1] : 1 }}
              className="text-center"
            >
              <p className="text-sm font-display text-primary">{p.match}%</p>
              <p className="text-[6px] font-body text-muted-foreground">match</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
      {/* AI signal */}
      <motion.div animate={{ opacity: step >= 4 ? 1 : 0 }} className="p-2 rounded-md bg-primary/5 border border-primary/10 flex items-center gap-2">
        <Sparkles size={10} className="text-primary shrink-0" />
        <p className="text-[8px] font-body text-foreground">AI detected strong signals for <span className="text-primary font-semibold">Product Startup</span> path</p>
      </motion.div>
    </div>
  );
};

/* ─── 6. Founder Profile ─── */
const FounderProfileMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 4), 2200); return () => clearInterval(t); }, []);

  const stats = [
    { label: "Ideas", value: "12", icon: Lightbulb },
    { label: "Challenges", value: "8", icon: Shield },
    { label: "Projects", value: "3", icon: Rocket },
    { label: "Skills", value: "15", icon: Zap },
  ];

  return (
    <div className="p-4 space-y-3">
      {/* Profile header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User size={16} className="text-primary" />
        </div>
        <div>
          <p className="font-display text-sm text-foreground">Founder Dashboard</p>
          <p className="text-[8px] font-body text-muted-foreground">Visionary Builder · Intermediate</p>
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: step >= 1 ? 1 : 0.8, opacity: step >= 1 ? 1 : 0.3 }}
            transition={{ delay: i * 0.08 }}
            className="p-2 rounded-lg bg-muted/30 text-center border border-border"
          >
            <s.icon size={10} className="mx-auto text-primary mb-0.5" />
            <p className="text-sm font-display text-foreground">{s.value}</p>
            <p className="text-[6px] font-body text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
      {/* Strengths */}
      <motion.div animate={{ opacity: step >= 2 ? 1 : 0.2 }} className="p-3 rounded-lg border border-border bg-card">
        <p className="text-[9px] font-body text-muted-foreground mb-1.5">Top Strengths</p>
        <div className="flex flex-wrap gap-1">
          {["Problem-solving", "Resilience", "Creativity", "Communication", "Leadership"].map((s, i) => (
            <motion.span
              key={s}
              initial={{ scale: 0 }}
              animate={{ scale: step >= 2 ? 1 : 0 }}
              transition={{ delay: i * 0.06, type: "spring" }}
              className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-body"
            >
              {s}
            </motion.span>
          ))}
        </div>
      </motion.div>
      {/* AI insight */}
      <motion.div animate={{ opacity: step >= 3 ? 1 : 0, y: step >= 3 ? 0 : 8 }} className="p-2.5 rounded-lg bg-accent/5 border border-accent/10">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles size={10} className="text-accent" />
          <p className="text-[9px] font-display text-foreground">AI Insight</p>
        </div>
        <p className="text-[8px] font-body text-muted-foreground leading-relaxed">Your resilience scores have improved 23% this month. Consider taking on a higher-risk challenge to test your growth.</p>
      </motion.div>
    </div>
  );
};

/* ─── 7. AI Coach ─── */
const AICoachMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 5), 1800); return () => clearInterval(t); }, []);

  const messages = [
    { role: "user", text: "I'm struggling to validate my idea. Where do I start?" },
    { role: "assistant", text: "Let's break this down. First, who is your ideal customer? Describe them in one sentence." },
    { role: "user", text: "College students who waste food in dorms." },
    { role: "assistant", text: "Great specificity! Here's your 3-step validation plan:\n1. Interview 5 students this week\n2. Create a simple survey\n3. Test with a no-code landing page" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot size={12} className="text-primary" />
        </div>
        <div>
          <p className="font-display text-xs text-foreground">AI Entrepreneurship Coach</p>
          <p className="text-[7px] font-body text-primary">Online</p>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 p-3 space-y-2 overflow-hidden">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: step > i ? 1 : 0, y: step > i ? 0 : 10 }}
            transition={{ duration: 0.3 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] px-2.5 py-1.5 rounded-xl text-[9px] font-body leading-relaxed ${
              m.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            }`}>
              {m.text}
            </div>
          </motion.div>
        ))}
        {step === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-2">
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, delay: i * 0.2, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            ))}
          </motion.div>
        )}
      </div>
      {/* Input */}
      <div className="p-2 border-t border-border flex gap-2">
        <div className="flex-1 bg-muted/30 rounded-lg px-2.5 py-1.5 text-[9px] font-body text-muted-foreground">Ask anything about your startup...</div>
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Send size={10} className="text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};

/* ─── 8. Startup Showcase ─── */
const StartupShowcaseMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 4), 2200); return () => clearInterval(t); }, []);

  const projects = [
    { title: "EcoTrack", desc: "Carbon footprint tracking for students", likes: 24, comments: 8, stage: "MVP" },
    { title: "StudyBuddy AI", desc: "AI-powered study group matcher", likes: 18, comments: 5, stage: "Idea" },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="font-display text-sm text-foreground">Startup Showcase</p>
        <div className="flex gap-1.5">
          {["All", "MVP", "Idea", "Launched"].map((f, i) => (
            <span key={f} className={`px-2 py-0.5 rounded-full text-[8px] font-body ${i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>{f}</span>
          ))}
        </div>
      </div>
      {/* Project cards */}
      <div className="space-y-2.5">
        {projects.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: step >= 1 ? 1 : 0.2, y: step >= 1 ? 0 : 12 }}
            transition={{ delay: i * 0.15 }}
            className="p-3 rounded-lg border border-border bg-card"
          >
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <p className="font-display text-xs text-foreground">{p.title}</p>
                <p className="text-[8px] font-body text-muted-foreground">{p.desc}</p>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[7px] font-body bg-accent/10 text-accent">{p.stage}</span>
            </div>
            <div className="flex items-center gap-3">
              <motion.div animate={{ scale: step >= 2 && i === 0 ? [1, 1.3, 1] : 1 }} className="flex items-center gap-1 text-[8px] font-body text-muted-foreground">
                <Heart size={8} className={step >= 2 && i === 0 ? "text-primary fill-primary" : ""} /> {step >= 2 && i === 0 ? p.likes + 1 : p.likes}
              </motion.div>
              <div className="flex items-center gap-1 text-[8px] font-body text-muted-foreground">
                <MessageCircle size={8} /> {p.comments}
              </div>
              <motion.div animate={{ opacity: step >= 3 ? 1 : 0 }} className="flex items-center gap-1 text-[8px] font-body text-primary ml-auto">
                <Users size={8} /> Collaborate
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* AI feedback */}
      <motion.div animate={{ opacity: step >= 3 ? 1 : 0 }} className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles size={9} className="text-primary" />
          <p className="text-[8px] font-display text-foreground">AI Feedback</p>
        </div>
        <p className="text-[7px] font-body text-muted-foreground">"EcoTrack has strong social proof. Consider adding a competitive analysis section to attract mentors."</p>
      </motion.div>
    </div>
  );
};

/* ─── Walkthrough Data ─── */
const walkthroughs = [
  { id: "sparks", label: "Startup Sparks", description: "Discover & validate ideas", icon: Lightbulb, component: StartupSparksMock },
  { id: "mindset", label: "Mindset Builder", description: "Build founder resilience", icon: Brain, component: MindsetBuilderMock },
  { id: "lab", label: "Startup Lab", description: "Structured venture building", icon: Rocket, component: StartupLabMock },
  { id: "mvp", label: "MVP Builder", description: "Experiments & prototyping", icon: Wrench, component: MVPBuilderMock },
  { id: "path", label: "Path Selector", description: "Find your venture path", icon: Compass, component: PathSelectorMock },
  { id: "profile", label: "Founder Profile", description: "Your founder identity", icon: User, component: FounderProfileMock },
  { id: "coach", label: "AI Coach", description: "Entrepreneurship guidance", icon: Bot, component: AICoachMock },
  { id: "showcase", label: "Showcase", description: "Share & get feedback", icon: Presentation, component: StartupShowcaseMock },
];

/* ─── Main Section ─── */
const EntrepreneurshipWalkthroughSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => setActive(a => (a + 1) % walkthroughs.length), 7000);
    return () => clearInterval(t);
  }, [isInView]);

  const ActiveComponent = walkthroughs[active].component;

  return (
    <section ref={ref} className="py-28 md:py-36 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3"
          >
            Entrepreneurship Edition
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground leading-tight"
          >
            Your venture-building <em className="text-gradient-warm">workbench.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-sm text-muted-foreground mt-4"
          >
            From sparking ideas to launching startups — every tool a founder needs, powered by AI that understands your journey.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center max-w-6xl mx-auto">
          {/* Feature selector — left */}
          <div className="lg:w-[300px] w-full">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {walkthroughs.map((w, i) => (
                <motion.button
                  key={w.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 border ${
                    active === i
                      ? "bg-card border-primary/20 shadow-soft"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    active === i ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    <w.icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-display text-sm truncate ${active === i ? "text-primary" : "text-foreground"}`}>{w.label}</p>
                    <p className="font-body text-[10px] text-muted-foreground truncate">{w.description}</p>
                  </div>
                  {active === i && (
                    <motion.div layoutId="ent-walkthrough-indicator" className="w-1 h-6 rounded-full bg-primary ml-auto shrink-0 hidden lg:block" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Browser preview — center */}
          <div className="flex-1 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <BrowserFrame
                  url={`entrepreneurship/${walkthroughs[active].id}`}
                  isActive={true}
                >
                  <ActiveComponent />
                </BrowserFrame>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feature description — right */}
          <div className="lg:w-[260px] w-full text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
                  <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
                    {(() => {
                      const Icon = walkthroughs[active].icon;
                      return <Icon size={18} className="text-primary-foreground" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-display text-xl text-foreground">{walkthroughs[active].label}</p>
                    <p className="font-body text-xs text-muted-foreground">{walkthroughs[active].description}</p>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">
                  {[
                    "Browse curated idea cards, spot real-world problems, validate concepts with AI, and track your ideation journey across sectors.",
                    "Build founder resilience through daily challenges, habit tracking, and structured learning tracks — mindset is your first MVP.",
                    "Take your startup from vision to validation with structured sprints, business planning, milestone tracking, and AI-powered feedback.",
                    "Run lean experiments, test hypotheses, build prototypes, and let AI map the skills you need for each phase of your MVP.",
                    "Discover which entrepreneurial path aligns with your personality, risk appetite, and strengths through AI-guided exploration.",
                    "See your complete founder identity — skills, achievements, projects, and AI-generated insights about your growth trajectory.",
                    "Chat with an AI coach that knows your journey. Get personalized advice on validation, pitching, team-building, and founder wellbeing.",
                    "Share your startup with the community, get reactions and feedback, find collaborators, and let AI guide your next steps.",
                  ][active]}
                </p>

                {/* Progress dots */}
                <div className="flex gap-1.5 mt-6 justify-center lg:justify-start">
                  {walkthroughs.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === active ? "bg-primary w-6" : "bg-muted hover:bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EntrepreneurshipWalkthroughSection;
