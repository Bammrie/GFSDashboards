import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = __dirname;

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'adminpass';
const DASHBOARD_USERNAME = process.env.DASHBOARD_USERNAME || null;

app.use((req, res, next) => {
  const unauthorized = () => {
    res.setHeader('WWW-Authenticate', 'Basic realm="GFSDashboards"');
    res.status(401).send('Authentication required.');
  };

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    unauthorized();
    return;
  }

  const [scheme, credentials] = authHeader.split(' ');
  if (scheme !== 'Basic' || !credentials) {
    unauthorized();
    return;
  }

  let decoded = '';
  try {
    decoded = Buffer.from(credentials, 'base64').toString('utf8');
  } catch (error) {
    unauthorized();
    return;
  }

  const separatorIndex = decoded.indexOf(':');
  const username = separatorIndex >= 0 ? decoded.slice(0, separatorIndex) : '';
  const password = separatorIndex >= 0 ? decoded.slice(separatorIndex + 1) : '';

  if (DASHBOARD_USERNAME && username !== DASHBOARD_USERNAME) {
    unauthorized();
    return;
  }

  if (password !== DASHBOARD_PASSWORD) {
    unauthorized();
    return;
  }

  next();
});

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.static(publicDir));

const REVENUE_TYPES = ['Frontend', 'Backend', 'Commission'];
const REPORTING_START_YEAR = 2023;
const REPORTING_START_MONTH = 1;

const creditUnionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

creditUnionSchema.pre('validate', function preValidate(next) {
  if (this.name) {
    this.normalizedName = this.name.trim().toLowerCase();
  }
  next();
});

const incomeStreamSchema = new mongoose.Schema(
  {
    creditUnion: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditUnion', required: true },
    product: { type: String, required: true, trim: true },
    revenueType: { type: String, required: true, enum: REVENUE_TYPES }
  },
  { timestamps: true }
);

incomeStreamSchema.index({ creditUnion: 1, product: 1, revenueType: 1 }, { unique: true });

