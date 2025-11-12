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
  incomeStreamForm: document.getElementById('income-stream-form'),
  incomeStreamList: document.getElementById('income-stream-list'),
  incomeStreamCount: document.getElementById('income-stream-count'),
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
  detailCreditUnionName: null
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

  if (selectors.revenueTypeSelect) {
    selectors.revenueTypeSelect.replaceChildren(
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

function renderCreditUnionOptions() {
  const select = selectors.creditUnionSelect;
  const revenueSelect = selectors.revenueStreamSelect;
  const reportingSelect = selectors.reportingCreditUnionSelect;

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
}

async function loadIncomeStreams() {
  const data = await request('/api/income-streams');
  appState.incomeStreams = data.map((stream) => ({
    id: stream.id,
    label: stream.label,
    creditUnionId: stream.creditUnionId,
    creditUnionName: stream.creditUnionName,
    product: stream.product,
    revenueType: stream.revenueType,
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
}

async function createCreditUnion(name) {
  const result = await request('/api/credit-unions', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
  appState.creditUnions.push({ id: result.id, name: result.name });
  renderCreditUnionOptions();
  selectors.creditUnionSelect.value = result.id;
}

async function createIncomeStream(payload) {
  const result = await request('/api/income-streams', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  appState.incomeStreams.push({
    id: result.id,
    label: result.label,
    creditUnionId: result.creditUnionId,
    creditUnionName: result.creditUnionName,
    product: result.product,
    revenueType: result.revenueType,
    updatedAt: result.updatedAt ? new Date(result.updatedAt).getTime() : Date.now(),
    pendingCount: Number(result.pendingCount ?? 0),
    lastReport: null
  });

  renderCreditUnionOptions();
  renderIncomeStreamList();
  if (selectors.revenueStreamSelect) {
    selectors.revenueStreamSelect.value = result.id;
  }
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

  renderSummaryTable(selectors.creditUnionSummary, summary.byCreditUnion);
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
    nameCell.textContent = row.name;
    valueCell.textContent = currencyFormatter.format(row.amount);
    valueCell.className = 'numeric';
    tr.append(nameCell, valueCell);
    container.append(tr);
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
