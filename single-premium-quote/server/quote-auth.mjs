import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const QUOTE_SESSION_COOKIE = 'gfs_quote_session';
export const QUOTE_SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

export function normalizeQuoteUsername(value) {
  return String(value || '').trim().toLowerCase();
}

export function validateQuotePassword(value) {
  const password = String(value || '');
  if (password.length < 10) {
    return 'Password must be at least 10 characters.';
  }
  if (password.length > 200) {
    return 'Password must be 200 characters or fewer.';
  }
  return '';
}

export function createPasswordRecord(password, salt = randomBytes(16).toString('hex')) {
  return {
    passwordSalt: salt,
    passwordHash: scryptSync(String(password), salt, 64).toString('hex')
  };
}

export function verifyQuotePassword(password, passwordSalt, expectedHash) {
  if (!passwordSalt || !expectedHash) return false;
  const actual = Buffer.from(scryptSync(String(password), passwordSalt, 64).toString('hex'), 'hex');
  const expected = Buffer.from(String(expectedHash), 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createQuoteSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashQuoteSessionToken(token) {
  return createHash('sha256').update(String(token || '')).digest('hex');
}

export function parseCookieHeader(header = '') {
  return String(header)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separator = part.indexOf('=');
      if (separator < 0) return cookies;
      const key = decodeURIComponent(part.slice(0, separator).trim());
      const value = decodeURIComponent(part.slice(separator + 1).trim());
      cookies[key] = value;
      return cookies;
    }, {});
}
