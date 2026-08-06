import mongoose from 'mongoose';

const installMarker = Symbol.for('gfs.ncua-client-products-hook-installed');
const clientProductOptions = Object.freeze(['MOB Coverage', 'GAP', 'VSC', 'CPI']);
const allowedClientProducts = new Set(clientProductOptions);
const productionFields = Object.freeze([
  Object.freeze({ product: 'MOB Coverage', field: 'mobPremiumCollected', integer: false }),
  Object.freeze({ product: 'GAP', field: 'gapPoliciesSold', integer: true }),
  Object.freeze({ product: 'VSC', field: 'vscPoliciesSold', integer: true })
]);

const clientProductProductionSchema = new mongoose.Schema(
  {
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    mobPremiumCollected: { type: Number, min: 0 },
    gapPoliciesSold: { type: Number, min: 0, validate: Number.isInteger },
    vscPoliciesSold: { type: Number, min: 0, validate: Number.isInteger },
    updatedAt: { type: Date, required: true, default: Date.now }
  },
  { _id: false }
);

const directoryClientProductSchema = new mongoose.Schema(
  {
    charterNumber: { type: String, required: true, trim: true },
    clientProducts: {
      type: [{ type: String, enum: clientProductOptions }],
      default: []
    },
    clientProductProduction: {
      type: [clientProductProductionSchema],
      default: []
    }
  },
  {
    timestamps: true,
    collection: 'ncua_directory_accounts',
    strict: false
  }
);

const NcuaDirectoryClientProduct = mongoose.models.NcuaDirectoryClientProduct
  || mongoose.model('NcuaDirectoryClientProduct', directoryClientProductSchema);

function requireMongo() {
  if (mongoose.connection.readyState !== 1) {
    const error = new Error('MongoDB is not connected. Client products cannot be read or saved.');
    error.statusCode = 503;
    throw error;
  }
}

function normalizeCharterNumber(value) {
  return String(value ?? '').trim().replace(/\.0$/, '').replace(/^0+(?=\d)/, '');
}

function sanitizeClientProducts(value) {
  if (!Array.isArray(value)) return [];
  const requested = new Set(
    value
      .map((product) => String(product ?? '').trim())
      .filter((product) => allowedClientProducts.has(product))
  );
  return clientProductOptions.filter((product) => requested.has(product));
}

function normalizeProductionMonth(value) {
  const month = String(value ?? '').trim();
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : '';
}

function sanitizeProductionEntry(value) {
  const month = normalizeProductionMonth(value?.month);
  if (!month) return null;

  const entry = { month };
  productionFields.forEach(({ field, integer }) => {
    if (value?.[field] === null || value?.[field] === undefined || value?.[field] === '') return;
    const numericValue = Number(value?.[field]);
    if (!Number.isFinite(numericValue) || numericValue < 0 || (integer && !Number.isInteger(numericValue))) return;
    entry[field] = integer ? numericValue : Math.round((numericValue + Number.EPSILON) * 100) / 100;
  });
  if (!productionFields.some(({ field }) => Object.hasOwn(entry, field))) return null;

  const updatedAt = value?.updatedAt ? new Date(value.updatedAt) : null;
  entry.updatedAt = updatedAt && Number.isFinite(updatedAt.getTime()) ? updatedAt : null;
  return entry;
}

function sanitizeProductionEntries(value) {
  const byMonth = new Map();
  (Array.isArray(value) ? value : []).forEach((candidate) => {
    const entry = sanitizeProductionEntry(candidate);
    if (entry) byMonth.set(entry.month, entry);
  });
  return [...byMonth.values()].sort((a, b) => b.month.localeCompare(a.month));
}

function mergeProductionEntry(existingEntries, month, values, updatedAt = new Date()) {
  const normalizedMonth = normalizeProductionMonth(month);
  if (!normalizedMonth) throw new TypeError('A valid production month is required.');

  const currentEntries = sanitizeProductionEntries(existingEntries);
  const existing = currentEntries.find((entry) => entry.month === normalizedMonth) || { month: normalizedMonth };
  const merged = {
    ...existing,
    ...values,
    month: normalizedMonth,
    updatedAt
  };
  return sanitizeProductionEntries([
    ...currentEntries.filter((entry) => entry.month !== normalizedMonth),
    merged
  ]);
}

function serializeClientProducts(record) {
  return {
    charterNumber: normalizeCharterNumber(record?.charterNumber),
    clientProducts: sanitizeClientProducts(record?.clientProducts),
    clientProductProduction: sanitizeProductionEntries(record?.clientProductProduction),
    updatedAt: record?.updatedAt || null
  };
}

