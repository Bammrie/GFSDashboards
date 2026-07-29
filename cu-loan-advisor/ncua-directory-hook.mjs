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
  if (Array.isArray(input.tags)) {
    result.tags = input.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 25);
  }
  result.updatedAt = new Date().toISOString();
  return result;
}

function runSync() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [syncScriptPath], {
      cwd: repoRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || stdout.trim() || `NCUA sync exited with code ${code}`));
    });
  });
}

function registerRoutes(app) {
  if (app.locals.ncuaDirectoryRoutesInstalled) return;
  app.locals.ncuaDirectoryRoutesInstalled = true;

  app.get('/api/ncua-credit-unions', async (_req, res) => {
    const directory = await readJson(directoryPath, { generatedAt: null, cycle: null, count: 0, creditUnions: [] });
    const overrides = await readJson(overridesPath, {});
    const creditUnions = (directory.creditUnions || []).map((creditUnion) => ({
      ...creditUnion,
      salesStatus: 'Unreviewed',
      owner: '',
      notes: '',
      tags: [],
      hidden: false,
      ...(overrides[creditUnion.charterNumber] || {})
    }));
    res.json({ ...directory, count: creditUnions.length, creditUnions });
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
      res.json({ ok: true, message, count: directory.count || 0, generatedAt: directory.generatedAt || null, cycle: directory.cycle || null });
    } catch (error) {
      console.error('NCUA directory sync failed', error);
      res.status(500).json({ error: error.message || 'NCUA directory sync failed.' });
    }
  });
}

export function installNcuaDirectory(express) {
  const originalListen = express.application.listen;
  express.application.listen = function patchedListen(...args) {
    registerRoutes(this);
    return originalListen.apply(this, args);
  };
}
