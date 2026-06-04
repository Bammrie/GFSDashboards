export const COVERAGE_TYPES = {
  life: 'Life Only',
  disability: 'Disability Only',
  both: 'Life + Disability'
};

export const COVERAGE_BASIS_TYPES = {
  reducing: 'Reducing Balance',
  level: 'Level Balance'
};

export const BORROWER_TYPES = {
  single: 'Single',
  joint: 'Joint'
};

export const CALCULATION_METHODS = {
  carrier: 'Carrier Formula Placeholder',
  annuity: 'Annuity Factor Demo',
  flat: 'Flat Rate Demo'
};

export const DEFAULT_ADMIN_PARAMETERS = {
  defaultLifeRate: 0.88,
  defaultDisabilityRate: 2.12,
  defaultCoverageBasis: 'reducing',
  defaultCalculationMethod: 'annuity',
  jointBorrowerRateFactor: 1,
  warningTermMonths: 120,
  warningLoanAmount: 100000,
  carrierFormulaStatus:
    'Carrier formula pending. This result is for prototype structure only.'
};

export const DEFAULT_QUOTE_INPUTS = {
  loanAmount: 25000,
  termMonths: 60,
  annualApr: 7.5,
  coverageType: 'both',
  coverageBasis: 'reducing',
  borrowerType: 'single',
  calculationMethod: 'annuity',
  lifeRate: 0.88,
  disabilityRate: 2.12
};

const toNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const roundCurrency = (value) => Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const formatRateFactor = (value) => toNumber(value, 1).toFixed(2);

export function calculateMonthlyPayment(loanAmount, annualApr, termMonths) {
  const principal = toNumber(loanAmount);
  const months = toNumber(termMonths);
  const monthlyRate = toNumber(annualApr) / 100 / 12;

  if (principal <= 0 || months <= 0) {
    return 0;
  }

  if (monthlyRate === 0) {
    return roundCurrency(principal / months);
  }

  const payment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  return roundCurrency(payment);
}

export function calculateAnnuityFactor(monthlyRate, termMonths) {
  const rate = toNumber(monthlyRate);
  const months = toNumber(termMonths);

  if (months <= 0) {
    return 0;
  }

  if (rate === 0) {
    return months;
  }

  return (1 - Math.pow(1 + rate, -months)) / rate;
}

export function calculateFlatPremium(
  loanAmount,
  ratePerThousand,
  termMonths,
  borrowerRateFactor = 1
) {
  return roundCurrency(
    (toNumber(loanAmount) / 1000) *
      toNumber(ratePerThousand) *
      toNumber(termMonths) *
      toNumber(borrowerRateFactor, 1)
  );
}

export function calculateAnnuityFactorPremium(
  loanAmount,
  ratePerThousand,
  annualApr,
  termMonths,
  borrowerRateFactor = 1
) {
  const monthlyRate = toNumber(annualApr) / 100 / 12;
  const annuityFactor = calculateAnnuityFactor(monthlyRate, termMonths);

  return roundCurrency(
    (toNumber(loanAmount) / 1000) *
      toNumber(ratePerThousand) *
      annuityFactor *
      toNumber(borrowerRateFactor, 1)
  );
}

function normalizeParameters(parameters = {}) {
  return {
    ...DEFAULT_ADMIN_PARAMETERS,
    ...parameters,
    defaultLifeRate: toNumber(parameters.defaultLifeRate, DEFAULT_ADMIN_PARAMETERS.defaultLifeRate),
    defaultDisabilityRate: toNumber(
      parameters.defaultDisabilityRate,
      DEFAULT_ADMIN_PARAMETERS.defaultDisabilityRate
    ),
    jointBorrowerRateFactor: toNumber(
      parameters.jointBorrowerRateFactor,
      DEFAULT_ADMIN_PARAMETERS.jointBorrowerRateFactor
    ),
    warningTermMonths: toNumber(
      parameters.warningTermMonths,
      DEFAULT_ADMIN_PARAMETERS.warningTermMonths
    ),
    warningLoanAmount: toNumber(
      parameters.warningLoanAmount,
      DEFAULT_ADMIN_PARAMETERS.warningLoanAmount
    )
  };
}

function normalizeQuoteInputs(inputs = {}, parameters = DEFAULT_ADMIN_PARAMETERS) {
  const normalizedParameters = normalizeParameters(parameters);
  return {
    ...DEFAULT_QUOTE_INPUTS,
    coverageBasis: normalizedParameters.defaultCoverageBasis,
    calculationMethod: normalizedParameters.defaultCalculationMethod,
    lifeRate: normalizedParameters.defaultLifeRate,
    disabilityRate: normalizedParameters.defaultDisabilityRate,
    ...inputs,
    loanAmount: toNumber(inputs.loanAmount, DEFAULT_QUOTE_INPUTS.loanAmount),
    termMonths: toNumber(inputs.termMonths, DEFAULT_QUOTE_INPUTS.termMonths),
    annualApr: toNumber(inputs.annualApr, DEFAULT_QUOTE_INPUTS.annualApr),
    lifeRate: toNumber(inputs.lifeRate, normalizedParameters.defaultLifeRate),
    disabilityRate: toNumber(inputs.disabilityRate, normalizedParameters.defaultDisabilityRate)
  };
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
    validationErrors.push('APR must be 0 or greater.');
  }

  if (inputs.lifeRate < 0 || inputs.disabilityRate < 0) {
    validationErrors.push('Life and disability rates must be 0 or greater.');
  }

  return validationErrors;
}

