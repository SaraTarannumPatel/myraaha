const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dir = "f:\\Invincx Projects\\myraaha-dev\\docs\\17 SECTORS WITH THEIR 17000+ JOB ROLES";
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

console.log(`Found ${files.length} Excel files.\n`);

let totalRows = 0;
const allColumns = new Set();

for (const file of files) {
    try {
        const fullPath = path.join(dir, file);
        const workbook = XLSX.readFile(fullPath);
        console.log(`[${file}]`);
        
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            const rows = data.length;
            totalRows += rows;
            
            console.log(`  - Sheet '${sheetName}': ${rows} rows`);
            
            if (rows > 0) {
                const cols = Object.keys(data[0]);
                cols.forEach(c => allColumns.add(c));
                
                // Show sample data for the first file
                if (totalRows === rows) {
                    console.log(`    -> Sample Columns: ${cols.slice(0, 8).join(', ')}...`);
                    console.log(`    -> Sample Row 1:`, JSON.stringify(data[0], null, 2));
                }
            }
        }
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
}

console.log("\n" + "=".repeat(50));
console.log(`TOTAL ROWS SCANNED: ${totalRows}`);
console.log(`ALL UNIQUE COLUMNS:`, Array.from(allColumns).sort());
