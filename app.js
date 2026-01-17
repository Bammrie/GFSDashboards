const PRODUCT_OPTIONS = [
  'Credit Insurance/Debt Protection - Consumer',
  'Credit Insurance - Mortgage',
  'GAP',
  'VSC',
  'Collateral Protection Insurance (CPI)',
  'Fidelity Bond',
  'AFG Balloon Loans'
];

const PRODUCT_REVENUE_TYPES = {
  'Credit Insurance/Debt Protection - Consumer': ['Frontend', 'Backend'],
  'GAP': ['Frontend', 'Backend'],
  'VSC': ['Frontend', 'Backend']
};

const DEFAULT_REVENUE_TYPES = ['Commission'];
const REPORTING_START_PERIOD = '2023-01';
const PRODUCT_REVENUE_PAIRS = PRODUCT_OPTIONS.flatMap((product) => {
  const revenueTypes = PRODUCT_REVENUE_TYPES[product] || DEFAULT_REVENUE_TYPES;
  return revenueTypes.map((revenueType) => ({ product, revenueType }));
});

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const currencyFormatterNoCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});
const integerFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const CLASSIFICATIONS = ['account', 'prospect'];
const COVERAGE_REQUEST_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/4330880/ugp09bj/';
const COVERAGE_REQUEST_CREDIT_UNION = 'Baycel Federal Credit Union';
const COVERAGE_OPTION_LABELS = {
  base: 'Base loan',
  vsc: 'Vehicle service contract',
  gap: 'Guaranteed asset protection',
  'vsc-gap': 'Full protection bundle'
};

function normalizeClassification(value) {
  return CLASSIFICATIONS.includes(value) ? value : 'account';
}

function normalizeNameForComparison(name) {
  return (name || '').toString().trim().toLowerCase();
}

function scrubDuplicateCoastlife(entries) {
  if (!Array.isArray(entries)) return [];

  const hasPreferredRecord = entries.some(
    (item) => normalizeNameForComparison(item.name) === 'coastlife cu'
  );

  if (!hasPreferredRecord) {
    return entries;
  }

  return entries.filter((item) => normalizeNameForComparison(item.name) !== 'coastlife');
}

const selectors = {
  addCreditUnionBtn: document.getElementById('add-credit-union-btn'),
  creditUnionDialog: document.getElementById('credit-union-dialog'),
  creditUnionForm: document.getElementById('credit-union-form'),
  creditUnionNameInput: document.getElementById('credit-union-name'),
  closeCreditUnionDialogBtn: document.getElementById('close-credit-union-dialog'),
  accountCreditUnionSelect: document.getElementById('account-credit-union-select'),
  accountStatusList: document.getElementById('account-status-list'),
  accountStatusSummary: document.getElementById('account-status-summary'),
  accountDetailTitle: document.getElementById('account-detail-title'),
  accountEmptyState: document.getElementById('account-empty-state'),
  accountProductSelect: document.getElementById('account-product-select'),
  accountRevenueSelect: document.getElementById('account-revenue-select'),
  accountAddProductBtn: document.getElementById('account-add-product'),
  accountStatusFeedback: document.getElementById('account-status-feedback'),
  accountDirectoryBody: document.getElementById('account-directory-body'),
  accountDirectorySummary: document.getElementById('account-directory-summary'),
  accountDirectoryEmpty: document.getElementById('account-directory-empty'),
  accountDirectoryTabs: document.getElementById('account-directory-tabs'),
  accountDirectoryTable: document.getElementById('account-directory-table'),
  quotesDirectoryBody: document.getElementById('quotes-directory-body'),
  quotesDirectorySummary: document.getElementById('quotes-directory-summary'),
  quotesDirectoryEmpty: document.getElementById('quotes-directory-empty'),
  quotesDirectoryTable: document.getElementById('quotes-directory-table'),
  openCallReportBtn: document.getElementById('open-call-report-btn'),
  callReportDialog: document.getElementById('call-report-dialog'),
  closeCallReportDialogBtn: document.getElementById('close-call-report-dialog'),
  openMenuPricingBtn: document.getElementById('open-menu-pricing-btn'),
  menuPricingDialog: document.getElementById('menu-pricing-dialog'),
  closeMenuPricingDialogBtn: document.getElementById('close-menu-pricing-dialog'),
  openAccountChangeLogBtn: document.getElementById('open-account-change-log-btn'),
  accountChangeLogDialog: document.getElementById('account-change-log-dialog'),
  closeAccountChangeLogDialogBtn: document.getElementById('close-account-change-log-dialog'),
  openAccountNotesBtn: document.getElementById('open-account-notes-btn'),
  accountNotesDialog: document.getElementById('account-notes-dialog'),
  closeAccountNotesDialogBtn: document.getElementById('close-account-notes-dialog'),
  incomeStreamFilter: document.getElementById('income-stream-filter'),
  incomeStreamList: document.getElementById('income-stream-list'),
  incomeStreamCount: document.getElementById('income-stream-count'),
  revenueForm: document.getElementById('revenue-form'),
  revenueStreamSelect: document.getElementById('revenue-stream-select'),
  revenueFeedback: document.getElementById('revenue-feedback'),
  reportingForm: document.getElementById('reporting-filter'),
  reportingCreditUnionSelect: document.getElementById('reporting-credit-union'),
  totalRevenue: document.getElementById('total-revenue'),
  topCreditUnion: document.getElementById('top-credit-union'),
  topProduct: document.getElementById('top-product'),
  creditUnionSummary: document.getElementById('credit-union-summary'),
  productSummary: document.getElementById('product-summary'),
  typeSummary: document.getElementById('type-summary'),
  timelineChart: document.getElementById('revenue-timeline-chart'),
  timelineSubtitle: document.getElementById('timeline-subtitle'),
  missingTotal: document.getElementById('missing-total'),
  missingFilterForm: document.getElementById('missing-filter'),
  missingMonthInput: document.getElementById('missing-month'),
  missingTypeSelect: document.getElementById('missing-type'),
  missingSummary: document.getElementById('missing-summary'),
  missingBody: document.getElementById('missing-body'),
  missingFeedback: document.getElementById('missing-feedback'),
  missingEmptyState: document.getElementById('missing-empty-state'),
  incomeStreamTemplate: document.getElementById('income-stream-template'),
  streamName: document.getElementById('income-stream-name'),
  streamDetails: document.getElementById('income-stream-details'),
  creditUnionDetailSummary: document.getElementById('credit-union-detail-summary'),
  creditUnionDetailName: document.getElementById('credit-union-detail-name'),
  creditUnionDetailWindow: document.getElementById('credit-union-detail-window'),
  creditUnionTotalRevenue: document.getElementById('credit-union-total-revenue'),
  creditUnionStreamsSummary: document.getElementById('credit-union-streams-summary'),
  creditUnionStreamsBody: document.getElementById('credit-union-streams'),
  reportingStatusGrid: document.getElementById('reporting-status-grid'),
  reportingStatusTemplate: document.getElementById('reporting-status-template'),
  reportingStatusSummary: document.getElementById('reporting-status-summary'),
  streamPerformanceChart: document.getElementById('stream-performance-chart'),
  streamPerformanceSummary: document.getElementById('stream-performance-summary'),
  monthlyCompletionTable: document.getElementById('monthly-completion-table'),
  monthlyCompletionBody: document.getElementById('monthly-completion-body'),
  monthlyDetailMonth: document.getElementById('monthly-detail-month'),
  monthlyDetailSummary: document.getElementById('monthly-detail-summary'),
  monthlyDetailBody: document.getElementById('monthly-detail-body'),
  monthlyDetailDescription: document.getElementById('monthly-detail-description'),
  updateStartMonthBtn: document.getElementById('update-start-month-btn'),
  updateStartMonthDialog: document.getElementById('update-start-month-dialog'),
  updateStartMonthForm: document.getElementById('update-start-month-form'),
  updateStartMonthInput: document.getElementById('update-start-month'),
  updateStartMonthMessage: document.getElementById('update-start-month-message'),
  closeUpdateStartMonthDialogBtn: document.getElementById('close-update-start-month-dialog'),
  cancelStreamBtn: document.getElementById('cancel-stream-btn'),
  cancelStreamDialog: document.getElementById('cancel-stream-dialog'),
  cancelStreamForm: document.getElementById('cancel-stream-form'),
  cancelStreamInput: document.getElementById('cancel-stream-month'),
  cancelStreamMessage: document.getElementById('cancel-stream-message'),
  closeCancelStreamDialogBtn: document.getElementById('close-cancel-stream-dialog'),
  editRevenueDialog: document.getElementById('edit-revenue-dialog'),
  editRevenueForm: document.getElementById('edit-revenue-form'),
  editRevenueMonthLabel: document.getElementById('edit-revenue-month'),
  editRevenueAmountInput: document.getElementById('edit-revenue-amount'),
  editRevenueFeedback: document.getElementById('edit-revenue-feedback'),
  closeEditRevenueDialogBtn: document.getElementById('close-edit-revenue-dialog'),
  callReportUploadBtn: document.getElementById('call-report-upload-btn'),
  callReportFileInput: document.getElementById('call-report-file-input'),
  callReportFeedback: document.getElementById('call-report-feedback'),
  callReportList: document.getElementById('call-report-list'),
  callReportSummary: document.getElementById('call-report-summary'),
  callReportMetrics: document.getElementById('call-report-metrics'),
  callReportAssetChart: document.getElementById('call-report-asset-chart'),
  callReportCoverage: document.getElementById('call-report-coverage'),
  protectionOptionsDialog: document.getElementById('protection-options-dialog'),
  closeProtectionOptionsDialogBtn: document.getElementById('close-protection-options-dialog'),
  quoteWorkspaceSummary: document.getElementById('quote-workspace-summary'),
  accountNotesForm: document.getElementById('account-notes-form'),
  accountNotesAuthor: document.getElementById('account-note-author'),
  accountNotesText: document.getElementById('account-note-text'),
  accountNotesFeedback: document.getElementById('account-notes-feedback'),
  accountNotesList: document.getElementById('account-notes-list'),
  accountNotesEmpty: document.getElementById('account-notes-empty'),
  accountReviewForm: document.getElementById('account-review-form'),
  accountReviewLocked: document.getElementById('account-review-locked'),
  accountReviewFeedback: document.getElementById('account-review-feedback'),
  accountReviewUpdated: document.getElementById('account-review-updated'),
  accountReviewDownload: document.getElementById('account-review-download'),
  accountChangeLog: document.getElementById('account-change-log'),
  accountChangeLogEmpty: document.getElementById('account-change-log-empty'),
  trainingAccountsTotal: document.getElementById('training-total-accounts'),
  trainingMonthlyTotal: document.getElementById('training-monthly-total'),
  trainingAnnualTotal: document.getElementById('training-annual-total'),
  trainingMonthGrid: document.getElementById('training-month-grid'),
  trainingCommitmentBody: document.getElementById('training-commitment-body'),
  trainingEmptyState: document.getElementById('training-empty-state'),
  trainingTableCard: document.getElementById('training-table-card'),
  loanOfficerSummary: document.getElementById('loan-officer-summary'),
  loanAmountInput: document.getElementById('loan-amount'),
  loanTermInput: document.getElementById('loan-term'),
  loanAprInput: document.getElementById('loan-apr'),
  loanMilesInput: document.getElementById('loan-miles'),
  loanVinInput: document.getElementById('loan-vin'),
  loanVinDecodeBtn: document.getElementById('loan-vin-decode-btn'),
  loanProtectionOptionsBtn: document.getElementById('loan-protection-options-btn'),
  coverageRequestMemberName: document.getElementById('coverage-request-member-name'),
  coverageRequestPhone: document.getElementById('coverage-request-phone'),
  coverageRequestEmail: document.getElementById('coverage-request-email'),
  coverageRequestBtn: document.getElementById('coverage-request-btn'),
  coverageRequestFeedback: document.getElementById('coverage-request-feedback'),
  loanWarrantyCostInput: document.getElementById('loan-warranty-cost'),
  loanCreditUnionMarkupInput: document.getElementById('loan-credit-union-markup'),
  loanGfsMarkupInput: document.getElementById('loan-gfs-markup'),
  loanGapCostInput: document.getElementById('loan-gap-cost'),
  loanGapCreditUnionMarkupInput: document.getElementById('loan-gap-credit-union-markup'),
  loanGapGfsMarkupInput: document.getElementById('loan-gap-gfs-markup'),
  loanWarrantyFetchBtn: document.getElementById('loan-warranty-fetch-btn'),
  loanWarrantyFeedback: document.getElementById('loan-warranty-feedback'),
  loanVinResults: document.getElementById('loan-vin-results'),
  loanLogSummary: document.getElementById('loan-log-summary'),
  loanLogForm: document.getElementById('loan-log-form'),
  loanLogDateInput: document.getElementById('loan-log-date'),
  loanLogOfficerInput: document.getElementById('loan-log-officer'),
  loanLogCoverageSelect: document.getElementById('loan-log-coverage-selected'),
  loanLogVscToggle: document.getElementById('loan-log-vsc-selected'),
  loanLogGapToggle: document.getElementById('loan-log-gap-selected'),
  loanLogFeedback: document.getElementById('loan-log-feedback'),
  loanLogSaveBtn: document.getElementById('loan-log-save-btn'),
  loanLogCancelBtn: document.getElementById('loan-log-cancel-btn'),
  loanLogEmpty: document.getElementById('loan-log-empty'),
  loanLogList: document.getElementById('loan-log-list'),
  loanIllustrationSaveBtn: document.getElementById('loan-illustration-save-btn'),
  loanIllustrationSaveStatus: document.getElementById('loan-illustration-save-status'),
  loanIllustrationList: document.getElementById('loan-illustration-list'),
  loanIllustrationEmpty: document.getElementById('loan-illustration-empty'),
  personalLoanAmountInput: document.getElementById('personal-loan-amount'),
  personalLoanTermInput: document.getElementById('personal-loan-term'),
  personalLoanAprInput: document.getElementById('personal-loan-apr'),
  personalMobCoverageTypeSelect: document.getElementById('personal-mob-coverage-type'),
  personalMobCreditControls: document.getElementById('personal-mob-credit-controls'),
  personalMobDebtControls: document.getElementById('personal-mob-debt-controls'),
  personalMobCreditLifeToggle: document.getElementById('personal-mob-credit-life'),
  personalMobCreditDisabilityToggle: document.getElementById('personal-mob-credit-disability'),
  personalMobCreditTierSelect: document.getElementById('personal-mob-credit-tier'),
  personalMobCreditTierHelp: document.getElementById('personal-mob-credit-tier-help'),
  personalBasePayment: document.getElementById('personal-base-payment'),
  personalMobPremiumStart: document.getElementById('personal-mob-premium-start'),
  personalMobPremiumAverage: document.getElementById('personal-mob-premium-average'),
  personalPaymentWithMob: document.getElementById('personal-payment-with-mob'),
  loanStandardTerm: document.getElementById('loan-standard-term'),
  loanBasePayment: document.getElementById('loan-base-payment'),
  loanMobPremiumStart: document.getElementById('loan-mob-premium-start'),
  loanMobPremiumAverage: document.getElementById('loan-mob-premium-average'),
  loanPaymentWithMob: document.getElementById('loan-payment-with-mob'),
  mobCoverageTypeSelect: document.getElementById('mob-coverage-type'),
  mobCreditControls: document.getElementById('mob-credit-controls'),
  mobDebtControls: document.getElementById('mob-debt-controls'),
  mobCreditLifeToggle: document.getElementById('mob-credit-life'),
  mobCreditDisabilityToggle: document.getElementById('mob-credit-disability'),
  mobCreditTierSelect: document.getElementById('mob-credit-tier'),
  mobCreditTierHelp: document.getElementById('mob-credit-tier-help'),
  mobAccountCoverageTypeSelect: document.getElementById('mob-account-coverage-type'),
  mobRateStructureSelect: document.getElementById('mob-rate-structure'),
  mobCreditRateFields: document.getElementById('mob-credit-rate-fields'),
  mobBlendedRateFields: document.getElementById('mob-blended-rate-fields'),
  mobUnblendedRateFields: document.getElementById('mob-unblended-rate-fields'),
  mobDebtRateFields: document.getElementById('mob-debt-rate-fields'),
  mobDebtBlendedRateFields: document.getElementById('mob-debt-blended-rate-fields'),
  mobDebtUnblendedRateFields: document.getElementById('mob-debt-unblended-rate-fields'),
  mobBlendedLifeRateInput: document.getElementById('mob-blended-life-rate'),
  mobBlendedDisabilityRateInput: document.getElementById('mob-blended-disability-rate'),
  mobSingleLifeRateInput: document.getElementById('mob-single-life-rate'),
  mobJointLifeRateInput: document.getElementById('mob-joint-life-rate'),
  mobSingleDisabilityRateInput: document.getElementById('mob-single-disability-rate'),
  mobJointDisabilityRateInput: document.getElementById('mob-joint-disability-rate'),
  mobPackageARateInput: document.getElementById('mob-package-a-rate'),
  mobPackageBRateInput: document.getElementById('mob-package-b-rate'),
  mobPackageCRateInput: document.getElementById('mob-package-c-rate'),
  mobPackageASingleRateInput: document.getElementById('mob-package-a-single-rate'),
  mobPackageAJointRateInput: document.getElementById('mob-package-a-joint-rate'),
  mobPackageBSingleRateInput: document.getElementById('mob-package-b-single-rate'),
  mobPackageBJointRateInput: document.getElementById('mob-package-b-joint-rate'),
  mobPackageCSingleRateInput: document.getElementById('mob-package-c-single-rate'),
  mobPackageCJointRateInput: document.getElementById('mob-package-c-joint-rate'),
  loanTermExtensionToggle: document.getElementById('loan-term-extension-toggle'),
  loanTermExtensionFields: document.getElementById('loan-term-extension-fields'),
  loanVscTermExtensionInput: document.getElementById('loan-vsc-term-extension'),
  loanGapTermExtensionInput: document.getElementById('loan-gap-term-extension')
};

async function loadAccountNotes() {
  try {
    const response = await fetch('/api/account-notes');
    if (!response.ok) throw new Error(`Notes request failed (${response.status})`);
    const payload = await response.json();
    const data = payload?.data;
    appState.accountNotes = data && typeof data === 'object' ? data : {};
  } catch (error) {
    console.error('Unable to load account notes', error);
    appState.accountNotes = {};
  }
}

async function persistAccountNotes(creditUnionId, note) {
  try {
    const response = await fetch('/api/account-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creditUnionId, note })
    });
    if (!response.ok) throw new Error(`Notes save failed (${response.status})`);
    const payload = await response.json();
    const notes = Array.isArray(payload?.notes) ? payload.notes : null;
    if (notes) {
      appState.accountNotes = {
        ...appState.accountNotes,
        [creditUnionId]: notes
      };
    }
    return notes;
  } catch (error) {
    console.error('Unable to persist account notes', error);
    return null;
  }
}

async function loadAccountReviewData() {
  try {
    const response = await fetch('/api/account-review');
    if (!response.ok) throw new Error(`Review request failed (${response.status})`);
    const payload = await response.json();
    const data = payload?.data;
    appState.accountReviewData = data && typeof data === 'object' ? data : {};
  } catch (error) {
    console.error('Unable to load account review data', error);
    appState.accountReviewData = {};
  }
}

async function persistAccountReviewData(creditUnionId, payload) {
  try {
    const response = await fetch('/api/account-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creditUnionId, payload })
    });
    if (!response.ok) throw new Error(`Review save failed (${response.status})`);
    const data = await response.json();
    const reviewData = data?.data && typeof data.data === 'object' ? data.data : null;
    if (reviewData) {
      appState.accountReviewData = {
        ...appState.accountReviewData,
        [creditUnionId]: reviewData
      };
    }
    return reviewData;
  } catch (error) {
    console.error('Unable to persist account review data', error);
    return null;
  }
}

async function loadAccountChangeLog() {
  try {
    const response = await fetch('/api/account-change-log');
    if (!response.ok) throw new Error(`Change log request failed (${response.status})`);
    const payload = await response.json();
    const data = payload?.data;
    appState.accountChangeLog = data && typeof data === 'object' ? data : {};
  } catch (error) {
    console.error('Unable to load account change log', error);
    appState.accountChangeLog = {};
  }
}

async function persistAccountChangeLog(creditUnionId, entry) {
  try {
    const payloadEntry = {
      ...entry,
      entryId: entry.entryId || entry.id
    };
    const response = await fetch('/api/account-change-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creditUnionId, entry: payloadEntry })
    });
    if (!response.ok) throw new Error(`Change log save failed (${response.status})`);
    const payload = await response.json();
    const entries = Array.isArray(payload?.entries) ? payload.entries : null;
    if (entries) {
      appState.accountChangeLog = {
        ...appState.accountChangeLog,
        [creditUnionId]: entries
      };
    }
    return entries;
  } catch (error) {
    console.error('Unable to persist account change log', error);
    return null;
  }
}

async function loadLoanEntries(creditUnionId) {
  if (!creditUnionId) {
    appState.loanEntries = {};
    return;
  }
  try {
    const response = await fetch(`/api/loans?creditUnionId=${creditUnionId}`);
    if (!response.ok) throw new Error(`Loan log request failed (${response.status})`);
    const payload = await response.json();
    const loans = Array.isArray(payload?.loans) ? payload.loans : [];
    appState.loanEntries = {
      ...appState.loanEntries,
      [creditUnionId]: loans
    };
  } catch (error) {
    console.error('Unable to load loan log', error);
    appState.loanEntries = {
      ...appState.loanEntries,
      [creditUnionId]: []
    };
  }
}

async function createLoanEntry(payload) {
  const response = await fetch('/api/loans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Loan save failed (${response.status})`);
  }
  const data = await response.json();
  return data?.loan;
}

async function updateLoanEntry(id, payload) {
  const response = await fetch(`/api/loans/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Loan update failed (${response.status})`);
  }
  const data = await response.json();
  return data?.loan;
}

async function deleteLoanEntry(id) {
  const response = await fetch(`/api/loans/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Loan delete failed (${response.status})`);
  }
}

async function loadLoanIllustrations(creditUnionId) {
  if (!creditUnionId) {
    appState.loanIllustrations = {};
    return;
  }
  try {
    const response = await fetch(`/api/loan-illustrations?creditUnionId=${creditUnionId}`);
    if (!response.ok) throw new Error(`Loan illustration request failed (${response.status})`);
    const payload = await response.json();
    const illustrations = Array.isArray(payload?.illustrations) ? payload.illustrations : [];
    appState.loanIllustrations = {
      ...appState.loanIllustrations,
      [creditUnionId]: illustrations
    };
  } catch (error) {
    console.error('Unable to load loan illustrations', error);
    appState.loanIllustrations = {
      ...appState.loanIllustrations,
      [creditUnionId]: []
    };
  }
}

async function createLoanIllustration(creditUnionId, illustration) {
  const response = await fetch('/api/loan-illustrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creditUnionId, illustration })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Loan illustration save failed (${response.status})`);
  }
  const data = await response.json();
  return data?.illustration;
}

