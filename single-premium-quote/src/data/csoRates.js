const toMonthRateMap = (rates) =>
  Object.fromEntries(rates.map((rate, index) => [index + 1, rate]));

// Life rates are per $100 of insured indebtedness per year.
// Disability rates are single premium per $100, selected by equivalent months of insurance.
// For weekly/biweekly, equivalent months = CEILING(numberOfPayments / paymentsPerYear * 12).
export const CSO_RATE_CONFIG = {
  MO: {
    stateName: 'Missouri',
    loanClass: 'CSO - MO',
    grossFactorWorksheetAdjustment: 0.002118359184052565,
    lifeRatesPer100PerYear: {
      singleDecreasing: 0.55,
      jointDecreasing: 0.9,
      singleLevel: 1.1,
      jointLevel: 1.65
    },
    disabilityRatesPer100: {
      sevenDayRetro: Object.fromEntries(
        Array.from({ length: 120 }, (_, index) => {
          const month = index + 1;
          const rate = month <= 6 ? (month * 2.5) / 6 : 2.5 + (month - 6) / 12;
          return [month, Math.round((rate + Number.EPSILON) * 100) / 100];
        })
      )
    }
  },
  AR: {
    stateName: 'Arkansas',
    loanClass: 'CSO - AR',
    grossFactorWorksheetAdjustment: 0.0023825782105646454,
    lifeRatesPer100PerYear: {
      singleDecreasing: 0.65,
      jointDecreasing: 1.1,
      singleLevel: 1.2,
      jointLevel: 2.04
    },
    disabilityRatesPer100: {
      sevenDayRetro: toMonthRateMap([
        0.58, 1.01, 1.34, 1.6, 1.82, 2.01, 2.18, 2.32, 2.46, 2.58,
        2.69, 2.79, 2.89, 2.98, 3.06, 3.14, 3.22, 3.29, 3.36, 3.43,
        3.5, 3.56, 3.62, 3.68, 3.74, 3.79, 3.85, 3.9, 3.95, 4.01,
        4.06, 4.11, 4.16, 4.21, 4.25, 4.3, 4.35, 4.39, 4.44, 4.48,
        4.52, 4.57, 4.61, 4.65, 4.69, 4.73, 4.77, 4.81, 4.85, 4.89,
        4.93, 4.97, 5, 5.04, 5.08, 5.11, 5.15, 5.18, 5.22, 5.26,
        5.3, 5.34, 5.37, 5.41, 5.45, 5.48, 5.52, 5.56, 5.6, 5.63,
        5.67, 5.71, 5.75, 5.78, 5.82, 5.86, 5.9, 5.93, 5.97, 6.01,
        6.05, 6.08, 6.12, 6.16, 6.2, 6.23, 6.27, 6.31, 6.35, 6.38,
        6.42, 6.46, 6.5, 6.53, 6.57, 6.61, 6.65, 6.68, 6.72, 6.76,
        6.8, 6.83, 6.87, 6.91, 6.95, 6.98, 7.02, 7.06, 7.1, 7.13,
        7.17, 7.21, 7.25, 7.28, 7.32, 7.36, 7.4, 7.43, 7.47, 7.51
      ])
    }
  }
};

export const SUPPORTED_CSO_STATES = Object.keys(CSO_RATE_CONFIG);
