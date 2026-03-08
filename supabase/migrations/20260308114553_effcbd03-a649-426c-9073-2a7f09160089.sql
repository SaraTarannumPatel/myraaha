-- SelfGraph Traits table for radar graph/identity web
CREATE TABLE public.selfgraph_traits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trait_name TEXT NOT NULL,
  trait_category TEXT NOT NULL DEFAULT 'cognitive',
  score REAL NOT NULL DEFAULT 0.5,
  confidence REAL DEFAULT 0.5,
  source TEXT DEFAULT 'system',
  evidence JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, trait_name)
);

-- Energy Zones table for tracking energy across domains/tasks
CREATE TABLE public.energy_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  task_type TEXT,
  energy_level INTEGER NOT NULL DEFAULT 5,
  engagement_score REAL DEFAULT 0.5,
  time_spent_minutes INTEGER DEFAULT 0,
  mood_before TEXT,
  mood_after TEXT,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Behavior Patterns table for pattern tracker timeline
CREATE TABLE public.behavior_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL,
  pattern_description TEXT NOT NULL,
  frequency TEXT DEFAULT 'recurring',
  strength REAL DEFAULT 0.5,
  domains_affected TEXT[] DEFAULT '{}'::text[],
  first_observed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_observed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  occurrences INTEGER DEFAULT 1,
  is_positive BOOLEAN DEFAULT true,
  ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Identity Evaluations table for periodic trait assessments
CREATE TABLE public.identity_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  evaluation_type TEXT NOT NULL,
  confidence_score REAL DEFAULT 0.5,
  resilience_score REAL DEFAULT 0.5,
  adaptability_score REAL DEFAULT 0.5,
  creativity_score REAL DEFAULT 0.5,
  leadership_score REAL DEFAULT 0.5,
  collaboration_score REAL DEFAULT 0.5,
  problem_solving_score REAL DEFAULT 0.5,
  emotional_intelligence_score REAL DEFAULT 0.5,
  overall_growth REAL DEFAULT 0.0,
  reflection TEXT,
  ai_feedback JSONB DEFAULT '{}'::jsonb,
  evaluated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Domain Affinity table for tracking interest in different domains
CREATE TABLE public.domain_affinity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain_name TEXT NOT NULL,
  affinity_score REAL NOT NULL DEFAULT 0.5,
  time_invested_minutes INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  content_consumed INTEGER DEFAULT 0,
  trend TEXT DEFAULT 'stable',
  last_interaction TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain_name)
);

-- Clarity Scores table for clarity meter
CREATE TABLE public.clarity_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  overall_clarity REAL NOT NULL DEFAULT 0.5,
  goal_alignment REAL DEFAULT 0.5,
  interest_alignment REAL DEFAULT 0.5,
  activity_alignment REAL DEFAULT 0.5,
  direction_confidence REAL DEFAULT 0.5,
  reflection_prompt TEXT,
  user_reflection TEXT,
  factors JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Weekly Digests table for evolution summaries
CREATE TABLE public.weekly_digests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  skills_progress JSONB DEFAULT '{}'::jsonb,
  mood_summary JSONB DEFAULT '{}'::jsonb,
  energy_patterns JSONB DEFAULT '{}'::jsonb,
  domain_shifts JSONB DEFAULT '{}'::jsonb,
  key_achievements TEXT[] DEFAULT '{}'::text[],
  challenges_faced TEXT[] DEFAULT '{}'::text[],
  ai_summary TEXT,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Mentor Shares table for mentor insight sync permissions
CREATE TABLE public.mentor_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mentor_id UUID NOT NULL,
  shared_sections TEXT[] DEFAULT '{}'::text[],
  share_traits BOOLEAN DEFAULT false,
  share_energy BOOLEAN DEFAULT false,
  share_patterns BOOLEAN DEFAULT false,
  share_evaluations BOOLEAN DEFAULT false,
  share_clarity BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mentor_id)
);

-- Reflection Prompts table
CREATE TABLE public.reflection_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt_text TEXT NOT NULL,
  context TEXT,
  trigger_type TEXT DEFAULT 'task_completion',
  user_response TEXT,
  mood_after TEXT,
  insights_generated JSONB DEFAULT '{}'::jsonb,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.selfgraph_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_affinity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflection_prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can CRUD own selfgraph traits" ON public.selfgraph_traits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own energy zones" ON public.energy_zones
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own behavior patterns" ON public.behavior_patterns
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own identity evaluations" ON public.identity_evaluations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own domain affinity" ON public.domain_affinity
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own clarity scores" ON public.clarity_scores
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own weekly digests" ON public.weekly_digests
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own mentor shares" ON public.mentor_shares
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mentors can view shared data" ON public.mentor_shares
  FOR SELECT USING (auth.uid() = mentor_id AND is_active = true);

CREATE POLICY "Users can CRUD own reflection prompts" ON public.reflection_prompts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_selfgraph_traits_updated_at
  BEFORE UPDATE ON public.selfgraph_traits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domain_affinity_updated_at
  BEFORE UPDATE ON public.domain_affinity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_shares_updated_at
  BEFORE UPDATE ON public.mentor_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();