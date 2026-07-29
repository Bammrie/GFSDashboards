import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import path from 'path';
import { fileURLToPath } from 'url';
import fsSync from 'fs';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', false);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = __dirname;
const WARRANTY_CONFIG_STORAGE_PATH =
  process.env.WARRANTY_CONFIG_STORAGE_PATH || path.join(__dirname, 'data', 'account-warranty-configs.json');
const PODIUM_OAUTH_STORAGE_PATH =
  process.env.PODIUM_OAUTH_STORAGE_PATH || path.join(__dirname, 'data', 'podium-oauth.json');
const ACCOUNT_DOCUMENTS_STORAGE_PATH =
  process.env.ACCOUNT_DOCUMENTS_STORAGE_PATH || path.join(__dirname, 'data', 'account-documents');
const NCUA_CREDIT_UNION_DATA_PATH =
  process.env.NCUA_CREDIT_UNION_DATA_PATH || path.join(__dirname, 'data', 'ncua-active-credit-unions.json');
const NCUA_CREDIT_UNION_OVERRIDE_PATH =
  process.env.NCUA_CREDIT_UNION_OVERRIDE_PATH || path.join(__dirname, 'data', 'ncua-credit-union-overrides.json');
const ACCOUNT_DOCUMENT_TYPES = new Set(['gap_waiver', 'production_documents', 'other', 'debt_waiver']);

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'adminpass';
const DASHBOARD_USERNAME = process.env.DASHBOARD_USERNAME || null;
const PODIUM_CLIENT_ID = process.env.PODIUM_CLIENT_ID || '';
const PODIUM_CLIENT_SECRET = process.env.PODIUM_CLIENT_SECRET || '';
const PODIUM_REDIRECT_URI = process.env.PODIUM_REDIRECT_URI || '';
const PODIUM_OAUTH_SCOPES = process.env.PODIUM_OAUTH_SCOPES || '';
const PODIUM_LOCATION_UID = process.env.PODIUM_LOCATION_UID || '';
const PODIUM_SENDER_NAME = process.env.PODIUM_SENDER_NAME || '';
const PODIUM_CHANNEL = process.env.PODIUM_CHANNEL || 'sms';
const PODIUM_CHANNEL_IDENTIFIER = process.env.PODIUM_CHANNEL_IDENTIFIER || '';
const PODIUM_FORCED_LOCATION_UID = 'e232a469-efc9-5c8f-be0f-c6ac8050927a';
const PODIUM_FORCED_CHANNEL_TYPE = 'phone';
const PODIUM_ACCOUNT_ROUTING_JSON = process.env.PODIUM_ACCOUNT_ROUTING_JSON || '';
const PODIUM_ACCOUNT_ROUTING_BY_ID_JSON = process.env.PODIUM_ACCOUNT_ROUTING_BY_ID_JSON || '';
const PODIUM_ACCESS_TOKEN = process.env.PODIUM_ACCESS_TOKEN || '';
const PODIUM_REFRESH_TOKEN = process.env.PODIUM_REFRESH_TOKEN || '';
const PODIUM_TOKEN_TYPE = process.env.PODIUM_TOKEN_TYPE || '';
const PODIUM_TOKEN_SCOPE = process.env.PODIUM_TOKEN_SCOPE || '';
const PODIUM_EXPIRES_AT = process.env.PODIUM_EXPIRES_AT || '';
const PODIUM_OAUTH_SEED_FORCE = process.env.PODIUM_OAUTH_SEED_FORCE === 'true';

const PUBLIC_PAGES = new Set([
  '/',
  '/index.html',
  '/quotes.html',
  '/quotes-workspace.html',
  '/single-premium-quote/index.html'
]);
const PUBLIC_API_ROUTES = new Set([
  '/api/config',
  '/api/coverage-requests',
  '/api/coverage-requests/latest',
  '/api/coverage-requests/sync-podium-replies',
  '/api/coverage-requests/summary',
  '/api/coverage-requests/response',
  '/api/credit-unions',
  '/api/account-warranty-configs',
  '/api/podium/oauth/callback'
]);
const PUBLIC_API_PREFIXES = ['/api/loans', '/api/loan-illustrations'];
const DATABASE_OPTIONAL_API_ROUTES = new Set(['/account-warranty-configs']);

