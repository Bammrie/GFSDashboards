
const STORAGE_KEYS = {
  ACCOUNT_PRODUCTS: 'gfs.accountProducts.v1',
  ACTIVE_ACCOUNT: 'gfs.activeAccountId',
  PROSPECT_LOG: 'gfs.prospectLog.v1'
};

const CONSUMER_PROTECTION_PRODUCT = 'Credit Insurance/Debt Protection - Consumer';
const MORTGAGE_PROTECTION_PRODUCT = 'Credit Insurance - Mortgage';
const CONSUMER_COVERAGE_KEY = 'creditInsuranceConsumer';
const MORTGAGE_COVERAGE_KEY = 'creditInsuranceMortgage';

const LEGACY_CONSUMER_PRODUCTS = [
  'Credit Life (Single)',
  'Credit Life (Joint)',
  'Credit Life (Blended)',
  'Credit Disability (Single)',
  'Credit Disability (Joint)',
  'Credit Disability (Blended)',
  'Debt Protection Package A',
  'Debt Protection Package B',
  'Debt Protection Package C'
];

const LEGACY_MORTGAGE_PRODUCTS = ['Mortgage Life Insurance for 1st Lien mortgages'];

const LEGACY_CONSUMER_COVERAGE_KEYS = [
  'creditLifeSingle',
  'creditLifeJoint',
  'creditLifeBlended',
  'creditDisabilitySingle',
  'creditDisabilityJoint',
  'creditDisabilityBlended',
  'packageA',
  'packageB',
  'packageC'
];

const LEGACY_MORTGAGE_COVERAGE_KEYS = ['mortgageLifeFirstLien'];

const LEGACY_PRODUCT_NAMES = [...LEGACY_CONSUMER_PRODUCTS, ...LEGACY_MORTGAGE_PRODUCTS];

const DEFAULT_PRODUCTS = [
  CONSUMER_PROTECTION_PRODUCT,
  MORTGAGE_PROTECTION_PRODUCT,
  'GAP',
  'VSC',
  'Collateral Protection Insurance (CPI)',
  'Fidelity Bond',
  'AFG Balloon Loans'
];

const RATE_PARAMETER_SET = [
  { id: 'clpRate', label: 'CLP Rate', requiredWhenActive: true },
  { id: 'gfsMarkup', label: 'GFS Mark-Up', requiredWhenActive: true },
  { id: 'creditUnionMarkup', label: 'Credit Union Mark-Up', requiredWhenActive: true }
];

const PRODUCT_PARAMETER_DEFINITIONS = {
  [CONSUMER_PROTECTION_PRODUCT]: RATE_PARAMETER_SET,
  [MORTGAGE_PROTECTION_PRODUCT]: RATE_PARAMETER_SET,
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
  'AFG Balloon Loans': [
    { id: 'programRate', label: 'Program Rate', requiredWhenActive: true },
    { id: 'gfsMarkup', label: 'GFS Mark-Up', requiredWhenActive: true },
    { id: 'creditUnionMarkup', label: 'Credit Union Mark-Up', requiredWhenActive: true }
  ]
};

function isLegacyProductName(name) {
  const trimmed = (name || '').toString().trim();
  return trimmed ? LEGACY_PRODUCT_NAMES.includes(trimmed) : false;
}

function mapToCurrentProductName(name) {
  const trimmed = (name || '').toString().trim();
  if (!trimmed) return '';
  if (LEGACY_CONSUMER_PRODUCTS.includes(trimmed)) return CONSUMER_PROTECTION_PRODUCT;
  if (LEGACY_MORTGAGE_PRODUCTS.includes(trimmed)) return MORTGAGE_PROTECTION_PRODUCT;
  return trimmed;
}

function mapCoverageKey(key) {
  if (!key) return key;
  if (LEGACY_CONSUMER_COVERAGE_KEYS.includes(key)) return CONSUMER_COVERAGE_KEY;
  if (LEGACY_MORTGAGE_COVERAGE_KEYS.includes(key)) return MORTGAGE_COVERAGE_KEY;
  return key;
}

function remapCoverageEntries(coverages = {}) {
  const remapped = {};
  Object.entries(coverages).forEach(([key, value]) => {
    if (key === 'legacy') {
      remapped[key] = value;
      return;
    }
    const mappedKey = mapCoverageKey(key);
    if (!mappedKey) return;
    const normalizedValue = value === 'yes' ? 'yes' : value === 'no' ? 'no' : value;
    if (normalizedValue !== 'yes' && normalizedValue !== 'no') {
      remapped[mappedKey] = normalizedValue;
      return;
    }
    const existing = remapped[mappedKey];
    if (existing === 'yes') return;
    if (normalizedValue === 'yes') {
      remapped[mappedKey] = 'yes';
    } else if (!existing) {
      remapped[mappedKey] = 'no';
    }
  });
  return remapped;
}

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
  if (!ENABLE_PRODUCT_PARAMETERS) return [];
  if (!definitions || !definitions.length) return [];
  return definitions.filter((definition) => {
    if (!definition.requiredWhenActive) return false;
    const rawValue = values?.[definition.id];
    return !rawValue || !rawValue.toString().trim();
  });
}

function getMissingRequiredParameters(record, productName) {
  if (!record || record.products?.[productName] !== 'on') return [];
  const definitions = PRODUCT_PARAMETER_DEFINITIONS[productName];
  if (!definitions || !definitions.length) return [];
  const values = record.parameters?.[productName] || {};
  return collectMissingRequiredParameters(definitions, values);
}

function productActivationIsValid(record, productName) {
  return getMissingRequiredParameters(record, productName).length === 0;
}

const MOB_RATE_ROWS = [
  { id: CONSUMER_COVERAGE_KEY, label: CONSUMER_PROTECTION_PRODUCT },
  { id: MORTGAGE_COVERAGE_KEY, label: MORTGAGE_PROTECTION_PRODUCT }
];

