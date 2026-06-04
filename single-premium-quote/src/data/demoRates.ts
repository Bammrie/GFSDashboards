export type DemoRateState = 'MO' | 'AR';

export type DemoRatesByState = Record<
  DemoRateState,
  {
    lifeRatePerThousandGrossPay: number;
    disabilitySevenDayRetroRatePerThousandGrossPay: number;
    discountRateMonthly: number;
  }
>;

export const demoRates: DemoRatesByState = {
  MO: {
    lifeRatePerThousandGrossPay: 0.5,
    disabilitySevenDayRetroRatePerThousandGrossPay: 1.85,
    discountRateMonthly: 0.0025
  },
  AR: {
    lifeRatePerThousandGrossPay: 0.5,
    disabilitySevenDayRetroRatePerThousandGrossPay: 1.85,
    discountRateMonthly: 0.0025
  }
};

// These are demo placeholders only. Replace with CSO-provided Missouri and
// Arkansas rates once received.
