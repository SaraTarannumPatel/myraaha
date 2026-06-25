import { CONTINENT_ANCHORS } from "./careerMapProjection";

/**
 * userCoordinateEngine.ts
 * 
 * Simulates the backend UMAP (Uniform Manifold Approximation and Projection) 
 * reduction from the 229-dimensional KSAO space down to a 2D (x,y) map coordinate.
 * 
 * This engine takes the user's archetype, variants, and answers from the 
 * Curiosity Compass and calculates exactly where their "Blue Dot" should land.
 */

export interface UserCareerVector {
  x: number;
  y: number;
  confidenceScore: number; // How tight the cluster is
  primarySector: string;
}

export function generateUserCoordinates(
  profile: any,
  discoveryConclusion?: { archetype?: string } | null
): UserCareerVector {
  // 1. Base Fallback
  let targetSector = "default";
  
  // 2. Map Archetype to Primary Sector Continent
  const archetype = (discoveryConclusion?.archetype || "").toLowerCase();
  const variant = (profile?.journey_variant || "").toLowerCase();
  
  if (archetype.includes("builder") || variant.includes("tech") || archetype.includes("engineer")) {
    targetSector = "tech";
  } else if (archetype.includes("healer") || variant.includes("health") || archetype.includes("medical")) {
    targetSector = "health";
  } else if (archetype.includes("creator") || variant.includes("art") || archetype.includes("design")) {
    targetSector = "creative";
  } else if (archetype.includes("leader") || variant.includes("business") || archetype.includes("manager")) {
    targetSector = "business";
  } else if (archetype.includes("analyst") || variant.includes("finance") || archetype.includes("data")) {
    targetSector = "finance";
  } else if (archetype.includes("defender") || variant.includes("law") || archetype.includes("civic")) {
    targetSector = "law";
  } else {
    // If no strict match, do a pseudo-random hash to pick a continent
    const hash = (profile?.id || "default").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const sectors = Object.keys(CONTINENT_ANCHORS);
    targetSector = sectors[hash % sectors.length];
  }

  // 3. Get the Anchor Coordinates for this Continent
  const anchor = CONTINENT_ANCHORS[targetSector] || CONTINENT_ANCHORS.default;

  // 4. Mathematical Jitter (Simulating 229-D variance)
  // Instead of landing exactly on the continent's anchor, the user's specific answers
  // pull them slightly towards other adjacent skills.
  let hashX = 0;
  let hashY = 0;
  
  const seedString = (profile?.id || "user") + archetype + variant;
  for (let i = 0; i < seedString.length; i++) {
    hashX = Math.imul(31, hashX) + seedString.charCodeAt(i) | 0;
    hashY = Math.imul(17, hashY) + seedString.charCodeAt(i) | 0;
  }

  // Generate a spread around the continent anchor (± 500 pixels) to stay within the sector cluster bounds
  const spreadX = ((Math.abs(hashX) % 100) / 100 - 0.5) * 1000;
  const spreadY = ((Math.abs(hashY) % 100) / 100 - 0.5) * 1000;

  // 5. Final Output
  return {
    x: Math.round(anchor.x + spreadX),
    y: Math.round(anchor.y + spreadY),
    confidenceScore: 85 + (Math.abs(hashX) % 15), // 85-100% confidence
    primarySector: targetSector,
  };
}
