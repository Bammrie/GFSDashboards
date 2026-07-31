const statuses = ['', 'Radar', 'Prospect', 'Client', 'Off-Limits'];
const metricDefinitions = [
  { key: 'assets', label: 'Assets', formatter: money },
  { key: 'members', label: 'Members', formatter: count },
  { key: 'loans', label: 'Loans', formatter: money }
];
const mapStatuses = new Set(['Client', 'Prospect']);
const listBatchSize = 160;
const state = {
  data: [],
  filtered: [],
  selected: null,
  byCharter: new Map(),
  listLimit: listBatchSize,
  meta: {},
  map: null,
  mapLayer: null,
  mapRenderer: null,
  mapHasFit: false
};
const $ = (id) => document.getElementById(id);
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const percentage = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function money(value) { return Number.isFinite(value) ? currency.format(value) : '-'; }
function count(value) { return Number.isFinite(value) ? number.format(value) : '-'; }
function percent(value) { return Number.isFinite(value) ? `${percentage.format(value)}%` : '-'; }
function signedPercent(value) { if (!Number.isFinite(value)) return '-'; return `${value > 0 ? '+' : ''}${percentage.format(value)}%`; }
function growthClass(value) { if (!Number.isFinite(value) || Math.abs(value) < .05) return 'growth-flat'; return value > 0 ? 'growth-up' : 'growth-down'; }
function cycleLabel(cycle) { const match = String(cycle || '').match(/^(\d{4})-(\d{2})$/); if (!match) return cycle || '-'; const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)); return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date); }
function api(path, options = {}) { return fetch(path, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options }).then(async (response) => { const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`); return body; }); }

function fillSelects() {
  $('edit-status').innerHTML = statuses.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value || 'Blank')}</option>`).join('');
  $('status-filter').innerHTML = '<option value="">All statuses</option>' + statuses.filter(Boolean).map((value) => `<option>${escapeHtml(value)}</option>`).join('');
}

