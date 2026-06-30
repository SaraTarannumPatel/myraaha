import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SplashScreen from "@/components/shared/SplashScreen";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MyRaahaLanding from "./pages/MyRaahaLanding";
import MyRaahaAbout from "./pages/MyRaahaAbout";
import MyRaahaServices from "./pages/MyRaahaServices";
import MyRaahaPartnerships from "./pages/MyRaahaPartnerships";
import MyRaahaInsights from "./pages/MyRaahaInsights";
import MyRaahaInsightsDetail from "./pages/MyRaahaInsightsDetail";
import MyRaahaCareers from "./pages/MyRaahaCareers";
import MyRaahaContact from "./pages/MyRaahaContact";
import MyRaahaPrivacy from "./pages/MyRaahaPrivacy";
import MyRaahaTerms from "./pages/MyRaahaTerms";
import MyRaahaCookies from "./pages/MyRaahaCookies";

import CoreTeam from "./pages/career/CoreTeam";
import Intern from "./pages/career/Intern";
import Freelancer from "./pages/career/Freelancer";
import Volunteer from "./pages/career/Volunteer";
import Facilitator from "./pages/career/Facilitator";
import RoleDetails from "./pages/career/RoleDetails";
import NotFound from "./pages/NotFound";
import IntroSlides from "./pages/IntroSlides";
import Auth from "./pages/Auth";
import GuestEntry from "./pages/GuestEntry";
import Welcome from "./pages/onboarding/Welcome";
import UserTypeSelection from "./pages/onboarding/UserTypeSelection";
import ConsentStep from "./pages/onboarding/ConsentStep";
import JourneyDiscovery from "./pages/onboarding/JourneyDiscovery";
import EducationalStatus from "./pages/onboarding/EducationalStatus";
import IntentSelection from "./pages/onboarding/IntentSelection";
import GuidedOnboarding from "./pages/onboarding/GuidedOnboarding";
import ResetPassword from "./pages/ResetPassword";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
// Career
import CuriosityCompass from "./pages/career/CuriosityCompass";
import CareerNavigator from "./pages/career/CareerNavigator";
import Roadmap from "./pages/career/Roadmap";
import CareerMap from "./pages/career/CareerMap";
import SelfGraph from "./pages/career/SelfGraph";
import LivingResume from "./pages/career/LivingResume";
import Explore from "./pages/career/Explore";
import ContentLibrary from "./pages/career/ContentLibrary";
import MentorMatchmaking from "./pages/career/MentorMatchmaking";
import PeerCircles from "./pages/career/PeerCircles";
import ProjectPlayground from "./pages/career/ProjectPlayground";
import JobMatching from "./pages/career/JobMatching";
import VirtualCareerCoach from "./pages/career/VirtualCareerCoach";
import AICareerTherapist from "./pages/career/AICareerTherapist";
import SkillStacker from "./pages/career/SkillStacker";
import CareerMoodboard from "./pages/career/CareerMoodboard";
import CareerInspirations from "./pages/career/CareerInspirations";
import TransitionPlanner from "./pages/career/TransitionPlanner";
import CareerCardCollections from "./pages/career/CareerCardCollections";
import CareerBlueprint from "./pages/career/CareerBlueprint";
import TaxonomySearch from "./pages/shared/TaxonomySearch";
// Entrepreneurship
import StartupSparks from "./pages/entrepreneurship/StartupSparks";
import MVPBuilder from "./pages/entrepreneurship/MVPBuilder";
import FounderProfile from "./pages/entrepreneurship/FounderProfile";
import MindsetBuilder from "./pages/entrepreneurship/MindsetBuilder";
import StartupLab from "./pages/entrepreneurship/StartupLab";
import PathSelector from "./pages/entrepreneurship/PathSelector";
import StartupShowcase from "./pages/entrepreneurship/StartupShowcase";
import StartupProfiling from "./pages/entrepreneurship/StartupProfiling";
import StartupSupport from "./pages/entrepreneurship/StartupSupport";
import AIEntrepreneurshipCoach from "./pages/entrepreneurship/AIEntrepreneurshipCoach";
import StartupCommunities from "./pages/entrepreneurship/StartupCommunities";
import FoundersLearningLibrary from "./pages/entrepreneurship/FoundersLearningLibrary";
import EntrepreneurshipMoodboard from "./pages/entrepreneurship/Moodboard";
import Inspirations from "./pages/entrepreneurship/Inspirations";
// Shared
import Journal from "./pages/shared/Journal";
import Connections from "./pages/shared/Connections";
import Achievements from "./pages/shared/Achievements";
import Settings from "./pages/shared/Settings";
import Notifications from "./pages/shared/Notifications";
import Leaderboard from "./pages/shared/Leaderboard";
import RewardCelebrationManager from "@/components/curiositycompass/RewardCelebrationManager";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isReady } = useAuth();

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <motion.div
            key="splash-screen"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[99999]"
          >
            <SplashScreen isAppReady={isReady} onComplete={() => setShowSplash(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
      <Sonner />
      {/* Global reward popup — fires during onboarding + Compass too,
          not only inside DashboardLayout. Manager self-gates to authed users. */}
      <RewardCelebrationManager />
      <Routes>
        <Route element={<div className="myraaha-landing-site"><Outlet /></div>}>
          <Route path="/" element={<MyRaahaLanding />} />
          {/* Landing site */}
          <Route path="/about" element={<MyRaahaAbout />} />
          <Route path="/services" element={<MyRaahaServices />} />
          <Route path="/partnerships" element={<MyRaahaPartnerships />} />
          <Route path="/insights" element={<MyRaahaInsights />} />
          <Route path="/insights/:slug" element={<MyRaahaInsightsDetail />} />
          <Route path="/careers" element={<MyRaahaCareers />} />
          <Route path="/contact" element={<MyRaahaContact />} />
          <Route path="/privacy" element={<MyRaahaPrivacy />} />
          <Route path="/terms" element={<MyRaahaTerms />} />
          <Route path="/cookies" element={<MyRaahaCookies />} />
          
          {/* Career Sub-Roles */}
          <Route path="/careers/core-team" element={<CoreTeam />} />
          <Route path="/careers/intern" element={<Intern />} />
          <Route path="/careers/freelancer" element={<Freelancer />} />
          <Route path="/careers/volunteer" element={<Volunteer />} />
          <Route path="/careers/facilitator" element={<Facilitator />} />
          <Route path="/careers/:roleId" element={<RoleDetails />} />
        </Route>
        
        {/* Old routes archived */}
        <Route element={<div className="myraaha-app"><Outlet /></div>}>
          <Route path="/intro" element={<IntroSlides />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/guest" element={<GuestEntry />} />
          {/* Legacy OTP deep links are archived and safely returned to auth. */}
          <Route path="/verify-otp" element={<Navigate to="/auth" replace />} />
          <Route path="/onboarding" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
          <Route path="/onboarding/user-type" element={<ProtectedRoute><UserTypeSelection /></ProtectedRoute>} />
          <Route path="/onboarding/journey" element={<ProtectedRoute><JourneyDiscovery /></ProtectedRoute>} />
          <Route path="/onboarding/intent" element={<ProtectedRoute><IntentSelection /></ProtectedRoute>} />
          <Route path="/onboarding/guided" element={<ProtectedRoute><GuidedOnboarding /></ProtectedRoute>} />
          <Route path="/onboarding/educational-status" element={<ProtectedRoute><EducationalStatus /></ProtectedRoute>} />
          <Route path="/onboarding/consent" element={<ProtectedRoute><ConsentStep /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="insights" element={<Insights />} />
            {/* Career */}
            <Route path="curiosity-compass" element={<CuriosityCompass />} />
            <Route path="career-navigator" element={<CareerNavigator />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="careermap" element={<CareerMap />} />

            <Route path="selfgraph" element={<SelfGraph />} />
            <Route path="living-resume" element={<LivingResume />} />
            <Route path="explore" element={<Explore />} />
            <Route path="content-library" element={<ContentLibrary />} />
            <Route path="mentor-matchmaking" element={<MentorMatchmaking />} />
            <Route path="peer-circles" element={<PeerCircles />} />
            <Route path="project-playground" element={<ProjectPlayground />} />
            <Route path="job-matching" element={<JobMatching />} />
            <Route path="skill-stacker" element={<SkillStacker />} />
            <Route path="career-coach" element={<VirtualCareerCoach />} />
            <Route path="career-therapist" element={<AICareerTherapist />} />
            <Route path="career-moodboard" element={<CareerMoodboard />} />
            <Route path="career-inspirations" element={<CareerInspirations />} />
            <Route path="transition-planner" element={<TransitionPlanner />} />
            <Route path="career-collections" element={<CareerCardCollections />} />
            <Route path="blueprint" element={<CareerBlueprint />} />
            <Route path="taxonomy" element={<TaxonomySearch />} />
            {/* Entrepreneurship */}
            <Route path="startup-sparks" element={<StartupSparks />} />
            <Route path="mvp-builder" element={<MVPBuilder />} />
            <Route path="founder-profile" element={<FounderProfile />} />
            <Route path="mindset-builder" element={<MindsetBuilder />} />
            <Route path="startup-lab" element={<StartupLab />} />
            <Route path="path-selector" element={<PathSelector />} />
            <Route path="startup-showcase" element={<StartupShowcase />} />
            <Route path="startup-profiling" element={<StartupProfiling />} />
            <Route path="startup-support" element={<StartupSupport />} />
            <Route path="ai-coach" element={<AIEntrepreneurshipCoach />} />
            <Route path="startup-communities" element={<StartupCommunities />} />
            <Route path="founders-learning" element={<FoundersLearningLibrary />} />
            <Route path="moodboard" element={<EntrepreneurshipMoodboard />} />
            <Route path="inspirations" element={<Inspirations />} />
            {/* Shared */}
            <Route path="journal" element={<Journal />} />
            <Route path="connections" element={<Connections />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
