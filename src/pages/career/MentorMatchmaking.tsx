import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  UserCheck, Search, Star, MessageSquare, Calendar, Filter, 
  Bookmark, BookmarkCheck, Users, Sparkles, ArrowRight, Clock,
  Heart, Award, Zap, Target, ChevronRight, Brain, Lightbulb
} from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  bio: string | null;
  expertise_areas: string[];
  industries: string[];
  experience_years: number;
  availability: string;
  focus_areas: string[];
  mentee_focus: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  profile_image_url: string | null;
}

interface MentorshipPod {
  id: string;
  name: string;
  description: string | null;
  domain: string;
  topics: string[];
  max_members: number;
  member_count: number;
}

interface MentorshipRequest {
  id: string;
  mentor_id: string;
  status: string;
  message: string | null;
  created_at: string;
}

const MentorMatchmaking = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("discover");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [pods, setPods] = useState<MentorshipPod[]>([]);
  const [bookmarkedMentors, setBookmarkedMentors] = useState<Set<string>>(new Set());
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [joinedPods, setJoinedPods] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [filterFocus, setFilterFocus] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestGoals, setRequestGoals] = useState("");
  const [smartMatches, setSmartMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [aiNudge, setAiNudge] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mentorsRes, podsRes, bookmarksRes, requestsRes, podMembersRes] = await Promise.all([
        supabase.from("mentors").select("*").eq("is_active", true),
        supabase.from("mentorship_pods").select("*").eq("is_active", true),
        supabase.from("mentor_bookmarks").select("mentor_id").eq("user_id", user!.id),
        supabase.from("mentorship_requests").select("*").eq("mentee_id", user!.id),
        supabase.from("pod_members").select("pod_id").eq("user_id", user!.id),
      ]);

      if (mentorsRes.data) setMentors(mentorsRes.data);
      if (podsRes.data) setPods(podsRes.data);
      if (bookmarksRes.data) setBookmarkedMentors(new Set(bookmarksRes.data.map(b => b.mentor_id)));
      if (requestsRes.data) setRequests(requestsRes.data);
      if (podMembersRes.data) setJoinedPods(new Set(podMembersRes.data.map(p => p.pod_id)));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const runSmartMatch = async () => {
    if (!user) return;
    setLoadingMatches(true);
    try {
      const { data, error } = await supabase.functions.invoke("mentor-matchmaking-ai", {
        body: {
          type: "smart_match",
          context: {
            user_profile: profile,
            mentors: mentors.map(m => ({ id: m.id, name: m.name, expertise: m.expertise_areas, focus: m.focus_areas, industries: m.industries })),
            user_interests: profile?.intent || "career",
            user_goals: "career growth and skill development",
          },
        },
      });
      if (error) throw error;
      setSmartMatches(data.matches || []);
      toast.success("Found your best mentor matches!");
    } catch (error: any) {
      toast.error(error.message || "Failed to run smart match");
    } finally {
      setLoadingMatches(false);
    }
  };

  const checkForNudges = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.functions.invoke("mentor-matchmaking-ai", {
        body: {
          type: "generate_nudge",
          context: {
            user_profile: profile,
            recent_activity: "exploring career options",
            mood_data: { current: "curious", trend: "stable" },
          },
        },
      });
      if (error) throw error;
      if (data.should_nudge) {
        setAiNudge(data);
      }
    } catch (error) {
      console.error("Error checking nudges:", error);
    }
  };

  useEffect(() => {
    if (mentors.length > 0 && user) {
      checkForNudges();
    }
  }, [mentors, user]);

  const toggleBookmark = async (mentorId: string) => {
    if (!user) return;
    const isBookmarked = bookmarkedMentors.has(mentorId);
    
    if (isBookmarked) {
      await supabase.from("mentor_bookmarks").delete().eq("user_id", user.id).eq("mentor_id", mentorId);
      setBookmarkedMentors(prev => { const n = new Set(prev); n.delete(mentorId); return n; });
      toast.success("Removed from saved mentors");
    } else {
      await supabase.from("mentor_bookmarks").insert({ user_id: user.id, mentor_id: mentorId });
      setBookmarkedMentors(prev => new Set(prev).add(mentorId));
      toast.success("Saved mentor for later");
    }
  };

  const sendMentorshipRequest = async () => {
    if (!user || !selectedMentor) return;
    try {
      const { error } = await supabase.from("mentorship_requests").insert({
        mentee_id: user.id,
        mentor_id: selectedMentor.id,
        message: requestMessage,
        goals: requestGoals,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Mentorship request sent! You'll be notified when they respond.");
      setRequests(prev => [...prev, { id: crypto.randomUUID(), mentor_id: selectedMentor.id, status: "pending", message: requestMessage, created_at: new Date().toISOString() }]);
      setSelectedMentor(null);
      setRequestMessage("");
      setRequestGoals("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send request");
    }
  };

  const joinPod = async (podId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("pod_members").insert({ pod_id: podId, user_id: user.id });
      if (error) throw error;
      setJoinedPods(prev => new Set(prev).add(podId));
      toast.success("Joined mentorship pod!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join pod");
    }
  };

  const leavePod = async (podId: string) => {
    if (!user) return;
    await supabase.from("pod_members").delete().eq("pod_id", podId).eq("user_id", user.id);
    setJoinedPods(prev => { const n = new Set(prev); n.delete(podId); return n; });
    toast.success("Left mentorship pod");
  };

  const filteredMentors = mentors.filter(m => {
    const matchSearch = !search || 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.expertise_areas.some(e => e.toLowerCase().includes(search.toLowerCase())) ||
      m.industries.some(i => i.toLowerCase().includes(search.toLowerCase()));
    const matchDomain = filterDomain === "all" || m.industries.some(i => i.toLowerCase() === filterDomain.toLowerCase());
    const matchAvailability = filterAvailability === "all" || m.availability === filterAvailability;
    const matchFocus = filterFocus === "all" || m.focus_areas.some(f => f.toLowerCase().includes(filterFocus.toLowerCase()));
    return matchSearch && matchDomain && matchAvailability && matchFocus;
  });

  const getRequestStatus = (mentorId: string) => requests.find(r => r.mentor_id === mentorId);

  const domains = ["all", "Tech", "Design", "Startups", "Marketing", "Finance", "Research"];
  const availabilities = ["all", "weekly", "bi-weekly", "monthly", "flexible"];
  const focuses = ["all", "Career Planning", "Startup Guidance", "Skill Building", "Technical Guidance"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
            <UserCheck size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground">Mentor Matchmaking</h1>
            <p className="font-body text-sm text-muted-foreground">
              Get guidance from experts who understand your journey — personalized to your goals and interests.
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI Nudge Banner */}
      <AnimatePresence>
        {aiNudge && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Lightbulb size={20} className="text-accent" />
              </div>
              <div className="flex-1">
                <p className="font-body text-sm text-foreground">{aiNudge.message}</p>
                <p className="font-body text-xs text-muted-foreground mt-1">{aiNudge.reason}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAiNudge(null)}>Dismiss</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="discover" className="gap-2"><Sparkles size={16} /> Discover</TabsTrigger>
          <TabsTrigger value="smart-match" className="gap-2"><Brain size={16} /> Smart Match</TabsTrigger>
          <TabsTrigger value="pods" className="gap-2"><Users size={16} /> Group Pods</TabsTrigger>
          <TabsTrigger value="saved" className="gap-2"><Bookmark size={16} /> Saved</TabsTrigger>
          <TabsTrigger value="requests" className="gap-2"><MessageSquare size={16} /> Requests</TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, expertise, or industry..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="pl-9" 
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select 
                    value={filterDomain} 
                    onChange={e => setFilterDomain(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  >
                    {domains.map(d => <option key={d} value={d}>{d === "all" ? "All Domains" : d}</option>)}
                  </select>
                  <select 
                    value={filterAvailability} 
                    onChange={e => setFilterAvailability(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  >
                    {availabilities.map(a => <option key={a} value={a}>{a === "all" ? "Any Availability" : a}</option>)}
                  </select>
                  <select 
                    value={filterFocus} 
                    onChange={e => setFilterFocus(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  >
                    {focuses.map(f => <option key={f} value={f}>{f === "all" ? "All Focus Areas" : f}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mentor Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredMentors.map((mentor, i) => (
              <MentorCard 
                key={mentor.id}
                mentor={mentor}
                index={i}
                isBookmarked={bookmarkedMentors.has(mentor.id)}
                requestStatus={getRequestStatus(mentor.id)}
                onBookmark={() => toggleBookmark(mentor.id)}
                onRequest={() => setSelectedMentor(mentor)}
              />
            ))}
          </div>

          {filteredMentors.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No mentors found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        {/* Smart Match Tab */}
        <TabsContent value="smart-match" className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="text-primary" />
                AI-Powered Mentor Matching
              </CardTitle>
              <CardDescription>
                Let our AI analyze your profile, interests, skills, and goals to find the perfect mentors for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runSmartMatch} disabled={loadingMatches} className="gap-2">
                {loadingMatches ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Find My Perfect Matches
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {smartMatches.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-xl">Your Best Matches</h3>
              {smartMatches.map((match, i) => {
                const mentor = mentors.find(m => m.id === match.mentor_id);
                if (!mentor) return null;
                return (
                  <motion.div
                    key={match.mentor_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground font-display text-2xl flex-shrink-0">
                            {mentor.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-display text-lg">{mentor.name}</h4>
                              <Badge variant="secondary" className="gap-1">
                                <Zap size={12} />
                                {match.match_score}% Match
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{mentor.bio}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {match.reasons?.slice(0, 3).map((reason: string, j: number) => (
                                <Badge key={j} variant="outline" className="text-xs">{reason}</Badge>
                              ))}
                            </div>
                            {match.suggested_topics && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-xs font-medium mb-1">Suggested Topics:</p>
                                <p className="text-xs text-muted-foreground">{match.suggested_topics.join(", ")}</p>
                              </div>
                            )}
                          </div>
                          <Button onClick={() => setSelectedMentor(mentor)} className="gap-2">
                            Connect <ArrowRight size={16} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Group Pods Tab */}
        <TabsContent value="pods" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {pods.map((pod, i) => (
              <motion.div
                key={pod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users size={18} className="text-primary" />
                          {pod.name}
                        </CardTitle>
                        <CardDescription>{pod.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{pod.domain}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {pod.topics.map(t => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {pod.member_count}/{pod.max_members} members
                      </span>
                      {joinedPods.has(pod.id) ? (
                        <Button variant="outline" size="sm" onClick={() => leavePod(pod.id)}>
                          Leave Pod
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => joinPod(pod.id)} disabled={pod.member_count >= pod.max_members}>
                          {pod.member_count >= pod.max_members ? "Full" : "Join Pod"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Saved Tab */}
        <TabsContent value="saved" className="space-y-6">
          {bookmarkedMentors.size === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bookmark size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No saved mentors yet. Browse and bookmark mentors you'd like to connect with later.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {mentors.filter(m => bookmarkedMentors.has(m.id)).map((mentor, i) => (
                <MentorCard 
                  key={mentor.id}
                  mentor={mentor}
                  index={i}
                  isBookmarked={true}
                  requestStatus={getRequestStatus(mentor.id)}
                  onBookmark={() => toggleBookmark(mentor.id)}
                  onRequest={() => setSelectedMentor(mentor)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No mentorship requests yet. Find a mentor and send your first request!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => {
                const mentor = mentors.find(m => m.id === req.mentor_id);
                return (
                  <Card key={req.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground font-display text-lg">
                          {mentor?.name.charAt(0) || "?"}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display">{mentor?.name || "Unknown Mentor"}</h4>
                          <p className="text-sm text-muted-foreground">{req.message || "No message"}</p>
                        </div>
                        <Badge variant={req.status === "pending" ? "secondary" : req.status === "accepted" ? "default" : "destructive"}>
                          {req.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Request Dialog */}
      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a personalized message to {selectedMentor?.name} explaining your goals and what you'd like to learn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Goals</label>
              <Textarea 
                placeholder="What do you hope to achieve through this mentorship?"
                value={requestGoals}
                onChange={e => setRequestGoals(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Introduction Message</label>
              <Textarea 
                placeholder="Introduce yourself and explain why you'd like to connect..."
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMentor(null)}>Cancel</Button>
            <Button onClick={sendMentorshipRequest} disabled={!requestMessage}>
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Mentor Card Component
const MentorCard = ({ 
  mentor, 
  index, 
  isBookmarked, 
  requestStatus,
  onBookmark, 
  onRequest 
}: { 
  mentor: Mentor; 
  index: number;
  isBookmarked: boolean;
  requestStatus: MentorshipRequest | undefined;
  onBookmark: () => void;
  onRequest: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
  >
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground font-display text-xl flex-shrink-0">
            {mentor.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg text-foreground truncate">{mentor.name}</h3>
              {mentor.is_verified && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Award size={10} /> Verified
                </Badge>
              )}
              <div className="flex items-center gap-1 ml-auto">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span className="font-body text-sm text-amber-600">{mentor.rating.toFixed(1)}</span>
              </div>
            </div>
            <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">{mentor.bio}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {mentor.expertise_areas.slice(0, 3).map(e => (
                <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {mentor.availability}
              </span>
              <span className="flex items-center gap-1">
                <Target size={12} /> {mentor.experience_years}+ years
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={onBookmark}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                {isBookmarked ? (
                  <BookmarkCheck size={18} className="text-primary" />
                ) : (
                  <Bookmark size={18} className="text-muted-foreground" />
                )}
              </button>
              {requestStatus ? (
                <Badge variant="secondary" className="ml-auto">
                  {requestStatus.status === "pending" ? "Request Sent ✓" : requestStatus.status}
                </Badge>
              ) : (
                <Button onClick={onRequest} size="sm" className="ml-auto gap-2">
                  <MessageSquare size={14} /> Connect
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default MentorMatchmaking;
