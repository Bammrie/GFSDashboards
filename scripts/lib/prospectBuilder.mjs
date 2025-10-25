import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const fsp = fs.promises;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultRootDir = path.resolve(__dirname, '..', '..');

export async function loadProspectReports({ rootDir = defaultRootDir, logger = console } = {}) {
  const callReportsDir = path.join(rootDir, 'CallReports');
  let files;
  try {
    files = await fsp.readdir(callReportsDir);
  } catch (error) {
    throw new Error(`Unable to read CallReports directory: ${error.message}`);
  }

  const dataFiles = files.filter((file) => file.toLowerCase().endsWith('.json')).sort();
  const pdfFiles = files.filter((file) => file.toLowerCase().endsWith('.pdf')).sort();
  const reports = [];
  const referencedPdfFiles = new Set();

  for (const fileName of dataFiles) {
    const filePath = path.join(callReportsDir, fileName);
    try {
      const raw = await fsp.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const normalized = await normalizeReport(parsed, fileName, { rootDir });
      reports.push(normalized);
      if (normalized.callReportFile) {
        referencedPdfFiles.add(normalized.callReportFile.toLowerCase());
      }
    } catch (error) {
      logger.error(`Failed to process ${fileName}: ${error.message}`);
    }
  }

  for (const fileName of pdfFiles) {
    if (referencedPdfFiles.has(fileName.toLowerCase())) continue;
    try {
      const stub = createStubReportFromPdf(fileName);
      reports.push(stub);
      referencedPdfFiles.add(fileName.toLowerCase());
      logger.info?.(`Created placeholder prospect for ${stub.name} (PDF only)`);
    } catch (error) {
      logger.error(`Failed to derive placeholder from ${fileName}: ${error.message}`);
    }
  }

  reports.sort((a, b) => a.name.localeCompare(b.name));
  return reports;
}

export async function buildProspectArtifacts({
  rootDir = defaultRootDir,
  logger = console,
  writePages = true
} = {}) {
  const outputDataPath = path.join(rootDir, 'prospects-data.json');
  const templatePath = path.join(rootDir, 'templates', 'prospect-page.html');
  const outputPagesDir = path.join(rootDir, 'prospects');

  const reports = await loadProspectReports({ rootDir, logger });
  await writeAggregatedData(reports, outputDataPath);

  let generatedPages = 0;
  if (writePages) {
    generatedPages = await generateProspectPages(reports, templatePath, outputPagesDir, rootDir, logger);
  }

  logger.info?.(`Synchronized ${reports.length} prospect record${reports.length === 1 ? '' : 's'}.`);
  return { reports, outputDataPath, generatedPages };
}

async function normalizeReport(report, fileName, { rootDir }) {
  if (!report || typeof report !== 'object') {
    throw new Error('Call report JSON must be an object');
  }

  if (!report.id) {
    report.id = createIdFromFileName(fileName);
  }

  if (!report.name) {
    throw new Error('Call report JSON must include a "name" field');
  }

  const result = { ...report };
  if (report.callReportFile) {
    result.callReportUrl = path.posix.join('CallReports', report.callReportFile);
  } else {
    const pdfCandidate = fileName.replace(/\.json$/i, '.pdf');
    const pdfExists = await reportHasMatchingPdf(pdfCandidate, rootDir);
    if (pdfExists) {
      result.callReportUrl = path.posix.join('CallReports', pdfCandidate);
      result.callReportFile = pdfCandidate;
    }
  }

  return result;
}

function createStubReportFromPdf(fileName) {
  const parsed = parseCallReportFileName(fileName);
  const id = createIdFromFileName(fileName);
  const callReportUrl = path.posix.join('CallReports', fileName);

  return {
    id,
    name: parsed.name,
    charter: parsed.charter || '',
    asOf: parsed.asOf,
    periodMonths: parsed.periodMonths,
    totalAssets: 0,
    totalLoans: 0,
    loanCount: 0,
    allowance: 0,
    accruedInterestLoans: 0,
    loansGrantedYtdCount: 0,
    loansGrantedYtdAmount: 0,
    interestOnLoansYtd: 0,
    creditLossExpenseLoansYtd: 0,
    delinquencyTotal60Plus: 0,
    delinquencyTotal60PlusLoans: 0,
    nonAccrualLoans: 0,
    bankruptcyOutstanding: 0,
    tdrLoans: 0,
    tdrBalance: 0,
    delinquencySources: {},
    indirect: createEmptyIndirectBreakdown(),
    loanMix: createEmptyLoanMix(),
    delinquency60PlusDetail: {},
    chargeOffs: { total: { chargeOffs: 0, recoveries: 0 } },
    riskHighlights: [],
    insights: [
      'Upload the matching JSON extract for this call report to populate consumer lending analytics and opportunity modeling.'
    ],
    callReportFile: fileName,
    callReportUrl,
    dataStatus: 'call-report-pdf-only'
  };
}

