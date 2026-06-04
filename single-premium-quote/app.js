import {
  BORROWER_TYPES,
  CALCULATION_METHODS,
  COVERAGE_BASIS_TYPES,
  COVERAGE_TYPES,
  DEFAULT_ADMIN_PARAMETERS,
  DEFAULT_QUOTE_INPUTS,
  calculateQuote
} from './quote-engine.js';

const ADMIN_STORAGE_KEY = 'singlePremiumQuoteAdminParameters';
const LATEST_QUOTE_STORAGE_KEY = 'singlePremiumQuoteLatestQuote';
const SCREEN_NAMES = ['quote', 'results', 'formula', 'cases', 'admin'];

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

const SAMPLE_TEST_CASES = [
  {
    loanAmount: 10000,
    termMonths: 36,
    annualApr: 7.5,
    coverageType: 'life'
  },
  {
    loanAmount: 25000,
    termMonths: 60,
    annualApr: 7.5,
    coverageType: 'both'
  },
  {
    loanAmount: 50000,
    termMonths: 72,
    annualApr: 8,
    coverageType: 'disability'
  }
];

const elements = {
  screens: document.querySelectorAll('[data-screen]'),
  tabs: document.querySelectorAll('.sp-screen-tab'),
  screenButtons: document.querySelectorAll('[data-screen-target]'),
  quoteForm: document.getElementById('quote-form'),
  quoteErrors: document.getElementById('quote-errors'),
  quoteResetDefaults: document.getElementById('quote-reset-defaults'),
  emptyResults: document.getElementById('empty-results'),
  resultsContent: document.getElementById('results-content'),
  resultsIntro: document.getElementById('results-intro'),
  resultTotalPremium: document.getElementById('result-total-premium'),
  resultMethodLabel: document.getElementById('result-method-label'),
  resultSummary: document.getElementById('result-summary'),
  resultPaymentBefore: document.getElementById('result-payment-before'),
  resultFinancedAmount: document.getElementById('result-financed-amount'),
  resultPaymentAfter: document.getElementById('result-payment-after'),
  resultPaymentImpact: document.getElementById('result-payment-impact'),
  resultWarnings: document.getElementById('result-warnings'),
  copySummary: document.getElementById('copy-summary'),
  resetQuote: document.getElementById('reset-quote'),
  copyStatus: document.getElementById('copy-status'),
  currentAssumptions: document.getElementById('current-assumptions'),
  testCaseBody: document.getElementById('test-case-body'),
  adminForm: document.getElementById('admin-form'),
  adminReset: document.getElementById('admin-reset'),
  adminStatus: document.getElementById('admin-status')
};

let adminParameters = loadAdminParameters();
let latestQuote = loadLatestQuote();

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

function loadAdminParameters() {
  const stored = getStorageItem(ADMIN_STORAGE_KEY);
  return {
    ...DEFAULT_ADMIN_PARAMETERS,
    ...(stored && typeof stored === 'object' ? stored : {})
  };
}

function loadLatestQuote() {
  const stored = getStorageItem(LATEST_QUOTE_STORAGE_KEY);
  return stored && stored.result && stored.inputs ? stored : null;
}

function quoteDefaultsFromParameters() {
  return {
    ...DEFAULT_QUOTE_INPUTS,
    lifeRate: adminParameters.defaultLifeRate,
    disabilityRate: adminParameters.defaultDisabilityRate,
    coverageBasis: adminParameters.defaultCoverageBasis,
    calculationMethod: adminParameters.defaultCalculationMethod
  };
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
    loanAmount: getNumericFieldValue(elements.quoteForm, 'loanAmount'),
    termMonths: getNumericFieldValue(elements.quoteForm, 'termMonths'),
    annualApr: getNumericFieldValue(elements.quoteForm, 'annualApr'),
    coverageType: getFieldValue(elements.quoteForm, 'coverageType'),
    coverageBasis: getFieldValue(elements.quoteForm, 'coverageBasis'),
    borrowerType: getFieldValue(elements.quoteForm, 'borrowerType'),
    calculationMethod: getFieldValue(elements.quoteForm, 'calculationMethod'),
    lifeRate: getNumericFieldValue(elements.quoteForm, 'lifeRate'),
    disabilityRate: getNumericFieldValue(elements.quoteForm, 'disabilityRate')
  };
}

function hydrateQuoteForm(inputs) {
  const values = { ...quoteDefaultsFromParameters(), ...inputs };
  setFieldValue(elements.quoteForm, 'loanAmount', values.loanAmount);
  setFieldValue(elements.quoteForm, 'termMonths', values.termMonths);
  setFieldValue(elements.quoteForm, 'annualApr', values.annualApr);
  setFieldValue(elements.quoteForm, 'coverageType', values.coverageType);
  setFieldValue(elements.quoteForm, 'coverageBasis', values.coverageBasis);
  setFieldValue(elements.quoteForm, 'borrowerType', values.borrowerType);
  setFieldValue(elements.quoteForm, 'calculationMethod', values.calculationMethod);
  setFieldValue(elements.quoteForm, 'lifeRate', values.lifeRate);
  setFieldValue(elements.quoteForm, 'disabilityRate', values.disabilityRate);
}

