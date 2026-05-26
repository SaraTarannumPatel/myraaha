import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SmartRedirect: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (profile && profile.onboarding_status !== 'complete') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to appropriate dashboard based on user intent
  const dashboardPath = profile?.active_intent === 'entrepreneurship'
    ? '/entrepreneurship/dashboard'
    : '/jobs/dashboard';
  
  return <Navigate to={dashboardPath} replace />;
};

export default SmartRedirect;
