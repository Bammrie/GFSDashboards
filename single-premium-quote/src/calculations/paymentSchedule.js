export const roundCurrency = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

export const ceilCurrency = (value) =>
  Math.ceil((Number(value || 0) - Number.EPSILON) * 100) / 100;

export function calculateRoundedPaymentSchedule({ amountFinanced, grossFactor, numberOfPayments }) {
  const n = Math.max(1, Number(numberOfPayments) || 1);
  const unroundedPayment = Number(amountFinanced || 0) / Number(grossFactor || 1);
  const regularPayment = ceilCurrency(unroundedPayment);
  const totalPayments = roundCurrency(unroundedPayment * n);
  const finalPayment = roundCurrency(totalPayments - regularPayment * (n - 1));

  return {
    unroundedPayment,
    regularPayment,
    finalPayment,
    totalPayments,
    financeCharge: roundCurrency(totalPayments - Number(amountFinanced || 0))
  };
}

function presentValueForRate({
  regularPayment,
  finalPayment,
  numberOfPayments,
  periodicRate,
  daysToFirstPayment,
  periodDays
}) {
  const n = Math.max(1, Number(numberOfPayments) || 1);
  const firstPaymentDays = Math.max(0, Number(daysToFirstPayment) || Number(periodDays) || 1);
  const daysPerPeriod = Math.max(1, Number(periodDays) || 1);

  if (periodicRate <= 0) {
    return roundCurrency(Number(regularPayment || 0) * (n - 1) + Number(finalPayment || 0));
  }

  let presentValue = 0;
  for (let paymentIndex = 1; paymentIndex <= n; paymentIndex += 1) {
    const paymentAmount = paymentIndex === n ? Number(finalPayment || 0) : Number(regularPayment || 0);
    const daysFromClosing = firstPaymentDays + (paymentIndex - 1) * daysPerPeriod;
    const periodsFromClosing = daysFromClosing / daysPerPeriod;
    presentValue += paymentAmount / Math.pow(1 + periodicRate, periodsFromClosing);
  }

  return presentValue;
}

export function calculateEstimatedApr({
  amountFinancedForApr,
  regularPayment,
  finalPayment,
  numberOfPayments,
  paymentsPerYear,
  daysToFirstPayment,
  periodDays
}) {
  const aprBase = Number(amountFinancedForApr || 0);
  const n = Math.max(1, Number(numberOfPayments) || 1);
  const annualPeriods = Math.max(1, Number(paymentsPerYear) || 1);
  const totalScheduledPayments = Number(regularPayment || 0) * (n - 1) + Number(finalPayment || 0);

  if (aprBase <= 0 || totalScheduledPayments <= aprBase) {
    return 0;
  }

  let low = 0;
  let high = 1;
  while (
    presentValueForRate({
      regularPayment,
      finalPayment,
      numberOfPayments: n,
      periodicRate: high,
      daysToFirstPayment,
      periodDays
    }) > aprBase &&
    high < 10
  ) {
    high *= 2;
  }

  for (let iteration = 0; iteration < 80; iteration += 1) {
    const midpoint = (low + high) / 2;
    const presentValue = presentValueForRate({
      regularPayment,
      finalPayment,
      numberOfPayments: n,
      periodicRate: midpoint,
      daysToFirstPayment,
      periodDays
    });

    if (presentValue > aprBase) low = midpoint;
    else high = midpoint;
  }

  return roundCurrency(((low + high) / 2) * annualPeriods * 100);
}
