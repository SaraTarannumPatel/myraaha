const fs = require('fs');
const xlsx = require('xlsx');

// 1. Read JSON
const mapData = JSON.parse(fs.readFileSync('./src/data/career_map_data.json', 'utf8'));

// 2. Read Excel
const excelPath = './docs/17 SECTORS WITH THEIR 17000+ JOB ROLES/Agri_Env_NaturalResources_Career_Intelligence.xlsx';
const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const excelData = xlsx.utils.sheet_to_json(worksheet);

// 3. Count Sector in JSON
const sectorNameFromExcel = excelData.length > 0 ? excelData[0]['Sector Name'] : 'Unknown';
console.log(`Expected Sector Name from Excel: "${sectorNameFromExcel}"`);

let jsonCount = 0;
let jsonMatchedNames = new Set();
for (const pin of mapData.pins) {
    if (pin.data && pin.data['Sector Name'] === sectorNameFromExcel) {
        jsonCount++;
        jsonMatchedNames.add(pin.name || pin.data['Role Name']);
    }
}

// 4. Validate Role by Role
let missingFromJSON = [];
let matched = 0;
for (const row of excelData) {
    const roleName = row['Role Name'];
    if (roleName) {
        if (jsonMatchedNames.has(roleName)) {
            matched++;
        } else {
            missingFromJSON.push(roleName);
        }
    }
}

console.log(`Excel File Rows (Roles): ${excelData.length}`);
console.log(`JSON Pins in this Sector: ${jsonCount}`);
console.log(`Roles Matched by Name: ${matched}`);
if (missingFromJSON.length > 0) {
    console.log(`Missing Roles in JSON (First 10): ${missingFromJSON.slice(0, 10).join(', ')}`);
    console.log(`Total missing: ${missingFromJSON.length}`);
} else {
    console.log(`All Excel roles for this sector are mapped into the JSON successfully!`);
}
