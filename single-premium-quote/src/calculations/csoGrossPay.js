import { CSO_LIMITS, PARTIAL_COVERAGE_WARNINGS, UNSUPPORTED_LOAN_TYPE_WARNING } from '../data/csoLimits.js';
import { CSO_RATE_CONFIG } from '../data/csoRates.js';
import { calculateEstimatedApr, calculateRoundedPaymentSchedule, roundCurrency } from './paymentSchedule.js';

export const PAYMENT_FREQUENCIES = {
  monthly: { label: 'Monthly', paymentsPerYear: 12, periodDays: 30, defaultDaysToFirstPayment: 30 },
  biweekly: { label: 'Biweekly', paymentsPerYear: 26, periodDays: 14, defaultDaysToFirstPayment: 14 },
  weekly: { label: 'Weekly', paymentsPerYear: 52, periodDays: 7, defaultDaysToFirstPayment: 7 }
};

export const COVERAGE_TYPES = {
  life: 'Credit Life',
  disability: 'Credit Disability',
  both: 'Life + Disability',
  none: 'No Coverage'
};

export const BORROWER_TYPES = {
  single: 'Single Borrower',
  joint: 'Joint Borrower',
  coborrower_single: 'Co-Borrower (Single)'
};

export const LOAN_TYPES = {
  installment: 'Installment',
  interest_only: 'Interest Only',
  variable_rate: 'Variable Rate',
  first_mortgage: '1st Mortgage'
};

export const DEFAULT_GROSS_PAY_INPUTS = {
  state: 'MO',
  loanAmount: 25000,
  loanFee: 150,
  prepaidFees: 0,
  interestRate: 7.5,
  numberOfPayments: 60,
  paymentFrequency: 'monthly',
  daysToFirstPayment: 30,
  closingDate: new Date().toISOString().slice(0, 10),
  borrowerDateOfBirth: '',
  coBorrowerDateOfBirth: '',
  loanType: 'installment',
  coverageType: 'both',
  borrowerType: 'single',
  disabilityPlan: 'sevenDayRetro',
  calculationMethod: 'carrierGross',
  premiumTreatment: 'financed',
  includePremiumInInsuredBalance: true
};

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function coverageIncludesLife(coverageType) {
  return coverageType === 'life' || coverageType === 'both';
}

function coverageIncludesDisability(coverageType) {
  return coverageType === 'disability' || coverageType === 'both';
}

