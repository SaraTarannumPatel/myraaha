import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UserCheck, Search, Star, MessageSquare, Calendar, Filter } from "lucide-react";

const mockMentors = [
  { id: "1", name: "Dr. Sarah Chen", expertise: ["AI/ML", "Data Science"], bio: "10+ years in machine learning research. Loves helping newcomers.", availability: "Weekly", rating: 4.9, focus: "career" },
  { id: "2", name: "Raj Patel", expertise: ["Product Management", "Startups"], bio: "Ex-Google PM, now advising early-stage startups.", availability: "Bi-weekly", rating: 4.8, focus: "both" },
  { id: "3", name: "Maya Johnson", expertise: ["UX Design", "Research"], bio: "Design leader passionate about mentoring the next generation.", availability: "Monthly", rating: 4.7, focus: "career" },
  { id: "4", name: "Alex Kim", expertise: ["Full-Stack Dev", "Cloud"], bio: "CTO at a Series B startup. Open to mentoring aspiring engineers.", availability: "Weekly", rating: 4.9, focus: "career" },
  { id: "5", name: "Priya Sharma", expertise: ["Marketing", "Growth"], bio: "Growth marketer who scaled 3 startups from 0 to 1M users.", availability: "Bi-weekly", rating: 4.6, focus: "both" },
  { id: "6", name: "Tom Roberts", expertise: ["Finance", "Fundraising"], bio: "Angel investor and CFO mentor for early-stage founders.", availability: "Monthly", rating: 4.8, focus: "entrepreneurship" },
];

const MentorMatchmaking = () => {
  const { profile } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [requested, setRequested] = useState<Set<string>>(new Set());

  const filtered = mockMentors.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.expertise.some(e => e.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "all" || m.focus === filter || m.focus === "both";
    return matchSearch && matchFilter;
  });

  const requestMentor = (id: string) => {
    setRequested(prev => new Set(prev).add(id));
    toast.success("Mentorship request sent! You'll be notified when they respond.");
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <UserCheck size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Mentor Matchmaking</h1>
            <p className="font-body text-sm text-muted-foreground">Get guidance from experts who understand your journey.</p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or expertise..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {["all", "career", "entrepreneurship"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full font-body text-xs capitalize transition-all ${filter === f ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((mentor, i) => (
          <motion.div key={mentor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full gradient-warm flex items-center justify-center text-secondary-foreground font-display text-xl flex-shrink-0">
                {mentor.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg text-foreground">{mentor.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-accent fill-accent" />
                    <span className="font-body text-xs text-accent">{mentor.rating}</span>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground mt-1">{mentor.bio}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {mentor.expertise.map(e => (
                    <span key={e} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px]">{e}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <span className="flex items-center gap-1 font-body text-xs text-muted-foreground">
                    <Calendar size={12} /> {mentor.availability}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  {requested.has(mentor.id) ? (
                    <span className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent font-body text-xs">Request Sent ✓</span>
                  ) : (
                    <Button onClick={() => requestMentor(mentor.id)} size="sm" variant="outline" className="font-body text-xs">
                      <MessageSquare size={14} /> Request Mentorship
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MentorMatchmaking;