async function readJsonObject(filePath, fallback = {}) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch (error) {
    if (error?.code !== 'ENOENT') console.warn(`Unable to read ${filePath}.`, error);
    return fallback;
  }
}

async function writeJsonObject(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

async function readWarrantyConfigStorage() {
  try {
    const raw = await fs.readFile(WARRANTY_CONFIG_STORAGE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn('Unable to read warranty config fallback storage.', error);
    }
  }
  return {};
}

async function writeWarrantyConfigStorage(data) {
  try {
    await fs.mkdir(path.dirname(WARRANTY_CONFIG_STORAGE_PATH), { recursive: true });
    await fs.writeFile(WARRANTY_CONFIG_STORAGE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.warn('Unable to write warranty config fallback storage.', error);
  }
}

async function readPodiumOauthStorage() {
  try {
    const raw = await fs.readFile(PODIUM_OAUTH_STORAGE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn('Unable to read Podium OAuth storage.', error);
    }
  }
  return {};
}

async function writePodiumOauthStorage(data) {
  try {
    await fs.mkdir(path.dirname(PODIUM_OAUTH_STORAGE_PATH), { recursive: true });
    await fs.writeFile(PODIUM_OAUTH_STORAGE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.warn('Unable to write Podium OAuth storage.', error);
  }
}

async function seedPodiumOauthStorageFromEnv() {
  if (!PODIUM_ACCESS_TOKEN && !PODIUM_REFRESH_TOKEN) return;
  const stored = await readPodiumOauthStorage();
  if (!PODIUM_OAUTH_SEED_FORCE && stored.accessToken) return;

  const expiresAt = resolveManualPodiumExpiry(PODIUM_EXPIRES_AT);
  const updated = {
    ...stored,
    accessToken: PODIUM_ACCESS_TOKEN || stored.accessToken || '',
    refreshToken: PODIUM_REFRESH_TOKEN || stored.refreshToken || '',
    tokenType: PODIUM_TOKEN_TYPE || stored.tokenType || 'bearer',
    scope: PODIUM_TOKEN_SCOPE || PODIUM_OAUTH_SCOPES || stored.scope || '',
    expiresAt: expiresAt || stored.expiresAt || decodeJwtExpiry(PODIUM_ACCESS_TOKEN) || null,
    refreshedAt: Date.now(),
    lastGrantType: 'env_seed',
    clientId: PODIUM_CLIENT_ID || stored.clientId || null,
    redirectUri: PODIUM_REDIRECT_URI || stored.redirectUri || null
  };

  await writePodiumOauthStorage(updated);
}

const requiresAuth = (req) => {
  if (req.path.startsWith('/api')) {
    const isPublic =
      PUBLIC_API_ROUTES.has(req.path) || PUBLIC_API_PREFIXES.some((prefix) => req.path.startsWith(prefix));
    return !isPublic;
  }

  if (req.path.endsWith('.html')) {
    return !PUBLIC_PAGES.has(req.path);
  }

  return false;
};

app.use((req, res, next) => {
  if (!requiresAuth(req)) {
    next();
    return;
  }

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

app.use('/account-documents', express.static(ACCOUNT_DOCUMENTS_STORAGE_PATH, {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

async function ensureAccountDocumentsStorage() {
  await fs.mkdir(ACCOUNT_DOCUMENTS_STORAGE_PATH, { recursive: true });
}

function sanitizeDocumentFilename(name = '') {
  const base = String(name || '').trim() || 'document';
  return base.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120);
}

async function removeStoredAccountDocument(storedName) {
  if (!storedName) return;
  const filePath = path.join(ACCOUNT_DOCUMENTS_STORAGE_PATH, storedName);
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn('Unable to remove account document file.', error);
    }
  }
}

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get(['/single-premium-quote/missouri', '/single-premium-quote/missouri/'], (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(publicDir, 'single-premium-quote', 'quote.html'));
});

app.get(['/single-premium-quote/arkansas', '/single-premium-quote/arkansas/'], (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.sendFile(path.join(publicDir, 'single-premium-quote', 'quote.html'));
});

app.get(['/single-premium-quote/admin', '/single-premium-quote/admin/'], (_req, res) => {
  res.redirect(308, '/single-premium-quote/');
});

app.use(express.static(publicDir));

const REVENUE_TYPES = ['Frontend', 'Backend', 'Commission'];
const REPORTING_START_YEAR = 2023;
const REPORTING_START_MONTH = 1;

app.get('/api/config', (req, res) => {
  res.json({
    podiumLocationUid: PODIUM_LOCATION_UID || '',
    podiumSenderName: PODIUM_SENDER_NAME || ''
  });
});

app.get('/api/ncua-credit-unions', async (_req, res) => {
  const base = await readJsonObject(NCUA_CREDIT_UNION_DATA_PATH, { creditUnions: [] });
  const overrides = await readJsonObject(NCUA_CREDIT_UNION_OVERRIDE_PATH, {});
  const creditUnions = (Array.isArray(base.creditUnions) ? base.creditUnions : []).map((creditUnion) => ({
    ...creditUnion,
    ...(overrides[String(creditUnion.charterNumber)] || {}),
    gfsStatus: overrides[String(creditUnion.charterNumber)]?.gfsStatus || 'Unreviewed'
  }));
  res.json({ ...base, count: creditUnions.length, creditUnions });
});

app.patch('/api/ncua-credit-unions/:charterNumber', async (req, res) => {
  const charterNumber = String(req.params.charterNumber || '').trim();
  if (!charterNumber) return res.status(400).json({ error: 'Charter number is required.' });
  const allowed = ['gfsStatus', 'owner', 'priority', 'lastContacted', 'tags', 'notes'];
  const update = {};
  for (const key of allowed) update[key] = String(req.body?.[key] ?? '').trim();
  update.internalUpdatedAt = new Date().toISOString();
  const overrides = await readJsonObject(NCUA_CREDIT_UNION_OVERRIDE_PATH, {});
  overrides[charterNumber] = { ...(overrides[charterNumber] || {}), ...update };
  await writeJsonObject(NCUA_CREDIT_UNION_OVERRIDE_PATH, overrides);
  const base = await readJsonObject(NCUA_CREDIT_UNION_DATA_PATH, { creditUnions: [] });
  const creditUnion = (base.creditUnions || []).find((item) => String(item.charterNumber) === charterNumber);
  if (!creditUnion) return res.status(404).json({ error: 'Credit union was not found in the synchronized NCUA directory.' });
  return res.json({ creditUnion: { ...creditUnion, ...overrides[charterNumber] } });
});

function decodeJwtExpiry(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  try {
    const json = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (json && typeof json.exp === 'number') {
      return json.exp * 1000;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function resolvePodiumExpiry(response) {
  if (typeof response?.expires_at === 'number') {
    return response.expires_at * 1000;
  }
  if (typeof response?.expires_in === 'number') {
    return Date.now() + response.expires_in * 1000;
  }
  const jwtExpiry = decodeJwtExpiry(response?.access_token);
  if (jwtExpiry) return jwtExpiry;
  return Date.now() + 10 * 60 * 60 * 1000;
}

function resolveManualPodiumExpiry(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 10_000_000_000 ? Math.round(value) : Math.round(value * 1000);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) {
      const numeric = Number(trimmed);
      if (Number.isFinite(numeric)) {
        return numeric > 10_000_000_000 ? Math.round(numeric) : Math.round(numeric * 1000);
      }
    }
    const parsed = Date.parse(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function requirePodiumClientConfig(res) {
  if (!PODIUM_CLIENT_ID || !PODIUM_CLIENT_SECRET || !PODIUM_REDIRECT_URI) {
    res.status(500).json({
      error: 'Podium OAuth configuration is missing.',
      details: 'Set PODIUM_CLIENT_ID, PODIUM_CLIENT_SECRET, and PODIUM_REDIRECT_URI.'
    });
    return false;
  }
  return true;
}

async function getPodiumAccessToken({ allowRefresh = true } = {}) {
  const stored = await readPodiumOauthStorage();
  if (!stored.accessToken) {
    const error = new Error('Podium access token is not configured.');
    error.statusCode = 401;
    throw error;
  }
  const expiresAt = Number(stored.expiresAt);
  if (!allowRefresh || !Number.isFinite(expiresAt)) {
    return stored.accessToken;
  }
  if (expiresAt - Date.now() > 2 * 60 * 1000) {
    return stored.accessToken;
  }
  const refreshed = await refreshPodiumAccessToken({ force: true });
  return refreshed.accessToken || stored.accessToken;
}

