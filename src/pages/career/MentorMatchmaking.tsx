import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ModuleSearchBar from "@/components/search/ModuleSearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  UserCheck, Search, Star, MessageSquare, Calendar, Filter,
  Bookmark, BookmarkCheck, Users, Sparkles, ArrowRight, Clock,
  Heart, Award, Zap, Target, ChevronRight, Brain, Lightbulb,
  RefreshCw, CheckCircle2, FileText, Eye
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
  total_sessions: number;
  is_verified: boolean;
  profile_image_url: string | null;
  achievements: string[];
  linkedin_url: string | null;
  calendar_link: string | null;
  past_projects: any;
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
  goals: string | null;
  created_at: string;
}

interface MentorSession {
  id: string;
  mentor_id: string;
  session_type: string;
  title: string;
  description: string | null;
  topics: string[];
  scheduled_at: string;
  duration_minutes: number;
  meeting_link: string | null;
  status: string;
  max_participants: number;
  current_participants: number;
}

interface MentorReview {
  id: string;
  mentor_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string | null;
  helpfulness_score: number | null;
  communication_score: number | null;
  expertise_score: number | null;
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
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [reviews, setReviews] = useState<MentorReview[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [filterFocus, setFilterFocus] = useState("all");
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [viewingMentor, setViewingMentor] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestGoals, setRequestGoals] = useState("");
  const [smartMatches, setSmartMatches] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [aiNudge, setAiNudge] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [mentorAnalysis, setMentorAnalysis] = useState<any>(null);
  const [sessionPrep, setSessionPrep] = useState<any>(null);
  const [reflectionSession, setReflectionSession] = useState<MentorSession | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionMood, setReflectionMood] = useState("neutral");
  const [postSessionInsights, setPostSessionInsights] = useState<any>(null);

  // Cross-module data for smart matching
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [userSkills, setUserSkills] = useState<any[]>([]);
  const [userPatterns, setUserPatterns] = useState<any[]>([]);
  const [userEnergy, setUserEnergy] = useState<any[]>([]);
  const [userClarity, setUserClarity] = useState<any>(null);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  // Pre-fill search/filter when arriving from an Explore card
  const location = useLocation();
  useEffect(() => {
    const ec = (location.state as any)?.exploreContext;
    if (!ec) return;
    const focus = ec.context || ec.item?.title;
    if (focus) {
      setSearch(focus);
      setActiveTab("discover");
      toast.info(`Showing mentors related to "${focus}"`);
    }
    if (ec.item?.domain) setFilterDomain(ec.item.domain);
    window.history.replaceState({}, document.title);
  }, [location.state]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mentorsRes, podsRes, bookmarksRes, requestsRes, podMembersRes, sessionsRes, reviewsRes, interactionsRes, interestsRes, skillsRes, patternsRes, energyRes, clarityRes] = await Promise.all([
        supabase.from("mentors").select("*").eq("is_active", true),
        supabase.from("mentorship_pods").select("*").eq("is_active", true),
        supabase.from("mentor_bookmarks").select("mentor_id").eq("user_id", user!.id),
        supabase.from("mentorship_requests").select("*").eq("mentee_id", user!.id).order("created_at", { ascending: false }),
        supabase.from("pod_members").select("pod_id").eq("user_id", user!.id),
        supabase.from("mentorship_sessions").select("*").order("scheduled_at", { ascending: true }),
        supabase.from("mentor_reviews").select("*").order("created_at", { ascending: false }),
        supabase.from("mentorship_interactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("interests").select("*").eq("user_id", user!.id),
        supabase.from("skills").select("*").eq("user_id", user!.id),
        supabase.from("behavior_patterns").select("*").eq("user_id", user!.id).limit(10),
        supabase.from("energy_zones").select("*").eq("user_id", user!.id).limit(10),
        supabase.from("clarity_scores").select("*").eq("user_id", user!.id).order("recorded_at", { ascending: false }).limit(1),
      ]);

      if (mentorsRes.data) setMentors(mentorsRes.data);
      if (podsRes.data) setPods(podsRes.data);
      if (bookmarksRes.data) setBookmarkedMentors(new Set(bookmarksRes.data.map(b => b.mentor_id)));
      if (requestsRes.data) setRequests(requestsRes.data);
      if (podMembersRes.data) setJoinedPods(new Set(podMembersRes.data.map((p: any) => p.pod_id)));
      if (sessionsRes.data) setSessions(sessionsRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
      if (interactionsRes.data) setInteractions(interactionsRes.data);
      if (interestsRes.data) setUserInterests(interestsRes.data);
      if (skillsRes.data) setUserSkills(skillsRes.data);
      if (patternsRes.data) setUserPatterns(patternsRes.data);
      if (energyRes.data) setUserEnergy(energyRes.data);
      if (clarityRes.data?.[0]) setUserClarity(clarityRes.data[0]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mentors.length > 0 && user) checkForNudges();
  }, [mentors, user]);

  const runSmartMatch = async () => {
    if (!user) return;
    setLoadingMatches(true);
    try {
      const { data, error } = await supabase.functions.invoke("mentor-matchmaking-ai", {
        body: {
          type: "smart_match",
          context: {
            user_profile: profile,
            mentors: mentors.map(m => ({
              id: m.id, name: m.name, expertise: m.expertise_areas,
              focus: m.focus_areas, industries: m.industries,
              rating: m.rating, experience_years: m.experience_years,
              mentee_focus: m.mentee_focus,
            })),
            user_interests: userInterests.map(i => ({ name: i.name, category: i.category, strength: i.strength })),
            user_skills: userSkills.map(s => ({ name: s.name, category: s.category, proficiency: s.proficiency })),
            behavior_patterns: userPatterns.map(p => ({ description: p.pattern_description, type: p.pattern_type, is_positive: p.is_positive })),
            energy_zones: userEnergy.map(e => ({ domain: e.domain, energy: e.energy_level, mood: e.mood_after })),
            clarity_score: userClarity?.overall_clarity || 0.5,
            user_goals: (profile as any)?.short_term_goals || "career growth",
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
      const [journalRes] = await Promise.all([
        supabase.from("journal_entries").select("mood, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
      ]);
      const recentMoods = journalRes.data?.map((j: any) => j.mood).filter(Boolean) || [];
      const { data, error } = await supabase.functions.invoke("mentor-matchmaking-ai", {
        body: {
          type: "generate_nudge",
          context: {
            user_profile: profile,
            recent_activity: "exploring career options",
            mood_data: { recent_moods: recentMoods, clarity: userClarity?.overall_clarity || 0.5 },
            has_active_mentor: requests.some(r => r.status === "accepted"),
            days_since_last_session: interactions.length > 0
              ? Math.floor((Date.now() - new Date(interactions[0].created_at).getTime()) / 86400000)
              : 999,
          },
        },
      });
      if (error) throw error;
      if (data.should_nudge) setAiNudge(data);
    } catch (error) {
      console.error("Error checking nudges:", error);
    }
  };

  const analyzeMentorFit = async (mentor: Mentor) => {
    setAiLoading(true);
    setMentorAnalysis(null);
    try {
      const { data, error } = await supabase.functions.invoke("mentor-matchmaking-ai", {
        body: {
          type: "mentor_profile_analysis",
          context: {
            mentor: {
              name: mentor.name, bio: mentor.bio, expertise: mentor.expertise_areas,
              focus: mentor.focus_areas, industries: mentor.industries,
              experience_years: mentor.experience_years, mentee_focus: mentor.mentee_focus,
              achievements: mentor.achievements, past_projects: mentor.past_projects,
            },
            user: {
              interests: userInterests.map(i => i.name),
              skills: userSkills.map(s => s.name),
              goals: (profile as any)?.short_term_goals || "career growth",
              clarity: userClarity?.overall_clarity || 0.5,
            },
          },
        },
      });
      if (error) throw error;
      setMentorAnalysis(data);
    } catch (error: any) {
      toast.error("Failed to analyze mentor fit");
    }
    setAiLoading(false);
  };

  const prepareSession = async (session: MentorSession) => {
    setAiLoading(true);
    setSessionPrep(null);
    try {
      const mentor = mentors.find(m => m.id === session.mentor_id);
      const pastInteractions = interactions.filter(i => i.mentor_id === session.mentor_id);
      const { data, error } = await supabase.functions.invoke("mentor-matchmaking-ai", {
        body: {
          type: "session_prep",
          context: {
            mentor: { name: mentor?.name, expertise: mentor?.expertise_areas, focus: mentor?.focus_areas },
            session: { title: session.title, topics: session.topics, type: session.session_type },
            user_goals: (profile as any)?.short_term_goals || "career growth",
            past_interactions: pastInteractions.slice(0, 5).map(i => ({ summary: i.summary, skills: i.skills_discussed, outcomes: i.outcomes })),
            user_skills: userSkills.map(s => s.name),
          },
        },
      });
      if (error) throw error;
      setSessionPrep(data);
      toast.success("Session prep ready!");
    } catch (error: any) {
      toast.error("Failed to prepare session");
    }
    setAiLoading(false);
  };

  const submitReflection = async () => {
    if (!reflectionSession || !reflectionText.trim()) return;
    setAiLoading(true);
    try {
      // Save interaction
      await supabase.from("mentorship_interactions").insert({
        user_id: user!.id,
        mentor_id: reflectionSession.mentor_id,
        session_id: reflectionSession.id,
        interaction_type: "session_reflection",
        summary: reflectionText,
        mood_after: reflectionMood,
      });

      // Get post-session insights
      const mentor = mentors.find(m => m.id === reflectionSession.mentor_id);
      const { data, error } = await supabase.functions.invoke("mentor-matchmaking-ai", {
        body: {
          type: "post_session_insights",
          context: {
            session: { title: reflectionSession.title, topics: reflectionSession.topics },
            mentor_name: mentor?.name,
            user_reflection: reflectionText,
            mood_after: reflectionMood,
            user_goals: (profile as any)?.short_term_goals,
          },
        },
      });
      if (!error && data) setPostSessionInsights(data);

      setReflectionSession(null);
      setReflectionText("");
      fetchData();
      toast.success("Reflection saved and insights generated!");
    } catch (error: any) {
      toast.error("Failed to save reflection");
    }
    setAiLoading(false);
  };

  const toggleBookmark = async (mentorId: string) => {
    if (!user) return;
    if (bookmarkedMentors.has(mentorId)) {
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
      toast.success("Mentorship request sent!");
      setRequests(prev => [...prev, { id: crypto.randomUUID(), mentor_id: selectedMentor.id, status: "pending", message: requestMessage, goals: requestGoals, created_at: new Date().toISOString() }]);
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
      (m.expertise_areas || []).some(e => e.toLowerCase().includes(search.toLowerCase())) ||
      (m.industries || []).some(i => i.toLowerCase().includes(search.toLowerCase()));
    const matchDomain = filterDomain === "all" || (m.industries || []).some(i => i.toLowerCase() === filterDomain.toLowerCase());
    const matchAvailability = filterAvailability === "all" || m.availability === filterAvailability;
    const matchFocus = filterFocus === "all" || (m.focus_areas || []).some(f => f.toLowerCase().includes(filterFocus.toLowerCase()));
    return matchSearch && matchDomain && matchAvailability && matchFocus;
  });

  const getRequestStatus = (mentorId: string) => requests.find(r => r.mentor_id === mentorId);
  const getMentorReviews = (mentorId: string) => reviews.filter(r => r.mentor_id === mentorId);
  const getMentorSessions = (mentorId: string) => sessions.filter(s => s.mentor_id === mentorId);

  const upcomingSessions = sessions.filter(s => new Date(s.scheduled_at) > new Date() && s.status !== "cancelled");
  const pastSessions = sessions.filter(s => new Date(s.scheduled_at) <= new Date() || s.status === "completed");

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
            <UserCheck size={24} className="text-primary-foreground" />
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-primary/20 border border-accent/30">
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

      {/* Post-session insights banner */}
      <AnimatePresence>
        {postSessionInsights && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg text-foreground flex items-center gap-2"><Sparkles size={18} className="text-accent" /> Post-Session Insights</h3>
              <Button variant="ghost" size="sm" onClick={() => setPostSessionInsights(null)}>Close</Button>
            </div>
            {postSessionInsights.key_takeaways?.length > 0 && (
              <div className="mb-3">
                <p className="font-body text-xs text-muted-foreground mb-1">Key Takeaways</p>
                {postSessionInsights.key_takeaways.map((t: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 mb-1">
                    <CheckCircle2 size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-body text-sm text-foreground">{t}</span>
                  </div>
                ))}
              </div>
            )}
            {postSessionInsights.action_items?.length > 0 && (
              <div className="mb-3">
                <p className="font-body text-xs text-muted-foreground mb-1">Action Items</p>
                {postSessionInsights.action_items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    <ArrowRight size={12} className="text-accent flex-shrink-0" />
                    <span className="font-body text-sm text-foreground">{item.task || item}</span>
                    {item.priority && <Badge variant="outline" className="text-xs">{item.priority}</Badge>}
                  </div>
                ))}
              </div>
            )}
            {postSessionInsights.mood_impact && (
              <p className="font-body text-xs text-muted-foreground italic">{postSessionInsights.mood_impact}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex-wrap h-auto p-1 bg-muted/50">
          <TabsTrigger value="discover" className="gap-2"><Sparkles size={16} /> Discover</TabsTrigger>
          <TabsTrigger value="smart-match" className="gap-2"><Brain size={16} /> Smart Match</TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2"><Calendar size={16} /> Sessions</TabsTrigger>
          <TabsTrigger value="pods" className="gap-2"><Users size={16} /> Group Pods</TabsTrigger>
          <TabsTrigger value="saved" className="gap-2"><Bookmark size={16} /> Saved</TabsTrigger>
          <TabsTrigger value="requests" className="gap-2"><MessageSquare size={16} /> Requests</TabsTrigger>
          <TabsTrigger value="history" className="gap-2"><FileText size={16} /> History</TabsTrigger>
        </TabsList>

        {/* ===== Discover Tab ===== */}
        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <ModuleSearchBar
                  placeholder="Search by name, expertise, or industry..."
                  sources={["careers", "domains"]}
                  onSearch={(q) => setSearch(q)}
                  onSelect={(item) => setSearch(item.title)}
                  showAiBadge
                />
                <div className="flex flex-wrap gap-2">
                  <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {domains.map(d => <option key={d} value={d}>{d === "all" ? "All Domains" : d}</option>)}
                  </select>
                  <select value={filterAvailability} onChange={e => setFilterAvailability(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {availabilities.map(a => <option key={a} value={a}>{a === "all" ? "Any Availability" : a}</option>)}
                  </select>
                  <select value={filterFocus} onChange={e => setFilterFocus(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
                    {focuses.map(f => <option key={f} value={f}>{f === "all" ? "All Focus Areas" : f}</option>)}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredMentors.map((mentor, i) => (
              <MentorCard
                key={mentor.id} mentor={mentor} index={i}
                isBookmarked={bookmarkedMentors.has(mentor.id)}
                requestStatus={getRequestStatus(mentor.id)}
                reviewCount={getMentorReviews(mentor.id).length}
                onBookmark={() => toggleBookmark(mentor.id)}
                onRequest={() => setSelectedMentor(mentor)}
                onView={() => { setViewingMentor(mentor); analyzeMentorFit(mentor); }}
              />
            ))}
          </div>
          {filteredMentors.length === 0 && (
            <div className="text-center py-12"><p className="text-muted-foreground">No mentors found matching your criteria.</p></div>
          )}
        </TabsContent>

        {/* ===== Smart Match Tab ===== */}
        <TabsContent value="smart-match" className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="text-primary" />AI-Powered Mentor Matching</CardTitle>
              <CardDescription>
                Our AI analyzes your interests ({userInterests.length}), skills ({userSkills.length}), behavior patterns ({userPatterns.length}), energy zones, and clarity score ({Math.round((userClarity?.overall_clarity || 0.5) * 100)}%) to find perfect mentors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runSmartMatch} disabled={loadingMatches} className="gap-2">
                {loadingMatches ? <><RefreshCw size={16} className="animate-spin" /> Analyzing...</> : <><Sparkles size={16} /> Find My Perfect Matches</>}
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
                  <motion.div key={match.mentor_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground font-display text-2xl flex-shrink-0">
                            {mentor.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-display text-lg">{mentor.name}</h4>
                              <Badge variant="secondary" className="gap-1"><Zap size={12} />{match.match_score}% Match</Badge>
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
                            {match.compatibility_notes && (
                              <p className="font-body text-xs text-muted-foreground mt-2 italic">{match.compatibility_notes}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button onClick={() => setSelectedMentor(mentor)} className="gap-2">Connect <ArrowRight size={16} /></Button>
                            <Button variant="outline" size="sm" onClick={() => { setViewingMentor(mentor); analyzeMentorFit(mentor); }}>
                              <Eye size={14} /> Profile
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ===== Sessions Tab ===== */}
        <TabsContent value="sessions" className="space-y-6">
          <h3 className="font-display text-xl text-foreground">Mentorship Sessions</h3>

          {upcomingSessions.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-body text-sm font-medium text-muted-foreground">Upcoming</h4>
              {upcomingSessions.map(session => {
                const mentor = mentors.find(m => m.id === session.mentor_id);
                return (
                  <Card key={session.id} className="border-accent/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-display text-lg text-foreground">{session.title}</h4>
                            <Badge variant="secondary">{session.session_type}</Badge>
                          </div>
                          <p className="font-body text-sm text-muted-foreground">with {mentor?.name || "Mentor"}</p>
                          {session.description && <p className="font-body text-xs text-muted-foreground mt-1">{session.description}</p>}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(session.scheduled_at).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {session.duration_minutes} min</span>
                            <span className="flex items-center gap-1"><Users size={12} /> {session.current_participants}/{session.max_participants}</span>
                          </div>
                          {session.topics?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {session.topics.map((t: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          {session.meeting_link && (
                            <Button size="sm" asChild><a href={session.meeting_link} target="_blank" rel="noopener noreferrer">Join</a></Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => prepareSession(session)} disabled={aiLoading}>
                            {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />} Prep
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Session Prep Panel */}
          {sessionPrep && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-lg flex items-center gap-2"><Sparkles size={18} className="text-accent" /> Session Preparation</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSessionPrep(null)}>Close</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessionPrep.suggested_topics?.length > 0 && (
                  <div>
                    <p className="font-body text-sm font-medium text-foreground mb-2">Discussion Topics</p>
                    {sessionPrep.suggested_topics.map((topic: any, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-background mb-2">
                        <p className="font-body text-sm font-medium text-foreground">{topic.topic}</p>
                        <p className="font-body text-xs text-muted-foreground">{topic.why}</p>
                        {topic.questions_to_ask?.length > 0 && (
                          <div className="mt-1">
                            {topic.questions_to_ask.map((q: string, j: number) => (
                              <p key={j} className="font-body text-xs text-accent">• {q}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {sessionPrep.preparation_tasks?.length > 0 && (
                  <div>
                    <p className="font-body text-sm font-medium text-foreground mb-1">Preparation Tasks</p>
                    {sessionPrep.preparation_tasks.map((task: string, i: number) => (
                      <div key={i} className="flex items-center gap-2"><CheckCircle2 size={12} className="text-muted-foreground" /><span className="font-body text-sm text-foreground">{task}</span></div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {pastSessions.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-body text-sm font-medium text-muted-foreground">Past Sessions</h4>
              {pastSessions.slice(0, 10).map(session => {
                const mentor = mentors.find(m => m.id === session.mentor_id);
                const hasReflection = interactions.some(i => i.session_id === session.id);
                return (
                  <Card key={session.id} className="border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-body text-sm font-medium text-foreground">{session.title}</h4>
                          <p className="font-body text-xs text-muted-foreground">with {mentor?.name} • {new Date(session.scheduled_at).toLocaleDateString()}</p>
                        </div>
                        {hasReflection ? (
                          <Badge variant="secondary"><CheckCircle2 size={12} /> Reflected</Badge>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setReflectionSession(session)}>
                            <Heart size={14} /> Reflect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {sessions.length === 0 && (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sessions yet. Connect with a mentor to schedule your first session!</p>
            </div>
          )}
        </TabsContent>

        {/* ===== Group Pods Tab ===== */}
        <TabsContent value="pods" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {pods.map((pod, i) => (
              <motion.div key={pod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2"><Users size={18} className="text-primary" />{pod.name}</CardTitle>
                        <CardDescription>{pod.description}</CardDescription>
                      </div>
                      <Badge variant="outline">{pod.domain}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {(pod.topics || []).map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{pod.member_count}/{pod.max_members} members</span>
                      {joinedPods.has(pod.id) ? (
                        <Button variant="outline" size="sm" onClick={() => leavePod(pod.id)}>Leave Pod</Button>
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
            {pods.length === 0 && (
              <div className="col-span-2 text-center py-12"><Users size={48} className="mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No mentorship pods available yet.</p></div>
            )}
          </div>
        </TabsContent>

        {/* ===== Saved Tab ===== */}
        <TabsContent value="saved" className="space-y-6">
          {bookmarkedMentors.size === 0 ? (
            <Card><CardContent className="py-12 text-center"><Bookmark size={48} className="mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No saved mentors yet.</p></CardContent></Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {mentors.filter(m => bookmarkedMentors.has(m.id)).map((mentor, i) => (
                <MentorCard key={mentor.id} mentor={mentor} index={i} isBookmarked={true} requestStatus={getRequestStatus(mentor.id)} reviewCount={getMentorReviews(mentor.id).length} onBookmark={() => toggleBookmark(mentor.id)} onRequest={() => setSelectedMentor(mentor)} onView={() => { setViewingMentor(mentor); analyzeMentorFit(mentor); }} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== Requests Tab ===== */}
        <TabsContent value="requests" className="space-y-6">
          {requests.length === 0 ? (
            <Card><CardContent className="py-12 text-center"><MessageSquare size={48} className="mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No mentorship requests yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {requests.map(req => {
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
                          {req.goals && <p className="text-xs text-muted-foreground mt-1">Goal: {req.goals}</p>}
                          <p className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</p>
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

        {/* ===== History Tab ===== */}
        <TabsContent value="history" className="space-y-6">
          <h3 className="font-display text-xl text-foreground">Mentorship History</h3>
          {interactions.length > 0 ? (
            <div className="space-y-4">
              {interactions.map(interaction => {
                const mentor = mentors.find(m => m.id === interaction.mentor_id);
                return (
                  <Card key={interaction.id} className="border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground font-display flex-shrink-0">
                          {mentor?.name?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-body text-sm font-medium text-foreground">{mentor?.name || "Mentor"}</span>
                            <Badge variant="outline" className="text-xs">{interaction.interaction_type}</Badge>
                            {interaction.mood_after && <span className="font-body text-xs text-muted-foreground">Mood: {interaction.mood_after}</span>}
                          </div>
                          {interaction.summary && <p className="font-body text-sm text-foreground">{interaction.summary}</p>}
                          {interaction.skills_discussed?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {interaction.skills_discussed.map((s: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          )}
                          {interaction.outcomes?.length > 0 && (
                            <div className="mt-2">
                              {interaction.outcomes.map((o: string, i: number) => (
                                <div key={i} className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /><span className="font-body text-xs text-foreground">{o}</span></div>
                              ))}
                            </div>
                          )}
                          <p className="font-body text-xs text-muted-foreground mt-1">{new Date(interaction.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No mentorship interactions recorded yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ===== Request Dialog ===== */}
      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>Send a personalized message to {selectedMentor?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Goals</label>
              <Textarea placeholder="What do you hope to achieve?" value={requestGoals} onChange={e => setRequestGoals(e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Introduction Message</label>
              <Textarea placeholder="Introduce yourself..." value={requestMessage} onChange={e => setRequestMessage(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMentor(null)}>Cancel</Button>
            <Button onClick={sendMentorshipRequest} disabled={!requestMessage}>Send Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Mentor Profile Dialog ===== */}
      <Dialog open={!!viewingMentor} onOpenChange={() => { setViewingMentor(null); setMentorAnalysis(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {viewingMentor && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground font-display text-2xl flex-shrink-0">
                    {viewingMentor.name.charAt(0)}
                  </div>
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      {viewingMentor.name}
                      {viewingMentor.is_verified && <Badge variant="secondary" className="gap-1 text-xs"><Award size={10} /> Verified</Badge>}
                    </DialogTitle>
                    <DialogDescription>{viewingMentor.bio}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="font-display text-xl text-accent">{viewingMentor.experience_years}+</div>
                    <p className="font-body text-xs text-muted-foreground">Years Exp</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="font-display text-xl text-accent flex items-center justify-center gap-1"><Star size={16} className="fill-accent" />{(viewingMentor.rating || 0).toFixed(1)}</div>
                    <p className="font-body text-xs text-muted-foreground">{viewingMentor.total_reviews || 0} reviews</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="font-display text-xl text-accent">{viewingMentor.total_sessions || 0}</div>
                    <p className="font-body text-xs text-muted-foreground">Sessions</p>
                  </div>
                </div>

                {/* Expertise */}
                <div>
                  <p className="font-body text-sm font-medium text-foreground mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-1">
                    {(viewingMentor.expertise_areas || []).map(e => <Badge key={e} variant="outline">{e}</Badge>)}
                  </div>
                </div>

                {/* Focus Areas */}
                {viewingMentor.focus_areas?.length > 0 && (
                  <div>
                    <p className="font-body text-sm font-medium text-foreground mb-2">Focus Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {viewingMentor.focus_areas.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
                    </div>
                  </div>
                )}

                {/* Mentee Focus */}
                {viewingMentor.mentee_focus && (
                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="font-body text-xs text-muted-foreground">Ideal Mentee</p>
                    <p className="font-body text-sm text-foreground">{viewingMentor.mentee_focus}</p>
                  </div>
                )}

                {/* AI Fit Analysis */}
                {aiLoading && !mentorAnalysis && (
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/10 text-center">
                    <RefreshCw size={20} className="animate-spin mx-auto text-accent mb-2" />
                    <p className="font-body text-sm text-muted-foreground">Analyzing fit...</p>
                  </div>
                )}
                {mentorAnalysis && (
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                    <h4 className="font-display text-sm flex items-center gap-2 mb-3"><Sparkles size={16} className="text-accent" /> AI Fit Analysis</h4>
                    {mentorAnalysis.fit_assessment && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-body text-sm text-foreground">Fit Score:</span>
                          <Progress value={mentorAnalysis.fit_assessment.score} className="h-2 flex-1" />
                          <span className="font-display text-lg text-accent">{mentorAnalysis.fit_assessment.score}%</span>
                        </div>
                        {mentorAnalysis.fit_assessment.strengths?.length > 0 && (
                          <div className="mb-2">
                            {mentorAnalysis.fit_assessment.strengths.map((s: string, i: number) => (
                              <div key={i} className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /><span className="font-body text-xs text-foreground">{s}</span></div>
                            ))}
                          </div>
                        )}
                        {mentorAnalysis.fit_assessment.considerations?.length > 0 && (
                          <div>
                            {mentorAnalysis.fit_assessment.considerations.map((c: string, i: number) => (
                              <div key={i} className="flex items-center gap-1"><Lightbulb size={10} className="text-yellow-500" /><span className="font-body text-xs text-muted-foreground">{c}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {mentorAnalysis.potential_topics?.length > 0 && (
                      <div className="mb-2">
                        <p className="font-body text-xs text-muted-foreground mb-1">Suggested Topics</p>
                        <div className="flex flex-wrap gap-1">
                          {mentorAnalysis.potential_topics.map((t: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}
                        </div>
                      </div>
                    )}
                    {mentorAnalysis.intro_message_template && (
                      <div className="mt-2 p-2 rounded bg-background">
                        <p className="font-body text-xs text-muted-foreground mb-1">Intro Message Template</p>
                        <p className="font-body text-xs text-foreground italic">{mentorAnalysis.intro_message_template}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews */}
                {getMentorReviews(viewingMentor.id).length > 0 && (
                  <div>
                    <p className="font-body text-sm font-medium text-foreground mb-2">Reviews</p>
                    {getMentorReviews(viewingMentor.id).slice(0, 5).map(review => (
                      <div key={review.id} className="p-3 rounded-lg bg-muted/30 mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < review.rating ? "text-accent fill-accent" : "text-muted"} />)}</div>
                          <span className="font-body text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        {review.review_text && <p className="font-body text-sm text-foreground">{review.review_text}</p>}
                        <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                          {review.helpfulness_score != null && <span>Helpful: {review.helpfulness_score}/5</span>}
                          {review.communication_score != null && <span>Communication: {review.communication_score}/5</span>}
                          {review.expertise_score != null && <span>Expertise: {review.expertise_score}/5</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upcoming sessions by this mentor */}
                {getMentorSessions(viewingMentor.id).filter(s => new Date(s.scheduled_at) > new Date()).length > 0 && (
                  <div>
                    <p className="font-body text-sm font-medium text-foreground mb-2">Upcoming Sessions</p>
                    {getMentorSessions(viewingMentor.id).filter(s => new Date(s.scheduled_at) > new Date()).map(s => (
                      <div key={s.id} className="p-3 rounded-lg bg-muted/30 mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-body text-sm text-foreground">{s.title}</p>
                          <p className="font-body text-xs text-muted-foreground">{new Date(s.scheduled_at).toLocaleDateString()} • {s.duration_minutes} min</p>
                        </div>
                        <Badge variant="outline">{s.current_participants}/{s.max_participants}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => toggleBookmark(viewingMentor.id)}>
                  {bookmarkedMentors.has(viewingMentor.id) ? <><BookmarkCheck size={14} /> Saved</> : <><Bookmark size={14} /> Save</>}
                </Button>
                {!getRequestStatus(viewingMentor.id) && (
                  <Button onClick={() => { setViewingMentor(null); setMentorAnalysis(null); setSelectedMentor(viewingMentor); }}>
                    <MessageSquare size={14} /> Connect
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Reflection Dialog ===== */}
      <Dialog open={!!reflectionSession} onOpenChange={() => setReflectionSession(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Reflection</DialogTitle>
            <DialogDescription>Reflect on your session "{reflectionSession?.title}" to internalize your learning.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">How did this session help you?</label>
              <Textarea placeholder="What did you learn? What insights did you gain?" value={reflectionText} onChange={e => setReflectionText(e.target.value)} rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">How do you feel after?</label>
              <div className="flex flex-wrap gap-2">
                {["😊 Inspired", "💪 Motivated", "🤔 Thoughtful", "😌 Calm", "😐 Neutral"].map(m => {
                  const val = m.split(" ")[1].toLowerCase();
                  return (
                    <button key={val} onClick={() => setReflectionMood(val)} className={`px-3 py-1.5 rounded-full text-xs font-body border transition-colors ${reflectionMood === val ? "bg-accent text-accent-foreground border-accent" : "border-input hover:bg-muted"}`}>
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReflectionSession(null)}>Cancel</Button>
            <Button onClick={submitReflection} disabled={!reflectionText.trim() || aiLoading}>
              {aiLoading ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : "Save & Get Insights"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ===== Mentor Card Component =====
const MentorCard = ({
  mentor, index, isBookmarked, requestStatus, reviewCount, onBookmark, onRequest, onView
}: {
  mentor: Mentor; index: number; isBookmarked: boolean; requestStatus: MentorshipRequest | undefined; reviewCount: number;
  onBookmark: () => void; onRequest: () => void; onView: () => void;
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-primary-foreground font-display text-xl flex-shrink-0">
            {mentor.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-lg text-foreground truncate">{mentor.name}</h3>
              {mentor.is_verified && <Badge variant="secondary" className="gap-1 text-xs"><Award size={10} /> Verified</Badge>}
              <div className="flex items-center gap-1 ml-auto">
                <Star size={14} className="text-accent fill-accent" />
                <span className="font-body text-sm text-accent">{(mentor.rating || 0).toFixed(1)}</span>
                {reviewCount > 0 && <span className="font-body text-xs text-muted-foreground">({reviewCount})</span>}
              </div>
            </div>
            <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">{mentor.bio}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(mentor.expertise_areas || []).slice(0, 3).map(e => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock size={12} /> {mentor.availability || "Flexible"}</span>
              <span className="flex items-center gap-1"><Target size={12} /> {mentor.experience_years || 0}+ years</span>
              {(mentor.total_sessions || 0) > 0 && <span className="flex items-center gap-1"><Users size={12} /> {mentor.total_sessions} sessions</span>}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={onBookmark} className="p-2 rounded-lg hover:bg-muted transition-colors">
                {isBookmarked ? <BookmarkCheck size={18} className="text-primary" /> : <Bookmark size={18} className="text-muted-foreground" />}
              </button>
              <Button variant="outline" size="sm" onClick={onView}><Eye size={14} /> Profile</Button>
              {requestStatus ? (
                <Badge variant="secondary" className="ml-auto">{requestStatus.status === "pending" ? "Request Sent ✓" : requestStatus.status}</Badge>
              ) : (
                <Button onClick={onRequest} size="sm" className="ml-auto gap-2"><MessageSquare size={14} /> Connect</Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default MentorMatchmaking;
