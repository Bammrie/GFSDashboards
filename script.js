
const STORAGE_KEYS = {
  ACCOUNTS: 'gfs.accounts.v2',
  ACTIVE_ACCOUNT: 'gfs.activeAccountId'
};

const DEFAULT_PRODUCTS = [
  'Credit Life (Single)',
  'Credit Life (Joint)',
  'Credit Life (Blended)',
  'Credit Disability (Single)',
  'Credit Disability (Joint)',
  'Credit Disability (Blended)',
  'Debt Protection Package A',
  'Debt Protection Package B',
  'Debt Protection Package C',
  'GAP',
  'VSC',
  'Collateral Protection Insurance (CPI)',
  'Fidelity Bond',
  'AFG Balloon Loans'
];

const MOB_RATE_ROWS = [
  { id: 'creditLifeSingle', label: 'Credit Life — Single' },
  { id: 'creditLifeJoint', label: 'Credit Life — Joint' },
  { id: 'creditLifeBlended', label: 'Credit Life — Blended' },
  { id: 'creditDisabilitySingle', label: 'Credit Disability — Single' },
  { id: 'creditDisabilityJoint', label: 'Credit Disability — Joint' },
  { id: 'creditDisabilityBlended', label: 'Credit Disability — Blended' },
  { id: 'packageA', label: 'Debt Protection Package A' },
  { id: 'packageB', label: 'Debt Protection Package B' },
  { id: 'packageC', label: 'Debt Protection Package C' }
];

const MOB_COVERAGE_DEFINITIONS = [
  { key: 'creditLifeSingle', label: 'Credit Life — Single', matches: ['Credit Life (Single)'] },
  { key: 'creditLifeJoint', label: 'Credit Life — Joint', matches: ['Credit Life (Joint)'] },
  { key: 'creditLifeBlended', label: 'Credit Life — Blended', matches: ['Credit Life (Blended)'] },
  { key: 'creditDisabilitySingle', label: 'Credit Disability — Single', matches: ['Credit Disability (Single)'] },
  { key: 'creditDisabilityJoint', label: 'Credit Disability — Joint', matches: ['Credit Disability (Joint)'] },
  { key: 'creditDisabilityBlended', label: 'Credit Disability — Blended', matches: ['Credit Disability (Blended)'] },
  { key: 'packageA', label: 'Debt Protection — Package A', matches: ['Debt Protection Package A'] },
  { key: 'packageB', label: 'Debt Protection — Package B', matches: ['Debt Protection Package B'] },
  { key: 'packageC', label: 'Debt Protection — Package C', matches: ['Debt Protection Package C'] }
];

const ALWAYS_INCLUDED_COVERAGES = [
  { key: 'gap', label: 'GAP' },
  { key: 'vsc', label: 'VSC' }
];

const COVERAGE_LABEL_LOOKUP = Object.fromEntries([
  ...MOB_COVERAGE_DEFINITIONS.map(({ key, label }) => [key, label]),
  ...ALWAYS_INCLUDED_COVERAGES.map(({ key, label }) => [key, label])
]);

const CORE_LABELS = {
  Symitar: 'Symitar',
  DNA: 'FIS DNA',
  Premier: 'Fiserv Premier',
  SymChoice: 'Symitar Episys (On-Prem)',
  JackHenry: 'Jack Henry SilverLake',
  Corelation: 'Corelation Keystone',
  Other: 'Other / Custom'
};

