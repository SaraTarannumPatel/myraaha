import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Compass, Map, Brain, FileText, Sparkles, Rocket, Lightbulb, Wrench, User,
  Zap, BookOpen, Users, Trophy, Settings, LogOut, Menu, X, ArrowLeftRight,
  LayoutDashboard, Bell
} from "lucide-react";

const careerNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Curiosity Compass", icon: Compass, path: "/dashboard/curiosity-compass" },
  { label: "AI Roadmap", icon: Map, path: "/dashboard/roadmap" },
  { label: "SelfGraph™", icon: Brain, path: "/dashboard/selfgraph" },
  { label: "Living Resume", icon: FileText, path: "/dashboard/living-resume" },
  { label: "Explore", icon: Sparkles, path: "/dashboard/explore" },
];

const entrepreneurshipNav = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Startup Sparks", icon: Lightbulb, path: "/dashboard/startup-sparks" },
  { label: "MVP Builder", icon: Wrench, path: "/dashboard/mvp-builder" },
  { label: "Founder Profile", icon: User, path: "/dashboard/founder-profile" },
  { label: "Mindset Builder", icon: Zap, path: "/dashboard/mindset-builder" },
  { label: "Startup Lab", icon: Rocket, path: "/dashboard/startup-lab" },
];

const sharedNav = [
  { label: "Journal", icon: BookOpen, path: "/dashboard/journal" },
  { label: "Connections", icon: Users, path: "/dashboard/connections" },
  { label: "Achievements", icon: Trophy, path: "/dashboard/achievements" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const DashboardLayout = () => {
  const { profile, signOut, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCareer = profile?.active_intent === "career";
  const mainNav = isCareer ? careerNav : entrepreneurshipNav;

  const switchIntent = async () => {
    const newIntent = isCareer ? "entrepreneurship" : "career";
    await updateProfile({ active_intent: newIntent });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link to="/dashboard" className="font-display text-2xl text-foreground">
          Shuttl<em className="text-gradient-warm">Ex</em>
        </Link>
        <p className="font-body text-xs text-muted-foreground mt-1">
          {isCareer ? "Career & Jobs" : "Entrepreneurship"}
        </p>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground px-3 pt-2 pb-1">
          {isCareer ? "Career Tools" : "Startup Tools"}
        </p>
        {mainNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                isActive
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}

        <div className="h-px bg-border my-3" />
        <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground px-3 pt-2 pb-1">General</p>
        {sharedNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-body text-sm transition-colors ${
                isActive
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={switchIntent}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-body text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeftRight size={18} />
          Switch to {isCareer ? "Entrepreneurship" : "Career"}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg font-body text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col fixed h-screen">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/dashboard" className="font-display text-xl text-foreground">
            Shuttl<em className="text-gradient-warm">Ex</em>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
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

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
