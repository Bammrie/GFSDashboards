const selectors = {
  matrix: document.getElementById('decisioning-matrix'),
  configSummary: document.getElementById('decisioning-config-summary'),
  configFeedback: document.getElementById('decisioning-config-feedback'),
  saveConfig: document.getElementById('decisioning-save-config'),
  resetConfig: document.getElementById('decisioning-reset-config'),
  checklist: document.getElementById('decisioning-data-checklist'),
  form: document.getElementById('decisioning-form'),
  payload: document.getElementById('decisioning-payload'),
  feedback: document.getElementById('decisioning-feedback'),
  sample: document.getElementById('decisioning-sample-btn'),
  result: document.getElementById('decisioning-result'),
  resultSummary: document.getElementById('decisioning-result-summary'),
  history: document.getElementById('decisioning-history'),
  historyEmpty: document.getElementById('decisioning-history-empty'),
  refreshHistory: document.getElementById('decisioning-refresh-history')
};

let activeConfig = null;
const fallbackConfig = {
  modelVersion: 'decision-support-v1',
  configVersion: 'local-default-preview',
  scoreWeights: { credit: 0.3, capacity: 0.25, cashFlow: 0.15, collateral: 0.15, relationship: 0.05, fraud: 0.1 },
  thresholds: {
    approveScore: 78,
    conditionalApproveScore: 70,
    manualReviewScore: 58,
    declineScore: 44,
    minimumCreditScore: { auto: 620, personal: 640, default: 640 },
    maximumDti: { auto: 0.48, personal: 0.43, default: 0.45 },
    maximumPti: { auto: 0.18, personal: 0.15, default: 0.16 },
    maximumLtv: { auto_new: 1.1, auto_used: 1.05, personal: 1, default: 1 },
    maximumFraudRisk: 72,
    manualReviewFraudRisk: 48,
    incomeMismatchPercent: 0.2,
    maxOverdrafts90Days: 6,
    thinCreditOpenTradelines: 3,
    thinCreditOldestTradelineMonths: 24,
    oldVehicleAgeYears: 12,
    highMileage: 125000
  },
  termLimits: { default: 72, auto_new: 84, auto_used: 72, auto_older: 60, personal: 60 },
  pricingTiers: []
};

const samplePayload = {
  applicationId: 'sample-auto-001',
  triggeredBy: 'admin-demo',
  borrower: { grossMonthlyIncome: 7200, verifiedIncomeAmount: 7000, employmentStatus: 'employed', employerTenureMonths: 48, memberTenureMonths: 72 },
  credit: { creditScore: 718, numberOfOpenTradelines: 8, oldestTradelineAgeMonths: 96, revolvingUtilization: 0.28, totalMonthlyDebtPayments: 1450, recentInquiries90Days: 1, bankruptcies: { active: false, count: 0 }, delinquencies: { days30: 0, days60: 0, days90Plus: 0 } },
  cashFlow: { averageMonthlyDeposits: 7200, payrollDepositDetected: true, payrollConsistencyScore: 86, averageDailyBalance: 1850, overdraftCount90Days: 0, nsfCount90Days: 0, disposableIncomeEstimate: 1800, bankAccountAgeMonths: 64, bankAccountOwnershipVerified: true },
  loanRequest: { loanType: 'auto', requestedAmount: 26000, requestedTermMonths: 72, requestedAPR: 7.49, purpose: 'purchase', downPayment: 2500 },
  collateral: { vin: '1HGCM82633A004352', year: 2022, make: 'Honda', model: 'Accord', mileage: 31000, vehicleValue: 28500, amountFinanced: 26000, newUsedFlag: 'used', titleStatus: 'clear' },
  fraud: { deviceFingerprintRisk: 12, ipLocationMismatch: false, applicationVelocity: 0, emailRisk: 8, phoneRisk: 6, identityVerificationStatus: 'verified', duplicateApplicationMatch: false }
};

