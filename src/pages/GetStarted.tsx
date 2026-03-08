import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Rocket, Sparkles, ArrowRight } from "lucide-react";

const pathOptions = [
  {
    value: "career",
    icon: Briefcase,
    title: "Explore Career & Jobs",
    description: "For students, professionals, and career transitioners. Discover your ideal career path, build skills, create a Living Resume, and connect with opportunities.",
    color: "border-blue/30 hover:border-blue/50",
    iconBg: "bg-blue/10 group-hover:bg-blue",
    iconColor: "text-blue group-hover:text-primary-foreground",
    arrowColor: "group-hover:text-blue",
  },
  {
    value: "entrepreneurship",
    icon: Rocket,
    title: "Explore Entrepreneurship & Freelancing",
    description: "For aspiring founders, freelancers, and innovators. Spark startup ideas, validate them, build MVPs, and grow your founder identity.",
    color: "border-terracotta/30 hover:border-terracotta/50",
    iconBg: "bg-terracotta/10 group-hover:bg-terracotta",
    iconColor: "text-terracotta group-hover:text-primary-foreground",
    arrowColor: "group-hover:text-terracotta",
  },
  {
    value: "both",
    icon: Sparkles,
    title: "Explore Both",
    description: "For users wanting to pursue both simultaneously. Discover how your career skills can fuel a venture, and how entrepreneurial thinking can accelerate your career.",
    color: "border-indigo/30 hover:border-indigo/50",
    iconBg: "bg-indigo/10 group-hover:bg-indigo",
    iconColor: "text-indigo group-hover:text-primary-foreground",
    arrowColor: "group-hover:text-indigo",
  },
];

const GetStarted = () => {
  const navigate = useNavigate();

  const handleSelect = (path: string) => {
    localStorage.setItem("shuttlex_initial_path", path);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl w-full text-center space-y-10"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="w-20 h-20 gradient-warm rounded-2xl mx-auto flex items-center justify-center shadow-accent"
          >
            <Sparkles className="text-primary-foreground" size={36} />
          </motion.div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mt-6">
            Welcome to <em className="text-gradient-warm">ShuttlEx</em>
          </h1>
          <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
            Where your career growth and startup journey meet. Let's help you explore what you love and build what you dream.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6">
          {pathOptions.map((option, i) => (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12 }}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left p-6 rounded-xl border-2 bg-card hover:shadow-soft transition-all flex items-start gap-4 group ${option.color}`}
            >
              <div className={`p-3 rounded-lg transition-all ${option.iconBg}`}>
                <option.icon size={24} className={`transition-colors ${option.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-foreground flex items-center gap-2">
                  {option.title}
                  <ArrowRight size={16} className={`text-muted-foreground group-hover:translate-x-1 transition-all ${option.arrowColor}`} />
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-1">{option.description}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="font-body text-xs text-muted-foreground">
          You can always switch between paths later without losing progress.
        </p>
      </motion.div>
    </div>
  );
};

export default GetStarted;
