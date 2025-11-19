const PRODUCT_OPTIONS = [
  'Credit Insurance/Debt Protection - Consumer',
  'Credit Insurance - Mortgage',
  'GAP',
  'VSC',
  'Collateral Protection Insurance (CPI)',
  'Fidelity Bond',
  'AFG Balloon Loans'
];

const REVENUE_TYPES = ['Frontend', 'Backend', 'Commission'];
const REPORTING_START_PERIOD = '2023-01';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const selectors = {
  creditUnionSelect: document.getElementById('credit-union-select'),
  addCreditUnionBtn: document.getElementById('add-credit-union-btn'),
  creditUnionDialog: document.getElementById('credit-union-dialog'),
  creditUnionForm: document.getElementById('credit-union-form'),
  creditUnionNameInput: document.getElementById('credit-union-name'),
  closeCreditUnionDialogBtn: document.getElementById('close-credit-union-dialog'),
  productSelect: document.getElementById('product-select'),
  revenueTypeSelect: document.getElementById('revenue-type-select'),
  prospectProductSelect: document.getElementById('prospect-product-select'),
  prospectRevenueTypeSelect: document.getElementById('prospect-revenue-type-select'),
  prospectCreditUnionSelect: document.getElementById('prospect-credit-union-select'),
  prospectAccountList: document.getElementById('prospect-account-list'),
  prospectAccountTemplate: document.getElementById('prospect-account-template'),
  prospectAccountFilter: document.getElementById('prospect-account-filter'),
  incomeStreamForm: document.getElementById('income-stream-form'),
  prospectStreamForm: document.getElementById('prospect-stream-form'),
  incomeStreamList: document.getElementById('income-stream-list'),
  incomeStreamCount: document.getElementById('income-stream-count'),
  prospectStreamCount: document.getElementById('prospect-stream-count'),
  prospectFeedback: document.getElementById('prospect-feedback'),
  revenueForm: document.getElementById('revenue-form'),
  revenueStreamSelect: document.getElementById('revenue-stream-select'),
  revenueFeedback: document.getElementById('revenue-feedback'),
  reportingForm: document.getElementById('reporting-filter'),
  reportingCreditUnionSelect: document.getElementById('reporting-credit-union'),
  totalRevenue: document.getElementById('total-revenue'),
  topCreditUnion: document.getElementById('top-credit-union'),
  topProduct: document.getElementById('top-product'),
  creditUnionSummary: document.getElementById('credit-union-summary'),
  productSummary: document.getElementById('product-summary'),
  typeSummary: document.getElementById('type-summary'),
  timelineChart: document.getElementById('revenue-timeline-chart'),
  timelineSubtitle: document.getElementById('timeline-subtitle'),
  incomeStreamTemplate: document.getElementById('income-stream-template'),
  streamName: document.getElementById('income-stream-name'),
  streamDetails: document.getElementById('income-stream-details'),
  creditUnionDetailSummary: document.getElementById('credit-union-detail-summary'),
  creditUnionDetailName: document.getElementById('credit-union-detail-name'),
  creditUnionDetailWindow: document.getElementById('credit-union-detail-window'),
  creditUnionTotalRevenue: document.getElementById('credit-union-total-revenue'),
  creditUnionStreamsSummary: document.getElementById('credit-union-streams-summary'),
  creditUnionStreamsBody: document.getElementById('credit-union-streams'),
  reportingStatusGrid: document.getElementById('reporting-status-grid'),
  reportingStatusTemplate: document.getElementById('reporting-status-template'),
  reportingStatusSummary: document.getElementById('reporting-status-summary'),
  streamPerformanceChart: document.getElementById('stream-performance-chart'),
  streamPerformanceSummary: document.getElementById('stream-performance-summary'),
  monthlyCompletionTable: document.getElementById('monthly-completion-table'),
  monthlyCompletionBody: document.getElementById('monthly-completion-body'),
  monthlyDetailMonth: document.getElementById('monthly-detail-month'),
  monthlyDetailSummary: document.getElementById('monthly-detail-summary'),
  monthlyDetailBody: document.getElementById('monthly-detail-body'),
  monthlyDetailDescription: document.getElementById('monthly-detail-description'),
  cancelStreamBtn: document.getElementById('cancel-stream-btn'),
  cancelStreamDialog: document.getElementById('cancel-stream-dialog'),
  cancelStreamForm: document.getElementById('cancel-stream-form'),
  cancelStreamInput: document.getElementById('cancel-stream-month'),
  cancelStreamMessage: document.getElementById('cancel-stream-message'),
  closeCancelStreamDialogBtn: document.getElementById('close-cancel-stream-dialog'),
  editRevenueDialog: document.getElementById('edit-revenue-dialog'),
  editRevenueForm: document.getElementById('edit-revenue-form'),
  editRevenueMonthLabel: document.getElementById('edit-revenue-month'),
  editRevenueAmountInput: document.getElementById('edit-revenue-amount'),
  editRevenueFeedback: document.getElementById('edit-revenue-feedback'),
  closeEditRevenueDialogBtn: document.getElementById('close-edit-revenue-dialog')
};

const appState = {
  creditUnions: [],
  incomeStreams: [],
  prospectStreams: [],
  summary: null,
  monthlyCompletion: [],
  reportingWindow: { start: null, end: null },
  selectedCreditUnion: 'all',
  currentStreamId: null,
  currentStreamDetail: null,
  currentStreamMonths: [],
  editingPeriod: null,
  monthlyDetailMonthKey: null,
  detailCreditUnionId: null,
  detailCreditUnionName: null,
  creditUnionDetail: null,
  detailStart: null,
  detailEnd: null,
  prospectAccountFilter: ''
};

function showDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

function openEditRevenueDialog(month) {
  if (!selectors.editRevenueDialog || !selectors.editRevenueForm) return;
  appState.editingPeriod = month;

  if (selectors.editRevenueMonthLabel) {
    selectors.editRevenueMonthLabel.textContent = month.label;
  }

  if (selectors.editRevenueAmountInput) {
    selectors.editRevenueAmountInput.value =
      Number.isFinite(month.amount) && month.amount !== null ? String(month.amount) : '';
  }

  if (selectors.editRevenueFeedback) {
    setFeedback(selectors.editRevenueFeedback, '', 'info');
  }

  showDialog(selectors.editRevenueDialog);
  setTimeout(() => selectors.editRevenueAmountInput?.focus(), 75);
}

function handleStatusCardActivation(event) {
  const isKeyboard = event.type === 'keydown';
  const isActivationKey = event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar';
  if (isKeyboard && !isActivationKey) {
    return;
  }

  const card = event.target.closest('.status-card');
  if (!card || !selectors.reportingStatusGrid?.contains(card)) {
    return;
  }

  if (isKeyboard) {
    event.preventDefault();
  }

  const key = card.dataset.key;
  if (!key) {
    return;
  }

  const month = appState.currentStreamMonths.find((item) => item.key === key);
  if (!month) {
    return;
  }

  openEditRevenueDialog(month);
}

function closeDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
  }
}

function setFeedback(element, message, type = 'info') {
  if (!element) return;
  element.textContent = message;
  element.dataset.state = type;
}

async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch (error) {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

function populateStaticOptions() {
  if (selectors.productSelect) {
    selectors.productSelect.replaceChildren(
      createOption('', 'Select a product', true, true),
      ...PRODUCT_OPTIONS.map((option) => createOption(option, option))
    );
  }

  if (selectors.prospectProductSelect) {
    selectors.prospectProductSelect.replaceChildren(
      createOption('', 'Select a product', true, true),
      ...PRODUCT_OPTIONS.map((option) => createOption(option, option))
    );
  }

  if (selectors.revenueTypeSelect) {
    selectors.revenueTypeSelect.replaceChildren(
      createOption('', 'Select type', true, true),
      ...REVENUE_TYPES.map((type) => createOption(type, type))
    );
  }

  if (selectors.prospectRevenueTypeSelect) {
    selectors.prospectRevenueTypeSelect.replaceChildren(
      createOption('', 'Select type', true, true),
      ...REVENUE_TYPES.map((type) => createOption(type, type))
    );
  }
}

function createOption(value, label, disabled = false, selected = false) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  option.disabled = disabled;
  option.selected = selected;
  return option;
}