const matrixSections = [
  { title: 'Risk score weights', fields: [
    ['scoreWeights.credit', 'Credit strength', 'percent', 0, 60, 1], ['scoreWeights.capacity', 'Capacity / affordability', 'percent', 0, 60, 1], ['scoreWeights.cashFlow', 'Cash-flow health', 'percent', 0, 40, 1], ['scoreWeights.collateral', 'Collateral strength', 'percent', 0, 40, 1], ['scoreWeights.relationship', 'Relationship strength', 'percent', 0, 20, 1], ['scoreWeights.fraud', 'Fraud / integrity', 'percent', 0, 40, 1]
  ]},
  { title: 'Decision thresholds', fields: [
    ['thresholds.approveScore', 'Approve score', 'number', 50, 100, 1], ['thresholds.conditionalApproveScore', 'Conditional approval score', 'number', 40, 95, 1], ['thresholds.manualReviewScore', 'Manual review score', 'number', 20, 90, 1], ['thresholds.declineScore', 'Decline score', 'number', 0, 80, 1]
  ]},
  { title: 'Auto loan policy limits', fields: [
    ['thresholds.minimumCreditScore.auto', 'Minimum auto credit score', 'number', 300, 850, 5], ['thresholds.maximumDti.auto', 'Max auto DTI', 'percent', 20, 70, 1], ['thresholds.maximumPti.auto', 'Max auto PTI', 'percent', 5, 35, 1], ['thresholds.maximumLtv.auto_new', 'Max new auto LTV', 'percent', 70, 150, 1], ['thresholds.maximumLtv.auto_used', 'Max used auto LTV', 'percent', 70, 150, 1], ['termLimits.auto_new', 'Max new auto term', 'number', 24, 96, 6], ['termLimits.auto_used', 'Max used auto term', 'number', 24, 96, 6], ['thresholds.oldVehicleAgeYears', 'Old vehicle review age', 'number', 5, 20, 1], ['thresholds.highMileage', 'High mileage review', 'number', 60000, 200000, 5000]
  ]},
  { title: 'Personal loan policy limits', fields: [
    ['thresholds.minimumCreditScore.personal', 'Minimum personal credit score', 'number', 300, 850, 5], ['thresholds.maximumDti.personal', 'Max personal DTI', 'percent', 20, 70, 1], ['thresholds.maximumPti.personal', 'Max personal PTI', 'percent', 5, 35, 1], ['termLimits.personal', 'Max personal term', 'number', 12, 84, 6]
  ]},
  { title: 'Fraud and data quality triggers', fields: [
    ['thresholds.manualReviewFraudRisk', 'Fraud review score', 'number', 0, 100, 1], ['thresholds.maximumFraudRisk', 'Maximum fraud score', 'number', 0, 100, 1], ['thresholds.incomeMismatchPercent', 'Income mismatch review', 'percent', 0, 60, 1], ['thresholds.maxOverdrafts90Days', 'Max overdrafts 90 days', 'number', 0, 20, 1], ['thresholds.thinCreditOpenTradelines', 'Thin credit tradelines', 'number', 0, 10, 1], ['thresholds.thinCreditOldestTradelineMonths', 'Thin credit oldest line months', 'number', 0, 84, 3]
  ]}
];

const checklist = {
  'Borrower / identity': ['Date of birth or age', 'Residence state', 'Housing status', 'Monthly housing payment', 'Employment status', 'Employer tenure months', 'Job industry', 'Gross monthly income', 'Verified income amount', 'Income source type', 'Member/customer tenure months'],
  'Credit bureau': ['Credit score and score model/source', 'Open tradeline count', 'Oldest tradeline age months', 'Revolving utilization', 'Total monthly debt payments', 'Calculated DTI', 'Recent inquiries for 30/90/180 days', 'Bankruptcy status/count', 'Charge-offs', 'Collections', '30/60/90+ delinquencies', 'Prior auto loan history', 'Prior personal loan history'],
  'Cash-flow / bank data': ['Average monthly deposits', 'Payroll deposit detected', 'Payroll consistency score', 'Average daily balance', 'Ending balance trend', 'Overdraft count 30/90 days', 'NSF count 30/90 days', 'Recurring debt payments', 'Recurring rent/mortgage payments', 'Disposable income estimate', 'Bank account age months', 'Bank account ownership verified'],
  'Loan request': ['Loan type', 'Requested amount', 'Requested term months', 'Requested APR if available', 'Estimated payment', 'Purpose', 'Purchase/refinance flag', 'Down payment', 'Payment-to-income ratio'],
  'Auto collateral': ['VIN', 'Year', 'Make', 'Model', 'Mileage', 'Vehicle value/book value', 'Amount financed', 'Loan-to-value', 'New/used flag', 'Collateral age', 'Title status'],
  'Fraud / application behavior': ['Device fingerprint risk', 'IP/location mismatch', 'Application velocity', 'Email risk', 'Phone risk', 'Identity verification status', 'Stated-vs-verified income mismatch', 'Application completion time', 'Number of field changes', 'Duplicate application match']
};

const titleCase = (value = '') => value.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
const getPath = (source, path) => path.split('.').reduce((current, key) => current?.[key], source);
function setPath(source, path, value) { const parts = path.split('.'); const last = parts.pop(); const target = parts.reduce((current, key) => current[key] ??= {}, source); target[last] = value; }
const displayValue = (value, type) => type === 'percent' ? Math.round(Number(value || 0) * 100) : Number(value ?? 0);
const modelValue = (value, type) => type === 'percent' ? Number(value) / 100 : Number(value);

