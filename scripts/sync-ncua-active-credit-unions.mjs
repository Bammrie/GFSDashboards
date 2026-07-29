import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.join(repoRoot, 'data', 'ncua-active-credit-unions.json');

const latestCycle = process.env.NCUA_CYCLE || '2026-03';
const zipUrl = process.env.NCUA_CALL_REPORT_URL || `https://ncua.gov/files/publications/analysis/call-report-data-${latestCycle}.zip`;

function normalizeHeader(value) {
  return String(value || '').replace(/^\uFEFF/, '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function parseDelimited(text, delimiter = ',') {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows;
}

function findColumn(headers, candidates) {
  const index = new Map(headers.map((header, i) => [normalizeHeader(header), i]));
  for (const candidate of candidates) {
    const match = index.get(normalizeHeader(candidate));
    if (Number.isInteger(match)) return match;
  }
  return -1;
}

function numberValue(value) {
  const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

async function main() {
  const tempRoot = await fs.mkdtemp(path.join(tmpdir(), 'gfs-ncua-'));
  const zipPath = path.join(tempRoot, 'call-report.zip');
  const extractPath = path.join(tempRoot, 'extract');
  await fs.mkdir(extractPath, { recursive: true });

  const response = await fetch(zipUrl, { headers: { 'User-Agent': 'GFS-Dashboards/1.0' } });
  if (!response.ok) throw new Error(`Unable to download NCUA call report ZIP: ${response.status}`);
  await fs.writeFile(zipPath, Buffer.from(await response.arrayBuffer()));
  await execFileAsync('unzip', ['-oq', zipPath, '-d', extractPath]);

  const names = await fs.readdir(extractPath);
  const foicuName = names.find((name) => /^FOICU\.(TXT|CSV)$/i.test(name)) || names.find((name) => /^FOICU/i.test(name));
  if (!foicuName) throw new Error('FOICU identity file was not found in the NCUA archive.');

  const textFiles = names.filter((name) => /\.(txt|csv)$/i.test(name));
  const parsedFiles = [];
  for (const name of textFiles) {
    const raw = await fs.readFile(path.join(extractPath, name), 'utf8');
    const rows = parseDelimited(raw, raw.includes('\t') && !raw.includes(',') ? '\t' : ',');
    if (!rows.length) continue;
    parsedFiles.push({ name, headers: rows[0].map(normalizeHeader), rows: rows.slice(1) });
  }

  const foicu = parsedFiles.find((file) => file.name === foicuName);
  if (!foicu) throw new Error('Unable to parse FOICU identity file.');
  const cuIndex = findColumn(foicu.headers, ['CU_NUMBER', 'CU_NUM']);
  const nameIndex = findColumn(foicu.headers, ['CU_NAME', 'NAME']);
  const stateIndex = findColumn(foicu.headers, ['STATE', 'STATE_CODE']);
  const cityIndex = findColumn(foicu.headers, ['CITY', 'CU_CITY']);
  const statusIndex = findColumn(foicu.headers, ['CU_STATUS', 'STATUS']);
  const typeIndex = findColumn(foicu.headers, ['CHARTER_TYPE', 'CU_TYPE', 'TYPE']);
  const streetIndex = findColumn(foicu.headers, ['STREET', 'ADDRESS', 'PHYSICAL_ADDRESS']);
  const zipIndex = findColumn(foicu.headers, ['ZIP_CODE', 'ZIP', 'ZIPCODE']);
  if ([cuIndex, nameIndex, stateIndex].some((index) => index < 0)) throw new Error('Required FOICU columns were not found.');

  const assetsByCu = new Map();
  for (const file of parsedFiles) {
    const fileCuIndex = findColumn(file.headers, ['CU_NUMBER', 'CU_NUM']);
    const assetIndex = findColumn(file.headers, ['ACCT_010']);
    const memberIndex = findColumn(file.headers, ['ACCT_083']);
    if (fileCuIndex < 0 || (assetIndex < 0 && memberIndex < 0)) continue;
    for (const row of file.rows) {
      const charterNumber = String(row[fileCuIndex] || '').trim();
      if (!charterNumber) continue;
      const current = assetsByCu.get(charterNumber) || {};
      if (assetIndex >= 0 && current.assets == null) current.assets = numberValue(row[assetIndex]);
      if (memberIndex >= 0 && current.members == null) current.members = numberValue(row[memberIndex]);
      assetsByCu.set(charterNumber, current);
    }
  }

  const creditUnions = foicu.rows
    .map((row) => {
      const charterNumber = String(row[cuIndex] || '').trim();
      const status = statusIndex >= 0 ? String(row[statusIndex] || '').trim() : 'Active';
      const financials = assetsByCu.get(charterNumber) || {};
      return {
        charterNumber,
        name: String(row[nameIndex] || '').trim(),
        state: String(row[stateIndex] || '').trim().toUpperCase(),
        city: cityIndex >= 0 ? String(row[cityIndex] || '').trim() : '',
        status,
        charterType: typeIndex >= 0 ? String(row[typeIndex] || '').trim() : '',
        street: streetIndex >= 0 ? String(row[streetIndex] || '').trim() : '',
        zip: zipIndex >= 0 ? String(row[zipIndex] || '').trim() : '',
        assets: financials.assets ?? null,
        members: financials.members ?? null
      };
    })
    .filter((cu) => cu.charterNumber && cu.name)
    .filter((cu) => !cu.status || /active/i.test(cu.status))
    .sort((a, b) => a.state.localeCompare(b.state) || (b.assets || 0) - (a.assets || 0) || a.name.localeCompare(b.name));

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    cycle: latestCycle,
    sourceUrl: zipUrl,
    count: creditUnions.length,
    creditUnions
  }, null, 2));
  console.log(`Saved ${creditUnions.length} active credit unions to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