function getProductKey(name) {
  if (typeof name !== 'string' || !name.trim()) {
    return null;
  }

  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createSubtitleText(text) {
  const span = document.createElement('span');
  span.textContent = typeof text === 'string' && text.trim() ? text : '—';
  return span;
}

function createSubtitleDivider() {
  const divider = document.createElement('span');
  divider.className = 'item__divider';
  divider.setAttribute('aria-hidden', 'true');
  divider.textContent = '•';
  return divider;
}

function createProductBadge(name, productKey) {
  const badge = document.createElement('span');
  badge.className = 'item__product-badge';
  if (productKey) {
    badge.dataset.productKey = productKey;
  }
  badge.textContent = typeof name === 'string' && name.trim() ? name : 'Unknown product';
  return badge;
}

function getCreditUnionNameById(id) {
  if (!id) return null;
  const match = appState.creditUnions.find((creditUnion) => creditUnion.id === id);
  return match ? match.name : null;
}

function formatMonthLabelFromKey(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}$/.test(key)) {
    return null;
  }
  const [yearStr, monthStr] = key.split('-');
  const year = Number.parseInt(yearStr, 10);
  const month = Number.parseInt(monthStr, 10);
  if (!Number.isFinite(year) || !Number.isFinite(month)) {
    return null;
  }
  const date = new Date(year, month - 1, 1);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function buildMonthlyDetailUrl(monthKey) {
  const params = new URLSearchParams();
  params.set('month', monthKey);
  if (appState.selectedCreditUnion && appState.selectedCreditUnion !== 'all') {
    params.set('creditUnionId', appState.selectedCreditUnion);
    const creditUnionName = getCreditUnionNameById(appState.selectedCreditUnion);
    if (creditUnionName) {
      params.set('creditUnionName', creditUnionName);
    }
  }
  return `monthly-detail.html?${params.toString()}`;
}

function buildCreditUnionDetailUrl(creditUnionId, creditUnionName) {
  if (!creditUnionId) {
    return '#';
  }
  const params = new URLSearchParams();
  params.set('creditUnionId', creditUnionId);
  if (creditUnionName) {
    params.set('creditUnionName', creditUnionName);
  }
  if (appState.reportingWindow?.start) {
    params.set('start', appState.reportingWindow.start);
  }
  if (appState.reportingWindow?.end) {
    params.set('end', appState.reportingWindow.end);
  }
  return `credit-union.html?${params.toString()}`;
}

function getMonthFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('month');
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }
  return value;
}

function getDetailCreditUnionIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('creditUnionId');
  if (!value || value === 'all') {
    return null;
  }
  return value;
}

function getDetailCreditUnionNameFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('creditUnionName');
  return value ? value : null;
}

function isValidPeriodValue(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value);
}

function getDetailStartFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('start');
  return isValidPeriodValue(value) ? value : null;
}

function getDetailEndFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get('end');
  return isValidPeriodValue(value) ? value : null;
}

function renderCreditUnionOptions() {
  const select = selectors.creditUnionSelect;
  const revenueSelect = selectors.revenueStreamSelect;
  const reportingSelect = selectors.reportingCreditUnionSelect;
  const prospectSelect = selectors.prospectCreditUnionSelect;

  if (select) {
    const placeholder = createOption('', 'Select a credit union', true, true);
    select.replaceChildren(placeholder);

    appState.creditUnions
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((creditUnion) => {
        select.append(createOption(creditUnion.id, creditUnion.name));
      });
  }

  if (revenueSelect) {
    const currentIncomeStream = revenueSelect.value;
    const revenuePlaceholder = createOption('', 'Select income stream', true, true);
    revenueSelect.replaceChildren(revenuePlaceholder);

    appState.incomeStreams
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label))
      .forEach((stream) => {
        const option = createOption(stream.id, stream.label, false, stream.id === currentIncomeStream);
        revenueSelect.append(option);
      });

    if (currentIncomeStream) {
      revenueSelect.value = currentIncomeStream;
    }
  }

  if (reportingSelect) {
    const currentSelection = reportingSelect.value || appState.selectedCreditUnion || 'all';
    const options = [createOption('all', 'All accounts', false, currentSelection === 'all')];

    appState.creditUnions
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((creditUnion) => {
        options.push(createOption(creditUnion.id, creditUnion.name, false, creditUnion.id === currentSelection));
      });

    reportingSelect.replaceChildren(...options);

    if (currentSelection !== 'all' && !appState.creditUnions.some((creditUnion) => creditUnion.id === currentSelection)) {
      reportingSelect.value = 'all';
      appState.selectedCreditUnion = 'all';
    } else {
      reportingSelect.value = currentSelection;
      appState.selectedCreditUnion = reportingSelect.value || 'all';
    }
  }

  if (prospectSelect) {
    const placeholder = createOption('', 'Select a credit union', true, true);
    prospectSelect.replaceChildren(placeholder);

    appState.creditUnions
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((creditUnion) => {
        prospectSelect.append(createOption(creditUnion.id, creditUnion.name));
      });
  }
}

