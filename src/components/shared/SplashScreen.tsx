import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
  isAppReady?: boolean;
}

// Strictly restricted color scheme:
// #5500cb, #1b1b1b, #d3d3d3, #000000, #ffffff
const BEACONS = [
  { name: "Curiosity Compass", angle: -90, color: "#1b1b1b", desc: "Find your path", svg: "compass" },
  { name: "Career Navigator", angle: -30, color: "#1b1b1b", desc: "Map your journey", svg: "navigator" },
  { name: "AI Roadmaps", angle: 30, color: "#1b1b1b", desc: "Step-by-step navigation", svg: "roadmaps" },
  { name: "Career Therapist", angle: 90, color: "#1b1b1b", desc: "Resolve blocks", svg: "therapist" },
  { name: "Community Circles", angle: 150, color: "#1b1b1b", desc: "Learn with peers", svg: "circles" },
  { name: "Venture Builder", angle: 210, color: "#1b1b1b", desc: "Launch your idea", svg: "builder" },
];

const LOADING_STATUSES = [
  "Initializing MyRaaha Universe...",
  "Loading Curiosity Compass modules...",
  "Syncing Career Navigator maps...",
  "Compiling personalized AI Roadmaps...",
  "Aligning Career Therapist sessions...",
  "Opening Community Circles...",
  "Assembling Venture Builder tools...",
  "Ready to launch!"
];

