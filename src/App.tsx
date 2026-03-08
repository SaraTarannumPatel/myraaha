import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Welcome from "./pages/onboarding/Welcome";
import UserTypeSelection from "./pages/onboarding/UserTypeSelection";
import IntentSelection from "./pages/onboarding/IntentSelection";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
// Career
import CuriosityCompass from "./pages/career/CuriosityCompass";
import Roadmap from "./pages/career/Roadmap";
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
// Shared
import Journal from "./pages/shared/Journal";
import Connections from "./pages/shared/Connections";
import Achievements from "./pages/shared/Achievements";
import Settings from "./pages/shared/Settings";
import Notifications from "./pages/shared/Notifications";
import Leaderboard from "./pages/shared/Leaderboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
            <Route path="/onboarding/user-type" element={<ProtectedRoute><UserTypeSelection /></ProtectedRoute>} />
            <Route path="/onboarding/intent" element={<ProtectedRoute><IntentSelection /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              {/* Career */}
              <Route path="curiosity-compass" element={<CuriosityCompass />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="selfgraph" element={<SelfGraph />} />
              <Route path="living-resume" element={<LivingResume />} />
              <Route path="explore" element={<Explore />} />
              <Route path="content-library" element={<ContentLibrary />} />
              <Route path="mentor-matchmaking" element={<MentorMatchmaking />} />
              <Route path="peer-circles" element={<PeerCircles />} />
              <Route path="project-playground" element={<ProjectPlayground />} />
              <Route path="job-matching" element={<JobMatching />} />
              <Route path="career-coach" element={<VirtualCareerCoach />} />
              <Route path="career-therapist" element={<AICareerTherapist />} />
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
              {/* Shared */}
              <Route path="journal" element={<Journal />} />
              <Route path="connections" element={<Connections />} />
              <Route path="achievements" element={<Achievements />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
