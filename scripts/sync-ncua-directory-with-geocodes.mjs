import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const directoryPath = process.env.NCUA_DIRECTORY_STORAGE_PATH || path.join(repoRoot, 'data', 'ncua-active-credit-unions.json');
const sourceScript = path.join(__dirname, 'sync-ncua-active-credit-unions.mjs');
const geocoderUrl = process.env.NCUA_GEOCODER_URL || 'https://geocoding.geo.census.gov/geocoder/locations/addressbatch';
const schemaVersion = 4;

function runSourceSync() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [sourceScript], {
      cwd: repoRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || stdout.trim() || `NCUA source sync exited with code ${code}`));
    });
  });
}

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}

function cleanZip(value) {
  const match = String(value || '').match(/\d{5}/);
  return match ? match[0] : String(value || '').trim();
}

async function geocodeBatch(creditUnions) {
  const rows = creditUnions
    .filter((creditUnion) => creditUnion.charterNumber && creditUnion.street && creditUnion.city && creditUnion.state)
    .map((creditUnion) => [
      creditUnion.charterNumber,
      creditUnion.street,
      creditUnion.city,
      creditUnion.state,
      cleanZip(creditUnion.zip)
    ]);
  if (!rows.length) return new Map();

  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');
  const form = new FormData();
  form.append('addressFile', new Blob([csv], { type: 'text/csv' }), 'ncua-addresses.csv');
  form.append('benchmark', 'Public_AR_Current');

  const response = await fetch(geocoderUrl, {
    method: 'POST',
    headers: { 'User-Agent': 'GFS-Dashboards/1.0' },
    body: form
  });
  if (!response.ok) throw new Error(`Census address geocoder returned HTTP ${response.status}`);

  const output = parseCsv(await response.text());
  const coordinates = new Map();
  for (const row of output) {
    const charterNumber = String(row[0] || '').trim();
    const matchStatus = String(row[2] || '').trim().toLowerCase();
    const coordinatePair = String(row[5] || '').split(',').map(Number);
    const [longitude, latitude] = coordinatePair;
    if (!charterNumber || matchStatus !== 'match' || !Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    coordinates.set(charterNumber, {
      latitude,
      longitude,
      geocodeMatchType: String(row[3] || '').trim(),
      geocodedAddress: String(row[4] || '').trim()
    });
  }
  return coordinates;
}

async function main() {
  const sourceMessage = await runSourceSync();
  const directory = JSON.parse(await fs.readFile(directoryPath, 'utf8'));
  const creditUnions = Array.isArray(directory.creditUnions) ? directory.creditUnions : [];
  const coordinates = await geocodeBatch(creditUnions);
  const enriched = creditUnions.map((creditUnion) => ({
    ...creditUnion,
    latitude: coordinates.get(creditUnion.charterNumber)?.latitude ?? null,
    longitude: coordinates.get(creditUnion.charterNumber)?.longitude ?? null,
    geocodeMatchType: coordinates.get(creditUnion.charterNumber)?.geocodeMatchType ?? '',
    geocodedAddress: coordinates.get(creditUnion.charterNumber)?.geocodedAddress ?? ''
  }));

  const payload = {
    ...directory,
    schemaVersion,
    geocodedAt: new Date().toISOString(),
    geocoder: 'U.S. Census Bureau batch address geocoder',
    geocodedCount: coordinates.size,
    creditUnions: enriched
  };
  const temporaryPath = `${directoryPath}.geocoded.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(payload));
  await fs.rename(temporaryPath, directoryPath);
  console.log(`${sourceMessage}\nMapped ${coordinates.size} of ${enriched.length} active credit-union addresses.`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
