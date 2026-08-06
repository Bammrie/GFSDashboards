import test from 'node:test';
import assert from 'node:assert/strict';

import {
  mergeProductionEntry,
  normalizeProductionMonth,
  sanitizeClientProducts,
  sanitizeProductionEntries
} from '../ncua/ncua-client-products-hook.mjs';

test('keeps supported client products in dashboard order', () => {
  assert.deepEqual(
    sanitizeClientProducts(['VSC', 'Unknown', 'MOB Coverage', 'VSC']),
    ['MOB Coverage', 'VSC']
  );
});

test('accepts only calendar production months', () => {
  assert.equal(normalizeProductionMonth('2026-08'), '2026-08');
  assert.equal(normalizeProductionMonth('2026-13'), '');
  assert.equal(normalizeProductionMonth('August 2026'), '');
});

test('sanitizes monthly MOB dollars and GAP/VSC policy counts', () => {
  assert.deepEqual(
    sanitizeProductionEntries([
      { month: '2026-08', mobPremiumCollected: 12500.129, gapPoliciesSold: 22, vscPoliciesSold: 11 },
      { month: 'bad', mobPremiumCollected: 50 },
      { month: '2026-07', gapPoliciesSold: 2.5, vscPoliciesSold: -1 }
    ]).map(({ updatedAt, ...entry }) => entry),
    [{ month: '2026-08', mobPremiumCollected: 12500.13, gapPoliciesSold: 22, vscPoliciesSold: 11 }]
  );
});

test('merges a partial monthly update without erasing other product production', () => {
  const entries = mergeProductionEntry(
    [{ month: '2026-08', gapPoliciesSold: 18, vscPoliciesSold: 9, updatedAt: '2026-08-01T00:00:00.000Z' }],
    '2026-08',
    { mobPremiumCollected: 18450.75 },
    new Date('2026-08-06T12:00:00.000Z')
  );

  assert.equal(entries.length, 1);
  assert.equal(entries[0].month, '2026-08');
  assert.equal(entries[0].mobPremiumCollected, 18450.75);
  assert.equal(entries[0].gapPoliciesSold, 18);
  assert.equal(entries[0].vscPoliciesSold, 9);
  assert.equal(entries[0].updatedAt.toISOString(), '2026-08-06T12:00:00.000Z');
});

test('rejects merging production into an invalid month', () => {
  assert.throws(
    () => mergeProductionEntry([], '2026-00', { gapPoliciesSold: 1 }),
    /valid production month/
  );
});
