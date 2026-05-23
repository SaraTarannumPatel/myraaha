CREATE TABLE IF NOT EXISTS public.ai_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cache_key text NOT NULL,
  module text NOT NULL,
  inputs_hash text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, cache_key)
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_user_module ON public.ai_cache (user_id, module);

ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai_cache" ON public.ai_cache
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_cache" ON public.ai_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai_cache" ON public.ai_cache
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai_cache" ON public.ai_cache
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_ai_cache_updated_at
  BEFORE UPDATE ON public.ai_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();