function renderIncomeStreamList() {
  const list = selectors.incomeStreamList;
  const template = selectors.incomeStreamTemplate;
  if (!list || !template) return;

  list.replaceChildren();

  if (!appState.incomeStreams.length) {
    const empty = document.createElement('li');
    empty.className = 'item';
    const heading = document.createElement('p');
    heading.className = 'item__title';
    heading.textContent = 'No income streams yet';
    const sub = document.createElement('p');
    sub.className = 'item__subtitle';
    sub.textContent = 'Create your first stream to begin tracking revenue.';
    empty.append(heading);
    empty.append(sub);
    list.append(empty);
    if (selectors.incomeStreamCount) {
      selectors.incomeStreamCount.textContent = '0 streams';
    }
    return;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  appState.incomeStreams
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((stream) => {
      const fragment = template.content.cloneNode(true);
      const listItem = fragment.querySelector('.item');
      const link = fragment.querySelector('.item__link');
      const title = fragment.querySelector('.item__title');
      const subtitle = fragment.querySelector('.item__subtitle');
      const meta = fragment.querySelector('.item__meta');
      const metric = fragment.querySelector('.item__metric');
      const productKey = getProductKey(stream.product);

      title.textContent = stream.label;

      if (listItem) {
        if (productKey) {
          listItem.dataset.productKey = productKey;
        } else {
          delete listItem.dataset.productKey;
        }
      }

      if (subtitle) {
        subtitle.replaceChildren();
        const segments = [
          createSubtitleText(stream.creditUnionName),
          createSubtitleDivider(),
          createProductBadge(stream.product, productKey),
          createSubtitleDivider(),
          createSubtitleText(stream.revenueType)
        ];
        segments.forEach((segment) => subtitle.append(segment));
      }

      if (link) {
        link.href = `stream.html?id=${encodeURIComponent(stream.id)}`;
        link.setAttribute('aria-label', `View monthly reporting status for ${stream.label}`);
      }

      const metaSegments = [];
      if (stream.lastReport) {
        const { month, year, amount } = stream.lastReport;
        metaSegments.push(`Last reported ${currencyFormatter.format(amount)} in ${formatPeriodLabel(year, month)}`);
      } else {
        metaSegments.push('No revenue logged yet');
      }

      if (stream.finalReport) {
        metaSegments.push(`Final reporting month: ${stream.finalReport.label}`);
      }

      meta.textContent = metaSegments.join(' • ');

      if (stream.pendingCount > 0) {
        metric.textContent = `${stream.pendingCount} month${stream.pendingCount === 1 ? '' : 's'} pending`;
        metric.dataset.status = 'pending';
      } else if (stream.finalReport) {
        metric.textContent = 'Stream canceled';
        metric.dataset.status = 'complete';
      } else {
        metric.textContent = 'All months reported';
        metric.dataset.status = 'complete';
      }

      list.append(fragment);
    });

  if (selectors.incomeStreamCount) {
    selectors.incomeStreamCount.textContent = `${formatter.format(appState.incomeStreams.length)} stream${
      appState.incomeStreams.length === 1 ? '' : 's'
    }`;
  }
}

function getAllProductOptions() {
  const extras = new Set();
  const baseSet = new Set(PRODUCT_OPTIONS);
  [...appState.incomeStreams, ...appState.prospectStreams].forEach((stream) => {
    const { product } = stream;
    if (typeof product === 'string' && product.trim() && !baseSet.has(product)) {
      extras.add(product);
    }
  });

  const sortedExtras = Array.from(extras).sort((a, b) => a.localeCompare(b));
  return [...PRODUCT_OPTIONS, ...sortedExtras];
}

function getProspectAccounts() {
  const creditUnionMap = new Map();
  appState.creditUnions.forEach((creditUnion) => {
    if (creditUnion?.id) {
      creditUnionMap.set(creditUnion.id, {
        id: creditUnion.id,
        name: creditUnion.name || 'Unnamed credit union'
      });
    }
  });

  const ensureCreditUnion = (stream) => {
    if (!stream?.creditUnionId) return;
    if (!creditUnionMap.has(stream.creditUnionId)) {
      creditUnionMap.set(stream.creditUnionId, {
        id: stream.creditUnionId,
        name: stream.creditUnionName || 'Unnamed credit union'
      });
    } else if (!creditUnionMap.get(stream.creditUnionId).name && stream.creditUnionName) {
      creditUnionMap.get(stream.creditUnionId).name = stream.creditUnionName;
    }
  };

  [...appState.incomeStreams, ...appState.prospectStreams].forEach(ensureCreditUnion);

  const products = getAllProductOptions();

  return Array.from(creditUnionMap.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((creditUnion) => {
      const productEntries = products.map((product) => {
        const activeStreams = appState.incomeStreams.filter(
          (stream) => stream.creditUnionId === creditUnion.id && stream.product === product
        );
        const prospectStreams = appState.prospectStreams.filter(
          (stream) => stream.creditUnionId === creditUnion.id && stream.product === product
        );
        return {
          product,
          productKey: getProductKey(product),
          activeStreams,
          prospectStreams
        };
      });

      const activeCount = productEntries.reduce((sum, entry) => sum + entry.activeStreams.length, 0);
      const prospectCount = productEntries.reduce((sum, entry) => sum + entry.prospectStreams.length, 0);

      return {
        creditUnion,
        products: productEntries,
        activeCount,
        prospectCount
      };
    });
}

function createProductStatusEntry(stream, state) {
  const entry = document.createElement('article');
  entry.className = 'product-status';
  entry.dataset.state = state;
  if (stream?.id) {
    entry.dataset.streamId = stream.id;
  }

  const title = document.createElement('p');
  title.className = 'product-status__title';
  title.textContent = stream?.label || (state === 'active' ? 'Active income stream' : 'Prospect income stream');
  entry.append(title);

  const estimateValue = Number(stream?.monthlyIncomeEstimate);
  const detailParts = [];
  if (stream?.revenueType) {
    detailParts.push(stream.revenueType);
  }
  if (Number.isFinite(estimateValue)) {
    detailParts.push(currencyFormatter.format(estimateValue));
  }

  const detail = document.createElement('p');
  detail.className = 'product-status__meta';
  detail.textContent = detailParts.length ? detailParts.join(' • ') : 'No estimate captured yet.';
  entry.append(detail);

  if (state === 'active') {
    const actions = document.createElement('div');
    actions.className = 'product-status__actions';
    if (stream?.id) {
      const link = document.createElement('a');
      link.href = `stream.html?id=${stream.id}`;
      link.className = 'table-link';
      link.textContent = 'View reporting';
      link.setAttribute('aria-label', `View reporting for ${stream.label || 'this income stream'}`);
      actions.append(link);
    }
    entry.append(actions);
  } else {
    const form = document.createElement('form');
    form.className = 'prospect-estimate-form';
    form.autocomplete = 'off';
    if (stream?.id) {
      form.dataset.streamId = stream.id;
    }

    const label = document.createElement('label');
    label.className = 'prospect-label';
    label.textContent = 'Monthly income estimate';

    const fields = document.createElement('div');
    fields.className = 'prospect-estimate-fields';

    const input = document.createElement('input');
    input.type = 'number';
    input.name = 'monthlyIncomeEstimate';
    input.placeholder = 'Ex: 12500';
    input.step = '0.01';
    if (Number.isFinite(estimateValue)) {
      input.value = String(estimateValue);
    }

    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'secondary-button';
    button.textContent = 'Save estimate';

    fields.append(input, button);
    form.append(label, fields);

    const feedback = document.createElement('p');
    feedback.className = 'prospect-feedback';
    feedback.dataset.state = 'info';
    form.append(feedback);
    setFeedback(feedback, '', 'info');
    entry.append(form);

    const actions = document.createElement('div');
    actions.className = 'prospect-activate';
    const activateButton = document.createElement('button');
    activateButton.type = 'button';
    activateButton.className = 'primary-button prospect-activate-btn';
    activateButton.textContent = 'Activate income stream';
    if (stream?.id) {
      activateButton.dataset.streamId = stream.id;
    }
    const note = document.createElement('p');
    note.className = 'prospect-note';
    note.textContent = 'Activation moves this prospect into the active reporting queue.';
    actions.append(activateButton, note);
    entry.append(actions);
  }

  return entry;
}

function createProductStatusCell(streams, state) {
  const cell = document.createElement('td');
  const checkbox = document.createElement('label');
  checkbox.className = 'status-checkbox';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.disabled = true;
  input.checked = Array.isArray(streams) && streams.length > 0;
  const text = document.createElement('span');
  text.textContent = state === 'active' ? 'Active' : 'Prospect';
  checkbox.append(input, text);
  cell.append(checkbox);

  if (Array.isArray(streams) && streams.length) {
    const list = document.createElement('div');
    list.className = 'status-entry-list';
    streams.forEach((stream) => {
      list.append(createProductStatusEntry(stream, state));
    });
    cell.append(list);
  } else {
    const empty = document.createElement('p');
    empty.className = 'product-status__empty';
    empty.textContent = state === 'active' ? 'No active coverage yet.' : 'No prospect coverage logged.';
    cell.append(empty);
  }

  return cell;
}

function renderProspectAccountList() {
  const list = selectors.prospectAccountList;
  const template = selectors.prospectAccountTemplate;
  if (!list || !template) return;

  list.replaceChildren();

  const accounts = getProspectAccounts();
  const filterValue = (appState.prospectAccountFilter || '').trim().toLowerCase();
  const filteredAccounts = filterValue
    ? accounts.filter((account) => account.creditUnion.name.toLowerCase().includes(filterValue))
    : accounts;

  if (!filteredAccounts.length) {
    const empty = document.createElement('li');
    empty.className = 'account-card account-card--empty';
    empty.textContent = accounts.length
      ? 'No credit unions match this search yet.'
      : 'Add a credit union to start tracking product coverage.';
    list.append(empty);
  } else {
    filteredAccounts.forEach((account) => {
      const fragment = template.content.cloneNode(true);
      const card = fragment.querySelector('.account-card');
      if (card && account.creditUnion.id) {
        card.dataset.creditUnionId = account.creditUnion.id;
      }

      const title = fragment.querySelector('.account-card__title');
      if (title) {
        title.textContent = account.creditUnion.name || 'Unnamed credit union';
      }

      const subtitle = fragment.querySelector('.account-card__subtitle');
      if (subtitle) {
        if (account.activeCount || account.prospectCount) {
          subtitle.textContent = `${account.activeCount} active stream${account.activeCount === 1 ? '' : 's'} • ${
            account.prospectCount
          } prospect${account.prospectCount === 1 ? '' : 's'}`;
        } else {
          subtitle.textContent = 'No income streams captured yet.';
        }
      }

      const activeTotal = fragment.querySelector('.account-card__total--active');
      if (activeTotal) {
        activeTotal.textContent = `${account.activeCount} Active`;
      }
      const prospectTotal = fragment.querySelector('.account-card__total--prospect');
      if (prospectTotal) {
        prospectTotal.textContent = `${account.prospectCount} Prospect${account.prospectCount === 1 ? '' : 's'}`;
      }

      const body = fragment.querySelector('tbody');
      if (body) {
        body.replaceChildren();
        account.products.forEach((productEntry) => {
          const row = document.createElement('tr');
          if (productEntry.productKey) {
            row.dataset.productKey = productEntry.productKey;
          }
          const productCell = document.createElement('th');
          productCell.scope = 'row';
          productCell.textContent = productEntry.product;
          row.append(
            productCell,
            createProductStatusCell(productEntry.activeStreams, 'active'),
            createProductStatusCell(productEntry.prospectStreams, 'prospect')
          );
          body.append(row);
        });
      }

      list.append(fragment);
    });
  }

  if (selectors.prospectStreamCount) {
    if (!filteredAccounts.length) {
      selectors.prospectStreamCount.textContent = filterValue
        ? 'No accounts match this search.'
        : '0 accounts tracked yet';
    } else {
      const totalAccounts = filteredAccounts.length;
      const activeStreams = filteredAccounts.reduce((sum, account) => sum + account.activeCount, 0);
      const prospectStreams = filteredAccounts.reduce((sum, account) => sum + account.prospectCount, 0);
      selectors.prospectStreamCount.textContent = `${totalAccounts} account${totalAccounts === 1 ? '' : 's'} • ${
        activeStreams
      } active stream${activeStreams === 1 ? '' : 's'} • ${prospectStreams} prospect stream${
        prospectStreams === 1 ? '' : 's'
      }`;
    }
  }
}

function formatPeriodLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function formatPeriodValue(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function getCurrentPeriodValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatDateString(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getStreamIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    appState.currentStreamId = id;
  }
  return id;
}

async function loadIncomeStreamDetail(streamId) {
  const data = await request(`/api/income-streams/${streamId}`);
  renderStreamOverview(data);
}

function renderStreamOverview(stream) {
  if (!stream) return;

  appState.currentStreamDetail = stream;

  if (selectors.streamName) {
    selectors.streamName.textContent = stream.label;
  }

  if (selectors.cancelStreamBtn) {
    const button = selectors.cancelStreamBtn;
    button.hidden = false;
    if (stream.finalReport) {
      button.textContent = 'Update final reporting month';
      button.setAttribute('aria-label', 'Update the final reporting month for this income stream');
    } else {
      button.textContent = 'Cancel income stream';
      button.setAttribute('aria-label', 'Cancel this income stream and stop future reporting requirements');
    }
  }

  if (selectors.streamDetails) {
    selectors.streamDetails.replaceChildren();
    const finalReportLabel = stream.finalReport ? stream.finalReport.label : null;
    const entries = [
      ['Credit union / entity', stream.creditUnionName],
      ['Product / service', stream.product],
      ['Revenue type', stream.revenueType],
      ['Created on', formatDateString(stream.createdAt)],
      ['Last updated', formatDateString(stream.updatedAt)],
      [
        'Pending months',
        stream.pendingCount > 0
          ? `${stream.pendingCount} month${stream.pendingCount === 1 ? '' : 's'} awaiting reporting`
          : 'All months reported'
      ]
    ];

    if (finalReportLabel) {
      entries.push(['Final reporting month', finalReportLabel]);
      entries.push(['Stream status', 'Canceled']);
    } else {
      entries.push(['Stream status', 'Active']);
    }

    if (stream.canceledAt) {
      entries.push(['Canceled on', formatDateString(stream.canceledAt)]);
    }

    entries.forEach(([label, value]) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'stream-overview__detail';
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      wrapper.append(dt, dd);
      selectors.streamDetails.append(wrapper);
    });
  }
}

async function loadIncomeStreamReportingStatus(streamId) {
  const data = await request(`/api/income-streams/${streamId}/reporting-status`);
  renderReportingStatus(data);
}

function renderReportingStatus(data) {
  const grid = selectors.reportingStatusGrid;
  const template = selectors.reportingStatusTemplate;
  if (!grid || !template) return;

  grid.replaceChildren();

  const months = Array.isArray(data?.months) ? data.months : [];
  const summary = data?.summary ?? { total: months.length, completed: 0, pending: months.length };
  appState.currentStreamMonths = months;

  if (!months.length) {
    const empty = document.createElement('p');
    empty.className = 'panel__description';
    empty.textContent = 'No reporting requirements found for this income stream.';
    grid.append(empty);
  } else {
    months.forEach((month) => {
      const fragment = template.content.cloneNode(true);
      const card = fragment.querySelector('.status-card');
      const title = fragment.querySelector('.status-card__month');
      const amount = fragment.querySelector('.status-card__amount');

      if (card) {
        card.dataset.state = month.completed ? 'complete' : 'pending';
        card.dataset.key = month.key;
        card.dataset.interactive = 'true';
        card.tabIndex = 0;
        card.setAttribute('aria-label', `Edit revenue for ${month.label}`);
        card.setAttribute('aria-roledescription', 'button');
      }

      if (title) {
        title.textContent = month.label;
      }

      if (amount) {
        if (month.completed && Number.isFinite(month.amount)) {
          amount.textContent = `Recorded ${currencyFormatter.format(month.amount)}`;
        } else if (month.completed) {
          amount.textContent = 'Recorded (amount unavailable)';
        } else {
          amount.textContent = 'Awaiting input';
        }
      }

      grid.append(fragment);
    });
  }

  renderStreamPerformance(months);

  if (selectors.reportingStatusSummary) {
    const pendingText =
      summary.pending > 0
        ? `${summary.pending} month${summary.pending === 1 ? '' : 's'} still need numbers.`
        : 'Every required month has been reported. Great job!';
    const completedText = `${summary.completed} of ${summary.total} month${summary.total === 1 ? '' : 's'} reported.`;
    const startLabel = months[0]?.label ?? 'Jan 2023';
    const endLabel = months[months.length - 1]?.label ?? startLabel;
    const rangeText = startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
    const finalReportLabel = appState.currentStreamDetail?.finalReport?.label;
    if (finalReportLabel) {
      selectors.reportingStatusSummary.textContent = `${completedText} ${pendingText} Tracking period: ${rangeText}. No new months will be generated after ${finalReportLabel}.`;
    } else {
      selectors.reportingStatusSummary.textContent = `${completedText} ${pendingText} Tracking period: ${rangeText}.`;
    }
  }
}

async function loadCreditUnions() {
  const data = await request('/api/credit-unions');
  appState.creditUnions = data.map((item) => ({ id: item.id, name: item.name }));
  renderCreditUnionOptions();
  renderProspectAccountList();
}

async function loadIncomeStreams() {
  const data = await request('/api/income-streams?status=active');
  appState.incomeStreams = data.map((stream) => ({
    id: stream.id,
    label: stream.label,
    creditUnionId: stream.creditUnionId,
    creditUnionName: stream.creditUnionName,
    product: stream.product,
    revenueType: stream.revenueType,
    status: stream.status,
    monthlyIncomeEstimate: stream.monthlyIncomeEstimate,
    updatedAt: stream.updatedAt ? new Date(stream.updatedAt).getTime() : 0,
    pendingCount: Number(stream.pendingCount ?? 0),
    lastReport: stream.lastReport
      ? {
          amount: Number(stream.lastReport.amount),
          month: stream.lastReport.month,
          year: stream.lastReport.year
        }
      : null,
    finalReport: stream.finalReport
      ? {
          year: stream.finalReport.year,
          month: stream.finalReport.month,
          label: stream.finalReport.label
        }
      : null
  }));
  renderCreditUnionOptions();
  renderIncomeStreamList();
  renderProspectAccountList();
}

async function loadProspectStreams() {
  const data = await request('/api/income-streams?status=prospect');
  appState.prospectStreams = data.map((stream) => ({
    id: stream.id,
    label: stream.label,
    creditUnionId: stream.creditUnionId,
    creditUnionName: stream.creditUnionName,
    product: stream.product,
    revenueType: stream.revenueType,
    status: stream.status,
    monthlyIncomeEstimate: stream.monthlyIncomeEstimate,
    updatedAt: stream.updatedAt ? new Date(stream.updatedAt).getTime() : 0
  }));
  renderCreditUnionOptions();
  renderProspectAccountList();
}

async function createCreditUnion(name) {
  const result = await request('/api/credit-unions', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
  appState.creditUnions.push({ id: result.id, name: result.name });
  renderCreditUnionOptions();
  renderProspectAccountList();
  if (selectors.creditUnionSelect) {
    selectors.creditUnionSelect.value = result.id;
  }
  if (selectors.prospectCreditUnionSelect) {
    selectors.prospectCreditUnionSelect.value = result.id;
  }
}

async function createIncomeStream(payload) {
  const result = await request('/api/income-streams', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const normalizedStream = {
    id: result.id,
    label: result.label,
    creditUnionId: result.creditUnionId,
    creditUnionName: result.creditUnionName,
    product: result.product,
    revenueType: result.revenueType,
    status: result.status,
    monthlyIncomeEstimate: result.monthlyIncomeEstimate,
    updatedAt: result.updatedAt ? new Date(result.updatedAt).getTime() : Date.now(),
    pendingCount: Number(result.pendingCount ?? 0),
    lastReport: null
  };

  if (result.status === 'prospect') {
    appState.prospectStreams.push(normalizedStream);
    renderProspectAccountList();
  } else {
    appState.incomeStreams.push(normalizedStream);
    renderIncomeStreamList();
    renderProspectAccountList();
    if (selectors.revenueStreamSelect) {
      selectors.revenueStreamSelect.value = result.id;
    }
  }

  renderCreditUnionOptions();
}

async function updateProspectEstimate(streamId, monthlyIncomeEstimate) {
  const result = await request(`/api/income-streams/${streamId}/estimate`, {
    method: 'PATCH',
    body: JSON.stringify({ monthlyIncomeEstimate })
  });

  const targetIndex = appState.prospectStreams.findIndex((stream) => stream.id === streamId);
  if (targetIndex >= 0) {
    appState.prospectStreams[targetIndex] = {
      ...appState.prospectStreams[targetIndex],
      monthlyIncomeEstimate: result.monthlyIncomeEstimate,
      updatedAt: result.updatedAt ? new Date(result.updatedAt).getTime() : Date.now()
    };
    renderProspectAccountList();
  }
}

async function activateProspectStream(streamId) {
  const result = await request(`/api/income-streams/${streamId}/activate`, { method: 'PATCH' });

  appState.prospectStreams = appState.prospectStreams.filter((stream) => stream.id !== streamId);

  appState.incomeStreams.push({
    id: result.id,
    label: result.label,
    creditUnionId: result.creditUnionId,
    creditUnionName: result.creditUnionName,
    product: result.product,
    revenueType: result.revenueType,
    status: result.status,
    monthlyIncomeEstimate: result.monthlyIncomeEstimate,
    updatedAt: result.updatedAt ? new Date(result.updatedAt).getTime() : Date.now(),
    pendingCount: Number(result.pendingCount ?? 0),
    lastReport: null
  });

  renderProspectAccountList();
  renderIncomeStreamList();
  renderCreditUnionOptions();
}

async function saveRevenueEntry(payload) {
  await request('/api/revenue', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function cancelIncomeStream(streamId, finalMonth) {
  return request(`/api/income-streams/${streamId}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ finalMonth })
  });
}

async function loadMonthlyCompletion(params = {}) {
  if (!selectors.monthlyCompletionBody) {
    return;
  }

  const searchParams = new URLSearchParams();
  if (params.start) searchParams.set('start', params.start);
  if (params.end) searchParams.set('end', params.end);
  const creditUnionId = params.creditUnionId ?? appState.selectedCreditUnion;
  if (creditUnionId && creditUnionId !== 'all') {
    searchParams.set('creditUnionId', creditUnionId);
  }

  const query = searchParams.toString();
  let data;
  try {
    data = await request(`/api/reports/completion${query ? `?${query}` : ''}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load monthly completion.';
    if (selectors.monthlyCompletionBody) {
      const body = selectors.monthlyCompletionBody;
      body.replaceChildren();
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      const columnCount = selectors.monthlyCompletionTable?.querySelectorAll('thead th').length || 3;
      cell.colSpan = columnCount;
      cell.textContent = message;
      row.append(cell);
      body.append(row);
    }
    throw error;
  }
  const months = Array.isArray(data?.months) ? data.months : [];
  appState.monthlyCompletion = months;
  renderMonthlyCompletion();
}

async function loadMonthlyDetail(monthKey, creditUnionId) {
  if (!selectors.monthlyDetailBody || !monthKey) {
    return;
  }

  const searchParams = new URLSearchParams();
  if (creditUnionId && creditUnionId !== 'all') {
    searchParams.set('creditUnionId', creditUnionId);
  }

  const query = searchParams.toString();
  const data = await request(`/api/reports/monthly/${monthKey}${query ? `?${query}` : ''}`);
  const creditUnionName = getCreditUnionNameById(creditUnionId) || appState.detailCreditUnionName || null;
  renderMonthlyDetail(data, { monthKey, creditUnionId, creditUnionName });
}

async function loadSummary(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.start) searchParams.set('start', params.start);
  if (params.end) searchParams.set('end', params.end);
  const creditUnionId = params.creditUnionId ?? appState.selectedCreditUnion;
  if (creditUnionId && creditUnionId !== 'all') {
    searchParams.set('creditUnionId', creditUnionId);
  }
  const query = searchParams.toString();
  const data = await request(`/api/reports/summary${query ? `?${query}` : ''}`);
  appState.summary = data;
  renderSummary();

  if (selectors.monthlyCompletionBody) {
    try {
      await loadMonthlyCompletion({ start: params.start, end: params.end, creditUnionId });
    } catch (error) {
      console.error(error);
    }
  }
}

function renderSummary() {
  const summary = appState.summary;
  if (!summary) return;

  if (selectors.totalRevenue) {
    selectors.totalRevenue.textContent = currencyFormatter.format(summary.totalRevenue || 0);
  }

  if (selectors.topCreditUnion) {
    if (summary.byCreditUnion?.length) {
      selectors.topCreditUnion.textContent = `${summary.byCreditUnion[0].name} (${currencyFormatter.format(
        summary.byCreditUnion[0].amount
      )})`;
    } else {
      selectors.topCreditUnion.textContent = 'Waiting for data';
    }
  }

  if (selectors.topProduct) {
    if (summary.byProduct?.length) {
      selectors.topProduct.textContent = `${summary.byProduct[0].name} (${currencyFormatter.format(
        summary.byProduct[0].amount
      )})`;
    } else {
      selectors.topProduct.textContent = 'Waiting for data';
    }
  }

  const creditUnionRows = Array.isArray(summary.byCreditUnion)
    ? summary.byCreditUnion.map((row) => ({
        ...row,
        href: row.id ? buildCreditUnionDetailUrl(row.id, row.name) : null
      }))
    : [];

  renderSummaryTable(selectors.creditUnionSummary, creditUnionRows);
  renderSummaryTable(selectors.productSummary, summary.byProduct);
  renderSummaryTable(selectors.typeSummary, summary.byRevenueType);
  renderTimeline(summary.timeline || []);

  if (selectors.timelineSubtitle) {
    if (appState.selectedCreditUnion && appState.selectedCreditUnion !== 'all') {
      const creditUnionName =
        appState.creditUnions.find((creditUnion) => creditUnion.id === appState.selectedCreditUnion)?.name ||
        'selected credit union';
      selectors.timelineSubtitle.textContent = `Monthly totals for ${creditUnionName}`;
    } else {
      selectors.timelineSubtitle.textContent = 'Monthly totals across all income streams';
    }
  }
}

function renderMonthlyCompletion() {
  const body = selectors.monthlyCompletionBody;
  if (!body) return;

  body.replaceChildren();
  const months = Array.isArray(appState.monthlyCompletion) ? appState.monthlyCompletion : [];

  if (!months.length) {
    const emptyRow = document.createElement('tr');
    const cell = document.createElement('td');
    const columnCount = selectors.monthlyCompletionTable?.querySelectorAll('thead th').length || 3;
    cell.colSpan = columnCount;
    cell.textContent = 'No reporting requirements in this window yet.';
    emptyRow.append(cell);
    body.append(emptyRow);
    return;
  }

  months.forEach((month) => {
    const row = document.createElement('tr');
    const totalActive = Number(month.totalActiveStreams ?? 0);
    const completed = Number(month.completedStreams ?? 0);

    if (totalActive > 0 && completed === totalActive) {
      row.dataset.state = 'complete';
    }

    const monthCell = document.createElement('td');
    const link = document.createElement('a');
    const monthLabel = month.label ?? month.key;
    link.href = buildMonthlyDetailUrl(month.key);
    link.textContent = monthLabel;
    link.className = 'table-link';
    link.setAttribute('aria-label', `View monthly totals for ${monthLabel}`);
    monthCell.append(link);

    const reportedCell = document.createElement('td');
    reportedCell.className = 'numeric';
    reportedCell.textContent = totalActive > 0 ? `${completed} of ${totalActive} active` : '0 of 0 active';

    const completionCell = document.createElement('td');
    completionCell.className = 'numeric';
    if (totalActive > 0) {
      const percent = Math.round(Number(month.completionRate ?? 0));
      completionCell.textContent = `${percent}%`;
    } else {
      completionCell.textContent = '—';
    }

    const totalRevenueCell = document.createElement('td');
    totalRevenueCell.className = 'numeric';
    const revenueAmount = Number(month.totalRevenue ?? 0);
    totalRevenueCell.textContent = currencyFormatter.format(revenueAmount);

    row.append(monthCell, reportedCell, completionCell, totalRevenueCell);
    body.append(row);
  });
}

function renderMonthlyDetail(data, options = {}) {
  const body = selectors.monthlyDetailBody;
  if (!body) return;

  const monthKey = data?.month?.key || options.monthKey || null;
  const monthLabel = data?.month?.label || (monthKey ? formatMonthLabelFromKey(monthKey) : null);
  const creditUnionName =
    options.creditUnionName || getCreditUnionNameById(options.creditUnionId) || appState.detailCreditUnionName || null;

  if (selectors.monthlyDetailMonth) {
    selectors.monthlyDetailMonth.textContent = monthLabel || 'Select a month to view totals';
  }

  if (selectors.monthlyDetailDescription) {
    const baseText =
      selectors.monthlyDetailDescription.dataset.baseText ||
      selectors.monthlyDetailDescription.textContent ||
      'Choose a month from the Monthly Totals view to load the income stream breakdown.';
    selectors.monthlyDetailDescription.dataset.baseText = baseText;

    if (monthLabel) {
      const creditUnionPart = creditUnionName ? ` for ${creditUnionName}` : '';
      selectors.monthlyDetailDescription.textContent = `Showing revenue totals${creditUnionPart} for ${monthLabel}.`;
    } else {
      selectors.monthlyDetailDescription.textContent = baseText;
    }
  }

  body.replaceChildren();
  const streams = Array.isArray(data?.streams) ? data.streams : [];
  const hasError = Boolean(options.error);

  if (hasError || !streams.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 2;
    cell.textContent = options.error
      ? options.error
      : monthLabel
      ? 'No revenue has been recorded for this month yet.'
      : 'Select a month from the Monthly Totals view to get started.';
    row.append(cell);
    body.append(row);
  } else {
    streams.forEach((stream) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const amountCell = document.createElement('td');
      nameCell.textContent = stream.name;
      amountCell.className = 'numeric';
      amountCell.textContent = currencyFormatter.format(stream.amount ?? 0);
      row.append(nameCell, amountCell);
      body.append(row);
    });
  }

  if (selectors.monthlyDetailSummary) {
    if (hasError) {
      selectors.monthlyDetailSummary.textContent = options.error;
    } else if (streams.length) {
      const totalAmount = streams.reduce((sum, stream) => sum + Number(stream.amount ?? 0), 0);
      const streamCountLabel = `${streams.length} income stream${streams.length === 1 ? '' : 's'}`;
      const prefix = creditUnionName ? `${creditUnionName} · ` : '';
      selectors.monthlyDetailSummary.textContent = `${prefix}${streamCountLabel} · Total ${currencyFormatter.format(
        totalAmount
      )}`;
    } else if (monthLabel) {
      selectors.monthlyDetailSummary.textContent = 'No revenue logged for this month yet.';
    } else {
      selectors.monthlyDetailSummary.textContent = '';
    }
  }
}

function renderSummaryTable(container, rows = []) {
  if (!container) return;
  container.replaceChildren();

  if (!rows.length) {
    const emptyRow = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 2;
    cell.textContent = 'No data yet';
    emptyRow.append(cell);
    container.append(emptyRow);
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    const nameCell = document.createElement('td');
    const valueCell = document.createElement('td');
    if (row.href) {
      const link = document.createElement('a');
      link.href = row.href;
      link.className = 'table-link';
      link.textContent = row.name;
      link.setAttribute('aria-label', `View income streams for ${row.name}`);
      nameCell.append(link);
    } else {
      nameCell.textContent = row.name;
    }
    valueCell.textContent = currencyFormatter.format(row.amount);
    valueCell.className = 'numeric';
    tr.append(nameCell, valueCell);
    container.append(tr);
  });
}

function renderCreditUnionDetail(data, options = {}) {
  const { creditUnionName: fallbackName = null, start = null, end = null, error = null } = options;
  appState.creditUnionDetail = data ?? null;

  const summaryElement = selectors.creditUnionDetailSummary;
  const nameElement = selectors.creditUnionDetailName;
  const windowElement = selectors.creditUnionDetailWindow;
  const totalElement = selectors.creditUnionTotalRevenue;
  const streamsBody = selectors.creditUnionStreamsBody;
  const streamsSummary = selectors.creditUnionStreamsSummary;

  const resolvedName = data?.creditUnion?.name ?? fallbackName ?? 'Select a credit union';
  const totalRevenue = Number(data?.totalRevenue ?? 0);
  const streams = Array.isArray(data?.streams) ? data.streams : [];
  const reportingWindow = data?.reportingWindow ?? {};
  const resolvedStart = reportingWindow.start ?? start ?? null;
  const resolvedEnd = reportingWindow.end ?? end ?? null;

  if (data?.creditUnion?.name) {
    appState.detailCreditUnionName = data.creditUnion.name;
  } else if (fallbackName) {
    appState.detailCreditUnionName = fallbackName;
  }
  appState.detailStart = resolvedStart;
  appState.detailEnd = resolvedEnd;

  if (summaryElement) {
    if (error) {
      summaryElement.textContent = error;
    } else if (data) {
      summaryElement.textContent = 'Every income stream tied to this credit union is listed below.';
    } else {
      summaryElement.textContent =
        'Choose a credit union from the Reporting view to load revenue totals by income stream.';
    }
  }

  if (nameElement) {
    nameElement.textContent = resolvedName;
  }

  if (totalElement) {
    totalElement.textContent = currencyFormatter.format(totalRevenue);
  }

  if (windowElement) {
    const startLabel = resolvedStart ? formatMonthLabelFromKey(resolvedStart) : null;
    const endLabel = resolvedEnd ? formatMonthLabelFromKey(resolvedEnd) : null;
    let windowLabel = 'All recorded months';
    if (startLabel && endLabel) {
      windowLabel = `${startLabel} – ${endLabel}`;
    } else if (startLabel) {
      windowLabel = `Since ${startLabel}`;
    } else if (endLabel) {
      windowLabel = `Through ${endLabel}`;
    }
    windowElement.textContent = windowLabel;
  }

  if (streamsSummary) {
    if (error) {
      streamsSummary.textContent = 'Unable to load income streams for this credit union.';
    } else if (!data) {
      streamsSummary.textContent = 'Income streams will appear once you open this page from the Reporting table.';
    } else if (!streams.length) {
      streamsSummary.textContent = 'No income streams have been created for this credit union yet.';
    } else {
      streamsSummary.textContent =
        'Revenue totals reflect the selected reporting window for every income stream tied to this credit union.';
    }
  }

  if (streamsBody) {
    streamsBody.replaceChildren();

    if (!data) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = error
        ? 'We could not load the credit union revenue breakdown.'
        : 'Select a credit union from the Reporting tab to view its income streams.';
      row.append(cell);
      streamsBody.append(row);
      return;
    }

    if (!streams.length) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 3;
      cell.textContent = 'No income streams found for this credit union yet.';
      row.append(cell);
      streamsBody.append(row);
      return;
    }

    streams.forEach((stream) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      const amountCell = document.createElement('td');
      const percentCell = document.createElement('td');

      const labelSegments = [stream.product, stream.revenueType].filter(Boolean);
      const label = labelSegments.join(' · ');
      const link = document.createElement('a');
      link.href = `stream.html?id=${encodeURIComponent(stream.id)}`;
      link.className = 'table-link';
      link.textContent = label || 'Income stream';
      link.setAttribute(
        'aria-label',
        `View reporting history for ${label || 'this income stream'}`
      );
      nameCell.append(link);

      const amount = Number(stream.amount ?? 0);
      amountCell.textContent = currencyFormatter.format(amount);
      amountCell.className = 'numeric';

      percentCell.className = 'numeric';
      if (totalRevenue > 0 && amount > 0) {
        const percentage = (amount / totalRevenue) * 100;
        percentCell.textContent = `${percentage.toFixed(1)}%`;
      } else {
        percentCell.textContent = '0.0%';
      }

      row.append(nameCell, amountCell, percentCell);
      streamsBody.append(row);
    });
  }
}

