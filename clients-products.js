const PRODUCT_OPTIONS = Object.freeze(['MOB Coverage', 'GAP', 'VSC', 'CPI']);
const PRODUCT_ENDPOINT = '/api/ncua-client-products';
const PRODUCT_PRODUCTION_FIELDS = Object.freeze([
  Object.freeze({ product: 'MOB Coverage', columnLabel: 'MOB', field: 'mobPremiumCollected', label: 'MOB premium collected', historyLabel: 'Premium Collected', unit: 'currency', step: '0.01' }),
  Object.freeze({ product: 'VSC', columnLabel: 'VSC', field: 'vscPoliciesSold', label: 'VSC policies sold', historyLabel: 'Policies Sold', unit: 'count', step: '1' }),
  Object.freeze({ product: 'GAP', columnLabel: 'GAP', field: 'gapPoliciesSold', label: 'GAP policies sold', historyLabel: 'Policies Sold', unit: 'count', step: '1' })
]);
const TRACKED_PRODUCTS = new Set(PRODUCT_PRODUCTION_FIELDS.map(({ product }) => product));

const productState = {
  productsByCharter: new Map(),
  productionByCharter: new Map(),
  loaded: false,
  loading: false,
  loadError: '',
  saving: new Set(),
  messages: new Map(),
  activeProductionCharter: '',
  activeProductionName: '',
  activeProductionProduct: ''
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeCharterNumber(value) {
  return String(value ?? '').trim().replace(/\.0$/, '').replace(/^0+(?=\d)/, '');
}

function sanitizeProducts(value) {
  const requested = new Set(Array.isArray(value) ? value : []);
  return PRODUCT_OPTIONS.filter((product) => requested.has(product));
}

function sanitizeProductionEntries(value) {
  return (Array.isArray(value) ? value : [])
    .map((candidate) => {
      const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(String(candidate?.month || ''))
        ? String(candidate.month)
        : '';
      if (!month) return null;
      const entry = { month, updatedAt: candidate?.updatedAt || null };
      PRODUCT_PRODUCTION_FIELDS.forEach(({ field, unit }) => {
        if (candidate?.[field] === null || candidate?.[field] === undefined || candidate?.[field] === '') return;
        const numericValue = Number(candidate[field]);
        if (!Number.isFinite(numericValue) || numericValue < 0 || (unit === 'count' && !Number.isInteger(numericValue))) return;
        entry[field] = numericValue;
      });
      return PRODUCT_PRODUCTION_FIELDS.some(({ field }) => Object.hasOwn(entry, field)) ? entry : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.month.localeCompare(a.month));
}

function currentProductionMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function installStyles() {
  if (document.getElementById('client-products-styles')) return;
  const style = document.createElement('style');
  style.id = 'client-products-styles';
  style.textContent = `
    .client-table.client-table--with-products{min-width:1260px}
    .client-product-header{width:118px;min-width:118px;text-align:center!important}
    .client-product-cell{width:118px;min-width:118px;padding-left:.34rem!important;padding-right:.34rem!important;text-align:center}
    .client-product-toggle{display:grid;place-items:center;gap:.08rem;width:100%;min-height:42px;padding:.28rem .34rem;border:1px solid #a93d45;background:#a93d45;color:#fff;font:inherit;font-size:.67rem;font-weight:850;line-height:1.05;cursor:pointer;transition:background-color .15s,border-color .15s,box-shadow .15s;user-select:none}
    .client-product-toggle:hover,.client-product-toggle:focus-visible{box-shadow:0 0 0 2px rgba(122,30,44,.18)}
    .client-product-toggle[data-active="true"]{border-color:#28784a;background:#28784a}
    .client-product-toggle[data-active="true"]:hover,.client-product-toggle[data-active="true"]:focus-visible{border-color:#1e5d39;background:#1e5d39}
    .client-product-toggle:disabled{cursor:wait;opacity:.68}
    .client-product-toggle__state{font-size:.68rem;letter-spacing:.015em}
    .client-product-toggle__detail{display:block;max-width:100%;overflow:hidden;font-size:.56rem;font-weight:700;opacity:.88;text-overflow:ellipsis;white-space:nowrap}
    .client-production-button{min-height:31px;padding:.32rem .62rem;border:1px solid var(--accent);background:var(--accent);color:#fff;font:inherit;font-size:.7rem;font-weight:800;cursor:pointer}
    .client-production-button:hover{background:#54151f}
    .client-production-dialog{width:min(900px,calc(100vw - 2rem));max-height:calc(100vh - 2rem);padding:0;border:1px solid #b9a7aa;background:#fff;color:#222;box-shadow:0 24px 65px rgba(55,16,24,.28)}
    .client-production-dialog::backdrop{background:rgba(24,12,15,.55)}
    .client-production-dialog__header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:1.1rem 1.25rem;border-bottom:4px solid var(--accent);background:#f8f4f4}
    .client-production-dialog__eyebrow{display:block;margin-bottom:.18rem;color:var(--accent);font-size:.68rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
    .client-production-dialog__title{margin:0;color:#241619;font-size:1.2rem}
    .client-production-dialog__subtitle{margin:.25rem 0 0;color:var(--text-secondary);font-size:.78rem}
    .client-production-dialog__close{width:34px;height:34px;border:1px solid #b9a7aa;background:#fff;color:#4a1c24;font-size:1.35rem;line-height:1;cursor:pointer}
    .client-production-dialog__body{display:grid;gap:1rem;padding:1.2rem 1.25rem 1.35rem;overflow:auto}
    .client-production-form{display:grid;gap:.9rem;padding:1rem;border:1px solid #d7ccce;background:#fff}
    .client-production-form-grid{display:grid;grid-template-columns:minmax(170px,.55fr) repeat(3,minmax(150px,1fr));gap:.75rem;align-items:end}
    .client-production-form label{display:grid;gap:.3rem;color:#4a1c24;font-size:.72rem;font-weight:800}
    .client-production-form input{width:100%;min-height:39px;padding:.5rem .6rem;border:1px solid #b9a7aa;background:#fff;color:#222;font:inherit}
    .client-production-form input:focus{outline:2px solid rgba(122,30,44,.2);border-color:var(--accent)}
    .client-production-form__actions{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap}
    .client-production-feedback{margin:0;color:var(--text-secondary);font-size:.74rem;font-weight:700}
    .client-production-feedback[data-state="error"]{color:#8b2424}
    .client-production-feedback[data-state="saved"]{color:#1f673d}
    .client-production-history-heading{margin:0;color:#4a1c24;font-size:.9rem}
    .client-production-history-wrap{overflow:auto;border:1px solid #d7ccce}
    .client-production-history{width:100%;border-collapse:collapse;font-size:.75rem}
    .client-production-history th,.client-production-history td{padding:.6rem .7rem;border-bottom:1px solid #e1d9da;text-align:left;white-space:nowrap}
    .client-production-history th{background:#f4eeee;color:#4a1c24;font-size:.67rem;letter-spacing:.04em;text-transform:uppercase}
    .client-production-history td.numeric,.client-production-history th.numeric{text-align:right}
    .client-production-empty{margin:0;padding:1rem;color:var(--text-secondary);font-size:.78rem}
    @media(max-width:900px){.client-product-header,.client-product-cell{min-width:108px;width:108px}}
    @media(max-width:760px){.client-production-form-grid{grid-template-columns:1fr}.client-production-dialog__header,.client-production-dialog__body{padding-left:.85rem;padding-right:.85rem}}
  `;
  document.head.appendChild(style);
}

function ensureHeader() {
  const table = document.querySelector('.client-table');
  const headerRow = table?.querySelector('thead tr');
  if (!table || !headerRow) return;

  table.classList.add('client-table--with-products');
  if (headerRow.querySelector('[data-client-product-header]')) return;

  const anchor = headerRow.children[1] || null;
  PRODUCT_PRODUCTION_FIELDS.forEach(({ product, columnLabel }) => {
    const header = document.createElement('th');
    header.className = 'client-product-header';
    header.dataset.clientProductHeader = product;
    header.scope = 'col';
    header.textContent = columnLabel;
    headerRow.insertBefore(header, anchor);
  });
}

function charterFromRow(row) {
  if (row.dataset.clientProductsCharter) return row.dataset.clientProductsCharter;
  const dataCharter = normalizeCharterNumber(row.dataset.clientCharter);
  if (dataCharter) {
    row.dataset.clientProductsCharter = dataCharter;
    return dataCharter;
  }
  const charterLine = [...row.querySelectorAll('.client-identity-line, .client-meta-line')]
    .map((element) => element.textContent || '')
    .find((text) => /\bCharter\b/i.test(text));
  const match = String(charterLine || row.textContent || '').match(/\bCharter\s+([A-Za-z0-9-]+)/i);
  const charterNumber = normalizeCharterNumber(match?.[1]);
  if (charterNumber) row.dataset.clientProductsCharter = charterNumber;
  return charterNumber;
}

function formatProductionValue(field, value) {
  if (!Number.isFinite(Number(value))) return '';
  return field.unit === 'currency'
    ? productionCurrency.format(Number(value))
    : `${Number(value).toLocaleString('en-US')} sold`;
}

function productCellMarkup(charterNumber, clientName, definition) {
  const selectedProducts = new Set(productState.productsByCharter.get(charterNumber) || []);
  const productionEntries = productState.productionByCharter.get(charterNumber) || [];
  const active = selectedProducts.has(definition.product);
  const disabled = !productState.loaded || productState.saving.has(charterNumber) || Boolean(productState.loadError);
  const latest = productionEntries.find((entry) => Object.hasOwn(entry, definition.field));
  const savedValue = latest ? formatProductionValue(definition, latest[definition.field]) : '';
  const message = productState.messages.get(charterNumber);
  let stateLabel = active ? 'Active' : 'Not Active';
  let detail = active ? (latest ? `${latest.month} · ${savedValue}` : 'Open reporting') : 'Click to activate';
  if (!productState.loaded) detail = 'Loading…';
  if (productState.saving.has(charterNumber)) detail = 'Saving…';
  if (productState.loadError) detail = 'Unavailable';
  if (message?.state === 'error') detail = 'Save failed';

  const label = `${definition.columnLabel} for ${clientName || `charter ${charterNumber}`}: ${stateLabel}. ${active ? 'Open production reporting.' : 'Activate product and open production reporting.'}`;
  return `<button type="button" class="client-product-toggle" data-client-product-button data-product="${escapeHtml(definition.product)}" data-charter="${escapeHtml(charterNumber)}" data-active="${active}" aria-pressed="${active}" aria-label="${escapeHtml(label)}"${disabled ? ' disabled' : ''}><span class="client-product-toggle__state">${active ? '✓ Active' : '✕ Not Active'}</span><span class="client-product-toggle__detail">${escapeHtml(detail)}</span></button>`;
}

function renderProductCellsForRow(row) {
  const charterNumber = charterFromRow(row);
  if (!charterNumber) return;
  const clientName = row.querySelector('.client-name')?.textContent?.trim() || '';
  const anchor = row.querySelector('[data-client-training-cell]') || row.children[1] || null;
  PRODUCT_PRODUCTION_FIELDS.forEach((definition) => {
    let cell = [...row.children].find((candidate) => candidate.dataset?.clientProductCell === definition.product);
    if (!cell) {
      cell = document.createElement('td');
      cell.className = 'client-product-cell';
      cell.dataset.clientProductCell = definition.product;
      row.insertBefore(cell, anchor);
    }
    cell.innerHTML = productCellMarkup(charterNumber, clientName, definition);
  });
}

function renderProductCells() {
  ensureHeader();
  document.querySelectorAll('#client-table-body > tr').forEach(renderProductCellsForRow);
}

function rowForCharter(charterNumber) {
  return [...document.querySelectorAll('#client-table-body > tr')]
    .find((row) => charterFromRow(row) === charterNumber) || null;
}

function setTemporaryMessage(charterNumber, text, state, duration = 2600) {
  productState.messages.set(charterNumber, { text, state });
  const row = rowForCharter(charterNumber);
  if (row) renderProductCellsForRow(row);

  if (!duration) return;
  window.setTimeout(() => {
    const current = productState.messages.get(charterNumber);
    if (!current || current.text !== text || current.state !== state) return;
    productState.messages.delete(charterNumber);
    const activeRow = rowForCharter(charterNumber);
    if (activeRow) renderProductCellsForRow(activeRow);
  }, duration);
}

async function loadClientProducts() {
  if (productState.loading) return;
  productState.loading = true;
  productState.loadError = '';
  renderProductCells();

  try {
    const response = await fetch(PRODUCT_ENDPOINT, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);

    const accounts = Array.isArray(body.accounts) ? body.accounts : [];
    productState.productsByCharter = new Map(
      accounts
        .map((account) => [
          normalizeCharterNumber(account?.charterNumber),
          sanitizeProducts(account?.clientProducts)
        ])
        .filter(([charterNumber]) => charterNumber)
    );
    productState.productionByCharter = new Map(
      accounts
        .map((account) => [
          normalizeCharterNumber(account?.charterNumber),
          sanitizeProductionEntries(account?.clientProductProduction)
        ])
        .filter(([charterNumber]) => charterNumber)
    );
    productState.loaded = true;
  } catch (error) {
    productState.loadError = error.message || 'Unable to load client products.';
  } finally {
    productState.loading = false;
    renderProductCells();
  }
}

const productionCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function productionMonthLabel(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) return month || '—';
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
    .format(new Date(year, monthNumber - 1, 1));
}

function ensureProductionDialog() {
  let dialog = document.getElementById('client-production-dialog');
  if (dialog) return dialog;

  dialog = document.createElement('dialog');
  dialog.id = 'client-production-dialog';
  dialog.className = 'client-production-dialog';
  dialog.setAttribute('aria-labelledby', 'client-production-dialog-title');
  dialog.innerHTML = `
    <header class="client-production-dialog__header">
      <div><span class="client-production-dialog__eyebrow">Client Production</span><h2 id="client-production-dialog-title" class="client-production-dialog__title">Monthly Production</h2><p id="client-production-dialog-subtitle" class="client-production-dialog__subtitle"></p></div>
      <button type="button" class="client-production-dialog__close" data-close-client-production aria-label="Close production entry">×</button>
    </header>
    <div class="client-production-dialog__body">
      <form id="client-production-form" class="client-production-form">
        <div id="client-production-form-grid" class="client-production-form-grid"></div>
        <div class="client-production-form__actions"><button id="client-production-submit" type="submit" class="client-production-button">Save Monthly Production</button><p id="client-production-feedback" class="client-production-feedback" role="status" aria-live="polite"></p></div>
      </form>
      <h3 class="client-production-history-heading">Production History</h3>
      <div id="client-production-history"></div>
    </div>`;
  document.body.appendChild(dialog);

  dialog.addEventListener('click', (event) => {
    if (event.target.closest('[data-close-client-production]')) dialog.close();
  });
  dialog.addEventListener('change', (event) => {
    if (event.target.id === 'client-production-month') populateProductionInputs();
  });
  dialog.addEventListener('submit', (event) => {
    if (event.target.id !== 'client-production-form') return;
    event.preventDefault();
    saveClientProduction();
  });
  dialog.addEventListener('close', () => {
    productState.activeProductionCharter = '';
    productState.activeProductionName = '';
    productState.activeProductionProduct = '';
  });
  return dialog;
}

function productionEntryForMonth(charterNumber, month) {
  return (productState.productionByCharter.get(charterNumber) || [])
    .find((entry) => entry.month === month) || null;
}

function populateProductionInputs() {
  const monthInput = document.getElementById('client-production-month');
  if (!monthInput) return;
  const entry = productionEntryForMonth(productState.activeProductionCharter, monthInput.value);
  document.querySelectorAll('#client-production-form [data-production-field]').forEach((input) => {
    const value = entry?.[input.dataset.productionField];
    input.value = value === null || value === undefined ? '' : String(value);
  });
  const feedback = document.getElementById('client-production-feedback');
  if (feedback) {
    feedback.textContent = entry ? 'Editing the saved values for this month.' : 'Enter any production numbers currently available.';
    feedback.dataset.state = '';
  }
}

function productionHistoryMarkup(entries, fields) {
  const relevantEntries = entries.filter((entry) => fields.some(({ field }) => Object.hasOwn(entry, field)));
  if (!relevantEntries.length) return '<p class="client-production-empty">No monthly production has been saved for this product.</p>';
  const headerCells = fields.map(({ historyLabel }) => `<th class="numeric">${escapeHtml(historyLabel)}</th>`).join('');
  const rows = relevantEntries.map((entry) => {
    const valueCells = fields.map((definition) => `<td class="numeric">${Object.hasOwn(entry, definition.field) ? escapeHtml(formatProductionValue(definition, entry[definition.field])) : '—'}</td>`).join('');
    return `<tr><td>${escapeHtml(productionMonthLabel(entry.month))}</td>${valueCells}</tr>`;
  }).join('');
  return `<div class="client-production-history-wrap"><table class="client-production-history"><thead><tr><th>Month</th>${headerCells}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderProductionDialog(month = currentProductionMonth()) {
  const charterNumber = productState.activeProductionCharter;
  if (!charterNumber) return;
  const selectedProducts = new Set(productState.productsByCharter.get(charterNumber) || []);
  const fields = PRODUCT_PRODUCTION_FIELDS.filter(({ product }) => product === productState.activeProductionProduct && selectedProducts.has(product));
  if (!fields.length) return;
  const dialog = ensureProductionDialog();
  dialog.querySelector('#client-production-dialog-title').textContent = `${fields[0].columnLabel} Monthly Production`;
  dialog.querySelector('#client-production-dialog-subtitle').textContent = `${productState.activeProductionName || 'Client'} · Charter ${charterNumber}`;

  const fieldMarkup = fields.map(({ field, label, unit, step }) => {
    const prefix = unit === 'currency' ? '$' : '#';
    return `<label>${escapeHtml(label)}<input type="number" inputmode="decimal" min="0" step="${escapeHtml(step)}" data-production-field="${escapeHtml(field)}" placeholder="${prefix}" /></label>`;
  }).join('');
  dialog.querySelector('#client-production-form-grid').innerHTML = `<label>Production month<input id="client-production-month" type="month" value="${escapeHtml(month)}" required /></label>${fieldMarkup}`;
  dialog.querySelector('#client-production-history').innerHTML = productionHistoryMarkup(productState.productionByCharter.get(charterNumber) || [], fields);
  populateProductionInputs();
}

function openProductionDialog(charterNumber, clientName = '', product = '') {
  const selectedProducts = productState.productsByCharter.get(charterNumber) || [];
  if (!TRACKED_PRODUCTS.has(product) || !selectedProducts.includes(product)) return;
  productState.activeProductionCharter = charterNumber;
  productState.activeProductionName = clientName;
  productState.activeProductionProduct = product;
  const dialog = ensureProductionDialog();
  renderProductionDialog();
  if (!dialog.open) dialog.showModal();
}

async function saveClientProduction() {
  const charterNumber = productState.activeProductionCharter;
  const monthInput = document.getElementById('client-production-month');
  const feedback = document.getElementById('client-production-feedback');
  const submitButton = document.getElementById('client-production-submit');
  if (!charterNumber || !monthInput || !feedback || !submitButton) return;

  const payload = {};
  document.querySelectorAll('#client-production-form [data-production-field]').forEach((input) => {
    if (input.value.trim() !== '') payload[input.dataset.productionField] = Number(input.value);
  });
  if (!Object.keys(payload).length) {
    feedback.textContent = 'Enter at least one production number before saving.';
    feedback.dataset.state = 'error';
    return;
  }

  submitButton.disabled = true;
  feedback.textContent = 'Saving production to MongoDB…';
  feedback.dataset.state = '';
  try {
    const response = await fetch(`${PRODUCT_ENDPOINT}/${encodeURIComponent(charterNumber)}/production/${encodeURIComponent(monthInput.value)}`, {
      method: 'PUT',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);

    productState.productionByCharter.set(charterNumber, sanitizeProductionEntries(body.clientProductProduction));
    const savedMonth = monthInput.value;
    const row = rowForCharter(charterNumber);
    if (row) renderProductCellsForRow(row);
    renderProductionDialog(savedMonth);
    const refreshedFeedback = document.getElementById('client-production-feedback');
    refreshedFeedback.textContent = `${productionMonthLabel(savedMonth)} production saved to MongoDB.`;
    refreshedFeedback.dataset.state = 'saved';
  } catch (error) {
    feedback.textContent = error.message || 'Unable to save monthly production.';
    feedback.dataset.state = 'error';
  } finally {
    const activeSubmit = document.getElementById('client-production-submit');
    if (activeSubmit) activeSubmit.disabled = false;
  }
}

async function activateClientProduct(row, charterNumber, productToOpen) {
  if (!productState.loaded || productState.saving.has(charterNumber)) return;

  const previousProducts = [...(productState.productsByCharter.get(charterNumber) || [])];
  if (previousProducts.includes(productToOpen)) {
    const clientName = row.querySelector('.client-name')?.textContent?.trim() || '';
    openProductionDialog(charterNumber, clientName, productToOpen);
    return;
  }
  const nextProducts = sanitizeProducts([...previousProducts, productToOpen]);
  productState.productsByCharter.set(charterNumber, nextProducts);
  productState.messages.delete(charterNumber);
  productState.saving.add(charterNumber);
  renderProductCellsForRow(row);

  try {
    const response = await fetch(`${PRODUCT_ENDPOINT}/${encodeURIComponent(charterNumber)}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ clientProducts: nextProducts })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);

    productState.productsByCharter.set(charterNumber, sanitizeProducts(body.clientProducts));
    productState.saving.delete(charterNumber);
    setTemporaryMessage(charterNumber, 'Saved to MongoDB.', 'saved');
    if (TRACKED_PRODUCTS.has(productToOpen) && productState.productsByCharter.get(charterNumber)?.includes(productToOpen)) {
      const clientName = row.querySelector('.client-name')?.textContent?.trim() || '';
      openProductionDialog(charterNumber, clientName, productToOpen);
    }
  } catch (error) {
    productState.productsByCharter.set(charterNumber, previousProducts);
    productState.saving.delete(charterNumber);
    setTemporaryMessage(charterNumber, error.message || 'Unable to save client products.', 'error', 5200);
  }
}

function installTableObserver() {
  const tableBody = document.getElementById('client-table-body');
  if (!tableBody) return;

  tableBody.addEventListener('click', (event) => {
    const button = event.target.closest('[data-client-product-button]');
    if (!button) return;
    const row = button.closest('tr');
    if (!row) return;
    const charterNumber = normalizeCharterNumber(button.dataset.charter || charterFromRow(row));
    if (!charterNumber) return;
    activateClientProduct(row, charterNumber, button.dataset.product || '');
  });

  const observer = new MutationObserver(() => renderProductCells());
  observer.observe(tableBody, { childList: true });
}

installStyles();
ensureProductionDialog();
ensureHeader();
installTableObserver();
renderProductCells();
loadClientProducts();
