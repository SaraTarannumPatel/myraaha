const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const file = 'Agri_Env_NaturalResources_Career_Intelligence.xlsx';
const filePath = path.join(__dirname, 'docs', '17 SECTORS WITH THEIR 17000+ JOB ROLES', file);

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('Columns:', Object.keys(data[0] || {}));
console.log('Sample Row:', data[0]);
