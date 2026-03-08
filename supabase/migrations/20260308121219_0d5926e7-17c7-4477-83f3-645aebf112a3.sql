
-- Peer Circles (learning circles)
CREATE TABLE public.peer_circles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  domain text NOT NULL DEFAULT 'general',
  activity_type text NOT NULL DEFAULT 'discussion',
  experience_level text DEFAULT 'all',
  max_members integer DEFAULT 30,
  member_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  icon_emoji text DEFAULT '🤝',
  learning_focus text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.peer_circles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Circles publicly viewable" ON public.peer_circles FOR SELECT USING (true);
CREATE POLICY "Auth users can create circles" ON public.peer_circles FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update circles" ON public.peer_circles FOR UPDATE USING (auth.uid() = created_by);

-- Peer Circle Members
CREATE TABLE public.peer_circle_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES public.peer_circles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  engagement_score real DEFAULT 0.5,
  last_active_at timestamptz DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

ALTER TABLE public.peer_circle_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members publicly viewable" ON public.peer_circle_members FOR SELECT USING (true);
CREATE POLICY "Auth users can join" ON public.peer_circle_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave" ON public.peer_circle_members FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own membership" ON public.peer_circle_members FOR UPDATE USING (auth.uid() = user_id);

-- Peer Circle Posts (discussion threads)
CREATE TABLE public.peer_circle_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES public.peer_circles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  title text,
  content text NOT NULL,
  post_type text NOT NULL DEFAULT 'discussion',
  tags text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  is_pinned boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.peer_circle_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts viewable" ON public.peer_circle_posts FOR SELECT USING (true);
CREATE POLICY "Members can post" ON public.peer_circle_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update" ON public.peer_circle_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authors can delete" ON public.peer_circle_posts FOR DELETE USING (auth.uid() = user_id);

-- Peer Circle Post Comments
CREATE TABLE public.peer_circle_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.peer_circle_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.peer_circle_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments viewable" ON public.peer_circle_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can comment" ON public.peer_circle_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can delete" ON public.peer_circle_comments FOR DELETE USING (auth.uid() = user_id);

-- Inspire Wall Posts
CREATE TABLE public.inspire_wall_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  post_type text NOT NULL DEFAULT 'story',
  tags text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  circle_id uuid REFERENCES public.peer_circles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspire_wall_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inspire posts viewable" ON public.inspire_wall_posts FOR SELECT USING (true);
CREATE POLICY "Auth users can post" ON public.inspire_wall_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update" ON public.inspire_wall_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authors can delete" ON public.inspire_wall_posts FOR DELETE USING (auth.uid() = user_id);

-- Domain Clubs
CREATE TABLE public.domain_clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL,
  description text,
  icon_emoji text DEFAULT '🏛️',
  member_count integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  workshops_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_clubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Domain clubs viewable" ON public.domain_clubs FOR SELECT USING (true);

-- Collaborative Projects
CREATE TABLE public.peer_circle_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES public.peer_circles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  project_type text NOT NULL DEFAULT 'challenge',
  status text NOT NULL DEFAULT 'open',
  difficulty text DEFAULT 'intermediate',
  skills_targeted text[] DEFAULT '{}',
  max_participants integer DEFAULT 5,
  participant_count integer DEFAULT 0,
  deadline date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.peer_circle_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects viewable" ON public.peer_circle_projects FOR SELECT USING (true);
CREATE POLICY "Auth users can create" ON public.peer_circle_projects FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can update" ON public.peer_circle_projects FOR UPDATE USING (auth.uid() = created_by);

-- Project Participants
CREATE TABLE public.peer_project_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.peer_circle_projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text DEFAULT 'contributor',
  joined_at timestamptz NOT NULL DEFAULT now(),
  contribution_notes text,
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.peer_project_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants viewable" ON public.peer_project_participants FOR SELECT USING (true);
CREATE POLICY "Auth users can join" ON public.peer_project_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave" ON public.peer_project_participants FOR DELETE USING (auth.uid() = user_id);

-- Circle Milestones (group achievements)
CREATE TABLE public.peer_circle_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES public.peer_circles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  milestone_type text DEFAULT 'achievement',
  achieved_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.peer_circle_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Milestones viewable" ON public.peer_circle_milestones FOR SELECT USING (true);

-- Engagement tracking per user per circle
CREATE TABLE public.peer_circle_engagement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id uuid REFERENCES public.peer_circles(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  posts_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  projects_joined integer DEFAULT 0,
  mood_trend text DEFAULT 'neutral',
  engagement_level text DEFAULT 'active',
  last_prompt_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(circle_id, user_id)
);

