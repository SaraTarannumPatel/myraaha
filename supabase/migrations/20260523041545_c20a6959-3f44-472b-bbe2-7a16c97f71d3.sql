
-- Career applications table
CREATE TABLE IF NOT EXISTS public.career_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id TEXT NOT NULL,
  role_title TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  resume_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a career application"
ON public.career_applications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view career applications"
ON public.career_applications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_career_applications_updated_at
BEFORE UPDATE ON public.career_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for resumes (public so submitted URLs work)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can upload a resume"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Resumes are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'resumes');
