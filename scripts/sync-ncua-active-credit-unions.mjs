import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { inflateRawSync } from 'zlib';
import XLSX from 'xlsx';

import { buildGrowthProjection, projectionMethod } from './ncua-projection.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const outputPath = process.env.NCUA_DIRECTORY_STORAGE_PATH || path.join(repoRoot, 'data', 'ncua-active-credit-unions.json');
const cycle = process.env.NCUA_CYCLE || '2026-03';
const activeListUrl = process.env.NCUA_ACTIVE_LIST_URL || 'https://ncua.gov/files/publications/analysis/federally-insured-credit-union-list-march-2026.zip';
const callReportUrlTemplate = process.env.NCUA_CALL_REPORT_URL_TEMPLATE
  || 'https://ncua.gov/files/publications/analysis/call-report-data-{cycle}.zip';
const configuredHistoryYears = Number.parseInt(process.env.NCUA_HISTORY_YEARS || '5', 10);
const historyYears = Number.isFinite(configuredHistoryYears)
  ? Math.max(1, Math.min(10, configuredHistoryYears))
  : 5;
const schemaVersion = 3;

const coreCallReportFields = {
  assets: ['ACCT_010'],
  members: ['ACCT_083'],
  loans: ['ACCT_025B', 'ACCT_025B1']
};

const lendingCallReportFields = {
  ...coreCallReportFields,
  newAuto: ['ACCT_385'],
  usedAuto: ['ACCT_370'],
  indirectAuto: ['ACCT_IN0002', 'IN0002'],
  firstLienMortgage: ['ACCT_703A']
};

