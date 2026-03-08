import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileText, Plus, Briefcase, GraduationCap, Award, X, Sparkles } from "lucide-react";

const LivingResume = () => {
  const { user, profile } = useAuth();
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [showAddExp, setShowAddExp] = useState(false);
  const [expForm, setExpForm] = useState({ title: "", organization: "", experience_type: "work", description: "", is_current: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [expRes, projRes, skillRes] = await Promise.all([
      supabase.from("experiences").select("*").eq("user_id", user!.id).order("start_date", { ascending: false }),
      supabase.from("projects").select("*").eq("user_id", user!.id).eq("intent", "career").order("created_at", { ascending: false }),
      supabase.from("skills").select("*").eq("user_id", user!.id).order("proficiency", { ascending: false }),
    ]);
    setExperiences(expRes.data || []);
    setProjects(projRes.data || []);
    setSkills(skillRes.data || []);
    setLoading(false);
  };

  const addExperience = async () => {
    if (!expForm.title.trim()) return;
    const { error } = await supabase.from("experiences").insert({
      user_id: user!.id,
      ...expForm,
    });
    if (error) { toast.error("Failed to add experience"); return; }
    setExpForm({ title: "", organization: "", experience_type: "work", description: "", is_current: false });
    setShowAddExp(false);
    fetchAll();
    toast.success("Experience added!");
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "work": return <Briefcase size={16} className="text-accent" />;
      case "education": return <GraduationCap size={16} className="text-accent" />;
      default: return <Award size={16} className="text-accent" />;
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <FileText size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Living Resume</h1>
            <p className="font-body text-sm text-muted-foreground">Auto-tracks your journey — experiences, projects, and skills</p>
          </div>
        </div>
      </motion.div>

      {/* Profile Summary */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full gradient-warm flex items-center justify-center text-secondary-foreground font-display text-2xl">
            {profile?.full_name?.charAt(0) || "?"}
          </div>
          <div>
            <h2 className="font-display text-2xl text-foreground">{profile?.full_name || "Your Name"}</h2>
            <p className="font-body text-sm text-muted-foreground">{profile?.bio || "Add a bio in settings"}</p>
            <div className="flex gap-4 mt-3 font-body text-sm text-muted-foreground">
              <span>{experiences.length} experiences</span>
              <span>{projects.length} projects</span>
              <span>{skills.length} skills</span>
            </div>
          </div>
        </div>
      </div>

      {/* Experiences */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-foreground">Experiences</h2>
          <Button onClick={() => setShowAddExp(!showAddExp)} variant="outline" size="sm">
            <Plus size={16} /> Add
          </Button>
        </div>

        {showAddExp && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4 p-4 bg-muted/50 rounded-lg space-y-3">
            <select
              value={expForm.experience_type}
              onChange={(e) => setExpForm({ ...expForm, experience_type: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
            >
              <option value="work">Work</option>
              <option value="education">Education</option>
              <option value="volunteer">Volunteer</option>
              <option value="project">Project</option>
            </select>
            <Input placeholder="Title / Role" value={expForm.title} onChange={(e) => setExpForm({ ...expForm, title: e.target.value })} />
            <Input placeholder="Organization" value={expForm.organization} onChange={(e) => setExpForm({ ...expForm, organization: e.target.value })} />
            <Textarea placeholder="Description" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} rows={3} />
            <div className="flex gap-2">
              <Button onClick={addExperience} className="gradient-warm text-secondary-foreground" size="sm">Save</Button>
              <Button onClick={() => setShowAddExp(false)} variant="ghost" size="sm">Cancel</Button>
            </div>
          </motion.div>
        )}

        {experiences.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground text-center py-4">No experiences yet</p>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div key={exp.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                {typeIcon(exp.experience_type)}
                <div>
                  <p className="font-body text-sm font-medium text-foreground">{exp.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{exp.organization}</p>
                  {exp.description && <p className="font-body text-xs text-muted-foreground mt-1">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-display text-xl text-foreground mb-4">Top Skills</h2>
        {skills.length === 0 ? (
          <p className="font-body text-sm text-muted-foreground text-center py-4">Add skills in SelfGraph™</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 20).map((skill) => (
              <span key={skill.id} className="px-3 py-1.5 rounded-full bg-accent/10 text-accent font-body text-xs font-medium">
                {skill.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LivingResume;
