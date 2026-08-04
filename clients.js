const state = {
  clients: [],
  meta: {},
  historyCycles: [],
  aggregateHistory: [],
  selectedMetric: 'loans',
  search: ''
};

const metricDefinitions = {
  loans: { label: 'Total Loans', shortLabel: 'Loans', formatter: money, axisFormatter: compactMoney },
  assets: { label: 'Total Assets', shortLabel: 'Assets', formatter: money, axisFormatter: compactMoney },
  members: { label: 'Total Members', shortLabel: 'Members', formatter: count, axisFormatter: compactCount }
};

const $ = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const percentage = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function numericValue(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function money(value) {
  return Number.isFinite(value) ? currency.format(value) : '—';
}

function count(value) {
  return Number.isFinite(value) ? number.format(value) : '—';
}

function compactMoney(value) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value)
    : '—';
}

function compactCount(value) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    : '—';
}

function signedPercent(value) {
  if (!Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${percentage.format(value)}%`;
}

function growthClass(value) {
  if (!Number.isFinite(value) || Math.abs(value) < 0.05) return 'growth-flat';
  return value > 0 ? 'growth-up' : 'growth-down';
}

function cycleLabel(cycle) {
  const match = String(cycle || '').match(/^(\d{4})-(\d{2})$/);
  if (!match) return cycle || '—';
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

async function api(path) {
  const response = await fetch(path, { headers: { Accept: 'application/json' } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

function sumMetric(records, key) {
  return records.reduce((total, record) => {
    const value = numericValue(record?.[key]);
    return Number.isFinite(value) ? total + value : total;
  }, 0);
}

function metricCoverage(records, key) {
  return records.filter((record) => Number.isFinite(numericValue(record?.[key]))).length;
}

function resolveHistoryCycles(payload, clients) {
  const configured = Array.isArray(payload.historyCycles) ? payload.historyCycles : [];
  const discovered = clients.flatMap((client) => Array.isArray(client.history)
    ? client.history.map((row) => row?.cycle).filter(Boolean)
    : []);
  return [...new Set(configured.length ? configured : discovered)].sort().slice(-6);
}

function aggregateClientHistory(clients, cycles) {
  const histories = clients.map((client) => new Map(
    (Array.isArray(client.history) ? client.history : [])
      .filter((row) => row?.cycle)
      .map((row) => [row.cycle, row])
  ));

  return cycles.map((cycle) => {
    const point = {
      cycle,
      assets: 0,
      loans: 0,
      members: 0,
      coverage: { assets: 0, loans: 0, members: 0 }
    };

    histories.forEach((history) => {
      const row = history.get(cycle);
      ['assets', 'loans', 'members'].forEach((key) => {
        const value = numericValue(row?.[key]);
        if (!Number.isFinite(value)) return;
        point[key] += value;
        point.coverage[key] += 1;
      });
    });

    ['assets', 'loans', 'members'].forEach((key) => {
      if (!point.coverage[key]) point[key] = null;
    });

    return point;
  });
}

function calculateGrowth(history, key) {
  const values = history
    .map((point) => Number(point?.[key]))
    .filter(Number.isFinite);
  if (values.length < 2 || values[0] === 0) return null;
  return ((values.at(-1) - values[0]) / Math.abs(values[0])) * 100;
}

function renderKpis() {
  const totalLoans = sumMetric(state.clients, 'loans');
  const indirectLoans = sumMetric(state.clients, 'indirectAuto');
  const loanCoverage = metricCoverage(state.clients, 'loans');
  const indirectCoverage = metricCoverage(state.clients, 'indirectAuto');

  $('total-client-loans').textContent = money(totalLoans);
  $('total-client-loans-note').textContent = `${count(loanCoverage)} of ${count(state.clients.length)} clients have current loan balances.`;
  $('total-indirect-loans').textContent = money(indirectLoans);
  $('total-indirect-loans-note').textContent = `${count(indirectCoverage)} of ${count(state.clients.length)} clients have reported indirect auto balances.`;
}

function chartPath(points, x, y, key) {
  return points
    .map((point, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(2)} ${y(point[key]).toFixed(2)}`)
    .join(' ');
}

