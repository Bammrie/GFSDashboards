const state = {
  prospects: [],
  radar: [],
  search: '',
  selectedState: '',
  meta: {}
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

function signedPercent(value) {
  if (!Number.isFinite(value)) return '—';
  return `${value > 0 ? '+' : ''}${percentage.format(value)}%`;
}

function percent(value) {
  return Number.isFinite(value) ? `${percentage.format(value)}%` : '—';
}

function growthClass(value) {
  if (!Number.isFinite(value) || Math.abs(value) < 0.05) return 'growth-flat';
  return value > 0 ? 'growth-up' : 'growth-down';
}

function cycleLabel(cycle) {
  const match = String(cycle || '').match(/^(\d{4})-(\d{2})$/);
  if (!match) return cycle || 'latest available cycle';
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function accountSort(a, b) {
  return (numericValue(b.loans) || 0) - (numericValue(a.loans) || 0)
    || (numericValue(b.assets) || 0) - (numericValue(a.assets) || 0)
    || String(a.name || '').localeCompare(String(b.name || ''));
}

function accountSearchText(account) {
  return [
    account.name,
    account.charterNumber,
    account.street,
    account.city,
    account.state,
    account.zip,
    account.notes,
    ...(Array.isArray(account.tags) ? account.tags : [])
  ].join(' ').toLowerCase();
}

function filteredAccounts(accounts) {
  const query = state.search.trim().toLowerCase();
  return accounts.filter((account) => {
    if (state.selectedState && account.state !== state.selectedState) return false;
    return !query || accountSearchText(account).includes(query);
  });
}

function sumMetric(accounts, key) {
  return accounts.reduce((total, account) => {
    const value = numericValue(account?.[key]);
    return Number.isFinite(value) ? total + value : total;
  }, 0);
}

function notePreview(value) {
  const text = String(value || '').trim().replace(/\s+/g, ' ');
  if (!text) return '';
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

function dashboardUrl(account) {
  return `potential-new-client-overview.html?search=${encodeURIComponent(account.charterNumber || account.name || '')}`;
}

function accountRow(account, status) {
  const loanGrowth = numericValue(account.growth?.loans?.fiveYearPct);
  const assetGrowth = numericValue(account.growth?.assets?.fiveYearPct);
  const tags = Array.isArray(account.tags) && account.tags.length
    ? `<span class="account-tags">${account.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</span>`
    : '';
  const notes = notePreview(account.notes);
  const noteLine = notes ? `<span class="account-note">${escapeHtml(notes)}</span>` : '';

  return `<tr>
    <td>
      <a class="account-name" href="${escapeHtml(dashboardUrl(account))}">${escapeHtml(account.name)}</a>
      <span class="account-meta">Charter ${escapeHtml(account.charterNumber)}</span>
      <span class="status-pill status-pill--${status.toLowerCase()}">${escapeHtml(status)}</span>
      ${tags}${noteLine}
    </td>
    <td>${escapeHtml([account.city, account.state].filter(Boolean).join(', ') || '—')}</td>
    <td class="numeric">${escapeHtml(money(numericValue(account.assets)))}</td>
    <td class="numeric">${escapeHtml(money(numericValue(account.loans)))}</td>
    <td class="numeric">${escapeHtml(money(numericValue(account.totalAuto)))}</td>
    <td class="numeric">${escapeHtml(money(numericValue(account.indirectAuto)))}</td>
    <td class="numeric">${escapeHtml(percent(numericValue(account.directAutoPercent)))}</td>
    <td class="numeric ${growthClass(loanGrowth)}">${escapeHtml(signedPercent(loanGrowth))}</td>
    <td class="numeric ${growthClass(assetGrowth)}">${escapeHtml(signedPercent(assetGrowth))}</td>
  </tr>`;
}

function renderSection({ accounts, status, bodyId, wrapId, emptyId, countId }) {
  const visible = filteredAccounts(accounts);
  $(countId).textContent = `${count(visible.length)} of ${count(accounts.length)} ${status.toLowerCase()} accounts shown`;

  if (!visible.length) {
    $(bodyId).innerHTML = '';
    $(wrapId).hidden = true;
    $(emptyId).hidden = false;
    $(emptyId).querySelector('p').textContent = accounts.length
      ? `No ${status.toLowerCase()} accounts match the current filters.`
      : `No accounts are currently classified as ${status}.`;
    return;
  }

  $(wrapId).hidden = false;
  $(emptyId).hidden = true;
  $(bodyId).innerHTML = visible.map((account) => accountRow(account, status)).join('');
}

function renderSummary() {
  $('prospect-count').textContent = count(state.prospects.length);
  $('prospect-loans').textContent = money(sumMetric(state.prospects, 'loans'));
  $('radar-count').textContent = count(state.radar.length);
  $('radar-loans').textContent = money(sumMetric(state.radar, 'loans'));

  const cycle = cycleLabel(state.meta.cycle);
  const generated = state.meta.generatedAt
    ? ` · synchronized ${new Date(state.meta.generatedAt).toLocaleString()}`
    : '';
  $('prospect-data-meta').textContent = `${count(state.prospects.length)} prospects · ${count(state.radar.length)} radar accounts · NCUA ${cycle}${generated}`;
}

function renderPage() {
  renderSummary();
  renderSection({
    accounts: state.prospects,
    status: 'Prospect',
    bodyId: 'prospect-table-body',
    wrapId: 'prospect-table-wrap',
    emptyId: 'prospect-empty',
    countId: 'prospect-result-count'
  });
  renderSection({
    accounts: state.radar,
    status: 'Radar',
    bodyId: 'radar-table-body',
    wrapId: 'radar-table-wrap',
    emptyId: 'radar-empty',
    countId: 'radar-result-count'
  });
}

function populateStateFilter() {
  const previous = state.selectedState;
  const states = [...new Set([...state.prospects, ...state.radar].map((account) => account.state).filter(Boolean))].sort();
  $('prospect-state-filter').innerHTML = '<option value="">All states</option>'
    + states.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
  if (states.includes(previous)) $('prospect-state-filter').value = previous;
  else state.selectedState = '';
}

function applyPayload(payload) {
  const records = Array.isArray(payload?.creditUnions) ? payload.creditUnions : [];
  state.meta = payload || {};
  state.prospects = records
    .filter((account) => account.salesStatus === 'Prospect' && !account.hidden)
    .sort(accountSort);
  state.radar = records
    .filter((account) => account.salesStatus === 'Radar' && !account.hidden)
    .sort(accountSort);
  populateStateFilter();
  renderPage();
}

async function api(path) {
  const response = await fetch(path, { headers: { Accept: 'application/json' } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

async function loadAccounts() {
  const refreshButton = $('refresh-prospects');
  refreshButton.disabled = true;
  refreshButton.textContent = 'Refreshing…';
  $('prospect-data-meta').textContent = 'Loading Prospect and Radar classifications…';

  try {
    applyPayload(await api('/api/ncua-credit-unions'));
  } catch (error) {
    $('prospect-data-meta').textContent = error.message;
    $('prospect-result-count').textContent = 'Prospect accounts unavailable.';
    $('radar-result-count').textContent = 'Radar accounts unavailable.';
  } finally {
    refreshButton.disabled = false;
    refreshButton.textContent = 'Refresh Data';
  }
}

$('prospect-search').addEventListener('input', (event) => {
  state.search = event.target.value;
  renderPage();
});

$('prospect-state-filter').addEventListener('change', (event) => {
  state.selectedState = event.target.value;
  renderPage();
});

$('refresh-prospects').addEventListener('click', loadAccounts);
window.addEventListener('gfs-client-data-refreshed', (event) => {
  if (event.detail) applyPayload(event.detail);
});

loadAccounts();
