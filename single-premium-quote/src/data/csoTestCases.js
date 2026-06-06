const baseMonthlyInputs = {
  paymentFrequency: 'monthly',
  daysToFirstPayment: 30,
  closingDate: '2026-06-06',
  borrowerDateOfBirth: '1986-01-01',
  coBorrowerDateOfBirth: '1986-01-01',
  loanType: 'installment'
};

export const CSO_TEST_CASES = [
  {
    id: 'AR-1',
    name: 'AR Case 1 - Single Life + Disability',
    status: 'active',
    inputs: {
      ...baseMonthlyInputs,
      state: 'AR',
      loanAmount: 11000,
      loanFee: 150,
      interestRate: 9.99,
      numberOfPayments: 36,
      borrowerType: 'single',
      coverageType: 'both'
    },
    expected: {
      amountFinanced: 12022.81,
      financeCharge: 1942.17,
      totalPayments: 13964.98,
      lifePremium: 272.32,
      disabilityPremium: 600.49,
      totalPremium: 872.81
    }
  },
  {
    id: 'AR-2',
    name: 'AR Case 2 - Joint Credit Life',
    status: 'active',
    inputs: {
      ...baseMonthlyInputs,
      state: 'AR',
      loanAmount: 11000,
      loanFee: 150,
      interestRate: 9.99,
      numberOfPayments: 36,
      borrowerType: 'joint',
      coverageType: 'life'
    },
    expected: {
      amountFinanced: 11594.43,
      financeCharge: 1873.06,
      totalPayments: 13467.49,
      lifePremium: 444.43,
      totalPremium: 444.43
    }
  },
  {
    id: 'AR-3',
    name: 'AR Case 3 - Joint Life + Disability',
    status: 'active',
    inputs: {
      ...baseMonthlyInputs,
      state: 'AR',
      loanAmount: 11000,
      loanFee: 150,
      interestRate: 9.99,
      numberOfPayments: 36,
      borrowerType: 'joint',
      coverageType: 'both'
    },
    expected: {
      amountFinanced: 12229.59,
      financeCharge: 1975.57,
      totalPayments: 14205.16,
      lifePremium: 468.77,
      disabilityPremium: 610.82,
      totalPremium: 1079.59
    }
  },
  {
    id: 'AR-4',
    name: 'AR Case 4 - Single Credit Life',
    status: 'active',
    inputs: {
      ...baseMonthlyInputs,
      state: 'AR',
      loanAmount: 11000,
      loanFee: 150,
      interestRate: 9.99,
      numberOfPayments: 36,
      borrowerType: 'single',
      coverageType: 'life'
    },
    expected: {
      amountFinanced: 11408.4,
      financeCharge: 1842.96,
      totalPayments: 13251.36,
      lifePremium: 258.4,
      totalPremium: 258.4
    }
  },
  {
    id: 'AR-5',
    name: 'AR Case 5 - No Coverage',
    status: 'active',
    inputs: {
      ...baseMonthlyInputs,
      state: 'AR',
      loanAmount: 11000,
      loanFee: 150,
      interestRate: 9.99,
      numberOfPayments: 36,
      borrowerType: 'single',
      coverageType: 'none'
    },
    expected: {
      amountFinanced: 11150,
      financeCharge: 1801.16,
      totalPayments: 12951.16,
      totalPremium: 0
    }
  },
  {
    id: 'MO-6',
    name: 'MO Reference Case 6 - Joint Life + Disability',
    status: 'pending',
    pendingReason:
      'Screenshot appears to use 14 Retro A&H. The MO 14-Retro disability rate table is not included in the provided MO 7-Day Retro rate sheet.',
    inputs: {
      ...baseMonthlyInputs,
      state: 'MO',
      loanAmount: 25000,
      loanFee: 150,
      interestRate: 5,
      numberOfPayments: 60,
      borrowerType: 'joint',
      coverageType: 'both'
    },
    expected: {
      amountFinanced: 28074.64,
      financeCharge: 3714.85,
      totalPayments: 31789.49,
      lifePremium: 1430.53,
      disabilityPremium: 1494.11,
      totalPremium: 2924.64
    }
  },
  {
    id: 'MO-7',
    name: 'MO Reference Case 7 - Single Life + Disability',
    status: 'pending',
    pendingReason:
      'Screenshot appears to use 14 Retro A&H. The MO 14-Retro disability rate table is not included in the provided MO 7-Day Retro rate sheet.',
    inputs: {
      ...baseMonthlyInputs,
      state: 'MO',
      loanAmount: 25000,
      loanFee: 150,
      interestRate: 5,
      numberOfPayments: 60,
      borrowerType: 'single',
      coverageType: 'both'
    },
    expected: {
      amountFinanced: 27467.06,
      financeCharge: 3634.4,
      totalPayments: 31101.46,
      lifePremium: 855.29,
      disabilityPremium: 1461.77,
      totalPremium: 2317.06
    }
  },
  {
    id: 'MO-8',
    name: 'MO Case 8 - Joint Credit Life',
    status: 'active',
    inputs: {
      ...baseMonthlyInputs,
      state: 'MO',
      loanAmount: 25000,
      loanFee: 150,
      interestRate: 5,
      numberOfPayments: 60,
      borrowerType: 'joint',
      coverageType: 'life'
    },
    expected: {
      amountFinanced: 26500.31,
      financeCharge: 3506.56,
      totalPayments: 30006.87,
      lifePremium: 1350.31,
      totalPremium: 1350.31
    }
  },
  {
    id: 'MO-9',
    name: 'MO Case 9 - Single Credit Life',
    status: 'active',
    inputs: {
      ...baseMonthlyInputs,
      state: 'MO',
      loanAmount: 25000,
      loanFee: 150,
      interestRate: 5,
      numberOfPayments: 60,
      borrowerType: 'single',
      coverageType: 'life'
    },
    expected: {
      amountFinanced: 25958.31,
      financeCharge: 3434.8,
      totalPayments: 29393.11,
      lifePremium: 808.31,
      totalPremium: 808.31
    }
  },
  {
    id: 'MO-10',
    name: 'MO Case 10 - No Coverage',
    status: 'active',
    inputs: {
      ...baseMonthlyInputs,
      state: 'MO',
      loanAmount: 25000,
      loanFee: 150,
      interestRate: 5,
      numberOfPayments: 60,
      borrowerType: 'single',
      coverageType: 'none'
    },
    expected: {
      amountFinanced: 25150,
      financeCharge: 3327.83,
      totalPayments: 28477.83,
      totalPremium: 0
    }
  }
];
