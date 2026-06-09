// CareerMap data + geometry helpers.
// Loads the 18,033 plotted roles from career_taxonomy and projects them
// into a 2D canvas viewport. Provides cluster centroids, sector palettes,
// convex hulls, hit-testing, and KSAO similarity for PathFinder routing.
import { supabase } from "@/integrations/supabase/client";

export interface MapRole {
  id: number;
  role_uuid: string;
  role_name: string;
  sector_name: string;
  sub_sector_name: string | null;
  domain_name: string | null;
  sub_domain_name: string | null;
  career_cluster: string | null;
  career_pathway_cluster: string | null;
  coord_x: number;
  coord_y: number;
  cluster_id: number | null;
}

// 17 sectors → stable HSL palette. Distinct hues, equal saturation/lightness
// so the map reads as one cohesive cartographic system.
export const SECTOR_HUES: Record<string, number> = {
  "Technology & IT": 210,
  "Healthcare & Life Sciences": 150,
  "Financial Services": 45,
  "Manufacturing & Engineering": 25,
  "Education": 280,
  "Government & Public Sector": 195,
  "Legal & Professional Services": 260,
  "Media, Entertainment & Creative": 330,
  "Agriculture, Environment & Natural Resources": 95,
  "Energy & Utilities": 50,
  "Hospitality, Tourism & Travel": 15,
  "NGO & Development": 165,
  "Real Estate & Construction": 30,
  "Retail & Consumer Goods": 350,
  "Sports": 110,
  "Telecommunications": 220,
  "Transport & Logistics": 240,
};

export const sectorColor = (sector: string, alpha = 1) => {
  const h = SECTOR_HUES[sector] ?? 200;
  return `hsla(${h}, 62%, 48%, ${alpha})`;
};
export const sectorFill = (sector: string, alpha = 0.18) => {
  const h = SECTOR_HUES[sector] ?? 200;
  return `hsla(${h}, 55%, 55%, ${alpha})`;
};

export async function loadMapRoles(): Promise<MapRole[]> {
  // 18k rows ≈ 2-3 MB. Fetch once, cache via react-query.
  // Supabase default limit is 1000 — page through.
  const all: MapRole[] = [];
  const pageSize = 5000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("career_taxonomy")
      .select("id, role_uuid, role_name, sector_name, sub_sector_name, domain_name, sub_domain_name, career_cluster, career_pathway_cluster, coord_x, coord_y, cluster_id")
      .not("coord_x", "is", null)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...(data as MapRole[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

// Andrew's monotone chain — convex hull for sector outline rendering.
export function convexHull(points: { x: number; y: number }[]) {
  const pts = points.slice().sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  if (pts.length < 3) return pts;
  const cross = (o: any, a: any, b: any) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: any[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: any[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

export function sectorHulls(roles: MapRole[]) {
  const bySector: Record<string, { x: number; y: number }[]> = {};
  for (const r of roles) {
    (bySector[r.sector_name] ||= []).push({ x: r.coord_x, y: r.coord_y });
  }
  const out: { sector: string; hull: { x: number; y: number }[]; centroid: { x: number; y: number }; count: number }[] = [];
  for (const [sector, pts] of Object.entries(bySector)) {
    if (pts.length < 5) continue;
    // For dense sectors, sub-sample to ~400 pts before hull — keeps it fast & smooth.
    const sample = pts.length > 400 ? pts.filter((_, i) => i % Math.ceil(pts.length / 400) === 0) : pts;
    const hull = convexHull(sample);
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    out.push({ sector, hull, centroid: { x: cx, y: cy }, count: pts.length });
  }
  return out;
}

// Viewport math — world coords [-100..100] → canvas pixels with pan+zoom.
export interface Viewport {
  width: number;
  height: number;
  zoom: number; // 1 = fit
  panX: number; // world units offset
  panY: number;
}

export const worldToScreen = (vp: Viewport, x: number, y: number) => {
  const s = (Math.min(vp.width, vp.height) / 220) * vp.zoom;
  return {
    sx: vp.width / 2 + (x + vp.panX) * s,
    sy: vp.height / 2 - (y + vp.panY) * s, // flip y so north = up
  };
};
export const screenToWorld = (vp: Viewport, sx: number, sy: number) => {
  const s = (Math.min(vp.width, vp.height) / 220) * vp.zoom;
  return {
    x: (sx - vp.width / 2) / s - vp.panX,
    y: -(sy - vp.height / 2) / s - vp.panY,
  };
};

// Find the nearest role to a world-space click (used for pin selection).
export function nearestRole(roles: MapRole[], x: number, y: number, maxDist = 4) {
  let best: MapRole | null = null;
  let bestD = maxDist * maxDist;
  for (const r of roles) {
    const dx = r.coord_x - x;
    const dy = r.coord_y - y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  return best;
}
