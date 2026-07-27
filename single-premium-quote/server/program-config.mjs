import { CSO_LIMITS } from '../src/data/csoLimits.js';
import { CSO_RATE_CONFIG } from '../src/data/csoRates.js';

export const QUOTE_STATES = Object.freeze(['MO', 'AR']);
export const QUOTE_STATE_NAMES = Object.freeze({
  MO: 'Missouri',
  AR: 'Arkansas'
});

const LOAN_TYPES = new Set(['interest_only', 'variable_rate', 'first_mortgage']);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function finiteNumber(value, fallback, { min = -Infinity, max = Infinity } = {}) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function integer(value, fallback, options = {}) {
  return Math.round(finiteNumber(value, fallback, options));
}

function cleanText(value, fallback, maxLength = 240) {
  const text = typeof value === 'string' ? value.trim() : '';
  return (text || fallback).slice(0, maxLength);
}

function normalizeDisabilityRates(value, defaults, maxMonths) {
  const source = Array.isArray(value)
    ? Object.fromEntries(value.map((rate, index) => [index + 1, rate]))
    : value && typeof value === 'object'
      ? value
      : {};
  const result = {};

  for (let month = 1; month <= maxMonths; month += 1) {
    const fallback = Number(defaults?.[month] ?? defaults?.[String(month)] ?? 0);
    result[month] = finiteNumber(source[month] ?? source[String(month)], fallback, {
      min: 0,
      max: 100
    });
  }

  return result;
}

export function defaultQuoteProgramConfig(state) {
  if (!QUOTE_STATES.includes(state)) {
    throw new Error('Unsupported quote state.');
  }

  return {
    state,
    stateName: QUOTE_STATE_NAMES[state],
    organizationName: 'Example Bank',
    programName: 'Payment Protection Quote',
    disclaimer: 'This is an estimate and may vary from final closing loan figures.',
    rateConfig: clone(CSO_RATE_CONFIG[state]),
    limits: clone(CSO_LIMITS[state])
  };
}

export function normalizeQuoteProgramConfig(state, input = {}) {
  const defaults = defaultQuoteProgramConfig(state);
  const incomingRates = input.rateConfig && typeof input.rateConfig === 'object' ? input.rateConfig : {};
  const incomingLife =
    incomingRates.lifeRatesPer100PerYear && typeof incomingRates.lifeRatesPer100PerYear === 'object'
      ? incomingRates.lifeRatesPer100PerYear
      : {};
  const incomingLimits = input.limits && typeof input.limits === 'object' ? input.limits : {};
  const maxProtectedTermMonths = integer(
    incomingLimits.maxProtectedTermMonths,
    defaults.limits.maxProtectedTermMonths,
    { min: 1, max: 120 }
  );
  const defaultDisability = defaults.rateConfig.disabilityRatesPer100.sevenDayRetro;
  const incomingDisability = incomingRates.disabilityRatesPer100?.sevenDayRetro;

  return {
    state,
    stateName: QUOTE_STATE_NAMES[state],
    organizationName: cleanText(input.organizationName, defaults.organizationName, 120),
    programName: cleanText(input.programName, defaults.programName, 120),
    disclaimer: cleanText(input.disclaimer, defaults.disclaimer, 500),
    rateConfig: {
      stateName: QUOTE_STATE_NAMES[state],
      loanClass: cleanText(incomingRates.loanClass, defaults.rateConfig.loanClass, 80),
      grossFactorWorksheetAdjustment: finiteNumber(
        incomingRates.grossFactorWorksheetAdjustment,
        defaults.rateConfig.grossFactorWorksheetAdjustment,
        { min: 0, max: 1 }
      ),
      lifeRatesPer100PerYear: {
        singleDecreasing: finiteNumber(
          incomingLife.singleDecreasing,
          defaults.rateConfig.lifeRatesPer100PerYear.singleDecreasing,
          { min: 0, max: 100 }
        ),
        jointDecreasing: finiteNumber(
          incomingLife.jointDecreasing,
          defaults.rateConfig.lifeRatesPer100PerYear.jointDecreasing,
          { min: 0, max: 100 }
        ),
        singleLevel: finiteNumber(
          incomingLife.singleLevel,
          defaults.rateConfig.lifeRatesPer100PerYear.singleLevel,
          { min: 0, max: 100 }
        ),
        jointLevel: finiteNumber(
          incomingLife.jointLevel,
          defaults.rateConfig.lifeRatesPer100PerYear.jointLevel,
          { min: 0, max: 100 }
        )
      },
      disabilityRatesPer100: {
        sevenDayRetro: normalizeDisabilityRates(
          incomingDisability,
          defaultDisability,
          maxProtectedTermMonths
        )
      }
    },
    limits: {
      maxProtectedLoanAmount: finiteNumber(
        incomingLimits.maxProtectedLoanAmount,
        defaults.limits.maxProtectedLoanAmount,
        { min: 1, max: 100_000_000 }
      ),
      maxProtectedTermMonths,
      maxIssueAge: integer(incomingLimits.maxIssueAge, defaults.limits.maxIssueAge, {
        min: 18,
        max: 100
      }),
      maxAgeAtMaturity: integer(
        incomingLimits.maxAgeAtMaturity,
        defaults.limits.maxAgeAtMaturity,
        { min: 18, max: 120 }
      ),
      minimumDisabilityHoursPerWeek: finiteNumber(
        incomingLimits.minimumDisabilityHoursPerWeek,
        defaults.limits.minimumDisabilityHoursPerWeek,
        { min: 0, max: 168 }
      ),
      maxMonthlyDisabilityBenefit: finiteNumber(
        incomingLimits.maxMonthlyDisabilityBenefit,
        defaults.limits.maxMonthlyDisabilityBenefit,
        { min: 0, max: 10_000_000 }
      ),
      minimumPremium: finiteNumber(
        incomingLimits.minimumPremium,
        defaults.limits.minimumPremium,
        { min: 0, max: 100_000 }
      ),
      unsupportedLoanTypes: Array.isArray(incomingLimits.unsupportedLoanTypes)
        ? [...new Set(incomingLimits.unsupportedLoanTypes.filter((type) => LOAN_TYPES.has(type)))]
        : clone(defaults.limits.unsupportedLoanTypes)
    }
  };
}
