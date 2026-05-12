import { attachReasonDefinition, getPolicyValue, payment, resolveLoanType } from './utils.mjs';

export function buildCounteroffer(input, config = {}, rulesResult = null) {
  const loan = input.loanRequest || {};
  const collateral = input.collateral || {};
  const borrower = input.borrower || {};
  const conditions = [];
  const explanations = [];
  const reasons = [];

  let approvedAmount = loan.requestedAmount;
  let approvedTermMonths = loan.requestedTermMonths;
  let requiredDownPayment = loan.downPayment || 0;
  const maxLtv = getPolicyValue(config, 'maximumLtv', input, 1);
  const maxPti = getPolicyValue(config, 'maximumPti', input, 0.16);
  const policyType = resolveLoanType(input);
  const maxTerm = config.termLimits?.[policyType] ?? config.termLimits?.default ?? 72;
  const grossIncome = borrower.verifiedIncomeAmount || borrower.grossMonthlyIncome;
  const maxPayment = Number.isFinite(grossIncome) ? grossIncome * maxPti : null;

  if (Number.isFinite(collateral.vehicleValue) && Number.isFinite(loan.requestedAmount)) {
    const maxAmountByLtv = Math.floor(collateral.vehicleValue * maxLtv);
    if (loan.requestedAmount > maxAmountByLtv) {
      approvedAmount = Math.min(approvedAmount, maxAmountByLtv);
      requiredDownPayment = Math.max(requiredDownPayment, Math.ceil(loan.requestedAmount - maxAmountByLtv));
      conditions.push('Additional down payment required to meet LTV policy.');
      explanations.push(`Requested LTV exceeds policy; reducing amount financed to ${maxAmountByLtv} brings LTV within ${Math.round(maxLtv * 100)}%.`);
      reasons.push(attachReasonDefinition('HIGH_LTV', config.reasonCodes));
    }
  }

  if (Number.isFinite(maxPayment) && Number.isFinite(approvedAmount)) {
    const currentPayment = payment(approvedAmount, loan.requestedAPR, approvedTermMonths);
    if (Number.isFinite(currentPayment) && currentPayment > maxPayment) {
      const candidateTerms = [approvedTermMonths, 48, 60, 72, 84]
        .filter((term) => Number.isFinite(term) && term > 0 && term <= maxTerm)
        .sort((a, b) => a - b);
      const passingTerm = candidateTerms.find((term) => {
        const candidatePayment = payment(approvedAmount, loan.requestedAPR, term);
        return Number.isFinite(candidatePayment) && candidatePayment <= maxPayment;
      });

      if (passingTerm) {
        approvedTermMonths = passingTerm;
        conditions.push('Term adjusted to meet payment-to-income policy.');
        explanations.push(`Payment-to-income exceeded policy; ${passingTerm} months keeps payment at or below the allowed amount.`);
      } else if (Number.isFinite(maxPayment) && maxPayment > 0) {
        const term = Math.min(maxTerm, approvedTermMonths || maxTerm);
        const rate = (loan.requestedAPR || 0) / 100 / 12;
        const factor = rate ? Math.pow(1 + rate, term) : null;
        const maxPrincipal = rate && factor ? (maxPayment * (factor - 1)) / (rate * factor) : maxPayment * term;
        if (Number.isFinite(maxPrincipal) && maxPrincipal > 0) {
          approvedAmount = Math.min(approvedAmount, Math.floor(maxPrincipal));
          approvedTermMonths = term;
          conditions.push('Approved amount reduced to meet payment-to-income policy.');
          explanations.push(`Requested payment exceeded policy; lower amount keeps payment within ${Math.round(maxPti * 100)}% payment-to-income.`);
        }
      }
      reasons.push(attachReasonDefinition('HIGH_PTI', config.reasonCodes));
    }
  }

  const hasCounterofferRule = rulesResult?.counteroffers?.length > 0;
  if (!hasCounterofferRule && !conditions.length) return null;

  if (!conditions.length) {
    conditions.push('Income or collateral verification required before final approval.');
    explanations.push('Application is close to policy but needs verification before a firm approval.');
  }

  return {
    recommendedApprovedAmount: Number.isFinite(approvedAmount) ? Math.max(0, Math.round(approvedAmount)) : null,
    approvedTermMonths: Number.isFinite(approvedTermMonths) ? Math.round(approvedTermMonths) : null,
    maxPayment: Number.isFinite(maxPayment) ? Math.round(maxPayment * 100) / 100 : null,
    requiredDownPayment,
    maxLtv,
    requiredConditions: conditions,
    reasonCodes: reasons,
    explanation: explanations.join(' ')
  };
}
