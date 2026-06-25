-- Restrict leaderboard_entries direct reads; expose a sanitized view instead.
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.leaderboard_entries;

CREATE POLICY "Users view own leaderboard row"
  ON public.leaderboard_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Public-safe view: joins profile display fields, hides raw user_id from others.
CREATE OR REPLACE VIEW public.leaderboard_public
WITH (security_invoker = off) AS
SELECT
  le.id,
  le.scope,
  le.scope_id,
  le.total_points,
  le.badge_count,
  le.streak_days,
  le.projects_completed,
  le.learning_hours,
  le.rank_position,
  le.updated_at,
  encode(digest(le.user_id::text, 'sha256'), 'hex') AS anon_id,
  COALESCE(p.full_name, 'Traveler') AS display_name,
  p.avatar_url,
  (le.user_id = auth.uid()) AS is_self,
  CASE WHEN le.user_id = auth.uid() THEN le.user_id ELSE NULL END AS user_id
FROM public.leaderboard_entries le
LEFT JOIN public.profiles p ON p.user_id = le.user_id;

GRANT SELECT ON public.leaderboard_public TO authenticated;