const XLSX = require('xlsx');
const path = require('path');

const filepath = path.join(__dirname, 'docs', '17 SECTORS WITH THEIR 17000+ JOB ROLES', 'Energy_Utilities_Career_Intelligence_India.xlsx');
const wb = XLSX.readFile(filepath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

const cols = [
  'Sector Name', 'Sub-Sector Name', 'Industry Family', 'Industry Name', 
  'Domain Name', 'Sub-Domain Name', 'Function Name', 'Job Family', 
  'Career Cluster', 'Career Pathway Cluster', 'Role Name'
];

const uniqueCounts = {};
cols.forEach(c => uniqueCounts[c] = new Set());

let roleCount = 0;

data.forEach(row => {
  roleCount++;
  cols.forEach(c => {
    if (row[c]) uniqueCounts[c].add(row[c]);
  });
});

cols.forEach(c => {
  console.log(`${c}: ${uniqueCounts[c].size} unique items`);
});

console.log(`Total Roles (Rows): ${roleCount}`);
console.log('--- COUNTRIES (SUB-SECTORS) ---');
console.log(Array.from(uniqueCounts['Sub-Sector Name']).join('\n'));
console.log('----------------------------------');
