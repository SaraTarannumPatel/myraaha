import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Sparkles, Share2, Heart, Link2, Type, Quote, Trash2, Eye, ArrowLeft, Lightbulb, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Moodboard {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  is_shared: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface MoodboardItem {
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

const THEMES = ["general", "ideas", "motivation", "problems", "mentors", "resources", "reflections"];
const CONTENT_TYPES = [
  { value: "text", label: "Text", icon: Type },
  { value: "quote", label: "Quote", icon: Quote },
  { value: "link", label: "Link", icon: Link2 },
];
const FEELINGS = ["🔥 Excited", "💡 Inspired", "🤔 Curious", "💪 Motivated", "😌 Calm", "😰 Anxious", "🎯 Focused"];

const Moodboard = () => {
  const { user, profile } = useAuth();
  const [boards, setBoards] = useState<Moodboard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Moodboard | null>(null);
  const [items, setItems] = useState<MoodboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [tab, setTab] = useState("boards");

  // New board form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTheme, setNewTheme] = useState("general");

  // New item form
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
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Board created!" });
    setNewTitle(""); setNewDesc(""); setNewTheme("general"); setShowCreateBoard(false);
    fetchBoards();
  };

  const deleteBoard = async (id: string) => {
    await supabase.from("moodboards").delete().eq("id", id);
    if (selectedBoard?.id === id) { setSelectedBoard(null); setItems([]); }
    fetchBoards();
    toast({ title: "Board deleted" });
  };

  const toggleShared = async (board: Moodboard) => {
    await supabase.from("moodboards").update({ is_shared: !board.is_shared } as any).eq("id", board.id);
    fetchBoards();
    toast({ title: board.is_shared ? "Board set to private" : "Board shared!" });
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
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Item added!" });
    setItemTitle(""); setItemContent(""); setItemUrl(""); setItemTags(""); setItemGoalTags(""); setItemFeeling(""); setItemEmotionalNote("");
    setShowAddItem(false);
    fetchItems(selectedBoard.id);
  };

  const deleteItem = async (id: string) => {
    await supabase.from("moodboard_items").delete().eq("id", id);
    if (selectedBoard) fetchItems(selectedBoard.id);
    toast({ title: "Item removed" });
  };

  const callAI = async (mode: string) => {
    setAiLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/moodboard-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          mode,
          profile: { name: profile?.full_name, industry: profile?.industry, goals: profile?.short_term_goals, areas: profile?.areas_of_focus },
          boards: boards.map(b => ({ title: b.title, theme: b.theme })),
          items: items.slice(0, 10).map(i => ({ title: i.title, content: i.content?.slice(0, 100), tags: i.tags })),
          theme: selectedBoard?.theme,
        }),
      });
      const data = await res.json();
      setAiSuggestions(data.suggestions || data.boards || data.trending || []);
      if (data.prompt) setAiSuggestions([{ title: "Reflection", content: data.prompt, follow_ups: data.follow_ups, insight: data.insight }]);
    } catch { toast({ title: "AI unavailable", variant: "destructive" }); }
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
    toast({ title: "Added to board!" });
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
            <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-foreground">{selectedBoard.title}</h1>
            {selectedBoard.description && <p className="text-sm text-muted-foreground">{selectedBoard.description}</p>}
          </div>
          <Badge variant="outline">{selectedBoard.theme}</Badge>
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
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
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
                <Textarea placeholder={itemType === "quote" ? "Enter quote..." : itemType === "link" ? "Describe the resource..." : "Write your thoughts..."} value={itemContent} onChange={e => setItemContent(e.target.value)} />
                {itemType === "link" && <Input placeholder="URL" value={itemUrl} onChange={e => setItemUrl(e.target.value)} />}
                <Input placeholder="Tags (comma-separated)" value={itemTags} onChange={e => setItemTags(e.target.value)} />
                <Input placeholder="Goal tags (comma-separated)" value={itemGoalTags} onChange={e => setItemGoalTags(e.target.value)} />
                <Select value={itemFeeling} onValueChange={setItemFeeling}>
                  <SelectTrigger><SelectValue placeholder="How does this make you feel?" /></SelectTrigger>
                  <SelectContent>{FEELINGS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
                <Textarea placeholder="Emotional reflection (optional)" value={itemEmotionalNote} onChange={e => setItemEmotionalNote(e.target.value)} rows={2} />
                <Button onClick={addItem} className="w-full" disabled={!itemContent.trim()}>Add to Board</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* AI Suggestions */}
        <AnimatePresence>
          {aiSuggestions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">✨ AI Suggestions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aiSuggestions.map((s, i) => (
                  <Card key={i} className="bg-accent/10 border-accent/30">
                    <CardContent className="p-4 space-y-2">
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.content || s.description}</p>
                      {s.why && <p className="text-xs italic text-muted-foreground">💡 {s.why}</p>}
                      {s.insight && <p className="text-xs italic text-muted-foreground">🔮 {s.insight}</p>}
                      {s.follow_ups && <div className="space-y-1">{s.follow_ups.map((f: string, j: number) => <p key={j} className="text-xs text-muted-foreground">→ {f}</p>)}</div>}
                      {s.tags && <div className="flex gap-1 flex-wrap">{s.tags.map((t: string) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>}
                      {s.content_type && <Button size="sm" variant="outline" onClick={() => addSuggestionAsItem(s)} className="mt-1">
                        <Plus className="h-3 w-3 mr-1" /> Add
                      </Button>}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAiSuggestions([])}>Dismiss</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items Grid */}
        {items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              <p className="font-[family-name:var(--font-display)] text-lg">Your board is empty</p>
              <p className="text-sm mt-1">Add items or let AI suggest inspirations to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card className={`group relative hover:shadow-md transition-shadow ${item.content_type === "quote" ? "bg-accent/10 border-accent/30" : ""}`}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {typeIcon(item.content_type)}
                        {item.title && <span className="font-medium text-sm">{item.title}</span>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    <p className={`text-sm ${item.content_type === "quote" ? "italic font-[family-name:var(--font-display)] text-base" : ""}`}>
                      {item.content}
                    </p>
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline truncate block">{item.url}</a>}
                    {item.mood_feeling && <span className="text-xs">{item.mood_feeling}</span>}
                    {item.emotional_note && <p className="text-xs text-muted-foreground italic border-l-2 border-accent pl-2">{item.emotional_note}</p>}
                    <div className="flex gap-1 flex-wrap">
                      {item.tags?.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                      {item.goal_tags?.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Boards list view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] text-foreground">Entrepreneurship Moodboard</h1>
        <p className="text-muted-foreground mt-1">Bring your ideas, inspirations, and goals to life. Explore, reflect, and shape your journey.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="boards">My Boards</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="boards" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{boards.length} board{boards.length !== 1 ? "s" : ""}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => callAI("suggest_boards")} disabled={aiLoading}>
                <Sparkles className="h-4 w-4 mr-1" /> Suggest Boards
              </Button>
              <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Board</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Create a Moodboard</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <Input placeholder="Board title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                    <Textarea placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} />
                    <Select value={newTheme} onValueChange={setNewTheme}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{THEMES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={createBoard} className="w-full" disabled={!newTitle.trim()}>Create Board</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* AI Board Suggestions */}
          <AnimatePresence>
            {aiSuggestions.length > 0 && tab === "boards" && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">✨ Suggested Boards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiSuggestions.map((s, i) => (
                    <Card key={i} className="bg-accent/10 border-accent/30 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => { setNewTitle(s.title); setNewDesc(s.description); setNewTheme(s.theme || "general"); setShowCreateBoard(true); }}>
                      <CardContent className="p-4">
                        <p className="font-medium text-sm">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setAiSuggestions([])}>Dismiss</Button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
            </div>
          ) : boards.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <p className="font-[family-name:var(--font-display)] text-xl text-foreground">Start Your First Moodboard</p>
                <p className="text-sm text-muted-foreground mt-2">Create boards around themes like goals, motivations, problems, or mentors.</p>
                <Button className="mt-4" onClick={() => setShowCreateBoard(true)}><Plus className="h-4 w-4 mr-1" /> Create Board</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board, i) => (
                <motion.div key={board.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="cursor-pointer hover:shadow-md transition-all group" onClick={() => setSelectedBoard(board)}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{board.title}</CardTitle>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); toggleShared(board); }}>
                            <Share2 className={`h-3.5 w-3.5 ${board.is_shared ? "text-primary" : ""}`} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => { e.stopPropagation(); deleteBoard(board.id); }}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      {board.description && <CardDescription className="text-xs">{board.description}</CardDescription>}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-1.5 items-center">
                        <Badge variant="outline" className="text-[10px]">{board.theme}</Badge>
                        {board.is_shared && <Badge variant="secondary" className="text-[10px]">Shared</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Trending inspirations from the community</p>
            <Button variant="outline" size="sm" onClick={() => callAI("community_inspiration")} disabled={aiLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${aiLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
          {aiSuggestions.length > 0 && tab === "discover" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiSuggestions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="bg-card hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.content}</p>
                      {s.category && <Badge variant="outline" className="text-[10px]">{s.category}</Badge>}
                      <div className="flex gap-1 flex-wrap">{s.tags?.map((t: string) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-accent" />
                <p>Click "Refresh" to discover trending inspirations for entrepreneurs.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Moodboard;
