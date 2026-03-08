import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Brain, Compass, Heart, Layers, Map, Briefcase, RefreshCw, Rocket,
  Send, Sparkles, Target, TrendingUp, Check, Play, Star,
  BookOpen, Users, Zap, ChevronRight, MessageCircle, Shield,
  BarChart3, Filter, Clock, Award, Lightbulb, Eye,
} from "lucide-react";

/* ─── Reusable AI Badge ─── */
const AIBadge = ({ label = "AI Personalized", delay = 0 }: { label?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring" }}
    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20"
  >
    <Sparkles size={7} className="text-primary" />
    <span className="text-[7px] font-body text-primary font-semibold">{label}</span>
  </motion.div>
);

/* ─── AI Analyzing Indicator ─── */
const AIAnalyzing = ({ label = "AI analyzing your behaviour..." }: { label?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: [0.4, 1, 0.4] }}
    transition={{ repeat: Infinity, duration: 2 }}
    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/5 border border-primary/10"
  >
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
      <Sparkles size={8} className="text-primary" />
    </motion.div>
    <span className="text-[8px] font-body text-primary">{label}</span>
  </motion.div>
);

/* ─── Phone Frame ─── */
const PhoneFrame = ({ children, label, icon: Icon, isActive }: {
  children: React.ReactNode;
  label: string;
  icon: any;
  isActive: boolean;
}) => (
  <motion.div
    layout
    className={`flex flex-col items-center gap-4 transition-all duration-500 ${isActive ? "scale-100 opacity-100" : "scale-95 opacity-60"}`}
  >
    <div className="relative w-[280px] h-[480px] rounded-[2rem] border-[3px] border-foreground/10 bg-card shadow-xl overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1">
        <span className="text-[10px] font-body text-muted-foreground">9:41</span>
        <div className="w-16 h-[3px] rounded-full bg-foreground/10" />
        <div className="flex gap-1">
          <div className="w-3 h-[6px] rounded-sm bg-foreground/20" />
          <div className="w-1 h-[6px] rounded-sm bg-foreground/10" />
        </div>
      </div>
      {/* App header */}
      <div className="px-4 pb-2 flex items-center gap-2 border-b border-border/50">
        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon size={12} className="text-primary" />
        </div>
        <span className="font-display text-xs text-foreground">{label}</span>
        <div className="ml-auto">
          <AIBadge label="For You" />
        </div>
      </div>
      {/* Content */}
      <div className="p-3 h-[410px] overflow-hidden">
        {children}
      </div>
    </div>
  </motion.div>
);

