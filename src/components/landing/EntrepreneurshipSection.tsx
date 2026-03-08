import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Eye, Pause, TrendingUp, MessageCircle, Activity } from "lucide-react";
import entrepreneurshipIllustration from "@/assets/entrepreneurship-illustration.png";

const signals = [
  { icon: Eye, title: "Your Choices", description: "What options you explore and what you commit to." },
  { icon: Pause, title: "Your Hesitation", description: "Where you slow down, pause, or drop off." },
  { icon: TrendingUp, title: "Your Progress", description: "How you respond to difficulty and what you complete." },
  { icon: MessageCircle, title: "Your Communication", description: "How clearly you express ideas and articulate goals." },
  { icon: Activity, title: "Energy Gain vs Drain", description: "What tasks energize you and what depletes you." },
];

const EntrepreneurshipSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 md:py-36 bg-muted/20 relative overflow-hidden">
      <div className="absolute top-12 left-6 md:left-12">
        <span className="font-display text-[120px] md:text-[180px] text-muted/30 leading-none select-none">05</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3"
            >
              Behaviour Intelligence
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight"
            >
              It studies your <em className="text-gradient-warm">behaviour</em>
              <br className="hidden sm:block" /> — not just your answers.
            </motion.h2>
          </div>

          {/* AAA cards - horizontal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 mb-16 max-w-lg mx-auto"
          >
            {[
              { label: "Aptitude", sub: "What you can do", gradient: "from-primary to-primary/70" },
              { label: "Attitude", sub: "How you respond", gradient: "from-primary/80 to-accent" },
              { label: "Articulation", sub: "How you express", gradient: "from-accent to-accent/70" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="relative rounded-2xl p-5 text-center overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${item.gradient} opacity-10`} />
                <div className="relative z-10">
                  <p className="font-display text-xl text-foreground">{item.label}</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-1">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center order-2 lg:order-1"
            >
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />
              <img
                src={entrepreneurshipIllustration}
                alt="Behaviour tracking and evolving identity model"
                className="relative w-full max-w-md"
              />
            </motion.div>

            {/* Signal cards */}
            <div className="space-y-3 order-1 lg:order-2">
              <p className="font-body text-sm text-muted-foreground mb-4">
                Most platforms give you a one-time test result. MyRaaha continuously learns from:
              </p>
              {signals.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-start gap-4 bg-card rounded-2xl p-4 border border-border shadow-soft hover:shadow-card transition-shadow duration-300"
                >
                  <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shrink-0">
                    <s.icon size={18} className="text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-display text-base text-foreground">{s.title}</h4>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                  </div>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.7 }}
                className="bg-muted/50 rounded-2xl p-5 border border-border mt-4"
              >
                <p className="font-display text-base text-foreground italic text-center">
                  "This becomes your evolving journey graph — not a static resume."
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EntrepreneurshipSection;