async function updateLoanIllustrationRecord(id, illustration) {
  const response = await fetch(`/api/loan-illustrations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ illustration })
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || `Loan illustration update failed (${response.status})`);
  }
  const data = await response.json();
  return data?.illustration;
}

async function loadAccountWarrantyConfigs() {
  try {
    const response = await fetch('/api/account-warranty-configs');
    if (!response.ok) throw new Error(`Warranty config request failed (${response.status})`);
    const payload = await response.json();
    const data = payload?.data;
    appState.accountWarrantyConfigs = data && typeof data === 'object' ? data : {};
  } catch (error) {
    console.error('Unable to load warranty configs', error);
    appState.accountWarrantyConfigs = {};
  }
}

async function persistWarrantyConfigs(creditUnionId, config) {
  try {
    const response = await fetch('/api/account-warranty-configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creditUnionId, config })
    });
    if (!response.ok) throw new Error(`Warranty config save failed (${response.status})`);
    const payload = await response.json();
    const saved = payload?.config && typeof payload.config === 'object' ? payload.config : null;
    if (saved) {
      appState.accountWarrantyConfigs = {
        ...appState.accountWarrantyConfigs,
        [creditUnionId]: saved
      };
    }
  } catch (error) {
    console.error('Unable to persist warranty configs', error);
  }
}

function parseNumericInput(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).replace(/,/g, '').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrencyValue(value) {
  return Number.isFinite(value) ? currencyFormatter.format(value) : '—';
}

function formatLoanIllustrationLabel({ loanAmount, termMonths, apr }) {
  const parts = [];
  if (Number.isFinite(loanAmount)) {
    parts.push(currencyFormatterNoCents.format(loanAmount));
  }
  if (Number.isFinite(termMonths)) {
    parts.push(`${termMonths} mo`);
  }
  if (Number.isFinite(apr)) {
    parts.push(`${apr.toFixed(2)}% APR`);
  }
  return parts.length ? parts.join(' • ') : 'Quote snapshot';
}

function formatLoanIllustrationCoverageSummary(selections = {}) {
  const mobCoverageType = selections.mobCoverageType;
  if (mobCoverageType === 'debt-protection') {
    const packageLabel = selections.mobDebtPackage
      ? selections.mobDebtPackage.replace('package-', 'Package ').toUpperCase()
      : 'No package';
    return `Debt protection ${packageLabel}`;
  }
  const coverages = [];
  if (selections.mobCreditLifeSelected) coverages.push('Life');
  if (selections.mobCreditDisabilitySelected) coverages.push('Disability');
  const coverageLabel = coverages.length ? coverages.join(' + ') : 'No coverage';
  const tierLabel = selections.mobCreditTier ? selections.mobCreditTier : 'single';
  return `Credit insurance ${coverageLabel} (${tierLabel})`;
}

function buildCoverageRequestOptions(coverageCombos = []) {
  if (!Array.isArray(coverageCombos)) return [];
  return coverageCombos.map((combo) => {
    const label = COVERAGE_OPTION_LABELS[combo.id] || combo.id || 'Coverage option';
    const paymentLabel = Number.isFinite(combo.payment)
      ? `${formatCurrencyValue(combo.payment)}/month`
      : 'payment TBD';
    return `${label} - ${paymentLabel}`;
  });
}

function buildCoverageRequestPayload() {
  const creditUnionId = appState.accountSelectionId;
  const creditUnionName = getCreditUnionNameById(creditUnionId) || '';
  const memberName = selectors.coverageRequestMemberName?.value.trim() || '';
  const phoneNumber = selectors.coverageRequestPhone?.value.trim() || '';
  const email = selectors.coverageRequestEmail?.value.trim() || '';
  const loanAmount = parseNumericInput(selectors.loanAmountInput?.value);
  const loanAmountLabel = Number.isFinite(loanAmount) ? currencyFormatterNoCents.format(loanAmount) : '';
  const loanAmountValue = Number.isFinite(loanAmount) ? loanAmount : null;
  const coverageOptions = buildCoverageRequestOptions(appState.loanIllustrationDraft?.coverageCombos);
  const coverageOptionsText = coverageOptions.length ? coverageOptions.join(' | ') : '';
  const phraseParts = [];
  if (memberName) {
    phraseParts.push(`Member: ${memberName}`);
  }
  if (phoneNumber) {
    phraseParts.push(`Phone: ${phoneNumber}`);
  }
  if (email) {
    phraseParts.push(`Email: ${email}`);
  }
  if (loanAmountLabel) {
    phraseParts.push(`Loan amount: ${loanAmountLabel}`);
  }
  if (coverageOptionsText) {
    phraseParts.push(`Coverage options: ${coverageOptionsText}`);
  }
  const phrase = phraseParts.join(' | ');

  return {
    phone_number: phoneNumber,
    member_phone: phoneNumber,
    email,
    member_email: email,
    loan_amount: loanAmountLabel,
    loan_amount_value: loanAmountValue,
    coverage_options: coverageOptions,
    coverage_options_text: coverageOptionsText,
    credit_union_name: creditUnionName,
    member_name: memberName,
    phrase
  };
}

function updateCoverageRequestAvailability() {
  if (!selectors.coverageRequestBtn) return;
  const creditUnionId = appState.accountSelectionId;
  const creditUnionName = getCreditUnionNameById(creditUnionId) || '';
  const isBaycel =
    normalizeNameForComparison(creditUnionName) ===
    normalizeNameForComparison(COVERAGE_REQUEST_CREDIT_UNION);
  const memberName = selectors.coverageRequestMemberName?.value.trim() || '';
  const phoneNumber = selectors.coverageRequestPhone?.value.trim() || '';
  const loanAmount = parseNumericInput(selectors.loanAmountInput?.value);
  const coverageOptions = buildCoverageRequestOptions(appState.loanIllustrationDraft?.coverageCombos);

  if (!creditUnionId) {
    selectors.coverageRequestBtn.disabled = true;
    setFeedback(selectors.coverageRequestFeedback, 'Select Baycel Federal Credit Union to request coverage.', 'info');
    return;
  }

  if (!isBaycel) {
    selectors.coverageRequestBtn.disabled = true;
    setFeedback(
      selectors.coverageRequestFeedback,
      'Coverage requests are only available when Baycel Federal Credit Union is selected.',
      'info'
    );
    return;
  }

  const isReady =
    Boolean(memberName) &&
    Boolean(phoneNumber) &&
    Number.isFinite(loanAmount) &&
    loanAmount > 0 &&
    coverageOptions.length > 0;
  selectors.coverageRequestBtn.disabled = !isReady;
  if (!isReady) {
    setFeedback(
      selectors.coverageRequestFeedback,
      'Enter member name, phone, and loan amount to send a coverage request.',
      'info'
    );
  } else {
    setFeedback(selectors.coverageRequestFeedback, '', 'info');
  }
}

function calculateMonthlyPayment(amount, apr, termMonths) {
  if (!Number.isFinite(amount) || !Number.isFinite(termMonths) || termMonths <= 0) return null;
  const rate = Number.isFinite(apr) ? apr / 100 / 12 : 0;
  if (!rate) {
    return amount / termMonths;
  }
  const factor = Math.pow(1 + rate, termMonths);
  return amount * ((rate * factor) / (factor - 1));
}

function estimateWarrantyCost({ miles, termMonths }) {
  const normalizedMiles = Number.isFinite(miles) ? miles : 0;
  const normalizedTerm = Number.isFinite(termMonths) ? termMonths : 0;
  const mileageFactor = Math.max(0, normalizedMiles - 12000) / 1000 * 8;
  const termFactor = normalizedTerm ? (normalizedTerm / 12) * 35 : 0;
  return Math.max(650, 1200 + mileageFactor + termFactor);
}

function calculateMobPremiums({ loanAmount, termMonths, apr, ratePerThousand }) {
  if (!Number.isFinite(loanAmount) || !Number.isFinite(termMonths) || termMonths <= 0) {
    return { firstPremium: null, averagePremium: null };
  }
  if (!Number.isFinite(ratePerThousand) || ratePerThousand <= 0) {
    return { firstPremium: null, averagePremium: null };
  }

  const monthlyPayment = calculateMonthlyPayment(loanAmount, apr, termMonths);
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) {
    return { firstPremium: null, averagePremium: null };
  }

  const monthlyRate = Number.isFinite(apr) ? apr / 100 / 12 : 0;
  let balance = loanAmount;
  let totalPremium = 0;
  let firstPremium = null;
  const totalMonths = Math.round(termMonths);
  let monthsProcessed = 0;

  for (let month = 0; month < totalMonths; month += 1) {
    const interest = monthlyRate ? balance * monthlyRate : 0;
    const principalPayment = Math.max(0, monthlyPayment - interest);
    const endBalance = Math.max(0, balance - principalPayment);
    const averageBalance = (balance + endBalance) / 2;
    const premium = (averageBalance / 1000) * ratePerThousand;
    if (firstPremium === null) {
      firstPremium = premium;
    }
    totalPremium += premium;
    balance = endBalance;
    monthsProcessed += 1;
    if (balance <= 0) {
      break;
    }
  }

  const averagePremium = monthsProcessed > 0 ? totalPremium / monthsProcessed : null;
  return { firstPremium, averagePremium };
}

function resolveMobRatePerThousand({
  mobCoverageType,
  mobBlendedRates,
  mobCreditLifeSelected,
  mobCreditDisabilitySelected,
  mobCreditTier,
  mobBlendedLifeRate,
  mobBlendedDisabilityRate,
  mobSingleLifeRate,
  mobJointLifeRate,
  mobSingleDisabilityRate,
  mobJointDisabilityRate,
  mobPackageARate,
  mobPackageBRate,
  mobPackageCRate,
  mobDebtPackage
}) {
  if (mobCoverageType === 'debt-protection') {
    if (mobDebtPackage === 'package-a') {
      return mobPackageARate;
    }
    if (mobDebtPackage === 'package-b') {
      return mobPackageBRate;
    }
    if (mobDebtPackage === 'package-c') {
      return mobPackageCRate;
    }
    return null;
  }

  const rateTier = mobBlendedRates ? 'blended' : mobCreditTier;
  const selectedRates = [];
  if (mobCreditLifeSelected) {
    if (rateTier === 'blended') {
      selectedRates.push(mobBlendedLifeRate);
    } else if (rateTier === 'joint') {
      selectedRates.push(mobJointLifeRate);
    } else {
      selectedRates.push(mobSingleLifeRate);
    }
  }
  if (mobCreditDisabilitySelected) {
    if (rateTier === 'blended') {
      selectedRates.push(mobBlendedDisabilityRate);
    } else if (rateTier === 'joint') {
      selectedRates.push(mobJointDisabilityRate);
    } else {
      selectedRates.push(mobSingleDisabilityRate);
    }
  }
  const validRates = selectedRates.filter(Number.isFinite);
  return validRates.length ? validRates.reduce((sum, value) => sum + value, 0) : null;
}

function buildLoanIllustrationSnapshot({
  loanAmount,
  termMonths,
  apr,
  miles,
  vin,
  warrantyCost,
  creditUnionMarkup,
  gfsMarkup,
  gapCost,
  gapCreditUnionMarkup,
  gapGfsMarkup,
  termExtensionsEnabled,
  vscTermExtension,
  gapTermExtension,
  mobCoverageType,
  mobRateStructure,
  mobBlendedRates,
  mobCreditLifeSelected,
  mobCreditDisabilitySelected,
  mobCreditTier,
  mobDebtPackage,
  mobRatePerThousand,
  mobBlendedLifeRate,
  mobBlendedDisabilityRate,
  mobSingleLifeRate,
  mobJointLifeRate,
  mobSingleDisabilityRate,
  mobJointDisabilityRate,
  mobPackageARate,
  mobPackageBRate,
  mobPackageCRate,
  mobPackageASingleRate,
  mobPackageAJointRate,
  mobPackageBSingleRate,
  mobPackageBJointRate,
  mobPackageCSingleRate,
  mobPackageCJointRate,
  vscRetail,
  gapRetail,
  basePayment,
  mobPremiumStart,
  mobPremiumAverage,
  paymentWithMob,
  coverageCombos
}) {
  const label = formatLoanIllustrationLabel({ loanAmount, termMonths, apr });
  return {
    label,
    inputs: {
      loanAmount,
      termMonths,
      apr,
      miles,
      vin,
      warrantyCost,
      creditUnionMarkup,
      gfsMarkup,
      gapCost,
      gapCreditUnionMarkup,
      gapGfsMarkup,
      termExtensionsEnabled,
      vscTermExtension,
      gapTermExtension
    },
    selections: {
      mobCoverageType,
      mobRateStructure,
      mobBlendedRates,
      mobCreditLifeSelected,
      mobCreditDisabilitySelected,
      mobCreditTier,
      mobDebtPackage
    },
    mobRates: {
      mobBlendedLifeRate,
      mobBlendedDisabilityRate,
      mobSingleLifeRate,
      mobJointLifeRate,
      mobSingleDisabilityRate,
      mobJointDisabilityRate,
      mobPackageARate,
      mobPackageBRate,
      mobPackageCRate,
      mobPackageASingleRate,
      mobPackageAJointRate,
      mobPackageBSingleRate,
      mobPackageBJointRate,
      mobPackageCSingleRate,
      mobPackageCJointRate
    },
    outputs: {
      vscRetail,
      gapRetail,
      basePayment,
      mobRatePerThousand,
      mobPremiumStart,
      mobPremiumAverage,
      paymentWithMob,
      coverageCombos
    }
  };
}

function setLoanWarrantyFeedback(message, state = 'info') {
  if (!selectors.loanWarrantyFeedback) return;
  selectors.loanWarrantyFeedback.textContent = message;
  selectors.loanWarrantyFeedback.dataset.state = state;
}

function getWarrantyConfigForCreditUnion(creditUnionId) {
  const stored = appState.accountWarrantyConfigs?.[creditUnionId];
  return stored && typeof stored === 'object'
    ? stored
    : {
      creditUnionMarkup: null,
      gfsMarkup: null,
      gapCost: null,
      gapCreditUnionMarkup: null,
      gapGfsMarkup: null,
      termExtensionsEnabled: false,
      vscTermExtension: null,
      gapTermExtension: null,
      mobCoverageType: '',
      mobRateStructure: '',
      mobBlendedRates: false,
      mobBlendedLifeRate: null,
      mobBlendedDisabilityRate: null,
      mobSingleLifeRate: null,
      mobJointLifeRate: null,
      mobSingleDisabilityRate: null,
      mobJointDisabilityRate: null,
      mobPackageARate: null,
      mobPackageBRate: null,
      mobPackageCRate: null,
      mobPackageASingleRate: null,
      mobPackageAJointRate: null,
      mobPackageBSingleRate: null,
      mobPackageBJointRate: null,
      mobPackageCSingleRate: null,
      mobPackageCJointRate: null
    };
}

function saveWarrantyConfig(creditUnionId, updates) {
  if (!creditUnionId) return;
  const current = getWarrantyConfigForCreditUnion(creditUnionId);
  const next = { ...current, ...updates };
  appState.accountWarrantyConfigs = {
    ...appState.accountWarrantyConfigs,
    [creditUnionId]: next
  };
  void persistWarrantyConfigs(creditUnionId, next);
}

function renderVinResults(result, message) {
  if (!selectors.loanVinResults) return;
  const container = selectors.loanVinResults;
  container.replaceChildren();

  if (!result) {
    const empty = document.createElement('p');
    empty.className = 'vin-results__empty';
    empty.textContent = message || 'Enter a VIN to decode vehicle details.';
    container.append(empty);
    return;
  }

  const fields = [
    { label: 'Model year', value: result.year, required: true },
    { label: 'Make', value: result.make, required: true },
    { label: 'Model', value: result.model, required: true },
    { label: 'Trim', value: result.trim },
    { label: 'Body', value: result.bodyClass },
    { label: 'Drive type', value: result.driveType },
    { label: 'Fuel type', value: result.fuelType }
  ];

  fields.forEach((field) => {
    if (!field.value && !field.required) return;
    const row = document.createElement('div');
    row.className = 'vin-results__item';
    const label = document.createElement('span');
    label.className = 'vin-results__label';
    label.textContent = field.label;
    const value = document.createElement('span');
    value.className = 'vin-results__value';
    value.textContent = field.value || 'Not reported';
    row.append(label, value);
    container.append(row);
  });
}

function updateLoanIllustration() {
  if (!selectors.loanBasePayment) return;

  const loanAmount = parseNumericInput(selectors.loanAmountInput?.value);
  const termMonths = parseNumericInput(selectors.loanTermInput?.value);
  const apr = parseNumericInput(selectors.loanAprInput?.value);
  const warrantyCost = parseNumericInput(selectors.loanWarrantyCostInput?.value);
  const creditUnionMarkup = parseNumericInput(selectors.loanCreditUnionMarkupInput?.value);
  const gfsMarkup = parseNumericInput(selectors.loanGfsMarkupInput?.value);
  const gapCost = parseNumericInput(selectors.loanGapCostInput?.value);
  const gapCreditUnionMarkup = parseNumericInput(selectors.loanGapCreditUnionMarkupInput?.value);
  const gapGfsMarkup = parseNumericInput(selectors.loanGapGfsMarkupInput?.value);
  const termExtensionsEnabled = selectors.loanTermExtensionToggle?.checked ?? false;
  const vscTermExtension = parseNumericInput(selectors.loanVscTermExtensionInput?.value);
  const gapTermExtension = parseNumericInput(selectors.loanGapTermExtensionInput?.value);
  const mobCoverageType = selectors.mobAccountCoverageTypeSelect?.value || '';
  const mobRateStructure = selectors.mobRateStructureSelect?.value || '';
  const mobBlendedRates = mobRateStructure === 'blended';
  const mobCreditLifeSelected = selectors.mobCreditLifeToggle?.checked ?? false;
  const mobCreditDisabilitySelected = selectors.mobCreditDisabilityToggle?.checked ?? false;
  const mobCreditTier = selectors.mobCreditTierSelect?.value || 'single';
  const mobBlendedLifeRate = parseNumericInput(selectors.mobBlendedLifeRateInput?.value);
  const mobBlendedDisabilityRate = parseNumericInput(selectors.mobBlendedDisabilityRateInput?.value);
  const mobSingleLifeRate = parseNumericInput(selectors.mobSingleLifeRateInput?.value);
  const mobJointLifeRate = parseNumericInput(selectors.mobJointLifeRateInput?.value);
  const mobSingleDisabilityRate = parseNumericInput(selectors.mobSingleDisabilityRateInput?.value);
  const mobJointDisabilityRate = parseNumericInput(selectors.mobJointDisabilityRateInput?.value);
  const mobPackageARate = parseNumericInput(selectors.mobPackageARateInput?.value);
  const mobPackageBRate = parseNumericInput(selectors.mobPackageBRateInput?.value);
  const mobPackageCRate = parseNumericInput(selectors.mobPackageCRateInput?.value);
  const mobPackageASingleRate = parseNumericInput(selectors.mobPackageASingleRateInput?.value);
  const mobPackageAJointRate = parseNumericInput(selectors.mobPackageAJointRateInput?.value);
  const mobPackageBSingleRate = parseNumericInput(selectors.mobPackageBSingleRateInput?.value);
  const mobPackageBJointRate = parseNumericInput(selectors.mobPackageBJointRateInput?.value);
  const mobPackageCSingleRate = parseNumericInput(selectors.mobPackageCSingleRateInput?.value);
  const mobPackageCJointRate = parseNumericInput(selectors.mobPackageCJointRateInput?.value);

  const basePayment = calculateMonthlyPayment(loanAmount, apr, termMonths);
  if (selectors.loanStandardTerm) {
    selectors.loanStandardTerm.textContent = Number.isFinite(termMonths) ? `${termMonths}-month term` : '—';
  }
  const hasWarrantyInputs = [warrantyCost, creditUnionMarkup, gfsMarkup].some(Number.isFinite);
  const vscRetail = hasWarrantyInputs
    ? (warrantyCost || 0) + (creditUnionMarkup || 0) + (gfsMarkup || 0)
    : null;
  const hasGapInputs = [gapCost, gapCreditUnionMarkup, gapGfsMarkup].some(Number.isFinite);
  const gapRetail = hasGapInputs
    ? (gapCost || 0) + (gapCreditUnionMarkup || 0) + (gapGfsMarkup || 0)
    : null;
  const coverageCombos = [
    { id: 'base', includeVsc: false, includeGap: false },
    { id: 'vsc', includeVsc: true, includeGap: false },
    { id: 'gap', includeVsc: false, includeGap: true },
    { id: 'vsc-gap', includeVsc: true, includeGap: true }
  ];
  const comboResults = new Map();
  coverageCombos.forEach((combo) => {
    const missingVscPricing = combo.includeVsc && !Number.isFinite(vscRetail);
    const missingGapPricing = combo.includeGap && !Number.isFinite(gapRetail);
    const coverageCost =
      missingVscPricing || missingGapPricing
        ? null
        : (combo.includeVsc ? vscRetail : 0) + (combo.includeGap ? gapRetail : 0);
    const totalAmount =
      Number.isFinite(loanAmount) && Number.isFinite(coverageCost) ? loanAmount + coverageCost : null;
    const payment = calculateMonthlyPayment(totalAmount, apr, termMonths);
    const delta =
      Number.isFinite(basePayment) && Number.isFinite(payment)
        ? payment - basePayment
        : null;
    const termExtensionMonths = termExtensionsEnabled
      ? (combo.includeVsc && Number.isFinite(vscTermExtension) ? vscTermExtension : 0) +
        (combo.includeGap && Number.isFinite(gapTermExtension) ? gapTermExtension : 0)
      : 0;
    const extendedTermMonths =
      Number.isFinite(termMonths) && termExtensionMonths > 0 ? termMonths + termExtensionMonths : null;
    const extensionPayment =
      Number.isFinite(extendedTermMonths) && Number.isFinite(totalAmount)
        ? calculateMonthlyPayment(totalAmount, apr, extendedTermMonths)
        : null;
    comboResults.set(combo.id, {
      payment,
      delta,
      totalAmount,
      extendedTermMonths,
      extensionPayment
    });
  });

  const selectedPackage =
    document.querySelector('input[name="mob-debt-package"]:checked')?.value || 'none';
  const mobRatePerThousand = resolveMobRatePerThousand({
    mobCoverageType,
    mobBlendedRates,
    mobCreditLifeSelected,
    mobCreditDisabilitySelected,
    mobCreditTier,
    mobBlendedLifeRate,
    mobBlendedDisabilityRate,
    mobSingleLifeRate,
    mobJointLifeRate,
    mobSingleDisabilityRate,
    mobJointDisabilityRate,
    mobPackageARate,
    mobPackageBRate,
    mobPackageCRate,
    mobDebtPackage: selectedPackage
  });

  const { firstPremium: mobPremiumStart, averagePremium: mobPremiumAverage } = calculateMobPremiums({
    loanAmount,
    termMonths,
    apr,
    ratePerThousand: mobRatePerThousand
  });
  const basePaymentForMob = basePayment;
  const paymentWithMob =
    Number.isFinite(basePaymentForMob) && Number.isFinite(mobPremiumStart)
      ? basePaymentForMob + mobPremiumStart
      : null;
  const coverageComboOutputs = coverageCombos.map((combo) => {
    const comboResult = comboResults.get(combo.id) || {};
    return {
      id: combo.id,
      includeVsc: combo.includeVsc,
      includeGap: combo.includeGap,
      payment: Number.isFinite(comboResult.payment) ? comboResult.payment : null,
      delta: Number.isFinite(comboResult.delta) ? comboResult.delta : null,
      totalAmount: Number.isFinite(comboResult.totalAmount) ? comboResult.totalAmount : null,
      extendedTermMonths: Number.isFinite(comboResult.extendedTermMonths) ? comboResult.extendedTermMonths : null,
      extensionPayment: Number.isFinite(comboResult.extensionPayment) ? comboResult.extensionPayment : null
    };
  });

  selectors.loanBasePayment.textContent = formatCurrencyValue(basePayment);
  document.querySelectorAll('[data-coverage-combo]').forEach((card) => {
    const comboId = card.dataset.coverageCombo;
    const combo = comboResults.get(comboId);
    if (!combo) return;
    const paymentField = card.querySelector('[data-coverage-field="payment"]');
    const deltaField = card.querySelector('[data-coverage-field="delta"]');
    const totalField = card.querySelector('[data-coverage-field="total"]');
    const extensionRow = card.querySelector('[data-coverage-field="extension-row"]');
    const extensionTermField = card.querySelector('[data-coverage-field="extension-term"]');
    const extensionPaymentField = card.querySelector('[data-coverage-field="extension-payment"]');
    if (paymentField) {
      paymentField.textContent = formatCurrencyValue(combo.payment);
    }
    if (deltaField) {
      const baseDelta = Number.isFinite(basePayment) ? 0 : null;
      deltaField.textContent =
        comboId === 'base' ? formatCurrencyValue(baseDelta) : formatCurrencyValue(combo.delta);
    }
    if (totalField) {
      totalField.textContent = formatCurrencyValue(combo.totalAmount);
    }
    if (extensionRow && extensionTermField && extensionPaymentField) {
      const showExtension = Number.isFinite(combo.extensionPayment);
      extensionRow.hidden = !showExtension;
      extensionTermField.textContent =
        showExtension && Number.isFinite(combo.extendedTermMonths)
          ? `Extended ${combo.extendedTermMonths}-month payment`
          : 'Extended term payment';
      extensionPaymentField.textContent = formatCurrencyValue(combo.extensionPayment);
    }
  });
  if (selectors.loanMobPremiumStart) {
    selectors.loanMobPremiumStart.textContent = formatCurrencyValue(mobPremiumStart);
  }
  if (selectors.loanMobPremiumAverage) {
    selectors.loanMobPremiumAverage.textContent = formatCurrencyValue(mobPremiumAverage);
  }
  if (selectors.loanPaymentWithMob) {
    selectors.loanPaymentWithMob.textContent = formatCurrencyValue(paymentWithMob);
  }

  appState.loanIllustrationDraft = buildLoanIllustrationSnapshot({
    loanAmount,
    termMonths,
    apr,
    miles: parseNumericInput(selectors.loanMilesInput?.value),
    vin: selectors.loanVinInput?.value?.trim() || '',
    warrantyCost,
    creditUnionMarkup,
    gfsMarkup,
    gapCost,
    gapCreditUnionMarkup,
    gapGfsMarkup,
    termExtensionsEnabled,
    vscTermExtension,
    gapTermExtension,
    mobCoverageType,
    mobRateStructure,
    mobBlendedRates,
    mobCreditLifeSelected,
    mobCreditDisabilitySelected,
    mobCreditTier,
    mobDebtPackage: selectedPackage,
    mobRatePerThousand,
    mobBlendedLifeRate,
    mobBlendedDisabilityRate,
    mobSingleLifeRate,
    mobJointLifeRate,
    mobSingleDisabilityRate,
    mobJointDisabilityRate,
    mobPackageARate,
    mobPackageBRate,
    mobPackageCRate,
    mobPackageASingleRate,
    mobPackageAJointRate,
    mobPackageBSingleRate,
    mobPackageBJointRate,
    mobPackageCSingleRate,
    mobPackageCJointRate,
    vscRetail,
    gapRetail,
    basePayment,
    mobPremiumStart,
    mobPremiumAverage,
    paymentWithMob,
    coverageCombos: coverageComboOutputs
  });
  updateLoanIllustrationSaveState();

  updateProtectionOptionsAvailability();
  updateCoverageRequestAvailability();
}

function updatePersonalLoanIllustration() {
  if (!selectors.personalBasePayment) return;

  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) {
    selectors.personalBasePayment.textContent = '—';
    if (selectors.personalMobPremiumStart) {
      selectors.personalMobPremiumStart.textContent = '—';
    }
    if (selectors.personalMobPremiumAverage) {
      selectors.personalMobPremiumAverage.textContent = '—';
    }
    if (selectors.personalPaymentWithMob) {
      selectors.personalPaymentWithMob.textContent = '—';
    }
    return;
  }

  const loanAmount = parseNumericInput(selectors.personalLoanAmountInput?.value);
  const termMonths = parseNumericInput(selectors.personalLoanTermInput?.value);
  const apr = parseNumericInput(selectors.personalLoanAprInput?.value);
  const config = getWarrantyConfigForCreditUnion(creditUnionId);
  const mobCoverageType =
    selectors.personalMobCoverageTypeSelect?.value || config.mobCoverageType || 'credit-insurance';
  const mobBlendedRates = Boolean(config.mobBlendedRates);
  const mobCreditLifeSelected = selectors.personalMobCreditLifeToggle?.checked ?? false;
  const mobCreditDisabilitySelected = selectors.personalMobCreditDisabilityToggle?.checked ?? false;
  const mobCreditTier = selectors.personalMobCreditTierSelect?.value || 'single';
  const selectedPackage =
    document.querySelector('input[name="personal-mob-debt-package"]:checked')?.value || 'none';

  const mobRatePerThousand = resolveMobRatePerThousand({
    mobCoverageType,
    mobBlendedRates,
    mobCreditLifeSelected,
    mobCreditDisabilitySelected,
    mobCreditTier,
    mobBlendedLifeRate: config.mobBlendedLifeRate,
    mobBlendedDisabilityRate: config.mobBlendedDisabilityRate,
    mobSingleLifeRate: config.mobSingleLifeRate,
    mobJointLifeRate: config.mobJointLifeRate,
    mobSingleDisabilityRate: config.mobSingleDisabilityRate,
    mobJointDisabilityRate: config.mobJointDisabilityRate,
    mobPackageARate: config.mobPackageARate,
    mobPackageBRate: config.mobPackageBRate,
    mobPackageCRate: config.mobPackageCRate,
    mobDebtPackage: selectedPackage
  });

  const basePayment = calculateMonthlyPayment(loanAmount, apr, termMonths);
  const { firstPremium: mobPremiumStart, averagePremium: mobPremiumAverage } = calculateMobPremiums({
    loanAmount,
    termMonths,
    apr,
    ratePerThousand: mobRatePerThousand
  });
  const paymentWithMob =
    Number.isFinite(basePayment) && Number.isFinite(mobPremiumStart)
      ? basePayment + mobPremiumStart
      : null;

  selectors.personalBasePayment.textContent = formatCurrencyValue(basePayment);
  if (selectors.personalMobPremiumStart) {
    selectors.personalMobPremiumStart.textContent = formatCurrencyValue(mobPremiumStart);
  }
  if (selectors.personalMobPremiumAverage) {
    selectors.personalMobPremiumAverage.textContent = formatCurrencyValue(mobPremiumAverage);
  }
  if (selectors.personalPaymentWithMob) {
    selectors.personalPaymentWithMob.textContent = formatCurrencyValue(paymentWithMob);
  }
}

function updateProtectionOptionsAvailability() {
  if (!selectors.loanProtectionOptionsBtn) return;
  const loanAmount = parseNumericInput(selectors.loanAmountInput?.value);
  const termMonths = parseNumericInput(selectors.loanTermInput?.value);
  const apr = parseNumericInput(selectors.loanAprInput?.value);
  const miles = parseNumericInput(selectors.loanMilesInput?.value);
  const vin = selectors.loanVinInput?.value?.trim() ?? '';
  const hasCreditUnion = Boolean(appState.accountSelectionId);
  const isReady =
    hasCreditUnion &&
    Number.isFinite(loanAmount) &&
    loanAmount > 0 &&
    Number.isFinite(termMonths) &&
    termMonths > 0 &&
    Number.isFinite(apr) &&
    Number.isFinite(miles) &&
    vin.length === 17;
  selectors.loanProtectionOptionsBtn.disabled = !isReady;
}

function setLoanOfficerDisabled(isDisabled) {
  const elements = [
    selectors.loanAmountInput,
    selectors.loanTermInput,
    selectors.loanAprInput,
    selectors.loanMilesInput,
    selectors.loanVinInput,
    selectors.loanVinDecodeBtn,
    selectors.loanProtectionOptionsBtn,
    selectors.coverageRequestMemberName,
    selectors.coverageRequestPhone,
    selectors.coverageRequestEmail,
    selectors.coverageRequestBtn,
    selectors.loanWarrantyCostInput,
    selectors.loanCreditUnionMarkupInput,
    selectors.loanGfsMarkupInput,
    selectors.loanGapCostInput,
    selectors.loanGapCreditUnionMarkupInput,
    selectors.loanGapGfsMarkupInput,
    selectors.loanWarrantyFetchBtn,
    selectors.personalLoanAmountInput,
    selectors.personalLoanTermInput,
    selectors.personalLoanAprInput,
    selectors.personalMobCoverageTypeSelect,
    selectors.personalMobCreditLifeToggle,
    selectors.personalMobCreditDisabilityToggle,
    selectors.personalMobCreditTierSelect,
    selectors.mobCreditLifeToggle,
    selectors.mobCreditDisabilityToggle,
    selectors.mobCreditTierSelect,
    selectors.mobAccountCoverageTypeSelect,
    selectors.mobRateStructureSelect,
    selectors.mobBlendedLifeRateInput,
    selectors.mobBlendedDisabilityRateInput,
    selectors.mobSingleLifeRateInput,
    selectors.mobJointLifeRateInput,
    selectors.mobSingleDisabilityRateInput,
    selectors.mobJointDisabilityRateInput,
    selectors.mobPackageARateInput,
    selectors.mobPackageBRateInput,
    selectors.mobPackageCRateInput,
    selectors.mobPackageASingleRateInput,
    selectors.mobPackageAJointRateInput,
    selectors.mobPackageBSingleRateInput,
    selectors.mobPackageBJointRateInput,
    selectors.mobPackageCSingleRateInput,
    selectors.mobPackageCJointRateInput,
    selectors.loanTermExtensionToggle,
    selectors.loanVscTermExtensionInput,
    selectors.loanGapTermExtensionInput
  ];
  elements.forEach((element) => {
    if (element) {
      element.disabled = isDisabled;
    }
  });
  if (selectors.mobCoverageTypeSelect) {
    selectors.mobCoverageTypeSelect.disabled = true;
  }
  document.querySelectorAll('input[name="mob-debt-package"]').forEach((input) => {
    input.disabled = isDisabled;
  });
  document.querySelectorAll('input[name="personal-mob-debt-package"]').forEach((input) => {
    input.disabled = isDisabled;
  });
}

function renderLoanOfficerCalculator() {
  if (!selectors.loanOfficerSummary) return;
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) {
    selectors.loanOfficerSummary.textContent = 'Select a credit union to start an illustration.';
    setLoanOfficerDisabled(true);
    setTermExtensionFieldVisibility(false);
    appState.loanIllustrationEditingId = null;
    appState.loanIllustrationDraft = null;
    updateLoanIllustrationSaveState();
    setLoanIllustrationSaveStatus('', 'info');
    updateLoanIllustration();
    updatePersonalLoanIllustration();
    renderVinResults(null);
    setLoanWarrantyFeedback('');
    updateCoverageRequestAvailability();
    return;
  }

  const creditUnionName = getCreditUnionNameById(creditUnionId) || 'Selected credit union';
  selectors.loanOfficerSummary.textContent = `Showing a loan illustration for ${creditUnionName}.`;
  setLoanOfficerDisabled(false);
  updateProtectionOptionsAvailability();
  updateCoverageRequestAvailability();

  const config = getWarrantyConfigForCreditUnion(creditUnionId);
  if (selectors.loanCreditUnionMarkupInput) {
    selectors.loanCreditUnionMarkupInput.value =
      Number.isFinite(config.creditUnionMarkup) ? config.creditUnionMarkup : '';
  }
  if (selectors.loanGfsMarkupInput) {
    selectors.loanGfsMarkupInput.value = Number.isFinite(config.gfsMarkup) ? config.gfsMarkup : '';
  }
  if (selectors.loanGapCostInput) {
    selectors.loanGapCostInput.value = Number.isFinite(config.gapCost) ? config.gapCost : '';
  }
  if (selectors.loanGapCreditUnionMarkupInput) {
    selectors.loanGapCreditUnionMarkupInput.value =
      Number.isFinite(config.gapCreditUnionMarkup) ? config.gapCreditUnionMarkup : '';
  }
  if (selectors.loanGapGfsMarkupInput) {
    selectors.loanGapGfsMarkupInput.value =
      Number.isFinite(config.gapGfsMarkup) ? config.gapGfsMarkup : '';
  }
  if (selectors.mobAccountCoverageTypeSelect) {
    selectors.mobAccountCoverageTypeSelect.value = config.mobCoverageType || '';
  }
  const resolvedRateStructure = config.mobRateStructure || '';
  if (selectors.mobRateStructureSelect) {
    selectors.mobRateStructureSelect.value = resolvedRateStructure;
  }
  if (selectors.mobBlendedLifeRateInput) {
    selectors.mobBlendedLifeRateInput.value =
      Number.isFinite(config.mobBlendedLifeRate) ? config.mobBlendedLifeRate : '';
  }
  if (selectors.mobBlendedDisabilityRateInput) {
    selectors.mobBlendedDisabilityRateInput.value =
      Number.isFinite(config.mobBlendedDisabilityRate) ? config.mobBlendedDisabilityRate : '';
  }
  if (selectors.mobSingleLifeRateInput) {
    selectors.mobSingleLifeRateInput.value =
      Number.isFinite(config.mobSingleLifeRate) ? config.mobSingleLifeRate : '';
  }
  if (selectors.mobJointLifeRateInput) {
    selectors.mobJointLifeRateInput.value =
      Number.isFinite(config.mobJointLifeRate) ? config.mobJointLifeRate : '';
  }
  if (selectors.mobSingleDisabilityRateInput) {
    selectors.mobSingleDisabilityRateInput.value =
      Number.isFinite(config.mobSingleDisabilityRate) ? config.mobSingleDisabilityRate : '';
  }
  if (selectors.mobJointDisabilityRateInput) {
    selectors.mobJointDisabilityRateInput.value =
      Number.isFinite(config.mobJointDisabilityRate) ? config.mobJointDisabilityRate : '';
  }
  if (selectors.mobPackageARateInput) {
    selectors.mobPackageARateInput.value =
      Number.isFinite(config.mobPackageARate) ? config.mobPackageARate : '';
  }
  if (selectors.mobPackageBRateInput) {
    selectors.mobPackageBRateInput.value =
      Number.isFinite(config.mobPackageBRate) ? config.mobPackageBRate : '';
  }
  if (selectors.mobPackageCRateInput) {
    selectors.mobPackageCRateInput.value =
      Number.isFinite(config.mobPackageCRate) ? config.mobPackageCRate : '';
  }
  if (selectors.mobPackageASingleRateInput) {
    selectors.mobPackageASingleRateInput.value =
      Number.isFinite(config.mobPackageASingleRate) ? config.mobPackageASingleRate : '';
  }
  if (selectors.mobPackageAJointRateInput) {
    selectors.mobPackageAJointRateInput.value =
      Number.isFinite(config.mobPackageAJointRate) ? config.mobPackageAJointRate : '';
  }
  if (selectors.mobPackageBSingleRateInput) {
    selectors.mobPackageBSingleRateInput.value =
      Number.isFinite(config.mobPackageBSingleRate) ? config.mobPackageBSingleRate : '';
  }
  if (selectors.mobPackageBJointRateInput) {
    selectors.mobPackageBJointRateInput.value =
      Number.isFinite(config.mobPackageBJointRate) ? config.mobPackageBJointRate : '';
  }
  if (selectors.mobPackageCSingleRateInput) {
    selectors.mobPackageCSingleRateInput.value =
      Number.isFinite(config.mobPackageCSingleRate) ? config.mobPackageCSingleRate : '';
  }
  if (selectors.mobPackageCJointRateInput) {
    selectors.mobPackageCJointRateInput.value =
      Number.isFinite(config.mobPackageCJointRate) ? config.mobPackageCJointRate : '';
  }
  if (selectors.loanTermExtensionToggle) {
    selectors.loanTermExtensionToggle.checked = Boolean(config.termExtensionsEnabled);
  }
  if (selectors.loanVscTermExtensionInput) {
    selectors.loanVscTermExtensionInput.value =
      Number.isFinite(config.vscTermExtension) ? config.vscTermExtension : '';
  }
  if (selectors.loanGapTermExtensionInput) {
    selectors.loanGapTermExtensionInput.value =
      Number.isFinite(config.gapTermExtension) ? config.gapTermExtension : '';
  }
  setTermExtensionFieldVisibility(Boolean(config.termExtensionsEnabled));
  updateMobPricingVisibility({
    mobCoverageType: config.mobCoverageType || '',
    mobRateStructure: resolvedRateStructure
  });
  updateMobCoverageControls({
    mobCoverageType: config.mobCoverageType || '',
    mobRateStructure: resolvedRateStructure
  });
  if (selectors.personalMobCoverageTypeSelect) {
    selectors.personalMobCoverageTypeSelect.value = config.mobCoverageType || 'credit-insurance';
  }
  updatePersonalCoverageControls({
    mobCoverageType: selectors.personalMobCoverageTypeSelect?.value || 'credit-insurance',
    mobBlendedRates: Boolean(config.mobBlendedRates)
  });

  updateLoanIllustration();
  updatePersonalLoanIllustration();
}

function formatLoanDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US');
}

function formatLoanCoverageSummary(loan) {
  if (!loan) return '—';
  if (loan.coverageSelected === false) {
    return 'No coverage selected';
  }

  const details = [];
  const coverageTypeLabel =
    loan.coverageType === 'debt-protection'
      ? 'Debt protection'
      : loan.coverageType === 'credit-insurance'
        ? 'Credit insurance'
        : null;
  if (coverageTypeLabel) {
    details.push(coverageTypeLabel);
  }
  if (loan.coverageDetails?.creditLife) {
    details.push('Credit life');
  }
  if (loan.coverageDetails?.creditDisability) {
    details.push('Credit disability');
  }
  if (loan.coverageDetails?.creditTier) {
    const tierLabel = loan.coverageDetails.creditTier
      .replace('-', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    details.push(`${tierLabel} tier`);
  }
  if (loan.coverageDetails?.debtPackage && loan.coverageDetails.debtPackage !== 'none') {
    const packageLabel = loan.coverageDetails.debtPackage.replace('-', ' ').toUpperCase();
    details.push(packageLabel);
  }

  if (!details.length) {
    return 'Coverage selected';
  }
  return `Yes — ${details.join(' • ')}`;
}

function formatLoanProducts(loan) {
  if (!loan?.products) return '—';
  const selections = [];
  if (loan.products.vscSelected) selections.push('VSC');
  if (loan.products.gapSelected) selections.push('GAP');
  return selections.length ? selections.join(' • ') : 'None';
}

function setLoanLogDefaults() {
  if (selectors.loanLogDateInput && !selectors.loanLogDateInput.value) {
    const today = new Date();
    selectors.loanLogDateInput.value = today.toISOString().slice(0, 10);
  }
}

function setLoanLogDisabled(isDisabled) {
  [
    selectors.loanLogDateInput,
    selectors.loanLogOfficerInput,
    selectors.loanLogCoverageSelect,
    selectors.loanLogVscToggle,
    selectors.loanLogGapToggle,
    selectors.loanLogSaveBtn,
    selectors.loanLogCancelBtn
  ].forEach((element) => {
    if (element) {
      element.disabled = isDisabled;
    }
  });
}

function resetLoanLogForm() {
  selectors.loanLogForm?.reset();
  appState.loanEditingId = null;
  if (selectors.loanLogSaveBtn) {
    selectors.loanLogSaveBtn.textContent = 'Issue coverage';
  }
  if (selectors.loanLogCancelBtn) {
    selectors.loanLogCancelBtn.hidden = true;
  }
  setLoanLogDefaults();
  setFeedback(selectors.loanLogFeedback, '', 'info');
}

function populateLoanLogForm(loan) {
  if (!loan) return;
  appState.loanEditingId = loan.id;
  if (selectors.loanLogDateInput) {
    selectors.loanLogDateInput.value = loan.loanDate ? loan.loanDate.slice(0, 10) : '';
  }
  if (selectors.loanLogOfficerInput) {
    selectors.loanLogOfficerInput.value = loan.loanOfficer || '';
  }
  if (selectors.loanLogCoverageSelect) {
    selectors.loanLogCoverageSelect.value = loan.coverageSelected ? 'yes' : 'no';
  }
  if (selectors.loanLogVscToggle) {
    selectors.loanLogVscToggle.checked = Boolean(loan.products?.vscSelected);
  }
  if (selectors.loanLogGapToggle) {
    selectors.loanLogGapToggle.checked = Boolean(loan.products?.gapSelected);
  }
  if (selectors.loanAmountInput) {
    selectors.loanAmountInput.value = Number.isFinite(loan.loanAmount) ? loan.loanAmount : '';
  }
  if (selectors.loanTermInput) {
    selectors.loanTermInput.value = Number.isFinite(loan.termMonths) ? loan.termMonths : '';
  }
  if (selectors.loanAprInput) {
    selectors.loanAprInput.value = Number.isFinite(loan.apr) ? loan.apr : '';
  }
  if (selectors.loanMilesInput) {
    selectors.loanMilesInput.value = Number.isFinite(loan.mileage) ? loan.mileage : '';
  }
  if (selectors.loanVinInput) {
    selectors.loanVinInput.value = loan.vin || '';
  }
  if (selectors.mobCoverageTypeSelect && loan.coverageType) {
    selectors.mobCoverageTypeSelect.value = loan.coverageType;
  }
  if (selectors.mobCreditLifeToggle) {
    selectors.mobCreditLifeToggle.checked = Boolean(loan.coverageDetails?.creditLife);
  }
  if (selectors.mobCreditDisabilityToggle) {
    selectors.mobCreditDisabilityToggle.checked = Boolean(loan.coverageDetails?.creditDisability);
  }
  if (selectors.mobCreditTierSelect && loan.coverageDetails?.creditTier) {
    selectors.mobCreditTierSelect.value = loan.coverageDetails.creditTier;
  }
  if (loan.coverageDetails?.debtPackage) {
    const selected = document.querySelector(
      `input[name="mob-debt-package"][value="${loan.coverageDetails.debtPackage}"]`
    );
    if (selected) {
      selected.checked = true;
    }
  }
  if (selectors.loanLogSaveBtn) {
    selectors.loanLogSaveBtn.textContent = 'Update coverage';
  }
  if (selectors.loanLogCancelBtn) {
    selectors.loanLogCancelBtn.hidden = false;
  }
  updateLoanIllustration();
  updateProtectionOptionsAvailability();
}

function buildLoanPayload() {
  const creditUnionId = appState.accountSelectionId;
  const loanDate = selectors.loanLogDateInput?.value || '';
  const loanOfficer = selectors.loanLogOfficerInput?.value?.trim() || '';
  const coverageSelectedValue = selectors.loanLogCoverageSelect?.value || '';
  const coverageSelected =
    coverageSelectedValue === 'yes' ? true : coverageSelectedValue === 'no' ? false : null;
  const selectedPackage =
    document.querySelector('input[name="mob-debt-package"]:checked')?.value || 'none';

  return {
    creditUnionId,
    loanDate,
    loanOfficer,
    loanAmount: parseNumericInput(selectors.loanAmountInput?.value),
    termMonths: parseNumericInput(selectors.loanTermInput?.value),
    apr: parseNumericInput(selectors.loanAprInput?.value),
    mileage: parseNumericInput(selectors.loanMilesInput?.value),
    vin: selectors.loanVinInput?.value?.trim() || '',
    coverageSelected,
    coverageType: selectors.mobCoverageTypeSelect?.value || null,
    coverageDetails: {
      creditLife: selectors.mobCreditLifeToggle?.checked ?? false,
      creditDisability: selectors.mobCreditDisabilityToggle?.checked ?? false,
      creditTier: selectors.mobCreditTierSelect?.value || null,
      debtPackage: selectedPackage || null
    },
    products: {
      vscSelected: selectors.loanLogVscToggle?.checked ?? false,
      gapSelected: selectors.loanLogGapToggle?.checked ?? false
    }
  };
}

function renderLoanLog() {
  if (!selectors.loanLogList) return;
  const creditUnionId = appState.accountSelectionId;
  const creditUnionName = getCreditUnionNameById(creditUnionId) || 'this credit union';
  const summary = selectors.loanLogSummary;
  const emptyState = selectors.loanLogEmpty;

  selectors.loanLogList.replaceChildren();

  if (!creditUnionId) {
    if (summary) {
      summary.textContent = 'Select a credit union to issue coverage and update the sales register.';
    }
    if (emptyState) {
      emptyState.hidden = true;
    }
    setLoanLogDisabled(true);
    resetLoanLogForm();
    return;
  }

  setLoanLogDisabled(false);
  setLoanLogDefaults();

  const loans = Array.isArray(appState.loanEntries[creditUnionId])
    ? appState.loanEntries[creditUnionId]
    : [];

  if (appState.loanEditingId && !loans.some((loan) => loan.id === appState.loanEditingId)) {
    resetLoanLogForm();
  }

  if (summary) {
    summary.textContent = `${loans.length} coverage entr${loans.length === 1 ? 'y' : 'ies'} issued for ${creditUnionName}.`;
  }

  if (!loans.length) {
    if (emptyState) {
      emptyState.hidden = false;
    }
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  const fragment = document.createDocumentFragment();
  loans.forEach((loan) => {
    const row = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = formatLoanDate(loan.loanDate);

    const officerCell = document.createElement('td');
    officerCell.textContent = loan.loanOfficer || '—';

    const amountCell = document.createElement('td');
    amountCell.className = 'numeric';
    amountCell.textContent = Number.isFinite(loan.loanAmount) ? formatCurrencyValue(loan.loanAmount) : '—';

    const termCell = document.createElement('td');
    termCell.className = 'numeric';
    termCell.textContent = Number.isFinite(loan.termMonths) ? `${loan.termMonths} mo` : '—';

    const aprCell = document.createElement('td');
    aprCell.className = 'numeric';
    aprCell.textContent = Number.isFinite(loan.apr) ? `${decimalFormatter.format(loan.apr)}%` : '—';

    const mileageCell = document.createElement('td');
    mileageCell.className = 'numeric';
    mileageCell.textContent = Number.isFinite(loan.mileage) ? integerFormatter.format(loan.mileage) : '—';

    const vinCell = document.createElement('td');
    vinCell.textContent = loan.vin || '—';

    const coverageCell = document.createElement('td');
    coverageCell.textContent = formatLoanCoverageSummary(loan);

    const productsCell = document.createElement('td');
    productsCell.textContent = formatLoanProducts(loan);

    const actionsCell = document.createElement('td');
    actionsCell.className = 'numeric';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'table-action-button';
    editButton.dataset.action = 'edit-loan';
    editButton.dataset.loanId = loan.id;
    editButton.textContent = 'Edit';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'table-action-button table-action-button--danger';
    deleteButton.dataset.action = 'delete-loan';
    deleteButton.dataset.loanId = loan.id;
    deleteButton.textContent = 'Delete';

    actionsCell.append(editButton, deleteButton);

    row.append(
      dateCell,
      officerCell,
      amountCell,
      termCell,
      aprCell,
      mileageCell,
      vinCell,
      coverageCell,
      productsCell,
      actionsCell
    );
    fragment.append(row);
  });

  selectors.loanLogList.append(fragment);
}

function updateLoanIllustrationSaveState() {
  if (!selectors.loanIllustrationSaveBtn) return;
  const creditUnionId = appState.accountSelectionId;
  selectors.loanIllustrationSaveBtn.disabled = !creditUnionId;
  selectors.loanIllustrationSaveBtn.textContent = appState.loanIllustrationEditingId ? 'Update snapshot' : 'Save snapshot';
}

function setLoanIllustrationSaveStatus(message, state = 'info') {
  if (!selectors.loanIllustrationSaveStatus) return;
  selectors.loanIllustrationSaveStatus.textContent = message;
  selectors.loanIllustrationSaveStatus.dataset.state = state;
}

function renderLoanIllustrationHistory() {
  const list = selectors.loanIllustrationList;
  if (!list) return;
  const emptyState = selectors.loanIllustrationEmpty;
  const creditUnionId = appState.accountSelectionId;
  const illustrations = creditUnionId ? appState.loanIllustrations[creditUnionId] || [] : [];

  list.replaceChildren();

  if (!creditUnionId) {
    if (emptyState) {
      emptyState.hidden = true;
    }
    updateLoanIllustrationSaveState();
    return;
  }

  updateLoanIllustrationSaveState();

  if (!illustrations.length) {
    if (emptyState) {
      emptyState.hidden = false;
    }
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }

  const fragment = document.createDocumentFragment();
  illustrations.forEach((illustration) => {
    const item = document.createElement('li');
    item.className = 'loan-illustration-item';
    if (illustration.id === appState.loanIllustrationEditingId) {
      item.classList.add('loan-illustration-item--active');
    }

    const details = document.createElement('div');
    details.className = 'loan-illustration-item__details';

    const title = document.createElement('p');
    title.className = 'loan-illustration-item__title';
    title.textContent = illustration.label || 'Quote snapshot';

    const meta = document.createElement('p');
    meta.className = 'loan-illustration-item__meta';
    const coverageSummary = formatLoanIllustrationCoverageSummary(illustration.selections);
    const updatedAt = illustration.updatedAt ? new Date(illustration.updatedAt) : null;
    const updatedLabel = updatedAt ? updatedAt.toLocaleString('en-US') : 'Unknown time';
    meta.textContent = `${coverageSummary} • Saved ${updatedLabel}`;

    details.append(title, meta);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'secondary-button';
    button.dataset.action = 'open-illustration';
    button.dataset.illustrationId = illustration.id;
    button.textContent = 'Open';

    item.append(details, button);
    fragment.append(item);
  });

  list.append(fragment);
}

function applyLoanIllustrationSnapshot(illustration) {
  if (!illustration) return;
  const inputs = illustration.inputs || {};
  const selections = illustration.selections || {};
  const mobRates = illustration.mobRates || {};

  if (selectors.loanAmountInput) {
    selectors.loanAmountInput.value = Number.isFinite(inputs.loanAmount) ? inputs.loanAmount : '';
  }
  if (selectors.loanTermInput) {
    selectors.loanTermInput.value = Number.isFinite(inputs.termMonths) ? inputs.termMonths : '';
  }
  if (selectors.loanAprInput) {
    selectors.loanAprInput.value = Number.isFinite(inputs.apr) ? inputs.apr : '';
  }
  if (selectors.loanMilesInput) {
    selectors.loanMilesInput.value = Number.isFinite(inputs.miles) ? inputs.miles : '';
  }
  if (selectors.loanVinInput) {
    selectors.loanVinInput.value = inputs.vin || '';
  }
  if (selectors.loanWarrantyCostInput) {
    selectors.loanWarrantyCostInput.value = Number.isFinite(inputs.warrantyCost) ? inputs.warrantyCost : '';
  }
  if (selectors.loanCreditUnionMarkupInput) {
    selectors.loanCreditUnionMarkupInput.value = Number.isFinite(inputs.creditUnionMarkup) ? inputs.creditUnionMarkup : '';
  }
  if (selectors.loanGfsMarkupInput) {
    selectors.loanGfsMarkupInput.value = Number.isFinite(inputs.gfsMarkup) ? inputs.gfsMarkup : '';
  }
  if (selectors.loanGapCostInput) {
    selectors.loanGapCostInput.value = Number.isFinite(inputs.gapCost) ? inputs.gapCost : '';
  }
  if (selectors.loanGapCreditUnionMarkupInput) {
    selectors.loanGapCreditUnionMarkupInput.value = Number.isFinite(inputs.gapCreditUnionMarkup)
      ? inputs.gapCreditUnionMarkup
      : '';
  }
  if (selectors.loanGapGfsMarkupInput) {
    selectors.loanGapGfsMarkupInput.value = Number.isFinite(inputs.gapGfsMarkup) ? inputs.gapGfsMarkup : '';
  }
  if (selectors.loanTermExtensionToggle) {
    selectors.loanTermExtensionToggle.checked = Boolean(inputs.termExtensionsEnabled);
  }
  if (selectors.loanVscTermExtensionInput) {
    selectors.loanVscTermExtensionInput.value = Number.isFinite(inputs.vscTermExtension) ? inputs.vscTermExtension : '';
  }
  if (selectors.loanGapTermExtensionInput) {
    selectors.loanGapTermExtensionInput.value = Number.isFinite(inputs.gapTermExtension) ? inputs.gapTermExtension : '';
  }
  if (selectors.mobAccountCoverageTypeSelect) {
    selectors.mobAccountCoverageTypeSelect.value = selections.mobCoverageType || '';
  }
  if (selectors.mobRateStructureSelect) {
    selectors.mobRateStructureSelect.value = selections.mobRateStructure || '';
  }
  if (selectors.mobBlendedLifeRateInput) {
    selectors.mobBlendedLifeRateInput.value = Number.isFinite(mobRates.mobBlendedLifeRate)
      ? mobRates.mobBlendedLifeRate
      : '';
  }
  if (selectors.mobBlendedDisabilityRateInput) {
    selectors.mobBlendedDisabilityRateInput.value = Number.isFinite(mobRates.mobBlendedDisabilityRate)
      ? mobRates.mobBlendedDisabilityRate
      : '';
  }
  if (selectors.mobSingleLifeRateInput) {
    selectors.mobSingleLifeRateInput.value = Number.isFinite(mobRates.mobSingleLifeRate)
      ? mobRates.mobSingleLifeRate
      : '';
  }
  if (selectors.mobJointLifeRateInput) {
    selectors.mobJointLifeRateInput.value = Number.isFinite(mobRates.mobJointLifeRate)
      ? mobRates.mobJointLifeRate
      : '';
  }
  if (selectors.mobSingleDisabilityRateInput) {
    selectors.mobSingleDisabilityRateInput.value = Number.isFinite(mobRates.mobSingleDisabilityRate)
      ? mobRates.mobSingleDisabilityRate
      : '';
  }
  if (selectors.mobJointDisabilityRateInput) {
    selectors.mobJointDisabilityRateInput.value = Number.isFinite(mobRates.mobJointDisabilityRate)
      ? mobRates.mobJointDisabilityRate
      : '';
  }
  if (selectors.mobPackageARateInput) {
    selectors.mobPackageARateInput.value = Number.isFinite(mobRates.mobPackageARate) ? mobRates.mobPackageARate : '';
  }
  if (selectors.mobPackageBRateInput) {
    selectors.mobPackageBRateInput.value = Number.isFinite(mobRates.mobPackageBRate) ? mobRates.mobPackageBRate : '';
  }
  if (selectors.mobPackageCRateInput) {
    selectors.mobPackageCRateInput.value = Number.isFinite(mobRates.mobPackageCRate) ? mobRates.mobPackageCRate : '';
  }
  if (selectors.mobPackageASingleRateInput) {
    selectors.mobPackageASingleRateInput.value = Number.isFinite(mobRates.mobPackageASingleRate)
      ? mobRates.mobPackageASingleRate
      : '';
  }
  if (selectors.mobPackageAJointRateInput) {
    selectors.mobPackageAJointRateInput.value = Number.isFinite(mobRates.mobPackageAJointRate)
      ? mobRates.mobPackageAJointRate
      : '';
  }
  if (selectors.mobPackageBSingleRateInput) {
    selectors.mobPackageBSingleRateInput.value = Number.isFinite(mobRates.mobPackageBSingleRate)
      ? mobRates.mobPackageBSingleRate
      : '';
  }
  if (selectors.mobPackageBJointRateInput) {
    selectors.mobPackageBJointRateInput.value = Number.isFinite(mobRates.mobPackageBJointRate)
      ? mobRates.mobPackageBJointRate
      : '';
  }
  if (selectors.mobPackageCSingleRateInput) {
    selectors.mobPackageCSingleRateInput.value = Number.isFinite(mobRates.mobPackageCSingleRate)
      ? mobRates.mobPackageCSingleRate
      : '';
  }
  if (selectors.mobPackageCJointRateInput) {
    selectors.mobPackageCJointRateInput.value = Number.isFinite(mobRates.mobPackageCJointRate)
      ? mobRates.mobPackageCJointRate
      : '';
  }

  if (selectors.mobCreditLifeToggle) {
    selectors.mobCreditLifeToggle.checked = Boolean(selections.mobCreditLifeSelected);
  }
  if (selectors.mobCreditDisabilityToggle) {
    selectors.mobCreditDisabilityToggle.checked = Boolean(selections.mobCreditDisabilitySelected);
  }
  if (selectors.mobCreditTierSelect) {
    selectors.mobCreditTierSelect.value = selections.mobCreditTier || 'single';
  }
  if (selections.mobDebtPackage) {
    const packageInput = document.querySelector(`input[name="mob-debt-package"][value="${selections.mobDebtPackage}"]`);
    if (packageInput) {
      packageInput.checked = true;
    }
  } else {
    const packageInput = document.querySelector('input[name="mob-debt-package"][value="none"]');
    if (packageInput) {
      packageInput.checked = true;
    }
  }

  handleMobConfigChange();
  handleTermExtensionChange();
  updateLoanIllustration();
  updateProtectionOptionsAvailability();
}

function upsertLoanIllustration(creditUnionId, illustration) {
  if (!creditUnionId || !illustration) return;
  const current = Array.isArray(appState.loanIllustrations?.[creditUnionId])
    ? appState.loanIllustrations[creditUnionId]
    : [];
  const without = current.filter((item) => item.id !== illustration.id);
  appState.loanIllustrations = {
    ...appState.loanIllustrations,
    [creditUnionId]: [illustration, ...without]
  };
}

function handleWarrantyMarkupChange() {
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) return;
  const creditUnionMarkup = parseNumericInput(selectors.loanCreditUnionMarkupInput?.value);
  const gfsMarkup = parseNumericInput(selectors.loanGfsMarkupInput?.value);
  saveWarrantyConfig(creditUnionId, { creditUnionMarkup, gfsMarkup });
}

function handleGapPricingChange() {
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) return;
  const gapCost = parseNumericInput(selectors.loanGapCostInput?.value);
  const gapCreditUnionMarkup = parseNumericInput(selectors.loanGapCreditUnionMarkupInput?.value);
  const gapGfsMarkup = parseNumericInput(selectors.loanGapGfsMarkupInput?.value);
  saveWarrantyConfig(creditUnionId, { gapCost, gapCreditUnionMarkup, gapGfsMarkup });
}

function updateMobPricingVisibility({ mobCoverageType, mobRateStructure }) {
  const isCreditInsurance = mobCoverageType === 'credit-insurance';
  const isDebtProtection = mobCoverageType === 'debt-protection';
  const hasRateStructure = Boolean(mobRateStructure);
  const isBlended = mobRateStructure === 'blended';
  const setGroupVisibility = (container, inputs, isVisible) => {
    if (container) {
      container.hidden = !isVisible;
    }
    inputs.forEach((input) => {
      if (input) {
        input.disabled = !isVisible;
      }
    });
  };
  if (selectors.mobCreditRateFields) {
    selectors.mobCreditRateFields.hidden = !(isCreditInsurance && hasRateStructure);
  }
  if (selectors.mobDebtRateFields) {
    selectors.mobDebtRateFields.hidden = !(isDebtProtection && hasRateStructure);
  }
  setGroupVisibility(
    selectors.mobBlendedRateFields,
    [selectors.mobBlendedLifeRateInput, selectors.mobBlendedDisabilityRateInput],
    isCreditInsurance && hasRateStructure && isBlended
  );
  setGroupVisibility(
    selectors.mobUnblendedRateFields,
    [
      selectors.mobSingleLifeRateInput,
      selectors.mobJointLifeRateInput,
      selectors.mobSingleDisabilityRateInput,
      selectors.mobJointDisabilityRateInput
    ],
    isCreditInsurance && hasRateStructure && !isBlended
  );
  setGroupVisibility(
    selectors.mobDebtBlendedRateFields,
    [selectors.mobPackageARateInput, selectors.mobPackageBRateInput, selectors.mobPackageCRateInput],
    isDebtProtection && hasRateStructure && isBlended
  );
  setGroupVisibility(
    selectors.mobDebtUnblendedRateFields,
    [
      selectors.mobPackageASingleRateInput,
      selectors.mobPackageAJointRateInput,
      selectors.mobPackageBSingleRateInput,
      selectors.mobPackageBJointRateInput,
      selectors.mobPackageCSingleRateInput,
      selectors.mobPackageCJointRateInput
    ],
    isDebtProtection && hasRateStructure && !isBlended
  );
}

function updateMobCoverageControls({ mobCoverageType, mobRateStructure }) {
  const isCreditInsurance = mobCoverageType === 'credit-insurance';
  const isDebtProtection = mobCoverageType === 'debt-protection';
  const mobBlendedRates = mobRateStructure === 'blended';
  if (selectors.mobCoverageTypeSelect) {
    selectors.mobCoverageTypeSelect.value = mobCoverageType;
  }
  if (selectors.mobCreditControls) {
    selectors.mobCreditControls.hidden = !isCreditInsurance;
  }
  if (selectors.mobDebtControls) {
    selectors.mobDebtControls.hidden = !isDebtProtection;
  }
  if (selectors.mobCreditTierSelect) {
    if (mobBlendedRates) {
      selectors.mobCreditTierSelect.value = 'blended';
      selectors.mobCreditTierSelect.disabled = true;
      if (selectors.mobCreditTierHelp) {
        selectors.mobCreditTierHelp.textContent = 'Blended rates apply to all borrower types.';
      }
    } else {
      if (selectors.mobCreditTierSelect.value === 'blended') {
        selectors.mobCreditTierSelect.value = 'single';
      }
      selectors.mobCreditTierSelect.disabled = false;
      if (selectors.mobCreditTierHelp) {
        selectors.mobCreditTierHelp.textContent = 'Rate tier follows the credit union setup.';
      }
    }
  }
}

function updatePersonalCoverageControls({ mobCoverageType, mobBlendedRates }) {
  const isCreditInsurance = mobCoverageType !== 'debt-protection';
  if (selectors.personalMobCoverageTypeSelect) {
    selectors.personalMobCoverageTypeSelect.value = mobCoverageType;
  }
  if (selectors.personalMobCreditControls) {
    selectors.personalMobCreditControls.hidden = !isCreditInsurance;
  }
  if (selectors.personalMobDebtControls) {
    selectors.personalMobDebtControls.hidden = isCreditInsurance;
  }
  if (selectors.personalMobCreditTierSelect) {
    if (mobBlendedRates) {
      selectors.personalMobCreditTierSelect.value = 'blended';
      selectors.personalMobCreditTierSelect.disabled = true;
      if (selectors.personalMobCreditTierHelp) {
        selectors.personalMobCreditTierHelp.textContent = 'Blended rates apply to all borrower types.';
      }
    } else {
      if (selectors.personalMobCreditTierSelect.value === 'blended') {
        selectors.personalMobCreditTierSelect.value = 'single';
      }
      selectors.personalMobCreditTierSelect.disabled = false;
      if (selectors.personalMobCreditTierHelp) {
        selectors.personalMobCreditTierHelp.textContent = 'Rate tier follows the credit union setup.';
      }
    }
  }
}

function handleMobConfigChange() {
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) return;
  const mobCoverageType = selectors.mobAccountCoverageTypeSelect?.value || '';
  const mobRateStructure = selectors.mobRateStructureSelect?.value || '';
  const mobBlendedRates = mobRateStructure === 'blended';
  const mobBlendedLifeRate = parseNumericInput(selectors.mobBlendedLifeRateInput?.value);
  const mobBlendedDisabilityRate = parseNumericInput(selectors.mobBlendedDisabilityRateInput?.value);
  const mobSingleLifeRate = parseNumericInput(selectors.mobSingleLifeRateInput?.value);
  const mobJointLifeRate = parseNumericInput(selectors.mobJointLifeRateInput?.value);
  const mobSingleDisabilityRate = parseNumericInput(selectors.mobSingleDisabilityRateInput?.value);
  const mobJointDisabilityRate = parseNumericInput(selectors.mobJointDisabilityRateInput?.value);
  const mobPackageARate = parseNumericInput(selectors.mobPackageARateInput?.value);
  const mobPackageBRate = parseNumericInput(selectors.mobPackageBRateInput?.value);
  const mobPackageCRate = parseNumericInput(selectors.mobPackageCRateInput?.value);
  const mobPackageASingleRate = parseNumericInput(selectors.mobPackageASingleRateInput?.value);
  const mobPackageAJointRate = parseNumericInput(selectors.mobPackageAJointRateInput?.value);
  const mobPackageBSingleRate = parseNumericInput(selectors.mobPackageBSingleRateInput?.value);
  const mobPackageBJointRate = parseNumericInput(selectors.mobPackageBJointRateInput?.value);
  const mobPackageCSingleRate = parseNumericInput(selectors.mobPackageCSingleRateInput?.value);
  const mobPackageCJointRate = parseNumericInput(selectors.mobPackageCJointRateInput?.value);
  saveWarrantyConfig(creditUnionId, {
    mobCoverageType,
    mobRateStructure,
    mobBlendedRates,
    mobBlendedLifeRate,
    mobBlendedDisabilityRate,
    mobSingleLifeRate,
    mobJointLifeRate,
    mobSingleDisabilityRate,
    mobJointDisabilityRate,
    mobPackageARate,
    mobPackageBRate,
    mobPackageCRate,
    mobPackageASingleRate,
    mobPackageAJointRate,
    mobPackageBSingleRate,
    mobPackageBJointRate,
    mobPackageCSingleRate,
    mobPackageCJointRate
  });
  updateMobPricingVisibility({ mobCoverageType, mobRateStructure });
  updateMobCoverageControls({ mobCoverageType, mobRateStructure });
}

function setTermExtensionFieldVisibility(isEnabled) {
  if (selectors.loanTermExtensionFields) {
    selectors.loanTermExtensionFields.hidden = !isEnabled;
  }
}

function handleTermExtensionChange() {
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) return;
  const termExtensionsEnabled = selectors.loanTermExtensionToggle?.checked ?? false;
  const vscTermExtension = parseNumericInput(selectors.loanVscTermExtensionInput?.value);
  const gapTermExtension = parseNumericInput(selectors.loanGapTermExtensionInput?.value);
  saveWarrantyConfig(creditUnionId, { termExtensionsEnabled, vscTermExtension, gapTermExtension });
  setTermExtensionFieldVisibility(termExtensionsEnabled);
}

async function fetchWarrantyCost() {
  if (!selectors.loanWarrantyCostInput) return;
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) {
    setLoanWarrantyFeedback('Select a credit union before fetching warranty cost.', 'error');
    return;
  }

  const miles = parseNumericInput(selectors.loanMilesInput?.value);
  const termMonths = parseNumericInput(selectors.loanTermInput?.value);
  const vin = selectors.loanVinInput?.value?.trim();

  setLoanWarrantyFeedback('Fetching warranty cost…', 'info');

  const estimatedCost = estimateWarrantyCost({ miles, termMonths, vin });
  selectors.loanWarrantyCostInput.value = Math.round(estimatedCost);
  setLoanWarrantyFeedback('Warranty pricing API pending. Using estimated cost for now.', 'info');
  updateLoanIllustration();
}

async function decodeVin(vin) {
  const trimmedVin = vin?.trim();
  if (!trimmedVin) {
    renderVinResults(null, 'Enter a VIN to decode vehicle details.');
    return;
  }
  if (trimmedVin.length !== 17) {
    renderVinResults(null, 'VIN must be a 17-character string.');
    return;
  }

  renderVinResults(null, 'Decoding VIN...');
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${encodeURIComponent(trimmedVin)}?format=json`
    );
    if (!response.ok) {
      throw new Error('Unable to decode VIN. Please try again.');
    }

    const data = await response.json();
    const results = Array.isArray(data?.Results) ? data.Results : [];
    if (!results.length) {
      renderVinResults(null, 'VIN decode returned no results.');
      return;
    }

    const decoded = results.reduce((acc, item) => {
      if (item?.Variable && item?.Value) {
        acc[item.Variable] = item.Value;
      }
      return acc;
    }, {});

    if (!Object.keys(decoded).length) {
      renderVinResults(null, 'No data found for this VIN.');
      return;
    }

    const errorText = (decoded['Error Text'] || '').trim();
    const isCleanDecode =
      errorText === '0' || errorText.startsWith('0 - VIN decoded clean');
    if (errorText && !isCleanDecode) {
      renderVinResults(null, errorText);
      return;
    }

    renderVinResults({
      year: decoded['Model Year'],
      make: decoded.Make,
      model: decoded.Model,
      trim: decoded.Trim,
      bodyClass: decoded['Body Class'],
      driveType: decoded['Drive Type'],
      fuelType: decoded['Fuel Type - Primary']
    });
  } catch (error) {
    renderVinResults(null, error?.message || 'Unable to decode VIN. Please try again.');
  }
}

