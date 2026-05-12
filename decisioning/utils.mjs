export const DECISIONS = {
  APPROVE: 'approve',
  CONDITIONAL_APPROVAL: 'conditional_approval',
  COUNTEROFFER: 'counteroffer',
  MANUAL_REVIEW: 'manual_review',
  DECLINE: 'decline'
};

export function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function toNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const numeric = Number(String(value).replace(/[$,%\s,]/g, ''));
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function toBoolean(value, fallback = null) {
  if (typeof value === 'boolean') return value;
  if (value === null || value === undefined || value === '') return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 'verified', 'pass', 'passed'].includes(normalized)) return true;
  if (['false', 'no', 'n', '0', 'failed', 'fail'].includes(normalized)) return false;
  return fallback;
}

export function toStringValue(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

export function clamp(value, min = 0, max = 100) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function getPath(source, path, fallback = null) {
  if (!path) return fallback;
  const result = path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, source);
  return result === undefined ? fallback : result;
}

export function resolveLoanType(input = {}) {
  const loanType = toStringValue(input.loanRequest?.loanType || input.loanType || 'default').toLowerCase();
  if (loanType.includes('auto')) {
    const isNew = input.collateral?.newUsedFlag === 'new';
    const age = toNumber(input.collateral?.collateralAgeYears);
    if (isNew) return 'auto_new';
    if (Number.isFinite(age) && age > 8) return 'auto_older';
    return 'auto_used';
  }
  if (loanType.includes('personal') || loanType.includes('unsecured')) return 'personal';
  return loanType || 'default';
}

export function getPolicyValue(config = {}, configPath, input, fallback = null) {
  const thresholds = config.thresholds || {};
  const termLimits = config.termLimits || {};
  const root = configPath === 'termLimits' ? termLimits : thresholds;
  const value = getPath(root, configPath, undefined);
  if (isPlainObject(value)) {
    const loanType = resolveLoanType(input);
    return value[loanType] ?? value[input.loanRequest?.loanType] ?? value.default ?? fallback;
  }
  if (value !== undefined) return value;

  const direct = root[configPath];
  if (isPlainObject(direct)) {
    const loanType = resolveLoanType(input);
    return direct[loanType] ?? direct[input.loanRequest?.loanType] ?? direct.default ?? fallback;
  }
  return direct ?? fallback;
}

export function payment(amount, apr, termMonths) {
  const principal = toNumber(amount);
  const months = toNumber(termMonths);
  if (!Number.isFinite(principal) || !Number.isFinite(months) || months <= 0) return null;
  const rate = toNumber(apr, 0) / 100 / 12;
  if (!rate) return principal / months;
  const factor = Math.pow(1 + rate, months);
  return (principal * rate * factor) / (factor - 1);
}

export function uniqueByCode(reasons = []) {
  const seen = new Set();
  return reasons.filter((reason) => {
    if (!reason?.code || seen.has(reason.code)) return false;
    seen.add(reason.code);
    return true;
  });
}

export function attachReasonDefinition(code, definitions = {}, overrides = {}) {
  const definition = definitions[code] || {};
  return {
    code,
    severity: overrides.severity || definition.severity || 'info',
    category: overrides.category || definition.category || 'application',
    internalExplanation: overrides.internalExplanation || definition.internalExplanation || code,
    consumerExplanation: overrides.consumerExplanation || definition.consumerExplanation || 'Application information affected the review.',
    adverseActionRelevant: overrides.adverseActionRelevant ?? definition.adverseActionRelevant ?? false
  };
}
