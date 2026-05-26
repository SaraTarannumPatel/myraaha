import fs from 'fs';

const csvPath = 'supabase/csv import files/job_listings-export-2026-05-25_16-08-52.csv';
const sqlPath = 'supabase/csv import files/job_listings_insert.sql';

function splitCsvLine(line, delimiter = ';') {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function formatStr(val) {
  if (val === undefined || val === null || val.trim() === '' || val.trim().toUpperCase() === 'NULL') {
    return 'NULL';
  }
  const clean = val.replace(/'/g, "''");
  return `'${clean}'`;
}

function formatArray(valStr) {
  if (!valStr || valStr.trim() === '[]' || valStr.trim() === '' || valStr.trim().toUpperCase() === 'NULL') {
    return 'ARRAY[]::text[]';
  }
  let items = [];
  try {
    const parsed = JSON.parse(valStr);
    if (Array.isArray(parsed)) {
      items = parsed;
    } else {
      items = [parsed];
    }
  } catch (e) {
    let clean = valStr.trim();
    if (clean.startsWith('[') && clean.endsWith(']')) {
      clean = clean.slice(1, -1);
    }
    items = clean.split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(x => x);
  }

  const escaped = items
    .filter(item => item !== null && item !== undefined && String(item).trim() !== '')
    .map(item => {
      const itemStr = String(item).replace(/'/g, "''");
      return `'${itemStr}'`;
    });

  if (escaped.length === 0) {
    return 'ARRAY[]::text[]';
  }
  return `ARRAY[${escaped.join(', ')}]::text[]`;
}

function formatTimestamp(val) {
  if (!val || val.trim() === '') {
    return 'NOW()';
  }
  return formatStr(val);
}

function formatBool(val) {
  if (val === undefined || val === null || val.trim() === '' || val.trim().toUpperCase() === 'NULL') {
    return 'NULL';
  }
  const low = val.trim().toLowerCase();
  if (low === 'true' || low === 't' || low === '1' || low === 'yes') {
    return 'true';
  }
  return 'false';
}

function formatInt(val) {
  if (!val || val.trim() === '' || val.trim().toUpperCase() === 'NULL') {
    return 'NULL';
  }
  const n = parseInt(val.trim().replace(/,/g, ''), 10);
  return isNaN(n) ? 'NULL' : String(n);
}

function formatJson(valStr) {
  if (!valStr || valStr.trim() === '' || valStr.trim().toUpperCase() === 'NULL') {
    return 'NULL';
  }
  const clean = valStr.replace(/'/g, "''");
  return `'${clean}'::jsonb`;
}

const columnTypes = {
  id: 'string',
  source: 'string',
  source_url: 'string',
  title: 'string',
  company: 'string',
  location: 'string',
  remote_type: 'string',
  experience_level: 'string',
  employment_type: 'string',
  salary_min_inr: 'int',
  salary_max_inr: 'int',
  description: 'string',
  skills: 'array',
  industry: 'string',
  posted_at: 'timestamp',
  scraped_at: 'timestamp',
  is_active: 'bool',
  metadata: 'json',
  created_at: 'timestamp'
};

const content = fs.readFileSync(csvPath, 'utf-8');
const rawLines = content.split(/\r?\n/).filter(line => line.trim());

const headers = splitCsvLine(rawLines[0], ';').map(h => h.trim().replace(/^\uFEFF/, '')); // strip BOM

const sqlStatements = [];
sqlStatements.push('-- Idempotent upsert for job_listings\n');

for (let i = 1; i < rawLines.length; i++) {
  const rowValues = splitCsvLine(rawLines[i], ';');
  const rowMap = {};
  headers.forEach((header, idx) => {
    rowMap[header] = rowValues[idx];
  });

  const columns = [];
  const values = [];

  Object.entries(columnTypes).forEach(([col, type]) => {
    if (rowMap[col] !== undefined) {
      columns.push(col);
      const rawVal = rowMap[col];
      if (type === 'array') {
        values.push(formatArray(rawVal));
      } else if (type === 'timestamp') {
        values.push(formatTimestamp(rawVal));
      } else if (type === 'bool') {
        values.push(formatBool(rawVal));
      } else if (type === 'int') {
        values.push(formatInt(rawVal));
      } else if (type === 'json') {
        values.push(formatJson(rawVal));
      } else {
        values.push(formatStr(rawVal));
      }
    }
  });

  const colList = columns.join(', ');
  const valList = values.join(', ');

  const updateClauses = columns
    .filter(col => col !== 'id')
    .map(col => `${col} = EXCLUDED.${col}`);
  const updateStr = updateClauses.join(', ');

  const sql = `INSERT INTO public.job_listings (${colList})\nVALUES (${valList})\nON CONFLICT (id) DO UPDATE SET ${updateStr};\n`;
  sqlStatements.push(sql);
}

fs.writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf-8');
console.log(`Successfully generated SQL insert statements in ${sqlPath}`);