function initializeMap() {
  if (state.map || !window.L) return;
  state.map = L.map('directory-map-canvas', { preferCanvas: true, zoomControl: true, minZoom: 2 }).setView([39.5, -98.35], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(state.map);
  state.mapRenderer = L.canvas({ padding: .5 });
  state.mapLayer = L.layerGroup().addTo(state.map);
  setTimeout(() => state.map.invalidateSize(), 0);
}

function markerStyle(cu) {
  const selected = state.selected?.charterNumber === cu.charterNumber;
  const markerColor = cu.salesStatus === 'Client' ? '#7a1e2c' : '#2d7f4f';
  return { renderer: state.mapRenderer, radius: selected ? 8 : 5, weight: selected ? 3 : 1.5, color: selected ? '#111827' : markerColor, fillColor: markerColor, fillOpacity: selected ? .98 : .82 };
}

function renderMap({ fit = false } = {}) {
  initializeMap();
  if (!state.map || !state.mapLayer) return;
  state.mapLayer.clearLayers();
  const mapped = state.filtered.filter((cu) => mapStatuses.has(cu.salesStatus) && Number.isFinite(cu.latitude) && Number.isFinite(cu.longitude));
  const bounds = [];
  mapped.forEach((cu) => {
    const marker = L.circleMarker([cu.latitude, cu.longitude], markerStyle(cu));
    marker.bindPopup(`<div class="directory-map-popup"><strong>${escapeHtml(cu.name)}</strong><span>${escapeHtml(cu.salesStatus)}</span><span>${escapeHtml([cu.street, cu.city, cu.state, cu.zip].filter(Boolean).join(', '))}</span><span>${escapeHtml(money(cu.assets))} assets</span><button type="button" data-map-charter="${escapeHtml(cu.charterNumber)}">Open credit union</button></div>`);
    marker.on('popupopen', (event) => {
      const button = event.popup.getElement()?.querySelector('[data-map-charter]');
      if (button) button.addEventListener('click', () => { selectCreditUnion(button.dataset.mapCharter); $('credit-union-detail-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); state.map.closePopup(); }, { once: true });
    });
    marker.on('click', () => selectCreditUnion(cu.charterNumber, false));
    marker.addTo(state.mapLayer);
    bounds.push([cu.latitude, cu.longitude]);
  });
  const clients = mapped.filter((cu) => cu.salesStatus === 'Client').length;
  const prospects = mapped.filter((cu) => cu.salesStatus === 'Prospect').length;
  $('directory-map-status').textContent = `${count(mapped.length)} pins shown · ${count(clients)} clients · ${count(prospects)} prospects`;
  if (bounds.length && (fit || !state.mapHasFit)) { state.map.fitBounds(bounds, { padding: [18, 18], maxZoom: 10 }); state.mapHasFit = true; }
  else if (!bounds.length) { state.map.setView([39.5, -98.35], 4); state.mapHasFit = false; }
}

function applyFilters({ resetList = true } = {}) {
  const query = $('search-input').value.trim().toLowerCase();
  const selectedState = $('state-filter').value;
  const selectedStatus = $('status-filter').value;
  const selectedTrend = $('trend-filter').value;
  state.filtered = state.data.filter((cu) => {
    if (selectedState && cu.state !== selectedState) return false;
    if (selectedStatus && cu.salesStatus !== selectedStatus) return false;
    if (selectedTrend && cu.trend !== selectedTrend) return false;
    if (!query) return true;
    return [cu.name, cu.charterNumber, cu.street, cu.city, cu.state, cu.zip, cu.trend, ...(cu.tags || [])].join(' ').toLowerCase().includes(query);
  });
  if (resetList) state.listLimit = listBatchSize;
  if (state.selected && !state.filtered.some((cu) => cu.charterNumber === state.selected.charterNumber)) state.selected = null;
  renderList(); renderSummary(); renderDetail(); renderMap({ fit: Boolean(selectedState || selectedStatus || selectedTrend || query) });
}

function renderSummary() {
  const selectedState = $('state-filter').value;
  const totalAssets = state.filtered.reduce((sum, cu) => sum + (Number(cu.assets) || 0), 0);
  const growing = state.filtered.filter((cu) => cu.trend === 'Growing').length;
  const declining = state.filtered.filter((cu) => cu.trend === 'Declining').length;
  const scope = selectedState || `${new Set(state.filtered.map((cu) => cu.state).filter(Boolean)).size} states / territories`;
  const visibleCount = Math.min(state.listLimit, state.filtered.length);
  $('directory-summary').innerHTML = [`${count(state.filtered.length)} shown`, scope, `${money(totalAssets)} assets`, `${count(growing)} growing`, `${count(declining)} declining`, `NCUA cycle ${state.meta.cycle || 'not loaded'}`].map((value) => `<span class="directory-chip">${escapeHtml(value)}</span>`).join('');
  $('result-count').textContent = `${count(state.filtered.length)} active credit unions match the current filters. Showing ${count(visibleCount)}.`;
}

function renderList() {
  const list = $('credit-union-list');
  if (!state.filtered.length) { list.innerHTML = '<div class="empty-state"><p>No credit unions match the current filters.</p></div>'; return; }
  const visible = state.filtered.slice(0, state.listLimit);
  let currentState = '';
  const rows = visible.map((cu) => {
    const stateHeading = cu.state !== currentState ? `<div class="state-heading">${escapeHtml(cu.state || 'Unknown')}</div>` : '';
    currentState = cu.state;
    const assetGrowth = cu.growth?.assets?.fiveYearPct;
    const memberGrowth = cu.growth?.members?.fiveYearPct;
    const trend = cu.trend || 'Insufficient history';
    const status = cu.salesStatus || 'Blank';
    return `${stateHeading}<button type="button" class="cu-button" data-charter="${escapeHtml(cu.charterNumber)}" aria-pressed="${state.selected?.charterNumber === cu.charterNumber}"><span><strong>${escapeHtml(cu.name)}</strong><small>${escapeHtml([cu.city, cu.state].filter(Boolean).join(', '))}</small><small>Charter ${escapeHtml(cu.charterNumber)}</small><small class="cu-growth"><span class="${growthClass(assetGrowth)}">Assets 5Y ${escapeHtml(signedPercent(assetGrowth))}</span><span class="${growthClass(memberGrowth)}">Members 5Y ${escapeHtml(signedPercent(memberGrowth))}</span></small><span class="status-badge">${escapeHtml(status)}</span> <span class="trend-badge" data-trend="${escapeHtml(trend)}">${escapeHtml(trend)}</span></span><span class="cu-assets">${escapeHtml(money(cu.assets))}</span></button>`;
  }).join('');
  const remaining = state.filtered.length - visible.length;
  const loadMore = remaining > 0
    ? `<button id="directory-load-more" type="button" class="primary-button directory-load-more">Show ${escapeHtml(count(Math.min(listBatchSize, remaining)))} more · ${escapeHtml(count(remaining))} remaining</button>`
    : '';
  list.innerHTML = rows + loadMore;
  list.querySelectorAll('[data-charter]').forEach((button) => button.addEventListener('click', () => selectCreditUnion(button.dataset.charter)));
  list.querySelector('#directory-load-more')?.addEventListener('click', () => {
    state.listLimit = Math.min(state.filtered.length, state.listLimit + listBatchSize);
    renderList();
    renderSummary();
  });
}

function syncVisibleSelection() {
  const selectedCharter = state.selected?.charterNumber || '';
  $('credit-union-list').querySelectorAll('[data-charter]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.charter === selectedCharter));
  });
}

function selectCreditUnion(charter, rerenderMap = true) {
  state.selected = state.byCharter.get(charter) || null;
  syncVisibleSelection();
  renderDetail();
  if (rerenderMap) renderMap();
}

function renderGrowthSummary(cu) {
  $('growth-summary').innerHTML = metricDefinitions.map(({ key, label, formatter }) => {
    const growth = cu.growth?.[key] || {};
    const projected = cu.projectedFiveYear?.[key];
    const projectionCycle = cu.projection?.at(-1)?.cycle;
    return `<article class="growth-card"><h4>${escapeHtml(label)}</h4><div class="growth-stat-grid"><div class="growth-stat"><span>1-year change</span><strong class="${growthClass(growth.oneYearPct)}">${escapeHtml(signedPercent(growth.oneYearPct))}</strong></div><div class="growth-stat"><span>5-year change</span><strong class="${growthClass(growth.fiveYearPct)}">${escapeHtml(signedPercent(growth.fiveYearPct))}</strong></div><div class="growth-stat"><span>Annual trend</span><strong class="${growthClass(growth.annualTrendPct)}">${escapeHtml(signedPercent(growth.annualTrendPct))}</strong></div><div class="growth-stat"><span>Model confidence</span><strong>${escapeHtml(growth.confidence || 'Unavailable')}</strong></div><div class="growth-stat wide"><span>Projected ${escapeHtml(cycleLabel(projectionCycle))}</span><strong>${escapeHtml(formatter(projected))}</strong></div></div></article>`;
  }).join('');
}

function chartMarkup(cu, definition) {
  const actual = (cu.history || []).filter((row) => Number.isFinite(row?.[definition.key]));
  const projected = (cu.projection || []).filter((row) => Number.isFinite(row?.[definition.key]));
  const series = [...actual, ...projected];
  if (actual.length < 2 || !series.length) return `<article class="chart-card"><h4>${escapeHtml(definition.label)}</h4><p>Not enough history to chart.</p></article>`;
  const width = 360, height = 126, pad = 12;
  const values = series.map((row) => row[definition.key]);
  let min = Math.min(...values), max = Math.max(...values); if (min === max) { min -= 1; max += 1; }
  const x = (index) => pad + ((width - (pad * 2)) * (index / Math.max(series.length - 1, 1)));
  const y = (value) => height - pad - (((value - min) / (max - min)) * (height - (pad * 2)));
  const actualPath = actual.map((row, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(2)} ${y(row[definition.key]).toFixed(2)}`).join(' ');
  const bridge = [actual.at(-1), ...projected];
  const projectedPath = bridge.map((row, index) => `${index ? 'L' : 'M'} ${x((actual.length - 1) + index).toFixed(2)} ${y(row[definition.key]).toFixed(2)}`).join(' ');
  const actualPoints = actual.map((row, index) => `<circle class="chart-point" cx="${x(index).toFixed(2)}" cy="${y(row[definition.key]).toFixed(2)}" r="3.2"></circle>`).join('');
  const projectedPoints = projected.map((row, index) => `<circle class="chart-projected-point" cx="${x(actual.length + index).toFixed(2)}" cy="${y(row[definition.key]).toFixed(2)}" r="3.2"></circle>`).join('');
  return `<article class="chart-card"><h4>${escapeHtml(definition.label)}</h4><p>${escapeHtml(cycleLabel(actual[0]?.cycle))} actual through ${escapeHtml(cycleLabel(projected.at(-1)?.cycle || actual.at(-1)?.cycle))} projected</p><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(definition.label)} actual and projected trend"><line class="chart-baseline" x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}"></line><path class="chart-actual" d="${actualPath}"></path>${projected.length ? `<path class="chart-projected" d="${projectedPath}"></path>` : ''}${actualPoints}${projectedPoints}</svg></article>`;
}

function renderHistory(cu) {
  const cycles = state.meta.historyCycles || [];
  const firstCycle = cycles[0] || cu.history?.[0]?.cycle;
  const latestCycle = cycles.at(-1) || cu.history?.at(-1)?.cycle;
  const projectionCycle = cu.projection?.at(-1)?.cycle;
  const method = state.meta.projectionMethod?.description || 'Projection uses the same-quarter historical trend and is a directional estimate, not a guarantee.';
  $('history-caption').textContent = `Actual NCUA reports: ${cycleLabel(firstCycle)} through ${cycleLabel(latestCycle)}. Projection through ${cycleLabel(projectionCycle)}. ${method}`;
  renderGrowthSummary(cu);
  $('history-charts').innerHTML = metricDefinitions.map((definition) => chartMarkup(cu, definition)).join('');
  const rows = [...(cu.history || []).map((row) => ({ ...row, type: 'Actual' })), ...(cu.projection || []).map((row) => ({ ...row, type: 'Projection' }))];
  $('history-table').innerHTML = `<table class="history-table"><thead><tr><th>Period</th><th>Type</th><th>Assets</th><th>Members</th><th>Loans</th></tr></thead><tbody>${rows.map((row) => `<tr class="${row.type === 'Projection' ? 'projection-row' : ''}"><td>${escapeHtml(cycleLabel(row.cycle))}</td><td>${escapeHtml(row.type)}</td><td>${escapeHtml(money(row.assets))}</td><td>${escapeHtml(count(row.members))}</td><td>${escapeHtml(money(row.loans))}</td></tr>`).join('')}</tbody></table>`;
}

function renderDetail() {
  const cu = state.selected;
  $('empty-detail').hidden = Boolean(cu);
  $('credit-union-detail').hidden = !cu;
  if (!cu) { $('empty-detail').querySelector('p').textContent = 'Select a credit union to review its information.'; return; }
  $('detail-name').textContent = cu.name;
  $('detail-location').textContent = [cu.street, cu.city, cu.state, cu.zip].filter(Boolean).join(', ');
  $('detail-status').textContent = cu.salesStatus || 'Blank';
  $('detail-trend').textContent = cu.trend || 'Insufficient history';
  $('detail-trend').dataset.trend = cu.trend || 'Insufficient history';
  $('detail-metrics').innerHTML = [['Assets', money(cu.assets)], ['Loans', money(cu.loans)], ['Total Auto', money(cu.totalAuto)], ['Indirect Auto', money(cu.indirectAuto)], ['Direct Auto %', percent(cu.directAutoPercent)], ['Mortgage (1st Lien)', money(cu.firstLienMortgage)]].map(([label, value]) => `<div class="detail-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
  renderHistory(cu);
  $('edit-status').value = cu.salesStatus || '';
  $('edit-tags').value = (cu.tags || []).join(', ');
  $('edit-notes').value = cu.notes || '';
  $('save-feedback').textContent = '';
}

async function loadDirectory() {
  $('directory-meta').textContent = 'Loading saved directory…';
  const payload = await api('/api/ncua-credit-unions');
  const { creditUnions, ...meta } = payload;
  state.meta = meta;
  state.data = Array.isArray(creditUnions) ? creditUnions : [];
  state.data.sort((a, b) => String(a.state || '').localeCompare(String(b.state || '')) || String(a.name || '').localeCompare(String(b.name || '')));
  state.byCharter = new Map(state.data.map((creditUnion) => [String(creditUnion.charterNumber), creditUnion]));
  const states = [...new Set(state.data.map((cu) => cu.state).filter(Boolean))].sort();
  $('state-filter').innerHTML = '<option value="">All states</option>' + states.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
  const historyCycles = Array.isArray(payload.historyCycles) ? payload.historyCycles : [];
  const historyLabel = historyCycles.length ? ` · history ${historyCycles[0]} to ${historyCycles.at(-1)} · projected ${payload.projectionYears || 5} years` : '';
  $('directory-meta').textContent = payload.generatedAt ? `Saved dataset: ${new Date(payload.generatedAt).toLocaleString()} · ${count(payload.count)} active credit unions${historyLabel}.` : 'Saved directory is unavailable.';
  state.selected = null;
  state.mapHasFit = false;
  applyFilters();
}

async function saveSelected(event) {
  event.preventDefault();
  if (!state.selected) return;
  const payload = {
    salesStatus: $('edit-status').value,
    tags: $('edit-tags').value.split(',').map((value) => value.trim()).filter(Boolean),
    notes: $('edit-notes').value
  };
  $('save-feedback').textContent = 'Saving to MongoDB...';
  try {
    const saved = await api(`/api/ncua-credit-unions/${encodeURIComponent(state.selected.charterNumber)}`, { method: 'PATCH', body: JSON.stringify(payload) });
    Object.assign(state.selected, saved);
    $('save-feedback').textContent = 'Saved to MongoDB.';
    applyFilters({ resetList: false });
  } catch (error) { $('save-feedback').textContent = error.message; }
}

fillSelects();
initializeMap();
['search-input', 'state-filter', 'status-filter', 'trend-filter'].forEach((id) => $(id).addEventListener(id === 'search-input' ? 'input' : 'change', applyFilters));
$('edit-form').addEventListener('submit', saveSelected);
loadDirectory().catch((error) => { $('directory-meta').textContent = error.message; $('directory-map-status').textContent = 'Map unavailable.'; });
