import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { buildGrowthProjection } from '../scripts/ncua-projection.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const customDataPath = process.env.CUSTOM_CREDIT_UNION_DATA_PATH
  || path.resolve(__dirname, '..', 'data', 'custom-credit-unions.json');

function requiredText(value, fieldName) {
  const normalized = String(value ?? '').trim();
  if (!normalized) throw new Error(`Custom credit-union field ${fieldName} is required.`);
  return normalized;
}

function requiredNumber(value, fieldName) {
  const normalized = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(normalized)) {
    throw new Error(`Custom credit-union field ${fieldName} must be a finite number.`);
  }
  return normalized;
}

function normalizeCharter(value) {
  return requiredText(value, 'charterNumber').replace(/\.0$/, '').replace(/^0+(?=\d)/, '');
}

function reportCycle(value) {
  const reportDate = requiredText(value, 'sourceReportDate');
  const match = reportDate.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (!match) throw new Error('Custom credit-union sourceReportDate must use YYYY-MM-DD.');
  return `${match[1]}-${match[2]}`;
}

function buildReportGrowth(history) {
  const modeled = buildGrowthProjection(history);
  if (history.length >= 2) return modeled;

  const growth = Object.fromEntries(
    Object.entries(modeled.growth).map(([metric, values]) => [metric, {
      ...values,
      oneYearPct: null,
      fiveYearPct: null
    }])
  );
  return {
    ...modeled,
    growth,
    trend: 'Insufficient history',
    projection: [],
    projectedFiveYear: { assets: null, members: null, loans: null }
  };
}

export function mapCustomCreditUnion(record = {}) {
  const assets = requiredNumber(record.assets, 'assets');
  const members = requiredNumber(record.members, 'members');
  const loans = requiredNumber(record.loans, 'loans');
  const newAuto = requiredNumber(record.newAuto, 'newAuto');
  const usedAuto = requiredNumber(record.usedAuto, 'usedAuto');
  const indirectAuto = requiredNumber(record.indirectAuto, 'indirectAuto');
  const firstLienMortgage = requiredNumber(record.firstLienMortgage, 'firstLienMortgage');
  const totalAuto = newAuto + usedAuto;
  const directAuto = Math.max(totalAuto - indirectAuto, 0);
  const directAutoPercent = totalAuto > 0 ? (directAuto / totalAuto) * 100 : null;
  const cycle = reportCycle(record.sourceReportDate);
  const history = [{ cycle, assets, members, loans }];

  return {
    charterNumber: normalizeCharter(record.charterNumber),
    name: requiredText(record.name, 'name'),
    state: requiredText(record.state, 'state').toUpperCase(),
    city: requiredText(record.city, 'city'),
    status: 'Active',
    charterType: 'State-chartered, privately insured',
    street: requiredText(record.street, 'street'),
    zip: requiredText(record.zip, 'zip'),
    website: requiredText(record.website, 'website'),
    assets,
    members,
    loans,
    newAuto,
    usedAuto,
    totalAuto,
    indirectAuto,
    directAuto,
    directAutoPercent,
    firstLienMortgage,
    latitude: requiredNumber(record.latitude, 'latitude'),
    longitude: requiredNumber(record.longitude, 'longitude'),
    geocodeMatchType: requiredText(record.geocodeMatchType, 'geocodeMatchType'),
    geocodedAddress: requiredText(record.geocodedAddress, 'geocodedAddress'),
    geocoder: requiredText(record.geocodeProvider, 'geocodeProvider'),
    salesStatus: 'Client',
    customUpload: true,
    dataSource: requiredText(record.sourceProvider, 'sourceProvider'),
    sourceProviderAccountNumber: requiredText(
      record.sourceProviderAccountNumber,
      'sourceProviderAccountNumber'
    ),
    sourceReport: requiredText(record.sourceReport, 'sourceReport'),
    sourceReportDate: requiredText(record.sourceReportDate, 'sourceReportDate'),
    sourceFileName: requiredText(record.sourceFileName, 'sourceFileName'),
    reportCycle: cycle,
    history,
    ...buildReportGrowth(history)
  };
}

function loadCustomCreditUnions() {
  const parsed = JSON.parse(fs.readFileSync(customDataPath, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error('Custom credit-union data must be an array.');

  const mapped = parsed.map(mapCustomCreditUnion);
  const charters = new Set();
  mapped.forEach((creditUnion) => {
    if (charters.has(creditUnion.charterNumber)) {
      throw new Error(`Duplicate custom credit-union charter ${creditUnion.charterNumber}.`);
    }
    charters.add(creditUnion.charterNumber);
  });
  return mapped;
}

export const customCreditUnions = Object.freeze(loadCustomCreditUnions());

export function mergeCustomCreditUnionDirectory(directory = {}) {
  const mergedByCharter = new Map(
    (Array.isArray(directory.creditUnions) ? directory.creditUnions : [])
      .map((creditUnion) => [String(creditUnion?.charterNumber ?? '').trim(), creditUnion])
      .filter(([charterNumber]) => charterNumber)
  );

  customCreditUnions.forEach((creditUnion) => {
    mergedByCharter.set(creditUnion.charterNumber, creditUnion);
  });

  const creditUnions = [...mergedByCharter.values()].sort(
    (a, b) => String(a.state || '').localeCompare(String(b.state || ''))
      || (Number(b.assets) || 0) - (Number(a.assets) || 0)
      || String(a.name || '').localeCompare(String(b.name || ''))
  );

  return {
    ...directory,
    count: creditUnions.length,
    customCreditUnionCount: customCreditUnions.length,
    customCreditUnionSource: 'American Share Insurance',
    creditUnions
  };
}