const revenueEntrySchema = new mongoose.Schema(
  {
    incomeStream: { type: mongoose.Schema.Types.ObjectId, ref: 'IncomeStream', required: true },
    year: { type: Number, required: true, min: 1900 },
    month: { type: Number, required: true, min: 1, max: 12 },
    amount: { type: Number, required: true, min: 0 },
    periodKey: { type: Number, required: true },
    reportedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

revenueEntrySchema.index({ incomeStream: 1, year: 1, month: 1 }, { unique: true });
revenueEntrySchema.index({ periodKey: 1 });

const reportingRequirementSchema = new mongoose.Schema(
  {
    incomeStream: { type: mongoose.Schema.Types.ObjectId, ref: 'IncomeStream', required: true },
    year: { type: Number, required: true, min: 1900 },
    month: { type: Number, required: true, min: 1, max: 12 },
    periodKey: { type: Number, required: true },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

reportingRequirementSchema.index({ incomeStream: 1, periodKey: 1 }, { unique: true });

const CreditUnion = mongoose.model('CreditUnion', creditUnionSchema);
const IncomeStream = mongoose.model('IncomeStream', incomeStreamSchema);
const RevenueEntry = mongoose.model('RevenueEntry', revenueEntrySchema);
const ReportingRequirement = mongoose.model('ReportingRequirement', reportingRequirementSchema);

const databaseReady = await initializeDatabase();

if (databaseReady) {
  await ensureReportingRequirementsForAllStreams();
}

if (!databaseReady) {
  console.warn(
    'Income dashboard API routes are disabled until the MONGODB_URI environment variable is configured.'
  );
}

app.use('/api', (req, res, next) => {
  if (!databaseReady) {
    res.status(503).json({
      error:
        'Database connection is not configured. Set the MONGODB_URI environment variable to enable income tracking APIs.'
    });
    return;
  }
  next();
});

app.get('/api/credit-unions', async (req, res, next) => {
  try {
    const creditUnions = await CreditUnion.find().sort({ name: 1 }).lean();
    res.json(
      creditUnions.map((creditUnion) => ({
        id: creditUnion._id.toString(),
        name: creditUnion.name
      }))
    );
  } catch (error) {
    next(error);
  }
});

app.post('/api/credit-unions', async (req, res, next) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    if (!name) {
      res.status(400).json({ error: 'Credit union name is required.' });
      return;
    }

    const existing = await CreditUnion.findOne({ normalizedName: name.toLowerCase() }).lean();
    if (existing) {
      res.status(409).json({ error: 'That credit union already exists.' });
      return;
    }

    const created = await CreditUnion.create({ name });
    res.status(201).json({ id: created._id.toString(), name: created.name });
  } catch (error) {
    next(error);
  }
});

app.get('/api/income-streams', async (req, res, next) => {
  try {
    const streams = await IncomeStream.find()
      .populate('creditUnion')
      .sort({ updatedAt: -1 })
      .lean();

    const streamIds = streams.map((stream) => stream._id);
    await ensureReportingRequirementsForStreams(streamIds);

    const lastReports = await RevenueEntry.aggregate([
      { $match: { incomeStream: { $in: streamIds } } },
      { $sort: { periodKey: -1, updatedAt: -1 } },
      {
        $group: {
          _id: '$incomeStream',
          amount: { $first: '$amount' },
          month: { $first: '$month' },
          year: { $first: '$year' }
        }
      }
    ]);

    const lastReportMap = new Map(
      lastReports.map((report) => [report._id.toString(), { amount: report.amount, month: report.month, year: report.year }])
    );

    const pendingCounts = await ReportingRequirement.aggregate([
      { $match: { incomeStream: { $in: streamIds } } },
      {
        $group: {
          _id: '$incomeStream',
          pending: {
            $sum: {
              $cond: [{ $ifNull: ['$completedAt', false] }, 0, 1]
            }
          }
        }
      }
    ]);

    const pendingMap = new Map(pendingCounts.map((item) => [item._id.toString(), item.pending]));

    const payload = streams.map((stream) => {
      const creditUnion = stream.creditUnion;
      const lastReport = lastReportMap.get(stream._id.toString());
      return {
        id: stream._id.toString(),
        creditUnionId: creditUnion?._id?.toString() ?? null,
        creditUnionName: creditUnion?.name ?? 'Unknown credit union',
        product: stream.product,
        revenueType: stream.revenueType,
        label: `${creditUnion?.name ?? 'Unknown'} – ${stream.product} (${stream.revenueType})`,
        updatedAt: stream.updatedAt,
        pendingCount: pendingMap.get(stream._id.toString()) ?? 0,
        lastReport: lastReport
          ? {
              amount: Number(lastReport.amount),
              month: lastReport.month,
              year: lastReport.year
            }
          : null
      };
    });

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

app.get('/api/income-streams/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Income stream not found.' });
      return;
    }

    const stream = await IncomeStream.findById(id).populate('creditUnion').lean();
    if (!stream) {
      res.status(404).json({ error: 'Income stream not found.' });
      return;
    }

    await ensureReportingRequirementsForStream(stream._id);

    const pendingCount = await ReportingRequirement.countDocuments({
      incomeStream: stream._id,
      completedAt: null
    });

    res.json({
      id: stream._id.toString(),
      creditUnionId: stream.creditUnion?._id?.toString() ?? null,
      creditUnionName: stream.creditUnion?.name ?? 'Unknown credit union',
      product: stream.product,
      revenueType: stream.revenueType,
      label: `${stream.creditUnion?.name ?? 'Unknown'} – ${stream.product} (${stream.revenueType})`,
      createdAt: stream.createdAt,
      updatedAt: stream.updatedAt,
      pendingCount
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/income-streams/:id/reporting-status', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Income stream not found.' });
      return;
    }

    const stream = await IncomeStream.findById(id).select('_id').lean();
    if (!stream) {
      res.status(404).json({ error: 'Income stream not found.' });
      return;
    }

    await ensureReportingRequirementsForStream(stream._id);

    const requirements = await ReportingRequirement.find({ incomeStream: stream._id })
      .sort({ periodKey: 1 })
      .lean();

    const entries = await RevenueEntry.find({ incomeStream: stream._id })
      .select('periodKey amount reportedAt')
      .lean();

    const entryMap = new Map(entries.map((entry) => [entry.periodKey, entry]));

    const months = requirements.map((requirement) => {
      const entry = entryMap.get(requirement.periodKey);
      return {
        key: `${requirement.year}-${String(requirement.month).padStart(2, '0')}`,
        year: requirement.year,
        month: requirement.month,
        label: formatMonthLabel(requirement.year, requirement.month),
        completed: Boolean(requirement.completedAt),
        completedAt: requirement.completedAt,
        amount: entry ? Number(entry.amount) : null
      };
    });

    const summary = {
      total: months.length,
      completed: months.filter((month) => month.completed).length,
      pending: months.filter((month) => !month.completed).length
    };

    res.json({ months, summary });
  } catch (error) {
    next(error);
  }
});

