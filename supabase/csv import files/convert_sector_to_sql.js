import fs from 'fs';

const csvPath = 'supabase/csv import files/sector_directory-export-2026-05-25_16-37-49.csv';
const sqlPath = 'supabase/csv import files/sector_directory_insert.sql';

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

const columnTypes = {
  id: 'string',
  name: 'string',
  description: 'string',
  industry_id: 'string',
  industry_name: 'string',
  icon_emoji: 'string',
  keywords: 'array',
  created_at: 'timestamp',
  demand_level: 'string',
  avg_salary_usd: 'string',
  growth_trajectory: 'string',
  soft_skills: 'array',
  interests: 'array',
  countries_in_demand: 'array',
  related_sectors: 'array',
  related_domains: 'array',
  related_careers: 'array',
  related_job_roles: 'array',
  related_skills: 'array',
  related_subjects: 'array',
  related_universities: 'array',
  related_courses: 'array',
  related_countries: 'array',
  related_industries: 'array'
};

const content = fs.readFileSync(csvPath, 'utf-8');
const rawLines = content.split(/\r?\n/).filter(line => line.trim());

const headers = splitCsvLine(rawLines[0], ';').map(h => h.trim().replace(/^\uFEFF/, '')); // strip BOM

// De-duplicate by name, keeping the richest row
const byName = new Map();

for (let i = 1; i < rawLines.length; i++) {
  const rowValues = splitCsvLine(rawLines[i], ';');
  const rowMap = {};
  headers.forEach((header, idx) => {
    rowMap[header] = rowValues[idx];
  });

  const name = (rowMap['name'] || '').trim();
  if (!name) continue;

  const score = Object.values(rowMap).filter(v => v && v.trim() && v.trim() !== '[]').length;
  if (!byName.has(name) || score > byName.get(name).score) {
    byName.set(name, { rowMap, score });
  }
}

const sqlStatements = [];
sqlStatements.push('-- Clean up existing records to avoid unique constraint violations on name or id\nDELETE FROM public.sector_directory;\n');

for (const [name, { rowMap }] of byName) {
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

  const sql = `INSERT INTO public.sector_directory (${colList})\nVALUES (${valList})\nON CONFLICT (id) DO UPDATE SET ${updateStr};\n`;
  sqlStatements.push(sql);
}

fs.writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf-8');
console.log(`Successfully generated SQL insert statements in ${sqlPath} (Total unique sectors: ${byName.size})`);
