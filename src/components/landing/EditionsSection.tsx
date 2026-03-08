import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Rocket } from "lucide-react";
import editionsIllustration from "@/assets/editions-illustration.png";

const EditionsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="careers" ref={ref} className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            Two Paths, One Ecosystem
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground"
          >
            Career or startup — <em className="text-gradient-warm">you decide</em>
          </motion.h2>
        </div>

        {/* Central illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex justify-center mb-16"
        >
          <img
            src={editionsIllustration}
            alt="Two paths - careers and entrepreneurship connected by a bridge"
            className="w-full max-w-lg"
          />
        </motion.div>

        {/* Two edition cards — minimal */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            {
              icon: Briefcase,
              title: "Careers",
              subtitle: "Discover → Develop → Deploy",
              color: "from-blue-500/10 to-blue-500/5",
            },
            {
              icon: Rocket,
              title: "Entrepreneurship",
              subtitle: "Discover → Build → Launch",
              color: "from-secondary/10 to-secondary/5",
            },
          ].map((ed, i) => (
            <motion.div
              key={ed.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-card rounded-3xl p-8 border border-border shadow-card text-center hover:shadow-accent/20 transition-shadow duration-500"
            >
              <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-4">
                <ed.icon size={24} className="text-secondary-foreground" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-1">{ed.title}</h3>
              <p className="font-body text-sm text-muted-foreground">{ed.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EditionsSection;