ALTER TABLE public.peer_circle_engagement ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own engagement" ON public.peer_circle_engagement FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Member count trigger
CREATE OR REPLACE FUNCTION public.update_peer_circle_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE peer_circles SET member_count = member_count + 1 WHERE id = NEW.circle_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE peer_circles SET member_count = member_count - 1 WHERE id = OLD.circle_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_peer_circle_member_change
AFTER INSERT OR DELETE ON public.peer_circle_members
FOR EACH ROW EXECUTE FUNCTION public.update_peer_circle_member_count();

-- Seed some circles
INSERT INTO public.peer_circles (name, description, domain, activity_type, experience_level, learning_focus, icon_emoji, is_featured, tags) VALUES
('Frontend Enthusiasts', 'Discuss React, Vue, and modern frontend patterns together.', 'technology', 'discussion', 'intermediate', 'Web Development', '💻', true, ARRAY['react','vue','css','javascript']),
('Data Science Explorers', 'Learn ML, statistics, and data visualization together.', 'technology', 'projects', 'beginner', 'Data Science & ML', '📊', true, ARRAY['python','ml','statistics','data']),
('Career Changers Hub', 'Supporting each other through career pivots and transitions.', 'career', 'discussion', 'all', 'Career Transition', '🔄', true, ARRAY['career-change','support','transition']),
('Design Thinkers', 'Share design work, get feedback, grow together.', 'design', 'peer-review', 'all', 'UX/UI Design', '🎨', true, ARRAY['ux','ui','figma','design-thinking']),
('Leadership Lab', 'Building leadership skills through peer challenges and reflection.', 'business', 'workshop', 'advanced', 'Leadership Development', '👑', false, ARRAY['leadership','management','soft-skills']),
('Startup Founders Circle', 'Share startup challenges, celebrate wins, and build together.', 'entrepreneurship', 'projects', 'intermediate', 'Entrepreneurship', '🚀', true, ARRAY['startup','founder','business']),
('Creative Writers Collective', 'Explore storytelling, content creation, and creative expression.', 'creative', 'peer-review', 'beginner', 'Creative Writing', '✍️', false, ARRAY['writing','storytelling','content']),
('Health & Wellness Tech', 'Innovating at the intersection of health and technology.', 'healthcare', 'discussion', 'intermediate', 'HealthTech', '🏥', false, ARRAY['healthtech','wellness','medical']);

-- Seed domain clubs
INSERT INTO public.domain_clubs (name, domain, description, icon_emoji, tags) VALUES
('Tech Builders', 'technology', 'Software engineers, developers, and tech enthusiasts building the future.', '🛠️', ARRAY['coding','software','tech']),
('Design Studio', 'design', 'Visual designers, UX researchers, and creative thinkers.', '🎨', ARRAY['ux','ui','visual','research']),
('Business Strategy', 'business', 'Strategy, operations, finance, and business development.', '📈', ARRAY['strategy','finance','operations']),
('Healthcare Innovators', 'healthcare', 'Professionals and learners in healthcare and life sciences.', '⚕️', ARRAY['medical','biotech','health']),
('Marketing & Growth', 'marketing', 'Digital marketing, growth hacking, and brand building.', '📣', ARRAY['marketing','growth','brand']),
('Education & Impact', 'education', 'Educators, social entrepreneurs, and impact-driven learners.', '📚', ARRAY['education','social-impact','teaching']);

-- Seed inspire wall
INSERT INTO public.inspire_wall_posts (user_id, content, post_type, tags, is_featured) VALUES
('00000000-0000-0000-0000-000000000000', '🎉 Just completed my first ML project with the Data Science Explorers circle! The peer feedback was incredible.', 'achievement', ARRAY['ml','achievement'], true),
('00000000-0000-0000-0000-000000000000', '💡 Tip: When switching careers, focus on transferable skills first. My circle helped me identify 5 I didn''t know I had!', 'tip', ARRAY['career-change','skills'], true),
('00000000-0000-0000-0000-000000000000', '🏆 The Design Thinkers circle just completed 50 peer review challenges! So proud of this community.', 'milestone', ARRAY['design','milestone'], true),
('00000000-0000-0000-0000-000000000000', '🔥 Started a mini-hackathon in the Startup Founders Circle. 3 teams, 48 hours, amazing results!', 'story', ARRAY['hackathon','startup'], false);
