import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  FileText, Plus, Briefcase, GraduationCap, Award, X, Sparkles, 
  Download, Share2, Target, TrendingUp, Brain, Users, BookOpen,
  CheckCircle2, Clock, Star, Lightbulb, ArrowRight, Eye, RefreshCw
} from "lucide-react";

const LivingResume = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Data states
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [learningProgress, setLearningProgress] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [skillFitAnalysis, setSkillFitAnalysis] = useState<any[]>([]);
  const [decisionActions, setDecisionActions] = useState<any[]>([]);
  
  // AI insights
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [eligibleOpportunities, setEligibleOpportunities] = useState<any[]>([]);
  const [decisionMirror, setDecisionMirror] = useState<any>(null);
  
  // Form states
  const [showAddExp, setShowAddExp] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [expForm, setExpForm] = useState({ title: "", organization: "", experience_type: "work", description: "", is_current: false });
  const [skillForm, setSkillForm] = useState({ name: "", category: "technical", proficiency: 3 });

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [expRes, projRes, skillRes, achRes, journalRes, progressRes, interestRes, connRes, fitRes, decisionRes] = await Promise.all([
        supabase.from("experiences").select("*").eq("user_id", user!.id).order("start_date", { ascending: false }),
        supabase.from("projects").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("skills").select("*").eq("user_id", user!.id).order("proficiency", { ascending: false }),
        supabase.from("achievements").select("*").eq("user_id", user!.id).order("earned_at", { ascending: false }),
        supabase.from("journal_entries").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("user_learning_progress").select("*, learning_tracks(title, category)").eq("user_id", user!.id),
        supabase.from("interests").select("*").eq("user_id", user!.id),
        supabase.from("connections").select("*").or(`requester_id.eq.${user!.id},receiver_id.eq.${user!.id}`).eq("status", "accepted"),
        supabase.from("skill_fit_analysis").select("*").eq("user_id", user!.id).order("match_score", { ascending: false }),
        supabase.from("decision_actions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }),
      ]);

      setExperiences(expRes.data || []);
      setProjects(projRes.data || []);
      setSkills(skillRes.data || []);
      setAchievements(achRes.data || []);
      setJournalEntries(journalRes.data || []);
      setLearningProgress(progressRes.data || []);
      setInterests(interestRes.data || []);
      setConnections(connRes.data || []);
      setSkillFitAnalysis(fitRes.data || []);
      setDecisionActions(decisionRes.data || []);
    } catch (error) {
      console.error("Error fetching resume data:", error);
      toast.error("Failed to load resume data");
    }
    setLoading(false);
  };

  const generateAIInsights = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("living-resume-ai", {
        body: {
          type: "generate_insights",
          data: {
            profile,
            skills,
            experiences,
            projects,
            achievements,
            learningProgress,
            journalEntries,
          },
        },
      });

      if (error) throw error;
      setAiInsights(data.data);
      toast.success("AI insights generated!");
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate AI insights");
    }
    setAiLoading(false);
  };

  const generateSkillFitAnalysis = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("living-resume-ai", {
        body: {
          type: "skill_fit_analysis",
          data: {
            skills,
            experiences,
            interests,
            goals: profile?.short_term_goals,
          },
        },
      });

      if (error) throw error;
      
      // Store analyses in database
      if (data.data?.analyses) {
        for (const analysis of data.data.analyses) {
          await supabase.from("skill_fit_analysis").upsert({
            user_id: user!.id,
            role_type: analysis.role_type,
            role_name: analysis.role_name,
            match_score: analysis.match_score,
            skills_matched: analysis.skills_matched,
            skills_missing: analysis.skills_missing,
            recommendations: analysis.recommendations,
            is_eligible: analysis.is_eligible,
          }, { onConflict: "user_id,role_name" });
        }
        setSkillFitAnalysis(data.data.analyses);
      }
      
      toast.success("Skill fit analysis complete!");
    } catch (error) {
      console.error("Error analyzing skill fit:", error);
      toast.error("Failed to analyze skill fit");
    }
    setAiLoading(false);
  };

  const generateDecisionMirror = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("living-resume-ai", {
        body: {
          type: "decision_mirror",
          data: {
            actions: decisionActions,
            experiences,
            projects,
            skills,
            moodPatterns: journalEntries.map(j => ({ mood: j.mood, date: j.created_at })),
          },
        },
      });

      if (error) throw error;
      setDecisionMirror(data.data);
      toast.success("Decision mirror generated!");
    } catch (error) {
      console.error("Error generating decision mirror:", error);
      toast.error("Failed to generate decision mirror");
    }
    setAiLoading(false);
  };

  const findEligibleOpportunities = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("living-resume-ai", {
        body: {
          type: "eligible_opportunities",
          data: {
            skills,
            experienceLevel: profile?.career_stage || "entry",
            interests,
            domains: interests.map(i => i.category),
            location: profile?.location,
          },
        },
      });

      if (error) throw error;
      setEligibleOpportunities(data.data?.opportunities || []);
      toast.success("Found eligible opportunities!");
    } catch (error) {
      console.error("Error finding opportunities:", error);
      toast.error("Failed to find opportunities");
    }
    setAiLoading(false);
  };

  const addExperience = async () => {
    if (!expForm.title.trim()) return;
    const { error } = await supabase.from("experiences").insert({
      user_id: user!.id,
      ...expForm,
    });
    if (error) {
      toast.error("Failed to add experience");
      return;
    }
    setExpForm({ title: "", organization: "", experience_type: "work", description: "", is_current: false });
    setShowAddExp(false);
    fetchAll();
    toast.success("Experience added!");
  };

  const addSkill = async () => {
    if (!skillForm.name.trim()) return;
    const { error } = await supabase.from("skills").insert({
      user_id: user!.id,
      ...skillForm,
    });
    if (error) {
      toast.error("Failed to add skill");
      return;
    }
    setSkillForm({ name: "", category: "technical", proficiency: 3 });
    setShowAddSkill(false);
    fetchAll();
    toast.success("Skill added!");
  };

  const exportResume = async () => {
    toast.info("Preparing your resume for export...");
    // Create export record
    const { error } = await supabase.from("resume_exports").insert({
      user_id: user!.id,
      title: `${profile?.full_name || "My"}'s Living Resume`,
      summary: aiInsights?.profile_summary || "",
      skills_snapshot: skills,
      experiences_snapshot: experiences,
      projects_snapshot: projects,
      achievements_snapshot: achievements,
      ai_insights: aiInsights,
    });
    
    if (error) {
      toast.error("Failed to save resume");
      return;
    }
    toast.success("Resume saved! PDF export coming soon.");
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "work": return <Briefcase size={16} className="text-accent" />;
      case "education": return <GraduationCap size={16} className="text-accent" />;
      default: return <Award size={16} className="text-accent" />;
    }
  };

  const getCompletionScore = () => {
    let score = 0;
    if (profile?.full_name) score += 10;
    if (profile?.bio) score += 10;
    if (experiences.length > 0) score += 20;
    if (skills.length > 0) score += 20;
    if (projects.length > 0) score += 15;
    if (achievements.length > 0) score += 10;
    if (learningProgress.length > 0) score += 15;
    return Math.min(100, score);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center">
              <FileText size={24} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Living Resume</h1>
              <p className="font-body text-sm text-muted-foreground">
                Your evolving story — built from everything you've explored, learned, and accomplished
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportResume}>
              <Download size={16} /> Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 size={16} /> Share
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Profile Summary Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full gradient-warm flex items-center justify-center text-secondary-foreground font-display text-3xl">
              {profile?.full_name?.charAt(0) || "?"}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl text-foreground">{profile?.full_name || "Your Name"}</h2>
              <p className="font-body text-muted-foreground mt-1">{profile?.bio || "Add a bio to tell your story"}</p>
              <div className="flex flex-wrap gap-4 mt-4 font-body text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase size={14} />
                  <span>{experiences.length} experiences</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target size={14} />
                  <span>{skills.length} skills</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen size={14} />
                  <span>{projects.length} projects</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award size={14} />
                  <span>{achievements.length} achievements</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users size={14} />
                  <span>{connections.length} connections</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl text-accent">{getCompletionScore()}%</div>
              <p className="font-body text-xs text-muted-foreground">Profile Complete</p>
              <Progress value={getCompletionScore()} className="w-32 mt-2 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
          <TabsTrigger value="overview" className="font-body text-sm">Overview</TabsTrigger>
          <TabsTrigger value="skills" className="font-body text-sm">Skills</TabsTrigger>
          <TabsTrigger value="experience" className="font-body text-sm">Experience</TabsTrigger>
          <TabsTrigger value="learning" className="font-body text-sm">Learning</TabsTrigger>
          <TabsTrigger value="eligible" className="font-body text-sm">Eligible For</TabsTrigger>
          <TabsTrigger value="mirror" className="font-body text-sm">Decision Mirror</TabsTrigger>
          <TabsTrigger value="insights" className="font-body text-sm">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick Stats */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <TrendingUp size={18} className="text-accent" />
                  Career Readiness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-display text-accent">
                  {aiInsights?.career_readiness_score || getCompletionScore()}%
                </div>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Based on your skills, experiences, and learning progress
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Star size={18} className="text-accent" />
                  Top Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(aiInsights?.key_strengths || skills.slice(0, 3).map(s => s.name)).map((strength: string, i: number) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-accent/10 text-accent font-body text-xs">
                      {strength}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Lightbulb size={18} className="text-accent" />
                  Growth Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(aiInsights?.growth_areas || ["Leadership", "Communication"]).map((area: string, i: number) => (
                    <span key={i} className="px-2 py-1 rounded-full bg-muted text-muted-foreground font-body text-xs">
                      {area}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-display text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...experiences.slice(0, 2), ...projects.slice(0, 2), ...achievements.slice(0, 2)]
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 5)
                  .map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        {item.experience_type ? typeIcon(item.experience_type) : 
                         item.project_type ? <BookOpen size={14} className="text-accent" /> :
                         <Award size={14} className="text-accent" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-body text-sm text-foreground">{item.title}</p>
                        <p className="font-body text-xs text-muted-foreground">
                          {item.organization || item.project_type || item.achievement_type}
                        </p>
                      </div>
                      <span className="font-body text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl text-foreground">Skills Mastered</h3>
            <Button onClick={() => setShowAddSkill(!showAddSkill)} variant="outline" size="sm">
              <Plus size={16} /> Add Skill
            </Button>
          </div>

          {showAddSkill && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-muted/50 rounded-lg space-y-3">
              <Input 
                placeholder="Skill name" 
                value={skillForm.name} 
                onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} 
              />
              <select
                value={skillForm.category}
                onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
              >
                <option value="technical">Technical</option>
                <option value="soft">Soft Skills</option>
                <option value="creative">Creative</option>
                <option value="business">Business</option>
                <option value="leadership">Leadership</option>
              </select>
              <div className="flex items-center gap-2">
                <span className="font-body text-sm text-muted-foreground">Proficiency:</span>
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    onClick={() => setSkillForm({ ...skillForm, proficiency: level })}
                    className={`w-8 h-8 rounded-full border ${skillForm.proficiency >= level ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={addSkill} className="gradient-warm text-secondary-foreground" size="sm">Save</Button>
                <Button onClick={() => setShowAddSkill(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["technical", "soft", "creative", "business", "leadership"].map(category => {
              const categorySkills = skills.filter(s => s.category === category);
              if (categorySkills.length === 0) return null;
              return (
                <Card key={category} className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-lg capitalize">{category} Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categorySkills.map(skill => (
                        <div key={skill.id} className="flex items-center justify-between">
                          <span className="font-body text-sm text-foreground">{skill.name}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(level => (
                              <div 
                                key={level} 
                                className={`w-2 h-2 rounded-full ${skill.proficiency >= level ? 'bg-accent' : 'bg-muted'}`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {skills.length === 0 && (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No skills added yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Add skills from SelfGraph or manually above
              </p>
            </div>
          )}
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-xl text-foreground">Experience & Projects</h3>
            <Button onClick={() => setShowAddExp(!showAddExp)} variant="outline" size="sm">
              <Plus size={16} /> Add Experience
            </Button>
          </div>

          {showAddExp && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-muted/50 rounded-lg space-y-3">
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

          <div className="space-y-4">
            {experiences.length > 0 && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Work & Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {experiences.map(exp => (
                      <div key={exp.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          {typeIcon(exp.experience_type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-body font-medium text-foreground">{exp.title}</h4>
                          <p className="font-body text-sm text-muted-foreground">{exp.organization}</p>
                          {exp.description && (
                            <p className="font-body text-sm text-muted-foreground mt-2">{exp.description}</p>
                          )}
                          {exp.skills_used?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {exp.skills_used.map((skill: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-accent/10 text-accent font-body text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {exp.is_current && (
                          <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 font-body text-xs">
                            Current
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {projects.length > 0 && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Projects & Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {projects.map(project => (
                      <div key={project.id} className="p-4 rounded-lg bg-muted/30">
                        <h4 className="font-body font-medium text-foreground">{project.title}</h4>
                        <p className="font-body text-sm text-muted-foreground mt-1">{project.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-body text-xs">
                            {project.project_type}
                          </span>
                          <span className={`px-2 py-0.5 rounded font-body text-xs ${
                            project.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                            project.status === 'in_progress' ? 'bg-accent/10 text-accent' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Learning Tab */}
        <TabsContent value="learning" className="space-y-4">
          <h3 className="font-display text-xl text-foreground">Learning Progress</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningProgress.map(progress => (
              <Card key={progress.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-body font-medium text-foreground">
                        {progress.learning_tracks?.title || "Learning Track"}
                      </h4>
                      <p className="font-body text-xs text-muted-foreground">
                        {progress.learning_tracks?.category}
                      </p>
                    </div>
                    {progress.status === "completed" ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : (
                      <Clock size={20} className="text-accent" />
                    )}
                  </div>
                  <Progress value={progress.completion_percentage || 0} className="mt-3 h-2" />
                  <p className="font-body text-xs text-muted-foreground mt-2">
                    {progress.completion_percentage || 0}% complete
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {achievements.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg">Achievements & Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {achievements.map(achievement => (
                    <div key={achievement.id} className="text-center p-4 rounded-lg bg-muted/30">
                      <div className="w-12 h-12 mx-auto rounded-full gradient-warm flex items-center justify-center">
                        <Award size={24} className="text-secondary-foreground" />
                      </div>
                      <h4 className="font-body font-medium text-foreground mt-2 text-sm">{achievement.title}</h4>
                      <p className="font-body text-xs text-muted-foreground">{achievement.points} pts</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {learningProgress.length === 0 && achievements.length === 0 && (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No learning progress yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Start courses in the Content Library to track your progress
              </p>
            </div>
          )}
        </TabsContent>

        {/* Eligible For Tab */}
        <TabsContent value="eligible" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-foreground">Currently Eligible For</h3>
              <p className="font-body text-sm text-muted-foreground">
                Roles and opportunities that match your skills and experience
              </p>
            </div>
            <Button onClick={findEligibleOpportunities} disabled={aiLoading} variant="outline" size="sm">
              {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Find Opportunities
            </Button>
          </div>

          {eligibleOpportunities.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {eligibleOpportunities.map((opp, i) => (
                <Card key={i} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`px-2 py-0.5 rounded text-xs font-body ${
                          opp.type === 'job' ? 'bg-blue-500/10 text-blue-600' :
                          opp.type === 'internship' ? 'bg-purple-500/10 text-purple-600' :
                          opp.type === 'startup' ? 'bg-orange-500/10 text-orange-600' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {opp.type}
                        </span>
                        <h4 className="font-body font-medium text-foreground mt-2">{opp.title}</h4>
                        <p className="font-body text-sm text-muted-foreground mt-1">{opp.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl text-accent">{opp.match_percentage}%</div>
                        <p className="font-body text-xs text-muted-foreground">match</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="font-body text-xs text-muted-foreground">Skills you have:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {opp.user_has_skills?.map((skill: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 font-body text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline" size="sm">
                      View Details <ArrowRight size={14} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No opportunities analyzed yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Click "Find Opportunities" to discover what you're eligible for
              </p>
            </div>
          )}

          {/* Skill Fit Analysis */}
          {skillFitAnalysis.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Target size={18} className="text-accent" />
                  Skill vs Fit Analysis
                </CardTitle>
                <CardDescription className="font-body">
                  How your skills align with different career paths
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillFitAnalysis.slice(0, 5).map((analysis, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-body text-sm text-foreground">{analysis.role_name}</span>
                          <span className="font-body text-sm text-accent">{analysis.match_score}%</span>
                        </div>
                        <Progress value={analysis.match_score} className="h-2" />
                      </div>
                      {analysis.is_eligible && (
                        <CheckCircle2 size={20} className="text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Decision Mirror Tab */}
        <TabsContent value="mirror" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-foreground">Decision Mirror</h3>
              <p className="font-body text-sm text-muted-foreground">
                See how your past decisions shaped your current journey
              </p>
            </div>
            <Button onClick={generateDecisionMirror} disabled={aiLoading} variant="outline" size="sm">
              {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Eye size={16} />}
              Generate Mirror
            </Button>
          </div>

          {decisionMirror ? (
            <div className="space-y-4">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Your Journey Narrative</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-muted-foreground whitespace-pre-wrap">
                    {decisionMirror.journey_narrative}
                  </p>
                </CardContent>
              </Card>

              {decisionMirror.pivotal_moments?.length > 0 && (
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Pivotal Moments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {decisionMirror.pivotal_moments.map((moment: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Star size={14} className="text-accent" />
                          </div>
                          <div>
                            <p className="font-body text-sm text-foreground">{moment.action}</p>
                            <p className="font-body text-xs text-muted-foreground mt-1">{moment.impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Patterns Identified</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {decisionMirror.patterns_identified?.map((pattern: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <Brain size={14} className="text-accent" />
                          <span className="font-body text-sm text-muted-foreground">{pattern}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Suggested Adjustments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {decisionMirror.suggested_adjustments?.map((adj: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <Lightbulb size={14} className="text-accent" />
                          <span className="font-body text-sm text-muted-foreground">{adj}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Eye size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No decision analysis yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Click "Generate Mirror" to see how your decisions shaped your journey
              </p>
            </div>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-foreground">AI Insights Panel</h3>
              <p className="font-body text-sm text-muted-foreground">
                Personalized suggestions based on your complete profile
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={generateAIInsights} disabled={aiLoading} variant="outline" size="sm">
                {aiLoading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate Insights
              </Button>
              <Button onClick={generateSkillFitAnalysis} disabled={aiLoading} variant="outline" size="sm">
                <Target size={16} /> Analyze Fit
              </Button>
            </div>
          </div>

          {aiInsights ? (
            <div className="space-y-4">
              <Card className="border-border bg-gradient-to-br from-accent/5 to-accent/10">
                <CardContent className="p-6">
                  <h4 className="font-display text-lg text-foreground mb-2">Profile Summary</h4>
                  <p className="font-body text-muted-foreground">{aiInsights.profile_summary}</p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-green-600">Key Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {aiInsights.key_strengths?.map((strength: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 font-body text-sm">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-orange-600">Skill Gaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {aiInsights.skill_gaps?.map((gap: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-600 font-body text-sm">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Recommended Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiInsights.recommended_next_steps?.map((step: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <div className={`px-2 py-0.5 rounded text-xs font-body ${
                          step.priority === 'high' ? 'bg-red-500/10 text-red-600' :
                          step.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
                          'bg-green-500/10 text-green-600'
                        }`}>
                          {step.priority}
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm text-foreground">{step.action}</p>
                          <p className="font-body text-xs text-muted-foreground mt-1">{step.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Personalized Nudges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {aiInsights.personalized_nudges?.map((nudge: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
                        <Lightbulb size={16} className="text-accent mt-0.5 flex-shrink-0" />
                        <p className="font-body text-sm text-foreground">{nudge}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-body text-muted-foreground">No AI insights generated yet</p>
              <p className="font-body text-sm text-muted-foreground mt-1">
                Click "Generate Insights" to get personalized recommendations
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LivingResume;
