import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';

export const USAGE_TIMEZONE = 'America/Chicago';
export const VISITOR_COOKIE = 'gfs_quote_visitor';
// The bearer credential is stored privately in the daily-report automation, never in Git.
// Set QUOTE_USAGE_REPORT_TOKEN_HASH to a new SHA-256 digest to rotate or revoke it.
const DEFAULT_REPORT_TOKEN_HASH = '113a0df745719406ba02332d92e1f3bb3ca2066c398a5721c2dc81f5e7bf5980';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AUTOMATED = /bot\b|crawler|spider|headless|preview|facebookexternalhit|slackbot|curl\/|wget\/|python-requests|python-urllib|GFSUsageMonitor/i;
const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: USAGE_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit'
});
const hash = (value) => createHash('sha256').update(value).digest('hex');

export function centralDay(date) {
  const parts = Object.fromEntries(dateFormatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function dayOffset(day, offset) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function visitorFromCookie(header = '') {
  const value = header.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${VISITOR_COOKIE}=`))?.slice(VISITOR_COOKIE.length + 1);
  return value && UUID.test(value) ? value.toLowerCase() : null;
}

export function validReportToken(header, digest) {
  if (!/^[a-f0-9]{64}$/i.test(digest || '') || typeof header !== 'string') return false;
  const match = /^Bearer ([a-f0-9]{64})$/i.exec(header);
  return Boolean(match && timingSafeEqual(Buffer.from(hash(match[1]), 'hex'), Buffer.from(digest, 'hex')));
}

export function buildDailyReport({ now, days, startedAt, groups, combined, recordingErrorsSinceRestart = 0 }) {
  const today = centralDay(now);
  const firstDay = centralDay(new Date(startedAt));
  const stateCounts = new Map(groups.map((row) => [`${row._id.day}:${row._id.state}`, row]));
  const combinedCounts = new Map(combined.map((row) => [row._id, row]));
  const daily = Array.from({ length: days }, (_, offset) => {
    const day = dayOffset(today, -offset);
    const tracked = day >= firstDay;
    const counts = (state) => {
      if (!tracked) return { uniqueBrowsers: null, pageViews: null };
      const row = stateCounts.get(`${day}:${state}`);
      return { uniqueBrowsers: row?.uniqueBrowsers || 0, pageViews: row?.pageViews || 0 };
    };
    const all = combinedCounts.get(day);
    return {
      day, tracked, partialDay: tracked && (day === today || day === firstDay),
      missouri: counts('MO'), arkansas: counts('AR'),
      combined: tracked ? { uniqueBrowsers: all?.uniqueBrowsers || 0, pageViews: all?.pageViews || 0 }
        : { uniqueBrowsers: null, pageViews: null }
    };
  });
  return {
    timezone: USAGE_TIMEZONE, generatedAt: now.toISOString(), trackingStartedAt: new Date(startedAt).toISOString(),
    metric: 'Unique browsers per Central Time day',
    note: 'A browser visiting both programs counts once in the combined daily total. Reloads add page views. Shared browsers count once; different devices or cleared/blocked cookies may count separately. Known bots and prefetches are excluded. No historical traffic before tracking began is available.',
    health: { storage: 'connected', recordingErrorsSinceRestart }, daily
  };
}

export function createMongoUsageStore(mongoose) {
  const dailySchema = new mongoose.Schema({
    _id: String, day: String, state: String, visitorHash: String,
    pageViews: Number, firstSeenAt: Date, lastSeenAt: Date
  }, { collection: 'quote_usage_daily', bufferCommands: false, versionKey: false });
  dailySchema.index({ day: 1, state: 1 });
  const metaSchema = new mongoose.Schema({ _id: String, startedAt: Date }, {
    collection: 'quote_usage_meta', bufferCommands: false, versionKey: false
  });
  const Daily = mongoose.models.QuoteUsageDaily || mongoose.model('QuoteUsageDaily', dailySchema);
  const Meta = mongoose.models.QuoteUsageMeta || mongoose.model('QuoteUsageMeta', metaSchema);
  const available = () => mongoose.connection.readyState === 1;
  const assertAvailable = () => { if (!available()) throw new Error('Usage database unavailable'); };
  return {
    available,
    onConnected(callback) { mongoose.connection.on('connected', callback); },
    async start(now) {
      assertAvailable();
      try {
        await Meta.updateOne({ _id: 'tracking' }, { $setOnInsert: { startedAt: now } }, { upsert: true, maxTimeMS: 3000 });
      } catch (error) { if (error?.code !== 11000) throw error; }
    },
    async record(visit) {
      assertAvailable();
      const id = `${visit.day}:${visit.state}:${visit.visitorHash}`;
      const update = {
        $setOnInsert: { day: visit.day, state: visit.state, visitorHash: visit.visitorHash },
        $min: { firstSeenAt: visit.at }, $max: { lastSeenAt: visit.at }, $inc: { pageViews: 1 }
      };
      try {
        await Daily.updateOne({ _id: id }, update, { upsert: true, maxTimeMS: 3000 });
      } catch (error) {
        // Concurrent first visits may race on the built-in unique _id index.
        if (error?.code !== 11000) throw error;
        await Daily.updateOne({ _id: id }, update, { maxTimeMS: 3000 });
      }
    },
    async read(fromDay, toDay) {
      assertAvailable();
      const [meta, result] = await Promise.all([
        Meta.findById('tracking').maxTimeMS(3000).lean(),
        Daily.aggregate([
          { $match: { day: { $gte: fromDay, $lte: toDay } } },
          { $facet: {
            groups: [{ $group: { _id: { day: '$day', state: '$state' }, uniqueBrowsers: { $sum: 1 }, pageViews: { $sum: '$pageViews' } } }],
            combined: [
              { $group: { _id: { day: '$day', visitorHash: '$visitorHash' }, pageViews: { $sum: '$pageViews' } } },
              { $group: { _id: '$_id.day', uniqueBrowsers: { $sum: 1 }, pageViews: { $sum: '$pageViews' } } }
            ]
          } }
        ]).option({ maxTimeMS: 3000 })
      ]);
      if (!meta?.startedAt) throw new Error('Usage tracking has not initialized');
      return { startedAt: meta.startedAt, groups: result[0]?.groups || [], combined: result[0]?.combined || [] };
    }
  };
}

export function createQuoteUsage({ store, now = () => new Date(), logger = console,
  reportTokenHash = process.env.QUOTE_USAGE_REPORT_TOKEN_HASH ?? DEFAULT_REPORT_TOKEN_HASH }) {
  let recordingErrorsSinceRestart = 0;
  let lastWarningAt = 0;
  function warn() {
    const at = Date.now();
    if (at - lastWarningAt > 60000) {
      lastWarningAt = at;
      logger.warn('Quote visitor logging is unavailable; quoting continues normally. Check MongoDB connectivity.');
    }
  }
  const start = () => { Promise.resolve().then(() => store.start(now())).catch(warn); };
  store.onConnected?.(start);
  if (store.available()) start();

  async function report(req, res) {
    res.set('Cache-Control', 'no-store');
    res.set('X-Robots-Tag', 'noindex, nofollow');
    const value = req.query.days ?? '30';
    if (typeof value !== 'string' || !/^\d{1,2}$/.test(value) || Number(value) < 1 || Number(value) > 90) {
      res.status(400).json({ error: 'days must be between 1 and 90.' });
      return;
    }
    try {
      const at = now();
      const days = Number(value);
      const data = await store.read(dayOffset(centralDay(at), 1 - days), centralDay(at));
      res.json(buildDailyReport({ ...data, now: at, days, recordingErrorsSinceRestart }));
    } catch {
      res.status(503).json({ error: 'Visitor reporting is temporarily unavailable. This is not a zero-visitor result.' });
    }
  }

  return {
    track(state) {
      if (!['MO', 'AR'].includes(state)) throw new Error('Unknown quote program');
      return (req, res, next) => {
        const ua = req.get('user-agent') || '';
        const purpose = `${req.get('purpose') || ''} ${req.get('sec-purpose') || ''}`;
        if (req.method !== 'GET' || !ua || AUTOMATED.test(ua) || /prefetch|prerender/i.test(purpose)) return next();
        try {
          let visitor = visitorFromCookie(req.get('cookie'));
          if (!visitor) {
            visitor = randomUUID();
            res.cookie(VISITOR_COOKIE, visitor, {
              httpOnly: true, sameSite: 'lax', path: '/single-premium-quote',
              secure: req.secure || req.get('x-forwarded-proto') === 'https', maxAge: 180 * 24 * 60 * 60 * 1000
            });
          }
          const at = now();
          const day = centralDay(at);
          const visit = { state, day, visitorHash: hash(`${day}:${visitor}`), at };
          res.once('finish', () => {
            if (![200, 304].includes(res.statusCode)) return;
            // Never delay a page response or let a storage failure interrupt quoting.
            Promise.resolve().then(() => store.record(visit)).catch(() => {
              recordingErrorsSinceRestart += 1;
              warn();
            });
          });
        } catch { recordingErrorsSinceRestart += 1; warn(); }
        next();
      };
    },
    dashboardReport: report,
    privateReport(req, res) {
      res.set('Cache-Control', 'no-store');
      if (!validReportToken(req.get('authorization'), reportTokenHash)) {
        res.status(401).json({ error: 'A valid reporting credential is required.' });
        return;
      }
      return report(req, res);
    }
  };
}