async function loadCreditUnionRevenueDetail(creditUnionId, options = {}) {
  if (!creditUnionId) {
    renderCreditUnionDetail(null, options);
    return;
  }

  const params = new URLSearchParams();
  if (options.start) {
    params.set('start', options.start);
  }
  if (options.end) {
    params.set('end', options.end);
  }

  const query = params.toString();
  const data = await request(
    `/api/reports/credit-union/${encodeURIComponent(creditUnionId)}${query ? `?${query}` : ''}`
  );

  const creditUnionName = data?.creditUnion?.name ?? options.creditUnionName ?? null;
  renderCreditUnionDetail(data, {
    ...options,
    creditUnionName,
    start: options.start,
    end: options.end
  });
}

function renderLineChart(svg, data = [], options = {}) {
  if (!svg) return;

  const {
    emptyMessage = 'No data available',
    valueKey = 'amount',
    width = 800,
    height = 240,
    padding = 40,
    lineColor = 'rgba(79, 195, 247, 0.9)',
    areaColor = 'rgba(79, 195, 247, 0.16)'
  } = options;

  svg.replaceChildren();
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  if (!Array.isArray(data) || !data.length) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '50%');
    text.setAttribute('y', '50%');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'var(--text-secondary)');
    text.setAttribute('font-size', '18');
    text.textContent = emptyMessage;
    svg.append(text);
    return;
  }

  const normalized = data.map((entry) => {
    const rawValue = Number(entry?.[valueKey]);
    const value = Number.isFinite(rawValue) ? rawValue : 0;
    return {
      key: entry?.key ?? null,
      label: entry?.label ?? (entry?.key ?? ''),
      value
    };
  });

  const values = normalized.map((item) => item.value);
  const maxAmount = Math.max(...values);
  const minAmount = Math.min(...values);
  const range = maxAmount === minAmount ? Math.abs(maxAmount) || 1 : maxAmount - minAmount;
  const horizontalSteps = Math.max(normalized.length - 1, 1);

  const points = normalized.map((entry, index) => {
    const x = padding + (index / horizontalSteps) * (width - padding * 2);
    const y = height - padding - ((entry.value - minAmount) / range) * (height - padding * 2);
    return { x, y, label: entry.label, value: entry.value };
  });

  const axis = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  axis.setAttribute('d', `M ${padding} ${height - padding} H ${width - padding}`);
  axis.setAttribute('stroke', 'rgba(255,255,255,0.25)');
  axis.setAttribute('stroke-width', '1.5');
  axis.setAttribute('fill', 'none');
  svg.append(axis);

  const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const areaPoints = [
    `M ${padding} ${height - padding}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${width - padding} ${height - padding}`,
    'Z'
  ].join(' ');
  areaPath.setAttribute('d', areaPoints);
  areaPath.setAttribute('fill', areaColor);
  svg.append(areaPath);

  const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const lineCommands = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  linePath.setAttribute('d', lineCommands);
  linePath.setAttribute('stroke', lineColor);
  linePath.setAttribute('stroke-width', '3');
  linePath.setAttribute('fill', 'none');
  svg.append(linePath);

  points.forEach((point) => {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', point.x);
    dot.setAttribute('cy', point.y);
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', 'var(--accent)');
    svg.append(dot);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', point.x);
    label.setAttribute('y', height - padding + 20);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', 'var(--text-secondary)');
    label.setAttribute('font-size', '11');
    label.textContent = point.label;
    svg.append(label);
  });
}