function renderTrajectory() {
  const definition = metricDefinitions[state.selectedMetric];
  const points = state.aggregateHistory.filter((point) => Number.isFinite(point?.[state.selectedMetric]));
  const chart = $('trajectory-chart');
  const empty = $('trajectory-empty');

  document.querySelectorAll('[data-metric]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.metric === state.selectedMetric));
  });

  $('trajectory-title').textContent = `Five-Year Client ${definition.shortLabel} Trajectory`;

  if (points.length < 2) {
    chart.innerHTML = '';
    chart.hidden = true;
    empty.hidden = false;
    $('trajectory-start').textContent = '—';
    $('trajectory-current').textContent = '—';
    $('trajectory-growth').textContent = '—';
    $('trajectory-coverage').textContent = 'Not enough historical data is available to calculate this trajectory.';
    return;
  }

  empty.hidden = true;
  chart.hidden = false;

  const key = state.selectedMetric;
  const width = 1000;
  const height = 360;
  const margin = { top: 28, right: 32, bottom: 62, left: 104 };
  const values = points.map((point) => point[key]);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const range = Math.max(rawMax - rawMin, Math.abs(rawMax) * 0.02, 1);
  const min = Math.max(0, rawMin - range * 0.14);
  const max = rawMax + range * 0.14;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const x = (index) => margin.left + (plotWidth * (index / Math.max(points.length - 1, 1)));
  const y = (value) => margin.top + plotHeight - (((value - min) / Math.max(max - min, 1)) * plotHeight);
  const path = chartPath(points, x, y, key);
  const areaPath = `${path} L ${x(points.length - 1).toFixed(2)} ${(margin.top + plotHeight).toFixed(2)} L ${x(0).toFixed(2)} ${(margin.top + plotHeight).toFixed(2)} Z`;
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, index) => min + ((max - min) * index / (tickCount - 1))).reverse();
  const yGrid = ticks.map((value) => {
    const yValue = y(value).toFixed(2);
    return `<g><line class="trajectory-gridline" x1="${margin.left}" y1="${yValue}" x2="${width - margin.right}" y2="${yValue}"></line><text class="trajectory-axis-label" x="${margin.left - 14}" y="${yValue}" text-anchor="end" dominant-baseline="middle">${escapeHtml(definition.axisFormatter(value))}</text></g>`;
  }).join('');
  const xLabels = points.map((point, index) => `<text class="trajectory-axis-label trajectory-axis-label--x" x="${x(index).toFixed(2)}" y="${height - 24}" text-anchor="middle">${escapeHtml(cycleLabel(point.cycle))}</text>`).join('');
  const circles = points.map((point, index) => {
    const coverage = point.coverage?.[key] || 0;
    return `<circle class="trajectory-point" cx="${x(index).toFixed(2)}" cy="${y(point[key]).toFixed(2)}" r="5"><title>${escapeHtml(`${cycleLabel(point.cycle)}: ${definition.formatter(point[key])} across ${coverage} clients`)}</title></circle>`;
  }).join('');

  chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  chart.setAttribute('aria-label', `${definition.label} across current clients from ${cycleLabel(points[0].cycle)} through ${cycleLabel(points.at(-1).cycle)}`);
  chart.innerHTML = `${yGrid}<path class="trajectory-area" d="${areaPath}"></path><path class="trajectory-line" d="${path}"></path>${circles}${xLabels}`;

  const growth = calculateGrowth(points, key);
  $('trajectory-start-label').textContent = cycleLabel(points[0].cycle);
  $('trajectory-current-label').textContent = cycleLabel(points.at(-1).cycle);
  $('trajectory-start').textContent = definition.formatter(points[0][key]);
  $('trajectory-current').textContent = definition.formatter(points.at(-1)[key]);
  $('trajectory-growth').textContent = signedPercent(growth);
  $('trajectory-growth').className = `trajectory-summary-value ${growthClass(growth)}`;

  const coverages = points.map((point) => point.coverage?.[key] || 0);
  const minimumCoverage = Math.min(...coverages);
  const maximumCoverage = Math.max(...coverages);
  $('trajectory-coverage').textContent = minimumCoverage === state.clients.length && maximumCoverage === state.clients.length
    ? `All ${count(state.clients.length)} current clients are represented in every period.`
    : `${count(minimumCoverage)}–${count(maximumCoverage)} of ${count(state.clients.length)} current clients are represented per period.`;
}

function clientSearchText(client) {
  return [
    client.name,
    client.charterNumber,
    client.street,
    client.city,
    client.state,
    client.owner,
    ...(client.tags || [])
  ].join(' ').toLowerCase();
}

