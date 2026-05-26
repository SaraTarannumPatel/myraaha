import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Global references to manage scroll interception
let originalScrollTo = typeof window !== 'undefined' ? window.scrollTo : null;
let isRestoring = false;

// Setup a global interceptor for window.scrollTo(0,0) on initial reload/refresh
if (typeof window !== 'undefined' && window.history) {
  // Let this component handle scroll restoration manually
  window.history.scrollRestoration = 'manual';

  const navigationEntry = window.performance && 
    window.performance.getEntriesByType && 
    window.performance.getEntriesByType('navigation')[0];
  const isReload = navigationEntry && (navigationEntry as any).type === 'reload';

  if (isReload) {
    const key = `scroll-pos:${window.location.pathname}${window.location.search}`;
    const savedPos = sessionStorage.getItem(key);
    if (savedPos && parseFloat(savedPos) > 0) {
      isRestoring = true;
      originalScrollTo = window.scrollTo;
      
      // Override window.scrollTo to prevent lazy components resetting scroll to (0, 0)
      window.scrollTo = function(x?: number | ScrollToOptions, y?: number) {
        if (typeof x === 'number' && x === 0 && y === 0) {
          return;
        }
        if (typeof x === 'object' && x && x.left === 0 && x.top === 0) {
          return;
        }
        if (originalScrollTo) {
          if (typeof x === 'object') {
            originalScrollTo.call(window, x);
          } else {
            originalScrollTo.call(window, x!, y!);
          }
        }
      };
    }
  }
}

export default function ScrollRestoration() {
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  
  const isInitialLoad = useRef(true);
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);

  // 1. Throttled tracking of current scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Avoid tracking / saving scroll position during active restoration steps
      if (isRestoring) return;
      
      if (throttleTimeout.current) return;

      throttleTimeout.current = setTimeout(() => {
        throttleTimeout.current = null;
        const key = `scroll-pos:${window.location.pathname}${window.location.search}`;
        sessionStorage.setItem(key, String(window.scrollY));
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    const handleBeforeUnload = () => {
      const key = `scroll-pos:${window.location.pathname}${window.location.search}`;
      sessionStorage.setItem(key, String(window.scrollY));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (throttleTimeout.current) clearTimeout(throttleTimeout.current);
    };
  }, []);

  // 2. Perform restoration logic on component load and URL updates
  useEffect(() => {
    const key = `scroll-pos:${currentPath}`;
    const savedPos = sessionStorage.getItem(key);

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      
      if (savedPos !== null && isRestoring) {
        const targetY = parseFloat(savedPos);
        if (targetY > 0) {
          let attempts = 0;
          const maxAttempts = 100; // max 5 seconds (50ms * 100)
          let stableCount = 0;
          let lastHeight = 0;

          const interval = setInterval(() => {
            const docHeight = Math.max(
              document.body.scrollHeight,
              document.documentElement.scrollHeight,
              document.body.offsetHeight,
              document.documentElement.offsetHeight,
              document.body.clientHeight,
              document.documentElement.clientHeight
            );
            
            if (docHeight === lastHeight) {
              stableCount++;
            } else {
              stableCount = 0;
              lastHeight = docHeight;
            }

            // Stop waiting when:
            // - The page is tall enough to allow scrolling to the target position
            // - Height remains unchanged for 6 cycles (300ms), implying rendering finished but page is shorter
            // - Absolute timeout limit is reached
            if (docHeight >= targetY + window.innerHeight || stableCount >= 6 || attempts >= maxAttempts) {
              clearInterval(interval);
              
              if (originalScrollTo) {
                window.scrollTo = originalScrollTo;
              }
              isRestoring = false;
              
              // Scroll to target, bounded by current max scroll height
              window.scrollTo(0, Math.min(targetY, docHeight - window.innerHeight));
            }
            attempts++;
          }, 50);
          
          return () => {
            clearInterval(interval);
          };
        } else {
          // Saved scroll position is 0, release hook instantly
          if (originalScrollTo) {
            window.scrollTo = originalScrollTo;
          }
          isRestoring = false;
        }
      } else {
        // Not a reload restoration, restore original scrollTo
        isRestoring = false;
        if (originalScrollTo) {
          window.scrollTo = originalScrollTo;
        }
      }
    } else {
      // Handle client-side routing transitions
      if (originalScrollTo) {
        window.scrollTo = originalScrollTo;
      }
      isRestoring = false;

      if (location.hash) {
        const id = location.hash.substring(1);
        let attempts = 0;
        const interval = setInterval(() => {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            clearInterval(interval);
          } else if (attempts >= 30) {
            clearInterval(interval);
          }
          attempts++;
        }, 50);
        return () => clearInterval(interval);
      } else {
        window.scrollTo(0, 0);
      }
    }
  }, [currentPath, location.hash]);

  return null;
}
