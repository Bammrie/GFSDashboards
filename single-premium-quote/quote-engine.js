export const SUPPORTED_STATES = {
  MO: 'Missouri',
  AR: 'Arkansas'
};

export const COVERAGE_TYPES = {
  life: 'Credit Life',
  disability: 'Credit Disability',
  both: 'Life + Disability'
};

export const BORROWER_TYPES = {
  single: 'Single Borrower',
  joint: 'Joint Borrower'
};

export const PREMIUM_TREATMENTS = {
  separate: 'Paid Up Front Separately',
  financed: 'Financed Into Loan'
};

export const CALCULATION_METHODS = {
  smart: 'Smart Demo Engine',
  grossPay: 'Gross Pay Demo',
  carrier: 'Carrier Formula Placeholder'
};

export const FIXED_SCOPE = {
  paymentFrequency: 'monthly',
  paymentsPerYear: 12,
  termUnit: 'months',
  paymentTiming: 'endOfPeriod',
  coverageBasis: 'grossPay',
  disabilityPlan: 'sevenDayRetro'
};

export const DEFAULT_QUOTE_INPUTS = {
  state: 'MO',
  loanAmount: 25000,
  termMonths: 60,
  annualApr: 7.5,
  coverageType: 'both',
  borrowerType: 'single',
  premiumTreatment: 'financed',
  includePremiumInInsuredBalance: false,
  activelyWorking: true,
  hoursWorkedPerWeek: 30,
  calculationMethod: 'smart'
};

export const DEFAULT_ENGINE_PARAMETERS = {
  warningLoanAmount: 100000,
  warningTermMonths: 120,
  minimumDisabilityHoursPerWeek: 30,
  carrierFormulaStatus:
    'Carrier formula pending. This result is for prototype structure only.'
};

export const PROTOTYPE_DISCLAIMER =
  'Prototype only. Configured for monthly loan payments, gross pay basis, 7-day retro Disability, Missouri and Arkansas. Final premium must be validated using CSO-approved formulas, rates, factor tables, rounding rules, eligibility rules, and sample test cases.';

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const roundCurrency = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const roundFactor = (value) => Math.round((toNumber(value) + Number.EPSILON) * 1000000) / 1000000;

export function coverageIncludesLife(coverageType) {
  return coverageType === 'life' || coverageType === 'both';
}

export function coverageIncludesDisability(coverageType) {
  return coverageType === 'disability' || coverageType === 'both';
}

export function calculateMonthlyPayment(loanAmount, annualApr, termMonths) {
  const principal = toNumber(loanAmount);
  const months = toNumber(termMonths);
  const periodicRate = toNumber(annualApr) / 100 / FIXED_SCOPE.paymentsPerYear;

  if (principal <= 0 || months <= 0) {
    return 0;
  }

  if (periodicRate === 0) {
    return roundCurrency(principal / months);
  }

  return roundCurrency((principal * periodicRate) / (1 - Math.pow(1 + periodicRate, -months)));
}

export function buildMonthlyAmortizationSchedule(loanAmount, annualApr, termMonths) {
  const principal = toNumber(loanAmount);
  const months = Math.max(0, Math.floor(toNumber(termMonths)));
  const periodicRate = toNumber(annualApr) / 100 / FIXED_SCOPE.paymentsPerYear;
  const monthlyPayment = calculateMonthlyPayment(principal, annualApr, months);
  let balance = principal;
  const payments = [];

  for (let period = 1; period <= months; period += 1) {
    const interest = roundCurrency(balance * periodicRate);
    const principalPaid = roundCurrency(Math.min(balance, monthlyPayment - interest));
    balance = roundCurrency(Math.max(0, balance - principalPaid));
    payments.push({
      period,
      payment: monthlyPayment,
      interest,
      principal: principalPaid,
      endingBalance: balance
    });
  }

  return {
    monthlyPayment,
    periodicRate,
    periods: months,
    payments
  };
}

export function calculateGrossPayBase(schedule) {
  // Gross Pay definition must be confirmed by carrier.
  // This prototype uses the scheduled monthly payment stream as the gross pay basis.
  const monthlyPayment = toNumber(schedule?.monthlyPayment);
  const periods = toNumber(schedule?.periods);
  return roundCurrency(monthlyPayment * periods);
}

function calculateDiscountFactor(discountRateMonthly, termMonths) {
  const rate = toNumber(discountRateMonthly);
  const months = toNumber(termMonths);

  if (months <= 0) {
    return 0;
  }

  if (rate === 0) {
    return months;
  }

  return (1 - Math.pow(1 + rate, -months)) / rate;
}

