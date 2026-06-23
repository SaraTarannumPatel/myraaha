const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SECTORS_DIR = path.join(__dirname, 'docs', '17 SECTORS WITH THEIR 17000+ JOB ROLES');
const OUTPUT_FILE = path.join(__dirname, 'src', 'data', 'career_map_data.json');

(async () => {
  const d3 = await import('d3');
  const allFiles = fs.readdirSync(SECTORS_DIR).filter(f => f.endsWith('.xlsx') && f.includes('Career_Intelligence'));

  const getSectorColor = (index) => {
    const hues = [220, 130, 45, 280, 0, 180, 320, 60, 15, 200, 300, 90, 250, 35, 160, 340, 110];
    const hue = hues[index % hues.length];
    const h = hue / 360;
    const r = Math.round(255 * (0.5 + 0.5 * Math.cos(2 * Math.PI * (h + 0/3))));
    const g = Math.round(255 * (0.5 + 0.5 * Math.cos(2 * Math.PI * (h - 1/3))));
    const b = Math.round(255 * (0.5 + 0.5 * Math.cos(2 * Math.PI * (h - 2/3))));
    return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
  };

  const CONTINENT_ANCHORS = {
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

  const targetFiles = allFiles.map((file, i) => {
    let cat = "default";
    if (file.toLowerCase().includes('agri')) cat = 'agri';
    else if (file.toLowerCase().includes('tech')) cat = 'tech';
    else if (file.toLowerCase().includes('health')) cat = 'health';
    else if (file.toLowerCase().includes('financial')) cat = 'finance';
    else if (file.toLowerCase().includes('legal')) cat = 'law';
    else if (file.toLowerCase().includes('media')) cat = 'media';
    else if (file.toLowerCase().includes('education')) cat = 'education';
    else if (file.toLowerCase().includes('govt')) cat = 'government';
    else if (file.toLowerCase().includes('sports')) cat = 'sports';
    else if (file.toLowerCase().includes('ngo')) cat = 'ngo';
    else if (file.toLowerCase().includes('energy')) cat = 'energy';
    else if (file.toLowerCase().includes('realestate')) cat = 'realestate';
    else if (file.toLowerCase().includes('manufacturing')) cat = 'manufacturing';
    else if (file.toLowerCase().includes('hospitality')) cat = 'hospitality';
    else if (file.toLowerCase().includes('retail')) cat = 'retail';
    else if (file.toLowerCase().includes('telecom')) cat = 'telecom';
    else if (file.toLowerCase().includes('transport')) cat = 'transport';

    return {
      file: file,
      category: cat,
      color: getSectorColor(i),
      center: CONTINENT_ANCHORS[cat] || CONTINENT_ANCHORS.default
    };
  });

// Deterministic hash to ensure stable geography
function hashString(str) {
  let hash = 0;
  if (!str) return hash;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash;
}

function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function getConvexHull(points) {
  if (points.length <= 3) return points;
  const sorted = [...points].sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
  const lower = [];
  for (let p of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
      lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
      let p = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
      upper.push(p);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

function randOffset(str, magnitude) {
  const hash = hashString(str);
  const hash2 = hashString(str + "_salt_1");
  const hash3 = hashString(str + "_salt_2");
  
  let x1 = Math.sin(hash) * 10000;
  let y1 = Math.cos(hash) * 10000;
  let x2 = Math.sin(hash2) * 10000;
  let y2 = Math.cos(hash2) * 10000;
  let x3 = Math.sin(hash3) * 10000;
  let y3 = Math.cos(hash3) * 10000;
  
  const valX = (x1 - Math.floor(x1) - 0.5) * 0.55 + 
               (x2 - Math.floor(x2) - 0.5) * 0.35 + 
               (x3 - Math.floor(x3) - 0.5) * 0.1;
               
  const valY = (y1 - Math.floor(y1) - 0.5) * 0.55 + 
               (y2 - Math.floor(y2) - 0.5) * 0.35 + 
               (y3 - Math.floor(y3) - 0.5) * 0.1;
  
  return {
    x: valX * magnitude * 2.2,
    y: valY * magnitude * 2.2
  };
}

// Seedable random number generator
function seedRandom(seedStr) {
  let h = hashString(seedStr);
  return function() {
    let t = h += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// Ray-casting Point-in-Polygon
function isPointInPolygon(point, polygon) {
  const x = point.x, y = point.y;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Get deterministic random point inside a polygon
function getRandomPointInPolygon(polygon, seedStr) {
  if (polygon.length === 0) return { x: 0, y: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of polygon) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  if (maxX - minX < 1e-3 || maxY - minY < 1e-3) {
    return polygon[0];
  }
  const nextRand = seedRandom(seedStr);
  const centroid = getCentroid(polygon);
  for (let trial = 0; trial < 100; trial++) {
    const rx = minX + nextRand() * (maxX - minX);
    const ry = minY + nextRand() * (maxY - minY);
    const pt = { x: rx, y: ry };
    if (isPointInPolygon(pt, polygon)) {
      return {
        x: pt.x * 0.8 + centroid.x * 0.2,
        y: pt.y * 0.8 + centroid.y * 0.2
      };
    }
  }
  return centroid;
}

// Nearest-neighbor route sorting to build realistic road pathways
function sortPointsNearestNeighbor(pts) {
  if (pts.length <= 2) return pts;
  const unvisited = [...pts];
  const sorted = [];
  
  let current = unvisited.sort((a, b) => a[0] - b[0])[0];
  sorted.push(current);
  unvisited.splice(unvisited.indexOf(current), 1);
  
  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const dx = unvisited[i][0] - current[0];
      const dy = unvisited[i][1] - current[1];
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }
    current = unvisited[nearestIdx];
    sorted.push(current);
    unvisited.splice(nearestIdx, 1);
  }
  return sorted;
}

let scatterData = [];
let pinData = [];
let pinIdCounter = 0;
const roads = [];
const streetPoints = {};
const hulls = [];

// Helper to find color of sector
function getSectorColorByName(category) {
  const target = targetFiles.find(t => t.category === category);
  return target ? target.color : [128, 128, 128];
}

// Sutherland-Hodgman polygon clipping
function clipPolygon(subjectPolygon, clipPolygon) {
  let outputList = subjectPolygon;
  for (let j = 0; j < clipPolygon.length; j++) {
    const edgeStart = clipPolygon[j];
    const edgeEnd = clipPolygon[(j + 1) % clipPolygon.length];
    const inputList = outputList;
    outputList = [];
    if (inputList.length === 0) break;
    
    let S = inputList[inputList.length - 1];
    for (let i = 0; i < inputList.length; i++) {
      const E = inputList[i];
      if (isInside(E, edgeStart, edgeEnd)) {
        if (!isInside(S, edgeStart, edgeEnd)) {
          outputList.push(intersection(S, E, edgeStart, edgeEnd));
        }
        outputList.push(E);
      } else if (isInside(S, edgeStart, edgeEnd)) {
        outputList.push(intersection(S, E, edgeStart, edgeEnd));
      }
      S = E;
    }
  }
  return outputList;
}

function isInside(p, a, b) {
  return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) >= -1e-6;
}

function intersection(cp1, cp2, s, e) {
  const dc = { x: cp1.x - cp2.x, y: cp1.y - cp2.y };
  const dp = { x: s.x - e.x, y: s.y - e.y };
  const denom = dc.x * dp.y - dc.y * dp.x;
  if (Math.abs(denom) < 1e-9) {
    return { x: cp1.x, y: cp1.y };
  }
  const n1 = cp1.x * cp2.y - cp1.y * cp2.x;
  const n2 = s.x * e.y - s.y * e.x;
  const n3 = 1.0 / denom;
  return {
    x: (n1 * dp.x - dc.x * n2) * n3,
    y: (n1 * dp.y - dc.y * n2) * n3
  };
}

function getCentroid(poly) {
  if (poly.length === 0) return { x: 0, y: 0 };
  let signedArea = 0;
  let cx = 0;
  let cy = 0;
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const x0 = poly[i].x;
    const y0 = poly[i].y;
    const x1 = poly[(i + 1) % n].x;
    const y1 = poly[(i + 1) % n].y;
    const a = x0 * y1 - x1 * y0;
    signedArea += a;
    cx += (x0 + x1) * a;
    cy += (y0 + y1) * a;
  }
  signedArea *= 0.5;
  if (Math.abs(signedArea) < 0.1) {
    cx = 0; cy = 0;
    for (const p of poly) { cx += p.x; cy += p.y; }
    return { x: cx / n, y: cy / n };
  } else {
    return { x: cx / (6 * signedArea), y: cy / (6 * signedArea) };
  }
}

function polyFromD3(poly) {
  return poly.map(p => ({ x: p[0], y: p[1] }));
}

// Partition parent polygon among children using Voronoi
function partitionPolygon(parentPoly, childCenters, childNames, level) {
  if (childCenters.length === 0) return {};
  if (childCenters.length === 1) {
    return { [childNames[0]]: parentPoly };
  }

  // Get bounding box of parent
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  parentPoly.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  minX -= 50; minY -= 50; maxX += 50; maxY += 50;

  const points = childCenters.map(c => [c.x, c.y]);
  const delaunay = d3.Delaunay.from(points);
  const voronoi = delaunay.voronoi([minX, minY, maxX, maxY]);

  const partitions = {};
  childNames.forEach((name, idx) => {
    const cell = voronoi.cellPolygon(idx);
    if (cell) {
      const cellPoly = polyFromD3(cell);
      const clipped = clipPolygon(cellPoly, parentPoly);
      partitions[name] = clipped;
    } else {
      partitions[name] = [];
    }
  });

  return partitions;
}

function getDisplacement(x, y, amp) {
  const angle1 = (Math.sin(x * 0.002 + y * 0.001) + Math.cos(x * 0.0015 - y * 0.002)) * Math.PI;
  const angle2 = (Math.sin(x * 0.008 - y * 0.005) + Math.cos(x * 0.005 + y * 0.007)) * Math.PI;
  const noiseVal = Math.sin(x * 0.02 + y * 0.01) * 0.5 + Math.sin(x * 0.05 - y * 0.03) * 0.5;
  
  const angle = angle1 * 0.7 + angle2 * 0.2 + noiseVal * 0.1;
  const mag = amp * (0.8 + 0.4 * Math.sin(x * 0.015 + y * 0.015));
  
  return {
    x: Math.cos(angle) * mag,
    y: Math.sin(angle) * mag
  };
}

function subdivideAndDisplaceEdge(p1, p2, amp, level) {
  const swap = p1.x > p2.x || (Math.abs(p1.x - p2.x) < 1e-9 && p1.y > p2.y);
  const start = swap ? p2 : p1;
  const end = swap ? p1 : p2;
  
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  let maxSegLen = 40;
  if (level === 'continent') maxSegLen = 120;
  else if (level === 'country') maxSegLen = 80;
  else if (level === 'state') maxSegLen = 50;
  else if (level === 'county') maxSegLen = 35;
  else if (level === 'city') maxSegLen = 25;
  else if (level === 'borough') maxSegLen = 18;
  else if (level === 'neighborhood') maxSegLen = 12;
  else if (level === 'campus') maxSegLen = 8;
  else if (level === 'building') maxSegLen = 5;

  let steps = Math.max(2, Math.floor(dist / maxSegLen));
  const points = [];
  
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const px = start.x + dx * t;
    const py = start.y + dy * t;
    
    const disp = getDisplacement(px, py, amp);
    points.push({
      x: px + disp.x,
      y: py + disp.y
    });
  }
  
  if (swap) {
    points.reverse();
  }
  return points;
}

// Generate organic coastlines
function makeOrganicPolygon(hull, level) {
  if (hull.length === 0) return [];
  if (hull.length < 3) return hull;
  
  let amp = 30;
  switch(level) {
    case 'continent':
      amp = 140;
      break;
    case 'country':
      amp = 90;
      break;
    case 'state':
      amp = 55;
      break;
    case 'county':
      amp = 35;
      break;
    case 'city':
      amp = 22;
      break;
    case 'borough':
      amp = 14;
      break;
    case 'neighborhood':
      amp = 8;
      break;
    case 'campus':
      amp = 4;
      break;
    case 'building':
      amp = 2;
      break;
  }

  const organicPoints = [];
  const n = hull.length;
  
  for (let i = 0; i < n; i++) {
    const p1 = hull[i];
    const p2 = hull[(i + 1) % n];
    const edgePoints = subdivideAndDisplaceEdge(p1, p2, amp, level);
    organicPoints.push(...edgePoints);
  }
  
  const WORLD_W = 24000;
  const WORLD_H = 16000;
  const margin = 50;
  
  return organicPoints.map(p => ({
    x: Math.max(margin, Math.min(WORLD_W - margin, p.x)),
    y: Math.max(margin, Math.min(WORLD_H - margin, p.y))
  }));
}

// Tree partitioning helper
function partitionTree(node, poly, levelIndex, category) {
  node.polygon = poly;
  node.center = getCentroid(poly);
  
  const levels = ['continent', 'country', 'state', 'county', 'city', 'borough', 'neighborhood', 'campus', 'building'];
  const level = levels[levelIndex];
  
  if (node.children && node.children.length > 0 && levelIndex < levels.length - 1) {
    const centroid = node.center;
    
    // Assign centers to children inside node.polygon
    const childCenters = [];
    node.children.forEach((child, i) => {
      const seed = Math.abs(hashString(`${child.name}_${level}_center_${i}`));
      const vertexIdx = seed % poly.length;
      const vertex = poly[vertexIdx];
      
      const t = 0.15 + 0.65 * ((seed % 100) / 100);
      const cx = centroid.x + (vertex.x - centroid.x) * t;
      const cy = centroid.y + (vertex.y - centroid.y) * t;
      
      childCenters.push({ x: cx, y: cy });
    });
    
    // Partition parent polygon among children using Voronoi
    const childNames = node.children.map(c => c.name);
    const partitions = partitionPolygon(poly, childCenters, childNames, level);
    
    // Recursively partition each child
    node.children.forEach((child, i) => {
      const childPoly = partitions[child.name] || [];
      if (childPoly.length >= 3) {
        partitionTree(child, childPoly, levelIndex + 1, category);
      } else {
        const fallbackPoly = [];
        const cc = childCenters[i];
        const r = 30;
        for (let j = 0; j < 8; j++) {
          const a = j / 8 * Math.PI * 2;
          fallbackPoly.push({ x: cc.x + Math.cos(a) * r, y: cc.y + Math.sin(a) * r });
        }
        partitionTree(child, fallbackPoly, levelIndex + 1, category);
      }
    });
  } else {
    // Leaf node (building level) - distribute roles inside building polygon!
    if (node.roles) {
      node.roles.forEach((role, i) => {
        const pt = getRandomPointInPolygon(poly, `${role.roleName}_role_pos_${i}`);
        role.x = pt.x;
        role.y = pt.y;
        
        const jfKey = `${category}::${role.row['Job Family'] || 'General Family'}`;
        if (!streetPoints[jfKey]) streetPoints[jfKey] = [];
        streetPoints[jfKey].push([role.x, role.y]);
      });
    }
    
    if (node.children) {
      node.children.forEach(child => {
        child.polygon = poly;
        child.center = node.center;
        if (child.roles) {
          child.roles.forEach((role, i) => {
            const pt = getRandomPointInPolygon(poly, `${role.roleName}_role_pos_child_${i}`);
            role.x = pt.x;
            role.y = pt.y;
            
            const jfKey = `${category}::${role.row['Job Family'] || 'General Family'}`;
            if (!streetPoints[jfKey]) streetPoints[jfKey] = [];
            streetPoints[jfKey].push([role.x, role.y]);
          });
        }
        partitionTree(child, poly, levelIndex + 1, category);
      });
    }
  }
}

const sectors = {};

console.log('Generating Huge Organic Career Geography Data...');

targetFiles.forEach(target => {
  const filePath = path.join(SECTORS_DIR, target.file);
  const sheet = XLSX.readFile(filePath).Sheets[XLSX.readFile(filePath).SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  const root = { name: target.category, children: [], roles: [] };
  sectors[target.category] = root;
  
  data.forEach((row, rowIndex) => {
    const roleName = row['Role Name'];
    if (!roleName) return;

    const subSector = row['Sub-Sector Name'] || "General SubSector";
    const indFam = row['Industry Family'] || "General Family";
    const indName = row['Industry Name'] || "General Industry";
    const domain = row['Domain Name'] || "General Domain";
    const subDomain = row['Sub-Domain Name'] || "General SubDomain";
    const funcName = row['Function Name'] || "General Function";

    let countryNode = root.children.find(c => c.name === subSector);
    if (!countryNode) {
      countryNode = { name: subSector, children: [] };
      root.children.push(countryNode);
    }

    let stateNode = countryNode.children.find(c => c.name === indFam);
    if (!stateNode) {
      stateNode = { name: indFam, children: [] };
      countryNode.children.push(stateNode);
    }

    let countyNode = stateNode.children.find(c => c.name === indName);
    if (!countyNode) {
      countyNode = { name: indName, children: [] };
      stateNode.children.push(countyNode);
    }

    let cityNode = countyNode.children.find(c => c.name === domain);
    if (!cityNode) {
      cityNode = { name: domain, children: [] };
      countyNode.children.push(cityNode);
    }

    let boroughNode = cityNode.children.find(c => c.name === subDomain);
    if (!boroughNode) {
      boroughNode = { name: subDomain, children: [] };
      cityNode.children.push(boroughNode);
    }

    let neighborhoodNode = boroughNode.children.find(c => c.name === funcName);
    if (!neighborhoodNode) {
      neighborhoodNode = { name: funcName, children: [] };
      boroughNode.children.push(neighborhoodNode);
    }

    const careerCluster = row['Career Cluster'] || "General Cluster";
    let campusNode = neighborhoodNode.children.find(c => c.name === careerCluster);
    if (!campusNode) {
      campusNode = { name: careerCluster, children: [] };
      neighborhoodNode.children.push(campusNode);
    }

    const pathwayCluster = row['Career Pathway Cluster'] || "General Pathway";
    let buildingNode = campusNode.children.find(c => c.name === pathwayCluster);
    if (!buildingNode) {
      buildingNode = { name: pathwayCluster, children: [], roles: [] };
      campusNode.children.push(buildingNode);
    }

    buildingNode.roles.push({
      roleName,
      row,
      rowIndex
    });
  });
});

  const WORLD_W = 24000;
  const WORLD_H = 16000;
  const margin = 50;
  const worldPoly = [
    { x: margin, y: margin },
    { x: WORLD_W - margin, y: margin },
    { x: WORLD_W - margin, y: WORLD_H - margin },
    { x: margin, y: WORLD_H - margin }
  ];

  const continentCenters = [];
  const continentNames = [];
  targetFiles.forEach(target => {
    if (sectors[target.category] && sectors[target.category].children.length > 0) {
      continentCenters.push(target.center);
      continentNames.push(target.category);
    }
  });

  const continentPartitions = partitionPolygon(worldPoly, continentCenters, continentNames, 'continent');

  targetFiles.forEach(target => {
    const root = sectors[target.category];
    if (!root || root.children.length === 0) return;
    
    const continentPoly = continentPartitions[target.category] || [];
    if (continentPoly.length >= 3) {
      partitionTree(root, continentPoly, 0, target.category);
    } else {
      const cc = target.center;
      const fallbackPoly = [];
      const radius = 1000;
      for (let j = 0; j < 16; j++) {
        const angle = j / 16 * Math.PI * 2;
        fallbackPoly.push({ x: cc.x + Math.cos(angle) * radius, y: cc.y + Math.sin(angle) * radius });
      }
      partitionTree(root, fallbackPoly, 0, target.category);
    }
  });

// Collect hulls recursively
function collectHulls(node, levelIndex, pathPrefix) {
  const levels = ['continent', 'country', 'state', 'county', 'city', 'borough', 'neighborhood', 'campus', 'building'];
  const level = levels[levelIndex];
  
  if (node.polygon && node.polygon.length >= 3) {
    const organicPoly = makeOrganicPolygon(node.polygon, level);
    const finalCenter = getCentroid(organicPoly);
    
    hulls.push({
      level: level,
      name: node.name,
      category: pathPrefix[0] || node.name,
      center: finalCenter,
      polygon: organicPoly.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    });
  }
  
  if (node.children) {
    node.children.forEach(child => {
      collectHulls(child, levelIndex + 1, [...pathPrefix, node.name]);
    });
  }
}

// Collect roles recursively
function collectRoles(node, category) {
  if (node.roles) {
    node.roles.forEach(role => {
      const clampedX = Math.max(50, Math.min(23950, role.x));
      const clampedY = Math.max(50, Math.min(15950, role.y));
      
      if (pinData.length < 500) {
        pinData.push({
          id: 'pin_' + (pinIdCounter++),
          name: role.roleName,
          category: category,
          x: clampedX,
          y: clampedY,
          data: role.row
        });
      }
      
      scatterData.push({
        id: 'role_' + scatterData.length,
        position: [clampedX, clampedY],
        color: [...getSectorColorByName(category), 150],
        radius: Math.random() * 1.5 + 1,
        name: role.roleName,
        category: category,
        data: role.row
      });
    });
  }
  if (node.children) {
    node.children.forEach(child => collectRoles(child, category));
  }
}

// Process hulls and roles for all sectors
Object.keys(sectors).forEach(category => {
  const root = sectors[category];
  collectHulls(root, 0, []);
  collectRoles(root, category);
});

// Build roads
Object.keys(streetPoints).forEach(key => {
  const pts = streetPoints[key];
  if (pts.length < 2) return;
  const parts = key.split('::');
  const category = parts[0];
  const name = parts[1];

  // Sort road coordinates using a nearest-neighbor TSP approximation for natural street paths
  const sortedPts = sortPointsNearestNeighbor(pts);
  const pathStr = sortedPts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  roads.push({
    name: name,
    category: category,
    path: pathStr
  });
});

const userLocation = { x: 3000, y: 2000, closestPinId: null };

const outputData = {
  pins: pinData,
  scatter: scatterData,
  roads: roads,
  hulls: hulls,
  userLocation: userLocation
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData));
console.log('Saved true fractal geography to JSON!');

})();
