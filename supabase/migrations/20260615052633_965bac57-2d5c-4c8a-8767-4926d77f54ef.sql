
CREATE TABLE IF NOT EXISTS public.role_education_requirements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_label text NOT NULL,
  role_id uuid NULL,
  minimum_education_level text NOT NULL,
  preferred_education_level text,
  required_degree_types text[] NOT NULL DEFAULT '{}',
  preferred_degree_types text[] NOT NULL DEFAULT '{}',
  required_subjects_class12 text[] NOT NULL DEFAULT '{}',
  required_stream_class12 text,
  required_subjects_undergraduate text[] NOT NULL DEFAULT '{}',
  entrance_exam_codes text[] NOT NULL DEFAULT '{}',
  alternative_entry_paths text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_label)
);
GRANT SELECT ON public.role_education_requirements TO anon, authenticated;
GRANT ALL ON public.role_education_requirements TO service_role;
ALTER TABLE public.role_education_requirements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rer public read" ON public.role_education_requirements FOR SELECT USING (true);
CREATE POLICY "rer admin write" ON public.role_education_requirements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::app_role));
CREATE TRIGGER trg_rer_updated BEFORE UPDATE ON public.role_education_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_rer_role_label ON public.role_education_requirements (lower(role_label));

CREATE TABLE IF NOT EXISTS public.ai_roadmap_stage_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id text NOT NULL,
  entity_label text,
  stage_id text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  notes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_id, stage_id),
  CHECK (status IN ('not_started','in_progress','completed'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_roadmap_stage_progress TO authenticated;
GRANT ALL ON public.ai_roadmap_stage_progress TO service_role;
ALTER TABLE public.ai_roadmap_stage_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stage_progress own rows" ON public.ai_roadmap_stage_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_stage_progress_updated BEFORE UPDATE ON public.ai_roadmap_stage_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_stage_progress_user_entity ON public.ai_roadmap_stage_progress (user_id, entity_id);

CREATE TABLE IF NOT EXISTS public.ai_roadmap_module_engagements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_id text NOT NULL,
  stage_id text NOT NULL,
  module_name text NOT NULL,
  module_route text NOT NULL,
  first_opened_at timestamptz NOT NULL DEFAULT now(),
  last_opened_at timestamptz NOT NULL DEFAULT now(),
  open_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_id, stage_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_roadmap_module_engagements TO authenticated;
GRANT ALL ON public.ai_roadmap_module_engagements TO service_role;
ALTER TABLE public.ai_roadmap_module_engagements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "engagements own rows" ON public.ai_roadmap_module_engagements
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_engagements_updated BEFORE UPDATE ON public.ai_roadmap_module_engagements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_engagements_user_entity ON public.ai_roadmap_module_engagements (user_id, entity_id);

CREATE TABLE IF NOT EXISTS public.ai_roadmap_exam_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_code text NOT NULL,
  status text NOT NULL DEFAULT 'not_attempted',
  target_year integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, exam_code),
  CHECK (status IN ('not_attempted','preparing','cleared'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_roadmap_exam_status TO authenticated;
GRANT ALL ON public.ai_roadmap_exam_status TO service_role;
ALTER TABLE public.ai_roadmap_exam_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_status own rows" ON public.ai_roadmap_exam_status
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_exam_status_updated BEFORE UPDATE ON public.ai_roadmap_exam_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.exam_gates (code, name, full_name, eligibility_stage, frequency, typical_prep_months, conducting_body, official_url, description)
VALUES
  ('JEE_MAIN','JEE Main','Joint Entrance Examination Main','class_12','2x/year',18,'NTA','https://jeemain.nta.nic.in','Undergrad engineering entrance for NITs, IIITs and CFTIs'),
  ('JEE_ADV','JEE Advanced','Joint Entrance Examination Advanced','class_12','1x/year',24,'IITs','https://jeeadv.ac.in','Undergrad engineering entrance for IITs'),
  ('NEET','NEET-UG','National Eligibility cum Entrance Test - Undergraduate','class_12','1x/year',18,'NTA','https://neet.nta.nic.in','Undergrad medical/dental entrance'),
  ('UPSC_CSE','UPSC CSE','Civil Services Examination','ug','1x/year',18,'UPSC','https://upsc.gov.in','Selection for IAS/IPS/IFS and allied services'),
  ('CLAT','CLAT','Common Law Admission Test','class_12','1x/year',12,'Consortium of NLUs','https://consortiumofnlus.ac.in','Undergrad law entrance for NLUs'),
  ('GATE','GATE','Graduate Aptitude Test in Engineering','ug','1x/year',12,'IITs/IISc','https://gate.iisc.ac.in','Postgrad engineering and PSU recruitment exam'),
  ('CAT','CAT','Common Admission Test','ug','1x/year',9,'IIMs','https://iimcat.ac.in','MBA entrance for IIMs and top B-schools'),
  ('CA_FND','CA Foundation','Chartered Accountancy Foundation','class_12','3x/year',6,'ICAI','https://icai.org','Entry exam for CA course'),
  ('NDA','NDA','National Defence Academy Examination','class_12','2x/year',12,'UPSC','https://upsc.gov.in','Entrance for tri-services academy'),
  ('IBPS_PO','IBPS PO','Institute of Banking Personnel Selection - PO','ug','1x/year',6,'IBPS','https://ibps.in','Probationary Officer recruitment for public sector banks'),
  ('CUET_UG','CUET UG','Common University Entrance Test - UG','class_12','1x/year',6,'NTA','https://cuet.nta.nic.in','Common undergrad entrance for central universities')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.role_education_requirements
  (role_label, minimum_education_level, preferred_education_level, required_degree_types, required_stream_class12, entrance_exam_codes, notes)
VALUES
  ('Software Engineer','Bachelor''s','Bachelor''s', ARRAY['B.Tech','BE','BCA','B.Sc CS'], 'science_pcm', ARRAY['JEE_MAIN','CUET_UG'], 'Strong portfolio can substitute for tier-1 college'),
  ('Data Scientist','Bachelor''s','Master''s', ARRAY['B.Tech','B.Sc','BCA'], 'science_pcm', ARRAY['JEE_MAIN','GATE','CAT'], 'Stats/CS background preferred'),
  ('Doctor','MBBS','MD/MS', ARRAY['MBBS'], 'science_pcb', ARRAY['NEET'], 'NEET-UG is mandatory in India'),
  ('IAS Officer','Bachelor''s','Bachelor''s', ARRAY['BA','B.Sc','B.Com','B.Tech'], 'any', ARRAY['UPSC_CSE'], 'Any graduation; UPSC CSE is the gate'),
  ('Lawyer','Bachelor''s','LLM', ARRAY['BA LLB','LLB','BBA LLB'], 'any', ARRAY['CLAT','CUET_UG'], '5-year integrated or 3-year LLB after grad'),
  ('Chartered Accountant','Class 12','Bachelor''s', ARRAY['B.Com'], 'commerce', ARRAY['CA_FND'], 'ICAI multi-stage exams'),
  ('Product Manager','Bachelor''s','MBA', ARRAY['B.Tech','BBA','B.Sc','BA'], 'any', ARRAY['CAT'], 'Cross-functional; MBA optional but common'),
  ('UX Designer','Bachelor''s','Bachelor''s', ARRAY['B.Des','BFA','B.Tech','BA'], 'any', ARRAY['CUET_UG'], 'Portfolio is the strongest signal'),
  ('Mechanical Engineer','Bachelor''s','Bachelor''s', ARRAY['B.Tech ME','BE ME'], 'science_pcm', ARRAY['JEE_MAIN','JEE_ADV'], NULL),
  ('Civil Servant','Bachelor''s','Bachelor''s', ARRAY['BA','B.Sc','B.Com'], 'any', ARRAY['UPSC_CSE','CUET_UG'], NULL)
ON CONFLICT (role_label) DO NOTHING;
