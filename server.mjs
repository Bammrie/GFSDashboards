import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import pdfParse from 'pdf-parse';
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
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

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
    revenueType: { type: String, required: true, enum: REVENUE_TYPES },
    status: { type: String, enum: ['active', 'prospect'], default: 'active', index: true },
    monthlyIncomeEstimate: { type: Number, default: null },
    firstReportYear: { type: Number, min: 1900, default: null },
    firstReportMonth: { type: Number, min: 1, max: 12, default: null },
    firstReportPeriodKey: { type: Number, default: null },
    finalReportYear: { type: Number, min: 1900, default: null },
    finalReportMonth: { type: Number, min: 1, max: 12, default: null },
    finalReportPeriodKey: { type: Number, default: null },
    canceledAt: { type: Date, default: null }
  },
  { timestamps: true }
);

incomeStreamSchema.index({ creditUnion: 1, product: 1, revenueType: 1 }, { unique: true });

const revenueEntrySchema = new mongoose.Schema(
  {
    incomeStream: { type: mongoose.Schema.Types.ObjectId, ref: 'IncomeStream', required: true },
    year: { type: Number, required: true, min: 1900 },
    month: { type: Number, required: true, min: 1, max: 12 },
    amount: { type: Number, required: true },
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
const callReportSchema = new mongoose.Schema(
  {
    creditUnion: { type: mongoose.Schema.Types.ObjectId, ref: 'CreditUnion', required: true },
    reportDate: { type: Date, required: true },
    periodYear: { type: Number, required: true },
    periodMonth: { type: Number, required: true },
    assetSize: { type: Number, default: null },
    netInterestIncome: { type: Number, default: null },
    totalNonInterestIncome: { type: Number, default: null },
    netIncomeYtd: { type: Number, default: null },
    averageMonthlyNetIncome: { type: Number, default: null },
    indirectLoans: { type: Number, default: null },
    outstandingIndirectLoans: { type: Number, default: null },
    totalLoans: {
      count: { type: Number, default: null },
      amount: { type: Number, default: null }
    },
    loansGrantedYtd: {
      count: { type: Number, default: null },
      amount: { type: Number, default: null },
      monthlyAverage: { type: Number, default: null }
    },
    loanSegments: [
      {
        label: { type: String, required: true },
        count: { type: Number, default: null },
        amount: { type: Number, default: null }
      }
    ],
    loanData: [
      {
        label: { type: String, required: true },
        figures: { type: [Number], default: [] }
      }
    ],
    sourceName: { type: String, default: null },
    extractedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

callReportSchema.index({ creditUnion: 1, periodYear: 1, periodMonth: 1 });
callReportSchema.index({ creditUnion: 1, extractedAt: -1 });

const CallReport = mongoose.model('CallReport', callReportSchema);

const databaseReady = await initializeDatabase();

if (databaseReady) {
  await backfillIncomeStreamStatuses();
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
    const requestedStatus = req.query.status === 'prospect' ? 'prospect' : 'active';
    const statusFilter =
      requestedStatus === 'active' ? { $in: ['active', null] } : { $in: ['prospect'] };

    const streams = await IncomeStream.find({ status: statusFilter })
      .populate('creditUnion')
      .sort({ updatedAt: -1 })
      .lean();

    const streamIds = streams.map((stream) => stream._id);
    if (requestedStatus === 'active') {
      await ensureReportingRequirementsForStreams(streamIds);
    }

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

    const reportingCounts = await ReportingRequirement.aggregate([
      { $match: { incomeStream: { $in: streamIds } } },
      {
        $group: {
          _id: '$incomeStream',
          pending: {
            $sum: {
              $cond: [{ $ifNull: ['$completedAt', false] }, 0, 1]
            }
          },
          completed: {
            $sum: {
              $cond: [{ $ifNull: ['$completedAt', false] }, 1, 0]
            }
          }
        }
      }
    ]);

    const reportingCountMap = new Map(
      reportingCounts.map((item) => [item._id.toString(), { pending: item.pending, completed: item.completed }])
    );

    const payload = streams.map((stream) => {
      const creditUnion = stream.creditUnion;
      const lastReport = lastReportMap.get(stream._id.toString());
      const finalReport =
        stream.finalReportPeriodKey && stream.finalReportYear && stream.finalReportMonth
          ? {
              year: stream.finalReportYear,
              month: stream.finalReportMonth,
              periodKey: stream.finalReportPeriodKey,
              label: formatMonthLabel(stream.finalReportYear, stream.finalReportMonth)
            }
          : null;
      const firstReport = buildFirstReportPayload(stream);
      const reportingCount = reportingCountMap.get(stream._id.toString()) ?? { pending: 0, completed: 0 };

      const normalizedStatus = stream.status ?? 'active';

      return {
        id: stream._id.toString(),
        creditUnionId: creditUnion?._id?.toString() ?? null,
        creditUnionName: creditUnion?.name ?? 'Unknown credit union',
        product: stream.product,
        revenueType: stream.revenueType,
        status: normalizedStatus,
        monthlyIncomeEstimate: stream.monthlyIncomeEstimate,
        label: `${creditUnion?.name ?? 'Unknown'} – ${stream.product} (${stream.revenueType})`,
        updatedAt: stream.updatedAt,
        pendingCount: reportingCount.pending,
        reportedCount: reportingCount.completed,
        firstReport,
        lastReport: lastReport
          ? {
              amount: Number(lastReport.amount),
              month: lastReport.month,
              year: lastReport.year
            }
          : null,
        finalReport,
        canceledAt: stream.canceledAt
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

    let pendingCount = 0;
    let reportedCount = 0;
    if (stream.status === 'active') {
      await ensureReportingRequirementsForStream(stream._id);

      pendingCount = await ReportingRequirement.countDocuments({
        incomeStream: stream._id,
        completedAt: null
      });

      reportedCount = await ReportingRequirement.countDocuments({
        incomeStream: stream._id,
        completedAt: { $ne: null }
      });
    }

    const finalReport =
      stream.finalReportPeriodKey && stream.finalReportYear && stream.finalReportMonth
        ? {
            year: stream.finalReportYear,
            month: stream.finalReportMonth,
            periodKey: stream.finalReportPeriodKey,
            label: formatMonthLabel(stream.finalReportYear, stream.finalReportMonth)
          }
        : null;
    const firstReport = buildFirstReportPayload(stream);

    res.json({
      id: stream._id.toString(),
      creditUnionId: stream.creditUnion?._id?.toString() ?? null,
      creditUnionName: stream.creditUnion?.name ?? 'Unknown credit union',
      product: stream.product,
      revenueType: stream.revenueType,
      status: stream.status,
      monthlyIncomeEstimate: stream.monthlyIncomeEstimate,
      label: `${stream.creditUnion?.name ?? 'Unknown'} – ${stream.product} (${stream.revenueType})`,
      createdAt: stream.createdAt,
      updatedAt: stream.updatedAt,
      pendingCount,
      reportedCount,
      firstReport,
      finalReport,
      canceledAt: stream.canceledAt
    });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/income-streams/:id/cancel', async (req, res, next) => {
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

    const finalMonthValue = typeof req.body?.finalMonth === 'string' ? req.body.finalMonth : '';
    const finalPeriod = parsePeriod(finalMonthValue);
    if (!finalPeriod) {
      res.status(400).json({ error: 'Select a valid final month (YYYY-MM).' });
      return;
    }

    const minimumPeriodKey = REPORTING_START_YEAR * 100 + REPORTING_START_MONTH;
    if (finalPeriod.key < minimumPeriodKey) {
      res.status(400).json({ error: 'Final month cannot be before the tracking start in Jan 2023.' });
      return;
    }

    const now = new Date();
    const currentPeriodKey = now.getFullYear() * 100 + (now.getMonth() + 1);
    if (finalPeriod.key > currentPeriodKey) {
      res.status(400).json({ error: 'Final month cannot be in the future.' });
      return;
    }

    const latestEntry = await RevenueEntry.findOne({ incomeStream: stream._id })
      .sort({ periodKey: -1 })
      .lean();

    if (latestEntry && latestEntry.periodKey > finalPeriod.key) {
      res.status(400).json({
        error: `Revenue has already been reported through ${formatMonthLabel(
          latestEntry.year,
          latestEntry.month
        )}. Adjust or remove those entries before selecting an earlier final month.`
      });
      return;
    }

    const updatedStream = await IncomeStream.findByIdAndUpdate(
      stream._id,
      {
        $set: {
          finalReportYear: finalPeriod.year,
          finalReportMonth: finalPeriod.month,
          finalReportPeriodKey: finalPeriod.key,
          canceledAt: new Date()
        }
      },
      { new: true }
    )
      .populate('creditUnion')
      .lean();

    await ensureReportingRequirementsForStream(stream._id);

    const pendingCount = await ReportingRequirement.countDocuments({
      incomeStream: stream._id,
      completedAt: null
    });

    const reportedCount = await ReportingRequirement.countDocuments({
      incomeStream: stream._id,
      completedAt: { $ne: null }
    });

    const finalReport =
      updatedStream.finalReportPeriodKey &&
      updatedStream.finalReportYear &&
      updatedStream.finalReportMonth
        ? {
            year: updatedStream.finalReportYear,
            month: updatedStream.finalReportMonth,
            periodKey: updatedStream.finalReportPeriodKey,
            label: formatMonthLabel(updatedStream.finalReportYear, updatedStream.finalReportMonth)
          }
        : null;

    res.json({
      id: updatedStream._id.toString(),
      creditUnionId: updatedStream.creditUnion?._id?.toString() ?? null,
      creditUnionName: updatedStream.creditUnion?.name ?? 'Unknown credit union',
      product: updatedStream.product,
      revenueType: updatedStream.revenueType,
      label: `${updatedStream.creditUnion?.name ?? 'Unknown'} – ${updatedStream.product} (${updatedStream.revenueType})`,
      createdAt: updatedStream.createdAt,
      updatedAt: updatedStream.updatedAt,
      pendingCount,
      reportedCount,
      finalReport,
      canceledAt: updatedStream.canceledAt
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

    const stream = await IncomeStream.findById(id).select('_id status').lean();
    if (!stream) {
      res.status(404).json({ error: 'Income stream not found.' });
      return;
    }

    if (stream.status !== 'active') {
      res.status(400).json({ error: 'Prospect income streams cannot be tracked for reporting yet.' });
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

app.patch('/api/income-streams/:id/estimate', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Income stream not found.' });
      return;
    }

    const rawEstimate = req.body?.monthlyIncomeEstimate;
    const estimate = rawEstimate === null ? null : Number(rawEstimate);
    if (rawEstimate === undefined) {
      res.status(400).json({ error: 'Monthly income estimate is required.' });
      return;
    }
    if (estimate !== null && !Number.isFinite(estimate)) {
      res.status(400).json({ error: 'Monthly income estimate must be a valid number.' });
      return;
    }

    const updatedStream = await IncomeStream.findByIdAndUpdate(
      id,
      { $set: { monthlyIncomeEstimate: estimate, updatedAt: new Date() } },
      { new: true }
    )
      .populate('creditUnion')
      .lean();

    if (!updatedStream) {
      res.status(404).json({ error: 'Income stream not found.' });
      return;
    }

    res.json({
      id: updatedStream._id.toString(),
      creditUnionId: updatedStream.creditUnion?._id?.toString() ?? null,
      creditUnionName: updatedStream.creditUnion?.name ?? 'Unknown credit union',
      product: updatedStream.product,
      revenueType: updatedStream.revenueType,
      status: updatedStream.status,
      monthlyIncomeEstimate: updatedStream.monthlyIncomeEstimate,
      label: `${updatedStream.creditUnion?.name ?? 'Unknown'} – ${updatedStream.product} (${updatedStream.revenueType})`,
      updatedAt: updatedStream.updatedAt
    });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/income-streams/:id/activate', async (req, res, next) => {
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

    if (stream.status === 'active') {
      res.status(400).json({ error: 'This income stream is already active.' });
      return;
    }

    const firstReportInput = typeof req.body?.firstReportMonth === 'string' ? req.body.firstReportMonth.trim() : '';
    const requestedFirstReport = firstReportInput ? parseReportingMonth(firstReportInput) : null;
    if (firstReportInput && !requestedFirstReport) {
      res.status(400).json({ error: 'First reporting month must be in YYYY-MM format.' });
      return;
    }

    const existingFirstReport =
      stream.firstReportYear && stream.firstReportMonth
        ? {
            year: stream.firstReportYear,
            month: stream.firstReportMonth,
            periodKey: stream.firstReportPeriodKey || stream.firstReportYear * 100 + stream.firstReportMonth
          }
        : null;
    const defaultFirstReport = {
      year: REPORTING_START_YEAR,
      month: REPORTING_START_MONTH,
      periodKey: REPORTING_START_YEAR * 100 + REPORTING_START_MONTH
    };
    const appliedFirstReport = requestedFirstReport ?? existingFirstReport ?? defaultFirstReport;

    const updatedStream = await IncomeStream.findByIdAndUpdate(
      stream._id,
      {
        $set: {
          status: 'active',
          canceledAt: null,
          finalReportYear: null,
          finalReportMonth: null,
          finalReportPeriodKey: null,
          firstReportYear: appliedFirstReport.year,
          firstReportMonth: appliedFirstReport.month,
          firstReportPeriodKey: appliedFirstReport.periodKey,
          updatedAt: new Date()
        }
      },
      { new: true }
    )
      .populate('creditUnion')
      .lean();

    await ensureReportingRequirementsForStream(updatedStream._id);

    const pendingCount = await ReportingRequirement.countDocuments({
      incomeStream: updatedStream._id,
      completedAt: null
    });

    const reportedCount = await ReportingRequirement.countDocuments({
      incomeStream: updatedStream._id,
      completedAt: { $ne: null }
    });

    res.json({
      id: updatedStream._id.toString(),
      creditUnionId: updatedStream.creditUnion?._id?.toString() ?? null,
      creditUnionName: updatedStream.creditUnion?.name ?? 'Unknown credit union',
      product: updatedStream.product,
      revenueType: updatedStream.revenueType,
      status: updatedStream.status,
      monthlyIncomeEstimate: updatedStream.monthlyIncomeEstimate,
      label: `${updatedStream.creditUnion?.name ?? 'Unknown'} – ${updatedStream.product} (${updatedStream.revenueType})`,
      updatedAt: updatedStream.updatedAt,
      pendingCount,
      reportedCount,
      firstReport: buildFirstReportPayload(updatedStream)
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/income-streams', async (req, res, next) => {
  try {
    const creditUnionId = req.body?.creditUnionId;
    const product = typeof req.body?.product === 'string' ? req.body.product.trim() : '';
    const revenueType = typeof req.body?.revenueType === 'string' ? req.body.revenueType.trim() : '';
    const status = req.body?.status === 'prospect' ? 'prospect' : 'active';
    const monthlyIncomeEstimate =
      req.body?.monthlyIncomeEstimate !== undefined && req.body?.monthlyIncomeEstimate !== null
        ? Number(req.body.monthlyIncomeEstimate)
        : null;
    const firstReportInput = typeof req.body?.firstReportMonth === 'string' ? req.body.firstReportMonth.trim() : '';
    const requestedFirstReport = firstReportInput ? parseReportingMonth(firstReportInput) : null;

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
    if (!['active', 'prospect'].includes(status)) {
      res.status(400).json({ error: 'Status must be active or prospect.' });
      return;
    }
    if (monthlyIncomeEstimate !== null && !Number.isFinite(monthlyIncomeEstimate)) {
      res.status(400).json({ error: 'Monthly income estimate must be a valid number.' });
      return;
    }

    if (firstReportInput && !requestedFirstReport) {
      res.status(400).json({ error: 'First reporting month must be in YYYY-MM format.' });
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

    const streamData = {
      creditUnion: creditUnionId,
      product,
      revenueType,
      status,
      monthlyIncomeEstimate
    };

    if (status === 'active') {
      const defaultFirstReport = {
        year: REPORTING_START_YEAR,
        month: REPORTING_START_MONTH,
        periodKey: REPORTING_START_YEAR * 100 + REPORTING_START_MONTH
      };
      const appliedFirstReport = requestedFirstReport ?? defaultFirstReport;
      Object.assign(streamData, {
        firstReportYear: appliedFirstReport.year,
        firstReportMonth: appliedFirstReport.month,
        firstReportPeriodKey: appliedFirstReport.periodKey
      });
    }

    const stream = await IncomeStream.create(streamData);

    let pendingCount = 0;
    let reportedCount = 0;
    if (status === 'active') {
      await ensureReportingRequirementsForStream(stream._id);

      pendingCount = await ReportingRequirement.countDocuments({
        incomeStream: stream._id,
        completedAt: null
      });

      reportedCount = await ReportingRequirement.countDocuments({
        incomeStream: stream._id,
        completedAt: { $ne: null }
      });
    }

    res.status(201).json({
      id: stream._id.toString(),
      creditUnionId: creditUnionId,
      creditUnionName: creditUnion.name,
      product,
      revenueType,
      status: stream.status,
      monthlyIncomeEstimate: stream.monthlyIncomeEstimate,
      label: `${creditUnion.name} – ${product} (${revenueType})`,
      updatedAt: stream.updatedAt,
      pendingCount,
      reportedCount,
      firstReport: buildFirstReportPayload(stream)
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
    if (!Number.isFinite(amount)) {
      res.status(400).json({ error: 'Amount must be a valid number.' });
      return;
    }

    const stream = await IncomeStream.findById(incomeStreamId).lean();
    if (!stream) {
      res.status(404).json({ error: 'Income stream not found.' });
      return;
    }

    if (stream.status !== 'active') {
      res.status(400).json({ error: 'Activate this income stream before logging revenue.' });
      return;
    }

    const periodKey = year * 100 + month;

    if (stream.finalReportPeriodKey && periodKey > stream.finalReportPeriodKey) {
      res.status(400).json({
        error: `This income stream was canceled after ${formatMonthLabel(
          stream.finalReportYear,
          stream.finalReportMonth
        )}. Update the final month before reporting additional revenue.`
      });
      return;
    }

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

      const streams = await IncomeStream.find({ creditUnion: creditUnionId, status: 'active' })
        .select('_id')
        .lean();
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
      const creditUnionId = incomeStream?.creditUnion?._id?.toString?.() ?? null;
      const creditUnionName = incomeStream?.creditUnion?.name ?? 'Unknown';
      const product = incomeStream?.product ?? 'Unknown product';
      const type = incomeStream?.revenueType ?? 'Unknown type';

      accumulateCreditUnion(byCreditUnion, creditUnionId, creditUnionName, amount);
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

app.get('/api/reports/credit-union/:id', async (req, res, next) => {
  try {
    const creditUnionId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(creditUnionId)) {
      res.status(400).json({ error: 'Invalid credit union selection.' });
      return;
    }

    const creditUnion = await CreditUnion.findById(creditUnionId).lean();
    if (!creditUnion) {
      res.status(404).json({ error: 'Credit union not found.' });
      return;
    }

    const start = parsePeriod(req.query.start);
    const end = parsePeriod(req.query.end);

    if (start && end && start.key > end.key) {
      res.status(400).json({ error: 'Start month must be before the end month.' });
      return;
    }

    const streams = await IncomeStream.find({ creditUnion: creditUnionId, status: 'active' })
      .select('_id product revenueType')
      .sort({ product: 1, revenueType: 1 })
      .lean();

    const streamIds = streams.map((stream) => stream._id);

    const match = {};
    if (streamIds.length) {
      match.incomeStream = { $in: streamIds };
    }

    if (start || end) {
      match.periodKey = {};
      if (start) {
        match.periodKey.$gte = start.key;
      }
      if (end) {
        match.periodKey.$lte = end.key;
      }
    }

    let totalRevenue = 0;
    const streamSummaries = streams.map((stream) => ({
      id: stream._id.toString(),
      product: stream.product,
      revenueType: stream.revenueType,
      amount: 0
    }));

    if (streamIds.length) {
      const aggregates = await RevenueEntry.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$incomeStream',
            totalRevenue: { $sum: '$amount' }
          }
        }
      ]);

      const revenueByStream = new Map(
        aggregates.map((entry) => [entry._id.toString(), Number(entry.totalRevenue ?? 0)])
      );

      streamSummaries.forEach((stream) => {
        const amount = revenueByStream.get(stream.id) ?? 0;
        stream.amount = amount;
        totalRevenue += amount;
      });
    }

    streamSummaries.sort((a, b) => b.amount - a.amount);

    res.json({
      creditUnion: { id: creditUnion._id.toString(), name: creditUnion.name },
      totalRevenue,
      streams: streamSummaries,
      reportingWindow: buildReportingWindow(start, end)
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/reports/monthly/:period', async (req, res, next) => {
  try {
    const period = parsePeriod(req.params.period);
    if (!period) {
      res.status(400).json({ error: 'Select a valid month using the YYYY-MM format.' });
      return;
    }

    const creditUnionId = typeof req.query.creditUnionId === 'string' ? req.query.creditUnionId.trim() : '';
    let incomeStreamFilter = null;

    if (creditUnionId && creditUnionId !== 'all') {
      if (!mongoose.Types.ObjectId.isValid(creditUnionId)) {
        res.status(400).json({ error: 'Invalid credit union selection.' });
        return;
      }

      const streams = await IncomeStream.find({ creditUnion: creditUnionId, status: 'active' })
        .select('_id')
        .lean();
      const streamIds = streams.map((stream) => stream._id);

      if (!streamIds.length) {
        res.json({
          month: {
            key: `${period.year}-${String(period.month).padStart(2, '0')}`,
            label: formatMonthLabel(period.year, period.month)
          },
          streams: []
        });
        return;
      }

      incomeStreamFilter = streamIds;
    }

    const match = { year: period.year, month: period.month };
    if (incomeStreamFilter) {
      match.incomeStream = { $in: incomeStreamFilter };
    }

    const aggregates = await RevenueEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$incomeStream',
          amount: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'incomestreams',
          localField: '_id',
          foreignField: '_id',
          as: 'stream'
        }
      },
      { $unwind: '$stream' },
      {
        $lookup: {
          from: 'creditunions',
          localField: 'stream.creditUnion',
          foreignField: '_id',
          as: 'creditUnion'
        }
      },
      { $unwind: { path: '$creditUnion', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          streamId: '$stream._id',
          amount: '$amount',
          product: '$stream.product',
          revenueType: '$stream.revenueType',
          creditUnionName: '$creditUnion.name'
        }
      },
      { $sort: { amount: -1, product: 1, revenueType: 1 } }
    ]);

    const streams = aggregates.map((entry) => {
      const creditUnionName = entry.creditUnionName ?? 'Unknown credit union';
      const product = entry.product ?? 'Unknown product';
      const revenueType = entry.revenueType ?? 'Unknown type';
      return {
        id: entry.streamId?.toString() ?? '',
        name: `${creditUnionName} – ${product} (${revenueType})`,
        amount: Number(entry.amount ?? 0)
      };
    });

    res.json({
      month: {
        key: `${period.year}-${String(period.month).padStart(2, '0')}`,
        label: formatMonthLabel(period.year, period.month)
      },
      streams
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/reports/completion', async (req, res, next) => {
  try {
    const start = parsePeriod(req.query.start);
    const end = parsePeriod(req.query.end);

    if (start && end && start.key > end.key) {
      res.status(400).json({ error: 'Start month must be before the end month.' });
      return;
    }

    const now = new Date();
    const defaultEnd = { year: now.getFullYear(), month: now.getMonth() + 1, key: now.getFullYear() * 100 + (now.getMonth() + 1) };
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

      const streams = await IncomeStream.find({ creditUnion: creditUnionId, status: 'active' })
        .select('_id')
        .lean();
      const streamIds = streams.map((stream) => stream._id);

      if (!streamIds.length) {
        const months = buildCompletionSeries(rangeStart, rangeEnd, new Map());
        res.json({ months });
        return;
      }

      incomeStreamFilter = streamIds;
    }

    const match = {
      periodKey: { $gte: rangeStart.key, $lte: rangeEnd.key }
    };

    if (incomeStreamFilter) {
      match.incomeStream = { $in: incomeStreamFilter };
    }

    const aggregates = await ReportingRequirement.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$periodKey',
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $ifNull: ['$completedAt', false] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const completionMap = new Map(
      aggregates.map((entry) => [entry._id, { total: entry.total ?? 0, completed: entry.completed ?? 0 }])
    );

    const revenueMatch = {
      periodKey: { $gte: rangeStart.key, $lte: rangeEnd.key }
    };

    if (incomeStreamFilter) {
      revenueMatch.incomeStream = { $in: incomeStreamFilter };
    }

    const revenueAggregates = await RevenueEntry.aggregate([
      { $match: revenueMatch },
      {
        $group: {
          _id: '$periodKey',
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    const revenueMap = new Map(
      revenueAggregates.map((entry) => [entry._id, Number(entry.totalRevenue ?? 0)])
    );

    const months = buildCompletionSeries(rangeStart, rangeEnd, completionMap, revenueMap);

    res.json({ months });
  } catch (error) {
    next(error);
  }
});

app.get('/api/reports/missing', async (req, res, next) => {
  try {
    const month = parsePeriod(req.query.month);
    const revenueType =
      typeof req.query.revenueType === 'string' && req.query.revenueType !== 'all'
        ? req.query.revenueType
        : null;

    await ensureReportingRequirementsForAllStreams();

    const requirementMatch = { completedAt: null };
    if (month) {
      requirementMatch.periodKey = month.key;
    }

    const pipeline = [
      { $match: requirementMatch },
      {
        $lookup: {
          from: 'incomestreams',
          localField: 'incomeStream',
          foreignField: '_id',
          as: 'stream'
        }
      },
      { $unwind: '$stream' },
      { $match: { 'stream.status': { $in: ['active', null] } } }
    ];

    if (revenueType) {
      pipeline.push({ $match: { 'stream.revenueType': revenueType } });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'creditunions',
          localField: 'stream.creditUnion',
          foreignField: '_id',
          as: 'creditUnion'
        }
      },
      {
        $unwind: {
          path: '$creditUnion',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 0,
          requirementId: '$_id',
          incomeStreamId: '$stream._id',
          creditUnionId: '$creditUnion._id',
          creditUnionName: { $ifNull: ['$creditUnion.name', 'Unknown credit union'] },
          product: '$stream.product',
          revenueType: '$stream.revenueType',
          year: '$year',
          month: '$month',
          periodKey: '$periodKey'
        }
      },
      { $sort: { creditUnionName: 1, product: 1, revenueType: 1 } }
    );

    const requirements = await ReportingRequirement.aggregate(pipeline);
    const totalMissing = await ReportingRequirement.countDocuments({ completedAt: null });

    res.json({
      totalMissing,
      filteredMissing: requirements.length,
      month: month
        ? { key: `${month.year}-${String(month.month).padStart(2, '0')}`, label: formatMonthLabel(month.year, month.month) }
        : null,
      revenueType: revenueType ?? 'all',
      items: requirements
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/call-reports', upload.single('file'), async (req, res, next) => {
  try {
    const creditUnionId = typeof req.body?.creditUnionId === 'string' ? req.body.creditUnionId.trim() : '';
    if (!creditUnionId || !mongoose.Types.ObjectId.isValid(creditUnionId)) {
      res.status(400).json({ error: 'A valid credit union selection is required.' });
      return;
    }

    const creditUnion = await CreditUnion.findById(creditUnionId).lean();
    if (!creditUnion) {
      res.status(404).json({ error: 'Credit union not found.' });
      return;
    }

    if (!req.file?.buffer) {
      res.status(400).json({ error: 'Please upload a call report document.' });
      return;
    }

    const { text, pages } = await extractCallReportText(req.file.buffer, req.file.mimetype);
    const reportDate = extractReportDate(text);
    const periodYear = reportDate.getFullYear();
    const periodMonth = reportDate.getMonth() + 1;

    const assetSize = extractLargestNumber(pages[5] ?? text);
    const netInterestIncome = extractNetInterestIncome(pages[7] ?? text);
    const totalNonInterestIncome = extractTotalNonInterestIncome(pages[8] ?? text);
    const netIncomeYtd = extractNetIncomeYtd(pages[8] ?? text);
    const averageMonthlyNetIncome =
      netIncomeYtd && periodMonth
        ? Number.isFinite(netIncomeYtd / periodMonth)
          ? netIncomeYtd / periodMonth
          : null
        : null;

    const { segments, totals } = extractLoanSegments(pages[9] ?? text, periodMonth);

    const indirectLoans = extractIndirectLoans(text);
    const outstandingIndirectLoans = extractOutstandingIndirectLoans(pages[13] ?? text);
    const loanData = extractLoanData(pages[5] ?? pages[0] ?? text);

    const created = await CallReport.create({
      creditUnion: creditUnionId,
      reportDate,
      periodYear,
      periodMonth,
      assetSize,
      netInterestIncome,
      totalNonInterestIncome,
      netIncomeYtd,
      averageMonthlyNetIncome,
      indirectLoans,
      outstandingIndirectLoans,
      totalLoans: totals.totalLoans,
      loansGrantedYtd: totals.loansGrantedYtd,
      loanSegments: segments,
      loanData,
      sourceName: req.file.originalname ?? null
    });

    res.status(201).json(formatCallReportPayload(created, creditUnion.name));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/call-reports/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Call report not found.' });
      return;
    }

    const deleted = await CallReport.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Call report not found.' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get('/api/credit-unions/:id/call-reports', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ error: 'Credit union not found.' });
      return;
    }

    const creditUnion = await CreditUnion.findById(id).lean();
    if (!creditUnion) {
      res.status(404).json({ error: 'Credit union not found.' });
      return;
    }

    const reports = await CallReport.find({ creditUnion: id })
      .sort({ reportDate: -1 })
      .lean();

    res.json(
      reports.map((report) => formatCallReportPayload(report, creditUnion.name))
    );
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

async function extractCallReportText(buffer, mimeType) {
  const pages = [];
  if (mimeType === 'application/pdf' || mimeType === 'application/octet-stream' || mimeType === 'application/x-pdf') {
    try {
      const data = await pdfParse(buffer, {
        pagerender: (pageData) =>
          pageData.getTextContent().then((content) => {
            const text = content.items.map((item) => item.str).join(' ');
            pages.push(text);
            return text;
          })
      });

      return { text: data.text || pages.join('\n\n'), pages: pages.length ? pages : [data.text] };
    } catch (error) {
      console.warn('Failed to parse PDF call report. Falling back to text buffer.', error);
    }
  }

  const fallbackText = buffer.toString('utf8');
  return { text: fallbackText, pages: [fallbackText] };
}

function extractReportDate(text) {
  const dateMatch = text.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/);
  if (dateMatch) {
    const [, monthStr, dayStr, yearStr] = dateMatch;
    const year = Number.parseInt(yearStr.length === 2 ? `20${yearStr}` : yearStr, 10);
    const month = Number.parseInt(monthStr, 10) - 1;
    const day = Number.parseInt(dayStr, 10);
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return new Date(Date.UTC(year, month, day));
    }
  }

  const yearOnlyMatch = text.match(/\b(20\d{2})\b/);
  if (yearOnlyMatch) {
    const year = Number.parseInt(yearOnlyMatch[1], 10);
    return new Date(Date.UTC(year, 0, 1));
  }

  return new Date();
}

function getLabelSnippet(text, label, span = 200) {
  if (!text || !label) return null;
  const lower = text.toLowerCase();
  const index = lower.lastIndexOf(label.toLowerCase());
  if (index < 0) return null;
  return text.slice(index, index + span);
}

function pickAmountFigure(figures = []) {
  if (!Array.isArray(figures) || !figures.length) return null;
  const amounts = figures.filter((value) => Math.abs(value) >= 1000);
  if (amounts.length) {
    return amounts[0];
  }
  if (figures.some((value) => value === 0)) {
    return 0;
  }
  return null;
}

function extractIndirectLoans(text) {
  if (!text) return null;
  const labels = ['indirect loans', 'indirect auto loans', 'total indirect loans'];
  for (const label of labels) {
    const snippet = getLabelSnippet(text, label);
    if (!snippet) continue;
    const figures = parseNumbersFromLine(snippet);
    const value = pickAmountFigure(figures);
    if (value !== null) {
      return value;
    }
  }
  return null;
}

function extractOutstandingIndirectLoans(text) {
  if (!text) return null;
  const snippet = getLabelSnippet(text, 'TOTAL OUTSTANDING INDIRECT LOANS');
  if (snippet) {
    const figures = parseNumbersFromLine(snippet);
    const value = pickAmountFigure(figures);
    if (value !== null) {
      return value;
    }
  }

  return extractIndirectLoans(text);
}

function extractNumberByLabels(text, labels = []) {
  const lower = text.toLowerCase();
  for (const label of labels) {
    const index = lower.indexOf(label.toLowerCase());
    if (index >= 0) {
      const snippet = text.slice(index, index + 120);
      const figures = parseNumbersFromLine(snippet);
      if (figures.length) {
        return figures[0];
      }
    }
  }
  return null;
}

function extractNumberNearLabel(text, label, pick = 'largest') {
  if (!text || !label) return null;
  const lower = text.toLowerCase();
  const index = lower.lastIndexOf(label.toLowerCase());
  if (index < 0) return extractNumberByLabels(text, [label]);

  const snippet = text.slice(index);
  const figures = parseNumbersFromLine(snippet);
  if (!figures.length) return null;

  if (pick === 'first') {
    return figures[0];
  }

  if (pick === 'last') {
    return figures[figures.length - 1];
  }

  return figures.reduce((best, value) => {
    if (best === null || Math.abs(value) > Math.abs(best)) {
      return value;
    }
    return best;
  }, null);
}

function parseNumericToken(token) {
  if (!token) return null;
  const cleaned = token.replace(/[^\d\-.]/g, '');
  if (!cleaned) return null;
  const number = Number.parseFloat(cleaned.replace(/,/g, ''));
  return Number.isFinite(number) ? number : null;
}

function extractLargestNumber(text) {
  if (!text) return null;
  const numbers = parseNumbersFromLine(text);
  if (!numbers.length) return null;
  return numbers.reduce((max, value) => (Math.abs(value) > Math.abs(max) ? value : max), numbers[0]);
}

function extractNetInterestIncome(pageText) {
  if (!pageText) return null;
  const numbers = parseNumbersFromLine(pageText.slice(pageText.toLowerCase().lastIndexOf('net interest income')));
  const millionPlus = numbers.filter((value) => Math.abs(value) >= 1_000_000);
  if (millionPlus.length) {
    return millionPlus[millionPlus.length - 1];
  }
  return numbers.length ? numbers[numbers.length - 1] : null;
}

function extractTotalNonInterestIncome(pageText) {
  if (!pageText) return null;
  const numbers = parseNumbersFromLine(
    pageText.slice(pageText.toLowerCase().lastIndexOf('total non-interest income'))
  );
  const millionPlus = numbers.filter((value) => Math.abs(value) >= 1_000_000);
  if (millionPlus.length) {
    return millionPlus[0];
  }
  return numbers.find((value) => Math.abs(value) >= 1_000) ?? null;
}

function extractNetIncomeYtd(pageText) {
  if (!pageText) return null;
  const numbers = parseNumbersFromLine(pageText.slice(pageText.toLowerCase().lastIndexOf('net income year-to-date')));
  return numbers.find((value) => Math.abs(value) >= 100_000) ?? numbers.find((value) => Math.abs(value) >= 1_000) ?? null;
}

function extractLoanSegments(pageText, monthsProcessed = null) {
  const totals = {
    totalLoans: { count: null, amount: null },
    loansGrantedYtd: { count: null, amount: null, monthlyAverage: null }
  };

  if (!pageText) return { segments: [], totals };

  const startIndex = pageText.indexOf('SEPTEMBER');
  const content = startIndex >= 0 ? pageText.slice(startIndex) : pageText;
  const tokens = content.split(/\s+/).filter(Boolean);
  const firstDollarIndex = tokens.findIndex((token) => token.startsWith('$'));

  const countTokens = (firstDollarIndex >= 0 ? tokens.slice(0, firstDollarIndex) : tokens).filter((token) =>
    /^[-\d,]+$/.test(token)
  );
  const numericCounts = countTokens
    .map((token) => parseNumericToken(token))
    .filter((value) => Number.isFinite(value));
  const trimmedCounts = numericCounts.slice(-10);

  const amountTokens = firstDollarIndex >= 0 ? tokens.slice(firstDollarIndex) : [];
  const numericAmounts = amountTokens
    .filter((token) => token.startsWith('$'))
    .map((token) => parseNumericToken(token))
    .filter((value) => Number.isFinite(value));

  const postDollarCounts = amountTokens
    .filter((token) => /^[-\d,]+$/.test(token))
    .map((token) => parseNumericToken(token))
    .filter((value) => Number.isFinite(value) && value < 20000);

  const totalLoansCount = postDollarCounts.find((value) => value >= 1000) ?? null;
  const loansGrantedCount = postDollarCounts.find((value) => value >= 1000 && value !== totalLoansCount) ?? null;

  totals.totalLoans = {
    count: totalLoansCount,
    amount: Number.isFinite(numericAmounts[10]) ? numericAmounts[10] : null
  };

  const monthlyAverage =
    Number.isFinite(numericAmounts[11]) && monthsProcessed ? numericAmounts[11] / monthsProcessed : null;

  totals.loansGrantedYtd = {
    count: loansGrantedCount,
    amount: Number.isFinite(numericAmounts[11]) ? numericAmounts[11] : null,
    monthlyAverage: Number.isFinite(monthlyAverage) ? monthlyAverage : null
  };

  const segments = [
    {
      label: 'Credit Cards',
      count: trimmedCounts[0] ?? null,
      amount: Number.isFinite(numericAmounts[0]) ? numericAmounts[0] : null
    },
    {
      label: 'Other Unsecured/LOC',
      count: trimmedCounts[2] ?? null,
      amount: Number.isFinite(numericAmounts[2]) ? numericAmounts[2] : null
    },
    {
      label: 'New Vehicle Loans',
      count: trimmedCounts[3] ?? null,
      amount: Number.isFinite(numericAmounts[3]) ? numericAmounts[3] : null
    },
    {
      label: 'Used Vehicle Loans',
      count: trimmedCounts[4] ?? null,
      amount: Number.isFinite(numericAmounts[4]) ? numericAmounts[4] : null
    },
    {
      label: 'Other Secured Non-RE/LOC',
      count: trimmedCounts[6] ?? null,
      amount: Number.isFinite(numericAmounts[6]) ? numericAmounts[6] : null
    },
    {
      label: 'First Lien Real Estate',
      count: trimmedCounts[7] ?? null,
      amount: Number.isFinite(numericAmounts.at(-2)) ? numericAmounts.at(-2) : null
    },
    {
      label: '2nd Lien Real Estate',
      count: trimmedCounts[8] ?? null,
      amount: Number.isFinite(numericAmounts.at(-1)) ? numericAmounts.at(-1) : null
    }
  ];

  return { segments, totals };
}

function extractLoanData(pageText) {
  if (!pageText) return [];
  const lines = pageText
    .split(/\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line && /loan/i.test(line));

  const rows = [];
  for (const line of lines) {
    if (!/\d/.test(line)) continue;
    const figures = parseNumbersFromLine(line);
    rows.push({
      label: line.slice(0, 160),
      figures
    });
    if (rows.length >= 40) {
      break;
    }
  }

  return rows;
}

function parseNumbersFromLine(line) {
  const matches = line.match(/\(?-?[\d,]+(?:\.\d+)?\)?/g) || [];
  return matches
    .map((value) => {
      const numeric = value.replace(/[()]/g, '');
      const parsed = Number.parseFloat(numeric.replace(/,/g, ''));
      if (!Number.isFinite(parsed)) return null;
      return value.trim().startsWith('(') ? -parsed : parsed;
    })
    .filter((value) => Number.isFinite(value));
}

function formatCallReportPayload(report, creditUnionName = null) {
  if (!report) return null;
  return {
    id: report._id?.toString?.() ?? '',
    creditUnionId: report.creditUnion?.toString?.() ?? null,
    creditUnionName: creditUnionName ?? null,
    reportDate: report.reportDate,
    periodYear: report.periodYear,
    periodMonth: report.periodMonth,
    assetSize: report.assetSize,
    netInterestIncome: report.netInterestIncome ?? null,
    totalNonInterestIncome: report.totalNonInterestIncome ?? null,
    netIncomeYtd: report.netIncomeYtd ?? null,
    averageMonthlyNetIncome: report.averageMonthlyNetIncome ?? null,
    indirectLoans: report.indirectLoans,
    outstandingIndirectLoans: report.outstandingIndirectLoans ?? null,
    totalLoans: report.totalLoans ?? { count: null, amount: null },
    loansGrantedYtd: report.loansGrantedYtd ?? { count: null, amount: null, monthlyAverage: null },
    loanSegments: Array.isArray(report.loanSegments)
      ? report.loanSegments.map((segment) => ({
          label: segment.label,
          count: Number.isFinite(segment.count) ? segment.count : null,
          amount: Number.isFinite(segment.amount) ? segment.amount : null
        }))
      : [],
    loanData: Array.isArray(report.loanData)
      ? report.loanData.map((row) => ({ label: row.label, figures: row.figures ?? [] }))
      : [],
    sourceName: report.sourceName ?? null,
    extractedAt: report.extractedAt ?? report.createdAt
  };
}

function accumulate(map, key, value) {
  const previous = map.get(key) ?? 0;
  map.set(key, previous + value);
}

function accumulateCreditUnion(map, id, name, amount) {
  const key = id ?? name ?? 'Unknown';
  const previous = map.get(key) ?? { id: id ?? null, name: name ?? 'Unknown', amount: 0 };
  const resolvedName = name ?? previous.name ?? 'Unknown';
  const resolvedId = id ?? previous.id ?? null;
  map.set(key, {
    id: resolvedId,
    name: resolvedName,
    amount: (previous.amount ?? 0) + amount
  });
}

function sortAggregates(map) {
  return Array.from(map.entries())
    .map(([key, value]) => {
      if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'amount')) {
        return {
          ...value,
          amount: Number(value.amount ?? 0),
          name: value.name ?? key
        };
      }
      return { name: key, amount: Number(value ?? 0) };
    })
    .sort((a, b) => b.amount - a.amount);
}

function buildReportingWindow(start, end) {
  const result = {};
  if (start) {
    result.start = formatPeriodValue(start.year, start.month);
    result.startLabel = formatMonthLabel(start.year, start.month);
  }
  if (end) {
    result.end = formatPeriodValue(end.year, end.month);
    result.endLabel = formatMonthLabel(end.year, end.month);
  }
  return result;
}

function formatPeriodValue(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
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

function buildCompletionSeries(start, end, completionMap, revenueMap = new Map()) {
  const months = [];
  let currentYear = start.year;
  let currentMonth = start.month;

  while (currentYear * 100 + currentMonth <= end.key) {
    const periodKey = currentYear * 100 + currentMonth;
    const stats = completionMap.get(periodKey) ?? { total: 0, completed: 0 };
    const totalActiveStreams = stats.total ?? 0;
    const completedStreams = stats.completed ?? 0;
    const completionRate = totalActiveStreams > 0 ? (completedStreams / totalActiveStreams) * 100 : 0;
    const totalRevenue = Number(revenueMap.get(periodKey) ?? 0);

    months.push({
      key: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
      label: formatMonthLabel(currentYear, currentMonth),
      totalActiveStreams,
      completedStreams,
      completionRate,
      totalRevenue
    });

    currentMonth += 1;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear += 1;
    }
  }

  return months;
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

function parseReportingMonth(value) {
  const parsed = parsePeriod(value);
  if (!parsed) {
    return null;
  }
  return { year: parsed.year, month: parsed.month, periodKey: parsed.key };
}

function buildFirstReportPayload(stream) {
  if (stream.firstReportYear && stream.firstReportMonth) {
    const periodKey = stream.firstReportPeriodKey || stream.firstReportYear * 100 + stream.firstReportMonth;
    return {
      year: stream.firstReportYear,
      month: stream.firstReportMonth,
      periodKey,
      key: `${stream.firstReportYear}-${String(stream.firstReportMonth).padStart(2, '0')}`,
      label: formatMonthLabel(stream.firstReportYear, stream.firstReportMonth)
    };
  }
  return null;
}

async function ensureReportingRequirementsForAllStreams() {
  const streams = await IncomeStream.find({ status: 'active' }).select('_id').lean();
  for (const stream of streams) {
    await ensureReportingRequirementsForStream(stream._id);
  }
}

async function backfillIncomeStreamStatuses() {
  const missingStatusQuery = { $or: [{ status: { $exists: false } }, { status: null }] };
  const missingCount = await IncomeStream.countDocuments(missingStatusQuery);

  if (!missingCount) {
    return false;
  }

  const result = await IncomeStream.updateMany(missingStatusQuery, { $set: { status: 'active' } });

  console.log(
    `Backfilled status to 'active' on ${result.modifiedCount} income stream${
      result.modifiedCount === 1 ? '' : 's'
    } missing the field.`
  );

  return result.modifiedCount > 0;
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

  const stream = await IncomeStream.findById(streamId)
    .select(
      'status firstReportYear firstReportMonth firstReportPeriodKey finalReportYear finalReportMonth finalReportPeriodKey'
    )
    .lean();

  if (!stream) {
    return;
  }

  if (stream.status !== 'active') {
    return;
  }

  const now = new Date();
  let endYear = now.getFullYear();
  let endMonth = now.getMonth() + 1;
  let endPeriodKey = endYear * 100 + endMonth;

  if (stream.finalReportPeriodKey && stream.finalReportYear && stream.finalReportMonth) {
    endYear = stream.finalReportYear;
    endMonth = stream.finalReportMonth;
    endPeriodKey = stream.finalReportPeriodKey;
  }

  const requirementOperations = [];
  let year = stream.firstReportYear ?? REPORTING_START_YEAR;
  let month = stream.firstReportMonth ?? REPORTING_START_MONTH;

  while (year * 100 + month <= endPeriodKey) {
    const periodKey = year * 100 + month;
    requirementOperations.push({
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

  if (requirementOperations.length) {
    await ReportingRequirement.bulkWrite(requirementOperations, { ordered: false });
  }

  if (stream.finalReportPeriodKey) {
    await ReportingRequirement.deleteMany({
      incomeStream: streamId,
      periodKey: { $gt: endPeriodKey }
    });
  }

  const entries = await RevenueEntry.find({ incomeStream: streamId })
    .select('year month periodKey reportedAt')
    .lean();

  if (entries.length) {
    const completionOperations = entries.map((entry) => ({
      updateOne: {
        filter: { incomeStream: streamId, periodKey: entry.periodKey },
        update: {
          $set: {
            incomeStream: streamId,
            year: entry.year,
            month: entry.month,
            periodKey: entry.periodKey,
            completedAt: entry.reportedAt ?? new Date()
          }
        },
        upsert: true
      }
    }));

    await ReportingRequirement.bulkWrite(completionOperations, { ordered: false });
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