export function calculateGrossPaySinglePremium({
  monthlyPayment,
  termMonths,
  rate,
  rateUnit = 'perThousandGrossPay',
  discountRateMonthly = 0,
  applyDiscount = false
}) {
  const grossPayExposure = roundCurrency(toNumber(monthlyPayment) * toNumber(termMonths));
  const discountFactor = calculateDiscountFactor(discountRateMonthly, termMonths);
  const discountedGrossPayExposure = roundCurrency(toNumber(monthlyPayment) * discountFactor);
  const exposureUsed = applyDiscount ? discountedGrossPayExposure : grossPayExposure;
  const premium = roundCurrency((exposureUsed / 1000) * toNumber(rate));

  return {
    rateUnit,
    grossPayExposure,
    discountedGrossPayExposure,
    exposureUsed,
    discountFactor: roundFactor(discountFactor),
    premium
  };
}

function normalizeQuoteInputs(inputs = {}) {
  const normalized = {
    ...DEFAULT_QUOTE_INPUTS,
    ...inputs,
    state: SUPPORTED_STATES[inputs.state] ? inputs.state : DEFAULT_QUOTE_INPUTS.state,
    loanAmount: toNumber(inputs.loanAmount, DEFAULT_QUOTE_INPUTS.loanAmount),
    termMonths: toNumber(inputs.termMonths, DEFAULT_QUOTE_INPUTS.termMonths),
    annualApr: toNumber(inputs.annualApr, DEFAULT_QUOTE_INPUTS.annualApr),
    hoursWorkedPerWeek: toNumber(
      inputs.hoursWorkedPerWeek,
      DEFAULT_QUOTE_INPUTS.hoursWorkedPerWeek
    ),
    includePremiumInInsuredBalance:
      inputs.premiumTreatment === 'financed' && Boolean(inputs.includePremiumInInsuredBalance),
    activelyWorking:
      typeof inputs.activelyWorking === 'boolean'
        ? inputs.activelyWorking
        : DEFAULT_QUOTE_INPUTS.activelyWorking,
    calculationMethod: CALCULATION_METHODS[inputs.calculationMethod]
      ? inputs.calculationMethod
      : DEFAULT_QUOTE_INPUTS.calculationMethod
  };

  if (!COVERAGE_TYPES[normalized.coverageType]) {
    normalized.coverageType = DEFAULT_QUOTE_INPUTS.coverageType;
  }

  if (!BORROWER_TYPES[normalized.borrowerType]) {
    normalized.borrowerType = DEFAULT_QUOTE_INPUTS.borrowerType;
  }

  if (!PREMIUM_TREATMENTS[normalized.premiumTreatment]) {
    normalized.premiumTreatment = DEFAULT_QUOTE_INPUTS.premiumTreatment;
  }

  return normalized;
}

function validateInputs(inputs) {
  const validationErrors = [];

  if (inputs.loanAmount <= 0) {
    validationErrors.push('Loan amount must be greater than 0.');
  }

  if (inputs.termMonths <= 0) {
    validationErrors.push('Loan term must be greater than 0 months.');
  }

  if (inputs.annualApr < 0) {
    validationErrors.push('APR / note rate must be 0 or greater.');
  }

  if (inputs.hoursWorkedPerWeek < 0) {
    validationErrors.push('Hours worked per week must be 0 or greater.');
  }

  return validationErrors;
}

function stateRatesFor(rateSettings, state) {
  return rateSettings?.[state] || {};
}

function buildWarnings(inputs, parameters) {
  const warnings = [PROTOTYPE_DISCLAIMER];

  if (coverageIncludesDisability(inputs.coverageType)) {
    warnings.push('7-Day Retro Disability selected based on carrier guidance.');
  }

  warnings.push(`${SUPPORTED_STATES[inputs.state]} selected. Final state-specific rates pending.`);

  if (inputs.borrowerType === 'joint') {
    warnings.push('Joint borrower rules pending carrier confirmation.');
  }

  if (inputs.includePremiumInInsuredBalance) {
    warnings.push(
      'Carrier confirmation required. Including financed premium in insured indebtedness may require recursive calculation.'
    );
  }

  if (inputs.loanAmount > parameters.warningLoanAmount) {
    warnings.push('Loan amount exceeds demo threshold. Carrier maximum must be confirmed.');
  }

  if (inputs.termMonths > parameters.warningTermMonths) {
    warnings.push('Loan term exceeds demo threshold. Carrier maximum term must be confirmed.');
  }

  if (
    coverageIncludesDisability(inputs.coverageType) &&
    (!inputs.activelyWorking || inputs.hoursWorkedPerWeek < parameters.minimumDisabilityHoursPerWeek)
  ) {
    warnings.push('Disability employment eligibility requirements pending carrier confirmation.');
  }

  if (inputs.calculationMethod === 'carrier') {
    warnings.push(parameters.carrierFormulaStatus);
  }

  return warnings;
}

