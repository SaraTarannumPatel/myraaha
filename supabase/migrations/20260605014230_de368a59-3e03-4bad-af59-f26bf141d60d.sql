
-- Remove client-writable policies on privileged tables.
-- All writes must come from service-role edge functions or SECURITY DEFINER triggers.

DROP POLICY IF EXISTS "System can insert achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users update own entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Users modify own entries" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "pp insert own" ON public.pioneer_points;
DROP POLICY IF EXISTS "Users insert own entitlements" ON public.user_entitlements;
DROP POLICY IF EXISTS "Users update own entitlements" ON public.user_entitlements;