const MOB_COVERAGE_DEFINITIONS = [
  {
    key: CONSUMER_COVERAGE_KEY,
    label: CONSUMER_PROTECTION_PRODUCT,
    matches: [CONSUMER_PROTECTION_PRODUCT, ...LEGACY_CONSUMER_PRODUCTS]
  },
  {
    key: MORTGAGE_COVERAGE_KEY,
    label: MORTGAGE_PROTECTION_PRODUCT,
    matches: [MORTGAGE_PROTECTION_PRODUCT, ...LEGACY_MORTGAGE_PRODUCTS]
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

const DIRECT_AUTO_AVERAGE_TERM_MONTHS = 36;
const CREDIT_INSURANCE_RATE_PER_THOUSAND = 2;
const CREDIT_INSURANCE_PENETRATION = 0.3;
const CREDIT_INSURANCE_COMMISSION_SHARE = 0.15;
const CREDIT_INSURANCE_LOSS_RATIO = 0.2;
const CPI_DIRECT_POLICY_RATE = 0.02;
const CPI_INDIRECT_POLICY_RATE = 0.04;
const CPI_AVERAGE_POLICY_COST = 2500;
const CPI_COMMISSION_RATE = 0.1;
const FIDELITY_BOND_PREMIUM_PER_100M = 10000;
const FIDELITY_BOND_COMMISSION_RATE = 0.035;

let PROSPECT_REPORTS = [];
let PROSPECT_LOOKUP = {};
let PROSPECT_MONTHLY_TOTALS = new Map();
const prospectsDataUrl = document.body?.dataset?.prospectsDataUrl || 'prospects-data.json';
let prospectDataPromise = null;

const PROSPECT_PRODUCT_MODELS = [
  {
    id: 'credit-insurance-consumer',
    label: 'Credit Insurance/Debt Protection Monthly Remittance',
    type: 'consumer-mob',
    accountCodes: ['396', '385', '370', '703A', '397'],
    ratePerThousand: CREDIT_INSURANCE_RATE_PER_THOUSAND,
    penetration: CREDIT_INSURANCE_PENETRATION,
    commissionShare: CREDIT_INSURANCE_COMMISSION_SHARE,
    lossRatio: CREDIT_INSURANCE_LOSS_RATIO
  },
  {
    id: 'credit-insurance-mortgage',
    label: MORTGAGE_PROTECTION_PRODUCT,
    type: 'consumer-coverage',
    eligibleBalanceKeys: ['firstMortgage'],
    ratePerThousand: 4,
    penetration: 0.05,
    creditUnionShare: 0.95,
    gfsMarkupShare: 0.05,
    baseLabel: '1st lien mortgages'
  },
  {
    id: 'gap',
    label: 'GAP',
    type: 'direct-auto-ancillary',
    penetration: 0.3,
    gfsIncomePerUnit: 50,
    creditUnionIncomePerUnit: 0,
    baseLabel: 'direct auto loans',
    gfsMarkupLabel: 'markup commission'
  },
  {
    id: 'gap-underwriting',
    label: 'GAP Underwriting Profit',
    type: 'direct-auto-ancillary',
    penetration: 0.3,
    gfsIncomePerUnit: 25,
    creditUnionIncomePerUnit: 0,
    baseLabel: 'direct auto loans',
    gfsMarkupLabel: 'underwriting profit'
  },
  {
    id: 'vsc',
    label: 'Vehicle Service Contract',
    type: 'direct-auto-ancillary',
    penetration: 0.1,
    gfsIncomePerUnit: 400,
    creditUnionIncomePerUnit: 0,
    baseLabel: 'direct auto loans',
    gfsMarkupLabel: 'program margin'
  },
  {
    id: 'afg-balloon',
    label: 'AFG Balloon Loan Program',
    type: 'direct-auto-ancillary',
    penetration: 0.1,
    gfsIncomePerUnit: 50,
    creditUnionIncomePerUnit: 0,
    baseLabel: 'direct auto loans',
    gfsMarkupLabel: 'program fee'
  },
  {
    id: 'cpi',
    label: 'Collateral Protection Insurance',
    type: 'cpi',
    directPolicyRate: CPI_DIRECT_POLICY_RATE,
    indirectPolicyRate: CPI_INDIRECT_POLICY_RATE,
    policyCost: CPI_AVERAGE_POLICY_COST,
    commissionRate: CPI_COMMISSION_RATE,
    disclaimer: '(Expect 50% refunds)',
    gfsMarkupLabel: 'commission'
  },
  {
    id: 'fidelity-bond',
    label: 'Fidelity Bond Commission',
    type: 'fidelity-bond',
    gfsMarkupLabel: 'agency commission'
  }
];

const PRODUCT_MODEL_LOOKUP = Object.fromEntries(
  PROSPECT_PRODUCT_MODELS.map((model) => [model.id, model])
);

const PRODUCT_NAME_TO_MODEL_ID = {
  [CONSUMER_PROTECTION_PRODUCT]: ['credit-insurance-consumer'],
  [MORTGAGE_PROTECTION_PRODUCT]: ['credit-insurance-mortgage'],
  GAP: ['gap', 'gap-underwriting'],
  VSC: ['vsc'],
  'Collateral Protection Insurance (CPI)': ['cpi'],
  'Fidelity Bond': ['fidelity-bond'],
  'AFG Balloon Loans': ['afg-balloon'],
  ...Object.fromEntries(LEGACY_CONSUMER_PRODUCTS.map((name) => [name, ['credit-insurance-consumer']])),
  ...Object.fromEntries(LEGACY_MORTGAGE_PRODUCTS.map((name) => [name, ['credit-insurance-mortgage']]))
};

const PRODUCT_STATUS_SEQUENCE = ['on', 'tbd', 'off'];

const PRODUCT_STATUS_LABELS = {
  on: 'On',
  tbd: 'TBD',
  off: 'Off'
};

const DEFAULT_PRODUCT_STATUS = 'tbd';

const ENABLE_PRODUCT_PARAMETERS = false;

const PROSPECT_PRODUCT_FOOTNOTE =
  'Credit insurance remits $2.00 per $1,000 at 30% coverage across call report accounts 396, 385, 370, 703A, and 397. GFS income combines a 15% up-front commission with underwriting profit on the remaining $1.70 after a 20% loss ratio. Direct auto production divides (new + used − indirect) loan counts by 36 months; VSC assumes 10% attach @ $400 GFS, GAP 30% @ $50 commission plus $25 underwriting profit, and AFG balloons 10% attach @ $50. CPI forecasts 2% of direct and 4% of indirect vehicles force-placed monthly at a $2,500 average premium with a 10% GFS commission (Expect 50% refunds). Fidelity bond income uses a $10,000 premium per $100M of assets with a 3.5% agency share.';

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

  const statusPriority = ['on', 'off', 'tbd'];
  const mergeStatus = (current, incoming) => {
    if (!incoming) return current || '';
    if (!current) return incoming;
    const currentIndex = statusPriority.indexOf(current);
    const incomingIndex = statusPriority.indexOf(incoming);
    if (incomingIndex === -1) return current;
    if (currentIndex === -1 || incomingIndex < currentIndex) return incoming;
    return current;
  };

  const aggregateLegacyStatus = (names) => {
    const statuses = names
      .filter((name) => Object.prototype.hasOwnProperty.call(sourceProducts, name))
      .map((name) => sanitizeProductValue(sourceProducts[name]));
    if (!statuses.length) return '';
    return statuses.reduce((result, status) => mergeStatus(result, status), '');
  };

  DEFAULT_PRODUCTS.forEach((product) => {
    normalizedProducts[product] = sanitizeProductValue(sourceProducts[product]);
  });

  const legacyConsumerStatus = aggregateLegacyStatus(LEGACY_CONSUMER_PRODUCTS);
  if (legacyConsumerStatus) {
    normalizedProducts[CONSUMER_PROTECTION_PRODUCT] = mergeStatus(
      normalizedProducts[CONSUMER_PROTECTION_PRODUCT],
      legacyConsumerStatus
    );
  }

  const legacyMortgageStatus = aggregateLegacyStatus(LEGACY_MORTGAGE_PRODUCTS);
  if (legacyMortgageStatus) {
    normalizedProducts[MORTGAGE_PROTECTION_PRODUCT] = mergeStatus(
      normalizedProducts[MORTGAGE_PROTECTION_PRODUCT],
      legacyMortgageStatus
    );
  }

  const customNames = new Set();
  const sourceCustom = Array.isArray(record?.customProducts) ? record.customProducts : [];
  sourceCustom.forEach((name) => {
    const trimmed = (name || '').toString().trim();
    if (trimmed && !DEFAULT_PRODUCTS.includes(trimmed) && !isLegacyProductName(trimmed)) {
      customNames.add(trimmed);
    }
  });
  Object.keys(sourceProducts || {}).forEach((name) => {
    const trimmed = (name || '').toString().trim();
    if (trimmed && !DEFAULT_PRODUCTS.includes(trimmed) && !isLegacyProductName(trimmed)) {
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
    const targetName = mapToCurrentProductName(name) || name;
    if (isLegacyProductName(targetName)) return;
    const sanitized = sanitizeProductParameters(targetName, sourceParameters[name] || sourceParameters[targetName]);
    if (Object.keys(sanitized).length) {
      normalizedParameters[targetName] = sanitized;
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
  const normalized = (value ?? '').toString().trim().toLowerCase();
  if (!normalized) return DEFAULT_PRODUCT_STATUS;
  if (normalized === 'yes') return 'on';
  if (normalized === 'no') return 'off';
  if (normalized === 'pending') return 'tbd';
  if (PRODUCT_STATUS_SEQUENCE.includes(normalized)) return normalized;
  if (normalized === 'true') return 'on';
  if (normalized === 'false') return 'off';
  return DEFAULT_PRODUCT_STATUS;
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
    PROSPECT_MONTHLY_TOTALS = new Map();
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
      PROSPECT_MONTHLY_TOTALS = new Map();
      return reports;
    })
    .catch((error) => {
      console.error('Unable to load prospect data', error);
      PROSPECT_REPORTS = [];
      PROSPECT_LOOKUP = {};
      PROSPECT_MONTHLY_TOTALS = new Map();
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
  const sourceProducts = Array.isArray(account.products) ? account.products : [];
  const mappedProducts = Array.from(
    new Set(
      sourceProducts
        .map((name) => mapToCurrentProductName(name))
        .filter((name) => name && !isLegacyProductName(name))
    )
  );

  const sourceCustomProducts = Array.isArray(account.customProducts) ? account.customProducts : [];
  const mappedCustomProducts = sourceCustomProducts
    .map((name) => {
      const trimmed = (name || '').toString().trim();
      const mapped = mapToCurrentProductName(trimmed);
      return mapped !== trimmed ? '' : trimmed;
    })
    .filter((name) => name && !isLegacyProductName(name));

  const normalized = {
    id: account.id || generateId('acct'),
    name: account.name || 'Untitled account',
    core: account.core || 'Other',
    products: mappedProducts,
    customProducts: mappedCustomProducts,
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

  const remappedCoverages = remapCoverageEntries(normalizedCoverages);

  return {
    id: loan.id || generateId('loan'),
    borrower: (loan.borrower || '').toString(),
    loanNumber: (loan.loanNumber || '').toString(),
    amount: Number(loan.amount) || 0,
    loanOfficer: (loan.loanOfficer || '').toString(),
    originationDate: (loan.originationDate || '').toString(),
    notes: (loan.notes || '').toString(),
    coverages: remappedCoverages,
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
  const productsSummary = document.getElementById('account-products-summary');
  const summaryValues = {
    on: productsSummary?.querySelector('[data-summary-value="on"]') || null,
    tbd: productsSummary?.querySelector('[data-summary-value="tbd"]') || null,
    off: productsSummary?.querySelector('[data-summary-value="off"]') || null
  };
  const addForm = document.getElementById('account-products-add-form');
  const addInput = document.getElementById('account-products-add-input');
  const addButton = addForm?.querySelector('button[type="submit"]');

  if (!accountSelector) return;

  let currentAccount = null;
  let currentOpportunityMap = null;

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
    renderProducts(currentAccount, updated, { opportunityMap: currentOpportunityMap });
    renderProductsUpdated(updated);
  });

  function renderAccount(id) {
    const account = appState.accounts.find((item) => item.id === id) || null;
    currentAccount = account;
    currentOpportunityMap = null;

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
    if (account.latestReport) {
      const metrics = computeProspectMetrics(account.latestReport);
      currentOpportunityMap = buildOpportunityMap(account.latestReport, metrics);
    }
    const record = appState.accountProducts[account.id] || normalizeAccountProductRecord({}, account);
    renderProducts(account, record, { opportunityMap: currentOpportunityMap });
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

  function renderProducts(account, record, { opportunityMap } = {}) {
    if (!productsContainer || !productsEmpty) return;
    productsContainer.innerHTML = '';

    if (!account || !record) {
      productsContainer.hidden = true;
      productsEmpty.hidden = false;
      productsEmpty.textContent = 'Select an account to manage product status.';
      renderProductSummary(null);
      return;
    }

    const names = getAccountProductNames(record);
    if (!names.length) {
      productsContainer.hidden = true;
      productsEmpty.hidden = false;
      productsEmpty.textContent = 'No products configured for this account yet.';
      renderProductSummary(null);
      return;
    }

    const table = document.createElement('table');
    table.className = 'coverage-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['Product', 'Monthly revenue', 'Status', 'Manage'].forEach((label) => {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = label;
      headerRow.append(th);
    });
    thead.append(headerRow);
    table.append(thead);

    const tbody = document.createElement('tbody');
    const totals = { on: 0, tbd: 0, off: 0 };

    names.forEach((name) => {
      const row = document.createElement('tr');
      row.className = 'coverage-table__row';
      row.dataset.productName = name;

      const nameCell = document.createElement('th');
      nameCell.scope = 'row';
      nameCell.textContent = name;
      row.append(nameCell);

      const revenueCell = document.createElement('td');
      revenueCell.className = 'coverage-table__potential';
      const rawPotential = Number(getProductMonthlyPotential(name, opportunityMap) || 0);
      const monthlyPotential = Number.isFinite(rawPotential) ? Math.max(rawPotential, 0) : 0;
      if (monthlyPotential > 0) {
        revenueCell.textContent = `${formatProspectCurrency(monthlyPotential)} / mo`;
      } else {
        revenueCell.textContent = '—';
      }
      row.append(revenueCell);

      const statusCell = document.createElement('td');
      statusCell.className = 'coverage-table__status';

      const statusGroup = document.createElement('div');
      statusGroup.className = 'status-toggle';
      statusGroup.setAttribute('role', 'radiogroup');
      statusGroup.setAttribute('aria-label', `${name} status`);

      const currentValue = sanitizeProductValue(record.products[name] || DEFAULT_PRODUCT_STATUS);
      const totalsKey = currentValue === 'on' ? 'on' : currentValue === 'off' ? 'off' : 'tbd';
      totals[totalsKey] += monthlyPotential;

      const setStatus = (nextStatus) => {
        const normalizedStatus = sanitizeProductValue(nextStatus);
        if (currentValue === normalizedStatus) return;
        const updated = updateAccountProductRecord(account, (draft) => {
          draft.products[name] = normalizedStatus;
          if (!DEFAULT_PRODUCTS.includes(name) && !draft.customProducts.includes(name)) {
            draft.customProducts.push(name);
            draft.customProducts.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
          }
          return draft;
        });
        renderProducts(account, updated, { opportunityMap });
        renderProductsUpdated(updated);
        window.requestAnimationFrame?.(() => {
          if (!productsContainer) return;
          const nextRow = Array.from(productsContainer.querySelectorAll('.coverage-table__row')).find(
            (node) => node instanceof HTMLElement && node.dataset.productName === name
          );
          const nextButton = nextRow?.querySelector(`.status-toggle__light--${normalizedStatus}`);
          if (nextButton instanceof HTMLElement) {
            nextButton.focus();
          }
        });
      };

      PRODUCT_STATUS_SEQUENCE.forEach((statusValue) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `status-toggle__light status-toggle__light--${statusValue}`;
        button.setAttribute('role', 'radio');
        const isActive = currentValue === statusValue;
        if (isActive) {
          button.classList.add('status-toggle__light--active');
        }
        button.setAttribute('aria-checked', isActive ? 'true' : 'false');
        button.setAttribute('aria-label', `${PRODUCT_STATUS_LABELS[statusValue]} — ${name}`);
        button.title = PRODUCT_STATUS_LABELS[statusValue];
        button.tabIndex = isActive ? 0 : -1;
        button.addEventListener('click', () => {
          setStatus(statusValue);
        });
        statusGroup.append(button);
      });

      statusGroup.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        const currentIndex = PRODUCT_STATUS_SEQUENCE.indexOf(currentValue);
        if (currentIndex === -1) return;
        let nextIndex = currentIndex;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextIndex = (currentIndex - 1 + PRODUCT_STATUS_SEQUENCE.length) % PRODUCT_STATUS_SEQUENCE.length;
        } else {
          nextIndex = (currentIndex + 1) % PRODUCT_STATUS_SEQUENCE.length;
        }
        const nextStatus = PRODUCT_STATUS_SEQUENCE[nextIndex];
        setStatus(nextStatus);
      });

      const statusLabel = document.createElement('span');
      statusLabel.className = 'status-toggle__label';
      statusLabel.textContent =
        PRODUCT_STATUS_LABELS[currentValue] || PRODUCT_STATUS_LABELS[DEFAULT_PRODUCT_STATUS];
      statusGroup.append(statusLabel);

      statusCell.append(statusGroup);
      row.append(statusCell);

      const actionsCell = document.createElement('td');
      actionsCell.className = 'coverage-table__actions';
      if (!DEFAULT_PRODUCTS.includes(name)) {
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'coverage-table__remove';
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
          renderProducts(account, updated, { opportunityMap });
          renderProductsUpdated(updated);
        });
        actionsCell.append(removeBtn);
      }
      row.append(actionsCell);

      tbody.append(row);
    });

    table.append(tbody);
    productsContainer.append(table);
    productsContainer.hidden = false;
    productsEmpty.hidden = true;
    renderProductSummary(totals);
  }

  function renderProductSummary(totals) {
    if (!productsSummary) return;
    if (!totals) {
      productsSummary.hidden = true;
      return;
    }
    ['on', 'tbd', 'off'].forEach((status) => {
      const valueEl = summaryValues[status];
      if (!valueEl) return;
      const amount = Number(totals[status] || 0);
      const normalized = Number.isFinite(amount) ? Math.max(amount, 0) : 0;
      valueEl.textContent = `${formatProspectCurrency(normalized)} / mo`;
    });
    productsSummary.hidden = false;
  }

  function getProductMonthlyPotential(name, opportunityMap) {
    if (!opportunityMap || !(opportunityMap instanceof Map)) return 0;
    const modelIds = PRODUCT_NAME_TO_MODEL_ID[name];
    if (!modelIds) return 0;
    const ids = Array.isArray(modelIds) ? modelIds : [modelIds];
    return ids.reduce((sum, id) => {
      const opportunity = opportunityMap.get(id);
      return sum + Number(opportunity?.grossMonthly || 0);
    }, 0);
  }

  function renderProductsUpdated(record) {
    if (!productsUpdated) return;
    if (!record || !record.updatedAt) {
      productsUpdated.textContent = 'Select an account to manage product status.';
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
  const leaderboardGrid = document.getElementById('leaderboard-grid');
  const leaderboardEmpty = document.getElementById('leaderboard-empty');
  const directLeaderboardBody = document.querySelector('#leaderboard-direct-auto tbody');
  const consumerLeaderboardBody = document.querySelector('#leaderboard-consumer-spending tbody');

  if (!tableBody) return;

  prepareAccountData().then((accounts) => {
    renderCoverageTable(accounts);
    renderLeaderboards(accounts);
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

      const nameCell = document.createElement('td');
      const accountName = account.name || 'Unnamed credit union';
      if (account.latestReport) {
        const link = document.createElement('a');
        link.href = `prospects/${account.latestReport.id}.html`;
        link.className = 'data-table__link';
        link.textContent = accountName;
        nameCell.append(link);
      } else {
        nameCell.textContent = accountName;
      }
      row.append(nameCell);

      const charterCell = document.createElement('td');
      charterCell.textContent = account.charter || '—';
      row.append(charterCell);

      const onCell = document.createElement('td');
      onCell.textContent = counts.on.toString();
      row.append(onCell);

      const tbdCell = document.createElement('td');
      tbdCell.textContent = counts.tbd.toString();
      row.append(tbdCell);

      const offCell = document.createElement('td');
      offCell.textContent = counts.off.toString();
      row.append(offCell);

      const updatedCell = document.createElement('td');
      updatedCell.textContent = record.updatedAt ? formatDateTime(record.updatedAt) : 'Not set';
      row.append(updatedCell);

      const reportCell = document.createElement('td');
      reportCell.textContent = account.latestAsOf || '—';
      if (account.latestReport?.callReportUrl) {
        const linkGroup = document.createElement('div');
        linkGroup.className = 'account-hub__report-links';

        const pdfLink = document.createElement('a');
        pdfLink.href = account.latestReport.callReportUrl;
        pdfLink.target = '_blank';
        pdfLink.rel = 'noopener';
        pdfLink.className = 'account-hub__report-link';
        pdfLink.textContent = 'Call report PDF';
        linkGroup.append(pdfLink);

        reportCell.append(linkGroup);
      }
      row.append(reportCell);

      tableBody.append(row);
    });
  }

  function renderLeaderboards(accounts) {
    if (!leaderboardGrid || !leaderboardEmpty || !directLeaderboardBody || !consumerLeaderboardBody) {
      return;
    }

    directLeaderboardBody.innerHTML = '';
    consumerLeaderboardBody.innerHTML = '';

    const entries = accounts
      .map((account) => {
        const report = account.latestReport;
        if (!report) return null;
        const metrics = computeProspectMetrics(report);
        const autoStats = calculateDirectAutoStats(report);
        return { account, report, metrics, autoStats };
      })
      .filter(Boolean);

    if (!entries.length) {
      leaderboardGrid.hidden = true;
      leaderboardEmpty.hidden = false;
      return;
    }

    const hasDirectLeaders = renderDirectLeaderboard(entries);
    const hasConsumerLeaders = renderConsumerLeaderboard(entries);

    const hasAnyLeaders = hasDirectLeaders || hasConsumerLeaders;
    leaderboardGrid.hidden = !hasAnyLeaders;
    leaderboardEmpty.hidden = hasAnyLeaders;
  }

  function renderDirectLeaderboard(entries) {
    const leaders = entries
      .filter((entry) => entry.autoStats.directBalance > 0 || entry.autoStats.directCount > 0)
      .sort((a, b) => b.autoStats.directBalance - a.autoStats.directBalance)
      .slice(0, 5);

    directLeaderboardBody.innerHTML = '';

    if (!leaders.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'No direct auto activity recorded yet.';
      row.append(cell);
      directLeaderboardBody.append(row);
      return false;
    }

    leaders.forEach((entry, index) => {
      const row = document.createElement('tr');

      const rankCell = document.createElement('td');
      rankCell.textContent = String(index + 1);
      row.append(rankCell);

      const accountCell = document.createElement('th');
      accountCell.scope = 'row';
      const link = document.createElement('a');
      link.className = 'data-table__link';
      link.textContent = entry.account.name || entry.account.id;
      if (entry.report?.id) {
        link.href = `prospects/${entry.report.id}.html`;
      } else {
        link.href = '#';
        link.addEventListener('click', (event) => event.preventDefault());
      }
      accountCell.append(link);
      row.append(accountCell);

      const balanceCell = document.createElement('td');
      balanceCell.textContent = formatProspectCurrency(entry.autoStats.directBalance);
      row.append(balanceCell);

      const monthlyCell = document.createElement('td');
      const monthly = entry.autoStats.monthlyDirectCount;
      monthlyCell.textContent = monthly > 0 ? `${formatNumber(monthly, { decimals: 1 })} loans / mo` : '—';
      row.append(monthlyCell);

      directLeaderboardBody.append(row);
    });

    return true;
  }

  function renderConsumerLeaderboard(entries) {
    const leaders = entries
      .filter((entry) => entry.metrics.installmentBalance > 0)
      .sort((a, b) => b.metrics.installmentBalance - a.metrics.installmentBalance)
      .slice(0, 5);

    consumerLeaderboardBody.innerHTML = '';

    if (!leaders.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 4;
      cell.textContent = 'No consumer installment balances reported yet.';
      row.append(cell);
      consumerLeaderboardBody.append(row);
      return false;
    }

    leaders.forEach((entry, index) => {
      const row = document.createElement('tr');

      const rankCell = document.createElement('td');
      rankCell.textContent = String(index + 1);
      row.append(rankCell);

      const accountCell = document.createElement('th');
      accountCell.scope = 'row';
      const link = document.createElement('a');
      link.className = 'data-table__link';
      link.textContent = entry.account.name || entry.account.id;
      if (entry.report?.id) {
        link.href = `prospects/${entry.report.id}.html`;
      } else {
        link.href = '#';
        link.addEventListener('click', (event) => event.preventDefault());
      }
      accountCell.append(link);
      row.append(accountCell);

      const balanceCell = document.createElement('td');
      balanceCell.textContent = formatProspectCurrency(entry.metrics.installmentBalance);
      row.append(balanceCell);

      const shareCell = document.createElement('td');
      const share = entry.metrics.consumerShare;
      shareCell.textContent = share > 0 ? formatPercent(share, { decimals: 1 }) : '—';
      row.append(shareCell);

      consumerLeaderboardBody.append(row);
    });

    return true;
  }

  function summarizeProductStatuses(record) {
    const names = getAccountProductNames(record);
    let onCount = 0;
    let offCount = 0;
    let tbdCount = 0;
    names.forEach((name) => {
      const value = record.products?.[name] || DEFAULT_PRODUCT_STATUS;
      if (value === 'on') {
        onCount += 1;
      } else if (value === 'off') {
        offCount += 1;
      } else {
        tbdCount += 1;
      }
    });
    return { on: onCount, off: offCount, tbd: tbdCount };
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
      option.textContent = report.name || report.id;
      prospectSelector.append(option);
      if (logSelector) {
        logSelector.append(option.cloneNode(true));
      }
    });

    renderProspectDirectory(reports);

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

