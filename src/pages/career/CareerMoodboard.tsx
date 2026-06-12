import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Plus, Sparkles, Share2, Link2, Type, Quote, Trash2, ArrowLeft,
  Lightbulb, RefreshCw, Palette, Heart, Target, BookOpen, ChevronRight,
  Brain, Compass, Users, TrendingUp, MessageSquare, Award, BarChart3,
  Zap, MapPin, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";

interface Board {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  is_shared: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface BoardItem {
  id: string;
  moodboard_id: string;
  content_type: string;
  title: string | null;
  content: string;
  url: string | null;
  tags: string[];
  goal_tags: string[];
  emotional_note: string | null;
  mood_feeling: string | null;
  position_x: number;
  position_y: number;
  created_at: string;
}

const THEMES = ["dream-roles", "passion-projects", "short-term-goals", "skills", "industries", "inspirations", "reflections"];
const CONTENT_TYPES = [
  { value: "text", label: "Text", icon: Type },
  { value: "quote", label: "Quote", icon: Quote },
  { value: "link", label: "Link", icon: Link2 },
];
const FEELINGS = ["🔥 Excited", "💡 Inspired", "🤔 Curious", "💪 Motivated", "😌 Calm", "😰 Overwhelmed", "🎯 Focused", "⚡ Challenging"];
const EMOTION_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(210,60%,55%)", "hsl(150,50%,50%)", "hsl(30,70%,55%)"];

const TABS = ["Boards", "Discover", "Insights", "Reflect", "Connect"] as const;
type Tab = (typeof TABS)[number];

const CareerMoodboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("Boards");
  const [boards, setBoards] = useState<Board[]>([]);
  const [allItems, setAllItems] = useState<BoardItem[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Data context for richer AI
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [userEnergyZones, setUserEnergyZones] = useState<any[]>([]);

  // Insights state
  const [emotionInsights, setEmotionInsights] = useState<any>(null);
  const [goalMapping, setGoalMapping] = useState<any>(null);
  const [evolutionData, setEvolutionData] = useState<any>(null);

  // Reflect state
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionResult, setReflectionResult] = useState<any>(null);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTheme, setNewTheme] = useState("dream-roles");
  const [itemType, setItemType] = useState("text");
  const [itemTitle, setItemTitle] = useState("");
  const [itemContent, setItemContent] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [itemTags, setItemTags] = useState("");
  const [itemGoalTags, setItemGoalTags] = useState("");
  const [itemFeeling, setItemFeeling] = useState("");
  const [itemEmotionalNote, setItemEmotionalNote] = useState("");

  // Fetch user context data
  useEffect(() => {
    if (!user) return;
    const fetchContext = async () => {
      const [intRes, skillRes, ezRes] = await Promise.all([
        supabase.from("interests").select("*").eq("user_id", user.id).limit(20),
        supabase.from("skill_items" as any).select("*").eq("user_id", user.id).limit(20),
        supabase.from("energy_zones").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(10),
      ]);
      setUserInterests((intRes.data as any[]) || []);
      setUserSkills((skillRes.data as any[]) || []);
      setUserEnergyZones((ezRes.data as any[]) || []);
    };
    fetchContext();
  }, [user]);

  const fetchBoards = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("moodboards")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setBoards((data as any[]) || []);
    setLoading(false);
  }, [user]);

  const fetchAllItems = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("moodboard_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setAllItems((data as any[]) || []);
  }, [user]);

  const fetchItems = useCallback(async (boardId: string) => {
    const { data } = await supabase
      .from("moodboard_items")
      .select("*")
      .eq("moodboard_id", boardId)
      .order("created_at", { ascending: false });
    setItems((data as any[]) || []);
  }, []);

  useEffect(() => { fetchBoards(); fetchAllItems(); }, [fetchBoards, fetchAllItems]);
  useEffect(() => { if (selectedBoard) fetchItems(selectedBoard.id); }, [selectedBoard, fetchItems]);

  const buildAIContext = () => ({
    profile: { name: profile?.full_name, industry: profile?.industry, goals: profile?.short_term_goals, long_term: profile?.long_term_goals, areas: profile?.areas_of_focus, stage: profile?.career_stage },
    boards: boards.map(b => ({ title: b.title, theme: b.theme, created: b.created_at })),
    items: allItems.slice(0, 20).map(i => ({ title: i.title, content: i.content?.slice(0, 120), tags: i.tags, mood: i.mood_feeling, note: i.emotional_note, created: i.created_at })),
    theme: selectedBoard?.theme,
    interests: userInterests.map(i => ({ name: i.name, category: i.category, strength: i.strength })),
    skills: userSkills.map((s: any) => ({ name: s.skill_name || s.name, level: s.current_level })),
    energyZones: userEnergyZones.map(e => ({ domain: e.domain, energy: e.energy_level, mood_after: e.mood_after })),
  });

  const createBoard = async () => {
    if (!user || !newTitle.trim()) return;
    const { error } = await supabase.from("moodboards").insert({
      user_id: user.id, title: newTitle.trim(), description: newDesc.trim() || null, theme: newTheme, tags: [],
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Board created!");
    setNewTitle(""); setNewDesc(""); setNewTheme("dream-roles"); setShowCreateBoard(false);
    fetchBoards();
    checkMilestones("board_created");
  };

  const deleteBoard = async (id: string) => {
    await supabase.from("moodboards").delete().eq("id", id);
    if (selectedBoard?.id === id) { setSelectedBoard(null); setItems([]); }
    fetchBoards();
    toast.success("Board deleted");
  };

  const toggleShared = async (board: Board) => {
    await supabase.from("moodboards").update({ is_shared: !board.is_shared } as any).eq("id", board.id);
    fetchBoards();
    toast.success(board.is_shared ? "Board set to private" : "Board shared with mentors & peers!");
  };

  const addItem = async () => {
    if (!user || !selectedBoard || !itemContent.trim()) return;
    const { error } = await supabase.from("moodboard_items").insert({
      user_id: user.id, moodboard_id: selectedBoard.id, content_type: itemType,
      title: itemTitle.trim() || null, content: itemContent.trim(),
      url: itemUrl.trim() || null,
      tags: itemTags ? itemTags.split(",").map(t => t.trim()) : [],
      goal_tags: itemGoalTags ? itemGoalTags.split(",").map(t => t.trim()) : [],
      emotional_note: itemEmotionalNote.trim() || null, mood_feeling: itemFeeling || null,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Item added!");
    setItemTitle(""); setItemContent(""); setItemUrl(""); setItemTags(""); setItemGoalTags(""); setItemFeeling(""); setItemEmotionalNote("");
    setShowAddItem(false);
    fetchItems(selectedBoard.id);
    fetchAllItems();
    checkMilestones("item_added");
  };

  const deleteItem = async (id: string) => {
    await supabase.from("moodboard_items").delete().eq("id", id);
    if (selectedBoard) fetchItems(selectedBoard.id);
    fetchAllItems();
    toast.success("Item removed");
  };

  const checkMilestones = async (_action: string) => {
    // Moodboard milestone badges are awarded server-side via the Achievements scanner.
  };


  const callAI = async (mode: string, extra?: any) => {
    setAiLoading(true);
    try {
      const ctx = buildAIContext();
      const { data } = await supabase.functions.invoke("moodboard-ai", {
        body: { mode, context: "career", ...ctx, ...extra },
      });
      if (data?.error) { toast.error(data.error); setAiLoading(false); return data; }
      // Route results
      if (mode === "emotion_insights") setEmotionInsights(data);
      else if (mode === "goal_mapping") setGoalMapping(data);
      else if (mode === "evolution_analysis") setEvolutionData(data);
      else if (mode === "guided_reflection") setReflectionResult(data);
      else setAiSuggestions(data.suggestions || data.boards || data.trending || []);
      if (data.prompt) setAiSuggestions([{ title: "Reflection", content: data.prompt, follow_ups: data.follow_ups, insight: data.insight }]);
      return data;
    } catch { toast.error("AI unavailable"); }
    setAiLoading(false);
  };

  const addSuggestionAsItem = async (s: any) => {
    if (!user || !selectedBoard) return;
    await supabase.from("moodboard_items").insert({
      user_id: user.id, moodboard_id: selectedBoard.id, content_type: s.content_type || "quote",
      title: s.title, content: s.content, tags: s.tags || [], goal_tags: [],
    } as any);
    toast.success("Added to board!");
    fetchItems(selectedBoard.id);
    fetchAllItems();
  };

  const submitReflection = async () => {
    if (!reflectionText.trim()) return;
    setAiLoading(true);
    await callAI("guided_reflection", { reflectionText });
    // Auto-save to journal
    if (user) {
      await supabase.from("journal_entries").insert({
        user_id: user.id, content: `**Moodboard Reflection**\n\n${reflectionText}`,
        tags: ["moodboard", "reflection"], mood: "reflective",
      } as any);
    }
    setAiLoading(false);
  };

  // Compute local emotion stats from allItems
  const emotionStats = (() => {
    const counts: Record<string, number> = {};
    allItems.forEach(i => { if (i.mood_feeling) counts[i.mood_feeling] = (counts[i.mood_feeling] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.slice(2), fullName: name, value })).sort((a, b) => b.value - a.value);
  })();

  const themeStats = (() => {
    const counts: Record<string, number> = {};
    boards.forEach(b => { counts[b.theme] = 0; });
    allItems.forEach(i => {
      const board = boards.find(b => b.id === i.moodboard_id);
      if (board) counts[board.theme] = (counts[board.theme] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/-/g, " "), value })).filter(d => d.value > 0);
  })();

  const typeIcon = (type: string) => {
    if (type === "quote") return <Quote className="h-4 w-4" />;
    if (type === "link") return <Link2 className="h-4 w-4" />;
    return <Type className="h-4 w-4" />;
  };

  const connectLinks = [
    { label: "Curiosity Compass", desc: "Explore new career domains to fuel your moodboard", icon: Compass, path: "/dashboard/curiosity-compass" },
    { label: "Project Playground", desc: "Find projects aligned with your aspirations", icon: Zap, path: "/dashboard/project-playground" },
    { label: "Content Library", desc: "Learn skills linked to your moodboard goals", icon: BookOpen, path: "/dashboard/content-library" },
    { label: "Roadmaps", desc: "Turn moodboard themes into structured career paths", icon: MapPin, path: "/dashboard/roadmap" },
    { label: "Mentor Matchmaking", desc: "Find mentors who match your moodboard interests", icon: Users, path: "/dashboard/mentor-matchmaking" },
    { label: "Peer Circles", desc: "Share your moodboards for peer feedback", icon: MessageSquare, path: "/dashboard/peer-circles" },
    { label: "Job Matching", desc: "Discover opportunities that match your aspirations", icon: Target, path: "/dashboard/job-matching" },
    { label: "SelfGraph", desc: "See how moodboard emotions connect to your identity", icon: Brain, path: "/dashboard/selfgraph" },
  ];

  // =========== BOARD DETAIL VIEW ===========
  if (selectedBoard) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { setSelectedBoard(null); setItems([]); setAiSuggestions([]); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-display text-foreground">{selectedBoard.title}</h1>
            {selectedBoard.description && <p className="text-sm font-body text-muted-foreground">{selectedBoard.description}</p>}
          </div>
          <Badge variant="outline" className="capitalize">{selectedBoard.theme.replace("-", " ")}</Badge>
          <Button variant="ghost" size="icon" onClick={() => toggleShared(selectedBoard)}>
            <Share2 className={`h-4 w-4 ${selectedBoard.is_shared ? "text-primary" : ""}`} />
          </Button>
        </div>

        {/* AI Tools */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => callAI("suggest_items")} disabled={aiLoading}>
            <Sparkles className="h-4 w-4 mr-1" /> Suggest Items
          </Button>
          <Button variant="outline" size="sm" onClick={() => callAI("reflection_prompt")} disabled={aiLoading}>
            <Lightbulb className="h-4 w-4 mr-1" /> Reflect
          </Button>
          <Button variant="outline" size="sm" onClick={() => callAI("community_inspiration")} disabled={aiLoading}>
            <RefreshCw className="h-4 w-4 mr-1" /> Trending
          </Button>
          <Button variant="outline" size="sm" onClick={() => callAI("goal_mapping")} disabled={aiLoading}>
            <Target className="h-4 w-4 mr-1" /> Map Goals
          </Button>
          <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add to Moodboard</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {CONTENT_TYPES.map(ct => (
                    <Button key={ct.value} variant={itemType === ct.value ? "default" : "outline"} size="sm" onClick={() => setItemType(ct.value)}>
                      <ct.icon className="h-4 w-4 mr-1" /> {ct.label}
                    </Button>
                  ))}
                </div>
                <Input placeholder="Title (optional)" value={itemTitle} onChange={e => setItemTitle(e.target.value)} />
                <Textarea placeholder={itemType === "quote" ? "Enter an inspiring quote..." : itemType === "link" ? "Describe this resource..." : "Your career aspiration, dream role, or insight..."} value={itemContent} onChange={e => setItemContent(e.target.value)} />
                {itemType === "link" && <Input placeholder="URL" value={itemUrl} onChange={e => setItemUrl(e.target.value)} />}
                <Input placeholder="Tags (comma-separated)" value={itemTags} onChange={e => setItemTags(e.target.value)} />
                <Input placeholder="Goal tags (comma-separated)" value={itemGoalTags} onChange={e => setItemGoalTags(e.target.value)} />
                <Select value={itemFeeling} onValueChange={setItemFeeling}>
                  <SelectTrigger><SelectValue placeholder="How does this make you feel?" /></SelectTrigger>
                  <SelectContent>{FEELINGS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
                <Textarea placeholder="Why does this inspire you? (reflection)" value={itemEmotionalNote} onChange={e => setItemEmotionalNote(e.target.value)} rows={2} />
                <Button onClick={addItem} className="w-full bg-primary text-primary-foreground" disabled={!itemContent.trim()}>Add to Board</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goal Mapping Results */}
        <AnimatePresence>
          {goalMapping && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Goal Mapping</h3>
                <div className="flex items-center gap-2">
                  {goalMapping.momentum_score != null && <Badge variant="secondary">Momentum: {goalMapping.momentum_score}%</Badge>}
                  <Button variant="ghost" size="sm" onClick={() => setGoalMapping(null)}>✕</Button>
                </div>
              </div>
              {goalMapping.overall_direction && <p className="font-body text-sm text-muted-foreground">{goalMapping.overall_direction}</p>}
              <div className="space-y-3">
                {goalMapping.goal_paths?.map((g: any, i: number) => (
                  <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm">{g.aspiration}</span>
                      <Badge variant={g.current_alignment > 60 ? "default" : "outline"}>{g.current_alignment}% aligned</Badge>
                    </div>
                    {g.next_steps?.map((s: any, j: number) => (
                      <div key={j} className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px] capitalize">{s.type}</Badge>
                        <span>{s.action}</span>
                        {s.priority === "high" && <Badge variant="destructive" className="text-[10px]">High</Badge>}
                      </div>
                    ))}
                    {g.suggested_skill && <p className="text-xs font-body text-primary">Skill to build: {g.suggested_skill}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Suggestions */}
        <AnimatePresence>
          {aiSuggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
              <h3 className="font-body text-sm font-semibold text-muted-foreground">✨ AI Suggestions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiSuggestions.map((s, i) => (
                  <div key={i} className="bg-accent/10 border border-accent/30 rounded-xl p-4 space-y-2">
                    <p className="font-display text-sm">{s.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{s.content || s.description}</p>
                    {s.why && <p className="font-body text-xs italic text-muted-foreground">💡 {s.why}</p>}
                    {s.insight && <p className="font-body text-xs italic text-muted-foreground">🔮 {s.insight}</p>}
                    {s.follow_ups && <div className="space-y-1">{s.follow_ups.map((f: string, j: number) => <p key={j} className="font-body text-xs text-muted-foreground">→ {f}</p>)}</div>}
                    {s.tags && <div className="flex gap-1 flex-wrap">{s.tags.map((t: string) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>}
                    {s.content_type && <Button size="sm" variant="outline" onClick={() => addSuggestionAsItem(s)} className="mt-1"><Plus className="h-3 w-3 mr-1" /> Add</Button>}
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAiSuggestions([])}>Dismiss</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center">
            <Palette className="mx-auto text-muted-foreground mb-3" size={40} />
            <p className="font-display text-lg text-foreground">Your board is empty</p>
            <p className="font-body text-sm text-muted-foreground mt-1">Add career cards, quotes, or let AI inspire you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                <div className={`group relative bg-card rounded-xl border border-border p-4 space-y-2 hover:shadow-md transition-shadow ${item.content_type === "quote" ? "bg-accent/5 border-accent/20" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {typeIcon(item.content_type)}
                      {item.title && <span className="font-display text-sm">{item.title}</span>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteItem(item.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <p className={`font-body text-sm ${item.content_type === "quote" ? "italic font-display text-base" : ""}`}>{item.content}</p>
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-body text-xs text-primary underline truncate block">{item.url}</a>}
                  {item.mood_feeling && <span className="font-body text-xs">{item.mood_feeling}</span>}
                  {item.emotional_note && <p className="font-body text-xs text-muted-foreground italic border-l-2 border-accent pl-2">{item.emotional_note}</p>}
                  <div className="flex gap-1 flex-wrap">
                    {item.tags?.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                    {item.goal_tags?.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // =========== MAIN VIEW WITH TABS ===========
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Palette size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Career Moodboard</h1>
            <p className="font-body text-sm text-muted-foreground">Your career is more than a checklist. Let your ideas, dreams, and goals come alive.</p>
          </div>
        </div>
        <ModuleSearchBar
          placeholder="Search domains, career paths, inspirations..."
          sources={["careers", "domains"]}
          compact
          showAiBadge
          onSelect={(item) => {
            toast.info(`Add "${item.title}" to your moodboard`);
          }}
        />
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg font-body text-sm transition-all whitespace-nowrap ${
              activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse font-body text-muted-foreground text-center py-12">Loading...</div>
      ) : activeTab === "Boards" ? (
        /* ====== BOARDS TAB ====== */
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-body text-sm text-muted-foreground">{boards.length} board{boards.length !== 1 ? "s" : ""} · {allItems.length} item{allItems.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => callAI("suggest_boards")} disabled={aiLoading}>
                <Sparkles className="h-4 w-4 mr-1" /> Suggest Boards
              </Button>
              <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground"><Plus className="h-4 w-4 mr-1" /> New Board</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create a Career Board</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Input placeholder="Board title (e.g., Dream Roles, Tech Careers)" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                    <Textarea placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} />
                    <Select value={newTheme} onValueChange={setNewTheme}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{THEMES.map(t => <SelectItem key={t} value={t}>{t.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={createBoard} className="w-full bg-primary text-primary-foreground" disabled={!newTitle.trim()}>Create Board</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* AI Board Suggestions */}
          <AnimatePresence>
            {aiSuggestions.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                <h3 className="font-body text-sm text-muted-foreground">✨ Suggested Boards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiSuggestions.map((s, i) => (
                    <div key={i} className="bg-accent/10 border border-accent/30 rounded-xl p-4 space-y-2">
                      <p className="font-display text-sm">{s.title}</p>
                      <p className="font-body text-xs text-muted-foreground">{s.description}</p>
                      <Button size="sm" variant="outline" onClick={() => { setNewTitle(s.title); setNewDesc(s.description || ""); setNewTheme(s.theme || "dream-roles"); setShowCreateBoard(true); }}>
                        <Plus className="h-3 w-3 mr-1" /> Create
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setAiSuggestions([])}>Dismiss</Button>
              </motion.div>
            )}
          </AnimatePresence>

          {boards.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Palette className="mx-auto text-muted-foreground mb-3" size={40} />
              <h3 className="font-display text-xl text-foreground mb-2">No boards yet</h3>
              <p className="font-body text-muted-foreground">Create your first career moodboard to collect your dreams and aspirations!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boards.map((board, i) => (
                <motion.div key={board.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-all group"
                  onClick={() => setSelectedBoard(board)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">{board.title}</h3>
                      {board.description && <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-2">{board.description}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      {board.is_shared && <Share2 size={12} className="text-primary" />}
                      <Badge variant="outline" className="capitalize text-[10px]">{board.theme.replace("-", " ")}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-body text-[10px] text-muted-foreground">{new Date(board.updated_at).toLocaleDateString()}</span>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === "Discover" ? (
        /* ====== DISCOVER TAB ====== */
        <div className="space-y-4">
          <Button onClick={() => callAI("community_inspiration")} disabled={aiLoading} className="w-full" variant="outline">
            <RefreshCw size={16} className={aiLoading ? "animate-spin" : ""} />
            {aiLoading ? "Discovering..." : "Discover Career Inspirations"}
          </Button>
          {aiSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiSuggestions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="bg-card rounded-xl border border-border p-4 space-y-2">
                    <p className="font-display text-sm">{s.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{s.content || s.description}</p>
                    {s.tags && <div className="flex gap-1 flex-wrap">{s.tags.map((t: string) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>}
                    {s.category && <Badge variant="outline" className="text-[10px] capitalize">{s.category}</Badge>}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Sparkles className="mx-auto text-muted-foreground mb-3" size={32} />
              <p className="font-body text-sm text-muted-foreground">Click above to discover trending career inspirations!</p>
            </div>
          )}
        </div>
      ) : activeTab === "Insights" ? (
        /* ====== INSIGHTS TAB ====== */
        <div className="space-y-6">
          {/* Local emotion distribution */}
          {emotionStats.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h3 className="font-display text-base flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Emotion Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={emotionStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {emotionStats.map((_, i) => <Cell key={i} fill={EMOTION_COLORS[i % EMOTION_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Theme distribution */}
          {themeStats.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h3 className="font-display text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Items by Theme</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={themeStats}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI Deep Insights */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => callAI("emotion_insights")} disabled={aiLoading}>
              <Brain className="h-4 w-4 mr-1" /> Emotion Analysis
            </Button>
            <Button variant="outline" size="sm" onClick={() => callAI("evolution_analysis")} disabled={aiLoading}>
              <TrendingUp className="h-4 w-4 mr-1" /> Evolution Tracker
            </Button>
          </div>

          {emotionInsights && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base">🧠 AI Emotion Analysis</h3>
                <Button variant="ghost" size="sm" onClick={() => setEmotionInsights(null)}>✕</Button>
              </div>
              {emotionInsights.growth_narrative && <p className="font-body text-sm text-muted-foreground">{emotionInsights.growth_narrative}</p>}
              {emotionInsights.dominant_emotions?.map((e: any, i: number) => (
                <div key={i} className="bg-muted/30 rounded-lg p-3">
                  <p className="font-display text-sm">{e.emotion} <Badge variant="secondary" className="text-[10px] ml-2">×{e.frequency}</Badge></p>
                  <p className="font-body text-xs text-muted-foreground">{e.interpretation}</p>
                </div>
              ))}
              {emotionInsights.strengths_revealed?.length > 0 && (
                <div><p className="font-body text-xs font-semibold text-muted-foreground mb-1">Strengths Revealed</p>
                  <div className="flex gap-1 flex-wrap">{emotionInsights.strengths_revealed.map((s: string, i: number) => <Badge key={i} variant="default" className="text-[10px]">{s}</Badge>)}</div>
                </div>
              )}
              {emotionInsights.blind_spots?.length > 0 && (
                <div><p className="font-body text-xs font-semibold text-muted-foreground mb-1">Blind Spots</p>
                  <div className="flex gap-1 flex-wrap">{emotionInsights.blind_spots.map((s: string, i: number) => <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
                </div>
              )}
              {emotionInsights.next_exploration && <p className="font-body text-xs text-primary">Next: {emotionInsights.next_exploration}</p>}
            </motion.div>
          )}

          {evolutionData && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base">📈 Evolution Tracker</h3>
                <div className="flex items-center gap-2">
                  {evolutionData.consistency_score != null && <Badge variant="secondary">Consistency: {evolutionData.consistency_score}%</Badge>}
                  <Button variant="ghost" size="sm" onClick={() => setEvolutionData(null)}>✕</Button>
                </div>
              </div>
              {evolutionData.growth_trajectory && <p className="font-body text-sm text-muted-foreground">{evolutionData.growth_trajectory}</p>}
              {evolutionData.evolution_phases?.map((p: any, i: number) => (
                <div key={i} className="bg-muted/30 rounded-lg p-3">
                  <p className="font-display text-sm">{p.period}</p>
                  <p className="font-body text-xs text-muted-foreground">Theme: {p.dominant_theme} · Tone: {p.emotional_tone}</p>
                  <p className="font-body text-xs text-primary">{p.key_shift}</p>
                </div>
              ))}
              {evolutionData.celebration && <p className="font-body text-sm text-primary font-semibold">🎉 {evolutionData.celebration}</p>}
            </motion.div>
          )}

          {allItems.length === 0 && !emotionInsights && !evolutionData && (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <BarChart3 className="mx-auto text-muted-foreground mb-3" size={32} />
              <p className="font-body text-sm text-muted-foreground">Add items to your boards to see insights about your emotional patterns and growth.</p>
            </div>
          )}
        </div>
      ) : activeTab === "Reflect" ? (
        /* ====== REFLECT TAB ====== */
        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="font-display text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Guided Reflection</h3>
            <p className="font-body text-sm text-muted-foreground">Look at your moodboards and take a moment to reflect. What patterns do you see? What excites you most?</p>
            <Textarea
              placeholder="What would your dream career look like in your life? What themes keep showing up in your boards? What feels most 'you'?"
              value={reflectionText}
              onChange={e => setReflectionText(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <Button onClick={submitReflection} disabled={!reflectionText.trim() || aiLoading} className="bg-primary text-primary-foreground">
              {aiLoading ? "Reflecting..." : "Submit Reflection"}
            </Button>
          </div>

          {reflectionResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base">💭 Reflection Insights</h3>
                <Button variant="ghost" size="sm" onClick={() => setReflectionResult(null)}>✕</Button>
              </div>
              {reflectionResult.acknowledgment && <p className="font-body text-sm">{reflectionResult.acknowledgment}</p>}
              {reflectionResult.patterns_noticed?.length > 0 && (
                <div>
                  <p className="font-body text-xs font-semibold text-muted-foreground mb-1">Patterns Noticed</p>
                  {reflectionResult.patterns_noticed.map((p: string, i: number) => (
                    <p key={i} className="font-body text-sm text-muted-foreground">• {p}</p>
                  ))}
                </div>
              )}
              {reflectionResult.connection_to_goals && <p className="font-body text-sm text-primary">🎯 {reflectionResult.connection_to_goals}</p>}
              {reflectionResult.deeper_questions?.length > 0 && (
                <div>
                  <p className="font-body text-xs font-semibold text-muted-foreground mb-1">Go Deeper</p>
                  {reflectionResult.deeper_questions.map((q: string, i: number) => (
                    <p key={i} className="font-body text-sm text-muted-foreground italic">→ {q}</p>
                  ))}
                </div>
              )}
              {reflectionResult.affirmation && (
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                  <p className="font-body text-sm text-primary font-semibold">💛 {reflectionResult.affirmation}</p>
                </div>
              )}
              {reflectionResult.suggested_action && <p className="font-body text-sm">Next step: {reflectionResult.suggested_action}</p>}
            </motion.div>
          )}

          {/* Quick reflection prompts */}
          <div className="space-y-3">
            <h3 className="font-display text-base text-muted-foreground">Quick Prompts</h3>
            {[
              "What excites you most about your moodboard?",
              "If you could only keep 3 items, which would they be and why?",
              "What would this look like in your life a year from now?",
              "What's missing from your moodboard that you've been avoiding?"
            ].map((prompt, i) => (
              <button key={i} onClick={() => setReflectionText(prompt)}
                className="w-full text-left bg-muted/30 hover:bg-muted/50 rounded-lg p-3 font-body text-sm text-foreground transition-colors">
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ====== CONNECT TAB ====== */
        <div className="space-y-4">
          <p className="font-body text-sm text-muted-foreground">Your moodboard connects to every part of your career journey. Explore related tools:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {connectLinks.map((link, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/30 transition-all group"
                onClick={() => navigate(link.path)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <link.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm text-foreground group-hover:text-primary transition-colors">{link.label}</h4>
                    <p className="font-body text-xs text-muted-foreground">{link.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats summary */}
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            <h3 className="font-display text-base flex items-center gap-2"><Award className="h-4 w-4 text-primary" /> Moodboard Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="font-display text-2xl text-foreground">{boards.length}</p>
                <p className="font-body text-xs text-muted-foreground">Boards</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl text-foreground">{allItems.length}</p>
                <p className="font-body text-xs text-muted-foreground">Items</p>
              </div>
              <div className="text-center">
                <p className="font-display text-2xl text-foreground">{boards.filter(b => b.is_shared).length}</p>
                <p className="font-body text-xs text-muted-foreground">Shared</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerMoodboard;
