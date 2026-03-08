import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import {
  Compass, Map, Brain, FileText, Sparkles, Lightbulb, Wrench, User, Zap, Rocket,
  ArrowRight, TrendingUp, Target, Clock
} from "lucide-react";

const careerQuickActions = [
  { label: "Curiosity Compass", icon: Compass, path: "/dashboard/curiosity-compass", color: "bg-accent/10 text-accent" },
  { label: "AI Roadmap", icon: Map, path: "/dashboard/roadmap", color: "bg-primary/10 text-primary" },
  { label: "SelfGraph™", icon: Brain, path: "/dashboard/selfgraph", color: "bg-accent/10 text-accent" },
  { label: "Living Resume", icon: FileText, path: "/dashboard/living-resume", color: "bg-primary/10 text-primary" },
  { label: "Explore", icon: Sparkles, path: "/dashboard/explore", color: "bg-accent/10 text-accent" },
];

const entrepreneurshipQuickActions = [
  { label: "Startup Sparks", icon: Lightbulb, path: "/dashboard/startup-sparks", color: "bg-accent/10 text-accent" },
  { label: "MVP Builder", icon: Wrench, path: "/dashboard/mvp-builder", color: "bg-primary/10 text-primary" },
  { label: "Founder Profile", icon: User, path: "/dashboard/founder-profile", color: "bg-accent/10 text-accent" },
  { label: "Mindset Builder", icon: Zap, path: "/dashboard/mindset-builder", color: "bg-primary/10 text-primary" },
  { label: "Startup Lab", icon: Rocket, path: "/dashboard/startup-lab", color: "bg-accent/10 text-accent" },
];

const Dashboard = () => {
  const { profile } = useAuth();
  const isCareer = profile?.active_intent === "career";
  const quickActions = isCareer ? careerQuickActions : entrepreneurshipQuickActions;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="font-display text-3xl md:text-4xl text-foreground">
          {greeting()}, <em className="text-gradient-warm">{profile?.full_name || "Explorer"}</em>
        </h1>
        <p className="font-body text-muted-foreground">
          {isCareer ? "Your career journey awaits." : "Your startup journey awaits."}
        </p>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-soft"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Your Progress</h2>
          <span className="font-body text-sm text-accent font-semibold">{profile?.completion_percentage || 0}%</span>
        </div>
        <Progress value={profile?.completion_percentage || 0} className="h-2" />
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-1">
              <Target size={18} className="text-accent" />
            </div>
            <p className="font-body text-xs text-muted-foreground">Goals Set</p>
            <p className="font-display text-lg text-foreground">0</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1">
              <TrendingUp size={18} className="text-primary" />
            </div>
            <p className="font-body text-xs text-muted-foreground">Skills</p>
            <p className="font-display text-lg text-foreground">0</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mx-auto mb-1">
              <Clock size={18} className="text-accent" />
            </div>
            <p className="font-body text-xs text-muted-foreground">Streak</p>
            <p className="font-display text-lg text-foreground">0 days</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-display text-xl text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link
                to={action.path}
                className="group flex flex-col items-center p-5 bg-card rounded-xl border border-border hover:border-accent/30 hover:shadow-soft transition-all text-center"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${action.color}`}>
                  <action.icon size={22} />
                </div>
                <span className="font-body text-sm text-foreground font-medium">{action.label}</span>
                <ArrowRight size={14} className="text-muted-foreground mt-2 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <Sparkles className="mx-auto text-muted-foreground mb-3" size={32} />
          <p className="font-body text-muted-foreground">Start exploring to see your activity here!</p>
          <Link
            to={isCareer ? "/dashboard/curiosity-compass" : "/dashboard/startup-sparks"}
            className="inline-flex items-center gap-2 mt-4 font-body text-sm text-accent font-semibold hover:underline"
          >
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
