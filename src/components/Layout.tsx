import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Rocket, 
  Menu, 
  X, 
  Home, 
  Compass, 
  Target, 
  BookOpen, 
  FileText,
  TrendingUp,
  Users,
  User,
  Briefcase,
  Award,
  MessageCircle,
  Heart,
  Palette,
  Lightbulb,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isJobsPath = location.pathname.startsWith('/jobs');
  const isEntrepreneurshipPath = location.pathname.startsWith('/entrepreneurship');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const jobsNavigation = [
    { name: 'Dashboard', href: '/jobs/dashboard', icon: Home },
    { name: 'Curiosity Compass', href: '/jobs/curiosity-compass', icon: Compass },
    { name: 'AI Roadmaps', href: '/jobs/ai-roadmaps', icon: Target },
    { name: 'Content Library', href: '/jobs/content-library', icon: BookOpen },
    { name: 'Living Resume', href: '/jobs/living-resume', icon: FileText },
    { name: 'SelfGraph', href: '/jobs/self-graph', icon: TrendingUp },
    { name: 'Mentor Matching', href: '/jobs/mentor-matchmaking', icon: Users },
    { name: 'Peer Circles', href: '/jobs/peer-circles', icon: User },
    { name: 'Project Playground', href: '/jobs/project-playground', icon: Briefcase },
    { name: 'Job Explorer', href: '/jobs/job-explorer', icon: Briefcase },
    { name: 'Badges', href: '/jobs/badges', icon: Award },
    { name: 'Virtual Coach', href: '/jobs/virtual-coach', icon: MessageCircle },
    { name: 'Career Therapist', href: '/jobs/career-therapist', icon: Heart },
    { name: 'Mood Journal', href: '/jobs/mood-journal', icon: Heart },
    { name: 'Career Moodboard', href: '/jobs/career-moodboard', icon: Palette },
    { name: 'Inspiration', href: '/jobs/inspiration', icon: Lightbulb },
  ];

  const entrepreneurshipNavigation = [
    { name: 'Dashboard', href: '/entrepreneurship/dashboard', icon: Home },
    { name: 'Startup Sparks', href: '/entrepreneurship/startup-sparks', icon: Lightbulb },
    { name: 'Mindset Builder', href: '/entrepreneurship/mindset-builder', icon: Target },
    { name: 'Path Selector', href: '/entrepreneurship/path-selector', icon: Compass },
    { name: 'Founder\'s Library', href: '/entrepreneurship/founders-library', icon: BookOpen },
    { name: 'MVP Builders', href: '/entrepreneurship/mvp-builders', icon: Briefcase },
    { name: 'Creation Lab', href: '/entrepreneurship/creation-lab', icon: User },
    { name: 'Founder Profiling', href: '/entrepreneurship/founder-profiling', icon: User },
    { name: 'Startup Profiling', href: '/entrepreneurship/startup-profiling', icon: FileText },
    { name: 'Startup Showcase', href: '/entrepreneurship/startup-showcase', icon: Award },
    { name: 'Startup Support', href: '/entrepreneurship/startup-support', icon: Heart },
    { name: 'Coach', href: '/entrepreneurship/coach', icon: MessageCircle },
    { name: 'Therapist', href: '/entrepreneurship/therapist', icon: Heart },
    { name: 'Communities', href: '/entrepreneurship/communities', icon: Users },
    { name: 'Moodboard', href: '/entrepreneurship/moodboard', icon: Palette },
    { name: 'Inspiration', href: '/entrepreneurship/inspiration', icon: Lightbulb },
    { name: 'Badges', href: '/entrepreneurship/badges', icon: Award },
  ];

  const navigation = isJobsPath ? jobsNavigation : entrepreneurshipNavigation;

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <img 
            src="/myraaha-logo.png" 
            alt="MyRaaha Logo" 
            className="h-12 w-auto"
          />
        </div>
        <div className="text-center text-sm text-gray-500 mt-1">
          {isJobsPath ? 'Career & Jobs' : 'Entrepreneurship'}
        </div>
      </div>

      {/* Path Switcher - Always visible so users can explore both paths */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <Link
            to="/jobs/dashboard"
            className={`flex-1 text-center py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              isJobsPath 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Jobs
          </Link>
          <Link
            to="/entrepreneurship/dashboard"
            className={`flex-1 text-center py-2 px-3 text-sm font-medium rounded-md transition-colors ${
              isEntrepreneurshipPath 
                ? 'bg-white text-purple-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Startup
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? isJobsPath
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive
                    ? isJobsPath
                      ? 'text-blue-500'
                      : 'text-purple-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0 relative z-50">
        <div className="flex flex-col w-64 bg-white border-r border-gray-200 relative z-50">
          <Sidebar />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src="/myraaha-logo.png" alt="MyRaaha Logo" className="h-8 w-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none z-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