function renderTimeline(timeline) {
  if (!selectors.timelineChart) return;
  renderLineChart(selectors.timelineChart, timeline, {
    emptyMessage: 'No revenue recorded for this period'
  });
}

function renderStreamPerformance(months = []) {
  const chart = selectors.streamPerformanceChart;
  const summary = selectors.streamPerformanceSummary;

  if (!chart && !summary) {
    return;
  }

  const dataset = Array.isArray(months)
    ? months.map((month) => {
        const hasAmount = month.amount !== null && month.amount !== undefined;
        const amount = hasAmount ? Number(month.amount) : 0;
        return {
          key: month.key,
          label: month.label,
          amount: Number.isFinite(amount) ? amount : 0,
          completed: Boolean(month.completed),
          hasAmount
        };
      })
    : [];

  const hasRecordedData = dataset.some((month) => month.hasAmount);

  if (chart) {
    const chartData = hasRecordedData ? dataset : [];
    renderLineChart(chart, chartData, {
      emptyMessage: 'Monthly revenue will appear once amounts are recorded.'
    });
  }

  if (summary) {
    if (!dataset.length) {
      summary.textContent = 'No reporting requirements found for this income stream yet.';
      return;
    }

    if (!hasRecordedData) {
      summary.textContent = 'Revenue has not been recorded for any months yet.';
      return;
    }

    const recordedMonths = dataset.filter((month) => month.hasAmount);

    const totalAmount = recordedMonths.reduce((sum, month) => sum + month.amount, 0);
    const pendingCount = dataset.length - recordedMonths.length;
    let message = `${recordedMonths.length} recorded month${
      recordedMonths.length === 1 ? '' : 's'
    } · Total ${currencyFormatter.format(totalAmount)}.`;

    if (pendingCount > 0) {
      message += ` ${pendingCount} month${pendingCount === 1 ? '' : 's'} awaiting numbers.`;
    }

    summary.textContent = message;
  }
}

