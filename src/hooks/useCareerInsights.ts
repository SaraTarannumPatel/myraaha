import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReadinessBreakdown {
  skills: number;
  interests: number;
  resume: number;
  activity: number;
  goals: number;
  roadmap: number;
}

interface Readiness {
  score: number;
  level: string;
  breakdown: ReadinessBreakdown;
}

interface Nudge {
  type: string;
  title: string;
  message: string;
  action_url: string;
  priority: "high" | "medium" | "low";
}

interface NextStep {
  title: string;
  description: string;
  action_url: string;
  category: string;
  priority: string;
}

interface Recommendations {
  next_steps: NextStep[];
  career_insight: string;
  encouragement: string;
  suggested_communities: string[];
  skill_gaps: string[];
  resume_tips: string[];
}

interface AutoResume {
  skills_summary: { name: string; level: number }[];
  interests_summary: string[];
  achievements_summary: string[];
  completedSteps: number;
  totalSteps: number;
}

interface CareerInsights {
  readiness: Readiness | null;
  nudges: Nudge[];
  recommendations: Recommendations | null;
  autoResume: AutoResume | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useCareerInsights = (): CareerInsights => {
  const { user } = useAuth();
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [autoResume, setAutoResume] = useState<AutoResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("career-insights");

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setReadiness(data.readiness);
      setNudges(data.nudges || []);
      setRecommendations(data.recommendations);
      setAutoResume(data.autoResume);
    } catch (e: any) {
      console.error("Career insights error:", e);
      setError(e.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    readiness,
    nudges,
    recommendations,
    autoResume,
    loading,
    error,
    refresh: fetchInsights,
  };
};
