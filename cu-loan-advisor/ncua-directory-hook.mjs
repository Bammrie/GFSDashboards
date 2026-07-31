import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { gzipSync, gunzipSync } from 'zlib';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const directoryPath = process.env.NCUA_DIRECTORY_STORAGE_PATH || path.join(repoRoot, 'data', 'ncua-active-credit-unions.json');
const legacyOverridesPath = process.env.NCUA_DIRECTORY_OVERRIDES_PATH || path.join(repoRoot, 'data', 'ncua-credit-union-overrides.json');
const syncScriptPath = path.join(repoRoot, 'scripts', 'sync-ncua-directory-with-geocodes.mjs');
const requiredSchemaVersion = 4;
const installMarker = Symbol.for('gfs.ncua-directory-hook-installed');
const allowedStatuses = new Set(['', 'Radar', 'Prospect', 'Client', 'Off-Limits']);
const snapshotKey = 'active-directory';
const snapshotEncoding = 'gzip-json-v1';
const maxCompressedSnapshotBytes = 14 * 1024 * 1024;
let syncPromise = null;
let legacyMigrationPromise = null;
let directoryLoadPromise = null;
let directoryCache = null;
let snapshotSaveQueue = Promise.resolve();

const directoryAccountSchema = new mongoose.Schema(
  {
    charterNumber: { type: String, required: true, unique: true, immutable: true, index: true, trim: true },
    salesStatus: { type: String, enum: ['', 'Radar', 'Prospect', 'Client', 'Off-Limits'], default: '', index: true },
    notes: { type: String, default: '', maxlength: 10000 },
    tags: [{ type: String, trim: true, maxlength: 120 }]
  },
  { timestamps: true, collection: 'ncua_directory_accounts' }
);

const directorySnapshotSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true, default: snapshotKey },
    schemaVersion: { type: Number, required: true },
    generatedAt: { type: Date, default: null },
    cycle: { type: String, default: null },
    count: { type: Number, required: true, default: 0 },
    payloadEncoding: { type: String, default: null },
    payloadGzip: { type: Buffer, default: null },
    payloadBytes: { type: Number, default: null },
    compressedBytes: { type: Number, default: null },
    payload: { type: mongoose.Schema.Types.Mixed, default: undefined }
  },
  { timestamps: true, collection: 'ncua_directory_snapshots', minimize: false }
);

const NcuaDirectoryAccount = mongoose.models.NcuaDirectoryAccount
  || mongoose.model('NcuaDirectoryAccount', directoryAccountSchema);
const NcuaDirectorySnapshot = mongoose.models.NcuaDirectorySnapshot
  || mongoose.model('NcuaDirectorySnapshot', directorySnapshotSchema);

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') console.warn(`Unable to read ${filePath}`, error);
    return fallback;
  }
}

function directoryIsReady(directory) {
  const count = Number(directory?.count || directory?.creditUnions?.length || 0);
  return count >= 4000 && Number(directory?.schemaVersion || 0) >= requiredSchemaVersion;
}

function sanitizeAccount(input = {}) {
  const salesStatus = typeof input.salesStatus === 'string' ? input.salesStatus.trim() : '';
  return {
    salesStatus: allowedStatuses.has(salesStatus) ? salesStatus : '',
    notes: typeof input.notes === 'string' ? input.notes.trim().slice(0, 10000) : '',
    tags: Array.isArray(input.tags)
      ? [...new Set(input.tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 25)
      : []
  };
}

function mapLegacyStatus(value) {
  const status = String(value || '').trim();
  if (allowedStatuses.has(status)) return status;
  if (status === 'Client') return 'Client';
  if (status === 'Prospect' || status === 'Contacted' || status === 'Meeting Set') return 'Prospect';
  if (status === 'Researching') return 'Radar';
  if (status === 'Not a Fit') return 'Off-Limits';
  return '';
}

function requireMongo() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('MongoDB is not connected. Directory data cannot be read or saved.');
    error.statusCode = 503;
    throw error;
  }
}

