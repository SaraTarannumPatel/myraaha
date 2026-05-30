import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, X, ArrowRight } from "lucide-react";

const brokenPieces = [
  { label: "Random YouTube advice", emoji: "📺", column: 1 },
  { label: "Generic aptitude tests", emoji: "📋", column: 1 },
  { label: "Seniors who are also lost", emoji: "🤷", column: 1 },
  { label: "Job portals at 2am", emoji: "💻", column: 2 },
  { label: "4-5 disconnected apps", emoji: "📱", column: 2 },
  { label: "Still zero clarity", emoji: "😶‍🌫️", column: 2 },
];

const infrastructureGaps = [
  { title: "No unified system", desc: "Career, skills, interests, goals — all scattered across 10 different places.", color: "border-blue/30 bg-blue/5" },
  { title: "No evolving identity", desc: "You grow, but your tools don't. Static resumes and one-time tests can't keep up.", color: "border-terracotta/30 bg-terracotta/5" },
  { title: "No decision framework", desc: "Gut feeling ≠ strategy. Without a system, every choice feels like a coin flip.", color: "border-indigo/30 bg-indigo/5" },
  { title: "No real-time guidance", desc: "AI exists. But it's not wired into your career or startup journey — yet.", color: "border-maroon/30 bg-maroon/5" },
];

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="problem" ref={ref} className="py-24 sm:py-32 md:py-40 bg-background relative overflow-hidden">
      {/* Large background number */}
      <div className="absolute top-6 sm:top-10 left-4 sm:left-8 md:left-12">
        <span className="font-display text-[80px] sm:text-[120px] md:text-[180px] text-grey-divider/30 leading-none select-none">01</span>
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        {/* Header — full width, centered */}
        <div className="max-w-3xl mx-auto text-center mb-16 sm:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-terracotta font-semibold mb-4"
          >
            The Real Problem
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05] mb-5"
          >
            This ain't a talent problem.
            <br />
            <span className="text-gradient-milestone">It's an infrastructure problem.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            You're smart. You're motivated. But the system you're navigating was built for a different era.
            There's no infrastructure for modern career and startup decisions.
          </motion.p>
        </div>

        {/* Two-column layout: What people do vs What's actually broken */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-16 sm:mb-20">
          {/* Left: What people do today */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <X size={16} className="text-destructive" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl text-foreground">What people do today</h3>
            </div>
            <div className="space-y-3">
              {brokenPieces.map((piece, i) => (
                <motion.div
                  key={piece.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-center gap-3 bg-card rounded-xl border border-destructive/10 p-4 group hover:border-destructive/25 transition-colors"
                >
                  <span className="text-xl">{piece.emoji}</span>
                  <span className="font-body text-sm text-foreground flex-1">{piece.label}</span>
                  <X size={14} className="text-destructive/40 group-hover:text-destructive transition-colors" />
                </motion.div>
              ))}
            </div>
            {/* Quote */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 }}
              className="mt-6 bg-card rounded-2xl p-5 border border-terracotta/20 shadow-soft"
            >
              <p className="font-display text-lg sm:text-xl text-foreground italic leading-snug">
                "Why is making a life decision still this <span className="text-gradient-milestone">chaotic?</span> like bestie help 💀"
              </p>
            </motion.div>
          </motion.div>

          {/* Right: The infrastructure gaps */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <AlertTriangle size={16} className="text-accent" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl text-foreground">What's actually broken</h3>
            </div>
            <div className="space-y-4">
              {infrastructureGaps.map((gap, i) => (
                <motion.div
                  key={gap.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`rounded-xl border p-5 ${gap.color}`}
                >
                  <h4 className="font-display text-base sm:text-lg text-foreground mb-1">{gap.title}</h4>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{gap.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full px-6 py-3 shadow-soft">
            <span className="font-body text-sm text-muted-foreground">You don't need more advice.</span>
            <span className="font-display text-sm text-foreground">You need a system.</span>
            <ArrowRight size={14} className="text-accent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSection;
