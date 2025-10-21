const STORAGE_KEY = 'gfs-account-setup';

const defaultProductGroups = [
  {
    id: 'credit-life',
    title: 'Credit Life Coverage',
    description: 'Life coverage for loan balances with single, joint, and merged (blended) rates.',
    products: [
      'Credit Life (Single)',
      'Credit Life (Joint)',
      'Credit Life (Merged)'
    ]
  },
  {
    id: 'credit-disability',
    title: 'Credit Disability Coverage',
    description: 'Disability protection options for loan payments using single, joint, or blended rates.',
    products: [
      'Credit Disability (Single)',
      'Credit Disability (Joint)',
      'Credit Disability (Merged)'
    ]
  },
  {
    id: 'debt-protection',
    title: 'Debt Protection Packages',
    description: 'Package-based debt protection programs tied to blended monthly outstanding balance rates.',
    products: [
      'Debt Protection [Package A]',
      'Debt Protection [Package B]',
      'Debt Protection [Package C]'
    ]
  },
  {
    id: 'ancillary',
    title: 'Ancillary Protection',
    description: 'Additional risk-mitigation offerings to round out the protection suite.',
    products: [
      'GAP',
      'VSC',
      'Collateral Protection Insurance (CPI)',
      'Fidelity Bond'
    ]
  }
];

const selectors = {
  form: document.getElementById('account-setup-form'),
  creditUnionInput: document.getElementById('credit-union-name'),
  productGroups: document.getElementById('product-groups'),
  selectedCount: document.getElementById('selected-count'),
  summaryCreditUnion: document.getElementById('summary-credit-union'),
  summaryProducts: document.getElementById('summary-products'),
  addProductInput: document.getElementById('new-product-name'),
  addProductBtn: document.getElementById('add-product-btn'),
  resetBtn: document.getElementById('reset-btn'),
  customProductsContainer: document.getElementById('custom-product-list'),
  customProductsList: document.querySelector('#custom-product-list .custom-products__items'),
  accountsTableBody: document.querySelector('#accounts-table tbody'),
  accountsEmptyState: document.getElementById('accounts-empty'),
  accountSelector: document.getElementById('account-selector'),
  loanOfficerForm: document.getElementById('loan-officer-form'),
  loanOfficerFeedback: document.getElementById('loan-officer-feedback'),
  loanOfficerTableBody: document.querySelector('#loan-officer-table tbody'),
  loanOfficerEmptyState: document.getElementById('loan-officer-empty'),
  incomeEntryForm: document.getElementById('income-entry-form'),
  incomeEntryList: document.getElementById('income-entry-list'),
  loanUploadForm: document.getElementById('loan-upload-form'),
  loanUploadList: document.getElementById('loan-upload-list'),
  apiConfigForm: document.getElementById('api-config-form'),
  apiEndpointInput: document.getElementById('api-endpoint'),
  apiFormatSelect: document.getElementById('api-format'),
  apiStatus: document.getElementById('api-status'),
  apiLastSynced: document.getElementById('api-last-synced'),
  apiSyncBtn: document.getElementById('api-sync-btn'),
  footerYear: document.getElementById('footer-year')
};

const state = {
  selectedProducts: new Set(),
  customProducts: [],
  creditUnionName: '',
  accounts: [],
  selectedAccountId: ''
};