function createIdFromFileName(fileName) {
  return fileName
    .replace(/\.json$/i, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

function parseCallReportFileName(fileName) {
  const base = fileName.replace(/\.pdf$/i, '').trim();
  const withoutPrefix = base.replace(/^callreport5300[_-]?/i, '').trim();
  if (!withoutPrefix) {
    return {
      name: titleCase(base.replace(/[-_]+/g, ' ')),
      asOf: '',
      periodMonths: null,
      charter: ''
    };
  }

  const segments = withoutPrefix.split('_');
  let periodToken = '';
  let nameSegments = segments;
  if (segments.length > 1) {
    periodToken = segments.shift();
    nameSegments = segments;
  }

  const nameRaw = nameSegments.join(' ').replace(/[-_]+/g, ' ').trim();
  const { asOf, periodMonths } = parsePeriodToken(periodToken);

  return {
    name: nameRaw ? titleCase(nameRaw) : titleCase(base.replace(/[-_]+/g, ' ')),
    asOf,
    periodMonths,
    charter: ''
  };
}

function parsePeriodToken(token = '') {
  const match = token.match(/^([A-Za-z]+)[-\s]?([0-9]{4})$/);
  if (!match) {
    return { asOf: '', periodMonths: null };
  }

  const [, monthNameRaw, yearRaw] = match;
  const monthLookup = createMonthLookup();
  const monthInfo = monthLookup[monthNameRaw.toLowerCase()] || null;
  if (!monthInfo) {
    return { asOf: `${titleCase(monthNameRaw)} ${yearRaw}`, periodMonths: null };
  }

  const day = monthInfo.days;
  const asOf = `${monthInfo.label} ${day}, ${yearRaw}`;
  return { asOf, periodMonths: monthInfo.number };
}

function createMonthLookup() {
  return {
    january: { number: 1, days: 31, label: 'January' },
    february: { number: 2, days: 28, label: 'February' },
    march: { number: 3, days: 31, label: 'March' },
    april: { number: 4, days: 30, label: 'April' },
    may: { number: 5, days: 31, label: 'May' },
    june: { number: 6, days: 30, label: 'June' },
    july: { number: 7, days: 31, label: 'July' },
    august: { number: 8, days: 31, label: 'August' },
    september: { number: 9, days: 30, label: 'September' },
    october: { number: 10, days: 31, label: 'October' },
    november: { number: 11, days: 30, label: 'November' },
    december: { number: 12, days: 31, label: 'December' }
  };
}

function createEmptyLoanMix() {
  const labels = {
    creditCard: 'Unsecured credit card',
    student: 'Non-federally guaranteed student',
    otherUnsecured: 'All other unsecured',
    newVehicle: 'New vehicle',
    usedVehicle: 'Used vehicle',
    leases: 'Leases receivable',
    otherSecured: 'Other secured non-real estate',
    firstMortgage: '1st lien residential real estate',
    juniorMortgage: 'Junior lien residential real estate',
    otherNonCommercialRE: 'Other non-commercial real estate',
    commercialRE: 'Commercial real estate',
    commercialOther: 'Commercial & industrial'
  };

  return Object.fromEntries(
    Object.entries(labels).map(([key, label]) => [key, { label, count: 0, balance: 0, rate: 0 }])
  );
}

function createEmptyIndirectBreakdown() {
  return {
    auto: { count: 0, balance: 0 },
    other: { count: 0, balance: 0 },
    total: { count: 0, balance: 0 }
  };
}

const ALWAYS_UPPERCASE_TOKENS = new Set(['FCU', 'CU', 'CUSO', 'LLC', 'INC', 'USA', 'US', 'N.A.', 'NA']);

function titleCase(value = '') {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (!word.length) return word;
      const normalized = word.replace(/[^A-Za-z0-9.]/g, '');
      const upper = word.toUpperCase();
      if (upper === word) {
        if (ALWAYS_UPPERCASE_TOKENS.has(normalized.toUpperCase())) {
          return upper;
        }
        if (normalized.toUpperCase().endsWith('FCU')) {
          return upper;
        }
        if (normalized.length <= 3) {
          return upper;
        }
      }
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

async function reportHasMatchingPdf(pdfFileName, rootDir) {
  const callReportsDir = path.join(rootDir, 'CallReports');
  try {
    await fsp.access(path.join(callReportsDir, pdfFileName));
    return true;
  } catch (error) {
    return false;
  }
}

async function writeAggregatedData(reports, outputDataPath) {
  const payload = {
    generatedAt: new Date().toISOString(),
    reports
  };
  await fsp.writeFile(outputDataPath, JSON.stringify(payload, null, 2));
}

async function generateProspectPages(reports, templatePath, outputPagesDir, rootDir, logger) {
  let template;
  try {
    template = await fsp.readFile(templatePath, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read prospect template: ${error.message}`);
  }

  await fsp.mkdir(outputPagesDir, { recursive: true });

  const existing = await fsp.readdir(outputPagesDir);
  await Promise.all(
    existing
      .filter((file) => file.toLowerCase().endsWith('.html'))
      .map((file) => fsp.unlink(path.join(outputPagesDir, file)))
  );

  await Promise.all(
    reports.map(async (report) => {
      const html = applyTemplate(template, {
        '{{PROSPECT_ID}}': report.id,
        '{{PROSPECT_NAME}}': report.name
      });
      const outputPath = path.join(outputPagesDir, `${report.id}.html`);
      await fsp.writeFile(outputPath, html);
      logger.info?.(`Generated prospect page ${path.relative(rootDir, outputPath)}`);
    })
  );

  return reports.length;
}

function applyTemplate(template, replacements) {
  let result = template;
  for (const [token, value] of Object.entries(replacements)) {
    const escapedValue = escapeHtml(String(value));
    result = result.split(token).join(escapedValue);
  }
  return result;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
