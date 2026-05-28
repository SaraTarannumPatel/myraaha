
-- 1. Make resumes bucket private and restrict reads to owner
UPDATE storage.buckets SET public = false WHERE id = 'resumes';
DROP POLICY IF EXISTS "Resumes are publicly readable" ON storage.objects;
CREATE POLICY "Users read own resume"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = (auth.uid())::text);

-- 2. Restrict insight-covers uploads to authenticated users in their own folder
DROP POLICY IF EXISTS "Anyone can upload insight covers" ON storage.objects;
CREATE POLICY "Auth users upload insight covers"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'insight-covers' AND (storage.foldername(name))[1] = (auth.uid())::text);

-- 3. Remove anon/authenticated direct SELECT on insights_submissions; rely on public_insights view (which omits author_email)
DROP POLICY IF EXISTS "Approved insights row-readable for view" ON public.insights_submissions;

-- Ensure the public_insights view is readable by anon and authenticated
GRANT SELECT ON public.public_insights TO anon, authenticated;