const appState = {
  creditUnions: [],
  incomeStreams: [],
  prospectStreams: [],
  summary: null,
  monthlyCompletion: [],
  reportingWindow: { start: null, end: null },
  selectedCreditUnion: 'all',
  incomeStreamFilterId: 'all',
  accountSelectionId: null,
  accountDirectoryView: 'account',
  latestCallReports: [],
  currentStreamId: null,
  currentStreamDetail: null,
  currentStreamMonths: [],
  editingPeriod: null,
  monthlyDetailMonthKey: null,
  detailCreditUnionId: null,
  detailCreditUnionName: null,
  creditUnionDetail: null,
  detailStart: null,
  detailEnd: null,
  prospectAccountFilter: '',
  missingUpdates: [],
  missingFilters: { month: null, revenueType: 'all' },
  callReports: [],
  accountNotes: {},
  accountReviewData: {},
  accountChangeLog: {},
  accountWarrantyConfigs: {},
  loanEntries: {},
  loanEditingId: null,
  loanIllustrations: {},
  loanIllustrationEditingId: null,
  loanIllustrationDraft: null
};

function showDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

function openEditRevenueDialog(month) {
  if (!selectors.editRevenueDialog || !selectors.editRevenueForm) return;
  appState.editingPeriod = month;

  if (selectors.editRevenueMonthLabel) {
    selectors.editRevenueMonthLabel.textContent = month.label;
  }

  if (selectors.editRevenueAmountInput) {
    selectors.editRevenueAmountInput.value =
      Number.isFinite(month.amount) && month.amount !== null ? String(month.amount) : '';
  }

  if (selectors.editRevenueFeedback) {
    setFeedback(selectors.editRevenueFeedback, '', 'info');
  }

  showDialog(selectors.editRevenueDialog);
  setTimeout(() => selectors.editRevenueAmountInput?.focus(), 75);
}

