import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Navigation, MessageSquare, Target, Palette, Layers, Sparkles, ArrowLeft,
  Brain, Loader2, Trophy,
} from "lucide-react";
import CareerCardDeck from "@/components/career/CareerCardDeck";
import StoryModeCards from "@/components/career/StoryModeCards";
import ChallengeModeCards from "@/components/career/ChallengeModeCards";
import BlueprintCard, { type Blueprint } from "@/components/career/BlueprintCard";
import TrendingSectorRail from "@/components/career/TrendingSectorRail";
import { CompassInsightsPanel, CompassDomainsPanel, CompassQuestsPanel } from "@/components/career/CompassSignalPanels";
import { useUserSignals } from "@/hooks/useUserSignals";
import { useCuratedCompassFilter } from "@/hooks/useCuratedCompassFilter";
import { buildBlueprintFromInteractions } from "@/lib/buildBlueprint";
import { generateBlueprintRoadmap } from "@/lib/blueprintRoadmap";

const VISUAL_ICONS = [
  { id: "code", emoji: "💻", label: "Technology" },
  { id: "art", emoji: "🎨", label: "Art & Design" },
  { id: "science", emoji: "🔬", label: "Science" },
  { id: "business", emoji: "📊", label: "Business" },
  { id: "people", emoji: "🤝", label: "People & Community" },
  { id: "writing", emoji: "✍️", label: "Writing" },
  { id: "health", emoji: "🏥", label: "Healthcare" },
  { id: "nature", emoji: "🌱", label: "Environment" },
  { id: "music", emoji: "🎵", label: "Music & Media" },
  { id: "education", emoji: "📚", label: "Education" },
  { id: "law", emoji: "⚖️", label: "Law & Policy" },
  { id: "sports", emoji: "⚽", label: "Sports & Fitness" },
  { id: "finance", emoji: "💰", label: "Finance" },
  { id: "travel", emoji: "✈️", label: "Travel & Culture" },
  { id: "food", emoji: "🍳", label: "Food & Hospitality" },
  { id: "engineering", emoji: "⚙️", label: "Engineering" },
];

const TABS = [
  { id: "visual", label: "Visual Mode", icon: Palette, desc: "Pick icons that resonate" },
  { id: "cards", label: "Career Cards", icon: Layers, desc: "Browse detailed career path cards" },
  { id: "story", label: "Story Mode", icon: MessageSquare, desc: "Real career stories from professionals" },
  { id: "challenge", label: "Challenge Mode", icon: Target, desc: "Real-world tasks from each field" },
  { id: "insights", label: "Insights & Behavior", icon: Sparkles, desc: "Compass conclusions + behavior signals" },
  { id: "domains", label: "Domains", icon: Brain, desc: "Personalized domain recommendations" },
  { id: "quests", label: "Quests", icon: Trophy, desc: "Guided reflection quests" },
];

