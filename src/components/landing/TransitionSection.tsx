import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ScanSearch, RefreshCw, Route, BarChart3, Heart } from "lucide-react";
import transitionIllustration from "@/assets/transition-illustration.png";

const features = [
  { icon: ScanSearch, title: "Profile Reassessment", description: "AI reviews your career, skills & restlessness to find real alignment." },
  { icon: RefreshCw, title: "Identity Reconstruction", description: "System evolves with your clicks, pauses & reflections — no forms needed." },
  { icon: Route, title: "Transition Tracks", description: "Domain-specific micro-pathways with training, mentorship & project experience." },
  { icon: BarChart3, title: "Live Demand-Supply Grid", description: "Real-time demand for roles in new domains connected to your skillset." },
  { icon: Heart, title: "Emotional Safety Layer", description: "Community for career changers — coaches, not judges. Reinvention needs empathy." },
];

const TransitionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            Career Transitioners — Age 25+
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground"
          >
            Redesigning the <em className="text-gradient-warm">journey</em>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Copy + features */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.15 }}
              className="font-body text-sm text-muted-foreground leading-relaxed mb-8"
            >
              3–5 years into a job and realize it's not for you? ShuttlEx makes career transitions 
              graceful, supported, and data-backed — not chaotic.
            </motion.p>
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <f.icon size={18} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-display text-base text-foreground">{f.title}</h3>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <img
              src={transitionIllustration}
              alt="Person at crossroads — career transition and reinvention"
              className="w-full max-w-sm"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TransitionSection;