/* ─── 1. SelfGraph™ ─── */
const SelfGraphMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 5), 1800); return () => clearInterval(t); }, []);

  const traits = [
    { label: "Creativity", score: 82, color: "bg-primary" },
    { label: "Resilience", score: 67, color: "bg-accent" },
    { label: "Leadership", score: 74, color: "bg-primary" },
    { label: "Empathy", score: 91, color: "bg-accent" },
    { label: "Analytical", score: 58, color: "bg-primary" },
  ];

  return (
    <div className="space-y-3">
      <div className="text-center mb-2">
        <p className="font-display text-sm text-foreground">Your Identity Map</p>
        <p className="font-body text-[10px] text-muted-foreground">Auto-evolving from your activity</p>
      </div>
      {step === 0 && <AIAnalyzing label="Mapping your behaviour patterns..." />}
      {/* Radar */}
      <div className="flex justify-center mb-2">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {[80, 60, 40, 20].map(r => (
              <circle key={r} cx="50" cy="50" r={r/2} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
            ))}
            <motion.polygon
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              points={traits.map((t, i) => {
                const angle = (i * 2 * Math.PI) / traits.length - Math.PI / 2;
                const r = (t.score / 100) * 38 * (step >= 1 ? 1 : 0.3);
                return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
              }).join(" ")}
              fill="hsl(var(--primary) / 0.15)"
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              className="transition-all duration-1000"
            />
            {traits.map((t, i) => {
              const angle = (i * 2 * Math.PI) / traits.length - Math.PI / 2;
              return (
                <text key={t.label} x={50 + 44 * Math.cos(angle)} y={50 + 44 * Math.sin(angle)} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" fontSize="4" fontFamily="Inter">
                  {t.label.slice(0, 4)}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
      {/* Trait bars */}
      {traits.map((t, i) => (
        <div key={t.label} className="space-y-0.5">
          <div className="flex justify-between">
            <span className="font-body text-[10px] text-foreground">{t.label}</span>
            <span className="font-body text-[10px] text-muted-foreground">{step >= 2 ? t.score : "—"}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div className={`h-full rounded-full ${t.color}`} initial={{ width: "0%" }} animate={{ width: step >= 1 ? `${t.score}%` : "0%" }} transition={{ duration: 0.8, delay: i * 0.1 }} />
          </div>
        </div>
      ))}
      {step >= 3 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 rounded-xl p-2 border border-primary/10">
          <div className="flex items-center gap-1.5">
            <Sparkles size={10} className="text-primary" />
            <span className="font-body text-[9px] text-primary font-medium">AI: Your creativity + empathy → ideal for human-centered design</span>
          </div>
        </motion.div>
      )}
      {step >= 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 justify-center">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <TrendingUp size={8} className="text-primary" />
          </motion.div>
          <span className="text-[8px] font-body text-primary">+12% growth since last week · Auto-tracked</span>
        </motion.div>
      )}
    </div>
  );
};

/* ─── 2. Curiosity Compass ─── */
const CuriosityCompassMock = () => {
  const [cardIndex, setCardIndex] = useState(0);
  const [showInsight, setShowInsight] = useState(false);
  const cards = [
    { emoji: "🎨", title: "UX Design", tag: "Creative", aiNote: "Matches your creativity trait" },
    { emoji: "📊", title: "Data Science", tag: "Analytical", aiNote: "Builds on your analytical skills" },
    { emoji: "🎬", title: "Film Making", tag: "Storytelling", aiNote: "Aligns with communication strength" },
    { emoji: "🧬", title: "Biotech", tag: "Research", aiNote: "New territory — explore mode" },
  ];
  useEffect(() => {
    const t = setInterval(() => {
      setCardIndex(s => {
        const next = (s + 1) % cards.length;
        if (next === 2) setShowInsight(true);
        return next;
      });
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-body text-primary bg-primary/10 px-2 py-0.5 rounded-full">🧭 AI Curated</span>
        </div>
        <AIBadge label="Auto-matched" />
      </div>
      {/* Swipeable cards */}
      <div className="relative h-44 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {cards.map((card, i) => {
            const offset = ((i - cardIndex + cards.length) % cards.length);
            if (offset > 2) return null;
            return (
              <motion.div
                key={card.title}
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: offset === 0 ? 1 : 0.92 - offset * 0.04, y: offset * 12, opacity: offset === 0 ? 1 : 0.5, zIndex: cards.length - offset }}
                exit={{ x: -200, opacity: 0, rotate: -15 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute w-48 bg-card rounded-2xl border border-border shadow-md p-4 text-center"
              >
                <span className="text-3xl block mb-2">{card.emoji}</span>
                <p className="font-display text-sm text-foreground">{card.title}</p>
                <span className="font-body text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">{card.tag}</span>
                {offset === 0 && (
                  <>
                    <p className="text-[8px] font-body text-muted-foreground mt-1.5 italic flex items-center justify-center gap-1">
                      <Sparkles size={7} className="text-primary" /> {card.aiNote}
                    </p>
                    <div className="flex justify-center gap-3 mt-3">
                      <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-destructive text-xs">✕</div>
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs">🤔</div>
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">♥</div>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {showInsight && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 rounded-xl p-2 border border-primary/10">
          <div className="flex items-center gap-1.5">
            <Brain size={9} className="text-primary" />
            <span className="text-[8px] font-body text-primary">AI detected pattern: You gravitate toward creative + social impact domains</span>
          </div>
        </motion.div>
      )}
      <div className="flex justify-center gap-1.5">
        {cards.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === cardIndex ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>
    </div>
  );
};

/* ─── 3. AI Career Therapist ─── */
const TherapistMock = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const msgs = [
    { role: "user", text: "I feel lost and don't know what to do 😞" },
    { role: "ai", text: "Based on your recent SelfGraph, your energy dips when you work in isolation. Let's explore social roles..." },
    { role: "user", text: "I think I chose the wrong career path" },
    { role: "ai", text: "Your behaviour data shows 3x more engagement in creative tasks. There's no wrong path — let's redirect that energy." },
  ];
  useEffect(() => { const t = setInterval(() => setMsgIndex(s => Math.min(s + 1, msgs.length - 1)), 2200); return () => clearInterval(t); }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1.5">
          {["😰", "😞", "😵", "😴"].map(e => (
            <span key={e} className="text-base bg-muted rounded-lg p-0.5 cursor-default">{e}</span>
          ))}
        </div>
        <AIBadge label="Reads your data" />
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        {msgs.slice(0, msgIndex + 1).map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
              {msg.role === "ai" && (
                <div className="flex items-center gap-1 mb-1">
                  <Heart size={8} className="text-primary" />
                  <span className="font-body text-[8px] text-primary font-medium">AI Therapist · Personalized</span>
                </div>
              )}
              <p className="font-body text-[10px] leading-relaxed">{msg.text}</p>
            </div>
          </motion.div>
        ))}
        {msgIndex < msgs.length - 1 && (
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex gap-1 px-3">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
          </motion.div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <div className="flex-1 bg-muted rounded-xl px-3 py-2 font-body text-[10px] text-muted-foreground">Type a message...</div>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <Send size={12} className="text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};

/* ─── 4. SkillStacker ─── */
const SkillStackerMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 6), 1600); return () => clearInterval(t); }, []);

  const skills = [
    { name: "JavaScript", cat: "Core", progress: 78, icon: Shield },
    { name: "React", cat: "Core", progress: 65, icon: Shield },
    { name: "UI Design", cat: "Supporting", progress: 45, icon: Layers },
    { name: "Data Viz", cat: "AI Suggested", progress: 30, icon: Eye },
    { name: "Python", cat: "Supporting", progress: 52, icon: Layers },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="font-display text-xs text-foreground">Active Stack</p>
        <AIBadge label="Auto-tracked" />
      </div>
      {step === 0 && <AIAnalyzing label="Analyzing your skill usage patterns..." />}
      {/* Category filter */}
      <div className="flex gap-1 mb-1">
        {["All", "Core", "Supporting", "AI Picks"].map((c, i) => (
          <span key={c} className={`font-body text-[9px] px-2 py-0.5 rounded-full border ${
            i === 0 ? "bg-primary/10 border-primary/20 text-primary" : i === 3 ? "border-primary/30 text-primary" : "border-border text-muted-foreground"
          }`}>{c}</span>
        ))}
      </div>
      {skills.map((s, i) => (
        <motion.div key={s.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: step >= i + 1 ? 1 : 0.3, x: step >= i + 1 ? 0 : -10 }} transition={{ duration: 0.4 }} className="bg-card rounded-xl p-2 border border-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <s.icon size={10} className="text-primary" />
              <span className="font-body text-[10px] font-medium text-foreground">{s.name}</span>
            </div>
            <span className={`font-body text-[9px] ${s.cat === "AI Suggested" ? "text-primary" : "text-muted-foreground"}`}>{s.cat === "AI Suggested" ? "✨ " + s.cat : s.cat}</span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <motion.div className="h-full rounded-full bg-primary" animate={{ width: step >= i + 1 ? `${s.progress}%` : "0%" }} transition={{ duration: 0.6, delay: 0.1 }} />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="font-body text-[8px] text-muted-foreground">{step >= i + 1 ? `${s.progress}%` : "—"}</span>
            {step >= i + 1 && s.progress > 60 && <span className="font-body text-[8px] text-primary">✓ Validated</span>}
          </div>
        </motion.div>
      ))}
      {step >= 5 && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 rounded-xl p-2 border border-primary/10">
          <div className="flex items-center gap-1.5">
            <Sparkles size={9} className="text-primary" />
            <span className="text-[8px] font-body text-primary">AI recommends: Add "Data Viz" to unlock Product Designer paths</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/* ─── 5. AI Roadmap ─── */
const RoadmapMock = () => {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setActiveStep(s => (s + 1) % 6), 1500); return () => clearInterval(t); }, []);

  const steps = [
    { label: "Explore Interests", phase: "Discovery", icon: Compass },
    { label: "Build Core Skills", phase: "Learning", icon: BookOpen },
    { label: "Start Portfolio", phase: "Practice", icon: Target },
    { label: "Join Communities", phase: "Connection", icon: Users },
    { label: "Apply to Roles", phase: "Opportunity", icon: Briefcase },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="font-display text-xs text-foreground">Your Roadmap</p>
        <AIBadge label="AI Generated" />
      </div>
      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
        <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${Math.min(activeStep, 5) * 20}%` }} transition={{ duration: 0.5 }} />
      </div>
      {activeStep === 0 && <AIAnalyzing label="Building roadmap from your SelfGraph + skills..." />}
      {steps.map((s, i) => {
        const completed = i < activeStep;
        const active = i === activeStep;
        return (
          <motion.div key={s.label} animate={{ opacity: completed || active ? 1 : 0.4 }} className={`flex items-center gap-3 p-2 rounded-xl transition-all ${active ? "bg-primary/5 border border-primary/20" : completed ? "bg-muted/30" : ""}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${completed ? "bg-primary text-primary-foreground" : active ? "bg-primary/10 text-primary ring-2 ring-primary/20" : "bg-muted text-muted-foreground"}`}>
              {completed ? <Check size={12} /> : <s.icon size={12} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-body text-[10px] font-medium ${active ? "text-primary" : "text-foreground"}`}>{s.label}</p>
              <p className="font-body text-[8px] text-muted-foreground">{s.phase}</p>
            </div>
            {active && (
              <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <ChevronRight size={12} className="text-primary" />
              </motion.div>
            )}
          </motion.div>
        );
      })}
      {activeStep >= 5 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-primary/5 rounded-xl p-2 text-center border border-primary/20">
          <Award size={14} className="mx-auto text-primary mb-1" />
          <p className="font-body text-[9px] text-primary font-medium">Roadmap auto-adjusts as you grow 🎉</p>
        </motion.div>
      )}
    </div>
  );
};

