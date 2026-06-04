import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_ADMIN_PARAMETERS,
  calculateAnnuityFactor,
  calculateAnnuityFactorPremium,
  calculateFlatPremium,
  calculateMonthlyPayment,
  calculateQuote
} from '../single-premium-quote/quote-engine.js';

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

test('calculates standard amortized monthly payment', () => {
  const payment = calculateMonthlyPayment(25000, 7.5, 60);
  assert.equal(payment, 500.95);
});

test('calculates zero-interest monthly payment', () => {
  const payment = calculateMonthlyPayment(12000, 0, 48);
  assert.equal(payment, 250);
});

test('calculates annuity factor with monthly rate and term', () => {
  const monthlyRate = 7.5 / 100 / 12;
  const expected = (1 - Math.pow(1 + monthlyRate, -60)) / monthlyRate;
  assert.equal(calculateAnnuityFactor(monthlyRate, 60).toFixed(6), expected.toFixed(6));
});

test('annuity factor falls back to term when monthly rate is zero', () => {
  assert.equal(calculateAnnuityFactor(0, 36), 36);
});

test('flat premium remains the simple comparison fallback', () => {
  assert.equal(calculateFlatPremium(25000, 0.88, 60), 1320);
});

test('annuity factor premium uses present-value factor instead of flat term multiplier', () => {
  const premium = calculateAnnuityFactorPremium(25000, 0.88, 7.5, 60);
  const monthlyRate = 7.5 / 100 / 12;
  const expected = roundCurrency((25000 / 1000) * 0.88 * calculateAnnuityFactor(monthlyRate, 60));
  assert.equal(premium, expected);
  assert.notEqual(premium, calculateFlatPremium(25000, 0.88, 60));
});

test('calculates a full life and disability quote', () => {
  const result = calculateQuote({
    loanAmount: 25000,
    termMonths: 60,
    annualApr: 7.5,
    coverageType: 'both',
    coverageBasis: 'reducing',
    borrowerType: 'single',
    calculationMethod: 'annuity',
    lifeRate: 0.88,
    disabilityRate: 2.12
  });

  assert.equal(result.loanAmount, 25000);
  assert.equal(result.termMonths, 60);
  assert.equal(result.coverageType, 'both');
  assert.ok(result.lifePremium > 0);
  assert.ok(result.disabilityPremium > result.lifePremium);
  assert.equal(result.totalPremium, roundCurrency(result.lifePremium + result.disabilityPremium));
  assert.equal(result.amountFinancedWithPremium, roundCurrency(25000 + result.totalPremium));
  assert.ok(result.monthlyPaymentWithPremium > result.monthlyPayment);
  assert.ok(result.monthlyPaymentImpact > 0);
  assert.ok(result.assumptions.some((assumption) => assumption.includes('annuity factor')));
});

test('carrier placeholder returns annuity-shaped result and warning', () => {
  const annuity = calculateQuote({
    loanAmount: 10000,
    termMonths: 36,
    annualApr: 7.5,
    coverageType: 'life',
    calculationMethod: 'annuity',
    lifeRate: 0.88,
    disabilityRate: 2.12
  });
  const carrier = calculateQuote({
    loanAmount: 10000,
    termMonths: 36,
    annualApr: 7.5,
    coverageType: 'life',
    calculationMethod: 'carrier',
    lifeRate: 0.88,
    disabilityRate: 2.12
  });

  assert.equal(carrier.totalPremium, annuity.totalPremium);
  assert.ok(carrier.warnings.some((warning) => warning.includes('Carrier formula pending')));
});

test('non-blocking warnings are returned for long term and high loan amount', () => {
  const result = calculateQuote({
    loanAmount: 125000,
    termMonths: 144,
    annualApr: 7.5,
    coverageType: 'life',
    calculationMethod: 'annuity',
    lifeRate: 0.88,
    disabilityRate: 2.12
  });

  assert.equal(result.warnings.length, 2);
  assert.ok(result.warnings.some((warning) => warning.includes('120 months')));
  assert.ok(result.warnings.some((warning) => warning.includes('$100,000')));
});

test('admin joint borrower factor can adjust demo rates', () => {
  const single = calculateQuote({
    loanAmount: 10000,
    termMonths: 36,
    annualApr: 7.5,
    coverageType: 'life',
    borrowerType: 'single',
    calculationMethod: 'annuity',
    lifeRate: 0.88,
    disabilityRate: 2.12
  });
  const joint = calculateQuote(
    {
      loanAmount: 10000,
      termMonths: 36,
      annualApr: 7.5,
      coverageType: 'life',
      borrowerType: 'joint',
      calculationMethod: 'annuity',
      lifeRate: 0.88,
      disabilityRate: 2.12
    },
    {
      ...DEFAULT_ADMIN_PARAMETERS,
      jointBorrowerRateFactor: 1.4
    }
  );

  assert.equal(joint.lifePremium, roundCurrency(single.lifePremium * 1.4));
});