const renderSvgIcon = (type: string, color: string) => {
  switch (type) {
    case "compass":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full p-3" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z" fill="rgba(85, 0, 203, 0.05)" />
          <circle cx="12" cy="12" r="1.5" fill={color} />
        </svg>
      );
    case "navigator":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full p-3.5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <polygon points="12,8 10,13 14,13" fill={color} />
        </svg>
      );
    case "roadmaps":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full p-3.5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="2.5" fill="rgba(85, 0, 203, 0.1)" />
          <circle cx="6" cy="12" r="2.5" fill="rgba(85, 0, 203, 0.1)" />
          <circle cx="18" cy="12" r="2.5" fill="rgba(85, 0, 203, 0.1)" />
          <circle cx="12" cy="19" r="2.5" fill="rgba(85, 0, 203, 0.2)" />
          <path d="M12 7.5v9M6 14.5l6 4.5M18 14.5l-6 4.5M6 9.5l6-4.5M18 9.5l-6-4.5" />
        </svg>
      );
    case "therapist":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full p-3.5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9z" fill="rgba(85, 0, 203, 0.03)" />
          <path d="M12 17c-2.5-1.5-4-3.5-4-5.5s1.5-3 4-3 4 1 4 3-1.5 4-4 5.5z" fill="rgba(85, 0, 203, 0.15)" />
          <circle cx="12" cy="7" r="1" fill={color} />
        </svg>
      );
    case "circles":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full p-3.5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="14" r="4.5" fill="rgba(85, 0, 203, 0.03)" />
          <circle cx="15" cy="14" r="4.5" fill="rgba(85, 0, 203, 0.03)" />
          <circle cx="12" cy="8.5" r="4.5" fill="rgba(85, 0, 203, 0.1)" />
          <circle cx="12" cy="14" r="1" fill={color} />
        </svg>
      );
    case "builder":
      return (
        <svg viewBox="0 0 24 24" className="w-full h-full p-3.5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="14" width="6" height="6" rx="1" fill="rgba(85, 0, 203, 0.1)" />
          <rect x="15" y="14" width="6" height="6" rx="1" fill="rgba(85, 0, 203, 0.1)" />
          <rect x="9" y="4" width="6" height="6" rx="1" fill="rgba(85, 0, 203, 0.03)" />
          <path d="M6 14V11a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" strokeDasharray="2 2" />
        </svg>
      );
    default:
      return null;
  }
};

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, isAppReady }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [startTime] = useState(() => Date.now());

  // Track window size for extreme responsiveness down to 290px
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute responsive layout coordinates and sizing
  let radius = 230;
  let beaconSizeClass = "w-16 h-16";
  let containerWidth = 140;
  let marginTopPx = -32;
  let logoSizeClass = "w-28 h-28";
  let titleSizeClass = "text-3xl";
  let taglineSizeClass = "text-xs";
  let loadingBarMaxWidth = "max-w-sm";

  if (windowWidth < 360) {
    // Ultra-small mobile (down to 290px)
    radius = Math.max(75, windowWidth * 0.28);
    beaconSizeClass = "w-8 h-8";
    containerWidth = 70;
    marginTopPx = -16;
    logoSizeClass = "w-16 h-16";
    titleSizeClass = "text-lg";
    taglineSizeClass = "text-[8px]";
    loadingBarMaxWidth = "max-w-[200px]";
  } else if (windowWidth < 640) {
    // Normal mobile
    radius = 110;
    beaconSizeClass = "w-10 h-10";
    containerWidth = 90;
    marginTopPx = -20;
    logoSizeClass = "w-20 h-20";
    titleSizeClass = "text-xl";
    taglineSizeClass = "text-[9px]";
    loadingBarMaxWidth = "max-w-[260px]";
  } else if (windowWidth < 1024) {
    // Tablet
    radius = 165;
    beaconSizeClass = "w-12 h-12";
    containerWidth = 110;
    marginTopPx = -24;
    logoSizeClass = "w-24 h-24";
    titleSizeClass = "text-2xl";
    taglineSizeClass = "text-[10px]";
    loadingBarMaxWidth = "max-w-xs";
  }

  // Load progress established during early static bootstrap phase
  useEffect(() => {
    const initialVal = (window as any).__initialProgress || 0;
    setProgress(initialVal > 0 ? initialVal : 0);
  }, []);

  // Connected loading logic matching the true status in real time
  useEffect(() => {
    const intervalTime = 40;
    const minDisplayTime = 5600; // 5.6 seconds minimum display to allow full sequential beacon popout

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const isTimeElapsed = elapsed >= minDisplayTime;

      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 450);
          return 100;
        }

        // Phase 1: Rapidly move to 75%
        if (prev < 75) {
          return prev + 1.2;
        }

        // Phase 2: From 75% to 96% (slow down to wait for app/time readiness)
        if (prev < 96) {
          if (isAppReady && isTimeElapsed) {
            return prev + 2.5;
          }
          return prev + 0.15;
        }

        // Phase 3: Hold/Creep at 96-99% until ready
        if (prev < 99) {
          if (isAppReady && isTimeElapsed) {
            return prev + 1.0;
          }
          return prev + 0.02;
        }

        // Phase 4: Final 100% trigger
        if (isAppReady && isTimeElapsed) {
          return 100;
        }

        return prev;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isAppReady, onComplete, startTime]);

  // Rotate status text based on progress
  useEffect(() => {
    const statusStep = 100 / LOADING_STATUSES.length;
    const nextIndex = Math.min(
      Math.floor(progress / statusStep),
      LOADING_STATUSES.length - 1
    );
    if (nextIndex !== statusIndex) {
      setStatusIndex(nextIndex);
    }
  }, [progress, statusIndex]);

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white text-[#1b1b1b] overflow-hidden select-none">
      
      {/* 4. Orbiting Beacons - Centered around 38% coordinate with responsive sizes */}
      {BEACONS.map((beacon, idx) => {
        const angleRad = (beacon.angle * Math.PI) / 180;
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;

        return (
          <motion.div
            key={beacon.name}
            initial={{ opacity: 0, scale: 0, left: "50%", top: "38%" }}
            animate={{
              opacity: 1,
              scale: 1,
              left: `calc(50% + ${x}px)`,
              top: `calc(38% + ${y}px)`,
            }}
            transition={{
              type: "spring",
              stiffness: 40,
              damping: 12,
              delay: 1.2 + idx * 0.6, // Slow sequential entry (600ms apart)
            }}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              width: `${containerWidth}px`,
              marginLeft: `${-containerWidth / 2}px`, // Centered horizontally
              marginTop: `${marginTopPx}px`,          // Centered vertically
            }}
          >
            {/* Beacon Icon Container - static, no floating */}
            <div className="flex flex-col items-center w-full">
              {/* Circular Node - outline is strictly #1b1b1b, background transparent */}
              <div 
                className={`relative ${beaconSizeClass} rounded-full flex items-center justify-center bg-transparent border-2 overflow-hidden shadow-[0_8px_20px_rgba(85,0,203,0.02)]`}
                style={{ borderColor: "#1b1b1b" }}
              >
                {/* Vector illustrations are all colored using #5500cb */}
                {renderSvgIcon(beacon.svg, "#5500cb")}
              </div>

              {/* Title & Description of each Beacon - directly below the circle, respecting center */}
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8 + idx * 0.6 }}
                className="mt-2 text-center hidden sm:block pointer-events-none w-full"
              >
                {/* Names of all 6 circles are strictly #1b1b1b */}
                <p className="text-[10px] font-bold tracking-wider uppercase text-[#1b1b1b]">
                  {beacon.name}
                </p>
                {/* Subtitles of the 6 circles are strictly #d3d3d3 */}
                <p className="text-[9px] text-[#d3d3d3] font-normal leading-tight mt-0.5 max-w-[110px] mx-auto">
                  {beacon.desc}
                </p>
              </motion.div>
              
              {/* Ultra-mini title for mobile screens */}
              <div className="mt-1 text-center sm:hidden pointer-events-none w-full">
                <span className="text-[7.5px] font-bold tracking-tight leading-none text-[#1b1b1b] block max-w-[85px] mx-auto break-words">
                  {beacon.name}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* 5. Central Logo & Brand Text - Combined into ONE absolute centered container */}
      <div 
        className="absolute z-20 flex flex-col items-center justify-center text-center pointer-events-none"
        style={{
          left: "50%",
          top: "38%",
          transform: "translate(-50%, -50%)",
          width: "280px", // Fixed width locks centering of text perfectly below logo
        }}
      >
        {/* Core Logo Shield - Background set to transparent, outline #1b1b1b, retaining shadow */}
        <motion.div
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 90,
            damping: 15,
            delay: 0.3,
          }}
          className={`relative ${logoSizeClass} rounded-full p-2 bg-transparent border border-[#1b1b1b] flex items-center justify-center shadow-[0_15px_45px_rgba(85,0,203,0.1)]`}
        >
          <img
            src="/myraaha-logo.png"
            alt="MyRaaha Logo"
            className="w-[90%] h-[90%] object-contain relative z-10 rounded-full"
          />
        </motion.div>

        {/* Brand Text Details - Grouped here guarantees zero drift and correct spacing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-4 text-center"
        >
          <h1 className={`${titleSizeClass} font-bold tracking-wider text-[#5500cb] font-poppins`}>
            MyRaaha
          </h1>
          {/* Tagline is strictly "Your dream, re-imagined" in sentence case */}
          <p className={`${taglineSizeClass} text-[#1b1b1b]/80 tracking-[0.15em] font-light mt-0.5`}>
            Your dream, re-imagined
          </p>
        </motion.div>
      </div>

      {/* 6. Loading Progress & Status Messaging - Moved lower to prevent overlaps */}
      <div className={`absolute bottom-6 sm:bottom-8 w-[80%] ${loadingBarMaxWidth} flex flex-col items-center gap-3 z-30`}>
        
        {/* Status Message */}
        <div className="h-6 overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={statusIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-[11px] sm:text-xs text-[#1b1b1b]/80 font-medium tracking-wide text-center"
            >
              {LOADING_STATUSES[statusIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-full h-[4px] bg-[#d3d3d3] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5500cb] shadow-[0_0_8px_rgba(85,0,203,0.15)] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress Percentage */}
        <span className="text-[10px] text-[#1b1b1b]/50 font-mono tracking-widest mt-1">
          {Math.min(Math.round(progress), 100)}%
        </span>
      </div>

    </div>
  );
};

export default SplashScreen;