function generateId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function slugify(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeAccount(account) {
  const base = {
    id: account.id || generateId('acct'),
    name: account.name || '',
    products: Array.isArray(account.products) ? account.products : [],
    customProducts: Array.isArray(account.customProducts) ? account.customProducts : [],
    loanOfficers: Array.isArray(account.loanOfficers) ? account.loanOfficers : [],
    incomeEntries: Array.isArray(account.incomeEntries) ? account.incomeEntries : [],
    loanProductionUploads: Array.isArray(account.loanProductionUploads) ? account.loanProductionUploads : [],
    apiConfig: account.apiConfig || {}
  };

  base.apiConfig = {
    endpoint: base.apiConfig.endpoint || '',
    format: base.apiConfig.format || 'JSON',
    lastSyncedAt: base.apiConfig.lastSyncedAt || null
  };

  return base;
}

function getSelectedAccount() {
  if (!state.selectedAccountId) return null;
  return state.accounts.find((account) => account.id === state.selectedAccountId) || null;
}

function formatCurrency(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function formatPercentage(covered, total) {
  if (!total) return '—';
  const ratio = (covered / total) * 100;
  return `${ratio.toFixed(1)}%`;
}

function formatPeriod(period) {
  if (!period) return '';
  const [year, month] = period.split('-').map(Number);
  if (!year || !month) return period;
  return new Date(year, month - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });
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

function aggregateOfficerCoverage(loanOfficers = []) {
  return loanOfficers.reduce(
    (totals, officer) => {
      const covered = Number(officer.coveredLoans) || 0;
      const total = Number(officer.totalLoans) || 0;
      return {
        covered: totals.covered + covered,
        total: totals.total + total
      };
    },
    { covered: 0, total: 0 }
  );
}

function aggregateUploadCoverage(uploads = []) {
  return uploads.reduce(
    (totals, upload) => {
      const covered = Number(upload.coveredLoans) || 0;
      const total = Number(upload.totalLoans) || 0;
      return {
        covered: totals.covered + covered,
        total: totals.total + total
      };
    },
    { covered: 0, total: 0 }
  );
}

function calculateAccountCoverage(account) {
  if (!account) return { covered: 0, total: 0 };
  const officerTotals = aggregateOfficerCoverage(account.loanOfficers);
  if (officerTotals.total > 0) {
    return officerTotals;
  }
  return aggregateUploadCoverage(account.loanProductionUploads);
}

function toggleFormControls(container, disabled) {
  if (!container) return;
  const controls = container.querySelectorAll('input, button, select, textarea');
  controls.forEach((control) => {
    control.disabled = disabled;
  });
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (parsed.creditUnionName) {
      state.creditUnionName = parsed.creditUnionName;
      selectors.creditUnionInput.value = parsed.creditUnionName;
    }
    if (Array.isArray(parsed.selectedProducts)) {
      parsed.selectedProducts.forEach((product) => state.selectedProducts.add(product));
    }
    if (Array.isArray(parsed.customProducts)) {
      state.customProducts = parsed.customProducts.filter(Boolean);
    }
    if (Array.isArray(parsed.accounts)) {
      state.accounts = parsed.accounts.map(normalizeAccount);
    }
    if (parsed.selectedAccountId) {
      state.selectedAccountId = parsed.selectedAccountId;
    }
  } catch (error) {
    console.error('Unable to load stored setup', error);
  }
}

function saveToStorage() {
  const payload = {
    creditUnionName: state.creditUnionName,
    selectedProducts: Array.from(state.selectedProducts),
    customProducts: state.customProducts,
    accounts: state.accounts,
    selectedAccountId: state.selectedAccountId
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function getAllGroups() {
  const groups = defaultProductGroups.map((group) => ({ ...group }));
  if (state.customProducts.length) {
    groups.push({
      id: 'custom-products',
      title: 'Custom Products & Services',
      description: 'Offerings unique to this credit union partnership.',
      products: [...state.customProducts]
    });
  }
  return groups;
}

function renderProducts() {
  selectors.productGroups.innerHTML = '';

  const groups = getAllGroups();

  groups.forEach((group) => {
    const groupEl = document.createElement('section');
    groupEl.className = 'product-group';

    const header = document.createElement('div');
    header.className = 'product-group__header';
    const title = document.createElement('h3');
    title.className = 'product-group__title';
    title.textContent = group.title;

    header.appendChild(title);
    groupEl.appendChild(header);

    if (group.description) {
      const desc = document.createElement('p');
      desc.className = 'field-helper';
      desc.textContent = group.description;
      desc.style.marginBottom = '0.75rem';
      groupEl.appendChild(desc);
    }

    const options = document.createElement('div');
    options.className = 'product-options';

    group.products.forEach((productLabel) => {
      const option = document.createElement('label');
      option.className = 'product-option';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'products';
      input.value = productLabel;
      input.id = `product-${slugify(productLabel)}`;
      input.checked = state.selectedProducts.has(productLabel);
      input.addEventListener('change', () => handleProductToggle(productLabel, input.checked));

      const text = document.createElement('span');
      text.className = 'product-option__label';
      text.textContent = productLabel;

      option.appendChild(input);
      option.appendChild(text);
      options.appendChild(option);
    });

    groupEl.appendChild(options);

    selectors.productGroups.appendChild(groupEl);
  });

  renderCustomProductList();
  updateSelectedCount();
  updateSummaryProducts();
}

function renderCustomProductList() {
  const container = selectors.customProductsContainer;
  const list = selectors.customProductsList;
  if (!container || !list) return;

  list.innerHTML = '';

  if (!state.customProducts.length) {
    container.hidden = true;
    return;
  }

  container.hidden = false;

  state.customProducts.forEach((product) => {
    const item = document.createElement('li');
    item.className = 'custom-products__item';

    const label = document.createElement('span');
    label.className = 'custom-products__label';
    label.textContent = product;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'custom-products__remove';
    button.textContent = 'Remove';
    button.addEventListener('click', () => removeCustomProduct(product));

    item.appendChild(label);
    item.appendChild(button);
    list.appendChild(item);
  });
}

function renderAccountDirectory() {
  const tbody = selectors.accountsTableBody;
  const emptyState = selectors.accountsEmptyState;
  if (!tbody || !emptyState) return;

  tbody.innerHTML = '';

  if (!state.accounts.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  state.accounts.forEach((account) => {
    const row = document.createElement('tr');
    const productsCount = account.products?.length || 0;
    const incomeCount = account.incomeEntries?.length || 0;
    const uploadsCount = account.loanProductionUploads?.length || 0;
    const officerCount = account.loanOfficers?.length || 0;
    const coverage = calculateAccountCoverage(account);
    const coverageLabel = formatPercentage(coverage.covered, coverage.total);
    const lastSyncLabel = account.apiConfig?.lastSyncedAt ? formatDateTime(account.apiConfig.lastSyncedAt) : '—';

    const nameCell = document.createElement('td');
    nameCell.textContent = account.name;
    row.appendChild(nameCell);

    const productsCell = document.createElement('td');
    const productsBadge = document.createElement('span');
    productsBadge.className = 'status-pill';
    productsBadge.textContent = `${productsCount} active`;
    productsCell.appendChild(productsBadge);
    row.appendChild(productsCell);

    const incomeCell = document.createElement('td');
    const incomeBadge = document.createElement('span');
    incomeBadge.className = 'status-pill status-pill--neutral';
    incomeBadge.textContent = `${incomeCount} entries`;
    incomeCell.appendChild(incomeBadge);
    row.appendChild(incomeCell);

    const uploadsCell = document.createElement('td');
    const uploadsBadge = document.createElement('span');
    uploadsBadge.className = 'status-pill status-pill--neutral';
    uploadsBadge.textContent = `${uploadsCount} uploads`;
    uploadsCell.appendChild(uploadsBadge);
    row.appendChild(uploadsCell);

    const officersCell = document.createElement('td');
    const officersBadge = document.createElement('span');
    officersBadge.className = 'status-pill status-pill--neutral';
    officersBadge.textContent = `${officerCount} officers`;
    officersCell.appendChild(officersBadge);
    row.appendChild(officersCell);

    const coverageCell = document.createElement('td');
    coverageCell.textContent = coverageLabel;
    if (coverage.total) {
      const detail = document.createElement('span');
      detail.className = 'table-subtext';
      detail.textContent = `${coverage.covered}/${coverage.total} protected`;
      coverageCell.appendChild(detail);
    }
    row.appendChild(coverageCell);

    const syncCell = document.createElement('td');
    syncCell.textContent = lastSyncLabel;
    row.appendChild(syncCell);

    tbody.appendChild(row);
  });
}

function renderAccountSelector() {
  const select = selectors.accountSelector;
  if (!select) return;

  const previousSelection = state.selectedAccountId;
  select.innerHTML = '<option value="">Select an account</option>';

  state.accounts.forEach((account) => {
    const option = document.createElement('option');
    option.value = account.id;
    option.textContent = account.name;
    select.appendChild(option);
  });

  if (!state.accounts.length) {
    state.selectedAccountId = '';
    select.value = '';
  } else {
    const hasExistingSelection = state.accounts.some((account) => account.id === state.selectedAccountId);
    if (!hasExistingSelection) {
      state.selectedAccountId = state.accounts[0].id;
    }
    select.value = state.selectedAccountId;
  }

  if (previousSelection !== state.selectedAccountId) {
    saveToStorage();
  }

  updateManagementAvailability();
}

function updateManagementAvailability() {
  const hasAccount = Boolean(getSelectedAccount());
  toggleFormControls(selectors.loanOfficerForm, !hasAccount);
  toggleFormControls(selectors.incomeEntryForm, !hasAccount);
  toggleFormControls(selectors.loanUploadForm, !hasAccount);
  toggleFormControls(selectors.apiConfigForm, !hasAccount);
  if (selectors.apiSyncBtn) {
    selectors.apiSyncBtn.disabled = !hasAccount;
  }
}

function showLoanOfficerFeedback(message) {
  if (!selectors.loanOfficerFeedback) return;
  selectors.loanOfficerFeedback.textContent = message;
  selectors.loanOfficerFeedback.hidden = false;
}

function clearLoanOfficerFeedback() {
  if (!selectors.loanOfficerFeedback) return;
  selectors.loanOfficerFeedback.textContent = '';
  selectors.loanOfficerFeedback.hidden = true;
}

function renderLoanOfficerTable() {
  const tbody = selectors.loanOfficerTableBody;
  const emptyState = selectors.loanOfficerEmptyState;
  if (!tbody || !emptyState) return;

  tbody.innerHTML = '';

  const account = getSelectedAccount();
  if (!account) {
    emptyState.textContent = 'Select an account to review and manage its lending team.';
    emptyState.hidden = false;
    return;
  }

  if (!account.loanOfficers.length) {
    emptyState.textContent = 'No loan officers have been added yet.';
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  account.loanOfficers.forEach((officer) => {
    const row = document.createElement('tr');
    const meta = [];
    if (officer.identifier) {
      meta.push(`ID ${officer.identifier}`);
    }
    if (officer.email) {
      meta.push(officer.email);
    }

    const covered = Number(officer.coveredLoans) || 0;
    const total = Number(officer.totalLoans) || 0;

    const nameCell = document.createElement('td');
    nameCell.textContent = officer.name;
    if (meta.length) {
      const detail = document.createElement('span');
      detail.className = 'table-subtext';
      detail.textContent = meta.join(' • ');
      nameCell.appendChild(detail);
    }
    row.appendChild(nameCell);

    const coveredCell = document.createElement('td');
    coveredCell.textContent = covered;
    row.appendChild(coveredCell);

    const totalCell = document.createElement('td');
    totalCell.textContent = total;
    row.appendChild(totalCell);

    const coverageCell = document.createElement('td');
    coverageCell.textContent = formatPercentage(covered, total);
    row.appendChild(coverageCell);

    const actionCell = document.createElement('td');
    const actions = document.createElement('div');
    actions.className = 'table-actions';

    const updateButton = document.createElement('button');
    updateButton.type = 'button';
    updateButton.className = 'link-button';
    updateButton.dataset.action = 'edit';
    updateButton.dataset.id = officer.id;
    updateButton.textContent = 'Update';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'link-button';
    removeButton.dataset.action = 'remove';
    removeButton.dataset.id = officer.id;
    removeButton.textContent = 'Remove';

    actions.appendChild(updateButton);
    actions.appendChild(removeButton);
    actionCell.appendChild(actions);
    row.appendChild(actionCell);

    tbody.appendChild(row);
  });
}

function renderIncomeEntries() {
  const list = selectors.incomeEntryList;
  if (!list) return;

  list.innerHTML = '';
  const account = getSelectedAccount();

  if (!account) {
    const empty = document.createElement('li');
    empty.className = 'record-list__empty';
    empty.textContent = 'Select an account to log income entries.';
    list.appendChild(empty);
    return;
  }

  if (!account.incomeEntries.length) {
    const empty = document.createElement('li');
    empty.className = 'record-list__empty';
    empty.textContent = 'No income entries recorded yet.';
    list.appendChild(empty);
    return;
  }

  const sortedEntries = [...account.incomeEntries].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  sortedEntries.forEach((entry) => {
    const item = document.createElement('li');
    item.className = 'record-list__item';

    const title = document.createElement('p');
    title.className = 'record-list__title';
    title.textContent = formatCurrency(entry.amount);

    const meta = document.createElement('p');
    meta.className = 'record-list__meta';
    const parts = [];
    if (entry.period) {
      parts.push(formatPeriod(entry.period));
    }
    parts.push(`Logged ${formatDateTime(entry.recordedAt)}`);
    meta.textContent = parts.join(' • ');

    item.appendChild(title);
    item.appendChild(meta);

    if (entry.notes) {
      const note = document.createElement('p');
      note.className = 'record-list__note';
      note.textContent = entry.notes;
      item.appendChild(note);
    }

    list.appendChild(item);
  });
}

function renderLoanUploads() {
  const list = selectors.loanUploadList;
  if (!list) return;

  list.innerHTML = '';
  const account = getSelectedAccount();

  if (!account) {
    const empty = document.createElement('li');
    empty.className = 'record-list__empty';
    empty.textContent = 'Select an account to record loan production uploads.';
    list.appendChild(empty);
    return;
  }

  if (!account.loanProductionUploads.length) {
    const empty = document.createElement('li');
    empty.className = 'record-list__empty';
    empty.textContent = 'No loan production uploads logged yet.';
    list.appendChild(empty);
    return;
  }

  const sortedUploads = [...account.loanProductionUploads].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  sortedUploads.forEach((upload) => {
    const item = document.createElement('li');
    item.className = 'record-list__item';

    const title = document.createElement('p');
    title.className = 'record-list__title';
    title.textContent = upload.label;

    const meta = document.createElement('p');
    meta.className = 'record-list__meta';
    const parts = [];
    if (upload.period) {
      parts.push(formatPeriod(upload.period));
    }
    const total = Number(upload.totalLoans) || 0;
    const covered = Number(upload.coveredLoans) || 0;
    parts.push(`${covered}/${total} protected (${formatPercentage(covered, total)})`);
    parts.push(`Logged ${formatDateTime(upload.recordedAt)}`);
    meta.textContent = parts.join(' • ');

    item.appendChild(title);
    item.appendChild(meta);

    list.appendChild(item);
  });
}

function renderApiStatus() {
  const account = getSelectedAccount();
  if (!selectors.apiEndpointInput || !selectors.apiFormatSelect || !selectors.apiStatus || !selectors.apiLastSynced) {
    return;
  }

  if (!account) {
    selectors.apiEndpointInput.value = '';
    selectors.apiFormatSelect.value = 'JSON';
    selectors.apiStatus.textContent = 'Select an account to configure the API connection.';
    selectors.apiLastSynced.textContent = '—';
    return;
  }

  const { apiConfig } = account;
  selectors.apiEndpointInput.value = apiConfig?.endpoint || '';
  selectors.apiFormatSelect.value = apiConfig?.format || 'JSON';

  if (apiConfig?.endpoint) {
    selectors.apiStatus.textContent = `Endpoint saved. Expecting ${apiConfig.format} payloads.`;
  } else {
    selectors.apiStatus.textContent = 'No endpoint configured yet.';
  }

  selectors.apiLastSynced.textContent = apiConfig?.lastSyncedAt
    ? `Last sync ${formatDateTime(apiConfig.lastSyncedAt)}`
    : '—';
}

function renderReportingPanels() {
  renderIncomeEntries();
  renderLoanUploads();
  renderApiStatus();
}

function handleAccountSelectionChange(event) {
  state.selectedAccountId = event.target.value;
  clearLoanOfficerFeedback();
  saveToStorage();
  updateManagementAvailability();
  renderLoanOfficerTable();
  renderReportingPanels();
}

function handleLoanOfficerSubmit(event) {
  event.preventDefault();
  const account = getSelectedAccount();
  if (!account) {
    showLoanOfficerFeedback('Select an account before adding loan officers.');
    return;
  }

  const formData = new FormData(event.target);
  const name = (formData.get('loanOfficerName') || '').toString().trim();
  const identifier = (formData.get('loanOfficerIdentifier') || '').toString().trim();
  const email = (formData.get('loanOfficerEmail') || '').toString().trim();
  const covered = Number(formData.get('loanOfficerCovered')) || 0;
  const total = Number(formData.get('loanOfficerTotal')) || 0;

  if (!name) {
    showLoanOfficerFeedback('Loan officer name is required.');
    return;
  }

  if (covered < 0 || total < 0) {
    showLoanOfficerFeedback('Loan counts cannot be negative.');
    return;
  }

  if (covered > total) {
    showLoanOfficerFeedback('Protected loans cannot exceed total loans.');
    return;
  }

  clearLoanOfficerFeedback();

  account.loanOfficers.push({
    id: generateId('officer'),
    name,
    identifier,
    email,
    coveredLoans: covered,
    totalLoans: total
  });

  event.target.reset();
  renderLoanOfficerTable();
  renderAccountDirectory();
  renderReportingPanels();
  saveToStorage();
}

function handleLoanOfficerTableClick(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const account = getSelectedAccount();
  if (!account) return;

  const officerId = button.dataset.id;
  const officer = account.loanOfficers.find((item) => item.id === officerId);
  if (!officer) return;

  if (button.dataset.action === 'remove') {
    if (!confirm(`Remove ${officer.name} from this account?`)) {
      return;
    }
    account.loanOfficers = account.loanOfficers.filter((item) => item.id !== officerId);
    clearLoanOfficerFeedback();
    renderLoanOfficerTable();
    renderAccountDirectory();
    renderReportingPanels();
    saveToStorage();
    return;
  }

  if (button.dataset.action === 'edit') {
    const totalInput = prompt('Update total loans originated by this officer', officer.totalLoans);
    if (totalInput === null) {
      return;
    }
    const nextTotal = Number(totalInput);
    if (Number.isNaN(nextTotal) || nextTotal < 0) {
      showLoanOfficerFeedback('Total loans must be a non-negative number.');
      return;
    }

    const coveredInput = prompt('Update the number of loans protected by coverage', officer.coveredLoans);
    if (coveredInput === null) {
      return;
    }
    const nextCovered = Number(coveredInput);
    if (Number.isNaN(nextCovered) || nextCovered < 0 || nextCovered > nextTotal) {
      showLoanOfficerFeedback('Protected loans must be between 0 and the total loans.');
      return;
    }

    officer.totalLoans = nextTotal;
    officer.coveredLoans = nextCovered;
    clearLoanOfficerFeedback();
    renderLoanOfficerTable();
    renderAccountDirectory();
    renderReportingPanels();
    saveToStorage();
  }
}

function handleIncomeEntrySubmit(event) {
  event.preventDefault();
  const account = getSelectedAccount();
  if (!account) return;

  const formData = new FormData(event.target);
  const amount = Number(formData.get('incomeAmount'));
  if (Number.isNaN(amount) || amount < 0) {
    return;
  }

  const entry = {
    id: generateId('income'),
    amount,
    period: (formData.get('incomePeriod') || '').toString(),
    notes: (formData.get('incomeNotes') || '').toString().trim(),
    recordedAt: new Date().toISOString()
  };

  account.incomeEntries.push(entry);
  event.target.reset();
  renderAccountDirectory();
  renderReportingPanels();
  saveToStorage();
}

function handleLoanUploadSubmit(event) {
  event.preventDefault();
  const account = getSelectedAccount();
  if (!account) return;

  const formData = new FormData(event.target);
  const label = (formData.get('loanUploadName') || '').toString().trim();
  const period = (formData.get('loanUploadPeriod') || '').toString();
  const total = Number(formData.get('loanUploadTotal')) || 0;
  const covered = Number(formData.get('loanUploadCovered')) || 0;

  if (!label) {
    return;
  }

  if (total < 0 || covered < 0) {
    return;
  }

  if (covered > total) {
    return;
  }

  account.loanProductionUploads.push({
    id: generateId('upload'),
    label,
    period,
    totalLoans: total,
    coveredLoans: covered,
    recordedAt: new Date().toISOString()
  });

  event.target.reset();
  renderAccountDirectory();
  renderReportingPanels();
  saveToStorage();
}

function handleApiConfigSubmit(event) {
  event.preventDefault();
  const account = getSelectedAccount();
  if (!account) return;

  const endpoint = selectors.apiEndpointInput?.value.trim() || '';
  const format = selectors.apiFormatSelect?.value || 'JSON';

  account.apiConfig = {
    ...account.apiConfig,
    endpoint,
    format
  };

  renderAccountDirectory();
  renderApiStatus();
  saveToStorage();
}

function handleApiSync() {
  const account = getSelectedAccount();
  if (!account) return;

  account.apiConfig = {
    ...account.apiConfig,
    lastSyncedAt: new Date().toISOString()
  };

  renderAccountDirectory();
  renderApiStatus();
  saveToStorage();
}

function removeCustomProduct(product) {
  const index = state.customProducts.indexOf(product);
  if (index === -1) return;
  state.customProducts.splice(index, 1);
  state.selectedProducts.delete(product);
  saveToStorage();
  renderProducts();
}

function handleProductToggle(product, isSelected) {
  if (isSelected) {
    state.selectedProducts.add(product);
  } else {
    state.selectedProducts.delete(product);
  }
  updateSelectedCount();
  updateSummaryProducts();
  saveToStorage();
}

function updateSelectedCount() {
  const count = state.selectedProducts.size;
  selectors.selectedCount.textContent = count === 1 ? '1 selected' : `${count} selected`;
}

function updateSummaryProducts() {
  const productsList = selectors.summaryProducts;
  productsList.innerHTML = '';

  if (!state.selectedProducts.size) {
    const empty = document.createElement('li');
    empty.className = 'summary-products__empty';
    empty.textContent = 'No products selected yet.';
    productsList.appendChild(empty);
    return;
  }

  Array.from(state.selectedProducts)
    .sort((a, b) => a.localeCompare(b))
    .forEach((product) => {
      const item = document.createElement('li');
      item.className = 'summary-products__item';
      item.textContent = product;
      productsList.appendChild(item);
    });
}

function handleAddProduct() {
  const value = selectors.addProductInput.value.trim();
  if (!value) {
    selectors.addProductInput.focus();
    return;
  }

  const exists = defaultProductGroups.some((group) => group.products.includes(value)) || state.customProducts.includes(value);
  if (exists) {
    selectors.addProductInput.classList.add('is-invalid');
    selectors.addProductInput.setAttribute('aria-invalid', 'true');
    selectors.addProductInput.setAttribute('aria-describedby', 'add-product-feedback');
    showInlineFeedback('add-product-feedback', 'That product is already in the list.');
    return;
  }

  removeInlineFeedback('add-product-feedback');
  selectors.addProductInput.classList.remove('is-invalid');
  selectors.addProductInput.removeAttribute('aria-invalid');
  selectors.addProductInput.removeAttribute('aria-describedby');

  state.customProducts.push(value);
  state.selectedProducts.add(value);
  selectors.addProductInput.value = '';
  renderProducts();
  updateSelectedCount();
  updateSummaryProducts();
  saveToStorage();
}

function showInlineFeedback(id, message) {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement('p');
    element.id = id;
    element.className = 'field-helper';
    selectors.addProductInput.insertAdjacentElement('afterend', element);
  }
  element.style.color = '#f8b4b4';
  element.textContent = message;
}

function removeInlineFeedback(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

function handleReset() {
  if (!confirm('Clear the current setup? This will remove any custom products and selections.')) {
    return;
  }
  state.creditUnionName = '';
  state.selectedProducts.clear();
  state.customProducts = [];
  selectors.creditUnionInput.value = '';
  selectors.addProductInput.value = '';
  renderProducts();
  updateSelectedCount();
  selectors.summaryCreditUnion.textContent = '—';
  updateSummaryProducts();
  saveToStorage();
}

function handleFormSubmit(event) {
  event.preventDefault();
  state.creditUnionName = selectors.creditUnionInput.value.trim();
  selectors.summaryCreditUnion.textContent = state.creditUnionName || '—';
  const productSelections = Array.from(state.selectedProducts);
  const customProducts = [...state.customProducts];

  const existingAccount = state.accounts.find(
    (account) => account.name.toLowerCase() === state.creditUnionName.toLowerCase()
  );

  let message = 'Configuration saved locally';

  if (existingAccount) {
    existingAccount.products = productSelections;
    existingAccount.customProducts = customProducts;
    state.selectedAccountId = existingAccount.id;
    message = 'Account configuration updated';
  } else {
    const newAccount = normalizeAccount({
      id: generateId('acct'),
      name: state.creditUnionName,
      products: productSelections,
      customProducts,
      loanOfficers: [],
      incomeEntries: [],
      loanProductionUploads: [],
      apiConfig: {
        endpoint: '',
        format: 'JSON',
        lastSyncedAt: null
      }
    });
    state.accounts.push(newAccount);
    state.selectedAccountId = newAccount.id;
    message = 'Account created and saved locally';
  }

  updateSummaryProducts();
  renderAccountDirectory();
  renderAccountSelector();
  renderLoanOfficerTable();
  renderReportingPanels();
  saveToStorage();

  selectors.form.classList.add('is-success');
  selectors.form.dataset.toast = message;
  setTimeout(() => {
    selectors.form.classList.remove('is-success');
    delete selectors.form.dataset.toast;
  }, 2200);
}

function syncYear() {
  selectors.footerYear.textContent = new Date().getFullYear();
}

function hydrateFromState() {
  selectors.summaryCreditUnion.textContent = state.creditUnionName || '—';
  updateSummaryProducts();
}

function bindEvents() {
  selectors.addProductBtn.addEventListener('click', handleAddProduct);
  selectors.addProductInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddProduct();
    }
  });
  selectors.form.addEventListener('submit', handleFormSubmit);
  selectors.resetBtn.addEventListener('click', handleReset);
  selectors.creditUnionInput.addEventListener('input', (event) => {
    state.creditUnionName = event.target.value;
    selectors.summaryCreditUnion.textContent = state.creditUnionName || '—';
    saveToStorage();
  });
  if (selectors.accountSelector) {
    selectors.accountSelector.addEventListener('change', handleAccountSelectionChange);
  }
  if (selectors.loanOfficerForm) {
    selectors.loanOfficerForm.addEventListener('submit', handleLoanOfficerSubmit);
  }
  if (selectors.loanOfficerTableBody) {
    selectors.loanOfficerTableBody.addEventListener('click', handleLoanOfficerTableClick);
  }
  if (selectors.incomeEntryForm) {
    selectors.incomeEntryForm.addEventListener('submit', handleIncomeEntrySubmit);
  }
  if (selectors.loanUploadForm) {
    selectors.loanUploadForm.addEventListener('submit', handleLoanUploadSubmit);
  }
  if (selectors.apiConfigForm) {
    selectors.apiConfigForm.addEventListener('submit', handleApiConfigSubmit);
  }
  if (selectors.apiSyncBtn) {
    selectors.apiSyncBtn.addEventListener('click', handleApiSync);
  }
}

function init() {
  syncYear();
  loadFromStorage();
  renderProducts();
  hydrateFromState();
  renderAccountDirectory();
  renderAccountSelector();
  renderLoanOfficerTable();
  renderReportingPanels();
  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