app.post('/api/income-streams', async (req, res, next) => {
  try {
    const creditUnionId = req.body?.creditUnionId;
    const product = typeof req.body?.product === 'string' ? req.body.product.trim() : '';
    const revenueType = typeof req.body?.revenueType === 'string' ? req.body.revenueType.trim() : '';

    if (!creditUnionId || !mongoose.Types.ObjectId.isValid(creditUnionId)) {
      res.status(400).json({ error: 'A valid credit union is required.' });
      return;
    }
    if (!product) {
      res.status(400).json({ error: 'Product is required.' });
      return;
    }
    if (!REVENUE_TYPES.includes(revenueType)) {
      res.status(400).json({ error: 'Revenue type must be Frontend, Backend, or Commission.' });
      return;
    }

    const creditUnion = await CreditUnion.findById(creditUnionId).lean();
    if (!creditUnion) {
      res.status(404).json({ error: 'Credit union not found.' });
      return;
    }

    const existing = await IncomeStream.findOne({
      creditUnion: creditUnionId,
      product,
      revenueType
    }).lean();

    if (existing) {
      res.status(409).json({ error: 'This income stream already exists.' });
      return;
    }

    const stream = await IncomeStream.create({
      creditUnion: creditUnionId,
      product,
      revenueType
    });

    await ensureReportingRequirementsForStream(stream._id);

    const pendingCount = await ReportingRequirement.countDocuments({
      incomeStream: stream._id,
      completedAt: null
    });

    res.status(201).json({
      id: stream._id.toString(),
      creditUnionId: creditUnionId,
      creditUnionName: creditUnion.name,
      product,
      revenueType,
      label: `${creditUnion.name} – ${product} (${revenueType})`,
      updatedAt: stream.updatedAt,
      pendingCount
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/revenue', async (req, res, next) => {
  try {
    const incomeStreamId = req.body?.incomeStreamId;
    const year = Number.parseInt(req.body?.year, 10);
    const month = Number.parseInt(req.body?.month, 10);
    const amount = Number(req.body?.amount);

    if (!incomeStreamId || !mongoose.Types.ObjectId.isValid(incomeStreamId)) {
      res.status(400).json({ error: 'A valid income stream is required.' });
      return;
    }
    if (!Number.isFinite(year) || year < 1900) {
      res.status(400).json({ error: 'Year is required.' });
      return;
    }
    if (!Number.isFinite(month) || month < 1 || month > 12) {
      res.status(400).json({ error: 'Month must be between 1 and 12.' });
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      res.status(400).json({ error: 'Amount must be a non-negative number.' });
      return;
    }

    const stream = await IncomeStream.findById(incomeStreamId).lean();
    if (!stream) {
      res.status(404).json({ error: 'Income stream not found.' });
      return;
    }

    const periodKey = year * 100 + month;

    await RevenueEntry.findOneAndUpdate(
      { incomeStream: incomeStreamId, year, month },
      {
        $set: {
          amount,
          periodKey,
          reportedAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await ReportingRequirement.updateOne(
      { incomeStream: incomeStreamId, periodKey },
      {
        $set: { completedAt: new Date() },
        $setOnInsert: {
          incomeStream: incomeStreamId,
          year,
          month,
          periodKey
        }
      },
      { upsert: true }
    );

    await IncomeStream.updateOne({ _id: incomeStreamId }, { updatedAt: new Date() });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/reports/summary', async (req, res, next) => {
  try {
    const start = parsePeriod(req.query.start);
    const end = parsePeriod(req.query.end);

    if (start && end && start.key > end.key) {
      res.status(400).json({ error: 'Start month must be before the end month.' });
      return;
    }

    const now = new Date();
    const defaultEnd = { year: now.getFullYear(), month: now.getMonth() + 1, key: (now.getFullYear()) * 100 + (now.getMonth() + 1) };
    const defaultStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const defaultStart = {
      year: defaultStartDate.getFullYear(),
      month: defaultStartDate.getMonth() + 1,
      key: defaultStartDate.getFullYear() * 100 + (defaultStartDate.getMonth() + 1)
    };

    const rangeStart = start ?? defaultStart;
    const rangeEnd = end ?? defaultEnd;

    const creditUnionId = typeof req.query.creditUnionId === 'string' ? req.query.creditUnionId.trim() : '';
    let incomeStreamFilter = null;

    if (creditUnionId && creditUnionId !== 'all') {
      if (!mongoose.Types.ObjectId.isValid(creditUnionId)) {
        res.status(400).json({ error: 'Invalid credit union selection.' });
        return;
      }

      const streams = await IncomeStream.find({ creditUnion: creditUnionId }).select('_id').lean();
      const streamIds = streams.map((stream) => stream._id);

      if (!streamIds.length) {
        const emptyTimeline = buildTimeline(rangeStart, rangeEnd, new Map());
        res.json({
          totalRevenue: 0,
          byCreditUnion: [],
          byProduct: [],
          byRevenueType: [],
          timeline: emptyTimeline
        });
        return;
      }

      incomeStreamFilter = streamIds;
    }

    const query = {
      periodKey: { $gte: rangeStart.key, $lte: rangeEnd.key }
    };

    if (incomeStreamFilter) {
      query.incomeStream = { $in: incomeStreamFilter };
    }

    const entries = await RevenueEntry.find(query)
      .populate({
        path: 'incomeStream',
        populate: { path: 'creditUnion' }
      })
      .sort({ periodKey: 1 })
      .lean();

    const byCreditUnion = new Map();
    const byProduct = new Map();
    const byRevenueType = new Map();
    const timelineMap = new Map();
    let totalRevenue = 0;

    entries.forEach((entry) => {
      const amount = Number(entry.amount) || 0;
      totalRevenue += amount;

      const incomeStream = entry.incomeStream;
      const creditUnionName = incomeStream?.creditUnion?.name ?? 'Unknown';
      const product = incomeStream?.product ?? 'Unknown product';
      const type = incomeStream?.revenueType ?? 'Unknown type';

      accumulate(byCreditUnion, creditUnionName, amount);
      accumulate(byProduct, product, amount);
      accumulate(byRevenueType, type, amount);

      const monthLabel = `${entry.year}-${String(entry.month).padStart(2, '0')}`;
      accumulate(timelineMap, monthLabel, amount);
    });

    const timeline = buildTimeline(rangeStart, rangeEnd, timelineMap);

    res.json({
      totalRevenue,
      byCreditUnion: sortAggregates(byCreditUnion),
      byProduct: sortAggregates(byProduct),
      byRevenueType: sortAggregates(byRevenueType),
      timeline
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Income dashboard running on http://localhost:${port}`);
});

function accumulate(map, key, value) {
  const previous = map.get(key) ?? 0;
  map.set(key, previous + value);
}

function sortAggregates(map) {
  return Array.from(map.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}

function parsePeriod(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }
  const [yearStr, monthStr] = value.split('-');
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return null;
  }
  return { year, month, key: year * 100 + month };
}

function buildTimeline(start, end, valueMap) {
  const timeline = [];
  let currentYear = start.year;
  let currentMonth = start.month;

  while (currentYear * 100 + currentMonth <= end.key) {
    const key = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const amount = Number(valueMap.get(key) ?? 0);
    const label = formatMonthLabel(currentYear, currentMonth);
    timeline.push({ key, label, amount });

    currentMonth += 1;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear += 1;
    }
  }

  return timeline;
}

function formatMonthLabel(year, month) {
  return new Date(year, month - 1, 1).toLocaleString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

async function ensureReportingRequirementsForAllStreams() {
  const streams = await IncomeStream.find().select('_id').lean();
  for (const stream of streams) {
    await ensureReportingRequirementsForStream(stream._id);
  }
}

async function ensureReportingRequirementsForStreams(streamIds) {
  if (!Array.isArray(streamIds) || !streamIds.length) {
    return;
  }
  for (const streamId of streamIds) {
    await ensureReportingRequirementsForStream(streamId);
  }
}

async function ensureReportingRequirementsForStream(streamId) {
  if (!streamId) return;

  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;

  const operations = [];
  let year = REPORTING_START_YEAR;
  let month = REPORTING_START_MONTH;

  while (year < endYear || (year === endYear && month <= endMonth)) {
    const periodKey = year * 100 + month;
    operations.push({
      updateOne: {
        filter: { incomeStream: streamId, periodKey },
        update: {
          $setOnInsert: {
            incomeStream: streamId,
            year,
            month,
            periodKey
          }
        },
        upsert: true
      }
    });

    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  if (operations.length) {
    await ReportingRequirement.bulkWrite(operations, { ordered: false });
  }
}

async function initializeDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI environment variable is not set.');
    console.warn('Starting the income dashboard without a MongoDB connection.');
    return false;
  }

  const options = {};
  if (process.env.MONGODB_DB) {
    options.dbName = process.env.MONGODB_DB;
  }

  try {
    await mongoose.connect(uri, options);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB.');
    console.error(error);
    return false;
  }
}

process.on('SIGINT', async () => {
  if (databaseReady) {
    await mongoose.disconnect();
  }
  process.exit(0);
});
