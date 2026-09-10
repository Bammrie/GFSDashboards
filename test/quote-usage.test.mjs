import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import test from 'node:test';
import express from 'express';
import { buildDailyReport, centralDay, createQuoteUsage, validReportToken, visitorFromCookie } from '../quote-usage.mjs';

const token = 'ab'.repeat(32);
const tokenHash = createHash('sha256').update(token).digest('hex');
const browser = 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/140.0 Safari/537.36';
const cookieA = 'gfs_quote_visitor=81eb53f5-2222-4444-aaaa-222222222222';
const cookieB = 'gfs_quote_visitor=81eb53f5-3333-4444-aaaa-222222222222';
const tick = () => new Promise((resolve) => setImmediate(resolve));

function memoryStore(startedAt = new Date('2026-09-10T05:01:00Z')) {
  const records = new Map();
  return {
    records, available: () => true, async start() {},
    async record(visit) {
      const key = `${visit.day}:${visit.state}:${visit.visitorHash}`;
      const row = records.get(key) || { ...visit, pageViews: 0 };
      row.pageViews += 1;
      records.set(key, row);
    },
    async read(from, to) {
      const byState = new Map();
      const byDay = new Map();
      for (const row of records.values()) {
        if (row.day < from || row.day > to) continue;
        const key = `${row.day}:${row.state}`;
        const state = byState.get(key) || { _id: { day: row.day, state: row.state }, uniqueBrowsers: 0, pageViews: 0 };
        state.uniqueBrowsers += 1;
        state.pageViews += row.pageViews;
        byState.set(key, state);
        const day = byDay.get(row.day) || { _id: row.day, visitors: new Set(), pageViews: 0 };
        day.visitors.add(row.visitorHash);
        day.pageViews += row.pageViews;
        byDay.set(row.day, day);
      }
      return { startedAt, groups: [...byState.values()], combined: [...byDay.values()].map((day) => ({ _id: day._id, uniqueBrowsers: day.visitors.size, pageViews: day.pageViews })) };
    }
  };
}

async function harness(t, store = memoryStore()) {
  let date = new Date('2026-09-10T17:00:00Z');
  const app = express();
  const service = createQuoteUsage({ store, now: () => date, logger: { warn() {} }, reportTokenHash: tokenHash });
  app.get('/single-premium-quote/missouri/', service.track('MO'), (req, res) => res.send('unchanged calculator'));
  app.get('/single-premium-quote/arkansas/', service.track('AR'), (req, res) => res.send('unchanged calculator'));
  app.get('/broken', service.track('MO'), (req, res) => res.sendStatus(500));
  app.get('/conditional', service.track('MO'), (req, res) => res.sendStatus(304));
  app.get('/api/quote-usage/report', service.privateReport);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => { server.closeAllConnections(); server.close(); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {
    store, setDate: (value) => { date = new Date(value); },
    get: (path, options = {}) => fetch(`${origin}${path}`, { ...options, headers: { 'user-agent': browser, ...options.headers } }),
    report: async () => {
      await tick();
      const response = await fetch(`${origin}/api/quote-usage/report?days=8`, { headers: { authorization: `Bearer ${token}` } });
      return { response, data: await response.json() };
    }
  };
}

test('Central Time day boundaries follow daylight saving time', () => {
  assert.equal(centralDay(new Date('2026-09-10T04:59:59Z')), '2026-09-09');
  assert.equal(centralDay(new Date('2026-09-10T05:00:00Z')), '2026-09-10');
  assert.equal(centralDay(new Date('2026-12-10T05:59:59Z')), '2026-12-09');
  assert.equal(centralDay(new Date('2026-12-10T06:00:00Z')), '2026-12-10');
  assert.equal(centralDay(new Date('2026-11-01T06:30:00Z')), '2026-11-01');
  assert.equal(centralDay(new Date('2026-11-01T07:30:00Z')), '2026-11-01');
});

test('invalid cookies and unauthorized reporting credentials are rejected', () => {
  assert.equal(visitorFromCookie('gfs_quote_visitor=<script>'), null);
  assert.equal(visitorFromCookie('other=abc; ' + cookieA), cookieA.split('=')[1]);
  assert.equal(validReportToken(`Bearer ${token}`, tokenHash), true);
  for (const value of [undefined, '', token, 'Basic ' + token, `Bearer ${'ac'.repeat(32)}`]) {
    assert.equal(validReportToken(value, tokenHash), false);
  }
  assert.equal(validReportToken(`Bearer ${token}`, 'disabled'), false);
});

test('repeat and concurrent visits deduplicate browsers while preserving page views and cross-state totals', async (t) => {
  const h = await harness(t);
  const first = await h.get('/single-premium-quote/missouri/', { headers: { 'x-forwarded-proto': 'https' } });
  assert.equal(await first.text(), 'unchanged calculator');
  const cookie = first.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /Path=\/single-premium-quote/);
  const idCookie = cookie.split(';')[0];
  await Promise.all(Array.from({ length: 8 }, () => h.get('/single-premium-quote/missouri/', { headers: { cookie: idCookie } })));
  await h.get('/single-premium-quote/arkansas/', { headers: { cookie: idCookie } });
  await h.get('/single-premium-quote/arkansas/', { headers: { cookie: cookieB } });
  const { data } = await h.report();
  assert.deepEqual(data.daily[0].missouri, { uniqueBrowsers: 1, pageViews: 9 });
  assert.deepEqual(data.daily[0].arkansas, { uniqueBrowsers: 2, pageViews: 2 });
  assert.deepEqual(data.daily[0].combined, { uniqueBrowsers: 2, pageViews: 11 });
  assert.equal(JSON.stringify(data).includes('visitorHash'), false);
  assert.equal(JSON.stringify([...h.store.records.values()]).includes(idCookie.split('=')[1]), false);
});