function handleStatusCardActivation(event) {
  const isKeyboard = event.type === 'keydown';
  const isActivationKey = event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';
  if (isKeyboard && !isActivationKey) {
    return;
  }

  const card = event.target.closest('.status-card');
  if (!card || !selectors.reportingStatusGrid?.contains(card)) {
    return;
  }

  if (isKeyboard) {
    event.preventDefault();
  }

  const key = card.dataset.key;
  if (!key) {
    return;
  }

  const month = appState.currentStreamMonths.find((item) => item.key === key);
  if (!month) {
    return;
  }

  openEditRevenueDialog(month);
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

function setFeedback(element, message, type = 'info') {
  if (!element) return;
  element.textContent = message;
  element.dataset.state = type;
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch (error) {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

function createOption(value, label, disabled = false, selected = false) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  option.disabled = disabled;
  option.selected = selected;
  return option;
}

function getProductKey(name) {
  if (typeof name !== 'string' || !name.trim()) {
    return null;
  }

  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createSubtitleText(text) {
  const span = document.createElement('span');
  span.textContent = typeof text === 'string' && text.trim() ? text : '—';
  return span;
}

function createSubtitleDivider() {
  const divider = document.createElement('span');
  divider.className = 'item__divider';
  divider.setAttribute('aria-hidden', 'true');
  divider.textContent = '•';
  return divider;
}

function createProductBadge(name, productKey) {
  const badge = document.createElement('span');
  badge.className = 'item__product-badge';
  if (productKey) {
    badge.dataset.productKey = productKey;
  }
  badge.textContent = typeof name === 'string' && name.trim() ? name : 'Unknown product';
  return badge;
}

function escapeSelectorValue(value) {
  if (typeof value !== 'string') {
    return '';
  }
  if (typeof window !== 'undefined' && window.CSS?.escape) {
    return window.CSS.escape(value);
  }
  return value.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~\s])/g, '\\$1');
}

function getCreditUnionNameById(id) {
  if (!id) return null;
  const match = appState.creditUnions.find((creditUnion) => creditUnion.id === id);
  return match ? match.name : null;
}

function getCreditUnionById(id) {
  if (!id) return null;
  return appState.creditUnions.find((creditUnion) => creditUnion.id === id) || null;
}

function formatMonthLabelFromKey(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}$/.test(key)) {
    return null;
  }
  const [yearStr, monthStr] = key.split('-');
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return null;
  }
  const date = new Date(year, month - 1, 1);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function buildMonthlyDetailUrl(monthKey) {
  const params = new URLSearchParams();
  params.set('month', monthKey);
  if (appState.selectedCreditUnion && appState.selectedCreditUnion !== 'all') {
    params.set('creditUnionId', appState.selectedCreditUnion);
    const creditUnionName = getCreditUnionNameById(appState.selectedCreditUnion);
    if (creditUnionName) {
      params.set('creditUnionName', creditUnionName);
    }
  }
  return `monthly-detail.html?${params.toString()}`;
}

function buildCreditUnionDetailUrl(creditUnionId, creditUnionName) {
  if (!creditUnionId) {
    return '#';
  }
  const params = new URLSearchParams();
  params.set('creditUnionId', creditUnionId);
  if (creditUnionName) {
    params.set('creditUnionName', creditUnionName);
  }
  if (appState.reportingWindow?.start) {
    params.set('start', appState.reportingWindow.start);
  }
  if (appState.reportingWindow?.end) {
    params.set('end', appState.reportingWindow.end);
  }
  return `credit-union.html?${params.toString()}`;
}

function getMonthFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('month');
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }
  return value;
}

function getDetailCreditUnionIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('creditUnionId');
  if (!value || value === 'all') {
    return null;
  }
  return value;
}

function getDetailCreditUnionNameFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('creditUnionName');
  return value ? value : null;
}

function getAccountSelectionFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('creditUnionId');
  if (!value || value === 'all') {
    return null;
  }
  return value;
}

function isValidPeriodValue(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value);
}

function getDetailStartFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('start');
  return isValidPeriodValue(value) ? value : null;
}

function getDetailEndFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('end');
  return isValidPeriodValue(value) ? value : null;
}

function renderCreditUnionOptions() {
  const revenueSelect = selectors.revenueStreamSelect;
  const reportingSelect = selectors.reportingCreditUnionSelect;
  const accountSelect = selectors.accountCreditUnionSelect;

  if (revenueSelect) {
    const currentIncomeStream = revenueSelect.value;
    const revenuePlaceholder = createOption('', 'Select income stream', true, true);
    revenueSelect.replaceChildren(revenuePlaceholder);

    appState.incomeStreams
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label))
      .forEach((stream) => {
        const option = createOption(stream.id, stream.label, false, stream.id === currentIncomeStream);
        revenueSelect.append(option);
      });

    if (currentIncomeStream) {
      revenueSelect.value = currentIncomeStream;
    }
  }

  if (reportingSelect) {
    const currentSelection = reportingSelect.value || appState.selectedCreditUnion || 'all';
    const options = [createOption('all', 'All accounts', false, currentSelection === 'all')];

    appState.creditUnions
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((creditUnion) => {
        options.push(createOption(creditUnion.id, creditUnion.name, false, creditUnion.id === currentSelection));
      });

    reportingSelect.replaceChildren(...options);

    if (currentSelection !== 'all' && !appState.creditUnions.some((creditUnion) => creditUnion.id === currentSelection)) {
      reportingSelect.value = 'all';
      appState.selectedCreditUnion = 'all';
    } else {
      reportingSelect.value = currentSelection;
      appState.selectedCreditUnion = reportingSelect.value || 'all';
    }
  }

  const streamFilter = selectors.incomeStreamFilter;
  if (streamFilter) {
    const currentSelection = streamFilter.value || appState.incomeStreamFilterId || 'all';
    const options = [createOption('all', 'All credit unions', false, currentSelection === 'all')];

    appState.creditUnions
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((creditUnion) => {
        options.push(createOption(creditUnion.id, creditUnion.name, false, creditUnion.id === currentSelection));
      });

    streamFilter.replaceChildren(...options);

    if (currentSelection !== 'all' && !appState.creditUnions.some((creditUnion) => creditUnion.id === currentSelection)) {
      streamFilter.value = 'all';
      appState.incomeStreamFilterId = 'all';
    } else {
      streamFilter.value = currentSelection;
      appState.incomeStreamFilterId = streamFilter.value || 'all';
    }
  }

  if (accountSelect) {
    const placeholder = createOption('', 'Select a credit union', true, true);
    accountSelect.replaceChildren(placeholder);

    const accountFilter = accountSelect.dataset.filter;
    const filteredCreditUnions =
      accountFilter === 'accounts-only'
        ? appState.creditUnions.filter(
            (creditUnion) => normalizeClassification(creditUnion.classification) === 'account'
          )
        : appState.creditUnions;
    const sortedCreditUnions = filteredCreditUnions.slice().sort((a, b) => a.name.localeCompare(b.name));
    sortedCreditUnions.forEach((creditUnion) => {
      accountSelect.append(createOption(creditUnion.id, creditUnion.name));
    });

    if (appState.accountSelectionId && !sortedCreditUnions.some((cu) => cu.id === appState.accountSelectionId)) {
      appState.accountSelectionId = null;
    }

    if (!sortedCreditUnions.length) {
      accountSelect.value = '';
      accountSelect.setAttribute('disabled', 'disabled');
    } else {
      accountSelect.removeAttribute('disabled');
      accountSelect.value = appState.accountSelectionId || '';
    }
  }

  renderAccountWorkspace();
  renderAccountDirectory();
  renderQuotesDirectory();
  renderQuotesWorkspace();
}

function renderIncomeStreamList() {
  const list = selectors.incomeStreamList;
  const template = selectors.incomeStreamTemplate;
  if (!list || !template) return;

  list.replaceChildren();

  const selectedFilter = appState.incomeStreamFilterId || 'all';
  const visibleStreams =
    selectedFilter === 'all'
      ? appState.incomeStreams
      : appState.incomeStreams.filter((stream) => stream.creditUnionId === selectedFilter);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  if (!visibleStreams.length) {
    const empty = document.createElement('div');
    empty.className = 'item';
    const heading = document.createElement('p');
    heading.className = 'item__title';
    const creditUnionName = getCreditUnionNameById(selectedFilter);
    heading.textContent = selectedFilter === 'all' ? 'No income streams yet' : 'No income streams for this credit union';
    const sub = document.createElement('p');
    sub.className = 'item__subtitle';
    sub.textContent =
      selectedFilter === 'all' || !creditUnionName
        ? 'Create your first stream to begin tracking revenue.'
        : `Create a new stream for ${creditUnionName} to begin tracking revenue.`;
    empty.append(heading, sub);
    list.append(empty);
  } else {
    const grouped = visibleStreams.reduce((map, stream) => {
      const key = stream.creditUnionId || 'unknown';
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          name: stream.creditUnionName || 'Unassigned credit union',
          streams: []
        });
      }
      map.get(key).streams.push(stream);
      return map;
    }, new Map());

    Array.from(grouped.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((group) => {
        const groupSection = document.createElement('section');
        groupSection.className = 'stream-group';
        const header = document.createElement('header');
        header.className = 'stream-group__header';
        const title = document.createElement('h4');
        title.className = 'stream-group__title';
        title.textContent = group.name;
        const count = document.createElement('p');
        count.className = 'stream-group__count';
        count.textContent = `${formatter.format(group.streams.length)} stream${group.streams.length === 1 ? '' : 's'}`;
        header.append(title, count);

        const groupList = document.createElement('ul');
        groupList.className = 'item-list';
        groupList.setAttribute('role', 'list');

        group.streams
          .slice()
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .forEach((stream) => {
            const fragment = template.content.cloneNode(true);
            const listItem = fragment.querySelector('.item');
            const link = fragment.querySelector('.item__link');
            const titleElement = fragment.querySelector('.item__title');
            const subtitle = fragment.querySelector('.item__subtitle');
            const meta = fragment.querySelector('.item__meta');
            const metric = fragment.querySelector('.item__metric');
            const productKey = getProductKey(stream.product);

            titleElement.textContent = stream.label;

            if (listItem) {
              if (productKey) {
                listItem.dataset.productKey = productKey;
              } else {
                delete listItem.dataset.productKey;
              }
            }

            if (subtitle) {
              subtitle.replaceChildren();
              const segments = [
                createSubtitleText(stream.creditUnionName),
                createSubtitleDivider(),
                createProductBadge(stream.product, productKey),
                createSubtitleDivider(),
                createSubtitleText(stream.revenueType)
              ];
              segments.forEach((segment) => subtitle.append(segment));
            }

            if (link) {
              link.href = `stream.html?id=${encodeURIComponent(stream.id)}`;
              link.setAttribute('aria-label', `View monthly reporting status for ${stream.label}`);
            }

            const metaSegments = [];
            if (stream.lastReport) {
              const { month, year, amount } = stream.lastReport;
              metaSegments.push(`Last reported ${currencyFormatter.format(amount)} in ${formatPeriodLabel(year, month)}`);
            } else {
              metaSegments.push('No revenue logged yet');
            }

            if (stream.finalReport) {
              metaSegments.push(`Final reporting month: ${stream.finalReport.label}`);
            }

            meta.textContent = metaSegments.join(' • ');

            const reportedMonths = Number(stream.reportedCount ?? 0);
            const hasReporting = reportedMonths > 0;

            if (hasReporting) {
              metric.textContent = `${reportedMonths} reported month${reportedMonths === 1 ? '' : 's'}`;
              metric.dataset.status = 'complete';
            } else {
              metric.textContent = 'No reports yet';
              metric.dataset.status = 'pending';
            }

            groupList.append(fragment);
          });

        groupSection.append(header, groupList);
        list.append(groupSection);
      });
  }

  if (selectors.incomeStreamCount) {
    const creditUnionName = getCreditUnionNameById(selectedFilter);
    const countLabel = `${formatter.format(visibleStreams.length)} stream${visibleStreams.length === 1 ? '' : 's'}`;
    selectors.incomeStreamCount.textContent =
      selectedFilter !== 'all' && creditUnionName ? `${countLabel} for ${creditUnionName}` : countLabel;
  }
}




function setAccountStatusFeedback(message, state = 'info') {
  if (!selectors.accountStatusFeedback) return;
  selectors.accountStatusFeedback.textContent = message;
  selectors.accountStatusFeedback.dataset.state = state;
}

function getAccountStreamsForCreditUnion(creditUnionId) {
  if (!creditUnionId) return [];
  const activeStreams = appState.incomeStreams.filter((stream) => stream.creditUnionId === creditUnionId);
  const prospectStreams = appState.prospectStreams.filter((stream) => stream.creditUnionId === creditUnionId);
  return [...activeStreams, ...prospectStreams];
}

function getAvailableRevenueTypes(product, creditUnionId) {
  const revenueTypes = PRODUCT_REVENUE_TYPES[product] || DEFAULT_REVENUE_TYPES;
  if (!creditUnionId) return revenueTypes;
  const existing = new Set(
    getAccountStreamsForCreditUnion(creditUnionId).map((stream) => `${stream.product}::${stream.revenueType}`)
  );
  return revenueTypes.filter((type) => !existing.has(`${product}::${type}`));
}

function updateAccountRevenueOptions() {
  const productSelect = selectors.accountProductSelect;
  const revenueSelect = selectors.accountRevenueSelect;
  if (!productSelect || !revenueSelect) return;

  const creditUnionId = appState.accountSelectionId;
  const product = productSelect.value;
  const availableTypes = getAvailableRevenueTypes(product, creditUnionId);

  const options = availableTypes.length
    ? availableTypes.map((type) => createOption(type, type))
    : [createOption('', 'No revenue lines left', true, true)];

  revenueSelect.replaceChildren(...options);
  revenueSelect.disabled = !availableTypes.length || !creditUnionId;

  if (selectors.accountAddProductBtn) {
    selectors.accountAddProductBtn.disabled = !availableTypes.length || !creditUnionId;
  }
}

function updateAccountProductOptions() {
  const productSelect = selectors.accountProductSelect;
  if (!productSelect) return;
  const creditUnionId = appState.accountSelectionId;
  productSelect.replaceChildren(...PRODUCT_OPTIONS.map((product) => createOption(product, product)));
  productSelect.disabled = !creditUnionId;
  updateAccountRevenueOptions();
}

function getAccountRowsForCreditUnion(creditUnionId) {
  if (!creditUnionId) {
    return [];
  }

  return PRODUCT_REVENUE_PAIRS.map(({ product, revenueType }) => {
    const activeStream = appState.incomeStreams.find(
      (stream) => stream.creditUnionId === creditUnionId && stream.product === product && stream.revenueType === revenueType
    );
    const prospectStream = appState.prospectStreams.find(
      (stream) => stream.creditUnionId === creditUnionId && stream.product === product && stream.revenueType === revenueType
    );
    return {
      product,
      revenueType,
      productKey: getProductKey(product),
      status: activeStream ? 'active' : prospectStream ? 'prospect' : 'none',
      activeStream,
      prospectStream
    };
  });
}

function getAccountStatusCounts(creditUnionId) {
  const rows = getAccountRowsForCreditUnion(creditUnionId);
  return rows.reduce(
    (counts, row) => {
      if (row.status === 'active') {
        counts.active += 1;
      } else if (row.status === 'prospect') {
        counts.prospect += 1;
      } else {
        counts.none += 1;
      }
      return counts;
    },
    { active: 0, prospect: 0, none: 0 }
  );
}

function getLatestCallReportForCreditUnion(creditUnionId) {
  if (!creditUnionId) return null;
  return appState.latestCallReports.find((report) => report.creditUnionId === creditUnionId) || null;
}

function formatLatestMonetaryLabel(latestReport, value, formatter = currencyFormatterNoCents) {
  if (!latestReport) {
    return 'No call report yet';
  }

  if (Number.isFinite(value)) {
    return formatter.format(value);
  }

  return 'Call report uploaded';
}

function getLatestReportPeriod(latestReport) {
  if (!latestReport) {
    return { label: 'No call report yet', tone: 'muted' };
  }

  if (latestReport?.periodYear && latestReport?.periodMonth) {
    return { label: formatPeriodLabel(latestReport.periodYear, latestReport.periodMonth), tone: 'accent' };
  }

  if (latestReport?.reportDate) {
    const dateLabel = new Date(latestReport.reportDate).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
    return { label: dateLabel, tone: 'accent' };
  }

  return { label: 'Call report uploaded', tone: 'muted' };
}

function updateAccountDirectoryTabs(view) {
  const tabs = selectors.accountDirectoryTabs?.querySelectorAll('[data-view]');
  if (!tabs) return;

  tabs.forEach((tab) => {
    const isActive = tab.dataset.view === view;
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    tab.tabIndex = isActive ? 0 : -1;
  });
}

function renderAccountDirectory() {
  const body = selectors.accountDirectoryBody;
  if (!body) return;

  const emptyState = selectors.accountDirectoryEmpty;
  const tableContainer = selectors.accountDirectoryTable;
  const summary = selectors.accountDirectorySummary;

  const creditUnions = appState.creditUnions.slice().sort((a, b) => a.name.localeCompare(b.name));
  const view = CLASSIFICATIONS.includes(appState.accountDirectoryView)
    ? appState.accountDirectoryView
    : 'account';
  const totalsByClassification = creditUnions.reduce(
    (acc, creditUnion) => {
      const classification = normalizeClassification(creditUnion.classification);
      acc[classification] += 1;
      return acc;
    },
    { account: 0, prospect: 0 }
  );
  const filteredCreditUnions = creditUnions.filter(
    (creditUnion) => normalizeClassification(creditUnion.classification) === view
  );

  updateAccountDirectoryTabs(view);

  body.replaceChildren();

  const emptyMessage = emptyState?.querySelector('p');
  if (!creditUnions.length || !filteredCreditUnions.length) {
    if (emptyState) {
      emptyState.hidden = false;
      if (emptyMessage) {
        emptyMessage.textContent = creditUnions.length
          ? `No ${view === 'prospect' ? 'prospects' : 'accounts'} are in this list yet.`
          : 'Add your first credit union to see coverage progress and call report assets.';
      }
    }
    if (tableContainer) tableContainer.hidden = true;
    if (summary) {
      const accountLabel = `${totalsByClassification.account} account${
        totalsByClassification.account === 1 ? '' : 's'
      }`;
      const prospectLabel = `${totalsByClassification.prospect} prospect${
        totalsByClassification.prospect === 1 ? '' : 's'
      }`;
      summary.textContent = creditUnions.length ? `${accountLabel} • ${prospectLabel}` : '';
    }
    return;
  }

  if (emptyState) emptyState.hidden = true;
  if (tableContainer) tableContainer.hidden = false;

  const fragment = document.createDocumentFragment();
  let totalActive = 0;
  let totalProspect = 0;
  let totalInactive = 0;

  filteredCreditUnions.forEach((creditUnion) => {
    const counts = getAccountStatusCounts(creditUnion.id);
    totalActive += counts.active;
    totalProspect += counts.prospect;
    totalInactive += counts.none;

    const classification = normalizeClassification(creditUnion.classification);

    const latestReport = getLatestCallReportForCreditUnion(creditUnion.id);
    const consumerLoanTotal = latestReport ? getConsumerLoanTotal(latestReport) : null;
    const assetLabel = formatLatestMonetaryLabel(latestReport, latestReport?.assetSize);
    const consumerLabel = formatLatestMonetaryLabel(latestReport, consumerLoanTotal);
    const periodInfo = getLatestReportPeriod(latestReport);

    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const nameLink = document.createElement('a');
    nameLink.href = `account-workspace.html?creditUnionId=${encodeURIComponent(creditUnion.id)}`;
    nameLink.className = 'table-link';
    nameLink.textContent = creditUnion.name;
    nameLink.title = 'Open account workspace';
    nameCell.append(nameLink);

    const classificationCell = document.createElement('td');
    const classificationWrapper = document.createElement('div');
    classificationWrapper.className = 'account-classification';

    const classificationChip = document.createElement('span');
    classificationChip.className = 'account-classification__chip';
    classificationChip.textContent = classification === 'prospect' ? 'Prospect' : 'Account';
    const toggleButton = document.createElement('button');
    toggleButton.type = 'button';
    toggleButton.className = 'account-classification__button';
    toggleButton.dataset.creditUnionId = creditUnion.id;
    toggleButton.dataset.targetClassification = classification === 'prospect' ? 'account' : 'prospect';
    toggleButton.textContent =
      classification === 'prospect' ? 'Move to Accounts' : 'Move to Prospects';

    classificationWrapper.append(classificationChip, toggleButton);
    classificationCell.append(classificationWrapper);

    const activeCell = document.createElement('td');
    const activeChip = document.createElement('span');
    activeChip.className = 'status-chip status-chip--green';
    const activeDot = document.createElement('span');
    activeDot.className = 'status-chip__dot';
    const activeCount = document.createElement('span');
    activeCount.textContent = integerFormatter.format(counts.active);
    const activeLabel = document.createElement('span');
    activeLabel.textContent = 'green';
    activeChip.append(activeDot, activeCount, activeLabel);
    activeCell.append(activeChip);

    const prospectCell = document.createElement('td');
    const prospectChip = document.createElement('span');
    prospectChip.className = 'status-chip status-chip--yellow';
    const prospectDot = document.createElement('span');
    prospectDot.className = 'status-chip__dot';
    const prospectCount = document.createElement('span');
    prospectCount.textContent = integerFormatter.format(counts.prospect);
    const prospectLabel = document.createElement('span');
    prospectLabel.textContent = 'yellow';
    prospectChip.append(prospectDot, prospectCount, prospectLabel);
    prospectCell.append(prospectChip);

    const inactiveCell = document.createElement('td');
    const inactiveChip = document.createElement('span');
    inactiveChip.className = 'status-chip status-chip--red';
    const inactiveDot = document.createElement('span');
    inactiveDot.className = 'status-chip__dot';
    const inactiveCount = document.createElement('span');
    inactiveCount.textContent = integerFormatter.format(counts.none);
    const inactiveLabel = document.createElement('span');
    inactiveLabel.textContent = 'red';
    inactiveChip.append(inactiveDot, inactiveCount, inactiveLabel);
    inactiveCell.append(inactiveChip);

    const periodCell = document.createElement('td');
    periodCell.className = 'period-cell';
    periodCell.textContent = periodInfo.label;
    periodCell.dataset.tone = periodInfo.tone;

    const assetCell = document.createElement('td');
    assetCell.className = 'numeric numeric--monospace';
    assetCell.textContent = assetLabel;

    const consumerCell = document.createElement('td');
    consumerCell.className = 'numeric numeric--monospace';
    consumerCell.textContent = consumerLabel;

    row.append(
      nameCell,
      classificationCell,
      activeCell,
      prospectCell,
      inactiveCell,
      periodCell,
      assetCell,
      consumerCell
    );
    fragment.append(row);
  });

  body.append(fragment);

  if (summary) {
    const viewLabel = view === 'prospect' ? 'prospect' : 'account';
    const filteredLabel = `${filteredCreditUnions.length} ${viewLabel}${
      filteredCreditUnions.length === 1 ? '' : 's'
    } shown`;
    const accountLabel = `${totalsByClassification.account} account${
      totalsByClassification.account === 1 ? '' : 's'
    }`;
    const prospectLabel = `${totalsByClassification.prospect} prospect${
      totalsByClassification.prospect === 1 ? '' : 's'
    }`;

    summary.textContent = `${filteredLabel} • ${accountLabel} • ${prospectLabel} • ${totalActive} green • ${totalProspect} yellow • ${totalInactive} red`;
  }
}

function renderQuotesDirectory() {
  const body = selectors.quotesDirectoryBody;
  if (!body) return;

  const summary = selectors.quotesDirectorySummary;
  const emptyState = selectors.quotesDirectoryEmpty;
  const tableContainer = selectors.quotesDirectoryTable;

  const activeAccounts = appState.creditUnions
    .filter((creditUnion) => normalizeClassification(creditUnion.classification) === 'account')
    .sort((a, b) => a.name.localeCompare(b.name));

  body.replaceChildren();

  if (!activeAccounts.length) {
    if (emptyState) {
      emptyState.hidden = false;
    }
    if (tableContainer) {
      tableContainer.hidden = true;
    }
    if (summary) {
      summary.textContent = appState.creditUnions.length
        ? '0 active accounts ready for quotes.'
        : 'Add your first credit union in Accounts to begin quoting.';
    }
    return;
  }

  if (emptyState) {
    emptyState.hidden = true;
  }
  if (tableContainer) {
    tableContainer.hidden = false;
  }

  const fragment = document.createDocumentFragment();

  activeAccounts.forEach((creditUnion) => {
    const latestReport = getLatestCallReportForCreditUnion(creditUnion.id);
    const consumerLoanTotal = latestReport ? getConsumerLoanTotal(latestReport) : null;
    const assetLabel = formatLatestMonetaryLabel(latestReport, latestReport?.assetSize);
    const consumerLabel = formatLatestMonetaryLabel(latestReport, consumerLoanTotal);
    const periodInfo = getLatestReportPeriod(latestReport);

    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const nameLink = document.createElement('a');
    nameLink.href = `quotes-workspace.html?creditUnionId=${encodeURIComponent(creditUnion.id)}`;
    nameLink.className = 'table-link';
    nameLink.textContent = creditUnion.name;
    nameLink.title = 'Open quote workspace';
    nameCell.append(nameLink);

    const periodCell = document.createElement('td');
    periodCell.className = 'period-cell';
    periodCell.textContent = periodInfo.label;
    periodCell.dataset.tone = periodInfo.tone;

    const assetCell = document.createElement('td');
    assetCell.className = 'numeric numeric--monospace';
    assetCell.textContent = assetLabel;

    const consumerCell = document.createElement('td');
    consumerCell.className = 'numeric numeric--monospace';
    consumerCell.textContent = consumerLabel;

    row.append(nameCell, periodCell, assetCell, consumerCell);
    fragment.append(row);
  });

  body.append(fragment);

  if (summary) {
    const accountLabel = `${activeAccounts.length} active account${activeAccounts.length === 1 ? '' : 's'}`;
    summary.textContent = `${accountLabel} ready for quoting.`;
  }
}

