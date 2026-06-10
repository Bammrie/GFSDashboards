import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateCsoGrossPayQuote } from '../src/calculations/csoGrossPay.js';
import { CSO_TEST_CASES } from '../src/data/csoTestCases.js';

function assertClose(actual, expected, tolerance, label, caseId) {
  const delta = Math.abs(Number(actual || 0) - Number(expected || 0));
  assert.ok(
    delta <= tolerance,
    `${caseId} ${label} mismatch: expected ${expected.toFixed(2)}, received ${Number(actual || 0).toFixed(
      2
    )}, delta ${delta.toFixed(2)}`
  );
}

for (const fixture of CSO_TEST_CASES) {
  if (fixture.status === 'pending') {
    test.skip(`${fixture.id} pending carrier table - ${fixture.name}`, () => {});
    continue;
  }

  test(`${fixture.id} ${fixture.name}`, () => {
    const result = calculateCsoGrossPayQuote(fixture.inputs);
    const premiumTolerance = 0.011;
    const disclosureTolerance = 0.2;

    if ('lifePremium' in fixture.expected) {
      assertClose(result.lifePremium, fixture.expected.lifePremium, premiumTolerance, 'lifePremium', fixture.id);
    }
    if ('disabilityPremium' in fixture.expected) {
      assertClose(
        result.disabilityPremium,
        fixture.expected.disabilityPremium,
        premiumTolerance,
        'disabilityPremium',
        fixture.id
      );
    }
    assertClose(result.totalPremium, fixture.expected.totalPremium, premiumTolerance, 'totalPremium', fixture.id);
    assertClose(result.amountFinanced, fixture.expected.amountFinanced, premiumTolerance, 'amountFinanced', fixture.id);
    assertClose(result.financeCharge, fixture.expected.financeCharge, disclosureTolerance, 'financeCharge', fixture.id);
    assertClose(result.totalPayments, fixture.expected.totalPayments, disclosureTolerance, 'totalPayments', fixture.id);
  });
}

test('unsupported loan types are blocking warnings', () => {
  const result = calculateCsoGrossPayQuote({
    ...CSO_TEST_CASES[0].inputs,
    loanType: 'variable_rate'
  });

  assert.equal(result.isBlocked, true);
  assert.ok(result.blockingWarnings.includes('This loan type is not supported for this coverage.'));
});

test('high protected amount returns partial maximum coverage warning without blocking quote', () => {
  const result = calculateCsoGrossPayQuote({
    ...CSO_TEST_CASES[0].inputs,
    loanAmount: 150000
  });

  assert.equal(result.isBlocked, false);
  assert.ok(
    result.warnings.includes(
      'Partial Maximum Coverage: The loan balance is greater than the Debt Protection benefit maximum. Benefits will only be provided up to the maximum coverage amount.'
    )
  );
});

test('prepaid fees affect finance charge and estimated APR without changing financed insurance balance', () => {
  const baseInputs = CSO_TEST_CASES.find((fixture) => fixture.id === 'AR-5').inputs;
  const withoutPrepaidFees = calculateCsoGrossPayQuote(baseInputs);
  const withPrepaidFees = calculateCsoGrossPayQuote({
    ...baseInputs,
    prepaidFees: 250
  });

  assertClose(
    withPrepaidFees.amountFinanced,
    withoutPrepaidFees.amountFinanced,
    0.011,
    'amountFinanced',
    'PREPAID-1'
  );
  assertClose(
    withPrepaidFees.totalPayments,
    withoutPrepaidFees.totalPayments,
    0.011,
    'totalPayments',
    'PREPAID-1'
  );
  assertClose(withPrepaidFees.prepaidFinanceCharge, 250, 0.011, 'prepaidFinanceCharge', 'PREPAID-1');
  assertClose(
    withPrepaidFees.financeCharge,
    withoutPrepaidFees.financeCharge + 250,
    0.011,
    'financeCharge',
    'PREPAID-1'
  );
  assertClose(
    withPrepaidFees.amountFinancedForApr,
    withPrepaidFees.amountFinanced - 250,
    0.011,
    'amountFinancedForApr',
    'PREPAID-1'
  );
  assert.ok(
    withPrepaidFees.estimatedApr > withoutPrepaidFees.estimatedApr,
    `PREPAID-1 estimatedApr should increase when prepaid fees are present. Expected above ${withoutPrepaidFees.estimatedApr}, received ${withPrepaidFees.estimatedApr}`
  );
});
