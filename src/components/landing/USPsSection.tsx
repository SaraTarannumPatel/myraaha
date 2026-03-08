import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Filter, BarChart3, TrendingUp, Brain, RefreshCw, Link2,
} from "lucide-react";

const usps = [
  { icon: Filter, title: "Filtering Noise", description: "Instead of 200 careers or ideas, MyRaaha narrows options responsibly based on your real data.", accent: "from-primary/20 to-primary/5" },
  { icon: BarChart3, title: "Ranking Responsibly", description: "Every path shows required skills, market demand, income realities, effort needed, and risk level.", accent: "from-accent/20 to-accent/5" },
  { icon: TrendingUp, title: "Showing Trade-offs", description: "Time-to-readiness estimates, effort vs reward comparisons, and income-risk analysis.", accent: "from-primary/20 to-primary/5" },
  { icon: Brain, title: "Auto Tracking Growth", description: "Your dynamic identity model evolves continuously — aptitude, attitude, and articulation.", accent: "from-accent/20 to-accent/5" },
  { icon: RefreshCw, title: "No Resets Needed", description: "The system remembers your history. Adjusts when you shift, fall behind, or markets change.", accent: "from-primary/20 to-primary/5" },
  { icon: Link2, title: "Skill → Outcome", description: "Connects learning directly to jobs, validation, and real opportunities. No random course hopping.", accent: "from-accent/20 to-accent/5" },
];

const USPsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 md:py-36 bg-muted/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3"
          >
            What Makes MyRaaha Different
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground leading-tight"
          >
            Not information. Not courses.
            <br />
            A <em className="text-gradient-warm">decision operating system.</em>
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {usps.map((usp, i) => (
            <motion.div
              key={usp.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="group bg-card rounded-3xl p-7 border border-border shadow-soft hover:shadow-card transition-all duration-500 relative overflow-hidden"
            >
              {/* Gradient accent on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${usp.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`} />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <usp.icon size={22} className="text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-2">{usp.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{usp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center font-body text-sm text-muted-foreground mt-12"
        >
          Instead of 10 disconnected tools → <strong className="text-foreground">one structured navigation system.</strong>
        </motion.p>
      </div>
    </section>
  );
};

export default USPsSection;
