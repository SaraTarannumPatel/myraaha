import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, MessageSquare, Heart, Trophy, ArrowRight } from "lucide-react";

interface Post {
  id: string;
  content: string;
  post_type: string;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
}

const CommunityFeedPreview = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("inspire_wall_posts")
      .select("id, content, post_type, likes_count, comments_count, created_at")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPosts(data as Post[]);
        } else {
          // Fallback to recent posts
          supabase
            .from("community_posts")
            .select("id, content, post_type, likes_count, comments_count, created_at")
            .order("created_at", { ascending: false })
            .limit(4)
            .then(({ data: fallback }) => setPosts((fallback || []) as Post[]));
        }
        setLoading(false);
      });
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Community Highlights
          </CardTitle>
          <Link to="/dashboard/peer-circles" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <CardDescription>Peer wins, challenges, and discussions</CardDescription>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="mx-auto text-muted-foreground mb-2" size={28} />
            <p className="font-body text-sm text-muted-foreground">No community highlights yet</p>
            <Link to="/dashboard/peer-circles" className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
              Join a peer circle <ArrowRight size={10} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <p className="font-body text-sm text-foreground line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                    <Heart size={10} /> {post.likes_count || 0}
                  </span>
                  <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                    <MessageSquare size={10} /> {post.comments_count || 0}
                  </span>
                  <span className="font-body text-[10px] text-accent capitalize">{post.post_type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityFeedPreview;