selectors.addCreditUnionBtn?.addEventListener('click', () => {
  selectors.creditUnionNameInput.value = '';
  showDialog(selectors.creditUnionDialog);
  setTimeout(() => selectors.creditUnionNameInput?.focus(), 75);
});

selectors.closeCreditUnionDialogBtn?.addEventListener('click', () => {
  closeDialog(selectors.creditUnionDialog);
});

selectors.creditUnionForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = selectors.creditUnionNameInput.value.trim();
  if (!name) return;
  try {
    await createCreditUnion(name);
    closeDialog(selectors.creditUnionDialog);
  } catch (error) {
    alert(error.message);
  }
});

selectors.cancelStreamBtn?.addEventListener('click', () => {
  if (!appState.currentStreamId || !selectors.cancelStreamDialog) return;

  if (selectors.cancelStreamMessage) {
    setFeedback(selectors.cancelStreamMessage, '', 'info');
  }

  if (selectors.cancelStreamInput) {
    selectors.cancelStreamInput.min = REPORTING_START_PERIOD;
    selectors.cancelStreamInput.max = getCurrentPeriodValue();

    const finalReport = appState.currentStreamDetail?.finalReport;
    if (finalReport?.year && finalReport?.month) {
      selectors.cancelStreamInput.value = formatPeriodValue(finalReport.year, finalReport.month);
    } else {
      const lastMonth = appState.currentStreamMonths[appState.currentStreamMonths.length - 1];
      if (lastMonth?.year && lastMonth?.month) {
        selectors.cancelStreamInput.value = formatPeriodValue(lastMonth.year, lastMonth.month);
      } else {
        selectors.cancelStreamInput.value = '';
      }
    }
  }

  showDialog(selectors.cancelStreamDialog);
  setTimeout(() => selectors.cancelStreamInput?.focus(), 75);
});

