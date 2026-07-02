import React, { useEffect } from "react";

interface SplashScreenProps {
  onComplete: () => void;
  isAppReady?: boolean;
}

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

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, isAppReady }) => {
  useEffect(() => {
    const splash = document.getElementById("static-splash");
    const progressBar = document.getElementById("static-progress-bar") as HTMLDivElement | null;
    const percentageText = document.getElementById("static-percentage") as HTMLSpanElement | null;
    const statusText = document.getElementById("static-status") as HTMLParagraphElement | null;

    // If the static HTML splash screen is not found (e.g. subsequent internal route change), complete immediately
    if (!splash) {
      onComplete();
      return;
    }

    // Capture the initial progress value already set by the HTML inline script
    let currentProgress = (window as any).__initialProgress || 0;
    if (progressBar && progressBar.style.width) {
      const parsed = parseFloat(progressBar.style.width);
      if (!isNaN(parsed) && parsed > currentProgress) {
        currentProgress = parsed;
      }
    }

    const minDisplayTime = 5600; // 5.6s to allow CSS sequential pop-outs to complete (0.3s logo + 4.2s delay + 1.2s anim)
    
    // Performance navigation timing to check total page load time since index.html was initialized
    const pageLoadStartTime = (window.performance && window.performance.timing)
      ? window.performance.timing.navigationStart
      : Date.now();

    const intervalTime = 40;
    
    const updateDOM = (val: number) => {
      const roundedVal = Math.min(Math.round(val), 100);
      if (progressBar) {
        progressBar.style.width = `${roundedVal}%`;
      }
      if (percentageText) {
        percentageText.textContent = `${roundedVal}%`;
      }
      
      // Update status messages dynamically based on progress percent
      if (statusText) {
        const step = 100 / LOADING_STATUSES.length;
        const statusIdx = Math.min(
          Math.floor(roundedVal / step),
          LOADING_STATUSES.length - 1
        );
        statusText.textContent = LOADING_STATUSES[statusIdx];
      }
    };

    const timer = setInterval(() => {
      const totalElapsedSinceLoad = Date.now() - pageLoadStartTime;
      const isTimeElapsed = totalElapsedSinceLoad >= minDisplayTime;

      if (currentProgress >= 100) {
        clearInterval(timer);
        
        // Finalize status text
        if (statusText) {
          statusText.textContent = LOADING_STATUSES[LOADING_STATUSES.length - 1];
        }

        // Trigger CSS fadeout
        splash.classList.add("fade-out");

        // Wait for CSS transition (500ms) before unmounting and destroying DOM
        const timeout = setTimeout(() => {
          if (splash.parentNode) {
            splash.parentNode.removeChild(splash);
          }
          onComplete();
        }, 500);

        return;
      }

      // Phase 1: Rapidly move to 75%
      if (currentProgress < 75) {
        currentProgress += 1.2;
      }
      // Phase 2: From 75% to 96% (slow down while waiting for app/time readiness)
      else if (currentProgress < 96) {
        if (isAppReady && isTimeElapsed) {
          currentProgress += 2.5;
        } else {
          currentProgress += 0.15;
        }
      }
      // Phase 3: Hold/Creep at 96-99% until ready
      else if (currentProgress < 99) {
        if (isAppReady && isTimeElapsed) {
          currentProgress += 1.0;
        } else {
          currentProgress += 0.02;
        }
      }
      // Phase 4: Final 100% trigger
      else if (isAppReady && isTimeElapsed) {
        currentProgress = 100;
      }

      updateDOM(currentProgress);
    }, intervalTime);

    return () => {
      clearInterval(timer);
    };
  }, [isAppReady, onComplete]);

  return null; // The controller renders no React JSX; it operates the direct DOM nodes from HTML
};

export default SplashScreen;
