-- Skill Fit Analysis table for storing AI-generated skill vs role analysis
CREATE TABLE public.skill_fit_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role_type TEXT NOT NULL,
  role_name TEXT NOT NULL,
  match_score REAL DEFAULT 0.0,
  skills_matched TEXT[] DEFAULT '{}'::text[],
  skills_missing TEXT[] DEFAULT '{}'::text[],
  recommendations JSONB DEFAULT '[]'::jsonb,
  is_eligible BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Decision Actions table for Decision Mirror feature
CREATE TABLE public.decision_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_title TEXT NOT NULL,
  action_description TEXT,
  impact_score REAL DEFAULT 0.0,
  skills_gained TEXT[] DEFAULT '{}'::text[],
  domains_explored TEXT[] DEFAULT '{}'::text[],
  related_entity_type TEXT,
  related_entity_id UUID,
  mood_at_action TEXT,
  reflection TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Resume Exports table for storing generated resume data
CREATE TABLE public.resume_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'My Living Resume',
  summary TEXT,
  skills_snapshot JSONB DEFAULT '[]'::jsonb,
  experiences_snapshot JSONB DEFAULT '[]'::jsonb,
  projects_snapshot JSONB DEFAULT '[]'::jsonb,
  achievements_snapshot JSONB DEFAULT '[]'::jsonb,
  certifications_snapshot JSONB DEFAULT '[]'::jsonb,
  ai_insights JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.skill_fit_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decision_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can CRUD own skill fit analysis" ON public.skill_fit_analysis
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own decision actions" ON public.decision_actions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own resume exports" ON public.resume_exports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public resumes are viewable" ON public.resume_exports
  FOR SELECT USING (is_public = true);

-- Triggers for updated_at
CREATE TRIGGER update_skill_fit_analysis_updated_at
  BEFORE UPDATE ON public.skill_fit_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resume_exports_updated_at
  BEFORE UPDATE ON public.resume_exports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();