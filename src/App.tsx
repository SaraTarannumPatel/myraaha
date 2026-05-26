import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // updated
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import SmartRedirect from './components/SmartRedirect';
import Layout from './components/Layout';
import MyRaahaLanding from './pages/MyRaahaLanding';
import MyRaahaAbout from './pages/MyRaahaAbout';
import MyRaahaServices from './pages/MyRaahaServices';
import MyRaahaPartnerships from './pages/MyRaahaPartnerships';
import MyRaahaContact from './pages/MyRaahaContact';
import MyRaahaInsights from './pages/MyRaahaInsights';
import MyRaahaCareers from './pages/MyRaahaCareers';

// Enable browser scroll restoration and prevent scroll-to-top on F5 / Page Refresh
if (typeof window !== 'undefined') {
  if (window.history) {
    window.history.scrollRestoration = 'auto';
  }

  const navigationEntry = window.performance && 
    window.performance.getEntriesByType && 
    window.performance.getEntriesByType('navigation')[0];
  const isReload = navigationEntry && (navigationEntry as any).type === 'reload';

  if (isReload) {
    const originalScrollTo = window.scrollTo;
    window.scrollTo = function(x?: number | ScrollToOptions, y?: number) {
      if (typeof x === 'number' && x === 0 && y === 0) {
        return;
      }
      if (typeof x === 'object' && x && x.left === 0 && x.top === 0) {
        return;
      }
      if (typeof x === 'object') {
        originalScrollTo.call(window, x);
      } else {
        originalScrollTo.call(window, x!, y!);
      }
    };

    // Restore original window.scrollTo after initial mounting has completed
    setTimeout(() => {
      window.scrollTo = originalScrollTo;
    }, 1000);
  }
}

// Insights Detail
const MyRaahaInsightsDetail = lazy(() => import('./pages/MyRaahaInsightsDetail'));

// Legal Pages
const MyRaahaPrivacy = lazy(() => import('./pages/MyRaahaPrivacy'));
const MyRaahaTerms = lazy(() => import('./pages/MyRaahaTerms'));
const MyRaahaCookies = lazy(() => import('./pages/MyRaahaCookies'));

