CREATE OR REPLACE FUNCTION public.get_leaderboard(
  _scope text DEFAULT 'global',
  _scope_id text DEFAULT NULL,
  _limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  scope text,
  scope_id text,
  total_points integer,
  badge_count integer,
  streak_days integer,
  projects_completed integer,
  learning_hours numeric,
  rank_position integer,
  updated_at timestamptz,
  anon_id text,
  display_name text,
  avatar_url text,
  is_self boolean,
  user_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
    md5(le.user_id::text) AS anon_id,
    COALESCE(p.full_name, 'Traveler') AS display_name,
    p.avatar_url,
    (le.user_id = auth.uid()) AS is_self,
    CASE WHEN le.user_id = auth.uid() THEN le.user_id ELSE NULL END AS user_id
  FROM public.leaderboard_entries le
  LEFT JOIN public.profiles p ON p.user_id = le.user_id
  WHERE (_scope IS NULL OR le.scope = _scope)
    AND (_scope_id IS NULL OR le.scope_id = _scope_id)
  ORDER BY le.total_points DESC
  LIMIT COALESCE(_limit, 50);
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(text, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_leaderboard(text, text, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(text, text, integer) TO authenticated;