const CORE_GUIDES = {
  Symitar: {
    overview: 'Leverage SymXchange to push monthly loan and protection activity into the dashboard.',
    steps: [
      'Enable the SymXchange data subscription for loan add/maintenance events and protection add-ons.',
      'Map Symitar LFO (Loan File) fields to dashboard requirements: loan number, product type, protection codes, MOB balances.',
      'Schedule a nightly export for historical balance snapshots and a monthly summary for earned premium validation.'
    ]
  },
  DNA: {
    overview: 'Use FIS DNA’s nightly batch export and the DNAweb services toolkit to keep coverage data synchronized.',
    steps: [
      'Create a custom batch job that extracts collateral, loan, and cross-sell tables with protection indicators.',
      'Expose the job output through DNAweb services or secure SFTP for ingestion.',
      'Confirm MOB balances align with amortization schedules before enabling production syncs.'
    ]
  },
  Premier: {
    overview: 'Pull production from Premier extracts and relay same-day loan add events via Premier Integrator.',
    steps: [
      'Activate Premier Integrator real-time events for new loans and protection elections.',
      'Schedule Premier batch file PS101 to capture end-of-day balance positions.',
      'Deliver files via SFTP and monitor hash totals to verify the feed completeness.'
    ]
  },
  SymChoice: {
    overview: 'Coordinate with Symitar Episys administrators to publish the GL and loan files required for MOB reporting.',
    steps: [
      'Identify Episys loan type codes tied to protection elections and document them in the dashboard settings.',
      'Configure PowerOn scripts to export average balance and protection code usage.',
      'Publish extracts to the secure drop folder for ingestion after nightly processing.'
    ]
  },
  JackHenry: {
    overview: 'Utilize SilverLake jXchange and SmartGlance exports to surface loan protection data.',
    steps: [
      'Enable jXchange services for loan maintenance including collateral, rate, and ancillary product tags.',
      'Schedule SmartGlance custom reports that list outstanding balance per loan with protection indicators.',
      'Push both feeds to the dashboard API endpoint or SFTP, then reconcile monthly totals.'
    ]
  },
  Corelation: {
    overview: 'Use Keystone KeyBridge to stream loan and protection changes while delivering monthly balance snapshots.',
    steps: [
      'Register webhook subscriptions in KeyBridge for loan boarding and ancillary protection updates.',
      'Expose nightly MOB snapshots via secure file transfer with headers aligned to the dashboard schema.',
      'Validate credit insurance penetration and premium totals before promoting to production.'
    ]
  },
  Other: {
    overview: 'Document the core interface and define a custom export or API to keep protection metrics current.',
    steps: [
      'Capture the data owner, delivery cadence, and format (API, SFTP, or manual upload).',
      'List each required field: loan number, borrower, balance, protection elections, premium rate components.',
      'Schedule integration testing to verify MOB rate application and premium remittance splits.'
    ]
  }
};

const pageId = document.body?.dataset?.page || '';

const appState = {
  accounts: loadAccounts(),
  activeAccountId: loadActiveAccountId()
};

init();

function init() {
  setFooterYear();

  if (pageId === 'account-create') {
    initAccountCreatePage();
  } else if (pageId === 'dashboard') {
    initDashboardPage();
  } else if (pageId === 'reporting') {
    initReportingPage();
  }
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeAccount);
  } catch (error) {
    console.error('Failed to parse stored accounts', error);
    return [];
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  appState.accounts = accounts.map(normalizeAccount);
}

function loadActiveAccountId() {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_ACCOUNT) || '';
}

function saveActiveAccountId(id) {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ACCOUNT, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ACCOUNT);
  }
  appState.activeAccountId = id;
}

function getActiveAccount() {
  if (!appState.activeAccountId) return null;
  return appState.accounts.find((account) => account.id === appState.activeAccountId) || null;
}

function getAccountById(id) {
  if (!id) return null;
  return appState.accounts.find((account) => account.id === id) || null;
}

function populateAccountSelect(select, { includeNewOption = false, selectedId = '' } = {}) {
  if (!select) return;
  const previousValue = selectedId || select.value;
  select.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Select an account';
  placeholder.disabled = true;
  placeholder.selected = true;
  select.append(placeholder);

  appState.accounts.forEach((account) => {
    const option = document.createElement('option');
    option.value = account.id;
    option.textContent = account.name;
    option.className = 'account-switcher__option';
    select.append(option);
  });

  if (includeNewOption) {
    const newAccountOption = document.createElement('option');
    newAccountOption.value = '__new__';
    newAccountOption.textContent = 'New Account';
    newAccountOption.className = 'account-switcher__option account-switcher__option--new';
    select.append(newAccountOption);
  }

  const resolvedValue = selectedId || previousValue;
  if (resolvedValue) {
    select.value = resolvedValue;
  }
}

function normalizeAccount(account) {
  const normalized = {
    id: account.id || generateId('acct'),
    name: account.name || 'Untitled account',
    core: account.core || 'Other',
    products: Array.isArray(account.products) ? account.products : [],
    customProducts: Array.isArray(account.customProducts) ? account.customProducts : [],
    manualLoans: Array.isArray(account.manualLoans)
      ? account.manualLoans.map(normalizeLoan)
      : [],
    api: account.api || {},
    mobRates: account.mobRates || {},
    ancillaryPricing: account.ancillaryPricing || {},
    implementation: account.implementation || {}
  };

  normalized.api = {
    endpoint: normalized.api.endpoint || '',
    auth: normalized.api.auth || '',
    notes: normalized.api.notes || '',
    lastSync: normalized.api.lastSync || null
  };

  normalized.mobRates = ensureMobRates(normalized.mobRates);
  normalized.ancillaryPricing = ensureAncillaryPricing(normalized.ancillaryPricing);
  normalized.implementation = {
    contact: normalized.implementation.contact || '',
    notes: normalized.implementation.notes || ''
  };

  return normalized;
}

