
-- =====================================================
-- Current Educational Status onboarding module tables
-- =====================================================

-- 1. Main status table (one row per user)
CREATE TABLE public.user_education_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  educational_status text NOT NULL,
  institution_name text,
  board_or_university_type text,
  stream text,
  course_program text,
  year_of_study text,
  prepping_for text[] DEFAULT '{}'::text[],
  looking_for_help text[] DEFAULT '{}'::text[],
  career_domains text[] DEFAULT '{}'::text[],
  curious_careers text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_education_status TO authenticated;
GRANT ALL ON public.user_education_status TO service_role;
ALTER TABLE public.user_education_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own education status"
  ON public.user_education_status FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_user_education_status_updated
  BEFORE UPDATE ON public.user_education_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Subjects (current / favorite / difficult)
CREATE TABLE public.user_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject_name text NOT NULL,
  relation text NOT NULL CHECK (relation IN ('current','favorite','difficult')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_subjects TO authenticated;
GRANT ALL ON public.user_subjects TO service_role;
ALTER TABLE public.user_subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own subjects"
  ON public.user_subjects FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_subjects_user ON public.user_subjects(user_id);

-- 3. Skills profile
CREATE TABLE public.user_skills_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_name text NOT NULL,
  confidence text CHECK (confidence IN ('beginner','intermediate','advanced')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_skills_profile TO authenticated;
GRANT ALL ON public.user_skills_profile TO service_role;
ALTER TABLE public.user_skills_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own skills profile"
  ON public.user_skills_profile FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_skills_profile_user ON public.user_skills_profile(user_id);

-- 4. Certifications
CREATE TABLE public.user_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_name text NOT NULL,
  platform text,
  completion_year text,
  certificate_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_certifications TO authenticated;
GRANT ALL ON public.user_certifications TO service_role;
ALTER TABLE public.user_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own certifications"
  ON public.user_certifications FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_certifications_user ON public.user_certifications(user_id);

-- 5. Projects profile (separate from existing projects table)
CREATE TABLE public.user_projects_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_name text NOT NULL,
  description text,
  skills_used text[] DEFAULT '{}'::text[],
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_projects_profile TO authenticated;
GRANT ALL ON public.user_projects_profile TO service_role;
ALTER TABLE public.user_projects_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own projects profile"
  ON public.user_projects_profile FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_projects_profile_user ON public.user_projects_profile(user_id);

-- 6. Activities
CREATE TABLE public.user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activity_type text NOT NULL,
  title text NOT NULL,
  role text,
  year text,
  achievement text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_activities TO authenticated;
GRANT ALL ON public.user_activities TO service_role;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own activities"
  ON public.user_activities FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_activities_user ON public.user_activities(user_id);

-- 7. Leadership experiences
CREATE TABLE public.user_leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  position_title text NOT NULL,
  organization text,
  duration text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_leadership TO authenticated;
GRANT ALL ON public.user_leadership TO service_role;
ALTER TABLE public.user_leadership ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own leadership"
  ON public.user_leadership FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_user_leadership_user ON public.user_leadership(user_id);
