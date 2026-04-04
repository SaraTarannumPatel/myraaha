
-- Cross-module signal collection table
CREATE TABLE public.user_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL DEFAULT 'keyword',
  signal_source TEXT NOT NULL,
  signal_value TEXT NOT NULL,
  signal_context JSONB DEFAULT '{}',
  strength NUMERIC DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own signals" ON public.user_signals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own signals" ON public.user_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own signals" ON public.user_signals FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_signals_user_source ON public.user_signals(user_id, signal_source);
CREATE INDEX idx_user_signals_value ON public.user_signals(user_id, signal_value);

-- Add source_signals to suggested_roadmaps for tracking which signals generated suggestions
ALTER TABLE public.suggested_roadmaps ADD COLUMN IF NOT EXISTS source_signals JSONB DEFAULT '{}';
ALTER TABLE public.suggested_roadmaps ADD COLUMN IF NOT EXISTS source_module TEXT DEFAULT 'manual';

-- Add quest_analysis column to curiosity_quest_progress to store analysis results
ALTER TABLE public.curiosity_quest_progress ADD COLUMN IF NOT EXISTS analysis_results JSONB DEFAULT NULL;
