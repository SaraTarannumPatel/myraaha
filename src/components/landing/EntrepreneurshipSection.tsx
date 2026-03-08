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
    <section ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            Behaviour Intelligence
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground max-w-2xl mx-auto"
          >
            It studies your <em className="text-gradient-warm">behaviour</em> — not just your answers.
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-3xl blur-2xl" />
            <img
              src={entrepreneurshipIllustration}
              alt="Behaviour tracking and evolving identity model"
              className="relative w-full max-w-md"
            />
          </motion.div>

          <div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
              Most platforms give you a one-time test result. MyRaaha continuously learns from your interactions and tracks three things over time:
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {["Aptitude", "Attitude", "Articulation"].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 12 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="bg-muted/50 rounded-2xl p-4 text-center"
                >
                  <p className="font-display text-lg text-gradient-warm">{item}</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-1">
                    {i === 0 ? "What you can do" : i === 1 ? "How you respond" : "How you express"}
                  </p>
                </motion.div>
              ))}
            </div>
            <div className="space-y-3">
              {signals.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, x: 16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <s.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm text-foreground">{s.title}</h4>
                    <p className="font-body text-xs text-muted-foreground">{s.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="font-display text-base text-foreground italic mt-6">
              This becomes your evolving journey graph — not a static resume.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EntrepreneurshipSection;
