import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FolderKanban, Plus, Sparkles, Clock, Tag, ArrowRight, Trophy,
  Zap, Users, Search, Filter, BookOpen, Target, MessageSquare,
  CheckCircle2, BarChart3, Brain, Lightbulb, Rocket
} from "lucide-react";
import DirectorySearchDrawer from "@/components/directory/DirectorySearchDrawer";

const DOMAINS = ["all", "tech", "data", "design", "marketing", "business", "research", "education"];
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

const ProjectPlayground = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [progressLogs, setProgressLogs] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tags: "", domain: "tech" });
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [aiNudge, setAiNudge] = useState<any>(null);
  const [reflectionPrompts, setReflectionPrompts] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [domainFilter, setDomainFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [reflectionForm, setReflectionForm] = useState({ content: "", challenges: "", lessons: "", mood: "neutral", skills: "" });
  const [showLogForm, setShowLogForm] = useState(false);
  const [logForm, setLogForm] = useState({ description: "", timeSpent: 30, skills: "", mood: "focused" });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "medium" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    if (!user) return;
    const [pRes, cRes, hRes, eRes] = await Promise.all([
      supabase.from("projects").select("*").eq("user_id", user.id).eq("intent", "career").order("created_at", { ascending: false }),
      supabase.from("project_challenges").select("*").order("is_featured", { ascending: false }),
      supabase.from("project_hackathons").select("*").order("start_date", { ascending: true }),
      supabase.from("challenge_enrollments").select("*").eq("user_id", user.id),
    ]);
    setProjects(pRes.data || []);
    setChallenges(cRes.data || []);
    setHackathons(hRes.data || []);
    setEnrollments(eRes.data || []);
    setLoading(false);
  };

  const fetchProjectDetails = async (projectId: string) => {
    const [tRes, rRes, lRes] = await Promise.all([
      supabase.from("project_tasks").select("*").eq("project_id", projectId).order("order_index"),
      supabase.from("project_reflections").select("*").eq("project_id", projectId).eq("user_id", user!.id).order("created_at", { ascending: false }),
      supabase.from("project_progress_logs").select("*").eq("project_id", projectId).eq("user_id", user!.id).order("created_at", { ascending: false }),
    ]);
    setProjectTasks(tRes.data || []);
    setReflections(rRes.data || []);
    setProgressLogs(lRes.data || []);
  };

  const createProject = async () => {
    if (!form.title.trim()) return;
    const { error } = await supabase.from("projects").insert({
      user_id: user!.id, title: form.title.trim(), description: form.description,
      project_type: "challenge", intent: "career" as const,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      metadata: { domain: form.domain },
    });
    if (error) { toast.error("Failed to create"); return; }
    setForm({ title: "", description: "", tags: "", domain: "tech" });
    setShowForm(false);
    fetchAll();
    toast.success("Project created!");
  };

  const updateStatus = async (id: string, status: "idea" | "planning" | "building" | "launched" | "archived") => {
    await supabase.from("projects").update({ status }).eq("id", id);
    fetchAll();
  };

  const enrollInChallenge = async (challengeId: string) => {
    const { error } = await supabase.from("challenge_enrollments").insert({
      challenge_id: challengeId, user_id: user!.id,
    });
    if (error?.code === "23505") { toast.info("Already enrolled"); return; }
    if (error) { toast.error("Failed to enroll"); return; }
    fetchAll();
    toast.success("Enrolled in challenge!");
  };

  const joinHackathon = async (hackathonId: string) => {
    const { error } = await supabase.from("hackathon_participants").insert({
      hackathon_id: hackathonId, user_id: user!.id,
    });
    if (error) { toast.error("Failed to join"); return; }
    toast.success("Joined hackathon!");
  };

  const addTask = async (projectId: string) => {
    if (!taskForm.title.trim()) return;
    await supabase.from("project_tasks").insert({
      project_id: projectId, user_id: user!.id, title: taskForm.title.trim(),
      description: taskForm.description, priority: taskForm.priority,
    });
    setTaskForm({ title: "", description: "", priority: "medium" });
    setShowTaskForm(false);
    fetchProjectDetails(projectId);
    toast.success("Task added!");
  };

  const toggleTask = async (taskId: string, currentStatus: string, projectId: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    await supabase.from("project_tasks").update({
      status: newStatus, completed_at: newStatus === "done" ? new Date().toISOString() : null,
    }).eq("id", taskId);
    fetchProjectDetails(projectId);
  };

  const addReflection = async (projectId: string) => {
    if (!reflectionForm.content.trim()) return;
    await supabase.from("project_reflections").insert({
      project_id: projectId, user_id: user!.id, content: reflectionForm.content,
      challenges_faced: reflectionForm.challenges, lessons_learned: reflectionForm.lessons,
      mood: reflectionForm.mood,
      skills_developed: reflectionForm.skills.split(",").map(s => s.trim()).filter(Boolean),
    });
    setReflectionForm({ content: "", challenges: "", lessons: "", mood: "neutral", skills: "" });
    setShowReflectionForm(false);
    fetchProjectDetails(projectId);
    toast.success("Reflection saved!");
  };

  const addProgressLog = async (projectId: string) => {
    if (!logForm.description.trim()) return;
    await supabase.from("project_progress_logs").insert({
      project_id: projectId, user_id: user!.id, description: logForm.description,
      time_spent_minutes: logForm.timeSpent, mood: logForm.mood,
      skills_practiced: logForm.skills.split(",").map(s => s.trim()).filter(Boolean),
    });
    setLogForm({ description: "", timeSpent: 30, skills: "", mood: "focused" });
    setShowLogForm(false);
    fetchProjectDetails(projectId);
    toast.success("Progress logged!");
  };

  const getAiRecommendations = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("project-playground-ai", {
        body: {
          type: "recommend_projects",
          userData: {
            interests: projects.flatMap(p => p.tags || []),
            completedCount: projects.filter(p => p.status === "launched").length,
            mood: "motivated",
          },
        },
      });
      if (error) throw error;
      setAiRecommendations(data.recommendations || []);
    } catch (e) { toast.error("Failed to get recommendations"); }
    setAiLoading(false);
  };

  const getAiNudge = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("project-playground-ai", {
        body: {
          type: "ai_nudge",
          userData: {
            activeProjects: projects.filter(p => p.status === "building").length,
            isStagnant: projects.filter(p => p.status === "building").length === 0 && projects.length > 0,
          },
        },
      });
      if (error) throw error;
      setAiNudge(data);
    } catch (e) { toast.error("Failed to get nudge"); }
    setAiLoading(false);
  };

  const getReflectionPrompts = async (project: any) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("project-playground-ai", {
        body: {
          type: "generate_reflection_prompts",
          userData: {
            projectTitle: project.title,
            domain: (project.metadata as any)?.domain || "general",
            skills: project.tags || [],
          },
        },
      });
      if (error) throw error;
      setReflectionPrompts(data.prompts || []);
    } catch (e) { toast.error("Failed to generate prompts"); }
    setAiLoading(false);
  };

  const breakdownChallenge = async (challenge: any) => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("project-playground-ai", {
        body: {
          type: "challenge_breakdown",
          userData: { challengeTitle: challenge.title, challengeDescription: challenge.description },
        },
      });
      if (error) throw error;
      // Create a project from the challenge and add tasks
      const { data: newProject } = await supabase.from("projects").insert({
        user_id: user!.id, title: challenge.title, description: challenge.description,
        project_type: "challenge", intent: "career" as const,
        tags: challenge.tags || [], metadata: { domain: challenge.domain, challenge_id: challenge.id },
      }).select().single();
      if (newProject && data.tasks) {
        for (const task of data.tasks) {
          await supabase.from("project_tasks").insert({
            project_id: newProject.id, user_id: user!.id, title: task.title,
            description: task.description, priority: task.priority, order_index: task.order,
          });
        }
      }
      fetchAll();
      toast.success("Challenge started with AI-generated tasks!");
    } catch (e) { toast.error("Failed to breakdown challenge"); }
    setAiLoading(false);
  };

  const filteredChallenges = challenges.filter(c => {
    if (domainFilter !== "all" && c.domain !== domainFilter) return false;
    if (difficultyFilter !== "all" && c.difficulty !== difficultyFilter) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const isEnrolled = (challengeId: string) => enrollments.some(e => e.challenge_id === challengeId);
  const totalTimeSpent = progressLogs.reduce((sum, l) => sum + (l.time_spent_minutes || 0), 0);
  const completedTasks = projectTasks.filter(t => t.status === "done").length;
  const taskProgress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;

  // Project detail view
  if (selectedProject) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" onClick={() => { setSelectedProject(null); setProjectTasks([]); setReflections([]); setProgressLogs([]); }} className="mb-4">← Back to Projects</Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl text-foreground">{selectedProject.title}</h1>
              <p className="font-body text-sm text-muted-foreground mt-1">{selectedProject.description}</p>
            </div>
            <Badge className="capitalize">{selectedProject.status}</Badge>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2"><CheckCircle2 size={16} className="text-accent" /><span className="font-display text-sm">Tasks</span></div>
            <Progress value={taskProgress} className="h-2 mb-1" />
            <p className="font-body text-xs text-muted-foreground">{completedTasks}/{projectTasks.length} completed</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-accent" /><span className="font-display text-sm">Time Invested</span></div>
            <p className="font-display text-2xl text-foreground">{Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2"><MessageSquare size={16} className="text-accent" /><span className="font-display text-sm">Reflections</span></div>
            <p className="font-display text-2xl text-foreground">{reflections.length}</p>
          </div>
        </div>

        <Tabs defaultValue="tasks">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="progress">Progress Log</TabsTrigger>
            <TabsTrigger value="reflections">Reflections</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg text-foreground">Project Tasks</h3>
              <Button size="sm" onClick={() => setShowTaskForm(!showTaskForm)} className="gradient-warm text-secondary-foreground"><Plus size={14} /> Add Task</Button>
            </div>
            {showTaskForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-4 space-y-3">
                <Input placeholder="Task title" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                <Textarea placeholder="Description" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} />
                <div className="flex gap-2">
                  {["low", "medium", "high"].map(p => (
                    <button key={p} onClick={() => setTaskForm({ ...taskForm, priority: p })} className={`px-3 py-1 rounded-full font-body text-xs capitalize ${taskForm.priority === p ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{p}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => addTask(selectedProject.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowTaskForm(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}
            {projectTasks.map((task, i) => (
              <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 bg-card rounded-lg border border-border p-3 cursor-pointer hover:border-accent/30 transition-all"
                onClick={() => toggleTask(task.id, task.status, selectedProject.id)}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.status === "done" ? "bg-accent border-accent" : "border-muted-foreground"}`}>
                  {task.status === "done" && <CheckCircle2 size={12} className="text-accent-foreground" />}
                </div>
                <div className="flex-1">
                  <p className={`font-body text-sm ${task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.title}</p>
                  {task.description && <p className="font-body text-xs text-muted-foreground">{task.description}</p>}
                </div>
                <Badge variant="outline" className="text-[10px] capitalize">{task.priority}</Badge>
              </motion.div>
            ))}
            {projectTasks.length === 0 && <p className="font-body text-sm text-muted-foreground text-center py-6">No tasks yet. Add some or use AI to break down your project!</p>}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg text-foreground">Progress Log</h3>
              <Button size="sm" onClick={() => setShowLogForm(!showLogForm)} className="gradient-warm text-secondary-foreground"><Plus size={14} /> Log Progress</Button>
            </div>
            {showLogForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-4 space-y-3">
                <Textarea placeholder="What did you work on?" value={logForm.description} onChange={e => setLogForm({ ...logForm, description: e.target.value })} rows={2} />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="font-body text-xs text-muted-foreground">Minutes spent</label>
                    <Input type="number" value={logForm.timeSpent} onChange={e => setLogForm({ ...logForm, timeSpent: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="flex-1">
                    <label className="font-body text-xs text-muted-foreground">Mood</label>
                    <div className="flex gap-1 mt-1">
                      {["😤", "😐", "🙂", "😊", "🔥"].map((m, i) => (
                        <button key={m} onClick={() => setLogForm({ ...logForm, mood: ["frustrated", "neutral", "good", "great", "focused"][i] })} className={`text-lg p-1 rounded ${logForm.mood === ["frustrated", "neutral", "good", "great", "focused"][i] ? "bg-accent/20" : ""}`}>{m}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <Input placeholder="Skills practiced (comma-separated)" value={logForm.skills} onChange={e => setLogForm({ ...logForm, skills: e.target.value })} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => addProgressLog(selectedProject.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowLogForm(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}
            {progressLogs.map((log, i) => (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-lg border border-border p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-body text-sm text-foreground">{log.description}</p>
                  <span className="font-body text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs text-muted-foreground">⏱ {log.time_spent_minutes}m</span>
                  {log.mood && <span className="font-body text-xs text-muted-foreground">Mood: {log.mood}</span>}
                  {(log.skills_practiced as string[])?.map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="reflections" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg text-foreground">Reflections</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => getReflectionPrompts(selectedProject)} disabled={aiLoading}><Brain size={14} /> Get Prompts</Button>
                <Button size="sm" onClick={() => setShowReflectionForm(!showReflectionForm)} className="gradient-warm text-secondary-foreground"><Plus size={14} /> Reflect</Button>
              </div>
            </div>
            {reflectionPrompts.length > 0 && (
              <div className="bg-accent/5 rounded-xl border border-accent/20 p-4 space-y-2">
                <h4 className="font-display text-sm text-accent">✨ AI Reflection Prompts</h4>
                {reflectionPrompts.map((p: any, i: number) => (
                  <p key={i} className="font-body text-sm text-foreground">• {p.question}</p>
                ))}
              </div>
            )}
            {showReflectionForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-4 space-y-3">
                <Textarea placeholder="What was your experience?" value={reflectionForm.content} onChange={e => setReflectionForm({ ...reflectionForm, content: e.target.value })} rows={3} />
                <Input placeholder="Challenges faced" value={reflectionForm.challenges} onChange={e => setReflectionForm({ ...reflectionForm, challenges: e.target.value })} />
                <Input placeholder="Lessons learned" value={reflectionForm.lessons} onChange={e => setReflectionForm({ ...reflectionForm, lessons: e.target.value })} />
                <Input placeholder="Skills developed (comma-separated)" value={reflectionForm.skills} onChange={e => setReflectionForm({ ...reflectionForm, skills: e.target.value })} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => addReflection(selectedProject.id)}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowReflectionForm(false)}>Cancel</Button>
                </div>
              </motion.div>
            )}
            {reflections.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-lg border border-border p-4 space-y-2">
                <p className="font-body text-sm text-foreground">{r.content}</p>
                {r.challenges_faced && <p className="font-body text-xs text-muted-foreground">💪 Challenges: {r.challenges_faced}</p>}
                {r.lessons_learned && <p className="font-body text-xs text-muted-foreground">💡 Lessons: {r.lessons_learned}</p>}
                <div className="flex gap-1">{(r.skills_developed as string[])?.map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <div className="bg-accent/5 rounded-xl border border-accent/20 p-6 text-center">
              <Sparkles className="mx-auto text-accent mb-3" size={32} />
              <h3 className="font-display text-lg text-foreground mb-2">AI Project Coach</h3>
              <p className="font-body text-sm text-muted-foreground mb-4">Get feedback, suggestions, and next steps powered by AI.</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={getAiNudge} disabled={aiLoading} variant="outline"><Lightbulb size={14} /> Get Nudge</Button>
                <Button onClick={() => getReflectionPrompts(selectedProject)} disabled={aiLoading} variant="outline"><Brain size={14} /> Reflection Prompts</Button>
              </div>
            </div>
            {aiNudge && (
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="font-body text-sm text-foreground mb-2">{aiNudge.nudge_message}</p>
                <p className="font-body text-xs text-accent">→ {aiNudge.suggested_action}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
              <FolderKanban size={20} className="text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Project Playground</h1>
              <p className="font-body text-sm text-muted-foreground">Apply what you've learned — explore, experiment, and build real-world skills.</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gradient-warm text-secondary-foreground"><Plus size={18} /> New Project</Button>
        </div>
      </motion.div>

      {/* AI Nudge Banner */}
      {aiNudge && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/5 rounded-xl border border-accent/20 p-4 flex items-center gap-3">
          <Sparkles className="text-accent shrink-0" size={20} />
          <div className="flex-1">
            <p className="font-body text-sm text-foreground">{aiNudge.nudge_message}</p>
            <p className="font-body text-xs text-accent mt-1">→ {aiNudge.suggested_action}</p>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="explore">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="explore"><Search size={14} className="mr-1" /> Explore</TabsTrigger>
          <TabsTrigger value="challenges"><Trophy size={14} className="mr-1" /> Challenge Vault</TabsTrigger>
          <TabsTrigger value="hackathons"><Zap size={14} className="mr-1" /> Hackathons</TabsTrigger>
          <TabsTrigger value="projects"><FolderKanban size={14} className="mr-1" /> Your Projects</TabsTrigger>
          <TabsTrigger value="ai"><Brain size={14} className="mr-1" /> AI Insights</TabsTrigger>
        </TabsList>

        {/* Explore Tab */}
        <TabsContent value="explore" className="space-y-6">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search challenges..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <DirectorySearchDrawer mode="careers" triggerLabel="Browse Careers" onSelect={(item) => setSearchQuery(item.title)} />
            <div className="flex gap-1">
              {DOMAINS.map(d => (
                <button key={d} onClick={() => setDomainFilter(d)} className={`px-3 py-1.5 rounded-full font-body text-xs capitalize transition-all ${domainFilter === d ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-1 mb-2">
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setDifficultyFilter(d)} className={`px-3 py-1 rounded-full font-body text-xs capitalize transition-all ${difficultyFilter === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>{d}</button>
            ))}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChallenges.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 hover:border-accent/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{c.icon_emoji}</span>
                  {c.is_featured && <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">Featured</Badge>}
                </div>
                <h3 className="font-display text-base text-foreground mb-1">{c.title}</h3>
                <p className="font-body text-xs text-muted-foreground mb-3 line-clamp-2">{c.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className="text-[10px] capitalize">{c.domain}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{c.difficulty}</Badge>
                  <span className="flex items-center gap-1 font-body text-[10px] text-muted-foreground"><Clock size={10} /> {c.duration_estimate}</span>
                </div>
                <div className="flex gap-2">
                  {isEnrolled(c.id) ? (
                    <Badge className="bg-accent/10 text-accent">Enrolled ✓</Badge>
                  ) : (
                    <Button size="sm" onClick={() => enrollInChallenge(c.id)} className="gradient-warm text-secondary-foreground text-xs">Enroll</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => breakdownChallenge(c)} disabled={aiLoading} className="text-xs"><Sparkles size={12} /> Start with AI</Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Challenge Vault */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-2">🏆 Challenge Vault</h2>
            <p className="font-body text-sm text-muted-foreground mb-4">Curated real-world challenges with clear objectives. Start anytime, learn always.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {challenges.filter(c => c.is_featured).map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-background rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{c.icon_emoji}</span>
                    <h4 className="font-display text-sm text-foreground">{c.title}</h4>
                  </div>
                  <p className="font-body text-xs text-muted-foreground mb-2">{c.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(c.learning_objectives as string[])?.slice(0, 3).map((o: string) => <Badge key={o} variant="outline" className="text-[10px]">{o}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{c.difficulty}</Badge>
                      <span className="font-body text-[10px] text-muted-foreground"><Clock size={10} className="inline mr-0.5" />{c.duration_estimate}</span>
                      <span className="font-body text-[10px] text-accent">+{c.points}pts</span>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => breakdownChallenge(c)} disabled={aiLoading} className="text-xs"><Rocket size={12} /> Start</Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {/* All challenges */}
          <div>
            <h3 className="font-display text-lg text-foreground mb-3">All Challenges</h3>
            <div className="grid gap-3">
              {challenges.map(c => (
                <div key={c.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{c.icon_emoji}</span>
                    <div>
                      <h4 className="font-display text-sm text-foreground">{c.title}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] capitalize">{c.domain}</Badge>
                        <Badge variant="outline" className="text-[10px] capitalize">{c.difficulty}</Badge>
                        <span className="font-body text-[10px] text-muted-foreground">{c.duration_estimate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isEnrolled(c.id) ? <Badge className="bg-accent/10 text-accent">Enrolled</Badge> : <Button size="sm" variant="outline" onClick={() => enrollInChallenge(c.id)} className="text-xs">Enroll</Button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Hackathons */}
        <TabsContent value="hackathons" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="font-display text-xl text-foreground mb-2">⚡ Hackathons & Competitions</h2>
            <p className="font-body text-sm text-muted-foreground mb-4">Time-bound events to apply skills, collaborate, and get recognized.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {hackathons.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`text-[10px] capitalize ${h.status === "upcoming" ? "bg-accent/10 text-accent" : h.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>{h.status}</Badge>
                  {h.is_team_based && <Badge variant="outline" className="text-[10px]"><Users size={10} className="mr-0.5" /> Team</Badge>}
                </div>
                <h3 className="font-display text-lg text-foreground mb-1">{h.title}</h3>
                <p className="font-body text-xs text-muted-foreground mb-3">{h.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  <Badge variant="outline" className="text-[10px] capitalize">{h.domain}</Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{h.difficulty}</Badge>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-xs text-muted-foreground">
                    📅 {h.start_date ? new Date(h.start_date).toLocaleDateString() : "TBD"} — {h.end_date ? new Date(h.end_date).toLocaleDateString() : "TBD"}
                  </span>
                  <span className="font-body text-xs text-muted-foreground">{h.current_participants}/{h.max_participants} joined</span>
                </div>
                {(h.prizes as string[])?.length > 0 && (
                  <div className="mb-3">
                    <p className="font-body text-xs text-muted-foreground mb-1">🏆 Prizes:</p>
                    {(h.prizes as string[]).map((p: string) => <Badge key={p} variant="outline" className="text-[10px] mr-1">{p}</Badge>)}
                  </div>
                )}
                <Button onClick={() => joinHackathon(h.id)} className="w-full gradient-warm text-secondary-foreground" size="sm">Join Hackathon</Button>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Your Projects */}
        <TabsContent value="projects" className="space-y-6">
          {showForm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
              <h2 className="font-display text-xl text-foreground">New Project</h2>
              <Input placeholder="Project name" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="What will you build? What will you learn?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
              <div>
                <label className="font-body text-xs text-muted-foreground">Domain</label>
                <div className="flex gap-1 mt-1">
                  {DOMAINS.filter(d => d !== "all").map(d => (
                    <button key={d} onClick={() => setForm({ ...form, domain: d })} className={`px-3 py-1 rounded-full font-body text-xs capitalize ${form.domain === d ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}>{d}</button>
                  ))}
                </div>
              </div>
              <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
              <div className="flex gap-2">
                <Button onClick={createProject} className="gradient-warm text-secondary-foreground">Create Project</Button>
                <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
              </div>
            </motion.div>
          )}

          {projects.length > 0 ? (
            <div className="grid gap-4">
              {projects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-accent/30 transition-all"
                  onClick={() => { setSelectedProject(p); fetchProjectDetails(p.id); }}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-lg text-foreground">{p.title}</h3>
                    <Badge className="capitalize text-[10px]">{p.status}</Badge>
                  </div>
                  {p.description && <p className="font-body text-sm text-muted-foreground mb-3">{p.description}</p>}
                  <div className="flex items-center gap-2 mb-3">
                    {(p.tags as string[])?.slice(0, 4).map((t: string) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                  </div>
                  <div className="flex items-center gap-1">
                    {["idea", "planning", "building", "launched"].map((s, si) => (
                      <div key={s} className="flex items-center">
                        <button onClick={e => { e.stopPropagation(); updateStatus(p.id, s as any); }}
                          className={`px-2 py-0.5 rounded-full font-body text-[10px] capitalize transition-all ${p.status === s ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-accent/10"}`}>{s}</button>
                        {si < 3 && <ArrowRight size={8} className="text-muted-foreground mx-0.5" />}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            !showForm && (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <FolderKanban className="mx-auto text-muted-foreground mb-3" size={40} />
                <h3 className="font-display text-xl text-foreground mb-2">No projects yet</h3>
                <p className="font-body text-muted-foreground mb-4">Start a project or take a challenge to build real-world skills!</p>
                <Button onClick={() => setShowForm(true)} className="gradient-warm text-secondary-foreground"><Plus size={16} /> Create Your First Project</Button>
              </div>
            )
          )}
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="ai" className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <Brain className="mx-auto text-accent mb-3" size={40} />
            <h2 className="font-display text-xl text-foreground mb-2">AI Project Advisor</h2>
            <p className="font-body text-sm text-muted-foreground mb-4">Get personalized project recommendations based on your skills, interests, and learning goals.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={getAiRecommendations} disabled={aiLoading} className="gradient-warm text-secondary-foreground">
                <Sparkles size={16} /> {aiLoading ? "Analyzing..." : "Get Recommendations"}
              </Button>
              <Button onClick={getAiNudge} disabled={aiLoading} variant="outline">
                <Lightbulb size={16} /> Motivation Nudge
              </Button>
            </div>
          </div>

          {aiRecommendations.length > 0 && (
            <div>
              <h3 className="font-display text-lg text-foreground mb-3">Recommended Projects</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {aiRecommendations.map((r: any, i: number) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-xl border border-accent/20 p-5">
                    <h4 className="font-display text-base text-foreground mb-1">{r.title}</h4>
                    <p className="font-body text-xs text-muted-foreground mb-2">{r.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{r.domain}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{r.difficulty}</Badge>
                      {r.duration && <span className="font-body text-[10px] text-muted-foreground"><Clock size={10} className="inline mr-0.5" />{r.duration}</span>}
                    </div>
                    {r.skills_to_practice && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {r.skills_to_practice.map((s: string) => <Badge key={s} className="bg-accent/10 text-accent border-accent/20 text-[10px]">{s}</Badge>)}
                      </div>
                    )}
                    {r.why_this_project && <p className="font-body text-xs text-accent italic">💡 {r.why_this_project}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {aiNudge && (
            <div className="bg-accent/5 rounded-xl border border-accent/20 p-5">
              <h4 className="font-display text-sm text-accent mb-2">💫 Your Nudge</h4>
              <p className="font-body text-sm text-foreground mb-2">{aiNudge.nudge_message}</p>
              <p className="font-body text-xs text-accent">→ {aiNudge.suggested_action}</p>
              {aiNudge.reason && <p className="font-body text-xs text-muted-foreground mt-1">Because: {aiNudge.reason}</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectPlayground;
