const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const d3 = require('d3-hierarchy');

const SECTORS_DIR = path.join(__dirname, 'docs', '17 SECTORS WITH THEIR 17000+ JOB ROLES');
const OUTPUT_FILE = path.join(__dirname, 'src', 'data', 'career_map_data.json');

const CONTINENT_ANCHORS = {
  agri:         { x: 4000, y: 14000, radius: 2500, color: [76, 175, 80] },
  tech:         { x: 19200, y: 2400, radius: 2500, color: [33, 150, 243] },
  health:       { x: 22000, y: 10000, radius: 2500, color: [233, 30, 99] },
  finance:      { x: 15200, y: 4000, radius: 2500, color: [156, 39, 176] },
  law:          { x: 10000, y: 4000, radius: 2500, color: [121, 85, 72] },
  media:        { x: 7200, y: 2400, radius: 2500, color: [255, 152, 0] },
  education:    { x: 6000, y: 8000, radius: 2500, color: [0, 188, 212] },
  government:   { x: 10000, y: 12000, radius: 2500, color: [96, 125, 139] },
  sports:       { x: 4000, y: 4000, radius: 2500, color: [244, 67, 54] },
  ngo:          { x: 8000, y: 14000, radius: 2500, color: [139, 195, 74] },
  energy:       { x: 16800, y: 3200, radius: 2500, color: [255, 193, 7] },
  realestate:   { x: 22000, y: 4800, radius: 2500, color: [121, 85, 72] },
  manufacturing:{ x: 16000, y: 6400, radius: 2500, color: [96, 125, 139] },
  hospitality:  { x: 20800, y: 14400, radius: 2500, color: [0, 150, 136] },
  retail:       { x: 16000, y: 14000, radius: 2500, color: [233, 30, 99] },
  telecom:      { x: 15200, y: 10000, radius: 2500, color: [63, 81, 181] },
  transport:    { x: 12000, y: 14000, radius: 2500, color: [158, 158, 158] },
  default:      { x: 12000, y: 8000, radius: 2500, color: [100, 100, 100] },
};

function getCategoryForFile(filename) {
  const f = filename.toLowerCase();
  if (f.includes('agri')) return 'agri';
  if (f.includes('tech')) return 'tech';
  if (f.includes('health')) return 'health';
  if (f.includes('financial')) return 'finance';
  if (f.includes('legal')) return 'law';
  if (f.includes('media')) return 'media';
  if (f.includes('education')) return 'education';
  if (f.includes('govt')) return 'government';
  if (f.includes('sports')) return 'sports';
  if (f.includes('ngo')) return 'ngo';
  if (f.includes('energy')) return 'energy';
  if (f.includes('realestate')) return 'realestate';
  if (f.includes('manufacturing')) return 'manufacturing';
  if (f.includes('hospitality')) return 'hospitality';
  if (f.includes('retail')) return 'retail';
  if (f.includes('telecom')) return 'telecom';
  if (f.includes('transport')) return 'transport';
  return 'default';
}

function process() {
  console.log("Reading all Excel files...");
  const allFiles = fs.readdirSync(SECTORS_DIR).filter(f => f.endsWith('.xlsx'));

  // Group roles by Continent
  const continentsData = {};

  allFiles.forEach(file => {
    const cat = getCategoryForFile(file);
    if (!continentsData[cat]) {
      continentsData[cat] = { name: cat, children: {} };
    }

    const wb = XLSX.readFile(path.join(SECTORS_DIR, file));
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    data.forEach(row => {
      // Required structure fields
      const country = row['Sub-Sector Name'] || 'Unknown Country';
      const state = (row['Industry Family'] || '') + ' & ' + (row['Industry Name'] || 'Unknown State');
      const city = row['Domain Name'] || 'Unknown City';
      const neighborhood = row['Career Pathway Cluster'] || 'Unknown Neighborhood';
      const roleName = row['Role Name'];
      if (!roleName) return;

      // Build hierarchy
      const cData = continentsData[cat].children;
      
      if (!cData[country]) cData[country] = { name: country, children: {} };
      if (!cData[country].children[state]) cData[country].children[state] = { name: state, children: {} };
      if (!cData[country].children[state].children[city]) cData[country].children[state].children[city] = { name: city, children: {} };
      if (!cData[country].children[state].children[city].children[neighborhood]) cData[country].children[state].children[city].children[neighborhood] = { name: neighborhood, children: [] };
      
      cData[country].children[state].children[city].children[neighborhood].children.push({
        name: roleName,
        value: 1, // weight for packing
        data: row,
        category: cat
      });
    });
  });

  // Convert nested objects to arrays for d3-hierarchy
  function toArray(obj) {
    if (Array.isArray(obj)) return obj;
    if (typeof obj === 'object') {
      const arr = [];
      for (const key in obj) {
        if (key === 'name') continue;
        const child = obj[key];
        if (child.children) {
          child.children = toArray(child.children);
        }
        arr.push(child);
      }
      return arr;
    }
    return obj;
  }

  const scatterData = [];

  for (const [cat, continentObj] of Object.entries(continentsData)) {
    console.log(`Packing continent: ${cat}...`);
    const anchor = CONTINENT_ANCHORS[cat] || CONTINENT_ANCHORS.default;
    
    // Convert children object to array
    continentObj.children = toArray(continentObj.children);

    const root = d3.hierarchy(continentObj)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Apply circle packing
    // Pack within a square of 2*radius, centered at 0,0
    const pack = d3.pack()
      .size([anchor.radius * 2, anchor.radius * 2])
      .padding(3); // Padding between clusters

    pack(root);

    // After packing, nodes have x, y, r
    // Shift them to the actual anchor on the world map
    root.each(node => {
      // node.x, node.y are inside [0, 2*radius]. Shift to center.
      const shiftedX = anchor.x + (node.x - anchor.radius);
      const shiftedY = anchor.y + (node.y - anchor.radius);
      
      if (!node.children) {
        // It's a role leaf node!
        scatterData.push({
          id: 'role_' + scatterData.length,
          position: [shiftedX, shiftedY],
          color: [...anchor.color, 150],
          radius: Math.random() * 1.0 + 0.5,
          name: node.data.name,
          category: node.data.category,
          data: node.data.data
        });
      }
    });
  }

  console.log(`Writing ${scatterData.length} roles to JSON...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ scatter: scatterData }, null, 0));
  console.log("Successfully generated perfect D3 Circle Packed locations!");
}

process();