selectors.closeCancelStreamDialogBtn?.addEventListener('click', () => {
  closeDialog(selectors.cancelStreamDialog);
});

selectors.cancelStreamDialog?.addEventListener('close', () => {
  if (selectors.cancelStreamMessage) {
    setFeedback(selectors.cancelStreamMessage, '', 'info');
  }
});

selectors.cancelStreamForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!appState.currentStreamId || !selectors.cancelStreamInput) return;

  const finalMonth = selectors.cancelStreamInput.value;
  if (!finalMonth) {
    if (selectors.cancelStreamMessage) {
      setFeedback(selectors.cancelStreamMessage, 'Select the month when reporting ends.', 'error');
    }
    return;
  }

  try {
    const result = await cancelIncomeStream(appState.currentStreamId, finalMonth);
    renderStreamOverview(result);
    await Promise.all([
      loadIncomeStreamReportingStatus(appState.currentStreamId),
      loadIncomeStreams()
    ]);
    closeDialog(selectors.cancelStreamDialog);
  } catch (error) {
    if (selectors.cancelStreamMessage) {
      setFeedback(selectors.cancelStreamMessage, error.message, 'error');
    } else {
      alert(error.message);
    }
  }
});

selectors.reportingStatusGrid?.addEventListener('click', handleStatusCardActivation);
selectors.reportingStatusGrid?.addEventListener('keydown', handleStatusCardActivation);

selectors.closeEditRevenueDialogBtn?.addEventListener('click', () => {
  appState.editingPeriod = null;
  closeDialog(selectors.editRevenueDialog);
});

selectors.editRevenueDialog?.addEventListener('close', () => {
  appState.editingPeriod = null;
  if (selectors.editRevenueFeedback) {
    setFeedback(selectors.editRevenueFeedback, '', 'info');
  }
  if (selectors.editRevenueAmountInput) {
    selectors.editRevenueAmountInput.value = '';
  }
});

selectors.editRevenueForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!appState.currentStreamId || !appState.editingPeriod || !selectors.editRevenueAmountInput) {
    return;
  }

  const rawAmount = selectors.editRevenueAmountInput.value.trim();
  if (!rawAmount) {
    if (selectors.editRevenueFeedback) {
      setFeedback(selectors.editRevenueFeedback, 'Enter an amount to save.', 'error');
    }
    return;
  }

  const amount = Number(rawAmount);
  if (!Number.isFinite(amount)) {
    if (selectors.editRevenueFeedback) {
      setFeedback(selectors.editRevenueFeedback, 'Amount must be a valid number.', 'error');
    }
    return;
  }

  try {
    await saveRevenueEntry({
      incomeStreamId: appState.currentStreamId,
      year: appState.editingPeriod.year,
      month: appState.editingPeriod.month,
      amount
    });

    closeDialog(selectors.editRevenueDialog);
    appState.editingPeriod = null;
    await loadIncomeStreamDetail(appState.currentStreamId);
    await loadIncomeStreamReportingStatus(appState.currentStreamId);
    await loadIncomeStreams();
  } catch (error) {
    if (selectors.editRevenueFeedback) {
      setFeedback(selectors.editRevenueFeedback, error.message, 'error');
    } else {
      alert(error.message);
    }
  }
});

selectors.incomeStreamForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const creditUnionId = form.creditUnionId.value;
  const product = form.product.value;
  const revenueType = form.revenueType.value;

  if (!creditUnionId || !product || !revenueType) {
    alert('All fields are required.');
    return;
  }

  try {
    await createIncomeStream({ creditUnionId, product, revenueType });
    form.reset();
    setFeedback(selectors.revenueFeedback, 'Income stream created. You can start logging revenue.', 'success');
  } catch (error) {
    alert(error.message);
  }
});

