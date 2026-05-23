-- Therapist sessions
CREATE TABLE IF NOT EXISTS public.therapist_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New conversation',
  context_snapshot jsonb DEFAULT '{}'::jsonb,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.therapist_sessions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users view own therapist sessions" ON public.therapist_sessions FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users insert own therapist sessions" ON public.therapist_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users update own therapist sessions" ON public.therapist_sessions FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users delete own therapist sessions" ON public.therapist_sessions FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_therapist_sessions_user ON public.therapist_sessions(user_id, last_message_at DESC);
DROP TRIGGER IF EXISTS trg_therapist_sessions_updated_at ON public.therapist_sessions;
CREATE TRIGGER trg_therapist_sessions_updated_at BEFORE UPDATE ON public.therapist_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.therapist_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.therapist_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.therapist_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users view own therapist messages" ON public.therapist_messages FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users insert own therapist messages" ON public.therapist_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users delete own therapist messages" ON public.therapist_messages FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_therapist_messages_session ON public.therapist_messages(session_id, created_at);

-- Job listings
CREATE TABLE IF NOT EXISTS public.job_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  source_url text NOT NULL UNIQUE,
  title text NOT NULL,
  company text,
  location text,
  remote_type text,
  experience_level text,
  employment_type text,
  salary_min_inr integer,
  salary_max_inr integer,
  description text,
  skills text[] DEFAULT '{}',
  industry text,
  posted_at timestamptz,
  scraped_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Job listings public read" ON public.job_listings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_job_listings_skills ON public.job_listings USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_job_listings_active ON public.job_listings(is_active, scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_listings_industry ON public.job_listings(industry);

-- Content library items
CREATE TABLE IF NOT EXISTS public.content_library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content_type text NOT NULL CHECK (content_type IN ('article','video','course','podcast','book','tool')),
  source_url text NOT NULL,
  source_name text,
  thumbnail_url text,
  difficulty text CHECK (difficulty IN ('beginner','intermediate','advanced')),
  duration_minutes integer,
  tags text[] DEFAULT '{}',
  topics text[] DEFAULT '{}',
  is_free boolean NOT NULL DEFAULT true,
  language text DEFAULT 'en',
  rating numeric(3,2),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.content_library_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Content library public read" ON public.content_library_items FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS idx_content_library_tags ON public.content_library_items USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_library_topics ON public.content_library_items USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_content_library_type ON public.content_library_items(content_type);

-- GIN indexes for taxonomy search
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='career_paths' AND column_name='keywords') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_career_paths_keywords_gin ON public.career_paths USING GIN(keywords)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='career_stories' AND column_name='tags') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_career_stories_tags_gin ON public.career_stories USING GIN(tags)';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='domain_challenge_cards' AND column_name='keywords') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_domain_challenge_keywords_gin ON public.domain_challenge_cards USING GIN(keywords)';
  END IF;
END $$;

-- Reward milestones (constraint allows only 25/50/75/100)
INSERT INTO public.reward_milestones (milestone_key, test_type, milestone_percent, title, description, reward_emoji, entitlement_key, entitlement_type, duration_hours, usage_limit, is_active) VALUES
  ('skillstacker_25',   'skillstacker',     25,  'First Skill Logged',     'You started stacking skills! Unlocked extended SkillStacker insights.',  '🧱', 'skillstacker_insights',     'feature_access', NULL, NULL, true),
  ('skillstacker_50',   'skillstacker',     50,  'Skill Builder',           'Halfway there! Unlocked AI skill-gap analysis.',                         '🛠️', 'skill_gap_analysis',        'feature_access', NULL, NULL, true),
  ('skillstacker_75',   'skillstacker',     75,  'Skill Strategist',        'Almost done. Unlocked personalized practice playbooks.',                 '🎯', 'practice_playbooks',        'feature_access', NULL, NULL, true),
  ('skillstacker_100',  'skillstacker',     100, 'Skill Stack Master',      'Stack complete! Unlocked unlimited SkillStacker AI generations.',        '🏆', 'unlimited_skillstacker_ai', 'usage_grant',    720,  100,  true),
  ('roadmap_25',        'roadmap',          25,  'Roadmap Started',         'You took your first step. Unlocked deep-dive roadmap analysis.',         '🗺️', 'roadmap_deep_dive',         'feature_access', NULL, NULL, true),
  ('roadmap_50',        'roadmap',          50,  'Halfway Hero',            'Halfway through your roadmap! Unlocked transition simulator extras.',    '⚡', 'transition_sim_extended',   'feature_access', NULL, NULL, true),
  ('roadmap_75',        'roadmap',          75,  'Almost There',            'Final stretch! Unlocked one free mentor matchmaking session.',           '🤝', 'mentor_session_free',       'usage_grant',    720,  1,    true),
  ('roadmap_100',       'roadmap',          100, 'Roadmap Champion',        'You did it. Unlocked premium Living Resume export.',                     '🏅', 'living_resume_premium',     'feature_access', NULL, NULL, true),
  ('entrep_onboard_25', 'entrep_onboarding',25,  'Founder Spark',           'Your founder profile is taking shape. Unlocked Startup Sparks.',         '✨', 'startup_sparks_access',     'feature_access', NULL, NULL, true),
  ('entrep_onboard_50', 'entrep_onboarding',50,  'Builder Mode',            'Halfway there! Unlocked MVP Builder.',                                   '🔧', 'mvp_builder_access',        'feature_access', NULL, NULL, true),
  ('entrep_onboard_75', 'entrep_onboarding',75,  'Founder Ready',           'Almost done. Unlocked Founder Communities.',                             '🚀', 'startup_communities_access','feature_access', NULL, NULL, true),
  ('entrep_onboard_100','entrep_onboarding',100, 'Founder Unlocked',        'You are a MyRaaha Founder! Unlocked AI Entrepreneurship Coach.',         '👑', 'ai_entrep_coach_unlocked',  'feature_access', NULL, NULL, true)
