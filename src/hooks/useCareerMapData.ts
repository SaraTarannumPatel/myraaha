/**
 * useCareerMapData.ts
 * 
 * Progressive data loader for CareerScape's 17,000+ role JSON dataset.
 * 
 * Strategy:
 *  1. On mount, dynamically import career_map_data.json (lazy – not in the
 *     main bundle so it doesn't block initial render).
 *  2. Project all pins to world-canvas coordinates immediately.
 *  3. Expose `visiblePins` – a culled subset of pins that fall inside a
 *     padded version of the current viewport, recomputed on pan/zoom change.
 *  4. Expose loading state so the UI can show a skeleton while data loads.
 */

import { useState, useEffect, useMemo } from "react";
import {
  projectPin,
  type RawCareerPin,
  type ProjectedCareerPin,
  WORLD_W,
  WORLD_H,
} from "@/utils/careerMapProjection";

interface UseCareerMapDataOptions {
  /** Current horizontal pan offset in px */
  panOffsetX: number;
  /** Current vertical pan offset in px */
  panOffsetY: number;
  /** Current zoom scale (1.0 = 100%) */
  zoomScale: number;
  /** Width of the visible viewport in px */
  viewportW: number;
  /** Height of the visible viewport in px */
  viewportH: number;
  /**
   * Maximum number of pins to keep in DOM at one time.
   * Pins are culled to the viewport; this is a hard cap as a safety net.
   * Default: 1500
   */
  maxVisible?: number;
}

interface UseCareerMapDataReturn {
  /** All projected pins (full dataset, stays stable after load) */
  allPins: ProjectedCareerPin[];
  /** Culled subset visible in the current viewport */
  visiblePins: ProjectedCareerPin[];
  /** True while the JSON is being fetched / processed */
  isLoading: boolean;
  /** Human-readable status message */
  statusMessage: string;
  /** Total number of roles loaded */
  totalCount: number;
  /** Precalculated territory hulls for all levels */
  hulls: any[];
  /** Precalculated job family road paths */
  roads: any[];
  /** Dynamic count of roles currently within the viewport bounds */
  rolesInViewportCount: number;
}

