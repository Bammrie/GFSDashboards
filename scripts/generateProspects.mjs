import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const callReportsDir = path.join(rootDir, 'CallReports');
const outputDataPath = path.join(rootDir, 'prospects-data.json');
const templatePath = path.join(rootDir, 'templates', 'prospect-page.html');
const outputPagesDir = path.join(rootDir, 'prospects');

async function main() {
  const files = await fs.readdir(callReportsDir);
  const dataFiles = files.filter((file) => file.toLowerCase().endsWith('.json'));

  const reports = [];
  for (const fileName of dataFiles) {
    const filePath = path.join(callReportsDir, fileName);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      const normalized = await normalizeReport(parsed, fileName);
      reports.push(normalized);
    } catch (error) {
      console.error(`Failed to process ${fileName}:`, error.message);
    }
  }

  reports.sort((a, b) => a.name.localeCompare(b.name));

  await writeAggregatedData(reports);
  await generateProspectPages(reports);
}

async function normalizeReport(report, fileName) {
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
    const pdfExists = await reportHasMatchingPdf(pdfCandidate);
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

async function reportHasMatchingPdf(pdfFileName) {
  try {
    await fs.access(path.join(callReportsDir, pdfFileName));
    return true;
  } catch (error) {
    return false;
  }
}

async function writeAggregatedData(reports) {
  const payload = {
    generatedAt: new Date().toISOString(),
    reports
  };
  await fs.writeFile(outputDataPath, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${reports.length} prospect records to prospects-data.json`);
}

async function generateProspectPages(reports) {
  const template = await fs.readFile(templatePath, 'utf8');
  await fs.mkdir(outputPagesDir, { recursive: true });

  const existing = await fs.readdir(outputPagesDir);
  await Promise.all(
    existing
      .filter((file) => file.toLowerCase().endsWith('.html'))
      .map((file) => fs.unlink(path.join(outputPagesDir, file)))
  );

  await Promise.all(
    reports.map(async (report) => {
      const html = applyTemplate(template, {
        '{{PROSPECT_ID}}': report.id,
        '{{PROSPECT_NAME}}': report.name
      });
      const outputPath = path.join(outputPagesDir, `${report.id}.html`);
      await fs.writeFile(outputPath, html);
      console.log(`Generated prospect page ${path.relative(rootDir, outputPath)}`);
    })
  );
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
