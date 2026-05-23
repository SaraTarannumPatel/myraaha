import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Lightbulb, Brain, Rocket, Wrench, Compass, User, Bot, Presentation,
  Heart, Target, Zap, Users, Star, Check, ChevronRight, Send,
  Sparkles, TrendingUp, BarChart3, Shield, BookOpen, Eye,
  ThumbsUp, MessageCircle, Filter, Clock, Award, Globe,
  Briefcase, Layers, FlaskConical, Play, ArrowRight, CheckCircle2,
  Loader2, DollarSign, Handshake,
} from "lucide-react";

/* ─── Shared ─── */
const AIBadge = ({ label = "AI Powered" }: { label?: string }) => (
  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
    <Sparkles size={7} className="text-primary" /><span className="text-[7px] font-body text-primary font-semibold">{label}</span>
  </div>
);

const ProgressDots = ({ current, total }: { current: number; total: number }) => (
  <div className="flex justify-center gap-1 mt-2">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i <= current ? "bg-primary" : "bg-muted"}`} />
    ))}
  </div>
);

/* ─── Browser Frame ─── */
const BrowserFrame = ({ children, url }: { children: React.ReactNode; url: string }) => (
  <div className="relative w-[580px] sm:w-[660px] max-w-full rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-3 bg-muted/60 border-b border-border">
      <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-destructive/40" /><div className="w-3 h-3 rounded-full bg-accent/40" /><div className="w-3 h-3 rounded-full bg-primary/40" /></div>
      <div className="flex-1 mx-3"><div className="bg-background rounded-md px-3.5 py-1.5 text-[11px] font-body text-muted-foreground truncate border border-border/50">myraaha.app/{url}</div></div>
      <AIBadge />
    </div>
    <div className="h-[420px] sm:h-[480px] overflow-hidden bg-background">{children}</div>
  </div>
);

/* ════════════════════════════════════════════════════════════════
   1. Startup Sparks — Full Journey
   Start: Browse idea cards by sector
   During: Like/save → add own idea → AI validates
   End: Problem-solution fit score + quest completed
   ════════════════════════════════════════════════════════════════ */
const StartupSparksMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="p-4 space-y-2.5">
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center justify-between"><p className="font-display text-sm text-foreground">Startup Sparks</p><AIBadge label="Curated for you" /></div>
          <div className="flex gap-1.5">{[{ i: Globe, l: "All" }, { i: Heart, l: "Social" }, { i: Zap, l: "Tech" }].map((s, i) => (
            <div key={s.l} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-body border ${i === 0 ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-muted-foreground"}`}><s.i size={8} />{s.l}</div>
          ))}</div>
          <p className="text-[8px] font-body text-muted-foreground">Swipe through AI-curated startup ideas</p>
        </motion.div>
      )}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {[{ t: "Local Food Waste App", s: "Social Impact", ai: "Matches your social interest" }, { t: "AI Study Matcher", s: "EdTech", ai: "Aligns with tech skills" }].map((c, i) => (
            <motion.div key={c.t} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.12 }} className="p-3 rounded-lg border border-border bg-card">
              <div className="flex justify-between"><div><p className="font-display text-xs text-foreground">{c.t}</p><span className="text-[7px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-body">{c.s}</span></div>
              <div className="flex gap-1"><div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center text-[8px]">✕</div><div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[8px]">♥</div></div></div>
              <p className="text-[7px] font-body text-primary mt-1 flex items-center gap-1"><Sparkles size={6} /> {c.ai}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Add Your Own Idea</p>
          <div className="p-2.5 rounded-lg border border-border space-y-1.5">
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-foreground">EcoTrack — Carbon Footprint App</div>
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-muted-foreground">Students don't track their environmental impact...</div>
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-muted-foreground">Gamified tracking with social challenges...</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-primary text-center"><span className="text-[9px] font-body text-primary-foreground">🚀 Spark This Idea</span></div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 py-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles size={10} className="text-primary" /></motion.div>
            <span className="text-[9px] font-body text-primary">AI validating your idea against market data...</span>
          </div>
          {["Checking problem urgency", "Analyzing target audience", "Scoring solution fit"].map((t, i) => (
            <motion.div key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.3 }} className="flex items-center gap-2 text-[8px] font-body text-muted-foreground"><Check size={8} className="text-primary" /> {t}</motion.div>
          ))}
        </motion.div>
      )}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1.5"><Sparkles size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">AI Validation Result</span></div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-center"><motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xl font-display text-primary">87%</motion.p><p className="text-[7px] text-muted-foreground">Problem-Solution Fit</p></div>
              <div className="flex-1 space-y-1">{[{ l: "Problem urgency", v: 90 }, { l: "Market gap", v: 82 }, { l: "Feasibility", v: 78 }].map(m => (
                <div key={m.l}><div className="flex justify-between text-[7px] font-body"><span className="text-muted-foreground">{m.l}</span><span className="text-primary">{m.v}%</span></div>
                <div className="h-1 rounded-full bg-muted"><motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: `${m.v}%` }} transition={{ duration: 0.6 }} /></div></div>
              ))}</div>
            </div>
          </div>
        </motion.div>
      )}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Problem Spotting</p>
          <div className="p-2 rounded-lg border border-border"><p className="text-[8px] font-body text-foreground">"Students throw away 30% of food in hostel mess..."</p></div>
          <div className="bg-primary/5 rounded-lg p-2 border border-primary/10">
            <p className="text-[8px] font-body text-primary flex items-center gap-1"><Brain size={7} /> AI: High-scale problem · Ties to your EcoTrack idea · 4 similar observations found</p>
          </div>
        </motion.div>
      )}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-1"><Award size={12} className="text-primary" /><p className="font-display text-xs text-foreground">Ideation Quest Complete! +15 pts</p></div>
            <p className="text-[8px] font-body text-muted-foreground">You explored 8 ideas, created 1, validated 1, spotted 2 problems</p>
          </div>
        </motion.div>
      )}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-2">
          <Lightbulb size={18} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">Sparks Engine Active</p>
          <div className="flex justify-center gap-4"><div><p className="text-sm font-display text-primary">8</p><p className="text-[7px] text-muted-foreground">Explored</p></div><div><p className="text-sm font-display text-primary">1</p><p className="text-[7px] text-muted-foreground">Created</p></div><div><p className="text-sm font-display text-primary">87%</p><p className="text-[7px] text-muted-foreground">Best Fit</p></div></div>
          <p className="text-[8px] font-body text-primary">Ideas flowing into Startup Lab & Path Selector</p>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   2. Mindset Builder — Full Journey
   Start: Pick a challenge
   During: Complete it → reflect → AI feedback → habits → streak
   End: Founder Mindset Score calculated
   ════════════════════════════════════════════════════════════════ */
const MindsetBuilderMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="p-4 space-y-2.5">
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center justify-between"><p className="font-display text-sm text-foreground">Mindset Builder</p><AIBadge label="Adapts to you" /></div>
          <p className="text-[8px] font-body text-muted-foreground">Pick a daily founder challenge</p>
          {[{ t: "Face a Fear", d: "Take one step toward an entrepreneurial fear", cat: "resilience" }, { t: "60-Second Pitch", d: "Practice pitching under 60 seconds", cat: "confidence" }].map((c, i) => (
            <motion.div key={c.t} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`p-2.5 rounded-lg border ${i === 0 ? "border-primary/30 bg-primary/5" : "border-border"}`}>
              <p className="font-display text-xs text-foreground">{c.t}</p>
              <p className="text-[8px] font-body text-muted-foreground">{c.d}</p>
              <span className="text-[7px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-body mt-1 inline-block">{c.cat}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Challenge: Face a Fear</p>
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 relative overflow-hidden">
            <motion.div className="absolute top-0 left-0 h-full bg-primary/10" animate={{ width: "60%" }} transition={{ duration: 2 }} />
            <div className="relative z-10">
              <p className="text-[9px] font-body text-foreground">Take one small step toward an entrepreneurial fear today.</p>
              <p className="text-[8px] font-body text-primary mt-1">⏱ In Progress...</p>
            </div>
          </div>
        </motion.div>
      )}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Write Your Reflection</p>
          <div className="p-2.5 rounded-lg border border-border bg-muted/30">
            <p className="text-[8px] font-body text-foreground">"I reached out to a startup founder on LinkedIn. I was nervous but they responded positively and offered a 15-min call..."</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-primary text-center"><span className="text-[9px] font-body text-primary-foreground">✓ Complete Challenge</span></div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}><Award size={18} className="mx-auto text-primary mb-1" /></motion.div>
            <p className="font-display text-sm text-foreground">Challenge Complete! 🎉</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-2 border border-primary/10">
            <div className="flex items-center gap-1 mb-1"><Sparkles size={8} className="text-primary" /><span className="text-[8px] font-body text-primary font-semibold">AI Feedback</span></div>
            <p className="text-[8px] font-body text-muted-foreground">"Great move! Cold outreach builds networking muscle. Your fear tolerance improved. Next: try a warm intro pitch."</p>
          </div>
        </motion.div>
      )}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Your Habits</p>
          {[{ t: "Morning Journaling", streak: 7 }, { t: "Idea Generation", streak: 3 }, { t: "Cold Outreach", streak: 1 }].map((h, i) => (
            <motion.div key={h.t} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 p-2 rounded-lg border border-border">
              <motion.div animate={{ backgroundColor: i === 0 ? "hsl(var(--primary))" : "hsl(var(--muted))" }} className="w-4 h-4 rounded border border-border flex items-center justify-center">
                {i === 0 && <Check size={8} className="text-primary-foreground" />}
              </motion.div>
              <span className="text-[9px] font-body text-foreground flex-1">{h.t}</span>
              <span className="text-[8px] font-body text-primary">🔥 {h.streak}d</span>
            </motion.div>
          ))}
        </motion.div>
      )}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles size={10} className="text-primary" /></motion.div>
            <span className="text-[9px] font-body text-primary">AI suggesting habits based on your growth areas...</span>
          </div>
          {["Resilience journaling (3x/week)", "Pitch practice (daily)"].map((h, i) => (
            <motion.div key={h} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.2 }} className="flex items-center gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5">
              <Sparkles size={8} className="text-primary" /><span className="text-[8px] font-body text-foreground">{h}</span><span className="text-[7px] text-primary ml-auto">+ Add</span>
            </motion.div>
          ))}
        </motion.div>
      )}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Learning Track: Resilience</p>
          {["Understanding failure", "Building mental frameworks", "Daily practices"].map((m, i) => (
            <div key={m} className="flex items-center gap-2 p-1.5 rounded-lg">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${i === 0 ? "bg-primary text-primary-foreground" : "border border-border bg-muted"}`}>
                {i === 0 && <Check size={8} />}
              </div>
              <span className={`text-[9px] font-body ${i === 0 ? "line-through text-muted-foreground" : "text-foreground"}`}>{m}</span>
            </div>
          ))}
        </motion.div>
      )}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-1">
          <p className="text-[9px] font-display text-foreground">Founder Mindset Score</p>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl font-display text-primary">76<span className="text-xs text-muted-foreground">/100</span></motion.p>
          <p className="text-[7px] font-body text-muted-foreground">Auto-calculated from 8 challenges, 3 habits & reflections</p>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
            <TrendingUp size={8} className="text-primary" /><span className="text-[8px] font-body text-primary">+18% this month · Auto-tracked</span>
          </motion.div>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   3. Startup Lab — Full Journey
   Start: Create plan (or AI consolidate)
   During: Validation sprints → milestones → AI feedback
   End: Pitch prep + progress dashboard
   ════════════════════════════════════════════════════════════════ */
const StartupLabMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="p-4 space-y-2.5">
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center justify-between"><p className="font-display text-sm text-foreground">Startup Creation Lab</p><AIBadge label="AI Tracked" /></div>
          <div className="text-center py-4 space-y-2">
            <Rocket size={24} className="mx-auto text-muted-foreground/40" />
            <p className="text-[9px] font-body text-muted-foreground">No plan yet — create one or let AI consolidate from your ideas</p>
            <div className="flex justify-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-primary text-[9px] font-body text-primary-foreground">+ New Plan</div>
              <div className="px-3 py-1.5 rounded-lg border border-primary/30 text-[9px] font-body text-primary">✨ AI Consolidate</div>
            </div>
          </div>
        </motion.div>
      )}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles size={10} className="text-primary" /></motion.div>
            <span className="text-[9px] font-body text-primary">AI consolidating from 3 ideas + 2 observations...</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="p-3 rounded-lg border border-primary/20 bg-primary/5">
            <p className="font-display text-xs text-foreground">EcoTrack — Sustainability App</p>
            <p className="text-[8px] font-body text-muted-foreground mt-1">Vision: Make sustainability measurable for students</p>
            <p className="text-[8px] font-body text-muted-foreground">Problem: Students waste 30% food with no visibility</p>
          </motion.div>
        </motion.div>
      )}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex gap-1 border-b border-border pb-1.5">{["Workspace", "Validation", "Planning"].map((t, i) => (
            <div key={t} className={`px-2.5 py-1 text-[9px] font-body rounded-t ${i === 1 ? "border-b-2 border-primary text-primary font-semibold" : "text-muted-foreground"}`}>{t}</div>
          ))}</div>
          <p className="font-display text-xs text-foreground">Validation Sprint #1</p>
          <div className="p-2.5 rounded-lg border border-border">
            <p className="text-[9px] font-body text-foreground mb-1">Hypothesis: Students will track food waste if gamified</p>
            <p className="text-[8px] font-body text-muted-foreground mb-2">Method: Survey 20 students in hostels</p>
            <div className="w-full bg-muted rounded-full h-1.5"><motion.div className="bg-primary rounded-full h-1.5" initial={{ width: "0%" }} animate={{ width: "45%" }} transition={{ duration: 1 }} /></div>
            <p className="text-[7px] font-body text-muted-foreground mt-1">9/20 responses · 45% complete</p>
          </div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-1"><p className="text-[9px] font-body text-foreground">Sprint #1 Complete</p><span className="text-[8px] text-primary font-body">✓ Validated</span></div>
            <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-primary rounded-full h-1.5 w-full" /></div>
            <p className="text-[7px] font-body text-muted-foreground mt-1">20/20 responses · Conclusion: 85% would use a gamified tracker</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-2 border border-primary/10">
            <p className="text-[8px] font-body text-primary flex items-center gap-1"><Sparkles size={7} /> AI: Strong validation. Recommend moving to MVP phase immediately.</p>
          </div>
        </motion.div>
      )}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Milestones</p>
          {[{ t: "Problem Validated", s: "done" }, { t: "Customer Interviews", s: "done" }, { t: "MVP Prototype", s: "active" }, { t: "Launch Sprint", s: "upcoming" }].map((m, i) => (
            <motion.div key={m.t} initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${m.s === "done" ? "bg-primary text-primary-foreground" : m.s === "active" ? "border-2 border-primary" : "border border-border bg-muted"}`}>
                {m.s === "done" && <Check size={8} />}
              </div>
              <span className={`text-[9px] font-body ${m.s === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{m.t}</span>
              {m.s === "active" && <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[7px] text-primary font-body ml-auto">Current</motion.span>}
            </motion.div>
          ))}
        </motion.div>
      )}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">AI Planning Framework</p>
          <div className="grid grid-cols-2 gap-2">{[{ l: "Revenue Model", v: "Freemium + B2B" }, { l: "Go-to-Market", v: "Campus ambassadors" }, { l: "Customer Segment", v: "College students" }, { l: "Competitive Edge", v: "Gamification layer" }].map(f => (
            <div key={f.l} className="p-2 rounded-lg bg-muted/30 border border-border"><p className="text-[7px] text-muted-foreground">{f.l}</p><p className="text-[9px] font-body text-foreground">{f.v}</p></div>
          ))}</div>
        </motion.div>
      )}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1"><Sparkles size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">AI Pitch Prep</span></div>
            <p className="text-[8px] font-body text-muted-foreground">"EcoTrack makes sustainability measurable for 50M+ Indian college students. 85% of surveyed students want this. Freemium model with B2B upsell."</p>
            <p className="text-[7px] font-body text-primary mt-1">⏱ 60-second pitch ready</p>
          </div>
        </motion.div>
      )}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-1">
          <Rocket size={18} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">Lab Active · 50% Complete</p>
          <div className="h-1.5 rounded-full bg-muted w-40 mx-auto"><div className="h-full w-1/2 bg-primary rounded-full" /></div>
          <div className="flex justify-center gap-4"><div><p className="text-sm font-display text-primary">1</p><p className="text-[7px] text-muted-foreground">Validated</p></div><div><p className="text-sm font-display text-primary">2/4</p><p className="text-[7px] text-muted-foreground">Milestones</p></div></div>
          <p className="text-[8px] font-body text-primary">AI tracking velocity · 2x faster than average</p>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   4. MVP Builder — Full Journey
   Start: Create project → pick experiment template
   During: Run experiment → log results → AI feedback
   End: Skill map + milestone progress
   ════════════════════════════════════════════════════════════════ */
const MVPBuilderMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="p-4 space-y-2.5">
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center justify-between"><p className="font-display text-sm text-foreground">MVP Builder</p><AIBadge label="Experiment Coach" /></div>
          <div className="p-3 rounded-lg border border-border"><p className="font-display text-xs text-foreground">EcoTrack MVP</p><p className="text-[8px] font-body text-muted-foreground">Status: Building</p></div>
        </motion.div>
      )}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Choose Experiment Template</p>
          {[{ t: "Customer Interview", i: Users, d: "Validate problem-solution fit" }, { t: "Landing Page Test", i: Layers, d: "Gauge interest with signups" }, { t: "Prototype Walkthrough", i: FlaskConical, d: "Observe user interaction" }].map((e, i) => (
            <motion.div key={e.t} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-2 p-2 rounded-lg border ${i === 0 ? "border-primary/30 bg-primary/5" : "border-border"}`}>
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><e.i size={12} className="text-primary" /></div>
              <div><p className="text-[9px] font-display text-foreground">{e.t}</p><p className="text-[7px] font-body text-muted-foreground">{e.d}</p></div>
            </motion.div>
          ))}
        </motion.div>
      )}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Running: Customer Interview</p>
          <div className="p-2.5 rounded-lg border border-border">
            <p className="text-[8px] font-body text-foreground mb-1">Hypothesis: Students want gamified waste tracking</p>
            <div className="w-full bg-muted rounded-full h-1.5"><motion.div className="bg-primary rounded-full h-1.5" initial={{ width: "0%" }} animate={{ width: "80%" }} transition={{ duration: 1.5 }} /></div>
            <p className="text-[7px] font-body text-muted-foreground mt-1">8/10 interviews done</p>
          </div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Log Results</p>
          <div className="p-2.5 rounded-lg border border-border space-y-1.5">
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-foreground">8/10 students confirmed the problem exists</div>
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-foreground">Key learning: gamification is crucial for retention</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-primary text-center"><span className="text-[9px] font-body text-primary-foreground">Save & Get AI Feedback</span></div>
        </motion.div>
      )}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1"><Sparkles size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">AI Iteration Feedback</span></div>
            <p className="text-[8px] font-body text-muted-foreground">"Strong validation — 80% confirmed. Your next experiment should test the gamification mechanic specifically. Recommend a landing page with a leaderboard mockup."</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[9px] font-body text-primary">Experiment → ✓ Validated · Next: Landing Page Test</p>
          </div>
        </motion.div>
      )}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Experiments Progress</p>
          {[{ t: "Customer Interview", s: "✓ Validated", r: "8/10 confirmed" }, { t: "Landing Page Test", s: "Running", r: "127 signups" }, { t: "Prototype Walkthrough", s: "Planned", r: "—" }].map((e, i) => (
            <div key={e.t} className="flex items-center gap-2 p-2 rounded-lg border border-border">
              <div className={`w-6 h-6 rounded flex items-center justify-center ${i === 0 ? "bg-primary/10" : i === 1 ? "bg-accent/10" : "bg-muted"}`}>
                {i === 0 ? <Check size={10} className="text-primary" /> : i === 1 ? <Play size={10} className="text-accent" /> : <Clock size={10} className="text-muted-foreground" />}
              </div>
              <div className="flex-1"><p className="text-[9px] font-body text-foreground">{e.t}</p><p className="text-[7px] text-muted-foreground">{e.r}</p></div>
              <span className={`text-[7px] font-body ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{e.s}</span>
            </div>
          ))}
        </motion.div>
      )}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1"><Brain size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">AI Skill Map</span></div>
            <p className="text-[8px] font-body text-muted-foreground mb-1.5">Skills needed for your MVP phase:</p>
            <div className="flex flex-wrap gap-1">{["No-Code Tools ✓", "UX Design ⚡", "Data Analytics 🔄", "Marketing 📋"].map(s => (
              <span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-muted text-foreground font-body">{s}</span>
            ))}</div>
          </div>
        </motion.div>
      )}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-1">
          <Wrench size={18} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">MVP Progress: 67%</p>
          <div className="h-1.5 rounded-full bg-muted w-40 mx-auto"><div className="h-full bg-primary rounded-full" style={{ width: "67%" }} /></div>
          <div className="flex justify-center gap-4"><div><p className="text-sm font-display text-primary">2</p><p className="text-[7px] text-muted-foreground">Experiments</p></div><div><p className="text-sm font-display text-primary">127</p><p className="text-[7px] text-muted-foreground">Signups</p></div></div>
          <p className="text-[8px] font-body text-primary">Experiment sequence auto-optimized by AI</p>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   5. Path Selector — Full Journey
   Start: AI detects signals from your activity
   During: Alignment quiz → path cards with match scores
   End: Path selected → roadmap generated → committed
   ════════════════════════════════════════════════════════════════ */
const PathSelectorMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="p-4 space-y-2.5">
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center justify-between"><p className="font-display text-sm text-foreground">Path Selector</p><AIBadge label="Personality matched" /></div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Sparkles size={10} className="text-primary" /></motion.div>
            <span className="text-[9px] font-body text-primary">Detecting signals from your ideas, skills & interests...</span>
          </div>
          <div className="flex justify-center gap-3"><div className="text-center"><p className="text-sm font-display text-primary">8</p><p className="text-[7px] text-muted-foreground">Ideas</p></div><div className="text-center"><p className="text-sm font-display text-primary">5</p><p className="text-[7px] text-muted-foreground">Skills</p></div><div className="text-center"><p className="text-sm font-display text-primary">3</p><p className="text-[7px] text-muted-foreground">Observations</p></div></div>
        </motion.div>
      )}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
            <p className="text-[8px] font-body text-primary flex items-center gap-1"><Brain size={8} /> AI Signal Detection</p>
            <p className="text-[8px] font-body text-muted-foreground mt-1">"Your activity shows strong social impact drive + creative problem-solving. High risk tolerance detected from your challenges."</p>
          </div>
        </motion.div>
      )}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Alignment Quiz</p>
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border">
            <p className="text-[9px] font-body text-foreground mb-2">How comfortable are you with financial uncertainty?</p>
            <div className="flex gap-1.5">{["Very comfortable", "Somewhat", "Prefer stability"].map((o, i) => (
              <motion.div key={o} animate={{ borderColor: i === 0 ? "hsl(var(--primary))" : "hsl(var(--border))", backgroundColor: i === 0 ? "hsl(var(--primary) / 0.05)" : "transparent" }}
                className="px-2 py-1 rounded border text-[8px] font-body">{o}</motion.div>
            ))}</div>
          </div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">AI-Matched Paths</p>
          {[{ i: Rocket, t: "Product Startup", risk: "High", m: 87 }, { i: Heart, t: "Social Impact", risk: "Medium", m: 72 }, { i: Briefcase, t: "Freelancing", risk: "Low", m: 65 }].map((p, i) => (
            <motion.div key={p.t} initial={{ x: 15, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg border ${i === 0 ? "border-primary/30 bg-primary/5" : "border-border"}`}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><p.i size={14} className="text-primary" /></div>
              <div className="flex-1"><p className="text-[10px] font-display text-foreground">{p.t}</p><p className="text-[7px] text-muted-foreground">Risk: {p.risk}</p></div>
              <div className="text-center"><p className="text-sm font-display text-primary">{p.m}%</p><p className="text-[6px] text-muted-foreground">match</p></div>
            </motion.div>
          ))}
        </motion.div>
      )}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
            <p className="font-display text-xs text-foreground">Selected: Product Startup</p>
            <p className="text-[8px] font-body text-muted-foreground mt-1">Build a scalable product that solves a significant problem.</p>
            <div className="flex gap-1 mt-2">{["Product thinking", "Technical skills", "Marketing"].map(s => (
              <span key={s} className="text-[7px] px-1.5 py-0.5 rounded bg-muted text-foreground font-body">{s}</span>
            ))}</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-primary text-center"><span className="text-[9px] font-body text-primary-foreground">✨ Generate Roadmap</span></div>
        </motion.div>
      )}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">AI-Generated Roadmap</p>
          {[{ t: "Validate problem statement", p: "Week 1-2" }, { t: "Build landing page", p: "Week 3-4" }, { t: "Run pilot with 50 users", p: "Month 2" }, { t: "Iterate based on feedback", p: "Month 3" }].map((s, i) => (
            <motion.div key={s.t} initial={{ x: -5, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2 p-1.5 rounded-lg border border-border">
              <div className="w-4 h-4 rounded-full border border-primary" />
              <div><p className="text-[9px] font-body text-foreground">{s.t}</p><p className="text-[7px] text-muted-foreground">{s.p}</p></div>
            </motion.div>
          ))}
        </motion.div>
      )}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1"><Sparkles size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">Alignment Evaluation</span></div>
            <div className="flex items-center gap-3"><div className="text-center"><p className="text-xl font-display text-primary">87%</p><p className="text-[7px] text-muted-foreground">Alignment</p></div>
            <p className="text-[8px] font-body text-muted-foreground flex-1">"Your skills, risk appetite, and creativity strongly align with Product Startup. This is your strongest path."</p></div>
          </div>
        </motion.div>
      )}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-1">
          <Compass size={18} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">Path Committed! 🎯</p>
          <p className="text-[8px] font-body text-muted-foreground">Product Startup · 87% aligned · Roadmap active</p>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
            <TrendingUp size={8} className="text-primary" /><span className="text-[8px] font-body text-primary">Roadmap synced to your dashboard</span>
          </motion.div>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   6. Founder Profile — Full Journey
   Start: Fill profile details
   During: Dashboard aggregates → AI strengths → skill evolution
   End: Journey narrative + next steps
   ════════════════════════════════════════════════════════════════ */
const FounderProfileMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="p-4 space-y-2.5">
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center justify-between"><p className="font-display text-sm text-foreground">Founder Profiling</p><AIBadge label="Live Profile" /></div>
          <div className="p-2.5 rounded-lg border border-border space-y-1.5">
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-foreground">Founder Type: Visionary Builder</div>
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-foreground">Strengths: Creativity, Resilience, Communication</div>
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-foreground">Looking for: Co-founder, Mentor</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-primary text-center"><span className="text-[9px] font-body text-primary-foreground">Save Profile</span></div>
        </motion.div>
      )}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User size={16} className="text-primary" /></div>
            <div><p className="font-display text-xs text-foreground">Founder Dashboard</p><p className="text-[7px] font-body text-muted-foreground">Auto-aggregated from all modules</p></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{[{ v: "12", l: "Ideas", i: Lightbulb }, { v: "8", l: "Challenges", i: Shield }, { v: "3", l: "Projects", i: Rocket }, { v: "15", l: "Skills", i: Zap }].map((s, i) => (
            <motion.div key={s.l} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08 }} className="p-2 rounded-lg bg-muted/30 text-center border border-border">
              <s.i size={10} className="mx-auto text-primary mb-0.5" /><p className="text-sm font-display text-foreground">{s.v}</p><p className="text-[6px] font-body text-muted-foreground">{s.l}</p>
            </motion.div>
          ))}</div>
        </motion.div>
      )}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="text-[9px] font-body text-muted-foreground">AI-Detected Strengths</p>
          <div className="flex flex-wrap gap-1">{["Problem-solving", "Resilience", "Creativity", "Communication", "Leadership"].map((s, i) => (
            <motion.span key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.06, type: "spring" }} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-body">{s}</motion.span>
          ))}</div>
          <p className="text-[9px] font-body text-muted-foreground mt-1">Growth Areas</p>
          <div className="flex flex-wrap gap-1">{["Delegation", "Financial planning"].map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[8px] font-body">{s}</span>
          ))}</div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1"><Sparkles size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">Skill Evolution</span></div>
            <p className="text-[8px] font-body text-muted-foreground">"Your resilience grew 23% after completing 8 challenges. Your experiment velocity is in the top 15% of founders on the platform."</p>
          </div>
        </motion.div>
      )}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Mindset Analysis</p>
          <div className="flex justify-center gap-3">{[{ l: "Risk Tolerance", v: 78 }, { l: "Resilience", v: 85 }, { l: "Discipline", v: 62 }].map(g => (
            <div key={g.l} className="text-center">
              <div className="relative w-12 h-12"><svg viewBox="0 0 36 36" className="w-full h-full -rotate-90"><circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" /><motion.circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeDasharray={`${g.v * 0.94} 100`} strokeLinecap="round" initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: `${g.v * 0.94} 100` }} transition={{ duration: 1 }} /></svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-body text-foreground">{g.v}</span></div>
              <p className="text-[7px] font-body text-muted-foreground mt-0.5">{g.l}</p>
            </div>
          ))}</div>
        </motion.div>
      )}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1"><Sparkles size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">AI Next Steps</span></div>
            {["Scale your networking — join 2 startup communities", "Complete financial planning learning track", "Pitch your idea at a campus event"].map((s, i) => (
              <div key={s} className="flex items-center gap-1.5 mt-1"><ArrowRight size={7} className="text-primary shrink-0" /><span className="text-[8px] font-body text-muted-foreground">{s}</span></div>
            ))}
          </div>
        </motion.div>
      )}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Journey Narrative</p>
          <div className="p-2.5 rounded-lg border border-border bg-muted/20">
            <p className="text-[8px] font-body text-muted-foreground italic leading-relaxed">"In 3 months, you went from exploring ideas to validating a real startup. You've shown exceptional resilience and creative problem-solving. Your EcoTrack project is your strongest venture yet."</p>
          </div>
        </motion.div>
      )}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-1">
          <User size={18} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">Founder Profile Active</p>
          <p className="text-[8px] font-body text-muted-foreground">Auto-evolves from every action · 850 total points</p>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
            <TrendingUp size={8} className="text-primary" /><span className="text-[8px] font-body text-primary">Profile updates in real-time</span>
          </motion.div>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   7. AI Coach — Full Journey
   Start: Quick topics → start conversation
   During: AI reads context → multi-step guidance → check-in
   End: Decision framework → coaching summary
   ════════════════════════════════════════════════════════════════ */
const AICoachMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="flex flex-col h-full">
      {step === 0 && (
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"><Bot size={12} className="text-primary" /></div><div><p className="font-display text-xs text-foreground">AI Coach</p><p className="text-[7px] font-body text-primary">Knows your full journey</p></div></div>
          <p className="text-[8px] font-body text-muted-foreground">Quick topics:</p>
          <div className="flex flex-wrap gap-1">{["Validate my idea", "Build a pitch", "Team building", "Managing stress"].map(t => (
            <motion.span key={t} initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="px-2 py-1 rounded-full bg-muted text-[8px] font-body text-muted-foreground">{t}</motion.span>
          ))}</div>
        </div>
      )}
      {step >= 1 && step <= 4 && (
        <div className="flex-1 p-3 space-y-2 overflow-hidden">
          {[
            { role: "user", text: "How do I validate my startup idea?" },
            { role: "ai", text: "Looking at your Startup Sparks data — you have 12 ideas, but \"EcoTrack\" scored 87% validation. Let's focus there. Here's my 3-step plan:" },
            { role: "ai", text: "1️⃣ Interview 5 students this week\n2️⃣ Use your empathy trait for deep listening\n3️⃣ Test with a landing page" },
            { role: "user", text: "What if the interviews don't go well?" },
          ].slice(0, step).map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-2.5 py-1.5 rounded-xl text-[9px] font-body leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                {m.role === "ai" && <div className="flex items-center gap-1 mb-0.5"><Sparkles size={7} className="text-primary" /><span className="text-[7px] text-primary font-semibold">Personalized</span></div>}
                {m.text}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {step === 5 && (
        <div className="p-3 space-y-2">
          <p className="font-display text-xs text-foreground">Decision Framework</p>
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[8px] font-body text-foreground mb-1">Should I pivot my idea?</p>
            <div className="grid grid-cols-2 gap-1.5">{[{ l: "Stay Course", s: "72%" }, { l: "Pivot", s: "28%" }].map(o => (
              <div key={o.l} className="p-1.5 rounded bg-muted/30 text-center"><p className="text-sm font-display text-primary">{o.s}</p><p className="text-[7px] text-muted-foreground">{o.l}</p></div>
            ))}</div>
            <p className="text-[7px] font-body text-primary mt-1">AI recommends staying course based on your validation data</p>
          </div>
        </div>
      )}
      {step === 6 && (
        <div className="p-3 space-y-2">
          <p className="font-display text-xs text-foreground">Weekly Check-in</p>
          <div className="flex justify-center gap-2">{["😊 Great", "😐 Okay", "😣 Struggling"].map((m, i) => (
            <div key={m} className={`px-2 py-1.5 rounded-xl text-[8px] font-body border ${i === 0 ? "border-primary/30 bg-primary/5" : "border-border"}`}>{m}</div>
          ))}</div>
          <div className="flex gap-2">{[{ l: "Confidence", v: 7 }, { l: "Energy", v: 6 }].map(s => (
            <div key={s.l} className="flex-1 p-2 rounded-lg bg-muted/30 text-center"><p className="text-[7px] text-muted-foreground">{s.l}</p><p className="text-sm font-display text-primary">{s.v}/10</p></div>
          ))}</div>
        </div>
      )}
      {step === 7 && (
        <div className="p-3 space-y-2 text-center">
          <Bot size={18} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">Coaching Summary</p>
          <div className="bg-primary/5 rounded-lg p-2 border border-primary/10 text-left">
            <p className="text-[8px] font-body text-muted-foreground">"This week: You validated your idea, completed 2 challenges, and made your first cold outreach. Confidence: up. Next: focus on building your landing page."</p>
          </div>
          <p className="text-[7px] font-body text-primary">5 sessions · AI reads all your data before responding</p>
        </div>
      )}
      <div className="mt-auto p-2 border-t border-border flex gap-2">
        <div className="flex-1 bg-muted/30 rounded-lg px-2.5 py-1.5 text-[9px] font-body text-muted-foreground">AI reads your data first...</div>
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><Send size={10} className="text-primary-foreground" /></div>
      </div>
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   8. Startup Showcase — Full Journey
   Start: Share project → community sees it
   During: Reactions → comments → AI feedback
   End: Funding path + collaboration match
   ════════════════════════════════════════════════════════════════ */
const StartupShowcaseMock = () => {
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => (s + 1) % 8), 1500); return () => clearInterval(t); }, []);

  return (
    <div className="p-4 space-y-2.5">
      {step === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="flex items-center justify-between"><p className="font-display text-sm text-foreground">Startup Showcase</p><AIBadge label="AI Feedback" /></div>
          <div className="p-2.5 rounded-lg border border-border space-y-1.5">
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-foreground">EcoTrack — Carbon Footprint App</div>
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-muted-foreground">Gamified sustainability tracking for students...</div>
            <div className="bg-muted/30 rounded px-2 py-1 text-[8px] font-body text-muted-foreground">Tags: sustainability, gamification, social</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-primary text-center"><span className="text-[9px] font-body text-primary-foreground">🎉 Share to Showcase</span></div>
        </motion.div>
      )}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
            <Presentation size={18} className="mx-auto text-primary mb-1" />
            <p className="font-display text-sm text-foreground">Project Shared! 🎉</p>
            <p className="text-[8px] font-body text-muted-foreground">Now visible to the community</p>
          </div>
        </motion.div>
      )}
      {step === 2 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="p-3 rounded-lg border border-border bg-card">
            <p className="font-display text-xs text-foreground">EcoTrack</p>
            <p className="text-[8px] font-body text-muted-foreground mb-2">Gamified sustainability tracking for students</p>
            <div className="flex items-center gap-3">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ delay: 0.5 }} className="flex items-center gap-1 text-[8px] font-body"><Heart size={8} className="text-primary fill-primary" /> 24</motion.div>
              <div className="flex items-center gap-1 text-[8px] font-body text-muted-foreground"><Lightbulb size={8} /> 12</div>
              <div className="flex items-center gap-1 text-[8px] font-body text-muted-foreground"><MessageCircle size={8} /> 8</div>
            </div>
          </div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Community Comments</p>
          {[{ u: "S", t: "Love the gamification angle! Have you thought about campus challenges?" }, { u: "R", t: "This could work for corporate offices too." }].map((c, i) => (
            <motion.div key={i} initial={{ y: 5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}
              className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-display text-primary">{c.u}</div>
              <p className="text-[8px] font-body text-foreground flex-1">{c.t}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
      {step === 4 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1"><Sparkles size={10} className="text-primary" /><span className="text-[9px] font-display text-foreground">AI Project Analysis</span></div>
            <p className="text-[8px] font-body text-muted-foreground">"Strong social proof: 24 likes, 12 inspires. Your communication makes you ideal for pitching. Add competitive analysis to attract mentors."</p>
          </div>
        </motion.div>
      )}
      {step === 5 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <p className="font-display text-xs text-foreground">Funding Path Navigator</p>
          <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
            {[{ s: "Grants", f: "Best for early stage", m: "High" }, { s: "Angel Investors", f: "After MVP validation", m: "Medium" }].map((f, i) => (
              <div key={f.s} className="flex items-center justify-between p-1.5 border-b border-border/30 last:border-0">
                <div><p className="text-[9px] font-body text-foreground">{f.s}</p><p className="text-[7px] text-muted-foreground">{f.f}</p></div>
                <span className="text-[7px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-body">{f.m} fit</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
      {step === 6 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="bg-accent/5 rounded-lg p-2.5 border border-accent/10">
            <div className="flex items-center gap-1.5 mb-1"><Handshake size={10} className="text-accent" /><span className="text-[9px] font-display text-foreground">AI Collaboration Match</span></div>
            <p className="text-[8px] font-body text-muted-foreground mb-1.5">3 potential co-founders matched based on your skill gaps:</p>
            {["UX Designer with sustainability focus", "Backend dev with mobile experience"].map((m, i) => (
              <div key={m} className="flex items-center gap-1.5 text-[8px] font-body text-foreground"><Users size={7} className="text-accent" /> {m}</div>
            ))}
          </div>
        </motion.div>
      )}
      {step === 7 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center py-1">
          <Presentation size={18} className="mx-auto text-primary" />
          <p className="font-display text-sm text-foreground">Showcase Active</p>
          <div className="flex justify-center gap-4"><div><p className="text-sm font-display text-primary">24</p><p className="text-[7px] text-muted-foreground">Likes</p></div><div><p className="text-sm font-display text-primary">3</p><p className="text-[7px] text-muted-foreground">Collabs</p></div><div><p className="text-sm font-display text-primary">2</p><p className="text-[7px] text-muted-foreground">Funding Paths</p></div></div>
          <p className="text-[8px] font-body text-primary">Real-time reactions · AI matching co-founders</p>
        </motion.div>
      )}
      <ProgressDots current={step} total={8} />
    </div>
  );
};

/* ─── Walkthrough Data ─── */
const walkthroughs = [
  { id: "sparks", label: "Startup Sparks", description: "Idea discovery → AI validation", icon: Lightbulb, component: StartupSparksMock },
  { id: "mindset", label: "Mindset Builder", description: "Challenges → habits → score", icon: Brain, component: MindsetBuilderMock },
  { id: "lab", label: "Startup Lab", description: "Plan → validate → build", icon: Rocket, component: StartupLabMock },
  { id: "mvp", label: "MVP Builder", description: "Experiments → iterate → ship", icon: Wrench, component: MVPBuilderMock },
  { id: "path", label: "Path Selector", description: "Signals → match → commit", icon: Compass, component: PathSelectorMock },
  { id: "profile", label: "Founder Profile", description: "Auto-evolving founder identity", icon: User, component: FounderProfileMock },
  { id: "coach", label: "AI Coach", description: "Context-aware guidance", icon: Bot, component: AICoachMock },
  { id: "showcase", label: "Showcase", description: "Share → feedback → collaborate", icon: Presentation, component: StartupShowcaseMock },
];

/* ─── Main Section ─── */
const EntrepreneurshipWalkthroughSection = () => {
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
    <section ref={ref} className="py-20 sm:py-28 md:py-36 bg-background relative overflow-hidden">
      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-warmth font-semibold mb-3">Entrepreneurship Edition</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight">
            AI that <em className="text-gradient-warm">builds with you</em> — not just for you. no cap.
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }} className="font-body text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4">
            Peep each tool's full journey — from first click to AI-powered W's. Your startup path, uniquely yours.
          </motion.p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-center max-w-6xl mx-auto">
          <div className="lg:w-[300px] w-full">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 sm:gap-2">
              {walkthroughs.map((w, i) => (
                <motion.button key={w.id} initial={{ opacity: 0, x: -16 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.1 + i * 0.04 }}
                  onClick={() => setActive(i)}
                  className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl text-left transition-all duration-300 border ${active === i ? "bg-card border-primary/20 shadow-soft" : "border-transparent hover:bg-background-alt"}`}>
                  <div className={`w-7 sm:w-9 h-7 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${active === i ? "bg-primary/10 text-primary" : "bg-muted text-grey-meta"}`}><w.icon size={14} className="sm:w-4 sm:h-4" /></div>
                  <div className="min-w-0">
                    <p className={`font-display text-[11px] sm:text-sm truncate ${active === i ? "text-primary" : "text-foreground"}`}>{w.label}</p>
                    <p className="font-body text-[8px] sm:text-[10px] text-grey-meta truncate hidden sm:block">{w.description}</p>
                  </div>
                  {active === i && <motion.div layoutId="ent-walkthrough-indicator" className="w-1 h-6 rounded-full bg-primary ml-auto shrink-0 hidden lg:block" />}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center overflow-x-auto">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.4 }}>
                <BrowserFrame url={walkthroughs[active].id}>
                  <ActiveComponent />
                </BrowserFrame>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EntrepreneurshipWalkthroughSection;
