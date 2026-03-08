import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import missionIllustration from "@/assets/mission-illustration.png";

const MissionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4">
              Our Mission
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
              Every student deserves a <em className="text-gradient-warm">fair shot</em>
            </h2>
            <div className="space-y-4 font-body text-sm text-muted-foreground leading-relaxed">
              <p>
                From <strong className="text-foreground">Tier 1 cities to remote villages</strong> — every student 
                should get to discover who they are and become who they're meant to be.
              </p>
              <p>
                We start before the confusion begins — and walk with them till clarity becomes action. 
                Not in class 12. Not after a wrong degree. <strong className="text-foreground">From the very beginning.</strong>
              </p>
              <p>
                To make entrepreneurship and freelancing accessible, practical, and emotionally sustainable 
                for anyone with the courage to begin.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="mt-8 bg-card rounded-2xl p-5 border border-border shadow-soft"
            >
              <p className="font-display text-lg text-foreground italic">
                "We turn curiosity into creation — helping individuals find problems worth solving, 
                build ideas worth pursuing, and find people worth building with."
              </p>
            </motion.div>
          </motion.div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex justify-center"
          >
            <img
              src={missionIllustration}
              alt="Hands planting seeds of growth — inclusive mission"
              className="w-full max-w-sm"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
