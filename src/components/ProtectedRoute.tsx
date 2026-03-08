import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const onboardingRoutes: Record<string, string> = {
  welcome: "/onboarding",
  user_type: "/onboarding/user-type",
  intent: "/onboarding/intent",
  personal_info: "/onboarding/personal-info",
  consent: "/onboarding/consent",
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-display text-2xl text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect to appropriate onboarding step if not complete
  if (profile && profile.onboarding_status !== "complete" && !location.pathname.startsWith("/onboarding")) {
    const step = profile.onboarding_status || "welcome";
    const route = onboardingRoutes[step] || "/onboarding";
    return <Navigate to={route} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