ON CONFLICT (milestone_key) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      reward_emoji = EXCLUDED.reward_emoji,
      entitlement_key = EXCLUDED.entitlement_key,
      entitlement_type = EXCLUDED.entitlement_type,
      duration_hours = EXCLUDED.duration_hours,
      usage_limit = EXCLUDED.usage_limit;

-- Allow new test_types
CREATE OR REPLACE FUNCTION public.update_assessment_progress(_test_type text, _completed integer, _total integer)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  pct integer;
  prev_milestone integer := 0;
  target_milestone integer := 0;
  unlocked jsonb := '[]'::jsonb;
  m record;
  unlock_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _test_type NOT IN ('discovery','psychometric','skillstacker','roadmap','entrep_onboarding') THEN
    RAISE EXCEPTION 'Unsupported test type: %', _test_type;
  END IF;
  IF _total <= 0 THEN RETURN jsonb_build_object('progress', 0, 'unlocked', unlocked); END IF;

  pct := LEAST(100, GREATEST(0, (_completed::numeric / _total::numeric * 100)::integer));
  target_milestone := CASE WHEN pct >= 100 THEN 100 WHEN pct >= 75 THEN 75 WHEN pct >= 50 THEN 50 WHEN pct >= 25 THEN 25 ELSE 0 END;

  SELECT COALESCE(highest_milestone_reached, 0) INTO prev_milestone
  FROM public.assessment_progress WHERE user_id = auth.uid() AND test_type = _test_type;
  prev_milestone := COALESCE(prev_milestone, 0);

  INSERT INTO public.assessment_progress (user_id, test_type, questions_total, questions_completed, progress_percentage, highest_milestone_reached, last_question_at, completed_at)
  VALUES (auth.uid(), _test_type, _total, LEAST(_completed, _total), pct, prev_milestone, now(), CASE WHEN pct >= 100 THEN now() ELSE NULL END)
  ON CONFLICT (user_id, test_type) DO UPDATE
    SET questions_total = EXCLUDED.questions_total,
        questions_completed = GREATEST(public.assessment_progress.questions_completed, EXCLUDED.questions_completed),
        progress_percentage = GREATEST(public.assessment_progress.progress_percentage, EXCLUDED.progress_percentage),
        last_question_at = now(),
        completed_at = CASE WHEN EXCLUDED.progress_percentage >= 100 AND public.assessment_progress.completed_at IS NULL THEN now() ELSE public.assessment_progress.completed_at END;

  FOR m IN SELECT * FROM public.reward_milestones
    WHERE test_type = _test_type AND milestone_percent <= pct AND is_active = true
    ORDER BY milestone_percent ASC
  LOOP
    SELECT public.unlock_reward(m.milestone_key) INTO unlock_result;
    IF m.milestone_percent > prev_milestone THEN
      unlocked := unlocked || jsonb_build_array(unlock_result);
    END IF;
  END LOOP;

  UPDATE public.assessment_progress SET highest_milestone_reached = GREATEST(highest_milestone_reached, target_milestone)
  WHERE user_id = auth.uid() AND test_type = _test_type;

  RETURN jsonb_build_object('progress', pct, 'unlocked', unlocked);
END;
$function$;