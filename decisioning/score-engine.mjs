import { attachReasonDefinition, clamp, getPolicyValue } from './utils.mjs';

function category(name, rawScore, config, reasonCodes = [], positiveFactors = [], negativeFactors = []) {
  return {
    category: name,
    rawScore: Math.round(clamp(rawScore)),
    normalizedScore: Math.round(clamp(rawScore)),
    reasonCodes,
    positiveFactors,
    negativeFactors
  };
}

function scoreCredit(input, config) {
  const credit = input.credit || {};
  let score = 50;
  const reasons = [];
  const positives = [];
  const negatives = [];

  if (Number.isFinite(credit.creditScore)) {
    if (credit.creditScore >= 760) score += 32;
    else if (credit.creditScore >= 720) score += 24;
    else if (credit.creditScore >= 680) score += 16;
    else if (credit.creditScore >= 640) score += 6;
    else if (credit.creditScore >= 600) score -= 12;
    else score -= 30;
  } else {
    score -= 16;
    reasons.push('MISSING_REQUIRED_DATA');
    negatives.push('Credit score is missing.');
  }

  if ((credit.numberOfOpenTradelines ?? 0) < getPolicyValue(config, 'thinCreditOpenTradelines', input, 3)) {
    score -= 10;
    reasons.push('LIMITED_CREDIT_HISTORY');
    negatives.push('Open tradeline count is limited.');
  }
  if ((credit.oldestTradelineAgeMonths ?? 999) < getPolicyValue(config, 'thinCreditOldestTradelineMonths', input, 24)) {
    score -= 8;
    reasons.push('LIMITED_CREDIT_HISTORY');
    negatives.push('Oldest tradeline age is limited.');
  }
  if (Number.isFinite(credit.revolvingUtilization)) {
    if (credit.revolvingUtilization <= 0.3) {
      score += 8;
      reasons.push('LOW_REVOLVING_UTILIZATION');
      positives.push('Low revolving utilization.');
    } else if (credit.revolvingUtilization > 0.75) {
      score -= 10;
      negatives.push('High revolving utilization.');
    }
  }
  if ((credit.delinquencies?.days60 ?? 0) > 0 || (credit.delinquencies?.days90Plus ?? 0) > 0) {
    score -= 24;
    reasons.push('RECENT_DELINQUENCY');
    negatives.push('Recent 60+ day delinquency reported.');
  }
  if ((credit.collections ?? 0) > 0 || (credit.chargeOffs ?? 0) > 0) {
    score -= 10;
    negatives.push('Collections or charge-offs reported.');
  }
  return category('credit', score, config, reasons, positives, negatives);
}

function scoreCapacity(input, config) {
  const borrower = input.borrower || {};
  const credit = input.credit || {};
  const loan = input.loanRequest || {};
  let score = 55;
  const reasons = [];
  const positives = [];
  const negatives = [];
  const dtiMax = getPolicyValue(config, 'maximumDti', input, 0.45);
  const ptiMax = getPolicyValue(config, 'maximumPti', input, 0.16);

  if (Number.isFinite(credit.debtToIncomeRatio)) {
    if (credit.debtToIncomeRatio <= dtiMax * 0.75) {
      score += 18;
      positives.push('Debt-to-income ratio is comfortably within policy.');
    } else if (credit.debtToIncomeRatio <= dtiMax) score += 4;
    else {
      score -= 24;
      reasons.push('HIGH_DTI');
      negatives.push('Debt-to-income ratio exceeds policy.');
    }
  } else {
    score -= 12;
    reasons.push('MISSING_REQUIRED_DATA');
    negatives.push('Debt-to-income ratio is missing.');
  }

  if (Number.isFinite(loan.paymentToIncomeRatio)) {
    if (loan.paymentToIncomeRatio <= ptiMax * 0.75) {
      score += 16;
      positives.push('Payment-to-income ratio is comfortably within policy.');
    } else if (loan.paymentToIncomeRatio <= ptiMax) score += 4;
    else {
      score -= 26;
      reasons.push('HIGH_PTI');
      negatives.push('Payment-to-income ratio exceeds policy.');
    }
  } else {
    score -= 12;
    reasons.push('MISSING_REQUIRED_DATA');
    negatives.push('Payment-to-income ratio is missing.');
  }

  if (!Number.isFinite(borrower.verifiedIncomeAmount) || borrower.verifiedIncomeAmount <= 0) {
    score -= 16;
    reasons.push('INSUFFICIENT_VERIFIED_INCOME');
    negatives.push('Verified income is missing.');
  } else if (!Number.isFinite(borrower.grossMonthlyIncome) || borrower.verifiedIncomeAmount >= borrower.grossMonthlyIncome * 0.9) {
    score += 8;
    positives.push('Verified income supports stated income.');
  }

  if ((borrower.employerTenureMonths ?? 0) >= 24) score += 5;
  else if (Number.isFinite(borrower.employerTenureMonths) && borrower.employerTenureMonths < 6) score -= 5;
  return category('capacity', score, config, reasons, positives, negatives);
}