/* ─── 6. Job Matching ─── */
const JobMatchingMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 4), 2500); return () => clearInterval(t); }, []);

  const jobs = [
    { title: "UX Designer", company: "Flipkart", match: 94, tags: ["Remote", "Full-time"], salary: "₹12-18L" },
    { title: "Product Analyst", company: "Razorpay", match: 87, tags: ["Hybrid", "Internship"], salary: "₹6-10L" },
    { title: "Frontend Dev", company: "CRED", match: 82, tags: ["Onsite", "Full-time"], salary: "₹15-22L" },
  ];

  return (
    <div className="space-y-2">
      {/* Filters */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex gap-1">
          {["All", "Tech", "Design"].map((f, i) => (
            <span key={f} className={`font-body text-[9px] px-2 py-0.5 rounded-full ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{f}</span>
          ))}
        </div>
        <AIBadge label="Matched to you" />
      </div>
      {step === 0 && <AIAnalyzing label="Scoring jobs against your profile..." />}
      {/* AI match banner */}
      {step >= 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 rounded-xl p-2 border border-primary/10 flex items-center gap-2">
          <Sparkles size={10} className="text-primary shrink-0" />
          <span className="font-body text-[9px] text-primary">3 personalized matches from your SelfGraph + SkillStack</span>
        </motion.div>
      )}
      {/* Job cards */}
      {jobs.map((job, i) => (
        <motion.div key={job.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: step >= 1 ? 1 : 0.2, y: step >= 1 ? 0 : 8 }} transition={{ delay: i * 0.15 }} className="bg-card rounded-xl p-3 border border-border">
          <div className="flex items-start justify-between mb-1.5">
            <div>
              <p className="font-body text-[10px] font-medium text-foreground">{job.title}</p>
              <p className="font-body text-[9px] text-muted-foreground">{job.company}</p>
            </div>
            <motion.div animate={{ scale: step >= 2 && i === 0 ? [1, 1.15, 1] : 1 }} className="flex items-center gap-1 bg-primary/10 rounded-full px-1.5 py-0.5">
              <Star size={8} className="text-primary fill-primary" />
              <span className="font-body text-[9px] text-primary font-semibold">{job.match}%</span>
            </motion.div>
          </div>
          <div className="flex gap-1 flex-wrap">
            {job.tags.map(t => (
              <span key={t} className="font-body text-[8px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{t}</span>
            ))}
            <span className="font-body text-[8px] bg-accent/10 text-accent-foreground px-1.5 py-0.5 rounded-full">{job.salary}</span>
          </div>
          {step >= 3 && i === 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-1.5 pt-1.5 border-t border-border">
              <p className="text-[8px] font-body text-muted-foreground flex items-center gap-1">
                <Brain size={7} className="text-primary" /> AI: 94% match because your creativity, UI skills, and empathy align perfectly
              </p>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

/* ─── 7. Transition Planner ─── */
const TransitionMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 5), 2200); return () => clearInterval(t); }, []);

  const paths = [
    { title: "Pivot within field", risk: "Low", time: "3-6 mo", match: 88 },
    { title: "Domain switch", risk: "Medium", time: "6-12 mo", match: 72 },
    { title: "Side hustle first", risk: "Low", time: "2-4 mo", match: 65 },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="font-display text-xs text-foreground">Transition Readiness</p>
        <AIBadge label="Auto-assessed" />
      </div>
      {step === 0 && <AIAnalyzing label="Evaluating your readiness signals..." />}
      {/* Readiness gauge */}
      <div className="flex justify-center gap-3 mb-1">
        {[
          { label: "Time", val: step >= 1 ? 72 : 0 },
          { label: "Financial", val: step >= 1 ? 58 : 0 },
          { label: "Emotional", val: step >= 1 ? 65 : 0 },
        ].map(g => (
          <div key={g.label} className="text-center">
            <div className="relative w-11 h-11">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                <motion.circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeDasharray={`${g.val * 0.94} 100`} strokeLinecap="round" initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: `${g.val * 0.94} 100` }} transition={{ duration: 1 }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-body text-[9px] font-medium text-foreground">{step >= 1 ? g.val : "—"}</span>
            </div>
            <p className="font-body text-[8px] text-muted-foreground mt-0.5">{g.label}</p>
          </div>
        ))}
      </div>

      {step >= 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-primary/5 rounded-xl p-2 text-center border border-primary/10">
          <p className="font-body text-[9px] text-primary">AI recommends a <strong>low-risk transition</strong> based on your profile</p>
        </motion.div>
      )}

      {step >= 2 && (
        <>
          <p className="font-display text-[10px] text-foreground mt-1">AI-Generated Parallel Paths</p>
          {paths.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center justify-between bg-card rounded-xl p-2 border border-border">
              <div>
                <p className="font-body text-[10px] font-medium text-foreground">{p.title}</p>
                <div className="flex gap-2 mt-0.5">
                  <span className="font-body text-[8px] text-muted-foreground">{p.time}</span>
                  <span className={`font-body text-[8px] ${p.risk === "Low" ? "text-primary" : "text-accent-foreground"}`}>{p.risk} risk</span>
                </div>
              </div>
              <span className="font-body text-[10px] font-semibold text-primary">{p.match}%</span>
            </motion.div>
          ))}
        </>
      )}
      {step >= 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 justify-center">
          <RefreshCw size={8} className="text-primary" />
          <span className="text-[8px] font-body text-primary">Paths auto-update as your skills evolve</span>
        </motion.div>
      )}
    </div>
  );
};

/* ─── 8. Startup Lab ─── */
const StartupLabMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 5), 2000); return () => clearInterval(t); }, []);

  const stages = [
    { label: "Idea", emoji: "💡", done: true },
    { label: "Validate", emoji: "🔬", done: step >= 1 },
    { label: "Build MVP", emoji: "🛠️", done: step >= 2 },
    { label: "Test", emoji: "📊", done: step >= 3 },
    { label: "Launch", emoji: "🚀", done: step >= 4 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="font-display text-xs text-foreground">EduTech Startup</p>
        <AIBadge label="AI Guided" />
      </div>
      {/* Stage tracker */}
      <div className="flex items-center justify-between mb-2">
        {stages.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center relative">
            <motion.div animate={{ scale: s.done ? 1 : 0.8, opacity: s.done ? 1 : 0.4 }} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${s.done ? "bg-primary/10" : "bg-muted"}`}>
              {s.emoji}
            </motion.div>
            <span className="font-body text-[7px] text-muted-foreground mt-1">{s.label}</span>
            {i < stages.length - 1 && <div className={`absolute top-4 left-8 w-6 h-[2px] ${s.done ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {/* Validation sprint */}
      <div className="bg-card rounded-xl p-2.5 border border-border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-body text-[10px] font-medium text-foreground">Sprint: Customer Interviews</span>
          <span className="font-body text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Auto-tracking</span>
        </div>
        <p className="font-body text-[9px] text-muted-foreground mb-2">Hypothesis: Students need async mentoring</p>
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${Math.min(step + 1, 4) * 25}%` }} transition={{ duration: 0.5 }} />
        </div>
        <p className="font-body text-[8px] text-muted-foreground mt-1">{Math.min(step + 1, 4)}/4 interviews done</p>
      </div>

      {/* Milestones */}
      <div className="space-y-1.5">
        {["Define target segment", "Build landing page", "Run ads test", "Analyze signups"].map((m, i) => (
          <div key={m} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {i <= step ? <Check size={8} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
            </div>
            <span className={`font-body text-[9px] ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{m}</span>
          </div>
        ))}
      </div>

      {step >= 3 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 rounded-xl p-2 border border-primary/10">
          <div className="flex items-center gap-1.5">
            <Sparkles size={10} className="text-primary" />
            <span className="font-body text-[9px] text-primary font-medium">AI: Founder Readiness 72% — Next: validate pricing model</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

/* ─── Main Section ─── */
const walkthroughs = [
  { id: "selfgraph", label: "SelfGraph™", icon: Brain, description: "Dynamic identity mapping", component: SelfGraphMock },
  { id: "compass", label: "Curiosity Compass", icon: Compass, description: "Interest exploration", component: CuriosityCompassMock },
  { id: "therapist", label: "AI Therapist", icon: Heart, description: "Emotional career support", component: TherapistMock },
  { id: "skills", label: "SkillStacker", icon: Layers, description: "Skill progression engine", component: SkillStackerMock },
  { id: "roadmap", label: "AI Roadmap", icon: Map, description: "Structured career path", component: RoadmapMock },
  { id: "jobs", label: "Job Matching", icon: Briefcase, description: "AI-powered opportunities", component: JobMatchingMock },
  { id: "transition", label: "Transition Planner", icon: RefreshCw, description: "Safe career switching", component: TransitionMock },
  { id: "startup", label: "Startup Lab", icon: Rocket, description: "Validation & build system", component: StartupLabMock },
];

const AppWalkthroughSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);

  // Auto-cycle every 6s
  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => setActive(a => (a + 1) % walkthroughs.length), 6000);
    return () => clearInterval(t);
  }, [isInView]);

  const ActiveComponent = walkthroughs[active].component;

  return (
    <section ref={ref} className="py-28 md:py-36 bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3"
          >
            Inside The App
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground leading-tight"
          >
            Everything is <em className="text-gradient-warm">personalized, automated</em> & AI-analyzed.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-sm text-muted-foreground mt-4"
          >
            No two users see the same thing. Every feature adapts to your behaviour, tracks your growth, and evolves with you — automatically.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center max-w-6xl mx-auto">
          {/* Feature selector — left */}
          <div className="lg:w-[340px] w-full">
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
                    <motion.div layoutId="walkthrough-indicator" className="w-1 h-6 rounded-full bg-primary ml-auto shrink-0 hidden lg:block" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Phone preview — center */}
          <div className="flex-1 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <PhoneFrame
                  label={walkthroughs[active].label}
                  icon={walkthroughs[active].icon}
                  isActive={true}
                >
                  <ActiveComponent />
                </PhoneFrame>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feature description — right */}
          <div className="lg:w-[280px] w-full text-center lg:text-left">
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
                    "AI automatically maps your cognitive, emotional, and professional traits into a living identity graph that evolves from your behaviour — no manual input needed.",
                    "AI curates career domains based on your SelfGraph traits. Each card is personalized — showing why it matches your unique profile pattern.",
                    "Unlike generic chatbots, this AI reads your SelfGraph data and behaviour history to provide deeply personalized emotional career guidance.",
                    "Skills are auto-tracked from your activities. AI suggests new skills based on your career goals and recommends what to learn next.",
                    "AI generates a phased roadmap by analyzing your SelfGraph, skills, and interests — then auto-adjusts milestones as you progress.",
                    "Every job is AI-scored against your complete profile — skills, interests, energy patterns, and personality traits. Not just keywords.",
                    "AI assesses your readiness across emotional, financial, and time dimensions, then auto-generates personalized transition paths.",
                    "AI guides your startup journey with automated validation tracking, founder readiness scoring, and personalized milestone recommendations.",
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

export default AppWalkthroughSection;