const AuthFlow = lazy(() => import('./pages/Auth'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Onboarding Pages
const OnboardingWelcome = lazy(() => import('./pages/onboarding/Welcome'));
const OnboardingUserType = lazy(() => import('./pages/onboarding/UserTypeSelection'));
const OnboardingJourney = lazy(() => import('./pages/onboarding/JourneyDiscovery'));
const OnboardingConsent = lazy(() => import('./pages/onboarding/ConsentStep'));

// Career Role Pages
const CareerCoreTeam = lazy(() => import('./pages/career/CoreTeam'));
const CareerIntern = lazy(() => import('./pages/career/Intern'));
const CareerFreelancer = lazy(() => import('./pages/career/Freelancer'));
const CareerVolunteer = lazy(() => import('./pages/career/Volunteer'));
const CareerFacilitator = lazy(() => import('./pages/career/Facilitator'));
const CareerRoleDetails = lazy(() => import('./pages/career/RoleDetails'));

// Job & Career Routes (lazy-loaded to keep first load light)
const JobsDashboard = lazy(() => import('./pages/career/Explore'));
const CuriosityCompass = lazy(() => import('./pages/career/CuriosityCompass'));
const AIRoadmaps = lazy(() => import('./pages/career/Roadmap'));
const ContentLibrary = lazy(() => import('./pages/career/ContentLibrary'));
const LivingResume = lazy(() => import('./pages/career/LivingResume'));
const SelfGraph = lazy(() => import('./pages/career/SelfGraph'));
const MentorMatchmaking = lazy(() => import('./pages/career/MentorMatchmaking'));
const PeerCircles = lazy(() => import('./pages/career/PeerCircles'));
const ProjectPlayground = lazy(() => import('./pages/career/ProjectPlayground'));
const JobExplorer = lazy(() => import('./pages/career/JobMatching'));
const JobsBadges = lazy(() => import('./pages/shared/Achievements'));
const VirtualCoach = lazy(() => import('./pages/career/VirtualCareerCoach'));
const CareerTherapist = lazy(() => import('./pages/career/AICareerTherapist'));
const MoodJournal = lazy(() => import('./pages/shared/Journal'));
const CareerMoodboard = lazy(() => import('./pages/career/CareerMoodboard'));
const JobsInspiration = lazy(() => import('./pages/career/CareerInspirations'));
const SkillStacker = lazy(() => import('./pages/career/SkillStacker'));
const TransitionPlanner = lazy(() => import('./pages/career/TransitionPlanner'));
const IdentityNarrative = lazy(() => import('./pages/career/CareerBlueprint'));
const CrossFeatureIntegration = lazy(() => import('./components/CrossFeatureIntegration'));

const SharedResume = lazy(() => import('./pages/SharedResume'));
const PublicResume = lazy(() => import('./pages/PublicResume'));

// Entrepreneurship Routes (lazy-loaded)
const EntrepreneurshipDashboard = lazy(() => import('./pages/entrepreneurship/EntrepreneurshipDashboard'));
const StartupSparks = lazy(() => import('./pages/entrepreneurship/StartupSparks'));
const MindsetBuilder = lazy(() => import('./pages/entrepreneurship/MindsetBuilder'));
const PathSelector = lazy(() => import('./pages/entrepreneurship/PathSelector'));
const FoundersLibrary = lazy(() => import('./pages/entrepreneurship/FoundersLearningLibrary'));
const MVPBuilders = lazy(() => import('./pages/entrepreneurship/MVPBuilder'));
const CreationLab = lazy(() => import('./pages/entrepreneurship/StartupLab'));
const FounderProfiling = lazy(() => import('./pages/entrepreneurship/FounderProfile'));
const StartupProfiling = lazy(() => import('./pages/entrepreneurship/StartupProfiling'));
const StartupShowcase = lazy(() => import('./pages/entrepreneurship/StartupShowcase'));
const StartupSupport = lazy(() => import('./pages/entrepreneurship/StartupSupport'));
const EntrepreneurshipCoach = lazy(() => import('./pages/entrepreneurship/AIEntrepreneurshipCoach'));
const EntrepreneurshipTherapist = lazy(() => import('./pages/entrepreneurship/AIEntrepreneurshipCoach'));
const StartupCommunities = lazy(() => import('./pages/entrepreneurship/StartupCommunities'));
const EntrepreneurshipMoodboard = lazy(() => import('./pages/entrepreneurship/Moodboard'));
const StartupInspiration = lazy(() => import('./pages/entrepreneurship/Inspirations'));
const StartupBadges = lazy(() => import('./pages/shared/Achievements'));

import './App.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-50">
            <Suspense fallback={null}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<MyRaahaLanding />} />
                <Route path="/about" element={<MyRaahaAbout />} />
                <Route path="/services" element={<MyRaahaServices />} />
                <Route path="/partnerships" element={<MyRaahaPartnerships />} />

                <Route path="/contact" element={<MyRaahaContact />} />
                <Route path="/insights" element={<MyRaahaInsights />} />
                <Route path="/insights/:slug" element={<MyRaahaInsightsDetail />} />
                <Route path="/careers" element={<MyRaahaCareers />} />
                
                {/* Legal Routes */}
                <Route path="/privacy" element={<MyRaahaPrivacy />} />
                <Route path="/terms" element={<MyRaahaTerms />} />
                <Route path="/cookies" element={<MyRaahaCookies />} />

                <Route path="/careers/core-team" element={<CareerCoreTeam />} />
                <Route path="/careers/intern" element={<CareerIntern />} />
                <Route path="/careers/freelancer" element={<CareerFreelancer />} />
                <Route path="/careers/volunteer" element={<CareerVolunteer />} />
                <Route path="/careers/facilitator" element={<CareerFacilitator />} />
                <Route path="/careers/role/:roleId" element={<CareerRoleDetails />} />
                <Route path="/auth/*" element={<AuthFlow />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Smart Redirect Route */}
                <Route path="/redirect" element={<SmartRedirect />} />

                {/* Backward Compatibility Redirects */}

                <Route path="/contentlibrary" element={<Navigate to="/jobs/content-library" replace />} />
                <Route path="/livingresume" element={<Navigate to="/jobs/living-resume" replace />} />


                {/* Local-only shared resume route (MVP) */}
                <Route path="/shared/resume/:shareId" element={<SharedResume />} />


                {/* Local-only public resume route (MVP) */}
                <Route path="/public/resume/:publicId" element={<PublicResume />} />

                {/* Protected Job & Career Routes */}
                <Route path="/jobs/dashboard" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <JobsDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/curiosity-compass" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <CuriosityCompass />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/ai-roadmaps" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <AIRoadmaps />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/content-library" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <ContentLibrary />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/living-resume" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <LivingResume />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/self-graph" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <SelfGraph />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/mentor-matchmaking" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <MentorMatchmaking />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/peer-circles" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <PeerCircles />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/project-playground" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <ProjectPlayground />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/job-explorer" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <JobExplorer />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/badges" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <JobsBadges />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/virtual-coach" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <VirtualCoach />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/career-therapist" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <CareerTherapist />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/mood-journal" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <MoodJournal />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/career-moodboard" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <CareerMoodboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/inspiration" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <JobsInspiration />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/skill-stacker" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <SkillStacker />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/transition-planner" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <TransitionPlanner />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/jobs/identity-narrative" element={
                  <ProtectedRoute requiredPath="jobs">
                    <Layout>
                      <IdentityNarrative />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/cross-feature-integration" element={
                  <ProtectedRoute>
                    <CrossFeatureIntegration />
                  </ProtectedRoute>
                } />

                {/* Protected Entrepreneurship Routes */}
                <Route path="/entrepreneurship/dashboard" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <EntrepreneurshipDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/startup-sparks" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <StartupSparks />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/mindset-builder" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <MindsetBuilder />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/path-selector" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <PathSelector />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/founders-library" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <FoundersLibrary />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/mvp-builders" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <MVPBuilders />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/creation-lab" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <CreationLab />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/founder-profiling" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <FounderProfiling />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/startup-profiling" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <StartupProfiling />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/startup-showcase" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <StartupShowcase />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/startup-support" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <StartupSupport />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/coach" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <EntrepreneurshipCoach />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/therapist" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <EntrepreneurshipTherapist />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/communities" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <StartupCommunities />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/moodboard" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <EntrepreneurshipMoodboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/inspiration" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <StartupInspiration />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/entrepreneurship/badges" element={
                  <ProtectedRoute requiredPath="entrepreneurship">
                    <Layout>
                      <StartupBadges />
                    </Layout>
                  </ProtectedRoute>
                } />

                {/* Onboarding Routes */}
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <OnboardingWelcome />
                  </ProtectedRoute>
                } />
                <Route path="/onboarding/user-type" element={
                  <ProtectedRoute>
                    <OnboardingUserType />
                  </ProtectedRoute>
                } />
                <Route path="/onboarding/journey" element={
                  <ProtectedRoute>
                    <OnboardingJourney />
                  </ProtectedRoute>
                } />
                <Route path="/onboarding/consent" element={
                  <ProtectedRoute>
                    <OnboardingConsent />
                  </ProtectedRoute>
                } />

                {/* Wildcard Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
