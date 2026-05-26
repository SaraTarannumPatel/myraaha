import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SmartRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user.onboardingCompleted) {
    return <Navigate to="/auth/onboarding" replace />;
  }

  // Redirect to appropriate dashboard based on user intent
  if (user.intent === 'both') {
    return <Navigate to="/auth/welcome" replace />;
  }

  const dashboardPath = user.intent === 'entrepreneurship'
    ? '/entrepreneurship/dashboard'
    : '/jobs/dashboard';
  
  return <Navigate to={dashboardPath} replace />;
};

export default SmartRedirect;
