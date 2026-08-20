import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MOB_PRODUCTION_MONTH,
  MOB_PRODUCTION_SEEDS,
  MOB_PRODUCTION_TOTAL,
  mobProductionSeedForName,
  mobProductionSeedKeyForName
} from '../ncua/mob-production-seed.mjs';

test('contains the complete July 2026 MOB portfolio total', () => {
  assert.equal(MOB_PRODUCTION_MONTH, '2026-07');
  assert.equal(MOB_PRODUCTION_SEEDS.length, 14);
  assert.equal(MOB_PRODUCTION_TOTAL, 108461.08);
});

test('matches carrier and dashboard account-name variants', () => {
  assert.equal(mobProductionSeedKeyForName('MCT Credit Union'), 'mct');
  assert.equal(mobProductionSeedKeyForName('CommonCents Federal CU'), 'commoncents');
  assert.equal(mobProductionSeedKeyForName('UFCW Local 23 Federal Credit Union'), 'ufcw-local-23');
  assert.equal(mobProductionSeedKeyForName('Victoria Teachers Federal Credit Union'), 'victoria-teachers');
});

test('does not assign Jackson County production to the separate teachers account', () => {
  assert.equal(mobProductionSeedKeyForName('Jackson County Teachers FCU'), '');
  assert.equal(mobProductionSeedForName('Jackson County Federal CU')?.mobPremiumCollected, 2406.38);
});

test('preserves zero-production accounts as explicit July entries', () => {
  assert.equal(mobProductionSeedForName('Brazos Valley Schools Credit Union')?.mobPremiumCollected, 0);
  assert.equal(mobProductionSeedForName('NSPIRE Federal Credit Union')?.mobPremiumCollected, 0);
});