export function calculateQuote(inputs = {}, rateSettings = {}, parameters = {}) {
  const normalizedInputs = normalizeQuoteInputs(inputs);
  const normalizedParameters = { ...DEFAULT_ENGINE_PARAMETERS, ...parameters };
  const validationErrors = validateInputs(normalizedInputs);

  if (validationErrors.length) {
    const error = new Error(validationErrors.join(' '));
    error.validationErrors = validationErrors;
    throw error;
  }

  const rates = stateRatesFor(rateSettings, normalizedInputs.state);
  const schedule = buildMonthlyAmortizationSchedule(
    normalizedInputs.loanAmount,
    normalizedInputs.annualApr,
    normalizedInputs.termMonths
  );
  const grossPayBase = calculateGrossPayBase(schedule);
  const applyDemoDiscount =
    normalizedInputs.calculationMethod === 'smart' ||
    normalizedInputs.calculationMethod === 'carrier';

  const lifePremiumDetail = calculateGrossPaySinglePremium({
    monthlyPayment: schedule.monthlyPayment,
    termMonths: normalizedInputs.termMonths,
    rate: rates.lifeRatePerThousandGrossPay,
    discountRateMonthly: rates.discountRateMonthly,
    applyDiscount: applyDemoDiscount
  });
  const disabilityPremiumDetail = calculateGrossPaySinglePremium({
    monthlyPayment: schedule.monthlyPayment,
    termMonths: normalizedInputs.termMonths,
    rate: rates.disabilitySevenDayRetroRatePerThousandGrossPay,
    discountRateMonthly: rates.discountRateMonthly,
    applyDiscount: applyDemoDiscount
  });

  const lifePremium = coverageIncludesLife(normalizedInputs.coverageType)
    ? lifePremiumDetail.premium
    : 0;
  const disabilityPremium = coverageIncludesDisability(normalizedInputs.coverageType)
    ? disabilityPremiumDetail.premium
    : 0;
  const totalPremium = roundCurrency(lifePremium + disabilityPremium);
  const isFinanced = normalizedInputs.premiumTreatment === 'financed';
  const amountFinancedWithPremium = isFinanced
    ? roundCurrency(normalizedInputs.loanAmount + totalPremium)
    : normalizedInputs.loanAmount;
  const monthlyPaymentWithPremium = isFinanced
    ? calculateMonthlyPayment(
        amountFinancedWithPremium,
        normalizedInputs.annualApr,
        normalizedInputs.termMonths
      )
    : schedule.monthlyPayment;
  const monthlyPaymentImpact = isFinanced
    ? roundCurrency(monthlyPaymentWithPremium - schedule.monthlyPayment)
    : 0;

  const assumptions = [
    'Payment frequency is locked to monthly.',
    'Coverage basis is locked to Gross Pay.',
    'Credit Disability is locked to 7-Day Retro.',
    'States are limited to Missouri and Arkansas.',
    'Prototype Gross Pay Demo uses scheduled monthly payment stream as the gross pay basis.',
    applyDemoDiscount
      ? 'Smart Demo Engine applies the demo monthly discount rate to the scheduled payment stream.'
      : 'Gross Pay Demo uses undiscounted scheduled monthly payment exposure.',
    'Carrier Formula Placeholder returns the demo gross-pay result until CSO-approved data is received.'
  ];

  return {
    ...normalizedInputs,
    ...FIXED_SCOPE,
    monthlyPayment: schedule.monthlyPayment,
    periodicRate: schedule.periodicRate,
    periods: schedule.periods,
    grossPayBase,
    grossPayExposureUsed: lifePremiumDetail.exposureUsed,
    discountRateMonthly: toNumber(rates.discountRateMonthly),
    discountFactor: lifePremiumDetail.discountFactor,
    lifeRate: toNumber(rates.lifeRatePerThousandGrossPay),
    disabilityRate: toNumber(rates.disabilitySevenDayRetroRatePerThousandGrossPay),
    lifePremium,
    disabilityPremium,
    totalPremium,
    amountFinancedWithPremium,
    monthlyPaymentWithPremium,
    monthlyPaymentImpact,
    assumptions,
    warnings: buildWarnings(normalizedInputs, normalizedParameters)
  };
}
