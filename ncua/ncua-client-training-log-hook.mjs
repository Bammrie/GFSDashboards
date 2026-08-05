import { createHash } from 'crypto';
import mongoose from 'mongoose';
import {
  ensureNcuaDirectory,
  resolveCreditUnionSalesStatus
} from './ncua-directory-hook.mjs';

const installMarker = Symbol.for('gfs.ncua-client-training-log-hook-installed');
const allowedTrainers = new Set(['Brady', 'Blake', 'Royce']);
const migrationVersion = 1;
let migrationPromise = null;

const directoryTrainingEntrySchema = new mongoose.Schema(
  {
    sourceId: { type: String, required: true, trim: true },
    source: { type: String, enum: ['legacy-accounts', 'clients'], required: true },
    trainer: { type: String, trim: true, required: true },
    visitDate: { type: Date, required: true },
    notes: { type: String, trim: true, required: true, maxlength: 30000 },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const directoryClientTrainingSchema = new mongoose.Schema(
  {
    charterNumber: { type: String, required: true, trim: true },
    salesStatus: { type: String, default: '' },
    trainingEntries: { type: [directoryTrainingEntrySchema], default: [] },
    trainingMigration: {
      version: { type: Number, default: migrationVersion },
      checkedAt: { type: Date, default: null }
    }
  },
  {
    timestamps: true,
    collection: 'ncua_directory_accounts',
    strict: false
  }
);

const NcuaDirectoryClientTraining = mongoose.models.NcuaDirectoryClientTraining
  || mongoose.model('NcuaDirectoryClientTraining', directoryClientTrainingSchema);

function requireMongo() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('MongoDB is not connected. Client training logs cannot be read or saved.');
    error.statusCode = 503;
    throw error;
  }
}

function normalizeCharterNumber(value) {
  return String(value ?? '').trim().replace(/\.0$/, '').replace(/^0+(?=\d)/, '');
}

function normalizedWords(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/\bf\.?\s*c\.?\s*u\.?\b/g, ' federal credit union ')
    .replace(/\bc\.?\s*u\.?\b/g, ' credit union ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function institutionIdentityKeys(value) {
  const full = normalizedWords(value);
  if (!full) return [];

  const withoutLeadingThe = full.replace(/^the\s+/, '');
  const withoutLegalSuffix = withoutLeadingThe
    .replace(/\s+(?:federal\s+)?credit\s+union$/, '')
    .trim();
  const withoutLegalWords = withoutLeadingThe
    .split(' ')
    .filter((word) => !['federal', 'credit', 'union'].includes(word))
    .join(' ')
    .trim();

  return [...new Set([
    full,
    withoutLeadingThe,
    withoutLegalSuffix,
    withoutLegalWords,
    withoutLegalSuffix.replace(/\s+/g, '')
  ].filter(Boolean))];
}

export function buildInstitutionIdentityIndex(creditUnions = []) {
  const index = new Map();
  creditUnions.forEach((creditUnion) => {
    const charterNumber = normalizeCharterNumber(creditUnion?.charterNumber);
    if (!charterNumber) return;
    institutionIdentityKeys(creditUnion?.name).forEach((key) => {
      if (!index.has(key)) index.set(key, new Set());
      index.get(key).add(charterNumber);
    });
  });
  return index;
}

export function resolveInstitutionCharter(accountName, identityIndex, preferredCharters = new Set()) {
  for (const key of institutionIdentityKeys(accountName)) {
    const candidates = [...(identityIndex.get(key) || [])];
    if (candidates.length === 1) return candidates[0];
    const preferred = candidates.filter((charterNumber) => preferredCharters.has(charterNumber));
    if (preferred.length === 1) return preferred[0];
  }
  return '';
}

function cleanLegacyText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function combineLegacyTrainingEntry(entry = {}) {
  const sections = [
    ['Encounter report', cleanLegacyText(entry.report)],
    ['What changed', cleanLegacyText(entry.changed)],
    ['Needs work / follow-up', cleanLegacyText(entry.needsWork)]
  ].filter(([, text]) => text);

  return sections.map(([label, text]) => `${label}\n${text}`).join('\n\n').slice(0, 30000);
}

function legacySourceId(log, entry, index) {
  if (entry?._id) return `legacy-accounts:${log._id}:${entry._id}`;
  const fingerprint = createHash('sha256')
    .update(JSON.stringify({
      logId: String(log?._id || ''),
      index,
      trainer: entry?.trainer,
      visitDate: entry?.visitDate,
      report: entry?.report,
      changed: entry?.changed,
      needsWork: entry?.needsWork
    }))
    .digest('hex')
    .slice(0, 24);
  return `legacy-accounts:${log._id}:${fingerprint}`;
}