function ageOnDate(dateOfBirth, asOfDate) {
  if (!dateOfBirth || !asOfDate) return null;
  const birth = new Date(`${dateOfBirth}T00:00:00`);
  const asOf = new Date(`${asOfDate}T00:00:00`);
  if (Number.isNaN(birth.getTime()) || Number.isNaN(asOf.getTime())) return null;

  let age = asOf.getFullYear() - birth.getFullYear();
  const monthDelta = asOf.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && asOf.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function addMonths(dateText, months) {
  const date = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function normalizeInputs(inputs = {}) {
  const merged = { ...DEFAULT_GROSS_PAY_INPUTS, ...inputs };
  const frequency = PAYMENT_FREQUENCIES[merged.paymentFrequency] ? merged.paymentFrequency : 'monthly';
  const state = CSO_RATE_CONFIG[merged.state] ? merged.state : 'MO';

  return {
    ...merged,
    state,
    loanAmount: toNumber(merged.loanAmount, DEFAULT_GROSS_PAY_INPUTS.loanAmount),
    loanFee: toNumber(merged.loanFee, DEFAULT_GROSS_PAY_INPUTS.loanFee),
    prepaidFees: toNumber(merged.prepaidFees, DEFAULT_GROSS_PAY_INPUTS.prepaidFees),
    interestRate: toNumber(merged.interestRate ?? merged.annualApr, DEFAULT_GROSS_PAY_INPUTS.interestRate),
    numberOfPayments: Math.max(1, Math.floor(toNumber(merged.numberOfPayments ?? merged.termMonths, 60))),
    paymentFrequency: frequency,
    daysToFirstPayment: toNumber(
      merged.daysToFirstPayment,
      PAYMENT_FREQUENCIES[frequency].defaultDaysToFirstPayment
    ),
    coverageType: COVERAGE_TYPES[merged.coverageType] ? merged.coverageType : 'both',
    borrowerType: BORROWER_TYPES[merged.borrowerType] ? merged.borrowerType : 'single',
    loanType: LOAN_TYPES[merged.loanType] ? merged.loanType : 'installment',
    disabilityPlan: 'sevenDayRetro',
    calculationMethod: 'carrierGross',
    premiumTreatment: 'financed',
    includePremiumInInsuredBalance: true
  };
}

function lifeRateForBorrower(stateRates, borrowerType) {
  if (borrowerType === 'joint') {
    return stateRates.lifeRatesPer100PerYear.jointDecreasing;
  }
  return stateRates.lifeRatesPer100PerYear.singleDecreasing;
}

function equivalentCoverageMonths(numberOfPayments, paymentsPerYear) {
  return Math.max(1, Math.ceil((numberOfPayments / paymentsPerYear) * 12));
}

function calculateGrossFactor({ interestRate, paymentsPerYear, periodDays, daysToFirstPayment, numberOfPayments, adjustment = 0 }) {
  const i = interestRate / 100 / paymentsPerYear;
  const n = numberOfPayments;
  const annuityFactor = i === 0 ? n : (1 - Math.pow(1 + i, -n)) / i;
  const firstPaymentAdjustment = i === 0 ? 1 : (1 + (daysToFirstPayment * i) / periodDays) / (1 + i);
  const rawGrossFactor = annuityFactor / firstPaymentAdjustment;

  return {
    periodicRate: i,
    annuityFactor,
    firstPaymentAdjustment,
    rawGrossFactor,
    grossFactor: rawGrossFactor - adjustment
  };
}

function applyMinimumPremium(premium, minimumPremium, enabled) {
  if (!enabled) return premium;
  return premium > 0 && premium < minimumPremium ? minimumPremium : premium;
}

function buildAgeWarnings(inputs, limits, protectedTermMonths, warnings) {
  const maturityDate = addMonths(inputs.closingDate, protectedTermMonths);
  const borrowerIssueAge = ageOnDate(inputs.borrowerDateOfBirth, inputs.closingDate);
  const borrowerMaturityAge = ageOnDate(inputs.borrowerDateOfBirth, maturityDate);
  const coBorrowerIssueAge = ageOnDate(inputs.coBorrowerDateOfBirth, inputs.closingDate);
  const coBorrowerMaturityAge = ageOnDate(inputs.coBorrowerDateOfBirth, maturityDate);
  const ages = [borrowerIssueAge, borrowerMaturityAge, coBorrowerIssueAge, coBorrowerMaturityAge].filter(
    (age) => age !== null
  );

  if (
    ages.some((age) => age > limits.maxAgeAtMaturity) ||
    [borrowerIssueAge, coBorrowerIssueAge].filter((age) => age !== null).some((age) => age > limits.maxIssueAge)
  ) {
    warnings.push(PARTIAL_COVERAGE_WARNINGS.age);
  }

  return {
    borrowerIssueAge,
    borrowerMaturityAge,
    coBorrowerIssueAge,
    coBorrowerMaturityAge,
    maturityDate
  };
}

export function calculateCsoGrossPayQuote(inputs = {}, options = {}) {
  const normalized = normalizeInputs(inputs);
  const stateRates = options.rateConfig?.[normalized.state] || CSO_RATE_CONFIG[normalized.state];
  const limits = options.limits?.[normalized.state] || CSO_LIMITS[normalized.state];
  const frequency = PAYMENT_FREQUENCIES[normalized.paymentFrequency];
  const includeLife = coverageIncludesLife(normalized.coverageType);
  const includeDisability = coverageIncludesDisability(normalized.coverageType);
  const warnings = [];
  const blockingWarnings = [];

  if (limits.unsupportedLoanTypes.includes(normalized.loanType)) {
    blockingWarnings.push(UNSUPPORTED_LOAN_TYPE_WARNING);
  }

  const prepaidFees = Math.max(0, normalized.prepaidFees);
  const baseAmountFinancedBeforeInsurance = normalized.loanAmount + normalized.loanFee;
  const originalEquivalentCoverageMonths = equivalentCoverageMonths(
    normalized.numberOfPayments,
    frequency.paymentsPerYear
  );
  const protectedEquivalentCoverageMonths = Math.min(
    originalEquivalentCoverageMonths,
    limits.maxProtectedTermMonths
  );
  const protectedNumberOfPayments = Math.min(
    normalized.numberOfPayments,
    Math.floor((limits.maxProtectedTermMonths / 12) * frequency.paymentsPerYear)
  );
  const protectedTermMonths = protectedEquivalentCoverageMonths;

  if (baseAmountFinancedBeforeInsurance > limits.maxProtectedLoanAmount) {
    warnings.push(PARTIAL_COVERAGE_WARNINGS.protectedAmount);
  }

  if (originalEquivalentCoverageMonths > limits.maxProtectedTermMonths) {
    warnings.push(PARTIAL_COVERAGE_WARNINGS.protectedTerm);
  }

  const ageInfo = buildAgeWarnings(normalized, limits, protectedTermMonths, warnings);
  const factor = calculateGrossFactor({
    interestRate: normalized.interestRate,
    paymentsPerYear: frequency.paymentsPerYear,
    periodDays: frequency.periodDays,
    daysToFirstPayment: normalized.daysToFirstPayment,
    numberOfPayments: normalized.numberOfPayments,
    adjustment: stateRates.grossFactorWorksheetAdjustment || 0
  });

  const protectedYearsFactor =
    (protectedNumberOfPayments +
      (normalized.daysToFirstPayment - frequency.periodDays) / frequency.periodDays) /
    frequency.paymentsPerYear;
  const lifeRate = lifeRateForBorrower(stateRates, normalized.borrowerType);
  const disabilityTable = stateRates.disabilityRatesPer100[normalized.disabilityPlan] || {};
  const disabilityRate =
    disabilityTable[clamp(protectedEquivalentCoverageMonths, 1, limits.maxProtectedTermMonths)] || 0;
  const lifeCoeff = includeLife
    ? protectedNumberOfPayments * protectedYearsFactor * (lifeRate / 100)
    : 0;
  const disabilityCoeff = includeDisability
    ? protectedNumberOfPayments * (disabilityRate / 100)
    : 0;
  const denominator = factor.grossFactor - lifeCoeff - disabilityCoeff;
  const provisionalPayment = denominator > 0 ? baseAmountFinancedBeforeInsurance / denominator : 0;
  const maxProtectedPayment = limits.maxProtectedLoanAmount / normalized.numberOfPayments;
  const protectedDisabilityPayment = includeDisability
    ? Math.min(provisionalPayment, limits.maxMonthlyDisabilityBenefit, maxProtectedPayment)
    : 0;

  if (includeDisability && provisionalPayment > limits.maxMonthlyDisabilityBenefit) {
    warnings.push(PARTIAL_COVERAGE_WARNINGS.disabilityPayment);
  }

  const rawLifeProtectedPayment = includeLife
    ? (baseAmountFinancedBeforeInsurance +
        provisionalPayment * lifeCoeff +
        protectedDisabilityPayment * disabilityCoeff) /
      factor.grossFactor
    : 0;
  const protectedLifePayment = includeLife ? Math.min(rawLifeProtectedPayment, maxProtectedPayment) : 0;
  let lifePremium = includeLife ? protectedLifePayment * lifeCoeff : 0;
  let disabilityPremium = includeDisability ? protectedDisabilityPayment * disabilityCoeff : 0;
  const minimumPremiumAppliesPerProduct = options.minimumPremiumAppliesPerProduct ?? true;
  lifePremium = applyMinimumPremium(lifePremium, limits.minimumPremium, minimumPremiumAppliesPerProduct);
  disabilityPremium = applyMinimumPremium(
    disabilityPremium,
    limits.minimumPremium,
    minimumPremiumAppliesPerProduct
  );
  lifePremium = roundCurrency(lifePremium);
  disabilityPremium = roundCurrency(disabilityPremium);
  const totalPremium = roundCurrency(lifePremium + disabilityPremium);
  const amountFinanced = roundCurrency(baseAmountFinancedBeforeInsurance + totalPremium);
  const schedule = calculateRoundedPaymentSchedule({
    amountFinanced,
    grossFactor: factor.grossFactor,
    numberOfPayments: normalized.numberOfPayments
  });
  const noInsuranceSchedule = calculateRoundedPaymentSchedule({
    amountFinanced: baseAmountFinancedBeforeInsurance,
    grossFactor: factor.grossFactor,
    numberOfPayments: normalized.numberOfPayments
  });
  const interestFinanceCharge = schedule.financeCharge;
  const prepaidFinanceCharge = roundCurrency(prepaidFees);
  const financeCharge = roundCurrency(interestFinanceCharge + prepaidFinanceCharge);
  const amountFinancedForApr = roundCurrency(Math.max(0, amountFinanced - prepaidFinanceCharge));
  const estimatedApr = calculateEstimatedApr({
    amountFinancedForApr,
    regularPayment: schedule.regularPayment,
    finalPayment: schedule.finalPayment,
    numberOfPayments: normalized.numberOfPayments,
    paymentsPerYear: frequency.paymentsPerYear,
    daysToFirstPayment: normalized.daysToFirstPayment,
    periodDays: frequency.periodDays
  });
  const costPerPeriod = roundCurrency(schedule.regularPayment - noInsuranceSchedule.regularPayment);
  const costPerDay = roundCurrency(totalPremium / Math.max(1, protectedTermMonths * 30));
  const originalLifeAmountOfCoverage = includeLife ? roundCurrency(protectedLifePayment * normalized.numberOfPayments) : 0;
  const originalDisabilityPaymentCoverage = includeDisability ? roundCurrency(protectedDisabilityPayment) : 0;
  const totalDisabilityBenefit = includeDisability
    ? roundCurrency(originalDisabilityPaymentCoverage * protectedNumberOfPayments)
    : 0;

  return {
    ...normalized,
    loanClass: stateRates.loanClass,
    stateName: stateRates.stateName,
    loanAmount: roundCurrency(normalized.loanAmount),
    loanFee: roundCurrency(normalized.loanFee),
    prepaidFees: prepaidFinanceCharge,
    baseAmountFinancedBeforeInsurance: roundCurrency(baseAmountFinancedBeforeInsurance),
    interestRate: normalized.interestRate,
    numberOfPayments: normalized.numberOfPayments,
    paymentFrequency: normalized.paymentFrequency,
    paymentFrequencyLabel: frequency.label,
    daysToFirstPayment: normalized.daysToFirstPayment,
    grossFactor: factor.grossFactor,
    rawGrossFactor: factor.rawGrossFactor,
    equivalentCoverageMonths: protectedEquivalentCoverageMonths,
    originalEquivalentCoverageMonths,
    protectedNumberOfPayments,
    protectedTermMonths,
    lifeRate,
    disabilityRate,
    provisionalPayment,
    protectedLifePayment,
    protectedDisabilityPayment,
    lifePremium,
    disabilityPremium,
    totalPremium,
    amountFinanced,
    amountFinancedForApr,
    interestFinanceCharge,
    prepaidFinanceCharge,
    financeCharge,
    estimatedApr,
    totalPayments: schedule.totalPayments,
    regularPayment: schedule.regularPayment,
    finalPayment: schedule.finalPayment,
    costPerPeriod,
    costPerDay,
    originalLifeAmountOfCoverage,
    originalDisabilityPaymentCoverage,
    totalDisabilityBenefit,
    warnings,
    blockingWarnings,
    isBlocked: blockingWarnings.length > 0,
    assumptions: [
      'Gross Pay / Gross Indebtedness means Total of Payments.',
      'Single premium is always financed into the loan.',
      'Premium is included in insured balance / gross indebtedness.',
      '7-Day Retroactive Disability is the active default waiting period.',
      'Texas requires a separate formula set and is not supported in this prototype.'
    ],
    ...ageInfo
  };
}
