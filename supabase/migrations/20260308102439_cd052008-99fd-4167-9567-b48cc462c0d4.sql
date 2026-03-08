
-- Inspiration stories table
CREATE TABLE public.inspiration_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT NULL,
  title text NOT NULL,
  content text NOT NULL,
  summary text,
  category text NOT NULL DEFAULT 'journey',
  tags text[] DEFAULT '{}',
  domain text DEFAULT 'general',
  stage text DEFAULT 'all',
  story_type text NOT NULL DEFAULT 'curated',
  author_name text,
  author_role text,
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  bookmarks_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspiration_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories are publicly viewable" ON public.inspiration_stories FOR SELECT USING (is_approved = true);
CREATE POLICY "Auth users can submit stories" ON public.inspiration_stories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update own stories" ON public.inspiration_stories FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authors can delete own stories" ON public.inspiration_stories FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_inspiration_stories_updated_at BEFORE UPDATE ON public.inspiration_stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bookmarks
CREATE TABLE public.inspiration_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  story_id uuid NOT NULL REFERENCES public.inspiration_stories(id) ON DELETE CASCADE,
  collection_name text DEFAULT 'Saved',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);

ALTER TABLE public.inspiration_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own bookmarks" ON public.inspiration_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reactions
CREATE TABLE public.inspiration_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  story_id uuid NOT NULL REFERENCES public.inspiration_stories(id) ON DELETE CASCADE,
  reaction_type text NOT NULL DEFAULT 'like',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id, reaction_type)
);

