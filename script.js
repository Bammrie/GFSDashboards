
const STORAGE_KEYS = {
  ACCOUNT_PRODUCTS: 'gfs.accountProducts.v1',
  ACTIVE_ACCOUNT: 'gfs.activeAccountId',
  PROSPECT_LOG: 'gfs.prospectLog.v1'
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
  'Mortgage Life Insurance for 1st Lien mortgages',
  'AFG Balloon Loans'
];

const RATE_PARAMETER_SET = [
  { id: 'clpRate', label: 'CLP Rate', requiredWhenActive: true },
  { id: 'gfsMarkup', label: 'GFS Mark-Up', requiredWhenActive: true },
  { id: 'creditUnionMarkup', label: 'Credit Union Mark-Up', requiredWhenActive: true }
];

const PRODUCT_PARAMETER_DEFINITIONS = {
  'Credit Life (Single)': RATE_PARAMETER_SET,
  'Credit Life (Joint)': RATE_PARAMETER_SET,
  'Credit Life (Blended)': RATE_PARAMETER_SET,
  'Credit Disability (Single)': RATE_PARAMETER_SET,
  'Credit Disability (Joint)': RATE_PARAMETER_SET,
  'Credit Disability (Blended)': RATE_PARAMETER_SET,
  'Debt Protection Package A': RATE_PARAMETER_SET,
  'Debt Protection Package B': RATE_PARAMETER_SET,
  'Debt Protection Package C': RATE_PARAMETER_SET,
  GAP: [
    { id: 'clpRate', label: 'CLP Rate', requiredWhenActive: true },
    { id: 'gfsMarkup', label: 'GFS Mark-Up', requiredWhenActive: true },
    { id: 'creditUnionMarkup', label: 'Credit Union Mark-Up', requiredWhenActive: true }
  ],
  VSC: [
    { id: 'creditUnionMarkup', label: 'Credit Union Mark-Up', requiredWhenActive: true },
    { id: 'gfsMarkup', label: 'GFS Mark-Up', requiredWhenActive: true }
  ],
  'Collateral Protection Insurance (CPI)': [
    { id: 'billingRate', label: 'Carrier Billing Rate', requiredWhenActive: true },
    { id: 'gfsMarkup', label: 'GFS Mark-Up', requiredWhenActive: true },
    { id: 'creditUnionMarkup', label: 'Credit Union Mark-Up', requiredWhenActive: true }
  ],
  'Fidelity Bond': [
    { id: 'coverageLimit', label: 'Coverage Limit', requiredWhenActive: true },
    { id: 'annualPremium', label: 'Annual Premium', requiredWhenActive: true },
    { id: 'effectiveDate', label: 'Effective Date', inputType: 'date', requiredWhenActive: true }
  ],
  'Mortgage Life Insurance for 1st Lien mortgages': RATE_PARAMETER_SET,
  'AFG Balloon Loans': [
    { id: 'programRate', label: 'Program Rate', requiredWhenActive: true },
    { id: 'gfsMarkup', label: 'GFS Mark-Up', requiredWhenActive: true },
    { id: 'creditUnionMarkup', label: 'Credit Union Mark-Up', requiredWhenActive: true }
  ]
};

function getProductParameterDefinitions(productName) {
  const definitions = PRODUCT_PARAMETER_DEFINITIONS[productName];
  if (!definitions) return [];
  return definitions.map((definition) => ({ ...definition }));
}

function sanitizeParameterValue(definition, value) {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }
  const stringValue = value.toString().trim();
  if (!stringValue) return '';
  if (definition?.inputType === 'date') {
    const timestamp = Date.parse(stringValue);
    return Number.isNaN(timestamp) ? '' : new Date(timestamp).toISOString().slice(0, 10);
  }
  return stringValue;
}

function sanitizeProductParameters(productName, values) {
  const definitions = PRODUCT_PARAMETER_DEFINITIONS[productName];
  const sanitized = {};
  if (definitions && definitions.length) {
    definitions.forEach((definition) => {
      const sanitizedValue = sanitizeParameterValue(definition, values ? values[definition.id] : '');
      if (sanitizedValue) {
        sanitized[definition.id] = sanitizedValue;
      }
    });
  } else if (values && typeof values === 'object') {
    Object.entries(values).forEach(([key, value]) => {
      const sanitizedValue = sanitizeParameterValue({}, value);
      if (sanitizedValue) {
        sanitized[key] = sanitizedValue;
      }
    });
  }
  return sanitized;
}

function collectMissingRequiredParameters(definitions, values) {
  if (!definitions || !definitions.length) return [];
  return definitions.filter((definition) => {
    if (!definition.requiredWhenActive) return false;
    const rawValue = values?.[definition.id];
    return !rawValue || !rawValue.toString().trim();
  });
}

function getMissingRequiredParameters(record, productName) {
  if (!record || record.products?.[productName] !== 'yes') return [];
  const definitions = PRODUCT_PARAMETER_DEFINITIONS[productName];
  if (!definitions || !definitions.length) return [];
  const values = record.parameters?.[productName] || {};
  return collectMissingRequiredParameters(definitions, values);
}

function productActivationIsValid(record, productName) {
  return getMissingRequiredParameters(record, productName).length === 0;
}

const MOB_RATE_ROWS = [
  { id: 'creditLifeSingle', label: 'Credit Life — Single' },
  { id: 'creditLifeJoint', label: 'Credit Life — Joint' },
  { id: 'creditLifeBlended', label: 'Credit Life — Blended' },
  { id: 'creditDisabilitySingle', label: 'Credit Disability — Single' },
  { id: 'creditDisabilityJoint', label: 'Credit Disability — Joint' },
  { id: 'creditDisabilityBlended', label: 'Credit Disability — Blended' },
  { id: 'packageA', label: 'Debt Protection Package A' },
  { id: 'packageB', label: 'Debt Protection Package B' },
  { id: 'packageC', label: 'Debt Protection Package C' },
  { id: 'mortgageLifeFirstLien', label: 'Mortgage Life — 1st Lien' }
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
  { key: 'packageC', label: 'Debt Protection — Package C', matches: ['Debt Protection Package C'] },
  {
    key: 'mortgageLifeFirstLien',
    label: 'Mortgage Life — 1st Lien',
    matches: ['Mortgage Life Insurance for 1st Lien mortgages']
  }
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

const PROSPECT_LOAN_ORDER = [
  'creditCard',
  'student',
  'otherUnsecured',
  'newVehicle',
  'usedVehicle',
  'leases',
  'otherSecured',
  'firstMortgage',
  'juniorMortgage',
  'otherNonCommercialRE',
  'commercialRE',
  'commercialOther'
];

const PROSPECT_DELINQUENCY_SOURCE_LABELS = {
  participations: 'Participations (NCUA 701.22)',
  indirect: 'Indirect (Account 618A)',
  purchased: 'Purchased loans (NCUA 701.23)'
};

const PROSPECT_CURRENCY_FORMAT = { decimals: 0 };

function formatProspectCurrency(value) {
  return formatCurrency(value, PROSPECT_CURRENCY_FORMAT);
}

let PROSPECT_REPORTS = [];
let PROSPECT_LOOKUP = {};
const prospectsDataUrl = document.body?.dataset?.prospectsDataUrl || 'prospects-data.json';
let prospectDataPromise = null;

const PROSPECT_PRODUCT_MODELS = [
  {
    id: 'credit-life-single',
    label: 'Credit Life (Single)',
    type: 'consumer-coverage',
    ratePerThousand: 1,
    penetration: 0.38,
    creditUnionShare: 1,
    gfsShare: 0
  },
  {
    id: 'credit-disability-single',
    label: 'Credit Disability (Single)',
    type: 'consumer-coverage',
    ratePerThousand: 2.25,
    penetration: 0.38,
    creditUnionShare: 1,
    gfsShare: 0
  },
  {
    id: 'debt-protection-package-a',
    label: 'Debt Protection (IUI)',
    type: 'consumer-coverage',
    ratePerThousand: 1.4,
    penetration: 0.38,
    creditUnionShare: 1,
    gfsShare: 0
  },
  {
    id: 'mortgage-life-first-lien',
    label: 'Mortgage Life Insurance — 1st Lien',
    type: 'mob',
    eligibleBalanceKeys: ['firstMortgage'],
    penetration: 0.12,
    rates: { clp: 0.38, gfsMarkup: 0.18, creditUnionMarkup: 0.14 }
  },
  {
    id: 'gap',
    label: 'GAP',
    type: 'direct-auto-ancillary',
    penetration: 0.7,
    averageTermMonths: 24,
    gfsIncomePerUnit: 50,
    creditUnionIncomePerUnit: 0
  },
  {
    id: 'vsc',
    label: 'Vehicle Service Contract',
    type: 'direct-auto-ancillary',
    penetration: 0.4,
    averageTermMonths: 24,
    gfsIncomePerUnit: 400,
    creditUnionIncomePerUnit: 0
  },
  {
    id: 'cpi',
    label: 'Collateral Protection Insurance',
    type: 'flat',
    eligibleCountKeys: ['newVehicle', 'usedVehicle', 'otherSecured'],
    penetration: 0.08,
    pricing: { retail: 90, gfsShare: 25, creditUnionShare: 20 }
  }
];

const PROSPECT_PRODUCT_FOOTNOTE =
  'Credit life, disability, and IUI estimates: (consumer loans ÷ $1,000) × rate × 38% monthly CU remittance (rates — Life $1.00, Disability $2.25, IUI $1.40). VSC & GAP assume direct auto loans outstanding ÷ 24 for monthly production (40% VSC @ $400 GFS, 70% GAP @ $50 GFS). CPI modeling: $90 billed ($25 GFS / $20 CU).';

const prospectState = {
  activeProspectId: '',
  logEntries: loadProspectLog(),
  logSelectTouched: false
};

function loadAccountProductState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNT_PRODUCTS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const normalized = {};
    Object.entries(parsed).forEach(([id, record]) => {
      if (!record || typeof record !== 'object') return;
      normalized[id] = {
        accountId: record.accountId || id,
        charter: typeof record.charter === 'string' ? record.charter : '',
        name: typeof record.name === 'string' ? record.name : '',
        updatedAt: record.updatedAt || null,
        products: record.products && typeof record.products === 'object' ? { ...record.products } : {},
        customProducts: Array.isArray(record.customProducts) ? record.customProducts.slice() : [],
        parameters:
          record.parameters && typeof record.parameters === 'object'
            ? Object.fromEntries(
                Object.entries(record.parameters)
                  .filter((entry) => entry[0])
                  .map(([productName, values]) => [
                    productName,
                    values && typeof values === 'object' ? { ...values } : {}
                  ])
              )
            : {}
      };
    });
    return normalized;
  } catch (error) {
    console.error('Failed to parse account product state', error);
    return {};
  }
}