function renderClientTable() {
  const query = state.search.trim().toLowerCase();
  const visible = state.clients.filter((client) => !query || clientSearchText(client).includes(query));
  $('client-result-count').textContent = `${count(visible.length)} of ${count(state.clients.length)} clients shown`;

  if (!visible.length) {
    $('client-table-body').innerHTML = '';
    $('client-table-wrap').hidden = true;
    $('client-list-empty').hidden = false;
    $('client-list-empty').querySelector('p').textContent = state.clients.length
      ? 'No clients match this search.'
      : 'No credit unions are currently classified as Client. Update an account in the Dashboard to populate this page.';
    return;
  }

  $('client-table-wrap').hidden = false;
  $('client-list-empty').hidden = true;
  $('client-table-body').innerHTML = visible.map((client) => {
    const indirectAuto = numericValue(client.indirectAuto);
    const totalAuto = numericValue(client.totalAuto);
    const indirectShare = Number.isFinite(indirectAuto) && Number.isFinite(totalAuto) && totalAuto > 0
      ? (indirectAuto / totalAuto) * 100
      : null;
    const loanGrowth = numericValue(client.growth?.loans?.fiveYearPct);
    const assetGrowth = numericValue(client.growth?.assets?.fiveYearPct);
    const owner = client.owner ? `<span class="client-meta-line">Owner: ${escapeHtml(client.owner)}</span>` : '';
    const tags = Array.isArray(client.tags) && client.tags.length
      ? `<span class="client-meta-line">${escapeHtml(client.tags.join(' · '))}</span>`
      : '';

    return `<tr data-client-charter="${escapeHtml(client.charterNumber)}" data-client-name="${escapeHtml(client.name)}">
      <td><strong class="client-name">${escapeHtml(client.name)}</strong><span class="client-meta-line">Charter ${escapeHtml(client.charterNumber)}</span>${owner}${tags}</td>
      <td class="client-training-cell" data-client-training-cell><button type="button" class="client-training-button" data-open-client-training>Open Log</button><span class="client-training-count" data-client-training-count>Loading…</span></td>
      <td>${escapeHtml([client.city, client.state].filter(Boolean).join(', ') || '—')}</td>
      <td class="numeric">${escapeHtml(money(numericValue(client.assets)))}</td>
      <td class="numeric">${escapeHtml(money(numericValue(client.loans)))}</td>
      <td class="numeric">${escapeHtml(money(indirectAuto))}</td>
      <td class="numeric">${escapeHtml(Number.isFinite(indirectShare) ? `${percentage.format(indirectShare)}%` : '—')}</td>
      <td class="numeric ${growthClass(loanGrowth)}">${escapeHtml(signedPercent(loanGrowth))}</td>
      <td class="numeric ${growthClass(assetGrowth)}">${escapeHtml(signedPercent(assetGrowth))}</td>
    </tr>`;
  }).join('');
}

function renderPage() {
  renderKpis();
  renderTrajectory();
  renderClientTable();

  const cycle = state.meta.cycle ? cycleLabel(state.meta.cycle) : 'latest available cycle';
  const generated = state.meta.generatedAt ? ` · synchronized ${new Date(state.meta.generatedAt).toLocaleString()}` : '';
  $('client-data-meta').textContent = `${count(state.clients.length)} active clients · NCUA ${cycle}${generated}`;
}

async function loadClients() {
  const refreshButton = $('refresh-clients');
  refreshButton.disabled = true;
  refreshButton.textContent = 'Refreshing…';
  $('client-data-meta').textContent = 'Loading client classifications and NCUA history…';

  try {
    const payload = await api('/api/ncua-credit-unions');
    const { creditUnions, ...meta } = payload;
    state.meta = meta;
    state.clients = (Array.isArray(creditUnions) ? creditUnions : [])
      .filter((creditUnion) => creditUnion.salesStatus === 'Client' && !creditUnion.hidden)
      .sort((a, b) => (Number(b.loans) || 0) - (Number(a.loans) || 0) || String(a.name).localeCompare(String(b.name)));
    state.historyCycles = resolveHistoryCycles(payload, state.clients);
    state.aggregateHistory = aggregateClientHistory(state.clients, state.historyCycles);
    renderPage();
  } catch (error) {
    $('client-data-meta').textContent = error.message;
    $('total-client-loans').textContent = 'Unavailable';
    $('total-indirect-loans').textContent = 'Unavailable';
    $('trajectory-chart').hidden = true;
    $('trajectory-empty').hidden = false;
    $('trajectory-empty').querySelector('p').textContent = 'Client history could not be loaded.';
    $('client-table-wrap').hidden = true;
    $('client-list-empty').hidden = false;
    $('client-list-empty').querySelector('p').textContent = error.message;
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = 'Refresh Data';
  }
}

document.querySelectorAll('[data-metric]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!metricDefinitions[button.dataset.metric]) return;
    state.selectedMetric = button.dataset.metric;
    renderTrajectory();
  });
});

$('client-search').addEventListener('input', (event) => {
  state.search = event.target.value;
  renderClientTable();
});

$('refresh-clients').addEventListener('click', loadClients);
loadClients();