function scoreCashFlow(input, config) {
  const cash = input.cashFlow || {};
  let score = 55;
  const reasons = [];
  const positives = [];
  const negatives = [];
  if (cash.payrollDepositDetected) {
    score += 12;
    reasons.push('CONSISTENT_PAYROLL_DEPOSITS');
    positives.push('Payroll deposits detected.');
  }
  if (Number.isFinite(cash.payrollConsistencyScore)) {
    score += (cash.payrollConsistencyScore - 50) * 0.25;
    if (cash.payrollConsistencyScore >= 75) positives.push('Payroll consistency score is strong.');
    if (cash.payrollConsistencyScore < 45) {
      reasons.push('UNSTABLE_CASH_FLOW');
      negatives.push('Payroll consistency score is weak.');
    }
  }
  if ((cash.overdraftCount90Days ?? 0) > getPolicyValue(config, 'maxOverdrafts90Days', input, 6)) {
    score -= 18;
    reasons.push('EXCESSIVE_OVERDRAFTS');
    negatives.push('Overdraft count exceeds configured tolerance.');
  }
  if ((cash.nsfCount90Days ?? 0) > 2) {
    score -= 12;
    reasons.push('UNSTABLE_CASH_FLOW');
    negatives.push('NSF activity is elevated.');
  }
  if (Number.isFinite(cash.averageDailyBalance) && cash.averageDailyBalance > 1000) score += 8;
  else if (Number.isFinite(cash.averageDailyBalance) && cash.averageDailyBalance < 100) score -= 8;
  if (Number.isFinite(cash.disposableIncomeEstimate) && cash.disposableIncomeEstimate > 750) score += 10;
  if (cash.bankAccountOwnershipVerified === false) score -= 12;
  return category('cashFlow', score, config, reasons, positives, negatives);
}

function scoreCollateral(input, config) {
  const loanType = input.loanRequest?.loanType || '';
  const collateral = input.collateral || {};
  if (!loanType.includes('auto')) return category('collateral', 70, config, [], ['No collateral required for unsecured policy.'], []);
  let score = 58;
  const reasons = [];
  const positives = [];
  const negatives = [];
  const maxLtv = getPolicyValue(config, 'maximumLtv', input, 1.05);
  if (Number.isFinite(collateral.loanToValue)) {
    if (collateral.loanToValue <= maxLtv * 0.9) {
      score += 24;
      positives.push('Loan-to-value is comfortably within policy.');
    } else if (collateral.loanToValue <= maxLtv) score += 6;
    else {
      score -= 28;
      reasons.push('HIGH_LTV');
      negatives.push('Loan-to-value exceeds policy.');
    }
  } else {
    score -= 14;
    reasons.push('MISSING_REQUIRED_DATA');
    negatives.push('Loan-to-value could not be calculated.');
  }
  if ((collateral.collateralAgeYears ?? 0) > getPolicyValue(config, 'oldVehicleAgeYears', input, 12)) {
    score -= 14;
    reasons.push('COLLATERAL_TOO_OLD');
    negatives.push('Vehicle age exceeds configured tolerance.');
  }
  if ((collateral.mileage ?? 0) > getPolicyValue(config, 'highMileage', input, 125000)) {
    score -= 12;
    reasons.push('HIGH_MILEAGE');
    negatives.push('Vehicle mileage exceeds configured tolerance.');
  }
  return category('collateral', score, config, reasons, positives, negatives);
}

function scoreRelationship(input, config) {
  const months = input.borrower?.memberTenureMonths;
  let score = 50;
  const reasons = [];
  const positives = [];
  if (Number.isFinite(months) && months >= 60) {
    score = 90;
    reasons.push('STRONG_MEMBER_RELATIONSHIP');
    positives.push('Member tenure is five years or more.');
  } else if (Number.isFinite(months) && months >= 24) score = 75;
  else if (Number.isFinite(months) && months < 6) score = 42;
  return category('relationship', score, config, reasons, positives, []);
}

function scoreFraud(input, config) {
  const fraud = input.fraud || {};
  let score = 88;
  const reasons = [];
  const positives = [];
  const negatives = [];
  score -= (fraud.deviceFingerprintRisk ?? 0) * 0.55;
  score -= (fraud.emailRisk ?? 0) * 0.15;
  score -= (fraud.phoneRisk ?? 0) * 0.15;
  score -= (fraud.applicationVelocity ?? 0) * 4;
  if (fraud.ipLocationMismatch) score -= 10;
  if (fraud.duplicateApplicationMatch) score -= 12;
  const identity = String(fraud.identityVerificationStatus || '').toLowerCase();
  if (['verified', 'pass', 'passed'].includes(identity)) {
    score += 6;
    positives.push('Identity verification passed.');
  } else if (identity && !['unknown', 'not_provided'].includes(identity)) {
    score -= 18;
    reasons.push('IDENTITY_NOT_VERIFIED');
    negatives.push('Identity verification did not pass.');
  }
  if ((fraud.deviceFingerprintRisk ?? 0) >= getPolicyValue(config, 'manualReviewFraudRisk', input, 48)) {
    reasons.push('HIGH_APPLICATION_FRAUD_RISK');
    negatives.push('Device fraud risk exceeds manual review threshold.');
  }
  return category('fraud', score, config, reasons, positives, negatives);
}

export function calculateRiskScores(input, config = {}) {
  const categoryScores = {
    credit: scoreCredit(input, config),
    capacity: scoreCapacity(input, config),
    cashFlow: scoreCashFlow(input, config),
    collateral: scoreCollateral(input, config),
    relationship: scoreRelationship(input, config),
    fraud: scoreFraud(input, config)
  };
  const weights = config.scoreWeights || {};
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + Number(weight || 0), 0) || 1;
  const riskScore = Object.entries(categoryScores).reduce((sum, [key, result]) => sum + result.normalizedScore * (Number(weights[key] || 0) / totalWeight), 0);
  return {
    riskScore: Math.round(clamp(riskScore)),
    categoryScores,
    reasonCodes: Object.values(categoryScores).flatMap((score) => score.reasonCodes).map((code) => attachReasonDefinition(code, config.reasonCodes))
  };
}
