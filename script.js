
const STORAGE_KEYS = {
  ACCOUNTS: 'gfs.accounts.v2',
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

const PROSPECT_REPORTS = [
  {
    id: 'inspire-2025-q2',
    name: 'Inspire Federal Credit Union',
    charter: '1759',
    asOf: 'June 30, 2025',
    periodMonths: 6,
    totalAssets: 389295778,
    totalLoans: 276737013,
    loanCount: 14978,
    allowance: 1038769,
    accruedInterestLoans: 1202440,
    loansGrantedYtdCount: 1040,
    loansGrantedYtdAmount: 31527898,
    interestOnLoansYtd: 8906034,
    creditLossExpenseLoansYtd: -90000,
    delinquencyTotal60Plus: 1642549,
    delinquencyTotal60PlusLoans: 149,
    nonAccrualLoans: 1158703,
    bankruptcyOutstanding: 238637,
    tdrLoans: 6,
    tdrBalance: 402595,
    delinquencySources: {
      participations: 1265556,
      indirect: 1462904,
      purchased: 181690
    },
    indirect: {
      auto: { count: 1850, balance: 22596814 },
      other: { count: 10193, balance: 80923451 },
      total: { count: 12043, balance: 103520265 }
    },
    loanMix: {
      creditCard: { label: 'Unsecured credit card', count: 0, balance: 0, rate: 0.0 },
      student: { label: 'Non-federally guaranteed student', count: 351, balance: 395316, rate: 7.16 },
      otherUnsecured: { label: 'All other unsecured', count: 9974, balance: 72523736, rate: 6.65 },
      newVehicle: { label: 'New vehicle', count: 863, balance: 13526378, rate: 6.31 },
      usedVehicle: { label: 'Used vehicle', count: 1575, balance: 18753929, rate: 6.79 },
      leases: { label: 'Leases receivable', count: 0, balance: 0, rate: 0.0 },
      otherSecured: { label: 'Other secured non-real estate', count: 642, balance: 11237335, rate: 6.66 },
      firstMortgage: { label: '1st lien residential real estate', count: 474, balance: 62758834, rate: 4.48 },
      juniorMortgage: { label: 'Junior lien residential real estate', count: 956, balance: 50509811, rate: 7.23 },
      otherNonCommercialRE: { label: 'Other non-commercial real estate', count: 0, balance: 0, rate: 0.0 },
      commercialRE: { label: 'Commercial real estate', count: 107, balance: 44745758, rate: 6.01 },
      commercialOther: { label: 'Commercial & industrial', count: 36, balance: 2285917, rate: 7.96 }
    },
    delinquency60PlusDetail: {
      student: { label: 'Student loans', balance: 1469, loans: 2 },
      otherUnsecured: { label: 'All other unsecured', balance: 1400661, loans: 139 },
      usedVehicle: { label: 'Used vehicle', balance: 31204, loans: 2 },
      otherSecured: { label: 'Other secured non-real estate', balance: 32139, loans: 4 },
      juniorMortgage: { label: 'Junior lien residential real estate', balance: 177076, loans: 2 }
    },
    chargeOffs: {
      total: { chargeOffs: 293602, recoveries: 120865 },
      otherUnsecured: { label: 'All other unsecured', chargeOffs: 221992, recoveries: 92329 },
      student: { label: 'Student loans', chargeOffs: 3121, recoveries: 2448 },
      newVehicle: { label: 'New vehicle', chargeOffs: 14248, recoveries: 11356 },
      usedVehicle: { label: 'Used vehicle', chargeOffs: 48799, recoveries: 8201 },
      otherSecured: { label: 'Other secured non-real estate', chargeOffs: 5442, recoveries: 0 }
    },
    riskHighlights: [
      'Indirect loans contribute $1.46M of 60+ delinquency (Schedule A, Section 2 line 22b), indicating dealer follow-up gaps.',
      'Unsecured installment balances carry $1.40M in 60+ delinquency across 139 loans, dwarfing other categories.'
    ],
    insights: [
      'Unsecured lending totals $72.5M (62% of consumer installment balances) and generates 85% of 60+ delinquency ($1.40M), making credit life and debt protection penetration a high-impact hedge.',
      'Indirect channel balances reach $103.5M (37% of loans) across 12,043 contracts, providing scale for bundled GAP, VSC, and payment protection programs with dealer partners.',
      'Net charge-offs annualize to roughly 0.12% against an allowance equal to 0.38% of loans, so new coverage-driven fee income can bolster reserves while protecting members from payment shock.'
    ]
  },
  {
    id: 'lion-share-2023-q3',
    name: "Lion's Share Federal Credit Union",
    charter: '24813',
    asOf: 'September 30, 2023',
    periodMonths: 9,
    totalAssets: 71890603,
    totalLoans: 56651960,
    loanCount: 8113,
    allowance: 940961,
    accruedInterestLoans: 248547,
    loansGrantedYtdCount: 1461,
    loansGrantedYtdAmount: 19350538,
    interestOnLoansYtd: 3385301,
    creditLossExpenseLoansYtd: 456691,
    delinquencyTotal60Plus: 1934216,
    delinquencyTotal60PlusLoans: 345,
    nonAccrualLoans: 1242372,
    bankruptcyOutstanding: 174690,
    tdrLoans: 5,
    tdrBalance: 26912,
    delinquencySources: {
      participations: 62628,
      indirect: 91037,
      purchased: 0
    },
    indirect: {
      auto: { count: 680, balance: 6377744 },
      other: { count: 0, balance: 0 },
      total: { count: 680, balance: 6377744 }
    },
    loanMix: {
      creditCard: { label: 'Unsecured credit card', count: 1285, balance: 2888967, rate: 9.9 },
      student: { label: 'Non-federally guaranteed student', count: 0, balance: 0, rate: 0.0 },
      otherUnsecured: { label: 'All other unsecured', count: 4376, balance: 9630112, rate: 12.0 },
      newVehicle: { label: 'New vehicle', count: 338, balance: 8529839, rate: 5.5 },
      usedVehicle: { label: 'Used vehicle', count: 1759, balance: 25727537, rate: 5.75 },
      leases: { label: 'Leases receivable', count: 0, balance: 0, rate: 0.0 },
      otherSecured: { label: 'Other secured non-real estate', count: 195, balance: 2399140, rate: 6.5 },
      firstMortgage: { label: '1st lien residential real estate', count: 0, balance: 0, rate: 0.0 },
      juniorMortgage: { label: 'Junior lien residential real estate', count: 160, balance: 7476365, rate: 5.25 },
      otherNonCommercialRE: { label: 'Other non-commercial real estate', count: 0, balance: 0, rate: 0.0 },
      commercialRE: { label: 'Commercial real estate', count: 0, balance: 0, rate: 0.0 },
      commercialOther: { label: 'Commercial & industrial', count: 0, balance: 0, rate: 0.0 }
    },
    delinquency60PlusDetail: {
      creditCard: { label: 'Credit card', balance: 87157, loans: 37 },
      otherUnsecured: { label: 'All other unsecured', balance: 533500, loans: 231 },
      newVehicle: { label: 'New vehicle', balance: 50253, loans: 2 },
      usedVehicle: { label: 'Used vehicle', balance: 1178773, loans: 69 },
      otherSecured: { label: 'Other secured non-real estate', balance: 35481, loans: 5 },
      juniorMortgage: { label: 'Junior lien residential real estate', balance: 49052, loans: 1 }
    },
    chargeOffs: {
      total: { chargeOffs: 786256, recoveries: 89702 },
      creditCard: { label: 'Credit card', chargeOffs: 32097, recoveries: 964 },
      otherUnsecured: { label: 'All other unsecured', chargeOffs: 504602, recoveries: 80055 },
      usedVehicle: { label: 'Used vehicle', chargeOffs: 246134, recoveries: 8658 },
      otherSecured: { label: 'Other secured non-real estate', chargeOffs: 3423, recoveries: 25 }
    },
    riskHighlights: [
      'Auto loans hold $1.23M of 60+ delinquency (64% of total) and $246k of year-to-date charge-offs.',
      'Credit cards and signature loans contribute $533k of 60+ delinquency alongside $505k in year-to-date charge-offs.'
    ],
    insights: [
      'Auto lending totals $34.3M (60% of loans) with $1.23M of 60+ delinquency and $246k in charge-offs, so payment protection, GAP, and CPI can stabilize performance.',
      'Unsecured lending ($12.5M) posts $533k of 60+ delinquency and $505k of charge-offs; bundling debt protection would improve loss absorption and fee income.',
      'Allowance coverage stands at 1.66% versus a 3.41% 60+ delinquency ratio, underscoring the need for new premium revenue to rebuild reserves.'
    ]
  }
];

const PROSPECT_LOOKUP = Object.fromEntries(PROSPECT_REPORTS.map((report) => [report.id, report]));

const PROSPECT_PRODUCT_MODELS = [
  {
    id: 'credit-life-single',
    label: 'Credit Life (Single)',
    type: 'mob',
    eligibleBalanceKeys: ['otherUnsecured', 'newVehicle', 'usedVehicle', 'otherSecured'],
    penetration: 0.3,
    rates: { clp: 0.45, gfsMarkup: 0.18, creditUnionMarkup: 0.12 }
  },
  {
    id: 'credit-disability-single',
    label: 'Credit Disability (Single)',
    type: 'mob',
    eligibleBalanceKeys: ['newVehicle', 'usedVehicle', 'otherSecured'],
    penetration: 0.2,
    rates: { clp: 0.65, gfsMarkup: 0.22, creditUnionMarkup: 0.18 }
  },
  {
    id: 'debt-protection-package-a',
    label: 'Debt Protection Package A',
    type: 'mob',
    eligibleBalanceKeys: ['otherUnsecured', 'newVehicle', 'usedVehicle', 'otherSecured'],
    penetration: 0.25,
    rates: { clp: 0.85, gfsMarkup: 0.3, creditUnionMarkup: 0.2 }
  },
  {
    id: 'gap',
    label: 'GAP',
    type: 'flat',
    eligibleCountKeys: ['newVehicle', 'usedVehicle'],
    penetration: 0.35,
    pricing: { retail: 550, gfsShare: 210, creditUnionShare: 140 }
  },
  {
    id: 'vsc',
    label: 'Vehicle Service Contract',
    type: 'flat',
    eligibleCountKeys: ['newVehicle', 'usedVehicle'],
    penetration: 0.22,
    pricing: { retail: 1300, gfsShare: 320, creditUnionShare: 260 }
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
  'Credit life: $0.45 CLP + $0.18 GFS + $0.12 CU per $100 MOB • Credit disability: $0.65 CLP + $0.22 GFS + $0.18 CU • Debt protection Package A: $0.85 CLP + $0.30 GFS + $0.20 CU • GAP $550 retail ($210 GFS / $140 CU) • VSC $1,300 retail ($320 GFS / $260 CU) • CPI $90 billed ($25 GFS / $20 CU).';

const prospectState = {
  activeProspectId: '',
  logEntries: loadProspectLog(),
  logSelectTouched: false
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
  } else if (pageId === 'prospects') {
    initProspectsPage();
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

  prospectSelector.innerHTML = '';
  if (logSelector) {
    logSelector.innerHTML = '';
  }

  PROSPECT_REPORTS.forEach((report) => {
    const option = document.createElement('option');
    option.value = report.id;
    option.textContent = `${report.name} — ${report.asOf}`;
    prospectSelector.append(option);
    if (logSelector) {
      logSelector.append(option.cloneNode(true));
    }
  });

  const initialId = PROSPECT_REPORTS[0]?.id || '';
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
}

function renderProspect(id) {
  const report = PROSPECT_LOOKUP[id];
  if (!report) return;
  prospectState.activeProspectId = id;
  const metrics = computeProspectMetrics(report);
  renderProspectSummary(report, metrics);
  renderProspectChannels(report, metrics);
  renderLoanMixTable(report, metrics);
  renderRiskTable(report, metrics);
  renderProspectRiskHighlights(report);
  renderProspectInsights(report);
  renderProductTable(report, metrics);
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
  setText('prospect-reporting-date', `Call report as of ${report.asOf}`);
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

function renderProductTable(report, metrics) {
  const table = document.getElementById('prospect-product-table');
  if (!table) return;
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  let totalGross = 0;
  let totalGfs = 0;
  let totalCreditUnion = 0;

  PROSPECT_PRODUCT_MODELS.forEach((model) => {
    const opportunity = calculateProductOpportunity(report, metrics, model);
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

  if (PROSPECT_PRODUCT_MODELS.length) {
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
      creditUnionAnnual
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
    creditUnionAnnual
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
