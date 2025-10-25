import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildProspectArtifacts } from './scripts/lib/prospectBuilder.mjs';

const fsp = fs.promises;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = __dirname;
const callReportsDir = path.join(publicDir, 'CallReports');
const templatesDir = path.join(publicDir, 'templates');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

await synchronizeProspects();
setupProspectWatchers();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const safePath = decodeURIComponent(url.pathname);
    const basePath = safePath.endsWith('/') ? `${safePath}index.html` : safePath;
    const resolvedPath = path.join(publicDir, basePath);

    if (!resolvedPath.startsWith(publicDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    let filePath = resolvedPath;
    let fileData;

    try {
      fileData = await fsp.readFile(filePath);
    } catch (error) {
      if (error.code === 'EISDIR') {
        filePath = path.join(filePath, 'index.html');
        fileData = await fsp.readFile(filePath);
      } else if (error.code === 'ENOENT' && !basePath.endsWith('index.html')) {
        filePath = path.join(publicDir, 'index.html');
        fileData = await fsp.readFile(filePath);
      } else {
        throw error;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] ?? 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fileData);
  } catch (error) {
    const message = error.code === 'ENOENT' ? 'Not Found' : 'Internal Server Error';
    const status = error.code === 'ENOENT' ? 404 : 500;
    res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(message);
    if (status === 500) {
      console.error('Server error:', error);
    }
  }
});

server.listen(port, () => {
  console.log(`GFS Dashboards server running at http://localhost:${port}`);
});

async function synchronizeProspects() {
  try {
    await buildProspectArtifacts({ rootDir: publicDir, logger: console });
  } catch (error) {
    console.error('Failed to synchronize call reports:', error);
  }
}

function setupProspectWatchers() {
  const scheduleSync = createSyncScheduler();

  if (fs.existsSync(callReportsDir)) {
    fs.watch(callReportsDir, { persistent: false }, () => scheduleSync());
  }

  if (fs.existsSync(templatesDir)) {
    fs.watch(templatesDir, { persistent: false }, () => scheduleSync());
  }
}

function createSyncScheduler() {
  let timer = null;
  let running = false;
  let queued = false;

  const run = async () => {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    try {
      await synchronizeProspects();
    } finally {
      running = false;
      if (queued) {
        queued = false;
        run();
      }
    }
  };

  return () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      timer = null;
      run();
    }, 250);
  };
}