export function useCareerMapData({
  panOffsetX,
  panOffsetY,
  zoomScale,
  viewportW,
  viewportH,
  maxVisible = 1500,
}: UseCareerMapDataOptions): UseCareerMapDataReturn {
  const [allPins, setAllPins] = useState<ProjectedCareerPin[]>([]);
  const [hulls, setHulls] = useState<any[]>([]);
  const [roads, setRoads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Loading career universe…");

  const [debouncedPanX, setDebouncedPanX] = useState(panOffsetX);
  const [debouncedPanY, setDebouncedPanY] = useState(panOffsetY);
  const [debouncedZoom, setDebouncedZoom] = useState(zoomScale);

  // ── Load + project the full dataset once on mount ─────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatusMessage("Fetching 17,000+ career roles…");

        // Dynamic import keeps the 12 MB JSON out of the initial bundle.
        const mod = await import("@/data/career_map_data.json");
        if (cancelled) return;

        const rawMod = (mod as any).default || mod;
        setHulls(rawMod.hulls || []);
        setRoads(rawMod.roads || []);

        let raw: RawCareerPin[] = [];
        
        if (rawMod.scatter && rawMod.scatter.length > (rawMod.pins?.length || 0)) {
          // A background process generated the 18,000+ items into the "scatter" array
          raw = rawMod.scatter.map((s: any) => {
            return {
              id: s.id,
              name: s.name,
              x: s.position[0],
              y: s.position[1],
              data: s.data,
              category: s.category || "default"
            };
          });
        } else {
          raw = rawMod.pins || [];
        }

        setStatusMessage(`Projecting ${raw.length.toLocaleString()} nodes…`);

        // Project in small batches using requestIdleCallback / setTimeout so
        // we don't block the main thread during the projection pass.
        const BATCH = 500;
        const projected: ProjectedCareerPin[] = [];

        for (let i = 0; i < raw.length; i += BATCH) {
          if (cancelled) return;
          const batch = raw.slice(i, i + BATCH).map(projectPin);
          projected.push(...batch);
          // Yield to browser between batches
          await new Promise<void>((resolve) => setTimeout(resolve, 0));
        }

        if (cancelled) return;
        setAllPins(projected);
        setStatusMessage(`${projected.length.toLocaleString()} roles mapped`);
        setIsLoading(false);
      } catch (err) {
        console.error("[CareerMap] Failed to load career data:", err);
        setStatusMessage("Failed to load career data");
        setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []); // Only runs once on mount

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPanX(panOffsetX);
      setDebouncedPanY(panOffsetY);
      setDebouncedZoom(zoomScale);
    }, 100);

    return () => clearTimeout(handler);
  }, [panOffsetX, panOffsetY, zoomScale]);

  // ── Viewport culling: only render pins inside the current view ─────────────
  const visiblePins = useMemo(() => {
    console.log("[useCareerMapData] visiblePins calculation:", {
      allPinsLength: allPins.length,
      debouncedZoom,
      debouncedPanX,
      debouncedPanY,
      viewportW,
      viewportH
    });
    if (allPins.length === 0 || debouncedZoom < 1.0) return [];

    // Compute the world-space bounding box of the current viewport.
    // The transform applied to the canvas is:
    //   translate(panOffsetX, panOffsetY) scale(zoomScale)
    // So a viewport point (vx, vy) corresponds to world point:
    //   wx = (vx - panOffsetX) / zoomScale
    //   wy = (vy - panOffsetY) / zoomScale

    // Add a small padding so nodes near edges don't pop in/out.
    const PAD = 50;

    const wxMin = (-debouncedPanX - PAD) / debouncedZoom;
    const wyMin = (-debouncedPanY - PAD) / debouncedZoom;
    const wxMax = (viewportW - debouncedPanX + PAD) / debouncedZoom;
    const wyMax = (viewportH - debouncedPanY + PAD) / debouncedZoom;

    console.log("[useCareerMapData] Viewport bounds:", { wxMin, wxMax, wyMin, wyMax });

    const culled = allPins.filter(
      (p) =>
        p.worldX >= wxMin &&
        p.worldX <= wxMax &&
        p.worldY >= wyMin &&
        p.worldY <= wyMax
    );

    console.log("[useCareerMapData] culled count:", culled.length);

    if (culled.length <= maxVisible) return culled;

    const threshold = maxVisible / culled.length;
    // We deterministically decide if a pin is shown based on its ID length/characters to ensure stable rendering
    return culled.filter(p => {
      let hash = 0;
      for (let i = 0; i < p.id.length; i++) hash = Math.imul(31, hash) + p.id.charCodeAt(i) | 0;
      const normalizedHash = Math.abs(hash) / 2147483647; 
      return normalizedHash < threshold;
    });
  }, [allPins, debouncedPanX, debouncedPanY, debouncedZoom, viewportW, viewportH, maxVisible]);

  // ── Real-time viewport bounds count ───────────────────────────────────────
  const rolesInViewportCount = useMemo(() => {
    if (allPins.length === 0) return 0;

    const wxMin = -debouncedPanX / debouncedZoom;
    const wyMin = -debouncedPanY / debouncedZoom;
    const wxMax = (viewportW - debouncedPanX) / debouncedZoom;
    const wyMax = (viewportH - debouncedPanY) / debouncedZoom;

    let count = 0;
    for (let i = 0; i < allPins.length; i++) {
      const p = allPins[i];
      if (p.worldX >= wxMin && p.worldX <= wxMax && p.worldY >= wyMin && p.worldY <= wyMax) {
        count++;
      }
    }
    console.log("[useCareerMapData] rolesInViewportCount:", count);
    return count;
  }, [allPins, debouncedPanX, debouncedPanY, debouncedZoom, viewportW, viewportH]);

  return {
    allPins,
    visiblePins,
    isLoading,
    statusMessage,
    totalCount: allPins.length,
    hulls,
    roads,
    rolesInViewportCount
  };
}

// ── Helper: initial pan/zoom to centre the map in the viewport ───────────────
/**
 * Returns the initial panOffset that centres the world canvas in the viewport
 * at the given initial zoom level.
 */
export function getInitialPanOffset(
  viewportW: number,
  viewportH: number,
  zoomScale = 1.0
): { x: number; y: number } {
  return {
    x: (viewportW - WORLD_W * zoomScale) / 2,
    y: (viewportH - WORLD_H * zoomScale) / 2,
  };
}
