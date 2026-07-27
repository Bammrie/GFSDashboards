import {
  BORROWER_TYPES,
  COVERAGE_TYPES,
  DEFAULT_QUOTE_INPUTS,
  LOAN_TYPES,
  PAYMENT_FREQUENCIES,
  calculateQuote,
  coverageIncludesDisability,
  coverageIncludesLife
} from './quote-engine.js';
import { CSO_LIMITS, UNSUPPORTED_LOAN_TYPE_WARNING } from './src/data/csoLimits.js';
import { CSO_RATE_CONFIG } from './src/data/csoRates.js';

const LOCKED_STATE = window.location.pathname.toLowerCase().includes('/arkansas') ? 'AR' : 'MO';
const LATEST_QUOTE_STORAGE_KEY = `premiumQuoteProCsoLatestQuote:${LOCKED_STATE}`;
const SAVED_QUOTES_STORAGE_KEY = `premiumQuoteProCsoSavedQuotes:${LOCKED_STATE}`;
const SCREEN_NAMES = ['quote', 'results'];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const elements = {
  screens: document.querySelectorAll('[data-screen]'),
  tabs: document.querySelectorAll('.sp-screen-tab'),
  screenButtons: document.querySelectorAll('[data-screen-target]'),
  quoteForm: document.getElementById('quote-form'),
  quoteErrors: document.getElementById('quote-errors'),
  quoteResetDefaults: document.getElementById('quote-reset-defaults'),
  calculateButton: document.getElementById('calculate-button'),
  state: document.getElementById('state'),
  activeStatePill: document.getElementById('active-state-pill'),
  paymentFrequency: document.getElementById('payment-frequency'),
  daysToFirstPayment: document.getElementById('days-to-first-payment'),
  borrowerType: document.getElementById('borrower-type'),
  coBorrowerDobField: document.getElementById('co-borrower-dob-field'),
  loanType: document.getElementById('loan-type'),
  emptyResults: document.getElementById('empty-results'),
  resultsContent: document.getElementById('results-content'),
  resultsIntro: document.getElementById('results-intro'),
  resultTotalPremium: document.getElementById('result-total-premium'),
  resultLifePremium: document.getElementById('result-life-premium'),
  resultDisabilityPremium: document.getElementById('result-disability-premium'),
  resultState: document.getElementById('result-state'),
  resultBorrowerType: document.getElementById('result-borrower-type'),
  resultCoverage: document.getElementById('result-coverage'),
  financeSummary: document.getElementById('finance-summary'),
  coverageSummary: document.getElementById('coverage-summary'),
  costSummary: document.getElementById('cost-summary'),
  resultWarnings: document.getElementById('result-warnings'),
  copySummary: document.getElementById('copy-summary'),
  shareQuote: document.getElementById('share-quote'),
  saveQuote: document.getElementById('save-quote'),
  resetQuote: document.getElementById('reset-quote'),
  copyStatus: document.getElementById('copy-status'),
  savedQuotesList: document.getElementById('saved-quotes-list'),
  clearSavedQuotes: document.getElementById('clear-saved-quotes'),
  programOrganizationName: document.getElementById('program-organization-name'),
  programName: document.getElementById('program-name'),
  programStateSubtitle: document.getElementById('program-state-subtitle'),
  programDisclaimer: document.getElementById('program-disclaimer'),
  headerStateBadge: document.getElementById('header-state-badge'),
  coverageStateBadge: document.getElementById('coverage-state-badge'),
  quoteUserName: document.getElementById('quote-user-name'),
  quoteLogout: document.getElementById('quote-logout'),
  shareModal: document.getElementById('share-modal'),
  borrowerEmail: document.getElementById('borrower-email'),
  borrowerPhone: document.getElementById('borrower-phone'),
  modalCopySummary: document.getElementById('modal-copy-summary'),
  emailQuote: document.getElementById('email-quote'),
  textQuote: document.getElementById('text-quote'),
  webShareQuote: document.getElementById('web-share-quote'),
  shareStatus: document.getElementById('share-status')
};

let settings = {
  authorizedStates: [LOCKED_STATE],
  rateConfig: { [LOCKED_STATE]: CSO_RATE_CONFIG[LOCKED_STATE] },
  limits: { [LOCKED_STATE]: CSO_LIMITS[LOCKED_STATE] }
};
let program = {
  organizationName: 'Example Bank',
  programName: 'Payment Protection Quote',
  disclaimer: 'This is an estimate and may vary from final closing loan figures.'
};
let latestQuote = loadLatestQuote();
let savedQuotes = loadSavedQuotes();

