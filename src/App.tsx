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
import CuriosityCompass from "./pages/career/CuriosityCompass";
import Roadmap from "./pages/career/Roadmap";
import SelfGraph from "./pages/career/SelfGraph";
import LivingResume from "./pages/career/LivingResume";
import Explore from "./pages/career/Explore";
import StartupSparks from "./pages/entrepreneurship/StartupSparks";
import MVPBuilder from "./pages/entrepreneurship/MVPBuilder";
import FounderProfile from "./pages/entrepreneurship/FounderProfile";
import MindsetBuilder from "./pages/entrepreneurship/MindsetBuilder";
import StartupLab from "./pages/entrepreneurship/StartupLab";
import Journal from "./pages/shared/Journal";
import Connections from "./pages/shared/Connections";
import Achievements from "./pages/shared/Achievements";
import Settings from "./pages/shared/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Onboarding */}
            <Route path="/onboarding" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
            <Route path="/onboarding/user-type" element={<ProtectedRoute><UserTypeSelection /></ProtectedRoute>} />
            <Route path="/onboarding/intent" element={<ProtectedRoute><IntentSelection /></ProtectedRoute>} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              {/* Career */}
              <Route path="curiosity-compass" element={<CuriosityCompass />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="selfgraph" element={<SelfGraph />} />
              <Route path="living-resume" element={<LivingResume />} />
              <Route path="explore" element={<Explore />} />
              {/* Entrepreneurship */}
              <Route path="startup-sparks" element={<StartupSparks />} />
              <Route path="mvp-builder" element={<MVPBuilder />} />
              <Route path="founder-profile" element={<FounderProfile />} />
              <Route path="mindset-builder" element={<MindsetBuilder />} />
              <Route path="startup-lab" element={<StartupLab />} />
              {/* Shared */}
              <Route path="journal" element={<Journal />} />
              <Route path="connections" element={<Connections />} />
              <Route path="achievements" element={<Achievements />} />
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