async function migrateLegacyOverrides() {
  requireMongo();
  if (legacyMigrationPromise) return legacyMigrationPromise;
  legacyMigrationPromise = (async () => {
    const legacy = await readJson(legacyOverridesPath, {});
    const entries = Object.entries(legacy || {}).filter(([charterNumber]) => String(charterNumber || '').trim());
    if (!entries.length) return 0;

    const operations = entries.map(([charterNumber, value]) => {
      const sanitized = sanitizeAccount({
        salesStatus: mapLegacyStatus(value?.salesStatus),
        notes: value?.notes,
        tags: value?.tags
      });
      return {
        updateOne: {
          filter: { charterNumber: String(charterNumber).trim() },
          update: { $setOnInsert: { charterNumber: String(charterNumber).trim() }, $set: sanitized },
          upsert: true
        }
      };
    });
    await NcuaDirectoryAccount.bulkWrite(operations, { ordered: false });
    console.log(`Migrated ${operations.length} legacy NCUA directory account records into MongoDB.`);
    return operations.length;
  })().finally(() => {
    legacyMigrationPromise = null;
  });
  return legacyMigrationPromise;
}

function mongoBuffer(value) {
  if (!value) return null;
  if (Buffer.isBuffer(value)) return value;
  if (Array.isArray(value?.data)) return Buffer.from(value.data);
  const source = value?.buffer ?? value;
  return Buffer.isBuffer(source) ? source : Buffer.from(source);
}

async function readStoredDirectory() {
  requireMongo();
  const snapshot = await NcuaDirectorySnapshot.findOne({ key: snapshotKey }).lean();
  if (!snapshot) return null;

  if (snapshot.payloadEncoding === snapshotEncoding && snapshot.payloadGzip) {
    try {
      const compressed = mongoBuffer(snapshot.payloadGzip);
      const directory = JSON.parse(gunzipSync(compressed).toString('utf8'));
      if (directoryIsReady(directory)) return { directory, format: snapshotEncoding };
      console.warn('Stored NCUA directory snapshot is incomplete and will be rebuilt.');
    } catch (error) {
      console.error('Unable to decode the stored NCUA directory snapshot.', error);
    }
  }

  if (snapshot.payload && directoryIsReady(snapshot.payload)) {
    return { directory: snapshot.payload, format: 'legacy-json' };
  }

  return null;
}

