const projectionState = {
  clients: [],
  cycles: [],
  aggregateHistory: [],
  payloadLoaded: false,
  renderTimer: null,
  lastSignature: ''
};

const projectionMetricDefinitions = {
  loans: { label: 'Total Loans', shortLabel: 'Loans', formatter: projectionMoney, axisFormatter: projectionCompactMoney },
  assets: { label: 'Total Assets', shortLabel: 'Assets', formatter: projectionMoney, axisFormatter: projectionCompactMoney },
  members: { label: 'Total Members', shortLabel: 'Members', formatter: projectionCount, axisFormatter: projectionCompactCount }
};

const projectionCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});
const projectionNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const projectionPercent = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

function projectionEscape(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function projectionNumeric(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function projectionMoney(value) {
  return Number.isFinite(value) ? projectionCurrency.format(value) : '—';
}

function projectionCount(value) {
  return Number.isFinite(value) ? projectionNumber.format(value) : '—';
}

function projectionCompactMoney(value) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value)
    : '—';
}

function projectionCompactCount(value) {
  return Number.isFinite(value)
    ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
    : '—';
}

function projectionCycleLabel(cycle) {
  const match = String(cycle || '').match(/^(\d{4})-(\d{2})$/);
  if (!match) return cycle || '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)));
}

function projectionResolveCycles(payload, clients) {
  const configured = Array.isArray(payload.historyCycles) ? payload.historyCycles : [];
  const discovered = clients.flatMap((client) => Array.isArray(client.history)
    ? client.history.map((row) => row?.cycle).filter(Boolean)
    : []);
  return [...new Set(configured.length ? configured : discovered)].sort().slice(-6);
}

