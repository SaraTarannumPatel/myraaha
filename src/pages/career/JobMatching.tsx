import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Briefcase, Search, MapPin, Clock, Star, ExternalLink, Bookmark } from "lucide-react";

const mockJobs = [
  { id: "1", title: "Junior Frontend Developer", company: "TechStart Inc.", location: "Remote", type: "Internship", fit: 92, skills: ["React", "TypeScript", "CSS"], posted: "2d ago" },
  { id: "2", title: "Data Analyst Intern", company: "DataCo", location: "Bengaluru", type: "Internship", fit: 85, skills: ["Python", "SQL", "Excel"], posted: "1d ago" },
  { id: "3", title: "UX Design Apprentice", company: "DesignLab", location: "Remote", type: "Part-time", fit: 78, skills: ["Figma", "Research", "Prototyping"], posted: "3d ago" },
  { id: "4", title: "Marketing Associate", company: "GrowthHub", location: "Mumbai", type: "Full-time", fit: 71, skills: ["Content", "Analytics", "SEO"], posted: "5d ago" },
  { id: "5", title: "Product Management Fellow", company: "BuildIt", location: "Hybrid", type: "Fellowship", fit: 88, skills: ["Strategy", "Analytics", "Communication"], posted: "1d ago" },
  { id: "6", title: "Full-Stack Developer", company: "CodeCraft", location: "Remote", type: "Full-time", fit: 65, skills: ["Node.js", "React", "MongoDB"], posted: "4d ago" },
];

const JobMatching = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const types = ["all", "Internship", "Full-time", "Part-time", "Fellowship"];

  const filtered = mockJobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || j.type === typeFilter;
    return matchSearch && matchType;
  }).sort((a, b) => b.fit - a.fit);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Briefcase size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Job Matching & Career Explorer</h1>
            <p className="font-body text-sm text-muted-foreground">Find opportunities tailored to your journey, skills, and aspirations.</p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search roles, companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-full font-body text-xs capitalize transition-all ${typeFilter === t ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((job, i) => (
          <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display text-xl text-foreground">{job.title}</h3>
                  <div className={`px-2 py-0.5 rounded-full font-body text-[10px] font-semibold ${job.fit >= 80 ? "bg-green-100 text-green-700" : job.fit >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {job.fit}% Fit
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground">{job.company}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><MapPin size={12} /> {job.location}</span>
                  <span className="flex items-center gap-1 font-body text-xs text-muted-foreground"><Clock size={12} /> {job.posted}</span>
                  <span className="px-2 py-0.5 rounded bg-muted font-body text-[10px] text-muted-foreground">{job.type}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {job.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-body text-[10px]">{s}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSaved(prev => { const n = new Set(prev); n.has(job.id) ? n.delete(job.id) : n.add(job.id); return n; }); }}>
                  <Bookmark size={18} className={saved.has(job.id) ? "text-accent fill-accent" : "text-muted-foreground"} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" className="gradient-warm text-secondary-foreground font-body text-xs" onClick={() => toast.success("Application submitted!")}>Apply Now</Button>
              <Button size="sm" variant="outline" className="font-body text-xs">View Details</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JobMatching;