function saveAccountProductState(state) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNT_PRODUCTS, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save account product state', error);
  }
  appState.accountProducts = state;
}

function prepareAccountData() {
  return loadProspectReports().then((reports) => {
    const accounts = buildAccountRegistry(reports);
    appState.accounts = accounts;
    normalizeAccountProducts(accounts);
    return accounts;
  });
}

function buildAccountRegistry(reports) {
  const registry = new Map();

  reports.forEach((report) => {
    const charter = (report?.charter || '').toString().trim();
    const id = charter || report.id || generateId('acct');
    if (!registry.has(id)) {
      registry.set(id, {
        id,
        charter,
        name: report?.name || '',
        reports: []
      });
    }
    const entry = registry.get(id);
    entry.reports.push(report);
    if (report?.name) {
      const existingTimestamp = parseReportDate(entry.latestAsOf);
      const nextTimestamp = parseReportDate(report.asOf);
      if (!entry.name || nextTimestamp >= existingTimestamp) {
        entry.name = report.name;
      }
    }
    if (!entry.charter && charter) {
      entry.charter = charter;
    }
    if (report?.asOf) {
      const nextTimestamp = parseReportDate(report.asOf);
      const existingTimestamp = parseReportDate(entry.latestAsOf);
      if (nextTimestamp > existingTimestamp) {
        entry.latestAsOf = report.asOf;
      }
    }
  });

  const accounts = Array.from(registry.values()).map((account) => {
    account.reports.sort((a, b) => parseReportDate(b.asOf) - parseReportDate(a.asOf));
    account.latestReport = account.reports[0] || null;
    account.latestAsOf = account.latestReport?.asOf || account.latestAsOf || '';
    if (!account.name && account.latestReport?.name) {
      account.name = account.latestReport.name;
    }
    return account;
  });

  accounts.sort((a, b) => {
    const nameA = (a.name || '').toString().toLowerCase();
    const nameB = (b.name || '').toString().toLowerCase();
    if (nameA === nameB) {
      return (a.charter || '').localeCompare(b.charter || '');
    }
    return nameA.localeCompare(nameB);
  });

  return accounts;
}

function normalizeAccountProducts(accounts) {
  const nextState = {};
  accounts.forEach((account) => {
    const existing = appState.accountProducts[account.id];
    nextState[account.id] = normalizeAccountProductRecord(existing || {}, account);
  });
  saveAccountProductState(nextState);
  return nextState;
}

function normalizeAccountProductRecord(record, account) {
  const normalizedProducts = {};
  const sourceProducts = record?.products && typeof record.products === 'object' ? record.products : {};
  DEFAULT_PRODUCTS.forEach((product) => {
    normalizedProducts[product] = sanitizeProductValue(sourceProducts[product]);
  });

  const customNames = new Set();
  const sourceCustom = Array.isArray(record?.customProducts) ? record.customProducts : [];
  sourceCustom.forEach((name) => {
    const trimmed = (name || '').toString().trim();
    if (trimmed && !DEFAULT_PRODUCTS.includes(trimmed)) {
      customNames.add(trimmed);
    }
  });
  Object.keys(sourceProducts || {}).forEach((name) => {
    const trimmed = (name || '').toString().trim();
    if (trimmed && !DEFAULT_PRODUCTS.includes(trimmed)) {
      customNames.add(trimmed);
    }
  });

  const customProducts = Array.from(customNames).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  customProducts.forEach((name) => {
    normalizedProducts[name] = sanitizeProductValue(sourceProducts[name]);
  });

  const sourceParameters = record?.parameters && typeof record.parameters === 'object' ? record.parameters : {};
  const normalizedParameters = {};
  const parameterNames = new Set([
    ...DEFAULT_PRODUCTS,
    ...customProducts,
    ...Object.keys(sourceProducts || {}),
    ...Object.keys(sourceParameters || {})
  ]);

  parameterNames.forEach((name) => {
    if (!name) return;
    const sanitized = sanitizeProductParameters(name, sourceParameters[name]);
    if (Object.keys(sanitized).length) {
      normalizedParameters[name] = sanitized;
    }
  });

  return {
    accountId: account.id,
    charter: account.charter || '',
    name: account.name || '',
    updatedAt: record?.updatedAt || null,
    products: normalizedProducts,
    customProducts,
    parameters: normalizedParameters
  };
}

function cloneProductRecord(record) {
  return {
    accountId: record.accountId,
    charter: record.charter,
    name: record.name,
    updatedAt: record.updatedAt || null,
    products: { ...(record.products || {}) },
    customProducts: Array.isArray(record.customProducts) ? record.customProducts.slice() : [],
    parameters:
      record.parameters && typeof record.parameters === 'object'
        ? Object.fromEntries(
            Object.entries(record.parameters).map(([name, values]) => [
              name,
              values && typeof values === 'object' ? { ...values } : {}
            ])
          )
        : {}
  };
}

function sanitizeProductValue(value) {
  if (value === 'yes' || value === 'no') return value;
  return '';
}

