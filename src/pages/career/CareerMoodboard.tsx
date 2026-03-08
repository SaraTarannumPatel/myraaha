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
import {
  Plus, Sparkles, Share2, Link2, Type, Quote, Trash2, ArrowLeft,
  Lightbulb, RefreshCw, Palette, Heart, Target, BookOpen, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const TABS = ["Boards", "Discover"] as const;
type Tab = (typeof TABS)[number];

const CareerMoodboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Boards");
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

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

  const fetchItems = useCallback(async (boardId: string) => {
    const { data } = await supabase
      .from("moodboard_items")
      .select("*")
      .eq("moodboard_id", boardId)
      .order("created_at", { ascending: false });
    setItems((data as any[]) || []);
  }, []);

  useEffect(() => { fetchBoards(); }, [fetchBoards]);
  useEffect(() => { if (selectedBoard) fetchItems(selectedBoard.id); }, [selectedBoard, fetchItems]);

  const createBoard = async () => {
    if (!user || !newTitle.trim()) return;
    const { error } = await supabase.from("moodboards").insert({
      user_id: user.id,
      title: newTitle.trim(),
      description: newDesc.trim() || null,
      theme: newTheme,
      tags: [],
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Board created!");
    setNewTitle(""); setNewDesc(""); setNewTheme("dream-roles"); setShowCreateBoard(false);
    fetchBoards();
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
    toast.success(board.is_shared ? "Board set to private" : "Board shared!");
  };

  const addItem = async () => {
    if (!user || !selectedBoard || !itemContent.trim()) return;
    const { error } = await supabase.from("moodboard_items").insert({
      user_id: user.id,
      moodboard_id: selectedBoard.id,
      content_type: itemType,
      title: itemTitle.trim() || null,
      content: itemContent.trim(),
      url: itemUrl.trim() || null,
      tags: itemTags ? itemTags.split(",").map(t => t.trim()) : [],
      goal_tags: itemGoalTags ? itemGoalTags.split(",").map(t => t.trim()) : [],
      emotional_note: itemEmotionalNote.trim() || null,
      mood_feeling: itemFeeling || null,
    } as any);
    if (error) { toast.error(error.message); return; }
    toast.success("Item added!");
    setItemTitle(""); setItemContent(""); setItemUrl(""); setItemTags(""); setItemGoalTags(""); setItemFeeling(""); setItemEmotionalNote("");
    setShowAddItem(false);
    fetchItems(selectedBoard.id);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("moodboard_items").delete().eq("id", id);
    if (selectedBoard) fetchItems(selectedBoard.id);
    toast.success("Item removed");
  };

  const callAI = async (mode: string) => {
    setAiLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moodboard-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          mode,
          context: "career",
          profile: { name: profile?.full_name, industry: profile?.industry, goals: profile?.short_term_goals, areas: profile?.areas_of_focus, stage: profile?.career_stage },
          boards: boards.map(b => ({ title: b.title, theme: b.theme })),
          items: items.slice(0, 10).map(i => ({ title: i.title, content: i.content?.slice(0, 100), tags: i.tags })),
          theme: selectedBoard?.theme,
        }),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions || data.boards || data.trending || []);
      if (data.prompt) setAiSuggestions([{ title: "Reflection", content: data.prompt, follow_ups: data.follow_ups, insight: data.insight }]);
    } catch { toast.error("AI unavailable"); }
    setAiLoading(false);
  };

  const addSuggestionAsItem = async (s: any) => {
    if (!user || !selectedBoard) return;
    await supabase.from("moodboard_items").insert({
      user_id: user.id,
      moodboard_id: selectedBoard.id,
      content_type: s.content_type || "quote",
      title: s.title,
      content: s.content,
      tags: s.tags || [],
      goal_tags: [],
    } as any);
    toast.success("Added to board!");
    fetchItems(selectedBoard.id);
  };

  const typeIcon = (type: string) => {
    if (type === "quote") return <Quote className="h-4 w-4" />;
    if (type === "link") return <Link2 className="h-4 w-4" />;
    return <Type className="h-4 w-4" />;
  };

  // Board detail view
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
          <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-warm text-secondary-foreground"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
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
                <Button onClick={addItem} className="w-full gradient-warm text-secondary-foreground" disabled={!itemContent.trim()}>Add to Board</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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

  // Boards list
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center">
            <Palette size={20} className="text-secondary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Career Moodboard</h1>
            <p className="font-body text-sm text-muted-foreground">Your career is more than a checklist. Let your ideas, dreams, and goals come alive.</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-lg font-body text-sm transition-all ${
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
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="font-body text-sm text-muted-foreground">{boards.length} board{boards.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => callAI("suggest_boards")} disabled={aiLoading}>
                <Sparkles className="h-4 w-4 mr-1" /> Suggest Boards
              </Button>
              <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gradient-warm text-secondary-foreground"><Plus className="h-4 w-4 mr-1" /> New Board</Button>
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
                    <Button onClick={createBoard} className="w-full gradient-warm text-secondary-foreground" disabled={!newTitle.trim()}>Create Board</Button>
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
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
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
                    <span className="font-body text-[10px] text-muted-foreground">
                      {new Date(board.updated_at).toLocaleDateString()}
                    </span>
                    <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Discover Tab */
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
      )}
    </div>
  );
};

export default CareerMoodboard;
