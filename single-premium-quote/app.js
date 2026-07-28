import {
  BORROWER_TYPES,
  COVERAGE_TYPES,
  DEFAULT_QUOTE_INPUTS,
  LOAN_TYPES,
  PAYMENT_FREQUENCIES,
  calculateQuote
} from './quote-engine.js';
import { CSO_LIMITS, UNSUPPORTED_LOAN_TYPE_WARNING } from './src/data/csoLimits.js';
import { CSO_RATE_CONFIG } from './src/data/csoRates.js';

const path = window.location.pathname.toLowerCase();
const LOCKED_STATE = path.includes('/arkansas') ? 'AR' : 'MO';
const stateConfig = CSO_RATE_CONFIG[LOCKED_STATE];
const stateLimits = CSO_LIMITS[LOCKED_STATE];
const STORAGE_KEY = `gfsCreditProtectionQuote:${LOCKED_STATE}`;

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
  form: document.getElementById('quote-form'),
  state: document.getElementById('state'),
  stateName: document.getElementById('state-name'),
  stateProgram: document.getElementById('state-program'),
  paymentFrequency: document.getElementById('payment-frequency'),
  daysToFirstPayment: document.getElementById('days-to-first-payment'),
  borrowerType: document.getElementById('borrower-type'),
  coBorrowerDobField: document.getElementById('co-borrower-dob-field'),
  errors: document.getElementById('quote-errors'),
  emptyResults: document.getElementById('empty-results'),
  resultsContent: document.getElementById('results-content'),
  totalPremium: document.getElementById('result-total-premium'),
  lifePremium: document.getElementById('result-life-premium'),
  disabilityPremium: document.getElementById('result-disability-premium'),
  keyResults: document.getElementById('key-results'),
  coverageDetails: document.getElementById('coverage-details'),
  warnings: document.getElementById('result-warnings'),
  reset: document.getElementById('reset-form'),
  copy: document.getElementById('copy-summary'),
  print: document.getElementById('print-quote'),
  copyStatus: document.getElementById('copy-status')
};

let latestQuote = loadStoredQuote();

function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

function formatPercent(value) {
  return `${percentFormatter.format(Number(value) || 0)}%`;
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

function loadStoredQuote() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return stored?.inputs && stored?.result ? stored : null;
  } catch {
    return null;
  }
}

function saveStoredQuote(quote) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(quote));
  } catch {
    // Quoting still works when browser storage is unavailable.
  }
}

function clearStoredQuote() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing else is required when browser storage is unavailable.
  }
}

function setValue(name, value) {
  const field = elements.form.elements[name];
  if (field) field.value = value ?? '';
}

function hydrateForm(inputs = defaultInputs()) {
  const values = { ...defaultInputs(), ...inputs, state: LOCKED_STATE };
  Object.entries(values).forEach(([name, value]) => setValue(name, value));
  updateConditionalFields(false);
}

function numberValue(name) {
  return Number(elements.form.elements[name]?.value);
}

function textValue(name) {
  return elements.form.elements[name]?.value || '';
}

function readInputs() {
  return {
    state: LOCKED_STATE,
    loanAmount: numberValue('loanAmount'),
    loanFee: numberValue('loanFee'),
    prepaidFees: numberValue('prepaidFees'),
    interestRate: numberValue('interestRate'),
    numberOfPayments: numberValue('numberOfPayments'),
    paymentFrequency: textValue('paymentFrequency'),
    daysToFirstPayment: numberValue('daysToFirstPayment'),
    closingDate: textValue('closingDate'),
    borrowerDateOfBirth: textValue('borrowerDateOfBirth'),
    coBorrowerDateOfBirth: textValue('coBorrowerDateOfBirth'),
    loanType: textValue('loanType'),
    coverageType: textValue('coverageType'),
    borrowerType: textValue('borrowerType'),
    disabilityPlan: 'sevenDayRetro',
    calculationMethod: 'carrierGross',
    premiumTreatment: 'financed',
    includePremiumInInsuredBalance: true
  };
}

function validate(inputs) {
  const errors = [];
  if (inputs.loanAmount <= 0) errors.push('Enter a loan amount greater than $0.');
  if (inputs.loanFee < 0) errors.push('Loan fee cannot be negative.');
  if (inputs.prepaidFees < 0) errors.push('Prepaid fees cannot be negative.');
  if (inputs.interestRate < 0) errors.push('Interest rate cannot be negative.');
  if (inputs.numberOfPayments <= 0) errors.push('Enter at least one payment.');
  if (inputs.daysToFirstPayment < 0) errors.push('Days to first payment cannot be negative.');
  if (stateLimits.unsupportedLoanTypes.includes(inputs.loanType)) {
    errors.push(UNSUPPORTED_LOAN_TYPE_WARNING);
  }
  return errors;
}

function renderErrors(errors) {
  elements.errors.replaceChildren();
  elements.errors.hidden = errors.length === 0;
  if (!errors.length) return;

  const list = document.createElement('ul');
  errors.forEach((message) => {
    const item = document.createElement('li');
    item.textContent = message;
    list.append(item);
  });
  elements.errors.append(list);
}

function detailRow(label, value) {
  const wrapper = document.createElement('div');
  const term = document.createElement('dt');
  const description = document.createElement('dd');
  term.textContent = label;
  description.textContent = value;
  wrapper.append(term, description);
  return wrapper;
}

