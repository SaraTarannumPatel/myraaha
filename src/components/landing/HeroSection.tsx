import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import appMockup from "@/assets/app-mockup.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-hero pt-24 pb-16">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center">
          {/* Left — Copy (minimal) */}
          <div className="max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight text-foreground mb-6"
            >
              Don't stumble into your future.{" "}
              <span className="text-gradient-warm italic">Design it.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-body text-lg text-muted-foreground mb-8 leading-relaxed"
            >
              Your AI-powered career & entrepreneurship co-pilot — from age 13 to beyond.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="gradient-warm text-secondary-foreground px-8 py-3.5 rounded-full font-body font-semibold text-base shadow-accent hover:opacity-90 transition-opacity flex items-center gap-2 group">
                Start Your Journey
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-card text-foreground px-8 py-3.5 rounded-full font-body font-semibold text-base shadow-soft border border-border hover:bg-muted transition-colors">
                Watch Demo
              </button>
            </motion.div>
          </div>

          {/* Right — Animated App Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateY: -8 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Glow behind mockup */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-transparent rounded-full blur-3xl scale-110" />
            
            <motion.img
              src={appMockup}
              alt="ShuttlEx app showing career exploration dashboard"
              className="relative w-full max-w-md lg:max-w-lg drop-shadow-2xl"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating badges */}
            <motion.div
              className="absolute top-8 -left-4 bg-card rounded-2xl px-4 py-3 shadow-card border border-border"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <p className="font-body text-xs font-semibold text-foreground">13+ Starting Age</p>
              <p className="font-body text-[10px] text-muted-foreground">Begin your journey early</p>
            </motion.div>

            <motion.div
              className="absolute bottom-16 -right-2 bg-card rounded-2xl px-4 py-3 shadow-card border border-border"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <p className="font-body text-xs font-semibold text-foreground">6 Life Phases</p>
              <p className="font-body text-[10px] text-muted-foreground">Grows with you</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
