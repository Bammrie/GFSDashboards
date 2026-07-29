const PAGE_SIZE = 100;
const state = { rows: [], filtered: [], page: 1, selected: null };
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

const els = Object.fromEntries([
  'directory-meta','directory-metrics','directory-search','directory-state','directory-status','directory-sort','directory-count','directory-body','directory-prev','directory-next','directory-page-label','directory-edit-dialog','directory-edit-form','directory-edit-title','directory-edit-subtitle','directory-edit-close','directory-edit-cancel','directory-edit-feedback','edit-gfs-status','edit-owner','edit-priority','edit-last-contacted','edit-tags','edit-notes'
].map((id) => [id, document.getElementById(id)]));

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function fmtCurrency(value) { return Number.isFinite(value) ? currency.format(value) : '—'; }
function fmtNumber(value) { return Number.isFinite(value) ? number.format(value) : '—'; }
function fmtDate(value) { if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US'); }

async function loadDirectory() {
  const response = await fetch('/api/ncua-credit-unions');
  if (!response.ok) throw new Error(`Directory request failed (${response.status})`);
  const payload = await response.json();
  state.rows = Array.isArray(payload.creditUnions) ? payload.creditUnions : [];
  els['directory-meta'].textContent = `${number.format(state.rows.length)} active credit unions from NCUA cycle ${payload.cycle || 'not synced yet'}. Last synchronized ${payload.generatedAt ? new Date(payload.generatedAt).toLocaleString('en-US') : 'not yet'}.`;
  populateStates();
  renderMetrics(payload);
  applyFilters();
}

function renderMetrics(payload) {
  const totalAssets = state.rows.reduce((sum, row) => sum + (Number(row.assets) || 0), 0);
  const totalMembers = state.rows.reduce((sum, row) => sum + (Number(row.members) || 0), 0);
  const reviewed = state.rows.filter((row) => (row.gfsStatus || 'Unreviewed') !== 'Unreviewed').length;
  const clientCount = state.rows.filter((row) => row.gfsStatus === 'Client').length;
  const metrics = [
    ['Active credit unions', fmtNumber(state.rows.length), 'Available for tracking'],
    ['Combined assets', fmtCurrency(totalAssets), 'Latest synchronized NCUA asset balances'],
    ['Combined members', fmtNumber(totalMembers), 'Latest synchronized membership totals'],
    ['Reviewed internally', fmtNumber(reviewed), `${state.rows.length ? ((reviewed / state.rows.length) * 100).toFixed(1) : '0.0'}% assigned a GFS status`],
    ['Marked clients', fmtNumber(clientCount), 'Current directory records'],
    ['NCUA cycle', payload.cycle || 'Pending', payload.sourceUrl ? 'Official call-report archive' : 'Run npm run sync:ncua']
  ];
  els['directory-metrics'].innerHTML = metrics.map(([label,value,detail]) => `<article class="metric-card"><p class="metric-card__label">${escapeHtml(label)}</p><p class="metric-card__value">${escapeHtml(value)}</p><p class="metric-card__subtext">${escapeHtml(detail)}</p></article>`).join('');
}

function populateStates() {
  const values = [...new Set(state.rows.map((row) => row.state).filter(Boolean))].sort();
  els['directory-state'].innerHTML = '<option value="">All states</option>' + values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join('');
}

function applyFilters() {
  const search = els['directory-search'].value.trim().toLowerCase();
  const stateFilter = els['directory-state'].value;
  const status = els['directory-status'].value;
  state.filtered = state.rows.filter((row) => {
    const haystack = [row.name,row.charterNumber,row.city,row.state,row.owner,row.gfsStatus,row.tags,row.notes].join(' ').toLowerCase();
    return (!search || haystack.includes(search)) && (!stateFilter || row.state === stateFilter) && (!status || (row.gfsStatus || 'Unreviewed') === status);
  });
  const sort = els['directory-sort'].value;
  state.filtered.sort((a,b) => {
    if (sort === 'assets-asc') return (a.assets || 0) - (b.assets || 0) || a.name.localeCompare(b.name);
    if (sort === 'name-asc') return a.name.localeCompare(b.name);
    if (sort === 'state-asc') return (a.state || '').localeCompare(b.state || '') || (b.assets || 0) - (a.assets || 0);
    return (b.assets || 0) - (a.assets || 0) || a.name.localeCompare(b.name);
  });
  state.page = 1;
  renderTable();
}

function renderTable() {
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / PAGE_SIZE));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * PAGE_SIZE;
  const rows = state.filtered.slice(start, start + PAGE_SIZE);
  els['directory-count'].textContent = number.format(state.filtered.length);
  els['directory-page-label'].textContent = `Page ${state.page} of ${totalPages}`;
  els['directory-prev'].disabled = state.page <= 1;
  els['directory-next'].disabled = state.page >= totalPages;
  els['directory-body'].innerHTML = rows.length ? rows.map((row) => `
    <tr data-charter="${escapeHtml(row.charterNumber)}">
      <td><strong>${escapeHtml(row.name)}</strong>${row.tags ? `<br><small>${escapeHtml(row.tags)}</small>` : ''}</td>
      <td>${escapeHtml(row.charterNumber)}</td>
      <td>${escapeHtml([row.city,row.state].filter(Boolean).join(', '))}</td>
      <td class="numeric"><strong>${fmtCurrency(row.assets)}</strong></td>
      <td class="numeric">${fmtNumber(row.members)}</td>
      <td>${escapeHtml(row.status || 'Active')}</td>
      <td><span class="cu-directory-pill">${escapeHtml(row.gfsStatus || 'Unreviewed')}</span></td>
      <td>${escapeHtml(row.owner || '—')}</td>
      <td>${fmtDate(row.internalUpdatedAt)}</td>
    </tr>`).join('') : '<tr><td colspan="9">No credit unions match the current filters.</td></tr>';
  els['directory-body'].querySelectorAll('tr[data-charter]').forEach((row) => row.addEventListener('click', () => openEditor(row.dataset.charter)));
}

