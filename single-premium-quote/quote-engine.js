export {
  BORROWER_TYPES,
  COVERAGE_TYPES,
  DEFAULT_GROSS_PAY_INPUTS as DEFAULT_QUOTE_INPUTS,
  LOAN_TYPES,
  PAYMENT_FREQUENCIES,
  calculateCsoGrossPayQuote
} from './src/calculations/csoGrossPay.js';

export { CSO_LIMITS, PARTIAL_COVERAGE_WARNINGS, UNSUPPORTED_LOAN_TYPE_WARNING } from './src/data/csoLimits.js';
export { CSO_RATE_CONFIG, SUPPORTED_CSO_STATES } from './src/data/csoRates.js';

export function calculateQuote(inputs = {}, rateConfig, options = {}) {
  const nextOptions = rateConfig ? { ...options, rateConfig } : options;
  return calculateCsoGrossPayQuote(inputs, nextOptions);
}

export function coverageIncludesLife(coverageType) {
  return coverageType === 'life' || coverageType === 'both';
}

export function coverageIncludesDisability(coverageType) {
  return coverageType === 'disability' || coverageType === 'both';
}

import { calculateCsoGrossPayQuote } from './src/calculations/csoGrossPay.js';
