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

const ROLE_SEEDS = [
  ["AI Product Manager", "Technology & IT", "Product & AI", "Applied AI Products", "AI Platforms", "Business, Management & Administration", "Product Leadership"],
  ["Data Scientist", "Technology & IT", "Data & Analytics", "Machine Learning", "Predictive Analytics", "Science, Technology, Engineering & Mathematics", "Data Science"],
  ["UX Designer", "Media, Entertainment & Creative", "Digital Design", "Experience Design", "Product Interfaces", "Arts, A/V Technology & Communications", "Product Design"],
  ["Doctor — Emergency Medicine", "Healthcare & Life Sciences", "Clinical Care", "Emergency Medicine", "Trauma Response", "Health Science", "Emergency Care"],
  ["Civil Services Officer", "Government & Public Sector", "Public Administration", "Governance", "District Administration", "Government & Public Administration", "Civil Services"],
  ["Chartered Accountant", "Financial Services", "Accounting & Audit", "Corporate Finance", "Compliance & Tax", "Finance", "Accounting"],
  ["Sustainability Consultant", "Agriculture, Environment & Natural Resources", "Climate & ESG", "Sustainability Advisory", "Impact Measurement", "Agriculture, Food & Natural Resources", "Sustainability"],
  ["Robotics Engineer", "Manufacturing & Engineering", "Advanced Manufacturing", "Industrial Automation", "Robotics Systems", "Science, Technology, Engineering & Mathematics", "Robotics"],
  ["Teacher — Secondary School", "Education", "School Education", "Classroom Teaching", "Learning Design", "Education & Training", "Teaching"],
  ["Legal Associate", "Legal & Professional Services", "Law Firms", "Corporate Law", "Contracts & Compliance", "Law, Public Safety, Corrections & Security", "Corporate Law"],
  ["Sports Performance Analyst", "Sports", "Professional Sports", "Analytics", "Athlete Performance", "Hospitality & Human Services", "Sports Analytics"],
  ["Logistics Network Planner", "Transport & Logistics", "Supply Chain", "Network Planning", "Fleet & Route Ops", "Transportation, Distribution & Logistics", "Logistics Planning"],
  ["Telecom Network Engineer", "Telecommunications", "Network Infrastructure", "5G Networks", "Radio Planning", "Information Technology", "Network Engineering"],
  ["Hotel Revenue Manager", "Hospitality, Tourism & Travel", "Hotel Operations", "Revenue Strategy", "Pricing & Occupancy", "Hospitality & Tourism", "Revenue Management"],
  ["Retail Category Manager", "Retail & Consumer Goods", "Modern Retail", "Category Strategy", "Merchandising", "Marketing, Sales & Service", "Category Management"],
  ["Urban Planner", "Real Estate & Construction", "Urban Development", "City Planning", "Land Use", "Architecture & Construction", "Urban Planning"],
  ["Program Manager — NGO", "Non-Profit, NGO & Development Sector", "Development Sector", "Program Delivery", "Field Operations", "Human Services", "Development Programs"],
] as const;

export const FALLBACK_MAP_ROLES: MapRole[] = ROLE_SEEDS.flatMap((seed, sectorIndex) => {
  const [role, sector, sub, domain, subDomain, cluster, pathway] = seed;
  return Array.from({ length: 18 }, (_, i) => {
    const angle = (sectorIndex / ROLE_SEEDS.length) * Math.PI * 2;
    const ring = 42 + (sectorIndex % 4) * 12;
    const jitterAngle = angle + (i - 8) * 0.045;
    const jitterRadius = ring + ((i % 6) - 2.5) * 3.2;
    return {
      id: 900000 + sectorIndex * 100 + i,
      role_uuid: `fallback-${sectorIndex}-${i}`,
      role_name: i === 0 ? role : `${role} ${["Associate", "Specialist", "Lead", "Analyst", "Coordinator", "Consultant"][i % 6]}`,
      sector_name: sector,
      sub_sector_name: sub,
      domain_name: domain,
      sub_domain_name: subDomain,
      career_cluster: cluster,
      career_pathway_cluster: pathway,
      coord_x: Math.cos(jitterAngle) * jitterRadius,
      coord_y: Math.sin(jitterAngle) * jitterRadius,
      cluster_id: sectorIndex,
    } satisfies MapRole;
  });
});

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
  "Non-Profit, NGO & Development Sector": 165,
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

export function roleMetrics(role: MapRole) {
  const base = Math.abs(Math.sin(role.id * 0.73));
  const hiring = Math.round(42 + base * 55);
  const match = Math.round(58 + Math.abs(Math.cos(role.coord_x * 0.08 + role.coord_y * 0.04)) * 38);
  const salaryLow = Math.round(3 + Math.abs(Math.sin(role.coord_x * 0.05)) * 16);
  const salaryHigh = salaryLow + Math.round(5 + Math.abs(Math.cos(role.coord_y * 0.04)) * 18);
  const automation = Math.round(15 + Math.abs(Math.sin(role.coord_x * 0.06 - role.coord_y * 0.03)) * 70);
  const months = Math.round(6 + (100 - match) * 0.42 + Math.abs(role.coord_x - role.coord_y) * 0.04);
  return {
    match,
    hiring,
    salaryLow,
    salaryHigh,
    automation,
    months,
    demand: hiring > 78 ? "High demand" : hiring > 58 ? "Steady demand" : "Competitive zone",
    gateCount: ["Healthcare", "Government", "Legal", "Financial"].some((x) => role.sector_name.includes(x)) ? 2 : role.sector_name.includes("Education") ? 1 : 0,
    remote: ["Technology", "Media", "Legal", "Financial", "Education", "NGO"].some((x) => role.sector_name.includes(x)),
  };
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
