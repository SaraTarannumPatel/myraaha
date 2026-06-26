-- 1. Drop unused SECURITY DEFINER view (clients use get_leaderboard() RPC instead)
DROP VIEW IF EXISTS public.leaderboard_public;

-- 2. Lock down onboarding_rewards: remove client INSERT policy and route inserts
--    through a SECURITY DEFINER function that validates the milestone against
--    a fixed server-side allow-list.
DROP POLICY IF EXISTS "Users can create their own rewards" ON public.onboarding_rewards;

CREATE OR REPLACE FUNCTION public.claim_onboarding_reward(_reward_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  allowed jsonb := '{
    "demographics_complete":   {"percent": 25, "title": "Profile Pioneer",   "description": "You shared your demographics — your journey begins."},
    "intent_complete":         {"percent": 50, "title": "Path Seeker",       "description": "You picked your intent. We are listening."},
    "interests_complete":      {"percent": 75, "title": "Curiosity Spark",   "description": "Your interests are unlocked."},
    "onboarding_complete":     {"percent": 100,"title": "Welcome Aboard",    "description": "You finished onboarding. Welcome to MyRaaha."}
  }'::jsonb;
  meta jsonb;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  meta := allowed -> _reward_key;
  IF meta IS NULL THEN
    RAISE EXCEPTION 'Unknown reward_key: %', _reward_key;
  END IF;

  INSERT INTO public.onboarding_rewards (user_id, reward_key, milestone_percent, reward_title, reward_description)
  VALUES (uid, _reward_key, (meta->>'percent')::int, meta->>'title', meta->>'description')
  ON CONFLICT (user_id, reward_key) DO NOTHING;

  RETURN jsonb_build_object('success', true, 'reward_key', _reward_key);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_onboarding_reward(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_onboarding_reward(text) TO authenticated;