function getMonthlyRevenueTotal(report, metrics) {
  if (!report) return 0;
  if (report.id && PROSPECT_MONTHLY_TOTALS.has(report.id)) {
    return Number(PROSPECT_MONTHLY_TOTALS.get(report.id) || 0);
  }
  const opportunityMap = buildOpportunityMap(report, metrics);
  const total = Array.from(opportunityMap.values()).reduce(
    (sum, opportunity) => sum + Number(opportunity?.grossMonthly || 0),
    0
  );
  if (report.id) {
    PROSPECT_MONTHLY_TOTALS.set(report.id, total);
  }
  return total;
}

function renderProspectDirectory(reports) {
  const table = document.getElementById('prospect-directory-table');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (!reports || !reports.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.textContent = 'Upload call reports to populate the prospect list.';
    row.append(cell);
    tbody.append(row);
    return;
  }

  reports.forEach((report) => {
    const metrics = computeProspectMetrics(report);
    const monthlyTotal = getMonthlyRevenueTotal(report, metrics);

    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const nameLink = document.createElement('a');
    nameLink.href = `prospects/${report.id}.html`;
    nameLink.className = 'data-table__link';
    nameLink.textContent = report.name || report.id;
    nameCell.append(nameLink);
    row.append(nameCell);

    const asOfCell = document.createElement('td');
    asOfCell.textContent = report.asOf || '—';
    row.append(asOfCell);

    const revenueCell = document.createElement('td');
    if (monthlyTotal > 0) {
      revenueCell.textContent = `${formatProspectCurrency(monthlyTotal)} / mo`;
    } else {
      revenueCell.textContent = '—';
    }
    row.append(revenueCell);

    tbody.append(row);
  });
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
  const monthlyTotal = getMonthlyRevenueTotal(report, metrics);
  setText('prospect-title', report.name || 'Prospect intelligence');
  const subtitle = document.getElementById('prospect-subtitle');
  if (subtitle) {
    const summary = report.name
      ? `Call report intelligence and protection modeling for ${report.name}.`
      : 'Load a 5300 call report to review consumer lending exposure and production potential.';
    if (monthlyTotal > 0) {
      subtitle.textContent = `${summary} Estimated monthly revenue potential ${formatProspectCurrency(monthlyTotal)} / mo.`;
    } else {
      subtitle.textContent = summary;
    }
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
    appendTableCell(row, formatGfsShare(opportunity));
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

function calculateDirectAutoStats(report) {
  const newLoans = report.loanMix?.newVehicle || {};
  const usedLoans = report.loanMix?.usedVehicle || {};
  const indirectAuto = report.indirect?.auto || {};

  const totalVehicleCount = (newLoans.count || 0) + (usedLoans.count || 0);
  const totalVehicleBalance = (newLoans.balance || 0) + (usedLoans.balance || 0);
  const indirectCount = indirectAuto.count || 0;
  const indirectBalance = indirectAuto.balance || 0;

  let directNewCount = newLoans.count || 0;
  let directUsedCount = usedLoans.count || 0;

  if (totalVehicleCount > 0 && indirectCount > 0) {
    const newCountShare = (newLoans.count || 0) / totalVehicleCount;
    const usedCountShare = (usedLoans.count || 0) / totalVehicleCount;
    directNewCount = Math.max(directNewCount - indirectCount * newCountShare, 0);
    directUsedCount = Math.max(directUsedCount - indirectCount * usedCountShare, 0);
  }

  const directCount = Math.max(directNewCount + directUsedCount, 0);

  let directNewBalance = newLoans.balance || 0;
  let directUsedBalance = usedLoans.balance || 0;

  if (totalVehicleBalance > 0 && indirectBalance > 0) {
    const newBalanceShare = (newLoans.balance || 0) / totalVehicleBalance;
    const usedBalanceShare = (usedLoans.balance || 0) / totalVehicleBalance;
    directNewBalance = Math.max(directNewBalance - indirectBalance * newBalanceShare, 0);
    directUsedBalance = Math.max(directUsedBalance - indirectBalance * usedBalanceShare, 0);
  }

  const directBalance = Math.max(directNewBalance + directUsedBalance, 0);

  const monthlyDirectCount = DIRECT_AUTO_AVERAGE_TERM_MONTHS
    ? directCount / DIRECT_AUTO_AVERAGE_TERM_MONTHS
    : 0;
  const monthlyDirectNewCount = DIRECT_AUTO_AVERAGE_TERM_MONTHS
    ? directNewCount / DIRECT_AUTO_AVERAGE_TERM_MONTHS
    : 0;
  const monthlyDirectUsedCount = DIRECT_AUTO_AVERAGE_TERM_MONTHS
    ? directUsedCount / DIRECT_AUTO_AVERAGE_TERM_MONTHS
    : 0;
  const monthlyIndirectCount = DIRECT_AUTO_AVERAGE_TERM_MONTHS
    ? (indirectCount || 0) / DIRECT_AUTO_AVERAGE_TERM_MONTHS
    : 0;

  return {
    directCount,
    directNewCount,
    directUsedCount,
    directBalance,
    directNewBalance,
    directUsedBalance,
    indirectCount,
    indirectBalance,
    monthlyDirectCount,
    monthlyDirectNewCount,
    monthlyDirectUsedCount,
    monthlyIndirectCount
  };
}

function getCreditInsuranceAccountBalance(report, accountCode) {
  switch (accountCode) {
    case '396':
      return report.loanMix?.creditCard?.balance || 0;
    case '385':
      return report.loanMix?.otherUnsecured?.balance || 0;
    case '370':
      return report.loanMix?.newVehicle?.balance || 0;
    case '397':
      return report.loanMix?.usedVehicle?.balance || 0;
    case '703A':
      return report.indirect?.auto?.balance || 0;
    default:
      return 0;
  }
}

function calculateProductOpportunity(report, metrics, model) {
  if (model.type === 'consumer-mob') {
    const ratePerThousand = Number(model.ratePerThousand) || 0;
    const penetration =
      typeof model.penetration === 'number' ? model.penetration : CREDIT_INSURANCE_PENETRATION;
    const commissionShare =
      typeof model.commissionShare === 'number'
        ? model.commissionShare
        : CREDIT_INSURANCE_COMMISSION_SHARE;
    const underwritingShare = Math.max(1 - commissionShare, 0);
    const lossRatio = Number.isFinite(Number(model.lossRatio))
      ? Number(model.lossRatio)
      : CREDIT_INSURANCE_LOSS_RATIO;

    const accountCodes = Array.isArray(model.accountCodes) && model.accountCodes.length
      ? model.accountCodes
      : ['396', '385', '370', '703A', '397'];

    const totalBalance = accountCodes.reduce(
      (sum, code) => sum + (getCreditInsuranceAccountBalance(report, code) || 0),
      0
    );

    const coveredBalance = totalBalance * penetration;
    const monthlyRemittance = (totalBalance / 1000) * ratePerThousand * penetration;
    const commissionMonthly = monthlyRemittance * commissionShare;
    const underwritingPremiumMonthly = monthlyRemittance * underwritingShare;
    const underwritingProfitMonthly = underwritingPremiumMonthly * (1 - lossRatio);
    const gfsMonthly = commissionMonthly + underwritingProfitMonthly;

    return {
      baseDisplay: `${formatProspectCurrency(monthlyRemittance)} Monthly Remittance`,
      grossMonthly: monthlyRemittance,
      grossAnnual: monthlyRemittance * 12,
      gfsMonthly,
      gfsAnnual: gfsMonthly * 12,
      gfsMarkupAnnual: commissionMonthly * 12,
      gfsUnderwritingAnnual: underwritingProfitMonthly * 12,
      gfsMarkupLabel: 'up-front commission',
      gfsUnderwritingLabel: 'underwriting profit',
      creditUnionMonthly: 0,
      creditUnionAnnual: 0,
      eligibleBalance: coveredBalance,
      annualEligible: null,
      unitsSold: null
    };
  }

  if (model.type === 'consumer-coverage') {
    const resolvedMetrics = metrics || computeProspectMetrics(report);
    let eligibleBalance = 0;
    if (Array.isArray(model.eligibleBalanceKeys) && model.eligibleBalanceKeys.length) {
      eligibleBalance = sumBalances(report, model.eligibleBalanceKeys);
    } else if (model.balanceMetric && resolvedMetrics && typeof resolvedMetrics[model.balanceMetric] === 'number') {
      eligibleBalance = Number(resolvedMetrics[model.balanceMetric]) || 0;
    } else {
      eligibleBalance = resolvedMetrics?.installmentBalance || 0;
    }
    const ratePerThousand = Number(model.ratePerThousand) || 0;
    const penetration = Number(model.penetration) || 0;
    const creditUnionShare =
      typeof model.creditUnionShare === 'number' ? model.creditUnionShare : 0;
    const gfsMarkupShare =
      typeof model.gfsMarkupShare === 'number'
        ? model.gfsMarkupShare
        : typeof model.gfsShare === 'number'
          ? model.gfsShare
          : 0;
    const gfsUnderwritingShare =
      typeof model.gfsUnderwritingShare === 'number' ? model.gfsUnderwritingShare : 0;
    const grossShare =
      typeof model.grossShare === 'number'
        ? model.grossShare
        : creditUnionShare + gfsMarkupShare + gfsUnderwritingShare || 1;

    const monthlyFullCoverage = (eligibleBalance / 1000) * ratePerThousand;
    const monthlyModeled = monthlyFullCoverage * penetration;
    const creditUnionMonthly = monthlyModeled * creditUnionShare;
    const gfsMonthlyMarkup = monthlyModeled * gfsMarkupShare;
    const gfsMonthlyUnderwriting = monthlyModeled * gfsUnderwritingShare;
    const gfsMonthly = gfsMonthlyMarkup + gfsMonthlyUnderwriting;
    const grossMonthly = monthlyModeled * grossShare;

    const baseLabel = model.baseLabel || 'consumer loans';

    return {
      baseDisplay: `${formatProspectCurrency(eligibleBalance)} ${baseLabel}`,
      grossMonthly,
      grossAnnual: grossMonthly * 12,
      gfsMonthly,
      gfsAnnual: gfsMonthly * 12,
      gfsMarkupAnnual: gfsMonthlyMarkup * 12,
      gfsUnderwritingAnnual: gfsMonthlyUnderwriting * 12,
      creditUnionMonthly,
      creditUnionAnnual: creditUnionMonthly * 12,
      eligibleBalance,
      annualEligible: null,
      unitsSold: null
    };
  }

  if (model.type === 'direct-auto-ancillary') {
    const directStats = calculateDirectAutoStats(report);
    const averageTermMonths = Number(model.averageTermMonths) || DIRECT_AUTO_AVERAGE_TERM_MONTHS;
    const penetration = Number(model.penetration) || 0;
    const monthlyEligible = averageTermMonths > 0 ? directStats.directCount / averageTermMonths : 0;
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

    const baseLabel = model.baseLabel || 'loans';

    return {
      baseDisplay: `${formatNumber(Math.round(annualEligible))} ${baseLabel} / yr`,
      grossMonthly: monthlyUnitsSold * retailPerUnit,
      grossAnnual,
      gfsMonthly: monthlyUnitsSold * gfsIncomePerUnit,
      gfsAnnual,
      gfsMarkupAnnual: gfsAnnual,
      gfsMarkupLabel: model.gfsMarkupLabel || '',
      gfsUnderwritingAnnual: 0,
      creditUnionMonthly: monthlyUnitsSold * creditUnionIncomePerUnit,
      creditUnionAnnual,
      eligibleBalance: null,
      annualEligible,
      unitsSold
    };
  }

  if (model.type === 'cpi') {
    const directStats = calculateDirectAutoStats(report);
    const directPolicyRate = Number(model.directPolicyRate) || 0;
    const indirectPolicyRate = Number(model.indirectPolicyRate) || 0;
    const policyCost = Number(model.policyCost) || CPI_AVERAGE_POLICY_COST;
    const commissionRate = Number(model.commissionRate) || CPI_COMMISSION_RATE;

    const monthlyDirectPolicies = directStats.monthlyDirectCount * directPolicyRate;
    const monthlyIndirectPolicies = directStats.monthlyIndirectCount * indirectPolicyRate;
    const monthlyPolicies = monthlyDirectPolicies + monthlyIndirectPolicies;
    const monthlyPremium = monthlyPolicies * policyCost;
    const gfsMonthly = monthlyPremium * commissionRate;
    const gfsAnnual = gfsMonthly * 12;

    return {
      baseDisplay: `${formatNumber(Math.round(monthlyPolicies * 12))} policies / yr @ ${formatProspectCurrency(
        policyCost
      )}`,
      grossMonthly: gfsMonthly,
      grossAnnual: gfsAnnual,
      gfsMonthly,
      gfsAnnual,
      gfsMarkupAnnual: gfsAnnual,
      gfsMarkupLabel: model.gfsMarkupLabel || 'commission',
      gfsUnderwritingAnnual: 0,
      creditUnionMonthly: 0,
      creditUnionAnnual: 0,
      eligibleBalance: null,
      annualEligible: monthlyPolicies * 12,
      unitsSold: monthlyPolicies * 12,
      disclaimer: model.disclaimer || ''
    };
  }

  if (model.type === 'fidelity-bond') {
    const totalAssets = Number(report.totalAssets) || 0;
    const annualPremium = (totalAssets / 100000000) * FIDELITY_BOND_PREMIUM_PER_100M;
    const gfsAnnual = annualPremium * FIDELITY_BOND_COMMISSION_RATE;
    const gfsMonthly = gfsAnnual / 12;

    return {
      baseDisplay: `${formatProspectCurrency(totalAssets)} total assets`,
      grossMonthly: gfsMonthly,
      grossAnnual: gfsAnnual,
      gfsMonthly,
      gfsAnnual,
      gfsMarkupAnnual: gfsAnnual,
      gfsMarkupLabel: model.gfsMarkupLabel || 'commission',
      gfsUnderwritingAnnual: 0,
      creditUnionMonthly: 0,
      creditUnionAnnual: 0,
      eligibleBalance: totalAssets,
      annualEligible: null,
      unitsSold: null
    };
  }

  if (model.type === 'mob') {
    const eligibleBalance = sumBalances(report, model.eligibleBalanceKeys || []);
    const gfsMarkupRate = model.rates?.gfsMarkup || 0;
    const gfsUnderwritingRate = model.rates?.gfsUnderwriting || 0;
    const creditUnionRate = model.rates?.creditUnionMarkup || 0;
    const totalRate =
      (model.rates?.clp || 0) + gfsMarkupRate + gfsUnderwritingRate + creditUnionRate;
    const grossAnnual = eligibleBalance * model.penetration * (totalRate / 100) * 12;
    const gfsMarkupAnnual = eligibleBalance * model.penetration * (gfsMarkupRate / 100) * 12;
    const gfsUnderwritingAnnual = eligibleBalance * model.penetration * (gfsUnderwritingRate / 100) * 12;
    const gfsAnnual = gfsMarkupAnnual + gfsUnderwritingAnnual;
    const creditUnionAnnual = eligibleBalance * model.penetration * (creditUnionRate / 100) * 12;
    return {
      baseDisplay: `${formatProspectCurrency(eligibleBalance)} outstanding`,
      grossMonthly: grossAnnual / 12,
      grossAnnual,
      gfsMonthly: gfsAnnual / 12,
      gfsAnnual,
      gfsMarkupAnnual,
      gfsUnderwritingAnnual,
      creditUnionMonthly: creditUnionAnnual / 12,
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
    grossMonthly: grossAnnual / 12,
    grossAnnual,
    gfsMonthly: gfsAnnual / 12,
    gfsAnnual,
    gfsMarkupAnnual: gfsAnnual,
    gfsUnderwritingAnnual: 0,
    creditUnionMonthly: creditUnionAnnual / 12,
    creditUnionAnnual,
    eligibleBalance: null,
    annualEligible,
    unitsSold
  };
}

function buildOpportunityMap(report, metrics) {
  const opportunityMap = new Map();
  if (!report) return opportunityMap;
  const resolvedMetrics = metrics || computeProspectMetrics(report);
  PROSPECT_PRODUCT_MODELS.forEach((model) => {
    opportunityMap.set(model.id, calculateProductOpportunity(report, resolvedMetrics, model));
  });
  return opportunityMap;
}

function formatGfsShare(opportunity) {
  const total = formatProspectCurrency(opportunity.gfsAnnual);
  const markup = Number(opportunity.gfsMarkupAnnual) || 0;
  const underwriting = Number(opportunity.gfsUnderwritingAnnual) || 0;
  const parts = [];
  if (markup > 0) {
    const label = opportunity.gfsMarkupLabel || 'markup';
    parts.push(`${formatProspectCurrency(markup)} ${label}`);
  }
  if (underwriting > 0) {
    const label = opportunity.gfsUnderwritingLabel || 'underwriting';
    parts.push(`${formatProspectCurrency(underwriting)} ${label}`);
  }

  let output = total;
  if (parts.length) {
    output = `${output} (${parts.join(' / ')})`;
  }
  if (opportunity.disclaimer) {
    output = `${output} ${opportunity.disclaimer}`;
  }
  return output;
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
