REVOKE EXECUTE ON FUNCTION public.unlock_reward(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_assessment_progress(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_reward(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_assessment_progress(text, integer, integer) TO authenticated;