ALTER TABLE public.inspiration_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions are viewable" ON public.inspiration_reactions FOR SELECT USING (true);
CREATE POLICY "Auth users can react" ON public.inspiration_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove reactions" ON public.inspiration_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comments
CREATE TABLE public.inspiration_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  story_id uuid NOT NULL REFERENCES public.inspiration_stories(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspiration_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable" ON public.inspiration_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can comment" ON public.inspiration_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can delete comments" ON public.inspiration_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Count triggers
CREATE OR REPLACE FUNCTION public.update_inspiration_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_TABLE_NAME = 'inspiration_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE inspiration_stories SET comments_count = comments_count + 1 WHERE id = NEW.story_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE inspiration_stories SET comments_count = comments_count - 1 WHERE id = OLD.story_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'inspiration_reactions' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE inspiration_stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE inspiration_stories SET likes_count = likes_count - 1 WHERE id = OLD.story_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'inspiration_bookmarks' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE inspiration_stories SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.story_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE inspiration_stories SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.story_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_inspiration_comments_count AFTER INSERT OR DELETE ON public.inspiration_comments FOR EACH ROW EXECUTE FUNCTION update_inspiration_counts();
CREATE TRIGGER trg_inspiration_reactions_count AFTER INSERT OR DELETE ON public.inspiration_reactions FOR EACH ROW EXECUTE FUNCTION update_inspiration_counts();
CREATE TRIGGER trg_inspiration_bookmarks_count AFTER INSERT OR DELETE ON public.inspiration_bookmarks FOR EACH ROW EXECUTE FUNCTION update_inspiration_counts();

-- Seed curated stories
INSERT INTO public.inspiration_stories (title, content, summary, category, tags, domain, stage, story_type, author_name, author_role, is_featured) VALUES
('From Garage to Global: How Persistence Paid Off', 'Starting with nothing but a laptop and a vision, Sarah built her EdTech startup from her garage. After 47 rejections from investors, she finally found a believer. Three years later, her platform serves 2 million students across 15 countries. The key lesson? Every "no" brought her closer to understanding what investors truly needed to hear. She refined her pitch, strengthened her metrics, and most importantly, never stopped building while fundraising.', 'A founder''s journey from 47 investor rejections to serving 2M students globally.', 'journey', ARRAY['persistence', 'fundraising', 'edtech'], 'education', 'growth', 'curated', 'Sarah Chen', 'Founder & CEO, EduBridge', true),

('The Pivot That Saved Everything', 'When Alex''s food delivery startup was burning cash faster than it could raise, he faced a choice: shut down or pivot. Instead of delivering meals, he pivoted to delivering the logistics software that powered his operations. That "side product" became a $50M B2B platform. The lesson: sometimes your biggest asset isn''t your product — it''s the infrastructure you built to support it.', 'How a failing food delivery startup pivoted its logistics software into a $50M B2B platform.', 'pivot', ARRAY['pivot', 'b2b', 'logistics'], 'technology', 'scaling', 'curated', 'Alex Rivera', 'Co-founder, LogiFlow', true),

('Burnout Nearly Broke Me — Here''s How I Rebuilt', 'After 18 months of non-stop hustle, I couldn''t get out of bed. My startup was growing, but I was falling apart. I learned the hard way that founder health IS company health. I started therapy, delegated ruthlessly, and built a team that could run without me for weeks. My company didn''t just survive — it thrived because I finally stopped being the bottleneck.', 'A founder''s honest account of burnout recovery and building sustainable leadership habits.', 'resilience', ARRAY['burnout', 'mental-health', 'leadership'], 'general', 'all', 'curated', 'Maya Patel', 'CEO, WellnessFirst', true),

('Why My First Startup Failed (And Why I''m Grateful)', 'I spent 2 years building a product nobody wanted. I ignored user feedback, over-engineered features, and ran out of money. But that failure taught me more than any MBA. My second startup? I talked to 200 customers before writing a single line of code. Product-market fit isn''t a milestone — it''s a mindset.', 'Lessons from a first startup failure that led to a successful second venture.', 'failure', ARRAY['failure', 'product-market-fit', 'learning'], 'general', 'ideation', 'curated', 'David Kim', 'Serial Entrepreneur', false),

('Building a Team When You Can''t Afford One', 'In the early days, I couldn''t pay salaries. So I offered equity, mentorship, and a compelling vision. My first three hires were people who believed in the mission more than the paycheck. Today, they''re all equity holders in a company valued at $25M. The lesson: when you can''t compete on salary, compete on purpose.', 'How purpose-driven hiring built a founding team that stayed through thick and thin.', 'team', ARRAY['hiring', 'equity', 'culture'], 'general', 'early-stage', 'curated', 'Priya Sharma', 'Founder, MissionHire', false),

('The Customer Who Changed Everything', 'One angry email from a customer completely redirected our product roadmap. She wrote three paragraphs about what we were doing wrong. Instead of getting defensive, I called her. That 45-minute conversation revealed a market gap we''d been blind to. She became our first enterprise client, and her feedback shaped the product that now serves 500+ companies.', 'How one customer''s complaint revealed a hidden market opportunity worth millions.', 'growth', ARRAY['customer-feedback', 'enterprise', 'listening'], 'saas', 'growth', 'curated', 'James Okafor', 'CTO, FeedbackLoop', false),

('Raising Money as a Solo Female Founder', 'The statistics are brutal — less than 3% of VC funding goes to women-led startups. I heard every excuse: "Come back with a co-founder," "This market is too niche," "You don''t have enough traction." I bootstrapped to $1M ARR, then raised on my terms. My advice: let your numbers silence the doubts.', 'A solo female founder''s journey to $1M ARR through bootstrapping before raising VC on her terms.', 'fundraising', ARRAY['fundraising', 'diversity', 'bootstrapping'], 'fintech', 'scaling', 'curated', 'Lisa Nakamura', 'Founder, PayHer', true),

('From Side Project to Full-Time: Making the Leap', 'For 14 months, I built my SaaS product every evening after my 9-to-5. When it hit $3K MRR, I took the leap. The transition wasn''t smooth — I underestimated how different full-time entrepreneurship feels. But having paying customers before quitting gave me a runway of confidence that no savings account could match.', 'The story of transitioning from side project to full-time founder at $3K MRR.', 'journey', ARRAY['side-project', 'saas', 'transition'], 'technology', 'early-stage', 'curated', 'Tom Bradley', 'Indie Founder, TaskFlow', false),

('What Nobody Tells You About Scaling', 'Scaling broke everything — our culture, our systems, our communication. Going from 5 to 50 people in 18 months meant every process had to be reinvented. The founder who builds a 5-person team and the leader who manages 50 are fundamentally different people. Growth demanded I evolve faster than the company.', 'The hidden challenges of rapid scaling and the personal transformation it requires from founders.', 'growth', ARRAY['scaling', 'leadership', 'operations'], 'general', 'scaling', 'curated', 'Rachel Torres', 'COO, ScaleUp Partners', false),

('How a Community Saved My Startup', 'When everything felt hopeless, I posted in a founder community: "I''m thinking of shutting down." The response was overwhelming. Founders shared similar experiences, offered advice, and three even became customers. That community became my support system, advisory board, and early customer base all in one. Never underestimate the power of vulnerability with the right people.', 'How being vulnerable in a founder community turned despair into support, advice, and customers.', 'community', ARRAY['community', 'support', 'networking'], 'general', 'all', 'curated', 'Ahmed Hassan', 'Founder, ConnectHub', true);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.inspiration_comments;
