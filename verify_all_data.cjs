const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const SECTORS_DIR = path.join(__dirname, 'docs', '17 SECTORS WITH THEIR 17000+ JOB ROLES');
const allFiles = fs.readdirSync(SECTORS_DIR).filter(f => f.endsWith('.xlsx'));

let totalRows = 0;

allFiles.forEach(file => {
  const wb = XLSX.readFile(path.join(SECTORS_DIR, file));
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  const validRoles = data.filter(row => !!row['Role Name']);
  totalRows += validRoles.length;
});

console.log(`Total Valid Roles across all 17 Excel sheets: ${totalRows}`);

const mapDataPath = path.join(__dirname, 'src', 'data', 'career_map_data.json');
const mapData = JSON.parse(fs.readFileSync(mapDataPath, 'utf8'));
console.log(`Total Roles successfully injected into the map dataset: ${mapData.scatter.length}`);
