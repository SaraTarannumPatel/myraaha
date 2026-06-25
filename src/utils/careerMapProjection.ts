/**
 * careerMapProjection.ts
 * 
 * Coordinate projection utilities for CareerScape.
 * Maps raw UMAP data coordinates (x,y in the range ~[-6000, 25000])
 * into a normalised "world canvas" space (0..WORLD_W × 0..WORLD_H).
 * 
 * The world canvas is much larger than the visible viewport, which is
 * why the user can pan & zoom to explore different regions.
 */

// ─── World Canvas Size ────────────────────────────────────────────────────────
/** Logical pixel dimensions of the full career map world */
export const WORLD_W = 24000;
export const WORLD_H = 16000;

// ─── Coordinate Bounds (from UMAP output in career_map_data.json) ────────────
// These constants represent the empirical range of x,y in the generated JSON.
// Adjust if new data is added that exceeds these bounds.
export const DATA_X_MIN = -8000;
export const DATA_X_MAX = 26000;
export const DATA_Y_MIN = -6000;
export const DATA_Y_MAX = 6000;

/**
 * Projects a raw data coordinate pair into world-canvas pixel coordinates.
 * Adds a small inset padding so no node lands exactly on the edge.
 */
export function projectToWorld(
  dataX: number,
  dataY: number,
  padding = 120
): { x: number; y: number } {
  const rangeX = DATA_X_MAX - DATA_X_MIN;
  const rangeY = DATA_Y_MAX - DATA_Y_MIN;

  const x = padding + ((dataX - DATA_X_MIN) / rangeX) * (WORLD_W - 2 * padding);
  const y = padding + ((dataY - DATA_Y_MIN) / rangeY) * (WORLD_H - 2 * padding);

  return { x: Math.round(x), y: Math.round(y) };
}

// ─── Sector colour palette ────────────────────────────────────────────────────
/**
 * Returns a colour for a given category string.  The category field in the
 * JSON is set by the data generation script (e.g. "agri", "tech", "health").
 */
export const CATEGORY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  agri:       { bg: "#86efac", border: "#16a34a", label: "Agriculture"       },
  tech:       { bg: "#93c5fd", border: "#2563eb", label: "Technology"        },
  health:     { bg: "#6ee7b7", border: "#059669", label: "Healthcare"        },
  finance:    { bg: "#fde68a", border: "#d97706", label: "Finance"           },
  law:        { bg: "#bbf7d0", border: "#15803d", label: "Law"               },
  creative:   { bg: "#c4b5fd", border: "#7c3aed", label: "Creative"         },
  education:  { bg: "#fed7aa", border: "#ea580c", label: "Education"        },
  government: { bg: "#fca5a5", border: "#dc2626", label: "Government"       },
  business:   { bg: "#fde68a", border: "#ca8a04", label: "Business"         },
  media:      { bg: "#a5f3fc", border: "#0891b2", label: "Media / EdTech"   },
  sports:     { bg: "#fecdd3", border: "#e11d48", label: "Sports"           },
  ngo:        { bg: "#99f6e4", border: "#0d9488", label: "NGO / Social"     },
  energy:     { bg: "#fef08a", border: "#ca8a04", label: "Energy"           },
  realestate: { bg: "#fca5a5", border: "#b91c1c", label: "Real Estate"      },
  manufacturing:{ bg: "#cbd5e1", border: "#475569", label: "Manufacturing"  },
  hospitality:{ bg: "#fef9c3", border: "#a16207", label: "Hospitality"      },
  retail:     { bg: "#fbcfe8", border: "#be185d", label: "Retail"           },
  telecom:    { bg: "#c7d2fe", border: "#4338ca", label: "Telecom"          },
  default:    { bg: "#e2e8f0", border: "#64748b", label: "Other"            },
};

export function getCategoryColor(category: string) {
  const key = category?.toLowerCase() ?? "default";
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.default;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RawCareerPin {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  data: Record<string, string>;
}

export interface ProjectedCareerPin {
  id: string;
  name: string;
  category: string;
  /** World-space pixel position */
  worldX: number;
  worldY: number;
  /** Sector-level metadata from the JSON data field */
  sectorName: string;
  subSectorName: string;
  industryFamily: string;
  industryName: string;
  domainName: string;
  subDomainName: string;
  functionName: string;
  jobFamily: string;
  careerCluster: string;
  careerPathway: string;
}

// ─── Continent Anchors (Wild Terrain) ──────────────────────────────────────────
export const CONTINENT_ANCHORS: Record<string, { x: number, y: number }> = {
  agri:          { x: 8000,  y: 12800 },
  tech:          { x: 16000, y: 3200  },
  health:        { x: 8000,  y: 6400  },
  finance:       { x: 16000, y: 9600  },
  law:           { x: 12000, y: 9600  },
  creative:      { x: 8000,  y: 3200  },
  education:     { x: 4000,  y: 3200  },
  government:    { x: 8000,  y: 9600  },
  business:      { x: 20000, y: 9600  },
  media:         { x: 12000, y: 3200  },
  sports:        { x: 4000,  y: 6400  },
  ngo:           { x: 4000,  y: 9600  },
  energy:        { x: 16000, y: 12800 },
  realestate:    { x: 20000, y: 3200  },
  manufacturing: { x: 12000, y: 12800 },
  hospitality:   { x: 20000, y: 12800 },
  retail:        { x: 20000, y: 6400  },
  telecom:       { x: 16000, y: 6400  },
  transport:     { x: 12000, y: 6400  },
  default:       { x: 12000, y: 8000  },
};

/**
 * Converts a raw pin from the JSON into a fully projected pin ready to render.
 */
export function projectPin(raw: RawCareerPin): ProjectedCareerPin {
  // The JSON generator ALREADY perfectly positioned every single dot into the 24000x16000 bounds
  // (Continents, Countries, States, etc.). No need to scale or project.
  const finalX = raw.x;
  const finalY = raw.y;

  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    worldX: finalX,
    worldY: finalY,
    sectorName: raw.data?.["Sector Name"] ?? "",
    subSectorName: raw.data?.["Sub-Sector Name"] ?? "",
    industryFamily: raw.data?.["Industry Family"] ?? "",
    industryName: raw.data?.["Industry Name"] ?? "",
    domainName: raw.data?.["Domain Name"] ?? "",
    subDomainName: raw.data?.["Sub-Domain Name"] ?? "",
    functionName: raw.data?.["Function Name"] ?? "",
    jobFamily: raw.data?.["Job Family"] ?? "",
    careerCluster: raw.data?.["Career Cluster"] ?? "",
    careerPathway: raw.data?.["Career Pathway Cluster"] ?? "",
  };
}

/**
 * Computes the convex hull of a set of 2D points using the Monotone Chain algorithm.
 * Used for drawing dynamic borders around the 18 sectors based on KSAO data density.
 */
export function getConvexHull(points: {x: number, y: number}[]): {x: number, y: number}[] {
  if (points.length <= 3) return points;

  // Sort points lexicographically
  const sorted = [...points].sort((a, b) => a.x !== b.x ? a.x - b.x : a.y - b.y);

  const cross = (o: {x: number, y: number}, a: {x: number, y: number}, b: {x: number, y: number}) => {
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  };

  const lower: {x: number, y: number}[] = [];
  for (let i = 0; i < sorted.length; i++) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], sorted[i]) <= 0) {
      lower.pop();
    }
    lower.push(sorted[i]);
  }

  const upper: {x: number, y: number}[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], sorted[i]) <= 0) {
      upper.pop();
    }
    upper.push(sorted[i]);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
}