function renderAccountWorkspace() {
  const list = selectors.accountStatusList;
  if (!list) return;

  const summary = selectors.accountStatusSummary;
  const detailTitle = selectors.accountDetailTitle;
  const emptyState = selectors.accountEmptyState;

  const creditUnionId = appState.accountSelectionId;
  const hasCreditUnions = appState.creditUnions.length > 0;

  if (!creditUnionId) {
    list.replaceChildren();
    if (summary) {
      summary.textContent = hasCreditUnions ? 'Choose a credit union to begin.' : 'Add a credit union to get started.';
    }
    if (detailTitle) {
      detailTitle.textContent = hasCreditUnions
        ? 'Select an account to load coverage details.'
        : 'Add a credit union to start building coverage.';
    }
    if (emptyState) {
      emptyState.hidden = false;
    }
    updateAccountProductOptions();
    setAccountStatusFeedback('', 'info');
    renderAccountNotes();
    renderAccountReview();
    renderAccountChangeLog();
    renderLoanOfficerCalculator();
    renderLoanIllustrationHistory();
    renderLoanLog();
    return;
  }

  const creditUnionName = getCreditUnionNameById(creditUnionId) || 'Selected credit union';
  if (detailTitle) {
    detailTitle.textContent = creditUnionName;
  }
  if (emptyState) {
    emptyState.hidden = true;
  }

  setAccountStatusFeedback('', 'info');
  updateAccountProductOptions();
  const streams = getAccountStreamsForCreditUnion(creditUnionId);
  list.replaceChildren();

  if (!streams.length) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'account-status__item account-status__item--empty';
    const emptyText = document.createElement('span');
    emptyText.className = 'account-status__item-note';
    emptyText.textContent = 'No products added yet. Use the add product controls above.';
    emptyItem.append(emptyText);
    list.append(emptyItem);
  } else {
    const fragment = document.createDocumentFragment();
    streams
      .sort((a, b) => a.product.localeCompare(b.product))
      .forEach((stream) => {
        const item = document.createElement('li');
        item.className = 'account-status__item';
        item.textContent = stream.product;
        item.title = stream.revenueType;
        fragment.append(item);
      });
    list.append(fragment);
  }

  if (summary) {
    summary.textContent = `${streams.length} product line${streams.length === 1 ? '' : 's'} added`;
  }

  renderCallReports();
  renderAccountNotes();
  renderAccountReview();
  renderAccountChangeLog();
  renderLoanOfficerCalculator();
  renderLoanIllustrationHistory();
  renderLoanLog();
}

function renderQuotesWorkspace() {
  const summary = selectors.quoteWorkspaceSummary;
  const hasQuoteUI = summary || selectors.loanOfficerSummary || selectors.loanLogSummary || selectors.loanIllustrationList;
  if (!hasQuoteUI) return;

  const creditUnionId = appState.accountSelectionId;
  const hasCreditUnions = appState.creditUnions.length > 0;

  if (!creditUnionId) {
    if (summary) {
      summary.textContent = hasCreditUnions
        ? 'Select a credit union to start a quote.'
        : 'Add a credit union in Accounts to begin quoting.';
    }
    renderLoanOfficerCalculator();
    renderLoanIllustrationHistory();
    renderLoanLog();
    return;
  }

  const creditUnionName = getCreditUnionNameById(creditUnionId) || 'Selected credit union';
  if (summary) {
    summary.textContent = `Showing quotes for ${creditUnionName}.`;
  }

  renderLoanOfficerCalculator();
  renderLoanIllustrationHistory();
  renderLoanLog();
}

function setCallReportFeedback(message, state = 'info') {
  if (!selectors.callReportFeedback) return;
  selectors.callReportFeedback.textContent = message;
  selectors.callReportFeedback.dataset.state = state;
}

function sortCallReports(reports) {
  return [...reports].sort((a, b) => {
    const aYear = Number(a?.periodYear) || 0;
    const bYear = Number(b?.periodYear) || 0;
    if (aYear !== bYear) {
      return aYear - bYear;
    }

    const aMonth = Number(a?.periodMonth) || 0;
    const bMonth = Number(b?.periodMonth) || 0;
    if (aMonth !== bMonth) {
      return aMonth - bMonth;
    }

    const aDate = a?.reportDate ? new Date(a.reportDate).getTime() : 0;
    const bDate = b?.reportDate ? new Date(b.reportDate).getTime() : 0;
    return aDate - bDate;
  });
}

function renderCallReports() {
  if (!selectors.callReportList) return;

  const uploadBtn = selectors.callReportUploadBtn;
  const fileInput = selectors.callReportFileInput;
  const creditUnionId = appState.accountSelectionId;
  const creditUnionName = getCreditUnionNameById(creditUnionId) || 'this credit union';

  if (uploadBtn) {
    uploadBtn.disabled = !creditUnionId;
  }
  if (fileInput) {
    fileInput.disabled = !creditUnionId;
  }

  const summary = selectors.callReportSummary;
  const reports = sortCallReports(Array.isArray(appState.callReports) ? appState.callReports : []);
  if (!creditUnionId) {
    if (summary) {
      summary.textContent = 'Select a credit union to upload call reports and capture loan balances.';
    }
    selectors.callReportList.replaceChildren();
    return;
  }

  if (summary) {
    summary.textContent = `${reports.length} call report${reports.length === 1 ? '' : 's'} stored for ${creditUnionName}.`;
  }

  const body = selectors.callReportList;
  body.replaceChildren();

  if (!reports.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No call reports uploaded yet.';
    row.append(cell);
    body.append(row);
    return;
  }

  const fragment = document.createDocumentFragment();
  reports.forEach((report) => {
    const row = document.createElement('tr');
    const monthKey = `${report.periodYear}-${String(report.periodMonth).padStart(2, '0')}`;
    const reportLabel =
      formatMonthLabelFromKey(monthKey) ||
      (report.reportDate ? new Date(report.reportDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null);

    const dateCell = document.createElement('td');
    dateCell.textContent = reportLabel || monthKey;

    const assetCell = document.createElement('td');
    assetCell.className = 'numeric';
    assetCell.textContent = Number.isFinite(report.assetSize)
      ? currencyFormatter.format(report.assetSize)
      : '—';

    const consumerTotal = getConsumerLoanTotal(report);
    const consumerCell = document.createElement('td');
    consumerCell.className = 'numeric';
    consumerCell.textContent = Number.isFinite(consumerTotal) ? currencyFormatter.format(consumerTotal) : '—';

    const loanCell = document.createElement('td');
    loanCell.className = 'numeric';
    const loanLineCount = Array.isArray(report.loanData) ? report.loanData.length : 0;
    loanCell.textContent = loanLineCount ? `${loanLineCount} loan line${loanLineCount === 1 ? '' : 's'}` : '—';

    const actionsCell = document.createElement('td');
    actionsCell.className = 'numeric';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'table-action-button table-action-button--danger';
    deleteButton.dataset.action = 'delete-call-report';
    deleteButton.dataset.reportId = report.id;
    deleteButton.dataset.reportLabel = reportLabel || monthKey;
    deleteButton.textContent = 'Delete';
    const reportLabelText = reportLabel || monthKey;
    deleteButton.setAttribute(
      'aria-label',
      `Delete the ${reportLabelText} call report${report.sourceName ? ` (${report.sourceName})` : ''}`
    );

    actionsCell.append(deleteButton);

    row.append(dateCell, assetCell, consumerCell, loanCell, actionsCell);
    fragment.append(row);
  });

  body.append(fragment);

  renderCallReportMetrics();
  renderCallReportAssetChart();
  renderCallReportCoverage();
}

function renderCallReportAssetChart() {
  const container = selectors.callReportAssetChart;
  if (!container) return;

  const reports = sortCallReports(Array.isArray(appState.callReports) ? appState.callReports : []);
  container.replaceChildren();

  const addMessage = (text) => {
    const message = document.createElement('p');
    message.className = 'coverage-missing';
    message.textContent = text;
    container.append(message);
  };

  if (!appState.accountSelectionId) {
    addMessage('Select a credit union to view asset trends.');
    return;
  }

  if (!reports.length) {
    addMessage('Upload a call report to see asset growth.');
    return;
  }

  const dataPoints = reports
    .map((report) => {
      const monthKey = report.periodYear && report.periodMonth
        ? `${report.periodYear}-${String(report.periodMonth).padStart(2, '0')}`
        : null;
      const periodLabel = monthKey ? formatMonthLabelFromKey(monthKey) : null;
      const fallbackLabel = report.reportDate
        ? new Date(report.reportDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : null;
      return {
        label: periodLabel || fallbackLabel,
        value: Number(report.assetSize)
      };
    })
    .filter((point) => Number.isFinite(point.value) && point.label);

  if (!dataPoints.length) {
    addMessage('Asset totals are missing from these call reports.');
    return;
  }

  const chart = createLineChart(dataPoints, {
    ariaLabel: 'Asset growth across uploaded call reports',
    valueFormatter: currencyFormatter.format
  });

  if (chart) {
    chart.classList.add('call-report-chart__svg');
    container.append(chart);
  }

  const firstPoint = dataPoints[0];
  const latestPoint = dataPoints[dataPoints.length - 1];
  const change = latestPoint.value - firstPoint.value;
  const summary = document.createElement('p');
  summary.className = 'chart-summary';

  const timeRange = firstPoint.label && latestPoint.label ? `${firstPoint.label} to ${latestPoint.label}` : 'the available period';
  const direction = change >= 0 ? 'increased' : 'decreased';
  const changeText = currencyFormatter.format(Math.abs(change));
  const latestText = currencyFormatter.format(latestPoint.value);

  summary.textContent = `Assets ${direction} by ${changeText} from ${timeRange}, reaching ${latestText}.`;
  container.append(summary);
}

function getConsumerLoanTotal(report) {
  if (!report || !Array.isArray(report.loanSegments)) return null;
  const consumerLabels = [
    'Credit Cards',
    'Other Unsecured/LOC',
    'New Vehicle Loans',
    'Used Vehicle Loans',
    'Other Secured Non-RE/LOC'
  ];

  let total = 0;
  let hasValue = false;

  report.loanSegments.forEach((segment) => {
    if (consumerLabels.includes(segment.label) && Number.isFinite(segment.amount)) {
      total += segment.amount;
      hasValue = true;
    }
  });

  return hasValue ? total : null;
}

function formatDelta(latest, previous, formatter) {
  if (!Number.isFinite(latest) || !Number.isFinite(previous)) return null;
  const delta = latest - previous;
  const arrow = delta >= 0 ? '▲' : '▼';
  const changeText = formatter(Math.abs(delta));
  const percent = previous !== 0 ? Math.abs((delta / Math.abs(previous)) * 100) : null;
  const percentText = Number.isFinite(percent) ? ` (${percent.toFixed(1)}%)` : '';
  return `${arrow} ${changeText} since last report${percentText}`;
}

function renderCallReportMetrics() {
  const container = selectors.callReportMetrics;
  if (!container) return;

  const reports = sortCallReports(Array.isArray(appState.callReports) ? appState.callReports : []);
  container.replaceChildren();

  if (!appState.accountSelectionId) {
    const message = document.createElement('p');
    message.className = 'coverage-missing';
    message.textContent = 'Select a credit union to see extracted metrics.';
    container.append(message);
    return;
  }

  if (!reports.length) {
    const message = document.createElement('p');
    message.className = 'coverage-missing';
    message.textContent = 'Upload a call report to unlock trends and loan mix insights.';
    container.append(message);
    return;
  }

  reports.sort((a, b) => formatPeriodValue(a.periodYear, a.periodMonth) - formatPeriodValue(b.periodYear, b.periodMonth));

  const metricConfigs = [
    {
      key: 'assetSize',
      label: 'Total assets',
      accessor: (report) => report.assetSize,
      formatter: currencyFormatter.format,
      showDelta: true
    },
    {
      key: 'consumerLoans',
      label: 'Consumer lending portfolio',
      accessor: (report) => getConsumerLoanTotal(report),
      formatter: currencyFormatter.format,
      showDelta: true,
      subtext: 'Credit cards, vehicles, unsecured, and other secured non-RE'
    },
    {
      key: 'netInterestIncome',
      label: 'Net interest income',
      accessor: (report) => report.netInterestIncome,
      formatter: currencyFormatter.format
    },
    {
      key: 'totalNonInterestIncome',
      label: 'Total non-interest income',
      accessor: (report) => report.totalNonInterestIncome,
      formatter: currencyFormatter.format
    },
    {
      key: 'netIncomeYtd',
      label: 'Net income YTD',
      accessor: (report) => report.netIncomeYtd,
      formatter: currencyFormatter.format
    },
    {
      key: 'averageMonthlyNetIncome',
      label: 'Avg monthly net income',
      accessor: (report) => report.averageMonthlyNetIncome,
      formatter: currencyFormatter.format
    },
    {
      key: 'totalLoansAmount',
      label: 'Total loans',
      accessor: (report) => report.totalLoans?.amount,
      formatter: currencyFormatter.format
    },
    {
      key: 'totalLoansCount',
      label: 'Total loans (count)',
      accessor: (report) => report.totalLoans?.count,
      formatter: (value) => integerFormatter.format(value)
    },
    {
      key: 'loansGrantedYtd',
      label: 'Loans granted YTD',
      accessor: (report) => report.loansGrantedYtd?.amount,
      formatter: currencyFormatter.format
    },
    {
      key: 'monthlyLoansGenerated',
      label: 'Monthly loans generated',
      accessor: (report) => report.loansGrantedYtd?.monthlyAverage,
      formatter: currencyFormatter.format
    },
    {
      key: 'outstandingIndirectLoans',
      label: 'Outstanding indirect loans',
      accessor: (report) => report.outstandingIndirectLoans,
      formatter: currencyFormatter.format
    }
  ];

  const fragment = document.createDocumentFragment();

  metricConfigs.forEach((config) => {
    const values = reports.map((report) => config.accessor(report)).filter((value) => Number.isFinite(value));
    if (!values.length) return;

    const latestValue = values[values.length - 1];
    const previousValue = values.length > 1 ? values[values.length - 2] : null;
    const card = document.createElement('div');
    card.className = 'metric-card';

    const label = document.createElement('p');
    label.className = 'metric-card__label';
    label.textContent = config.label;

    const valueEl = document.createElement('p');
    valueEl.className = 'metric-card__value';
    valueEl.textContent = config.formatter(latestValue);

    card.append(label, valueEl);

    if (config.subtext) {
      const subtext = document.createElement('p');
      subtext.className = 'metric-card__subtext';
      subtext.textContent = config.subtext;
      card.append(subtext);
    }

    if (config.showDelta) {
      const deltaText = formatDelta(latestValue, previousValue, config.formatter);
      if (deltaText) {
        const meta = document.createElement('p');
        meta.className = 'metric-card__meta';
        meta.textContent = deltaText;
        card.append(meta);
      }
    }

    if (values.length > 1) {
      const sparkline = createSparkline(values);
      if (sparkline) {
        card.append(sparkline);
      }
    }

    fragment.append(card);
  });

  container.append(fragment);

  const latestReport = reports[reports.length - 1];
  const segments = Array.isArray(latestReport?.loanSegments) ? latestReport.loanSegments : [];
  if (segments.length) {
    const segmentTable = document.createElement('table');
    segmentTable.className = 'data-table';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Loan segment', 'Count', 'Amount'].forEach((heading, index) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = heading;
      if (index > 0) {
        th.className = 'numeric';
      }
      headRow.append(th);
    });
    thead.append(headRow);

    const tbody = document.createElement('tbody');
    segments.forEach((segment) => {
      const row = document.createElement('tr');

      const labelCell = document.createElement('td');
      labelCell.textContent = segment.label;

      const countCell = document.createElement('td');
      countCell.className = 'numeric';
      countCell.textContent = Number.isFinite(segment.count) ? integerFormatter.format(segment.count) : '—';

      const amountCell = document.createElement('td');
      amountCell.className = 'numeric';
      amountCell.textContent = Number.isFinite(segment.amount)
        ? currencyFormatter.format(segment.amount)
        : '—';

      row.append(labelCell, countCell, amountCell);
      tbody.append(row);
    });

    segmentTable.append(thead, tbody);
    container.append(segmentTable);
  }
}

function renderCallReportCoverage() {
  const body = selectors.callReportCoverage;
  if (!body) return;

  body.replaceChildren();

  if (!appState.accountSelectionId) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.className = 'coverage-missing';
    cell.textContent = 'Select a credit union to see reporting coverage.';
    row.append(cell);
    body.append(row);
    return;
  }

  const reports = Array.isArray(appState.callReports) ? appState.callReports : [];
  const coverageMap = new Map();
  reports.forEach((report) => {
    if (!report?.periodYear || !report?.periodMonth) return;
    const quarter = Math.min(4, Math.ceil(report.periodMonth / 3));
    const yearCoverage = coverageMap.get(report.periodYear) || { 1: false, 2: false, 3: false, 4: false };
    yearCoverage[quarter] = true;
    coverageMap.set(report.periodYear, yearCoverage);
  });

  const startYear = 2020;
  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year >= startYear; year -= 1) {
    const row = document.createElement('tr');
    const yearCell = document.createElement('th');
    yearCell.scope = 'row';
    yearCell.textContent = year;
    row.append(yearCell);

    const yearCoverage = coverageMap.get(year) || { 1: false, 2: false, 3: false, 4: false };
    [1, 2, 3, 4].forEach((quarter) => {
      const cell = document.createElement('td');
      cell.className = 'numeric';
      const hasReport = yearCoverage[quarter];
      cell.textContent = hasReport ? '✓' : '—';
      cell.classList.add(hasReport ? 'coverage-complete' : 'coverage-missed');
      row.append(cell);
    });

    body.append(row);
  }
}

function formatNoteDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function renderAccountNotes() {
  if (!selectors.accountNotesList || !selectors.accountNotesEmpty) return;

  const creditUnionId = appState.accountSelectionId;
  const notes = creditUnionId && Array.isArray(appState.accountNotes[creditUnionId])
    ? appState.accountNotes[creditUnionId]
    : [];

  const list = selectors.accountNotesList;
  const empty = selectors.accountNotesEmpty;
  const feedback = selectors.accountNotesFeedback;
  const authorInput = selectors.accountNotesAuthor;
  const noteInput = selectors.accountNotesText;
  const submitButton = selectors.accountNotesForm?.querySelector('button[type="submit"]');

  const shouldDisable = !creditUnionId;
  [authorInput, noteInput, submitButton].forEach((el) => {
    if (!el) return;
    el.disabled = shouldDisable;
  });

  if (!creditUnionId) {
    setFeedback(feedback, 'Select a credit union to capture notes.', 'info');
  } else {
    setFeedback(feedback, '', 'info');
  }

  list.replaceChildren();

  if (!notes.length) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  const fragment = document.createDocumentFragment();
  notes.forEach((note) => {
    const item = document.createElement('li');
    item.className = 'note-card';

    const header = document.createElement('div');
    header.className = 'note-card__meta';

    const author = document.createElement('span');
    author.className = 'note-card__author';
    author.textContent = note.author || 'Unknown team member';

    const date = document.createElement('span');
    date.className = 'note-card__date';
    date.textContent = formatNoteDate(note.createdAt);

    header.append(author, date);

    const body = document.createElement('p');
    body.className = 'note-card__text';
    body.textContent = note.text;

    item.append(header, body);
    fragment.append(item);
  });

  list.append(fragment);
}

function formatLogTimestamp(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function addAccountChangeLog({ creditUnionId, action, details, actor }) {
  if (!creditUnionId || !action) return;
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    action,
    details: details || '',
    actor: actor || 'Workspace user',
    timestamp: new Date().toISOString()
  };
  const existing = Array.isArray(appState.accountChangeLog[creditUnionId])
    ? appState.accountChangeLog[creditUnionId]
    : [];
  appState.accountChangeLog = {
    ...appState.accountChangeLog,
    [creditUnionId]: [entry, ...existing].slice(0, 200)
  };
  void persistAccountChangeLog(creditUnionId, entry).then((entries) => {
    if (entries) {
      renderAccountChangeLog();
    }
  });
  renderAccountChangeLog();
}

function renderAccountChangeLog() {
  const list = selectors.accountChangeLog;
  const empty = selectors.accountChangeLogEmpty;
  if (!list || !empty) return;

  const creditUnionId = appState.accountSelectionId;
  list.replaceChildren();

  const emptyMessage = empty.querySelector('p');
  if (!creditUnionId) {
    empty.hidden = false;
    if (emptyMessage) {
      emptyMessage.textContent = 'Select a credit union to view the account change log.';
    }
    return;
  }

  const entries = Array.isArray(appState.accountChangeLog[creditUnionId])
    ? appState.accountChangeLog[creditUnionId]
    : [];

  if (!entries.length) {
    empty.hidden = false;
    if (emptyMessage) {
      emptyMessage.textContent = 'No changes logged yet. Updates will appear once account activity is recorded.';
    }
    return;
  }

  empty.hidden = true;
  const fragment = document.createDocumentFragment();
  entries.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'change-log__item';

    const header = document.createElement('div');
    header.className = 'change-log__header';

    const action = document.createElement('span');
    action.className = 'change-log__title';
    action.textContent = entry.action;

    const timestamp = document.createElement('span');
    timestamp.textContent = formatLogTimestamp(entry.timestamp);

    header.append(action, timestamp);

    const details = document.createElement('p');
    details.className = 'change-log__details';
    details.textContent = entry.details || '—';

    const meta = document.createElement('div');
    meta.className = 'change-log__meta';
    const actor = document.createElement('span');
    actor.textContent = `By: ${entry.actor || 'Workspace user'}`;
    meta.append(actor);

    item.append(header, details, meta);
    fragment.append(item);
  });

  list.append(fragment);
}

function setFormDisabled(form, isDisabled) {
  if (!form) return;
  form.querySelectorAll('input, select, textarea, button').forEach((element) => {
    element.disabled = isDisabled;
  });
}

function getReviewValue(data, path) {
  return path.split('.').reduce((value, key) => {
    if (value && typeof value === 'object') {
      return value[key];
    }
    return undefined;
  }, data);
}

function setReviewValue(target, path, value) {
  const parts = path.split('.');
  let current = target;
  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      current[part] = value;
    } else {
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
  });
}

function renderAccountReview() {
  const form = selectors.accountReviewForm;
  const locked = selectors.accountReviewLocked;
  const feedback = selectors.accountReviewFeedback;
  const updatedLabel = selectors.accountReviewUpdated;
  if (!form || !locked) return;

  const creditUnionId = appState.accountSelectionId;
  const creditUnion = getCreditUnionById(creditUnionId);
  const isAccount = creditUnion?.classification === 'account';

  if (!creditUnionId || !isAccount) {
    form.hidden = true;
    locked.hidden = false;
    const lockedMessage = locked.querySelector('p');
    if (lockedMessage) {
      if (!creditUnionId) {
        lockedMessage.textContent = 'Select an account to start the year end review.';
      } else {
        lockedMessage.textContent =
          'This credit union is still marked as a prospect. Move it to Accounts to unlock the year end review fields.';
      }
    }
    setFormDisabled(form, true);
    if (feedback) {
      setFeedback(feedback, '', 'info');
    }
    if (updatedLabel) {
      updatedLabel.textContent = '—';
    }
    if (selectors.accountReviewDownload) {
      selectors.accountReviewDownload.disabled = true;
    }
    return;
  }

  form.hidden = false;
  locked.hidden = true;
  setFormDisabled(form, false);
  if (selectors.accountReviewDownload) {
    selectors.accountReviewDownload.disabled = false;
  }

  const stored = appState.accountReviewData[creditUnionId] || {};
  const reviewData = {
    year: stored.year ?? new Date().getFullYear(),
    reviewedBy: stored.reviewedBy ?? '',
    trainingFrequency: stored.trainingFrequency ?? '',
    program: stored.program ?? {},
    integration: stored.integration ?? {},
    coreProcessor: stored.coreProcessor ?? '',
    losProvider: stored.losProvider ?? '',
    updatedAt: stored.updatedAt ?? null
  };

  form.querySelectorAll('[data-review-path]').forEach((input) => {
    const path = input.dataset.reviewPath;
    if (!path) return;
    const value = getReviewValue(reviewData, path);
    if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
      input.value = value ?? '';
    }
  });

  if (updatedLabel) {
    updatedLabel.textContent = reviewData.updatedAt ? formatLogTimestamp(reviewData.updatedAt) : '—';
  }

  if (feedback) {
    setFeedback(feedback, '', 'info');
  }
}

function collectReviewFormData(form) {
  const data = {};
  form.querySelectorAll('[data-review-path]').forEach((input) => {
    const path = input.dataset.reviewPath;
    if (!path) return;
    const value = input instanceof HTMLInputElement || input instanceof HTMLSelectElement ? input.value.trim() : '';
    setReviewValue(data, path, value);
  });
  return data;
}

const reviewLogoUrl = new URL('GFS Logo.png', window.location.href).toString();
let cachedReviewLogoData = null;

function formatReviewField(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '—';
    const lower = trimmed.toLowerCase();
    if (lower === 'yes') return 'Yes';
    if (lower === 'no') return 'No';
    if (lower === 'manual') return 'Manual';
    if (lower === 'ach') return 'ACH';
    if (lower === 'weekly') return 'Weekly';
    if (lower === 'monthly') return 'Monthly';
    if (lower === 'bi-monthly') return 'Bi-Monthly';
    if (lower === 'quarterly') return 'Quarterly';
    if (lower === 'yearly') return 'Yearly';
    return trimmed;
  }
  return String(value);
}

const TRAINING_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TRAINING_FREQUENCY_META = {
  weekly: { annual: 48, months: TRAINING_MONTHS.map((_label, index) => index), sessionsPerMonth: 4 },
  monthly: { annual: 12, months: TRAINING_MONTHS.map((_label, index) => index), sessionsPerMonth: 1 },
  'bi-monthly': { annual: 6, months: [0, 2, 4, 6, 8, 10], sessionsPerMonth: 1 },
  quarterly: { annual: 4, months: [0, 3, 6, 9], sessionsPerMonth: 1 },
  yearly: { annual: 1, months: [0], sessionsPerMonth: 1 }
};

function getTrainingMeta(frequency) {
  if (!frequency) return null;
  return TRAINING_FREQUENCY_META[frequency] || null;
}

