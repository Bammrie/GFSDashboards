import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const directoryPath = process.env.NCUA_DIRECTORY_STORAGE_PATH || path.join(repoRoot, 'data', 'ncua-active-credit-unions.json');
const overridesPath = process.env.NCUA_DIRECTORY_OVERRIDES_PATH || path.join(repoRoot, 'data', 'ncua-credit-union-overrides.json');
const syncScriptPath = path.join(repoRoot, 'scripts', 'sync-ncua-active-credit-unions.mjs');
const requiredSchemaVersion = 3;
const installMarker = Symbol.for('gfs.ncua-directory-hook-installed');
let syncPromise = null;

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') console.warn(`Unable to read ${filePath}`, error);
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

function sanitizeOverride(input = {}) {
  const allowedStatuses = new Set(['Unreviewed', 'Researching', 'Prospect', 'Contacted', 'Meeting Set', 'Client', 'Not a Fit']);
  const result = {};
  if (allowedStatuses.has(input.salesStatus)) result.salesStatus = input.salesStatus;
  if (typeof input.owner === 'string') result.owner = input.owner.trim().slice(0, 120);
  if (typeof input.notes === 'string') result.notes = input.notes.trim().slice(0, 10000);
  if (typeof input.hidden === 'boolean') result.hidden = input.hidden;
  if (Array.isArray(input.tags)) result.tags = input.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 25);
  result.updatedAt = new Date().toISOString();
  return result;
}

function runSync() {
  if (syncPromise) return syncPromise;
  syncPromise = new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [syncScriptPath], { cwd: repoRoot, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || stdout.trim() || `NCUA sync exited with code ${code}`));
    });
  }).finally(() => { syncPromise = null; });
  return syncPromise;
}

async function ensureDirectory() {
  const directory = await readJson(directoryPath, { count: 0, creditUnions: [] });
  const count = directory.count || directory.creditUnions?.length || 0;
  if (count >= 4000 && Number(directory.schemaVersion || 0) >= requiredSchemaVersion) return directory;
  await runSync();
  return readJson(directoryPath, { count: 0, creditUnions: [] });
}

function registerRoutes(app) {
  if (app.locals.ncuaDirectoryRoutesInstalled) return;
  app.locals.ncuaDirectoryRoutesInstalled = true;

  app.get('/api/ncua-credit-unions', async (_req, res) => {
    try {
      const directory = await ensureDirectory();
      const overrides = await readJson(overridesPath, {});
      const creditUnions = (directory.creditUnions || []).map((creditUnion) => ({
        ...creditUnion,
        salesStatus: 'Unreviewed', owner: '', notes: '', tags: [], hidden: false,
        ...(overrides[creditUnion.charterNumber] || {})
      }));
      res.json({ ...directory, count: creditUnions.length, creditUnions });
    } catch (error) {
      console.error('Unable to load NCUA directory', error);
      res.status(500).json({ error: error.message || 'Unable to load NCUA directory.' });
    }
  });

  app.patch('/api/ncua-credit-unions/:charterNumber', async (req, res) => {
    const charterNumber = String(req.params.charterNumber || '').trim();
    if (!charterNumber) return res.status(400).json({ error: 'Charter number is required.' });
    const overrides = await readJson(overridesPath, {});
    overrides[charterNumber] = { ...(overrides[charterNumber] || {}), ...sanitizeOverride(req.body || {}) };
    await writeJson(overridesPath, overrides);
    res.json({ charterNumber, ...overrides[charterNumber] });
  });

  app.post('/api/ncua-credit-unions/sync', async (_req, res) => {
    try {
      const message = await runSync();
      const directory = await readJson(directoryPath, { count: 0 });
      res.json({
        ok: true,
        message,
        count: directory.count || 0,
        generatedAt: directory.generatedAt || null,
        cycle: directory.cycle || null,
        historyCycles: directory.historyCycles || [],
        projectionYears: directory.projectionYears || 0
      });
    } catch (error) {
      console.error('NCUA directory sync failed', error);
      res.status(500).json({ error: error.message || 'NCUA directory sync failed.' });
    }
  });
}

function isCatchAllRoute(routePath) {
  if (routePath === '*' || routePath === '/*') return true;
  return Array.isArray(routePath) && routePath.some((item) => item === '*' || item === '/*');
}

export function installNcuaDirectory(express) {
  if (express.application[installMarker]) return;
  express.application[installMarker] = true;

  // The dashboard registers app.get('*') before app.listen(). Insert the NCUA
  // routes immediately before that fallback so API GETs are not served index.html.
  const originalGet = express.application.get;
  express.application.get = function patchedGet(routePath, ...handlers) {
    if (isCatchAllRoute(routePath)) registerRoutes(this);
    return originalGet.call(this, routePath, ...handlers);
  };

  const originalListen = express.application.listen;
  express.application.listen = function patchedListen(...args) {
    // Fallback for server entrypoints that do not define a catch-all route.
    registerRoutes(this);
    const server = originalListen.apply(this, args);
    ensureDirectory().then((directory) => {
      const historyLabel = Array.isArray(directory.historyCycles) && directory.historyCycles.length
        ? ` with history from ${directory.historyCycles[0]} through ${directory.historyCycles.at(-1)}`
        : '';
      console.log(`NCUA directory ready with ${directory.count || 0} records${historyLabel}.`);
    }).catch((error) => console.error('NCUA directory startup sync failed', error));
    return server;
  };
}
