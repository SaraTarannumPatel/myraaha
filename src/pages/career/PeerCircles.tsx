import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Users, MessageCircle, Trophy, Flame, UserPlus } from "lucide-react";

const mockCircles = [
  { id: "1", name: "Frontend Enthusiasts", members: 45, topic: "Web Development", activity: "Active", description: "Discuss React, Vue, and modern frontend patterns." },
  { id: "2", name: "Data Science Explorers", members: 32, topic: "Data Science", activity: "Very Active", description: "Learn ML, statistics, and data visualization together." },
  { id: "3", name: "Career Changers Hub", members: 28, topic: "Career Transition", activity: "Active", description: "Supporting each other through career pivots." },
  { id: "4", name: "Design Thinkers", members: 19, topic: "UX/UI Design", activity: "Moderate", description: "Share design work, get feedback, grow together." },
  { id: "5", name: "Leadership Lab", members: 15, topic: "Leadership", activity: "Active", description: "Building leadership skills through peer challenges." },
  { id: "6", name: "Startup Founders Circle", members: 38, topic: "Entrepreneurship", activity: "Very Active", description: "Share startup challenges and celebrate wins." },
];

const PeerCircles = () => {
  const [joined, setJoined] = useState<Set<string>>(new Set());

  const joinCircle = (id: string) => {
    setJoined(prev => new Set(prev).add(id));
    toast.success("You've joined the circle! Welcome aboard.");
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Users size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Peer Circles</h1>
            <p className="font-body text-sm text-muted-foreground">Join learning circles where peers like you grow together.</p>
          </div>
        </div>
      </motion.div>

      {/* Inspire Wall */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2"><Flame size={18} className="text-accent" /> Inspire Wall</h2>
        <div className="space-y-3">
          {["🎉 Sarah completed her first ML project!", "💡 Raj shared a great article on product thinking", "🏆 Design Thinkers circle completed 50 challenges!"].map((post, i) => (
            <div key={i} className="p-3 rounded-lg bg-muted/50 font-body text-sm text-foreground">{post}</div>
          ))}
        </div>
      </div>

      {/* Circles Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {mockCircles.map((circle, i) => (
          <motion.div key={circle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display text-lg text-foreground">{circle.name}</h3>
                <span className="font-body text-[10px] text-accent">{circle.activity}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-muted font-body text-[10px] text-muted-foreground">{circle.topic}</span>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-3">{circle.description}</p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                <Users size={12} /> {circle.members} members
              </span>
              {joined.has(circle.id) ? (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent font-body text-xs">
                  <MessageCircle size={12} /> Joined
                </span>
              ) : (
                <Button onClick={() => joinCircle(circle.id)} size="sm" variant="outline" className="font-body text-xs">
                  <UserPlus size={14} /> Join
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PeerCircles;
