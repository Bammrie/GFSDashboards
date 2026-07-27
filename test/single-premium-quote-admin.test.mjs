import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createPasswordRecord,
  parseCookieHeader,
  validateQuotePassword,
  verifyQuotePassword
} from '../single-premium-quote/server/quote-auth.mjs';
import {
  defaultQuoteProgramConfig,
  normalizeQuoteProgramConfig
} from '../single-premium-quote/server/program-config.mjs';

test('password records verify the correct password only', () => {
  const record = createPasswordRecord('a-secure-password');
  assert.equal(verifyQuotePassword('a-secure-password', record.passwordSalt, record.passwordHash), true);
  assert.equal(verifyQuotePassword('wrong-password', record.passwordSalt, record.passwordHash), false);
  assert.match(validateQuotePassword('short'), /at least 10/);
});

test('cookie parser returns the quote session token', () => {
  assert.deepEqual(parseCookieHeader('theme=light; gfs_quote_session=abc123'), {
    theme: 'light',
    gfs_quote_session: 'abc123'
  });
});

test('program config normalizes editable rates and limits by state', () => {
  const config = normalizeQuoteProgramConfig('AR', {
    organizationName: 'Arkansas Community Bank',
    rateConfig: {
      lifeRatesPer100PerYear: { singleDecreasing: 0.72 },
      disabilityRatesPer100: { sevenDayRetro: [0.6, 1.1] }
    },
    limits: {
      maxProtectedLoanAmount: 150000,
      maxProtectedTermMonths: 2,
      unsupportedLoanTypes: ['first_mortgage', 'not-a-loan-type']
    }
  });

  assert.equal(config.state, 'AR');
  assert.equal(config.organizationName, 'Arkansas Community Bank');
  assert.equal(config.rateConfig.lifeRatesPer100PerYear.singleDecreasing, 0.72);
  assert.deepEqual(config.rateConfig.disabilityRatesPer100.sevenDayRetro, { 1: 0.6, 2: 1.1 });
  assert.equal(config.limits.maxProtectedLoanAmount, 150000);
  assert.deepEqual(config.limits.unsupportedLoanTypes, ['first_mortgage']);
});

test('default program configs remain state-specific', () => {
  const missouri = defaultQuoteProgramConfig('MO');
  const arkansas = defaultQuoteProgramConfig('AR');
  assert.notEqual(
    missouri.rateConfig.lifeRatesPer100PerYear.singleDecreasing,
    arkansas.rateConfig.lifeRatesPer100PerYear.singleDecreasing
  );
});