function updateAccountProductRecord(account, updater) {
  const current = appState.accountProducts[account.id] || normalizeAccountProductRecord({}, account);
  const working = cloneProductRecord(current);
  const result = updater ? updater(working) || working : working;
  result.accountId = account.id;
  result.charter = account.charter || '';
  result.name = account.name || '';
  result.updatedAt = new Date().toISOString();
  if (!result.parameters || typeof result.parameters !== 'object') {
    result.parameters = {};
  }
  const normalized = normalizeAccountProductRecord(result, account);
  normalized.updatedAt = result.updatedAt;
  const nextState = { ...appState.accountProducts, [account.id]: normalized };
  saveAccountProductState(nextState);
  return normalized;
}

function getAccountProductNames(record) {
  const defaults = DEFAULT_PRODUCTS.slice();
  const customList = Array.isArray(record?.customProducts) ? record.customProducts : [];
  const custom = customList
    .map((name) => (name || '').toString().trim())
    .filter((name) => name && !DEFAULT_PRODUCTS.includes(name));
  const extras = Object.keys(record?.products || {})
    .map((name) => (name || '').toString().trim())
    .filter((name) => name && !DEFAULT_PRODUCTS.includes(name) && !custom.includes(name));

  const orderedCustom = custom.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  const orderedExtras = extras.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

  const combined = [...defaults, ...orderedCustom, ...orderedExtras];
  return combined.filter((name, index, array) => array.indexOf(name) === index);
}

