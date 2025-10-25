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
  const reports = [];

  for (const fileName of dataFiles) {
    const filePath = path.join(callReportsDir, fileName);
    try {
      const raw = await fsp.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const normalized = await normalizeReport(parsed, fileName, { rootDir });
      reports.push(normalized);
    } catch (error) {
      logger.error(`Failed to process ${fileName}: ${error.message}`);
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

function createIdFromFileName(fileName) {
  return fileName
    .replace(/\.json$/i, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
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
