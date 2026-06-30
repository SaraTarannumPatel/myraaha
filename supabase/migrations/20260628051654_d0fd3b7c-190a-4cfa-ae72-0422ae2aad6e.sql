
-- Trigger-only / internal SECURITY DEFINER functions: revoke direct API access
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.handle_new_user()',
    'public.generate_public_uid()',
    'public.update_updated_at_column()',
    'public.recompute_user_interest_profile()',
    'public.update_community_member_count()',
    'public.update_peer_circle_member_count()',
    'public.update_inspiration_counts()',
    'public.update_post_counts()',
    'public.sync_ai_roadmap_self_discovery_stage_from_profile()',
    'public.record_rate_limit_hit(text, text, integer)',
    'public.unlock_reward(text)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', fn);
  END LOOP;
END $$;

-- Storage: drop broad listing policy on the public insight-covers bucket.
-- Public CDN URLs continue to work (they bypass storage.objects RLS for public buckets).
DROP POLICY IF EXISTS "Public read insight covers" ON storage.objects;

-- Ensure per-user cache upsert in roadmap-step-details cannot overwrite another user's row
CREATE UNIQUE INDEX IF NOT EXISTS roadmap_step_details_step_user_uniq
  ON public.roadmap_step_details (step_id, user_id);
