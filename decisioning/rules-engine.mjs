import { attachReasonDefinition, getPath, getPolicyValue } from './utils.mjs';

function incomeMismatchPercent(input) {
  const stated = input.borrower?.grossMonthlyIncome;
  const verified = input.borrower?.verifiedIncomeAmount;
  if (!Number.isFinite(stated) || !Number.isFinite(verified) || stated <= 0) return null;
  return Math.abs(stated - verified) / stated;
}

function metricValue(metric, input) {
  if (metric === 'incomeMismatchPercent') return incomeMismatchPercent(input);
  return null;
}

function compare(actual, operator, expected) {
  if (actual === null || actual === undefined) return false;
  if (operator === 'eq') return actual === expected;
  if (operator === 'neq') return actual !== expected;
  if (operator === 'gt') return Number(actual) > Number(expected);
  if (operator === 'gte') return Number(actual) >= Number(expected);
  if (operator === 'lt') return Number(actual) < Number(expected);
  if (operator === 'lte') return Number(actual) <= Number(expected);
  if (operator === 'exists') return actual !== null && actual !== undefined && actual !== '';
  if (operator === 'in') return Array.isArray(expected) && expected.includes(actual);
  return false;
}

function evaluateCondition(condition, input, config) {
  const actual = condition.metric
    ? metricValue(condition.metric, input)
    : getPath(input, condition.path);
  const expected = condition.configPath
    ? getPolicyValue(config, condition.configPath, input)
    : condition.value;
  const operatorMap = {
    ltConfig: 'lt',
    gtConfig: 'gt',
    gteConfig: 'gte',
    lteConfig: 'lte'
  };
  const operator = operatorMap[condition.operator] || condition.operator;

  return {
    passed: compare(actual, operator, expected),
    actual,
    expected,
    operator
  };
}

export function evaluateRules(input, config = {}) {
  const rules = Array.isArray(config.rules) ? config.rules : [];
  const evaluated = rules.map((rule) => {
    const conditionResults = (rule.conditions || []).map((condition) => evaluateCondition(condition, input, config));
    const passed = conditionResults.length > 0 && conditionResults.every((result) => result.passed);
    return {
      id: rule.id,
      type: rule.type,
      reasonCode: rule.reasonCode,
      description: rule.description,
      passed,
      conditions: conditionResults
    };
  });

  const matched = evaluated.filter((rule) => rule.passed);
  const reasons = matched.map((rule) =>
    attachReasonDefinition(rule.reasonCode, config.reasonCodes, {
      internalExplanation: rule.description || undefined
    })
  );

  return {
    evaluated,
    matched,
    hardDeclines: matched.filter((rule) => rule.type === 'hard_decline'),
    autoApprovals: matched.filter((rule) => rule.type === 'auto_approval'),
    conditionalApprovals: matched.filter((rule) => rule.type === 'conditional_approval'),
    manualReviews: matched.filter((rule) => rule.type === 'manual_review'),
    counteroffers: matched.filter((rule) => rule.type === 'counteroffer'),
    reasons
  };
}