async function saveStoredDirectoryNow(directory) {
  requireMongo();
  if (!directoryIsReady(directory)) throw new Error('Refusing to persist an incomplete NCUA directory snapshot.');

  const serialized = Buffer.from(JSON.stringify(directory));
  const compressed = gzipSync(serialized);
  if (compressed.length > maxCompressedSnapshotBytes) {
    throw new Error(`Compressed NCUA directory snapshot is too large to store safely (${compressed.length} bytes).`);
  }

  await NcuaDirectorySnapshot.findOneAndUpdate(
    { key: snapshotKey },
    {
      $set: {
        schemaVersion: Number(directory.schemaVersion || requiredSchemaVersion),
        generatedAt: directory.generatedAt ? new Date(directory.generatedAt) : null,
        cycle: directory.cycle || null,
        count: Number(directory.count || directory.creditUnions?.length || 0),
        payloadEncoding: snapshotEncoding,
        payloadGzip: compressed,
        payloadBytes: serialized.length,
        compressedBytes: compressed.length
      },
      $unset: { payload: 1 },
      $setOnInsert: { key: snapshotKey }
    },
    { upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  directoryCache = directory;
  console.log(`Stored compressed NCUA directory snapshot (${serialized.length} bytes -> ${compressed.length} bytes).`);
  return directory;
}

function saveStoredDirectory(directory) {
  const pendingSave = snapshotSaveQueue.then(() => saveStoredDirectoryNow(directory));
  snapshotSaveQueue = pendingSave.catch(() => undefined);
  return pendingSave;
}

async function persistDirectorySafely(directory, context) {
  try {
    await saveStoredDirectory(directory);
    return true;
  } catch (error) {
    console.error(`Unable to persist ${context}; continuing with the available directory data.`, error);
    return false;
  }
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

async function rebuildDirectory() {
  const message = await runSync();
  const directory = await readJson(directoryPath, { count: 0, creditUnions: [] });
  if (!directoryIsReady(directory)) throw new Error('NCUA sync completed without a complete directory dataset.');
  directoryCache = directory;
  const persisted = await persistDirectorySafely(directory, 'the synchronized NCUA directory snapshot');
  return { directory, message, persisted };
}

async function loadDirectory() {
  try {
    const stored = await readStoredDirectory();
    if (stored?.directory) {
      directoryCache = stored.directory;
      if (stored.format === 'legacy-json') {
        void persistDirectorySafely(stored.directory, 'the legacy NCUA directory snapshot migration');
      }
      return stored.directory;
    }
  } catch (error) {
    console.error('Unable to read the stored NCUA directory snapshot; checking local data instead.', error);
  }

  const localDirectory = await readJson(directoryPath, { count: 0, creditUnions: [] });
  if (directoryIsReady(localDirectory)) {
    directoryCache = localDirectory;
    await persistDirectorySafely(localDirectory, 'the local NCUA directory snapshot');
    return localDirectory;
  }

  const rebuilt = await rebuildDirectory();
  return rebuilt.directory;
}

async function ensureDirectory() {
  if (directoryIsReady(directoryCache)) return directoryCache;
  if (directoryLoadPromise) return directoryLoadPromise;
  directoryLoadPromise = loadDirectory().finally(() => { directoryLoadPromise = null; });
  return directoryLoadPromise;
}

function registerRoutes(app) {
  if (app.locals.ncuaDirectoryRoutesInstalled) return;
  app.locals.ncuaDirectoryRoutesInstalled = true;

  app.get('/api/ncua-credit-unions', async (_req, res) => {
    try {
      requireMongo();
      await migrateLegacyOverrides();
      const [directory, savedAccounts] = await Promise.all([
        ensureDirectory(),
        NcuaDirectoryAccount.find().lean()
      ]);
      const savedByCharter = new Map(savedAccounts.map((record) => [record.charterNumber, record]));
      const creditUnions = (directory.creditUnions || []).map((creditUnion) => {
        const saved = savedByCharter.get(String(creditUnion.charterNumber));
        return {
          ...creditUnion,
          salesStatus: saved?.salesStatus || '',
          notes: saved?.notes || '',
          tags: Array.isArray(saved?.tags) ? saved.tags : []
        };
      });
      res.setHeader('Cache-Control', 'private, max-age=60, stale-while-revalidate=300');
      res.json({ ...directory, count: creditUnions.length, creditUnions });
    } catch (error) {
      console.error('Unable to load NCUA directory', error);
      res.status(error?.statusCode || 500).json({ error: error.message || 'Unable to load NCUA directory.' });
    }
  });

  app.patch('/api/ncua-credit-unions/:charterNumber', async (req, res) => {
    try {
      requireMongo();
      const charterNumber = String(req.params.charterNumber || '').trim();
      if (!charterNumber) return res.status(400).json({ error: 'Charter number is required.' });
      const account = sanitizeAccount(req.body || {});
      const saved = await NcuaDirectoryAccount.findOneAndUpdate(
        { charterNumber },
        { $setOnInsert: { charterNumber }, $set: account },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true, lean: true }
      );
      res.json({
        charterNumber: saved.charterNumber,
        salesStatus: saved.salesStatus || '',
        notes: saved.notes || '',
        tags: Array.isArray(saved.tags) ? saved.tags : [],
        updatedAt: saved.updatedAt || null
      });
    } catch (error) {
      console.error('Unable to save NCUA directory account', error);
      res.status(error?.statusCode || 500).json({ error: error.message || 'Unable to save directory account.' });
    }
  });

  app.post('/api/ncua-credit-unions/sync', async (_req, res) => {
    try {
      const { message, directory, persisted } = await rebuildDirectory();
      res.json({
        ok: true,
        persisted,
        message,
        count: directory.count || 0,
        generatedAt: directory.generatedAt || null,
        cycle: directory.cycle || null,
        historyCycles: directory.historyCycles || [],
        projectionYears: directory.projectionYears || 0,
        geocodedCount: directory.geocodedCount || 0
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

  const originalGet = express.application.get;
  express.application.get = function patchedGet(routePath, ...handlers) {
    if (isCatchAllRoute(routePath)) registerRoutes(this);
    return originalGet.call(this, routePath, ...handlers);
  };

  const originalListen = express.application.listen;
  express.application.listen = function patchedListen(...args) {
    registerRoutes(this);
    const server = originalListen.apply(this, args);
    ensureDirectory().then((directory) => {
      const historyLabel = Array.isArray(directory.historyCycles) && directory.historyCycles.length
        ? ` with history from ${directory.historyCycles[0]} through ${directory.historyCycles.at(-1)}`
        : '';
      const mapLabel = directory.geocodedCount ? ` and ${directory.geocodedCount} mapped addresses` : '';
      console.log(`NCUA directory ready with ${directory.count || 0} records${historyLabel}${mapLabel}.`);
    }).catch((error) => console.error('NCUA directory startup preparation failed', error));
    return server;
  };
}
