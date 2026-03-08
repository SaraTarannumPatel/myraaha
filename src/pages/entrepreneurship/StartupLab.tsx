import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, Sparkles, Lock } from "lucide-react";

const labModules = [
  { title: "Idea Validation Lab", description: "Test your idea with real users and data", minCompletion: 10 },
  { title: "Business Model Canvas", description: "Map out your revenue, costs, and value proposition", minCompletion: 20 },
  { title: "Customer Discovery", description: "Interview potential customers and find product-market fit", minCompletion: 30 },
  { title: "Pitch Deck Builder", description: "Create a compelling pitch deck for investors", minCompletion: 40 },
  { title: "Financial Projections", description: "Build basic financial models for your startup", minCompletion: 50 },
  { title: "Go-to-Market Strategy", description: "Plan your launch and growth strategy", minCompletion: 60 },
  { title: "Mentor Matchmaking", description: "Connect with experienced founders and mentors", minCompletion: 70 },
  { title: "Fundraising Simulation", description: "Practice pitching and learn about funding", minCompletion: 80 },
  { title: "Team Building", description: "Find co-founders and build your founding team", minCompletion: 90 },
  { title: "Launch Readiness", description: "Final checklist before going live", minCompletion: 100 },
];

const StartupLab = () => {
  const { profile } = useAuth();
  const completion = profile?.completion_percentage || 0;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Rocket size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Startup Creation Lab</h1>
            <p className="font-body text-sm text-muted-foreground">Progressive modules that unlock as you grow</p>
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-foreground">Your Progress</h2>
          <span className="font-body text-sm text-accent font-semibold">{completion}% complete</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="h-full gradient-warm rounded-full transition-all" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {/* Modules */}
      <div className="grid gap-4">
        {labModules.map((mod, i) => {
          const unlocked = completion >= mod.minCompletion;
          return (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-card rounded-xl border p-5 transition-all ${
                unlocked ? "border-border hover:border-accent/30 hover:shadow-soft cursor-pointer" : "border-border opacity-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  unlocked ? "gradient-warm" : "bg-muted"
                }`}>
                  {unlocked ? (
                    <span className="text-secondary-foreground font-body text-sm font-bold">{i + 1}</span>
                  ) : (
                    <Lock size={16} className="text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg text-foreground">{mod.title}</h3>
                    {!unlocked && (
                      <span className="font-body text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Unlocks at {mod.minCompletion}%
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-muted-foreground mt-1">{mod.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StartupLab;
