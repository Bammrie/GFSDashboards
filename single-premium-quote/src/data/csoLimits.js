const sharedLimits = {
  maxProtectedLoanAmount: 125000,
  maxProtectedTermMonths: 120,
  maxIssueAge: 70,
  maxAgeAtMaturity: 71,
  minimumDisabilityHoursPerWeek: 25,
  maxMonthlyDisabilityBenefit: 1250,
  minimumPremium: 1,
  unsupportedLoanTypes: ['interest_only', 'variable_rate', 'first_mortgage']
};

export const CSO_LIMITS = {
  MO: { ...sharedLimits },
  AR: { ...sharedLimits }
};

export const PARTIAL_COVERAGE_WARNINGS = {
  protectedAmount:
    'Partial Maximum Coverage: The loan balance is greater than the Debt Protection benefit maximum. Benefits will only be provided up to the maximum coverage amount.',
  disabilityPayment:
    'Partial Maximum Coverage: The monthly payment exceeds the Debt Protection monthly benefit maximum. Benefits will be limited to the maximum monthly coverage amount.',
  age:
    "Partial Maximum Coverage: The borrower exceeds the eligible age limit. Coverage will be provided only for the maximum loan term available prior to the borrower's 71st birthday.",
  protectedTerm:
    'Partial Maximum Coverage: The loan term exceeds the Debt Protection maximum protected term. Coverage will be limited to the maximum eligible protected term.'
};

export const UNSUPPORTED_LOAN_TYPE_WARNING = 'This loan type is not supported for this coverage.';
