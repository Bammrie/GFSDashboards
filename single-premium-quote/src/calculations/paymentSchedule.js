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