function normalizeLoan(loan) {
  if (!loan || typeof loan !== 'object') {
    return {
      id: generateId('loan'),
      borrower: '',
      loanNumber: '',
      amount: 0,
      loanOfficer: '',
      originationDate: '',
      notes: '',
      coverages: {},
      createdAt: new Date().toISOString()
    };
  }

  const normalizedCoverages = {};
  if (loan.coverages && typeof loan.coverages === 'object') {
    Object.entries(loan.coverages).forEach(([key, value]) => {
      if (value === 'yes' || value === 'no') {
        normalizedCoverages[key] = value;
      } else if (typeof value === 'boolean') {
        normalizedCoverages[key] = value ? 'yes' : 'no';
      }
    });
  }

  if (!Object.keys(normalizedCoverages).length && loan.coverage && typeof loan.coverage === 'string') {
    normalizedCoverages.legacy = loan.coverage;
  }

  return {
    id: loan.id || generateId('loan'),
    borrower: (loan.borrower || '').toString(),
    loanNumber: (loan.loanNumber || '').toString(),
    amount: Number(loan.amount) || 0,
    loanOfficer: (loan.loanOfficer || '').toString(),
    originationDate: (loan.originationDate || '').toString(),
    notes: (loan.notes || '').toString(),
    coverages: normalizedCoverages,
    createdAt: loan.createdAt || new Date().toISOString()
  };
}

function deriveAccountCoverages(account) {
  if (!account) return [];
  const coverageList = [];
  const selectedProducts = new Set([...(account?.products || []), ...(account?.customProducts || [])]);

  MOB_COVERAGE_DEFINITIONS.forEach((definition) => {
    const hasProduct = definition.matches.some((match) => selectedProducts.has(match));
    const rate = account?.mobRates?.[definition.key];
    const hasRates = rate
      ? Object.values(rate).some((value) => value !== '' && value !== null && value !== undefined)
      : false;
    if (hasProduct || hasRates) {
      coverageList.push({ key: definition.key, label: definition.label });
    }
  });

  ALWAYS_INCLUDED_COVERAGES.forEach(({ key, label }) => {
    if (!coverageList.some((item) => item.key === key)) {
      coverageList.push({ key, label });
    }
  });

  return coverageList;
}

function getCoverageLabel(key) {
  return COVERAGE_LABEL_LOOKUP[key] || key;
}

function formatLoanCoverageSummary(loan) {
  if (loan.coverages && typeof loan.coverages === 'object') {
    const parts = Object.entries(loan.coverages)
      .filter(([, value]) => value === 'yes' || value === 'no' || (value && value !== ''))
      .map(([key, value]) => {
        if (key === 'legacy') {
          return value;
        }
        if (value === 'yes' || value === 'no') {
          return `${getCoverageLabel(key)}: ${value === 'yes' ? 'Yes' : 'No'}`;
        }
        return `${getCoverageLabel(key)}: ${value}`;
      });
    if (parts.length) {
      return parts.join(' • ');
    }
  }
  return '—';
}

function aggregateLoansByMonth(loans = []) {
  const monthlyTotals = new Map();
  loans.forEach((loan) => {
    const key = extractMonthKey(loan.originationDate || loan.createdAt);
    if (!key) return;
    const entry = monthlyTotals.get(key) || { count: 0, amount: 0 };
    entry.count += 1;
    entry.amount += Number(loan.amount) || 0;
    monthlyTotals.set(key, entry);
  });

  return Array.from(monthlyTotals.entries())
    .sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0))
    .map(([key, value]) => ({
      key,
      label: formatMonthKey(key),
      count: value.count,
      amount: value.amount
    }));
}

function extractMonthKey(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatMonthKey(key) {
  const [year, month] = key.split('-').map((segment) => Number(segment));
  if (!Number.isFinite(year) || !Number.isFinite(month)) return key;
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date);
}

function summarizeLoanTotals(loans = []) {
  return loans.reduce(
    (summary, loan) => {
      summary.count += 1;
      summary.amount += Number(loan.amount) || 0;
      return summary;
    },
    { count: 0, amount: 0 }
  );
}

function ensureMobRates(existing = {}) {
  const rates = { ...existing };
  MOB_RATE_ROWS.forEach(({ id }) => {
    if (!rates[id]) {
      rates[id] = { clp: '', gfs: '', creditUnion: '' };
    } else {
      rates[id] = {
        clp: sanitizeRateValue(rates[id].clp),
        gfs: sanitizeRateValue(rates[id].gfs),
        creditUnion: sanitizeRateValue(rates[id].creditUnion)
      };
    }
  });
  return rates;
}

