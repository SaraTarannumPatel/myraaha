import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import missionIllustration from "@/assets/mission-illustration.png";

const MissionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="mission" ref={ref} className="py-24 md:py-32 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4">
              The Future MyRaaha Is Building
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
              Navigation became <em className="text-gradient-warm">structured.</em>
            </h2>
            <div className="space-y-4 font-body text-sm text-muted-foreground leading-relaxed">
              <p>
                A world where people don't feel <strong className="text-foreground">lost at 22</strong>. Or <strong className="text-foreground">stuck at 30</strong>. Or <strong className="text-foreground">irrelevant at 40</strong>.
              </p>
              <p>
                Not because life became easy. But because navigation became structured.
              </p>
              <p>
                One system. Full journey ownership.
              </p>
              <p className="font-display text-lg text-foreground">
                Clarity → Direction → Action → Outcome.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex justify-center"
          >
            <img
              src={missionIllustration}
              alt="Structured navigation for every stage of life"
              className="w-full max-w-sm"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