function renderWarnings(result) {
  elements.warnings.replaceChildren();
  [...result.blockingWarnings, ...result.warnings].forEach((message) => {
    const alert = document.createElement('p');
    alert.className = 'sp-alert sp-alert--warning';
    alert.textContent = message;
    elements.warnings.append(alert);
  });
}

function renderResults() {
  const result = latestQuote?.result;
  elements.emptyResults.hidden = Boolean(result);
  elements.resultsContent.hidden = !result;
  if (!result) return;

  elements.totalPremium.textContent = formatCurrency(result.totalPremium);
  elements.lifePremium.textContent = formatCurrency(result.lifePremium);
  elements.disabilityPremium.textContent = formatCurrency(result.disabilityPremium);

  elements.keyResults.replaceChildren(
    detailRow('Amount financed', formatCurrency(result.amountFinanced)),
    detailRow(`${result.paymentFrequencyLabel} payment`, formatCurrency(result.regularPayment)),
    detailRow('Estimated APR', formatPercent(result.estimatedApr)),
    detailRow('Total of payments', formatCurrency(result.totalPayments))
  );

  const lifeCoverage = result.originalLifeAmountOfCoverage
    ? formatCurrency(result.originalLifeAmountOfCoverage)
    : 'Not selected';
  const disabilityCoverage = result.originalDisabilityPaymentCoverage
    ? `${formatCurrency(result.originalDisabilityPaymentCoverage)} / payment`
    : 'Not selected';

  elements.coverageDetails.replaceChildren(
    detailRow('Program', `${result.stateName} · ${result.loanClass}`),
    detailRow('Coverage', COVERAGE_TYPES[result.coverageType]),
    detailRow('Borrower', BORROWER_TYPES[result.borrowerType]),
    detailRow('Loan type', LOAN_TYPES[result.loanType]),
    detailRow('Life benefit', lifeCoverage),
    detailRow('Disability benefit', disabilityCoverage),
    detailRow('Protected term', `${result.protectedTermMonths} months`),
    detailRow('Premium per day', formatCurrency(result.costPerDay))
  );

  renderWarnings(result);
}

function updateConditionalFields(updateDays = true) {
  const borrowerType = textValue('borrowerType');
  elements.coBorrowerDobField.hidden = borrowerType !== 'joint';

  if (updateDays && elements.daysToFirstPayment.dataset.edited !== 'true') {
    const frequency = PAYMENT_FREQUENCIES[textValue('paymentFrequency')];
    elements.daysToFirstPayment.value = frequency.defaultDaysToFirstPayment;
  }
}

function calculateAndRender() {
  const inputs = readInputs();
  const errors = validate(inputs);
  renderErrors(errors);
  if (errors.length) return;

  const result = calculateQuote(inputs, { [LOCKED_STATE]: stateConfig }, {
    limits: { [LOCKED_STATE]: stateLimits }
  });
  latestQuote = { inputs, result, calculatedAt: new Date().toISOString() };
  saveStoredQuote(latestQuote);
  renderResults();

  if (window.matchMedia('(max-width: 899px)').matches) {
    document.querySelector('.sp-result-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function summaryText() {
  if (!latestQuote) return '';
  const { result } = latestQuote;
  return [
    `${result.stateName} Credit Protection Quote`,
    `Coverage: ${COVERAGE_TYPES[result.coverageType]}`,
    `Total single premium: ${formatCurrency(result.totalPremium)}`,
    `Life premium: ${formatCurrency(result.lifePremium)}`,
    `Disability premium: ${formatCurrency(result.disabilityPremium)}`,
    `Amount financed: ${formatCurrency(result.amountFinanced)}`,
    `${result.paymentFrequencyLabel} payment: ${formatCurrency(result.regularPayment)}`,
    `Estimated APR: ${formatPercent(result.estimatedApr)}`,
    `Total of payments: ${formatCurrency(result.totalPayments)}`,
    '',
    'Estimate only. Final terms may vary.'
  ].join('\n');
}

async function copySummary() {
  try {
    await navigator.clipboard.writeText(summaryText());
    elements.copyStatus.textContent = 'Summary copied.';
    elements.copyStatus.classList.remove('sp-status--error');
  } catch {
    elements.copyStatus.textContent = 'Copy is unavailable in this browser.';
    elements.copyStatus.classList.add('sp-status--error');
  }
}

function resetQuote() {
  latestQuote = null;
  clearStoredQuote();
  hydrateForm();
  renderErrors([]);
  renderResults();
  elements.copyStatus.textContent = '';
  elements.daysToFirstPayment.dataset.edited = '';
}

function initialize() {
  document.body.classList.add(`state-${LOCKED_STATE.toLowerCase()}`);
  document.title = `${stateConfig.stateName} Credit Protection Quote`;
  elements.state.value = LOCKED_STATE;
  elements.stateName.textContent = stateConfig.stateName;
  elements.stateProgram.textContent = `${stateConfig.stateName} program`;
  hydrateForm(latestQuote?.inputs || defaultInputs());
  renderResults();

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    calculateAndRender();
  });
  elements.paymentFrequency.addEventListener('change', () => {
    elements.daysToFirstPayment.dataset.edited = '';
    updateConditionalFields();
  });
  elements.daysToFirstPayment.addEventListener('input', () => {
    elements.daysToFirstPayment.dataset.edited = 'true';
  });
  elements.borrowerType.addEventListener('change', () => updateConditionalFields(false));
  elements.reset.addEventListener('click', resetQuote);
  elements.copy.addEventListener('click', copySummary);
  elements.print.addEventListener('click', () => window.print());
}

initialize();