function validDate(value) {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function serializeEntry(entry) {
  return {
    id: String(entry?._id || entry?.sourceId || ''),
    source: entry?.source || 'clients',
    trainer: entry?.trainer || '',
    visitDate: entry?.visitDate || null,
    notes: entry?.notes || '',
    createdAt: entry?.createdAt || null
  };
}

function serializeAccount(record) {
  const entries = (Array.isArray(record?.trainingEntries) ? record.trainingEntries : [])
    .map(serializeEntry)
    .sort((a, b) => {
      const visitDelta = new Date(b.visitDate || 0).getTime() - new Date(a.visitDate || 0).getTime();
      if (visitDelta) return visitDelta;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  return {
    charterNumber: normalizeCharterNumber(record?.charterNumber),
    entries
  };
}

function directoryStatusByCharter(directory) {
  return new Map(
    (Array.isArray(directory?.creditUnions) ? directory.creditUnions : [])
      .map((creditUnion) => [
        normalizeCharterNumber(creditUnion?.charterNumber),
        resolveCreditUnionSalesStatus('', creditUnion?.salesStatus)
      ])
      .filter(([charterNumber, salesStatus]) => charterNumber && salesStatus)
  );
}

async function repairDirectoryDefinedClientStatuses(directory) {
  const charterNumbers = [...directoryStatusByCharter(directory)]
    .filter(([, salesStatus]) => salesStatus === 'Client')
    .map(([charterNumber]) => charterNumber);
  if (!charterNumbers.length) return 0;

  const result = await NcuaDirectoryClientTraining.updateMany(
    {
      charterNumber: { $in: charterNumbers },
      $or: [
        { salesStatus: { $exists: false } },
        { salesStatus: null },
        { salesStatus: '' }
      ]
    },
    { $set: { salesStatus: 'Client' } }
  );
  return Number(result.modifiedCount || 0);
}

async function migrateLegacyTrainingLogs(directory) {
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    await repairDirectoryDefinedClientStatuses(directory);
    const AccountTrainingLog = mongoose.models.AccountTrainingLog;
    const CreditUnion = mongoose.models.CreditUnion;
    if (!AccountTrainingLog || !CreditUnion) {
      return { legacyAccounts: 0, legacyEntries: 0, migratedEntries: 0, unmatchedAccounts: [] };
    }

    const legacyLogs = await AccountTrainingLog.find({ 'entries.0': { $exists: true } }).lean();
    if (!legacyLogs.length) {
      return { legacyAccounts: 0, legacyEntries: 0, migratedEntries: 0, unmatchedAccounts: [] };
    }

    const creditUnionIds = [...new Set(legacyLogs.map((log) => String(log.creditUnion || '')).filter(Boolean))];
    const [legacyAccounts, currentClients] = await Promise.all([
      CreditUnion.find({ _id: { $in: creditUnionIds } }).select('name').lean(),
      NcuaDirectoryClientTraining.find({ salesStatus: 'Client' }).select('charterNumber').lean()
    ]);
    const accountNames = new Map(legacyAccounts.map((account) => [String(account._id), account.name]));
    const preferredCharters = new Set(currentClients.map((record) => normalizeCharterNumber(record.charterNumber)).filter(Boolean));
    const identityIndex = buildInstitutionIdentityIndex(directory?.creditUnions || []);
    const defaultStatuses = directoryStatusByCharter(directory);
    const entriesByCharter = new Map();
    const unmatchedAccounts = [];
    let legacyEntries = 0;

    legacyLogs.forEach((log) => {
      const entries = Array.isArray(log.entries) ? log.entries : [];
      legacyEntries += entries.length;
      const accountName = accountNames.get(String(log.creditUnion || '')) || '';
      const charterNumber = resolveInstitutionCharter(accountName, identityIndex, preferredCharters);
      if (!charterNumber) {
        unmatchedAccounts.push({ accountName: accountName || 'Unknown legacy account', entryCount: entries.length });
        return;
      }

      if (!entriesByCharter.has(charterNumber)) entriesByCharter.set(charterNumber, []);
      entries.forEach((entry, index) => {
        const trainer = cleanLegacyText(entry?.trainer) || 'Unassigned';
        const visitDate = validDate(entry?.visitDate || entry?.createdAt);
        const notes = combineLegacyTrainingEntry(entry);
        if (!visitDate || !notes) return;
        entriesByCharter.get(charterNumber).push({
          sourceId: legacySourceId(log, entry, index),
          source: 'legacy-accounts',
          trainer,
          visitDate,
          notes,
          createdAt: validDate(entry?.createdAt) || visitDate
        });
      });
    });

    const targetCharters = [...entriesByCharter.keys()];
    const existingRecords = targetCharters.length
      ? await NcuaDirectoryClientTraining.find({ charterNumber: { $in: targetCharters } })
        .select('charterNumber trainingEntries.sourceId')
        .lean()
      : [];
    const existingSourcesByCharter = new Map(existingRecords.map((record) => [
      normalizeCharterNumber(record.charterNumber),
      new Set((record.trainingEntries || []).map((entry) => entry?.sourceId).filter(Boolean))
    ]));

    let migratedEntries = 0;
    for (const [charterNumber, entries] of entriesByCharter) {
      const insertDefaults = { charterNumber };
      const directoryStatus = defaultStatuses.get(charterNumber);
      if (directoryStatus) insertDefaults.salesStatus = directoryStatus;
      await NcuaDirectoryClientTraining.updateOne(
        { charterNumber },
        {
          $setOnInsert: insertDefaults,
          $set: { 'trainingMigration.version': migrationVersion, 'trainingMigration.checkedAt': new Date() }
        },
        { upsert: true, setDefaultsOnInsert: true }
      );

      const existingSources = existingSourcesByCharter.get(charterNumber) || new Set();
      for (const entry of entries.filter((candidate) => !existingSources.has(candidate.sourceId))) {
        const result = await NcuaDirectoryClientTraining.updateOne(
          { charterNumber, 'trainingEntries.sourceId': { $ne: entry.sourceId } },
          { $push: { trainingEntries: entry } }
        );
        migratedEntries += Number(result.modifiedCount || 0);
        existingSources.add(entry.sourceId);
      }
    }

    return {
      legacyAccounts: legacyLogs.length,
      legacyEntries,
      migratedEntries,
      unmatchedAccounts
    };
  })().finally(() => {
    migrationPromise = null;
  });

  return migrationPromise;
}

function registerRoutes(app) {
  if (app.locals.ncuaClientTrainingLogRoutesInstalled) return;
  app.locals.ncuaClientTrainingLogRoutesInstalled = true;

  app.get('/api/ncua-client-training-log', async (_req, res) => {
    try {
      requireMongo();
      const directory = await ensureNcuaDirectory();
      const migration = await migrateLegacyTrainingLogs(directory);
      const records = await NcuaDirectoryClientTraining.find({ 'trainingEntries.0': { $exists: true } })
        .select('charterNumber trainingEntries')
        .lean();

      res.setHeader('Cache-Control', 'no-store');
      res.json({
        accounts: records.map(serializeAccount).filter((record) => record.charterNumber),
        migration
      });
    } catch (error) {
      console.error('Unable to load NCUA client training logs', error);
      res.status(error?.statusCode || 500).json({ error: error.message || 'Unable to load client training logs.' });
    }
  });

  app.post('/api/ncua-client-training-log/:charterNumber', async (req, res) => {
    try {
      requireMongo();
      const charterNumber = normalizeCharterNumber(req.params.charterNumber);
      const trainer = cleanLegacyText(req.body?.trainer);
      const visitDate = validDate(req.body?.visitDate);
      const notes = cleanLegacyText(req.body?.notes).slice(0, 30000);

      if (!charterNumber) {
        res.status(400).json({ error: 'Charter number is required.' });
        return;
      }
      if (!allowedTrainers.has(trainer) || !visitDate || !notes) {
        res.status(400).json({ error: 'Trainer (Brady/Blake/Royce), visit date, and update notes are required.' });
        return;
      }

      const [directory, client] = await Promise.all([
        ensureNcuaDirectory(),
        NcuaDirectoryClientTraining.findOne({ charterNumber })
          .select('charterNumber salesStatus')
          .lean()
      ]);
      const directoryClient = (directory.creditUnions || []).find(
        (creditUnion) => normalizeCharterNumber(creditUnion?.charterNumber) === charterNumber
      );
      const effectiveStatus = resolveCreditUnionSalesStatus(
        client?.salesStatus,
        directoryClient?.salesStatus
      );
      if (effectiveStatus !== 'Client') {
        res.status(404).json({ error: 'This credit union is not currently classified as a Client.' });
        return;
      }

      const entryId = new mongoose.Types.ObjectId();
      const entry = {
        _id: entryId,
        sourceId: `clients:${entryId}`,
        source: 'clients',
        trainer,
        visitDate,
        notes,
        createdAt: new Date()
      };
      const updated = await NcuaDirectoryClientTraining.findOneAndUpdate(
        { charterNumber },
        {
          $setOnInsert: { charterNumber },
          $set: { salesStatus: 'Client' },
          $push: { trainingEntries: entry }
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      ).lean();

      res.setHeader('Cache-Control', 'no-store');
      res.json(serializeAccount(updated));
    } catch (error) {
      console.error('Unable to save NCUA client training log', error);
      res.status(error?.statusCode || 500).json({ error: error.message || 'Unable to save client training log.' });
    }
  });
}

function isCatchAllRoute(routePath) {
  if (routePath === '*' || routePath === '/*') return true;
  return Array.isArray(routePath) && routePath.some((item) => item === '*' || item === '/*');
}

export function installNcuaClientTrainingLog(express) {
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
    return originalListen.apply(this, args);
  };
}
