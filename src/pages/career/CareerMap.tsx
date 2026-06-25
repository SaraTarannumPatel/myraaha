import { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback } from "react";
import { 
  Code, Stethoscope, Paintbrush, Building2, PieChart, Gavel, 
  GraduationCap, Laptop, Leaf, Search, User, Layers, Plus, 
  Minus, Map, Activity, MapPin, Compass, Navigation, Bookmark, 
  Users, ArrowLeft, Share2, Video, GitCompare, X, Play, 
  ArrowUp, Bot, Home, GitBranch, LogIn, Award, Zap, Flame, 
  Info, Volume2, Briefcase, Clock, Sparkles, ChevronRight,
  Star, TrendingUp, TrendingDown, Cpu, Globe, ClipboardList,
  Coffee, BookOpen, Heart, Mail, Link2, Lock, Eye, Printer,
  Target, ChevronDown, FileText, CheckCircle2, Calendar,
  Headphones, Smartphone, Scale, HelpCircle, MessageSquare,
  Coins, BarChart2, Download, WifiOff, Filter, Check, ArrowUpDown,
  ChevronLeft, PlusCircle, Pin, Bell, Maximize2, Minimize2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { generateUserCoordinates } from "@/utils/userCoordinateEngine";
import { useCareerMapData, getInitialPanOffset } from "@/hooks/useCareerMapData";
import { useAcademicMapData } from "@/hooks/useAcademicMapData";
import { getCategoryColor, WORLD_W, WORLD_H, getConvexHull } from "@/utils/careerMapProjection";

interface StationDetail {
  name: string;
  location: string;
  duration: string;
  fees: string;
  rating: number;
  exam: string;
  cutoff: string;
  examDate: string;
  placementRate: string;
  avgSalary: string;
  careers: string;
}

// Extended mock role details data following the 400+ fields, KSAO, and 18-tab schema
interface RoleDetailData {
  id: string;
  name: string;
  category: string;
  sector: string;
  location: string;
  matchScore: number;
  salaryRange: string;
  hiringCount: number;
  demandStatus: string;
  avgSalary: string;
  timeToReady: string;
  automationRisk: string;
  automationRiskColor: string;
  gapsToClose: string[];
  description: string;
  color: string;
  bgHex: string;
  pinCoordinates: { x: number; y: number };
  popularMonths: number[]; // Renders hiring demand by month
  wlbRating: number;
  entryDifficulty: number;
  growthPotential: number;
  salaryRating: number;
  sentimentText: string;
  confessions: string[];
}

const ROLE_DETAILS_MOCK: Record<string, RoleDetailData> = {
  pm: {
    id: "pm",
    name: "Product Manager",
    category: "Technology · Product Management",
    sector: "Technology",
    location: "Bengaluru / Remote",
    matchScore: 88,
    salaryRange: "₹12–25 LPA",
    hiringCount: 247,
    demandStatus: "High demand",
    avgSalary: "₹18 LPA",
    timeToReady: "12–18 mo",
    automationRisk: "Low — safe",
    automationRiskColor: "text-emerald-500 bg-emerald-500/10",
    gapsToClose: ["SQL Querying", "Product Analytics", "Stakeholder Management"],
    description: "PMs sit at the intersection of business, technology, and user experience. On a typical Tuesday: 2 sprint meetings, 1 user research call, roadmap prioritisation session, and stakeholder review. Travel: low. Remote: possible.",
    color: "blue",
    bgHex: "#B5D4F4",
    pinCoordinates: { x: 115, y: 112 },
    popularMonths: [65, 80, 95, 70, 50, 45, 60, 85, 90, 80, 75, 60],
    wlbRating: 3.8,
    entryDifficulty: 4.2,
    growthPotential: 4.8,
    salaryRating: 4.5,
    sentimentText: "68% of professionals say: 'Fulfilling but demanding'",
    confessions: [
      "I thought this role was purely creative - 80% is alignment alignment alignment.",
      "Best career switch I ever made. High impact on customers."
    ]
  },
  swengineer: {
    id: "swengineer",
    name: "Software Engineer",
    category: "Technology · Engineering",
    sector: "Technology",
    location: "Bengaluru / Pune",
    matchScore: 92,
    salaryRange: "₹10–22 LPA",
    hiringCount: 412,
    demandStatus: "High demand",
    avgSalary: "₹15 LPA",
    timeToReady: "6–12 mo",
    automationRisk: "Medium — AI assist",
    automationRiskColor: "text-amber-500 bg-amber-500/10",
    gapsToClose: ["System Design", "Advanced React Patterns"],
    description: "Software Engineers design, build, and maintain applications and software systems. Daily tasks include writing code, fixing bugs, conducting code reviews, and collaborating with product teams.",
    color: "blue",
    bgHex: "#B5D4F4",
    pinCoordinates: { x: 46, y: 112 },
    popularMonths: [80, 85, 90, 75, 60, 55, 70, 80, 95, 85, 80, 70],
    wlbRating: 4.1,
    entryDifficulty: 4.0,
    growthPotential: 4.6,
    salaryRating: 4.3,
    sentimentText: "72% of professionals say: 'Great building experience, high desk-hours'",
    confessions: [
      "AI tools help me code 5x faster, but architectural decisions are still fully manual.",
      "Long hours before release, but learning curve is incredible."
    ]
  },
  designer: {
    id: "designer",
    name: "UX Designer",
    category: "Creative · Design",
    sector: "Creative",
    location: "Remote / Mumbai",
    matchScore: 82,
    salaryRange: "₹8–18 LPA",
    hiringCount: 135,
    demandStatus: "Growing",
    avgSalary: "₹12 LPA",
    timeToReady: "6–12 mo",
    automationRisk: "Low — creative",
    automationRiskColor: "text-emerald-500 bg-emerald-500/10",
    gapsToClose: ["Figma Auto-Layout", "User Interview Methodologies"],
    description: "UX Designers map user journeys, create wireframes, and design interactive prototypes. On a typical day: user testing interviews, design system updates, brainstorming with PMs.",
    color: "purple",
    bgHex: "#CECBF6",
    pinCoordinates: { x: 80, y: 94 },
    popularMonths: [50, 60, 75, 80, 65, 50, 55, 70, 85, 75, 70, 55],
    wlbRating: 4.3,
    entryDifficulty: 3.5,
    growthPotential: 4.2,
    salaryRating: 3.9,
    sentimentText: "81% of professionals say: 'Highly rewarding, collaborative environment'",
    confessions: [
      "Figma feels like my second home. You must love empathy maps to survive here.",
      "Startup design roles are chaotic but you grow 3x faster than in agencies."
    ]
  },
  doctor: {
    id: "doctor",
    name: "Medical Doctor / Surgeon",
    category: "Healthcare · Medicine",
    sector: "Healthcare",
    location: "Delhi / Pune",
    matchScore: 75,
    salaryRange: "₹15–35 LPA",
    hiringCount: 89,
    demandStatus: "Very High",
    avgSalary: "₹22 LPA",
    timeToReady: "6–8 years",
    automationRisk: "Very Low — physical",
    automationRiskColor: "text-emerald-500 bg-emerald-500/10",
    gapsToClose: ["NEET-PG Rank Verification", "Clinical Residency Hours"],
    description: "Doctors diagnose, treat, and prevent illnesses. Surgeons perform operations to repair or replace damaged tissues and organs. Highly demanding with regular on-call duty.",
    color: "green",
    bgHex: "#9FE1CB",
    pinCoordinates: { x: 238, y: 100 },
    popularMonths: [90, 95, 95, 90, 85, 80, 85, 90, 95, 90, 90, 85],
    wlbRating: 2.1,
    entryDifficulty: 4.9,
    growthPotential: 4.9,
    salaryRating: 4.8,
    sentimentText: "89% of professionals say: 'Noble and secure, but extremely high burnout'",
    confessions: [
      "24-hour shifts are brutal, but saving a life wipes away the fatigue.",
      "The exam route is long and expensive, but security is unmatched in India."
    ]
  },
  ias: {
    id: "ias",
    name: "IAS Officer",
    category: "Government · Administration",
    sector: "Government",
    location: "Pan India",
    matchScore: 70,
    salaryRange: "₹7–15 LPA",
    hiringCount: 180,
    demandStatus: "Stable",
    avgSalary: "₹10 LPA",
    timeToReady: "2–4 years",
    automationRisk: "Low — human-centric",
    automationRiskColor: "text-emerald-500 bg-emerald-500/10",
    gapsToClose: ["UPSC GS Syllabus Mastery", "Mock Interview Practice"],
    description: "IAS Officers implement government policies, manage public administration, and oversee development projects in districts. Highly prestigious with high social impact but intense exams.",
    color: "red",
    bgHex: "#F5C4B3",
    pinCoordinates: { x: 25, y: 210 },
    popularMonths: [40, 40, 50, 90, 40, 40, 50, 60, 70, 60, 50, 40],
    wlbRating: 2.8,
    entryDifficulty: 5.0,
    growthPotential: 4.5,
    salaryRating: 3.2,
    sentimentText: "94% of professionals say: 'Supreme status & power, high bureaucracy stress'",
    confessions: [
      "Preparation took 3 attempts, but representing my district makes it worth it.",
      "You are responsible for millions of people. It is a weight, not just a job."
    ]
  },
  ca: {
    id: "ca",
    name: "Chartered Accountant",
    category: "Finance · Accounts",
    sector: "Finance",
    location: "Mumbai / Bengaluru",
    matchScore: 80,
    salaryRange: "₹8–20 LPA",
    hiringCount: 310,
    demandStatus: "High demand",
    avgSalary: "₹14 LPA",
    timeToReady: "4–5 years",
    automationRisk: "Medium — automated audits",
    automationRiskColor: "text-amber-500 bg-amber-500/10",
    gapsToClose: ["Audit compliance", "Advanced corporate taxation"],
    description: "CAs manage financial audits, tax returns, budgeting, and corporate financial advisory. Daily tasks involve verifying financial statements, tax planning, and compliance.",
    color: "amber",
    bgHex: "#FAC775",
    pinCoordinates: { x: 345, y: 208 },
    popularMonths: [60, 70, 85, 95, 70, 60, 80, 90, 85, 75, 70, 65],
    wlbRating: 3.0,
    entryDifficulty: 4.6,
    growthPotential: 4.4,
    salaryRating: 4.1,
    sentimentText: "76% of professionals say: 'Peak hours during audit season, high stability'",
    confessions: [
      "Tax seasons mean no weekends. Rest of the year is quite manageable.",
      "Passing CA Final exams felt like conquering Everest. Articleship is key."
    ]
  },
  lawyer: {
    id: "lawyer",
    name: "Advocate / Lawyer",
    category: "Law · Litigation",
    sector: "Law",
    location: "Delhi / Mumbai",
    matchScore: 72,
    salaryRange: "₹6–18 LPA",
    hiringCount: 154,
    demandStatus: "Stable",
    avgSalary: "₹11 LPA",
    timeToReady: "3–5 years",
    automationRisk: "Low — litigation",
    automationRiskColor: "text-emerald-500 bg-emerald-500/10",
    gapsToClose: ["CLAT Preparation", "Litigation Drafting Practice"],
    description: "Advocates represent clients in legal disputes, draft contracts, and offer legal advisory services. Daily work involves legal research, drafting pleadings, and court representation.",
    color: "green",
    bgHex: "#C0DD97",
    pinCoordinates: { x: 465, y: 206 },
    popularMonths: [50, 55, 65, 70, 60, 50, 55, 65, 75, 70, 60, 50],
    wlbRating: 3.2,
    entryDifficulty: 4.3,
    growthPotential: 4.5,
    salaryRating: 3.8,
    sentimentText: "79% of professionals say: 'High research desk-hours, communication is key'",
    confessions: [
      "Litigation starts slow and pays little initially, but corporate law is very lucrative.",
      "Arguments in court are just 10% of the work. The rest is heavy paperwork."
    ]
  },
  founder: {
    id: "founder",
    name: "Startup Founder",
    category: "Entrepreneurship · Venture Building",
    sector: "Technology",
    location: "Bengaluru / Remote",
    matchScore: 68,
    salaryRange: "₹0–Equity LPA",
    hiringCount: 45,
    demandStatus: "High funding",
    avgSalary: "₹12 LPA stipend",
    timeToReady: "1–2 years",
    automationRisk: "Extremely Low — creative",
    automationRiskColor: "text-emerald-500 bg-emerald-500/10",
    gapsToClose: ["Venture Pitch Deck Validation", "No-Code MVP Builder", "Founder-Led Sales"],
    description: "Startup Founders build new products, validate markets, hire core teams, and pitch to angel investors/VCs. Daily work: 80% survival, customer calls, product iteration, and team stand-ups.",
    color: "red",
    bgHex: "#F5A3A3",
    pinCoordinates: { x: 145, y: 155 },
    popularMonths: [60, 65, 75, 80, 85, 90, 85, 80, 75, 70, 65, 60],
    wlbRating: 1.5,
    entryDifficulty: 4.8,
    growthPotential: 5.0,
    salaryRating: 2.5,
    sentimentText: "91% of founders say: 'Insane hours, high stress, but unmatched freedom & growth'",
    confessions: [
      "I worked for 12 months without salary. Tasted success when first customer paid $100.",
      "Most startup ideas fail. You have to love the process of validation, not just the dream."
    ]
  }
};

const getRoadStart = (pathString: string) => {
  if (!pathString || typeof pathString !== "string") return null;
  const match = pathString.match(/M\s*([\d\.-]+)\s+([\d\.-]+)/);
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }
  return null;
};

export default function CareerMap() {
  const { profile } = useAuth();
  const userLocation = useMemo(() => generateUserCoordinates(profile || {}, null), [profile]);

  // Master Bottom Nav State: explore | pathfinder | dreamboard | realitycheck | pulse
  const [activeTab, setActiveTab] = useState<"explore" | "pathfinder" | "dreamboard" | "realitycheck" | "pulse">("explore");
  
  // Navigation & UI States
  const [selectedRoleOpen, setSelectedRoleOpen] = useState<boolean>(false);
  const [isDetailsFullScreen, setIsDetailsFullScreen] = useState<boolean>(false);
  const [sidebarMode, setSidebarMode] = useState<"detail" | "pathfinder" | "menu" | "dreamboard" | "realitycheck" | "pulse" | "foryou" | "jobsearch" | "distance" | "settings" | "comparison" | "timeline" | "explore_category" | "search_results" | "autopilot" | "pioneer">("detail");
  const [selectedRole, setSelectedRole] = useState<RoleDetailData>(ROLE_DETAILS_MOCK.pm);
  const [activeRoleTab, setActiveRoleTab] = useState<string>("Overview");

  // Advanced CareerScape settings & features
  const [isIncognito, setIsIncognito] = useState<boolean>(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [currentCity, setCurrentCity] = useState<string>("nagpur");
  const [neurodivergentMode, setNeurodivergentMode] = useState<boolean>(false);
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(false);
  const [appLanguage, setAppLanguage] = useState<string>("en");
  const [arViewActive, setArViewActive] = useState<boolean>(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; roleId: string } | null>(null);

  // --- Regional Intelligence: Dynamic Tier-City Salary Adjustment ---
  // Tier 1: Bengaluru, Mumbai, Delhi/NCR — High cost, high demand
  // Tier 1.5: Pune, Hyderabad, Chennai — Mid cost, growing demand
  // Tier 2: Nagpur, Ahmedabad, Jaipur — Low cost, moderate demand
  const CITY_CONFIG: Record<string, { factor: number; tier: string; pppWarning: string; demandLabel: string }> = {
    bengaluru:  { factor: 1.28, tier: "Tier 1",   pppWarning: "Metro premium: salaries 28% above national average. High CoL offsets gains.", demandLabel: "Very High" },
    mumbai:     { factor: 1.22, tier: "Tier 1",   pppWarning: "Financial capital premium. Strong startup & finance demand. High rent index.", demandLabel: "Very High" },
    delhi:      { factor: 1.18, tier: "Tier 1",   pppWarning: "NCR corridor demand. 18% above average. Government + tech hybrid market.", demandLabel: "High" },
    hyderabad:  { factor: 1.08, tier: "Tier 1.5", pppWarning: "HITEC city pull: 8% above average with 20% lower cost than Bengaluru.", demandLabel: "High" },
    pune:       { factor: 1.02, tier: "Tier 1.5", pppWarning: "IT & auto hub. Near-parity salaries with lower living cost than Mumbai.", demandLabel: "High" },
    chennai:    { factor: 1.05, tier: "Tier 1.5", pppWarning: "Manufacturing & IT mix. 5% above average with stable hiring pipelines.", demandLabel: "Stable" },
    ahmedabad:  { factor: 0.88, tier: "Tier 2",   pppWarning: "Emerging startup scene. 12% below average but very low cost of living.", demandLabel: "Growing" },
    nagpur:     { factor: 0.78, tier: "Tier 2",   pppWarning: "Low CoL advantage! ₹12L here = ₹18L in Bengaluru (PPP-adjusted).", demandLabel: "Moderate" },
    jaipur:     { factor: 0.82, tier: "Tier 2",   pppWarning: "Pink City growth zone. 18% below average, but quality-of-life index high.", demandLabel: "Growing" },
    remote:     { factor: 0.97, tier: "Remote",   pppWarning: "Location-independent. Salary near national average; zero commute cost.", demandLabel: "High" },
  };

  const getAdjustedSalary = (roleId: string, city: string) => {
    const base = ROLE_DETAILS_MOCK[roleId];
    if (!base) return { range: "₹0 LPA", avg: "₹0 LPA", pppWarning: "", demand: "Stable", tier: "" };
    const cfg = CITY_CONFIG[city] ?? { factor: 1.0, tier: "National", pppWarning: "National average salary benchmark.", demandLabel: base.demandStatus };
    const numbers = base.salaryRange.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const min = Math.round(parseInt(numbers[0]) * cfg.factor);
      const max = Math.round(parseInt(numbers[1]) * cfg.factor);
      const avg = Math.round((min + max) / 2);
      return { range: `₹${min}–${max} LPA`, avg: `₹${avg} LPA`, pppWarning: cfg.pppWarning, demand: cfg.demandLabel, tier: cfg.tier };
    }
    return { range: base.salaryRange, avg: base.avgSalary, pppWarning: cfg.pppWarning, demand: cfg.demandLabel, tier: cfg.tier };
  };

  const isRoleDownloaded = (roleId: string) => {
    if (!isOfflineMode) return true;
    const downloaded = new Set<string>();
    if (selectedDownloads.includes("saved")) {
      savedRoles.forEach(id => downloaded.add(id));
    }
    if (selectedDownloads.includes("tech")) {
      downloaded.add("pm");
      downloaded.add("swengineer");
      downloaded.add("designer");
    }
    if (selectedDownloads.includes("path")) {
      downloaded.add("swengineer");
      downloaded.add("pm");
      downloaded.add("founder");
    }
    return downloaded.has(roleId);
  };
  
  // Pathfinder & Directions
  const [pathfinderInputs, setPathfinderInputs] = useState({
    from: "B.Com Graduate, Indore",
    to: "Product Manager, Bengaluru"
  });
  const [activeRouteMode, setActiveRouteMode] = useState<"fastest" | "safest" | "nocost">("fastest");
  const [navigationMode, setNavigationMode] = useState<boolean>(false);

  // SelfGraph Location Pin Simulation
  const [selfGraphCompleted, setSelfGraphCompleted] = useState<boolean>(true);

  // Canvas zoom, pan and category exploration states
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapCanvasRef = useRef<HTMLDivElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const detailsCardRef = useRef<HTMLDivElement>(null);
  const scrollDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [zoomScale, setZoomScale] = useState<number>(0.05); // start zoomed out to see the entire world
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const visualTransform = useRef({ scale: 0.05, x: 0, y: 0 });
  const hasCenteredRef = useRef(false);

  // Throttler to limit React state updates to 25 FPS (every 40ms) during active drag/zoom, 
  // keeping rendering cycles short while CSS transforms execute at 60 FPS in the DOM.
  const lastStateUpdateRef = useRef<number>(0);
  const stateUpdateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleStateUpdate = (scale: number, x: number, y: number) => {
    if (stateUpdateTimeoutRef.current) clearTimeout(stateUpdateTimeoutRef.current);
    stateUpdateTimeoutRef.current = setTimeout(() => {
      setZoomScale(scale);
      setPanOffset({ x, y });
    }, 150);
  };

  const [activeExploreCategory, setActiveExploreCategory] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ w: 1200, h: 700 });

  // Academic Layers Integration
  const { academicData, isLoadingAcademic } = useAcademicMapData();
  const [showAcademicOverlay, setShowAcademicOverlay] = useState<boolean>(false);
  const [selectedUserBoard, setSelectedUserBoard] = useState<string>("CBSE");
  const [selectedUserStream, setSelectedUserStream] = useState<string>("Science – PCM");

  const updateMapTransform = useCallback((scale: number, x: number, y: number) => {
    visualTransform.current = { scale, x, y };
    if (mapCanvasRef.current) {
      mapCanvasRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }
    if (mapContainerRef.current) {
      mapContainerRef.current.style.setProperty('--map-pan-x', `${x}px`);
      mapContainerRef.current.style.setProperty('--map-pan-y', `${y}px`);
      mapContainerRef.current.style.setProperty('--map-zoom', `${scale}`);
    }
    if (detailsCardRef.current) {
      if (sidebarMode === "detail" && selectedRole) {
        if (isDetailsFullScreen) {
          detailsCardRef.current.style.position  = 'fixed';
          detailsCardRef.current.style.left      = '0px';
          detailsCardRef.current.style.top       = '0px';
          detailsCardRef.current.style.transform = 'none';
          detailsCardRef.current.style.width     = '100%';
          detailsCardRef.current.style.height    = '100%';
          detailsCardRef.current.style.maxHeight = '100%';
          detailsCardRef.current.style.bottom    = 'auto';
        } else {
          const pinScreenX = selectedRole.pinCoordinates.x * scale + x;
          const pinScreenY = selectedRole.pinCoordinates.y * scale + y;

          // card is centered horizontally around pin, and sits ABOVE the pin
          const cardW = Math.min(384, viewportSize.w - 32);
          const rawCardH = Math.min(520, Math.max(420, viewportSize.h * 0.65));
          const cardH = Math.min(rawCardH, viewportSize.h - 138);
          const GAP = 12; // px gap between pin and bottom of card
          const MARGIN = 16; // min distance from any viewport edge

          // Desired position: card top-left corner, then center it horizontally
          let left = pinScreenX - cardW / 2;
          let top  = pinScreenY - cardH - GAP;

          // Clamp so card never escapes viewport
          left = Math.max(MARGIN, Math.min(viewportSize.w - cardW - MARGIN, left));
          top  = Math.max(MARGIN + 106 /* top bar + chips container height */, Math.min(viewportSize.h - cardH - MARGIN, top));

          detailsCardRef.current.style.position  = 'absolute';
          detailsCardRef.current.style.left      = `${left}px`;
          detailsCardRef.current.style.top       = `${top}px`;
          detailsCardRef.current.style.transform = 'none';
          detailsCardRef.current.style.width     = `${cardW}px`;
          detailsCardRef.current.style.height    = `${cardH}px`;
          detailsCardRef.current.style.maxHeight = `${cardH}px`;
          detailsCardRef.current.style.bottom    = 'auto';
        }
      } else {
        // Reset styles so class-based positioning works for menu and other sidebars
        detailsCardRef.current.style.position  = '';
        detailsCardRef.current.style.left      = '';
        detailsCardRef.current.style.top       = '';
        detailsCardRef.current.style.transform = '';
        detailsCardRef.current.style.width     = '';
        detailsCardRef.current.style.height    = '';
        detailsCardRef.current.style.maxHeight = '';
        detailsCardRef.current.style.bottom    = '';
      }
    }
  }, [selectedRole, viewportSize, sidebarMode, isDetailsFullScreen]);

  useEffect(() => {
    updateMapTransform(visualTransform.current.scale, visualTransform.current.x, visualTransform.current.y);
  }, [isDetailsFullScreen, updateMapTransform]);

  const getDetailsCardStyle = () => {
    if (sidebarMode !== "detail" || !selectedRole) return {};

    if (isDetailsFullScreen) {
      return {
        position: 'fixed' as const,
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        bottom: 'auto',
        transform: 'none',
        zIndex: 110
      };
    }

    const scale = zoomScale;
    const x = panOffset.x;
    const y = panOffset.y;

    const pinScreenX = selectedRole.pinCoordinates.x * scale + x;
    const pinScreenY = selectedRole.pinCoordinates.y * scale + y;

    const cardW = Math.min(384, viewportSize.w - 32);
    const rawCardH = Math.min(520, Math.max(420, viewportSize.h * 0.65));
    const cardH = Math.min(rawCardH, viewportSize.h - 138);
    const GAP = 12;
    const MARGIN = 16;

    let left = pinScreenX - cardW / 2;
    let top  = pinScreenY - cardH - GAP;

    left = Math.max(MARGIN, Math.min(viewportSize.w - cardW - MARGIN, left));
    top  = Math.max(MARGIN + 106, Math.min(viewportSize.h - cardH - MARGIN, top));

    return {
      left: `${left}px`,
      top: `${top}px`,
      transform: 'none',
      width: `${cardW}px`,
      height: `${cardH}px`,
      maxHeight: `${cardH}px`,
      bottom: 'auto',
      position: 'absolute' as const
    };
  };

  // Real-time Infinite Zoom Button Handler
  const handleZoomButton = (direction: "in" | "out") => {
    const zoomFactor = direction === "in" ? 1.25 : 0.8;
    const prevZoom = visualTransform.current.scale;
    const newZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.04), 12.0);
    
    const prevPan = visualTransform.current;

    // Zoom into the selected role pin if open, otherwise center of the viewport
    let cursorX = viewportSize.w / 2;
    let cursorY = viewportSize.h / 2;

    if (selectedRoleOpen && selectedRole) {
      cursorX = selectedRole.pinCoordinates.x * prevZoom + prevPan.x;
      cursorY = selectedRole.pinCoordinates.y * prevZoom + prevPan.y;
    }

    const newX = cursorX - (cursorX - prevPan.x) * (newZoom / prevZoom);
    const newY = cursorY - (cursorY - prevPan.y) * (newZoom / prevZoom);

    updateMapTransform(newZoom, newX, newY);
    
    setZoomScale(newZoom);
    setPanOffset({ x: newX, y: newY });
  };

  // Real-time Recenter Map Handler
  const handleRecenterMap = () => {
    // Redirect to the current career location of the user in the most zoomed in view
    const targetX = userLocation.x;
    const targetY = userLocation.y;
    const newZoom = 8.0; // Most zoomed in view

    const newX = viewportSize.w / 2 - targetX * newZoom;
    const newY = viewportSize.h / 2 - targetY * newZoom;

    updateMapTransform(newZoom, newX, newY);
    
    setZoomScale(newZoom);
    setPanOffset({ x: newX, y: newY });
  };

  // Non-passive wheel event listener to prevent browser scroll/pinch while zooming
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // If the scroll event originated inside any interactive scrollable overlay, let it scroll normally
      if (
        (e.target as HTMLElement).closest('[data-scroll-container]') ||
        (e.target as HTMLElement).closest('.pointer-events-auto')
      ) {
        return;
      }

      e.preventDefault(); // STOP the browser from scrolling or native pinching!
      
      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      
      const zoomFactor = Math.pow(1.002, -e.deltaY);
      
      const prevZoom = visualTransform.current.scale;
      const newZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.04), 12.0);
      
      const prevPan = visualTransform.current;
      const newX = cursorX - (cursorX - prevPan.x) * (newZoom / prevZoom);
      const newY = cursorY - (cursorY - prevPan.y) * (newZoom / prevZoom);

      updateMapTransform(newZoom, newX, newY);

      scheduleStateUpdate(newZoom, newX, newY);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [viewportSize]);

  // Prevent the map's wheel zoom handler from intercepting scroll events inside the details card
  useEffect(() => {
    const card = detailsCardRef.current;
    if (!card) return;

    const stopWheelPropagation = (e: WheelEvent) => {
      // Always stop propagation so the map zoom handler never sees wheel events inside the card
      e.stopPropagation();
    };

    card.addEventListener("wheel", stopWheelPropagation, { passive: true });
    return () => card.removeEventListener("wheel", stopWheelPropagation);
  });

  // Reset/apply direct styles of detailsCardRef when sidebarMode changes
  useEffect(() => {
    const card = detailsCardRef.current;
    if (!card) return;
    if (sidebarMode !== "detail") {
      card.style.left = "";
      card.style.top = "";
      card.style.transform = "";
      card.style.width = "";
      card.style.height = "";
      card.style.maxHeight = "";
      card.style.bottom = "";
    } else {
      const scale = visualTransform.current.scale;
      const x = visualTransform.current.x;
      const y = visualTransform.current.y;
      updateMapTransform(scale, x, y);
    }
  }, [sidebarMode, updateMapTransform]);

  // Observe container size to update viewportSize dynamically
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setViewportSize({ w: width, h: height });

    const obs = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      setViewportSize({ w, h });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Centre on the user's career location in the most zoomed in view on load or profile resolution
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el || hasCenteredRef.current) return;
    
    const { width, height } = el.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    
    const targetX = userLocation.x;
    const targetY = userLocation.y;
    const startZoom = 8.0; // Most zoomed in view showing user coordinates and neighborhood
    
    const initial = {
      x: width / 2 - targetX * startZoom,
      y: height / 2 - targetY * startZoom
    };
    
    setPanOffset(initial);
    updateMapTransform(startZoom, initial.x, initial.y);
    setZoomScale(startZoom);
    
    hasCenteredRef.current = true;
  }, [userLocation, viewportSize.w, viewportSize.h]);

  // ── Dynamic career data from the real 17k-role JSON ────────────────────────
  const { allPins, visiblePins, isLoading: dataLoading, statusMessage: dataStatus, totalCount, hulls, roads, rolesInViewportCount } = useCareerMapData({
    panOffsetX: panOffset.x,
    panOffsetY: panOffset.y,
    zoomScale,
    viewportW: viewportSize.w,
    viewportH: viewportSize.h,
    maxVisible: 1000,
  });

  useEffect(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas || !allPins || allPins.length === 0) return;
    
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let lastRenderX = -999999;
    let lastRenderY = -999999;
    let lastRenderScale = -999999;
    let lastRenderW = -1;
    let lastRenderH = -1;

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      
      const { x: currentX, y: currentY, scale: currentScale } = visualTransform.current;
      const { w: currentW, h: currentH } = viewportSize;

      // Only redraw if transform or viewport changed
      if (
        Math.abs(lastRenderX - currentX) < 0.1 && 
        Math.abs(lastRenderY - currentY) < 0.1 && 
        Math.abs(lastRenderScale - currentScale) < 0.001 &&
        lastRenderW === currentW &&
        lastRenderH === currentH
      ) {
        return;
      }

      lastRenderX = currentX;
      lastRenderY = currentY;
      lastRenderScale = currentScale;
      lastRenderW = currentW;
      lastRenderH = currentH;

      // Always clear the full canvas before redraw to prevent zoom-level ghost overlap
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(0, 0, currentW, currentH);

      let canvasAlpha = 1.0;
      if (currentScale > 0.3) {
        canvasAlpha = 0;
      }

      const PAD = 20;

      if (canvasAlpha > 0) {
        ctx.globalAlpha = canvasAlpha;

        const pinsByColor: Record<string, typeof allPins> = {};
        for (let i = 0; i < allPins.length; i++) {
          const pin = allPins[i];
          const screenX = pin.worldX * currentScale + currentX;
          const screenY = pin.worldY * currentScale + currentY;
          
          if (screenX >= -PAD && screenX <= currentW + PAD && screenY >= -PAD && screenY <= currentH + PAD) {
            const col = getCategoryColor(pin.category).border;
            if (!pinsByColor[col]) pinsByColor[col] = [];
            pinsByColor[col].push(pin);
          }
        }

        for (const [color, pins] of Object.entries(pinsByColor)) {
          ctx.fillStyle = color;
          ctx.beginPath();
          for (let i = 0; i < pins.length; i++) {
            const pin = pins[i];
            const screenX = pin.worldX * currentScale + currentX;
            const screenY = pin.worldY * currentScale + currentY;
            ctx.moveTo(screenX, screenY);
            ctx.arc(screenX, screenY, 4.5, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      }

      // --- ACADEMIC & EXAM OVERLAY INJECTION ---
      if (showAcademicOverlay && academicData) {
        ctx.globalAlpha = Math.min(1.0, currentScale * 1.5);
        
        // 1. Draw Board Launchpads (Western Border)
        academicData.boards.forEach((board, index) => {
          const bWorldX = 400; // Launchpad extreme west
          const bWorldY = 2000 + (index * 600);
          const screenX = bWorldX * currentScale + currentX;
          const screenY = bWorldY * currentScale + currentY;
          
          if (screenX >= -PAD && screenX <= currentW + PAD && screenY >= -PAD && screenY <= currentH + PAD) {
             // Draw terminal launchpad icon
             ctx.font = `${Math.max(12, 40 * currentScale)}px sans-serif`;
             ctx.textAlign = "center";
             ctx.fillText("🛫", screenX, screenY);
             // Draw Board Name
             if (currentScale > 0.1) {
                ctx.fillStyle = "#1e293b";
                ctx.font = `bold ${Math.max(10, 14 * currentScale)}px sans-serif`;
                ctx.fillText(board.name, screenX, screenY + 20 * currentScale);
             }
          }
        });

        // 2. Draw Entrance Exam Toll Gates near related roles
        if (currentScale > 0.3) {
          academicData.exams.forEach((exam) => {
             // Find roles this exam applies to
             const relatedPins = allPins.filter(p => exam.roles.includes(p.name));
             if (relatedPins.length > 0) {
                 // Place gate at the center of the first 3 associated roles
                 const count = Math.min(3, relatedPins.length);
                 let sumX = 0, sumY = 0;
                 for(let i=0; i<count; i++) { sumX += relatedPins[i].worldX; sumY += relatedPins[i].worldY; }
                 
                 const eWorldX = sumX / count;
                 const eWorldY = sumY / count;
                 const screenX = eWorldX * currentScale + currentX;
                 const screenY = eWorldY * currentScale + currentY;
                 
                 if (screenX >= -PAD && screenX <= currentW + PAD && screenY >= -PAD && screenY <= currentH + PAD) {
                     ctx.font = `${Math.max(14, 28 * currentScale)}px sans-serif`;
                     ctx.textAlign = "center";
                     ctx.fillText("🚧", screenX, screenY);
                     ctx.fillStyle = "#ef4444";
                     ctx.font = `bold ${Math.max(9, 12 * currentScale)}px sans-serif`;
                     ctx.fillText(exam.name, screenX, screenY - 15 * currentScale);
                 }
             }
          });
        }
        
        // 3. Draw Knowledge Hub Districts (Departments)
        if (currentScale > 1.2) {
          academicData.departments.forEach((dept) => {
             const relatedPins = allPins.filter(p => dept.roles.includes(p.name));
             if (relatedPins.length >= 3) {
                 const points = relatedPins.map(p => ({ x: p.worldX, y: p.worldY }));
                 const hull = getConvexHull(points);
                 if (hull && hull.length >= 3) {
                     ctx.beginPath();
                     for(let i=0; i<hull.length; i++) {
                         const hx = hull[i].x * currentScale + currentX;
                         const hy = hull[i].y * currentScale + currentY;
                         if(i===0) ctx.moveTo(hx, hy);
                         else ctx.lineTo(hx, hy);
                     }
                     ctx.closePath();
                     ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
                     ctx.fill();
                     ctx.strokeStyle = "rgba(16, 185, 129, 0.3)";
                     ctx.lineWidth = Math.max(1, 2 * currentScale);
                     ctx.stroke();

                     // Department Title
                     const cx = hull[0].x * currentScale + currentX;
                     const cy = hull[0].y * currentScale + currentY;
                     if (cx >= -PAD && cx <= currentW + PAD && cy >= -PAD && cy <= currentH + PAD) {
                         ctx.fillStyle = "#064e3b";
                         ctx.font = `bold ${Math.max(9, 12 * currentScale)}px sans-serif`;
                         ctx.textAlign = "center";
                         ctx.fillText(dept.name + " Hub", cx, cy);
                     }
                 }
             }
          });
        }
      }

      ctx.globalAlpha = 1.0;
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [allPins, viewportSize, showAcademicOverlay, academicData]);

  // Viewport bounds in world coordinates (large padding to avoid edge pop-in)
  const viewportBounds = useMemo(() => {
    const PAD = 500;
    const xMin = (-panOffset.x - PAD) / zoomScale;
    const yMin = (-panOffset.y - PAD) / zoomScale;
    const xMax = (viewportSize.w - panOffset.x + PAD) / zoomScale;
    const yMax = (viewportSize.h - panOffset.y + PAD) / zoomScale;
    return { xMin, yMin, xMax, yMax };
  }, [panOffset, zoomScale, viewportSize]);

  // Helper function to check if hull center is inside the viewport bounds
  const isHullVisible = useCallback((h: { center: { x: number; y: number } }) => {
    return h.center.x >= viewportBounds.xMin && h.center.x <= viewportBounds.xMax &&
           h.center.y >= viewportBounds.yMin && h.center.y <= viewportBounds.yMax;
  }, [viewportBounds]);

  // ── Filter Hulls By Levels and Viewport Visibility ─────────────────────────────
  const sectorHulls = useMemo(() => hulls.filter(h => h.level === 'continent' && isHullVisible(h)), [hulls, viewportBounds, isHullVisible]);
  const countryHulls = useMemo(() => hulls.filter(h => h.level === 'country' && isHullVisible(h)), [hulls, viewportBounds, isHullVisible]);
  const stateHulls = useMemo(() => hulls.filter(h => h.level === 'state' && isHullVisible(h)), [hulls, viewportBounds, isHullVisible]);
  const countyHulls = useMemo(() => hulls.filter(h => h.level === 'county' && isHullVisible(h)), [hulls, viewportBounds, isHullVisible]);
  const cityHulls = useMemo(() => hulls.filter(h => h.level === 'city' && isHullVisible(h)), [hulls, viewportBounds, isHullVisible]);
  const boroughHulls = useMemo(() => hulls.filter(h => h.level === 'borough' && isHullVisible(h)), [hulls, viewportBounds, isHullVisible]);
  const neighborhoodHulls = useMemo(() => hulls.filter(h => h.level === 'neighborhood' && isHullVisible(h)), [hulls, viewportBounds, isHullVisible]);
  const campusHulls = useMemo(() => hulls.filter(h => h.level === 'campus' && isHullVisible(h)), [hulls, viewportBounds, isHullVisible]);
  const buildingHulls = useMemo(() => hulls.filter(h => h.level === 'building' && isHullVisible(h)), [hulls, viewportBounds, isHullVisible]);

  // Layers Toggles
  const [layersPanelOpen, setLayersPanelOpen] = useState<boolean>(false);
  const [activeMapType, setActiveMapType] = useState<"default" | "skills" | "lifestyle">("default");
  const [activeLayers, setActiveLayers] = useState({
    salaryHeat: false,
    automationRisk: false,
    remoteFriendly: false,
    tier3Accessible: false,
    fundingActivity: false,
    hiringDemand: false,
    careerClusters: false,
    matchScore: false,
    entryBarrier: false,
    educationInstitutions: false
  });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    if (!selectedRoleOpen || sidebarMode !== "detail") {
      setIsDetailsFullScreen(false);
    }
  }, [selectedRoleOpen, sidebarMode]);

  const searchSuggestions = useMemo(() => {
    const list: Array<{
      name: string;
      type: string;
      key: string;
      x?: number;
      y?: number;
      isRole?: boolean;
      isGeo?: boolean;
      isRoad?: boolean;
      level?: string;
    }> = [];

    // 1. Roles from allPins
    if (allPins && allPins.length > 0) {
      allPins.forEach(pin => {
        list.push({
          name: pin.name,
          type: "💼 Role",
          key: pin.id,
          x: pin.worldX,
          y: pin.worldY,
          isRole: true
        });
      });
    }

    // 2. Geography Hulls
    if (hulls && hulls.length > 0) {
      hulls.forEach(hull => {
        let typeStr = "📍 Territory";
        if (hull.level === "continent") typeStr = "🌍 Continent";
        else if (hull.level === "country") typeStr = "🚩 Country";
        else if (hull.level === "state") typeStr = "🏛️ State";
        else if (hull.level === "county") typeStr = "🗺️ County";
        else if (hull.level === "city") typeStr = "🏙️ City";
        else if (hull.level === "borough") typeStr = "🚇 Borough";
        else if (hull.level === "neighborhood") typeStr = "🏘️ Neighborhood";
        else if (hull.level === "campus") typeStr = "🏢 Campus";
        else if (hull.level === "building") typeStr = "🏫 Building";

        list.push({
          name: hull.name,
          type: typeStr,
          key: `${hull.level}-${hull.name}`,
          x: hull.center?.x,
          y: hull.center?.y,
          isGeo: true,
          level: hull.level
        });
      });
    }

    // 3. Streets / Roads
    if (roads && roads.length > 0) {
      roads.forEach(road => {
        if (road.name) {
          const start = getRoadStart(road.path);
          list.push({
            name: road.name,
            type: "🛣️ Street/Road",
            key: `road-${road.name}`,
            x: start?.x,
            y: start?.y,
            isRoad: true
          });
        }
      });
    }

    // Add default categories
    list.push(
      { name: "Trending Roles", type: "🔥 Category", key: "trending_roles" },
      { name: "Emerging Careers", type: "✨ Category", key: "emerging_careers" },
      { name: "Remote-Friendly", type: "🌐 Category", key: "remote_friendly" },
      { name: "No-Degree Paths", type: "🎓 Category", key: "no_degree" }
    );

    const getSuggestionScore = (item: typeof list[0]) => {
      let score = 0;
      
      // Categories get very high priority
      if (item.type.includes("Category")) {
        score += 10000;
        return score;
      }
      
      // Curated details roles from ROLE_DETAILS_MOCK get highest priority among roles
      const curatedKeys = ["pm", "swengineer", "designer", "doctor", "ias", "ca", "lawyer", "founder"];
      if (curatedKeys.includes(item.key)) {
        score += 5000;
      }
      
      const lowerName = item.name.toLowerCase();
      
      // In-demand / Trending keywords per sector
      const trendingKeywords = [
        "software engineer", "product manager", "ux designer", "ui designer", "doctor", 
        "advocate", "lawyer", "accountant", "founder", "data scientist", "data analyst",
        "ai engineer", "machine learning", "cloud architect", "cybersecurity", // Tech
        "nurse", "surgeon", "physician", "pharmacist", "therapist", // Health
        "art director", "graphic designer", "copywriter", "video editor", "animator", // Creative
        "investment banker", "portfolio manager", "financial analyst", "auditor", // Finance
        "corporate lawyer", "judge", "legal advisor", // Law
        "teacher", "professor", "education consultant", "academic counselor", // Education
        "collector", "ias officer", "ips officer", "policy analyst", // Government
        "agronomist", "farm manager", "agricultural engineer", "horticulturist" // Agri
      ];
      
      if (trendingKeywords.some(kw => lowerName.includes(kw))) {
        score += 2000;
      }
      
      // Geographical levels priority
      if (item.isGeo) {
        if (item.level === "continent") score += 1000;
        else if (item.level === "country") score += 800;
        else if (item.level === "state") score += 600;
        else if (item.level === "city") score += 400;
        else if (item.level === "neighborhood") score += 200;
        else if (item.level === "campus") score += 100;
        else score += 50;
      }
      
      // Roads priority
      if (item.isRoad) {
        score += 150;
      }
      
      return score;
    };

    list.sort((a, b) => getSuggestionScore(b) - getSuggestionScore(a));

    return list;
  }, [allPins, hulls, roads]);

  const filteredSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return searchSuggestions.slice(0, 15);
    }
    const filtered: typeof searchSuggestions = [];
    for (let i = 0; i < searchSuggestions.length; i++) {
      const item = searchSuggestions[i];
      if (item.name.toLowerCase().includes(query) || item.type.toLowerCase().includes(query)) {
        filtered.push(item);
        if (filtered.length >= 12) break;
      }
    }
    return filtered;
  }, [searchQuery, searchSuggestions]);
  const [activeFilterChip, setActiveFilterChip] = useState("trending");

  // RoleView Hotspot States
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [timelapseHour, setTimelapseHour] = useState<string>("12 PM");
  
  // MCQ Challenge State
  const [mcqAnswer, setMcqAnswer] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState<number>(3240);

  // Dream Board Saved Lists & Categories (Spec L1244-1365)
  const [savedRoles, setSavedRoles] = useState<string[]>(["pm", "designer"]);
  const [dreamBoardSavedRoles, setDreamBoardSavedRoles] = useState<Record<string, string>>({
    pm: "Top Choices",
    designer: "Exploring"
  });
  const [dreamBoardNotes, setDreamBoardNotes] = useState<Record<string, string>>({
    pm: "My mentor suggested aiming for startup PM roles first.",
    designer: "Worried about salary vs tech load."
  });
  const [dreamBoardCollections, setDreamBoardCollections] = useState([
    { name: "Remote Tech Careers", desc: "Careers I can do from anywhere", privacy: "Shared with mentor", roles: ["designer", "swengineer"] },
    { name: "High-Paying Options", desc: "Starting ₹15L+", privacy: "Private (only you)", roles: ["pm", "founder"] }
  ]);
  const [dreamBoardQuickSaveOpen, setDreamBoardQuickSaveOpen] = useState<boolean>(false);
  const [dreamBoardActiveTab, setDreamBoardActiveTab] = useState<string>("Top Choices");
  const [dreamBoardCreateCollectionOpen, setDreamBoardCreateCollectionOpen] = useState<boolean>(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [newCollectionPrivacy, setNewCollectionPrivacy] = useState("Shared with mentor");
  const [dreamBoardShareOpen, setDreamBoardShareOpen] = useState<boolean>(false);
  const [selectedCollectionToShare, setSelectedCollectionToShare] = useState<string>("");
  const [activeCollectionDetailName, setActiveCollectionDetailName] = useState<string | null>(null);

  // Workspace Tour Immersive States (Spec L1126-1241)
  const [workspaceViewOpen, setWorkspaceViewOpen] = useState<boolean>(false);
  const [workspaceStage, setWorkspaceStage] = useState<string>("Startup (Bengaluru)");
  const [workspaceTime, setWorkspaceTime] = useState<string>("10 AM-12 PM");
  const [workspaceStageYear, setWorkspaceStageYear] = useState<number>(3); // Year 1, Year 3, Year 6
  const [workspaceOpenHotspot, setWorkspaceOpenHotspot] = useState<string | null>(null);
  const [workspacePanningOffset, setWorkspacePanningOffset] = useState<number>(-200); // Center standard desk
  const [isDraggingWorkspace, setIsDraggingWorkspace] = useState<boolean>(false);
  const [dragStartWorkspace, setDragStartWorkspace] = useState<number>(0);
  const [workspaceCTAOpen, setWorkspaceCTAOpen] = useState<boolean>(false);
  const [figmaChallengeSuccess, setFigmaChallengeSuccess] = useState<boolean>(false);
  const [figmaButtonWidth, setFigmaButtonWidth] = useState<number>(100);

  // Multi-Career Sequence States (Spec L1368-1466)
  const [sequenceModeActive, setSequenceModeActive] = useState<boolean>(false);
  const [sequenceFinalDest, setSequenceFinalDest] = useState<string>("founder");
  const [sequenceStops, setSequenceStops] = useState<string[]>(["swengineer", "pm"]);
  const [activeSequenceStageIndex, setActiveSequenceStageIndex] = useState<number>(0);
  const [sequenceReadyScore, setSequenceReadyScore] = useState<number>(75);
  const [sequenceShowAlternate, setSequenceShowAlternate] = useState<boolean>(false);
  const [sequenceCompletedStops, setSequenceCompletedStops] = useState<string[]>([]);
  const [sequenceCurrentStage, setSequenceCurrentStage] = useState<number>(2);

  // CareerScape Spec Additions (Lines 1-540)
  const [coExploreActive, setCoExploreActive] = useState<boolean>(false);
  const [coExploreCursor, setCoExploreCursor] = useState({ x: 120, y: 150, message: "Sneha G (Mentor): Hey! Check out the UX Designer role here." });
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [voiceSearchActive, setVoiceSearchActive] = useState<boolean>(false);
  const [visualSearchActive, setVisualSearchActive] = useState<boolean>(false);
  const [activeLane, setActiveLane] = useState<string | null>(null);

  // CareerScape Offline Mode States (Spec L1467-1543)
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [offlineDownloadDialogOpen, setOfflineDownloadDialogOpen] = useState<boolean>(false);
  const [selectedDownloads, setSelectedDownloads] = useState<string[]>(["saved", "tech", "path"]);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // CareerScape Timeline Navigation & Activities States (Spec L1566-1774)
  const [timelineTab, setTimelineTab] = useState<"daily" | "monthly" | "yearly" | "visual" | "insights" | "takeout">("daily");
  const [correctedTimelineItems, setCorrectedTimelineItems] = useState<Record<string, boolean>>({});

  // CareerScape Share & Mentor Mode States (Spec L1795-1905)
  const [shareJourneyOpen, setShareJourneyOpen] = useState<boolean>(false);
  const [shareCareerOpen, setShareCareerOpen] = useState<boolean>(false);
  const [sharePathOpen, setSharePathOpen] = useState<boolean>(false);
  const [isMentorView, setIsMentorView] = useState<boolean>(false);
  const [mentorComments, setMentorComments] = useState<string[]>([
    "Great progress! For Project 2, consider adding authentication."
  ]);
  const [newMentorComment, setNewMentorComment] = useState<string>("");
  const [coExploreChatOpen, setCoExploreChatOpen] = useState<boolean>(false);
  const [coExploreMessages, setCoExploreMessages] = useState<Array<{ sender: string, text: string }>>([
    { sender: "Priya (Mentor)", text: "Hey! Let's look at the UX Designer nodes in Nagoya." }
  ]);
  const [newChatMessage, setNewChatMessage] = useState<string>("");
  const [coExploreVoiceActive, setCoExploreVoiceActive] = useState<boolean>(false);

  // Journey 12, 13 & 14 Custom States (Spec L1908-2400)
  const [realityCheckFormOpen, setRealityCheckFormOpen] = useState<boolean>(false);
  const [realityCheckRatings, setRealityCheckRatings] = useState({
    wlb: 4,
    entry: 3,
    growth: 5,
    salary: 4,
    satisfaction: 4
  });
  const [realityCheckReviewText, setRealityCheckReviewText] = useState<string>("");
  const [realityCheckOptions, setRealityCheckOptions] = useState({
    introvert: true,
    travel: false,
    remote: true,
    stress: false
  });
  const [realityCheckLinkedInConnected, setRealityCheckLinkedInConnected] = useState<boolean>(false);
  
  // Custom reviews stored dynamically in state for display
  const [customRealityChecks, setCustomRealityChecks] = useState<Array<{
    name: string,
    role: string,
    company: string,
    verified: boolean,
    experience: string,
    posted: string,
    location: string,
    rating: number,
    text: string,
    options: string[],
    helpfulVotes: number,
    commentsCount: number
  }>>([]);

  // Q&A Tab Custom States
  const [qaQuestions, setQaQuestions] = useState<Array<{
    id: string,
    roleId: string,
    studentQuestion: string,
    answers: Array<{ author: string, text: string, helpfulCount: number, verified: boolean }>
  }>>([
    {
      id: "q1",
      roleId: "pm",
      studentQuestion: "Can I become a PM without an engineering degree?",
      answers: [
        {
          author: "Priya Sharma (Mentor)",
          text: "Yes! I have a B.Com degree. What matters more is product thinking and communication skills. I did a PM bootcamp and built side projects.",
          helpfulCount: 45,
          verified: true
        }
      ]
    },
    {
      id: "q2",
      roleId: "swengineer",
      studentQuestion: "How much math is required for daily web development tasks?",
      answers: [
        {
          author: "Rohan M. (Senior Dev)",
          text: "Basic algebra and logical thinking are 95% of it. Unless you go into game engines or AI/ML, you don't need calculus or high-level physics.",
          helpfulCount: 22,
          verified: true
        }
      ]
    }
  ]);
  const [newAnswerText, setNewAnswerText] = useState<string>("");

  // Suggest Edit States
  const [suggestEditOpen, setSuggestEditOpen] = useState<boolean>(false);
  const [suggestedSalaryRange, setSuggestedSalaryRange] = useState<string>("");
  const [suggestedEditSlipUploaded, setSuggestedEditSlipUploaded] = useState<boolean>(false);

  // Add Missing Career States
  const [addMissingCareerOpen, setAddMissingCareerOpen] = useState<boolean>(false);
  const [missingCareerForm, setMissingCareerForm] = useState({
    name: "",
    category: "Technology",
    description: "",
    salary: "",
    skills: "",
    education: "",
    companies: ""
  });

  // Pioneer Program States
  const [pioneerPoints, setPioneerPoints] = useState<number>(1250);
  const [pioneerLeaderboardMode, setPioneerLeaderboardMode] = useState<"bengaluru" | "national">("bengaluru");

  // Career Autopilot States
  const [autopilotActive, setAutopilotActive] = useState<boolean>(false);
  const [autopilotCurrentRole, setAutopilotCurrentRole] = useState<string>("Junior Product Manager");
  const [autopilotTargetRole, setAutopilotTargetRole] = useState<string>("Senior Product Manager");
  const [autopilotReadiness, setAutopilotReadiness] = useState<number>(55);
  const [autopilotChecklistOpen, setAutopilotChecklistOpen] = useState<boolean>(false);

  // Education Pathfinder States
  const [pathfinderRouteType, setPathfinderRouteType] = useState<"degree" | "direct" | "corporate">("degree");
  const [selectedStationDetail, setSelectedStationDetail] = useState<StationDetail | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [transferFromSelection, setTransferFromSelection] = useState<string>("B.Com Year 2");

  // Journey 15 & 16 Custom States (Spec L2400-2765)
  const [activeJobSearchSubTab, setActiveJobSearchSubTab] = useState<"search" | "tracker" | "interview" | "negotiation">("search");
  const [appliedJobs, setAppliedJobs] = useState<Array<{
    company: string;
    role: string;
    date: string;
    status: string;
    reminders: string[];
    notes: string;
  }>>([
    {
      company: "Startup X",
      role: "Product Manager",
      date: "March 10, 2027",
      status: "📧 Application Submitted",
      reminders: [
        "Follow up in 7 days if no response",
        "Interview likely in 2 weeks",
        "Prepare: System design, Product case study"
      ],
      notes: "Referral from Rohan. Hiring manager likes candidates with B2C product experience."
    }
  ]);

  const [upcomingInterviews, setUpcomingInterviews] = useState<Array<{
    company: string;
    role: string;
    date: string;
    time: string;
    location: string;
  }>>([
    {
      company: "Startup X",
      role: "Product Manager",
      date: "March 20, 2027",
      time: "2:00 PM",
      location: "Koramangala, Bengaluru"
    }
  ]);

  const [interviewPrepChecklist, setInterviewPrepChecklist] = useState({
    researchCompany: true,
    reviewProduct: true,
    caseStudies: false, // 2/5 done represented as boolean or details
    mockInterview: false,
    systemDesign: false,
    resumeUpdated: true
  });

  const [offerNegotiation, setOfferNegotiation] = useState({
    company: "Startup X",
    base: "₹16 LPA",
    equity: "0.05%",
    joiningBonus: "₹2L",
    total: "₹18 LPA"
  });

  const [activeForYouTab, setActiveForYouTab] = useState<"feed" | "lists" | "events">("feed");
  const [showFilterDialog, setShowFilterDialog] = useState<boolean>(false);
  const [careerFilters, setCareerFilters] = useState({
    remoteFriendly: true,
    flexibleHours: false,
    highTravel: false,
    teamCollaboration: true,
    entryLevel: true,
    midLevel: true,
    seniorLevel: false,
    wlbRating: true,
    highStress: false,
    minimalOvertime: true,
    technicalSkills: true,
    creativeSkills: false,
    peopleManagement: true,
    anyDegree: true,
    specificDegree: false,
    bootcampFriendly: true,
    highDemand: true,
    stableHiring: false,
    emergingField: false,
    equityAvailable: true,
    bonusesCommon: true
  });

  // Journey 17, 18, 19 Custom States (Spec L2765-3330)
  const [careerPriorities, setCareerPriorities] = useState<string[]>([
    "Work-Life Balance", "Salary", "Growth Opportunities", "Location Flexibility", "Job Security"
  ]);
  const [pathPreference, setPathPreference] = useState<"fastest" | "safest" | "cheapest" | "balanced">("fastest");
  const [educationPreference, setEducationPreference] = useState({
    anyDegree: true,
    specificDegree: true,
    noDegree: false,
    bootcamp: true
  });
  const [relocationPreference, setRelocationPreference] = useState({
    willingToRelocate: true,
    preferredCities: ["Bengaluru", "Pune", "Hyderabad"],
    remoteOnly: false,
    currentCityOnly: false
  });
  const [salaryMin, setSalaryMin] = useState<number>(12);
  const [salaryTarget, setSalaryTarget] = useState<number>(18);
  const [salaryUnit, setSalaryUnit] = useState<"annual" | "monthly">("annual");
  const [examGatePreference, setExamGatePreference] = useState({
    noExam: true,
    optionalExam: true,
    mandatoryExam: false,
    warnRules: "always"
  });
  const [mapViewMode, setMapViewMode] = useState<"match" | "salary" | "demand" | "clusters">("match");
  const [mapLayers, setMapLayers] = useState({
    hiringDemand: true,
    careerClusters: true,
    automationRisk: false,
    remoteFriendly: false
  });
  const [detailsDepth, setDetailsDepth] = useState<"quick" | "standard" | "deep">("standard");
  const [xpBadgesMode, setXpBadgesMode] = useState<"enabled" | "minimal" | "disabled">("enabled");
  const [leaderboardVisible, setLeaderboardVisible] = useState<boolean>(true);
  const [streaksEnabled, setStreaksEnabled] = useState<boolean>(true);
  const [streaksReminders, setStreaksReminders] = useState<boolean>(true);
  const [historyRule, setHistoryRule] = useState<"save" | "delete90" | "never">("save");
  const [shareJourneyRule, setShareJourneyRule] = useState<"public" | "friends" | "private">("friends");
  const [anonymousMode, setAnonymousMode] = useState<boolean>(false);
  const [weeklySummary, setWeeklySummary] = useState<boolean>(true);
  const [milestoneCeleb, setMilestoneCeleb] = useState<boolean>(true);
  const [nudgeBehind, setNudgeBehind] = useState<boolean>(true);
  const [dailyReminders, setDailyReminders] = useState<boolean>(false);
  const [careerAlertSpikes, setCareerAlertSpikes] = useState<boolean>(true);
  const [careerAlertNew, setCareerAlertNew] = useState<boolean>(true);
  const [careerAlertEvents, setCareerAlertEvents] = useState<boolean>(true);
  const [frequency, setFrequency] = useState<"realtime" | "daily" | "weekly">("realtime");
  const [careerDescriptionsLang, setCareerDescriptionsLang] = useState<"en" | "hinglish" | "regional">("en");
  const [voiceNavigationEnabled, setVoiceNavigationEnabled] = useState<boolean>(true);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [screenReaderOptimized, setScreenReaderOptimized] = useState<boolean>(true);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium");

  const [accessibilityNeeds, setAccessibilityNeeds] = useState({
    physicalDisability: false,
    hearingImpairment: false,
    visionImpairment: false,
    neurodivergent: false,
    chronicIllness: false,
    mentalHealth: false
  });

  const [mentalHealthNeeds, setMentalHealthNeeds] = useState({
    lowStress: false,
    wlbCritical: false,
    avoidDeadlines: false,
    supportiveCulture: false,
    preferSolo: false
  });

  // Interactive Tools states
  const [measureDistanceActive, setMeasureDistanceActive] = useState<boolean>(false);
  const [measureDistancePoints, setMeasureDistancePoints] = useState<string[]>([]);
  const [showMeasureDistanceDialog, setShowMeasureDistanceDialog] = useState<boolean>(false);
  const [showSkillGapAR, setShowSkillGapAR] = useState<boolean>(false);

  // Advanced Comparison Engine state (up to 4 roles side-by-side)
  const [comparisonSlots, setComparisonSlots] = useState<string[]>(["pm", "swengineer"]);

  // Iframe Embed Widget state
  const [embedModalOpen, setEmbedModalOpen] = useState<boolean>(false);
  const [embedTargetRoleId, setEmbedTargetRoleId] = useState<string>("");
  const [embedSizeIndex, setEmbedSizeIndex] = useState<number>(1); // 0=Small, 1=Medium, 2=Full

  // Print / PDF export state
  const [printExportOpen, setPrintExportOpen] = useState<boolean>(false);
  const [showARPractice, setShowARPractice] = useState<boolean>(false);
  const [showIncognitoPrompt, setShowIncognitoPrompt] = useState<boolean>(false);
  const [voiceListening, setVoiceListening] = useState<boolean>(false);
  const [voiceCmdStatus, setVoiceCmdStatus] = useState<string>("");
  const [voiceNavigatorOpen, setVoiceNavigatorOpen] = useState<boolean>(false);
  const [activeARSubTab, setActiveARSubTab] = useState<"desk" | "physical" | "interview">("desk");
  const [mockQuestion, setMockQuestion] = useState<string>("");
  const [interviewFeedback, setInterviewFeedback] = useState<boolean>(false);


  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenRole = (
    roleKey: string, 
    dynamicPin?: { id: string; name: string; category: string; sectorName?: string; [key: string]: any },
    preventPan = false
  ) => {
    let role = ROLE_DETAILS_MOCK[roleKey];
    if (!role) {
      const pinFromAll = allPins?.find(p => p.id === roleKey);
      if (pinFromAll) {
        const col = getCategoryColor(pinFromAll.category);
        role = {
          id: pinFromAll.id,
          name: pinFromAll.name,
          category: col.label,
          sector: pinFromAll.sectorName || col.label,
          location: "Pan-India (Hybrid/Remote)",
          matchScore: 78,
          salaryRange: "₹8–18 LPA",
          hiringCount: 154,
          demandStatus: "High",
          avgSalary: "₹12 LPA",
          timeToReady: "12 months",
          automationRisk: "Low Risk",
          automationRiskColor: "emerald",
          gapsToClose: ["Advanced Domain Certification", "Industry Internship"],
          description: `This role is a part of the ${pinFromAll.careerCluster || 'Career'} pathway under ${pinFromAll.subSectorName || 'the sector'}. It requires domain-specific skills, analytical execution, and stakeholder coordination.`,
          color: col.border,
          bgHex: col.bg,
          pinCoordinates: { x: pinFromAll.worldX, y: pinFromAll.worldY },
          popularMonths: [3, 4, 7, 8, 11],
          wlbRating: 4.2,
          entryDifficulty: 3.5,
          growthPotential: 4.5,
          salaryRating: 4.0,
          sentimentText: "Strong growth outlook, stable hiring pipelines across major tech hubs.",
          confessions: [
            "Expect continuous learning to keep up with industry trends.",
            "Good compensation, but project deadlines can sometimes be demanding."
          ]
        };
      }
    }
    if (!role && dynamicPin) {
      const col = getCategoryColor(dynamicPin.category);
      role = {
        id: dynamicPin.id,
        name: dynamicPin.name,
        category: col.label,
        sector: dynamicPin.sectorName || col.label,
        location: "Pan-India (Hybrid/Remote)",
        matchScore: 78,
        salaryRange: "₹8–18 LPA",
        hiringCount: 154,
        demandStatus: "High",
        avgSalary: "₹12 LPA",
        timeToReady: "12 months",
        automationRisk: "Low Risk",
        automationRiskColor: "emerald",
        gapsToClose: ["Advanced Domain Certification", "Industry Internship"],
        description: `This role is a part of the ${dynamicPin.careerCluster || 'Career'} pathway under ${dynamicPin.subSectorName || 'the sector'}. It requires domain-specific skills, analytical execution, and stakeholder coordination.`,
        color: col.border,
        bgHex: col.bg,
        pinCoordinates: { x: dynamicPin.worldX, y: dynamicPin.worldY },
        popularMonths: [3, 4, 7, 8, 11],
        wlbRating: 4.2,
        entryDifficulty: 3.5,
        growthPotential: 4.5,
        salaryRating: 4.0,
        sentimentText: "Strong growth outlook, stable hiring pipelines across major tech hubs.",
        confessions: [
          "Expect continuous learning to keep up with industry trends.",
          "Good compensation, but project deadlines can sometimes be demanding."
        ]
      };
    }
    if (role) {
      setSelectedRole(role);
      setActiveRoleTab("Overview");
      setSelectedRoleOpen(true);
      setSidebarMode("detail");
      setSearchFocused(false);
      
      if (!preventPan) {
        // Smoothly pan & zoom to center the selected pin inside viewport
        const newZoom = Math.max(zoomScale, 0.85);
        const newX = (viewportSize.w / 2) - role.pinCoordinates.x * newZoom;
        const newY = (viewportSize.h / 2) - role.pinCoordinates.y * newZoom;
        
        updateMapTransform(newZoom, newX, newY);
        setZoomScale(newZoom);
        setPanOffset({ x: newX, y: newY });
      }
    }
  };

  const isRoleSaved = (roleId: string) => savedRoles.includes(roleId);
  const toggleSaveRole = (roleId: string) => {
    if (savedRoles.includes(roleId)) {
      setSavedRoles(prev => prev.filter(id => id !== roleId));
    } else {
      setSavedRoles(prev => [...prev, roleId]);
    }
  };
  const invZoom = 1 / zoomScale;
  // 1. Continent Opacity
  const showContinent = zoomScale <= 0.3;
  const continentOpacity = showContinent ? 1.0 : 0.0;

  // 2. Country Opacity
  const showCountry = zoomScale > 0.3 && zoomScale <= 0.6;
  const countryOpacity = showCountry ? 1.0 : 0.0;

  // 3. State Opacity
  const showState = zoomScale > 0.6 && zoomScale <= 0.9;
  const stateOpacity = showState ? 1.0 : 0.0;

  // 4. County Opacity
  const showCounty = zoomScale > 0.9 && zoomScale <= 1.35;
  const countyOpacity = showCounty ? 1.0 : 0.0;

  // 5. City Opacity
  const showCity = zoomScale > 1.35 && zoomScale <= 1.9;
  const cityOpacity = showCity ? 1.0 : 0.0;

  // 6. Borough Opacity
  const showBorough = zoomScale > 1.9 && zoomScale <= 2.6;
  const boroughOpacity = showBorough ? 1.0 : 0.0;

  // 7. Neighborhood Opacity
  const showNeighborhood = zoomScale > 2.6 && zoomScale <= 4.8;
  const neighborhoodOpacity = showNeighborhood ? 1.0 : 0.0;

  // 8. Roads Opacity
  const showRoads = zoomScale > 3.8;
  const roadsOpacity = showRoads ? 1.0 : 0.0;

  // 9. Campus Opacity
  const showCampus = zoomScale > 4.8 && zoomScale <= 6.0;
  const campusOpacity = showCampus ? 1.0 : 0.0;

  // 10. Building Opacity
  const showBuilding = zoomScale > 6.0;
  const buildingOpacity = showBuilding ? 1.0 : 0.0;

  return (
    <div className="myraaha-app w-full space-y-4 px-1 sm:px-0 select-none">
      {/* CSS keyframe animations injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blueDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.35); opacity: 0.15; }
        }
        @keyframes routeAnim {
          from { stroke-dashoffset: 400; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes territoryGlow {
          0%, 100% { opacity: 0.85; box-shadow: 0 0 0px rgba(0,0,0,0); }
          50% { opacity: 1; box-shadow: 0 0 18px rgba(255,255,255,0.35); }
        }
        @keyframes territoryGlowBlue {
          0%, 100% { box-shadow: 0 0 8px rgba(59,139,212,0.3); }
          50% { box-shadow: 0 0 22px rgba(59,139,212,0.7); }
        }
        @keyframes territoryGlowGreen {
          0%, 100% { box-shadow: 0 0 8px rgba(29,158,117,0.3); }
          50% { box-shadow: 0 0 22px rgba(29,158,117,0.7); }
        }
        @keyframes territoryGlowPurple {
          0%, 100% { box-shadow: 0 0 8px rgba(127,119,221,0.3); }
          50% { box-shadow: 0 0 22px rgba(127,119,221,0.7); }
        }
        @keyframes newBadgePop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-blue-dot {
          animation: blueDot 2s ease-in-out infinite;
        }
        .animate-hiring-pulse {
          animation: pulse 2.5s ease-in-out infinite;
        }
        .route-path-animated {
          stroke-dasharray: 400;
          animation: routeAnim 2.5s linear infinite;
        }
        .territory-blue {
          animation: territoryGlowBlue 3s ease-in-out infinite;
        }
        .territory-green {
          animation: territoryGlowGreen 3.5s ease-in-out infinite;
        }
        .territory-purple {
          animation: territoryGlowPurple 4s ease-in-out infinite;
        }
        .territory-glow {
          animation: territoryGlow 3s ease-in-out infinite;
        }
        .new-badge-pop {
          animation: newBadgePop 1.5s ease-in-out infinite;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Map size={18} className="text-accent" />
          </div>
          <div className="min-w-0">
            <h1 className="app-page-title text-primary truncate">CareerMap</h1>
            <p className="app-module-subtitle text-muted-foreground line-clamp-1">
              Your entire career universe, mapped. Navigate it like you've never been lost.
            </p>
          </div>
        </div>

        {/* Nudge Location Pin Button (Google Maps Turn on Location simulation) */}
        {!selfGraphCompleted && (
          <Button 
            onClick={() => setSelfGraphCompleted(true)}
            variant="outline" 
            size="sm"
            className="text-[10px] sm:text-xs gap-1.5 border-[#3B8BD4] text-[#185FA5] hover:bg-[#E6F1FB] h-8 rounded-full"
          >
            <Compass size={12} className="animate-spin" /> Enable SelfGraph GPS Dot
          </Button>
        )}
      </div>

      {/* Main Canvas Device App Shell Wrapper */}
      <div className="w-full rounded-2xl border border-border bg-slate-100 dark:bg-slate-950 shadow-2xl relative">
        {/* Floating Map Status Overlay */}
        <div 
          className="absolute bottom-6 left-4 z-[70] bg-background/95 shadow-lg rounded-xl border border-border px-3 py-2 flex items-center gap-2 max-w-xs sm:max-w-md backdrop-blur-sm pointer-events-auto select-none transition-all duration-300"
          onMouseDown={(e) => e.stopPropagation()}
          onMouseMove={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <Activity size={14} className={dataLoading ? "text-primary animate-spin" : "text-emerald-500"} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-foreground">
              {dataLoading ? "Indexing Careers..." : "Map Engine Online"}
            </span>
            <span className="text-[8.5px] text-muted-foreground leading-none mt-0.5">
              {dataStatus} • {rolesInViewportCount} visible in viewport
            </span>
          </div>
        </div>

        <div 
          ref={mapContainerRef}
          className="w-full relative bg-[#e8f0e4] dark:bg-[#111612] h-[calc(100vh-200px)] min-h-[600px] select-none rounded-2xl"
          style={{ 
            cursor: isPanning 
              ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23000000' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M10 14V9.5a1.5 1.5 0 0 1 3 0V11a.5.5 0 0 0 1 0V9.5a1.5 1.5 0 0 1 3 0V11a.5.5 0 0 0 1 0V9.5a1.5 1.5 0 0 1 3 0V14a8 8 0 0 1-16 0v-5a1.5 1.5 0 0 1 3 0V14a.5.5 0 0 0 1 0z'/%3E%3C/svg%3E\") 12 12, grabbing"
              : "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23000000' stroke='%23ffffff' stroke-width='1.5'%3E%3Cpath d='M10 14V2.5a1.5 1.5 0 0 1 3 0V11a.5.5 0 0 0 1 0v-1.5a1.5 1.5 0 0 1 3 0V11a.5.5 0 0 0 1 0V8.5a1.5 1.5 0 0 1 3 0V14a8 8 0 0 1-16 0v-5a1.5 1.5 0 0 1 3 0V14a.5.5 0 0 0 1 0z'/%3E%3C/svg%3E\") 12 12, grab",
            touchAction: "none",
            '--map-pan-x': `${panOffset.x}px`,
            '--map-pan-y': `${panOffset.y}px`,
            '--map-zoom': `${zoomScale}`
          } as React.CSSProperties}
          onMouseDown={(e) => {
            if (e.button === 0) {
              setIsPanning(true);
              panStartRef.current = { x: e.clientX - visualTransform.current.x, y: e.clientY - visualTransform.current.y };
            }
          }}
          onMouseMove={(e) => {
            if (isPanning) {
              const newX = e.clientX - panStartRef.current.x;
              const newY = e.clientY - panStartRef.current.y;
              updateMapTransform(visualTransform.current.scale, newX, newY);
              scheduleStateUpdate(visualTransform.current.scale, newX, newY);
            }
          }}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
          onDoubleClick={(e) => {
            // Do not zoom if clicking inside an interactive overlay
            if ((e.target as HTMLElement).closest('.pointer-events-auto')) {
              return;
            }
            
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            
            // Double click zooms in by 1.6x, Shift+double click zooms out by 1.6x
            const zoomFactor = e.shiftKey ? 1 / 1.6 : 1.6;
            const prevZoom = visualTransform.current.scale;
            const newZoom = Math.min(Math.max(prevZoom * zoomFactor, 0.04), 12.0);
            
            const prevPan = visualTransform.current;
            const newX = clickX - (clickX - prevPan.x) * (newZoom / prevZoom);
            const newY = clickY - (clickY - prevPan.y) * (newZoom / prevZoom);
            
            updateMapTransform(newZoom, newX, newY);
            
            setZoomScale(newZoom);
            setPanOffset({ x: newX, y: newY });
          }}
        >
          {/* Inner Map Viewport to clip the map components */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl z-0">
            {/* 11. Buildings (Roles - 18,000+ points drawn via GPU in screen-space) */}
            <canvas 
            ref={backgroundCanvasRef}
            width={viewportSize.w} 
            height={viewportSize.h} 
            className="absolute inset-0 z-0 pointer-events-none"
          />
          
          {/* MAP CANVAS CONTAINER */}
          <div 
            id="career-map-canvas"
            ref={mapCanvasRef}
            className="w-full h-full absolute inset-0"
            style={{ 
              transform: `translate(${visualTransform.current.x}px, ${visualTransform.current.y}px) scale(${visualTransform.current.scale})`,
              transformOrigin: "0 0"
            }}
          >
            {/* The KSAO Sector Convex Hulls (Continents & Countries) */}
            <svg 
              className="absolute z-0 pointer-events-none" 
              width={WORLD_W} 
              height={WORLD_H} 
              style={{ left: 0, top: 0, overflow: "visible" }}
            >
              {/* 8. Job Families and Streets (SVG Road Network) */}
              {showRoads && roads && roads.map((road, i) => {
                const col = getCategoryColor(road.category);
                return (
                  <path
                    key={`road-${i}`}
                    d={road.path}
                    fill="none"
                    stroke={col.border}
                    strokeWidth={4 * invZoom}
                    strokeOpacity={roadsOpacity}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}

              {/* 1. Continents (Sectors) */}
              {showContinent && sectorHulls.map((hull, i) => {
                const col = getCategoryColor(hull.category);
                const opacity = continentOpacity;
                const borderOpacity = continentOpacity;
                return (
                  <g key={`continent-${i}`}>
                    <polygon 
                      points={hull.polygon}
                      fill={col.bg}
                      fillOpacity={0.03 * opacity}
                      stroke={col.border}
                      strokeWidth={8 * invZoom}
                      strokeOpacity={borderOpacity}
                    />
                    <circle cx={hull.center.x} cy={hull.center.y - 35 * invZoom} r={18 * invZoom} fill={col.border} opacity={opacity} />
                    <text x={hull.center.x} y={hull.center.y - 35 * invZoom} fontSize={20 * invZoom} textAnchor="middle" dominantBaseline="central" opacity={opacity}>🌍</text>
                    <text
                      x={hull.center.x}
                      y={hull.center.y}
                      fill={col.border}
                      opacity={opacity}
                      fontSize={24 * invZoom}
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none", textShadow: "0px 0px 4px rgba(255,255,255,0.8)", transition: "opacity 0.3s" }}
                    >
                      {col.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}
              
              {/* 2. Countries (Sub-Sectors) */}
              {showCountry && countryHulls.map((hull, i) => {
                const col = getCategoryColor(hull.category);
                const opacity = countryOpacity;
                const borderOpacity = countryOpacity;
                return (
                  <g key={`country-${i}`}>
                    <polygon 
                      points={hull.polygon}
                      fill={col.bg}
                      fillOpacity={0.04 * opacity}
                      stroke={col.border}
                      strokeWidth={5 * invZoom}
                      strokeOpacity={borderOpacity}
                      strokeDasharray={`${15 * invZoom} ${15 * invZoom}`}
                    />
                    <circle cx={hull.center.x} cy={hull.center.y - 25 * invZoom} r={14 * invZoom} fill={col.border} opacity={opacity} />
                    <text x={hull.center.x} y={hull.center.y - 25 * invZoom} fontSize={15 * invZoom} textAnchor="middle" dominantBaseline="central" opacity={opacity}>🚩</text>
                    <text
                      x={hull.center.x}
                      y={hull.center.y}
                      fill={col.border}
                      opacity={opacity}
                      fontSize={18 * invZoom}
                      fontWeight="800"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none", textShadow: "0px 0px 4px rgba(255,255,255,0.8)", transition: "opacity 0.3s" }}
                    >
                      {hull.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* 3. States (Industry Families) */}
              {showState && stateHulls.map((hull, i) => {
                const col = getCategoryColor(hull.category);
                const opacity = stateOpacity;
                const borderOpacity = stateOpacity;
                return (
                  <g key={`state-${i}`}>
                    <polygon 
                      points={hull.polygon}
                      fill={col.bg}
                      fillOpacity={0.05 * opacity}
                      stroke={col.border}
                      strokeWidth={3 * invZoom}
                      strokeOpacity={borderOpacity}
                      strokeDasharray={`${8 * invZoom} ${8 * invZoom}`}
                    />
                    <circle cx={hull.center.x} cy={hull.center.y - 18 * invZoom} r={10 * invZoom} fill={col.border} opacity={opacity} />
                    <text x={hull.center.x} y={hull.center.y - 18 * invZoom} fontSize={11 * invZoom} textAnchor="middle" dominantBaseline="central" opacity={opacity}>🏛️</text>
                    <text
                      x={hull.center.x}
                      y={hull.center.y}
                      fill={col.border}
                      opacity={opacity}
                      fontSize={14 * invZoom}
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none", textShadow: "0px 0px 4px rgba(255,255,255,0.8)", transition: "opacity 0.3s" }}
                    >
                      {hull.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* 4. Counties (Industry Name) */}
              {showCounty && countyHulls.map((hull, i) => {
                const col = getCategoryColor(hull.category);
                const opacity = countyOpacity;
                const borderOpacity = countyOpacity;
                return (
                  <g key={`county-${i}`}>
                    <polygon 
                      points={hull.polygon}
                      fill={col.bg}
                      fillOpacity={0.06 * opacity}
                      stroke={col.border}
                      strokeWidth={2 * invZoom}
                      strokeOpacity={borderOpacity}
                      strokeDasharray={`${6 * invZoom} ${6 * invZoom}`}
                    />
                    <circle cx={hull.center.x} cy={hull.center.y - 16 * invZoom} r={9 * invZoom} fill={col.border} opacity={opacity} />
                    <text x={hull.center.x} y={hull.center.y - 16 * invZoom} fontSize={10 * invZoom} textAnchor="middle" dominantBaseline="central" opacity={opacity}>🗺️</text>
                    <text
                      x={hull.center.x}
                      y={hull.center.y}
                      fill={col.border}
                      opacity={opacity}
                      fontSize={13 * invZoom}
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none", textShadow: "0px 0px 4px rgba(255,255,255,0.8)", transition: "opacity 0.3s" }}
                    >
                      {hull.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* 5. Cities (Domains) */}
              {showCity && cityHulls.map((hull, i) => {
                const col = getCategoryColor(hull.category);
                const opacity = cityOpacity;
                const borderOpacity = cityOpacity;
                return (
                  <g key={`city-${i}`}>
                    <polygon 
                      points={hull.polygon}
                      fill={col.bg}
                      fillOpacity={0.07 * opacity}
                      stroke={col.border}
                      strokeWidth={1.5 * invZoom}
                      strokeOpacity={borderOpacity}
                      strokeDasharray={`${4 * invZoom} ${4 * invZoom}`}
                    />
                    <circle cx={hull.center.x} cy={hull.center.y - 14 * invZoom} r={8 * invZoom} fill={col.border} opacity={opacity} />
                    <text x={hull.center.x} y={hull.center.y - 14 * invZoom} fontSize={9 * invZoom} textAnchor="middle" dominantBaseline="central" opacity={opacity}>🏙️</text>
                    <text
                      x={hull.center.x}
                      y={hull.center.y}
                      fill={col.border}
                      opacity={opacity}
                      fontSize={12 * invZoom}
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none", textShadow: "0px 0px 4px rgba(255,255,255,0.8)", transition: "opacity 0.3s" }}
                    >
                      {hull.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* 6. Boroughs (Sub-Domains) */}
              {showBorough && boroughHulls.map((hull, i) => {
                const col = getCategoryColor(hull.category);
                const opacity = boroughOpacity;
                const borderOpacity = boroughOpacity;
                return (
                  <g key={`borough-${i}`}>
                    <polygon 
                      points={hull.polygon}
                      fill={col.bg}
                      fillOpacity={0.08 * opacity}
                      stroke={col.border}
                      strokeWidth={1.2 * invZoom}
                      strokeOpacity={borderOpacity}
                      strokeDasharray={`${3 * invZoom} ${3 * invZoom}`}
                    />
                    <circle cx={hull.center.x} cy={hull.center.y - 12 * invZoom} r={7 * invZoom} fill={col.border} opacity={opacity} />
                    <text x={hull.center.x} y={hull.center.y - 12 * invZoom} fontSize={8 * invZoom} textAnchor="middle" dominantBaseline="central" opacity={opacity}>🚇</text>
                    <text
                      x={hull.center.x}
                      y={hull.center.y}
                      fill={col.border}
                      opacity={opacity}
                      fontSize={11 * invZoom}
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none", textShadow: "0px 0px 4px rgba(255,255,255,0.8)", transition: "opacity 0.3s" }}
                    >
                      {hull.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* 7. Neighborhoods (Functions) */}
              {showNeighborhood && neighborhoodHulls.map((hull, i) => {
                const col = getCategoryColor(hull.category);
                const opacity = neighborhoodOpacity;
                const borderOpacity = neighborhoodOpacity;
                return (
                  <g key={`neighborhood-${i}`}>
                    <polygon 
                      points={hull.polygon}
                      fill={col.bg}
                      fillOpacity={0.09 * opacity}
                      stroke={col.border}
                      strokeWidth={1 * invZoom}
                      strokeOpacity={borderOpacity}
                    />
                    <circle cx={hull.center.x} cy={hull.center.y - 10 * invZoom} r={6 * invZoom} fill={col.border} opacity={opacity} />
                    <text x={hull.center.x} y={hull.center.y - 10 * invZoom} fontSize={7 * invZoom} textAnchor="middle" dominantBaseline="central" opacity={opacity}>🏘️</text>
                    <text
                      x={hull.center.x}
                      y={hull.center.y}
                      fill={col.border}
                      opacity={opacity}
                      fontSize={10 * invZoom}
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none", textShadow: "0px 0px 4px rgba(255,255,255,0.8)", transition: "opacity 0.3s" }}
                    >
                      {hull.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* 9. Campuses (Career Clusters) */}
              {showCampus && campusHulls.map((hull, i) => {
                const col = getCategoryColor(hull.category);
                const opacity = campusOpacity;
                const borderOpacity = campusOpacity;
                return (
                  <g key={`campus-${i}`}>
                    <polygon 
                      points={hull.polygon}
                      fill={col.bg}
                      fillOpacity={0.1 * opacity}
                      stroke={col.border}
                      strokeWidth={1 * invZoom}
                      strokeOpacity={borderOpacity}
                    />
                    <circle cx={hull.center.x} cy={hull.center.y - 8 * invZoom} r={5 * invZoom} fill={col.border} opacity={opacity} />
                    <text x={hull.center.x} y={hull.center.y - 8 * invZoom} fontSize={6 * invZoom} textAnchor="middle" dominantBaseline="central" opacity={opacity}>🏢</text>
                    <text
                      x={hull.center.x}
                      y={hull.center.y}
                      fill={col.border}
                      opacity={opacity}
                      fontSize={9 * invZoom}
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none", textShadow: "0px 0px 4px rgba(255,255,255,0.8)", transition: "opacity 0.3s" }}
                    >
                      {hull.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* 10. Buildings (Career Pathways) */}
              {showBuilding && buildingHulls.map((hull, i) => {
                const col = getCategoryColor(hull.category);
                const opacity = buildingOpacity;
                const borderOpacity = buildingOpacity;
                return (
                  <g key={`building-${i}`}>
                    <polygon 
                      points={hull.polygon}
                      fill={col.bg}
                      fillOpacity={0.12 * opacity}
                      stroke={col.border}
                      strokeWidth={0.8 * invZoom}
                      strokeOpacity={borderOpacity}
                    />
                    <circle cx={hull.center.x} cy={hull.center.y - 6 * invZoom} r={4 * invZoom} fill={col.border} opacity={opacity} />
                    <text x={hull.center.x} y={hull.center.y - 6 * invZoom} fontSize={5 * invZoom} textAnchor="middle" dominantBaseline="central" opacity={opacity}>🏢</text>
                    <text
                      x={hull.center.x}
                      y={hull.center.y}
                      fill={col.border}
                      opacity={opacity}
                      fontSize={8 * invZoom}
                      fontWeight="500"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ pointerEvents: "none", textShadow: "0px 0px 4px rgba(255,255,255,0.8)", transition: "opacity 0.3s" }}
                    >
                      {hull.name.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* 📍 THE BLUE DOT: User's exact KSAO location */}
            <div 
              className="absolute z-50 pointer-events-none"
              style={{
                top: `${userLocation.y}px`,
                left: `${userLocation.x}px`,
                transform: `translate(-50%, -50%) scale(${invZoom})`,
                transformOrigin: "center"
              }}
            >
              <div className="relative flex items-center justify-center">
                {/* Radar ping animation */}
                <div className="absolute w-24 h-24 bg-blue-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute w-12 h-12 bg-blue-500/40 rounded-full animate-pulse" />
                {/* Core pin */}
                <div className="w-6 h-6 bg-[#4285F4] border-2 border-white rounded-full shadow-[0_0_15px_rgba(66,133,244,0.6)] flex items-center justify-center z-10">
                  <User size={12} className="text-white" />
                </div>
                {/* Floating Label */}
                <div className="absolute top-8 whitespace-nowrap bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-lg font-body text-xs font-bold text-foreground">
                  You Are Here
                  <span className="block text-[9px] font-normal text-muted-foreground mt-0.5 opacity-80 text-center uppercase tracking-widest">
                    {userLocation.primarySector} SECTOR
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Real Role Pins (Google Maps Semantic LOD) */}
            {zoomScale > 0.3 && visiblePins.map((pin) => {
              const isSelected = selectedRole.id === pin.id;
              const isSaved = isRoleSaved(pin.id);
              const col = getCategoryColor(pin.category);

              // Semantic LOD Zoom Levels
              const isTinyZoom = zoomScale > 0.3 && zoomScale <= 0.6;

              // Base styling
              const pinBg = col.border;
              const borderStyles = isSelected ? "border-[#FF3B30] border-4 scale-110 animate-pulse" : "border-white/90 border-[1.5px]";

              // Icon selector
              const categoryLower = pin.category?.toLowerCase() || "";
              const renderIcon = (size: number) => {
                if (categoryLower.includes("tech")) return <Code size={size} className="text-white" />;
                if (categoryLower.includes("health")) return <Stethoscope size={size} className="text-white" />;
                if (categoryLower.includes("creative")) return <Paintbrush size={size} className="text-white" />;
                if (categoryLower.includes("finance")) return <Coins size={size} className="text-white" />;
                if (categoryLower.includes("law")) return <Scale size={size} className="text-white" />;
                if (categoryLower.includes("education")) return <BookOpen size={size} className="text-white" />;
                if (categoryLower.includes("government")) return <Building2 size={size} className="text-white" />;
                if (categoryLower.includes("agri")) return <Leaf size={size} className="text-white" />;
                return <Briefcase size={size} className="text-white" />;
              };

              // LEVEL 1: Tiny interactive dots (similar to neighborhood POIs)
              if (isTinyZoom) {
                return (
                  <div
                    key={`dynamic-${pin.id}`}
                    className="absolute cursor-pointer transition-transform duration-100 z-20 group"
                    style={{
                      top: `${pin.worldY}px`,
                      left: `${pin.worldX}px`,
                      transform: `translate(-50%, -50%) scale(${1 / zoomScale})`
                    }}
                    onClick={() => handleOpenRole(pin.id, pin, true)}
                  >
                    <div 
                      className={`w-3 h-3 rounded-full shadow-sm hover:scale-150 transition-transform`} 
                      style={{ 
                        backgroundColor: pinBg,
                        border: isSelected ? "2px solid #FF3B30" : "1px solid rgba(255,255,255,0.7)"
                      }} 
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#2c2c2a] bg-white/95 px-1.5 py-0.5 rounded shadow border border-black/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {pin.name}
                    </div>
                  </div>
                );
              }

              // LEVEL 2 & 3: Icons and Icons + Text (CONSTANT SIZE)
              return (
                <div
                  key={`dynamic-${pin.id}`}
                  className="absolute flex flex-col items-center cursor-pointer transition-all duration-150 z-20 group"
                  style={{
                    top: `${pin.worldY}px`,
                    left: `${pin.worldX}px`,
                    transform: `translate(-50%, -50%) scale(${1 / zoomScale})`
                  }}
                  onClick={() => handleOpenRole(pin.id, pin, true)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                    if (rect) {
                      setContextMenu({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                        roleId: pin.id
                      });
                    }
                  }}
                >
                  <div 
                    className={`rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform ${borderStyles} w-7 h-7`} 
                    style={{ backgroundColor: pinBg }}
                  >
                    {renderIcon(12)}
                  </div>
                  
                  {/* Constant permanent text label */}
                  <div className={`flex items-center gap-0.5 font-bold text-[#2c2c2a] bg-white/95 px-1.5 py-0.5 rounded shadow border border-black/10 mt-1 whitespace-nowrap transition-opacity text-[8.5px] opacity-100`}>
                    {pin.name}
                    {isSaved && <Star size={8} className="text-amber-500 fill-amber-500 ml-0.5" />}
                  </div>
                </div>
              );
            })}

            {/* Emerging Role Pins — spec L301–302, L467: "New" badge on AI Prompt Engineer, Sustainability Consultant */}
            {zoomScale > 0.3 && [
              { label: "AI Prompt Engineer", x: 340, y: 80, color: "#7C3AED" },
              { label: "Sustainability Consultant", x: 560, y: 145, color: "#059669" }
            ].map((emerging, i) => (
              <div
                key={`emerging-${i}`}
                className="absolute flex flex-col items-center cursor-pointer z-20"
                style={{ 
                  top: emerging.y, 
                  left: emerging.x, 
                  transform: `scale(${invZoom})`, 
                  transformOrigin: "top left" 
                }}
                onClick={() => alert(`${emerging.label}\n\nThis is an emerging role that appeared in the last 2 years. Full data coming soon.`)}
              >
                <div className="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center" style={{ backgroundColor: emerging.color }}>
                  <Sparkles size={13} className="text-white" />
                </div>
                <div className="flex items-center gap-1 text-[8px] font-bold text-[#2c2c2a] bg-white/95 px-1.5 py-0.5 rounded shadow border border-black/10 mt-1 whitespace-nowrap">
                  {emerging.label}
                  <span className={`text-[7px] font-black text-white bg-emerald-500 px-1 rounded ${!neurodivergentMode ? "new-badge-pop" : ""}`}>NEW</span>
                </div>
              </div>
            ))}

            {/* Exam Gate Toll-Booth Pins */}
            {zoomScale > 0.3 && (
              <>
                <div 
                  className="absolute bg-[#E24B4A] hover:scale-105 text-white text-[9px] font-medium py-1 px-2 rounded-md shadow border border-[#791F1F] z-30 cursor-pointer flex items-center gap-1 select-none"
                  style={{ top: "148px", left: "222px", transform: `scale(${invZoom})`, transformOrigin: "top left" }}
                  onClick={() => handleOpenRole("doctor")}
                >
                  <span className="w-3 h-3 bg-white text-[#E24B4A] rounded-sm font-bold text-[8px] flex items-center justify-center">G</span>
                  NEET Gate
                </div>
                <div 
                  className="absolute bg-[#E24B4A] hover:scale-105 text-white text-[9px] font-medium py-1 px-2 rounded-md shadow border border-[#791F1F] z-30 cursor-pointer flex items-center gap-1 select-none"
                  style={{ top: "148px", left: "50px", transform: `scale(${invZoom})`, transformOrigin: "top left" }}
                  onClick={() => handleOpenRole("swengineer")}
                >
                  <span className="w-3 h-3 bg-white text-[#E24B4A] rounded-sm font-bold text-[8px] flex items-center justify-center">G</span>
                  JEE Gate
                </div>
                <div 
                  className="absolute bg-[#E24B4A] hover:scale-105 text-white text-[9px] font-medium py-1 px-2 rounded-md shadow border border-[#791F1F] z-30 cursor-pointer flex items-center gap-1 select-none"
                  style={{ top: "148px", left: "400px", transform: `scale(${invZoom})`, transformOrigin: "top left" }}
                  onClick={() => handleOpenRole("lawyer")}
                >
                  <span className="w-3 h-3 bg-white text-[#E24B4A] rounded-sm font-bold text-[8px] flex items-center justify-center">G</span>
                  CLAT Gate
                </div>
                <div 
                  className="absolute bg-[#E24B4A] hover:scale-105 text-white text-[9px] font-medium py-1 px-2 rounded-md shadow border border-[#791F1F] z-30 cursor-pointer flex items-center gap-1 select-none"
                  style={{ top: "148px", left: "298px", transform: `scale(${invZoom})`, transformOrigin: "top left" }}
                  onClick={() => handleOpenRole("ias")}
                >
                  <span className="w-3 h-3 bg-white text-[#E24B4A] rounded-sm font-bold text-[8px] flex items-center justify-center">G</span>
                  UPSC Gate
                </div>
              </>
            )}

            {/* Co-Explore Mode simulation cursor pointer */}
            {zoomScale > 0.3 && coExploreActive && (
              <div 
                className="absolute z-40 flex flex-col items-start transition-all duration-700 pointer-events-none animate-bounce"
                style={{ 
                  top: `${coExploreCursor.y}px`, 
                  left: `${coExploreCursor.x}px`,
                  transform: `scale(${invZoom})`,
                  transformOrigin: "top left"
                }}
              >
                <div className="flex items-center gap-1">
                  <Navigation size={12} className="text-red-600 fill-red-600 rotate-[135deg]" />
                  <span className="bg-red-600 text-white text-[8px] font-black px-1 py-0.5 rounded shadow whitespace-nowrap">
                    Mentor (Sneha G.)
                  </span>
                </div>
                <div className="mt-1 bg-white dark:bg-slate-900 border border-red-300 text-foreground text-[9.5px] p-2 rounded-xl rounded-tl-none shadow-lg max-w-[160px] leading-tight">
                  {coExploreCursor.message}
                </div>
              </div>
            )}

            {/* SelfGraph location indicator: Pulsing Blue Dot or Incognito grey dot */}
            {zoomScale > 0.3 && selfGraphCompleted && (
              <div 
                className={`absolute w-5 h-5 border-2 border-white rounded-full cursor-pointer z-20 shadow-md flex items-center justify-center ${
                  isIncognito ? "bg-neutral-600" : "bg-[#3B8BD4] " + (neurodivergentMode ? "" : "animate-blue-dot")
                }`}
                style={{ 
                  top: "242px", 
                  left: "175px",
                  transform: `translate(-50%, -50%) scale(${invZoom})`,
                  transformOrigin: "center"
                }}
                title={isIncognito ? "Incognito mode: Centroid coordinates private" : "You are here (SelfGraph Centroid)"}
                onClick={() => {
                  alert(isIncognito ? "GPS Centroid tracking is paused in Incognito Mode." : "SelfGraph Vector: coordinates (175, 242) representing Commerce & Analytics curiosity focus.");
                }}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </div>

          {/* Right-Click Context Menu Overlay */}
          {contextMenu && (
              <div
                className="absolute z-50 bg-background border border-border rounded-xl shadow-2xl overflow-hidden w-44"
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onMouseLeave={() => setContextMenu(null)}
              >
                {(() => {
                  const role = ROLE_DETAILS_MOCK[contextMenu.roleId];
                  if (!role) return null;
                  return (
                    <>
                      <div className="px-3 py-2 border-b border-border bg-muted/30">
                        <span className="font-bold text-[11px] text-foreground block truncate">{role.name}</span>
                        <span className="text-[9.5px] text-muted-foreground">{role.category}</span>
                      </div>
                      {[
                        { label: "📋 Open Role Details", action: () => { handleOpenRole(role.id); setContextMenu(null); } },
                        { label: "🗺️ Plan My Path", action: () => { handleOpenRole(role.id); setSidebarMode("pathfinder"); setSelectedRoleOpen(true); setContextMenu(null); toast.success(`PathFinder opened for ${role.name}`); } },
                        { label: "🧭 Get Directions", action: () => { handleOpenRole(role.id); setSidebarMode("pathfinder"); setContextMenu(null); } },
                        { label: isRoleSaved(role.id) ? "🔖 Unsave Role" : "🔖 Save to Dream Board", action: () => { toggleSaveRole(role.id); setContextMenu(null); } },
                        { label: "📊 Add to Comparison", action: () => { setComparisonSlots(prev => { if (prev.includes(role.id)) return prev; if (prev.length >= 4) { toast.error("Max 4 roles. Remove one first."); return prev; } toast.success(`${role.name} added to comparison.`); return [...prev, role.id]; }); setSidebarMode("comparison"); setSelectedRoleOpen(true); setContextMenu(null); } },
                        { label: "🔗 Share Role", action: () => { const url = `${window.location.origin}/dashboard/careermap?role=${role.id}`; navigator.clipboard?.writeText(url).catch(() => {}); toast.success(`Link for "${role.name}" copied to clipboard!`); setContextMenu(null); } },
                        { label: "🖼️ Embed Widget", action: () => { setEmbedTargetRoleId(role.id); setEmbedModalOpen(true); setContextMenu(null); } },
                        { 
                          label: measureDistancePoints.length > 0 ? "📏 Measure to here" : "📏 Measure Distance", 
                          action: () => {
                            if (measureDistancePoints.length === 0) {
                              setMeasureDistancePoints([role.id]);
                              toast.info(`Start node: ${role.name}. Right-click another career to measure distance.`);
                            } else {
                              const pts = [...measureDistancePoints, role.id];
                              setMeasureDistancePoints(pts);
                              setShowMeasureDistanceDialog(true);
                            }
                            setContextMenu(null);
                          } 
                        }
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={item.action}
                          className="ghost w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted transition-colors block"
                        >
                          {item.label}
                        </button>
                      ))}
                    </>
                  );
                })()}
              </div>
            )}
          </div>





          {/* FLOATING MAP CONTROLS: LAYERS & ZOOM (Spec L555-557, L843, L1114-1122) */}
          <div 
            className="absolute bottom-8 right-4 z-[70] flex flex-col gap-3 items-end pointer-events-auto"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseMove={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <style dangerouslySetInnerHTML={{ __html: `
              .myraaha-app button.force-black-icon, 
              .myraaha-app button.force-white-icon {
                min-height: 0px !important;
                min-width: 0px !important;
                padding: 0px !important;
                width: 28px !important;
                height: 28px !important;
              }
              .myraaha-app button.force-black-icon svg, 
              .myraaha-app button.force-white-icon svg {
                flex-shrink: 0 !important;
                width: 14px !important;
                height: 14px !important;
              }
              .force-black-icon, .force-black-icon svg, .force-black-icon svg * {
                color: #000000 !important;
                stroke: #000000 !important;
              }
              .dark .force-black-icon, .dark .force-black-icon svg, .dark .force-black-icon svg * {
                color: #000000 !important;
                stroke: #000000 !important;
              }
              .force-white-icon, .force-white-icon svg, .force-white-icon svg * {
                color: #ffffff !important;
                stroke: #ffffff !important;
              }
              .dark .force-white-icon, .dark .force-white-icon svg, .dark .force-white-icon svg * {
                color: #ffffff !important;
                stroke: #ffffff !important;
              }
            `}} />
            
            {/* Layers Button */}
            <div className="relative">
              <button 
                onClick={() => setLayersPanelOpen(!layersPanelOpen)}
                className="w-7 h-7 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer force-black-icon"
                title="Map Layers"
              >
                <Layers size={14} color="#000000" className="text-black" style={{ color: '#000000', stroke: '#000000' }} />
              </button>
              
              {/* Layers Popover Card */}
              {layersPanelOpen && (
                <div className="absolute right-0 bottom-12 bg-background border border-border rounded-2xl shadow-2xl p-4 w-60 space-y-3 z-50 text-xs text-foreground">
                  <div className="flex justify-between items-center border-b border-border pb-2">
                    <span className="font-bold text-xs flex items-center gap-1.5"><Layers size={13} className="text-[#3B8BD4]" /> Map Intelligence Layers</span>
                    <button 
                      onClick={() => setLayersPanelOpen(false)}
                      className="ghost p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {[
                      { key: "salaryHeat", label: "📊 Salary Heat Map", desc: "Red (hot) to Blue (cool)" },
                      { key: "hiringDemand", label: "📈 Hiring Demand", desc: "Glow indicators for market load" },
                      { key: "careerClusters", label: "🌉 Career Clusters Bridges", desc: "Show overlapping transfer paths" },
                      { key: "automationRisk", label: "🤖 Automation Risk", desc: "AI impact risk levels" },
                      { key: "remoteFriendly", label: "🌐 Remote-Friendly", desc: "Highlight work-from-home roles" },
                      { key: "entryBarrier", label: "🚪 Entry Barrier Borders", desc: "Solid/Dashed degree mandatory" },
                      { key: "matchScore", label: "🎯 Match Score Scaling", desc: "Scale pins based on match %" },
                      { key: "tier3Accessible", label: "🏙️ Tier 3/4 Accessible", desc: "Roles matching regional nodes" },
                      { key: "fundingActivity", label: "💰 Funding Activity", desc: "Startup venture indicators" }
                    ].map((layer) => (
                      <label 
                        key={layer.key} 
                        className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <input 
                          type="checkbox" 
                          checked={activeLayers[layer.key as keyof typeof activeLayers]}
                          onChange={() => toggleLayer(layer.key as keyof typeof activeLayers)}
                          className="mt-0.5 accent-[#3B8BD4]"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold block leading-tight">{layer.label}</span>
                          <span className="text-[9.5px] text-muted-foreground leading-none">{layer.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleRecenterMap}
              className="w-7 h-7 bg-white border border-slate-200 rounded-full shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer force-black-icon"
              title="Recenter Map"
            >
              <Compass size={14} color="#000000" className="text-black" style={{ color: '#000000', stroke: '#000000' }} />
            </button>

            {/* Zoom Controls Vertical Group */}
            <div className="bg-background border border-border rounded-xl shadow-md flex flex-col overflow-hidden">
              <button 
                onClick={() => handleZoomButton("in")}
                className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors border-b border-border font-bold text-sm cursor-pointer animate-none"
                title="Zoom In"
              >
                +
              </button>
              <button 
                onClick={() => handleZoomButton("out")}
                className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors font-bold text-sm cursor-pointer animate-none"
                title="Zoom Out"
              >
                −
              </button>
            </div>
          </div>

          {/* OFFLINE MODE TOP WARNING BANNER (Spec L1531-1543) */}
          {isOfflineMode && (
            <div 
              className="absolute top-3 left-1/2 -translate-x-1/2 z-50 bg-[#FFF9E6] dark:bg-amber-950/90 border border-amber-300 dark:border-amber-900 rounded-2xl p-3 shadow-2xl flex items-center gap-3 w-80 md:w-96 pointer-events-auto text-xs animate-in slide-in-from-top-4 duration-200"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <span className="text-lg">⚠️</span>
              <div className="flex-1">
                <span className="font-bold text-amber-900 dark:text-amber-300 block">OFFLINE MODE ACTIVE</span>
                <span className="text-[10px] text-amber-800 dark:text-amber-400 block mt-0.5 font-medium">Viewing cached data (last updated 3 days ago). Live features limited.</span>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setIsOfflineMode(false);
                  toast.success("Connected back online! Real-time hiring pulse updated.");
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] px-2.5 py-1 h-7 rounded-xl border-none font-bold cursor-pointer"
              >
                Connect
              </Button>
            </div>
          )}

          {/* NAVIGATION MODE TOP BANNER */}
          {navigationMode && (
            <div 
              className="absolute top-3 left-3 right-3 z-40 max-w-md bg-[#2d2d2d] p-3.5 rounded-2xl flex items-center gap-3 border border-neutral-800 shadow-2xl"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <div className="w-9 h-9 rounded-full bg-[#3B8BD4] flex items-center justify-center text-white font-bold text-lg animate-bounce">
                <ArrowUp size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-white flex items-center gap-1.5">
                  In 2 weeks <Badge className="bg-[#1D9E75] hover:bg-[#1D9E75] text-white text-[8px] border-none font-semibold">ACTIVE MILESTONE</Badge>
                </div>
                <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                  Module 3: User Research & Figma Wireframing
                </p>
              </div>
              <div className="h-6 w-px bg-neutral-700" />
              <button 
                onClick={() => setNavigationMode(false)}
                className="ghost w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center shrink-0 border border-neutral-700 text-neutral-400"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* TOP HEADER BAR CONTAINER (50% Search & 50% Actions) */}
          {!navigationMode && (
            <div 
              className="absolute top-3 left-3 right-3 z-[70] flex flex-col gap-2 pointer-events-none"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              {/* Row for Search and Actions */}
              <div className="w-full flex gap-3 pointer-events-none">
                {/* Search Bar Container (50% width) */}
                <div className="w-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1 pointer-events-auto shrink-0 relative flex flex-col justify-center min-h-[44px]">
                  <div className="h-10 flex items-center gap-2 px-3.5">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchFocused(true);
                      }}
                      onFocus={() => setSearchFocused(true)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setSearchFocused(false);
                          setSidebarMode("search_results");
                          setSelectedRoleOpen(true);
                        }
                      }}
                      placeholder="Search careers, skills, roles…" 
                      className="flex-1 bg-transparent border-none outline-none text-[13.5px] placeholder:text-muted-foreground/60 text-foreground"
                    />

                    {/* Mic and Visual Search Buttons (Spec L149-154) */}
                    <button 
                      onClick={() => {
                        setVoiceNavigatorOpen(true);
                        setVoiceListening(true);
                        toast.info("Voice Assistant activated. Speak or select a command.");
                      }}
                      className={`ghost p-1 hover:bg-muted rounded-full cursor-pointer ${voiceNavigatorOpen ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`}
                      title="Voice Search (Speak)"
                    >
                      <Volume2 size={16} />
                    </button>
                    
                    <button 
                      onClick={() => {
                        setVisualSearchActive(true);
                        alert("Simulating visual scanner... Scan a resume or skill tree map.");
                        setTimeout(() => {
                          setSearchQuery("UX Designer");
                          setSearchFocused(true);
                          setVisualSearchActive(false);
                        }, 2000);
                      }}
                      className={`ghost p-1 hover:bg-muted rounded-full cursor-pointer ${visualSearchActive ? 'text-[#3B8BD4] animate-bounce' : 'text-muted-foreground'}`}
                      title="Visual Search (Resume Scanner)"
                    >
                      <Search size={16} className="text-muted-foreground" />
                    </button>

                    {searchFocused || searchQuery ? (
                      <button 
                        onClick={() => {
                          setSearchQuery("");
                          setSearchFocused(false);
                        }} 
                        className="ghost p-1 hover:bg-muted rounded-full cursor-pointer"
                      >
                        <X size={16} className="text-muted-foreground" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setSidebarMode("pathfinder");
                          setSelectedRoleOpen(true);
                        }}
                        className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-[#3B8BD4]"
                        title="Plan My Path"
                      >
                        <Navigation size={18} className="rotate-45" />
                      </button>
                    )}
                    
                    <div className="w-px h-6 bg-border mx-1" />

                    {/* Co-Explore Collaborative Mode Toggle (Spec L329-339) */}
                    <button 
                      onClick={() => {
                        const nextState = !coExploreActive;
                        setCoExploreActive(nextState);
                        if (nextState) {
                          alert("Co-Explore Mode Activated!\nMentor Sneha G. has joined your live map session. You will see her virtual cursor pointer.");
                          setCoExploreCursor({ x: 100, y: 120, message: "Sneha G (Mentor): Let's explore the Software Engineer & Startup Founder paths together!" });
                        } else {
                          alert("Co-Explore Mode Deactivated.");
                        }
                      }}
                      className={`ghost p-1 hover:bg-muted rounded-full cursor-pointer ${coExploreActive ? 'text-red-500 bg-red-50 dark:bg-red-950/20' : 'text-muted-foreground'}`}
                      title="Co-Explore with Peer/Mentor"
                    >
                      <Users size={18} />
                    </button>
                    
                    <button 
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="ghost p-1 hover:bg-muted rounded-full cursor-pointer relative"
                      title="SelfGraph Centroid Profile"
                    >
                      <User size={18} className="text-muted-foreground" />
                      {isIncognito && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-neutral-600 border border-white" title="Incognito Mode Active" />
                      )}
                    </button>
                  </div>

                  {isIncognito && (
                    <div className="bg-neutral-900 text-neutral-300 px-3 py-1.5 text-[10px] flex items-center justify-between font-semibold border-t border-neutral-800">
                      <span className="flex items-center gap-1.5">🕶 Incognito Active (Private Browsing)</span>
                      <button 
                        onClick={() => setIsIncognito(false)} 
                        className="ghost text-neutral-400 hover:text-white underline text-[9.5px] cursor-pointer"
                      >
                        Turn Off
                      </button>
                    </div>
                  )}

                  {/* Autocomplete suggestions list */}
                  {searchFocused && (
                    <div className="border-t border-border/40 mt-1 max-h-[220px] overflow-y-auto">
                      {filteredSuggestions.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            if (item.isRole && item.x !== undefined && item.y !== undefined) {
                              handleOpenRole(item.key);
                            } else if ((item.isGeo || item.isRoad) && item.x !== undefined && item.y !== undefined) {
                              // Pan and Zoom to the geo/road coordinate!
                              const targetZoom = item.level === "continent" ? 0.25 
                                               : item.level === "country" ? 0.5
                                               : item.level === "state" ? 0.75
                                               : item.level === "county" ? 1.1
                                               : item.level === "city" ? 1.6
                                               : item.level === "borough" ? 2.3
                                               : item.level === "neighborhood" ? 2.9
                                               : item.level === "campus" ? 3.5
                                               : item.level === "building" ? 4.1
                                               : 4.2; // default zoom level for streets/roads
                              
                              const newX = (viewportSize.w / 2) - item.x * targetZoom;
                              const newY = (viewportSize.h / 2) - item.y * targetZoom;
                              
                              updateMapTransform(targetZoom, newX, newY);
                              setZoomScale(targetZoom);
                              setPanOffset({ x: newX, y: newY });
                              toast.success(`Panned to ${item.name} (${item.type})`);
                            } else {
                              // Default category click or other
                              if (item.key === "trending_roles") {
                                setActiveExploreCategory("🔥 Trending Roles");
                                setSidebarMode("explore_category");
                                setSelectedRoleOpen(true);
                              } else if (item.key === "emerging_careers") {
                                setActiveExploreCategory("✨ Emerging Careers");
                                setSidebarMode("explore_category");
                                setSelectedRoleOpen(true);
                              } else if (item.key === "remote_friendly") {
                                setActiveExploreCategory("🌐 Remote-Friendly");
                                setSidebarMode("explore_category");
                                setSelectedRoleOpen(true);
                              } else if (item.key === "no_degree") {
                                setActiveExploreCategory("🎓 No-Degree Paths");
                                setSidebarMode("explore_category");
                                setSelectedRoleOpen(true);
                              } else {
                                handleOpenRole(item.key);
                              }
                            }
                            setSearchFocused(false);
                          }}
                          className="px-4 py-2 hover:bg-muted text-xs cursor-pointer flex items-center justify-between border-b border-border/30 last:border-none"
                        >
                          <span className="font-medium text-foreground">{item.name}</span>
                          <span className="text-muted-foreground text-[10px]">{item.type}</span>
                        </div>
                      ))}
                      {filteredSuggestions.length === 0 && (
                        <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                          No matching locations or roles found
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute top-full right-0 mt-1 w-64 bg-background border border-border rounded-xl shadow-xl pointer-events-auto z-50 overflow-hidden">
                      <div className="p-3 border-b border-border bg-muted/30 flex justify-between items-center">
                        <span className="font-bold text-xs text-foreground">SelfGraph™ Profile</span>
                        <button onClick={() => setProfileMenuOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="p-3 space-y-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#3B8BD4] flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {isIncognito ? "?" : "S"}
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">{isIncognito ? "Incognito Explorer" : "Sara Tarannum"}</span>
                            <span className="text-[10px] text-muted-foreground">GPS: (175, 242) · Commerce + Analytics</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                          {[
                            { label: "Match Avg", val: "82%" },
                            { label: "XP Points", val: `${xpEarned}` },
                            { label: "Saved", val: `${savedRoles.length} roles` }
                          ].map((s, i) => (
                            <div key={i} className="bg-muted/40 rounded-lg p-2 text-center">
                              <span className="font-bold text-foreground block text-[11px]">{s.val}</span>
                              <span className="text-[9px] text-muted-foreground">{s.label}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button
                            onClick={() => {
                              if (!isIncognito) {
                                setIsIncognito(true);
                                setShowIncognitoPrompt(true);
                              } else {
                                setIsIncognito(false);
                              }
                              setProfileMenuOpen(false);
                            }}
                            size="sm"
                            variant="outline"
                            className={`flex-1 h-7 text-[10px] rounded-lg gap-1 ${isIncognito ? "border-neutral-500 text-neutral-600" : ""}`}
                          >
                            {isIncognito ? "🕶 Exit Incognito" : "🕶 Go Incognito"}
                          </Button>
                          <Button
                            onClick={() => { setSidebarMode("settings"); setSelectedRoleOpen(true); setProfileMenuOpen(false); }}
                            size="sm"
                            className="flex-1 bg-[#185FA5] hover:bg-[#114B84] text-white font-bold h-7 rounded-lg text-[10px] cursor-pointer"
                          >
                            Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Container (50% width) - Names removed, icons separated and styled as individual round buttons */}
                <div className="w-1/2 flex items-center justify-start gap-2 pointer-events-auto h-[44px]">
                  {[
                    { icon: <Pin size={14} color="#000000" className="text-black" style={{ color: '#000000', stroke: '#000000' }} />, label: "Pin Role", action: () => { if (selectedRole) toggleSaveRole(selectedRole.id); else alert("Please select a role on the map first to pin it."); } },
                    { icon: <GitCompare size={14} color="#000000" className="text-black" style={{ color: '#000000', stroke: '#000000' }} />, label: "Compare 2 Roles", action: () => { setSidebarMode("comparison"); setSelectedRoleOpen(true); } },
                    { icon: <Navigation size={14} color="#000000" className="rotate-45 text-black" style={{ color: '#000000', stroke: '#000000' }} />, label: "Plan My Path", action: () => { setSidebarMode("pathfinder"); setSelectedRoleOpen(true); } },
                    { icon: <Bell size={14} color="#000000" className="text-black" style={{ color: '#000000', stroke: '#000000' }} />, label: "Alert Me", action: () => { if (selectedRole) alert("You'll be notified when hiring spikes for " + selectedRole.name + " in your city!"); else alert("Please select a role on the map first to set alert."); } }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={btn.action}
                      className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-50 transition-all cursor-pointer force-black-icon"
                      title={btn.label}
                    >
                      {btn.icon}
                    </button>
                  ))}
                  
                  {/* Quick Actions Button */}
                  <button
                    onClick={() => {
                      if (sidebarMode === "menu" && selectedRoleOpen) {
                        setSelectedRoleOpen(false);
                      } else {
                        setSidebarMode("menu");
                        setSelectedRoleOpen(true);
                      }
                    }}
                    className="w-7 h-7 rounded-full bg-[#3B8BD4] hover:bg-[#185FA5] text-white shadow-md flex items-center justify-center transition-all cursor-pointer ml-auto force-white-icon"
                    title="Quick Actions"
                  >
                    <Plus size={14} color="#ffffff" className="text-white" style={{ color: '#ffffff', stroke: '#ffffff' }} />
                  </button>
                </div>
              </div>

              {/* Reorganized Explore Chips container just below Search bar */}
              <div 
                className="w-full flex items-center gap-2 overflow-x-auto scrollbar-hidden pointer-events-auto py-1"
              >
                {[
                  { label: "🔥 Trending Roles", action: () => { setActiveExploreCategory("🔥 Trending Roles"); setSidebarMode("explore_category"); setSelectedRoleOpen(true); } },
                  { label: "📍 High Demand Near Nagpur", action: () => { setActiveExploreCategory("📍 High Demand Near Nagpur"); setSidebarMode("explore_category"); setSelectedRoleOpen(true); } },
                  { label: "✨ Emerging Careers", action: () => { setActiveExploreCategory("✨ Emerging Careers"); setSidebarMode("explore_category"); setSelectedRoleOpen(true); } },
                  { label: "🎓 No-Degree Paths", action: () => { setActiveExploreCategory("🎓 No-Degree Paths"); setSidebarMode("explore_category"); setSelectedRoleOpen(true); const t = activeLayers; setActiveLayers({...t, entryBarrier: !t.entryBarrier}); } },
                  { label: "🌐 Remote-Friendly", action: () => { setActiveExploreCategory("🌐 Remote-Friendly"); setSidebarMode("explore_category"); setSelectedRoleOpen(true); const t = activeLayers; setActiveLayers({...t, remoteFriendly: !t.remoteFriendly}); } },
                  { label: "🏙️ Tier-3 Accessible", action: () => { const t = activeLayers; setActiveLayers({...t, tier3Accessible: !t.tier3Accessible}); } },
                  { label: showAcademicOverlay ? "🚫 Hide Academic Layers" : "🏫 Academic & Exams Layers", action: () => setShowAcademicOverlay(!showAcademicOverlay) }
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={chip.action}
                    className={`shrink-0 backdrop-blur-md border rounded-full px-4 py-2 text-[11px] font-sans font-semibold shadow-md transition-colors duration-100 whitespace-nowrap tracking-wide cursor-pointer ${showAcademicOverlay && chip.label.includes("Academic") ? "bg-[#3B8BD4] text-white border-[#185FA5]" : "bg-white/90 dark:bg-slate-900/90 text-foreground border-slate-200/60 dark:border-slate-800/60 hover:bg-[#E6F1FB] hover:text-[#185FA5]"}`}
                  >
                    {chip.label}
                    {chip.label.includes("Academic") && isLoadingAcademic && " (Loading...)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MAP LOCK BACKDROP — blocks map interaction whenever any card/panel is open */}
          {!navigationMode && selectedRoleOpen && (
            <div 
              className="fixed inset-0 z-[75] bg-slate-950/25 dark:bg-slate-950/45 backdrop-blur-[1px] pointer-events-auto cursor-default"
              onClick={() => setSelectedRoleOpen(false)}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            />
          )}

          {!navigationMode && selectedRoleOpen && !searchFocused && (
            <div 
              ref={detailsCardRef}
              style={getDetailsCardStyle()}
              className={sidebarMode === "detail"
                ? `${isDetailsFullScreen ? "fixed z-[110] inset-0 rounded-none w-full h-full" : "absolute z-[80] rounded-xl"} flex flex-col pointer-events-auto overflow-hidden shadow-2xl min-h-0`
                : sidebarMode === "menu"
                  ? "absolute top-[88px] right-4 bottom-3 w-[380px] max-w-[calc(100vw-2rem)] z-[80] flex flex-col pointer-events-auto"
                  : "absolute top-[122px] left-3 bottom-3 w-[380px] max-w-[calc(100vw-1.5rem)] z-[80] flex flex-col pointer-events-auto"
              }
              onMouseDown={(e) => e.stopPropagation()}
              onMouseMove={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              {/* Sidebar Content Panel */}
              {selectedRoleOpen && !searchFocused && (
                <div className={`w-full flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden min-h-0 h-full ${
                  isDetailsFullScreen && sidebarMode === "detail" ? "rounded-none border-none" : "rounded-xl shadow-2xl"
                }`}>
                  
                  {/* MODE: MENU */}
                  {sidebarMode === "menu" && (
                    <div className="flex flex-col h-full bg-card">
                      <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                        <span className="font-extrabold text-base text-foreground tracking-tight">CareerMap Explorer Menu</span>
                        <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {[
                          { id: "detail", label: "Career Explorer Map", icon: <Map size={15} className="text-[#3B8BD4]" /> },
                          { id: "pathfinder", label: "PathFinder™ Directions", icon: <Navigation size={15} className="text-emerald-500 rotate-45" /> },
                          { id: "autopilot", label: "Career progression autopilot", icon: <Compass size={15} className="text-purple-500" /> },
                          { id: "foryou", label: "For You Recommendations", icon: <Sparkles size={15} className="text-pink-500" /> },
                          { id: "jobsearch", label: "Live Job Search", icon: <Briefcase size={15} className="text-blue-500" /> },
                          { id: "distance", label: "Distance & Time Calculator", icon: <Clock size={15} className="text-orange-500" /> },
                          { id: "comparison", label: "Compare Roles Side-by-Side", icon: <GitBranch size={15} className="text-cyan-500" /> },
                          { id: "timeline", label: "My Journey Timeline", icon: <Clock size={15} className="text-[#3B8BD4]" /> },
                          { id: "dreamboard", label: "My Dream Board (Saved)", icon: <Bookmark size={15} className="text-amber-500" /> },
                          { id: "realitycheck", label: "Contribute Reality Checks™", icon: <Users size={15} className="text-purple-500" /> },
                          { id: "pioneer", label: "Pioneer Program & Leaderboard", icon: <Award size={15} className="text-amber-500" /> },
                          { id: "pulse", label: "Live Hiring Pulse", icon: <Activity size={15} className="text-rose-500" /> },
                          { id: "settings", label: "CareerMap Settings", icon: <Info size={15} className="text-muted-foreground" /> }
                        ].map(item => (
                          <div 
                            key={item.id}
                            onClick={() => setSidebarMode(item.id as typeof sidebarMode)}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-75 text-xs font-semibold ${
                              sidebarMode === item.id 
                                ? "bg-[#E6F1FB] text-[#185FA5]" 
                                : "text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-border bg-muted/10 text-center space-y-2">
                        <Button 
                          onClick={() => setAddMissingCareerOpen(true)}
                          className="w-full bg-[#185FA5] hover:bg-[#114B84] text-white font-bold h-7 rounded-lg text-[10px] cursor-pointer"
                        >
                          ➕ Add a Missing Career
                        </Button>
                        <span className="text-[10px] text-muted-foreground block">MyRaaha CareerMap v2.1</span>
                      </div>
                    </div>
                  )}

                  {/* MODE: SEARCH RESULTS */}
                  {sidebarMode === "search_results" && (
                    <div className="flex flex-col h-full bg-card">
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5 tracking-tight">
                            🔍 Search Results
                          </span>
                          <span className="text-[9.5px] text-muted-foreground">Showing matches for "{searchQuery}"</span>
                        </div>
                        <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-hidden">
                        {isOfflineMode && (
                          <div className="bg-amber-50 dark:bg-amber-955/15 border border-amber-200 dark:border-amber-900/50 rounded-xl p-2.5 text-[10px] text-amber-850 dark:text-amber-400 font-semibold mb-2">
                            📶 Offline Mode active: showing only downloaded roles (Tech/Saved).
                          </div>
                        )}
                        {Object.values(ROLE_DETAILS_MOCK)
                          .filter(role => {
                            if (isOfflineMode && !isRoleDownloaded(role.id)) return false;
                            return (
                              role.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              role.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              role.description.toLowerCase().includes(searchQuery.toLowerCase())
                            );
                          })
                          .map((role) => (
                            <div 
                              key={role.id}
                              onClick={() => {
                                handleOpenRole(role.id);
                              }}
                              className="border border-border hover:border-[#3B8BD4]/55 rounded-xl p-3 bg-background hover:bg-[#3B8BD4]/5 cursor-pointer transition-all shadow-sm flex gap-3"
                            >
                              {/* Thumbnail preview */}
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden relative">
                                {role.id === "founder" && <Flame size={20} className="text-orange-500" />}
                                {role.id === "pm" && <Layers size={20} className="text-blue-500" />}
                                {role.id === "swengineer" && <Code size={20} className="text-emerald-500" />}
                                {role.id === "designer" && <Paintbrush size={20} className="text-purple-500" />}
                                {role.id !== "founder" && role.id !== "pm" && role.id !== "swengineer" && role.id !== "designer" && <Briefcase size={20} className="text-neutral-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="font-bold text-xs text-foreground truncate">{role.name}</h4>
                                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded shrink-0 font-mono">{role.matchScore}% Match</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{role.category}</p>
                                <div className="flex justify-between items-center mt-2 pt-1 border-t border-border/40 text-[9.5px]">
                                  <span className="font-semibold text-foreground font-mono">{role.avgSalary}</span>
                                  <span className="text-muted-foreground">⏱️ {role.timeToReady}</span>
                                  <span className="text-emerald-600 font-semibold">{role.demandStatus}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        {/* Matching Locations, Territories & Streets */}
                        {searchSuggestions
                          .filter(item => !item.isRole && item.key !== "trending_roles" && item.key !== "emerging_careers" && item.key !== "remote_friendly" && item.key !== "no_degree" && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((item, idx) => (
                            <div 
                              key={`geo-res-${idx}`}
                              onClick={() => {
                                if (item.x !== undefined && item.y !== undefined) {
                                  const targetZoom = item.level === "continent" ? 0.25 
                                                   : item.level === "country" ? 0.5
                                                   : item.level === "state" ? 0.75
                                                   : item.level === "county" ? 1.1
                                                   : item.level === "city" ? 1.6
                                                   : item.level === "borough" ? 2.3
                                                   : item.level === "neighborhood" ? 2.9
                                                   : item.level === "campus" ? 3.5
                                                   : item.level === "building" ? 4.1
                                                   : 4.2; // default zoom level for streets/roads
                                  
                                  const newX = (viewportSize.w / 2) - item.x * targetZoom;
                                  const newY = (viewportSize.h / 2) - item.y * targetZoom;
                                  
                                  updateMapTransform(targetZoom, newX, newY);
                                  setZoomScale(targetZoom);
                                  setPanOffset({ x: newX, y: newY });
                                  toast.success(`Panned to ${item.name} (${item.type})`);
                                  setSearchFocused(false);
                                }
                              }}
                              className="border border-border hover:border-[#3B8BD4]/55 rounded-xl p-3 bg-[#E6F1FB]/30 dark:bg-slate-900 hover:bg-[#3B8BD4]/5 cursor-pointer transition-all shadow-sm flex items-center gap-3"
                            >
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                                <span className="text-xl">
                                  {item.type.split(" ")[0]}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-xs text-foreground truncate">{item.name}</h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{item.type}</p>
                              </div>
                            </div>
                          ))}

                        {Object.values(ROLE_DETAILS_MOCK).filter(role => {
                          if (isOfflineMode && !isRoleDownloaded(role.id)) return false;
                          return (
                            role.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            role.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            role.description.toLowerCase().includes(searchQuery.toLowerCase())
                          );
                        }).length === 0 && searchSuggestions.filter(item => !item.isRole && item.key !== "trending_roles" && item.key !== "emerging_careers" && item.key !== "remote_friendly" && item.key !== "no_degree" && item.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                          <div className="text-center py-8 text-xs text-muted-foreground">
                            {isOfflineMode 
                              ? `No downloaded careers matching "${searchQuery}" found. Try connecting online to explore all 18,000+ roles.`
                              : `No careers or geographical locations found matching "${searchQuery}".`}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MODE: EXPLORE CATEGORY */}
                  {sidebarMode === "explore_category" && (
                    <div className="flex flex-col h-full bg-card">
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5 tracking-tight">
                            ✨ Explore Category
                          </span>
                          <span className="text-[9.5px] text-muted-foreground">{activeExploreCategory}</span>
                        </div>
                        <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-hidden">
                        {Object.values(ROLE_DETAILS_MOCK)
                          .filter(role => {
                            if (!activeExploreCategory) return true;
                            if (activeExploreCategory.includes("Trending")) {
                              return role.id === "pm" || role.id === "swengineer" || role.id === "founder";
                            }
                            if (activeExploreCategory.includes("Remote")) {
                              return role.id === "pm" || role.id === "swengineer" || role.id === "designer" || role.id === "founder";
                            }
                            if (activeExploreCategory.includes("Degree")) {
                              return role.id === "designer" || role.id === "swengineer";
                            }
                            if (activeExploreCategory.includes("Demand")) {
                              return role.id === "pm" || role.id === "swengineer" || role.id === "doctor";
                            }
                            return true;
                          })
                          .map((role) => (
                            <div 
                              key={role.id}
                              onClick={() => {
                                handleOpenRole(role.id);
                              }}
                              className="border border-border hover:border-[#3B8BD4]/55 rounded-xl p-3 bg-background hover:bg-[#3B8BD4]/5 cursor-pointer transition-all shadow-sm flex gap-3"
                            >
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
                                {role.id === "founder" && <Flame size={20} className="text-orange-500" />}
                                {role.id === "pm" && <Layers size={20} className="text-blue-500" />}
                                {role.id === "swengineer" && <Code size={20} className="text-emerald-500" />}
                                {role.id === "designer" && <Paintbrush size={20} className="text-purple-500" />}
                                {role.id !== "founder" && role.id !== "pm" && role.id !== "swengineer" && role.id !== "designer" && <Briefcase size={20} className="text-neutral-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="font-bold text-xs text-foreground truncate">{role.name}</h4>
                                  <span className="text-[10px] text-[#3B8BD4] font-bold bg-[#E6F1FB] px-1.5 py-0.5 rounded shrink-0 font-mono">{role.matchScore}% Match</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{role.category}</p>
                                <div className="flex justify-between items-center mt-2 pt-1 border-t border-border/40 text-[9.5px]">
                                  <span className="font-semibold text-foreground font-mono">{role.avgSalary}</span>
                                  <span className="text-muted-foreground">⏱️ {role.timeToReady}</span>
                                  <span className="text-emerald-600 font-semibold">{role.demandStatus}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* MODE: FOR YOU RECOMMENDATIONS (Spec L2600-2765) */}
                  {sidebarMode === "foryou" && (
                    <div className="flex flex-col h-full bg-background text-xs">
                      {/* Header */}
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Sparkles size={14} className="text-pink-500 animate-pulse" /> For You Feed
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => setShowFilterDialog(true)}
                            className="bg-[#E6F1FB] hover:bg-[#D5E8F7] text-[#185FA5] border-none text-[9.5px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Filter size={10} /> Filters
                          </button>
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Tab Selectors */}
                      <div className="grid grid-cols-3 border-b border-border text-center shrink-0 bg-muted/20">
                        {[
                          { id: "feed", label: "🌟 My Feed" },
                          { id: "lists", label: "📋 Curated Lists" },
                          { id: "events", label: "📅 Events" }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveForYouTab(tab.id as typeof activeForYouTab)}
                            className={`py-2 text-[10.5px] font-bold transition-all border-b-2 cursor-pointer ${
                              activeForYouTab === tab.id
                                ? "border-pink-500 text-pink-600 bg-pink-50/10"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Scrollable Content */}
                      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-hidden">
                        {activeForYouTab === "feed" && (
                          <div className="space-y-4">
                            {/* Personal Header */}
                            <div className="bg-pink-50/30 dark:bg-pink-950/10 border border-pink-100 dark:border-pink-900/30 rounded-2xl p-3">
                              <span className="text-[10px] text-pink-600 font-bold uppercase tracking-wider block">Your Vector Affinity</span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                                Based on Commerce + Analytics + Communication clusters. Click items to explore nodes.
                              </p>
                            </div>

                            {/* 🌟 HIGH MATCHES (New This Week) */}
                            <div className="space-y-2">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">🌟 High Matches (New This Week)</span>
                              <div className="border border-pink-200 dark:border-pink-900/50 bg-pink-50/10 rounded-2xl p-3.5 space-y-2 shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-xs text-foreground block">UX Researcher</span>
                                    <span className="text-muted-foreground text-[10px] block mt-0.5"><span className="font-mono">94%</span> Match · <span className="font-mono">₹12-20 LPA</span></span>
                                  </div>
                                  <Badge className="bg-pink-100 text-pink-700 border-none font-bold text-[8.5px] font-mono">94% Match</Badge>
                                </div>
                                <p className="text-muted-foreground text-[10px] leading-snug">
                                  "Based on your high preference for user psychology and market analysis in saved PM roles."
                                </p>
                                <div className="flex gap-2 pt-1.5">
                                  <Button 
                                    onClick={() => { handleOpenRole("designer"); setSidebarMode("detail"); }}
                                    className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold min-h-[48px] px-6 rounded-full text-[10.5px] border-none cursor-pointer btn-secondary"
                                  >
                                    Explore Node
                                  </Button>
                                  <Button 
                                    onClick={() => toast.success("Saved to DreamBoard!")}
                                    variant="outline"
                                    className="min-h-[48px] min-w-[48px] p-0 flex items-center justify-center rounded-full border-pink-200 hover:bg-pink-50/40 text-pink-600 cursor-pointer btn-secondary"
                                  >
                                    <Bookmark size={11} />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* 🔥 TRENDING IN YOUR CITY */}
                            <div className="space-y-2">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">🔥 Trending in Bengaluru</span>
                              <div className="border border-border rounded-2xl p-3.5 bg-card space-y-2 shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-xs text-foreground block">AI Product Manager</span>
                                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Demand ↗️ <span className="font-mono">45%</span> this month</span>
                                  </div>
                                  <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[8.5px]">Trending</Badge>
                                </div>
                                <p className="text-muted-foreground text-[10px] leading-snug">
                                  67 companies are hiring AI PMs in Bengaluru this week. High compensation surge observed.
                                </p>
                                <Button 
                                  onClick={() => { handleOpenRole("pm"); setSidebarMode("detail"); }}
                                  variant="outline" 
                                  className="w-full min-h-[48px] px-6 text-[10.5px] font-bold rounded-full border-border hover:bg-muted/40 cursor-pointer btn-secondary"
                                >
                                  Learn More
                                </Button>
                              </div>
                            </div>

                            {/* 💡 HIDDEN GEMS */}
                            <div className="space-y-2">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">💡 Hidden Gems</span>
                              <div className="border border-border rounded-2xl p-3 bg-card divide-y divide-border/60">
                                {[
                                  { name: "Technical Writer", match: "89% Match", key: "swengineer" },
                                  { name: "Growth PM", match: "86% Match", key: "pm" },
                                  { name: "Developer Advocate", match: "83% Match", key: "swengineer" }
                                ].map((gem, idx) => (
                                  <div 
                                    key={idx} 
                                    onClick={() => { handleOpenRole(gem.key); setSidebarMode("detail"); }}
                                    className="py-2 flex justify-between items-center cursor-pointer hover:bg-muted/20 px-1 rounded transition-colors"
                                  >
                                    <span className="font-semibold text-foreground text-[10.5px]">{gem.name}</span>
                                    <span className="text-pink-600 font-bold text-[9.5px] font-mono">{gem.match}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 📚 LEARNING PATHS FOR YOU */}
                            <div className="space-y-2">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">📚 Learning Paths For You</span>
                              <div className="border border-border rounded-2xl p-3 bg-card space-y-2 text-[10.5px]">
                                <span className="text-[10px] text-muted-foreground block font-medium">Close KSAO gaps in target role:</span>
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center bg-muted/20 p-2 rounded-xl">
                                    <span className="font-semibold text-foreground">Advanced SQL Database Course</span>
                                    <Badge className="bg-[#E6F1FB] text-[#185FA5] border-none font-bold text-[8.5px] font-mono">Close 10% gap</Badge>
                                  </div>
                                  <div className="flex justify-between items-center bg-muted/20 p-2 rounded-xl">
                                    <span className="font-semibold text-foreground">Public Speaking & Presenting</span>
                                    <Badge className="bg-[#E6F1FB] text-[#185FA5] border-none font-bold text-[8.5px] font-mono">Close 8% gap</Badge>
                                  </div>
                                  <div className="flex justify-between items-center bg-muted/20 p-2 rounded-xl">
                                    <span className="font-semibold text-foreground">Startup Financial Modeling</span>
                                    <Badge className="bg-[#E6F1FB] text-[#185FA5] border-none font-bold text-[8.5px] font-mono">Close 5% gap</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 👥 PEERS LIKE YOU EXPLORED */}
                            <div className="space-y-2">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">👥 Peers Like You Explored</span>
                              <div className="border border-border rounded-2xl p-3 bg-card space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                  {["Data PM", "Platform PM", "Technical PM"].map((peer, i) => (
                                    <div 
                                      key={i} 
                                      onClick={() => { handleOpenRole("pm"); setSidebarMode("detail"); }}
                                      className="p-2 border border-border rounded-xl text-center bg-muted/10 hover:bg-muted/40 cursor-pointer transition-colors"
                                    >
                                      <span className="font-bold text-foreground block text-[10px]">{peer}</span>
                                      <span className="text-[8px] text-muted-foreground block mt-0.5">80%+ Match</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* 🎯 BECAUSE YOU SAVED */}
                            <div className="space-y-2">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">🎯 Because You Saved "Product Designer"</span>
                              <div className="border border-border rounded-2xl p-3 bg-card space-y-1">
                                {[
                                  { role: "Interaction Designer", key: "designer" },
                                  { role: "Product Design Lead", key: "designer" },
                                  { role: "Design Systems PM", key: "pm" }
                                ].map((sim, i) => (
                                  <div 
                                    key={i}
                                    onClick={() => { handleOpenRole(sim.key); setSidebarMode("detail"); }}
                                    className="flex items-center gap-1.5 py-1.5 hover:bg-muted/30 cursor-pointer rounded px-1"
                                  >
                                    <span className="w-1 h-1 rounded-full bg-pink-500" />
                                    <span className="font-semibold text-foreground text-[10.5px]">{sim.role}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* 📅 UPCOMING DEADLINES */}
                            <div className="space-y-2">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">📅 Upcoming Deadlines</span>
                              <div className="border border-border rounded-2xl p-3 bg-card space-y-1.5 text-[10.5px]">
                                <div className="flex justify-between items-center text-red-600 dark:text-red-400 font-bold">
                                  <span>🚨 MBA CAT registration cutoff:</span>
                                  <span>45 days left</span>
                                </div>
                                <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-bold">
                                  <span>⏱️ PM Bootcamp X enrollment:</span>
                                  <span>12 days left</span>
                                </div>
                                <div className="flex justify-between items-center text-emerald-600 font-bold">
                                  <span>⚡ Startup Hiring Drive (Nagpur/BLR):</span>
                                  <span>This week</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeForYouTab === "lists" && (
                          <div className="space-y-4">
                            <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">📋 Curated Expert Lists</span>
                            
                            {[
                              {
                                title: "Best First PM Roles in 2027",
                                author: "Rohan M. (Career Expert)",
                                count: 12,
                                match: "82% avg match",
                                badge: "Weekly Updated"
                              },
                              {
                                title: "Non-Tech Paths to Product",
                                author: "Priya S. (Career Coach)",
                                count: 8,
                                match: "Featured: Technical PM, Growth PM",
                                badge: "For Non-Engineers"
                              },
                              {
                                title: "Remote-First PM Opportunities",
                                author: "Community Collaborative",
                                count: 15,
                                match: "100% remote list",
                                badge: "Open Source"
                              }
                            ].map((list, idx) => (
                              <div key={idx} className="border border-border rounded-2xl p-3.5 bg-card hover:border-pink-300 transition-colors shadow-sm space-y-2.5">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-xs text-foreground block">{list.title}</span>
                                    <span className="text-muted-foreground text-[10px] block mt-0.5">By {list.author} · {list.count} careers</span>
                                  </div>
                                  <Badge className="bg-pink-100 text-pink-700 border-none font-bold text-[8px] tracking-wider px-1">{list.badge}</Badge>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-semibold block">{list.match}</span>
                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => {
                                      toast.success(`Opening List: ${list.title}`);
                                      setSidebarMode("detail");
                                    }}
                                    className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-7 rounded-lg text-[9.5px] border-none cursor-pointer"
                                  >
                                    View List
                                  </Button>
                                  {idx === 2 ? (
                                    <Button
                                      onClick={() => {
                                        toast.success("Opening contribution sheet. +50 XP on suggestion approval.");
                                      }}
                                      variant="outline"
                                      className="flex-1 h-7 rounded-lg text-[9.5px] border-pink-200 text-pink-600 hover:bg-pink-50/30 cursor-pointer"
                                    >
                                      Contribute
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => {
                                        toast.success("Following expert updates!");
                                      }}
                                      variant="outline"
                                      className="flex-1 h-7 rounded-lg text-[9.5px] border-border hover:bg-muted/40 cursor-pointer"
                                    >
                                      Follow Expert
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Saved lists section */}
                            <div className="border border-border rounded-2xl p-3.5 bg-muted/10 space-y-2">
                              <span className="font-bold text-foreground block text-[10.5px]">Your Saved Lists (3)</span>
                              <div className="space-y-1.5 text-[10px] text-muted-foreground">
                                <div className="flex justify-between items-center py-1 bg-background px-2.5 rounded-xl border border-border">
                                  <span className="font-bold text-foreground">"My Dream Careers"</span>
                                  <span>5 roles</span>
                                </div>
                                <div className="flex justify-between items-center py-1 bg-background px-2.5 rounded-xl border border-border">
                                  <span className="font-bold text-foreground">"Backup Options"</span>
                                  <span>7 roles</span>
                                </div>
                                <div className="flex justify-between items-center py-1 bg-background px-2.5 rounded-xl border border-border">
                                  <span className="font-bold text-foreground">"Long-term Goals"</span>
                                  <span>3 roles</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeForYouTab === "events" && (
                          <div className="space-y-4">
                            <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">🎫 Career Events Near You (Bengaluru)</span>
                            
                            {[
                              {
                                title: "Product Management Meetup",
                                date: "March 18, 2027 · 6:00 PM",
                                location: "Koramangala, Bengaluru",
                                details: "Speakers: 3 Senior PMs. Topics: Career growth, switching.",
                                cost: "Free Entry",
                                action: "RSVP Now"
                              },
                              {
                                title: "PM Interview Prep Workshop",
                                date: "March 20, 2027 · 10:00 AM",
                                location: "Virtual (Google Meet)",
                                details: "Mock interviews, case reviews, portfolio audits.",
                                cost: "₹500 Entry Fee",
                                action: "Register"
                              },
                              {
                                title: "Startup Career Fair 2027",
                                date: "March 25-26, 2027 · All Day",
                                location: "Nagpur / Bangalore Tech Hubs",
                                details: "40+ startups hiring PMs. On-spot interviews, resume drop.",
                                cost: "Free Entry",
                                action: "Register"
                              }
                            ].map((evt, idx) => (
                              <div key={idx} className="border border-border rounded-2xl p-3.5 bg-card hover:border-[#3B8BD4]/30 transition-colors shadow-sm space-y-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-xs text-foreground block">{evt.title}</span>
                                    <span className="text-[10px] text-pink-600 font-bold block mt-0.5">{evt.date}</span>
                                  </div>
                                  <Badge className="bg-[#E6F1FB] text-[#185FA5] border-none font-bold text-[8.5px] px-1.5 py-0.5">{evt.cost}</Badge>
                                </div>
                                <div className="text-[10px] text-muted-foreground leading-snug">
                                  📍 <span className="font-semibold text-foreground">{evt.location}</span> <br/>
                                  {evt.details}
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <Button 
                                    onClick={() => {
                                      toast.success(`RSVP confirmed for: ${evt.title}!`);
                                    }}
                                    className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-7 rounded-lg text-[9.5px] border-none cursor-pointer"
                                  >
                                    {evt.action}
                                  </Button>
                                  <Button 
                                    onClick={() => {
                                      toast.success("Added to Google Calendar!");
                                    }}
                                    variant="outline"
                                    className="h-7 w-7 p-0 flex items-center justify-center rounded-lg border-border hover:bg-muted/40 cursor-pointer"
                                  >
                                    <Calendar size={11} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MODE: LIVE JOB SEARCH (Spec L2400-2586) */}
                  {sidebarMode === "jobsearch" && (
                    <div className="flex flex-col h-full bg-background text-xs">
                      {/* Header */}
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Briefcase size={14} className="text-blue-500" /> Job Search Assistant
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Sub Tab Selectors */}
                      <div className="grid grid-cols-4 border-b border-border text-center shrink-0 bg-muted/20">
                        {[
                          { id: "search", label: "🔍 Jobs" },
                          { id: "tracker", label: "📦 Tracker" },
                          { id: "interview", label: "🎤 Prep" },
                          { id: "negotiation", label: "💰 Offer" }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveJobSearchSubTab(tab.id as typeof activeJobSearchSubTab)}
                            className={`py-2 text-[10px] font-bold transition-all border-b-2 cursor-pointer ${
                              activeJobSearchSubTab === tab.id
                                ? "border-blue-500 text-blue-600 bg-blue-50/10"
                                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Scrollable Content */}
                      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 scrollbar-hidden">
                        {activeJobSearchSubTab === "search" && (
                          <div className="space-y-4">
                            {/* Readiness score block */}
                            <div className="bg-[#E6F1FB] border border-[#3B8BD4]/30 rounded-2xl p-3 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-[#185FA5] block">You're 92% Ready!</span>
                                <span className="text-[10px] text-muted-foreground">High readiness score detected for PM roles.</span>
                              </div>
                              <Badge className="bg-[#3B8BD4] text-white border-none font-bold text-[9px] px-2 py-0.5">92% Ready</Badge>
                            </div>

                            {/* Job Openings Near Your Location */}
                            <div className="space-y-2">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">🎯 Job Openings Near Your Location</span>
                              <div className="border border-border rounded-2xl p-3 bg-card space-y-2.5">
                                <div className="space-y-1.5">
                                  <div className="flex justify-between items-center text-[10.5px]">
                                    <span className="font-bold text-foreground">BENGALURU</span>
                                    <span className="text-muted-foreground">47 openings</span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground space-y-1 pl-2 border-l border-border">
                                    <div className="flex justify-between items-center">
                                      <span>🟢 Easy to Land (APM, Startups)</span>
                                      <span className="font-semibold text-emerald-600">12 jobs</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span>🟡 Moderate (Mid-size companies)</span>
                                      <span className="font-semibold text-amber-600">23 jobs</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span>🔴 Highly Competitive (FAANG, Unicorns)</span>
                                      <span className="font-semibold text-red-600">12 jobs</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                                  <div className="bg-muted/35 p-1.5 rounded-lg text-center">
                                    <span className="font-bold text-foreground block">PUNE</span>
                                    <span className="text-muted-foreground">23 openings</span>
                                  </div>
                                  <div className="bg-muted/35 p-1.5 rounded-lg text-center">
                                    <span className="font-bold text-foreground block">HYDERABAD</span>
                                    <span className="text-muted-foreground">31 openings</span>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button 
                                    onClick={() => toast.success("Loading all 101 career map job postings...")}
                                    className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-7 rounded-lg text-[9.5px] border-none cursor-pointer"
                                  >
                                    View All Openings
                                  </Button>
                                  <Button 
                                    onClick={() => toast.success("Job alerts set for Bengaluru & Remote PM roles.")}
                                    variant="outline"
                                    className="flex-1 h-7 rounded-lg text-[9.5px] border-border hover:bg-muted/40 cursor-pointer"
                                  >
                                    Set Job Alerts
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Job Postings with Difficulty Indicators */}
                            <div className="space-y-3">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">Featured Job Openings</span>

                              {/* Easy to Land card */}
                              <div className="border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-xs text-foreground block">Startup X - Product Manager</span>
                                    <span className="text-[10px] text-muted-foreground block mt-0.5">Salary: ₹15-18 LPA · Bengaluru</span>
                                  </div>
                                  <Badge className="bg-emerald-100 text-emerald-700 border-none font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5">🟢 Easy to Land</Badge>
                                </div>
                                <div className="text-[10px] text-muted-foreground bg-emerald-50/20 rounded-xl p-2.5 space-y-1">
                                  <span className="font-bold text-emerald-800 dark:text-emerald-400 block">Why it's Easy to Land for you:</span>
                                  <div>• You match <span className="font-semibold text-foreground">95% requirements</span></div>
                                  <div>• Your skills align perfectly (Agile, User Stories, Roadmap)</div>
                                  <div>• Actively hiring (20 PMs needed)</div>
                                  <div>• Less competitive (<span className="font-semibold text-foreground">50 applicants</span> vs 500 avg)</div>
                                  <div>• No employee referral required to bypass resume screen</div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                                  <span>Apply by: <span className="font-semibold text-foreground">March 20, 2027</span></span>
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => {
                                        toast.success("Quick Applied to Startup X! Application added to tracker.");
                                        setAppliedJobs(prev => [
                                          {
                                            company: "Startup X",
                                            role: "Product Manager",
                                            date: "Just now",
                                            status: "📧 Application Submitted",
                                            reminders: ["Follow up in 7 days", "Review interview prep checklist"],
                                            notes: "Quick applied via CareerMap."
                                          },
                                          ...prev
                                        ]);
                                        setActiveJobSearchSubTab("tracker");
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-7 px-3 rounded-lg border-none cursor-pointer text-[9.5px]"
                                    >
                                      Quick Apply
                                    </Button>
                                    <Button 
                                      onClick={() => toast.success("Saved Startup X job listing.")}
                                      variant="outline"
                                      className="h-7 w-7 p-0 flex items-center justify-center rounded-lg border-emerald-200 hover:bg-emerald-50/40 text-emerald-600 cursor-pointer"
                                    >
                                      <Bookmark size={11} />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {/* Highly Competitive card */}
                              <div className="border border-red-200 dark:border-red-900/50 bg-red-50/10 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-xs text-foreground block">Google - Associate PM</span>
                                    <span className="text-[10px] text-muted-foreground block mt-0.5">Salary: ₹25-30 LPA · Bengaluru</span>
                                  </div>
                                  <Badge className="bg-red-100 text-red-700 border-none font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5">🔴 Highly Competitive</Badge>
                                </div>
                                <div className="text-[10px] text-muted-foreground bg-red-50/20 rounded-xl p-2.5 space-y-1">
                                  <span className="font-bold text-red-800 dark:text-red-400 block">Why it's Highly Competitive:</span>
                                  <div>• You match <span className="font-semibold text-foreground">88% requirements</span> (slightly low)</div>
                                  <div>• Top brand name (<span className="font-semibold text-foreground">2000+ applicants</span>)</div>
                                  <div>• Referral strongly recommended to pass initial screen</div>
                                  <div>• Needs 2+ years experience (you have 1 year mapped)</div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                                  <span>Apply by: <span className="font-semibold text-foreground">March 15, 2027</span></span>
                                  <div className="flex gap-2">
                                    <Button 
                                      onClick={() => toast.info("Opening referral connector. Showing 4 alumni at Google.")}
                                      variant="outline"
                                      className="h-7 px-2.5 rounded-lg border-red-200 hover:bg-red-50/40 text-red-600 cursor-pointer text-[9.5px] font-semibold"
                                    >
                                      Find Referral
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        toast.success("Applied to Google. Added to application tracker.");
                                        setAppliedJobs(prev => [
                                          {
                                            company: "Google",
                                            role: "Associate PM",
                                            date: "Just now",
                                            status: "📧 Application Submitted",
                                            reminders: ["Ask Rohan for referral update", "Prepare analytical case studies"],
                                            notes: "Applied anyway without referral."
                                          },
                                          ...prev
                                        ]);
                                        setActiveJobSearchSubTab("tracker");
                                      }}
                                      className="bg-red-600 hover:bg-red-700 text-white font-bold h-7 px-3 rounded-lg border-none cursor-pointer text-[9.5px]"
                                    >
                                      Apply Anyway
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeJobSearchSubTab === "tracker" && (
                          <div className="space-y-4">
                            {/* Tracker breakdown stats card */}
                            <div className="border border-border rounded-2xl p-3.5 bg-card space-y-2">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">Application Status Tracker</span>
                              <div className="grid grid-cols-5 gap-1 text-center font-bold">
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-1 rounded-lg">
                                  <span className="text-[14px] text-blue-600 block">23</span>
                                  <span className="text-[7.5px] text-muted-foreground font-normal">Applied</span>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-1 rounded-lg">
                                  <span className="text-[14px] text-emerald-600 block">2</span>
                                  <span className="text-[7.5px] text-muted-foreground font-normal">Offer</span>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-950/20 p-1 rounded-lg">
                                  <span className="text-[14px] text-purple-600 block">5</span>
                                  <span className="text-[7.5px] text-muted-foreground font-normal">Interview</span>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-950/20 p-1 rounded-lg">
                                  <span className="text-[14px] text-amber-600 block">8</span>
                                  <span className="text-[7.5px] text-muted-foreground font-normal">Review</span>
                                </div>
                                <div className="bg-red-50 dark:bg-red-950/20 p-1 rounded-lg">
                                  <span className="text-[14px] text-red-600 block">6</span>
                                  <span className="text-[7.5px] text-muted-foreground font-normal">Reject</span>
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1.5 border-t border-border/60">
                                <span className="font-semibold text-foreground">Next Action:</span>
                                <span>Interview tomorrow: Startup Y</span>
                              </div>
                            </div>

                            {/* Applied Job tracker cards list */}
                            <div className="space-y-3">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">Your Applications</span>
                              
                              {appliedJobs.map((job, index) => (
                                <div key={index} className="border border-border rounded-2xl p-3.5 bg-card space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-bold text-[11px] text-foreground block">{job.company}</span>
                                      <span className="text-[10px] text-muted-foreground block mt-0.5">{job.role} · {job.date}</span>
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[8.5px]">{job.status}</Badge>
                                  </div>

                                  <div className="bg-muted/20 rounded-xl p-2.5 text-[10px] space-y-1">
                                    <span className="font-bold text-foreground block">🔔 Reminders & Follow-ups:</span>
                                    {job.reminders.map((rem, rIdx) => (
                                      <div key={rIdx} className="flex items-start gap-1">
                                        <span>•</span>
                                        <span>{rem}</span>
                                      </div>
                                    ))}
                                  </div>

                                  <p className="text-[10.5px] text-muted-foreground italic leading-snug px-1">
                                    " {job.notes} "
                                  </p>

                                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-[9.5px]">
                                    <Button
                                      onClick={() => {
                                        toast.success("Interview reminder alarm set for 1 day before.");
                                      }}
                                      variant="outline"
                                      className="h-7 rounded-lg border-border hover:bg-muted/40 font-semibold cursor-pointer"
                                    >
                                      Set Reminder
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        toast.success("Prep materials and templates loaded to Workspace!");
                                      }}
                                      variant="outline"
                                      className="h-7 rounded-lg border-border hover:bg-muted/40 font-semibold cursor-pointer"
                                    >
                                      Prep Materials
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        toast.success("Document viewer: Resume_v2_ProductManager.pdf loaded.");
                                      }}
                                      variant="outline"
                                      className="h-7 rounded-lg border-border hover:bg-muted/40 font-semibold cursor-pointer"
                                    >
                                      Photo Resume
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeJobSearchSubTab === "interview" && (
                          <div className="space-y-4">
                            {/* Upcoming interview card */}
                            {upcomingInterviews.map((interview, index) => (
                              <div key={index} className="border border-[#3B8BD4]/30 bg-[#E6F1FB]/15 rounded-2xl p-3.5 space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                    🎤 Interview Coming Up
                                  </span>
                                  <Badge className="bg-[#3B8BD4] text-white border-none font-bold text-[8.5px]">Confirmed</Badge>
                                </div>
                                <div className="text-[10.5px] text-muted-foreground space-y-0.5 leading-snug">
                                  <div>Company: <span className="font-bold text-foreground">{interview.company}</span></div>
                                  <div>Role: <span className="font-semibold text-foreground">{interview.role}</span></div>
                                  <div>Date: <span className="font-semibold text-foreground">{interview.date} at {interview.time}</span></div>
                                  <div>Location: <span className="font-semibold text-[#185FA5]">{interview.location}</span></div>
                                </div>
                              </div>
                            ))}

                            {/* Preparation checklist */}
                            <div className="border border-border rounded-2xl p-3.5 bg-card space-y-3 text-[10.5px]">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">Interview Prep Status</span>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1.5">
                                    ✓ Researched company (competitors, strategy)
                                  </span>
                                  <span className="text-emerald-600 font-bold">Done</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1.5">
                                    ✓ Reviewed target product ecosystem
                                  </span>
                                  <span className="text-emerald-600 font-bold">Done</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-foreground flex items-center gap-1.5 font-medium">
                                    ⚠ Practice product case studies (2/5 done)
                                  </span>
                                  <span className="text-amber-600 font-bold">2 / 5</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-foreground flex items-center gap-1.5 font-medium">
                                    ⚠ Mock interview with career mentor
                                  </span>
                                  <button 
                                    onClick={() => toast.success("Drafted chat request for Mock Interview with Priya (Mentor)!")}
                                    className="text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border-none font-bold px-1.5 py-0.5 rounded cursor-pointer"
                                  >
                                    Message
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-foreground flex items-center gap-1.5 font-medium">
                                    ✗ System design basics preparation
                                  </span>
                                  <span className="text-red-500 font-bold">Not Started</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1.5">
                                    ✓ Resume tailored & projects highlighted
                                  </span>
                                  <span className="text-emerald-600 font-bold">Done</span>
                                </div>
                              </div>
                            </div>

                            {/* Timeline reminders */}
                            <div className="border border-border rounded-2xl p-3.5 bg-card space-y-2 text-[10px]">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">🔔 Prep Reminders</span>
                              <div className="space-y-1.5 text-muted-foreground">
                                <div>• <span className="font-semibold text-foreground">3 days before:</span> Complete practice product cases</div>
                                <div>• <span className="font-semibold text-foreground">1 day before:</span> Mock interview checklist and review notes</div>
                                <div>• <span className="font-semibold text-foreground">2 hours before:</span> Head out or prepare workspace</div>
                                <div>• <span className="font-semibold text-foreground">30 min before:</span> Log in / Arrive, relax, breathe</div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  toast.success("Prep checklist updated!");
                                  setInterviewPrepChecklist(prev => ({ ...prev, caseStudies: true, mockInterview: true }));
                                }}
                                className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-7 rounded-lg text-[9.5px] border-none cursor-pointer"
                              >
                                Complete Prep Checklist
                              </Button>
                              <Button
                                onClick={() => {
                                  toast.info("Navigating map directions to office: Koramangala, Bengaluru...");
                                  setSidebarMode("distance");
                                }}
                                variant="outline"
                                className="flex-1 h-7 rounded-lg text-[9.5px] border-border hover:bg-muted/40 cursor-pointer"
                              >
                                Get Directions to Office
                              </Button>
                            </div>
                          </div>
                        )}

                        {activeJobSearchSubTab === "negotiation" && (
                          <div className="space-y-4">
                            {/* Offer Details */}
                            <div className="border border-border rounded-2xl p-3.5 bg-card space-y-2.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-xs text-foreground block">💰 Offer Negotiation Assistant</span>
                                <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[8.5px]">High Leverage</Badge>
                              </div>
                              <div className="text-[10.5px] text-muted-foreground space-y-1 pl-2 border-l-2 border-amber-500">
                                <div>Company: <span className="font-semibold text-foreground">{offerNegotiation.company}</span></div>
                                <div>Base Salary: <span className="font-bold text-foreground">{offerNegotiation.base}</span></div>
                                <div>Equity / Options: <span className="font-semibold text-foreground">{offerNegotiation.equity}</span></div>
                                <div>Joining Bonus: <span className="font-semibold text-foreground">{offerNegotiation.joiningBonus}</span></div>
                                <div className="pt-1 text-[11px]">Total Package (Year 1): <span className="font-bold text-emerald-600">{offerNegotiation.total}</span></div>
                              </div>
                            </div>

                            {/* Market analysis */}
                            <div className="border border-border rounded-2xl p-3.5 bg-card space-y-2 text-[10.5px]">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">Market Value Comparison</span>
                              <div className="space-y-1">
                                <div>• Market Rate for PM profile: <span className="font-semibold text-foreground">₹18-22 LPA</span></div>
                                <div>• This offer rating: <span className="font-bold text-red-500">Lower end of range</span></div>
                                <div>• Room for Negotiation: <span className="font-bold text-emerald-600 uppercase">HIGH (15-25% potential increase)</span></div>
                              </div>
                            </div>

                            {/* Negotiation strategy */}
                            <div className="border border-border rounded-2xl p-3 bg-card space-y-2.5 text-[10.5px]">
                              <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-neutral-400">Recommended Strategy</span>
                              <div className="space-y-2 text-muted-foreground">
                                <div>
                                  <span className="font-bold text-foreground block">1. Competing Offer Leverage</span>
                                  "I have another offer at ₹20 LPA which I'm considering..."
                                </div>
                                <div>
                                  <span className="font-bold text-foreground block">2. Highlight Unique Value</span>
                                  "My mapped B2C product experience matches your next quarters priority..."
                                </div>
                                <div>
                                  <span className="font-bold text-foreground block">3. Counter Proposal Ask</span>
                                  • Base: ₹18 LPA (+2L) · Equity: 0.08% · Signing: ₹3L (+1L)
                                </div>
                                <div>
                                  <span className="font-bold text-foreground block">4. Minimum Acceptable Floor</span>
                                  Total Compensation limit: ₹17 LPA
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  toast.success("Negotiation email drafted! Copied to clipboard.");
                                }}
                                className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-7 rounded-lg text-[9.5px] border-none cursor-pointer"
                              >
                                Generate Email
                              </Button>
                              <Button
                                onClick={() => {
                                  toast.success("Meeting scheduler generated. HR calendar link fetched.");
                                }}
                                variant="outline"
                                className="flex-1 h-7 rounded-lg text-[9.5px] border-border hover:bg-muted/40 cursor-pointer"
                              >
                                Schedule Call
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MODE: DISTANCE & TIME CALCULATOR */}
                  {sidebarMode === "distance" && (
                    <div className="flex flex-col h-full">
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Clock size={14} className="text-orange-500" /> Distance Calculator
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="text-[9px] font-bold">KSAO-Based</Badge>
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hidden text-xs">
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          KSAO vector distance from your current profile to target roles (measured in skill-gap units):
                        </p>
                        {[
                          { name: "Product Manager", distance: 40, eta: "12–18 months", difficulty: "Moderate", color: "amber" },
                          { name: "Software Engineer", distance: 55, eta: "18–24 months", difficulty: "Hard", color: "red" },
                          { name: "UX Designer", distance: 28, eta: "8–12 months", difficulty: "Easy", color: "emerald" },
                          { name: "Chartered Accountant", distance: 35, eta: "10–14 months", difficulty: "Moderate", color: "amber" }
                        ].map((r, i) => (
                          <div key={i} className="p-3 border border-border rounded-xl bg-card shadow-sm">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="font-bold text-foreground">{r.name}</span>
                              <span className={`text-[10px] font-bold ${
                                r.color === "emerald" ? "text-emerald-600" : r.color === "red" ? "text-red-600" : "text-amber-600"
                              }`}>{r.difficulty}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  r.color === "emerald" ? "bg-emerald-500" : r.color === "red" ? "bg-red-500" : "bg-amber-500"
                                }`}
                                style={{ width: `${r.distance}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                              <span>{r.distance}% skill gap remaining</span>
                              <span>ETA: {r.eta}</span>
                            </div>
                          </div>
                        ))}
                        <div className="border border-border rounded-xl p-3 bg-blue-50/50 text-[10.5px] text-blue-700">
                          🗺️ Distances are computed from your 229-KSAO SelfGraph vector using cosine similarity scoring.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE: ADVANCED CAREER COMPARISON ENGINE (up to 4 roles) */}
                  {sidebarMode === "comparison" && (
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5 tracking-tight">
                          <GitCompare size={14} className="text-cyan-500" /> Advanced Role Comparison
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[9px] font-bold border-cyan-500 text-cyan-600">
                            {comparisonSlots.length}/4 Slots
                          </Badge>
                          <button
                            onClick={() => setPrintExportOpen(true)}
                            className="ghost text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                            title="Print / Export PDF"
                          >
                            <Printer size={13} />
                          </button>
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto scrollbar-hidden text-xs">
                        {/* City PPP note */}
                        <div className="px-3 pt-3 pb-1">
                          <div className="bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 rounded-xl px-3 py-2 text-[10px] text-cyan-800 dark:text-cyan-300 leading-snug">
                            📍 <strong>{currentCity.charAt(0).toUpperCase() + currentCity.slice(1)}</strong> — {(() => { const cfg = (CITY_CONFIG as Record<string, {tier:string;pppWarning:string}>)[currentCity]; return cfg ? `${cfg.tier}: ${cfg.pppWarning}` : "National average benchmark."; })()}
                          </div>
                        </div>

                        {/* Add role slot row */}
                        <div className="flex items-center gap-2 px-3 pt-2 pb-1">
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              const id = e.target.value;
                              if (!id) return;
                              setComparisonSlots(prev => {
                                if (prev.includes(id)) { toast.info("Already in comparison."); return prev; }
                                if (prev.length >= 4) { toast.error("Max 4 roles. Remove one first."); return prev; }
                                toast.success(`${ROLE_DETAILS_MOCK[id]?.name || id} added!`);
                                return [...prev, id];
                              });
                              e.target.value = "";
                            }}
                            className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-[10.5px] outline-none cursor-pointer"
                          >
                            <option value="">+ Add a role to compare…</option>
                            {Object.values(ROLE_DETAILS_MOCK).map(r => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => setComparisonSlots(["pm", "swengineer"])}
                            className="ghost text-[9.5px] text-muted-foreground hover:text-red-500 cursor-pointer whitespace-nowrap border border-border px-2 py-1 rounded-lg"
                          >
                            Reset
                          </button>
                        </div>

                        {comparisonSlots.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-[10.5px] text-center gap-2 px-4 mt-4">
                            <GitCompare size={28} className="opacity-30" />
                            <p>No roles selected. Right-click a career node or use the dropdown above to add up to 4 roles.</p>
                          </div>
                        ) : (
                          <div className="px-3 pb-3 space-y-2 mt-2">
                            {/* Metric labels + role columns grid */}
                            {(() => {
                              const slots = comparisonSlots.map(id => ({
                                role: ROLE_DETAILS_MOCK[id],
                                adj: getAdjustedSalary(id, currentCity)
                              })).filter(s => s.role);

                              const metrics: { label: string; icon: string; getValue: (s: typeof slots[0]) => number; format: (s: typeof slots[0]) => string }[] = [
                                { label: "Adj. Salary",  icon: "💰", getValue: s => { const n = s.adj.avg.match(/\d+/); return n ? parseInt(n[0]) : 0; }, format: s => s.adj.avg },
                                { label: "Match Score",  icon: "🎯", getValue: s => s.role.matchScore, format: s => `${s.role.matchScore}%` },
                                { label: "WLB Rating",   icon: "⚖️", getValue: s => s.role.wlbRating, format: s => `${s.role.wlbRating}/5` },
                                { label: "Growth Pot.",  icon: "📈", getValue: s => s.role.growthPotential, format: s => `${s.role.growthPotential}/5` },
                                { label: "Entry Diff.",  icon: "🚧", getValue: s => 5 - s.role.entryDifficulty, format: s => `${s.role.entryDifficulty}/5` },
                                { label: "Salary Rtg.",  icon: "💵", getValue: s => s.role.salaryRating, format: s => `${s.role.salaryRating}/5` },
                                { label: "Hiring",       icon: "🏢", getValue: s => s.role.hiringCount, format: s => `${s.role.hiringCount} openings` },
                                { label: "AI Risk ↓",    icon: "🤖", getValue: s => { const r = s.role.automationRisk.toLowerCase(); return r.includes("low") ? 3 : r.includes("medium") ? 2 : 1; }, format: s => s.role.automationRisk.split("—")[0].trim() },
                              ];

                              return (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-[10px] border-collapse" style={{ minWidth: `${80 + slots.length * 90}px` }}>
                                    <thead>
                                      <tr>
                                        <th className="text-left text-muted-foreground font-bold py-1.5 pr-2 w-20 sticky left-0 bg-background">Metric</th>
                                        {slots.map((s, i) => (
                                          <th key={i} className="text-center pb-1.5 px-1">
                                            <div className="flex flex-col items-center gap-0.5">
                                              <span className="font-bold text-foreground text-[10px] leading-tight">{s.role.name.split(" ").slice(0, 2).join(" ")}</span>
                                              <span className="text-[8.5px] text-muted-foreground">{s.role.category.split("·")[0].trim()}</span>
                                              <button
                                                onClick={() => setComparisonSlots(prev => prev.filter(id => id !== s.role.id))}
                                                className="ghost text-[8px] text-red-400 hover:text-red-600 cursor-pointer mt-0.5"
                                              >✕ Remove</button>
                                            </div>
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {metrics.map((metric, mi) => {
                                        const vals = slots.map(s => metric.getValue(s));
                                        const maxVal = Math.max(...vals);
                                        return (
                                          <tr key={mi} className={mi % 2 === 0 ? "bg-muted/20" : ""}>
                                            <td className="py-1.5 pr-2 text-muted-foreground font-semibold sticky left-0 bg-inherit">
                                              <span className="mr-1">{metric.icon}</span>{metric.label}
                                            </td>
                                            {slots.map((s, si) => {
                                              const isWinner = vals[si] === maxVal && vals.filter(v => v === maxVal).length === 1;
                                              return (
                                                <td key={si} className="text-center py-1.5 px-1">
                                                  <span className={`font-bold px-1.5 py-0.5 rounded-md ${isWinner ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "text-foreground"}`}>
                                                    {metric.format(s)}
                                                  </span>
                                                </td>
                                              );
                                            })}
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()}

                            {/* Action buttons */}
                            <div className="pt-2 flex gap-2">
                              <Button
                                onClick={() => setPrintExportOpen(true)}
                                variant="outline"
                                className="flex-1 h-8 rounded-xl text-[10px] gap-1 cursor-pointer"
                              >
                                <Printer size={11} /> Export PDF
                              </Button>
                              <Button
                                onClick={() => {
                                  const names = comparisonSlots.map(id => ROLE_DETAILS_MOCK[id]?.name || id).join(" vs ");
                                  const url = `${window.location.origin}/dashboard/careermap?compare=${comparisonSlots.join(",")}`;
                                  navigator.clipboard?.writeText(url).catch(() => {});
                                  toast.success(`Share link for "${names}" copied!`);
                                }}
                                variant="outline"
                                className="flex-1 h-8 rounded-xl text-[10px] gap-1 cursor-pointer"
                              >
                                <Share2 size={11} /> Share
                              </Button>
                            </div>
                            <p className="text-[9.5px] text-muted-foreground text-center">
                              🟢 Highlighted cell = winner in that metric
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}


                  {/* MODE: SETTINGS */}
                  {sidebarMode === "settings" && (
                    <div className="flex flex-col h-full">
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5 tracking-tight">
                          <Info size={14} className="text-muted-foreground" /> CareerMap Settings
                        </span>
                        <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden text-xs text-foreground">
                        
                        {/* Location / City */}
                        <div className="space-y-1.5">
                          <span className="font-bold block">📍 Base City (PPP Salary Adjustment)</span>
                          <select
                            value={currentCity}
                            onChange={e => setCurrentCity(e.target.value)}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-[11px] outline-none"
                          >
                            <option value="nagpur">Nagpur (Tier-2)</option>
                            <option value="ahmedabad">Ahmedabad (Tier-2)</option>
                            <option value="jaipur">Jaipur (Tier-2)</option>
                            <option value="pune">Pune (Tier-1.5)</option>
                            <option value="hyderabad">Hyderabad (Tier-1.5)</option>
                            <option value="chennai">Chennai (Tier-1.5)</option>
                            <option value="bengaluru">Bengaluru (Tier-1)</option>
                            <option value="mumbai">Mumbai (Tier-1)</option>
                            <option value="delhi">Delhi / NCR (Tier-1)</option>
                            <option value="remote">Remote / Any City</option>
                          </select>
                          <p className="text-[10px] text-muted-foreground">Salaries will be adjusted using PPP cost-of-living index for your city.</p>
                        </div>

                        {/* Languages Section */}
                        <div className="space-y-3 border border-border rounded-xl p-3 bg-card">
                          <span className="font-bold block text-[10.5px]">🌐 Language & Translation</span>
                          <div className="space-y-2">
                            <div>
                              <span className="font-semibold block text-[10.5px] mb-1">App UI Language</span>
                              <select
                                value={appLanguage}
                                onChange={e => setAppLanguage(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                              >
                                <option value="en">English</option>
                                <option value="hi">Hindi (हिंदी)</option>
                                <option value="mr">Marathi (मराठी)</option>
                                <option value="ta">Tamil (தமிழ்)</option>
                                <option value="te">Telugu (తెలుగు)</option>
                              </select>
                            </div>
                              <div>
                              <span className="font-semibold block text-[10.5px] mb-1">Description Language style</span>
                              <select
                                value={careerDescriptionsLang}
                                onChange={e => setCareerDescriptionsLang(e.target.value as typeof careerDescriptionsLang)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                              >
                                <option value="en">English Only</option>
                                <option value="hinglish">Hinglish / Regional Mix</option>
                                <option value="regional">Pure Translated Regional</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Rank Your Career Priorities (Spec L3140-3162) */}
                        <div className="space-y-3 border border-border rounded-xl p-3 bg-card">
                          <div className="flex justify-between items-center">
                            <span className="font-bold block text-[10.5px]">🎯 Career Priorities (Rank 1-5)</span>
                            <span className="text-[9px] text-muted-foreground">Adjust Rank</span>
                          </div>
                          <div className="space-y-1.5">
                            {careerPriorities.map((priority, index) => (
                              <div key={priority} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/40">
                                <span className="font-semibold text-[10.5px]">{index + 1}. {priority}</span>
                                <div className="flex gap-1">
                                  <button
                                    disabled={index === 0}
                                    onClick={() => {
                                      const next = [...careerPriorities];
                                      const temp = next[index - 1];
                                      next[index - 1] = next[index];
                                      next[index] = temp;
                                      setCareerPriorities(next);
                                      toast.success(`Moved ${priority} up!`);
                                    }}
                                    className="ghost w-5 h-5 rounded border border-border flex items-center justify-center text-[9px] disabled:opacity-30 cursor-pointer"
                                  >
                                    ▲
                                  </button>
                                  <button
                                    disabled={index === careerPriorities.length - 1}
                                    onClick={() => {
                                      const next = [...careerPriorities];
                                      const temp = next[index + 1];
                                      next[index + 1] = next[index];
                                      next[index] = temp;
                                      setCareerPriorities(next);
                                      toast.success(`Moved ${priority} down!`);
                                    }}
                                    className="ghost w-5 h-5 rounded border border-border flex items-center justify-center text-[9px] disabled:opacity-30 cursor-pointer"
                                  >
                                    ▼
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Exploration Preferences */}
                        <div className="space-y-3 border border-border rounded-xl p-3 bg-card">
                          <span className="font-bold block text-[10.5px]">🧭 Exploration Preferences</span>
                          
                          {/* Path type */}
                          <div className="space-y-1">
                            <span className="font-semibold block text-[10px] text-muted-foreground">Path Planning Optimization</span>
                            <select
                              value={pathPreference}
                              onChange={e => setPathPreference(e.target.value as typeof pathPreference)}
                              className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-[10.5px] outline-none"
                            >
                              <option value="fastest">⚡ Fastest Switch Path</option>
                              <option value="safest">🛡️ Safest (Low risk / High stability)</option>
                              <option value="cheapest">💰 Cheapest (Low training cost)</option>
                              <option value="balanced">⚖️ Balanced (Recommended)</option>
                            </select>
                          </div>

                          {/* Education Preferences */}
                          <div className="space-y-1.5 pt-1">
                            <span className="font-semibold block text-[10px] text-muted-foreground">Education Gate Options</span>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: "Accept degree paths", val: educationPreference.anyDegree, set: (v: boolean) => setEducationPreference(prev => ({ ...prev, anyDegree: v })) },
                                { label: "Accept bootcamps", val: educationPreference.bootcamp, set: (v: boolean) => setEducationPreference(prev => ({ ...prev, bootcamp: v })) },
                                { label: "Filter specific degree only", val: educationPreference.specificDegree, set: (v: boolean) => setEducationPreference(prev => ({ ...prev, specificDegree: v })) },
                                { label: "No-degree paths only", val: educationPreference.noDegree, set: (v: boolean) => setEducationPreference(prev => ({ ...prev, noDegree: v })) }
                              ].map((opt, i) => (
                                <label key={i} className="flex items-center gap-1.5 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={opt.val} 
                                    onChange={e => opt.set(e.target.checked)}
                                    className="rounded border-border bg-background cursor-pointer"
                                  />
                                  <span className="text-[10px]">{opt.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Salary Expectation Inputs */}
                          <div className="space-y-1.5 pt-1">
                            <span className="font-semibold block text-[10px] text-muted-foreground">Salary Expectations</span>
                            <div className="flex gap-2 items-center">
                              <div className="flex-1">
                                <span className="text-[9px] text-muted-foreground block">Minimum</span>
                                <input 
                                  type="number" 
                                  value={salaryMin} 
                                  onChange={e => setSalaryMin(Number(e.target.value))}
                                  className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[10.5px]"
                                />
                              </div>
                              <div className="flex-1">
                                <span className="text-[9px] text-muted-foreground block">Target</span>
                                <input 
                                  type="number" 
                                  value={salaryTarget} 
                                  onChange={e => setSalaryTarget(Number(e.target.value))}
                                  className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[10.5px]"
                                />
                              </div>
                              <div>
                                <span className="text-[9px] text-muted-foreground block">Unit</span>
                                <button
                                  onClick={() => setSalaryUnit(prev => prev === "annual" ? "monthly" : "annual")}
                                  className="h-6 px-2 text-[9.5px] border border-border bg-muted/40 rounded-lg cursor-pointer font-bold"
                                >
                                  {salaryUnit === "annual" ? "LPA" : "K/mo"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Relocation */}
                          <div className="space-y-1.5 pt-1">
                            <span className="font-semibold block text-[10px] text-muted-foreground">Relocation & Remote Preference</span>
                            <div className="space-y-1.5">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={relocationPreference.willingToRelocate} 
                                  onChange={e => setRelocationPreference(prev => ({ ...prev, willingToRelocate: e.target.checked }))}
                                  className="rounded border-border cursor-pointer"
                                />
                                <span className="text-[10px]">Willing to relocate for work</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={relocationPreference.remoteOnly} 
                                  onChange={e => setRelocationPreference(prev => ({ ...prev, remoteOnly: e.target.checked }))}
                                  className="rounded border-border cursor-pointer"
                                />
                                <span className="text-[10px]">Remote work only (WFH)</span>
                              </label>
                            </div>
                          </div>

                          {/* Exam Gate rules */}
                          <div className="space-y-1 pt-1">
                            <span className="font-semibold block text-[10px] text-muted-foreground">Exam Warning Config</span>
                            <select
                              value={examGatePreference.warnRules}
                              onChange={e => setExamGatePreference(prev => ({ ...prev, warnRules: e.target.value }))}
                              className="w-full bg-background border border-border rounded-lg px-2 py-1.5 text-[10.5px] outline-none"
                            >
                              <option value="always">Always warn on mandatory exam gates</option>
                              <option value="once">Warn only once per pathway</option>
                              <option value="never">Hide exam gate warnings</option>
                            </select>
                          </div>
                        </div>

                        {/* Accessibility & Inclusion (Spec L2925-3000) */}
                        <div className="space-y-3 border border-border rounded-xl p-3 bg-card">
                          <span className="font-bold block text-[10.5px]">♿ Accessibility & Inclusion Preferences</span>
                          <div className="space-y-2">
                            {[
                              { label: "Neurodivergent Mode", desc: "Removes all animations & simplifies UI", val: neurodivergentMode, set: setNeurodivergentMode },
                              { label: "Accessible Careers Only", desc: "Filters roles with low physical/sensory barriers", val: accessibleOnly, set: setAccessibleOnly }
                            ].map((toggle, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <div>
                                  <span className="font-semibold block">{toggle.label}</span>
                                  <span className="text-[9.5px] text-muted-foreground">{toggle.desc}</span>
                                </div>
                                <button
                                  onClick={() => toggle.set(!toggle.val)}
                                  className={`ghost w-9 h-5 rounded-full relative transition-colors shrink-0 ${
                                    toggle.val ? "bg-[#3B8BD4]" : "bg-muted border border-border"
                                  }`}
                                >
                                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                    toggle.val ? "translate-x-4" : "translate-x-0.5"
                                  }`} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Specific Needs selections */}
                          {accessibleOnly && (
                            <div className="p-2.5 bg-muted/30 border border-border rounded-xl space-y-2 mt-2">
                              <span className="font-bold block text-[9.5px] text-neutral-400">SELECT ACCESSIBILITY FILTERS:</span>
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                {[
                                  { label: "♿ Physical Disability", val: accessibilityNeeds.physicalDisability, set: (v: boolean) => setAccessibilityNeeds(prev => ({ ...prev, physicalDisability: v })) },
                                  { label: "👂 Hearing Impairment", val: accessibilityNeeds.hearingImpairment, set: (v: boolean) => setAccessibilityNeeds(prev => ({ ...prev, hearingImpairment: v })) },
                                  { label: "👁️ Vision Impairment", val: accessibilityNeeds.visionImpairment, set: (v: boolean) => setAccessibilityNeeds(prev => ({ ...prev, visionImpairment: v })) },
                                  { label: "🧠 Neurodivergence Support", val: accessibilityNeeds.neurodivergent, set: (v: boolean) => setAccessibilityNeeds(prev => ({ ...prev, neurodivergent: v })) },
                                  { label: "🎗️ Chronic Illness Friendly", val: accessibilityNeeds.chronicIllness, set: (v: boolean) => setAccessibilityNeeds(prev => ({ ...prev, chronicIllness: v })) },
                                  { label: "❤️ Mental Health Aware", val: accessibilityNeeds.mentalHealth, set: (v: boolean) => setAccessibilityNeeds(prev => ({ ...prev, mentalHealth: v })) }
                                ].map((opt, i) => (
                                  <label key={i} className="flex items-center gap-1.5 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={opt.val} 
                                      onChange={e => {
                                        opt.set(e.target.checked);
                                        toast.info(`${opt.label} filter updated.`);
                                      }}
                                      className="rounded border-border bg-background cursor-pointer"
                                    />
                                    <span>{opt.label.split(" ")[1]}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Mental Health Specific Needs */}
                          {accessibilityNeeds.mentalHealth && (
                            <div className="p-2.5 bg-rose-50/5 dark:bg-rose-955/10 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-2 mt-2 text-[10px]">
                              <span className="font-bold block text-[9.5px] text-rose-500">🧠 MENTAL HEALTH WORKPLACE CRITERIA:</span>
                              <div className="space-y-1.5">
                                {[
                                  { label: "Low stress index / Steady pace", val: mentalHealthNeeds.lowStress, set: (v: boolean) => setMentalHealthNeeds(prev => ({ ...prev, lowStress: v })) },
                                  { label: "Flexible WLB / Critical work hours limit", val: mentalHealthNeeds.wlbCritical, set: (v: boolean) => setMentalHealthNeeds(prev => ({ ...prev, wlbCritical: v })) },
                                  { label: "Avoid tight deadline pressures", val: mentalHealthNeeds.avoidDeadlines, set: (v: boolean) => setMentalHealthNeeds(prev => ({ ...prev, avoidDeadlines: v })) },
                                  { label: "Supportive, collaborative culture", val: mentalHealthNeeds.supportiveCulture, set: (v: boolean) => setMentalHealthNeeds(prev => ({ ...prev, supportiveCulture: v })) },
                                  { label: "Preference for independent / Solo work", val: mentalHealthNeeds.preferSolo, set: (v: boolean) => setMentalHealthNeeds(prev => ({ ...prev, preferSolo: v })) }
                                ].map((opt, i) => (
                                  <label key={i} className="flex items-center gap-1.5 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={opt.val} 
                                      onChange={e => opt.set(e.target.checked)}
                                      className="rounded border-border bg-background cursor-pointer"
                                    />
                                    <span>{opt.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Display Preferences */}
                        <div className="space-y-3 border border-border rounded-xl p-3 bg-card">
                          <span className="font-bold block text-[10.5px]">📺 Display Preferences</span>
                          <div className="space-y-2">
                            <div>
                              <span className="font-semibold block text-[10px] mb-1">Map View Mode</span>
                              <select
                                value={mapViewMode}
                                onChange={e => setMapViewMode(e.target.value as typeof mapViewMode)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                              >
                                <option value="match">Match Score Heatmap</option>
                                <option value="salary">Salary Progression Heatmap</option>
                                <option value="demand">Market Demand / Hiring Spikes</option>
                                <option value="clusters">Sector Clusters view</option>
                              </select>
                            </div>
                            
                            <div>
                              <span className="font-semibold block text-[10px] mb-1">Default Detail Depth</span>
                              <select
                                value={detailsDepth}
                                onChange={e => setDetailsDepth(e.target.value as typeof detailsDepth)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                              >
                                <option value="quick">Quick Card View (Fewer tabs)</option>
                                <option value="standard">Standard Detailed view (All tabs)</option>
                                <option value="deep">Deep Dive Study (Includes tutorials)</option>
                              </select>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              <span className="font-semibold block text-[10px] text-muted-foreground">Enabled Map Layers</span>
                              <div className="space-y-1 text-[10px]">
                                {[
                                  { label: "Hiring Demand Indicators", val: mapLayers.hiringDemand, set: (v: boolean) => setMapLayers(prev => ({ ...prev, hiringDemand: v })) },
                                  { label: "Career Clusters Overlay", val: mapLayers.careerClusters, set: (v: boolean) => setMapLayers(prev => ({ ...prev, careerClusters: v })) },
                                  { label: "AI Automation Risk Heatmap", val: mapLayers.automationRisk, set: (v: boolean) => setMapLayers(prev => ({ ...prev, automationRisk: v })) },
                                  { label: "Remote-friendly tag", val: mapLayers.remoteFriendly, set: (v: boolean) => setMapLayers(prev => ({ ...prev, remoteFriendly: v })) }
                                ].map((opt, i) => (
                                  <label key={i} className="flex items-center gap-1.5 cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={opt.val} 
                                      onChange={e => opt.set(e.target.checked)}
                                      className="rounded border-border cursor-pointer bg-background"
                                    />
                                    <span>{opt.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Gamification settings */}
                        <div className="space-y-3 border border-border rounded-xl p-3 bg-card">
                          <span className="font-bold block text-[10.5px]">🎮 Gamification & XP</span>
                          <div className="space-y-2">
                            <div>
                              <span className="font-semibold block text-[10px] mb-1">XP & Badges Mode</span>
                              <select
                                value={xpBadgesMode}
                                onChange={e => setXpBadgesMode(e.target.value as typeof xpBadgesMode)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                              >
                                <option value="enabled">Enabled (Pops & Badges active)</option>
                                <option value="minimal">Minimal (Summary digests only)</option>
                                <option value="disabled">Disabled (Explore silently)</option>
                              </select>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold block">Visible Leaderboards</span>
                                <span className="text-[9.5px] text-muted-foreground">Compare points with peers</span>
                              </div>
                              <button
                                onClick={() => setLeaderboardVisible(!leaderboardVisible)}
                                className={`ghost w-9 h-5 rounded-full relative transition-colors shrink-0 ${
                                  leaderboardVisible ? "bg-[#3B8BD4]" : "bg-muted border border-border"
                                }`}
                              >
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                  leaderboardVisible ? "translate-x-4" : "translate-x-0.5"
                                }`} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold block">Streaks & Reminders</span>
                                <span className="text-[9.5px] text-muted-foreground">Alerts for exploration streaks</span>
                              </div>
                              <button
                                onClick={() => setStreaksEnabled(!streaksEnabled)}
                                className={`ghost w-9 h-5 rounded-full relative transition-colors shrink-0 ${
                                  streaksEnabled ? "bg-[#3B8BD4]" : "bg-muted border border-border"
                                }`}
                              >
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                  streaksEnabled ? "translate-x-4" : "translate-x-0.5"
                                }`} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Privacy & Data Settings */}
                        <div className="space-y-3 border border-border rounded-xl p-3 bg-card">
                          <span className="font-bold block text-[10.5px]">🔒 Privacy & Data Permissions</span>
                          <div className="space-y-2">
                            
                            {/* Incognito mode toggle */}
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-semibold block">Incognito Mode</span>
                                <span className="text-[9.5px] text-muted-foreground font-medium">Hides tracking coordinates & stops history</span>
                              </div>
                              <button
                                onClick={() => {
                                  const nextVal = !isIncognito;
                                  setIsIncognito(nextVal);
                                  if (nextVal) {
                                    setShowIncognitoPrompt(true);
                                  }
                                }}
                                className={`ghost w-9 h-5 rounded-full relative transition-colors shrink-0 ${
                                  isIncognito ? "bg-neutral-600" : "bg-muted border border-border"
                                }`}
                              >
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                  isIncognito ? "translate-x-4" : "translate-x-0.5"
                                }`} />
                              </button>
                            </div>

                            {/* History save selection */}
                            <div>
                              <span className="font-semibold block text-[10px] mb-1">Exploration History Log</span>
                              <select
                                value={historyRule}
                                onChange={e => setHistoryRule(e.target.value as typeof historyRule)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                              >
                                <option value="save">Save permanently to my account</option>
                                <option value="delete90">Auto-delete after 90 days</option>
                                <option value="never">Never log / Keep sessions ephemeral</option>
                              </select>
                            </div>

                            {/* Share permission rules */}
                            <div>
                              <span className="font-semibold block text-[10px] mb-1">Journey Share Permissions</span>
                              <select
                                value={shareJourneyRule}
                                onChange={e => setShareJourneyRule(e.target.value as typeof shareJourneyRule)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-[11px] outline-none"
                              >
                                <option value="public">🌍 Public (Visible to search engines)</option>
                                <option value="friends">👥 Friends (Mutual connections only)</option>
                                <option value="private">🔒 Private (Me only)</option>
                              </select>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 space-y-1.5">
                              <Button
                                onClick={() => {
                                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ careerPriorities, pathPreference, salaryMin, salaryTarget, currentCity }, null, 2));
                                  const dlAnchorElem = document.createElement('a');
                                  dlAnchorElem.setAttribute("href", dataStr);
                                  dlAnchorElem.setAttribute("download", "myraaha_career_exploration_profile.json");
                                  dlAnchorElem.click();
                                  toast.success("JSON data export started!");
                                }}
                                variant="outline"
                                className="w-full h-8 rounded-lg text-[9.5px] cursor-pointer"
                              >
                                📥 Export Profile Data (JSON)
                              </Button>
                              <Button
                                onClick={() => {
                                  const csvContent = "data:text/csv;charset=utf-8,Parameter,Value\n" + 
                                    `Base City,${currentCity}\n` +
                                    `Path Preference,${pathPreference}\n` +
                                    `Salary Range,${salaryMin}-${salaryTarget} LPA\n` +
                                    `App Language,${appLanguage}\n`;
                                  const dlAnchorElem = document.createElement('a');
                                  dlAnchorElem.setAttribute("href", encodeURI(csvContent));
                                  dlAnchorElem.setAttribute("download", "myraaha_exploration_profile.csv");
                                  dlAnchorElem.click();
                                  toast.success("CSV export started!");
                                }}
                                variant="outline"
                                className="w-full h-8 rounded-lg text-[9.5px] cursor-pointer"
                              >
                                📊 Export Profile Data (CSV)
                              </Button>
                              <Button
                                onClick={() => {
                                  if (confirm("Are you sure you want to permanently erase all exploration log history and reset settings? This cannot be undone.")) {
                                    setCareerPriorities(["Work-Life Balance", "Salary", "Growth Opportunities", "Location Flexibility", "Job Security"]);
                                    setSalaryMin(12);
                                    setSalaryTarget(18);
                                    toast.success("Exploration history cleared. Settings restored to defaults.");
                                  }
                                }}
                                className="w-full h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white border-none font-bold text-[9.5px] cursor-pointer"
                              >
                                🚨 Clear History & Reset Settings
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Notifications Settings */}
                        <div className="space-y-3 border border-border rounded-xl p-3 bg-card">
                          <span className="font-bold block text-[10.5px]">🔔 Notification Settings</span>
                          <div className="space-y-2">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={weeklySummary} 
                                onChange={e => setWeeklySummary(e.target.checked)}
                                className="rounded border-border cursor-pointer bg-background"
                              />
                              <span className="text-[10px]">Weekly journey progress digest</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={milestoneCeleb} 
                                onChange={e => setMilestoneCeleb(e.target.checked)}
                                className="rounded border-border cursor-pointer bg-background"
                              />
                              <span className="text-[10px]">Milestone celebration sound & badges popup</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={nudgeBehind} 
                                onChange={e => setNudgeBehind(e.target.checked)}
                                className="rounded border-border cursor-pointer bg-background"
                              />
                              <span className="text-[10px]">Nudge reminder when falling behind path timeline</span>
                            </label>

                            <div className="pt-1">
                              <span className="font-semibold block text-[10px] mb-1">Career Market Spike Alerts</span>
                              <div className="space-y-1 text-[10px]">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={careerAlertSpikes} 
                                    onChange={e => setCareerAlertSpikes(e.target.checked)}
                                    className="rounded border-border cursor-pointer bg-background"
                                  />
                                  <span>Hiring spikes / Salary increases</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={careerAlertNew} 
                                    onChange={e => setCareerAlertNew(e.target.checked)}
                                    className="rounded border-border cursor-pointer bg-background"
                                  />
                                  <span>New entry-level internships matching skills</span>
                                </label>
                              </div>
                            </div>

                            <div className="pt-1">
                              <span className="font-semibold block text-[10px] mb-1">Alert Digest Frequency</span>
                              <select
                                value={frequency}
                                onChange={e => setFrequency(e.target.value as typeof frequency)}
                                className="w-full bg-background border border-border rounded-lg px-2.5 py-1 text-[10.5px] outline-none"
                              >
                                <option value="realtime">⚡ Realtime alert triggers</option>
                                <option value="daily">📅 Daily summaries</option>
                                <option value="weekly">📆 Weekly newsletters</option>
                              </select>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* MODE: MY JOURNEY TIMELINE — spec L126, L279-286, L509-515 */}

                  {/* MODE: MY JOURNEY TIMELINE — spec L126, L279-286, L509-515 */}
                  {sidebarMode === "timeline" && (
                    <div className="flex flex-col h-full">
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Clock size={14} className="text-[#3B8BD4]" /> My Journey Timeline
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="text-[9px] font-bold">Auto-Tracked</Badge>
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden text-xs flex flex-col">
                        
                        {/* Sub-tab selection */}
                        <div className="flex gap-1 overflow-x-auto border-b border-border/60 pb-2.5 shrink-0 scrollbar-hidden">
                          {[
                            { id: "daily", name: "Daily Log" },
                            { id: "monthly", name: "Monthly" },
                            { id: "yearly", name: "Yearly Review" },
                            { id: "visual", name: "Visual Path" },
                            { id: "insights", name: "Insights" },
                            { id: "takeout", name: "Export" }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setTimelineTab(t.id as typeof timelineTab)}
                              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-[10px] cursor-pointer border-none ${
                                timelineTab === t.id 
                                  ? "bg-[#3B8BD4] text-white" 
                                  : "bg-muted text-muted-foreground hover:bg-muted/70"
                              }`}
                            >
                              {t.name}
                            </button>
                          ))}
                        </div>

                        <div className="flex-1 space-y-4 pt-1.5">
                          {/* TAB 1: DAILY LOG (Spec L1570-1600) */}
                          {timelineTab === "daily" && (
                            <div className="space-y-4">
                              <span className="font-bold text-foreground block">March 2027 Calendar</span>
                              
                              <div className="border border-border rounded-2xl p-3 bg-card shadow-sm space-y-3">
                                <div className="text-center font-bold text-[#3B8BD4] pb-1 border-b border-border/40">
                                  MARCH 2027
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-[10px] text-muted-foreground">
                                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center">
                                  {/* Empty slots for spacing */}
                                  <span className="text-muted-foreground/30 py-1"></span>
                                  <span className="text-muted-foreground/30 py-1">1</span>
                                  <span className="text-muted-foreground/30 py-1">2</span>
                                  <span className="text-muted-foreground/30 py-1">3</span>
                                  <span className="text-muted-foreground/30 py-1">4</span>
                                  <span className="text-muted-foreground/30 py-1">5</span>
                                  <span className="text-muted-foreground/30 py-1">6</span>
                                  <span className="text-muted-foreground/30 py-1">7</span>
                                  <span className="text-muted-foreground/30 py-1">8</span>
                                  <span className="text-muted-foreground/30 py-1">9</span>
                                  <span className="text-muted-foreground/30 py-1">10</span>
                                  <span className="text-muted-foreground/30 py-1">11</span>
                                  <span className="text-muted-foreground/30 py-1">12</span>
                                  <span className="text-muted-foreground/30 py-1">13</span>
                                  <span className="text-muted-foreground/30 py-1">14</span>
                                  {/* Selected day March 15 */}
                                  <button className="bg-[#3B8BD4] text-white rounded-full font-bold w-6 h-6 mx-auto flex items-center justify-center cursor-pointer border-none shadow-sm">
                                    15
                                  </button>
                                  <span className="text-foreground py-1 font-medium">16</span>
                                  <span className="text-foreground py-1 font-medium">17</span>
                                  <span className="text-foreground py-1 font-medium">18</span>
                                  <span className="text-foreground py-1 font-medium">19</span>
                                  <span className="text-foreground py-1 font-medium">20</span>
                                  <span className="text-foreground py-1 font-medium">21</span>
                                  <span className="text-foreground py-1 font-medium">22</span>
                                  <span className="text-foreground py-1 font-medium">23</span>
                                  <span className="text-foreground py-1 font-medium">24</span>
                                  <span className="text-foreground py-1 font-medium">25</span>
                                  <span className="text-foreground py-1 font-medium">26</span>
                                  <span className="text-foreground py-1 font-medium">27</span>
                                  <span className="text-foreground py-1 font-medium">28</span>
                                  <span className="text-foreground py-1 font-medium">29</span>
                                  <span className="text-foreground py-1 font-medium">30</span>
                                  <span className="text-foreground py-1 font-medium">31</span>
                                </div>
                              </div>

                              <div className="border border-border rounded-2xl p-3 bg-card shadow-sm space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                                  <span className="font-bold text-foreground">Activities for March 15, 2027</span>
                                  <span className="text-[#3B8BD4] font-bold">85 XP Earned</span>
                                </div>

                                <div className="space-y-3 text-[11px]">
                                  {[
                                    { time: "9:00 AM", text: "Completed SkillStacker: \"Figma Basics\"", xp: "+50 XP", badge: "Skill" },
                                    { time: "11:30 AM", text: "Explored \"UX Researcher\"", xp: "25 min spent", badge: "Explorer" },
                                    { time: "2:00 PM", text: "Watched Reality Check video from Senior UX Designer", xp: "Video Played", badge: "Insight" },
                                    { time: "4:30 PM", text: "Updated path: Changed route to \"Safest Path\" (was Fastest)", xp: "Path Edit", badge: "Route" },
                                    { time: "8:00 PM", text: "7-day streak maintained 🔥", xp: "+15 XP", badge: "Streak" }
                                  ].map((act, idx) => (
                                    <div key={idx} className="flex gap-2 items-start justify-between">
                                      <div className="flex gap-2">
                                        <span className="text-muted-foreground font-mono text-[10px] w-14 shrink-0 pt-0.5">{act.time}</span>
                                        <div>
                                          <span className="text-foreground font-medium block leading-snug">{act.text}</span>
                                          <Badge className="bg-muted hover:bg-muted text-muted-foreground text-[8px] border-none font-semibold mt-1 px-1 h-3.5 uppercase">{act.badge}</Badge>
                                        </div>
                                      </div>
                                      <span className="text-[#3B8BD4] font-bold shrink-0 text-[10px]">{act.xp}</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-2.5 border-t border-border/40 flex justify-between text-[10px] font-semibold text-muted-foreground">
                                  <span>Match Score Shift:</span>
                                  <span className="text-emerald-600 font-bold">68% → 70% (+2%)</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TAB 2: MONTHLY SUMMARY (Spec L1603-1631) */}
                          {timelineTab === "monthly" && (
                            <div className="space-y-3.5">
                              <span className="font-bold text-foreground block">MARCH 2027 SUMMARY</span>

                              <div className="border border-border rounded-2xl p-3.5 bg-card shadow-sm space-y-3">
                                <div>
                                  <span className="font-bold text-foreground text-[11px] block">🗺️ Careers Explored (23 total)</span>
                                  <div className="text-[10px] text-muted-foreground mt-1.5 space-y-1 pl-2.5 border-l-2 border-slate-300">
                                    <p>• <strong>Most time spent:</strong> Product Manager (3.5 hours)</p>
                                    <p>• <strong>New sectors discovered:</strong> Healthcare, Education</p>
                                    <p>• <strong>Dream Board additions:</strong> 7 careers saved</p>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-bold text-foreground text-[11px] block">📚 Skills Built</span>
                                  <div className="text-[10px] text-muted-foreground mt-1.5 space-y-1 pl-2.5 border-l-2 border-emerald-500">
                                    <p>• <strong>Completed:</strong> 8 SkillStacker modules</p>
                                    <p>• <strong>In progress:</strong> User Research Fundamentals</p>
                                    <p>• <strong>Match score growth:</strong> 65% → 74% (+9%)</p>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-bold text-foreground text-[11px] block">🎯 Journey Milestones</span>
                                  <div className="text-[10px] text-muted-foreground mt-1.5 space-y-1 pl-2.5 border-l-2 border-purple-500">
                                    <p>• <strong>✓ PM Bootcamp completed</strong> (March 12)</p>
                                    <p>• <strong>✓ First portfolio project</strong> (March 20)</p>
                                    <p>• <strong>🏆 Badge unlocked:</strong> "Focused Learner"</p>
                                  </div>
                                </div>

                                <div>
                                  <span className="font-bold text-foreground text-[11px] block">🚀 Path Metrics</span>
                                  <div className="text-[10px] text-muted-foreground mt-1.5 space-y-1 pl-2.5 border-l-2 border-blue-500">
                                    <p>• <strong>Path:</strong> Fastest to Product Manager</p>
                                    <p>• <strong>Time elapsed:</strong> 3 months (9 months remaining)</p>
                                    <p>• <strong>On track:</strong> Yes (+2 weeks ahead of schedule)</p>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10.5px]">
                                  <span className="text-muted-foreground font-semibold">XP Earned: <strong className="text-foreground">2,450 XP</strong></span>
                                  <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-none font-bold text-[9px]">Navigator (Level 3)</Badge>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TAB 3: YEARLY SUMMARY (Spec L1633-1674) */}
                          {timelineTab === "yearly" && (
                            <div className="space-y-3">
                              <span className="font-bold text-foreground block">2027 CAREER YEAR IN REVIEW</span>

                              <div className="border border-border rounded-2xl p-3.5 bg-card shadow-sm space-y-3.5">
                                <div className="space-y-1">
                                  <span className="font-bold text-foreground text-[11px] block">🗺️ Exploration Stats:</span>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• 247 careers explored across 12 sectors</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• 45 hours spent in RoleView</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• 89 Reality Check videos watched</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• Tech, Healthcare, Finance most explored</p>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-bold text-foreground text-[11px] block">📚 Learning Stats:</span>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• 56 SkillStacker modules completed</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• 12 certifications earned</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• Match score: Started 45% → Now 92%</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• 3 exam gates cleared</p>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-bold text-foreground text-[11px] block">🎯 Journey Milestones:</span>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• January: Started as Class 12 student</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• March: Completed PM bootcamp</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• June: First PM internship at Startup Y</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• November: Landed PM role at Startup X</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3 font-semibold text-emerald-600">• December: 🏆 DESTINATION REACHED</p>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-bold text-foreground text-[11px] block">🏆 Achievements:</span>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• 15 badges unlocked (Level 5: Pioneer achieved)</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• 12,450 total XP earned (7-month streak 🔥)</p>
                                </div>

                                <div className="space-y-1">
                                  <span className="font-bold text-foreground text-[11px] block">📍 Cities & Roles Considered:</span>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• Bengaluru (top choice - secured role here)</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3">• Pune (explored 45 companies) · Pune (considered)</p>
                                  <p className="text-[10.5px] text-muted-foreground pl-3 font-semibold text-foreground pt-1">Top Considered Roles:</p>
                                  <p className="text-[10px] text-muted-foreground pl-3">1. Product Manager ⭐ (chosen)</p>
                                  <p className="text-[10px] text-muted-foreground pl-3">2. UX Designer (close second)</p>
                                  <p className="text-[10px] text-muted-foreground pl-3">3. Data Analyst (backup option)</p>
                                </div>

                                <div className="flex gap-2 pt-2 border-t border-border/40">
                                  <Button 
                                    onClick={() => alert("Downloading full yearly career report (PDF)...")}
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 text-[9px] h-7 rounded-xl font-bold gap-1 cursor-pointer"
                                  >
                                    <Download size={10} /> PDF Report
                                  </Button>
                                  <Button 
                                    onClick={() => alert("LinkedIn sharing API initialized for Career Year in Review...")}
                                    size="sm"
                                    className="flex-1 text-[9px] h-7 rounded-xl font-bold bg-[#0077b5] text-white hover:bg-[#006296] gap-1 cursor-pointer border-none"
                                  >
                                    <Share2 size={10} /> Share Review
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TAB 4: VISUAL TIMELINE SCROLL (Spec L1676-1724) */}
                          {timelineTab === "visual" && (
                            <div className="space-y-3">
                              <span className="font-bold text-foreground block">YOUR JOURNEY MAP (Scroll View)</span>
                              
                              <div className="border border-border rounded-2xl p-4 bg-card shadow-sm relative pl-6 space-y-4">
                                <div className="absolute left-3.5 top-5 bottom-5 w-0.5 bg-muted-foreground/30" />

                                {[
                                  { month: "January 2027", items: ["🎯 Took Curiosity Compass", "📍 \"You Are Here\" pin: Class 12 student"] },
                                  { month: "February 2027", items: ["🗺️ Explored 45 careers", "💾 Saved 8 to Dream Board", "🎓 Committed to PM path"] },
                                  { month: "March 2027", items: ["📚 PM Bootcamp: Modules 1-8", "✓ First project completed"] },
                                  { month: "April 2027", items: ["📚 PM Bootcamp: Modules 9-12", "🏆 Bootcamp Graduate badge unlocked"] },
                                  { month: "May 2027", items: ["🛠️ Portfolio Project 2 launched", "🛠️ Portfolio Project 3 launched"] },
                                  { month: "June 2027", items: ["💼 PM Internship started (Startup Y)"] },
                                  { month: "July-August 2027", items: ["💼 PM Internship continues", "🎯 Match score: 85%"] },
                                  { month: "September 2027", items: ["💼 Internship completed", "📝 Applied to 52 companies"] },
                                  { month: "October 2027", items: ["🎤 12 interviews completed", "📧 4 job offers received"] },
                                  { month: "November 2027", items: ["🎉 ACCEPTED: PM at Startup X", "🏆 DESTINATION REACHED!"] },
                                  { month: "December 2027", items: ["🌟 Became mentor for others", "📈 Exploring Senior PM path"] }
                                ].map((step, idx) => (
                                  <div key={idx} className="relative space-y-1">
                                    <div className="absolute -left-4 w-2 h-2 rounded-full bg-[#3B8BD4] border-2 border-background" />
                                    <span className="font-bold text-foreground text-[10.5px] block">{step.month}</span>
                                    <div className="text-[10px] text-muted-foreground space-y-0.5">
                                      {step.items.map((it, i) => (
                                        <p key={i}>{it}</p>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* TAB 5: PATTERNS & INSIGHTS (Spec L1726-1760) */}
                          {timelineTab === "insights" && (
                            <div className="space-y-3.5">
                              <span className="font-bold text-foreground block">🔍 PATTERNS WE NOTICED</span>

                              <div className="border border-border rounded-2xl p-3.5 bg-card shadow-sm space-y-3">
                                <div className="space-y-1">
                                  <span className="font-bold text-foreground text-[11px] block">📅 Exploration Schedule:</span>
                                  <p className="text-[10.5px] text-muted-foreground">• Sundays (avg 1.5 hours)</p>
                                  <p className="text-[10.5px] text-muted-foreground">• After 8 PM on weekdays</p>
                                </div>

                                <div className="space-y-1 border-t border-border/40 pt-2">
                                  <span className="font-bold text-foreground text-[11px] block">🧠 Exploration Style:</span>
                                  <p className="text-[10.5px] text-muted-foreground">• <strong>Deep diver:</strong> You spend 20+ min per career</p>
                                  <p className="text-[10.5px] text-muted-foreground">• <strong>Video learner:</strong> 89% of Reality Checks watched</p>
                                  <p className="text-[10.5px] text-muted-foreground">• <strong>Methodical:</strong> You explore similar roles together</p>
                                </div>

                                <div className="space-y-1 border-t border-border/40 pt-2">
                                  <span className="font-bold text-foreground text-[11px] block">💡 Recommendations based on history:</span>
                                  <p className="text-[10.5px] text-muted-foreground">• You keep returning to "Design" careers → Have you considered <strong>"Product Designer"</strong>?</p>
                                  <p className="text-[10.5px] text-muted-foreground">• You explored "Data Analyst" 4 times → Still interested? Plan a path?</p>
                                  <p className="text-[10.5px] text-muted-foreground">• You haven't explored "Government" sector → Worth a look? Many stable careers there.</p>
                                </div>
                              </div>

                              <span className="font-bold text-foreground block pt-1">Edit Your Timeline</span>
                              <div className="border border-border rounded-2xl p-3 bg-card shadow-sm space-y-2">
                                <span className="font-medium text-foreground block text-[10.5px]">March 15, 2027:</span>
                                <p className="text-[10.5px] text-muted-foreground">You explored "Graphic Designer" (12 min spent)</p>
                                
                                {correctedTimelineItems["graphic"] ? (
                                  <span className="text-emerald-600 font-bold text-[9.5px] block pt-1">
                                    ✓ Correction recorded! System will adjust recommendations.
                                  </span>
                                ) : (
                                  <div className="flex gap-1.5 pt-1">
                                    <button 
                                      onClick={() => setCorrectedTimelineItems(prev => ({ ...prev, graphic: true }))}
                                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 h-6 rounded-lg text-[9px] font-bold cursor-pointer border-none"
                                    >
                                      ✓ Correct
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setCorrectedTimelineItems(prev => ({ ...prev, graphic: true }));
                                        toast.success("Timeline updated: Graphic Designer explorer record deleted.");
                                      }}
                                      className="bg-red-50 text-red-700 hover:bg-red-100 px-2 py-1 h-6 rounded-lg text-[9px] font-bold cursor-pointer border-none"
                                    >
                                      ✗ I didn't explore this
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* TAB 6: EXPORT CAREER DATA (Spec L1762-1774) */}
                          {timelineTab === "takeout" && (
                            <div className="space-y-3.5">
                              <span className="font-bold text-foreground block">Download Your Career Data</span>

                              <div className="border border-border rounded-2xl p-4 bg-card shadow-sm space-y-3.5">
                                <span className="text-[11px] text-muted-foreground block leading-snug">
                                  Export your full explorer history, portfolio bookmarks, and learning stats (Google Takeout equivalent).
                                </span>

                                <div className="space-y-2.5 pl-1">
                                  {[
                                    { label: "Full exploration history (CSV)", check: true },
                                    { label: "All saved careers & dreamboards (JSON)", check: true },
                                    { label: "Journey timeline checklist (PDF)", check: true },
                                    { label: "Skills build progress sheets (Excel)", check: false },
                                    { label: "Match score evolution charts (PNG)", check: true },
                                    { label: "Complete portable profile folder (ZIP)", check: false }
                                  ].map((exportItem, idx) => (
                                    <label key={idx} className="flex items-center gap-2.5 cursor-pointer text-[10.5px]">
                                      <input 
                                        type="checkbox" 
                                        defaultChecked={exportItem.check}
                                        className="accent-[#3B8BD4]"
                                      />
                                      <span className="text-foreground font-medium">{exportItem.label}</span>
                                    </label>
                                  ))}
                                </div>

                                <Button
                                  onClick={() => {
                                    toast.success("Takeout bundle generated successfully! Download started.");
                                    alert("Downloading career_takeout_SaraTarannum_2027.zip (1.2 MB)...");
                                  }}
                                  className="w-full bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-9 rounded-xl border-none cursor-pointer mt-2"
                                >
                                  Download All Data
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  )}

                  {/* MODE: DREAM BOARD (Spec L1244-1365) */}
                  {sidebarMode === "dreamboard" && (
                    <div className="flex flex-col h-full bg-background">
                      {/* Header */}
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Star size={14} className="text-amber-500 fill-amber-500" /> Your Dream Board
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[9.5px] border-blue-500 text-[#185FA5] font-bold">
                            {savedRoles.length} Saved
                          </Badge>
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      {/* 5-Tab Selector Bar */}
                      <div className="flex border-b border-border overflow-x-auto scrollbar-hidden bg-muted/20 shrink-0">
                        {["Top Choices", "Explored", "Considering", "Paths Created", "Collections"].map(tab => (
                          <button
                            key={tab}
                            onClick={() => {
                              setDreamBoardActiveTab(tab);
                              setActiveCollectionDetailName(null);
                            }}
                            className={`ghost flex-1 py-2 px-3 text-[10px] font-bold whitespace-nowrap border-b-2 transition-colors outline-none cursor-pointer ${
                              dreamBoardActiveTab === tab 
                                ? "border-[#3B8BD4] text-[#3B8BD4]" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                      
                      {/* Content Panel */}
                      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs scrollbar-hidden">
                        
                        {/* TAB 1: TOP CHOICES */}
                        {dreamBoardActiveTab === "Top Choices" && (
                          <div className="space-y-3">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                              Primary Career Options (Starred Favorites)
                            </span>
                            <div className="space-y-2">
                              {Object.values(ROLE_DETAILS_MOCK)
                                .filter(r => dreamBoardSavedRoles[r.id] === "Top Choices" && savedRoles.includes(r.id))
                                .map(role => (
                                  <div key={role.id} className="p-3 border border-border bg-card rounded-xl space-y-2.5 shadow-sm">
                                    <div className="flex justify-between items-start">
                                      <div onClick={() => handleOpenRole(role.id)} className="cursor-pointer">
                                        <span className="font-bold text-xs text-foreground block hover:text-[#3B8BD4] transition-colors">{role.name}</span>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">{role.category}</span>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          setSavedRoles(prev => prev.filter(id => id !== role.id));
                                          toast.success("Removed from favorites");
                                        }}
                                        className="ghost text-slate-400 hover:text-red-500 rounded-full p-1 cursor-pointer"
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] bg-muted/30 p-2 rounded-lg border border-border/50">
                                      <span className="text-emerald-600 font-bold">{role.matchScore}% Match</span>
                                      <span className="text-slate-600 font-medium">{role.avgSalary}</span>
                                    </div>
                                    
                                    {/* Action Links */}
                                    <div className="flex gap-1.5">
                                      <Button
                                        onClick={() => { handleOpenRole(role.id); setSidebarMode("pathfinder"); }}
                                        variant="outline"
                                        className="flex-1 h-6 text-[9.5px] rounded-lg font-semibold flex items-center gap-1"
                                      >
                                        <Navigation size={10} className="rotate-45" /> Path
                                      </Button>
                                      <Button
                                        onClick={() => { handleOpenRole(role.id); setSidebarMode("comparison"); }}
                                        variant="outline"
                                        className="flex-1 h-6 text-[9.5px] rounded-lg font-semibold flex items-center gap-1"
                                      >
                                        <GitCompare size={10} /> Compare
                                      </Button>
                                    </div>
                                  </div>
                                ))}

                              {Object.values(ROLE_DETAILS_MOCK).filter(r => dreamBoardSavedRoles[r.id] === "Top Choices" && savedRoles.includes(r.id)).length === 0 && (
                                <div className="py-8 text-center text-xs text-slate-400 italic">
                                  No starred roles here yet. Star your favorite roles on the map.
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* TAB 2: EXPLORED */}
                        {dreamBoardActiveTab === "Explored" && (
                          <div className="space-y-3">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                              Recently Research Sessions (Time Logged)
                            </span>
                            <div className="space-y-2">
                              {[
                                { id: "pm", name: "Product Manager", time: "45 min spent" },
                                { id: "designer", name: "UX Designer", time: "30 min spent" },
                                { id: "swengineer", name: "Software Engineer", time: "20 min spent" }
                              ].map(item => (
                                <div key={item.id} className="p-3 border border-border bg-card rounded-xl flex items-center justify-between shadow-sm">
                                  <div onClick={() => handleOpenRole(item.id)} className="cursor-pointer">
                                    <span className="font-bold text-xs text-foreground block hover:text-[#3B8BD4] transition-colors">{item.name}</span>
                                    <span className="text-[9.5px] text-slate-400 block mt-0.5">{item.time}</span>
                                  </div>
                                  <Button
                                    onClick={() => handleOpenRole(item.id)}
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[9px] rounded-lg px-2 flex items-center gap-0.5"
                                  >
                                    Review <ChevronRight size={10} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 3: CONSIDERING */}
                        {dreamBoardActiveTab === "Considering" && (
                          <div className="space-y-3">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                              Actively Researching / Backup Roles
                            </span>
                            <div className="space-y-2">
                              {Object.values(ROLE_DETAILS_MOCK)
                                .filter(r => ["Exploring", "Backup Options", "Stretch Goals"].includes(dreamBoardSavedRoles[r.id]) && savedRoles.includes(r.id))
                                .map(role => (
                                  <div key={role.id} className="p-3 border border-border bg-card rounded-xl space-y-2 shadow-sm">
                                    <div className="flex justify-between items-start">
                                      <div onClick={() => handleOpenRole(role.id)} className="cursor-pointer">
                                        <span className="font-bold text-xs text-foreground block hover:text-[#3B8BD4] transition-colors">{role.name}</span>
                                        <span className="text-[10px] text-muted-foreground block mt-0.5">{role.category}</span>
                                      </div>
                                      <button 
                                        onClick={() => {
                                          setSavedRoles(prev => prev.filter(id => id !== role.id));
                                          toast.success("Removed from Considering");
                                        }}
                                        className="ghost text-slate-400 hover:text-red-500 rounded-full p-1 cursor-pointer"
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>
                                    <div className="flex justify-between items-center text-[9px]">
                                      <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                                        {dreamBoardSavedRoles[role.id]}
                                      </Badge>
                                      <span className="text-slate-500">{role.avgSalary}</span>
                                    </div>
                                  </div>
                                ))}

                              {Object.values(ROLE_DETAILS_MOCK).filter(r => ["Exploring", "Backup Options", "Stretch Goals"].includes(dreamBoardSavedRoles[r.id]) && savedRoles.includes(r.id)).length === 0 && (
                                <div className="py-8 text-center text-xs text-slate-400 italic">
                                  No backup options saved. Save roles on the map to see them here.
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* TAB 4: PATHS CREATED */}
                        {dreamBoardActiveTab === "Paths Created" && (
                          <div className="space-y-3">
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                              Saved Routes / PathFinder Iterations
                            </span>
                            <div className="space-y-2">
                              {[
                                { dest: "Product Manager", type: "Fastest Route", time: "12 months", match: "88%" },
                                { dest: "UX Designer", type: "Safest Route", time: "18 months", match: "85%" }
                              ].map((route, i) => (
                                <div key={i} className="p-3 border border-border bg-card rounded-xl space-y-2 shadow-sm">
                                  <div>
                                    <span className="font-bold text-xs text-foreground block">Path to {route.dest}</span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5 block">{route.type} • {route.time}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[9.5px] bg-emerald-50 dark:bg-emerald-950/20 p-1.5 rounded-lg">
                                    <span className="text-emerald-700 font-bold">{route.match} Compatibility score</span>
                                    <button 
                                      onClick={() => {
                                        setNavigationMode(true);
                                        toast.success("GPS active for " + route.dest);
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[9px] flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Navigation size={8} className="rotate-45" /> Activate GPS
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 5: COLLECTIONS */}
                        {dreamBoardActiveTab === "Collections" && (
                          <div className="space-y-3">
                            {activeCollectionDetailName === null ? (
                              // List collections
                              <div className="space-y-3">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">
                                  Custom Career Group Lists
                                </span>
                                <div className="space-y-2">
                                  {dreamBoardCollections.map(col => (
                                    <div 
                                      key={col.name} 
                                      onClick={() => setActiveCollectionDetailName(col.name)}
                                      className="p-3 border border-border bg-card rounded-xl shadow-sm hover:border-[#3B8BD4] transition-colors cursor-pointer space-y-1"
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="font-bold text-xs text-foreground block">{col.name}</span>
                                        <Badge variant="secondary" className="text-[8.5px] py-0 px-1.5 border-none">
                                          {col.roles.length} roles
                                        </Badge>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground truncate leading-normal">{col.desc}</p>
                                      <span className="text-[8.5px] text-[#185FA5] block mt-1">{col.privacy}</span>
                                    </div>
                                  ))}
                                </div>

                                <Button 
                                  onClick={() => setDreamBoardCreateCollectionOpen(true)}
                                  className="w-full bg-[#E6F1FB] hover:bg-[#D5E8F7] text-[#185FA5] text-[10.5px] h-8 rounded-xl font-bold border-none cursor-pointer flex items-center justify-center gap-1"
                                >
                                  + Create New Collection
                                </Button>
                              </div>
                            ) : (
                              // Collection detail sub-view
                              (() => {
                                const col = dreamBoardCollections.find(c => c.name === activeCollectionDetailName);
                                if (!col) return null;
                                return (
                                  <div className="space-y-3">
                                    <button 
                                      onClick={() => setActiveCollectionDetailName(null)}
                                      className="text-[10px] font-bold text-[#185FA5] hover:underline flex items-center gap-0.5 cursor-pointer pb-1"
                                    >
                                      ← Back to Collections
                                    </button>
                                    
                                    <div className="border border-border p-3.5 rounded-xl bg-muted/20 space-y-1.5">
                                      <div className="flex justify-between items-start">
                                        <span className="font-bold text-sm text-foreground block">{col.name}</span>
                                        <Button
                                          onClick={() => {
                                            setSelectedCollectionToShare(col.name);
                                            setDreamBoardShareOpen(true);
                                          }}
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-[9.5px] px-2 flex items-center gap-0.5"
                                        >
                                          <Share2 size={10} /> Share
                                        </Button>
                                      </div>
                                      <p className="text-[10px] text-muted-foreground leading-normal">{col.desc}</p>
                                      <Badge variant="outline" className="text-[8.5px] border-slate-300 text-slate-600 bg-white">
                                        {col.privacy}
                                      </Badge>
                                    </div>

                                    <div className="space-y-2.5 pt-2">
                                      {col.roles.map(roleId => {
                                        const role = ROLE_DETAILS_MOCK[roleId];
                                        if (!role) return null;
                                        return (
                                          <div key={role.id} className="p-3 border border-border bg-card rounded-xl space-y-2 shadow-sm">
                                            <div className="flex justify-between items-start">
                                              <div onClick={() => handleOpenRole(role.id)} className="cursor-pointer">
                                                <span className="font-bold text-xs text-foreground block hover:text-[#3B8BD4] transition-colors">{role.name}</span>
                                                <span className="text-[9.5px] text-muted-foreground block mt-0.5">{role.category}</span>
                                              </div>
                                              <button 
                                                onClick={() => {
                                                  setDreamBoardCollections(prev => prev.map(c => {
                                                    if (c.name === col.name) {
                                                      return { ...c, roles: c.roles.filter(r => r !== role.id) };
                                                    }
                                                    return c;
                                                  }));
                                                  toast.success(`Removed ${role.name} from list`);
                                                }}
                                                className="ghost text-slate-400 hover:text-red-500 rounded-full p-1 cursor-pointer"
                                                title="Remove from list"
                                              >
                                                <X size={13} />
                                              </button>
                                            </div>

                                            {/* Note Input */}
                                            <div className="space-y-1">
                                              <span className="text-[9px] text-muted-foreground font-bold uppercase">Reflections & Notes:</span>
                                              <input
                                                type="text"
                                                value={dreamBoardNotes[role.id] || ""}
                                                onChange={(e) => {
                                                  const text = e.target.value;
                                                  setDreamBoardNotes(prev => ({ ...prev, [role.id]: text }));
                                                }}
                                                placeholder="Concerned about math? Degree needed?"
                                                className="w-full bg-background border border-border rounded-lg px-2 py-1 text-[10px] text-foreground outline-none focus:border-[#3B8BD4]"
                                              />
                                            </div>
                                          </div>
                                        );
                                      })}

                                      {col.roles.length === 0 && (
                                        <div className="py-8 text-center text-xs text-slate-400 italic">
                                          This collection is empty. Explore the map to add roles!
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* MODE: REALITY CHECK REVIEWS CONTRIBUTIONS */}
                  {sidebarMode === "realitycheck" && (
                    <div className="flex flex-col h-full">
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Users size={14} className="text-[#3B8BD4]" /> Contribute Reality Checks™
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-none text-[8.5px] font-bold">Local Guide</Badge>
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hidden">
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          Have workspace experience? Anonymously submit ratings & day-in-life reflections to refine CareerMap GPS coordinates.
                        </p>

                        <div className="border border-border rounded-xl p-3.5 space-y-3 bg-card shadow-sm text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">Work-Life Balance rating:</span>
                            <div className="flex gap-1 text-yellow-500 cursor-pointer text-sm">
                              <span>★</span><span>★</span><span>★</span><span>★</span><span className="text-muted/30">★</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">Entry Difficulty rating:</span>
                            <div className="flex gap-1 text-yellow-500 cursor-pointer text-sm">
                              <span>★</span><span>★</span><span>★</span><span className="text-muted/30">★</span><span className="text-muted/30">★</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <span className="font-semibold text-foreground block">Anonymous confession/tip:</span>
                            <textarea 
                              placeholder="e.g. '80% of work is coordination, make sure you love communication...'" 
                              className="w-full bg-background border border-border rounded-lg p-2.5 text-[10.5px] h-16 outline-none resize-none text-foreground"
                            />
                          </div>

                          <Button 
                            onClick={() => alert("Reality Check review submitted for verification!")}
                            className="secondary w-full bg-[#3B8BD4] hover:bg-[#185FA5] text-white text-[11px] h-8 rounded-lg"
                          >
                            Submit Verified Review (+100 XP)
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE: PULSE HIRING ACTIVITY */}
                  {sidebarMode === "pulse" && (
                    <div className="flex flex-col h-full">
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Activity size={14} className="text-[#E24B4A] animate-pulse" /> Live Hiring Pulse
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hidden text-xs">
                        {[
                          { title: "🔥 Hot Role Alert: Bengaluru Tech", desc: "247 companies hiring Product Managers in Bengaluru this week. Average salaries rising.", time: "2m ago" },
                          { title: "⚠️ Saturated Period: Mumbai Finance", desc: "Finance Analyst hiring down 30% this month - consider switching options temporarily.", time: "1h ago" },
                          { title: "↗️ Emerging Career Peak: AI Prompting", desc: "Cybersecurity Analyst hiring in Pune/Hyderabad spike by 45% post regional standard audits.", time: "3h ago" }
                        ].map((item, idx) => (
                          <div key={idx} className="p-3 border border-border rounded-xl bg-card shadow-sm flex items-start gap-2.5">
                            <span className="text-[12px] p-1 bg-muted rounded shrink-0 block text-center" style={{ width: "24px" }}>
                              📢
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-foreground text-[11px] truncate">{item.title}</span>
                                <span className="text-[8px] text-muted-foreground shrink-0">{item.time}</span>
                              </div>
                              <p className="text-muted-foreground text-[10px] mt-0.5 leading-snug">{item.desc}</p>
                            </div>
                          </div>
                        ))}

                        <div className="border border-border rounded-xl p-3 bg-card space-y-1.5 shadow-sm">
                          <span className="font-bold text-foreground flex items-center gap-1">
                            <Award size={13} className="text-yellow-500" /> Weekly exploration challenge
                          </span>
                          <p className="text-muted-foreground text-[10px] leading-snug">
                            "Build a dream board collection of 3 careers that can be done 100% remotely."
                          </p>
                          <Button 
                            onClick={() => setSidebarMode("dreamboard")}
                            variant="outline"
                            className="text-[10px] h-7 px-3 rounded-lg border-[#3B8BD4] text-[#185FA5] hover:bg-[#E6F1FB]"
                          >
                            Go Build Collection
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE: AUTOPILOT (Spec L2119-2228) */}
                  {sidebarMode === "autopilot" && (
                    <div className="flex flex-col h-full bg-card">
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0 bg-muted/20">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Compass size={14} className="text-purple-500 animate-spin-slow" /> Career Autopilot
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden text-xs">
                        {/* Setup Card */}
                        <div className="border border-border rounded-2xl p-3.5 bg-card shadow-sm space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-foreground">Progression Settings</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground">{autopilotActive ? "Active" : "Inactive"}</span>
                              <input 
                                type="checkbox" 
                                checked={autopilotActive} 
                                onChange={(e) => {
                                  setAutopilotActive(e.target.checked);
                                  toast.success(e.target.checked ? "Autopilot activated! Monitoring promotions, skill gaps, and market timing." : "Autopilot disabled.");
                                }}
                                className="w-8 h-4 rounded-full accent-purple-600 cursor-pointer"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-[10.5px]">
                            <div>
                              <span className="text-muted-foreground block text-[9.5px]">CURRENT ROLE:</span>
                              <input 
                                type="text" 
                                value={autopilotCurrentRole} 
                                onChange={(e) => setAutopilotCurrentRole(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-3 h-8 text-foreground mt-1 outline-none font-semibold"
                              />
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[9.5px]">TARGET ROLE:</span>
                              <input 
                                type="text" 
                                value={autopilotTargetRole} 
                                onChange={(e) => setAutopilotTargetRole(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-3 h-8 text-foreground mt-1 outline-none font-semibold"
                              />
                            </div>
                          </div>
                        </div>

                        {autopilotActive ? (
                          <div className="space-y-4">
                            {/* Progression Dashboard */}
                            <div className="border border-border rounded-2xl p-3.5 bg-card shadow-sm space-y-3">
                              <span className="font-bold text-foreground block">YOUR PROGRESSION STATUS</span>
                              <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                                <span>Readiness to Promoted:</span>
                                <span className="text-purple-600 font-bold">{autopilotReadiness}% Ready</span>
                              </div>
                              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full rounded-full transition-all duration-300" style={{ width: `${autopilotReadiness}%` }} />
                              </div>

                              <div className="space-y-2 pt-1.5">
                                <span className="font-semibold block text-[10px] text-muted-foreground uppercase">Skills Gap:</span>
                                <div className="space-y-1.5 text-[10.5px]">
                                  <div className="flex justify-between items-center">
                                    <span className="text-foreground">✓ Product Strategy</span>
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[8.5px] border-none">Strong</Badge>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-foreground">✓ User Research</span>
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[8.5px] border-none">Strong</Badge>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-foreground">⚠ System Design</span>
                                    <Badge className="bg-amber-100 text-amber-800 text-[8.5px] border-none">Gap - Build</Badge>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-foreground">⚠ Team Leadership</span>
                                    <Badge className="bg-amber-100 text-amber-800 text-[8.5px] border-none">Gap</Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-border/40 text-[10.5px]">
                                <span className="font-semibold block text-[10px] text-muted-foreground uppercase">Market Timing:</span>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                                  <span className="font-bold text-emerald-600">🟢 Good time to aim for promotion</span>
                                </div>
                                <p className="text-muted-foreground text-[9.5px] mt-0.5">High demand for senior product professionals in Bengaluru and Pune.</p>
                              </div>

                              <div className="pt-2 border-t border-border/40 text-[10.5px]">
                                <span className="font-semibold block text-[10px] text-muted-foreground uppercase">Next Milestone:</span>
                                <p className="text-foreground mt-0.5">Complete "Advanced Product Strategy" course by March 15.</p>
                              </div>
                            </div>

                            {/* Smart Timing Notification */}
                            <div className="border border-purple-200 bg-purple-50/40 rounded-2xl p-3.5 space-y-2.5">
                              <span className="font-bold text-purple-800 block text-[11px] flex items-center gap-1">
                                🔔 Promotion Prep Checklist
                              </span>
                              <p className="text-purple-900 text-[10.5px] leading-snug">
                                Your company's Q2 promotion cycle opens in 45 days. Complete recommendations to bump success rate.
                              </p>
                              <div className="space-y-1 text-[10px] text-purple-950 font-medium">
                                <div>1. Complete 2 pending SkillStacker modules</div>
                                <div>2. Document 3 major wins from last quarter</div>
                                <div>3. Schedule a growth talk with your manager</div>
                              </div>
                              <Button 
                                onClick={() => {
                                  setAutopilotReadiness(78);
                                  toast.success("Ready checklist updated! Readiness boosted to 78%. Promotion probability is 65%.");
                                }}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-7 rounded-xl text-[9.5px] border-none cursor-pointer"
                              >
                                Complete Checklist Actions
                              </Button>
                            </div>

                            {/* Weekly Career Health Check */}
                            <div className="border border-border rounded-2xl p-3.5 bg-card shadow-sm space-y-3">
                              <span className="font-bold text-foreground block">📊 WEEKLY CAREER HEALTH CHECK</span>
                              
                              <div className="space-y-2 text-[10.5px]">
                                <div className="space-y-1">
                                  <span className="font-bold text-emerald-600 block">📈 Positive Signals:</span>
                                  <div className="text-muted-foreground pl-2 leading-relaxed">
                                    • You completed 2 leadership tasks (+5% readiness) <br/>
                                    • Senior PM openings are up 20% in Bengaluru <br/>
                                    • Your organization announced Q3 expansion plans
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <span className="font-bold text-amber-600 block">⚠️ Attention Needed:</span>
                                  <div className="text-muted-foreground pl-2 leading-relaxed">
                                    • You haven't practiced system design in 3 weeks <br/>
                                    • Peer in your cohort got promoted recently
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                onClick={() => {
                                  setSidebarMode("pathfinder");
                                  toast.info("Opening Pathfinder to build System Design route!");
                                }}
                                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold h-7 rounded-xl text-[9.5px] border-none cursor-pointer"
                              >
                                Take Recommended Actions
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground space-y-2">
                            <Compass size={36} className="mx-auto text-muted-foreground opacity-30" />
                            <p className="font-medium text-[11px]">Autopilot is currently inactive.</p>
                            <p className="text-[9.5px] max-w-[200px] mx-auto leading-normal">Activate Autopilot to receive real-time alerts, promotion trackers, and skill-gap recommendations.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MODE: PIONEER (Spec L2046-2092) */}
                  {sidebarMode === "pioneer" && (
                    <div className="flex flex-col h-full bg-card">
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0 bg-muted/20">
                        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          <Award size={14} className="text-amber-500" /> Pioneer Program
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hidden text-xs">
                        {/* Status Card */}
                        <div className="border border-amber-200 bg-amber-50/20 rounded-2xl p-4 shadow-sm space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-extrabold text-foreground text-sm block">🏆 Pioneer Level 4</span>
                              <span className="text-[10px] text-amber-700 font-bold block mt-0.5">{pioneerPoints} points earned</span>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800 border-none font-bold text-[9px]">Local Guide Elite</Badge>
                          </div>

                          {/* Progress bar to Level 5 */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8.5px] text-muted-foreground font-semibold">
                              <span>Next Level: 1,500 pts</span>
                              <span>{1500 - pioneerPoints} pts to go</span>
                            </div>
                            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full transition-all duration-300" style={{ width: `${(pioneerPoints / 1500) * 100}%` }} />
                            </div>
                          </div>

                          {/* Points Breakdown */}
                          <div className="pt-2 border-t border-amber-200/50 space-y-1.5 text-[10px]">
                            <span className="font-semibold text-muted-foreground block text-[9px] uppercase">Points Breakdown:</span>
                            <div className="space-y-1 text-foreground/80">
                              <div className="flex justify-between">
                                <span>3 Reality Checks</span>
                                <span className="font-bold">+150 pts</span>
                              </div>
                              <div className="flex justify-between">
                                <span>12 Q&A answers</span>
                                <span className="font-bold">+120 pts</span>
                              </div>
                              <div className="flex justify-between">
                                <span>45 Career photos</span>
                                <span className="font-bold">+90 pts</span>
                              </div>
                              <div className="flex justify-between">
                                <span>8 Data edits</span>
                                <span className="font-bold">+80 pts</span>
                              </div>
                              <div className="flex justify-between">
                                <span>1 New career added</span>
                                <span className="font-bold">+200 pts</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Perks */}
                        <div className="border border-border rounded-2xl p-3.5 bg-card shadow-sm space-y-2">
                          <span className="font-bold text-foreground block">Level 4 Perks</span>
                          <div className="space-y-1.5 text-[10.5px] text-muted-foreground">
                            <div>✓ Early access to new CareerMap tools</div>
                            <div>✓ Priority matching with certified mentors</div>
                            <div>✓ Pioneer badge on profile and reviews</div>
                            <div>✓ Monthly expert Q&A networking events</div>
                          </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="border border-border rounded-2xl p-3.5 bg-card shadow-sm space-y-3">
                          <div className="flex justify-between items-center pb-1">
                            <span className="font-bold text-foreground block">Pioneer Leaderboard</span>
                            <div className="flex bg-muted rounded-lg p-0.5 border border-border text-[9px] font-semibold">
                              <button 
                                onClick={() => setPioneerLeaderboardMode("bengaluru")} 
                                className={`px-2 py-0.5 rounded ${pioneerLeaderboardMode === "bengaluru" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                              >
                                Bengaluru
                              </button>
                              <button 
                                onClick={() => setPioneerLeaderboardMode("national")} 
                                className={`px-2 py-0.5 rounded ${pioneerLeaderboardMode === "national" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
                              >
                                National
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            {(pioneerLeaderboardMode === "bengaluru" ? [
                              { rank: "🥇 1", name: "Rohan M.", points: "2,450 pts", lvl: "Lvl 5" },
                              { rank: "🥈 2", name: "Priya S.", points: "1,890 pts", lvl: "Lvl 4" },
                              { rank: "🥉 3", name: "Amit K.", points: "1,720 pts", lvl: "Lvl 4" },
                              { rank: "   4", name: "You (Sara T.)", points: `${pioneerPoints} pts`, lvl: "Lvl 4", highlight: true },
                              { rank: "   5", name: "Sarah D.", points: "1,100 pts", lvl: "Lvl 3" }
                            ] : [
                              { rank: "🥇 1", name: "Abhishek K.", points: "5,450 pts", lvl: "Lvl 8" },
                              { rank: "🥈 2", name: "Neha J.", points: "4,890 pts", lvl: "Lvl 7" },
                              { rank: "🥉 3", name: "Vikram S.", points: "4,200 pts", lvl: "Lvl 6" },
                              { rank: "  34", name: "You (Sara T.)", points: `${pioneerPoints} pts`, lvl: "Lvl 4", highlight: true }
                            ]).map((user, idx) => (
                              <div 
                                key={idx} 
                                className={`flex justify-between items-center p-2 rounded-xl text-[10.5px] ${
                                  user.highlight ? "bg-amber-100/30 border border-amber-300 font-bold" : ""
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-muted-foreground" style={{ width: "24px" }}>{user.rank}</span>
                                  <span className="text-foreground">{user.name}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-muted-foreground">{user.lvl}</span>
                                  <span className="font-bold text-foreground">{user.points}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE: PATHFINDER DIRECTIONS */}
                  {sidebarMode === "pathfinder" && (
                    <div className="flex flex-col h-full bg-card">
                      {/* Header */}
                      <div className="p-3.5 border-b border-border flex justify-between items-center shrink-0">
                        <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5 tracking-tight">
                          <Navigation size={14} className="text-[#3B8BD4] rotate-45" /> PathFinder™ Directions
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="text-[9px] font-bold">Auto-Fitted</Badge>
                          <button onClick={() => setSelectedRoleOpen(false)} className="ghost text-muted-foreground hover:text-foreground cursor-pointer">
                            <X size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Direction inputs */}
                      <div className="p-3 border-b border-border bg-muted/20 shrink-0 space-y-2">
                        <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-2 text-xs text-foreground">
                          <span className="w-2 h-2 rounded-full bg-[#3B8BD4] shrink-0" />
                          <span className="font-medium text-[11px]">{pathfinderInputs.from}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-background border border-border rounded-lg p-2 text-xs text-foreground">
                          <span className="w-2 h-2 rounded-full bg-[#E24B4A] shrink-0" />
                          <span className="font-medium text-[11px]">{selectedRole.name}, {selectedRole.location.split("/")[0]}</span>
                        </div>
                      </div>

                      {/* Route Types Segmented Control (Spec L2248-2254) */}
                      <div className="p-3 border-b border-border shrink-0 bg-[#E6F1FB]/10">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-1.5">Route Pathway Category</span>
                        <div className="grid grid-cols-3 gap-1 bg-muted rounded-xl p-0.5 border border-border">
                          {[
                            { id: "degree", label: "🎓 Education" },
                            { id: "direct", label: "⚡ Direct" },
                            { id: "corporate", label: "🏢 Corporate" }
                          ].map(type => (
                            <button
                              key={type.id}
                              onClick={() => {
                                setPathfinderRouteType(type.id as typeof pathfinderRouteType);
                                toast.info(`Switched to ${type.label} Pathway.`);
                              }}
                              className={`py-1.5 rounded-lg text-[9.5px] font-bold transition-all cursor-pointer border-none ${
                                pathfinderRouteType === type.id 
                                  ? "bg-[#3B8BD4] text-white shadow" 
                                  : "text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Route Modes Tabs */}
                      <div className="p-3 border-b border-border shrink-0">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block mb-2">Select Route Mode</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { id: "fastest", label: "⚡ Fastest", time: "12 mo", cost: "₹80K", color: "#3B8BD4" },
                            { id: "safest", label: "🛡️ Safest", time: "18 mo", cost: "₹20K", color: "#10B981" },
                            { id: "nocost", label: "💰 No-Cost", time: "24 mo", cost: "₹0", color: "#F59E0B" }
                          ].map(mode => (
                            <div 
                              key={mode.id}
                              onClick={() => setActiveRouteMode(mode.id as typeof activeRouteMode)}
                              style={{ borderColor: activeRouteMode === mode.id ? mode.color : "" }}
                              className={`border p-2 rounded-xl text-center cursor-pointer transition-colors shadow-sm ${
                                activeRouteMode === mode.id ? "bg-[#E6F1FB]/30 border-2" : "border-border hover:bg-muted/40"
                              }`}
                            >
                              <span className="text-[10px] font-bold text-foreground block">{mode.label}</span>
                              <span className="text-[11px] font-bold text-foreground block mt-0.5">{mode.time}</span>
                              <span className="text-[9.5px] font-bold block" style={{ color: mode.color }}>{mode.cost}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Path Details Content scrollable */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-hidden">
                        
                        {/* Traffic alerts & Dynamic Notifications */}
                        <div className="space-y-2">
                          <div className="bg-[#E1F5EE] border border-[#A7E6D2] rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
                            <Activity size={14} className="text-[#0F6E56] shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="text-[10px] text-[#0F6E56] uppercase font-bold block">Live Hiring Surge Active</span>
                              <p className="text-[10.5px] text-[#0A4D3B] leading-snug mt-0.5">
                                High hiring surge in Bengaluru for {selectedRole.name} this month — Route ETA reduced by 2 months.
                              </p>
                            </div>
                          </div>

                          {activeRouteMode === "fastest" && (
                            <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 rounded-xl p-3 flex items-start gap-2.5 shadow-sm">
                              <Zap size={14} className="text-amber-600 shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold block">Bootcamp Scholarship Alert</span>
                                <p className="text-[10.5px] text-amber-800 dark:text-amber-300 leading-snug mt-0.5">
                                  Myraaha Academy just announced a 40% scholarship for Nagpur residents. Route cost reduced to ₹48,000!
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Route Stats */}
                        <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-xl border border-border">
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold block">Skill Gap Distance</span>
                            <span className="text-xs font-bold text-foreground mt-0.5 block">You have 60% of skills, need 40%</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold block">Difficulty Level</span>
                            <span className="text-xs font-bold text-foreground mt-0.5 block">⭐⭐⭐⭐ (Very Demanding)</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold block">Success Rate</span>
                            <span className="text-xs font-bold text-emerald-600 mt-0.5 block">70% successful entry</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold block">Checkpoints Stops</span>
                            <span className="text-xs font-bold text-[#E24B4A] mt-0.5 block">1 Exam Gate checkpoint</span>
                          </div>
                          <div className="col-span-2 border-t border-border/40 pt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span className="font-semibold text-foreground flex items-center gap-1">♿ Accessibility Rating: 4.8/5</span>
                            <span className="text-[9px] text-emerald-600 font-bold uppercase">Hearing & Neurodivergence Accommodated</span>
                          </div>
                        </div>

                        {/* Multi-Stage Career Sequencer Panel (Spec L1369-1467) */}
                        <div className="border border-purple-200 dark:border-purple-950/40 bg-purple-50/40 dark:bg-purple-950/10 rounded-xl p-3.5 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#7F77DD] flex items-center gap-1.5 text-xs">
                              <Compass size={13} className="animate-spin-slow text-[#7F77DD]" /> Multi-Stage Path Sequencer™
                            </span>
                            <Badge className="bg-purple-100 text-purple-700 border-none font-bold text-[8.5px] uppercase px-1">
                              Sequencing Active
                            </Badge>
                          </div>
                          
                          <p className="text-[10px] text-muted-foreground leading-snug">
                            Define your ultimate destination and design the intermediate career stops. We calculate step-to-step readiness metrics.
                          </p>

                          <div className="space-y-2">
                            {/* Intermediate Stops */}
                            <div className="space-y-1.5">
                              {[
                                { stage: 1, role: "Software Engineer", duration: "12 mo", readiness: "90% Prepared", active: sequenceCurrentStage === 1, completed: sequenceCurrentStage > 1 },
                                { stage: 2, role: "Product Manager (Current)", duration: "18 mo", readiness: "85% Prepared", active: sequenceCurrentStage === 2, completed: sequenceCurrentStage > 2 },
                                { stage: 3, role: "Founder (Ultimate Destination)", duration: "24 mo", readiness: "70% Prepared", active: sequenceCurrentStage === 3, completed: sequenceCurrentStage > 3 }
                              ].map((stop) => (
                                <div 
                                  key={stop.stage}
                                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                                    stop.active 
                                      ? "bg-purple-100/55 dark:bg-purple-950/30 border-[#7F77DD] text-[#7F77DD]" 
                                      : stop.completed 
                                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-700 opacity-80"
                                        : "bg-background border-border text-muted-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] border ${
                                      stop.completed 
                                        ? "bg-emerald-500 border-emerald-500 text-white" 
                                        : stop.active 
                                          ? "bg-[#7F77DD] border-[#7F77DD] text-white" 
                                          : "bg-muted border-border text-muted-foreground"
                                    }`}>
                                      {stop.completed ? <Check size={10} className="stroke-[3]" /> : stop.stage}
                                    </div>
                                    <div>
                                      <span className="font-bold text-xs block text-foreground">{stop.role}</span>
                                      <span className="text-[9.5px] text-muted-foreground block font-medium">Duration: {stop.duration} • Readiness: {stop.readiness}</span>
                                    </div>
                                  </div>
                                  
                                  {stop.active && (
                                    <Badge className="bg-purple-500 text-white border-none font-bold text-[8.5px] py-0.5 px-1.5">
                                      Active Stop
                                    </Badge>
                                  )}
                                  
                                  {!stop.active && !stop.completed && (
                                    <button 
                                      onClick={() => {
                                        setSequenceCurrentStage(stop.stage);
                                        toast.success(`Active sequence stage updated to: ${stop.role}`);
                                      }}
                                      className="text-[9.5px] font-bold text-sky-600 hover:underline cursor-pointer"
                                    >
                                      Set Active
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Controls */}
                            <div className="flex gap-2 justify-end pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  toast.info("Drag & Drop is simulated. Re-ordered sequence to: PM -> SWE -> Founder.");
                                }}
                                className="h-6 text-[9.5px] rounded-lg px-2 flex items-center gap-0.5"
                              >
                                <ArrowUpDown size={10} /> Reorder Stops
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  toast.success("Added Custom Stop: Growth PM Specialist!");
                                }}
                                className="h-6 text-[9.5px] rounded-lg px-2 flex items-center gap-0.5"
                              >
                                + Add Custom Stop
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Fork Ahead Lane Guidance (Spec L188-195) */}
                        <div className="border border-orange-200 dark:border-orange-950/40 bg-orange-50/40 dark:bg-orange-950/10 rounded-xl p-3.5 space-y-2">
                          <div className="flex justify-between items-center text-[10.5px]">
                            <span className="font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                              <GitBranch size={13} /> Fork Ahead: Choose Your Lane
                            </span>
                            {activeLane && (
                              <button onClick={() => setActiveLane(null)} className="ghost text-[9.5px] underline text-muted-foreground hover:text-foreground">
                                Reset
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-snug">
                            Customise your milestones and projects by selecting a lane:
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <button
                              onClick={() => {
                                setActiveLane("analytics");
                                alert("Lane Set: Product Analytics Focus. Your Month 4-6 portfolio milestones now focus on telemetry & cohort retention.");
                              }}
                              className={`ghost py-1.5 px-2 text-[10px] font-semibold border rounded-lg transition-colors text-center cursor-pointer ${
                                activeLane === "analytics" 
                                  ? "bg-orange-500 border-orange-500 text-white" 
                                  : "bg-background border-border text-foreground hover:bg-muted"
                              }`}
                            >
                              📊 Product Analytics
                            </button>
                            <button
                              onClick={() => {
                                setActiveLane("growth");
                                alert("Lane Set: Growth Product Management. Your Month 4-6 portfolio milestones now focus on A/B testing & viral loops.");
                              }}
                              className={`ghost py-1.5 px-2 text-[10px] font-semibold border rounded-lg transition-colors text-center cursor-pointer ${
                                activeLane === "growth" 
                                  ? "bg-orange-500 border-orange-500 text-white" 
                                  : "bg-background border-border text-foreground hover:bg-muted"
                              }`}
                            >
                              🚀 Growth PM
                            </button>
                          </div>
                        </div>

                        {/* Milestone checklist */}
                        <div className="border border-border rounded-xl p-3.5 bg-background shadow-sm space-y-3">
                          <span className="font-bold text-foreground block border-b border-border pb-1">Milestone-by-Milestone roadmap</span>
                           {pathfinderRouteType === "degree" && (
                             <div className="space-y-3.5 relative pl-3 border-l border-[#3B8BD4] ml-1.5">
                               <div 
                                 onClick={() => {
                                   setSelectedStationDetail({
                                     name: "IIT Bombay (B.Tech)",
                                     location: "Mumbai",
                                     duration: "4 years",
                                     fees: "₹8-10 Lakhs total",
                                     rating: 4.7,
                                     exam: "JEE Advanced",
                                     cutoff: "Rank < 2000",
                                     examDate: "May 2027",
                                     placementRate: "95%",
                                     avgSalary: "₹18 LPA",
                                     careers: "Software Engineer, Product Manager, Analyst"
                                   });
                                 }}
                                 className="relative cursor-pointer group bg-muted/10 hover:bg-sky-50/40 p-2 rounded-xl border border-transparent hover:border-[#3B8BD4]/30 transition-all"
                               >
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-[#3B8BD4] ring-4 ring-background" />
                                 <span className="font-bold text-foreground block group-hover:text-[#185FA5] transition-colors">🎓 Station: IIT Bombay (B.Tech)</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">JEE Advanced cutoff. Duration: 4 yrs. Click to inspect gate details.</span>
                               </div>

                               <div 
                                 onClick={() => {
                                   setSelectedStationDetail({
                                     name: "IIM Bangalore (MBA - Optional)",
                                     location: "Bengaluru",
                                     duration: "2 years",
                                     fees: "₹23 Lakhs total",
                                     rating: 4.8,
                                     exam: "CAT",
                                     cutoff: "Percentile > 99.5",
                                     examDate: "Nov 2026",
                                     placementRate: "98%",
                                     avgSalary: "₹26 LPA",
                                     careers: "Product Manager, Consultant, Investment Banker"
                                   });
                                 }}
                                 className="relative cursor-pointer group bg-muted/10 hover:bg-sky-50/40 p-2 rounded-xl border border-transparent hover:border-[#3B8BD4]/30 transition-all"
                               >
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-[#3B8BD4] ring-4 ring-background" />
                                 <span className="font-bold text-foreground block group-hover:text-[#185FA5] transition-colors">🎓 Station: IIM Bangalore (MBA)</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">CAT cutoff. Cost: ₹23L. High placement rate. Click to inspect.</span>
                               </div>

                               <div 
                                 onClick={() => {
                                   setSelectedStationDetail({
                                     name: "Associate PM Campus Hire",
                                     location: "Metro Cities",
                                     duration: "1-2 years",
                                     fees: "₹0 (Paid Internship)",
                                     rating: 4.2,
                                     exam: "Case Studies / interviews",
                                     cutoff: "Academic record + Case portfolio",
                                     examDate: "Continuous",
                                     placementRate: "80%",
                                     avgSalary: "₹12 LPA",
                                     careers: "Product Manager"
                                   });
                                 }}
                                 className="relative cursor-pointer group bg-muted/10 hover:bg-sky-50/40 p-2 rounded-xl border border-transparent hover:border-[#3B8BD4]/30 transition-all"
                               >
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-background" />
                                 <span className="font-bold text-[#E24B4A] block">🚦 Checkpoint: APM Campus Placement</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">Pass interview gates. Click to inspect transition criteria.</span>
                               </div>

                               <div className="relative p-2">
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-background" />
                                 <span className="font-bold text-foreground block">🎯 Destination: Product Manager</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">Target compensation: ₹18-25 LPA. Lock offer.</span>
                               </div>
                             </div>
                           )}

                           {pathfinderRouteType === "direct" && (
                             <div className="space-y-3 relative pl-3 border-l border-[#3B8BD4] ml-1.5">
                               <div className="relative bg-muted/10 p-2 rounded-xl">
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-[#3B8BD4] ring-4 ring-background" />
                                 <span className="font-bold text-foreground block">📚 Phase 1: PM Bootcamp (3 months)</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">Nagpur Tech Bootcamp. Cost: ₹80,000. 8 hrs/day focus.</span>
                               </div>

                               <div className="relative bg-muted/10 p-2 rounded-xl">
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-[#3B8BD4] ring-4 ring-background" />
                                 <span className="font-bold text-foreground block">🛠️ Phase 2: Portfolio Building (3 months)</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">
                                   {activeLane === "analytics" && "Build 3 portfolio projects on Product Analytics: Amplitude instrumentation."}
                                   {activeLane === "growth" && "Build 3 portfolio projects on Growth PM: A/B testing designs."}
                                   {!activeLane && "Build 3 real portfolio case studies: User research & Figma wireframes."}
                                 </span>
                               </div>

                               <div className="relative bg-muted/10 p-2 rounded-xl">
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-background" />
                                 <span className="font-bold text-[#E24B4A] block">🚦 Checkpoint: Case Portfolio & Resume Review</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">Get verified review by top pioneers before applying.</span>
                               </div>

                               <div className="relative bg-muted/10 p-2 rounded-xl">
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-[#3B8BD4] ring-4 ring-background" />
                                 <span className="font-bold text-foreground block">💼 Phase 3: PM Internship (3-6 months)</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">Apply to 20+ startups for real-world experience.</span>
                               </div>

                               <div className="relative p-2">
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-background" />
                                 <span className="font-bold text-foreground block">🎯 Destination: Junior PM / Product Manager Offer</span>
                               </div>
                             </div>
                           )}

                           {pathfinderRouteType === "corporate" && (
                             <div className="space-y-3.5 relative pl-3 border-l border-[#3B8BD4] ml-1.5">
                               <div className="relative bg-muted/10 p-2 rounded-xl">
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-[#3B8BD4] ring-4 ring-background" />
                                 <span className="font-bold text-foreground block">🏢 Phase 1: Corporate Training Program</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">6 months internal training on company tools & analytics frameworks.</span>
                               </div>

                               <div className="relative bg-muted/10 p-2 rounded-xl">
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-[#3B8BD4] ring-4 ring-background" />
                                 <span className="font-bold text-foreground block">🔄 Phase 2: Internal Shadowing (12 months)</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">Shadow current PMs. Build inter-team relationship signals.</span>
                               </div>

                               <div className="relative bg-muted/10 p-2 rounded-xl">
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-background" />
                                 <span className="font-bold text-[#E24B4A] block">🚦 Checkpoint: Internal PM Interview Board</span>
                                 <span className="text-muted-foreground text-[10px] mt-0.5 block">Internal conversion evaluation committee approval.</span>
                               </div>

                               <div className="relative p-2">
                                 <span className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-background" />
                                 <span className="font-bold text-foreground block">🎯 Destination: Corporate Product Manager</span>
                               </div>
                             </div>
                           )}
                        </div>
                      </div>

                      {/* Start Committing Button */}
                      <div className="p-3 border-t border-border shrink-0 bg-background">
                        <Button 
                          onClick={() => {
                            setNavigationMode(true);
                            setSelectedRoleOpen(false);
                          }}
                          className="w-full text-xs gap-1.5 bg-[#3B8BD4] hover:bg-[#185FA5] text-white rounded-xl h-10 shadow-md animate-pulse"
                        >
                          <Play size={12} fill="white" /> Commit to This Path (Start GPS Tracking)
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* MODE: ROLEVIEW DETAIL (18 TABS SYSTEM) */}
                  {sidebarMode === "detail" && (
                    <div className="flex flex-col h-full bg-background overflow-y-auto scrollbar-hidden select-text">
                      {/* Hero Image / Video Banner */}
                      <div className="w-full h-24 bg-slate-800 relative overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600')` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-2 left-4 right-4 text-white">
                          <h2 className="text-lg font-extrabold leading-tight text-white tracking-tight">{selectedRole.name}</h2>
                          <span className="text-[10px] text-neutral-300 block">{selectedRole.category}</span>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
                          <button 
                            onClick={() => setIsDetailsFullScreen(!isDetailsFullScreen)}
                            className="ghost w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white cursor-pointer"
                            title={isDetailsFullScreen ? "Exit Full Screen" : "Full Screen"}
                          >
                            {isDetailsFullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                          </button>
                          <button 
                            onClick={() => { setSelectedRoleOpen(false); setIsDetailsFullScreen(false); }}
                            className="ghost w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white cursor-pointer"
                            title="Close"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Info Header Card */}
                      <div className="px-3 pb-3 pt-0 border-b border-border shrink-0">
                        <div className="flex justify-between items-start pt-3">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-foreground">{selectedRole.avgSalary} avg</span>
                              <Badge className="bg-[#E6F1FB] text-[#185FA5] hover:bg-[#E6F1FB] text-[10px] border-none font-bold py-0 px-1.5">
                                {selectedRole.matchScore}% Match
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">{selectedRole.location}</span>
                          </div>
                          <Badge variant="outline" className="text-[9px] border-emerald-500 text-emerald-600 font-bold uppercase shrink-0 py-0 px-1">
                            {selectedRole.demandStatus}
                          </Badge>
                        </div>

                        {/* Action buttons row — standard Google Maps pill style */}
                        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-hidden pb-0.5">
                          <Button 
                            onClick={() => setSidebarMode("pathfinder")}
                            size="sm"
                            className="bg-[#3B8BD4] hover:bg-[#185FA5] text-white text-[9px] h-6 px-2.5 rounded-full flex items-center gap-1 shrink-0 font-semibold"
                          >
                            <Navigation size={10} className="rotate-45" /> Plan My Path
                          </Button>
                          <Button 
                            onClick={() => setDreamBoardQuickSaveOpen(true)}
                            size="sm"
                            variant="outline"
                            className="text-[9px] h-6 px-2.5 rounded-full flex items-center gap-1 shrink-0 font-semibold"
                          >
                            <Bookmark size={10} className={isRoleSaved(selectedRole.id) ? "fill-[#3B8BD4] text-[#3B8BD4]" : ""} />
                            {isRoleSaved(selectedRole.id) ? "Saved" : "Save"}
                          </Button>
                          <Button 
                            onClick={() => alert(`Direct share: http://localhost:8080/dashboard/careermap?role=${selectedRole.id}`)}
                            size="sm"
                            variant="outline"
                            className="text-[9px] h-6 px-2.5 rounded-full flex items-center gap-1 shrink-0 font-semibold"
                          >
                            <Share2 size={10} /> Share
                          </Button>
                          <Button 
                            onClick={() => { setSidebarMode("comparison"); }}
                            size="sm"
                            variant="outline"
                            className="text-[9px] h-6 px-2.5 rounded-full flex items-center gap-1 shrink-0 font-semibold"
                          >
                            <GitCompare size={10} /> Compare
                          </Button>
                          <Button 
                            onClick={() => setShowSkillGapAR(true)}
                            size="sm"
                            variant="outline"
                            className="text-[9px] h-6 px-2.5 rounded-full flex items-center gap-1 shrink-0 border-pink-500 text-pink-600 hover:bg-pink-50/20 font-semibold"
                          >
                            📸 Skill Gap AR
                          </Button>
                        </div>
                      </div>

                      {/* 18 TABS HORIZONTAL SCROLL BAR */}
                      <div className="flex border-b border-border overflow-x-auto scrollbar-hidden bg-background sticky top-0 z-10 shrink-0">
                        {[
                          { id: "Overview", label: "Overview", icon: "📋" },
                          { id: "DayInLife", label: "Day-in-Life", icon: "🕒" },
                          { id: "Skills", label: "Skills", icon: "🧠" },
                          { id: "MatchScore", label: "Match Score", icon: "🎯" },
                          { id: "Salary", label: "Salary", icon: "💰" },
                          { id: "Ladder", label: "Career Ladder", icon: "📈" },
                          { id: "ExamGates", label: "Exam Gates", icon: "🚦" },
                          { id: "Education", label: "Education", icon: "🎓" },
                          { id: "Companies", label: "Companies", icon: "🏢" },
                          { id: "Cities", label: "Cities", icon: "🌆" },
                          { id: "AIImpact", label: "AI Impact", icon: "🤖" },
                          { id: "Similar", label: "Similar", icon: "🔄" },
                          { id: "Lifestyle", label: "Lifestyle", icon: "⚖️" },
                          { id: "RealityChecks", label: "Reality Checks™", icon: "💬" },
                          { id: "Workspace", label: "Workspace", icon: "💻" },
                          { id: "Challenge", label: "Challenge", icon: "⚡" },
                          { id: "Trends", label: "Trends", icon: "📊" },
                          { id: "NextSteps", label: "Next Steps", icon: "👣" }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveRoleTab(tab.id)}
                            className={`ghost flex items-center gap-1 py-0.5 px-2 text-[10px] font-semibold whitespace-nowrap border-b-2 transition-colors duration-100 outline-none cursor-pointer ${
                              activeRoleTab === tab.id 
                                ? "border-[#3B8BD4] text-[#3B8BD4]" 
                                : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span>{tab.icon}</span> <span>{tab.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* 18 TABS DETAILS CONTENT AREA — standardizing on text-xs for premium feel */}
                      <div data-scroll-container className="p-4 space-y-4 text-xs h-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                        
                        {/* TAB 1: OVERVIEW */}
                        {activeRoleTab === "Overview" && (
                          <div className="space-y-4">
                            {/* Neurodivergent checklist / narrative toggle */}
                            {neurodivergentMode ? (
                              <div className="border border-blue-200 dark:border-blue-900/50 bg-[#E6F1FB]/30 p-3 rounded-2xl space-y-2.5">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-[#185FA5] flex items-center gap-1">🧠 Neurodivergent-Friendly Checklist View</span>
                                  <button 
                                    onClick={() => setNeurodivergentMode(false)}
                                    className="ghost text-[9.5px] text-muted-foreground hover:text-foreground cursor-pointer border border-border px-1.5 py-0.5 rounded bg-transparent"
                                  >
                                    📄 Switch to Standard Text
                                  </button>
                                </div>
                                <ul className="space-y-1.5 list-none pl-0 text-[10.5px] font-medium leading-relaxed">
                                  <li>🚀 <strong>Role Goal:</strong> Deliver core product features and align engineering with design expectations.</li>
                                  <li>💼 <strong>Primary Task:</strong> Write clear requirement docs (PRDs), run standups, and monitor delivery analytics.</li>
                                  <li>📊 <strong>WLB Rating:</strong> 8.5/10 - Structured workflow, flexible core team sync hours.</li>
                                  <li>⚡ <strong>Focus Blocks:</strong> 2-hour solo focus block reservation standard practice.</li>
                                </ul>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <p className="text-muted-foreground leading-relaxed leading-snug flex-1">
                                    {selectedRole.description}
                                  </p>
                                  <button 
                                    onClick={() => setNeurodivergentMode(true)}
                                    className="ghost text-[9px] text-[#185FA5] border border-blue-200 hover:bg-blue-50/50 rounded-lg p-1 shrink-0 ml-2 cursor-pointer font-bold bg-transparent"
                                  >
                                    🧠 Checklist Mode
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Accessibility Indicators Support Checklist (Spec L2950-2975) */}
                            <div className="border border-border rounded-xl p-3 bg-muted/20 space-y-2">
                              <span className="font-bold text-foreground block text-[10px] sm:text-xs">♿ Accessibility & Inclusion Support</span>
                              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground font-medium">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-emerald-600">✓</span> 
                                  <span>Physical: mostly desk-bound computer work</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-emerald-600">✓</span> 
                                  <span>Hearing: subtitles & text transcript support</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-emerald-600">✓</span> 
                                  <span>Vision: screen-reader & contrast ready</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-emerald-600">✓</span> 
                                  <span>Neurodivergent: self-paced check-ins allowed</span>
                                </div>
                              </div>
                              <div className="border-t border-border/40 pt-2 flex items-center justify-between text-[9px] text-neutral-500">
                                <span>🧠 Mental Health WLB rating: <strong className="text-emerald-600">4.8 / 5</strong></span>
                                <span>Steady pace · Low pressure</span>
                              </div>
                            </div>

                            {/* highlights tags */}
                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="secondary" className="bg-[#E6F1FB] text-[#185FA5] border-none text-[9.5px]">Remote-friendly</Badge>
                              <Badge variant="secondary" className="bg-[#E1F5EE] text-[#0F6E56] border-none text-[9.5px]">High growth</Badge>
                              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-none text-[9.5px]">No exam gate</Badge>
                            </div>

                            {selectedRole.id === "founder" && (
                              <div className="border border-red-200 dark:border-red-950/40 bg-red-50/40 dark:bg-red-950/10 rounded-xl p-3 space-y-2">
                                <span className="font-bold text-red-600 dark:text-red-400 block text-[10px] sm:text-xs">🚀 Founder's Venture Sandbox</span>
                                <div className="space-y-1.5 text-[10px] sm:text-[11px] text-muted-foreground">
                                  <div className="flex justify-between border-b border-border/40 pb-1">
                                    <span className="font-medium text-foreground">Venture Pitch Deck:</span>
                                    <span className="text-red-700 dark:text-red-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => alert("Downloading PitchDeck_v3.pdf (12 Slides)...")}>
                                      📄 View PitchDeck.pdf
                                    </span>
                                  </div>
                                  <div className="flex justify-between border-b border-border/40 pb-1">
                                    <span className="font-medium text-foreground">MVP Prototype Stage:</span>
                                    <span className="text-emerald-600 font-semibold">Active No-Code Beta</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-foreground">Venture Capital Interest:</span>
                                    <span className="text-[#3B8BD4] font-bold">2 VCs Interested (Seed Stage)</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* typical hours */}
                            <div className="border border-border rounded-xl p-3 bg-card flex justify-between items-center shadow-sm">
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-[#3B8BD4]" />
                                <div>
                                  <span className="font-semibold block text-foreground">Work Schedule</span>
                                  <span className="text-[10px] text-muted-foreground mt-0.5 block">9:00 AM - 6:00 PM · Flexible Hybrid</span>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Typical</span>
                            </div>

                            {/* growth graph */}
                            <div className="border border-border rounded-xl p-3.5 bg-card shadow-sm space-y-2">
                              <span className="font-bold text-foreground block">Career Growth Graph (Demand Trend)</span>
                              <div className="flex justify-between items-end h-16 pt-2">
                                {[20, 35, 55, 68, 92].map((height, i) => (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                    <div className="w-4 bg-[#3B8BD4]/40 rounded-t group-hover:bg-[#3B8BD4] transition-all" style={{ height: `${height * 0.5}px` }} />
                                    <span className="text-[8px] text-muted-foreground">
                                      {["2022", "2023", "2024", "2025", "2026"][i]}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground block text-center italic mt-1">+24% YoY job openings increase</span>
                            </div>

                            {/* project showcase carousel */}
                            <div className="space-y-1.5">
                              <span className="font-bold text-foreground block">Typical Projects Showcase</span>
                              <div className="flex gap-2.5 overflow-x-auto scrollbar-hidden">
                                {[
                                  { name: "A/B Testing Redesign", desc: "Formulated hypotheis, built analytics tracking, increased conversion by 14%." },
                                  { name: "Figma Customer Journey", desc: "Drafted user journey wireframes for 3 checkout pain points." },
                                  { name: "Payment Gateway PRD", desc: "Aligned engineering & finance stakeholders on integration APIs." }
                                ].map((proj, i) => (
                                  <div key={i} className="w-[180px] bg-muted/40 border border-border rounded-xl p-3 shrink-0 flex flex-col justify-between h-24 text-[10.5px] shadow-sm">
                                    <span className="font-bold text-foreground block truncate">{proj.name}</span>
                                    <p className="text-muted-foreground text-[9.5px] mt-1 line-clamp-2 leading-relaxed">{proj.desc}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Mentor & Peer Collaborative Reviews Section (Spec L1795-1907) */}
                            <div className="border border-border rounded-2xl p-3.5 bg-card shadow-sm space-y-3.5">
                              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                                <span className="font-bold text-foreground flex items-center gap-1.5">
                                  🎓 Peer & Mentor Reviews
                                </span>
                                <Badge variant="secondary" className="text-[9px] font-bold">
                                  {isMentorView ? "Review Mode Active" : "Read-Only"}
                                </Badge>
                              </div>

                              {mentorComments.length === 0 ? (
                                <p className="text-[10px] text-muted-foreground italic text-center py-2">No mentor comments yet.</p>
                              ) : (
                                <div className="space-y-2">
                                  {mentorComments.map((comment, idx) => (
                                    <div key={idx} className="p-2.5 bg-muted/20 border border-border/60 rounded-xl text-[10.5px] leading-relaxed relative group">
                                      <p className="text-foreground italic">"{comment}"</p>
                                      <div className="flex justify-between items-center mt-2 text-[9px] text-muted-foreground font-semibold">
                                        <span>Priya (Mentor)</span>
                                        <span>Just now</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {isMentorView ? (
                                <div className="space-y-2 pt-2 border-t border-border/40">
                                  <textarea
                                    value={newMentorComment}
                                    onChange={(e) => setNewMentorComment(e.currentTarget.value)}
                                    placeholder="Write your review or comment as a Mentor..."
                                    className="w-full bg-background border border-border rounded-xl p-2 text-[10.5px] outline-none text-foreground min-h-16 resize-y"
                                  />
                                  <Button
                                    onClick={() => {
                                      if (!newMentorComment.trim()) return;
                                      setMentorComments(prev => [...prev, newMentorComment.trim()]);
                                      setNewMentorComment("");
                                      toast.success("Mentor comment posted successfully!");
                                    }}
                                    className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold h-8 rounded-xl text-[10px] border-none cursor-pointer"
                                  >
                                    Post Mentor Comment
                                  </Button>
                                </div>
                              ) : (
                                <div className="bg-muted/40 rounded-xl p-2.5 text-[9.5px] text-muted-foreground text-center">
                                  Switch to <strong>Mentor View</strong> in your profile dropdown to add feedback comments on this career card.
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* TAB 2: DAY-IN-LIFE */}
                        {activeRoleTab === "DayInLife" && (
                          <div className="space-y-4">
                            <span className="font-bold text-foreground block">Workspace Orientation & Day Timeline</span>
                            <div className="border border-border rounded-xl p-3 space-y-2">
                              <div className="flex justify-between items-center text-[10.5px] border-b border-border pb-1">
                                <span className="font-bold text-foreground uppercase">Day Simulation</span>
                                <span className="text-[#3B8BD4] font-bold">{timelapseHour}</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1.5">
                                {["9 AM", "12 PM", "3 PM", "6 PM"].map(hour => (
                                  <button
                                    key={hour}
                                    onClick={() => setTimelapseHour(hour)}
                                    className={`ghost py-1 text-[10px] font-semibold border rounded-lg transition-colors cursor-pointer ${
                                      timelapseHour === hour ? "bg-[#3B8BD4] text-white border-[#3B8BD4]" : "bg-muted text-muted-foreground hover:bg-muted"
                                    }`}
                                  >
                                    {hour}
                                  </button>
                                ))}
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed italic mt-1">
                                {timelapseHour === "9 AM" && "9:00 AM - Sprint alignments, design critiques and reviewing engineering backlog."}
                                {timelapseHour === "12 PM" && "12:00 PM - Focus coding hour or building user journey models on whiteboard."}
                                {timelapseHour === "3 PM" && "3:00 PM - Client presentations, stakeholder alignments, or user feedback reviews."}
                                {timelapseHour === "6 PM" && "6:00 PM - Submission of weekly design queue, wraps, day log completion."}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* TAB 3: SKILLS REQUIRED */}
                        {activeRoleTab === "Skills" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">229 KSAO Competency Vector Map</span>
                            <p className="text-muted-foreground text-[10.5px] leading-relaxed">
                              This role is mapped across multiple skill weights. Focus priority on these core areas:
                            </p>
                            <div className="space-y-2.5 bg-card border border-border p-3.5 rounded-xl">
                              {[
                                { name: "Product Analytics (SQL / GA)", weight: 85, color: "bg-[#3B8BD4]" },
                                { name: "UX Wireframing & Prototyping", weight: 75, color: "bg-purple-500" },
                                { name: "Agile Stakeholder Alignment", weight: 90, color: "bg-emerald-500" },
                                { name: "Market Research & Competitive", weight: 65, color: "bg-amber-500" }
                              ].map((skill, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-semibold">
                                    <span className="text-foreground">{skill.name}</span>
                                    <span className="text-muted-foreground">{skill.weight}% Weight</span>
                                  </div>
                                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                                    <div className={`h-full ${skill.color} rounded-full`} style={{ width: `${skill.weight}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 4: YOUR MATCH SCORE */}
                        {activeRoleTab === "MatchScore" && (
                          <div className="space-y-3">
                            <div className="bg-[#E6F1FB]/40 border border-[#3B8BD4]/30 rounded-xl p-3.5">
                              <div className="flex justify-between items-center mb-1.5 font-bold">
                                <span className="text-[11px] text-foreground">KSAO Compatibility Gap</span>
                                <span className="text-[#3B8BD4]">{selectedRole.matchScore}% Compatibility</span>
                              </div>
                              <div className="h-2 rounded-full bg-border overflow-hidden mb-2">
                                <div className="h-full bg-[#3B8BD4] rounded-full" style={{ width: `${selectedRole.matchScore}%` }} />
                              </div>
                              <span className="text-[9.5px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">Specific skill gaps you need to close:</span>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {selectedRole.gapsToClose.map((gap, i) => (
                                  <Badge key={i} variant="secondary" className="text-[9.5px] font-medium bg-[#FFF2E6] text-[#D97706] border-none">
                                    {gap}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 5: SALARY PROGRESSION */}
                        {activeRoleTab === "Salary" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">Salary Progression Timeline</span>
                            <div className="space-y-2 border-l border-border pl-3.5 ml-2.5 mt-2 relative">
                              {[
                                { title: "Entry Level (0-2 Yrs)", val: "₹6 - 10 LPA" },
                                { title: "Mid Level (3-5 Yrs)", val: "₹12 - 20 LPA" },
                                { title: "Senior Level (6-8 Yrs)", val: "₹22 - 35 LPA" },
                                { title: "Lead / Director (9+ Yrs)", val: "₹40 LPA+" }
                              ].map((lvl, i) => (
                                <div key={i} className="relative py-1">
                                  <span className="absolute -left-[20px] top-2 w-2 h-2 rounded-full bg-[#3B8BD4] border border-white" />
                                  <span className="font-semibold text-foreground block">{lvl.title}</span>
                                  <span className="text-[11px] font-bold text-emerald-600 block mt-0.5">{lvl.val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 6: CAREER LADDER */}
                        {activeRoleTab === "Ladder" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">6-Year Career Trajectory</span>
                            <div className="space-y-2">
                              {[
                                { step: "Associate PM (APM)", time: "Year 1", desc: "Supports PMs, handles simple spec definitions." },
                                { step: "Product Manager (PM)", time: "Year 2-3", desc: "Owns specific feature set, aligns dev & design." },
                                { step: "Senior Product Manager", time: "Year 4-5", desc: "Owns entire product line, sets KPIs." },
                                { step: "Director of Product", time: "Year 6+", desc: "Sets division strategy, manages other PMs." }
                              ].map((lvl, idx) => (
                                <div key={idx} className="p-2.5 border border-border bg-card rounded-lg shadow-sm flex justify-between items-start">
                                  <div>
                                    <span className="font-bold text-foreground block">{lvl.step}</span>
                                    <span className="text-[10px] text-muted-foreground block mt-0.5">{lvl.desc}</span>
                                  </div>
                                  <Badge className="bg-[#E6F1FB] text-[#185FA5] border-none font-bold shrink-0">{lvl.time}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 7: EXAM GATES */}
                        {activeRoleTab === "ExamGates" && (
                          <div className="space-y-3 text-xs">
                            <span className="font-bold text-foreground block">Mandatory Exam Waypoints</span>
                            {academicData && academicData.roleMappings.roleToExams[selectedRole.name] && academicData.roleMappings.roleToExams[selectedRole.name].length > 0 ? (
                              academicData.roleMappings.roleToExams[selectedRole.name].map((examName, idx) => {
                                const examObj = academicData.exams.find((e: any) => e.name === examName);
                                return (
                                  <div key={idx} className="border border-[#791F1F] bg-[#FFF2F2] p-3 rounded-xl flex items-start gap-2.5">
                                    <span className="w-5 h-5 bg-[#E24B4A] rounded text-white font-bold flex items-center justify-center text-[10px]">G</span>
                                    <div>
                                      <span className="font-bold text-red-950 block">{examName}</span>
                                      <p className="text-[10.5px] text-red-900 leading-snug mt-0.5">
                                        {examObj ? `${examObj.scope} Level • ${examObj.level} Gateway` : "General mandatory qualification exam."}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="border border-emerald-500 bg-[#E1F5EE] p-3 rounded-xl flex items-start gap-2.5">
                                <span className="w-5 h-5 bg-[#1D9E75] rounded text-white font-bold flex items-center justify-center text-[10px]">✓</span>
                                <div>
                                  <span className="font-bold text-emerald-950 block">No Exam Gate Waypoint</span>
                                  <p className="text-[10.5px] text-emerald-900 leading-snug mt-0.5">Direct entry. Start applying using skill portfolio, bootcamps or interviews.</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* TAB 8: EDUCATION PATHS */}
                        {activeRoleTab === "Education" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">Education Tracks & Prep</span>
                            <div className="grid grid-cols-1 gap-2">
                              {academicData && academicData.roleMappings.roleToDept[selectedRole.name] && academicData.roleMappings.roleToDept[selectedRole.name].length > 0 ? (
                                academicData.roleMappings.roleToDept[selectedRole.name].map((deptName, idx) => {
                                  const deptObj = academicData.departments.find((d: any) => d.name === deptName);
                                  return (
                                     <div key={idx} className="p-3 border border-border bg-card rounded-xl">
                                       <span className="font-bold text-foreground block">Track: {deptName}</span>
                                       <span className="text-[10px] text-muted-foreground block mt-0.5 whitespace-pre-wrap">
                                         {deptObj?.eligibility || "Standard university track."}
                                       </span>
                                       {deptObj?.boardRequirement && (
                                         <div className="mt-2 text-[9px] bg-slate-100 dark:bg-slate-800 p-2 rounded">
                                           <strong>Board Req:</strong> {deptObj.boardRequirement}
                                         </div>
                                       )}
                                     </div>
                                  );
                                })
                              ) : (
                                  <div className="p-3 border border-border bg-card rounded-xl">
                                    <span className="font-bold text-foreground block">Standard Route</span>
                                    <span className="text-[10px] text-muted-foreground block mt-0.5">General graduation degree is sufficient. No specific departmental constraint.</span>
                                  </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* TAB 9: COMPANIES HIRING */}
                        {activeRoleTab === "Companies" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">Top Active Hiring Companies</span>
                            <div className="space-y-2">
                              {[
                                { company: "Zepto", open: "12 positions", trend: "+15% expansion" },
                                { company: "Razorpay", open: "8 positions", trend: "Fast-track hiring" },
                                { company: "Amazon India", open: "14 positions", trend: "High bar entry" },
                                { company: "Flipkart", open: "9 positions", trend: "Bangalore location" }
                              ].map((c, i) => (
                                <div key={i} className="p-2.5 border border-border bg-card rounded-xl flex justify-between items-center">
                                  <div>
                                    <span className="font-semibold text-foreground block">{c.company}</span>
                                    <span className="text-[10px] text-muted-foreground block mt-0.5">{c.trend}</span>
                                  </div>
                                  <Badge className="bg-[#E6F1FB] text-[#185FA5] border-none font-bold">{c.open}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 10: CITY OPPORTUNITIES */}
                        {activeRoleTab === "Cities" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">Geographic Demand Density</span>
                            <div className="space-y-2">
                              {[
                                { city: "Bengaluru", count: "54% of openings", demand: "High Demand" },
                                { city: "NCR / Delhi", count: "20% of openings", demand: "Moderate" },
                                { city: "Mumbai", count: "15% of openings", demand: "Stable" },
                                { city: "Pune / Hyderabad", count: "11% of openings", demand: "Growing" }
                              ].map((c, i) => (
                                <div key={i} className="p-2.5 border border-border bg-card rounded-xl flex justify-between items-center">
                                  <div>
                                    <span className="font-semibold text-foreground block">{c.city}</span>
                                    <span className="text-[10px] text-muted-foreground block mt-0.5">{c.count}</span>
                                  </div>
                                  <span className={`text-[10px] font-bold ${i === 0 ? "text-emerald-600" : "text-amber-600"}`}>{c.demand}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 11: AI IMPACT */}
                        {activeRoleTab === "AIImpact" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">Automation Risk Analysis</span>
                            <div className="p-3.5 border border-border bg-card rounded-xl space-y-2.5 shadow-sm">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground">AI Automation Risk Score:</span>
                                <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-none font-bold text-[10px]">15% - Low Risk</Badge>
                              </div>
                              <p className="text-muted-foreground text-[10.5px] leading-relaxed">
                                AI tools will automate coding mockups and initial copywriting, but the core PM responsibilities like human alignment, team motivation, and user empathy interviews are irreplaceable by LLMs.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* TAB 12: SIMILAR ROLES */}
                        {activeRoleTab === "Similar" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">Similar Adjacent Pivots</span>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { name: "UX Designer", match: "82% match", pivot: "Requires UI/Figma focus" },
                                { name: "Business Analyst", match: "85% match", pivot: "Requires heavy data query focus" },
                                { name: "Product Marketing Manager", match: "79% match", pivot: "Requires copywriting focus" }
                              ].map((role, idx) => (
                                <div key={idx} className="p-2.5 border border-border bg-card rounded-xl flex justify-between items-center">
                                  <div>
                                    <span className="font-semibold text-foreground block">{role.name}</span>
                                    <span className="text-[10px] text-muted-foreground block mt-0.5">{role.pivot}</span>
                                  </div>
                                  <Badge className="bg-[#E1F5EE] text-[#0F6E56] border-none font-bold">{role.match}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 13: LIFESTYLE REALITY */}
                        {activeRoleTab === "Lifestyle" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">Workplace Lifestyle Balance</span>
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-muted/40 p-2 rounded-lg border border-border">
                                <span className="text-[9px] text-muted-foreground block uppercase font-bold">WLB Rating</span>
                                <span className="text-sm font-bold mt-0.5 block">⭐ {selectedRole.wlbRating} / 5</span>
                              </div>
                              <div className="bg-muted/40 p-2 rounded-lg border border-border">
                                <span className="text-[9px] text-muted-foreground block uppercase font-bold">Stress level</span>
                                <span className="text-sm font-bold mt-0.5 block">Moderate-High</span>
                              </div>
                              <div className="bg-muted/40 p-2 rounded-lg border border-border col-span-2">
                                <span className="text-[9px] text-muted-foreground block uppercase font-bold">Travel Requirements</span>
                                <span className="text-sm font-bold mt-0.5 block">Low (Under 10% travel days)</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB 14: REALITY CHECKS™ */}
                        {activeRoleTab === "RealityChecks" && (
                          <div className="space-y-4">
                            {/* Professional video review summaries (simulated) */}
                            <div className="space-y-2">
                              <span className="font-bold text-foreground block">Professional Video Testimonies</span>
                              
                              {isOfflineMode && (
                                <div className="bg-amber-50 dark:bg-amber-955/15 border border-amber-200 dark:border-amber-900/50 rounded-xl p-2.5 text-[10px] text-amber-850 dark:text-amber-400 font-semibold mb-2">
                                  ⚠️ OFFLINE MODE: Reality Check videos require an internet connection to stream.
                                </div>
                              )}
                              
                              <div className="flex gap-2.5 overflow-x-auto scrollbar-hidden">
                                {[
                                  { name: "Rahul S.", company: "PM, Razorpay", duration: "2:40" },
                                  { name: "Sneha G.", company: "Design Head, Pune", duration: "1:55" }
                                ].map((v, i) => (
                                  <div key={i} className="w-[160px] bg-slate-800 border border-slate-700 rounded-xl p-2.5 shrink-0 relative flex flex-col justify-between h-20 text-white shadow-sm">
                                    <div className="flex justify-between items-start">
                                      <span className="text-[9.5px] font-bold leading-tight truncate w-24 text-white">{v.name}</span>
                                      <span className="bg-black/50 text-white text-[7.5px] px-1 rounded font-semibold shrink-0">{v.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                      <button 
                                        onClick={() => {
                                          if (isOfflineMode) {
                                            toast.error("Offline Mode: Video streaming unavailable.");
                                            return;
                                          }
                                          alert(`Simulated video testimony play for ${v.name}`);
                                        }} 
                                        className={`ghost w-5 h-5 rounded-full flex items-center justify-center text-[8px] text-white cursor-pointer ${isOfflineMode ? "bg-white/10 text-neutral-500 cursor-not-allowed" : "bg-white/20 hover:bg-white/40"}`}
                                      >
                                        ▶
                                      </button>
                                      <span className="text-[8px] text-neutral-300 truncate">{v.company}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Workspace Ambient Audio hum player */}
                            <div className="border border-border rounded-xl p-3 bg-card shadow-sm space-y-2">
                              <span className="font-bold text-foreground block">🏢 Workspace Ambient Audio Playback</span>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-semibold block text-foreground">Office / Meeting Hype Snippet</span>
                                  <span className="text-[10px] text-muted-foreground">Simulate real acoustic workspace vibes</span>
                                </div>
                                <button 
                                  onClick={() => {
                                    if (isOfflineMode) {
                                      toast.error("Offline Mode: Ambient audio streams unavailable.");
                                      return;
                                    }
                                    setAudioPlaying(!audioPlaying);
                                    if(!audioPlaying) {
                                      alert("Playing ambient workspace audio hum (simulation)... 🎧");
                                    }
                                  }}
                                  className={`ghost w-9 h-9 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                                    audioPlaying && !isOfflineMode
                                      ? "bg-[#3B8BD4] border-[#3B8BD4] text-white" 
                                      : "bg-muted text-muted-foreground hover:bg-muted"
                                  } ${isOfflineMode ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                  {audioPlaying && !isOfflineMode ? (
                                    <Volume2 size={16} className="animate-bounce" />
                                  ) : (
                                    <Play size={16} className="ml-0.5" />
                                  )}
                                </button>
                              </div>
                              {audioPlaying && (
                                <div className="flex gap-0.5 items-end justify-center h-4 pt-1">
                                  {[6, 10, 4, 12, 8, 14, 5, 11, 7].map((h, i) => (
                                    <div 
                                      key={i} 
                                      className="w-1 bg-[#3B8BD4] rounded-t animate-pulse" 
                                      style={{ height: `${h}px`, animationDelay: `${i * 0.1}s`, animationDuration: '0.6s' }} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Sentiment Gauge Card */}
                            <div className="border border-border rounded-xl p-3 bg-card shadow-sm space-y-2">
                              <span className="font-bold text-foreground block">📊 Sentiment Metrics Breakdown</span>
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                                  <span>Positive & Fulfilling</span>
                                  <span className="text-emerald-600">68%</span>
                                </div>
                                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: "68%" }} />
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                                  <span>Bureaucracy & Stress</span>
                                  <span className="text-amber-600">32%</span>
                                </div>
                                <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "32%" }} />
                                </div>
                              </div>
                            </div>

                            {/* Busted Misconceptions Card */}
                            <div className="border border-red-200 dark:border-red-950/40 bg-red-50/40 dark:bg-red-950/10 rounded-xl p-3 space-y-2">
                              <span className="font-bold text-red-700 dark:text-red-400 block text-[10px] sm:text-xs">💡 Busted Misconceptions</span>
                              <div className="space-y-1.5 text-[10.5px]">
                                <p className="text-foreground font-semibold">❌ Misconception: "You need an MBA or degree credentials to break into this field."</p>
                                <p className="text-muted-foreground">✅ Reality: In tech, startups, and creative sectors, skills validation and portfolios outweigh degrees by 78%.</p>
                              </div>
                            </div>

                            {/* Anonymous confessions */}
                            <div className="border border-border rounded-xl p-3 bg-muted/20 space-y-2">
                              <span className="font-bold text-foreground block">Anonymous Confessions</span>
                              {selectedRole.confessions.map((conf, idx) => (
                                <div key={idx} className="p-2 bg-background border border-border rounded-lg text-muted-foreground leading-relaxed italic text-[10.5px]">
                                  "{conf}"
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TAB 15: WORKSPACE TOUR (Spec L1126-1241) */}
                        {activeRoleTab === "Workspace" && (
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-foreground block text-sm">360° Interactive Workspace View™</span>
                                <span className="text-[10px] text-muted-foreground block mt-0.5">Explore the daily physical and digital environment of a {selectedRole.name}.</span>
                              </div>
                              <Badge className="bg-purple-100 text-purple-700 border-none font-bold text-[8.5px] uppercase tracking-wider">
                                Immersive 360
                              </Badge>
                            </div>
                            
                            <div className="w-full h-44 rounded-2xl bg-slate-905 border border-border relative overflow-hidden flex flex-col items-center justify-center p-4">
                              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600')` }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                              
                              <div className="z-10 text-center space-y-2 max-w-xs">
                                <span className="font-bold text-white block text-[11px] leading-tight">Standing at {selectedRole.name}'s Desk</span>
                                <span className="text-[9.5px] text-slate-400 block leading-snug">Drag to pan the office view, click active laptop mockups, and scrub through their work hours.</span>
                              </div>

                              {isOfflineMode ? (
                                <div className="z-10 bg-amber-500/95 border border-amber-600 text-white rounded-xl p-2 text-center text-[9.5px] max-w-xs mt-2 font-bold leading-normal">
                                  ⚠️ Offline Mode: Immersive 360° Workspace Tour is unavailable offline. Reconnect to launch.
                                </div>
                              ) : (
                                <Button 
                                  onClick={() => {
                                    setWorkspaceViewOpen(true);
                                    setWorkspaceOpenHotspot(null);
                                  }}
                                  size="sm"
                                  className="z-10 bg-[#3B8BD4] hover:bg-[#185FA5] text-white text-[10px] font-bold h-8 rounded-xl px-4 mt-3 flex items-center gap-1.5 shadow-lg shadow-[#3B8BD4]/20 cursor-pointer animate-none border-none"
                                >
                                  <Globe size={13} className="animate-spin-slow" /> Enter Workspace View
                                </Button>
                              )}
                            </div>

                            <div className="bg-muted/30 border border-border rounded-xl p-3 text-[10.5px] space-y-2">
                              <span className="font-bold text-foreground block">Workspace Experience Features:</span>
                              <ul className="space-y-1.5 text-muted-foreground text-[10px]">
                                <li className="flex items-center gap-1.5">
                                  <CheckCircle2 size={11} className="text-emerald-500" />
                                  <span><strong>Interactive Figma canvas challenge:</strong> redesign buttons and complete task loops.</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <CheckCircle2 size={11} className="text-emerald-500" />
                                  <span><strong>Time Travel stages:</strong> view how tools and workloads shift from Junior to Senior.</span>
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <CheckCircle2 size={11} className="text-emerald-500" />
                                  <span><strong>Professional office variants:</strong> compare Startup vs Corporate vs Freelance setups.</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* TAB 16: CHALLENGE SIMULATION */}
                        {activeRoleTab === "Challenge" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">Challenge Simulation Task</span>
                            <div className="border border-border rounded-xl p-3 bg-slate-50 dark:bg-slate-900 space-y-2 shadow-sm">
                              <span className="font-bold text-foreground flex items-center gap-1">
                                <Zap size={13} className="text-yellow-500 fill-yellow-500" /> Real-world PM Dilemma
                              </span>
                              <p className="text-muted-foreground text-[10.5px] leading-relaxed">
                                "A Safari rendering bug breaks the primary Buy Button 2 days prior to product launch. What is your response?"
                              </p>
                              <div className="space-y-1.5 pt-1">
                                {[
                                  { key: "a", text: "Delay launching the module until Safari alignment is resolved." },
                                  { key: "b", text: "Launch on time. Deploy a minor patch within 24 hours." },
                                  { key: "c", text: "Work late to fix it immediately, assuring launch day stability." }
                                ].map(opt => (
                                  <div 
                                    key={opt.key}
                                    onClick={() => {
                                      setMcqAnswer(opt.key);
                                      if (opt.key === "b") setXpEarned(prev => prev + 150);
                                    }}
                                    className={`p-2 rounded-lg border text-[10.5px] cursor-pointer transition-colors ${
                                      mcqAnswer === opt.key 
                                        ? opt.key === "b" 
                                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold" 
                                          : "bg-red-50 border-red-500 text-red-800 font-semibold"
                                        : "bg-background border-border hover:bg-muted"
                                    }`}
                                  >
                                    {opt.text}
                                  </div>
                                ))}
                              </div>
                              {mcqAnswer && (
                                <span className="text-[10px] font-bold block mt-1.5 text-center text-foreground">
                                  {mcqAnswer === "b" ? "🎉 Correct! +150 XP rewarded to your profile." : "❌ Incorrect. Option B is safer. Try again!"}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* TAB 17: MARKET TRENDS */}
                        {activeRoleTab === "Trends" && (
                          <div className="space-y-3 bg-card border border-border p-3.5 rounded-xl shadow-sm">
                            <span className="font-bold text-foreground block">Macroeconomic Market Trends</span>
                            
                            {isOfflineMode && (
                              <div className="bg-amber-50 dark:bg-amber-955/15 border border-amber-200 dark:border-amber-900/50 rounded-xl p-2.5 text-[10px] text-amber-850 dark:text-amber-400 font-semibold mb-2">
                                ⚠️ OFFLINE MODE: Showing cached hiring pulse. Last updated 3 days ago.
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                              <span className="text-base font-bold">↗️</span>
                              <div>
                                <span className="font-bold block text-[10.5px] text-emerald-950">Demand Rising</span>
                                <span className="text-[9.5px] text-emerald-800 block mt-0.5">{isOfflineMode ? "Job postings as of 3 days ago: +24% YoY" : "Job postings increased 24% YoY in India region."}</span>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-[10.5px] leading-relaxed mt-1.5">
                              Pioneering companies are expanding product alignment budgets to counter fragmented remote workflow architectures. PMs remain highly shielded from tech sector automation fluctuations.
                            </p>
                          </div>
                        )}

                        {/* TAB 18: NEXT STEPS */}
                        {activeRoleTab === "NextSteps" && (
                          <div className="space-y-3">
                            <span className="font-bold text-foreground block">Actionable Transition Checklist</span>
                            <div className="space-y-2 bg-card border border-border p-3 rounded-xl shadow-sm">
                              {[
                                "Complete Curiosity Compass curiosity vector audit.",
                                "Follow 3 top Product Leaders on LinkedIn to learn weekly updates.",
                                "Pin Product Manager roles to your Dream Board list.",
                                "Take the PM Fundamentals module in SkillStacker."
                              ].map((step, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-[10.5px]">
                                  <input type="checkbox" className="mt-0.5 rounded shadow-xs" />
                                  <span className="text-muted-foreground">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  )}

                </div>
              )}
              {/* Arrow pointing to the pin, visible only in detail mode */}
              {selectedRoleOpen && !searchFocused && sidebarMode === "detail" && (
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white dark:border-t-slate-900 mx-auto filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)] pointer-events-none mt-[-1px] shrink-0" />
              )}
            </div>
          )}

          {/* ACTIVE GPS JOURNEY BOTTOM DASHBOARD PANEL */}
          {navigationMode && (
            <div className="absolute bottom-3 left-3 right-3 bg-background border border-border rounded-2xl p-4 shadow-2xl z-30 space-y-3.5 md:left-auto md:w-[380px]">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <Flame size={14} className="fill-orange-500 text-orange-500" /> Active GPS Journey
                  </span>
                  <span className="text-[10px] text-muted-foreground">Month 7 of 12</span>
                </div>
                <Badge variant="outline" className="text-[9.5px] border-[#3B8BD4] text-[#185FA5] font-bold">58% Done</Badge>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "58%" }} />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-semibold uppercase">
                  <span>3,240 XP Accumulated</span>
                  <span className="text-emerald-600 font-bold">Streak: 🔥 14 days</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-muted/40 p-2.5 rounded-xl text-xs border border-border">
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold block">Current Match Score</span>
                  <span className="text-xs font-bold text-[#3B8BD4] mt-0.5 block">{selectedRole.matchScore}% Compatibility</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold block">Pace Indicator</span>
                  <span className="text-xs font-bold text-emerald-600 mt-0.5 block">⚡ Ahead of Schedule (+2 mo)</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => alert("Journey progress checkpoint saved!")}
                  className="secondary flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-9 rounded-xl shadow-md"
                >
                  Log Milestone Progress
                </Button>
                <Button 
                  onClick={() => setNavigationMode(false)}
                  variant="outline"
                  className="text-[11px] h-9 px-3 rounded-xl border-red-500 text-red-500 hover:bg-red-50"
                >
                  Quit GPS Navigation
                </Button>
              </div>
            </div>
          )}

          {/* OFFLINE DOWNLOAD DIALOG OVERLAY (Spec L1485-1510) */}
          {offlineDownloadDialogOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-background border border-border w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    📥 Download for Offline Use
                  </span>
                  <button 
                    disabled={isDownloading}
                    onClick={() => setOfflineDownloadDialogOpen(false)} 
                    className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
                </div>

                {isDownloading ? (
                  <div className="space-y-4 py-4 text-center">
                    <span className="font-bold text-foreground block text-[13px] animate-pulse">
                      Downloading Database...
                    </span>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-[#3B8BD4] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      {downloadProgress < 100 
                        ? `Transferring sector payloads (${downloadProgress}%)` 
                        : "Unzipping career nodes database..."}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-[11px] text-muted-foreground block leading-snug">
                      Select sectors to store locally. Explores careers, paths, and skills without an internet connection.
                    </span>

                    <div className="space-y-2 border border-border/60 rounded-xl p-3 bg-muted/20">
                      {[
                        { id: "saved", label: "My Saved Careers (15 careers)", size: "45 MB" },
                        { id: "tech", label: "Tech Sector (4,200 careers)", size: "420 MB" },
                        { id: "healthcare", label: "Healthcare Sector (2,800 careers)", size: "280 MB" },
                        { id: "path", label: "My Active Path (SWE → PM → Founder)", size: "12 MB" }
                      ].map((item) => (
                        <label key={item.id} className="flex justify-between items-center py-1.5 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox"
                              checked={selectedDownloads.includes(item.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDownloads([...selectedDownloads, item.id]);
                                } else {
                                  setSelectedDownloads(selectedDownloads.filter(id => id !== item.id));
                                }
                              }}
                              className="accent-[#3B8BD4]"
                            />
                            <span className="font-semibold text-foreground">{item.label}</span>
                          </div>
                          <span className="text-muted-foreground font-bold shrink-0">{item.size}</span>
                        </label>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1.5 px-1 font-semibold text-foreground">
                      <span>Total Download Size:</span>
                      <span className="text-[#3B8BD4] text-xs font-bold">
                        {(() => {
                          let total = 0;
                          if (selectedDownloads.includes("saved")) total += 45;
                          if (selectedDownloads.includes("tech")) total += 420;
                          if (selectedDownloads.includes("healthcare")) total += 280;
                          if (selectedDownloads.includes("path")) total += 12;
                          return `${total} MB`;
                        })()}
                      </span>
                    </div>

                    <Button
                      onClick={() => {
                        if (selectedDownloads.length === 0) {
                          toast.error("Please select at least one item to download.");
                          return;
                        }
                        setIsDownloading(true);
                        setDownloadProgress(0);
                        const interval = setInterval(() => {
                          setDownloadProgress(prev => {
                            if (prev >= 100) {
                              clearInterval(interval);
                              setIsDownloading(false);
                              setIsOfflineMode(true);
                              setOfflineDownloadDialogOpen(false);
                              toast.success("Download complete! Entered simulated Offline Mode.");
                              return 100;
                            }
                            return prev + 10;
                          });
                        }, 200);
                      }}
                      className="w-full bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-9 rounded-xl border-none cursor-pointer mt-2"
                    >
                      Download Now
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WRITE REALITY CHECK MODAL OVERLAY (Spec L1930-1967) */}
          {realityCheckFormOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    ✍️ Share Your Reality Check ({selectedRole?.name || "Career"})
                  </span>
                  <button 
                    onClick={() => setRealityCheckFormOpen(false)} 
                    className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-hidden">
                  {/* Rating Section */}
                  <div className="space-y-2">
                    <span className="font-bold text-foreground block">Rate This Career:</span>
                    <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                      {[
                        { label: "Work-Life Balance", key: "wlb" },
                        { label: "Entry Difficulty", key: "entry" },
                        { label: "Growth Potential", key: "growth" },
                        { label: "Salary Rating", key: "salary" },
                        { label: "Job Satisfaction", key: "satisfaction" }
                      ].map((item) => (
                        <div key={item.key} className="flex justify-between items-center bg-muted/20 p-2 rounded-xl">
                          <span className="text-muted-foreground">{item.label}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setRealityCheckRatings(prev => ({ ...prev, [item.key as keyof typeof realityCheckRatings]: star }))}
                                className="text-[11px] hover:scale-125 transition-transform text-amber-500 cursor-pointer focus:outline-none"
                              >
                                {realityCheckRatings[item.key as keyof typeof realityCheckRatings] >= star ? "★" : "☆"}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-1">
                    <span className="font-bold text-foreground block">Write Review:</span>
                    <textarea
                      placeholder="I've been working in this role for 3 years. Here's what they don't tell you..."
                      value={realityCheckReviewText}
                      onChange={(e) => setRealityCheckReviewText(e.target.value)}
                      className="w-full h-20 bg-background border border-border rounded-xl p-2 text-foreground font-semibold outline-none focus:ring-1 focus:ring-[#3B8BD4] resize-none"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2">
                    <span className="font-bold text-foreground block">Quick Facts Checklist:</span>
                    <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                      {[
                        { label: "Good for introverts?", key: "introvert" },
                        { label: "Requires constant travel?", key: "travel" },
                        { label: "Remote-friendly?", key: "remote" },
                        { label: "High-stress environment?", key: "stress" }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={realityCheckOptions[item.key as keyof typeof realityCheckOptions]}
                            onChange={(e) => setRealityCheckOptions(prev => ({ ...prev, [item.key as keyof typeof realityCheckOptions]: e.target.checked }))}
                            className="accent-[#3B8BD4] cursor-pointer"
                          />
                          <span className="text-foreground">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* LinkedIn Verification */}
                  <div className="border border-[#3B8BD4]/30 bg-[#E6F1FB]/30 rounded-2xl p-3 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#185FA5] block">LinkedIn Verification Badge</span>
                      <span className="text-[9.5px] text-muted-foreground">Gets you verified ✓ badge on your reviews</span>
                    </div>
                    <Button
                      onClick={() => {
                        setRealityCheckLinkedInConnected(!realityCheckLinkedInConnected);
                        toast.success(realityCheckLinkedInConnected ? "LinkedIn profile disconnected." : "LinkedIn connected successfully! Verification active.");
                      }}
                      variant={realityCheckLinkedInConnected ? "default" : "outline"}
                      className={`text-[9.5px] font-bold h-7 rounded-xl cursor-pointer ${
                        realityCheckLinkedInConnected 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                          : "border-[#3B8BD4] text-[#185FA5] hover:bg-[#E6F1FB]"
                      }`}
                    >
                      {realityCheckLinkedInConnected ? "✓ Verified" : "Connect LinkedIn"}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button
                    onClick={() => setRealityCheckFormOpen(false)}
                    variant="outline"
                    className="flex-1 h-9 rounded-xl text-[11px] cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!realityCheckReviewText.trim()) {
                        toast.error("Please write a text review before submitting.");
                        return;
                      }
                      
                      const newReviewObj = {
                        name: "You (Sara T.)",
                        role: selectedRole?.name || "Professional",
                        company: realityCheckLinkedInConnected ? "Verified Co." : "Self-Employed",
                        verified: realityCheckLinkedInConnected,
                        experience: "2 years experience",
                        posted: "Just now",
                        location: "Nagpur",
                        rating: Math.round((realityCheckRatings.wlb + realityCheckRatings.entry + realityCheckRatings.growth + realityCheckRatings.salary + realityCheckRatings.satisfaction) / 5),
                        text: realityCheckReviewText,
                        options: Object.entries(realityCheckOptions).filter(([_, v]) => v).map(([k]) => k === "introvert" ? "Good for introverts" : k === "travel" ? "Travel required" : k === "remote" ? "Remote-friendly" : "High stress"),
                        helpfulVotes: 0,
                        commentsCount: 0
                      };

                      setCustomRealityChecks(prev => [newReviewObj, ...prev]);
                      setPioneerPoints(prev => prev + 150);
                      setRealityCheckFormOpen(false);
                      setRealityCheckReviewText("");
                      toast.success("Reality check submitted successfully! +150 XP Pioneer Points earned.");
                    }}
                    className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-9 rounded-xl border-none cursor-pointer"
                  >
                    Submit Reality Check
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SUGGEST CAREER EDITS MODAL OVERLAY (Spec L2009-2026) */}
          {suggestEditOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-background border border-border w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    ✏️ Suggest Career Edits
                  </span>
                  <button onClick={() => setSuggestEditOpen(false)} className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-muted-foreground text-[10.5px] leading-snug">
                    Current metrics show typical salary of <span className="font-bold text-foreground">₹10-20 LPA</span> for this role. If the market standard has shifted, suggest edits.
                  </p>
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Suggest New Salary Range:</span>
                    <input
                      type="text"
                      placeholder="e.g. ₹12-25 LPA in Bengaluru startups"
                      value={suggestedSalaryRange}
                      onChange={(e) => setSuggestedSalaryRange(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 h-8 text-foreground outline-none font-semibold focus:ring-1 focus:ring-[#3B8BD4]"
                    />
                  </div>

                  <div className="border border-dashed border-border rounded-2xl p-3 text-center space-y-2 bg-muted/10">
                    <span className="text-[10px] text-muted-foreground block font-medium">Verify suggested edits by uploading a salary slip / contract (strictly private, verified by moderator)</span>
                    <Button
                      onClick={() => {
                        setSuggestedEditSlipUploaded(true);
                        toast.success("Document uploaded successfully.");
                      }}
                      variant="outline"
                      className="text-[9.5px] h-7 px-3 rounded-lg border-dashed border-border"
                    >
                      {suggestedEditSlipUploaded ? "✓ Slip Uploaded" : "Upload Document"}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button onClick={() => setSuggestEditOpen(false)} variant="outline" className="flex-1 h-8 rounded-xl text-[10.5px] cursor-pointer">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!suggestedSalaryRange.trim()) {
                        toast.error("Please input your suggested salary range.");
                        return;
                      }
                      setPioneerPoints(prev => prev + 50);
                      setSuggestEditOpen(false);
                      setSuggestedSalaryRange("");
                      setSuggestedEditSlipUploaded(false);
                      toast.success("Suggested edit submitted. Earned +50 XP! Updates active when 3+ pioneers confirm.");
                    }}
                    className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-8 rounded-xl border-none cursor-pointer"
                  >
                    Submit Suggestions
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ADD MISSING CAREER MODAL OVERLAY (Spec L2027-2045) */}
          {addMissingCareerOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-background border border-border w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    🗺️ Add a Missing Career Node
                  </span>
                  <button onClick={() => setAddMissingCareerOpen(false)} className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-hidden">
                  <p className="text-muted-foreground text-[10.5px] leading-snug">
                    Submit metrics for a career that isn't mapped yet. Earn 200 XP Pioneer Points on approval.
                  </p>
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Career Name:</span>
                    <input
                      type="text"
                      placeholder="e.g. AI Prompt Engineer"
                      value={missingCareerForm.name}
                      onChange={(e) => setMissingCareerForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-3 h-8 text-foreground outline-none font-semibold focus:ring-1 focus:ring-[#3B8BD4]"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Category / Hub:</span>
                    <select
                      value={missingCareerForm.category}
                      onChange={(e) => setMissingCareerForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-3 h-8 text-foreground outline-none font-semibold focus:ring-1 focus:ring-[#3B8BD4]"
                    >
                      <option value="Technology">Technology Hub</option>
                      <option value="Business">Business Hub</option>
                      <option value="Creative">Creative Hub</option>
                      <option value="Healthcare">Healthcare Hub</option>
                      <option value="Finance">Finance Hub</option>
                    </select>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Description:</span>
                    <textarea
                      placeholder="Creates and optimizes generative prompts..."
                      value={missingCareerForm.description}
                      onChange={(e) => setMissingCareerForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full h-14 bg-background border border-border rounded-xl p-2 text-foreground font-semibold outline-none focus:ring-1 focus:ring-[#3B8BD4] resize-none"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Typical Salary Range:</span>
                    <input
                      type="text"
                      placeholder="e.g. ₹15-30 LPA"
                      value={missingCareerForm.salary}
                      onChange={(e) => setMissingCareerForm(prev => ({ ...prev, salary: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-3 h-8 text-foreground outline-none font-semibold focus:ring-1 focus:ring-[#3B8BD4]"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground block mb-1">Top Skills required:</span>
                    <input
                      type="text"
                      placeholder="e.g. LLM basics, python, creativity"
                      value={missingCareerForm.skills}
                      onChange={(e) => setMissingCareerForm(prev => ({ ...prev, skills: e.target.value }))}
                      className="w-full bg-background border border-border rounded-xl px-3 h-8 text-foreground outline-none font-semibold focus:ring-1 focus:ring-[#3B8BD4]"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button onClick={() => setAddMissingCareerOpen(false)} variant="outline" className="flex-1 h-8 rounded-xl text-[10.5px] cursor-pointer">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!missingCareerForm.name.trim()) {
                        toast.error("Please provide the career name.");
                        return;
                      }
                      setPioneerPoints(prev => prev + 200);
                      setAddMissingCareerOpen(false);
                      setMissingCareerForm({
                        name: "",
                        category: "Technology",
                        description: "",
                        salary: "",
                        skills: "",
                        education: "",
                        companies: ""
                      });
                      toast.success(`Career '${missingCareerForm.name}' submitted. Earned +200 XP Pioneer points! Node will appear on map post validation.`);
                    }}
                    className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-8 rounded-xl border-none cursor-pointer"
                  >
                    Submit Career Node
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STATION DETAILS OVERLAY (Spec L2314-2348) */}
          {selectedStationDetail && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-background border border-border w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    🎓 Station: {selectedStationDetail.name}
                  </span>
                  <button onClick={() => setSelectedStationDetail(null)} className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-[10.5px] text-muted-foreground">
                    <div>
                      <span>📍 Location:</span>
                      <span className="font-bold text-foreground block">{selectedStationDetail.location}</span>
                    </div>
                    <div>
                      <span>⏱️ Duration:</span>
                      <span className="font-bold text-foreground block">{selectedStationDetail.duration}</span>
                    </div>
                    <div>
                      <span>💰 Typical Fees:</span>
                      <span className="font-bold text-foreground block">{selectedStationDetail.fees}</span>
                    </div>
                    <div>
                      <span>⭐ Reviews:</span>
                      <span className="font-bold text-amber-500 block">★ {selectedStationDetail.rating} / 5</span>
                    </div>
                  </div>

                  <div className="border border-border rounded-xl p-3 bg-card space-y-1.5">
                    <span className="font-bold text-foreground block">🚪 Entry Requirements:</span>
                    <div className="text-[10px] text-muted-foreground space-y-0.5 leading-snug">
                      • Exam: <span className="font-semibold text-foreground">{selectedStationDetail.exam}</span> <br/>
                      • Target cutoff: <span className="font-semibold text-foreground">{selectedStationDetail.cutoff}</span> <br/>
                      • Key timeline: <span className="font-semibold text-foreground">{selectedStationDetail.examDate}</span>
                    </div>
                  </div>

                  <div className="border border-border rounded-xl p-3 bg-card space-y-1.5">
                    <span className="font-bold text-foreground block">📊 Outcomes & ROI:</span>
                    <div className="text-[10px] text-muted-foreground space-y-0.5 leading-snug">
                      • Placement Rate: <span className="font-semibold text-foreground text-emerald-600">{selectedStationDetail.placementRate}</span> <br/>
                      • Avg Salary: <span className="font-semibold text-foreground">{selectedStationDetail.avgSalary}</span> <br/>
                      • Careers Enabled: <span className="font-semibold text-foreground">{selectedStationDetail.careers}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 text-[10px]">
                  <Button
                    onClick={() => {
                      setSelectedStationDetail(null);
                      setTransferModalOpen(true);
                    }}
                    variant="outline"
                    className="flex-1 h-8 rounded-xl border-[#3B8BD4] text-[#185FA5] hover:bg-[#E6F1FB]"
                  >
                    🔄 Transfer Route
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success(`Requested alumni network introduction at ${selectedStationDetail.name}!`);
                    }}
                    className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-8 rounded-xl border-none cursor-pointer"
                  >
                    Connect with Alumni
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* COLLEGE TRANSFER OPTIONS MODAL OVERLAY (Spec L2381-2398) */}
          {transferModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-background border border-border w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    🔄 Transit-Like Route Transfer
                  </span>
                  <button onClick={() => setTransferModalOpen(false)} className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-purple-50 dark:bg-purple-955/15 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-3 text-[10.5px] leading-snug">
                    <span className="font-bold text-purple-800 dark:text-purple-400 block">Switching mid-stream?</span>
                    Analyze impact of transitioning your education to the PM Career path.
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-foreground block">Select Transfer Route Option:</span>
                    
                    {[
                      {
                        title: "1. Complete B.Com + PM Bootcamp",
                        time: "2 years remaining",
                        cost: "₹1.5 Lakhs extra",
                        prob: "75% probability",
                        rec: "Fastest parallel track"
                      },
                      {
                        title: "2. Switch to BBA Program",
                        time: "Lose 1 year (3 years remaining)",
                        cost: "₹4 Lakhs extra",
                        prob: "80% probability",
                        rec: "Formal credentials change"
                      },
                      {
                        title: "3. Continue B.Com + Self-Taught",
                        time: "2 years remaining",
                        cost: "₹30,000 extra",
                        prob: "55% probability",
                        rec: "High self-discipline needed"
                      }
                    ].map((opt, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          toast.success(`Selected transfer route: ${opt.title}. Adjusting Pathfinder directions...`);
                          setTransferModalOpen(false);
                          setPathfinderRouteType("direct");
                          setSidebarMode("pathfinder");
                        }}
                        className="border border-border hover:border-purple-400 p-3 rounded-2xl bg-card hover:bg-purple-50/10 cursor-pointer space-y-1 transition-colors"
                      >
                        <span className="font-bold text-foreground block text-[10.5px]">{opt.title}</span>
                        <div className="grid grid-cols-2 gap-1 text-[9.5px] text-muted-foreground">
                          <div>⏱️ {opt.time}</div>
                          <div>💰 {opt.cost}</div>
                          <div>📈 {opt.prob}</div>
                          <div className="text-purple-600 font-semibold">{opt.rec}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={() => setTransferModalOpen(false)} variant="outline" className="w-full h-8 rounded-xl text-[10.5px] cursor-pointer">
                  Close / Cancel
                </Button>
              </div>
            </div>
          )}
          {/* MEASURE CAREER DISTANCE DIALOG OVERLAY (Spec L2785-2838) */}
          {showMeasureDistanceDialog && measureDistancePoints.length >= 2 && (
            <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-background border border-border w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    📏 MEASURE CAREER DISTANCE
                  </span>
                  <button 
                    onClick={() => {
                      setShowMeasureDistanceDialog(false);
                      setMeasureDistancePoints([]);
                    }} 
                    className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Point list */}
                  <div className="bg-muted/30 p-3 rounded-2xl border border-border space-y-2">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-bold text-foreground">
                        {ROLE_DETAILS_MOCK[measureDistancePoints[0]]?.name || "Software Engineer"}
                      </span>
                    </div>
                    {measureDistancePoints.length === 2 ? (
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-muted-foreground">To:</span>
                        <span className="font-bold text-foreground">
                          {ROLE_DETAILS_MOCK[measureDistancePoints[1]]?.name || "Product Manager"}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-muted-foreground">Via (Intermediate):</span>
                          <span className="font-bold text-pink-600">
                            {ROLE_DETAILS_MOCK[measureDistancePoints[1]]?.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="text-muted-foreground">To (Target):</span>
                          <span className="font-bold text-foreground">
                            {ROLE_DETAILS_MOCK[measureDistancePoints[2]]?.name}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Career Distance stats block */}
                  <div className="border border-[#3B8BD4]/30 bg-[#E6F1FB]/30 rounded-2xl p-3.5 space-y-2.5">
                    <span className="font-bold text-[#185FA5] text-[11px] block">📏 Career Distance Metrics:</span>
                    <div className="grid grid-cols-2 gap-2 text-[10.5px] text-muted-foreground">
                      <div>🤝 Skill Overlap: <span className="font-bold text-foreground">{measureDistancePoints.length === 2 ? "68%" : "85% → 95%"}</span></div>
                      <div>⏱️ Time to Switch: <span className="font-bold text-foreground">{measureDistancePoints.length === 2 ? "6-9 months" : "5-7 years"}</span></div>
                      <div>⭐ Difficulty: <span className="font-bold text-foreground">{measureDistancePoints.length === 2 ? "⭐⭐⭐" : "⭐⭐⭐⭐"}</span></div>
                      <div>💰 Cost/Investment: <span className="font-bold text-foreground">{measureDistancePoints.length === 2 ? "₹40K-80K" : "₹1.5-3L"}</span></div>
                    </div>
                  </div>

                  {/* Visual path line on map */}
                  <div className="p-3 bg-muted/10 border border-border rounded-2xl text-center space-y-2">
                    <span className="text-[10px] text-muted-foreground block font-semibold uppercase tracking-wider">Visual Route Map:</span>
                    <div className="flex items-center justify-center gap-1 text-[9px] text-foreground font-semibold">
                      <span>{ROLE_DETAILS_MOCK[measureDistancePoints[0]]?.name.split(" ")[0]}</span>
                      <span className="text-muted-foreground">━━━━━&gt;</span>
                      {measureDistancePoints.length === 3 && (
                        <>
                          <span className="text-pink-600">{ROLE_DETAILS_MOCK[measureDistancePoints[1]]?.name.split(" ")[0]}</span>
                          <span className="text-muted-foreground">━━━━━&gt;</span>
                        </>
                      )}
                      <span>{ROLE_DETAILS_MOCK[measureDistancePoints[measureDistancePoints.length - 1]]?.name.split(" ")[0]}</span>
                    </div>
                    <div className="text-[8.5px] text-muted-foreground">
                      {measureDistancePoints.length === 2 
                        ? "(6-9 months switch · 68% overlap)" 
                        : "(Stage 1: 2 years, 70% overlap · Stage 2: 3 years, 75% overlap)"}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-1 text-[10.5px]">
                    <span className="font-bold text-foreground block uppercase text-[9px] tracking-wider text-neutral-400">Breakdown:</span>
                    <div className="space-y-1 text-muted-foreground pl-1.5 border-l border-border">
                      <div>💪 Transferable Skills: <span className="font-semibold text-foreground">15/22 skills</span></div>
                      <div>⚠️ New Skills Needed: <span className="font-semibold text-foreground">{measureDistancePoints.length === 2 ? "7 Gaps" : "12 Gaps"}</span></div>
                      <div className="pt-1">
                        <span className="font-bold text-foreground block text-[9.5px]">Critical Gaps to build:</span>
                        <span className="text-red-500 font-semibold">• Product Strategy · Stakeholder Management · Business Metrics</span>
                      </div>
                      <div className="pt-1">
                        <span className="font-bold text-foreground block text-[9.5px]">Nice-to-Haves:</span>
                        <span className="text-emerald-600">• SQL (you have this ✓) · Agile (you have this ✓)</span>
                      </div>
                    </div>
                  </div>

                  {/* Fastest Path */}
                  <div className="bg-purple-50 dark:bg-purple-955/10 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-3 text-[10.5px] leading-snug">
                    <span className="font-bold text-purple-800 dark:text-purple-400 block">⚡ Fastest Path Recommendation:</span>
                    "PM Bootcamp + 2 side projects focused on B2C mobile apps"
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  {measureDistancePoints.length === 2 && (
                    <Button
                      onClick={() => {
                        setShowMeasureDistanceDialog(false);
                        toast.info("Right-click an intermediate role (e.g. Technical Product Manager) to set the 2nd waypoint.");
                      }}
                      variant="outline"
                      className="w-full h-8 rounded-xl text-[10.5px] border-pink-400 text-pink-600 cursor-pointer"
                    >
                      ➕ Add Intermediate Waypoint (Multi-Point)
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setShowMeasureDistanceDialog(false);
                        setMeasureDistancePoints([]);
                        setSidebarMode("pathfinder");
                        toast.success("Loaded distance pathway in PathFinder navigator.");
                      }}
                      variant="outline"
                      className="flex-1 h-8 rounded-xl text-[10.5px] cursor-pointer"
                    >
                      View Detailed Path
                    </Button>
                    <Button
                      onClick={() => {
                        setShowMeasureDistanceDialog(false);
                        setMeasureDistancePoints([]);
                        toast.success("Let's begin! Career pathway added to your journey tracker.");
                      }}
                      className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-8 rounded-xl border-none cursor-pointer"
                    >
                      Start Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SKILL GAP AR VIEW DIALOG OVERLAY (Spec L2840-2920) */}
          {showSkillGapAR && (
            <div className="absolute inset-0 bg-slate-955/80 backdrop-blur-md z-50 flex items-center justify-center pointer-events-auto p-3 text-foreground">
              <div className="bg-background border border-border w-full max-w-lg rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200 flex flex-col h-[90vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-border pb-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      📱 Skill Gap AR Simulator (Live View)
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowSkillGapAR(false)} 
                    className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* AR Mode Toggles */}
                <div className="grid grid-cols-3 gap-1.5 bg-muted/30 p-1 rounded-2xl shrink-0">
                  {[
                    { id: "desk", label: "📷 Desktop AR" },
                    { id: "physical", label: "🚶 Physical Walk" },
                    { id: "interview", label: "🎙️ AR Interview" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveARSubTab(tab.id as typeof activeARSubTab);
                        toast.info(`Switched to: ${tab.label}`);
                      }}
                      className={`py-1.5 text-[10px] font-bold rounded-xl border-none cursor-pointer transition-all ${
                        activeARSubTab === tab.id
                          ? "bg-[#3B8BD4] text-white shadow-sm"
                          : "bg-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* AR Camera Screen simulation */}
                <div className="flex-1 min-h-0 bg-slate-950 rounded-2xl border border-neutral-800 relative overflow-hidden flex flex-col items-center justify-center">
                  
                  {/* Grid overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
                  
                  {/* Scanner line */}
                  <div className="absolute left-0 right-0 h-0.5 bg-cyan-500/40 shadow-[0_0_10px_#22d3ee] animate-pulse pointer-events-none top-1/4" style={{ animationDuration: '3s' }} />

                  {/* TAB 1: DESKTOP AR */}
                  {activeARSubTab === "desk" && (
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                      {/* Top status */}
                      <div className="flex justify-between items-center bg-black/60 backdrop-blur-xs p-2 rounded-xl border border-white/10 text-[9.5px]">
                        <span className="text-white font-semibold flex items-center gap-1">🟢 Camera Mapped to physical space</span>
                        <span className="text-cyan-400 font-bold">68% READY</span>
                      </div>

                      {/* Interactive Workspace Hotspots */}
                      <div className="flex-1 relative my-2">
                        {/* Laptop Hotspot */}
                        <div 
                          onClick={() => toast.success("💻 Laptop AR: Your coding skills transfer directly to Product Manager logic capabilities!")}
                          className="absolute top-[40%] left-[20%] group cursor-pointer"
                        >
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-white text-[8px] animate-bounce font-bold">
                            ✓
                          </div>
                          <div className="absolute left-6 -top-2 bg-black/80 text-white p-1.5 rounded-lg border border-emerald-500/30 text-[8.5px] whitespace-nowrap hidden group-hover:block z-30">
                            <span className="font-bold text-emerald-400 block">✓ Coding Transferable</span>
                            Logic & API structure transfers to PM.
                          </div>
                        </div>

                        {/* Notebook Hotspot */}
                        <div 
                          onClick={() => {
                            toast.warning("📚 Notebook AR: Critical skill gap identified!");
                            alert("Playing stakeholder management tutorial...");
                          }}
                          className="absolute top-[55%] left-[55%] group cursor-pointer"
                        >
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-white text-[8px] animate-bounce font-bold">
                            ⚠️
                          </div>
                          <div className="absolute left-6 -top-6 bg-black/80 text-white p-1.5 rounded-lg border border-amber-500/30 text-[8.5px] w-40 hidden group-hover:block z-30 space-y-1">
                            <span className="font-bold text-amber-400 block">⚠️ Stakeholder Gap</span>
                            Learn to align team priorities.
                            <Button size="sm" className="h-4 text-[8px] px-1 bg-amber-500 text-black border-none font-bold py-0">▶ Play Tutorial</Button>
                          </div>
                        </div>

                        {/* Bookshelf Hotspot */}
                        <div 
                          onClick={() => toast.info("📚 Bookshelf AR: Recommended PM reading material spotted!")}
                          className="absolute top-[20%] left-[70%] group cursor-pointer"
                        >
                          <div className="w-5 h-5 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center text-white text-[8px] animate-bounce font-bold">
                            ℹ
                          </div>
                          <div className="absolute left-6 -top-2 bg-black/80 text-white p-1.5 rounded-lg border border-blue-500/30 text-[8.5px] whitespace-nowrap hidden group-hover:block z-30">
                            <span className="font-bold text-blue-400 block">📖 Inspired by Marty Cagan</span>
                            Recommended PM reference book.
                          </div>
                        </div>

                        {/* Progress Ring and Next Skill overlay */}
                        <div className="absolute bottom-2 left-2 right-2 bg-black/70 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full border-4 border-[#3B8BD4] border-r-transparent flex items-center justify-center text-[9px] font-bold">
                              68%
                            </div>
                            <div>
                              <span className="font-bold block text-[10px]">Overall Readiness</span>
                              <span className="text-[8.5px] text-neutral-400">PM alignment score</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[8.5px] text-amber-400 block">➡️ NEXT SKILL FOCUS:</span>
                            <span className="font-bold text-[10px] text-white">[Product Strategy]</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-[9px] text-neutral-500 bg-black/40 py-1 rounded-lg">
                        💡 Hover or tap on the pulsing indicator nodes to inspect details
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PHYSICAL SPACE WALK */}
                  {activeARSubTab === "physical" && (
                    <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-between items-center bg-black/60 p-2 rounded-xl text-[9px]">
                        <span>🚶 Virtual Walk simulator: walk around physical room</span>
                        <span className="font-bold text-purple-400">AR NODES</span>
                      </div>

                      {/* Direction Grid */}
                      <div className="flex-1 relative my-2 flex items-center justify-center">
                        {/* Product Manager Node - Left */}
                        <div 
                          onClick={() => {
                            toast.success("Walking toward Product Manager node...");
                            handleOpenRole("pm");
                          }}
                          className="absolute left-4 bg-emerald-950/80 border border-emerald-500 p-2 rounded-xl cursor-pointer text-center w-28 scale-95 hover:scale-100 transition-all"
                        >
                          <span className="font-bold text-emerald-400 block text-[9.5px]">👈 Product Manager</span>
                          <span className="text-[8.5px] text-neutral-400 block">68% Skill Match</span>
                          <span className="text-[8.5px] text-emerald-500 font-bold block">6 months switch</span>
                        </div>

                        {/* UX Designer - Straight */}
                        <div 
                          onClick={() => {
                            toast.success("Walking toward UX Designer node...");
                            handleOpenRole("designer");
                          }}
                          className="absolute top-2 bg-blue-955/80 border border-blue-500 p-2 rounded-xl cursor-pointer text-center w-28 scale-95 hover:scale-100 transition-all"
                        >
                          <span className="font-bold text-blue-400 block text-[9.5px]">👆 UX Designer</span>
                          <span className="text-[8.5px] text-neutral-400 block">75% Skill Match</span>
                          <span className="text-[8.5px] text-blue-500 font-bold block">8 months switch</span>
                        </div>

                        {/* Data Analyst - Right */}
                        <div 
                          onClick={() => {
                            toast.success("Walking toward Data Analyst node...");
                            handleOpenRole("swengineer");
                          }}
                          className="absolute right-4 bg-amber-955/80 border border-amber-500 p-2 rounded-xl cursor-pointer text-center w-28 scale-95 hover:scale-100 transition-all"
                        >
                          <span className="font-bold text-amber-400 block text-[9.5px]">👉 Data Analyst</span>
                          <span className="text-[8.5px] text-neutral-400 block">82% Skill Match</span>
                          <span className="text-[8.5px] text-amber-500 font-bold block">4 months switch</span>
                        </div>

                        {/* Software Architect - Behind */}
                        <div 
                          onClick={() => {
                            toast.success("Walking toward Software Architect node...");
                            handleOpenRole("swengineer");
                          }}
                          className="absolute bottom-2 bg-neutral-900 border border-neutral-700 p-2 rounded-xl cursor-pointer text-center w-28 scale-95 hover:scale-100 transition-all"
                        >
                          <span className="font-bold text-neutral-400 block text-[9.5px]">👇 Architect (Behind)</span>
                          <span className="text-[8.5px] text-neutral-400 block">60% Skill Match</span>
                          <span className="text-[8.5px] text-neutral-500 font-bold block">3 years switch</span>
                        </div>
                      </div>

                      <div className="text-center text-[9px] text-neutral-500 bg-black/40 py-1 rounded-lg">
                        💡 Tap any node to 'walk' toward it and open its RoleView details in the sidebar
                      </div>
                    </div>
                  )}

                  {/* TAB 3: AR INTERVIEW PRACTICE */}
                  {activeARSubTab === "interview" && (
                    <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-between items-center bg-black/60 p-2 rounded-xl text-[9px]">
                        <span>🎙️ AI Mock Interviewer (Virtual Presence)</span>
                        <span className="font-bold text-red-500">LIVE FEED</span>
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                        {/* Virtual Interviewer Avatar */}
                        <div className="w-16 h-16 rounded-full bg-neutral-800 border-2 border-[#3B8BD4] flex items-center justify-center text-white relative">
                          <span className="text-2xl">🤖</span>
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border border-black flex items-center justify-center text-[8px] font-bold">✓</div>
                        </div>

                        {/* Dialog status */}
                        <div className="text-center space-y-1">
                          <span className="font-bold text-[10px] text-neutral-300">Sneha G. (AI Interviewer)</span>
                          <p className="text-[9.5px] text-neutral-400 italic max-w-xs px-4">
                            {mockQuestion || "Click Start below to begin your mock PM interview."}
                          </p>
                        </div>

                        {/* Interview Feedback Report */}
                        {interviewFeedback && (
                          <div className="bg-black/80 border border-neutral-800 rounded-2xl p-2.5 w-full max-w-xs space-y-2 text-[9.5px]">
                            <span className="font-bold text-emerald-400 block text-center">📊 AI INTERVIEW FEEDBACK REPORT</span>
                            <div className="grid grid-cols-2 gap-1.5 text-neutral-400">
                              <div>🗣️ Um count: <span className="text-red-400 font-bold">15 times</span></div>
                              <div>⏱️ Pacing/Speed: <span className="text-emerald-400 font-bold">Solid (120wpm)</span></div>
                              <div>📈 Content Score: <span className="text-emerald-400 font-bold">8.5 / 10</span></div>
                              <div>👁️ Eye Contact: <span className="text-amber-400 font-bold">Maintain more</span></div>
                            </div>
                            <p className="text-[8.5px] text-neutral-400 leading-normal pt-1 border-t border-neutral-900">
                              "Try pausing instead of filler words. Your Product framework was solid."
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setMockQuestion("Question: 'How would you design an alarm clock for the blind?'");
                              setInterviewFeedback(false);
                              toast.info("Mock interview started. Speak your answer out loud.");
                            }}
                            className="bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-7 text-[10px] rounded-lg border-none cursor-pointer px-3"
                          >
                            ▶ Start Mock
                          </Button>
                          {mockQuestion && !interviewFeedback && (
                            <Button
                              onClick={() => {
                                setInterviewFeedback(true);
                                toast.success("Answer received. AI analyzed response body language & pacing!");
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-7 text-[10px] rounded-lg border-none cursor-pointer px-3"
                            >
                              🛑 Stop & Analyze
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer buttons */}
                <div className="flex gap-2.5 shrink-0">
                  <Button
                    onClick={() => {
                      setShowSkillGapAR(false);
                      toast.info("Exited AR view.");
                    }}
                    variant="outline"
                    className="flex-1 h-9 rounded-xl text-[11px] cursor-pointer"
                  >
                    Close AR View
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* INCOGNITO CAREER EXPLORATION DIALOG OVERLAY (Spec L3301-3329) */}
          {showIncognitoPrompt && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-[#1A1A1A] text-neutral-300 border border-neutral-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center justify-center text-center space-y-2 pb-2 border-b border-neutral-800">
                  <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-white">
                    <span className="text-xl">🕶️</span>
                  </div>
                  <span className="font-bold text-sm text-white block">
                    INCOGNITO CAREER EXPLORATION
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    You're exploring in incognito mode
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <span className="font-bold text-white block text-[10px] uppercase tracking-wider text-pink-500">This Session:</span>
                    <div className="space-y-1 pl-1">
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="text-emerald-500">✓</span>
                        <span>Won't save to your history</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="text-emerald-500">✓</span>
                        <span>Won't affect recommendations</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="text-emerald-500">✓</span>
                        <span>Won't earn XP or badges</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="text-emerald-500">✓</span>
                        <span>Won't appear in Journey Timeline</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-white block text-[10px] uppercase tracking-wider text-blue-400">Useful When:</span>
                    <div className="space-y-1 pl-1 text-[10.5px] text-neutral-400">
                      <div>• Exploring for someone else</div>
                      <div>• Researching sensitive careers</div>
                      <div>• Don't want to influence your feed</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-white block text-[10px] uppercase tracking-wider text-amber-400">You Can Still:</span>
                    <div className="space-y-1 pl-1">
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="text-emerald-500">✓</span>
                        <span>View all careers</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="text-emerald-500">✓</span>
                        <span>Use PathFinder</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10.5px]">
                        <span className="text-emerald-500">✓</span>
                        <span>Save to a temporary list</span>
                      </div>
                      <div className="text-neutral-500 pl-4 text-[9.5px]">└─ (Export before closing)</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button
                    onClick={() => {
                      setIsIncognito(false);
                      setShowIncognitoPrompt(false);
                      toast.info("Incognito Mode deactivated.");
                    }}
                    variant="outline"
                    className="flex-1 h-9 rounded-xl text-[11px] border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Exit Incognito
                  </Button>
                  <Button
                    onClick={() => {
                      setShowIncognitoPrompt(false);
                      toast.success("Continuing session in Incognito Mode.");
                    }}
                    className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white font-bold h-9 rounded-xl border-none cursor-pointer"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VOICE NAVIGATION COMMAND ASSISTANT (Spec L3015-3039) */}
          {voiceNavigatorOpen && (
            <div className={`absolute z-55 w-80 bg-slate-900 border border-slate-700/60 rounded-3xl p-4 shadow-2xl space-y-3 pointer-events-auto text-xs text-white animate-in slide-in-from-bottom duration-250 transition-all duration-300 ${selectedRoleOpen && !searchFocused ? "bottom-6 md:left-[416px] max-md:bottom-40 max-md:right-4 max-md:left-auto" : "bottom-6 left-4"}`}>
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  🎙️ Voice Exploration Assistant
                </span>
                <button 
                  onClick={() => setVoiceNavigatorOpen(false)}
                  className="ghost p-0.5 hover:bg-white/10 rounded-full text-neutral-400 hover:text-white cursor-pointer bg-transparent border-none outline-none"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Speech Wave / Listening Indicator */}
              <div className="flex flex-col items-center justify-center py-2 bg-black/40 rounded-xl space-y-1.5">
                {voiceListening ? (
                  <>
                    <div className="flex items-end gap-1 h-5">
                      <span className="w-1 bg-cyan-400 rounded animate-pulse h-3" style={{ animationDelay: '0.1s' }} />
                      <span className="w-1 bg-cyan-400 rounded animate-pulse h-5" style={{ animationDelay: '0.3s' }} />
                      <span className="w-1 bg-cyan-400 rounded animate-pulse h-4" style={{ animationDelay: '0.5s' }} />
                      <span className="w-1 bg-cyan-400 rounded animate-pulse h-2" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1 bg-cyan-400 rounded animate-pulse h-4" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <span className="text-[10px] text-cyan-400 font-bold animate-pulse">LISTENING...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl text-neutral-500">🎙️</span>
                    <span className="text-[10px] text-neutral-400 font-semibold">Idle</span>
                  </>
                )}
                
                {voiceCmdStatus && (
                  <p className="text-[10.5px] text-emerald-400 font-bold text-center px-2">
                    🗣️ Heard: "{voiceCmdStatus}"
                  </p>
                )}
              </div>

              {/* Command Presets Simulator */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider block">Tap to Simulate Command:</span>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { cmd: "search Product Manager", action: () => {
                      setSearchQuery("Product Manager");
                      setSidebarMode("search_results");
                      setSelectedRoleOpen(true);
                      setVoiceCmdStatus("search Product Manager");
                      setVoiceListening(false);
                      toast.success("Command Executed: Searching for Product Manager");
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Searching for Product Manager"));
                      }
                    }},
                    { cmd: "plan path to UX Designer", action: () => {
                      handleOpenRole("designer");
                      setSidebarMode("pathfinder");
                      setVoiceCmdStatus("plan path to UX Designer");
                      setVoiceListening(false);
                      toast.success("Command Executed: Planning pathway to UX Designer");
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Planning pathway to UX Designer"));
                      }
                    }},
                    { cmd: "open settings", action: () => {
                      setSidebarMode("settings");
                      setSelectedRoleOpen(true);
                      setVoiceCmdStatus("open settings");
                      setVoiceListening(false);
                      toast.success("Command Executed: Opening settings");
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Opening settings panel"));
                      }
                    }},
                    { cmd: "go incognito", action: () => {
                      setIsIncognito(true);
                      setShowIncognitoPrompt(true);
                      setVoiceCmdStatus("go incognito");
                      setVoiceListening(false);
                      toast.success("Command Executed: Entering Incognito exploration mode");
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Entering Incognito mode"));
                      }
                    }},
                    { cmd: "measure distance", action: () => {
                      setVoiceCmdStatus("measure distance");
                      setVoiceListening(false);
                      setMeasureDistanceActive(true);
                      setMeasureDistancePoints([]);
                      toast.success("Command Executed: Distance measurement mode active");
                      if ('speechSynthesis' in window) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Please select career nodes to measure distance"));
                      }
                    }}
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 text-[10px] font-semibold cursor-pointer transition-colors text-white"
                    >
                      🗣️ "{item.cmd}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setVoiceListening(true);
                    setVoiceCmdStatus("");
                    toast.info("Listening for command...");
                  }}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-7 text-[10px] rounded-lg border-none cursor-pointer"
                >
                  🎙️ Speak Again
                </Button>
                <Button
                  onClick={() => setVoiceNavigatorOpen(false)}
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/10 text-white font-bold h-7 text-[10px] rounded-lg cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* ADVANCED DISCOVER FILTERS DIALOG OVERLAY (Spec L2721-2763) */}
          {showFilterDialog && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    🔍 Discover Careers with Filters
                  </span>
                  <button onClick={() => setShowFilterDialog(false)} className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 scrollbar-hidden">
                  {/* Work Style */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-pink-600">Work Style:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Remote-friendly", key: "remoteFriendly" },
                        { label: "Flexible hours", key: "flexibleHours" },
                        { label: "High travel", key: "highTravel" },
                        { label: "Team collaboration", key: "teamCollaboration" }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={careerFilters[item.key as keyof typeof careerFilters]}
                            onChange={(e) => setCareerFilters(prev => ({ ...prev, [item.key as keyof typeof careerFilters]: e.target.checked }))}
                            className="accent-[#3B8BD4] cursor-pointer"
                          />
                          <span className="text-[10px] text-foreground font-semibold">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Career Stage */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-pink-600">Career Stage:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Entry-level accessible", key: "entryLevel" },
                        { label: "Mid-level opportunities", key: "midLevel" },
                        { label: "Senior/Leadership only", key: "seniorLevel" }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={careerFilters[item.key as keyof typeof careerFilters]}
                            onChange={(e) => setCareerFilters(prev => ({ ...prev, [item.key as keyof typeof careerFilters]: e.target.checked }))}
                            className="accent-[#3B8BD4] cursor-pointer"
                          />
                          <span className="text-[10px] text-foreground font-semibold">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Lifestyle */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-pink-600">Lifestyle:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Work-life balance (4/5+)", key: "wlbRating" },
                        { label: "High stress acceptable", key: "highStress" },
                        { label: "Minimal overtime", key: "minimalOvertime" }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={careerFilters[item.key as keyof typeof careerFilters]}
                            onChange={(e) => setCareerFilters(prev => ({ ...prev, [item.key as keyof typeof careerFilters]: e.target.checked }))}
                            className="accent-[#3B8BD4] cursor-pointer"
                          />
                          <span className="text-[10px] text-foreground font-semibold">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-pink-600">Skills:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Technical skills required", key: "technicalSkills" },
                        { label: "Creative skills focus", key: "creativeSkills" },
                        { label: "People management", key: "peopleManagement" }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={careerFilters[item.key as keyof typeof careerFilters]}
                            onChange={(e) => setCareerFilters(prev => ({ ...prev, [item.key as keyof typeof careerFilters]: e.target.checked }))}
                            className="accent-[#3B8BD4] cursor-pointer"
                          />
                          <span className="text-[10px] text-foreground font-semibold">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-pink-600">Education:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Any degree accepted", key: "anyDegree" },
                        { label: "Specific degree required", key: "specificDegree" },
                        { label: "Bootcamp-friendly", key: "bootcampFriendly" }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={careerFilters[item.key as keyof typeof careerFilters]}
                            onChange={(e) => setCareerFilters(prev => ({ ...prev, [item.key as keyof typeof careerFilters]: e.target.checked }))}
                            className="accent-[#3B8BD4] cursor-pointer"
                          />
                          <span className="text-[10px] text-foreground font-semibold">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Market */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-pink-600">Market Demand:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "High demand (500+ openings)", key: "highDemand" },
                        { label: "Stable (consistent hiring)", key: "stableHiring" },
                        { label: "Emerging (new fields)", key: "emergingField" }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={careerFilters[item.key as keyof typeof careerFilters]}
                            onChange={(e) => setCareerFilters(prev => ({ ...prev, [item.key as keyof typeof careerFilters]: e.target.checked }))}
                            className="accent-[#3B8BD4] cursor-pointer"
                          />
                          <span className="text-[10px] text-foreground font-semibold">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Compensation & Extras */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-foreground block text-[10px] uppercase tracking-wider text-pink-600">Compensation:</span>
                    <div className="bg-muted/10 p-3 rounded-2xl border border-border space-y-2">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="text-muted-foreground">Typical Salary Range:</span>
                        <span className="font-bold text-foreground">₹15L - ₹30L</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full relative">
                        <div className="absolute left-1/4 right-1/4 h-full bg-[#3B8BD4] rounded-full" />
                        <div className="absolute left-1/4 -top-1 w-3 h-3 bg-white border-2 border-[#3B8BD4] rounded-full cursor-pointer" />
                        <div className="absolute right-1/4 -top-1 w-3 h-3 bg-white border-2 border-[#3B8BD4] rounded-full cursor-pointer" />
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {[
                          { label: "Equity available", key: "equityAvailable" },
                          { label: "Bonuses common", key: "bonusesCommon" }
                        ].map((item) => (
                          <label key={item.key} className="flex items-center gap-2 p-1.5 rounded-xl bg-background border border-border cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={careerFilters[item.key as keyof typeof careerFilters]}
                              onChange={(e) => setCareerFilters(prev => ({ ...prev, [item.key as keyof typeof careerFilters]: e.target.checked }))}
                              className="accent-[#3B8BD4] cursor-pointer"
                            />
                            <span className="text-[9.5px] text-foreground font-semibold">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button
                    onClick={() => {
                      setCareerFilters({
                        remoteFriendly: false,
                        flexibleHours: false,
                        highTravel: false,
                        teamCollaboration: false,
                        entryLevel: false,
                        midLevel: false,
                        seniorLevel: false,
                        wlbRating: false,
                        highStress: false,
                        minimalOvertime: false,
                        technicalSkills: false,
                        creativeSkills: false,
                        peopleManagement: false,
                        anyDegree: false,
                        specificDegree: false,
                        bootcampFriendly: false,
                        highDemand: false,
                        stableHiring: false,
                        emergingField: false,
                        equityAvailable: false,
                        bonusesCommon: false
                      });
                      toast.info("Filters reset.");
                    }}
                    variant="outline"
                    className="flex-1 h-9 rounded-xl text-[11px] cursor-pointer"
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={() => {
                      setShowFilterDialog(false);
                      toast.success("Applied Filters! Shows 23 matching careers on the map.");
                    }}
                    className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-9 rounded-xl border-none cursor-pointer"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* CO-EXPLORE LIVE SESSION FLOATING WIDGET (Spec L1795-1907) */}
          {coExploreActive && (
            <div className="absolute top-3 right-3 z-40 bg-background border border-border rounded-2xl p-3 shadow-2xl space-y-2 w-64 pointer-events-auto text-xs animate-in slide-in-from-top-5 duration-200">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Users size={14} className="text-[#3B8BD4] animate-pulse" /> 
                  Co-Explore Session
                </span>
                <Badge className="bg-emerald-100 text-emerald-800 border-none font-bold text-[8px] uppercase">
                  Live
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-semibold text-[10.5px] text-foreground">Sneha G. (Mentor) is connected</span>
              </div>

              {/* Voice Chat Controls */}
              <div className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-xl p-2">
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-[10px] block">Voice Connection</span>
                  <span className="text-[8.5px] text-muted-foreground">{coExploreVoiceActive ? "🎙️ Microphone active" : "🔇 Microphone muted"}</span>
                </div>
                <button
                  onClick={() => {
                    setCoExploreVoiceActive(!coExploreVoiceActive);
                    toast.success(coExploreVoiceActive ? "Microphone muted" : "Voice channel connected! Talk live.");
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                    coExploreVoiceActive ? "bg-emerald-500 text-white border-emerald-500" : "bg-muted text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Headphones size={13} />
                </button>
              </div>

              <div className="flex gap-1.5 pt-1">
                <Button
                  size="sm"
                  onClick={() => setCoExploreChatOpen(true)}
                  className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-7 rounded-xl text-[10px] gap-1 cursor-pointer border-none"
                >
                  <MessageSquare size={11} /> Open Chat
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCoExploreActive(false);
                    toast.info("Co-Explore session ended.");
                  }}
                  className="flex-1 font-bold h-7 rounded-xl text-[10px] cursor-pointer text-red-500 hover:text-red-650"
                >
                  End
                </Button>
              </div>
            </div>
          )}

          {/* CO-EXPLORE COLLABORATIVE CHAT & COMMENTING DRAWER (Spec L1795-1907) */}
          {coExploreActive && coExploreChatOpen && (
            <div className="absolute top-[160px] right-3 z-50 bg-background border border-border w-72 rounded-3xl shadow-2xl flex flex-col pointer-events-auto text-xs h-[320px] overflow-hidden animate-in slide-in-from-top-5 duration-200">
              
              {/* Drawer Header */}
              <div className="p-3 border-b border-border flex justify-between items-center bg-muted/20 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[#3B8BD4] font-bold">💬 Session Chat & Notes</span>
                  <Badge variant="secondary" className="text-[8px] font-bold px-1.5 py-0">Mentor Panel</Badge>
                </div>
                <button 
                  onClick={() => setCoExploreChatOpen(false)} 
                  className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground border-none"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-hidden">
                {coExploreMessages.map((msg, idx) => {
                  const isMentor = msg.sender.includes("Mentor") || msg.sender.includes("Priya") || msg.sender.includes("Sneha");
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col max-w-[85%] ${isMentor ? "mr-auto items-start" : "ml-auto items-end"}`}
                    >
                      <span className="text-[8.5px] text-muted-foreground mb-0.5 px-0.5 font-semibold">
                        {msg.sender}
                      </span>
                      <div className={`p-2 rounded-2xl text-[10.5px] leading-relaxed ${
                        isMentor 
                          ? "bg-muted text-foreground rounded-tl-sm" 
                          : "bg-[#3B8BD4] text-white rounded-tr-sm font-medium"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const input = form.elements.namedItem("message") as HTMLInputElement;
                  if (!input.value.trim()) return;
                  
                  const userText = input.value;
                  setCoExploreMessages(prev => [...prev, { sender: "You", text: userText }]);
                  input.value = "";

                  // Simulated Mentor response
                  setTimeout(() => {
                    let mentorResponse = "Excellent point. Also note that the transition salary range in Pune aligns perfectly with this path.";
                    if (userText.toLowerCase().includes("salary") || userText.toLowerCase().includes("pay")) {
                      mentorResponse = "In Pune/Bengaluru, average PM compensation scales 30% faster if you have solid engineering roots. I've pinned a salary trend for you.";
                    } else if (userText.toLowerCase().includes("figma") || userText.toLowerCase().includes("design")) {
                      mentorResponse = "Yes! I highly recommend taking the 'Curiosity Compass' wireframe audit first. It builds portfolio credit.";
                    } else if (userText.toLowerCase().includes("founder") || userText.toLowerCase().includes("startup")) {
                      mentorResponse = "Founders with PM background have a 4.2x higher survival rate. The Pathfinder 'Fastest' path handles the transition checklist.";
                    }
                    setCoExploreMessages(prev => [...prev, { sender: "Sneha G (Mentor)", text: mentorResponse }]);
                    toast.success("New message from Sneha G. (Mentor)");
                  }, 1200);
                }}
                className="p-2 border-t border-border bg-card flex gap-1.5 shrink-0 items-center"
              >
                <input 
                  type="text" 
                  name="message"
                  placeholder="Type a message to Mentor..." 
                  className="flex-1 bg-background border border-border rounded-xl px-3 h-8 text-[10.5px] outline-none text-foreground"
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  className="bg-[#3B8BD4] hover:bg-[#185FA5] text-white px-2.5 h-8 rounded-xl font-bold cursor-pointer border-none flex items-center justify-center shrink-0"
                >
                  Send
                </button>
              </form>
            </div>
          )}


          {/* WORKSPACE IMMERSIVE TAKEOVER VIEW (Spec L1126-1241) */}
          {workspaceViewOpen && (
            <div className="absolute inset-0 bg-[#0B0F19] z-50 flex flex-col pointer-events-auto select-none animate-in fade-in zoom-in-95 duration-200">
              
              {/* Top Control Bar */}
              <div className="flex justify-between items-center p-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <Compass className="text-purple-400 animate-spin-slow" size={20} />
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight">360° Immersive Desk Workspace</h2>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5 font-medium">Explore the desk environment of a {selectedRole?.name}</span>
                  </div>
                </div>
                
                {/* Professional Variants Segmented Control */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
                  {["Startup", "Corporate", "Freelance"].map(variant => (
                    <button
                      key={variant}
                      onClick={() => {
                        setWorkspaceStage(variant);
                        toast.success(`Switched workspace style to: ${variant}`);
                      }}
                      className={`px-3 py-1 text-[9.5px] font-bold rounded-lg transition-colors cursor-pointer border-none outline-none ${
                        workspaceStage === variant 
                          ? "bg-[#3B8BD4] text-white" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>

                {/* Close Tour button */}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setWorkspaceViewOpen(false);
                    setWorkspaceCTAOpen(true);
                  }}
                  className="h-8 text-[10px] rounded-xl border-slate-700 text-slate-300 hover:bg-slate-900"
                >
                  Exit Workspace <X size={12} className="ml-1" />
                </Button>
              </div>

              {/* Middle 360 Workspace Canvas Panel */}
              <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-slate-950">
                
                {/* Street View Panning Simulated Background */}
                <div 
                  className="absolute w-[200%] h-full bg-cover bg-center transition-transform duration-300 ease-out opacity-60"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600')`,
                    transform: `translateX(${(workspacePanningOffset / 100) * 10}%) scale(1.05)` 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-transparent to-slate-950/45" />

                {/* Panning Controls Overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur border border-slate-800 rounded-2xl py-2 px-4 shadow-xl z-20">
                  <button 
                    onClick={() => setWorkspacePanningOffset(prev => Math.max(-400, prev - 50))}
                    className="ghost text-slate-400 hover:text-white cursor-pointer border-none outline-none bg-transparent"
                    title="Pan Left"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-[9.5px] font-bold text-slate-300 uppercase tracking-wider">360° Panning Control</span>
                    <span className="text-[8px] text-slate-500 mt-0.5 font-medium">Click buttons or drag canvas to orient</span>
                  </div>
                  <button 
                    onClick={() => setWorkspacePanningOffset(prev => Math.min(400, prev + 50))}
                    className="ghost text-slate-400 hover:text-white cursor-pointer border-none outline-none bg-transparent"
                    title="Pan Right"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Interactive Hotspots */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  {/* Hotspot 1: LAPTOP */}
                  <div 
                    className="absolute pointer-events-auto"
                    style={{ top: "42%", left: `calc(40% + ${(workspacePanningOffset / 400) * 15}%)` }}
                  >
                    <button
                      onClick={() => setWorkspaceOpenHotspot(workspaceOpenHotspot === "laptop" ? null : "laptop")}
                      className="ghost w-8 h-8 rounded-full bg-[#3B8BD4] border-2 border-white flex items-center justify-center text-white text-[12px] shadow-lg animate-bounce cursor-pointer"
                    >
                      💻
                    </button>
                    <span className="bg-slate-950/80 border border-slate-800 text-white font-bold text-[8.5px] px-1.5 py-0.5 rounded shadow absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                      Workstation Laptop
                    </span>
                  </div>

                  {/* Hotspot 2: WHITEBOARD */}
                  <div 
                    className="absolute pointer-events-auto"
                    style={{ top: "28%", left: `calc(65% + ${(workspacePanningOffset / 400) * 15}%)` }}
                  >
                    <button
                      onClick={() => setWorkspaceOpenHotspot(workspaceOpenHotspot === "whiteboard" ? null : "whiteboard")}
                      className="ghost w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[12px] shadow-lg animate-bounce cursor-pointer"
                    >
                      📋
                    </button>
                    <span className="bg-slate-950/80 border border-slate-800 text-white font-bold text-[8.5px] px-1.5 py-0.5 rounded shadow absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                      Sprint Whiteboard
                    </span>
                  </div>

                  {/* Hotspot 3: PRIYA (COWORKER NARRATIVE) */}
                  <div 
                    className="absolute pointer-events-auto"
                    style={{ top: "35%", left: `calc(20% + ${(workspacePanningOffset / 400) * 15}%)` }}
                  >
                    <button
                      onClick={() => setWorkspaceOpenHotspot(workspaceOpenHotspot === "priya" ? null : "priya")}
                      className="ghost w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-[12px] shadow-lg animate-bounce cursor-pointer"
                    >
                      👩‍💼
                    </button>
                    <span className="bg-slate-950/80 border border-slate-800 text-white font-bold text-[8.5px] px-1.5 py-0.5 rounded shadow absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                      Priya (Senior Lead)
                    </span>
                  </div>

                  {/* Hotspot 4: COFFEE CUP */}
                  <div 
                    className="absolute pointer-events-auto"
                    style={{ top: "60%", left: `calc(48% + ${(workspacePanningOffset / 400) * 15}%)` }}
                  >
                    <button
                      onClick={() => setWorkspaceOpenHotspot(workspaceOpenHotspot === "coffee" ? null : "coffee")}
                      className="ghost w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-white text-[12px] shadow-lg animate-bounce cursor-pointer"
                    >
                      ☕
                    </button>
                    <span className="bg-slate-950/80 border border-slate-800 text-white font-bold text-[8.5px] px-1.5 py-0.5 rounded shadow absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap">
                      Coffee Vibe Check
                    </span>
                  </div>
                </div>

                {/* Hotspot Detail Cards Overlay */}
                {workspaceOpenHotspot && (
                  <div className="absolute right-6 top-6 bottom-20 w-80 bg-slate-950/95 backdrop-blur border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between z-20 pointer-events-auto text-white">
                    <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hidden">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                        <span className="font-bold text-sm flex items-center gap-1.5">
                          {workspaceOpenHotspot === "laptop" && <>💻 Digital Workstation</>}
                          {workspaceOpenHotspot === "whiteboard" && <>📋 Sprint Whiteboard</>}
                          {workspaceOpenHotspot === "priya" && <>👩‍💼 Priya's Desk Commentary</>}
                          {workspaceOpenHotspot === "coffee" && <>☕ Coffee Vibe Break</>}
                        </span>
                        <button 
                          onClick={() => setWorkspaceOpenHotspot(null)} 
                          className="ghost text-slate-400 hover:text-white cursor-pointer border-none outline-none bg-transparent"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* LAPTOP FIGMA CANVAS CHALLENGE */}
                      {workspaceOpenHotspot === "laptop" && (
                        <div className="space-y-3.5 text-xs text-slate-300">
                          <p className="leading-relaxed font-medium">
                            {selectedRole?.name}s use key digital dashboards here: Figma layouts, Jira Kanban, and Amplitude analysis.
                          </p>
                          <div className="border border-slate-800 bg-slate-900 rounded-xl p-3.5 space-y-2">
                            <span className="font-bold text-[10px] text-sky-400 block uppercase tracking-wider">Figma Design Task Challenge</span>
                            <p className="text-[11px] text-slate-300 font-medium">
                              Redesign the button checkout layout flow for Nagpur e-commerce target.
                            </p>
                            
                            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-center space-y-2">
                              <span className="text-[10px] text-slate-400 font-bold block">Current Button Label: "Buy Now"</span>
                              <div className="flex gap-1 justify-center">
                                {["Proceed to Nagpur Checkout", "Confirm & Pay (Fastest)", "Secure Checkout"].map(lbl => (
                                  <button 
                                    key={lbl}
                                    onClick={() => {
                                      toast.success(`Challenge Complete! XP +200! Chosen Label: ${lbl}`);
                                      setFigmaChallengeSuccess(true);
                                      setXpEarned(prev => prev + 200);
                                    }}
                                    className="bg-slate-800 hover:bg-[#3B8BD4] text-[9px] font-bold py-1 px-1.5 rounded transition-colors text-white cursor-pointer border-none outline-none"
                                  >
                                    {lbl}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {figmaChallengeSuccess && (
                              <Badge className="bg-emerald-950 border-emerald-800 text-emerald-400 font-bold text-[9px] flex items-center justify-center gap-1 mt-1 border-none py-1">
                                <CheckCircle2 size={10} /> Task Done (200 XP Added)
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* WHITEBOARD TASKS */}
                      {workspaceOpenHotspot === "whiteboard" && (
                        <div className="space-y-3 text-xs text-slate-300">
                          <p className="leading-relaxed font-medium">
                            Standup Task Board. Focuses on product specs, sprint deadlines, and development milestones.
                          </p>
                          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl space-y-2">
                            <span className="font-bold text-sky-400 block text-[10px]">Today's Sprint Tasks:</span>
                            <ul className="space-y-1.5 text-slate-300 text-[10.5px]">
                              <li className="flex items-center gap-1.5">
                                <CheckCircle2 size={11} className="text-emerald-400" />
                                <span className="font-medium">Optimize Nagpur server latency</span>
                              </li>
                              <li className="flex items-center gap-1.5">
                                <CheckCircle2 size={11} className="text-emerald-400" />
                                <span className="font-medium">Design system checkout wireframe review</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* PRIYA NARRATIVE commentary */}
                      {workspaceOpenHotspot === "priya" && (
                        <div className="space-y-3.5 text-xs text-slate-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-900 border border-purple-700 flex items-center justify-center font-bold text-sm text-purple-300">
                              PG
                            </div>
                            <div>
                              <span className="font-bold text-white block">Priya Gupta</span>
                              <span className="text-[9.5px] text-purple-300 block font-medium">Lead PM Mentor at Myraaha</span>
                            </div>
                          </div>

                          <p className="leading-relaxed italic bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl font-medium">
                            "As a Product Manager, I spend about 40% of my day in meetings aligning engineers and design, 30% researching customer patterns, and 30% writing specifications. Nagpur has a fast-growing local tech startup sector!"
                          </p>

                          {/* Play Audio Commentary mock */}
                          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold">Listen to Priya's Career Advice</span>
                            <button
                              onClick={() => {
                                toast.success("Playing commentary audio mock...");
                              }}
                              className="bg-[#3B8BD4] hover:bg-[#185FA5] text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer border-none outline-none"
                            >
                              <Play size={10} fill="white" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* COFFEE CUP VIBE CHECK */}
                      {workspaceOpenHotspot === "coffee" && (
                        <div className="space-y-3 text-xs text-slate-300">
                          <p className="leading-relaxed font-medium">
                            Reflections check. Balancing focus levels is key to preventing professional burnout.
                          </p>
                          <div className="bg-amber-955/20 border border-amber-800/30 p-3 rounded-xl space-y-1.5 text-center">
                            <span className="text-[10.5px] font-bold text-amber-300 block">Caffeine Vibe Check</span>
                            <p className="text-[9.5px] text-slate-300 mt-1 font-medium">Take a deep breath. A Nagpur tech role offers a balanced 40 hrs/week schedule.</p>
                            <Button 
                              onClick={() => {
                                toast.success("Refreshed! Focus restored.");
                                setWorkspaceOpenHotspot(null);
                              }}
                              className="mt-2 bg-amber-600 hover:bg-amber-700 h-7 text-[10px] rounded-lg text-white border-none w-full"
                            >
                              Take a Break
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-500 text-center font-medium">
                      Standing at Nagoya/Nagpur desk environment.
                    </div>
                  </div>
                )}
              </div>

              {/* Time lapse Scrubber */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-4 shrink-0 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-purple-400 animate-pulse" />
                  <span className="font-bold text-white text-[11px]">Time Travel Day Scrubber:</span>
                  <span className="text-sky-300 text-[10.5px] bg-sky-955/50 border border-sky-800/40 rounded px-1.5 font-bold uppercase tracking-wider">
                    {workspaceTime === "9 AM" && "9:00 AM - Standup Focus"}
                    {workspaceTime === "1 PM" && "1:00 PM - Lunch & Mentor Chat"}
                    {workspaceTime === "5 PM" && "5:00 PM - Deploy & Review"}
                    {!["9 AM", "1 PM", "5 PM"].includes(workspaceTime) && `${workspaceTime} - Focus Time`}
                  </span>
                </div>
                <input 
                  type="range"
                  min="9"
                  max="17"
                  step="4"
                  value={workspaceTime === "9 AM" ? "9" : workspaceTime === "1 PM" ? "13" : "17"}
                  onChange={(e) => {
                    const h = e.target.value;
                    const val = h === "9" ? "9 AM" : h === "13" ? "1 PM" : "5 PM";
                    setWorkspaceTime(val);
                    toast.success(`Fast forwarded day to: ${val === "9 AM" ? "Standup" : val === "1 PM" ? "Lunch" : "Deploy"}`);
                  }}
                  className="w-48 accent-[#3B8BD4] cursor-pointer"
                />
              </div>

            </div>
          )}


          {/* CREATE CUSTOM COLLECTION DIALOG (Spec L1300) */}
          {dreamBoardCreateCollectionOpen && (
            <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-150">
              <div className="bg-background border border-border rounded-3xl p-5 shadow-2xl max-w-sm w-full space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <PlusCircle size={15} className="text-[#3B8BD4]" /> Create Custom Career List
                  </span>
                  <button 
                    onClick={() => setDreamBoardCreateCollectionOpen(false)}
                    className="ghost text-muted-foreground hover:text-foreground cursor-pointer border-none outline-none bg-transparent"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">List Title:</label>
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="e.g. Nagpur Tech Internships"
                      className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground outline-none focus:border-[#3B8BD4]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Description:</label>
                    <textarea
                      value={newCollectionDesc}
                      onChange={(e) => setNewCollectionDesc(e.target.value)}
                      placeholder="Keep track of options to show mentor."
                      rows={2}
                      className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground outline-none focus:border-[#3B8BD4]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Privacy Setting:</label>
                    <select
                      value={newCollectionPrivacy}
                      onChange={(e) => setNewCollectionPrivacy(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-1.5 text-foreground outline-none focus:border-[#3B8BD4] cursor-pointer"
                    >
                      <option value="Private (only you)">Private (only you)</option>
                      <option value="Shared with mentor">Shared with mentor (Sneha G.)</option>
                      <option value="Public to community">Public to Myraaha community</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (!newCollectionName.trim()) {
                        toast.error("Please enter a list title.");
                        return;
                      }
                      setDreamBoardCollections(prev => [
                        ...prev,
                        { name: newCollectionName, desc: newCollectionDesc || "No description provided.", privacy: newCollectionPrivacy, roles: [] }
                      ]);
                      toast.success(`Collection "${newCollectionName}" created!`);
                      setDreamBoardCreateCollectionOpen(false);
                      setNewCollectionName("");
                      setNewCollectionDesc("");
                    }}
                    className="bg-[#3B8BD4] hover:bg-[#185FA5] text-white flex-1 h-9 rounded-xl font-bold border-none cursor-pointer"
                  >
                    Create List
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDreamBoardCreateCollectionOpen(false)}
                    className="flex-1 h-9 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* SHARE COLLECTION DIALOG (Spec L1350) */}
          {dreamBoardShareOpen && (
            <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-150">
              <div className="bg-background border border-border rounded-3xl p-5 shadow-2xl max-w-sm w-full space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Share2 size={15} className="text-[#3B8BD4]" /> Share "{selectedCollectionToShare}"
                  </span>
                  <button 
                    onClick={() => setDreamBoardShareOpen(false)}
                    className="ghost text-muted-foreground hover:text-foreground cursor-pointer border-none outline-none bg-transparent"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: "🔗 Copy Shared Map URL", desc: "maps.myraaha.com/c/db_9a22d", action: () => { toast.success("Shared map link copied to clipboard!"); setDreamBoardShareOpen(false); } },
                    { label: "👨‍🏫 Send to Mentor (Sneha G.)", desc: "Allows mentor to view and append notes", action: () => { toast.success("Shared list successfully with mentor Sneha G.!"); setDreamBoardShareOpen(false); } },
                    { label: "📄 Export as PDF Roadmap", desc: "Downloads formatted curriculum overview", action: () => { toast.success("PDF file generated and downloaded successfully!"); setDreamBoardShareOpen(false); } },
                    { label: "🌐 Share to Community Feed", desc: "Makes list discoverable for Nagoya peers", action: () => { toast.success("Published successfully to Nagoya Community!"); setDreamBoardShareOpen(false); } }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full text-left p-2.5 border border-border bg-card rounded-xl hover:border-[#3B8BD4] transition-colors flex flex-col gap-0.5 cursor-pointer bg-transparent"
                    >
                      <span className="font-bold text-foreground text-xs">{item.label}</span>
                      <span className="text-[9.5px] text-muted-foreground font-semibold">{item.desc}</span>
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setDreamBoardShareOpen(false)}
                  className="w-full h-9 rounded-xl font-bold cursor-pointer"
                >
                  Close Share Menu
                </Button>
              </div>
            </div>
          )}


          {/* QUICK SAVE CATEGORIES DIALOG (Spec L1261-1274) */}
          {dreamBoardQuickSaveOpen && (
            <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-150">
              <div className="bg-background border border-border rounded-3xl p-5 shadow-2xl max-w-sm w-full space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <Bookmark size={15} className="text-[#3B8BD4] fill-[#3B8BD4]" /> Save "{selectedRole?.name}" to:
                  </span>
                  <button 
                    onClick={() => setDreamBoardQuickSaveOpen(false)}
                    className="ghost text-muted-foreground hover:text-foreground cursor-pointer border-none outline-none bg-transparent"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    { category: "Top Choices", icon: "⭐" },
                    { category: "Exploring", icon: "💼" },
                    { category: "Backup Options", icon: "✓" },
                    { category: "Stretch Goals", icon: "🎯" }
                  ].map((item) => {
                    const isSavedInCat = dreamBoardSavedRoles[selectedRole?.id] === item.category && savedRoles.includes(selectedRole?.id);
                    return (
                      <button
                        key={item.category}
                        onClick={() => {
                          setDreamBoardSavedRoles(prev => ({
                            ...prev,
                            [selectedRole.id]: item.category
                          }));
                          if (!savedRoles.includes(selectedRole.id)) {
                            setSavedRoles(prev => [...prev, selectedRole.id]);
                          }
                          toast.success(`Saved "${selectedRole.name}" to ${item.category}!`);
                          setDreamBoardQuickSaveOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                          isSavedInCat 
                            ? "bg-[#3B8BD4]/10 border-[#3B8BD4] text-[#185FA5] font-bold" 
                            : "bg-card border-border hover:border-[#3B8BD4] text-foreground bg-transparent"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.icon}</span>
                          <span>{item.category}</span>
                        </span>
                        {isSavedInCat && (
                          <span className="text-[10px] bg-[#3B8BD4] text-white px-2 py-0.5 rounded-lg">Active</span>
                        )}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => {
                      setDreamBoardQuickSaveOpen(false);
                      setDreamBoardCreateCollectionOpen(true);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-dashed border-border hover:border-[#3B8BD4] text-[#185FA5] font-bold flex items-center gap-2 cursor-pointer bg-transparent"
                  >
                    <span>➕</span>
                    <span>Create New Collection</span>
                  </button>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSavedRoles(prev => prev.filter(id => id !== selectedRole.id));
                    toast.info(`Removed "${selectedRole.name}" from Dream Board.`);
                    setDreamBoardQuickSaveOpen(false);
                  }}
                  className="w-full h-9 rounded-xl font-bold border-red-500 text-red-500 hover:bg-red-50"
                >
                  Remove from Dream Board
                </Button>
              </div>
            </div>
          )}

          {/* WORKSPACE EXIT CTA DIALOG */}
          {workspaceCTAOpen && (
            <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 pointer-events-auto animate-in fade-in duration-150">
              <div className="bg-background border border-border rounded-3xl p-5 shadow-2xl max-w-sm w-full space-y-4 text-xs text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/40 text-[#7F77DD] flex items-center justify-center mx-auto text-xl">
                  🎯
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-foreground">Inspired by the Workspace Tour?</h3>
                  <p className="text-[10.5px] text-muted-foreground leading-relaxed font-medium">
                    Take the first step toward becoming a {selectedRole?.name}. Plan your multi-stage roadmap or save it to your Dream Board.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      setWorkspaceCTAOpen(false);
                      setSelectedRoleOpen(true);
                      setSidebarMode("pathfinder");
                      setNavigationMode(false);
                      toast.success("Opening Pathfinder to design your path!");
                    }}
                    className="bg-[#3B8BD4] hover:bg-[#185FA5] text-white h-9 rounded-xl font-bold border-none cursor-pointer"
                  >
                    🗺️ Plan My Path (Start Pathfinder)
                  </Button>
                  <Button
                    onClick={() => {
                      if (!savedRoles.includes(selectedRole.id)) {
                        setSavedRoles(prev => [...prev, selectedRole.id]);
                        setDreamBoardSavedRoles(prev => ({
                          ...prev,
                          [selectedRole.id]: "Top Choices"
                        }));
                        toast.success(`${selectedRole.name} added to Top Choices in Dream Board!`);
                      } else {
                        toast.info(`${selectedRole.name} is already in your Dream Board.`);
                      }
                      setWorkspaceCTAOpen(false);
                    }}
                    variant="outline"
                    className="h-9 rounded-xl font-bold cursor-pointer"
                  >
                    ⭐ Save to Dream Board Favorites
                  </Button>
                  <button
                    onClick={() => setWorkspaceCTAOpen(false)}
                    className="text-[10px] text-muted-foreground hover:underline py-1 cursor-pointer bg-transparent border-none outline-none"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          )}



          {/* PRINT / PDF EXPORT MODAL */}
          {printExportOpen && (
            <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-background border border-border w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Printer size={16} className="text-[#3B8BD4]" /> Print / Export PDF
                  </span>
                  <button onClick={() => setPrintExportOpen(false)} className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  {[
                    {
                      title: "🗺️ My Career Roadmap",
                      desc: "Prints your active PathFinder route, milestones, and phase breakdown.",
                      action: () => {
                        toast.success("Opening print preview for Career Roadmap…");
                        setTimeout(() => window.print(), 300);
                        setPrintExportOpen(false);
                      }
                    },
                    {
                      title: "📊 Comparison Sheet",
                      desc: `Side-by-side PDF for ${comparisonSlots.length} selected role(s) across 8 metrics.`,
                      action: () => {
                        if (comparisonSlots.length < 2) { toast.error("Add at least 2 roles to comparison first."); return; }
                        toast.success("Generating comparison PDF… Opening print dialog.");
                        setTimeout(() => window.print(), 300);
                        setPrintExportOpen(false);
                      }
                    },
                    {
                      title: "📋 Role Career Card",
                      desc: `Exports the full ${selectedRole?.name || "selected role"} career card as a PDF.`,
                      action: () => {
                        toast.success(`Generating career card PDF for ${selectedRole?.name}…`);
                        setTimeout(() => window.print(), 300);
                        setPrintExportOpen(false);
                      }
                    },
                    {
                      title: "📥 Export Dream Board (JSON)",
                      desc: "Downloads your saved roles, notes, and collections as a JSON file.",
                      action: () => {
                        const data = { savedRoles, dreamBoardSavedRoles, dreamBoardNotes, dreamBoardCollections, exportedAt: new Date().toISOString() };
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                        const a = document.createElement("a");
                        a.setAttribute("href", dataStr);
                        a.setAttribute("download", "myraaha_dreamboard.json");
                        a.click();
                        toast.success("Dream Board exported as JSON!");
                        setPrintExportOpen(false);
                      }
                    }
                  ].map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      className="w-full text-left p-3 border border-border bg-card rounded-xl hover:border-[#3B8BD4] hover:bg-[#E6F1FB]/20 transition-colors flex flex-col gap-0.5 cursor-pointer"
                    >
                      <span className="font-bold text-foreground text-[11px]">{item.title}</span>
                      <span className="text-[9.5px] text-muted-foreground">{item.desc}</span>
                    </button>
                  ))}
                </div>

                <p className="text-[9px] text-muted-foreground text-center pt-1">
                  PDF export uses your browser's native print dialog. Use "Save as PDF" in print settings.
                </p>
                <Button onClick={() => setPrintExportOpen(false)} variant="outline" className="w-full h-8 rounded-xl cursor-pointer text-[10.5px]">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* IFRAME EMBED WIDGET GENERATOR MODAL */}
          {embedModalOpen && (() => {
            const embedRole = ROLE_DETAILS_MOCK[embedTargetRoleId] || selectedRole;
            const embedUrl = `${window.location.origin}/embed/careermap?role=${embedRole?.id || "pm"}&theme=light`;
            const EMBED_SIZES = [
              { label: "Small", desc: "320×200", w: 320, h: 200 },
              { label: "Medium", desc: "480×320", w: 480, h: 320 },
              { label: "Full", desc: "640×480", w: 640, h: 480 }
            ];
            const sz = EMBED_SIZES[embedSizeIndex] ?? EMBED_SIZES[1];
            const iframeCode = `<iframe\n  src="${embedUrl}"\n  width="${sz.w}"\n  height="${sz.h}"\n  frameborder="0"\n  style="border-radius:16px;border:1px solid #e2e8f0;"\n  title="${embedRole?.name || "Career"} — MyRaaha CareerMap"\n  allow="clipboard-write"\n></iframe>`;
            return (
            <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[100] flex items-center justify-center pointer-events-auto p-4">
              <div className="bg-background border border-border w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <span className="font-bold text-sm text-foreground flex items-center gap-2">
                    🖼️ Embed Career Widget
                  </span>
                  <button onClick={() => setEmbedModalOpen(false)} className="ghost p-1 hover:bg-muted rounded-full cursor-pointer text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="bg-muted/30 border border-border rounded-2xl p-3 space-y-1.5">
                    <span className="font-bold text-foreground block">🎯 Embedding:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-bold text-[#185FA5]">{embedRole?.name}</span>
                      <Badge className="bg-[#E6F1FB] text-[#185FA5] border-none text-[9px] font-bold">{embedRole?.category}</Badge>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-semibold text-foreground block">Widget Size:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {EMBED_SIZES.map((size, idx) => (
                        <button
                          key={size.label}
                          onClick={() => setEmbedSizeIndex(idx)}
                          className={`py-1.5 px-2 text-[9.5px] font-bold rounded-xl border transition-colors cursor-pointer ${
                            embedSizeIndex === idx
                              ? "bg-[#3B8BD4] border-[#3B8BD4] text-white"
                              : "bg-background border-border text-foreground hover:bg-muted"
                          }`}
                        >
                          {size.label}<br/><span className="font-normal opacity-75">{size.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-semibold text-foreground block">Generated Embed Code:</span>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-emerald-400 whitespace-pre leading-relaxed overflow-x-auto">
                      {iframeCode}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        navigator.clipboard?.writeText(iframeCode).catch(() => {});
                        toast.success("Embed code copied to clipboard!");
                      }}
                      className="flex-1 bg-[#3B8BD4] hover:bg-[#185FA5] text-white font-bold h-9 rounded-xl border-none cursor-pointer gap-1"
                    >
                      <Link2 size={12} /> Copy Embed Code
                    </Button>
                    <Button
                      onClick={() => setEmbedModalOpen(false)}
                      variant="outline"
                      className="flex-1 h-9 rounded-xl cursor-pointer"
                    >
                      Close
                    </Button>
                  </div>
                  <p className="text-[9px] text-muted-foreground text-center">
                    Paste this code into any website or blog. The widget loads live career data from MyRaaha.
                  </p>
                </div>
              </div>
            </div>
            );
          })()}


        </div>
      </div>
    </div>
  );
}