function renderMatrix(config) {
  const weightTotal = Object.values(config.scoreWeights || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  selectors.configSummary.textContent = `Active config ${config.configVersion}. Score weights total ${Math.round(weightTotal * 100)}%.`;
  selectors.matrix.innerHTML = matrixSections.map((section) => `
    <section class="decisioning-matrix-section"><header><h3>${section.title}</h3></header><div class="decisioning-control-grid">
      ${section.fields.map(([path, label, type, min, max, step]) => {
        const value = displayValue(getPath(config, path), type);
        return `<label class="decisioning-control"><span>${label}</span><div><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-config-path="${path}" data-config-type="${type}"><input type="number" min="${min}" max="${max}" step="${step}" value="${value}" data-config-path="${path}" data-config-type="${type}"><strong data-config-output="${path}">${value}${type === 'percent' ? '%' : ''}</strong></div></label>`;
      }).join('')}
    </div></section>`).join('');
}

function renderChecklist() {
  selectors.checklist.innerHTML = Object.entries(checklist).map(([title, items]) => `
    <section class="decisioning-checklist-group"><h3>${title}</h3><ul>${items.map((item) => `<li><input type="checkbox" disabled> <span>${item}</span></li>`).join('')}</ul></section>`).join('');
}

async function loadConfig() {
  try {
    const response = await fetch('/api/decisioning/config', { credentials: 'same-origin' });
    if (!response.ok) throw new Error(String(response.status));
    activeConfig = await response.json();
  } catch (error) {
    activeConfig = structuredClone(fallbackConfig);
    selectors.configFeedback.textContent = 'Using local preview defaults because config could not be loaded.';
  }
  renderMatrix(activeConfig);
}

async function saveConfig() {
  selectors.configFeedback.textContent = 'Saving matrix...';
  const response = await fetch('/api/decisioning/config', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: activeConfig, createdBy: 'admin-matrix' }) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) { selectors.configFeedback.textContent = result?.error || `Unable to save matrix (${response.status}).`; return; }
  activeConfig = result;
  renderMatrix(activeConfig);
  selectors.configFeedback.textContent = `Saved active matrix ${result.configVersion}.`;
}

async function evaluatePayload(event) {
  event.preventDefault();
  let payload;
  try { payload = JSON.parse(selectors.payload.value); } catch { selectors.feedback.textContent = 'Application JSON is not valid.'; return; }
  selectors.feedback.textContent = 'Evaluating...';
  const response = await fetch('/api/decisioning/evaluate', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) { selectors.feedback.textContent = result?.error || `Decisioning failed (${response.status}).`; return; }
  selectors.feedback.textContent = 'Decisioning run stored.';
  selectors.result.hidden = false;
  selectors.resultSummary.textContent = `${titleCase(result.decision)} - Risk score ${result.riskScore} - Run ${result.runId}`;
  selectors.result.innerHTML = `<div class="decisioning-hero"><span class="decision-badge decision-badge--${result.decision}">${titleCase(result.decision)}</span><strong>${result.riskScore}</strong><p>${result.internalExplanation}</p></div><section><h3>Reason codes</h3><ul class="decisioning-reason-list">${(result.reasonCodes || []).map((reason) => `<li><strong>${reason.code}</strong><span>${titleCase(reason.severity)} - ${titleCase(reason.category)}</span><p>${reason.internalExplanation}</p></li>`).join('')}</ul></section>`;
  loadHistory();
}

async function loadHistory() {
  const response = await fetch('/api/decisioning/runs?limit=20', { credentials: 'same-origin' });
  if (!response.ok) return;
  const data = await response.json();
  const runs = Array.isArray(data?.runs) ? data.runs : [];
  selectors.history.hidden = !runs.length;
  selectors.historyEmpty.hidden = runs.length > 0;
  selectors.history.innerHTML = `<table class="data-table"><thead><tr><th>Created</th><th>Application</th><th>Decision</th><th class="numeric">Score</th><th>Reasons</th></tr></thead><tbody>${runs.map((run) => `<tr><td>${run.createdAt ? new Date(run.createdAt).toLocaleString() : 'N/A'}</td><td>${run.applicationId || 'N/A'}</td><td><span class="decision-badge decision-badge--${run.decision}">${titleCase(run.decision)}</span></td><td class="numeric">${run.riskScore}</td><td>${(run.reasonCodes || []).slice(0, 3).map((reason) => reason.code).join(', ') || 'None'}</td></tr>`).join('')}</tbody></table>`;
}

selectors.matrix?.addEventListener('input', (event) => {
  if (!event.target?.matches?.('[data-config-path]')) return;
  const path = event.target.dataset.configPath;
  const type = event.target.dataset.configType;
  selectors.matrix.querySelectorAll(`[data-config-path="${path}"]`).forEach((control) => { if (control !== event.target) control.value = event.target.value; });
  const output = selectors.matrix.querySelector(`[data-config-output="${path}"]`);
  if (output) output.textContent = `${event.target.value}${type === 'percent' ? '%' : ''}`;
  setPath(activeConfig, path, modelValue(event.target.value, type));
});
selectors.saveConfig?.addEventListener('click', saveConfig);
selectors.resetConfig?.addEventListener('click', loadConfig);
selectors.sample?.addEventListener('click', () => { selectors.payload.value = JSON.stringify(samplePayload, null, 2); });
selectors.form?.addEventListener('submit', evaluatePayload);
selectors.refreshHistory?.addEventListener('click', loadHistory);
selectors.payload.value = JSON.stringify(samplePayload, null, 2);
renderChecklist();
loadConfig();
loadHistory();
