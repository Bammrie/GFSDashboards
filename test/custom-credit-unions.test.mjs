import test from 'node:test';
import assert from 'node:assert/strict';

import {
  customCreditUnions,
  mapCustomCreditUnion,
  mergeCustomCreditUnionDirectory
} from '../ncua/custom-credit-unions.mjs';
import { resolveCreditUnionSalesStatus } from '../ncua/ncua-directory-hook.mjs';

test('maps Eastex ASI report fields into the dashboard schema', () => {
  const eastex = customCreditUnions.find((creditUnion) => creditUnion.charterNumber === '97098');

  assert.ok(eastex);
  assert.equal(eastex.name, 'Eastex Credit Union');
  assert.equal(eastex.assets, 131_733_643);
  assert.equal(eastex.members, 11_410);
  assert.equal(eastex.loans, 65_615_297);
  assert.equal(eastex.totalAuto, 36_776_953);
  assert.equal(eastex.indirectAuto, 0);
  assert.equal(eastex.directAuto, 36_776_953);
  assert.equal(eastex.directAutoPercent, 100);
  assert.equal(eastex.firstLienMortgage, 4_752_460);
  assert.equal(eastex.reportCycle, '2026-06');
  assert.equal(eastex.salesStatus, 'Client');
  assert.equal(eastex.customUpload, true);
  assert.ok(Number.isFinite(eastex.latitude));
  assert.ok(Number.isFinite(eastex.longitude));
});

test('maps MCT ASI report fields into the dashboard schema', () => {
  const mct = customCreditUnions.find((creditUnion) => creditUnion.charterNumber === '97089');

  assert.ok(mct);
  assert.equal(mct.name, 'MCT Credit Union');
  assert.equal(mct.assets, 411_271_472);
  assert.equal(mct.members, 21_604);
  assert.equal(mct.loans, 244_941_161);
  assert.equal(mct.totalAuto, 61_202_444);
  assert.equal(mct.indirectAuto, 0);
  assert.equal(mct.directAuto, 61_202_444);
  assert.equal(mct.directAutoPercent, 100);
  assert.equal(mct.firstLienMortgage, 119_121_335);
  assert.deepEqual(mct.history, [{
    cycle: '2026-03',
    assets: 411_271_472,
    members: 21_604,
    loans: 244_941_161
  }]);
});

test('keeps single-report custom clients out of unsupported growth projections', () => {
  customCreditUnions.forEach((creditUnion) => {
    assert.equal(creditUnion.trend, 'Insufficient history');
    assert.deepEqual(creditUnion.projection, []);
    assert.equal(creditUnion.growth.assets.fiveYearPct, null);
  });
});

test('merges custom clients without changing NCUA history-cycle metadata', () => {
  const directory = mergeCustomCreditUnionDirectory({
    count: 1,
    historyCycles: ['2021-03', '2026-03'],
    creditUnions: [{ charterNumber: '123', name: 'NCUA Credit Union', state: 'LA', assets: 10 }]
  });

  assert.equal(directory.count, 3);
  assert.equal(directory.customCreditUnionCount, 2);
  assert.deepEqual(directory.historyCycles, ['2021-03', '2026-03']);
  assert.ok(directory.creditUnions.some((creditUnion) => creditUnion.charterNumber === '123'));
  assert.ok(directory.creditUnions.some((creditUnion) => creditUnion.charterNumber === '97098'));
  assert.ok(directory.creditUnions.some((creditUnion) => creditUnion.charterNumber === '97089'));
});

test('keeps custom clients visible when a shared Mongo record has a blank status', () => {
  assert.equal(resolveCreditUnionSalesStatus('', 'Client'), 'Client');
  assert.equal(resolveCreditUnionSalesStatus(undefined, 'Client'), 'Client');
  assert.equal(resolveCreditUnionSalesStatus('Prospect', 'Client'), 'Prospect');
});

test('validates required custom report fields', () => {
  assert.throws(
    () => mapCustomCreditUnion({ charterNumber: '1' }),
    /assets must be a finite number/
  );
});