function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

function formatPercent(value) {
  return `${percentFormatter.format(Number(value) || 0)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setStorageItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to persist ${key}.`, error);
  }
}

function getStorageItem(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn(`Unable to read ${key}.`, error);
    return null;
  }
}

function removeStorageItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Unable to remove ${key}.`, error);
  }
}

function loadLatestQuote() {
  const stored = getStorageItem(LATEST_QUOTE_STORAGE_KEY);
  return stored && stored.result && stored.inputs ? stored : null;
}

function loadSavedQuotes() {
  const stored = getStorageItem(SAVED_QUOTES_STORAGE_KEY);
  return Array.isArray(stored) ? stored : [];
}

function getFieldValue(form, name) {
  const field = form.elements[name];
  return field ? field.value : '';
}

function getNumericFieldValue(form, name) {
  return Number(getFieldValue(form, name));
}

function setFieldValue(form, name, value) {
  const field = form.elements[name];
  if (field) {
    field.value = value;
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function defaultInputs() {
  return {
    ...DEFAULT_QUOTE_INPUTS,
    state: LOCKED_STATE,
    closingDate: todayIso(),
    daysToFirstPayment: PAYMENT_FREQUENCIES.monthly.defaultDaysToFirstPayment
  };
}

function populateStateOptions() {
  const stateName = settings.rateConfig[LOCKED_STATE]?.stateName || CSO_RATE_CONFIG[LOCKED_STATE].stateName;
  elements.state.innerHTML = `<option value="${LOCKED_STATE}">${escapeHtml(stateName)}</option>`;
  elements.state.disabled = true;
}

function hydrateQuoteForm(inputs = {}) {
  populateStateOptions();
  const values = { ...defaultInputs(), ...inputs };
  setFieldValue(elements.quoteForm, 'state', values.state);
  setFieldValue(elements.quoteForm, 'loanAmount', values.loanAmount);
  setFieldValue(elements.quoteForm, 'loanFee', values.loanFee);
  setFieldValue(elements.quoteForm, 'prepaidFees', values.prepaidFees ?? 0);
  setFieldValue(elements.quoteForm, 'interestRate', values.interestRate ?? values.annualApr);
  setFieldValue(elements.quoteForm, 'numberOfPayments', values.numberOfPayments ?? values.termMonths);
  setFieldValue(elements.quoteForm, 'paymentFrequency', values.paymentFrequency);
  setFieldValue(elements.quoteForm, 'daysToFirstPayment', values.daysToFirstPayment);
  setFieldValue(elements.quoteForm, 'closingDate', values.closingDate || todayIso());
  setFieldValue(elements.quoteForm, 'borrowerDateOfBirth', values.borrowerDateOfBirth || '');
  setFieldValue(elements.quoteForm, 'coBorrowerDateOfBirth', values.coBorrowerDateOfBirth || '');
  setFieldValue(elements.quoteForm, 'loanType', values.loanType);
  setFieldValue(elements.quoteForm, 'coverageType', values.coverageType);
  setFieldValue(elements.quoteForm, 'borrowerType', values.borrowerType);
  updateConditionalFields();
}

function readQuoteForm() {
  return {
    state: getFieldValue(elements.quoteForm, 'state'),
    loanAmount: getNumericFieldValue(elements.quoteForm, 'loanAmount'),
    loanFee: getNumericFieldValue(elements.quoteForm, 'loanFee'),
    prepaidFees: getNumericFieldValue(elements.quoteForm, 'prepaidFees'),
    interestRate: getNumericFieldValue(elements.quoteForm, 'interestRate'),
    numberOfPayments: getNumericFieldValue(elements.quoteForm, 'numberOfPayments'),
    paymentFrequency: getFieldValue(elements.quoteForm, 'paymentFrequency'),
    daysToFirstPayment: getNumericFieldValue(elements.quoteForm, 'daysToFirstPayment'),
    closingDate: getFieldValue(elements.quoteForm, 'closingDate'),
    borrowerDateOfBirth: getFieldValue(elements.quoteForm, 'borrowerDateOfBirth'),
    coBorrowerDateOfBirth: getFieldValue(elements.quoteForm, 'coBorrowerDateOfBirth'),
    loanType: getFieldValue(elements.quoteForm, 'loanType'),
    coverageType: getFieldValue(elements.quoteForm, 'coverageType'),
    borrowerType: getFieldValue(elements.quoteForm, 'borrowerType'),
    disabilityPlan: 'sevenDayRetro',
    calculationMethod: 'carrierGross',
    premiumTreatment: 'financed',
    includePremiumInInsuredBalance: true
  };
}

function validateQuoteInputs(inputs) {
  const errors = [];
  if (!settings.authorizedStates.includes(inputs.state)) errors.push('State is not authorized in Settings.');
  if (inputs.loanAmount <= 0) errors.push('Loan amount must be greater than 0.');
  if (inputs.loanFee < 0) errors.push('Loan fee must be 0 or greater.');
  if (inputs.prepaidFees < 0) errors.push('Prepaid fees must be 0 or greater.');
  if (inputs.interestRate < 0) errors.push('Interest Rate must be 0 or greater.');
  if (inputs.numberOfPayments <= 0) errors.push('Number of payments must be greater than 0.');
  if (inputs.daysToFirstPayment < 0) errors.push('Days to first payment must be 0 or greater.');
  if (settings.limits[inputs.state]?.unsupportedLoanTypes.includes(inputs.loanType)) {
    errors.push(UNSUPPORTED_LOAN_TYPE_WARNING);
  }
  return errors;
}

function showErrorList(container, errors) {
  if (!errors.length) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }
  container.hidden = false;
  container.innerHTML = `<ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>`;
}

function setStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('sp-status--error', isError);
}

function setScreen(screenName, updateHash = true) {
  const nextScreen = SCREEN_NAMES.includes(screenName) ? screenName : 'quote';
  elements.screens.forEach((screen) => {
    screen.hidden = screen.dataset.screen !== nextScreen;
  });
  elements.tabs.forEach((tab) => {
    if (tab.dataset.screenTarget === nextScreen) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  if (updateHash) {
    const nextHash = nextScreen === 'quote' ? window.location.pathname : `#${nextScreen}`;
    window.history.replaceState(null, '', nextHash);
  }
}

