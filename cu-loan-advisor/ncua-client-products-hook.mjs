import mongoose from 'mongoose';

const installMarker = Symbol.for('gfs.ncua-client-products-hook-installed');
const clientProductOptions = Object.freeze(['MOB Coverage', 'GAP', 'VSC', 'CPI']);
const allowedClientProducts = new Set(clientProductOptions);

const directoryClientProductSchema = new mongoose.Schema(
  {
    charterNumber: { type: String, required: true, trim: true },
    clientProducts: {
      type: [{ type: String, enum: clientProductOptions }],
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

function serializeClientProducts(record) {
  return {
    charterNumber: normalizeCharterNumber(record?.charterNumber),
    clientProducts: sanitizeClientProducts(record?.clientProducts),
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
        .select('charterNumber clientProducts updatedAt')
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

export { clientProductOptions, sanitizeClientProducts };
