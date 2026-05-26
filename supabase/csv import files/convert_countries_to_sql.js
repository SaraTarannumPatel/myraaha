import fs from 'fs';

const csvPath = 'supabase/csv import files/countries_directory-export-2026-05-25_13-42-32.csv';
const sqlPath = 'supabase/csv import files/countries_directory_insert.sql';

function splitCsvLine(line, delimiter = ';') {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
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

function formatInt(val) {
  if (!val || val.trim() === '' || val.trim().toUpperCase() === 'NULL') return 'NULL';
  const n = parseInt(val.trim().replace(/,/g, ''), 10);
  return isNaN(n) ? 'NULL' : String(n);
}

function formatBigInt(val) {
  if (!val || val.trim() === '' || val.trim().toUpperCase() === 'NULL') return 'NULL';
  const n = parseInt(val.trim().replace(/,/g, ''), 10);
  return isNaN(n) ? 'NULL' : String(n);
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

  if (escaped.length === 0) return 'ARRAY[]::text[]';
  return `ARRAY[${escaped.join(', ')}]::text[]`;
}

function formatTimestamp(val) {
  if (!val || val.trim() === '') return 'NOW()';
  return formatStr(val);
}

// Column types for countries_directory
const columnTypes = {
  id: 'string',
  name: 'string',
  continent: 'string',
  description: 'string',
  gdp_rank: 'int',
  population: 'bigint',
  official_languages: 'array',
  demand_level: 'string',
  avg_salary_usd: 'string',
  growth_trajectory: 'string',
  icon_emoji: 'string',
  keywords: 'array',
  top_industries: 'array',
  top_sectors: 'array',
  top_domains: 'array',
  top_careers: 'array',
  top_job_roles: 'array',
  top_skills: 'array',
  top_subjects: 'array',
  top_universities: 'array',
  top_courses: 'array',
  soft_skills_in_demand: 'array',
  interests: 'array',
  created_at: 'timestamp',
};

const content = fs.readFileSync(csvPath, 'utf-8');
const rawLines = content.split(/\r?\n/).filter(line => line.trim());
const headers = splitCsvLine(rawLines[0], ';').map(h => h.trim().replace(/^\uFEFF/, ''));

// De-duplicate by name: keep the row with the most non-null fields
const byName = new Map();

for (let i = 1; i < rawLines.length; i++) {
  const rowValues = splitCsvLine(rawLines[i], ';');
  const rowMap = {};
  headers.forEach((header, idx) => {
    rowMap[header] = rowValues[idx] || '';
  });

  const name = (rowMap['name'] || '').trim();
  if (!name) continue;

  // Score = number of non-empty fields
  const score = Object.values(rowMap).filter(v => v && v.trim() && v.trim() !== '[]').length;

  if (!byName.has(name) || score > byName.get(name).score) {
    byName.set(name, { rowMap, score });
  }
}

const sqlStatements = [];
sqlStatements.push('-- Idempotent upsert for countries_directory');
sqlStatements.push('-- Conflicts on unique constraint: countries_directory_name_key');
sqlStatements.push('-- Duplicate names are de-duplicated here, keeping richest row\n');

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
      } else if (type === 'int') {
        values.push(formatInt(rawVal));
      } else if (type === 'bigint') {
        values.push(formatBigInt(rawVal));
      } else {
        values.push(formatStr(rawVal));
      }
    }
  });

  const colList = columns.join(', ');
  const valList = values.join(', ');

  // Update all columns except name (the conflict key) and id (we keep existing id on conflict)
  const updateClauses = columns
    .filter(col => col !== 'name' && col !== 'id')
    .map(col => `${col} = EXCLUDED.${col}`);
  const updateStr = updateClauses.join(', ');

  const sql = `INSERT INTO public.countries_directory (${colList})\nVALUES (${valList})\nON CONFLICT (name) DO UPDATE SET ${updateStr};\n`;
  sqlStatements.push(sql);
}

fs.writeFileSync(sqlPath, sqlStatements.join('\n'), 'utf-8');
console.log(`Generated ${byName.size} unique country SQL statements -> ${sqlPath}`);