function normalize(value) {
  return String(value ?? '').replace(/^\uFEFF/, '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function normalizeWords(value) {
  return String(value ?? '').replace(/^\uFEFF/, '').trim().toUpperCase().replace(/[^A-Z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeCharter(value) {
  const cleaned = String(value ?? '').trim().replace(/\.0$/, '');
  return cleaned.replace(/^0+(?=\d)/, '');
}

function numberValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const cleaned = String(value ?? '').replace(/[$,%\s]/g, '').replace(/,/g, '');
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function finiteOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function sumDefined(...values) {
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) : null;
}

function callReportUrlForCycle(targetCycle) {
  if (targetCycle === cycle && process.env.NCUA_CALL_REPORT_URL) return process.env.NCUA_CALL_REPORT_URL;
  return callReportUrlTemplate.replaceAll('{cycle}', targetCycle);
}

function buildHistoryCycles(currentCycle, years) {
  const match = String(currentCycle).match(/^(\d{4})-(03|06|09|12)$/);
  if (!match) throw new Error(`NCUA_CYCLE must use YYYY-03, YYYY-06, YYYY-09, or YYYY-12. Received ${currentCycle}.`);
  const currentYear = Number(match[1]);
  const month = match[2];
  return Array.from({ length: years + 1 }, (_, index) => `${currentYear - years + index}-${month}`);
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

function accountHeaderCandidates(value) {
  const normalized = normalize(value);
  if (!normalized) return [];
  if (normalized.startsWith('ACCT_')) return [normalized];
  return [normalized, `ACCT_${normalized}`];
}

function metricFromDescription(description) {
  const words = normalizeWords(description);
  const excludes = (terms) => terms.some((term) => words.includes(term));
  if (words.startsWith('TOTAL ASSETS') && !excludes(['AVERAGE', 'RATIO', 'GROWTH', 'GREATER THAN'])) return 'assets';
  if ((words === 'NUMBER OF MEMBERS' || words.includes('TOTAL NUMBER OF MEMBERS'))
    && !excludes(['POTENTIAL', 'AVERAGE', 'GROWTH', 'RATIO'])) return 'members';
  if ((words === 'TOTAL LOANS' || words.startsWith('TOTAL LOANS AND LEASES'))
    && !excludes(['DELINQUENT', 'NUMBER OF', 'AVERAGE', 'GROWTH', 'UNFUNDED'])) return 'loans';
  return null;
}

function enrichFieldDefinitionsFromAccountDescriptions(zipBuffer, fieldDefinitions) {
  const resolved = Object.fromEntries(
    Object.entries(fieldDefinitions).map(([field, candidates]) => [field, [...new Set(candidates.map(normalize))]])
  );
  const entries = readZipEntries(zipBuffer, (fileName) => /^ACCTDESC\.(TXT|CSV)$/i.test(path.basename(fileName)));
  const entry = entries[0];
  if (!entry) return resolved;

  const text = entry.content.toString('utf8');
  const rows = parseDelimited(text, delimiterFor(text));
  if (!rows.length) return resolved;
  let headerRowIndex = -1;
  let codeIndex = -1;
  let descriptionIndex = -1;
  for (let index = 0; index < Math.min(rows.length, 10); index += 1) {
    const headers = rows[index].map(normalize);
    const foundCodeIndex = findIndex(headers, ['ACCOUNT', 'ACCOUNT_CODE', 'ACCOUNT_NUMBER', 'ACCT', 'ACCT_CODE', 'ACCT_NUM', 'ACCT_NO']);
    const foundDescriptionIndex = findIndex(
      headers,
      ['ACCOUNT_NAME', 'ACCOUNT_DESCRIPTION', 'DESCRIPTION', 'ACCT_DESC', 'ACCT_NAME', 'ACCOUNT_DESC'],
      (header) => header.includes('DESCRIPTION') || header.endsWith('_DESC') || header.endsWith('_NAME')
    );
    if (foundCodeIndex >= 0 && foundDescriptionIndex >= 0) {
      headerRowIndex = index;
      codeIndex = foundCodeIndex;
      descriptionIndex = foundDescriptionIndex;
      break;
    }
  }
  if (headerRowIndex < 0) return resolved;

  for (const row of rows.slice(headerRowIndex + 1)) {
    const metric = metricFromDescription(row[descriptionIndex]);
    if (!metric || !resolved[metric]) continue;
    resolved[metric] = [...new Set([...accountHeaderCandidates(row[codeIndex]), ...resolved[metric]])];
  }
  return resolved;
}

function parseCallReportMetrics(zipBuffer, requestedFields) {
  const fieldDefinitions = enrichFieldDefinitionsFromAccountDescriptions(zipBuffer, requestedFields);
  const metricsByCharter = new Map();
  const locatedFields = new Set();
  const targetHeaders = new Set(Object.values(fieldDefinitions).flat().map(normalize));

  visitZipEntries(zipBuffer, (fileName) => /\.(txt|csv)$/i.test(fileName), (entry) => {
    const text = entry.content.toString('utf8');
    const delimiter = delimiterFor(text);
    const lineEnd = text.indexOf('\n');
    const headerText = text.slice(0, lineEnd >= 0 ? lineEnd : text.length);
    const headers = (parseDelimited(headerText, delimiter)[0] || []).map(normalize);
    const charterIndex = findIndex(headers, ['CU_NUMBER', 'CU_NUM', 'CHARTER_NUMBER']);
    if (charterIndex < 0 || !headers.some((header) => targetHeaders.has(header))) return;

    const fieldIndexes = Object.fromEntries(
      Object.entries(fieldDefinitions).map(([field, candidates]) => [field, findIndex(headers, candidates)])
    );
    for (const [field, columnIndex] of Object.entries(fieldIndexes)) {
      if (columnIndex >= 0) locatedFields.add(field);
    }
    const rows = parseDelimited(text, delimiter).slice(1);
    for (const row of rows) {
      const charterNumber = normalizeCharter(row[charterIndex]);
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

  return { metricsByCharter, locatedFields, fieldDefinitions };
}

function validateCallReportSnapshot(snapshot, requiredFields, minimumRecords) {
  const missingFields = requiredFields.filter((field) => !snapshot.locatedFields.has(field));
  if (missingFields.length) {
    throw new Error(`Required NCUA call report fields were not found for ${snapshot.cycle}: ${missingFields.join(', ')}.`);
  }
  if (snapshot.metricsByCharter.size < minimumRecords) {
    throw new Error(`NCUA ${snapshot.cycle} call report matched only ${snapshot.metricsByCharter.size} credit unions; refusing to publish incomplete history.`);
  }
}

async function loadHistoricalSnapshots(historyCycles) {
  const snapshots = [];
  for (const historyCycle of historyCycles) {
    const sourceUrl = callReportUrlForCycle(historyCycle);
    console.log(`Downloading NCUA ${historyCycle} call report history...`);
    const buffer = await downloadBuffer(sourceUrl, `NCUA ${historyCycle} call report data`);
    const parsed = parseCallReportMetrics(buffer, coreCallReportFields);
    const snapshot = { cycle: historyCycle, sourceUrl, ...parsed };
    validateCallReportSnapshot(snapshot, Object.keys(coreCallReportFields), 3000);
    snapshots.push(snapshot);
  }
  return snapshots;
}

function buildCreditUnionHistory(charterNumber, currentRecord, snapshots) {
  return snapshots.map((snapshot) => {
    const metrics = snapshot.metricsByCharter.get(charterNumber) || {};
    const isCurrent = snapshot.cycle === cycle;
    return {
      cycle: snapshot.cycle,
      assets: isCurrent && Number.isFinite(currentRecord.assets) ? currentRecord.assets : finiteOrNull(metrics.assets),
      members: isCurrent && Number.isFinite(currentRecord.members) ? currentRecord.members : finiteOrNull(metrics.members),
      loans: isCurrent && Number.isFinite(currentRecord.loans) ? currentRecord.loans : finiteOrNull(metrics.loans)
    };
  });
}

async function main() {
  const historyCycles = buildHistoryCycles(cycle, historyYears);
  const priorHistoryCycles = historyCycles.filter((historyCycle) => historyCycle !== cycle);
  const currentCallReportUrl = callReportUrlForCycle(cycle);
  const [activeListBuffer, currentCallReportBuffer] = await Promise.all([
    downloadBuffer(activeListUrl, 'NCUA active list'),
    downloadBuffer(currentCallReportUrl, 'NCUA current call report data')
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

  const currentParsed = parseCallReportMetrics(currentCallReportBuffer, lendingCallReportFields);
  const currentSnapshot = { cycle, sourceUrl: currentCallReportUrl, ...currentParsed };
  validateCallReportSnapshot(currentSnapshot, Object.keys(lendingCallReportFields), 3500);
  const priorSnapshots = await loadHistoricalSnapshots(priorHistoryCycles);
  const snapshots = [...priorSnapshots, currentSnapshot].sort((a, b) => a.cycle.localeCompare(b.cycle));

  const creditUnions = dataRows.map((row) => {
    const charterNumber = normalizeCharter(row[charterIndex]);
    const callReport = currentSnapshot.metricsByCharter.get(charterNumber) || {};
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
    const activeAssets = numberValue(row[assetsIndex]);
    const activeMembers = membersIndex >= 0 ? numberValue(row[membersIndex]) : null;
    const activeLoans = activeListLoansIndex >= 0 ? numberValue(row[activeListLoansIndex]) : null;
    const currentRecord = {
      charterNumber,
      name: String(row[nameIndex] ?? '').trim(),
      state: String(row[stateIndex] ?? '').trim().toUpperCase(),
      city: cityIndex >= 0 ? String(row[cityIndex] ?? '').trim() : '',
      status: 'Active',
      charterType: typeIndex >= 0 ? String(row[typeIndex] ?? '').trim() : '',
      street: streetIndex >= 0 ? String(row[streetIndex] ?? '').trim() : '',
      zip: zipIndex >= 0 ? String(row[zipIndex] ?? '').trim() : '',
      assets: Number.isFinite(activeAssets) ? activeAssets : finiteOrNull(callReport.assets),
      members: Number.isFinite(activeMembers) ? activeMembers : finiteOrNull(callReport.members),
      loans: Number.isFinite(callReport.loans) ? callReport.loans : activeLoans,
      newAuto,
      usedAuto,
      totalAuto,
      indirectAuto,
      directAuto,
      directAutoPercent,
      firstLienMortgage: Number.isFinite(callReport.firstLienMortgage) ? callReport.firstLienMortgage : null
    };
    const history = buildCreditUnionHistory(charterNumber, currentRecord, snapshots);
    return { ...currentRecord, history, ...buildGrowthProjection(history) };
  }).filter((creditUnion) => creditUnion.charterNumber && creditUnion.name && creditUnion.state)
    .sort((a, b) => a.state.localeCompare(b.state) || (b.assets || 0) - (a.assets || 0) || a.name.localeCompare(b.name));

  if (creditUnions.length < 4000) {
    throw new Error(`NCUA active list produced only ${creditUnions.length} records; refusing to replace the directory.`);
  }

  const historyMatchCounts = Object.fromEntries(historyCycles.map((historyCycle) => [
    historyCycle,
    creditUnions.filter((creditUnion) => {
      const point = creditUnion.history.find((row) => row.cycle === historyCycle);
      return point && Number.isFinite(point.assets) && Number.isFinite(point.members) && Number.isFinite(point.loans);
    }).length
  ]));
  const trendCounts = creditUnions.reduce((counts, creditUnion) => {
    counts[creditUnion.trend] = (counts[creditUnion.trend] || 0) + 1;
    return counts;
  }, {});

  const payload = {
    schemaVersion,
    generatedAt: new Date().toISOString(),
    cycle,
    sourceUrl: activeListUrl,
    callReportSourceUrl: currentCallReportUrl,
    callReportMatchedCount: currentSnapshot.metricsByCharter.size,
    historyYears,
    historyCycles,
    historySourceUrls: Object.fromEntries(snapshots.map((snapshot) => [snapshot.cycle, snapshot.sourceUrl])),
    historyMatchCounts,
    projectionYears: projectionMethod.projectionYears,
    projectionMethod,
    trendCounts,
    count: creditUnions.length,
    creditUnions
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(payload));
  await fs.rename(temporaryPath, outputPath);
  console.log(`Saved ${creditUnions.length} active credit unions with ${historyYears} years of history and ${projectionMethod.projectionYears}-year projections to ${outputPath}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
