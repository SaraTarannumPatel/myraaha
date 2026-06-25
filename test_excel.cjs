const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, 'docs', '17 SECTORS WITH THEIR 17000+ JOB ROLES');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

files.forEach(f => {
  const fp = path.join(dir, f);
  const wb = XLSX.readFile(fp);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
  console.log('File:', f);
  console.log('Headers:', data[0]);
  if (data.length > 1) {
    console.log('First row:', data[1]);
  }
  console.log('Total rows:', data.length);
  console.log('---');
});
