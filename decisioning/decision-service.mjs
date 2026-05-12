import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildCounteroffer } from './counteroffer-engine.mjs';
import { normalizeDecisionInput, validateDecisionInput } from './normalizer.mjs';
import { evaluateRules } from './rules-engine.mjs';
import { calculateRiskScores } from './score-engine.mjs';
import { attachReasonDefinition, DECISIONS, getPolicyValue, resolveLoanType, uniqueByCode } from './utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultConfigPath = path.join(__dirname, 'default-config.json');

export async function loadDefaultDecisioningConfig() {
  const raw = await fs.readFile(defaultConfigPath, 'utf8');
  return JSON.parse(raw);
}

function pricingTier(score, config = {}) {
  return [...(config.pricingTiers || [])].sort((a, b) => b.minimumScore - a.minimumScore).find((tier) => score >= tier.minimumScore) || null;
}

function approvedTerms(input, config, score) {
  const loan = input.loanRequest || {};
  return {
    approvedAmount: loan.requestedAmount ?? null,
    approvedTermMonths: loan.requestedTermMonths ?? null,
    estimatedPayment: loan.estimatedPayment ?? null,
    maxLtv: getPolicyValue(config, 'maximumLtv', input),
    maxDti: getPolicyValue(config, 'maximumDti', input),
    maxPti: getPolicyValue(config, 'maximumPti', input),
    pricingTier: pricingTier(score, config)
  };
}

function buildConditions(input, validation, rulesResult, config) {
  const conditions = [...validation.warnings.map((warning) => `Resolve data warning: ${warning}`)];
  if (!Number.isFinite(input.borrower?.verifiedIncomeAmount)) conditions.push('Verify borrower income.');
  if (input.loanRequest?.loanType?.includes('auto') && !input.collateral?.vin) conditions.push('Verify collateral VIN.');
  if (rulesResult.manualReviews.some((rule) => rule.reasonCode === 'HIGH_APPLICATION_FRAUD_RISK')) conditions.push('Complete identity/fraud review.');
  if ((input.credit?.creditScore ?? 0) < getPolicyValue(config, 'minimumCreditScore', input, 640)) conditions.push('Underwriter must review credit exception.');
  if ((input.credit?.numberOfOpenTradelines ?? 99) < getPolicyValue(config, 'thinCreditOpenTradelines', input, 3)) conditions.push('Review limited credit history and verify compensating factors.');
  return [...new Set(conditions)];
}

function decide({ validation, rulesResult, scoreResult, counteroffer, config }) {
  const reasons = [
    ...rulesResult.reasons,
    ...scoreResult.reasonCodes,
    ...validation.warnings.map(() => attachReasonDefinition('MISSING_REQUIRED_DATA', config.reasonCodes))
  ];
  if (!validation.valid || validation.warnings.length) {
    return {
      decision: DECISIONS.MANUAL_REVIEW,
      reasons: uniqueByCode([...reasons, attachReasonDefinition('MISSING_REQUIRED_DATA', config.reasonCodes)]),
      explanation: 'Application has incomplete data and requires review before a decision-support recommendation can be finalized.'
    };
  }
  if (rulesResult.hardDeclines.length) {
    return { decision: DECISIONS.DECLINE, reasons: uniqueByCode(reasons), explanation: 'One or more hard-decline policy rules matched.' };
  }
  if (rulesResult.manualReviews.length) {
    return { decision: DECISIONS.MANUAL_REVIEW, reasons: uniqueByCode(reasons), explanation: 'One or more policy or fraud rules require manual review before approval.' };
  }
  if (counteroffer) {
    return { decision: DECISIONS.COUNTEROFFER, reasons: uniqueByCode([...reasons, ...counteroffer.reasonCodes]), explanation: counteroffer.explanation || 'Original request can be approved only with adjusted terms.' };
  }
  const score = scoreResult.riskScore;
  if (reasons.some((reason) => reason.code === 'LIMITED_CREDIT_HISTORY') && score >= config.thresholds.approveScore) {
    return { decision: DECISIONS.CONDITIONAL_APPROVAL, reasons: uniqueByCode(reasons), explanation: 'Overall risk score is strong, but limited credit history requires verification or underwriter conditions.' };
  }
  if (score >= config.thresholds.approveScore) return { decision: DECISIONS.APPROVE, reasons: uniqueByCode(reasons), explanation: 'Risk score and policy checks support approval.' };
  if (score >= config.thresholds.conditionalApproveScore) return { decision: DECISIONS.CONDITIONAL_APPROVAL, reasons: uniqueByCode(reasons), explanation: 'Risk score supports approval subject to verification conditions.' };
  if (score >= config.thresholds.manualReviewScore) return { decision: DECISIONS.MANUAL_REVIEW, reasons: uniqueByCode(reasons), explanation: 'Risk score is borderline and requires underwriter review.' };
  return { decision: DECISIONS.DECLINE, reasons: uniqueByCode(reasons), explanation: 'Risk score is below configured decision-support threshold and no passing counteroffer was found.' };
}

export function evaluateDecisioningApplication(payload = {}, config = {}) {
  const normalizedInput = normalizeDecisionInput(payload);
  const validation = validateDecisionInput(normalizedInput);
  const rulesResult = evaluateRules(normalizedInput, config);
  const scoreResult = calculateRiskScores(normalizedInput, config);
  const counteroffer = buildCounteroffer(normalizedInput, config, rulesResult);
  const recommendation = decide({ validation, rulesResult, scoreResult, counteroffer, config });
  return {
    decision: recommendation.decision,
    riskScore: scoreResult.riskScore,
    categoryScores: scoreResult.categoryScores,
    approvedTerms: [DECISIONS.APPROVE, DECISIONS.CONDITIONAL_APPROVAL].includes(recommendation.decision) ? approvedTerms(normalizedInput, config, scoreResult.riskScore) : null,
    counterofferTerms: recommendation.decision === DECISIONS.COUNTEROFFER ? counteroffer : null,
    requiredConditions: buildConditions(normalizedInput, validation, rulesResult, config),
    reasonCodes: recommendation.reasons,
    internalExplanation: recommendation.explanation,
    auditTrail: {
      validation,
      rulesEvaluated: rulesResult.evaluated,
      rulesMatched: rulesResult.matched,
      scoreBreakdown: scoreResult.categoryScores,
      loanPolicyType: resolveLoanType(normalizedInput)
    },
    modelVersion: config.modelVersion || 'decision-support-v1',
    configVersion: config.configVersion || 'unversioned',
    normalizedInput
  };
}
