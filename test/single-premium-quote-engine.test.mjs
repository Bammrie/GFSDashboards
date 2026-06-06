import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_QUOTE_INPUTS,
  PAYMENT_FREQUENCIES,
  calculateQuote
} from '../single-premium-quote/quote-engine.js';

test('quote engine defaults to carrier gross single premium scope', () => {
  assert.equal(DEFAULT_QUOTE_INPUTS.calculationMethod, 'carrierGross');
  assert.equal(DEFAULT_QUOTE_INPUTS.premiumTreatment, 'financed');
  assert.equal(DEFAULT_QUOTE_INPUTS.includePremiumInInsuredBalance, true);
});

test('monthly, weekly, and biweekly frequencies are available', () => {
  assert.deepEqual(Object.keys(PAYMENT_FREQUENCIES), ['monthly', 'biweekly', 'weekly']);
});

test('calculates a CSO gross-pay quote through the public adapter', () => {
  const result = calculateQuote({
    state: 'AR',
    loanAmount: 11000,
    loanFee: 150,
    interestRate: 9.99,
    numberOfPayments: 36,
    paymentFrequency: 'monthly',
    daysToFirstPayment: 30,
    borrowerType: 'single',
    coverageType: 'both',
    loanType: 'installment'
  });

  assert.equal(result.state, 'AR');
  assert.equal(result.loanClass, 'CSO - AR');
  assert.equal(result.paymentFrequency, 'monthly');
  assert.ok(result.lifePremium > 0);
  assert.ok(result.disabilityPremium > 0);
  assert.equal(result.amountFinanced, 12022.81);
});
