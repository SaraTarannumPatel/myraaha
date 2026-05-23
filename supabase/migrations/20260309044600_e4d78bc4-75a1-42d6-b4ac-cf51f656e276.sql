-- Table to store AI-suggested roadmaps based on user inclinations
CREATE TABLE public.suggested_roadmaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  match_score INTEGER DEFAULT 0,
  reasoning TEXT[],
  source_signals JSONB DEFAULT '{}',
  roadmap_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'accepted', 'dismissed', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suggested_roadmaps ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own suggested roadmaps"
  ON public.suggested_roadmaps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggested roadmaps"
  ON public.suggested_roadmaps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert suggested roadmaps"
  ON public.suggested_roadmaps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update trigger
CREATE TRIGGER update_suggested_roadmaps_updated_at
  BEFORE UPDATE ON public.suggested_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();