function openEditor(charterNumber) {
  const row = state.rows.find((item) => item.charterNumber === charterNumber);
  if (!row) return;
  state.selected = row;
  els['directory-edit-title'].textContent = row.name;
  els['directory-edit-subtitle'].textContent = `Charter ${row.charterNumber} • ${[row.city,row.state].filter(Boolean).join(', ')} • ${fmtCurrency(row.assets)} in assets`;
  els['edit-gfs-status'].value = row.gfsStatus || 'Unreviewed';
  els['edit-owner'].value = row.owner || '';
  els['edit-priority'].value = row.priority || '';
  els['edit-last-contacted'].value = row.lastContacted || '';
  els['edit-tags'].value = row.tags || '';
  els['edit-notes'].value = row.notes || '';
  els['directory-edit-feedback'].textContent = '';
  els['directory-edit-dialog'].showModal();
}

async function saveEditor(event) {
  event.preventDefault();
  if (!state.selected) return;
  els['directory-edit-feedback'].textContent = 'Saving…';
  const body = {
    gfsStatus: els['edit-gfs-status'].value,
    owner: els['edit-owner'].value.trim(),
    priority: els['edit-priority'].value,
    lastContacted: els['edit-last-contacted'].value,
    tags: els['edit-tags'].value.trim(),
    notes: els['edit-notes'].value.trim()
  };
  const response = await fetch(`/api/ncua-credit-unions/${encodeURIComponent(state.selected.charterNumber)}`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
  if (!response.ok) { els['directory-edit-feedback'].textContent = 'Unable to save changes.'; return; }
  const updated = await response.json();
  Object.assign(state.selected, updated.creditUnion);
  els['directory-edit-dialog'].close();
  applyFilters();
}

['directory-search','directory-state','directory-status','directory-sort'].forEach((id) => els[id].addEventListener(id === 'directory-search' ? 'input' : 'change', applyFilters));
els['directory-prev'].addEventListener('click', () => { state.page -= 1; renderTable(); });
els['directory-next'].addEventListener('click', () => { state.page += 1; renderTable(); });
els['directory-edit-form'].addEventListener('submit', saveEditor);
els['directory-edit-close'].addEventListener('click', () => els['directory-edit-dialog'].close());
els['directory-edit-cancel'].addEventListener('click', () => els['directory-edit-dialog'].close());

loadDirectory().catch((error) => {
  console.error(error);
  els['directory-meta'].textContent = 'The directory is connected, but no synchronized NCUA data is available yet. Run npm run sync:ncua and redeploy.';
  renderMetrics({});
  applyFilters();
});
