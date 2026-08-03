const PRODUCT_OPTIONS = Object.freeze(['MOB Coverage', 'GAP', 'VSC', 'CPI']);
const PRODUCT_ENDPOINT = '/api/ncua-client-products';

const productState = {
  productsByCharter: new Map(),
  loaded: false,
  loading: false,
  loadError: '',
  saving: new Set(),
  messages: new Map()
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

function installStyles() {
  if (document.getElementById('client-products-styles')) return;
  const style = document.createElement('style');
  style.id = 'client-products-styles';
  style.textContent = `
    .client-table.client-table--with-products{min-width:1540px}
    .client-products-header{min-width:330px}
    .client-products-cell{min-width:330px}
    .client-product-grid{display:grid;grid-template-columns:repeat(2,minmax(138px,1fr));gap:.42rem .55rem}
    .client-product-option{display:flex;align-items:center;gap:.45rem;min-height:34px;padding:.36rem .48rem;border:1px solid #c9c9c9;background:#fff;color:#222;font-size:.77rem;font-weight:750;cursor:pointer;user-select:none}
    .client-product-option:hover{border-color:var(--accent);background:rgba(122,30,44,.035)}
    .client-product-option:has(input:checked){border-color:var(--accent);background:rgba(122,30,44,.09);color:#4a1c24}
    .client-product-option input{width:18px;height:18px;flex:0 0 auto;margin:0;accent-color:var(--accent);cursor:pointer}
    .client-product-option input:disabled{cursor:wait}
    .client-product-status{display:block;min-height:1.1em;margin-top:.4rem;color:var(--text-secondary);font-size:.71rem;font-weight:700}
    .client-product-status[data-state="saving"]{color:#765314}
    .client-product-status[data-state="saved"]{color:#1f673d}
    .client-product-status[data-state="error"]{color:#8b2424}
    @media(max-width:900px){.client-products-header,.client-products-cell{min-width:300px}.client-product-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
}

function ensureHeader() {
  const table = document.querySelector('.client-table');
  const headerRow = table?.querySelector('thead tr');
  if (!table || !headerRow) return;

  table.classList.add('client-table--with-products');
  if (headerRow.querySelector('[data-client-products-header]')) return;

  const header = document.createElement('th');
  header.className = 'client-products-header';
  header.dataset.clientProductsHeader = 'true';
  header.scope = 'col';
  header.textContent = 'Client Products';
  headerRow.appendChild(header);
}

function charterFromRow(row) {
  if (row.dataset.clientProductsCharter) return row.dataset.clientProductsCharter;
  const charterLine = [...row.querySelectorAll('.client-meta-line')]
    .map((element) => element.textContent || '')
    .find((text) => /\bCharter\b/i.test(text));
  const match = String(charterLine || row.textContent || '').match(/\bCharter\s+([A-Za-z0-9-]+)/i);
  const charterNumber = normalizeCharterNumber(match?.[1]);
  if (charterNumber) row.dataset.clientProductsCharter = charterNumber;
  return charterNumber;
}

function statusFor(charterNumber) {
  if (productState.saving.has(charterNumber)) {
    return { text: 'Saving to MongoDB…', state: 'saving' };
  }
  if (productState.messages.has(charterNumber)) {
    return productState.messages.get(charterNumber);
  }
  if (productState.loadError) {
    return { text: productState.loadError, state: 'error' };
  }
  if (!productState.loaded) {
    return { text: 'Loading saved product relationships…', state: 'saving' };
  }
  return { text: 'Selections save automatically.', state: '' };
}

function productCellMarkup(charterNumber, clientName) {
  const selectedProducts = new Set(productState.productsByCharter.get(charterNumber) || []);
  const disabled = !productState.loaded || productState.saving.has(charterNumber) || Boolean(productState.loadError);
  const status = statusFor(charterNumber);
  const options = PRODUCT_OPTIONS.map((product) => {
    const checked = selectedProducts.has(product) ? ' checked' : '';
    const disabledAttribute = disabled ? ' disabled' : '';
    return `<label class="client-product-option"><input type="checkbox" data-client-product="${escapeHtml(product)}" data-charter="${escapeHtml(charterNumber)}"${checked}${disabledAttribute}><span>${escapeHtml(product)}</span></label>`;
  }).join('');

  return `<div class="client-product-grid" role="group" aria-label="Client products for ${escapeHtml(clientName || `charter ${charterNumber}`)}">${options}</div><span class="client-product-status" data-client-product-status data-state="${escapeHtml(status.state)}">${escapeHtml(status.text)}</span>`;
}

function renderProductCell(row) {
  const charterNumber = charterFromRow(row);
  if (!charterNumber) return;

  let cell = row.querySelector(':scope > [data-client-products-cell]');
  if (!cell) {
    cell = document.createElement('td');
    cell.className = 'client-products-cell';
    cell.dataset.clientProductsCell = 'true';
    row.appendChild(cell);
  }

  const clientName = row.querySelector('.client-name')?.textContent?.trim() || '';
  cell.innerHTML = productCellMarkup(charterNumber, clientName);
}

function renderProductCells() {
  ensureHeader();
  document.querySelectorAll('#client-table-body > tr').forEach(renderProductCell);
}

function rowForCharter(charterNumber) {
  return [...document.querySelectorAll('#client-table-body > tr')]
    .find((row) => charterFromRow(row) === charterNumber) || null;
}

function setTemporaryMessage(charterNumber, text, state, duration = 2600) {
  productState.messages.set(charterNumber, { text, state });
  const row = rowForCharter(charterNumber);
  if (row) renderProductCell(row);

  if (!duration) return;
  window.setTimeout(() => {
    const current = productState.messages.get(charterNumber);
    if (!current || current.text !== text || current.state !== state) return;
    productState.messages.delete(charterNumber);
    const activeRow = rowForCharter(charterNumber);
    if (activeRow) renderProductCell(activeRow);
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

    productState.productsByCharter = new Map(
      (Array.isArray(body.accounts) ? body.accounts : [])
        .map((account) => [
          normalizeCharterNumber(account?.charterNumber),
          sanitizeProducts(account?.clientProducts)
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

function checkedProductsForRow(row) {
  const checked = new Set(
    [...row.querySelectorAll('[data-client-product]:checked')]
      .map((input) => input.dataset.clientProduct)
  );
  return PRODUCT_OPTIONS.filter((product) => checked.has(product));
}

async function saveClientProducts(row, charterNumber) {
  if (!productState.loaded || productState.saving.has(charterNumber)) return;

  const previousProducts = [...(productState.productsByCharter.get(charterNumber) || [])];
  const nextProducts = checkedProductsForRow(row);
  productState.productsByCharter.set(charterNumber, nextProducts);
  productState.messages.delete(charterNumber);
  productState.saving.add(charterNumber);
  renderProductCell(row);

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
  } catch (error) {
    productState.productsByCharter.set(charterNumber, previousProducts);
    productState.saving.delete(charterNumber);
    setTemporaryMessage(charterNumber, error.message || 'Unable to save client products.', 'error', 5200);
  }
}

function installTableObserver() {
  const tableBody = document.getElementById('client-table-body');
  if (!tableBody) return;

  tableBody.addEventListener('change', (event) => {
    const input = event.target.closest('[data-client-product]');
    if (!input) return;
    const row = input.closest('tr');
    if (!row) return;
    const charterNumber = normalizeCharterNumber(input.dataset.charter || charterFromRow(row));
    if (!charterNumber) return;
    saveClientProducts(row, charterNumber);
  });

  const observer = new MutationObserver(() => renderProductCells());
  observer.observe(tableBody, { childList: true });
}

installStyles();
ensureHeader();
installTableObserver();
renderProductCells();
loadClientProducts();
