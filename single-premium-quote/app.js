import { demoRates as defaultDemoRates } from './src/data/demoRates.js';
import {
  BORROWER_TYPES,
  CALCULATION_METHODS,
  COVERAGE_TYPES,
  DEFAULT_QUOTE_INPUTS,
  PREMIUM_TREATMENTS,
  PROTOTYPE_DISCLAIMER,
  SUPPORTED_STATES,
  calculateQuote,
  coverageIncludesDisability
} from './quote-engine.js';

const RATE_STORAGE_KEY = 'premiumQuoteProDemoRates';
const LATEST_QUOTE_STORAGE_KEY = 'premiumQuoteProLatestQuote';
const SAVED_QUOTES_STORAGE_KEY = 'premiumQuoteProSavedQuotes';
const SCREEN_NAMES = ['quote', 'results', 'formula', 'cases', 'validation'];

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

const TEST_CASES = [
  {
    name: 'Missouri Auto Loan - Life + Disability',
    inputs: {
      state: 'MO',
      loanAmount: 25000,
      termMonths: 60,
      annualApr: 7.5,
      coverageType: 'both',
      borrowerType: 'single',
      premiumTreatment: 'financed'
    }
  },
  {
    name: 'Arkansas Personal Loan - Life Only',
    inputs: {
      state: 'AR',
      loanAmount: 10000,
      termMonths: 36,
      annualApr: 9,
      coverageType: 'life',
      borrowerType: 'single',
      premiumTreatment: 'separate'
    }
  },
  {
    name: 'Missouri Disability Only',
    inputs: {
      state: 'MO',
      loanAmount: 18000,
      termMonths: 48,
      annualApr: 8.25,
      coverageType: 'disability',
      borrowerType: 'single',
      premiumTreatment: 'financed'
    }
  },
  {
    name: 'Arkansas Joint Borrower Warning',
    inputs: {
      state: 'AR',
      loanAmount: 30000,
      termMonths: 72,
      annualApr: 7,
      coverageType: 'both',
      borrowerType: 'joint',
      premiumTreatment: 'financed'
    },
    expectedWarning: 'Joint borrower rules pending carrier confirmation.'
  },
  {
    name: 'High Amount Warning',
    inputs: {
      state: 'MO',
      loanAmount: 125000,
      termMonths: 120,
      annualApr: 8,
      coverageType: 'both',
      borrowerType: 'single',
      premiumTreatment: 'financed'
    },
    expectedWarning: 'Loan amount exceeds demo threshold. Carrier maximum must be confirmed.'
  }
];

const elements = {
  screens: document.querySelectorAll('[data-screen]'),
  tabs: document.querySelectorAll('.sp-screen-tab'),
  screenButtons: document.querySelectorAll('[data-screen-target]'),
  quoteForm: document.getElementById('quote-form'),
  quoteErrors: document.getElementById('quote-errors'),
  quoteResetDefaults: document.getElementById('quote-reset-defaults'),
  state: document.getElementById('state'),
  coverageType: document.getElementById('coverage-type'),
  borrowerType: document.getElementById('borrower-type'),
  premiumTreatment: document.getElementById('premium-treatment'),
  includePremiumInInsuredBalance: document.getElementById('include-premium-insured-balance'),
  insuredBalanceField: document.getElementById('insured-balance-field'),
  insuredBalanceWarning: document.getElementById('insured-balance-warning'),
  disabilityEmployment: document.getElementById('disability-employment'),
  jointWarning: document.getElementById('joint-warning'),
  rateState: document.getElementById('rate-state'),
  rateLife: document.getElementById('rate-life'),
  rateDisability: document.getElementById('rate-disability'),
  rateDiscount: document.getElementById('rate-discount'),
  rateStatus: document.getElementById('rate-status'),
  saveRates: document.getElementById('save-rates'),
  resetRates: document.getElementById('reset-rates'),
  emptyResults: document.getElementById('empty-results'),
  resultsContent: document.getElementById('results-content'),
  resultsIntro: document.getElementById('results-intro'),
  resultTotalPremium: document.getElementById('result-total-premium'),
  resultLifePremium: document.getElementById('result-life-premium'),
  resultDisabilityPremium: document.getElementById('result-disability-premium'),
  resultState: document.getElementById('result-state'),
  resultCoverage: document.getElementById('result-coverage'),
  resultDisabilityBadge: document.getElementById('result-disability-badge'),
  resultSummary: document.getElementById('result-summary'),
  resultBadges: document.getElementById('result-badges'),
  resultWarnings: document.getElementById('result-warnings'),
  copySummary: document.getElementById('copy-summary'),
  saveQuote: document.getElementById('save-quote'),
  resetQuote: document.getElementById('reset-quote'),
  copyStatus: document.getElementById('copy-status'),
  savedQuotesList: document.getElementById('saved-quotes-list'),
  clearSavedQuotes: document.getElementById('clear-saved-quotes'),
  testCaseBody: document.getElementById('test-case-body')
};

