import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Briefcase, Rocket, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CareerDashboard from "./CareerDashboard";
import EntrepreneurshipDashboard from "./entrepreneurship/EntrepreneurshipDashboard";

const BothDashboard = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("career");

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* Hybrid Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full bg-primary/10 font-body text-xs text-primary font-semibold inline-flex items-center gap-1.5">
            <Sparkles size={12} /> Hybrid Path
          </div>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground">
          {greeting()}, <em className="text-primary">{profile?.full_name || "Explorer"}</em>
        </h1>
        <p className="font-body text-muted-foreground">
          Your career and startup journeys in one place. Switch between views anytime.
        </p>
      </motion.div>

      {/* Cross-path Insight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Sparkles size={18} className="text-primary mt-0.5" />
          <div>
            <h3 className="font-display text-sm text-foreground">Cross-Path Insight</h3>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Your career skills and startup interests overlap in multiple areas. Explore how your professional expertise can fuel your entrepreneurial ideas — and vice versa.
            </p>
            <div className="flex gap-2 mt-2">
              <Link to="/dashboard/curiosity-compass" className="font-body text-xs text-primary hover:underline inline-flex items-center gap-1">
                Career Compass <ArrowRight size={10} />
              </Link>
              <Link to="/dashboard/startup-sparks" className="font-body text-xs text-primary hover:underline inline-flex items-center gap-1">
                Startup Sparks <ArrowRight size={10} />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toggle Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-xs">
          <TabsTrigger value="career" className="flex items-center gap-1.5">
            <Briefcase size={14} /> Career
          </TabsTrigger>
          <TabsTrigger value="entrepreneurship" className="flex items-center gap-1.5">
            <Rocket size={14} /> Startup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="career">
          <CareerDashboard />
        </TabsContent>

        <TabsContent value="entrepreneurship">
          <EntrepreneurshipDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BothDashboard;
