import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Presentation, Plus, Heart, MessageCircle, Eye, Sparkles, Users, Rocket,
  TrendingUp, Lightbulb, Send, Trash2, Handshake, Target, ChevronDown,
  ChevronUp, DollarSign, BarChart3, CheckCircle2, Loader2, BookOpen
} from "lucide-react";

interface ShowcaseProject {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  status: string | null;
  user_id: string;
  created_at: string;
  metadata: any;
}

interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface ReactionCount {
  like: number;
  inspire: number;
  feedback: number;
}

const StartupShowcase = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", tags: "", goals: "", challenges: "", learnings: "" });
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<Record<string, ReactionCount>>({});
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  // AI features
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [nextSteps, setNextSteps] = useState<any>(null);
  const [fundingData, setFundingData] = useState<any>(null);
  const [launchChecklist, setLaunchChecklist] = useState<any>(null);
  const [industryDeck, setIndustryDeck] = useState<any>(null);
  const [aiFeedback, setAiFeedback] = useState<Record<string, any>>({});
  // Collaborations
  const [collabForm, setCollabForm] = useState<{ projectId: string; message: string; skills: string } | null>(null);
  const [myCollabs, setMyCollabs] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [projRes, reactRes, userReactRes, commentRes, collabRes] = await Promise.all([
      supabase.from("projects").select("*").eq("intent", "entrepreneurship").order("created_at", { ascending: false }).limit(50),
      supabase.from("showcase_reactions").select("project_id, reaction_type"),
      supabase.from("showcase_reactions").select("project_id, reaction_type").eq("user_id", user.id),
      supabase.from("showcase_comments").select("*").order("created_at", { ascending: true }),
      supabase.from("showcase_collaborations").select("*").or(`requester_id.eq.${user.id},owner_id.eq.${user.id}`),
    ]);

    setProjects(projRes.data || []);

    // Aggregate reactions
    const rMap: Record<string, ReactionCount> = {};
    (reactRes.data || []).forEach((r: any) => {
      if (!rMap[r.project_id]) rMap[r.project_id] = { like: 0, inspire: 0, feedback: 0 };
      if (r.reaction_type in rMap[r.project_id]) (rMap[r.project_id] as any)[r.reaction_type]++;
    });
    setReactions(rMap);

    // User's own reactions
    const uMap: Record<string, string[]> = {};
    (userReactRes.data || []).forEach((r: any) => {
      if (!uMap[r.project_id]) uMap[r.project_id] = [];
      uMap[r.project_id].push(r.reaction_type);
    });
    setUserReactions(uMap);

    // Comments grouped by project
    const cMap: Record<string, Comment[]> = {};
    (commentRes.data || []).forEach((c: any) => {
      if (!cMap[c.project_id]) cMap[c.project_id] = [];
      cMap[c.project_id].push(c);
    });
    setComments(cMap);

    setMyCollabs(collabRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("showcase-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "showcase_comments" }, () => fetchAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "showcase_reactions" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const shareProject = async () => {
    if (!form.title.trim()) return;
    const metadata = {
      goals: form.goals,
      challenges: form.challenges,
      learnings: form.learnings,
    };
    const { error } = await supabase.from("projects").insert({
      user_id: user!.id,
      title: form.title.trim(),
      description: form.description,
      project_type: "showcase",
      intent: "entrepreneurship" as const,
      status: "launched" as const,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      metadata,
    });
    if (error) { toast.error("Failed to share"); return; }
    setForm({ title: "", description: "", tags: "", goals: "", challenges: "", learnings: "" });
    setShowForm(false);
    toast.success("Project shared to Showcase! 🎉");
    fetchAll();
  };

  const toggleReaction = async (projectId: string, type: string) => {
    const has = userReactions[projectId]?.includes(type);
    if (has) {
      await supabase.from("showcase_reactions").delete().eq("project_id", projectId).eq("user_id", user!.id).eq("reaction_type", type);
    } else {
      await supabase.from("showcase_reactions").insert({ project_id: projectId, user_id: user!.id, reaction_type: type });
    }
  };

  const addComment = async (projectId: string) => {
    const content = commentInputs[projectId]?.trim();
    if (!content) return;
    await supabase.from("showcase_comments").insert({ project_id: projectId, user_id: user!.id, content });
    setCommentInputs((p) => ({ ...p, [projectId]: "" }));
  };

  const deleteComment = async (id: string) => {
    await supabase.from("showcase_comments").delete().eq("id", id);
  };

  const requestCollaboration = async () => {
    if (!collabForm) return;
    const project = projects.find((p) => p.id === collabForm.projectId);
    if (!project) return;
    const { error } = await supabase.from("showcase_collaborations").insert({
      project_id: collabForm.projectId,
      requester_id: user!.id,
      owner_id: project.user_id,
      message: collabForm.message,
      skills_offered: collabForm.skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    if (error) { toast.error("Failed to send request"); return; }
    toast.success("Collaboration request sent!");
    setCollabForm(null);
    fetchAll();
  };

  const updateCollabStatus = async (id: string, status: string) => {
    await supabase.from("showcase_collaborations").update({ status }).eq("id", id);
    toast.success(`Collaboration ${status}`);
    fetchAll();
  };

  const invokeAI = async (type: string, context: any, setter: (d: any) => void) => {
    setAiLoading(type);
    try {
      const { data, error } = await supabase.functions.invoke("startup-showcase-ai", { body: { type, context } });
      if (error) throw error;
      setter(data);
    } catch { toast.error("AI analysis failed"); }
    setAiLoading(null);
  };

  const getAIFeedback = async (project: ShowcaseProject) => {
    await invokeAI("showcase_feedback", { project, comments: comments[project.id] || [], reactions: reactions[project.id] || {} }, (d) => setAiFeedback((p) => ({ ...p, [project.id]: d })));
  };

  const filteredProjects = projects.filter((p) => {
    const matchText = !filter || p.title.toLowerCase().includes(filter.toLowerCase()) || (p.tags || []).some((t) => t.toLowerCase().includes(filter.toLowerCase()));
    const matchStage = stageFilter === "all" || p.status === stageFilter;
    return matchText && matchStage;
  });

  const myProjects = projects.filter((p) => p.user_id === user?.id);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Presentation size={20} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl text-foreground">Startup Showcase</h1>
              <p className="font-body text-sm text-muted-foreground">Share your startup story — get feedback, find collaborators, and inspire others.</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground"><Plus size={18} /> Share Project</Button>
        </div>
      </motion.div>

      {/* Create form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl text-foreground">Share Your Project</h2>
          <Input placeholder="Project name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea placeholder="Describe your project, progress, and what feedback you're looking for..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="grid md:grid-cols-3 gap-3">
            <Textarea placeholder="Goals & milestones achieved..." value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} rows={2} />
            <Textarea placeholder="Challenges faced..." value={form.challenges} onChange={(e) => setForm({ ...form, challenges: e.target.value })} rows={2} />
            <Textarea placeholder="Key learnings & reflections..." value={form.learnings} onChange={(e) => setForm({ ...form, learnings: e.target.value })} rows={2} />
          </div>
          <Input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={shareProject} className="bg-primary text-primary-foreground">Share</Button>
            <Button onClick={() => setShowForm(false)} variant="ghost">Cancel</Button>
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="explore" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="explore">Explore</TabsTrigger>
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="collaborations">Collaborations</TabsTrigger>
          <TabsTrigger value="launchpad">Launchpad</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
        </TabsList>

        {/* EXPLORE TAB */}
        <TabsContent value="explore" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-3">
            <Input placeholder="Search projects, tags..." value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-xs" />
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="all">All Stages</option>
              <option value="idea">Idea</option>
              <option value="planning">Planning</option>
              <option value="building">Building</option>
              <option value="launched">Launched</option>
            </select>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Sparkles className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No projects found</h3>
              <p className="font-body text-muted-foreground">Be the first to share your startup journey!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredProjects.map((p, i) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  index={i}
                  reactions={reactions[p.id] || { like: 0, inspire: 0, feedback: 0 }}
                  userReactions={userReactions[p.id] || []}
                  comments={comments[p.id] || []}
                  commentInput={commentInputs[p.id] || ""}
                  expanded={expandedComments[p.id] || false}
                  isOwner={p.user_id === user?.id}
                  aiFeedback={aiFeedback[p.id]}
                  aiLoading={aiLoading}
                  onToggleReaction={(type) => toggleReaction(p.id, type)}
                  onCommentChange={(v) => setCommentInputs((prev) => ({ ...prev, [p.id]: v }))}
                  onAddComment={() => addComment(p.id)}
                  onDeleteComment={deleteComment}
                  onToggleExpand={() => setExpandedComments((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                  onGetFeedback={() => getAIFeedback(p)}
                  onRequestCollab={() => setCollabForm({ projectId: p.id, message: "", skills: "" })}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* MY PROJECTS TAB */}
        <TabsContent value="my-projects" className="space-y-4 mt-4">
          {myProjects.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Rocket className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No projects yet</h3>
              <p className="font-body text-muted-foreground">Share your first project to get started!</p>
              <Button onClick={() => setShowForm(true)} className="mt-4 bg-primary text-primary-foreground"><Plus size={16} /> Share Project</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Total Projects", value: myProjects.length, icon: Rocket },
                  { label: "Total Reactions", value: myProjects.reduce((s, p) => s + (reactions[p.id]?.like || 0) + (reactions[p.id]?.inspire || 0), 0), icon: Heart },
                  { label: "Total Comments", value: myProjects.reduce((s, p) => s + (comments[p.id]?.length || 0), 0), icon: MessageCircle },
                  { label: "Collaborations", value: myCollabs.filter((c) => c.owner_id === user?.id).length, icon: Users },
                ].map((s) => (
                  <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
                    <s.icon className="mx-auto text-muted-foreground mb-1" size={20} />
                    <div className="font-display text-2xl text-foreground">{s.value}</div>
                    <div className="font-body text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                disabled={aiLoading === "next_steps"}
                onClick={() => invokeAI("next_steps", { projects: myProjects, feedback: myProjects.map((p) => ({ project: p.title, comments: comments[p.id]?.length || 0, reactions: reactions[p.id] || {} })) }, setNextSteps)}
              >
                {aiLoading === "next_steps" ? <Loader2 className="animate-spin mr-2" size={16} /> : <Lightbulb size={16} className="mr-2" />}
                Get AI Next Steps
              </Button>
              {nextSteps?.next_steps && (
                <div className="space-y-2">
                  {nextSteps.next_steps.map((s: any, i: number) => (
                    <div key={i} className="bg-card rounded-lg border border-border p-4 flex gap-3">
                      <Target size={18} className="text-accent mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-sm text-foreground">{s.title}</span>
                          <Badge variant={s.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">{s.priority}</Badge>
                          <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                        </div>
                        <p className="font-body text-xs text-muted-foreground">{s.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {myProjects.map((p, i) => (
                  <ProjectCard
                    key={p.id} project={p} index={i}
                    reactions={reactions[p.id] || { like: 0, inspire: 0, feedback: 0 }}
                    userReactions={userReactions[p.id] || []}
                    comments={comments[p.id] || []}
                    commentInput={commentInputs[p.id] || ""}
                    expanded={expandedComments[p.id] || false}
                    isOwner={true}
                    aiFeedback={aiFeedback[p.id]}
                    aiLoading={aiLoading}
                    onToggleReaction={(type) => toggleReaction(p.id, type)}
                    onCommentChange={(v) => setCommentInputs((prev) => ({ ...prev, [p.id]: v }))}
                    onAddComment={() => addComment(p.id)}
                    onDeleteComment={deleteComment}
                    onToggleExpand={() => setExpandedComments((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                    onGetFeedback={() => getAIFeedback(p)}
                    onRequestCollab={() => {}}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* COLLABORATIONS TAB */}
        <TabsContent value="collaborations" className="space-y-4 mt-4">
          <h2 className="font-display text-xl text-foreground">Collaboration Requests</h2>
          {myCollabs.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Handshake className="mx-auto text-muted-foreground mb-3" size={36} />
              <p className="font-body text-muted-foreground">No collaboration requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myCollabs.map((c) => (
                <div key={c.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={c.status === "accepted" ? "default" : c.status === "pending" ? "secondary" : "destructive"}>{c.status}</Badge>
                    <span className="font-body text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  {c.message && <p className="font-body text-sm text-foreground mb-2">{c.message}</p>}
                  {c.skills_offered?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {c.skills_offered.map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                    </div>
                  )}
                  {c.status === "pending" && c.owner_id === user?.id && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => updateCollabStatus(c.id, "accepted")} className="bg-primary text-primary-foreground">Accept</Button>
                      <Button size="sm" variant="ghost" onClick={() => updateCollabStatus(c.id, "declined")}>Decline</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* LAUNCHPAD TAB */}
        <TabsContent value="launchpad" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground flex items-center gap-2"><Rocket size={20} /> MyRaaha Launchpad</h2>
            <Button
              variant="outline"
              disabled={aiLoading === "launch_checklist" || myProjects.length === 0}
              onClick={() => invokeAI("launch_checklist", { projects: myProjects, skills: [], milestones: [] }, setLaunchChecklist)}
            >
              {aiLoading === "launch_checklist" ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 size={16} className="mr-2" />}
              Generate Launch Plan
            </Button>
          </div>
          {!launchChecklist ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Rocket className="mx-auto text-muted-foreground mb-3" size={36} />
              <p className="font-body text-muted-foreground">Generate a launch checklist for your startup.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {launchChecklist.phases?.map((phase: any, pi: number) => (
                <div key={pi} className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-display text-lg text-foreground mb-3">{phase.name}</h3>
                  <div className="space-y-2">
                    {phase.tasks?.map((t: any, ti: number) => (
                      <div key={ti} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                        <CheckCircle2 size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <span className="font-body text-sm text-foreground">{t.task}</span>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                            <Badge variant={t.priority === "high" ? "destructive" : "secondary"} className="text-[10px]">{t.priority}</Badge>
                            {t.estimated_days && <span className="font-body text-[10px] text-muted-foreground">~{t.estimated_days}d</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {launchChecklist.launch_tips?.length > 0 && (
                <div className="bg-accent/10 rounded-xl p-4">
                  <h4 className="font-display text-sm text-foreground mb-2">Launch Tips</h4>
                  <ul className="space-y-1">
                    {launchChecklist.launch_tips.map((tip: string, i: number) => (
                      <li key={i} className="font-body text-xs text-muted-foreground flex gap-2"><Sparkles size={12} className="shrink-0 mt-0.5" /> {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* FUNDING TAB */}
        <TabsContent value="funding" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground flex items-center gap-2"><DollarSign size={20} /> Funding Path Navigator</h2>
            <Button
              variant="outline"
              disabled={aiLoading === "funding_navigator" || myProjects.length === 0}
              onClick={() => invokeAI("funding_navigator", { projects: myProjects, metrics: { total_reactions: myProjects.reduce((s, p) => s + (reactions[p.id]?.like || 0), 0), total_comments: myProjects.reduce((s, p) => s + (comments[p.id]?.length || 0), 0) } }, setFundingData)}
            >
              {aiLoading === "funding_navigator" ? <Loader2 className="animate-spin mr-2" size={16} /> : <BarChart3 size={16} className="mr-2" />}
              Analyze Funding Options
            </Button>
          </div>
          {!fundingData ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <DollarSign className="mx-auto text-muted-foreground mb-3" size={36} />
              <p className="font-body text-muted-foreground">Analyze your startup's funding readiness and explore paths.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6 text-center">
                <div className="font-display text-4xl text-foreground mb-1">{fundingData.readiness_score}%</div>
                <div className="font-body text-sm text-muted-foreground">Funding Readiness Score</div>
                <div className="w-full bg-muted rounded-full h-2 mt-3"><div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${fundingData.readiness_score}%` }} /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {fundingData.recommended_paths?.map((path: any, i: number) => (
                  <div key={i} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display text-sm text-foreground">{path.type}</span>
                      <Badge variant="outline">{path.fit_score}% fit</Badge>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mb-2">{path.description}</p>
                    {path.action_items?.length > 0 && (
                      <ul className="space-y-1">{path.action_items.map((a: string, ai: number) => <li key={ai} className="font-body text-[11px] text-muted-foreground flex gap-1"><Target size={10} className="shrink-0 mt-0.5" />{a}</li>)}</ul>
                    )}
                  </div>
                ))}
              </div>
              {fundingData.preparation_tips?.length > 0 && (
                <div className="bg-accent/10 rounded-xl p-4">
                  <h4 className="font-display text-sm text-foreground mb-2">Preparation Tips</h4>
                  <ul className="space-y-1">{fundingData.preparation_tips.map((t: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground">• {t}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* PARTNERSHIPS TAB */}
        <TabsContent value="partnerships" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-foreground flex items-center gap-2"><BookOpen size={20} /> Industry Collaboration Decks</h2>
            <Button
              variant="outline"
              disabled={aiLoading === "industry_deck" || myProjects.length === 0}
              onClick={() => invokeAI("industry_deck", { projects: myProjects }, setIndustryDeck)}
            >
              {aiLoading === "industry_deck" ? <Loader2 className="animate-spin mr-2" size={16} /> : <Handshake size={16} className="mr-2" />}
              Generate Partnership Ideas
            </Button>
          </div>
          {!industryDeck ? (
            <div className="text-center py-8 bg-card rounded-xl border border-border">
              <Handshake className="mx-auto text-muted-foreground mb-3" size={36} />
              <p className="font-body text-muted-foreground">Generate industry partnership strategies for your startup.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {industryDeck.partnership_opportunities?.map((opp: any, i: number) => (
                <div key={i} className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-display text-sm text-foreground mb-1">{opp.type}</h3>
                  <p className="font-body text-xs text-muted-foreground mb-2">{opp.description}</p>
                  <div className="bg-muted/30 rounded-lg p-2 mb-2">
                    <span className="font-body text-[11px] text-accent">Value Prop:</span>
                    <p className="font-body text-xs text-foreground">{opp.value_proposition}</p>
                  </div>
                  <p className="font-body text-[11px] text-muted-foreground"><strong>Approach:</strong> {opp.approach_strategy}</p>
                </div>
              ))}
              {industryDeck.deck_outline?.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-display text-sm text-foreground mb-2">Deck Outline</h4>
                  <ol className="space-y-1">{industryDeck.deck_outline.map((s: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground">{i + 1}. {s}</li>)}</ol>
                </div>
              )}
              {industryDeck.networking_tips?.length > 0 && (
                <div className="bg-accent/10 rounded-xl p-4">
                  <h4 className="font-display text-sm text-foreground mb-2">Networking Tips</h4>
                  <ul className="space-y-1">{industryDeck.networking_tips.map((t: string, i: number) => <li key={i} className="font-body text-xs text-muted-foreground">• {t}</li>)}</ul>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Collaboration Request Modal */}
      {collabForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-xl border border-border p-6 max-w-md w-full space-y-4">
            <h3 className="font-display text-lg text-foreground">Request Collaboration</h3>
            <Textarea placeholder="Why do you want to collaborate? What can you bring?" value={collabForm.message} onChange={(e) => setCollabForm({ ...collabForm, message: e.target.value })} rows={3} />
            <Input placeholder="Skills you offer (comma-separated)" value={collabForm.skills} onChange={(e) => setCollabForm({ ...collabForm, skills: e.target.value })} />
            <div className="flex gap-2">
              <Button onClick={requestCollaboration} className="bg-primary text-primary-foreground">Send Request</Button>
              <Button variant="ghost" onClick={() => setCollabForm(null)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Project Card component
interface ProjectCardProps {
  project: ShowcaseProject;
  index: number;
  reactions: ReactionCount;
  userReactions: string[];
  comments: Comment[];
  commentInput: string;
  expanded: boolean;
  isOwner: boolean;
  aiFeedback: any;
  aiLoading: string | null;
  onToggleReaction: (type: string) => void;
  onCommentChange: (v: string) => void;
  onAddComment: () => void;
  onDeleteComment: (id: string) => void;
  onToggleExpand: () => void;
  onGetFeedback: () => void;
  onRequestCollab: () => void;
}

const ProjectCard = ({ project: p, index, reactions: r, userReactions: ur, comments: cmts, commentInput, expanded, isOwner, aiFeedback: fb, aiLoading, onToggleReaction, onCommentChange, onAddComment, onDeleteComment, onToggleExpand, onGetFeedback, onRequestCollab }: ProjectCardProps) => {
  const meta = p.metadata as any;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="bg-card rounded-xl border border-border p-5 flex flex-col">
      <div className="flex items-start justify-between mb-1">
        <h3 className="font-display text-lg text-foreground">{p.title}</h3>
        <Badge variant="outline" className="text-[10px] shrink-0">{p.status}</Badge>
      </div>
      {p.description && <p className="font-body text-sm text-muted-foreground mb-2 line-clamp-3">{p.description}</p>}
      
      {/* Structured metadata */}
      {meta?.goals && (
        <div className="mb-2 bg-muted/30 rounded-lg p-2">
          <span className="font-body text-[10px] text-accent font-medium">Goals:</span>
          <p className="font-body text-xs text-muted-foreground line-clamp-2">{meta.goals}</p>
        </div>
      )}

      {p.tags && p.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {p.tags.map((t: string) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
        </div>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-3 pt-3 border-t border-border">
        {[
          { type: "like", icon: Heart, label: r.like },
          { type: "inspire", icon: Sparkles, label: r.inspire },
          { type: "feedback", icon: TrendingUp, label: r.feedback },
        ].map(({ type, icon: Icon, label }) => (
          <button key={type} onClick={() => onToggleReaction(type)} className="flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-accent transition-colors">
            <Icon size={14} className={ur.includes(type) ? "text-accent fill-accent" : ""} /> {label}
          </button>
        ))}
        <button onClick={onToggleExpand} className="flex items-center gap-1 font-body text-xs text-muted-foreground hover:text-accent transition-colors ml-auto">
          <MessageCircle size={14} /> {cmts.length}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Comments section */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {cmts.map((c) => (
            <div key={c.id} className="flex items-start gap-2 group">
              <p className="font-body text-xs text-muted-foreground flex-1">{c.content}</p>
              {c.user_id === p.user_id && (
                <button onClick={() => onDeleteComment(c.id)} className="opacity-0 group-hover:opacity-100"><Trash2 size={12} className="text-destructive" /></button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Add a comment..." value={commentInput} onChange={(e) => onCommentChange(e.target.value)} className="text-xs h-8" onKeyDown={(e) => e.key === "Enter" && onAddComment()} />
            <Button size="sm" variant="ghost" onClick={onAddComment} className="h-8 px-2"><Send size={14} /></Button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-2 border-t border-border">
        <Button size="sm" variant="ghost" onClick={onGetFeedback} disabled={aiLoading === "showcase_feedback"} className="text-xs h-7">
          {aiLoading === "showcase_feedback" ? <Loader2 className="animate-spin" size={12} /> : <Lightbulb size={12} />}
          <span className="ml-1">AI Feedback</span>
        </Button>
        {!isOwner && (
          <Button size="sm" variant="ghost" onClick={onRequestCollab} className="text-xs h-7">
            <Users size={12} /><span className="ml-1">Collaborate</span>
          </Button>
        )}
      </div>

      {/* AI Feedback display */}
      {fb && (
        <div className="mt-3 bg-accent/10 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs text-foreground">AI Feedback</span>
            <Badge variant="outline">{fb.overall_score}/100</Badge>
          </div>
          {fb.strengths?.length > 0 && (
            <div><span className="font-body text-[10px] text-accent">Strengths:</span>
              <ul>{fb.strengths.map((s: string, i: number) => <li key={i} className="font-body text-[11px] text-muted-foreground">✓ {s}</li>)}</ul>
            </div>
          )}
          {fb.improvements?.length > 0 && (
            <div><span className="font-body text-[10px] text-accent">Improve:</span>
              <ul>{fb.improvements.map((s: string, i: number) => <li key={i} className="font-body text-[11px] text-muted-foreground">→ {s}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StartupShowcase;
