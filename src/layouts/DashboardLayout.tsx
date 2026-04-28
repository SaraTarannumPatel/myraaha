import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import OnboardingReminderPopup from "@/components/OnboardingReminderPopup";
import RewardCelebrationManager from "@/components/curiositycompass/RewardCelebrationManager";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Compass, Map, Brain, FileText, Sparkles, Rocket, Lightbulb, Wrench, User,
  Zap, BookOpen, Users, Trophy, Settings, LogOut, Menu, X, ArrowLeftRight,
  LayoutDashboard, Bell, UserCheck, FolderKanban, Briefcase, Bot, Heart,
  Presentation, Building2, LifeBuoy, Globe, Navigation, Medal, Palette, RefreshCw
} from "lucide-react";
import Logo from "@/components/Logo";

// Paths surfaced as the mobile bottom navbar — also kept in the side nav on desktop.
const MOBILE_BOTTOM_NAV_PATHS = new Set([
  "/dashboard/curiosity-compass",
  "/dashboard/roadmap",
  "/dashboard/explore",
  "/dashboard/project-playground",
  "/dashboard/job-matching",
  "/dashboard/peer-circles",
  "/dashboard/career-therapist",
]);

const mobileBottomNav = [
  { label: "Compass", icon: Compass, path: "/dashboard/curiosity-compass" },
  { label: "Roadmap", icon: Map, path: "/dashboard/roadmap" },
  { label: "Explore", icon: Sparkles, path: "/dashboard/explore" },
  { label: "Projects", icon: FolderKanban, path: "/dashboard/project-playground" },
  { label: "Jobs", icon: Briefcase, path: "/dashboard/job-matching" },
  { label: "Peers", icon: Users, path: "/dashboard/peer-circles" },
  { label: "Therapy", icon: Heart, path: "/dashboard/career-therapist" },
];

const careerNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", color: "blue" },
  { label: "Curiosity Compass", icon: Compass, path: "/dashboard/curiosity-compass", color: "blue" },
  { label: "AI Roadmap", icon: Map, path: "/dashboard/roadmap", color: "indigo" },
  { label: "SelfGraph™", icon: Brain, path: "/dashboard/selfgraph", color: "terracotta" },
  { label: "SkillStacker", icon: Zap, path: "/dashboard/skill-stacker", color: "blue" },
  { label: "Content Library", icon: BookOpen, path: "/dashboard/content-library", color: "indigo" },
  { label: "Living Resume", icon: FileText, path: "/dashboard/living-resume", color: "primary" },
  { label: "Project Playground", icon: FolderKanban, path: "/dashboard/project-playground", color: "terracotta" },
  { label: "Job Matching", icon: Briefcase, path: "/dashboard/job-matching", color: "blue" },
  { label: "Mentor Match", icon: UserCheck, path: "/dashboard/mentor-matchmaking", color: "maroon" },
  { label: "Peer Circles", icon: Users, path: "/dashboard/peer-circles", color: "primary" },
  { label: "Career Coach", icon: Bot, path: "/dashboard/career-coach", color: "indigo" },
  { label: "Career Therapist", icon: Heart, path: "/dashboard/career-therapist", color: "terracotta" },
  { label: "Career Moodboard", icon: Palette, path: "/dashboard/career-moodboard", color: "accent" },
  { label: "Inspirations", icon: Lightbulb, path: "/dashboard/career-inspirations", color: "accent" },
  { label: "Transition Planner", icon: RefreshCw, path: "/dashboard/transition-planner", color: "maroon" },
  { label: "My Collections", icon: Heart, path: "/dashboard/career-collections", color: "terracotta" },
  { label: "Explore", icon: Sparkles, path: "/dashboard/explore", color: "primary" },
];

const entrepreneurshipNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", color: "terracotta" },
  { label: "Startup Sparks", icon: Lightbulb, path: "/dashboard/startup-sparks", color: "accent" },
  { label: "Mindset Builder", icon: Zap, path: "/dashboard/mindset-builder", color: "terracotta" },
  { label: "Path Selector", icon: Navigation, path: "/dashboard/path-selector", color: "blue" },
  { label: "MVP Builder", icon: Wrench, path: "/dashboard/mvp-builder", color: "maroon" },
  { label: "Startup Lab", icon: Rocket, path: "/dashboard/startup-lab", color: "terracotta" },
  { label: "Showcase", icon: Presentation, path: "/dashboard/startup-showcase", color: "indigo" },
  { label: "Founder Profile", icon: User, path: "/dashboard/founder-profile", color: "primary" },
  { label: "Startup Profile", icon: Building2, path: "/dashboard/startup-profiling", color: "blue" },
  { label: "AI Coach", icon: Bot, path: "/dashboard/ai-coach", color: "indigo" },
  { label: "Support", icon: LifeBuoy, path: "/dashboard/startup-support", color: "maroon" },
  { label: "Communities", icon: Globe, path: "/dashboard/startup-communities", color: "primary" },
];

