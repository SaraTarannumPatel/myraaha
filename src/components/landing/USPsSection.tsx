import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Rocket, Brain, Shuffle, Users, Globe, Bot,
  Lightbulb, BarChart3, Link2, Handshake, Eye,
  Coins, BookOpen, Heart, Sparkles,
  Route, Fingerprint, Gamepad2, Wrench, FileText,
  GraduationCap, Network, Activity, MessageCircle,
} from "lucide-react";

const iconColors = [
  "bg-primary", "bg-blue", "bg-terracotta", "bg-indigo", "bg-maroon",
  "bg-primary", "bg-blue", "bg-terracotta", "bg-indigo", "bg-maroon",
  "bg-primary", "bg-blue", "bg-terracotta", "bg-indigo", "bg-maroon",
];

const borderColors = [
  "hover:border-primary/30", "hover:border-blue/30", "hover:border-terracotta/30", "hover:border-indigo/30", "hover:border-maroon/30",
  "hover:border-primary/30", "hover:border-blue/30", "hover:border-terracotta/30", "hover:border-indigo/30", "hover:border-maroon/30",
  "hover:border-primary/30", "hover:border-blue/30", "hover:border-terracotta/30", "hover:border-indigo/30", "hover:border-maroon/30",
];

const careerUSPs = [
  { icon: Route, title: "End-to-End Journey", desc: "From class 8 to first job — no resets, no confusion, just guided growth." },
  { icon: Fingerprint, title: "Identity over Aptitude", desc: "Storytelling, creativity, and behavior tracking — not generic tests." },
  { icon: Gamepad2, title: "Built for Gen Z & Alpha", desc: "Gamified, visual, swipe-first UX that actually feels native." },
  { icon: Wrench, title: "Real-World Learning", desc: "Actual industry tools and problems — not textbook fluff." },
  { icon: Globe, title: "Inclusive by Design", desc: "Especially for Tier 3, 4, and rural India — where students are invisible." },
  { icon: FileText, title: "Living Resume", desc: "Every choice and project gets logged automatically — recruiter-ready." },
  { icon: Bot, title: "AI That Actually Knows You", desc: "A career compass in your pocket that truly understands your patterns." },
  { icon: GraduationCap, title: "Hands-On Industry Training", desc: "Projects, tools, and challenges tied to current market demands." },
  { icon: Network, title: "Powerful Domain Mentorship", desc: "Real professionals, real networks — no gatekeeping." },
  { icon: Link2, title: "Demand–Supply System", desc: "A niche-focused bridge between skill creators and skill seekers." },
  { icon: Activity, title: "Dynamic SelfGraph™", desc: "A continuously evolving identity layer — not a one-time personality quiz." },
  { icon: MessageCircle, title: "AI Career Therapist", desc: "An empathetic counselor who guides you out of confusion, not into more of it." },
];

const entrepreneurUSPs = [
  { icon: Rocket, title: "End-to-End Foundership", desc: "From first spark to funded venture — discovery, validation, building, and launch." },
  { icon: Brain, title: "Mindset Over Buzz", desc: "Helps you think like a founder before acting like one — mindset precedes movement." },
  { icon: Shuffle, title: "Hybrid Entrepreneurship", desc: "Startup, freelance, or side hustle — MyRaaha adapts to your path." },
  { icon: Users, title: "Community-Led Growth", desc: "Founders collaborate, co-create, and celebrate wins — not compete." },
  { icon: Globe, title: "Inclusive by Design", desc: "Built for Tier 3, 4, and rural dreamers who never had incubator access." },
  { icon: Bot, title: "AI Co-Founder", desc: "An emotionally intelligent AI that guides, challenges, and comforts — 24/7." },
  { icon: Lightbulb, title: "Idea-to-Market Made Simple", desc: "MVP Builders & validation sprints turn concepts into real products fast." },
  { icon: BarChart3, title: "SelfGraph™ for Founders", desc: "Tracks resilience, leadership style, and energy zones as you grow." },
  { icon: Link2, title: "Demand–Supply System", desc: "A marketplace connecting founders, freelancers, and companies in real time." },
  { icon: Handshake, title: "Industry Collaboration", desc: "Work on real market problems — gain credibility, clients, and investors." },
  { icon: Eye, title: "Progress Tracker", desc: "A live timeline showing your startup journey — transparent and trust-building." },
  { icon: Coins, title: "Funding, Simplified", desc: "The right opportunities reach the right founders — no pitch loops or gatekeeping." },
  { icon: BookOpen, title: "Learning That Builds Founders", desc: "Practical, hands-on skill capsules and simulations — no jargon, just execution." },
  { icon: Heart, title: "Emotional Sustainability", desc: "Journaling, reflection, and AI therapy — mental resilience is built in, not bolted on." },
  { icon: Sparkles, title: "Built for Now & Future", desc: "From school dreamers to professionals pivoting — everyone gets space to create." },
];

const USPsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeTab, setActiveTab] = useState<"career" | "entrepreneurship">("career");

  const usps = activeTab === "career" ? careerUSPs : entrepreneurUSPs;

  return (
    <section ref={ref} className="py-20 sm:py-28 md:py-36 bg-background-alt relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] bg-gradient-to-br from-blue/5 via-accent/5 to-terracotta/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-maroon font-semibold mb-3"
          >
            What Makes MyRaaha Hit Different
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight"
          >
            Not information. Not courses.
            <br />
            A <em className="text-gradient-milestone">decision operating system.</em>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15 }}
          className="flex justify-center gap-2 mb-10 sm:mb-14"
        >
          {(["career", "entrepreneurship"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-body text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-full border transition-all duration-300 ${
                activeTab === tab
                  ? activeTab === "career"
                    ? "bg-blue text-white border-blue shadow-sm"
                    : "bg-terracotta text-white border-terracotta shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "career" ? "Jobs & Careers" : "Entrepreneurship"}
            </button>
          ))}
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {usps.map((usp, i) => (
            <motion.div
              key={`${activeTab}-${usp.title}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className={`group bg-card rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-border shadow-soft hover:shadow-card ${borderColors[i % borderColors.length]} transition-all duration-500 relative overflow-hidden`}
            >
              <div className="relative z-10">
                <div className={`w-10 sm:w-11 h-10 sm:h-11 rounded-xl sm:rounded-2xl ${iconColors[i % iconColors.length]} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <usp.icon size={18} className="text-white" />
                </div>
                <h3 className="font-display text-base sm:text-lg text-foreground mb-1.5">{usp.title}</h3>
                <p className="font-body text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{usp.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center font-body text-xs sm:text-sm text-muted-foreground mt-10 sm:mt-12"
        >
          Instead of 10 disconnected tools → <strong className="text-foreground">one structured navigation system. that's the whole vibe.</strong>
        </motion.p>
      </div>
    </section>
  );
};

export default USPsSection;
