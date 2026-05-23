import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import appMockup from "@/assets/app-mockup.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero pt-24 sm:pt-28 pb-16 sm:pb-20">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />
      {/* Decorative circles */}
      <div className="absolute top-32 right-[10%] w-48 sm:w-72 h-48 sm:h-72 rounded-full border border-blue/15 opacity-30 hidden sm:block" />
      <div className="absolute bottom-20 left-[5%] w-32 sm:w-48 h-32 sm:h-48 rounded-full border border-terracotta/12 opacity-20 hidden sm:block" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">
          <div className="max-w-xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-3 sm:px-4 py-1.5 mb-6 sm:mb-8 shadow-soft"
            >
              <Sparkles size={14} className="text-accent" />
              <span className="font-body text-[10px] sm:text-xs font-semibold text-grey-label tracking-wide uppercase">Decision Operating System</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-foreground mb-3"
            >
              My<span className="text-gradient-warm">Raaha</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-5 sm:mb-6"
            >
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-foreground/90 leading-snug">
                Career & business decisions
              </h2>
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-foreground/90 leading-snug">
                — <em className="text-gradient-warm">zero guesswork.</em>
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-body text-sm sm:text-base text-muted-foreground mb-8 sm:mb-10 max-w-sm"
            >
              Lowkey direction. Real outcomes. No cap.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            >
              <a href="/intro" className="gradient-warm text-primary-foreground px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-body font-semibold text-sm sm:text-base shadow-accent hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group">
                Start Your Journey
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <button className="bg-card text-foreground px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-body font-semibold text-sm sm:text-base shadow-soft border border-border hover:bg-muted transition-colors">
                Watch Demo
              </button>
            </motion.div>

            {/* Mini stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex gap-6 sm:gap-8 mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-border/50"
            >
              {[
                { val: "4", label: "Structured stages", color: "text-blue" },
                { val: "∞", label: "Evolves with you", color: "text-terracotta" },
                { val: "1", label: "System for everything", color: "text-primary" },
              ].map((s) => (
                <div key={s.label}>
                  <p className={`font-display text-xl sm:text-2xl ${s.color}`}>{s.val}</p>
                  <p className="font-body text-[9px] sm:text-[10px] text-grey-meta mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40, rotateY: -8 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue/10 via-accent/8 to-terracotta/8 rounded-full blur-3xl scale-110" />
            
            <motion.img
              src={appMockup}
              alt="MyRaaha app showing career navigation dashboard"
              className="relative w-full max-w-xs sm:max-w-md lg:max-w-lg drop-shadow-2xl"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute top-8 -left-2 sm:-left-4 bg-card rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shadow-card border border-border backdrop-blur-sm hidden sm:block"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <p className="font-display text-xs sm:text-sm text-foreground">Clarity → Direction</p>
              <p className="font-body text-[9px] sm:text-[10px] text-grey-meta">Not vibes-only decisions</p>
            </motion.div>

            <motion.div
              className="absolute bottom-16 -right-1 sm:-right-2 bg-card rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shadow-card border border-border backdrop-blur-sm hidden sm:block"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <p className="font-display text-xs sm:text-sm text-foreground">Action → Outcome</p>
              <p className="font-body text-[9px] sm:text-[10px] text-grey-meta">One system, full journey</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;