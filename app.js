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
  totalRevenue: document.getElementById('total-revenue'),
  topCreditUnion: document.getElementById('top-credit-union'),
  topProduct: document.getElementById('top-product'),
  creditUnionSummary: document.getElementById('credit-union-summary'),
  productSummary: document.getElementById('product-summary'),
  typeSummary: document.getElementById('type-summary'),
  timelineChart: document.getElementById('revenue-timeline-chart'),
  incomeStreamTemplate: document.getElementById('income-stream-template')
};

const appState = {
  creditUnions: [],
  incomeStreams: [],
  summary: null,
  reportingWindow: { start: null, end: null }
};

function showDialog(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
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
  selectors.productSelect.replaceChildren(
    createOption('', 'Select a product', true, true),
    ...PRODUCT_OPTIONS.map((option) => createOption(option, option))
  );

  selectors.revenueTypeSelect.replaceChildren(
    createOption('', 'Select type', true, true),
    ...REVENUE_TYPES.map((type) => createOption(type, type))
  );
}

function createOption(value, label, disabled = false, selected = false) {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = label;
  option.disabled = disabled;
  option.selected = selected;
  return option;
}

function renderCreditUnionOptions() {
  const select = selectors.creditUnionSelect;
  const revenueSelect = selectors.revenueStreamSelect;
  if (!select || !revenueSelect) return;

  const placeholder = createOption('', 'Select a credit union', true, true);
  const revenuePlaceholder = createOption('', 'Select income stream', true, true);

  select.replaceChildren(placeholder);

  appState.creditUnions
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((creditUnion) => {
      select.append(createOption(creditUnion.id, creditUnion.name));
    });

  const currentIncomeStream = revenueSelect.value;
  revenueSelect.replaceChildren(revenuePlaceholder);

  appState.incomeStreams
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label))
    .forEach((stream) => {
      const option = createOption(stream.id, stream.label);
      revenueSelect.append(option);
      if (stream.id === currentIncomeStream) {
        option.selected = true;
      }
    });
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
    selectors.incomeStreamCount.textContent = '0 streams';
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
      const title = fragment.querySelector('.item__title');
      const subtitle = fragment.querySelector('.item__subtitle');
      const metric = fragment.querySelector('.item__metric');

      title.textContent = stream.label;
      subtitle.textContent = `${stream.creditUnionName} • ${stream.product} • ${stream.revenueType}`;

      if (stream.lastReport) {
        const { month, year, amount } = stream.lastReport;
        metric.textContent = `${currencyFormatter.format(amount)} in ${formatPeriodLabel(year, month)}`;
      } else {
        metric.textContent = 'No revenue logged yet';
      }

      list.append(fragment);
    });

  selectors.incomeStreamCount.textContent = `${formatter.format(appState.incomeStreams.length)} stream${
    appState.incomeStreams.length === 1 ? '' : 's'
  }`;
}

function formatPeriodLabel(year, month) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
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
    lastReport: stream.lastReport
      ? {
          amount: Number(stream.lastReport.amount),
          month: stream.lastReport.month,
          year: stream.lastReport.year
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
    lastReport: null
  });

  renderCreditUnionOptions();
  renderIncomeStreamList();
  selectors.revenueStreamSelect.value = result.id;
}

async function saveRevenueEntry(payload) {
  await request('/api/revenue', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function loadSummary(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.start) searchParams.set('start', params.start);
  if (params.end) searchParams.set('end', params.end);
  const query = searchParams.toString();
  const data = await request(`/api/reports/summary${query ? `?${query}` : ''}`);
  appState.summary = data;
  renderSummary();
}

function renderSummary() {
  const summary = appState.summary;
  if (!summary) return;

  selectors.totalRevenue.textContent = currencyFormatter.format(summary.totalRevenue || 0);

  if (summary.byCreditUnion?.length) {
    selectors.topCreditUnion.textContent = `${summary.byCreditUnion[0].name} (${currencyFormatter.format(
      summary.byCreditUnion[0].amount
    )})`;
  } else {
    selectors.topCreditUnion.textContent = 'Waiting for data';
  }

  if (summary.byProduct?.length) {
    selectors.topProduct.textContent = `${summary.byProduct[0].name} (${currencyFormatter.format(
      summary.byProduct[0].amount
    )})`;
  } else {
    selectors.topProduct.textContent = 'Waiting for data';
  }

  renderSummaryTable(selectors.creditUnionSummary, summary.byCreditUnion);
  renderSummaryTable(selectors.productSummary, summary.byProduct);
  renderSummaryTable(selectors.typeSummary, summary.byRevenueType);
  renderTimeline(summary.timeline || []);
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

function renderTimeline(timeline) {
  const svg = selectors.timelineChart;
  if (!svg) return;

  svg.replaceChildren();

  if (!timeline.length) {
    svg.setAttribute('viewBox', '0 0 600 240');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '50%');
    text.setAttribute('y', '50%');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'rgba(255,255,255,0.6)');
    text.setAttribute('font-size', '18');
    text.textContent = 'No revenue recorded for this period';
    svg.append(text);
    return;
  }

  const width = 800;
  const height = 240;
  const padding = 40;

  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const maxAmount = Math.max(...timeline.map((entry) => entry.amount));
  const minAmount = Math.min(...timeline.map((entry) => entry.amount));
  const range = maxAmount === minAmount ? maxAmount || 1 : maxAmount - minAmount;

  const points = timeline.map((entry, index) => {
    const x = padding + (index / Math.max(timeline.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((entry.amount - minAmount) / range) * (height - padding * 2);
    return { x, y, label: entry.label, amount: entry.amount };
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
  areaPath.setAttribute('fill', 'rgba(79, 195, 247, 0.16)');
  svg.append(areaPath);

  const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const lineCommands = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  linePath.setAttribute('d', lineCommands);
  linePath.setAttribute('stroke', 'rgba(79, 195, 247, 0.9)');
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
    label.setAttribute('fill', 'rgba(255,255,255,0.65)');
    label.setAttribute('font-size', '11');
    label.textContent = point.label;
    svg.append(label);
  });
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
    await loadSummary(appState.reportingWindow);
  } catch (error) {
    alert(error.message);
  }
});

async function bootstrap() {
  populateStaticOptions();
  try {
    await Promise.all([loadCreditUnions(), loadIncomeStreams()]);
  } catch (error) {
    console.error(error);
  }

  try {
    const now = new Date();
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const start = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    appState.reportingWindow = { start, end };
    selectors.reportingForm.start.value = start;
    selectors.reportingForm.end.value = end;
    await loadSummary(appState.reportingWindow);
  } catch (error) {
    console.error(error);
  }
}

bootstrap();