let demoRates = loadDemoRates();
let latestQuote = loadLatestQuote();
let savedQuotes = loadSavedQuotes();

function cloneRates(rates) {
  return JSON.parse(JSON.stringify(rates));
}

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

function loadDemoRates() {
  const stored = getStorageItem(RATE_STORAGE_KEY);
  return {
    ...cloneRates(defaultDemoRates),
    ...(stored && typeof stored === 'object' ? stored : {})
  };
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

function readQuoteForm() {
  return {
    state: getFieldValue(elements.quoteForm, 'state'),
    loanAmount: getNumericFieldValue(elements.quoteForm, 'loanAmount'),
    termMonths: getNumericFieldValue(elements.quoteForm, 'termMonths'),
    annualApr: getNumericFieldValue(elements.quoteForm, 'annualApr'),
    coverageType: getFieldValue(elements.quoteForm, 'coverageType'),
    borrowerType: getFieldValue(elements.quoteForm, 'borrowerType'),
    premiumTreatment: getFieldValue(elements.quoteForm, 'premiumTreatment'),
    includePremiumInInsuredBalance:
      getFieldValue(elements.quoteForm, 'includePremiumInInsuredBalance') === 'yes',
    activelyWorking: getFieldValue(elements.quoteForm, 'activelyWorking') === 'yes',
    hoursWorkedPerWeek: getNumericFieldValue(elements.quoteForm, 'hoursWorkedPerWeek'),
    calculationMethod: getFieldValue(elements.quoteForm, 'calculationMethod')
  };
}

function hydrateQuoteForm(inputs = {}) {
  const values = { ...DEFAULT_QUOTE_INPUTS, ...inputs };
  setFieldValue(elements.quoteForm, 'state', values.state);
  setFieldValue(elements.quoteForm, 'loanAmount', values.loanAmount);
  setFieldValue(elements.quoteForm, 'termMonths', values.termMonths);
  setFieldValue(elements.quoteForm, 'annualApr', values.annualApr);
  setFieldValue(elements.quoteForm, 'coverageType', values.coverageType);
  setFieldValue(elements.quoteForm, 'borrowerType', values.borrowerType);
  setFieldValue(elements.quoteForm, 'premiumTreatment', values.premiumTreatment);
  setFieldValue(
    elements.quoteForm,
    'includePremiumInInsuredBalance',
    values.includePremiumInInsuredBalance ? 'yes' : 'no'
  );
  setFieldValue(elements.quoteForm, 'activelyWorking', values.activelyWorking ? 'yes' : 'no');
  setFieldValue(elements.quoteForm, 'hoursWorkedPerWeek', values.hoursWorkedPerWeek);
  setFieldValue(elements.quoteForm, 'calculationMethod', values.calculationMethod);
  updateConditionalFields();
}

function validateQuoteInputs(inputs) {
  const errors = [];

  if (!SUPPORTED_STATES[inputs.state]) {
    errors.push('State must be Missouri or Arkansas.');
  }

  if (inputs.loanAmount <= 0) {
    errors.push('Loan amount must be greater than 0.');
  }

  if (inputs.termMonths <= 0) {
    errors.push('Loan term must be greater than 0 months.');
  }

  if (inputs.annualApr < 0) {
    errors.push('APR / note rate must be 0 or greater.');
  }

  if (inputs.hoursWorkedPerWeek < 0) {
    errors.push('Hours worked per week must be 0 or greater.');
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
    if (tab.dataset.screenTarget === nextScreen) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
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
  const coverageType = elements.coverageType.value;
  const premiumTreatment = elements.premiumTreatment.value;
  const borrowerType = elements.borrowerType.value;
  const includePremium = elements.includePremiumInInsuredBalance.value === 'yes';
  const hasDisability = coverageIncludesDisability(coverageType);

  elements.disabilityEmployment.hidden = !hasDisability;
  elements.resultDisabilityBadge.hidden = latestQuote
    ? !coverageIncludesDisability(latestQuote.result.coverageType)
    : !hasDisability;
  elements.insuredBalanceField.hidden = premiumTreatment !== 'financed';
  elements.insuredBalanceWarning.hidden = premiumTreatment !== 'financed' || !includePremium;
  elements.jointWarning.hidden = borrowerType !== 'joint';
}

function hydrateRateFields(state = elements.rateState.value || 'MO') {
  const rates = demoRates[state] || defaultDemoRates[state];
  elements.rateState.value = state;
  elements.rateLife.value = rates.lifeRatePerThousandGrossPay;
  elements.rateDisability.value = rates.disabilitySevenDayRetroRatePerThousandGrossPay;
  elements.rateDiscount.value = rates.discountRateMonthly;
}

function saveRateFields() {
  const state = elements.rateState.value;
  const nextRates = {
    lifeRatePerThousandGrossPay: Number(elements.rateLife.value),
    disabilitySevenDayRetroRatePerThousandGrossPay: Number(elements.rateDisability.value),
    discountRateMonthly: Number(elements.rateDiscount.value)
  };

  if (
    nextRates.lifeRatePerThousandGrossPay < 0 ||
    nextRates.disabilitySevenDayRetroRatePerThousandGrossPay < 0 ||
    nextRates.discountRateMonthly < 0
  ) {
    setStatus(elements.rateStatus, 'Demo rates must be 0 or greater.', true);
    return;
  }

  demoRates = {
    ...demoRates,
    [state]: nextRates
  };
  setStorageItem(RATE_STORAGE_KEY, demoRates);
  renderTestCases();
  setStatus(elements.rateStatus, `${SUPPORTED_STATES[state]} demo rates saved.`);
}

function resetRateFields() {
  demoRates = cloneRates(defaultDemoRates);
  setStorageItem(RATE_STORAGE_KEY, demoRates);
  hydrateRateFields(elements.rateState.value);
  renderTestCases();
  setStatus(elements.rateStatus, 'Demo rates restored.');
}

function badge(label) {
  return `<span class="sp-badge">${escapeHtml(label)}</span>`;
}

function renderResultBadges(result) {
  const badges = [
    result.state,
    'Monthly Payments',
    'Gross Pay',
    coverageIncludesDisability(result.coverageType) ? '7-Day Retro' : null,
    'Demo Formula',
    'Carrier Validation Pending'
  ].filter(Boolean);

  elements.resultBadges.innerHTML = badges.map(badge).join('');
}

function renderSummaryGrid(result) {
  const rows = [
    ['Loan Amount', formatCurrency(result.loanAmount)],
    ['Term in Months', `${result.termMonths} months`],
    ['APR', formatPercent(result.annualApr)],
    ['Estimated Monthly Payment', formatCurrency(result.monthlyPayment)],
    ['Premium Treatment', PREMIUM_TREATMENTS[result.premiumTreatment]],
    ['Gross Pay Exposure', formatCurrency(result.grossPayBase)],
    ['Calculation Method', CALCULATION_METHODS[result.calculationMethod]]
  ];

  if (result.premiumTreatment === 'financed') {
    rows.push(
      ['Amount Financed With Premium', formatCurrency(result.amountFinancedWithPremium)],
      ['Estimated Payment With Premium', formatCurrency(result.monthlyPaymentWithPremium)],
      ['Estimated Monthly Payment Impact', formatCurrency(result.monthlyPaymentImpact)]
    );
  }

  elements.resultSummary.innerHTML = rows
    .map(
      ([label, value]) => `
        <div>
          <dt>${label}</dt>
          <dd>${value}</dd>
        </div>
      `
    )
    .join('');
}

function renderWarnings(result) {
  showErrorList(elements.resultWarnings, result.warnings || []);
}

function renderResults() {
  if (!latestQuote) {
    elements.emptyResults.hidden = false;
    elements.resultsContent.hidden = true;
    elements.resultsIntro.textContent = 'Calculate a quote to view the premium result.';
    renderSavedQuotes();
    return;
  }

  const { result } = latestQuote;
  elements.emptyResults.hidden = true;
  elements.resultsContent.hidden = false;
  elements.resultsIntro.textContent = 'Review the focused monthly gross-pay result.';
  elements.resultTotalPremium.textContent = formatCurrency(result.totalPremium);
  elements.resultLifePremium.textContent = formatCurrency(result.lifePremium);
  elements.resultDisabilityPremium.textContent = formatCurrency(result.disabilityPremium);
  elements.resultState.textContent = `${result.state} - ${SUPPORTED_STATES[result.state]}`;
  elements.resultCoverage.textContent = COVERAGE_TYPES[result.coverageType];
  elements.resultDisabilityBadge.hidden = !coverageIncludesDisability(result.coverageType);
  renderSummaryGrid(result);
  renderResultBadges(result);
  renderWarnings(result);
  renderSavedQuotes();
}

function saveLatestQuote(inputs, result) {
  latestQuote = {
    inputs,
    result,
    savedAt: new Date().toISOString()
  };
  setStorageItem(LATEST_QUOTE_STORAGE_KEY, latestQuote);
}

function calculateAndRenderQuote(inputs) {
  const result = calculateQuote(inputs, demoRates);
  saveLatestQuote(inputs, result);
  renderResults();
  renderTestCases();
  updateConditionalFields();
  setScreen('results');
}

function quoteSummaryText() {
  if (!latestQuote) {
    return '';
  }

  const { result } = latestQuote;
  const lines = [
    'PremiumQuote Pro',
    'Monthly Single Premium Credit Insurance Quote Prototype',
    '',
    `State: ${SUPPORTED_STATES[result.state]} (${result.state})`,
    `Loan Amount: ${formatCurrency(result.loanAmount)}`,
    `Term: ${result.termMonths} months`,
    `APR / Note Rate: ${formatPercent(result.annualApr)}`,
    `Coverage: ${COVERAGE_TYPES[result.coverageType]}`,
    `Borrower Type: ${BORROWER_TYPES[result.borrowerType]}`,
    `Premium Treatment: ${PREMIUM_TREATMENTS[result.premiumTreatment]}`,
    'Payment Frequency: Monthly only',
    'Coverage Basis: Gross Pay',
    coverageIncludesDisability(result.coverageType) ? 'Disability: 7-Day Retro' : null,
    '',
    `Life Premium: ${formatCurrency(result.lifePremium)}`,
    `Disability Premium: ${formatCurrency(result.disabilityPremium)}`,
    `Total Single Premium: ${formatCurrency(result.totalPremium)}`,
    '',
    `Estimated Monthly Payment: ${formatCurrency(result.monthlyPayment)}`,
    result.premiumTreatment === 'financed'
      ? `Estimated Payment With Premium Financed: ${formatCurrency(result.monthlyPaymentWithPremium)}`
      : null,
    result.premiumTreatment === 'financed'
      ? `Estimated Monthly Impact: ${formatCurrency(result.monthlyPaymentImpact)}`
      : null,
    '',
    PROTOTYPE_DISCLAIMER
  ].filter((line) => line !== null);

  return lines.join('\n');
}

async function copyQuoteSummary() {
  const summary = quoteSummaryText();

  if (!summary) {
    setStatus(elements.copyStatus, 'Calculate a quote before copying a summary.', true);
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(summary);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = summary;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.top = '-1000px';
      document.body.append(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    setStatus(elements.copyStatus, 'Quote summary copied.');
  } catch (error) {
    console.warn('Unable to copy quote summary.', error);
    setStatus(elements.copyStatus, 'Copy failed. Select the quote summary manually and try again.', true);
  }
}

function saveCurrentQuoteCard() {
  if (!latestQuote) {
    setStatus(elements.copyStatus, 'Calculate a quote before saving.', true);
    return;
  }

  const nextSavedQuote = {
    id: `quote-${Date.now()}`,
    savedAt: new Date().toISOString(),
    result: latestQuote.result
  };
  savedQuotes = [nextSavedQuote, ...savedQuotes].slice(0, 12);
  setStorageItem(SAVED_QUOTES_STORAGE_KEY, savedQuotes);
  renderSavedQuotes();
  setStatus(elements.copyStatus, 'Quote card saved.');
}

function renderSavedQuotes() {
  if (!elements.savedQuotesList) {
    return;
  }

  if (!savedQuotes.length) {
    elements.savedQuotesList.innerHTML = '<p class="sp-empty-note">No saved quote cards yet.</p>';
    return;
  }

  elements.savedQuotesList.innerHTML = savedQuotes
    .map(({ result }) => {
      const hasDisability = coverageIncludesDisability(result.coverageType);
      return `
        <article class="sp-saved-card">
          <div>
            <span class="sp-badge">${escapeHtml(result.state)}</span>
            <span class="sp-badge">Gross Pay</span>
            ${hasDisability ? '<span class="sp-badge">7-Day Retro</span>' : ''}
          </div>
          <h4>${escapeHtml(COVERAGE_TYPES[result.coverageType])}</h4>
          <p>${formatCurrency(result.loanAmount)} - ${result.termMonths} months</p>
          <strong>${formatCurrency(result.totalPremium)}</strong>
          <small>Demo formula status: Carrier Formula Pending</small>
        </article>
      `;
    })
    .join('');
}

function resetQuoteState() {
  latestQuote = null;
  removeStorageItem(LATEST_QUOTE_STORAGE_KEY);
  hydrateQuoteForm(DEFAULT_QUOTE_INPUTS);
  renderResults();
  setStatus(elements.copyStatus, '');
  setScreen('quote');
}

function renderTestCases() {
  elements.testCaseBody.innerHTML = TEST_CASES.map((testCase) => {
    const inputs = {
      ...DEFAULT_QUOTE_INPUTS,
      ...testCase.inputs,
      calculationMethod: 'smart'
    };
    const result = calculateQuote(inputs, demoRates);
    const expectedWarning = testCase.expectedWarning
      ? `<br /><small>Expected warning: ${escapeHtml(testCase.expectedWarning)}</small>`
      : '';

    return `
      <tr>
        <td><strong>${escapeHtml(testCase.name)}</strong>${expectedWarning}</td>
        <td>
          ${result.state} - ${formatCurrency(result.loanAmount)}<br />
          ${result.termMonths} months<br />
          ${formatPercent(result.annualApr)} APR
        </td>
        <td>
          ${escapeHtml(COVERAGE_TYPES[result.coverageType])}<br />
          ${escapeHtml(BORROWER_TYPES[result.borrowerType])}<br />
          Gross Pay${coverageIncludesDisability(result.coverageType) ? '<br />7-Day Retro' : ''}
        </td>
        <td>${escapeHtml(PREMIUM_TREATMENTS[result.premiumTreatment])}</td>
        <td><strong>${formatCurrency(result.totalPremium)}</strong></td>
      </tr>
    `;
  }).join('');
}

function initializeEvents() {
  elements.screenButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setScreen(button.dataset.screenTarget);
    });
  });

  window.addEventListener('hashchange', () => {
    setScreen(screenFromHash(), false);
  });

  [
    elements.coverageType,
    elements.borrowerType,
    elements.premiumTreatment,
    elements.includePremiumInInsuredBalance
  ].forEach((element) => {
    element.addEventListener('change', updateConditionalFields);
  });

  elements.rateState.addEventListener('change', () => hydrateRateFields(elements.rateState.value));
  elements.saveRates.addEventListener('click', saveRateFields);
  elements.resetRates.addEventListener('click', resetRateFields);

  elements.quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputs = readQuoteForm();
    const errors = validateQuoteInputs(inputs);
    showErrorList(elements.quoteErrors, errors);

    if (errors.length) {
      return;
    }

    calculateAndRenderQuote(inputs);
  });

  elements.quoteResetDefaults.addEventListener('click', () => {
    hydrateQuoteForm(DEFAULT_QUOTE_INPUTS);
    showErrorList(elements.quoteErrors, []);
  });

  elements.copySummary.addEventListener('click', copyQuoteSummary);
  elements.saveQuote.addEventListener('click', saveCurrentQuoteCard);
  elements.resetQuote.addEventListener('click', resetQuoteState);
  elements.clearSavedQuotes.addEventListener('click', () => {
    savedQuotes = [];
    setStorageItem(SAVED_QUOTES_STORAGE_KEY, savedQuotes);
    renderSavedQuotes();
  });
}

function initialize() {
  hydrateRateFields('MO');
  hydrateQuoteForm(latestQuote?.inputs || DEFAULT_QUOTE_INPUTS);
  renderResults();
  renderTestCases();
  initializeEvents();
  updateConditionalFields();
  setScreen(screenFromHash(), false);
}

initialize();