function ensureAncillaryPricing(existing = {}) {
  return {
    vsc: {
      gfs: sanitizeRateValue(existing?.vsc?.gfs),
      creditUnion: sanitizeRateValue(existing?.vsc?.creditUnion)
    },
    gap: {
      clp: sanitizeRateValue(existing?.gap?.clp),
      gfs: sanitizeRateValue(existing?.gap?.gfs),
      creditUnion: sanitizeRateValue(existing?.gap?.creditUnion),
      balloon: sanitizeRateValue(existing?.gap?.balloon)
    },
    afg: {
      markup: sanitizeRateValue(existing?.afg?.markup),
      notes: existing?.afg?.notes || ''
    }
  };
}

function sanitizeRateValue(value) {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  return Number.isFinite(num) ? Number(num) : '';
}

function generateId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function setFooterYear() {
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
}

// -----------------------
// Account creation page
// -----------------------
function initAccountCreatePage() {
  const form = document.getElementById('account-create-form');
  if (!form) return;

  const productContainer = document.getElementById('product-toggle-group');
  const addProductInput = document.getElementById('new-product-name');
  const addProductBtn = document.getElementById('add-product-btn');
  const customProductList = document.getElementById('custom-product-list');
  const summaryCreditUnion = document.getElementById('summary-credit-union');
  const summaryCore = document.getElementById('summary-core');
  const summaryProducts = document.getElementById('summary-products');
  const creditUnionInput = document.getElementById('credit-union-name');
  const coreSelect = document.getElementById('core-system');

  const state = {
    selectedProducts: new Set(),
    customProducts: []
  };

  renderDefaultProducts();
  updateSummary();

  form.addEventListener('input', updateSummary);
  coreSelect.addEventListener('change', updateSummary);
  creditUnionInput.addEventListener('input', updateSummary);

  addProductBtn?.addEventListener('click', () => {
    const value = (addProductInput?.value || '').trim();
    if (!value) return;
    if (state.customProducts.includes(value)) {
      addProductInput.value = '';
      return;
    }
    state.customProducts.push(value);
    state.selectedProducts.add(value);
    addProductInput.value = '';
    renderCustomProducts();
    updateSummary();
  });

  form.addEventListener('reset', () => {
    state.selectedProducts.clear();
    state.customProducts = [];
    renderDefaultProducts();
    renderCustomProducts();
    updateSummary();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = (formData.get('creditUnionName') || '').toString().trim();
    const core = (formData.get('coreSystem') || 'Other').toString();
    if (!name || !core) return;

    const account = normalizeAccount({
      id: generateId('acct'),
      name,
      core,
      products: Array.from(state.selectedProducts).filter(Boolean),
      customProducts: [...state.customProducts],
      manualLoans: [],
      api: { endpoint: '', auth: '', notes: '', lastSync: null },
      mobRates: ensureMobRates({}),
      ancillaryPricing: ensureAncillaryPricing({}),
      implementation: {
        contact: (formData.get('integrationContact') || '').toString().trim(),
        notes: (formData.get('integrationNotes') || '').toString().trim()
      }
    });

    const accounts = [...appState.accounts, account];
    saveAccounts(accounts);
    saveActiveAccountId(account.id);
    window.location.href = 'index.html';
  });

  function renderDefaultProducts() {
    if (!productContainer) return;
    productContainer.innerHTML = '';
    DEFAULT_PRODUCTS.forEach((product) => {
      const id = `product-${product.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
      const label = document.createElement('label');
      label.className = 'product-toggle';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = id;
      checkbox.name = 'products';
      checkbox.value = product;
      checkbox.checked = state.selectedProducts.has(product);

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          state.selectedProducts.add(product);
        } else {
          state.selectedProducts.delete(product);
        }
        updateSummary();
      });

      const span = document.createElement('span');
      span.textContent = product;

      label.append(checkbox, span);
      productContainer.append(label);
    });
  }

  function renderCustomProducts() {
    if (!customProductList) return;
    customProductList.innerHTML = '';
    if (!state.customProducts.length) {
      customProductList.hidden = true;
      return;
    }
    customProductList.hidden = false;
    state.customProducts.forEach((product, index) => {
      const item = document.createElement('li');
      item.textContent = product;
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        state.customProducts.splice(index, 1);
        state.selectedProducts.delete(product);
        renderCustomProducts();
        updateSummary();
      });
      item.append(removeBtn);
      customProductList.append(item);
    });
  }

  function updateSummary() {
    if (summaryCreditUnion) {
      summaryCreditUnion.textContent = creditUnionInput?.value?.trim() || '—';
    }
    if (summaryCore) {
      const coreValue = coreSelect?.value || '';
      summaryCore.textContent = coreValue ? (CORE_LABELS[coreValue] || coreValue) : '—';
    }
    if (summaryProducts) {
      summaryProducts.innerHTML = '';
      const products = Array.from(state.selectedProducts);
      const allProducts = [...products, ...state.customProducts.filter((item) => !products.includes(item))];
      if (!allProducts.length) {
        const placeholder = document.createElement('li');
        placeholder.className = 'summary__placeholder';
        placeholder.textContent = 'No products selected yet.';
        summaryProducts.append(placeholder);
      } else {
        allProducts.forEach((product) => {
          const item = document.createElement('li');
          item.textContent = product;
          summaryProducts.append(item);
        });
      }
    }
  }
}

// -----------------------
// Dashboard page
// -----------------------
function initDashboardPage() {
  const accountSelector = document.getElementById('account-selector');
  const accountOverview = document.getElementById('account-overview');
  const accountName = document.getElementById('account-name');
  const accountCore = document.getElementById('account-core');
  const accountProducts = document.getElementById('account-products');
  const dataEntryPanel = document.getElementById('data-entry-panel');
  const settingsPanel = document.getElementById('account-settings-panel');
  const tabs = document.querySelectorAll('.tabs__tab');
  const manualLoanForm = document.getElementById('manual-loan-form');
  const loanCoverageGrid = document.getElementById('loan-coverage-grid');
  const loanLogTable = document.getElementById('loan-log-table');
  const loanLogEmpty = document.getElementById('loan-log-empty');
  const loanLogCount = document.getElementById('loan-log-count');
  const apiConfigForm = document.getElementById('api-config-form');
  const apiLastSync = document.getElementById('api-last-sync');
  const apiSyncBtn = document.getElementById('api-sync-btn');
  const apiCoreOverview = document.getElementById('api-core-overview');
  const apiCoreSteps = document.getElementById('api-core-steps');
  const mobRateBody = document.getElementById('mob-rate-body');
  const mobRateForm = document.getElementById('mob-rate-form');
  const ancillaryForm = document.getElementById('ancillary-form');

  if (!accountSelector || !dataEntryPanel || !settingsPanel) return;

  populateAccountSelect(accountSelector, {
    includeNewOption: true,
    selectedId: appState.activeAccountId
  });
  renderMobTable();
  registerTabBehavior();
  setAccountControlsDisabled(true);
  updateWorkspace();

  accountSelector.addEventListener('change', (event) => {
    const value = event.target.value;
    if (value === '__new__') {
      window.location.href = 'create-account.html';
      return;
    }
    saveActiveAccountId(value);
    updateWorkspace();
  });

  manualLoanForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const account = getActiveAccount();
    if (!account) return;
    const formData = new FormData(manualLoanForm);
    const amountValue = Number(formData.get('amount'));
    const loan = {
      id: generateId('loan'),
      borrower: (formData.get('borrower') || '').toString().trim(),
      loanNumber: (formData.get('loanNumber') || '').toString().trim(),
      loanOfficer: (formData.get('loanOfficer') || '').toString().trim(),
      amount: Number.isFinite(amountValue) ? amountValue : 0,
      originationDate: (formData.get('originationDate') || '').toString(),
      coverages: collectCoverageSelections(manualLoanForm),
      notes: (formData.get('notes') || '').toString().trim(),
      createdAt: new Date().toISOString()
    };
    if (!loan.loanOfficer || !loan.originationDate || !loan.amount) return;
    account.manualLoans.push(normalizeLoan(loan));
    persistAccount(account);
    manualLoanForm.reset();
    renderLoanCoverageGrid(account);
    renderLoanLog(account);
  });

  apiConfigForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const account = getActiveAccount();
    if (!account) return;
    const formData = new FormData(apiConfigForm);
    account.api.endpoint = (formData.get('endpoint') || '').toString().trim();
    account.api.auth = (formData.get('auth') || '').toString().trim();
    account.api.notes = (formData.get('notes') || '').toString();
    persistAccount(account);
  });

  apiSyncBtn?.addEventListener('click', () => {
    const account = getActiveAccount();
    if (!account) return;
    account.api.lastSync = new Date().toISOString();
    persistAccount(account);
    renderApiDetails(account);
  });

  mobRateForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const account = getActiveAccount();
    if (!account) return;
    const formData = new FormData(mobRateForm);
    MOB_RATE_ROWS.forEach(({ id }) => {
      account.mobRates[id] = {
        clp: parseNumericField(formData.get(`${id}-clp`)),
        gfs: parseNumericField(formData.get(`${id}-gfs`)),
        creditUnion: parseNumericField(formData.get(`${id}-creditUnion`))
      };
    });
    persistAccount(account);
  });

  ancillaryForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const account = getActiveAccount();
    if (!account) return;
    const formData = new FormData(ancillaryForm);
    account.ancillaryPricing = {
      vsc: {
        gfs: parseNumericField(formData.get('vscGfs')),
        creditUnion: parseNumericField(formData.get('vscCreditUnion'))
      },
      gap: {
        clp: parseNumericField(formData.get('gapClp')),
        gfs: parseNumericField(formData.get('gapGfs')),
        creditUnion: parseNumericField(formData.get('gapCreditUnion')),
        balloon: parseNumericField(formData.get('gapBalloon'))
      },
      afg: {
        markup: parseNumericField(formData.get('afgMarkup')),
        notes: (formData.get('afgNotes') || '').toString().trim()
      }
    };
    persistAccount(account);
  });

  function registerTabBehavior() {
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((button) => {
          const isActive = button === tab;
          button.setAttribute('aria-selected', isActive ? 'true' : 'false');
          const panelId = button.getAttribute('aria-controls');
          const panel = document.getElementById(panelId);
          if (panel) {
            panel.hidden = !isActive;
          }
        });
      });
    });
  }

  function updateWorkspace() {
    const account = getActiveAccount();
    populateAccountSelect(accountSelector, {
      includeNewOption: true,
      selectedId: appState.activeAccountId
    });

    if (!account) {
      if (accountOverview) accountOverview.hidden = true;
      renderLoanCoverageGrid(null);
      setAccountControlsDisabled(true);
      clearLoanLog();
      clearApiGuide();
      return;
    }

    if (accountOverview) {
      accountOverview.hidden = false;
    }

    if (accountName) accountName.textContent = account.name;
    if (accountCore) accountCore.textContent = CORE_LABELS[account.core] || account.core;
    renderProductPills(accountProducts, account);
    renderLoanCoverageGrid(account);
    renderLoanLog(account);
    renderApiDetails(account);
    renderCoreGuide(account);
    renderMobInputs(account);
    renderAncillaryInputs(account);
    setAccountControlsDisabled(false);
  }

  function renderMobTable() {
    if (!mobRateBody) return;
    mobRateBody.innerHTML = '';
    MOB_RATE_ROWS.forEach(({ id, label }) => {
      const row = document.createElement('tr');
      const selectionCell = document.createElement('th');
      selectionCell.scope = 'row';
      selectionCell.textContent = label;
      row.append(selectionCell);

      ['clp', 'gfs', 'creditUnion'].forEach((field) => {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.step = '0.01';
        input.min = '0';
        input.className = 'field__input';
        input.name = `${id}-${field}`;
        cell.append(input);
        row.append(cell);
      });

      mobRateBody.append(row);
    });
  }

  function renderMobInputs(account) {
    if (!mobRateBody) return;
    MOB_RATE_ROWS.forEach(({ id }) => {
      const rate = account.mobRates[id] || { clp: '', gfs: '', creditUnion: '' };
      ['clp', 'gfs', 'creditUnion'].forEach((field) => {
        const input = mobRateBody.querySelector(`input[name="${id}-${field}"]`);
        if (input) {
          const value = rate[field];
          input.value = value === '' ? '' : Number(value);
        }
      });
    });
  }

  function renderAncillaryInputs(account) {
    if (!ancillaryForm) return;
    const { vsc, gap, afg } = account.ancillaryPricing;
    ancillaryForm.elements.namedItem('vscGfs').value = valueOrEmpty(vsc.gfs);
    ancillaryForm.elements.namedItem('vscCreditUnion').value = valueOrEmpty(vsc.creditUnion);
    ancillaryForm.elements.namedItem('gapClp').value = valueOrEmpty(gap.clp);
    ancillaryForm.elements.namedItem('gapGfs').value = valueOrEmpty(gap.gfs);
    ancillaryForm.elements.namedItem('gapCreditUnion').value = valueOrEmpty(gap.creditUnion);
    ancillaryForm.elements.namedItem('gapBalloon').value = valueOrEmpty(gap.balloon);
    ancillaryForm.elements.namedItem('afgMarkup').value = valueOrEmpty(afg.markup);
    ancillaryForm.elements.namedItem('afgNotes').value = afg.notes || '';
  }

  function renderLoanCoverageGrid(account) {
    if (!loanCoverageGrid) return;
    loanCoverageGrid.innerHTML = '';

    if (!account) {
      const message = document.createElement('p');
      message.className = 'coverage-grid__empty';
      message.textContent = 'Select an account to capture coverage elections.';
      loanCoverageGrid.append(message);
      return;
    }

    const coverages = deriveAccountCoverages(account);
    if (!coverages.length) {
      const message = document.createElement('p');
      message.className = 'coverage-grid__empty';
      message.textContent = 'Configure MOB coverage selections in account settings to enable tracking.';
      loanCoverageGrid.append(message);
      return;
    }

    coverages.forEach(({ key, label }) => {
      const field = document.createElement('label');
      field.className = 'coverage-field';
      field.dataset.coverageWrapper = key;

      const span = document.createElement('span');
      span.className = 'coverage-field__label';
      span.textContent = label;

      const select = document.createElement('select');
      select.name = `coverage-${key}`;
      select.dataset.coverageKey = key;
      select.className = 'coverage-field__select';

      const emptyOption = document.createElement('option');
      emptyOption.value = '';
      emptyOption.textContent = '—';
      select.append(emptyOption);

      ['yes', 'no'].forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value === 'yes' ? 'Yes' : 'No';
        select.append(option);
      });

      field.append(span, select);
      loanCoverageGrid.append(field);
    });
  }

  function collectCoverageSelections(formElement) {
    const selections = {};
    if (!formElement) return selections;
    formElement.querySelectorAll('[data-coverage-key]').forEach((input) => {
      const key = input.dataset.coverageKey;
      if (!key) return;
      const value = (input.value || '').toString();
      if (value === 'yes' || value === 'no') {
        selections[key] = value;
      }
    });
    return selections;
  }

  function renderLoanLog(account) {
    if (!loanLogTable || !loanLogCount || !loanLogEmpty) return;
    const tbody = loanLogTable.querySelector('tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!account.manualLoans.length) {
      loanLogEmpty.hidden = false;
      loanLogCount.textContent = '0 loans';
      return;
    }
    loanLogEmpty.hidden = true;
    loanLogCount.textContent = `${account.manualLoans.length} loan${account.manualLoans.length === 1 ? '' : 's'}`;
    account.manualLoans
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .forEach((loan) => {
        const row = document.createElement('tr');
        const cells = [
          loan.borrower || '—',
          loan.loanNumber || '—',
          formatCurrency(loan.amount),
          loan.loanOfficer || '—',
          formatDate(loan.originationDate || loan.createdAt),
          formatLoanCoverageSummary(loan),
          formatDateTime(loan.createdAt)
        ];
        cells.forEach((value) => {
          const cell = document.createElement('td');
          cell.textContent = value;
          row.append(cell);
        });
        tbody.append(row);
      });
  }

  function clearLoanLog() {
    if (!loanLogTable || !loanLogCount || !loanLogEmpty) return;
    const tbody = loanLogTable.querySelector('tbody');
    if (tbody) tbody.innerHTML = '';
    loanLogCount.textContent = '0 loans';
    loanLogEmpty.hidden = false;
  }

  function renderApiDetails(account) {
    if (!apiConfigForm || !apiLastSync) return;
    apiConfigForm.elements.namedItem('endpoint').value = account.api.endpoint || '';
    apiConfigForm.elements.namedItem('auth').value = account.api.auth || '';
    apiConfigForm.elements.namedItem('notes').value = account.api.notes || '';
    apiLastSync.textContent = account.api.lastSync
      ? `Last sync: ${formatDateTime(account.api.lastSync)}`
      : 'No sync events recorded yet.';
  }

  function renderCoreGuide(account) {
    if (!apiCoreOverview || !apiCoreSteps) return;
    const guide = CORE_GUIDES[account.core] || CORE_GUIDES.Other;
    apiCoreOverview.textContent = guide.overview;
    apiCoreSteps.innerHTML = '';
    const productList = [...account.products, ...account.customProducts];
    guide.steps.forEach((step) => {
      const item = document.createElement('li');
      item.textContent = step;
      apiCoreSteps.append(item);
    });
    if (productList.length) {
      const item = document.createElement('li');
      item.textContent = `Confirm feeds include coverage indicators for: ${productList.join(', ')}.`;
      apiCoreSteps.append(item);
    }
  }

  function clearApiGuide() {
    if (!apiCoreOverview || !apiCoreSteps) return;
    apiCoreOverview.textContent = 'Select an account to load the connection steps for its core.';
    apiCoreSteps.innerHTML = '';
    if (apiLastSync) {
      apiLastSync.textContent = 'No sync events recorded yet.';
    }
  }

  function renderProductPills(container, account) {
    if (!container) return;
    container.innerHTML = '';
    const products = [...(account.products || []), ...(account.customProducts || [])];
    if (!products.length) {
      const item = document.createElement('li');
      item.textContent = 'No products selected';
      container.append(item);
      return;
    }
    products.forEach((product) => {
      const item = document.createElement('li');
      item.textContent = product;
      container.append(item);
    });
  }

  function persistAccount(account) {
    const updatedAccounts = appState.accounts.map((stored) => (stored.id === account.id ? normalizeAccount(account) : stored));
    saveAccounts(updatedAccounts);
    updateWorkspace();
  }
}

// -----------------------
// Reporting page
// -----------------------
function initReportingPage() {
  const accountSelector = document.getElementById('reporting-account-selector');
  const chartCanvas = document.getElementById('loan-volume-chart');
  const emptyState = document.getElementById('reporting-empty');
  const footnote = document.getElementById('reporting-footnote');
  let chartInstance = null;

  populateAccountSelect(accountSelector, {
    includeNewOption: false,
    selectedId: appState.activeAccountId
  });

  if (accountSelector) {
    accountSelector.disabled = appState.accounts.length === 0;
    accountSelector.addEventListener('change', (event) => {
      const value = event.target.value;
      if (value === '__new__') {
        window.location.href = 'create-account.html';
        return;
      }
      saveActiveAccountId(value);
      renderReport();
    });
  }

  renderReport();

  function renderReport() {
    const account = getActiveAccount();
    if (accountSelector) {
      accountSelector.disabled = appState.accounts.length === 0;
    }
    if (!account) {
      toggleEmpty(true, appState.accounts.length ? 'Select an account to view reporting.' : 'Create an account to unlock reporting.');
      destroyChart();
      if (footnote) footnote.textContent = '';
      return;
    }

    if (accountSelector && accountSelector.value !== account.id) {
      accountSelector.value = account.id;
    }

    const monthly = aggregateLoansByMonth(account.manualLoans || []);
    if (!monthly.length) {
      toggleEmpty(true, `No manual loans recorded yet for ${account.name}.`);
      destroyChart();
      if (footnote) footnote.textContent = '';
      return;
    }

    toggleEmpty(false);
    renderChart(monthly);

    if (footnote) {
      const totals = summarizeLoanTotals(account.manualLoans || []);
      footnote.textContent = `${account.name} • ${monthly.length} month${monthly.length === 1 ? '' : 's'} of activity • ${totals.count} loan${totals.count === 1 ? '' : 's'} totaling ${formatCurrency(totals.amount)}.`;
    }
  }

  function toggleEmpty(show, message) {
    if (emptyState) {
      emptyState.hidden = !show;
      if (typeof message === 'string') {
        emptyState.textContent = message;
      }
    }
    if (chartCanvas) {
      chartCanvas.hidden = show;
    }
  }

  function renderChart(points) {
    if (!chartCanvas || typeof Chart === 'undefined') return;
    const chart = ensureChart();
    if (!chart) return;
    chartCanvas.hidden = false;
    chart.data.labels = points.map((point) => point.label);
    chart.data.datasets[0].data = points.map((point) => ({
      x: point.label,
      y: point.count,
      amount: point.amount
    }));
    chart.update();
  }

  function ensureChart() {
    if (chartInstance) return chartInstance;
    if (!chartCanvas || typeof Chart === 'undefined') return null;

    chartInstance = new Chart(chartCanvas, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Loans per month',
            data: [],
            parsing: false,
            tension: 0.35,
            borderColor: '#c7483f',
            backgroundColor: 'rgba(199, 72, 63, 0.25)',
            borderWidth: 2,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#f2b34c',
            pointBorderColor: '#2a0d10',
            pointBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: '#fbead7'
            },
            grid: {
              color: 'rgba(251, 234, 215, 0.1)'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#fbead7',
              precision: 0
            },
            grid: {
              color: 'rgba(251, 234, 215, 0.08)'
            },
            title: {
              display: true,
              text: 'Loans',
              color: '#fbead7'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(24, 9, 10, 0.92)',
            borderColor: 'rgba(247, 179, 76, 0.4)',
            borderWidth: 1,
            titleColor: '#fbead7',
            bodyColor: '#fbead7',
            callbacks: {
              label(context) {
                const count = context.parsed?.y ?? 0;
                const rawAmount = context.raw?.amount || 0;
                return `${count} loan${count === 1 ? '' : 's'} • ${formatCurrency(rawAmount)}`;
              }
            }
          }
        }
      }
    });

    return chartInstance;
  }

  function destroyChart() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    if (chartCanvas) {
      chartCanvas.hidden = true;
    }
  }
}

function setAccountControlsDisabled(disabled) {
  const controls = document.querySelectorAll('[data-account-control]');
  controls.forEach((container) => {
    if (container.matches('form')) {
      container.querySelectorAll('input, select, textarea, button').forEach((element) => {
        element.disabled = disabled;
      });
    } else if (container instanceof HTMLButtonElement) {
      container.disabled = disabled;
    } else {
      container.querySelectorAll('input, select, textarea, button').forEach((element) => {
        element.disabled = disabled;
      });
    }
  });
}

function parseNumericField(value) {
  if (value === null || value === undefined || value === '') return '';
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Number(numberValue) : '';
}

function valueOrEmpty(value) {
  return value === '' || value === null || value === undefined ? '' : Number(value);
}

function formatCurrency(value) {
  if (!Number.isFinite(Number(value))) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value));
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}