test('same browser counts again on next Central Time day; pretracking days are not zeros', async (t) => {
  const h = await harness(t);
  await h.get('/single-premium-quote/missouri/', { headers: { cookie: cookieA } });
  h.setDate('2026-09-11T05:00:00Z');
  await h.get('/single-premium-quote/missouri/', { headers: { cookie: cookieA } });
  const { data } = await h.report();
  assert.equal(data.daily[0].missouri.uniqueBrowsers, 1);
  assert.equal(data.daily[1].missouri.uniqueBrowsers, 1);
  assert.equal(data.daily[2].tracked, false);
  assert.equal(data.daily[2].missouri.uniqueBrowsers, null);
  assert.equal(data.daily[0].partialDay, true);
  assert.equal(data.daily[1].partialDay, true);
  assert.equal(new Set([...h.store.records.values()].map((row) => row.visitorHash)).size, 2);
});

test('bots, monitoring, prefetch, HEAD and failed pages do not count; successful conditional views do', async (t) => {
  const h = await harness(t);
  for (const ua of ['Googlebot/1.0', 'GFSUsageMonitor/1.0', 'curl/8.0', '']) {
    const response = await h.get('/single-premium-quote/missouri/', { headers: { 'user-agent': ua } });
    assert.equal(response.headers.get('set-cookie'), null);
  }
  await h.get('/single-premium-quote/missouri/', { method: 'HEAD' });
  await h.get('/single-premium-quote/missouri/', { headers: { 'sec-purpose': 'prefetch;prerender' } });
  await h.get('/broken');
  assert.equal((await h.report()).data.daily[0].combined.pageViews, 0);
  await h.get('/conditional', { headers: { cookie: cookieA } });
  assert.equal((await h.report()).data.daily[0].combined.pageViews, 1);
});

test('storage failures never break or delay the calculator and reports do not pretend data is zero', async (t) => {
  const store = memoryStore();
  store.record = async () => { throw new Error('database disconnected'); };
  const h = await harness(t, store);
  const response = await h.get('/single-premium-quote/missouri/');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'unchanged calculator');
  assert.equal((await h.report()).data.health.recordingErrorsSinceRestart, 1);
  store.record = () => new Promise(() => {});
  assert.equal((await h.get('/single-premium-quote/arkansas/', { signal: AbortSignal.timeout(1000) })).status, 200);
  store.read = async () => { throw new Error('offline'); };
  const unavailable = await h.report();
  assert.equal(unavailable.response.status, 503);
  assert.equal(unavailable.data.daily, undefined);
});

test('report requires its dedicated token, rejects invalid ranges and disables caching', async (t) => {
  const h = await harness(t);
  assert.equal((await h.get('/api/quote-usage/report')).status, 401);
  assert.equal((await h.get('/api/quote-usage/report', { headers: { authorization: 'Bearer ' + 'cd'.repeat(32) } })).status, 401);
  for (const range of ['0', '91', 'abc', '1.5', '7&days=8']) {
    assert.equal((await h.get('/api/quote-usage/report?days=' + range, { headers: { authorization: `Bearer ${token}` } })).status, 400);
  }
  const { response } = await h.report();
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.status, 200);
});

test('empty days after activation correctly show zero, while the start day stays partial', () => {
  const data = buildDailyReport({ now: new Date('2026-09-12T16:00:00Z'), days: 4, startedAt: new Date('2026-09-10T16:00:00Z'), groups: [], combined: [] });
  assert.equal(data.daily[1].partialDay, false);
  assert.deepEqual(data.daily[1].combined, { uniqueBrowsers: 0, pageViews: 0 });
  assert.equal(data.daily[2].partialDay, true);
  assert.equal(data.daily[3].tracked, false);
});