function renderTrainingDashboard() {
  if (
    !selectors.trainingAccountsTotal &&
    !selectors.trainingMonthlyTotal &&
    !selectors.trainingAnnualTotal &&
    !selectors.trainingMonthGrid &&
    !selectors.trainingCommitmentBody
  ) {
    return;
  }

  const trainingRows = appState.creditUnions
    .filter((creditUnion) => creditUnion.classification === 'account')
    .map((creditUnion) => {
      const reviewData = appState.accountReviewData[creditUnion.id] || {};
      const frequency = reviewData.trainingFrequency || '';
      const meta = getTrainingMeta(frequency);
      if (!meta) return null;
      const annual = meta.annual;
      return {
        id: creditUnion.id,
        name: creditUnion.name,
        frequency,
        frequencyLabel: formatReviewField(frequency),
        annual,
        monthlyAverage: annual / 12,
        updatedAt: reviewData.updatedAt
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalAccounts = trainingRows.length;
  const totalAnnual = trainingRows.reduce((sum, row) => sum + row.annual, 0);
  const totalMonthly = totalAnnual / 12;

  if (selectors.trainingAccountsTotal) {
    selectors.trainingAccountsTotal.textContent = integerFormatter.format(totalAccounts);
  }
  if (selectors.trainingMonthlyTotal) {
    selectors.trainingMonthlyTotal.textContent = totalMonthly
      ? decimalFormatter.format(totalMonthly)
      : '0';
  }
  if (selectors.trainingAnnualTotal) {
    selectors.trainingAnnualTotal.textContent = totalAnnual
      ? integerFormatter.format(totalAnnual)
      : '0';
  }

  if (selectors.trainingMonthGrid) {
    selectors.trainingMonthGrid.innerHTML = '';
    const monthlyTotals = TRAINING_MONTHS.map(() => 0);
    trainingRows.forEach((row) => {
      const meta = getTrainingMeta(row.frequency);
      if (!meta) return;
      meta.months.forEach((monthIndex) => {
        monthlyTotals[monthIndex] += meta.sessionsPerMonth;
      });
    });

    const fragment = document.createDocumentFragment();
    monthlyTotals.forEach((total, index) => {
      const card = document.createElement('article');
      card.className = 'training-month-card';
      card.setAttribute('role', 'listitem');

      const label = document.createElement('p');
      label.className = 'training-month-label';
      label.textContent = TRAINING_MONTHS[index];

      const value = document.createElement('p');
      value.className = 'training-month-value';
      value.textContent = integerFormatter.format(total);

      const meta = document.createElement('p');
      meta.className = 'training-month-meta';
      meta.textContent = 'sessions';

      card.append(label, value, meta);
      fragment.append(card);
    });

    selectors.trainingMonthGrid.append(fragment);
  }

  if (selectors.trainingCommitmentBody) {
    selectors.trainingCommitmentBody.innerHTML = '';
    const fragment = document.createDocumentFragment();
    trainingRows.forEach((row) => {
      const tableRow = document.createElement('tr');

      const nameCell = document.createElement('td');
      nameCell.textContent = row.name;

      const frequencyCell = document.createElement('td');
      frequencyCell.textContent = row.frequencyLabel;

      const monthlyCell = document.createElement('td');
      monthlyCell.className = 'numeric';
      monthlyCell.textContent = decimalFormatter.format(row.monthlyAverage);

      const annualCell = document.createElement('td');
      annualCell.className = 'numeric';
      annualCell.textContent = integerFormatter.format(row.annual);

      const updatedCell = document.createElement('td');
      updatedCell.textContent = row.updatedAt ? formatLogTimestamp(row.updatedAt) : '—';

      tableRow.append(nameCell, frequencyCell, monthlyCell, annualCell, updatedCell);
      fragment.append(tableRow);
    });
    selectors.trainingCommitmentBody.append(fragment);
  }

  const hasRows = trainingRows.length > 0;
  if (selectors.trainingEmptyState) {
    selectors.trainingEmptyState.hidden = hasRows;
  }
  if (selectors.trainingTableCard) {
    selectors.trainingTableCard.hidden = !hasRows;
  }
}

function getReviewPdfData(creditUnionId) {
  const stored = appState.accountReviewData[creditUnionId] || {};
  const form = selectors.accountReviewForm;
  const formData = form ? collectReviewFormData(form) : {};
  const yearValue = formData.year || stored.year || new Date().getFullYear();

  return {
    ...stored,
    ...formData,
    year: yearValue,
    updatedAt: stored.updatedAt ?? null
  };
}

const pdfTheme = {
  primary: [90, 10, 22],
  text: [20, 20, 20],
  muted: [95, 95, 95],
  border: [210, 210, 210],
  headerFill: [246, 246, 246],
  stripeFill: [252, 252, 252]
};

function ensurePdfSpace(doc, currentY, requiredHeight, margin, pageHeight) {
  if (currentY + requiredHeight <= pageHeight - margin) {
    return currentY;
  }
  doc.addPage();
  return margin;
}

function addPdfSectionTitle(doc, title, x, y, width) {
  const bandHeight = 20;
  doc.setFillColor(...pdfTheme.headerFill);
  doc.rect(x, y - 14, width, bandHeight, 'F');
  doc.setDrawColor(...pdfTheme.border);
  doc.line(x, y + 6, x + width, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...pdfTheme.primary);
  doc.text(title, x + 6, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...pdfTheme.text);
  return y + 18;
}

function addPdfKeyValueRows(doc, rows, x, y, maxWidth, margin, pageHeight) {
  const labelWidth = Math.min(170, maxWidth * 0.35);
  const valueWidth = maxWidth - labelWidth;
  const lineHeight = 14;

  rows.forEach(({ label, value }, index) => {
    const safeValue = formatReviewField(value);
    const labelLines = doc.splitTextToSize(label, labelWidth - 6);
    const valueLines = doc.splitTextToSize(safeValue, valueWidth - 6);
    const rowHeight = Math.max(labelLines.length, valueLines.length) * lineHeight + 4;
    y = ensurePdfSpace(doc, y, rowHeight, margin, pageHeight);

    if (index % 2 === 0) {
      doc.setFillColor(...pdfTheme.stripeFill);
      doc.rect(x, y - lineHeight + 2, maxWidth, rowHeight, 'F');
    }
    doc.setDrawColor(...pdfTheme.border);
    doc.line(x, y + rowHeight - lineHeight + 2, x + maxWidth, y + rowHeight - lineHeight + 2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...pdfTheme.muted);
    doc.text(labelLines, x + 4, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...pdfTheme.text);
    doc.text(valueLines, x + labelWidth, y);
    y += rowHeight;
  });

  return y;
}

function addPdfTable(doc, { title, headers, rows }, x, y, maxWidth, margin, pageHeight) {
  y = addPdfSectionTitle(doc, title, x, y, maxWidth);
  const columnWidth = maxWidth / headers.length;
  const lineHeight = 14;

  const headerHeight = lineHeight + 6;
  y = ensurePdfSpace(doc, y, headerHeight, margin, pageHeight);
  doc.setFillColor(...pdfTheme.headerFill);
  doc.rect(x, y - 12, maxWidth, headerHeight, 'F');
  doc.setDrawColor(...pdfTheme.border);
  doc.rect(x, y - 12, maxWidth, headerHeight);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...pdfTheme.text);
  headers.forEach((header, index) => {
    doc.text(header, x + columnWidth * index + 4, y);
  });
  y += headerHeight;
  doc.setFont('helvetica', 'normal');

  rows.forEach((row, rowIndex) => {
    const cellLines = row.map((cell) => doc.splitTextToSize(formatReviewField(cell), columnWidth - 6));
    const maxLines = Math.max(...cellLines.map((lines) => lines.length));
    const rowHeight = Math.max(1, maxLines) * lineHeight + 4;
    y = ensurePdfSpace(doc, y, rowHeight, margin, pageHeight);

    if (rowIndex % 2 === 0) {
      doc.setFillColor(...pdfTheme.stripeFill);
      doc.rect(x, y - lineHeight + 2, maxWidth, rowHeight, 'F');
    }
    doc.setDrawColor(...pdfTheme.border);
    doc.rect(x, y - lineHeight + 2, maxWidth, rowHeight);

    cellLines.forEach((lines, index) => {
      doc.text(lines, x + columnWidth * index + 4, y);
    });
    y += rowHeight;
  });

  return y + 6;
}

function addPdfHeader(doc, { title, subtitle, meta }, margin, pageWidth, logoData) {
  const logoMaxWidth = 140;
  const logoMaxHeight = 40;

  if (logoData?.dataUrl) {
    const intrinsicWidth = logoData.width || logoMaxWidth;
    const intrinsicHeight = logoData.height || logoMaxHeight;
    const scale = Math.min(logoMaxWidth / intrinsicWidth, logoMaxHeight / intrinsicHeight, 1);
    const renderWidth = intrinsicWidth * scale;
    const renderHeight = intrinsicHeight * scale;
    doc.addImage(logoData.dataUrl, 'PNG', margin, margin - 6, renderWidth, renderHeight);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...pdfTheme.primary);
  const textOffset = logoData?.dataUrl ? logoMaxWidth + 30 : 0;
  doc.text(title, margin + textOffset, margin + 16);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...pdfTheme.muted);
  doc.text(subtitle, margin + textOffset, margin + 32);
  if (meta) {
    doc.text(meta, margin + textOffset, margin + 48);
  }

  doc.setDrawColor(...pdfTheme.border);
  doc.line(margin, margin + 60, pageWidth - margin, margin + 60);
  doc.setTextColor(...pdfTheme.text);
  return margin + 78;
}

async function loadReviewLogoData() {
  if (cachedReviewLogoData) return cachedReviewLogoData;
  try {
    const response = await fetch(reviewLogoUrl);
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Logo image failed to load.'));
      img.src = dataUrl;
    });
    cachedReviewLogoData = {
      dataUrl,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height
    };
    return cachedReviewLogoData;
  } catch (_error) {
    return null;
  }
}

async function downloadYearEndReviewPdf() {
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) {
    setFeedback(selectors.accountReviewFeedback, 'Select a credit union before downloading a PDF.', 'error');
    return;
  }

  const creditUnion = getCreditUnionById(creditUnionId);
  if (creditUnion?.classification !== 'account') {
    setFeedback(selectors.accountReviewFeedback, 'Move this prospect to Accounts before downloading a PDF.', 'error');
    return;
  }

  if (!window.jspdf?.jsPDF) {
    setFeedback(selectors.accountReviewFeedback, 'PDF tools are still loading. Please try again in a moment.', 'error');
    return;
  }

  const reviewData = getReviewPdfData(creditUnionId);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logoData = await loadReviewLogoData();
  const preparedFor = creditUnion.name || 'Credit union';
  const reviewedBy = formatReviewField(reviewData.reviewedBy);
  const yearLabel = reviewData.year || new Date().getFullYear();
  const metaLine = `Review year: ${yearLabel} • Reviewed by: ${reviewedBy || '—'}`;
  let y = addPdfHeader(
    doc,
    {
      title: 'Year End Review',
      subtitle: preparedFor,
      meta: metaLine
    },
    margin,
    pageWidth,
    logoData
  );

  y = addPdfSectionTitle(doc, 'Review summary', margin, y, pageWidth - margin * 2);
  const summaryRows = [
    { label: 'Review year', value: yearLabel },
    { label: 'Reviewed by', value: reviewData.reviewedBy },
    { label: 'Training frequency', value: reviewData.trainingFrequency },
    { label: 'Last updated', value: reviewData.updatedAt ? formatLogTimestamp(reviewData.updatedAt) : '—' }
  ];
  y = addPdfKeyValueRows(doc, summaryRows, margin, y, pageWidth - margin * 2, margin, pageHeight);
  y += 10;

  const programRows = [
    [
      'Rates',
      reviewData.program?.life?.rates,
      reviewData.program?.ah?.rates,
      reviewData.program?.iui?.rates,
      reviewData.program?.gap?.rates,
      reviewData.program?.vsc?.rates
    ],
    [
      'Limits',
      reviewData.program?.life?.limits,
      reviewData.program?.ah?.limits,
      reviewData.program?.iui?.limits,
      reviewData.program?.gap?.limits,
      reviewData.program?.vsc?.limits
    ],
    [
      'Coverages',
      reviewData.program?.life?.coverages,
      reviewData.program?.ah?.coverages,
      reviewData.program?.iui?.coverages,
      reviewData.program?.gap?.coverages,
      reviewData.program?.vsc?.coverages
    ],
    [
      'Income',
      reviewData.program?.life?.income,
      reviewData.program?.ah?.income,
      reviewData.program?.iui?.income,
      reviewData.program?.gap?.income,
      reviewData.program?.vsc?.income
    ],
    [
      'Incentives',
      reviewData.program?.life?.incentives,
      reviewData.program?.ah?.incentives,
      reviewData.program?.iui?.incentives,
      reviewData.program?.gap?.incentives,
      reviewData.program?.vsc?.incentives
    ],
    [
      'Term extension',
      reviewData.program?.life?.termExtension,
      reviewData.program?.ah?.termExtension,
      reviewData.program?.iui?.termExtension,
      reviewData.program?.gap?.termExtension,
      reviewData.program?.vsc?.termExtension
    ]
  ];

  y = addPdfTable(
    doc,
    {
      title: 'Current PMAC program',
      headers: ['Field', 'Life', 'A/H', 'IUI', 'GAP', 'VSC'],
      rows: programRows
    },
    margin,
    y,
    pageWidth - margin * 2,
    margin,
    pageHeight
  );

  y = addPdfTable(
    doc,
    {
      title: 'Integration',
      headers: ['Field', 'CSO', 'ASG', 'HUB'],
      rows: [
        [
          'Member detail',
          reviewData.integration?.cso?.memberDetail,
          reviewData.integration?.asg?.memberDetail,
          reviewData.integration?.hub?.memberDetail
        ],
        ['Sales', reviewData.integration?.cso?.sales, reviewData.integration?.asg?.sales, reviewData.integration?.hub?.sales],
        [
          'Premium remittance',
          reviewData.integration?.cso?.premiumRemittance || 'Manual / ACH',
          reviewData.integration?.asg?.premiumRemittance || 'Manual / ACH',
          reviewData.integration?.hub?.premiumRemittance || 'Manual / ACH'
        ],
        [
          'Claim payments',
          reviewData.integration?.cso?.claimPayments || 'Manual / ACH',
          reviewData.integration?.asg?.claimPayments || 'Manual / ACH',
          reviewData.integration?.hub?.claimPayments || 'Manual / ACH'
        ]
      ]
    },
    margin,
    y,
    pageWidth - margin * 2,
    margin,
    pageHeight
  );

  y = addPdfSectionTitle(doc, 'Core systems', margin, y, pageWidth - margin * 2);
  y = addPdfKeyValueRows(
    doc,
    [
      { label: 'Core processor', value: reviewData.coreProcessor },
      { label: 'LOS provider', value: reviewData.losProvider }
    ],
    margin,
    y,
    pageWidth - margin * 2,
    margin,
    pageHeight
  );

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...pdfTheme.muted);
    doc.text(
      `Page ${page} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - margin / 2,
      { align: 'right' }
    );
  }

  const safeName = (creditUnion.name || 'Credit union').replace(/[^\w\s-]+/g, '').trim() || 'credit-union';
  const fileName = `${safeName.replace(/\s+/g, ' ')}-${yearLabel || 'review'}-year-end-review.pdf`;
  doc.save(fileName);
  setFeedback(selectors.accountReviewFeedback, 'Year end review PDF downloaded.', 'success');
}

function createSparkline(values) {
  const filtered = values.filter((value) => Number.isFinite(value));
  if (filtered.length < 2) return null;

  const width = 160;
  const height = 60;
  const min = Math.min(...filtered);
  const max = Math.max(...filtered);
  const range = max - min || 1;

  const points = filtered
    .map((value, index) => {
      const x = (index / (filtered.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'sparkline');

  const baseline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  baseline.setAttribute('x1', '0');
  baseline.setAttribute('y1', height.toString());
  baseline.setAttribute('x2', width.toString());
  baseline.setAttribute('y2', height.toString());
  baseline.setAttribute('stroke', 'rgba(255,255,255,0.12)');
  baseline.setAttribute('stroke-width', '1');

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', 'var(--accent)');
  polyline.setAttribute('stroke-width', '2');
  polyline.setAttribute('points', points);

  svg.append(baseline, polyline);
  return svg;
}

function createLineChart(points, options = {}) {
  const validPoints = Array.isArray(points)
    ? points.filter((point) => Number.isFinite(point?.value) && point.label)
    : [];
  if (!validPoints.length) return null;

  const width = options.width ?? 820;
  const height = options.height ?? 320;
  const padding = options.padding ?? 56;
  const strokeColor = options.strokeColor || 'var(--accent)';
  const fillColor = options.fillColor || 'rgba(255, 255, 255, 0.04)';
  const valueFormatter = typeof options.valueFormatter === 'function' ? options.valueFormatter : (value) => value;

  const values = validPoints.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'line-chart');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', options.ariaLabel || 'Line chart');

  const grid = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  grid.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
  grid.setAttribute('stroke-width', '1');

  for (let i = 0; i <= 4; i += 1) {
    const y = padding + (i / 4) * chartHeight;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', padding.toString());
    line.setAttribute('x2', (width - padding).toString());
    line.setAttribute('y1', y.toString());
    line.setAttribute('y2', y.toString());
    grid.append(line);
  }

  const areaPoints = validPoints
    .map((point, index) => {
      const x = padding + (validPoints.length > 1 ? (index / (validPoints.length - 1)) * chartWidth : chartWidth / 2);
      const y = padding + (1 - (point.value - min) / range) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const area = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  area.setAttribute('fill', fillColor);
  area.setAttribute('points', `${padding},${height - padding} ${areaPoints} ${width - padding},${height - padding}`);

  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke', strokeColor);
  polyline.setAttribute('stroke-width', '3');
  polyline.setAttribute('points', areaPoints);
  polyline.setAttribute('stroke-linejoin', 'round');
  polyline.setAttribute('stroke-linecap', 'round');

  const pointsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  pointsGroup.setAttribute('fill', strokeColor);

  validPoints.forEach((point, index) => {
    const x = padding + (validPoints.length > 1 ? (index / (validPoints.length - 1)) * chartWidth : chartWidth / 2);
    const y = padding + (1 - (point.value - min) / range) * chartHeight;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x.toString());
    circle.setAttribute('cy', y.toString());
    circle.setAttribute('r', '4');

    const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    tooltip.textContent = `${point.label}: ${valueFormatter(point.value)}`;
    circle.append(tooltip);

    pointsGroup.append(circle);
  });

  const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  labelsGroup.setAttribute('fill', 'var(--text-secondary)');
  labelsGroup.setAttribute('font-size', '12');

  const minLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  minLabel.setAttribute('x', (padding - 10).toString());
  minLabel.setAttribute('y', (height - padding).toString());
  minLabel.setAttribute('text-anchor', 'end');
  minLabel.textContent = valueFormatter(min);

  const maxLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  maxLabel.setAttribute('x', (padding - 10).toString());
  maxLabel.setAttribute('y', padding.toString());
  maxLabel.setAttribute('text-anchor', 'end');
  maxLabel.textContent = valueFormatter(max);

  labelsGroup.append(minLabel, maxLabel);

  svg.append(grid, area, polyline, pointsGroup, labelsGroup);
  return svg;
}

async function submitMissingRow(row, button) {
  if (!row) return;
  const amountInput = row.querySelector('input[name="amount"]');
  if (!amountInput) return;

  const incomeStreamId = row.dataset.streamId;
  const year = Number(row.dataset.year);
  const month = Number(row.dataset.month);
  const rawAmount = amountInput.value.trim();

  if (!incomeStreamId || !Number.isFinite(year) || !Number.isFinite(month)) {
    setFeedback(selectors.missingFeedback, 'Missing stream information for this row.', 'error');
    return;
  }

  if (!rawAmount) {
    setFeedback(selectors.missingFeedback, 'Enter an amount before saving.', 'error');
    amountInput.focus();
    return;
  }

  const amount = Number(rawAmount);
  if (!Number.isFinite(amount)) {
    setFeedback(selectors.missingFeedback, 'Amount must be a valid number.', 'error');
    amountInput.focus();
    return;
  }

  button.disabled = true;
  amountInput.disabled = true;
  setFeedback(selectors.missingFeedback, 'Saving revenue...', 'info');

  try {
    await saveRevenueEntry({ incomeStreamId, year, month, amount });
    setFeedback(selectors.missingFeedback, 'Revenue saved.', 'success');
    await loadIncomeStreams();
    await loadMissingUpdates();
  } catch (error) {
    setFeedback(selectors.missingFeedback, error.message, 'error');
  } finally {
    button.disabled = false;
    amountInput.disabled = false;
  }
}

async function handleAddAccountProduct() {
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) {
    setAccountStatusFeedback('Select a credit union before adding a product.', 'error');
    return;
  }

  const product = selectors.accountProductSelect?.value;
  const revenueType = selectors.accountRevenueSelect?.value;
  if (!product || !revenueType) {
    setAccountStatusFeedback('Choose a product line and revenue line.', 'error');
    return;
  }

  try {
    if (selectors.accountAddProductBtn) {
      selectors.accountAddProductBtn.disabled = true;
    }
    setAccountStatusFeedback('Adding product line...', 'info');
    await createIncomeStream({
      creditUnionId,
      product,
      revenueType,
      status: 'active'
    });
    await loadIncomeStreams();
    await loadProspectStreams();
    renderAccountWorkspace();
    renderProspectAccountList();
    setAccountStatusFeedback('Product line added.', 'success');
    addAccountChangeLog({
      creditUnionId,
      action: 'Added product line',
      details: `${product} · ${revenueType}`,
      actor: 'Workspace user'
    });
  } catch (error) {
    setAccountStatusFeedback(error instanceof Error ? error.message : 'Unable to add product.', 'error');
  } finally {
    if (selectors.accountAddProductBtn) {
      selectors.accountAddProductBtn.disabled = false;
    }
  }
}

function formatPeriodLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function formatPeriodValue(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getCurrentPeriodValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatDateString(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getStreamIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    appState.currentStreamId = id;
  }
  return id;
}

async function loadIncomeStreamDetail(streamId) {
  const data = await request(`/api/income-streams/${streamId}`);
  renderStreamOverview(data);
}

function renderStreamOverview(stream) {
  if (!stream) return;

  appState.currentStreamDetail = stream;

  const [defaultStartYear, defaultStartMonth] = REPORTING_START_PERIOD.split('-').map((value) => Number.parseInt(value, 10));
  const firstReportLabel = stream.firstReport?.label ?? formatPeriodLabel(defaultStartYear, defaultStartMonth);

  if (selectors.streamName) {
    selectors.streamName.textContent = stream.label;
  }

  if (selectors.updateStartMonthBtn) {
    selectors.updateStartMonthBtn.hidden = false;
    selectors.updateStartMonthBtn.setAttribute('aria-label', 'Update the first reporting month for this income stream');
  }

  if (selectors.cancelStreamBtn) {
    const button = selectors.cancelStreamBtn;
    button.hidden = false;
    if (stream.finalReport) {
      button.textContent = 'Update final reporting month';
      button.setAttribute('aria-label', 'Update the final reporting month for this income stream');
    } else {
      button.textContent = 'Cancel income stream';
      button.setAttribute('aria-label', 'Cancel this income stream and stop future reporting requirements');
    }
  }

  if (selectors.streamDetails) {
    selectors.streamDetails.replaceChildren();
    const finalReportLabel = stream.finalReport ? stream.finalReport.label : null;
    const entries = [
      ['Credit union / entity', stream.creditUnionName],
      ['Product / service', stream.product],
      ['Revenue type', stream.revenueType],
      ['First reporting month', firstReportLabel],
      ['Created on', formatDateString(stream.createdAt)],
      ['Last updated', formatDateString(stream.updatedAt)],
      [
        'Pending months',
        stream.pendingCount > 0
          ? `${stream.pendingCount} month${stream.pendingCount === 1 ? '' : 's'} awaiting reporting`
          : 'All months reported'
      ]
    ];

    if (finalReportLabel) {
      entries.push(['Final reporting month', finalReportLabel]);
      entries.push(['Stream status', 'Canceled']);
    } else {
      entries.push(['Stream status', 'Active']);
    }

    if (stream.canceledAt) {
      entries.push(['Canceled on', formatDateString(stream.canceledAt)]);
    }

    entries.forEach(([label, value]) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'stream-overview__detail';
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      wrapper.append(dt, dd);
      selectors.streamDetails.append(wrapper);
    });
  }
}

async function loadIncomeStreamReportingStatus(streamId) {
  const data = await request(`/api/income-streams/${streamId}/reporting-status`);
  renderReportingStatus(data);
}

function renderReportingStatus(data) {
  const grid = selectors.reportingStatusGrid;
  const template = selectors.reportingStatusTemplate;
  if (!grid || !template) return;

  grid.replaceChildren();

  const months = Array.isArray(data?.months) ? data.months : [];
  const summary = data?.summary ?? { total: months.length, completed: 0, pending: months.length };
  appState.currentStreamMonths = months;

  if (!months.length) {
    const empty = document.createElement('p');
    empty.className = 'panel__description';
    empty.textContent = 'No reporting requirements found for this income stream.';
    grid.append(empty);
  } else {
    months.forEach((month) => {
      const fragment = template.content.cloneNode(true);
      const card = fragment.querySelector('.status-card');
      const title = fragment.querySelector('.status-card__month');
      const amount = fragment.querySelector('.status-card__amount');

      if (card) {
        card.dataset.state = month.completed ? 'complete' : 'pending';
        card.dataset.key = month.key;
        card.dataset.interactive = 'true';
        card.tabIndex = 0;
        card.setAttribute('aria-label', `Edit revenue for ${month.label}`);
        card.setAttribute('aria-roledescription', 'button');
      }

      if (title) {
        title.textContent = month.label;
      }

      if (amount) {
        if (month.completed && Number.isFinite(month.amount)) {
          amount.textContent = `Recorded ${currencyFormatter.format(month.amount)}`;
        } else if (month.completed) {
          amount.textContent = 'Recorded (amount unavailable)';
        } else {
          amount.textContent = 'Awaiting input';
        }
      }

      grid.append(fragment);
    });
  }

  renderStreamPerformance(months);

  if (selectors.reportingStatusSummary) {
    const pendingText =
      summary.pending > 0
        ? `${summary.pending} month${summary.pending === 1 ? '' : 's'} still need numbers.`
        : 'Every required month has been reported. Great job!';
    const completedText = `${summary.completed} of ${summary.total} month${summary.total === 1 ? '' : 's'} reported.`;
    const startLabel = months[0]?.label ?? 'Jan 2023';
    const endLabel = months[months.length - 1]?.label ?? startLabel;
    const rangeText = startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
    const finalReportLabel = appState.currentStreamDetail?.finalReport?.label;
    if (finalReportLabel) {
      selectors.reportingStatusSummary.textContent = `${completedText} ${pendingText} Tracking period: ${rangeText}. No new months will be generated after ${finalReportLabel}.`;
    } else {
      selectors.reportingStatusSummary.textContent = `${completedText} ${pendingText} Tracking period: ${rangeText}.`;
    }
  }
}

async function loadCreditUnions() {
  const data = await request('/api/credit-unions');
  const cleanedCreditUnions = scrubDuplicateCoastlife(data);
  appState.creditUnions = cleanedCreditUnions.map((item) => ({
    id: item.id,
    name: item.name,
    classification: normalizeClassification(item.classification)
  }));
  renderCreditUnionOptions();
  renderProspectAccountList();
  renderAccountDirectory();
  renderTrainingDashboard();
}

async function loadIncomeStreams() {
  const data = await request('/api/income-streams?status=active');
  appState.incomeStreams = data.map((stream) => ({
    id: stream.id,
    label: stream.label,
    creditUnionId: stream.creditUnionId,
    creditUnionName: stream.creditUnionName,
    product: stream.product,
    revenueType: stream.revenueType,
    status: stream.status,
    monthlyIncomeEstimate: stream.monthlyIncomeEstimate,
    updatedAt: stream.updatedAt ? new Date(stream.updatedAt).getTime() : 0,
    pendingCount: Number(stream.pendingCount ?? 0),
    reportedCount: Number(stream.reportedCount ?? 0),
    firstReport: stream.firstReport
      ? {
          year: stream.firstReport.year,
          month: stream.firstReport.month,
          key: stream.firstReport.key,
          label: stream.firstReport.label
        }
      : null,
    lastReport: stream.lastReport
      ? {
          amount: Number(stream.lastReport.amount),
          month: stream.lastReport.month,
          year: stream.lastReport.year
        }
      : null,
    finalReport: stream.finalReport
      ? {
          year: stream.finalReport.year,
          month: stream.finalReport.month,
          label: stream.finalReport.label
        }
      : null
  }));
  renderCreditUnionOptions();
  renderIncomeStreamList();
  renderProspectAccountList();
  renderAccountDirectory();
}

async function loadProspectStreams() {
  const data = await request('/api/income-streams?status=prospect');
  appState.prospectStreams = data.map((stream) => ({
    id: stream.id,
    label: stream.label,
    creditUnionId: stream.creditUnionId,
    creditUnionName: stream.creditUnionName,
    product: stream.product,
    revenueType: stream.revenueType,
    status: stream.status,
    monthlyIncomeEstimate: stream.monthlyIncomeEstimate,
    updatedAt: stream.updatedAt ? new Date(stream.updatedAt).getTime() : 0
  }));
  renderAccountWorkspace();
  renderAccountDirectory();
}

async function loadLatestCallReports() {
  if (!selectors.accountDirectoryBody && !selectors.quotesDirectoryBody) return;

  try {
    const data = await request('/api/call-reports/latest');
    appState.latestCallReports = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(error);
    appState.latestCallReports = [];
  }

  renderAccountDirectory();
  renderQuotesDirectory();
}

async function loadCallReports(creditUnionId) {
  if (!selectors.callReportList) {
    return;
  }

  if (!creditUnionId) {
    appState.callReports = [];
    renderCallReports();
    return;
  }

  try {
    const data = await request(`/api/credit-unions/${creditUnionId}/call-reports`);
    appState.callReports = sortCallReports(Array.isArray(data) ? data : []);
  } catch (error) {
    appState.callReports = [];
    setCallReportFeedback(error.message, 'error');
  }

  renderCallReports();
}

async function uploadCallReport(file, creditUnionId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('creditUnionId', creditUnionId);

  const response = await fetch('/api/call-reports', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    let message = `Upload failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch (_error) {
      // Ignore JSON parsing errors and fall back to the generic message.
    }
    throw new Error(message);
  }

  return response.json();
}

async function deleteCallReport(reportId) {
  const response = await fetch(`/api/call-reports/${reportId}`, { method: 'DELETE' });

  if (!response.ok) {
    let message = `Delete failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch (_error) {
      // Ignore JSON parsing errors and fall back to the generic message.
    }
    throw new Error(message);
  }
}

async function createCreditUnion(name) {
  const result = await request('/api/credit-unions', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
  appState.creditUnions.push({
    id: result.id,
    name: result.name,
    classification: normalizeClassification(result.classification)
  });
  appState.accountSelectionId = result.id;
  renderCreditUnionOptions();
  if (selectors.accountCreditUnionSelect) {
    selectors.accountCreditUnionSelect.value = result.id;
  }
}

async function updateCreditUnionClassification(creditUnionId, classification) {
  const normalizedClassification = normalizeClassification(classification);
  const result = await request(`/api/credit-unions/${encodeURIComponent(creditUnionId)}/classification`, {
    method: 'PATCH',
    body: JSON.stringify({ classification: normalizedClassification })
  });

  const target = appState.creditUnions.find((creditUnion) => creditUnion.id === creditUnionId);
  if (target) {
    target.classification = normalizeClassification(result.classification);
  }

  return normalizeClassification(result.classification);
}

async function createIncomeStream(payload) {
  const result = await request('/api/income-streams', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const normalizedStream = {
    id: result.id,
    label: result.label,
    creditUnionId: result.creditUnionId,
    creditUnionName: result.creditUnionName,
    product: result.product,
    revenueType: result.revenueType,
    status: result.status,
    monthlyIncomeEstimate: result.monthlyIncomeEstimate,
    updatedAt: result.updatedAt ? new Date(result.updatedAt).getTime() : Date.now(),
    pendingCount: Number(result.pendingCount ?? 0),
    reportedCount: Number(result.reportedCount ?? 0),
    firstReport: result.firstReport
      ? {
          year: result.firstReport.year,
          month: result.firstReport.month,
          key: result.firstReport.key,
          label: result.firstReport.label
        }
      : null,
    lastReport: null
  };

  if (result.status === 'prospect') {
    appState.prospectStreams.push(normalizedStream);
  } else {
    appState.incomeStreams.push(normalizedStream);
    renderIncomeStreamList();
    renderProspectAccountList();
    if (selectors.revenueStreamSelect) {
      selectors.revenueStreamSelect.value = result.id;
    }
  }

  renderCreditUnionOptions();
}

async function updateProspectEstimate(streamId, monthlyIncomeEstimate) {
  const result = await request(`/api/income-streams/${streamId}/estimate`, {
    method: 'PATCH',
    body: JSON.stringify({ monthlyIncomeEstimate })
  });

  const targetIndex = appState.prospectStreams.findIndex((stream) => stream.id === streamId);
  if (targetIndex >= 0) {
    appState.prospectStreams[targetIndex] = {
      ...appState.prospectStreams[targetIndex],
      monthlyIncomeEstimate: result.monthlyIncomeEstimate,
      updatedAt: result.updatedAt ? new Date(result.updatedAt).getTime() : Date.now()
    };
    renderAccountWorkspace();
  }
}

async function activateProspectStream(streamId, options = {}) {
  const payload = {};
  if (options.firstReportMonth) {
    payload.firstReportMonth = options.firstReportMonth;
  }
  const result = await request(`/api/income-streams/${streamId}/activate`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });

  appState.prospectStreams = appState.prospectStreams.filter((stream) => stream.id !== streamId);

  appState.incomeStreams.push({
    id: result.id,
    label: result.label,
    creditUnionId: result.creditUnionId,
    creditUnionName: result.creditUnionName,
    product: result.product,
    revenueType: result.revenueType,
    status: result.status,
    monthlyIncomeEstimate: result.monthlyIncomeEstimate,
    updatedAt: result.updatedAt ? new Date(result.updatedAt).getTime() : Date.now(),
    pendingCount: Number(result.pendingCount ?? 0),
    reportedCount: Number(result.reportedCount ?? 0),
    firstReport: result.firstReport
      ? {
          year: result.firstReport.year,
          month: result.firstReport.month,
          key: result.firstReport.key,
          label: result.firstReport.label
        }
      : null,
    lastReport: null
  });

  renderIncomeStreamList();
  renderCreditUnionOptions();
}

async function saveRevenueEntry(payload) {
  await request('/api/revenue', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function cancelIncomeStream(streamId, finalMonth) {
  return request(`/api/income-streams/${streamId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ finalMonth })
  });
}

