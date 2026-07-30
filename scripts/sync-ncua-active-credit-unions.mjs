import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { inflateRawSync } from 'zlib';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputPath = process.env.NCUA_DIRECTORY_STORAGE_PATH || path.join(repoRoot, 'data', 'ncua-active-credit-unions.json');
const cycle = process.env.NCUA_CYCLE || '2026-03';
const sourceUrl = process.env.NCUA_ACTIVE_LIST_URL || 'https://ncua.gov/files/publications/analysis/federally-insured-credit-union-list-march-2026.zip';

function normalize(value) {
  return String(value ?? '').replace(/^\uFEFF/, '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function numberValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(String(value ?? '').replace(/[$,%\s]/g, '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function findEndOfCentralDirectory(buffer) {
  const minimumOffset = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error('Downloaded NCUA active-list file is not a valid ZIP archive.');
}

function readZipEntries(buffer) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = [];
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('NCUA ZIP central directory is malformed.');
    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const fileName = buffer.subarray(offset + 46, offset + 46 + fileNameLength).toString('utf8');

    if (!fileName.endsWith('/')) {
      if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) throw new Error(`Invalid ZIP entry header for ${fileName}.`);
      const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
      const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);
      const content = compressionMethod === 0 ? Buffer.from(compressed)
        : compressionMethod === 8 ? inflateRawSync(compressed)
          : (() => { throw new Error(`Unsupported ZIP compression method ${compressionMethod}.`); })();
      entries.push({ name: path.basename(fileName), content });
    }
    offset += 46 + fileNameLength + extraLength + commentLength;
  }
  return entries;
}

function locateHeaderRow(rows) {
  for (let i = 0; i < Math.min(rows.length, 30); i += 1) {
    const values = rows[i].map(normalize);
    const hasCharter = values.some((value) => ['CU_NUMBER', 'CHARTER_NUMBER', 'CHARTER_NO', 'CHARTER'].includes(value));
    const hasName = values.some((value) => ['CU_NAME', 'CREDIT_UNION_NAME', 'CREDIT_UNION'].includes(value));
    if (hasCharter && hasName) return i;
  }
  throw new Error('Could not locate the header row in the NCUA active credit union spreadsheet.');
}

function findIndex(headers, candidates, predicate = null) {
  const normalizedCandidates = candidates.map(normalize);
  for (const candidate of normalizedCandidates) {
    const index = headers.indexOf(candidate);
    if (index >= 0) return index;
  }
  if (predicate) {
    const index = headers.findIndex(predicate);
    if (index >= 0) return index;
  }
  return -1;
}

async function main() {
  const response = await fetch(sourceUrl, { headers: { 'User-Agent': 'GFS-Dashboards/1.0' } });
  if (!response.ok) throw new Error(`Unable to download NCUA active list: HTTP ${response.status}`);
  const entries = readZipEntries(Buffer.from(await response.arrayBuffer()));
  const spreadsheet = entries.find((entry) => /\.(xlsx|xls)$/i.test(entry.name));
  if (!spreadsheet) throw new Error(`NCUA active-list ZIP did not contain an Excel workbook. Entries: ${entries.map((entry) => entry.name).join(', ')}`);

  const workbook = XLSX.read(spreadsheet.content, { type: 'buffer', cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true });
  const headerRowIndex = locateHeaderRow(rows);
  const headers = rows[headerRowIndex].map(normalize);
  const dataRows = rows.slice(headerRowIndex + 1);

  const charterIndex = findIndex(headers, ['CU_NUMBER', 'CHARTER_NUMBER', 'CHARTER_NO', 'CHARTER']);
  const nameIndex = findIndex(headers, ['CU_NAME', 'CREDIT_UNION_NAME', 'CREDIT_UNION']);
  const stateIndex = findIndex(
    headers,
    ['STATE', 'STATE_CODE', 'STATE_MAILING_ADDRESS', 'MAILING_STATE'],
    (header) => header.includes('STATE') && header.includes('MAILING')
  );
  const cityIndex = findIndex(
    headers,
    ['CITY', 'CU_CITY', 'CITY_MAILING_ADDRESS', 'MAILING_CITY'],
    (header) => header.includes('CITY') && header.includes('MAILING')
  );
  const streetIndex = findIndex(
    headers,
    ['ADDRESS', 'STREET', 'PHYSICAL_ADDRESS', 'STREET_MAILING_ADDRESS', 'MAILING_ADDRESS'],
    (header) => header.includes('STREET') && header.includes('MAILING')
  );
  const zipIndex = findIndex(
    headers,
    ['ZIP', 'ZIP_CODE', 'ZIPCODE', 'ZIP_CODE_MAILING_ADDRESS', 'MAILING_ZIP'],
    (header) => header.includes('ZIP') && header.includes('MAILING')
  );
  const typeIndex = findIndex(
    headers,
    ['CHARTER_TYPE', 'CU_TYPE', 'TYPE', 'CREDIT_UNION_TYPE'],
    (header) => header.includes('CREDIT_UNION') && header.includes('TYPE')
  );
  const assetsIndex = findIndex(
    headers,
    ['ASSETS', 'TOTAL_ASSETS', 'ASSET_SIZE'],
    (header) => header === 'TOTAL_ASSETS' || (header.includes('TOTAL') && header.includes('ASSET') && !header.includes('GROWTH'))
  );
  const membersIndex = findIndex(
    headers,
    ['MEMBERS', 'NUMBER_OF_MEMBERS', 'TOTAL_MEMBERS', 'MEMBER_COUNT', 'TOTAL_NUMBER_OF_MEMBERS'],
    (header) => header.includes('MEMBER') && !header.includes('GROWTH') && !header.includes('RATIO')
  );

  if ([charterIndex, nameIndex, stateIndex, assetsIndex].some((index) => index < 0)) {
    throw new Error(`Required NCUA active-list columns were not found. Missing: ${[
      ['charter', charterIndex],
      ['name', nameIndex],
      ['state', stateIndex],
      ['assets', assetsIndex]
    ].filter(([, index]) => index < 0).map(([label]) => label).join(', ')}.`);
  }

  const creditUnions = dataRows.map((row) => ({
    charterNumber: String(row[charterIndex] ?? '').trim(),
    name: String(row[nameIndex] ?? '').trim(),
    state: String(row[stateIndex] ?? '').trim().toUpperCase(),
    city: cityIndex >= 0 ? String(row[cityIndex] ?? '').trim() : '',
    status: 'Active',
    charterType: typeIndex >= 0 ? String(row[typeIndex] ?? '').trim() : '',
    street: streetIndex >= 0 ? String(row[streetIndex] ?? '').trim() : '',
    zip: zipIndex >= 0 ? String(row[zipIndex] ?? '').trim() : '',
    assets: numberValue(row[assetsIndex]),
    members: membersIndex >= 0 ? numberValue(row[membersIndex]) : null
  })).filter((creditUnion) => creditUnion.charterNumber && creditUnion.name && creditUnion.state)
    .sort((a, b) => a.state.localeCompare(b.state) || (b.assets || 0) - (a.assets || 0) || a.name.localeCompare(b.name));

  if (creditUnions.length < 4000) {
    throw new Error(`NCUA active list produced only ${creditUnions.length} records; refusing to replace the directory.`);
  }

  const payload = { generatedAt: new Date().toISOString(), cycle, sourceUrl, count: creditUnions.length, creditUnions };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(payload));
  await fs.rename(temporaryPath, outputPath);
  console.log(`Saved ${creditUnions.length} active credit unions to ${outputPath}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
