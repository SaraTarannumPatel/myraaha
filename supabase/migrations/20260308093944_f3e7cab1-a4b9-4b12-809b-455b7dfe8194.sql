
-- Showcase comments for feedback
CREATE TABLE public.showcase_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.showcase_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view showcase comments" ON public.showcase_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can insert comments" ON public.showcase_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.showcase_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Showcase reactions (likes, inspire, etc.)
CREATE TABLE public.showcase_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL DEFAULT 'like',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id, reaction_type)
);
ALTER TABLE public.showcase_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.showcase_reactions FOR SELECT USING (true);
CREATE POLICY "Auth users can toggle reactions" ON public.showcase_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.showcase_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Collaboration requests
CREATE TABLE public.showcase_collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending',
  skills_offered text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.showcase_collaborations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Involved users can view collaborations" ON public.showcase_collaborations FOR SELECT TO authenticated USING (auth.uid() = requester_id OR auth.uid() = owner_id);
CREATE POLICY "Auth users can request collaboration" ON public.showcase_collaborations FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Owners can update collaborations" ON public.showcase_collaborations FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- Realtime for comments and reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.showcase_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.showcase_reactions;