const CareerNavigator = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { recordMultipleSignals } = useUserSignals();
  const { data: personalization, hasPersonalization } = useCuratedCompassFilter();

  const [tab, setTab] = useState("visual");
  const [visualSelections, setVisualSelections] = useState<string[]>([]);
  const [visualBlueprint, setVisualBlueprint] = useState<Blueprint | null>(null);
  const [showVisualBlueprint, setShowVisualBlueprint] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  // Hydrate visual mode selections from onboarding sectors so the panel feels personalized
  useEffect(() => {
    if (!hasPersonalization || !personalization?.sectors?.length) return;
    const mapToIcon = (s: string): string | null => {
      const lc = s.toLowerCase();
      if (lc.includes("tech") || lc.includes("software")) return "code";
      if (lc.includes("health") || lc.includes("medic")) return "health";
      if (lc.includes("finance") || lc.includes("bank")) return "finance";
      if (lc.includes("educat")) return "education";
      if (lc.includes("art") || lc.includes("design")) return "art";
      if (lc.includes("media") || lc.includes("entertain")) return "music";
      if (lc.includes("legal") || lc.includes("law")) return "law";
      if (lc.includes("sport")) return "sports";
      if (lc.includes("hospital") || lc.includes("food")) return "food";
      if (lc.includes("travel") || lc.includes("tour")) return "travel";
      if (lc.includes("engineer") || lc.includes("manufactur")) return "engineering";
      if (lc.includes("agri") || lc.includes("environ")) return "nature";
      if (lc.includes("business") || lc.includes("retail")) return "business";
      if (lc.includes("science")) return "science";
      if (lc.includes("ngo") || lc.includes("commun")) return "people";
      if (lc.includes("writ") || lc.includes("publish")) return "writing";
      return null;
    };
    const preset = Array.from(
      new Set(personalization.sectors.map(mapToIcon).filter(Boolean) as string[])
    );
    if (preset.length) setVisualSelections((prev) => (prev.length ? prev : preset));
  }, [hasPersonalization, personalization?.sectors]);

  const handleVisualToggle = (id: string) =>
    setVisualSelections((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));

  const finishVisualMode = async () => {
    if (!user) return;
    const labels = VISUAL_ICONS.filter((v) => visualSelections.includes(v.id)).map((v) => v.label);
    for (const label of labels) {
      await supabase.from("interests").upsert(
        {
          user_id: user.id,
          name: label,
          category: "visual_exploration",
          source: "career_navigator_visual",
          strength: 0.7,
        },
        { onConflict: "user_id,name,category" }
      );
    }
    await recordMultipleSignals("visual_mode", labels, "domain_interest", 0.7);

    const synthCards = VISUAL_ICONS.map((v) => ({ id: v.id, domain: v.label, title: v.label }));
    const synthInteractions: Record<string, "love"> = {};
    visualSelections.forEach((id) => (synthInteractions[id] = "love"));
    const bp = buildBlueprintFromInteractions(synthCards, synthInteractions, "visual");
    setVisualBlueprint(bp);
    setShowVisualBlueprint(true);
    toast.success("Visual blueprint ready 🎨");
  };

  const generateVisualRoadmap = async () => {
    if (!user || !visualBlueprint) return;
    setGeneratingRoadmap(true);
    try {
      await generateBlueprintRoadmap(
        user.id,
        {
          shortTermGoals:
            visualBlueprint.top_paths[0] || visualBlueprint.domains_attracted[0] || "Explore visual interests",
          longTermGoals: visualBlueprint.ai_summary,
          interests: [...visualBlueprint.domains_attracted, ...visualBlueprint.blind_spots].slice(0, 12),
          skills: visualBlueprint.skills_resonated,
          industry: visualBlueprint.domains_attracted[0] || "",
          careerStage: "exploring",
          areasOfFocus: visualBlueprint.top_paths.slice(0, 8),
          sourceContext: "career_navigator_visual",
        },
        `Personalized Roadmap — ${visualBlueprint.top_paths[0] || "Your Visual Path"}`,
        navigate
      );
    } catch (e) {
      console.error(e);
      toast.error("Could not generate roadmap.");
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const greeting = profile?.full_name?.split(" ")[0] || "Explorer";

  return (
    <div className="space-y-6 px-3 sm:px-4 py-4 sm:py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-border shadow-xl p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] to-accent/[0.03] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 shadow-md">
            <Navigation className="text-white" size={26} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-[#5500cb] tracking-tight">
              Career Navigator
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              Hey {greeting} — every card here is hand-picked from what you shared during onboarding and your Curiosity Compass results.
            </p>
            {hasPersonalization && personalization && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {personalization.sectors.slice(0, 4).map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0.5">
                    🎯 {s}
                  </Badge>
                ))}
                {personalization.keywords.slice(0, 4).map((k) => (
                  <Badge key={k.keyword} variant="outline" className="text-[10px] px-2 py-0.5">
                    #{k.keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/curiosity-compass")}
            className="rounded-full text-xs"
          >
            <ArrowLeft size={14} className="mr-1.5" /> Back to Compass
          </Button>
        </div>
      </div>

      {!hasPersonalization && (
        <Card className="border-warmth/30 bg-warmth/5 rounded-2xl">
          <CardContent className="pt-5 flex items-start gap-3">
            <Sparkles className="text-warmth shrink-0 mt-0.5" size={18} />
            <div className="space-y-1.5">
              <p className="font-body text-sm text-foreground">
                Finish your Curiosity Compass assessments first — Navigator cards become 10× more relevant once we know your sectors, archetype, and signals.
              </p>
              <Button size="sm" onClick={() => navigate("/dashboard/curiosity-compass")} className="text-xs">
                Take Curiosity Compass
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="bg-white rounded-full border border-border shadow-md p-1.5 inline-flex max-w-full overflow-x-auto scrollbar-none">
          <TabsList className="flex bg-transparent p-0 gap-1 border-none h-auto w-max">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 font-body text-xs font-bold border-none shadow-none ${
                    isActive
                      ? "bg-[#5500cb] text-white"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                  title={t.desc}
                >
                  <Icon size={14} />
                  <span className="whitespace-nowrap">{t.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Visual Mode */}
        <TabsContent value="visual" className="mt-6 space-y-6 outline-none">
          <Card className="rounded-3xl border-border shadow-xl overflow-hidden bg-white">
            <CardHeader className="pb-5 border-b border-border/40 bg-muted/10">
              <CardTitle className="text-lg font-display font-bold text-foreground">
                Pick the icons that spark curiosity
              </CardTitle>
              <CardDescription className="text-xs">
                Pre-selected from your onboarding sectors — add or remove anything. Trust your gut.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                {VISUAL_ICONS.map((icon) => {
                  const selected = visualSelections.includes(icon.id);
                  return (
                    <button
                      key={icon.id}
                      onClick={() => handleVisualToggle(icon.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                        selected
                          ? "border-primary bg-primary/[0.04] scale-[1.02] shadow-md font-semibold text-primary"
                          : "border-border/80 bg-card hover:border-primary/40 text-foreground"
                      }`}
                    >
                      <span className="text-3xl">{icon.emoji}</span>
                      <span className="font-body text-[10px] text-center font-medium leading-tight line-clamp-1">
                        {icon.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {visualSelections.length >= 3 && !showVisualBlueprint && (
                <div className="flex justify-center">
                  <Button onClick={finishVisualMode} size="sm" className="rounded-full px-8 h-10 text-xs font-semibold">
                    <Brain size={14} className="mr-2" /> Analyze Selections ({visualSelections.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {showVisualBlueprint && visualBlueprint && (
            <BlueprintCard
              blueprint={visualBlueprint}
              variant="visual"
              onGenerateRoadmap={generateVisualRoadmap}
              generatingRoadmap={generatingRoadmap}
              onClose={() => setShowVisualBlueprint(false)}
            />
          )}
        </TabsContent>

        {/* Career Cards */}
        <TabsContent value="cards" className="mt-6 outline-none">
          <CareerCardDeck />
        </TabsContent>

        {/* Story Mode */}
        <TabsContent value="story" className="mt-6 outline-none">
          <StoryModeCards />
        </TabsContent>

        {/* Challenge Mode */}
        <TabsContent value="challenge" className="mt-6 outline-none">
          <ChallengeModeCards />
        </TabsContent>
      </Tabs>

      {/* Trending picks from every sector */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="pt-4 border-t border-border/40"
      >
        <TrendingSectorRail perSector={5} />
      </motion.div>
    </div>
  );
};

export default CareerNavigator;
