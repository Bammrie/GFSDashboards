
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

function normalizeAccount(account) {
  const normalized = {
    id: account.id || generateId('acct'),
    name: account.name || 'Untitled account',
    core: account.core || 'Other',
    products: Array.isArray(account.products) ? account.products : [],
    customProducts: Array.isArray(account.customProducts) ? account.customProducts : [],
    manualLoans: Array.isArray(account.manualLoans) ? account.manualLoans : [],
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
  const loanCoverageSelect = document.getElementById('manual-loan-coverage');
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

  renderAccountSelector();
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
    const loan = {
      id: generateId('loan'),
      borrower: (formData.get('borrower') || '').toString().trim(),
      loanNumber: (formData.get('loanNumber') || '').toString().trim(),
      amount: Number(formData.get('amount') || 0),
      coverage: (formData.get('coverage') || '').toString().trim(),
      notes: (formData.get('notes') || '').toString().trim(),
      createdAt: new Date().toISOString()
    };
    if (!loan.borrower || !loan.amount) return;
    account.manualLoans.push(loan);
    persistAccount(account);
    manualLoanForm.reset();
    populateCoverageOptions(account);
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

  function renderAccountSelector() {
    accountSelector.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select an account';
    placeholder.disabled = true;
    accountSelector.append(placeholder);

    appState.accounts.forEach((account) => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = account.name;
      option.className = 'account-switcher__option';
      accountSelector.append(option);
    });

    const newAccountOption = document.createElement('option');
    newAccountOption.value = '__new__';
    newAccountOption.textContent = 'New Account';
    newAccountOption.className = 'account-switcher__option account-switcher__option--new';
    accountSelector.append(newAccountOption);

    if (appState.activeAccountId) {
      accountSelector.value = appState.activeAccountId;
    } else {
      accountSelector.selectedIndex = 0;
    }
  }

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
    if (!account) {
      if (accountOverview) accountOverview.hidden = true;
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
    populateCoverageOptions(account);
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
        row.innerHTML = `
          <td>${loan.borrower || '—'}</td>
          <td>${loan.loanNumber || '—'}</td>
          <td>${formatCurrency(loan.amount)}</td>
          <td>${loan.coverage || '—'}</td>
          <td>${formatDateTime(loan.createdAt)}</td>
        `;
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

  function populateCoverageOptions(account) {
    if (!loanCoverageSelect) return;
    const existingValue = loanCoverageSelect.value;
    loanCoverageSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select coverage (optional)';
    loanCoverageSelect.append(placeholder);
    const options = [...(account.products || []), ...(account.customProducts || [])];
    options.sort((a, b) => a.localeCompare(b));
    options.forEach((product) => {
      const option = document.createElement('option');
      option.value = product;
      option.textContent = product;
      loanCoverageSelect.append(option);
    });
    loanCoverageSelect.value = existingValue || '';
  }

  function getActiveAccount() {
    if (!appState.activeAccountId) return null;
    return appState.accounts.find((account) => account.id === appState.activeAccountId) || null;
  }

  function persistAccount(account) {
    const updatedAccounts = appState.accounts.map((stored) => (stored.id === account.id ? account : stored));
    saveAccounts(updatedAccounts);
    updateWorkspace();
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

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}
