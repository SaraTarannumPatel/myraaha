import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Heart, BookOpen, Bot, Smile, Meh, Frown, Star, Brain } from "lucide-react";

const moodOptions = [
  { emoji: "😊", label: "Energized", value: "energized" },
  { emoji: "😐", label: "Neutral", value: "neutral" },
  { emoji: "😰", label: "Stressed", value: "stressed" },
  { emoji: "🔥", label: "Motivated", value: "motivated" },
  { emoji: "💭", label: "Reflective", value: "reflective" },
];

interface MoodCheckInProps {
  intent?: string;
}

const MoodCheckIn = ({ intent = "career" }: MoodCheckInProps) => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user || !selectedMood) { toast.error("Select a mood first"); return; }
    setSaving(true);
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      title: `Mood check: ${selectedMood}`,
      content: note || `Feeling ${selectedMood} today.`,
      mood: selectedMood,
      intent: intent as any,
      tags: ["mood-check", "dashboard-reflection"],
    });
    if (error) toast.error("Failed to save");
    else { toast.success("Reflection saved! 🌱"); setSelectedMood(null); setNote(""); }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          How are you feeling?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          {moodOptions.map(m => (
            <button key={m.value} onClick={() => setSelectedMood(m.value)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                selectedMood === m.value ? "bg-primary/10 border border-primary/30" : "bg-muted/30 hover:bg-muted/50"
              }`}>
              <span className="text-lg">{m.emoji}</span>
              <span className="font-body text-[10px] text-muted-foreground">{m.label}</span>
            </button>
          ))}
        </div>
        {selectedMood && (
          <div className="space-y-2">
            <Textarea placeholder="Quick note about what's on your mind..." value={note} onChange={e => setNote(e.target.value)} rows={2} className="text-sm" />
            <Button size="sm" onClick={save} disabled={saving} className="font-body text-xs">
              {saving ? "Saving..." : "Save Reflection"}
            </Button>
          </div>
        )}
        <div className="flex gap-2 pt-1">
          <Link to="/dashboard/journal">
            <Button variant="outline" size="sm" className="text-xs">
              <BookOpen size={12} className="mr-1" /> Journal
            </Button>
          </Link>
          <Link to="/dashboard/career-therapist">
            <Button variant="outline" size="sm" className="text-xs">
              <Bot size={12} className="mr-1" /> Therapist
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodCheckIn;