function screenFromHash() {
  const hash = window.location.hash.replace('#', '');
  return SCREEN_NAMES.includes(hash) ? hash : 'quote';
}

function updateConditionalFields() {
  const borrowerType = elements.borrowerType.value;
  const frequency = elements.paymentFrequency.value;
  const state = LOCKED_STATE;
  const loanType = elements.loanType.value;
  elements.coBorrowerDobField.hidden = borrowerType === 'single';
  elements.activeStatePill.textContent = state;
  const unsupported = settings.limits[state]?.unsupportedLoanTypes.includes(loanType);
  elements.calculateButton.disabled = unsupported;
  showErrorList(elements.quoteErrors, unsupported ? [UNSUPPORTED_LOAN_TYPE_WARNING] : []);

  if (!elements.daysToFirstPayment.dataset.userEdited) {
    elements.daysToFirstPayment.value = PAYMENT_FREQUENCIES[frequency].defaultDaysToFirstPayment;
  }
}

function detailRow(label, value) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `;
}

function renderFinanceSummary(result) {
  const rows = [
    ['Loan Amount', formatCurrency(result.loanAmount)],
    ['Loan Fee', formatCurrency(result.loanFee)],
    ['Prepaid Fees', formatCurrency(result.prepaidFees)],
    ['Principal before insurance', formatCurrency(result.baseAmountFinancedBeforeInsurance)],
    ['Total Premium', formatCurrency(result.totalPremium)],
    ['Amount Financed', formatCurrency(result.amountFinanced)],
    ['APR Amount Financed', formatCurrency(result.amountFinancedForApr)],
    ['Finance Charge', formatCurrency(result.financeCharge)],
    ['Estimated APR', formatPercent(result.estimatedApr)],
    ['Total of Payments', formatCurrency(result.totalPayments)],
    ['Interest Rate', formatPercent(result.interestRate)],
    ['Number of Payments', `${result.numberOfPayments}`],
    ['Payment Frequency', result.paymentFrequencyLabel],
    ['Regular Payment', formatCurrency(result.regularPayment)],
    ['Final Payment', formatCurrency(result.finalPayment)]
  ];
  elements.financeSummary.innerHTML = rows.map(([label, value]) => detailRow(label, value)).join('');
}

function renderCoverageSummary(result) {
  const cards = [];
  if (coverageIncludesLife(result.coverageType)) {
    cards.push(`
      <article class="sp-coverage-card">
        <h4>${result.borrowerType === 'joint' ? 'Joint' : 'Single'} Life Coverage</h4>
        <dl>
          ${detailRow('Premium', formatCurrency(result.lifePremium))}
          ${detailRow('Term', `${result.equivalentCoverageMonths} months`)}
          ${detailRow('Original Amount of Coverage', formatCurrency(result.originalLifeAmountOfCoverage))}
        </dl>
      </article>
    `);
  }
  if (coverageIncludesDisability(result.coverageType)) {
    cards.push(`
      <article class="sp-coverage-card">
        <h4>7-Day Retro Disability Coverage</h4>
        <dl>
          ${detailRow('Premium', formatCurrency(result.disabilityPremium))}
          ${detailRow('Term', `${result.equivalentCoverageMonths} months`)}
          ${detailRow('Covered Payment', formatCurrency(result.originalDisabilityPaymentCoverage))}
          ${detailRow('Total Benefit', formatCurrency(result.totalDisabilityBenefit))}
        </dl>
      </article>
    `);
  }
  if (!cards.length) {
    cards.push('<p class="sp-empty-note">No coverage selected. Premium is $0.00.</p>');
  }
  elements.coverageSummary.innerHTML = cards.join('');
}

function renderCostSummary(result) {
  const rows = [
    ['Cost Per Period', formatCurrency(result.costPerPeriod)],
    ['Cost Per Day', formatCurrency(result.costPerDay)]
  ];
  elements.costSummary.innerHTML = rows.map(([label, value]) => detailRow(label, value)).join('');
}

function renderWarnings(result) {
  const warnings = [...(result.blockingWarnings || []), ...(result.warnings || [])];
  if (!warnings.length) {
    elements.resultWarnings.innerHTML = '';
    return;
  }
  elements.resultWarnings.innerHTML = warnings
    .map((warning) => `<div class="sp-alert ${result.blockingWarnings?.includes(warning) ? 'sp-alert--error' : 'sp-alert--warning'}">${escapeHtml(warning)}</div>`)
    .join('');
}

function renderResults() {
  if (!latestQuote) {
    elements.emptyResults.hidden = false;
    elements.resultsContent.hidden = true;
    elements.resultsIntro.textContent = 'Calculate a quote to view results.';
    renderSavedQuotes();
    return;
  }
  const { result } = latestQuote;
  elements.emptyResults.hidden = true;
  elements.resultsContent.hidden = false;
  elements.resultsIntro.textContent = 'Review the payment protection estimate.';
  elements.resultTotalPremium.textContent = formatCurrency(result.totalPremium);
  elements.resultLifePremium.textContent = formatCurrency(result.lifePremium);
  elements.resultDisabilityPremium.textContent = formatCurrency(result.disabilityPremium);
  elements.resultState.textContent = `${result.state} - ${result.stateName}`;
  elements.resultBorrowerType.textContent = BORROWER_TYPES[result.borrowerType];
  elements.resultCoverage.textContent = COVERAGE_TYPES[result.coverageType];
  renderFinanceSummary(result);
  renderCoverageSummary(result);
  renderCostSummary(result);
  renderWarnings(result);
  renderSavedQuotes();
}

function saveLatestQuote(inputs, result) {
  latestQuote = { inputs, result, savedAt: new Date().toISOString() };
  setStorageItem(LATEST_QUOTE_STORAGE_KEY, latestQuote);
}

function calculateAndRenderQuote(inputs) {
  const result = calculateQuote(inputs, settings.rateConfig, {
    limits: settings.limits,
    minimumPremiumAppliesPerProduct: true
  });
  saveLatestQuote(inputs, result);
  renderResults();
  setScreen('results');
}

function quoteSummaryText(short = false) {
  if (!latestQuote) return '';
  const { result } = latestQuote;
  if (short) {
    return `${program.organizationName} estimate: ${result.state} ${COVERAGE_TYPES[result.coverageType]}, total premium ${formatCurrency(result.totalPremium)}, regular payment ${formatCurrency(result.regularPayment)}. ${program.disclaimer}`;
  }
  return [
    program.organizationName,
    'Single Premium Credit Insurance Quote',
    '',
    `State: ${result.state} - ${result.stateName}`,
    `Loan Amount: ${formatCurrency(result.loanAmount)}`,
    `Loan Fee: ${formatCurrency(result.loanFee)}`,
    `Prepaid Fees: ${formatCurrency(result.prepaidFees)}`,
    `Interest Rate: ${formatPercent(result.interestRate)}`,
    `Estimated APR: ${formatPercent(result.estimatedApr)}`,
    `Number of Payments: ${result.numberOfPayments}`,
    `Payment Frequency: ${result.paymentFrequencyLabel}`,
    `Coverage: ${COVERAGE_TYPES[result.coverageType]}`,
    `Borrower Type: ${BORROWER_TYPES[result.borrowerType]}`,
    '',
    `Life Premium: ${formatCurrency(result.lifePremium)}`,
    `Disability Premium: ${formatCurrency(result.disabilityPremium)}`,
    `Total Premium: ${formatCurrency(result.totalPremium)}`,
    `Amount Financed: ${formatCurrency(result.amountFinanced)}`,
    `Finance Charge: ${formatCurrency(result.financeCharge)}`,
    `Regular Payment: ${formatCurrency(result.regularPayment)}`,
    `Final Payment: ${formatCurrency(result.finalPayment)}`,
    `Total of Payments: ${formatCurrency(result.totalPayments)}`,
    '',
    program.disclaimer
  ].join('\n');
}

async function copyQuoteSummary(statusElement = elements.copyStatus) {
  const summary = quoteSummaryText();
  if (!summary) {
    setStatus(statusElement, 'Calculate a quote before copying a summary.', true);
    return;
  }
  try {
    await navigator.clipboard.writeText(summary);
    setStatus(statusElement, 'Quote summary copied.');
  } catch (error) {
    setStatus(statusElement, 'Copy failed. Select and copy the summary manually.', true);
  }
}

function saveCurrentQuoteCard() {
  if (!latestQuote) {
    setStatus(elements.copyStatus, 'Calculate a quote before saving.', true);
    return;
  }
  savedQuotes = [{ id: `quote-${Date.now()}`, savedAt: new Date().toISOString(), result: latestQuote.result }, ...savedQuotes].slice(0, 12);
  setStorageItem(SAVED_QUOTES_STORAGE_KEY, savedQuotes);
  renderSavedQuotes();
  setStatus(elements.copyStatus, 'Quote card saved.');
}

function renderSavedQuotes() {
  if (!savedQuotes.length) {
    elements.savedQuotesList.innerHTML = '<p class="sp-empty-note">No saved quote cards yet.</p>';
    return;
  }
  elements.savedQuotesList.innerHTML = savedQuotes
    .map(({ result }) => `
      <article class="sp-saved-card">
        <div class="sp-badge-row">
          <span class="sp-badge">${escapeHtml(result.state)}</span>
          <span class="sp-badge">Payment Protection</span>
          <span class="sp-badge">Financed</span>
          ${coverageIncludesDisability(result.coverageType) ? '<span class="sp-badge">7-Day Retro</span>' : ''}
        </div>
        <h4>${escapeHtml(COVERAGE_TYPES[result.coverageType])}</h4>
        <p>${formatCurrency(result.loanAmount)} + ${formatCurrency(result.loanFee)} fee${result.prepaidFees ? ` + ${formatCurrency(result.prepaidFees)} prepaid` : ''} - ${result.numberOfPayments} ${escapeHtml(result.paymentFrequencyLabel)} payments</p>
        <strong>${formatCurrency(result.totalPremium)}</strong>
      </article>
    `)
    .join('');
}

function resetQuoteState() {
  latestQuote = null;
  removeStorageItem(LATEST_QUOTE_STORAGE_KEY);
  hydrateQuoteForm(defaultInputs());
  renderResults();
  setStatus(elements.copyStatus, '');
  setScreen('quote');
}

function openShareModal() {
  if (!latestQuote) {
    setStatus(elements.copyStatus, 'Calculate a quote before sharing.', true);
    return;
  }
  setStatus(elements.shareStatus, '');
  elements.shareModal.showModal();
}

function emailQuote() {
  const email = elements.borrowerEmail.value.trim();
  const subject = encodeURIComponent('Single Premium Credit Insurance Quote');
  const body = encodeURIComponent(quoteSummaryText());
  window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
}

function textQuote() {
  const phone = elements.borrowerPhone.value.replace(/[^\d+]/g, '');
  const body = encodeURIComponent(quoteSummaryText(true));
  window.location.href = `sms:${phone}?&body=${body}`;
}

async function webShareQuote() {
  if (!navigator.share) {
    setStatus(elements.shareStatus, 'Web Share is not available in this browser.', true);
    return;
  }
  try {
    await navigator.share({
      title: `${program.organizationName} Payment Protection Quote`,
      text: quoteSummaryText()
    });
    setStatus(elements.shareStatus, 'Quote shared.');
  } catch (error) {
    setStatus(elements.shareStatus, 'Share cancelled or unavailable.', true);
  }
}

function initializeEvents() {
  elements.screenButtons.forEach((button) => {
    button.addEventListener('click', () => setScreen(button.dataset.screenTarget));
  });
  window.addEventListener('hashchange', () => setScreen(screenFromHash(), false));
  elements.paymentFrequency.addEventListener('change', () => {
    elements.daysToFirstPayment.dataset.userEdited = '';
    updateConditionalFields();
  });
  elements.daysToFirstPayment.addEventListener('input', () => {
    elements.daysToFirstPayment.dataset.userEdited = 'true';
  });
  [elements.borrowerType, elements.loanType].forEach((element) => {
    element.addEventListener('change', updateConditionalFields);
  });
  elements.quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputs = readQuoteForm();
    const errors = validateQuoteInputs(inputs);
    showErrorList(elements.quoteErrors, errors);
    if (errors.length) return;
    calculateAndRenderQuote(inputs);
  });
  elements.quoteResetDefaults.addEventListener('click', () => hydrateQuoteForm(defaultInputs()));
  elements.copySummary.addEventListener('click', () => copyQuoteSummary(elements.copyStatus));
  elements.modalCopySummary.addEventListener('click', () => copyQuoteSummary(elements.shareStatus));
  elements.shareQuote.addEventListener('click', openShareModal);
  elements.emailQuote.addEventListener('click', emailQuote);
  elements.textQuote.addEventListener('click', textQuote);
  elements.webShareQuote.addEventListener('click', webShareQuote);
  elements.saveQuote.addEventListener('click', saveCurrentQuoteCard);
  elements.resetQuote.addEventListener('click', resetQuoteState);
  elements.clearSavedQuotes.addEventListener('click', () => {
    savedQuotes = [];
    setStorageItem(SAVED_QUOTES_STORAGE_KEY, savedQuotes);
    renderSavedQuotes();
  });
  elements.quoteLogout.addEventListener('click', logout);
}

async function apiJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || 'Unable to load the quote application.');
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function loadProgram() {
  const [{ user }, { config }] = await Promise.all([
    apiJson('/api/quote-app/auth/me'),
    apiJson(`/api/quote-app/config/${LOCKED_STATE}`)
  ]);
  settings = {
    authorizedStates: [LOCKED_STATE],
    rateConfig: { [LOCKED_STATE]: config.rateConfig },
    limits: { [LOCKED_STATE]: config.limits }
  };
  program = {
    organizationName: config.organizationName,
    programName: config.programName,
    disclaimer: config.disclaimer
  };

  const stateName = config.stateName || CSO_RATE_CONFIG[LOCKED_STATE].stateName;
  document.title = `${program.organizationName} | ${stateName} ${program.programName}`;
  elements.programOrganizationName.textContent = program.organizationName;
  elements.programName.textContent = program.programName;
  elements.programStateSubtitle.textContent = `${stateName} loan officer credit insurance estimates.`;
  elements.programDisclaimer.textContent = program.disclaimer;
  elements.headerStateBadge.textContent = `${LOCKED_STATE} - ${stateName}`;
  elements.coverageStateBadge.textContent = `${stateName} Program`;
  elements.quoteUserName.textContent = user.displayName || user.username;
}

async function logout() {
  try {
    await apiJson('/api/quote-app/auth/logout', { method: 'POST', body: '{}' });
  } finally {
    window.location.assign('/single-premium-quote/');
  }
}

async function initialize() {
  try {
    await loadProgram();
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      const returnTo = encodeURIComponent(window.location.pathname);
      window.location.replace(`/single-premium-quote/?returnTo=${returnTo}`);
      return;
    }
    showErrorList(elements.quoteErrors, [error.message]);
    elements.calculateButton.disabled = true;
    return;
  }
  hydrateQuoteForm(latestQuote?.inputs || defaultInputs());
  renderResults();
  initializeEvents();
  setScreen(screenFromHash(), false);
}

initialize();
