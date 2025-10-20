const STORAGE_KEY = 'gfs-account-setup';

const defaultProductGroups = [
  {
    id: 'credit-life',
    title: 'Credit Life Coverage',
    description: 'Life coverage for loan balances with single, joint, and merged (blended) rates.',
    products: [
      'Credit Life (Single)',
      'Credit Life (Joint)',
      'Credit Life (Merged)'
    ]
  },
  {
    id: 'credit-disability',
    title: 'Credit Disability Coverage',
    description: 'Disability protection options for loan payments using single, joint, or blended rates.',
    products: [
      'Credit Disability (Single)',
      'Credit Disability (Joint)',
      'Credit Disability (Merged)'
    ]
  },
  {
    id: 'debt-protection',
    title: 'Debt Protection Packages',
    description: 'Package-based debt protection programs tied to blended monthly outstanding balance rates.',
    products: [
      'Debt Protection [Package A]',
      'Debt Protection [Package B]',
      'Debt Protection [Package C]'
    ]
  },
  {
    id: 'ancillary',
    title: 'Ancillary Protection',
    description: 'Additional risk-mitigation offerings to round out the protection suite.',
    products: [
      'GAP',
      'VSC',
      'Collateral Protection Insurance (CPI)',
      'Fidelity Bond'
    ]
  }
];

const selectors = {
  form: document.getElementById('account-setup-form'),
  creditUnionInput: document.getElementById('credit-union-name'),
  productGroups: document.getElementById('product-groups'),
  selectedCount: document.getElementById('selected-count'),
  summaryCreditUnion: document.getElementById('summary-credit-union'),
  summaryProducts: document.getElementById('summary-products'),
  addProductInput: document.getElementById('new-product-name'),
  addProductBtn: document.getElementById('add-product-btn'),
  resetBtn: document.getElementById('reset-btn'),
  customProductsContainer: document.getElementById('custom-product-list'),
  customProductsList: document.querySelector('#custom-product-list .custom-products__items'),
  footerYear: document.getElementById('footer-year')
};

const state = {
  selectedProducts: new Set(),
  customProducts: [],
  creditUnionName: ''
};

function slugify(label) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (parsed.creditUnionName) {
      state.creditUnionName = parsed.creditUnionName;
      selectors.creditUnionInput.value = parsed.creditUnionName;
    }
    if (Array.isArray(parsed.selectedProducts)) {
      parsed.selectedProducts.forEach((product) => state.selectedProducts.add(product));
    }
    if (Array.isArray(parsed.customProducts)) {
      state.customProducts = parsed.customProducts.filter(Boolean);
    }
  } catch (error) {
    console.error('Unable to load stored setup', error);
  }
}