function readAdminForm() {
  return {
    defaultLifeRate: getNumericFieldValue(elements.adminForm, 'defaultLifeRate'),
    defaultDisabilityRate: getNumericFieldValue(elements.adminForm, 'defaultDisabilityRate'),
    defaultCalculationMethod: getFieldValue(elements.adminForm, 'defaultCalculationMethod'),
    defaultCoverageBasis: getFieldValue(elements.adminForm, 'defaultCoverageBasis'),
    jointBorrowerRateFactor: getNumericFieldValue(elements.adminForm, 'jointBorrowerRateFactor'),
    warningTermMonths: getNumericFieldValue(elements.adminForm, 'warningTermMonths'),
    warningLoanAmount: getNumericFieldValue(elements.adminForm, 'warningLoanAmount'),
    carrierFormulaStatus: getFieldValue(elements.adminForm, 'carrierFormulaStatus').trim()
  };
}

function hydrateAdminForm(parameters) {
  setFieldValue(elements.adminForm, 'defaultLifeRate', parameters.defaultLifeRate);
  setFieldValue(elements.adminForm, 'defaultDisabilityRate', parameters.defaultDisabilityRate);
  setFieldValue(elements.adminForm, 'defaultCalculationMethod', parameters.defaultCalculationMethod);
  setFieldValue(elements.adminForm, 'defaultCoverageBasis', parameters.defaultCoverageBasis);
  setFieldValue(elements.adminForm, 'jointBorrowerRateFactor', parameters.jointBorrowerRateFactor);
  setFieldValue(elements.adminForm, 'warningTermMonths', parameters.warningTermMonths);
  setFieldValue(elements.adminForm, 'warningLoanAmount', parameters.warningLoanAmount);
  setFieldValue(elements.adminForm, 'carrierFormulaStatus', parameters.carrierFormulaStatus);
}

function validateQuoteInputs(inputs) {
  const errors = [];

  if (inputs.loanAmount <= 0) {
    errors.push('Loan amount must be greater than 0.');
  }

  if (inputs.termMonths <= 0) {
    errors.push('Loan term must be greater than 0 months.');
  }

  if (inputs.annualApr < 0) {
    errors.push('APR must be 0 or greater.');
  }

  if (inputs.lifeRate < 0 || inputs.disabilityRate < 0) {
    errors.push('Life and disability rates must be 0 or greater.');
  }

  return errors;
}

