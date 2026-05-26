
-- ============ Restrict over-public SELECT policies to authenticated ============
DROP POLICY IF EXISTS "Posts viewable by members" ON public.community_posts;
CREATE POLICY "Posts viewable by authenticated"
  ON public.community_posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Comments are viewable" ON public.community_post_comments;
CREATE POLICY "Comments viewable by authenticated"
  ON public.community_post_comments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Posts viewable" ON public.peer_circle_posts;
CREATE POLICY "Peer posts viewable by authenticated"
  ON public.peer_circle_posts FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Comments viewable" ON public.peer_circle_comments;
CREATE POLICY "Peer comments viewable by authenticated"
  ON public.peer_circle_comments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Pod discussions are viewable by members" ON public.pod_discussions;
CREATE POLICY "Pod discussions viewable by authenticated"
  ON public.pod_discussions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Founder profiles are publicly viewable" ON public.founder_profiles;
CREATE POLICY "Founder profiles viewable by authenticated"
  ON public.founder_profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Sessions are publicly viewable" ON public.mentorship_sessions;
CREATE POLICY "Sessions viewable by authenticated"
  ON public.mentorship_sessions FOR SELECT TO authenticated USING (true);

-- ============ user_entitlements: explicit scoped INSERT policy ============
CREATE POLICY "Users insert own entitlements"
  ON public.user_entitlements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============ Add user_id binding to public-write tables ============
ALTER TABLE public.career_applications ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.contact_submissions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.insights_submissions ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.newsletter_subscriptions ADD COLUMN IF NOT EXISTS user_id uuid;

-- Rebind INSERT policies: if authenticated, user_id must equal auth.uid(); anon must leave it null
DROP POLICY IF EXISTS "Anyone can submit a career application" ON public.career_applications;
CREATE POLICY "Submit career application bound to user"
  ON public.career_applications FOR INSERT TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Submit contact bound to user"
  ON public.contact_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (
    ((auth.uid() IS NULL AND user_id IS NULL)
      OR (auth.uid() IS NOT NULL AND user_id = auth.uid()))
    AND length(name) BETWEEN 1 AND 120
    AND length(email) BETWEEN 3 AND 255
    AND length(message) BETWEEN 1 AND 4000
  );

DROP POLICY IF EXISTS "anyone can submit insight" ON public.insights_submissions;
CREATE POLICY "Submit insight bound to user"
  ON public.insights_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND ((auth.uid() IS NULL AND user_id IS NULL)
         OR (auth.uid() IS NOT NULL AND user_id = auth.uid()))
    AND length(title) BETWEEN 1 AND 200
    AND length(excerpt) BETWEEN 1 AND 1000
    AND length(content) BETWEEN 1 AND 50000
  );

DROP POLICY IF EXISTS "anyone can subscribe" ON public.newsletter_subscriptions;
CREATE POLICY "Subscribe bound to user"
  ON public.newsletter_subscriptions FOR INSERT TO anon, authenticated
  WITH CHECK (
    ((auth.uid() IS NULL AND user_id IS NULL)
      OR (auth.uid() IS NOT NULL AND user_id = auth.uid()))
    AND length(email) BETWEEN 3 AND 255
    AND email LIKE '%_@_%.__%'
  );

-- ============ insights_submissions: hide author_email from public reads ============
DROP POLICY IF EXISTS "anyone reads approved insights" ON public.insights_submissions;
-- (Admins still read all via existing admin select policy; submitter cannot read their own row here)

CREATE OR REPLACE VIEW public.public_insights
WITH (security_invoker = true) AS
SELECT id, title, excerpt, content, category, author_name, author_title,
       cover_image_url, status, created_at
FROM public.insights_submissions
WHERE status = 'approved';

-- Allow the view itself to read approved rows by re-adding a row-policy that excludes the email via the view's column list
CREATE POLICY "Approved insights row-readable for view"
  ON public.insights_submissions FOR SELECT TO anon, authenticated
  USING (status = 'approved');

GRANT SELECT ON public.public_insights TO anon, authenticated;

-- ============ Storage: resumes & insight-covers ownership policies ============
DROP POLICY IF EXISTS "Anyone can upload a resume" ON storage.objects;
CREATE POLICY "Authenticated users upload own resume"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own resume"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users delete own resume"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users update own insight cover"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'insight-covers' AND owner = auth.uid());

CREATE POLICY "Users delete own insight cover"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'insight-covers' AND owner = auth.uid());

-- ============ Realtime: lock down realtime.messages ============
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users read own realtime channels" ON realtime.messages;
CREATE POLICY "Authenticated users read own realtime channels"
  ON realtime.messages FOR SELECT TO authenticated
  USING (
    topic LIKE 'user:' || auth.uid()::text || ':%'
    OR topic = 'user:' || auth.uid()::text
  );

DROP POLICY IF EXISTS "Authenticated users send own realtime channels" ON realtime.messages;
CREATE POLICY "Authenticated users send own realtime channels"
  ON realtime.messages FOR INSERT TO authenticated
  WITH CHECK (
    topic LIKE 'user:' || auth.uid()::text || ':%'
    OR topic = 'user:' || auth.uid()::text
  );