function projectionAggregate(clients, cycles) {
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
        const value = projectionNumeric(row?.[key]);
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

function projectionCurrentMetric() {
  return document.querySelector('[data-metric][aria-pressed="true"]')?.dataset.metric || 'loans';
}

function projectionCagr(points, key) {
  if (points.length < 2) return null;
  const first = points[0]?.[key];
  const last = points.at(-1)?.[key];
  const periods = points.length - 1;
  if (!Number.isFinite(first) || !Number.isFinite(last) || first <= 0 || last < 0 || periods <= 0) return null;
  return Math.pow(last / first, 1 / periods) - 1;
}

function projectionFutureCycle(cycle, yearsAhead) {
  const match = String(cycle || '').match(/^(\d{4})-(\d{2})$/);
  if (!match) return `${cycle}+${yearsAhead}Y`;
  return `${Number(match[1]) + yearsAhead}-${match[2]}`;
}

function projectionBuild(points, key) {
  const rate = projectionCagr(points, key);
  if (!Number.isFinite(rate)) return { rate: null, points: [] };
  const current = points.at(-1)[key];
  const cycle = points.at(-1).cycle;
  return {
    rate,
    points: Array.from({ length: 5 }, (_, index) => ({
      cycle: projectionFutureCycle(cycle, index + 1),
      [key]: current * Math.pow(1 + rate, index + 1),
      projected: true
    }))
  };
}

function projectionPath(points, x, y, key) {
  return points.map((point, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(2)} ${y(point[key]).toFixed(2)}`).join(' ');
}

function projectionRender() {
  if (!projectionState.payloadLoaded) return;
  const chart = document.getElementById('trajectory-chart');
  const empty = document.getElementById('trajectory-empty');
  if (!chart || !empty || !empty.hidden) return;

  const key = projectionCurrentMetric();
  const definition = projectionMetricDefinitions[key];
  const historical = projectionState.aggregateHistory.filter((point) => Number.isFinite(point?.[key]));
  if (!definition || historical.length < 2) return;

  const forecast = projectionBuild(historical, key);
  if (!forecast.points.length) return;

  const allPoints = [...historical, ...forecast.points];
  const signature = `${key}:${historical.map((point) => `${point.cycle}:${point[key]}`).join('|')}`;
  if (signature === projectionState.lastSignature && chart.dataset.projectionRendered === 'true') return;
  projectionState.lastSignature = signature;

  const width = 1200;
  const height = 390;
  const margin = { top: 34, right: 34, bottom: 70, left: 110 };
  const values = allPoints.map((point) => point[key]);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const range = Math.max(rawMax - rawMin, Math.abs(rawMax) * 0.02, 1);
  const min = Math.max(0, rawMin - range * 0.14);
  const max = rawMax + range * 0.14;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const x = (index) => margin.left + (plotWidth * (index / Math.max(allPoints.length - 1, 1)));
  const y = (value) => margin.top + plotHeight - (((value - min) / Math.max(max - min, 1)) * plotHeight);

  const actualPath = projectionPath(historical, x, y, key);
  const forecastPathPoints = [historical.at(-1), ...forecast.points];
  const forecastX = (index) => x(historical.length - 1 + index);
  const forecastPath = projectionPath(forecastPathPoints, forecastX, y, key);
  const areaPath = `${actualPath} L ${x(historical.length - 1).toFixed(2)} ${(margin.top + plotHeight).toFixed(2)} L ${x(0).toFixed(2)} ${(margin.top + plotHeight).toFixed(2)} Z`;

  const ticks = Array.from({ length: 5 }, (_, index) => min + ((max - min) * index / 4)).reverse();
  const yGrid = ticks.map((value) => {
    const yValue = y(value).toFixed(2);
    return `<g><line class="trajectory-gridline" x1="${margin.left}" y1="${yValue}" x2="${width - margin.right}" y2="${yValue}"></line><text class="trajectory-axis-label" x="${margin.left - 14}" y="${yValue}" text-anchor="end" dominant-baseline="middle">${projectionEscape(definition.axisFormatter(value))}</text></g>`;
  }).join('');

  const dividerX = x(historical.length - 1);
  const divider = `<line class="trajectory-projection-divider" x1="${dividerX}" y1="${margin.top}" x2="${dividerX}" y2="${margin.top + plotHeight}"></line><text class="trajectory-projection-label" x="${dividerX + 12}" y="${margin.top + 18}">5-year projection</text>`;

  const xLabels = allPoints.map((point, index) => `<text class="trajectory-axis-label trajectory-axis-label--x${point.projected ? ' trajectory-axis-label--projected' : ''}" x="${x(index).toFixed(2)}" y="${height - 25}" text-anchor="middle">${projectionEscape(projectionCycleLabel(point.cycle))}</text>`).join('');
  const actualPoints = historical.map((point, index) => {
    const coverage = point.coverage?.[key] || 0;
    return `<circle class="trajectory-point" cx="${x(index).toFixed(2)}" cy="${y(point[key]).toFixed(2)}" r="5"><title>${projectionEscape(`${projectionCycleLabel(point.cycle)}: ${definition.formatter(point[key])} across ${coverage} clients`)}</title></circle>`;
  }).join('');
  const projectedPoints = forecast.points.map((point, index) => `<circle class="trajectory-projection-point" cx="${x(historical.length + index).toFixed(2)}" cy="${y(point[key]).toFixed(2)}" r="5"><title>${projectionEscape(`${projectionCycleLabel(point.cycle)} projected: ${definition.formatter(point[key])}`)}</title></circle>`).join('');

  chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  chart.setAttribute('aria-label', `${definition.label} across current clients with actual history through ${projectionCycleLabel(historical.at(-1).cycle)} and a five-year projection through ${projectionCycleLabel(forecast.points.at(-1).cycle)}`);
  chart.innerHTML = `${yGrid}<path class="trajectory-area" d="${areaPath}"></path><path class="trajectory-line" d="${actualPath}"></path>${divider}<path class="trajectory-projection-line" d="${forecastPath}"></path>${actualPoints}${projectedPoints}${xLabels}`;
  chart.dataset.projectionRendered = 'true';

  const coverage = document.getElementById('trajectory-coverage');
  if (coverage) {
    const rateText = `${forecast.rate >= 0 ? '+' : ''}${projectionPercent.format(forecast.rate * 100)}%`;
    const baseText = coverage.textContent.replace(/\s*Projection uses.*$/i, '');
    coverage.textContent = `${baseText} Projection uses the aggregate historical CAGR (${rateText} annually) and is an estimate, not an NCUA-reported value.`;
  }
}

function projectionScheduleRender() {
  window.clearTimeout(projectionState.renderTimer);
  projectionState.renderTimer = window.setTimeout(projectionRender, 30);
}

async function projectionLoad() {
  try {
    const response = await fetch('/api/ncua-credit-unions', { headers: { Accept: 'application/json' } });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    const clients = (Array.isArray(payload.creditUnions) ? payload.creditUnions : [])
      .filter((creditUnion) => creditUnion.salesStatus === 'Client' && !creditUnion.hidden);
    projectionState.clients = clients;
    projectionState.cycles = projectionResolveCycles(payload, clients);
    projectionState.aggregateHistory = projectionAggregate(clients, projectionState.cycles);
    projectionState.payloadLoaded = true;
    projectionState.lastSignature = '';
    projectionScheduleRender();
  } catch (error) {
    console.error('Unable to load client projection data:', error);
  }
}

const projectionObserver = new MutationObserver(() => {
  const chart = document.getElementById('trajectory-chart');
  if (chart?.dataset.projectionRendered === 'true') return;
  projectionScheduleRender();
});

const projectionChart = document.getElementById('trajectory-chart');
if (projectionChart) projectionObserver.observe(projectionChart, { childList: true, subtree: true });

document.querySelectorAll('[data-metric]').forEach((button) => {
  button.addEventListener('click', () => {
    projectionState.lastSignature = '';
    projectionScheduleRender();
  });
});

document.getElementById('refresh-clients')?.addEventListener('click', () => {
  window.setTimeout(projectionLoad, 100);
});

projectionLoad();