async function updateIncomeStreamStart(streamId, firstReportMonth) {
  return request(`/api/income-streams/${streamId}/start`, {
    method: 'PATCH',
    body: JSON.stringify({ firstReportMonth })
  });
}

async function loadMonthlyCompletion(params = {}) {
  if (!selectors.monthlyCompletionBody) {
    return;
  }

  const searchParams = new URLSearchParams();
  if (params.start) searchParams.set('start', params.start);
  if (params.end) searchParams.set('end', params.end);
  const creditUnionId = params.creditUnionId ?? appState.selectedCreditUnion;
  if (creditUnionId && creditUnionId !== 'all') {
    searchParams.set('creditUnionId', creditUnionId);
  }

  const query = searchParams.toString();
  let data;
  try {
    data = await request(`/api/reports/completion${query ? `?${query}` : ''}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load monthly completion.';
    if (selectors.monthlyCompletionBody) {
      const body = selectors.monthlyCompletionBody;
      body.replaceChildren();
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      const columnCount = selectors.monthlyCompletionTable?.querySelectorAll('thead th').length || 3;
      cell.colSpan = columnCount;
      cell.textContent = message;
      row.append(cell);
      body.append(row);
    }
    throw error;
  }
  const months = Array.isArray(data?.months) ? data.months : [];
  appState.monthlyCompletion = months;
  renderMonthlyCompletion();
}

async function loadMonthlyDetail(monthKey, creditUnionId) {
  if (!selectors.monthlyDetailBody || !monthKey) {
    return;
  }

  const searchParams = new URLSearchParams();
  if (creditUnionId && creditUnionId !== 'all') {
    searchParams.set('creditUnionId', creditUnionId);
  }

  const query = searchParams.toString();
  const data = await request(`/api/reports/monthly/${monthKey}${query ? `?${query}` : ''}`);
  const creditUnionName = getCreditUnionNameById(creditUnionId) || appState.detailCreditUnionName || null;
  renderMonthlyDetail(data, { monthKey, creditUnionId, creditUnionName });
}

async function loadMissingUpdates(params = {}) {
  if (!selectors.missingBody) return;

  if (selectors.missingFeedback) {
    setFeedback(selectors.missingFeedback, '', 'info');
  }

  const searchParams = new URLSearchParams();
  const month = params.month ?? appState.missingFilters.month;
  const revenueType = params.revenueType ?? appState.missingFilters.revenueType;

  if (month) {
    searchParams.set('month', month);
  }
  if (revenueType && revenueType !== 'all') {
    searchParams.set('revenueType', revenueType);
  }

  const query = searchParams.toString();
  const data = await request(`/api/reports/missing${query ? `?${query}` : ''}`);
  appState.missingUpdates = Array.isArray(data?.items) ? data.items : [];
  appState.missingFilters = {
    month: month ?? data?.month?.key ?? null,
    revenueType: revenueType ?? data?.revenueType ?? 'all'
  };
  renderMissingUpdates(data);
}

async function loadSummary(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.start) searchParams.set('start', params.start);
  if (params.end) searchParams.set('end', params.end);
  const creditUnionId = params.creditUnionId ?? appState.selectedCreditUnion;
  if (creditUnionId && creditUnionId !== 'all') {
    searchParams.set('creditUnionId', creditUnionId);
  }
  const query = searchParams.toString();
  const data = await request(`/api/reports/summary${query ? `?${query}` : ''}`);
  appState.summary = data;
  renderSummary();

  if (selectors.monthlyCompletionBody) {
    try {
      await loadMonthlyCompletion({ start: params.start, end: params.end, creditUnionId });
    } catch (error) {
      console.error(error);
    }
  }
}

function renderSummary() {
  const summary = appState.summary;
  if (!summary) return;

  if (selectors.totalRevenue) {
    selectors.totalRevenue.textContent = currencyFormatter.format(summary.totalRevenue || 0);
  }

  if (selectors.topCreditUnion) {
    if (summary.byCreditUnion?.length) {
      selectors.topCreditUnion.textContent = `${summary.byCreditUnion[0].name} (${currencyFormatter.format(
        summary.byCreditUnion[0].amount
      )})`;
    } else {
      selectors.topCreditUnion.textContent = 'Waiting for data';
    }
  }

  if (selectors.topProduct) {
    if (summary.byProduct?.length) {
      selectors.topProduct.textContent = `${summary.byProduct[0].name} (${currencyFormatter.format(
        summary.byProduct[0].amount
      )})`;
    } else {
      selectors.topProduct.textContent = 'Waiting for data';
    }
  }

  const creditUnionRows = Array.isArray(summary.byCreditUnion)
    ? summary.byCreditUnion.map((row) => ({
        ...row,
        href: row.id ? buildCreditUnionDetailUrl(row.id, row.name) : null
      }))
    : [];

  renderSummaryTable(selectors.creditUnionSummary, creditUnionRows);
  renderSummaryTable(selectors.productSummary, summary.byProduct);
  renderSummaryTable(selectors.typeSummary, summary.byRevenueType);
  renderTimeline(summary.timeline || []);

  if (selectors.timelineSubtitle) {
    if (appState.selectedCreditUnion && appState.selectedCreditUnion !== 'all') {
      const creditUnionName =
        appState.creditUnions.find((creditUnion) => creditUnion.id === appState.selectedCreditUnion)?.name ||
        'selected credit union';
      selectors.timelineSubtitle.textContent = `Monthly totals for ${creditUnionName}`;
    } else {
      selectors.timelineSubtitle.textContent = 'Monthly totals across all income streams';
    }
  }
}

function renderMissingUpdates(payload) {
  if (!selectors.missingBody) return;

  const totalMissing = Number(payload?.totalMissing ?? 0);
  if (selectors.missingTotal) {
    selectors.missingTotal.textContent = totalMissing.toLocaleString();
  }

  const monthLabel =
    payload?.month?.label || (appState.missingFilters.month ? formatMonthLabelFromKey(appState.missingFilters.month) : null);
  const revenueType = payload?.revenueType ?? appState.missingFilters.revenueType ?? 'all';
  const summaryTextParts = [];
  if (payload?.items?.length) {
    summaryTextParts.push(`${payload.items.length} missing update${payload.items.length === 1 ? '' : 's'}`);
  }
  if (monthLabel) {
    summaryTextParts.push(`for ${monthLabel}`);
  }
  if (revenueType && revenueType !== 'all') {
    summaryTextParts.push(`(${revenueType})`);
  }
  if (selectors.missingSummary) {
    selectors.missingSummary.textContent = summaryTextParts.length
      ? summaryTextParts.join(' ')
      : 'Select a month to list missing revenue entries.';
  }

  const body = selectors.missingBody;
  body.replaceChildren();

  const items = Array.isArray(payload?.items) ? payload.items : [];
  const shouldShowTable = items.length > 0;
  if (selectors.missingEmptyState) {
    selectors.missingEmptyState.hidden = shouldShowTable;
  }

  if (!shouldShowTable) {
    return;
  }

  const fragment = document.createDocumentFragment();
  items.forEach((item) => {
    const row = document.createElement('tr');
    row.dataset.streamId = item.incomeStreamId;
    row.dataset.year = item.year;
    row.dataset.month = item.month;

    const creditUnionCell = document.createElement('td');
    creditUnionCell.textContent = item.creditUnionName || 'Unknown credit union';

    const productCell = document.createElement('td');
    productCell.textContent = `${item.product ?? 'Unknown product'} (${item.revenueType ?? 'Type'})`;

    const monthCell = document.createElement('td');
    monthCell.textContent = formatMonthLabelFromKey(`${item.year}-${String(item.month).padStart(2, '0')}`) ??
      `${item.year}-${String(item.month).padStart(2, '0')}`;

    const amountCell = document.createElement('td');
    amountCell.className = 'numeric';
    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.name = 'amount';
    amountInput.step = '0.01';
    amountInput.inputMode = 'decimal';
    amountInput.placeholder = '0.00';
    amountInput.dataset.streamId = item.incomeStreamId;
    amountInput.dataset.year = item.year;
    amountInput.dataset.month = item.month;
    amountInput.className = 'table-input';
    amountCell.append(amountInput);

    const actionCell = document.createElement('td');
    actionCell.className = 'numeric';
    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.className = 'primary-button';
    submitButton.dataset.action = 'submit-missing';
    submitButton.textContent = 'Save';
    actionCell.append(submitButton);

    row.append(creditUnionCell, productCell, monthCell, amountCell, actionCell);
    fragment.append(row);
  });

  body.append(fragment);
}

function renderMonthlyCompletion() {
  const body = selectors.monthlyCompletionBody;
  if (!body) return;

  body.replaceChildren();
  const months = Array.isArray(appState.monthlyCompletion) ? appState.monthlyCompletion : [];

  if (!months.length) {
    const emptyRow = document.createElement('tr');
    const cell = document.createElement('td');
    const columnCount = selectors.monthlyCompletionTable?.querySelectorAll('thead th').length || 3;
    cell.colSpan = columnCount;
    cell.textContent = 'No reporting requirements in this window yet.';
    emptyRow.append(cell);
    body.append(emptyRow);
    return;
  }

  months.forEach((month) => {
    const row = document.createElement('tr');
    const totalActive = Number(month.totalActiveStreams ?? 0);
    const completed = Number(month.completedStreams ?? 0);

    if (totalActive > 0 && completed === totalActive) {
      row.dataset.state = 'complete';
    }

    const monthCell = document.createElement('td');
    const link = document.createElement('a');
    const monthLabel = month.label ?? month.key;
    link.href = buildMonthlyDetailUrl(month.key);
    link.textContent = monthLabel;
    link.className = 'table-link';
    link.setAttribute('aria-label', `View monthly totals for ${monthLabel}`);
    monthCell.append(link);

    const reportedCell = document.createElement('td');
    reportedCell.className = 'numeric';
    reportedCell.textContent = totalActive > 0 ? `${completed} of ${totalActive} active` : '0 of 0 active';

    const completionCell = document.createElement('td');
    completionCell.className = 'numeric';
    if (totalActive > 0) {
      const percent = Math.round(Number(month.completionRate ?? 0));
      completionCell.textContent = `${percent}%`;
    } else {
      completionCell.textContent = '—';
    }

    const totalRevenueCell = document.createElement('td');
    totalRevenueCell.className = 'numeric';
    const revenueAmount = Number(month.totalRevenue ?? 0);
    totalRevenueCell.textContent = currencyFormatter.format(revenueAmount);

    row.append(monthCell, reportedCell, completionCell, totalRevenueCell);
    body.append(row);
  });
}

function renderMonthlyDetail(data, options = {}) {
  const body = selectors.monthlyDetailBody;
  if (!body) return;

  const monthKey = data?.month?.key || options.monthKey || null;
  const monthLabel = data?.month?.label || (monthKey ? formatMonthLabelFromKey(monthKey) : null);
  const creditUnionName =
    options.creditUnionName || getCreditUnionNameById(options.creditUnionId) || appState.detailCreditUnionName || null;

  if (selectors.monthlyDetailMonth) {
    selectors.monthlyDetailMonth.textContent = monthLabel || 'Select a month to view totals';
  }

  if (selectors.monthlyDetailDescription) {
    const baseText =
      selectors.monthlyDetailDescription.dataset.baseText ||
      selectors.monthlyDetailDescription.textContent ||
      'Choose a month from the Monthly Totals view to load the income stream breakdown.';
    selectors.monthlyDetailDescription.dataset.baseText = baseText;

    if (monthLabel) {
      const creditUnionPart = creditUnionName ? ` for ${creditUnionName}` : '';
      selectors.monthlyDetailDescription.textContent = `Showing revenue totals${creditUnionPart} for ${monthLabel}.`;
    } else {
      selectors.monthlyDetailDescription.textContent = baseText;
    }
  }

  body.replaceChildren();
  const streams = Array.isArray(data?.streams) ? data.streams : [];
  const hasError = Boolean(options.error);

  if (hasError || !streams.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 2;
    cell.textContent = options.error
      ? options.error
      : monthLabel
      ? 'No revenue has been recorded for this month yet.'
      : 'Select a month from the Monthly Totals view to get started.';
    row.append(cell);
    body.append(row);
  } else {
    streams.forEach((stream) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const amountCell = document.createElement('td');
      nameCell.textContent = stream.name;
      amountCell.className = 'numeric';
      amountCell.textContent = currencyFormatter.format(stream.amount ?? 0);
      row.append(nameCell, amountCell);
      body.append(row);
    });
  }

  if (selectors.monthlyDetailSummary) {
    if (hasError) {
      selectors.monthlyDetailSummary.textContent = options.error;
    } else if (streams.length) {
      const totalAmount = streams.reduce((sum, stream) => sum + Number(stream.amount ?? 0), 0);
      const streamCountLabel = `${streams.length} income stream${streams.length === 1 ? '' : 's'}`;
      const prefix = creditUnionName ? `${creditUnionName} · ` : '';
      selectors.monthlyDetailSummary.textContent = `${prefix}${streamCountLabel} · Total ${currencyFormatter.format(
        totalAmount
      )}`;
    } else if (monthLabel) {
      selectors.monthlyDetailSummary.textContent = 'No revenue logged for this month yet.';
    } else {
      selectors.monthlyDetailSummary.textContent = '';
    }
  }
}

function renderSummaryTable(container, rows = []) {
  if (!container) return;
  container.replaceChildren();

  if (!rows.length) {
    const emptyRow = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 2;
    cell.textContent = 'No data yet';
    emptyRow.append(cell);
    container.append(emptyRow);
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    const nameCell = document.createElement('td');
    const valueCell = document.createElement('td');
    if (row.href) {
      const link = document.createElement('a');
      link.href = row.href;
      link.className = 'table-link';
      link.textContent = row.name;
      link.setAttribute('aria-label', `View income streams for ${row.name}`);
      nameCell.append(link);
    } else {
      nameCell.textContent = row.name;
    }
    valueCell.textContent = currencyFormatter.format(row.amount);
    valueCell.className = 'numeric';
    tr.append(nameCell, valueCell);
    container.append(tr);
  });
}

function renderCreditUnionDetail(data, options = {}) {
  const { creditUnionName: fallbackName = null, start = null, end = null, error = null } = options;
  appState.creditUnionDetail = data ?? null;

  const summaryElement = selectors.creditUnionDetailSummary;
  const nameElement = selectors.creditUnionDetailName;
  const windowElement = selectors.creditUnionDetailWindow;
  const totalElement = selectors.creditUnionTotalRevenue;
  const streamsBody = selectors.creditUnionStreamsBody;
  const streamsSummary = selectors.creditUnionStreamsSummary;

  const resolvedName = data?.creditUnion?.name ?? fallbackName ?? 'Select a credit union';
  const totalRevenue = Number(data?.totalRevenue ?? 0);
  const streams = Array.isArray(data?.streams) ? data.streams : [];
  const reportingWindow = data?.reportingWindow ?? {};
  const resolvedStart = reportingWindow.start ?? start ?? null;
  const resolvedEnd = reportingWindow.end ?? end ?? null;

  if (data?.creditUnion?.name) {
    appState.detailCreditUnionName = data.creditUnion.name;
  } else if (fallbackName) {
    appState.detailCreditUnionName = fallbackName;
  }
  appState.detailStart = resolvedStart;
  appState.detailEnd = resolvedEnd;

  if (summaryElement) {
    if (error) {
      summaryElement.textContent = error;
    } else if (data) {
      summaryElement.textContent = 'Every income stream tied to this credit union is listed below.';
    } else {
      summaryElement.textContent =
        'Choose a credit union from the Reporting view to load revenue totals by income stream.';
    }
  }

  if (nameElement) {
    nameElement.textContent = resolvedName;
  }

  if (totalElement) {
    totalElement.textContent = currencyFormatter.format(totalRevenue);
  }

  if (windowElement) {
    const startLabel = resolvedStart ? formatMonthLabelFromKey(resolvedStart) : null;
    const endLabel = resolvedEnd ? formatMonthLabelFromKey(resolvedEnd) : null;
    let windowLabel = 'All recorded months';
    if (startLabel && endLabel) {
      windowLabel = `${startLabel} – ${endLabel}`;
    } else if (startLabel) {
      windowLabel = `Since ${startLabel}`;
    } else if (endLabel) {
      windowLabel = `Through ${endLabel}`;
    }
    windowElement.textContent = windowLabel;
  }

  if (streamsSummary) {
    if (error) {
      streamsSummary.textContent = 'Unable to load income streams for this credit union.';
    } else if (!data) {
      streamsSummary.textContent = 'Income streams will appear once you open this page from the Reporting table.';
    } else if (!streams.length) {
      streamsSummary.textContent = 'No income streams have been created for this credit union yet.';
    } else {
      streamsSummary.textContent =
        'Revenue totals reflect the selected reporting window for every income stream tied to this credit union.';
    }
  }

  if (streamsBody) {
    streamsBody.replaceChildren();

    if (!data) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = error
        ? 'We could not load the credit union revenue breakdown.'
        : 'Select a credit union from the Reporting tab to view its income streams.';
      row.append(cell);
      streamsBody.append(row);
      return;
    }

    if (!streams.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = 'No income streams found for this credit union yet.';
      row.append(cell);
      streamsBody.append(row);
      return;
    }

    streams.forEach((stream) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const amountCell = document.createElement('td');
      const percentCell = document.createElement('td');

      const labelSegments = [stream.product, stream.revenueType].filter(Boolean);
      const label = labelSegments.join(' · ');
      const link = document.createElement('a');
      link.href = `stream.html?id=${encodeURIComponent(stream.id)}`;
      link.className = 'table-link';
      link.textContent = label || 'Income stream';
      link.setAttribute(
        'aria-label',
        `View reporting history for ${label || 'this income stream'}`
      );
      nameCell.append(link);

      const amount = Number(stream.amount ?? 0);
      amountCell.textContent = currencyFormatter.format(amount);
      amountCell.className = 'numeric';

      percentCell.className = 'numeric';
      if (totalRevenue > 0 && amount > 0) {
        const percentage = (amount / totalRevenue) * 100;
        percentCell.textContent = `${percentage.toFixed(1)}%`;
      } else {
        percentCell.textContent = '0.0%';
      }

      row.append(nameCell, amountCell, percentCell);
      streamsBody.append(row);
    });
  }
}

async function loadCreditUnionRevenueDetail(creditUnionId, options = {}) {
  if (!creditUnionId) {
    renderCreditUnionDetail(null, options);
    return;
  }

  const params = new URLSearchParams();
  if (options.start) {
    params.set('start', options.start);
  }
  if (options.end) {
    params.set('end', options.end);
  }

  const query = params.toString();
  const data = await request(
    `/api/reports/credit-union/${encodeURIComponent(creditUnionId)}${query ? `?${query}` : ''}`
  );

  const creditUnionName = data?.creditUnion?.name ?? options.creditUnionName ?? null;
  renderCreditUnionDetail(data, {
    ...options,
    creditUnionName,
    start: options.start,
    end: options.end
  });
}

function renderLineChart(svg, data = [], options = {}) {
  if (!svg) return;

  const {
    emptyMessage = 'No data available',
    valueKey = 'amount',
    width = 800,
    height = 240,
    padding = 40,
    lineColor = 'rgba(79, 195, 247, 0.9)',
    areaColor = 'rgba(79, 195, 247, 0.16)'
  } = options;

  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  if (!Array.isArray(data) || !data.length) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '50%');
    text.setAttribute('y', '50%');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--text-secondary)');
    text.setAttribute('font-size', '18');
    text.textContent = emptyMessage;
    svg.append(text);
    return;
  }

  const normalized = data.map((entry) => {
    const rawValue = Number(entry?.[valueKey]);
    const value = Number.isFinite(rawValue) ? rawValue : 0;
    return {
      key: entry?.key ?? null,
      label: entry?.label ?? (entry?.key ?? ''),
      value
    };
  });

  const values = normalized.map((item) => item.value);
  const maxAmount = Math.max(...values);
  const minAmount = Math.min(...values);
  const range = maxAmount === minAmount ? Math.abs(maxAmount) || 1 : maxAmount - minAmount;
  const horizontalSteps = Math.max(normalized.length - 1, 1);

  const points = normalized.map((entry, index) => {
    const x = padding + (index / horizontalSteps) * (width - padding * 2);
    const y = height - padding - ((entry.value - minAmount) / range) * (height - padding * 2);
    return { x, y, label: entry.label, value: entry.value };
  });

  const axis = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  axis.setAttribute('d', `M ${padding} ${height - padding} H ${width - padding}`);
  axis.setAttribute('stroke', 'rgba(255,255,255,0.25)');
  axis.setAttribute('stroke-width', '1.5');
  axis.setAttribute('fill', 'none');
  svg.append(axis);

  const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const areaPoints = [
    `M ${padding} ${height - padding}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${width - padding} ${height - padding}`,
    'Z'
  ].join(' ');
  areaPath.setAttribute('d', areaPoints);
  areaPath.setAttribute('fill', areaColor);
  svg.append(areaPath);

  const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const lineCommands = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  linePath.setAttribute('d', lineCommands);
  linePath.setAttribute('stroke', lineColor);
  linePath.setAttribute('stroke-width', '3');
  linePath.setAttribute('fill', 'none');
  svg.append(linePath);

  points.forEach((point) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', point.x);
    dot.setAttribute('cy', point.y);
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', 'var(--accent)');
    svg.append(dot);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', point.x);
    label.setAttribute('y', height - padding + 20);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', 'var(--text-secondary)');
    label.setAttribute('font-size', '11');
    label.textContent = point.label;
    svg.append(label);
  });
}

function renderTimeline(timeline) {
  if (!selectors.timelineChart) return;
  renderLineChart(selectors.timelineChart, timeline, {
    emptyMessage: 'No revenue recorded for this period'
  });
}

function renderStreamPerformance(months = []) {
  const chart = selectors.streamPerformanceChart;
  const summary = selectors.streamPerformanceSummary;

  if (!chart && !summary) {
    return;
  }

  const dataset = Array.isArray(months)
    ? months.map((month) => {
        const hasAmount = month.amount !== null && month.amount !== undefined;
        const amount = hasAmount ? Number(month.amount) : 0;
        return {
          key: month.key,
          label: month.label,
          amount: Number.isFinite(amount) ? amount : 0,
          completed: Boolean(month.completed),
          hasAmount
        };
      })
    : [];

  const hasRecordedData = dataset.some((month) => month.hasAmount);

  if (chart) {
    const chartData = hasRecordedData ? dataset : [];
    renderLineChart(chart, chartData, {
      emptyMessage: 'Monthly revenue will appear once amounts are recorded.'
    });
  }

  if (summary) {
    if (!dataset.length) {
      summary.textContent = 'No reporting requirements found for this income stream yet.';
      return;
    }

    if (!hasRecordedData) {
      summary.textContent = 'Revenue has not been recorded for any months yet.';
      return;
    }

    const recordedMonths = dataset.filter((month) => month.hasAmount);

    const totalAmount = recordedMonths.reduce((sum, month) => sum + month.amount, 0);
    const pendingCount = dataset.length - recordedMonths.length;
    let message = `${recordedMonths.length} recorded month${
      recordedMonths.length === 1 ? '' : 's'
    } · Total ${currencyFormatter.format(totalAmount)}.`;

    if (pendingCount > 0) {
      message += ` ${pendingCount} month${pendingCount === 1 ? '' : 's'} awaiting numbers.`;
    }

    summary.textContent = message;
  }
}

selectors.addCreditUnionBtn?.addEventListener('click', () => {
  selectors.creditUnionNameInput.value = '';
  showDialog(selectors.creditUnionDialog);
  setTimeout(() => selectors.creditUnionNameInput?.focus(), 75);
});

selectors.closeCreditUnionDialogBtn?.addEventListener('click', () => {
  closeDialog(selectors.creditUnionDialog);
});

selectors.creditUnionForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = selectors.creditUnionNameInput.value.trim();
  if (!name) return;
  try {
    await createCreditUnion(name);
    closeDialog(selectors.creditUnionDialog);
  } catch (error) {
    alert(error.message);
  }
});

selectors.updateStartMonthBtn?.addEventListener('click', () => {
  if (!selectors.updateStartMonthDialog || !selectors.updateStartMonthInput) return;
  const startKey = appState.currentStreamDetail?.firstReport?.key || REPORTING_START_PERIOD;
  selectors.updateStartMonthInput.value = startKey;
  selectors.updateStartMonthInput.min = REPORTING_START_PERIOD;
  selectors.updateStartMonthInput.max = getCurrentPeriodValue();

  if (selectors.updateStartMonthMessage) {
    setFeedback(selectors.updateStartMonthMessage, '', 'info');
  }

  showDialog(selectors.updateStartMonthDialog);
  setTimeout(() => selectors.updateStartMonthInput?.focus(), 75);
});

selectors.closeUpdateStartMonthDialogBtn?.addEventListener('click', () => {
  closeDialog(selectors.updateStartMonthDialog);
});

selectors.updateStartMonthDialog?.addEventListener('close', () => {
  if (selectors.updateStartMonthMessage) {
    setFeedback(selectors.updateStartMonthMessage, '', 'info');
  }
});

selectors.cancelStreamBtn?.addEventListener('click', () => {
  if (!appState.currentStreamId || !selectors.cancelStreamDialog) return;

  if (selectors.cancelStreamMessage) {
    setFeedback(selectors.cancelStreamMessage, '', 'info');
  }

  if (selectors.cancelStreamInput) {
    selectors.cancelStreamInput.min = REPORTING_START_PERIOD;
    selectors.cancelStreamInput.max = getCurrentPeriodValue();

    const finalReport = appState.currentStreamDetail?.finalReport;
    if (finalReport?.year && finalReport?.month) {
      selectors.cancelStreamInput.value = formatPeriodValue(finalReport.year, finalReport.month);
    } else {
      const lastMonth = appState.currentStreamMonths[appState.currentStreamMonths.length - 1];
      if (lastMonth?.year && lastMonth?.month) {
        selectors.cancelStreamInput.value = formatPeriodValue(lastMonth.year, lastMonth.month);
      } else {
        selectors.cancelStreamInput.value = '';
      }
    }
  }

  showDialog(selectors.cancelStreamDialog);
  setTimeout(() => selectors.cancelStreamInput?.focus(), 75);
});

selectors.closeCancelStreamDialogBtn?.addEventListener('click', () => {
  closeDialog(selectors.cancelStreamDialog);
});

selectors.cancelStreamDialog?.addEventListener('close', () => {
  if (selectors.cancelStreamMessage) {
    setFeedback(selectors.cancelStreamMessage, '', 'info');
  }
});

selectors.openCallReportBtn?.addEventListener('click', () => {
  showDialog(selectors.callReportDialog);
});

selectors.closeCallReportDialogBtn?.addEventListener('click', () => {
  closeDialog(selectors.callReportDialog);
});

selectors.openMenuPricingBtn?.addEventListener('click', () => {
  showDialog(selectors.menuPricingDialog);
});

selectors.closeMenuPricingDialogBtn?.addEventListener('click', () => {
  closeDialog(selectors.menuPricingDialog);
});

selectors.openAccountChangeLogBtn?.addEventListener('click', () => {
  showDialog(selectors.accountChangeLogDialog);
});

selectors.closeAccountChangeLogDialogBtn?.addEventListener('click', () => {
  closeDialog(selectors.accountChangeLogDialog);
});

selectors.openAccountNotesBtn?.addEventListener('click', () => {
  showDialog(selectors.accountNotesDialog);
  setTimeout(() => selectors.accountNotesAuthor?.focus(), 75);
});

selectors.closeAccountNotesDialogBtn?.addEventListener('click', () => {
  closeDialog(selectors.accountNotesDialog);
});

selectors.accountNotesDialog?.addEventListener('close', () => {
  if (selectors.accountNotesFeedback) {
    setFeedback(selectors.accountNotesFeedback, '', 'info');
  }
});

selectors.updateStartMonthForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!appState.currentStreamId || !selectors.updateStartMonthInput) return;

  const firstReportMonth = selectors.updateStartMonthInput.value;
  if (!firstReportMonth) {
    if (selectors.updateStartMonthMessage) {
      setFeedback(selectors.updateStartMonthMessage, 'Select the month when reporting starts.', 'error');
    }
    return;
  }

  try {
    const result = await updateIncomeStreamStart(appState.currentStreamId, firstReportMonth);
    renderStreamOverview(result);
    await Promise.all([
      loadIncomeStreamReportingStatus(appState.currentStreamId),
      loadIncomeStreams()
    ]);
    closeDialog(selectors.updateStartMonthDialog);
  } catch (error) {
    if (selectors.updateStartMonthMessage) {
      setFeedback(selectors.updateStartMonthMessage, error.message, 'error');
    } else {
      alert(error.message);
    }
  }
});

selectors.cancelStreamForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!appState.currentStreamId || !selectors.cancelStreamInput) return;

  const finalMonth = selectors.cancelStreamInput.value;
  if (!finalMonth) {
    if (selectors.cancelStreamMessage) {
      setFeedback(selectors.cancelStreamMessage, 'Select the month when reporting ends.', 'error');
    }
    return;
  }

  try {
    const result = await cancelIncomeStream(appState.currentStreamId, finalMonth);
    renderStreamOverview(result);
    await Promise.all([
      loadIncomeStreamReportingStatus(appState.currentStreamId),
      loadIncomeStreams()
    ]);
    closeDialog(selectors.cancelStreamDialog);
  } catch (error) {
    if (selectors.cancelStreamMessage) {
      setFeedback(selectors.cancelStreamMessage, error.message, 'error');
    } else {
      alert(error.message);
    }
  }
});

selectors.reportingStatusGrid?.addEventListener('click', handleStatusCardActivation);
selectors.reportingStatusGrid?.addEventListener('keydown', handleStatusCardActivation);

selectors.closeEditRevenueDialogBtn?.addEventListener('click', () => {
  appState.editingPeriod = null;
  closeDialog(selectors.editRevenueDialog);
});

selectors.editRevenueDialog?.addEventListener('close', () => {
  appState.editingPeriod = null;
  if (selectors.editRevenueFeedback) {
    setFeedback(selectors.editRevenueFeedback, '', 'info');
  }
  if (selectors.editRevenueAmountInput) {
    selectors.editRevenueAmountInput.value = '';
  }
});

selectors.editRevenueForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!appState.currentStreamId || !appState.editingPeriod || !selectors.editRevenueAmountInput) {
    return;
  }

  const rawAmount = selectors.editRevenueAmountInput.value.trim();
  if (!rawAmount) {
    if (selectors.editRevenueFeedback) {
      setFeedback(selectors.editRevenueFeedback, 'Enter an amount to save.', 'error');
    }
    return;
  }

  const amount = Number(rawAmount);
  if (!Number.isFinite(amount)) {
    if (selectors.editRevenueFeedback) {
      setFeedback(selectors.editRevenueFeedback, 'Amount must be a valid number.', 'error');
    }
    return;
  }

  try {
    await saveRevenueEntry({
      incomeStreamId: appState.currentStreamId,
      year: appState.editingPeriod.year,
      month: appState.editingPeriod.month,
      amount
    });

    closeDialog(selectors.editRevenueDialog);
    appState.editingPeriod = null;
    await loadIncomeStreamDetail(appState.currentStreamId);
    await loadIncomeStreamReportingStatus(appState.currentStreamId);
    await loadIncomeStreams();
  } catch (error) {
    if (selectors.editRevenueFeedback) {
      setFeedback(selectors.editRevenueFeedback, error.message, 'error');
    } else {
      alert(error.message);
    }
  }
});

selectors.accountCreditUnionSelect?.addEventListener('change', async (event) => {
  appState.accountSelectionId = event.currentTarget.value || null;
  appState.loanIllustrationEditingId = null;
  setLoanIllustrationSaveStatus('', 'info');
  renderAccountWorkspace();
  renderQuotesWorkspace();
  try {
    await Promise.all([
      loadCallReports(appState.accountSelectionId),
      appState.accountSelectionId ? loadLoanEntries(appState.accountSelectionId) : Promise.resolve(),
      appState.accountSelectionId ? loadLoanIllustrations(appState.accountSelectionId) : Promise.resolve()
    ]);
    renderLoanLog();
    renderLoanIllustrationHistory();
  } catch (error) {
    setCallReportFeedback(error.message, 'error');
  }
});

[
  selectors.loanAmountInput,
  selectors.loanTermInput,
  selectors.loanAprInput,
  selectors.loanMilesInput,
  selectors.loanVinInput,
  selectors.loanWarrantyCostInput,
  selectors.loanGapCostInput,
  selectors.loanGapCreditUnionMarkupInput,
  selectors.loanGapGfsMarkupInput,
  selectors.loanVscTermExtensionInput,
  selectors.loanGapTermExtensionInput,
].forEach((element) => {
  element?.addEventListener('input', () => {
    updateLoanIllustration();
  });
});

[
  selectors.coverageRequestMemberName,
  selectors.coverageRequestPhone,
  selectors.coverageRequestEmail
].forEach((element) => {
  element?.addEventListener('input', () => {
    updateCoverageRequestAvailability();
  });
});

[
  selectors.personalLoanAmountInput,
  selectors.personalLoanTermInput,
  selectors.personalLoanAprInput
].forEach((element) => {
  element?.addEventListener('input', () => {
    updatePersonalLoanIllustration();
  });
});

[
  selectors.mobBlendedLifeRateInput,
  selectors.mobBlendedDisabilityRateInput,
  selectors.mobSingleLifeRateInput,
  selectors.mobJointLifeRateInput,
  selectors.mobSingleDisabilityRateInput,
  selectors.mobJointDisabilityRateInput,
  selectors.mobPackageARateInput,
  selectors.mobPackageBRateInput,
  selectors.mobPackageCRateInput,
  selectors.mobPackageASingleRateInput,
  selectors.mobPackageAJointRateInput,
  selectors.mobPackageBSingleRateInput,
  selectors.mobPackageBJointRateInput,
  selectors.mobPackageCSingleRateInput,
  selectors.mobPackageCJointRateInput
].forEach((element) => {
  element?.addEventListener('input', () => {
    handleMobConfigChange();
    updateLoanIllustration();
  });
});

selectors.loanCreditUnionMarkupInput?.addEventListener('input', () => {
  handleWarrantyMarkupChange();
  updateLoanIllustration();
});

selectors.loanGfsMarkupInput?.addEventListener('input', () => {
  handleWarrantyMarkupChange();
  updateLoanIllustration();
});

selectors.loanGapCostInput?.addEventListener('input', () => {
  handleGapPricingChange();
  updateLoanIllustration();
});

selectors.loanGapCreditUnionMarkupInput?.addEventListener('input', () => {
  handleGapPricingChange();
  updateLoanIllustration();
});

selectors.loanGapGfsMarkupInput?.addEventListener('input', () => {
  handleGapPricingChange();
  updateLoanIllustration();
});

selectors.mobAccountCoverageTypeSelect?.addEventListener('change', () => {
  handleMobConfigChange();
  updateLoanIllustration();
});

selectors.mobRateStructureSelect?.addEventListener('change', () => {
  handleMobConfigChange();
  updateLoanIllustration();
});

selectors.loanTermExtensionToggle?.addEventListener('change', () => {
  handleTermExtensionChange();
  updateLoanIllustration();
});

selectors.loanVscTermExtensionInput?.addEventListener('input', () => {
  handleTermExtensionChange();
  updateLoanIllustration();
});

selectors.loanGapTermExtensionInput?.addEventListener('input', () => {
  handleTermExtensionChange();
  updateLoanIllustration();
});

selectors.mobCreditLifeToggle?.addEventListener('change', () => {
  updateLoanIllustration();
});

selectors.mobCreditDisabilityToggle?.addEventListener('change', () => {
  updateLoanIllustration();
});

selectors.mobCreditTierSelect?.addEventListener('change', () => {
  updateLoanIllustration();
});

document.querySelectorAll('input[name="mob-debt-package"]').forEach((input) => {
  input.addEventListener('change', () => {
    updateLoanIllustration();
  });
});

selectors.personalMobCoverageTypeSelect?.addEventListener('change', () => {
  const mobCoverageType = selectors.personalMobCoverageTypeSelect?.value || 'credit-insurance';
  const mobBlendedRates = selectors.mobBlendedToggle?.checked ?? false;
  updatePersonalCoverageControls({ mobCoverageType, mobBlendedRates });
  updatePersonalLoanIllustration();
});

selectors.personalMobCreditLifeToggle?.addEventListener('change', () => {
  updatePersonalLoanIllustration();
});

selectors.personalMobCreditDisabilityToggle?.addEventListener('change', () => {
  updatePersonalLoanIllustration();
});

selectors.personalMobCreditTierSelect?.addEventListener('change', () => {
  updatePersonalLoanIllustration();
});

document.querySelectorAll('input[name="personal-mob-debt-package"]').forEach((input) => {
  input.addEventListener('change', () => {
    updatePersonalLoanIllustration();
  });
});

selectors.loanWarrantyFetchBtn?.addEventListener('click', () => {
  fetchWarrantyCost();
});

selectors.loanVinDecodeBtn?.addEventListener('click', () => {
  decodeVin(selectors.loanVinInput?.value);
});

selectors.loanVinInput?.addEventListener('input', (event) => {
  if (!event.currentTarget.value) {
    renderVinResults(null);
  }
});

selectors.loanProtectionOptionsBtn?.addEventListener('click', () => {
  showDialog(selectors.protectionOptionsDialog);
});

selectors.coverageRequestBtn?.addEventListener('click', async () => {
  const creditUnionId = appState.accountSelectionId;
  const creditUnionName = getCreditUnionNameById(creditUnionId) || '';
  const isBaycel =
    normalizeNameForComparison(creditUnionName) ===
    normalizeNameForComparison(COVERAGE_REQUEST_CREDIT_UNION);
  if (!creditUnionId || !isBaycel) {
    setFeedback(
      selectors.coverageRequestFeedback,
      `Coverage requests are blocked because ${creditUnionName || 'a different credit union'} is selected. Switch to ${COVERAGE_REQUEST_CREDIT_UNION} to continue.`,
      'error'
    );
    return;
  }

  const payload = buildCoverageRequestPayload();
  const missingFields = [];
  if (!payload.member_name) missingFields.push('member name');
  if (!payload.phone_number) missingFields.push('phone number');
  if (!payload.loan_amount) missingFields.push('loan amount');
  if (!Array.isArray(payload.coverage_options) || payload.coverage_options.length === 0) {
    missingFields.push('coverage options');
  }

  if (missingFields.length) {
    setFeedback(
      selectors.coverageRequestFeedback,
      `Add ${missingFields.join(', ')} to send a coverage request.`,
      'error'
    );
    return;
  }

  const button = selectors.coverageRequestBtn;
  const previousLabel = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = 'Sending...';
  }
  setFeedback(selectors.coverageRequestFeedback, 'Sending coverage request...', 'info');

  try {
    const response = await fetch(COVERAGE_REQUEST_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Zapier webhook failed (${response.status}).`);
    }
    setFeedback(
      selectors.coverageRequestFeedback,
      'Coverage request sent. The member will receive a Podium text shortly.',
      'success'
    );
  } catch (error) {
    setFeedback(
      selectors.coverageRequestFeedback,
      error?.message || 'Unable to send coverage request.',
      'error'
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = previousLabel || 'Request Coverage';
    }
    updateCoverageRequestAvailability();
  }
});

