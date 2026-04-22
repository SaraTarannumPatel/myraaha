
-- ============================================================
-- 1. ASSESSMENT CONCLUSIONS (synthesized user profile)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assessment_conclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  test_type text NOT NULL CHECK (test_type IN ('discovery', 'psychometric', 'combined')),
  archetype text,
  archetype_description text,
  top_domains text[] DEFAULT '{}',
  top_skills text[] DEFAULT '{}',
  work_style text,
  motivation_type text,
  cognitive_style text,
  ideal_environment text,
  strengths text[] DEFAULT '{}',
  growth_areas text[] DEFAULT '{}',
  recommended_modules jsonb DEFAULT '[]'::jsonb,
  recommended_career_paths text[] DEFAULT '{}',
  raw_signals jsonb DEFAULT '{}'::jsonb,
  confidence_score numeric DEFAULT 0,
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, test_type)
);

ALTER TABLE public.assessment_conclusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own conclusions" ON public.assessment_conclusions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own conclusions" ON public.assessment_conclusions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conclusions" ON public.assessment_conclusions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_assessment_conclusions_updated_at
  BEFORE UPDATE ON public.assessment_conclusions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 2. QUESTION-LEVEL SIGNALS (real-time mapping to modules)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assessment_question_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  test_type text NOT NULL,
  question_id text NOT NULL,
  question_text text,
  answer_value text,
  answer_label text,
  target_modules text[] DEFAULT '{}',
  signal_tags text[] DEFAULT '{}',
  weight numeric DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_question_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own signals" ON public.assessment_question_signals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own signals" ON public.assessment_question_signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_assessment_signals_user_module
  ON public.assessment_question_signals USING gin (target_modules);
CREATE INDEX IF NOT EXISTS idx_assessment_signals_user_test
  ON public.assessment_question_signals (user_id, test_type);

-- ============================================================
-- 3. ASSESSMENT PROGRESS (drives reward milestones)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.assessment_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  test_type text NOT NULL,
  questions_total integer NOT NULL DEFAULT 0,
  questions_completed integer NOT NULL DEFAULT 0,
  progress_percentage integer NOT NULL DEFAULT 0,
  highest_milestone_reached integer NOT NULL DEFAULT 0,
  last_question_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, test_type)
);

ALTER TABLE public.assessment_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own progress" ON public.assessment_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.assessment_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.assessment_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_assessment_progress_updated_at
  BEFORE UPDATE ON public.assessment_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 4. REWARD MILESTONES CATALOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reward_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_key text NOT NULL UNIQUE,
  test_type text NOT NULL,
  milestone_percent integer NOT NULL CHECK (milestone_percent IN (25, 50, 75, 100)),
  title text NOT NULL,
  description text,
  reward_emoji text DEFAULT '🎁',
  entitlement_key text NOT NULL,
  entitlement_type text NOT NULL,
  duration_hours integer,
  usage_limit integer,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reward_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reward milestones are public" ON public.reward_milestones
  FOR SELECT USING (true);

