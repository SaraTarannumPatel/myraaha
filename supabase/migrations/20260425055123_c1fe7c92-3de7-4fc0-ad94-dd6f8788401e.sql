ALTER PUBLICATION supabase_realtime ADD TABLE public.reward_unlock_events;
ALTER TABLE public.reward_unlock_events REPLICA IDENTITY FULL;