import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Globe, Users, MessageCircle, UserPlus, Flame, Heart } from "lucide-react";

const communities = [
  { id: "1", name: "EdTech Founders", members: 52, topic: "EdTech", activity: "Very Active", description: "Building the future of education together." },
  { id: "2", name: "Social Impact Hub", members: 38, topic: "Social Impact", activity: "Active", description: "Startups solving real-world problems for communities." },
  { id: "3", name: "FinTech Explorers", members: 29, topic: "FinTech", activity: "Active", description: "Innovating financial access and literacy." },
  { id: "4", name: "First-Time Founders", members: 67, topic: "General", activity: "Very Active", description: "A safe space for new entrepreneurs to learn and grow." },
  { id: "5", name: "AI & Automation", members: 41, topic: "AI", activity: "Very Active", description: "Exploring AI-driven products and services." },
  { id: "6", name: "Creative Entrepreneurs", members: 23, topic: "Creative", activity: "Moderate", description: "Art, design, and content-driven ventures." },
];

const StartupCommunities = () => {
  const [joined, setJoined] = useState<Set<string>>(new Set());

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Globe size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Startup Communities</h1>
            <p className="font-body text-sm text-muted-foreground">You're not alone in this journey. Connect, share, and grow with other founders.</p>
          </div>
        </div>
      </motion.div>

      {/* Emotional Support Spaces */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-3 flex items-center gap-2"><Heart size={18} className="text-accent" /> Safe Spaces</h2>
        <p className="font-body text-sm text-muted-foreground mb-4">Confidential spaces to discuss stress, anxiety, or doubt with peers who understand.</p>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg bg-accent/10 text-accent font-body text-xs hover:bg-accent/20 transition-all">Founder Burnout Circle</button>
          <button className="px-4 py-2 rounded-lg bg-accent/10 text-accent font-body text-xs hover:bg-accent/20 transition-all">Imposter Syndrome Support</button>
          <button className="px-4 py-2 rounded-lg bg-accent/10 text-accent font-body text-xs hover:bg-accent/20 transition-all">Decision Fatigue Group</button>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {communities.map((community, i) => (
          <motion.div key={community.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display text-lg text-foreground">{community.name}</h3>
                <span className="font-body text-[10px] text-accent">{community.activity}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-muted font-body text-[10px] text-muted-foreground">{community.topic}</span>
            </div>
            <p className="font-body text-sm text-muted-foreground mb-3">{community.description}</p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Users size={12} /> {community.members} members</span>
              {joined.has(community.id) ? (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent font-body text-xs"><MessageCircle size={12} /> Joined</span>
              ) : (
                <Button onClick={() => { setJoined(prev => new Set(prev).add(community.id)); toast.success("Welcome to the community!"); }} size="sm" variant="outline" className="font-body text-xs"><UserPlus size={14} /> Join</Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StartupCommunities;