function calculateCoveragePremium(inputs, parameters, ratePerThousand) {
  const borrowerRateFactor =
    inputs.borrowerType === 'joint' ? parameters.jointBorrowerRateFactor : 1;

  if (inputs.calculationMethod === 'flat') {
    return calculateFlatPremium(
      inputs.loanAmount,
      ratePerThousand,
      inputs.termMonths,
      borrowerRateFactor
    );
  }

  // Carrier-approved reducing-balance formula goes here when provided by the CSO/carrier.
  // The placeholder intentionally follows the annuity-factor demo shape so the UI contract is stable.
  return calculateAnnuityFactorPremium(
    inputs.loanAmount,
    ratePerThousand,
    inputs.annualApr,
    inputs.termMonths,
    borrowerRateFactor
  );
}

export function calculateQuote(inputs = {}, parameters = {}) {
  const normalizedParameters = normalizeParameters(parameters);
  const normalizedInputs = normalizeQuoteInputs(inputs, normalizedParameters);
  const validationErrors = validateInputs(normalizedInputs);

  if (validationErrors.length) {
    const error = new Error(validationErrors.join(' '));
    error.validationErrors = validationErrors;
    throw error;
  }

  const monthlyPayment = calculateMonthlyPayment(
    normalizedInputs.loanAmount,
    normalizedInputs.annualApr,
    normalizedInputs.termMonths
  );
  const shouldIncludeLife = ['life', 'both'].includes(normalizedInputs.coverageType);
  const shouldIncludeDisability = ['disability', 'both'].includes(normalizedInputs.coverageType);

  const lifePremium = shouldIncludeLife
    ? calculateCoveragePremium(normalizedInputs, normalizedParameters, normalizedInputs.lifeRate)
    : 0;
  const disabilityPremium = shouldIncludeDisability
    ? calculateCoveragePremium(
        normalizedInputs,
        normalizedParameters,
        normalizedInputs.disabilityRate
      )
    : 0;
  const totalPremium = roundCurrency(lifePremium + disabilityPremium);
  const amountFinancedWithPremium = roundCurrency(normalizedInputs.loanAmount + totalPremium);
  const monthlyPaymentWithPremium = calculateMonthlyPayment(
    amountFinancedWithPremium,
    normalizedInputs.annualApr,
    normalizedInputs.termMonths
  );
  const monthlyPaymentImpact = roundCurrency(monthlyPaymentWithPremium - monthlyPayment);
  const monthlyRate = normalizedInputs.annualApr / 100 / 12;
  const annuityFactor = calculateAnnuityFactor(monthlyRate, normalizedInputs.termMonths);

  const assumptions = [
    'Rates are treated as premium rates per $1,000 of covered loan amount.',
    'Premiums are rounded to cents after each coverage calculation.',
    `Borrower type is captured as ${BORROWER_TYPES[normalizedInputs.borrowerType] || normalizedInputs.borrowerType}. Joint factor ${formatRateFactor(
      normalizedInputs.borrowerType === 'joint' ? normalizedParameters.jointBorrowerRateFactor : 1
    )} is applied in demo calculations.`,
    `Coverage basis is captured as ${
      COVERAGE_BASIS_TYPES[normalizedInputs.coverageBasis] || normalizedInputs.coverageBasis
    } for carrier review.`
  ];

  const warnings = [];

  if (normalizedInputs.termMonths > normalizedParameters.warningTermMonths) {
    warnings.push(`Loan term exceeds ${normalizedParameters.warningTermMonths} months.`);
  }

  if (normalizedInputs.loanAmount > normalizedParameters.warningLoanAmount) {
    warnings.push(
      `Loan amount exceeds $${normalizedParameters.warningLoanAmount.toLocaleString('en-US')}.`
    );
  }

  if (normalizedInputs.calculationMethod === 'carrier') {
    warnings.push(normalizedParameters.carrierFormulaStatus);
    assumptions.push(
      'Carrier Formula Placeholder currently returns the Annuity Factor Demo result until the approved formula is supplied.'
    );
  }

  if (
    normalizedInputs.calculationMethod === 'annuity' ||
    normalizedInputs.calculationMethod === 'carrier'
  ) {
    assumptions.push(
      `Monthly rate ${monthlyRate.toFixed(8)} and annuity factor ${annuityFactor.toFixed(
        6
      )} are used for the demo reducing-balance structure.`
    );
  }

  if (normalizedInputs.calculationMethod === 'flat') {
    assumptions.push(
      'Flat Rate Demo uses Loan Amount / 1000 * Rate * Term and is included only as a comparison fallback.'
    );
  }

  return {
    loanAmount: roundCurrency(normalizedInputs.loanAmount),
    termMonths: normalizedInputs.termMonths,
    annualApr: normalizedInputs.annualApr,
    monthlyPayment,
    coverageType: normalizedInputs.coverageType,
    borrowerType: normalizedInputs.borrowerType,
    coverageBasis: normalizedInputs.coverageBasis,
    calculationMethod: normalizedInputs.calculationMethod,
    lifePremium,
    disabilityPremium,
    totalPremium,
    amountFinancedWithPremium,
    monthlyPaymentWithPremium,
    monthlyPaymentImpact,
    assumptions,
    warnings
  };
}
