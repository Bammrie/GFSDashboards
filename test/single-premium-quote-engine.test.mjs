import assert from 'node:assert/strict';
import test from 'node:test';
import { demoRates } from '../single-premium-quote/src/data/demoRates.js';
import {
  FIXED_SCOPE,
  PROTOTYPE_DISCLAIMER,
  buildMonthlyAmortizationSchedule,
  calculateGrossPayBase,
  calculateGrossPaySinglePremium,
  calculateMonthlyPayment,
  calculateQuote
} from '../single-premium-quote/quote-engine.js';

const roundCurrency = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

test('fixed scope is monthly gross pay seven-day retro', () => {
  assert.equal(FIXED_SCOPE.paymentFrequency, 'monthly');
  assert.equal(FIXED_SCOPE.paymentsPerYear, 12);
  assert.equal(FIXED_SCOPE.coverageBasis, 'grossPay');
  assert.equal(FIXED_SCOPE.disabilityPlan, 'sevenDayRetro');
});

test('calculates standard monthly loan payment', () => {
  assert.equal(calculateMonthlyPayment(25000, 7.5, 60), 500.95);
});

test('builds monthly amortization schedule', () => {
  const schedule = buildMonthlyAmortizationSchedule(10000, 9, 36);
  assert.equal(schedule.periods, 36);
  assert.equal(schedule.payments.length, 36);
  assert.equal(schedule.monthlyPayment, calculateMonthlyPayment(10000, 9, 36));
  assert.equal(schedule.periodicRate, 9 / 100 / 12);
});

test('gross pay base uses scheduled monthly payment stream', () => {
  const schedule = buildMonthlyAmortizationSchedule(25000, 7.5, 60);
  assert.equal(calculateGrossPayBase(schedule), roundCurrency(schedule.monthlyPayment * 60));
});

test('gross pay premium uses exposure per thousand times demo rate', () => {
  const premium = calculateGrossPaySinglePremium({
    monthlyPayment: 500.95,
    termMonths: 60,
    rate: 0.5,
    discountRateMonthly: 0,
    applyDiscount: false
  });

  assert.equal(premium.grossPayExposure, 30057);
  assert.equal(premium.premium, 15.03);
});

test('smart demo applies demo discount factor to gross pay exposure', () => {
  const undiscounted = calculateQuote({
    state: 'MO',
    loanAmount: 25000,
    termMonths: 60,
    annualApr: 7.5,
    coverageType: 'life',
    borrowerType: 'single',
    premiumTreatment: 'financed',
    calculationMethod: 'grossPay'
  }, demoRates);
  const smart = calculateQuote({
    state: 'MO',
    loanAmount: 25000,
    termMonths: 60,
    annualApr: 7.5,
    coverageType: 'life',
    borrowerType: 'single',
    premiumTreatment: 'financed',
    calculationMethod: 'smart'
  }, demoRates);

  assert.ok(smart.grossPayExposureUsed < undiscounted.grossPayExposureUsed);
  assert.ok(smart.lifePremium < undiscounted.lifePremium);
});

test('calculates Missouri life and disability financed quote', () => {
  const result = calculateQuote({
    state: 'MO',
    loanAmount: 25000,
    termMonths: 60,
    annualApr: 7.5,
    coverageType: 'both',
    borrowerType: 'single',
    premiumTreatment: 'financed',
    calculationMethod: 'smart'
  }, demoRates);

  assert.equal(result.state, 'MO');
  assert.equal(result.paymentFrequency, 'monthly');
  assert.equal(result.coverageBasis, 'grossPay');
  assert.equal(result.disabilityPlan, 'sevenDayRetro');
  assert.ok(result.lifePremium > 0);
  assert.ok(result.disabilityPremium > result.lifePremium);
  assert.equal(result.totalPremium, roundCurrency(result.lifePremium + result.disabilityPremium));
  assert.ok(result.monthlyPaymentWithPremium > result.monthlyPayment);
  assert.ok(result.warnings.includes(PROTOTYPE_DISCLAIMER));
  assert.ok(result.warnings.some((warning) => warning.includes('7-Day Retro Disability')));
});

test('separately paid premium does not change financed payment', () => {
  const result = calculateQuote({
    state: 'AR',
    loanAmount: 10000,
    termMonths: 36,
    annualApr: 9,
    coverageType: 'life',
    borrowerType: 'single',
    premiumTreatment: 'separate',
    calculationMethod: 'grossPay'
  }, demoRates);

  assert.equal(result.amountFinancedWithPremium, result.loanAmount);
  assert.equal(result.monthlyPaymentWithPremium, result.monthlyPayment);
  assert.equal(result.monthlyPaymentImpact, 0);
});

test('carrier placeholder returns demo result and carrier warning', () => {
  const carrier = calculateQuote({
    state: 'AR',
    loanAmount: 30000,
    termMonths: 72,
    annualApr: 7,
    coverageType: 'both',
    borrowerType: 'joint',
    premiumTreatment: 'financed',
    calculationMethod: 'carrier'
  }, demoRates);

  assert.ok(carrier.totalPremium > 0);
  assert.ok(carrier.warnings.some((warning) => warning.includes('Carrier formula pending')));
  assert.ok(carrier.warnings.some((warning) => warning.includes('Joint borrower rules pending')));
});

test('financed premium in insured balance warning is returned', () => {
  const result = calculateQuote({
    state: 'MO',
    loanAmount: 18000,
    termMonths: 48,
    annualApr: 8.25,
    coverageType: 'disability',
    borrowerType: 'single',
    premiumTreatment: 'financed',
    includePremiumInInsuredBalance: true,
    calculationMethod: 'smart'
  }, demoRates);

  assert.ok(result.warnings.some((warning) => warning.includes('recursive calculation')));
});

test('high amount warning matches carrier validation need', () => {
  const result = calculateQuote({
    state: 'MO',
    loanAmount: 125000,
    termMonths: 120,
    annualApr: 8,
    coverageType: 'both',
    borrowerType: 'single',
    premiumTreatment: 'financed',
    calculationMethod: 'smart'
  }, demoRates);

  assert.ok(result.warnings.some((warning) => warning.includes('Loan amount exceeds demo threshold')));
});