const sharedNav = [
  { label: "Journal", icon: BookOpen, path: "/dashboard/journal", color: "terracotta" },
  { label: "Connections", icon: Users, path: "/dashboard/connections", color: "blue" },
  { label: "Achievements", icon: Trophy, path: "/dashboard/achievements", color: "accent" },
  { label: "Leaderboard", icon: Medal, path: "/dashboard/leaderboard", color: "maroon" },
  { label: "Notifications", icon: Bell, path: "/dashboard/notifications", color: "indigo" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings", color: "primary" },
];

const colorMap: Record<string, { active: string; icon: string }> = {
  primary: { active: "bg-primary/10 text-primary", icon: "text-primary" },
  blue: { active: "bg-blue/10 text-blue", icon: "text-blue" },
  indigo: { active: "bg-indigo/10 text-indigo", icon: "text-indigo" },
  terracotta: { active: "bg-terracotta/10 text-terracotta", icon: "text-terracotta" },
  maroon: { active: "bg-maroon/10 text-maroon", icon: "text-maroon" },
  accent: { active: "bg-accent/20 text-accent-foreground", icon: "text-accent-foreground" },
};

const DashboardLayout = () => {
  const { profile, signOut, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCareer = profile?.active_intent === "career";
  const isEntrepreneurship = profile?.active_intent === "entrepreneurship";
  const isBoth = profile?.active_intent === "both";

  const switchIntent = async () => {
    if (isBoth) return;
    const newIntent = isCareer ? "entrepreneurship" : "career";
    await updateProfile({ active_intent: newIntent } as any);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const renderNavItem = (item: typeof careerNav[0], prefix: string) => {
    const isActive = location.pathname === item.path;
    const colors = colorMap[item.color] || colorMap.primary;
    return (
      <Link
        key={`${prefix}-${item.path}`}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg font-body text-sm transition-colors ${
          isActive
            ? `${colors.active} font-medium`
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <item.icon size={16} className={isActive ? "" : ""} />
        {item.label}
      </Link>
    );
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-border">
        <Logo to="/dashboard" size="sm" />
        <p className="font-body text-xs text-muted-foreground mt-2">
          {isBoth ? "Career & Entrepreneurship" : isCareer ? "Career & Jobs" : "Entrepreneurship"}
        </p>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {(isCareer || isBoth) && (
          <>
            <p className="font-body text-[10px] uppercase tracking-wider text-blue px-3 pt-2 pb-1 font-semibold">
              Career Tools
            </p>
            {careerNav.filter(item => !isBoth || item.path !== "/dashboard").map(item => renderNavItem(item, "career"))}
          </>
        )}

        {(isEntrepreneurship || isBoth) && (
          <>
            <div className={isBoth ? "h-px bg-border my-2" : ""} />
            <p className="font-body text-[10px] uppercase tracking-wider text-terracotta px-3 pt-2 pb-1 font-semibold">
              Startup Tools
            </p>
            {entrepreneurshipNav.filter(item => !isBoth || item.path !== "/dashboard").map(item => renderNavItem(item, "entre"))}
          </>
        )}

        {isBoth && (
          <>
            <div className="h-px bg-border my-2" />
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg font-body text-sm transition-colors ${
                location.pathname === "/dashboard"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          </>
        )}

        <div className="h-px bg-border my-3" />
        <p className="font-body text-[10px] uppercase tracking-wider text-grey-label px-3 pt-2 pb-1 font-semibold">General</p>
        {sharedNav.map(item => renderNavItem(item, "shared"))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        {!isBoth && (
          <button
            onClick={switchIntent}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeftRight size={16} />
            Switch to {isCareer ? "Entrepreneurship" : "Career"}
          </button>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-body text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      <aside className="hidden lg:flex w-64 border-r border-border bg-card flex-col fixed h-screen">
        <NavContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo to="/dashboard" size="xs" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/notifications")}>
              <Bell size={18} />
            </Button>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <NavContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <main className="flex-1 min-w-0 lg:ml-64 mt-14 lg:mt-0">
        <div className="px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 lg:py-8 max-w-6xl mx-auto min-w-0 overflow-x-hidden responsive-page">
          <Outlet />
        </div>
      </main>

      {/* Onboarding reminder popup for skipped steps */}
      <OnboardingReminderPopup />
      {/* Real-time reward unlock celebration popups */}
      <RewardCelebrationManager />
    </div>
  );
};

export default DashboardLayout;
