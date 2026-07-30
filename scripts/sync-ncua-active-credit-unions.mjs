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
const activeListUrl = process.env.NCUA_ACTIVE_LIST_URL || 'https://ncua.gov/files/publications/analysis/federally-insured-credit-union-list-march-2026.zip';
const callReportUrl = process.env.NCUA_CALL_REPORT_URL || `https://ncua.gov/files/publications/analysis/call-report-data-${cycle}.zip`;
const schemaVersion = 2;

const callReportFields = {
  loans: ['ACCT_025B', 'ACCT_025B1'],
  newAuto: ['ACCT_385'],
  usedAuto: ['ACCT_370'],
  indirectAuto: ['ACCT_IN0002', 'IN0002'],
  firstLienMortgage: ['ACCT_703A']
};

function normalize(value) {
  return String(value ?? '').replace(/^\uFEFF/, '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function numberValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const cleaned = String(value ?? '').replace(/[$,%\s]/g, '').replace(/,/g, '');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function sumDefined(...values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) : null;
}

async function downloadBuffer(url, label) {
  const response = await fetch(url, { headers: { 'User-Agent': 'GFS-Dashboards/1.0' } });
  if (!response.ok) throw new Error(`Unable to download ${label}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function findEndOfCentralDirectory(buffer) {
  const minimumOffset = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) return offset;
  }
  throw new Error('Downloaded NCUA file is not a valid ZIP archive.');
}

function visitZipEntries(buffer, shouldExtract, visitor) {
  const eocdOffset = findEndOfCentralDirectory(buffer);
  const entryCount = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
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

    if (!fileName.endsWith('/') && shouldExtract(fileName)) {
      if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) throw new Error(`Invalid ZIP entry header for ${fileName}.`);
      const localFileNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataOffset = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
      const compressed = buffer.subarray(dataOffset, dataOffset + compressedSize);
      const content = compressionMethod === 0 ? Buffer.from(compressed)
        : compressionMethod === 8 ? inflateRawSync(compressed)
          : (() => { throw new Error(`Unsupported ZIP compression method ${compressionMethod}.`); })();
      visitor({ name: path.basename(fileName), content });
    }
    offset += 46 + fileNameLength + extraLength + commentLength;
  }
}

function readZipEntries(buffer, shouldExtract = () => true) {
  const entries = [];
  visitZipEntries(buffer, shouldExtract, (entry) => entries.push(entry));
  return entries;
}

function parseDelimited(text, delimiter) {
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
    } else if (character === delimiter) {
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

function delimiterFor(text) {
  const lineEnd = text.indexOf('\n');
  const header = text.slice(0, lineEnd >= 0 ? lineEnd : text.length);
  const tabs = (header.match(/\t/g) || []).length;
  const commas = (header.match(/,/g) || []).length;
  return tabs > commas ? '\t' : ',';
}

function locateHeaderRow(rows) {
  for (let index = 0; index < Math.min(rows.length, 30); index += 1) {
    const values = rows[index].map(normalize);
    const hasCharter = values.some((value) => ['CU_NUMBER', 'CHARTER_NUMBER', 'CHARTER_NO', 'CHARTER'].includes(value));
    const hasName = values.some((value) => ['CU_NAME', 'CREDIT_UNION_NAME', 'CREDIT_UNION'].includes(value));
    if (hasCharter && hasName) return index;
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

function parseCallReportMetrics(zipBuffer) {
  const metricsByCharter = new Map();
  const locatedFields = new Set();
  const targetHeaders = new Set(Object.values(callReportFields).flat().map(normalize));

  visitZipEntries(zipBuffer, (fileName) => /\.(txt|csv)$/i.test(fileName), (entry) => {
    const text = entry.content.toString('utf8');
    const delimiter = delimiterFor(text);
    const lineEnd = text.indexOf('\n');
    const headerText = text.slice(0, lineEnd >= 0 ? lineEnd : text.length);
    const headers = (parseDelimited(headerText, delimiter)[0] || []).map(normalize);
    const charterIndex = findIndex(headers, ['CU_NUMBER', 'CU_NUM']);
    if (charterIndex < 0 || !headers.some((header) => targetHeaders.has(header))) return;

    const fieldIndexes = Object.fromEntries(
      Object.entries(callReportFields).map(([field, candidates]) => [field, findIndex(headers, candidates)])
    );
    for (const [field, columnIndex] of Object.entries(fieldIndexes)) {
      if (columnIndex >= 0) locatedFields.add(field);
    }
    const rows = parseDelimited(text, delimiter).slice(1);
    for (const row of rows) {
      const charterNumber = String(row[charterIndex] ?? '').trim();
      if (!charterNumber) continue;
      const metrics = metricsByCharter.get(charterNumber) || {};
      for (const [field, columnIndex] of Object.entries(fieldIndexes)) {
        if (columnIndex < 0 || Number.isFinite(metrics[field])) continue;
        const value = numberValue(row[columnIndex]);
        if (Number.isFinite(value)) metrics[field] = value;
      }
      metricsByCharter.set(charterNumber, metrics);
    }
  });

  return { metricsByCharter, locatedFields };
}

async function main() {
  const [activeListBuffer, callReportBuffer] = await Promise.all([
    downloadBuffer(activeListUrl, 'NCUA active list'),
    downloadBuffer(callReportUrl, 'NCUA call report data')
  ]);

  const activeEntries = readZipEntries(activeListBuffer, (fileName) => /\.(xlsx|xls)$/i.test(fileName));
  const spreadsheet = activeEntries.find((entry) => /\.(xlsx|xls)$/i.test(entry.name));
  if (!spreadsheet) throw new Error(`NCUA active-list ZIP did not contain an Excel workbook. Entries: ${activeEntries.map((entry) => entry.name).join(', ')}`);

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
  const activeListLoansIndex = findIndex(
    headers,
    ['LOANS', 'TOTAL_LOANS', 'TOTAL_LOANS_AND_LEASES', 'LOAN_BALANCE'],
    (header) => header.includes('LOAN') && header.includes('TOTAL') && !header.includes('GROWTH') && !header.includes('RATIO') && !header.includes('DELINQU')
  );

  if ([charterIndex, nameIndex, stateIndex, assetsIndex].some((index) => index < 0)) {
    throw new Error(`Required NCUA active-list columns were not found. Missing: ${[
      ['charter', charterIndex],
      ['name', nameIndex],
      ['state', stateIndex],
      ['assets', assetsIndex]
    ].filter(([, index]) => index < 0).map(([label]) => label).join(', ')}.`);
  }

  const { metricsByCharter: callReportMetrics, locatedFields } = parseCallReportMetrics(callReportBuffer);
  const missingCallReportFields = Object.keys(callReportFields).filter((field) => !locatedFields.has(field));
  if (missingCallReportFields.length) {
    throw new Error(`Required NCUA call report fields were not found: ${missingCallReportFields.join(', ')}.`);
  }
  if (callReportMetrics.size < 3500) {
    throw new Error(`NCUA call report enrichment matched only ${callReportMetrics.size} credit unions; refusing to publish incomplete lending metrics.`);
  }

  const creditUnions = dataRows.map((row) => {
    const charterNumber = String(row[charterIndex] ?? '').trim();
    const callReport = callReportMetrics.get(charterNumber) || {};
    const newAuto = Number.isFinite(callReport.newAuto) ? callReport.newAuto : null;
    const usedAuto = Number.isFinite(callReport.usedAuto) ? callReport.usedAuto : null;
    const totalAuto = sumDefined(newAuto, usedAuto);
    const indirectAuto = Number.isFinite(callReport.indirectAuto) ? callReport.indirectAuto : null;
    const directAuto = Number.isFinite(totalAuto) && Number.isFinite(indirectAuto)
      ? Math.max(totalAuto - indirectAuto, 0)
      : null;
    const directAutoPercent = Number.isFinite(directAuto) && totalAuto > 0
      ? (directAuto / totalAuto) * 100
      : null;

    return {
      charterNumber,
      name: String(row[nameIndex] ?? '').trim(),
      state: String(row[stateIndex] ?? '').trim().toUpperCase(),
      city: cityIndex >= 0 ? String(row[cityIndex] ?? '').trim() : '',
      status: 'Active',
      charterType: typeIndex >= 0 ? String(row[typeIndex] ?? '').trim() : '',
      street: streetIndex >= 0 ? String(row[streetIndex] ?? '').trim() : '',
      zip: zipIndex >= 0 ? String(row[zipIndex] ?? '').trim() : '',
      assets: numberValue(row[assetsIndex]),
      members: membersIndex >= 0 ? numberValue(row[membersIndex]) : null,
      loans: Number.isFinite(callReport.loans)
        ? callReport.loans
        : activeListLoansIndex >= 0 ? numberValue(row[activeListLoansIndex]) : null,
      newAuto,
      usedAuto,
      totalAuto,
      indirectAuto,
      directAuto,
      directAutoPercent,
      firstLienMortgage: Number.isFinite(callReport.firstLienMortgage) ? callReport.firstLienMortgage : null
    };
  }).filter((creditUnion) => creditUnion.charterNumber && creditUnion.name && creditUnion.state)
    .sort((a, b) => a.state.localeCompare(b.state) || (b.assets || 0) - (a.assets || 0) || a.name.localeCompare(b.name));

  if (creditUnions.length < 4000) {
    throw new Error(`NCUA active list produced only ${creditUnions.length} records; refusing to replace the directory.`);
  }

  const payload = {
    schemaVersion,
    generatedAt: new Date().toISOString(),
    cycle,
    sourceUrl: activeListUrl,
    callReportSourceUrl: callReportUrl,
    callReportMatchedCount: callReportMetrics.size,
    count: creditUnions.length,
    creditUnions
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(payload));
  await fs.rename(temporaryPath, outputPath);
  console.log(`Saved ${creditUnions.length} active credit unions with lending metrics to ${outputPath}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
