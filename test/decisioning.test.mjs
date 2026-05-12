import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateDecisioningApplication, loadDefaultDecisioningConfig } from '../decisioning/decision-service.mjs';

const config = await loadDefaultDecisioningConfig();

function baseApplication(overrides = {}) {
  return {
    applicationId: 'test-app',
    borrower: {
      grossMonthlyIncome: 7500,
      verifiedIncomeAmount: 7350,
      employmentStatus: 'employed',
      employerTenureMonths: 48,
      memberTenureMonths: 72,
      ...overrides.borrower
    },
    credit: {
      creditScore: 735,
      numberOfOpenTradelines: 8,
      oldestTradelineAgeMonths: 96,
      revolvingUtilization: 0.22,
      totalMonthlyDebtPayments: 1400,
      debtToIncomeRatio: 0.28,
      bankruptcies: { active: false, count: 0 },
      delinquencies: { days30: 0, days60: 0, days90Plus: 0 },
      ...overrides.credit
    },
    cashFlow: {
      averageMonthlyDeposits: 7500,
      payrollDepositDetected: true,
      payrollConsistencyScore: 86,
      averageDailyBalance: 1800,
      overdraftCount90Days: 0,
      nsfCount90Days: 0,
      disposableIncomeEstimate: 1900,
      bankAccountAgeMonths: 60,
      bankAccountOwnershipVerified: true,
      ...overrides.cashFlow
    },
    loanRequest: {
      loanType: 'auto',
      requestedAmount: 24000,
      requestedTermMonths: 66,
      requestedAPR: 7.25,
      downPayment: 2500,
      ...overrides.loanRequest
    },
    collateral: {
      vin: '1HGCM82633A004352',
      year: 2022,
      make: 'Honda',
      model: 'Accord',
      mileage: 32000,
      vehicleValue: 28500,
      amountFinanced: 24000,
      newUsedFlag: 'used',
      titleStatus: 'clear',
      ...overrides.collateral
    },
    fraud: {
      deviceFingerprintRisk: 10,
      ipLocationMismatch: false,
      applicationVelocity: 0,
      emailRisk: 5,
      phoneRisk: 5,
      identityVerificationStatus: 'verified',
      duplicateApplicationMatch: false,
      ...overrides.fraud
    }
  };
}

test('clear approval', () => {
  const result = evaluateDecisioningApplication(baseApplication(), config);
  assert.equal(result.decision, 'approve');
  assert.ok(result.riskScore >= config.thresholds.approveScore);
});

test('hard decline for active bankruptcy', () => {
  const result = evaluateDecisioningApplication(baseApplication({
    credit: { bankruptcies: { active: true, count: 1 } }
  }), config);
  assert.equal(result.decision, 'decline');
  assert.ok(result.reasonCodes.some((reason) => reason.code === 'ACTIVE_BANKRUPTCY'));
});

test('manual review for low credit score', () => {
  const result = evaluateDecisioningApplication(baseApplication({ credit: { creditScore: 590 } }), config);
  assert.equal(result.decision, 'manual_review');
  assert.ok(result.reasonCodes.some((reason) => reason.code === 'LOW_CREDIT_SCORE'));
});

test('counteroffer due to high LTV', () => {
  const result = evaluateDecisioningApplication(baseApplication({
    loanRequest: { requestedAmount: 34000 },
    collateral: { amountFinanced: 34000, vehicleValue: 28500 }
  }), config);
  assert.equal(result.decision, 'counteroffer');
  assert.ok(result.counterofferTerms.requiredDownPayment > 0);
  assert.ok(result.reasonCodes.some((reason) => reason.code === 'HIGH_LTV'));
});

test('counteroffer due to high PTI', () => {
  const result = evaluateDecisioningApplication(baseApplication({
    borrower: { grossMonthlyIncome: 4200, verifiedIncomeAmount: 4200 },
    loanRequest: { requestedAmount: 30000, requestedTermMonths: 36, requestedAPR: 12.5 }
  }), config);
  assert.equal(result.decision, 'counteroffer');
  assert.ok(result.reasonCodes.some((reason) => reason.code === 'HIGH_PTI'));
});

test('fraud review', () => {
  const result = evaluateDecisioningApplication(baseApplication({ fraud: { deviceFingerprintRisk: 82 } }), config);
  assert.equal(result.decision, 'manual_review');
  assert.ok(result.reasonCodes.some((reason) => reason.code === 'HIGH_APPLICATION_FRAUD_RISK'));
});

test('missing data returns manual review support result', () => {
  const result = evaluateDecisioningApplication({ loanRequest: { loanType: 'personal', requestedAmount: 5000 } }, config);
  assert.equal(result.decision, 'manual_review');
  assert.ok(result.requiredConditions.length > 0);
});

test('strong cash-flow but thin credit is reviewable, not a crash', () => {
  const result = evaluateDecisioningApplication(baseApplication({
    credit: { creditScore: 650, numberOfOpenTradelines: 1, oldestTradelineAgeMonths: 8 },
    cashFlow: { payrollDepositDetected: true, payrollConsistencyScore: 95, averageDailyBalance: 4200 }
  }), config);
  assert.ok(['conditional_approval', 'manual_review'].includes(result.decision));
  assert.ok(result.reasonCodes.some((reason) => reason.code === 'LIMITED_CREDIT_HISTORY'));
});

test('high credit score but weak cash-flow is explainable', () => {
  const result = evaluateDecisioningApplication(baseApplication({
    credit: { creditScore: 780 },
    cashFlow: { payrollDepositDetected: false, payrollConsistencyScore: 30, overdraftCount90Days: 9, nsfCount90Days: 4, averageDailyBalance: 50 }
  }), config);
  assert.ok(result.reasonCodes.some((reason) => ['EXCESSIVE_OVERDRAFTS', 'UNSTABLE_CASH_FLOW'].includes(reason.code)));
});

test('old vehicle and high mileage collateral issue', () => {
  const result = evaluateDecisioningApplication(baseApplication({ collateral: { year: 2010, mileage: 155000 } }), config);
  assert.equal(result.decision, 'manual_review');
  assert.ok(result.reasonCodes.some((reason) => reason.code === 'COLLATERAL_TOO_OLD'));
  assert.ok(result.reasonCodes.some((reason) => reason.code === 'HIGH_MILEAGE'));
});