-- ============================================================
-- 5. USER ENTITLEMENTS (unlocked rewards)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entitlement_key text NOT NULL,
  entitlement_type text NOT NULL,
  source text DEFAULT 'curiosity_compass',
  source_milestone_key text,
  is_active boolean DEFAULT true,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  expires_at timestamptz,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, entitlement_key)
);

ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own entitlements" ON public.user_entitlements
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own entitlements" ON public.user_entitlements
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 6. REWARD UNLOCK EVENTS (celebration feed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reward_unlock_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  milestone_key text NOT NULL,
  test_type text,
  milestone_percent integer,
  title text,
  description text,
  reward_emoji text,
  acknowledged boolean DEFAULT false,
  unlocked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reward_unlock_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own unlock events" ON public.reward_unlock_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own unlock events" ON public.reward_unlock_events
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 7. SEED REWARD MILESTONES
-- ============================================================
INSERT INTO public.reward_milestones (milestone_key, test_type, milestone_percent, title, description, reward_emoji, entitlement_key, entitlement_type, duration_hours, usage_limit)
VALUES
  ('discovery_25', 'discovery', 25, 'Discover Yourself Deep-Dive Capsule', 'Unlock a curated self-reflection mini-course tailored to your early answers.', '📘', 'capsule_discover_yourself', 'content_unlock', NULL, NULL),
  ('discovery_50', 'discovery', 50, 'Free AI Career Therapist (24h)', 'Talk to your AI therapist with no rate limits for 24 hours.', '💬', 'ai_therapist_unlimited_24h', 'time_window', 24, NULL),
  ('discovery_75', 'discovery', 75, 'Mentor Talks Access', 'Unlock the Mentor Talks library — long-form interviews with industry mentors.', '🎙️', 'mentor_talks_access', 'feature_unlock', NULL, NULL),
  ('discovery_100', 'discovery', 100, '5 Free AI Roadmap Generations', 'Get 5 personalized AI-generated career roadmaps on the house.', '🗺️', 'roadmap_generations_5', 'usage_credits', NULL, 5),
  ('psychometric_25', 'psychometric', 25, 'Personalized Insights Report', 'Unlock your behavioural insights report with archetype + work style.', '📊', 'insights_report_unlock', 'feature_unlock', NULL, NULL),
  ('psychometric_50', 'psychometric', 50, 'Free AI Career Coach (24h)', 'Unlimited Virtual Career Coach access for 24 hours.', '🧭', 'ai_coach_unlimited_24h', 'time_window', 24, NULL),
  ('psychometric_75', 'psychometric', 75, '3 Premium Courses Free', 'Pick any 3 premium courses from the Learning Library, on us.', '🎓', 'premium_courses_3', 'usage_credits', NULL, 3),
  ('psychometric_100', 'psychometric', 100, 'Founder & Mentor Live Sessions', 'Unlock invite-only live sessions with founders and senior mentors.', '🌟', 'live_sessions_access', 'feature_unlock', NULL, NULL)
ON CONFLICT (milestone_key) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    reward_emoji = EXCLUDED.reward_emoji,
    entitlement_key = EXCLUDED.entitlement_key,
    entitlement_type = EXCLUDED.entitlement_type,
    duration_hours = EXCLUDED.duration_hours,
    usage_limit = EXCLUDED.usage_limit;

-- ============================================================
-- 8. HELPER FUNCTIONS
-- ============================================================

-- Unlock reward (called when a milestone is reached)
CREATE OR REPLACE FUNCTION public.unlock_reward(_milestone_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m record;
  existing_id uuid;
  expiry timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO m FROM public.reward_milestones WHERE milestone_key = _milestone_key AND is_active = true;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'milestone_not_found');
  END IF;

  SELECT id INTO existing_id FROM public.user_entitlements
  WHERE user_id = auth.uid() AND entitlement_key = m.entitlement_key;

  IF existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'already_unlocked', true, 'entitlement_key', m.entitlement_key);
  END IF;

  IF m.duration_hours IS NOT NULL THEN
    expiry := now() + (m.duration_hours || ' hours')::interval;
  END IF;

  INSERT INTO public.user_entitlements (user_id, entitlement_key, entitlement_type, source_milestone_key, usage_limit, expires_at)
  VALUES (auth.uid(), m.entitlement_key, m.entitlement_type, m.milestone_key, m.usage_limit, expiry);

  INSERT INTO public.reward_unlock_events (user_id, milestone_key, test_type, milestone_percent, title, description, reward_emoji)
  VALUES (auth.uid(), m.milestone_key, m.test_type, m.milestone_percent, m.title, m.description, m.reward_emoji);

  RETURN jsonb_build_object(
    'success', true,
    'already_unlocked', false,
    'entitlement_key', m.entitlement_key,
    'title', m.title,
    'description', m.description,
    'emoji', m.reward_emoji,
    'expires_at', expiry
  );