selectors.closeProtectionOptionsDialogBtn?.addEventListener('click', () => {
  closeDialog(selectors.protectionOptionsDialog);
});

selectors.loanIllustrationSaveBtn?.addEventListener('click', async () => {
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) {
    setLoanIllustrationSaveStatus('Select a credit union before saving a snapshot.', 'error');
    return;
  }
  if (!appState.loanIllustrationDraft) {
    setLoanIllustrationSaveStatus('Enter loan details to capture a snapshot.', 'error');
    return;
  }

  setLoanIllustrationSaveStatus('Saving snapshot…', 'info');
  try {
    let saved = null;
    if (appState.loanIllustrationEditingId) {
      saved = await updateLoanIllustrationRecord(appState.loanIllustrationEditingId, appState.loanIllustrationDraft);
    } else {
      saved = await createLoanIllustration(creditUnionId, appState.loanIllustrationDraft);
      appState.loanIllustrationEditingId = saved?.id || null;
    }
    if (saved) {
      upsertLoanIllustration(creditUnionId, saved);
      renderLoanIllustrationHistory();
      setLoanIllustrationSaveStatus('Snapshot saved.', 'success');
    } else {
      setLoanIllustrationSaveStatus('Unable to save snapshot.', 'error');
    }
  } catch (error) {
    setLoanIllustrationSaveStatus(error.message, 'error');
  }
});

selectors.loanIllustrationList?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="open-illustration"]');
  if (!button || !selectors.loanIllustrationList.contains(button)) {
    return;
  }
  const creditUnionId = appState.accountSelectionId;
  const illustrationId = button.dataset.illustrationId;
  if (!creditUnionId || !illustrationId) return;
  const illustrations = Array.isArray(appState.loanIllustrations?.[creditUnionId])
    ? appState.loanIllustrations[creditUnionId]
    : [];
  const illustration = illustrations.find((item) => item.id === illustrationId);
  if (!illustration) return;
  appState.loanIllustrationEditingId = illustration.id;
  applyLoanIllustrationSnapshot(illustration);
  renderLoanIllustrationHistory();
  setLoanIllustrationSaveStatus('Snapshot loaded.', 'success');
});

selectors.accountNotesForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) {
    setFeedback(selectors.accountNotesFeedback, 'Select a credit union before adding a note.', 'error');
    return;
  }

  const author = selectors.accountNotesAuthor?.value.trim();
  const text = selectors.accountNotesText?.value.trim();

  if (!author || !text) {
    setFeedback(selectors.accountNotesFeedback, 'Add your name and note to save it.', 'error');
    return;
  }

  const noteEntry = { author, text, createdAt: new Date().toISOString() };
  const existingNotes = Array.isArray(appState.accountNotes[creditUnionId]) ? appState.accountNotes[creditUnionId] : [];
  appState.accountNotes = {
    ...appState.accountNotes,
    [creditUnionId]: [noteEntry, ...existingNotes]
  };
  const savedNotes = await persistAccountNotes(creditUnionId, { author, text });
  if (!savedNotes) {
    setFeedback(selectors.accountNotesFeedback, 'Unable to save the note right now.', 'error');
    return;
  }

  selectors.accountNotesForm.reset();
  setFeedback(selectors.accountNotesFeedback, 'Note saved.', 'success');
  renderAccountNotes();
  addAccountChangeLog({
    creditUnionId,
    action: 'Added account note',
    details: text,
    actor: author
  });
});

selectors.accountReviewForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) {
    if (selectors.accountReviewFeedback) {
      setFeedback(selectors.accountReviewFeedback, 'Select a credit union before saving a review.', 'error');
    }
    return;
  }

  const creditUnion = getCreditUnionById(creditUnionId);
  if (creditUnion?.classification !== 'account') {
    if (selectors.accountReviewFeedback) {
      setFeedback(selectors.accountReviewFeedback, 'Move this prospect to Accounts before saving review data.', 'error');
    }
    return;
  }

  const form = event.currentTarget;
  const data = collectReviewFormData(form);
  const stored = appState.accountReviewData[creditUnionId] || {};
  const yearValue = data.year || stored.year || new Date().getFullYear();
  const updatedAt = new Date().toISOString();
  const updatedReview = {
    ...stored,
    ...data,
    year: yearValue,
    updatedAt
  };

  const savedReview = await persistAccountReviewData(creditUnionId, updatedReview);
  if (!savedReview) {
    if (selectors.accountReviewFeedback) {
      setFeedback(selectors.accountReviewFeedback, 'Unable to save the review. Please try again.', 'error');
    }
    return;
  }
  const latestReview = savedReview.updatedAt ? savedReview : updatedReview;
  appState.accountReviewData = {
    ...appState.accountReviewData,
    [creditUnionId]: latestReview
  };

  if (selectors.accountReviewUpdated) {
    selectors.accountReviewUpdated.textContent = formatLogTimestamp(latestReview.updatedAt || updatedAt);
  }
  if (selectors.accountReviewFeedback) {
    setFeedback(selectors.accountReviewFeedback, 'Year end review saved.', 'success');
  }

  renderTrainingDashboard();

  addAccountChangeLog({
    creditUnionId,
    action: 'Updated year end review',
    details: `Saved ${yearValue} review data.`,
    actor: data.reviewedBy || 'Workspace user'
  });
});

selectors.accountReviewDownload?.addEventListener('click', () => {
  downloadYearEndReviewPdf();
});

selectors.accountProductSelect?.addEventListener('change', () => {
  updateAccountRevenueOptions();
  setAccountStatusFeedback('', 'info');
});

selectors.accountAddProductBtn?.addEventListener('click', () => {
  handleAddAccountProduct();
});

selectors.accountDirectoryBody?.addEventListener('click', async (event) => {
  const button = event.target.closest('.account-classification__button');
  if (!button || !selectors.accountDirectoryBody.contains(button)) {
    return;
  }

  const creditUnionId = button.dataset.creditUnionId;
  const targetClassification = button.dataset.targetClassification;
  if (!creditUnionId || !targetClassification) {
    return;
  }

  button.disabled = true;
  const previousText = button.textContent;
  button.textContent = 'Moving...';

  try {
    const updatedClassification = await updateCreditUnionClassification(
      creditUnionId,
      targetClassification
    );
    appState.accountDirectoryView = updatedClassification;
    renderAccountDirectory();
    addAccountChangeLog({
      creditUnionId,
      action: 'Updated account classification',
      details: `Set classification to ${updatedClassification}.`,
      actor: 'Workspace user'
    });
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
    button.textContent = previousText;
  }
});

selectors.accountDirectoryTabs?.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-view]');
  if (!tab || !selectors.accountDirectoryTabs.contains(tab)) {
    return;
  }

  const selectedView = CLASSIFICATIONS.includes(tab.dataset.view) ? tab.dataset.view : 'account';
  appState.accountDirectoryView = selectedView;
  renderAccountDirectory();
});

selectors.prospectAccountFilter?.addEventListener('input', (event) => {
  appState.prospectAccountFilter = event.currentTarget.value || '';
  renderProspectAccountList();
});

selectors.callReportUploadBtn?.addEventListener('click', () => {
  if (!appState.accountSelectionId) {
    setCallReportFeedback('Select a credit union before uploading a call report.', 'error');
    return;
  }
  selectors.callReportFileInput?.click();
});

selectors.callReportFileInput?.addEventListener('change', async (event) => {
  const file = event.currentTarget.files?.[0];
  if (!file) return;

  if (!appState.accountSelectionId) {
    setCallReportFeedback('Select a credit union before uploading a call report.', 'error');
    event.currentTarget.value = '';
    return;
  }

  setCallReportFeedback('Reading call report...', 'info');

  try {
    await uploadCallReport(file, appState.accountSelectionId);
    setCallReportFeedback('Call report captured and stored.', 'success');
    await loadCallReports(appState.accountSelectionId);
    await loadLatestCallReports();
    addAccountChangeLog({
      creditUnionId: appState.accountSelectionId,
      action: 'Uploaded call report',
      details: file.name ? `File ${file.name} uploaded.` : 'Call report uploaded.',
      actor: 'Workspace user'
    });
  } catch (error) {
    setCallReportFeedback(error.message, 'error');
  } finally {
    event.currentTarget.value = '';
  }
});

selectors.callReportList?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action="delete-call-report"]');
  if (!button || !selectors.callReportList.contains(button)) {
    return;
  }

  const reportId = button.dataset.reportId;
  if (!reportId) return;

  const reportLabel = button.dataset.reportLabel || 'this call report';
  const confirmed = window.confirm(`Delete ${reportLabel}? This cannot be undone.`);
  if (!confirmed) return;

  const previousText = button.textContent;
  button.disabled = true;
  button.textContent = 'Deleting...';
  setCallReportFeedback('Deleting call report...', 'info');

  try {
    await deleteCallReport(reportId);
    setCallReportFeedback('Call report removed.', 'success');
    await loadCallReports(appState.accountSelectionId);
    await loadLatestCallReports();
    addAccountChangeLog({
      creditUnionId: appState.accountSelectionId,
      action: 'Deleted call report',
      details: `Removed ${reportLabel}.`,
      actor: 'Workspace user'
    });
  } catch (error) {
    setCallReportFeedback(error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = previousText;
  }
});

selectors.loanLogForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const creditUnionId = appState.accountSelectionId;
  if (!creditUnionId) {
    setFeedback(selectors.loanLogFeedback, 'Select a credit union before saving a loan.', 'error');
    return;
  }

  const payload = buildLoanPayload();
  if (!payload.loanDate) {
    setFeedback(selectors.loanLogFeedback, 'Loan date is required.', 'error');
    return;
  }
  if (!payload.loanOfficer) {
    setFeedback(selectors.loanLogFeedback, 'Loan officer is required.', 'error');
    return;
  }
  if (!Number.isFinite(payload.loanAmount)) {
    setFeedback(selectors.loanLogFeedback, 'Loan amount is required.', 'error');
    return;
  }
  if (payload.coverageSelected === null) {
    setFeedback(selectors.loanLogFeedback, 'Select yes or no for coverage.', 'error');
    return;
  }

  if (selectors.loanLogSaveBtn) {
    selectors.loanLogSaveBtn.disabled = true;
  }
  setFeedback(selectors.loanLogFeedback, 'Saving loan...', 'info');

  try {
    if (appState.loanEditingId) {
      await updateLoanEntry(appState.loanEditingId, payload);
      addAccountChangeLog({
        creditUnionId,
        action: 'Updated loan entry',
        details: `Updated loan for ${payload.loanOfficer}.`,
        actor: 'Workspace user'
      });
      setFeedback(selectors.loanLogFeedback, 'Coverage updated.', 'success');
    } else {
      await createLoanEntry(payload);
      addAccountChangeLog({
        creditUnionId,
        action: 'Logged new loan',
        details: `Logged loan for ${payload.loanOfficer}.`,
        actor: 'Workspace user'
      });
      setFeedback(selectors.loanLogFeedback, 'Coverage issued.', 'success');
    }
    await loadLoanEntries(creditUnionId);
    renderLoanLog();
    resetLoanLogForm();
  } catch (error) {
    setFeedback(selectors.loanLogFeedback, error.message, 'error');
  } finally {
    if (selectors.loanLogSaveBtn) {
      selectors.loanLogSaveBtn.disabled = false;
    }
  }
});

selectors.loanLogCancelBtn?.addEventListener('click', () => {
  resetLoanLogForm();
});

selectors.loanLogList?.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || !selectors.loanLogList.contains(button)) return;

  const loanId = button.dataset.loanId;
  if (!loanId) return;

  const creditUnionId = appState.accountSelectionId;
  const loans = creditUnionId ? appState.loanEntries[creditUnionId] || [] : [];
  const loan = loans.find((item) => item.id === loanId);

  if (button.dataset.action === 'edit-loan') {
    populateLoanLogForm(loan);
    return;
  }

  if (button.dataset.action === 'delete-loan') {
    const confirmed = window.confirm('Delete this loan entry? This cannot be undone.');
    if (!confirmed) return;

    button.disabled = true;
    button.textContent = 'Deleting...';
    setFeedback(selectors.loanLogFeedback, 'Deleting loan...', 'info');

    try {
      await deleteLoanEntry(loanId);
      addAccountChangeLog({
        creditUnionId,
        action: 'Deleted loan entry',
        details: loan?.loanOfficer ? `Deleted loan for ${loan.loanOfficer}.` : 'Deleted a loan entry.',
        actor: 'Workspace user'
      });
      await loadLoanEntries(creditUnionId);
      renderLoanLog();
      setFeedback(selectors.loanLogFeedback, 'Coverage deleted.', 'success');
    } catch (error) {
      setFeedback(selectors.loanLogFeedback, error.message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Delete';
    }
  }
});

selectors.missingFilterForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const month = form.month.value || null;
  const revenueType = form.revenueType.value || 'all';
  appState.missingFilters = { month, revenueType };
  try {
    await loadMissingUpdates({ month, revenueType });
  } catch (error) {
    setFeedback(selectors.missingFeedback, error.message, 'error');
  }
});

selectors.missingBody?.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action="submit-missing"]');
  if (!button || !selectors.missingBody.contains(button)) {
    return;
  }
  const row = button.closest('tr');
  try {
    await submitMissingRow(row, button);
  } catch (error) {
    setFeedback(selectors.missingFeedback, error.message, 'error');
  }
});

selectors.revenueForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const incomeStreamId = form.incomeStreamId.value;
  const period = form.period.value;
  const amount = form.amount.value;

  if (!incomeStreamId || !period || !amount) {
    setFeedback(selectors.revenueFeedback, 'Please select a stream, month, and enter an amount.', 'error');
    return;
  }

  const [year, month] = period.split('-').map((value) => Number.parseInt(value, 10));

  try {
    await saveRevenueEntry({ incomeStreamId, year, month, amount: Number(amount) });
    setFeedback(selectors.revenueFeedback, 'Revenue saved.', 'success');
    form.reset();
    await loadIncomeStreams();
    await loadSummary(appState.reportingWindow);
  } catch (error) {
    setFeedback(selectors.revenueFeedback, error.message, 'error');
  }
});


selectors.reportingForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const start = form.start.value;
  const end = form.end.value;

  appState.reportingWindow = { start: start || null, end: end || null };

  try {
    await loadSummary({ ...appState.reportingWindow, creditUnionId: appState.selectedCreditUnion });
  } catch (error) {
    alert(error.message);
  }
});

selectors.reportingCreditUnionSelect?.addEventListener('change', async (event) => {
  const select = event.currentTarget;
  appState.selectedCreditUnion = select.value || 'all';

  try {
    await loadSummary({ ...appState.reportingWindow, creditUnionId: appState.selectedCreditUnion });
  } catch (error) {
    alert(error.message);
  }
});

selectors.incomeStreamFilter?.addEventListener('change', (event) => {
  const select = event.currentTarget;
  appState.incomeStreamFilterId = select.value || 'all';
  renderIncomeStreamList();
});

async function bootstrap() {
  appState.monthlyDetailMonthKey = getMonthFromQuery();
  appState.detailCreditUnionId = getDetailCreditUnionIdFromQuery();
  appState.detailCreditUnionName = getDetailCreditUnionNameFromQuery();
  appState.detailStart = getDetailStartFromQuery();
  appState.detailEnd = getDetailEndFromQuery();
  appState.accountSelectionId = getAccountSelectionFromQuery();
  try {
    await Promise.all([
      loadCreditUnions(),
      loadIncomeStreams(),
      loadAccountReviewData(),
      loadAccountNotes(),
      loadAccountChangeLog(),
      loadAccountWarrantyConfigs()
    ]);
  } catch (error) {
    console.error(error);
  }

  if (appState.detailCreditUnionId) {
    const resolvedName = getCreditUnionNameById(appState.detailCreditUnionId);
    if (resolvedName) {
      appState.detailCreditUnionName = resolvedName;
    }
  }

  try {
    const now = new Date();
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    const defaultMissingMonth = end;
    appState.reportingWindow = { start, end };
    if (selectors.reportingForm) {
      selectors.reportingForm.start.value = start;
      selectors.reportingForm.end.value = end;
    }

    if (selectors.reportingCreditUnionSelect) {
      if (!selectors.reportingCreditUnionSelect.value) {
        selectors.reportingCreditUnionSelect.value = 'all';
      }
      appState.selectedCreditUnion = selectors.reportingCreditUnionSelect.value || 'all';
    }

    if (selectors.missingMonthInput && !selectors.missingMonthInput.value) {
      selectors.missingMonthInput.value = defaultMissingMonth;
    }
    if (!appState.missingFilters.month) {
      appState.missingFilters.month = defaultMissingMonth;
    }

    const shouldLoadSummary =
      Boolean(
        selectors.totalRevenue ||
          selectors.topCreditUnion ||
          selectors.topProduct ||
          selectors.creditUnionSummary ||
          selectors.productSummary ||
          selectors.typeSummary ||
          selectors.timelineChart ||
          selectors.monthlyCompletionBody ||
          selectors.reportingCreditUnionSelect
      );

    if (shouldLoadSummary) {
      await loadSummary({ ...appState.reportingWindow, creditUnionId: appState.selectedCreditUnion });
    }

    if (selectors.missingBody) {
      await loadMissingUpdates({ month: appState.missingFilters.month, revenueType: appState.missingFilters.revenueType });
    }
  } catch (error) {
    console.error(error);
  }

  if (selectors.monthlyCompletionBody && (!appState.monthlyCompletion || !appState.monthlyCompletion.length)) {
    try {
      await loadMonthlyCompletion({ ...appState.reportingWindow, creditUnionId: appState.selectedCreditUnion });
    } catch (error) {
      console.error(error);
    }
  }

  if (selectors.accountStatusList) {
    try {
      await loadProspectStreams();
    } catch (error) {
      console.error(error);
    }
  }

  if (selectors.accountDirectoryBody || selectors.quotesDirectoryBody) {
    try {
      await loadLatestCallReports();
    } catch (error) {
      console.error(error);
    }
  }

  if (selectors.accountReviewForm) {
    renderAccountReview();
  }
  if (selectors.accountNotesList) {
    renderAccountNotes();
  }
  if (selectors.accountChangeLog) {
    renderAccountChangeLog();
  }
  renderTrainingDashboard();

  if (selectors.callReportList && appState.accountSelectionId) {
    try {
      await loadCallReports(appState.accountSelectionId);
    } catch (error) {
      console.error(error);
      setCallReportFeedback(error.message, 'error');
    }
  }
  if (selectors.loanLogList && appState.accountSelectionId) {
    try {
      await Promise.all([
        loadLoanEntries(appState.accountSelectionId),
        loadLoanIllustrations(appState.accountSelectionId)
      ]);
      renderLoanLog();
      renderLoanIllustrationHistory();
    } catch (error) {
      console.error(error);
    }
  }

  if (selectors.monthlyDetailBody) {
    if (appState.monthlyDetailMonthKey) {
      try {
        await loadMonthlyDetail(appState.monthlyDetailMonthKey, appState.detailCreditUnionId);
      } catch (error) {
        console.error(error);
        renderMonthlyDetail(null, {
          monthKey: appState.monthlyDetailMonthKey,
          creditUnionId: appState.detailCreditUnionId,
          creditUnionName: appState.detailCreditUnionName,
          error: error.message
        });
      }
    } else {
      renderMonthlyDetail(null, { creditUnionId: appState.detailCreditUnionId, creditUnionName: appState.detailCreditUnionName });
    }
  }

  if (selectors.creditUnionStreamsBody) {
    if (appState.detailCreditUnionId) {
      try {
        await loadCreditUnionRevenueDetail(appState.detailCreditUnionId, {
          creditUnionName: appState.detailCreditUnionName,
          start: appState.detailStart,
          end: appState.detailEnd
        });
      } catch (error) {
        console.error(error);
        renderCreditUnionDetail(null, {
          creditUnionName: appState.detailCreditUnionName,
          start: appState.detailStart,
          end: appState.detailEnd,
          error: error.message
        });
      }
    } else {
      renderCreditUnionDetail(null, {
        creditUnionName: appState.detailCreditUnionName,
        start: appState.detailStart,
        end: appState.detailEnd
      });
    }
  }

  if (selectors.streamName) {
    const streamId = getStreamIdFromQuery();
    if (streamId) {
      try {
        await loadIncomeStreamDetail(streamId);
        await loadIncomeStreamReportingStatus(streamId);
      } catch (error) {
        console.error(error);
        if (selectors.streamName) {
          selectors.streamName.textContent = 'Income stream not found';
        }
        if (selectors.reportingStatusSummary) {
          selectors.reportingStatusSummary.textContent = error.message;
        }
        if (selectors.cancelStreamBtn) {
          selectors.cancelStreamBtn.hidden = true;
        }
      }
    } else {
      selectors.streamName.textContent = 'Income stream not found';
      if (selectors.reportingStatusSummary) {
        selectors.reportingStatusSummary.textContent =
          'Use the income stream list to choose a reporting view.';
      }
      if (selectors.cancelStreamBtn) {
        selectors.cancelStreamBtn.hidden = true;
      }
    }
  }
}

bootstrap();
