
-- 1) insights_submissions: revoke column-level access to author_email from anon/authenticated.
--    The public_insights view (which excludes author_email) remains readable.
REVOKE SELECT (author_email) ON public.insights_submissions FROM anon;
REVOKE SELECT (author_email) ON public.insights_submissions FROM authenticated;

-- 2) Restrict permissive SELECT policies from anon/public to authenticated-only.
-- community_members
DROP POLICY IF EXISTS "Members are publicly viewable" ON public.community_members;
CREATE POLICY "Members are viewable by authenticated"
  ON public.community_members FOR SELECT TO authenticated USING (true);

-- community_post_likes
DROP POLICY IF EXISTS "Likes viewable" ON public.community_post_likes;
CREATE POLICY "Likes viewable by authenticated"
  ON public.community_post_likes FOR SELECT TO authenticated USING (true);

-- inspiration_comments
DROP POLICY IF EXISTS "Comments are viewable" ON public.inspiration_comments;
CREATE POLICY "Comments viewable by authenticated"
  ON public.inspiration_comments FOR SELECT TO authenticated USING (true);

-- inspiration_reactions
DROP POLICY IF EXISTS "Reactions are viewable" ON public.inspiration_reactions;
CREATE POLICY "Reactions viewable by authenticated"
  ON public.inspiration_reactions FOR SELECT TO authenticated USING (true);

-- inspire_wall_posts
DROP POLICY IF EXISTS "Inspire posts viewable" ON public.inspire_wall_posts;
CREATE POLICY "Inspire posts viewable by authenticated"
  ON public.inspire_wall_posts FOR SELECT TO authenticated USING (true);

-- mentor_reviews
DROP POLICY IF EXISTS "Reviews are publicly viewable" ON public.mentor_reviews;
CREATE POLICY "Reviews viewable by authenticated"
  ON public.mentor_reviews FOR SELECT TO authenticated USING (true);

-- peer_circle_members
DROP POLICY IF EXISTS "Members publicly viewable" ON public.peer_circle_members;
CREATE POLICY "Peer members viewable by authenticated"
  ON public.peer_circle_members FOR SELECT TO authenticated USING (true);

-- peer_circle_milestones
DROP POLICY IF EXISTS "Milestones viewable" ON public.peer_circle_milestones;
CREATE POLICY "Milestones viewable by authenticated"
  ON public.peer_circle_milestones FOR SELECT TO authenticated USING (true);

-- peer_circle_projects
DROP POLICY IF EXISTS "Projects viewable" ON public.peer_circle_projects;
CREATE POLICY "Projects viewable by authenticated"
  ON public.peer_circle_projects FOR SELECT TO authenticated USING (true);

-- peer_project_participants
DROP POLICY IF EXISTS "Participants viewable" ON public.peer_project_participants;
CREATE POLICY "Participants viewable by authenticated"
  ON public.peer_project_participants FOR SELECT TO authenticated USING (true);

-- pod_members
DROP POLICY IF EXISTS "Pod members are viewable" ON public.pod_members;
CREATE POLICY "Pod members viewable by authenticated"
  ON public.pod_members FOR SELECT TO authenticated USING (true);

-- session_participants
DROP POLICY IF EXISTS "Session participants are viewable" ON public.session_participants;
CREATE POLICY "Session participants viewable by authenticated"
  ON public.session_participants FOR SELECT TO authenticated USING (true);

-- showcase_comments
DROP POLICY IF EXISTS "Anyone can view showcase comments" ON public.showcase_comments;
CREATE POLICY "Showcase comments viewable by authenticated"
  ON public.showcase_comments FOR SELECT TO authenticated USING (true);

-- showcase_reactions
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.showcase_reactions;
CREATE POLICY "Showcase reactions viewable by authenticated"
  ON public.showcase_reactions FOR SELECT TO authenticated USING (true);