function registerRoutes(app) {
  if (app.locals.ncuaClientProductRoutesInstalled) return;
  app.locals.ncuaClientProductRoutesInstalled = true;

  app.get('/api/ncua-client-products', async (_req, res) => {
    try {
      requireMongo();
      const records = await NcuaDirectoryClientProduct.find({
        clientProducts: { $exists: true }
      })
        .select('charterNumber clientProducts clientProductProduction updatedAt')
        .lean();

      const accounts = records
        .map(serializeClientProducts)
        .filter((record) => record.charterNumber && record.clientProducts.length)
        .sort((a, b) => a.charterNumber.localeCompare(b.charterNumber, undefined, { numeric: true }));

      res.setHeader('Cache-Control', 'no-store');
      res.json({ productOptions: clientProductOptions, accounts });
    } catch (error) {
      console.error('Unable to load NCUA client products', error);
      res.status(error?.statusCode || 500).json({ error: error.message || 'Unable to load client products.' });
    }
  });

  app.patch('/api/ncua-client-products/:charterNumber', async (req, res) => {
    try {
      requireMongo();
      const charterNumber = normalizeCharterNumber(req.params.charterNumber);
      if (!charterNumber) {
        res.status(400).json({ error: 'Charter number is required.' });
        return;
      }
      if (!Array.isArray(req.body?.clientProducts)) {
        res.status(400).json({ error: 'clientProducts must be an array.' });
        return;
      }

      const clientProducts = sanitizeClientProducts(req.body.clientProducts);
      const saved = await NcuaDirectoryClientProduct.findOneAndUpdate(
        { charterNumber },
        {
          $setOnInsert: { charterNumber },
          $set: { clientProducts }
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
          lean: true
        }
      );

      res.setHeader('Cache-Control', 'no-store');
      res.json(serializeClientProducts(saved));
    } catch (error) {
      console.error('Unable to save NCUA client products', error);
      res.status(error?.statusCode || 500).json({ error: error.message || 'Unable to save client products.' });
    }
  });

  app.put('/api/ncua-client-products/:charterNumber/production/:month', async (req, res) => {
    try {
      requireMongo();
      const charterNumber = normalizeCharterNumber(req.params.charterNumber);
      const month = normalizeProductionMonth(req.params.month);
      if (!charterNumber) {
        res.status(400).json({ error: 'Charter number is required.' });
        return;
      }
      if (!month) {
        res.status(400).json({ error: 'Production month must use YYYY-MM format.' });
        return;
      }

      const record = await NcuaDirectoryClientProduct.findOne({ charterNumber })
        .select('charterNumber clientProducts clientProductProduction')
        .lean();
      if (!record) {
        res.status(404).json({ error: 'Select a client product before saving production.' });
        return;
      }

      const selectedProducts = new Set(sanitizeClientProducts(record.clientProducts));
      const values = {};
      for (const { product, field, integer } of productionFields) {
        if (!Object.hasOwn(req.body || {}, field)) continue;
        if (!selectedProducts.has(product)) {
          res.status(400).json({ error: `${product} must be selected before its production can be saved.` });
          return;
        }
        if (req.body[field] === null || req.body[field] === '') {
          res.status(400).json({ error: `${field} must contain a production number.` });
          return;
        }
        const numericValue = Number(req.body[field]);
        if (!Number.isFinite(numericValue) || numericValue < 0 || (integer && !Number.isInteger(numericValue))) {
          const description = integer ? 'a whole number of policies' : 'a non-negative dollar amount';
          res.status(400).json({ error: `${field} must be ${description}.` });
          return;
        }
        values[field] = integer ? numericValue : Math.round((numericValue + Number.EPSILON) * 100) / 100;
      }

      if (!Object.keys(values).length) {
        res.status(400).json({ error: 'Enter at least one production number.' });
        return;
      }

      const clientProductProduction = mergeProductionEntry(
        record.clientProductProduction,
        month,
        values,
        new Date()
      );
      const saved = await NcuaDirectoryClientProduct.findOneAndUpdate(
        { charterNumber },
        { $set: { clientProductProduction } },
        { new: true, runValidators: true, lean: true }
      );

      res.setHeader('Cache-Control', 'no-store');
      res.json(serializeClientProducts(saved));
    } catch (error) {
      console.error('Unable to save NCUA client product production', error);
      res.status(error?.statusCode || 500).json({ error: error.message || 'Unable to save client product production.' });
    }
  });
}

function isCatchAllRoute(routePath) {
  if (routePath === '*' || routePath === '/*') return true;
  return Array.isArray(routePath) && routePath.some((item) => item === '*' || item === '/*');
}

export function installNcuaClientProducts(express) {
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

export {
  clientProductOptions,
  mergeProductionEntry,
  normalizeProductionMonth,
  sanitizeClientProducts,
  sanitizeProductionEntries
};