function parseReportDate(value) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function loadProspectReports() {
  if (prospectDataPromise) return prospectDataPromise;
  const staticPayload = window.GFS_PROSPECTS;
  if (staticPayload && Array.isArray(staticPayload.reports)) {
    const reports = staticPayload.reports;
    PROSPECT_REPORTS = reports;
    PROSPECT_LOOKUP = Object.fromEntries(reports.map((report) => [report.id, report]));
    prospectDataPromise = Promise.resolve(reports);
    return prospectDataPromise;
  }
  if (!prospectsDataUrl) {
    prospectDataPromise = Promise.resolve([]);
    return prospectDataPromise;
  }

  prospectDataPromise = fetch(prospectsDataUrl, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load prospects data (${response.status})`);
      }
      return response.json();
    })
    .then((payload) => {
      const reports = Array.isArray(payload?.reports) ? payload.reports : [];
      PROSPECT_REPORTS = reports;
      PROSPECT_LOOKUP = Object.fromEntries(reports.map((report) => [report.id, report]));
      return reports;
    })
    .catch((error) => {
      console.error('Unable to load prospect data', error);
      PROSPECT_REPORTS = [];
      PROSPECT_LOOKUP = {};
      return [];
    });

  return prospectDataPromise;
}

const pageId = document.body?.dataset?.page || '';

const appState = {
  accounts: [],
  accountProducts: loadAccountProductState(),
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
  } else if (pageId === 'prospects') {
    initProspectsPage();
  } else if (pageId === 'prospect-detail') {
    initProspectDetailPage();
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
  const accountSelector = document.getElementById('account-hub-selector');
  const accountName = document.getElementById('account-hub-name');
  const accountCharter = document.getElementById('account-hub-charter');
  const latestDate = document.getElementById('account-hub-latest-date');
  const reportCount = document.getElementById('account-hub-report-count');
  const reportList = document.getElementById('account-hub-report-list');
  const productsContainer = document.getElementById('account-products-container');
  const productsEmpty = document.getElementById('account-products-empty');
  const productsUpdated = document.getElementById('account-products-updated');
  const addForm = document.getElementById('account-products-add-form');
  const addInput = document.getElementById('account-products-add-input');
  const addButton = addForm?.querySelector('button[type="submit"]');

  if (!accountSelector) return;

  let currentAccount = null;

  prepareAccountData().then((accounts) => {
    const initialId = populateAccountSelector(accountSelector, accounts, appState.activeAccountId);
    if (initialId) {
      saveActiveAccountId(initialId);
    }
    renderAccount(initialId || '');
  });

  accountSelector.addEventListener('change', (event) => {
    const id = event.target.value;
    saveActiveAccountId(id);
    renderAccount(id);
  });

  addForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentAccount) return;
    const value = (addInput?.value || '').toString().trim();
    if (!value) return;
    const name = value.replace(/\s+/g, ' ').trim();
    const updated = updateAccountProductRecord(currentAccount, (draft) => {
      if (!(name in draft.products)) {
        draft.products[name] = '';
      }
      if (!draft.customProducts.includes(name)) {
        draft.customProducts.push(name);
        draft.customProducts.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
      }
      return draft;
    });
    if (addInput) addInput.value = '';
    renderProducts(currentAccount, updated);
    renderProductsUpdated(updated);
  });

  function renderAccount(id) {
    const account = appState.accounts.find((item) => item.id === id) || null;
    currentAccount = account;

    if (!account) {
      if (accountName) accountName.textContent = 'Select a call report';
      if (accountCharter) accountCharter.textContent = '—';
      if (latestDate) latestDate.textContent = '—';
      if (reportCount) reportCount.textContent = '0';
      renderReportList(null);
      renderProducts(null, null);
      renderProductsUpdated(null);
      setAddControlsDisabled(true);
      return;
    }

    if (accountName) accountName.textContent = account.name || 'Unnamed credit union';
    if (accountCharter) accountCharter.textContent = account.charter || '—';
    if (latestDate) latestDate.textContent = account.latestAsOf || '—';
    if (reportCount) reportCount.textContent = account.reports.length.toString();
    renderReportList(account);
    const record = appState.accountProducts[account.id] || normalizeAccountProductRecord({}, account);
    renderProducts(account, record);
    renderProductsUpdated(record);
    setAddControlsDisabled(false);
  }

  function renderReportList(account) {
    if (!reportList) return;
    reportList.innerHTML = '';
    if (!account || !account.reports.length) {
      const item = document.createElement('li');
      item.className = 'account-hub__report-empty';
      item.textContent = account
        ? 'No call reports available for this credit union yet.'
        : 'Upload call reports to build the account list.';
      reportList.append(item);
      return;
    }

    account.reports.forEach((report) => {
      const item = document.createElement('li');
      item.className = 'account-hub__report-item';

      const topRow = document.createElement('div');
      topRow.className = 'account-hub__report-row';

      const dateLabel = document.createElement('span');
      dateLabel.className = 'account-hub__report-date';
      dateLabel.textContent = report.asOf || 'Call report';
      topRow.append(dateLabel);

      const links = document.createElement('div');
      links.className = 'account-hub__report-links';

      const detailLink = document.createElement('a');
      detailLink.className = 'account-hub__report-link';
      detailLink.href = `prospects/${report.id}.html`;
      detailLink.textContent = 'Open dashboard';
      links.append(detailLink);

      if (report.callReportUrl) {
        const pdfLink = document.createElement('a');
        pdfLink.className = 'account-hub__report-link';
        pdfLink.href = report.callReportUrl;
        pdfLink.target = '_blank';
        pdfLink.rel = 'noopener';
        pdfLink.textContent = 'Call report PDF';
        links.append(pdfLink);
      }

      topRow.append(links);
      item.append(topRow);

      const notes = [];
      if (report.totalLoans) {
        notes.push(`Loans ${formatProspectCurrency(report.totalLoans)}`);
      }
      if (report.loansGrantedYtdCount) {
        notes.push(`YTD originations ${formatNumber(report.loansGrantedYtdCount)}`);
      }

      if (notes.length) {
        const meta = document.createElement('p');
        meta.className = 'account-hub__report-meta';
        meta.textContent = notes.join(' • ');
        item.append(meta);
      }

      reportList.append(item);
    });
  }

  function renderProducts(account, record) {
    if (!productsContainer || !productsEmpty) return;
    productsContainer.innerHTML = '';

    if (!account || !record) {
      productsContainer.hidden = true;
      productsEmpty.hidden = false;
      productsEmpty.textContent = 'Select an account to manage product coverage.';
      return;
    }

    const names = getAccountProductNames(record);
    if (!names.length) {
      productsContainer.hidden = true;
      productsEmpty.hidden = false;
      productsEmpty.textContent = 'No products configured for this account yet.';
      return;
    }

    productsContainer.hidden = false;
    productsEmpty.hidden = true;

    const applyFieldValidation = (fieldEl, productName, currentRecord, { statusOverride, missing } = {}) => {
      if (!fieldEl) return;
      const validationEl = fieldEl.querySelector('.coverage-field__validation');
      if (!validationEl) return;
      const status = statusOverride ?? currentRecord.products?.[productName] ?? '';
      let missingDefs = missing || [];
      if (!missingDefs.length && status === 'yes') {
        const definitions = getProductParameterDefinitions(productName);
        const values = currentRecord.parameters?.[productName] || {};
        missingDefs = collectMissingRequiredParameters(definitions, values);
      }
      if (status === 'yes' && missingDefs.length) {
        fieldEl.classList.add('coverage-field--invalid');
        const labelList = missingDefs.map((definition) => definition.label).join(', ');
        validationEl.textContent = `Add required details: ${labelList}.`;
      } else {
        fieldEl.classList.remove('coverage-field--invalid');
        validationEl.textContent = '';
      }
    };

    names.forEach((name) => {
      const field = document.createElement('div');
      field.className = 'coverage-field';
      field.dataset.productName = name;

      const labelEl = document.createElement('span');
      labelEl.className = 'coverage-field__label';
      labelEl.textContent = name;
      field.append(labelEl);

      const select = document.createElement('select');
      select.className = 'coverage-field__select';
      select.name = `product-${name}`;
      select.dataset.productName = name;

      const blank = document.createElement('option');
      blank.value = '';
      blank.textContent = '—';
      select.append(blank);

      ['yes', 'no'].forEach((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value === 'yes' ? 'Yes' : 'No';
        select.append(option);
      });

      const currentValue = record.products[name] || '';
      select.value = currentValue;

      const parameterDefinitions = getProductParameterDefinitions(name);
      const parameterValues = record.parameters?.[name] || {};

      const parametersWrapper = document.createElement('div');
      parametersWrapper.className = 'coverage-field__parameters';

      parameterDefinitions.forEach((definition) => {
        const parameterField = document.createElement('label');
        parameterField.className = 'coverage-parameter';
        parameterField.dataset.parameterId = definition.id;

        const parameterLabel = document.createElement('span');
        parameterLabel.className = 'coverage-parameter__label';
        parameterLabel.textContent = definition.requiredWhenActive
          ? `${definition.label} *`
          : definition.label;
        parameterField.append(parameterLabel);

        const input = document.createElement('input');
        input.className = 'coverage-parameter__input';
        input.type = definition.inputType || 'text';
        if (definition.placeholder) {
          input.placeholder = definition.placeholder;
        }
        if (definition.inputMode) {
          input.setAttribute('inputmode', definition.inputMode);
        }
        input.value = parameterValues[definition.id] || '';
        input.addEventListener('change', () => {
          const sanitizedValue = sanitizeParameterValue(definition, input.value);
          const updated = updateAccountProductRecord(account, (draft) => {
            if (!draft.parameters[name]) {
              draft.parameters[name] = {};
            }
            if (sanitizedValue) {
              draft.parameters[name][definition.id] = sanitizedValue;
            } else if (draft.parameters[name]) {
              delete draft.parameters[name][definition.id];
            }
            if (draft.parameters[name] && !Object.keys(draft.parameters[name]).length) {
              delete draft.parameters[name];
            }
            return draft;
          });
          renderProducts(account, updated);
          renderProductsUpdated(updated);
        });

        parameterField.append(input);
        parametersWrapper.append(parameterField);
      });

      select.addEventListener('change', () => {
        const nextValue = sanitizeProductValue(select.value);
        if (nextValue === 'yes') {
          const definitions = getProductParameterDefinitions(name);
          const values = record.parameters?.[name] || {};
          const missing = collectMissingRequiredParameters(definitions, values);
          if (missing.length) {
            select.value = currentValue;
            applyFieldValidation(field, name, { ...record, products: { ...record.products, [name]: 'yes' } }, {
              statusOverride: 'yes',
              missing
            });
            const firstMissing = field.querySelector(
              `.coverage-parameter[data-parameter-id="${missing[0]?.id}"] .coverage-parameter__input`
            );
            if (firstMissing) {
              firstMissing.focus();
            }
            return;
          }
        }

        const updated = updateAccountProductRecord(account, (draft) => {
          draft.products[name] = nextValue;
          if (!DEFAULT_PRODUCTS.includes(name) && !draft.customProducts.includes(name)) {
            draft.customProducts.push(name);
            draft.customProducts.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
          }
          return draft;
        });
        renderProducts(account, updated);
        renderProductsUpdated(updated);
      });

      field.append(select);

      if (parameterDefinitions.length) {
        field.append(parametersWrapper);
      }

      const validationMessage = document.createElement('p');
      validationMessage.className = 'coverage-field__validation';
      validationMessage.setAttribute('role', 'status');
      validationMessage.setAttribute('aria-live', 'polite');
      field.append(validationMessage);

      if (!DEFAULT_PRODUCTS.includes(name)) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'coverage-field__remove';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
          const updated = updateAccountProductRecord(account, (draft) => {
            delete draft.products[name];
            draft.customProducts = draft.customProducts.filter((product) => product !== name);
            if (draft.parameters) {
              delete draft.parameters[name];
            }
            return draft;
          });
          renderProducts(account, updated);
          renderProductsUpdated(updated);
        });
        field.append(removeBtn);
      }

      applyFieldValidation(field, name, record);
      productsContainer.append(field);
    });
  }

  function renderProductsUpdated(record) {
    if (!productsUpdated) return;
    if (!record || !record.updatedAt) {
      productsUpdated.textContent = 'Select an account to manage product coverage.';
      return;
    }
    productsUpdated.textContent = `Updated ${formatDateTime(record.updatedAt)}.`;
  }

  function setAddControlsDisabled(disabled) {
    if (addInput) addInput.disabled = disabled;
    if (addButton) addButton.disabled = disabled;
  }

  function populateAccountSelector(select, accounts, selectedId) {
    if (!select) return '';
    const previous = select.value;
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = accounts.length ? 'Select a credit union' : 'No call reports available';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.append(placeholder);

    accounts.forEach((account) => {
      const option = document.createElement('option');
      option.value = account.id;
      option.textContent = account.charter
        ? `${account.name} (Charter ${account.charter})`
        : account.name || account.id;
      select.append(option);
    });

    let resolved = '';
    if (selectedId && accounts.some((account) => account.id === selectedId)) {
      resolved = selectedId;
    } else if (previous && accounts.some((account) => account.id === previous)) {
      resolved = previous;
    } else if (accounts[0]) {
      resolved = accounts[0].id;
    }

    if (resolved) {
      select.value = resolved;
      placeholder.selected = false;
    }

    select.disabled = accounts.length === 0;
    return resolved;
  }
}
// -----------------------
// Reporting page
// -----------------------
function initReportingPage() {
  const tableBody = document.querySelector('#account-coverage-table tbody');
  const emptyState = document.getElementById('account-coverage-empty');

  if (!tableBody) return;

  prepareAccountData().then((accounts) => {
    renderCoverageTable(accounts);
  });

  function renderCoverageTable(accounts) {
    tableBody.innerHTML = '';
    if (!accounts.length) {
      if (emptyState) {
        emptyState.hidden = false;
        emptyState.textContent = 'Upload call reports to populate the account list.';
      }
      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
    }

    accounts.forEach((account) => {
      const record = appState.accountProducts[account.id] || normalizeAccountProductRecord({}, account);
      const counts = summarizeProductStatuses(record);
      const row = document.createElement('tr');

      const cells = [
        account.name || 'Unnamed credit union',
        account.charter || '—',
        counts.yes.toString(),
        counts.no.toString(),
        counts.pending.toString(),
        record.updatedAt ? formatDateTime(record.updatedAt) : 'Not set',
        account.latestAsOf || '—'
      ];

      cells.forEach((value, index) => {
        const cell = document.createElement('td');
        if (index === 6 && account.latestReport) {
          const label = document.createElement('div');
          label.textContent = value;
          cell.append(label);

          const linkGroup = document.createElement('div');
          linkGroup.className = 'account-hub__report-links';

          const detailLink = document.createElement('a');
          detailLink.href = `prospects/${account.latestReport.id}.html`;
          detailLink.className = 'account-hub__report-link';
          detailLink.textContent = 'Open dashboard';
          linkGroup.append(detailLink);

          if (account.latestReport.callReportUrl) {
            const pdfLink = document.createElement('a');
            pdfLink.href = account.latestReport.callReportUrl;
            pdfLink.target = '_blank';
            pdfLink.rel = 'noopener';
            pdfLink.className = 'account-hub__report-link';
            pdfLink.textContent = 'Call report PDF';
            linkGroup.append(pdfLink);
          }

          cell.append(linkGroup);
        } else {
          cell.textContent = value;
        }
        row.append(cell);
      });

      tableBody.append(row);
    });
  }

  function summarizeProductStatuses(record) {
    const names = getAccountProductNames(record);
    let yes = 0;
    let no = 0;
    let pending = 0;
    names.forEach((name) => {
      const value = record.products?.[name] || '';
      if (value === 'yes') {
        if (productActivationIsValid(record, name)) {
          yes += 1;
        } else {
          pending += 1;
        }
      } else if (value === 'no') {
        no += 1;
      } else {
        pending += 1;
      }
    });
    return { yes, no, pending };
  }
}
// -----------------------
// Prospects page
// -----------------------
function initProspectsPage() {
  const prospectSelector = document.getElementById('prospect-selector');
  const logSelector = document.getElementById('prospect-log-prospect');
  const productFootnote = document.getElementById('prospect-product-footnote');

  if (!prospectSelector) return;

  if (productFootnote) {
    productFootnote.textContent = PROSPECT_PRODUCT_FOOTNOTE;
  }

  loadProspectReports().then((reports) => {
    prospectSelector.innerHTML = '';
    if (logSelector) {
      logSelector.innerHTML = '';
    }

    reports.forEach((report) => {
      const option = document.createElement('option');
      option.value = report.id;
      option.textContent = `${report.name} — ${report.asOf}`;
      prospectSelector.append(option);
      if (logSelector) {
        logSelector.append(option.cloneNode(true));
      }
    });

    const initialId = reports[0]?.id || '';
    if (initialId) {
      prospectState.activeProspectId = initialId;
      prospectSelector.value = initialId;
      if (logSelector) {
        logSelector.value = initialId;
      }
      renderProspect(initialId);
    }

    prospectSelector.addEventListener('change', (event) => {
      const id = event.target.value;
      if (!id) return;
      prospectState.activeProspectId = id;
      if (logSelector && !prospectState.logSelectTouched) {
        logSelector.value = id;
      }
      renderProspect(id);
    });

    if (logSelector) {
      logSelector.addEventListener('change', (event) => {
        const id = event.target.value;
        prospectState.logSelectTouched = true;
        if (!id) return;
        prospectState.activeProspectId = id;
        if (prospectSelector.value !== id) {
          prospectSelector.value = id;
        }
        renderProspect(id);
      });
    }

    setupProspectLogForm();
    renderProspectLog();
  });
}

function initProspectDetailPage() {
  const logSelector = document.getElementById('prospect-log-prospect');
  const productFootnote = document.getElementById('prospect-product-footnote');
  const requestedId = document.body?.dataset?.prospectId || '';

  if (productFootnote) {
    productFootnote.textContent = PROSPECT_PRODUCT_FOOTNOTE;
  }

  loadProspectReports().then((reports) => {
    if (logSelector) {
      logSelector.innerHTML = '';
      reports.forEach((report) => {
        const option = document.createElement('option');
        option.value = report.id;
        option.textContent = `${report.name} — ${report.asOf}`;
        logSelector.append(option);
      });
    }

    const initialId = (requestedId && PROSPECT_LOOKUP[requestedId])
      ? requestedId
      : reports[0]?.id || '';

    if (logSelector) {
      logSelector.value = initialId;
      logSelector.disabled = Boolean(requestedId);
    }

    if (initialId) {
      prospectState.activeProspectId = initialId;
      if (requestedId) {
        prospectState.logSelectTouched = true;
      }
      renderProspect(initialId);
    }

    if (logSelector && !logSelector.disabled) {
      logSelector.addEventListener('change', (event) => {
        const id = event.target.value;
        if (!id) return;
        prospectState.logSelectTouched = true;
        prospectState.activeProspectId = id;
        renderProspect(id);
      });
    }

    setupProspectLogForm();
    renderProspectLog();
  });
}

function renderProspect(id) {
  const report = PROSPECT_LOOKUP[id];
  if (!report) return;
  prospectState.activeProspectId = id;
  const metrics = computeProspectMetrics(report);
  const opportunities = PROSPECT_PRODUCT_MODELS.map((model) => ({
    model,
    opportunity: calculateProductOpportunity(report, metrics, model)
  }));
  renderProspectSummary(report, metrics);
  renderProspectRankings(report, metrics, opportunities);
  renderProspectChannels(report, metrics);
  renderLoanMixTable(report, metrics);
  renderRiskTable(report, metrics);
  renderProspectRiskHighlights(report);
  renderProspectInsights(report);
  renderProductTable(report, metrics, opportunities);
  renderProspectLog();
}

function computeProspectMetrics(report) {
  const installmentKeys = ['creditCard', 'student', 'otherUnsecured', 'newVehicle', 'usedVehicle', 'leases', 'otherSecured'];
  const autoKeys = ['newVehicle', 'usedVehicle'];
  const realEstateKeys = ['firstMortgage', 'juniorMortgage', 'otherNonCommercialRE'];
  const securedConsumerKeys = ['newVehicle', 'usedVehicle', 'otherSecured'];
  const annualizationFactor = report.periodMonths ? 12 / report.periodMonths : 0;

  const installmentBalance = sumBalances(report, installmentKeys);
  const installmentCount = sumCounts(report, installmentKeys);
  const autoBalance = sumBalances(report, autoKeys);
  const autoCount = sumCounts(report, autoKeys);
  const realEstateBalance = sumBalances(report, realEstateKeys);
  const realEstateCount = sumCounts(report, realEstateKeys);
  const securedConsumerCount = sumCounts(report, securedConsumerKeys);

  const totalLoans = report.totalLoans || 0;
  const totalAssets = report.totalAssets || 0;
  const totalDelinquency60 = report.delinquencyTotal60Plus || 0;
  const netChargeOff = (report.chargeOffs?.total?.chargeOffs || 0) - (report.chargeOffs?.total?.recoveries || 0);
  const netChargeOffAnnualized = annualizationFactor ? netChargeOff * annualizationFactor : netChargeOff;
  const allowanceCoverage = totalLoans ? (report.allowance || 0) / totalLoans : 0;
  const loanYieldAnnualized = totalLoans ? ((report.interestOnLoansYtd || 0) * annualizationFactor) / totalLoans : 0;

  const delinquencyShares = {};
  Object.entries(report.delinquency60PlusDetail || {}).forEach(([key, detail]) => {
    delinquencyShares[key] = totalDelinquency60 ? (detail.balance || 0) / totalDelinquency60 : 0;
  });

  return {
    installmentBalance,
    installmentCount,
    autoBalance,
    autoCount,
    realEstateBalance,
    realEstateCount,
    securedConsumerCount,
    securedConsumerBalance: sumBalances(report, securedConsumerKeys),
    consumerShare: totalLoans ? installmentBalance / totalLoans : 0,
    realEstateShare: totalLoans ? realEstateBalance / totalLoans : 0,
    delinquencyRatio: totalLoans ? totalDelinquency60 / totalLoans : 0,
    netChargeOff,
    netChargeOffAnnualized,
    netChargeOffRatio: totalLoans ? (netChargeOffAnnualized || 0) / totalLoans : 0,
    allowanceCoverage,
    loanYieldAnnualized,
    loanToAsset: totalAssets ? totalLoans / totalAssets : 0,
    indirectShare: totalLoans ? (report.indirect?.total?.balance || 0) / totalLoans : 0,
    annualizationFactor,
    annualizedLoanOriginations: (report.loansGrantedYtdCount || 0) * annualizationFactor,
    delinquencyShares
  };
}

function renderProspectSummary(report, metrics) {
  setText('prospect-title', report.name || 'Prospect intelligence');
  const subtitle = document.getElementById('prospect-subtitle');
  if (subtitle) {
    const summary = report.name
      ? `Call report intelligence and protection modeling for ${report.name}.`
      : 'Load a 5300 call report to review consumer lending exposure and protection revenue opportunities.';
    subtitle.textContent = summary;
  }

  const asOfEl = document.getElementById('prospect-reporting-date');
  if (asOfEl) {
    asOfEl.textContent = '';
    if (report.asOf) {
      asOfEl.append(`Call report as of ${report.asOf}`);
    }
    if (report.callReportUrl) {
      if (asOfEl.textContent) {
        asOfEl.append(' • ');
      }
      const link = document.createElement('a');
      let href = report.callReportUrl;
      try {
        link.href = new URL(href, `${window.location.origin}/`).href;
      } catch (error) {
        link.href = href;
      }
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'View filing';
      asOfEl.append(link);
    }
  }
  setText('prospect-total-loans', formatProspectCurrency(report.totalLoans));
  const loanNotes = [
    `${formatPercent(metrics.loanToAsset)} of assets`,
    `${formatNumber(report.loanCount)} loans`
  ];
  if (metrics.indirectShare > 0) {
    loanNotes.push(`Indirect ${formatPercent(metrics.indirectShare)}`);
  }
  setText('prospect-total-loans-note', loanNotes.filter(Boolean).join(' • '));

  setText('prospect-installment-balance', formatProspectCurrency(metrics.installmentBalance));
  setText(
    'prospect-installment-note',
    [`${formatPercent(metrics.consumerShare)} of total`, `${formatNumber(metrics.installmentCount)} loans`]
      .filter(Boolean)
      .join(' • ')
  );

  setText('prospect-real-estate-balance', formatProspectCurrency(metrics.realEstateBalance));
  const realEstateNote = metrics.realEstateBalance
    ? [`${formatPercent(metrics.realEstateShare)} of total`, `${formatNumber(metrics.realEstateCount)} loans`]
        .filter(Boolean)
        .join(' • ')
    : 'Minimal residential exposure';
  setText('prospect-real-estate-note', realEstateNote);

  setText('prospect-delinquency', formatProspectCurrency(report.delinquencyTotal60Plus));
  setText(
    'prospect-delinquency-note',
    [`${formatPercent(metrics.delinquencyRatio)} of loans`, `${formatNumber(report.delinquencyTotal60PlusLoans)} loans 60+ days`]
      .filter(Boolean)
      .join(' • ')
  );

  setText('prospect-chargeoffs', formatProspectCurrency(metrics.netChargeOffAnnualized));
  setText(
    'prospect-chargeoffs-note',
    [`Annualized ${formatPercent(metrics.netChargeOffRatio, { decimals: 2 })}`, `YTD net ${formatProspectCurrency(metrics.netChargeOff)}`]
      .filter(Boolean)
      .join(' • ')
  );

  setText('prospect-allowance', formatProspectCurrency(report.allowance));
  setText(
    'prospect-allowance-note',
    [`Coverage ${formatPercent(metrics.allowanceCoverage, { decimals: 2 })}`, `Loan yield ${formatPercent(metrics.loanYieldAnnualized, { decimals: 1 })}`]
      .filter(Boolean)
      .join(' • ')
  );

  setText('prospect-nonaccrual', formatProspectCurrency(report.nonAccrualLoans));
  setText('prospect-bankruptcy', formatProspectCurrency(report.bankruptcyOutstanding));
  const tdrText = report.tdrLoans
    ? `${formatNumber(report.tdrLoans)} loans • ${formatProspectCurrency(report.tdrBalance)}`
    : formatProspectCurrency(report.tdrBalance);
  setText('prospect-tdr', tdrText);
}

function renderProspectRankings(report, metrics, opportunityRows = []) {
  const section = document.getElementById('prospect-rankings-section');
  const list = document.getElementById('prospect-rankings-list');
  const note = document.getElementById('prospect-rankings-note');
  if (!section || !list) return;

  const rows = (opportunityRows.length
    ? opportunityRows
    : PROSPECT_PRODUCT_MODELS.map((model) => ({
        model,
        opportunity: calculateProductOpportunity(report, metrics, model)
      })))
    .map((item) => ({
      ...item,
      grossAnnual: Number(item.opportunity?.grossAnnual || 0)
    }))
    .filter((item) => item.grossAnnual > 0);

  rows.sort((a, b) => b.grossAnnual - a.grossAnnual);

  list.innerHTML = '';

  if (!rows.length) {
    section.hidden = true;
    if (note) note.hidden = true;
    return;
  }

  section.hidden = false;
  if (note) {
    note.hidden = false;
    note.textContent = 'Rankings are based on modeled gross annual revenue for each product or service.';
  }

  const totalGross = rows.reduce((sum, item) => sum + item.grossAnnual, 0);

  rows.forEach((item, index) => {
    const entry = document.createElement('li');
    entry.className = 'prospects__rankings-item';

    const label = document.createElement('span');
    label.className = 'prospects__rankings-label';
    label.textContent = `${index + 1}. ${item.model.label}`;
    entry.append(label);

    const value = document.createElement('span');
    value.className = 'prospects__rankings-value';
    value.textContent = formatProspectCurrency(item.grossAnnual);
    entry.append(value);

    const metaParts = [];
    if (item.opportunity?.eligibleBalance) {
      metaParts.push(`${formatProspectCurrency(item.opportunity.eligibleBalance)} eligible balance`);
    } else if (item.opportunity?.annualEligible) {
      metaParts.push(`${formatNumber(Math.round(item.opportunity.annualEligible))} loans / yr`);
    }
    const share = totalGross ? item.grossAnnual / totalGross : 0;
    if (share > 0) {
      metaParts.push(`${formatPercent(share, { decimals: 0 })} of modeled revenue`);
    }

    if (metaParts.length) {
      const meta = document.createElement('span');
      meta.className = 'prospects__rankings-meta';
      meta.textContent = metaParts.join(' • ');
      entry.append(meta);
    }

    list.append(entry);
  });
}

function renderProspectChannels(report, metrics) {
  renderIndirectTable(report, metrics);
  renderDelinquencySourceTable(report);
}

function renderIndirectTable(report, metrics) {
  const table = document.getElementById('prospect-indirect-table');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const rows = [
    { key: 'auto', label: 'Indirect auto (new & used)' },
    { key: 'other', label: 'Indirect other' },
    { key: 'total', label: 'Total indirect', isTotal: true }
  ];
  const totalLoans = report.totalLoans || 0;

  const hasIndirect = rows.some((row) => {
    const data = report.indirect?.[row.key];
    return data && ((data.balance || 0) !== 0 || (data.count || 0) !== 0);
  });

  if (!hasIndirect) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'No indirect lending reported.';
    row.append(cell);
    tbody.append(row);
    return;
  }

  rows.forEach((rowDef) => {
    const data = report.indirect?.[rowDef.key] || {};
    const count = data.count || 0;
    const balance = data.balance || 0;
    const share = rowDef.isTotal
      ? metrics.indirectShare || 0
      : totalLoans
      ? balance / totalLoans
      : 0;

    const row = document.createElement('tr');
    if (rowDef.isTotal) row.className = 'table-total';

    appendTableCell(row, rowDef.label, true);
    appendTableCell(row, count ? formatNumber(count) : '—');
    appendTableCell(row, formatProspectCurrency(balance));
    appendTableCell(row, balance ? formatPercent(share, { decimals: 1 }) : '—');
    tbody.append(row);
  });
}

function renderDelinquencySourceTable(report) {
  const table = document.getElementById('prospect-delinquency-source-table');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const sources = report.delinquencySources || {};
  const total = report.delinquencyTotal60Plus || 0;

  const hasDetail = Object.keys(PROSPECT_DELINQUENCY_SOURCE_LABELS).some(
    (key) => Number(sources[key]) > 0
  );

  if (!hasDetail) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.textContent = 'No delinquency source detail reported.';
    row.append(cell);
    tbody.append(row);
    return;
  }

  Object.entries(PROSPECT_DELINQUENCY_SOURCE_LABELS).forEach(([key, label]) => {
    const value = sources[key] || 0;
    const share = total ? value / total : 0;
    const row = document.createElement('tr');
    appendTableCell(row, label, true);
    appendTableCell(row, formatProspectCurrency(value));
    appendTableCell(row, value ? formatPercent(share, { decimals: 1 }) : '—');
    tbody.append(row);
  });

  const totalRow = document.createElement('tr');
  totalRow.className = 'table-total';
  appendTableCell(totalRow, 'Total 60+ delinquency', true);
  appendTableCell(totalRow, formatProspectCurrency(total));
  appendTableCell(totalRow, total ? formatPercent(1) : '—');
  tbody.append(totalRow);
}

function renderLoanMixTable(report, metrics) {
  const table = document.getElementById('prospect-loan-mix-table');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  PROSPECT_LOAN_ORDER.forEach((key) => {
    const mix = report.loanMix?.[key];
    if (!mix) return;
    const row = document.createElement('tr');
    const rateDisplay = mix.balance > 0 && Number.isFinite(mix.rate) && mix.rate !== 0 ? `${mix.rate.toFixed(2)}%` : '—';
    const share = report.totalLoans ? (mix.balance || 0) / report.totalLoans : 0;

    appendTableCell(row, mix.label || key, true);
    appendTableCell(row, rateDisplay);
    appendTableCell(row, mix.count ? formatNumber(mix.count) : '—');
    appendTableCell(row, formatProspectCurrency(mix.balance));
    appendTableCell(row, mix.balance ? formatPercent(share) : '—');
    tbody.append(row);
  });
}

function renderRiskTable(report, metrics) {
  const table = document.getElementById('prospect-risk-table');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const keys = new Set([
    ...Object.keys(report.delinquency60PlusDetail || {}),
    ...Object.keys(report.chargeOffs || {}).filter((key) => key !== 'total')
  ]);

  if (!keys.size) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = 'No delinquency or charge-off data available for consumer products.';
    row.append(cell);
    tbody.append(row);
    return;
  }

  keys.forEach((key) => {
    const delinquency = report.delinquency60PlusDetail?.[key];
    const chargeOff = report.chargeOffs?.[key];
    const label = delinquency?.label || chargeOff?.label || report.loanMix?.[key]?.label || key;
    const balance = delinquency?.balance || 0;
    const loans = delinquency?.loans || 0;
    const share = metrics.delinquencyRatio && report.delinquencyTotal60Plus
      ? balance / report.delinquencyTotal60Plus
      : 0;

    const row = document.createElement('tr');
    appendTableCell(row, label, true);
    appendTableCell(row, formatProspectCurrency(balance));
    appendTableCell(row, loans ? formatNumber(loans) : '—');
    appendTableCell(row, balance ? formatPercent(share, { decimals: 1 }) : '—');
    appendTableCell(row, chargeOff ? formatProspectCurrency(chargeOff.chargeOffs || 0) : formatProspectCurrency(0));
    appendTableCell(row, chargeOff ? formatProspectCurrency(chargeOff.recoveries || 0) : formatProspectCurrency(0));
    tbody.append(row);
  });
}

function renderProspectRiskHighlights(report) {
  const list = document.getElementById('prospect-risk-highlights');
  if (!list) return;
  list.innerHTML = '';
  const highlights = report.riskHighlights || [];
  if (!highlights.length) {
    const item = document.createElement('li');
    item.textContent = 'No risk observations recorded yet.';
    list.append(item);
    return;
  }
  highlights.forEach((highlight) => {
    const item = document.createElement('li');
    item.textContent = highlight;
    list.append(item);
  });
}

function renderProspectInsights(report) {
  const list = document.getElementById('prospect-insights');
  if (!list) return;
  list.innerHTML = '';
  const insights = report.insights || [];
  if (!insights.length) {
    const item = document.createElement('li');
    item.textContent = 'Add call-out items as the prospect review evolves.';
    list.append(item);
    return;
  }
  insights.forEach((note) => {
    const item = document.createElement('li');
    item.textContent = note;
    list.append(item);
  });
}

function renderProductTable(report, metrics, opportunityRows) {
  const table = document.getElementById('prospect-product-table');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let totalGross = 0;
  let totalGfs = 0;
  let totalCreditUnion = 0;

  const rows = opportunityRows && opportunityRows.length
    ? opportunityRows
    : PROSPECT_PRODUCT_MODELS.map((model) => ({
        model,
        opportunity: calculateProductOpportunity(report, metrics, model)
      }));

  rows.forEach(({ model, opportunity }) => {
    totalGross += opportunity.grossAnnual;
    totalGfs += opportunity.gfsAnnual;
    totalCreditUnion += opportunity.creditUnionAnnual;

    const row = document.createElement('tr');
    appendTableCell(row, model.label, true);
    appendTableCell(row, opportunity.baseDisplay);
    appendTableCell(row, formatPercent(model.penetration, { decimals: 0 }));
    appendTableCell(row, formatProspectCurrency(opportunity.grossAnnual));
    appendTableCell(row, formatProspectCurrency(opportunity.gfsAnnual));
    appendTableCell(row, formatProspectCurrency(opportunity.creditUnionAnnual));
    tbody.append(row);
  });

  if (rows.length) {
    const totalRow = document.createElement('tr');
    totalRow.className = 'table-total';
    appendTableCell(totalRow, 'Total', true);
    appendTableCell(totalRow, '—');
    appendTableCell(totalRow, '—');
    appendTableCell(totalRow, formatProspectCurrency(totalGross));
    appendTableCell(totalRow, formatProspectCurrency(totalGfs));
    appendTableCell(totalRow, formatProspectCurrency(totalCreditUnion));
    tbody.append(totalRow);
  }
}

function calculateProductOpportunity(report, metrics, model) {
  if (model.type === 'consumer-coverage') {
    const consumerBalance = metrics.installmentBalance || 0;
    const ratePerThousand = Number(model.ratePerThousand) || 0;
    const penetration = Number(model.penetration) || 0;
    const creditUnionShare =
      typeof model.creditUnionShare === 'number' ? model.creditUnionShare : 0;
    const gfsShare = typeof model.gfsShare === 'number' ? model.gfsShare : 0;
    const grossShare =
      typeof model.grossShare === 'number'
        ? model.grossShare
        : creditUnionShare + gfsShare || 1;

    const monthlyFullCoverage = (consumerBalance / 1000) * ratePerThousand;
    const monthlyModeled = monthlyFullCoverage * penetration;
    const creditUnionMonthly = monthlyModeled * creditUnionShare;
    const gfsMonthly = monthlyModeled * gfsShare;
    const grossMonthly = monthlyModeled * grossShare;

    return {
      baseDisplay: `${formatProspectCurrency(consumerBalance)} consumer loans`,
      grossAnnual: grossMonthly * 12,
      gfsAnnual: gfsMonthly * 12,
      creditUnionAnnual: creditUnionMonthly * 12,
      eligibleBalance: consumerBalance,
      annualEligible: null,
      unitsSold: null
    };
  }

  if (model.type === 'direct-auto-ancillary') {
    const newVehicleCount = report.loanMix?.newVehicle?.count || 0;
    const usedVehicleCount = report.loanMix?.usedVehicle?.count || 0;
    const indirectAutoCount = report.indirect?.auto?.count || 0;
    const outstandingDirect = Math.max(newVehicleCount + usedVehicleCount - indirectAutoCount, 0);
    const averageTermMonths = Number(model.averageTermMonths) || 0;
    const penetration = Number(model.penetration) || 0;
    const monthlyEligible = averageTermMonths > 0 ? outstandingDirect / averageTermMonths : 0;
    const annualEligible = monthlyEligible * 12;
    const monthlyUnitsSold = monthlyEligible * penetration;
    const unitsSold = monthlyUnitsSold * 12;
    const gfsIncomePerUnit = Number(model.gfsIncomePerUnit) || 0;
    const creditUnionIncomePerUnit = Number(model.creditUnionIncomePerUnit) || 0;
    const retailPerUnit =
      typeof model.retailPerUnit === 'number'
        ? model.retailPerUnit
        : gfsIncomePerUnit + creditUnionIncomePerUnit;

    const grossAnnual = monthlyUnitsSold * retailPerUnit * 12;
    const gfsAnnual = monthlyUnitsSold * gfsIncomePerUnit * 12;
    const creditUnionAnnual = monthlyUnitsSold * creditUnionIncomePerUnit * 12;

    return {
      baseDisplay: `${formatNumber(Math.round(annualEligible))} loans / yr`,
      grossAnnual,
      gfsAnnual,
      creditUnionAnnual,
      eligibleBalance: null,
      annualEligible,
      unitsSold
    };
  }

  if (model.type === 'mob') {
    const eligibleBalance = sumBalances(report, model.eligibleBalanceKeys || []);
    const totalRate = (model.rates?.clp || 0) + (model.rates?.gfsMarkup || 0) + (model.rates?.creditUnionMarkup || 0);
    const grossAnnual = eligibleBalance * model.penetration * (totalRate / 100) * 12;
    const gfsAnnual = eligibleBalance * model.penetration * ((model.rates?.gfsMarkup || 0) / 100) * 12;
    const creditUnionAnnual = eligibleBalance * model.penetration * ((model.rates?.creditUnionMarkup || 0) / 100) * 12;
    return {
      baseDisplay: `${formatProspectCurrency(eligibleBalance)} outstanding`,
      grossAnnual,
      gfsAnnual,
      creditUnionAnnual,
      eligibleBalance,
      annualEligible: null,
      unitsSold: null
    };
  }

  const annualEligible = estimateAnnualOriginations(report, model.eligibleCountKeys || [], metrics.annualizationFactor);
  const unitsSold = annualEligible * model.penetration;
  const grossAnnual = unitsSold * (model.pricing?.retail || 0);
  const gfsAnnual = unitsSold * (model.pricing?.gfsShare || 0);
  const creditUnionAnnual = unitsSold * (model.pricing?.creditUnionShare || 0);
  return {
    baseDisplay: `${formatNumber(Math.round(annualEligible))} loans / yr`,
    grossAnnual,
    gfsAnnual,
    creditUnionAnnual,
    eligibleBalance: null,
    annualEligible,
    unitsSold
  };
}

function setupProspectLogForm() {
  const form = document.getElementById('prospect-log-form');
  if (!form) return;
  const dateInput = document.getElementById('prospect-log-date');
  const summaryInput = document.getElementById('prospect-log-summary');

  if (dateInput && !dateInput.value) {
    dateInput.valueAsDate = new Date();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const prospectId = (formData.get('prospectId') || '').toString();
    const eventDate = (formData.get('eventDate') || '').toString();
    const eventType = (formData.get('eventType') || '').toString();
    const summary = (formData.get('summary') || '').toString().trim();
    const currentProvider = (formData.get('currentProvider') || '').toString().trim();
    if (!prospectId || !eventDate || !eventType || !summary) return;

    const entry = {
      id: generateId('prospectLog'),
      prospectId,
      eventDate,
      eventType,
      currentProvider,
      owner: (formData.get('owner') || '').toString().trim(),
      nextStepDate: (formData.get('nextStepDate') || '').toString(),
      summary,
      createdAt: new Date().toISOString()
    };

    prospectState.logEntries.push(entry);
    saveProspectLog(prospectState.logEntries);
    form.reset();
    if (dateInput) {
      dateInput.valueAsDate = new Date();
    }
    if (summaryInput) {
      summaryInput.value = '';
    }
    if (!prospectState.logSelectTouched) {
      const logSelector = document.getElementById('prospect-log-prospect');
      if (logSelector) {
        logSelector.value = prospectId;
      }
    }
    if (!prospectState.activeProspectId) {
      prospectState.activeProspectId = prospectId;
    }
    renderProspect(prospectId);
  });
}

function renderProspectLog() {
  const table = document.getElementById('prospect-log-table');
  const countEl = document.getElementById('prospect-log-count');
  const emptyEl = document.getElementById('prospect-log-empty');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const logSelector = document.getElementById('prospect-log-prospect');
  const filterId = (logSelector?.value || prospectState.activeProspectId || '').toString();

  const entries = prospectState.logEntries
    .filter((entry) => !filterId || entry.prospectId === filterId)
    .sort((a, b) => {
      const aDate = new Date(a.eventDate || a.createdAt).getTime();
      const bDate = new Date(b.eventDate || b.createdAt).getTime();
      return bDate - aDate;
    });

  tbody.innerHTML = '';

  if (!entries.length) {
    if (emptyEl) emptyEl.hidden = false;
    if (countEl) countEl.textContent = '0 entries';
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (countEl) countEl.textContent = `${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`;

  entries.forEach((entry) => {
    const row = document.createElement('tr');
    appendTableCell(row, formatDate(entry.eventDate || entry.createdAt), true);
    appendTableCell(row, entry.eventType || '—');
    appendTableCell(row, entry.currentProvider || '—');
    appendTableCell(row, entry.summary || '—');
    appendTableCell(row, entry.owner || '—');
    appendTableCell(row, entry.nextStepDate ? formatDate(entry.nextStepDate) : '—');
    appendTableCell(row, formatDateTime(entry.createdAt));

    const actionCell = document.createElement('td');
    actionCell.className = 'table-actions';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn--ghost btn--small';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      deleteProspectLogEntry(entry.id);
    });
    actionCell.append(removeBtn);
    row.append(actionCell);
    tbody.append(row);
  });
}

function deleteProspectLogEntry(id) {
  prospectState.logEntries = prospectState.logEntries.filter((entry) => entry.id !== id);
  saveProspectLog(prospectState.logEntries);
  renderProspectLog();
}

function sumBalances(report, keys) {
  return keys.reduce((total, key) => total + (report.loanMix?.[key]?.balance || 0), 0);
}

function sumCounts(report, keys) {
  return keys.reduce((total, key) => total + (report.loanMix?.[key]?.count || 0), 0);
}

function estimateAnnualOriginations(report, keys, annualizationFactor) {
  const totalOutstanding = Object.values(report.loanMix || {}).reduce((sum, item) => sum + (item.count || 0), 0);
  if (!totalOutstanding || !report.loansGrantedYtdCount) return 0;
  const eligibleOutstanding = sumCounts(report, keys);
  if (!eligibleOutstanding) return 0;
  const ytdEligible = (report.loansGrantedYtdCount * eligibleOutstanding) / totalOutstanding;
  return annualizationFactor ? ytdEligible * annualizationFactor : ytdEligible;
}

function appendTableCell(row, value, isHeader = false) {
  const cell = document.createElement(isHeader ? 'th' : 'td');
  if (isHeader) cell.scope = 'row';
  cell.textContent = value;
  row.append(cell);
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

function formatCurrency(value, { decimals = 2 } = {}) {
  const numberValue = Number(value);
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  if (!Number.isFinite(numberValue)) {
    return formatter.format(0);
  }
  return formatter.format(numberValue);
}

function formatNumber(value, { decimals = 0 } = {}) {
  if (!Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0
  }).format(Number(value));
}

function formatPercent(value, { decimals = 1 } = {}) {
  if (!Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0
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

function setText(id, value) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = value;
}

function loadProspectLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROSPECT_LOG);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => ({
        id: entry.id || generateId('prospectLog'),
        prospectId: (entry.prospectId || '').toString(),
        eventDate: (entry.eventDate || '').toString(),
        eventType: (entry.eventType || '').toString(),
        currentProvider: (entry.currentProvider || '').toString(),
        summary: (entry.summary || '').toString(),
        owner: (entry.owner || '').toString(),
        nextStepDate: (entry.nextStepDate || '').toString(),
        createdAt: entry.createdAt || new Date().toISOString()
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Failed to load prospect log', error);
    return [];
  }
}

function saveProspectLog(entries) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROSPECT_LOG, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to persist prospect log', error);
  }
}