function saveToStorage() {
  const payload = {
    creditUnionName: state.creditUnionName,
    selectedProducts: Array.from(state.selectedProducts),
    customProducts: state.customProducts
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function getAllGroups() {
  const groups = defaultProductGroups.map((group) => ({ ...group }));
  if (state.customProducts.length) {
    groups.push({
      id: 'custom-products',
      title: 'Custom Products & Services',
      description: 'Offerings unique to this credit union partnership.',
      products: [...state.customProducts]
    });
  }
  return groups;
}

function renderProducts() {
  selectors.productGroups.innerHTML = '';

  const groups = getAllGroups();

  groups.forEach((group) => {
    const groupEl = document.createElement('section');
    groupEl.className = 'product-group';

    const header = document.createElement('div');
    header.className = 'product-group__header';
    const title = document.createElement('h3');
    title.className = 'product-group__title';
    title.textContent = group.title;

    header.appendChild(title);
    groupEl.appendChild(header);

    if (group.description) {
      const desc = document.createElement('p');
      desc.className = 'field-helper';
      desc.textContent = group.description;
      desc.style.marginBottom = '0.75rem';
      groupEl.appendChild(desc);
    }

    const options = document.createElement('div');
    options.className = 'product-options';

    group.products.forEach((productLabel) => {
      const option = document.createElement('label');
      option.className = 'product-option';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'products';
      input.value = productLabel;
      input.id = `product-${slugify(productLabel)}`;
      input.checked = state.selectedProducts.has(productLabel);
      input.addEventListener('change', () => handleProductToggle(productLabel, input.checked));

      const text = document.createElement('span');
      text.className = 'product-option__label';
      text.textContent = productLabel;

      option.appendChild(input);
      option.appendChild(text);
      options.appendChild(option);
    });

    groupEl.appendChild(options);

    selectors.productGroups.appendChild(groupEl);
  });

  renderCustomProductList();
  updateSelectedCount();
  updateSummaryProducts();
}

function renderCustomProductList() {
  const container = selectors.customProductsContainer;
  const list = selectors.customProductsList;
  if (!container || !list) return;

  list.innerHTML = '';

  if (!state.customProducts.length) {
    container.hidden = true;
    return;
  }

  container.hidden = false;

  state.customProducts.forEach((product) => {
    const item = document.createElement('li');
    item.className = 'custom-products__item';

    const label = document.createElement('span');
    label.className = 'custom-products__label';
    label.textContent = product;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'custom-products__remove';
    button.textContent = 'Remove';
    button.addEventListener('click', () => removeCustomProduct(product));

    item.appendChild(label);
    item.appendChild(button);
    list.appendChild(item);
  });
}

function removeCustomProduct(product) {
  const index = state.customProducts.indexOf(product);
  if (index === -1) return;
  state.customProducts.splice(index, 1);
  state.selectedProducts.delete(product);
  saveToStorage();
  renderProducts();
}

function handleProductToggle(product, isSelected) {
  if (isSelected) {
    state.selectedProducts.add(product);
  } else {
    state.selectedProducts.delete(product);
  }
  updateSelectedCount();
  updateSummaryProducts();
  saveToStorage();
}

function updateSelectedCount() {
  const count = state.selectedProducts.size;
  selectors.selectedCount.textContent = count === 1 ? '1 selected' : `${count} selected`;
}

function updateSummaryProducts() {
  const productsList = selectors.summaryProducts;
  productsList.innerHTML = '';

  if (!state.selectedProducts.size) {
    const empty = document.createElement('li');
    empty.className = 'summary-products__empty';
    empty.textContent = 'No products selected yet.';
    productsList.appendChild(empty);
    return;
  }

  Array.from(state.selectedProducts)
    .sort((a, b) => a.localeCompare(b))
    .forEach((product) => {
      const item = document.createElement('li');
      item.className = 'summary-products__item';
      item.textContent = product;
      productsList.appendChild(item);
    });
}

function handleAddProduct() {
  const value = selectors.addProductInput.value.trim();
  if (!value) {
    selectors.addProductInput.focus();
    return;
  }

  const exists = defaultProductGroups.some((group) => group.products.includes(value)) || state.customProducts.includes(value);
  if (exists) {
    selectors.addProductInput.classList.add('is-invalid');
    selectors.addProductInput.setAttribute('aria-invalid', 'true');
    selectors.addProductInput.setAttribute('aria-describedby', 'add-product-feedback');
    showInlineFeedback('add-product-feedback', 'That product is already in the list.');
    return;
  }

  removeInlineFeedback('add-product-feedback');
  selectors.addProductInput.classList.remove('is-invalid');
  selectors.addProductInput.removeAttribute('aria-invalid');
  selectors.addProductInput.removeAttribute('aria-describedby');

  state.customProducts.push(value);
  state.selectedProducts.add(value);
  selectors.addProductInput.value = '';
  renderProducts();
  updateSelectedCount();
  updateSummaryProducts();
  saveToStorage();
}

function showInlineFeedback(id, message) {
  let element = document.getElementById(id);
  if (!element) {
    element = document.createElement('p');
    element.id = id;
    element.className = 'field-helper';
    selectors.addProductInput.insertAdjacentElement('afterend', element);
  }
  element.style.color = '#f8b4b4';
  element.textContent = message;
}

function removeInlineFeedback(id) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

function handleReset() {
  if (!confirm('Clear the current setup? This will remove any custom products and selections.')) {
    return;
  }
  state.creditUnionName = '';
  state.selectedProducts.clear();
  state.customProducts = [];
  selectors.creditUnionInput.value = '';
  selectors.addProductInput.value = '';
  localStorage.removeItem(STORAGE_KEY);
  renderProducts();
  updateSelectedCount();
  selectors.summaryCreditUnion.textContent = '—';
}

function handleFormSubmit(event) {
  event.preventDefault();
  state.creditUnionName = selectors.creditUnionInput.value.trim();
  selectors.summaryCreditUnion.textContent = state.creditUnionName || '—';
  updateSummaryProducts();
  saveToStorage();
  selectors.form.classList.add('is-success');
  selectors.form.dataset.toast = 'Configuration saved locally';
  setTimeout(() => {
    selectors.form.classList.remove('is-success');
    delete selectors.form.dataset.toast;
  }, 2200);
}

function syncYear() {
  selectors.footerYear.textContent = new Date().getFullYear();
}

function hydrateFromState() {
  selectors.summaryCreditUnion.textContent = state.creditUnionName || '—';
  updateSummaryProducts();
}

function bindEvents() {
  selectors.addProductBtn.addEventListener('click', handleAddProduct);
  selectors.addProductInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddProduct();
    }
  });
  selectors.form.addEventListener('submit', handleFormSubmit);
  selectors.resetBtn.addEventListener('click', handleReset);
  selectors.creditUnionInput.addEventListener('input', (event) => {
    state.creditUnionName = event.target.value;
    selectors.summaryCreditUnion.textContent = state.creditUnionName || '—';
    saveToStorage();
  });
}

function init() {
  syncYear();
  loadFromStorage();
  renderProducts();
  hydrateFromState();
  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
