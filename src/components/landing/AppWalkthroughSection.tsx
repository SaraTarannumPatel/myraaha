import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Brain, Compass, Heart, Layers, Map, Briefcase, RefreshCw, Rocket,
  Send, Sparkles, Target, TrendingUp, Check, Play, Star,
  BookOpen, Users, Zap, ChevronRight, MessageCircle, Shield,
  BarChart3, Filter, Clock, Award, Lightbulb, Eye, FileText,
  ArrowRight, Download, Wind, CheckCircle2,
} from "lucide-react";

/* ─── Shared ─── */
const AIBadge = ({ label = "AI Personalized" }: { label?: string }) => (
  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
    <Sparkles size={7} className="text-primary" />
    <span className="text-[7px] font-body text-primary font-semibold">{label}</span>
  </div>
);

const StepLabel = ({ step, total, label }: { step: number; total: number; label: string }) => (
  <div className="flex items-center justify-between mb-1">
    <span className="text-[8px] font-body text-muted-foreground">{label}</span>
    <span className="text-[7px] font-body text-primary">{step}/{total}</span>
  </div>
);

const ProgressDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex justify-center gap-1 mt-2">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= current ? "bg-primary" : "bg-muted"}`} />
    ))}
  </div>
);

/* ─── Phone Frame ─── */
const PhoneFrame = ({ children, label, icon: Icon }: {
  children: React.ReactNode; label: string; icon: any;
}) => (
  <div className="relative w-[280px] h-[480px] rounded-[2rem] border-[3px] border-foreground/10 bg-card shadow-xl overflow-hidden">
    <div className="flex items-center justify-between px-5 pt-3 pb-1">
      <span className="text-[10px] font-body text-muted-foreground">9:41</span>
      <div className="w-16 h-[3px] rounded-full bg-foreground/10" />
      <div className="flex gap-1"><div className="w-3 h-[6px] rounded-sm bg-foreground/20" /><div className="w-1 h-[6px] rounded-sm bg-foreground/10" /></div>
    </div>
    <div className="px-4 pb-2 flex items-center gap-2 border-b border-border/50">
      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center"><Icon size={12} className="text-primary" /></div>
      <span className="font-display text-xs text-foreground">{label}</span>
      <div className="ml-auto"><AIBadge label="For You" /></div>
    </div>
    <div className="p-3 h-[410px] overflow-hidden">{children}</div>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   1. SelfGraph™ — Full Journey
   Start: Empty state, AI begins scanning
   During: Radar fills, traits scored, patterns found, clarity calculated
   End: Full identity map with AI insight + growth tracking
   ════════════════════════════════════════════════════════════════ */
const SelfGraphMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  const traits = [
    { label: "Creativity", score: 82 }, { label: "Resilience", score: 67 },
    { label: "Leadership", score: 74 }, { label: "Empathy", score: 91 }, { label: "Analytical", score: 58 },
  ];

  return (
    <div className="space-y-2">
      {/* Step 0: Empty state */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-2">
          <Brain size={24} className="mx-auto text-muted-foreground/40" />
          <p className="font-display text-xs text-foreground">Your Identity Map</p>
          <p className="text-[9px] font-body text-muted-foreground">No data yet — start exploring to build your graph</p>
          <div className="w-20 h-1 rounded-full bg-muted mx-auto" />
        </motion.div>
      )}
      {/* Step 1: AI scanning */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 py-4">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles size={10} className="text-primary" /></motion.div>
            <span className="text-[9px] font-body text-primary">Scanning your journals, skills, interests...</span>
          </div>
          {["Journals analyzed", "Skills mapped", "Interests detected"].map((t, i) => (
            <motion.div key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }} className="flex items-center gap-2 text-[9px] font-body text-muted-foreground">
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-2 h-2 rounded-full bg-primary/40" />
              {t}
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Steps 2-3: Radar building */}
      {step >= 2 && step <= 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground text-center">Building Your Radar</p>
          <div className="flex justify-center">
            <div className="relative w-28 h-28">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {[80, 60, 40, 20].map(r => (<circle key={r} cx="50" cy="50" r={r/2} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />))}
                <motion.polygon
                  animate={{ opacity: 1 }}
                  points={traits.map((t, i) => {
                    const angle = (i * 2 * Math.PI) / traits.length - Math.PI / 2;
                    const r = (t.score / 100) * 38 * (step >= 3 ? 1 : 0.4);
                    return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
                  }).join(" ")}
                  fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth="1"
                  className="transition-all duration-1000"
                />
                {traits.map((t, i) => {
                  const angle = (i * 2 * Math.PI) / traits.length - Math.PI / 2;
                  return (<text key={t.label} x={50 + 44 * Math.cos(angle)} y={50 + 44 * Math.sin(angle)} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground" fontSize="4">{t.label.slice(0, 5)}</text>);
                })}
              </svg>
            </div>
          </div>
        </motion.div>
      )}
      {/* Step 4: Traits scored */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
          <p className="font-display text-xs text-foreground">Traits Identified</p>
          {traits.map((t, i) => (
            <div key={t.label} className="space-y-0.5">
              <div className="flex justify-between"><span className="text-[9px] font-body text-foreground">{t.label}</span><span className="text-[9px] font-body text-primary">{t.score}%</span></div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden"><motion.div className="h-full rounded-full bg-primary" initial={{ width: "0%" }} animate={{ width: `${t.score}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} /></div>
            </div>
          ))}
        </motion.div>
      )}
      {/* Step 5: Patterns + Energy */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Patterns Detected</p>
          {[{ p: "Creative energy peaks in morning", pos: true }, { p: "Drops motivation working alone", pos: false }, { p: "Best work in collaborative settings", pos: true }].map((item, i) => (
            <motion.div key={i} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.15 }} className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/30 border border-border">
              <div className={`w-3 h-3 rounded-full ${item.pos ? "bg-primary/20" : "bg-destructive/20"}`} />
              <span className="text-[8px] font-body text-foreground">{item.p}</span>
            </motion.div>
          ))}
          <div className="flex gap-2 mt-1">
            <div className="flex-1 p-2 rounded-lg bg-primary/5 border border-primary/10 text-center">
              <p className="text-sm font-display text-primary">68%</p>
              <p className="text-[7px] font-body text-muted-foreground">Clarity Score</p>
            </div>
            <div className="flex-1 p-2 rounded-lg bg-accent/5 border border-accent/10 text-center">
              <p className="text-sm font-display text-accent">5</p>
              <p className="text-[7px] font-body text-muted-foreground">Patterns</p>
            </div>
          </div>
        </motion.div>
      )}
      {/* Step 6: AI Insight */}
      {step === 6 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1.5"><Sparkles size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">AI Identity Insight</span></div>
            <p className="text-[8px] font-body text-muted-foreground leading-relaxed">"Your creativity (82%) + empathy (91%) make you ideal for human-centered design roles. Your analytical side is growing — consider data-driven UX."</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/30 border border-border">
            <p className="text-[8px] font-body text-foreground mb-1">Reflection Prompt</p>
            <p className="text-[8px] font-body text-muted-foreground italic">"When did you last feel truly energized at work? What were you doing?"</p>
          </div>
        </motion.div>
      )}
      {/* Step 7: Complete state */}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Brain size={18} className="mx-auto text-primary mb-1" />
            <p className="font-display text-sm text-foreground">SelfGraph™ Active</p>
            <p className="text-[8px] font-body text-muted-foreground">5 traits · 3 patterns · 68% clarity</p>
          </div>
          <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <TrendingUp size={10} className="text-primary" />
            <span className="text-[8px] font-body text-primary">+12% growth this week · Auto-tracked from 14 actions</span>
          </motion.div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
            <Eye size={10} className="text-muted-foreground" />
            <span className="text-[8px] font-body text-muted-foreground">Weekly digest sent · Shared with mentor</span>
          </div>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   2. Curiosity Compass — Full Journey
   Start: Mood check → choose mode
   During: Explore cards → like/skip → quest → answer prompts
   End: AI domain recommendations + interests mapped
   ════════════════════════════════════════════════════════════════ */
const CuriosityCompassMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="space-y-2">
      {/* Step 0: Mood check */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 py-2">
          <p className="font-display text-xs text-foreground text-center">How are you feeling?</p>
          <p className="text-[8px] font-body text-muted-foreground text-center">This personalizes your exploration</p>
          <div className="flex justify-center gap-3">
            {[{ e: "⚡", l: "Excited" }, { e: "💡", l: "Curious" }, { e: "❓", l: "Unsure" }, { e: "😐", l: "Bored" }].map((m, i) => (
              <motion.div key={m.l} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${i === 1 ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                <span className="text-lg">{m.e}</span>
                <span className="text-[7px] font-body text-muted-foreground">{m.l}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Step 1: Choose mode */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 py-1">
          <p className="font-display text-xs text-foreground">Choose Exploration Mode</p>
          {[{ i: MessageCircle, t: "Story Mode", d: "Guided scenarios" }, { i: Target, t: "Challenge Mode", d: "Quick prompts" }, { i: Eye, t: "Visual Mode", d: "Pick what resonates" }].map((m, idx) => (
            <motion.div key={m.t} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-3 p-2.5 rounded-xl border ${idx === 0 ? "border-primary/30 bg-primary/5" : "border-border"}`}>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><m.i size={12} className="text-primary" /></div>
              <div><p className="text-[10px] font-display text-foreground">{m.t}</p><p className="text-[7px] font-body text-muted-foreground">{m.d}</p></div>
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Steps 2-3: Swipe cards */}
      {(step === 2 || step === 3) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center justify-between"><span className="text-[9px] font-body text-primary">Story Mode</span><AIBadge label="AI Curated" /></div>
          <div className="relative h-36 flex items-center justify-center">
            {[{ e: "🎨", t: "UX Design", tag: "Creative" }, { e: "📊", t: "Data Science", tag: "Analytical" }].map((c, i) => (
              <motion.div key={c.t} animate={{ scale: i === 0 ? 1 : 0.92, y: i * 10, zIndex: 2 - i, x: step === 3 && i === 0 ? -100 : 0, rotate: step === 3 && i === 0 ? -10 : 0, opacity: step === 3 && i === 0 ? 0.3 : 1 }}
                transition={{ type: "spring", stiffness: 200 }} className="absolute w-44 bg-card rounded-2xl border border-border p-3 text-center shadow-md">
                <span className="text-2xl block mb-1">{c.e}</span>
                <p className="font-display text-sm text-foreground">{c.t}</p>
                <span className="text-[8px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body">{c.tag}</span>
                {i === 0 && <div className="flex justify-center gap-3 mt-2">
                  <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-xs">✕</div>
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">♥</div>
                </div>}
                {i === 0 && <p className="text-[7px] font-body text-primary mt-1 flex items-center justify-center gap-1"><Sparkles size={6} /> Matches your creativity trait</p>}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Step 4: Quest started */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">🧭</div>
              <div><p className="font-display text-xs text-foreground">Design Thinking Quest</p><p className="text-[7px] font-body text-muted-foreground">3 prompts · 10 pts</p></div>
            </div>
            <p className="text-[9px] font-body text-foreground mb-2">Prompt 1 of 3:</p>
            <p className="text-[9px] font-body text-muted-foreground italic">"Describe a product that frustrated you recently. What would you redesign?"</p>
            <div className="mt-2 bg-muted rounded-lg px-2 py-1.5 text-[9px] font-body text-muted-foreground">Type your response...</div>
          </div>
        </motion.div>
      )}
      {/* Step 5: Quest completed */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
              <Award size={20} className="mx-auto text-primary mb-1" />
            </motion.div>
            <p className="font-display text-sm text-foreground">Quest Completed! +10 pts 🎉</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-2 border border-primary/10">
            <div className="flex items-center gap-1 mb-1"><Sparkles size={8} className="text-primary" /><span className="text-[8px] font-body text-primary font-semibold">AI Feedback</span></div>
            <p className="text-[8px] font-body text-muted-foreground">"Your responses show strong user empathy. Design Thinking is a high-match domain for you."</p>
          </div>
        </motion.div>
      )}
      {/* Step 6: Domain recommendations */}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">AI Domain Recommendations</p>
          {[{ d: "Human-Centered Design", match: 92 }, { d: "Product Management", match: 78 }, { d: "Social Innovation", match: 71 }].map((r, i) => (
            <motion.div key={r.d} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.12 }}
              className="flex items-center justify-between p-2 rounded-lg border border-border bg-card">
              <span className="text-[9px] font-body text-foreground">{r.d}</span>
              <span className="text-[9px] font-display text-primary">{r.match}%</span>
            </motion.div>
          ))}
          <p className="text-[7px] font-body text-muted-foreground text-center">Based on 4 liked cards, 1 quest, and your mood</p>
        </motion.div>
      )}
      {/* Step 7: Complete */}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-2">
          <Compass size={20} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">Compass Calibrated</p>
          <div className="flex justify-center gap-4 text-center">
            <div><p className="text-sm font-display text-primary">4</p><p className="text-[7px] text-muted-foreground">Liked</p></div>
            <div><p className="text-sm font-display text-primary">1</p><p className="text-[7px] text-muted-foreground">Quest</p></div>
            <div><p className="text-sm font-display text-primary">3</p><p className="text-[7px] text-muted-foreground">Domains</p></div>
          </div>
          <p className="text-[8px] font-body text-primary">Interests saved → feeding into your Roadmap & SelfGraph</p>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   3. AI Career Therapist — Full Journey
   Start: Choose emotion starter
   During: Chat exchange → AI reads profile data → tools
   End: Check-in saved → mood trends → coping plan
   ════════════════════════════════════════════════════════════════ */
const TherapistMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Step 0: Emotion starters */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 py-2">
          <p className="text-[9px] font-body text-muted-foreground text-center">What's on your mind?</p>
          <div className="flex flex-wrap gap-1 justify-center">
            {["😰 Anxious about career", "😞 Feeling lost", "😵 Overwhelmed", "🔥 Burning out"].map((e, i) => (
              <motion.div key={e} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 }}
                className={`px-2 py-1 rounded-full text-[8px] font-body ${i === 1 ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"}`}>{e}</motion.div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Steps 1-4: Chat */}
      {step >= 1 && step <= 4 && (
        <div className="flex-1 space-y-2 overflow-hidden p-1">
          {[
            { role: "user", text: "I feel lost and don't know what to do 😞" },
            { role: "ai", text: "I hear you. Looking at your SelfGraph, your energy drops when working in isolation. Your creativity peaks in collaborative settings. Let's explore that..." },
            { role: "user", text: "I think I chose the wrong career" },
            { role: "ai", text: "Your data shows 3x more engagement in creative tasks vs analytical. There's no wrong path — let's redirect that energy toward design roles." },
          ].slice(0, step).map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-2.5 py-1.5 ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                {m.role === "ai" && <div className="flex items-center gap-1 mb-0.5"><Heart size={7} className="text-primary" /><span className="text-[7px] text-primary">AI · Reading your data</span></div>}
                <p className="text-[9px] font-body leading-relaxed">{m.text}</p>
              </div>
            </motion.div>
          ))}
          {step < 4 && <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex gap-1 px-3">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" /><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
          </motion.div>}
        </div>
      )}
      {/* Step 5: AI Tool — Breathing Exercise */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 p-1">
          <div className="p-3 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-2"><Wind size={12} className="text-primary" /><p className="font-display text-xs text-foreground">Breathing Exercise</p></div>
            <div className="flex justify-center">
              <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="text-[9px] font-body text-primary">Breathe</motion.span>
              </motion.div>
            </div>
            <p className="text-[8px] font-body text-muted-foreground text-center mt-2">4s inhale · 4s hold · 6s exhale</p>
          </div>
        </motion.div>
      )}
      {/* Step 6: Check-in */}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 p-1">
          <p className="font-display text-xs text-foreground">Daily Check-in</p>
          <div className="flex justify-center gap-2">
            {[{ i: "☀️", l: "Peaceful" }, { i: "😊", l: "Okay", active: true }, { i: "😟", l: "Anxious" }].map(m => (
              <div key={m.l} className={`flex flex-col items-center gap-1 p-2 rounded-xl border ${m.active ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                <span className="text-base">{m.i}</span><span className="text-[7px] font-body">{m.l}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {[{ l: "Energy", v: 7 }, { l: "Confidence", v: 6 }].map(s => (
              <div key={s.l} className="flex-1 p-2 rounded-lg bg-muted/30 border border-border text-center">
                <p className="text-[7px] font-body text-muted-foreground">{s.l}</p>
                <p className="text-sm font-display text-primary">{s.v}/10</p>
              </div>
            ))}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-primary text-center"><span className="text-[9px] font-body text-primary-foreground">Save Check-in 💙</span></div>
        </motion.div>
      )}
      {/* Step 7: Mood trends */}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 p-1">
          <p className="font-display text-xs text-foreground">Your Mood Journey</p>
          <div className="flex items-end gap-1 h-16 px-2">
            {[4, 5, 3, 6, 7, 7, 8].map((v, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${v * 12}%` }} transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex-1 rounded-t bg-primary/30" style={{ minHeight: 2 }} />
            ))}
          </div>
          <p className="text-[7px] font-body text-muted-foreground text-center">Mon → Sun · Trending upward</p>
          <div className="bg-primary/5 rounded-lg p-2 border border-primary/10">
            <p className="text-[8px] font-body text-primary flex items-center gap-1"><Sparkles size={7} /> AI: Your mood improved 40% after shifting to creative tasks. Keep going!</p>
          </div>
        </motion.div>
      )}
      {/* Input bar */}
      <div className="mt-auto flex gap-2 pt-1">
        <div className="flex-1 bg-muted rounded-xl px-3 py-1.5 text-[9px] font-body text-muted-foreground">Type...</div>
        <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center"><Send size={10} className="text-primary-foreground" /></div>
      </div>
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   4. SkillStacker — Full Journey
   Start: No stack → generate
   During: Skills categorized → accept/start → checkpoint → apply tasks
   End: Validated skills + AI fit analysis
   ════════════════════════════════════════════════════════════════ */
const SkillStackerMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  const skills = [
    { name: "JavaScript", cat: "Core", icon: Shield }, { name: "React", cat: "Core", icon: Shield },
    { name: "UI Design", cat: "Supporting", icon: Layers }, { name: "Data Viz", cat: "Explore", icon: Eye },
  ];

  return (
    <div className="space-y-2">
      {/* Step 0: Empty */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-2">
          <Layers size={24} className="mx-auto text-muted-foreground/40" />
          <p className="font-display text-xs text-foreground">No Skill Stack Yet</p>
          <p className="text-[8px] font-body text-muted-foreground">Generate one based on your interests & goals</p>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[9px] font-body"><Sparkles size={10} /> Generate My Stack</div>
        </motion.div>
      )}
      {/* Step 1: Generating */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 space-y-3">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles size={10} className="text-primary" /></motion.div>
            <span className="text-[9px] font-body text-primary">Analyzing interests, goals, career stage...</span>
          </div>
          {["Reading your SelfGraph traits", "Matching skills to career paths", "Categorizing by importance"].map((t, i) => (
            <motion.div key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.3 }} className="flex items-center gap-2 text-[8px] font-body text-muted-foreground">
              <Check size={8} className="text-primary" /> {t}
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Step 2: Skills appear */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
          <StepLabel step={4} total={4} label="Your Skill Stack" />
          {skills.map((s, i) => (
            <motion.div key={s.name} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card">
              <s.icon size={10} className="text-primary" />
              <span className="text-[9px] font-body text-foreground flex-1">{s.name}</span>
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-body ${s.cat === "Core" ? "bg-primary/10 text-primary" : s.cat === "Explore" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>{s.cat}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Step 3: Accept + progress */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center justify-between"><span className="text-[9px] font-body text-foreground">Stack Progress</span><span className="text-[9px] font-body text-primary">25%</span></div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden"><motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: "25%" }} transition={{ duration: 1 }} /></div>
          {[{ n: "JavaScript", s: "In Progress", p: 78 }, { n: "React", s: "Accepted", p: 0 }].map((sk, i) => (
            <div key={sk.n} className="flex items-center gap-2 p-2 rounded-lg border border-border">
              <div className="flex-1"><p className="text-[9px] font-body text-foreground">{sk.n}</p><p className="text-[7px] font-body text-muted-foreground">{sk.s}</p></div>
              {sk.p > 0 && <div className="w-16 h-1 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${sk.p}%` }} /></div>}
              <span className="text-[8px] font-body text-primary">{sk.p > 0 ? `${sk.p}%` : "Start →"}</span>
            </div>
          ))}
        </motion.div>
      )}
      {/* Step 4: Checkpoint */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Skill Checkpoint: JavaScript</p>
          <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5">
            <p className="text-[8px] font-body text-foreground mb-1">How confident do you feel?</p>
            <div className="flex gap-1">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <div key={n} className={`w-4 h-4 rounded text-[7px] flex items-center justify-center font-body ${n <= 7 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{n}</div>
              ))}
            </div>
            <p className="text-[8px] font-body text-foreground mt-2 mb-1">Energy level after practicing?</p>
            <div className="flex gap-2">{["😊 Energized", "😐 Neutral", "😴 Drained"].map((e, i) => (
              <span key={e} className={`text-[7px] px-2 py-0.5 rounded-full font-body ${i === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{e}</span>
            ))}</div>
          </div>
        </motion.div>
      )}
      {/* Step 5: Application tasks */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Apply: JavaScript</p>
          {[{ t: "Build a todo app", type: "practice", done: true }, { t: "Contribute to open source", type: "real-world", done: false }, { t: "Teach a concept to someone", type: "teaching", done: false }].map((task, i) => (
            <motion.div key={task.t} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 p-2 rounded-lg border border-border">
              <div className={`w-4 h-4 rounded flex items-center justify-center ${task.done ? "bg-primary" : "border border-border"}`}>
                {task.done && <Check size={8} className="text-primary-foreground" />}
              </div>
              <span className={`text-[9px] font-body flex-1 ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.t}</span>
              <span className="text-[7px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body">{task.type}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Step 6: Validated */}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
            <CheckCircle2 size={18} className="mx-auto text-primary mb-1" />
            <p className="font-display text-sm text-foreground">JavaScript Validated! ✓</p>
            <p className="text-[8px] font-body text-muted-foreground">Confidence: 8/10 · Energy: Positive</p>
          </div>
          <div className="flex items-center justify-between"><span className="text-[9px] font-body text-foreground">Stack Progress</span><span className="text-[9px] font-body text-primary">50%</span></div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: "50%" }} /></div>
        </motion.div>
      )}
      {/* Step 7: AI Fit analysis */}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1.5"><Sparkles size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">AI Skill-Fit Analysis</span></div>
            <p className="text-[8px] font-body text-muted-foreground">"Your JS + React make you 87% ready for Frontend Dev roles. Add Data Viz to unlock Product Designer paths."</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 p-2 rounded-lg bg-muted/30 text-center"><p className="text-sm font-display text-primary">87%</p><p className="text-[6px] text-muted-foreground">Frontend Dev</p></div>
            <div className="flex-1 p-2 rounded-lg bg-muted/30 text-center"><p className="text-sm font-display text-accent">72%</p><p className="text-[6px] text-muted-foreground">Product Design</p></div>
          </div>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   5. AI Roadmap — Full Journey
   Start: Set goals → AI generates
   During: Phase navigation → complete steps → AI suggestions
   End: Progress tracked → AI adjusts roadmap
   ════════════════════════════════════════════════════════════════ */
const RoadmapMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  const phases = [
    { label: "Explore", icon: Compass, color: "bg-blue-500" },
    { label: "Learn", icon: BookOpen, color: "bg-emerald-500" },
    { label: "Practice", icon: Target, color: "bg-amber-500" },
    { label: "Connect", icon: Users, color: "bg-purple-500" },
    { label: "Apply", icon: Briefcase, color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-2">
      {/* Step 0: Set goals */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 py-2">
          <p className="font-display text-xs text-foreground">Set Your Goals</p>
          <div className="p-2 rounded-lg border border-border bg-muted/30"><p className="text-[8px] font-body text-foreground">Short-term: Land a UX internship</p></div>
          <div className="p-2 rounded-lg border border-border bg-muted/30"><p className="text-[8px] font-body text-foreground">Long-term: Become a Product Designer</p></div>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[9px] font-body"><Sparkles size={10} /> Generate AI Roadmap</div>
        </motion.div>
      )}
      {/* Step 1: Generating */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 space-y-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles size={10} className="text-primary" /></motion.div>
            <span className="text-[9px] font-body text-primary">Building roadmap from goals + SelfGraph + skills...</span>
          </div>
        </motion.div>
      )}
      {/* Step 2: Phases appear */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Your Journey Phases</p>
          <div className="flex items-center justify-between">
            {phases.map((p, i) => (
              <motion.div key={p.label} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${i === 0 ? p.color : "bg-muted"} flex items-center justify-center`}><p.icon size={12} className={i === 0 ? "text-white" : "text-muted-foreground"} /></div>
                <span className="text-[7px] font-body text-muted-foreground mt-1">{p.label}</span>
              </motion.div>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-muted"><div className="h-full w-[10%] bg-primary rounded-full" /></div>
        </motion.div>
      )}
      {/* Steps 3-4: Complete steps */}
      {(step === 3 || step === 4) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
          <p className="font-display text-xs text-foreground">Phase: Exploration</p>
          {[{ t: "Research UX Design field", done: true }, { t: "Take intro course", done: step >= 4 }, { t: "Interview a UX designer", done: false }, { t: "Build first wireframe", done: false }].map((s, i) => (
            <motion.div key={s.t} animate={{ opacity: 1 }} className="flex items-center gap-2 p-1.5 rounded-lg">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${s.done ? "bg-primary text-primary-foreground" : "border border-border bg-muted"}`}>
                {s.done ? <Check size={10} /> : <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
              </div>
              <span className={`text-[9px] font-body ${s.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{s.t}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Step 5: AI suggestions */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1"><Brain size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">AI Next Steps</span></div>
            <p className="text-[8px] font-body text-muted-foreground">"You completed 2 exploration steps ahead of schedule. I recommend starting the Learning phase early — here's a personalized course list."</p>
          </div>
          {["UX Fundamentals (4 hrs)", "Design Thinking Workshop"].map((c, i) => (
            <div key={c} className="flex items-center gap-2 p-2 rounded-lg border border-border">
              <BookOpen size={10} className="text-primary" /><span className="text-[9px] font-body text-foreground">{c}</span>
            </div>
          ))}
        </motion.div>
      )}
      {/* Step 6: Progress */}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center justify-between"><span className="text-[9px] font-body text-foreground">Overall Progress</span><span className="text-[9px] font-body text-primary">35%</span></div>
          <div className="h-2 rounded-full bg-muted"><motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: "35%" }} transition={{ duration: 1 }} /></div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-1.5 rounded-lg bg-muted/30"><p className="text-sm font-display text-primary">4</p><p className="text-[6px] text-muted-foreground">Done</p></div>
            <div className="p-1.5 rounded-lg bg-muted/30"><p className="text-sm font-display text-accent">2</p><p className="text-[6px] text-muted-foreground">Active</p></div>
            <div className="p-1.5 rounded-lg bg-muted/30"><p className="text-sm font-display text-foreground">8</p><p className="text-[6px] text-muted-foreground">Left</p></div>
          </div>
        </motion.div>
      )}
      {/* Step 7: Auto-adjust */}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-2">
          <Map size={20} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">Roadmap Active & Adapting</p>
          <p className="text-[8px] font-body text-muted-foreground">AI adjusted 3 steps based on your pace & skill growth</p>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
            <TrendingUp size={8} className="text-primary" /><span className="text-[8px] font-body text-primary">Roadmap evolves with you</span>
          </motion.div>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   6. Job Matching — Full Journey
   Start: Browse opportunities → AI smart match
   During: View details → AI prep guide → apply
   End: Application tracked → reflection → nudges
   ════════════════════════════════════════════════════════════════ */
const JobMatchingMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="space-y-2">
      {/* Step 0: Browse */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex gap-1">{["All", "Tech", "Design", "Data"].map((f, i) => (
            <span key={f} className={`text-[8px] px-2 py-0.5 rounded-full font-body ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{f}</span>
          ))}</div>
          {[{ t: "UX Designer", c: "Flipkart" }, { t: "Product Analyst", c: "Razorpay" }, { t: "Frontend Dev", c: "CRED" }].map((j, i) => (
            <div key={j.t} className="flex items-center justify-between p-2 rounded-lg border border-border">
              <div><p className="text-[9px] font-body text-foreground">{j.t}</p><p className="text-[7px] text-muted-foreground">{j.c}</p></div>
              <span className="text-[8px] text-muted-foreground">View →</span>
            </div>
          ))}
        </motion.div>
      )}
      {/* Step 1: AI matching */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 py-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles size={10} className="text-primary" /></motion.div>
            <span className="text-[9px] font-body text-primary">Matching jobs to your SelfGraph + SkillStack...</span>
          </div>
        </motion.div>
      )}
      {/* Step 2: Matched results */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-lg p-2 border border-primary/10 flex items-center gap-2">
            <Sparkles size={10} className="text-primary" /><span className="text-[8px] font-body text-primary">3 personalized matches found</span>
          </div>
          {[{ t: "UX Designer", c: "Flipkart", m: 94 }, { t: "Product Analyst", c: "Razorpay", m: 87 }, { t: "Frontend Dev", c: "CRED", m: 82 }].map((j, i) => (
            <motion.div key={j.t} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg border border-border">
              <div><p className="text-[9px] font-body text-foreground">{j.t}</p><p className="text-[7px] text-muted-foreground">{j.c}</p></div>
              <div className="flex items-center gap-1 bg-primary/10 rounded-full px-1.5 py-0.5"><Star size={7} className="text-primary fill-primary" /><span className="text-[9px] font-body text-primary font-semibold">{j.m}%</span></div>
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Step 3: Job detail */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">UX Designer · Flipkart</p>
          <div className="flex gap-1 flex-wrap">
            {["Remote", "Full-time", "₹12-18L"].map(t => (<span key={t} className="text-[7px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-body">{t}</span>))}
          </div>
          <p className="text-[8px] font-body text-muted-foreground">Design user experiences for India's largest e-commerce platform...</p>
          <div className="flex flex-wrap gap-1">{["Figma", "User Research", "Prototyping"].map(s => (<span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-body">{s}</span>))}</div>
          <p className="text-[7px] font-body text-primary flex items-center gap-1"><Brain size={7} /> 94% match — your creativity + empathy + UI skills align perfectly</p>
        </motion.div>
      )}
      {/* Step 4: AI Prep */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/10">
            <p className="font-display text-xs text-foreground mb-1.5">✨ AI Prep Guide</p>
            {["Update portfolio with recent UI work", "Highlight empathy in cover letter", "Prepare case study on redesign"].map((t, i) => (
              <div key={t} className="flex items-center gap-1.5 mb-1"><CheckCircle2 size={8} className="text-primary" /><span className="text-[8px] font-body text-foreground">{t}</span></div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Step 5: Apply */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="p-2 rounded-lg bg-muted/30 border border-border"><p className="text-[8px] font-body text-muted-foreground italic">Cover note: "As a designer passionate about user empathy..."</p></div>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="px-3 py-2 rounded-lg bg-primary text-center"><span className="text-[9px] font-body text-primary-foreground">🚀 Apply Now</span></motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center p-2 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[9px] font-body text-primary">✓ Application submitted!</p>
          </motion.div>
        </motion.div>
      )}
      {/* Step 6: Track */}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">My Applications</p>
          {[{ t: "UX Designer · Flipkart", s: "Applied", c: "text-primary" }, { t: "Product Analyst · Razorpay", s: "Saved", c: "text-muted-foreground" }].map(a => (
            <div key={a.t} className="flex items-center justify-between p-2 rounded-lg border border-border">
              <span className="text-[9px] font-body text-foreground">{a.t}</span>
              <span className={`text-[8px] font-body ${a.c}`}>{a.s}</span>
            </div>
          ))}
        </motion.div>
      )}
      {/* Step 7: Nudge */}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-2">
          <Briefcase size={20} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">1 Active Application</p>
          <div className="bg-primary/5 rounded-lg p-2 border border-primary/10">
            <p className="text-[8px] font-body text-primary flex items-center justify-center gap-1"><Sparkles size={7} /> AI Nudge: "Follow up in 5 days. Prepare for a portfolio review."</p>
          </div>
          <p className="text-[7px] font-body text-muted-foreground">Reflection saved · Application tracker auto-updating</p>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   7. Transition Planner — Full Journey
   Start: Reality mapping → answer pain questions
   During: Timeline → readiness → parallel paths → skill bridge
   End: Transition roadmap generated + emotional support
   ════════════════════════════════════════════════════════════════ */
const TransitionMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="space-y-2">
      {/* Step 0: Reality mapping */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Reality Mapping</p>
          <p className="text-[8px] font-body text-muted-foreground">No tests. Just honest reflection.</p>
          <div className="p-2 rounded-lg border border-border"><p className="text-[8px] font-body text-foreground mb-1">What feels off right now?</p><div className="h-6 bg-muted/30 rounded text-[8px] px-2 py-1 font-body text-muted-foreground">My work doesn't excite me anymore...</div></div>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[9px] font-body"><Sparkles size={10} /> Map My Reality</div>
        </motion.div>
      )}
      {/* Step 1: AI reality map */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Your Reality Map ✨</p>
          {[{ area: "Engagement", obs: "Low energy in routine tasks" }, { area: "Creativity", obs: "High when working on side projects" }].map((p, i) => (
            <motion.div key={p.area} initial={{ x: -5, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}
              className="p-2 rounded-lg bg-muted/30 border border-border">
              <p className="text-[9px] font-body text-foreground font-medium">{p.area}</p>
              <p className="text-[8px] font-body text-muted-foreground">{p.obs}</p>
            </motion.div>
          ))}
          <div className="flex gap-1 flex-wrap">{["drift", "misalignment", "creative hunger"].map(s => (<span key={s} className="text-[7px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-body">{s}</span>))}</div>
        </motion.div>
      )}
      {/* Step 2: Readiness */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Readiness Check</p>
          <div className="flex justify-center gap-3">
            {[{ l: "Time", v: 72 }, { l: "Financial", v: 58 }, { l: "Emotional", v: 65 }].map(g => (
              <div key={g.l} className="text-center">
                <div className="relative w-11 h-11">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
                    <motion.circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeDasharray={`${g.v * 0.94} 100`} strokeLinecap="round" initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: `${g.v * 0.94} 100` }} transition={{ duration: 1 }} />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-body text-foreground">{g.v}</span>
                </div>
                <p className="text-[7px] font-body text-muted-foreground mt-0.5">{g.l}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {/* Step 3: Parallel paths */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">AI Parallel Paths</p>
          {[{ t: "Pivot within field", risk: "Low", time: "3-6 mo", m: 88 }, { t: "Domain switch", risk: "Med", time: "6-12 mo", m: 72 }, { t: "Side hustle first", risk: "Low", time: "2-4 mo", m: 65 }].map((p, i) => (
            <motion.div key={p.t} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`flex items-center justify-between p-2 rounded-lg border ${i === 0 ? "border-primary/30 bg-primary/5" : "border-border"}`}>
              <div><p className="text-[9px] font-body text-foreground">{p.t}</p><p className="text-[7px] text-muted-foreground">{p.time} · {p.risk} risk</p></div>
              <span className="text-[10px] font-display text-primary">{p.m}%</span>
            </motion.div>
          ))}
        </motion.div>
      )}
      {/* Step 4: Skill bridge */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Skill Bridge</p>
          <div className="flex items-center gap-2 text-center">
            <div className="flex-1 p-2 rounded-lg bg-primary/5 border border-primary/10"><p className="text-[7px] text-muted-foreground">Current</p><p className="text-[9px] font-body text-foreground">Analytics · Excel</p></div>
            <ArrowRight size={12} className="text-primary" />
            <div className="flex-1 p-2 rounded-lg bg-accent/5 border border-accent/10"><p className="text-[7px] text-muted-foreground">Bridge</p><p className="text-[9px] font-body text-foreground">UX Research · Figma</p></div>
          </div>
          <p className="text-[8px] font-body text-primary flex items-center gap-1"><Sparkles size={7} /> 65% of your skills transfer directly</p>
        </motion.div>
      )}
      {/* Step 5: Demand check */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Market Reality Check</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 text-center"><p className="text-sm font-display text-primary">High</p><p className="text-[7px] text-muted-foreground">Demand</p></div>
            <div className="p-2 rounded-lg bg-accent/5 border border-accent/10 text-center"><p className="text-sm font-display text-accent">₹12-20L</p><p className="text-[7px] text-muted-foreground">Salary Range</p></div>
          </div>
          <p className="text-[8px] font-body text-muted-foreground">UX Design demand grew 34% in the last year in India</p>
        </motion.div>
      )}
      {/* Step 6: Transition roadmap */}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1.5">
          <p className="font-display text-xs text-foreground">Transition Roadmap</p>
          {[{ m: "Month 1-2", t: "Build UX portfolio", done: false }, { m: "Month 3-4", t: "Complete UX certification", done: false }, { m: "Month 5-6", t: "Apply to 10 roles", done: false }].map((s, i) => (
            <div key={s.m} className="flex items-center gap-2 p-1.5 rounded-lg border border-border">
              <div className="w-4 h-4 rounded-full border border-primary bg-transparent" /><div><p className="text-[9px] font-body text-foreground">{s.t}</p><p className="text-[7px] text-muted-foreground">{s.m}</p></div>
            </div>
          ))}
        </motion.div>
      )}
      {/* Step 7: Emotional support */}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-2">
          <RefreshCw size={20} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">Transition Plan Active</p>
          <div className="bg-primary/5 rounded-lg p-2 border border-primary/10">
            <p className="text-[8px] font-body text-primary">"You don't have to burn your past to build your future. This plan protects your stability while moving forward."</p>
          </div>
          <p className="text-[7px] font-body text-muted-foreground">Plan auto-updates as skills evolve · Emotional check-ins weekly</p>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   8. Living Resume — Full Journey
   Start: Empty resume → add experiences
   During: Skills auto-populate → AI insights → skill fit → decision mirror
   End: Full resume with career readiness score + export
   ════════════════════════════════════════════════════════════════ */
const LivingResumeMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="space-y-2">
      {/* Step 0: Empty */}
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4 space-y-2">
          <FileText size={24} className="mx-auto text-muted-foreground/40" />
          <p className="font-display text-xs text-foreground">Your Living Resume</p>
          <p className="text-[8px] font-body text-muted-foreground">Evolves from everything you explore, learn & accomplish</p>
          <div className="h-1.5 rounded-full bg-muted w-24 mx-auto"><div className="h-full w-[15%] bg-primary rounded-full" /></div>
          <p className="text-[7px] font-body text-muted-foreground">15% complete</p>
        </motion.div>
      )}
      {/* Step 1: Add experience */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Add Experience</p>
          <div className="p-2 rounded-lg border border-border space-y-1.5">
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-foreground">UX Design Intern</div>
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-foreground">Acme Corp</div>
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-muted-foreground">Conducted user research and built wireframes...</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-primary text-center"><span className="text-[9px] font-body text-primary-foreground">+ Add Experience</span></div>
        </motion.div>
      )}
      {/* Step 2: Profile building */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-display text-primary text-lg">A</div>
            <div><p className="font-display text-xs text-foreground">Arjun Mehta</p><p className="text-[7px] text-muted-foreground">Aspiring Product Designer</p></div>
          </div>
          <div className="flex gap-3 text-center">
            {[{ v: 2, l: "Experiences" }, { v: 5, l: "Skills" }, { v: 1, l: "Projects" }, { v: 3, l: "Badges" }].map(s => (
              <div key={s.l}><p className="text-sm font-display text-foreground">{s.v}</p><p className="text-[6px] text-muted-foreground">{s.l}</p></div>
            ))}
          </div>
          <div className="h-1.5 rounded-full bg-muted"><motion.div className="h-full bg-primary rounded-full" initial={{ width: "15%" }} animate={{ width: "55%" }} transition={{ duration: 1 }} /></div>
          <p className="text-[7px] text-muted-foreground text-center">55% complete · Auto-populating from your activity</p>
        </motion.div>
      )}
      {/* Step 3: AI insights */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1"><Sparkles size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">AI Profile Insights</span></div>
            <p className="text-[8px] font-body text-muted-foreground">"Your resume shows strong design + research skills. Add a case study project to increase visibility to recruiters."</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-muted/30 text-center"><p className="text-sm font-display text-primary">68%</p><p className="text-[6px] text-muted-foreground">Career Ready</p></div>
            <div className="p-2 rounded-lg bg-muted/30 text-center"><p className="text-[8px] font-body text-foreground">Figma, Research</p><p className="text-[6px] text-muted-foreground">Top Strengths</p></div>
          </div>
        </motion.div>
      )}
      {/* Step 4: Skill-Fit analysis */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Skill-Fit Analysis</p>
          {[{ role: "UX Designer", match: 82, eligible: true }, { role: "Product Manager", match: 61, eligible: false }].map((r, i) => (
            <div key={r.role} className="flex items-center justify-between p-2 rounded-lg border border-border">
              <div><p className="text-[9px] font-body text-foreground">{r.role}</p><p className="text-[7px] font-body text-muted-foreground">{r.eligible ? "✓ Eligible" : "Needs 2 more skills"}</p></div>
              <span className={`text-[10px] font-display ${r.eligible ? "text-primary" : "text-muted-foreground"}`}>{r.match}%</span>
            </div>
          ))}
        </motion.div>
      )}
      {/* Step 5: Decision mirror */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Decision Mirror</p>
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[8px] font-body text-muted-foreground leading-relaxed">"Over the past month, you made 8 decisions. 75% moved you toward design roles. Your choices are consistently creative-leaning — keep building there."</p>
          </div>
          <div className="flex gap-1">{["Creative", "User-focused", "Research-driven"].map(t => (<span key={t} className="text-[7px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body">{t}</span>))}</div>
        </motion.div>
      )}
      {/* Step 6: Resume view */}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="p-3 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-2">
              <p className="font-display text-xs text-foreground">Arjun's Living Resume</p>
              <div className="flex gap-1"><Download size={10} className="text-muted-foreground" /></div>
            </div>
            <div className="space-y-1">
              {[{ s: "UX Design Intern · Acme", t: "work" }, { s: "Design Thinking Course", t: "learning" }, { s: "Portfolio Project", t: "project" }].map(e => (
                <div key={e.s} className="flex items-center gap-2 text-[8px] font-body text-foreground"><div className="w-2 h-2 rounded-full bg-primary/40" />{e.s}</div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      {/* Step 7: Complete */}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-2">
          <FileText size={20} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">Resume Always Current</p>
          <p className="text-[8px] font-body text-muted-foreground">Auto-updated from skills, projects & achievements</p>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
            <TrendingUp size={8} className="text-primary" /><span className="text-[8px] font-body text-primary">68% career readiness · Growing daily</span>
          </motion.div>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   Main Section
   ════════════════════════════════════════════════════════════════ */
const walkthroughs = [
  { id: "selfgraph", label: "SelfGraph™", icon: Brain, description: "AI maps your identity from behavior", component: SelfGraphMock },
  { id: "compass", label: "Curiosity Compass", icon: Compass, description: "Explore interests through quests", component: CuriosityCompassMock },
  { id: "therapist", label: "AI Therapist", icon: Heart, description: "Emotional career support", component: TherapistMock },
  { id: "skills", label: "SkillStacker", icon: Layers, description: "AI-powered skill building", component: SkillStackerMock },
  { id: "roadmap", label: "AI Roadmap", icon: Map, description: "5-phase career journey", component: RoadmapMock },
  { id: "jobs", label: "Job Matching", icon: Briefcase, description: "Profile-matched opportunities", component: JobMatchingMock },
  { id: "transition", label: "Transition Planner", icon: RefreshCw, description: "Safe career switching", component: TransitionMock },
  { id: "resume", label: "Living Resume", icon: FileText, description: "Auto-evolving career story", component: LivingResumeMock },
];

const AppWalkthroughSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const t = setInterval(() => setActive(a => (a + 1) % walkthroughs.length), 12000);
    return () => clearInterval(t);
  }, [isInView]);

  const ActiveComponent = walkthroughs[active].component;

  return (
    <section ref={ref} className="py-28 md:py-36 bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">Inside The App</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            Everything is <em className="text-gradient-warm">personalized, automated</em> & AI-analyzed.
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }} className="font-body text-sm text-muted-foreground mt-4">
            Watch each feature's complete journey — from first interaction to AI-powered results. No two users see the same thing.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-center max-w-6xl mx-auto">
          <div className="lg:w-[340px] w-full">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {walkthroughs.map((w, i) => (
                <motion.button key={w.id} initial={{ opacity: 0, x: -16 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.1 + i * 0.04 }}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 border ${active === i ? "bg-card border-primary/20 shadow-soft" : "border-transparent hover:bg-muted/50"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active === i ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><w.icon size={16} /></div>
                  <div className="min-w-0">
                    <p className={`font-display text-sm truncate ${active === i ? "text-primary" : "text-foreground"}`}>{w.label}</p>
                    <p className="font-body text-[10px] text-muted-foreground truncate">{w.description}</p>
                  </div>
                  {active === i && <motion.div layoutId="walkthrough-indicator" className="w-1 h-6 rounded-full bg-primary ml-auto shrink-0 hidden lg:block" />}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.4 }}>
                <PhoneFrame label={walkthroughs[active].label} icon={walkthroughs[active].icon}>
                  <ActiveComponent />
                </PhoneFrame>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppWalkthroughSection;