selectors.prospectStreamForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const creditUnionId = form.creditUnionId.value;
  const product = form.product.value;
  const revenueType = form.revenueType.value;
  const monthlyIncomeEstimateValue = form.monthlyIncomeEstimate.value.trim();

  if (!creditUnionId || !product || !revenueType) {
    setFeedback(selectors.prospectFeedback, 'All fields except estimate are required.', 'error');
    return;
  }

  let monthlyIncomeEstimate = null;
  if (monthlyIncomeEstimateValue) {
    const parsed = Number(monthlyIncomeEstimateValue);
    if (!Number.isFinite(parsed)) {
      setFeedback(selectors.prospectFeedback, 'Monthly estimate must be a valid number.', 'error');
      return;
    }
    monthlyIncomeEstimate = parsed;
  }

  try {
    await createIncomeStream({
      creditUnionId,
      product,
      revenueType,
      status: 'prospect',
      monthlyIncomeEstimate
    });
    form.reset();
    setFeedback(selectors.prospectFeedback, 'Prospect income stream saved.', 'success');
    await loadProspectStreams();
  } catch (error) {
    setFeedback(
      selectors.prospectFeedback,
      error instanceof Error ? error.message : 'Unable to save prospect stream.',
      'error'
    );
  }
});

selectors.prospectAccountFilter?.addEventListener('input', (event) => {
  appState.prospectAccountFilter = event.currentTarget.value || '';
  renderProspectAccountList();
});

selectors.revenueForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const incomeStreamId = form.incomeStreamId.value;
  const period = form.period.value;
  const amount = form.amount.value;

  if (!incomeStreamId || !period || !amount) {
    setFeedback(selectors.revenueFeedback, 'Please select a stream, month, and enter an amount.', 'error');
    return;
  }

  const [year, month] = period.split('-').map((value) => Number.parseInt(value, 10));

  try {
    await saveRevenueEntry({ incomeStreamId, year, month, amount: Number(amount) });
    setFeedback(selectors.revenueFeedback, 'Revenue saved.', 'success');
    form.reset();
    await loadIncomeStreams();
    await loadSummary(appState.reportingWindow);
  } catch (error) {
    setFeedback(selectors.revenueFeedback, error.message, 'error');
  }
});

selectors.prospectAccountList?.addEventListener('submit', async (event) => {
  const form = event.target.closest('.prospect-estimate-form');
  if (!form) return;
  event.preventDefault();

  const streamId = form.dataset.streamId || form.closest('[data-stream-id]')?.dataset.streamId;
  const input = form.querySelector('input[name="monthlyIncomeEstimate"]');
  const feedback = form.querySelector('.prospect-feedback');

  if (!streamId || !input) {
    return;
  }

  const rawValue = input.value.trim();
  let parsedEstimate = null;

  if (rawValue) {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      setFeedback(feedback, 'Enter a valid number for the monthly estimate.', 'error');
      return;
    }
    parsedEstimate = parsed;
  }

  try {
    setFeedback(feedback, 'Saving estimate...', 'info');
    await updateProspectEstimate(streamId, parsedEstimate);
    setFeedback(feedback, 'Monthly estimate saved.', 'success');
  } catch (error) {
    setFeedback(feedback, error instanceof Error ? error.message : 'Unable to save estimate.', 'error');
  }
});

selectors.prospectAccountList?.addEventListener('click', async (event) => {
  const button = event.target.closest('.prospect-activate-btn');
  if (!button || !selectors.prospectAccountList?.contains(button)) {
    return;
  }

  const streamId = button.dataset.streamId || button.closest('[data-stream-id]')?.dataset.streamId;

  if (!streamId) {
    return;
  }

  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = 'Activating...';

  try {
    await activateProspectStream(streamId);
    await Promise.all([loadIncomeStreams(), loadProspectStreams()]);
  } catch (error) {
    button.disabled = false;
    button.textContent = originalText;
    alert(error instanceof Error ? error.message : 'Unable to activate income stream.');
  }
});

selectors.reportingForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const start = form.start.value;
  const end = form.end.value;

  appState.reportingWindow = { start: start || null, end: end || null };

  try {
    await loadSummary({ ...appState.reportingWindow, creditUnionId: appState.selectedCreditUnion });
  } catch (error) {
    alert(error.message);
  }
});

selectors.reportingCreditUnionSelect?.addEventListener('change', async (event) => {
  const select = event.currentTarget;
  appState.selectedCreditUnion = select.value || 'all';

  try {
    await loadSummary({ ...appState.reportingWindow, creditUnionId: appState.selectedCreditUnion });
  } catch (error) {
    alert(error.message);
  }
});

async function bootstrap() {
  populateStaticOptions();
  appState.monthlyDetailMonthKey = getMonthFromQuery();
  appState.detailCreditUnionId = getDetailCreditUnionIdFromQuery();
  appState.detailCreditUnionName = getDetailCreditUnionNameFromQuery();
  appState.detailStart = getDetailStartFromQuery();
  appState.detailEnd = getDetailEndFromQuery();
  try {
    await Promise.all([loadCreditUnions(), loadIncomeStreams()]);
  } catch (error) {
    console.error(error);
  }

  if (appState.detailCreditUnionId) {
    const resolvedName = getCreditUnionNameById(appState.detailCreditUnionId);
    if (resolvedName) {
      appState.detailCreditUnionName = resolvedName;
    }
  }

  try {
    const now = new Date();
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    appState.reportingWindow = { start, end };
    if (selectors.reportingForm) {
      selectors.reportingForm.start.value = start;
      selectors.reportingForm.end.value = end;
    }

    if (selectors.reportingCreditUnionSelect) {
      if (!selectors.reportingCreditUnionSelect.value) {
        selectors.reportingCreditUnionSelect.value = 'all';
      }
      appState.selectedCreditUnion = selectors.reportingCreditUnionSelect.value || 'all';
    }

    const shouldLoadSummary =
      Boolean(
        selectors.totalRevenue ||
          selectors.topCreditUnion ||
          selectors.topProduct ||
          selectors.creditUnionSummary ||
          selectors.productSummary ||
          selectors.typeSummary ||
          selectors.timelineChart ||
          selectors.monthlyCompletionBody ||
          selectors.reportingCreditUnionSelect
      );

    if (shouldLoadSummary) {
      await loadSummary({ ...appState.reportingWindow, creditUnionId: appState.selectedCreditUnion });
    }
  } catch (error) {
    console.error(error);
  }

  if (selectors.monthlyCompletionBody && (!appState.monthlyCompletion || !appState.monthlyCompletion.length)) {
    try {
      await loadMonthlyCompletion({ ...appState.reportingWindow, creditUnionId: appState.selectedCreditUnion });
    } catch (error) {
      console.error(error);
    }
  }

  if (selectors.prospectAccountList) {
    try {
      await loadProspectStreams();
    } catch (error) {
      console.error(error);
    }
  }

  if (selectors.monthlyDetailBody) {
    if (appState.monthlyDetailMonthKey) {
      try {
        await loadMonthlyDetail(appState.monthlyDetailMonthKey, appState.detailCreditUnionId);
      } catch (error) {
        console.error(error);
        renderMonthlyDetail(null, {
          monthKey: appState.monthlyDetailMonthKey,
          creditUnionId: appState.detailCreditUnionId,
          creditUnionName: appState.detailCreditUnionName,
          error: error.message
        });
      }
    } else {
      renderMonthlyDetail(null, { creditUnionId: appState.detailCreditUnionId, creditUnionName: appState.detailCreditUnionName });
    }
  }

  if (selectors.creditUnionStreamsBody) {
    if (appState.detailCreditUnionId) {
      try {
        await loadCreditUnionRevenueDetail(appState.detailCreditUnionId, {
          creditUnionName: appState.detailCreditUnionName,
          start: appState.detailStart,
          end: appState.detailEnd
        });
      } catch (error) {
        console.error(error);
        renderCreditUnionDetail(null, {
          creditUnionName: appState.detailCreditUnionName,
          start: appState.detailStart,
          end: appState.detailEnd,
          error: error.message
        });
      }
    } else {
      renderCreditUnionDetail(null, {
        creditUnionName: appState.detailCreditUnionName,
        start: appState.detailStart,
        end: appState.detailEnd
      });
    }
  }

  if (selectors.streamName) {
    const streamId = getStreamIdFromQuery();
    if (streamId) {
      try {
        await loadIncomeStreamDetail(streamId);
        await loadIncomeStreamReportingStatus(streamId);
      } catch (error) {
        console.error(error);
        if (selectors.streamName) {
          selectors.streamName.textContent = 'Income stream not found';
        }
        if (selectors.reportingStatusSummary) {
          selectors.reportingStatusSummary.textContent = error.message;
        }
        if (selectors.cancelStreamBtn) {
          selectors.cancelStreamBtn.hidden = true;
        }
      }
    } else {
      selectors.streamName.textContent = 'Income stream not found';
      if (selectors.reportingStatusSummary) {
        selectors.reportingStatusSummary.textContent =
          'Use the income stream list to choose a reporting view.';
      }
      if (selectors.cancelStreamBtn) {
        selectors.cancelStreamBtn.hidden = true;
      }
    }
  }
}

bootstrap();
