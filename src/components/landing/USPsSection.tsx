import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Filter, BarChart3, TrendingUp, Brain, RefreshCw, Link2,
} from "lucide-react";

const usps = [
  { icon: Filter, title: "Filtering Noise", description: "Instead of 200 careers or ideas, MyRaaha narrows options responsibly based on your real data." },
  { icon: BarChart3, title: "Ranking Responsibly", description: "Every path shows required skills, market demand, income realities, effort needed, and risk level." },
  { icon: TrendingUp, title: "Showing Trade-offs", description: "Time-to-readiness estimates, effort vs reward comparisons, and income-risk analysis." },
  { icon: Brain, title: "Auto Tracking Growth", description: "Your dynamic identity model evolves continuously — aptitude, attitude, and articulation." },
  { icon: RefreshCw, title: "No Resets Needed", description: "The system remembers your history. Adjusts when you shift, fall behind, or markets change." },
  { icon: Link2, title: "Skill → Outcome", description: "Connects learning directly to jobs, validation, and real opportunities. No random course hopping." },
];

const USPsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 sm:py-28 md:py-36 bg-background-alt relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-blue font-semibold mb-3"
          >
            What Makes MyRaaha Different
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight"
          >
            Not information. Not courses.
            <br />
            A <em className="text-gradient-warm">decision operating system.</em>
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {usps.map((usp, i) => (
            <motion.div
              key={usp.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="group bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-border shadow-soft hover:shadow-card transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              
              <div className="relative z-10">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl gradient-warm flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                  <usp.icon size={18} className="text-primary-foreground sm:w-[22px] sm:h-[22px]" />
                </div>
                <h3 className="font-display text-lg sm:text-xl text-foreground mb-2">{usp.title}</h3>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">{usp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center font-body text-xs sm:text-sm text-grey-label mt-10 sm:mt-12"
        >
          Instead of 10 disconnected tools → <strong className="text-foreground">one structured navigation system.</strong>
        </motion.p>
      </div>
    </section>
  );
};

export default USPsSection;