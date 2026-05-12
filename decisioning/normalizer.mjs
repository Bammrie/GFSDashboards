import { isPlainObject, payment, toBoolean, toNumber, toStringValue } from './utils.mjs';

function bankruptcy(value = {}) {
  const source = isPlainObject(value) ? value : {};
  return {
    active: toBoolean(source.active, false),
    count: toNumber(source.count ?? source.total, 0),
    monthsSinceDischarge: toNumber(source.monthsSinceDischarge)
  };
}

function delinquencies(value = {}) {
  const source = isPlainObject(value) ? value : {};
  return {
    days30: toNumber(source.days30 ?? source['30'] ?? source.d30, 0),
    days60: toNumber(source.days60 ?? source['60'] ?? source.d60, 0),
    days90Plus: toNumber(source.days90Plus ?? source['90Plus'] ?? source['90+'] ?? source.d90, 0)
  };
}

export function normalizeDecisionInput(payload = {}) {
  const source = isPlainObject(payload) ? payload : {};
  const borrowerRaw = source.borrower || source.applicant || {};
  const creditRaw = source.credit || {};
  const cashRaw = source.cashFlow || source.bank || source.bankCashFlow || {};
  const loanRaw = source.loanRequest || source.loan || {};
  const collateralRaw = source.collateral || source.vehicle || {};
  const fraudRaw = source.fraud || source.applicationBehavior || source.device || {};

  const grossMonthlyIncome = toNumber(borrowerRaw.grossMonthlyIncome ?? borrowerRaw.monthlyIncome ?? source.grossMonthlyIncome);
  const verifiedIncomeAmount = toNumber(borrowerRaw.verifiedIncomeAmount ?? borrowerRaw.verifiedIncome);
  const totalMonthlyDebtPayments = toNumber(creditRaw.totalMonthlyDebtPayments);
  const requestedAmount = toNumber(loanRaw.requestedAmount ?? loanRaw.loanAmount ?? source.loanAmount);
  const requestedTermMonths = toNumber(loanRaw.requestedTermMonths ?? loanRaw.termMonths);
  const requestedAPR = toNumber(loanRaw.requestedAPR ?? loanRaw.requestedApr ?? loanRaw.apr);
  const estimatedPayment = toNumber(loanRaw.estimatedPayment) ?? payment(requestedAmount, requestedAPR, requestedTermMonths);
  const vehicleValue = toNumber(collateralRaw.vehicleValue ?? collateralRaw.value);
  const amountFinanced = toNumber(collateralRaw.amountFinanced ?? requestedAmount);

  return {
    applicationId: toStringValue(source.applicationId || source.id || source._id, ''),
    borrower: {
      age: toNumber(borrowerRaw.age),
      residenceState: toStringValue(borrowerRaw.residenceState ?? borrowerRaw.state).toUpperCase(),
      housingStatus: toStringValue(borrowerRaw.housingStatus),
      monthlyHousingPayment: toNumber(borrowerRaw.monthlyHousingPayment ?? borrowerRaw.housingPayment),
      employmentStatus: toStringValue(borrowerRaw.employmentStatus),
      employerTenureMonths: toNumber(borrowerRaw.employerTenureMonths ?? borrowerRaw.tenureMonths),
      jobIndustry: toStringValue(borrowerRaw.jobIndustry),
      grossMonthlyIncome,
      verifiedIncomeAmount,
      incomeSourceType: toStringValue(borrowerRaw.incomeSourceType),
      memberTenureMonths: toNumber(borrowerRaw.memberTenureMonths ?? borrowerRaw.customerTenureMonths)
    },
    coBorrower: isPlainObject(source.coBorrower) ? source.coBorrower : {},
    credit: {
      creditScore: toNumber(creditRaw.creditScore ?? creditRaw.score),
      scoreModelSource: toStringValue(creditRaw.scoreModelSource ?? creditRaw.scoreModel ?? creditRaw.source),
      numberOfOpenTradelines: toNumber(creditRaw.numberOfOpenTradelines ?? creditRaw.openTradelines),
      oldestTradelineAgeMonths: toNumber(creditRaw.oldestTradelineAgeMonths),
      revolvingUtilization: toNumber(creditRaw.revolvingUtilization),
      totalMonthlyDebtPayments,
      debtToIncomeRatio: toNumber(creditRaw.debtToIncomeRatio ?? creditRaw.dti) ?? (Number.isFinite(totalMonthlyDebtPayments) && Number.isFinite(grossMonthlyIncome) && grossMonthlyIncome > 0 ? totalMonthlyDebtPayments / grossMonthlyIncome : null),
      recentInquiries30Days: toNumber(creditRaw.recentInquiries30Days ?? creditRaw.inquiries30, 0),
      recentInquiries90Days: toNumber(creditRaw.recentInquiries90Days ?? creditRaw.inquiries90, 0),
      recentInquiries180Days: toNumber(creditRaw.recentInquiries180Days ?? creditRaw.inquiries180, 0),
      bankruptcies: bankruptcy(creditRaw.bankruptcies),
      chargeOffs: toNumber(creditRaw.chargeOffs, 0),
      collections: toNumber(creditRaw.collections, 0),
      delinquencies: delinquencies(creditRaw.delinquencies),
      priorAutoLoanHistory: toStringValue(creditRaw.priorAutoLoanHistory),
      priorPersonalLoanHistory: toStringValue(creditRaw.priorPersonalLoanHistory)
    },
    cashFlow: {
      averageMonthlyDeposits: toNumber(cashRaw.averageMonthlyDeposits),
      payrollDepositDetected: toBoolean(cashRaw.payrollDepositDetected),
      payrollConsistencyScore: toNumber(cashRaw.payrollConsistencyScore),
      averageDailyBalance: toNumber(cashRaw.averageDailyBalance),
      endingBalanceTrend: toNumber(cashRaw.endingBalanceTrend),
      overdraftCount30Days: toNumber(cashRaw.overdraftCount30Days ?? cashRaw.overdrafts30, 0),
      overdraftCount90Days: toNumber(cashRaw.overdraftCount90Days ?? cashRaw.overdrafts90, 0),
      nsfCount30Days: toNumber(cashRaw.nsfCount30Days ?? cashRaw.nsf30, 0),
      nsfCount90Days: toNumber(cashRaw.nsfCount90Days ?? cashRaw.nsf90, 0),
      recurringDebtPayments: toNumber(cashRaw.recurringDebtPayments),
      recurringRentMortgagePayments: toNumber(cashRaw.recurringRentMortgagePayments),
      disposableIncomeEstimate: toNumber(cashRaw.disposableIncomeEstimate),
      bankAccountAgeMonths: toNumber(cashRaw.bankAccountAgeMonths),
      bankAccountOwnershipVerified: toBoolean(cashRaw.bankAccountOwnershipVerified)
    },
    loanRequest: {
      loanType: toStringValue(loanRaw.loanType ?? loanRaw.type ?? 'auto').toLowerCase(),
      requestedAmount,
      requestedTermMonths,
      requestedAPR,
      estimatedPayment,
      purpose: toStringValue(loanRaw.purpose),
      refinancePurchaseFlag: toStringValue(loanRaw.refinancePurchaseFlag ?? loanRaw.refinanceOrPurchase),
      downPayment: toNumber(loanRaw.downPayment, 0),
      paymentToIncomeRatio: toNumber(loanRaw.paymentToIncomeRatio ?? loanRaw.pti) ?? (Number.isFinite(estimatedPayment) && Number.isFinite(grossMonthlyIncome) && grossMonthlyIncome > 0 ? estimatedPayment / grossMonthlyIncome : null)
    },
    collateral: {
      vin: toStringValue(collateralRaw.vin ?? loanRaw.vin).toUpperCase(),
      year: toNumber(collateralRaw.year),
      make: toStringValue(collateralRaw.make),
      model: toStringValue(collateralRaw.model),
      mileage: toNumber(collateralRaw.mileage ?? loanRaw.mileage),
      vehicleValue,
      amountFinanced,
      loanToValue: toNumber(collateralRaw.loanToValue ?? collateralRaw.ltv) ?? (Number.isFinite(amountFinanced) && Number.isFinite(vehicleValue) && vehicleValue > 0 ? amountFinanced / vehicleValue : null),
      newUsedFlag: toStringValue(collateralRaw.newUsedFlag ?? collateralRaw.condition).toLowerCase(),
      collateralAgeYears: toNumber(collateralRaw.collateralAgeYears) ?? (Number.isFinite(toNumber(collateralRaw.year)) ? new Date().getFullYear() - toNumber(collateralRaw.year) : null),
      titleStatus: toStringValue(collateralRaw.titleStatus)
    },
    fraud: {
      deviceFingerprintRisk: toNumber(fraudRaw.deviceFingerprintRisk ?? fraudRaw.deviceRisk, 0),
      ipLocationMismatch: toBoolean(fraudRaw.ipLocationMismatch, false),
      applicationVelocity: toNumber(fraudRaw.applicationVelocity ?? fraudRaw.velocityOfApplications, 0),
      emailRisk: toNumber(fraudRaw.emailRisk, 0),
      phoneRisk: toNumber(fraudRaw.phoneRisk, 0),
      identityVerificationStatus: toStringValue(fraudRaw.identityVerificationStatus ?? fraudRaw.identityStatus),
      statedIncomeVerifiedIncomeMismatch: toNumber(fraudRaw.statedIncomeVerifiedIncomeMismatch),
      applicationCompletionTimeSeconds: toNumber(fraudRaw.applicationCompletionTimeSeconds),
      fieldChangeCount: toNumber(fraudRaw.fieldChangeCount ?? fraudRaw.numberOfFieldChanges, 0),
      duplicateApplicationMatch: toBoolean(fraudRaw.duplicateApplicationMatch, false)
    },
    metadata: {
      source: toStringValue(source.source || 'api'),
      triggeredBy: toStringValue(source.triggeredBy || 'system')
    }
  };
}

export function validateDecisionInput(input = {}) {
  const errors = [];
  const warnings = [];
  if (!input.loanRequest?.loanType) warnings.push('Loan type is missing; default policy will be used.');
  if (!Number.isFinite(input.loanRequest?.requestedAmount) || input.loanRequest.requestedAmount <= 0) errors.push('Requested amount is required.');
  if (!Number.isFinite(input.borrower?.grossMonthlyIncome) && !Number.isFinite(input.borrower?.verifiedIncomeAmount)) warnings.push('Income is missing; capacity score will be conservative.');
  if (!Number.isFinite(input.credit?.creditScore)) warnings.push('Credit score is missing.');
  if (input.loanRequest?.loanType?.includes('auto') && !Number.isFinite(input.collateral?.vehicleValue)) warnings.push('Auto collateral value is missing; collateral score will be conservative.');
  return { valid: errors.length === 0, errors, warnings };
}
