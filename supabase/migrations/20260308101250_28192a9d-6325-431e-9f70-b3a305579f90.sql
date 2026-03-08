
-- Moodboards table
CREATE TABLE public.moodboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT DEFAULT 'general',
  is_shared BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.moodboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own moodboards" ON public.moodboards FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Shared moodboards are viewable" ON public.moodboards FOR SELECT USING (is_shared = true);

-- Moodboard items table
CREATE TABLE public.moodboard_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  moodboard_id UUID NOT NULL REFERENCES public.moodboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  title TEXT,
  content TEXT NOT NULL,
  url TEXT,
  tags TEXT[] DEFAULT '{}',
  goal_tags TEXT[] DEFAULT '{}',
  emotional_note TEXT,
  mood_feeling TEXT,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.moodboard_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own moodboard items" ON public.moodboard_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_moodboards_updated_at BEFORE UPDATE ON public.moodboards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_moodboard_items_updated_at BEFORE UPDATE ON public.moodboard_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
