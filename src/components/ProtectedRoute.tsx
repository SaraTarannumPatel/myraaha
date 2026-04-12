import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const onboardingRoutes: Record<string, string> = {
  welcome: "/onboarding",
  user_type: "/onboarding/user-type",
  journey_discovery: "/onboarding/journey",
  intent: "/onboarding/intent",
  guided: "/onboarding/guided",
  consent: "/onboarding/consent",
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isReady, profile } = useAuth();
  const location = useLocation();

  // Allow guest users through onboarding and dashboard routes
  const isGuest = localStorage.getItem("myraaha_is_guest") === "true";
  const guestAllowedPaths = ["/onboarding", "/dashboard"];
  const isGuestAllowedRoute = guestAllowedPaths.some(p => location.pathname.startsWith(p));

  // Show loading only briefly while auth initializes
  if (!isReady || loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[hsl(60,14%,98%)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-[hsl(230,40%,25%)] rounded-lg flex items-center justify-center">
            <span className="text-[hsl(45,80%,65%)] font-display text-lg font-bold">M</span>
          </div>
          <div className="w-32 h-1 bg-[hsl(0,0%,85%,0.5)] rounded-full overflow-hidden">
            <div className="h-full bg-[hsl(230,40%,25%)] rounded-full animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (isGuest && isGuestAllowedRoute) {
      return <>{children}</>;
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If user has completed onboarding and is on an onboarding route, redirect to dashboard
  // UNLESS they were sent here explicitly from a reminder popup (via state)
  if (profile && profile.onboarding_status === "complete" && location.pathname.startsWith("/onboarding")) {
    if (!location.state?.fromReminder) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If user has NOT completed onboarding and is NOT on an onboarding route, redirect to their step
  if (profile && profile.onboarding_status !== "complete" && !location.pathname.startsWith("/onboarding")) {
    const step = profile.onboarding_status || "welcome";
    const route = onboardingRoutes[step] || "/onboarding";
    return <Navigate to={route} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
