import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPath?: 'jobs' | 'entrepreneurship';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace state={{ from: location }} />;
  }

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');

  // Redirect to onboarding if profile is loaded, not completed, and not already on onboarding
  if (profile && profile.onboarding_status !== 'complete' && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to dashboard if onboarding is completed and trying to access onboarding routes
  if (profile && profile.onboarding_status === 'complete' && isOnboardingRoute) {
    return <Navigate to="/redirect" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