END;
$$;

-- Check active entitlement
CREATE OR REPLACE FUNCTION public.has_active_entitlement(_entitlement_key text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.user_entitlements
    WHERE user_id = auth.uid()
      AND entitlement_key = _entitlement_key
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND (usage_limit IS NULL OR usage_count < usage_limit)
  ) INTO found;

  RETURN COALESCE(found, false);
END;
$$;

-- Consume entitlement (decrement usage)
CREATE OR REPLACE FUNCTION public.consume_entitlement(_entitlement_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ent record;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO ent FROM public.user_entitlements
  WHERE user_id = auth.uid() AND entitlement_key = _entitlement_key
  FOR UPDATE;

  IF NOT FOUND OR NOT ent.is_active THEN
    RETURN false;
  END IF;

  IF ent.expires_at IS NOT NULL AND ent.expires_at < now() THEN
    UPDATE public.user_entitlements SET is_active = false WHERE id = ent.id;
    RETURN false;
  END IF;

  IF ent.usage_limit IS NOT NULL THEN
    IF ent.usage_count >= ent.usage_limit THEN
      UPDATE public.user_entitlements SET is_active = false WHERE id = ent.id;
      RETURN false;
    END IF;
    UPDATE public.user_entitlements
      SET usage_count = usage_count + 1,
          is_active = CASE WHEN usage_count + 1 >= usage_limit THEN false ELSE true END
      WHERE id = ent.id;
  END IF;

  RETURN true;
END;
$$;

-- Recompute progress + auto-unlock crossed milestones
CREATE OR REPLACE FUNCTION public.update_assessment_progress(_test_type text, _completed integer, _total integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pct integer;
  prev_milestone integer;
  unlocked jsonb := '[]'::jsonb;
  m record;
  unlock_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _total <= 0 THEN
    RETURN jsonb_build_object('progress', 0, 'unlocked', unlocked);
  END IF;

  pct := LEAST(100, GREATEST(0, (_completed::numeric / _total::numeric * 100)::integer));

  INSERT INTO public.assessment_progress (user_id, test_type, questions_total, questions_completed, progress_percentage, highest_milestone_reached, last_question_at, completed_at)
  VALUES (auth.uid(), _test_type, _total, _completed, pct,
    CASE WHEN pct >= 100 THEN 100
         WHEN pct >= 75 THEN 75
         WHEN pct >= 50 THEN 50
         WHEN pct >= 25 THEN 25
         ELSE 0 END,
    now(),
    CASE WHEN pct >= 100 THEN now() ELSE NULL END)
  ON CONFLICT (user_id, test_type) DO UPDATE
  SET questions_total = EXCLUDED.questions_total,
      questions_completed = GREATEST(public.assessment_progress.questions_completed, EXCLUDED.questions_completed),
      progress_percentage = GREATEST(public.assessment_progress.progress_percentage, EXCLUDED.progress_percentage),
      last_question_at = now(),
      completed_at = CASE WHEN EXCLUDED.progress_percentage >= 100 AND public.assessment_progress.completed_at IS NULL THEN now() ELSE public.assessment_progress.completed_at END
  RETURNING highest_milestone_reached INTO prev_milestone;

  -- Unlock any milestones now reached
  FOR m IN
    SELECT * FROM public.reward_milestones
    WHERE test_type = _test_type
      AND milestone_percent <= pct
      AND milestone_percent > COALESCE(prev_milestone, 0)
    ORDER BY milestone_percent ASC
  LOOP
    SELECT public.unlock_reward(m.milestone_key) INTO unlock_result;
    unlocked := unlocked || jsonb_build_array(unlock_result);
    UPDATE public.assessment_progress
    SET highest_milestone_reached = m.milestone_percent
    WHERE user_id = auth.uid() AND test_type = _test_type;
  END LOOP;

  RETURN jsonb_build_object('progress', pct, 'unlocked', unlocked);
END;
$$;