function validateAdminParameters(parameters) {
  const errors = [];

  if (parameters.defaultLifeRate < 0 || parameters.defaultDisabilityRate < 0) {
    errors.push('Default rates must be 0 or greater.');
  }

  if (parameters.jointBorrowerRateFactor < 0) {
    errors.push('Joint borrower rate factor must be 0 or greater.');
  }

  if (parameters.warningTermMonths <= 0) {
    errors.push('Term warning threshold must be greater than 0.');
  }

  if (parameters.warningLoanAmount < 0) {
    errors.push('Loan amount warning threshold must be 0 or greater.');
  }

  if (!parameters.carrierFormulaStatus) {
    errors.push('Carrier formula status note is required.');
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

function renderSummaryGrid(result) {
  const rows = [
    ['Loan amount', formatCurrency(result.loanAmount)],
    ['Term', `${result.termMonths} months`],
    ['APR', formatPercent(result.annualApr)],
    ['Coverage selected', COVERAGE_TYPES[result.coverageType] || result.coverageType],
    ['Coverage basis', COVERAGE_BASIS_TYPES[result.coverageBasis] || result.coverageBasis],
    ['Borrower type', BORROWER_TYPES[result.borrowerType] || result.borrowerType],
    ['Calculation method used', CALCULATION_METHODS[result.calculationMethod] || result.calculationMethod],
    ['Life premium', formatCurrency(result.lifePremium)],
    ['Disability premium', formatCurrency(result.disabilityPremium)]
  ];

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

function renderAssumptions(result) {
  const assumptions = result?.assumptions?.length
    ? result.assumptions
    : ['No quote has been calculated yet.'];
  elements.currentAssumptions.innerHTML = assumptions
    .map((assumption) => `<li>${escapeHtml(assumption)}</li>`)
    .join('');
}

function renderResults() {
  if (!latestQuote) {
    elements.emptyResults.hidden = false;
    elements.resultsContent.hidden = true;
    elements.resultsIntro.textContent = 'Calculate a quote to view the premium result.';
    renderAssumptions(null);
    return;
  }

  const { result } = latestQuote;
  elements.emptyResults.hidden = true;
  elements.resultsContent.hidden = false;
  elements.resultsIntro.textContent = 'Review the estimated premium and financed payment impact.';
  elements.resultTotalPremium.textContent = formatCurrency(result.totalPremium);
  elements.resultMethodLabel.textContent = CALCULATION_METHODS[result.calculationMethod] || result.calculationMethod;
  elements.resultPaymentBefore.textContent = formatCurrency(result.monthlyPayment);
  elements.resultFinancedAmount.textContent = formatCurrency(result.amountFinancedWithPremium);
  elements.resultPaymentAfter.textContent = formatCurrency(result.monthlyPaymentWithPremium);
  elements.resultPaymentImpact.textContent = formatCurrency(result.monthlyPaymentImpact);
  renderSummaryGrid(result);
  renderWarnings(result);
  renderAssumptions(result);
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
  const result = calculateQuote(inputs, adminParameters);
  saveLatestQuote(inputs, result);
  renderResults();
  renderTestCases();
  setScreen('results');
}

function quoteSummaryText() {
  if (!latestQuote) {
    return '';
  }

  const { result } = latestQuote;

  return `Single Premium Quote Prototype

Loan Amount: ${formatCurrency(result.loanAmount)}
Term: ${result.termMonths} months
APR: ${formatPercent(result.annualApr)}
Coverage: ${COVERAGE_TYPES[result.coverageType] || result.coverageType}
Calculation Method: ${CALCULATION_METHODS[result.calculationMethod] || result.calculationMethod}

Life Premium: ${formatCurrency(result.lifePremium)}
Disability Premium: ${formatCurrency(result.disabilityPremium)}
Total Single Premium: ${formatCurrency(result.totalPremium)}

Estimated Monthly Payment Without Premium: ${formatCurrency(result.monthlyPayment)}
Estimated Monthly Payment With Premium Financed: ${formatCurrency(result.monthlyPaymentWithPremium)}
Estimated Monthly Impact: ${formatCurrency(result.monthlyPaymentImpact)}

Prototype disclaimer:
This is a demonstration quote only. Final premium must be validated using the carrier-approved formula, rate tables, rounding rules, eligibility rules, and test cases.`;
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

function renderTestCases() {
  elements.testCaseBody.innerHTML = SAMPLE_TEST_CASES.map((testCase) => {
    const inputs = {
      ...quoteDefaultsFromParameters(),
      ...testCase,
      coverageBasis: 'reducing',
      borrowerType: 'single',
      calculationMethod: 'annuity'
    };
    const result = calculateQuote(inputs, adminParameters);

    return `
      <tr>
        <td>
          <strong>${formatCurrency(inputs.loanAmount)}</strong><br />
          ${inputs.termMonths} months<br />
          ${formatPercent(inputs.annualApr)} APR
        </td>
        <td>${COVERAGE_TYPES[inputs.coverageType]}</td>
        <td>${CALCULATION_METHODS[inputs.calculationMethod]}</td>
        <td><strong>${formatCurrency(result.totalPremium)}</strong></td>
      </tr>
    `;
  }).join('');
}

function resetQuoteState() {
  latestQuote = null;
  removeStorageItem(LATEST_QUOTE_STORAGE_KEY);
  hydrateQuoteForm(quoteDefaultsFromParameters());
  renderResults();
  setStatus(elements.copyStatus, '');
  setScreen('quote');
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
    hydrateQuoteForm(quoteDefaultsFromParameters());
    showErrorList(elements.quoteErrors, []);
  });

  elements.copySummary.addEventListener('click', copyQuoteSummary);

  elements.resetQuote.addEventListener('click', resetQuoteState);

  elements.adminForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextParameters = readAdminForm();
    const errors = validateAdminParameters(nextParameters);

    if (errors.length) {
      setStatus(elements.adminStatus, errors.join(' '), true);
      return;
    }

    adminParameters = {
      ...DEFAULT_ADMIN_PARAMETERS,
      ...nextParameters
    };
    setStorageItem(ADMIN_STORAGE_KEY, adminParameters);
    hydrateAdminForm(adminParameters);
    hydrateQuoteForm({
      ...readQuoteForm(),
      lifeRate: adminParameters.defaultLifeRate,
      disabilityRate: adminParameters.defaultDisabilityRate,
      coverageBasis: adminParameters.defaultCoverageBasis,
      calculationMethod: adminParameters.defaultCalculationMethod
    });
    renderTestCases();
    setStatus(elements.adminStatus, 'Parameters saved and applied to quote defaults.');
  });

  elements.adminReset.addEventListener('click', () => {
    adminParameters = { ...DEFAULT_ADMIN_PARAMETERS };
    setStorageItem(ADMIN_STORAGE_KEY, adminParameters);
    hydrateAdminForm(adminParameters);
    hydrateQuoteForm(quoteDefaultsFromParameters());
    renderTestCases();
    setStatus(elements.adminStatus, 'Demo defaults restored.');
  });
}

function initialize() {
  hydrateAdminForm(adminParameters);
  hydrateQuoteForm(latestQuote?.inputs || quoteDefaultsFromParameters());
  renderResults();
  renderTestCases();
  initializeEvents();
  setScreen(screenFromHash(), false);
}

initialize();
